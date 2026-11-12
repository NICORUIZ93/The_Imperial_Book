# Módulo 7: Observabilidad con Actuator

Actuator reúne señales técnicas y operativas. Cada práctica debe comprobar qué respuesta produce y qué información revela según el entorno.


**Referencia ejecutable al terminar los módulos 2–7:** en la raíz del repositorio, abre `examples/spring-tareas-rutaflow/README.md`. Incluye el estado final y pruebas; algunas clases incorporan cambios de módulos posteriores. Construye primero las prácticas de este módulo y usa la referencia para comparar y diagnosticar.

## Aprende construyendo

### Tema 1: Actuator y health checks personalizados

**¿Por qué es importante?** Actuator permite distinguir la salud del proceso de una dependencia que dejó de responder. Este ejemplo continúa `com.example.demo`, con seguridad JWT y MockMvc de los módulos anteriores.

#### Subtema 7.1 · Registrar una dependencia y su indicador · 10 min

**Contexto:** La aplicación necesita reportar si la pasarela de pagos responde. Un `HealthIndicator` convierte esa comprobación en un estado que Actuator combina con los demás indicadores.

**Hazlo tú:** Agrega esta dependencia a `pom.xml`:

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

**Resultado esperado:** Spring registra un `ServicioExterno` y un indicador llamado `pasarelaPagos`. En Boot 4, `Health` y `HealthIndicator` se importan desde `org.springframework.boot.health.contributor`. La ruta `/actuator/health` ya está expuesta por defecto; no añadas `metrics`, `info` ni `*` para esta práctica.


**Fallo deliberado:** Cambia HealthIndicator por HealthIndicador en el import y compila el proyecto. **Diagnóstico:** el tipo no existe; corrige el import de Boot 4 antes de analizar la ruta HTTP.

**Entiende:** El indicador devuelve una señal y Actuator la agrega. El componente no realiza una llamada de red a una pasarela real.

**Cierra:** Señala el bean pasarelaPagos y distingue su bandera local de una dependencia externa medida.

#### Subtema 7.2 · Comprobar `UP`, `DOWN` y acceso protegido · 10 min

**Contexto:** Un estado falso puede esconder un incidente. Comprueba el componente, el estado general y la respuesta HTTP con la seguridad del proyecto activa.

**Hazlo tú:** En `src/test/resources/application.properties` agrega opciones solo para los tests; el valor productivo predeterminado no muestra detalles:

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

**Resultado esperado:** Pasan tres métodos: la dependencia disponible produce `200/UP`, la caída produce `503/DOWN`, y esta cadena de seguridad responde `401` sin JWT. El token se firma con el `JwtService` real.


**Fallo deliberado:** Invierte marcarComoNoDisponible por marcarComoDisponible en el caso DOWN y ejecuta ActuatorHealthTest. **Diagnóstico:** la dependencia sigue disponible y devuelve UP/200, no DOWN/503; restaura la preparación del fallo.

**Entiende:** El test controla el estado de la dependencia para comprobar la respuesta operativa y mantiene la seguridad del proyecto.

**Cierra:** Guarda UP, DOWN y rechazo sin credencial con sus códigos HTTP.

#### Subtema 7.3 · Diagnosticar un estado `UP` falso · 10 min

**Contexto:** El indicador se llama `pasarelaPagos` para no chocar con el bean `ServicioExterno`. El ID que aparece bajo `components` sale del nombre del bean.

**Hazlo tú:** En `ServicioExternoHealthIndicator`, cambia la rama caída para devolver `Health.up()`:

```java
: Health.up().withDetail("razon", "pasarela no responde").build();
```

Ejecuta solo el caso de caída:

```bash
./mvnw -q -Dtest=ActuatorHealthTest#saludDownCuandoLaDependenciaFalla test
```

**Fallo deliberado:** La prueba esperaba `503` y recibió `200`: el indicador ocultó la dependencia caída. Restaura `Health.down()` y ejecuta los tres métodos.


**Resultado esperado:** la mutación produce el fallo descrito; restaurado el código, la clase de pruebas vuelve a pasar. Conserva ambas salidas.

**Entiende:** Un detalle textual de error no fuerza DOWN: el estado elegido por Health es lo que cambia la agregación y el status HTTP.

**Cierra:** Restaura Health.down y explica por qué UP con detalle de fallo ocultaba el incidente.

Archivo de trabajo: `src/main/java/com/example/demo/ServicioExternoHealthIndicator.java`.

