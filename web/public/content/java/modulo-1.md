# Módulo 1: Programación orientada a objetos


**Proyecto del módulo:** crea un proyecto Maven o Gradle desde cero, pega el código del tema y corre las pruebas; las equivalencias entre ambos sistemas están en el Módulo 8, Tema 4.

## Aprende construyendo

### Tema 1: Clases, objetos, constructores y encapsulación

#### Paso 1 · Objetivo y preparación
Al finalizar podrás diseñar una clase que valida sus invariantes en el constructor, de forma que ninguna instancia inválida pueda existir. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, una guía sin número o con peso fuera de rango no debería poder crearse nunca, en vez de crearse y luego validarse por separado en cada punto donde se use.

#### Paso 3 · Teoría, modelo mental y analogía
El constructor es la única puerta de entrada para crear un objeto: si valida ahí, ningún consumidor puede construir una instancia inválida y "completarla después". La analogía es el control de calidad en la línea de ensamblaje: se rechaza la pieza defectuosa antes de que salga de fábrica, no después de instalarla.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-guia-invariantes
cd ejemplo-guia-invariantes
mkdir -p src/main/java/academia/entregas
```
Crea `src/main/java/academia/entregas/Guia.java` con el constructor que valida `numero` y `pesoKg` (el código completo aparece más abajo, en "Código del ejemplo"). Compila y ejecuta:
```bash
javac -d out src/main/java/academia/entregas/Guia.java
java -cp out academia.entregas.Guia
```

#### Paso 5 · Práctica guiada
Pista: intenta construir `new Guia("", 10)` y luego `new Guia("RF-1", 0)` para provocar un fallo deliberado; ambos deben lanzar `IllegalArgumentException` desde el constructor, nunca crear el objeto a medias. Resultado esperado: ninguna instancia inválida llega a existir.

#### Paso 6 · Práctica independiente
Escribe `GuiaTest` con un caso válido y tres casos inválidos (número vacío, peso cero, peso mayor a 50); confirma que los tres lanzan excepción desde el constructor, no desde un método `validar()` separado.

#### Paso 7 · Cierre
Guarda la clase, la prueba, la salida y el fallo diagnosticado; como siguiente paso estudia herencia y sobreescritura. Errores comunes: validar en un método separado en vez del constructor, exponer setters que rompan el invariante después de construir, y confiar en que "nadie va a pasar un valor inválido". Fuentes oficiales: https://dev.java/learn/classes-objects/ y https://docs.oracle.com/javase/tutorial/java/IandI/.

Esta misma disciplina (validar en el constructor, no exponer setters que rompan el invariante) es la que aplicarás a cada entidad del proyecto integrador de este track.

**Cuándo no usarlo:** para un objeto puramente de transporte de datos sin ninguna regla de negocio que proteger (un DTO que solo cruza una frontera de serialización), validar cada campo en el constructor es esfuerzo sin beneficio real; resérvalo para entidades de dominio donde un estado inválido tendría consecuencias reales.
**¿Por qué es importante?** Porque un constructor que valida sus invariantes es la única garantía real de que ningún objeto inválido llegue a existir en el sistema, sin depender de que cada consumidor recuerde validar por su cuenta antes de usarlo.
### Tema 2: Herencia y sobreescritura

#### Paso 1 · Objetivo y preparación
Al finalizar podrás demostrar polimorfismo de subtipo con `extends`/`@Override`, y diagnosticar el error de olvidar `@Retention(RUNTIME)` en una anotación propia. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Un sistema de reparto trata conductores y vehículos de forma polimórfica (todos "hablan"/operan igual desde afuera), pero cada tipo concreto responde distinto; además, auditar acciones sensibles (confirmar una entrega) requiere una anotación propia correctamente configurada para que un interceptor pueda descubrirla.

#### Paso 3 · Teoría, modelo mental y analogía
El tipo real del objeto en tiempo de ejecución decide qué versión sobreescrita se ejecuta, no el tipo declarado de la variable. La analogía es una plantilla de formulario: la subclase personaliza ciertas secciones manteniendo el resto de la plantilla original.

El patrón de anotación propia + interceptor por reflexión es el mismo mecanismo que usa Spring (track de Spring Boot) para funcionalidad transversal como auditoría o seguridad, aplicado aquí en Java puro antes de depender de un framework que lo automatice.

**Cuándo no usarlo:** crear una anotación propia con reflexión agrega una capa de indirección; para una única llamada de auditoría en un único lugar, invocar directamente el código de registro es más simple y más fácil de rastrear que una anotación que un interceptor debe descubrir.
**¿Por qué es importante?** Porque el polimorfismo de subtipo permite que el mismo código funcione correctamente con cualquier subclase futura sin modificarse, y una anotación propia sin la retención correcta falla en silencio para quien la consume por reflexión, aunque el código compile sin ningún error.
**Conceptos clave:** `extends`, `@Override`, polimorfismo de subtipo.

`class Perro extends Animal` establece que `Perro` hereda todos los miembros no privados de `Animal`, pudiendo además sobreescribir (`@Override`) el comportamiento de métodos heredados para especializarlo: `Animal` define `hablar()` devolviendo `"..."`, y `Perro` sobreescribe ese mismo método para devolver `"Guau"`, de modo que invocar `hablar()` sobre una referencia de tipo `Animal` que en realidad apunta a un objeto `Perro` en tiempo de ejecución invoca la versión sobreescrita de `Perro`, no la de `Animal`, un comportamiento llamado polimorfismo de subtipo: el método que efectivamente se ejecuta se determina por el tipo real del objeto en tiempo de ejecución, no por el tipo declarado de la variable que lo referencia.

La anotación `@Override` no es estrictamente obligatoria para que la sobreescritura funcione, pero es una buena práctica fuertemente recomendada: le pide al compilador que verifique que el método efectivamente sobreescribe uno existente en la superclase con la misma firma exacta, detectando en tiempo de compilación errores comunes como escribir mal el nombre del método (creando accidentalmente un método nuevo no relacionado en vez de sobreescribir el esperado) o usar una firma ligeramente distinta a la de la superclase.

#### Enfoque técnico: qué significa `@` en Java

El carácter `@` introduce una **anotación**: metadatos asociados a una declaración o a un uso de tipo. Una anotación no es un comentario y tampoco ejecuta comportamiento por sí sola. Su efecto aparece únicamente cuando alguna herramienta la interpreta: el compilador (`@Override`), un procesador durante el build, una librería que usa reflexión en runtime o un framework como Spring. Por eso escribir una anotación cuyo consumidor no está configurado puede compilar y, aun así, no producir el efecto que la persona esperaba.

Java incluye anotaciones del lenguaje como `@Override`, `@Deprecated`, `@SuppressWarnings`, `@SafeVarargs` y `@FunctionalInterface`. También permite declarar anotaciones propias con `@interface`. `@Target` limita dónde se pueden colocar —clase, método, campo, parámetro o uso de tipo— y `@Retention` decide cuánto tiempo existen: solo en el código fuente (`SOURCE`), dentro del archivo `.class` (`CLASS`) o disponibles mediante reflexión durante la ejecución (`RUNTIME`). Esta decisión importa: un framework que inspecciona anotaciones al ejecutar no puede encontrar una anotación retenida únicamente en el código fuente.

```java
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    String accion();
}

