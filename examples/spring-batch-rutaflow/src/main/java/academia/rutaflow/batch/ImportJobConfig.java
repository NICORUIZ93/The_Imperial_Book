package academia.rutaflow.batch;

import javax.sql.DataSource;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.infrastructure.repeat.RepeatStatus;
import org.springframework.batch.infrastructure.item.ItemProcessor;
import org.springframework.batch.infrastructure.item.database.JdbcBatchItemWriter;
import org.springframework.batch.infrastructure.item.database.builder.JdbcBatchItemWriterBuilder;
import org.springframework.batch.infrastructure.item.file.FlatFileItemReader;
import org.springframework.batch.infrastructure.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class ImportJobConfig {
    @Bean
    FlatFileItemReader<PedidoImportado> pedidosReader() {
        return new FlatFileItemReaderBuilder<PedidoImportado>()
            .name("pedidosReader")
            .resource(new org.springframework.core.io.ClassPathResource("pedidos.csv"))
            .linesToSkip(1)
            .delimited().names("referencia", "importe")
            .fieldSetMapper(fields -> new PedidoImportado(
                fields.readString("referencia"), fields.readBigDecimal("importe")))
            .build();
    }

    @Bean
    ItemProcessor<PedidoImportado, PedidoImportado> positiveAmountsOnly() {
        return pedido -> pedido.importe().signum() > 0 ? pedido : null;
    }

    @Bean
    JdbcBatchItemWriter<PedidoImportado> pedidosWriter(DataSource dataSource) {
        return new JdbcBatchItemWriterBuilder<PedidoImportado>()
            .itemSqlParameterSourceProvider(BeanPropertySqlParameterSource::new)
            .sql("insert into pedido_importado(referencia, importe) values (:referencia, :importe)")
            .dataSource(dataSource)
            .build();
    }

    @Bean
    Step importPedidosStep(org.springframework.batch.core.repository.JobRepository jobRepository,
                           FlatFileItemReader<PedidoImportado> pedidosReader,
                           ItemProcessor<PedidoImportado, PedidoImportado> positiveAmountsOnly,
                           JdbcBatchItemWriter<PedidoImportado> pedidosWriter) {
        return new StepBuilder("importPedidos", jobRepository)
            .<PedidoImportado, PedidoImportado>chunk(2)
            .reader(pedidosReader)
            .processor(positiveAmountsOnly)
            .writer(pedidosWriter)
            .build();
    }

    @Bean
    Step resumenStep(org.springframework.batch.core.repository.JobRepository jobRepository,
                     JdbcTemplate jdbc) {
        Tasklet resumen = (contribution, chunkContext) -> {
            Integer cantidad = jdbc.queryForObject("select count(*) from pedido_importado", Integer.class);
            jdbc.update("insert into batch_resumen(total) values (?)", cantidad);
            System.out.println("Pedidos importados: " + cantidad);
            return RepeatStatus.FINISHED;
        };
        return new StepBuilder("resumen", jobRepository).tasklet(resumen).build();
    }

    @Bean
    Job importPedidosJob(org.springframework.batch.core.repository.JobRepository jobRepository,
                         Step importPedidosStep,
                         Step resumenStep) {
        return new JobBuilder("importPedidos", jobRepository)
            .start(importPedidosStep)
            .next(resumenStep)
            .build();
    }
}
