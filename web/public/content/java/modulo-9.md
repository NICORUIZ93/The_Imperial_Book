# Módulo 9: Testing con JUnit 5 y Mockito


## Aprende construyendo

### Tema 1: JUnit 5 — anotaciones y ciclo de vida

#### Paso 1 · Objetivo y preparación
Al finalizar podrás escribir un test con `@Test`/`@BeforeEach` y garantizar que dos pruebas de la misma clase no se contaminen entre sí por estado compartido. Prerrequisitos: JDK 25, Maven y un editor. Verifica java --version y mvn --version.

#### Paso 2 · Contexto y caso real
Una suite de pruebas de la calculadora de tarifas empieza a fallar de forma intermitente solo cuando se ejecuta la suite completa (nunca al correr un test aislado); la causa es un campo de instancia compartido entre pruebas que una prueba anterior deja en un estado que la siguiente no esperaba.

#### Paso 3 · Teoría, modelo mental y analogía
JUnit 5 ejecuta `@BeforeEach` automáticamente antes de cada `@Test` de la clase, reiniciando el estado a un punto conocido sin que el desarrollador tenga que recordar hacerlo manualmente al principio de cada prueba. La analogía: reiniciar completamente un escenario de laboratorio antes de cada experimento individual, para que el resultado de uno no contamine al siguiente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-junit-lifecycle
cd ejemplo-junit-lifecycle
mvn -q archetype:generate -DgroupId=academia.entregas -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app
mvn test          # Maven
./gradlew test    # Gradle (equivalente; genera el proyecto con `gradle init --type java-application --dsl kotlin --test-framework junit-jupiter`)
```
Crea `src/test/java/academia/entregas/CalculadoraTest.java` con un `@Test` que llame `assertEquals(5, new Calculadora().sumar(2, 3))` y un `@BeforeEach` que reinicie el estado; ejecuta `mvn test`.

#### Paso 5 · Práctica guiada
Pista: cambia deliberadamente el valor esperado en `assertEquals` (por ejemplo a 6) para provocar un fallo deliberado; lee el mensaje de JUnit, que muestra el valor esperado frente al obtenido. Resultado esperado: restaurar el valor correcto vuelve la prueba a verde.

#### Paso 6 · Práctica independiente
Añade un segundo método de prueba que comparta estado con el primero a través de un campo de instancia, y comprueba con `@BeforeEach` que ambos parten del mismo estado inicial sin importar el orden de ejecución.

#### Paso 7 · Cierre y evidencia
Guarda el archivo de test, la salida verde y el fallo provocado con su corrección; como siguiente paso aísla una dependencia externa con Mockito. Errores comunes: compartir estado mutable entre pruebas sin reiniciarlo en `@BeforeEach`, escribir aserciones débiles que pasan incluso con un resultado incorrecto, y depender del orden de ejecución entre pruebas que deberían ser independientes. Fuentes oficiales: https://junit.org/junit5/docs/current/user-guide/.
**¿Por qué es importante?** Porque sin `@BeforeEach` reiniciando el estado compartido, una prueba puede pasar o fallar según qué otra prueba se ejecutó antes, un tipo de fragilidad que solo se nota al correr la suite completa, nunca al correr una prueba aislada.
**Evidencia de aprendizaje:** entrega el test con `@Test`/`@BeforeEach`, el fallo provocado al cambiar el valor esperado, y su corrección.
**Conceptos clave:** `@Test`, `@BeforeEach`, aserciones.

`@Test` marca un método como un caso de prueba ejecutable independientemente por el runner de JUnit 5, dentro del cual las aserciones (`assertEquals(5, new Calculadora().sumar(2, 3))`) verifican que el resultado real coincide con el resultado esperado, fallando la prueba con un mensaje descriptivo si no coinciden; `@BeforeEach` marca un método que se ejecuta automáticamente antes de cada prueba individual de la clase, apropiado para inicializar objetos compartidos en un estado conocido y limpio antes de cada prueba, evitando que el estado dejado por una prueba anterior afecte accidentalmente el resultado de la siguiente (cada prueba debe ser independiente y capaz de ejecutarse en cualquier orden sin afectar ni verse afectada por otras).

Este ciclo de vida (`@BeforeEach` antes de cada prueba, con `@AfterEach` como su contraparte de limpieza posterior, y `@BeforeAll`/`@AfterAll` para configuración costosa que solo debe ejecutarse una única vez para toda la clase de pruebas, no repetida en cada prueba individual) estructura de forma predecible cuándo exactamente se ejecuta cada pieza de configuración o limpieza en relación con las pruebas efectivas, garantizando aislamiento entre pruebas sucesivas.

**Analogía:** `@BeforeEach` es como reiniciar completamente un escenario de laboratorio a su estado inicial conocido antes de cada experimento individual, garantizando que los resultados de un experimento no contaminen accidentalmente el siguiente experimento realizado en el mismo espacio.

**¿Por qué es importante?** El ciclo de vida de JUnit 5 garantiza aislamiento entre pruebas sucesivas, ejecutando configuración y limpieza en momentos predecibles relativos a cada prueba individual.

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

### Tema 2: Mockito — aislar dependencias

#### Paso 1 · Objetivo y preparación
Al finalizar podrás sustituir una dependencia real (un repositorio con base de datos) por un mock de Mockito, probando la lógica de negocio sin levantar ninguna infraestructura externa. Prerrequisitos: JDK 25, Maven y un editor. Verifica java --version y mvn --version.

#### Paso 2 · Contexto y caso real
Probar `ServicioPedidos.crear(...)` contra una base de datos real hace la suite lenta y frágil (depende de que la base esté disponible y en un estado conocido); la lógica de negocio que decide si un pedido es válido no necesita una base de datos real para verificarse, solo necesita que `RepositorioPedidos` responda de forma controlada.

#### Paso 3 · Teoría, modelo mental y analogía
Mockito reemplaza una dependencia real por un objeto simulado (mock) cuyo comportamiento se configura explícitamente desde la propia prueba (`when(...).thenReturn(...)`), y permite verificar después que una interacción específica ocurrió (`verify(...)`). La analogía: un actor de reparto que sigue exactamente el guion indicado para esta representación, permitiendo ensayar al protagonista sin que el elenco completo real esté disponible.

**Evidencia de aprendizaje:** entrega el test con `@Mock`/`@InjectMocks`, el fallo de `NullPointerException` al olvidar configurar el mock, y su corrección con `when(...)`.
**Conceptos clave:** `@Mock`, `@InjectMocks`, `when`/`verify`.

Mockito permite reemplazar las dependencias reales de la clase bajo prueba por objetos simulados (mocks) cuyo comportamiento se controla completamente desde la propia prueba: `@Mock RepositorioPedidos repositorio; @InjectMocks ServicioPedidos servicio;` crea un mock de `RepositorioPedidos` y lo inyecta automáticamente en una instancia real de `ServicioPedidos`, permitiendo probar la lógica de negocio de `ServicioPedidos` de forma completamente aislada, sin depender de una base de datos real ni de ninguna otra infraestructura externa que `RepositorioPedidos` normalmente requeriría en producción.

`when(repositorio.guardar(any())).thenReturn(new Pedido(1))` configura el comportamiento simulado del mock (stub): cuando se invoque `guardar` con cualquier argumento, devolver ese `Pedido` específico, permitiendo controlar exactamente qué "respuesta" simulada recibe el servicio bajo prueba sin necesidad de una implementación real de persistencia. `verify(repositorio).guardar(any())`, en cambio, no configura comportamiento sino que verifica una interacción ya ocurrida: confirma que el servicio efectivamente invocó ese método del mock durante la ejecución de la prueba, una aserción sobre comportamiento (que cierta interacción ocurrió) en vez de sobre un valor de retorno, útil para verificar que el servicio realmente delega correctamente en su dependencia, no solo que produce el resultado correcto por alguna otra vía inesperada.

**Analogía:** un mock es como un actor de reparto que sigue exactamente el guion que se le indica para esta representación específica (el `when`), permitiendo ensayar la actuación del protagonista (el servicio bajo prueba) sin necesidad de que el elenco de reparto completo real esté disponible; `verify` es como confirmar después de la representación que el protagonista efectivamente interactuó con ese actor de reparto en el momento esperado del guion, no solo que la obra terminó bien por alguna otra razón.

**¿Por qué es importante?** Mockear dependencias externas aísla la prueba de infraestructura real (bases de datos, servicios externos), haciendo la prueba más rápida, determinista y confiable, sin depender de la disponibilidad o el estado de sistemas externos.

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
        assertEquals(1, resultado.id());
        verify(repositorio).guardar(any()); // confirma que se llamó al repositorio
    }
}
```