final class EntregaService {
    @Auditable(accion = "confirmar-entrega")
    void confirmar(String entregaId) {
        // La anotación solo describe intención.
        // Un interceptor o componente de auditoría debe interpretarla.
    }
}
```

En este ejemplo, `@Auditable` tiene un elemento obligatorio llamado `accion`. Su retención `RUNTIME` permite que un interceptor la descubra mediante reflexión; `METHOD` impide usarla accidentalmente sobre una clase o un campo. La lógica de auditoría no debe esconder reglas del dominio dentro de la anotación: confirmar una entrega sigue siendo responsabilidad del caso de uso. La anotación sirve para conectar una preocupación transversal —registrar quién realizó una acción— sin mezclar esa infraestructura con la regla principal.

**Error que debes saber diagnosticar:** crear `@Auditable` sin `@Retention(RUNTIME)` y esperar que un interceptor la encuentre. El código compila, pero la consulta por reflexión devuelve que la anotación no existe. Comprueba primero su política de retención, después el `@Target` y finalmente que el procesador, interceptor o framework encargado de interpretarla esté realmente registrado.

**Analogía:** la herencia es como una plantilla base de un formulario que las subclases pueden personalizar, manteniendo la mayoría de los campos originales pero reescribiendo ciertas secciones específicas según sus necesidades particulares; `@Override` es como marcar explícitamente que una sección personalizada efectivamente reemplaza una sección existente de la plantilla original, y no una sección completamente nueva sin relación con la plantilla base.

**Implicación práctica:** El polimorfismo de subtipo permite que el mismo código que opera sobre una referencia `Animal` ejecute automáticamente el comportamiento específico de la subclase real en tiempo de ejecución, sin necesidad de conocer de antemano esa subclase concreta.

**Código del ejemplo:**

```java
class Animal {
    String hablar() { return "..."; }
}
class Perro extends Animal {
    @Override
    String hablar() { return "Guau"; }
}
```

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Sustituye dos estrategias de asignación mediante un contrato común. Prueba ambas con el mismo conjunto de entregas y verifica invariantes compartidas sin depender de detalles de una subclase.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-herencia-anotacion
cd ejemplo-herencia-anotacion
mkdir -p src/main/java/academia/animales
```

