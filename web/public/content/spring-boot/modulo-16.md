# Módulo 16: Microservicios con Spring Cloud

Cubre patrones Spring Cloud: service discovery, config, gateway, resiliencia, observabilidad distribuida. Requiere infra distribuida para verificación completa.

**Entorno (2026-05-22):** JDK 27, Docker 29.9.3. Componentes Cloud requieren múltiples servicios/infra.

## Aprende construyendo

### Tema 1: Service discovery y configuración centralizada · Avanzado · 45 min
#### Service discovery
**Definición formal.** Mecanismo donde servicios registran su ubicación y otros los descubren dinámicamente.
**Para qué sirve.** Evitar endpoints hardcodeados.
**Cuándo usarlo.** Entornos dinámicos con múltiples instancias.
**Ejemplo mínimo enfocado (conceptual).** Eureka/Consul/Kubernetes DNS.
**Caso de uso real.** `orders` llama `payments` por nombre lógico.
**Error común.** Usar discovery como balanceador mágico sin timeouts. Corrección: timeouts + retries + circuit breaker.
**Verificación.** **Nota:** requiere registry.

#### Config centralizada
**Definición formal.** Gestión externa y central de configuración para múltiples servicios.
**Para qué sirve.** Consistencia y cambios controlados.
**Cuándo usarlo.** Muchos servicios/entornos.
**Ejemplo mínimo enfocado.** Spring Cloud Config / ConfigMap.
**Caso de uso real.** Cambiar feature flag/config.
**Error común.** Config dinámica sin auditoría. Corrección: versionado y control de cambios.
**Verificación.** **Nota:** requiere config server/infra.

### Tema 2: API Gateway y composición · Avanzado · 45 min
#### API Gateway
**Definición formal.** Punto de entrada que enruta, autentica, limita y observa requests hacia servicios internos.
**Para qué sirve.** Cross-cutting concerns en borde.
**Cuándo usarlo.** Múltiples clientes/servicios.
**Ejemplo mínimo enfocado (conceptual Spring Cloud Gateway).** ruta `/api/envios/**` -> servicio envíos.
**Caso de uso real.** Auth y rate limit central.
**Error común.** Poner lógica de negocio pesada en gateway. Corrección: gateway fino.
**Verificación.** **Nota:** requiere gateway+servicios.

### Tema 3: Resiliencia distribuida · Avanzado · 45 min
#### Circuit breaker / timeout / bulkhead
**Definición formal.** Patrones para limitar fallos: timeout acota espera, circuit breaker abre ante fallas, bulkhead aísla recursos.
**Para qué sirve.** Evitar cascadas.
**Cuándo usarlo.** Llamadas remotas.
**Ejemplo mínimo enfocado (ejecutable timeout).**
```bash
mkdir -p /tmp/sb16-to && cd /tmp/sb16-to
cat > DemoTo.java << 'JAVA'
import java.util.concurrent.*; public class DemoTo { public static void main(String[] args) throws Exception { ExecutorService ex=Executors.newSingleThreadExecutor(); Future<?> f=ex.submit(() -> { try{Thread.sleep(500);}catch(Exception e){} }); try{ f.get(100,TimeUnit.MILLISECONDS); } catch(TimeoutException e){ System.out.println("timeout"); } ex.shutdownNow(); } }
JAVA
javac DemoTo.java && java DemoTo
```
**Caso de uso real.** Evitar esperar 30s a un servicio caído.
**Error común.** Retries sin timeout. Corrección: timeout + retry acotado + circuit breaker.
**Verificación (JDK 27, 2026-05-22).** Salida: `timeout`.

### Tema 4: Observabilidad distribuida · Avanzado · 45 min
#### Tracing distribuido
**Definición formal.** Propagación de trace/span IDs entre servicios para reconstruir una request end-to-end.
**Para qué sirve.** Diagnóstico en sistemas distribuidos.
**Cuándo usarlo.** Microservicios/colas.
**Ejemplo mínimo enfocado (conceptual).** OpenTelemetry/Micrometer Tracing.
**Caso de uso real.** Ver dónde se perdió latencia.
**Error común.** No propagar headers. Corrección: instrumentación y propagación estándar.
**Verificación.** **Nota:** requiere collector/backend tracing.

## Cierre
Spring Cloud ayuda, pero los fundamentos son redes falibles: timeouts, resiliencia, observabilidad y contratos.
