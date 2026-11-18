# Auditoría editorial y pedagógica: DevOps (módulos 0–22) y Kotlin Multiplatform (módulos 0–13)

Fecha: 2026-11-18. Auditor independiente (no autor). Rúbrica y reglas: `docs/auditoria/PROMPT-AUDITORIA.md` (A1–F3 y Parte 2).
Alcance: `web/public/content/devops/modulo-0.md … modulo-22.md` (139 temas), `web/public/content/kotlin-multiplatform/modulo-0.md … modulo-13.md` (66 temas), `web/src/app/tracks/devops.track.ts`, `web/src/app/tracks/kotlin-multiplatform.track.ts`.
Método: lista de temas de cada módulo con `grep '^### Tema'`; lectura completa de al menos un tema por módulo (primero, medio o último, rotando) y lectura parcial del resto; ejecución en `/tmp/aud` de 17 bloques de código (tabla en la sección 7); contraste de hechos dudosos con documentación oficial. Punto de partida mecánico: `python3 scripts/audit_plantilla.py` (DevOps 19/139 temas "cumplen"; KMP 10/66).

---

## 1. Veredicto ejecutivo

**No.** Ninguno de los dos cursos cumple hoy el objetivo de que «cualquier persona aprende fácil». Los temas tienen buena intención estructural (objetivo, caso, analogía, demostración, fallo deliberado, cierre), pero **las demostraciones fallan al ejecutarse** en puntos de entrada críticos. Los 14 bloques Git del módulo 1 de DevOps usan `alpine/git sh -c`, y la imagen pasa `sh` a `git` como subcomando. Los dos primeros temas de Docker se detienen en `RUN npm ci` porque no existe un archivo de bloqueo. El Hello World de KMP ejecuta `./gradlew` en una carpeta vacía. El módulo 13 de KMP enseña a combinar con `lipo` dos binarios arm64, algo que no se puede hacer. Los proyectos integradores no integran nada que se ejecute: el validador de DevOps imprime `True` fijo, y el integrador de KMP solo muestra un árbol de carpetas. **No hay ni una solución documentada** (0 bloques `<details>` en 37 módulos). `validate.sh` pasa en verde con todo esto. Veredicto: **No publicable sin corrección**. DevOps 0–10 está cerca de «aceptable» una vez corregidos los bloqueantes; KMP 8–13 y DevOps 13–15/20/22 hay que reescribirlos.

---

## 2. Puntuación A1–F3 por curso (0 ausente · 1 deficiente · 2 aceptable · 3 ejemplar)

