# Módulo 6: Testing en Spring Boot

Este módulo compara pruebas de MVC, persistencia e integración. Cada tema debe indicar qué capas ejecuta y qué deja fuera; la evidencia funcional está en las respuestas y fallos observados.

**Referencia ejecutable al terminar los módulos 2 y 4–7:** en la raíz del repositorio, abre `README.md`. Incluye el estado final y pruebas; algunas clases incorporan cambios de módulos posteriores. Construye primero las prácticas de este módulo y usa la referencia para comparar y diagnosticar.

## Aprende construyendo


### Tema 1: Probar un controller con `@WebMvcTest` · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por probar un controller con `@webmvctest` con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender probar un controller con `@webmvctest` te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en probar un controller con `@webmvctest` como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que probar un controller con `@webmvctest` resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Probar un controller con `@WebMvcTest` se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Probar un controller con `@WebMvcTest` | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses probar un controller con `@webmvctest` por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: probar un controller con `@webmvctest` funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Probar un controller con `@WebMvcTest` existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve probar un controller con `@webmvctest` en tu contexto?
2. ¿Cómo sabrías que probar un controller con `@webmvctest` no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar probar un controller con `@webmvctest`?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
./mvnw -q -Dtest=TareaControllerSliceTest test
```

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

```java
ServicioTareas servicio;
```

```bash
./mvnw -q -Dtest=TareaControllerSliceTest#creaTareaYDevuelve201 test
```

</details>

### Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest` · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por probar el repositorio contra postgresql con `@datajpatest` con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender probar el repositorio contra postgresql con `@datajpatest` te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en probar el repositorio contra postgresql con `@datajpatest` como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que probar el repositorio contra postgresql con `@datajpatest` resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Probar el repositorio contra PostgreSQL con `@DataJpaTest` se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Probar el repositorio contra PostgreSQL con `@DataJpaTest` | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses probar el repositorio contra postgresql con `@datajpatest` por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: probar el repositorio contra postgresql con `@datajpatest` funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Probar el repositorio contra PostgreSQL con `@DataJpaTest` existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve probar el repositorio contra postgresql con `@datajpatest` en tu contexto?
2. ¿Cómo sabrías que probar el repositorio contra postgresql con `@datajpatest` no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar probar el repositorio contra postgresql con `@datajpatest`?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
./mvnw -q -DskipTests test-compile
```

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

```bash
./mvnw -q -Dtest=TareaRepositoryPostgresTest test
```

```bash
./mvnw -q -Dtest=TareaRepositoryPostgresTest#postgresEsLaBaseDeDatosConectada test
```

</details>

### Tema 3: Integrar el flujo con `@SpringBootTest` · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por integrar el flujo con `@springboottest` con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender integrar el flujo con `@springboottest` te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en integrar el flujo con `@springboottest` como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que integrar el flujo con `@springboottest` resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Integrar el flujo con `@SpringBootTest` se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Integrar el flujo con `@SpringBootTest` | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses integrar el flujo con `@springboottest` por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: integrar el flujo con `@springboottest` funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Integrar el flujo con `@SpringBootTest` existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve integrar el flujo con `@springboottest` en tu contexto?
2. ¿Cómo sabrías que integrar el flujo con `@springboottest` no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar integrar el flujo con `@springboottest`?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
./mvnw -q -Dtest=TareaFlowEndToEndTest test
```

```java
@Test
void exigeTokenParaConsultarTareas() throws Exception {
    mockMvc.perform(get("/api/tareas"))
        .andExpect(status().isUnauthorized());
}
```

```java
public TareaDTO crear(CrearTareaRequest request) {
    return new TareaDTO(999L, request.titulo(), request.prioridad());
}
```

</details>

### Tema 4: `RestTestClient`: el cliente de pruebas HTTP de Spring Boot 4 · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por `resttestclient`: el cliente de pruebas http de spring boot 4 con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender `resttestclient`: el cliente de pruebas http de spring boot 4 te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en `resttestclient`: el cliente de pruebas http de spring boot 4 como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que `resttestclient`: el cliente de pruebas http de spring boot 4 resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| `RestTestClient`: el cliente de pruebas HTTP de Spring Boot 4 se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar `RestTestClient`: el cliente de pruebas HTTP de Spring Boot 4 | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses `resttestclient`: el cliente de pruebas http de spring boot 4 por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: `resttestclient`: el cliente de pruebas http de spring boot 4 funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- `RestTestClient`: el cliente de pruebas HTTP de Spring Boot 4 existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve `resttestclient`: el cliente de pruebas http de spring boot 4 en tu contexto?
2. ¿Cómo sabrías que `resttestclient`: el cliente de pruebas http de spring boot 4 no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar `resttestclient`: el cliente de pruebas http de spring boot 4?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-resttestclient</artifactId>
    <scope>test</scope>
</dependency>
```

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

```java
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
class TareaRestTestClientServidorTest {
    // mismo cuerpo que TareaRestTestClientTest
}
```

```java
@Test
void sinTokenResponde401ConDesafioBearer() {
    client.get().uri("/api/tareas")
        .exchange()
        .expectStatus().isUnauthorized()
        .expectHeader().exists("WWW-Authenticate");
}
```

</details>

### Tema 5: Contenedores Testcontainers reutilizados entre clases · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por contenedores testcontainers reutilizados entre clases con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender contenedores testcontainers reutilizados entre clases te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en contenedores testcontainers reutilizados entre clases como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que contenedores testcontainers reutilizados entre clases resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Contenedores Testcontainers reutilizados entre clases se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Contenedores Testcontainers reutilizados entre clases | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses contenedores testcontainers reutilizados entre clases por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: contenedores testcontainers reutilizados entre clases funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Contenedores Testcontainers reutilizados entre clases existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve contenedores testcontainers reutilizados entre clases en tu contexto?
2. ¿Cómo sabrías que contenedores testcontainers reutilizados entre clases no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar contenedores testcontainers reutilizados entre clases?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
./mvnw -q test
```

```java
static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

static {
    POSTGRES.start();
}
```

```java
try (Connection connection = DriverManager.getConnection(
        POSTGRES.getJdbcUrl(), POSTGRES.getUsername(), POSTGRES.getPassword());
     Statement statement = connection.createStatement();
     ResultSet result = statement.executeQuery("SELECT 1")) {
    assertThat(result.next()).isTrue();
    assertThat(result.getInt(1)).isEqualTo(1);
}
```

```bash
./mvnw -q test
```

```bash
./mvnw -q test
```

```bash
./mvnw -q -Dtest=FirstRepositoryTest test
```

</details>
