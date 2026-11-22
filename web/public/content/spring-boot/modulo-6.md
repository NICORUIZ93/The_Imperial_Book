# Módulo 6: Testing en Spring Boot

Este módulo cubre pruebas por capa en Spring Boot: web slice, data slice, integración completa, clientes HTTP de test y Testcontainers. El objetivo es confianza rápida con el costo adecuado.

**Entorno de referencia (2026-05-22):** JDK 27, Maven 3.10.0, Docker 29.9.3. Testcontainers requiere Docker; los slices requieren dependencias Spring Boot Test.

## Aprende construyendo

### Tema 1: Probar un controller con `@WebMvcTest` · Intermedio · 30 min

Caso guía: validar status/body/validación HTTP sin cargar toda la app.

#### `@WebMvcTest`

**Definición formal.** Slice test de Spring Boot que carga componentes MVC relevantes (controllers, advice, converters) y mockea colaboradores.

**Para qué sirve.** Tests rápidos de capa web.

**Cuándo usarlo.** Para contratos HTTP. No para lógica de negocio profunda ni persistencia real.

**Ejemplo mínimo enfocado (Spring).**

```java
@WebMvcTest(EnvioController.class)
class EnvioControllerTest {
  @Autowired MockMvc mvc;
  @MockitoBean EnvioService service;
  @Test void ok() throws Exception { when(service.consultar("A1")).thenReturn("ok"); mvc.perform(get("/envios/A1")).andExpect(status().isOk()).andExpect(content().string("ok")); }
}
```

**Caso de uso real.** Verificar 400 ante request inválido.

**Error común.** Cargar `@SpringBootTest` para algo que es web slice. Corrección: usar slice adecuado.

**Verificación.** **Nota:** requiere dependencias Spring Boot test; evidencia test verde.

### Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest` · Avanzado · 30 min

Caso guía: validar queries JPA contra BD real.

#### `@DataJpaTest`

**Definición formal.** Slice test para componentes JPA; configura repositorios, EntityManager y normalmente transacciones rollback.

**Para qué sirve.** Probar mapeo y queries con infraestructura JPA real.

**Cuándo usarlo.** Repositorios/queries personalizadas. Usa BD real (Testcontainers) para paridad.

**Ejemplo mínimo enfocado (Spring).**

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
class EnvioRepoTest { @Autowired EnvioRepository repo; @Test void guarda(){ repo.save(new Envio("A1")); assertTrue(repo.findByCodigo("A1").isPresent()); } }
```

**Caso de uso real.** Verificar JPQL/fetch join.

**Error común.** Usar H2 para todo y asumir paridad con PostgreSQL. Corrección: Testcontainers con misma BD.

**Verificación.** **Nota:** requiere Docker/Testcontainers.

### Tema 3: Integrar el flujo con `@SpringBootTest` · Avanzado · 30 min

Caso guía: probar flujo completo con contexto.

#### `@SpringBootTest`

**Definición formal.** Test que levanta el contexto Spring Boot completo (o porciones configuradas) para pruebas de integración.

**Para qué sirve.** Validar wiring, configuración y flujos end-to-end internos.

**Cuándo usarlo.** Pocos tests de integración críticos. No para todo: es más lento.

**Ejemplo mínimo enfocado (Spring).**

```java
@SpringBootTest(webEnvironment = RANDOM_PORT)
class AppIT { @Autowired TestRestTemplate rest; @Test void health(){ assertEquals(200, rest.getForEntity("/actuator/health", String.class).getStatusCode().value()); } }
```

**Caso de uso real.** Smoke test de arranque y endpoint.

**Error común.** Usar solo E2E lento. Corrección: pirámide de tests.

**Verificación.** **Nota:** requiere app y dependencias; evidencia test verde.

### Tema 4: `RestTestClient`: el cliente de pruebas HTTP de Spring Boot 4 · Avanzado · 35 min

Caso guía: probar endpoints HTTP con cliente fluido.

#### Cliente HTTP de test

**Definición formal.** Cliente orientado a pruebas para ejecutar requests HTTP contra MockMvc o servidor arrancado y hacer aserciones fluidas.

**Para qué sirve.** Tests legibles de API.

**Cuándo usarlo.** Cuando el proyecto usa la API de test moderna disponible en su versión de Spring/Boot.

**Ejemplo mínimo enfocado (conceptual).**

```java
// RestTestClient/WebTestClient según stack
client.get().uri("/envios/A1").exchange().expectStatus().isOk().expectBody(String.class).isEqualTo("ok");
```

**Caso de uso real.** Contrato REST.

**Error común.** Acoplar tests a detalles internos. Corrección: asertar contrato HTTP observable.

**Verificación.** **Nota:** depende de versión de Spring Boot/Framework; validar clase disponible.

### Tema 5: Contenedores Testcontainers reutilizados entre clases · Avanzado · 35 min

Caso guía: acelerar integración reutilizando contenedor.

#### Testcontainers reusable

**Definición formal.** Uso de contenedores Docker efímeros controlados por tests; la reutilización permite compartir contenedor entre ejecuciones/configuraciones.

**Para qué sirve.** Paridad con infraestructura real y velocidad razonable.

**Cuándo usarlo.** Integración con BD/brokers reales. Requiere Docker.

**Ejemplo mínimo enfocado (Spring/Testcontainers).**

```java
@Testcontainers
class RepoIT { @Container @ServiceConnection static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine"); }
```

**Caso de uso real.** PostgreSQL real en CI.

**Error común.** Asumir que Docker siempre disponible. Corrección: marcar/skip y documentar prerequisito.

**Verificación.** **Nota:** Docker disponible en entorno actual (29.9.3), pero ejecutar contenedor requiere imagen/red; evidencia al correr test.

## Cierre del módulo

Elige el slice más barato que dé confianza: unit, `@WebMvcTest`, `@DataJpaTest`, integración con Testcontainers, y pocos `@SpringBootTest` end-to-end.
