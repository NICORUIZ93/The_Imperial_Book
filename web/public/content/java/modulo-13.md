# Módulo 13: Proyecto integrador


## Aprende construyendo

### Tema 1: Arquitectura por capas del proyecto integrador

**¿Por qué es importante?** las reglas del dominio no deberían depender de HTTP, una base de datos o el framework elegido.

#### Subtema 1.1: Separa entrada, caso de uso y dominio · 10 min

**1. Contexto**

Una petición de crear entrega no debe contener la regla de validación de la guía en el controlador.

**2. Hazlo tú**

Crea `src/domain/Guia.java` con `record Guia(String numero)` que rechace un número vacío; crea `src/application/CrearGuia.java` con método `ejecutar(String numero)` que construya la guía; crea `src/Main.java` que invoque el caso de uso. Compila desde la raíz con `javac -d out src/domain/Guia.java src/application/CrearGuia.java src/Main.java` y ejecuta `java -cp out Main`.

**Resultado esperado:** el programa muestra la guía creada y la validación vive en el dominio.

**Fallo deliberado:** mueve la condición de número vacío a `Main`. **Diagnóstico:** cualquier otro punto de entrada puede saltársela; conserva la regla junto al modelo del dominio.

**3. Entiende**

La entrada traduce la petición; el caso de uso coordina; el dominio protege sus invariantes.

**4. Cierra**

Guarda los tres archivos y anota qué regla no debe repetirse en una interfaz.

#### Subtema 1.2: Invierte la dependencia del repositorio · 10 min

**1. Contexto**

El caso de uso debe poder guardar una guía en memoria durante una prueba o en una base real en producción.

**2. Hazlo tú**

Crea `src/application/RepositorioGuias.java` como interfaz `guardar(Guia guia)`. Cambia `CrearGuia` para recibir el contrato por constructor y llamarlo. Crea `src/infra/RepositorioMemoria.java` que implemente el contrato con una lista. Compila los archivos con `javac -d out src/domain/Guia.java src/application/RepositorioGuias.java src/application/CrearGuia.java src/infra/RepositorioMemoria.java src/Main.java` y ejecuta `java -cp out Main`.

**Resultado esperado:** el caso de uso guarda sin importar la clase de infraestructura.

**Fallo deliberado:** crea `RepositorioMemoria` dentro del caso de uso. **Diagnóstico:** el caso deja de poder intercambiar infraestructura; recibe una interfaz.

**3. Entiende**

La implementación concreta depende del contrato del caso de uso; la composición decide qué implementación entregar.

**4. Cierra**

Dibuja dependencias: `Main → CrearGuia → RepositorioGuias ← RepositorioMemoria`.

#### Subtema 1.3: Expón una frontera de entrada · 10 min

**1. Contexto**

Un controlador HTTP debe convertir la solicitud en una llamada al caso de uso, no abrir una conexión a base de datos.

**2. Hazlo tú**

Crea `src/api/CrearGuiaRequest.java` como `record CrearGuiaRequest(String numero)`. En `src/api/CrearGuiaController.java`, recibe `CrearGuia`, expone un método `crear(CrearGuiaRequest request)` y delega `request.numero()`. Compila con `javac -d out src/domain/Guia.java src/application/RepositorioGuias.java src/application/CrearGuia.java src/infra/RepositorioMemoria.java src/api/CrearGuiaRequest.java src/api/CrearGuiaController.java src/Main.java`.

**Resultado esperado:** el adaptador convierte el formato de entrada y la regla del caso de uso se conserva.

**Fallo deliberado:** agrega SQL directamente al controlador. **Diagnóstico:** mueve el acceso externo a la infraestructura detrás del repositorio.

**3. Entiende**

Una capa útil protege una frontera que cambia; muchas capas sin responsabilidades claras solo añaden navegación.

**4. Cierra**

Identifica qué cambiarías para añadir una API distinta sin reescribir `CrearGuia`.

**Traza una petición:** sigue `POST /envios` desde controlador a caso de uso, dominio y repositorio. El controlador traduce HTTP; el caso de uso coordina; el dominio protege reglas como peso positivo; el repositorio guarda. Prueba la regla de peso sin levantar servidor y prueba HTTP por separado. Dibuja dependencias desde los imports: si dominio importa Spring o SQL, una regla central depende de un mecanismo externo. Asigna una responsabilidad observable a cada capa. Fuente: https://docs.spring.io/spring-modulith/reference/fundamentals.html.

### Tema 2: Integrando concurrencia, modelado y testing

