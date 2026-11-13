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

---

## 23. Avance: Java módulos 12 (patrones) y 13 (proyecto integrador)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**.

- **Módulo 12 (patrones de diseño, 6 temas):** Builder (telescópico, fluido, validación en `build`),
  Factory simple/Factory Method/Strategy (qué varía), Abstract Factory (familia coherente), SOLID
  (SRP/OCP/LSP/ISP/DIP + cuándo NO aplicar), Prototype (copia superficial/profunda, `clone` vs
  constructor de copia), estructurales (Adapter/Decorator/Proxy/Facade/Bridge, elegir por intención).
  Fuentes Refactoring Guru + libro Shvets del disco.
- **Módulo 13 (proyecto integrador, 3 temas):** arquitectura por capas (dirección de dependencia,
  dominio sin infraestructura, puerto/adaptador, fitness function); integración concurrencia+sealed
  Exito/Error+testing (fallo esperado vs error interno); build reproducible (`outputTimestamp`,
  comparación byte a byte, fijar entorno).

Versiones a Java 27. `validate.sh` EXIT 0. Sin marcar `reviewed`; trinquete 1.143 de 1.146.

Acumulado cerrado: Java 0–13 y 20 + M18 T3/T4. Siguiente: `java/modulo-14.md` (Java en producción).

## 24. Avance: Java módulos 14 (producción) y 15 (Java Master)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1** (Maven 3.10.0 con JDK 27 Homebrew).

- **Módulo 14 (Java en producción, 4 temas):** compartir memoria (JMM, happens-before,
  `volatile` vs atomicidad, `AtomicLong`/`LongAdder`, publicación segura, inmutabilidad
  superficial vs profunda); benchmarks JMH (dead code elimination, consumo por retorno vs
  `Blackhole`, warmup/forks/iteraciones, `@State`/`@Setup`/`@Param`, procesador de anotaciones,
  `Score` vs `Error`, microbenchmark ≠ latencia); deserialización segura (`ObjectInputFilter`,
  allowlist terminada en `!*`, `java.base/*` para tipos internos, `maxdepth`/`maxrefs`/`maxbytes`,
  JSON cerrado para entradas nuevas, allowlist no denylist); runtime como artefacto
  (`jdeps --print-module-deps`, `jlink`, módulo ausente ⇒ `NoClassDefFoundError`, límites de la
  detección estática, `-Xmx` no cubre no-heap, ciclo de vida/reconstrucción ante parche).
- **Módulo 15 (Java Master, 6 temas):** Maven avanzado (reactor, `dependencyManagement` vs
  declarar, BOM `import`, convergencia, Enforcer `requireJavaVersion`, POM efectivo, perfiles no
  para secretos); Gradle/JAR reproducible (`jar --date`, orden estable, equivalencias Gradle,
  wrapper/toolchain, locking + verification metadata, caché solo determinista); multi-módulo sin
  ciclos (capas, dirección de dependencias, puerto/adaptador, ArchUnit sobre bytecode,
  `freeOfCycles`, build impide inversión, módulo-por-paquete = sobre-ingeniería); JUnit/Mockito/
  AssertJ (fake vs mock de frontera, `@ExtendWith`, aserción de estado, `verify` del contrato, no
  mockear SUT, `verifyNoMoreInteractions` con criterio, `ArgumentCaptor` vs estado);
  Testcontainers (PostgreSQL versionado, Flyway, JDBC real con `NUMERIC`/`DATE`, Surefire vs
  Failsafe, aislamiento con `truncate`, esperar condición, migración inmutable); SLF4J/Logback/MDC
  (fachada vs impl, logging parametrizado, MDC por hilo, `putCloseable`, contaminación de pool,
  encoder JSON, no secretos ni stack traces duplicados).

