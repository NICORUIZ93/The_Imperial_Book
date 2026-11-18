# Auditoría editorial y pedagógica — cursos Android y Node.js

**Auditor:** independiente (no autor). **Fecha:** 2026-11-18. **Rúbrica:** `docs/auditoria/PROMPT-AUDITORIA.md` (A1–F3 y Parte 2).
**Alcance:** `web/public/content/android/modulo-0.md` … `modulo-18.md` (19 módulos, 83 temas) y `web/public/content/node/modulo-0.md` … `modulo-15.md` (16 módulos, 90 temas); `web/src/app/tracks/android.track.ts` y `node.track.ts`.
**Método:** lista de temas de cada módulo; lectura completa de al menos un tema por módulo (rotando primero/medio/último); ojeada del resto; 12 ejecuciones reales de código Node en `/tmp` (Node v22.23.5, npm 10.9.9) más 2 laboratorios de `examples/`; reproducción en `/tmp` de un comando del Módulo 0 de Android; verificación de afirmaciones Android/Kotlin contra developer.android.com y Maven Central. `scripts/validate.sh` pasa (`validate.sh: ok`).

---

## 1. Veredicto ejecutivo

**Android: No.** Una persona sin base no puede completar el curso: los módulos 1–14 y 16–17 no declaran ni una dependencia Gradle (`implementation(` aparece 0 veces en esos módulos). Los "tests" de los módulos 7 y 9 se crean en `src/main`. Los módulos 1–13 sustituyen la evidencia Android por simulaciones en Python ("Simula, con un script, la diferencia de supervivencia…", m1:162). Hay errores técnicos verificados en Predictive Back, eventos con SharedFlow, firma de la app y recursos. Solo 1 de 83 temas tiene solución documentada.

**Node: Parcial.** El código es mayoritariamente completo, actual y ejecutable: 10 de los 12 ejemplos ejecutados producen la salida que promete el texto. Pero ningún tema tiene solución documentada (0 de 90). El Módulo 0 enseña un orden del Event Loop que es falso con la configuración ESM que el mismo tema exige. La duración de los temas (75–180 min) viola la metodología propia (20–45 min).

---

## 2. Tabla de puntuaciones A1–F3 (0 = ausente, 1 = deficiente, 2 = aceptable, 3 = ejemplar)

