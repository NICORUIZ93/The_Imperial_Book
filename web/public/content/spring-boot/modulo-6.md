# Módulo 6: Testing en Spring Boot

Este módulo compara pruebas de MVC, persistencia e integración. Cada tema debe indicar qué capas ejecuta y qué deja fuera; la evidencia funcional está en las respuestas y fallos observados.

**Referencia ejecutable al terminar los módulos 2 y 4–7:** en la raíz del repositorio, abre `README.md`. Incluye el estado final y pruebas; algunas clases incorporan cambios de módulos posteriores. Construye primero las prácticas de este módulo y usa la referencia para comparar y diagnosticar.

## Aprende construyendo


### Tema 1: Probar un controller con `@WebMvcTest` · Intermedio · 30 min

**Caso guía**: validar contrato HTTP del controller sin levantar toda la app.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@WebMvcTest` | Slice test de capa web MVC. | Probar controllers, validación, JSON, status. | Mockear dependencias del controller. | Esperar que cargue repos JPA reales. |
| `MockMvc` | Cliente de pruebas HTTP simulado. | Ejecutar requests sin servidor real. | Assert status, body, headers. | Solo verificar 200. |
| Mock de dependencias | `@MockitoBean`/mock para servicios. | Aislar controller. | Stub comportamiento relevante. | Sobre-mockear detalles internos. |
| Contrato HTTP | Status, body, content-type, errores. | Regresión de API. | Probar casos felices y de error. | No testear 400/404. |

**Implementación desde cero**
```java
@WebMvcTest(TareaController.class)
class TareaControllerTest {
  @Autowired MockMvc mvc;
  @MockitoBean ServicioTareas servicio;
  @Test void crea() throws Exception {
    when(servicio.crear(any())).thenReturn(new TareaDTO(1L,"A",1));
    mvc.perform(post("/api/tareas").contentType(MediaType.APPLICATION_JSON).content("{\"titulo\":\"A\",\"prioridad\":1}"))
      .andExpect(status().isCreated()).andExpect(jsonPath("$.id").value(1));
  }
}
```
**Ejecución real**: `./mvnw -Dtest=TareaControllerTest test`. **Verificación**: falla si cambias status o shape JSON.

### Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest` · Avanzado · 30 min

**Caso guía**: query JPA funciona en H2 pero falla en Postgres.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@DataJpaTest` | Slice test JPA con rollback por defecto. | Probar repositorios/mappings. | Usar BD real cuando hay diferencias dialecto. | Confiar solo en H2 para prod Postgres. |
| Testcontainers PostgreSQL | Contenedor efímero real para tests. | Fidelidad de entorno. | Docker activo; imagen fija. | Test flaky por Docker no disponible no documentado. |
| `@Testcontainers`/`@Container` | Integración JUnit con contenedores. | Lifecycle automático. | Reutilizar contenedor con cuidado. | Contenedores caros por test. |
| Rollback/aislamiento | Cada test deja BD limpia. | Determinismo. | No depender de orden. | Datos compartidos entre tests. |

**Implementación desde cero**
```java
@DataJpaTest
@Testcontainers
class TareaRepositoryTest {
  @Container static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");
  @DynamicPropertySource static void props(DynamicPropertyRegistry r){ r.add("spring.datasource.url",pg::getJdbcUrl); r.add("spring.datasource.username",pg::getUsername); r.add("spring.datasource.password",pg::getPassword); }
  @Autowired TareaRepository repo;
  @Test void guardaYBusca(){ var t = repo.save(new Tarea("A",1)); assertThat(repo.findById(t.getId())).isPresent(); }
}
```
**Ejecución real**: `./mvnw -Dtest=TareaRepositoryTest test` (Docker requerido). **Verificación**: corre dos veces con mismo resultado.

### Tema 3: Integrar el flujo con `@SpringBootTest` · Avanzado · 30 min

**Caso guía**: controller+service+repo funcionan aislados pero el flujo real falla por configuración.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@SpringBootTest` | Carga contexto completo (o web environment). | Prueba de integración end-to-end interna. | Usar pocas, estratégicas. | Reemplazar todos los unit tests por esto. |
| `RANDOM_PORT` | Levanta servidor en puerto aleatorio. | Tests HTTP reales. | Inyectar `@LocalServerPort` o `TestRestTemplate`. | Puerto fijo en CI. |
| Test de flujo | Cubre múltiples capas juntas. | Confianza en integración. | Escenarios críticos. | Flujos gigantes y frágiles. |
| Coste/velocidad | Contexto completo es lento. | Balance pirámide de tests. | Más unit/slice, menos full. | Suite lenta. |

