# Módulo 4: Express/Fastify — routing y middleware

## Aprende construyendo

Cada tema es un proyecto independiente que comienza en una carpeta vacía. Escribe manualmente todos los archivos indicados; no copies archivos prefabricados ni reutilices el código de otro tema. `npm init -y` crea el `package.json` de cada proyecto y `npm install` reconstruye las dependencias a partir de ese manifiesto.

### Tema 1: Middleware — orden de ejecución y next() · Básico · 75 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, terminal y nociones básicas de HTTP y JavaScript. No necesitas archivos de otros temas.

**Al terminar podrás:** ordenar middleware de Express, usar `next()` para continuar o detener una cadena y diagnosticar una petición que queda sin respuesta.

**Por qué importa:** una API de entregas debe registrar solicitudes, interpretar JSON y rechazar accesos antes de ejecutar una operación protegida. Si el orden es incorrecto, una ruta puede recibir un body sin procesar o ejecutar un caso de uso que debía quedar bloqueado.

Un middleware de Express es una función con la firma `(req, res, next)` que se ejecuta en el camino de una petición. Puede inspeccionar o modificar `req` y `res`, llamar `next()` para entregar el control o terminar la respuesta, por ejemplo con `res.status(401).end()`, sin invocar `next()`.

El orden de registro con `app.use()` determina el orden de ejecución. `express.json()`, incluido con Express, procesa el body JSON y expone `req.body` a los middleware y rutas posteriores; por eso debe registrarse antes de las rutas que lo leen. Del mismo modo, una regla de autenticación debe aparecer antes de las rutas que protege.

Olvidar `next()` sin enviar una respuesta interrumpe la cadena y deja la petición esperando. Llamar `next()` después de responder también es incorrecto: permite que otra capa intente responder una segunda vez.

Un logger puede escuchar el evento `finish` de `res`, que se emite cuando la respuesta terminó de enviarse. El listener se registra antes de `next()` y observa el desenlace de toda la cadena sin impedir que continúe. No uses ese registro para imprimir secretos del body.

**Conceptos clave:** función middleware, cadena de ejecución, `next()`, parsing de JSON y evento `finish`.

**Analogía:** cada middleware es un punto de control en una línea de ensamblaje. Puede preparar el producto y marcar «continúa», o detenerlo por una regla. Si no hace ninguna de las dos cosas, el producto queda inmóvil en esa estación.

```js
app.use(express.json());                    // 1: parsea el body
app.use((req, res, next) => {                 // 2: logging propio
  const inicio = Date.now();
  res.on("finish", () => console.log(`${req.method} ${req.url} - ${Date.now() - inicio}ms`));
  next();                                     // sin esto, la petición se cuelga
});
app.get("/tareas", (req, res) => res.json(tareas)); // 3: manejador final
```

#### Practica

Desde una carpeta vacía crea el proyecto e instala Express:

```bash
mkdir ejemplo-middleware-express
cd ejemplo-middleware-express
npm init -y
npm install express
mkdir src
```

Añade `"type": "module"` al nivel raíz de `package.json` y crea manualmente `src/server.js`:

```js
import express from "express";

const app = express();

app.use(express.json()); // 1. Debe ir antes de rutas que usan req.body.

app.use((req, res, next) => {
  const inicio = performance.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.path} -> ${res.statusCode} (${(performance.now() - inicio).toFixed(1)} ms)`);
  });
  next(); // 2. Entrega el control al siguiente middleware o ruta.
});

app.use("/privado", (req, res, next) => {
  if (req.get("x-demo-token") !== "aprender") {
    return res.status(401).json({ error: "Falta x-demo-token válido" });
  }
  next();
});

app.post("/eco", (req, res) => res.status(200).json({ recibido: req.body }));
app.get("/privado/mensaje", (_req, res) => res.json({ mensaje: "Acceso permitido" }));