#### Entiende y cierra

`HealthIndicator.health()` devuelve una señal; Actuator agrega sus indicadores para formar `/actuator/health`. `DOWN` se mapea a HTTP `503`. El nombre explícito `pasarelaPagos` evita colisionar con `ServicioExterno` y fija el ID JSON. Este endpoint sigue protegido por el `SecurityConfig` de la academia, por eso el test usa JWT. En una plataforma real, configura por separado cómo lo consultará el orquestador, por ejemplo en un puerto de gestión y una red limitada.

En producción conserva `management.endpoint.health.show-details=never` o configura `when-authorized` con roles. `always` solo está en recursos de test porque puede revelar nombres y diagnósticos. Un fallo de una dependencia externa suele afectar **readiness**, no **liveness**: reiniciar todas las instancias no arregla una pasarela caída y puede agravar el incidente; el siguiente tema detalla esa diferencia.

**Evidencia para avanzar:** tres tests pasan, puedes explicar `200/UP`, `503/DOWN` y `401` sin token, y el fallo deliberado se detecta y revierte. El resultado cubre MockMvc con el contexto Spring; no prueba una red externa, TLS, el orquestador ni el navegador. Documentación primaria: [Spring Boot 4.1.2 — Health Information y `HealthIndicator`](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.health), [API `HealthIndicator`](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/health/contributor/HealthIndicator.html) y [Starter Actuator 4.1.2](https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html).


Archivo concreto: `src/main/java/com/example/demo/ServicioExternoHealthIndicator.java`.

**Aplicación y decisión:** En el proyecto integrador, define qué dependencia afecta readiness y qué indicador informa solo diagnóstico. Prueba la caída sin reiniciar el proceso; una bandera de test no mide la latencia de un proveedor real.

### Tema 2: Contar operaciones de negocio con Micrometer

**¿Por qué es importante?** La cantidad de tareas creadas responde una pregunta del negocio. Sin un contador visible, el equipo solo ve detalles técnicos y no puede seguir esa actividad durante una ventana de tiempo.

#### Subtema 7.4 · Registrar un contador en el servicio real · 10 min

**Contexto:** Actuator ya agrega Micrometer. El contador se incrementará después de guardar una tarea y llevará un tag fijo `origen=api`. No uses ID de pedido, usuario o texto libre como tag: cada valor nuevo crea otra serie de métricas y puede agotar memoria.

**Hazlo tú:** Modifica `src/main/java/com/example/demo/ServicioTareas.java`. Agrega los imports y el campo:

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

**Resultado esperado:** Spring inyecta el `MeterRegistry` y `rutaflow.tareas.creadas` arranca en `0`. El tag es fijo y acotado. La métrica describe actividad del proceso; la base de datos conserva los registros de negocio.


**Fallo deliberado:** Elimina tareasCreadas.increment() de crear y ejecuta MetricasTareasTest después de incorporar el test del siguiente subtema. **Diagnóstico:** el contador queda registrado pero no sube al crear; restaura el incremento.

**Entiende:** Registrar un Counter y sumar una unidad son operaciones distintas. La métrica no constituye un registro contable durable.

**Cierra:** Identifica nombre, tag fijo y punto del servicio donde se incrementa.

#### Subtema 7.5 · Verificar valor y tag en el endpoint · 10 min

**Contexto:** El registry puede tener datos aunque el endpoint no esté expuesto. En pruebas habilita solo `health,metrics`; en producción la exposición HTTP de `metrics` requiere una decisión y seguridad explícitas.

**Hazlo tú:** En `src/test/resources/application.properties` añade:

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

**Resultado esperado:** El primer test crea una tarea real, observa `antes + 1` en `MeterRegistry` y recibe del endpoint el nombre, tag `origen=api` y valor. El segundo confirma `401` sin token. En esta configuración, el endpoint no se expone a usuarios anónimos.


**Fallo deliberado:** Quita metrics de management.endpoints.web.exposure.include en la configuración de test. **Diagnóstico:** el endpoint deja de estar expuesto aunque el registry tenga el contador; restaura la exposición solo para el alcance indicado.

**Entiende:** La exposición HTTP y el registro de métrica son fronteras distintas. El test también exige JWT y no prueba un exporter.

**Cierra:** Conserva valor antes/después y nombre/tag/valor leídos desde Actuator.

#### Subtema 7.6 · Detectar un contador que nunca sube · 10 min

**Contexto:** Un contador registrado pero nunca incrementado puede parecer válido en el tablero mientras pierde todos los eventos.

