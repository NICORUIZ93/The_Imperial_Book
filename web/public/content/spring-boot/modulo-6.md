# Módulo 6: Testing en Spring Boot

Este módulo compara pruebas de MVC, persistencia e integración. Cada tema debe indicar qué capas ejecuta y qué deja fuera; la evidencia funcional está en las respuestas y fallos observados.


**Referencia ejecutable al terminar los módulos 2 y 4–7:** en la raíz del repositorio, abre `examples/spring-tareas-rutaflow/README.md`. Incluye el estado final y pruebas; algunas clases incorporan cambios de módulos posteriores. Construye primero las prácticas de este módulo y usa la referencia para comparar y diagnosticar.

## Aprende construyendo

### Tema 1: Probar un controller con `@WebMvcTest` · Intermedio · 30 min

Reutiliza la API de tareas construida en M2 y la seguridad de M5. **¿Por qué es importante?** Un fallo del controller debe poder detectarse sin levantar PostgreSQL ni recorrer todas las capas. Este tema prueba la web sin llamar al repositorio y no crea otra aplicación ni otro servicio.

#### Subtema 1.1 · Recortar la prueba a la web · 10 min

**Contexto:** Un test de controller debe poder comprobar ruta, JSON y respuesta sin conectarse a PostgreSQL. `@WebMvcTest(TareaController.class)` prepara MVC y ese controller. No registra automáticamente `@Service`; declara el colaborador simulado con `@MockitoBean`.

**Hazlo tú:** En el proyecto acumulativo, crea `src/test/java/com/example/demo/TareaControllerSliceTest.java`:

```java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TareaController.class)
@AutoConfigureMockMvc(addFilters = false)
class TareaControllerSliceTest {
    @Autowired MockMvc mockMvc;
    @MockitoBean ServicioTareas servicio;

    @Test
    void creaTareaYDevuelve201() throws Exception {
        when(servicio.crear(any(CrearTareaRequest.class)))
            .thenReturn(new TareaDTO(7L, "Comprar leche", 3));

        mockMvc.perform(post("/api/tareas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"titulo\":\"Comprar leche\",\"prioridad\":3}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(7))
            .andExpect(jsonPath("$.titulo").value("Comprar leche"))
            .andExpect(jsonPath("$.prioridad").value(3));
    }
}
```

Ejecuta desde la raíz del proyecto:

```bash
./mvnw -q -Dtest=TareaControllerSliceTest test
```

**Resultado esperado:** El test pasa con `201` y el DTO esperado; el repositorio real no participa en esta petición.


**Fallo deliberado:** Cambia la expectativa HTTP del test de 201 a 200 y repite la clase. **Diagnóstico:** el controller cumple 201; la expectativa 200 produce una aserción roja, no un fallo de PostgreSQL. Restaura 201.

**Entiende:** El mock sustituye al servicio, pero MVC convierte el JSON y ejecuta el controller. MockMvc no abre un puerto.

**Cierra:** Registra status y campos observados y escribe qué dependencia quedó simulada.

#### Subtema 1.2 · Ver la validación y el error JSON · 10 min

**Contexto:** Una respuesta inválida también forma parte del contrato HTTP. El proyecto ya tiene `@Valid` en `TareaController` y `GlobalExceptionHandler` convierte el error de `@NotBlank` en el `ApiError` acordado (`codigo`, `mensaje`, `campos`).

**Hazlo tú:** En el mismo archivo, agrega este método a `TareaControllerSliceTest`:

```java
@Test
void devuelveApiErrorCuandoElTituloEstaEnBlanco() throws Exception {
    mockMvc.perform(post("/api/tareas")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"titulo\":\" \",\"prioridad\":3}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.codigo").value("VALIDACION"))
        .andExpect(jsonPath("$.campos.titulo").value("Escribe un título."));
}
```

Vuelve a ejecutar `./mvnw -q -Dtest=TareaControllerSliceTest test`.

Archivo concreto para esta comprobación: `src/test/java/com/example/demo/TareaControllerSliceTest.java`.

**Resultado esperado:** Los dos métodos pasan; el segundo ve `400`, `VALIDACION` y el mensaje del campo. El servicio no necesita configurarse para este caso: la validación del request ocurre antes de llamar al controller.


**Fallo deliberado:** Quita @Valid del argumento de creación del controller y repite el caso de título vacío. **Diagnóstico:** sin validación de entrada ya no obtienes el ApiError acordado; restaura @Valid.

**Entiende:** La validación de Bean Validation ocurre antes del servicio. Una petición inválida no necesita una respuesta configurada en el mock.

