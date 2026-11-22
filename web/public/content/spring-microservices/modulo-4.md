# Módulo 4 · Arquitectura y límites de servicio en Spring

Dividir un sistema en microservicios sin criterio crea un monolito distribuido: más latencia, más fallos y menos autonomía. Este módulo cubre límites, DDD, Spring Modulith, Strangler Fig y database-per-service desde la perspectiva del ecosistema Spring.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2. Los ejemplos de límites, ownership y migración se ejecutan con Java puro. Spring Modulith requiere dependencias Spring; se incluye **Nota de verificación**.

## Aprende construyendo

### Tema 1: Monolito modular vs microservicios · Intermedio · 120 min

Caso guía: un e-commerce crece; el equipo debate extraer servicios.

#### Criterio de arquitectura

**Definición formal.** Un monolito modular organiza el sistema en módulos con límites internos pero despliegue único. Microservicios despliegan unidades independientes con contratos y datos propios.

**Cuándo usarlo / cuándo no.** Empieza modular; extrae microservicios cuando haya evidencia: equipos independientes, escalado distinto, límites claros, costo de coordinación mayor que costo distribuido. No dividas por moda.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm4-mod
cd sm4-mod
```

Crea el archivo `Decision.java`:

```java
public class Decision {
  static String choose(boolean clearBoundary, boolean independentDeploy, boolean teamReady) {
    if (clearBoundary && independentDeploy && teamReady) return "microservice";
    return "modular-monolith";
  }
  public static void main(String[] args) {
    System.out.println(choose(true,true,true));
    System.out.println(choose(true,false,true));
  }
}
```

```bash
javac Decision.java
java Decision
```

**Caso de uso real.** Extraer billing cuando tiene escala/regulatorio distinto.

**Error común.** Microservicios prematuros.

**Síntoma.** más incidentes y despliegues coordinados. **Causa.** límites inmaduros. **Corrección.** empezar modular, extraer por evidencia. **Señal observable.** lead time sube tras la división.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `microservice`, `modular-monolith`.

### Tema 2: DDD: bounded contexts, aggregates y domain events · Avanzado · 180 min

Caso guía: `Order` y `Payment` tienen reglas distintas.

#### Bounded context y aggregate

**Definición formal.** Bounded context delimita un modelo consistente. Aggregate es un clúster de objetos con invariantes y una raíz. Domain event representa un hecho del dominio.

**Cuándo usarlo / cuándo no.** Úsalo cuando el dominio tiene reglas complejas. No fuerces DDD táctico en CRUD simple.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm4-ddd
cd sm4-ddd
```

Crea el archivo `Ddd.java`:

```java
import java.util.*;
record OrderCreated(String orderId) {}
class OrderAggregate {
  String id; String status = "NEW";
  List<Object> events = new ArrayList<>();
  OrderAggregate(String id){ this.id = id; events.add(new OrderCreated(id)); }
  void pay(){ if(!"NEW".equals(status)) throw new IllegalStateException("invalid"); status = "PAID"; }
}
public class Ddd {
  public static void main(String[] args) {
    var o = new OrderAggregate("o1");
    System.out.println(o.events.size());
    o.pay(); System.out.println(o.status);
  }
}
```

```bash
javac Ddd.java
java Ddd
```

**Caso de uso real.** Aggregate `Order` publica `OrderCreated`; billing consume evento.

**Error común.** Aggregate gigante.

**Síntoma.** contención, transacciones largas. **Causa.** invariantes mal delimitadas. **Corrección.** aggregates pequeños, consistencia eventual entre aggregates. **Señal observable.** locks/latencia alta en writes.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `1`, `PAID`.

### Tema 3: Spring Modulith · Avanzado · 120 min

Caso guía: validar límites modulares antes de extraer microservicios.

#### Modulith

**Definición formal.** Spring Modulith permite estructurar y verificar módulos lógicos dentro de una app Spring Boot, con pruebas de dependencias y eventos internos.

