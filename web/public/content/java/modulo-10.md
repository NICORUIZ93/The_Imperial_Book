# Módulo 10: Módulos (JPMS) y proyectos grandes


## Aprende construyendo

### Tema 1: module-info.java y encapsulación fuerte

#### Paso 1 · Objetivo y preparación
Al finalizar podrás declarar un módulo JPMS con `exports` y confirmar que un paquete `public` pero no exportado permanece inaccesible desde fuera del módulo. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Un paquete interno con detalles de implementación (`academia.core.interno`) tiene clases `public` solo porque otras clases del mismo módulo las necesitan; sin JPMS, cualquier otro módulo de la aplicación también puede importarlas directamente, aunque nunca fue la intención exponerlas como API.

#### Paso 3 · Teoría, modelo mental y analogía
`module-info.java` declara explícitamente qué paquetes de un módulo son visibles para otros (`exports`); cualquier paquete que no aparezca ahí permanece inaccesible desde fuera, sin importar que sus clases sean `public`. La analogía: un edificio con puertas registradas — marcar una clase `public` sin `exports` es como una puerta sin cerradura dentro de un departamento que de todas formas no tiene entrada visible desde el resto del edificio.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-jpms-exports
cd ejemplo-jpms-exports
mkdir -p core/src/main/java/academia/core/dominio
mkdir -p core/src/main/java/academia/core/interno
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `core/src/main/java/module-info.java` con `module academia.core { exports academia.core.dominio; }`; agrega una clase pública en `academia.core.dominio` y otra en `academia.core.interno` (no exportado). Compila con `javac --module-source-path core/src/main/java -d out $(find core -name '*.java')`.

#### Paso 5 · Práctica guiada
Pista: desde un segundo módulo que declare `requires academia.core`, intenta importar la clase de `academia.core.interno` para provocar un fallo deliberado de compilación (`package ... is not visible`); lee el mensaje del compilador. Resultado esperado: solo el paquete exportado en `dominio` es accesible.

#### Paso 6 · Práctica independiente
Agrega un tercer paquete a `core`, decide si debe exportarse o no, y documenta la decisión en un comentario junto al `module-info.java`.

#### Paso 7 · Cierre y evidencia
Guarda el árbol de ambos módulos, el `module-info.java` y el fallo de compilación provocado por el paquete no exportado; como siguiente paso evalúa si tu proyecto realmente necesita migrar a JPMS. Errores comunes: exportar todos los paquetes de un módulo sin necesidad, mezclar classpath y modulepath en el mismo build, y asumir que marcar una clase `public` basta sin declarar también `exports` sobre su paquete. Fuentes oficiales: https://dev.java/learn/modules/.
**¿Por qué es importante?** Porque JPMS agrega encapsulación fuerte a nivel de módulo: un paquete completo con clases `public` puede permanecer inaccesible desde fuera simplemente por no estar en `exports`, algo que los modificadores de acceso tradicionales no podían lograr por sí solos.
**Evidencia de aprendizaje:** entrega el `module-info.java` con su `exports`, y el fallo de compilación al intentar acceder al paquete no exportado desde otro módulo.
**Conceptos clave:** `exports`, `requires`, encapsulación más allá de `public`.

`module-info.java` es el archivo descriptor que declara explícitamente la identidad de un módulo JPMS y sus relaciones con otros módulos: `module com.miapp.core { exports com.miapp.core.dominio; }` declara que el módulo `com.miapp.core` existe, y que únicamente el paquete `com.miapp.core.dominio` está disponible para ser usado por otros módulos (`exports`), mientras cualquier otro paquete de ese mismo módulo que no aparezca explícitamente en una declaración `exports` permanece completamente inaccesible desde fuera del módulo, sin importar que sus clases individuales estén marcadas como `public`.

