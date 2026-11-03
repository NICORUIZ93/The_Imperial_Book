# Módulo 17: JDBC, DAO y transacciones en Spring Boot

## Aprende construyendo

Spring Data JPA no elimina JDBC: es una capa sobre acceso relacional. En este módulo usarás `JdbcTemplate` para una consulta explícita y compararás sus límites transaccionales con las operaciones ORM.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** con `@JdbcTest` inserta un envío, búscalo por referencia con `?` y verifica la respuesta ausente sin levantar toda la aplicación.
- **Caso RutaFlow:** una liquidación usa `operation_id` único y actualiza saldo, movimiento y estado bajo la misma transacción. Un test hace fallar la segunda escritura y otro envía la misma operación dos veces para verificar rollback y deduplicación.

Usa JDBC cuando el SQL explícito simplifique el caso (por ejemplo, reportes y actualizaciones condicionales), no porque sea automáticamente más rápido. Mide la consulta representativa y conserva el mismo límite de transacción si combinas JDBC con JPA.

### Tema 1: DataSource, JdbcTemplate y DAO · Avanzado · 1 h 40 min

**Prerrequisito:** Módulo 16 de este track, JDK 27+ y Maven.

**Al terminar podrás:** consultar e insertar datos con `JdbcTemplate`, proteger parámetros y separar persistencia del servicio.

#### Aprende

Un reporte de envíos requiere un `JOIN` y una agregación difícil de expresar como operación de repositorio. SQL directo puede ser más claro, siempre que permanezca probado y parametrizado.

**¿Por qué es importante?** SQL explícito resulta útil para consultas especializadas, pero debe conservar parametrización, pruebas y límites de capa.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `DataSource` autoconfigurado | Prerrequisito | El comando con `dependencies=web` y la dependencia `jdbc`/`h2` dejan un pool listo sin configurar la conexión a mano |
| `JdbcTemplate` como colaborador inyectado | Núcleo | El constructor `EnvioJdbcRepository(JdbcTemplate jdbc)` recibe el template que abre y libera la conexión |
| Parámetros `?` para valores | Núcleo | `estadoDe` pasa `referencia` como argumento posicional de `select ... where referencia = ?` |
| Mapeo de filas a resultado | Variante | El lambda `(rs, row) -> rs.getString("estado")` traduce cada fila y `findFirst()` devuelve `Optional` |
| Identificadores vía allowlist | Límite | El `ORDER BY` concatena el nombre de columna solo si pertenece a una lista cerrada, nunca como `?` |
| Separación DAO/servicio y DTO | Decisión | El reporte con `JOIN` mapea a un DTO y el checklist prohíbe devolver filas crudas al controlador |
| Inyección SQL por concatenación | Error frecuente | El fallo deliberado concatena el valor con comilla y rompe el SQL hasta volver a `?` |

Cada fila tiene su explicación individual a continuación.

**`DataSource` autoconfigurado (prerrequisito).** Spring Boot construye el `DataSource` a partir de la dependencia y las propiedades, de modo que al generar el proyecto con `jdbc` y `h2` ya existe un pool de conexiones. Sin este paso previo no habría conexión que `JdbcTemplate` pudiera obtener ni liberar. El límite es que esta autoconfiguración resuelve la tubería, pero no decide el SQL ni la capa de negocio.

**`JdbcTemplate` como colaborador inyectado (núcleo).** El repositorio recibe `JdbcTemplate` por constructor y lo usa para `query` y `update`; ese objeto obtiene y libera conexiones, prepara statements y traduce excepciones JDBC a la jerarquía de Spring. El mecanismo evita gestionar recursos a mano. La decisión profesional es concentrar su uso en el DAO y no esparcirlo por el servicio o el controlador.

**Parámetros `?` para valores (núcleo).** `estadoDe` y `crear` pasan `referencia` y `estado` como argumentos posicionales que rellenan los `?` del SQL, lo que conserva el valor como dato y no como fragmento ejecutable. El resultado observable es que `crear` devuelve `1` y la búsqueda recupera el estado insertado. El error asociado aparece si el valor se concatena en lugar de parametrizarse.

**Mapeo de filas a resultado (variante).** El lambda `(rs, row) -> rs.getString("estado")` convierte cada fila del `ResultSet` en el tipo que el servicio espera, y `stream().findFirst()` entrega un `Optional` vacío cuando no hay coincidencia. Esta variante del acceso permite que una referencia desconocida retorne vacío en vez de error. El mismo patrón escala al reporte, donde el mapeo produce un DTO en lugar de una entidad gestionada.

