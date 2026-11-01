# Módulo 0: Fundamentos de Spring — IoC y DI

Cada tema declara su nivel, su duración y un proyecto verificable. El mecanismo de inyección de dependencias se documenta con comandos reales de Maven/Spring Boot y con el comportamiento exacto que produce cada anotación, sin sustituir el código Java por ningún otro lenguaje.

## Antes de comenzar: del equipo vacío a Spring Boot

Completa primero los fundamentos del track Java o asegúrate de entender clases, interfaces, excepciones y colecciones. Instala **JDK 27**, Git y un editor: IntelliJ IDEA Community es la opción más sencilla para Spring; VS Code con Extension Pack for Java y Spring Boot Extension Pack también funciona.

- **Windows:** instala Eclipse Temurin JDK 27, Git e IntelliJ; verifica `java --version` y `javac --version` en PowerShell.
- **macOS:** usa `brew install --cask temurin` y `brew install git`; instala IntelliJ desde JetBrains Toolbox.
- **Ubuntu/Debian:** instala el paquete de Temurin 27 desde [Adoptium](https://adoptium.net/temurin/releases/?version=27) con `sudo apt install ./<archivo>.deb`, o usa SDKMAN; instala Git e IntelliJ.

No necesitas instalar Maven si el proyecto incluye `mvnw`/`mvnw.cmd`: ese *wrapper* descarga la versión correcta. En [start.spring.io](https://start.spring.io/) elige Java, Maven, Spring Boot estable, JDK 27 y la dependencia **Spring Web**. Descarga, descomprime y ejecuta:

```bash
# macOS/Linux
./mvnw spring-boot:run

# Windows PowerShell
.\mvnw.cmd spring-boot:run
```

Visita `http://localhost:8080`. Un 404 significa que el servidor sí arrancó pero aún no existe una ruta; "connection refused" significa que no arrancó. Lee siempre desde la primera línea `Caused by:` del error, no solo la última.

## Aprende construyendo

### Tema 1: Inversión de control y el contenedor de Spring · Básico · 20 min

**Prerrequisito:** clases, interfaces y constructores (track de Java). No se requiere Spring previo.

**Al terminar podrás:** explicar qué hace el contenedor de Spring por ti y comprobar con una aplicación real que una clase no construye sus propias dependencias.

#### Aprende

**¿Por qué es importante?** En una API de entregas, los servicios cambian de implementación entre pruebas y producción (un repositorio real contra la base de datos, uno falso en memoria para tests); el contenedor de Spring administra esas dependencias sin que el controlador que las usa conozca cómo se construyen ni de dónde vienen.

En código sin un contenedor de inversión de control, una clase que necesita colaboradores típicamente los crea ella misma directamente (`new RepositorioTareas()`), acoplándose fuertemente a una implementación concreta y haciendo que sustituirla (por ejemplo, por una versión de prueba durante los tests) requiera modificar el código interno de la propia clase que la crea. La **inversión de control** invierte esa responsabilidad: un contenedor externo (el contenedor de Spring) crea las dependencias centralizadamente y las "inyecta" en cada clase que las declara como necesarias, de modo que la clase consumidora solo declara qué necesita (típicamente a través de su constructor), sin saber ni importarle cómo esa dependencia concreta se construye.

```java
@Service
public class ServicioTareas {
    private final RepositorioTareas repositorio;

    public ServicioTareas(RepositorioTareas repositorio) {
        this.repositorio = repositorio;
    }
}
```

Esta clase declara que `ServicioTareas` necesita un `RepositorioTareas`; el contenedor de Spring, al detectar esta clase como un bean gestionado, encuentra (o crea) una instancia de `RepositorioTareas` y la pasa automáticamente al constructor al instanciar `ServicioTareas`.

**Analogía:** sin inversión de control, cada empleado de una empresa tendría que fabricar personalmente cada herramienta que necesita; con inversión de control, un departamento central de suministros (el contenedor de Spring) entrega automáticamente a cada empleado exactamente las herramientas que declaró necesitar, sin que el empleado sepa de dónde vienen ni cómo se fabricaron.

**Diagrama interactivo:** [Spring crea y conecta los beans](/visuals/temas/spring-boot/modulo-0-tema-1-ioc.html).

#### Practica

**Demo paso a paso.** Desde una carpeta vacía, genera el proyecto real en [start.spring.io](https://start.spring.io/) (Java, Maven, Spring Boot estable, JDK 27, dependencia **Spring Web**) y descomprímelo. Crea `src/main/java/com/example/demo/ServicioTareas.java`:

```java
package com.example.demo;

import org.springframework.stereotype.Service;

@Service
public class ServicioTareas {
    private final RepositorioTareas repositorio; // inyección por constructor

    public ServicioTareas(RepositorioTareas repositorio) {
        this.repositorio = repositorio;
    }

    public String procesar() {
        return "procesado: " + repositorio.buscar();
    }
}
```

1. Guarda el archivo y arranca la aplicación con el wrapper de Maven:

```bash
# compila y ejecuta el proyecto Java con el wrapper de Maven
cd ejemplo-spring-m0
./mvnw spring-boot:run
```

`mvnw` es el script (el "Maven Wrapper") que descarga y ejecuta la versión exacta de Maven que el proyecto declara, sin requerir una instalación global.

2. Expón `procesar()` en un controlador (`GET /status`) y confirma que el contenedor conecta ambos beans automáticamente:

```bash
curl http://localhost:8080/status
```

`curl` hace la petición HTTP desde la terminal para confirmar la respuesta del endpoint.

**Explicación línea por línea:** `@Service` marca la clase como un bean que el contenedor de Spring debe crear y gestionar; `public ServicioTareas(RepositorioTareas repositorio)` declara la dependencia como parámetro del constructor — el contenedor detecta esta firma, resuelve `RepositorioTareas` (creándolo si aún no existe) y lo pasa automáticamente al construir `ServicioTareas`, sin que ningún código de la aplicación escriba explícitamente esa conexión.

**Resultado esperado:** la respuesta HTTP contiene `procesado: ...` con el resultado de `RepositorioTareas.buscar()` — confirmando que Spring creó ambos beans y conectó `ServicioTareas` con su `RepositorioTareas` sin que tú escribieras el `new` que los une.

**Fallo deliberado:** quita la anotación `@Service` de la clase y vuelve a ejecutar `./mvnw spring-boot:run`. Si algún otro bean depende de `ServicioTareas` por constructor, el arranque falla con `NoSuchBeanDefinitionException` (Spring no encuentra un bean que satisfaga esa dependencia). Diagnostica confirmando que, sin la anotación, la clase deja de ser gestionada por el contenedor y ninguna inyección automática puede alcanzarla, aunque el código siga compilando perfectamente.

Confirma también que `ServicioTareas` nunca importa ni instancia ninguna implementación concreta de `RepositorioTareas` con `new`: solo el contenedor conoce qué implementación existe y decide cuál pasar al constructor.

**Ejercicios.**

1. Declara un segundo `@Service` que dependa de `ServicioTareas` por constructor y confirma que Spring lo conecta automáticamente al arrancar.
2. Agrega un método a la implementación real de `RepositorioTareas` y confirma que `ServicioTareas` lo usa sin cambiar su propio código.
3. Convierte `RepositorioTareas` de clase concreta a interfaz con una única implementación `@Repository` y confirma que `ServicioTareas` sigue arrancando igual.
4. Escribe de memoria, sin mirar, una clase de servicio con una dependencia inyectada por constructor y el estereotipo que la registra en el contenedor.

**Pista:** si necesitas escribir `new` para crear una dependencia dentro de una clase gestionada por Spring, probablemente deberías declararla como parámetro del constructor.

**Completa el código:** rellena el espacio para que el contenedor gestione la clase:

```java
____
public class ServicioTareas {
    private final RepositorioTareas repositorio;
    public ServicioTareas(RepositorioTareas repositorio) { this.repositorio = repositorio; }
}
```

**Reto de memoria:** cierra este documento y escribe una clase de servicio anotada con `@Service` que reciba una dependencia por constructor, sin que la clase sepa qué implementación concreta recibe. Compara después contra el patrón de la demo.

#### Aplica

**Reto abierto.** Agrega un `RepositorioTareasEnMemoria` y un `RepositorioTareasJdbc`, ambos `@Repository`, y consigue que la aplicación arranque con uno u otro sin modificar `ServicioTareas`. Puedes usar `@Primary`, `@Qualifier` o perfiles; documenta la decisión y demuestra el cambio con dos arranques y dos respuestas distintas de `GET /status`.

**Checklist de salida.**

- [ ] La aplicación arranca y `GET /status` responde con datos del repositorio activo.
- [ ] `ServicioTareas` no contiene ningún `new` de una dependencia ni importa una implementación concreta.
- [ ] El cambio de implementación se hace por configuración o anotación, no reescribiendo el servicio.
- [ ] Puedes explicar qué bean creó Spring y en qué orden resolvió las dependencias.
- [ ] Reprodujiste el fallo por falta de `@Service` y leíste la causa raíz del arranque.
- [ ] El repositorio queda con un commit o tag que permite repetir el ejercicio.

**Si falla.** Si aparece `NoSuchBeanDefinitionException`, revisa el estereotipo y el paquete escaneado. Si aparece `NoUniqueBeanDefinitionException`, hay dos candidatos y falta `@Primary` o `@Qualifier`. Si el endpoint devuelve 404, el controlador no está en el paquete escaneado o la ruta no coincide.

**Siguiente paso:** el Tema 2 compara este mecanismo de constructor contra la inyección por campo.

**Errores comunes:** instanciar dependencias manualmente con `new` dentro de una clase gestionada; olvidar el estereotipo y descubrir el error solo cuando otro bean depende de esa clase.

**Límites y decisión de uso:** para un script pequeño y desechable sin ciclo de vida de aplicación, levantar un contenedor de IoC completo es más ceremonia de la necesaria; una función simple basta.

**Fuente oficial:** [Spring Framework — Beans](https://docs.spring.io/spring-framework/reference/core/beans.html).

**Transferencia al proyecto integrador:** el servicio de entregas declarará por constructor un repositorio de persistencia y un cliente de notificaciones, sin saber qué implementación concreta recibe en cada entorno.

### Tema 2: Inyección por constructor vs por campo · Básico · 20 min

**Prerrequisito:** Tema 1 de este módulo.

**Al terminar podrás:** explicar por qué la inyección por constructor permite dependencias `final` y tests sin contenedor, y demostrar el fallo de la inyección por campo en el mismo escenario.

#### Aprende

**¿Por qué es importante?** Escribir un test unitario de `ServicioTareas` sin levantar el contenedor completo de Spring (mucho más rápido que un test de integración) solo es directo si la dependencia se recibe por constructor; con inyección por campo no hay una forma simple de pasarle un mock sin reflexión o utilidades especiales de testing.

**Conceptos clave:** inmutabilidad (`final`), testabilidad sin el contenedor.

`@Autowired private RepositorioTareas repositorio;` (inyección por campo) es sintácticamente más corta, pero el campo no puede declararse `final` (el lenguaje no impone ninguna garantía de inmutabilidad, aunque en la práctica Spring solo lo asigne una vez), y escribir un test unitario sin levantar el contenedor se vuelve difícil: no existe una forma directa de asignar el mock a un campo privado sin reflexión. Con inyección por constructor, el campo puede declararse `final` (inmutabilidad verificada por el compilador), y un test unitario basta con escribir `new ServicioTareas(repositorioMockeado)` directamente, sin ningún contenedor.

**Analogía:** la inyección por campo es como recibir una herramienta por una ranura oculta después de que ya empezaste a trabajar, sin que quede claro en qué momento exacto llegó; la inyección por constructor es como recibir todas las herramientas necesarias en tus manos directamente al comenzar tu turno, con la garantía explícita de que las tienes desde el primer momento.

**Diagrama:**

```text
┌── inyección por constructor ──────────────┐
│  final RepositorioTareas repositorio;        │
│  test: new ServicioTareas(mock) — sin contenedor │
└──────────────────────────────────────┘
┌── inyección por campo ─────────────────────┐
│  @Autowired RepositorioTareas repositorio;   │
│  test: requiere reflexión o contenedor completo │
└──────────────────────────────────────┘
```

#### Practica

**Demo paso a paso.** Desde una carpeta vacía (o continuando en `ejemplo-spring-m0`), crea `src/test/java/com/example/demo/ServicioTareasTest.java` con la versión de constructor:

```java
package com.example.demo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ServicioTareasTest {
    @Test
    void procesaUsandoElRepositorioInyectado() {
        RepositorioTareas mock = () -> "datos de prueba";
        ServicioTareas servicio = new ServicioTareas(mock); // sin contenedor, sin reflexión
        assertEquals("procesado: datos de prueba", servicio.procesar());
    }
}
```

1. Ejecuta el test con Maven, sin levantar el contenedor:

```bash
# ejecuta con Maven el test unitario Java
cd ejemplo-spring-m0
./mvnw test
```

**Explicación línea por línea:** `RepositorioTareas mock = () -> "datos de prueba"` crea una implementación falsa inline (una lambda que satisface la interfaz); `new ServicioTareas(mock)` construye el servicio directamente, pasando el mock al constructor, sin ningún contenedor ni anotación.

2. Reescribe `ServicioTareas` para usar inyección por campo e intenta el mismo test sin contenedor:

```java
package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ServicioTareasConCampo {
    @Autowired
    private RepositorioTareas repositorio; // no puede ser final; se asigna DESPUÉS de construir, vía reflexión

    public String procesar() {
        return "procesado: " + repositorio.buscar();
    }
}
```

```java
@Test
void procesaUsandoElRepositorioInyectado() {
    ServicioTareasConCampo servicio = new ServicioTareasConCampo();
    // repositorio es privado: no hay setter ni constructor que lo reciba
    servicio.procesar(); // NullPointerException: repositorio nunca se asignó
}
```

3. Ejecuta ambos tests y compara:

```bash
# ejecuta ambos tests Java con Maven y compara el resultado
cd ejemplo-spring-m0
./mvnw test
```

**Resultado esperado:** `ServicioTareasTest` (constructor) pasa en verde; el test equivalente contra `ServicioTareasConCampo` falla con `NullPointerException` en `repositorio.buscar()`, porque el campo `private` anotado con `@Autowired` solo se asigna cuando el contenedor real construye el bean y luego inyecta el valor por reflexión. Construir la clase con `new` directamente deja el campo sin asignar.

**Fallo deliberado:** intenta asignar el mock directamente al campo (`servicio.repositorio = mock;`) sin cambiar la visibilidad. La compilación falla: `repositorio has private access in ServicioTareasConCampo`. Diagnostica confirmando que un campo `private` sin setter no es asignable desde fuera sin reflexión (`Field.setAccessible(true)`), la herramienta adicional que la inyección por campo obliga a usar en un test que quiere evitar el contenedor.

**Ejercicios.**

1. Agrega un segundo método a `ServicioTareas` y extiende el test de constructor, sin ningún contenedor.
2. Escribe el test equivalente para la clase con inyección por campo usando reflexión (`Field.setAccessible(true)`) y compara la complejidad.
3. Convierte una dependencia `final` en no-`final` y explica qué garantía del compilador se pierde.
4. Escribe de memoria un test unitario que instancie una clase con una dependencia mockeada pasada por constructor.

**Pista:** si escribir un test requiere reflexión o levantar un contenedor completo, la clase depende de inyección por campo en vez de por constructor.

**Completa el código:** rellena el espacio para declarar la dependencia como inmutable:

```java
private ____ RepositorioTareas repositorio;
```

**Reto de memoria:** cierra este documento y escribe una clase con inyección por constructor y su test unitario con un mock. Compara después contra el patrón de la demo.

#### Aplica

**Reto abierto.** Convierte las tres clases de tu proyecto (controlador, servicio, repositorio) a inyección por constructor y agrega un test unitario del servicio sin `@SpringBootTest`. Mide el tiempo de ejecución de `./mvnw test` antes y después de eliminar el contexto de Spring del test y explica la diferencia.

**Checklist de salida.**

- [ ] Todas las dependencias obligatorias son `final` y se reciben por constructor.
- [ ] El test del servicio se ejecuta con `new`, sin anotaciones de Spring.
- [ ] El test falla de forma comprensible si se elimina el mock o se pasa `null`.
- [ ] Documentaste el costo de la reflexión frente al constructor para el mismo caso.
- [ ] No queda ningún `@Autowired` sobre campos en las clases nuevas.

**Si falla.** Si el test no compila por un campo privado, no lo hagas público: cambia la clase a constructor. Si el contexto no arranca, revisa que el constructor no reciba dependencias no registradas como beans.

**Siguiente paso:** el Tema 3 cubre los estereotipos y cómo `spring-boot-starter-web` autoconfigura el proyecto.

**Errores comunes:** usar `@Autowired` sobre un campo por costumbre en vez de preferir el constructor; declarar dependencias no-`final` sin necesidad, perdiendo la inmutabilidad verificada por el compilador.

**Límites y decisión de uso:** con muchísimas dependencias opcionales, un constructor gigante es poco legible; considera un objeto de configuración o builder. Eso no equivale a volver a inyección por campo.

**Fuente oficial:** [Spring Framework — Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html).

**Transferencia al proyecto integrador:** cada bean del microservicio productivo aplicará inyección por constructor.

### Tema 3: Estereotipos, autoconfiguración y scopes · Intermedio · 25 min

**Prerrequisito:** Temas 1-2 de este módulo.

**Al terminar podrás:** distinguir `@Component`/`@Service`/`@Repository`, explicar qué autoconfigura `spring-boot-starter-web` y elegir entre `singleton` y `prototype` con una prueba real.

#### Aprende

**¿Por qué es importante?** Un contador compartido entre peticiones necesita ser `singleton` (una instancia por contenedor); un objeto temporal de una operación, como un builder de reporte, puede ser `prototype` (una instancia nueva cada vez que el contenedor lo resuelve). `prototype` no significa una instancia por petición HTTP; confundir esos alcances produce bugs de estado compartido accidental o de recreación innecesaria.

**Conceptos clave:** `@Component`/`@Service`/`@Repository`, autoconfiguración de starters, `singleton` vs `prototype`.

`@Component`, `@Service` y `@Repository` son variantes especializadas de la misma anotación base `@Component`, que le indica a Spring "gestiona esta clase como un bean"; la diferencia es principalmente semántica y documental, con una excepción funcional: `@Repository` traduce automáticamente excepciones específicas de la tecnología de persistencia subyacente a una jerarquía de excepciones propia y consistente de Spring. `spring-boot-starter-web` trae automáticamente un servidor Tomcat embebido, Jackson para JSON y Spring MVC, autoconfigurados con valores por defecto sensatos, sin la configuración XML extensa que el Spring clásico exigía. `@Scope` controla el ciclo de vida de un bean: `singleton` (por defecto, una instancia por contenedor) o `prototype` (una instancia nueva cada vez que el contenedor resuelve el bean, no cada vez que llega una petición HTTP).

**Analogía:** los estereotipos son distintos uniformes de un mismo tipo de empleado, donde el uniforme de `@Repository` además incluye una traducción automática de idioma para comunicarse con sistemas externos; un bean `singleton` es como una única impresora compartida por toda la oficina, mientras un bean `prototype` es como una hoja de papel nueva que se entrega cada vez que alguien la pide.

**Diagrama:** [Estereotipos, starter web y scopes de Spring](../../visuals/temas/spring-boot/modulo-0-tema-3-stereotypes-scopes.html)

#### Practica

**Demo paso a paso.** Desde una carpeta vacía (o continuando en `ejemplo-spring-m0`), crea `src/main/java/com/example/demo/GeneradorReporte.java` con un bean `prototype`:

```java
package com.example.demo;

import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

@Component
@Scope("prototype")
public class GeneradorReporte {
    private final String id = java.util.UUID.randomUUID().toString();
    public String id() { return id; }
}
```

1. Guarda el archivo y arranca la aplicación:

```bash
# compila y ejecuta el proyecto Java, confirma el scope de cada bean vía logs
cd ejemplo-spring-m0
./mvnw spring-boot:run
```

**Explicación línea por línea:** `@Component` marca la clase como bean gestionado; `@Scope("prototype")` sobrescribe el default (`singleton`) indicando que el contenedor debe crear una instancia NUEVA cada vez que algo solicite este bean.

2. Inyecta `GeneradorReporte` dos veces en un controlador de prueba (dos parámetros, o dos llamadas a `context.getBean(...)`) y confirma que cada resolución produce un `id()` distinto:

```bash
curl http://localhost:8080/reporte/comparar
```

**Resultado esperado:** la respuesta muestra dos valores de `id()` DISTINTOS, confirmando que `@Scope("prototype")` crea una instancia nueva por resolución, a diferencia de un bean `singleton` donde ambas resoluciones devolverían el mismo `id()`.

**Fallo deliberado:** quita `@Scope("prototype")` y repite la prueba. Ahora ambas resoluciones devuelven el MISMO `id()`, porque el contenedor reutiliza la única instancia compartida. Diagnostica confirmando que olvidar el scope para un bean que necesita estado nuevo por operación produce silenciosamente estado compartido entre operaciones que deberían ser independientes.

3. Para ver ambos scopes juntos, declara un segundo bean explícitamente `singleton` en la misma clase de configuración y expón los dos `id()` en el endpoint de comparación; solo el `prototype` cambia entre resoluciones.

**Ejercicios.**

1. Agrega un tercer bean con scope `singleton` explícito (redundante con el default) y confirma que el comportamiento no cambia.
2. Cambia `GeneradorReporte` de `prototype` a `singleton` y predice el resultado antes de ejecutar.
3. Clasifica tres beans reales (un repositorio, un contador global, un builder de un solo reporte) según el scope correcto.
4. Escribe de memoria dos beans con scopes distintos y el resultado esperado de resolverlos dos veces cada uno.

**Pista:** si un bean acumula estado que pertenece a una única operación, probablemente necesita `prototype`, no el `singleton` por defecto.

**Completa el código:** rellena el espacio para que el bean se cree nuevo en cada solicitud:

```java
@Component
@Scope("____")
public class GeneradorReporte { /* ... */ }
```

**Reto de memoria:** cierra este documento y escribe dos beans (uno `singleton`, uno `prototype`) y traza a mano qué instancia devolvería cada uno tras dos resoluciones.

#### Aplica

**Reto abierto.** Diseña un informe de entregas con dos beans: un `ContadorDeInformes` que debe compartir el total entre peticiones y un `ConstructorDeInforme` que debe empezar vacío en cada operación. Expón un endpoint que genere dos informes y muestre el contador y el identificador de cada constructor. Predice los valores antes de ejecutar y contrasta.

**Checklist de salida.**

- [ ] El contador conserva el total entre dos peticiones consecutivas.
- [ ] Cada constructor de informe produce un identificador distinto.
- [ ] El endpoint demuestra ambos comportamientos en una sola respuesta.
- [ ] Puedes explicar por qué `prototype` no equivale a "una instancia por petición HTTP".
- [ ] Reprodujiste el estado compartido accidental al quitar el scope y lo documentaste.

**Si falla.** Si ambos identificadores coinciden, revisa que el bean sea `prototype` y que lo resuelvas dos veces (no que uses dos referencias al mismo bean inyectado en un `singleton`). Si el contador se reinicia, el bean se está creando de nuevo o la aplicación se reinició.

**Siguiente paso:** el Módulo 1 aplica estos conceptos a la configuración externa y los perfiles.

**Errores comunes:** asumir que todo bean es `singleton` sin considerar si acumula estado por operación; confundir `@Service` con una anotación funcionalmente distinta de `@Component` (solo `@Repository` agrega comportamiento real).

**Límites y decisión de uso:** para un valor inmutable sin estado mutable entre resoluciones, discutir `singleton` vs `prototype` es irrelevante; ambos producirían el mismo comportamiento observable.

**Fuente oficial:** [Spring Framework — Bean scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html).

**Transferencia al proyecto integrador:** los estereotipos `@Service`, `@Repository` y `@Controller` organizan las clases del microservicio productivo.

## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza generando `academia-spring` en `start.spring.io`, descomprímelo en una carpeta vacía y ejecuta `git init`. Ejecuta cada comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Antes de avanzar |
|---|---|---|
| Base | API y configuración. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | Datos, seguridad y mensajería. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | Contratos, observabilidad y resiliencia. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una aplicación Spring Boot mínima con beans inyectados por constructor y scopes correctos.

**Requisitos previos:** conocimientos de Java (track de Java) recomendados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un proyecto con start.spring.io y arrancarlo | `./mvnw spring-boot:run` | Verifica el arranque |
| 2 | Definir `@Service` y `@Repository` con inyección por constructor | Ver Tema 1 | Verifica la conexión automática |
| 3 | Escribir un test unitario sin levantar el contenedor | Ver Tema 2 | `new ServicioTareas(mock)` directo |
| 4 | Declarar un bean `prototype` y confirmar instancias distintas | Ver Tema 3 | Compara contra el default `singleton` |
| 5 | Investigar qué autoconfigura `spring-boot-starter-web` | Ver Tema 3 | Documenta las dependencias que trae |

**Verificación:** el laboratorio se considera exitoso si el servicio y el repositorio se conectan por inyección de constructor, si el test unitario corre sin contenedor, y si el bean `prototype` produce una instancia distinta en cada resolución mientras el `singleton` reutiliza la misma.

**Errores comunes y soluciones**

- **Usar inyección por campo por costumbre.** Prefiere inyección por constructor para inmutabilidad y testabilidad sin contenedor.
- **Confundir `@Service` con una anotación funcionalmente distinta de `@Component`.** Solo `@Repository` agrega comportamiento funcional adicional (traducción de excepciones).
- **Asumir que todo bean es `singleton` sin evaluarlo.** Un bean que acumula estado por operación necesita `prototype` explícito.

## Proyecto de cierre del módulo

**Objetivo:** entregar un núcleo de entregas ejecutable que demuestre, con pruebas y una API mínima, que el contenedor de Spring crea y conecta los objetos por constructor y que cada scope se eligió por una razón verificable.

**Entregables.**

1. Proyecto `entregas-ioc` generado con Spring Web y arrancable con `./mvnw spring-boot:run`.
2. `ServicioEntregas` con dos dependencias por constructor (`RepositorioEntregas`, `NotificadorEntregas`) y ambas declaradas `final`.
3. Dos implementaciones de repositorio y dos de notificador, seleccionables sin tocar el servicio, con la estrategia documentada.
4. Un bean `prototype` (`ConstructorDeEtiqueta`) y un bean `singleton` (`ContadorDeEtiquetas`) expuestos en `GET /diagnostico`.
5. Tests unitarios del servicio con dobles escritos a mano, sin `@SpringBootTest`.
6. `README.md` con comandos, decisiones de scope y una sección "qué falla si quito cada anotación".

**Rúbrica (100 puntos).**

| Criterio | Puntos |
|---|---:|
| El proyecto arranca desde un clon limpio y `GET /diagnostico` responde | 15 |
| Inyección por constructor en todas las dependencias obligatorias, sin `new` interno | 20 |
| Cambio de implementación por configuración, con dos escenarios demostrados | 20 |
| Scope `prototype` y `singleton` verificados con evidencia observable | 15 |
| Tests unitarios sin contenedor, legibles y con un caso de fallo | 15 |
| README reproducible y diagnóstico de al menos dos fallos provocados | 10 |
| Commits o tags por hito, sin secretos ni artefactos generados | 5 |

**Criterio de aceptación:** si el proyecto no arranca desde un clon limpio o el cambio de implementación exige editar el servicio, el proyecto no se considera cerrado aunque la rúbrica sume 100.
