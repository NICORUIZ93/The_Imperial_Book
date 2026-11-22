# Módulo 6: Testing en Spring Boot

Probar en Spring Boot no es elegir entre unitario o integración; es elegir el slice correcto. Cada anotación de test levanta un contexto diferente, con costo y fidelidad distintos. Este módulo enseña a probar con velocidad y confianza.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Spring Boot 3.5.0, JUnit 5, Mockito, Testcontainers (Docker 29.9.3 disponible).

## Aprende construyendo

### Tema 1: Probar un controller con `@WebMvcTest` · Intermedio · 30 min

Caso guía: validar contrato HTTP del controller sin levantar toda la app.

#### `@WebMvcTest`

**Definición formal.** Slice test que carga capa web MVC (controllers, filters, converters) y mocks de dependencias colaboradoras.

**Cómo funciona por dentro.** Arranca un contexto reducido de Spring MVC; no carga repositorios JPA completos salvo configuración específica. Usas `MockMvc` para simular requests.

```mermaid
flowchart LR
  T[@WebMvcTest] --> MVC[Contexto MVC reducido]
  MVC --> C[Controller real]
  C --> S[Servicio @MockBean]
```

**Ejemplo mínimo (patrón).**

```java
@WebMvcTest(GuiaController.class)
class GuiaControllerTest {
  @Autowired MockMvc mvc;
  @MockBean GuiaService service;
  @Test void devuelve200() throws Exception {
    when(service.buscar("G1")).thenReturn(new GuiaDto("G1"));
    mvc.perform(get("/guias/G1")).andExpect(status().isOk());
  }
}
```

**Error común.** Usar `@SpringBootTest` para todo. Lento y ruidoso. Corrección: slice test primero.

**Nota de verificación.** Ejecutable en proyecto Boot 3.5.x con `spring-boot-starter-test`.

### Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest` · Avanzado · 30 min

Caso guía: la query derivada funciona en H2 pero falla en PostgreSQL por dialecto.

#### `@DataJpaTest`

**Definición formal.** Slice para JPA: configura repositorios, entidades, EntityManager y transacción rollback por defecto.

**Regla.** Usa la misma base de datos real del entorno de producción para tests críticos de queries/migraciones.

**Ejemplo mínimo (Testcontainers).**

```java
@Testcontainers
@DataJpaTest
class GuiaRepoTest {
  @Container static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16");
}
```

**Error común.** Confiar solo en H2 para queries SQL específicas de Postgres. Corrección: Testcontainers Postgres.

**Nota de verificación.** Docker disponible; ejecución real es lab pesado. No inventar salida.

### Tema 3: Integrar el flujo con `@SpringBootTest` · Avanzado · 30 min

Caso guía: validar que controller + service + repo + config funcionan juntos.

#### `@SpringBootTest`

**Definición formal.** Levanta el contexto completo de Spring Boot para pruebas de integración/end-to-end dentro del proceso.

**Trade-off.** Máxima fidelidad, mayor costo. Úsalo para pocos flujos críticos.

**Ejemplo mínimo.**

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class FlujoIT { @Test void smoke() { /* call endpoint */ } }
```

**Error común.** Tests lentos por contexto completo en cada clase sin reutilización/cuidado. Corrección: limitar @SpringBootTest, usar slices y Testcontainers reutilizables.

### Tema 4: `RestTestClient`: el cliente de pruebas HTTP de Spring Boot 4 · Avanzado · 35 min

Caso guía: probar endpoint HTTP con API fluida moderna.

#### `RestTestClient`

**Definición formal.** Cliente de pruebas HTTP introducido en el ecosistema Spring Boot 4 / Spring Framework moderno para tests web; API fluida para requests/assertions.

**Nota de versión.** En Boot 3.5.x el estándar común es `MockMvc`, `WebTestClient` o `TestRestTemplate`. No asumir `RestTestClient` disponible sin confirmar versión.

**Ejemplo mínimo (Boot 4 style, conceptual).**

```java
restTestClient.get().uri("/guias/G1").exchange().expectStatus().isOk();
```

**Error común.** Copiar ejemplos de Boot 4 en proyecto Boot 3. Corrección: verificar versión y dependencia.

### Tema 5: Contenedores Testcontainers reutilizados entre clases · Avanzado · 35 min

Caso guía: suite de integración con muchos tests; levantar Postgres por clase es lento.

#### Reutilización de contenedores

**Definición formal.** Patrón para compartir un contenedor entre tests/clases, reduciendo tiempo de arranque, manteniendo aislamiento de datos.

**Regla.** Reutilizar contenedor no significa compartir estado sucio. Limpia datos por test/transacción.

**Error común.** Tests dependientes del orden por datos residuales. Corrección: transacción rollback, truncado controlado o fixtures aisladas.

**Nota de verificación.** Docker 29.9.3 disponible; lab reproducible con Testcontainers.

## Cierre

Elige el test por costo/fidelidad: unitario para lógica, slice para borde, integración completa para flujos críticos.

## Checklist

- Uso `@WebMvcTest` para controllers.
- Uso `@DataJpaTest` con DB real cuando importa.
- Limito `@SpringBootTest`.
- Verifico versión antes de usar `RestTestClient`.
- Aíslo datos en Testcontainers.
