# Estado verificable de la revisión minuciosa

Fecha de corte: 2026-11-01, zona horaria America/Bogota.

Este documento permite que otra persona o agente continúe el trabajo sin asumir
que una métrica automática equivale a calidad pedagógica. Registra el objetivo, las
decisiones, los cambios, las pruebas y la deuda real.

## 1. Objetivo obligatorio

Cada curso debe avanzar desde cero hasta nivel profesional/experto. Cada tema se
descompone en todos sus subtemas esenciales y cada subtema crítico recibe:

1. explicación individual y causal;
2. mecanismo, sintaxis o modelo pertinente;
3. archivo y ubicación exactos;
4. ejemplo completo y ejecutable;
5. comando y resultado observable;
6. fallo deliberado con diagnóstico;
7. límite, riesgo o decisión profesional;
8. práctica guiada e independiente;
9. transferencia a un proyecto;
10. fuentes primarias y estado real de ejecución.

Una mención, lista, tabla o aparición en código no acredita explicación. Una
tabla de subtemas tampoco cierra un tema si las filas no apuntan a explicaciones y
evidencias reales.

### Ejemplo normativo aportado por el usuario

> Crear antes de las interfaces funcionales un tema completo de lambdas que cubra
> sintaxis, SAM, target typing, captura, `this`, referencias a métodos,
> sobrecargas ambiguas, excepciones checked y especializaciones primitivas.

La lista no se copia a otros dominios. Lo obligatorio es reproducir el mismo
grado de análisis con el mapa propio de cada tema.

## 2. Fuentes persistentes de la regla

- `AGENTS.md`: contrato operativo del repositorio y puerta de calidad.
- `docs/PROMPT-MAESTRO-METODOLOGIA-EDUCATIVA.md`: prompt completo para nuevos lotes.
- `docs/METODOLOGIA-DE-APRENDIZAJE.md`: contrato pedagógico.
- `docs/CONTINUIDAD-CHATGPT-PROMPTS-20261101.md`: memoria entre conversaciones.
- `docs/subtopic-depth-reviewed.json`: único registro que acredita cierre humano.
- `scripts/audit_subtopic_depth.py`: inventario y trinquete anti-regresión.

## 3. Estado cuantitativo real

| Indicador | Valor | Interpretación correcta |
|---|---:|---|
| Tracks publicados | 14 | No incluye aún Microservicios ni Docker/Kubernetes como tracks reales |
| Módulos publicados | 254 | Lecciones Markdown existentes |
| Temas publicados | 1.144 | Inventario visible actual |
| Revisión humana de subtemas cerrada | 1 | Tema profundo de lambdas Java |
| Pendientes de revisión humana | 1.143 | No significa que todos estén vacíos; significa que no están acreditados |
| Candidatos prioritarios heurísticos | 1.096 | Señales para ordenar inspección, no veredicto semántico |
| Perfil estructural practicable | 1.143/1.144 | Marcadores detectados; no acredita profundidad ni ejecución |
| Marcadores legacy de siete pasos | 907/1.144 | Los demás pueden usar Aprende/Practica/Aplica |
| Inventario unificado provisional | 74.189 | 1.144 actuales + candidatos de libros/cursos; no son lecciones terminadas |

Trinquete vigente en `scripts/validate.sh`:

```sh
python3 scripts/audit_subtopic_depth.py --check --max-pending 1143
```

La deuda puede bajar, nunca subir. Todo tema nuevo debe incorporarse ya revisado.

## 4. Trabajo realizado en esta tanda

### 4.1 Metodología y control

- Se incorporó la profundidad obligatoria a `AGENTS.md`.
- Se amplió el prompt maestro con mapa de prerrequisitos, núcleo, variantes,
  límites, diagnóstico y profundización.
- Se creó `scripts/audit_subtopic_depth.py`.
- Se crearon los reportes `docs/subtopic-depth-review.json` y `.md`.
- Se añadió el trinquete de 1.143 pendientes a `scripts/validate.sh`.
- Se separaron explícitamente revisión estructural, ejecución, navegador y
  revisión pedagógica humana.

### 4.2 Java

#### Lambda como piloto cerrado

Archivo: `web/public/content/java/modulo-20.md`.

Se insertó antes de interfaces funcionales un tema de lambdas con:

- SAM y `@FunctionalInterface`;
- sintaxis y cuerpos;
- target typing e inferencia;
- captura efectivamente final;
- diferencia de `this` frente a clase anónima;
- cuatro clases de referencias a métodos;
- sobrecarga ambigua;
- excepciones checked y conservación de causa;
- especializaciones primitivas;
- identidad y serialización.

Ejecución registrada con Java 27.0.1: ejemplo principal correcto y fallos de
captura, segundo método abstracto y sobrecarga ambigua reproducidos. Es el único
tema con estado `reviewed` en `docs/subtopic-depth-reviewed.json`.

#### Java módulo 0

Archivo: `web/public/content/java/modulo-0.md`.

Los ocho temas recibieron mapas de subtemas críticos:

