# Módulo 12: Proyecto integrador — API productiva

## Aprende construyendo

Cada tema es un proyecto independiente que comienza en una carpeta vacía. Escribe manualmente todos los archivos indicados: no copies ejemplos de la academia ni reutilices archivos de otros temas. `npm init -y` genera el `package.json` inicial y cada proyecto instala sus propias dependencias.

Los laboratorios permiten comprobar mecanismos concretos en local. **Una demostración que responde correctamente no es por ello una API productiva.** Esa afirmación exige evidencia adicional de seguridad, capacidad, recuperación, observabilidad y operación, además de revisión humana.

### Tema 1: Arquitectura por capas · Intermedio · 90 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, módulos ES, `async`/`await` y HTTP básico. El proyecto empieza en una carpeta vacía y no depende de ningún otro laboratorio.

**Al terminar podrás:** construir una API pequeña donde HTTP, aplicación e infraestructura se comuniquen mediante contratos, inyectar el repositorio en el caso de uso y probar una regla de negocio sin arrancar el servidor.

**Por qué importa:** si una ruta valida reglas, ejecuta SQL y decide el formato de persistencia, cualquier cambio afecta a todo. Separar responsabilidades permite probar el dominio con rapidez y sustituir un adaptador sin reescribir el caso de uso. La separación solo es real si las dependencias entran desde fuera y los contratos se cumplen; crear carpetas llamadas `services` o `repositories` no basta.

La **capa HTTP** interpreta método, ruta, cuerpo y códigos de estado. La **capa de aplicación** coordina el caso de uso y las reglas: no importa `node:http`, Express ni Prisma. La **infraestructura** implementa el acceso a datos. La **composición**, en `server.js`, es el único lugar que conoce todas las implementaciones y las conecta.

El contrato del repositorio define qué operación necesita la aplicación, no qué tecnología conviene al adaptador. En JavaScript puede documentarse con JSDoc y comprobarse en el límite de composición; TypeScript puede expresarlo también con una interfaz, pero no es obligatorio para obtener inyección de dependencias.

```text
HTTP → caso de uso → puerto RepositorioEntregas
                         ↑
                         └── adaptador en memoria o PostgreSQL

server.js crea el adaptador y lo inyecta; el caso de uso no lo instancia.
```

**Analogía:** la aplicación es una cocina que necesita un almacén con una operación «guardar». No le importa si el almacén es una estantería o una cámara frigorífica, pero sí necesita que cumpla esa operación. La analogía se acaba en los errores y contratos de datos: esos sí deben especificarse en código.

#### Practica

Desde una carpeta vacía:

```bash
mkdir ejemplo-capas-contratos
cd ejemplo-capas-contratos
npm init -y
npm pkg set type=module scripts.test="node --test" scripts.start="node src/server.js"
mkdir -p src/application src/infrastructure src/http test
```

Crea `src/application/puertos.js`. El caso de uso depende de este contrato, no de la clase en memoria:

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

Crea `src/application/crear-entrega.js`. La fábrica recibe e inspecciona la dependencia antes de devolver el caso de uso:

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

Crea `src/infrastructure/repositorio-memoria.js`. El adaptador cumple el puerto y encapsula su colección: no exporta un arreglo global compartido:

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

Crea `src/http/app.js`. Este adaptador recibe el caso de uso; no importa el repositorio ni decide reglas de código:

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

Crea `src/server.js`, la raíz de composición. Aquí sí se elige memoria y se conectan las capas:

```js
import { crearCasoDeUsoCrearEntrega } from "./application/crear-entrega.js";
import { crearRepositorioMemoria } from "./infrastructure/repositorio-memoria.js";
import { crearServidorHttp } from "./http/app.js";

const repositorioEntregas = crearRepositorioMemoria();
const crearEntrega = crearCasoDeUsoCrearEntrega({ repositorioEntregas });
const server = crearServidorHttp({ crearEntrega });

server.listen(3000, "127.0.0.1", () => {
  console.log("API local en http://127.0.0.1:3000");
});
```

Crea `test/crear-entrega.test.js`. El doble de prueba implementa el mismo contrato y registra lo recibido:

```js
import assert from "node:assert/strict";
import test from "node:test";
import {
  crearCasoDeUsoCrearEntrega,
  ReglaDeNegocioError,
} from "../src/application/crear-entrega.js";

test("guarda una entrega válida mediante el puerto inyectado", async () => {
  const recibidas = [];
  const repositorioEntregas = {
    async guardar(entrega) {
      recibidas.push(entrega);
      return { id: "entrega-1", ...entrega };
    },
  };
  const crearEntrega = crearCasoDeUsoCrearEntrega({ repositorioEntregas });

  const resultado = await crearEntrega({ codigo: "  RF-100  " });

  assert.equal(resultado.codigo, "RF-100");
  assert.deepEqual(recibidas, [{ codigo: "RF-100", estado: "pendiente" }]);
});

test("rechaza un código ausente sin llamar al repositorio", async () => {
  let llamadas = 0;
  const crearEntrega = crearCasoDeUsoCrearEntrega({
    repositorioEntregas: {
      async guardar() {
        llamadas += 1;
      },
    },
  });

  await assert.rejects(crearEntrega({}), ReglaDeNegocioError);
  assert.equal(llamadas, 0);
});
```

Ejecuta las pruebas y después inicia la API:

```bash
npm test
npm start
```

En otra terminal:

```bash
curl -i http://127.0.0.1:3000/deliveries \
  -H 'content-type: application/json' \
  -d '{"codigo":"RF-100"}'
```

**Resultado esperado:** las dos pruebas pasan y la petición válida responde `201` con un `id` generado, `codigo: "RF-100"` y `estado: "pendiente"`. La prueba de dominio no abre un puerto ni importa el adaptador HTTP.

**Fallo deliberado y corrección:** envía `{}` en el cuerpo. La respuesta debe ser `422` y el repositorio no debe recibir ninguna llamada. Después sustituye temporalmente la inyección en `server.js` por `{}`: el arranque falla con `RepositorioEntregas.guardar es obligatorio`. Restaura `crearRepositorioMemoria()`; no resuelvas el fallo importando memoria dentro del caso de uso.

**Práctica guiada:** añade al puerto `buscarPorId(id)` y una ruta `GET /deliveries/:id`. Implementa primero el método en memoria, inyecta un nuevo caso de uso y devuelve `404` cuando no exista. Prueba el caso de uso con un repositorio falso que también cumpla `buscarPorId`.

