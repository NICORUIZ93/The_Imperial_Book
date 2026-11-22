# Módulo 12: Proyecto integrador — API productiva

## Aprende construyendo

Cada tema es un proyecto independiente que comienza en una carpeta vacía. Escribe manualmente todos los archivos indicados: no copies ejemplos de la academia ni reutilices archivos de otros temas. `npm init -y` genera el `package.json` inicial y cada proyecto instala sus propias dependencias.

Los laboratorios permiten comprobar mecanismos concretos en local. **Una demostración que responde correctamente no es por ello una API productiva.** Esa afirmación exige evidencia adicional de seguridad, capacidad, recuperación, observabilidad y operación, además de revisión humana.


### Tema 1: Arquitectura por capas · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por arquitectura por capas con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender arquitectura por capas te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en arquitectura por capas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que arquitectura por capas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Arquitectura por capas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Arquitectura por capas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses arquitectura por capas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: arquitectura por capas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Arquitectura por capas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve arquitectura por capas en tu contexto?
2. ¿Cómo sabrías que arquitectura por capas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar arquitectura por capas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```text
HTTP → caso de uso → puerto RepositorioEntregas
                         ↑
                         └── adaptador en memoria o PostgreSQL

server.js crea el adaptador y lo inyecta; el caso de uso no lo instancia.
```

```bash
mkdir ejemplo-capas-contratos
cd ejemplo-capas-contratos
npm init -y
npm pkg set type=module scripts.test="node --test" scripts.start="node src/server.js"
mkdir -p src/application src/infrastructure src/http test
```

```js
/**
 * @typedef {{ codigo: string, estado: "pendiente" }} NuevaEntrega
 * @typedef {{ id: string, codigo: string, estado: string }} Entrega
 * @typedef {{ guardar(entrega: NuevaEntrega): Promise<Entrega> }} RepositorioEntregas
 */

export function exigirRepositorioEntregas(repositorio) {
  if (typeof repositorio?.guardar !== "function") {
    throw new TypeError("RepositorioEntregas.guardar es obligatorio");
  }
  return repositorio;
}
```

```js
import { exigirRepositorioEntregas } from "./puertos.js";

export class ReglaDeNegocioError extends Error {}

export function crearCasoDeUsoCrearEntrega({ repositorioEntregas }) {
  const repositorio = exigirRepositorioEntregas(repositorioEntregas);

  return async function crearEntrega(entrada) {
    const codigo = typeof entrada?.codigo === "string"
      ? entrada.codigo.trim()
      : "";

    if (codigo.length < 3 || codigo.length > 40) {
      throw new ReglaDeNegocioError("El código debe tener entre 3 y 40 caracteres");
    }

    return repositorio.guardar({ codigo, estado: "pendiente" });
  };
}
```

```js
import { randomUUID } from "node:crypto";

export function crearRepositorioMemoria() {
  const entregas = new Map();

  return {
    async guardar(nuevaEntrega) {
      const entrega = { id: randomUUID(), ...nuevaEntrega };
      entregas.set(entrega.id, entrega);
      return { ...entrega };
    },
  };
}
```

```js
import { createServer } from "node:http";
import { ReglaDeNegocioError } from "../application/crear-entrega.js";

async function leerJson(req) {
  const partes = [];
  let bytes = 0;

  for await (const parte of req) {
    bytes += parte.length;
    if (bytes > 16_384) {
      const error = new Error("Cuerpo demasiado grande");
      error.statusCode = 413;
      throw error;
    }
    partes.push(parte);
  }

  try {
    return JSON.parse(Buffer.concat(partes).toString("utf8"));
  } catch {
    const error = new Error("JSON inválido");
    error.statusCode = 400;
    throw error;
  }
}

export function crearServidorHttp({ crearEntrega }) {
  if (typeof crearEntrega !== "function") {
    throw new TypeError("Debes inyectar crearEntrega");
  }

  return createServer(async (req, res) => {
    res.setHeader("content-type", "application/json; charset=utf-8");

    if (req.method !== "POST" || req.url !== "/deliveries") {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Ruta no encontrada" }));
      return;
    }

    try {
      const entrega = await crearEntrega(await leerJson(req));
      res.statusCode = 201;
      res.end(JSON.stringify(entrega));
    } catch (error) {
      res.statusCode = error instanceof ReglaDeNegocioError
        ? 422
        : error.statusCode ?? 500;
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}
```

</details>