**Identificadores vía allowlist (límite).** Un `?` parametriza valores, no nombres de columna o tabla, por lo que el `ORDER BY` solo puede construirse concatenando un identificador validado contra una lista cerrada. El límite es real: pasar un nombre con espacio o punto y coma hace que el SQL falle o acepte un fragmento no pedido. Por eso el nombre de columna nunca viaja como `?` ni directo desde la petición.

**Separación DAO/servicio y DTO (decisión).** El DAO contiene SQL y mapeo, el servicio expresa la operación de negocio, y el reporte con `JOIN` se mapea a un DTO antes de salir del repositorio. Esta decisión de capa evita filtrar filas crudas al controlador, como exige el checklist. La contraparte es no construir un framework DAO genérico sin necesidad real.

**Inyección SQL por concatenación (error frecuente).** El fallo deliberado concatena directamente el valor recibido y prueba una entrada con comilla, lo que rompe el SQL y abre la puerta a inyección. La corrección es volver a pasar el valor como `?` e inspeccionar el test para confirmar que la cadena se conserva como dato. Este error resume por qué la parametrización es obligatoria para valores de usuario.

Spring Boot configura un `DataSource` desde la dependencia y propiedades. `JdbcTemplate` obtiene/libera conexiones, prepara statements y traduce excepciones JDBC a la jerarquía de excepciones de Spring. Un DAO/repository contiene el SQL y mapeo; el servicio expresa la operación de negocio.

`?` parametriza valores, no identificadores SQL. Para filtros opcionales, construye solo fragmentos elegidos de una allowlist y sigue usando parámetros para valores.

**Analogía:** el `DataSource` es la tubería de agua ya conectada a la red (el pool de conexiones); `JdbcTemplate` es el grifo que abres y cierras sin preocuparte de la instalación; y el DAO es el fontanero que sabe exactamente qué grifo abrir para cada tarea, aislando al resto de la casa de los detalles.

#### Practica

Genera una app Spring Boot con `jdbc` y `h2`.

**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/resources/schema.sql` con el contenido de este tema.

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
```

Configura `src/main/resources/schema.sql`:

```sql
create table envio (
  id bigint generated by default as identity primary key,
  referencia varchar(40) not null unique,
  estado varchar(20) not null
);
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

Crea `src/main/java/academia/envios/EnvioJdbcRepository.java`:

```java
@Repository
public class EnvioJdbcRepository {
    private final JdbcTemplate jdbc;

    public EnvioJdbcRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public Optional<String> estadoDe(String referencia) {
        return jdbc.query(
            "select estado from envio where referencia = ?",
            (rs, row) -> rs.getString("estado"),
            referencia
        ).stream().findFirst();
    }

