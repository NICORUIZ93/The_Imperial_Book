# Auditoría editorial y pedagógica: Spring Boot, Microservicios y RutaFlow

Fecha: 2026-11-18. Auditor independiente. Rúbrica y reglas: `docs/auditoria/PROMPT-AUDITORIA.md` (A1–F3, Parte 2).
Alcance: `web/public/content/spring-boot/modulo-0…26.md` (121 temas), `microservices/modulo-0…1.md` (24 temas),
`rutaflow/modulo-0…7.md` (29 temas); tracks `web/src/app/tracks/{spring-boot,microservices,rutaflow}.track.ts`.
Este informe es el único archivo modificado.

Método: lista de temas de cada módulo (`grep '^### Tema'`), lectura completa de al menos un tema por módulo
(rotando primero, medio y último) y repaso del resto buscando defectos concretos. También usé la medición
mecánica (`docs/auditoria/plantilla-mecanica.json`, `scripts/audit_plantilla.py`), un mapa estructural propio
de los 174 temas, 21 ejecuciones reales en `/tmp/aud` y verificación en documentación oficial.

---

## 1. Veredicto ejecutivo

**Parcial, con resultado negativo para principiantes.** Microservicios M0–M1 tiene la estructura más sólida,
con objetivos, fallo deliberado y cierre en cada tema, pero incluye demostraciones que no prueban lo que dicen.
Spring Boot M0–M2 está bien escrito, aunque el curso mezcla tres plantillas. Ocho temas añadidos después
declaran «Spring Boot 3.x» en un curso fijado a 4.1.2 y crean clases en paquetes que Spring nunca escanea. El
orden numérico de los módulos contradice sus etapas. RutaFlow no cumple: 17 temas indican ejecutar
`./mvnw test` en carpetas que solo contienen JS, Python o Dart, el módulo Flutter no crea el proyecto, y varias
demostraciones de «producción» (outbox, firma de imágenes, unión discriminada) enseñan una garantía falsa. En
los 174 temas **no hay ninguna solución documentada de ejercicios**.

---

## 2. Puntuación A1–F3 por curso (0 = ausente, 1 = deficiente, 2 = aceptable, 3 = ejemplar)

SB = Spring Boot, MS = Microservicios, RF = RutaFlow.

