# Cómo continuar este trabajo (relevo para otra IA o persona)

Pega este archivo completo como primer mensaje a la IA que continúe, con acceso al repositorio
`NICORUIZ93/The_Imperial_Book` (rama `main`). Está escrito para alguien que no conoce nada de lo anterior.
Última actualización: 2026-11-20.

## 0. Lo primero que debes hacer

1. Lee este archivo entero.
2. Abre `docs/reestructuracion/ESTADO-DE-TEMAS.md`: dice cuántos temas hay por curso y módulo, cuántos están
   escritos y cuántos verificados.
3. Abre `docs/reestructuracion/ESTADO-DE-TEMAS.csv` y filtra `escrito_formato_unico = no`: esa es tu lista de
   trabajo. **No reescribas nada que tenga `si`.**
4. Toma el primer módulo sin terminar del primer curso del orden (sección 3) y sigue la sección 6.

## 1. Qué es y qué se está haciendo

The Imperial Book es una academia en español. Una app Angular (`web/`) dibuja lecciones Markdown de
`web/public/content/<curso>/modulo-N.md`. Los módulos de cada curso se declaran en
`web/src/app/tracks/<curso>.track.ts` y se agregan en `web/src/app/course-data.ts`. **Excepción medida:**
hay 15 archivos `.track.ts` para 16 cursos porque Cloud no tiene archivo propio; sus módulos viven
inline en `web/src/app/course-data.ts:42` (`COURSE_MODULES`) y se registran en `TRACKS`
(`web/src/app/course-data.ts:874`, `modules: COURSE_MODULES`).

El dueño es Nicolás Ruiz. Solo habla español y lee desde el móvil: respóndele en español, corto y con el
resultado primero.

Se está reescribiendo toda la academia con un único plan: `specs/021-reestructuracion-total-de-la-academia.md`.
Problemas que corrige: temas repetidos entre cursos, temas en el módulo equivocado, explicaciones y ejemplos
demasiado básicos, muchos temas faltantes y un formato distinto en cada curso.

## 2. Reglas que no se negocian

1. **Specs primero.** Lee `specs/README.md` antes de cambiar algo. Trabajo nuevo = spec nueva
   (`specs/NNN-*.md`) con criterios numerados y su `Verificación:`.
2. **El dueño aprueba cada temario antes de que se escriban sus lecciones.** Sin
   `docs/temarios/<curso>-objetivo.md` con «Aprobado por el dueño», no se escribe ese curso.
3. **Exactitud.** Ningún dato técnico (versión, comando, salida, nombre de API) se escribe sin ejecutarlo o
   comprobarlo en una fuente primaria. Si no pudiste comprobarlo, dilo en la lección y anótalo; no inventes
   salidas de terminal.
4. **Siempre la versión extendida.** El dueño rechaza las variantes reducidas. Cada curso va de cero a
   experto y al menos la mitad de sus temas están en los tramos Integración y Experto.
5. **Formato único** (sección 6). Lo mide `scripts/validate_formato.py`.
6. **Un concepto, un curso dueño.** Si otro curso ya lo enseña, se enlaza; no se repite. Cada temario tiene
   una sección de reparto con los demás cursos: respétala.
7. **Nada se pierde.** Lo retirado va a una etiqueta `retirado/*`. En GitHub (`origin`) solo hay la rama
   `main`, y no crees ramas que queden allí. **Medido el 2026-11-20:** el repositorio local conserva 6 ramas
   viejas que no son respaldo de nada y no debes seguir como si tuvieran trabajo
   (`agent/ampliar-temas-ejemplos`, `codex/biblioteca-continuidad-20261013`, `completar-siete-pasos-20261028`,
   `rediseno-dark-y-fix-temas-20261028`, `revision-minuciosa-java-20261101`,
   `worktree-agent-general-purpose-c9e74e2e`).
8. **Laboratorios JVM con Gradle**: Kotlin DSL, wrapper y catálogo `gradle/libs.versions.toml`. Maven no se
   usa en laboratorios nuevos.
9. **Nube en local con Floci** (`docker-compose.yml` de la raíz). AWS tarda entre 15 y 45 segundos en estar
   `healthy` (es lo que mide y dice `README.md:34`; no uses un tiempo fijo).
10. **No envíes mensajes ni correos en nombre del dueño, ni borres comprobantes o documentos suyos, sin
    preguntarle antes.**
11. **Antes de cada commit:** `./scripts/validate.sh` debe terminar en `validate.sh: ok`.
12. **No marques como verificado lo que no ejecutaste.**

## 3. Orden de trabajo (prioridad fijada por el dueño)