app.listen(3004, "127.0.0.1", () => console.log("API en http://127.0.0.1:3004"));
```

`express.json()` va antes de `POST /eco`; el logger se ejecuta para cualquier ruta; el middleware `/privado` responde `401` o llama `next()`, nunca ambas cosas.

En una primera terminal ejecuta:

```bash
node src/server.js
```

En una segunda terminal prueba parsing y acceso protegido:

```bash
curl -i -X POST http://127.0.0.1:3004/eco -H "Content-Type: application/json" -d '{"tema":"middleware"}'
curl -i http://127.0.0.1:3004/privado/mensaje
curl -i http://127.0.0.1:3004/privado/mensaje -H "x-demo-token: aprender"
```

**Resultado esperado:** el POST devuelve el objeto recibido; la primera solicitud privada devuelve `401`; la segunda devuelve `200`. La consola del servidor registra cada respuesta con método, ruta, estado y duración.

**Fallo deliberado y corrección:** comenta temporalmente `next()` dentro del logger y envía nuevamente el POST. La petición queda esperando porque ningún middleware posterior responde. Detén `curl` con `Ctrl+C`, restaura `next()`, reinicia el servidor y repite la solicitud hasta recuperar el `200`. El diagnóstico es una cadena interrumpida, no un fallo de Express.

**Práctica guiada:** agrega un middleware que incluya `x-request-id` en cada respuesta. Usa `res.set("x-request-id", ...)` y llama `next()`; comprueba la cabecera con `curl -i`. Regístralo antes de las rutas y verifica que también aparezca en el `401`.

#### Aplica

**Ejercicio independiente:** crea un middleware que rechace `Content-Type` distinto a JSON solamente en `POST /eco`. Entrega una solicitud válida y otra con `text/plain`, y explica por qué no conviene aplicar esa regla a un `GET` sin body.

En el **[Proyecto integrador: API operativa de entregas](#proyecto-4-api-operativa-de-entregas)**, ordena correlación, autenticación, validación y manejador de errores. Prueba que una identidad rechazada no ejecuta el caso de uso y que cada petición recibe una sola respuesta.

**Checklist de salida.**

- [ ] Creaste `package.json` y `src/server.js` manualmente en una carpeta nueva.
- [ ] `express.json()` se ejecuta antes de la ruta que lee `req.body`.
- [ ] El middleware privado continúa o responde, sin hacer ambas cosas.
- [ ] Reprodujiste la petición detenida y la corregiste restaurando `next()`.
- [ ] El logger registra el estado final sin revelar el contenido del body.
- [ ] La cabecera `x-request-id` aparece en respuestas exitosas y rechazadas.

**Si falla.** Una petición que nunca termina suele indicar un middleware sin `next()` y sin respuesta; un intento de responder dos veces indica que llamaste `next()` después de enviar. Revisa primero el orden de registro y las ramas de cada middleware.

**Errores comunes:** registrar `express.json()` después de la ruta; olvidar `next()`; llamar `next()` después de responder; convertir una regla local en global; imprimir secretos en los logs.

**Fuentes oficiales:** [guía de middleware de Express](https://expressjs.com/en/guide/using-middleware.html), [`express.json`](https://expressjs.com/en/api.html#express.json) y [evento `finish` de Node](https://nodejs.org/api/http.html#event-finish).

### Tema 2: Routers anidados · Básico · 75 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, imports ESM y rutas HTTP básicas. Este proyecto no reutiliza archivos de otros temas.

**Al terminar podrás:** separar un grupo de rutas con `express.Router()`, montarlo bajo un prefijo y aplicar middleware únicamente a ese grupo.

**Por qué importa:** cuando una API suma usuarios, productos, pedidos y entregas, acumular todas las rutas en `app.js` oculta responsabilidades y aumenta los conflictos de mantenimiento. Un router por dominio permite cambiar un grupo sin alterar las rutas internas de los demás.

`express.Router()` crea una instancia independiente que agrupa rutas relacionadas y admite sus propios middleware y manejadores por verbo. No crea otro servidor: sigue participando en el mismo ciclo de petición de la aplicación principal.

Montar `app.use("/tareas", router)` añade un prefijo. Dentro del router, `router.get("/")` representa la raíz del grupo; desde fuera queda disponible bajo `/tareas`. Para reorganizar el grupo basta con cambiar el punto de montaje, sin repetir el prefijo en cada ruta interna.

Esta separación facilita que un equipo trabaje en dominios distintos y que una regla, como autenticación de administración, se aplique solo al router correspondiente. Un router no debe importar el objeto `app`: recibir sus dependencias explícitamente mantiene la dirección de las dependencias comprensible.

**Conceptos clave:** `express.Router()`, modularización de rutas, montaje con prefijo y parámetros de ruta.

**Analogía:** el `app` es un edificio y un `Router` es un departamento con procedimientos propios. El prefijo es su dirección pública y `router.get("/")` es su recepción; reorganizar el interior no cambia la dirección del edificio.

```js
// routers/tareas.js
const router = Router();
router.get("/", (req, res) => res.json(tareas));
router.post("/", (req, res) => { /* ... */ });
export default router;

// app.js
app.use("/tareas", router); // todas las rutas del router viven bajo /tareas
```

#### Practica

Desde una carpeta vacía crea el proyecto e instala Express:

```bash
mkdir ejemplo-routers-express
cd ejemplo-routers-express
npm init -y
npm install express
mkdir -p src/routers
```

En PowerShell usa `New-Item -ItemType Directory -Force src/routers`. Añade `"type": "module"` a `package.json` y crea manualmente `src/routers/tareas.js`:

```js
import { Router } from "express";

const router = Router();
const tareas = [];

router.get("/", (_req, res) => {
  res.json({ tareas });
});

router.post("/", (req, res) => {
  const titulo = req.body?.titulo?.trim();
  if (!titulo) return res.status(400).json({ error: "titulo es obligatorio" });

  const tarea = { id: tareas.length + 1, titulo };
  tareas.push(tarea);
  res.status(201).json({ tarea });
});

router.get("/:id", (req, res) => {
  const tarea = tareas.find((item) => item.id === Number(req.params.id));
  if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
  res.json({ tarea });
});

export default router;
```

Crea `src/app.js`:

```js
import express from "express";
import tareasRouter from "./routers/tareas.js";

