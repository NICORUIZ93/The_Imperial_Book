# Módulo 4: Express/Fastify — routing y middleware

## Aprende construyendo

Cada tema es un proyecto independiente que comienza en una carpeta vacía. Escribe manualmente todos los archivos indicados; no copies archivos prefabricados ni reutilices el código de otro tema. `npm init -y` crea el `package.json` de cada proyecto y `npm install` reconstruye las dependencias a partir de ese manifiesto.


### Tema 1: Middleware — orden de ejecución y next() · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```js
app.use(express.json());                    // 1: parsea el body
app.use((req, res, next) => {                 // 2: logging propio
  const inicio = Date.now();
  res.on("finish", () => console.log(`${req.method} ${req.url} - ${Date.now() - inicio}ms`));
  next();                                     // sin esto, la petición se cuelga
});
app.get("/tareas", (req, res) => res.json(tareas)); // 3: manejador final
```

```bash
mkdir ejemplo-middleware-express
cd ejemplo-middleware-express
npm init -y
npm install express@5
mkdir src
```

```js
import express from "express";

const app = express();

app.use(express.json()); // 1. Debe ir antes de rutas que usan req.body.

app.use((req, res, next) => {
  const inicio = performance.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${(performance.now() - inicio).toFixed(1)} ms)`);
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

```bash
node src/server.js
```

```bash
curl -i -X POST http://127.0.0.1:3004/eco -H "Content-Type: application/json" -d '{"tema":"middleware"}'
curl -i http://127.0.0.1:3004/privado/mensaje
curl -i http://127.0.0.1:3004/privado/mensaje -H "x-demo-token: aprender"
```

</details>

### Tema 2: Routers anidados · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```js
// routers/tareas.js
const router = Router();
router.get("/", (req, res) => res.json(tareas));
router.post("/", (req, res) => { /* ... */ });
export default router;

// app.js
app.use("/tareas", router); // todas las rutas del router viven bajo /tareas
```

```bash
mkdir ejemplo-routers-express
cd ejemplo-routers-express
npm init -y
npm install express
mkdir -p src/routers
```

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

```js
import express from "express";
import tareasRouter from "./routers/tareas.js";

const app = express();
app.use(express.json()); // Debe ejecutarse antes del router que lee req.body.
app.use("/api/tareas", tareasRouter); // El router recibe rutas relativas a este prefijo.

app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

app.listen(3005, "127.0.0.1", () => console.log("API en http://127.0.0.1:3005"));
```

```bash
node src/app.js
```

```bash
curl -i -X POST http://127.0.0.1:3005/api/tareas -H "Content-Type: application/json" -d '{"titulo":"Separar routers"}'
curl -i http://127.0.0.1:3005/api/tareas/1
```

</details>

### Tema 3: Validación de entrada con Zod y manejo centralizado de errores · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
mkdir ejemplo-zod-errores
cd ejemplo-zod-errores
npm init -y
npm install express zod
mkdir src
```

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

```bash
node src/server.js
```

```bash
curl -i -X POST http://127.0.0.1:3006/tareas -H "Content-Type: application/json" -d '{"titulo":"Estudiar Zod","prioridad":"alta"}'
```

</details>

### Tema 4: Express frente a Fastify · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► REGLA PRÁCTICA
Elige Express si el equipo ya conoce su middleware lineal (`app.use`) y quieres aprovechar su ecosistema amplio, validando con una librería externa como Zod. Elige Fastify si necesitas más rendimiento y validación/serialización declarada con JSON Schema integrado — la serialización de respuesta se genera a partir de ese mismo schema, en vez de serializar objetos genéricamente.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```text
Express: middleware lineal (app.use), validación externa (Zod), ecosistema de middleware
Fastify: hooks granulares (onRequest/preHandler), JSON Schema integrado,
         serialización generada a partir del schema de respuesta
```

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

```bash
node express-api/src/server.js
```

```bash
node fastify-api/src/server.js
```

</details>

### Tema 5: WebSocket — comunicación en tiempo real bidireccional · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-websocket-entregas
cd ejemplo-websocket-entregas
npm init -y
npm pkg set type=module
npm install ws
```

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

```js
import WebSocket from "ws";

const socket = new WebSocket("ws://localhost:3001");
socket.on("message", (data) => console.log("Posición recibida:", data.toString()));
```

```bash
node server.js
```

```bash
node cliente.js
```

</details>

### Tema 6: Subida de archivos — multipart y validación segura · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-subida-segura
cd ejemplo-subida-segura
npm init -y
npm pkg set type=module
npm install express multer
mkdir -p uploads
```

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

```bash
node server.js
```

```bash
curl -F "foto=@una-foto.jpg" http://localhost:3000/entregas/RF-4471/evidencia
```

```bash
curl -F "foto=@falso.txt;type=text/plain" http://localhost:3000/entregas/RF-4471/evidencia
```

</details>

### Proyecto 4: API operativa de entregas

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar proyecto 4: api operativa de entregas.

</details>