| Crit. | Android | Evidencia Android | Node | Evidencia Node |
|---|---|---|---|---|
| A1 Ejemplo antes que teoría | 2 | Cada tema abre con "¿Por qué es importante?" antes de la teoría (android/modulo-0.md:73), pero el "Hazlo tú" llega después de una teoría larga, no "en los primeros dos minutos" que exige la metodología | 2 | "Por qué importa: una API de entregas espera archivos…" precede a la teoría (node/modulo-0.md:65) |
| A2 Analogías correctas | 1 | La analogía de SavedStateHandle exagera: "incluso si el hotel entero se demuele y se reconstruye, esa nota puede recuperarse" (m1:229); no aclara que el estado guardado se pierde si el usuario cierra la tarea. La "campana que suena una única vez" (m4) vende como correcto perder eventos | 2 | Las analogías declaran su límite: "La analogía falla en que haber pasado por un cruce no garantiza que llegaste…" (m7:887); "La analogía se acaba en los errores y contratos de datos" (m12) |
| A3 Errores comunes reales | 1 | En 82/83 temas, pero en m1–m12 son prosa sin mensaje real: "olvidar llamar a `super.onX()` … provoca una excepción" (m1:95) no da el texto del error. Excepción: m15 cita `SecurityException: ... One of RECEIVER_EXPORTED…` (m15:241) | 2 | Mensajes reales: "`ReferenceError: __dirname is not defined in ES module scope`" (m1:791); "`66.67% branch coverage does not meet threshold of 80%`" (m7:925, verificado). Hay fallos que no son fallos: "El `404` … son la respuesta correcta, no un fallo" (m3:70) |
| A4 Ejercicios progresivos con solución | 0 | 1/83 temas tienen solución ("**Respuesta esperada:**", m0:303), y su respuesta 3 es falsa (ver §6). 0 bloques `<details>` en el curso, aunque la metodología pide "Las soluciones permanecen plegadas" | 0 | 0/90 temas con solución; 0 `<details>`. Ejemplo: "**Ejercicio independiente:** crea `src/runtime/cpu.js` …" (m0:133) sin solución ni ideas de resolución |
| A5 Proyecto integrador 30–60 min | 1 | m12 "Proyecto integrador" dura "7 h" (android.track.ts:159) y su verificación es una checklist en Python (m12:255). Los laboratorios por módulo son tablas de 5 filas con "Ver Tema N" (m0:807–813) | 2 | Proyecto con criterios observables por módulo ("Criterios de aceptación observables", m0:522); el integrador final dura "12 h" (node.track.ts:172), lejos de 30–60 min |
| A6 Progresión coherente | 1 | El Módulo 0 incluye "Tema 5: Lambdas … · Intermedio · 120 min" con `inline/noinline/crossinline` (m0:547,570). m8 exige "coroutines/suspend (Kotlin Multiplatform, Módulo 2)" (m8:13), que es otro curso. Las etapas se desordenan: módulos 15 y 17 "Integración" van después del 14 "Experto" (m0:32–33) | 1 | m5 Tema 1 "Básico" exige "Docker Desktop o Docker Engine funcionando" (node/modulo-5.md:11), pero Docker se enseña en el Módulo 11. m12 Tema 2 dura "180 min" (m12:260) |
| B1 Misma plantilla | 1 | Conviven tres plantillas: "Paso 1…Paso 7" (m0–m13), encabezados libres en m14 ("#### Por qué una captura visual no basta", m14:10) y prosa telegráfica en m17–m18. m15 deja 4 cierres vacíos ("#### Paso 7 · Cierre" seguido de otro tema: m15:127, 249, 412, 541). Medición propia: objetivos 81/83, analogía 83/83, errores comunes 82/83, solución 1/83 | 1 | Dos plantillas: "Aprende/Practica/Aplica" (m0–m13) y "Paso 1…7" (m14–m15). m14 inserta material interno entre temas: "## Trazabilidad de la auditoría original" (m14:470). Medición propia: objetivos 84/90, solución 0/90 |
| B2 Ni puro texto ni puro código | 1 | m1–m13 meten el Kotlin dentro de heredocs `cat > … <<'EOF'` y la "evidencia" es Python: "modela, con un archivo real en disco, la diferencia…" (m8:78). m3 Tema 4 es un fragmento sin contexto (m3:391–401) | 2 | Código y explicación equilibrados, p. ej. m2 Tema 3 (m2:323–475) |
| B3 Objetivos y resumen | 2 | "Al finalizar podrás…" en 81/83; los cierres de m15 están vacíos | 2 | "Al terminar podrás…" en 84/90 (el script mecánico no reconoce "Al terminar" y reporta 62 faltas falsas); checklist de salida por tema |
| B4 Módulo 0 de entorno | 2 | Instalación por SO, SDK y AVD (m0:4–22). No hay Hello World con errores típicos: solo "Si figura `unauthorized`…" (m0:22). Exige "Kotlin básico" como previo (m0:69), que el propio Módulo 0 enseña en el Tema 4 | 2 | Instalación y verificación (m0:3–15), con aviso `EACCES` (m0:55). Prerrequisito no enseñado: "`const`, `import` y promesas elementales" (m0:61) |
| C1 Código completo y ejecutable | 0 | No declara dependencias (Retrofit, Room, Hilt, Navigation, WorkManager, tests). Tests en `src/main` (m9:47). `settings.gradle.kts.fragmento` nunca se incluye (m0:392). `mkdir android-plataforma && cd android-plataforma && cd android-plataforma` falla (m15:43, 169, 289, 455) | 2 | 10 de 12 ejecuciones coinciden con lo prometido. Fallan: el orden del Event Loop (m0:214) y el "Fallo deliberado" del permiso del script (m10:736); además m14 crea el archivo antes de crear su carpeta (m14:43–53) |
| C2 Respeta ESTANDAR-DE-CODIGO | 1 | "Errores explícitos" se incumple: `catch (e: Exception) { Result.retry() }` (m8:63) captura `CancellationException`, que m0:784 pide no capturar. "Verificación" reproducible: simulaciones Python en lugar de pruebas reales | 2 | Nombres con intención y errores explícitos (m6:`crearHash`, `verificar`); `RangeError` con mensaje (m8). Desliz: el logger usa `req.path` y registra la ruta equivocada (ver §6) |
| C3 APIs obsoletas | 1 | Rutas string con `navArgument` presentadas como "tipadas" (m3:138), en lugar de la navegación type-safe (Navigation 2.8+). Firma sin Play App Signing (m11). SharedFlow para eventos (m4). `coroutines = "1.10.2"` (m18:47) frente a `1.11.0` (m0:699) | 1 | Versiones mínimas incoherentes y fuera de soporte: "Usa Node.js 18 o superior" (m2:774, m3:513, m3:653, m9:801); `"engines": { "node": ">=20" }` (m1:57); en m13:1509 la base es "Node.js 24 LTS y Node.js 26 LTS". Prisma 7 y Express 5 sí están al día |
| C4 Ejercicios con solución | 0 | Igual que A4 | 0 | Igual que A4 |
| D1 Segunda persona consistente | 2 | Tuteo general, voseo en m3: "reemplazá … probá" (m3:414), "Verificá" (m3:418), "Agregá … documentá" (m3:422) | 1 | Voseo en 23 formas de m14: "Corregí … confirmá … documentá" (m14:73), "Entregá … explicá" (m14:79) |
| D2 Jerga explicada / glosario | 1 | Sin definir: "ANR" (m0:677), "SAM" (m0:568), "R8", "ECH" (m13:513), "BOM" (m14:107). Sin glosario | 1 | Sin definir: "at-least-once", "transactional outbox" (m13), "ALPN" (m3:501). Sin glosario |
| D3 Conocimiento previo no enseñado | 1 | "el mismo patrón de encapsulación de estado que ya viste con propiedades privadas en Kotlin/Java" (m1:160); dependencia del curso KMP (m8:13) | 1 | Docker en m5 (m5:11); "SQL básico, transacciones … Docker con Docker Compose" (m13:504) |
| E1 Qué detecta validate.sh | 1 | Solo paridad de archivos, índice, catálogo, laboratorios y specs (scripts/validate.sh:7–34). No detectó ninguno de los defectos de este informe | 1 | Igual |
| E2 Ejecución, plantilla, glosario | 0 | No ejecuta bloques; `audit_plantilla.py` mide presencia por regex (cuenta "solución" en cualquier frase como solución) y no está en validate.sh | 0 | Igual |
| E3 Flujo de revisión documentado | 0 | Solo "El dueño aprueba los temarios" (CLAUDE.md). En m0:669 consta: "la prueba Gradle queda pendiente y no se acredita como ejecutada" | 0 | Igual |
| F1 Riesgo de 1432 temas sin revisión | 1 | Riesgo alto, comprobado: errores técnicos en temas publicados como terminados | 1 | Riesgo medio: los errores se concentran en matices (orden ESM, permisos) |
| F2 Ruta core priorizada | 1 | Hay "Mapa de la ruta" por curso (m0:24), no una ruta core global | 1 | Igual (node m0:17) |
| F3 Glosario y apéndices | 0 | No existen en el contenido. El "Atlas completo de temas oficiales" (m13:550) es un inventario, no un apéndice de consulta | 0 | Igual (m13:1507) |

---

## 3. Tabla por módulo

Nota global 0–3 por módulo. Las citas son `archivo:línea` relativas a `web/public/content/`.

### Android