Evidencia reproducida por mí en JDK 27: M14 T1 (`terminado=false` sin `volatile`), M14 T2 (tabla
JMH real de 6 combinaciones; nota sobre *Compiler Blackholes* de la JVM 27), M14 T3 (`valido=…`,
`sin-filtro=…Unexpected`, `con-filtro=InvalidClassException: REJECTED`, y rechazo al quitar
`java.base/*`), M14 T4 (`jdeps` → `java.base,java.logging,java.net.http`, `jlink` 48 MB vs 296 MB,
`cliente=HTTP_2`, fallo sin `java.logging` = `NoClassDefFoundError`), M15 T2 (dos SHA-256 iguales
con `--date`, distintos sin él). Fuentes de temas actualizadas a `jls/se27` y API `javase/27`.

Importante sobre el atlas: el enlace del bloque `OFFICIAL-TOPIC-ATLAS` de Java **se mantiene en
`javase/25`** porque `docs/official-topic-atlas.json` y `validate_official_sources.py` lo exigen
(la LTS 25 es la base documental global del track; el curso enseña en 27). No cambiar el atlas sin
actualizar también ese JSON y el test `test_source_review_matches_current_markdown`.

`validate.sh` EXIT 0. Trinquete `--max-pending 1143` OK (sin marcar nuevos `reviewed`).
Orden de regeneración usado: topic_learning_quality → code_visual_quality → lesson_substance →
rebuild_topic_source_review → editorial_backlog → course_depth → full_review → repo_graph.

Acumulado cerrado: Java 0–15 y 20 + M18 T3/T4. Siguiente: `java/modulo-16.md` (JPA).

## 25. Avance: Java módulos 16 (JPA), 17 (JDBC) y 18 T1-T2 (HTTP/seguridad)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**.

- **Módulo 16 (JPA/Hibernate, 2 temas):** entidades y relaciones (`@Entity`/`@Id`/
  `@GeneratedValue`, propietario vs inverso, sincronizar agregado, `CascadeType.PERSIST`
  no implica `REMOVE`, `@Enumerated(STRING)`, unidireccional cuando aplica, no setters
  generales); LAZY/EAGER/N+1 (defaults de fetch, N+1 medido con `getPrepareStatementCount`
  = 11, `JOIN FETCH` + `distinct` = 1, medir con `clear()`, `EAGER` ≠ un join, paginar
  fetch de colección es en memoria, DTO para listados).
- **Módulo 17 (JDBC/DAO/transacciones, 2 temas):** DAO (`DataSource`, `PreparedStatement`
  fija estructura, try-with-resources, encapsular SQL, parámetros no identificadores →
  allowlist de orden, comprobar `executeUpdate`, no DAO genérico); transacciones (ACID,
  `setAutoCommit(false)`+commit/rollback, una sola conexión por unidad, aislamiento y
  anomalías, bloqueo optimista con `version`, idempotencia con `UNIQUE`, no transacción
  durante HTTP → outbox/saga). Añadida nota de remisión al curso separado JDBC.
- **Módulo 18 T1-T2:** T1 HttpClient (cliente reutilizable, `HttpRequest`, timeout de
  conexión vs solicitud, separar transporte de cuerpo, 200/404/timeout, reintento solo
  idempotentes, backoff con jitter); T2 tokens/seguridad (autenticación vs autorización
  por objeto, bearer sin loguear, validar en cada frontera, JWT/OAuth2/OIDC, SSRF con
  validación de DNS, parametrización ≠ autorización, no criptografía propia). T3 y T4 ya
  cerrados en lote anterior.

Fuentes de temas actualizadas a API `javase/27` (M16 Java SE 27, M17 PreparedStatement/
DataSource/Connection JDK 27). `validate.sh` EXIT 0. Trinquete `--max-pending 1143` OK.

Acumulado cerrado: Java 0–18 y 20 + M18 T3/T4. Siguiente: `java/modulo-19.md` (7 temas).

## 26. Avance: Java módulos 19, 21 y 22 — TRACK JAVA COMPLETO

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**.

