# Módulo 17: JDBC, DAO y transacciones

## Aprende construyendo

Este módulo construye una capa JDBC pequeña y verificable. El objetivo es entender lo que un ORM automatiza y qué garantías siguen siendo responsabilidad del programa.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** busca una referencia con `PreparedStatement`, inserta una fila y comprueba encontrado/ausente en H2.
- **Caso RutaFlow:** liquida un envío bajo una clave de idempotencia. En una sola transacción inserta el movimiento, cambia el estado y registra `operation_id` con restricción `UNIQUE`; dos solicitudes concurrentes con la misma clave deben producir un solo cobro.

No confundas seguridad SQL con consistencia: parametrizar evita que el valor se interprete como SQL; la transacción y la clave única protegen invariantes de negocio y reintentos. Compara ambos niveles en pruebas separadas.

### Tema 1: JDBC, PreparedStatement y DAO

#### Paso 1 · Objetivo y preparación

Al finalizar podrás consultar e insertar registros usando `DataSource`, `PreparedStatement` y un DAO con responsabilidades acotadas. Requiere JDK 25+. El ejemplo ejecutable usa H2 y está en `examples/java-jpa-lab/`.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

Un proceso importa referencias de envíos que contienen caracteres introducidos por usuarios. Concatenar la referencia dentro del SQL puede alterar la consulta; además, repetir SQL y mapeo en servicios distintos produce lógica inconsistente.

#### Paso 3 · Teoría y modelo mental

JDBC es la API estándar para ejecutar SQL desde Java. `DataSource` abstrae la obtención de conexiones y normalmente usa un pool; `PreparedStatement` separa el SQL de sus valores y permite enlazarlos como parámetros. El DAO encapsula SQL y mapeo para que el servicio no conozca `ResultSet`.

Un parámetro preparado protege valores, no nombres dinámicos de tabla u ordenamiento. Para ordenar por una columna elegida por el usuario, usa una lista permitida explícita.
**Analogía:** un `PreparedStatement` es como un formulario con casillas fijas donde solo rellenas los huecos: nadie puede "reescribir" las preguntas (por eso frena la inyección SQL). El DAO es la ventanilla única que sabe rellenar ese formulario, de modo que el resto de la app no toca SQL directamente.
#### Paso 4 · Demostración guiada

#### Subtema 1.1: Buscar una referencia con parámetro · 10 min

**1. Contexto**

Una referencia con comillas debe buscarse como dato, no convertirse en parte de la consulta SQL.

**2. Hazlo tú**

Abre `examples/java-jpa-lab/src/main/java/academia/pedidos/EnvioDao.java`:

```java
package academia.pedidos;

import javax.sql.DataSource;
import java.sql.*;
import java.util.Optional;

public final class EnvioDao {
    private final DataSource dataSource;

    public EnvioDao(DataSource dataSource) { this.dataSource = dataSource; }

    public Optional<String> buscarEstado(String referencia) throws SQLException {
        String sql = "select estado from envio where referencia = ?";
        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, referencia);
            try (ResultSet result = statement.executeQuery()) {
                return result.next()
                    ? Optional.of(result.getString("estado"))
                    : Optional.empty();
            }
        }
    }
}
```

Ejecuta el test que comprueba hallado, ausente y texto hostil como valor literal:

```bash
cd examples/java-jpa-lab
./mvnw -q -Dtest=EnvioDaoTest#consultaConParametroYDevuelveAusenteSinError test
```

La prueba crea la tabla `envio` en H2 en memoria antes de ejecutarse.

**Resultado esperado:** encuentra `EN_PREPARACION` para la referencia existente y `Optional.empty()` para una ausente. **Fallo deliberado**: sustituye el `?` por concatenación y prueba una referencia como `' OR '1'='1`; el test debe exhibir por qué no se interpolan datos. **Diagnóstico:** el valor se está mezclando con el texto de la consulta; restaura `PreparedStatement` y confirma que la entrada maliciosa se trata como literal.

**3. Entiende**

El placeholder `?` separa el texto SQL del valor enviado; el DAO mantiene esa consulta fuera del servicio.

**4. Cierra**

Guarda la salida con referencia válida y hostil como literal.

#### Paso 5 · Práctica guiada