| Criterio | DevOps | Evidencia DevOps | KMP | Evidencia KMP |
|---|---|---|---|---|
| A1 Ejemplo antes que teoría | 1 | La plantilla pone la teoría antes de la demo: `#### Paso 3 · Teoría con analogía` precede a `#### Paso 4 · Demostración guiada desde cero` (devops/modulo-0.md:86 y :113). El «caso real» es una fórmula genérica: «Este es un caso real de cualquier pipeline de CI/CD» (devops/modulo-2.md:16). | 1 | Mismo orden en kotlin-multiplatform/modulo-0.md:74 (Paso 3 teoría) y :91 (Paso 4). En los módulos 8–13 el caso sí es concreto («obtiene el error "building for iOS Simulator, but linking against a dylib built for iOS"», modulo-13.md:12), pero llega antes que la teoría y no hay demo ejecutable. |
| A2 Analogías | 2 | La mayoría son correctas y declaran su límite: «La analogía falla en que el inspector aquí es un programa que no se cansa» (devops/modulo-8.md:736). Riesgo: «Un healthcheck es esperar a que el cocinero confirme "ya estoy listo"» (devops/modulo-3.md:24) induce a pensar que el servicio avisa; en realidad Docker sondea. | 2 | Correctas pero decorativas: «La analogía es una pieza industrial con medidas distintas según la máquina» (modulo-13.md:15). La de modulo-10.md se repite 2 veces en el mismo tema (líneas 15 y 37). |
| A3 Errores comunes reales | 1 | Hay sección en todos los temas, pero varios «fallos deliberados» no se reproducen o dan otro error: «Debes ver `Permission denied`» (devops/modulo-0.md:138), aunque el comando previo deja el script en 754 (ejecutado: `hola desde script.sh`, rc=0). «Falla con `presupuesto de error agotado`» (devops/modulo-14.md:70): lo ejecuté y da `ZeroDivisionError`. «El build falla con un error de etapa no encontrada» (devops/modulo-2.md:85): BuildKit intenta descargar `docker.io/library/otra-etapa`. | 1 | Fallos descritos en prosa que no se pueden reproducir: «Pista: distribuí únicamente el framework…» (modulo-13.md:42). Incluso se muestra uno equivocado: «combina ambos con `lipo -create`» (modulo-13.md:327). |
| A4 Ejercicios progresivos con solución | 0 | `grep -c "<details"` = 0 en los 23 módulos. Ningún encabezado «Solución». Los 19 temas que el JSON mecánico da por «con solución» son falsos positivos: casa «solución rápida» (modulo-0.md:152) y «resolución DNS» (modulo-0.md:599). | 0 | 0 `<details>`, 0 soluciones. Los ejercicios son «Completa el código: … `nombre ____ "invitado"`» (modulo-0.md:175) sin respuesta. |
| A5 Proyecto integrador 30–60 min | 1 | Existe (módulo 13), pero el validador no valida: `print("imagen etiquetada con el hash del commit: True")` (devops/modulo-13.md:99). Cambié `github.sha` por `latest` y siguió imprimiendo `True`. El pipeline de ejemplo no tiene `actions/checkout` y escanea una imagen que nunca se publicó (modulo-13.md:50–75). Duración declarada: 8 h (devops.track.ts). | 1 | Módulo 11: la «demostración» es un bloque `text` con un árbol de carpetas (modulo-11.md:55–63) y `./gradlew commonTest` (modulo-11.md:68), una tarea que no existe. |
| A6 Progresión coherente | 1 | El módulo 0, Tema 9, usa Compose antes del módulo 3: «Conocimiento previo: Docker y Compose funcionando» (modulo-0.md:697). El módulo 13 titula «Tema 3: Cierre del track» (modulo-13.md:232), pero siguen 9 módulos. El módulo 15, Tema 1, repite el módulo 3, Tema 1 (healthcheck + `service_healthy`, modulo-15.md:9). Los módulos 19–21 (DDD, outbox, microservicios) se trasplantaron desde otro curso: `mkdir -p arquitectura-moderna/modulo-19/...` (modulo-19.md:41). | 1 | `sealed class EstadoUI` en el módulo 0, Tema 3 (modulo-0.md:366), aunque las sealed classes se enseñan en el módulo 1, Tema 3. «Tema 3: Cierre del track» (modulo-11.md:174) va seguido de los módulos 12 y 13. Caída brusca de densidad: el módulo 7 tiene 1187 líneas y el 11, 264. |
| B1 Misma plantilla | 1 | Conviven dos plantillas: Paso 1–7 con «Conceptos clave/Analogía/Diagrama» (0–12, 16–22) y otra comprimida en la que el Paso 5 es solo «Pista: … Ese es el fallo deliberado» (13–15). El módulo 22 pone «¿Por qué es importante?» antes del Paso 1 (modulo-22.md:15). Medición: 19/139 temas cumplen los 8 elementos; «análisis» falta en el 100 % de los temas de los módulos 13, 14, 15, 19, 20, 21 y 22. | 1 | 0–7: plantilla larga con «repetición progresiva» y «reto de memoria». 8–13: plantilla corta en voseo. Medición: 10/66; falta «análisis» en 24 temas (todos los de los módulos 10–13). |
| B2 Texto sin código / código sin explicación | 2 | Todos los temas tienen código. «Explicación línea por línea» suele ser una sola frase: «`Dockerfile.sinoptimizar` copia todo el proyecto…» (modulo-2.md:59). | 1 | Temas sin código ejecutable: modulo-11.md, Tema 1 (solo árbol de carpetas); modulo-13.md, Temas 2–3 (una línea de Kotlin con `c_funcion_nativa` sin declarar, :70; una firma suelta, :121). |
| B3 Objetivos y resumen | 2 | «Al finalizar podrás…» en cada tema (p. ej. modulo-0.md:78); el resumen es una frase en «Paso 7 · Cierre» (modulo-0.md:150). | 2 | «Al finalizar podrás…» (modulo-0.md:66); cierre de una frase. |
| B4 Módulo 0 de entorno | 1 | Cubre Windows/macOS/Linux y `docker run --rm hello-world` (modulo-0.md:8–27), pero no explica cómo instalar `kubectl`, `kind`, `helm`, `terraform` ni `minikube`, aunque se usan desde modulo-6.md:42. No hay sección de errores de instalación. | 1 | Tabla de JDK/Gradle por SO (modulo-0.md:11–14), pero el primer ejercicio no se puede ejecutar: crea el archivo «Desde una carpeta vacía» y luego `./gradlew :shared:compileKotlinMetadata` (modulo-0.md:93–110) sin wrapper ni `build.gradle.kts`. No hay Hello World con `main`. |
| C1 Código completo y ejecutable | 1 | Fallan al ejecutarse: `RUN npm ci` sin lockfile (modulo-2.md:69 y :155); `alpine/git sh -c` (14 veces, p. ej. modulo-1.md:56); `curl -s '…[1m]'` (modulo-9.md:150, :394; ejecutado: `curl: (3) bad range`); YAML inválido (modulo-4.md:392); `node src/relay.mjs` ejecuta un módulo que solo exporta una función, y faltan `scripts/registrar.mjs` y `crear-tablas.mjs` (modulo-20.md:213, :314). | 1 | `./gradlew commonTest` (17 veces; no es una tarea de Gradle); `lipo` de dos arm64 (modulo-13.md:34); YAML de Actions sin `runs-on`, repetido 3 veces (modulo-10.md:19, :46, :76). |
| C2 Respeta ESTANDAR-DE-CODIGO | 1 | El estándar exige «Errores explícitos: no se ocultan excepciones». En cambio: `kubectl set image … --record 2>/dev/null \|\| true` (modulo-6.md:71) y `terraform output -json 2>/dev/null \|\| true` (modulo-8.md:69). El estándar pide «Verificación»; el validador imprime `True` fijo (modulo-13.md:99). | 1 | El test tautológico `assertTrue(marcas <= 6)` (modulo-2.md:535) verifica algo que siempre se cumple. El mismo YAML se pega 3 veces en un tema (modulo-10.md). |
| C3 APIs/versiones obsoletas | 1 | `jenkins/jenkins:lts-jdk17` (modulo-16.md:362): imágenes Java 17 retiradas desde 2.555.1. `node:20-alpine` (modulo-0.md:790; modulo-6.md:71 «actualiza» de 22 a 20): EOL desde el 30-04-2026. `--record` está obsoleto. `trivy-action@0.28.0` fijada por etiqueta mutable (modulo-4.md:401; modulo-13.md:65). | 1 | Versiones contradictorias: módulo 0 «Kotlin 2.4.21» (:16) frente a `kotlin = "2.2.20"` (modulo-3.md:518) y `kotlin("plugin.allopen") version "2.2.20"` (modulo-9.md:275); Ktor `3.5.0` (modulo-3.md:227) frente a `3.3.0` (modulo-3.md:519). `iosX64()` se presenta como «necesaria» (modulo-3.md:271) cuando es Tier 3. |
| C4 Ejercicios con solución | 0 | Ver A4. | 0 | Ver A4. |
| D1 Segunda persona consistente | 1 | Mezcla tú/vos: «cambiá `slo = 0.999`… y ejecutá» (modulo-14.md:70); «no necesitás un clúster» (modulo-13.md:9); «acá» (modulo-0.md:134). Hay voseo en los módulos 6, 7, 13, 14 y 15. | 1 | «Entregá…; explicá…; estudiá» (modulo-13.md:48). Voseo en los módulos 8–13 frente a tuteo en 0–7. |
| D2 Jerga sin explicar | 2 | Se explican banderas en línea («`--rm` es la bandera que…», modulo-0.md:134), pero hay conceptos clave que nunca se desarrollan: «BuildKit, multi-stage build, cache mount» (modulo-15.md:18) no vuelve a aparecer en el tema. | 1 | «lipo, fat binary, toolchain Apple y cross-compilation» (modulo-13.md:18) no se explican. «modulemap», «umbrella header» (modulo-8.md:16) se definen en una frase. |
| D3 Conocimiento previo no enseñado | 1 | «Docker básico… (Módulo 1 del track Cloud…)» (modulo-2.md:12): depende de otro curso. `kind create cluster` (modulo-6.md:42) sin instalación previa. «Conocimiento previo: … AWS SDK v3» (modulo-20.md:179), nunca enseñado en el curso. | 1 | Supone un proyecto KMP generado (modulo-0.md:18) que en el tema se crea con `mkdir`. «Prerrequisitos: Tema 0 del track» (modulo-8.md:9): no existe ningún «Tema 0». |
| E1 Qué detecta validate.sh | 1 | `scripts/validate.sh` comprueba paridad de archivos, índice, catálogo, laboratorios citados y specs. Lo ejecuté: `validate.sh: ok` con todos los fallos de este informe. | 1 | Igual. |
| E2 Ejecuta código / plantilla / jerga | 0 | No ejecuta bloques, no valida YAML/HCL ni la plantilla (`audit_plantilla.py` es aparte y mide palabras clave con falsos positivos), y no comprueba glosario ni enlaces. | 0 | Igual. |
| E3 Flujo autor → revisor pedagógico → técnico | 0 | No está documentado en `docs/`. El propio contenido lo admite: «la ejecución completa queda como **revisión manual pendiente**. No presentes estas lecciones como un laboratorio ya ejecutado» (modulo-22.md:9), lo que contradice CLAUDE.md: «Ningún dato técnico se escribe sin ejecutarlo». | 0 | Igual. |
| F1 Riesgo de temas sin revisión | 0 | 139 temas; 17 de ellos ejecutados en esta auditoría, con fallos en 9. Si la muestra es representativa, más de la mitad de las demos tiene al menos un defecto bloqueante. | 0 | 66 temas, sin ningún bloque Kotlin compilable con lo descrito (falta el proyecto Gradle) salvo los extraídos a mano. |
| F2 Ruta core priorizada | 1 | Hay un mapa de 4 etapas (modulo-0.md:35–44), pero 14 de 23 módulos son «Experto» y se publican a la vez; no hay marca de «core». | 1 | Mapa de 4 etapas (kotlin-multiplatform/modulo-0.md:30–44); 7 de 14 módulos son «Experto» y no hay liberación escalonada. |
| F3 Glosario y apéndices | 0 | `grep -ril glosario` solo encuentra «No es un glosario global» (modulo-19.md:171). No hay apéndice. | 0 | No hay glosario ni apéndice. |

