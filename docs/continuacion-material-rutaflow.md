# Continuación del material de Proyecto-RutaFlow

Se retomó desde `5716e55`, conservando la limpieza y las correcciones Markdown de Claude. El registro pegado de la otra sesión se usó para comprender el estado, no para ejecutar sus antiguos comandos ni considerar terminada la investigación que falló por cuota. La electrónica conserva su pausa.

## Referencias examinadas

La carpeta contiene 37 archivos útiles para inventario: 35 imágenes y dos PDF iguales por SHA-256; hay 35 archivos únicos por contenido. Se aplicó OCR a las 33 imágenes iniciales y se revisaron visualmente las dos capturas técnicas añadidas: estrategias de despliegue de Kubernetes y Clean Architecture/DDD con Spring Boot. El índice describe recursos promocionales, materiales ajenos al currículo y contenido personal por separado. No se publicaron las imágenes ni su OCR personal.

El detalle verificable de archivo → destino está en [rutaflow-source-index.md](rutaflow-source-index.md), con hashes y clasificación en el JSON contiguo. El PDF conserva su índice de 69 páginas. Localizar un término en una lección no prueba por sí solo que esté bien explicado o ejecutado.

## Implementación

Se añadieron once temas y sus ejemplos: gateway Socket.IO compatible con Dart, ChatClient/herramientas Spring AI, frontera de recuperación RAG, records C#, contrato OSRM, compensaciones recuperables, latencia/throughput, referencias opacas de pago, diagnóstico de dispositivo Android, A/B y shadow traffic, y Clean Architecture/DDD táctico. La academia pasa de 1.073 a 1.084 temas, manteniendo 241 módulos y 14 rutas.

Se corrigió la incoherencia documentada Socket.IO/STOMP: Flutter 14 ahora señala el gateway Socket.IO y Spring 14 mantiene su variante STOMP identificada como distinta. No se restauraron el selector de etapas duplicado, el índice derecho ni `/roadmaps` retirados por Claude.

La captura sobre records no se reinterpretó como Java: se añadió código C# y se explica la copia superficial y la mutabilidad. Las afirmaciones promocionales sobre tokenización, benchmarks y versiones se contrastaron con documentación primaria o se dejaron como no verificadas.

La captura de despliegues no se duplicó como un temario aislado: rolling, recreate,
blue/green y canary ya estaban repartidos entre DevOps 5 y 7; se añadió el tema
faltante de A/B y shadow con prueba Node. La captura de Clean Architecture se
convirtió en un tema de Spring Boot 15 con un caso de uso Java compilable sin
framework y una frontera explícita para JPA/H2.

## Evidencia y límites

- Spring AI 2.0.2, JDK 25 y Spring Boot 4.0.9: cuatro tests Maven correctos de ChatClient, callback y recuperación autorizada. Modelo controlado y recuperación léxica: no se ejecutó un LLM ni un vector store.
- Socket.IO: prueba Node real correcta; Dart 3.13 con socket_io_client 3.1.6 analizado sin incidencias, suscripción aceptada y posición recibida después de publicar por HTTP. No se probó una UI Flutter en teléfono físico.
- Python: dos pruebas del contrato OSRM y una prueba de recuperación de compensación correctas. OSRM usa fixture sintética: dataset y motor Docker quedan pendientes.
- Node: dos tests de contrato de pago correctos y benchmark local de 12 peticiones por caso ejecutado. No se efectuaron cobros ni se prometió capacidad de producción.
- C#: código y proyecto .NET 10 presentes; compilación pendiente por falta del SDK. La descarga temporal se interrumpió, sin instalar herramientas globales.
- Android: ADB no encontró dispositivos conectados; diagnóstico físico pendiente. No se desactivaron protecciones ni se simuló una atestación.
- Web: los once temas nuevos se abrieron por su encabezado en Chrome sin estado de error; ancho móvil de RutaFlow 5 comprobado a 390 px. Build y 14 pruebas unitarias correctos. Las 42 pruebas E2E de Chrome pasaron en escritorio/móvil con cierre normal. El build conserva un aviso de 619 kB frente a presupuesto de 600 kB.
- Node: el laboratorio A/B y shadow pasó su prueba local; JDK25 compiló y ejecutó el caso de uso de Clean Architecture sin Spring, JPA ni H2.
- `./scripts/validate.sh` correcto, con las cuatro omisiones PostgreSQL ya documentadas. El nuevo control comprueba origen y coincidencia de código, sin declarar todos los temas ejecutados. Los reportes mantienen los marcadores no detectados; no se relajaron para poner este lote en verde.