**Cierra:** Conserva el caso válido y el 400 con mensaje de campo, ambos correctos.

#### Subtema 1.3 · Diagnosticar una dependencia que falta · 10 min

**Contexto:** Un slice no significa “Spring simula todas las dependencias”. El controller todavía necesita un bean que satisfaga `ServicioTareas`.

**Hazlo tú:** Quita solo `@MockitoBean` de esta línea, conserva el campo y ejecuta el método de creación:

```java
ServicioTareas servicio;
```

```bash
./mvnw -q -Dtest=TareaControllerSliceTest#creaTareaYDevuelve201 test
```

**Fallo deliberado:** El contexto no carga y el log contiene `NoSuchBeanDefinitionException: No qualifying bean of type 'com.example.demo.ServicioTareas'`. **Diagnóstico:** Restaura `@MockitoBean` y comprueba que los dos métodos vuelven a pasar.


**Resultado esperado:** la mutación produce el fallo descrito; restaurado el código, la clase de pruebas vuelve a pasar. Conserva ambas salidas.

**Entiende:** @MockitoBean registra un colaborador para el slice; un campo Java sin esa anotación no crea un bean ni satisface el constructor.

**Cierra:** Guarda el error de dependencia ausente y la suite verde tras restaurar el mock.

#### Entiende y cierra

`MockMvc` envía una petición de prueba a la infraestructura MVC sin abrir un puerto. `@WebMvcTest` incorpora controller, conversión JSON, validación y advice relevante; el mock decide qué devuelve el colaborador. En Boot 4 los imports son `org.springframework.boot.webmvc.test.autoconfigure.*`, y `@MockitoBean` viene de Spring Test. `@AutoConfigureMockMvc(addFilters = false)` se usa aquí porque aislamos el contrato del controller; por ello estos métodos **no** prueban JWT ni autorización. Esa cobertura pertenece a M5 y debe mantenerse aparte.

**Evidencia para avanzar:** dos métodos pasan, el fallo por retirar el mock se identifica y revierte, y puedes explicar qué cubre esta prueba y qué queda fuera. No uses este slice para afirmar que repositorio, base de datos, seguridad o todas las capas funcionan juntas; para eso se necesitan pruebas de integración apropiadas. Documentación primaria: [Spring Boot 4.1.2 — `@WebMvcTest`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/webmvc/test/autoconfigure/WebMvcTest.html) y [Spring Boot 4.1.2 — `@AutoConfigureMockMvc`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/webmvc/test/autoconfigure/AutoConfigureMockMvc.html).


**Aplicación y decisión:** Práctica para el proyecto integrador: añade una petición con prioridad inválida al slice y comprueba 400 antes de llamar al servicio. Este límite de alcance excluye PostgreSQL y JWT; no abras la seguridad real para hacer pasar un test de contrato.

### Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest` · Avanzado · 30 min

**¿Por qué es importante?** El repositorio puede parecer correcto en H2 y fallar con el motor usado en producción. Este slice carga entidades y repositorios; Testcontainers añade una instancia desechable del PostgreSQL elegido.

#### Subtema 2.1 · Conectar el slice a un PostgreSQL desechable · 10 min

**Contexto:** `@DataJpaTest` configura JPA y repositorios, y suele elegir una base embebida si está disponible. Para probar PostgreSQL de verdad, el test debe enlazar URL, usuario y contraseña del contenedor antes de que Spring cree el `DataSource`.

**Hazlo tú:** En el proyecto acumulativo de M2, agrega al `pom.xml` estas dependencias de prueba. El driver PostgreSQL no viene dentro de Testcontainers. Si el proyecto ejecuta migraciones con Flyway, agrega también su módulo PostgreSQL con alcance `runtime`:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-postgresql</artifactId>
    <version>2.0.5</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers-junit-jupiter</artifactId>
    <version>2.0.5</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

Crea `src/test/java/com/example/demo/TareaRepositoryPostgresTest.java`:

```java
package com.example.demo;

import javax.sql.DataSource;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers
class TareaRepositoryPostgresTest {
    @Container
    static final PostgreSQLContainer postgres =
        new PostgreSQLContainer("postgres:16-alpine");

    @DynamicPropertySource
    static void conectarPostgres(DynamicPropertyRegistry properties) {
        properties.add("spring.datasource.url", postgres::getJdbcUrl);
        properties.add("spring.datasource.username", postgres::getUsername);
        properties.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired TareaRepository tareas;
    @Autowired DataSource dataSource;
}
```

Ejecuta el test desde la raíz del proyecto:

```bash
./mvnw -q -DskipTests test-compile
```

