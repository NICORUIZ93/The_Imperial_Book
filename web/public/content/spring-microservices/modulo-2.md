# Módulo 2 · Testing de microservicios de Tienda Aurora

Los microservicios fallan en las fronteras: contratos, datos, red, configuración y arquitectura. El testing no busca "100% cobertura"; busca confianza con feedback rápido. Este módulo cubre pirámide de tests, dobles, integración realista, contratos, arquitectura y calidad estática, usando Tienda Aurora como proyecto integrador.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Los smokes ejecutan reglas de decisión, dobles, contratos, invariantes arquitectónicas, gates y configuración cloud-like en Java puro. JUnit/Mockito/MockMvc/Testcontainers/Pact/ArchUnit/SonarQube requieren dependencias o infraestructura; se incluyen notas de verificación honestas.

## JUnit, Mockito y MockMvc: tests que dan confianza

El equipo tiene "90% de cobertura" y aun así un deploy rompe producción. Los tests mockean el repositorio, el cliente HTTP y el servicio de pagos; verifican que los mocks se llamen con ciertos argumentos, pero nunca verifican una regla de negocio real ni un contrato de datos. La cobertura es alta, la confianza es cero.

Un unit test es como revisar el motor del auto en el taller: rápido, aislado y útil. Un integration test es como sacar el auto a la calle. Si solo revisas en el taller, no sabes si las ruedas tocan bien el pavimento. Mockear todo convierte el taller en un simulador sin contacto con la realidad.

```java
public class TaxAndPriceSmoke {
    interface TaxProvider { double rate(); }

    static class PriceService {
        private final TaxProvider tax;
        PriceService(TaxProvider tax) { this.tax = tax; }
        double total(double base) { return base * (1 + tax.rate()); }
    }

    public static void main(String[] args) {
        TaxProvider stub = () -> 0.21;
        PriceService service = new PriceService(stub);
        System.out.println("total-with-tax=" + service.total(100));
        System.out.println("tax-rate=" + stub.rate());
    }
}
```

```bash
javac TaxAndPriceSmoke.java
java TaxAndPriceSmoke
```

Salida esperada:

```text
total-with-tax=121.0
tax-rate=0.21
```

En Spring Boot, `@WebMvcTest` + `MockMvc` prueba la capa web sin levantar HTTP real. `Mockito` crea dobles para fronteras externas (clock, gateway, payment). El error más común es mockear todo: tests verdes pero producción falla. La causa es dobles que no representan contratos reales. La corrección es dobles en fronteras, integración para DB/HTTP reales.

## Testcontainers: integración realista

El equipo usa H2 para tests porque "es rápido". En producción PostgreSQL falla por un tipo JSON, un índice o un lock. El test pasó, el deploy falló. La causa fue confiar en una base distinta a la de producción.

Testcontainers es como pedir el plato real en vez de una foto. El contenedor efímero levanta PostgreSQL real, se destruye al final y cada test empieza limpio. Es más lento que H2, pero prueba el contrato real de la base.

```java
public class TestcontainersDecisionSmoke {
    static String strategy(String dependency) {
        return switch (dependency) {
            case "unit-pure-logic" -> "NO_CONTAINER";
            case "postgres-repository" -> "TESTCONTAINERS_POSTGRES";
            case "redis-cache" -> "TESTCONTAINERS_REDIS";
            case "cloud-s3" -> "FLOCI_OR_LOCALSTACK";
            default -> "EVALUATE";
        };
    }

    public static void main(String[] args) {
        System.out.println("postgres=" + strategy("postgres-repository"));
        System.out.println("pure-logic=" + strategy("unit-pure-logic"));
    }
}
```

```bash
javac TestcontainersDecisionSmoke.java
java TestcontainersDecisionSmoke
```

Salida esperada:

```text
postgres=TESTCONTAINERS_POSTGRES
pure-logic=NO_CONTAINER
```

El error más común es usar H2 para todo. El síntoma es falla en prod por dialecto. La causa son diferencias H2/Postgres. La corrección es Testcontainers con DB real. No asumas H2 compatible con PostgreSQL.

## Contract Testing con Pact: contratos entre servicios

`orders-service` consume `catalog-service`. El equipo de catalog cambia el campo `price` a `unitPrice` y despliega. `orders` deja de mapear precios y cobra mal. Los tests de ambos servicios pasaron porque cada uno probó contra su propio mock, no contra el contrato real.

Un contract test es como un acuerdo firmado entre dos equipos: el consumidor dice "yo espero estos campos" y el proveedor se compromete a cumplirlo. Si alguien cambia el contrato, el CI lo detecta antes del deploy.

```java
import java.util.*;

public class ContractShapeSmoke {
    static boolean providerSatisfiesConsumer(Map<String, Object> providerResponse) {
        return providerResponse.containsKey("id")
            && providerResponse.containsKey("price")
            && providerResponse.get("price") instanceof Number;
    }

    static boolean compatibleEvolution(Map<String, Object> oldResp, Map<String, Object> newResp) {
        return providerSatisfiesConsumer(newResp)
            && oldResp.keySet().stream().allMatch(newResp::containsKey);
    }

    public static void main(String[] args) {
        Map<String, Object> oldResp = Map.of("id", "p1", "price", 10);
        Map<String, Object> newResp = Map.of("id", "p1", "price", 10, "currency", "USD");
        Map<String, Object> broken = Map.of("id", "p1", "unitPrice", 10);

        System.out.println("old-valid=" + providerSatisfiesConsumer(oldResp));
        System.out.println("broken-valid=" + providerSatisfiesConsumer(broken));
        System.out.println("evolution-compatible=" + compatibleEvolution(oldResp, newResp));
    }
}
```

