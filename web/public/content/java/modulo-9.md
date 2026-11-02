# Módulo 9: Testing con JUnit 5 y Mockito


## Aprende construyendo

### Tema 1: JUnit 5 — anotaciones y ciclo de vida · Básico · 45 min

**Prerrequisito:** Módulo 8 (Maven/Gradle); JDK 27, Maven 3.9+ y un editor. Verifica `java --version` y `mvn --version`.

**Al terminar podrás:** escribir tests con `@Test` y aserciones (incluidas `assertThrows`/`assertAll`), usar el ciclo de vida (`@BeforeEach`/`@AfterEach`/`@BeforeAll`/`@AfterAll`), y garantizar que dos pruebas no se contaminen por estado compartido ni dependan del orden.

#### Aprende

Una suite de pruebas de la calculadora de tarifas empieza a fallar de forma intermitente solo cuando se ejecuta la suite completa (nunca al correr un test aislado); la causa es un campo de instancia compartido entre pruebas que una prueba anterior deja en un estado que la siguiente no esperaba.

**¿Por qué es importante?** Porque sin `@BeforeEach` reiniciando el estado compartido, una prueba puede pasar o fallar según qué otra prueba se ejecutó antes, un tipo de fragilidad que solo se nota al correr la suite completa, nunca al correr una prueba aislada.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `@Test` y aserciones | Núcleo | `assertEquals` compara esperado vs real |
| ciclo de vida (`@BeforeEach`/`@AfterEach`) | Núcleo | se ejecutan antes/después de cada prueba |
| `@BeforeAll`/`@AfterAll` | Variante | configuración costosa una sola vez |
| instancia por prueba y `@TestInstance` | Diagnóstico | por defecto una instancia nueva por test |
| aislamiento e independencia del orden | Diagnóstico | una prueba no debe depender de otra |
| aserciones expresivas (`assertThrows`/`assertAll`) | Variante | verificar excepción y agrupar comprobaciones |

Cada fila tiene su explicación individual a continuación.

**`@Test` y aserciones (núcleo).** `@Test` marca un método como caso de prueba que el runner ejecuta de forma independiente. Dentro, las **aserciones** (`assertEquals(esperado, real)`, `assertTrue`, `assertNotNull`) comprueban el resultado y fallan con un mensaje que muestra qué se esperaba y qué se obtuvo. El orden en `assertEquals` es **esperado primero, real después**.

**Ciclo de vida `@BeforeEach`/`@AfterEach` (núcleo).** `@BeforeEach` corre **antes de cada** prueba (inicializa estado conocido); `@AfterEach` **después de cada** una (limpia recursos). Garantizan que cada prueba parta de un estado limpio sin depender de las anteriores.

**`@BeforeAll`/`@AfterAll` (variante).** Para configuración **costosa** que solo debe hacerse una vez por clase (abrir una conexión, levantar un contenedor), no en cada prueba. Son `static` por defecto (o requieren `@TestInstance(PER_CLASS)`). Úsalos solo cuando el costo lo justifique.

**Instancia por prueba y `@TestInstance` (diagnóstico).** Por defecto JUnit crea una **instancia nueva** de la clase de prueba para cada `@Test`, lo que aísla el estado automáticamente. Con `@TestInstance(Lifecycle.PER_CLASS)` se comparte una sola instancia, y entonces es `@BeforeEach` quien debe reiniciar los campos. Saber en qué modo estás explica por qué un campo "se contamina" entre pruebas.

**Aislamiento e independencia del orden (diagnóstico).** Cada prueba debe poder ejecutarse en **cualquier orden** sin afectar ni verse afectada por otras. Un fallo que solo aparece al correr la suite completa (no aislado) delata estado compartido no reiniciado. La solución es reiniciar el estado, nunca fijar un orden de ejecución.

**Aserciones expresivas (variante).** `assertThrows(Tipo.class, () -> ...)` verifica que un bloque **lanza** la excepción esperada y devuelve la instancia para inspeccionar su mensaje. `assertAll(...)` agrupa varias comprobaciones y **las ejecuta todas** aunque una falle, reportando todas las que fallaron a la vez (en vez de parar en la primera). Hacen las pruebas más precisas y legibles.

`@Test` marca un método como un caso de prueba ejecutable independientemente por el runner de JUnit 5, dentro del cual las aserciones (`assertEquals(5, new Calculadora().sumar(2, 3))`) verifican que el resultado real coincide con el resultado esperado, fallando la prueba con un mensaje descriptivo si no coinciden; `@BeforeEach` marca un método que se ejecuta automáticamente antes de cada prueba individual de la clase, apropiado para inicializar objetos compartidos en un estado conocido y limpio antes de cada prueba, evitando que el estado dejado por una prueba anterior afecte accidentalmente el resultado de la siguiente (cada prueba debe ser independiente y capaz de ejecutarse en cualquier orden sin afectar ni verse afectada por otras).