- **Módulo 19 (Java del día a día, 7 temas):** reflexión y anotaciones (`Class`/`Field`/
  `Method`, `@Retention(RUNTIME)`, `setAccessible`+`opens`, invoke por nombre, coste,
  no en negocio); regex (Pattern reutilizable, clases/cuantificadores/`\b`, grupos con
  nombre, `find` vs `matches`, escapes `\\d`, `replaceAll` `${}`, ReDoS); BigDecimal
  (double inexacto, construir desde String, escala+RoundingMode, HALF_UP/HALF_EVEN,
  equals vs compareTo, reparto que cuadra, cuándo double); assertions/contrato
  (precondición con excepción, invariante con assert, `-ea`, postcondición, localizar
  invariante rota, no para datos externos, sin efectos secundarios); ServiceLoader
  (servicio/proveedor, descriptor META-INF, constructor vacío, load perezoso, extender
  sin tocar consumidor, descriptor ausente = 0, uses/provides JPMS); proxies dinámicos
  (`newProxyInstance`, `InvocationHandler.invoke`, delegar, desenvolver
  `InvocationTargetException`, solo interfaces, auto-invocación no pasa, Decorator manual);
  i18n (Locale forLanguageTag/of, NumberFormat, DateTimeFormatter localizado, Collator vs
  Unicode, MessageFormat choice, ResourceBundle, presentación ≠ intercambio).
- **Módulo 21 (APIs públicas/compatibilidad, 5 temas):** superficie pública, compatibilidad
  binaria vs fuente, evolución con default/deprecación, genéricos/borrado/puentes,
  verificación de compatibilidad en el build. Mapas insertados vía sub-agente, revisados.
- **Módulo 22 (el objeto por dentro, 5 temas):** equals/hashCode, claves mutables, copia
  defensiva/clone, enums de dominio, clases anidadas/this$0. Mapas vía sub-agente, revisados.

Evidencia reproducida por mí en JDK 27: M19 Dinero (0.999…, IVA 3563, BigDecimal(0.1) exacta,
equals false/compareTo 0), M19 Formatos i18n (es-CO/en-US/de-DE, Collator), M19 Reflexion
(obligatorio=true/false, ENTREGADO), M19 ServiceLoader (2 con descriptor, 0 sin él), M19
Proxies (proxy dinámico, IllegalArgumentException conservada); M21 T1 `javap -public` (filtra
DetalleInterno); M22 T1 equals/hashCode (roto size=2, bien size=1). Fuentes a jls/se27,
API javase/27, i18n overview 27.

`validate.sh` EXIT 0. Trinquete `--max-pending 1143` OK.

**TRACK JAVA CERRADO CON MINUCIOSIDAD:** módulos 0–22 (no existe 23 en Java) + 2 temas nuevos
insertados (M18 T3 sockets, T4 seguridad). Todos con mapa de subtemas críticos, explicación
individual por fila, evidencia ejecutada en JDK 27 en los ejemplos reproducibles, prerrequisitos
encadenados y fuentes oficiales a Java SE 27. Atlas global permanece en javase/25 por contrato
de official-topic-atlas.json. Cursos separados Maven/Gradle y JDBC quedan como PLANES
(docs/PLAN-CURSO-*), pendientes de construir módulo a módulo.

Siguiente prioridad del usuario: Spring Boot (23 módulos, 0 con mapa) → Microservicios
(curso separado) → Docker/Kubernetes (curso separado) → Flutter → Node.

## 27. Avance: Spring Boot — TRACK COMPLETO (módulos 0-22, 91 temas)

Fecha: 2026-11-01. Entorno: Temurin **JDK 27.0.1**, baseline Spring Boot 4.1.