**Ejecuta el ejemplo:**

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `Animal`/`Perro` con `@Override` (código en "Código del ejemplo") y, en un segundo archivo, la anotación `@Auditable` con `@Retention(RUNTIME)` y `EntregaService` que la usa. Compila ambos y ejecuta una clase `Main` que invoque `hablar()` sobre una referencia `Animal` que apunta a un `Perro`.

#### Paso 5 · Práctica guiada
Pista: quita deliberadamente `@Retention(RUNTIME)` de `@Auditable` para provocar un fallo diagnosticable; una consulta por reflexión que buscaba la anotación deja de encontrarla, aunque el código compile igual. Resultado esperado: identificas que la causa es la política de retención, no el `@Target`.

#### Paso 6 · Práctica independiente
Agrega una tercera subclase de `Animal` (por ejemplo `Gato`) y confirma que invocar `hablar()` sobre las tres referencias `Animal` ejecuta la versión correcta de cada una; agrega una segunda anotación propia con `@Target(ElementType.FIELD)`.

#### Paso 7 · Cierre
Guarda las clases, la anotación, la salida del polimorfismo y el diagnóstico del fallo de retención; como siguiente paso estudia interfaces y clases abstractas. Errores comunes: herencia por reutilización sin relación "es un" real, olvidar `@Override`, y anotaciones sin la retención correcta para su consumidor. Fuentes oficiales: https://dev.java/learn/classes-objects/ y https://docs.oracle.com/javase/tutorial/java/IandI/.

### Tema 3: Interfaces, clases abstractas y cuándo usar cada una

#### Paso 1 · Objetivo y preparación
Al finalizar podrás elegir entre interfaz y clase abstracta según si existe comportamiento compartido real, e implementar ambas con una jerarquía `Forma`. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
El sistema necesita que tipos no relacionados (un `Pajaro` y un `Avion`, por ejemplo) cumplan un contrato común (`Volador`) sin compartir jerarquía; y necesita que figuras geométricas relacionadas (`Circulo`, `Cuadrado`) compartan una implementación común (`describir()`) además de un método propio (`area()`).

