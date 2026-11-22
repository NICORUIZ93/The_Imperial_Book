# Módulo 4: Persistencia con Spring Data JPA

Este módulo continúa el backend `academia-spring` creado en los módulos 1 y 2. Ejecuta los ejemplos con la base H2 de pruebas; el test comprueba datos reales, no repositorios simulados.

**Prerrequisito sin Spring:** el lado propietario de una relación, las cascadas y el conteo básico de N+1 se enseñan una sola vez, en [Java M16 T1–T2](/curso/java/16), con el mismo laboratorio `java-jpa-lab`. Aquí se usa ese modelo mental y se añade lo propio de Spring Data: repositorios derivados, `@EntityGraph`, páginas DTO y migraciones.

**Referencia ejecutable al terminar los módulos 2 y 4–7:** en la raíz del repositorio, abre `README.md`. Incluye el estado final y pruebas; algunas clases incorporan cambios de módulos posteriores. Construye primero las prácticas de este módulo y usa la referencia para comparar y diagnosticar.

## Aprende construyendo


### Tema 1: Entidades y repositorios derivados · Intermedio · 30 min

**Caso guía**: CRUD de tareas con Spring Data JPA sin escribir SQL para casos simples.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Entidad JPA | `@Entity` mapeada a tabla. | Modelo persistente. | `@Id`, constructor protegido. | Usar entidad como DTO. |
| `JpaRepository` | Repositorio Spring Data con CRUD/paginación. | Productividad. | Usar para CRUD estándar. | Lógica de negocio en repositorio. |
| Query derivada | Método cuyo nombre define consulta (`findByEstado`). | Consultas simples legibles. | Nombres claros, límites. | Nombres kilométricos/ambiguos. |
| `ddl-auto`/esquema | Hibernate puede crear/validar esquema. | Dev rápido. | `create-drop` solo dev/test; prod con migraciones. | `create-drop` en producción. |

**Implementación desde cero**
```java
@Entity @Table(name="tareas")
public class Tarea { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) Long id; String titulo; int prioridad; protected Tarea(){} public Tarea(String t,int p){titulo=t;prioridad=p;} /*getters*/ }
public interface TareaRepository extends JpaRepository<Tarea,Long> { List<Tarea> findByPrioridadGreaterThanEqual(int prioridad); }
```
```yaml
spring: { jpa: { hibernate: { ddl-auto: create-drop } }, h2: { console: { enabled: true } } }
```
**Ejecución real**: `./mvnw spring-boot:run`, crear y listar tareas. **Verificación**: método derivado genera SQL esperado en logs.

### Tema 2: El problema N+1 y su corrección · Intermedio · 35 min

**Caso guía**: listar tareas con autor provoca 1 query por tareas + N por autores.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| N+1 | Patrón de consulta ineficiente por lazy loading en bucle. | Detectar performance bug. | Activar SQL log y medir. | No verlo hasta producción. |
| `LAZY`/`EAGER` | Momento de carga de asociación. | Controlar fetch. | Default LAZY en colecciones; cuidado con EAGER. | EAGER everywhere. |
| `JOIN FETCH` | JPQL que trae asociación en misma query. | Corregir N+1. | Usar en casos de uso de lectura específicos. | Join fetch múltiple de colecciones cartesianas. |
| `@EntityGraph` | Plan de fetch declarativo. | Alternativa a join fetch. | Por query/caso de uso. | EntityGraph gigante. |

**Implementación desde cero**
```java
@Query("select t from Tarea t join fetch t.autor")
List<Tarea> findAllConAutor();
```
**Ejecución real**: con `spring.jpa.show-sql=true`, comparar endpoint antes/después. **Verificación**: número de selects baja de 1+N a 1 (o pocos controlados).

### Tema 3: Más allá del N+1: el límite de LAZY y páginas DTO · Intermedio · 40 min