Este ciclo de vida (`@BeforeEach` antes de cada prueba, con `@AfterEach` como su contraparte de limpieza posterior, y `@BeforeAll`/`@AfterAll` para configuración costosa que solo debe ejecutarse una única vez para toda la clase de pruebas, no repetida en cada prueba individual) estructura de forma predecible cuándo exactamente se ejecuta cada pieza de configuración o limpieza en relación con las pruebas efectivas, garantizando aislamiento entre pruebas sucesivas. Con el ciclo de vida predeterminado, JUnit crea una instancia nueva de la clase para cada prueba; con `@TestInstance(Lifecycle.PER_CLASS)` comparte una única instancia, y entonces `@BeforeEach` es quien devuelve sus campos al estado inicial.

**Analogía:** `@BeforeEach` es como reiniciar completamente un escenario de laboratorio a su estado inicial conocido antes de cada experimento individual, garantizando que los resultados de un experimento no contaminen accidentalmente el siguiente experimento realizado en el mismo espacio.

**Conceptos clave:** `@Test`, `@BeforeEach`, aserciones.

**Implicación práctica:** El ciclo de vida de JUnit 5 garantiza aislamiento entre pruebas sucesivas, ejecutando configuración y limpieza en momentos predecibles relativos a cada prueba individual.

**Código del ejemplo:**

```java
class CalculadoraTest {
    @Test
    void sumaDosNumeros() {
        assertEquals(5, new Calculadora().sumar(2, 3));
    }
    @BeforeEach
    void setUp() { /* se ejecuta antes de cada test */ }
}
```

Cada prueba unitaria que escribas para el Proyecto integrador (Módulo 13) debe seguir este mismo ciclo de vida: sin `@BeforeEach` reiniciando el estado, las pruebas de un servicio con estado compartido empiezan a depender del orden de ejecución.

**Cuándo no usarlo:** para un método puro sin estado ni dependencias, `@BeforeEach` es innecesario; solo aporta valor cuando hay estado compartido real que reiniciar entre pruebas.

#### Practica

**Desde cero:** parte de una carpeta vacía y crea la estructura de un proyecto Maven sin usar el arquetipo antiguo:

```bash
mkdir ejemplo-junit-lifecycle
cd ejemplo-junit-lifecycle
mkdir -p src/main/java/academia/entregas
mkdir -p src/test/java/academia/entregas
```

**Crea** `pom.xml` con JUnit Jupiter y Surefire fijados por versión:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia.entregas</groupId>
  <artifactId>app</artifactId>
  <version>1.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>27</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.11.4</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.6.0</version>
      </plugin>
    </plugins>
  </build>
</project>
```

**Crea** `src/main/java/academia/entregas/Calculadora.java`:

```java
package academia.entregas;

public final class Calculadora {
    public int sumar(int a, int b) {
        return a + b;
    }
}
```

**Crea** `src/test/java/academia/entregas/CalculadoraTest.java`. `@TestInstance(PER_CLASS)` hace que ambas pruebas compartan la misma instancia; así el campo `acumulado` sí podría contaminar la segunda prueba si `@BeforeEach` no lo reiniciara:

```java
package academia.entregas;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;