| Curso | Mód. | Temas | Nota | Defecto principal (cita) | Corrección concreta |
|---|---|---|---|---|---|
| android | 0 | 6 | 1 | La demo de recursos nunca añade `titulo_bienvenida` a `values/strings.xml`: el heredoc solo añade un comentario después de `</resources>` (android/modulo-0.md:244–246). El resultado esperado "`titulo_bienvenida` aparece en la intersección" (m0:286) es falso; reproducido: `claves compartidas: set()`. Además `settings.gradle.kts.fragmento` (m0:392) nunca se incluye y `echo 'implementation(project(":core"))' >> app/build.gradle.kts` (m0:396) escribe fuera del bloque `dependencies {}` | Insertar `<string name="titulo_bienvenida">Bienvenido</string>` dentro de `<resources>`; editar `settings.gradle.kts` real con `include(":core")`; colocar la dependencia dentro de `dependencies { }`; dividir el Tema 5 (120 min) en 3 temas |
| android | 1 | 3 | 1 | `cat > app/src/main/kotlin/com/academia/android/MainActivity.kt` (m1:42) crea otra `MainActivity` en el paquete `com.academia.android`, pero el proyecto de m0 se generó con el paquete por defecto: el manifiesto lanzará la Activity original y no aparecerán los logs. La supervivencia del ViewModel se "demuestra" con Python (m1:162–187), nunca rotando la app | Fijar el paquete al crear el proyecto en m0 o editar la `MainActivity` existente; conectar `TareasViewModel` a un composable con `viewModel()` y verificar la rotación en el emulador |
| android | 2 | 4 | 1 | Patrón repetido de m1 a m13: `mkdir -p academia-android/app/...` seguido de `cd academia-android` (m2:46–47). Si el alumno ya está dentro de `academia-android`, como sugiere "continuando en `academia-android`", se crea una carpeta anidada. Faltan dependencias de Compose | Un único bloque "sitúate en la raíz" con `test -f settings.gradle.kts`, como ya hace m0:465 |
| android | 3 | 4 | 0 | Error verificado: "probá el gesto … el sistema muestra su previsualización genérica … durante todo el deslizamiento" con un `BackHandler` (m3:414); y "sin ese flag, ni `BackHandler` ni `PredictiveBackHandler` participan" (m3:418). Fragmento sin imports ni `hayCambiosSinGuardar` (m3:391) | Reescribir con la guía oficial: habilitar el handler solo con cambios sin guardar; aclarar que `OnBackPressedCallback` funciona sin el flag; usar rutas `@Serializable` (Navigation 2.8+) |
| android | 4 | 4 | 0 | Enseña como correcta la práctica que la guía oficial desaconseja: "Modelar un evento de 'mostrar Snackbar' con `SharedFlow` … evita que ese evento se repita" (m4:230), e incluye "navegación tras pago exitoso" como candidata (m4:332). Confunde recomposición con recreación ("se repita en una recomposición") | Modelar el mensaje como estado (`userMessage: String?` y `userMessageShown()`), según la guía de eventos de UI |
| android | 5 | 3 | 0 | `./gradlew :app:compileDebugKotlin` con `import retrofit2.http.GET` sin declarar Retrofit ni un converter (m5:76): no compila. El servidor Python escucha en `localhost` del host y el emulador nunca lo consulta; `curl` prueba Python, no Retrofit (m5:88) | Declarar `retrofit`, el converter y `INTERNET`; usar `10.0.2.2:8000` y `usesCleartextTraffic` de depuración; mostrar la llamada real desde el ViewModel |
| android | 6 | 3 | 1 | Room se "valida" con `sqlite3` de Python: "el esquema equivalente que Room generaría" (m6:80). No hay dependencia Room/KSP ni prueba `MigrationTestHelper` | Agregar `room-runtime`, `room-ktx`, `ksp(room-compiler)` y una prueba instrumentada de migración |
| android | 7 | 3 | 0 | `@HiltAndroidApp` (m7:54) sin el plugin `com.google.dagger.hilt.android`, sin KSP ni `android:name` en el manifiesto; `TareasFlowTest.kt` se crea en `src/main` (m7:291). La "verificación" es un "modelo Python" (m7:46) | Añadir la configuración de Hilt completa y mover la prueba a `src/test` o `src/androidTest` con `HiltAndroidRule` |
| android | 8 | 3 | 1 | `catch (e: Exception) { Result.retry() }` (m8:63) traga `CancellationException`. La garantía de WorkManager se "confirma en ejecución real" con un JSON en `/tmp` (m8:81–102). Prerrequisito de otro curso (m8:13) | Relanzar `CancellationException`; verificar con `adb shell dumpsys jobscheduler` o con `WorkManagerTestInitHelper` |
| android | 9 | 3 | 0 | `TareasViewModelTest.kt` con `org.junit.Test` en `app/src/main/kotlin` (m9:47–70), compilado con `compileDebugKotlin`: no compila ni se ejecuta como prueba. Usa `Tarea(... completada = false)` (m9:65), que no coincide con el `Tarea` de m0 (`estado`, `prioridad`). Delata el entorno del autor: "verificable en este entorno" (m9:41) | Mover a `src/test`; declarar `testImplementation(junit, coroutines-test)`; unificar el modelo `Tarea`; ejecutar `./gradlew :app:testDebugUnitTest` |
| android | 10 | 3 | 1 | Los Baseline Profiles se "miden" con Python: "simula la diferencia de tiempo entre interpretar código vs usar una versión precompilada" (m10:194); `DisposableEffect` con cuerpo vacío (m10:209–213) | Generar un perfil real con el plugin `androidx.baselineprofile` y medir con Macrobenchmark (hoy está en m18) |
| android | 11 | 3 | 0 | Error verificado: ignora Play App Signing; presenta la pérdida o filtración de la clave como "irreversible" y dice que "no puedes simplemente 'rotarla'" (m11:106). La keystore se guarda en `app/keystore.jks` sin `.gitignore` (m11:46) y el fragmento de firma nunca se aplica (`build.gradle.kts.fragmento`, m11:52) | Explicar clave de subida frente a clave de firma de la app; procedimiento de restablecimiento de la clave de subida; keystore fuera del repo; `./gradlew bundleRelease` real |
| android | 12 | 4 | 1 | La checklist del integrador comprueba que exista `app/src/main/kotlin/.../TareasViewModelTest.kt` (m12:268): consolida el error de m9. El bloque de m12:160 empieza con "Este script python3 no interviene en este paso" | Reescribir la checklist como `./gradlew test connectedCheck lint`; reducir el integrador a hitos de 30–60 min |
| android | 13 | 5 | 1 | AES-GCM con Keystore se "verifica" con criptografía en Python (m13:169). Restos de autoría: "## Aplicación del material de referencia" (m13:569) y `<!-- OFFICIAL-TOPIC-ATLAS:END -->`. El Tema 5 remite a "la app Restauracion del módulo 4", que no existe | Prueba instrumentada real con `AndroidKeyStore`; eliminar los restos internos; corregir la referencia |
| android | 14 | 6 | 2 | Mejor módulo del curso: dependencias y Robolectric explícitos (m14:107). Pero deja metadatos internos ("## Trazabilidad de la auditoría original", m14:803) y 5 de 6 temas sin solución | Eliminar la sección de trazabilidad; añadir soluciones plegadas |
| android | 15 | 9 | 1 | `mkdir android-plataforma && cd android-plataforma && cd android-plataforma` (m15:43, 169, 289, 455) falla en el segundo `cd`; 4 "Paso 7 · Cierre" vacíos (m15:127, 249, 412, 541); relleno repetido "Como **siguiente** paso, aplica lo aprendido…" (4 veces). Los mensajes de error reales (m15:241, 404) sí son ejemplares | Quitar el `cd` duplicado; escribir los cierres; borrar el relleno |
| android | 16 | 7 | 1 | 6 de 7 temas sin análisis paso a paso ni solución (medición); los fallos deliberados son descripciones sin salida esperada ("agrega `READ_MEDIA_IMAGES` al manifiesto…", m16:72) | Añadir la salida o el mensaje esperado y una solución por tema |
| android | 17 | 5 | 1 | Fragmento sin `package` ni imports (m17:43–58); `./gradlew :app:test` (m17:62) no ejecuta ninguna prueba del tema; el estilo telegráfico rompe la plantilla | Archivo completo con imports y la prueba que el texto promete (m17:73) |
| android | 18 | 5 | 1 | `./gradlew dependencyInsight … --configuration debugRuntimeClasspath` sin prefijo `:app:` (m18:61): también se ejecuta en el proyecto raíz, que no tiene esa configuración (probable fallo, no ejecutado). Fallo deliberado vago: "agrega una versión transitiva incompatible" (m18:67) | Usar `./gradlew :app:dependencyInsight`; dar coordenadas concretas para el conflicto |

