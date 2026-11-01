# Módulo 3: Servidores HTTP nativos

## Aprende construyendo

Cada tema comienza en una carpeta vacía y usa únicamente Node.js LTS y `curl`. Escribe manualmente los archivos indicados; no necesitas Express, código prefabricado de la academia ni archivos de otros temas.

### Tema 1: El modelo request/response · Básico · 60 min

#### Aprende

**Prerrequisitos:** Node.js LTS y terminal; no necesitas Express.

**Al terminar podrás:** crear, arrancar y detener un servidor HTTP que responda JSON, elegir explícitamente estado y cabeceras y diagnosticar una ruta desconocida o un puerto ocupado.

**Por qué importa:** Express y Fastify automatizan parsing, routing y respuestas, pero esas abstracciones siguen apoyándose en el intercambio nativo. Conocerlo permite diagnosticar cabeceras ausentes, respuestas duplicadas y cuerpos mal formados en lugar de tratar el framework como magia.

`http.createServer(callback)` registra una función que recibe `req`, un `IncomingMessage`, y `res`, un `ServerResponse`. `req.method` y `req.url` identifican la operación; `req` también es un stream legible porque el cuerpo llega por chunks. La respuesta se construye con `writeHead`, uno o varios `write` opcionales y `end` para cerrarla.

`listen(puerto)` mantiene el proceso atendiendo conexiones mediante I/O no bloqueante. Un framework puede exponer `req.body` y `res.json`, pero antes debes entender qué trabajo realiza por ti.

**Analogía:** el módulo nativo es recibir correspondencia sin asistente: abres cada sobre, interpretas su contenido y redactas la respuesta. Un framework clasifica y resume el sobre, pero no cambia el significado de la carta.

#### Practica

Desde una carpeta vacía:

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
  if (req.method === "GET" && req.url === "/") {
    const respuesta = JSON.stringify({ mensaje: "Servidor Node activo" });
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(respuesta);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Ruta no encontrada" }));
});

servidor.listen(3000, "127.0.0.1", () => {
  console.log("Servidor listo en http://127.0.0.1:3000");
});
```

Ejecuta en una terminal:

```bash
node src/server.js
```

En otra terminal:

```bash
curl -i http://127.0.0.1:3000/
```

**Resultado esperado:** `HTTP/1.1 200 OK`, `content-type: application/json` y `{"mensaje":"Servidor Node activo"}`. Detén el servidor con `Ctrl+C` al terminar.

**Fallo deliberado y corrección:** solicita `http://127.0.0.1:3000/inexistente`. El `404` y `{"error":"Ruta no encontrada"}` son la respuesta correcta, no un fallo del servidor. Si aparece `EADDRINUSE`, detén el proceso anterior o cambia el puerto en `listen` y `curl`; no respondas eliminando procesos que no reconoces.

**Práctica guiada:** cambia el mensaje e incluye `method: req.method` en la respuesta. Conserva `JSON.stringify`: pasar un objeto directamente a `res.end` produce un error de tipo.

**Ejercicio independiente:** añade `GET /salud` que responda `{ "status": "ok" }`. Prueba `/`, `/salud` y una ruta desconocida con `curl -i`, y explica por qué la última no debe responder `200`.

#### Aplica