```bash
javac ContractShapeSmoke.java
java ContractShapeSmoke
```

Salida esperada:

```text
old-valid=true
broken-valid=false
evolution-compatible=true
```

El error más común es contratos sobre-especificados. El síntoma son fallos por campos irrelevantes. La causa es verificar más de lo que el consumidor usa. La corrección es contrato mínimo basado en uso real.

## ArchUnit: reglas de arquitectura ejecutables

El equipo define "domain no depende de web" en una wiki. Con el tiempo, alguien importa `spring-web` en un aggregate. Nadie se da cuenta hasta que un refactor rompe la arquitectura. La regla era humana, no ejecutable.

ArchUnit convierte una regla arquitectónica en un test que falla el build. Es como poner una alarma en la puerta: si alguien intenta entrar por la puerta prohibida, la alarma suena en CI, no en producción.

```java
public class ArchRuleSmoke {
    static boolean allowed(String fromPackage, String toPackage) {
        if (fromPackage.contains("domain") && toPackage.startsWith("spring")) return false;
        if (fromPackage.contains("domain") && toPackage.contains("web")) return false;
        return true;
    }

    public static void main(String[] args) {
        System.out.println("domain->util=" + allowed("com.aurora.domain", "java.util"));
        System.out.println("domain->web=" + allowed("com.aurora.domain", "org.springframework.web"));
    }
}
```

```bash
javac ArchRuleSmoke.java
java ArchRuleSmoke
```

Salida esperada:

```text
domain->util=true
domain->web=false
```

El error más común es reglas solo en documentación. El síntoma es erosión arquitectónica gradual. La causa es sin enforcement automático. La corrección es ArchUnit en CI con reglas clave.

## SonarQube: calidad estática en CI

El equipo acumula deuda técnica: métodos de 300 líneas, complejidad ciclomática alta, duplicación y vulnerabilidades conocidas. Nadie las arregla porque "funciona". Cuando un bug crítico aparece, la causa es código que nadie quería tocar.

SonarQube es como el inspector de calidad de una fábrica. No construye el producto, pero detecta defectos antes de que salgan. El quality gate es la línea de rechazo: si el producto no cumple estándares, no sale.

```java
public class QualityGateSmoke {
    static boolean gate(boolean testsPass, int criticalBugs, double newCoverage) {
        return testsPass && criticalBugs == 0 && newCoverage >= 80.0;
    }

    public static void main(String[] args) {
        System.out.println("gate-ok=" + gate(true, 0, 85.0));
        System.out.println("gate-fail-bug=" + gate(true, 1, 90.0));
    }
}
```

```bash
javac QualityGateSmoke.java
java QualityGateSmoke
```

Salida esperada:

```text
gate-ok=true
gate-fail-bug=false
```

El error más común es ignorar quality gate. El síntoma es deuda crece sin control. La causa es no bloquear merges. La corrección es gate razonable y gradual, revisión de hallazgos.

## Floci: emular cloud en tests/CI

Un microservicio de Tienda Aurora usa S3 y SQS de AWS. En CI no hay cuenta cloud ni credenciales seguras. El equipo usa mocks de SDK, pero nunca valida serialización, permisos básicos ni wiring real. En producción, una diferencia de API o configuración causa fallos.

Floci es como un decorado de estudio: parece AWS para las llamadas que importan en tests, pero no es AWS real. Sirve para validar integración local sin costo ni credenciales reales. El error es confundir el decorado con el set real.

```java
public class FlociConfigSmoke {
    record ClientCfg(String endpoint, String creds, String region) {}

    static ClientCfg cfg(boolean emulator) {
        if (emulator) return new ClientCfg("http://localhost:4566", "test/test", "us-east-1");
        return new ClientCfg("https://s3.amazonaws.com", "iam-role", "us-east-1");
    }

    public static void main(String[] args) {
        System.out.println("emulator=" + cfg(true));
        System.out.println("cloud-creds=" + cfg(false).creds());
    }
}
```

```bash
javac FlociConfigSmoke.java
java FlociConfigSmoke
```

Salida esperada:

```text
emulator=ClientCfg[endpoint=http://localhost:4566, creds=test/test, region=us-east-1]
cloud-creds=iam-role
```

El error más común es asumir paridad total. El síntoma es test pasa en CI, falla en AWS. La causa es emulador no cubre IAM/cuotas/latencia/features. La corrección es emulador para feedback rápido + smoke selectivo en cloud real.

## Cierre

Testing en microservicios es economía de confianza: rápido en unit/slice, realista en integración, contractual en fronteras, arquitectónico en CI y con quality gates que bloquean deuda nueva. Tienda Aurora se prueba con Testcontainers para DB, Pact para contratos, ArchUnit para arquitectura y SonarQube para calidad estática. Gradle coordina el build multi-módulo con dependencias por servicio.

## Checklist

- Distingues unit, slice, integration, contract, e2e.
- No mockeas lo que necesitas validar como integración.
- Contratos versionados para servicios independientes.
- Reglas de arquitectura en CI.
- Quality gate con señal útil.
- Emulador para feedback rápido, cloud real para riesgos críticos.
