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

### Tema 2: @DataJpaTest con Testcontainers

#### Paso 1 · Objetivo y preparación

Al finalizar podrás probar un repositorio contra una base de datos PostgreSQL real y desechable con Testcontainers, y explicar por qué es preferible a H2 en memoria para fidelidad de comportamiento.

**Conocimiento previo:** Tema 1 de este módulo; entidades y repositorios (Módulo 3).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** H2 puede comportarse de forma sutilmente distinta a PostgreSQL en aspectos específicos del dialecto SQL o tipos de datos particulares, produciendo pruebas que pasan contra H2 pero fallarían contra la base de datos real usada en producción.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** base de datos real desechable, comportamiento fiel frente a H2 en memoria.

```java
@DataJpaTest
@Testcontainers
class TareaRepositoryTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void propiedades(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
}
```

Esta prueba levanta un contenedor Docker real de PostgreSQL específicamente para la suite, configurando dinámicamente la URL de conexión hacia ese contenedor efímero, descartado al finalizar. Esto elimina la discrepancia de comportamiento que H2 podría introducir, a costa de un tiempo de arranque algo mayor.

**Analogía:** usar H2 para probar código diseñado para PostgreSQL es ensayar una obra de teatro en un escenario con dimensiones y acústica distintas a las del teatro real; Testcontainers es ensayar directamente en una réplica exacta y desechable del teatro real.

**Diagrama:**

```mermaid
flowchart LR
  A["@Testcontainers: PostgreSQLContainer real"] --> B["@DynamicPropertySource: spring.datasource.url apunta al contenedor"]
  B --> C["@DataJpaTest ejecuta contra PostgreSQL real, no H2"]
  C --> D[contenedor descartado al terminar la suite]
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` (o créalo desde una carpeta vacía con `mkdir -p academia-spring` si es tu primera vez), agrega las dependencias reales `org.testcontainers:postgresql` y `org.testcontainers:junit-jupiter`, y crea el test de repositorio en `src/test/java/com/academia/tarea/`:

```bash
mkdir -p academia-spring/src/test/java/com/academia/tarea
cd academia-spring
```

```java
// src/main/java/com/academia/tarea/Tarea.java
package com.academia.tarea;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Tarea {
    @Id @GeneratedValue
    private Long id;
    private String titulo;

    protected Tarea() {}
    public Tarea(String titulo) { this.titulo = titulo; }
    public Long getId() { return id; }
    public String getTitulo() { return titulo; }
}
```

```java
// src/test/java/com/academia/tarea/TareaRepositoryTestcontainersTest.java
package com.academia.tarea;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
class TareaRepositoryTestcontainersTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    @DynamicPropertySource
    static void propiedades(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private TareaRepository tareaRepository;

    @Test
    void guardaYLeeUnaTareaContraPostgreSQLReal() {
        Tarea guardada = tareaRepository.save(new Tarea("Comprar leche"));

        Tarea leida = tareaRepository.findById(guardada.getId()).orElseThrow();

        assertThat(leida.getTitulo()).isEqualTo("Comprar leche");
    }
}
```

**Explicación línea por línea:** `@Container static PostgreSQLContainer<?> postgres` declara el contenedor real, gestionado automáticamente por Testcontainers (arranca antes de la suite, se descarta después); `@DynamicPropertySource` inyecta la URL, usuario y contraseña REALES del contenedor recién levantado (asignados dinámicamente por Docker) en las propiedades de Spring antes de que el contexto de la aplicación arranque; el test en sí (`guardaYLeeUnaTareaContraPostgreSQLReal`) es idéntico a como se vería contra cualquier otra base de datos, pero ahora ejecuta contra PostgreSQL genuino.

```bash
# requiere Docker corriendo localmente; Testcontainers lo usa para levantar el contenedor real
mvn test -Dtest=TareaRepositoryTestcontainersTest # Maven
./gradlew test --tests TareaRepositoryTestcontainersTest # Gradle (equivalente)
```

**Resultado esperado:** `BUILD SUCCESS` con el test en verde, confirmando que Testcontainers levantó un contenedor PostgreSQL real, Spring se conectó a él dinámicamente, y la fila guardada se lee correctamente — el mismo motor de base de datos que correría en producción, no una aproximación.

**Fallo deliberado:** cambia la imagen del contenedor a una versión de PostgreSQL con un tipo de columna incompatible: agrega a `Tarea` un campo `private java.util.UUID identificadorExterno;` sin ninguna conversión, y fuerza una query nativa que use una función específica de PostgreSQL no soportada por H2 (por ejemplo, `@Query(value = "SELECT gen_random_uuid()", nativeQuery = true)`). Ejecuta el mismo test contra H2 en memoria (cambiando temporalmente la dependencia a H2 sin Testcontainers) y compara: la función `gen_random_uuid()` falla contra H2 con un error de función desconocida, mientras que contra el contenedor PostgreSQL real de este Tema funciona correctamente — diagnostica confirmando exactamente el riesgo que Testcontainers elimina: una función específica del dialecto SQL real que H2 no reproduce fielmente. Revierte los cambios de prueba antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo test en la misma clase que confirme un método derivado (`findByTituloContaining`) contra el mismo contenedor PostgreSQL, reutilizando el contenedor ya levantado (el campo `static` lo comparte entre tests de la misma clase).
2. Cambia la versión de la imagen (`postgres:16` a `postgres:15`) y confirma que el mismo test sigue pasando, ilustrando que Testcontainers facilita probar contra distintas versiones reales.
3. Agrega `@Sql("/datos-iniciales.sql")` para poblar datos antes del test y confirma que el repositorio los lee correctamente desde el contenedor real.
4. Escribe de memoria (sin mirar) un `@DataJpaTest @Testcontainers` con `@Container` y `@DynamicPropertySource`, y un test que confirme guardar y leer una entidad. Compara después contra el patrón del Paso 4.

**Pista:** el campo `@Container` debe ser `static` para que Testcontainers lo comparta entre todos los tests de la misma clase, evitando levantar un contenedor nuevo por cada método de test individual.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para inyectar la URL real del contenedor en la configuración de Spring:

```java
@____
static void propiedades(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
}
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un test `@DataJpaTest @Testcontainers` con un `PostgreSQLContainer` real y una aserción sobre una entidad guardada y leída. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya pruebas la capa de persistencia contra una base de datos real y desechable, en vez de una aproximación que podría comportarse distinto en producción. El siguiente y último tema de este módulo aborda cuándo vale la pena pagar el costo del contexto completo. **Evidencia:** entrega el resultado de `TareaRepositoryTestcontainersTest` en verde, y la comparación mostrando que una función específica de PostgreSQL falla contra H2 pero funciona contra el contenedor real. Fuente oficial: [Testcontainers — Spring Boot integration](https://java.testcontainers.org/modules/databases/postgres/).

**Errores comunes:** confiar en H2 en memoria para verificar comportamiento específico de PostgreSQL; no declarar el contenedor como `static`, levantando uno nuevo innecesariamente por cada método de test, incrementando el tiempo total de la suite.

**Cuándo no usarlo:** para lógica de repositorio genuinamente independiente del motor de base de datos específico (queries triviales sin funciones propietarias), H2 en memoria puede seguir siendo aceptable por su velocidad; reserva Testcontainers para cuando la fidelidad al motor real importa.

`@DataJpaTest` con Testcontainers es como probarás la capa de persistencia del proyecto integrador de este track (microservicio productivo, Módulo 12) contra una base real.

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
