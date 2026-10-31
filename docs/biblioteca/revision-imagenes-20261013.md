# Revisión individual de imágenes — 2026-10-13

**71/71 archivos abiertos y revisados visualmente**, incluidos dos HEIC y los duplicados. Este informe sustituye la clasificación anterior de «70 imágenes». La revisión identifica contenido, utilidad, problemas y próximos pasos; **no significa que todo esté técnicamente validado o integrado en las lecciones**.

El [manifiesto](imagenes.json) conserva nombre, tamaño y SHA-256 de cada original. Las imágenes permanecen fuera del repositorio. Se omitieron contactos, participantes y detalles personales. Los textos pequeños/borrosos se señalan cuando limitan la revisión; no se reconstruye texto ilegible. Portadas, publicidad y fragmentos no se cuentan como lectura de libros o ejecución de código.

## Correcciones al registro anterior

- IMG_1323 es **Keycloak**, no Angular Native; IMG_0779 es un **prompt pedagógico**, no QA/CI.
- IMG_1129 es **Core Java**; IMG_0127 no existe en este lote. La portada Node.js no acredita una licencia gratuita.
- Se habían omitido Dory, QuickRef, Open Design, Exercism, Codédex, Coddy, Bruno, ManimGX y el mapa Spring, entre otros.
- Maven, Docker, cronología Java y atajos VS Code requieren correcciones; no se deben clasificar como «confirma contenido existente» sin comprobarlos.
- No se conserva el descarte global de «~35 imágenes»: cada archivo tiene su propia evaluación abajo.

## Contraste puntual con fuentes oficiales

