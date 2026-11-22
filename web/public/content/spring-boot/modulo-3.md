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

**Caso guía**: necesitas un reporte SQL preciso sin mapear todo con JPA.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `DataSource` | Fábrica de conexiones JDBC administrada (pool). | Obtener conexiones eficientemente. | Usar pool (HikariCP por defecto en Boot). | Abrir conexiones manuales sin pool. |
| `JdbcTemplate` | Template Spring sobre JDBC que maneja boilerplate. | SQL explícito con menos ruido. | Parametrizar con `?`/args. | Concatenar SQL. |
| DAO/Repository JDBC | Componente que encapsula SQL. | Aislar acceso a datos. | Retornar modelos de dominio/DTO, no `ResultSet`. | Lógica de negocio en DAO. |
| RowMapper | Función que mapea fila a objeto. | Conversión explícita. | Manejar columnas/aliases con cuidado. | Asumir orden de columnas frágil. |

**Implementación desde cero** (Boot + `spring-boot-starter-jdbc` + H2)
```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-jdbc</artifactId></dependency>
<dependency><groupId>com.h2database</groupId><artifactId>h2</artifactId><scope>runtime</scope></dependency>
```
```java
@Repository
public class TareaJdbcDao {
  private final JdbcTemplate jdbc;
  public TareaJdbcDao(JdbcTemplate jdbc){ this.jdbc = jdbc; }
  public List<String> titulosPrioridadAlta() {
    return jdbc.query("select titulo from tareas where prioridad >= ? order by id",
      (rs, i) -> rs.getString("titulo"), 5);
  }
}
```
**Ejecución real**: `./mvnw spring-boot:run` con H2 y datos seed; consulta DAO retorna lista. **Verificación**: log SQL/H2 console; prueba con parámetro distinto.

### Tema 2: `JdbcClient`: la API fluida de Spring para SQL explícito · Intermedio · 35 min

**Caso guía**: mismo SQL, pero con API más legible que `JdbcTemplate`.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `JdbcClient` | API fluida de Spring Framework 6.1+ para JDBC. | Legibilidad sobre `JdbcTemplate`. | Parametrizar por nombre o posición. | Construir SQL por string. |
| SQL explícito | Escribes la consulta. | Control total, rendimiento, reportes. | Usar para queries específicas. | Reemplazar todo ORM por SQL sin necesidad. |
| Mapeo | `query(Class)`/`RowMapper`. | Convertir filas. | DTO/record para proyección. | Mapear entidades complejas manualmente mal. |
| `optional()`/`list()` | Terminales de consulta. | Modelar 0..1 o 0..n. | Usar `optional()` para único. | `single()` cuando puede no existir sin manejar. |

**Implementación desde cero**
```java
@Repository
public class TareaJdbcClientDao {
  private final JdbcClient jdbc;
  public TareaJdbcClientDao(JdbcClient jdbc){ this.jdbc = jdbc; }
  public Optional<String> tituloPorId(long id){
    return jdbc.sql("select titulo from tareas where id = :id")
      .param("id", id).query(String.class).optional();
  }
}
```
**Ejecución real**: `./mvnw -Dtest=TareaJdbcClientDaoTest test` o endpoint que lo llame. **Verificación**: id inexistente retorna `Optional.empty()`.

### Tema 3: `@Transactional`, rollback y límites de transacción · Avanzado · 35 min

**Caso guía**: dos inserts; si el segundo falla, el primero debe revertirse.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@Transactional` | Demarca transacción declarativa (proxy AOP). | Atomicidad en límites de servicio. | Poner en capa servicio. | Ponerlo en método privado/internal call (no proxy). |
| Rollback | Reversión ante error. | Consistencia. | Por defecto runtime unchecked; configurar checked si aplica. | Tragar excepción y esperar rollback. |
| Límites de transacción | Dónde inicia/termina tx. | Diseñar atomicidad. | Tx cortas, sin IO externo lento dentro. | Llamar API externa dentro de tx larga. |
| Propagación | Comportamiento ante tx existente (`REQUIRED`, `REQUIRES_NEW`). | Composición. | Elegir conscientemente. | Asumir REQUIRED siempre correcto. |

**Implementación desde cero**
```java
@Service
public class RegistroService {
  private final JdbcTemplate jdbc;
  public RegistroService(JdbcTemplate jdbc){ this.jdbc = jdbc; }
  @Transactional
  public void registrar(String a, String b){
    jdbc.update("insert into tareas(titulo,prioridad) values (?,1)", a);
    if ("FAIL".equals(b)) throw new RuntimeException("boom");
    jdbc.update("insert into tareas(titulo,prioridad) values (?,1)", b);
  }
}
```
**Ejecución real**
```bash
./mvnw -Dtest=RegistroServiceTxTest test
```
Test verifica que tras excepción, count no cambia. **Verificación**: quitar `@Transactional` y observar inserción parcial.