import static org.junit.jupiter.api.Assertions.assertEquals;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class CalculadoraTest {
    private int acumulado;

    @BeforeEach
    void setUp() {
        acumulado = 0;
    }

    @Test
    void sumaDosNumeros() {
        assertEquals(5, new Calculadora().sumar(2, 3));
        acumulado += 5;
    }

    @Test
    void cadaPruebaParteDelMismoEstado() {
        assertEquals(0, acumulado);
        acumulado += 1;
    }
}
```

**Ejecuta el ejemplo:**

```bash
mvn -B test
```

**Resultado esperado:** `Tests run: 2, Failures: 0, Errors: 0, Skipped: 0` y `BUILD SUCCESS`. En Gradle, la tarea equivalente es `./gradlew test` sobre un proyecto Java configurado con JUnit Jupiter (Módulo 8, Tema 4).

**Fallo deliberado:** cambia el valor esperado de `assertEquals(5, ...)` a `assertEquals(6, ...)` y vuelve a ejecutar `mvn -B test`.

**Pista:** JUnit informa `AssertionFailedError: expected: <6> but was: <5>`, mostrando el valor esperado frente al obtenido y señalando `CalculadoraTest.sumaDosNumeros`. **Resultado esperado:** restaurar `5` vuelve la prueba a verde.

**Si falla.** Si Maven informa `Tests run: 0`, confirma que el archivo termina en `Test.java` y vive en `src/test/java`. Si no encuentra `Calculadora`, revisa que ambas clases declaren `package academia.entregas`. Si la segunda prueba no parte de cero, comprueba que `setUp()` tenga `@BeforeEach` y asigne `acumulado = 0`.

#### Aplica

Añade un tercer método de prueba que modifique `acumulado` y otra aserción que confirme que la siguiente prueba vuelve a partir del mismo estado inicial, sin depender del orden de ejecución.

**Checklist de salida.**

- [ ] `mvn -B test` ejecuta dos pruebas y termina en `BUILD SUCCESS`.
- [ ] `@BeforeEach` asigna el estado inicial antes de cada prueba.
- [ ] Las pruebas comparten una instancia gracias a `@TestInstance(PER_CLASS)`.
- [ ] La segunda prueba comprueba que `acumulado` empieza en cero.
- [ ] El valor esperado incorrecto produce `expected: <6> but was: <5>`.
- [ ] Restaurar la aserción correcta deja toda la suite en verde.

**Si falla.** Si el fallo aparece solo al ejecutar la suite completa, busca estado compartido que no se reinicia; no uses el orden de las pruebas como solución. Si una prueba pasa incluso con un resultado incorrecto, revisa que la aserción compare el valor esperado con el valor real.

Guarda el archivo de test, la salida verde y el fallo provocado con su corrección; como siguiente paso aísla una dependencia externa con Mockito.

**Errores comunes:** compartir estado mutable entre pruebas sin reiniciarlo en `@BeforeEach`, escribir aserciones débiles que pasan incluso con un resultado incorrecto, y depender del orden de ejecución entre pruebas que deberían ser independientes.

**Fuentes oficiales revisadas el 2026-11-01:** [JUnit 5 — User Guide](https://junit.org/junit5/docs/current/user-guide/) y [`Assertions` (JUnit Jupiter API)](https://junit.org/junit5/docs/current/api/org.junit.jupiter.api/org/junit/jupiter/api/Assertions.html).

---

### Tema 2: Mockito — aislar dependencias · Intermedio · 50 min

**Prerrequisito:** Tema 1 de este módulo (JUnit 5); JDK 27, Maven 3.9+ y un editor. Verifica `java --version` y `mvn --version`.

**Al terminar podrás:** sustituir una dependencia real por un mock (`@Mock`/`@InjectMocks`), configurar stubs (`when`/`thenReturn`/`thenThrow`), verificar interacciones (`verify`) con argument matchers, y decidir qué no mockear.

#### Aprende

Probar `ServicioPedidos.crear(...)` contra una base de datos real hace la suite lenta y frágil (depende de que la base esté disponible y en un estado conocido); la lógica de negocio que decide si un pedido es válido no necesita una base de datos real para verificarse, solo necesita que `RepositorioPedidos` responda de forma controlada.

**¿Por qué es importante?** Mockear dependencias externas aísla la prueba de infraestructura real (bases de datos, servicios externos), haciendo la prueba más rápida, determinista y confiable, sin depender de la disponibilidad o el estado de sistemas externos.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| mock frente a dependencia real | Núcleo | el repositorio simulado no toca la base de datos |
| `@Mock`/`@InjectMocks` | Núcleo | crear el mock e inyectarlo en el servicio |
| stub: `when(...).thenReturn(...)` | Núcleo | controlar qué devuelve el mock |
| `verify` sobre interacción | Diagnóstico | confirmar que el servicio llamó al mock |
| argument matchers (`any`/`eq`) | Variante | igualar argumentos sin valores exactos |
| `thenThrow` para simular fallos | Variante | probar la ruta de error del servicio |
| cuándo NO mockear | Decisión | un objeto de valor real es más simple |

Cada fila tiene su explicación individual a continuación.

**Mock frente a dependencia real (núcleo).** Un **mock** es un objeto simulado que reemplaza una dependencia real (un repositorio con base de datos) cuyo comportamiento controlas desde la prueba. Aísla la **lógica de negocio** del servicio de la infraestructura: la prueba corre en milisegundos, es determinista y no depende de que la base esté disponible.

**`@Mock`/`@InjectMocks` (núcleo).** Con `@ExtendWith(MockitoExtension.class)`, `@Mock RepositorioPedidos repo` crea el mock y `@InjectMocks ServicioPedidos servicio` lo inyecta en una instancia **real** del servicio bajo prueba (por constructor). Así pruebas el servicio de verdad con una dependencia falsa.

**Stub: `when(...).thenReturn(...)` (núcleo).** Un **stub** configura qué devuelve el mock ante una llamada: `when(repo.guardar(any())).thenReturn(new Pedido(1))`. Controlas la "respuesta" que recibe el servicio sin una implementación real. Solo stubea lo que la prueba necesita.

**`verify` sobre interacción (diagnóstico).** `verify(repo).guardar(any())` no configura nada: **comprueba** que el servicio efectivamente invocó ese método durante la prueba. Es una aserción sobre **comportamiento** (que la delegación ocurrió), complementaria a la aserción sobre el valor de retorno. Puedes verificar veces (`times(2)`, `never()`).

**Argument matchers (`any`/`eq`) (variante).** Cuando no quieres fijar el valor exacto del argumento, usas matchers: `any()`, `anyString()`, `eq(valor)`. Regla: si usas un matcher en un argumento, **todos** los argumentos de esa llamada deben ser matchers (mezclar un valor literal con un matcher es un error común).

**`thenThrow` para simular fallos (variante).** `when(repo.guardar(any())).thenThrow(new RuntimeException(...))` hace que el mock **lance** una excepción, para probar la ruta de error del servicio (reintento, traducción a error de dominio) sin provocar un fallo real de infraestructura.

**Cuándo NO mockear (decisión).** No mockees un objeto de **valor** simple (un `record` inmutable sin efectos): usar el real es más claro. Mockea en las **fronteras** (repositorios, clientes HTTP, relojes), no la lógica pura. Sobre-mockear acopla la prueba a la implementación y la vuelve frágil.

Mockito permite reemplazar las dependencias reales de la clase bajo prueba por objetos simulados (mocks) cuyo comportamiento se controla completamente desde la propia prueba: `@Mock RepositorioPedidos repositorio; @InjectMocks ServicioPedidos servicio;` crea un mock de `RepositorioPedidos` y lo inyecta automáticamente en una instancia real de `ServicioPedidos`, permitiendo probar la lógica de negocio de `ServicioPedidos` de forma completamente aislada, sin depender de una base de datos real ni de ninguna otra infraestructura externa que `RepositorioPedidos` normalmente requeriría en producción.

`when(repositorio.guardar(any())).thenReturn(new Pedido(1))` configura el comportamiento simulado del mock (stub): cuando se invoque `guardar` con cualquier argumento, devolver ese `Pedido` específico, permitiendo controlar exactamente qué "respuesta" simulada recibe el servicio bajo prueba sin necesidad de una implementación real de persistencia. `verify(repositorio).guardar(any())`, en cambio, no configura comportamiento sino que verifica una interacción ya ocurrida: confirma que el servicio efectivamente invocó ese método del mock durante la ejecución de la prueba, una aserción sobre comportamiento (que cierta interacción ocurrió) en vez de sobre un valor de retorno, útil para verificar que el servicio realmente delega correctamente en su dependencia, no solo que produce el resultado correcto por alguna otra vía inesperada.

**Analogía:** un mock es como un actor de reparto que sigue exactamente el guion que se le indica para esta representación específica (el `when`), permitiendo ensayar la actuación del protagonista (el servicio bajo prueba) sin necesidad de que el elenco de reparto completo real esté disponible; `verify` es como confirmar después de la representación que el protagonista efectivamente interactuó con ese actor de reparto en el momento esperado del guion, no solo que la obra terminó bien por alguna otra razón.

**Conceptos clave:** `@Mock`, `@InjectMocks`, `when`/`verify`.

**Implicación práctica:** Mockear las dependencias externas permite probar la lógica de negocio en aislamiento, rápido y de forma determinista, sin depender de la disponibilidad ni el estado de una base de datos u otro servicio real.

**Código del ejemplo:**

```java
@ExtendWith(MockitoExtension.class)
class ServicioPedidosTest {
    @Mock RepositorioPedidos repositorio;
    @InjectMocks ServicioPedidos servicio;

