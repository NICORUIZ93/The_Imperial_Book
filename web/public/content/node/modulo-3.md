# Módulo 3: Servidores HTTP nativos


## Aprende construyendo

### Tema 1: El modelo request/response

**Conceptos clave:** `createServer`, `IncomingMessage`, `ServerResponse`, request como stream.

`http.createServer(callback)` crea un servidor HTTP que invoca el `callback` proporcionado por cada petición entrante, recibiendo dos objetos: `req` (una instancia de `IncomingMessage`, que representa la petición entrante) y `res` (una instancia de `ServerResponse`, usada para construir y enviar la respuesta). `req` expone propiedades como `req.method` (el verbo HTTP: GET, POST, entre otros) y `req.url` (la ruta solicitada, sin incluir el host ni el protocolo), y es, crucialmente, en sí mismo un stream legible (Módulo 2): el cuerpo de la petición (por ejemplo, el JSON enviado en un POST) no está disponible como un objeto ya parseado desde el inicio, sino que llega progresivamente como chunks de datos binarios a medida que la conexión de red los entrega, requiriendo leerlos explícitamente antes de poder procesarlos.

`res`, el objeto de respuesta, se construye llamando a métodos en una secuencia específica: `res.writeHead(codigoDeEstado, cabeceras)` establece el código de estado HTTP y las cabeceras de la respuesta (debe llamarse antes de escribir cualquier contenido del cuerpo); `res.write(datos)` puede llamarse múltiples veces para escribir el cuerpo de la respuesta progresivamente (útil, por ejemplo, para streaming de una respuesta grande); y `res.end(datosFinales)` finaliza la respuesta, opcionalmente escribiendo un último fragmento de datos antes de cerrar la conexión, señalando al cliente que la respuesta está completa.

Este modelo de bajo nivel, donde tanto la lectura de la petición como la construcción de la respuesta requieren manejo manual explícito, contrasta directamente con la experiencia de usar un framework como Express (Módulo 4), donde `req.body` ya llega parseado automáticamente (gracias a un middleware como `express.json()`) y `res.json(objeto)` encapsula en una sola llamada tanto establecer las cabeceras correctas como serializar y enviar el cuerpo de la respuesta. Construir un servidor con el módulo `http` puro, aunque menos práctico para desarrollo de producción cotidiano, revela exactamente qué trabajo específico automatiza un framework, un conocimiento que facilita depurar comportamientos inesperados incluso cuando se trabaja habitualmente con un framework que abstrae estos detalles.

Escuchar peticiones en un puerto específico se logra con `servidor.listen(puerto)`, tras lo cual el servidor permanece activo indefinidamente, procesando cada nueva conexión entrante mediante el callback registrado en `createServer`, aprovechando el modelo de I/O no bloqueante de Node (Módulo 0) para atender múltiples conexiones concurrentes con el mismo hilo único de JavaScript, sin necesidad de un hilo del sistema operativo dedicado por cada conexión activa.

**Analogía:** el módulo `http` nativo es como recibir correspondencia directamente en un buzón sin ningún servicio de clasificación previo: cada sobre (petición) llega en su forma bruta original, y es responsabilidad de quien lo recibe abrirlo, leer su contenido completo, interpretarlo, y redactar una respuesta apropiada desde cero; un framework como Express es como tener un asistente que ya clasifica, abre y resume automáticamente cada sobre entrante antes de entregártelo, permitiéndote concentrarte directamente en decidir qué responder.

**¿Por qué es importante?** Construir un servidor con `http` puro revela exactamente el trabajo que Express y Fastify automatizan (parsing de body, routing, formato de respuesta), un conocimiento que facilita depurar comportamientos inesperados de esos frameworks al entender qué está ocurriendo realmente por debajo de sus abstracciones.

**Código del ejemplo:**

```js
import { createServer } from "node:http";

const servidor = createServer((req, res) => {
  // req: stream legible (method, url, headers, body como chunks)
  // res: writeHead() → write() (opcional, varias veces) → end()
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hola Node");
});
servidor.listen(3000);
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás crear, arrancar y detener un servidor HTTP que responda JSON. **Prerrequisitos:** Node LTS y una terminal; no necesitas Express ni archivos de otro tema. Este ejemplo independiente comienza en una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una aplicación web necesita que un cliente solicite información y reciba una respuesta con formato y estado explícitos. Antes de usar un framework, construirás el intercambio HTTP básico para ver qué abstraen sus rutas y sus helpers de respuesta.

#### Paso 3 · Teoría y analogía aplicada

La petición es el sobre que llega: método, URL, cabeceras y cuerpo. La respuesta es el sobre que tú construyes: primero estado y cabeceras, después contenido, finalmente cierre. El `req` es además un stream, aunque esta primera ruta GET no tenga cuerpo que leer.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto nuevo:

```bash
mkdir ejemplo-http-basico
cd ejemplo-http-basico
npm init -y
mkdir src
```

Añade `"type": "module"` a `package.json` y crea `src/server.js`:

```js
import { createServer } from "node:http";