const app = express();
app.use(express.json()); // Debe ejecutarse antes del router que lee req.body.
app.use("/api/tareas", tareasRouter); // El router recibe rutas relativas a este prefijo.

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.listen(3005, "127.0.0.1", () => console.log("API en http://127.0.0.1:3005"));
```

`router.post("/")` se expone como `POST /api/tareas`; `req.params.id` existe porque la ruta define `:id`. El arreglo es temporal y solo sirve para estudiar routing, no para guardar datos reales.

Ejecuta en una terminal:

```bash
node src/app.js
```

En otra terminal crea y consulta una tarea:

```bash
curl -i -X POST http://127.0.0.1:3005/api/tareas -H "Content-Type: application/json" -d '{"titulo":"Separar routers"}'
curl -i http://127.0.0.1:3005/api/tareas/1
```

**Resultado esperado:** el POST devuelve `201`; la consulta devuelve `200` con la misma tarea. La URL externa incluye `/api/tareas`, aunque dentro del router las rutas sean `"/"` y `"/:id"`.

**Fallo deliberado y corrección:** cambia temporalmente el import a `./routers/tarea.js`. Node reporta `ERR_MODULE_NOT_FOUND`, que identifica un nombre o ruta de archivo incorrecto. Restaura el import, reinicia y prueba `GET /api/tareas/99`: el `404` ahora corresponde a una tarea inexistente, no a un archivo ausente.

**Práctica guiada:** agrega `router.use()` que escriba `Tareas: METHOD PATH` en la consola. Regístralo antes de las rutas para que se ejecute en cada solicitud del router y comprueba que no registra solicitudes ajenas a `/api/tareas`.

#### Aplica

**Ejercicio independiente:** crea manualmente `src/routers/salud.js`, móntalo en `/api/salud` y responde `GET /` con estado `ok`. Entrega las pruebas de ambos routers y explica por qué ninguno debe importar el objeto `app` principal.

En el **[Proyecto integrador: API operativa de entregas](#proyecto-4-api-operativa-de-entregas)**, aplica un router por dominio y monta cada uno con un prefijo. Separa recursos como usuarios, pedidos o productos en archivos propios en vez de acumularlos en `app.js`; esta misma organización podrás reutilizar conceptualmente en la API productiva del track.

**Checklist de salida.**

- [ ] Escribiste el router y la aplicación desde cero en archivos separados.
- [ ] Las rutas internas usan `"/"` y `"/:id"`, sin repetir `/api/tareas`.
- [ ] `express.json()` se registra antes de montar el router.
- [ ] El middleware de tareas no se ejecuta para rutas ajenas a ese grupo.
- [ ] Distingues `ERR_MODULE_NOT_FOUND` de un `404` de recurso.
- [ ] El router de salud funciona sin importar `app`.

**Si falla.** Si todas las rutas del router devuelven el `404` general, comprueba el prefijo de montaje y las rutas relativas. Si `req.body` es `undefined`, revisa la posición de `express.json()` y la cabecera `Content-Type`.

**Cuándo no usarlo:** en una API con solo unas pocas rutas, un router por cada grupo puede añadir archivos e indirecciones sin beneficio. Declararlas directamente sobre `app` es suficiente hasta que un conjunto coherente de rutas justifique separarlo.

**Errores comunes:** repetir el prefijo dentro de cada ruta; importar `app` dentro de un router; usar el mismo mensaje para recurso inexistente y ruta desconocida; guardar datos reales en arrays.

**Fuentes oficiales:** [Express Router](https://expressjs.com/en/guide/routing.html), [`express.Router`](https://expressjs.com/en/api.html#express.router) y [parámetros de ruta](https://expressjs.com/en/guide/routing.html#route-parameters).

### Tema 3: Validación de entrada con Zod y manejo centralizado de errores · Intermedio · 75 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, Express y JSON básicos. El ejemplo comienza en otra carpeta vacía y no depende de servidores anteriores.

**Al terminar podrás:** validar una entrada con Zod, devolver errores de cliente consistentes y enviar fallos inesperados a un único middleware de Express.

**Por qué importa:** una API de tareas o entregas no debe dejar que datos malformados lleguen a la lógica de negocio o a persistencia. Tampoco debe exponer stacks ni detalles internos al cliente: separar contrato, ejecución y formato de errores hace que cada fallo tenga una respuesta deliberada.

Zod declara la forma esperada de los datos. `schema.safeParse(datos)` devuelve un resultado estructurado: si la validación tiene éxito, ofrece los datos validados; si falla, contiene los campos y reglas que no se cumplieron. La ruta puede convertir ese resultado en un `400` específico en lugar de dejar que el dato avance.

Express reconoce un middleware de errores por sus **cuatro parámetros** `(err, req, res, next)`. Se registra al final de middleware y rutas; recibe errores pasados mediante `next(error)` y centraliza registro, estado y representación pública. La ruta no necesita repetir esa serialización.

No des por sentado el tratamiento de promesas rechazadas sin comprobar la versión de Express. En este ejemplo los fallos de trabajo asíncrono se capturan explícitamente con `try`/`catch` y se pasan a `next(error)`, de modo que el contrato no depende de una suposición. Validar el esquema tampoco sustituye reglas de negocio ni autorización.

**Conceptos clave:** esquemas de validación, `safeParse`, datos validados y middleware de error de cuatro parámetros.

**Analogía:** Zod es el control de calidad de entrada: rechaza materiales fuera de especificación con una lista de defectos. El middleware final es la recepción de incidentes: registra el fallo interno y entrega al cliente un mensaje público sin exponer el interior de la fábrica.

```js
const TareaSchema = z.object({ titulo: z.string().min(1), prioridad: z.enum(["baja", "alta"]) });
app.post("/tareas", (req, res) => {
  const resultado = TareaSchema.safeParse(req.body);
  if (!resultado.success) return res.status(400).json({ errores: resultado.error.issues });
  tareas.push(resultado.data);
  res.status(201).json(resultado.data);
});
app.use((err, req, res, next) => { // 4 parámetros: Express lo reconoce como error handler
  console.error(err);
  res.status(500).json({ error: "Algo salió mal" });
});
```

#### Practica

Desde una carpeta vacía crea el proyecto e instala las dependencias:

```bash
mkdir ejemplo-zod-errores
cd ejemplo-zod-errores
npm init -y
npm install express zod
mkdir src
```

Añade `"type": "module"` a `package.json` y crea manualmente `src/server.js`:

```js
import express from "express";
import { z } from "zod";

const app = express();
const tareas = [];

const tareaSchema = z.object({
  titulo: z.string().trim().min(3, "titulo debe tener al menos 3 caracteres"),
  prioridad: z.enum(["baja", "media", "alta"]),
});

app.use(express.json());