1. fuente, bytecode, `.class`, classpath, carga, verificación, JIT y versión;
2. firma `main`, modificadores, argumentos, sobrecargas y entry points;
3. JVM, runtime, JDK, vendor, LTS, `PATH`, `JAVA_HOME` y `jlink`;
4. primitivos, referencias, identidad, aliasing, paso por valor y memoria;
5. variables, conversiones, overflow, IEEE 754, `BigDecimal` y `String`;
6. operadores, precedencia, cortocircuito, ciclos, `switch` y exhaustividad;
7. arrays, copias, varargs, wrappers, boxing y paso de argumentos;
8. entrada, parseo, `java.time`, zonas, DST, duraciones y migración.

Estos mapas **no cierran el módulo**. El siguiente trabajo debe comprobar fila
por fila que existe explicación individual, evidencia, fallo y transferencia.

Se actualizó la presentación del track a Java 27 y las fuentes del primer tema a
la especificación Java/JVM 27.

### 4.3 Android/Kotlin

Archivo: `web/public/content/android/modulo-0.md`.

Se insertó antes de coroutines un tema completo de lambdas y funciones de orden
superior: tipos función, inferencia, captura, receptores, `this`, referencias
callable, SAM, sobrecargas, retornos etiquetados, `inline`, `noinline`,
`crossinline` y estabilidad en Compose.

Estado honesto: contenido contrastado con fuentes Kotlin/Android, pero ejecución
Gradle pendiente porque el entorno no tiene `kotlinc` ni un proyecto Android
generado. No está marcado como revisión humana cerrada.

### 4.4 Foundations

Archivo: `web/public/content/foundations/modulo-0.md`.

Se separó el fundamento «Computador, sistema operativo, programa y proceso» antes
del primer programa. Cubre CPU, RAM, almacenamiento, entrada/salida, sistema
operativo, intérprete, PID, aislamiento, arquitectura y código de salida.

Foundations queda pausado por orden explícita del usuario después de este punto.

### 4.5 Cursos independientes solicitados

#### Microservicios

Plan completo: `docs/PLAN-CURSO-MICROSERVICIOS.md`.

Contiene 17 módulos: fundamentos distribuidos, monolito modular, DDD, contratos,
HTTP/gRPC, mensajería, datos, outbox, idempotencia, sagas, gateway, resiliencia,
seguridad, observabilidad, pruebas, Kubernetes/operación y proyecto RutaFlow.

Estado: plan aprobado; no es todavía track publicado.

#### Docker y Kubernetes

Plan completo: `docs/PLAN-CURSO-DOCKER-KUBERNETES.md`.

Contiene 26 módulos desde procesos, namespaces, cgroups y OCI hasta Docker,
Compose, registros, seguridad, arquitectura Kubernetes, workloads, red,
almacenamiento, scheduling, RBAC, Helm, observabilidad, GitOps, operators, service
mesh, upgrades, etcd, desastre y proyecto profesional.

Estado: plan aprobado; no es todavía track publicado. Los módulos actuales de
DevOps son fuentes internas, no prueba de existencia del nuevo curso.

## 5. Prioridad vigente

1. Java.
2. Spring Boot.
3. Microservicios como curso independiente.
4. Docker y Kubernetes como curso independiente.
5. Flutter.

No volver a Foundations antes de estos frentes salvo nueva instrucción del usuario.

## 6. Cambios locales y propiedad

Rama: `main`.

Último commit ya publicado: `404bcdf4 feat(curriculum): integrate book and Angular Native topics`.

La tanda descrita aquí está **sin commit** y convive con cambios locales previos.
En el corte actual, `git diff --stat` mostró 55 archivos modificados, 3.549
inserciones y 1.398 eliminaciones, además de archivos nuevos. No usar `reset`, no
descartar cambios ni atribuir toda la tanda a un solo paso sin revisar el diff.

Archivos nuevos relevantes:

- `docs/CONTINUIDAD-CHATGPT-PROMPTS-20261101.md`
- `docs/ESTADO-REVISION-MINUCIOSA-20261101.md`
- `docs/PLAN-CURSO-MICROSERVICIOS.md`
- `docs/PLAN-CURSO-DOCKER-KUBERNETES.md`
- `docs/subtopic-depth-reviewed.json`
- `docs/subtopic-depth-review.json`
- `docs/subtopic-depth-review.md`
- `scripts/audit_subtopic_depth.py`

## 7. Validación ejecutada

Último cierre verificado de esta tanda:

```sh
./scripts/validate.sh
```

Resultado: código 0.

- 34 pruebas Python: correctas.
- 14 tracks y 254 módulos estructuralmente válidos.
- 1.144 temas sincronizados.
- fences Markdown balanceados.
- índice, grafo de prerrequisitos y repo graph sincronizados.
- trinquete de profundidad: 1.143 pendientes, sin regresión.

Comprobaciones de aplicación ejecutadas durante la tanda:

```sh
cd web
npm run build
npm test -- --watch=false
```

Resultado: build correcto; 7 archivos y 26 pruebas correctas.

E2E dirigido de Java 20:

```sh
PLAYWRIGHT_CHANNEL=chrome npm run e2e -- --grep 'Java módulo 20'
```

Resultado: 2/2 correcto, escritorio y móvil. También se actualizó el total del
catálogo en el E2E a 74.189.

## 8. Qué no está demostrado

- No se han revisado humanamente 1.143 temas.
- No se han ejecutado todos los ejemplos de Java, Spring, Flutter ni los demás tracks.
- Los planes de Microservicios y Docker/Kubernetes no son cursos publicados.
- Tener nueve marcadores estructurales no prueba explicación correcta.
- Tener siete pasos no prueba profundidad.
- Tener una URL oficial no prueba que cada afirmación la aplique correctamente.
- Los candidatos bibliográficos no son temas listos para publicar.
- 109 libros todavía requieren OCR según el inventario unificado.