Aislar dependencias con mocks es lo que permite que la suite de pruebas del Proyecto integrador (Módulo 13) corra en segundos, sin levantar la base de datos real cada vez.

**Cuándo no usarlo:** si la dependencia es un objeto de valor simple (por ejemplo un `record` inmutable sin efectos secundarios), usar el objeto real es más simple y claro que mockearlo.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-mockito-repositorio
cd ejemplo-mockito-repositorio
mvn -q archetype:generate -DgroupId=academia.entregas -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app
mvn test          # Maven
./gradlew test    # Gradle (equivalente)
```
Crea `src/test/java/academia/entregas/ServicioPedidosTest.java` con `@Mock RepositorioPedidos repositorio` y `@InjectMocks ServicioPedidos servicio`; configura `when(repositorio.guardar(any())).thenReturn(new Pedido(1))` y verifica con `verify(repositorio).guardar(any())`.

#### Paso 5 · Práctica guiada
Pista: elimina deliberadamente el `when(...)` que configura el mock para provocar un fallo deliberado (el mock devuelve `null` por defecto y el test lanza `NullPointerException`); lee el stack trace, que apunta directamente a la línea sin stub. Resultado esperado: restaurar el `when(...)` corrige el fallo.

#### Paso 6 · Práctica independiente
Agrega una segunda dependencia mockeada (por ejemplo un servicio de notificaciones) y escribe un `verify` que confirme que se llamó exactamente una vez, usando `verify(notificador, times(1))`.

#### Paso 7 · Cierre y evidencia
Guarda el test, el fallo de `NullPointerException` provocado y su corrección; como siguiente paso cubre varios casos con tests parametrizados. Errores comunes: mockear la clase bajo prueba en vez de sus dependencias (deja de probar código real), confundir `when` (configurar comportamiento) con `verify` (comprobar que una interacción ocurrió), y mockear un objeto de valor simple que sería más claro usar real. Fuentes oficiales: https://site.mockito.org/.
**¿Por qué es importante?** Porque mockear las dependencias externas permite probar la lógica de negocio en aislamiento, rápido y de forma determinista, sin depender de la disponibilidad ni el estado de una base de datos u otro servicio real.

### Tema 3: Tests parametrizados y cobertura

#### Paso 1 · Objetivo y preparación
Al finalizar podrás escribir una única prueba parametrizada que cubra varios casos de entrada, y usar un reporte de cobertura para identificar qué rama de código ningún test ejercita todavía. Prerrequisitos: JDK 25, Maven y un editor. Verifica java --version y mvn --version.

#### Paso 2 · Contexto y caso real
Verificar una función como "es Fibonacci" para cinco valores distintos copiando y pegando el mismo cuerpo de prueba cinco veces (cambiando solo el número) duplica la lógica de verificación; y sin un reporte de cobertura, nadie nota que una rama específica del código (por ejemplo, el caso de un número negativo) nunca se ejecutó en ninguna prueba.

#### Paso 3 · Teoría, modelo mental y analogía
`@ParameterizedTest` ejecuta el mismo cuerpo de prueba una vez por cada valor de una fuente de datos, evitando duplicar manualmente la lógica de verificación por cada caso; JaCoCo mide qué porcentaje de líneas y ramas del código de producción efectivamente se ejecutó durante toda la suite. La analogía: verificar la misma receta con distintos ingredientes de entrada, sin reescribir el procedimiento de verificación para cada ingrediente distinto.

**Evidencia de aprendizaje:** entrega el test parametrizado con `@ValueSource`, y el reporte de JaCoCo comparado antes y después de quitar un caso.
**Conceptos clave:** una única prueba con múltiples conjuntos de datos, `@CsvSource`/`@MethodSource`, cobertura de líneas/ramas.

`@ParameterizedTest @ValueSource(ints = {1, 2, 3, 5, 8}) void esFibonacci(int numero) { assertTrue(esFibonacci(numero)); }` ejecuta la misma lógica de prueba una vez por cada valor proporcionado en la fuente de datos, evitando duplicar manualmente el mismo cuerpo de prueba una vez por cada caso individual que se desea verificar; `@CsvSource` permite proporcionar conjuntos de valores múltiples por ejecución (para probar métodos con más de un parámetro), y `@MethodSource` permite generar la fuente de datos mediante un método propio cuando los valores necesarios son demasiado complejos para expresarse directamente como una anotación simple; `@TestFactory` habilita la generación dinámica y programática de un conjunto variable de pruebas en tiempo de ejecución, para casos donde ni siquiera el número de pruebas necesarias se conoce de antemano de forma estática.

JaCoCo mide cobertura de código: qué porcentaje de líneas (y opcionalmente de ramas condicionales específicas, como cada lado de un `if`) del código de producción efectivamente se ejecutó durante la suite de pruebas completa, generado con `mvn test jacoco:report` como un reporte HTML navegable que resalta visualmente qué líneas específicas del código nunca se ejecutaron durante ninguna prueba, señalando directamente qué partes del código carecen de cobertura de pruebas y podrían albergar bugs no detectados por la suite actual; AssertJ (`assertThat(resultado).isEqualTo(5)`) y Hamcrest son librerías de aserciones fluidas alternativas a las aserciones básicas de JUnit, ofreciendo mensajes de fallo más descriptivos y una sintaxis más legible encadenada para verificaciones complejas.

**Analogía:** un test parametrizado es como verificar la misma receta de cocina con distintos ingredientes de entrada, confirmando que produce el resultado esperado en cada caso sin tener que reescribir el procedimiento completo de verificación para cada ingrediente distinto; un reporte de cobertura es como un mapa de calor que señala exactamente qué áreas de una ciudad nunca han sido patrulladas por ninguna ronda de inspección, indicando dónde podrían existir problemas no detectados simplemente porque nadie ha verificado esa zona específica todavía.

**¿Por qué es importante?** Los tests parametrizados evitan duplicar el mismo cuerpo de prueba para múltiples casos de datos; JaCoCo identifica visualmente qué partes del código de producción carecen de cobertura de pruebas, señalando riesgos potenciales no verificados.

**Código del ejemplo:**

```java
@ParameterizedTest
@ValueSource(ints = {1, 2, 3, 5, 8})
void esFibonacci(int numero) {
    assertTrue(esFibonacci(numero));
}
```
```bash
mvn test jacoco:report   # genera un reporte HTML con líneas/ramas cubiertas
```

El reporte de cobertura del Proyecto integrador (Módulo 13) debe revisarse antes de cada entrega: una rama sin cubrir en la lógica de tarifas es un bug potencial no detectado.

**Cuándo no usarlo:** perseguir 100% de cobertura en código trivial (getters, setters) desperdicia tiempo; prioriza cobertura en la lógica de negocio con riesgo real.

---

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía:
```bash
mkdir ejemplo-parametrizado-cobertura
cd ejemplo-parametrizado-cobertura
mvn -q archetype:generate -DgroupId=academia.entregas -DartifactId=app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
cd app
mvn test jacoco:report            # Maven (plugin jacoco-maven-plugin)
./gradlew test jacocoTestReport   # Gradle (equivalente, con el plugin `jacoco`)
```
Crea `src/test/java/academia/entregas/FibonacciTest.java` con `@ParameterizedTest @ValueSource(ints = {1, 2, 3, 5, 8}) void esFibonacci(int numero)`; ejecuta `mvn test jacoco:report` y abre `target/site/jacoco/index.html`.

#### Paso 5 · Práctica guiada
Pista: agrega el valor `4` a `@ValueSource(ints = {1, 2, 3, 5, 8})` → `{1, 2, 3, 4, 5, 8}`. **Fallo deliberado:** `4` no es un número de Fibonacci, así que `assertTrue(esFibonacci(4))` **falla** con un error `AssertionFailedError: expected: <true> but was: <false>`. Diagnostica el mensaje: JUnit reporta el fallo indicando `[4]` como el parámetro que lo provocó, no un fallo genérico — esa es la ventaja de `@ParameterizedTest`, que señala exactamente cuál de los valores de entrada rompió la aserción. Resultado esperado: quitar el `4` deja la suite en verde de nuevo; el reporte de JaCoCo además muestra qué rama del método `esFibonacci` ejercita cada valor restante.
#### Paso 6 · Práctica independiente
Convierte el test a `@MethodSource` con un método que genere los mismos casos programáticamente, y agrega un caso inválido (un número negativo) para verificar el manejo de error.

#### Paso 7 · Cierre y evidencia
Guarda el test, el reporte HTML de JaCoCo antes y después de quitar el caso, y la explicación de qué rama quedó sin cubrir; como siguiente paso conecta la suite a CI. Errores comunes: duplicar el mismo cuerpo de prueba por cada caso en vez de usar `@ParameterizedTest`, perseguir 100% de cobertura en código trivial (getters/setters) sin evaluar el riesgo real de cada rama, y tratar un alto porcentaje de cobertura como sinónimo de "bien probado" sin revisar la calidad de las aserciones. Fuentes oficiales: https://junit.org/junit5/docs/current/user-guide/#writing-tests-parameterized-tests y https://www.jacoco.org/jacoco/trunk/doc/.
**¿Por qué es importante?** Porque un test parametrizado evita duplicar la misma lógica de verificación por cada caso de entrada, y un reporte de cobertura señala exactamente qué rama del código de producción ninguna prueba ejercita todavía, un riesgo invisible sin esa medición.

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
