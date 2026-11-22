# Módulo 6 · Infraestructura distribuida con Spring Cloud

Una vez que hay múltiples servicios, aparecen problemas transversales: descubrimiento, enrutamiento, configuración y balanceo. Spring Cloud aporta componentes para estos concerns. Este módulo los cubre con criterio: usarlos cuando resuelven un problema real, no por defecto.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Spring Boot 3.5.0 referencia. Ejemplos de routing/config/discovery ejecutan lógica mínima en Java puro. Eureka/Consul/Gateway/Config Server requieren infra; **Nota de verificación**.

## Aprende construyendo

### Tema 1: Service discovery con Eureka/Consul/Nacos · Intermedio · 150 min

Caso guía: `orders` necesita llamar a `inventory`, pero las instancias cambian por autoscaling, despliegues y fallos. No puede depender de IPs fijas.

#### Definición formal

Service discovery es el mecanismo por el cual un servicio registra su dirección de red y otros servicios consultan instancias disponibles. Puede ser client-side (el cliente consulta registry y balancea) o server-side (un load balancer/gateway resuelve). Eureka, Consul y Nacos son implementaciones comunes; Kubernetes ofrece discovery nativo vía DNS/Services.

#### Contrato / internals

- **Registro:** instancia publica `name`, `host`, `port`, `health`, metadata.
- **Consulta:** consumidor obtiene instancias saludables.
- **Heartbeat/health:** el registry elimina o marca instancias no saludables.
- **Consistencia operativa:** cachés de discovery pueden quedar stale; el cliente debe tolerar errores y reintentar con otra instancia.
- **Eureka:** registry AP-oriented típico en Spring Cloud Netflix.
- **Consul:** discovery + health checks + KV; usado en entornos heterogéneos.
- **Nacos:** discovery y configuración dinámica, común en Spring Cloud Alibaba; útil cuando se quiere un plano integrado de naming/config.

#### Cuándo usarlo / cuándo no

**Úsalo** cuando hay instancias dinámicas, múltiples réplicas o despliegues frecuentes. **No lo agregues** si la plataforma ya lo resuelve (Kubernetes DNS/Service) y no necesitas features adicionales. No uses discovery como sustituto de timeouts/retries/circuit breakers.

#### Ejemplo mínimo ejecutable

Crea el archivo `Disc.java`:

```java
import java.util.*;
public class Disc {
  static Map<String, List<String>> registry = new HashMap<>();
  static void register(String name, String addr) {
    registry.computeIfAbsent(name, k -> new ArrayList<>()).add(addr);
  }
  static List<String> discover(String name) {
    return registry.getOrDefault(name, List.of());
  }
  public static void main(String[] args) {
    register("inventory", "10.0.0.2:8080");
    register("inventory", "10.0.0.3:8080");
    System.out.println(discover("inventory").size());
    System.out.println(discover("missing").size());
  }
}
```

```bash
javac Disc.java
java Disc
```

Salida esperada:

```text
2
0
```

#### Caso real

En Spring Cloud, `orders` usa `WebClient` con `@LoadBalanced` y resuelve `http://inventory/...` contra Eureka/Consul/Nacos. En Kubernetes, el mismo contrato puede resolverse por `inventory.default.svc.cluster.local`.

#### Error común

**Síntoma.** fallos tras escalar o redeploy. **Causa.** URL/IP hardcodeada en configuración. **Corrección.** usar nombre lógico + discovery/DNS y health checks. **Señal observable.** errores `Connection refused` a IP vieja después de rollout.

#### Verificación

Smoke Java ejecutado localmente (2026-05-22, JDK 27.0.1.0.2): `2`, `0`.

**Nota de verificación:** no se ejecutaron servidores Eureka/Consul/Nacos en esta sesión. Verificación propuesta:

```bash
# Nacos (ejemplo con Docker)
docker run --rm -p 8848:8848 -e MODE=standalone nacos/nacos-server:latest
# App Spring: spring.cloud.nacos.discovery.server-addr=localhost:8848
./mvnw spring-boot:run
```