### Tema 2: Posiciones espaciales y Socket.IO con orden recuperable · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por posiciones espaciales y socket.io con orden recuperable con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender posiciones espaciales y socket.io con orden recuperable te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en posiciones espaciales y socket.io con orden recuperable como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que posiciones espaciales y socket.io con orden recuperable resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Posiciones espaciales y Socket.IO con orden recuperable se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Posiciones espaciales y Socket.IO con orden recuperable | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses posiciones espaciales y socket.io con orden recuperable por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: posiciones espaciales y socket.io con orden recuperable funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Posiciones espaciales y Socket.IO con orden recuperable existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve posiciones espaciales y socket.io con orden recuperable en tu contexto?
2. ¿Cómo sabrías que posiciones espaciales y socket.io con orden recuperable no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar posiciones espaciales y socket.io con orden recuperable?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```sql
ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
```

```text
validar → autenticar → autorizar jornada → persistir + secuencia → emitir
reconectar → unir a sala autorizada → recuperar desde secuencia
                              └─ hueco fuera de retención → instantánea/reset
```

```bash
mkdir ejemplo-posiciones-recuperables
cd ejemplo-posiciones-recuperables
npm init -y
npm pkg set type=module scripts.test="node --test"
npm install socket.io socket.io-client
mkdir src test
```

```js
const RETENCION = 20;

export function crearAlmacenPosiciones() {
  const jornadas = new Map([
    ["journey-1", { driverId: "driver-1", sequence: 0, events: [] }],
  ]);

  function autorizar(identity, journeyId) {
    const jornada = jornadas.get(journeyId);
    if (!jornada) throw new Error("Jornada no encontrada");
    if (jornada.driverId !== identity.subject) throw new Error("Jornada ajena");
    return jornada;
  }

  return {
    append(identity, journeyId, entrada) {
      const jornada = autorizar(identity, journeyId);
      const evento = {
        journeyId,
        sequence: ++jornada.sequence,
        ...entrada,
      };
      jornada.events.push(evento);
      if (jornada.events.length > RETENCION) jornada.events.shift();
      return structuredClone(evento);
    },

    recover(identity, journeyId, lastSequence) {
      const jornada = autorizar(identity, journeyId);
      if (!Number.isInteger(lastSequence) || lastSequence < 0
        || lastSequence > jornada.sequence) {
        throw new Error("lastSequence fuera de rango");
      }

      const oldest = jornada.events[0]?.sequence ?? jornada.sequence;
      const resetRequired = lastSequence < oldest - 1;
      return {
        resetRequired,
        events: resetRequired
          ? []
          : jornada.events.filter((evento) => evento.sequence > lastSequence),
        snapshot: resetRequired ? jornada.events.at(-1) ?? null : null,
        latestSequence: jornada.sequence,
      };
    },
  };
}
```

