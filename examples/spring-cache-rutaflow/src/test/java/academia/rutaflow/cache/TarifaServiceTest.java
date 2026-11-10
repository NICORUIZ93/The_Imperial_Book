package academia.rutaflow.cache;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import com.github.benmanes.caffeine.cache.Cache;

@SpringBootTest
class TarifaServiceTest {
    @Autowired TarifaService tarifas;
    @Autowired TarifaRepository repository;
    @Autowired CacheManager cacheManager;
    @Autowired MeterRegistry metricas;

    @BeforeEach
    void limpiarCacheYCatalogo() {
        cacheManager.getCache("tarifas").clear();
        repository.restaurarDatosDePrueba();
    }

    @Test
    void segundaConsultaReutilizaLaTarifaCacheada() {
        Tarifa primera = tarifas.buscar("NORTE");
        Tarifa segunda = tarifas.buscar("NORTE");

        assertThat(primera.centavos()).isEqualTo(1200);
        assertThat(segunda).isEqualTo(primera);
        assertThat(repository.lecturas()).isEqualTo(1);
    }

    @Test
    void proveedorTieneLimiteDeEntradasYExpiracionConfigurados() {
        Cache<?, ?> nativa = (Cache<?, ?>) cacheManager.getCache("tarifas").getNativeCache();

        assertThat(nativa.policy().eviction().orElseThrow().getMaximum()).isEqualTo(1000);
        assertThat(nativa.policy().expireAfterWrite().orElseThrow()
                .getExpiresAfter(java.util.concurrent.TimeUnit.MINUTES)).isEqualTo(5);
    }

    @Test
    void cadaZonaTieneSuPropiaEntrada() {
        assertThat(tarifas.buscar("NORTE").centavos()).isEqualTo(1200);
        assertThat(tarifas.buscar("SUR").centavos()).isEqualTo(900);
        assertThat(tarifas.buscar("NORTE").centavos()).isEqualTo(1200);

        assertThat(repository.lecturas()).isEqualTo(2);
    }

    @Test
    void actualizarInvalidaLaClaveDeEsaZona() {
        assertThat(tarifas.buscar("NORTE").centavos()).isEqualTo(1200);

        tarifas.actualizar(new Tarifa("NORTE", 1350));

        assertThat(tarifas.buscar("NORTE").centavos()).isEqualTo(1350);
        assertThat(repository.lecturas()).isEqualTo(2);
    }

    @Test
    void cachePutActualizaLaCopiaSinOtraLecturaDelRepositorio() {
        tarifas.buscar("NORTE");
        tarifas.actualizarYCachear(new Tarifa("NORTE", 1350));

        assertThat(tarifas.buscar("NORTE").centavos()).isEqualTo(1350);
        assertThat(repository.lecturas()).isEqualTo(1);
    }

    @Test
    void metricasDistinguenAciertoYFalloDeCache() {
        var aciertos = metricas.get("cache.gets").tags("cache", "tarifas", "result", "hit")
                .functionCounter();
        var fallos = metricas.get("cache.gets").tags("cache", "tarifas", "result", "miss")
                .functionCounter();
        double antesHit = aciertos.count();
        double antesMiss = fallos.count();

        tarifas.buscar("NORTE");
        tarifas.buscar("NORTE");

        assertThat(aciertos.count() - antesHit).isEqualTo(1);
        assertThat(fallos.count() - antesMiss).isEqualTo(1);
    }
}