**¿Por qué es importante?** la concurrencia debe preservar las reglas de dominio y probar resultados sin depender de pausas arbitrarias.

#### Subtema 2.1: Envía trabajos acotados a un executor · 10 min

**1. Contexto**

El reporte de varias guías puede calcularse en paralelo sin crear un hilo ilimitado por petición.

**2. Hazlo tú**

Crea `src/application/ProcesarGuias.java` que reciba un `ExecutorService`, envíe un `Callable<String>` por guía con `submit`, recoja los `Future` y devuelva la lista. En `src/Main.java`, usa `Executors.newFixedThreadPool(2)` dentro de try-with-resources. Compila con `javac -d out src/application/ProcesarGuias.java src/Main.java` y ejecuta `java -cp out Main`.

**Resultado esperado:** todas las guías producen un resultado con un máximo de dos trabajos activos.

**Fallo deliberado:** crea un nuevo hilo por cada guía y no lo cierra. **Diagnóstico:** limita el número de workers y cierra el executor al terminar.

**3. Entiende**

El pool controla concurrencia; el dominio sigue describiendo cada guía y no depende de hilos.

**4. Cierra**

Guarda el número de trabajos y el máximo de workers configurado.

#### Subtema 2.2: Conserva el orden y diagnostica una tarea fallida · 10 min

**1. Contexto**

El informe debe conservar el orden de entrada y mostrar qué guía falló.

**2. Hazlo tú**

En `src/application/ProcesarGuias.java`, guarda los `Future` en el mismo orden que las guías; al recorrerlos, captura `ExecutionException` y añade a un resultado de error el número de guía correspondiente. Ejecuta `java -cp out Main` primero con todas las tareas válidas y luego con una tarea que lance `IllegalStateException`.

**Resultado esperado:** el reporte mantiene el orden y distingue un fallo de tarea del resultado normal.

**Fallo deliberado:** captura `Exception` y reemplaza cualquier fallo por texto vacío. **Diagnóstico:** conserva el identificador y la causa para saber qué trabajo falló.

**3. Entiende**

`Future.get()` espera el resultado y envuelve excepciones de la tarea en `ExecutionException`; el error no debe desaparecer.

**4. Cierra**

Guarda ambos resultados y la causa observada.

#### Subtema 2.3: Prueba coordinación sin Thread.sleep · 10 min

**1. Contexto**

Una prueba que espera dos segundos depende del equipo y puede fallar sin relación con la regla.

**2. Hazlo tú**

En `src/test/java/ProcesarGuiasTest.java`, crea dos tareas que completen un `CountDownLatch` y comprueba la salida usando `Future.get` con un timeout razonable. Ejecuta `mvn test` en el proyecto Maven del Módulo 9.

**Resultado esperado:** el test espera una señal real de las tareas y termina en cuanto el trabajo acaba.

**Fallo deliberado:** reemplaza la señal por `Thread.sleep(2000)`. **Diagnóstico:** el tiempo fijo no prueba que la tarea terminó; coordina con latch/future y limita esperas para detectar bloqueos.

**3. Entiende**

Las pruebas concurrentes deben controlar orden y límite de espera, no adivinar cuánto tardará la máquina.

**4. Cierra**

Conserva la prueba, la señal de coordinación y el timeout que usarías en CI.

**Prueba el caso concurrente:** inicia dos reservas para la última unidad y comprueba que solo una confirme. Controla el executor y espera cada `Future`; `Thread.sleep` no sincroniza y puede ocultar la carrera. Repite el escenario en secuencia para separar un defecto del modelo de uno de coordinación. Si importa el orden, conserva un identificador y el estado observado por cada tarea. La salida debe poder repetirse con datos fijos y un límite de espera claro. Fuente: https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/concurrent/package-summary.html.

### Tema 3: Build reproducible y cierre del track

**¿Por qué es importante?** otra persona debe poder obtener el mismo programa sin conocer pasos secretos del entorno del autor.

#### Subtema 3.1: Fija herramientas y dependencias · 10 min

**1. Contexto**

El build local funciona, pero CI usa otra versión de Maven o de una librería.

**2. Hazlo tú**

En `pom.xml`, fija `maven.compiler.release`, versiones de plugins y dependencias; genera Maven Wrapper con `mvn wrapper:wrapper` y guarda `mvnw`, `mvnw.cmd` y `.mvn/wrapper`. Ejecuta `./mvnw --version` y `./mvnw clean verify`.

**Resultado esperado:** el wrapper informa su versión fijada y la compilación limpia ejecuta las pruebas.