```js
import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { Server } from "socket.io";
import { crearAlmacenPosiciones } from "./store.js";

const token = process.env.LAB_TOKEN ?? "";
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://127.0.0.1:5173";
if (Buffer.byteLength(token) < 32) {
  throw new Error("Define LAB_TOKEN con al menos 32 bytes");
}
new URL(clientOrigin);

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: clientOrigin, methods: ["GET", "POST"] },
  maxHttpBufferSize: 16_000,
});
const store = crearAlmacenPosiciones();

function mismoSecreto(recibido) {
  const actual = Buffer.from(recibido ?? "");
  const esperado = Buffer.from(token);
  return actual.length === esperado.length && timingSafeEqual(actual, esperado);
}

function validarPosicion(p) {
  if (!p || typeof p !== "object" || Array.isArray(p)) return "Cuerpo inválido";
  if (!Number.isFinite(p.lat) || p.lat < -90 || p.lat > 90) return "Latitud inválida";
  if (!Number.isFinite(p.lng) || p.lng < -180 || p.lng > 180) return "Longitud inválida";
  if (!Number.isFinite(p.accuracyMeters) || p.accuracyMeters < 0
    || p.accuracyMeters > 5_000) return "Precisión inválida";

  const capturedAt = Date.parse(p.capturedAt);
  if (!Number.isFinite(capturedAt)) return "capturedAt inválido";
  const ahora = Date.now();
  if (capturedAt < ahora - 24 * 60 * 60 * 1000
    || capturedAt > ahora + 5 * 60 * 1000) return "Muestra fuera de ventana";
  return null;
}

io.use((socket, next) => {
  if (!mismoSecreto(socket.handshake.auth.token)) {
    return next(new Error("No autenticado"));
  }
  socket.data.identity = { subject: "driver-1" };
  next();
});

io.on("connection", (socket) => {
  let ventanaInicio = Date.now();
  let mensajes = 0;

  function admitirFrecuencia() {
    const ahora = Date.now();
    if (ahora - ventanaInicio >= 10_000) {
      ventanaInicio = ahora;
      mensajes = 0;
    }
    mensajes += 1;
    return mensajes <= 20;
  }

  socket.on("journey:subscribe", async (mensaje, acknowledge) => {
    const responder = typeof acknowledge === "function" ? acknowledge : () => {};
    try {
      await socket.join(`journey:${mensaje?.journeyId}`);
      const recuperacion = store.recover(
        socket.data.identity,
        mensaje?.journeyId,
        mensaje?.lastSequence,
      );
      responder({ ok: true, ...recuperacion });
    } catch (error) {
      responder({ ok: false, error: error.message });
    }
  });

  socket.on("journey:position", (mensaje, acknowledge) => {
    const responder = typeof acknowledge === "function" ? acknowledge : () => {};
    if (!admitirFrecuencia()) return responder({ ok: false, error: "Límite de frecuencia" });

    const invalido = validarPosicion(mensaje?.position);
    if (invalido) return responder({ ok: false, error: invalido });

    try {
      const evento = store.append(socket.data.identity, mensaje?.journeyId, {
        lat: mensaje.position.lat,
        lng: mensaje.position.lng,
        accuracyMeters: mensaje.position.accuracyMeters,
        capturedAt: new Date(mensaje.position.capturedAt).toISOString(),
      });
      io.to(`journey:${evento.journeyId}`).emit("journey:position", evento);
      responder({ ok: true, sequence: evento.sequence });
    } catch (error) {
      responder({ ok: false, error: error.message });
    }
  });
});

httpServer.listen(3000, "127.0.0.1", () => {
  console.log("Canal local en http://127.0.0.1:3000");
});
```

```js
import { io } from "socket.io-client";

const token = process.env.LAB_TOKEN ?? "";
const lastSequence = Number(process.argv[2] ?? 0);
const socket = io("http://127.0.0.1:3000", {
  auth: { token },
  reconnection: false,
});

socket.on("journey:position", (evento) => {
  console.log("evento", evento.sequence, evento.lat, evento.lng);
});

socket.on("connect", () => {
  socket.emit(
    "journey:subscribe",
    { journeyId: "journey-1", lastSequence },
    (recuperacion) => {
      console.log("recuperación", recuperacion);
      if (!recuperacion.ok) return socket.close();

      socket.emit(
        "journey:position",
        {
          journeyId: "journey-1",
          position: {
            lat: 40.4168,
            lng: -3.7038,
            accuracyMeters: 12,
            capturedAt: new Date().toISOString(),
          },
        },
        (respuesta) => {
          console.log("publicación", respuesta);
          socket.close();
        },
      );
    },
  );
});

socket.on("connect_error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
```

</details>

### Tema 3: Archivos y notificaciones push sin convertirlos en autorización · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por archivos y notificaciones push sin convertirlos en autorización con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender archivos y notificaciones push sin convertirlos en autorización te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en archivos y notificaciones push sin convertirlos en autorización como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que archivos y notificaciones push sin convertirlos en autorización resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Archivos y notificaciones push sin convertirlos en autorización se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Archivos y notificaciones push sin convertirlos en autorización | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses archivos y notificaciones push sin convertirlos en autorización por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: archivos y notificaciones push sin convertirlos en autorización funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Archivos y notificaciones push sin convertirlos en autorización existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve archivos y notificaciones push sin convertirlos en autorización en tu contexto?
2. ¿Cómo sabrías que archivos y notificaciones push sin convertirlos en autorización no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar archivos y notificaciones push sin convertirlos en autorización?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-evidencia-push
cd ejemplo-evidencia-push
npm init -y
npm pkg set type=module scripts.test="node --test"
npm install pngjs
mkdir src test quarantine
```

```js
import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PNG } from "pngjs";

const MAX_BYTES = 1_000_000;
const MAX_DIMENSION = 4096;
const FIRMA_PNG = "89504e470d0a1a0a";