const servidor = createServer((req, res) => {
  // Esta ruta solo responde a GET /. Las demás reciben 404.
  if (req.method === "GET" && req.url === "/") {
    const respuesta = JSON.stringify({ mensaje: "Servidor Node activo" });

    // writeHead define el estado y cómo debe interpretar el cliente el cuerpo.
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(respuesta); // end finaliza esta respuesta y libera la conexión.
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

servidor.listen(3000, "127.0.0.1", () => {
  console.log("Servidor listo en http://127.0.0.1:3000");
});
```

`createServer` registra la función que se ejecuta por cada petición; `return` evita que el código siga intentando responder dos veces; `listen` mantiene el proceso abierto. Ejecuta:

```bash
node src/server.js
```

En otra terminal prueba la ruta:

```bash
curl -i http://127.0.0.1:3000/
```

`curl` es el comando que hace la petición HTTP desde la terminal (`-i` incluye las cabeceras de la respuesta).

**Resultado esperado:** la segunda terminal muestra `HTTP/1.1 200 OK`, `content-type: application/json` y `{"mensaje":"Servidor Node activo"}`. Detén el servidor con `Ctrl+C` cuando termines.

**Fallo deliberado y diagnóstico:** con el servidor activo solicita `http://127.0.0.1:3000/inexistente`. Obtendrás `404` y `{"error":"Ruta no encontrada"}`. No es un fallo del servidor: es la respuesta correcta a una ruta que no fue definida. Si aparece `EADDRINUSE`, el puerto 3000 ya está ocupado; detén el proceso anterior o cambia el puerto en `listen` y en `curl`.

#### Paso 5 · Práctica guiada

Cambia el mensaje e incluye `method: req.method` en la respuesta. **Pista:** conserva `JSON.stringify`; enviar un objeto directamente a `res.end` produce un error de tipo.

#### Paso 6 · Práctica independiente

Añade `GET /salud` que responda `{ "status": "ok" }` y prueba ambas rutas con `curl -i`. Entrega las dos salidas y explica por qué una ruta desconocida no debe responder `200`.

#### Paso 7 · Cierre y conexión

Ya puedes observar el ciclo request/response sin abstracciones. El siguiente tema implementará el enrutamiento manual completo en otro proyecto nuevo, con rutas y estado en memoria.

Este ciclo `writeHead`/`end` es la base sobre la que se apoya Express (Módulo 4), el framework que sí usarás para construir el proyecto integrador de este track (API productiva, Módulo 12): entender qué hace `http.createServer` por debajo te permitirá diagnosticar respuestas mal formadas o cabeceras faltantes incluso cuando el framework las genera automáticamente.

**Cuándo no usarlo:** para una API con más de un puñado de rutas, `http` puro obliga a reimplementar manualmente routing, parsing de body y manejo de errores que un framework como Express ya resuelve; usar `http` nativo en ese caso solo se justifica cuando el objetivo es un servicio minúsculo de un solo endpoint o cuando se necesita control total sobre cada byte de la respuesta (por ejemplo, streaming de baja latencia).

**Errores comunes:** olvidar `res.end`; responder dos veces; enviar JSON sin `Content-Type`; dejar el servidor corriendo y confundir `EADDRINUSE` con un error de código; usar `localhost` cuando una política local requiere `127.0.0.1`.

**Fuentes oficiales:** [`node:http`](https://nodejs.org/api/http.html), [`http.createServer`](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener) y [códigos de estado HTTP de MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Status).

### Tema 2: Routing manual

**Conceptos clave:** verificación de método y URL, estado en memoria.

Sin un framework, el routing —decidir qué lógica ejecutar según el método HTTP y la ruta de la petición entrante— se implementa manualmente comparando explícitamente `req.method` y `req.url` contra los valores esperados para cada ruta soportada, típicamente mediante una secuencia de condicionales `if` (o, para un número mayor de rutas, una estructura de datos de mapeo similar al patrón visto en el Módulo 1 del track de JavaScript para reemplazar un `switch` extenso). Cada combinación específica de método y ruta que la aplicación soporta requiere su propia rama de lógica explícita, y cualquier combinación no reconocida debe manejarse explícitamente devolviendo un código de estado 404 (no encontrado), en vez de dejar la petición sin ninguna respuesta.

Mantener un estado simple en memoria (como un array de tareas que crece con cada petición POST y se consulta en cada petición GET) es suficiente para demostrar el patrón completo de un servidor con estado sin necesidad de una base de datos real (que se estudiará en el Módulo 5), aunque es importante entender que este estado en memoria se pierde completamente si el proceso del servidor se reinicia, y no se comparte automáticamente entre múltiples instancias del servidor ejecutándose en paralelo (relevante si se considera clustering, estudiado en el Módulo 8), limitaciones que una base de datos real resuelve pero que son aceptables para el propósito pedagógico de entender el modelo de routing básico en este módulo.

Este ejercicio de routing completamente manual, aunque impracticable para una aplicación de producción con decenas o cientos de rutas (donde la repetición y el riesgo de errores de comparación manual crecerían considerablemente), es precisamente lo que revela el valor concreto que un router de framework (como `express.Router()`, estudiado en el Módulo 4) proporciona: extracción automática de parámetros de ruta (`/tareas/:id`), organización modular de rutas relacionadas, y una sintaxis declarativa mucho más concisa que una cadena larga de condicionales manuales comparando strings.

Comparar explícitamente el código de este servidor manual con el equivalente en Express, línea por línea, es un ejercicio de aprendizaje valioso: cada verificación manual de `req.method === "GET" && req.url === "/tareas"` tiene una contraparte directa y mucho más concisa en Express (`app.get("/tareas", handler)`), haciendo tangible y concreto exactamente cuánto trabajo repetitivo un framework de routing elimina.

**Analogía:** el routing manual es como un recepcionista que debe memorizar y verificar manualmente, mediante una larga lista de instrucciones escritas, exactamente qué hacer para cada combinación específica de "quién pregunta" y "qué pregunta"; un router de framework es como un sistema de derivación automática que, con solo declarar las reglas una vez de forma organizada, dirige automáticamente cada solicitud entrante hacia el procedimiento correcto sin repetir manualmente la lógica de comparación en cada caso.

**¿Por qué es importante?** Implementar routing manual revela exactamente el trabajo repetitivo que un router de framework automatiza, dando una apreciación concreta y bien fundamentada del valor real que aportan esas abstracciones antes de depender de ellas sin cuestionarlas.

**Código del ejemplo:**

```js
if (req.method === "GET" && req.url === "/tareas") { /* ... */ }
else if (req.method === "POST" && req.url === "/tareas") { /* ... */ }
else { res.writeHead(404); res.end("No encontrado"); }
// Express equivalente: app.get("/tareas", ...); app.post("/tareas", ...);
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás implementar rutas `GET` y `POST` sin framework y devolver un `404` consistente. **Prerrequisitos:** Node LTS, JSON básico y una terminal con `curl`. Este ejemplo independiente comienza desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API pequeña puede necesitar exponer una lista y aceptar nuevas tareas. Antes de delegar esa responsabilidad a Express, construirás el enrutamiento explícito para identificar qué deben decidir método, ruta, cuerpo y código de estado.

#### Paso 3 · Teoría y analogía aplicada

Una ruta no se identifica solo por su URL: `GET /tareas` consulta y `POST /tareas` crea, aunque compartan la misma dirección. El array en memoria es una libreta temporal: sirve para aprender el contrato HTTP, pero se borra al reiniciar y no debe usarse como persistencia real.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto nuevo:

```bash
mkdir ejemplo-routing-manual
cd ejemplo-routing-manual
npm init -y
mkdir src
```

Añade `"type": "module"` a `package.json` y crea `src/server.js`:

```js
import { createServer } from "node:http";

const tareas = [];

function responderJson(res, status, cuerpo) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(cuerpo));
}

async function leerJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const servidor = createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/tareas") {
    return responderJson(res, 200, { tareas });
  }

  if (req.method === "POST" && req.url === "/tareas") {
    try {
      const body = await leerJson(req);
      const titulo = body.titulo?.trim();

      if (!titulo) return responderJson(res, 400, { error: "titulo es obligatorio" });

      const tarea = { id: tareas.length + 1, titulo };
      tareas.push(tarea);
      return responderJson(res, 201, { tarea });
    } catch {
      return responderJson(res, 400, { error: "El body debe ser JSON válido" });
    }
  }

  return responderJson(res, 404, { error: "Ruta no encontrada" });
});