### Node

| Curso | Mód. | Temas | Nota | Defecto principal (cita) | Corrección concreta |
|---|---|---|---|---|---|
| node | 0 | 4 | 1 | **Error verificado y ejecutado:** "`1`, `2` y `3` aparecen en ese orden" (node/modulo-0.md:214) con `"type": "module"` (m0:187). La salida real en Node 22 es `1`, `3. microtarea Promise`, `2. cola nextTick`. La teoría "Su cola se vacía … después se procesan las microtareas de promesas" (m0:164) omite la excepción ESM | Explicar la diferencia CJS/ESM; hacer la demo con `.cjs` o cambiar el resultado esperado; citar la sección oficial de `process.nextTick` |
| node | 1 | 6 | 2 | Ejecutado: el Tema 6 (ESM/CJS) produce exactamente la salida prometida. Defecto: mínimos incoherentes, `"node": ">=20"` (m1:57) frente a `">=22.12"` (m1:858); Node 20 ya no tiene soporte | Unificar en la LTS vigente declarada en un solo lugar |
| node | 2 | 6 | 2 | Ejecutado: backpressure correcto (`Procesados: 10`; 4 pausas con hWM 12 y 1 con hWM 48). Defecto: "Usa Node.js 18 o superior" (m2:774), versión sin soporte | Requerir la LTS vigente |
| node | 3 | 7 | 2 | "Fallo deliberado" que no falla: "El `404` … son la respuesta correcta, no un fallo del servidor" (m3:70). Tema 5 exige "Node 24 o superior" (m3:411) mientras m0 pide "LTS vigente" | Sustituir por un fallo real (p. ej. doble `res.end` → `ERR_STREAM_WRITE_AFTER_END`); declarar la versión una sola vez |
| node | 4 | 6 | 2 | Ejecutado (Express 5.3.0 instalado sin fijar versión): el logger registra `GET /mensaje -> 401` para `/privado/mensaje`, porque `req.path` es relativo al montaje (m4:63), contra "registra cada respuesta con método, ruta" (m4:97) | Usar `req.originalUrl`; fijar `express@5` |
| node | 5 | 4 | 2 | Salto de dificultad: el Tema 1 "Básico" exige Docker Compose (m5:11), que se enseña en m11. Prisma 7 con adapter está al día (m5:218) | Mover Docker a un tema previo o usar SQLite en el Tema 1 |
| node | 6 | 6 | 2 | Ejecutados scrypt y `jose`: salida correcta. Defecto: la práctica guiada propone comparar con `===` y "observa que la sustituye una comparación de cadenas" (m6:100); con `Buffer`, `===` compara referencias y siempre da `false` | Explicar que `===` entre Buffers compara identidad; enseñar que el riesgo real es comparar hex con `===` |
| node | 7 | 7 | 2 | Ejecutado: cobertura y umbral exactos (`66.67% branch coverage does not meet threshold of 80%`). Defecto: 6 de 7 temas sin solución | Añadir soluciones plegadas |
| node | 8 | 5 | 2 | Ejecutado: el Worker devuelve `9227465` y `81790` es correcto. Defecto: el ejercicio independiente (semáforo y cola de Workers, m8:97) es un salto sin solución ni pistas | Dar una solución de referencia con ideas de resolución |
| node | 9 | 6 | 2 | Ejecutado: AsyncLocalStorage produce la traza exacta. Defecto: "Usa Node.js 18 o superior" (m9:801) | Actualizar el mínimo |
| node | 10 | 6 | 1 | **Error verificado y ejecutado:** "quita `--allow-fs-read=./leer-envios.mjs` … Node no arranca y muestra `ERR_ACCESS_DENIED`" (m10:736). En Node 22.23.5 arranca y produce la misma salida: el punto de entrada se permite por defecto | Reemplazar por un fallo real (p. ej. quitar `--allow-fs-read=./datos/`) y citar la documentación |
| node | 11 | 4 | 2 | Bien resuelto (HEALTHCHECK con `fetch` de Node, `USER node`, m11:266–268). Defecto: m12:615 usa `FROM node:lts-bookworm-slim`, una etiqueta flotante que contradice "usar `latest` como supuesta garantía de reproducibilidad" (m11:151) | Fijar `node:24.x-bookworm-slim@sha256:…` en m12 |
| node | 12 | 6 | 1 | Temas de "180 min" y "150 min" (m12:260, 997); 2 temas sin analogía (medición); 5 de 6 sin solución | Partir en temas de ≤45 min con hitos |
| node | 13 | 5 | 2 | Contenido técnico sólido (idempotencia, outbox) con jerga sin glosario ("at-least-once", m13:521); "Atlas completo" (m13:1507) como inventario dentro de la lección | Glosario del curso; mover el atlas a un apéndice |
| node | 14 | 8 | 0 | El archivo se crea antes que su carpeta: "Crea `src/asignar.ts`" y después `mkdir -p ejemplo-node/src` (m14:41, 57). **Error verificado y ejecutado:** el borrado de tipos no soporta "enums con valores computados" (m14:35); falla con cualquier `enum` (`ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` con `enum E { A = 1 }`). Copia de `examples/` (m14:182) cuando m0:55 dice "no necesitas copiar código del repositorio". Voseo; metadatos de auditoría (m14:470); 8/8 temas sin solución | Reordenar los comandos; corregir a "enums, namespaces y parameter properties"; quitar la trazabilidad; tutear |
| node | 15 | 4 | 1 | Omisión verificada: "la primera ejecución rechaza la conexión" (m15:53), pero en una terminal interactiva Deno **pregunta** en lugar de rechazar. Fallo deliberado de Bun sin dependencia concreta ("agrega una dependencia que use un módulo nativo", m15:133) | Usar `deno run --no-prompt` y describir el aviso; nombrar un paquete concreto y el error observado |