1. Java
2. Spring Boot
3. Microservicios con Spring Boot y Gradle (curso insignia)
4. Flutter
5. iOS
6. Angular, con el bloque completo de Angular Native (proyecto de https://ng-native.com, en alfa; ese bloque
   se escribe de último dentro de Angular)

Gradle se escribe junto a Java y Spring, porque sus laboratorios lo usan. Fundamentos ya tiene temario
aprobado y va después. Luego: JavaScript, Node, React, Docker, Kubernetes, DevOps, Cloud, Android, Kotlin
Multiplatform, Control, Diseño de sistemas y RutaFlow al final.

## 4. Estado exacto

### 4.1 Totalidad de temas

Los ocho temarios aprobados suman **2.385 temas en 379 módulos**. La lista completa, tema por tema, está en
`docs/reestructuracion/ESTADO-DE-TEMAS.csv` con estas columnas:

| Columna | Qué dice |
|---|---|
| `id` | identificador único: `curso/módulo/Tn` (por ejemplo `java/M0/T1`) |
| `tramo`, `modulo`, `titulo_modulo`, `n`, `tema`, `nivel` | dónde va y cómo se llama |
| `estado_origen` | qué había en el curso antiguo: `ya-esta`, `esta-pero-basico` o `falta` |
| `detalle_origen` | de qué lección antigua sale y qué le falta exactamente |
| `escrito_formato_unico` | `si` cuando el tema ya está escrito en el formato único |
| `verificado` | `si` cuando su laboratorio se ejecutó y pasó |

`estado_origen = ya-esta` no significa «terminado»: significa que el contenido antiguo sirve de base. Todo
tema se reescribe en el formato único salvo los que ya tienen `escrito_formato_unico = si`.

| Curso | Temas | Módulos | Ya está | Básico | Falta | Escritos | Verificados |
|---|---:|---:|---:|---:|---:|---:|---:|
| Java | 279 | 44 | 46 | 92 | 141 | 14 | 0 |
| Gradle | 166 | 28 | 0 | 31 | 135 | 0 | 0 |
| Spring | 281 | 47 | 57 | 83 | 141 | 0 | 0 |
| Microservicios | 395 | 62 | 173 | 72 | 150 | 173 | 110 |
| Flutter | 345 | 52 | 40 | 101 | 204 | 0 | 0 |
| iOS | 324 | 51 | 42 | 79 | 203 | 0 | 0 |
| Angular | 297 | 49 | 65 | 52 | 180 | 0 | 0 |
| Fundamentos | 298 | 46 | 65 | 130 | 103 | 0 | 0 |

La tabla viva es `ESTADO-DE-TEMAS.md`; esta copia puede quedar vieja.

### 4.2 Cómo se registra el avance (para no repetir trabajo)

- Al terminar un tema, añade su `id` en una línea de `docs/reestructuracion/temas-escritos.txt`.
- Si además ejecutaste su laboratorio y pasó, escribe `id;verificado`.
- Ejecuta `python3 scripts/build_estado_temas.py`: regenera el CSV y el resumen. `validate.sh` falla si no
  lo hiciste.
- No edites a mano `ESTADO-DE-TEMAS.csv` ni `ESTADO-DE-TEMAS.md`; son generados.
- Haz commit por módulo terminado, no por curso, para que el avance quede en GitHub si la sesión se corta.

### 4.3 Qué está hecho

- **Plan, formato y validadores:** `specs/021`, `FORMATO-UNICO.md`, `scripts/validate_formato.py`,
  `scripts/build_estado_temas.py`, lección modelo en `docs/reestructuracion/leccion-modelo/`.
- **Repositorio:** `main` publicada y comprobada; en el repo local quedan 6 ramas viejas sin borrar
  (ver regla 7). README con Floci comprobado en el Mac.
- **Temarios aprobados (8):** Java, Gradle, Spring, Microservicios, Fundamentos, Flutter, iOS, Angular. Cada
  uno trae sus decisiones D1..Dn; el dueño aprobó la opción recomendada de cada una.
- **Microservicios:** 187 fichas en `web/public/content/microservices/modulo-0..36.md`, con laboratorios en
  `examples/microservicios/modulo-0..36/` y documentación en `docs/microservicios/`. De ellas, 173 cuentan
  como escritas; las otras 14 están básicas y hay que ampliarlas (ver su `detalle_origen`). Este curso
  conserva su ficha de 14 puntos, que el validador acepta.
  El 2026-11-20 dejaron de ser invisibles: antes `topic-index.json` registraba **0** temas de Microservicios
  (el indexador solo reconocía `### Tema N:`), así que ni la página Temario ni el menú del lector ni los
  auditores los veían. Hoy el índice marca **1608 temas** y los 187 son navegables. Detalle en
  `docs/cambios-2026-11-20.md`. **Lo que sigue sin medirse:** `audit_topic_order` y
  `audit_topic_citations` solo leen `### Tema N:`, así que el orden pedagógico, el nivel y las citas de las
  187 fichas no están comprobados por nadie (no es «en verde», es «sin medir»).

