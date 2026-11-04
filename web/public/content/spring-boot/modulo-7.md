# Módulo 7: Observabilidad con Actuator

Actuator reúne señales técnicas y operativas. Cada práctica debe comprobar qué respuesta produce y qué información revela según el entorno.


## Aprende construyendo

### Tema 1: Actuator y health checks personalizados

**¿Por qué es importante?** Actuator permite distinguir la salud del proceso de una dependencia que dejó de responder. Este ejemplo continúa `com.example.demo`, con seguridad JWT y MockMvc de los módulos anteriores.

#### Subtema 7.1 · Registrar una dependencia y su indicador (10 min)

**Contexto.** La aplicación necesita reportar si la pasarela de pagos responde. Un `HealthIndicator` convierte esa comprobación en un estado que Actuator combina con los demás indicadores.

**Hazlo tú.** Agrega esta dependencia a `pom.xml`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

Crea `src/main/java/com/example/demo/ServicioExterno.java`:

```java
package com.example.demo;

import org.springframework.stereotype.Component;

@Component
public class ServicioExterno {
    private volatile boolean disponible = true;

    public boolean estaDisponible() { return disponible; }
    public void marcarComoNoDisponible() { disponible = false; }
    public void marcarComoDisponible() { disponible = true; }
}
```

Crea `src/main/java/com/example/demo/ServicioExternoHealthIndicator.java`:

```java
package com.example.demo;

import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("pasarelaPagos")
public class ServicioExternoHealthIndicator implements HealthIndicator {
    private final ServicioExterno servicioExterno;

    public ServicioExternoHealthIndicator(ServicioExterno servicioExterno) {
        this.servicioExterno = servicioExterno;
    }

    @Override
    public Health health() {
        return servicioExterno.estaDisponible()
            ? Health.up().build()
            : Health.down().withDetail("razon", "pasarela no responde").build();
    }
}
```

**Resultado esperado.** Spring registra un `ServicioExterno` y un indicador llamado `pasarelaPagos`. En Boot 4, `Health` y `HealthIndicator` se importan desde `org.springframework.boot.health.contributor`. La ruta `/actuator/health` ya está expuesta por defecto; no añadas `metrics`, `info` ni `*` para esta práctica.

#### Subtema 7.2 · Comprobar `UP`, `DOWN` y acceso protegido (10 min)

**Contexto.** Un estado falso puede esconder un incidente. Comprueba el componente, el estado general y la respuesta HTTP con la seguridad del proyecto activa.

**Hazlo tú.** En `src/test/resources/application.properties` agrega opciones solo para los tests; el valor productivo predeterminado no muestra detalles:

```properties
management.endpoint.health.show-details=always
management.endpoint.health.show-components=always
```

Crea `src/test/java/com/example/demo/ActuatorHealthTest.java`:

```java
package com.example.demo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ActuatorHealthTest {
    @Autowired MockMvc mockMvc;
    @Autowired ServicioExterno servicioExterno;
    @Autowired JwtService jwtService;

    @BeforeEach
    void dejaLaDependenciaDisponible() {
        servicioExterno.marcarComoDisponible();
    }

    @Test
    void saludUpCuandoLaDependenciaResponde() throws Exception {
        mockMvc.perform(get("/actuator/health")
                .header("Authorization", bearer()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.components.pasarelaPagos.status").value("UP"));
    }

    @Test
    void saludDownCuandoLaDependenciaFalla() throws Exception {
        servicioExterno.marcarComoNoDisponible();

        mockMvc.perform(get("/actuator/health")
                .header("Authorization", bearer()))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.status").value("DOWN"))
            .andExpect(jsonPath("$.components.pasarelaPagos.status").value("DOWN"));
    }

    @Test
    void saludNoEsPublicaEnEstaConfiguracion() throws Exception {
        mockMvc.perform(get("/actuator/health"))
            .andExpect(status().isUnauthorized());
    }

    private String bearer() {
        return "Bearer " + jwtService.generar("monitor@rutaflow.dev", "ADMIN");
    }
}
```

Ejecuta:

```bash
./mvnw -q -Dtest=ActuatorHealthTest test
```

**Resultado esperado.** Pasan tres métodos: la dependencia disponible produce `200/UP`, la caída produce `503/DOWN`, y esta cadena de seguridad responde `401` sin JWT. El token se firma con el `JwtService` real.

#### Subtema 7.3 · Diagnosticar un estado `UP` falso (10 min)