**Ejercicio independiente:** escribe dentro de este proyecto un adaptador que persista cada entrega como JSON en un directorio de datos, con nombres generados por el servidor y escritura exclusiva. Añade pruebas del contrato para memoria y archivo; ambos adaptadores deben superar los mismos casos sin cambios en la aplicación.

#### Aplica

En el proyecto integrador independiente del final, crea los puertos `RepositorioEntregas`, `RepositorioUsuarios` y `PublicadorPosiciones` en la capa de aplicación. La raíz de composición debe inyectar Prisma y Socket.IO solo mediante adaptadores. Demuestra con una prueba que cancelar una entrega ajena se rechaza antes de tocar persistencia.

**Checklist de salida.**

- [ ] Creaste todos los archivos manualmente en una carpeta nueva.
- [ ] El caso de uso recibe el repositorio y valida su contrato.
- [ ] Aplicación no importa HTTP ni el adaptador en memoria.
- [ ] La raíz de composición conecta las implementaciones concretas.
- [ ] Una entrada inválida no produce llamadas al repositorio.
- [ ] Las pruebas usan un doble que cumple el mismo puerto.

**Si falla:** `ERR_MODULE_NOT_FOUND` suele indicar que falta `.js` en una importación local. Si el doble de prueba necesita campos que el contrato no declara, corrige el contrato o el caso de uso; no añadas una dependencia concreta para satisfacer ese test.

**Errores comunes:** carpetas sin fronteras, controladores con reglas de negocio, dominio que importa Prisma, singletons ocultos, interfaces que copian accidentalmente detalles SQL y mocks que devuelven formas incompatibles con el adaptador real.

**Fuentes oficiales:** [Node.js — módulos ES](https://nodejs.org/api/esm.html), [Node.js — HTTP](https://nodejs.org/api/http.html) y [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).

### Tema 2: Uniendo cada módulo del track · Avanzado · 180 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, Express, Prisma, JWT, pruebas HTTP y Docker. Debes tener un daemon de Docker disponible para Testcontainers. El proyecto crea su esquema, sus usuarios de prueba y todos sus archivos desde cero.

**Al terminar podrás:** integrar configuración, Express, una relación real de Prisma, access y refresh tokens, pruebas contra PostgreSQL efímero, logs con correlación y una imagen Docker multi-stage.

**Por qué importa:** comprender middleware, persistencia o autenticación por separado no demuestra que colaboren. Un contrato puede romperse precisamente en la unión: el login puede emitir un token que el middleware rechaza, o una prueba puede pasar con mocks mientras la consulta real es inválida.

La integración conserva las fronteras del tema anterior. Express traduce HTTP; Prisma implementa persistencia; `jose` firma y verifica tokens; Pino registra hechos sin credenciales. La relación `User 1—N Delivery` se comprueba leyendo la entrega con su propietario. El refresh token contiene un `jti` que también existe en la base: una firma válida no basta si el identificador fue revocado o expiró.

Testcontainers levanta PostgreSQL para la prueba y `prisma db push` crea el esquema de ese laboratorio. Esto es apropiado para una prueba de integración, no una estrategia de migración de producción. Supertest usa la aplicación sin depender de un puerto fijo. El Dockerfile empaqueta el resultado, pero construir una imagen tampoco demuestra que el servicio esté listo para tráfico real.

```text
Supertest → Express + correlación → JWT → Prisma → PostgreSQL efímero
                              └── Pino: request, resultado y correlationId
```

#### Practica

Desde una carpeta vacía:

```bash
mkdir ejemplo-integracion-track
cd ejemplo-integracion-track
npm init -y
npm pkg set type=module scripts.start="node src/server.js" scripts.test="node --test --test-concurrency=1"
npm install express jose pino bcrypt @prisma/client
npm install --save-dev prisma supertest testcontainers
mkdir -p prisma src test
```

Crea `prisma/schema.prisma`:

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

Crea `src/config.js`. La configuración rechaza valores ambiguos antes de escuchar:

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

Crea `src/app.js`:

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

Crea `src/server.js`:

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

Crea `test/integracion.test.js`:

```js
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { after, before, test } from "node:test";
import bcrypt from "bcrypt";
import pino from "pino";
import supertest from "supertest";
import { GenericContainer } from "testcontainers";

let container;
let prisma;
let app;
let user;
const jwtSecret = "secreto-local-de-pruebas-con-mas-de-32-bytes";

before(async () => {
  container = await new GenericContainer("postgres:16-alpine")
    .withEnvironment({
      POSTGRES_USER: "test",
      POSTGRES_PASSWORD: "test",
      POSTGRES_DB: "entregas",
    })
    .withExposedPorts(5432)
    .start();

  process.env.DATABASE_URL = `postgresql://test:test@${container.getHost()}:${container.getMappedPort(5432)}/entregas`;
  execFileSync("npx", ["prisma", "db", "push", "--skip-generate"], {
    env: process.env,
    stdio: "inherit",
  });

  prisma = new PrismaClient();
  const { crearApp } = await import("../src/app.js");
  app = crearApp({ prisma, logger: pino({ enabled: false }), jwtSecret });
  user = await prisma.user.create({
    data: {
      email: "ana@example.test",
      passwordHash: await bcrypt.hash("clave-larga-de-prueba", 10),
    },
  });
});

after(async () => {
  await prisma?.$disconnect();
  await container?.stop();
});

test("login, operación protegida, relación y refresh funcionan juntos", async () => {
  await supertest(app).get("/deliveries").expect(401);

  const login = await supertest(app)
    .post("/auth/login")
    .send({ email: "ana@example.test", password: "clave-larga-de-prueba" })
    .expect(200);

  await supertest(app)
    .post("/deliveries")
    .set("Authorization", `Bearer ${login.body.accessToken}`)
    .send({ title: "Entrega integrada" })
    .expect(201);

  const lista = await supertest(app)
    .get("/deliveries")
    .set("Authorization", `Bearer ${login.body.accessToken}`)
    .expect(200);
  assert.equal(lista.body.length, 1);
  assert.equal(lista.body[0].user.id, user.id);
  assert.equal(lista.body[0].user.passwordHash, undefined);

  const renovado = await supertest(app)
    .post("/auth/refresh")
    .send({ refreshToken: login.body.refreshToken })
    .expect(200);
  assert.equal(typeof renovado.body.accessToken, "string");
});
```

Crea `Dockerfile`:

```dockerfile
FROM node:lts-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate

FROM node:lts-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY src ./src
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
```

Crea `.dockerignore`:

```text
node_modules
npm-debug.log
test
.git
.env
```

Ejecuta la prueba de integración y construye la imagen:

```bash
npm test
docker build -t entregas-track:local .
```

**Resultado esperado:** la prueba levanta PostgreSQL, crea el esquema, obtiene `401` sin token, completa login y alta protegida, lee la relación con el usuario sin exponer `passwordHash` y renueva el access token. Docker termina una imagen local multi-stage. Estas señales verifican el laboratorio; no acreditan capacidad ni seguridad de producción.

**Fallo deliberado y corrección:** ejecuta `PORT=abc DATABASE_URL=postgresql://localhost/entregas JWT_SECRET=clave-local-de-laboratorio-con-mas-de-32-bytes npm start`. La configuración debe rechazar el puerto antes de escuchar. Corrige `PORT` con un entero válido. Después cambia en una petición de prueba el access token por el refresh token: debe recibir `401`, porque el middleware exige `type: "access"`; no elimines esa comprobación para hacerlo pasar.

**Práctica guiada:** añade `POST /auth/logout` que reciba el refresh token, verifique su firma y marque `revokedAt` solo si pertenece al `sub` verificado. Repite `/auth/refresh` y comprueba `401`. Añade a la prueba una cabecera `x-request-id` conocida y verifica que vuelve en la respuesta sin registrar tokens.

**Ejercicio independiente:** incorpora rotación de refresh tokens: cada renovación revoca el `jti` anterior y crea uno nuevo en una transacción. Demuestra que reutilizar el token anterior falla. Añade un segundo usuario y prueba que no puede leer las entregas del primero aunque tenga un access token válido.

#### Aplica

En el proyecto integrador independiente del final, conecta registro, login, refresh, operación protegida y consulta de entregas con una relación real. Ejecuta el flujo crítico contra PostgreSQL efímero, exige correlación en cada respuesta y empaqueta exactamente esa versión en Docker. Documenta por separado cualquier control todavía pendiente.

**Checklist de salida.**

- [ ] El proyecto contiene desde cero esquema, aplicación, pruebas y Docker.
- [ ] La configuración inválida impide arrancar.
- [ ] La relación uno-a-muchos se verifica con una consulta real.
- [ ] Access y refresh tienen propósitos distintos y no son intercambiables.
- [ ] El refresh se contrasta con un registro vigente en la base.
- [ ] Los logs incluyen correlación y excluyen contraseñas y tokens.
- [ ] La prueba usa PostgreSQL real y la imagen se construye sin secretos incorporados.

**Si falla:** si Prisma no encuentra tablas, revisa que `db push` se ejecute con la misma `DATABASE_URL` que usa el test. Si el login funciona y la ruta protegida no, compara issuer, audience, algoritmo y `type` al firmar y verificar. Si Docker no encuentra el cliente generado, comprueba que el esquema y los artefactos de Prisma se copien antes de `CMD`.

**Errores comunes:** afirmar integración con mocks en todas las capas, compartir una base entre pruebas, aceptar refresh como access, devolver hashes, registrar credenciales, usar `prisma db push` como migración productiva o meter secretos en la imagen.

**Modelo mental:** trata el sistema como un recorrido vertical, no como una colección de carpetas: una petición atraviesa el límite HTTP, una regla de aplicación, persistencia y una respuesta. Cada frontera traduce su contrato; si el fallo aparece solo al unir capas, reduce el recorrido hasta la primera entrada cuya salida ya no cumple ese contrato.

**Cuándo integrar:** construye esta vertical cuando las piezas tienen contratos locales comprobados; conserva pruebas unitarias para reglas y de integración para sus uniones. No reemplaces las pruebas pequeñas con un único test end-to-end: cuando falla un recorrido enorme, cuesta separar configuración, autenticación, consulta y serialización.