---

## 3. Tabla por módulo

Nota global por módulo (0–3). «Leído completo» indica el tema leído íntegro; el resto se ojeó.

### DevOps

| Módulo | Temas | Nota | Defecto principal (cita) | Corrección concreta |
|---|---|---|---|---|
| 0 Linux y shell | 11 | 2 | Fallo deliberado que no ocurre: «ejecuta `./script.sh` … después de `chmod 600` … Debes ver `Permission denied`» (modulo-0.md:138); el comando anterior termina en `chmod 754`. «Idempotencia» con `tee -a` (modulo-0.md:360, :367): el log crece en cada ejecución. | Separar `chmod 600` en un comando propio antes del fallo; usar `tee` sin `-a` o cambiar el texto a «re-ejecutable sin error». Añadir la instalación de kind/kubectl/terraform/helm al bloque «Antes de comenzar». |
| 1 Git avanzado | 7 | 1 | `docker run … alpine/git sh -c` (modulo-1.md:56, 133, 145, 209, 224, 296, 309, 378, 458, 532): la imagen ejecuta `git sh -c …` → «git: 'sh' is not a git command». Todas las demos del módulo fallan. | `--entrypoint sh alpine/git -c '…'` o git nativo del host. Aplicar también en modulo-4.md:276, modulo-9.md:562, modulo-12.md:424. |
| 2 Docker | 9 | 1 | `RUN npm ci` sin `package-lock.json` (modulo-2.md:69, :155): ejecutado, `npm error The \`npm ci\` command can only install with an existing package-lock.json`. | Generar el lock (`npm install --package-lock-only`) en el paso de preparación o usar `npm install`. Corregir el mensaje esperado de :85 (BuildKit busca `docker.io/library/otra-etapa`). |
| 3 Compose | 4 | 2 | El fallo deliberado no es observable: «revisando `docker compose logs app` en busca de errores de conexión» (modulo-3.md:79), pero `app` solo hace `echo` y nunca conecta con `db`. | Hacer que `app` ejecute `pg_isready -h db` o un cliente real para que el fallo aparezca. `docker compose config` sí valida el YAML (comprobado). |
| 4 CI | 5 | 1 | YAML no válido: `with: { registry: ghcr.io, username: ${{ github.actor }}, … }` (modulo-4.md:392); PyYAML: «expected ',' or '}', but got '{'». `aquasecurity/trivy-action@0.28.0` (:401) va con una etiqueta que fue reescrita en el ataque de marzo de 2026. | Usar mapas en bloque (`with:` con una clave por línea). Fijar las acciones por SHA completo y enseñar por qué. |
| 5 CD | 7 | 2 | 6/7 temas sin solución (mecánico, confirmado: 0 `<details>`). Blue-green coherente (modulo-5.md:40–70). | Añadir soluciones plegadas con el razonamiento. |
| 6 Kubernetes I | 10 | 2 | `kubectl set image … node:20-alpine --record 2>/dev/null \|\| true` (modulo-6.md:71): bandera obsoleta, errores silenciados y «actualización» a Node 20, ya en EOL. | Usar `node:24-alpine`, quitar `--record` y la supresión de errores, y explicar `kubectl annotate … kubernetes.io/change-cause`. |
| 7 Kubernetes II | 8 | 2 | Falso: «kind no lo hace por defecto» (aplicar NetworkPolicy) (modulo-7.md:653); kindnet implementa NetworkPolicy desde kind v0.24.0. | Indicar la versión de kind y retirar Calico como requisito; mantenerlo solo como alternativa. |
| 8 Terraform | 9 | 2 | HCL inválido en línea: `module "vpc" { source = "./modulos/vpc"; cidr = "10.0.0.0/16" }` (modulo-8.md:196); HCL no admite `;`. No se enseña a instalar Terraform ni OpenTofu. | Mostrar el bloque en varias líneas y añadir la instalación al módulo 0. |
| 9 Observabilidad | 8 | 1 | `curl -s 'http://localhost:9090/api/v1/query?query=rate(http_requests_total[1m])'` (modulo-9.md:150) y la de :394: ejecutado, `curl: (3) bad range in URL`; con `-s` no se ve ningún error y `json.tool` falla. Tema 1 sí funciona (ejecutado). | `curl -sG … --data-urlencode 'query=rate(http_requests_total[1m])'`. |
| 10 Logging | 4 | 2 | 3/4 temas sin solución; el Tema 1 funciona (ejecutado: `conexion-db -> timeout conectando a db`). Sin diagramas Mermaid en todo el módulo. | Soluciones plegadas; diagrama del pipeline EFK. |
| 11 DevSecOps | 7 | 1 | El resultado esperado es falso: «lista cada CVE encontrada en `lodash@4.17.15`» (modulo-11.md:81), pero el Dockerfile (:57–62) solo copia `package.json` y nunca instala; Trivy, en modo imagen, busca `package.json` dentro de `node_modules`. | Añadir `RUN npm install --omit=dev` (o escanear con `trivy fs`). Actualizar `trivy:0.55.0`. |
| 12 Lab → nube | 7 | 1 | `alpine/git:2.45.2 sh -c` (modulo-12.md:424), el mismo defecto que el módulo 1. | `--entrypoint sh`. |
| 13 Integrador | 3 | 0 | El validador miente: `print("imagen etiquetada con el hash del commit: True")` (modulo-13.md:99). El pipeline (:50–75) no tiene checkout y escanea una imagen local de otro runner. Son 3 temas para «8 h». | Comprobar de verdad `${{ github.sha }}` en `build`/`deploy`; añadir checkout, push al registro y un escaneo por digest; reducir el proyecto a 30–60 min con evidencia ejecutable (por ejemplo con `act` o Floci). |
| 14 SRE | 4 | 1 | «Falla con `presupuesto de error agotado`» (modulo-14.md:70): ejecutado, sale `ZeroDivisionError: float division by zero` en la línea del `print`. Voseo. | Proteger la división cuando el presupuesto es 0 o cambiar el resultado esperado. Unificar el tuteo. |
| 15 DevOps Master | 6 | 1 | Duplica el módulo 3, Tema 1 («`depends_on` por defecto solo espera a que el contenedor "exista"», modulo-15.md:12), el módulo 12, Tema 5 (GitOps) y el módulo 7, Tema 6 (mesh); «BuildKit… cache mount» (:18) no se explica. Declara 12 h. | Fusionar con 3/7/12 o reorientarlo a temas nuevos (cache mounts reales, Argo CD Rollouts). |
| 16 QA Automation | 6 | 2 | `jenkins/jenkins:lts-jdk17` (modulo-16.md:362): las imágenes Java 17 se retiraron con Jenkins 2.555.1, así que la etiqueta queda congelada sin parches. | `jenkins/jenkins:lts-jdk21`. |
| 17 Sistemas distribuidos | 4 | 2 | 4/4 temas sin solución (mecánico). No auditado en profundidad (leído por encima). | Soluciones plegadas. |
| 18 VPS | 4 | 2 | Sin alternativa local: «Un contenedor no sirve… Usa una VM o un VPS» (modulo-18.md:19). Un principiante necesita pagar o montar una VM sin guía. | Añadir la ruta con Multipass o una VM local paso a paso. |
| 19 DDD | 4 | 2 | Contradicción: el objetivo pide «devuelva un resultado nuevo» (modulo-19.md:351), pero el código hace `return this` tras mutar. El fallo deliberado («El estado no cambia», :455) no falla: ejecutado, los 2 tests pasan. | Alinear el objetivo con el código; convertir el fallo en una aserción `assert.throws` con `'use strict'`. |
| 20 Eventos/outbox | 4 | 1 | Código incompleto: «Crea `scripts/crear-tablas.mjs` … y `scripts/registrar.mjs`» (modulo-20.md:254) no se muestran, y `relay.mjs` no se invoca ni lee `SQS_QUEUE_URL` (:314). `Scan` con `Limit` + `FilterExpression` (:262–266) puede devolver 0 pendientes aunque haya ítems. «Caso real… PostgreSQL» (:191) frente a un código con DynamoDB. | Publicar los scripts completos y un `main` del relay; usar un GSI por `estado` o paginar sin `Limit`. |
| 21 Microservicios | 4 | 2 | Falta «análisis» en 4/4 temas (mecánico). No auditado en profundidad. | Añadir la explicación por bloques. |
| 22 Floci | 4 | 1 | El contenido declara que no se ha probado: «la ejecución completa queda como revisión manual pendiente» (modulo-22.md:9). Los comandos de Floci se contrastaron con floci.io y son correctos. | Ejecutarlo y retirar el aviso, o despublicar hasta hacerlo. |