servidor.listen(3001, "127.0.0.1", () => {
  console.log("API en http://127.0.0.1:3001");
});
```

`responderJson` evita repetir cabeceras y serialización; `leerJson` transforma el stream en objeto solo para esta ruta; los `return` aseguran una sola respuesta por petición. Arranca el servidor:

```bash
node src/server.js
```

En otra terminal consulta, crea y vuelve a consultar:

```bash
curl -i http://127.0.0.1:3001/tareas
curl -i -X POST http://127.0.0.1:3001/tareas -H "Content-Type: application/json" -d '{"titulo":"Leer HTTP"}'
curl -i http://127.0.0.1:3001/tareas
```

**Resultado esperado:** la primera consulta devuelve `200` y lista vacía; el POST devuelve `201` con `id: 1`; la última consulta devuelve la tarea creada. Al reiniciar, la lista vuelve a estar vacía porque vive solo en memoria.

**Fallo deliberado y diagnóstico:** ejecuta `curl -i -X POST http://127.0.0.1:3001/tareas -d '{titulo:sin-comillas}'`. Obtendrás `400` con `El body debe ser JSON válido`. El servidor sigue disponible porque el error de cliente se captura dentro de la ruta. Prueba también `GET /tarea` para observar un `404`.

#### Paso 5 · Práctica guiada