## 9. Procedimiento obligatorio para continuar

### Antes de editar

1. Leer `docs/repo-graph.md`.
2. Leer `AGENTS.md` completo.
3. Leer el prompt maestro y este documento.
4. Ejecutar `git status --short`; preservar toda modificación existente.
5. Consultar `docs/subtopic-depth-review.md` y el Markdown real, no sólo reportes.

### Por cada tema

1. Identificar prerrequisitos no enseñados y corregir el orden.
2. Crear el mapa completo y específico de subtemas.
3. Clasificar prerrequisito, núcleo, variante, límite, diagnóstico y profundidad.
4. Comparar cada subtema con la explicación real.
5. Añadir ejemplo, archivo, comando, salida y fallo propios cuando sean necesarios.
6. Ejecutar proporcionalmente y registrar versión y resultado.
7. Contrastar versiones/librerías con documentación primaria.
8. Registrar en `subtopic-depth-reviewed.json` sólo cuando todas las filas cierren.
9. Regenerar reportes e índices.
10. Ejecutar validación, build/pruebas y E2E cuando corresponda.

### Orden inmediato

Continuar en `web/public/content/java/modulo-0.md`. Para cada uno de sus ocho
mapas, localizar subtemas mencionados pero no explicados individualmente. El primer
tema a cerrar es «Del código fuente a la JVM». No pasar a Spring hasta cerrar el
lote acordado de Java o recibir una instrucción diferente.

## 10. Comandos de regeneración

Después de cambios de contenido o estructura:

```sh
python3 scripts/build_web_topic_index.py
python3 scripts/build_prerequisite_graph.py
python3 scripts/audit_subtopic_depth.py
python3 scripts/audit_seven_step_methodology.py
python3 scripts/audit_lesson_substance.py
python3 scripts/audit_topic_learning_quality.py
python3 scripts/audit_code_visual_quality.py
python3 scripts/rebuild_topic_source_review.py
python3 scripts/build_editorial_backlog.py
python3 scripts/audit_course_depth.py
python3 scripts/build_full_review.py
python3 scripts/build_unified_curriculum.py
python3 scripts/build_web_curriculum_catalog.py
python3 scripts/build_repo_graph.py
./scripts/validate.sh
```

Si cambia la aplicación o metadatos visibles:

```sh
cd web
npm run build
npm test -- --watch=false
PLAYWRIGHT_CHANNEL=chrome npm run e2e -- --grep '<recorrido afectado>'
```

## 11. Criterio de entrega al siguiente responsable

No informar «todo está completo». Informar:

- temas inspeccionados;
- temas cerrados humanamente;
- ejemplos realmente ejecutados;
- plataformas no probadas;
- fuentes verificadas;
- deuda restante por track;
- primer identificador exacto pendiente.

La siguiente persona debe poder reproducir la validación y explicar por qué cada
tema cerrado es minucioso, no sólo mostrar que un script devolvió código 0.

---

## 12. Avance posterior: cierre de explicaciones individuales de Java módulo 0

Fecha: 2026-11-01 (sesión de continuación). Entorno: Temurin **JDK 27.0.1** (`java -version`
confirmado), macOS aarch64.

### 12.1 Qué se hizo

Se cerró la **explicación individual de cada subtema crítico** de los ocho temas de
`web/public/content/java/modulo-0.md`. No se añadieron temas nuevos ni se tocó el conteo
(sigue 1.144). El trabajo consistió en comparar fila por fila cada mapa de subtemas contra
el contenido real y **ampliar los subtemas que solo estaban mencionados**, con evidencia
ejecutada.

Por tema, subtemas que estaban solo mencionados y ahora tienen explicación propia + evidencia:

1. **Del código fuente a la JVM:** nombre de archivo = clase pública; formato `.class` e
   instrucciones (`getstatic`/`ldc`/`invokevirtual`); verificación/interpretación/JIT; versión
   del class file (major 65 vs 71); JDK compilación vs runtime; nombre binario y paquete→ruta;
   diferencia real **`ClassNotFoundException` vs `NoClassDefFoundError`** (reproducida de verdad).
2. **`public static void main`:** `void` vs **código de salida** (`System.exit`); `String...`
   (varargs); **sobrecargas** de `main`; **clases anidadas / múltiples entry points**
   (`Externa$Interna`); **lanzamiento de fuente única** (`java Archivo.java`).
3. **JDK/JRE/JVM:** JRE histórico vs runtime actual; **proveedor y licencia** (`java.vendor`);
   **LTS vs feature release**; **`jlink`** (runtime mínimo de ~45M); **arquitectura del binario**
   (`os.arch`).
4. **Primitivos vs referencias:** los **ocho primitivos** con rangos; **identidad vs igualdad**
   (`==`/`equals`, caché de `Integer`); **campos vs locales** y valores por defecto (local sin
   inicializar = error de compilación); **paso por valor** (mutar vs reasignar); memoria/GC
   (sin el mito stack/heap); **inmutabilidad** (`final` vs objeto inmutable).