Esta es la encapsulación fuerte que JPMS agrega, algo que los modificadores de acceso tradicionales de Java (Módulo 1) no ofrecían por sí solos antes de la existencia de módulos: antes de JPMS, marcar una clase como `public` la hacía accesible desde absolutamente cualquier otro código presente en el classpath completo de la aplicación, sin ninguna forma de restringir ese acceso a nivel más amplio que la propia clase o paquete individual; con JPMS, un paquete completo que contenga clases `public` puede permanecer completamente inaccesible desde fuera de su propio módulo simplemente por no estar listado en `exports`, una capa adicional de encapsulación a nivel de módulo que complementa (sin reemplazar) los modificadores de acceso tradicionales a nivel de clase.

**Analogía:** antes de JPMS, marcar algo como `public` era como dejar una puerta sin ninguna cerradura en absoluto, accesible desde cualquier parte del edificio completo; con JPMS, `exports` es como decidir explícitamente cuáles puertas específicas de un departamento completo del edificio (el módulo) tienen realmente una entrada visible hacia el resto del edificio, mientras el resto de las puertas de ese mismo departamento, aunque técnicamente sin cerradura interna, simplemente no tienen ningún acceso visible desde fuera del propio departamento.

**¿Por qué es importante?** JPMS agrega encapsulación fuerte a nivel de módulo, más allá de lo que los modificadores de acceso tradicionales `public`/`private` ofrecían por sí solos, permitiendo ocultar paquetes completos (incluso con clases `public`) del resto de la aplicación.

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

### Tema 2: Migración incremental y cuándo JPMS aporta valor

#### Paso 1 · Objetivo y preparación
Al finalizar podrás modularizar incrementalmente un proyecto de varios módulos, empezando por el módulo "hoja" sin dependencias internas, y decidir si JPMS aporta valor real a un proyecto concreto. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Convertir de una sola vez un proyecto legacy grande (sin módulos) a JPMS arriesga romper decenas de dependencias implícitas simultáneamente; migrar primero el módulo sin dependencias internas, y subir progresivamente, permite verificar en cada paso que la migración parcial sigue funcionando.

#### Paso 3 · Teoría, modelo mental y analogía
Migrar incrementalmente significa identificar primero los módulos "hoja" del árbol de dependencias (sin dependencias internas propias) y agregarles su `module-info.java`, subiendo progresivamente en el árbol. La analogía: renovar la instalación eléctrica de un edificio habitación por habitación, empezando por las que no dependen de ninguna otra, en vez de cortar la electricidad de todo el edificio a la vez.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-migracion-jpms
cd ejemplo-migracion-jpms
mkdir -p domain/src/main/java/academia/domain
mkdir -p application/src/main/java/academia/application
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Identifica primero el módulo "hoja" (`domain`, sin dependencias internas) y crea su `module-info.java` con `module academia.domain { exports academia.domain; }`. Luego crea `application/src/main/java/module-info.java` con `module academia.application { requires academia.domain; }`. Compila ambos y confirma que `application` puede usar tipos de `academia.domain`.

#### Paso 5 · Práctica guiada
Pista: agrega deliberadamente a `application` un `module-info.java` que declare `requires` un módulo inexistente para provocar un fallo deliberado de resolución de módulos; lee el mensaje `module not found`. Resultado esperado: corregir el nombre del módulo restaura la compilación.

#### Paso 6 · Práctica independiente
Agrega un tercer módulo `adapters` que dependa de `application`, y documenta el orden de migración: qué módulo se convierte primero y por qué (según el diagrama de dependencias de este tema).