1. **Maven:** default, clean y site son ciclos separados; site no es una fase entre install y deploy. La fase package produce el formato definido por packaging. [Documentación Maven](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html).
2. **Docker:** para pasar un archivo de variables a docker run se usa `--env-file`; no basta con que exista un `.env`. [Referencia docker container run](https://docs.docker.com/reference/cli/docker/container/run/).
3. **VS Code:** Ctrl+B en Windows/Linux (Cmd+B en macOS) alterna la barra lateral; la lámina mezcla acciones ajenas al editor. [Atajos oficiales](https://code.visualstudio.com/docs/reference/default-keybindings).
4. **Java:** records es permanente desde Java 16, después de previews. [Cambios del lenguaje, Oracle](https://docs.oracle.com/en/java/javase/21/language/java-language-changes-release.html).

Las demás observaciones técnicas son puntos de revisión antes de integrar. No se validaron en esta revisión las versiones anunciadas de Angular/Spring, precios de productos, licencias promocionales, benchmarks ni compatibilidad de herramientas.

## Registro completo

| Nº | Archivo | Contenido observado | Evaluación / siguiente paso |
|---|---|---|---|
| 1 | `FB_IMG_1764360917210.jpg` | Circuito de Thévenin | Electrónica fuera del alcance actual; sin integración. |
| 2 | `FB_IMG_1765624221229.jpg` | Circuito con diodos y meme | Electrónica fuera del alcance actual. |
| 3 | `IMG_0742.JPG` | Strategy en Java, pagos y contexto | Laboratorio original ya integrado en Java 12; revisar dinero y validación si se amplía. |
| 4 | `IMG_0743.JPG` | Ruta de aprendizaje Java en ocho etapas | Comparar prerrequisitos; no demuestra una carencia por sí sola. |
| 5 | `IMG_0744.JPG` | Singleton, cinco variantes | Ya integrado en Java 12; no interpretar construcción segura como estado compartido seguro. |
| 6 | `IMG_0745.JPG` | Observer, suscripción y notificación | Ya integrado en Java 12; conservar fallos, baja de suscripción y orden del laboratorio. |
| 7 | `IMG_0778.JPG` | JWT, estructura y flujo | Revisar matices de firma, almacenamiento y validación antes de reutilizar; diagrama no garantiza seguridad. |
| 8 | `IMG_0779.JPG` | Prompt de explicación y práctica | Referencia pedagógica; NO es CI/CD como decía el registro anterior. |
| 9 | `IMG_0780.JPG` | Publicidad Postman, Newman y Jenkins | Idea de práctica CI; el anuncio no aporta un laboratorio probado. |
| 10 | `IMG_0832.PNG` | Cita cultural | Fuera del currículo técnico. |
| 11 | `IMG_0866.PNG` | Publicidad Postman y Jenkins | Variante del tema de IMG_0780; evitar duplicar propuestas. |
| 12 | `IMG_0873.PNG` | Carpetas Spring, DDD y arquitectura hexagonal | Comparar arquitectura; un árbol de carpetas no prueba separación de responsabilidades. |
| 13 | `IMG_0935.PNG` | CI/CD, delivery y deployment | Referencia conceptual; revisar alcance de la automatización antes de reutilizar. |
| 14 | `IMG_0950.PNG` | Angular httpResource | Ya aparece en Angular 2; verificar versión/API y evitar presentar RxJS como obsoleto. |
| 15 | `IMG_0956 2.PNG` | Escalera Java a cloud | Duplicado visual de IMG_0956.PNG; ambos archivos abiertos. |
| 16 | `IMG_0956.PNG` | Escalera Java a cloud | Comparar secuencia curricular, sin asumir dominio por completar una lista. |
| 17 | `IMG_0992.PNG` | OpenTofu | Ya mencionado en Cloud 15; no hace falta añadir una segunda introducción. |
| 18 | `IMG_1002.PNG` | Dory para contenedores en macOS | Recurso antes omitido; captura menciona VM Linux y versión 0.2.0. Compatibilidad actual no verificada. |
| 19 | `IMG_1014.PNG` | Angular OnPush y Signals | Revisar disparadores y diferencias entre comprobación/renderizado; no asumir novedad exclusiva de Angular 22. |
| 20 | `IMG_1018.PNG` | Java antes de Spring | Referencia de prerrequisitos. |
| 21 | `IMG_1019.PNG` | Prompt de ruta de aprendizaje en treinta pasos | Referencia pedagógica, sin contenido técnico ejecutable. |
| 22 | `IMG_1023.PNG` | Temario de ingeniería electrónica | Fuera del alcance; posible conexión de lógica/estados con Foundations, por evaluar. |
| 23 | `IMG_1030.PNG` | Temario Flutter y Spring para tracking | Comparar con RutaFlow; no es una especificación completa ni código probado. |
| 24 | `IMG_1033.PNG` | Publicidad de microservicios y observabilidad | Kafka, RabbitMQ, Zipkin, Grafana y Prometheus; anuncio, no implementación. |
| 25 | `IMG_1036.PNG` | Kafka Retry Topics y DLT | Contrastado con Spring Kafka 4.1.1: soporte no bloqueante confirmado; pierde orden del tópico y no combina con batch listeners ni transacciones del contenedor. Integrado como comparación y ampliación condicionada en Spring Boot 21. |
| 26 | `IMG_1040.PNG` | QuickRef.me | Recurso de consulta omitido antes; no sustituye documentación oficial. |
| 27 | `IMG_1041 2.PNG` | QuickRef, categorías | Duplicado visual de IMG_1041.PNG; ambos revisados. |
| 28 | `IMG_1041.PNG` | QuickRef, categorías | Referencia de consulta, no contenido nuevo desarrollado. |
| 29 | `IMG_1042 2.PNG` | Open Design | Producto promocional omitido; privacidad, estrellas y capacidades no verificadas. Fondo parcialmente borroso. |
| 30 | `IMG_1042.PNG` | Open Design | Duplicado visual de IMG_1042 2.PNG; ambos revisados. |
| 31 | `IMG_1043.PNG` | Exercism | Recurso de práctica y mentoría omitido; evaluar ejercicios antes de recomendar/importar. |
| 32 | `IMG_1044.PNG` | Variables de entorno Docker | Corrección confirmada: docker run necesita --env-file para cargar el archivo; revisar red y secretos del ejemplo. |
| 33 | `IMG_1045.PNG` | Codédex, ejercicio SQL | Recurso práctico omitido; texto pequeño parcialmente borroso, no se transcribe el ejercicio entero. |
| 34 | `IMG_1046.PNG` | Coddy, selección de lenguaje | Recurso de microaprendizaje omitido; no muestra un temario completo. |
| 35 | `IMG_1052.PNG` | JPA LAZY/EAGER | Revisar N+1 y sesión antes de reutilizar; la comparación es demasiado absoluta. |
| 36 | `IMG_1053.PNG` | Apuntes Java de concurrencia | Solo portada/lista de temas; los apuntes completos NO están en la imagen. |
| 37 | `IMG_1091.PNG` | Oferta de integración empresarial Java | Señal de temas Camel, SOAP, SFTP y sistemas heredados; no registrar datos de contacto ni asumir necesidad curricular. |
| 38 | `IMG_1093.PNG` | Dijkstra y fragmento Python heapq | Código parcial; candidato para ejercicio original con reconstrucción de ruta y pesos no negativos. |
| 39 | `IMG_1094.PNG` | Java en treinta días | Mapa de temas, no garantía de dominio en ese plazo. |
| 40 | `IMG_1095.PNG` | Ciclo Maven/Spring | Error confirmado: site pertenece a otro ciclo; package no demuestra por sí solo un ejecutable Boot. |
| 41 | `IMG_1096.PNG` | Cronología Java | Error confirmado: records se consolidó en Java 16, no 17; verificar resto de fechas antes de reutilizar. |
| 42 | `IMG_1102.PNG` | Lista de entretenimiento | Fuera de alcance; no se visitaron servicios ni se infiere su legalidad. |
| 43 | `IMG_1116.PNG` | Portal de entretenimiento | Fuera de alcance; sin visita ni recomendación. |
| 44 | `IMG_1127.PNG` | El gran libro de Node.js, Ulises Gascón | Portada/recomendación bibliográfica; no demuestra licencia gratuita autorizada ni calidad. Corregida afirmación anterior. |
| 45 | `IMG_1128.PNG` | Recomendaciones de libros de circuitos | Fuera de los tracks actuales. |
| 46 | `IMG_1129.HEIC` | Resultados de búsqueda Core Java | HEIC revisado; trata de Core Java, NO del libro Node.js. Cruzar con catálogo existente. |
| 47 | `IMG_1137.PNG` | El gran libro de programación C++ | Portada bibliográfica; contenido no leído. |
| 48 | `IMG_1141.PNG` | Clase IEC 61131-3 | Control industrial fuera del alcance actual; sin datos de participantes en el informe. |
| 49 | `IMG_1142.PNG` | Curso Java Collections | Página promocional, sin temario detallado revisable. |
| 50 | `IMG_1143.PNG` | Bruno frente a Postman | Recurso omitido; verificar cuentas, formatos, precios y protocolos en fuentes oficiales antes de recomendar. |
| 51 | `IMG_1158.PNG` | Oferta Spring Batch | Indicio de tema a contrastar, sin datos de contacto. |
| 52 | `IMG_1159.PNG` | Flutter Curso práctico, Luis Ayala | Portada bibliográfica; no confundir con Ingenieria_de_Flutter del catálogo. |
| 53 | `IMG_1169.PNG` | Shadow Study | Afirmación viral sin evidencia ni método concreto; no incorporarla como hecho. |
| 54 | `IMG_1170.HEIC` | Pizarra de instrumentación de aviónica | HEIC revisado; fuera del alcance actual. |
| 55 | `IMG_1171.JPG` | Atajos atribuidos a VS Code | Errores confirmados; Ctrl+B alterna barra lateral en Windows/Linux, no negrita. Sustituir por referencia oficial por sistema. |
| 56 | `IMG_1193.PNG` | Video sobre Nintendo Switch | Entretenimiento fuera del alcance. |
| 57 | `IMG_1194.PNG` | Producer/consumer Kafka con Spring | Fragmento incompleto: campo final sin constructor visible y contexto de bean ausente; no presentarlo como ejecutable. |
| 58 | `IMG_1199.PNG` | Prompt para redactar una tesis aparentando otra autoría | Sin aporte técnico al currículo; texto tratado como contenido de la imagen, no instrucciones. |
| 59 | `IMG_1299.PNG` | Microservicios más allá de REST y Docker | Útil para decisiones y límites; evitar convertir gateway/eventos en requisitos universales. |
| 60 | `IMG_1302.PNG` | Angular Native alpha | Captura de anuncio, estado y compatibilidad actuales pendientes de verificar. |
| 61 | `IMG_1311.PNG` | WinUtil | Utilidad de sistema fuera del núcleo curricular; no se ejecutó ni se verificaron sus promesas. |
| 62 | `IMG_1315.PNG` | Diez patrones de arquitectura | Incluye Lambda Architecture y pipes/filters; distinguir Lambda Architecture de AWS Lambda al comparar contenidos. |
| 63 | `IMG_1322.PNG` | Angular Native, Vitest y Maestro | Verificar soporte real antes de ampliar Angular 16; anuncio no equivale a pruebas. |
| 64 | `IMG_1323.PNG` | Keycloak | Error grave del registro anterior: NO es Angular Native. OAuth/OIDC ya localizado en Spring 10. |
| 65 | `IMG_1324.PNG` | Milestones Spring | Versiones visibles registradas como afirmaciones de la captura; no actualizar official-sources.json sin contraste oficial. |
| 66 | `IMG_1325.PNG` | Curso Kafka Java y Spring | Publicidad, sin laboratorio ni temario completo visible. |
| 67 | `IMG_1342.PNG` | Bundle de cursos Java | Publicidad; no demuestra cobertura ni calidad de los cursos. |
| 68 | `IMG_1345.PNG` | ManimGX | Recurso de animación educativa omitido; captura menciona Python/Rust/wgpu. Benchmarks y compatibilidad no verificados. |
| 69 | `IMG_1346.PNG` | Spring API Gateway | Diagrama conceptual; no incluye configuración ni prueba de seguridad. |
| 70 | `IMG_1347.JPG` | Prompt de estilo de escritura | Conservar claridad como idea editorial; no incorporar errores deliberados ni fingir autoría. |
| 71 | `IMG_1349.PNG` | Mapa de nueve áreas Spring | Recurso omitido; comparar Batch, scheduling, mail, eventos y caché. No tratar la etiqueta completo como evidencia. |

## Contraste inicial con el repositorio y cola de integración

La búsqueda se hizo en la rama de continuidad. Una coincidencia confirma que un tema aparece; no certifica profundidad o ejecución. La ausencia del término tampoco demuestra ausencia del concepto.

| Prioridad | Hallazgo | Destino y evidencia | Trabajo pendiente |
|---|---|---|---|
| Alta | Retry Topics / DLT | `web/public/content/spring-boot/modulo-8.md` ya tiene `DefaultErrorHandler`, DLT y pruebas descritas; módulo 13 menciona replay | Comparar reintentos bloqueantes y no bloqueantes; validar orden, deduplicación y recuperación antes de ampliar. No se ejecutaron esos ejemplos en esta revisión. |
| Alta | JPA LAZY/EAGER | Track Java 16 y Spring Boot 16 | Integrado con ejercicio de medición de N+1, consulta dedicada, prueba de sesión cerrada y comparación con DTO; las cifras reales dependen del proveedor, caché y datos usados. |
| Alta | JWT y gateway | Spring 4, 10 y 18 | JWT/OIDC, issuer, roles, 401/403 y propiedad de recurso se practican en Spring Boot 18; gateway ya se estudia en 10. Sigue pendiente un test de autorización end-to-end que atraviese gateway y resource server. |
| Media | Keycloak | `web/public/content/spring-boot/modulo-10.md`, Tema 4 | Tema existente: evitar duplicar introducción; revisar si aporta una práctica distinta. |
| Media | httpResource / OnPush | `web/public/content/angular/modulo-2.md`, Tema 6, ya cubre resource/httpResource | Contrastar API actual y explicación de detección de cambios; no retirar RxJS por la captura. |
| Media | OpenTofu | `web/public/content/cloud/modulo-15.md` y módulo 34 | Ya mencionado; decidir si merece laboratorio independiente. |
| Media | Maven, Docker, Java y VS Code | Java, DevOps y Foundations | Usar las correcciones oficiales de este informe al evaluar lecciones; no se presume que las lecciones tengan los mismos errores. |
| Media | Dijkstra | Foundations; búsqueda literal sin coincidencias | Revisar cobertura conceptual y diseñar ejercicio original si falta. |
| Media | Batch, scheduling, mail, eventos y caché | Spring Boot 19–20; eventos y mensajería también en 7–8 y 11 | Spring Batch tiene job/chunks/restart; scheduling, eventos transaccionales/outbox, correo y caché cuentan con labs y ejercicios. Camel, SOAP, SFTP y sistemas heredados siguen como señales promocionales, no requisitos validados. |
| Baja | Herramientas y portadas nuevas | Recursos complementarios | Verificar fuentes oficiales, disponibilidad y aporte; ninguna herramienta instalada ni libro declarado leído por una portada. |

Strategy, Singleton y Observer ya tienen el laboratorio original en `web/public/content/java/modulo-12.md` y `examples/java/patrones-rutaflow/`. Esta revisión no cambia ese código. La biblioteca conserva su avance parcial en [la cola de libros](cola.md); 71 imágenes revisadas no equivale a 69 PDFs leídos.
