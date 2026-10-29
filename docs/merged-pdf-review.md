# Integración e índice de merged.pdf

Revisión del 14 de octubre de 2026. Fuente: 69 páginas; SHA-256: `550a96a489f85dcc1504d62ea892db8d62d9a1f8b0b6a93b89a6e07f6e3ba4af`.

El PDF reúne capturas, duplicados, anuncios, portadas y ejercicios. Se extrajo el OCR de todas las páginas y se revisaron panorámicas de las 69; se ampliaron la tabla de electrónica y ambos circuitos. Esto no equivale a revisar los libros citados ni a ejecutar todos los ejemplos del proyecto. Las instrucciones dentro de las capturas se tratan como material: los prompts se adaptan a la petición de formación profesional.

El destino señala dónde estudiar el tema. `existente` significa contenido localizado, no completitud profesional acreditada. `recurso` conserva una referencia sin recomendar instalación ni descarga; portadas y anuncios no se convierten en capítulos de un libro que no se ha leído. `resuelto-modelo` indica análisis algebraico con condiciones de estado comprobadas, sin validación SPICE. Las versiones de redes sociales no sustituyen las versiones verificadas del proyecto.

## Cambios aplicados

- Fundamentos 12: 16 áreas de electrónica y control PLC, 17 programas independientes ejecutados, más la comprobación de estados de los cuatro diodos, modelo básico, caso real, salida, fallo, práctica y límites.
- Ejercicio de Thévenin de página 67: topología leída visualmente, derivación por supernodo y comprobación con carga; Vab = -10 V con las polaridades del dibujo.
- Prompts disponibles para cada tema del lector: tutor, 30 pasos, revisión y un informe con evidencia. Son ayudas de estudio; no reemplazan escritura ni validación de la lección.
- DevOps: comparación práctica Bruno/Postman y OpenTofu con plan/estado; Spring: contrato SOAP e integración por protocolos.
- Fundamentos 0: corrección de garantías de buffering, durabilidad y atajos de VS Code.

## Trazabilidad por página