**Resultado esperado:** Maven termina con `BUILD SUCCESS`; `test-compile` verifica nombres de artefacto, package Boot 4, paquete actual de PostgreSQLContainer y tipos antes de necesitar un runtime de contenedores.


**Fallo deliberado:** Escribe testcontainers-postgre en lugar de testcontainers-postgresql en pom.xml y ejecuta test-compile. **Diagnóstico:** Maven no resuelve el artefacto; contrasta el nombre completo antes de investigar una conexión que aún no se intentó. Restaura el artefacto.

**Entiende:** Compilar confirma tipos y dependencias; no inicia PostgreSQL ni verifica sus consultas.

**Cierra:** Conserva compilación correcta y la configuración de URL dinámica antes de iniciar el contenedor.

#### Subtema 2.2 · Comprobar motor y operación del repositorio · 10 min

**Contexto:** Que el test se llame “PostgreSQL” no prueba qué base abrió Spring. Comprueba el producto por JDBC y luego guarda y consulta una tarea con el repositorio real.

**Hazlo tú:** Agrega ambos métodos a `TareaRepositoryPostgresTest`:

```java
@Test
void postgresEsLaBaseDeDatosConectada() throws Exception {
    try (var connection = dataSource.getConnection()) {
        assertThat(connection.getMetaData().getDatabaseProductName())
            .isEqualTo("PostgreSQL");
    }
}

@Test
void guardaYConsultaContraPostgres() {
    Tarea guardada = tareas.saveAndFlush(
        new Tarea("Caja térmica", 2, "BODEGA-A"));

    assertThat(tareas.findByPrioridadGreaterThanEqual(2))
        .extracting(Tarea::getId)
        .contains(guardada.getId());
}
```

En un entorno con Docker Engine o una API compatible activa, ejecuta:

```bash
./mvnw -q -Dtest=TareaRepositoryPostgresTest test
```

Archivo concreto para esta comprobación: `src/test/java/com/example/demo/TareaRepositoryPostgresTest.java`.

**Resultado esperado:** Pasan dos pruebas: el driver informa `PostgreSQL` y el repositorio devuelve la tarea guardada. `@DataJpaTest` abre una transacción por método y la revierte al terminar. El campo `static` comparte un contenedor entre los métodos de esta clase; la prueba no certifica todas las consultas ni todas las versiones de PostgreSQL.


**Fallo deliberado:** En postgresEsLaBaseDeDatosConectada, espera H2 en lugar de PostgreSQL y ejecuta el test. **Diagnóstico:** el metadato real responde PostgreSQL y rechaza la expectativa; restaura PostgreSQL.

**Entiende:** El motor se verifica desde la conexión, no desde el nombre del test. El rollback por método no reemplaza todas las pruebas de concurrencia.

**Cierra:** Guarda motor informado, entidad persistida y consulta que la recupera.

#### Subtema 2.3 · Detectar que el test cayó en H2 · 10 min

**Contexto:** Si no publicas las propiedades del contenedor, `@DataJpaTest` puede usar H2 y darte una falsa sensación de compatibilidad.

**Hazlo tú:** Retira temporalmente el método `conectarPostgres` completo y ejecuta solo esta prueba:

```bash
./mvnw -q -Dtest=TareaRepositoryPostgresTest#postgresEsLaBaseDeDatosConectada test
```

**Fallo deliberado:** Flyway registra `jdbc:h2:mem:...`; la aserción falla porque esperaba `PostgreSQL` y recibió `H2`. **Diagnóstico:** Restaura `conectarPostgres` y ejecuta de nuevo los dos tests.


**Resultado esperado:** la mutación produce el fallo descrito; restaurado el código, la clase de pruebas vuelve a pasar. Conserva ambas salidas.

**Entiende:** Sin propiedades dinámicas, la presencia de H2 en el classpath puede cambiar el motor usado por el slice. La aserción JDBC hace visible esa diferencia.

**Cierra:** Repite ambos tests tras restaurar las propiedades y guarda el nombre del producto conectado.

#### Entiende y cierra

`@DataJpaTest` configura el slice de datos, no el controller ni la aplicación completa. `@DynamicPropertySource` entrega al `DataSource` la dirección y credenciales que Testcontainers asigna al contenedor. `Replace.NONE` conserva esa conexión real. El módulo `flyway-database-postgresql` es necesario en este proyecto porque Flyway separa el soporte específico del motor; agregar solo el starter Flyway no bastó para iniciar migraciones contra PostgreSQL.

