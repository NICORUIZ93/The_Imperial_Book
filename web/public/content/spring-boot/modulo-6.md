# Módulo 6: Testing en Spring Boot

Este módulo compara pruebas de MVC, persistencia e integración. Cada tema debe indicar qué capas ejecuta y qué deja fuera; la evidencia funcional está en las respuestas y fallos observados.


## Aprende construyendo

### Tema 1: Probar un controller con `@WebMvcTest`

Reutiliza la API de tareas construida en M2 y la seguridad de M4. **¿Por qué es importante?** Un fallo del controller debe poder detectarse sin levantar PostgreSQL ni recorrer todas las capas. Este tema prueba la web sin llamar al repositorio y no crea otra aplicación ni otro servicio.

#### Subtema 6.1 · Recortar la prueba a la web (10 min)

**Contexto.** Un test de controller debe poder comprobar ruta, JSON y respuesta sin conectarse a PostgreSQL. `@WebMvcTest(TareaController.class)` prepara MVC y ese controller. No registra automáticamente `@Service`; declara el colaborador simulado con `@MockitoBean`.

**Hazlo tú.** En el proyecto acumulativo, crea `src/test/java/com/example/demo/TareaControllerSliceTest.java`:

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

**Resultado esperado.** El test pasa con `201` y el DTO esperado; el repositorio real no participa en esta petición.

#### Subtema 6.2 · Ver la validación y el error JSON (10 min)

**Contexto.** Una respuesta inválida también forma parte del contrato HTTP. El proyecto ya tiene `@Valid` en `TareaController` y `GlobalExceptionHandler` convierte el error de `@NotBlank` en el `ApiError` acordado (`codigo`, `mensaje`, `campos`).

**Hazlo tú.** En el mismo archivo, agrega este método a `TareaControllerSliceTest`:

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

**Resultado esperado.** Los dos métodos pasan; el segundo ve `400`, `VALIDACION` y el mensaje del campo. El servicio no necesita configurarse para este caso: la validación del request ocurre antes de llamar al controller.

#### Subtema 6.3 · Diagnosticar una dependencia que falta (10 min)

**Contexto.** Un slice no significa “Spring simula todas las dependencias”. El controller todavía necesita un bean que satisfaga `ServicioTareas`.

**Hazlo tú.** Quita solo `@MockitoBean` de esta línea, conserva el campo y ejecuta el método de creación:

```java
ServicioTareas servicio;
```

```bash
./mvnw -q -Dtest=TareaControllerSliceTest#creaTareaYDevuelve201 test
```

**Fallo deliberado observado.** El contexto no carga y el log contiene `NoSuchBeanDefinitionException: No qualifying bean of type 'com.example.demo.ServicioTareas'`. Restaura `@MockitoBean` y comprueba que los dos métodos vuelven a pasar.

#### Entiende y cierra

`MockMvc` envía una petición de prueba a la infraestructura MVC sin abrir un puerto. `@WebMvcTest` incorpora controller, conversión JSON, validación y advice relevante; el mock decide qué devuelve el colaborador. En Boot 4 los imports son `org.springframework.boot.webmvc.test.autoconfigure.*`, y `@MockitoBean` viene de Spring Test. `@AutoConfigureMockMvc(addFilters = false)` se usa aquí porque aislamos el contrato del controller; por ello estos métodos **no** prueban JWT ni autorización. Esa cobertura pertenece a M4 y debe mantenerse aparte. El `JwtService` simulado satisface la dependencia del filtro detectado por el slice, aunque los filtros no se añadan a MockMvc.

**Evidencia para avanzar:** dos métodos pasan, el fallo por retirar el mock se identifica y revierte, y puedes explicar qué cubre esta prueba y qué queda fuera. No uses este slice para afirmar que repositorio, base de datos, seguridad o todas las capas funcionan juntas; para eso se necesitan pruebas de integración apropiadas. Documentación primaria: [Spring Boot 4.1.2 — `@WebMvcTest`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/webmvc/test/autoconfigure/WebMvcTest.html) y [Spring Boot 4.1.2 — `@AutoConfigureMockMvc`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/webmvc/test/autoconfigure/AutoConfigureMockMvc.html).

### Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest`

**¿Por qué es importante?** El repositorio puede parecer correcto en H2 y fallar con el motor usado en producción. Este slice carga entidades y repositorios; Testcontainers añade una instancia desechable del PostgreSQL elegido.

