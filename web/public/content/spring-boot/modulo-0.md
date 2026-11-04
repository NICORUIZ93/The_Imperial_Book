# Módulo 0: Fundamentos de Spring — IoC y DI

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria. El mecanismo de inyección de dependencias se documenta con comandos reales de Maven/Spring Boot y con el comportamiento exacto y verificable que produce cada anotación, sin sustituir el código Java por ningún otro lenguaje.


## Antes de comenzar: del equipo vacío a Spring Boot

Completa primero los fundamentos del track Java o asegúrate de entender clases, interfaces, excepciones y colecciones. Instala **JDK 25**, Git y un editor: IntelliJ IDEA Community es la opción más sencilla para Spring; VS Code con Extension Pack for Java y Spring Boot Extension Pack también funciona.

- **Windows:** instala Eclipse Temurin JDK 25, Git e IntelliJ; verifica `java --version` y `javac --version` en PowerShell.
- **macOS:** usa `brew install --cask temurin` y `brew install git`; instala IntelliJ desde JetBrains Toolbox.
- **Ubuntu/Debian:** ejecuta `sudo apt install openjdk-21-jdk git`; descarga IntelliJ o usa SDKMAN.

No necesitas instalar Maven si el proyecto incluye `mvnw`/`mvnw.cmd`: ese *wrapper* descarga la versión correcta. En [start.spring.io](https://start.spring.io/) elige Java, Maven, Spring Boot estable, JDK 25 y la dependencia **Spring Web**. Descarga, descomprime y ejecuta:

```bash
# macOS/Linux
./mvnw spring-boot:run

# Windows PowerShell
.\mvnw.cmd spring-boot:run
```

Visita `http://localhost:8080`. Un 404 significa que el servidor sí arrancó pero aún no existe una ruta; "connection refused" significa que no arrancó. Lee siempre desde la primera línea `Caused by:` del error, no solo la última.


## Aprende construyendo

### Tema 1: Inversión de control y el contenedor de Spring

Una API de envíos necesita separar la regla de negocio de la fuente de datos. Primero conectaremos un repositorio en memoria y un servicio; después una ruta HTTP permitirá observar el resultado. Necesitas clases, interfaces y constructores de Java.

**¿Por qué es importante?** Si el servicio crea su propio repositorio, cambiarlo para usar una base de datos o un reemplazo de prueba obliga a editar el servicio. Spring puede crear esos objetos y conectarlos en el punto donde se declara la dependencia.

**Diagrama interactivo:** [Spring crea y conecta los beans](/visuals/temas/spring-boot/modulo-0-tema-1-ioc.html).

#### Subtema 1.1: Declara el contrato y la primera implementación · 10 min

**1. Contexto**

Un servicio debe pedir el estado de un envío sin decidir dónde se guarda. La interfaz declara qué dato necesita; la clase concreta sabe responder por ahora desde memoria.

**2. Hazlo tú**

En el proyecto creado desde [Spring Initializr](https://start.spring.io/) (Java, Maven, dependencia Spring Web), conserva la clase principal que generó el sitio. Dentro de su mismo paquete `com.example.demo`, crea `src/main/java/com/example/demo/RepositorioEnvios.java`:

```java
package com.example.demo;

public interface RepositorioEnvios {
    String buscarEstado(String codigo);
}
```

Ahora crea `src/main/java/com/example/demo/RepositorioMemoriaEnvios.java`:

```java
package com.example.demo;

import org.springframework.stereotype.Repository;

@Repository
public class RepositorioMemoriaEnvios implements RepositorioEnvios {
    @Override
    public String buscarEstado(String codigo) {
        return "En ruta: " + codigo;
    }
}
```

Desde la carpeta raíz del proyecto, ejecuta:

```bash
./mvnw test
```

En Windows PowerShell, usa `./mvnw.cmd test`.

**Resultado esperado:** Maven termina con `BUILD SUCCESS`; Spring todavía no tiene ningún servicio que solicite este repositorio.

**Fallo deliberado:** cambia `implements RepositorioEnvios` por `implements RepositorioEnviosX`. **Diagnóstico:** el compilador indica que no encuentra ese tipo; revisa el nombre de la interfaz y restáuralo.

**3. Entiende**

`RepositorioEnvios` es el contrato. `RepositorioMemoriaEnvios` es una clase que lo cumple. `@Repository` permite que el escaneo de componentes de Spring la registre como un objeto administrado, llamado *bean*.

**4. Cierra**

Conserva ambos archivos y anota qué método ofrece el contrato. El siguiente paso hará que un servicio solicite esa interfaz.

#### Subtema 1.2: Deja que Spring conecte el servicio · 10 min

**1. Contexto**

El servicio usa el contrato, no crea la implementación. Spring encontrará un bean compatible y lo pasará al constructor.

**2. Hazlo tú**

Crea `src/main/java/com/example/demo/ServicioEnvios.java`:

```java
package com.example.demo;

import org.springframework.stereotype.Service;

@Service
public class ServicioEnvios {
    private final RepositorioEnvios repositorio;

    public ServicioEnvios(RepositorioEnvios repositorio) {
        this.repositorio = repositorio;
    }

    public String consultar(String codigo) {
        return repositorio.buscarEstado(codigo);
    }
}
```

Ejecuta desde la raíz del proyecto:

```bash
./mvnw spring-boot:run
```

En PowerShell, usa `./mvnw.cmd spring-boot:run`.

**Resultado esperado:** la aplicación termina de arrancar. El servicio recibe el repositorio sin escribir `new RepositorioMemoriaEnvios()`.

**Fallo deliberado:** quita `@Repository` y reinicia. **Diagnóstico:** el contenedor no encuentra un bean para `RepositorioEnvios`; la causa aparece como `NoSuchBeanDefinitionException` dentro del error de creación del servicio. Restaura la anotación.

**3. Entiende**

`@Service` registra el servicio; el constructor declara lo que necesita. `@SpringBootApplication` activa el escaneo desde el paquete de la clase principal hacia sus subpaquetes. Por eso mantuvimos las tres clases dentro de `com.example.demo`.

**4. Cierra**

Guarda el error observado y confirma que el servicio depende de la interfaz. En el siguiente paso permitirás llamar al servicio desde HTTP.

#### Subtema 1.3: Observa el cableado con una petición HTTP · 10 min

**1. Contexto**

Una ruta permite comprobar el recorrido completo: navegador o cliente HTTP → controlador → servicio → repositorio.

**2. Hazlo tú**

Crea `src/main/java/com/example/demo/EnviosController.java`:

```java
package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EnviosController {
    private final ServicioEnvios servicio;

    public EnviosController(ServicioEnvios servicio) {
        this.servicio = servicio;
    }

    @GetMapping("/envios/{codigo}")
    public String consultar(@PathVariable String codigo) {
        return servicio.consultar(codigo);
    }
}
```

Con la aplicación activa, abre otra terminal y ejecuta:

```bash
curl http://localhost:8080/envios/RF-42
```

**Resultado esperado:** aparece `En ruta: RF-42`. Sigue el recorrido y señala en qué constructor Spring pasó cada dependencia.

**Fallo deliberado:** quita `@RestController` y repite la petición. **Diagnóstico:** el servidor responde 404 porque esa clase dejó de registrarse como controlador; el servicio sigue existiendo, pero la ruta no. Restaura la anotación.

**3. Entiende**

Spring Boot registra `@Repository`, `@Service` y `@RestController` como beans y conecta sus constructores. La inversión de control describe quién administra la creación; la inyección describe cómo llega una dependencia. Para una aplicación pequeña de una sola función, crear un contenedor completo puede ser innecesario.

**Límite y decisión:** este repositorio guarda el resultado en el código y pierde cualquier cambio al reiniciar. Sirve para observar el cableado, no para guardar envíos reales; una base de datos será necesaria cuando el dato deba sobrevivir al cierre.

**Práctica independiente:** modifica `RepositorioMemoriaEnvios.buscarEstado` para devolver `Entregado: <codigo>` y repite la petición con otro código. El servicio y el controlador no deberían cambiar.

**4. Cierra**

Guarda la respuesta de `curl` y los dos fallos diagnosticados. Explica con tus palabras por qué `ServicioEnvios` conoce el contrato, pero no la clase concreta.

**Fuente primaria:** [Spring Boot: Beans e inyección de dependencias](https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html); [requisitos de Spring Boot](https://docs.spring.io/spring-boot/system-requirements.html).

Este mismo mecanismo se usará en el proyecto integrador: el servicio de envíos declarará por constructor un repositorio y un cliente de notificaciones, sin decidir qué implementación recibe cada entorno.

### Tema 2: Inyección por constructor vs por campo

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar por qué la inyección por constructor permite declarar dependencias `final` y testear sin contenedor, mientras la inyección por campo no.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Escribir un test unitario de `ServicioTareas` sin levantar el contenedor completo de Spring (mucho más rápido que un test de integración) solo es directo si la dependencia se recibe por constructor; con inyección por campo, no hay una forma simple de "pasarle" un mock sin reflexión o utilidades especiales de testing.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** inmutabilidad (`final`), testabilidad sin el contenedor.

`@Autowired private RepositorioTareas repositorio;` (inyección por campo) es sintácticamente más corta, pero el campo no puede declararse `final` (el lenguaje no impone ninguna garantía de inmutabilidad, aunque en la práctica Spring solo lo asigne una vez), y escribir un test unitario sin levantar el contenedor completo se vuelve difícil: no existe una forma directa de asignar el mock a un campo privado sin reflexión. Con inyección por constructor, el campo puede declararse `final` (inmutabilidad verificada por el compilador), y un test unitario basta con escribir `new ServicioTareas(repositorioMockeado)` directamente, sin ningún contenedor.

**Analogía:** la inyección por campo es como recibir una herramienta por una ranura oculta después de que ya empezaste a trabajar, sin que quede claro en qué momento exacto llegó; la inyección por constructor es como recibir todas las herramientas necesarias en tus manos directamente al comenzar tu turno, con la garantía explícita de que las tienes desde el primer momento.

**Diagrama:**

```
┌── inyección por constructor ──────────────┐
│  final RepositorioTareas repositorio;        │
│  test: new ServicioTareas(mock) — sin contenedor │
└──────────────────────────────────────┘
┌── inyección por campo ─────────────────────┐
│  @Autowired RepositorioTareas repositorio;   │
│  test: requiere reflexión o contenedor completo │
└──────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `ejemplo-spring-m0`), crea `src/test/java/com/example/demo/ServicioTareasTest.java` con la versión que usa inyección por constructor:

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

Guarda el archivo y ejecuta el test con Maven, sin levantar el contenedor de Spring:

```bash
# ejecuta con Maven el test unitario Java
cd ejemplo-spring-m0
./mvnw test
```

**Explicación línea por línea:** `RepositorioTareas mock = () -> "datos de prueba"` crea una implementación falsa inline (una lambda que satisface la interfaz); `new ServicioTareas(mock)` construye el servicio directamente, pasando el mock como argumento del constructor — no se necesita ningún contenedor de Spring ni anotación para que este test funcione.

Ahora reescribe `ServicioTareas` para usar inyección por campo en vez de por constructor, e intenta escribir el mismo test sin contenedor:

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

Intenta escribir el test equivalente al del constructor, sin contenedor:

```java
@Test
void procesaUsandoElRepositorioInyectado() {
    ServicioTareasConCampo servicio = new ServicioTareasConCampo();
    // repositorio es privado: no hay setter ni constructor que lo reciba
    servicio.procesar(); // NullPointerException: repositorio nunca se asignó
}
```

Ejecuta ambos tests con Maven:

```bash
# ejecuta ambos tests Java con Maven y compara el resultado
cd ejemplo-spring-m0
./mvnw test
```

**Resultado esperado:** `ServicioTareasTest` (constructor) pasa en verde; el test equivalente contra `ServicioTareasConCampo` falla con `NullPointerException` en `repositorio.buscar()`, porque el campo `private` anotado con `@Autowired` solo se asigna cuando el contenedor real de Spring construye el bean y luego inyecta el valor por reflexión — construir la clase con `new` directamente, como hace un test unitario sin contenedor, deja el campo sin asignar.

**Fallo deliberado:** intenta asignar el mock directamente al campo (`servicio.repositorio = mock;`) sin cambiar la visibilidad del campo. La compilación falla: `repositorio has private access in ServicioTareasConCampo` — diagnostica confirmando que un campo `private` sin setter no es asignable desde fuera de la clase sin recurrir a reflexión (`Field.setAccessible(true)`), la herramienta adicional que la inyección por campo obliga a usar en un test que quiere evitar levantar el contenedor completo.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo método a `ServicioTareas` y extiende el test con constructor para cubrirlo, sin ningún contenedor.
2. Intenta escribir un test equivalente para una clase con inyección por campo usando reflexión (`Field.setAccessible(true)`) y compara la complejidad frente al constructor.
3. Convierte una dependencia `final` en no-`final` y explica qué garantía del compilador se pierde.
4. Escribe de memoria (sin mirar) un test unitario que instancie una clase con una dependencia mockeada pasada por constructor.

**Pista:** si escribir un test requiere reflexión o levantar un contenedor completo, es una señal de que la clase depende de inyección por campo en vez de por constructor.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para declarar la dependencia como inmutable:

```java
private ____ RepositorioTareas repositorio;
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, una clase con inyección por constructor y su test unitario correspondiente instanciándola directamente con un mock. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya distingues por qué la inyección por constructor permite inmutabilidad real y tests simples sin contenedor, confirmando con ejecución real que la alternativa por campo depende de un mecanismo externo. El siguiente tema cubre los estereotipos de Spring y cómo `spring-boot-starter-web` autoconfigura el proyecto. **Evidencia:** entrega el resultado del test con constructor y el error real al intentar el equivalente sin inyección por constructor. Fuente oficial: [Spring Framework — Dependency Injection](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html).

**Errores comunes:** usar `@Autowired` sobre un campo por costumbre en vez de preferir el constructor; declarar dependencias no-`final` sin necesidad, perdiendo la garantía de inmutabilidad verificada por el compilador.

**Cuándo no usarlo:** para una clase con muchísimas dependencias opcionales donde un constructor gigante sería poco legible, considera un objeto de configuración o builder en vez de forzar todo por un único constructor; eso no es lo mismo que volver a inyección por campo, pero reconoce el límite práctico de un constructor con demasiados parámetros.

Elegir inyección por constructor en vez de por campo es la práctica que aplicarás en cada bean del proyecto integrador de este track (microservicio productivo, Módulo 12).

### Tema 3: Estereotipos, autoconfiguración y scopes

#### Paso 1 · Objetivo y preparación

Al finalizar podrás distinguir `@Component`/`@Service`/`@Repository`, explicar qué autoconfigura `spring-boot-starter-web`, y elegir el scope correcto (`singleton` vs `prototype`) para un bean.

**Conocimiento previo:** Temas 1-2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un contador compartido entre las peticiones necesita ser `singleton` (una instancia por contenedor Spring); un objeto temporal de una operación, como un builder de reporte, puede ser `prototype` (una instancia nueva cada vez que el contenedor lo resuelve). `prototype` no significa una instancia por petición HTTP; confundir esos alcances produce bugs de estado compartido accidental o de recreación innecesaria.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `@Component`/`@Service`/`@Repository`, autoconfiguración de starters, `singleton` vs `prototype`.

`@Component`, `@Service` y `@Repository` son variantes especializadas de la misma anotación base `@Component`, que le indica a Spring "gestiona esta clase como un bean"; la diferencia es principalmente semántica y documental, con una excepción funcional: `@Repository` traduce automáticamente excepciones específicas de la tecnología de persistencia subyacente a una jerarquía de excepciones propia y consistente de Spring. `spring-boot-starter-web` trae automáticamente un servidor Tomcat embebido, Jackson para JSON, y Spring MVC, autoconfigurados con valores por defecto sensatos, sin la configuración XML extensa que el Spring clásico exigía. `@Scope` controla el ciclo de vida de un bean: `singleton` (por defecto, una instancia por contenedor Spring) o `prototype` (una instancia nueva cada vez que el contenedor resuelve el bean, no cada vez que llega una petición HTTP).

**Analogía:** los estereotipos son distintos uniformes de un mismo tipo de empleado, donde el uniforme de `@Repository` además incluye una traducción automática de idioma para comunicarse con sistemas externos de almacenamiento; un bean `singleton` es como una única impresora compartida por toda la oficina, mientras un bean `prototype` es como una hoja de papel nueva que se entrega cada vez que alguien la pide.

**Diagrama:** [Estereotipos, starter web y scopes de Spring](../../visuals/temas/spring-boot/modulo-0-tema-3-stereotypes-scopes.html)

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `ejemplo-spring-m0`), crea `src/main/java/com/example/demo/GeneradorReporte.java` con un bean de scope `prototype`:

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

Guarda el archivo y arranca la aplicación con Maven:

```bash
# compila y ejecuta el proyecto Java, confirma el scope de cada bean vía logs
cd ejemplo-spring-m0
./mvnw spring-boot:run
```

**Explicación línea por línea:** `@Component` marca la clase como bean gestionado; `@Scope("prototype")` sobrescribe el default (`singleton`) indicando que el contenedor debe crear una instancia NUEVA cada vez que algo solicite este bean, en vez de reutilizar una única instancia compartida.

Inyecta `GeneradorReporte` dos veces en un controlador de prueba (dos parámetros, o dos llamadas a `context.getBean(...)`) y confirma que cada resolución produce un `id()` distinto:

```bash
curl http://localhost:8080/reporte/comparar
```

**Resultado esperado:** la respuesta muestra dos valores de `id()` DISTINTOS, confirmando que `@Scope("prototype")` efectivamente crea una instancia nueva por cada resolución, a diferencia de un bean `singleton` (por defecto) donde ambas resoluciones devolverían el mismo `id()`.

**Fallo deliberado:** quita `@Scope("prototype")` (dejando el bean como `singleton` por defecto) y repite la prueba — ahora ambas resoluciones devuelven el MISMO `id()`, porque el contenedor reutiliza la única instancia compartida — diagnostica confirmando que olvidar declarar el scope correcto para un bean que necesita estado nuevo por solicitud produce silenciosamente estado compartido entre operaciones que deberían ser independientes.

Para ver ambos scopes uno junto al otro, declara un segundo bean explícitamente `singleton` en la misma clase de configuración y expón los dos `id()` en el mismo endpoint de comparación, confirmando que solo el bean `prototype` cambia entre resoluciones.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un tercer bean con scope `singleton` explícito (redundante con el default) y confirma que el comportamiento no cambia frente a omitirlo.
2. Cambia `GeneradorReporte` de `prototype` a `singleton` y predice el resultado antes de ejecutar.
3. Clasifica tres beans reales de un proyecto (un repositorio, un contador global, un builder de un solo reporte) según el scope correcto para cada uno.
4. Escribe de memoria (sin mirar) dos beans con scopes distintos y el resultado esperado de resolverlos dos veces cada uno.

**Pista:** si un bean acumula estado que pertenece a una única operación (no compartido entre operaciones distintas), probablemente necesita `prototype`, no el `singleton` por defecto.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para que el bean se cree nuevo en cada solicitud:

```java
@Component
@Scope("____")
public class GeneradorReporte { /* ... */ }
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, dos beans (uno `singleton`, uno `prototype`) y traza a mano qué instancia devolvería cada uno tras dos resoluciones consecutivas. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya distingues los estereotipos de Spring, qué autoconfigura `spring-boot-starter-web`, y cómo elegir entre `singleton` y `prototype` según si el estado del bean debe compartirse o no entre operaciones. Esto cierra los fundamentos de IoC y DI; el siguiente módulo aplica estos conceptos a la configuración externa de la aplicación. **Evidencia:** entrega el resultado con los dos `id()` distintos del bean `prototype` y el mismo `id()` repetido tras quitar el scope. Fuente oficial: [Spring Framework — Bean scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html).

**Errores comunes:** asumir que todo bean es `singleton` sin considerar si acumula estado por operación; confundir `@Service` con una anotación funcionalmente distinta de `@Component` (solo `@Repository` agrega comportamiento real).

**Cuándo no usarlo:** para un valor inmutable sin ningún estado mutable entre resoluciones, discutir `singleton` vs `prototype` es irrelevante — ambos scopes producirían el mismo comportamiento observable.

---

Los estereotipos (`@Service`, `@Repository`, `@Controller`) que uses aquí son los que organizan las clases del proyecto integrador de este track (microservicio productivo, Módulo 12).

## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con genera `academia-spring` en `start.spring.io`, descomprímelo en una carpeta vacía y ejecuta `git init`. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Evidencia antes de avanzar |
|---|---|---|
| Base | API y configuración. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | datos, seguridad y mensajería. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | contratos, observabilidad y resiliencia. | Perfil o threat model, telemetría y runbook de recuperación. |

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

**Verificación:** el laboratorio se considera exitoso si el servicio y el repositorio se conectan correctamente por inyección de constructor, si el test unitario corre sin contenedor, y si el bean `prototype` produce una instancia distinta en cada resolución mientras el `singleton` reutiliza la misma.

**Errores comunes y soluciones**

- **Usar inyección por campo por costumbre.** Prefiere inyección por constructor para inmutabilidad y testabilidad sin contenedor.
- **Confundir `@Service` con una anotación funcionalmente distinta de `@Component`.** Solo `@Repository` agrega comportamiento funcional adicional (traducción de excepciones).
- **Asumir que todo bean es `singleton` sin evaluarlo.** Un bean que acumula estado por operación necesita `prototype` explícito.

---