| Crit. | SB | MS | RF | Evidencia citada |
|---|:-:|:-:|:-:|---|
| A1 Ejemplo antes de teoría | 2 | 1 | 1 | SB `spring-boot/modulo-0.md:84` abre con el problema («Una API de envíos necesita separar la regla de negocio de la fuente de datos») y entra a «Hazlo tú» en 2 min. MS y RF colocan «Paso 3 · Teoría, modelo mental y analogía» antes de «Paso 4 · Demostración guiada» en todos los temas (p. ej. `microservices/modulo-0.md:43` y `:65`; `rutaflow/modulo-5.md:26` y `:41`). RF además abre cada tema con «**Conceptos clave:**» (`rutaflow/modulo-5.md:8`). |
| A2 Analogías | 1 | 2 | 1 | SB: falta analogía en 101 de 121 temas (medición mecánica). Las que existen marcan su límite, p. ej. `spring-boot/modulo-0.md:625`: «La analogía falla en que, si el cierre tarda más del tiempo permitido, Kubernetes apaga las luces». MS: también marcan límite, p. ej. `microservices/modulo-1.md:1031`: «La analogía se rompe en que…». RF: frases agramaticales generadas por plantilla: `rutaflow/modulo-3.md:12` «Es como un tablero de aeropuerto distingue vuelo a tiempo…», `rutaflow/modulo-1.md:120` «Es como una fotografía desenfocada guardada en alta resolución sigue desenfocada.», `rutaflow/modulo-3.md:302` «Es como una rampa no es un adorno». Hay al menos 9 casos. |
| A3 Errores comunes reales | 2 | 2 | 2 | SB `spring-boot/modulo-0.md:183`: «`NoSuchBeanDefinitionException` dentro del error de creación del servicio». MS `microservices/modulo-0.md:131`: «`java.net.BindException: Address already in use`», reproducido. Pero hay fallos simulados que no fallan: `microservices/modulo-0.md:1230` («la revisión rechaza la evidencia» sin que nada la rechace) y `spring-boot/modulo-8.md` T3 («que la suite siga pasando…»). |
| A4 Ejercicios progresivos con solución | 0 | 0 | 0 | 0 soluciones en 174 temas. Las 2 `<details>` del alcance (`spring-boot/modulo-20.md:784`, `:950`) son código de referencia del laboratorio, no soluciones. Las coincidencias con «solución» del JSON mecánico son falsos positivos, como «resolución» en `microservices/modulo-0.md:190`. Contradice `METODOLOGIA-DE-APRENDIZAJE.md:71`: «Las soluciones se mantienen plegadas». |
| A5 Proyecto integrador 30–60 min | 1 | 2 | 1 | SB `spring-boot/modulo-12.md:14`: «La práctica ya contiene el proyecto ejecutable»; la persona ejecuta `./scripts/verify-integration.sh`, no construye nada. Los «Capstone» de M21 y M25 ocupan un párrafo. MS tiene proyectos con rúbrica de 100 puntos (`microservices/modulo-0.md:1256`, `modulo-1.md:1136`), pero duran 3 h y no tienen referencia. RF promete en `rutaflow/modulo-0.md:20` que «Cada módulo agrega una vertical ejecutable al mismo repositorio», pero cada tema crea una carpeta desechable (`rutaflow/modulo-0.md:87` `mkdir -p rutaflow-labs/tema-1-proceso-logistico/src`). |
| A6 Progresión | 0 | 2 | 1 | SB `spring-boot/modulo-0.md:43-44` declara las etapas «Integración: módulos 4–6, 16–17 y 20» y «Experto: módulos 7–15…»: el orden numérico salta de Experto (M15) a Integración (M16, M17). Hay temas duplicados: seguridad (M4/M18), Kafka (M8/M21), Cloud Stream (M8 T6/M25), JPA (M3/M16), hexagonal (M15 T3/M22). M18 T3 remite hacia atrás: «Siguiente paso: el módulo 10». RF pasa de SQL a Node, web, Flutter, Python, Java y Terraform declarando siempre «Conocimiento previo: terminal, Git y lectura de JSON» (15 veces). |
| B1 Misma plantilla | 0 | 2 | 2 | SB usa tres plantillas: subtema de 4 pasos (`modulo-0.md:90`), «Paso 1–7» en 8 temas añadidos (`modulo-0.md:600`, `modulo-3.md:654`, `modulo-5.md:489`, `modulo-7.md:562`, `modulo-8.md:1371`, `modulo-11.md:470`, `modulo-18.md:216`, `modulo-20.md` T9) y «Aprende/Practica» (`modulo-26.md:20`). MS usa Paso 1–7 uniforme, pero falta «Errores comunes» en 11 de 14 temas de M1. RF es uniforme, aunque con texto repetido de plantilla («El criterio no es memorizar la herramienta», 24 veces). |
| B2 Puro texto / puro código | 1 | 2 | 2 | SB M23 y M17 dejan el código en el laboratorio; la lección solo da comandos (`spring-boot/modulo-23.md:29` «Sigue ApplicationModules.of y verify.»). SB `modulo-13.md:452-509` es texto editorial sin código («Revisión oficial de plataforma», «Atlas completo de temas oficiales»). |
| B3 Objetivos y resumen | 1 | 3 | 1 | SB: falta objetivo en 101 de 121 temas (mecánico); el cierre «Cierra» sí existe. MS: «Al finalizar podrás…» y lista de cierre en cada tema (`microservices/modulo-0.md:161`, `:332`). RF: objetivo tautológico en 18 temas, p. ej. `rutaflow/modulo-5.md:20`: «Al finalizar podrás construir y verificar **Tema 1: Grafos y problema de rutas** dentro de RutaFlow». |
| B4 Módulo 0 de entorno | 2 | 1 | 2 | SB `spring-boot/modulo-0.md:6-31` cubre JDK 25 por sistema operativo, wrapper, 404 frente a «connection refused» y `Caused by:`. Faltan capturas. MS dedica un único párrafo (`microservices/modulo-0.md:25`). RF tiene la sección «Si la instalación falla» (`rutaflow/modulo-0.md:12`), pero su primer comando ejecutable falla (B-3). |
| C1 Código completo y ejecutable | 1 | 2 | 1 | Ver bloqueantes B-1, B-3 y B-4 y mayores M-1 a M-6. |
| C2 Respeta ESTANDAR-DE-CODIGO | 2 | 1 | 1 | El estándar pide «Errores explícitos» y «Claridad». MS escribe código comprimido, p. ej. `microservices/modulo-1.md:58` `if (e.artefactos()==1 && e.procesos()==1 && e.modulos()>1)`, y valida JSON con `json.contains("\"id\"")` (`microservices/modulo-0.md:1022`). RF tiene un `deploy.sh` que firma la imagen dentro del propio despliegue (`rutaflow/modulo-7.md:105`). |
| C3 Versiones | 1 | 2 | 1 | SB fija «Spring Boot 4.1.2» (`modulo-0.md:14`), pero hay 7 temas con «Usa Spring Boot 3.x» (`modulo-0.md:602`, `modulo-3.md:654`, `modulo-5.md:489`, `modulo-8.md:1371`, `modulo-11.md:470`, `modulo-18.md:216`) y «3.4 o superior» (`modulo-7.md:562`). M26 pide «JDK 27+» (`modulo-26.md:16`) en un curso fijado a JDK 25. `examples/spring-stream-rutaflow/pom.xml:8` usa Boot 4.0.9. MS usa JDK 27.0.1 (no LTS) en `modulo-0.md:37` y «JDK 21 o superior» en `modulo-1.md:1012`. RF dice «Java 27», «Node.js LTS» y «Flutter estable» sin número (`rutaflow/modulo-0.md:6`). |
| C4 Soluciones de ejercicios | 0 | 0 | 0 | Igual que A4. |
| D1 Segunda persona consistente | 2 | 3 | 1 | SB tutea, con un caso de voseo en M20. RF mezcla tuteo y voseo en 61 casos, p. ej. `rutaflow/modulo-0.md:137` «llamá», `:141` «Agregá», `:151` «Entregá», junto a «Dibuja» y «Documenta». |
| D2 Jerga sin glosario | 1 | 1 | 1 | No hay glosario en el repositorio; la caja «Conceptos clave» (`lesson-viewer.ts:940`) solo muestra chips sin definición. Términos sin explicar: SB «BOM», «AOT», «annotationProcessor» en M1 (`modulo-1.md:44-45`), antes de Tema 1; MS «release train» (`modulo-1.md:25`), «alta cardinalidad» (`modulo-0.md:206`); RF «SBOM», «burn rate», «digest» (`modulo-7.md:10`). |
| D3 Conocimiento previo no enseñado | 1 | 2 | 0 | RF pide Dart/Flutter, Python, Terraform y Kubernetes con «**Conocimiento previo:** terminal, Git y lectura de JSON» (`rutaflow/modulo-4.md:179`, `modulo-5.md:20`, `modulo-7.md:20`). SB M2 T1 crea entidades JPA antes de M3 (`spring-boot/modulo-2.md:50`). |
| E1 Qué detecta `validate.sh` | 1 | 1 | 1 | Solo comprueba paridad de archivos, índice, catálogo, carpetas de laboratorio y specs (`scripts/validate.sh:8-33`). Aprobó (`validate.sh: ok`) con todos los defectos de este informe. |
| E2 Ejecuta código / plantilla / jerga | 0 | 0 | 0 | No ejecuta bloques, no valida la plantilla y no revisa jerga. `validate_lesson_labs.py:7`: «Los archivos dentro de un laboratorio pueden no existir». |
| E3 Flujo de revisión documentado | 0 | 0 | 0 | No existe. Ya lo señaló `docs/auditoria-editorial-2026-11-18.md:67`. |
| F1 Riesgo de temas sin revisión | 0 | 1 | 0 | Este alcance (174 temas) contiene al menos 4 bloqueantes sistémicos (sección 4). |
| F2 Ruta priorizada | 1 | 2 | 1 | MS publica de forma progresiva: «sólo se registra un módulo cuando su lección real supera la puerta editorial» (`microservices.track.ts:3`). SB y RF publican todo a la vez. |
| F3 Glosario y apéndices | 0 | 0 | 0 | Ausentes. El «Atlas completo de temas oficiales» (`spring-boot/modulo-13.md:491`) lista nombres con la columna «entregas» repetida, sin definiciones. |

