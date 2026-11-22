# Módulo 3: JDBC, JdbcClient y transacciones en Spring Boot

## Aprende construyendo

Spring Data JPA no elimina JDBC: es una capa sobre acceso relacional. En este módulo usarás `JdbcTemplate` para una consulta explícita y compararás sus límites transaccionales con las operaciones ORM.


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

### Tema 1: DataSource, JdbcTemplate y DAO · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por datasource, jdbctemplate y dao con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender datasource, jdbctemplate y dao te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en datasource, jdbctemplate y dao como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que datasource, jdbctemplate y dao resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| DataSource, JdbcTemplate y DAO se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar DataSource, JdbcTemplate y DAO | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses datasource, jdbctemplate y dao por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: datasource, jdbctemplate y dao funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- DataSource, JdbcTemplate y DAO existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve datasource, jdbctemplate y dao en tu contexto?
2. ¿Cómo sabrías que datasource, jdbctemplate y dao no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar datasource, jdbctemplate y dao?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
./mvnw -Dtest=EnvioJdbcRepositoryTest#insertaYBuscaConParametroYMapeaUnaFila test
```

```java
return jdbc.query(
    "select referencia, estado from envio where referencia = ?",
    mapper,
    referencia
);
```

```bash
./mvnw -Dtest=EnvioJdbcRepositoryTest#entradaConComillasSeTrataComoDato test
```

```bash
./mvnw -Dtest=EnvioJdbcRepositoryTest#insertaYBuscaConParametroYMapeaUnaFila test
```

```bash
./mvnw -Dtest=EnvioJdbcRepositoryTest#aceptaSoloColumnasDeOrdenamientoPermitidas test
```

</details>

### Tema 2: `JdbcClient`: la API fluida de Spring para SQL explícito · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por `jdbcclient`: la api fluida de spring para sql explícito con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender `jdbcclient`: la api fluida de spring para sql explícito te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en `jdbcclient`: la api fluida de spring para sql explícito como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que `jdbcclient`: la api fluida de spring para sql explícito resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `JdbcClient`: la API fluida de Spring para SQL explícito se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar `JdbcClient`: la API fluida de Spring para SQL explícito | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses `jdbcclient`: la api fluida de spring para sql explícito por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: `jdbcclient`: la api fluida de spring para sql explícito funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- `JdbcClient`: la API fluida de Spring para SQL explícito existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve `jdbcclient`: la api fluida de spring para sql explícito en tu contexto?
2. ¿Cómo sabrías que `jdbcclient`: la api fluida de spring para sql explícito no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar `jdbcclient`: la api fluida de spring para sql explícito?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
./mvnw -q -Dtest=EnvioJdbcClientRepositoryTest test
```

```java
package academia.pedidos;

public record ConteoPorEstado(String estado, long total) { }
```

```java
public List<ConteoPorEstado> contarPorEstado() {
    return jdbc.sql("select estado, count(*) as total from envio group by estado order by estado")
        .query(ConteoPorEstado.class)
        .list();
}
```

```java
@Test
void agrupaPorEstado() {
    envios.crear("RT-3", "EN_RUTA");
    assertThat(envios.contarPorEstado()).containsExactly(
        new ConteoPorEstado("EN_RUTA", 2),
        new ConteoPorEstado("PENDIENTE", 1));
}
```

</details>

### Tema 3: `@Transactional`, rollback y límites de transacción · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por `@transactional`, rollback y límites de transacción con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender `@transactional`, rollback y límites de transacción te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en `@transactional`, rollback y límites de transacción como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que `@transactional`, rollback y límites de transacción resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `@Transactional`, rollback y límites de transacción se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar `@Transactional`, rollback y límites de transacción | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses `@transactional`, rollback y límites de transacción por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: `@transactional`, rollback y límites de transacción funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- `@Transactional`, rollback y límites de transacción existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve `@transactional`, rollback y límites de transacción en tu contexto?
2. ¿Cómo sabrías que `@transactional`, rollback y límites de transacción no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar `@transactional`, rollback y límites de transacción?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
./mvnw -Dtest=LiquidacionServiceTest#confirmaCobroYEstadoDentroDeLaMismaTransaccion test
```

```bash
./mvnw -Dtest=LiquidacionServiceTest#revierteElCobroSiLaActualizacionDelEnvioNoEncuentraFila test
```

```bash
./mvnw -Dtest=LiquidacionServiceTest#rollbackForTambienRevierteUnaExcepcionChecked test
```

```bash
./mvnw -Dtest=LiquidacionServiceTest#revierteElCobroSiLaActualizacionDelEnvioNoEncuentraFila test
```

</details>