**Contexto.** El indicador se llama `pasarelaPagos` para no chocar con el bean `ServicioExterno`. El ID que aparece bajo `components` sale del nombre del bean.

**Hazlo tú.** En `ServicioExternoHealthIndicator`, cambia la rama caída para devolver `Health.up()`:

```java
: Health.up().withDetail("razon", "pasarela no responde").build();
```

Ejecuta solo el caso de caída:

```bash
./mvnw -q -Dtest=ActuatorHealthTest#saludDownCuandoLaDependenciaFalla test
```

**Fallo deliberado observado.** La prueba esperaba `503` y recibió `200`: el indicador ocultó la dependencia caída. Restaura `Health.down()` y ejecuta los tres métodos.

#### Entiende y cierra

`HealthIndicator.health()` devuelve una señal; Actuator agrega sus indicadores para formar `/actuator/health`. `DOWN` se mapea a HTTP `503`. El nombre explícito `pasarelaPagos` evita colisionar con `ServicioExterno` y fija el ID JSON. Este endpoint sigue protegido por el `SecurityConfig` de la academia, por eso el test usa JWT. En una plataforma real, configura por separado cómo lo consultará el orquestador, por ejemplo en un puerto de gestión y una red limitada.

En producción conserva `management.endpoint.health.show-details=never` o configura `when-authorized` con roles. `always` solo está en recursos de test porque puede revelar nombres y diagnósticos. Un fallo de una dependencia externa suele afectar **readiness**, no **liveness**: reiniciar todas las instancias no arregla una pasarela caída y puede agravar el incidente; el siguiente tema detalla esa diferencia.

**Evidencia para avanzar:** tres tests pasan, puedes explicar `200/UP`, `503/DOWN` y `401` sin token, y el fallo deliberado se detecta y revierte. El resultado cubre MockMvc con el contexto Spring; no prueba una red externa, TLS, el orquestador ni el navegador. Documentación primaria: [Spring Boot 4.1.2 — Health Information y `HealthIndicator`](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.health), [API `HealthIndicator`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/health/contributor/HealthIndicator.html) y [Starter Actuator 4.1.2](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html).

### Tema 2: Contar operaciones de negocio con Micrometer

**¿Por qué es importante?** La cantidad de tareas creadas responde una pregunta del negocio. Sin un contador visible, el equipo solo ve detalles técnicos y no puede seguir esa actividad durante una ventana de tiempo.

#### Subtema 7.4 · Registrar un contador en el servicio real (10 min)

**Contexto.** Actuator ya agrega Micrometer. El contador se incrementará después de guardar una tarea y llevará un tag fijo `origen=api`. No uses ID de pedido, usuario o texto libre como tag: cada valor nuevo crea otra serie de métricas y puede agotar memoria.

**Hazlo tú.** Modifica `src/main/java/com/example/demo/ServicioTareas.java`. Agrega los imports y el campo:

```java
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;

private final Counter tareasCreadas;
```

Añade `MeterRegistry` al constructor y registra el contador una sola vez:

```java
public ServicioTareas(
        TareaRepository repository,
        TareaMapper mapper,
        MeterRegistry registry) {
    this.repository = repository;
    this.mapper = mapper;
    this.tareasCreadas = Counter.builder("rutaflow.tareas.creadas")
        .description("Tareas creadas correctamente")
        .tag("origen", "api")
        .register(registry);
}
```

En `crear`, incrementa solo cuando el guardado regresó correctamente:

```java
public TareaDTO crear(CrearTareaRequest request) {
    Tarea tarea = new Tarea(request.titulo(), request.prioridad(), "BODEGA-A");
    TareaDTO creada = mapper.toDto(repository.save(tarea));
    tareasCreadas.increment();
    return creada;
}
```

**Resultado esperado.** Spring inyecta el `MeterRegistry` y `rutaflow.tareas.creadas` arranca en `0`. El tag es fijo y acotado. La métrica describe actividad del proceso; la base de datos conserva los registros de negocio.

#### Subtema 7.5 · Verificar valor y tag en el endpoint (10 min)

**Contexto.** El registry puede tener datos aunque el endpoint no esté expuesto. En pruebas habilita solo `health,metrics`; en producción la exposición HTTP de `metrics` requiere una decisión y seguridad explícitas.

**Hazlo tú.** En `src/test/resources/application.properties` añade:

```properties
management.endpoints.web.exposure.include=health,metrics
```

Crea `src/test/java/com/example/demo/MetricasTareasTest.java`:

```java
package com.example.demo;

import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MetricasTareasTest {
    @Autowired MockMvc mockMvc;
    @Autowired MeterRegistry registry;
    @Autowired JwtService jwtService;

    @Test
    void crearTareaIncrementaContadorYSePublicaEnActuator() throws Exception {
        double antes = registry.find("rutaflow.tareas.creadas")
            .tag("origen", "api").counter().count();
        String token = "Bearer " + jwtService.generar("metricas@rutaflow.dev", "ADMIN");

        mockMvc.perform(post("/api/tareas")
                .header("Authorization", token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"titulo\":\"Paquete frágil\",\"prioridad\":2}"))
            .andExpect(status().isCreated());

        assertThat(registry.find("rutaflow.tareas.creadas")
            .tag("origen", "api").counter().count()).isEqualTo(antes + 1);

        mockMvc.perform(get("/actuator/metrics/rutaflow.tareas.creadas")
                .header("Authorization", token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("rutaflow.tareas.creadas"))
            .andExpect(jsonPath("$.availableTags[0].tag").value("origen"))
            .andExpect(jsonPath("$.availableTags[0].values[0]").value("api"))
            .andExpect(jsonPath("$.measurements[0].value").value(antes + 1));
    }

    @Test
    void endpointMetricsRequiereAutenticacion() throws Exception {
        mockMvc.perform(get("/actuator/metrics/rutaflow.tareas.creadas"))
            .andExpect(status().isUnauthorized());
    }
}
```

Ejecuta:

```bash
./mvnw -q -Dtest=MetricasTareasTest test
```

**Resultado esperado.** El primer test crea una tarea real, observa `antes + 1` en `MeterRegistry` y recibe del endpoint el nombre, tag `origen=api` y valor. El segundo confirma `401` sin token. En esta configuración, el endpoint no se expone a usuarios anónimos.

#### Subtema 7.6 · Detectar un contador que nunca sube (10 min)

**Contexto.** Un contador registrado pero nunca incrementado puede parecer válido en el tablero mientras pierde todos los eventos.

**Hazlo tú.** Elimina temporalmente esta línea de `ServicioTareas.crear`:

```java
tareasCreadas.increment();
```

Ejecuta solo el test funcional:

```bash
./mvnw -q -Dtest=MetricasTareasTest#crearTareaIncrementaContadorYSePublicaEnActuator test
```

**Fallo deliberado observado.** El test esperaba que el contador subiera de `0.0` a `1.0`, pero siguió en `0.0`. Restaura el incremento y vuelve a ejecutar ambos métodos.

#### Entiende y cierra

`Counter.builder(...)` registra una métrica en el registry; `increment()` suma una unidad. `ServicioTareas` solo lo hace después del guardado, así que un error antes de guardar no cuenta como éxito. `MeterRegistry` muestra el valor dentro del proceso y `/actuator/metrics/{nombre}` lo consulta; un exporter conecta esa métrica a un sistema que la recoge y conserva fuera del proceso.

Usa tags pequeños y previsibles, como `origen=api`. No pongas IDs únicos en tags ni trates el contador como libro contable: la métrica en memoria no es transaccional ni durable, y el registro persistido sigue siendo la fuente de verdad. Mantén `metrics` fuera de la exposición pública por defecto o protégelo con autenticación/red de gestión.