    @Test
    void creaUnPedido() {
        when(repositorio.guardar(any())).thenReturn(new Pedido(1));
        Pedido resultado = servicio.crear(new Pedido(null));
        assertEquals(Integer.valueOf(1), resultado.id());
        verify(repositorio).guardar(any()); // confirma que se llamó al repositorio
    }
}
```

Aislar dependencias con mocks es lo que permite que la suite de pruebas del Proyecto integrador (Módulo 13) corra en segundos, sin levantar la base de datos real cada vez.

**Cuándo no usarlo:** si la dependencia es un objeto de valor simple (por ejemplo un `record` inmutable sin efectos secundarios), usar el objeto real es más simple y claro que mockearlo.

#### Practica

**Desde cero:** parte de una carpeta vacía y crea la estructura del proyecto:

```bash
mkdir ejemplo-mockito-repositorio
cd ejemplo-mockito-repositorio
mkdir -p src/main/java/academia/entregas
mkdir -p src/test/java/academia/entregas
```

**Crea** `pom.xml` con JUnit y la integración de Mockito para Jupiter:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia.entregas</groupId>
  <artifactId>app</artifactId>
  <version>1.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>27</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.11.4</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.mockito</groupId>
      <artifactId>mockito-junit-jupiter</artifactId>
      <version>5.24.0</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.6.0</version>
      </plugin>
    </plugins>
  </build>
</project>
```

