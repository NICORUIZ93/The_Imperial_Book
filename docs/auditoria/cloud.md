# Auditoría editorial y pedagógica — curso `cloud` («Cloud Local — AWS, Azure y GCP»)

- **Fecha:** 2026-11-18
- **Alcance:** `web/public/content/cloud/modulo-0.md` … `modulo-34.md` (35 módulos, 168 temas, 14 048 líneas) y la constante `COURSE_MODULES` de `web/src/app/course-data.ts`.
- **Rúbrica:** `docs/auditoria/PROMPT-AUDITORIA.md` (A1–F3 y Parte 2).
- **Método:** lectura completa de los módulos 0 y 1. En los módulos 2–34 se leyó completo al menos un tema por módulo (rotando entre el primero, el del medio y el último) y se ojeó el resto con búsquedas dirigidas. Se ejecutaron en `/tmp/audit-cloud` 14 bloques de código: 11 programas Python, 2 JS y el servidor `server.mjs`. Los hechos dudosos se contrastaron con la documentación oficial de AWS, la de Floci (floci.io, floci-cli) y el paquete `testcontainers-floci` 0.4.0 de PyPI.
- **Medición mecánica de partida** (`python3 scripts/audit_plantilla.py --curso cloud`): «cloud 168 temas, cumplen 11; faltas más frecuentes: analisis 152, ejercicios_con_solucion 119, errores_comunes 3».

---

## 1. Veredicto ejecutivo

**No.** El curso no permite que «cualquier persona aprenda fácil». Solo 11 de 168 temas cumplen la plantilla.

El Módulo 0 obliga a usar un `docker-compose.yml` que el propio repositorio eliminó (`specs/011-limpieza-total.md:18`). En unos 23 temas, el paso «Hazlo tú» es un bloque genérico pegado: `floci up` + `sts get-caller-identity` + «Resultado esperado: Node disponible». Ese bloque no tiene relación con el tema, y `floci up` no existe en floci-cli.

Hay errores técnicos verificables: el PKCE de M18 no funciona, M8 usa puertos de Azure y GCP equivocados, M31 importa un paquete Python con un nombre que no existe, M5 enseña un runtime Lambda ya deprecado y M33 propone App Mesh, que ya fue discontinuado.

Los temas añadidos más tarde («· Avanzado · 45 min») sí tienen calidad aceptable. Sus 8 scripts Python independientes reproducen exactamente la salida documentada. Esto demuestra que el estándar es alcanzable, pero hoy cubre menos del 10 % del curso.

---

## 2. Puntuación A1–F3

