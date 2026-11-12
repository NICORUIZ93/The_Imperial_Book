package academia.rutaflow.batch;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.infrastructure.item.ItemWriter;
import org.springframework.batch.infrastructure.item.file.FlatFileItemReader;
import org.springframework.batch.infrastructure.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootTest(properties = "spring.batch.job.enabled=false")
@Import(RestartJobTest.RestartConfiguration.class)
class RestartJobTest {
    @Autowired JobLauncher launcher;
    @Autowired @Qualifier("restartDemoJob") Job job;
    @Autowired JdbcTemplate jdbc;
    @Autowired FailSecondChunkWriter writer;

    @BeforeEach
    void resetFixture() {
        jdbc.update("delete from restart_demo");
        writer.reset();
    }

    @Test
    void mismaInstanciaReanudaTrasElPrimerChunkConfirmadoSinDuplicarlo() throws Exception {
        long run = System.nanoTime();
        var params = new JobParametersBuilder()
            .addString("inputFile", "restart-pedidos.csv")
            .addLong("run", run)
            .toJobParameters();

        var first = launcher.run(job, params);
        assertThat(first.getStatus()).isEqualTo(BatchStatus.FAILED);
        assertThat(jdbc.queryForList("select referencia from restart_demo order by referencia", String.class))
            .containsExactly("RF-R1", "RF-R2");

        var resumed = launcher.run(job, params);
        assertThat(resumed.getStatus()).isEqualTo(BatchStatus.COMPLETED);
        assertThat(resumed.getJobParameters().getLong("run")).isEqualTo(first.getJobParameters().getLong("run"));
        assertThat(jdbc.queryForList("select referencia from restart_demo order by referencia", String.class))
            .containsExactly("RF-R1", "RF-R2", "RF-R3", "RF-R4");
    }

    @Test
    void parametroIdentificadorNuevoCreaOtraInstanciaDesdeElPrincipio() throws Exception {
        long run = System.nanoTime();
        var original = new JobParametersBuilder()
            .addString("inputFile", "restart-pedidos.csv").addLong("run", run).toJobParameters();
        var nuevo = new JobParametersBuilder()
            .addString("inputFile", "restart-pedidos.csv").addLong("run", run + 1).toJobParameters();

        var failed = launcher.run(job, original);
        var fresh = launcher.run(job, nuevo);
        assertThat(failed.getStatus()).isEqualTo(BatchStatus.FAILED);
        assertThat(fresh.getStatus()).isEqualTo(BatchStatus.COMPLETED);
        assertThat(fresh.getJobParameters().getLong("run")).isNotEqualTo(failed.getJobParameters().getLong("run"));
        assertThat(jdbc.queryForList("select referencia from restart_demo order by referencia", String.class))
            .containsExactly("RF-R1", "RF-R2", "RF-R3", "RF-R4");
    }

    @TestConfiguration
    static class RestartConfiguration {
        @Bean
        FailSecondChunkWriter failSecondChunkWriter(JdbcTemplate jdbc) {
            return new FailSecondChunkWriter(jdbc);
        }

        @Bean
        @StepScope
        FlatFileItemReader<String> restartReader() {
            return new FlatFileItemReaderBuilder<String>()
                .name("restartReader")
                .resource(new ClassPathResource("restart-pedidos.csv"))
                .lineMapper((line, number) -> line)
                .saveState(true)
                .build();
        }

        @Bean
        Step restartDemoStep(JobRepository repository, FlatFileItemReader<String> restartReader,
                             FailSecondChunkWriter writer) {
            return new StepBuilder("restartDemoStep", repository)
                .<String, String>chunk(2)
                .reader(restartReader)
                .writer(writer)
                .build();
        }

        @Bean
        Job restartDemoJob(JobRepository repository, Step restartDemoStep) {
            return new JobBuilder("restartDemoJob", repository).start(restartDemoStep).build();
        }
    }

    static class FailSecondChunkWriter implements ItemWriter<String> {
        private final JdbcTemplate jdbc;
        private final AtomicInteger calls = new AtomicInteger();

        FailSecondChunkWriter(JdbcTemplate jdbc) { this.jdbc = jdbc; }

        @Override
        public void write(org.springframework.batch.infrastructure.item.Chunk<? extends String> chunk) {
            if (calls.incrementAndGet() == 2) throw new IllegalStateException("fallo preparado en chunk 2");
            chunk.forEach(referencia -> jdbc.update(
                "merge into restart_demo key(referencia) values (?)", referencia));
        }

        void reset() { calls.set(0); }
    }
}