Resultado esperado: la instancia aparece registrada en Nacos y el cliente resuelve instancias saludables por nombre lógico.

### Tema 2: Spring Cloud Gateway · Intermedio · 150 min

Caso guía: un único punto de entrada con routing y filtros.

#### Gateway

**Definición formal.** Spring Cloud Gateway enruta requests, aplica filtros (auth, rate limit, headers, logging) y desacopla clientes de topología interna.

**Cuándo usarlo / cuándo no.** Úsalo como borde. No pongas lógica de dominio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm6-gw
cd sm6-gw
```

Crea el archivo `Gw.java`:

```java
import java.util.*;
public class Gw {
  static Map<String,String> routes = Map.of("/orders","orders-svc","/catalog","catalog-svc");
  static String route(String path){ return routes.getOrDefault(path,"404"); }
  public static void main(String[] args){ System.out.println(route("/orders")); System.out.println(route("/x")); }
}
```

```bash
javac Gw.java
java Gw
```

**Caso de uso real.** filtros de auth, rate limit, correlation id.

**Error común.** Gateway como monolito de negocio.

**Síntoma.** cambios de dominio requieren redeploy de gateway. **Causa.** responsabilidades mal ubicadas. **Corrección.** policies transversales en gateway, dominio en servicios. **Señal observable.** gateway crece en complejidad.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `orders-svc`, `404`.

### Tema 3: Spring Cloud Config · Intermedio · 120 min

Caso guía: cambiar config sin rebuild.

#### Config centralizada

**Definición formal.** Config Server externaliza configuración de múltiples servicios desde Git u otras fuentes, con perfiles y refresh controlado.

**Cuándo usarlo / cuándo no.** Úsalo cuando hay muchas instancias/servicios. No metas secretos planos; integra secret manager.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm6-cfg
cd sm6-cfg
```

Crea el archivo `Cfg.java`:

```java
import java.util.*;
public class Cfg {
  static Map<String,String> cfg = Map.of("orders.timeoutMs","500");
  public static void main(String[] args){ System.out.println(cfg.get("orders.timeoutMs")); }
}
```

```bash
javac Cfg.java
java Cfg
```

**Caso de uso real.** Config Server + Spring Cloud Bus / refresh.

**Error común.** Refresh masivo sin control.

**Síntoma.** comportamiento inconsistente. **Causa.** cambio de config en caliente no coordinado. **Corrección.** versionar config, rollout controlado. **Señal observable.** instancias con distinto comportamiento.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `500`.

### Tema 4: Load balancing y BFF · Intermedio · 120 min

Caso guía: balancear instancias y adaptar API a móvil/web.

#### Load balancing

**Definición formal.** Load balancing distribuye requests entre instancias. Spring Cloud LoadBalancer reemplaza Ribbon en el stack moderno.

#### BFF

**Definición formal.** Backend for Frontend adapta APIs por tipo de cliente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm6-lb
cd sm6-lb
```

Crea el archivo `Lb.java`:

```java
import java.util.*;
public class Lb {
  static List<String> instances = List.of("i1","i2");
  static String pick(int req){ return instances.get(req % instances.size()); }
  public static void main(String[] args){ System.out.println(pick(0)); System.out.println(pick(1)); System.out.println(pick(2)); }
}
```

```bash
javac Lb.java
java Lb
```

**Caso de uso real.** BFF móvil con payload reducido.

**Error común.** BFF con lógica de dominio.

**Síntoma.** inconsistencias entre clientes. **Causa.** reglas duplicadas. **Corrección.** BFF compone/adapta. **Señal observable.** bugs distintos por cliente.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `i1`, `i2`, `i1`.

## Cierre

La infraestructura distribuida resuelve cross-cutting concerns. Úsala con sobriedad: cada componente agrega operación y modos de fallo.

## Checklist

- Discovery/DNS para instancias dinámicas.
- Gateway fino y observable.
- Config centralizada sin secretos planos.
- BFF para adaptar clientes, no para duplicar dominio.