| Criterio | Nota | Evidencia (archivo:línea + cita) |
|---|---|---|
| **A1** Ejemplo antes que teoría | 1 | Lo habitual es teoría larga en el Paso 3 y un Paso 4 vacío. `modulo-15.md:12-64`: cinco párrafos sobre CloudFormation y luego «Crea `main.tf`… `terraform --version` … Resultado esperado: Terraform disponible.». Esto contradice `METODOLOGIA-DE-APRENDIZAJE.md`: «en los primeros dos minutos se ejecuta o modifica algo». Excepción positiva: `modulo-0.md:145-187` (servidor HTTP ejecutable antes de explicar 200/404). |
| **A2** Analogías correctas | 2 | La mayoría son útiles (`modulo-1.md:25` oficina en edificio = kernel compartido). Hay una de riesgo: `modulo-0.md:472` «La analogía falla en que las sucursales en la nube se sincronizan en milisegundos». Esto induce a creer que las AZ replican datos por sí solas; la replicación depende de cada servicio, y la misma lección lo admite en `:474` («una base de datos de una sola instancia vive en una sola zona»). |
| **A3** Errores comunes reales | 2 | Los laboratorios tienen mensajes reales con su solución (`modulo-1.md:376-379`, `modulo-5.md:957-960`). En los temas, la sección es una línea de relleno: `modulo-2.md:98` «Errores comunes: confundir key y ruta local.»; `modulo-1.md:75` «Errores comunes: confundir aislamiento con seguridad total y olvidar límites.». |
| **A4** Ejercicios progresivos con solución | 1 | 119/168 temas no tienen ejercicio con solución (medición mecánica). Solo `modulo-4.md` usa `<details>` («SOLUCIÓN — Lee solo después de intentar», `:130`, `:242`, `:601`). Los ejercicios típicos son una pista sin solución: `modulo-1.md:280` «Pista: usa un volumen inexistente para provocar un fallo deliberado y corrígelo.». |
| **A5** Proyecto integrador 30–60 min | 1 | M9 es un pliego de requisitos de 6 h (`course-data.ts`: «9 Experto 6 h») sin solución de referencia (`modulo-9.md:315-343`). M5 incluye un «Proyecto Integrador Final» a mitad del curso (`modulo-5.md:969`) cuya «Solución Esperada» es un esquema de 10 líneas (`:1001-1012`). Conviven dos proyectos con nombres distintos: «Cloud local multi-nube» (`modulo-1.md:61`) y «RutaFlow» (`modulo-0.md:541`). |
| **A6** Progresión coherente | 1 | Las etapas del mapa no son monótonas: `modulo-0.md:35-37` pone M8–9 «Experto» antes de M10 «Fundamentos». La instalación de Floci se enseña en M1 (`modulo-1.md:308`) y otra vez completa en M34 (`modulo-34.md:19`), mientras M0 ya ejecuta `eval "$(floci env)"` (`modulo-0.md:446`). `modulo-13.md:147` exige conocer «Flyway en Spring Boot (Módulo 3 de ese track) y… Room en Android». |
| **B1** Plantilla uniforme | 1 | Conviven tres plantillas: Pasos 1–7 de párrafo único (M1–M30), Pasos 1–7 extendidos con «Explicación por bloques» y checklist (temas «· Avanzado · 45 min») y M34 con «Qué construirás… / Criterio para avanzar». Faltan en casi todos los temas: análisis paso a paso (152/168) y ejercicios con solución (119/168). M32 y M33 añaden secciones ajenas al lector («Atlas completo de temas oficiales», `modulo-32.md:574`; «Trazabilidad de la auditoría original», `modulo-33.md:535`). |
| **B2** Lecciones solo texto o código sin explicar | 1 | Los cinco temas de M1 son solo teoría: su único código es `mkdir ejemplo-… ; docker --version` (`modulo-1.md:65-68, 116-119, 163-166, 216-219, 274-277`). Los tres temas de M15 están igual (`modulo-15.md:58-64` y equivalentes). `modulo-28.md:27-35` es un «programa» que solo imprime dos cadenas. |
| **B3** Objetivos y resumen | 2 | «Al finalizar podrás…» aparece en todos los temas (`modulo-1.md:9`). El resumen suele ser una frase de entrega: `modulo-1.md:126` «Entrega Dockerfile, salida, fallo y corrección; explica el resultado.». Solo los temas nuevos tienen checklist (`modulo-0.md:534-537`). |
| **B4** Módulo 0 de entorno | 1 | Existe, pero sus Temas 4–6 dependen de un `docker-compose.yml` inexistente (`modulo-0.md:291`, `:337`). El laboratorio de instalación está al final (`:559`), después de temas que ya exigen Docker, AWS CLI (`:423`) y floci (`:446`). |
| **C1** Código completo y ejecutable | 1 | Hay `floci up` en 23 bloques (p. ej. `modulo-7.md:241`), un comando que floci-cli no tiene. `modulo-12.md:20` usa `"timestamp":...` (JSON inválido). `modulo-12.md:27-29` llama a `logging.info` sin `import logging` (NameError verificado). `modulo-8.md:269` deja `"<cadena-de-conexion-local>"` sin dar el valor. Lo positivo: los 8 scripts Python de los temas nuevos reprodujeron su salida esperada carácter por carácter. |
| **C2** Cumple ESTANDAR-DE-CODIGO | 2 | Los scripts nuevos usan nombres con intención y unidades (`AVISO_DIAS = 180`). Violaciones: `modulo-5.md:858-859` usa `json.load(open("calendario.json"))` sin `with` ni `encoding`. `modulo-16.md:249` muta el estado global `fallos_simulados`. `modulo-5.md:872` ordena con `or 9`, lo que manda «DESCONOCIDO» al final aunque `:899` dice «Trata “desconocido” como urgente» (regla duplicada y contradictoria). |
| **C3** APIs/versiones obsoletas | 1 | `nodejs20.x` en `modulo-5.md:38,152,324,942`, `modulo-9.md:398` y `modulo-14.md:160`: AWS lo deprecó el 30-abr-2026. `modulo-0.md:573` «cualquier versión 3.9 o superior sirve» (Python 3.9 sin soporte desde oct-2025). `modulo-0.md:575` «`v20.x.x` o superior». `modulo-33.md:147` App Mesh, discontinuado el 30-sep-2026. `modulo-1.md:104` `FROM node:20`. |
| **C4** Soluciones documentadas | 1 | Igual que A4. M9, el proyecto final, no tiene solución de referencia. |
| **D1** Segunda persona consistente | 1 | El tuteo se mezcla con el voseo en 34 de 35 módulos (unas 270 formas): `modulo-3.md:126` «guardá… dejá pasar… usá… diagnosticalo»; `modulo-1.md:370` «Verificá… si corrés»; `modulo-26.md` «stream que vos consumís». Eso convive con «Crea…», «Ejecuta…» en el mismo tema. |
| **D2** Jerga sin explicar | 1 | Encabezados en inglés: `modulo-2.md:20,48,51` «**Diagnosis:**», «**Learning:**», «**Trade-off en RutaFlow:**». `modulo-16.md:84` «está siendo throttled». `template.yaml`/SAM aparece 42 veces desde M2 y SAM solo se nombra una vez sin definirse (`modulo-6.md:229`). El atlas de M32 está en inglés («`quorum` · `chaos` · `posture`»). El glosario (`modulo-9.md:427`) tiene 28 términos. |
| **D3** Conocimiento previo no enseñado | 1 | `modulo-13.md:147` (Flyway/Room de otros tracks). `modulo-5.md:991` «Debe loguear en CloudWatch» (CloudWatch es M12). `modulo-0.md:446` `eval "$(floci env)"` antes de instalar floci (M1). `modulo-3.md` Tema 2 usa `$QUEUE_URL` tras «`mkdir ejemplo && cd ejemplo && floci start`», con la variable definida en otro tema. |
| **E1** Qué detecta validate.sh | 1 | Detecta paridad de módulos, índice, catálogo, laboratorios citados y specs (`scripts/validate.sh`). Pasa en verde («validate.sh: ok») con un compose inexistente referenciado, 23 `floci up`, código Python con NameError y voseo masivo. |
| **E2** Valida ejecución, plantilla o jerga | 0 | No ejecuta bloques, no valida la plantilla (`audit_plantilla.py` existe pero `validate.sh` no lo llama), no revisa jerga, glosario ni enlaces externos. |
| **E3** Flujo de revisión documentado | 0 | `grep -i "revisor\|flujo de revisión"` en `docs/`, `specs/`, `README.md` y `CLAUDE.md` no devuelve nada. |
| **F1** Riesgo de 1432 temas sin revisión | 0 | En este curso, el 93 % de los temas incumple la plantilla y hay al menos 9 errores técnicos verificados (§6) que pasan la validación. El riesgo es alto: errores silenciosos (PKCE, puertos, runtime) que un principiante no puede diagnosticar. |
| **F2** Ruta priorizada | 1 | M0 define 4 etapas (`modulo-0.md:14-23`), pero se publican los 35 módulos a la vez y las etapas se intercalan (`:35-60`). No hay subconjunto «core». |
| **F3** Glosario y apéndices | 1 | Hay apéndices solo en M9: referencia rápida (`modulo-9.md:345`), glosario de 28 términos (`:427`) y bibliografía (`:460`). Llegan tarde (M9) y no cubren los términos de M10–M34 (KMS, SBOM, landing zone, RPO/RTO, PKCE…). |