### 4.4 Qué está a medias

1. **Piloto de Java, módulos 0 y 1: escrito y registrado, pero NO verificado.** En
   `docs/reestructuracion/cursos/java/` (`CURSO.md`, `modulo-0.md`, `modulo-1.md`,
   `laboratorios/modulo-0` y `modulo-1`): 7 temas por módulo, los 14 pasan las 12 secciones del formato y
   están dados de alta en `temas-escritos.txt` (`java/M0/T1` … `java/M1/T7`, **sin** `;verificado`, como
   exige la regla 12). La carpeta sí está en `main` (102 archivos con `git ls-files
   docs/reestructuracion/cursos/java`), así que el piloto no se perdió.
   El 2026-11-20 se ejecutaron los dos `verificar.sh` con Gradle real en el Mac del dueño
   (`~/Downloads/imperial-verificacion/logs/gradle-resumen.txt`):
   - `modulo-1` → **OK** (67 comprobaciones correctas, 0 fallidas).
   - `modulo-0` → **FALLO** (46 correctas, 2 fallidas). Las dos son aserciones del propio
     `verificar.sh` que no reconocen el mensaje real del JDK en español, no fallos del contenido enseñado:
     «classpath equivocado» y «sin método main (clase compilada)». El log muestra lo que imprime la JVM
     (`Error: no se ha encontrado o cargado la clase principal Despacho` y
     `Error: el método principal no es SinMain en la clase javafx.application.Application, defina el método
     principal del siguiente modo:`). Hay que corregir **el reconocimiento de esas dos cadenas** (sin bajar
     el listón de la comprobación) y volver a ejecutar; solo entonces se añade `;verificado` a los 14.
2. **Laboratorios de Spring de Microservicios ya compilados en Gradle.** Son
   `examples/microservicios/modulo-5` a `modulo-16` y `modulo-36/spring`. El 2026-11-20 se ejecutaron con
   Gradle real en el Mac del dueño (log `~/Downloads/imperial-verificacion/logs/gradle-resumen.txt`,
   script `verificar-gradle.command`):
   - `modulo-5` … `modulo-15` → **PASS** (11 módulos, de 15 s a 133 s).
   - `modulo-16` → **FAIL** (`rc=1`, 666 s): en F087 Blue-Green/Canary el pod `catalogo`
     `failed liveness probe, will be restarted` y el corte nunca se estabiliza.
   - `modulo-36/spring` → **FAIL** (`rc=1`, 145 s): `BUILD FAILED` en la tarea `tests de spring/`; la
     prueba «una nota fuera de 1-4 es un error, no un 0 silencioso» pasa y después falla el build.
   - Queda pendiente arreglar esos dos laboratorios, sustituir en las lecciones las salidas marcadas
     «pendiente de verificación en el Mac» por las reales y, al pasar, añadir `;verificado` a las 63 líneas
     de la Fase 1 en `temas-escritos.txt`. El detalle con archivo y línea está al final de
     `verificacion/microservicios/pendiente.md`.
   - Ojo con la versión de Gradle: esta sección ordenaba regenerar el wrapper a **9.9.2**, pero el piloto
     Java que se acaba de ejecutar fija **9.8.2** (`docs/reestructuracion/cursos/java/CURSO.md:140` y los
     `gradle-wrapper.properties` de sus dos laboratorios) mientras los laboratorios de Microservicios usan
     9.9.2. Hoy conviven dos versiones «oficiales»; hay que decidir una y dejarla escrita.
3. **La reescritura se prepara fuera de la página.** Los cursos nuevos se escriben en
   `docs/reestructuracion/cursos/<curso>/` y se publican en `web/public/content/` por tramos completos, para
   no dejar un curso a medio cambiar a la vista del lector.

### 4.5 Qué falta por completo

- Escribir 2.198 temas (los 2.385 objetivo menos los 187 que ya cuentan; es la columna «Por escribir» de
  `ESTADO-DE-TEMAS.md`, reproducida por `python3 scripts/build_estado_temas.py`).
