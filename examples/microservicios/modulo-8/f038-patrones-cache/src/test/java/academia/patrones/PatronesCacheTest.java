package academia.patrones;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.simple.JdbcClient;

/** Necesita Redis (6379) y PostgreSQL (5432) del docker-compose.yml. El trabajador programado se "duerme" 10 min. */
@SpringBootTest(properties = "write-behind.intervalo-ms=600000")
class PatronesCacheTest {

    @Autowired ReadThrough readThrough;
    @Autowired WriteThrough writeThrough;
    @Autowired WriteBehind writeBehind;
    @Autowired BaseDeDatos bd;
    @Autowired CacheManager caches;
    @Autowired StringRedisTemplate redis;
    @Autowired JdbcClient jdbc;

    @BeforeEach
    void limpiar() {
        caches.getCache("productos").clear();
        redis.delete(WriteBehind.COLA);
        jdbc.sql("UPDATE producto SET precio = 100 WHERE id = 1").update();
        bd.lecturas.set(0);
        bd.escrituras.set(0);
    }

    private int precioEnBase() {
        return jdbc.sql("SELECT precio FROM producto WHERE id = 1").query(Integer.class).single();
    }

    @Test
    void readThroughConsultaLaBaseUnaSolaVez() {
        readThrough.obtener(1);
        readThrough.obtener(1);
        readThrough.obtener(1);
        assertThat(bd.lecturas.get()).isEqualTo(1);
    }

    @Test
    void writeThroughDejaBaseYCacheIguales() {
        writeThrough.cambiarPrecio(1, 120);
        assertThat(precioEnBase()).isEqualTo(120);
        assertThat(caches.getCache("productos").get(1L, Producto.class).precio()).isEqualTo(120);
    }

    @Test
    void writeBehindAgrupaCienCambiosEnUnaEscritura() {
        for (int precio = 101; precio <= 200; precio++) {
            writeBehind.cambiarPrecio(1, "Teclado", precio);
        }
        assertThat(caches.getCache("productos").get(1L, Producto.class).precio()).isEqualTo(200);
        assertThat(precioEnBase()).isEqualTo(100);                       // la base va por detrás
        assertThat(redis.opsForStream().size(WriteBehind.COLA)).isEqualTo(100L);

        assertThat(writeBehind.vaciarCola()).isEqualTo(100);
        assertThat(precioEnBase()).isEqualTo(200);
        assertThat(bd.escrituras.get()).isEqualTo(1);
        assertThat(redis.opsForStream().size(WriteBehind.COLA)).isZero();
    }
}