---

## 3. Tabla por módulo

| Mód. | Temas | Nota | Defecto principal (cita) | Corrección concreta |
|---|---|---|---|---|
| 0 | 8 | 1 | `:291` «inicia solo el servicio AWS que ya está definido en `docker-compose.yml`»: ese archivo se retiró (`specs/011:18`). Además, `:297` «Floci ofrece una herramienta llamada LocalStack» es falso. | Sustituir el compose por `floci start` / `floci az start` / `floci gcp start` o incluir el compose completo en la lección. Reescribir la frase: LocalStack es otro emulador, no una herramienta de Floci. Mover el laboratorio de instalación (`:559`) antes del Tema 4. |
| 1 | 5 | 1 | Los cinco Paso 4 son `mkdir …; docker --version` con «Resultado esperado: Docker disponible.» (`:69`). | Escribir para cada tema un Dockerfile, un `docker run`, una inspección de capas y un compose completos con su salida esperada. Corregir «virtina» (`:23`). |
| 2 | 5 | 1 | `:52` «ejecutar `floci init` antes de `floci start`»: `init` no existe en floci-cli. El Tema 1 tiene un Paso 4 vacío (`:86-92`). | Eliminar `floci init`. Convertir el Tema 1 en `mb` / `cp` / `ls` / `cp` de vuelta con salida esperada. Traducir «Diagnosis/Learning». |
| 3 | 4 | 2 | `:126` afirma que borrar con el `ReceiptHandle` viejo «provoca un error». AWS: «If you use an old ReceiptHandle, the request will succeed, but the message might not be deleted». | Reescribir el fallo deliberado: el `delete` responde OK pero el mensaje reaparece. Pedir al estudiante que lo compruebe con `receive-message`. |
| 4 | 6 | 2 | Es el módulo más completo (3 soluciones en `<details>`), pero 6/6 temas carecen de análisis paso a paso. | Añadir «Explicación por bloques» a cada demostración. |
| 5 | 7 | 2 | Enseña `--runtime nodejs20.x` (`:38,152,324,942`) cuando su propio Tema 7 (`:814`) lo marca vencido el 2026-04-30. El proyecto de `:1004` usa «HASH: estado (ej. "en_ruta")», una clave de baja cardinalidad que crea partición caliente. | Cambiar a `nodejs22.x` o `nodejs24.x`. En el proyecto, explicar el sharding de escritura o usar un contador mantenido por Streams. Corregir el `or 9` (`:872`). |
| 6 | 5 | 2 | `:229` «el `AWS::Lambda::Permission` implícito que SAM genera…»: SAM no se enseña en ningún módulo. | Añadir un tema de SAM (`template.yaml`, `sam build/deploy`) antes de M6 o quitar las referencias. |
| 7 | 5 | 1 | Tema 4, Paso 4 (`:236-246`): «Crea `src/policy.json`… `floci up` … Resultado esperado: Node disponible.» en un tema sobre políticas IAM. | Sustituirlo por `create-policy` + `simulate-principal-policy` con Allow y Deny solapados (el ejemplo de `:212-227`). |
| 8 | 3 | 1 | Lab `:265` `docker run -p 10000:10000 …floci/floci-az` y `:275` `-p 4443:4443 -p 8085:8085`: Floci Azure usa 4577 y Floci GCP 4588. `:288` recomienda `STORAGE_EMULATOR_HOST` para `gcloud`, pero Floci documenta que gcloud ignora esas variables. | Usar `floci az start` / `floci gcp start` con la cadena de conexión oficial (`…BlobEndpoint=http://localhost:4577/devstoreaccount1…`) y `CLOUDSDK_API_ENDPOINT_OVERRIDES_STORAGE`. |
| 9 | 5 | 1 | El proyecto final no tiene solución de referencia y su diseño se contradice: clave `id` HASH simple (`:47-49`) y a la vez «listar tareas… usa `query` (nunca `scan`)». El Tema 5 es el bloque genérico (`:296-307`). | Añadir un GSI (p. ej. `estado`+`fecha_creacion`) o admitir el Scan paginado. Publicar una solución de referencia en `examples/`. Partir el proyecto en hitos de 30–60 min. |
| 10 | 3 | 2 | El fallo deliberado del Tema 1 depende de algo que no ocurrió: «corré `git log --all --oneline -- .env` (si llegaste a commitearlo alguna vez)». | Hacer explícito `git init && git add .env && git commit` antes de mostrar la fuga. |
| 11 | 3 | 2 | Tema 1 (`:6-60`): SNS→SQS sin política de cola. En AWS real el mensaje no llega, y tampoco se menciona el sobre SNS (`RawMessageDelivery`). | Añadir `set-queue-attributes` con la política y la salida real envuelta. |
| 12 | 3 | 1 | `:20` `"timestamp":...` (JSON inválido). `:27-29` `logging.info` sin import: verificado `NameError: name 'logging' is not defined`, y aun importado no imprimiría al nivel WARNING por defecto. | Dar un timestamp real (`$(date +%s000)`) y un script con `import logging; logging.basicConfig(level=logging.INFO)`. |
| 13 | 3 | 2 | `:147` remite a «Flyway en Spring Boot (Módulo 3 de ese track) y… Room en Android». El SQL de ejemplo crea `tareas` mientras el tema habla de `facturas`. | Eliminar dependencias cruzadas entre cursos y unificar la tabla. |
| 14 | 4 | 2 | `:257` `docker push "$IMAGEN:1.4.0"`: `$IMAGEN` solo existe dentro del script hijo, así que el comando falla de otra forma que la documentada. | Exportar `IMAGEN` o escribir la URI completa. |
| 15 | 3 | **0** | El módulo se titula «CloudFormation», pero los tres Paso 4 son «Crea `main.tf`… `terraform --version`… Resultado esperado: Terraform disponible.» (`:58-64`). | Reescribirlo con `cloudformation deploy`, `create-change-set`, `describe-change-set` y `detect-stack-drift`, con salidas. |
| 16 | 4 | 2 | `:288` «los archivos 5 y 6… que ya estaban hechos se saltan»: `guias-06` falló y no estaba hecho (verificado al ejecutar). | Corregir: solo `guias-05` se salta. |
| 17 | 3 | 2 | La demostración es correcta. El fallo deliberado `LATEST` no muestra salida esperada. | Añadir la salida vacía esperada de `get-records`. |
| 18 | 3 | 1 | `:185-186`: el verificador sale con 39–42 caracteres (RFC 7636 exige 43–128) y el challenge se calcula con `base64 \| tr -d '=+/'` en lugar de base64url. Verificado: 4 de 5 ejecuciones no coinciden con `BASE64URL(SHA256(v))`. `:187` usa `https://localhost:4566` (Floci es http). | `CODE_VERIFIER=$(openssl rand -base64 48 \| tr '+/' '-_' \| tr -d '=')` y challenge con `tr '+/' '-_' \| tr -d '='`. Usar http. |
| 19 | 3 | 2 | Tema 2: `start-crawler` seguido de inmediato por `get-table`. El crawler es asíncrono y la tabla aún no existe. | Añadir un bucle de espera hasta que `get-crawler` devuelva `READY`. |
| 20 | 4 | 2 | Tema 4 bien construido (salida verificada). Temas 1–3 con Paso 4 de 8–11 líneas sin análisis. | Añadir «Explicación por bloques» y ejercicios con solución. |
| 21 | 6 | 1 | Temas 1 y 4: bloque genérico con «Resultado esperado: Node disponible.» (`:76`, `:196`). | Demostración real con `run-instances` y `describe-instances`, y Auto Scaling con salida. |
| 22 | 6 | 2 | Tema 6 (WAF) correcto. Temas 1 y 4 con el bloque genérico `floci up` (`:64`, `:191`). | Sustituir los bloques genéricos. |
| 23 | 4 | 2 | Temas 1 y 3 con `floci up` (`:65`, `:167`). | Igual que M22. |
| 24 | 5 | 1 | Tema 2 «buildspec.yml»: «Crea `buildspec.yml`…» sin contenido y luego «Resultado esperado: Node disponible.» (`:120`). | Incluir el `buildspec.yml` completo y `start-build` / `batch-get-builds`. |
| 25 | 6 | 2 | Tema 1 admite que Floci devuelve siempre `INSUFFICIENT_DATA`. Sirve como límite, pero el tema no enseña a evaluar cumplimiento. | Añadir una regla personalizada local o el resultado en AWS real como referencia. |
| 26 | 4 | 2 | Voseo constante («stream que vos consumís»). Sin ejercicios con solución en 3/4 temas. | Unificar el tuteo y añadir soluciones. |
| 27 | 4 | 1 | Tema 1 AppSync: «Crea `src/schema.graphql`…» sin esquema, con «Resultado esperado: Node disponible.» (`:61`). | Incluir el esquema, `create-graphql-api` y una consulta con salida. |
| 28 | 5 | 2 | Tema 5 (series temporales, `:262`) dentro de un módulo de Neptune/OpenSearch. `:27-35` es un «laboratorio» que solo hace `print` de dos cadenas. | Mover el Tema 5 a un módulo de datos. Reemplazar el `print` por una consulta Gremlin real. |
| 29 | 5 | 2 | Tema 2: «confirmar la tarifa real de `t3.micro`» con una «instantánea… intencionalmente mínima» de Floci. Las dos ideas se contradicen. | Decir que la tarifa es de referencia y no la real vigente. |
| 30 | 4 | 2 | Tema 4 documenta bien los límites («plano de datos pendiente»). Sin ejercicios con solución. | Añadir soluciones. |
| 31 | 6 | 1 | `:367` `from testcontainers_floci import FlociContainer`: el paquete `testcontainers-floci` 0.4.0 se importa como `floci` (verificado: `ModuleNotFoundError: No module named 'testcontainers_floci'`). Tiene 2 bloques genéricos (`:207`, `:424`). | Usar `from floci import FlociContainer` y fijar la versión (`testcontainers-floci==0.4.0`). |
| 32 | 6 | 2 | El laboratorio (`:562-571`) es una lista de 6 encargos de alcance enorme sin comandos («Ejecuta un experimento… con hipótesis y abort condition»). Incluye un atlas en inglés. | Dividirlo en laboratorios guiados con comandos y criterios. Traducir o quitar el atlas. |
| 33 | 7 | 1 | `:147` propone «instalar App Mesh», discontinuado el 30-sep-2026. El Tema 3 junta «EC2, VPC, RDS, S3 y DynamoDB avanzados» (viola la regla de ≤3 conceptos nuevos). `:535` deja metadatos internos («Trazabilidad de la auditoría original»). | Cambiar App Mesh por ECS Service Connect o Istio/EKS. Partir el Tema 3. Borrar la sección de trazabilidad. |
| 34 | 11 | 1 | Instala Floci desde cero (Tema 1) en el último módulo, cuando el curso lo necesita desde M0–M1. Tiene 5 Paso 4 «Resultado esperado: Docker disponible.» (`:51`, `:147`, `:281`, `:684`) y uno con «Node disponible.» (`:747`). | Fusionar el Tema 1 con M0/M1 y convertir M34 en referencia o apéndice. Sustituir los Paso 4 vacíos. |