Se insertó el **Mapa de subtemas críticos** (tabla Subtema/Papel/Evidencia + explicación
individual por fila) en los **91 temas** de los 23 módulos del track, con el mismo patrón y
nivel de profundidad que Java. Punto de inserción uniforme tras "¿Por qué es importante?".
Las fuentes del track son `docs.spring.io` (sin número de versión), por lo que no requieren
cambio de versión; se conservaron intactas junto con el bloque OFFICIAL-TOPIC-ATLAS de M13 y
los términos requeridos (Spring Boot 4.1, Spring gRPC, InetAddressFilter).

Cobertura por módulo (temas = mapas en todos): M0 IoC/DI (3), M1 Initializr/config/perfiles (3),
M2 DTOs/validación/errores/Lombok/OpenAPI/paginación (6), M3 JPA/N+1/Flyway (3), M4 Security/JWT/
CORS/SSRF/login (5), M5 ConfigurationProperties/fail-fast/ProblemDetail (3), M6 slices de testing
(3), M7 Actuator/Micrometer/probes (3), M8 Kafka/DLQ/idempotencia/rebalanceo/RabbitMQ (5), M9
Reactor/WebClient/WebFlux (3), M10 Cloud: ConfigServer/Gateway/Resilience4j/OAuth2/HTTP interfaces/
gRPC/DDD/Temporal-Saga (8), M11 empaquetado/jlink-layers/GraalVM-AOT/probes K8s (3), M12 micro
integrador (3), M13 @Transactional/idempotencia/contratos/observabilidad (4), M14 CRUD/espacial
MySQL/JPA Spatial/JWT/STOMP/archivos (6), M15 backpressure/Testcontainers singleton/hexagonal
ArchUnit/bulkhead/saga/event sourcing/clean arch (8), M16 relaciones JPA/N+1 (2), M17 JdbcTemplate/
transacciones (2), M18 SecurityFilterChain/validación-CORS-SSRF (2), M19 Spring Batch job/chunk +
restart/retry/skip (2), M20 scheduling/eventos/correo/caché/@Async/SOAP/Spring AI/RAG (8), M21
Kafka producer-outbox/DLT-idempotencia/outbox transaccional (3), M22 hexagonal/C4/ADR (3).

Trabajo realizado con sub-agentes `general-task-execution` en paralelo (instrucción idéntica:
patrón exacto, 6-8 filas, evidencia observable del propio ejemplo, sin inventar APIs). Revisadas
muestras (M11, M20 RAG, M0 hecho a mano): fieles al contenido, sin plantillas ni invenciones.

Nota de verificación (AGENTS.md): los ejemplos de Spring Boot requieren `start.spring.io`,
descarga de dependencias y Tomcat/Testcontainers, no reproducibles de forma ligera en este
entorno; NO se ejecutaron. Lo verificado aquí es: estructura (91/91 mapas), fences balanceados,
substancia estricta 0 defectos, `validate.sh` EXIT 0 y trinquete `--max-pending 1143`. Queda
pendiente para revisión humana la ejecución de ejemplos y pruebas de navegador; no se presenta
la detección de marcadores como formación verificada.

Siguiente prioridad del usuario: Microservicios (curso separado, docs/PLAN-CURSO-MICROSERVICIOS.md)
→ Docker/Kubernetes (curso separado) → Flutter → Node.

## 28. Corrección de continuidad: Spring Boot M15 T9 — CQRS y saga por coreografía

Fecha: 2026-11-02. Esta sección reemplaza para el estado actual los conteos y la afirmación de
“track completo” de la sección 27: Spring Boot contiene ahora **107 temas** y el registro marca
107/107 revisados, pero esa cobertura registral no sustituye ejecución exhaustiva, navegador ni
firma pedagógica humana. El repositorio completo contiene 1173 temas; 350 están en el registro de
profundidad y 823 permanecen pendientes.

