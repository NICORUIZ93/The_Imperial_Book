# Ejemplos derivados del material solicitado

El inventario y los destinos del material están en `docs/rutaflow-source-index.md`.
`manifest.json` relaciona nueve temas nuevos con sus archivos de origen y ejemplos.
`python3 scripts/validate_rutaflow_material.py` comprueba esa trazabilidad y la igualdad entre código y Markdown; no acredita ejecución.

## Ejecución

- Socket.IO: `npm ci` y `npm test` dentro de `socketio/`. `node serve.mjs` abre solo loopback en el puerto 3100. La lección explica la conexión de Dart 3 con socket_io_client 3.1.6 y las limitaciones de autenticación del laboratorio.
- Spring AI: JDK 25 y `mvn test` dentro de `spring-ai/`. Se usa un ChatModel controlado: no se llama a un proveedor de IA ni se generan costes. El recuperador RAG es léxico; no se presenta como un vector store.
- OSRM: `python3 -m unittest discover -s examples/rutaflow-material/osrm` desde la raíz. La fixture es sintética y verifica contrato; no acredita una ruta calculada sobre un mapa real.
- Compensación: `python3 -m unittest discover -s examples/rutaflow-material/sagas`.
- Capacidad: `node examples/rutaflow-material/capacity/medir.mjs`.
- Pagos: `node --test examples/rutaflow-material/payments/contrato.test.mjs`. Solo usa identificadores ficticios; no cobra ni procesa tarjetas.
- C#: SDK .NET 10 y `dotnet run --project examples/rutaflow-material/records-csharp/Records.csproj`. Compilación pendiente en esta entrega por ausencia del SDK local.
- Android: comandos de diagnóstico en Android 13. Se conservan las diferencias de emulador/dispositivo y la necesidad de autorización ADB; no se presentan lecturas físicas no realizadas.

No se copiaron fotografías personales, capturas de terceros, calendarios, publicidad ni binarios de toolchains al repositorio. Los recursos sin programa detallado se clasifican como tales.