---

## 3. Tabla por módulo

Nota global de 0 a 3. «Cita» reproduce texto del archivo.

| Curso | Mód. | Temas | Nota | Defecto principal (cita) | Corrección concreta |
|---|---|---|:-:|---|---|
| SB | 0 | 4 | 2 | T4 crea `academia-spring/src/main/java/com/rutaflow/asignacion/LoteEnvios.java` (`:643`), pero el escaneo parte de `com.example.demo` (`:187`). Además invierte el orden real de apagado (`:636`, `:709-711`) y dice «Usa Spring Boot 3.x con Java 21» (`:602`). | Mover a `com.example.demo`, fijar Boot 4.1.2/JDK 25 y corregir la fase (ver T-1). |
| SB | 1 | 3 | 1 | El título promete «Spring Boot CLI» (`:1`) y el track promete «Crear tu propia auto-configuración condicional (@AutoConfiguration…)»: 0 apariciones de CLI o `@AutoConfiguration` en el módulo. | Renombrar el módulo o escribir el tema. Mover la sección Gradle (`:8-51`) a un apéndice. |
| SB | 2 | 6 | 2 | El track promete «HandlerInterceptor frente a Filter» y «HttpMessageConverters»: 0 apariciones. T1 enseña `@Entity` (`:50`) antes de M3. | Añadir los dos temas o retirarlos del track; dar en T1 un aviso de prerrequisito JPA. |
| SB | 3 | 4 | 1 | T4 MongoDB en `com.rutaflow.envios` (`:689-724`), fuera del escaneo, con «Spring Boot 3.x» (`:654`). Tampoco aparecen «Specifications», «auditoría», `Pageable` ni Liquibase, prometidos en el track. | Mover el paquete, fijar la versión y alinear el track con el contenido. |
| SB | 4 | 5 | 2 | Laboratorio SSRF correcto, pero el track promete «Versionado de APIs: por URI, por header…» y el único «versionado» del módulo es «archivos versionados» (`:341`). | Añadir el tema o quitarlo del track. |
| SB | 5 | 4 | 1 | T4 crea `com/rutaflow/config/SeguridadConfig.java` (`:558`) fuera del escaneo, con «Usa Spring Boot 3.x» (`:489`). | Mover a `com.example.demo.config` y fijar la versión. |
| SB | 6 | 3 | 2 | Sin práctica independiente, analogía ni errores comunes en los 3 temas (mapa estructural). | Añadir ejercicio con solución plegada por tema. |
| SB | 7 | 4 | 1 | T4 crea `com/rutaflow/asignacion/AsignacionController.java` (`:605`), que no se registra; el endpoint dará 404. Además «Spring Boot 3.4 o superior» (`:562`). | Mover el paquete y fijar 4.1.2. |
| SB | 8 | 10 | 2 | 1 489 líneas y 10 temas; T10 (JMS) usa «Spring Boot 3.x» (`:1371`) y `com/rutaflow/facturacion` (`:1414`). El fallo de T3 no falla: «La suite completa también pasa si cambias temporalmente `enable.idempotence` a `false`». | Dividir en dos módulos, corregir T10 y sustituir el fallo de T3 por uno observable. |
| SB | 9 | 3 | 2 | Sin práctica independiente ni solución. M26 cita «Módulo 9, Tema 4», que no existe (M9 tiene 3 temas). | Corregir la referencia en `modulo-26.md:52`. |
| SB | 10 | 12 | 2 | 1 723 líneas, 12 temas de 35–45 min (≈8 h) sin una sola solución. T9 («Comprueba módulos antes de separar servicios») se superpone con M23. | Partir el módulo en dos y quitar el solapamiento con M23. |
| SB | 11 | 4 | 2 | T4: «Usa Spring Boot 3.x» (`:470`) y «una app de Spring Boot con Java 21» (`:480`). | Fijar 4.1.2/JDK 25. |
| SB | 12 | 3 | 1 | Integrador prefabricado: «La práctica ya contiene el proyecto ejecutable» (`:14`); la evidencia es correr `verify-integration.sh`. | Convertirlo en construcción guiada desde `academia-spring` con una referencia plegada. |
| SB | 13 | 4 | 1 | Restos editoriales publicados: «## Revisión oficial de plataforma — julio de 2026» (`:452`), «## Atlas completo de temas oficiales» (`:491`). El laboratorio de 10 pasos incluye «Ejecuta game day… postmortem» (`:476`). | Eliminar los restos y reducir el laboratorio a 30–60 min. |
| SB | 14 | 6 | 1 | La introducción promete «MySQL real vía Testcontainers» (`:6`), pero T1 cierra con «H2 verifica este laboratorio local». El fallo «Cambia `CREADO` por `CREARDO`» (`:34`) produce un error de compilación, no el fallo de test descrito. No hay ejercicios (0 coincidencias). | Corregir el diagnóstico, aclarar la base de datos y añadir ejercicios. |
| SB | 15 | 8 | 1 | Restos: «## Trazabilidad de la auditoría original» (`:614`), «## Aplicación del material de referencia» (`:623`). Referencia equivocada: «puertos y adaptadores (Módulo 10, Tema 6)» (`:253`); M10 T6 es gRPC. | Eliminar los restos y apuntar a M15 T8 o M22 T1. |
| SB | 16 | 2 | 2 | Duplica M3 T2 (N+1). El track promete «Caché de primer nivel y Session»: 0 apariciones. | Fusionar con M3 o diferenciar el alcance; añadir el tema prometido. |
| SB | 17 | 2 | 2 | El código vive en el laboratorio; la lección muestra un fragmento de 5 líneas (`:44-48`). Está numerado después de microservicios (M10) pero clasificado como «Integración». | Renumerar a continuación de M3 e incluir el DAO completo en la lección. |
| SB | 18 | 3 | 1 | T3 SAML: «Usa Spring Boot 3.x» (`:216`), clases en `com/rutaflow/seguridad` (`:273`, `:298`) y Keycloak «con un cliente SAML» sin pasos para crearlo ni para crear al usuario `operadora1`. | Añadir el realm exportado, fijar paquete y versión. |
| SB | 19 | 2 | 2 | Sin analogía, objetivo formal ni solución. | Añadir solución plegada. |
| SB | 20 | 9 | 1 | Resto editorial visible: «## Ampliación de la página 28 del PDF» (`:637`). El módulo mezcla scheduling, correo, SOAP, Spring AI, RAG y MCP (1 229 líneas). | Eliminar el encabezado y separar Spring AI en un módulo propio. |
| SB | 21 | 3 | 1 | 0 ejercicios. Duplica M8 T1–T3. El «Capstone del módulo» es un párrafo (`:264`). | Fusionar con M8 o reorientar; escribir el capstone con pasos y referencia. |
| SB | 22 | 3 | 2 | Ejecutado: `Hexagonal.java` imprime `reserva=RES-1 vehiculo=camion-1` y los validadores dan «C4 OK» y «ADR OK». Contradicción de requisitos: «Java 21 o superior» (`:11`) frente a «JDK 25» (`:17`). El diagrama dibuja «Puerto -.->\|implementa\| Adaptador», con la dirección invertida. | Unificar el JDK e invertir la flecha. |
| SB | 23 | 4 | 2 | La lección no contiene el código que analiza: «Sigue ApplicationModules.of y verify.» (`:29`). Repite el mismo «Hito del tema» en los 4 temas. | Incluir los fragmentos clave y personalizar el hito. |
| SB | 24 | 4 | 2 | Igual que M23: texto de hito repetido y código solo en el laboratorio. | Igual que M23. |
| SB | 25 | 4 | 1 | 0 ejercicios. Duplica M8 T6. El laboratorio usa Boot 4.0.9 (`examples/spring-stream-rutaflow/pom.xml:8`) cuando el curso fija 4.1.2. | Subir la versión y fusionar con M8 T6. |
| SB | 26 | 2 | 1 | Tercera plantilla («#### Aprende / Practica»), «JDK 27+» (`:16`) y referencia a «Módulo 9, Tema 4» (`:52`), inexistente. | Migrar a la plantilla única y corregir JDK y referencia. |
| MS | 0 | 10 | 2 | La evidencia central de T2 no aparece: «la terminal del servidor imprime `SERVIDOR_TERMINO_LENTO`» (`:312`). Ejecutado: el servidor lanza `IOException: Broken pipe` y nunca imprime la línea (T-2). T10 «demuestra» falacias imprimiendo un mapa fijo (`:1203-1215`). | Imprimir la marca antes de responder; sustituir T10 por un agregador de evidencias reales. |
| MS | 1 | 14 | 2 | Los clasificadores son tablas `if` sin relación con un sistema real (`:53-66`). DDD, que fundamenta T3 («capacidad de negocio»), se explica al final, en T14 (`:1002`). JDK 21 en T14 frente a JDK 27.0.1 en el resto. | Mover T14 a la posición 3 y unificar el JDK. |
| RF | 0 | 3 | 1 | Primer comando inválido: «**Ejecuta el ejemplo** (según la capa: backend con `./mvnw test`…)» y `./mvnw test` (`:91-95`) en una carpeta con un solo archivo JS. Voseo mezclado (`:137`, `:141`). | Eliminar el bloque (17 apariciones en el curso) y unificar en tuteo. |
| RF | 1 | 3 | 2 | Ejecutado: el SQL del ledger da 0 filas y luego `2 \| 10000.00 \| 0.00`, como dice el texto. Contradicción interna: promete balance «por asiento y moneda» (`:315`), pero la tabla no tiene columna de moneda (`:261-269`). | Añadir `moneda` y agrupar también por moneda. |
| RF | 2 | 4 | 1 | T3 «Outbox» es un arreglo en memoria (`:332-355`) que no sobrevive a la caída que pretende demostrar, y afirma «el backend de envíos queda transaccional, autorizado y observable» (`:399`). OpenTelemetry, prometido en el track, aparece 0 veces. | Usar PostgreSQL (ya existe en M1) con transacción real y un relay como proceso aparte. |
| RF | 3 | 3 | 1 | Módulo «Angular y React, MapLibre, WebSocket» (track) que solo contiene scripts Node: «Angular» y «React» aparecen 1 vez cada uno. Afirmación falsa en JS: «esta combinación ni siquiera se puede construir» (`:122`) (T-5). | Pasar a TypeScript con tipos o retirar la afirmación; construir un componente real. |
| RF | 4 | 3 | 0 | Ningún tema ejecuta `flutter create`: `flutter pub add geolocator battery_plus` (`:206`) y `flutter run` fallan sin `pubspec.yaml`. El muestreo usa `timeLimit` como intervalo (`:240`) (T-4). | Añadir `flutter create` y un `main.dart` mínimo; usar `AndroidSettings(intervalDuration:)` / `distanceFilter`. |
| RF | 5 | 5 | 1 | T1 promete «VRP, capacidad, ventanas… nearest-neighbor… 2-opt» (`:8-10`) y entrega solo Dijkstra entre dos nodos (ejecutado: salida correcta). | Añadir NN + 2-opt con capacidad o reducir la promesa. |
| RF | 6 | 4 | 1 | Ejecutado: `RF-4471 total=128221.91` y la variante double `128221.90`, correctas. Contradice M1: aquí «`setScale(2, RoundingMode.HALF_UP)` en cada operación monetaria» (`modulo-6.md:119`); M1 lo lista como error, «redondear montos antes de sumar» (`modulo-1.md:313`). | Fijar una sola política de redondeo y documentarla. |
| RF | 7 | 4 | 1 | El `deploy.sh` firma la imagen inmediatamente antes de desplegar (`:105`) y despliega por tag mutable. La «corrección» (`:116`) deja pasar la imagen retagueada (T-6). `main.tf` no declara proveedor ni cluster. Floci/StackPort aparecen 1 vez sin explicación. | Firmar en CI tras construir, verificar y desplegar por `@sha256:` digest; añadir el bloque `provider "kubernetes"` y un kind/minikube local. |

---

## 4. Defectos bloqueantes (impiden publicar)

**B-1. Ocho temas de Spring Boot no producen el resultado que prometen.** Crean clases en `com.rutaflow.*`
dentro de `academia-spring`, cuyo escaneo parte de `com.example.demo`. El curso lo explica en
`spring-boot/modulo-0.md:187`: «`@SpringBootApplication` activa el escaneo desde el paquete de la clase principal
hacia sus subpaquetes». Afectados: `modulo-0.md:643`, `modulo-3.md:689/705/724`,
`modulo-5.md:516/531/558`, `modulo-7.md:605`, `modulo-8.md:1414`, `modulo-18.md:273/298`. Los mismos temas
declaran «Usa Spring Boot 3.x» (lista en C3).
*Corrección:* usar `com.example.demo.<subpaquete>`, fijar Boot 4.1.2/JDK 25 y migrar a la plantilla de subtemas.

**B-2. No hay soluciones de ejercicios en los tres cursos** (0 de 174 temas). Contradice la metodología
(`docs/METODOLOGIA-DE-APRENDIZAJE.md:67`, `:71`).
*Corrección:* una solución plegada con ideas de resolución por cada «Práctica independiente», empezando por SB M0–M3,
MS M0 y RF M0–M1.

**B-3. RutaFlow ordena ejecutar `./mvnw test` en carpetas sin Maven, 17 veces.** Texto:
«**Ejecuta el ejemplo** (según la capa: backend con `./mvnw test`, app con `flutter run`)». Por módulo: M0 2,
M2 3, M3 3, M4 1, M5 3, M6 3, M7 2. Ejemplos: `rutaflow/modulo-0.md:91`, `modulo-5.md:50`, `modulo-7.md:47`.
*Corrección:* eliminar el bloque de plantilla y dejar solo el comando real del tema (`node …`, `python3 …`, `psql …`).

**B-4. El módulo Flutter de RutaFlow no puede ejecutarse.** No existe `flutter create` en el módulo; `flutter pub add`
(`rutaflow/modulo-4.md:206`, `:319-320`) y `flutter run` (`:246`) requieren `pubspec.yaml`.
*Corrección:* `flutter create rutaflow_conductor` en T1, y en cada tema un `main.dart` que invoque el código.

**B-5. Restos editoriales internos visibles para el estudiante.** `spring-boot/modulo-20.md:637` «Ampliación de la
página 28 del PDF»; `modulo-15.md:614` «Trazabilidad de la auditoría original»; `modulo-15.md:623`,
`modulo-20.md:750/924/1066`, `rutaflow/modulo-2.md:408`, `modulo-5.md:374/538` y `modulo-6.md:395`
«Aplicación del material de referencia»; `spring-boot/modulo-13.md:452`, `:491`.
*Corrección:* eliminarlos y añadir a `validate.sh` una lista de encabezados prohibidos.

---

## 5. Defectos mayores (degradan el aprendizaje)

- **M-1** `spring-boot/modulo-0.md:636`, `:709-711`, `:722`. El orden de apagado está invertido y el ejercicio
  de fase es incorrecto (T-1). *Corrección:* `getPhase()` debe devolver un valor menor que
  `WebServerApplicationContext.GRACEFUL_SHUTDOWN_PHASE`, y el resultado esperado debe mostrar «3.» antes de
  «Commencing…».
- **M-2** `microservices/modulo-0.md:312`. La evidencia «SERVIDOR_TERMINO_LENTO» no aparece (T-2).
  *Corrección:* imprimir la marca después de `Thread.sleep` y antes de `responder`, y capturar la `IOException`
  con un mensaje explícito.
- **M-3** `microservices/modulo-0.md:1017-1031`. Valida «contratos» buscando subcadenas
  (`json.contains("\"id\"")`). Acepta `{"id":"ENV-1","estado":{"codigo":"CREADO"}}` (ejecutado: `v3.json
  ciudad=DESCONOCIDA`), justo el caso que la lección marca como «INCOMPATIBLE» (`:1006`). *Corrección:* parsear
  el JSON y comprobar el tipo, o al menos validar con un esquema.
- **M-4** `microservices/modulo-0.md:716`. La huella de idempotencia la envía el cliente
  (`X-Payload-Fingerprint`), así que un cliente puede reutilizar la clave con otro payload y la misma huella.
  *Corrección:* calcular SHA-256 del cuerpo en el servidor.
- **M-5** `microservices/modulo-0.md:1203-1230`. T10 imprime «REFUTADA …» desde un `LinkedHashMap` fijo; el
  «fallo deliberado» («la revisión rechaza la evidencia») no lo rechaza ningún código. *Corrección:* un programa
  que lea `evidence/*.txt` de T1–T9 y falle si falta la evidencia.
- **M-6** `rutaflow/modulo-2.md:332-401`. Outbox en memoria presentado como garantía ante caídas. «Errores
  comunes» dice «publicar a la cola antes o después del commit en vez de dentro de la misma transacción»
  (`:401`), lo que contradice el patrón: la publicación ocurre después del commit, desde el relay.
  *Corrección:* reescribir con PostgreSQL y corregir la frase.
- **M-7** `rutaflow/modulo-7.md:100-121`. Firma y despliegue mal planteados (T-6).
- **M-8** `rutaflow/modulo-4.md:236-241`. `timeLimit` usado como intervalo de muestreo (T-4).
- **M-9** Progresión de Spring Boot. La numeración contradice las etapas (`spring-boot/modulo-0.md:43-44`) y hay
  5 pares de módulos duplicados (A6). *Corrección:* renumerar (M16 y M17 después de M3; M21 y M25 dentro de M8,
  o retirarlos) y actualizar las referencias.
- **M-10** Track y contenido no coinciden. SB M0 (`@Qualifier`, AOP: 0 apariciones), M1 (CLI,
  `@AutoConfiguration`: 0), M2 (`HandlerInterceptor`, `HttpMessageConverter`: 0), M3 (Specifications, Pageable,
  Liquibase: 0), M4 (versionado: 0) y M16 (caché de primer nivel: 0). RF: OpenTelemetry 0 en todo el curso
  aunque M2, M5 y M7 lo listan; Angular/React 1 aparición en M3. *Corrección:* script que compare los `topics`
  del track con los encabezados del Markdown.
- **M-11** Duraciones infladas. RF declara 96 h (`rutaflow.track.ts`) para 29 temas (≈3,3 h por tema), frente a
  los 20–45 min de la metodología (`METODOLOGIA…:9`). *Corrección:* derivar la duración de la suma de subtemas.
- **M-12** `rutaflow/modulo-1.md:313` y `rutaflow/modulo-6.md:119`. Política de redondeo contradictoria (tabla
  por módulo).
- **M-13** `spring-boot/modulo-15.md:253`. Prerrequisito mal referido («Módulo 10, Tema 6» es gRPC), y
  `modulo-26.md:52` («Módulo 9, Tema 4» no existe).
- **M-14** `spring-boot/modulo-14.md:34`. El diagnóstico de `CREARDO` es falso: es un error de compilación,
  no un fallo de test.

## 6. Defectos menores

- Voseo mezclado con tuteo: 61 casos en RF (p. ej. `rutaflow/modulo-0.md:137`) y 1 en `spring-boot/modulo-20.md`.
- Analogías agramaticales «Es como un X verbo…» en RF (`modulo-3.md:12`, `modulo-3.md:150`, `modulo-3.md:302`,
  `modulo-4.md:171`, `modulo-4.md:285`, `modulo-6.md:12`, `modulo-6.md:273`, `modulo-7.md:147`,
  `modulo-1.md:120`).
- Frase huérfana repetida «Como **siguiente** paso, lleva lo aprendido al próximo tema…» (8 en RF, 3 en SB).
- `spring-boot/modulo-0.md:738`: «Siguiente paso: el tema «Inyección por constructor…»» apunta hacia atrás (T2).
- `microservices/modulo-0.md:1171`: el prerrequisito cita «Delimitar y rechazar payloads…», pero T9 se titula
  «Rechazar un frame excesivo…». `spring-boot/modulo-18.md:208` cita «…y cliente»; el título real es «…y clientes HTTP».
- `microservices/modulo-0.md:25` dice «Todos los comandos parten de esa carpeta» (`academia-labs/microservices`),
  pero los bloques posteriores ejecutan `mkdir -p academia-labs/microservices/...` y `cp examples/...`
  (`:1040-1041`), que solo funcionan desde la raíz del repositorio.
- La cabecera JDK sale como `Idempotency-replayed` y la lección dice `Idempotency-Replayed` (ejecutado). HTTP no
  distingue mayúsculas, pero la lección habla de «salida exacta».
- `rutaflow/modulo-0.md:64-70`: el diagrama no tiene la transición `intentado → entregado` que el código permite.
- `spring-boot/modulo-1.md:3`, `modulo-0.md:3`: «su propio reto de memoria» no aparece en ningún tema.
- `spring-boot/modulo-22.md`: el fallo cita `build.gradle` en un laboratorio sin herramienta de build.

---

## 7. Errores técnicos verificados

| ID | Afirmación (archivo:línea) | Por qué es falsa | Fuente / prueba |
|---|---|---|---|
| T-1 | `spring-boot/modulo-0.md:636` «S->>L: stop(): vacía el lote pendiente» después del apagado del servidor; resultado esperado `:709-711` con «Graceful shutdown complete» antes de «3. vacía». `:722`: `Integer.MAX_VALUE - 100` para «detenerse antes». | `SmartLifecycle` tiene fase por defecto `Integer.MAX_VALUE` y el apagado recorre las fases en orden inverso, así que `LoteEnvios` se detiene **antes** del apagado ordenado del servidor (`GRACEFUL_SHUTDOWN_PHASE = 2147482623`). Las peticiones en curso que llamen a `agregar` recibirán `IllegalStateException`. Con `MAX_VALUE-100` sigue deteniéndose antes del servidor. | [SmartLifecycle Javadoc](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/context/SmartLifecycle.html): «The shutdown process will apply the reverse order»; [Constant Field Values de Spring Boot](https://docs.spring.io/spring-boot/api/java/constant-values.html): `GRACEFUL_SHUTDOWN_PHASE 2147482623`. |
| T-2 | `microservices/modulo-0.md:312` «Aproximadamente un segundo después, la terminal del servidor imprime `SERVIDOR_TERMINO_LENTO`». | Cuando el cliente abandona, `sendResponseHeaders` y `write` fallan con `IOException: Broken pipe`, y el `println` posterior (`:242`) nunca se ejecuta. | Ejecutado en JDK 21.0.13 (Linux): 3 de 3 intentos registraron `IOEX java.io.IOException: Broken pipe` y ninguna línea `SERVIDOR_TERMINO_LENTO`. JDK 27 no estaba disponible: no verificado en esa versión. |
| T-3 | `microservices/modulo-0.md:1006` «cambiar estado:string -> object -> INCOMPATIBLE» como algo que la demo distingue. | `CompatibilidadContrato` acepta ese cambio. | Ejecutado: `{"id":"ENV-1","estado":{"codigo":"CREADO"}}` → `v3.json ciudad=DESCONOCIDA`, sin error. |
| T-4 | `rutaflow/modulo-4.md:240` `LocationSettings(…, timeLimit: intervalo)` y «`configurarMuestreo()` pasa a devolver un intervalo de 30 segundos en vez de 5» (`:249`). | `timeLimit` es un timeout: el stream lanza `TimeoutException` si no llega una posición dentro de ese plazo. No define el intervalo de muestreo (que se fija con `AndroidSettings.intervalDuration` / `distanceFilter`). | [geolocator `LocationSettings.timeLimit`](https://pub.dev/documentation/geolocator_platform_interface/latest/geolocator_platform_interface/LocationSettings/timeLimit.html): «Throws a `TimeoutException` when no location is received within the supplied timeLimit duration». |
| T-5 | `rutaflow/modulo-3.md:122` «con la unión discriminada del Paso 4 esta combinación ni siquiera se puede construir». | El código es JavaScript sin tipos: nada impide construir `{tipo:'listo', envio, mensaje, cargando:true}`, y `renderizar` lo acepta. | Ejecutado: `renderizar({tipo:"listo",envio:{…},mensaje:"error viejo",cargando:true})` → `Envio RF-1: x`, sin error. |
| T-6 | `rutaflow/modulo-7.md:116-121` «Con el gate agregado, repetir el despliegue de la imagen retagueada falla». | El `deploy.sh` (`:105`) ejecuta `cosign sign --key cosign.key "$IMAGE"` antes del gate. La corrección solo añade `cosign verify` antes de `kubectl`, así que el pipeline firma la imagen retagueada y la verificación pasa. Además, verificar y desplegar por tag deja una carrera (la verificación y el `pull` pueden resolver imágenes distintas); el propio texto exige «promueve el mismo digest» (`:10`). | Razonamiento sobre el script tal como está escrito (no se ejecutó: no hay registro ni cluster). |
| T-7 | `spring-boot/modulo-14.md:34` «Cambia `CREADO` por `CREARDO` en `crear()`; el test detecta que la respuesta no coincide». | `crear()` usa `EstadoEnvio.CREADO` (`examples/spring-boot-cancel-rutaflow/.../Envio.java:26`); `CREARDO` no existe en el enum y el resultado es un error de compilación. | Lectura del enum `EstadoEnvio.java:4`. |
| T-8 | B-1 (8 temas). | Clases fuera del paquete escaneado. | Regla documentada por el propio curso (`spring-boot/modulo-0.md:187`) y por [Spring Boot: estructura del código](https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html). Sin ejecución: no hay acceso a Maven Central. |

Hechos dudosos comprobados **correctos** (no se marcan como defecto): `InetAddressFilter` existe en Spring Boot 4.1
([Spring Boot 4.1.0-RC1 Release Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.1.0-RC1-Release-Notes));
4.1.2 es el último parche de 4.1 (22 oct 2026, [versionlog](https://versionlog.com/spring-boot/4.1/)); JDK 27.0.1
existe ([Oracle 27.0.1 relnotes](https://www.oracle.com/java/technologies/javase/27-0-1-relnotes.html)); las
probes liveness/readiness están activas por defecto en Boot 4 («These health groups are automatically enabled»,
[Actuator endpoints](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html)), como dice
`spring-boot/modulo-11.md:318`.

---

## 8. Ejecuciones realizadas (en `/tmp/aud`)

| Curso/Mód./Tema | Código | Resultado |
|---|---|---|
| MS M0 T1 | `Servidor.java` + curl + segundo proceso | Coincide (200 `UP`, `BindException`). |
| MS M0 T2 | `ServidorLatencia` + `ClienteTimeout` | El cliente coincide; **falta la evidencia del servidor** (T-2). |
| MS M0 T5 | `ServidorIdempotente` | `numero=1`, 409, `efectos=1`, 400 sin huella: coincide, salvo mayúsculas de la cabecera. |
| MS M0 T8 | `CompatibilidadContrato` | Coincide para V1/V2; acepta un cambio incompatible (T-3). |
| MS M0 T10 | `FalaciasDistribuidas` | Imprime 6 «REFUTADA» fijos (M-5). |
| MS M1 T1, T2, T12, T7… | `ClasificarArquitectura`, `EvaluarAutonomia`, `EvaluarExtraccion`, `DetectarCiclo`, `CalcularTarifaPura` | Compilan y producen las salidas esperadas. |
| SB M22 T1 | `Hexagonal.java`, `validar-c4.mjs`, `validar-adr.mjs` | `reserva=RES-1 vehiculo=camion-1`, «C4 OK», «ADR OK». |
| RF M0 T1 | `envio-estado.js` | `OK entregado 4 eventos`; fallo coincide. |
| RF M1 T3 | `ledger.sql` en PostgreSQL local temporal | Coincide (0 filas, luego asiento 2). |
| RF M2 T3 | `outbox.js` + variante sin outbox | Coincide con el texto, pero no demuestra la durabilidad (M-6). |
| RF M3 T1 | `estado-vista.js` + `roto.js` | Coincide; refuta «no se puede construir» (T-5). |
| RF M5 T1 | `rutas.py` | Coincide (31 / 19 min). |
| RF M6 T1 | `CotizadorEnvio.java` + variante double | Coincide (`128221.91` / `128221.90`). |

Cobertura frente a lo pedido (al menos uno por cada 3 módulos): MS y RF cumplidos. **SB no se cumple**: solo M22
pudo ejecutarse.

---

## 9. Plan de corrección priorizado

| # | Acción | Esfuerzo |
|---|---|---|
| 1 | Bloqueantes mecánicos: quitar los 17 `./mvnw test` de RF; añadir `flutter create` en RF M4; mover los 8 temas SB a `com.example.demo` y fijar 4.1.2/JDK 25; eliminar los restos editoriales (B-1, B-3, B-4, B-5). | 2–3 días |
| 2 | Corregir los errores técnicos T-1 a T-7 y reescribir las demos que no prueban nada (M-2 a M-7). | 1 semana |
| 3 | Escribir soluciones plegadas con ideas de resolución en SB M0–M3, MS M0–M1 y RF M0–M2; después, el resto. | 2–3 semanas |
| 4 | Reestructurar SB: renumerar según etapas, fusionar duplicados (M16→M3, M21/M25→M8, M18→M4), una sola plantilla y M12 construido por la persona. Alinear todos los tracks con su contenido (M-9, M-10). | 2 semanas |
| 5 | Ampliar `validate.sh`: comparar temas del track con encabezados, bloquear encabezados prohibidos, exigir `<details>` por práctica, detectar comandos de otra pila (p. ej. `./mvnw` sin `pom.xml` en la carpeta del tema), ejecutar en CI los ejemplos Java/JS/Python/SQL autocontenidos. | 1 semana |

---

## 10. Qué no pude auditar y por qué

- **Ejecución de código Spring Boot (todos los módulos salvo M22):** Maven Central está bloqueado por el proxy
  (`repo.maven.apache.org:443 — connect_rejected`) y `~/.m2` no tiene artefactos Spring. Las afirmaciones sobre
  Spring se basan en lectura y documentación oficial, no en ejecución.
- **Flutter/Dart (RF M4), Terraform/Kubernetes/cosign (RF M7), Docker (Kafka, RabbitMQ, Keycloak, MySQL,
  Testcontainers):** no hay SDK de Flutter, el daemon Docker no está activo y no hay registros de imágenes.
- **JDK 27:** el entorno tiene JDK 21.0.13; los ejemplos de MS se compilaron sin `--release 27`.
- **Lectura completa:** leí completos los temas indicados en la sección 3 y en las ejecuciones; del resto revisé
  encabezados, bloques de código y marcadores. No verifiqué uno a uno los 61 laboratorios de `examples/`; solo
  comprobé que existen todos los archivos citados por estas lecciones (ninguno falta).
- **Gradle 9.8.2 y Spring Cloud 2025.1.4:** no los verifiqué en una fuente primaria. La búsqueda mostró
  2025.1.3 (ago 2026) como último anuncio indexado; 2025.1.4 es plausible pero no está confirmado.
- **Componente visual (`/visuals/temas/...html`) y renderizado en la app:** fuera del alcance de esta lectura.
