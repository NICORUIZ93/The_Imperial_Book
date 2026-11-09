# Módulo 17: JDBC, DAO y transacciones en Spring Boot

## Aprende construyendo

Spring Data JPA no elimina JDBC: es una capa sobre acceso relacional. En este módulo usarás `JdbcTemplate` para una consulta explícita y compararás sus límites transaccionales con las operaciones ORM.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** con `@JdbcTest` inserta un envío, búscalo por referencia con `?` y verifica la respuesta ausente sin levantar toda la aplicación.
- **Caso RutaFlow:** una liquidación usa `operation_id` único y actualiza saldo, movimiento y estado bajo la misma transacción. Un test hace fallar la segunda escritura y otro envía la misma operación dos veces para verificar rollback y deduplicación.

Usa JDBC cuando el SQL explícito simplifique el caso (por ejemplo, reportes y actualizaciones condicionales), no porque sea automáticamente más rápido. Mide la consulta representativa y conserva el mismo límite de transacción si combinas JDBC con JPA.

### Tema 1: DataSource, JdbcTemplate y DAO

**Meta:** consultar y guardar un envío con Spring JDBC, convertir la fila en un objeto Java y proteger las entradas sin construir SQL con datos de la petición.

**¿Por qué es importante?** El SQL explícito da control sobre consultas y reportes; si se concatena una entrada o se filtra al controlador, aumenta el riesgo de errores y de inyección. Un DAO probado mantiene juntas la consulta y su traducción a objetos.

**Evidencia final:** tests `@JdbcTest` para alta, búsqueda, valor ausente, entrada con comillas y ordenamiento permitido.

**Práctica guiada:** sigue los cuatro cambios en el mismo `EnvioJdbcRepository` y deja verde el test que protege cada decisión.

#### Subtema 17.1 · Conecta JdbcTemplate a la base de prueba · 8 min

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

#### Subtema 17.2 · Pasa valores como parámetros · 8 min

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

#### Subtema 17.3 · Convierte filas en objetos simples · 8 min

**Contexto:** entregar `ResultSet` al servicio o al controlador filtra detalles de JDBC a capas que no los necesitan.

**Hazlo tú:** encuentra el `RowMapper` en `examples/java-jpa-lab/src/main/java/academia/pedidos/EnvioJdbcRepository.java`. Crea `EnvioRegistro` con `referencia` y `estado`; busca un envío existente y uno ausente con la prueba:

```bash
./mvnw -Dtest=EnvioJdbcRepositoryTest#insertaYBuscaConParametroYMapeaUnaFila test
```

**Resultado esperado:** `buscar("RT-3")` devuelve `Optional<EnvioRegistro>` y `buscar("RT-404")` devuelve `Optional.empty()`.

**Fallo deliberado:** cambia `rs.getString("estado")` por el nombre `"situacion"`. **Diagnóstico:** H2 reporta una columna que no existe al mapear la fila. Restaura `estado`.

**Entiende:** `RowMapper` convierte una fila SQL en un valor Java. `Optional` expresa “puede no haber fila” sin usar `null` como señal escondida.

**Cierra:** explica por qué `EnvioRegistro` puede salir del DAO sin exponer `ResultSet`.

#### Subtema 17.4 · Valida el ordenamiento dinámico · 10 min

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
### Tema 2: `@Transactional`, rollback y límites de transacción

#### Paso 1 · Objetivo y preparación

Al finalizar podrás delimitar una operación que inserta un cobro y actualiza un envío, verificando el rollback cuando una escritura falla.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

El cobro se registra, pero falla la actualización del envío. Sin una transacción, queda dinero contabilizado para un pedido que sigue pendiente.

**¿Por qué es importante?** El límite transaccional protege invariantes de negocio ante errores y concurrencia, no solo ante excepciones esperadas.

#### Paso 3 · Teoría y modelo mental