Agrega `crear(referencia, estado)` con `executeUpdate()` y comprueba el número de filas afectadas. Extrae el mapeo de filas a un método privado solo cuando haya más de una consulta que realmente lo comparta.
**Pista:** si `executeUpdate()` devuelve `0`, la fila no se insertó (clave duplicada o `DataSource` equivocado); compara ese conteo contra el `1` esperado antes de asumir que `crear` funcionó.

#### Subtema 1.2: Probar una entrada hostil como dato · 10 min

**1. Contexto**

Una referencia que contiene comillas debe buscarse como un valor literal.

**2. Hazlo tú**

En `examples/java-jpa-lab/src/test/java/academia/pedidos/EnvioDaoTest.java`, ejecuta el caso completo que prueba la referencia `RT-1` y el texto `' OR '1'='1`:

```bash
cd examples/java-jpa-lab
./mvnw -Dtest=EnvioDaoTest#consultaConParametroYDevuelveAusenteSinError test
```

La implementación completa está en `src/main/java/academia/pedidos/EnvioDao.java`: conserva `where referencia = ?` y `statement.setString(1, referencia)`.

**Resultado esperado:** `BUILD SUCCESS`; `RT-1` devuelve `PENDIENTE`, la referencia hostil devuelve `Optional.empty()`.

**Fallo deliberado**: concatena la referencia al SQL. **Resultado del fallo:** el texto hostil puede alterar la condición. **Diagnóstico:** el valor se está interpretando como parte de la consulta; restaura `PreparedStatement`.

**3. Entiende**

Las casillas `?` separan la consulta de los valores que llegan desde el usuario.

**4. Cierra**

Guarda el resultado de entrada válida y de texto hostil.

#### Paso 6 · Práctica independiente

Implementa un DAO con búsqueda paginada y ordenamiento por `fecha_creacion`. El tamaño de página debe tener límite y la columna de orden debe salir de una allowlist (`fecha_creacion`, `referencia`), no del SQL proporcionado por el usuario.

#### Subtema 1.3: Elegir una columna desde una allowlist · 10 min

**1. Contexto**

Los parámetros SQL no sustituyen nombres de columna; limita las opciones antes de formar el ORDER BY.

**2. Hazlo tú**

Crea `examples/java-jpa-lab/OrdenPermitido.java`:

```java
import java.util.Map;

public class OrdenPermitido {
    private static final Map<String, String> COLUMNAS = Map.of(
        "fecha", "fecha_creacion",
        "guia", "referencia"
    );
    static String consulta(String opcion) {
        String columna = COLUMNAS.get(opcion);
        if (columna == null) throw new IllegalArgumentException("Orden no permitida");
        return "select referencia, estado from envio order by " + columna;
    }
    public static void main(String[] args) {
        System.out.println(consulta("fecha"));
        try { consulta("fecha desc; drop table envio"); }
        catch (IllegalArgumentException e) { System.out.println(e.getMessage()); }
    }
}
```

Ejecuta `cd examples/java-jpa-lab && java OrdenPermitido.java`.

**Resultado esperado:** `select referencia, estado from envio order by fecha_creacion` y `Orden no permitida`.

**Fallo deliberado**: concatena directamente `opcion` en el SQL. **Resultado del fallo:** el texto incluye una instrucción que no estaba en las columnas admitidas. **Diagnóstico:** un identificador SQL dinámico debe elegirse de valores escritos por el programa.

**3. Entiende**

Pasa datos con `?`; elige nombres de columna con una lista permitida.

**4. Cierra**

Guarda la salida segura y el rechazo de la columna inyectada.

#### Paso 7 · Cierre y evidencia

