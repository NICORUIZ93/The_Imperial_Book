# Módulo 10: Módulos (JPMS) y proyectos grandes

Cuando un proyecto crece, el classpath plano permite que cualquier clase acceda a casi cualquier otra. El Java Platform Module System (JPMS), introducido en Java 9, añade límites explícitos: qué paquetes exporta un módulo y qué módulos requiere. Este módulo muestra cuándo JPMS aporta valor y cómo migrar de forma incremental.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Declarar `module-info.java` con `requires` y `exports` |
| 2 | Evaluar migración incremental y cuándo JPMS vale la pena |
| 3 | Usar `opens` para reflexión controlada en frameworks |

## Aprende construyendo

### Tema 1: module-info.java y encapsulación fuerte · Intermedio · 40 min

**Caso guía**

Tienes dos componentes: `core` con lógica de dominio y `app` que la consume. Quieres que `app` solo use la API pública de `core`, no sus clases internas.

**Concepto clave / modelo mental**

Un módulo JPMS es un conjunto de paquetes con un descriptor `module-info.java`.

| Directiva | Significado |
|---|---|
| `module mi.modulo { }` | Declara el módulo |
| `requires otro.modulo;` | Depende de otro módulo |
| `exports paquete;` | Hace público un paquete para otros módulos |
| `opens paquete;` | Permite reflexión en tiempo de ejecución |
| `provides ... with ...` | Implementa un servicio |
| `uses ...` | Consume un servicio |

La encapsulación fuerte significa que, aunque una clase sea `public`, si su paquete no está exportado, otros módulos no pueden accederla normalmente.

**Implementación desde cero**

Estructura:

```text
core/
  src/module-info.java
  src/com/academia/core/Api.java
  src/com/academia/core/internal/Detalle.java
app/
  src/module-info.java
  src/com/academia/app/Main.java
```

`core/src/module-info.java`:

```java
module com.academia.core {
    exports com.academia.core;
}
```

`core/src/com/academia/core/Api.java`:

```java
package com.academia.core;

public class Api {
    public static String saludar() { return "hola desde core"; }
}
```

`app/src/module-info.java`:

```java
module com.academia.app {
    requires com.academia.core;
}
```

`app/src/com/academia/app/Main.java`:

```java
package com.academia.app;

import com.academia.core.Api;

public class Main {
    public static void main(String[] args) {
        System.out.println(Api.saludar());
    }
}
```

**Desglose del código**

- `exports com.academia.core` expone solo ese paquete.
- `com.academia.core.internal` no se exporta: `app` no debería depender de él.
- `requires com.academia.core` declara la dependencia explícita.
- Esto se verifica en compilación y en ejecución con el module path.

**Ejecución y salida real**

```bash
javac -d out/core core/src/module-info.java core/src/com/academia/core/Api.java
javac --module-path out -d out/app app/src/module-info.java app/src/com/academia/app/Main.java
java --module-path out -m com.academia.app/com.academia.app.Main
```