#### Subtema 6.4 · Conectar el slice a un PostgreSQL desechable (10 min)

**Contexto.** `@DataJpaTest` configura JPA y repositorios, y suele elegir una base embebida si está disponible. Para probar PostgreSQL de verdad, el test debe enlazar URL, usuario y contraseña del contenedor antes de que Spring cree el `DataSource`.

**Hazlo tú.** En el proyecto acumulativo de M2, agrega al `pom.xml` estas dependencias de prueba. El driver PostgreSQL no viene dentro de Testcontainers. Si el proyecto ejecuta migraciones con Flyway, agrega también su módulo PostgreSQL con alcance `runtime`:

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

**Resultado esperado.** Maven termina con `BUILD SUCCESS`; `test-compile` verifica nombres de artefacto, package Boot 4, paquete actual de PostgreSQLContainer y tipos antes de necesitar un runtime de contenedores.

#### Subtema 6.5 · Comprobar motor y operación del repositorio (10 min)

**Contexto.** Que el test se llame “PostgreSQL” no prueba qué base abrió Spring. Comprueba el producto por JDBC y luego guarda y consulta una tarea con el repositorio real.

**Hazlo tú.** Agrega ambos métodos a `TareaRepositoryPostgresTest`:

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

**Resultado esperado.** Pasan dos pruebas: el driver informa `PostgreSQL` y el repositorio devuelve la tarea guardada. `@DataJpaTest` abre una transacción por método y la revierte al terminar. El campo `static` comparte un contenedor entre los métodos de esta clase; la prueba no certifica todas las consultas ni todas las versiones de PostgreSQL.

#### Subtema 6.6 · Detectar que el test cayó en H2 (10 min)

**Contexto.** Si no publicas las propiedades del contenedor, `@DataJpaTest` puede usar H2 y darte una falsa sensación de compatibilidad.

**Hazlo tú.** Retira temporalmente el método `conectarPostgres` completo y ejecuta solo esta prueba:

```bash
./mvnw -q -Dtest=TareaRepositoryPostgresTest#postgresEsLaBaseDeDatosConectada test
```

**Fallo deliberado observado.** Flyway registra `jdbc:h2:mem:...`; la aserción falla porque esperaba `PostgreSQL` y recibió `H2`. Restaura `conectarPostgres` y ejecuta de nuevo los dos tests.

#### Entiende y cierra

`@DataJpaTest` configura el slice de datos, no el controller ni la aplicación completa. `@DynamicPropertySource` entrega al `DataSource` la dirección y credenciales que Testcontainers asigna al contenedor. `Replace.NONE` conserva esa conexión real. El módulo `flyway-database-postgresql` es necesario en este proyecto porque Flyway separa el soporte específico del motor; agregar solo el starter Flyway no bastó para iniciar migraciones contra PostgreSQL.