Se añadió y corrigió `spring-boot/modulo-15::Tema 9: CQRS y saga por coreografía`. La primera
redacción tenía dos defectos: regeneraba el proyecto con la dependencia `web` en lugar de
`data-jpa,h2`, y describía consistencia eventual sobre un `@EventListener` local síncrono. La
versión corregida enseña `@TransactionalEventListener(AFTER_COMMIT)` con `REQUIRES_NEW`, distingue
evento local de mensajería durable y descompone doble escritura/outbox, idempotencia, orden,
versión de contratos, observabilidad, correlation ID y ciclos. Incluye transferencia observable
para cada mecanismo y aclara que CQRS no exige eventos, bases separadas ni Event Sourcing.

Evidencia ejecutada en un proyecto limpio de Spring Initializr: Spring Boot 4.1.2, Java release
25, JPA y H2; `./mvnw test` terminó `BUILD SUCCESS` con 3/3 pruebas (proyección después del commit,
camino feliz y compensación). El SQL mostró inserciones separadas en escritura y lectura.

Validaciones posteriores: `./scripts/validate.sh` EXIT 0; build Angular EXIT 0; Vitest 7 archivos,
26 pruebas, 0 fallos. Se regeneraron índice web, grafos de prerrequisitos/repositorio y auditorías
derivadas. Métricas actuales: metodología 901/1173, perfil editorial practicable 1159/1173 (14 de
deuda), revisión de profundidad 350/1173. Ninguna métrica automática acredita comprensión.

Discrepancia de skills: el manifiesto declara `scope-and-sequence-designer`,
`backwards-design-unit-planner` y `competency-unpacker`, pero sus `SKILL.md` no existen en las
rutas instaladas declaradas. No se afirma que esas skills hayan sido ejecutadas; se aplicaron
directamente los contratos pedagógicos versionados del repositorio.

## 29. Microservicios publicado progresivamente — Módulo 0

Fecha: 2026-11-02. Microservicios deja de ser únicamente un plan y entra como track real con un
primer módulo terminado; los módulos 1–16 continúan sin publicarse hasta superar la misma puerta.
El Módulo 0 contiene cinco temas: proceso/host/puerto/socket/DNS; latencia/deadline/timeouts;
fallo parcial/resultado desconocido/idempotencia; relojes/causalidad/orden; y
serialización/evolución/falacias distribuidas. Cada tema incluye mapa crítico, explicación,
archivo, código, comando, resultado, fallo, límites y transferencia a RutaFlow Distribuido.

Fuentes contrastadas: API Java 25 `HttpClient`, gRPC deadlines, especificación de contexto de
OpenTelemetry y Azure Architecture Center. Se añadió navegación, catálogo, guía de entrada,
bootstrap, proyecto progresivo, fuente oficial, icono y puente profesional trazado. Inventario
actual: **15 tracks, 256 módulos y 1178 temas**. Los cinco temas nuevos permanecen pendientes de
firma humana en el registro de profundidad; los detectores informan 1164/1178 practicables y la
deuda editorial se mantiene en 14, por lo que el incremento no elevó esa deuda.

## 30. Microservicios Módulo 1 — monolito modular antes de extraer

Fecha: 2026-11-02. Se publicaron seis temas: clasificación monolito/módulo/servicio/
microservicio; cohesión, acoplamiento y API; arquitectura hexagonal; grafos y ciclos;
fitness functions con ArchUnit; y ADR de extracción basado en evidencia. El incremento deja
**15 tracks, 257 módulos y 1184 temas**. Los seis temas cumplen el perfil practicable del detector,
la deuda global permanece en 14 y sustancia informa cero señales; continúan 0/6 en el registro
humano de profundidad hasta ejecutar y revisar individualmente todos sus subtemas críticos.

Evidencia parcial: se preparó un proyecto Maven limpio con módulos `envios`/`facturacion` y la
regla ArchUnit que prohíbe acceder a `envios.internal`. La ejecución quedó incompleta porque el
shell no pudo resolver `repo.maven.apache.org` y ArchUnit no estaba en la caché local; Maven falló
antes de compilar por `DependencyResolutionException`. No se presenta como prueba superada. Las
fuentes contrastadas fueron Spring Modulith, ArchUnit y Azure Architecture Center.