#### Paso 7 · Cierre y evidencia
Guarda los tres `module-info.java`, el orden de migración documentado y el fallo de resolución provocado; como siguiente paso decide qué paquetes necesitan `opens` para reflexión. Errores comunes: intentar migrar todo el proyecto a JPMS de una sola vez en vez de empezar por los módulos hoja, aplicar JPMS a un proyecto pequeño sin consumidores externos que lo justifiquen, y olvidar `requires transitive` cuando la API pública de un módulo expone tipos que en realidad vienen de otro. Fuentes oficiales: https://openjdk.org/jeps/261.
**¿Por qué es importante?** Porque migrar incrementalmente desde los módulos sin dependencias internas acota el riesgo de cada paso, permitiendo verificar que la migración parcial funciona antes de seguir subiendo en el árbol de dependencias.
**Evidencia de aprendizaje:** entrega los tres `module-info.java` de los módulos migrados en orden, y el fallo de resolución corregido al referenciar un módulo inexistente.
**Conceptos clave:** módulos "hoja" primero, `requires transitive`, costo/beneficio.

Migrar un proyecto legacy grande sin módulos hacia JPMS es un proceso incremental, no un cambio de una sola vez: comenzar por los módulos "hoja" del árbol de dependencias (aquellos sin dependencias internas propias hacia otras partes del mismo proyecto) agregándoles su `module-info.java` correspondiente, y subir progresivamente en el árbol de dependencias agregando módulos hasta cubrir eventualmente el proyecto completo, un enfoque que permite verificar en cada paso que la migración parcial hasta ese punto sigue funcionando correctamente, en vez de intentar convertir todo el proyecto de una sola vez con un riesgo mucho mayor de introducir errores difíciles de aislar.

`requires transitive` se usa cuando un módulo expone en su propia API pública tipos que en realidad provienen de otro módulo del que depende (por ejemplo, si un método público de `api` devuelve un tipo definido en `core`), garantizando que cualquier módulo que dependa de `api` también obtenga automáticamente acceso a `core` sin necesidad de declarar esa dependencia por separado explícitamente. En cuanto a cuándo JPMS aporta valor real: para bibliotecas grandes y de larga vida con muchos consumidores externos (como el propio JDK, que usa JPMS internamente desde Java 9), o para sistemas con muchos equipos distintos compartiendo una misma base de código grande, JPMS impone límites arquitectónicos verificados por el compilador que previenen dependencias no deseadas entre partes del sistema; para un proyecto pequeño o un microservicio independiente con pocos módulos internos, la ceremonia adicional de gestionar `module-info.java` en cada módulo suele ser complejidad sin un beneficio proporcional real.

**Analogía:** migrar a JPMS incrementalmente es como renovar la instalación eléctrica de un edificio habitación por habitación, comenzando por las habitaciones que no dependen de ninguna otra, en vez de cortar la electricidad de todo el edificio simultáneamente para una renovación completa de una sola vez; evaluar si JPMS aporta valor es como decidir si vale la pena instalar un sistema de seguridad departamental completo en una casa pequeña habitada por una única familia, frente a un edificio grande compartido por muchas familias distintas donde esos límites de seguridad claramente sí aportan valor real.

**¿Por qué es importante?** Migrar incrementalmente desde los módulos "hoja" acota el riesgo de cada paso de la migración; evaluar correctamente cuándo JPMS aporta valor real evita imponer su ceremonia adicional en proyectos donde esos límites arquitectónicos no son genuinamente necesarios.

**Diagrama:**

```mermaid
flowchart LR
    LEAF["1. domain"] --> APP["2. application"]
    APP --> ADAPTERS["3. adapters"]
    ADAPTERS --> API["4. runtime"]
```

Este orden de migración (hoja primero) es el mismo que aplicarías si decidieras modularizar el Proyecto integrador (Módulo 13): domain antes que application, antes que adapters.

**Cuándo no usarlo:** si el proyecto entero cabe en un solo equipo pequeño y no se planea publicarlo como biblioteca, la migración a JPMS no se justifica; documenta la decisión y sigue con classpath tradicional.

### Tema 3: `opens` para acceso reflexivo controlado de frameworks

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diagnosticar y corregir un `InaccessibleObjectException` que ocurre solo en tiempo de ejecución, cuando un framework necesita reflexión sobre un paquete que solo declaró `exports`. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Un módulo de dominio compila perfectamente y `exports` su paquete principal, pero al intentar serializar uno de sus `record` con Jackson en tiempo de ejecución, la aplicación falla — `exports` permite la llamada directa de código, pero no el acceso reflexivo que Jackson necesita internamente para inspeccionar la clase.