### Kotlin Multiplatform

| Módulo | Temas | Nota | Defecto principal (cita) | Corrección concreta |
|---|---|---|---|---|
| 0 Fundamentos | 4 | 1 | El Hello World no se puede ejecutar: «Desde una carpeta vacía… crea `shared/src/commonMain/…/NullSafety.kt`» y después `mkdir -p …; cd academia-kmp; ./gradlew :shared:compileKotlinMetadata` (modulo-0.md:93–110). No hay wrapper ni `build.gradle.kts`. `sealed class` (modulo-0.md:366) se usa antes de enseñarse. | Paso 0: generar el proyecto con el asistente o el wizard oficial y mostrar su `build.gradle.kts`; añadir `fun main()` en `jvmMain`. Mover `sealed` al módulo 1. (El código Kotlin del Tema 1 y del Tema 3 compila y da la salida esperada; ejecutado con Kotlin 2.0.21 embebido.) |
| 1 Funcional | 5 | 2 | 4/5 temas sin solución. No leído completo. | Soluciones plegadas. |
| 2 Coroutines | 4 | 1 | Test tautológico: `assertTrue(marcas <= 6)` (modulo-2.md:535) siempre pasa. El track promete «kotlinx.atomicfu» (kotlin-multiplatform.track.ts, módulo 2), pero `grep -c atomicfu modulo-2.md` = 0. | Medir el bloqueo con una marca temporal (p. ej. `marcas < 6` antes del `await`); escribir el tema de atomicfu o quitarlo del track. |
| 3 Arquitectura KMP | 6 | 1 | El tema sobre «una sola fuente de versiones» fija `kotlin = "2.2.20"`, `ktor = "3.3.0"` (modulo-3.md:518–519), mientras el Tema 3 usa Ktor `3.5.0` (:227) y el módulo 0, Kotlin 2.4.21. | Unificar en una tabla de versiones del curso y referenciarla. |
| 4 Lógica compartida | 5 | 2 | Orden del track distinto del Markdown: «'Tiempo determinista…'» aparece primero en la lista del track (módulo 4) y es el Tema 5. El código del Tema 5 funciona (ejecutado: «Antes, límite y después: correctos»). | Reordenar la lista de temas del track. |
| 5 Ktor | 5 | 2 | `kotlinx-serialization-json:1.7.3` (modulo-5.md:599) va desfasado frente a Kotlin 2.4.21. 4/5 sin solución. | Alinear versiones. |
| 6 SQLDelight | 5 | 2 | 4/5 sin solución. Test JVM con `JdbcSqliteDriver` bien planteado (modulo-6.md:66–95); no ejecutado (sin acceso a Maven Central). | Soluciones plegadas. |
| 7 Compose MP | 8 | 2 | 7/8 sin solución. Afirmación correcta y fechada: «estable… con la versión 1.8.0 (mayo de 2025)» (modulo-7.md:478). | Soluciones plegadas. |
| 8 Interop iOS | 4 | 1 | La demo del Tema 1 fabrica a mano un `Shared.framework` falso con `mkdir` e `Info.plist` (modulo-8.md:41–70): «Los archivos representan lo que el build debe producir». El diagrama une simulador y dispositivo en un solo `Shared.framework`. «Prerrequisitos: Tema 0 del track» (:9). | Generar el framework real con `linkDebugFrameworkIosSimulatorArm64` (se requiere macOS) y presentar el XCFramework como la única forma de unirlos. |
| 9 Testing | 4 | 1 | `./gradlew commonTest` (modulo-9.md:66, 132, 210): no existe esa tarea; la documentada es `allTests`. «Prerrequisitos: JDK 17+» (:9) frente a JDK 27 en el módulo 0. El track promete «Cobertura» (sin contenido). | `./gradlew :shared:allTests` o `jvmTest`; unificar el JDK; añadir Kover o quitarlo del track. |
| 10 CI/CD | 3 | 0 | El YAML de Actions no tiene `on:`, ni `runs-on` en dos jobs, ni checkout, ni setup-java, y se repite 3 veces (modulo-10.md:19–31, 46–58, 76–88). El diagrama afirma «`test-common` debe ser `needs:`» (:60), pero el YAML no tiene `needs`. | Un único workflow completo y válido con `needs`, `actions/setup-java` y caché de Gradle; validarlo con actionlint. |
| 11 Integrador | 3 | 0 | Sin código: árbol de carpetas en lugar de demo (modulo-11.md:55–63). Afirmación falsa: «`commonTest` … con la garantía de que esa verificación es igualmente válida para ambas plataformas» (:21); los tests comunes deben ejecutarse en cada target, y el propio módulo 13 dice «una compilación JVM exitosa no demuestra que el binario iOS funcione» (modulo-13.md:20). | Rehacerlo como un proyecto de 30–60 min con repositorio semilla, `allTests` en JVM e iOS Simulator y entregables verificables. |
| 12 Producción | 4 | 1 | Falta «análisis» en 4/4 temas; `./gradlew commonTest` (modulo-12.md:93, 181, 377); voseo. | Igual que en el módulo 9; añadir explicación por bloques. |
| 13 KMP Master | 6 | 0 | Error técnico: `lipo -create` de `iosArm64` + `iosSimulatorArm64` (modulo-13.md:34–37). Ambos son arm64 y `lipo` rechaza dos slices de la misma arquitectura. `gradle init --type kotlin-application` (:25) no genera un proyecto KMP. `await taskClient.task(...)` (:132) sin `try`. `c_funcion_nativa` (:70) no se declara. | Sustituir por `XCFramework` (`assembleXCFramework`); partir de la plantilla KMP; `try await`; incluir el `.def` y el `.h` completos. |