---

## 4. Defectos bloqueantes (impiden publicar), por gravedad

1. **El Módulo 0 depende de un archivo eliminado.** En `modulo-0.md:291-295, 309-312, 337-339, 349, 363, 378`, y en `modulo-1.md:322, 341-344`, la lección dice «inicia solo el servicio AWS que ya está definido en `docker-compose.yml`», pero `specs/011-limpieza-total.md:18,36` lo retiró (`test ! -e docker-compose.yml`). El enlace `:363` a `NICORUIZ93/The_Imperial_Book/blob/main/docker-compose.yml` apunta a un archivo que ya no existe. Ningún principiante pasa del Tema 4.
   **Corrección:** usar `floci start` (AWS 4566), `floci az start` (4577) y `floci gcp start` (4588), o incrustar un compose completo en la lección y validarlo.
2. **Un Paso 4 genérico pegado en unos 23 temas** (`grep -n "floci up"`: M6:58, M7:241, M8:63/134/240, M9:302, M12:167, M13:192, M18:193, M21:71/191, M22:64/191, M23:65/167, M24:115, M27:56, M28:65, M31:207/424, M32:211, M34:190/507/587/742), siempre con este patrón: «`floci up` / `aws … sts get-caller-identity` / Confirma la respuesta… / Resultado esperado: Node disponible.». El comando `floci up` no existe: el README de floci-cli documenta `start, stop, restart, status, logs, wait, version, services, doctor, env, snapshot, config, update, completion`.
   **Corrección:** quitar el bloque y escribir una demostración propia del tema.