Entrega el DAO, el `DataSource` de test y casos para hallado, ausente e input hostil como parte del proyecto integrador de RutaFlow, por ejemplo, para consultar reportes especializados; como siguiente paso agrupa varias escrituras relacionadas en una transacción. Errores comunes: concatenar valores directamente en el SQL en vez de usar `PreparedStatement`, permitir que el nombre de columna o el orden de una consulta provengan directamente de un parámetro del usuario sin una allowlist, y crear un DAO genérico que oculte consultas distintas detrás de operaciones vagas. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/PreparedStatement.html y https://jakarta.ee/specifications/persistence/.
**¿Por qué es importante?** Porque `PreparedStatement` permite consultas precisas sin sacrificar seguridad frente a datos hostiles, y un DAO con responsabilidades acotadas evita repetir SQL y mapeo inconsistente entre servicios distintos.
**Evidencia de aprendizaje:** entrega el DAO funcionando contra H2, el caso hallado/ausente, y el fallo deliberado de concatenación SQL corregido con `PreparedStatement`.
**Conceptos clave:** `DataSource`, `PreparedStatement`, DAO, allowlist de columnas, inyección SQL.

**Cuándo no usarlo:** no crees un DAO genérico que oculte consultas distintas detrás de operaciones vagas; para CRUD estándar, Spring Data puede reducir código repetitivo.

### Tema 2: Transacciones, ACID y aislamiento

#### Paso 1 · Objetivo y preparación

Al finalizar podrás hacer que dos escrituras relacionadas se confirmen juntas o se reviertan juntas. Necesitas el DAO anterior y una base de datos H2 o PostgreSQL.
**Conocimiento previo:** haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.
#### Paso 2 · Contexto y caso real

Al liquidar un envío se registra un cobro y se actualiza su estado. Si el proceso cae después del cobro pero antes del cambio de estado, el sistema queda inconsistente.

#### Paso 3 · Teoría y modelo mental

Una transacción agrupa operaciones bajo propiedades ACID: atomicidad, consistencia, aislamiento y durabilidad. JDBC comienza en autocommit normalmente; `setAutoCommit(false)`, `commit()` y `rollback()` permiten delimitar el trabajo. El aislamiento define qué cambios concurrentes se pueden observar; no asumas que `SERIALIZABLE` es siempre necesario ni gratuito.

La transacción es como una sola operación de caja: o se registran todas las líneas del recibo o se cancela el recibo entero.
**Analogía:** una transacción es como una transferencia bancaria: o se descuenta de una cuenta y se suma en la otra, o no pasa nada; nunca queda a medias. El aislamiento es la cortina que impide que otro cajero vea el saldo mientras la transferencia está a mitad de camino.
#### Paso 4 · Demostración guiada

#### Subtema 2.1: Confirmar dos escrituras juntas · 10 min

**1. Contexto**

Cobro y cambio de estado pertenecen a la misma operación de negocio.

**2. Hazlo tú**

Implementa en `src/main/java/academia/envios/LiquidacionDao.java` una operación que inserta un cobro y actualiza el envío usando **la misma conexión**:

```java
try (Connection connection = dataSource.getConnection()) {
    connection.setAutoCommit(false);
    try {
        insertarCobro(connection, referencia, importe);
        actualizarEstado(connection, referencia, "LIQUIDADO");
        connection.commit();
    } catch (SQLException error) {
        connection.rollback();
        throw error;
    }
}
```

En el mismo laboratorio, ejecuta la prueba que confirma cobro y estado juntos:

```bash
cd examples/java-jpa-lab
./mvnw -q -Dtest=EnvioDaoTest#confirmaLasDosEscriturasJuntas test
```

**Resultado esperado:** cobro y estado se guardan juntos. Para observar el rollback cuando falta el envío, ejecuta `./mvnw -q -Dtest=EnvioDaoTest#revierteElCobroSiNoExisteElEnvio test`; debe quedar cero cobros en la tabla.

**Fallo deliberado**: quita connection.rollback() y repite el caso de envío inexistente. **Diagnóstico**: el cobro parcial confirma que una excepción intermedia debe deshacer ambas escrituras.

**3. Entiende**

Ambas escrituras deben usar la misma conexión y confirmarse juntas.

**4. Cierra**

Conserva el test del commit y el test de rollback.

#### Paso 5 · Práctica guiada

Prueba dos operaciones concurrentes que actualizan el mismo saldo. Reproduce una actualización perdida y corrígela con bloqueo optimista (`version`) o con una operación atómica SQL. Compara `READ_COMMITTED` con el aislamiento predeterminado de tu base.
**Pista:** si ambas transacciones leen el saldo antes de que la otra confirme su escritura, la segunda sobrescribe silenciosamente el cambio de la primera (actualización perdida); agrega una columna `version` y compara su valor en el `UPDATE ... WHERE version = ?` para detectar el conflicto.