Añade `GET /tareas/1` usando una comparación exacta de ruta. **Pista:** busca por `id`; si no existe, responde `404`, no una lista vacía ni `200`.

#### Paso 6 · Práctica independiente

Implementa `DELETE /tareas/1`, prueba borrar una tarea existente y otra inexistente, y entrega las salidas HTTP. Explica por qué el estado se pierde al reiniciar y qué responsabilidad tendría una base de datos.

#### Paso 7 · Cierre y conexión

Ya puedes relacionar método, URL, body y respuesta. El siguiente tema se concentrará en límites de body y cabeceras dentro de un ejemplo nuevo, sin reutilizar este servidor.

**Errores comunes:** comprobar solo la URL; no devolver después de responder; usar estado en memoria como datos reales; responder `200` al crear; dejar errores de JSON sin capturar.

**Fuentes oficiales:** [métodos HTTP en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Methods), [estado `201`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/201), [estado `404`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/404) y [`IncomingMessage`](https://nodejs.org/api/http.html#class-httpincomingmessage).

**Transferencia al proyecto integrador «API operativa de entregas»:** Enruta consulta y confirmación por método y ruta explícitos. Prueba una combinación no soportada y comprueba que responde con el estado apropiado sin ejecutar otra operación por coincidencia parcial.

### Tema 3: Parsing de body y headers

**Conceptos clave:** acumulación de chunks, `for await...of` sobre un stream, `JSON.parse`.

Como `req` es un stream legible (Tema 1), leer el cuerpo completo de una petición POST requiere acumular explícitamente todos los chunks de datos entrantes antes de poder procesarlos como un todo. El patrón moderno y recomendado usa `for await (const chunk of req)` (aprovechando que los streams de Node son iterables asíncronos, una capacidad de generadores relacionada con el Módulo 6 del track de JavaScript), acumulando cada `chunk` en un array, y una vez que el bucle termina (indicando que el stream ya entregó todos sus datos), combinando esos chunks acumulados con `Buffer.concat(chunks)` para obtener el contenido binario completo, convirtiéndolo finalmente a string y parseándolo como JSON con `JSON.parse()`.

Este proceso debe envolverse en un `try`/`catch` explícito, porque `JSON.parse()` lanza una excepción si el contenido recibido no es JSON válido (por ejemplo, si el cliente envió un cuerpo malformado, o ningún cuerpo en absoluto), un caso que debe traducirse en una respuesta con código de estado 400 (petición incorrecta) en vez de dejar que la excepción se propague sin manejar y potencialmente derribe el proceso del servidor completo, afectando a todas las demás peticiones concurrentes que ese mismo proceso podría estar atendiendo simultáneamente.

Las cabeceras (headers) de la petición están disponibles directamente en `req.headers`, un objeto plano con los nombres de cabecera en minúsculas como claves (independientemente de cómo el cliente los haya escrito originalmente, HTTP normaliza la comparación de nombres de cabecera sin distinguir mayúsculas de minúsculas). Leer `req.headers["content-type"]` o `req.headers.accept` permite tomar decisiones basadas en lo que el cliente indica sobre el formato de los datos que envía o que espera recibir, información esencial tanto para el parsing correcto del body (verificar que el `content-type` efectivamente indica JSON antes de intentar parsearlo como tal) como para la content negotiation del Tema 4.

Este proceso manual de acumulación de chunks es, precisamente, el trabajo exacto que `express.json()` (un middleware, concepto central del Módulo 4) automatiza completamente: verificar el `content-type`, acumular los chunks, parsear el JSON, manejar errores de parsing, y finalmente exponer el resultado ya parseado directamente como `req.body`, sin que el código de cada ruta individual necesite repetir este proceso de bajo nivel cada vez.

**Analogía:** parsear el body manualmente es como recibir un documento importante enviado en fragmentos separados por correo postal en distintos sobres, donde hay que esperar a que lleguen todos los sobres, ensamblarlos en el orden correcto, y solo entonces poder leer el documento completo, verificando además que el resultado ensamblado tenga sentido antes de actuar sobre él.

**¿Por qué es importante?** Entender el proceso manual de acumulación de chunks y parsing de JSON revela por qué el body de una petición HTTP en Node no llega "gratis" ya parseado, y qué trabajo específico automatiza un middleware como `express.json()`.

**Código del ejemplo:**

```js
const chunks = [];
for await (const chunk of req) chunks.push(chunk);
try {
  const datos = JSON.parse(Buffer.concat(chunks).toString());
  // procesar datos...
} catch {
  res.writeHead(400); res.end("JSON inválido");
}
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás leer un body JSON, validar `Content-Type` y rechazar un tamaño excesivo sin derribar el proceso. **Prerrequisitos:** Node LTS y JSON básico. Este ejemplo independiente empieza desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API que recibe registros debe aceptar JSON bien formado, pero no puede permitir que un cliente envíe datos ilimitados y consuma toda la memoria. El caso real combina formato, tamaño y manejo de errores como un contrato de entrada.

#### Paso 3 · Teoría y analogía aplicada

El body llega en paquetes, no como objeto listo. Antes de abrir una caja, una recepción revisa la etiqueta (`Content-Type`) y limita su peso; del mismo modo el servidor verifica formato y acumula bytes con un máximo antes de usar `JSON.parse`.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto nuevo:

```bash
mkdir ejemplo-body-headers
cd ejemplo-body-headers
npm init -y
mkdir src
```

Añade `"type": "module"` a `package.json` y crea `src/server.js`:

```js
import { createServer } from "node:http";

const LIMITE_BYTES = 1_024;

async function leerJson(req) {
  if (!req.headers["content-type"]?.includes("application/json")) {
    throw Object.assign(new Error("Content-Type debe incluir application/json"), { status: 415 });
  }

  const chunks = [];
  let total = 0;

  for await (const chunk of req) {
    total += chunk.length;
    if (total > LIMITE_BYTES) {
      throw Object.assign(new Error(`Body supera ${LIMITE_BYTES} bytes`), { status: 413 });
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("JSON inválido"), { status: 400 });
  }
}

function responder(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/eco") {
    return responder(res, 404, { error: "Ruta no encontrada" });
  }

  try {
    const datos = await leerJson(req);
    return responder(res, 200, { recibido: datos });
  } catch (error) {
    return responder(res, error.status ?? 500, { error: error.message });
  }
}).listen(3002, "127.0.0.1", () => console.log("API en http://127.0.0.1:3002"));
```

`chunk.length` mide bytes, no caracteres; el límite se evalúa mientras llega el stream; `415` comunica formato no admitido y `413` body demasiado grande. Arranca el servidor:

```bash
node src/server.js
```

En otra terminal envía JSON válido:

```bash
curl -i -X POST http://127.0.0.1:3002/eco -H "Content-Type: application/json" -d '{"nombre":"Ana"}'
```

**Resultado esperado:** responde `200` y devuelve `{"recibido":{"nombre":"Ana"}}`.

**Fallo deliberado y diagnóstico:** repite el comando sin `-H "Content-Type: application/json"`. Recibirás `415` con el mensaje de formato. Después envía `-d '{nombre:Ana}'` con la cabecera correcta: recibirás `400 JSON inválido`. Ambos son errores de cliente, por lo que el proceso continúa atendiendo solicitudes.

#### Paso 5 · Práctica guiada

Reduce `LIMITE_BYTES` a `20` y envía un JSON que lo supere. **Pista:** comprueba `413`; no cambies el límite solamente para que la prueba “pase”.

#### Paso 6 · Práctica independiente

Añade un header obligatorio `x-request-id` con longitud de 8 a 40 caracteres. Entrega un caso válido y otro con `400`, y explica por qué un header se valida antes de procesar la lógica de negocio.

#### Paso 7 · Cierre y conexión

Ya puedes recibir datos de red con límites y diagnósticos claros. El siguiente tema elegirá códigos de estado y representación de salida en un proyecto HTTP nuevo.

**Errores comunes:** asumir `req.body`; omitir límite de bytes; validar `Content-Type` después de consumir el body; responder `500` a JSON inválido; usar longitud de string en lugar de bytes.

**Fuentes oficiales:** [`IncomingMessage.headers`](https://nodejs.org/api/http.html#messageheaders), [estado `400`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/400), [estado `413`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/413) y [estado `415`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/415).

**Transferencia al proyecto integrador «API operativa de entregas»:** Limita tamaño y formato del cuerpo de confirmación. Prueba JSON inválido, cuerpo excesivo y cabecera incompatible; ninguno debe llegar al repositorio como una entrega válida.

### Tema 4: Códigos de estado y content negotiation

**Conceptos clave:** códigos de estado HTTP apropiados, negociación de contenido según `Accept`.

Responder con el código de estado HTTP correcto para cada situación es una parte esencial (y frecuentemente descuidada) de construir una API bien diseñada: `200` (OK) para una consulta exitosa; `201` (Created) específicamente cuando una petición POST crea exitosamente un nuevo recurso, distinguiéndose deliberadamente de un `200` genérico para comunicar con precisión semántica qué ocurrió; `400` (Bad Request) cuando la petición del cliente está mal formada (JSON inválido, campos faltantes); `404` (Not Found) cuando la ruta solicitada no existe; y `500` (Internal Server Error) cuando ocurre un fallo inesperado del lado del servidor no atribuible a un error del cliente. Elegir el código correcto no es un formalismo sin sentido práctico: clientes de la API (incluyendo bibliotecas HTTP automatizadas) frecuentemente toman decisiones de comportamiento basadas en el código de estado recibido (por ejemplo, reintentar automáticamente ante un 503 pero no ante un 400, porque un 400 indica un problema con la petición enviada que un reintento idéntico no resolvería).

Content negotiation es el proceso mediante el cual un servidor decide el formato de la respuesta según lo que el cliente indica que puede aceptar, comunicado mediante la cabecera `Accept` de la petición. Una implementación básica verifica si `req.headers.accept` incluye `"application/json"`, respondiendo en ese formato si es así, o recurriendo a texto plano (`text/plain`) como formato alternativo si el cliente no indica preferencia explícita por JSON, permitiendo que un mismo endpoint sirva tanto a clientes que consumen la API programáticamente (esperando JSON estructurado) como a clientes más simples que simplemente quieren ver una representación textual legible directamente en una herramienta como `curl` sin ninguna cabecera especial.

Establecer correctamente la cabecera `Content-Type` de la respuesta (mediante `res.writeHead(codigo, {"Content-Type": tipo})`) es complementario y necesario junto con content negotiation: comunica explícitamente al cliente cómo debe interpretar el cuerpo de la respuesta recibida, y omitir esta cabecera (o establecerla incorrectamente) puede causar que un cliente interprete incorrectamente datos JSON válidos como texto plano sin estructura, o viceversa, un error de integración sutil pero con consecuencias reales en la interoperabilidad entre el servidor y sus clientes.

Practicar la construcción manual de estas decisiones —qué código de estado corresponde a cada situación, cómo negociar el formato de respuesta según las preferencias del cliente— antes de depender de las convenciones automáticas de un framework consolida un entendimiento preciso de la semántica HTTP subyacente, que sigue siendo directamente relevante incluso al trabajar con un framework que simplifica la sintaxis pero no cambia el significado real de estas decisiones de diseño de API.

**Analogía:** los códigos de estado HTTP son como un sistema estandarizado de semáforos y señales de tráfico que comunican de forma universal e inequívoca el resultado de una interacción (éxito, problema del solicitante, problema del proveedor), permitiendo que cualquier participante del sistema (incluyendo sistemas automatizados que nunca "leen" el contenido real de la respuesta) tome decisiones correctas basándose únicamente en esa señal estandarizada.

**¿Por qué es importante?** Elegir el código de estado HTTP correcto y practicar content negotiation básica son decisiones de diseño de API que comunican significado preciso tanto a humanos como a sistemas automatizados que consumen la API, con consecuencias reales de comportamiento (reintentos, manejo de errores) más allá de una simple formalidad.

**Código del ejemplo:**

```js
const aceptaJson = req.headers.accept?.includes("application/json");
res.writeHead(200, { "Content-Type": aceptaJson ? "application/json" : "text/plain" });
res.end(aceptaJson ? JSON.stringify(dato) : String(dato));