**Caso guía**: paginar entidades con colecciones fetch-join rompe paginación o explota memoria.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Límite de LAZY | Lazy fuera de sesión lanza `LazyInitializationException`. | Entender boundary de transacción. | Cargar lo necesario en servicio/consulta. | `Open Session In View` ocultando diseño. |
| Paginación DTO/proyección | Consulta devuelve solo campos necesarios. | Eficiencia en listados. | `interface` projection/DTO JPQL. | Paginar entidad pesada con grafo grande. |
| `Page` + fetch join colección | Problemático en Hibernate (paginación en memoria). | Evitar trampas. | Dos consultas: ids paginados + fetch por ids. | Ignorar warning de Hibernate. |
| Proyecciones | DTOs específicos por caso de uso. | Contratos eficientes. | Read models separados. | Reusar entidad para todo. |

**Implementación desde cero**
```java
public record TareaResumen(Long id, String titulo) {}
@Query("select new com.example.demo.TareaResumen(t.id,t.titulo) from Tarea t")
Page<TareaResumen> resumir(Pageable pageable);
```
**Ejecución real**: endpoint de listado retorna página DTO. **Verificación**: SQL selecciona solo columnas necesarias.

### Tema 4: Migraciones con Flyway · Intermedio · 30 min

**Caso guía**: evolucionar esquema sin `ddl-auto`.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Flyway | Herramienta de migraciones versionadas SQL. | Evolución de esquema reproducible. | Scripts `V1__...sql` inmutables tras aplicar. | Editar migración ya aplicada. |
| `ddl-auto=validate` | Hibernate valida esquema vs entidades. | Detectar drift. | Usar con Flyway en prod. | `update` en producción. |
| Baseline/versionado | Historial de esquema. | Trazabilidad. | Una migración por cambio. | Cambios manuales no versionados. |
| Migración reversible/forward | Estrategia de cambios. | Seguridad operacional. | Preferir forward compatible. | Drops destructivos sin plan. |

**Implementación desde cero**
```xml
<dependency><groupId>org.flywaydb</groupId><artifactId>flyway-core</artifactId></dependency>
```
`src/main/resources/db/migration/V1__crear_tareas.sql`
```sql
CREATE TABLE tareas (id BIGSERIAL PRIMARY KEY, titulo VARCHAR(200) NOT NULL, prioridad INT NOT NULL);
```
```yaml
spring.jpa.hibernate.ddl-auto: validate
```
**Ejecución real**: `./mvnw spring-boot:run`; Flyway aplica V1. **Verificación**: tabla `flyway_schema_history` contiene versión.

### Tema 5: Spring Data MongoDB: documentos, consultas derivadas y cuándo elegir un modelo de documentos · Intermedio · 45 min

**Caso guía**: guardar eventos de tracking con estructura flexible por tipo.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Documento (MongoDB) | Registro JSON/BSON en colección. | Modelos flexibles/anidados. | Modelar por consultas. | Usar Mongo como si fuera relacional con joins everywhere. |
| Spring Data MongoDB | Repositorios y template para Mongo. | Productividad. | `MongoRepository`, `MongoTemplate`. | Ignorar índices. |
| Consultas derivadas Mongo | `findByCampo` en repositorio. | Consultas simples. | Índices para campos consultados. | Scan completo en colección grande. |
| Cuándo elegir documentos | Datos anidados, esquema variable, escala horizontal. | Buen fit. | No elegir por moda. | Perder transacciones/relaciones fuertes necesarias. |

**Implementación desde cero** (con Testcontainers o Mongo local)
```java
@Document("eventos")
public class Evento { @Id String id; String guiaId; String tipo; Instant ocurrido; Map<String,Object> payload; }
public interface EventoRepository extends MongoRepository<Evento,String> { List<Evento> findByGuiaIdOrderByOcurridoDesc(String guiaId); }
```
**Ejecución real**: con Mongo corriendo, `./mvnw -Dtest=EventoRepositoryTest test`. **Verificación**: consulta por `guiaId` devuelve ordenado; explicar cuándo NO usar documentos (transacciones relacionales fuertes, joins complejos).