---

## 4. Defectos

### 4.1 Bloqueantes (impiden publicar), por gravedad

1. **Todas las demos Git del módulo 1 de DevOps fallan** (`devops/modulo-1.md:56, 133, 145, 209, 224, 296, 309, 378, 458, 532`; también `modulo-4.md:276`, `modulo-9.md:562`, `modulo-12.md:424`). `alpine/git` pasa los argumentos a `git` (Docker Hub: «docker run … alpine/git <git_command>»). El host lo confirma: `git sh -c` → «git: 'sh' is not a git command». La lógica de bisect sí funciona con git nativo. **Corrección:** `docker run --rm --entrypoint sh -v "$(pwd)":/repo -w /repo alpine/git -c '…'`.
2. **Docker, Temas 1 y 2: el build se detiene en `RUN npm ci`** (`devops/modulo-2.md:69`, `:155`). Lo ejecuté sin lockfile: «The `npm ci` command can only install with an existing package-lock.json». En `Dockerfile.sinoptimizar` lo tapa `|| true` (:54). **Corrección:** crear el lock en la preparación o usar `npm install --omit=dev`; quitar `|| true`.
3. **KMP módulo 0: el primer ejercicio no se puede ejecutar** (`kotlin-multiplatform/modulo-0.md:93–110`): `./gradlew` en una carpeta creada con `mkdir`. El mismo patrón se repite en los temas 2–4 y en el módulo 2 (`modulo-2.md:74`, `:209`, `:368`). **Corrección:** paso 0 con el wizard oficial y el `build.gradle.kts` completo mostrado en el texto.
4. **KMP módulo 13, Tema 1, enseña una operación imposible** (`modulo-13.md:34–39`, repetida en :45 y :327): `lipo -create` de dos binarios arm64. **Corrección:** XCFramework.
5. **Los integradores no integran ni verifican** (`devops/modulo-13.md:99` imprime `True` fijo; comprobado sustituyendo `github.sha` por `latest`; `kotlin-multiplatform/modulo-11.md:55–68` no tiene código). **Corrección:** proyecto ejecutable de 30–60 min con comprobaciones reales.
6. **Tarea Gradle inexistente `./gradlew commonTest`, 17 veces** (`kotlin-multiplatform/modulo-8.md:199, 271`; `modulo-9.md:66, 132, 210`; `modulo-10.md:93, 173, 234`; `modulo-11.md:68, 157, 227`; `modulo-12.md:93, 181, 377`; `modulo-13.md:78, 127, 293`). La documentación oficial solo nombra `allTests` y usa `commonTest` como nombre de *source set*. **Corrección:** `./gradlew :shared:allTests`.
7. **YAML de GitHub Actions inválido o incompleto** (`devops/modulo-4.md:392`, falla al parsear; `kotlin-multiplatform/modulo-10.md:19–88`, jobs sin `runs-on` y sin `on:`). **Corrección:** mapas en bloque y un workflow completo validado con actionlint en CI.
8. **Cero soluciones documentadas en 205 temas** (0 `<details>`). La metodología exige «Las soluciones permanecen plegadas» (`docs/METODOLOGIA-DE-APRENDIZAJE.md`, «Ciclo de capítulo anterior», punto 5). **Corrección:** una solución plegada por práctica independiente, con la idea de resolución.
9. **Módulo 22 publicado sin ejecutar, según su propio texto** (`devops/modulo-22.md:9`). **Corrección:** ejecutarlo o retirarlo.