app.post("/tareas", (req, res, next) => {
  const resultado = tareaSchema.safeParse(req.body);

  if (!resultado.success) {
    // issues contiene ruta y mensaje de cada regla que no se cumplió.
    return res.status(400).json({ error: "Entrada inválida", detalles: resultado.error.issues });
  }

  try {
    const tarea = { id: tareas.length + 1, ...resultado.data };
    tareas.push(tarea);
    return res.status(201).json({ tarea });
  } catch (error) {
    return next(error); // La ruta no decide cómo serializar fallos inesperados.
  }
});

app.get("/fallo-controlado", (_req, _res, next) => {
  next(new Error("Demostración de fallo interno"));
});

app.use((err, _req, res, _next) => {
  console.error("Error interno:", err.message);
  res.status(500).json({ error: "Error interno; consulta el registro del servidor" });
});

app.listen(3006, "127.0.0.1", () => console.log("API en http://127.0.0.1:3006"));
```

`safeParse` permite decidir el `400` sin capturar una excepción; `resultado.data` solo se usa cuando el esquema se cumplió. `next(error)` salta al handler final, cuya firma de cuatro parámetros es significativa para Express.

Ejecuta en una terminal:

```bash
node src/server.js
```

En otra terminal crea una tarea válida:

```bash
curl -i -X POST http://127.0.0.1:3006/tareas -H "Content-Type: application/json" -d '{"titulo":"Estudiar Zod","prioridad":"alta"}'
```

**Resultado esperado:** devuelve `201` con una tarea validada. La respuesta no incluye campos desconocidos porque el esquema define el contrato de entrada.

**Fallo deliberado y corrección:** envía `{"titulo":"x","prioridad":"urgente"}` con la misma cabecera. Debes obtener `400` con dos detalles: título corto y prioridad no permitida. Corrige el body con el ejemplo válido y recupera el `201`. Después solicita `/fallo-controlado`: el cliente recibe `500` sin el mensaje interno, mientras la consola muestra `Demostración de fallo interno`; no conviertas ese fallo de servidor en un `400`.

**Práctica guiada:** añade `fechaLimite: z.iso.date().optional()` al esquema. Prueba primero una fecha ISO válida (`2026-12-01`) y después `01/12/2026`; el segundo caso debe quedar en `400`, mientras omitir el campo debe seguir siendo válido.

#### Aplica

**Ejercicio independiente:** crea `PATCH /tareas/:id` usando un esquema parcial que no permita un body vacío. Entrega una actualización válida, un campo inválido y una tarea inexistente; explica la diferencia entre `400`, `404` y `500`.

En el **[Proyecto integrador: API operativa de entregas](#proyecto-4-api-operativa-de-entregas)**, valida identificador y evidencia antes de confirmar una entrega. Un error de esquema debe conservar detalles útiles del campo sin exponer stack ni transformarse en un error genérico del servidor.

**Checklist de salida.**

- [ ] Instalaste las dependencias y escribiste `src/server.js` en un proyecto nuevo.
- [ ] El body inválido produce `400` con detalles por campo.
- [ ] Solo `resultado.data` llega a la creación de la tarea.
- [ ] El middleware de errores tiene cuatro parámetros y está después de las rutas.
- [ ] El `500` público no contiene stack ni mensaje interno.
- [ ] La fecha opcional acepta ISO y rechaza el formato ambiguo.

**Si falla.** Un error de entrada no debe llegar al handler de `500`: revisa que uses `safeParse` y la rama `!resultado.success`. Si el handler no recibe `next(error)`, comprueba su firma y su posición al final de la cadena; captura explícitamente los rechazos de tu trabajo asíncrono.

**Errores comunes:** usar `parse` sin capturar su excepción; devolver `500` para errores de entrada; enviar `err.stack` al cliente; registrar el handler antes de las rutas; creer que validar reemplaza reglas de negocio.

**Fuentes oficiales:** [Zod: basic usage](https://zod.dev/basics), [manejo de errores en Express](https://expressjs.com/en/guide/error-handling.html), [estado `400`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/400) y [estado `500`](https://developer.mozilla.org/es/docs/Web/HTTP/Status/500).

### Tema 4: Express frente a Fastify · Intermedio · 75 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, HTTP e imports ESM. Este tema usa dos proyectos nuevos y no necesita archivos de otros temas.

**Al terminar podrás:** crear el mismo endpoint con Express y Fastify, localizar dónde valida cada framework y elegir según contrato, validación, ecosistema y operación.

**Por qué importa:** al iniciar una API de catálogo, elegir solo por popularidad o por una cifra aislada puede dejar al equipo con una ergonomía que no sabe mantener. Comparar el mismo contrato en ambos frameworks permite decidir con evidencia funcional y necesidades reales del producto.

Express organiza gran parte del trabajo como una cadena lineal de middleware y permite integrar validación externa, como Zod. Su ecosistema acumulado de middleware y su modelo mental pueden ser ventajas para un equipo que ya los conoce.

Fastify ofrece hooks como `onRequest` y `preHandler` para intervenir en etapas explícitas del ciclo de vida. Además integra JSON Schema en la definición de ruta para validar entradas y serializar respuestas. El esquema de respuesta también delimita qué campos se serializan; no añadas datos a la salida esperando que aparezcan si no forman parte de él.

La serialización generada a partir de schemas forma parte de la estrategia de rendimiento de Fastify, pero no convierte un ejemplo local en un benchmark ni garantiza un ganador universal. Para comparar rendimiento se necesita la misma carga, versión, configuración y medición. Para muchos proyectos ambos frameworks son viables: pesan también la familiaridad del equipo, los plugins necesarios, el tipado y la operación.

**Conceptos clave:** middleware lineal, hooks, JSON Schema nativo, validación, serialización y comparación controlada.

**Analogía:** Express es una cocina flexible a la que agregas herramientas mediante middleware. Fastify es una cocina con estaciones y especificaciones integradas: hooks para etapas precisas y schemas junto a cada receta. Ambos pueden entregar el mismo plato; difieren en cómo organizan el trabajo y qué garantías declaran cerca de la ruta.

```text
Express: middleware lineal (app.use), validación externa (Zod), ecosistema de middleware
Fastify: hooks granulares (onRequest/preHandler), JSON Schema integrado,
         serialización generada a partir del schema de respuesta