---

## 4. Defectos bloqueantes (impiden publicar), por gravedad

1. **Android sin dependencias Gradle en 16 de 19 módulos.** `implementation(` aparece 0 veces en android/modulo-1…14, 16 y 17. Los imports `retrofit2.http.GET` (m5:72), `dagger.hilt.android.HiltAndroidApp` (m7:54), `androidx.work.CoroutineWorker` (m8:53) y `kotlinx.coroutines.test.runTest` (m9:51) no compilan con `./gradlew :app:compileDebugKotlin` en el proyecto de m0. **Corrección:** un bloque `dependencies {}` (y `plugins {}` para Hilt/KSP/serialization) por módulo, con versiones fijadas en `libs.versions.toml` desde m0.
2. **Pruebas Android creadas en `src/main`.** android/modulo-9.md:47, 180, 288 y modulo-7.md:291; m12:268 lo exige como criterio. **Corrección:** `src/test` (JVM) o `src/androidTest` (instrumentadas), y ejecución con `testDebugUnitTest` / `connectedDebugAndroidTest`.
3. **La evidencia de Android es Python, no Android** (71 apariciones de `python3` en m0–m13). Ejemplo: "confirmando en ejecución real la garantía central de WorkManager" con un JSON en `/tmp` (m8:102). Viola "Ningún dato técnico se escribe sin ejecutarlo o verificarlo" (CLAUDE.md) y "Una prueba … demuestra el comportamiento" (ESTANDAR-DE-CODIGO.md:12). **Corrección:** sustituir cada simulación por la prueba Android equivalente (Robolectric, `WorkManagerTestInitHelper`, `MigrationTestHelper`, `createComposeRule`).
4. **Ejercicios sin solución: 1/83 (Android) y 0/90 (Node).** La metodología exige soluciones plegadas ("Las soluciones se mantienen plegadas", METODOLOGIA:62) y el script mecánico infla el dato (20 positivos falsos en Android). **Corrección:** `<details><summary>Solución</summary>` con ideas de resolución por ejercicio, más un validador que exija `<details>` por tema.
5. **Errores técnicos verificados publicados como verdad** (detalle en §6): orden `nextTick`/Promise en ESM (node m0:214), Predictive Back (android m3:414, 418), SharedFlow para eventos (android m4), firma sin Play App Signing (android m11:106), recursos m0:286/306, permiso del punto de entrada (node m10:736), enums en el borrado de tipos (node m14:35).
6. **Comandos que fallan tal cual:** `cd android-plataforma && cd android-plataforma` (android m15:43, 169, 289, 455); `settings.gradle.kts.fragmento` nunca incluido (android m0:392); dependencia fuera del bloque (android m0:396); archivo creado antes de `mkdir` (node m14:41, 57); `MainActivity` en un paquete que el manifiesto no lanza (android m1:42).
7. **La validación no detecta nada de lo anterior.** `scripts/validate.sh` termina en `validate.sh: ok` sin ejecutar código ni comprobar la plantilla. **Corrección:** ver plan, paso 2.

## 5. Defectos mayores y menores

### Mayores (degradan el aprendizaje)

- **Duración fuera de la metodología.** 68 de los 88 temas con duración declarada superan 45 min (75 min ×19, 90 ×9, 120 ×2, 150 ×2, 180 ×1). Ejemplos: android m0:547 "120 min" y node m12:260 "180 min". Corrección: dividir.
- **Saltos de dificultad.** Lambdas con `crossinline` en el Módulo 0 de Android (m0:570); Docker en node m5:11; dependencia del curso KMP en android m8:13.
- **Tracks desalineados con el contenido.** android.track.ts:133 promete 7 temas para el módulo 10 ("Material 3 theming", "@Stable, @Immutable y derivedStateOf"…), pero el `.md` tiene 3. En el módulo 4, el tema "Restaurar un borrador…" va primero en el track (android.track.ts:60) y en el `.md` aparece como Tema 4 después del laboratorio (m4:373). node.track.ts:208 titula "Node.js avanzado: GraphQL, sagas y mensajería" y el `.md` dice "# Módulo 14: Node.js avanzado".
- **Material interno visible para el alumno.** "## Trazabilidad de la auditoría original" (android m14:803; node m14:470); `<!-- OFFICIAL-TOPIC-ATLAS:END -->` (android m13); "Estado de ejecución: … no se acredita como ejecutada" (android m0:669); "verificable en este entorno" (android m9:41).
- **Modelo de dominio inconsistente en Android.** `Tarea(id, titulo, estado, prioridad)` (m0:477) frente a `Tarea(id, titulo, completada)` (m9:65, m6:80). Paquetes que cambian sin aviso: `com.academia.model`, `com.academia.android`, `com.academia.core`, `com.rutaflow.core`, `com.rutaflow.repartidor`.
- **Contradicción de reglas en Node.** "no necesitas copiar código del repositorio de la academia" (node m0:55) frente a "`cp examples/node-sagas/saga.mjs`" (m14:182).
- **"Fallos deliberados" que no fallan.** Node m3:70 (404 correcto); android m0:155 ("No debería encontrarse ninguna coincidencia"); android m8:104 ("Repite mentalmente el escenario").

### Menores

- Voseo mezclado con tuteo: android m3:414–422; node m14 (23 formas).
- Relleno repetido: "Como **siguiente** paso, aplica lo aprendido en el proyecto integrador…" (android m15, 4 veces).
- Versiones dispares: coroutines `1.11.0` (android m0:699) frente a `1.10.2` (m18:47). Node 18/20/22/22.8/22.12/22.13/24 como mínimos en distintos temas.
- Error de tipeo: "Si un text de estado cambia" (android m0:300).
- "Errores comunes" dudoso: "modificar `AndroidManifest.xml` sin sincronizar Gradle después" (android m0:105); un cambio de manifiesto no requiere *Gradle sync*.
- Express sin versión fijada (`npm install express`, node m4:47).
- `main.test.js` de Bun importa un módulo con efecto secundario (`console.log`) (node m15:115).