3. **Paso 4 vacío en todos los temas de M1 (Docker) y M15 (CloudFormation)**, y en M2 T1, M34 (5 temas), M21, M24, M27. Los dos módulos troncales no tienen ninguna demostración ejecutable en sus temas.
   **Corrección:** reescribirlos con código completo y salida esperada.
4. **PKCE incorrecto** (`modulo-18.md:185-186`). Es un error de seguridad que el estudiante copiará.
   **Corrección:** ver la tabla de M18.
5. **Puertos y configuración de Azure/GCP equivocados** (`modulo-8.md:265, 275, 288`). El laboratorio entero falla.
   **Corrección:** ver la tabla de M8.
6. **No hay soluciones** en 119/168 temas, ni solución de referencia para el proyecto final M9. Esto incumple la Parte 2 («Ejercicios… + soluciones con ideas de resolución»).

## 5. Defectos mayores (degradan el aprendizaje)

1. **Runtime deprecado como camino principal:** `modulo-5.md:38,152,324,942`, `modulo-9.md:398`, `modulo-14.md:160` (`nodejs20.x`). **Corrección:** `nodejs22.x`/`nodejs24.x`, y declarar la fecha de revisión.
2. **Versiones mínimas obsoletas en M0:** `modulo-0.md:573` «cualquier versión 3.9 o superior sirve», `:575` «`v20.x.x` o superior», `:568` «Docker version 27.x.x». **Corrección:** Python ≥3.12 y Node 22/24 LTS. Evitar números de versión de ejemplo que envejecen.
3. **Afirmación falsa sobre LocalStack:** `modulo-0.md:297` «Floci ofrece una herramienta llamada LocalStack». **Corrección:** «LocalStack es otro emulador; Floci acepta sus variables y tiene guía de migración».
4. **Promesas incumplidas en M0:** `modulo-0.md:400` «Cada uno de los diez módulos sigue el mismo ciclo… La **evaluación**…». Son 35 módulos y ninguno tiene una sección «Evaluación». `:421` «el laboratorio del Módulo 1 empieza con esta comprobación» (`sts get-caller-identity`) no ocurre en M1. `:585` «`aws configure --profile floci`, que verás en detalle en el Módulo 1» tampoco aparece en M1. **Corrección:** alinear el texto con el contenido real.
5. **Orden interno de M0 roto:** el Tema 8 dice en `:539` «**Siguiente paso:** el tema «Qué vas a aprender y cómo está estructurado»», que es el Tema 3. El Tema 8 usa `eval "$(floci env)"` (`:446`) antes de instalar floci. **Corrección:** colocar el Tema 8 después del laboratorio de instalación y corregir el enlace.
6. **El tema de errores SQS enseña un comportamiento falso** (`modulo-3.md:126`), contrario a la API `DeleteMessage`.
7. **App Mesh discontinuado** (`modulo-33.md:147`).
8. **Importación inexistente** (`modulo-31.md:367`).
9. **SAM / `template.yaml` usado sin enseñarse** (42 referencias; la única mención de SAM está en `modulo-6.md:229`). **Corrección:** crear un tema de SAM o eliminar las referencias.
10. **Voseo mezclado con tuteo** en 34/35 módulos (p. ej. `modulo-3.md:126`, `modulo-9.md:122-124`, `modulo-33.md:86`). **Corrección:** normalizar al tuteo (el registro de M0) con un script de reemplazo revisado.
11. **El proyecto de M5 propone una partición caliente** (`modulo-5.md:1004`), contra la guía de DynamoDB de usar claves de alta cardinalidad.
12. **El diseño de M9 se contradice** (clave `id` simple + «listar… usa `query` (nunca `scan`)»).
13. **Dependencia de otros cursos:** `modulo-13.md:147`.
14. **Código fragmentario:** `modulo-12.md:20,27-29`; `modulo-14.md:257`; `modulo-8.md:269` (`<cadena-de-conexion-local>` sin valor); `modulo-3.md` Tema 2 (`$QUEUE_URL` de otro tema).
15. **Sobrecarga de conceptos en M33** (Tema 3: cinco servicios «avanzados» en un tema; Tema 6: «Microservicios, Big Data, AI/ML y multi-cloud»). Viola la regla «Si introduce más de tres conceptos nuevos, se separa».
16. **El laboratorio de M32** (`:562-571`) no es ejecutable: es una lista de encargos.