    public int crear(String referencia, String estado) {
        return jdbc.update(
            "insert into envio(referencia, estado) values (?, ?)",
            referencia, estado
        );
    }
}
```

Escribe `@JdbcTest` con `@Import(EnvioJdbcRepository.class)`, crea un registro y valida encontrado/ausente. Ejecuta `./mvnw test -Dtest=EnvioJdbcRepositoryTest`.

**Resultado esperado:** insert devuelve `1`, la búsqueda retorna estado y una referencia desconocida retorna vacío. **Fallo deliberado:** concatena el valor en SQL y prueba una entrada con comilla. Corrige usando parámetros; inspecciona el test para asegurar que la cadena se conserva como dato.

Agrega un reporte con `JOIN` entre `envio` y `parada`; mapea el resultado a un DTO, no a entidad gestionada. Añade ordenamiento por un nombre de columna que se valida contra allowlist y limita la página.

**Pista:** pasa un nombre de columna fuera de tu allowlist (por ejemplo, uno con un espacio o un punto y coma) a la construcción del `ORDER BY` y ejecuta el reporte; si no rechazas ese valor antes de concatenarlo, verás que el SQL falla o, peor, que acepta un fragmento que no pediste — por eso el nombre de columna nunca debe pasarse como `?` ni venir directo de un parámetro de la petición sin pasar por la allowlist.

#### Aplica

Implementa búsqueda paginada y un reporte de RutaFlow por estado y fecha. Decide si JdbcTemplate, JPA o una combinación expresa mejor cada consulta. Mide tiempos solo con datos representativos; la elección no se basa en que un estilo sea universalmente más rápido.

**Checklist de salida.**

- [ ] `EnvioJdbcRepository` consulta por `referencia` con `?` y devuelve `Optional` vacío cuando no existe.
- [ ] `crear` devuelve `1` y el estado insertado se recupera con `estadoDe`.
- [ ] El `@JdbcTest` con `@Import(EnvioJdbcRepository.class)` pasa inserción, encontrado y ausente.
- [ ] Una referencia con comilla se guarda como dato y no altera el SQL.
- [ ] El reporte con `JOIN` mapea a un DTO y nunca devuelve filas crudas al controlador.
- [ ] El `ORDER BY` usa un nombre de columna validado contra allowlist y la página está limitada.

**Si falla.** Si la referencia con comilla rompe el SQL, todavía concatenas el valor: pásalo como `?`. Si el reporte devuelve filas crudas, mueve el mapeo a DTO dentro del DAO. Si el orden falla con un nombre válido, revisa la allowlist: el nombre de columna se concatena desde una lista cerrada y nunca viaja como parámetro.

Entrega el repository, el test de slice y la consulta de reporte como incremento del proyecto integrador de RutaFlow. **Cuándo no usarlo:** no disperses SQL en controladores ni construyas un framework DAO genérico sin necesidad.

Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

**Errores comunes:** concatenar directamente un valor recibido del usuario dentro del SQL en lugar de pasarlo como parámetro `?` (abre la puerta a inyección), y dejar que el repository JDBC devuelva filas crudas al controlador en vez de mapearlas a un DTO dentro del DAO.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).

### Tema 2: `@Transactional`, rollback y límites de transacción · Avanzado · 1 h 20 min

**Prerrequisito:** Tema 1 de este módulo; continúa con su esquema y repository JDBC.

**Al terminar podrás:** delimitar una operación que inserta un cobro y actualiza un envío, verificando el rollback cuando una escritura falla. Esto cubre el límite transaccional básico con JDBC; el Módulo 13, Tema 1 profundiza en proxies, autoinvocación y propagación.

#### Aprende

El cobro se registra, pero falla la actualización del envío. Sin una transacción, queda dinero contabilizado para un pedido que sigue pendiente.

**¿Por qué es importante?** El límite transaccional protege invariantes de negocio ante errores y concurrencia, no solo ante excepciones esperadas.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Método público del bean anotado | Prerrequisito | `liquidar` es público en `LiquidacionService` y se invoca desde fuera para que el proxy actúe |
| Commit atómico de varias escrituras | Núcleo | `insert cobro` y `update envio` dentro de `@Transactional` se confirman juntos o ninguno |
| Rollback ante unchecked | Núcleo | Forzar el fallo del segundo `update` deja ambas tablas sin cambios |
| `rollbackFor` para checked | Variante | Una checked exception no revierte salvo `@Transactional(rollbackFor = TuExcepcionChecked.class)` |
| Límite local de base de datos | Límite | La transacción no abarca HTTP ni Kafka; el checklist prohíbe esperas externas dentro de ella |
| Deduplicación idempotente | Decisión | `operation_id` con restricción única hace que el segundo intento no duplique el cobro |
| Self-invocation del proxy | Error frecuente | Mover `@Transactional` a una llamada interna privada muestra que el proxy no se aplica |

Cada fila tiene su explicación individual a continuación.

**Método público del bean anotado (prerrequisito).** `@Transactional` actúa mediante un proxy de Spring que solo intercepta cuando el método gestionado se invoca desde fuera del objeto. Por eso `liquidar` debe ser público en `LiquidacionService` y llamarse desde otro bean. Sin esta condición previa, la anotación no establece ningún límite transaccional.

**Commit atómico de varias escrituras (núcleo).** El método agrupa el `insert` en `cobro` y el `update` de `envio` bajo una misma transacción, de modo que ambos se confirman juntos. El mecanismo garantiza que no quede dinero contabilizado para un pedido que sigue pendiente. El resultado esperado es que ambas escrituras persistan o que ninguna permanezca tras un fallo.

**Rollback ante unchecked (núcleo).** Por defecto, una excepción unchecked dentro del método provoca rollback automático de toda la transacción. Al forzar el fallo del segundo `update` en el test, no queda ningún `cobro` ni el envío cambia de estado. Este comportamiento es la protección base del invariante de negocio.

**`rollbackFor` para checked (variante).** Las excepciones checked no revierten necesariamente: la pista muestra que una checked lanzada deja la fila confirmada pese a la excepción. La variante consiste en declarar `@Transactional(rollbackFor = TuExcepcionChecked.class)` para forzar el rollback también en ese caso. La decisión de qué excepciones revierten debe quedar documentada en la política.

**Límite local de base de datos (límite).** La transacción es un límite local de la base de datos, no una transacción distribuida entre PostgreSQL, Kafka y un servicio HTTP. Mantenerla abierta durante una llamada HTTP o una espera humana extiende indebidamente ese límite. El checklist exige que ninguna transacción abarque HTTP, archivos o espera; para coordinar efectos externos se usa outbox o saga.

**Deduplicación idempotente (decisión).** La liquidación de RutaFlow usa `operation_id` con restricción única para que un segundo envío de la misma operación no duplique el cobro. La decisión combina la restricción en base de datos con una lectura previa dentro de la misma transacción. Si falta la restricción o la lectura queda fuera de la transacción, el segundo intento duplica el cobro.

**Self-invocation del proxy (error frecuente).** El fallo deliberado mueve `@Transactional` a una llamada interna privada y verifica que el proxy no se aplica como se esperaba. Anotar un método privado o invocarlo desde otro método del mismo bean (self-invocation) no activa la interceptación. La corrección es devolver el límite transaccional al método público del bean, invocado desde fuera.

`@Transactional` se aplica mediante infraestructura/proxy de Spring al invocar un método gestionado. Por defecto, las excepciones unchecked provocan rollback; las checked no necesariamente. La anotación no surte el mismo efecto en una llamada interna al mismo objeto (self-invocation), ni debe cubrir llamadas lentas a sistemas externos.

La transacción es un límite local de base de datos, no una transacción distribuida entre PostgreSQL, Kafka y un servicio HTTP.

**Analogía:** `@Transactional` es como el carrito de la compra: vas añadiendo acciones y solo al pasar por caja (commit) se confirman todas juntas; si algo falla, el `rollback` vacía el carrito entero y no se cobra nada a medias. El límite de la transacción es hasta dónde llega ese carrito: no abarca una llamada HTTP a otra tienda.

#### Practica

**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/main/java/academia/envios/LiquidacionService.java` con el contenido de este tema.