---

## 6. Errores técnicos verificados

| # | Afirmación (archivo:línea) | Por qué es falsa | Fuente / evidencia |
|---|---|---|---|
| 1 | "**Resultado esperado:** `1`, `2` y `3` aparecen en ese orden" con `"type": "module"` (node/modulo-0.md:187, 214) | En ESM las microtareas se vacían antes que `nextTick`. Ejecutado en Node v22.23.5: `1. síncrono` / `3. microtarea Promise` / `2. cola nextTick` | [Node.js — process: "When to use queueMicrotask() vs. process.nextTick()"](https://nodejs.org/api/process.html#when-to-use-queuemicrotask-vs-processnexttick): "in ESM … `queueMicrotask()` callbacks are always executed before `process.nextTick()` ones" |
| 2 | "quita `--allow-fs-read=./leer-envios.mjs` … Node no arranca y muestra `ERR_ACCESS_DENIED`" (node/modulo-10.md:736) | Ejecutado: arranca y produce la misma salida que la primera ejecución | [Node.js — Permissions](https://nodejs.org/api/permissions.html): "By default the entrypoints of your application are included in the allowed file system read list" |
| 3 | El borrado de tipos no alcanza para "enums con valores computados" (node/modulo-14.md:35, 79) | Falla con cualquier `enum`. Ejecutado con `enum E { A = 1, B = 2 }`: `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX: TypeScript enum is not supported in strip-only mode` | Ejecución local, Node v22.23.5 |
| 4 | "la primera ejecución rechaza la conexión" sin `--allow-net` (node/modulo-15.md:53) | En una terminal interactiva Deno pregunta en lugar de fallar | [Deno — Security](https://docs.deno.com/runtime/fundamentals/security/): "When stdout is a terminal and you have not passed a flag, Deno pauses and asks instead of failing." |
| 5 | El logger "registra cada respuesta con método, ruta, estado" (node/modulo-4.md:97) | Ejecutado: `GET /mensaje -> 401` para `/privado/mensaje` (`req.path` es relativo al montaje) | Ejecución local con express@5.3.0 |
| 6 | Con `BackHandler` "el sistema muestra su previsualización genérica de 'volviendo atrás' durante todo el deslizamiento" (android/modulo-3.md:414) | Con un callback habilitado no se ejecutan las animaciones del sistema | [Android — Predictive back](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture): "If your app enables an `OnBackPressedCallback` … the predictive back animations don't run" |
| 7 | "sin ese flag, ni `BackHandler` ni `PredictiveBackHandler` participan del sistema de retroceso" (android/modulo-3.md:418) | `OnBackPressedCallback` (base de `BackHandler`) siempre se invoca | Misma fuente: "`OnBackPressedCallback` is always called regardless of the value of `android:enableOnBackInvokedCallback`"; y "Predictive back is enabled by default" |
| 8 | Modelar "mostrar Snackbar" o "navegación tras pago exitoso" con `SharedFlow` es lo correcto (android/modulo-4.md:230, 332) | La guía oficial pide reducir los eventos del ViewModel a estado de UI; los streams no garantizan la entrega | [Android — UI events](https://developer.android.com/topic/architecture/ui-layer/events): "ViewModel events should always result in a UI state update"; con Channels u otros streams "these solutions don't guarantee the delivery and processing of those events" |
| 9 | La pérdida o filtración de la keystore es "un problema grave y en gran medida irreversible" y no se puede "rotarla" (android/modulo-11.md:106, 110) | Las apps nuevas usan obligatoriamente Play App Signing; la clave del alumno es la de subida y puede restablecerse | [Android — Sign your app](https://developer.android.com/studio/publish/app-signing): "if you lose your upload key, or if it is compromised, you can request an upload key reset in the Play Console" |
| 10 | "Android no reinicia la app automáticamente" al cambiar de idioma (android/modulo-0.md:306) | Por defecto el cambio de locale recrea la Activity | [Android — Runtime changes](https://developer.android.com/guide/topics/resources/runtime-changes): "If the language changes, the system recreates the activity." |
| 11 | "`titulo_bienvenida` aparece en la intersección de claves compartidas" (android/modulo-0.md:286) | El comando de m0:244–246 no añade esa clave a `values/strings.xml`. Reproducido: `claves solo en inglés: {'titulo_bienvenida'}`, `claves compartidas: set()` | Ejecución local del bloque del tema |
| 12 | `navArgument(...)` presentado como "argumentos tipados" (android/modulo-3.md:138; track: "Argumentos de navegación tipados") | Desde Navigation 2.8.0 la forma tipada son las rutas `@Serializable`; la documentación las califica de "more robust" que las rutas string | [Android — Type safety in Navigation](https://developer.android.com/guide/navigation/design/type-safety) |

No es un error: `kotlinx-coroutines-test:1.11.0` (android m0:699) existe ([Maven Central](https://repo1.maven.org/maven2/org/jetbrains/kotlinx/kotlinx-coroutines-test/maven-metadata.xml), `release` 1.11.0).

### Ejecuciones Node realizadas (en /tmp/aud)

| Módulo | Ejemplo | Resultado |
|---|---|---|
| 0 | `fases.js` (Event Loop) | **No coincide** (error 1) |
| 1 | ESM/CJS (`main.js`, `desde-cjs.cjs`) | Coincide |
| 2 | `medir.js` y `DestinoLento` | Coincide |
| 4 | Middleware Express | Coincide salvo el log (error 5) |
| 6 | `password.js` (scrypt) y `tokens.js` (jose) | Coinciden |
| 7 | Cobertura y umbral `node:test` | Coincide |
| 8 | Worker Fibonacci | Coincide |
| 9 | AsyncLocalStorage + diagnostics_channel | Coincide |
| 10 | Modelo de permisos | Coincide salvo el fallo deliberado (error 2) |
| 14 | `node src/asignar.ts`, `tsc --noEmit`, enum | Coincide; la afirmación sobre enums es falsa (error 3) |
| 14 (labs) | `examples/node-sagas/saga.mjs`, `examples/node-federation` (`npm ci && npm test`) | Coinciden (1/1 prueba) |

---

## 7. Plan de corrección priorizado

| Paso | Acción | Esfuerzo |
|---|---|---|
| 1 | Corregir los 12 errores de §6 y los comandos rotos del bloqueante 6 | 1–2 días |
| 2 | Ampliar `validate.sh`: ejecutar `audit_plantilla.py` con umbral; exigir `<details>` de solución por tema; reconocer "Al terminar podrás"; detectar `cd X && cd X`, `Paso 7` vacío, secciones "Trazabilidad" y voseo; ejecutar los bloques `js` marcados como ejecutables con Node LTS en CI | 3–4 días |
| 3 | Android m1–m13: un `libs.versions.toml` y bloques `dependencies` desde m0; pruebas en `src/test`/`androidTest`; sustituir cada simulación Python por la prueba Android real; ejecutar en CI con emulador o Robolectric | 3–4 semanas |
| 4 | Escribir soluciones con ideas de resolución para los 173 temas, empezando por android m0–m4 y node m0–m4 | 2–3 semanas |
| 5 | Re-trocear los temas de más de 45 min, alinear los `*.track.ts` con los `.md`, crear glosario y apéndice por curso, y documentar el flujo autor → revisor pedagógico → revisor técnico | 2 semanas |

---

## 8. Qué no se pudo auditar y por qué

- **Compilación y ejecución Kotlin/Android:** no hay SDK de Android, emulador ni `kotlinc` en el entorno. Los defectos de compilación de §4 se infieren de los imports y de la ausencia de dependencias, no de un build real. El fallo de `dependencyInsight` (m18:61) queda como probable.
- **Node con servicios externos:** no se ejecutaron PostgreSQL/Prisma (m5), Testcontainers (m7), BullMQ/Redis (m8), Docker/Nginx (m11), los temas con Postgres de m12–m13, Kafka/RabbitMQ (`examples/node-messaging`), ni Deno y Bun (m15: no están instalados).
- **Lectura completa:** se leyeron completos los temas de android m0 (los 6), m1 (los 3), m3-T4, m4-T3, m8-T1, m11-T1, m15-T1 y m17-T1, y de node m0-T1/T2, m1-T6, m2-T3, m4-T1, m6-T1/T2, m7-T7, m8-T1, m9-T6, m10-T6, m14-T1 y m15-T1/T2. El resto se ojeó por encabezados, búsquedas dirigidas y fragmentos; las notas de los módulos solo ojeados tienen menor confianza.
- **Capturas SVG** (`content/figures/node/*.svg`) y su coherencia con la salida real: no se revisaron.
- **Lector Angular** (pliegue de soluciones, chips de glosario en `lesson-viewer.ts:940`): no se ejecutó la app.

## Correcciones aplicadas (specs/014)

Líneas = archivo original auditado (`web/public/content/`). Node se verificó ejecutando en `/tmp` con Node v22.23.5; Android/Kotlin (sin SDK ni emulador) contra developer.android.com, dagger.dev, Maven Central y el código fuente de Retrofit, el 2026-11-18. Nada de Android se compiló.

| Defecto (archivo:línea original) | Estado | Cómo se verificó |
|---|---|---|
| B1 · Android sin dependencias Gradle (m1–m14, 16, 17; imports de m5:72, m7:54, m8:53, m9:51) | corregido | Catálogo `libs.versions.toml` en android/modulo-0 (Tema 3) y bloque «Antes de empezar» con `implementation(libs.…)`/plugins en m1–m10 y m15–m16. Versiones de developer.android.com (lifecycle 2.11.1, navigation 2.10.2, room 2.8.5, work 2.12.0, camera 1.6.2, datastore 1.3.0, paging 3.5.3, credentials 1.6.0), Maven Central (retrofit 3.0.0, hilt 2.60.1, ksp 2.3.14, coroutines-test 1.11.0, serialization 1.13.0, logging-interceptor 4.12.0, maps-compose 9.0.1), Firebase BoM 35.2.0, Play Integrity 1.6.0, ML Kit 17.3.0, play-services-location 21.4.0. TOML validado con `tomllib`. No compilado |
| B2 · Pruebas en `src/main` (android/modulo-9.md:47, 180; modulo-7.md:291; modulo-12.md:268) | corregido | Movidas a `src/test` (m9 T1, con `Dispatchers.setMain`) y `src/androidTest` (m9 T2, m7 T3 con `HiltAndroidRule` y `HiltTestRunner`); checklist m12 apunta a `src/test`. m9:288 ya estaba en `androidTest` (además se cambió `ComponentActivity` por `MainActivity`). Contra guías oficiales de pruebas de coroutines y Hilt |
| B3 · Evidencia Android en Python (m0–m13) | corregido | Cada módulo m1–m13 declara que los scripts son modelos; «Verificación real en Android» añadida en m1 (ViewModelProvider + rotación, `am kill`), m3 (deep link con `adb am start`), m4, m5 (Retrofit vía `10.0.2.2`), m6 (KSP/esquema exportado/migración), m7 (`[Dagger/MissingBinding]`, prueba instrumentada), m8 (`TestListenableWorkerBuilder`, `dumpsys jobscheduler`), m9, m12 (`test`/`connectedCheck`/`lint`). m10 (Baseline Profiles) y m13 (AndroidKeyStore) quedan marcados como modelo con la prueba real indicada, sin código de prueba completo |
| B4 · Ejercicios sin solución (1/83 y 0/90) | pendiente: fuera del alcance de specs/014 (soluciones = specs/013 P5) | — |
| B7 · `validate.sh` no detecta estos defectos | pendiente: la tarea prohíbe tocar `scripts/` | — |
| §6.1 Orden `nextTick`/Promise en ESM (node/modulo-0.md:164, 187, 214) | corregido | Ejecutado: ESM `1,3,2`; `.cjs` `1,2,3`; timer `4/5` puede salir tras el I/O. Fuente: `doc/api/process.md` de Node v22 |
| §6.2 Fallo deliberado de permisos (node/modulo-10.md:736) | corregido | Ejecutado: quitar el permiso del script no falla; quitar `--allow-fs-read=./datos/` sale con código 1 y `ERR_ACCESS_DENIED`, `resource: 'datos/envios.csv'` |
| §6.3 Enums en el borrado de tipos (node/modulo-14.md:35, 79) | corregido | Ejecutado: `enum E { A = 1, B = 2 }` → `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX` |
| §6.4 Deno «rechaza» sin `--allow-net` (node/modulo-15.md:53) | corregido | docs.deno.com/runtime/fundamentals/security (pregunta en terminal; `--no-prompt` falla con `NotCapable`). Deno no instalado: no ejecutado |
| §6.5 Logger con `req.path` (node/modulo-4.md:63, 97) | corregido | Ejecutado con express@5: `GET /privado/mensaje -> 401` con `req.originalUrl`; se fijó `express@5` |
| §6.6–6.7 Predictive Back (android/modulo-3.md:391–422) | corregido | Guía oficial predictive-back-gesture: callback habilitado desactiva la animación; `OnBackPressedCallback` se llama siempre; habilitado por defecto. Código completo con imports y `enabled = hayCambiosSinGuardar`; voseo eliminado |
| §6.8 SharedFlow para eventos (android/modulo-4.md:224–364) | corregido | Guía oficial «UI events»: mensaje como estado (`mensajeUsuario` + `mensajeMostrado()`) |
| §6.9 Play App Signing (android/modulo-11.md:16, 22, 106, 110) | corregido | developer.android.com/studio/publish/app-signing; comandos `keytool` y `keytool -printcert -jarfile` ejecutados localmente |
| §6.10 Cambio de idioma no recrea (android/modulo-0.md:306) | corregido | developer.android.com runtime-changes (cita de la auditoría) |
| §6.11 `titulo_bienvenida` nunca se añade (android/modulo-0.md:244–286) | corregido | Ejecutado en `/tmp`: `claves compartidas: {'titulo_bienvenida'}`, idempotente |
| §6.12 `navArgument` como «tipado» (android/modulo-3.md:138) | corregido | Nota con rutas `@Serializable` + `toRoute()` (Navigation 2.8+, guía type-safety); además `composable(...)` pasa a extensión de `NavGraphBuilder` (no compilaba fuera del grafo) |
| `settings.gradle.kts.fragmento` y dependencia fuera de `dependencies {}` (android/modulo-0.md:392, 396) | corregido | `include(":core")` en el `settings.gradle.kts` real; `implementation(project(":core"))` dentro del bloque; `kotlin-jvm` por catálogo |
| `cd android-plataforma && cd android-plataforma` (android/modulo-15.md:43, 169, 289, 455) | corregido | Una carpeta por tema (`android-plataforma-temaN`), un solo `cd` |
| `mkdir -p academia-android/… && cd academia-android` anidado (m1–m14, 16–18) | corregido | `test -f settings.gradle.kts \|\| cd academia-android` en todos los bloques |
| `MainActivity` en paquete no lanzado (android/modulo-1.md:42) | corregido | Paquete `com.academia.android` fijado al crear el proyecto (m0) y m1 reemplaza el archivo de la plantilla en `java/` |
| Archivo antes que su carpeta (node/modulo-14.md:41, 57) | corregido | Ejecutado: `mkdir` primero, `node src/asignar.ts` imprime `{ id: 'p-1', conductorId: 'c-9' }`; `npx tsc` requiere `npm install -D typescript` (verificado: TS2345) |
| Prerrequisito de otro curso (android/modulo-8.md:13) y Docker antes de enseñarlo (node/modulo-5.md:11) | corregido | m8 remite a m0 Tema 6; m5 avisa y acota el uso de Docker |
| `catch (e: Exception)` traga `CancellationException` (android/modulo-8.md:63) | corregido | Relanzada; además se quitó `import androidx.work.Result` (no existe; `Result` es `ListenableWorker.Result`) |
| Retrofit sin converter, `localhost` en emulador, sin `INTERNET` (android/modulo-5.md:72–88) | corregido | `@Serializable`, `asConverterFactory` (paquete verificado en el fuente de Retrofit), `10.0.2.2`, cleartext solo en `src/debug` |
| Hilt sin plugin/KSP/`android:name` (android/modulo-7.md:54) | corregido | dagger.dev/hilt/gradle-setup; añadidos `DatabaseModule` y `provideApiService` (sin ellos, `MissingBinding`) |
| Room sin KSP ni prueba real (android/modulo-6.md:80) | corregido | Guía de Room 2.8.5 (plugin, `schemaDirectory`, `room-ktx` integrado) |
| Prueba de migración con `MigrationTestHelper` (android/modulo-6.md) | pendiente: la guía oficial ya documenta la API de Room 3 (`androidx.room3`); sin SDK no se pudo verificar la de 2.8.x. Se usa verificación en emulador (`A migration from 1 to 2 was required but not found`) | — |
| m4 usa un `TareaRepository` inexistente (android/modulo-4.md:69, hallazgo nuevo) | corregido | Interfaz `FuenteDeTareas` propia de m4; m9 la adapta |
| `Tarea(... completada)` no coincide con m0 (android/modulo-9.md:65) | no reproducible | En `com.academia.android` resuelve a la `@Entity Tarea(id, titulo, completada)` de m6; la de m0 está en `com.academia.model` |
| «la app Restauracion del módulo 4 no existe» (android/modulo-13.md, Tema 5) | no reproducible | android/modulo-4.md Tema 4 crea el proyecto `Restauracion` |
| `dependencyInsight` sin `:app:` (android/modulo-18.md:61) | corregido | Documentación de Gradle (tarea por proyecto); no ejecutado |
| Restos editoriales: «Trazabilidad…» (android m14:803, node m14:470), «Aplicación del material de referencia» y marcadores del atlas (android m13), «verificable en este entorno» (android m9:41) | corregido | `grep` de specs/014 B2/B3 sin coincidencias en android y node |
| Voseo (android/modulo-3.md:414–422; node/modulo-14.md, 23 formas) | corregido | Búsqueda de formas en -á/-é/-í |
| Node 18 como mínimo (node m2:774, m3:513, m3:653, m9:801) | corregido | LTS con soporte (22 o 24) |
| `===` entre `Buffer` (node/modulo-6.md:100) | corregido | Ejecutado: `valida: false` con `actual === esperadoBuffer` |
| Laboratorios `examples/` contradicen «no copies del repositorio» (node m0:55 vs m14:124, 187) | corregido | Aviso de excepción y `git clone` al inicio de node m14 |
| Fragmento m17:43 sin imports; cierres vacíos m15; 404 que «no falla» (node m3:70); duración de temas; tracks desalineados; glosario | pendiente: defectos mayores/menores que no impiden seguir el tema; quedan para la reescritura (specs/013 P5) | — |