#### Paso 3 · Teoría, modelo mental y analogía
Una interfaz es un contrato puro sin implementación; una clase abstracta combina comportamiento compartido real con métodos que cada subclase debe completar. La analogía: la interfaz es un contrato de servicio que empresas no relacionadas pueden firmar; la clase abstracta es una franquicia que comparte infraestructura real entre sucursales.

**Conceptos clave:** contrato sin implementación, comportamiento compartido parcial, múltiple implementación de interfaces.

Una interfaz (`interface Volador { void volar(); }`) define un contrato puro: qué métodos debe tener cualquier clase que la implemente, sin proporcionar ninguna implementación propia por defecto (salvo métodos `default` explícitamente marcados como tales, un caso especial más avanzado), permitiendo que clases completamente no relacionadas entre sí en su jerarquía de herencia (una clase `Pajaro` y una clase `Avion`, por ejemplo, sin ninguna relación de herencia común) implementen el mismo contrato `Volador`, algo que Java permite hacer con múltiples interfaces simultáneamente (`class Pajaro implements Volador, Comestible`), a diferencia de la herencia de clases, donde Java solo permite extender una única superclase.

Una clase abstracta (`abstract class Forma { abstract double area(); void describir() {...} }`) es apropiada en cambio cuando existe comportamiento genuinamente compartido entre subclases relacionadas entre sí (el método `describir()`, con una implementación concreta compartida por todas las subclases de `Forma`), combinado con métodos abstractos que cada subclase concreta debe implementar por su cuenta (`area()`, sin implementación en la clase abstracta, dado que el cálculo específico depende de qué forma geométrica concreta sea cada subclase). La elección entre ambas se resume en si existe comportamiento compartido real que valga la pena centralizar (clase abstracta) frente a un contrato puro que clases potencialmente no relacionadas deben cumplir (interfaz).

**Analogía:** una interfaz es como un contrato de servicio que múltiples empresas completamente distintas y no relacionadas entre sí pueden firmar, comprometiéndose a ofrecer ciertos servicios específicos sin que el contrato les dicte cómo implementarlos internamente; una clase abstracta es como una franquicia que comparte cierta infraestructura y procedimientos comunes reales entre todas sus sucursales, dejando que cada sucursal específica implemente únicamente los detalles particulares de su operación local.

**¿Por qué es importante?** Elegir entre clase abstracta e interfaz según si existe comportamiento compartido real (clase abstracta) o solo un contrato puro (interfaz) produce un diseño de jerarquía de clases más claro y correctamente alineado con la relación real entre los tipos involucrados.

**Código del ejemplo:**