## 31. Migración estricta del prompt maestro — Microservicios M0 T2

Fecha: 2026-11-13. Tras integrar `main`, la validación reveló que
`docs/topic-source-review.json` estaba desactualizado y que Microservicios M0/M1 conservaba temas
de 75–110 minutos sin los siete pasos estrictos. No se avanzó a M2.

M0 T2 se sustituyó por **«Imponer un presupuesto temporal a una solicitud HTTP»**, 45 minutos,
con prerrequisito exacto M0 T1, siete pasos, mapa clasificado y explicación individual de latencia,
timeout de conexión, timeout de solicitud, rechazo, cancelación local y selección profesional del
presupuesto. Incluye dos archivos Java completos, diagrama, cinco prácticas de tipos distintos,
reto independiente, fallo deliberado, checklist, conexión con RutaFlow y fuentes de Java 27.

Evidencia ejecutada con Temurin 27.0.1: compilación con `--release 27`; `/health` produjo `UP`;
el cliente produjo `TIMEOUT_SOLICITUD HttpTimeoutException`; el servidor imprimió
`SERVIDOR_TERMINO_LENTO` después del abandono; un puerto local sin escucha produjo
`java.net.ConnectException: Connection refused (connect failed)`. Esto verifica el laboratorio
local, no redes con pérdida, carga real ni cancelación cooperativa.

Los detectores registran T2 con 15/15 marcadores de siete pasos, perfil practicable y sin señales
prioritarias de profundidad. El registro humano continúa `pending`: la detección y esta ejecución
no se presentan como firma pedagógica externa. Siguiente trabajo: separar y redactar M0 T3 para
propagación de deadlines; después corregir fallo parcial/idempotencia y renumerar el resto sin
perder conceptos. M1 sigue íntegramente pendiente de migración estricta.

## 32. Microservicios M0 T3 — deadline extremo a extremo

Fecha: 2026-11-13. Se insertó un tema nuevo de 45 minutos para separar la propagación de deadline
del timeout local. Explica presupuesto, instante absoluto, tiempo restante, propagación sin
renovación, reserva del llamador, confianza y sesgo de reloj, y el límite frente a cancelación y
efectos. El módulo conserva todos sus conceptos: los temas anteriores 3–5 pasan a 4–6.

El laboratorio contiene cliente, gateway y dependencia Java completos. Con Temurin 27.0.1 se
compilaron y ejecutaron tres procesos: 1200 ms produjo `HTTP_200 TARIFA=12000`; 250 ms produjo
`HTTP_504 SIN_PRESUPUESTO_DEPENDENCIA`; omitir el header produjo HTTP 400
`DEADLINE_INVALIDO`. Es evidencia local; no valida relojes de hosts distintos ni persistencia.

El tema entra con perfil practicable y sin señales prioritarias de profundidad, pero permanece
`pending` en el registro humano. La deuda humana aumenta en una unidad porque el currículo ganó
un tema necesario; antes de continuar a M2 deben corregirse M0 T4–T6 y todo M1.

## 33. Nombres comprensibles en lugar de códigos curriculares

Fecha: 2026-11-13. Por instrucción del usuario, `M0`, `T2` y códigos similares dejan de ser el
nombre visible de la continuidad. Los encabezados de Microservicios muestran ahora el nombre real
del curso y del módulo. Prerrequisitos y siguientes temas presentan primero los nombres completos;
el código permanece sólo entre paréntesis como referencia interna para validadores y enlaces.

La regla quedó persistida en `MASTER-PROMPT.md` para todos los cursos. También se corrigió el
primer laboratorio de Microservicios de JDK 25 a JDK 27.0.1 y su fuente a la API Java 27. Las
rutas técnicas de carpetas (`m0-t1`, etc.) se conservan porque son identificadores reproducibles,
no etiquetas pedagógicas que el estudiante deba interpretar.