**Cuándo usarlo / cuándo no.** Úsalo como paso intermedio o para monolito modular. No lo uses como excusa para no definir contratos.

**Ejemplo mínimo enfocado (ejecutable: regla de módulo).**

```bash
mkdir -p sm4-modulith
cd sm4-modulith
```

Crea el archivo `Modulith.java`:

```java
public class Modulith {
  static boolean allowed(String from,String to){ return !(from.equals("orders") && to.equals("billing.internal")); }
  public static void main(String[] args){ System.out.println(allowed("orders","billing.api")); System.out.println(allowed("orders","billing.internal")); }
}
```

```bash
javac Modulith.java
java Modulith
```

**Caso de uso real.** `ApplicationModules.verify()` en tests.

**Error común.** Módulos sin tests de frontera.

**Síntoma.** acoplamiento invisible. **Causa.** imports cruzados. **Corrección.** verificar módulos en CI. **Señal observable.** cambios rompen otros módulos inesperadamente.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`. **Nota de verificación:** Spring Modulith real requiere dependencia Spring.

### Tema 4: Strangler Fig · Intermedio · 120 min

Caso guía: migrar monolito a servicios gradualmente.

#### Strangler Fig

**Definición formal.** Patrón de migración incremental que enruta capacidades al nuevo sistema por etapas, retirando el legado cuando ya no recibe tráfico.

**Cuándo usarlo / cuándo no.** Úsalo en sistemas vivos. Evita big bang salvo caso extremo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm4-strangler
cd sm4-strangler
```

Crea el archivo `Strangler.java`:

```java
import java.util.*;
public class Strangler {
  public static void main(String[] args) {
    Set<String> migrated = Set.of("catalog");
    System.out.println(migrated.contains("catalog") ? "new" : "legacy");
    System.out.println(migrated.contains("orders") ? "new" : "legacy");
  }
}
```

```bash
javac Strangler.java
java Strangler
```

**Caso de uso real.** Gateway enruta `/catalog` a servicio nuevo.

**Error común.** Doble escritura sin estrategia.

**Síntoma.** datos divergentes. **Causa.** no definir source of truth/cutover. **Corrección.** CDC/outbox, backfill, verificación. **Señal observable.** conteos distintos entre sistemas.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `new`, `legacy`.

### Tema 5: Database-per-service · Avanzado · 120 min

Caso guía: `orders` y `billing` no deben compartir tablas.

#### Propiedad de datos

**Definición formal.** Cada servicio posee su base de datos/esquema y expone datos por API/eventos, no por acceso directo a tablas ajenas.

**Cuándo usarlo / cuándo no.** Úsalo para autonomía real. No compartas DB para “ir más rápido”.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm4-db
cd sm4-db
```

Crea el archivo `Owner.java`:

```java
import java.util.*;
public class Owner {
  static boolean canWrite(String service, String tableOwner) { return service.equals(tableOwner); }
  public static void main(String[] args) {
    System.out.println(canWrite("orders","orders"));
    System.out.println(canWrite("billing","orders"));
  }
}
```

```bash
javac Owner.java
java Owner
```

**Caso de uso real.** Orders publica evento; billing mantiene su proyección.

**Error común.** DB compartida entre microservicios.

**Síntoma.** cambios de esquema rompen otros servicios. **Causa.** acoplamiento por datos. **Corrección.** contratos/API/eventos, ownership. **Señal observable.** deploy coordinado por migración.

**Verificación (JDK 27.0.1.0.2, 2026-05-22).** Salida: `true`, `false`.

## Cierre

Los límites correctos son la decisión arquitectónica más cara de revertir. DDD, Modulith y Strangler Fig ayudan a dividir con evidencia; database-per-service protege la autonomía.

## Checklist

- Tengo criterio para no usar microservicios.
- Defino bounded contexts y ownership de datos.
- Uso Strangler Fig para migración incremental.
- Evito DB compartida entre servicios.
