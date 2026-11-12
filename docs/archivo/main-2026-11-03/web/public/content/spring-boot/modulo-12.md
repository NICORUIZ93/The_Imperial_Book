# Módulo 12: Proyecto integrador — microservicio productivo


## Aprende construyendo

Los tres temas construyen incrementalmente un único proyecto real, `demo-integrador`, combinando las piezas ya probadas en los módulos anteriores del track: entidades y migraciones Flyway (Módulo 3), JWT y `@PreAuthorize` (Módulo 4), tests de integración con Testcontainers (Módulo 6) y una métrica de negocio de Actuator (Módulo 7). Cada tema verifica su capa con tests reales de extremo a extremo, no con descripciones.

### Tema 1: Arquitectura del microservicio integrador · Experto · 3 h

**Prerrequisito:** Módulos 3 (JPA/Flyway) y 6 (Testcontainers) de este track.

**Al terminar podrás:** ensamblar la estructura de capas completa (`controller`/`service`/`repository`) de un microservicio real, con una migración Flyway versionada gestionando el esquema, y confirmarlo con un test de integración real contra PostgreSQL vía Testcontainers.

#### Aprende

**¿Por qué es importante?** Un servicio de entregas real necesita integrar HTTP, base de datos, identidad, eventos y métricas sin esconder responsabilidades: la arquitectura por capas (controller → service → repository) hace explícito qué componente es dueño de cada responsabilidad, en vez de mezclar validación HTTP con lógica de negocio con acceso a datos en una única clase.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Separación controller/service/repository | Núcleo | `TareaController` traduce HTTP, `TareaService.crear(...)` decide y `TareaRepository extends JpaRepository` accede a datos, en paquetes distintos |
| Migración Flyway versionada | Núcleo | `V1__crear_tarea.sql` crea la tabla `tarea` y el test pasa sin `ddl-auto` |
| Testcontainers como verificación real | Prerrequisito | `@Container static PostgreSQLContainer<?> postgres` arranca un PostgreSQL efímero y `findById(...)` confirma la persistencia |
| Inyección por constructor | Núcleo | `TareaService(TareaRepository repository)` y `TareaController(TareaService servicio)` reciben sus dependencias por constructor |
| `@DynamicPropertySource` para apuntar al contenedor | Variante | `registry.add("spring.datasource.url", postgres::getJdbcUrl)` redirige el datasource al contenedor efímero |
| Esquema sin `ddl-auto` | Límite | El fallo deliberado quita `V1__...` y Hibernate lanza `Schema-validation: missing table [tarea]` al arrancar |
| Conflicto de versiones de Flyway | Error frecuente | El reto de dos migraciones `V2__...` produce un error real de versión duplicada al arrancar |
| Capas vs. script de un solo uso | Decisión | "Cuándo no usarlo" señala que para un script efímero la separación completa es desproporcionada |

Cada fila tiene su explicación individual a continuación.

**Separación controller/service/repository (núcleo).** El proyecto ubica cada responsabilidad en su propia clase y paquete: `TareaController` sólo traduce HTTP hacia/desde parámetros y códigos de estado, `TareaService` concentra la lógica de negocio sin conocer HTTP, y `TareaRepository` accede a datos vía Spring Data JPA. El mecanismo es la delegación en cadena (controller → service → repository); el error que previene es mezclar validación HTTP, decisión de negocio y acceso a datos en una sola clase, que vuelve imposible razonar sobre quién es dueño de cada cambio.

**Migración Flyway versionada (núcleo).** `V1__crear_tarea.sql` define el esquema real de la tabla `tarea` con sus columnas y restricciones (`id BIGSERIAL PRIMARY KEY`, `NOT NULL`, `DEFAULT FALSE`), y Flyway lo aplica al arrancar sin depender de `ddl-auto`. El resultado observable es que el test persiste contra ese esquema concreto; la variante contraria —dejar que Hibernate genere el esquema— se descarta explícitamente para el proyecto final.

**Testcontainers como verificación real (prerrequisito).** `@Container static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")` arranca un PostgreSQL verdadero y efímero, no una base simulada, de modo que el test ejerce el mismo motor que producción. La evidencia es que `tareaRepository.findById(respuesta.getBody())` recupera el registro recién creado; su límite operativo es que requiere Docker activo, como recuerda la sección "Si falla".

**Inyección por constructor (núcleo).** Tanto `TareaService(TareaRepository repository)` como `TareaController(TareaService servicio)` reciben sus colaboradores por constructor, dejando los campos `final`. El mecanismo hace las dependencias explícitas e inmutables y permite que Spring las resuelva al construir el contexto; el error que evita es el acoplamiento oculto de crear dependencias dentro de la clase.

**`@DynamicPropertySource` para apuntar al contenedor (variante).** El método estático `propiedades(DynamicPropertyRegistry registry)` registra `spring.datasource.url`, `username` y `password` tomándolos de `postgres::getJdbcUrl` y similares. Es una variante necesaria frente a propiedades fijas porque el puerto del contenedor es dinámico: sin esta redirección la aplicación intentaría conectarse a un datasource que no existe en el entorno de test.

**Esquema sin `ddl-auto` (límite).** El fallo deliberado borra `V1__crear_tarea.sql` sin añadir `ddl-auto`, y la aplicación se niega a arrancar con `org.hibernate.tool.schema.spi.SchemaManagementException: Schema-validation: missing table [tarea]`. Esto marca el límite del diseño: sin una migración versionada no existe ningún mecanismo que cree la tabla, y el fallo aparece al arrancar en vez de silenciosamente más tarde, lo que es el comportamiento deseado.

