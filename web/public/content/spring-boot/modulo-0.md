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

En el tema anterior, `ServicioEnvios` recibió el repositorio por su constructor. Aquí compararás esa forma con un campo `@Autowired` y comprobarás qué aprende cada tipo de prueba. Necesitas el proyecto y los archivos del Tema 1.

**¿Por qué es importante?** Una dependencia obligatoria debe estar lista al crear el servicio. La forma de recibirla afecta qué puede garantizar Java y qué tiene que preparar cada prueba.

#### Subtema 2.1: Prueba la regla sin iniciar Spring · 10 min

**1. Contexto**

Si solo quieres comprobar qué devuelve el servicio, puedes pasarle una implementación falsa del repositorio. No necesitas arrancar el contenedor.

**2. Hazlo tú**

Crea `src/test/java/com/example/demo/ServicioEnviosTest.java`:

```java
package com.example.demo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class ServicioEnviosTest {
    @Test
    void consultaElEstadoDelRepositorio() {
        RepositorioEnvios falso = codigo -> "Preparando: " + codigo;
        ServicioEnvios servicio = new ServicioEnvios(falso);

        assertEquals("Preparando: RF-42", servicio.consultar("RF-42"));
    }
}
```

Desde la raíz del proyecto, ejecuta:

```bash
./mvnw -Dtest=ServicioEnviosTest test
```

En PowerShell, usa `./mvnw.cmd -Dtest=ServicioEnviosTest test`.

**Resultado esperado:** Maven termina en `BUILD SUCCESS` y el test queda en verde.

**Fallo deliberado:** cambia el esperado a `Entregado: RF-42`. **Diagnóstico:** el test informa que recibió `Preparando: RF-42`; el servicio está usando el resultado del repositorio falso. Restaura el valor esperado.

**3. Entiende**

El constructor obliga a entregar `RepositorioEnvios` cuando se crea `ServicioEnvios`. El test usa `new` porque está probando esa clase directamente; no necesita que Spring cree el servicio.

**4. Cierra**

Guarda el test y explica qué resultado controla el repositorio falso. El siguiente subtema usará Spring para crear una variante con inyección por campo.

#### Subtema 2.2: Observa la inyección de campo con el contexto · 10 min

**1. Contexto**

Un campo `@Autowired` se completa cuando Spring crea el bean. Para comprobar esa conexión, la prueba sí debe iniciar el contexto de la aplicación.

**2. Hazlo tú**

Crea `src/main/java/com/example/demo/ServicioEnviosCampo.java`:

```java
package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ServicioEnviosCampo {
    @Autowired
    private RepositorioEnvios repositorio;

    public String consultar(String codigo) {
        return repositorio.buscarEstado(codigo);
    }
}
```

Crea `src/test/java/com/example/demo/ServicioEnviosCampoTest.java`:

```java
package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class ServicioEnviosCampoTest {
    @Autowired
    private ServicioEnviosCampo servicio;

    @Test
    void springConectaElRepositorioAlServicio() {
        assertEquals("En ruta: RF-42", servicio.consultar("RF-42"));
    }
}
```

Ejecuta:

```bash
./mvnw -Dtest=ServicioEnviosCampoTest test
```

**Resultado esperado:** el test pasa. A diferencia del test anterior, `@SpringBootTest` inicia Spring para crear el servicio y asignar el repositorio.

**Fallo deliberado:** quita `@Autowired` del campo y ejecuta el test. **Diagnóstico:** al llamar `consultar`, el campo sigue `null` y aparece `NullPointerException`; restáuralo para que Spring lo asigne.

**3. Entiende**

La inyección por campo funciona, pero Java no obliga a asignar el campo y no puede ser `final`. También oculta una dependencia obligatoria. Puedes probarla sin contexto usando otras técnicas, pero este ejemplo usa el contexto porque quiere verificar que Spring conecte los beans.

**4. Cierra**

Anota cuál de los dos tests arranca el contexto y qué comportamiento verifica. El último paso te ayudará a elegir la prueba según la pregunta.

#### Subtema 2.3: Elige la prueba que responde tu pregunta · 10 min

**1. Contexto**

Un test puede comprobar una regla de una clase o comprobar además que Spring detecta y conecta los beans. Son preguntas diferentes.

**2. Hazlo tú**

Ejecuta por separado `src/test/java/com/example/demo/ServicioEnviosTest.java` y `src/test/java/com/example/demo/ServicioEnviosCampoTest.java` desde la raíz del proyecto:

```bash
./mvnw -Dtest=ServicioEnviosTest test
./mvnw -Dtest=ServicioEnviosCampoTest test
```

**Resultado esperado:** ambos terminan en `BUILD SUCCESS`; el primero crea su servicio directamente y el segundo carga el contexto Spring.

**Fallo deliberado:** quita `@Service` de `ServicioEnviosCampo` y ejecuta el segundo test. **Diagnóstico:** Spring no puede inyectar ese bean en la prueba; restaura `@Service`. El test unitario de constructor debe seguir pasando, porque no depende del registro del bean.

**3. Entiende**

Para una regla de negocio simple, el constructor facilita un test rápido con una dependencia falsa. Usa `@SpringBootTest` cuando la pregunta incluya configuración, escaneo o conexión entre beans. Los campos se pueden probar sin contexto mediante Mockito, setters o reflexión; por eso no es correcto decir que la inyección por campo vuelve imposible el test unitario. El equipo de Spring recomienda constructor para dependencias requeridas: permite campos `final` y evita que el objeto se cree incompleto.

```text
┌── Test unitario ──────────┐   ┌── Test de contexto ──────┐
│ test → servicio → falso   │   │ test → Spring → servicio │
│ sin crear el contenedor   │   │        → repositorio     │
└───────────────────────────┘   └─────────────────────────┘
```

**4. Cierra**

**Práctica independiente:** modifica la respuesta del repositorio falso y actualiza el test unitario. Después registra cuál de las dos pruebas ejecutaste y qué demuestra cada una. En el proyecto integrador, usa pruebas unitarias para reglas del servicio y una prueba con contexto cuando necesites verificar el cableado. El siguiente tema separa los estereotipos de Spring y las funciones que trae cada starter.

**Fuentes primarias:** [inyección de dependencias en Spring Boot](https://docs.spring.io/spring-boot/reference/using/spring-beans-and-dependency-injection.html), [pruebas de aplicaciones Spring Boot](https://docs.spring.io/spring-boot/reference/testing/spring-boot-applications.html), [inyección de dependencias en Spring Framework](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html).

**Decisión práctica:** prefiere constructor para dependencias obligatorias. La inyección por campo no es imposible ni está prohibida; el constructor hace visibles los requisitos y deja que el compilador proteja la referencia con `final`.

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