function validarPng(buffer, tipoDeclarado) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0 || buffer.length > MAX_BYTES) {
    throw new Error("Archivo vacío o mayor que el límite");
  }
  if (tipoDeclarado !== "image/png") throw new Error("Solo se admite image/png");
  if (buffer.length < 24 || buffer.subarray(0, 8).toString("hex") !== FIRMA_PNG) {
    throw new Error("El contenido no tiene firma PNG");
  }

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  if (width < 1 || height < 1 || width > MAX_DIMENSION || height > MAX_DIMENSION) {
    throw new Error("Dimensiones no permitidas");
  }

  const imagen = PNG.sync.read(buffer);
  if (imagen.width !== width || imagen.height !== height) {
    throw new Error("PNG inconsistente");
  }
}

export function crearServicioEvidencias({ root, scanner, notifier }) {
  const entregas = new Map([
    ["delivery-1", {
      id: "delivery-1",
      driverId: "driver-1",
      installationId: "installation-1",
      estado: "pendiente",
    }],
  ]);
  const archivos = new Map();

  function autorizar(identity, deliveryId) {
    const entrega = entregas.get(deliveryId);
    if (!entrega) throw new Error("Entrega no encontrada");
    if (entrega.driverId !== identity.subject) throw new Error("Entrega ajena");
    return entrega;
  }

  async function subirEvidencia({ identity, deliveryId, buffer, tipoDeclarado }) {
    autorizar(identity, deliveryId);
    validarPng(buffer, tipoDeclarado);

    const key = `${randomUUID()}.png`;
    const destino = path.join(root, key);
    await mkdir(root, { recursive: true });
    await writeFile(destino, buffer, { flag: "wx", mode: 0o600 });

    const metadata = {
      id: randomUUID(),
      key,
      deliveryId,
      ownerId: identity.subject,
      sha256: createHash("sha256").update(buffer).digest("hex"),
      bytes: buffer.length,
      status: "QUARANTINED",
    };
    archivos.set(metadata.id, metadata);
    return { ...metadata };
  }

  // Solo un trabajador interno debe invocar esta operación; no se expone como ruta.
  async function ejecutarEscaneo(fileId) {
    const archivo = archivos.get(fileId);
    if (!archivo || archivo.status !== "QUARANTINED") throw new Error("No analizable");
    const resultado = await scanner.scan(path.join(root, archivo.key));
    archivo.status = resultado.clean === true ? "AVAILABLE" : "REJECTED";
    return { ...archivo };
  }

  async function confirmarEntrega({ identity, deliveryId }) {
    const entrega = autorizar(identity, deliveryId);
    const disponible = [...archivos.values()].some((archivo) =>
      archivo.deliveryId === deliveryId && archivo.status === "AVAILABLE");
    if (!disponible) throw new Error("Falta evidencia disponible");

    entrega.estado = "confirmada";
    try {
      await notifier.send({
        installationId: entrega.installationId,
        data: { type: "delivery.updated", deliveryId },
      });
      return { estado: entrega.estado, notificacion: "enviada" };
    } catch {
      return { estado: entrega.estado, notificacion: "pendiente" };
    }
  }

  function consultarEntrega(identity, deliveryId) {
    const entrega = autorizar(identity, deliveryId);
    return { id: entrega.id, estado: entrega.estado };
  }

  return { subirEvidencia, ejecutarEscaneo, confirmarEntrega, consultarEntrega };
}
```

```js
import path from "node:path";
import { crearServicioEvidencias } from "./evidence.js";

const pngUnPixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

const servicio = crearServicioEvidencias({
  root: path.resolve("quarantine"),
  scanner: { async scan() { return { clean: true }; } },
  notifier: { async send() { throw new Error("Proveedor no disponible"); } },
});
const identity = { subject: "driver-1" };

const archivo = await servicio.subirEvidencia({
  identity,
  deliveryId: "delivery-1",
  buffer: pngUnPixel,
  tipoDeclarado: "image/png",
});
console.log("alta", { key: archivo.key, status: archivo.status });