// Códigos según situación:
// 200 consulta OK · 201 recurso creado · 400 petición inválida
// 404 ruta inexistente · 500 fallo inesperado del servidor
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás devolver estados HTTP coherentes y elegir JSON o texto según `Accept`. **Prerrequisitos:** Node LTS y saber que una cabecera contiene metadatos de la petición. El ejemplo es independiente y comienza en una carpeta vacía.

#### Paso 2 · Contexto y caso real

Un mismo endpoint puede atender una herramienta de terminal que prefiere texto y una aplicación que necesita JSON. El servidor debe comunicar tanto el resultado como su representación, sin obligar al cliente a adivinar el formato.

#### Paso 3 · Teoría y analogía aplicada

El código de estado es una señal de tráfico: `200` indica consulta correcta, `201` creación, `400` petición inválida y `404` recurso inexistente. `Accept` es el idioma que el cliente prefiere; `Content-Type` confirma el idioma que el servidor eligió. Preferir JSON solo porque es habitual no equivale a negociar una representación.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea el proyecto nuevo:

```bash
mkdir ejemplo-content-negotiation
cd ejemplo-content-negotiation
npm init -y
mkdir src
```

Añade `"type": "module"` a `package.json` y crea `src/server.js`:

```js
import { createServer } from "node:http";

const producto = Object.freeze({ id: 7, nombre: "Cuaderno", precio: 12_000 });

function responderProducto(req, res) {
  const acepta = req.headers.accept ?? "*/*";

  if (acepta.includes("application/json") || acepta.includes("*/*")) {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", Vary: "Accept" });
    return res.end(JSON.stringify(producto));
  }

  if (acepta.includes("text/plain")) {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", Vary: "Accept" });
    return res.end(`${producto.nombre}: $${producto.precio}`);
  }

  res.writeHead(406, { "Content-Type": "application/json; charset=utf-8", Vary: "Accept" });
  return res.end(JSON.stringify({ error: "Formato no disponible" }));
}

createServer((req, res) => {
  if (req.method === "GET" && req.url === "/producto") return responderProducto(req, res);

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
}).listen(3003, "127.0.0.1", () => console.log("API en http://127.0.0.1:3003"));
```

