# Módulo 9: Testing con JUnit 5 y Mockito


## Aprende construyendo

### Tema 1: JUnit 5 — anotaciones y ciclo de vida

**¿Por qué es importante?** una prueba repetible descubre cuando un cambio rompe una regla antes de que el fallo llegue al usuario.

**Preparación común del módulo:** usa el proyecto Maven del Módulo 8; para estos ejercicios añade JUnit Jupiter `6.0.2` y Maven Surefire `3.5.5` al `pom.xml`, con JUnit en scope `test`. JUnit 6 requiere Java 17 o superior. Fuente: [guía oficial de JUnit](https://docs.junit.org/current/user-guide/).

#### Subtema 1.1: Escribe y ejecuta tu primera prueba · 10 min

**1. Contexto**

Una tarifa de envío no puede ser negativa. El test comprueba esa regla con un ejemplo que cualquiera puede volver a correr.

**2. Hazlo tú**

Crea `src/main/java/Tarifa.java` con `static int calcular(int gramos) { return gramos <= 500 ? 4000 : 7000; }`. Crea `src/test/java/TarifaTest.java` con `@Test void paquetePequenoCuestaCuatroMil() { assertEquals(4000, Tarifa.calcular(300)); }`. Ejecuta `mvn test`.

**Resultado esperado:** Surefire detecta una prueba y muestra `BUILD SUCCESS`.

**Fallo deliberado:** cambia el esperado a `5000`. **Diagnóstico:** compara el valor esperado y el real en el reporte de prueba; restaura el resultado correcto.

**3. Entiende**

`@Test` marca un método de prueba. `assertEquals` compara el resultado observado con la regla acordada.

**4. Cierra**

Guarda el test y el reporte ubicado en `target/surefire-reports`.

#### Subtema 1.2: Prepara datos para cada prueba · 10 min

**1. Contexto**

Una prueba debe comenzar con una tarifa limpia y no depender del orden en que se ejecutan otros tests.

**2. Hazlo tú**

En `src/test/java/TarifaTest.java`, crea un campo `Tarifa tarifa`; agrega `@BeforeEach void preparar() { tarifa = new Tarifa(); }` si convertiste Tarifa en clase, y prueba dos entradas distintas en métodos separados. Ejecuta `mvn test`.

**Resultado esperado:** cada test pasa por su preparación, aunque el motor los ejecute en orden distinto.

**Fallo deliberado:** guarda el último precio en un campo `static` compartido entre tests. **Diagnóstico:** un test modifica el estado del otro; elimina la dependencia compartida o crea datos por prueba.

**3. Entiende**

`@BeforeEach` prepara el contexto de cada método; no se debe usar para ocultar una dependencia entre tests.

**4. Cierra**

Conserva dos tests independientes y explica qué estado vuelve a crear la preparación.

#### Subtema 1.3: Comprueba errores esperados · 10 min

**1. Contexto**

Una guía con peso negativo debe rechazarse en el momento de crearla.

**2. Hazlo tú**

Crea `src/main/java/Guia.java` con constructor que lance `IllegalArgumentException` si `peso <= 0`. En `src/test/java/GuiaTest.java` usa `assertThrows(IllegalArgumentException.class, () -> new Guia(-1))`. Ejecuta `mvn test`.

**Resultado esperado:** el test pasa porque el caso inválido lanza el tipo esperado.

**Fallo deliberado:** captura la excepción dentro del lambda y no la vuelvas a lanzar. **Diagnóstico:** `assertThrows` reporta que no se produjo la excepción; deja que el test observe el error.

**3. Entiende**

Una prueba de error debe comprobar el tipo de fallo que forma parte del contrato, no cualquier excepción accidental.

**4. Cierra**

Guarda el test válido y el fallo deliberado. Fuente: [anotaciones y assertions JUnit](https://docs.junit.org/current/user-guide/).

### Tema 2: Mockito — aislar dependencias

**¿Por qué es importante?** una prueba de servicio debe poder comprobar una regla de negocio sin arrancar una base de datos ni llamar una API real.

**Preparación:** añade `org.mockito:mockito-junit-jupiter:5.24.0` con scope `test` al mismo `pom.xml`. Referencia: [versiones oficiales Mockito](https://github.com/mockito/mockito/releases).

#### Subtema 2.1: Simula un repositorio · 10 min

**1. Contexto**

`ServicioRutas` consulta un repositorio; en esta prueba no quieres conectar PostgreSQL.

**2. Hazlo tú**

Crea `src/main/java/Ruta.java` como `record Ruta(String guia, String estado) {}` y `src/main/java/RutaRepository.java` con `Optional<Ruta> buscar(String guia)`. Crea `src/main/java/ServicioRutas.java` que delegue la búsqueda. En `src/test/java/ServicioRutasTest.java` usa `@ExtendWith(MockitoExtension.class)`, `@Mock RutaRepository repo`, prepara `when(repo.buscar("RT-1")).thenReturn(Optional.of(new Ruta("RT-1", "EN_RUTA")))` y comprueba el estado. Ejecuta `mvn test`.

**Resultado esperado:** el test pasa sin crear conexión de base de datos.

**Fallo deliberado:** llama `repo.buscar("RT-2")` en el servicio. **Diagnóstico:** el stub solo define `RT-1`; configura la respuesta que corresponda al escenario o corrige la entrada.

**3. Entiende**

El mock sustituye el colaborador externo; la regla que se prueba sigue siendo código real.

**4. Cierra**

Conserva la prueba y marca cuál dependencia fue simulada.

#### Subtema 2.2: Verifica una interacción necesaria · 10 min

**1. Contexto**

Un servicio debe solicitar la guía una sola vez para responder una consulta.

**2. Hazlo tú**

En `src/test/java/ServicioRutasTest.java`, llama `servicio.buscar("RT-1")` y usa `verify(repo).buscar("RT-1")`. Ejecuta `mvn test`.

**Resultado esperado:** Mockito confirma la llamada con el argumento exacto.

**Fallo deliberado:** elimina la llamada real al repositorio en `ServicioRutas.buscar`. **Diagnóstico:** el resultado puede seguir pasando si solo compruebas datos prefabricados; la verificación detecta que la colaboración esperada no ocurrió.

**3. Entiende**

Verifica interacciones cuando forman parte del comportamiento (por ejemplo, publicar un evento); evita verificar cada llamada interna sin motivo.

**4. Cierra**

Explica en una frase por qué esa llamada es visible para quien usa el servicio.

#### Subtema 2.3: Simula un error externo · 10 min

**1. Contexto**

La base de datos puede fallar; la capa de servicio debe traducir el error a un resultado claro.

**2. Hazlo tú**

En `src/test/java/ServicioRutasTest.java`, prepara `when(repo.buscar("RT-1")).thenThrow(new IllegalStateException("DB caída"))`. Añade al servicio un manejo específico que devuelva un error de dominio o propague una excepción documentada; comprueba esa decisión con `assertThrows`. Corre `mvn test`.

**Resultado esperado:** la falla externa se reproduce de forma determinista y el test observa el contrato del servicio.

**Fallo deliberado:** devuelve `Optional.empty()` para cualquier `RuntimeException`. **Diagnóstico:** una caída no significa que la ruta no exista; separa “no encontrado” de “servicio indisponible”.

**3. Entiende**

El mock permite probar fallos raros sin apagar servicios reales; no demuestra por sí solo que la integración real funciona.

**4. Cierra**

Guarda el resultado esperado y el error distinguido. Fuente: [documentación Mockito](https://github.com/mockito/mockito).

### Tema 3: Tests parametrizados y cobertura

**¿Por qué es importante?** una regla con límites debe comprobar entradas representativas; la cobertura ayuda a encontrar código aún no ejercitado, pero no demuestra que el test sea correcto.

**Preparación:** añade al build Maven el plugin JaCoCo `0.8.14` con dos ejecuciones: `prepare-agent` y `report` asociado a la fase `verify`. Esta versión soporta oficialmente Java 25. En el Tema 3 usarás `mvn verify` para producir `target/site/jacoco/index.html`. Fuente: [historial oficial de JaCoCo](https://www.jacoco.org/jacoco/trunk/doc/changes.html).

#### Subtema 3.1: Comprueba varios casos con CSV · 10 min

**1. Contexto**

La tarifa cambia al superar los 500 gramos; un test separado para cada peso repite estructura.

**2. Hazlo tú**

En `src/test/java/TarifaTest.java`, crea `@ParameterizedTest @CsvSource({"100, 4000", "500, 4000", "501, 7000"}) void calculaTarifa(int gramos, int esperado) { assertEquals(esperado, Tarifa.calcular(gramos)); }`. Ejecuta `mvn test`.

**Resultado esperado:** JUnit reporta tres ejecuciones con datos distintos.

**Fallo deliberado:** omite el límite exacto `500`. **Diagnóstico:** el test no comprueba si la regla usa `<` o `<=`; conserva casos justo antes, en y después del límite.

**3. Entiende**

`@CsvSource` alimenta los parámetros. Cada fila se evalúa como una invocación independiente.

**4. Cierra**

Conserva las tres filas y explica por qué `500` es un caso importante.

#### Subtema 3.2: Encuentra una rama no probada · 10 min

**1. Contexto**

El cálculo tiene una rama para peso inválido que los casos de tarifa normal no visitan.

**2. Hazlo tú**

En `src/main/java/Tarifa.java` agrega el rechazo de gramos negativos. Añade en `src/test/java/TarifaTest.java` un test con `assertThrows`. Ejecuta `mvn test` y observa cuál rama se ejecuta con JaCoCo activado en el POM del Módulo 9.

**Resultado esperado:** la prueba pasa y la nueva rama queda recorrida.

**Fallo deliberado:** borra el caso negativo y revisa `target/site/jacoco/index.html`. **Diagnóstico:** la rama queda sin cubrir; agrega la entrada, no cambies el código solo para subir el porcentaje.

**3. Entiende**

Cobertura señala ejecución de líneas o ramas; no prueba que los resultados afirmados sean los correctos.

**4. Cierra**

Anota la rama que faltaba y el test que la ejercita.

#### Subtema 3.3: Lee una métrica sin perseguir el porcentaje · 10 min

**1. Contexto**

Un test puede ejecutar todas las líneas y aun así comprobar el resultado equivocado.

**2. Hazlo tú**

Ejecuta `mvn verify` y abre `target/site/jacoco/index.html`, producido por la configuración JaCoCo común de este tema. En `src/test/java/TarifaTest.java`, cambia temporalmente el valor esperado de un caso a uno incorrecto y vuelve a correr `mvn verify`.

**Resultado esperado:** el porcentaje puede seguir alto, pero el test falla ante el resultado incorrecto.

**Fallo deliberado:** fija como meta 100% sin revisar expectativas. **Diagnóstico:** cobertura mide qué código se ejecutó, no si la prueba detecta errores relevantes.

**3. Entiende**

Combina cobertura de ramas con límites, errores y comportamiento de negocio explicable.

**4. Cierra**

Guarda el reporte y explica un límite de esa métrica. Fuentes: [JUnit User Guide](https://docs.junit.org/current/user-guide/) y [JaCoCo Java 25](https://www.jacoco.org/jacoco/trunk/doc/changes.html).

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
