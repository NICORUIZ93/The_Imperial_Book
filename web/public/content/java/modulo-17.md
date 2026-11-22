# Módulo 17: JDBC, DAO y transacciones

## Aprende construyendo

Este módulo construye una capa JDBC pequeña y verificable. El objetivo es entender lo que un ORM automatiza y qué garantías siguen siendo responsabilidad del programa.


### Dos ejemplos: primero visible, luego real

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por dos ejemplos: primero visible, luego real con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender dos ejemplos: primero visible, luego real te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en dos ejemplos: primero visible, luego real como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que dos ejemplos: primero visible, luego real resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Dos ejemplos: primero visible, luego real se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Dos ejemplos: primero visible, luego real | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses dos ejemplos: primero visible, luego real por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: dos ejemplos: primero visible, luego real funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Dos ejemplos: primero visible, luego real existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve dos ejemplos: primero visible, luego real en tu contexto?
2. ¿Cómo sabrías que dos ejemplos: primero visible, luego real no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar dos ejemplos: primero visible, luego real?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar dos ejemplos: primero visible, luego real.

</details>

### Tema 1: JDBC, PreparedStatement y DAO · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás consultar e insertar registros usando DataSource, PreparedStatement y un DAO con responsabilidades acotadas. Requiere JDK 25+. El ejemplo ejecutable usa H2 y está en el código de este tema. Conocimiento previo: SQL básico (CREATE TABLE, INSERT, SELECT) y el en…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás consultar e insertar registros usando DataSource, PreparedStatement y un DAO con responsabilidades acotadas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en jdbc, preparedstatement y dao como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que jdbc, preparedstatement y dao resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| JDBC, PreparedStatement y DAO se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar JDBC, PreparedStatement y DAO | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses jdbc, preparedstatement y dao por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: jdbc, preparedstatement y dao funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- JDBC, PreparedStatement y DAO existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve jdbc, preparedstatement y dao en tu contexto?
2. ¿Cómo sabrías que jdbc, preparedstatement y dao no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar jdbc, preparedstatement y dao?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
./mvnw -q -Dtest=EnvioDaoTest#consultaConParametroYDevuelveAusenteSinError test
```

```bash
./mvnw -Dtest=EnvioDaoTest#consultaConParametroYDevuelveAusenteSinError test
```

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

</details>

### Tema 2: Transacciones, ACID y aislamiento · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás hacer que dos escrituras relacionadas se confirmen juntas o se reviertan juntas. Necesitas el DAO anterior y una base de datos H2 o PostgreSQL. Conocimiento previo: haber seguido el tema anterior de este módulo y tener instalado el entorno del stack.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás hacer que dos escrituras relacionadas se confirmen juntas o se reviertan juntas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en transacciones, acid y aislamiento como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que transacciones, acid y aislamiento resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Transacciones, ACID y aislamiento se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Transacciones, ACID y aislamiento | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses transacciones, acid y aislamiento por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: transacciones, acid y aislamiento funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Transacciones, ACID y aislamiento existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve transacciones, acid y aislamiento en tu contexto?
2. ¿Cómo sabrías que transacciones, acid y aislamiento no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar transacciones, acid y aislamiento?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
./mvnw -q -Dtest=EnvioDaoTest#confirmaLasDosEscriturasJuntas test
```

```bash
./mvnw -Dtest=EnvioDaoTest#confirmaLasDosEscriturasJuntas test
```

```bash
./mvnw -Dtest=EnvioDaoTest#revierteElCobroSiNoExisteElEnvio test
```

</details>
