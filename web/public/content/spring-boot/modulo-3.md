# Módulo 3: JDBC, JdbcClient y transacciones en Spring Boot

## Aprende construyendo

Spring Data JPA no elimina JDBC: es una capa sobre acceso relacional. En este módulo usarás `JdbcTemplate` para una consulta explícita y compararás sus límites transaccionales con las operaciones ORM.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** con `@JdbcTest` inserta un envío, búscalo por referencia con `?` y verifica la respuesta ausente sin levantar toda la aplicación.
- **Caso RutaFlow:** una liquidación usa `operation_id` único y actualiza saldo, movimiento y estado bajo la misma transacción. Un test hace fallar la segunda escritura y otro envía la misma operación dos veces para verificar rollback y deduplicación.

Usa JDBC cuando el SQL explícito simplifique el caso (por ejemplo, reportes y actualizaciones condicionales), no porque sea automáticamente más rápido. Mide la consulta representativa y conserva el mismo límite de transacción si combinas JDBC con JPA.

### Tema 1: DataSource, JdbcTemplate y DAO · Intermedio · 35 min

**Meta:** consultar y guardar un envío con Spring JDBC, convertir la fila en un objeto Java y proteger las entradas sin construir SQL con datos de la petición.

**¿Por qué es importante?** El SQL explícito da control sobre consultas y reportes; si se concatena una entrada o se filtra al controlador, aumenta el riesgo de errores y de inyección. Un DAO probado mantiene juntas la consulta y su traducción a objetos.

**Evidencia final:** tests `@JdbcTest` para alta, búsqueda, valor ausente, entrada con comillas y ordenamiento permitido.

**Práctica guiada:** sigue los cuatro cambios en el mismo `EnvioJdbcRepository` y deja verde el test que protege cada decisión.

#### Subtema 1.1 · Conecta JdbcTemplate a la base de prueba · 8 min

**Contexto:** una aplicación necesita obtener conexiones sin abrirlas manualmente en cada método. Spring Boot configura el `DataSource`; `JdbcTemplate` usa esa conexión y libera recursos al terminar.

**Hazlo tú:** abre `examples/java-jpa-lab/pom.xml`. El proyecto declara `spring-boot-starter-jdbc`, H2 para ejecución y `spring-boot-starter-jdbc-test` para la prueba slice. Abre luego `examples/java-jpa-lab/src/test/java/academia/pedidos/EnvioJdbcRepositoryTest.java` y ejecuta:

```bash
cd examples/java-jpa-lab
./mvnw -Dtest=EnvioJdbcRepositoryTest#insertaYBuscaConParametroYMapeaUnaFila test
```

**Resultado esperado:** el contexto `@JdbcTest` crea una base H2 aislada para la prueba e inyecta `JdbcTemplate` y `EnvioJdbcRepository`.

**Fallo deliberado:** quita `@Import(EnvioJdbcRepository.class)` y vuelve a ejecutar. **Diagnóstico:** el slice no encuentra el repositorio; vuelve a importar solo el componente que quieres probar.

**Entiende:** `DataSource` administra el origen de conexiones. `JdbcTemplate` evita el código repetido de abrir/cerrar conexiones y traduce errores de JDBC. `@JdbcTest` prepara el segmento de acceso a datos sin levantar una aplicación web completa.

**Cierra:** di qué componente crea las conexiones y cuál ejecuta el SQL.

#### Subtema 1.2 · Pasa valores como parámetros · 8 min

**Contexto:** la referencia del envío llega desde una petición y debe tratarse como valor, aunque contenga comillas.

**Hazlo tú:** abre `examples/java-jpa-lab/src/main/java/academia/pedidos/EnvioJdbcRepository.java`. Observa el `?` y el argumento separado:

```java
return jdbc.query(
    "select referencia, estado from envio where referencia = ?",
    mapper,
    referencia
);
```

Ejecuta la prueba de entrada:

```bash
./mvnw -Dtest=EnvioJdbcRepositoryTest#entradaConComillasSeTrataComoDato test
```