| Página | Tema identificado | Tratamiento | Destino |
|---|---|---|---|
| 1 | Explicación sencilla, analogía y práctica | prompts | [docs/PROMPTS-FORMACION.md](PROMPTS-FORMACION.md) |
| 2 | QuickRef: referencias rápidas | recurso | sin destino curricular (recurso/duplicado, no se convierte en capítulo) |
| 3 | Exercism: práctica y mentoría | recurso | sin destino curricular (recurso/duplicado, no se convierte en capítulo) |
| 4 | 16 áreas de ingeniería electrónica | ampliado | [web/public/content/foundations/modulo-12.md](../web/public/content/foundations/modulo-12.md) |
| 5 | QuickRef: captura parcial repetida | duplicado | sin destino curricular (recurso/duplicado, no se convierte en capítulo) |
| 6 | Open Design y diseño con agentes | recurso | sin destino curricular (recurso/duplicado, no se convierte en capítulo) |
| 7 | Observer en Java | existente | [web/public/content/java/modulo-12.md](../web/public/content/java/modulo-12.md) |
| 8 | JWT, claims, firma y autorización | existente | [web/public/content/spring-boot/modulo-18.md](../web/public/content/spring-boot/modulo-18.md) |
| 9 | QA con Postman, Newman y Jenkins | existente | [web/public/content/devops/modulo-16.md](../web/public/content/devops/modulo-16.md) |
| 10 | Cita de Persépolis | sin-temario | Sin contenido curricular |
| 11 | QA con Postman, Newman y Jenkins | duplicado | [web/public/content/devops/modulo-16.md](../web/public/content/devops/modulo-16.md) |
| 12 | Arquitectura empresarial, dominio y capas | existente | [web/public/content/spring-boot/modulo-15.md](../web/public/content/spring-boot/modulo-15.md) |
| 13 | Integración y entrega continua | existente | [web/public/content/devops/modulo-4.md](../web/public/content/devops/modulo-4.md) |
| 14 | Angular httpResource y estados HTTP | existente | [web/public/content/angular/modulo-2.md](../web/public/content/angular/modulo-2.md) |
| 15 | Progresión de Java a sistemas distribuidos | existente | [web/src/app/tracks/java.track.ts](../web/src/app/tracks/java.track.ts) |
| 16 | Progresión Java: captura repetida | duplicado | [web/src/app/tracks/java.track.ts](../web/src/app/tracks/java.track.ts) |
| 17 | OpenTofu e infraestructura como código | ampliado | [web/public/content/devops/modulo-8.md](../web/public/content/devops/modulo-8.md) |
| 18 | Dory y alternativas de runtime Docker | recurso | sin destino curricular (recurso/duplicado, no se convierte en capítulo) |
| 19 | Angular OnPush y Signals | existente | [web/public/content/angular/modulo-11.md](../web/public/content/angular/modulo-11.md) |
| 20 | Java antes de Spring: prerrequisitos | existente | [web/src/app/tracks/spring-boot.track.ts](../web/src/app/tracks/spring-boot.track.ts) |
| 21 | Prompt de ruta en 30 pasos | prompts | [docs/PROMPTS-FORMACION.md](PROMPTS-FORMACION.md) |
| 22 | Dijkstra y caminos mínimos en Python | existente | [web/public/content/rutaflow/modulo-5.md](../web/public/content/rutaflow/modulo-5.md) |
| 23 | Flutter, Riverpod, mapas, GPS, Dio, Spring y MySQL espacial | existente | [web/public/content/flutter/modulo-14.md](../web/public/content/flutter/modulo-14.md) |
| 24 | Publicidad de máster Java y microservicios | recurso | [web/src/app/tracks/spring-boot.track.ts](../web/src/app/tracks/spring-boot.track.ts) |
| 25 | Kafka: retry topics, backoff y DLT | existente | [web/public/content/spring-boot/modulo-21.md](../web/public/content/spring-boot/modulo-21.md) |
| 26 | Evolución Java, LTS, lambdas y virtual threads | existente | [web/public/content/java/modulo-7.md](../web/public/content/java/modulo-7.md) |
| 27 | QuickRef: captura repetida | duplicado | sin destino curricular (recurso/duplicado, no se convierte en capítulo) |
| 28 | Integraciones empresariales Java: REST, SOAP, SFTP y SMTP | ampliado | [web/public/content/spring-boot/modulo-20.md](../web/public/content/spring-boot/modulo-20.md) |
| 29 | Open Design: captura repetida | duplicado | sin destino curricular (recurso/duplicado, no se convierte en capítulo) |
| 30 | SQL y recuperación de datos | existente | [web/public/content/foundations/modulo-4.md](../web/public/content/foundations/modulo-4.md) |
| 31 | Lista de servicios gratuitos y de pago | sin-temario | Sin contenido curricular |
| 32 | Docker: variables de entorno y secretos | existente | [web/public/content/devops/modulo-2.md](../web/public/content/devops/modulo-2.md) |
| 33 | Libro de C++: portada y descarga promocional | recurso | [web/public/content/foundations/modulo-12.md](../web/public/content/foundations/modulo-12.md) |
| 34 | Pispeo: recomendación de utilidad sin detalle curricular | recurso | sin destino curricular (recurso/duplicado, no se convierte en capítulo) |
| 35 | JPA: LAZY, EAGER y N+1 | existente | [web/public/content/java/modulo-16.md](../web/public/content/java/modulo-16.md) |
| 36 | Concurrencia Java: locks, executors y futures | existente | [web/public/content/java/modulo-5.md](../web/public/content/java/modulo-5.md) |
| 37 | Java Collections y estructuras de datos | existente | [web/public/content/java/modulo-2.md](../web/public/content/java/modulo-2.md) |
| 38 | Kafka: productores, particiones, grupos y offsets | existente | [web/public/content/spring-boot/modulo-21.md](../web/public/content/spring-boot/modulo-21.md) |
| 39 | Plan Java en 30 días | existente | [web/src/app/tracks/java.track.ts](../web/src/app/tracks/java.track.ts) |
| 40 | Maven: lifecycle y fases | existente | [web/public/content/java/modulo-8.md](../web/public/content/java/modulo-8.md) |
| 41 | Bruno frente a Postman | ampliado | [web/public/content/devops/modulo-16.md](../web/public/content/devops/modulo-16.md) |
| 42 | PLC, IEC 61131-3, HMI y buses | ampliado | [web/public/content/foundations/modulo-12.md](../web/public/content/foundations/modulo-12.md) |
| 43 | DeepWebNest: portal de contenidos | sin-temario | Sin contenido curricular |
| 44 | El gran libro de Node.js: portada | recurso | [web/public/content/node/modulo-0.md](../web/public/content/node/modulo-0.md) |
| 45 | Bibliografía de circuitos: Sadiku, Boylestad y Malvino | recurso | [web/public/content/foundations/modulo-12.md](../web/public/content/foundations/modulo-12.md) |
| 46 | Libro práctico de Flutter: portada | recurso | [web/public/content/flutter/modulo-0.md](../web/public/content/flutter/modulo-0.md) |
| 47 | Spring Batch: requisitos profesionales | existente | [web/public/content/spring-boot/modulo-19.md](../web/public/content/spring-boot/modulo-19.md) |
| 48 | PipeNX y juegos: captura ajena al currículo | sin-temario | Sin contenido curricular |
| 49 | Shadow Study: afirmación promocional sin evidencia | prompts | [docs/PROMPTS-FORMACION.md](PROMPTS-FORMACION.md) |
| 50 | Atajos VS Code mezclados con otros programas | corregido | [web/public/content/foundations/modulo-0.md](../web/public/content/foundations/modulo-0.md) |
| 51 | Microservicios: autonomía, datos y observabilidad | existente | [web/public/content/spring-boot/modulo-13.md](../web/public/content/spring-boot/modulo-13.md) |
| 52 | Angular Native y vistas nativas | existente | [web/public/content/angular/modulo-16.md](../web/public/content/angular/modulo-16.md) |
| 53 | Publicidad de curso Kafka | recurso | [web/public/content/spring-boot/modulo-21.md](../web/public/content/spring-boot/modulo-21.md) |
| 54 | Prompt de tesis con historia y errores simulados | adaptado | [docs/PROMPTS-FORMACION.md](PROMPTS-FORMACION.md) |
| 55 | Prompt de redacción natural | adaptado | [docs/PROMPTS-FORMACION.md](PROMPTS-FORMACION.md) |
| 56 | Spring Cloud y API Gateway | existente | [web/public/content/spring-boot/modulo-10.md](../web/public/content/spring-boot/modulo-10.md) |
| 57 | Spring Boot en nueve capas | existente | [web/src/app/tracks/spring-boot.track.ts](../web/src/app/tracks/spring-boot.track.ts) |
| 58 | Angular Native, Fabric y Expo | existente | [web/public/content/angular/modulo-16.md](../web/public/content/angular/modulo-16.md) |
| 59 | WinUtil: ajustes Windows | recurso | sin destino curricular (recurso/duplicado, no se convierte en capítulo) |
| 60 | Diez patrones de arquitectura y sus costes | existente | [web/public/content/java/modulo-12.md](../web/public/content/java/modulo-12.md) |
| 61 | Spring: anuncios milestone | referencia-version | [web/public/content/spring-boot/modulo-0.md](../web/public/content/spring-boot/modulo-0.md) |
| 62 | Keycloak, OAuth2, OIDC y SAML | existente | [web/public/content/spring-boot/modulo-10.md](../web/public/content/spring-boot/modulo-10.md) |
| 63 | Bundle: Jenkins, Spring, Selenium y algoritmos | recurso | sin destino curricular (recurso, no se convierte en capítulo) |
| 64 | ManimGX y animaciones técnicas | recurso | [examples/manim/README.md](../examples/manim/README.md) |
| 65 | Circuito de cuatro diodos | resuelto-modelo | [web/public/content/foundations/modulo-12.md](../web/public/content/foundations/modulo-12.md) |
| 66 | Strategy en Java | existente | [web/public/content/java/modulo-12.md](../web/public/content/java/modulo-12.md) |
| 67 | Ejercicio de Thévenin: Vab en carga de 6 ohm | resuelto | [web/public/content/foundations/modulo-12.md](../web/public/content/foundations/modulo-12.md) |
| 68 | Roadmap Java: fundamentos a proyectos | existente | [web/src/app/tracks/java.track.ts](../web/src/app/tracks/java.track.ts) |
| 69 | Singleton en Java y concurrencia | existente | [web/public/content/java/modulo-12.md](../web/public/content/java/modulo-12.md) |