await servicio.ejecutarEscaneo(archivo.id);
console.log("escaneo de laboratorio completado; no equivale a antivirus real");
console.log(await servicio.confirmarEntrega({ identity, deliveryId: "delivery-1" }));
console.log(servicio.consultarEntrega(identity, "delivery-1"));
```

```js
import assert from "node:assert/strict";
import { mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { crearServicioEvidencias } from "../src/evidence.js";

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function preparar(overrides = {}) {
  const root = await mkdtemp(path.join(tmpdir(), "evidencia-"));
  const servicio = crearServicioEvidencias({
    root,
    scanner: { async scan() { return { clean: true }; } },
    notifier: { async send() { throw new Error("Push caído"); } },
    ...overrides,
  });
  return { root, servicio };
}

test("genera la clave, cuarentena y confirma aunque el push falle", async () => {
  const { root, servicio } = await preparar();
  const identity = { subject: "driver-1" };
  const archivo = await servicio.subirEvidencia({
    identity,
    deliveryId: "delivery-1",
    buffer: png,
    tipoDeclarado: "image/png",
  });
  assert.match(archivo.key, /^[0-9a-f-]+\.png$/);
  assert.equal(archivo.status, "QUARANTINED");
  assert.deepEqual(await readdir(root), [archivo.key]);

  await servicio.ejecutarEscaneo(archivo.id);
  assert.deepEqual(
    await servicio.confirmarEntrega({ identity, deliveryId: "delivery-1" }),
    { estado: "confirmada", notificacion: "pendiente" },
  );
  assert.equal(servicio.consultarEntrega(identity, "delivery-1").estado, "confirmada");
});

test("rechaza contenido que solo declara ser PNG", async () => {
  const { servicio } = await preparar();
  await assert.rejects(servicio.subirEvidencia({
    identity: { subject: "driver-1" },
    deliveryId: "delivery-1",
    buffer: Buffer.from("<script>no soy png</script>"),
    tipoDeclarado: "image/png",
  }), /firma PNG/);
});

test("rechaza un archivo mayor al límite antes de escribir", async () => {
  const { root, servicio } = await preparar();
  await assert.rejects(servicio.subirEvidencia({
    identity: { subject: "driver-1" },
    deliveryId: "delivery-1",
    buffer: Buffer.alloc(1_000_001),
    tipoDeclarado: "image/png",
  }), /límite/);
  assert.deepEqual(await readdir(root), []);
});

test("otro repartidor no puede adjuntar ni consultar la entrega", async () => {
  const { servicio } = await preparar();
  const identity = { subject: "driver-2" };
  await assert.rejects(servicio.subirEvidencia({
    identity,
    deliveryId: "delivery-1",
    buffer: png,
    tipoDeclarado: "image/png",
  }), /Entrega ajena/);
  assert.throws(() => servicio.consultarEntrega(identity, "delivery-1"), /Entrega ajena/);
});
```

```bash
npm test
node src/demo.js
```

</details>

### Tema 4: Uniendo cada módulo del track · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por uniendo cada módulo del track con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender uniendo cada módulo del track te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en uniendo cada módulo del track como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que uniendo cada módulo del track resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Uniendo cada módulo del track se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Uniendo cada módulo del track | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses uniendo cada módulo del track por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: uniendo cada módulo del track funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Uniendo cada módulo del track existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve uniendo cada módulo del track en tu contexto?
2. ¿Cómo sabrías que uniendo cada módulo del track no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar uniendo cada módulo del track?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```text
Supertest → Express + correlación → JWT → Prisma → PostgreSQL efímero
                              └── Pino: request, resultado y correlationId
```

```bash
mkdir ejemplo-integracion-track
cd ejemplo-integracion-track
npm init -y
npm pkg set type=module scripts.start="node src/server.js" scripts.test="node --test --test-concurrency=1"
npm install express jose pino bcrypt @prisma/client
npm install --save-dev prisma supertest testcontainers
mkdir -p prisma src test
```

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String         @id @default(uuid())
  email         String         @unique
  passwordHash  String
  deliveries    Delivery[]
  refreshTokens RefreshToken[]
}

model Delivery {
  id        String   @id @default(uuid())
  title     String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model RefreshToken {
  id        String    @id
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  expiresAt DateTime
  revokedAt DateTime?
}
```

```js
export function cargarConfiguracion() {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const jwtSecret = process.env.JWT_SECRET ?? "";
  const port = Number(process.env.PORT ?? 3000);

  if (!databaseUrl.startsWith("postgresql://")) {
    throw new Error("DATABASE_URL debe ser una URL PostgreSQL");
  }
  if (Buffer.byteLength(jwtSecret) < 32) {
    throw new Error("JWT_SECRET debe contener al menos 32 bytes");
  }
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error("PORT debe ser un entero entre 1 y 65535");
  }

  return Object.freeze({ databaseUrl, jwtSecret, port });
}
```

```js
import { randomUUID } from "node:crypto";
import express from "express";
import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";

const issuer = "integracion-track";
const audience = "entregas-api";

export function crearApp({ prisma, logger, jwtSecret }) {
  const app = express();
  const clave = new TextEncoder().encode(jwtSecret);
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));

  app.use((req, res, next) => {
    const propuesto = req.get("x-request-id");
    req.id = propuesto && propuesto.length <= 100 ? propuesto : randomUUID();
    req.log = logger.child({ correlationId: req.id });
    res.setHeader("x-request-id", req.id);
    res.on("finish", () => {
      req.log.info({ method: req.method, path: req.path, status: res.statusCode }, "request");
    });
    next();
  });

  async function firmarAccess(user) {
    return new SignJWT({ type: "access" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setIssuer(issuer)
      .setAudience(audience)
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(clave);
  }

  app.get("/health", async (_req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ ok: true });
    } catch (error) {
      next(error);
    }
  });

  app.post("/auth/login", async (req, res, next) => {
    try {
      const { email, password } = req.body ?? {};
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !(await bcrypt.compare(password ?? "", user.passwordHash))) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const jti = randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.refreshToken.create({ data: { id: jti, userId: user.id, expiresAt } });

      const refreshToken = await new SignJWT({ type: "refresh" })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(user.id)
        .setJti(jti)
        .setIssuer(issuer)
        .setAudience(audience)
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(clave);

      res.json({ accessToken: await firmarAccess(user), refreshToken });
    } catch (error) {
      next(error);
    }
  });

  app.post("/auth/refresh", async (req, res, next) => {
    try {
      const token = req.body?.refreshToken ?? "";
      const { payload } = await jwtVerify(token, clave, {
        issuer,
        audience,
        algorithms: ["HS256"],
      });
      if (payload.type !== "refresh" || !payload.jti || !payload.sub) {
        return res.status(401).json({ error: "Refresh token inválido" });
      }

      const almacenado = await prisma.refreshToken.findUnique({
        where: { id: payload.jti },
        include: { user: true },
      });
      const vigente = almacenado
        && almacenado.userId === payload.sub
        && !almacenado.revokedAt
        && almacenado.expiresAt > new Date();
      if (!vigente) return res.status(401).json({ error: "Refresh revocado o expirado" });

      res.json({ accessToken: await firmarAccess(almacenado.user) });
    } catch {
      res.status(401).json({ error: "Refresh token inválido" });
    }
  });

  async function exigirAccess(req, res, next) {
    try {
      const header = req.headers.authorization ?? "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : "";
      const { payload } = await jwtVerify(token, clave, {
        issuer,
        audience,
        algorithms: ["HS256"],
      });
      if (payload.type !== "access" || !payload.sub) throw new Error("Tipo inválido");
      req.user = { id: payload.sub };
      next();
    } catch {
      res.status(401).json({ error: "Access token inválido" });
    }
  }

  app.post("/deliveries", exigirAccess, async (req, res, next) => {
    try {
      const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
      if (title.length < 3 || title.length > 120) {
        return res.status(422).json({ error: "Título inválido" });
      }
      const delivery = await prisma.delivery.create({
        data: { title, userId: req.user.id },
      });
      res.status(201).json(delivery);
    } catch (error) {
      next(error);
    }
  });

  app.get("/deliveries", exigirAccess, async (req, res, next) => {
    try {
      const deliveries = await prisma.delivery.findMany({
        where: { userId: req.user.id },
        include: { user: { select: { id: true, email: true } } },
      });
      res.json(deliveries);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, req, res, _next) => {
    req.log.error({ error: error.message }, "request fallida");
    res.status(500).json({ error: "Error interno", correlationId: req.id });
  });

  return app;
}
```

```js
import { PrismaClient } from "@prisma/client";
import pino from "pino";
import { cargarConfiguracion } from "./config.js";
import { crearApp } from "./app.js";

const config = cargarConfiguracion();
const prisma = new PrismaClient({ datasources: { db: { url: config.databaseUrl } } });
const logger = pino({ level: process.env.LOG_LEVEL ?? "info" });
const app = crearApp({ prisma, logger, jwtSecret: config.jwtSecret });
const server = app.listen(config.port, () => logger.info({ port: config.port }, "API lista"));

async function apagar() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}
process.on("SIGTERM", apagar);
process.on("SIGINT", apagar);
```

</details>

### Tema 5: Qué le falta a esta API para producción real · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por qué le falta a esta api para producción real con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender qué le falta a esta api para producción real te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en qué le falta a esta api para producción real como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que qué le falta a esta api para producción real resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Qué le falta a esta API para producción real se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Qué le falta a esta API para producción real | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses qué le falta a esta api para producción real por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: qué le falta a esta api para producción real funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Qué le falta a esta API para producción real existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve qué le falta a esta api para producción real en tu contexto?
2. ¿Cómo sabrías que qué le falta a esta api para producción real no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar qué le falta a esta api para producción real?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-readiness-evidencia
cd ejemplo-readiness-evidencia
npm init -y
npm pkg set type=module
mkdir src
```

```json
[
  {
    "control": "Autorización por entrega",
    "estado": "pendiente",
    "evidencia": "",
    "responsable": "Backend",
    "siguienteAccion": "Probar acceso cruzado entre dos repartidores"
  },
  {
    "control": "Límites de cuerpo y frecuencia",
    "estado": "pendiente",
    "evidencia": "",
    "responsable": "Backend",
    "siguienteAccion": "Medir rechazo de cargas y ráfagas excesivas"
  },
  {
    "control": "Restauración de base de datos",
    "estado": "pendiente",
    "evidencia": "",
    "responsable": "Plataforma",
    "siguienteAccion": "Restaurar una copia en un entorno aislado"
  },
  {
    "control": "Migración reversible y compatible",
    "estado": "pendiente",
    "evidencia": "",
    "responsable": "Datos",
    "siguienteAccion": "Ensayar expansión, despliegue y contracción"
  },
  {
    "control": "Secretos y rotación",
    "estado": "pendiente",
    "evidencia": "",
    "responsable": "Seguridad",
    "siguienteAccion": "Rotar una credencial sin reconstruir la imagen"
  },
  {
    "control": "Alerta accionable",
    "estado": "pendiente",
    "evidencia": "",
    "responsable": "Operaciones",
    "siguienteAccion": "Provocar un fallo y registrar la alerta recibida"
  },
  {
    "control": "Capacidad bajo carga",
    "estado": "pendiente",
    "evidencia": "",
    "responsable": "Operaciones",
    "siguienteAccion": "Medir latencia y errores con una carga representativa"
  },
  {
    "control": "Rollback y runbook",
    "estado": "pendiente",
    "evidencia": "",
    "responsable": "Operaciones",
    "siguienteAccion": "Ensayar reversa y documentar la decisión"
  }
]
```

```js
import { readFile } from "node:fs/promises";

export function evaluarReadiness(controles) {
  if (!Array.isArray(controles) || controles.length === 0) {
    throw new Error("La evaluación necesita controles");
  }

  for (const item of controles) {
    for (const campo of ["control", "estado", "responsable", "siguienteAccion"]) {
      if (typeof item[campo] !== "string" || !item[campo].trim()) {
        throw new Error(`Campo obligatorio ausente: ${campo}`);
      }
    }
    if (!["verificado", "pendiente", "no aplica"].includes(item.estado)) {
      throw new Error(`Estado inválido en ${item.control}`);
    }
    if (item.estado === "verificado" && !item.evidencia?.trim()) {
      throw new Error(`${item.control}: verificado exige evidencia`);
    }
    if (item.estado === "no aplica" && !item.evidencia?.trim()) {
      throw new Error(`${item.control}: no aplica exige justificación`);
    }
  }

  const pendientes = controles.filter((item) => item.estado === "pendiente");
  return {
    listoParaProduccion: pendientes.length === 0,
    verificados: controles.filter((item) => item.estado === "verificado").length,
    pendientes: pendientes.map((item) => item.control),
  };
}

const archivo = new URL("../readiness.json", import.meta.url);
const controles = JSON.parse(await readFile(archivo, "utf8"));
console.log(JSON.stringify(evaluarReadiness(controles), null, 2));
```

```bash
node src/readiness.js
```

</details>

### Tema 6: Próximos pasos — microservicios, colas de mensajes y TypeScript · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por próximos pasos — microservicios, colas de mensajes y typescript con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender próximos pasos — microservicios, colas de mensajes y typescript te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en próximos pasos — microservicios, colas de mensajes y typescript como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que próximos pasos — microservicios, colas de mensajes y typescript resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Próximos pasos — microservicios, colas de mensajes y TypeScript se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Próximos pasos — microservicios, colas de mensajes y TypeScript | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses próximos pasos — microservicios, colas de mensajes y typescript por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: próximos pasos — microservicios, colas de mensajes y typescript funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Próximos pasos — microservicios, colas de mensajes y TypeScript existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve próximos pasos — microservicios, colas de mensajes y typescript en tu contexto?
2. ¿Cómo sabrías que próximos pasos — microservicios, colas de mensajes y typescript no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar próximos pasos — microservicios, colas de mensajes y typescript?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-decision-condicionada
cd ejemplo-decision-condicionada
npm init -y
npm pkg set type=module
mkdir src
```

```json
{
  "problema": "Los informes bloquean hasta 2 segundos una petición HTTP",
  "restricciones": [
    "Un equipo mantiene todo el sistema",
    "El usuario puede consultar el informe terminado después",
    "No hay necesidad medida de escalar el informe por separado"
  ],
  "opciones": [
    {
      "nombre": "Monolito modular",
      "condicion": "Mantener si el procesamiento dentro de la petición cumple el objetivo",
      "beneficio": "Una sola unidad de despliegue y depuración",
      "costo": "El trabajo comparte recursos con la API",
      "riesgo": "Acoplamiento si desaparecen los límites internos",
      "evidencia": "20 informes por minuto y sin despliegue independiente",
      "reversa": "No requiere migración"
    },
    {
      "nombre": "Cola dentro del mismo sistema desplegable",
      "condicion": "Considerar porque la respuesta no necesita esperar el informe",
      "beneficio": "Desacopla la petición del tiempo de procesamiento",
      "costo": "Requiere consumidor, idempotencia y monitorización de antigüedad",
      "riesgo": "Duplicados y estados parcialmente completados",
      "evidencia": "El informe puede consultarse después; falta medir la cola elegida",
      "reversa": "Conservar temporalmente el procesamiento síncrono detrás de una bandera"
    },
    {
      "nombre": "Microservicio de informes",
      "condicion": "Considerar solo si aparece propiedad o escalado independiente",
      "beneficio": "Despliegue y recursos independientes",
      "costo": "Red, contratos, observabilidad y operación adicionales",
      "riesgo": "Fallos parciales y datos distribuidos",
      "evidencia": "No existe todavía una restricción que lo justifique",
      "reversa": "Mantener el contrato interno para reintegrar el módulo"
    },
    {
      "nombre": "TypeScript en el módulo de informes",
      "condicion": "Considerar si los errores de contrato aumentan al crecer el módulo",
      "beneficio": "Contratos estáticos y refactorización asistida",
      "costo": "Compilación, tipos de dependencias y migración gradual",
      "riesgo": "Confiar en tipos sin validar entradas externas",
      "evidencia": "Medir primero defectos de contrato; no se presupone el beneficio",
      "reversa": "Adopción por archivos sin reescritura completa"
    }
  ]
}
```

```js
import { readFile } from "node:fs/promises";

const campos = ["condicion", "beneficio", "costo", "riesgo", "evidencia", "reversa"];

export function evaluarDecision(decision) {
  if (!decision.problema?.trim() || !Array.isArray(decision.restricciones)) {
    throw new Error("Define problema y restricciones antes de elegir");
  }
  if (!Array.isArray(decision.opciones) || decision.opciones.length < 2) {
    throw new Error("Compara al menos dos opciones");
  }

  for (const opcion of decision.opciones) {
    for (const campo of campos) {
      if (typeof opcion[campo] !== "string" || !opcion[campo].trim()) {
        throw new Error(`${opcion.nombre}: falta ${campo}`);
      }
    }
  }

  return {
    decision: "documentada; todavía requiere validar las condiciones con medidas",
    opcionesComparadas: decision.opciones.map((opcion) => opcion.nombre),
    progresionObligatoria: false,
  };
}

const archivo = new URL("../decision.json", import.meta.url);
console.log(evaluarDecision(JSON.parse(await readFile(archivo, "utf8"))));
```

```bash
node src/evaluar.js
```

</details>

### Proyecto 12: API operativa de entregas

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por proyecto 12: api operativa de entregas con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender proyecto 12: api operativa de entregas te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en proyecto 12: api operativa de entregas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que proyecto 12: api operativa de entregas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Proyecto 12: API operativa de entregas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Proyecto 12: API operativa de entregas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses proyecto 12: api operativa de entregas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: proyecto 12: api operativa de entregas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Proyecto 12: API operativa de entregas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve proyecto 12: api operativa de entregas en tu contexto?
2. ¿Cómo sabrías que proyecto 12: api operativa de entregas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar proyecto 12: api operativa de entregas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir api-entregas-integrador
cd api-entregas-integrador
npm init -y
npm pkg set type=module scripts.start="node src/server.js" scripts.test="node --test --test-concurrency=1"
mkdir -p src/application src/domain src/http src/infrastructure prisma test quarantine
```

```bash
npm test
docker build -t api-entregas-integrador:local .
node src/server.js
```

</details>