`Vary: Accept` indica a las cachés que la respuesta depende de esa cabecera. El orden de las condiciones documenta que JSON es el valor predeterminado cuando el cliente acepta cualquier formato. Arranca:

```bash
node src/server.js
```

En otra terminal prueba ambas representaciones:

```bash
curl -i -H "Accept: application/json" http://127.0.0.1:3003/producto
curl -i -H "Accept: text/plain" http://127.0.0.1:3003/producto
```

**Resultado esperado:** ambas respuestas usan `200`, pero una tiene `Content-Type: application/json` y la otra `text/plain`. La cabecera `Vary: Accept` aparece en las dos.

**Fallo deliberado y diagnóstico:** solicita `curl -i -H "Accept: application/xml" http://127.0.0.1:3003/producto`. Recibirás `406 Not Acceptable`: el recurso existe, pero el servidor no puede representarlo en XML. Solicita `/productos` para comparar un `404`, donde la ruta no existe.

#### Paso 5 · Práctica guiada

Añade el formato `text/csv` con una cabecera y una fila. **Pista:** devuelve `Content-Type: text/csv; charset=utf-8`, conserva `Vary: Accept` y prueba con `curl -i`.

#### Paso 6 · Práctica independiente

Crea `POST /producto` que valide nombre y precio, responda `201` al crear y `400` cuando falte un campo. Entrega tres pruebas: JSON creado, body inválido y formato no aceptado; explica cada código de estado.