**Implementación desde cero**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class FlujoTareasTest {
  @LocalServerPort int port;
  @Test void creaYConsulta(){
    var client = HttpClient.newHttpClient();
    // POST /api/tareas luego GET /api/tareas/{id}
  }
}
```
**Ejecución real**: `./mvnw -Dtest=FlujoTareasTest test`. **Verificación**: valida 201 + 200 y cuerpo.

### Tema 4: `RestTestClient`: el cliente de pruebas HTTP de Spring Boot 4 · Avanzado · 35 min

**Caso guía**: tests HTTP legibles y fluentes contra app arrancada.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `RestTestClient` | Cliente de pruebas HTTP fluido de Spring Boot 4. | Tests end-to-end legibles. | Usar para contratos HTTP reales. | Confundir con `WebTestClient` reactivo sin contexto. |
| Assert fluido | Encadena expectativas status/body/header. | Legibilidad. | Verificar contrato completo. | Solo `expectStatus().isOk()`. |
| `@SpringBootTest` + web server | Necesario para HTTP real. | Integración. | Puerto random. | Dependencia en entorno externo. |
| Serialización JSON en test | Request/response body. | Contrato. | Usar DTOs/records. | Strings JSON frágiles enormes. |

**Implementación desde cero**
```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class TareasApiTest {
  @Autowired RestTestClient client;
  @Test void crear(){ client.post().uri("/api/tareas").contentType(MediaType.APPLICATION_JSON).bodyValue(new CrearTareaRequest("A",1)).exchange().expectStatus().isCreated().expectBody().jsonPath("$.titulo").isEqualTo("A"); }
}
```
**Ejecución real**: `./mvnw -Dtest=TareasApiTest test`. **Verificación**: cambia contrato y el test falla.

### Tema 5: Contenedores Testcontainers reutilizados entre clases · Avanzado · 35 min

**Caso guía**: suite lenta porque cada clase levanta un Postgres nuevo.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Reutilización de contenedor | Un contenedor compartido por múltiples tests. | Velocidad. | Aislar datos; cuidado con estado. | Tests acoplados por datos residuales. |
| `static @Container` / singleton pattern | Patrón para compartir lifecycle. | Menos startup. | Limpiar datos por test. | Reutilizar sin limpiar. |
| `withReuse` (local) | Reutiliza contenedor entre ejecuciones JVM (opt-in). | Dev local rápido. | No asumir en CI. | Flakiness por estado previo. |
| Aislamiento de datos | Truncar tablas/transacciones. | Determinismo. | `@Sql`, rollback, cleanup. | Orden-dependencia. |

**Implementación desde cero**
```java
abstract class AbstractPgTest {
  static final PostgreSQLContainer<?> PG = new PostgreSQLContainer<>("postgres:16-alpine");
  static { PG.start(); }
  @DynamicPropertySource static void props(DynamicPropertyRegistry r){ r.add("spring.datasource.url",PG::getJdbcUrl); r.add("spring.datasource.username",PG::getUsername); r.add("spring.datasource.password",PG::getPassword); }
}
```
**Ejecución real**: `./mvnw test` con Docker. **Verificación**: tiempo menor vs contenedor por clase; datos aislados.