### 4.2 Mayores (degradan el aprendizaje)

1. PromQL con `curl` sin `-g` (`devops/modulo-9.md:150`, `:394`): falla con `bad range`, y además `-s` oculta el error. Usar `--data-urlencode`.
2. Escaneo de imagen sin dependencias instaladas (`devops/modulo-11.md:57–62` frente a `:81`): el resultado esperado sobre lodash es falso. Añadir `RUN npm install`.
3. Outbox incompleto (`devops/modulo-20.md:254`, `:314`) y semántica errónea de `Scan` con `Limit` (`:262–266`). Publicar los scripts y usar un GSI o paginación.
4. Test tautológico (`kotlin-multiplatform/modulo-2.md:535`). Reescribir la aserción.
5. Fallos deliberados que no se reproducen o dan otro error: `devops/modulo-0.md:138` (ejecutado: rc=0), `devops/modulo-14.md:70` (ejecutado: `ZeroDivisionError`), `devops/modulo-2.md:85` (el mensaje real es un fallo de resolución de imagen en `docker.io`), `devops/modulo-3.md:79` (`app` nunca conecta), `devops/modulo-19.md:455` (los tests siguen en verde).
6. Fijación de acciones por etiqueta mutable en el módulo de seguridad (`devops/modulo-4.md:401`, `devops/modulo-13.md:65`): `trivy-action@0.28.0`. El curso no enseña a fijar por SHA (`grep` de «commit SHA» sin resultados).
7. Versiones incoherentes dentro de KMP (Kotlin 2.4.21 en `modulo-0.md:16`; 2.2.20 en `modulo-3.md:518` y `modulo-9.md:275`; JDK 27 frente a «JDK 17+» en `modulo-9.md:9` y `modulo-10.md:9`; Ktor 3.5.0, 3.3.0 y, en el fallo deliberado, 2.3.12).
8. Herramientas sin instalación enseñada: `kind`, `kubectl`, `helm`, `terraform`, `conftest`, `aws`, `minikube` (primer uso: `devops/modulo-6.md:42`).
9. Progresión rota: «Cierre del track» en `devops/modulo-13.md:232` y `kotlin-multiplatform/modulo-11.md:174`, seguidos de 9 y 2 módulos. Módulo 15 duplicado (`devops/modulo-15.md:9–12` frente a `devops/modulo-3.md:10`). Contenido de arquitectura de software (19–21, carpeta `arquitectura-moderna/`) dentro del curso DevOps.
10. Duraciones del track incoherentes con la metodología («Un tema es una sesión de 20–45 minutos»): DevOps 13 = «8 h» para 3 temas, DevOps 15 = «12 h» para 6, KMP 11 = «7 h» para 3 temas de 264 líneas en total.
11. Desajustes entre track y contenido: KMP 2 promete atomicfu, KMP 9 promete cobertura, KMP 4 ordena los temas de otra forma.
12. Afirmación falsa en KMP 11 sobre la validez de `commonTest` para ambas plataformas (`modulo-11.md:21`), que contradice `modulo-13.md:20`.
13. KMP 8, Tema 1, simula el artefacto en lugar de construirlo (`modulo-8.md:41`): el alumno «verifica» un framework escrito a mano.
14. Tres nombres de proyecto acumulativo («Plataforma de entrega continua» ×91, «RutaFlow» ×19, «Núcleo móvil compartido» ×37) y cuatro raíces de carpeta (`academia-devops/`, `arquitectura-moderna/`, `laboratorio-floci/`, `ejemplo/`). Esto contradice «Cada track mantiene un proyecto que evoluciona» (METODOLOGÍA, «Ruta del proyecto»).

### 4.3 Menores (estilo y forma)