```

#### Practica

Desde una carpeta vacía crea dos proyectos, uno por framework:

```bash
mkdir ejemplo-express-vs-fastify
cd ejemplo-express-vs-fastify
mkdir express-api fastify-api
cd express-api
npm init -y
npm install express
mkdir src
cd ../fastify-api
npm init -y
npm install fastify
mkdir src
cd ..
```

En ambos `package.json` añade `"type": "module"`. Crea manualmente `express-api/src/server.js`:

```js
import express from "express";

const app = express();
app.use(express.json());

app.get("/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "id debe ser un entero positivo" });
  }
  return res.json({ id, nombre: "Cuaderno" });
});

app.listen(3010, "127.0.0.1", () => console.log("Express en http://127.0.0.1:3010"));
```

Crea `fastify-api/src/server.js`:

```js
import Fastify from "fastify";

const app = Fastify({ logger: true });

app.get("/productos/:id", {
  schema: {
    params: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "integer", minimum: 1 } },
    },
    response: {
      200: {
        type: "object",
        required: ["id", "nombre"],
        properties: { id: { type: "integer" }, nombre: { type: "string" } },
      },
    },
  },
}, async (request) => {
  // Fastify valida params antes de invocar este handler.
  return { id: request.params.id, nombre: "Cuaderno" };
});

await app.listen({ port: 3011, host: "127.0.0.1" });
```

Express valida manualmente dentro de la ruta. Fastify declara el schema junto con la ruta y valida antes del handler; ambos deben exponer el mismo recurso válido.

Desde la raíz `ejemplo-express-vs-fastify`, arranca Express en una terminal y Fastify en otra:

```bash
node express-api/src/server.js
```

```bash
node fastify-api/src/server.js
```

En una tercera terminal compara respuestas válidas:

```bash
curl -i http://127.0.0.1:3010/productos/7
curl -i http://127.0.0.1:3011/productos/7
```

**Resultado esperado:** ambos devuelven `200` con `{"id":7,"nombre":"Cuaderno"}`. Fastify además escribe logs estructurados; Express no lo hace hasta que agregas un logger.

**Fallo deliberado y corrección:** solicita `/productos/cero` a ambos servidores. Express devuelve su `400` manual; Fastify devuelve `400` al validar `params` antes del handler. Corrige el identificador usando `/productos/7` y recupera el mismo `200` en ambos. No interpretes el experimento como benchmark: solo muestra qué capa hace visible la validación.

**Práctica guiada:** agrega una marca de tiempo en Express con middleware que la ponga en `req`, y en Fastify con un hook `onRequest` que la ponga en `request`. No envíes la marca si no forma parte del schema de respuesta de Fastify; registra su existencia dentro del handler para comparar el punto de ejecución.

#### Aplica

**Ejercicio independiente:** implementa `POST /productos` en ambos proyectos. En Fastify declara `body` y `response`; en Express usa la validación manual que consideres necesaria. Entrega pruebas válidas e inválidas y una decisión razonada sobre cuál mantendrías para un equipo concreto. La evidencia debe mostrar ambas salidas HTTP para el mismo caso válido y explicar qué capa valida cada framework.

En el **[Proyecto integrador: API operativa de entregas](#proyecto-4-api-operativa-de-entregas)**, implementa el mismo contrato de consulta en el framework elegido y compruébalo por HTTP. Justifica la elección con plugins, tipado y necesidades observadas, manteniendo el dominio independiente del framework.

**Checklist de salida.**

- [ ] Creaste manualmente dos `package.json` y dos servidores independientes.
- [ ] El mismo identificador válido produce el mismo recurso en ambos frameworks.
- [ ] El identificador inválido produce `400` y sabes qué capa lo genera.
- [ ] El schema de Fastify declara `params` y la respuesta `200`.
- [ ] La marca de tiempo usa middleware en Express y `onRequest` en Fastify.
- [ ] Tu decisión no se basa en un benchmark aislado ni en popularidad.

**Si falla.** Si Fastify acepta una entrada que esperabas rechazar, comprueba que el schema esté asociado a esa ruta. Si un campo desaparece de su respuesta, revisa el schema de serialización. Si solo un servidor responde, confirma que cada proceso tenga su propia terminal y puerto.

**Errores comunes:** comparar rendimiento sin igualar carga, versión y configuración; usar Fastify sin schema y esperar validación; olvidar `express.json()`; mezclar APIs de plugins incompatibles; elegir por moda sin considerar al equipo.

**Fuentes oficiales:** [Express API](https://expressjs.com/en/api.html), [Fastify: getting started](https://fastify.dev/docs/latest/Guides/Getting-Started/), [Fastify validation and serialization](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/) y [Fastify hooks](https://fastify.dev/docs/latest/Reference/Hooks/).

### Tema 5: WebSocket — comunicación en tiempo real bidireccional · Intermedio · 75 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, nociones de HTTP, eventos y temporizadores de JavaScript. No necesitas archivos ni servidores de otros temas.

**Al terminar podrás:** abrir un canal WebSocket por el que el servidor empuje datos sin una solicitud por mensaje, enviar datos en ambas direcciones y explicar cuándo WebSocket aporta frente a HTTP y polling.

**Por qué importa:** el panel de una operación de entregas necesita ver la posición del repartidor en vivo. Consultar «¿nueva posición?» cada pocos segundos crea peticiones repetidas y solo descubre cambios en la siguiente consulta; una conexión persistente permite que el servidor comunique cada posición cuando la genera.

HTTP sigue principalmente un intercambio petición-respuesta. **WebSocket** comienza con un handshake HTTP y una actualización (`upgrade`) a una conexión persistente y bidireccional: cliente y servidor pueden enviar mensajes mientras la conexión permanezca abierta. La conexión no elimina la necesidad de comprobar el contenido recibido ni de limpiar los recursos asociados al cerrar.

**Conceptos clave:** conexión persistente bidireccional, handshake/upgrade, push del servidor y polling frente a WebSocket.

**Analogía:** HTTP se parece a enviar cartas: una pregunta y una respuesta por intercambio. WebSocket se parece a una llamada telefónica abierta: cualquiera de los dos puede hablar sin iniciar otra llamada, pero al colgar hay que terminar también las tareas asociadas.

#### Practica

Desde una carpeta vacía crea el proyecto e instala `ws`:

```bash
mkdir ejemplo-websocket-entregas
cd ejemplo-websocket-entregas
npm init -y
npm pkg set type=module
npm install ws
```

Crea manualmente `server.js`:

```js
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (socket) => {
  console.log("Repartidor conectado");
  // El servidor EMPUJA una posición nueva cada 2 segundos, sin que el cliente la pida.
  let lat = 4.60;
  const timer = setInterval(() => {
    lat += 0.001;
    socket.send(JSON.stringify({ guia: "RF-4471", lat }));
  }, 2000);
  socket.on("close", () => clearInterval(timer));
});
console.log("WebSocket en ws://localhost:3001");
```

Crea `cliente.js`:

```js
import WebSocket from "ws";

