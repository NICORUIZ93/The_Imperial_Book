# Módulo 10 · Infraestructura distribuida de Tienda Aurora

Una vez que Tienda Aurora tiene múltiples servicios, aparecen problemas transversales: descubrir instancias, enrutar tráfico, distribuir configuración y balancear carga. Spring Cloud aporta componentes para estos concerns. El criterio importa más que el componente: úsalo cuando resuelve un problema real de tu plataforma.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2. Los smokes validan la lógica de discovery, routing, config lookup y balanceo con Java puro. Eureka/Consul/Nacos/Gateway/Config Server requieren infraestructura; se incluyen notas de verificación honestas.

## Proyecto desde cero: tienda-aurora-infra

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
docker --version  # Docker 24+ (para Nacos/Consul si se usan)
```

### Estructura del proyecto

```text
tienda-aurora-infra/
├── build.gradle.kts
├── settings.gradle.kts
├── docker-compose.yml
├── catalog-service/
│   ├── build.gradle.kts
│   └── src/main/java/com/aurora/catalog/
│       ├── CatalogApplication.java
│       └── config/DiscoveryConfig.java
├── orders-service/
│   ├── build.gradle.kts
│   └── src/main/java/com/aurora/orders/
│       ├── OrdersApplication.java
│       └── client/InventoryClient.java
└── gateway/
    ├── build.gradle.kts
    └── src/main/resources/application.yml
```

### build.gradle.kts (raíz)

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.0" apply false
    id("io.spring.dependency-management") version "1.1.7" apply false
}

subprojects {
    apply(plugin = "java")
    java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
    repositories { mavenCentral() }
    dependencies {
        implementation("org.springframework.boot:spring-boot-starter-web")
        testImplementation("org.springframework.boot:spring-boot-starter-test")
    }
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-infra"
include("catalog-service", "orders-service", "gateway")
```

### docker-compose.yml (Nacos)

```yaml
services:
  nacos:
    image: nacos/nacos-server:v2.3.0
    environment:
      MODE: standalone
    ports:
      - "8848:8848"
```

### Tema 1: Service discovery con Eureka/Consul/Nacos · Intermedio · 150 min

## Service discovery: de IPs hardcodeadas a nombres lógicos

`orders-service` necesita llamar a `inventory-service`. En desarrollo pusiste `http://localhost:8082`. En producción hay tres instancias, una se cae, otra se despliega con IP nueva y el autoscaler crea una cuarta. La URL hardcodeada deja de funcionar. El síntoma es simple y brutal: errores `Connection refused` después de cada despliegue.

Service discovery es como la recepción de un edificio de oficinas. No buscas a una persona por su silla; preguntas en recepción por el nombre del equipo y te indican qué oficina está disponible ahora. Los servicios se registran con nombre y salud, y los consumidores preguntan por nombre lógico.

```java
import java.util.*;

public class DiscoveryExample {
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
        System.out.println("instances=" + discover("inventory").size());
        System.out.println("missing=" + discover("missing").size());
    }
}
```

```bash
javac DiscoveryExample.java
java DiscoveryExample
```

Salida esperada:

```text
instances=2
missing=0
```

En Spring Cloud, Nacos o Eureka gestionan el registro. El consumidor usa `lb://inventory-service`. En Kubernetes, DNS/Service suele bastar.

El error más común es IP hardcodeada. El síntoma son fallos tras escalar o redeploy. La corrección es usar nombre lógico + discovery/DNS y health checks.

### Tema 2: Spring Cloud Gateway · Intermedio · 150 min

## Spring Cloud Gateway: routing y políticas en el borde

El frontend móvil de Tienda Aurora consume cinco microservicios. Cada uno tiene URL, autenticación, CORS y rate limit distintos. El gateway es la recepción central: todos entran por una puerta, se verifica credencial, se registra la visita y se dirige a la oficina correcta. La recepción no hace el trabajo de cada oficina; solo enruta y aplica políticas transversales.