1. Voseo mezclado con tuteo: `devops/modulo-6, 7, 13, 14, 15`; `kotlin-multiplatform/modulo-8 … 13` (p. ej. «Corregí el Paso 5», `modulo-13.md:45`). Unificar en tuteo.
2. Párrafos redundantes: el mismo YAML 3 veces y la analogía 2 veces en `kotlin-multiplatform/modulo-10.md`.
3. Bloque con lenguaje inexistente: ` ```anatomy ` (`devops/modulo-20.md:207`); depende de un componente del lector y en Markdown plano se ve como texto.
4. `object Cargando` en lugar de `data object` (Kotlin ≥1.9) e `is EstadoUI.Cargando` sobre un `object` (`kotlin-multiplatform/modulo-0.md:367`, `:373`).
5. `iosX64()` presentado como «necesaria» (`kotlin-multiplatform/modulo-3.md:271`): es Tier 3, «not guaranteed to be tested on CI».
6. «Explicación línea por línea» de una sola frase (`devops/modulo-2.md:59`, `:125`): el nombre promete más de lo que da.
7. `terraform output -json 2>/dev/null || true` (`devops/modulo-8.md:69`) no aporta nada (no hay outputs declarados) y oculta errores.
8. Enunciado confuso: «hazlo legible por cualquiera pero no escribible ni por el propio propietario salvo lectura (`444`)» (`devops/modulo-0.md:146`).

---

## 5. Errores técnicos verificados

| # | Afirmación (archivo:línea) | Por qué es falsa | Fuente / prueba |
|---|---|---|---|
| 1 | `docker run … alpine/git sh -c '…'` ejecuta un script (devops/modulo-1.md:56 y 13 más) | La imagen pasa los argumentos a `git`, así que se ejecuta `git sh -c` | Docker Hub `alpine/git`: «docker run … alpine/git <git_command>»; prueba local: «git: 'sh' is not a git command» |
| 2 | `RUN npm ci` construye la etapa (devops/modulo-2.md:69, :155) | `npm ci` exige `package-lock.json`, y la lección no lo crea | Ejecutado con npm 10.9.9: «can only install with an existing package-lock.json» |
| 3 | `COPY --from=otra-etapa` da «error de etapa no encontrada» (devops/modulo-2.md:85) | BuildKit interpreta el nombre como imagen e intenta descargarla | Ejecutado con Docker 29: «failed to resolve source metadata for docker.io/library/otra-etapa:latest» |
| 4 | `curl -s '…query=rate(http_requests_total[1m])'` devuelve JSON (devops/modulo-9.md:150, :394) | curl interpreta `[...]` y `{...}` como globbing | Ejecutado: «curl: (3) bad range in URL position 64» |
| 5 | El escaneo lista CVE de `lodash@4.17.15` (devops/modulo-11.md:81) | lodash nunca se instala; en una imagen, Trivy busca `package.json` dentro de `node_modules` | trivy.dev, cobertura Node.js: «Trivy searches for `package.json` files under `node_modules` and identifies installed packages» |
| 6 | «kind no [aplica NetworkPolicy] por defecto» (devops/modulo-7.md:653) | kindnet implementa NetworkPolicy desde kind 0.24.0 (agosto de 2024) | kindnet.sigs.k8s.io, Network Policies: «implements Kubernetes Network Policies»; changelog de kind 0.24.0: «implement network policies» |
| 7 | `jenkins/jenkins:lts-jdk17` es una LTS actual (devops/modulo-16.md:362) | Las imágenes Java 17 se retiraron con 2.555.1 | jenkins.io, guía de actualización a 2.555: «With the release of Jenkins 2.555.1, the Java 17 images have been retired.» |
| 8 | `node:20-alpine` como versión a la que «actualizar» (devops/modulo-6.md:71; modulo-7.md:617; modulo-0.md:790) | Node 20 llegó a EOL el 30-04-2026 | endoflife.date/nodejs: Node 20, «30 Apr 2026» |
| 9 | `aquasecurity/trivy-action@0.28.0` como paso de seguridad (devops/modulo-4.md:401; modulo-13.md:65) | Las etiquetas de trivy-action fueron reescritas a commits maliciosos el 19-03-2026 (76 de 77; solo v0.35.0 quedó a salvo). Una etiqueta no garantiza el código | Aqua Security, «Trivy supply chain attack»: «Pin GitHub Actions to full, immutable commit SHA hashes — not mutable version tags.» |
| 10 | Con `slo = 1.0` sale «presupuesto de error agotado» (devops/modulo-14.md:70) | Antes de llegar al `if`, la línea del `print` divide entre 0 | Ejecutado: `ZeroDivisionError: float division by zero` |
| 11 | El validador comprueba la etiqueta por commit (devops/modulo-13.md:99) | Imprime `True` sin comprobar nada | Ejecutado con `latest` en lugar de `github.sha`: sigue imprimiendo `True` |
| 12 | `with: { … username: ${{ github.actor }} … }` (devops/modulo-4.md:392) | `{` no puede ir dentro de un escalar plano en un mapa de flujo | PyYAML: «expected ',' or '}', but got '{'» |
| 13 | `./gradlew commonTest` ejecuta los tests comunes (KMP, 17 apariciones) | `commonTest` es un *source set*; la tarea documentada es `allTests` | kotlinlang.org, «Run tests»: «if you run the `allTests` Gradle task, every test in your project will be run»; «The `commonTest` source set stores all common tests.» |
| 14 | `lipo -create` de `iosArm64` + `iosSimulatorArm64` da un binario universal (kotlin-multiplatform/modulo-13.md:34–39) | Ambos son arm64; un fat Mach-O admite un solo slice por arquitectura | kotlinlang.org, «Build native binaries»: el fat framework es para arquitecturas distintas («32-bit and 64-bit»), y para `iosArm64` + `iosSimulatorArm64` el ejemplo usa XCFramework; Carthage issue #3349 (error «have the same architectures (arm64)») |
| 15 | Swift Export: `func task(id:) async -> TaskResult` y `await taskClient.task(…)` (kotlin-multiplatform/modulo-13.md:121, :132) | Las funciones suspend se exportan como async que lanza: el ejemplo oficial usa `try await` | kotlinlang.org, «Swift export»: `let msg = try await hello()`; estado «Alpha» (la lección acierta en el estado) |
| 16 | `commonTest` garantiza la validez «para ambas plataformas» (kotlin-multiplatform/modulo-11.md:21) | Los tests comunes se compilan y ejecutan por target; Tier 3 (`iosX64`) ni siquiera se prueba en CI | kotlinlang.org, «Native target support», Tier 3: «not guaranteed to be tested on CI» |

Afirmaciones dudosas que **resultaron correctas**: Kotlin 2.4.21 existe (kotlinlang.org, «Releases»: «2.4.21 · October 8, 2026»); Compose Multiplatform es estable en iOS desde 1.8.0 (kotlin-multiplatform/modulo-7.md:478); Swift Export está en Alpha (modulo-13.md:99); los comandos de la CLI de Floci (`floci start`, `floci env`, `floci doctor`, puerto 4566, MIT) son correctos según floci.io.

---

## 6. Plan de corrección priorizado (5 pasos)

1. **Desbloquear la ejecución (2–3 días).** Bloqueantes 1–4, 6 y 7: `--entrypoint sh` en 14 bloques, lockfile npm, paso 0 Gradle en KMP 0/2, XCFramework en KMP 13, `allTests` en 17 sitios, YAML válido en DevOps 4 y KMP 10, `curl --data-urlencode` en DevOps 9.
2. **Ejecución automática de bloques (3–5 días).** Ampliar `scripts/validate.sh` con un extractor que ejecute en contenedor los bloques marcados `bash`/`js`/`python`, que pase `actionlint` a todo YAML con `jobs:`, `yamllint` y `hclfmt` (o `tofu fmt -check`) a HCL, y que falle con resultados esperados no reproducidos. Sin esto, cualquier corrección se volverá a romper.
3. **Soluciones y fallos reproducibles (5–8 días).** Una solución plegada con su idea de resolución por práctica independiente (205 temas). Revisar cada «fallo deliberado» para que el error citado sea el real (DevOps 0, 2, 3, 14, 19).
4. **Integradores reales y progresión (4–6 días).** Rehacer DevOps 13 y KMP 11 como proyectos de 30–60 min con repositorio semilla y verificación auténtica. Mover los «Cierre del track» al último módulo. Fusionar DevOps 15 con 3/7/12. Decidir si 19–21 pertenecen a otro curso. Unificar un solo proyecto acumulativo por curso. Corregir las duraciones del track.
5. **Versiones, tono y glosario (2–3 días).** Una tabla de versiones por curso (Kotlin 2.4.21, Gradle 9.8, JDK, Ktor, Node 24, `jenkins:lts-jdk21`, acciones fijadas por SHA); quitar `node:20`; voseo → tuteo en 11 módulos; glosario por curso (digest, upstream, SLO, modulemap, fat binary, toolchain…) con una comprobación en `validate.sh`.

Esfuerzo total estimado: 16–25 días-persona.

---

## 7. Muestra ejecutada (en `/tmp/aud`)

| Bloque | Resultado |
|---|---|
| devops/modulo-0, T1 (permisos, con `ubuntu:24.04` en lugar de `alpine`) | Funciona; el fallo deliberado no ocurre (rc=0) |
| devops/modulo-0, T4 (`preparar.sh`) | Funciona; el fallo `unbound variable` se reproduce; el log crece (no es idempotente) |
| devops/modulo-1, T3 (bisect) | La lógica funciona con git del host; el envoltorio `alpine/git sh -c` falla |
| devops/modulo-2, T1 (`npm ci`) | Falla (EUSAGE) |
| devops/modulo-2, T1 (`COPY --from` inexistente) | Mensaje distinto del documentado |
| devops/modulo-3, T1 (`compose.yaml`) | `docker compose config -q` OK |
| devops/modulo-4, T5 (YAML) | Error de parseo |
| devops/modulo-9, T1 (prom-client) | Funciona; salida coherente con lo descrito |
| devops/modulo-9, T2 (curl PromQL) | `curl: (3) bad range` |
| devops/modulo-10, T1 (logs JSON) | Funciona |
| devops/modulo-13, T1 (validador) | Pasa incluso con `latest` (verificación falsa) |
| devops/modulo-14, T1 (`sli.py`) | OK con 0.999; `ZeroDivisionError` con 1.0 |
| devops/modulo-19, T3 (agregado + tests) | 2/2 OK; el fallo deliberado no falla |
| KMP modulo-0, T1 y T3 (Kotlin, vía Gradle 8.14.3 / Kotlin 2.0.21 embebido) | Salidas idénticas a las esperadas |
| KMP modulo-4, T5 (`Oferta`) | «Antes, límite y después: correctos» |

Cobertura: 17 bloques en 12 de 37 módulos (DevOps 0, 1, 2, 3, 4, 9, 10, 13, 14, 19; KMP 0, 4), por encima del mínimo de uno por cada 3 módulos.

---

## 8. Qué no pude auditar y por qué

- **Ningún build Gradle KMP real** (Ktor, SQLDelight, Compose, Koin, kotlinx-benchmark): sin acceso a Maven Central ni al Gradle Plugin Portal. La afirmación sobre `INTEGER AS Boolean` + `Tarea.Adapter(completadaAdapter=…)` (kotlin-multiplatform/modulo-6.md:51, :85) queda **sin verificar**: la documentación de tipos de SQLDelight 2.1 no aclara si Boolean necesita adaptador.
- **Nada de iOS/Xcode/Swift/lipo**: no hay macOS. El error de `lipo` se verificó con la documentación y con issues públicos, no ejecutándolo.
- **Kubernetes, Helm, Terraform/OpenTofu, Ansible, Pulumi, Jenkins, Newman, Floci, AWS CLI**: no están instalados y no hay acceso a registros de imágenes (solo `ubuntu:24.04` local). No ejecuté ningún bloque de los módulos DevOps 5–8, 11, 12, 15–18, 20–22.
- **GitHub Actions real**: solo parseo YAML; no hay `actionlint` ni runner.
- **Profundidad**: DevOps 17, 21 y KMP 1, 5, 6, 7 se leyeron por encima (un tema parcial cada uno); su nota es provisional y se apoya sobre todo en la medición mecánica.
- **Renderizado en la app Angular** (`anatomy`, Mermaid, plegado de soluciones): no levanté `npm start`.
