# Módulo 10: Módulos (JPMS) y proyectos grandes


## Aprende construyendo

### Tema 1: module-info.java y encapsulación fuerte · Intermedio · 50 min

**Prerrequisito:** Módulo 1 (modificadores de acceso) y Módulo 8 (build); JDK 27 y un editor. Comprueba `java --version` y `javac --version`.

**Al terminar podrás:** declarar un módulo con `module-info.java`, usar `exports`/`requires`, confirmar que un paquete `public` no exportado queda inaccesible, y distinguir module path de classpath.

#### Aprende

Un paquete interno con detalles de implementación (`academia.core.interno`) tiene clases `public` solo porque otras clases del mismo módulo las necesitan; sin JPMS, cualquier otro módulo de la aplicación también puede importarlas directamente, aunque nunca fue la intención exponerlas como API.

**¿Por qué es importante?** JPMS agrega encapsulación fuerte a nivel de módulo, más allá de lo que los modificadores de acceso tradicionales `public`/`private` ofrecían por sí solos, permitiendo ocultar paquetes completos (incluso con clases `public`) del resto de la aplicación.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `module-info.java` | Núcleo | declara el módulo y sus relaciones |
| `exports` y encapsulación fuerte | Núcleo | un paquete `public` no exportado queda invisible |
| `requires` | Núcleo | un módulo declara de qué depende |
| `requires transitive` | Variante | reexportar una dependencia a quien te usa |
| module path frente a classpath | Diagnóstico | `--module-path` aplica las reglas de módulo |
| named/automatic/unnamed modules | Límite | un JAR sin `module-info` es módulo automático |

Cada fila tiene su explicación individual a continuación.

**`module-info.java` (núcleo).** Es el descriptor del módulo: declara su **nombre** (`module academia.core`) y sus relaciones (`exports`, `requires`). Vive en la raíz del código fuente del módulo. Sin él, el código es parte del *unnamed module* (sin reglas de módulo).

**`exports` y encapsulación fuerte (núcleo).** `exports paquete` hace que ese paquete sea visible para otros módulos. Un paquete **no** listado permanece **inaccesible desde fuera** aunque sus clases sean `public`: es la encapsulación fuerte que `public` por sí solo no daba. Intentar importarlo da `package ... is not visible` en compilación.

**`requires` (núcleo).** `requires academia.core` declara que este módulo **depende** de otro para ver sus paquetes exportados. Es explícito y verificado: si usas un módulo sin requerirlo, no compila. Hace el grafo de dependencias visible en el descriptor, no escondido en el classpath.

**`requires transitive` (variante).** `requires transitive X` reexporta `X` a quien requiera **tu** módulo: si tu API expone tipos de `X`, el consumidor los ve sin tener que declarar `requires X` por su cuenta. Úsalo solo cuando `X` forme parte de tu superficie pública; de lo contrario, `requires` normal.

**Module path frente a classpath (diagnóstico).** Con `--module-path` (y `--module` para ejecutar) la JVM aplica las reglas de módulo (encapsulación, dependencias). Con `-cp` (classpath) esas reglas **no** aplican y todo es visible como antes de JPMS. No mezcles ambos en el mismo build cuando quieras verificar límites de módulo.

**Named/automatic/unnamed modules (límite).** Un módulo con `module-info` es **named**; un JAR normal **sin** `module-info` puesto en el module path se vuelve **automatic module** (exporta todo, su nombre deriva del JAR); el código en el classpath es el **unnamed module**. Esta gradación permite la migración incremental (Tema 2): no todo tiene que ser modular a la vez.

`module-info.java` es el archivo descriptor que declara explícitamente la identidad de un módulo JPMS y sus relaciones con otros módulos: `module com.miapp.core { exports com.miapp.core.dominio; }` declara que el módulo `com.miapp.core` existe, y que únicamente el paquete `com.miapp.core.dominio` está disponible para ser usado por otros módulos (`exports`), mientras cualquier otro paquete de ese mismo módulo que no aparezca explícitamente en una declaración `exports` permanece completamente inaccesible desde fuera del módulo, sin importar que sus clases individuales estén marcadas como `public`.

