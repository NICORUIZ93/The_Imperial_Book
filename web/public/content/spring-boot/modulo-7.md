# Módulo 7: Configuración, errores y observabilidad

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria, verificado con `ApplicationContextRunner` y `MockMvc` reales, para que "la aplicación falla al arranque" o "el formato de error es consistente" sean afirmaciones comprobables, no solo descritas. Los Temas 1–4 tratan la configuración y los errores; los Temas 5–8 llevan esas mismas señales a Actuator: salud, métricas, sondas y logs.

**Referencia ejecutable al terminar los módulos 2 y 4–7:** en la raíz del repositorio, abre `README.md`. Incluye el estado final y pruebas; algunas clases incorporan cambios de módulos posteriores. Construye primero las prácticas de este módulo y usa la referencia para comparar y diagnosticar.

## Aprende construyendo


### Tema 1: @ConfigurationProperties tipado · Intermedio · 30 min

**Caso guía**: configurar límites y URLs sin `@Value` disperso.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@ConfigurationProperties` | Binding tipado de propiedades a objeto. | Config estructurada. | Prefijo claro, campos tipados. | `@Value` por cada propiedad. |
| `@Validated` en config | Validación de propiedades al bind. | Fallar por config inválida. | `@NotNull`, `@Min` en properties. | Config inválida detectada tarde. |
| `@EnableConfigurationProperties`/scan | Registra clase de config. | Binding activo. | Usar scan de Boot o anotación. | Propiedades no bindeadas en silencio. |
| Metadata/configuración | `spring-configuration-metadata.json` mejora IDE. | DX. | Añadir processor si se necesita. | Nombres de propiedades inconsistentes. |

**Implementación desde cero**
```java
@ConfigurationProperties(prefix="app.entregas")
@Validated
public record EntregasProperties(@Min(1) int maxPagina, @NotBlank String region) {}
```
```yaml
app:
  entregas:
    max-pagina: 50
    region: co
