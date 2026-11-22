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

**Fundamento técnico y modelo mental**

**Definición formal.** JPMS (Java Platform Module System) es el sistema de módulos introducido en Java 9 que añade una unidad de descripción a nivel superior al paquete: el *módulo*. Un módulo es un conjunto nombrado de paquetes, recursos y un descriptor `module-info.java` que declara sus dependencias (`requires`), su API exportada (`exports`), sus paquetes abiertos a reflexión (`opens`) y sus usos/provisiones de servicios.

**Contrato / invariantes / reglas.** La accesibilidad en JPMS combina la visibilidad del lenguaje Java (`public/protected/private`) con la legibilidad del módulo: un tipo público solo es accesible desde otro módulo si su paquete está `exports` (o `opens` para reflexión profunda). `requires` establece legibilidad en tiempo de compilación y ejecución. `requires transitive` reexporta legibilidad. Los módulos no pueden tener *split packages* (el mismo paquete en múltiples módulos). La resolución de módulos ocurre al arrancar con module path; `--module-path` reemplaza el rol del classpath plano para módulos nombrados.

**Modelo mental.** El classpath es una plaza abierta; JPMS es un edificio con puertas declaradas: solo lo que expones en el descriptor puede cruzar la frontera.

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

**Fundamento técnico y modelo mental**

**Definición formal.** La *migración incremental* a JPMS es la adopción gradual de descriptores de módulo, manteniendo compatibilidad con el classpath o usando módulos automáticos durante la transición. Un *módulo automático* es un JAR no modular colocado en module path; un *módulo sin nombre* (unnamed module) es el contenido del classpath.

**Contrato / invariantes / reglas.** Los módulos automáticos exportan todos sus paquetes y leen todos los demás módulos, lo que debilita la encapsulación y los hace frágiles ante nombres derivados del JAR. El unnamed module puede leer módulos nombrados, pero los módulos nombrados no pueden declarar `requires` al unnamed module. `split packages` están prohibidos en module path. La viabilidad de la migración depende del grafo de dependencias, el soporte de librerías y los límites arquitectónicos reales.

**Modelo mental.** Migrar a JPMS es cambiar de barrio: puedes mudarte por etapas (módulos automáticos) pero mientras no declares dirección oficial, las garantías de frontera son débiles.

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

Un framework usa reflexión para serializar tus DTOs. Con JPMS, la reflexión profunda sobre paquetes no abiertos falla. Necesitas abrir solo lo necesario.

**Fundamento técnico y modelo mental**

**Definición formal.** La *reflexión profunda* (deep reflection) permite a código externo inspeccionar/acceder a miembros no públicos mediante la API de reflexión. En JPMS, `opens` declara que un paquete es accesible por reflexión en runtime; `exports` controla acceso normal en compilación/runtime.

**Contrato / invariantes / reglas.** `exports` no equivale a `opens`. `opens package to module` abre reflexión solo a un módulo específico (más seguro que `open module`). Abrir paquetes indiscriminadamente debilita encapsulación. Los frameworks modernos documentan qué paquetes deben abrirse. Para JPMS estricto, `--add-opens` es parche de runtime, no diseño deseable.

**Modelo mental.** `exports` es abrir la puerta de atención al público; `opens` es permitir que un técnico autorizado revise el interior de una sala específica.

**Implementación desde cero**

En una carpeta nueva (o sobre el proyecto JPMS):

```bash
mkdir -p ~/academia-java/modulo-10-opens/src/com/academia/infra/dto
mkdir -p ~/academia-java/modulo-10-opens/src/com/academia/infra/api
mkdir -p ~/academia-java/modulo-10-opens/libs
cd ~/academia-java/modulo-10-opens
```

Descarga Jackson (para `requires com.fasterxml.jackson.databind`):

```bash
curl -L -o libs/jackson-databind.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-databind/2.18.2/jackson-databind-2.18.2.jar
curl -L -o libs/jackson-core.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-core/2.18.2/jackson-core-2.18.2.jar
curl -L -o libs/jackson-annotations.jar https://repo1.maven.org/maven2/com/fasterxml/jackson/core/jackson-annotations/2.18.2/jackson-annotations-2.18.2.jar
```

`src/module-info.java`:

```java
module com.academia.infra {
    requires com.fasterxml.jackson.databind;
    opens com.academia.infra.dto to com.fasterxml.jackson.databind;
    exports com.academia.infra.api;
}
```

`src/com/academia/infra/dto/GuiaDto.java`:

```java
package com.academia.infra.dto;
public class GuiaDto {
    public String id;
    public GuiaDto() {}
    public GuiaDto(String id) { this.id = id; }
}
```

`src/com/academia/infra/api/ApiMarker.java`:

```java
package com.academia.infra.api;
public class ApiMarker {}
```

Compila:

```bash
javac --module-path libs -d out $(find src -name "*.java")
```

**Desglose del código**

- `opens ... to ...` habilita reflexión profunda solo para `com.fasterxml.jackson.databind`.
- `exports` expone el paquete API para acceso normal.
- Si quitas `opens`, Jackson puede fallar con `InaccessibleObjectException` en modos que requieren reflexión profunda.
- Restringir destino (`to ...`) reduce superficie de ataque.

**Ejecución y salida real**

```bash
ls out/com/academia/infra/dto
```

Salida esperada:

```text
GuiaDto.class
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `InaccessibleObjectException` | Paquete no abierto | Agrega `opens paquete to modulo` |
| Abriste todo el módulo | `open module` por conveniencia | Restringe a paquetes/módulos necesarios |
| Confusión exports vs opens | Conceptos mezclados | Exports=acceso normal; opens=reflexión profunda |

**Verificación rápida**

Compila el módulo con y sin la línea `opens`; el descriptor sin `opens` puede compilar, pero el fallo aparecerá en runtime al usar reflexión profunda.

## Cierre del módulo

JPMS no es obligatorio para todo proyecto, pero da herramientas reales para encapsulación y arquitectura en sistemas grandes. El siguiente módulo baja al runtime: memoria, GC, JIT y herramientas de diagnóstico de la JVM.
