package academia.redlock;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

/** Necesita redis (6379) y redis-a/b/c (6380-6382) del docker-compose.yml. */
@SpringBootTest
class RedlockFencingTest {

    static final String RECURSO = "lock:factura-7";

    @Autowired Redlock redlock;
    @Autowired FencingTokens tokens;
    @Autowired AlmacenProtegido almacen;
    @Autowired StringRedisTemplate redis;

    @BeforeEach
    void limpiar() {
        almacen.borrar("factura-7");
        redis.delete("fencing:" + RECURSO);
    }

    @Test
    void conLosTresNodosVivosElCandadoSeTomaYUnSegundoClienteNoPuede() {
        var a = redlock.adquirir(RECURSO, Duration.ofSeconds(1));
        var b = redlock.adquirir(RECURSO, Duration.ofSeconds(1));

        assertThat(a.adquirido()).isTrue();
        assertThat(a.nodos()).isEqualTo(3);
        assertThat(a.validezMs()).isBetween(800L, 988L);
        assertThat(b.adquirido()).isFalse();
        assertThat(redlock.liberar(RECURSO, a.valor())).isEqualTo(3);
    }

    @Test
    void conUnNodoCaidoHayMayoriaYConDosNo() {
        try (var unoCaido = new Redlock(List.of("localhost:6380", "localhost:6381", "localhost:6399"));
             var dosCaidos = new Redlock(List.of("localhost:6380", "localhost:6398", "localhost:6399"))) {
            var conDos = unoCaido.adquirir(RECURSO, Duration.ofSeconds(1));
            assertThat(conDos.adquirido()).isTrue();
            assertThat(conDos.nodos()).isEqualTo(2);
            unoCaido.liberar(RECURSO, conDos.valor());

            var conUno = dosCaidos.adquirir(RECURSO, Duration.ofSeconds(1));
            assertThat(conUno.adquirido()).isFalse();
            assertThat(conUno.nodos()).isEqualTo(1);
        }
    }

    @Test
    void elFencingTokenImpideQueUnClientePausadoPiseAlNuevoDueno() throws InterruptedException {
        var a = redlock.adquirir(RECURSO, Duration.ofMillis(300));
        long tokenA = tokens.siguiente(RECURSO);
        Thread.sleep(500);                                   // pausa de GC: el candado de A caduca

        var b = redlock.adquirir(RECURSO, Duration.ofMillis(300));
        long tokenB = tokens.siguiente(RECURSO);
        assertThat(b.adquirido()).isTrue();
        assertThat(tokenB).isGreaterThan(tokenA);

        assertThat(almacen.escribir("factura-7", "total=200 (B)", tokenB)).isTrue();
        assertThat(almacen.escribir("factura-7", "total=100 (A, tarde)", tokenA)).isFalse();
        assertThat(almacen.leer("factura-7")).isEqualTo("total=200 (B)");
        assertThat(redlock.liberar(RECURSO, a.valor())).isZero();      // A no borra el candado de B
        redlock.liberar(RECURSO, b.valor());
    }

    @Test
    void sinFencingLaEscrituraTardiaGana() throws InterruptedException {
        var a = redlock.adquirir(RECURSO, Duration.ofMillis(300));
        Thread.sleep(500);
        var b = redlock.adquirir(RECURSO, Duration.ofMillis(300));

        almacen.escribirSinFencing("factura-7", "total=200 (B)");
        almacen.escribirSinFencing("factura-7", "total=100 (A, tarde)");
        assertThat(almacen.leer("factura-7")).isEqualTo("total=100 (A, tarde)");   // se perdió lo de B
        redlock.liberar(RECURSO, a.valor());
        redlock.liberar(RECURSO, b.valor());
    }
}