```text
hola desde core
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `package is not visible` | Paquete no exportado | Exporta el paquete correcto o rediseña la API |
| `module not found` | Falta `--module-path` o dependencia | Revisa module path y `requires` |
| Dependencia cíclica entre módulos | Diseño acoplado | Extrae API común o invierte dependencia |

**Verificación rápida**

Intenta importar una clase de un paquete no exportado desde `app`: el compilador debe rechazarlo.

### Tema 2: Migración incremental y cuándo JPMS aporta valor · Intermedio · 35 min

**Contexto y para qué sirve**

No todos los proyectos necesitan JPMS. Migrar un monolito grande con muchas librerías no modularizadas puede costar más que el beneficio. Necesitas criterio.

**Concepto clave / modelo mental**

JPMS aporta más cuando:

- tienes límites de arquitectura claros;
- quieres encapsulación fuerte entre componentes;
- construyes runtime reducido o plataforma modular;
- el proyecto es grande y longevo.

Puede no valer la pena cuando:

- es una app pequeña;
- depende mucho de librerías automáticas/no modularizadas;
- el equipo no tiene necesidad real de límites de módulo.

Estrategia incremental:

1. Mantén el classpath y organiza por paquetes/JARs.
2. Introduce módulos en los bordes o componentes nuevos.
3. Usa módulos automáticos con cuidado durante la transición.
4. Convierte a módulos nombrados cuando el grafo sea estable.

**Implementación desde cero**

Checklist de decisión:

```text
¿Necesito encapsulación fuerte entre componentes?  sí/no
¿Puedo controlar dependencias internas?            sí/no
¿Mis librerías clave soportan JPMS?               sí/no
¿El costo de migración es menor que el beneficio? sí/no
```

Ejemplo de comando mixto (classpath + module path) durante migración:

```bash
java --module-path mods --class-path libs/* -m app/com.academia.app.Main
```

**Desglose del código**

- La migración incremental evita “big bang”.
- Los módulos automáticos permiten usar JARs no modularizados, pero con menos garantías.
- La decisión debe basarse en coste/beneficio, no en moda.

**Ejecución y salida real**

No hay una salida única: el resultado esperado es un plan de migración con alcance, riesgos y orden.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Migración atascada | Intentaste modularizar todo a la vez | Migra por bordes y componentes |
| `split package` | El mismo paquete existe en varios módulos/JARs | Refactoriza paquetes |
| Adopción por moda | No había problema real | Evalúa costo/beneficio antes |

**Verificación rápida**

Toma un proyecto existente y clasifica sus componentes: candidato a módulo, librería automática, o mantener en classpath.

### Tema 3: opens para acceso reflexivo controlado de frameworks · Avanzado · 35 min

**Caso guía**

Un framework usa reflexión para acceder a campos privados de una entidad. Con encapsulación fuerte, eso puede fallar si el paquete no está abierto.

**Concepto clave / modelo mental**

`exports` permite acceso en compilación/runtime a API pública. `opens` permite acceso reflexivo en runtime, incluso a miembros no públicos, para paquetes específicos.

| Directiva | Acceso |
|---|---|
| `exports p` | API pública accesible |
| `opens p` | Reflexión permitida en runtime |
| `opens p to m` | Reflexión permitida solo al módulo `m` |

Usa `opens` solo cuando lo necesite un framework (serialización, ORM, DI). No abras todo por defecto.

**Implementación desde cero**

```java
module com.academia.modelo {
    exports com.academia.modelo.api;
    opens com.academia.modelo.entity to com.fasterxml.jackson.databind;
}
```

Ejemplo conceptual de entidad:

```java
package com.academia.modelo.entity;

public class Guia {
    private String id;
    public Guia() {}
    public Guia(String id) { this.id = id; }
    public String getId() { return id; }
}
```

**Desglose del código**

- `exports ...api` publica la API.
- `opens ...entity to ...jackson.databind` permite reflexión solo al módulo indicado.
- Abrir a un módulo específico es más seguro que `open module`.

**Ejecución y salida real**

Si el framework necesita reflexión y el paquete está abierto correctamente, la serialización/deserialización funciona. Si no, verás errores como `InaccessibleObjectException`.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `InaccessibleObjectException` | Paquete no abierto | Usa `opens` específico al módulo/framework |
| Abriste todo el módulo | `open module` por comodidad | Reduce a `opens paquete to modulo` |
| Confundes `exports` con `opens` | Son permisos distintos | `exports` para API, `opens` para reflexión |

**Verificación rápida**

Reproduce un caso con reflexión sobre un paquete no abierto y corrígelo con `opens ... to ...`.

## Cierre del módulo

JPMS no es obligatorio para todo proyecto, pero da herramientas reales para encapsulación y arquitectura en sistemas grandes. El siguiente módulo baja al runtime: memoria, GC, JIT y herramientas de diagnóstico de la JVM.