- Temarios: de los 16 cursos publicados solo 8 tienen temario `-objetivo` aprobado. De la lista de 12 que
  faltaba, **Docker, Kubernetes y Diseño de sistemas ya tienen temario en propuesta**
  (`docs/temarios/docker.md`, `kubernetes.md`, `diseno-de-sistemas.md`, los tres de 2026-11-18 con
  «propuesta para aprobación del dueño»): lo que falta ahí es la versión extendida `-objetivo` y la
  aprobación, no investigarlos desde cero. Sin temario alguno quedan JavaScript, Node, React, DevOps, Cloud,
  Android, Kotlin Multiplatform, Control y RutaFlow. También están en propuesta `ia-aplicada.md` y
  `blockchain.md` (cursos fuera de los 16). Cada aprobación es decisión del dueño (regla 2).
- Criterios Z1 a Z11 de `specs/021` (ver `ESTADO.md`): mapa de conceptos, que la app dibuje las 12
  secciones con los mismos componentes, lección «Nube en local con Floci», cierre por curso, y la regla de
  laboratorios JVM (regla 8: Kotlin DSL, wrapper y catálogo; Maven como alternativa). **Medido en
  `examples/`:** 83 `build.gradle.kts`, 52 `build.gradle` en Groovy y 57 `pom.xml` (55 fuera de
  Microservicios). Dos de esos pom viven dentro de lo que el plan da por resuelto:
  `examples/microservicios/modulo-13/f069-escaneo/{antes,despues}/pom.xml` (son el caso real de escaneo de
  dependencias Maven que enseña ese tema; o se excepciona el caso docente por escrito o se cambia el
  laboratorio).

### 4.6 Datos del dueño que condicionan los laboratorios

- Tiene un Mac (Apple Silicon) con Docker, Xcode, Flutter, Android y Homebrew.
- Tiene iPhone físico: lo que solo necesita dispositivo (cámara, biometría, rendimiento, VoiceOver) se
  verifica ahí.
- **No** tiene membresía de pago de Apple ni cuenta de Google Play: push con APNs, TestFlight, publicación
  en tiendas, compras reales y entrega por CI/CD se escriben como ensayo documentado, y la lección debe
  decir que no se probó de punta a punta.

## 5. Decisiones ya tomadas (no las vuelvas a preguntar)

- Formato único de 12 secciones para toda la academia; Microservicios conserva su ficha de 14 puntos.
- Gradle en todos los laboratorios JVM; Spring Boot 4.1.x; Java (JDK) 25.
- JPA se enseña en Java; Spring Cloud vive en Microservicios; Spring AI se queda en Spring.
- Microservicios es dueño de la teoría de sistemas distribuidos y de service mesh.
- Fundamentos: sale Electrónica (a Control); entran Linux, shell y Git avanzado desde DevOps; sigue con
  Python, bash y SQL.
- Flutter: Dart va dentro del curso; Riverpod en el proyecto guía, con Provider y Bloc comparados.
- iOS: solo frameworks de Apple; UIKit se mantiene; solo lo estable, sin betas.
- Angular: Angular Native (ng-native) fijado en 0.25.0 con Expo SDK 58 y marcado como alfa; NativeScript,
  Ionic y PWA solo en un módulo comparativo.
- Las decisiones menores están en la sección «Decisiones para el dueño» de cada temario, resueltas en la
  opción recomendada.

## 6. Cómo se escribe un tema

1. Busca su fila en `ESTADO-DE-TEMAS.csv`. `detalle_origen` dice de qué lección antigua sale y qué le falta.
   Lee esa lección antigua y reutiliza lo que sirva.
2. Escribe las 12 secciones de `FORMATO-UNICO.md`, con estos nombres y en este orden:
   1 Ubicación y prerrequisitos · 2 Objetivo · 3 Por qué importa · 4 Analogía · 5 Diagrama ·
   6 Explicación (nivel 0, intermedio, maestro) · 7 Código ejecutable y salida real · 8 Mini-laboratorio ·
   9 Verificación · 10 Error común y diagnóstico · 11 Pregunta con respuesta modelo ·
   12 Cuándo usarlo y cuándo no.
   Encabezado: `### Tema N: Título · Nivel · NN min` (de 20 a 45 minutos).
3. La sección 6 explica tres veces: desde cero, a nivel intermedio y por dentro. La sección 7 lleva código
   que corre y la salida real pegada. La 10 muestra un error real con su mensaje. Nada de ejemplos de
   juguete: usa el proyecto guía del curso.
4. El laboratorio va en `examples/<curso>/modulo-N/` (o en `laboratorios/modulo-N/` mientras el curso esté
   en `docs/reestructuracion/cursos/`), con un `verificar.sh` que termina en `RESULTADO: OK`.