**Hazlo tú:** Elimina temporalmente esta línea de `ServicioTareas.crear`:

```java
tareasCreadas.increment();
```

Ejecuta solo el test funcional:

```bash
./mvnw -q -Dtest=MetricasTareasTest#crearTareaIncrementaContadorYSePublicaEnActuator test
```

**Fallo deliberado:** El test esperaba que el contador subiera de `0.0` a `1.0`, pero siguió en `0.0`. **Diagnóstico:** Restaura el incremento y vuelve a ejecutar ambos métodos.


**Resultado esperado:** la mutación produce el fallo descrito; restaurado el código, la clase de pruebas vuelve a pasar. Conserva ambas salidas.

**Entiende:** El incremento está después del guardado del servicio. Eso no garantiza atomicidad entre transacción y métrica: un rollback posterior puede dejar una unidad contada.

**Cierra:** Restaura el incremento y explica por qué la tabla persistida sigue siendo la fuente de verdad.

Archivo de trabajo: `src/main/java/com/example/demo/ServicioTareas.java`.

#### Entiende y cierra

`Counter.builder(...)` registra una métrica en el registry; `increment()` suma una unidad. `ServicioTareas` solo lo hace después del guardado, así que un error antes de guardar no cuenta como éxito. `MeterRegistry` muestra el valor dentro del proceso y `/actuator/metrics/{nombre}` lo consulta; un exporter conecta esa métrica a un sistema que la recoge y conserva fuera del proceso.

Usa tags pequeños y previsibles, como `origen=api`. No pongas IDs únicos en tags ni trates el contador como libro contable: la métrica en memoria no es transaccional ni durable, y el registro persistido sigue siendo la fuente de verdad. Mantén `metrics` fuera de la exposición pública por defecto o protégelo con autenticación/red de gestión.