```
**Ejecución real**: `./mvnw -Dtest=EntregasPropertiesTest test` o arranque con valor inválido. **Verificación**: `max-pagina: 0` falla al arrancar.

### Tema 2: Fallar rápido al arranque · Intermedio · 30 min

**Caso guía**: app arranca pero falla en la primera request por config faltante.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Fail fast | Detectar errores de configuración al inicio. | Evitar fallos tardíos. | Validar config/secrets/dependencias críticas. | Default silencioso peligroso. |
| Validación de propiedades | Constraints en startup. | Config correcta. | `@Validated`, `@NotNull`. | `null` en runtime. |
| Profile/env required | Variables obligatorias por entorno. | Seguridad operacional. | Falla si falta `JWT_SECRET`. | Secret vacío por defecto. |
| Health/readiness | Reportar si app lista. | Orquestación. | No marcar ready sin dependencias críticas si aplica. | Ready aunque BD caída. |

**Implementación desde cero**
```java
@Bean
ApplicationRunner validar(EntregasProperties p){
  return args -> { if(p.region().isBlank()) throw new IllegalStateException("region requerida"); };
}
```
**Ejecución real**: arranque sin propiedad requerida falla con mensaje claro. **Verificación**: corrige propiedad y arranca.

### Tema 3: Manejo global de excepciones consistente entre entornos · Intermedio · 30 min

**Caso guía**: en dev ves stacktrace; en prod expones detalle interno.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Problem Details / `ApiError` | Formato consistente de error. | Contrato para clientes. | Mismo shape en todos los endpoints. | Mensajes ad-hoc. |
| `@ControllerAdvice` | Manejo global. | Centralización. | Mapear por tipo de excepción. | catch-all que oculta bugs. |
| No filtrar detalles sensibles | Stacktraces, SQL, paths internos. | Seguridad. | Log interno detallado; respuesta externa segura. | `ex.getMessage()` con SQL al cliente. |
| Consistencia entre entornos | Mismo contrato, distinto nivel de detalle interno. | Operabilidad. | Configurar logging/stacktrace por perfil. | Comportamiento distinto rompe clientes. |

**Implementación desde cero** (ver M2) + handler genérico:
```java
@ExceptionHandler(Exception.class)
ResponseEntity<ApiError> inesperado(Exception ex){
  log.error("error inesperado", ex);
  return ResponseEntity.status(500).body(new ApiError("INTERNO","Error interno", List.of()));
}
```
**Ejecución real**: forzar excepción; cliente ve 500 genérico, log tiene stacktrace. **Verificación**: no aparece paquete/clase interna en respuesta.

### Tema 4: FailureAnalyzer: errores de arranque que explican la causa y la solución · Avanzado · 35 min

**Caso guía**: puerto ocupado; mensaje críptico vs diagnóstico accionable.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `FailureAnalyzer` | Componente Boot que traduce excepción de arranque a diagnóstico. | Mejor DX/operación. | Mensaje claro: causa + acción. | Lanzar excepción genérica sin contexto. |
| `FailureAnalysis` | Resultado con descripción, acción y causa. | Feedback útil. | Incluir qué hacer. | Solo decir “falló”. |
| Diagnóstico de arranque | Fallas antes de ready. | Reducir MTTR. | Registrar condiciones esperadas. | Buscar causa en 200 líneas de stacktrace. |
| Registro de analyzer | `spring.factories`/AutoConfiguration/import según mecanismo. | Activarlo. | Probar con arranque real. | Analyzer no registrado. |

**Implementación desde cero**
```java
public class PuertoOcupadoFailureAnalyzer extends AbstractFailureAnalyzer<PortInUseException> {
  @Override protected FailureAnalysis analyze(Throwable rootFailure, PortInUseException cause){
    return new FailureAnalysis("El puerto está ocupado: "+cause.getMessage(), "Cambia server.port o libera el puerto.", cause);
  }
}
```
**Ejecución real**: arrancar dos instancias mismo puerto; ver análisis. **Verificación**: mensaje muestra acción.

### Tema 5: Actuator y health checks personalizados · Avanzado · 30 min

**Caso guía**: orquestador necesita saber si la app y sus dependencias están saludables.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Spring Boot Actuator | Endpoints operacionales (`/actuator/health`, metrics, info). | Observabilidad/operación. | Exponer solo lo necesario. | Exponer todos los actuators públicamente. |
| `HealthIndicator` | Componente que reporta UP/DOWN/UNKNOWN. | Health personalizado. | Chequeo rápido y seguro. | Health check pesado que tumba la app. |
| `management.endpoints.web.exposure` | Controla qué endpoints se exponen. | Seguridad. | Exponer por perfil/red. | `*` en internet. |
| Liveness/readiness (preview M7 T7) | Probes para orquestador. | Despliegue seguro. | Separar vivo de listo. | Reinicios en cadena. |

**Implementación desde cero**
```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-actuator</artifactId></dependency>
```
```java
@Component
class PagoApiHealth implements HealthIndicator {
  public Health health(){ boolean ok = true; return ok ? Health.up().withDetail("pagoApi","reachable").build() : Health.down().build(); }
}
```
**Ejecución real**: `curl localhost:8080/actuator/health`. **Verificación**: DOWN cuando dependencia simulada falla.

### Tema 6: Contar operaciones de negocio con Micrometer · Avanzado · 30 min

**Caso guía**: contar “tareas creadas” y latencia de creación.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Micrometer | Fachada de métricas (como SLF4J para logs). | Instrumentación portable. | Nombrar métricas con convención. | Métricas con alta cardinalidad. |
| `Counter`/`Timer` | Tipos de métrica. | Contar y medir duración. | Timer para latencia, counter para eventos. | Usar gauge para contador monotónico. |
| Tags/labels | Dimensiones de métrica. | Filtrar/agregar. | Baja cardinalidad. | `userId` como tag. |
| `/actuator/metrics` | Exposición de métricas. | Verificación. | Asegurar registry. | Medir pero no exponer/scrapear. |

**Implementación desde cero**
```java
@Service
class TareaMetrics {
  private final Counter creadas; private final Timer crearTimer;
  TareaMetrics(MeterRegistry registry){ creadas=registry.counter("tareas.creadas"); crearTimer=registry.timer("tareas.crear.tiempo"); }
  public <T> T medir(Supplier<T> s){ return crearTimer.record(s); }
  public void inc(){ creadas.increment(); }
}
```
**Ejecución real**: crear tareas y consultar `/actuator/metrics/tareas.creadas`. **Verificación**: contador sube.

### Tema 7: Liveness y readiness sin reinicios en cadena · Avanzado · 25 min

**Caso guía**: BD lenta al arrancar; Kubernetes no debe matar el pod mientras inicializa, pero tampoco enviarle tráfico.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Liveness | ¿El proceso está vivo? Si no, reiniciar. | Recuperar deadlocks. | No depender de dependencias externas. | Liveness chequea DB y causa reinicio en cascada. |
| Readiness | ¿Puede recibir tráfico? | Controlar routing. | Incluir dependencias necesarias. | Ready con DB caída. |
| Probes de Kubernetes | HTTP checks a endpoints actuator. | Orquestación. | Configurar delays/timeouts realistas. | Timeout muy agresivo. |
| Grupos de health | `liveness`, `readiness`. | Separar semántica. | Exponer grupos. | Un solo health para todo. |

**Implementación desde cero**
```yaml
management:
  endpoint:
    health:
      probes:
        enabled: true
  endpoints:
    web:
      exposure:
        include: health,info
```
**Ejecución real**: `curl /actuator/health/liveness` y `/actuator/health/readiness`. **Verificación**: simula dependencia caída; readiness DOWN, liveness UP.

### Tema 8: Logging en Spring Boot: niveles, grupos y logs estructurados en JSON · Avanzado · 40 min

**Caso guía**: en prod necesitas logs JSON con campos consultables; en dev, texto legible.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Niveles de log | ERROR/WARN/INFO/DEBUG/TRACE. | Controlar verbosidad. | INFO en prod por defecto. | DEBUG en prod. |
| Grupos de log | Agrupar paquetes bajo un nombre. | Configuración cómoda. | `logging.group`. | Ajustar 20 loggers uno a uno. |
| Logging estructurado JSON | Logs como objetos con campos. | Observabilidad/log aggregation. | Incluir timestamp, level, logger, message, MDC. | Loggear secretos. |
| MDC/correlación | Contexto por request. | Trazabilidad. | requestId/traceId. | No limpiar MDC. |

**Implementación desde cero**
```yaml
logging:
  level:
    root: INFO
    com.example.demo: DEBUG
  group:
    web: org.springframework.web,org.springframework.http
  level.web: INFO
```
JSON (Boot soporte/encoder según versión): configurar `logback-spring.xml` o propiedad de structured logging. **Ejecución real**: arranque y observa formato; cambia nivel con `logging.level`. **Verificación**: log contiene campo `level` y `message`.

