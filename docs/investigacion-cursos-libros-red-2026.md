# Investigación externa para elevar cada tema de cero a profesional

Fecha de corte: 2026-10-31.

## Objetivo y límites

Esta investigación sirve para reescribir los 1.100 temas, no para añadir una lista
decorativa de enlaces. Se consultan temarios públicos de cursos, libros, currículos
universitarios y documentación primaria. Los temarios de Udemy y YouTube ayudan a
detectar orden, prácticas y proyectos; no son autoridad para versiones ni autorizan
copiar explicaciones, ejercicios, imágenes o código protegido.

La documentación oficial decide sintaxis y comportamiento vigente. OSSU, CS2023 y
SWEBOK ayudan a detectar fundamentos omitidos. Los libros aportan modelos mentales,
casos límite y decisiones que suelen sobrevivir a una versión concreta. Cada cambio
de contenido debe conservar fuentes primarias y un ejemplo original reproducible.

## Rúbrica de reescritura

Cada tema se revisa como una progresión, no como cuatro etiquetas:

| Nivel | La explicación debe responder | Evidencia mínima |
|---|---|---|
| Cero | qué problema existe, qué términos son nuevos y dónde trabajar | carpeta/ruta, archivo completo y primer resultado |
| Aplicación | cómo usar el mecanismo correctamente y cómo falla | prueba normal, caso límite y fallo deliberado diagnosticado |
| Integración | cómo colabora con el resto del stack | incremento de RutaFlow y contrato entre dos piezas |
| Profesional | cuándo elegirlo, medirlo, operarlo o descartarlo | alternativa, trade-off, cancelación/seguridad/rendimiento y criterio observable |

La palabra «experto» no acredita nada. El nivel superior requiere decidir con
evidencia, recuperar un fallo y explicar límites. Una fuente, una plantilla o un
vídeo largo tampoco sustituyen esa evidencia.

## Fuentes marco

