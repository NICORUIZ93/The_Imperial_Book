# Módulo 17: Microservicios avanzados

Más allá de crear varios servicios, los microservicios distribuidos exigen manejar consistencia eventual, contratos, idempotencia, retries y DLQ. Este módulo resume los patrones críticos para operar sin perder datos ni coherencia.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Spring Boot 3.5.0, Docker 29.9.3 para labs de infraestructura.

## Aprende construyendo

### Tema 1: Consistencia eventual y sagas · Avanzado · 45 min

Caso guía: crear pedido, reservar inventario y cobrar. Un paso falla.

#### Saga

**Definición formal.** Secuencia de transacciones locales con acciones compensatorias para lograr consistencia eventual entre servicios.

```mermaid
flowchart LR
  A[Crear pedido] --> B[Reservar inventario]
  B --> C[Cobrar]
  C -->|falla| D[Compensar inventario]
  D --> E[Cancelar pedido]
```

**Error común.** Usar distributed 2PC por defecto. Corrección: evaluar sagas/compensaciones cuando el dominio lo permite.

### Tema 2: Contratos de API y compatibilidad · Avanzado · 45 min

Caso guía: servicio B depende de un campo que servicio A quiere renombrar.

#### Contratos

**Definición formal.** Acuerdos versionados sobre requests/responses/eventos. Incluyen compatibilidad backward/forward y pruebas de contrato.

**Error común.** Cambiar payload sin versión/compatibilidad. Corrección: additive changes, deprecación, contract tests.

### Tema 3: Operación distribuida: idempotencia, retries, DLQ · Avanzado · 45 min

Caso guía: evento duplicado por entrega at-least-once.

#### Idempotencia operativa

**Definición formal.** Procesar el mismo mensaje/request varias veces produce el mismo efecto final.

**Ejemplo mínimo (ejecutable).**

```bash
mkdir -p java-sb17-idem
cd java-sb17-idem
```

Crea el archivo `DemoIdem.java`:

```java
import java.util.*;
public class DemoIdem {
  static final Set<String> seen = new HashSet<>();
  static String procesar(String id){ if(!seen.add(id)) return "dup"; return "ok"; }
  public static void main(String[] args){ System.out.println(procesar("E1")); System.out.println(procesar("E1")); }
}
```

```bash
javac DemoIdem.java
java DemoIdem
```

**Verificación (JDK 27, 2026-05-22).** `ok`, `dup`.

**Error común.** Retry sin idempotencia. Corrección: idempotency key/inbox.

## Cierre

En distribuido, el fallo normal es parcial. Diseña para duplicados, compensaciones y contratos versionados.

## Checklist

- Uso sagas/compensaciones cuando aplica.
- Versiono contratos.
- Hago idempotentes consumers/endpoints críticos.