const socket = new WebSocket("ws://localhost:3001");
socket.on("message", (data) => console.log("Posición recibida:", data.toString()));
```

Usa **dos terminales**, ambas situadas en `ejemplo-websocket-entregas`. En la terminal 1 inicia el servidor y déjalo en primer plano:

```bash
node server.js
```

En la terminal 2 inicia el cliente:

```bash
node cliente.js
```

**Resultado esperado:** el cliente imprime una posición nueva cada dos segundos, por ejemplo `Posición recibida: {"guia":"RF-4471","lat":4.601}`, sin solicitar cada actualización. Al cerrar el cliente con `Ctrl+C`, el servidor limpia el intervalo de esa conexión.

**Fallo deliberado y corrección:** sustituye temporalmente la recepción persistente por un cliente que haga `fetch` a un endpoint HTTP cada dos segundos. Observa que cada consulta inicia un intercambio HTTP nuevo y solo recibe el estado disponible en ese momento; no es el canal push del ejemplo. Restaura `cliente.js` con la conexión WebSocket y verifica de nuevo que los mensajes llegan sin peticiones periódicas del cliente. Socket.IO añade capacidades como reconexión y salas sobre mecanismos de tiempo real; este ejemplo usa `ws` directamente para observar el canal base.

**Práctica guiada:** haz que el cliente envíe `confirmar entrega` cuando la conexión se abra y que el servidor responda ese mensaje. `socket.send(...)` funciona en ambas direcciones; añade un listener `message` en el servidor y conserva la limpieza del intervalo al cerrar.

#### Aplica

**Ejercicio independiente:** añade suscripciones por guía: conecta varios clientes y haz que el servidor empuje una posición solo a quienes siguen esa guía concreta. Entrega la prueba con dos clientes y guías distintas, además del mensaje cliente→servidor de la práctica guiada.

En el **[Proyecto integrador: API operativa de entregas](#proyecto-4-api-operativa-de-entregas)**, expón la posición del repartidor por un canal en tiempo real y comprueba que el panel recibe actualizaciones sin hacer polling.

**Checklist de salida.**

- [ ] Escribiste `server.js` y `cliente.js` desde cero en una carpeta nueva.
- [ ] Ejecutaste servidor y cliente en dos terminales, sin procesos en segundo plano ocultos.
- [ ] El servidor empuja posiciones sin una solicitud HTTP por actualización.
- [ ] El cliente también envía un mensaje y recibe la respuesta del servidor.
- [ ] Al cerrar cada socket se limpia su `setInterval`.
- [ ] Dos clientes suscritos a guías distintas reciben solo sus actualizaciones.

**Si falla.** Si el cliente no recibe nada, confirma que el servidor siga activo en la terminal 1, que el puerto coincida y que el intervalo no se haya limpiado antes de tiempo. Si los temporizadores continúan tras desconectar, revisa que `clearInterval(timer)` esté dentro del listener `close` de esa conexión.

**Cuándo no usarlo:** si los datos cambian rara vez o el cliente solo consulta ocasionalmente, HTTP normal es más simple y cacheable. WebSocket se justifica cuando las actualizaciones frecuentes deben ser empujadas por el servidor.

**Errores comunes:** dar por válido un mensaje sin verificar su contenido; cerrar el socket sin limpiar intervalos y listeners; confundir una demostración local con un sistema ya provisto de reconexión, autorización o entrega garantizada.

**Fuentes oficiales:** [MDN — WebSocket](https://developer.mozilla.org/es/docs/Web/API/WebSockets_API), [`ws`](https://github.com/websockets/ws) y [documentación de Node.js](https://nodejs.org/docs/latest/api/).

### Tema 6: Subida de archivos — multipart y validación segura · Intermedio · 75 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, HTTP y middleware básico de Express. Este proyecto comienza en una carpeta vacía y no reutiliza archivos de otros temas.

**Al terminar podrás:** recibir una foto de evidencia con `multipart/form-data`, limitar su tamaño, filtrar el MIME declarado, guardarla con un nombre generado por el servidor y explicar qué validaciones todavía hacen falta antes de producción.

**Por qué importa:** una evidencia de entrega es también una entrada no confiable. Un archivo demasiado grande puede agotar recursos, un nombre manipulado puede alterar rutas y una extensión o cabecera MIME puede mentir. La frontera de validación está en el backend, no en el formulario.

Los formularios con archivos usan `multipart/form-data`: el cuerpo se divide en partes con sus propias cabeceras. En Express, `multer` separa campos de texto y archivos. `limits.fileSize` restringe el tamaño y `fileFilter` permite rechazar tipos declarados antes de que la ruta use el archivo.

`file.mimetype` procede de la información enviada por el cliente. Su allowlist es una comprobación preliminar, **no prueba que los bytes sean realmente una imagen JPEG o PNG**. La extensión tampoco lo demuestra. Un sistema de producción debe verificar el contenido con mecanismos adecuados, como comprobación de firmas binarias y decodificación segura, además de aplicar los demás controles de seguridad.

Nunca uses directamente `file.originalname` como nombre de destino. Genera un identificador en el servidor y deriva la extensión de tu propia allowlist; así el nombre original no controla la ruta. Para archivos grandes o despliegues a escala, el disco local tampoco es el destino apropiado: utiliza almacenamiento de objetos y URLs prefirmadas según el diseño del sistema.

**Conceptos clave:** `multipart/form-data`, `multer`, límite de tamaño, MIME declarado, nombre generado por el servidor y verificación de contenido pendiente.

**Analogía:** recepción puede limitar el peso de un paquete y rechazar una etiqueta no admitida, pero la etiqueta no demuestra qué hay dentro. El nombre interno asignado por recepción evita que el remitente decida la ubicación; inspeccionar el contenido es un control adicional.

#### Practica

Desde una carpeta vacía crea el proyecto, la carpeta de destino e instala dependencias:

```bash
mkdir ejemplo-subida-segura
cd ejemplo-subida-segura
npm init -y
npm pkg set type=module
npm install express multer
mkdir -p uploads
```

En PowerShell puedes usar `New-Item -ItemType Directory -Force uploads`. Crea manualmente `server.js`:

```js
import { randomUUID } from "node:crypto";
import express from "express";
import multer from "multer";