**Evidencia para avanzar:** el test compila, las dos pruebas pasan contra PostgreSQL y, al retirar propiedades dinámicas, se observa H2 y la aserción falla. El equipo requiere Docker o un runtime compatible configurado; si no está disponible, reporta por separado compilación y ejecución. Documentación primaria: [Spring Boot 4.1.2 — `@DataJpaTest`](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html#testing.spring-boot-applications.spring-data-jpa-tests), [Spring Boot 4.1.2 — `@AutoConfigureTestDatabase`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/jdbc/test/autoconfigure/AutoConfigureTestDatabase.html), [Testcontainers — PostgreSQL](https://java.testcontainers.org/modules/databases/postgres/) y [Testcontainers — JUnit 5](https://java.testcontainers.org/test_framework_integration/junit_5/).

### Tema 3: @SpringBootTest completo y estrategia de pirámide de tests

#### Paso 1 · Objetivo y preparación

Al finalizar podrás escribir un test end-to-end con `@SpringBootTest` que ejercita controller, servicio y repositorio reales juntos, y explicar por qué debe reservarse para pocos flujos verdaderamente críticos.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un flujo crítico de negocio (crear una tarea y confirmar que aparece en la lista de pendientes) involucra el controller, el servicio y el repositorio trabajando juntos; los tests de slice de los Temas 1 y 2 verifican cada capa por separado, pero ninguno confirma que las tres funcionen correctamente coordinadas.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** contexto completo, muchos unitarios/pocos de integración completa.

`@SpringBootTest` levanta absolutamente todo el contexto de la aplicación, incluyendo todas las capas reales configuradas como en producción, apropiado para tests end-to-end que verifican un flujo completo a través de múltiples capas reales interactuando entre sí, pero siendo el nivel más lento de arrancar de los tres disponibles (unitarios con Mockito puro, slices como `@WebMvcTest`/`@DataJpaTest`, y `@SpringBootTest` completo). La estrategia recomendada balancea los tres niveles: muchos tests unitarios rápidos, algunos de slice, y pocos `@SpringBootTest` reservados para los flujos más críticos.

**Analogía:** esta estrategia de pirámide de tests es un proceso de control de calidad con muchas verificaciones rápidas de piezas sueltas (unitarios), algunas verificaciones de subsistemas completos (slices), y pocas pero exhaustivas pruebas del producto ensamblado completo (`@SpringBootTest`).

**Diagrama:**

```
┌── pocos: @SpringBootTest completo ──────────────────────┐
│  contexto total, para flujos end-to-end críticos            │
└──────────────────┬───────────────────────────┘
┌── algunos: tests de slice (@WebMvcTest, @DataJpaTest) ─┐
│  contexto parcial, una capa a la vez                       │
└──────────────────┬───────────────────────────┘
┌── muchos: tests unitarios con Mockito puro ─────────────┐
│  sin contexto de Spring — los más rápidos de todos           │
└─────────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` (o créalo desde una carpeta vacía con `mkdir -p academia-spring` si es tu primera vez) y completa `TareaService` real (sin mockear nada esta vez), creando el test end-to-end en `src/test/java/com/academia/tarea/`:

```bash
mkdir -p academia-spring/src/test/java/com/academia/tarea
cd academia-spring
```

```java
// src/main/java/com/academia/tarea/TareaService.java (reemplaza la versión del Tema 1)
package com.academia.tarea;

import org.springframework.stereotype.Service;

@Service
public class TareaService {
    private final TareaRepository repositorio;

    public TareaService(TareaRepository repositorio) { this.repositorio = repositorio; }

    public String crear(String titulo) {
        Tarea guardada = repositorio.save(new Tarea(titulo));
        return guardada.getId().toString();
    }
}
```

```java
// src/test/java/com/academia/tarea/CrearTareaEndToEndTest.java
package com.academia.tarea;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest // levanta TODO el contexto real: controller + servicio + repositorio + base de datos H2 embebida
@AutoConfigureMockMvc
class CrearTareaEndToEndTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private TareaRepository tareaRepository;

    @Test
    void crearUnaTareaPersisteRealmenteEnLaBaseDeDatos() throws Exception {
        mockMvc.perform(post("/api/tareas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("\"Comprar leche\""))
            .andExpect(status().isCreated());

        // confirma directamente contra el repositorio REAL, no un mock, que la fila fue persistida
        assertThat(tareaRepository.findAll()).extracting(Tarea::getTitulo).contains("Comprar leche");
    }
}
```

**Explicación línea por línea:** `@SpringBootTest` (sin especificar una clase concreta como `@WebMvcTest`) levanta el contexto completo: el `TareaController` real, el `TareaService` real (sin ningún `@MockitoBean`) y el `TareaRepository` real contra una base de datos embebida; la aserción final consulta el repositorio REAL directamente, confirmando que la petición HTTP efectivamente persistió datos, no solo que el controller respondió el código esperado.

```bash
mvn test -Dtest=CrearTareaEndToEndTest # Maven
./gradlew test --tests CrearTareaEndToEndTest # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con el test en verde, pero notablemente más lento de arrancar que `TareaControllerTest` (Tema 1) — confirma con `mvn test -Dtest=TareaControllerTest,CrearTareaEndToEndTest` que el tiempo reportado para el segundo es mayor, evidencia directa del costo de levantar el contexto completo.

**Fallo deliberado:** en `TareaService.crear`, cambia `repositorio.save(new Tarea(titulo))` por simplemente `new Tarea(titulo)` (sin llamar a `save`, olvidando persistir). El test `mockMvc.perform(...)` seguiría respondiendo `201` (el controller no sabe que el servicio no persistió nada), pero `assertThat(tareaRepository.findAll())` FALLA porque la lista está vacía — diagnostica confirmando por qué un test de solo la capa web (Tema 1, con el servicio mockeado) NUNCA habría detectado este bug: el mock siempre "funciona" según lo que le configuraste, sin importar si la implementación real relacionada con la base de datos está rota. Solo un test end-to-end como este, que usa el servicio y el repositorio reales, expone el problema. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo test end-to-end que confirme un flujo de lectura completo: crear una tarea vía POST y luego consultarla vía GET, confirmando que ambos pasan por las tres capas reales.
2. Compara el tiempo reportado por Maven entre `TareaControllerTest` (Tema 1, slice), `TareaRepositoryTestcontainersTest` (Tema 2, slice con contenedor) y `CrearTareaEndToEndTest` (Tema 3, completo), documentando el orden de velocidad observado.
3. Identifica, en tu propio criterio, cuál de los tres flujos de tu dominio (por ejemplo: crear pedido, asignar responsable, marcar tarea completada) es el más crítico para tener como `@SpringBootTest` end-to-end, y justifica la elección en una frase.
4. Escribe de memoria (sin mirar) un `@SpringBootTest` con `MockMvc` que confirme, contra un repositorio real (no mockeado), que una petición HTTP persistió datos correctamente. Compara después contra el patrón del Paso 4.

**Pista:** un bug real donde el mock "esconde" el problema (como el fallo deliberado de este Tema) es la razón principal por la que la pirámide recomienda ALGUNOS `@SpringBootTest`, no CERO — un slice perfectamente verde puede coexistir con un flujo real completamente roto.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para levantar el contexto completo de la aplicación:

```java
@____
@AutoConfigureMockMvc
class CrearTareaEndToEndTest { }
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un test `@SpringBootTest` con `MockMvc` y una aserción directa contra un repositorio real confirmando persistencia. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya distingues los tres niveles de la pirámide de tests (unitarios, slices, `@SpringBootTest` completo) y confirmas con evidencia real por qué cada uno responde una pregunta distinta que los otros no cubren. Esto cierra el módulo de testing; el siguiente módulo aborda cómo documentar y observar esta misma API en producción. **Evidencia:** entrega el resultado de `CrearTareaEndToEndTest` en verde, y el resultado del fallo deliberado mostrando cómo un bug de persistencia real pasa desapercibido para un test de slice pero es detectado por el test end-to-end. Fuente oficial: [Spring Boot — Testing Spring Boot Applications](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html).

**Errores comunes:** usar `@SpringBootTest` para todo, incluso pruebas simples de lógica de negocio que un test unitario con Mockito cubriría igual de bien y mucho más rápido; no tener NINGÚN `@SpringBootTest`, confiando únicamente en slices que, como demuestra el fallo deliberado, pueden dejar pasar bugs de integración entre capas.

**Cuándo no usarlo:** para verificar lógica de negocio aislada sin ninguna dependencia de infraestructura real (cálculos, validaciones puras), un test unitario con Mockito puro, sin ningún contexto de Spring involucrado, es preferible por su velocidad.

---

La pirámide de tests que diseñes aquí es la misma que aplicará el proyecto integrador de este track (microservicio productivo, Módulo 12).

## Laboratorio práctico

**Objetivo del laboratorio:** construir una suite de tests de integración con Testcontainers contra PostgreSQL real, balanceando los tres niveles de testing.

**Requisitos previos:** Módulos 0-5 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir un test unitario con Mockito puro | Módulo 9 del track de Java | Sin contexto de Spring |
| 2 | Escribir un test de slice con `@WebMvcTest` | Ver Tema 1 | Mockea el servicio inyectado |
| 3 | Usar `MockMvc` para simular una petición completa | Ver Tema 1 | Verifica código de estado y JSON |
| 4 | Configurar Testcontainers con `@DataJpaTest` | Ver Tema 2 | Contra PostgreSQL real |
| 5 | Escribir un test con `@SpringBootTest` end-to-end | Ver Tema 3 | Para el flujo más crítico |

**Verificación:** el laboratorio se considera exitoso si la suite completa refleja la pirámide de tests (muchos unitarios, algunos slices, pocos `@SpringBootTest`), y si los tests de repositorio contra Testcontainers verifican comportamiento fiel a PostgreSQL real, no aproximado por H2.

**Errores comunes y soluciones**

- **Usar `@SpringBootTest` para todo, incluso pruebas simples de lógica de negocio.** Prefiere tests unitarios con Mockito puro para lógica aislada.
- **Confiar en H2 en memoria para verificar comportamiento específico de PostgreSQL.** Usa Testcontainers para fidelidad real con la base de datos de producción.
- **No mockear el servicio en un test de `@WebMvcTest`.** Sin `@MockitoBean`, Spring intentará resolver la dependencia real, fallando si no está disponible en ese contexto parcial.

---