**Fallo deliberado:** deja `LATEST` o rangos abiertos en la dependencia directa. **Diagnóstico:** fija versión concreta y conserva el archivo del wrapper en control de versiones.

**3. Entiende**

El wrapper fija Maven; no fija automáticamente el JDK de todos los equipos. Declara también la versión Java que usa CI.

**4. Cierra**

Guarda la versión de JDK, Maven wrapper y resultado de `verify`.

#### Subtema 3.2: Arranca desde una copia limpia · 10 min

**1. Contexto**

El repositorio debe funcionar en una carpeta nueva y no apoyarse en archivos locales ignorados.

**2. Hazlo tú**

Desde la raíz ejecuta `git worktree add /tmp/java-limpio HEAD`, entra a esa copia con `cd /tmp/java-limpio`, corre `./mvnw clean verify` e inicia la aplicación con los comandos del `README.md`.

**Resultado esperado:** una copia limpia compila y arranca sin depender de `target/` ni de variables locales no documentadas.

**Fallo deliberado:** borra de tu entorno de trabajo una variable necesaria sin documentarla. **Diagnóstico:** añade al README el requisito, valor de ejemplo no secreto y forma de ejecutarlo localmente.

**3. Entiende**

La clonación limpia detecta dependencias ocultas en artefactos compilados o configuraciones personales.

**4. Cierra**

Guarda los comandos reproducidos y cualquier requisito externo que quede.

#### Subtema 3.3: Cierra con evidencia verificable · 10 min

**1. Contexto**

Una marca de “terminado” no prueba que el código compile, que las pruebas se ejecuten o que la persona entienda el diseño.

**2. Hazlo tú**

En `docs/evidencia-java.md` enlaza el árbol del proyecto, el resultado de `./mvnw clean verify`, una prueba de dominio, una prueba de concurrencia y un diagrama de dependencias. Ejecuta `./mvnw clean verify` desde la raíz y revisa que cada evidencia exista en el repositorio.

**Resultado esperado:** cada afirmación apunta a un archivo o salida que otra persona puede volver a comprobar.

**Fallo deliberado:** marca el ejemplo como ejecutado porque tiene un bloque de código en Markdown. **Diagnóstico:** un bloque documentado no demuestra que el comando corrió; registra por separado lo que está pendiente de ejecución.

**3. Entiende**

La evidencia estructural, ejecución automatizada y revisión humana son estados diferentes; no los mezcles.

**4. Cierra**

Entrega una lista de lo que sí ejecutaste y lo que todavía necesita revisión humana.


**Cierre reproducible:** desde un checkout limpio ejecuta `./mvnw clean verify` o `./gradlew clean check`. Anota la versión del wrapper y JDK; confirma que no necesitas archivos generados a mano antes del build. Si solo funciona en tu carpeta, revisa rutas relativas, configuración local y artefactos no versionados. El comando y sus requisitos deben bastar para que otra persona reconstruya el proyecto. Fuente: https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html.

---


## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir la aplicación integradora completa con arquitectura por capas, procesamiento concurrente, tests y build reproducible.

**Requisitos previos:** Módulos 0-12 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Diseñar la arquitectura por capas | Ver Tema 1 | `dominio/`, `servicio/`, `infraestructura/` |
| 2 | Implementar procesamiento con virtual threads | Ver Tema 2 | Modela el resultado como sealed interface |
| 3 | Modelar el dominio con records y sealed interfaces | Módulo 7 | Donde sea apropiado |
| 4 | Escribir tests con JUnit 5 y Mockito | Módulo 9 | Para la lógica de negocio crítica |
| 5 | Configurar el build reproducible | Ver Tema 3 | Ejecutable con un solo comando |

**Verificación:** el laboratorio (y el track completo) se considera exitoso si la aplicación procesa tareas concurrentemente sin condiciones de carrera, si el manejo de éxito/error está modelado explícitamente y verificado exhaustivamente por el compilador, y si cualquier persona puede clonar y ejecutar el proyecto con un único comando documentado.

**Errores comunes y soluciones**

- **Mezclar lógica de dominio con detalles de infraestructura.** Mantén el dominio libre de dependencias hacia infraestructura concreta.
- **Usar excepciones para casos de fallo esperados en procesamiento concurrente masivo.** Modela el resultado como una sealed interface con casos de éxito y error explícitos.
- **Dejar el build sin documentar el comando de ejecución.** Documenta claramente cómo clonar y ejecutar el proyecto con un solo comando.

---