**Evidencia para avanzar:** el test compila, las dos pruebas pasan contra PostgreSQL y, al retirar propiedades dinámicas, se observa H2 y la aserción falla. El equipo requiere Docker o un runtime compatible configurado; si no está disponible, reporta por separado compilación y ejecución. Documentación primaria: [Spring Boot 4.1.2 — `@DataJpaTest`](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html#testing.spring-boot-applications.spring-data-jpa-tests), [Spring Boot 4.1.2 — `@AutoConfigureTestDatabase`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/jdbc/test/autoconfigure/AutoConfigureTestDatabase.html), [Testcontainers — PostgreSQL](https://java.testcontainers.org/modules/databases/postgres/) y [Testcontainers — JUnit 5](https://java.testcontainers.org/test_framework_integration/junit_5/).


**Aplicación y decisión:** Práctica para el proyecto integrador: agrega una consulta por prioridad vacía y verifica el resultado en PostgreSQL. Conserva la aserción del producto JDBC; no sustituyas el motor por H2 para evitar la infraestructura requerida.

### Tema 3: Integrar el flujo con `@SpringBootTest` · Avanzado · 30 min

**¿Por qué es importante?** Un controller y un repositorio pueden pasar sus pruebas por separado y aun así fallar al conectarse. Una prueba de contexto completo comprueba un flujo crítico atravesando la aplicación configurada.

#### Subtema 3.1 · Crear y consultar con las capas reales · 10 min

**Contexto:** M6 T1 simuló `ServicioTareas`; M6 T2 aisló el repositorio con PostgreSQL. Ahora conecta controller, resource server JWT, servicio y repositorio. Para este ejemplo, las pruebas usan H2 configurado en `src/test/resources/application.properties`.

**Hazlo tú:** Crea `src/test/java/com/example/demo/TareaFlowEndToEndTest.java`:

```java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static com.jayway.jsonpath.JsonPath.read;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TareaFlowEndToEndTest {
    @Autowired MockMvc mockMvc;
    @Autowired JwtService jwtService;

    @Test
    void creaConJwtYLeeLaTareaPersistida() throws Exception {
        String token = jwtService.generar("curso@rutaflow.dev", "DRIVER");

        MvcResult creada = mockMvc.perform(post("/api/tareas")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"titulo\":\"Caja térmica\",\"prioridad\":2}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.titulo").value("Caja térmica"))
            .andReturn();

        String id = read(creada.getResponse().getContentAsString(), "$.id").toString();
        mockMvc.perform(get("/api/tareas/{id}", id)
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(Long.parseLong(id)))
            .andExpect(jsonPath("$.titulo").value("Caja térmica"));
    }
}
```

Ejecuta desde la raíz del proyecto:

```bash
./mvnw -q -Dtest=TareaFlowEndToEndTest test
```

**Resultado esperado:** El POST responde `201`; el GET posterior responde `200` con el mismo ID y título. El request lleva un JWT firmado con el `JwtService` real. No hay mocks: el `TareaController` llama a `ServicioTareas`, que guarda y consulta con `TareaRepository`.


**Fallo deliberado:** Quita la cabecera Authorization de la creación y repite el test del flujo. **Diagnóstico:** la seguridad impide llegar al servicio y ya no se recibe 201; restaura el JWT.

**Entiende:** El contexto completo combina seguridad, MVC, servicio y repositorio. Con MockMvc no se verifica un cliente HTTP externo y H2 no equivale a PostgreSQL.

**Cierra:** Conserva ID creado y JSON del GET que recupera la misma tarea.

#### Subtema 3.2 · Separar error de autenticación y flujo válido · 10 min

**Contexto:** Un caso autenticado que funciona no prueba el rechazo de peticiones anónimas.

**Hazlo tú:** Agrega este método al mismo test:

```java
@Test
void exigeTokenParaConsultarTareas() throws Exception {
    mockMvc.perform(get("/api/tareas"))
        .andExpect(status().isUnauthorized());
}
```

Vuelve a ejecutar `./mvnw -q -Dtest=TareaFlowEndToEndTest test`.

Archivo concreto para esta comprobación: `src/test/java/com/example/demo/TareaFlowEndToEndTest.java`.

**Resultado esperado:** Pasan dos métodos: la ruta completa autenticada y el `401` sin token. El primero usa la firma real del JWT, pero crea el token directamente; no prueba el endpoint de login. `MockMvc` ejercita MVC y los filtros en memoria, sin iniciar un servidor ni probar navegador, proxy o TLS.


**Fallo deliberado:** Añade un JWT válido a la petición que debe comprobar ausencia de autenticación. **Diagnóstico:** el caso deja de representar un cliente anónimo y ya no demuestra 401; restaura la ausencia de token.

**Entiende:** Un 401 indica ausencia o invalidez de credencial; un 403 exige estudiar permisos. No los intercambies para hacer pasar una prueba.

**Cierra:** Guarda por separado el flujo autenticado y el rechazo anónimo.

#### Subtema 3.3 · Ver qué integración detecta el test · 10 min

**Contexto:** Un `201 Created` puede ocultar que el servicio nunca guardó los datos.

**Hazlo tú:** En `src/main/java/com/example/demo/ServicioTareas.java`, sustituye temporalmente el cuerpo de `crear` por:

```java
public TareaDTO crear(CrearTareaRequest request) {
    return new TareaDTO(999L, request.titulo(), request.prioridad());
}
```

Ejecuta solo `./mvnw -q -Dtest=TareaFlowEndToEndTest#creaConJwtYLeeLaTareaPersistida test`.

**Fallo deliberado:** El POST todavía devuelve `201`, pero el GET falla: esperaba `200` y recibió `404`, porque la tarea falsa nunca pasó por el repositorio. **Diagnóstico:** Restaura el cuerpo original de `ServicioTareas.crear` y verifica los dos métodos en verde.


**Resultado esperado:** la mutación produce el fallo descrito; restaurado el código, la clase de pruebas vuelve a pasar. Conserva ambas salidas.

**Entiende:** Responder un DTO creado a mano no demuestra persistencia. El GET posterior comprueba que el efecto atravesó el repositorio.

**Cierra:** Conserva el contraste 201 seguido de 404 durante la mutación y la recuperación del GET al restaurar.

#### Entiende y cierra

`@SpringBootTest` crea el contexto de la aplicación desde `DemoApplication`. Con `@AutoConfigureMockMvc`, usa el contexto completo y MockMvc, pero no abre un puerto. El test confirma que varias piezas del backend colaboran en una operación. Los unit tests aíslan lógica pequeña; los slices prueban MVC o persistencia; esta prueba verifica el cableado de un flujo. Conserva pocas pruebas de este tipo y elige rutas críticas: tienen más componentes que arrancar y sus fallos requieren investigar varias capas. Para probar un servidor real, certificados o puertos, usa `@SpringBootTest(webEnvironment = RANDOM_PORT)` con un cliente HTTP.

**Evidencia para avanzar:** los dos métodos pasan, el token real atraviesa el resource server, el POST se lee después de persistirse y el fallo por saltar el repositorio se diagnostica y revierte. La base de este ejemplo es H2; la prueba PostgreSQL de M6 T2 cubre el motor real. Documentación primaria: [Spring Boot 4.1.2 — `@SpringBootTest` y pruebas MVC](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html) y [Spring Framework — MockMvc](https://docs.spring.io/spring/reference/testing/mockmvc.html).

**Aplicación y decisión:** Práctica del proyecto integrador: demuestra que una petición rechazada no crea una fila. La diferencia entre flujo MockMvc y HTTP de red importa: pasar el primero no verifica proxy, TLS ni configuración del puerto publicado.

### Tema 4: `RestTestClient`: el cliente de pruebas HTTP de Spring Boot 4 · Intermedio · 35 min

Al terminar, podrás escribir el flujo del Tema 3 con `RestTestClient`, ejecutarlo primero contra MockMvc y luego contra un servidor real en un puerto aleatorio, y reemplazar un `TestRestTemplate` heredado.

**¿Por qué es importante?** En Spring Boot 4, `@SpringBootTest` ya no crea automáticamente un `TestRestTemplate`, y la guía de migración recomienda `RestTestClient`. Es una sola API fluida (petición → `exchange()` → expectativas) que funciona igual sobre MockMvc o sobre HTTP real: puedes empezar rápido en memoria y cambiar a red cuando necesites probar el puerto, los filtros del contenedor o la serialización completa.

**Prerrequisitos:** Tema 3 de este módulo (`TareaFlowEndToEndTest`) y el `JwtService` del Módulo 5. Usa JDK 25 y Spring Boot 4.1.2.

#### Subtema X.1 · Escribe el flujo con `RestTestClient` sobre MockMvc · 10 min

**Contexto:** con MockMvc encadenas `perform(...).andExpect(...)` y extraes el JSON con `JsonPath` a mano. `RestTestClient` mantiene la misma infraestructura en memoria, pero con una API de cliente HTTP.

**Hazlo tú:** añade a `pom.xml` el módulo de pruebas que contiene la autoconfiguración (sin versión; la fija el BOM de Boot):

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-resttestclient</artifactId>
    <scope>test</scope>
</dependency>
```

Crea `src/test/java/com/example/demo/TareaRestTestClientTest.java`:

```java
package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.client.RestTestClient;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureRestTestClient
class TareaRestTestClientTest {
    @Autowired RestTestClient client;
    @Autowired JwtService jwtService;

    @Test
    void creaYLeeLaTareaConUnCliente() {
        String bearer = "Bearer " + jwtService.generar("curso@rutaflow.dev", "DRIVER");

        TareaDTO creada = client.post().uri("/api/tareas")
            .header("Authorization", bearer)
            .contentType(MediaType.APPLICATION_JSON)
            .body(new CrearTareaRequest("Caja térmica", 2))
            .exchange()
            .expectStatus().isCreated()
            .expectBody(TareaDTO.class)
            .returnResult()
            .getResponseBody();
        assertNotNull(creada);

        client.get().uri("/api/tareas/{id}", creada.id())
            .header("Authorization", bearer)
            .exchange()
            .expectStatus().isOk()
            .expectBody()
            .jsonPath("$.titulo").isEqualTo("Caja térmica");
    }
}
```

Ejecuta `./mvnw -q -Dtest=TareaRestTestClientTest test`.

**Resultado esperado:** verde. El cuerpo se convierte de `TareaDTO` a JSON con el `JsonMapper` de Boot y de vuelta, sin `JsonPath.read` manual.

**Fallo deliberado:** quita `@AutoConfigureRestTestClient`. **Error esperado:** el contexto falla con `No qualifying bean of type 'org.springframework.test.web.servlet.client.RestTestClient'`. **Diagnóstico:** el cliente no se crea por defecto; la anotación lo registra. Restáurala.

**Entiende:** con `@AutoConfigureMockMvc` presente, `RestTestClient` usa MockMvc como "servidor": no abre puerto y comparte el contexto de la prueba. `expectBody(TareaDTO.class)` deserializa; `expectBody()` sin tipo permite `jsonPath(...)`.

**Cierra:** compara el número de líneas con `TareaFlowEndToEndTest` y anota qué parte se simplificó.

#### Subtema X.2 · Ejecuta la misma prueba contra un servidor real · 10 min

**Contexto:** MockMvc no abre sockets: no prueba el puerto, la compresión ni los filtros que solo existen en el contenedor de servlets. Cambiar a servidor real con `RestTestClient` es cambiar una anotación, no reescribir la prueba.

**Hazlo tú:** copia la clase como `TareaRestTestClientServidorTest.java` y cambia solo la cabecera de la clase:

```java
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class TareaRestTestClientServidorTest {
    // mismo cuerpo que TareaRestTestClientTest
}
```

Ejecuta `./mvnw -q -Dtest=TareaRestTestClientServidorTest test`.

**Resultado esperado:** verde. En el log aparece `Tomcat started on port` con un puerto distinto de 8080; el cliente resuelve las rutas relativas contra ese puerto.

**Fallo deliberado:** añade `@Transactional` (de `org.springframework.transaction.annotation`) a la clase y una segunda prueba que cuente tareas esperando 0 al final. **Error esperado:** la cuenta no vuelve a 0. **Diagnóstico:** con servidor real, la petición se atiende en otro hilo y en otra transacción; el rollback de la prueba no deshace lo que hizo el servidor. Quita `@Transactional` y limpia los datos explícitamente si lo necesitas.

**Entiende:** `RANDOM_PORT` evita conflictos entre ejecuciones paralelas. Úsalo para pocas pruebas críticas: arrancar Tomcat cuesta más y los datos persisten entre pruebas.

**Cierra:** registra el puerto usado y la diferencia de transacciones entre los dos modos.

#### Subtema X.3 · Reemplaza un `TestRestTemplate` heredado · 8 min

**Contexto:** encontrarás proyectos de Boot 3 con `@Autowired TestRestTemplate`. Al subir a Boot 4 esas pruebas dejan de arrancar.

**Hazlo tú:** en una prueba temporal con `RANDOM_PORT`, escribe `@Autowired org.springframework.boot.resttestclient.TestRestTemplate rest;` sin ninguna anotación adicional y ejecuta.

**Resultado esperado:** **error:** `No qualifying bean of type '...TestRestTemplate'`. Boot 4 solo lo crea con `@AutoConfigureTestRestTemplate`, y además necesita `spring-boot-restclient` en tiempo de ejecución.

**Fallo deliberado:** usa el paquete antiguo `org.springframework.boot.test.web.client.TestRestTemplate`. **Error esperado:** `package org.springframework.boot.test.web.client does not exist` al compilar. **Diagnóstico:** la clase se movió a `org.springframework.boot.resttestclient`.

**Entiende:** para código nuevo, migra a `RestTestClient`: misma idea, expectativas integradas y dos modos (MockMvc o red) con la misma API. `TestRestTemplate` se mantiene para no romper suites grandes de golpe. Borra la prueba temporal.

**Cierra:** anota los dos pasos mínimos para que una prueba antigua compile en Boot 4.

**Ejercicio:** añade a `TareaRestTestClientTest` una prueba que verifique el `401` sin token y que la respuesta incluya la cabecera `WWW-Authenticate`. Predice qué método de expectativas usarás.

<details>
<summary>Solución</summary>

```java
@Test
void sinTokenResponde401ConDesafioBearer() {
    client.get().uri("/api/tareas")
        .exchange()
        .expectStatus().isUnauthorized()
        .expectHeader().exists("WWW-Authenticate");
}
```

`expectHeader()` agrupa las comprobaciones de cabeceras igual que `expectStatus()` agrupa las de estado. La cabecera la escribe el resource server del Módulo 5.

</details>

**Hito del tema:**

- [ ] Ejecuté el flujo crear-y-leer con `RestTestClient` sobre MockMvc.
- [ ] Ejecuté la misma prueba con servidor real en `RANDOM_PORT`.
- [ ] Provoqué el fallo de `@Transactional` con servidor real y lo expliqué.
- [ ] Identifiqué los cambios necesarios para un `TestRestTemplate` heredado en Boot 4.

**Fuentes oficiales:** [Spring Boot — Testing Spring Boot applications (`RestTestClient`)](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html), [Spring Framework — `RestTestClient`](https://docs.spring.io/spring-framework/reference/testing/resttestclient.html) y [Spring Boot 4.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide).

**Proyecto integrador:** en RutaFlow, deja una sola prueba `RANDOM_PORT` para el flujo de crear envío y el resto en MockMvc. **Límite:** ninguna de las dos pruebas verifica TLS ni el proxy de producción; eso se comprueba en el despliegue (Módulo 19).

### Tema 5: Contenedores Testcontainers reutilizados entre clases · Avanzado · 35 min

**Objetivo observable:** hacer que dos clases JUnit consulten el mismo PostgreSQL Testcontainers dentro de una ejecución de pruebas y comparar el ID real observado por cada una.

**¿Por qué es importante?** Crear contenedores cuesta tiempo. Un singleton puede evitar arranques repetidos cuando varias clases necesitan la misma base; también significa que esas pruebas comparten estado y ciclo de vida.

**Antes de empezar:** conocer Testcontainers básico (Módulo 6). El laboratorio `examples/testcontainers-singleton-rutaflow/` usa Testcontainers 2.0.5, dos clases JUnit y Postgres. Solo ejecuta `SELECT 1`, no comparte filas modificadas.

**Comando:** desde esa carpeta, Docker compatible ejecuta `./mvnw -q test`. En macOS con Podman, sigue los comandos exactos del README para apuntar al socket local y desactivar Ryuk rootless.

```bash
cd examples/testcontainers-singleton-rutaflow
./mvnw -q test
```

#### Subtema 5.1: Arranca el singleton una sola vez · 8 min

**Contexto:** `@Container` estático comparte el contenedor entre métodos de una clase. El patrón singleton manual permite compartirlo entre varias clases que heredan una base común.

**Hazlo tú:** Abre `src/test/java/academia/rutaflow/containers/SharedPostgres.java`. Encuentra el campo estático y el bloque de arranque:

```java
static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

static {
    POSTGRES.start();
}
```

**Resultado esperado:** El contenedor comienza al cargar la clase base y las dos clases lectoras heredan la misma referencia.

**Fallo deliberado:** Quita temporalmente `POSTGRES.start()` y ejecuta la suite. **Diagnóstico:** Las dos clases fallan con `Mapped port can only be obtained after the container is started`. Restaura el bloque y vuelve a probar.

**Entiende:** Una sola cocina prepara comida para dos mesas; ambas dependen de que esa cocina exista. El cierre ocurre cuando termina la JVM de tests.

**Cierra:** Señala por qué esta base no lleva las anotaciones `@Testcontainers` y `@Container`.

#### Subtema 5.2: Comprueba la base desde cada clase · 8 min

**Contexto:** Que un ID exista no confirma que PostgreSQL acepte consultas. Cada clase ejecuta una consulta pequeña y guarda el ID que observó.

**Hazlo tú:** Abre `FirstRepositoryTest.java` y `SecondRepositoryTest.java`; ambas llaman al método heredado `queryAndRecordContainerId()`.

```java
try (Connection connection = DriverManager.getConnection(
        POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
     Statement statement = connection.createStatement();
     ResultSet result = statement.executeQuery("SELECT 1")) {
    assertThat(result.next()).isTrue();
    assertThat(result.getInt(1)).isEqualTo(1);
}
```

Corre `./mvnw -q test` y compara las dos líneas `usa containerId=`.

**Resultado esperado:** Ambas consultas pasan y muestran el mismo ID de contenedor. Al terminar la segunda clase, el `@AfterAll` heredado verifica la igualdad sin depender del orden de las clases.

**Fallo deliberado:** Cambia una de las consultas de `SELECT 1` a `SELECT columna_que_no_existe`. **Diagnóstico:** Solo la clase que ejecuta esa consulta falla. Restaura `SELECT 1` y corre la suite completa.

**Entiende:** El ID igual en ambos logs es la evidencia de que las clases accedieron al mismo contenedor en esa JVM. No mide cuánto tiempo se ahorró.

**Cierra:** Guarda el reporte JUnit y los IDs iguales de la ejecución actual.

#### Subtema 5.3: Aísla los datos compartidos · 8 min

**Contexto:** Las clases comparten la base junto con el contenedor. Una prueba que inserta filas puede alterar lo que observa la siguiente.

**Hazlo tú:** Lee `junit-platform.properties` y confirma que el paralelismo de Jupiter está apagado. Inspecciona las dos pruebas: usan `SELECT 1` y no cambian filas.


Para comprobar «Aísla los datos compartidos», consulta: `examples/testcontainers-singleton-rutaflow/src/test/java/academia/rutaflow/containers/SharedPostgres.java`. Desde `examples/testcontainers-singleton-rutaflow` repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** Las dos clases pasan en secuencia y no necesitan limpiar datos.

**Fallo deliberado:** En `SharedPostgres.queryAndRecordContainerId`, guarda temporalmente el texto `id-falso` en lugar del ID real para `SecondRepositoryTest`. **Diagnóstico:** La consulta todavía pasa, pero la comprobación `@AfterAll` falla al encontrar IDs distintos. Restaura el ID real y confirma la suite verde.

**Entiende:** **Límite:** singleton no significa base limpia por clase. Si cambias datos, limpia cada prueba con claves únicas, transacciones realmente aisladas o esquemas por clase.

**Cierra:** Escribe qué limpieza necesitaría tu caso de prueba si insertara una entrega.

#### Subtema 5.4: Decide si conviene compartir · 8 min

**Contexto:** El singleton comparte el ciclo de vida dentro de una JVM; el modo `withReuse(true)` trata de conservar contenedores entre ejecuciones locales y tiene una configuración diferente.

**Hazlo tú:** Lee el README del laboratorio y la guía oficial de ciclo manual. Busca las diferencias entre `@Container` estático por clase, el singleton manual entre clases y la reutilización persistente local.


Para comprobar «Decide si conviene compartir», consulta: `examples/testcontainers-singleton-rutaflow/src/test/java/academia/rutaflow/containers/SharedPostgres.java`. Desde `examples/testcontainers-singleton-rutaflow` repite la comprobación:

```bash
./mvnw -q test
```

**Resultado esperado:** Puedes decir qué alcance comparte cada patrón y cuándo debes limpiar filas o evitar forks paralelos.

**Fallo deliberado:** Ejecuta cada clase por separado con `./mvnw -q -Dtest=FirstRepositoryTest test` y luego `./mvnw -q -Dtest=SecondRepositoryTest test`. **Diagnóstico:** Los IDs cambian porque son dos ejecuciones/JVM distintas; el singleton solo comparte dentro de la ejecución conjunta. Después vuelve a correr `./mvnw -q test` para comprobar un ID compartido.

**Entiende:** Usa singleton si has medido que el arranque repetido domina el tiempo de pruebas y puedes aislar estado. Para pocas clases, conserva el ciclo de vida administrado por JUnit.

**Cierra:** Evidencia: ambas consultas verdes, dos IDs reales iguales y una razón concreta para usar o no el patrón en el proyecto integrador.

**Transferencia al proyecto integrador:** úsalo solo si varias suites comparten el mismo servicio externo y cada prueba conserva aislamiento de datos. La prueba actual no demuestra ahorro de tiempo; mide tu pipeline antes de decidir.

**Fuentes oficiales:** [Testcontainers: ciclo manual y singleton](https://java.testcontainers.org/test_framework_integration/manual_lifecycle_control/), [integración JUnit 5](https://java.testcontainers.org/test_framework_integration/junit_5/) y [configuración Podman](https://java.testcontainers.org/supported_docker_environment/).


```bash
./mvnw -q -Dtest=FirstRepositoryTest test
```