**Resultado esperado:** la búsqueda `"' OR '1'='1"` no devuelve envíos y el conteo sigue en dos.

**Fallo deliberado:** concatena `referencia` dentro del SQL y repite. **Diagnóstico:** el test ya no valida que el texto se mantenga como dato separado. Restaura `?` y el argumento.

**Entiende:** el prepared statement separa el texto SQL de sus valores. El `?` sirve para valores; no parametriza nombres de tabla ni de columna.

**Cierra:** identifica cuál parte de `buscar` es SQL fijo y cuál llega desde quien llama.

#### Subtema 1.3 · Convierte filas en objetos simples · 8 min

**Contexto:** entregar `ResultSet` al servicio o al controlador filtra detalles de JDBC a capas que no los necesitan.

**Hazlo tú:** encuentra el `RowMapper` en `examples/java-jpa-lab/src/main/java/academia/pedidos/EnvioJdbcRepository.java`. Crea `EnvioRegistro` con `referencia` y `estado`; busca un envío existente y uno ausente con la prueba:

```bash
./mvnw -Dtest=EnvioJdbcRepositoryTest#insertaYBuscaConParametroYMapeaUnaFila test
```

**Resultado esperado:** `buscar("RT-3")` devuelve `Optional<EnvioRegistro>` y `buscar("RT-404")` devuelve `Optional.empty()`.

**Fallo deliberado:** cambia `rs.getString("estado")` por el nombre `"situacion"`. **Diagnóstico:** H2 reporta una columna que no existe al mapear la fila. Restaura `estado`.

**Entiende:** `RowMapper` convierte una fila SQL en un valor Java. `Optional` expresa “puede no haber fila” sin usar `null` como señal escondida.

**Cierra:** explica por qué `EnvioRegistro` puede salir del DAO sin exponer `ResultSet`.

#### Subtema 1.4 · Valida el ordenamiento dinámico · 10 min

**Contexto:** los valores de filtro se parametrizan, pero `ORDER BY ?` no sustituye el nombre de una columna. Concatenar directamente lo que escribió el usuario es peligroso.

**Hazlo tú:** revisa `porEstadoOrdenados` en `EnvioJdbcRepository.java`. El método permite solo dos nombres conocidos mediante `switch` y luego usa `estado` como parámetro. Ejecuta:

```bash
./mvnw -Dtest=EnvioJdbcRepositoryTest#aceptaSoloColumnasDeOrdenamientoPermitidas test
```

**Resultado esperado:** `referencia` ordena los resultados; `estado; drop table envio` produce `IllegalArgumentException` antes de ejecutar SQL.

**Fallo deliberado:** elimina el `switch` y concatena `ordenarPor` directamente. **Diagnóstico:** el test de orden no permitido deja de recibir la excepción del DAO. Restaura la lista permitida.

**Entiende:** una allowlist transforma una opción pública en uno de varios fragmentos SQL escritos por el programa. Para una búsqueda grande, limita filas y diseña índices; elegir JDBC no garantiza que sea más rápido que JPA.

**Cierra:** en el proyecto integrador de RutaFlow, elige una búsqueda que necesite SQL explícito y documenta filtro, orden válido, límite de página y DTO de salida. Contrasta cuándo usarías JDBC y cuándo un repositorio JPA.