Esta es la encapsulación fuerte que JPMS agrega, algo que los modificadores de acceso tradicionales de Java (Módulo 1) no ofrecían por sí solos antes de la existencia de módulos: antes de JPMS, marcar una clase como `public` la hacía accesible desde absolutamente cualquier otro código presente en el classpath completo de la aplicación, sin ninguna forma de restringir ese acceso a nivel más amplio que la propia clase o paquete individual; con JPMS, un paquete completo que contenga clases `public` puede permanecer completamente inaccesible desde fuera de su propio módulo simplemente por no estar listado en `exports`, una capa adicional de encapsulación a nivel de módulo que complementa (sin reemplazar) los modificadores de acceso tradicionales a nivel de clase.

**Analogía:** antes de JPMS, marcar algo como `public` era como dejar una puerta sin ninguna cerradura en absoluto, accesible desde cualquier parte del edificio completo; con JPMS, `exports` es como decidir explícitamente cuáles puertas específicas de un departamento completo del edificio (el módulo) tienen realmente una entrada visible hacia el resto del edificio, mientras el resto de las puertas de ese mismo departamento, aunque técnicamente sin cerradura interna, simplemente no tienen ningún acceso visible desde fuera del propio departamento.

**Conceptos clave:** `exports`, `requires`, encapsulación más allá de `public`.

**Implicación práctica:** JPMS agrega encapsulación fuerte a nivel de módulo: un paquete completo con clases `public` puede permanecer inaccesible desde fuera simplemente por no estar en `exports`, algo que los modificadores de acceso tradicionales no podían lograr por sí solos.

**Código del ejemplo:**

```java
// core/src/main/java/module-info.java
module com.miapp.core {
    exports com.miapp.core.dominio; // solo este paquete es visible para otros módulos
}
// app/src/main/java/module-info.java
module com.miapp.app {
    requires com.miapp.core;
}
```

Los límites `exports`/`requires` de este tema son los mismos que el Proyecto integrador (Módulo 13) espera entre su capa de dominio y su capa de exposición HTTP.

**Cuándo no usarlo:** en un proyecto de un solo módulo sin consumidores externos, JPMS es ceremonia sin beneficio; los paquetes package-private ya bastan para ocultar detalles internos.

#### Practica

**Desde cero:** crea dos módulos con sus paquetes público e interno; este ejemplo usa `javac` directamente para que el límite de módulos sea visible:

```bash
mkdir ejemplo-jpms-exports
cd ejemplo-jpms-exports
mkdir -p core/src/main/java/academia/core/dominio
mkdir -p core/src/main/java/academia/core/interno
mkdir -p app/src/main/java/academia/app
```

**Crea** `core/src/main/java/module-info.java`:

```java
module academia.core {
    exports academia.core.dominio;
}
```

**Crea** `core/src/main/java/academia/core/dominio/Guia.java`:

```java
package academia.core.dominio;

public record Guia(String numero) {
}
```

**Crea** `core/src/main/java/academia/core/interno/ValidadorInterno.java`. Aunque la clase es `public`, su paquete no aparece en `exports`:

```java
package academia.core.interno;

public final class ValidadorInterno {
    private ValidadorInterno() {
    }

    public static boolean valido(String numero) {
        return !numero.isBlank();
    }
}
```

**Crea** `app/src/main/java/module-info.java` y `app/src/main/java/academia/app/Main.java`:

```java
module academia.app {
    requires academia.core;
}
```

```java
package academia.app;

import academia.core.dominio.Guia;

public final class Main {
    public static void main(String[] args) {
        System.out.println(new Guia("E-001"));
    }
}
```

**Ejecuta el ejemplo:** compila primero el módulo proveedor y después el consumidor usando su salida como module path:

```bash
javac -d out/core $(find core/src/main/java -name '*.java')
javac --module-path out/core -d out/app $(find app/src/main/java -name '*.java')
java --module-path out/core:out/app --module academia.app/academia.app.Main
```

**Resultado esperado:** la consola muestra `Guia[numero=E-001]`; `app` puede usar `Guia` porque su paquete está exportado.

**Fallo deliberado:** añade a `Main` `import academia.core.interno.ValidadorInterno;` y `System.out.println(ValidadorInterno.valido("E-001"));`, y repite el segundo `javac`.