**Crea** `src/main/java/academia/entregas/ServicioPedidos.java`. El servicio real recibe la interfaz por constructor; la prueba decidirá si inyecta una implementación real o un mock:

```java
package academia.entregas;

record Pedido(Integer id) {
}

interface RepositorioPedidos {
    Pedido guardar(Pedido pedido);
}

public final class ServicioPedidos {
    private final RepositorioPedidos repositorio;

    public ServicioPedidos(RepositorioPedidos repositorio) {
        this.repositorio = repositorio;
    }

    public Pedido crear(Pedido pedido) {
        return repositorio.guardar(pedido);
    }
}
```

**Crea** `src/test/java/academia/entregas/ServicioPedidosTest.java`:

```java
package academia.entregas;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ServicioPedidosTest {
    @Mock
    RepositorioPedidos repositorio;

    @InjectMocks
    ServicioPedidos servicio;

    @Test
    void creaUnPedido() {
        when(repositorio.guardar(any())).thenReturn(new Pedido(1));

        Pedido resultado = servicio.crear(new Pedido(null));

        assertEquals(Integer.valueOf(1), resultado.id());
        verify(repositorio).guardar(any());
    }
}
```

**Ejecuta el ejemplo:**

```bash
mvn -B test
```

**Resultado esperado:** `Tests run: 1, Failures: 0, Errors: 0, Skipped: 0` y `BUILD SUCCESS`, sin base de datos ni otro proceso externo. En JDK actuales Mockito puede mostrar un aviso sobre `self-attaching` y la carga dinámica de su agente; ese aviso no es un fallo de la prueba.

**Fallo deliberado:** comenta o elimina la línea `when(repositorio.guardar(any())).thenReturn(new Pedido(1))` y ejecuta la prueba de nuevo.

**Pista:** el mock devuelve `null` por defecto y el test falla con `NullPointerException: Cannot invoke "academia.entregas.Pedido.id()" because "resultado" is null`; el stack trace apunta a la lectura de `resultado.id()`. **Resultado esperado:** restaurar el `when(...)` corrige el fallo.

**Si falla.** Si `servicio` es `null`, revisa `@ExtendWith(MockitoExtension.class)` y `@InjectMocks`. Si el repositorio no recibe la llamada esperada, comprueba que el servicio invoque `guardar` en la misma instancia inyectada. Si aparece el aviso del agente pero la consola termina en `BUILD SUCCESS`, no lo trates como un error de compilación ni de aserción.

#### Aplica

Agrega una segunda dependencia mockeada (por ejemplo un servicio de notificaciones), haz que `ServicioPedidos` la reciba también por constructor y escribe un `verify(notificador, times(1))` que confirme que se llamó exactamente una vez.

**Checklist de salida.**

- [ ] `mvn -B test` ejecuta una prueba sin infraestructura externa.
- [ ] `@Mock` sustituye el repositorio y `@InjectMocks` crea el servicio real.
- [ ] `when(...).thenReturn(...)` fija el pedido devuelto.
- [ ] `verify(...)` confirma la interacción con el repositorio.
- [ ] Sin el stub, la prueba falla porque `resultado` es `null`.
- [ ] La dependencia de notificaciones se verifica con `times(1)`.

**Si falla.** Si el mock devuelve `null`, falta el stub o sus argumentos no coinciden con la llamada real. Si `verify` falla, lee cuántas invocaciones encontró y con qué argumentos antes de cambiar la aserción. No mockees `ServicioPedidos`: esa es la clase cuya lógica quieres probar.

Guarda el test, el fallo de `NullPointerException` provocado y su corrección; como siguiente paso cubre varios casos con tests parametrizados.

**Errores comunes:** mockear la clase bajo prueba en vez de sus dependencias (deja de probar código real), confundir `when` (configurar comportamiento) con `verify` (comprobar que una interacción ocurrió), y mockear un objeto de valor simple que sería más claro usar real.