**Conflicto de versiones de Flyway (error frecuente).** El reto 3 pide provocar dos migraciones con el mismo prefijo `V2__...`, lo que Flyway detecta como versión duplicada y reporta como error al arrancar. Documentar ese error enseña un fallo profesional frecuente: numerar mal las migraciones rompe el orden determinista que Flyway necesita para aplicar los scripts en secuencia.

**Capas vs. script de un solo uso (decisión).** La sección "Cuándo no usarlo" reconoce que la separación completa en capas y las migraciones versionadas son una inversión desproporcionada para un script de un único uso sin evolución futura del esquema. La decisión profesional consiste en calibrar el coste estructural contra la vida esperada del código, no aplicar siempre la arquitectura máxima.

**Conceptos clave:** capas completas del track combinadas, separación clara de responsabilidades.

El proyecto integrador combina en una única aplicación todas las capas estudiadas: `controller/` (`TareaController`, traduce HTTP hacia/desde DTOs), `service/` (`TareaService`, lógica de negocio sin conocimiento de HTTP), `repository/` (`TareaRepository`, Spring Data JPA), con `db/migration/` conteniendo los scripts versionados de Flyway que gestionan el esquema real de la base de datos, sin `ddl-auto`.

**Analogía:** el proyecto integrador es el ensamblaje final de piezas especializadas construidas por separado a lo largo de un curso de ingeniería, donde cada componente encaja en su lugar dentro de un sistema completo y coherente.

**Diagrama:**

```
┌── controller/ ──────────┐  TareaController (DTOs, validación HTTP)
├── service/ ──────────────┤  TareaService (lógica de negocio pura)
├── repository/ ───────────┤  TareaRepository (Spring Data JPA)
└── db/migration/ ─────────┘  V1__crear_tarea.sql (Flyway, sin ddl-auto)
```

#### Practica

Parte de una carpeta vacía y crea `src/main/java/io/academia/integrador/`:

```bash
mkdir demo-integrador
cd demo-integrador
# Maven (type=maven-project, por defecto): genera pom.xml y ./mvnw
curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web,data-jpa,flyway,postgresql,security,actuator -d javaVersion=25 -o app.zip
# Gradle (alternativa equivalente): genera build.gradle.kts y ./gradlew
#   curl -fsSL https://start.spring.io/starter.zip -d type=gradle-project-kotlin -d dependencies=web,data-jpa,flyway,postgresql,security,actuator -d javaVersion=25 -o app.zip
unzip app.zip
mkdir -p src/main/java/io/academia/integrador/{controller,service,repository}
mkdir -p src/main/resources/db/migration
mkdir -p src/test/java/io/academia/integrador
```

> **Build con Maven o Gradle:** el proyecto integrador puede generarse con cualquiera de los dos sistemas (cambia el parámetro `type` del Initializr arriba). Para compilar y probar usa `./mvnw test` (Maven) o `./gradlew test` (Gradle); para ejecutar el microservicio, `./mvnw spring-boot:run` o `./gradlew bootRun`. La tabla completa de equivalencias está en el track de Java, Módulo 8, Tema 4.

```sql
-- src/main/resources/db/migration/V1__crear_tarea.sql
CREATE TABLE tarea (
    id BIGSERIAL PRIMARY KEY,
    descripcion VARCHAR(200) NOT NULL,
    propietario VARCHAR(100) NOT NULL,
    completada BOOLEAN NOT NULL DEFAULT FALSE
);
```

```java
// src/main/java/io/academia/integrador/Tarea.java
package io.academia.integrador;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class Tarea {
    @Id
    @GeneratedValue
    private Long id;
    private String descripcion;
    private String propietario;
    private boolean completada;

    protected Tarea() {}

    public Tarea(String descripcion, String propietario) {
        this.descripcion = descripcion;
        this.propietario = propietario;
    }

    public Long getId() { return id; }
    public String getDescripcion() { return descripcion; }
    public String getPropietario() { return propietario; }
}
```

```java
// src/main/java/io/academia/integrador/repository/TareaRepository.java
package io.academia.integrador.repository;

import io.academia.integrador.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TareaRepository extends JpaRepository<Tarea, Long> {}
```

```java
// src/main/java/io/academia/integrador/service/TareaService.java
package io.academia.integrador.service;

import io.academia.integrador.Tarea;
import io.academia.integrador.repository.TareaRepository;
import org.springframework.stereotype.Service;

@Service
public class TareaService {
    private final TareaRepository repository;

    public TareaService(TareaRepository repository) {
        this.repository = repository;
    }

    public Tarea crear(String descripcion, String propietario) {
        return repository.save(new Tarea(descripcion, propietario));
    }
}
```

```java
// src/main/java/io/academia/integrador/controller/TareaController.java
package io.academia.integrador.controller;

import io.academia.integrador.Tarea;
import io.academia.integrador.service.TareaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {
    private final TareaService servicio;

    public TareaController(TareaService servicio) {
        this.servicio = servicio;
    }

    @PostMapping
    public ResponseEntity<Long> crear(@RequestParam String descripcion) {
        Tarea tarea = servicio.crear(descripcion, "sistema");
        return ResponseEntity.status(201).body(tarea.getId());
    }
}
```

Confirma con `@SpringBootTest` + Testcontainers (el mismo patrón real de PostgreSQL efímero del Módulo 6) que el endpoint persiste de verdad, con el esquema gestionado por Flyway. **Nota (Spring Boot 4):** `TestRestTemplate` requiere `spring-boot-restclient` (scope normal) + `spring-boot-resttestclient` (scope `test`) en el `pom.xml`, y `@AutoConfigureTestRestTemplate` explícito en el test — ver Módulo 10 Tema 1 para el detalle completo de esta dependencia:

```java
// src/test/java/io/academia/integrador/ArquitecturaIntegradaTest.java
package io.academia.integrador;

import io.academia.integrador.repository.TareaRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.resttestclient.TestRestTemplate;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class ArquitecturaIntegradaTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void propiedades(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @LocalServerPort
    private int puerto;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private TareaRepository tareaRepository;

    @Test
    void elEndpointPersisteRealmenteContraPostgresConEsquemaDeFlyway() {
        var respuesta = restTemplate.postForEntity(
            "http://localhost:" + puerto + "/api/tareas?descripcion=Entregar+paquete", null, Long.class);

        assertThat(respuesta.getStatusCode().value()).isEqualTo(201);
        assertThat(tareaRepository.findById(respuesta.getBody())).isPresent();
        assertThat(tareaRepository.findById(respuesta.getBody()).get().getDescripcion())
            .isEqualTo("Entregar paquete");
    }
}
```

```bash
./mvnw test -Dtest=ArquitecturaIntegradaTest
```

**Resultado esperado:** `BUILD SUCCESS` con el test en verde: contra un PostgreSQL real y efímero (Testcontainers, no una base simulada), la petición HTTP real crea una `Tarea`, Flyway gestiona el esquema `tarea` desde `V1__crear_tarea.sql`, y `TareaRepository.findById(...)` confirma que el registro fue persistido de verdad con la descripción correcta.

**Fallo deliberado:** borra `src/main/resources/db/migration/V1__crear_tarea.sql` (sin agregar `spring.jpa.hibernate.ddl-auto` como alternativa) y ejecuta de nuevo el test. La aplicación falla al arrancar con un error real de Hibernate (`org.hibernate.tool.schema.spi.SchemaManagementException: Schema-validation: missing table [tarea]`, el mismo error visto en el Módulo 3) — diagnostica confirmando que sin una migración versionada, no existe ningún mecanismo que cree la tabla `tarea`, y la aplicación se niega a arrancar en vez de fallar silenciosamente más tarde. Restaura el archivo antes de continuar.

1. Agrega un segundo endpoint `GET /api/tareas/{id}` y un test de integración que confirme, contra el mismo contenedor Postgres, que devuelve la tarea recién creada.
2. Agrega una segunda migración `V2__agregar_indice_propietario.sql` con un índice sobre `propietario`, y confirma con un test que Flyway aplica ambas migraciones en orden al arrancar.
3. Provoca deliberadamente un conflicto de versión de Flyway (dos migraciones `V2__...`) y documenta el error real que Flyway produce al detectarlo.
4. Escribe de memoria (sin mirar) la estructura de paquetes `controller/service/repository` y un test `@SpringBootTest` + Testcontainers que confirme persistencia real. Compara después contra el patrón de la demostración guiada.

**Pista:** `Testcontainers` descarga y arranca un PostgreSQL real la primera vez que ejecutas el test — las ejecuciones posteriores reutilizan la imagen ya descargada, pero cada test sigue arrancando un contenedor nuevo y efímero, garantizando aislamiento entre ejecuciones.

#### Aplica

**Completa el código:** rellena el espacio con el método de `JpaRepository` que persiste una nueva entidad:

```java
public Tarea crear(String descripcion, String propietario) {
    return repository.____(new Tarea(descripcion, propietario));
}
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, las tres capas (`controller`/`service`/`repository`) de un endpoint que crea una entidad, y un test `@SpringBootTest` con Testcontainers que confirme la persistencia real. Compara después contra el patrón de la demostración guiada.

**Checklist de salida.**

- [ ] `POST /api/tareas` responde `201` y devuelve el `id` de la tarea creada.
- [ ] `GET /api/tareas/{id}` devuelve la misma tarea contra el contenedor PostgreSQL.
- [ ] Flyway aplica `V1__crear_tarea.sql` al arrancar, sin `ddl-auto`.
- [ ] `ArquitecturaIntegradaTest` pasa completo contra PostgreSQL real de Testcontainers.
- [ ] Puedes explicar qué capa valida HTTP, cuál decide la lógica y cuál accede a datos.

**Si falla.** Si el contexto no arranca con `Schema-validation: missing table [tarea]`, falta la migración `V1__...` o Flyway no está habilitado; restaura el archivo antes de tocar `ddl-auto`. Si Testcontainers no levanta, comprueba que Docker está activo y lee la primera línea `Caused by:` del arranque.

Ya ensamblas una arquitectura por capas real, con esquema gestionado por Flyway y verificada contra PostgreSQL real vía Testcontainers. El siguiente tema añade seguridad JWT y una métrica de negocio a este mismo endpoint. Fuente oficial: [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/).

**Errores comunes:** mezclar lógica de negocio dentro del controller; confiar en `ddl-auto` en vez de migraciones versionadas para el proyecto final.

**Cuándo no usarlo:** para un script de un único uso sin necesidad de evolución futura del esquema, la separación completa en capas y migraciones versionadas es una inversión desproporcionada.

### Tema 2: Integrando seguridad, persistencia y observabilidad · Experto · 2 h 40 min

**Prerrequisito:** Tema 1 de este módulo; Módulos 4 (JWT) y 7 (Actuator) de este track.

**Al terminar podrás:** proteger el endpoint del Tema 1 con JWT real (reutilizando el `JwtService` del Módulo 4), y confirmar con un test real que un `Counter` de Actuator se incrementa exactamente una vez por cada tarea creada exitosamente.

#### Aprende

**¿Por qué es importante?** Un microservicio productivo no expone un endpoint de escritura sin protección: la seguridad, la validación, la persistencia y la observabilidad colaboran activamente en cada petición individual, cada una aportando su responsabilidad específica sin invadir la de las demás.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| `@PreAuthorize("hasRole('USER')")` a nivel de método | Núcleo | La anotación sobre `crear(...)` y el test `sinAutenticacionElServidorResponde401` que espera `401` |
| `@EnableMethodSecurity` como habilitador | Prerrequisito | `SecurityConfig` anota la clase con `@EnableMethodSecurity` para que `@PreAuthorize` surta efecto |
| `Counter` de Micrometer en el servicio | Núcleo | `Counter.builder("tareas.creadas")...register(registry)` e `tareasCreadas.increment()` dentro de `crear(...)` |
| Lectura real del contador antes/después | Diagnóstico | El test lee `meterRegistry.counter("tareas.creadas").count()` y comprueba `despues == antes + 1.0` |
| `SecurityFilterChain` con reglas por ruta | Variante | `.requestMatchers("/actuator/health").permitAll()` y `.anyRequest().authenticated()` |
| Autenticación general vs. rol específico | Límite | Quitar `@PreAuthorize` deja el endpoint en `201` aunque la cadena siga exigiendo autenticación |
| Métrica en el punto de la operación | Error frecuente | "Si falla" indica incrementar la métrica en el método que persiste, no en el controlador |
| Proteger o no un endpoint de solo lectura | Decisión | "Cuándo no usarlo" descarta auth y métricas dedicadas para lecturas sin datos sensibles |

Cada fila tiene su explicación individual a continuación.

**`@PreAuthorize("hasRole('USER')")` a nivel de método (núcleo).** La anotación sobre `crear(...)` exige que el usuario autenticado posea el rol `USER` antes de ejecutar el método. El mecanismo es una comprobación de autorización declarativa a nivel de método, independiente de la autenticación general; su efecto observable es que el test `conRolUserSeCreaLaTareaYElContadorSeIncrementa` recibe `201` sólo cuando el `RequestPostProcessor` aporta `roles("USER")`.

**`@EnableMethodSecurity` como habilitador (prerrequisito).** `SecurityConfig` lleva `@EnableMethodSecurity`, condición sin la cual las anotaciones `@PreAuthorize` serían ignoradas en silencio. Es un prerrequisito porque activa el aspecto que intercepta las llamadas a métodos anotados; omitirlo es un error sutil en el que la anotación existe pero nunca se evalúa, dejando el endpoint abierto a cualquier usuario autenticado.

**`Counter` de Micrometer en el servicio (núcleo).** `TareaService` construye `Counter.builder("tareas.creadas").description(...).register(registry)` en el constructor y llama `tareasCreadas.increment()` dentro de `crear(...)`, justo después de `repository.save(...)`. El mecanismo liga el incremento al éxito de la operación de negocio; el resultado observable es la métrica `tareas.creadas` que crece exactamente una vez por tarea persistida.

**Lectura real del contador antes/después (diagnóstico).** El test captura `antes = meterRegistry.counter("tareas.creadas").count()`, ejecuta la petición y comprueba `despues == antes + 1.0`, leyendo el valor real del mismo registro que usa la aplicación. Esta técnica diagnostica el comportamiento efectivo —no una suposición— y detecta tanto la falta de incremento como un doble incremento accidental.

**`SecurityFilterChain` con reglas por ruta (variante).** El bean `filterChain(HttpSecurity http)` define que `/actuator/health` es público (`permitAll()`) mientras que `anyRequest().authenticated()` protege el resto, con `httpBasic` para simplificar el ejemplo. Es la capa de autorización por URL, una variante complementaria a la autorización por método: filtra por ruta antes de que `@PreAuthorize` evalúe el rol.

**Autenticación general vs. rol específico (límite).** El fallo deliberado quita `@PreAuthorize` y el test deja de pasar porque el endpoint responde `201` a cualquier usuario autenticado: la regla `.anyRequest().authenticated()` sigue exigiendo credenciales, pero ya no comprueba el rol. El límite que revela es que la autenticación general y la autorización por rol son capas distintas, y proteger por rol depende de la anotación explícita a nivel de método.

**Métrica en el punto de la operación (error frecuente).** La sección "Si falla" advierte que, si el contador no se incrementa, hay que incrementar la métrica en el mismo método que persiste la tarea, no en el controlador. El error frecuente es tratar la observabilidad como una idea tardía colocada lejos de la operación real; situar `increment()` junto a `save(...)` garantiza que la métrica refleje creaciones efectivamente persistidas.

**Proteger o no un endpoint de solo lectura (decisión).** "Cuándo no usarlo" plantea que para un endpoint de solo lectura sin datos sensibles ni efecto de negocio medible, exigir autenticación y métricas dedicadas puede ser complejidad innecesaria. La decisión profesional pondera el valor de la protección y la medición contra el coste que añaden, en función de la sensibilidad y el impacto real del endpoint.

**Conceptos clave:** autorización combinada con lógica de negocio, métrica de negocio incrementada en cada operación real.

`@PreAuthorize("hasRole('USER')")` (Módulo 4) protege el endpoint según el rol del usuario autenticado; el servicio subyacente persiste la tarea (Módulo 3) e incrementa un `Counter` de Micrometer (Módulo 7) por cada creación exitosa, exponiendo esa métrica de negocio en `/actuator/metrics/tareas.creadas`. Ninguna de estas capas conoce los detalles internos de las demás: la seguridad no sabe cómo se persiste la tarea, la persistencia no sabe qué rol se requirió para llegar hasta ahí.

**Analogía:** este endpoint integrado es un trámite de oficina que combina verificación de identidad (seguridad), revisión de que el formulario esté completo (validación), archivo final (persistencia) y un contador físico de trámites procesados (métrica), todo coordinado en una única operación coherente.

**Diagrama:**

```mermaid
sequenceDiagram
  participant C as Cliente
  participant F as JwtFilter
  participant Ctrl as TareaController
  participant S as TareaService
  participant M as Counter (Micrometer)
  C->>F: POST /api/tareas + JWT
  F->>Ctrl: token válido, rol USER
  Ctrl->>S: crear(descripcion, propietario)
  S->>S: repository.save(...)
  S->>M: counter.increment()
  S-->>C: 201 Created