**Pista:** el compilador informa `error: package academia.core.interno is not visible` y explica que `academia.core` no exporta ese paquete. **Resultado esperado:** quitar el import y la llamada interna restaura la compilación; no debes exportar el paquete solo para hacer desaparecer el error.

**Si falla.** Si `javac` no encuentra `academia.core`, revisa que `out/core` exista y que el segundo comando use `--module-path out/core`. Si el error de visibilidad no aparece, comprueba que `academia.core.interno` no esté en `exports`. No mezcles `-cp` con estos comandos: el ejercicio verifica dependencias del module path.

#### Aplica

Agrega un tercer paquete a `core`, decide si debe exportarse o no, y documenta la decisión en un comentario junto al `module-info.java`. Añade una llamada desde `app` solo si forma parte de la API pública.

**Checklist de salida.**

- [ ] `core` exporta únicamente `academia.core.dominio`.
- [ ] `app` declara `requires academia.core` y usa `Guia`.
- [ ] La ejecución verde muestra `Guia[numero=E-001]`.
- [ ] La clase pública de `academia.core.interno` no es accesible desde `app`.
- [ ] El fallo deliberado informa `package academia.core.interno is not visible`.
- [ ] El tercer paquete tiene documentada su decisión de exportación.

**Si falla.** Si sientes la necesidad de exportar todos los paquetes, vuelve a separar API pública de implementación: una clase puede ser `public` para uso interno del módulo sin convertirse en API externa. Si la aplicación depende de un paquete interno, mueve esa responsabilidad a la API exportada en vez de debilitar el límite.

Guarda el árbol de ambos módulos, el `module-info.java` y el fallo de compilación provocado por el paquete no exportado; como siguiente paso evalúa si tu proyecto realmente necesita migrar a JPMS.