**Evidencia para avanzar:** un POST real eleva el contador en uno, Actuator devuelve nombre/tag/valor, el endpoint anónimo responde `401` y al retirar `increment()` la prueba falla. Este test comprueba una instancia local; no verifica un exporter ni la recepción por Prometheus. Documentación primaria: [Micrometer — Counters](https://docs.micrometer.io/micrometer/reference/concepts/counters.html), [Spring Boot 4.1.2 — Métricas](https://docs.spring.io/spring-boot/reference/actuator/metrics.html) y [Actuator — Exposición y seguridad de endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.exposing).


Archivo concreto: `src/main/java/com/example/demo/ServicioExternoHealthIndicator.java`.

**Aplicación y decisión:** En el proyecto integrador, usa el contador para observar creaciones y conserva la tabla como fuente de verdad. Límite: la métrica en memoria no se revierte necesariamente con un rollback y no es un libro contable durable.

### Tema 3: Liveness y readiness sin reinicios en cadena

**¿Por qué es importante?** Si falla un servicio externo, una sonda de liveness mal configurada puede reiniciar todas las instancias al mismo tiempo. Primero separa las dos preguntas: «¿el proceso puede seguir vivo?» y «¿esta instancia debe recibir tráfico ahora?». Al terminar, configurarás ambas señales y demostrarás su independencia con pruebas.

#### Subtema 7.7 · Habilitar las sondas de Spring Boot · 5 min

**Contexto:** Actuator publica `/actuator/health/liveness` y `/actuator/health/readiness` como grupos distintos. Liveness observa si Spring Boot considera que el proceso está funcionando; readiness observa si ya puede recibir tráfico. En Kubernetes, este último estado se usa para retirar temporalmente la instancia del servicio.

**Hazlo tú:** En el proyecto acumulado, agrega a `src/main/resources/application.properties`:

```properties
management.endpoint.health.probes.enabled=true
```

La propiedad habilita los grupos de sondas. Arranca la aplicación y consulta cada ruta desde una terminal. En este proyecto las rutas requieren el JWT de administrador que ya creaste en el Módulo 4. Define `TOKEN` con ese token de prueba en la misma terminal; no lo guardes en `application.properties`:

```bash
export TOKEN='<pega-aqui-tu-jwt-de-prueba>'
curl -i -H "Authorization: Bearer $TOKEN" http://localhost:8080/actuator/health/liveness
curl -i -H "Authorization: Bearer $TOKEN" http://localhost:8080/actuator/health/readiness
```

**Resultado esperado:** Con la aplicación iniciada normalmente, ambas rutas responden `200` y su cuerpo muestra `"status":"UP"`. Si recibes `404`, comprueba primero la propiedad y que `spring-boot-starter-actuator` esté instalado. Si recibes `401`, la ruta está protegida: usa un JWT válido; no abras todos los endpoints para resolverlo.

**Fallo deliberado:** comenta temporalmente `management.endpoint.health.probes.enabled=true`, reinicia y consulta la ruta de liveness. **Diagnóstico:** si devuelve `404`, el grupo de sondas no está activo; restaura la propiedad y reinicia.

**Entiende:** El nombre de una sonda no reinicia ni retira nada por sí solo. El orquestador consulta la ruta y decide qué hacer con el resultado. Actuator también publica estados de disponibilidad de la aplicación; en el subtema 7.9 cambiarás uno para observar el efecto.

**Cierra:** Anota las dos URLs y el estado HTTP inicial. No avances hasta poder distinguir qué estado representa cada una.

#### Subtema 7.8 · Revisar la dependencia solo en readiness · 10 min

**Contexto:** El `HealthIndicator` `pasarelaPagos` del subtema 7.2 detecta una caída externa. Spring Boot no la añade automáticamente a readiness: el equipo decide si esa dependencia es necesaria para atender solicitudes.

**Hazlo tú:** Como en esta práctica la API necesita la pasarela para aceptar nuevas operaciones, agrega a `src/main/resources/application.properties`:

```properties
management.endpoint.health.group.readiness.include=readinessState,pasarelaPagos
```

La sonda de liveness queda con su indicador de estado de vida; la pasarela aparece solo en readiness. Reinicia la app para cargar la configuración. No incluyas `pasarelaPagos` en `group.liveness.include`.

**Resultado esperado:** Cuando la pasarela funciona, readiness sigue `UP`. Si el `HealthIndicator` informa `DOWN`, readiness pasa a estado no saludable y responde `503`; liveness continúa `UP` porque el proceso puede recuperarse sin reinicio. En Kubernetes, la primera señal retira la instancia de los nuevos destinos del Service; la segunda hace que el kubelet reinicie el contenedor.

**Prueba en el despliegue.** En el `Deployment` de Kubernetes, dentro de `spec.template.spec.containers[0]`, configura cada ruta por separado:

```yaml
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  periodSeconds: 5
  failureThreshold: 2
```

El kubelet no hereda el JWT del usuario de la API. En un despliegue real, permite estas dos rutas de sonda con una regla de seguridad limitada o una interfaz de gestión y restringe su acceso desde la red; no expongas los detalles de salud ni los demás endpoints de Actuator. El bloque es una configuración para insertar en el contenedor del Deployment, no un manifiesto completo; esta lección no ejecuta un clúster de Kubernetes.

**Ojo con la decisión.** Si todas las instancias dependen de una pasarela compartida, ponerla en readiness puede retirar todas del servicio a la vez. Si existen alternativas o circuit breakers, quizá convenga mantenerlas listas y gestionar el error en la solicitud. Readiness expresa una decisión de producto y operación, no una regla universal.

**Fallo deliberado:** agrega temporalmente `management.endpoint.health.group.liveness.include=livenessState,pasarelaPagos` y ejecuta `DisponibilidadProbesTest#unaPasarelaCaidaSoloRetiraLaInstanciaDeReadiness`. **Diagnóstico:** la prueba recibe `503` al consultar liveness porque ahora la dependencia externa decide la señal de reinicio. Quita esa propiedad y repite el test.

**Entiende:** Liveness responde «¿reinicio esta instancia?»; readiness responde «¿le envío tráfico nuevo?». Una caída de red o de un servicio compartido suele ser externa al proceso. Reiniciar instancias que dependen de ese mismo servicio no lo recupera y puede crear una cadena de fallos.

**Cierra:** Escribe qué hace tu API cuando cae la pasarela: ¿puede responder con una alternativa?, ¿debe dejar de recibir operaciones nuevas?, ¿la dependencia es propia de una instancia o compartida? Esa decisión justifica incluirla o no en readiness.

#### Subtema 7.9 · Probar estados distintos y diagnosticar el error · 10 min

**Contexto:** Una configuración que compila aún puede conectar mal los grupos. Prueba tres cambios reales con `MockMvc`: dependencia caída, readiness que deja de aceptar tráfico y liveness rota. `AvailabilityChangeEvent` cambia el estado de disponibilidad administrado por Spring; un `HealthIndicator` informa la salud de una dependencia. Son señales diferentes.

**Hazlo tú:** Crea `src/test/java/com/example/demo/DisponibilidadProbesTest.java`. La prueba reutiliza el `ServicioExterno`, `JwtService` y seguridad del backend acumulado:

```java
package com.example.demo;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.LivenessState;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationContext;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class DisponibilidadProbesTest {
    @Autowired MockMvc mockMvc;
    @Autowired ApplicationContext context;
    @Autowired ServicioExterno servicioExterno;
    @Autowired JwtService jwtService;

    @BeforeEach
    @AfterEach
    void restableceEstados() {
        servicioExterno.marcarComoDisponible();
        AvailabilityChangeEvent.publish(context, ReadinessState.ACCEPTING_TRAFFIC);
        AvailabilityChangeEvent.publish(context, LivenessState.CORRECT);
    }

    @Test
    void unaPasarelaCaidaSoloRetiraLaInstanciaDeReadiness() throws Exception {
        servicioExterno.marcarComoNoDisponible();
        mockMvc.perform(get("/actuator/health/readiness").header("Authorization", bearer()))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.components.pasarelaPagos.status").value("DOWN"));
        mockMvc.perform(get("/actuator/health/liveness").header("Authorization", bearer()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void rechazarTraficoNoRompeLiveness() throws Exception {
        AvailabilityChangeEvent.publish(context, ReadinessState.REFUSING_TRAFFIC);
        mockMvc.perform(get("/actuator/health/readiness").header("Authorization", bearer()))
            .andExpect(status().isServiceUnavailable());
        mockMvc.perform(get("/actuator/health/liveness").header("Authorization", bearer()))
            .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void procesoRotoAfectaLivenessPeroNoElEstadoReadiness() throws Exception {
        AvailabilityChangeEvent.publish(context, LivenessState.BROKEN);
        mockMvc.perform(get("/actuator/health/liveness").header("Authorization", bearer()))
            .andExpect(status().isServiceUnavailable());
        mockMvc.perform(get("/actuator/health/readiness").header("Authorization", bearer()))
            .andExpect(status().isOk());
    }

    @Test
    void lasDosRutasSiguenProtegidas() throws Exception {
        mockMvc.perform(get("/actuator/health/readiness")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/actuator/health/liveness")).andExpect(status().isUnauthorized());
    }

    private String bearer() {
        return "Bearer " + jwtService.generar("monitor@rutaflow.dev", "ADMIN");
    }
}
```

Ejecuta solo esta prueba:

```bash
./mvnw -q -Dtest=DisponibilidadProbesTest test
```

**Resultado esperado:** Cuatro pruebas pasan: una avería de la pasarela produce readiness `503` y liveness `200`; `REFUSING_TRAFFIC` solo afecta readiness; `BROKEN` solo afecta liveness; sin JWT ambas rutas devuelven `401`. El mismo método restablece ambos estados antes y después de cada caso para que el contexto Spring compartido no contamine otras pruebas. `MockMvc` valida configuración y seguridad HTTP dentro del contexto; no lanza Kubernetes ni prueba una red o un contenedor real.

**Fallo deliberado:** quita temporalmente `@AfterEach` del método `restableceEstados` y ejecuta `./mvnw -q clean test`. **Diagnóstico:** si `BROKEN` queda en el contexto, otro test de health puede recibir `503` aun con la pasarela sana. Restaura `@AfterEach` y repite la suite.

**Entiende:** usa `AvailabilityChangeEvent` para comunicar estados del ciclo de vida de la aplicación —por ejemplo, dejar de aceptar tráfico durante un apagado ordenado—. No lo publiques desde un endpoint público ni cambies liveness al detectar una avería remota. La prueba aisló cada estado y conservó la autenticación. Documentación primaria: [Spring Boot 4.1.2 — Kubernetes Probes](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.kubernetes-probes), [AvailabilityChangeEvent API](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/availability/AvailabilityChangeEvent.html) y [ApplicationAvailability API](https://docs.spring.io/spring-boot/api/java/org/springframework/boot/availability/ApplicationAvailability.html).

**Cierra:** explica con tus palabras qué estado retira una instancia del tráfico y cuál le pide al orquestador reiniciarla; usa como evidencia los códigos `503` y `200` de las pruebas.

---


**Aplicación y decisión:** En el proyecto integrador, conserva liveness independiente de la pasarela externa y prueba readiness con esa dependencia caída. Este límite evita reinicios en cadena, pero el test no acredita comportamiento del kubelet ni balanceo del clúster.

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