#### Subtema 2.2: Comprobar que el commit guardó ambos cambios · 10 min

**1. Contexto**

El test comprueba estado e importe después de cerrar la transacción.

**2. Hazlo tú**

Ejecuta el caso en `examples/java-jpa-lab/src/test/java/academia/pedidos/EnvioDaoTest.java`:

```bash
cd examples/java-jpa-lab
./mvnw -Dtest=EnvioDaoTest#confirmaLasDosEscriturasJuntas test
```

Abre el test para observar las dos comprobaciones: `buscarEstado("RT-1")` y la lectura del importe guardado en `cobro`.

**Resultado esperado:** `BUILD SUCCESS`; estado `LIQUIDADO` e importe `27.50`.

**Fallo deliberado**: quita `connection.commit()`. **Resultado del fallo:** las escrituras se pierden al cerrarse la conexión. **Diagnóstico:** autocommit se desactivó y ninguna orden confirmó el trabajo.

**3. Entiende**

Una transacción manual necesita un commit en el camino correcto.

**4. Cierra**

Guarda la salida de commit y rollback.

#### Paso 6 · Práctica independiente

Construye un caso de transferencia entre dos cuentas: valida importe positivo, descuenta una y acredita la otra de forma atómica. Añade pruebas para saldo insuficiente, cuenta inexistente y fallo entre las dos escrituras. Documenta qué invariantes protege la transacción.

#### Subtema 2.3: Revertir el cobro si no existe el envío · 10 min

**1. Contexto**

Un cobro sin envío válido no debe quedar guardado.

**2. Hazlo tú**

Ejecuta `revierteElCobroSiNoExisteElEnvio` en `examples/java-jpa-lab/src/test/java/academia/pedidos/EnvioDaoTest.java`:

```bash
cd examples/java-jpa-lab
./mvnw -Dtest=EnvioDaoTest#revierteElCobroSiNoExisteElEnvio test
```

El caso completo comprueba que `liquidar("RT-404", ...)` falla y que el conteo de filas en `cobro` es cero.

**Resultado esperado:** `BUILD SUCCESS`; la excepción explica que falta el envío y no queda ningún cobro parcial.

**Fallo deliberado**: elimina `connection.rollback()`. **Resultado del fallo:** el cobro puede quedar escrito antes de detectar que el envío no existe. **Diagnóstico:** el error intermedio debe deshacer todas las operaciones de la conexión.

**3. Entiende**

Rollback conserva la regla de negocio completa aunque el segundo paso falle.

**4. Cierra**

Guarda el error esperado y confirma que la tabla de cobros quedó vacía.

#### Paso 7 · Cierre y evidencia

Entrega la prueba del rollback, el test concurrente y una explicación del aislamiento elegido para el proyecto integrador de RutaFlow: una liquidación no debe actualizar el estado sin registrar su movimiento; con esto cerrás el módulo. Errores comunes: mantener una transacción abierta mientras se hacen llamadas HTTP u otras operaciones lentas, asumir que `SERIALIZABLE` es siempre necesario sin medir el costo de contención, y no probar el escenario de fallo a mitad de transacción, solo el camino feliz. Fuentes oficiales: https://docs.oracle.com/en/java/javase/25/docs/api/java.sql/java/sql/Connection.html y https://jakarta.ee/specifications/persistence/.
**¿Por qué es importante?** Porque las transacciones convierten varias escrituras relacionadas en una sola unidad de negocio recuperable: si el proceso falla a mitad de camino, el `rollback` garantiza que no quede ningún cambio parcial, nunca un estado a medio actualizar.
**Evidencia de aprendizaje:** entrega el test del rollback sin escrituras parciales tras un fallo intermedio, y el test de actualización concurrente con su corrección (bloqueo optimista o la operación atómica elegida).
**Conceptos clave:** ACID, `setAutoCommit(false)`, `commit`/`rollback`, nivel de aislamiento, bloqueo optimista.

**Cuándo no usarlo:** no mantengas una transacción abierta mientras haces llamadas HTTP; coordinar una transacción local con otros servicios requiere patrones como outbox o saga.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