- [OSSU Computer Science](https://cs.ossu.dev/) para secuencia universitaria y
  prerrequisitos de ciencias de la computación.
- [ACM/IEEE CS2023](https://csed.acm.org/) y
  [SWEBOK v4](https://www.computer.org/education/bodies-of-knowledge/software-engineering)
  para cobertura y resultados observables.
- [Teach Yourself Computer Science](https://teachyourselfcs.com/) para relacionar
  cada área estable con un libro y una serie de clases.
- [Full Stack Open](https://fullstackopen.com/en/) para práctica web acumulativa,
  pruebas, APIs, CI/CD y contenedores.
- [MDN Curriculum](https://developer.mozilla.org/en-US/curriculum/) para la base
  web que debe preceder a Angular o React.
- Los catálogos de [MIT Press](https://mitpress.mit.edu/textbooks/computer-science/),
  [No Starch Press](https://nostarch.com/catalog/programming) y la biblioteca
  externa ya inventariada se usan para contrastar profundidad, no para copiar.

## Familias de contraste por track

| Track | Curso/currículo para secuencia y práctica | Autoridad técnica y libros de contraste | Foco de mejora |
|---|---|---|---|
| foundations | OSSU, CS50, Teach Yourself CS | CS2023, OSTEP, SICP, *Designing Data-Intensive Applications* | empezar sin jerga; datos, sistemas, algoritmos y decisiones medibles |
| javascript | MDN Curriculum, Full Stack Open | ECMAScript/TC39, MDN, *Eloquent JavaScript* | runtime, asincronía, DOM, accesibilidad y diagnóstico |
| node | Full Stack Open y proyectos backend extensos | Node.js, HTTP/RFC, OWASP | límites de API, concurrencia, seguridad, observabilidad y cierre ordenado |
| angular | cursos oficiales y temarios de proyectos Angular completos | angular.dev, RxJS, W3C | fundamentos web antes del framework; signals, formularios, pruebas y rendimiento |
| react | Full Stack Open y temarios React/Next con proyecto | react.dev, React Router, TanStack | estado cliente/servidor, concurrencia, accesibilidad y despliegue |
| java | cursos universitarios y temarios Java moderno | dev.java, OpenJDK, *Effective Java*, *Core Java* | JVM, tipos, colecciones, concurrencia y diseño con pruebas |
| spring-boot | proyectos de API completos y cursos de integración | Spring Guides/Reference, RFC, OWASP | HTTP/SQL primero; seguridad por recurso, datos reales y operación |
| android | Android Basics with Compose y temarios Android por proyectos | Android Developers, Kotlin docs, *Kotlin in Action* | Kotlin antes de Compose; ciclo de vida, cancelación, dispositivo y release |
| ios | recorridos Swift/SwiftUI por aplicaciones | Apple Developer, Swift.org | Swift antes de SwiftUI; concurrencia, memoria, permisos, pruebas y distribución |
| flutter | cursos por aplicaciones completas | docs.flutter.dev, dart.dev | Dart, estado, isolates, plataformas, pruebas y perfiles de rendimiento |
| kotlin-multiplatform | guías KMP y proyectos por targets | Kotlin/JetBrains, Ktor, SQLDelight | source sets, contratos comunes, interoperabilidad y pruebas por destino |
| cloud | laboratorios progresivos y arquitectura por escenarios | AWS Well-Architected y documentación de servicio | IAM, redes, coste, restauración y diferencias entre emulación y nube real |
| devops | Full Stack Open CI/CD y laboratorios operacionales | CNCF, Kubernetes, Docker, DORA, SRE | artefacto antes del pipeline; rollback, incidentes y supply chain |
| rutaflow | combinación de los proyectos anteriores | contratos oficiales de cada integración | flujo extremo a extremo, compatibilidad, fallo y recuperación semántica |

## Primer lote aplicado: Android 0, temas 4–5

Los temarios públicos de cursos Android completos coinciden en enseñar Kotlin antes
de Compose y en progresar corrutinas desde scope/suspensión hasta dispatchers,
cancelación, errores, Retrofit y Room. Se contrastó esa secuencia con
[Android Basics with Compose](https://developer.android.com/courses/android-basics-compose/course),
[Kotlin Coroutines](https://kotlinlang.org/docs/coroutines-basic-jvm.html) y las
[pruebas de corrutinas en Android](https://developer.android.com/kotlin/coroutines/test).

Cambios realizados:

- Kotlin ya no promete dominio total ni usa una tarea Gradle incompatible; crea
  modelo y tests dentro del módulo Android real, explica nulabilidad, inmutabilidad,
  colecciones, enum/sealed y criterios de elección.
- Corrutinas ya no se reducen a `delay`: explica concurrencia estructurada,
  propietario, cancelación y dispatchers; el ejemplo prueba dos operaciones con
  tiempo virtual y convierte serialización accidental en un fallo observable.
- Ambos temas conectan el fundamento con RutaFlow y una práctica independiente de
  nivel profesional, sin copiar proyectos de los cursos consultados.

## Segundo lote aplicado: Android 16, seis vacíos de producción

La comparación del track completo con las rutas oficiales de calidad de Android y
con temarios públicos actuales reveló seis capacidades que no estaban enseñadas como
temas autónomos. Se añadió **Android profesional: privacidad, datos, escala e
identidad**, con práctica desde cero y transferencia al proyecto RutaFlow:

1. permisos en tiempo de ejecución y alternativas que evitan pedirlos;
2. DataStore, migración desde `SharedPreferences` y límites frente a Room;
3. Paging 3, `LoadState` y `RemoteMediator` con base local como fuente de verdad;
4. FCM, `POST_NOTIFICATIONS`, renovación de token y reconciliación idempotente;
5. layouts adaptativos para teléfono, tablet, ventana dividida y foldable;
6. Credential Manager, passkeys, challenge de un solo uso y verificación en servidor.

Las referencias primarias contrastadas fueron las guías de
[permisos](https://developer.android.com/training/permissions/requesting),
[DataStore](https://developer.android.com/topic/libraries/architecture/datastore),
[Paging](https://developer.android.com/topic/libraries/architecture/paging/v3-overview),
[FCM](https://firebase.google.com/docs/cloud-messaging/android/get-started),
[calidad adaptativa](https://developer.android.com/develop/adaptive-apps/quality-guidelines/core-app-quality)
y [Credential Manager](https://developer.android.com/identity/sign-in/credential-manager).
Los catálogos de cursos y libros se usaron para detectar secuencia y expectativas de
alcance, no para copiar contenido protegido. La explicación, el código, los fallos y
las prácticas del módulo son propios del repositorio.

## Cola y regla de avance

La línea base de sustancia contiene la cola medible. Se trabaja por módulos para no
romper continuidad: primero fundamentos de entrada y temas con andamiaje genérico;
después integración y operación. Cada lote debe reducir la línea base, regenerar
reportes, ejecutar `./scripts/validate.sh`, construir Angular y correr las pruebas
relevantes. No se declarará que los 1.106 temas alcanzaron profundidad profesional
hasta que la cola sea cero y exista revisión pedagógica humana separada.