#### Paso 7 · Cierre y conexión

Ya puedes comunicar resultado y formato con precisión. El próximo módulo aplicará estos contratos a Express, en nuevos ejemplos creados desde cero.

Elegir el código de estado correcto para cada situación es el mismo criterio que aplicarás en cada endpoint del proyecto integrador (API productiva, Módulo 12): un cliente automatizado de esa API decide si reintentar, dar el dato por perdido o alertar a una persona exclusivamente según el código recibido, nunca leyendo el cuerpo de la respuesta.

**Cuándo no usarlo:** implementar content negotiation manual como aquí solo tiene sentido cuando la API realmente sirve más de un formato (JSON y texto, por ejemplo); si solo existe un consumidor y un formato fijo, negociar contenido agrega complejidad sin beneficio real, y basta con fijar `Content-Type` una sola vez.

**Errores comunes:** usar `200` para todo; ignorar `Accept`; enviar JSON con `text/plain`; olvidar `Vary`; confundir `406` con `404`; inventar un formato que el servidor no soporta.

**Fuentes oficiales:** [negociación de contenido en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Content_negotiation), [cabecera `Accept`](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Headers/Accept), [cabecera `Vary`](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Headers/Vary) y [estado `406`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/406).

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un servidor HTTP nativo completo con 3 rutas, manejo de errores y content negotiation, sin usar ningún framework.

**Requisitos previos:** Node.js instalado, `curl` disponible, Módulos 0-2 completados.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Crear el servidor básico | `createServer` respondiendo "Hola Node" en GET / | Arráncalo y verifica con el navegador o `curl` |
| 2 | Agregar routing manual de tareas | GET /tareas devuelve array; POST /tareas agrega elemento | Estado en memoria simple |
| 3 | Parsear el body de un POST | Ver Tema 3 | Acumula chunks y haz `JSON.parse` al final |
| 4 | Responder con códigos de estado correctos | 201 al crear, 404 no encontrado, 400 JSON inválido | Verifica cada caso con `curl` |
| 5 | Implementar content negotiation | Ver Tema 4 | Responde JSON o texto según el header `Accept` |
| 6 | Probar con curl | `curl -X POST -d '{"titulo":"Tarea 1"}' -H "Content-Type: application/json" localhost:3000/tareas` | Verifica la respuesta completa |

**Verificación:** el laboratorio se considera exitoso si las 3 rutas responden con los códigos de estado correctos en cada escenario (éxito, no encontrado, JSON inválido), y si la content negotiation responde correctamente en JSON o texto plano según el header `Accept` enviado.