5. **Variables, conversiones y `String`:** `var`; alcance/**shadowing**; widening/narrowing;
   **overflow** (`MAX_VALUE+1`, `Math.addExact`); **promoción numérica**; **IEEE 754**
   (`0.1+0.2`); `BigDecimal`; `Objects.equals`; `StringBuilder`/text blocks.
6. **Operadores y control de flujo:** división entera y resto; precedencia con paréntesis;
   incremento pre/post; **switch statement vs expression y fall-through**; **etiquetas**
   (`break/continue afuera`); **pattern matching** sobre `sealed`; ciclos.
7. **Arreglos y paso de argumentos:** **arrays dentados**; **copia superficial** (`clone`/`copyOf`
   superficial en matrices); **varargs**; caché de wrappers; **genéricos y boxing** de
   `List<Integer>`.
8. **Entrada y `java.time`:** `Scanner`; `LocalDate/LocalTime/LocalDateTime`; **`Instant`**;
   **`ZoneId`/`ZonedDateTime`**; **`OffsetDateTime`**; **`Duration` vs `Period`**;
   **`DateTimeFormatter`**; **DST/huecos** (02:30 inexistente → 03:30-04:00); `Date`/`Calendar`.

Cada tema añade un laboratorio ejecutable con **salida real** capturada y etiquetada
"verificada con Temurin 27.0.1", más fallos deliberados reproducidos.

### 12.2 Corrección de versiones

Se unificó el módulo a **Java 27**: prerrequisitos, presentación e instalación. Se eliminaron
las referencias a "JDK 21 o posterior" como línea base y las fuentes a **Java SE 25 / JLS se25 /
jls/se21**; ahora apuntan a Java SE 27 y JLS se27. Las menciones a Java 21 que permanecen son
intencionales (explican la relación `--release 21` → major 65 frente a Java 27 → major 71).

### 12.3 Errores detectados por la ejecución real (corregidos)

- El checklist original del Tema 1 afirmaba que **borrar el `.class` produce "un fallo distinto"**
  (insinuando `NoClassDefFoundError`). Al ejecutarlo, produce el **mismo** `ClassNotFoundException`.
  Se corrigió reproduciendo el `NoClassDefFoundError` de verdad (dependencia que desaparece en runtime).
- Un fallo deliberado de `jlink` que planteé con `java.sql.Types.VARCHAR` **no falla**, porque la
  constante se inlinea en el bytecode. Se corrigió usando `Class.forName("java.sql.Date")`, que sí
  fuerza la carga del módulo y lanza `ClassNotFoundException` en el runtime mínimo.

Estos dos puntos son la razón por la que la ejecución real es obligatoria: la estructura "parecía"
correcta pero la afirmación era falsa.

### 12.4 Estado del registro de revisión humana

**No se marcó ningún tema nuevo como `reviewed`** en `docs/subtopic-depth-reviewed.json`. El
trinquete sigue en **1.143 pendientes** (solo lambdas Java cerrado). El trabajo de esta sesión
completa la explicación individual y la ejecución técnica de los 8 temas de Java 0, pero el cierre
humano lo debe confirmar el responsable revisando el contenido. Cuando se confirme, estos 8 temas
son candidatos inmediatos a pasar a `reviewed` y bajar la deuda a 1.135.

### 12.5 Validación ejecutada

- `java -version` → Temurin 27.0.1; todos los laboratorios compilados y ejecutados con ese JDK.
- `scripts/validate_markdown_fences.py`: OK.
- `scripts/audit_topic_learning_quality.py --check`: 1143/1144 practicables, deuda 1 (sin regresión).
- `./scripts/validate.sh`: EXIT 0.
- Reportes regenerados: topic-index, prerequisite-graph, subtopic-depth, seven-step, lesson-substance,
  topic-learning-quality, code-visual-quality, editorial-backlog, course-depth, full-review, repo-graph.

### 12.6 Punto exacto para continuar

Java módulo 0 queda con explicación individual completa y evidencia ejecutada. Siguiente paso según
la prioridad vigente (Java → Spring → Microservicios → Flutter): continuar con **`java/modulo-1.md`**
aplicando el mismo procedimiento (mapa → comparación fila por fila → ampliación → ejecución), o bien
que el responsable confirme el cierre humano de Java 0 para actualizar `subtopic-depth-reviewed.json`.

---

## 13. Avance: cierre de explicaciones individuales de Java módulo 1 (POO)

Fecha: 2026-11-01 (continuación). Entorno: Temurin **JDK 27.0.1**, macOS aarch64.

### 13.1 Qué se hizo

`java/modulo-1.md` **no tenía mapas de subtemas** (Codex no llegó a este módulo). Se crearon los
mapas de los 4 temas y se añadió la explicación individual de cada subtema crítico con evidencia
ejecutada. No cambió el conteo de temas.

1. **Clases, objetos, constructores y encapsulación:** clase vs instancia; `this`; campos de
   instancia vs estáticos; constructor por defecto que desaparece al declarar uno explícito;
   sobrecarga de constructores con `this(...)`; `private final`; getters sin setters; identidad
   (`==`) de objetos. Evidencia: contador estático, constructor sobrecargado, `new Guia()` que no
   compila.
2. **Herencia y sobreescritura:** `extends`/`super(...)`/`super.metodo()`; dispatch dinámico;
   sobreescritura de `Object.toString()`; `instanceof` y downcasting con `ClassCastException`;
   `sealed`/`permits`; `@interface`/`@Target`/`@Retention` y reflexión. Evidencia: `Demo` con
   polimorfismo, `ClassCastException`, error de `sealed` fuera de `permits`.
3. **Interfaces y clases abstractas:** contrato; `default`/`static` en interfaz; implementación
   múltiple; conflicto de `default` (diamante) resuelto con `Interfaz.super`; clase abstracta no
   instanciable; interfaz vs abstracta; interfaz funcional. Evidencia: diamante resuelto, error
   `Forma is abstract; cannot be instantiated`, error del diamante sin resolver.
4. **Sobrecarga vs sobreescritura y modificadores:** sobrecarga; resolución de sobrecarga en
   compilación (exacto > widening > boxing > varargs); covarianza del tipo de retorno; los 4
   niveles de acceso; mínimo privilegio. Evidencia: `tipo(5)`/`tipo(5L)`/`tipo("x")`, covarianza,
   error `saldo has private access in Tarifa`.

### 13.2 Versiones y fuentes

Unificado a Java 27: prerrequisitos y fuentes (`dev.java`, JLS se27, API 27, The Java Tutorials).
Eliminadas las referencias a JDK 21 como base.

### 13.3 Errores corregidos por la ejecución real

- El fallo de `sealed` se verificó: el mensaje real es `class is not allowed to extend sealed class`.
- El error del diamante sin resolver se verificó: `types V and N are incompatible`.
- Se corrigió un `cola-tras-cierre` en el Tema 2 moviendo el laboratorio `Demo` del Paso 6 (Aplica)
  al Paso 5 (Practica), dejando en Aplica solo el ejercicio de transferencia.

### 13.4 Registro de revisión humana

Igual que con módulo 0: **no se marcó ningún tema como `reviewed`**. El trinquete sigue en **1.143
pendientes**. Java 0 y Java 1 tienen ahora explicación individual completa y evidencia técnica
ejecutada, pero el cierre humano lo confirma el responsable.

### 13.5 Validación

- Laboratorios compilados y ejecutados con Temurin 27.0.1.
- `validate_markdown_fences.py`: OK. `audit_lesson_substance.py --check --strict`: 0 defectos.
- `audit_topic_learning_quality.py --check`: 1143/1144, sin regresión.
- `./scripts/validate.sh`: EXIT 0. Reportes e índices regenerados.

### 13.6 Punto para continuar

Siguiente: `java/modulo-2.md` con el mismo procedimiento (mapa → comparación fila por fila →
ampliación → ejecución), siguiendo la prioridad Java → Spring → Microservicios → Flutter.

---

## 14. Avance: cierre de explicaciones individuales de Java módulo 2 (colecciones y genéricos)

Fecha: 2026-11-01 (continuación). Entorno: Temurin **JDK 27.0.1**, macOS aarch64.

### 14.1 Qué se hizo

`java/modulo-2.md` no tenía mapas de subtemas. Se crearon los mapas de los 3 temas y se añadió la
explicación individual de cada subtema crítico con evidencia ejecutada.

1. **List, Set, Map e implementaciones:** `List`/`ArrayList`/`LinkedList` con su Big-O; `Set` y
   unicidad; **`equals`/`hashCode` como contrato** (sin ellos el `Set` no detecta duplicados:
   `size=2` vs `size=1`); orden por implementación (`HashSet`/`LinkedHashSet`/`TreeSet`); `Map`;
   colecciones inmutables (`List.of` → `UnsupportedOperationException`); **iteración y
   `ConcurrentModificationException`** (resuelto con `removeIf`/`Iterator.remove`); medición
   informal vs benchmark.
2. **Genéricos, wildcards y type erasure:** clase y **método genérico**; **bounded type**
   (`<T extends Comparable<T>>`); **PECS** (`? extends` productor, `? super` consumidor); type
   erasure (`getClass()` idéntico); **límites del erasure** (`instanceof List<String>` no compila);
   **raw types** (warning `unchecked` + `ClassCastException`).
3. **Comparable vs Comparator e iteración:** orden natural; **contrato de `compareTo`**; **el bug
   de la resta** (`MIN_VALUE - 1` desborda a `2147483647`; usar `Integer.compare`); `Comparator`
   externo; `comparing`/`thenComparing`/`reversed`; **nulos** (`nullsFirst`); consistencia
   `compareTo`/`equals` en `TreeSet`; iteración de `Map` con `entrySet()`.

### 14.2 Puntos destacados verificados por ejecución

- Sin `equals`/`hashCode`, un `HashSet` deja `size=2` ante dos objetos lógicamente iguales; con un
  `record` (que los aporta), `size=1`.
- `Integer.MIN_VALUE - 1 == 2147483647` (positivo): confirma por qué `compareTo` con resta es un bug
  real; `Integer.compare` da `-1`.
- `o instanceof List<String>` no compila: `Object cannot be safely cast to List<String>`.
- Raw type: warning `unchecked` al compilar y `ClassCastException` al ejecutar.
- Se eliminó una línea de "Fuente oficial" duplicada en el Tema 2.

### 14.3 Versiones, registro humano y validación

- Unificado a Java 27; fuentes a API/JLS se27, dev.java y The Java Tutorials.
- **No se marcó ningún tema como `reviewed`.** Trinquete en **1.143 pendientes**.
- `validate_markdown_fences.py` OK; `audit_lesson_substance.py --check --strict` 0 defectos;
  `audit_topic_learning_quality.py --check` 1143/1144 sin regresión; `./scripts/validate.sh` EXIT 0.
- Reportes e índices regenerados.

### 14.4 Punto para continuar

Java módulos 0, 1 y 2 cerrados en explicación individual y evidencia técnica. Siguiente:
`java/modulo-3.md` con el mismo procedimiento, siguiendo la prioridad Java → Spring →
Microservicios → Flutter.

---

## 15. Avance continuo (permiso total): Java módulos 3 y 4

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**.

Se autorizó cerrar con minuciosidad todos los módulos de Java, Spring Boot, Microservicios
(Kafka/RabbitMQ/gRPC dentro de Spring), Flutter y Node. Se usan los outlines de los libros del
disco externo (`/Volumes/Nicolas/03_Libros_Biblioteca`, ya catalogados en `docs/biblioteca/` y en
`docs/biblioteca-externa-gaps-*.md`) para enriquecer los mapas de subtemas, sin copiar texto; la
autoridad técnica sigue siendo la documentación oficial (JLS/API se27, dev.java) y la evidencia la
ejecuto yo en JDK 27.

- **Java módulo 3 (excepciones):** jerarquía `Throwable`, checked/unchecked, `try/catch/finally`,
  orden de catch (`already been caught`), multicatch, `Error`; try-with-resources con `AutoCloseable`,
  orden de cierre inverso y **suppressed exceptions**; excepción de dominio, **encadenamiento de
  causa** y wrapping checked→unchecked, antipatrón del catch vacío y del relanzamiento sin causa.
- **Java módulo 4 (streams):** pipeline/intermedias/terminales, pereza y **consumo único**
  (`IllegalStateException`), `Collectors` (`groupingBy`/`joining`/`summingDouble`), `reduce`,
  `IntStream`, `iterate+limit`, pureza; `Optional` (creación, `map`/`filter`, **`orElse` vs
  `orElseGet`** verificado con Optional presente, `get()`→`NoSuchElementException`, dónde no usarlo);
  streams paralelos (overhead, correctitud antes que velocidad, condiciones de carrera); **Stream
  Gatherers** (`windowSliding`/`windowFixed`) verificados en JDK 27.

Versiones unificadas a Java 27 (se eliminaron referencias a JDK 21 y API/JLS se25). Sin marcar
`reviewed`; trinquete en 1.143. `validate.sh` EXIT 0 (requiere regenerar también
`rebuild_topic_source_review.py`). Reportes e índices regenerados.

Acumulado cerrado en explicación individual + evidencia: Java 0, 1, 2, 3, 4, 20.
Siguiente: `java/modulo-5.md`.

---

## 16. Avance: Java módulo 5 (concurrencia, 7 temas)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**.

Cerrados con mapa de subtemas + explicación individual + evidencia los 7 temas:
1. **ExecutorService:** Runnable/Callable, `Future`+`ExecutionException`, `invokeAll`,
   `shutdown`/`shutdownNow`/`awaitTermination`, tipos de pool, executor de virtual threads.
2. **CompletableFuture:** `supplyAsync`, `thenApply` vs `thenCompose`, `thenCombine`,
   `exceptionally`/`handle`, `CompletionException`, elección de executor.
3. **Virtual threads:** platform vs virtual, carrier/montado-desmontado, I/O vs CPU, pinning (JEP 491),
   backpressure.
4. **Condiciones de carrera:** carrera real (perdió ~27 000 incrementos de 100 000), `synchronized`,
   `AtomicInteger`/CAS, **`volatile` no arregla `++`** (verificado: 37 066), primitivas, deadlock.
5. **Structured Concurrency (preview):** `fork`/`join`, `Joiner`, cancelación conjunta vs
   `CompletableFuture` suelto; estado preview confirmado (`--enable-preview`).
6. **Scoped Values:** vs `ThreadLocal`, `where(...).run`, inmutabilidad, herencia a subtareas,
   liberación automática; `ScopedValue` estable, scope preview (verificado).
7. **Timeouts/cancelación:** `get(timeout)`, `cancel(true)`, interrupción cooperativa,
   `InterruptedException`+restaurar marca, dejar de esperar ≠ detener, terminación verificada.

Versiones a Java 27 (API/JLS/core se27; se eliminaron API 25 y JDK 8/11/21 como base, conservando
notas de compatibilidad). Sin marcar `reviewed`; trinquete 1.143. `validate.sh` EXIT 0.

Acumulado cerrado: Java 0, 1, 2, 3, 4, 5, 20. Siguiente: `java/modulo-6.md`.

---

## 17. Temas faltantes de Java insertados (cruce con los libros del disco)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**.

Se extrajeron los **outlines reales** (PyMuPDF, sin copiar páginas) de Core Java I/II (Horstmann) y
Java a fondo (Sznajdleder) y se cruzaron con los 23 módulos del track. El cruce actualizado quedó en
`docs/biblioteca-externa-gaps-java.md`. Dos huecos de **prioridad alta** eran capítulo propio en los
libros y faltaban; se insertaron en el **Módulo 18** con la puerta de calidad completa:

- **M18 Tema 3 — Sockets TCP y UDP** (la red bajo `HttpClient`): modelo cliente/servidor y puertos,
  `ServerSocket`/`accept`, `Socket` y streams con charset, TCP fiable/ordenado, UDP
  `DatagramSocket`/`DatagramPacket`, TCP vs UDP, `setSoTimeout`→`SocketTimeoutException`,
  `BindException`, un hilo por conexión vs virtual threads. Evidencia ejecutada (`DemoSockets`).
- **M18 Tema 4 — Seguridad defensiva** (hash, HMAC, firma, cifrado): `MessageDigest`/SHA-256,
  `MessageDigest.isEqual` (tiempo constante), por qué el hash no vale para contraseñas, HMAC (`Mac`),
  firma ECDSA (`Signature`, válida/inválida), AES-GCM (`Cipher`) con `AEADBadTagException`, IV único
  con `SecureRandom`, hash vs HMAC vs firma vs cifrado. Evidencia ejecutada (`DemoSeguridad`).

**Impacto en los conteos:** el total subió de 1.144 a **1.146 temas**. Como la regla exige que un
tema nuevo entre **ya revisado**, ambos se registraron en `docs/subtopic-depth-reviewed.json` con su
ejecución; el trinquete se mantiene en **1.143 pendientes** (3 revisados de 1.146) y **la deuda no
aumentó**. Se actualizaron README (inventario y cobertura 1145/1146) y la metadata del M18 en
`java.track.ts` (de 2 a 4 temas, 8 h). Fuentes del M18 corregidas de JDK 25 a Java SE 27.

Verificación: `validate.sh` EXIT 0; `npm run build` OK; `audit_lesson_substance --check --strict` 0
defectos; `audit_subtopic_depth --check --max-pending 1143` OK. Reportes e índices regenerados.

Pendientes de los libros (prioridad media/baja, documentados en el gaps): JDBC avanzado (M17),
mmap/file locking (M6), enum avanzado/inner classes (M22), algoritmos de `Collections` (M2), JShell,
Compiler API, `java.util.logging`.

Acumulado cerrado con minuciosidad: Java 0, 1, 2, 3, 4, 5, 20 + M18 T3/T4 (nuevos). Siguiente:
seguir cerrando módulos Java existentes desde `java/modulo-6.md`.

---

## 18. Avance: Java módulo 6 (I/O, NIO.2, serialización)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**.

Cerrados con mapa + explicación individual + evidencia los 3 temas:
1. **NIO.2:** `Path` vs `File`, operaciones de `Files` (read/write/copy/size/walk), `createDirectories`,
   `resolve` vs `normalize`, path traversal (`startsWith`), enlaces simbólicos (`toRealPath`).
   Evidencia `DemoFiles` ejecutada.
2. **Jackson:** `ObjectMapper` ciclo serializar/deserializar, records como modelo, campos ausentes y
   valores por defecto, deserialización estricta (`FAIL_ON_*`), `JsonNode`/`Map`, versión fija.
   Jackson actualizado a 2.21.8 y `compiler.release` a 27.
3. **Archivos grandes y classpath:** cargar todo vs streaming, `BufferedReader`/`readLine`, memoria
   por línea (límite), `Files.lines`, `getResourceAsStream`, classpath vs sistema de archivos.

Versiones a Java 27 (API se27; se eliminaron JDK 11/21 y API 25). Sin marcar `reviewed`; trinquete
en **1.143 pendientes** de **1.146 temas** (3 revisados: lambdas Java 20 + sockets M18 + seguridad M18).
`validate.sh` EXIT 0; `npm run build` OK.

Acumulado cerrado con minuciosidad: Java 0, 1, 2, 3, 4, 5, 6, 20 + M18 T3/T4 (nuevos).
Siguiente: `java/modulo-7.md` (records, sealed, pattern matching).

---

## 19. Avance: Java módulo 7 (records, sealed, pattern matching)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**.

Cerrados con mapa + explicación individual + evidencia los 4 temas:
1. **record:** declaración y qué genera, accesores sin `get`, equals/hashCode/toString por valor,
   inmutabilidad superficial, constructor compacto, **copia defensiva** (`List.copyOf`), "wither",
   cuándo no usar record. Evidencia `Demo` ejecutada.
2. **sealed:** `permits`, `final`/`sealed`/`non-sealed`, exhaustividad sin `default`, sealed+records
   = ADT, alcance de `permits`, cuándo no sellar.
3. **pattern matching:** `instanceof` con binding, type patterns, **record patterns** (deconstrucción),
   **guardas `when`**, exhaustividad sobre sealed, `case null`. Evidencia `Demo` ejecutada.
4. **unnamed (`_`):** en record pattern, en `catch`, en bucles/recursos, `_` no es variable, descarte
   explícito vs nombre sin usar. Verificado en JDK 27.

Versiones a Java 27 (JEP + API se27; se eliminaron JDK 16/17/21 como base y javase/22/25). Sin marcar
`reviewed`; trinquete 1.143 de 1.146. `validate.sh` EXIT 0.

Acumulado cerrado: Java 0, 1, 2, 3, 4, 5, 6, 7, 20 + M18 T3/T4 (nuevos). Siguiente: `java/modulo-8.md`
(Maven y Gradle).

---

## 20. Cursos separados nuevos (Maven/Gradle y JDBC) + Java módulo 8

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**, Maven 3.10.0.

El usuario señaló que **Maven/Gradle y JDBC están cortos** en el track (se ven por encima) y pidió
enseñarlos **de cero a experto en cursos separados**. Se crearon dos planes (aprobados, no publicados):

- `docs/PLAN-CURSO-BUILD-MAVEN-GRADLE.md` — 17 módulos (0–16): de compilar a mano a build
  multi-módulo reproducible con BOM/version catalogs, caché/incrementalidad, toolchains, publicación,
  plugins propios, SBOM y CI. El track Java conserva el uso básico (M8, M15).
- `docs/PLAN-CURSO-JDBC-BASES-DATOS.md` — 16 módulos (0–15): del modelo
  `Driver`/`Connection`/`ResultSet` a DAO con pool, transacciones y niveles de aislamiento (con
  anomalías reproducidas), batch, streaming/keyset, tipos exactos, metadata/RowSet, operación y
  migraciones. El track Java conserva la intro JDBC (M17) y Spring Boot conserva JPA.

Lista total de cursos separados aprobados: Microservicios, Docker/Kubernetes, Build (Maven/Gradle),
JDBC/Bases de datos. Registrados también en `docs/CONTINUIDAD-CHATGPT-PROMPTS-20261101.md`.

**Java módulo 8 (Build tools)** cerrado con minuciosidad como **introducción** (frontera: uso básico;
la profundidad experta vive en el curso separado, con nota de remisión en el tema). Mapas +
explicación individual + verificación con Maven 3.10.0:
1. `pom.xml` vs `build.gradle.kts`: coordenadas, declaración, versión fija/reproducibilidad,
   repositorio/resolución, dependencias transitivas, XML vs DSL.
2. ciclo de vida y scopes: fases y su orden, una fase implica las anteriores, binding fase→goal,
   scope, el JAR plano sin dependencias.
3. multi-módulo: POM agregador, herencia, dependencia interna explícita, dirección de dependencia,
   reactor/orden, ciclos.
4. Maven vs Gradle lado a lado: dos filosofías, equivalencia de comandos, wrapper, estructura
   estándar, cuál elegir.

`validate.sh` EXIT 0. Sin marcar `reviewed`; trinquete 1.143 de 1.146.

Acumulado cerrado: Java 0, 1, 2, 3, 4, 5, 6, 7, 8, 20 + M18 T3/T4 (nuevos). Siguiente: `java/modulo-9.md`
(JUnit 5 y Mockito).

---

## 21. Avance: Java módulo 9 (testing: JUnit 5 y Mockito)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**, Maven 3.10.0.

Cerrados con mapa + explicación individual + evidencia los 3 temas:
1. **JUnit 5:** `@Test`/aserciones, ciclo de vida (`@BeforeEach`/`@AfterEach`/`@BeforeAll`/`@AfterAll`),
   instancia por prueba y `@TestInstance`, aislamiento/independencia del orden, aserciones expresivas
   (`assertThrows`/`assertAll`, verificadas con Maven).
2. **Mockito:** mock vs real, `@Mock`/`@InjectMocks`, stub `when/thenReturn`, `verify`, argument
   matchers (`any`/`eq`), `thenThrow`, cuándo no mockear.
3. **Parametrizados y cobertura:** `@ParameterizedTest`+`@ValueSource`/`@CsvSource`/`@MethodSource`,
   cobertura de líneas y ramas con JaCoCo, **qué NO mide la cobertura** (100% líneas ≠ corrección),
   aserciones fluidas (AssertJ).

Primera tanda **subida al remoto**: rama `revision-minuciosa-java-20261101` (commit 65876fb7) con
Java 0–8, 20 + M18 T3/T4 + planes de cursos separados. Este M9 va en el siguiente commit de la misma
rama.

`validate.sh` EXIT 0. Sin marcar `reviewed`; trinquete 1.143 de 1.146.

Acumulado cerrado: Java 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 20 + M18 T3/T4. Siguiente: `java/modulo-10.md`
(JPMS/módulos).

---

## 22. Avance: Java módulos 10 (JPMS) y 11 (JVM interna)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**.

- **Módulo 10 (JPMS):** `module-info`, `exports`/encapsulación fuerte, `requires`/`requires transitive`,
  module path vs classpath, named/automatic/unnamed; migración bottom-up, automatic modules como
  puente, costo/beneficio; `exports` vs `opens`, `InaccessibleObjectException`, `opens ... to` acotado,
  `open module`. Evidencia JPMS ejecutada (paquete no exportado → `is not visible`).
- **Módulo 11 (JVM interna):** generaciones y GC (hipótesis generacional, G1/ZGC, G1 default JDK 27
  JEP 523, heap vs memoria nativa); JFR y JIT (bajo overhead, `jdk.ExecutionSample`, warm-up, inlining,
  `-Xint`); referencias `Weak`/`Soft`/`Phantom`, OOM controlado, heap dump (dominators/retained);
  **FFM** (`Linker`/`MethodHandle`/`Arena`/`MemorySegment`), verificado en JDK 27 (`strlen`=15,
  `--enable-native-access`).

Versiones a Java 27 (se eliminaron javase/25 y javase/22). `validate.sh` EXIT 0. Sin marcar
`reviewed`; trinquete 1.143 de 1.146.

Acumulado cerrado: Java 0,1,2,3,4,5,6,7,8,9,10,11,20 + M18 T3/T4. Siguiente: `java/modulo-12.md`
(patrones de diseño).