**Fuentes primarias:** [Spring Boot: acceso a datos SQL](https://docs.spring.io/spring-boot/reference/data/sql.html); [Spring Framework: JdbcTemplate](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html).

### Tema 2: `JdbcClient`: la API fluida de Spring para SQL explícito · Intermedio · 35 min

Al terminar, podrás reescribir el DAO del Tema 1 con `JdbcClient`, usar parámetros con nombre, mapear filas directamente a un `record` y decidir cuándo conservar `JdbcTemplate`.

**¿Por qué es importante?** `JdbcClient` (Spring Framework 6.1 en adelante) es la forma recomendada de escribir SQL nuevo en Spring: una sola cadena de llamadas `sql → param → query/update`, parámetros con nombre en lugar de `?` posicionales y mapeo automático a records. Spring Boot lo autoconfigura junto a `JdbcTemplate`, así que no añade dependencias.

**Prerrequisitos:** Tema 1 de este módulo (`EnvioJdbcRepository`, `EnvioRegistro` y la prueba `@JdbcTest`). Trabaja en `examples/java-jpa-lab` con JDK 25 y Spring Boot 4.1.2.

#### Subtema 2.1 · Reescribe la búsqueda con parámetros con nombre · 10 min

**Contexto:** en `EnvioJdbcRepository` cada consulta repite el `RowMapper` y depende del orden de los `?`. Con dos o tres parámetros, cambiar el orden en el SQL sin cambiarlo en Java produce un error silencioso.

**Hazlo tú:** crea `examples/java-jpa-lab/src/main/java/academia/pedidos/EnvioJdbcClientRepository.java`:

```java
package academia.pedidos;

import java.util.List;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class EnvioJdbcClientRepository {
    private final JdbcClient jdbc;

    public EnvioJdbcClientRepository(JdbcClient jdbc) {
        this.jdbc = jdbc;
    }

    public int crear(String referencia, String estado) {
        return jdbc.sql("insert into envio(referencia, estado) values (:referencia, :estado)")
            .param("referencia", referencia)
            .param("estado", estado)
            .update();
    }

    public Optional<EnvioRegistro> buscar(String referencia) {
        return jdbc.sql("select referencia, estado from envio where referencia = :referencia")
            .param("referencia", referencia)
            .query(EnvioRegistro.class)
            .optional();
    }

    public List<EnvioRegistro> porEstado(String estado) {
        return jdbc.sql("select referencia, estado from envio where estado = :estado order by referencia")
            .param("estado", estado)
            .query(EnvioRegistro.class)
            .list();
    }
}
```

Crea `examples/java-jpa-lab/src/test/java/academia/pedidos/EnvioJdbcClientRepositoryTest.java`:

```java
package academia.pedidos;

import static org.assertj.core.api.Assertions.assertThat;

import javax.sql.DataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.JdbcTest;
import org.springframework.jdbc.core.simple.JdbcClient;

@JdbcTest
class EnvioJdbcClientRepositoryTest {
    @Autowired DataSource dataSource;
    JdbcClient jdbc;
    EnvioJdbcClientRepository envios;

    @BeforeEach
    void prepararEsquema() {
        jdbc = JdbcClient.create(dataSource);
        envios = new EnvioJdbcClientRepository(jdbc);
        jdbc.sql("drop table if exists envio").update();
        jdbc.sql("create table envio(referencia varchar(40) primary key, estado varchar(20) not null)").update();
        envios.crear("RT-1", "PENDIENTE");
        envios.crear("RT-2", "EN_RUTA");
    }

    @Test
    void buscaPorNombreYMapeaAlRecord() {
        assertThat(envios.buscar("RT-2")).contains(new EnvioRegistro("RT-2", "EN_RUTA"));
        assertThat(envios.buscar("RT-404")).isEmpty();
    }

    @Test
    void entradaConComillasSigueSiendoUnDato() {
        assertThat(envios.buscar("' OR '1'='1")).isEmpty();
        assertThat(jdbc.sql("select count(*) from envio").query(Integer.class).single()).isEqualTo(2);
    }
}
```

Desde `examples/java-jpa-lab`, ejecuta:

```bash
./mvnw -q -Dtest=EnvioJdbcClientRepositoryTest test
```

**Resultado esperado:** dos pruebas verdes. `buscar` devuelve el record sin que escribieras un `RowMapper`.

**Fallo deliberado:** en `buscar`, cambia `.param("referencia", referencia)` por `.param("ref", referencia)`. **Error esperado:** la prueba falla con una excepción de Spring que indica que no hay valor para el parámetro `referencia`. **Diagnóstico:** el nombre en `:referencia` y el de `param(...)` deben coincidir. Restaura `"referencia"`.

**Entiende:** `query(EnvioRegistro.class)` usa un mapeador por constructor: empareja las columnas `referencia` y `estado` con los componentes del record (sin distinguir mayúsculas ni guiones bajos). `optional()` devuelve `Optional` y falla si llegan **dos** filas; `single()` exige exactamente una; `list()` devuelve todas.

**Cierra:** cuenta cuántas líneas de mapeo manual desaparecieron respecto al Tema 1.

#### Subtema 2.2 · Mapea una consulta con alias y una proyección distinta · 10 min

**Contexto:** el reporte diario solo necesita cuántos envíos hay por estado. Ese resultado no es una entidad: es una proyección que nace en el SQL.

**Hazlo tú:** crea `examples/java-jpa-lab/src/main/java/academia/pedidos/ConteoPorEstado.java`:

```java
package academia.pedidos;

public record ConteoPorEstado(String estado, long total) { }
```

Añade a `EnvioJdbcClientRepository`:

```java
public List<ConteoPorEstado> contarPorEstado() {
    return jdbc.sql("select estado, count(*) as total from envio group by estado order by estado")
        .query(ConteoPorEstado.class)
        .list();
}
```

Añade al test:

```java
@Test
void agrupaPorEstado() {
    envios.crear("RT-3", "EN_RUTA");
    assertThat(envios.contarPorEstado()).containsExactly(
        new ConteoPorEstado("EN_RUTA", 2),
        new ConteoPorEstado("PENDIENTE", 1));
}
```

**Resultado esperado:** verde.

**Fallo deliberado:** quita el alias `as total` del SQL. **Error esperado:** la aserción `agrupaPorEstado` falla: ninguna columna se llama `total` (H2 la nombra `COUNT(*)`), así que el componente `total` no recibe el conteo. **Diagnóstico:** el mapeador por constructor solo puede emparejar por nombre; el alias es parte del contrato entre SQL y Java. Restaura el alias.

**Entiende:** las proyecciones con `JdbcClient` son baratas: no hay contexto de persistencia, ni *dirty checking*, ni carga perezosa. Por eso los reportes suelen ir mejor con SQL explícito que con entidades JPA.

**Cierra:** escribe qué pasaría si el reporte usara entidades `Envio` y las contara en Java.

#### Subtema 2.3 · Decide entre `JdbcClient`, `JdbcTemplate` y JPA · 7 min

**Contexto:** las tres APIs conviven en el mismo proyecto; elegir por moda complica el mantenimiento.

**Hazlo tú:** compara en tu cuaderno los dos repositorios del laboratorio y completa la tabla con un caso de RutaFlow para cada fila:

| Herramienta | Úsala cuando | Caso RutaFlow |
|---|---|---|
| `JdbcClient` | SQL nuevo, parámetros con nombre, mapeo a records | |
| `JdbcTemplate` | código existente, operaciones por lotes (`batchUpdate`), `RowCallbackHandler` para recorrer sin cargar todo | |
| Spring Data JPA (Módulo 4) | agregados con relaciones y reglas que cambian estado | |

**Resultado esperado:** una decisión por fila, con el motivo.

**Fallo deliberado:** intenta parametrizar el orden: `order by :columna` con `.param("columna", "estado")`. **Resultado esperado:** no obtienes el orden por `estado`: según el motor, la base rechaza el parámetro dentro de `ORDER BY` o lo trata como un valor constante y no reordena. **Diagnóstico:** igual que `?`, un parámetro con nombre es un **valor**, nunca un nombre de columna; para ordenar dinámicamente mantén la *allowlist* del Tema 1.

**Entiende:** `JdbcClient` está construido sobre `NamedParameterJdbcTemplate`; no es más rápido, es más legible. Ambos participan en la misma transacción de `@Transactional` (Tema 3), así que puedes mezclar uno y otro en un caso de uso.

**Cierra:** decide qué API usará el nuevo reporte de RutaFlow y anótalo.

**Ejercicio:** añade `actualizarEstado(String referencia, String desde, String hacia)` que solo cambie el estado si el actual es `desde` y devuelva `true` si cambió una fila. Escribe la prueba antes de abrir la solución.

<details>
<summary>Solución</summary>

```java
public boolean actualizarEstado(String referencia, String desde, String hacia) {
    int filas = jdbc.sql("""
            update envio set estado = :hacia
            where referencia = :referencia and estado = :desde
            """)
        .param("referencia", referencia)
        .param("desde", desde)
        .param("hacia", hacia)
        .update();
    return filas == 1;
}
```

```java
@Test
void soloActualizaDesdeElEstadoEsperado() {
    assertThat(envios.actualizarEstado("RT-1", "PENDIENTE", "EN_RUTA")).isTrue();
    assertThat(envios.actualizarEstado("RT-1", "PENDIENTE", "ENTREGADO")).isFalse();
    assertThat(envios.buscar("RT-1")).contains(new EnvioRegistro("RT-1", "EN_RUTA"));
}
```

La condición `estado = :desde` convierte la actualización en una comparación-e-intercambio: si dos peticiones compiten, solo una cambia la fila. Es la base de la concurrencia optimista sin columna de versión.

</details>

**Hito del tema:**

- [ ] Reescribí búsqueda y alta con `JdbcClient` y parámetros con nombre.
- [ ] Mapeé filas a records sin `RowMapper` y provoqué el fallo de un parámetro mal nombrado.
- [ ] Construí una proyección agregada y vi por qué el alias es obligatorio.
- [ ] Decidí entre `JdbcClient`, `JdbcTemplate` y JPA para un caso real.

**Fuentes oficiales:** [Spring Framework — `JdbcClient`](https://docs.spring.io/spring-framework/reference/data-access/jdbc/core.html#jdbc-JdbcClient) y [Spring Boot — Using JdbcClient](https://docs.spring.io/spring-boot/reference/data/sql.html).

**Proyecto integrador:** mueve el reporte de envíos por estado de RutaFlow a `JdbcClient`. **Límite:** `JdbcClient` no genera el esquema ni lo migra; eso lo hace Flyway (Módulo 4).

### Tema 3: `@Transactional`, rollback y límites de transacción · Avanzado · 35 min

**Meta:** mantener juntos el cobro y el cambio de estado, comprobar qué errores provocan rollback y delimitar qué trabajo pertenece a la transacción.

**¿Por qué es importante?** Si se guarda el cobro y falla el cambio de estado, el sistema queda con dos versiones distintas de la realidad. La transacción agrupa cambios de una misma base y los confirma o revierte como una unidad.

**Práctica guiada:** modifica el servicio del laboratorio y observa las dos tablas después de cada resultado.

#### Subtema 3.1 · Confirma dos cambios como una unidad · 8 min

**Contexto:** una liquidación correcta guarda el importe y cambia el envío a `LIQUIDADO`. El usuario no debe ver solo uno de esos cambios.

**Hazlo tú:** abre `examples/java-jpa-lab/src/main/java/academia/pedidos/LiquidacionService.java`. El método público llama a dos sentencias JDBC y está anotado con `@Transactional`. Ejecuta:

```bash
cd examples/java-jpa-lab
./mvnw -Dtest=LiquidacionServiceTest#confirmaCobroYEstadoDentroDeLaMismaTransaccion test
```

**Resultado esperado:** `cobro` contiene `27.50` y `envio.estado` vale `LIQUIDADO`.

**Fallo deliberado:** cambia la tabla `cobro` por `cobros` en el `INSERT` y repite. **Diagnóstico:** el SQL informa que la tabla no existe; restaura `cobro`.

**Entiende:** Spring intercepta la llamada al método del bean, abre la transacción antes de entrar y confirma al terminar sin excepción. `JdbcTemplate` participa en esa misma conexión transaccional.

**Cierra:** enumera las dos escrituras que deben confirmarse juntas.

#### Subtema 3.2 · Revierte el primer cambio si el segundo falla · 8 min

**Contexto:** el `INSERT` de cobro puede funcionar aunque la referencia del envío no exista. La segunda sentencia debe comprobar cuántas filas cambió.

**Hazlo tú:** abre `examples/java-jpa-lab/src/test/java/academia/pedidos/LiquidacionServiceTest.java`. Ejecuta el test que liquida `RT-404` y consulta el estado de la tabla `cobro`:

```bash
./mvnw -Dtest=LiquidacionServiceTest#revierteElCobroSiLaActualizacionDelEnvioNoEncuentraFila test
```

**Resultado esperado:** el método lanza `IllegalStateException` y el conteo de cobros queda en cero.

**Fallo deliberado:** comenta `@Transactional` en `LiquidacionService.liquidar`. **Diagnóstico:** el test encuentra un cobro guardado aunque no exista el envío; vuelve a poner la anotación en el método público.

**Entiende:** por defecto, Spring revierte una transacción si el método deja escapar una excepción `RuntimeException` o `Error`. Capturar la excepción dentro del método y continuar puede permitir que la transacción se confirme.

**Cierra:** explica qué test demuestra que no queda una escritura parcial.

#### Subtema 3.3 · Decide qué excepciones revierten · 8 min

**Contexto:** algunas reglas del negocio usan excepciones comprobadas. La configuración predeterminada no siempre revierte ante ellas.

**Hazlo tú:** abre `examples/java-jpa-lab/src/main/java/academia/pedidos/LiquidacionService.java`. Mira `liquidarConRevisionPendiente` y su `@Transactional(rollbackFor = LiquidacionPendienteException.class)`. Ejecuta:

```bash
./mvnw -Dtest=LiquidacionServiceTest#rollbackForTambienRevierteUnaExcepcionChecked test
```

**Resultado esperado:** se propaga `LiquidacionPendienteException`; no queda el cobro y el envío sigue `PENDIENTE`.

**Fallo deliberado:** quita `rollbackFor = LiquidacionPendienteException.class` y corre el test. **Diagnóstico:** la excepción checked se lanza, pero las escrituras permanecen; restaura la regla explícita.

**Entiende:** con la política predeterminada, una checked exception no provoca rollback automáticamente. `rollbackFor` hace explícita la regla del negocio. Verifica qué política define la versión de Spring que usa tu proyecto.

**Cierra:** señala qué excepción debe dejar intacta la base y cuál regla lo decide.

#### Subtema 3.4 · Mantén el límite dentro del bean y la base · 10 min

**Contexto:** `@Transactional` usa un proxy de Spring. Solo las llamadas que pasan por ese proxy reciben el comportamiento declarado; una llamada interna del mismo objeto puede saltárselo.

**Hazlo tú:** abre `examples/java-jpa-lab/src/test/java/academia/pedidos/LiquidacionServiceTest.java` y ejecuta la prueba que verifica el rollback al faltar el envío:

```bash
./mvnw -Dtest=LiquidacionServiceTest#revierteElCobroSiLaActualizacionDelEnvioNoEncuentraFila test
```

Compara ese caso con el método público de `examples/java-jpa-lab/src/main/java/academia/pedidos/LiquidacionService.java`, que recibe la llamada y deja escapar el error.

**Resultado esperado:** la prueba verifica cobro y estado desde otra llamada, cuando la transacción del servicio ya terminó.

**Fallo deliberado:** mueve la anotación a un método privado `liquidarInterno` y haz que el público lo invoque dentro del mismo bean. **Diagnóstico:** el test vuelve a encontrar el cobro parcial porque la llamada interna no atraviesa el proxy. Restaura `@Transactional` en el método público llamado desde afuera.

**Entiende:** esta transacción agrupa operaciones en la misma base de datos. No vuelve atómica una llamada HTTP, un mensaje Kafka o la escritura de un archivo. Para coordinar sistemas separados, usa una estrategia como outbox o saga; evita sostener una transacción mientras esperas un servicio remoto.

**Cierra:** en el proyecto integrador de RutaFlow, documenta las tablas que participan, el método público que marca el límite, los errores que revierten y cómo publicarías un evento sin fingir que la transacción abarca Kafka.

**Fuentes primarias:** [Spring Framework: `@Transactional`, proxy y rollback](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html); [Spring Framework: rollback declarativo](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/rolling-back.html).