## 6. Defectos menores

- `modulo-1.md:23` «máquina virtina» → «virtual».
- `modulo-2.md:20,48,51` encabezados en inglés («Diagnosis», «Learning», «Trade-off»).
- `modulo-0.md:406` y `modulo-1.md:109,157,205-209`: `\n` dentro de etiquetas Mermaid. Mermaid no lo interpreta como salto; usar `<br/>`.
- `modulo-0.md:127` cita como «Fuente oficial» del tema sobre la terminal la guía de AWS CLI, que no trata terminales.
- `modulo-5.md:858-859` y `modulo-32.md` `json.load(open(...))` sin `with` ni `encoding="utf-8"`.
- `modulo-5.md:872` el `or 9` ordena «DESCONOCIDO» al final, en contra de `:899`.
- `modulo-16.md:288` la explicación no coincide con la ejecución («archivos 5 y 6»).
- `modulo-2.md:416` el JS ESM en un `package.json` creado con `npm init -y` produce en Node 22 el aviso `MODULE_TYPELESS_PACKAGE_JSON` (verificado), que la lección no menciona. Añadir `"type": "module"` o usar `.mjs`.
- `modulo-10.md` Tema 1 usa `sk_live_…` como clave de ejemplo. Los escáneres de secretos la marcan; usar `demo_…`.
- `modulo-18.md:204` «un backend con secreto propio no lo necesitaría [PKCE] de la misma forma»: la práctica recomendada actual (OAuth 2.0 Security BCP, RFC 9700) aconseja PKCE también para clientes confidenciales.
- `modulo-33.md:535-558` y `modulo-32.md:574` (comentarios `<!-- OFFICIAL-TOPIC-ATLAS -->`) son metadatos editoriales visibles al lector.
- `course-data.ts` declara M0 con «'1 h'» y 5 temas, pero el Markdown tiene 8 temas y 588 líneas.