`@Transactional` se aplica mediante infraestructura/proxy de Spring al invocar un método gestionado. Por defecto, las excepciones unchecked provocan rollback; las checked no necesariamente. La anotación no surte el mismo efecto en una llamada interna al mismo objeto (self-invocation), ni debe cubrir llamadas lentas a sistemas externos.

La transacción es un límite local de base de datos, no una transacción distribuida entre PostgreSQL, Kafka y un servicio HTTP.
**Analogía:** `@Transactional` es como el carrito de la compra: vas añadiendo acciones y solo al pasar por caja (commit) se confirman todas juntas; si algo falla, el `rollback` vacía el carrito entero y no se cobra nada a medias. El límite de la transacción es hasta dónde llega ese carrito: no abarca una llamada HTTP a otra tienda.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/main/java/academia/envios/LiquidacionService.java` dentro.
```bash
curl -fsSL https://start.spring.io/starter.zip -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

**Crea** el archivo `src/main/java/academia/envios/LiquidacionService.java` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.


En `src/main/java/academia/envios/LiquidacionService.java`, inyecta repository JDBC y declara:

```java
@Service
public class LiquidacionService {
    private final JdbcTemplate jdbc;

    public LiquidacionService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Transactional
    public void liquidar(String referencia) {
        jdbc.update(
            "insert into cobro(referencia, importe) values (?, ?)",
            referencia, 25.00
        );
        jdbc.update(
            "update envio set estado = ? where referencia = ?",
            "LIQUIDADO", referencia
        );
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


En `@SpringBootTest`, fuerza el segundo paso a fallar (por ejemplo, con una restricción de test) y revisa ambas tablas. Ejecuta `./mvnw test -Dtest=LiquidacionServiceTest`.

**Resultado esperado:** ambas escrituras se confirman juntas, o ninguna permanece tras el fallo. **Fallo deliberado:** mueve `@Transactional` a una llamada interna privada y verifica que no se aplica el proxy como esperabas; devuelve el límite transaccional al método público del bean.

**Diagrama interactivo:** [Transacción JDBC: commit o rollback](/visuals/temas/spring-boot/modulo-17-tema-2-transacciones.html).

#### Paso 5 · Práctica guiada

Prueba explícitamente una checked exception y decide si la política requiere `rollbackFor`. Añade un test de carrera con actualización optimista (`@Version`) o una actualización condicional atómica; documenta qué anomalía previenes.
**Pista:** lanza una checked exception (no una `RuntimeException`) dentro del método anotado con `@Transactional` y ejecuta el test; si la fila queda confirmada en la base de datos a pesar de la excepción, es porque Spring solo revierte automáticamente ante excepciones unchecked — necesitas `@Transactional(rollbackFor = TuExcepcionChecked.class)` para forzar el rollback también en ese caso.
#### Paso 6 · Práctica independiente

Implementa una liquidación de RutaFlow con deduplicación por `operation_id`. Incluye restricción única, rollback, segundo intento idempotente y una prueba donde una excepción de negocio no deja escrituras parciales.

#### Paso 7 · Cierre y evidencia

Entrega test de rollback, test de repetición y nota sobre el límite transaccional para el proyecto integrador de RutaFlow. **Cuándo no usarlo:** no mantengas una transacción abierta durante HTTP, archivos o espera humana; usa outbox/saga para coordinar efectos externos. **Evidencia:** ambos estados consistentes después del éxito y del error.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** anotar con `@Transactional` un método privado o invocarlo desde otro método del mismo bean (self-invocation) esperando que el proxy de Spring lo intercepte igual, y mantener la transacción abierta mientras se espera una respuesta HTTP o se escribe en Kafka, extendiendo el límite transaccional fuera de la base de datos.
**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
**Evidencia de aprendizaje:** entrega la salida del test que fuerza el fallo de la segunda escritura mostrando que ninguna de las dos tablas quedó con datos parciales, el resultado de mover `@Transactional` a una llamada interna (sin rollback), y la explicación de qué anomalía evita tu prueba de carrera con `@Version`.