La verificación por tema vive en `examples/rutaflow-material/verification.json`. Quedan separadas la prueba técnica, la cobertura de una referencia y la revisión pedagógica con personas principiantes.

## Revisión de continuación — 2026-11-03

Se revisó el prompt maestro recibido como material de referencia y se documentaron
sus contradicciones, diferencias de conteo y verificaciones citadas que no existen
en el repositorio en [revision-prompt-academia.md](revision-prompt-academia.md).
El inventario vigente es 14 rutas, 241 módulos y 1.084 temas; el control
`validate_requested_master_topics.py` cubre 75 filas en 12 rutas y no demuestra
la meta de 1.800 ni la cobertura de todos los cursos.

La inspección visual de escritorio encontró que la barra de progreso atravesaba
el contenido al desplazarse. Se ajustó al borde superior. Se retiraron seis
binarios Java generados y `clean-architecture/test.sh` ahora compila en una
carpeta temporal. Las pruebas Node y Java de esos ejemplos habían pasado antes
de esta anotación.

En esta continuación, Chrome fue cerrado por el entorno antes de completar la
prueba E2E; no se cuenta como validación E2E. La ejecución anterior de 42 pruebas
indicada arriba corresponde a la sesión anterior y no valida el cambio CSS de
esta fecha. No se verificó en esta sesión un viewport móvil con navegador.

## Revisión pedagógica siguiente — 2026-11-03

Se corrigió el perfil editorial de los seis temas que el auditor marcaba como
no practicables. Android diagnóstico, A/B/shadow, latencia/throughput, Socket.IO,
tokenización de pagos y Clean Architecture ahora muestran transferencia al
proyecto correspondiente; cuatro tienen un mapa de flujo que explica límites,
no una ilustración decorativa. El auditor reconoció rutas `.mjs` y `.cjs`, antes
omitidas pese a que el material ya las nombraba. Perfil estructural: 1.098/1.098.

La auditoría de sustancia sigue marcando 476 temas para revisión y detecta
apéndices heredados en 184/245 módulos. Son señales automatizadas para priorizar,
no una evaluación humana. La suite E2E de 46 pruebas se intentó después del
rebase; Chrome recibió `SIGKILL` al iniciar, antes de abrir páginas. No se cuenta
como resultado de navegación ni como inspección visual posterior al ajuste de la
barra de progreso.

Compilación Angular, 17 pruebas unitarias, `./scripts/validate.sh`, cinco
laboratorios locales relevantes y `test.sh` de Java pasan. El bundle inicial
sigue por encima del presupuesto configurado.

## Simplificación para principiantes — 2026-11-03

Se redujo la introducción de Cloud 0: la primera práctica solo requiere la
terminal; Node.js y Docker aparecen cuando se necesitan. Los temas 1–3 ahora
explican rutas, carpetas, servidor y respuestas HTTP con frases sencillas,
comandos visibles para macOS/Linux y PowerShell, y una bitácora con resultados
reales. El Tema 2 se probó desde un directorio temporal: `/salud` devolvió 200,
una ruta ausente devolvió 404 y la ampliación `/version` funcionó. El comando de
creación y lectura de `saludo.txt` también pasó en Bash.

Se amplió la auditoría para aceptar los comandos de terminal usados en estos
ejemplos y la extensión `.txt`. `./scripts/validate.sh` pasa con 23 pruebas
unitarias auxiliares (4 omitidas). El perfil editorial marca 1.096/1.098 temas
practicables (2 pendientes) y la metodología 1.095/1.098 completos (3 pendientes).
La revisión de navegador sigue pendiente: Chrome es terminado
por el entorno antes de abrir las páginas.

En esta pasada se simplificaron los temas 4–6 de Cloud 0. El tema de Floci ahora
enciende, consulta y detiene solo el servicio AWS definido en el Compose del
proyecto; el siguiente tema enseña a leer los tres nombres y puertos; el tercero
separa una respuesta local de lo que aún no se ha probado. Se quitaron párrafos
repetidos y diagramas extensos, y se añadieron comandos y resultados que el alumno
puede registrar. El archivo JavaScript pasó `node --check` y respondió `200` ante
un servidor HTTP de prueba local; eso solo verifica el ejemplo de código, no Floci.
La validación completa y los índices regenerados pasan. No se pudieron ejecutar
los comandos Docker en este entorno porque el ejecutable `docker` no está
instalado; esa práctica queda pendiente de ejecución real.