5. Módulos de 3 a 7 temas (lo que fija `FORMATO-UNICO.md:23`; no existe una segunda regla, y **ningún
   validador lo comprueba**: `validate_formato.py` mide las 12 secciones y el nivel/minutos, no el tamaño del
   módulo). Medido en la página publicada: los 324 módulos van de 1 a 17 temas, con 11 módulos de 1–2 y 32 de
   8 o más — esa es la desviación real, no «en verde». Un tema con más de 45 minutos se parte.
6. Referencia de calidad: `docs/reestructuracion/leccion-modelo/LECCION.md`.
7. Registra el tema (sección 4.2), ejecuta `./scripts/validate.sh` y haz commit.

Al publicar un tramo en la página: copia los módulos a `web/public/content/<curso>/`, actualiza
`web/src/app/tracks/<curso>.track.ts`, ejecuta `python3 scripts/build_web_topic_index.py`, añade el curso a
`docs/reestructuracion/cursos-en-formato.json` y actualiza las cifras de `CLAUDE.md` (la validación las exige).

## 7. Cómo se investiga un temario que falta

Imita `docs/temarios/java-objetivo.md`. Fuentes obligatorias (`specs/021`, sección 4): documentación
oficial, al menos tres índices de libros, certificaciones, sílabos de cursos largos, listas de YouTube,
roadmap.sh y guías de entrevistas sénior. Anota qué fuentes no abrieron. Clasifica cada tema objetivo contra
`docs/reestructuracion/listado-de-temas.csv`. Termina con decisiones D1..Dn y tu recomendación, déjalo como
«Pendiente de aprobación del dueño», añade el curso a `CURSOS` en `scripts/build_estado_temas.py` y pídele
la aprobación.

## 8. Comandos

```bash
cd web && npm ci && npm start              # http://localhost:4200
cd web && npm test -- --watch=false        # pruebas unitarias (Vitest)
cd web && npm run e2e                      # Playwright
./scripts/validate.sh                      # debe terminar en "validate.sh: ok"
python3 scripts/build_estado_temas.py      # regenera el estado de temas
python3 scripts/validate_formato.py --check
python3 scripts/build_web_topic_index.py   # tras editar lecciones publicadas
docker compose up -d                       # Floci: AWS 4566, Azure 4577, GCP 4588, panel 8080
```

Commits: mensaje en español, una idea por commit. Se sube directo a `main` y solo si es continuación de lo
que hay en GitHub (sin `--force`).

## 9. Dónde se verifica

Lo que necesita Docker, Gradle con red, Xcode o Flutter se ejecuta en el Mac del dueño, en su copia
`~/Documents/GitHub/Academia_Floci` (su `origin` es este repositorio). En
`~/Downloads/imperial-verificacion/` hay scripts `.command` listos, con registros en `logs/`:

| Script | Qué hace |
|---|---|
| `verificar-lote.command` | ejecuta los `verificar.sh` de los módulos listados en `lote.txt` |
| `verificar-gradle.command` | **es el que produjo los resultados de la sección 4.4** (Gradle real, 2026-11-20 14:36→15:00); su salida es `logs/gradle-resumen.txt` y `logs/gradle-java-m0.log` |
| `subir-avance.command` | sube a `main` el contenido de `imperial-avance.bundle` si es continuación directa |
| `actualizar-mi-carpeta.command` | guarda en stash lo pendiente y pone la carpeta local al día con `main` |
| `probar-floci.command` | arranca Floci y prueba los servicios |

Hay más scripts de los cinco de la tabla (`diag-floci`, `probar-floci2`, `exportar-local`,
`restaurar-stash`, `revisar-local`, `main-y-limpiar-ramas`, `solo-main`, `subir-imperial`,
`subir-main`, `subir-rama`). Dos son relevantes para lo que dicen los documentos de relevo:
`main-y-limpiar-ramas.command:11-13` es el que **borró las ramas `respaldo/dueno-*`** que aún cita
`fusion-2026-11-20.md` (ver su corrección), y `restaurar-stash.command` es el que devuelve el `stash@{0}`
de hoy («antes-de-actualizar-20261120-141747», 28 archivos modificados).

Lecciones de ese Mac: bash es 3.2 (cuidado con `${var}` pegado a letras con tilde); `node --test` necesita
`--test-force-exit`; Trivy puede recibir 429 de Maven Central; RabbitMQ 4 no admite colas transitorias no
exclusivas; el SDK de Azure Key Vault exige https.

## 10. Cómo informar al dueño

Corto, en español, resultado primero. Di siempre qué quedó hecho, qué no se pudo comprobar y qué decisión
necesitas de él. Si un laboratorio no se ejecutó, dilo; no lo presentes como verificado.