#### Paso 3 · Teoría, modelo mental y analogía
`exports` resuelve el acceso normal de compilación y llamada directa; `opens` concede, por separado, acceso reflexivo en tiempo de ejecución, el que frameworks como Jackson, Hibernate o Spring necesitan para inspeccionar y construir objetos sin que tu código los llame directamente. La analogía: `exports` es dar una llave para entrar y usar las habitaciones normalmente; `opens` es un permiso aparte para que un inspector concreto revise los cajones — son dos autorizaciones independientes.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-jpms-opens
cd ejemplo-jpms-opens
mkdir -p dominio/src/main/java/academia/dominio
```

**Ejecuta el ejemplo** (crea un proyecto desde cero con Maven o Gradle, pega el código y corre las pruebas; equivalencias en el Módulo 8, Tema 4):

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `dominio/src/main/java/module-info.java` con `module academia.dominio { exports academia.dominio; }` (sin `opens`) y una clase `record Entrega(String id)`. Agrega Jackson al classpath e intenta serializarla con `new ObjectMapper().writeValueAsString(new Entrega("E1"))` desde otro módulo.

#### Paso 5 · Práctica guiada
Pista: ejecuta la serialización sin `opens` para provocar un fallo deliberado (`InaccessibleObjectException` de Jackson intentando acceder por reflexión); lee el stack trace, que señala el paquete sin abrir. Resultado esperado: agregar `opens academia.dominio to com.fasterxml.jackson.databind;` corrige el fallo.

#### Paso 6 · Práctica independiente
Compara declarar `opens academia.dominio;` (abierto a cualquiera) frente a `opens academia.dominio to com.fasterxml.jackson.databind;` (acotado); documenta cuál preferirías en un módulo de dominio con datos sensibles.

#### Paso 7 · Cierre y evidencia
Guarda el `InaccessibleObjectException` provocado, el `module-info.java` corregido con `opens ... to ...` y la comparación entre abrir a todos o acotarlo; como siguiente paso construye el laboratorio completo del capítulo. Errores comunes: confundir `exports` (acceso de compilación) con `opens` (acceso reflexivo), declarar `opens` sin acotar con `to` cuando bastaría abrirlo solo al framework específico, y olvidar que un módulo que compila bien puede de todas formas fallar en runtime por reflexión sin `opens`. Fuentes oficiales: https://dev.java/learn/modules/.
**¿Por qué es importante?** Porque la mayoría de los frameworks del ecosistema Java (serialización JSON, ORMs, inyección de dependencias) dependen de reflexión profunda sobre tus propias clases; olvidar `opens` es la causa más común de que una aplicación que compila perfectamente falle recién en tiempo de ejecución al integrarla con JPMS.
**Evidencia de aprendizaje:** entrega el `InaccessibleObjectException` provocado al faltar `opens`, su corrección, y la comparación entre `opens` abierto a todos frente a acotado con `to`.
**Conceptos clave:** `exports` da acceso en tiempo de compilación, `opens` da acceso reflexivo en tiempo de ejecución; son declaraciones independientes.

`exports` resuelve el acceso normal de compilación y llamada directa entre módulos, pero no basta para frameworks como Spring, Jackson o Hibernate, que necesitan inspeccionar y construir objetos de tus propias clases mediante reflexión (leer campos privados, invocar constructores sin argumentos, anotar campos) sin que tu código llame a esos frameworks directamente. Si un paquete solo está `exports`, la reflexión profunda de esos frameworks sobre tus clases falla en tiempo de ejecución con `InaccessibleObjectException`, aunque el mismo paquete compile y funcione perfectamente con llamadas directas de código. `opens com.miapp.dominio;` concede ese acceso reflexivo adicional; `opens com.miapp.dominio to com.fasterxml.jackson.databind;` lo restringe a un módulo específico en vez de abrirlo a cualquiera, igual que `exports ... to ...` restringe el acceso de compilación a módulos concretos.

Es habitual necesitar ambas declaraciones sobre el mismo paquete a la vez: `exports` para que otros módulos llamen directamente a tus clases de dominio, y `opens` (normalmente acotado con `to`) para que el framework de serialización o el ORM pueda además inspeccionarlas por reflexión. Un módulo completo puede además declararse `open module com.miapp.dominio { ... }`, lo que abre todos sus paquetes a reflexión sin necesidad de una línea `opens` por paquete — una opción más simple pero que renuncia a la encapsulación fuerte del Tema 1 para todo el módulo, útil sobre todo durante una migración incremental (Tema 2) mientras terminas de identificar exactamente qué paquetes necesitan reflexión.

**Analogía:** `exports` es como dar a alguien una llave para entrar por la puerta principal y usar las habitaciones normalmente; `opens` es un permiso aparte para que un inspector concreto pueda además revisar los cajones y closets sin necesidad de pedirte permiso cada vez — son dos autorizaciones independientes, y dar la llave de la puerta no incluye automáticamente el permiso de inspección.

**¿Por qué es importante?** La mayoría de los frameworks Java del ecosistema real (inyección de dependencias, serialización JSON, ORMs) dependen de reflexión profunda sobre tus propias clases; olvidar `opens` es la causa más común de que una aplicación que compila perfectamente falle en tiempo de ejecución al integrarla con JPMS.

**Código del ejemplo:**

```java
module com.miapp.dominio {
    exports com.miapp.dominio;                                    // llamada directa desde otros módulos
    opens com.miapp.dominio to com.fasterxml.jackson.databind;     // reflexión, solo para Jackson
}
```

Si el Proyecto integrador (Módulo 13) usa Jackson o un ORM sobre módulos JPMS, cada paquete de dominio serializado necesita su `opens` explícito y acotado.

**Cuándo no usarlo:** si ningún framework necesita reflexión sobre tus clases (todo el acceso es llamada directa de código), no declares `opens`; mantener solo `exports` conserva la encapsulación fuerte.

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** dividir un proyecto en al menos dos módulos JPMS con dependencias explícitas.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear módulos `core` y `app` con sus `module-info.java` | Ver Tema 1 | Declara la identidad de cada módulo |
| 2 | Declarar `exports` en `core` para un paquete específico | Ver Tema 1 | Verifica que un paquete no exportado es inaccesible |
| 3 | Declarar `requires` en `app` hacia `core` | Ver Tema 1 | Dependencia explícita entre módulos |
| 4 | Documentar la migración incremental de un proyecto legacy | Ver Tema 2 | Módulos "hoja" primero |

**Verificación:** el laboratorio se considera exitoso si un paquete de `core` no exportado explícitamente resulta inaccesible desde `app`, incluso si sus clases son `public`, y si `app` compila correctamente su dependencia declarada hacia `core`.

**Errores comunes y soluciones**

- **Exportar todos los paquetes de un módulo sin necesidad.** Exporta únicamente los paquetes que realmente forman parte de la API pública del módulo.
- **Aplicar JPMS a un proyecto pequeño sin necesidad real.** Evalúa primero si el beneficio de límites arquitectónicos verificados justifica la ceremonia adicional.
- **Intentar migrar todo el proyecto a JPMS de una sola vez.** Migra incrementalmente comenzando por los módulos "hoja".
- **`InaccessibleObjectException` en tiempo de ejecución con un framework (Jackson, Hibernate, Spring) aunque el proyecto compile bien.** Al paquete le falta una declaración `opens` (además de `exports`): la reflexión que usan estos frameworks internamente necesita ese permiso adicional, independiente del acceso normal de compilación.

---
