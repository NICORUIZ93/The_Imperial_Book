# Continuación del material de Proyecto-RutaFlow

Se retomó desde `5716e55`, conservando la limpieza y las correcciones Markdown de Claude. El registro pegado de la otra sesión se usó para comprender el estado, no para ejecutar sus antiguos comandos ni considerar terminada la investigación que falló por cuota. La electrónica conserva su pausa.

## Referencias examinadas

La carpeta contiene 35 archivos útiles para inventario: 33 imágenes y dos PDF iguales por SHA-256; hay 33 archivos únicos por contenido. Se aplicó OCR a todas las imágenes y se revisaron visualmente las seis capturas nuevas de la raíz. El índice describe recursos promocionales, materiales ajenos al currículo y contenido personal por separado. No se publicaron las imágenes ni su OCR personal.

El detalle verificable de archivo → destino está en [rutaflow-source-index.md](rutaflow-source-index.md), con hashes y clasificación en el JSON contiguo. El PDF conserva su índice de 69 páginas. Localizar un término en una lección no prueba por sí solo que esté bien explicado o ejecutado.

## Implementación

Se añadieron nueve temas y sus ejemplos: gateway Socket.IO compatible con Dart, ChatClient/herramientas Spring AI, frontera de recuperación RAG, records C#, contrato OSRM, compensaciones recuperables, latencia/throughput, referencias opacas de pago y diagnóstico de dispositivo Android. La academia pasa de 1.073 a 1.082 temas, manteniendo 241 módulos y 14 rutas.

Se corrigió la incoherencia documentada Socket.IO/STOMP: Flutter 14 ahora señala el gateway Socket.IO y Spring 14 mantiene su variante STOMP identificada como distinta. No se restauraron el selector de etapas duplicado, el índice derecho ni `/roadmaps` retirados por Claude.

La captura sobre records no se reinterpretó como Java: se añadió código C# y se explica la copia superficial y la mutabilidad. Las afirmaciones promocionales sobre tokenización, benchmarks y versiones se contrastaron con documentación primaria o se dejaron como no verificadas.

## Evidencia y límites

- Spring AI 2.0.2, JDK 25 y Spring Boot 4.0.9: cuatro tests Maven correctos de ChatClient, callback y recuperación autorizada. Modelo controlado y recuperación léxica: no se ejecutó un LLM ni un vector store.
- Socket.IO: prueba Node real correcta; Dart 3.13 con socket_io_client 3.1.6 analizado sin incidencias, suscripción aceptada y posición recibida después de publicar por HTTP. No se probó una UI Flutter en teléfono físico.
- Python: dos pruebas del contrato OSRM y una prueba de recuperación de compensación correctas. OSRM usa fixture sintética: dataset y motor Docker quedan pendientes.
- Node: dos tests de contrato de pago correctos y benchmark local de 12 peticiones por caso ejecutado. No se efectuaron cobros ni se prometió capacidad de producción.
- C#: código y proyecto .NET 10 presentes; compilación pendiente por falta del SDK. La descarga temporal se interrumpió, sin instalar herramientas globales.
- Android: ADB no encontró dispositivos conectados; diagnóstico físico pendiente. No se desactivaron protecciones ni se simuló una atestación.
- Web: los nueve temas nuevos se abrieron por su encabezado en Chrome sin estado de error; ancho móvil de RutaFlow 5 comprobado a 390 px. Build y 14 pruebas unitarias correctos. Las 42 pruebas E2E de Chrome pasaron en escritorio/móvil con cierre normal. El build conserva un aviso de 617,07 kB frente a presupuesto de 600 kB.
- `./scripts/validate.sh` correcto, con las cuatro omisiones PostgreSQL ya documentadas. El nuevo control comprueba origen y coincidencia de código, sin declarar todos los temas ejecutados. Los reportes mantienen los marcadores no detectados; no se relajaron para poner este lote en verde.

La verificación por tema vive en `examples/rutaflow-material/verification.json`. Quedan separadas la prueba técnica, la cobertura de una referencia y la revisión pedagógica con personas principiantes.
