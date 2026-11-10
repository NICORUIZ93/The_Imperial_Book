# Módulo 6: Testing en Spring Boot

Este módulo compara pruebas de MVC, persistencia e integración. Cada tema debe indicar qué capas ejecuta y qué deja fuera; la evidencia funcional está en las respuestas y fallos observados.


## Aprende construyendo

### Tema 1: Probar un controller con `@WebMvcTest`

Reutiliza la API de tareas construida en M2 y la seguridad de M4. **¿Por qué es importante?** Un fallo del controller debe poder detectarse sin levantar PostgreSQL ni recorrer todas las capas. Este tema prueba la web sin llamar al repositorio y no crea otra aplicación ni otro servicio.

#### Subtema 6.1 · Recortar la prueba a la web · 10 min

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
    @MockitoBean JwtService jwtService;

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

#### Subtema 6.2 · Ver la validación y el error JSON · 10 min

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

#### Subtema 6.3 · Diagnosticar una dependencia que falta · 10 min

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

`MockMvc` envía una petición de prueba a la infraestructura MVC sin abrir un puerto. `@WebMvcTest` incorpora controller, conversión JSON, validación y advice relevante; el mock decide qué devuelve el colaborador. En Boot 4 los imports son `org.springframework.boot.webmvc.test.autoconfigure.*`, y `@MockitoBean` viene de Spring Test. `@AutoConfigureMockMvc(addFilters = false)` se usa aquí porque aislamos el contrato del controller; por ello estos métodos **no** prueban JWT ni autorización. Esa cobertura pertenece a M4 y debe mantenerse aparte. El `JwtService` simulado satisface la dependencia del filtro detectado por el slice, aunque los filtros no se añadan a MockMvc.

**Evidencia para avanzar:** dos métodos pasan, el fallo por retirar el mock se identifica y revierte, y puedes explicar qué cubre esta prueba y qué queda fuera. No uses este slice para afirmar que repositorio, base de datos, seguridad o todas las capas funcionan juntas; para eso se necesitan pruebas de integración apropiadas. Documentación primaria: [Spring Boot 4.1.2 — `@WebMvcTest`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/webmvc/test/autoconfigure/WebMvcTest.html) y [Spring Boot 4.1.2 — `@AutoConfigureMockMvc`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/webmvc/test/autoconfigure/AutoConfigureMockMvc.html).


**Aplicación y decisión:** Práctica para el proyecto integrador: añade una petición con prioridad inválida al slice y comprueba 400 antes de llamar al servicio. Este límite de alcance excluye PostgreSQL y JWT; no abras la seguridad real para hacer pasar un test de contrato.

### Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest`

**¿Por qué es importante?** El repositorio puede parecer correcto en H2 y fallar con el motor usado en producción. Este slice carga entidades y repositorios; Testcontainers añade una instancia desechable del PostgreSQL elegido.

#### Subtema 6.4 · Conectar el slice a un PostgreSQL desechable · 10 min

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

#### Subtema 6.5 · Comprobar motor y operación del repositorio · 10 min

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

Archivo concreto para esta comprobación: `src/test/java/com/example/demo/TareaControllerSliceTest.java`.

**Resultado esperado:** Pasan dos pruebas: el driver informa `PostgreSQL` y el repositorio devuelve la tarea guardada. `@DataJpaTest` abre una transacción por método y la revierte al terminar. El campo `static` comparte un contenedor entre los métodos de esta clase; la prueba no certifica todas las consultas ni todas las versiones de PostgreSQL.


**Fallo deliberado:** En postgresEsLaBaseDeDatosConectada, espera H2 en lugar de PostgreSQL y ejecuta el test. **Diagnóstico:** el metadato real responde PostgreSQL y rechaza la expectativa; restaura PostgreSQL.

**Entiende:** El motor se verifica desde la conexión, no desde el nombre del test. El rollback por método no reemplaza todas las pruebas de concurrencia.

**Cierra:** Guarda motor informado, entidad persistida y consulta que la recupera.

#### Subtema 6.6 · Detectar que el test cayó en H2 · 10 min

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

### Tema 3: Integrar el flujo con `@SpringBootTest`

**¿Por qué es importante?** Un controller y un repositorio pueden pasar sus pruebas por separado y aun así fallar al conectarse. Una prueba de contexto completo comprueba un flujo crítico atravesando la aplicación configurada.

#### Subtema 6.7 · Crear y consultar con las capas reales · 10 min

**Contexto:** M6 T1 simuló `ServicioTareas`; M6 T2 aisló el repositorio con PostgreSQL. Ahora conecta controller, filtro JWT, servicio y repositorio. Para este ejemplo, las pruebas usan H2 configurado en `src/test/resources/application.properties`.

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

#### Subtema 6.8 · Separar error de autenticación y flujo válido · 10 min

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

Archivo concreto para esta comprobación: `src/test/java/com/example/demo/TareaControllerSliceTest.java`.

**Resultado esperado:** Pasan dos métodos: la ruta completa autenticada y el `401` sin token. El primero usa la firma real del JWT, pero crea el token directamente; no prueba el endpoint de login. `MockMvc` ejercita MVC y los filtros en memoria, sin iniciar un servidor ni probar navegador, proxy o TLS.


**Fallo deliberado:** Añade un JWT válido a la petición que debe comprobar ausencia de autenticación. **Diagnóstico:** el caso deja de representar un cliente anónimo y ya no demuestra 401; restaura la ausencia de token.

**Entiende:** Un 401 indica ausencia o invalidez de credencial; un 403 exige estudiar permisos. No los intercambies para hacer pasar una prueba.

**Cierra:** Guarda por separado el flujo autenticado y el rechazo anónimo.

#### Subtema 6.9 · Ver qué integración detecta el test · 10 min

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

**Evidencia para avanzar:** los dos métodos pasan, el token real atraviesa el filtro, el POST se lee después de persistirse y el fallo por saltar el repositorio se diagnostica y revierte. La base de este ejemplo es H2; la prueba PostgreSQL de M6 T2 cubre el motor real. Documentación primaria: [Spring Boot 4.1.2 — `@SpringBootTest` y pruebas MVC](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html) y [Spring Framework — MockMvc](https://docs.spring.io/spring/reference/testing/mockmvc.html).

**Aplicación y decisión:** Práctica del proyecto integrador: demuestra que una petición rechazada no crea una fila. La diferencia entre flujo MockMvc y HTTP de red importa: pasar el primero no verifica proxy, TLS ni configuración del puerto publicado.