**Fuentes oficiales:** [Express](https://expressjs.com/), [Prisma](https://www.prisma.io/docs), [jose](https://github.com/panva/jose), [Pino](https://getpino.io/), [Testcontainers para Node](https://node.testcontainers.org/) y [Docker multi-stage](https://docs.docker.com/build/building/multi-stage/).

### Tema 3: Qué le falta a esta API para producción real · Intermedio · 75 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, JSON, HTTP y conceptos de seguridad y operación. Este proyecto evalúa evidencia escrita; no necesita ni reutiliza una API anterior.

**Al terminar podrás:** elaborar una evaluación de preparación que distinga «verificado», «pendiente» y «no aplica», rechace afirmaciones sin evidencia y produzca una lista honesta de trabajo restante.

**Por qué importa:** una demo puede devolver `200` y seguir permitiendo acceso a recursos ajenos, perder datos al reiniciar o no tener forma de recuperarse. Producción no es una etiqueta que se obtiene por completar dependencias: requiere controles observados, responsables y criterios de recuperación.

La revisión cubre al menos cinco dimensiones. **Seguridad:** autenticación, autorización por recurso, límites y gestión de secretos. **Datos:** copias, restauración, retención y migraciones compatibles con versiones anteriores. **Resiliencia:** tiempos de espera, reintentos acotados, idempotencia y degradación. **Observabilidad:** métricas, logs, trazas y alertas accionables. **Operación:** despliegue, rollback, capacidad, runbooks y responsables.

Una evidencia debe permitir comprobar el estado: comando y resultado, enlace a una prueba, fecha de una restauración o medición de carga. «Existe un healthcheck» no prueba que una alerta llegue al equipo. «Hay backup» no prueba que pueda restaurarse. Un control «no aplica» necesita una justificación, no sirve para ocultar un riesgo.

**Analogía:** es la inspección previa de una aeronave. Arrancar el motor equivale a la demo; la inspección exige comprobar frenos, instrumentos, combustible y procedimientos. La analogía no convierte una lista en certificación: cada elemento necesita una prueba real y criterio profesional.

#### Practica

Desde una carpeta vacía:

```bash
mkdir ejemplo-readiness-evidencia
cd ejemplo-readiness-evidencia
npm init -y
npm pkg set type=module
mkdir src
```

Crea `readiness.json`. El estado inicial es deliberadamente prudente: los controles todavía no ejecutados permanecen pendientes:

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

Crea `src/readiness.js`:

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

Ejecuta:

```bash
node src/readiness.js
```

**Resultado esperado:** `listoParaProduccion: false`, cero controles verificados y los ocho pendientes enumerados. El programa no confunde completar el JSON con superar una revisión de producción.

**Fallo deliberado y corrección:** cambia el primer estado a `verificado` sin completar `evidencia`. La ejecución debe fallar con `verificado exige evidencia`. No inventes una prueba para corregirlo: devuelve el estado a `pendiente`. Solo después de ejecutar realmente la prueba de acceso cruzado puedes registrar comando, fecha y resultado como evidencia.

**Práctica guiada:** añade una prueba automatizada en un archivo `test/readiness.test.js` creado manualmente. Debe comprobar tres casos: un control verificado sin evidencia es rechazado, un pendiente impide `listoParaProduccion` y un control no aplicable exige justificación. Configura `npm pkg set scripts.test="node --test"` y ejecuta `npm test`.

**Ejercicio independiente:** redacta `runbook-incidente.md` en la raíz de este proyecto para el escenario «aumento de respuestas 500 después del despliegue». Incluye umbral de detección, consulta de métricas y logs, mitigación, condición de rollback, comunicación, recuperación de datos si aplica y acciones posteriores. Asigna un responsable y una señal objetiva de cierre.

#### Aplica

En el proyecto integrador independiente del final, entrega una matriz de preparación con evidencia ejecutable para autorización, límites, restauración, secretos, alertas, carga y rollback. Todo lo no comprobado debe quedar pendiente; la imagen Docker funcional no se presentará como autorización para publicar.

**Checklist de salida.**

- [ ] Creaste el evaluador y su inventario desde una carpeta vacía.
- [ ] Cada control tiene responsable y siguiente acción.
- [ ] Un estado verificado sin evidencia provoca un error.
- [ ] Un control no aplicable requiere justificación.
- [ ] Los controles pendientes impiden declarar preparación productiva.
- [ ] Distingues backups de restauraciones y logs de alertas.

**Si falla:** un JSON con una coma sobrante produce un error de parseo; corrige la sintaxis antes de interpretar estados. Si el resultado declara preparación con pendientes, revisa el cálculo de `pendientes.length`. No reduzcas la lista de controles únicamente para obtener `true`.

**Errores comunes:** usar cobertura como única señal, escribir evidencia no ejecutada, omitir restauración, no asignar responsables, migrar sin compatibilidad hacia atrás, guardar secretos en la imagen o llamar productiva a una demo sin alertas y recuperación.

**Fuentes oficiales:** [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [Google SRE Workbook](https://sre.google/workbook/) y [The Twelve-Factor App](https://12factor.net/).

### Tema 4: Próximos pasos — microservicios, colas de mensajes y TypeScript · Intermedio · 75 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, JSON y arquitectura por capas. El proyecto toma una decisión sobre un caso propio y no reutiliza código de otros temas.

**Al terminar podrás:** justificar si conviene conservar un monolito modular, separar un servicio, introducir una cola o adoptar TypeScript a partir de restricciones y evidencia, incluyendo coste y reversa.

**Por qué importa:** estas tecnologías resuelven problemas distintos y añaden costes distintos. Adoptarlas como una progresión obligatoria puede convertir un sistema operable en una red de despliegues, mensajes duplicados y diagnósticos distribuidos sin resolver una necesidad medida.

Los **microservicios** se justifican cuando existen límites de dominio claros y una necesidad real de despliegue, escalado, aislamiento o propiedad independiente. A cambio introducen red, contratos versionados, observabilidad distribuida y fallos parciales. Un equipo pequeño con un solo flujo de despliegue suele beneficiarse primero de un monolito modular.

Las **colas** desacoplan disponibilidad y ritmo de procesamiento cuando el trabajo puede completarse después. Exigen idempotencia, reintentos con límite, *dead-letter*, control de antigüedad y una política de consistencia eventual. RabbitMQ encaja en colas de tareas y enrutamiento; Kafka se orienta a flujos de eventos retenidos y múltiples consumidores. Ninguno convierte automáticamente un proceso en fiable ni es necesario para toda notificación.

**TypeScript** añade contratos estáticos y refactorización asistida cuando el código, los colaboradores o las integraciones crecen. No valida por sí solo datos en tiempo de ejecución ni mejora una arquitectura confusa. Puede adoptarse por fronteras, con validación de entrada y una configuración estricta gradual; JavaScript con JSDoc y pruebas puede seguir siendo una decisión razonable.

**Analogía:** elegir arquitectura es decidir si un restaurante necesita otra cocina, un servicio de mensajería o un mejor sistema de fichas. Cada opción ayuda con un cuello de botella diferente; comprar los tres sin medir solo aumenta la coordinación.

#### Practica

Desde una carpeta vacía:

```bash
mkdir ejemplo-decision-condicionada
cd ejemplo-decision-condicionada
npm init -y
npm pkg set type=module
mkdir src
```

Crea `decision.json` para un servicio que debe procesar 20 informes por minuto y cuyo equipo aún no tiene requisito de despliegue independiente:

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

Crea `src/evaluar.js`:

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

Ejecuta:

```bash
node src/evaluar.js
```

**Resultado esperado:** aparecen las cuatro opciones y `progresionObligatoria: false`. El programa valida que la comparación esté completa; no selecciona automáticamente una tecnología porque la evidencia todavía incluye mediciones pendientes.

**Fallo deliberado y corrección:** elimina `costo` de la opción de microservicio. La ejecución falla con `Microservicio de informes: falta costo`. Restaura el coste completo; quitar también la opción para ocultar el error impediría comparar alternativas.

**Práctica guiada:** añade una medición concreta de latencia y frecuencia a `restricciones`. Escribe qué resultado cambiaría la recomendación de monolito a cola y cuál justificaría separar un servicio. Si ninguna medición lo exige, conserva la opción más simple y registra el siguiente momento de revisión.

**Ejercicio independiente:** añade a este proyecto `experimento.cjs` o `experimento.mjs` que simule un consumidor que recibe dos veces el mismo `jobId`. Debe demostrar idempotencia con un almacén local acotado y rechazar reintentos después de tres intentos. Explica por qué esa simulación no prueba todavía RabbitMQ ni Kafka y escribe el criterio que justificaría probar uno de ellos.

#### Aplica

En el proyecto integrador independiente del final, conserva inicialmente un monolito modular. Añade un registro de decisión para colas, separación de servicios y TypeScript: cada cambio necesita una condición medida, coste operativo, estrategia de reversa y pruebas de fallos. No introduzcas ninguno como requisito para terminar el proyecto.

**Checklist de salida.**

- [ ] Comparaste varias opciones a partir de un problema concreto.
- [ ] Cada opción declara condición, beneficio, coste, riesgo, evidencia y reversa.
- [ ] Las colas incluyen idempotencia y reintentos acotados.
- [ ] Los microservicios exigen una necesidad independiente demostrable.
- [ ] TypeScript se evalúa sin confundir tipos con validación en tiempo de ejecución.
- [ ] Mantener el monolito modular aparece como una decisión válida.

**Si falla:** si la recomendación menciona primero un producto y después busca el problema, invierte el análisis. Si una cola parece eliminar todos los fallos, documenta duplicados, orden, veneno de mensajes, *dead-letter* y consistencia eventual antes de elegirla.

**Errores comunes:** microservicios por moda, una base compartida sin propiedad clara, colas sin idempotencia, reintentos infinitos, Kafka para una tarea sin requisito de flujo retenido, TypeScript sin validación externa o métricas inventadas para justificar la decisión.

**Fuentes oficiales:** [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html), [Martin Fowler — Microservices](https://martinfowler.com/articles/microservices.html), [RabbitMQ — reliability](https://www.rabbitmq.com/docs/reliability) y [Apache Kafka — documentation](https://kafka.apache.org/documentation/).

### Tema 5: Posiciones espaciales y Socket.IO con orden recuperable · Avanzado · 150 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, HTTP, JSON, eventos asíncronos y coordenadas básicas. El proyecto incluye servidor, cliente y pruebas propios; no necesita una aplicación móvil ni archivos anteriores.

**Al terminar podrás:** validar coordenadas y antigüedad, autenticar un canal, autorizar cada jornada, asignar secuencias en el servidor, publicar después de persistir y recuperar un intervalo acotado con una señal de reinicio cuando el historial ya no baste.

**Por qué importa:** el GPS llega tarde, se duplica o se desconecta. El orden de llegada no es el orden de los hechos y un evento emitido antes de guardarse puede desaparecer si cae el proceso. Además, estar autenticado no autoriza a seguir la jornada de otro conductor.

Latitud pertenece a `[-90, 90]`, longitud a `[-180, 180]` y la precisión no puede ser negativa. `capturedAt` representa cuándo se tomó la muestra; el servidor aplica una política de antigüedad y margen de futuro. La **secuencia** la asigna el servidor por jornada después de aceptar el comando. Una restricción única como `(journey_id, sequence_number)` evita duplicar el efecto al reintentar en una base durable.

En PostgreSQL con PostGIS, un punto puede almacenarse como `geography(Point, 4326)`. `ST_MakePoint` recibe **longitud antes que latitud**:

```sql
ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
```

La consulta debe parametrizarse y vivir en un repositorio. La aplicación no conoce SQL. Índice espacial, SRID y restricciones de unicidad resuelven problemas diferentes de los que resuelve Socket.IO.

Socket.IO autentica el *handshake* y autoriza `journeyId` antes de unir a una sala. También vuelve a autorizar cada publicación: pertenecer antes a una sala no es una prueba permanente. El origen permitido se limita a un cliente explícito y el transporte tiene límites de mensaje y frecuencia. El servidor guarda primero y emite después; para no perder la publicación si el proceso cae entre base y canal se necesita un patrón outbox, que este laboratorio no implementa.

La recuperación devuelve eventos posteriores a `lastSequence`. Si el hueco ya quedó fuera de las últimas 20 posiciones, responde `resetRequired` y una instantánea; no finge una recuperación completa. El cliente elimina duplicados por secuencia porque un evento en vivo puede cruzarse con la respuesta de recuperación. El almacén encapsulado de una sola instancia es volátil y **no sirve como estado compartido de producción**.

```text
validar → autenticar → autorizar jornada → persistir + secuencia → emitir
reconectar → unir a sala autorizada → recuperar desde secuencia
                              └─ hueco fuera de retención → instantánea/reset
```

#### Practica

Desde una carpeta vacía:

```bash
mkdir ejemplo-posiciones-recuperables
cd ejemplo-posiciones-recuperables
npm init -y
npm pkg set type=module scripts.test="node --test"
npm install socket.io socket.io-client
mkdir src test
```

Crea `src/store.js`. El almacén se crea por instancia, limita el historial y comprueba propiedad en cada operación:

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

Crea `src/server.js`:

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

Crea `src/client.js`:

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

Crea `test/store.test.js`:

```js
import assert from "node:assert/strict";
import test from "node:test";
import { crearAlmacenPosiciones } from "../src/store.js";

const identity = { subject: "driver-1" };
const entrada = {
  lat: 40.4,
  lng: -3.7,
  accuracyMeters: 10,
  capturedAt: new Date().toISOString(),
};

test("asigna secuencia por jornada y recupera solo lo posterior", () => {
  const store = crearAlmacenPosiciones();
  store.append(identity, "journey-1", entrada);
  store.append(identity, "journey-1", entrada);
  const recuperado = store.recover(identity, "journey-1", 1);
  assert.equal(recuperado.events.length, 1);
  assert.equal(recuperado.events[0].sequence, 2);
});

test("marca reset cuando el hueco supera la retención", () => {
  const store = crearAlmacenPosiciones();
  for (let i = 0; i < 25; i += 1) store.append(identity, "journey-1", entrada);
  const recuperado = store.recover(identity, "journey-1", 0);
  assert.equal(recuperado.resetRequired, true);
  assert.equal(recuperado.events.length, 0);
  assert.equal(recuperado.snapshot.sequence, 25);
});

test("otro conductor no puede leer ni publicar", () => {
  const store = crearAlmacenPosiciones();
  assert.throws(() => store.recover({ subject: "driver-2" }, "journey-1", 0));
  assert.throws(() => store.append({ subject: "driver-2" }, "journey-1", entrada));
});
```

Ejecuta las pruebas y arranca el servidor en macOS o Linux:

```bash
npm test
LAB_TOKEN='token-local-de-laboratorio-con-mas-de-32-bytes' npm run start --if-present
```

El último proyecto no define todavía `start`; para iniciar el servidor usa directamente:

```bash
LAB_TOKEN='token-local-de-laboratorio-con-mas-de-32-bytes' node src/server.js
```

En otra terminal:

```bash
LAB_TOKEN='token-local-de-laboratorio-con-mas-de-32-bytes' node src/client.js 0
```

En PowerShell, asigna `$env:LAB_TOKEN="token-local-de-laboratorio-con-mas-de-32-bytes"` antes de ejecutar servidor o cliente. El token es solo una credencial compartida de laboratorio; un sistema real debe verificar identidad por usuario y proteger su emisión y almacenamiento.

**Resultado esperado:** las tres pruebas pasan. El cliente se autentica, recupera desde la secuencia indicada, publica una posición y recibe `sequence: 1` en la primera ejecución. Una segunda ejecución con `lastSequence` igual a la última confirmada no vuelve a entregar eventos antiguos.

**Fallo deliberado y corrección:** cambia temporalmente `lat: 40.4168` por `lat: 200` en el cliente. La publicación debe responder `{ ok: false, error: 'Latitud inválida' }`, no emitirse y no consumir una secuencia. Restaura la coordenada y repite: obtiene la secuencia que habría seguido a la última válida. Después inicia el cliente con otro `LAB_TOKEN`; el *handshake* debe ser rechazado.

**Práctica guiada:** ejecuta un cliente que escuche sin publicar y otro que envíe tres posiciones. Reinicia el primero y solicita desde la secuencia 1; comprueba que los duplicados se descartan por `sequence`. Después genera más de 20 posiciones y solicita desde cero: debes observar `resetRequired: true` y una instantánea, no una lista presentada como completa.

**Ejercicio independiente:** añade una segunda jornada asignada a `driver-2` y credenciales de laboratorio distintas para cada conductor. Prueba suscripción y publicación cruzadas, mensajes fuera de orden y duplicados. Escribe el adaptador PostgreSQL con clave única `(journey_id, sequence_number)` y explica qué cambia al ejecutar dos instancias: el Map local deja de ser fuente compartida y hace falta persistencia transaccional más recuperación durable.

#### Aplica

En el proyecto integrador independiente del final, almacena posiciones en PostGIS con longitud y latitud en el orden correcto, autoriza cada jornada y publica solo después de confirmar persistencia. Añade pruebas de reconexión, duplicado, hueco fuera de retención y acceso cruzado. Si exiges que ninguna publicación se pierda tras una caída entre base y socket, incorpora outbox; no presentes la emisión directa como esa garantía.

**Checklist de salida.**

- [ ] Servidor, cliente, almacén y pruebas se crearon manualmente en una carpeta nueva.
- [ ] El origen del canal está restringido y el *handshake* exige credencial.
- [ ] Cada suscripción y publicación comprueba la jornada autorizada.
- [ ] Coordenadas, precisión, fecha, tamaño y frecuencia tienen límites.
- [ ] La secuencia se asigna al persistir y una posición inválida no la incrementa.
- [ ] La recuperación está acotada y declara cuándo requiere reinicio desde instantánea.
- [ ] El almacén local se identifica como volátil, no como arquitectura distribuida productiva.

**Si falla:** si el navegador ni siquiera completa el *handshake*, revisa origen y credencial por separado. Si al reconectar faltan eventos dentro de la retención, comprueba que la suscripción use la última secuencia confirmada. Si aparecen duplicados al cruzarse recuperación y eventos en vivo, aplica cada secuencia una sola vez. Si dos instancias repiten secuencias, el Map local no es una fuente válida: usa una asignación transaccional compartida.

**Errores comunes:** aceptar cualquier origen, confiar en el orden de llegada, usar una variable global como base durable, emitir antes de guardar, autorizar solo al conectar, historial infinito, recuperación sin límite o intercambiar latitud y longitud en PostGIS.

**Modelo mental:** piensa en la posición aceptada como un registro con secuencia asignada por el servidor, no como «el último paquete que llegó». La hora del dispositivo ayuda a detectar antigüedad, pero no establece por sí sola el orden confiable; persistir antes de publicar permite recuperar lo confirmado tras una desconexión.

**Fuentes oficiales:** [Socket.IO](https://socket.io/docs/v4/), [RFC 7946 — GeoJSON](https://www.rfc-editor.org/rfc/rfc7946), [PostGIS — ST_MakePoint](https://postgis.net/docs/ST_MakePoint.html) y [PostgreSQL — unique constraints](https://www.postgresql.org/docs/current/ddl-constraints.html).

### Tema 6: Archivos y notificaciones push sin convertirlos en autorización · Avanzado · 150 min

#### Aprende

**Prerrequisitos:** Node.js LTS, npm, buffers, archivos, promesas y autorización por recurso. El proyecto crea su propio servicio, almacenamiento en cuarentena y pruebas; no requiere credenciales de Firebase ni archivos de otros temas.

**Al terminar podrás:** validar una imagen por su contenido, limitar tamaño y dimensiones, guardarla con un nombre generado por el servidor en cuarentena, impedir cargas en entregas ajenas y confirmar una entrega aunque falle la notificación posterior.

**Por qué importa:** el nombre y el `Content-Type` enviados por el cliente son afirmaciones, no pruebas. Un archivo puede sobrescribir otro, contener datos distintos de los declarados o quedar expuesto antes del análisis. Por otro lado, un token FCM identifica una instalación; no demuestra identidad, propiedad ni permiso sobre una entrega.

El adaptador HTTP debe aceptar `multipart/form-data` con límites de archivo, campos y tamaño antes de invocar al caso de uso. El servicio de este laboratorio recibe un `Buffer` ya limitado y vuelve a imponer su propio máximo: una defensa no presupone que todas las entradas futuras usarán el mismo adaptador. La firma PNG se comprueba primero, las dimensiones se leen antes de decodificar y `pngjs` decodifica la imagen completa. Extensión y firma solas no bastan para establecer que el contenido sea interpretable.

El servidor genera la clave con `randomUUID()` y escribe con `flag: "wx"` para impedir sobrescritura. El directorio de cuarentena no es público ni se ejecuta como código. Los metadatos guardan propietario, entrega, hash, tamaño, clave y estado. El flujo es `QUARANTINED → AVAILABLE` o `REJECTED`: solo un trabajador interno con un escáner real puede promover el archivo. El escáner del laboratorio es un doble para probar transiciones, no una defensa antivirus.

La descarga debe autorizar de nuevo la entrega y usar una URL temporal o una respuesta protegida. La confirmación exige evidencia `AVAILABLE`. Después de cambiar el estado de dominio se intenta el push con datos mínimos; si falla, la entrega permanece confirmada y el aviso queda pendiente de reintento. En un sistema durable se registra un outbox en la misma transacción del cambio, no una promesa en memoria. El cliente que recibe push vuelve a consultar la API autenticada: el mensaje no es fuente de verdad.

**Analogía:** la cuarentena es una sala de inspección y el push es el timbre que avisa que hay novedades. Ni la etiqueta del paquete demuestra su contenido ni el timbre autoriza a abrir la puerta.

#### Practica

Desde una carpeta vacía:

```bash
mkdir ejemplo-evidencia-push
cd ejemplo-evidencia-push
npm init -y
npm pkg set type=module scripts.test="node --test"
npm install pngjs
mkdir src test quarantine
```

Crea `src/evidence.js`:

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

Crea `src/demo.js`. El escáner y el proveedor son dobles deliberados para observar estados; no se presentan como servicios externos reales:

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

Crea `test/evidence.test.js`:

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

Ejecuta:

```bash
npm test
node src/demo.js
```

**Resultado esperado:** las cuatro pruebas pasan. La demo crea un nombre UUID con extensión `.png`, muestra primero `QUARANTINED`, lo promueve mediante el doble de escáner y devuelve `{ estado: 'confirmada', notificacion: 'pendiente' }` cuando falla el push. La entrega sigue confirmada. Ningún archivo recibe un nombre elegido por el cliente.

**Fallo deliberado y corrección:** en `src/demo.js`, cambia `identity` a `{ subject: "driver-2" }`. La carga debe fallar con `Entrega ajena` antes de escribir. Restaura `driver-1`. Después sustituye `pngUnPixel` por `Buffer.from("texto")`: debe fallar la firma aunque `tipoDeclarado` siga siendo `image/png`. Restaura los bytes válidos; no corrijas el fallo confiando en el tipo declarado.

**Práctica guiada:** añade un adaptador HTTP multipart en un archivo propio, con límite de un archivo, 1 MB, pocos campos y tiempo de espera. Debe pasar al servicio el `Buffer`, el tipo declarado y una identidad previamente autenticada; nunca un propietario enviado en el formulario. Prueba cuerpo excedido, PNG falso, entrega ajena y descarga en cuarentena rechazada.

**Ejercicio independiente:** implementa un outbox persistente local para la notificación y un trabajador con tres reintentos acotados, espera exponencial y estado final de fallo. Usa un `notificationId` idempotente y desactiva una instalación cuando el proveedor la declare inválida. Demuestra que reiniciar después de confirmar no pierde el aviso pendiente y que el payload solo contiene tipo e identificador de entrega.

#### Aplica

En el proyecto integrador independiente del final, incorpora evidencias PNG con nombre de servidor, límite de bytes y dimensiones, decodificación real, autorización por entrega, hash y cuarentena fuera del directorio público. Solo un trabajador autorizado puede cambiar el estado del análisis. Confirma primero el dominio y envía después un push mínimo mediante outbox; un token de instalación nunca decide permisos ni sustituye una consulta a la API.

**Checklist de salida.**

- [ ] Servicio, demo, pruebas y cuarentena se crearon manualmente en un proyecto nuevo.
- [ ] El servidor genera nombres únicos y escribe sin sobrescribir.
- [ ] Bytes, tipo declarado, firma, dimensiones y decodificación se comprueban.
- [ ] Otro repartidor no puede cargar ni consultar el recurso.
- [ ] El archivo nace en cuarentena y no es público antes del análisis.
- [ ] El escáner de laboratorio no se presenta como antivirus real.
- [ ] Un push fallido deja la entrega confirmada y la notificación pendiente.
- [ ] El push contiene datos mínimos y no actúa como permiso ni fuente de verdad.

**Si falla:** si un archivo válido se rechaza, comprueba que el adaptador multipart entregue bytes y no una ruta de texto. Si aparece `EEXIST`, conserva la escritura exclusiva y genera otra clave; no uses el nombre original. Si todos los archivos quedan disponibles sin análisis, separa el trabajador interno del endpoint de carga. Si el push revierte la entrega, mueve el efecto fuera de la transición y registra un reintento durable.

**Errores comunes:** confiar en extensión o MIME, concatenar rutas del cliente, cargar sin límites, servir cuarentena como contenido estático, marcar disponible al terminar la transferencia, guardar tokens como permisos, incluir datos sensibles en push o deshacer el dominio por un fallo del proveedor.

**Fuentes oficiales:** [Node.js — fs](https://nodejs.org/api/fs.html), [Node.js — crypto](https://nodejs.org/api/crypto.html), [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html), [Firebase Admin — mensajería](https://firebase.google.com/docs/cloud-messaging/send-message) y [pngjs](https://github.com/pngjs/pngjs).

## Laboratorio práctico

### Proyecto 12: API operativa de entregas

**Objetivo del laboratorio:** construir en una carpeta nueva una API de entregas con arquitectura por capas, autenticación, persistencia, pruebas, observabilidad, posiciones recuperables, evidencias en cuarentena y notificaciones posteriores. El resultado es un prototipo integrable y desplegable en un entorno controlado; solo podrá evaluarse como candidato productivo cuando exista evidencia de los controles operativos pendientes.

**Requisitos previos:** competencias de los Módulos 0–11, Node.js LTS, npm y Docker. No uses código, datos ni configuración de los laboratorios anteriores: escribe este proyecto desde cero y crea sus propias pruebas y secretos locales.

Inicia el proyecto independiente:

```bash
mkdir api-entregas-integrador
cd api-entregas-integrador
npm init -y
npm pkg set type=module scripts.start="node src/server.js" scripts.test="node --test --test-concurrency=1"
mkdir -p src/application src/domain src/http src/infrastructure prisma test quarantine
```

Crea manualmente, como mínimo, estos archivos y contenidos dentro del proyecto:

| Archivo | Contenido requerido |
|---|---|
| `src/application/puertos.js` | Contratos de usuarios, entregas, posiciones, evidencias y outbox; ninguna importación de Express, Prisma o Socket.IO |
| `src/application/entregas.js` | Casos de uso con reglas de estado y autorización por propietario, con dependencias inyectadas |
| `src/application/posiciones.js` | Validación de ventana temporal, secuencia persistente, recuperación acotada y publicación posterior |
| `src/application/evidencias.js` | Autorización por entrega, límites, contenido validado, estados de cuarentena y confirmación |
| `src/domain/errores.js` | Errores de validación, autenticación, autorización, conflicto y recurso ausente |
| `src/http/app.js` | Express, límites de cuerpo, correlación, login, refresh, rutas protegidas y traducción de errores |
| `src/http/realtime.js` | Origen explícito, autenticación, autorización por jornada, límites, secuencia y reanudación |
| `src/infrastructure/prisma-repositorios.js` | Adaptadores transaccionales, relación usuario–entregas, posiciones y outbox |
| `src/infrastructure/almacen-evidencias.js` | Claves UUID, escritura exclusiva, cuarentena no pública y metadatos mínimos |
| `src/infrastructure/push.js` | Adaptador Firebase Admin o doble explícito, payload mínimo e invalidación de instalaciones |
| `src/server.js` | Configuración validada, composición e inyección de adaptadores y apagado ordenado |
| `prisma/schema.prisma` | Usuario, entrega, refresh, posición con unicidad, evidencia y outbox; PostgreSQL/PostGIS para posiciones |
| `test/contratos.test.js` | Reglas y puertos con dobles que conservan las mismas formas de entrada y salida |
| `test/integracion.test.js` | Flujo crítico con Supertest, PostgreSQL efímero y dos usuarios |
| `test/realtime.test.js` | Duplicados, reconexión, hueco fuera de retención, posición antigua y acceso cruzado |
| `test/evidencias.test.js` | Tamaño excedido, PNG falso, recurso ajeno, cuarentena y fallo de push |
| `Dockerfile` | Construcción multi-stage sin secretos ni pruebas en la imagen final |
| `.dockerignore` | Dependencias locales, secretos, cuarentena, pruebas y archivos de control de versiones |
| `readiness.json` | Controles, evidencia real, responsables y pendientes de operación |
| `decisiones.json` | Condiciones medidas para monolito, cola, servicios separados y TypeScript |

Implementa y verifica estos hitos en orden:

1. **Dominio y contratos.** Una entrega pertenece a un repartidor y solo puede confirmarse con evidencia disponible. Prueba una transición válida, una inválida y acceso cruzado sin levantar HTTP.
2. **Persistencia real.** Crea la relación uno-a-muchos, refresh revocable, posiciones con `(journey_id, sequence_number)` único y punto `geography(Point, 4326)`. Usa longitud antes que latitud y consultas parametrizadas.
3. **Acceso completo.** Registro con contraseña derivada, login, access de corta duración y refresh con `jti` almacenado. Un refresh no funciona como access y un refresh revocado recibe `401`.
4. **Operación protegida.** Crear y consultar entregas exige access; dos repartidores con el mismo rol no pueden leer ni modificar recursos ajenos. Los cuerpos tienen límite y las respuestas no exponen hashes ni tokens.
5. **Observabilidad.** Cada respuesta contiene un identificador de correlación y cada log de petición incluye método, ruta, estado y correlación, sin cuerpos sensibles. `/health` distingue proceso disponible de base inaccesible.
6. **Posiciones y recuperación.** Persiste antes de emitir. Prueba coordenadas inválidas, muestras antiguas, duplicados, orden lógico y recuperación desde la última secuencia. Un hueco fuera de retención exige instantánea; el canal no es almacenamiento durable.
7. **Evidencia y push.** Rechaza un archivo que solo declara ser PNG, uno excedido y una entrega ajena. La evidencia queda en cuarentena hasta un análisis autorizado. El fallo push no revierte la confirmación y el outbox permite reintentos acotados.
8. **Pruebas de integración.** Testcontainers crea una base limpia para login → refresh → alta protegida → posición → evidencia → confirmación. Los dobles quedan en pruebas unitarias; no sustituyen la verificación del esquema y las transacciones reales.
9. **Empaquetado y configuración.** Un puerto, URL o secreto inválido impide arrancar. Construye la imagen sin `.env`, con usuario no root y apagado ordenado. Las migraciones de un entorno compartido se diseñan como expansión y contracción, no como `db push` improvisado.
10. **Revisión de preparación.** Registra pendientes de alertas, restauración, carga, secretos, rollback y retención. Conserva el monolito modular salvo evidencia que justifique otra decisión.

Ejecuta las comprobaciones del proyecto:

```bash
npm test
docker build -t api-entregas-integrador:local .
node src/server.js
```

Para el último comando, define antes una `DATABASE_URL` de laboratorio, `JWT_SECRET`, el origen del cliente y las credenciales estrictamente necesarias. Detén el proceso con `Ctrl+C` y comprueba el cierre de conexiones.

**Resultado esperado:** las pruebas recorren el flujo completo contra PostgreSQL y demuestran los rechazos de seguridad; la imagen se construye sin secretos; el servicio arranca solo con configuración válida y se apaga de forma ordenada. El informe de preparación conserva como pendiente todo lo que no se haya ejecutado.

**Fallo deliberado y corrección:** ejecuta tres experimentos separados. Primero, reutiliza un refresh revocado: debe recibir `401`; restaura el flujo con un refresh nuevo. Segundo, solicita una jornada ajena: debe rechazarse antes de unirse a la sala; no corrijas confiando en el rol general. Tercero, provoca un fallo del proveedor push después de confirmar: la entrega debe seguir confirmada y el outbox pendiente; no reviertas el estado de dominio.

**Verificación de salida.**

- [ ] Todos los archivos del proyecto se escribieron en una carpeta nueva, sin importar laboratorios anteriores.
- [ ] Las capas se conectan por contratos e inyección y las pruebas de dominio no requieren HTTP ni base.
- [ ] Registro, login, refresh, revocación y operación protegida funcionan de principio a fin.
- [ ] Dos usuarios del mismo rol no pueden acceder a recursos ajenos.
- [ ] La relación y las transacciones se prueban contra PostgreSQL real y efímero.
- [ ] Las posiciones conservan secuencia y recuperan huecos acotados sin presentar Socket.IO como persistencia.
- [ ] Los archivos tienen nombres de servidor, límites, validación de contenido, autorización y cuarentena.
- [ ] El push es un efecto posterior con datos mínimos y nunca concede permisos ni sustituye la fuente de verdad.
- [ ] Logs y respuestas correlacionan errores sin revelar credenciales.
- [ ] Docker empaqueta la versión probada y la configuración inválida impide arrancar.
- [ ] Microservicios, colas y TypeScript aparecen como decisiones condicionadas, no como requisitos de finalización.
- [ ] La revisión de preparación no declara productivos controles sin evidencia.

**Errores comunes y soluciones.**

- **Capas nominales con dependencias ocultas.** Retira importaciones de infraestructura desde aplicación e inyecta los puertos en la raíz de composición.
- **Pruebas integradas que simulan toda persistencia.** Conserva dobles para unidad, pero ejecuta el flujo crítico contra una base real desechable.
- **Secuencia global o historial infinito.** Asigna por jornada con una restricción durable y limita recuperación con una instantánea de respaldo.
- **Archivo disponible al terminar la subida.** Mantén cuarentena hasta que un trabajador autorizado registre el análisis.
- **Push dentro de la transición crítica.** Persiste dominio y outbox; procesa la notificación después con reintentos acotados.
- **Imagen confundida con producción.** Completa evidencia de alertas, restauración, capacidad, migraciones, secretos y rollback antes de esa afirmación.

La ejecución de comandos, las pruebas de integración y la revisión pedagógica y de seguridad por personas son evidencias separadas. Completar la lectura o marcar el laboratorio no sustituye ninguna de ellas.