En el **[Proyecto integrador: API nativa de tareas](#proyecto-3-api-http-nativa-de-tareas)**, construye primero una ruta de salud con estado, tipo de contenido y cierre explícitos antes de añadir operaciones.

**Checklist de salida**

- [ ] Creaste el proyecto y `src/server.js` manualmente.
- [ ] La ruta válida responde JSON con estado y `Content-Type` correctos.
- [ ] Cada rama termina su respuesta una sola vez.
- [ ] Una ruta desconocida produce `404`.
- [ ] Puedes explicar y resolver `EADDRINUSE` sin confundirlo con un error de sintaxis.
- [ ] Sabes qué trabajo adicional automatizaría un framework.

**Cuándo no usarlo:** para muchas rutas, `http` puro obliga a reimplementar routing, parsing y errores. Es apropiado para un servicio mínimo, streaming de bajo nivel o para comprender el contrato antes de usar Express.

**Fuentes oficiales:** [`node:http`](https://nodejs.org/api/http.html), [`http.createServer`](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener) y [códigos de estado HTTP de MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Status).

### Tema 2: Routing manual · Básico · 75 min

#### Aprende

**Prerrequisitos:** Node LTS, JSON básico y `curl`. Este proyecto no reutiliza el servidor anterior.

**Al terminar podrás:** implementar rutas `GET` y `POST` sin framework, leer un body JSON, devolver `201`, `400` y `404` de forma consistente y explicar los límites del estado en memoria.

**Por qué importa:** una API pequeña necesita distinguir consulta y creación aunque compartan URL. Escribir el router manual muestra exactamente qué decisiones ocultan `app.get` y `app.post`, y evita que una coincidencia parcial ejecute la operación equivocada.

Una ruta se identifica por método y URL. `GET /tareas` consulta; `POST /tareas` crea. Cualquier combinación no reconocida debe recibir una respuesta explícita, normalmente `404`, en lugar de quedar abierta.

El array en memoria permite practicar el contrato sin base de datos, pero se pierde al reiniciar y no se comparte entre procesos. No es persistencia real. Con muchas rutas, una cadena de condicionales se vuelve difícil de mantener; un router de framework también aporta parámetros y organización modular.

**Analogía:** el routing manual es una recepcionista con una lista de instrucciones para cada combinación de pregunta y procedimiento. El array es su libreta temporal: útil durante el turno, inexistente si se rompe o se reinicia.

#### Practica

Desde una carpeta vacía:

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

Arranca el servidor y, en otra terminal, consulta, crea y vuelve a consultar:

```bash
node src/server.js
```

```bash
curl -i http://127.0.0.1:3001/tareas
curl -i -X POST http://127.0.0.1:3001/tareas -H "Content-Type: application/json" -d '{"titulo":"Leer HTTP"}'
curl -i http://127.0.0.1:3001/tareas
```

**Resultado esperado:** la primera consulta devuelve `200` y lista vacía; el POST devuelve `201` con `id: 1`; la última incluye la tarea. Al reiniciar, la lista vuelve a estar vacía.

**Fallo deliberado y corrección:** envía `curl -i -X POST http://127.0.0.1:3001/tareas -d '{titulo:sin-comillas}'`. Recibes `400` porque el JSON es inválido y el proceso sigue disponible. Corrige el cuerpo a `{"titulo":"Leer HTTP"}` con la cabecera JSON y verifica `201`. Prueba también `GET /tarea` para observar `404`.

**Práctica guiada:** añade `GET /tareas/1` con comparación exacta y búsqueda por `id`. Si no existe, responde `404`, no `200` con una lista vacía.

**Ejercicio independiente:** implementa `DELETE /tareas/1`; prueba una tarea existente y otra inexistente. Explica por qué reiniciar borra el estado y qué responsabilidad asumiría una base de datos.

#### Aplica

En el **[Proyecto integrador: routing de tareas](#proyecto-3-api-http-nativa-de-tareas)**, enruta consulta y creación por método y URL exactos. Una combinación no soportada no debe ejecutar otra operación por coincidencia parcial.

**Checklist de salida**

- [ ] El servidor fue creado desde cero y no usa framework.
- [ ] `GET` y `POST` se distinguen aunque compartan URL.
- [ ] La creación válida devuelve `201`; la entrada inválida, `400`.
- [ ] Toda rama responde una sola vez y el fallback devuelve `404`.
- [ ] Comprobaste que el estado desaparece al reiniciar.
- [ ] Puedes señalar qué aportaría un router de framework.

**Errores comunes:** comprobar solo la URL, no devolver después de responder, usar memoria como persistencia, responder `200` al crear y dejar `JSON.parse` sin capturar.

**Fuentes oficiales:** [métodos HTTP en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Methods), [estado `201`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/201), [estado `404`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/404) y [`IncomingMessage`](https://nodejs.org/api/http.html#class-httpincomingmessage).

### Tema 3: Parsing de body y headers · Intermedio · 75 min

#### Aprende

**Prerrequisitos:** Node LTS, streams básicos y JSON. Comienza otro proyecto vacío.

**Al terminar podrás:** leer un body JSON mediante iteración asíncrona, validar `Content-Type`, limitar bytes y traducir errores de cliente sin derribar el proceso.

**Por qué importa:** una API no puede aceptar datos ilimitados ni asumir que todo cuerpo es JSON válido. Sin límite, un cliente consume memoria; sin manejo de errores, un cuerpo mal formado puede afectar solicitudes que no tienen relación con él.

`req` es un stream legible. `for await (const chunk of req)` permite acumular los fragmentos; `Buffer.concat` los une y `JSON.parse` interpreta el texto. El parseo debe estar protegido porque un JSON inválido lanza una excepción.

`req.headers` contiene nombres normalizados en minúsculas. `content-type` declara el formato recibido. El límite debe medir `chunk.length` en bytes mientras llega el stream, no caracteres después de cargar todo. `415` comunica formato no admitido, `413` tamaño excesivo y `400` sintaxis inválida.

**Analogía:** el documento llega en varios sobres. Recepción revisa la etiqueta y el peso antes de abrirlos, los ensambla en orden y solo entonces interpreta el documento.

#### Practica

Desde una carpeta vacía:

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

Arranca y envía JSON válido:

```bash
node src/server.js
```

```bash
curl -i -X POST http://127.0.0.1:3002/eco -H "Content-Type: application/json" -d '{"nombre":"Ana"}'
```

**Resultado esperado:** `200` y `{"recibido":{"nombre":"Ana"}}`.

**Fallo deliberado y corrección:** repite sin la cabecera `Content-Type`: recibes `415`. Después envía `-d '{nombre:Ana}'` con la cabecera correcta: recibes `400 JSON inválido`. Restaura el cuerpo `{"nombre":"Ana"}` y verifica `200`; el proceso permanece disponible durante los tres casos.

**Práctica guiada:** reduce `LIMITE_BYTES` a `20` y envía un JSON que lo supere. Comprueba `413`, restaura después un límite razonable y no lo aumentes solo para ocultar la prueba.

**Ejercicio independiente:** exige `x-request-id` de 8 a 40 caracteres. Entrega un caso válido y otro con `400`, y explica por qué la cabecera se valida antes de la lógica de negocio.

#### Aplica

En el **[Proyecto integrador: entrada acotada](#proyecto-3-api-http-nativa-de-tareas)**, limita tamaño y formato del cuerpo de creación. JSON inválido, cuerpo excesivo y cabecera incompatible deben rechazarse antes de agregar una tarea.

**Checklist de salida**

- [ ] Escribiste un proyecto nuevo sin middleware.
- [ ] Acumulas chunks y mides bytes antes de parsear.
- [ ] Un tipo no admitido devuelve `415`.
- [ ] Un cuerpo excesivo devuelve `413` durante la lectura.
- [ ] JSON inválido devuelve `400` y no derriba el proceso.
- [ ] Los identificadores de solicitud se validan sin imprimir datos sensibles.

**Errores comunes:** asumir `req.body`, omitir límite, validar el tipo después de consumir el cuerpo, responder `500` a errores del cliente y medir caracteres en lugar de bytes.

**Fuentes oficiales:** [`IncomingMessage.headers`](https://nodejs.org/api/http.html#messageheaders), [estado `400`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/400), [estado `413`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/413) y [estado `415`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/415).

### Tema 4: Códigos de estado y content negotiation · Intermedio · 75 min

#### Aprende

**Prerrequisitos:** Node LTS y cabeceras HTTP básicas. Este ejemplo es independiente.

**Al terminar podrás:** elegir estados HTTP coherentes, servir JSON o texto según `Accept`, declarar `Content-Type` y `Vary`, y distinguir `406` de `404`.

**Por qué importa:** los clientes automatizados deciden reintentos y alertas según el estado, no según una interpretación humana del cuerpo. Un mismo recurso puede necesitar JSON para una aplicación y texto para una terminal sin obligar a adivinar el formato.

Usa `200` para consulta correcta, `201` para creación, `400` para petición inválida, `404` para recurso inexistente y `500` para fallo inesperado del servidor. El código forma parte del contrato.

`Accept` expresa qué representaciones acepta el cliente. El servidor elige una que pueda producir y la declara en `Content-Type`. `Vary: Accept` advierte a las cachés que la respuesta cambia según esa cabecera. Si el recurso existe pero no hay representación compatible, corresponde `406`.

**Analogía:** el estado es una señal de tráfico común para personas y sistemas. `Accept` es el idioma que el visitante acepta y `Content-Type` el idioma en que finalmente recibe el documento.

#### Practica

Desde una carpeta vacía:

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

Arranca y prueba las dos representaciones:

```bash
node src/server.js
```

```bash
curl -i -H "Accept: application/json" http://127.0.0.1:3003/producto
curl -i -H "Accept: text/plain" http://127.0.0.1:3003/producto
```

**Resultado esperado:** ambas respuestas usan `200`, una con JSON y otra con texto; ambas incluyen `Vary: Accept`.

**Fallo deliberado y corrección:** solicita `curl -i -H "Accept: application/xml" http://127.0.0.1:3003/producto`. Recibes `406`: el recurso existe, pero no hay XML. Cambia `Accept` a `application/json` y vuelve a `200`. Solicita `/productos` para comparar el `404` de ruta inexistente.

**Práctica guiada:** añade `text/csv` con una cabecera y una fila, conserva `Vary: Accept` y verifica el `Content-Type` con `curl -i`.

**Ejercicio independiente:** crea `POST /producto` que valide nombre y precio, responda `201` al crear y `400` cuando falte un campo. Entrega creación válida, body inválido y formato no aceptado, explicando cada estado.

#### Aplica

En el **[Proyecto integrador: representaciones de tareas](#proyecto-3-api-http-nativa-de-tareas)**, ofrece JSON y texto solo si ambos son necesarios, y conserva estados coherentes para creación, entrada inválida y recursos ausentes.

**Checklist de salida**

- [ ] El proyecto fue creado manualmente desde una carpeta vacía.
- [ ] JSON y texto tienen el `Content-Type` que realmente describen.
- [ ] Las respuestas variables incluyen `Vary: Accept`.
- [ ] Un formato incompatible devuelve `406`, no `404`.
- [ ] Una creación válida usa `201` y una entrada inválida usa `400`.
- [ ] Puedes justificar cuándo negociar formatos añade complejidad innecesaria.

**Cuándo no usarlo:** si solo existe un consumidor y un formato fijo, fija `Content-Type` y evita negociación manual. No inventes formatos que el servidor no pueda serializar correctamente.

**Fuentes oficiales:** [negociación de contenido en MDN](https://developer.mozilla.org/es/docs/Web/HTTP/Content_negotiation), [cabecera `Accept`](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Headers/Accept), [cabecera `Vary`](https://developer.mozilla.org/es/docs/Web/HTTP/Reference/Headers/Vary) y [estado `406`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/406).

### Tema 5: Paginación por cursor y límites de entrada comprobables · Intermedio · 60 min

#### Aprende

**Prerrequisitos:** arrays, módulos ESM, HTTP y `node:test`; Node 24 o superior. Comprueba `node --version`.

**Al terminar podrás:** diseñar un corte estable con cursor, detectar la página siguiente sin cargar resultados innecesarios y rechazar cursores o tamaños inválidos antes de consultar datos.

**Por qué importa:** la API no debe cargar todos los envíos en una petición ni repetir elementos por ordenar solo una fecha no única. La paginación afecta memoria, latencia y la capacidad de reanudar una lectura.

El cursor representa una posición en un orden estable. Aquí es un identificador entero ascendente y único: la página incluye IDs estrictamente mayores. Seleccionar `size + 1` elementos permite saber si existe otra página; el último ID visible se convierte en el cursor siguiente.

En una base de datos, filtro, orden y límite deben ejecutarse en la consulta con un índice apropiado. Este ejemplo en memoria aísla el algoritmo, pero no demuestra escalabilidad ni una foto inmutable bajo concurrencia. Un cursor real conserva filtros y orden, y nunca elude autorización.

**Analogía:** el cursor es un separador que indica después de qué ficha continuar. Pedir una ficha adicional permite saber si queda otra sección sin mostrarla todavía.

#### Practica

Desde una carpeta vacía:

```bash
mkdir cursor-envios
cd cursor-envios
```

Crea `pagina.mjs`:

```js
export function pagina(rows, after = 0, size = 2) {
  if (!Number.isSafeInteger(after) || after < 0 ||
      !Number.isSafeInteger(size) || size < 1 || size > 100) {
    throw new RangeError("Cursor o tamaño inválido");
  }
  const selected = rows.filter(row => row.id > after)
    .sort((a, b) => a.id - b.id).slice(0, size + 1);
  const items = selected.slice(0, size);
  return { items, next: selected.length > size ? items.at(-1).id : null };
}
```

Crea `pagina.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { pagina } from "./pagina.mjs";

const rows = [1, 2, 3, 4, 5].map(id => ({ id }));

test("recorre sin repetir y termina", () => {
  const first = pagina(rows);
  const second = pagina(rows, first.next);
  assert.deepEqual(first.items.map(x => x.id), [1, 2]);
  assert.deepEqual(second.items.map(x => x.id), [3, 4]);
  assert.equal(pagina(rows, second.next).next, null);
});

test("rechaza límites y cursor inválidos", () => {
  assert.throws(() => pagina(rows, 0, 1000), RangeError);
  assert.throws(() => pagina(rows, -1, 2), RangeError);
});
```

Ejecuta:

```bash
node --test pagina.test.mjs
```

**Resultado esperado:** dos pruebas correctas. La primera recorre IDs `1,2`, después `3,4` y termina sin cursor; la segunda rechaza tamaño `1000` y cursor `-1`.

**Fallo deliberado y corrección:** cambia `row.id > after` por `>=`. La segunda página repite el último elemento anterior y la prueba falla. Restaura `>` para que «después de» sea estricto y repite las pruebas.

**Práctica guiada:** añade casos de lista vacía, tamaño `1` y cursor mayor que el último ID. Verifica elementos, cursor siguiente y ausencia de repeticiones.

**Ejercicio independiente:** diseña el contrato HTTP con parámetros `after` y `size`, y respuesta `400` para valores inválidos. Escribe `contrato.http.md` con ejemplos y justifica por qué no convertir texto inválido silenciosamente a cero.

#### Aplica

Lleva el cursor al **[Proyecto integrador: listado acotado](#proyecto-3-api-http-nativa-de-tareas)**. El siguiente paso será trasladar filtro, orden único y límite a SQL con un índice, y medir con datos representativos.

**Checklist de salida**

- [ ] Creaste `pagina.mjs` y sus pruebas desde una carpeta vacía.
- [ ] El cursor usa un orden único y una comparación estricta.
- [ ] El elemento adicional determina `next` sin incluirlo en la página.
- [ ] Tamaño y cursor se validan antes de seleccionar.
- [ ] Lista vacía, tamaño uno y cursor final tienen pruebas explícitas.
- [ ] Reconoces que memoria y concurrencia requieren otra verificación.

**Errores comunes:** ordenar por un campo no único, aceptar tamaños sin límite y paginar después de cargar todos los datos.

**Fuente oficial:** [Node test runner](https://nodejs.org/api/test.html).

## Laboratorio práctico

### Proyecto 3: API HTTP nativa de tareas

Desde una carpeta vacía crea `api-http-tareas/` y ejecuta `npm init -y`. Escribe manualmente un proyecto ESM con `src/server.js` y las funciones auxiliares que necesites, sin framework ni archivos copiados de los temas.

**Entregable:** un servidor con `GET /salud`, `GET /tareas` y `POST /tareas`; body JSON limitado, estados explícitos y representaciones JSON o texto según `Accept`.

**Criterios de aceptación observables:**

1. `GET /salud` responde `200` y JSON válido.
2. La primera consulta de tareas devuelve una lista vacía; una creación válida devuelve `201`; la consulta posterior contiene la tarea.
3. JSON inválido devuelve `400`, tamaño excesivo `413`, tipo incompatible `415` y ruta desconocida `404`, sin derribar el proceso.
4. `Accept: application/json` y `Accept: text/plain` producen representaciones y cabeceras coherentes con `Vary: Accept`.
5. Un listado paginado valida `after` y `size`, no repite elementos y termina con `next: null`.
6. El README escrito por ti incluye los comandos `curl`, salidas esperadas y la advertencia de que el estado en memoria desaparece al reiniciar.
