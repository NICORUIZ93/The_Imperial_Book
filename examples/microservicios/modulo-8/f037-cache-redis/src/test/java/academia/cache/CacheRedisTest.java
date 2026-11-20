package academia.cache;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.StringRedisTemplate;

/** Necesita el Redis del docker-compose.yml en localhost:6379 (docker compose up -d --wait). */
@SpringBootTest
class CacheRedisTest {

    @Autowired ProductoServicio servicio;
    @Autowired RepositorioLento repositorio;
    @Autowired CacheManager cacheManager;
    @Autowired StringRedisTemplate redis;

    @BeforeEach
    void limpiar() {
        cacheManager.getCache("productos").clear();
        cacheManager.getCache("ofertas").clear();
        repositorio.reiniciarContador();
    }

    @Test
    void laSegundaLecturaSaleDeRedisYLaClaveTieneTtl() {
        servicio.buscar(1);
        servicio.buscar(1);

        assertThat(repositorio.consultas()).isEqualTo(1);
        assertThat(redis.hasKey("productos::1")).isTrue();
        assertThat(redis.getExpire("productos::1", TimeUnit.SECONDS)).isBetween(1L, 60L);
    }

    @Test
    void cacheEvictBorraLaEntradaYLaSiguienteLecturaTraeElPrecioNuevo() {
        servicio.buscar(1);
        servicio.cambiarPrecio(1, 150);

        assertThat(redis.hasKey("productos::1")).isFalse();
        assertThat(servicio.buscar(1).precio()).isEqualTo(150);
        assertThat(repositorio.consultas()).isEqualTo(3); // buscar + cambiarPrecio (lee el nombre) + recarga
    }

    @Test
    void elTtlDeDosSegundosHaceQueLaOfertaSeRecargue() throws InterruptedException {
        servicio.ofertaDelDia();
        servicio.ofertaDelDia();
        assertThat(repositorio.consultas()).isEqualTo(1);

        Thread.sleep(2_500);
        servicio.ofertaDelDia();
        assertThat(repositorio.consultas()).isEqualTo(2);
    }
}