```bash
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -o ejemplo.zip && unzip -o ejemplo.zip -d ejemplo
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
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.

En `@SpringBootTest`, fuerza el segundo paso a fallar (por ejemplo, con una restricción de test) y revisa ambas tablas. Ejecuta `./mvnw test -Dtest=LiquidacionServiceTest`.

**Resultado esperado:** ambas escrituras se confirman juntas, o ninguna permanece tras el fallo. **Fallo deliberado:** mueve `@Transactional` a una llamada interna privada y verifica que no se aplica el proxy como esperabas; devuelve el límite transaccional al método público del bean.

**Diagrama interactivo:** [Transacción JDBC: commit o rollback](/visuals/temas/spring-boot/modulo-17-tema-2-transacciones.html).

Prueba explícitamente una checked exception y decide si la política requiere `rollbackFor`. Añade un test de carrera con actualización optimista (`@Version`) o una actualización condicional atómica; documenta qué anomalía previenes.

**Pista:** lanza una checked exception (no una `RuntimeException`) dentro del método anotado con `@Transactional` y ejecuta el test; si la fila queda confirmada en la base de datos a pesar de la excepción, es porque Spring solo revierte automáticamente ante excepciones unchecked — necesitas `@Transactional(rollbackFor = TuExcepcionChecked.class)` para forzar el rollback también en ese caso.

#### Aplica

Implementa una liquidación de RutaFlow con deduplicación por `operation_id`. Incluye restricción única, rollback, segundo intento idempotente y una prueba donde una excepción de negocio no deja escrituras parciales.

**Checklist de salida.**

- [ ] `@Transactional` vive en un método público de un bean y se invoca desde fuera del propio objeto.
- [ ] `liquidar` inserta el cobro y actualiza el envío bajo el mismo commit.
- [ ] Al forzar el fallo del segundo `update`, no queda ningún `cobro` ni el envío cambia de estado.
- [ ] Una checked exception no revierte salvo `rollbackFor`, y la política queda documentada.
- [ ] La deduplicación por `operation_id` usa restricción única y el segundo intento es idempotente.
- [ ] Ninguna transacción abarca llamadas HTTP, archivos o espera humana.

**Si falla.** Si la segunda escritura falla y el cobro permanece, `@Transactional` no está interceptando: comprueba que el método es público y se invoca desde otro bean. Si una checked exception deja filas confirmadas, añade `rollbackFor` y documenta la política. Si el segundo intento duplica el cobro, falta la restricción única sobre `operation_id` o la lectura previa no forma parte de la misma transacción.

Entrega test de rollback, test de repetición y nota sobre el límite transaccional para el proyecto integrador de RutaFlow. **Cuándo no usarlo:** no mantengas una transacción abierta durante HTTP, archivos o espera humana; usa outbox/saga para coordinar efectos externos.

Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

**Errores comunes:** anotar con `@Transactional` un método privado o invocarlo desde otro método del mismo bean (self-invocation) esperando que el proxy de Spring lo intercepte igual, y mantener la transacción abierta mientras se espera una respuesta HTTP o se escribe en Kafka, extendiendo el límite transaccional fuera de la base de datos.

**Fuente oficial:** [documentación de Spring Boot](https://docs.spring.io/spring-boot/index.html).