**Errores comunes:** exportar todos los paquetes de un módulo sin necesidad, mezclar classpath y modulepath en el mismo build, y asumir que marcar una clase `public` basta sin declarar también `exports` sobre su paquete.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java — Modules](https://dev.java/learn/modules/) y [`module-info` — JLS 7.7 (Java SE 27)](https://docs.oracle.com/javase/specs/jls/se27/html/jls-7.html#jls-7.7).

---

### Tema 2: Migración incremental y cuándo JPMS aporta valor · Avanzado · 55 min

**Prerrequisito:** Tema 1 de este módulo; JDK 27 y un editor. Comprueba `javac --version`.

**Al terminar podrás:** modularizar bottom-up (hoja primero), usar automatic modules y `requires transitive` como puente, diagnosticar `module not found`, y decidir si JPMS aporta valor real a un proyecto concreto.

#### Aprende

Convertir de una sola vez un proyecto legacy grande (sin módulos) a JPMS arriesga romper decenas de dependencias implícitas simultáneamente; migrar primero el módulo sin dependencias internas, y subir progresivamente, permite verificar en cada paso que la migración parcial sigue funcionando.

**¿Por qué es importante?** Migrar incrementalmente desde los módulos «hoja» acota el riesgo de cada paso de la migración; evaluar correctamente cuándo JPMS aporta valor real evita imponer su ceremonia adicional en proyectos donde esos límites arquitectónicos no son genuinamente necesarios.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| migración bottom-up (hoja primero) | Núcleo | `domain` antes que `application` |
| automatic modules como puente | Variante | un JAR legacy en el module path sin `module-info` |
| `requires transitive` en migración | Variante | reexportar un módulo que tu API expone |
| `module not found` | Diagnóstico | una dependencia mal declarada rompe la compilación |
| costo/beneficio de JPMS | Decisión | biblioteca grande sí, microservicio pequeño no |

Cada fila tiene su explicación individual a continuación.

**Migración bottom-up (núcleo).** Modularizar un proyecto grande no es un cambio de golpe: empieza por los módulos **hoja** (sin dependencias internas), añade su `module-info` y sube por el árbol. Así verificas en cada paso que la migración parcial sigue funcionando, en vez de romper decenas de dependencias a la vez.

**Automatic modules como puente (variante).** Durante la migración, un JAR legacy **sin** `module-info` puesto en el module path se convierte en *automatic module* (exporta todo, nombre derivado del JAR). Esto permite que un módulo ya modularizado dependa (`requires`) de una librería aún no modular, sin esperar a que el mundo entero tenga módulos.

**`requires transitive` en migración (variante).** Si tu módulo `api` expone en su API pública tipos definidos en `core`, declara `requires transitive core`: así quien requiera `api` ve `core` automáticamente. No lo uses si `core` es solo un detalle interno; reexportar de más filtra dependencias que querías ocultar.

**`module not found` (diagnóstico).** Una dependencia mal escrita o ausente del module path da `module not found: X` en compilación. Es un error **temprano y explícito** (a diferencia del classpath, donde el fallo aparecería en runtime). Revisa que el módulo exista en `--module-path` y que su nombre coincida.

**Costo/beneficio de JPMS (decisión).** JPMS aporta valor en **bibliotecas grandes de larga vida** con muchos consumidores (el propio JDK lo usa) o sistemas con muchos equipos sobre una base común: límites verificados por el compilador. Para un **microservicio pequeño** o un proyecto de un equipo, la ceremonia de `module-info` por módulo suele ser complejidad sin beneficio proporcional; documenta la decisión de no usarlo.

Migrar un proyecto legacy grande sin módulos hacia JPMS es un proceso incremental, no un cambio de una sola vez: comenzar por los módulos «hoja» del árbol de dependencias (aquellos sin dependencias internas propias hacia otras partes del mismo proyecto) agregándoles su `module-info.java` correspondiente, y subir progresivamente en el árbol de dependencias agregando módulos hasta cubrir eventualmente el proyecto completo, un enfoque que permite verificar en cada paso que la migración parcial hasta ese punto sigue funcionando correctamente, en vez de intentar convertir todo el proyecto de una sola vez con un riesgo mucho mayor de introducir errores difíciles de aislar.

`requires transitive` se usa cuando un módulo expone en su propia API pública tipos que en realidad provienen de otro módulo del que depende (por ejemplo, si un método público de `api` devuelve un tipo definido en `core`), garantizando que cualquier módulo que dependa de `api` también obtenga automáticamente acceso a `core` sin necesidad de declarar esa dependencia por separado explícitamente. En cuanto a cuándo JPMS aporta valor real: para bibliotecas grandes y de larga vida con muchos consumidores externos (como el propio JDK, que usa JPMS internamente desde Java 9), o para sistemas con muchos equipos distintos compartiendo una misma base de código grande, JPMS impone límites arquitectónicos verificados por el compilador que previenen dependencias no deseadas entre partes del sistema; para un proyecto pequeño o un microservicio independiente con pocos módulos internos, la ceremonia adicional de gestionar `module-info.java` en cada módulo suele ser complejidad sin un beneficio proporcional real.

**Analogía:** migrar a JPMS incrementalmente es como renovar la instalación eléctrica de un edificio habitación por habitación, comenzando por las habitaciones que no dependen de ninguna otra, en vez de cortar la electricidad de todo el edificio simultáneamente para una renovación completa de una sola vez; evaluar si JPMS aporta valor es como decidir si vale la pena instalar un sistema de seguridad departamental completo en una casa pequeña habitada por una única familia, frente a un edificio grande compartido por muchas familias distintas donde esos límites de seguridad claramente sí aportan valor real.

**Conceptos clave:** módulos «hoja» primero, `requires transitive`, costo/beneficio.

**Implicación práctica:** Migrar incrementalmente desde los módulos sin dependencias internas acota el riesgo de cada paso, permitiendo verificar que la migración parcial funciona antes de seguir subiendo en el árbol de dependencias.

**Diagrama:**

```mermaid
flowchart LR
    LEAF["1. domain"] --> APP["2. application"]
    APP --> ADAPTERS["3. adapters"]
    ADAPTERS --> API["4. runtime"]
```

Este orden de migración (hoja primero) es el mismo que aplicarías si decidieras modularizar el Proyecto integrador (Módulo 13): domain antes que application, antes que adapters.

**Cuándo no usarlo:** si el proyecto entero cabe en un solo equipo pequeño y no se planea publicarlo como biblioteca, la migración a JPMS no se justifica; documenta la decisión y sigue con classpath tradicional.

#### Practica

**Desde cero:** crea primero el módulo hoja y después su consumidor:

```bash
mkdir ejemplo-migracion-jpms
cd ejemplo-migracion-jpms
mkdir -p domain/src/main/java/academia/domain
mkdir -p application/src/main/java/academia/application
```

**Crea** `domain/src/main/java/module-info.java` y `domain/src/main/java/academia/domain/Entrega.java`:

```java
module academia.domain {
    exports academia.domain;
}
```

```java
package academia.domain;

public record Entrega(String numero) {
}
```

**Crea** `application/src/main/java/module-info.java` y `application/src/main/java/academia/application/Main.java`:

```java
module academia.application {
    requires academia.domain;
}
```

```java
package academia.application;

import academia.domain.Entrega;

public final class Main {
    public static void main(String[] args) {
        System.out.println(new Entrega("E-002"));
    }
}
```

**Ejecuta el ejemplo:** compila `domain` antes que `application`, respetando el orden del diagrama:

```bash
javac -d out/domain $(find domain/src/main/java -name '*.java')
javac --module-path out/domain -d out/application $(find application/src/main/java -name '*.java')
java --module-path out/domain:out/application --module academia.application/academia.application.Main
```

**Resultado esperado:** la consola muestra `Entrega[numero=E-002]`; la migración parcial funciona antes de añadir más módulos.

**Fallo deliberado:** cambia `requires academia.domain;` por `requires academia.inexistente;` y repite el segundo `javac`.

**Pista:** el compilador informa `error: module not found: academia.inexistente`, porque la dependencia declarada no existe en el module path. **Resultado esperado:** restaurar `requires academia.domain;` corrige la compilación y la ejecución.

**Si falla.** Si el error es `module not found: academia.domain`, comprueba que el primer `javac` haya generado `out/domain/module-info.class`. Si `Entrega` no es visible, revisa `exports academia.domain`. No añadas `requires transitive` en este ejemplo: `application` no expone tipos de `domain` en una API para un tercer módulo.

#### Aplica

Agrega un tercer módulo `adapters` que dependa de `application`, compílalo después de los dos anteriores y documenta el orden de migración: qué módulo se convierte primero y por qué. Si `application` devuelve `Entrega` en su API pública, cambia su dependencia a `requires transitive academia.domain;` y explica qué consumidor se beneficia.

**Checklist de salida.**

- [ ] `domain` se compila primero porque no depende de módulos internos.
- [ ] `application` declara y resuelve `requires academia.domain`.
- [ ] La ejecución verde muestra `Entrega[numero=E-002]`.
- [ ] El módulo inexistente produce `module not found`.
- [ ] `adapters` se incorpora después de verificar los módulos anteriores.
- [ ] La decisión sobre `requires transitive` se basa en tipos expuestos por la API.

**Si falla.** Si la migración rompe varios módulos a la vez, retrocede al último estado verde y convierte solo el siguiente módulo hoja. Si un consumidor necesita declarar una dependencia que solo aparece en la firma pública de otro módulo, revisa si corresponde `requires transitive`, no una duplicación automática de todos los `requires`.

Guarda los tres `module-info.java`, el orden de migración documentado y el fallo de resolución provocado; como siguiente paso decide qué paquetes necesitan `opens` para reflexión.

**Errores comunes:** intentar migrar todo el proyecto a JPMS de una sola vez en vez de empezar por los módulos hoja, aplicar JPMS a un proyecto pequeño sin consumidores externos que lo justifiquen, y olvidar `requires transitive` cuando la API pública de un módulo expone tipos que en realidad vienen de otro.

**Fuentes oficiales revisadas el 2026-11-01:** [JEP 261 — Module System](https://openjdk.org/jeps/261) y [dev.java — Modules](https://dev.java/learn/modules/).

---

### Tema 3: `opens` para acceso reflexivo controlado de frameworks · Avanzado · 60 min

**Prerrequisito:** Temas 1–2 de este módulo y reflexión (Módulo 19); JDK 27, Maven 3.9+ y un editor. Comprueba `java --version`, `javac --version` y `mvn --version`.

**Al terminar podrás:** distinguir `exports` de `opens`, diagnosticar y corregir un `InaccessibleObjectException` de runtime, acotar `opens ... to` a un framework, y decidir cuándo no abrir un paquete.

#### Aprende

Un módulo de dominio compila perfectamente y `exports` su paquete principal, pero al intentar serializar un objeto con un campo privado anotado con Jackson en tiempo de ejecución, la aplicación falla: `exports` permite la llamada directa de código, pero no el acceso reflexivo profundo que Jackson necesita para hacer accesible ese campo.

**¿Por qué es importante?** Los frameworks de inyección de dependencias, serialización JSON y ORMs pueden depender de reflexión profunda sobre tus clases; cuando usan ese mecanismo, omitir `opens` permite que la aplicación compile y falle recién en tiempo de ejecución.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `exports` frente a `opens` | Núcleo | compilación/llamada directa vs reflexión profunda |
| `InaccessibleObjectException` | Diagnóstico | solo `exports` falla en runtime con un framework |
| `opens ... to` acotado | Núcleo | abrir solo al módulo que lo necesita |
| `exports ... to` cualificado | Variante | restringir el acceso de compilación a módulos concretos |
| `open module` | Variante | abrir todo el módulo a reflexión (menos control) |
| cuándo NO abrir | Decisión | sin reflexión, `exports` basta |

Cada fila tiene su explicación individual a continuación.

**`exports` frente a `opens` (núcleo).** Son **dos autorizaciones distintas**: `exports` permite que otros módulos **llamen** directamente a tus clases públicas (acceso de compilación); `opens` permite **reflexión profunda** (acceder a miembros no públicos con `setAccessible`). Dar `exports` no incluye `opens`.

**`InaccessibleObjectException` (diagnóstico).** Si un framework (Jackson, Hibernate, un contenedor DI) usa reflexión profunda sobre un paquete que solo tiene `exports`, el código **compila** pero **falla en runtime** con `InaccessibleObjectException`. Es el síntoma clásico de "me falta un `opens`"; no se detecta en compilación.

**`opens ... to` acotado (núcleo).** `opens paquete to modulo.framework` concede reflexión **solo** a ese módulo, no a todo el mundo. Es la forma recomendada: abres lo mínimo al framework que de verdad lo necesita, conservando la encapsulación frente al resto.

**`exports ... to` cualificado (variante).** Simétricamente, `exports paquete to modulo.consumidor` restringe el acceso de **compilación** a módulos concretos, no a cualquiera. Útil para API internas compartidas entre unos pocos módulos tuyos sin exponerlas a todos.

**`open module` (variante).** `open module X { ... }` abre **todos** los paquetes a reflexión sin un `opens` por paquete. Es cómodo pero renuncia al control selectivo: úsalo solo cuando de verdad todo el módulo deba ser reflexivo (raro); normalmente prefiere `opens` acotados.

**Cuándo NO abrir (decisión).** Si ningún framework hace reflexión sobre tus clases (todo es llamada directa), **no** declares `opens`: mantener solo `exports` conserva la encapsulación fuerte. No añadas `opens` por rutina; un `record` serializado por sus accesores públicos, por ejemplo, no necesita reflexión profunda.

`exports` resuelve el acceso normal de compilación y llamada directa entre módulos, pero no basta cuando un framework necesita inspeccionar miembros no públicos de tus clases mediante reflexión profunda. Si un paquete solo está `exports`, ese acceso falla en tiempo de ejecución con `InaccessibleObjectException`, aunque el mismo paquete compile y funcione perfectamente con llamadas directas de código. `opens com.miapp.dominio;` concede acceso reflexivo; `opens com.miapp.dominio to com.fasterxml.jackson.databind;` lo restringe a un módulo específico, igual que `exports ... to ...` restringe el acceso de compilación a módulos concretos.

Es habitual necesitar ambas declaraciones sobre el mismo paquete a la vez: `exports` para que otros módulos llamen directamente a tus clases de dominio, y `opens` (normalmente acotado con `to`) para que el framework pueda inspeccionarlas por reflexión. Un módulo completo puede declararse `open module com.miapp.dominio { ... }`, lo que abre todos sus paquetes a reflexión sin una línea `opens` por paquete, pero renuncia al control selectivo para todo el módulo. La necesidad depende del mecanismo concreto: un `record` público serializado mediante sus accesores públicos no equivale al campo privado de este ejercicio y no debes añadir `opens` por rutina.

**Analogía:** `exports` es como dar a alguien una llave para entrar por la puerta principal y usar las habitaciones normalmente; `opens` es un permiso aparte para que un inspector concreto pueda además revisar los cajones y closets sin necesidad de pedirte permiso cada vez — son dos autorizaciones independientes, y dar la llave de la puerta no incluye automáticamente el permiso de inspección.

**Conceptos clave:** `exports` da acceso de compilación y llamada directa; `opens` concede acceso reflexivo y son declaraciones independientes.

**Implicación práctica:** cuando un framework necesita reflexión profunda sobre un paquete, un módulo que compila bien puede fallar en runtime si solo usa `exports`; abre únicamente ese paquete y limítalo al framework que lo necesita.

**Código del ejemplo:**

```java
module com.miapp.dominio {
    exports com.miapp.dominio;                                    // llamada directa desde otros módulos
    opens com.miapp.dominio to com.fasterxml.jackson.databind;     // reflexión, solo para Jackson
}
```

Si el Proyecto integrador (Módulo 13) usa Jackson o un ORM sobre módulos JPMS, revisa qué paquetes requieren reflexión profunda y dales un `opens` explícito y acotado solo cuando ese acceso sea necesario.

**Cuándo no usarlo:** si ningún framework necesita reflexión sobre tus clases (todo el acceso es llamada directa de código), no declares `opens`; mantener solo `exports` conserva la encapsulación fuerte.

#### Practica

**Desde cero:** crea el dominio, la aplicación y un POM que solo se usará para descargar Jackson y calcular su module path:

```bash
mkdir ejemplo-jpms-opens
cd ejemplo-jpms-opens
mkdir -p dominio/src/main/java/academia/dominio
mkdir -p app/src/main/java/academia/app
```

**Crea** `pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia</groupId>
  <artifactId>app</artifactId>
  <version>1.0-SNAPSHOT</version>
  <dependencies>
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.21.5</version>
    </dependency>
  </dependencies>
</project>
```

**Descarga las dependencias** y guarda sus rutas:

```bash
mvn -B -q dependency:build-classpath -Dmdep.outputFile=cp.txt
```

**Crea** `dominio/src/main/java/academia/dominio/Entrega.java`. El campo privado anotado obliga a Jackson a usar acceso reflexivo profundo:

```java
package academia.dominio;

import com.fasterxml.jackson.annotation.JsonProperty;

public final class Entrega {
    @JsonProperty
    private final String id;

    public Entrega(String id) {
        this.id = id;
    }
}
```

**Crea** `dominio/src/main/java/module-info.java` inicialmente sin `opens`:

```java
module academia.dominio {
    requires com.fasterxml.jackson.annotation;
    exports academia.dominio;
}
```

**Crea** `app/src/main/java/module-info.java` y `app/src/main/java/academia/app/Main.java`:

```java
module academia.app {
    requires academia.dominio;
    requires com.fasterxml.jackson.databind;
}
```

```java
package academia.app;

import academia.dominio.Entrega;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class Main {
    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        System.out.println(mapper.writeValueAsString(new Entrega("E1")));
    }
}
```

**Compila y ejecuta el ejemplo:**

```bash
javac --module-path "$(cat cp.txt)" -d out/dominio $(find dominio/src/main/java -name '*.java')
javac --module-path "out/dominio:$(cat cp.txt)" -d out/app $(find app/src/main/java -name '*.java')
java --module-path "out/dominio:out/app:$(cat cp.txt)" --module academia.app/academia.app.Main
```

**Fallo deliberado:** esta primera ejecución sin `opens` es el fallo que debes diagnosticar; la compilación anterior sí termina correctamente.

**Pista:** Jackson lanza `InvalidDefinitionException` causada por `InaccessibleObjectException`, con el mensaje `module academia.dominio does not "opens academia.dominio" to module com.fasterxml.jackson.databind`. Añade al descriptor del dominio `opens academia.dominio to com.fasterxml.jackson.databind;`, recompila ambos módulos y ejecuta de nuevo. **Resultado esperado:** la salida es `{"id":"E1"}`.

**Si falla.** Si `javac` no encuentra los módulos de Jackson, confirma que `cp.txt` existe y contiene rutas de jars. Si el fallo reflexivo continúa, comprueba que el `opens` esté en `dominio/src/main/java/module-info.java` y que hayas recompilado ese módulo. No sustituyas el module path por classpath para ocultar el problema.

#### Aplica

Compara declarar `opens academia.dominio;` (abierto a cualquiera) frente a `opens academia.dominio to com.fasterxml.jackson.databind;` (acotado). Ejecuta ambas variantes, documenta cuál preferirías en un módulo de dominio con datos sensibles y restaura la versión acotada.

**Checklist de salida.**

- [ ] El dominio y la aplicación compilan antes de cualquier `opens`.
- [ ] La primera ejecución falla por reflexión sobre el campo privado.
- [ ] La causa identifica `academia.dominio` y `com.fasterxml.jackson.databind`.
- [ ] El `opens ... to ...` se limita al paquete y al módulo necesarios.
- [ ] Tras recompilar, la salida es `{"id":"E1"}`.
- [ ] La comparación explica la diferencia entre abrir a todos y abrir a Jackson.

**Si falla.** Si la excepción desaparece solo al usar un `open module`, no te quedes con esa apertura global sin comparar: vuelve al descriptor normal y aplica el `opens` específico. Si cambias el objeto por un `record` público y ya no observas el fallo, conserva este ejemplo con campo privado para estudiar reflexión profunda; no generalices el resultado de una forma de serialización a todas las demás.

Guarda el `InaccessibleObjectException` provocado, el `module-info.java` corregido con `opens ... to ...` y la comparación entre abrir a todos o acotarlo; como siguiente paso construye el laboratorio completo del capítulo.

**Errores comunes:** confundir `exports` (acceso de compilación) con `opens` (acceso reflexivo), declarar `opens` sin acotar con `to` cuando bastaría abrirlo solo al framework específico, y olvidar que un módulo que compila bien puede de todas formas fallar en runtime por reflexión sin `opens`.

**Fuentes oficiales revisadas el 2026-11-01:** [dev.java — Modules](https://dev.java/learn/modules/) y [JEP 261 — Module System](https://openjdk.org/jeps/261).

---

## Construcción guiada del capítulo

**Objetivo del laboratorio:** dividir un proyecto en al menos dos módulos JPMS con dependencias explícitas.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear módulos `core` y `app` con sus `module-info.java` | Ver Tema 1 | Declara la identidad de cada módulo |
| 2 | Declarar `exports` en `core` para un paquete específico | Ver Tema 1 | Verifica que un paquete no exportado es inaccesible |
| 3 | Declarar `requires` en `app` hacia `core` | Ver Tema 1 | Dependencia explícita entre módulos |
| 4 | Documentar la migración incremental de un proyecto legacy | Ver Tema 2 | Módulos «hoja» primero |

**Verificación:** el laboratorio se considera exitoso si un paquete de `core` no exportado explícitamente resulta inaccesible desde `app`, incluso si sus clases son `public`, y si `app` compila correctamente su dependencia declarada hacia `core`.

**Errores comunes y soluciones**

- **Exportar todos los paquetes de un módulo sin necesidad.** Exporta únicamente los paquetes que realmente forman parte de la API pública del módulo.
- **Aplicar JPMS a un proyecto pequeño sin necesidad real.** Evalúa primero si el beneficio de límites arquitectónicos verificados justifica la ceremonia adicional.
- **Intentar migrar todo el proyecto a JPMS de una sola vez.** Migra incrementalmente comenzando por los módulos «hoja».
- **`InaccessibleObjectException` en tiempo de ejecución con un framework aunque el proyecto compile bien.** Comprueba si el framework necesita reflexión profunda; en ese caso añade un `opens` específico y acotado, independiente de `exports`.

---