```java
interface Volador {
    void volar();
}
class Pajaro implements Volador {
    public void volar() { System.out.println("Vuela"); }
}

abstract class Forma {
    abstract double area();              // sin implementación: cada subclase la define
    void describir() { System.out.println("Área: " + area()); } // con implementación, compartida
}
```

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Define una interfaz de asignación y decide qué comportamiento merece una base abstracta. Una implementación falsa debe poder probar el consumidor sin heredar campos que no necesita.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-interfaz-abstracta
cd ejemplo-interfaz-abstracta
mkdir -p src/main/java/academia/formas
```

**Ejecuta el ejemplo:**

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `Volador`/`Pajaro` (interfaz) y `Forma`/`Circulo`/`Cuadrado` (clase abstracta con `area()` abstracto y `describir()` concreto). Compila y ejecuta una clase `Main` que invoque `describir()` sobre un `Circulo` y un `Cuadrado`.

#### Paso 5 · Práctica guiada
Pista: intenta instanciar `new Forma()` directamente para provocar un fallo deliberado de compilación; una clase abstracta no puede instanciarse. Resultado esperado: el compilador rechaza la instanciación directa y exige una subclase concreta.

#### Paso 6 · Práctica independiente
Agrega una segunda implementación de `Volador` (por ejemplo `Avion`, sin relación de herencia con `Pajaro`) y una tercera subclase de `Forma` (`Triangulo`); confirma que `describir()` funciona igual para las tres sin reescribirlo.

#### Paso 7 · Cierre
Guarda las clases, la salida de `describir()` para cada forma y el error de instanciación directa; como siguiente paso estudia sobrecarga y modificadores de acceso. Errores comunes: usar clase abstracta cuando bastaba una interfaz, y duplicar comportamiento compartido en cada implementación de una interfaz en vez de centralizarlo en una clase abstracta. Fuentes oficiales: https://dev.java/learn/classes-objects/ y https://docs.oracle.com/javase/tutorial/java/IandI/.
**Implicación práctica:** Elegir mal entre interfaz y clase abstracta duplica comportamiento compartido real entre subclases relacionadas, o fuerza una relación de herencia innecesaria donde solo hacía falta un contrato puro.

### Tema 4: Sobrecarga vs sobreescritura, y modificadores de acceso

#### Paso 1 · Objetivo y preparación
Al finalizar podrás distinguir sobrecarga (varias firmas, mismo nombre) de sobreescritura (Tema 2), y aplicar los cuatro niveles de visibilidad de Java. Prerrequisitos: JDK 25, Maven y un editor. Comprueba java --version.

#### Paso 2 · Contexto y caso real
Un servicio de tarifas necesita `sumar` para enteros y para decimales sin duplicar el nombre del método; y necesita que solo ciertas clases del mismo paquete puedan acceder a un campo interno, mientras otras partes del sistema no.

#### Paso 3 · Teoría, modelo mental y analogía
La sobrecarga se resuelve en tiempo de compilación según los tipos de los argumentos; la sobreescritura, en tiempo de ejecución según el tipo real del objeto. La analogía: la sobrecarga es tener varias entradas a un edificio para distinto tipo de visitante; los modificadores de acceso son círculos concéntricos de alcance creciente.

**Conceptos clave:** misma firma vs distintas firmas, niveles de visibilidad.

La sobrecarga (overload) define múltiples métodos con el mismo nombre pero distintas firmas (distinto número o tipo de parámetros) dentro de la misma clase: `int sumar(int a, int b)` y `double sumar(double a, double b)` son dos métodos distintos que el compilador resuelve según los tipos de los argumentos pasados en cada llamada específica, una decisión tomada en tiempo de compilación; la sobreescritura (override, Tema 2) redefine el comportamiento de un método heredado con exactamente la misma firma en una subclase, una decisión resuelta en tiempo de ejecución según el tipo real del objeto.

Los modificadores de acceso controlan la visibilidad de un miembro de una clase en círculos concéntricos de alcance creciente: `private` restringe el acceso exclusivamente a la propia clase; sin modificador explícito (package-private, el nivel por defecto cuando no se escribe ninguno) permite acceso desde cualquier clase del mismo paquete; `protected` extiende ese acceso también a subclases, incluso si están en otro paquete distinto; `public` permite acceso desde cualquier lugar sin restricción alguna, la misma jerarquía de visibilidad estudiada de forma más general en el Módulo 4 del track de JavaScript sobre encapsulación, aquí con la sintaxis y granularidad específica de Java.

**Analogía:** la sobrecarga es como tener varias entradas distintas a un mismo edificio, cada una diseñada para un tipo distinto de visitante que llega con diferente equipaje; la sobreescritura es como una sucursal específica de una franquicia que decide atender a sus visitantes de una forma particular y distinta a como lo especifica el manual general de la franquicia, sin cambiar el nombre del procedimiento que sigue.

**¿Por qué es importante?** Sobrecarga y sobreescritura resuelven problemas distintos (múltiples formas de invocar un método según sus argumentos, frente a redefinir el comportamiento heredado); los modificadores de acceso controlan con precisión granular quién puede ver y usar cada miembro de una clase.

**Código del ejemplo:**

```java
int sumar(int a, int b) { return a + b; }
double sumar(double a, double b) { return a + b; } // sobrecarga: mismo nombre, firma distinta