**Fuentes oficiales revisadas el 2026-11-01:** [Mockito — documentación oficial](https://site.mockito.org/) y [Mockito — `MockitoExtension`](https://javadoc.io/doc/org.mockito/mockito-junit-jupiter/latest/org/mockito/junit/jupiter/MockitoExtension.html).

---

### Tema 3: Tests parametrizados y cobertura · Intermedio · 50 min

**Prerrequisito:** Temas 1–2 de este módulo; JDK 27, Maven 3.9+ y un editor. Verifica `java --version` y `mvn --version`.

**Al terminar podrás:** escribir pruebas parametrizadas (`@ValueSource`/`@CsvSource`/`@MethodSource`), medir cobertura de líneas y ramas con JaCoCo, explicar qué no mide la cobertura, y usar aserciones fluidas.

#### Aprende

Verificar una función como "es Fibonacci" para cinco valores distintos copiando y pegando el mismo cuerpo de prueba cinco veces (cambiando solo el número) duplica la lógica de verificación; y sin un reporte de cobertura, nadie nota que una rama específica del código (por ejemplo, el caso de un número negativo) nunca se ejecutó en ninguna prueba.

**¿Por qué es importante?** Los tests parametrizados evitan duplicar el mismo cuerpo de prueba para múltiples casos de datos; JaCoCo identifica visualmente qué partes del código de producción carecen de cobertura de pruebas, señalando riesgos potenciales no verificados.

**Mapa de subtemas críticos**

| Subtema | Papel | Evidencia del tema |
|---|---|---|
| `@ParameterizedTest` + `@ValueSource` | Núcleo | una prueba corre una vez por valor |
| `@CsvSource` (varios parámetros) | Variante | entrada→salida esperada por fila |
| `@MethodSource` (datos complejos) | Variante | generar casos desde un método propio |
| cobertura de líneas y ramas (JaCoCo) | Núcleo | reporte que marca lo no ejecutado |
| qué NO mide la cobertura | Límite | 100% de líneas no prueba corrección |
| aserciones fluidas (AssertJ) | Variante | `assertThat(x).isEqualTo(y)` legible |

Cada fila tiene su explicación individual a continuación.

**`@ParameterizedTest` + `@ValueSource` (núcleo).** Reemplaza copiar el mismo test con distintos valores: `@ParameterizedTest @ValueSource(ints = {1,2,3,5,8}) void esFibonacci(int n)` ejecuta el cuerpo **una vez por valor**, cada uno como un caso independiente que pasa o falla por separado. Evita duplicar la lógica de verificación.

**`@CsvSource` (variante).** Para métodos con **más de un parámetro**: cada fila CSV aporta una tupla entrada→salida esperada (`@CsvSource({"2,3,5", "10,5,15"})` → `a,b,esperado`). Ideal para tablas de casos de un cálculo.

**`@MethodSource` (variante).** Cuando los datos son **demasiado complejos** para una anotación (objetos, colecciones), un método propio `static Stream<Arguments>` los genera. Da toda la potencia de Java para construir los casos.

**Cobertura de líneas y ramas con JaCoCo (núcleo).** JaCoCo mide qué **porcentaje** del código de producción ejecutó la suite: líneas y, mejor aún, **ramas** (cada lado de un `if`). `mvn test jacoco:report` genera un HTML que resalta en rojo lo no ejecutado, señalando dónde falta prueba (p. ej. el caso de un número negativo que nadie probó).

**Qué NO mide la cobertura (límite).** La cobertura mide qué se **ejecutó**, no si se **verificó** correctamente: puedes tener 100% de líneas con aserciones vacías o débiles y aun así no probar nada. Es una señal de **huecos** (lo que falta cubrir), no una prueba de corrección. No la persigas como número; úsala para encontrar ramas sin probar.

**Aserciones fluidas (AssertJ) (variante).** `assertThat(resultado).isEqualTo(5)` (AssertJ) o Hamcrest ofrecen una sintaxis encadenada más legible y mensajes de fallo más ricos que las aserciones básicas, sobre todo para colecciones y objetos complejos (`assertThat(lista).contains(...).hasSize(3)`). Son opcionales pero mejoran la expresividad.

`@ParameterizedTest @ValueSource(ints = {1, 2, 3, 5, 8}) void esFibonacci(int numero) { assertTrue(Fibonacci.esFibonacci(numero)); }` ejecuta la misma lógica de prueba una vez por cada valor proporcionado en la fuente de datos, evitando duplicar manualmente el mismo cuerpo de prueba una vez por cada caso individual que se desea verificar; `@CsvSource` permite proporcionar conjuntos de valores múltiples por ejecución (para probar métodos con más de un parámetro), y `@MethodSource` permite generar la fuente de datos mediante un método propio cuando los valores necesarios son demasiado complejos para expresarse directamente como una anotación simple; `@TestFactory` habilita la generación dinámica y programática de un conjunto variable de pruebas en tiempo de ejecución, para casos donde ni siquiera el número de pruebas necesarias se conoce de antemano de forma estática.

JaCoCo mide cobertura de código: qué porcentaje de líneas (y opcionalmente de ramas condicionales específicas, como cada lado de un `if`) del código de producción efectivamente se ejecutó durante la suite de pruebas completa, generado con `mvn test jacoco:report` como un reporte HTML navegable que resalta visualmente qué líneas específicas del código nunca se ejecutaron durante ninguna prueba, señalando directamente qué partes del código carecen de cobertura de pruebas y podrían albergar bugs no detectados por la suite actual; AssertJ (`assertThat(resultado).isEqualTo(5)`) y Hamcrest son librerías de aserciones fluidas alternativas a las aserciones básicas de JUnit, ofreciendo mensajes de fallo más descriptivos y una sintaxis más legible encadenada para verificaciones complejas.

**Analogía:** un test parametrizado es como verificar la misma receta de cocina con distintos ingredientes de entrada, confirmando que produce el resultado esperado en cada caso sin tener que reescribir el procedimiento completo de verificación para cada ingrediente distinto; un reporte de cobertura es como un mapa de calor que señala exactamente qué áreas de una ciudad nunca han sido patrulladas por ninguna ronda de inspección, indicando dónde podrían existir problemas no detectados simplemente porque nadie ha verificado esa zona específica todavía.

**Conceptos clave:** una única prueba con múltiples conjuntos de datos, `@CsvSource`/`@MethodSource`, cobertura de líneas/ramas.

**Implicación práctica:** Un test parametrizado evita duplicar la misma lógica de verificación por cada caso de entrada, y un reporte de cobertura señala exactamente qué rama del código de producción ninguna prueba ejercita todavía, un riesgo invisible sin esa medición.

**Código del ejemplo:**

```java
@ParameterizedTest
@ValueSource(ints = {1, 2, 3, 5, 8})
void esFibonacci(int numero) {
    assertTrue(Fibonacci.esFibonacci(numero));
}
```
```bash
mvn test jacoco:report   # genera un reporte HTML con líneas/ramas cubiertas
```

El reporte de cobertura del Proyecto integrador (Módulo 13) debe revisarse antes de cada entrega: una rama sin cubrir en la lógica de tarifas es un bug potencial no detectado.

**Cuándo no usarlo:** perseguir 100% de cobertura en código trivial (getters, setters) desperdicia tiempo; prioriza cobertura en la lógica de negocio con riesgo real.

#### Practica

**Desde cero:** parte de una carpeta vacía y crea la estructura del proyecto:

```bash
mkdir ejemplo-parametrizado-cobertura
cd ejemplo-parametrizado-cobertura
mkdir -p src/main/java/academia/entregas
mkdir -p src/test/java/academia/entregas
```

**Crea** `pom.xml`. La ejecución `prepare-agent` es necesaria para que JaCoCo recoja datos durante `mvn test`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>academia.entregas</groupId>
  <artifactId>app</artifactId>
  <version>1.0-SNAPSHOT</version>
  <properties>
    <maven.compiler.release>27</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>
  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>5.11.4</version>
      <scope>test</scope>
    </dependency>
  </dependencies>
  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.6.0</version>
      </plugin>
      <plugin>
        <groupId>org.jacoco</groupId>
        <artifactId>jacoco-maven-plugin</artifactId>
        <version>0.8.16</version>
        <executions>
          <execution>
            <goals>
              <goal>prepare-agent</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>
</project>
```

**Crea** `src/main/java/academia/entregas/Fibonacci.java`. La primera condición rechaza negativos; el `while` avanza por la sucesión hasta alcanzar o superar el número:

```java
package academia.entregas;

public final class Fibonacci {
    private Fibonacci() {
    }

    public static boolean esFibonacci(int numero) {
        if (numero < 0) {
            return false;
        }
        int anterior = 0;
        int actual = 1;
        while (anterior < numero) {
            int siguiente = anterior + actual;
            anterior = actual;
            actual = siguiente;
        }
        return anterior == numero;
    }
}
```

**Crea** `src/test/java/academia/entregas/FibonacciTest.java`:

```java
package academia.entregas;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertTrue;

class FibonacciTest {
    @ParameterizedTest
    @ValueSource(ints = {1, 2, 3, 5, 8})
    void esFibonacci(int numero) {
        assertTrue(Fibonacci.esFibonacci(numero));
    }
}
```

**Ejecuta el ejemplo y genera el reporte:**

```bash
mvn -B test jacoco:report
```

**Resultado esperado:** la consola informa `Tests run: 5, Failures: 0, Errors: 0, Skipped: 0` y `BUILD SUCCESS`; JaCoCo analiza una clase y crea `target/site/jacoco/index.html`. Abre ese archivo y entra en `Fibonacci.esFibonacci`: la suite todavía no ejercita la rama que rechaza un negativo ni el resultado falso para un positivo que no pertenece a la sucesión. En Gradle, con el plugin `jacoco`, las tareas equivalentes son `./gradlew test jacocoTestReport`.

**Fallo deliberado:** agrega el valor `4` a `@ValueSource(ints = {1, 2, 3, 5, 8})` para obtener `{1, 2, 3, 4, 5, 8}` y ejecuta `mvn -B test`.

**Pista:** `4` no es un número de Fibonacci, así que JUnit ejecuta seis casos y falla solo en `esFibonacci(int)[4]` con `AssertionFailedError: expected: <true> but was: <false>`. El identificador `[4]` señala el índice del parámetro que rompió la aserción, no un fallo genérico de toda la fuente. **Resultado esperado:** quitar el `4` deja la suite en verde de nuevo.

**Si falla.** Si JaCoCo informa que no hay datos de ejecución, confirma la ejecución `prepare-agent` en el POM y ejecuta `test` antes de `jacoco:report`. Si el reporte no aparece en `target/site/jacoco`, revisa que estés ejecutando Maven desde la carpeta que contiene el `pom.xml`. Si no cambia tras editar una prueba, ejecuta `mvn clean test jacoco:report` para descartar datos de una corrida anterior.

#### Aplica

Convierte el test a `@MethodSource` con un método que genere los mismos casos programáticamente, y agrega una prueba para un número negativo que verifique que `Fibonacci.esFibonacci` devuelve `false`; compara el reporte para confirmar que esa rama queda cubierta.

**Checklist de salida.**

- [ ] Una única prueba parametrizada ejecuta cinco casos.
- [ ] `mvn -B test jacoco:report` termina en `BUILD SUCCESS`.
- [ ] El reporte existe en `target/site/jacoco/index.html`.
- [ ] Identificas la rama de negativos inicialmente sin cubrir.
- [ ] El caso `4` falla individualmente como `esFibonacci(int)[4]`.
- [ ] La prueba negativa agregada en la práctica cubre esa rama.

**Si falla.** Si `@MethodSource` no encuentra el método, comprueba que sea `static`, no reciba argumentos y devuelva un `Stream`, `Iterable` o arreglo de valores. Si un porcentaje alto de cobertura te lleva a ignorar una rama de negocio, revisa la rama concreta en el HTML: el porcentaje agregado no demuestra que cada decisión esté probada.

Guarda el test, el reporte HTML de JaCoCo antes y después de quitar el caso, y la explicación de qué rama quedó sin cubrir; como siguiente paso conecta la suite a CI.

**Errores comunes:** duplicar el mismo cuerpo de prueba por cada caso en vez de usar `@ParameterizedTest`, perseguir 100% de cobertura en código trivial (getters/setters) sin evaluar el riesgo real de cada rama, y tratar un alto porcentaje de cobertura como sinónimo de "bien probado" sin revisar la calidad de las aserciones.

**Fuentes oficiales revisadas el 2026-11-01:** [JUnit 5 — Parameterized Tests](https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests), [JaCoCo — documentación](https://www.jacoco.org/jacoco/trunk/doc/) y [AssertJ — core](https://assertj.github.io/doc/).

---

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir una suite de pruebas unitarias con mocks para un servicio con dependencias externas, incluyendo tests parametrizados y cobertura.

**Requisitos previos:** Módulos 0-8 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir un test básico con `@Test` | Ver Tema 1 | Con una aserción simple |
| 2 | Usar `@BeforeEach` para estado compartido | Ver Tema 1 | Verifica el aislamiento entre pruebas |
| 3 | Mockear una dependencia con Mockito | Ver Tema 2 | `when` + `verify` |
| 4 | Escribir un test parametrizado con 5 casos | Ver Tema 3 | `@ParameterizedTest` |
| 5 | Generar un reporte de cobertura con JaCoCo | Ver Tema 3 | Identifica una rama sin probar |

**Verificación:** el laboratorio se considera exitoso si la suite de pruebas se ejecuta sin depender de ninguna infraestructura externa real, y si el reporte de JaCoCo identifica al menos una rama de código específica que carece de cobertura, corregida posteriormente con una prueba adicional.

**Errores comunes y soluciones**

- **Compartir estado mutable entre pruebas sin `@BeforeEach`.** Reinicia el estado compartido antes de cada prueba individual.
- **Confundir un stub (`when`) con una verificación (`verify`).** `when` configura comportamiento simulado; `verify` confirma que una interacción efectivamente ocurrió.
- **Duplicar el mismo cuerpo de prueba para múltiples casos de datos.** Usa `@ParameterizedTest` para evitar esa duplicación.

---