```java
import java.util.*;

public class GatewayExample {
    static Map<String, String> routes = Map.of("/orders", "orders-svc", "/catalog", "catalog-svc");

    static String route(String path) {
        return routes.getOrDefault(path, "404");
    }

    public static void main(String[] args) {
        System.out.println("orders-route=" + route("/orders"));
        System.out.println("unknown-route=" + route("/x"));
    }
}
```

```bash
javac GatewayExample.java
java GatewayExample
```

Salida esperada:

```text
orders-route=orders-svc
unknown-route=404
```

En Spring Cloud Gateway, `lb://orders-service` usa load balancing por nombre lógico. Los filtros aplican auth, rate limit, headers, correlation ID. El gateway no debe contener lógica de negocio.

El error más común es gateway con lógica de negocio. El síntoma es que cambios de dominio requieren redeploy de gateway. La corrección es políticas transversales en gateway, dominio en servicios.

## Configuración centralizada

Tienes 12 instancias de `orders-service`. Necesitas cambiar un timeout de 500ms a 800ms. Hoy eso implica editar envs en varios lugares, reinicios inconsistentes y una instancia olvidada con la configuración vieja.

La configuración centralizada es como el manual operativo en la sala de control. Todos los operadores leen el mismo manual versionado. Si cambia una instrucción, se sabe qué versión cambió, quién la cambió y cómo volver atrás.

```java
import java.util.*;

public class ConfigExample {
    static Map<String, String> cfg = Map.of("orders.timeoutMs", "500");

    public static void main(String[] args) {
        System.out.println("timeout=" + cfg.get("orders.timeoutMs"));
    }
}
```

```bash
javac ConfigExample.java
java ConfigExample
```

Salida esperada:

```text
timeout=500
```

En Spring Cloud Config, la config vive fuera del artefacto en un repo Git. El versionado da auditoría y rollback. Secretos sensibles deben ir a secret manager. El refresh dinámico puede crear inconsistencia entre instancias.

El error más común es refresh masivo sin control. El síntoma es comportamiento inconsistente entre instancias. La corrección es versionar config, rollout controlado, preferir config inmutable.

## Load balancing y BFF

`inventory-service` tiene tres instancias. Sin balanceo, todas las requests caen en una sola y se satura. Además, el cliente móvil recibe payloads pesados pensados para web.

El load balancer es el organizador de filas en un banco: dirige al siguiente cliente a la ventanilla disponible. El BFF es un asesor especializado por canal: al cliente móvil le entrega solo lo que necesita, sin cambiar las reglas del banco.

```java
import java.util.*;

public class LoadBalancerExample {
    static List<String> instances = List.of("i1", "i2");
    static String pick(int req) { return instances.get(req % instances.size()); }

    public static void main(String[] args) {
        System.out.println("req-0=" + pick(0));
        System.out.println("req-1=" + pick(1));
        System.out.println("req-2=" + pick(2));
    }
}
```

```bash
javac LoadBalancerExample.java
java LoadBalancerExample
```

Salida esperada:

```text
req-0=i1
req-1=i2
req-2=i1
```

En Spring Cloud LoadBalancer, el algoritmo reparte entre instancias sanas. El BFF adapta payload por canal sin duplicar reglas de negocio. Si el BFF empieza a hacer orquestación compleja, es un smell: debe delegar a servicios.

El error más común es BFF con lógica de negocio. El síntoma son inconsistencias entre clientes. La causa son reglas duplicadas. La corrección es BFF compone/adapta; dominio vive en servicios.

## Cierre

La infraestructura distribuida resuelve cross-cutting concerns, pero cada pieza agrega modos de fallo. Usa discovery o DNS según plataforma, gateway para políticas transversales, config centralizada con auditoría y BFF para adaptar canales. Si el componente no elimina un dolor real, no lo agregues. Tienda Aurora usa Gradle para coordinar el build multi-módulo con dependencias explícitas por servicio.

## Checklist

- Nombre lógico en lugar de IP hardcodeada.
- Gateway fino, observable y sin lógica de negocio.
- Config centralizada versionada; secretos fuera de Git.
- Load balancing con instancias sanas.
- BFF adapta, no duplica dominio.
- Nota de verificación honesta cuando falta infra.
