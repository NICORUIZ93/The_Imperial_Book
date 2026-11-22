# Módulo 7: Configuración, errores y observabilidad

Este módulo cubre configuración tipada, fallo rápido, manejo global de errores, diagnóstico de arranque, actuator, métricas y logs. La operación empieza en el diseño de la app.

**Entorno de referencia (2026-05-22):** JDK 27, Maven 3.10.0. Verificaciones Java puras para contratos; Actuator/Micrometer/logging requieren app Spring Boot.

## Aprende construyendo

### Tema 1: @ConfigurationProperties tipado · Intermedio · 30 min

#### `@ConfigurationProperties`

**Definición formal.** Mecanismo Spring Boot para enlazar un grupo de propiedades externas a un objeto Java tipado.

**Para qué sirve.** Configuración validable, autocompletable y centralizada.

**Cuándo usarlo.** Para grupos de config. Prefiere sobre muchos `@Value`.

**Ejemplo mínimo enfocado (Spring).**

```java
@ConfigurationProperties(prefix="academia")
@Validated
record AcademiaProps(@NotBlank String banner, @Min(1) int maxItems) {}
```

**Caso de uso real.** Config de límites, URLs, flags.

**Error común.** Propiedades dispersas con `@Value`. Corrección: agrupar en properties tipadas.

**Verificación.** **Nota:** requiere app Boot y binding; evidencia en arranque/test.

### Tema 2: Fallar rápido al arranque · Intermedio · 30 min

#### Fail-fast

**Definición formal.** Estrategia donde la app valida configuración/dependencias críticas al iniciar y aborta si no son válidas.

**Para qué sirve.** Evitar fallar en producción a mitad de request.

**Cuándo usarlo.** Config obligatoria, credenciales, migraciones críticas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb7-ff && cd /tmp/sb7-ff
cat > DemoFF.java << 'JAVA'
public class DemoFF { public static void main(String[] args){ String url=System.getenv().getOrDefault("DB_URL",""); if(url.isBlank()){ System.out.println("FAIL_FAST"); System.exit(1);} System.out.println("OK"); } }
JAVA
javac DemoFF.java && java DemoFF || true
```

**Caso de uso real.** Faltar `DB_URL` en prod.

**Error común.** Default silencioso inseguro. Corrección: fallar con mensaje claro.

**Verificación (JDK 27, 2026-05-22).** Salida: `FAIL_FAST` y exit 1.

### Tema 3: Manejo global de excepciones consistente entre entornos · Intermedio · 30 min

#### Manejo global de errores

**Definición formal.** Política centralizada que traduce excepciones a respuestas HTTP/errores consistentes.

**Para qué sirve.** Contrato estable y seguridad (no filtrar internos).

**Cuándo usarlo.** Siempre en APIs.

**Ejemplo mínimo enfocado (Spring).**

```java
@RestControllerAdvice
class Err { @ExceptionHandler(Exception.class) ProblemDetail any(Exception e){ var pd=ProblemDetail.forStatus(500); pd.setDetail("error interno"); return pd; } }
```

**Caso de uso real.** 500 genérico sin stack trace al cliente.

**Error común.** Devolver `e.getMessage()` interno. Corrección: log interno, mensaje seguro.

**Verificación.** **Nota:** requiere app Boot.

### Tema 4: FailureAnalyzer: errores de arranque que explican la causa y la solución · Avanzado · 35 min

#### `FailureAnalyzer`

**Definición formal.** Componente Spring Boot que interpreta una falla de arranque y produce descripción/acción recomendada legible.

**Para qué sirve.** Acelerar diagnóstico de startup.

**Cuándo usarlo.** Para errores comunes de infraestructura/config.

**Ejemplo mínimo enfocado (Spring).**

```java
public class MiFailureAnalyzer extends AbstractFailureAnalyzer<MiException> {
  protected FailureAnalysis analyze(Throwable root, MiException cause){ return new FailureAnalysis("causa", "accion", cause); }
}
```

**Caso de uso real.** Puerto ocupado, DB no disponible.

**Error común.** Leer solo la última línea del stack. Corrección: leer `Caused by` y FailureAnalyzer.

**Verificación.** **Nota:** requiere app Boot con fallo inducido.

### Tema 5: Actuator y health checks personalizados · Avanzado · 30 min

#### Actuator

**Definición formal.** Módulo Spring Boot que expone endpoints operativos (health, info, metrics, env, etc.).

**Para qué sirve.** Observabilidad y operación.

**Cuándo usarlo.** En servicios desplegados; proteger endpoints sensibles.

**Ejemplo mínimo enfocado (Spring).**

```properties
management.endpoints.web.exposure.include=health,info
```

**Caso de uso real.** `/actuator/health` para orquestador.

**Error común.** Exponer env/beans públicamente. Corrección: exponer mínimo y asegurar.

**Verificación.** **Nota:** requiere app Boot con actuator.

### Tema 6: Contar operaciones de negocio con Micrometer · Avanzado · 30 min

#### Micrometer

**Definición formal.** Fachada de métricas para Java que integra con backends (Prometheus, OTLP, etc.).

**Para qué sirve.** Medir comportamiento de negocio/técnico.

**Cuándo usarlo.** Contadores, timers, gauges relevantes.

**Ejemplo mínimo enfocado (Spring).**

```java
Counter.builder("envios.creados").register(meterRegistry).increment();
```

**Caso de uso real.** Contar pedidos creados o fallos.

**Error común.** Métricas de alta cardinalidad por ID de usuario. Corrección: labels controladas.

**Verificación.** **Nota:** requiere Micrometer/registry.

### Tema 7: Liveness y readiness sin reinicios en cadena · Avanzado · 25 min

#### Liveness/Readiness

**Definición formal.** Liveness indica si el proceso debe reiniciarse; readiness si puede recibir tráfico.

**Para qué sirve.** Orquestación segura.

**Cuándo usarlo.** En Kubernetes/entornos con probes.

**Ejemplo mínimo enfocado (Spring).**

```properties
management.endpoint.health.probes.enabled=true
```

**Caso de uso real.** No enviar tráfico mientras calienta caché o migra.

**Error común.** Marcar not-ready por dependencia opcional y causar cascada. Corrección: separar críticos de opcionales.

**Verificación.** **Nota:** requiere actuator/k8s probes.

### Tema 8: Logging en Spring Boot: niveles, grupos y logs estructurados en JSON · Avanzado · 40 min

#### Logging estructurado

**Definición formal.** Emisión de logs con campos estructurados (JSON/key-value) además de mensaje, con niveles y contexto.

**Para qué sirve.** Búsqueda y correlación en observabilidad.

**Cuándo usarlo.** Producción; incluir correlation/trace IDs.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/sb7-log && cd /tmp/sb7-log
cat > DemoLog.java << 'JAVA'
public class DemoLog { public static void main(String[] args){ System.out.println("{\"level\":\"INFO\",\"msg\":\"inicio\",\"service\":\"envios\"}"); } }
JAVA
javac DemoLog.java && java DemoLog
```

**Caso de uso real.** Ingerir logs en ELK/Loki.

**Error común.** Loguear secretos/PII. Corrección: redactar y usar niveles adecuados.

**Verificación (JDK 27, 2026-05-22).** Salida: JSON con `level` INFO.