**Evidencia para avanzar:** un POST real eleva el contador en uno, Actuator devuelve nombre/tag/valor, el endpoint anónimo responde `401` y al retirar `increment()` la prueba falla. Este test comprueba una instancia local; no verifica un exporter ni la recepción por Prometheus. Documentación primaria: [Micrometer — Counters](https://docs.micrometer.io/micrometer/reference/concepts/counters.html), [Spring Boot 4.1.2 — Métricas](https://docs.spring.io/spring-boot/reference/actuator/metrics.html) y [Actuator — Exposición y seguridad de endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.exposing).

### Tema 3: Liveness vs readiness

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar endpoints de liveness y readiness separados, y explicar con evidencia real por qué confundirlos causa reinicios innecesarios en un despliegue orquestado.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Una aplicación podría estar perfectamente viva (sin necesitar reiniciarse) pero temporalmente no lista para recibir tráfico —por ejemplo, durante el arranque mientras inicializa conexiones— un caso donde reiniciar el pod (liveness fallando) sería contraproducente, mientras sacarlo temporalmente de la rotación (readiness fallando) es el comportamiento correcto.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** ¿debe reiniciarse el pod? vs ¿debe recibir tráfico ahora?

`management.endpoint.health.probes.enabled: true` habilita dos endpoints con propósito distinto: `/actuator/health/liveness` responde "¿está la aplicación en un estado tan roto que debería reiniciarse?" (un fallo dispara un reinicio del contenedor), mientras `/actuator/health/readiness` responde "¿está la aplicación actualmente en condiciones de recibir tráfico?" (un fallo simplemente saca temporalmente al pod de la rotación de balanceo, sin reiniciarlo).

**Analogía:** liveness es verificar si una persona sigue consciente y necesita atención médica de emergencia; readiness es verificar si esa misma persona, consciente y sana, está actualmente disponible para atender clientes en este momento específico.

**Diagrama:**

```
┌── liveness: ¿debe reiniciarse el pod? ──────────────┐
│  UP: el proceso está sano, no necesita reinicio          │
│  DOWN: algo irrecuperable, Kubernetes reinicia el pod    │
└──────────────────────────────────────────────┘
┌── readiness: ¿debe recibir tráfico ahora? ──────────┐
│  UP: listo, recibe tráfico normalmente                   │
│  DOWN: sacado temporalmente de la rotación, sin reinicio  │
└──────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-spring` (o créalo desde una carpeta vacía con `mkdir -p academia-spring` si es tu primera vez) y actualiza `src/main/resources/application.properties` para habilitar las sondas separadas:

```bash
mkdir -p academia-spring/src/main/java/com/academia/observabilidad
cd academia-spring
cat >> src/main/resources/application.properties <<'EOF'
management.endpoint.health.probes.enabled=true
management.health.livenessstate.enabled=true
management.health.readinessstate.enabled=true
EOF
```

```java
// src/main/java/com/academia/observabilidad/ControlDisponibilidad.java
package com.academia.observabilidad;

import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

// endpoint de PRUEBA para forzar readiness a REFUSING_TRAFFIC sin afectar liveness
@RestController
public class ControlDisponibilidad {
    private final ApplicationEventPublisher publisher;

    public ControlDisponibilidad(ApplicationEventPublisher publisher) { this.publisher = publisher; }

    @PostMapping("/test/no-listo")
    public void marcarComoNoListo() {
        AvailabilityChangeEvent.publish(publisher, this, ReadinessState.REFUSING_TRAFFIC);
    }

    @PostMapping("/test/listo")
    public void marcarComoListo() {
        AvailabilityChangeEvent.publish(publisher, this, ReadinessState.ACCEPTING_TRAFFIC);
    }
}
```

**Explicación línea por línea:** `management.endpoint.health.probes.enabled=true` activa los grupos `liveness` y `readiness` como endpoints separados; `AvailabilityChangeEvent.publish(publisher, this, ReadinessState.REFUSING_TRAFFIC)` es el mecanismo REAL que Spring Boot expone para cambiar el estado de readiness sin afectar liveness — el mismo mecanismo que usarías internamente durante un apagado ordenado o una recuperación temporal de una dependencia.

Confirma con `MockMvc` real que cambiar readiness NO afecta liveness, la distinción central de este Tema:

```java
// src/test/java/com/academia/observabilidad/LivenessReadinessTest.java
package com.academia.observabilidad;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class LivenessReadinessTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void marcarNoListoAfectaSoloReadinessNoLiveness() throws Exception {
        mockMvc.perform(post("/test/no-listo"));

        mockMvc.perform(get("/actuator/health/readiness"))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.status").value("OUT_OF_SERVICE"));

        mockMvc.perform(get("/actuator/health/liveness"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP")); // liveness NO se ve afectado

        mockMvc.perform(post("/test/listo")); // deja el estado limpio para otros tests
    }
}
```

```bash
mvn test -Dtest=LivenessReadinessTest # Maven
./gradlew test --tests LivenessReadinessTest # Gradle (equivalente)
```

**Resultado esperado:** el test pasa: tras marcar la aplicación como no lista, `/actuator/health/readiness` responde `503` con `OUT_OF_SERVICE`, mientras `/actuator/health/liveness` sigue respondiendo `200` con `UP` — la aplicación sigue perfectamente viva (no necesita reiniciarse), solo temporalmente fuera de la rotación de tráfico, exactamente el comportamiento que este Tema explica.

**Fallo deliberado:** en un despliegue mal configurado (documenta esto sin modificar código, es un error de configuración de infraestructura, no de la aplicación), apunta la sonda de liveness de Kubernetes hacia `/actuator/health/readiness` en vez de `/actuator/health/liveness`. Con esa configuración incorrecta, el mismo escenario de este test (readiness `DOWN` durante una recuperación temporal) haría que Kubernetes interprete la falla de READINESS como si fuera una falla de LIVENESS, reiniciando el pod innecesariamente en vez de simplemente esperar a que vuelva a estar listo — diagnostica confirmando por qué la distinción de este Tema no es solo conceptual: apuntar la sonda equivocada al endpoint equivocado en la configuración de despliegue produce reinicios reales e innecesarios en producción.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un test que confirme que, tras `marcarComoListo()`, `/actuator/health/readiness` vuelve a responder `200` con `UP`.
2. Documenta en una frase, para un escenario de tu elección, cuándo publicarías `LivenessState.BROKEN` (el estado equivalente para liveness) en vez de solo afectar readiness.
3. Combina este Tema con el Tema 1: haz que `ServicioExternoHealthIndicator` publique automáticamente `REFUSING_TRAFFIC` cuando detecta la dependencia caída, y confirma con un test que readiness refleja ese cambio sin intervención manual.
4. Escribe de memoria (sin mirar) un test que confirme que cambiar readiness a `REFUSING_TRAFFIC` no afecta el estado de liveness. Compara después contra el patrón del Paso 4.

**Pista:** `AvailabilityChangeEvent` es el mecanismo idiomático de Spring Boot para este propósito; modificar directamente algún estado interno sin pasar por este evento no actualizaría los endpoints de Actuator correctamente.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para publicar el cambio de estado de readiness:

```java
AvailabilityChangeEvent.publish(publisher, this, ReadinessState.____);
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un test `MockMvc` que confirme que marcar la aplicación como no lista afecta `/actuator/health/readiness` pero no `/actuator/health/liveness`. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya distingues liveness de readiness con evidencia real, confirmando que un cambio de disponibilidad afecta la señal correcta sin disparar un reinicio innecesario. Esto cierra el módulo de observabilidad; el siguiente módulo aborda cómo documentar y versionar esta misma API. **Evidencia:** entrega el resultado de `LivenessReadinessTest` en verde, y la explicación de por qué apuntar la sonda de liveness al endpoint de readiness en la configuración de Kubernetes causaría reinicios innecesarios. Fuente oficial: [Spring Boot — Kubernetes Probes](https://docs.spring.io/spring-boot/reference/actuator/kubernetes-probes.html).

**Errores comunes:** usar un único endpoint de salud genérico en Kubernetes en vez de separar liveness de readiness, causando reinicios innecesarios; apuntar por error la sonda de liveness hacia el endpoint de readiness (o viceversa) en la configuración de despliegue.

**Cuándo no usarlo:** para un despliegue que no corre en un orquestador que distinga estas dos sondas (por ejemplo, un servidor tradicional sin Kubernetes ni un mecanismo equivalente), la distinción liveness/readiness no tiene ningún consumidor real que la aproveche; un único endpoint `/actuator/health` sigue siendo suficiente en ese contexto.

---

Distinguir liveness de readiness es lo que evitará que Kubernetes reinicie innecesariamente el proyecto integrador de este track (microservicio productivo, Módulo 12).

## Laboratorio práctico

**Objetivo del laboratorio:** exponer Actuator con al menos una métrica de negocio custom y health checks apropiados.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Agregar el starter de Actuator | Ver Tema 1 | Expón `/health` y `/metrics` |
| 2 | Crear un health indicator personalizado | Ver Tema 1 | Verifica un servicio externo real |
| 3 | Definir una métrica de negocio custom | Ver Tema 2 | Verifica que aparece en `/actuator/metrics` |
| 4 | Configurar liveness/readiness separados | Ver Tema 3 | Confirmado con `MockMvc`, no solo configurado |
| 5 | Configurar logging estructurado en JSON | — | Consumible por un sistema de logs centralizado |

**Verificación:** el laboratorio se considera exitoso si `/actuator/metrics` muestra la métrica de negocio custom incrementándose correctamente, y si liveness y readiness responden de forma independiente según el estado real de la aplicación, confirmado con tests reales.

**Errores comunes y soluciones**

- **Exponer todos los endpoints de Actuator públicamente sin restricción.** Configura explícitamente `exposure.include` con solo los endpoints necesarios.
- **Solo exponer métricas técnicas genéricas.** Agrega métricas de negocio custom con Micrometer para dar valor al equipo de producto.
- **Usar un único endpoint de salud genérico en Kubernetes.** Separa liveness de readiness para evitar reinicios innecesarios.

---
