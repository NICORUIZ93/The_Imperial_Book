# Módulo 6 · Infraestructura distribuida de Tienda Aurora

Una vez que Tienda Aurora tiene múltiples servicios, aparecen problemas transversales: descubrir instancias, enrutar tráfico, distribuir configuración y balancear carga. Spring Cloud aporta componentes para estos concerns. El criterio importa más que el componente: úsalo cuando resuelve un problema real de tu plataforma. Este módulo cubre service discovery, API Gateway, configuración centralizada y load balancing/BFF.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Los smokes validan la lógica de discovery, routing, config lookup y balanceo con Java puro. Eureka/Consul/Nacos/Gateway/Config Server requieren infraestructura; se incluyen notas de verificación honestas.

### Tema 1: Service discovery con Eureka/Consul/Nacos · Intermedio · 150 min

## Service discovery: de IPs hardcodeadas a nombres lógicos

`orders-service` necesita llamar a `inventory-service`. En desarrollo pusiste `http://localhost:8082`. En producción hay tres instancias, una se cae, otra se despliega con IP nueva y el autoscaler crea una cuarta. La URL hardcodeada deja de funcionar. El síntoma es simple y brutal: errores `Connection refused` después de cada despliegue. El problema real es tratar instancias efímeras como direcciones fijas.

Service discovery es como la recepción de un edificio de oficinas. No buscas a una persona por su silla; preguntas en recepción por el nombre del equipo y te indican qué oficina está disponible ahora. Los servicios se registran con nombre y salud, y los consumidores preguntan por nombre lógico. La analogía tiene límite: la recepción puede tener información desactualizada por unos segundos. Por eso discovery no reemplaza timeouts, retries ni circuit breakers.

```java
import java.util.*;

public class DiscoverySmoke {
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
javac DiscoverySmoke.java
java DiscoverySmoke
```

Salida esperada:

```text
instances=2
missing=0
```

En Spring Cloud, Nacos o Eureka gestionan el registro. El consumidor usa `lb://inventory-service` y Spring Cloud LoadBalancer resuelve la instancia. En Kubernetes, DNS/Service suele bastar y no necesitas Eureka/Nacos.

El error más común es IP hardcodeada en configuración. El síntoma son fallos tras escalar o redeploy. La causa es que la instancia cambió de dirección. La corrección es usar nombre lógico + discovery/DNS y health checks. La señal observable es `Connection refused` a IP vieja.

### Tema 2: Spring Cloud Gateway · Intermedio · 150 min

## Spring Cloud Gateway: routing y políticas en el borde

El frontend móvil de Tienda Aurora consume cinco microservicios. Cada uno tiene URL, autenticación, CORS y rate limit distintos. Cada cambio de topología obliga a cambiar el cliente. Además, no hay un punto único para observabilidad de borde.

El gateway es la recepción central del edificio: todos entran por una puerta, se verifica credencial, se registra la visita y se dirige a la oficina correcta. La recepción no hace el trabajo de cada oficina; solo enruta y aplica políticas transversales. El gateway no debe contener lógica de negocio.

```java
import java.util.*;

public class GatewaySmoke {
    static Map<String, String> routes = Map.of("/orders", "orders-svc", "/catalog", "catalog-svc");

    static String route(String path) {
        return routes.getOrDefault(path, "404");
    }

    public static void main(String[] args) {
        System.out.println(route("/orders"));
        System.out.println(route("/x"));
    }
}
```

```bash
javac GatewaySmoke.java
java GatewaySmoke
```

Salida esperada:

```text
orders-svc
404
```

En Spring Cloud Gateway, `lb://orders-service` usa load balancing por nombre lógico. Los filtros aplican concerns transversales: auth, rate limit, headers, correlation ID. El gateway no debe contener reglas de negocio.

El error más común es gateway con lógica de negocio. El síntoma es que cambios de dominio requieren redeploy de gateway. La causa es responsabilidades mal ubicadas. La corrección es políticas transversales en gateway, dominio en servicios.

### Tema 3: Spring Cloud Config y configuración centralizada · Intermedio · 120 min

## Configuración centralizada: un solo manual para todos

Tienes 12 instancias de `orders-service`. Necesitas cambiar un timeout de 500ms a 800ms. Hoy eso implica editar envs en varios lugares, reinicios inconsistentes y una instancia olvidada con la configuración vieja.

La configuración centralizada es como el manual operativo en la sala de control. Todos los operadores leen el mismo manual versionado. Si cambia una instrucción, se sabe qué versión cambió, quién la cambió y cómo volver atrás.

```java
import java.util.*;

public class ConfigSmoke {
    static Map<String, String> cfg = Map.of("orders.timeoutMs", "500");

    public static void main(String[] args) {
        System.out.println(cfg.get("orders.timeoutMs"));
    }
}
```

```bash
javac ConfigSmoke.java
java ConfigSmoke
```

Salida esperada:

```text
500
```

En Spring Cloud Config, la config vive fuera del artefacto en un repo Git. El versionado da auditoría y rollback. Secretos sensibles deben ir a secret manager, no en texto plano. El refresh dinámico puede crear inconsistencia entre instancias.

El error más común es refresh masivo sin control. El síntoma es comportamiento inconsistente entre instancias. La causa es cambio en caliente no coordinado. La corrección es versionar config, rollout controlado, preferir config inmutable.

### Tema 4: Load balancing y BFF · Intermedio · 120 min

## Load balancing y BFF: repartir carga y adaptar canales

`inventory-service` tiene tres instancias. Sin balanceo, todas las requests caen en una sola y se satura. Además, el cliente móvil recibe payloads pesados pensados para web.

El load balancer es el organizador de filas en un banco: dirige al siguiente cliente a la ventanilla disponible. El BFF es un asesor especializado por canal: al cliente móvil le entrega solo lo que necesita, sin cambiar las reglas del banco.

```java
import java.util.*;

public class LoadBalancerSmoke {
    static List<String> instances = List.of("i1", "i2");
    static String pick(int req) { return instances.get(req % instances.size()); }

    public static void main(String[] args) {
        System.out.println(pick(0));
        System.out.println(pick(1));
        System.out.println(pick(2));
    }
}
```

```bash
javac LoadBalancerSmoke.java
java LoadBalancerSmoke
```

Salida esperada:

```text
i1
i2
i1
```

En Spring Cloud LoadBalancer, el algoritmo reparte entre instancias sanas. El BFF adapta payload por canal sin duplicar reglas de negocio. Si el BFF empieza a hacer orquestación compleja, es un smell: debe delegar a servicios.

El error más común es BFF con lógica de negocio. El síntoma son inconsistencias entre clientes. La causa son reglas duplicadas. La corrección es BFF compone/adapta; dominio vive en servicios.

## Cierre

La infraestructura distribuida resuelve cross-cutting concerns, pero cada pieza agrega modos de fallo. Usa discovery o DNS según plataforma, gateway para políticas transversales, config centralizada con auditoría y BFF para adaptar canales. Si el componente no elimina un dolor real, no lo agregues. Gradle coordina el build multi-módulo de Tienda Aurora con dependencias explícitas por servicio.

## Checklist

- Nombre lógico en lugar de IP hardcodeada.
- Gateway fino, observable y sin lógica de negocio.
- Config centralizada versionada; secretos fuera de Git.
- Load balancing con instancias sanas.
- BFF adapta, no duplica dominio.
- Nota de verificación honesta cuando falta infra.