// private (solo la clase) < package-private (mismo paquete) < protected (+ subclases) < public (todos)
```

---

**Transferencia al proyecto integrador «Motor de asignación de entregas»:** Separa sobrecarga de métodos de la sustitución de comportamiento del motor. Prueba llamadas por interfaz y restringe modificadores para impedir que un consumidor altere capacidad sin validación.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-sobrecarga-visibilidad
cd ejemplo-sobrecarga-visibilidad
mkdir -p src/main/java/academia/tarifas
```

**Ejecuta el ejemplo:**

```bash
# Maven
mvn -q archetype:generate -DgroupId=academia -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app && mvn test
# Gradle (equivalente): gradle init --type java-application --dsl kotlin && ./gradlew test
```

Crea `Tarifa.java` con dos métodos `sumar` sobrecargados (`int`/`int` y `double`/`double`) y un campo `private` junto a uno `protected`. Compila y ejecuta una clase `Main` que invoque ambas variantes de `sumar` y muestre cuál se resuelve para cada tipo de argumento.

#### Paso 5 · Práctica guiada
Pista: intenta acceder al campo `private` desde otra clase del mismo paquete para provocar un fallo deliberado de compilación; solo el campo sin modificador (package-private) es accesible ahí. Resultado esperado: distingues qué nivel de visibilidad permite cada acceso.

#### Paso 6 · Práctica independiente
Agrega una tercera sobrecarga de `sumar` que reciba tres argumentos, y una clase en otro paquete que confirme que el campo `protected` es accesible solo desde una subclase.

#### Paso 7 · Cierre
Guarda las sobrecargas, la salida de cada resolución y el error de acceso al campo `private`; como siguiente paso estudia colecciones. Errores comunes: confundir sobrecarga con sobreescritura, hacer todo `public` por comodidad, y setters sin reglas que rompan invariantes. Fuentes oficiales: https://dev.java/learn/classes-objects/ y https://docs.oracle.com/javase/tutorial/java/IandI/.
**Implicación práctica:** Confundir sobrecarga con sobreescritura, o exponer un campo con más visibilidad de la necesaria, son errores de diseño que se vuelven costosos de revertir una vez que otro código ya depende de ellos.

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir una jerarquía de clases con herencia, una interfaz y una clase abstracta.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Construir `Guia` con invariantes en el constructor | Ver Tema 1 | Impide número vacío y peso inválido |
| 2 | Crear `Animal` y `Perro` con `@Override` | Ver Tema 2 | Verifica el polimorfismo de subtipo |
| 3 | Definir `Volador` e implementarla en `Pajaro` | Ver Tema 3 | Contrato puro sin implementación |
| 4 | Crear `Forma` abstracta con `Circulo`/`Cuadrado` | Ver Tema 3 | Comportamiento compartido + métodos abstractos |
| 5 | Sobrecargar `sumar()` con distintas firmas | Ver Tema 4 | Compara con sobreescritura |
| 6 | Aplicar `private`/`protected`/`public` | Ver Tema 4 | Explica cuándo usar cada uno |

**Verificación:** el laboratorio se considera exitoso si invocar un método sobre una referencia `Animal` que apunta a un `Perro` ejecuta correctamente la versión sobreescrita, y si la jerarquía distingue apropiadamente qué comportamiento pertenece a una interfaz frente a una clase abstracta.

**Errores comunes y soluciones**

- **Confundir sobrecarga con sobreescritura.** La sobrecarga define métodos con firmas distintas en la misma clase; la sobreescritura redefine un método heredado con la misma firma exacta.
- **Usar una clase abstracta cuando una interfaz sería más apropiada.** Si no hay comportamiento compartido real entre subclases no relacionadas, prefiere una interfaz.
- **Olvidar `@Override` al sobreescribir un método.** Sin ella, el compilador no verifica que efectivamente estás sobreescribiendo un método existente con la firma correcta.

---