const app = express();
const extensionesPermitidas = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => {
      // El cliente no controla el nombre ni la ruta de destino.
      cb(null, `${randomUUID()}${extensionesPermitidas[file.mimetype]}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 }, // máximo 2 MB
  fileFilter: (_req, file, cb) => {
    // Es un filtro del MIME declarado, no una inspección del contenido real.
    if (!extensionesPermitidas[file.mimetype]) {
      return cb(new Error("Solo JPEG o PNG"));
    }
    cb(null, true);
  },
});

app.post("/entregas/:guia/evidencia", upload.single("foto"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "foto es obligatoria" });
  res.json({ guardado: req.file.filename, guia: req.params.guia });
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError || err.message === "Solo JPEG o PNG") {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Error interno" });
});

app.listen(3000, () => console.log("API en http://localhost:3000"));
```

Crea con un editor de imágenes una fotografía JPEG pequeña llamada `una-foto.jpg` en la raíz del proyecto. En una primera terminal ejecuta:

```bash
node server.js
```

En una segunda terminal, desde la misma carpeta, envía la evidencia:

```bash
curl -F "foto=@una-foto.jpg" http://localhost:3000/entregas/RF-4471/evidencia
```

**Resultado esperado:** la respuesta contiene un nombre con UUID y extensión `.jpg`, junto con `"guia":"RF-4471"`. El archivo aparece en `uploads/` con ese nombre generado; el nombre original no forma parte de la ruta.

**Fallo deliberado y corrección:** crea un archivo de texto llamado `falso.txt` y envíalo:

```bash
curl -F "foto=@falso.txt;type=text/plain" http://localhost:3000/entregas/RF-4471/evidencia
```

El filtro devuelve `400` con `Solo JPEG o PNG`. Prueba también un archivo mayor de 2 MB: `multer` lo rechaza por `LIMIT_FILE_SIZE` y el handler lo convierte en `400`. Corrige la entrada usando una imagen JPEG o PNG real dentro del límite y recupera la respuesta exitosa. Estos rechazos comprueban MIME declarado y tamaño, no el contenido real: si fuerzas `type=image/jpeg` en un texto, el filtro MIME por sí solo puede aceptarlo; no presentes esa cabecera como verificación de imagen.

**Práctica guiada:** mejora el manejador de errores para distinguir `LIMIT_FILE_SIZE` del tipo declarado no permitido y devolver mensajes claros de `400`, sin exponer stack. Conserva el `500` genérico para errores realmente internos y prueba ambos rechazos.

#### Aplica

**Ejercicio independiente:** guarda la referencia del archivo —nombre generado, tamaño y guía— en una estructura en memoria y expón `GET /entregas/:guia/evidencia` que devuelva la metadata. No guardes el binario en esa estructura ni uses el nombre original como clave o ruta; conserva únicamente la referencia controlada.

En el **[Proyecto integrador: API operativa de entregas](#proyecto-4-api-operativa-de-entregas)**, recibe la foto de evidencia validando tamaño y MIME declarado, genera el nombre en el servidor y guarda solo la referencia. Para la variante de producción, deja el binario en almacenamiento de objetos y añade verificación real del contenido antes de aceptarlo como imagen.

**Checklist de salida.**

- [ ] Creaste `server.js`, el manifiesto y `uploads/` en un proyecto independiente.
- [ ] `limits.fileSize` rechaza archivos mayores de 2 MB con un `400` claro.
- [ ] El filtro solo admite los MIME declarados JPEG y PNG.
- [ ] Explicas por escrito por qué ese MIME no demuestra el contenido real.
- [ ] El nombre guardado es un UUID con extensión de la allowlist, nunca `originalname`.
- [ ] La consulta por guía devuelve metadata sin incluir el binario.

**Si falla.** Un `LIMIT_FILE_SIZE` indica que el límite funcionó; no lo soluciones aumentando el límite sin criterio. Si una ruta contiene el nombre del cliente, corrige `filename` para usar únicamente el identificador generado. Si un texto etiquetado como imagen atraviesa `fileFilter`, el diagnóstico es que falta verificar los bytes, no que el MIME sea una prueba suficiente.

**Cuándo no usarlo:** para archivos grandes o producción a escala, no guardes los binarios en el disco del servidor de aplicación. `multer` a disco sirve para este laboratorio y cargas pequeñas; almacenamiento de objetos y URLs prefirmadas requieren un diseño distinto.

**Errores comunes:** confiar en extensión o MIME como prueba de contenido; omitir `limits.fileSize`; concatenar `originalname` a una ruta; guardar binarios en la base o en memoria cuando solo se necesita su referencia; omitir un handler que traduzca errores de subida.

**Fuentes oficiales:** [`multer`](https://github.com/expressjs/multer), [OWASP — File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload) y [documentación de Node.js](https://nodejs.org/docs/latest/api/).

## Laboratorio práctico

### Proyecto 4: API operativa de entregas

Desde una carpeta vacía crea `api-operativa-entregas/` y escribe manualmente todos sus archivos. Este proyecto de cierre es independiente de los seis ejemplos: no copies sus servidores ni dependas de que sigan ejecutándose. Implementa aquí las variantes mínimas necesarias y documenta en tu propio README los comandos y resultados.

**Objetivo del laboratorio:** construir una API REST con Express que incluya middleware de logging, validación con Zod y manejo de errores centralizado, y repetir el mismo ejercicio con Fastify para comparar. Integra después los contratos de entrega planteados en el módulo sin mezclar el dominio con el framework.

**Requisitos previos:** Node.js LTS, npm y los fundamentos de Node y HTTP de los Módulos 0–3. No se reutilizan archivos de esos módulos.

**Construcción guiada del proyecto:**

1. Crea la API base con Express, su `package.json`, `src/app.js` y un router propio. Implementa `GET /tareas` y `POST /tareas` con `express.json()` antes del router; verifica el flujo básico.
2. Escribe un middleware de logging que registre método, ruta, estado y tiempo de respuesta usando `finish`, sin imprimir secretos del body.
3. Organiza las rutas en `src/routers/tareas.js` y móntalo con `app.use("/tareas", router)`; conserva las rutas internas relativas al prefijo.
4. Agrega validación con Zod en una frontera de entrada. Responde `400` con errores específicos cuando el body no cumpla el esquema.
5. Implementa al final un middleware de cuatro parámetros para errores inesperados. Pasa los fallos con `next(error)` y captura explícitamente el trabajo asíncrono que uses.
6. Crea un proyecto Fastify separado dentro del laboratorio y replica la misma funcionalidad con JSON Schema nativo en vez de Zod. Compara ergonomía de schemas y declaración de middleware/hooks; no declares una conclusión de rendimiento sin una medición controlada.
7. Añade el contrato de consulta de una entrega en el framework elegido y un canal WebSocket que empuje posiciones a suscriptores de una guía. Prueba servidor y cliente en dos terminales y limpia los recursos al cerrar.
8. Añade la subida de evidencia con límite de tamaño, filtro de MIME declarado y nombre generado por el servidor. Expón solo su metadata; documenta que la verificación real del contenido sigue siendo necesaria y que el almacenamiento de objetos sustituye al disco local en la variante de producción.

**Verificación y criterios de aceptación observables:**

- La API Express responde correctamente en tres escenarios: éxito, validación fallida y error interno.
- La versión Fastify replica la misma funcionalidad con JSON Schema nativo y produce el mismo contrato para el caso válido.
- Una identidad rechazada no ejecuta el caso de uso y cada petición recibe una sola respuesta.
- Un recurso inexistente se distingue de una ruta desconocida y de un fallo de validación.
- El panel WebSocket recibe actualizaciones de su guía sin polling y cada desconexión limpia su intervalo.
- La subida rechaza tamaño excesivo y MIME declarado no permitido, nunca usa el nombre original como ruta y devuelve metadata consultable.
- El README distingue las comprobaciones implementadas de las pendientes, especialmente inspección real del contenido y controles de producción.

**Errores comunes y soluciones:**

- **Handler de errores antes que las rutas:** debe registrarse al final para recibir los errores de la cadena.
- **Rechazos asíncronos sin diagnóstico:** captura el trabajo con `try`/`catch` y pásalo a `next(error)` de forma explícita.
- **Middleware aplicado en el alcance equivocado:** uno registrado en `app` antes del router afecta a todas esas rutas; uno registrado solo en el router queda limitado a ese grupo.
- **MIME tratado como contenido verificado:** el filtro es preliminar; añade verificación de bytes antes de considerar segura una subida real.
- **Procesos ocultos en segundo plano:** mantén servidores y clientes en terminales visibles para observar logs y cerrarlos deliberadamente.

La ejecución de estos criterios en tu proyecto es la evidencia del módulo; una marca de finalización no sustituye las respuestas HTTP, las trazas ni la explicación de los límites de seguridad.
