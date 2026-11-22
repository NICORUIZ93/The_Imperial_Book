# Módulo 4: Express/Fastify — routing y middleware

## Aprende construyendo

Cada tema es un proyecto independiente que comienza en una carpeta vacía. Escribe manualmente todos los archivos indicados; no copies archivos prefabricados ni reutilices el código de otro tema. `npm init -y` crea el `package.json` de cada proyecto y `npm install` reconstruye las dependencias a partir de ese manifiesto.


### Tema 1: Middleware — orden de ejecución y next() · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por middleware — orden de ejecución y next() con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender middleware — orden de ejecución y next() te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en middleware — orden de ejecución y next() como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que middleware — orden de ejecución y next() resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Middleware — orden de ejecución y next() se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Middleware — orden de ejecución y next() | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses middleware — orden de ejecución y next() por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: middleware — orden de ejecución y next() funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Middleware — orden de ejecución y next() existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve middleware — orden de ejecución y next() en tu contexto?
2. ¿Cómo sabrías que middleware — orden de ejecución y next() no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar middleware — orden de ejecución y next()?

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

#### ► DE QUÉ TRATA
Este tema te guía por routers anidados con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender routers anidados te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en routers anidados como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que routers anidados resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Routers anidados se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Routers anidados | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses routers anidados por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: routers anidados funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Routers anidados existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve routers anidados en tu contexto?
2. ¿Cómo sabrías que routers anidados no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar routers anidados?

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

#### ► DE QUÉ TRATA
Este tema te guía por validación de entrada con zod y manejo centralizado de errores con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender validación de entrada con zod y manejo centralizado de errores te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en validación de entrada con zod y manejo centralizado de errores como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que validación de entrada con zod y manejo centralizado de errores resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Validación de entrada con Zod y manejo centralizado de errores se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Validación de entrada con Zod y manejo centralizado de errores | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses validación de entrada con zod y manejo centralizado de errores por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: validación de entrada con zod y manejo centralizado de errores funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Validación de entrada con Zod y manejo centralizado de errores existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve validación de entrada con zod y manejo centralizado de errores en tu contexto?
2. ¿Cómo sabrías que validación de entrada con zod y manejo centralizado de errores no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar validación de entrada con zod y manejo centralizado de errores?

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

#### ► DE QUÉ TRATA
Este tema te guía por express frente a fastify con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender express frente a fastify te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en express frente a fastify como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que express frente a fastify resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Express frente a Fastify se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Express frente a Fastify | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses express frente a fastify por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: express frente a fastify funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Express frente a Fastify existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve express frente a fastify en tu contexto?
2. ¿Cómo sabrías que express frente a fastify no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar express frente a fastify?

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

#### ► DE QUÉ TRATA
Este tema te guía por websocket — comunicación en tiempo real bidireccional con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender websocket — comunicación en tiempo real bidireccional te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en websocket — comunicación en tiempo real bidireccional como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que websocket — comunicación en tiempo real bidireccional resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| WebSocket — comunicación en tiempo real bidireccional se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar WebSocket — comunicación en tiempo real bidireccional | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses websocket — comunicación en tiempo real bidireccional por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: websocket — comunicación en tiempo real bidireccional funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- WebSocket — comunicación en tiempo real bidireccional existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve websocket — comunicación en tiempo real bidireccional en tu contexto?
2. ¿Cómo sabrías que websocket — comunicación en tiempo real bidireccional no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar websocket — comunicación en tiempo real bidireccional?

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

#### ► DE QUÉ TRATA
Este tema te guía por subida de archivos — multipart y validación segura con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender subida de archivos — multipart y validación segura te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en subida de archivos — multipart y validación segura como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que subida de archivos — multipart y validación segura resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Subida de archivos — multipart y validación segura se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Subida de archivos — multipart y validación segura | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses subida de archivos — multipart y validación segura por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: subida de archivos — multipart y validación segura funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Subida de archivos — multipart y validación segura existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve subida de archivos — multipart y validación segura en tu contexto?
2. ¿Cómo sabrías que subida de archivos — multipart y validación segura no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar subida de archivos — multipart y validación segura?

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

#### ► DE QUÉ TRATA
Este tema te guía por proyecto 4: api operativa de entregas con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender proyecto 4: api operativa de entregas te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en proyecto 4: api operativa de entregas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que proyecto 4: api operativa de entregas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Proyecto 4: API operativa de entregas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Proyecto 4: API operativa de entregas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses proyecto 4: api operativa de entregas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: proyecto 4: api operativa de entregas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Proyecto 4: API operativa de entregas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve proyecto 4: api operativa de entregas en tu contexto?
2. ¿Cómo sabrías que proyecto 4: api operativa de entregas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar proyecto 4: api operativa de entregas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar proyecto 4: api operativa de entregas.

</details>