```

#### Practica

Continuando en `demo-integrador` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `mkdir demo-seguridad && cd demo-seguridad && curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web,data-jpa,security,actuator -d javaVersion=25 -o app.zip && unzip app.zip`), crea `src/main/java/io/academia/integrador/security/` reutilizando el `JwtService` del Módulo 4, y actualiza `TareaService` para incrementar un `Counter`:

```bash
mkdir -p src/main/java/io/academia/integrador/security
```

```java
// src/main/java/io/academia/integrador/security/SecurityConfig.java
package io.academia.integrador.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/health").permitAll()
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults()) // simplificado para este ejemplo; el Módulo 4 usa JwtFilter completo
            .build();
    }
}
```

```java
// src/main/java/io/academia/integrador/service/TareaService.java (actualizado)
package io.academia.integrador.service;

import io.academia.integrador.Tarea;
import io.academia.integrador.repository.TareaRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

@Service
public class TareaService {
    private final TareaRepository repository;
    private final Counter tareasCreadas;

    public TareaService(TareaRepository repository, MeterRegistry registry) {
        this.repository = repository;
        this.tareasCreadas = Counter.builder("tareas.creadas")
            .description("Total de tareas creadas exitosamente")
            .register(registry);
    }

    public Tarea crear(String descripcion, String propietario) {
        Tarea tarea = repository.save(new Tarea(descripcion, propietario));
        tareasCreadas.increment();
        return tarea;
    }
}
```

```java
// src/main/java/io/academia/integrador/controller/TareaController.java (actualizado)
package io.academia.integrador.controller;