**Errores comunes y soluciones**

- **Llamar a `res.end()` sin haber llamado antes a `res.writeHead()`.** Esto envía la respuesta con un código de estado 200 por defecto; siempre establece explícitamente el código de estado correcto antes de finalizar la respuesta.
- **Intentar parsear `req.body` directamente sin acumular los chunks primero.** `req` no tiene una propiedad `body` sin un middleware o un manejo manual explícito; recuerda que es un stream, no un objeto ya parseado.
- **Olvidar manejar el caso de ruta no reconocida.** Sin un `else` final explícito, una petición a una ruta inexistente podría quedar sin ninguna respuesta.

---


## Laboratorio de transferencia

### Tema 5: Paginación por cursor y límites de entrada comprobables

#### Paso 1 · Objetivo y preparación
Al finalizar diseñarás un corte estable de resultados con cursor y rechazarás tamaños inválidos antes de consultar datos. **Prerrequisitos:** arrays, módulos ESM, HTTP y `node:test`. Usa Node 24 o superior; comprueba `node --version`. Es un ejemplo independiente desde carpeta vacía.

#### Paso 2 · Contexto y caso real
El proyecto integrador no debe cargar todos los envíos en una petición ni devolver resultados repetidos por ordenar solo por una fecha no única. **¿Por qué es importante?** El contrato de paginación afecta memoria, latencia y la posibilidad de retomar una lectura.

#### Paso 3 · Teoría, modelo mental y analogía
Un cursor representa una posición en un orden estable. Aquí es un identificador entero ascendente y único: la página incluye los IDs mayores al cursor. Pedimos un elemento adicional para determinar si existe otra página. En una base de datos, el filtro y el límite deben ejecutarse en la consulta, con un índice apropiado.

**Analogía:** el cursor es un separador que indica después de qué ficha seguir. El límite es que esta implementación no representa una foto inmutable de datos concurrentes: eliminaciones o inserciones pueden cambiar lo visible. Un cursor real también debe conservar filtros y orden, y no debe servir para eludir autorización.

#### Paso 4 · Demostración guiada desde cero
```bash
mkdir cursor-envios
cd cursor-envios
```
Crea `pagina.mjs`:
```javascript
export function pagina(rows, after = 0, size = 2) {
  if (!Number.isSafeInteger(after) || after < 0 ||
      !Number.isSafeInteger(size) || size < 1 || size > 100) {
    throw new RangeError('Cursor o tamaño inválido');
  }
  const selected = rows.filter(row => row.id > after)
    .sort((a, b) => a.id - b.id).slice(0, size + 1);
  const items = selected.slice(0, size);
  return { items, next: selected.length > size ? items.at(-1).id : null };
}
```
Crea `pagina.test.mjs`:
```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { pagina } from './pagina.mjs';
const rows = [1, 2, 3, 4, 5].map(id => ({ id }));
test('recorre sin repetir y termina', () => {
  const first = pagina(rows);
  const second = pagina(rows, first.next);
  assert.deepEqual(first.items.map(x => x.id), [1, 2]);
  assert.deepEqual(second.items.map(x => x.id), [3, 4]);
  assert.equal(pagina(rows, second.next).next, null);
});
test('rechaza límites y cursor inválidos', () => {
  assert.throws(() => pagina(rows, 0, 1000), RangeError);
  assert.throws(() => pagina(rows, -1, 2), RangeError);
});
```
```bash
node --test pagina.test.mjs
```
**Resultado esperado:** dos pruebas correctas. Explica cada bloque: validación del contrato, orden, selección de un elemento extra y cursor de continuación. No hay servidor ni dependencia externa ocultos.

#### Paso 5 · Práctica guiada
**Fallo deliberado:** cambia `row.id > after` por `>=`. La prueba del segundo corte falla porque repite el último elemento de la página anterior. **Pista:** compara la definición «después de» con la condición. Corrige y repite.

#### Paso 6 · Práctica independiente
Añade casos de lista vacía, tamaño 1 y cursor mayor que el último ID. Después diseña el contrato HTTP: parámetro `after`, `size` y respuesta 400 para valores inválidos. Justifica por qué no convertir texto inválido silenciosamente a cero.

#### Paso 7 · Cierre y evidencia
**Evidencia de aprendizaje:** pruebas, fallo/corrección y contrato escrito. El siguiente paso es llevar el filtro a SQL con orden único e índice, y medirlo con datos representativos. **Errores comunes:** ordenar por un campo no único, aceptar tamaños sin límite y paginar después de cargar todo en memoria. **Límites y decisión de uso:** aquí los datos están en memoria para aislar el algoritmo; eso no valida escalabilidad ni consistencia bajo concurrencia.

**Fuente oficial:** [Node test runner](https://nodejs.org/api/test.html).