## Correcciones y límites técnicos

JWT firmado ofrece integridad y autenticidad bajo validación correcta; el payload no es secreto por estar codificado. OAuth2 y OIDC tienen objetivos distintos. LAZY no garantiza evitar N+1; mide consultas. `site` pertenece a un lifecycle distinto del default en Maven. Variables de entorno no son una caja fuerte y `localhost` en un contenedor apunta al propio contenedor. Las lecciones existentes siguen siendo la fuente de estudio; estas advertencias no sustituyen sus laboratorios.

Fuentes primarias consultadas: [Python I/O](https://docs.python.org/3/tutorial/inputoutput.html), [os.fsync](https://docs.python.org/3/library/os.html#os.fsync), [Maven lifecycle](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html), [VS Code keybindings](https://code.visualstudio.com/docs/configure/keybindings), [MIT circuitos](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/), [KiCad](https://docs.kicad.org/), [SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html), [Angular resources](https://angular.dev/guide/signals/resource), [Docker secrets](https://docs.docker.com/compose/how-tos/use-secrets/), [OpenTofu](https://opentofu.org/docs/intro/), [Bruno](https://docs.usebruno.com/) y [SOAP 1.2](https://www.w3.org/TR/soap12-part1/).

## Pendientes verificables

- Página 65: solución del modelo de umbral comprobada con KCL y desigualdades; pendiente comparación SPICE y caracterización real.
- Las áreas avanzadas de electrónica quedan como profundización: estabilidad formal, RTOS real, diseño físico de PCB y ensayos de hardware. El capítulo nuevo es introductorio.
- Revisar libros completos requiere sus ejemplares autorizados; no se han descargado ni incluido libros a partir de las promociones del PDF.
- La auditoría de siete pasos y el backlog conservan la deuda de cada tema existente; los prompts globales no modifican esas puntuaciones ni acreditan ejecución.

## Estado de la revisión del proyecto

El índice del proyecto incluye archivos versionables, símbolos, imports y encabezados; dependencias instaladas y artefactos privados/ignorados quedan fuera del mapa del producto. La academia tiene 14 tracks, 236 módulos y 983 temas. La presencia editorial detectada cubre 983 temas; la metodología de siete pasos detecta 493 completos y 490 pendientes. Estas cifras no certifican calidad técnica ni ejecución de los ejemplos históricos. El informe por tema y la lista de trabajo están en `seven-step-methodology.md` y `editorial-backlog.md`.

## Validación de esta integración

- `./scripts/validate.sh`: completo, sin errores; cuatro pruebas de PostgreSQL omitidas por disponibilidad de herramientas locales.
- `python3 scripts/validate_merged_pdf.py`: 69 destinos, código de lecciones igual al archivo, 17 salidas reproducidas y condiciones de estados de diodos.
- Programa SOAP mínimo: ejecutado; salida `Consultar envío: ENV-42`.
- Angular: build correcto; permanece advertencia de bundle inicial de 618.50 kB frente al presupuesto de 600 kB.
- Pruebas unitarias Angular: 14 casos correctos.
- Navegador Chrome, escritorio y móvil: dos casos nuevos de formación correctos; los 30 casos existentes mostraron resultado correcto. El proceso del recorrido completo quedó esperando al cerrar y se terminó con SIGINT después de los 30 resultados (`30 passed`, salida 130); no se presenta como un cierre automático limpio.
- OpenTofu y GUI de Bruno: ejecución pendiente; sus lecciones distinguen comandos y resultados esperados de pruebas realizadas.