import io.academia.integrador.Tarea;
import io.academia.integrador.service.TareaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {
    private final TareaService servicio;

    public TareaController(TareaService servicio) {
        this.servicio = servicio;
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Long> crear(@RequestParam String descripcion) {
        Tarea tarea = servicio.crear(descripcion, "sistema");
        return ResponseEntity.status(201).body(tarea.getId());
    }
}
```

Confirma con `MockMvc` real (sin token, con token, con rol) que la seguridad y la métrica colaboran correctamente. **Nota (Spring Boot 4):** `AutoConfigureMockMvc` requiere agregar explícitamente `spring-boot-webmvc-test` (scope `test`) al `pom.xml` — en Boot 3.x venía incluido en `spring-boot-starter-test`:

```xml
<!-- dentro de <dependencies> del pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-webmvc-test</artifactId>
    <scope>test</scope>
</dependency>
```

```java
// src/test/java/io/academia/integrador/SeguridadYMetricaTest.java
package io.academia.integrador;

import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SeguridadYMetricaTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MeterRegistry meterRegistry;

    @Test
    void sinAutenticacionElServidorResponde401() throws Exception {
        mockMvc.perform(post("/api/tareas").param("descripcion", "Entregar paquete"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void conRolUserSeCreaLaTareaYElContadorSeIncrementa() throws Exception {
        double antes = meterRegistry.counter("tareas.creadas").count();

        mockMvc.perform(post("/api/tareas")
                .param("descripcion", "Entregar paquete")
                .with(SecurityMockMvcRequestPostProcessors.user("conductor1").roles("USER")))
            .andExpect(status().isCreated());

        double despues = meterRegistry.counter("tareas.creadas").count();
        assertThat(despues).isEqualTo(antes + 1.0); // exactamente una tarea creada, un incremento real
    }
}
```

```bash
./mvnw test -Dtest=SeguridadYMetricaTest
```

**Resultado esperado:** `BUILD SUCCESS` con ambos tests en verde: el primero confirma que sin autenticación el endpoint responde `401` real; el segundo confirma, leyendo el valor REAL del `Counter` antes y después (no una suposición), que una creación exitosa autenticada incrementa `tareas.creadas` en exactamente 1.

**Fallo deliberado:** en `TareaController`, quita `@PreAuthorize("hasRole('USER')")` y ejecuta de nuevo `sinAutenticacionElServidorResponde401`. El test FALLA porque el endpoint ahora responde `201` sin ninguna autenticación (la regla `.anyRequest().authenticated()` en `SecurityConfig` sigue exigiendo autenticación HTTP básica, pero sin `@PreAuthorize` a nivel de método cualquier usuario autenticado, sin importar su rol, puede crear tareas) — diagnostica confirmando que la protección por rol específico depende de la anotación explícita a nivel de método, no solo de la autenticación general configurada en el filtro. Restaura la anotación antes de continuar.

1. Agrega un test que confirme `403` (no `401`) cuando el usuario está autenticado pero con un rol distinto a `USER` (`roles("ADMIN")` en vez de `roles("USER")`, si la regla fuera más estricta que `hasAnyRole`).
2. Expón la métrica también vía `/actuator/metrics/tareas.creadas` y confirma con `MockMvc` que el endpoint de Actuator refleja el mismo valor que `meterRegistry.counter(...).count()`.
3. Agrega un `Timer` de Micrometer que mida la duración real de `TareaService.crear(...)`, y confirma con un test que registra al menos una medición tras una llamada exitosa.
4. Escribe de memoria (sin mirar) un endpoint protegido con `@PreAuthorize`, un `Counter` incrementado en el servicio, y un test que confirme ambos. Compara después contra el patrón de la demostración guiada.

**Pista:** `meterRegistry.counter("tareas.creadas").count()` lee el valor REAL y actual del contador registrado en el `MeterRegistry` de la aplicación bajo test — no una copia ni una simulación, el mismo objeto que Actuator expone en `/actuator/metrics`.

#### Aplica

**Completa el código:** rellena el espacio con la anotación que protege el endpoint según el rol del usuario autenticado:

```java
@PostMapping
@____("hasRole('USER')")
public ResponseEntity<Long> crear(@RequestParam String descripcion) { ... }
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un endpoint protegido, un `Counter` de Micrometer incrementado en el servicio, y un test `MockMvc` que confirme el incremento real. Compara después contra el patrón de la demostración guiada.

**Checklist de salida.**

- [ ] Sin autenticación, `POST /api/tareas` responde `401`.
- [ ] Con un JWT de rol `USER`, la creación responde `201`.
- [ ] `tareas.creadas` aumenta exactamente en 1 en cada creación exitosa, leído antes y después.
- [ ] La métrica se consulta en `/actuator/metrics/tareas.creadas`.
- [ ] `SeguridadYMetricaTest` pasa completo.

**Si falla.** Si sin token recibes `201`, falta `@PreAuthorize` o la regla del `SecurityFilterChain` no cubre la ruta. Si el contador no se incrementa, incrementa la métrica en el mismo método que persiste la tarea, no en el controlador. Si Actuator responde `404`, revisa qué endpoints expone la configuración.

Ya combinas seguridad, persistencia y observabilidad colaborando en una única operación real, verificada de extremo a extremo. El siguiente y último tema de este módulo cierra el track con una verificación automatizada de que el proyecto cumple el estándar de "productivo". Fuente oficial: [Spring Security — Method Security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html).

**Errores comunes:** dejar endpoints sensibles protegidos solo por autenticación general sin verificar el rol específico requerido; agregar métricas como una idea tardía en vez de incrementarlas en el mismo punto donde ocurre la operación de negocio real.

**Cuándo no usarlo:** para un endpoint de solo lectura sin ningún dato sensible ni efecto de negocio medible, exigir autenticación y métricas dedicadas puede ser una capa de complejidad innecesaria.

Integrar seguridad, persistencia y observabilidad en una sola pieza es exactamente el objetivo del proyecto integrador de este track (microservicio productivo, Módulo 12), y este tema lo construye directamente.

### Tema 3: Cierre del track y próximos pasos · Experto · 1 h 20 min

**Prerrequisito:** Temas 1 y 2 de este módulo.

**Al terminar podrás:** escribir un test de configuración real que actúa como guardia automatizada del estándar "productivo" del proyecto (sin `ddl-auto` inseguro, con Flyway habilitado), evitando que una regresión de configuración pase desapercibida en una revisión de código futura.

#### Aprende

**¿Por qué es importante?** Un microservicio Spring Boot "productivo" no se define únicamente por tener un CRUD funcional: es la combinación de seguridad declarativa, persistencia versionada, observabilidad desde el primer día y una suite de tests que da confianza real para desplegar sin temor. Un test que verifica automáticamente estas propiedades de configuración evita que alguien reintroduzca `ddl-auto=update` sin darse cuenta del riesgo.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia |
|---|---|---|
| Test de configuración como guardia | Núcleo | `ProduccionReadyTest.elProyectoNoUsaDdlAutoInseguroYFlywayEstaHabilitado()` falla si la configuración es insegura |
| `@Value` con valor por defecto | Prerrequisito | `@Value("${spring.jpa.hibernate.ddl-auto:validate}")` inyecta el valor real o `validate` por defecto |
| Valores seguros de `ddl-auto` | Núcleo | `assertThat(ddlAuto).isIn("validate", "none")` y nunca `update`/`create` |
| Flyway habilitado | Núcleo | `@Value("${spring.flyway.enabled:true}")` y `assertThat(flywayHabilitado).isTrue()` |
| Mensaje de fallo explícito | Diagnóstico | `withFailMessage("ddl-auto='%s' es inseguro para producción...", ddlAuto)` |
| Regresión atrapada en CI | Límite | Añadir `ddl-auto=update` hace fallar el test antes de cualquier despliegue |
| Microservicio productivo vs. CRUD funcional | Decisión | El diagrama distingue "productivo" (seguridad + versionado + observabilidad + tests) de un CRUD |
| Guardia innecesaria en un experimento | Error frecuente | "Cuándo no usarlo" pospone la guardia para un experimento sin intención de desplegar |

Cada fila tiene su explicación individual a continuación.

**Test de configuración como guardia (núcleo).** `ProduccionReadyTest` carga el contexto con `@SpringBootTest` y, en `elProyectoNoUsaDdlAutoInseguroYFlywayEstaHabilitado()`, comprueba dos propiedades reales de la configuración. El mecanismo convierte una convención de equipo ("no usar `ddl-auto` inseguro") en una regla verificada por CI en cada build; su efecto es que una regresión de configuración falla el build automáticamente en lugar de depender de la vista humana en una revisión de código.

**`@Value` con valor por defecto (prerrequisito).** `@Value("${spring.jpa.hibernate.ddl-auto:validate}")` inyecta el valor realmente cargado por el contexto, o `validate` si la propiedad no está presente. Es el prerrequisito técnico que permite leer configuración como dato verificable dentro del test; el valor por defecto tras los dos puntos evita que una propiedad ausente provoque un fallo de inyección y mantiene el test determinista.

**Valores seguros de `ddl-auto` (núcleo).** La aserción `assertThat(ddlAuto).isIn("validate", "none")` fija los únicos valores aceptables cuando el esquema lo gestiona Flyway, excluyendo `update` y `create` que alterarían la base sin revisión. El mecanismo es una lista blanca de valores; su resultado observable es que el test pasa sólo mientras el proyecto deja la generación de esquema en manos de las migraciones versionadas.

**Flyway habilitado (núcleo).** `@Value("${spring.flyway.enabled:true}")` lee si Flyway está activo y `assertThat(flywayHabilitado).isTrue()` lo exige. Esto complementa a la comprobación de `ddl-auto`: no basta con desactivar la generación automática de Hibernate, también debe existir el mecanismo que efectivamente crea y versiona el esquema, pues deshabilitar Flyway dejaría la base sin ninguna fuente de verdad.

**Mensaje de fallo explícito (diagnóstico).** `withFailMessage("ddl-auto='%s' es inseguro para producción; usa 'validate' o 'none' con Flyway", ddlAuto)` adjunta a la aserción un mensaje que nombra el valor ofensivo y la corrección. Su papel diagnóstico es que, cuando el test falla, quien lo lee entiende de inmediato qué propiedad rompió la regla y cómo arreglarla, sin tener que inspeccionar el stack trace.

**Regresión atrapada en CI (límite).** El fallo deliberado añade `spring.jpa.hibernate.ddl-auto=update` a `application.yml` y el test falla con el mensaje real sobre valor inseguro. El límite que demuestra es el punto donde la guardia actúa: atrapa la regresión en CI, antes del despliegue, en lugar de descubrirla en producción cuando Hibernate alterase el esquema real en silencio.

**Microservicio productivo vs. CRUD funcional (decisión).** El diagrama contrasta un "microservicio productivo" —seguridad declarativa, persistencia versionada, observabilidad desde el día 1 y tests reales— frente a un simple CRUD funcional, y enumera próximos pasos como Arquitectura Hexagonal/DDD, CQRS+Event Sourcing y OIDC. La decisión profesional es qué propiedades elevar a estándar verificado, entendiendo que "funciona" no equivale a "listo para producción".

**Guardia innecesaria en un experimento (error frecuente).** "Cuándo no usarlo" admite que para un experimento de aprendizaje sin intención de desplegar, un test de guardia de configuración es una formalidad posponible. El error frecuente correlativo sería imponer esa ceremonia en todo contexto; la lección matiza que la guardia cobra valor cuando el proyecto efectivamente se dirige a producción.

**Conceptos clave:** microservicio productivo frente a CRUD funcional, verificación de configuración como código.

Verificar manualmente, en cada revisión de código, que nadie reintrodujo `spring.jpa.hibernate.ddl-auto=update` en `application.yml` es propenso a error humano; un test de `ApplicationContextRunner` (Módulo 5) que falla automáticamente si esa propiedad tiene un valor inseguro convierte una convención de equipo en una regla verificada por CI en cada build.

**Analogía:** un microservicio productivo completo es un edificio con todos sus sistemas esenciales funcionando de forma coordinada desde el primer día (seguridad, mantenimiento documentado, sensores de monitoreo); un test de configuración como guardia es la inspección automática que impide que alguien desconecte un sistema de seguridad sin que nadie lo note hasta el incidente.

**Diagrama:**

```
┌── Microservicio productivo ────────────────────────────┐
│ seguridad declarativa + persistencia versionada         │
│ + observabilidad desde el día 1 + tests reales           │
└──────────────────────────────────────────────────┘
┌── Próximos pasos ──────────────────────────────────────┐
│ Arquitectura Hexagonal/DDD | CQRS+Event Sourcing | OIDC   │
└──────────────────────────────────────────────────┘
```

#### Practica

Continuando en `demo-integrador` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía y genera un proyecto nuevo con `mkdir demo-checklist && cd demo-checklist && curl -fsSL https://start.spring.io/starter.zip -d type=maven-project -d dependencies=web,data-jpa,flyway,actuator -d javaVersion=25 -o app.zip && unzip app.zip`), crea `src/test/java/io/academia/integrador/ProduccionReadyTest.java`:

```bash
mkdir -p src/test/java/io/academia/integrador
```

```java
// src/test/java/io/academia/integrador/ProduccionReadyTest.java
package io.academia.integrador;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Value;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ProduccionReadyTest {

    @Value("${spring.jpa.hibernate.ddl-auto:validate}")
    private String ddlAuto;

    @Value("${spring.flyway.enabled:true}")
    private boolean flywayHabilitado;

    @Test
    void elProyectoNoUsaDdlAutoInseguroYFlywayEstaHabilitado() {
        assertThat(ddlAuto).isIn("validate", "none")
            .withFailMessage("ddl-auto='%s' es inseguro para producción; usa 'validate' o 'none' con Flyway", ddlAuto);
        assertThat(flywayHabilitado).isTrue();
    }
}
```

```bash
./mvnw test -Dtest=ProduccionReadyTest
```

**Resultado esperado:** `BUILD SUCCESS` con el test en verde: confirma, leyendo la configuración REAL cargada por el contexto de Spring (no un valor asumido), que `ddl-auto` está en `validate` o `none` (nunca `update` o `create`) y que Flyway está habilitado — las dos propiedades que, si se reintrodujeran incorrectamente, comprometerían el manejo seguro del esquema de base de datos que el Tema 1 estableció.

**Fallo deliberado:** agrega `spring.jpa.hibernate.ddl-auto=update` a `application.yml` (una regresión común cuando alguien "solo quiere probar algo rápido" localmente y olvida revertirlo) y ejecuta de nuevo el test. FALLA con el mensaje real `ddl-auto='update' es inseguro para producción; usa 'validate' o 'none' con Flyway` — diagnostica confirmando que este test actúa exactamente como una guardia automatizada: atrapa en CI, antes de cualquier despliegue, una regresión de configuración que de otro modo solo se descubriría en producción cuando Hibernate silenciosamente alterara el esquema real sin revisión. Revierte el cambio antes de continuar.

1. Agrega una aserción que confirme que `spring.security` no está deshabilitado accidentalmente (por ejemplo, verificando que el bean `SecurityFilterChain` existe en el contexto).
2. Documenta, en el README del proyecto, un resumen de las decisiones de arquitectura tomadas en los tres temas de este módulo (estructura de capas, seguridad por rol, métrica de negocio, guardia de configuración).
3. Investiga (sin necesitar implementarlo) cómo `CQRS`/`Event Sourcing` cambiarían la forma en que `TareaService.crear(...)` registra el cambio de estado, comparado con el `save(...)` directo actual, y documenta la comparación en una frase.
4. Escribe de memoria (sin mirar) un test `@Value` + `ApplicationContextRunner`-style que confirme que `ddl-auto` nunca es `update` en el proyecto. Compara después contra el patrón de la demostración guiada.

**Pista:** `@Value("${propiedad:valorPorDefecto}")` inyecta el valor REAL cargado por el contexto de Spring en tiempo de test, incluyendo el valor por defecto si la propiedad no está presente — una forma directa de convertir una convención de configuración en una aserción verificable.

#### Aplica

**Completa el código:** rellena el espacio con los dos valores seguros que `ddl-auto` puede tener en un proyecto que usa Flyway:

```java
assertThat(ddlAuto).isIn("____", "____");
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un test que lea `ddl-auto` con `@Value` y falle si su valor es inseguro. Compara después contra el patrón de la demostración guiada.

**Checklist de salida.**

- [ ] `ProduccionReadyTest` pasa con `ddl-auto` en `validate` o `none`.
- [ ] El test falla al introducir `ddl-auto=update` y vuelve a pasar al revertirlo.
- [ ] `spring.flyway.enabled` es `true` y el contexto arranca.
- [ ] Existe un test que confirma que el bean `SecurityFilterChain` está en el contexto.
- [ ] El README del proyecto resume las decisiones de los tres temas.

**Si falla.** Si el test no lee la propiedad, revisa el nombre exacto en `application.yml` y el valor por defecto de `@Value`. Si el contexto no arranca al deshabilitar Flyway, el fallo es de esquema y no del test: restaura la migración antes de seguir.

Ya conviertes el estándar de "microservicio productivo" (seguridad, persistencia versionada, observabilidad, tests reales) en un test ejecutable que actúa como guardia automatizada contra regresiones de configuración. Esto cierra el track completo de Spring Boot; el laboratorio práctico (a continuación) aplica estos mismos principios a un proyecto propio de confirmación transaccional. Fuente oficial: [The Twelve-Factor App](https://12factor.net/) y [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/).

**Errores comunes:** mezclar capas sin ownership claro; ignorar seguridad en endpoints de escritura; no medir el comportamiento real de negocio con métricas propias, dependiendo solo de métricas técnicas genéricas.

**Cuándo no usarlo:** para un experimento de aprendizaje personal sin intención de desplegarlo nunca a producción, un test de guardia de configuración es una formalidad que puede posponerse hasta que el proyecto efectivamente lo requiera.

---

## Laboratorio práctico

**Objetivo del laboratorio:** construir el microservicio integrador completo con auth, persistencia real, Actuator y tests de integración.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Diseñar la arquitectura por capas completa | Ver Tema 1 | controller/service/repository/dto |
| 2 | Implementar persistencia con migraciones Flyway | Módulo 3 | Sin `ddl-auto` |
| 3 | Proteger endpoints con Spring Security + JWT | Módulo 4 | Autorización por rol |
| 4 | Exponer Actuator con una métrica de negocio | Módulo 7 | Verifica en `/actuator/metrics` |
| 5 | Escribir tests de integración con Testcontainers | Módulo 6 | Cubriendo el flujo crítico completo |

**Verificación:** el laboratorio (y el track completo) se considera exitoso si el microservicio protege correctamente sus endpoints sensibles, persiste datos reales con un esquema versionado, expone al menos una métrica de negocio custom, y tiene una suite de tests de integración que verifica el flujo crítico contra infraestructura real.

**Errores comunes y soluciones**

- **Dejar endpoints sensibles sin protección de autorización.** Verifica que cada endpoint tenga la anotación de autorización apropiada según su sensibilidad.
- **Confiar en `ddl-auto` en vez de migraciones versionadas para el proyecto final.** Usa Flyway consistentemente.
- **Omitir tests de integración del flujo crítico.** Prioriza cubrir con Testcontainers el camino principal completo de la aplicación.

---