## 7. Errores técnicos verificados

| # | Afirmación (archivo:línea) | Por qué es falsa | Fuente / prueba |
|---|---|---|---|
| 1 | `modulo-3.md:126` «usá ESE handle viejo en un `delete-message`… provoca un error (`ReceiptHandle` inválido)» | La llamada tiene éxito y el mensaje puede no borrarse. | AWS SQS API `DeleteMessage`: «If you use an old ReceiptHandle, the request will succeed, but the message might not be deleted.» |
| 2 | `modulo-18.md:185-186` verificador `openssl rand -base64 32 \| tr -d '=+/'`; challenge `… \| base64 \| tr -d '=+/'` | El verificador sale con 39–42 caracteres (RFC 7636 §4.1 exige 43–128). El challenge debe ser base64url (sustituir `+/` por `-_`), no borrar caracteres. | Prueba local: 4/5 ejecuciones «DISTINTO» frente a `base64.urlsafe_b64encode(sha256(v))`; longitudes 39 y 42. |
| 3 | `modulo-8.md:265,275` puertos 10000–10002 (Azure) y 4443/8085/8080 (GCP) | Floci Azure escucha en 4577 (Blob, Queue y Table por ruta) y Floci GCP en 4588. | floci.io/az («Azure on localhost:4577», «does not use Azurite's 10000-10002»); floci.io/gcp («GCP on localhost:4588»). |
| 4 | `modulo-8.md:288` «configurar… `STORAGE_EMULATOR_HOST`… `PUBSUB_EMULATOR_HOST` antes de ejecutar… `gcloud`» | gcloud ignora las variables `*_EMULATOR_HOST`; hay que usar `CLOUDSDK_API_ENDPOINT_OVERRIDES_*`. | floci.io/gcp. |
| 5 | `floci up` (23 bloques) y `floci init` (`modulo-2.md:52`) | No son comandos de floci-cli. | README de `floci-io/floci-cli` (lista completa de comandos en §4.2). |
| 6 | `modulo-0.md:297` «Floci ofrece una herramienta llamada LocalStack» | LocalStack es un producto independiente. Floci solo ofrece una guía de migración desde LocalStack y traduce sus variables. | floci.io/floci/getting-started/installation («Migrate from LocalStack»). |
| 7 | `modulo-5.md:38` y otras: `--runtime nodejs20.x` como runtime actual | Deprecado el 30-abr-2026. Bloqueo de creación el 29-jul-2027. | docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html. |
| 8 | `modulo-33.md:147` «instalar App Mesh… sobre `demo-planificador-service`» | AWS discontinuó App Mesh el 30-sep-2026 (sin acceso a consola ni recursos). | docs.aws.amazon.com/app-mesh/latest/userguide/what-is-app-mesh.html. |
| 9 | `modulo-31.md:367` `from testcontainers_floci import FlociContainer` | El paquete `testcontainers-floci` 0.4.0 instala el módulo `floci` (`from floci import FlociContainer`). | Wheel descargado de PyPI: `ModuleNotFoundError: No module named 'testcontainers_floci'`; su METADATA usa `from floci import FlociContainer`. |
| 10 | `modulo-12.md:27-29` (fragmento Python) | `NameError: name 'logging' is not defined`. Además, `logging.info` no se imprime con la configuración por defecto (WARNING). | Ejecución en `/tmp/audit-cloud/r_m12_L27`. |
| 11 | `modulo-0.md:573` «cualquier versión 3.9 o superior sirve» | Python 3.9 llegó a fin de vida (oct-2025) y Lambda deprecó `python3.9` el 15-dic-2025 (tabla de runtimes de AWS). | Misma tabla AWS Lambda. |

**Código ejecutado que sí funciona** (salida idéntica a la documentada): `modulo-0.md:155` (server.mjs: 200/404 y conexión rechazada en 3001), `modulo-5.md:850`, `modulo-16.md:244` (incluida la segunda ejecución idempotente), `modulo-20.md:212`, `modulo-25.md:372`, `modulo-28.md:310`, `modulo-31.md:491`, `modulo-32.md:339`, `modulo-32.md:464` (sale con código 1), `modulo-33.md:458` y `modulo-2.md:416` (sintaxis correcta; falla solo por falta de Floci, `ECONNREFUSED 127.0.0.1:4566`, y lanza el aviso ESM).

## 8. Plan de corrección priorizado

| Paso | Acción | Esfuerzo |
|---|---|---|
| 1 | Desbloquear M0–M1: quitar la dependencia del compose, mover la instalación de floci-cli a M0, reescribir los 5 temas de M1 con demostraciones reales y corregir LocalStack y las promesas de M0. | 2–3 días |
| 2 | Eliminar los ~23 bloques `floci up`/«Node disponible» y los Paso 4 vacíos (M2, M15, M21, M24, M27, M34) con demostraciones propias. Reescribir M15 con CloudFormation real. | 5–7 días |
| 3 | Corregir los errores técnicos de §7 (PKCE, puertos de M8, SQS, runtime, App Mesh, import de M31, fragmentos de M12/M14). Fijar las versiones con fecha de revisión en un spec del curso. | 2 días |
| 4 | Añadir soluciones plegadas («ideas de resolución» + código) a los 119 temas sin ella y una solución de referencia del proyecto M9 en `examples/`, partida en hitos de 30–60 min. | 8–10 días |
| 5 | Normalizar al tuteo, traducir los encabezados en inglés, crear un glosario del curso (SAM, KMS, PKCE, RPO/RTO, SBOM, landing zone, throttling…) y ampliar `validate.sh`: invocar `audit_plantilla.py` con umbral, prohibir `floci up` y «Resultado esperado: … disponible.», y ejecutar los bloques Python/JS autocontenidos. | 3–4 días |

## 9. Qué no se pudo auditar

- **Comandos `aws …` contra Floci (≈350 bloques bash):** no hay registro de contenedores accesible en el entorno de auditoría, así que no se pudo arrancar `floci/floci`. El comportamiento específico de Floci (p. ej. `INSUFFICIENT_DATA` en Config M25, contenedor `valkey/valkey:8` en M23, IMDS en el puerto 9169 de M21, catálogo de Pricing en M29) queda **sin verificar**.
- **Afirmaciones sobre versiones de Floci UI** («desde la versión 0.4.0», `modulo-1.md:370`; `modulo-7.md`), la etiqueta `floci/floci:2.3.0` (`modulo-1.md:141`) y StackPort: no verificadas.
- **Código Java y TypeScript de M31** (`:56-160`, `:288`): no se compiló; el paquete npm `@floci/testcontainers` 0.4.0 existe, pero no se comprobó su API.
- **HCL (M14, M22, M32, M33):** solo se revisó por lectura; no se ejecutó `terraform validate`.
- **Figuras SVG** citadas (`content/figures/cloud/*.svg`) y renderizado Mermaid/Angular: no revisados.
- **Lectura parcial:** se leyeron completos M0 y M1. Del resto se leyó completo al menos un tema por módulo y se ojeó lo demás con búsquedas dirigidas; puede haber defectos locales no detectados en los temas no leídos íntegramente.
