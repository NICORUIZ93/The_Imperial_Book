# Módulo 17 · Introducción a microservicios en Node

**Fase 2 · Node.js de cero a experto** (semana 6 de 12). **Duración:** 10 h (4 temas de 2 h y 2 h de laboratorio
integrador). **Dificultad:** 2 de 5 en estructura y dotenv, 3 de 5 en Service Discovery y configuración centralizada.
**Dependencias:** Módulo 14 (una API HTTP en Node), Módulo 13 (módulos ES, TypeScript estricto, graceful shutdown) y
Módulo 0.4 (variables de entorno, JSON, `curl`). **Herramientas:** **Node.js 26.13.1 LTS**, **TypeScript 6.0.3**,
**dotenv 18.0.10**, **consul 2.0.1** (cliente npm) y **HashiCorp Consul 2.1.0** (Docker Compose).
Hasta aquí construiste **un** servicio. Un sistema de microservicios son **muchos**, escritos por varios equipos y
desplegados muchas veces al día. Este módulo responde las cuatro primeras preguntas que aparecen cuando un servicio
deja de estar solo: ¿cómo ordeno el código para que crezca sin enredarse? (estructura de carpetas), ¿cómo cambio su
comportamiento sin tocar el código? (variables de entorno con dotenv), ¿cómo encuentra un servicio a otro si las
direcciones cambian? (Service Discovery con Consul) y ¿cómo cambio la configuración de veinte servicios sin
redesplegarlos? (configuración centralizada).

```mermaid
flowchart LR
    T1["1 · Estructura de<br/>carpetas escalable"] --> T2["2 · dotenv"]
    T2 --> T4["4 · Configuración<br/>centralizada"]
    T1 --> T3["3 · Service Discovery<br/>con Consul"]
    T3 --> T4
```

**Texto alternativo:** mapa del módulo. El tema 1 (estructura de carpetas escalable) lleva al tema 2 (dotenv) y al
tema 3 (Service Discovery con Consul). Los temas 2 y 3 llevan al tema 4 (configuración centralizada).

**Cómo usar el laboratorio.** Con Node 26 activo:

```bash
  # npm ci + tsc + 21 tests + demos → «RESULTADO: OK»
los comandos de verificación indicados  # además levanta Consul 2.1.0 con Docker y repite los temas 3 y 4 contra él
```

Todas las órdenes de las fichas se ejecutan **desde `modulo-21`** después de `npm ci`.
`package.json` del laboratorio (con `package-lock.json` que fija el árbol completo):

```json
{
  "name": "modulo-17-intro-microservicios-node",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 17 (Fase 2): Introducción a microservicios en Node.",
  "type": "module",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "typecheck": "tsc -p tsconfig.json",
    "test": "node --test --test-concurrency=1 'f1*/**/*.test.ts' 'f1*/**/*.test.js'",
    "test:infra": "node --test --test-concurrency=1 'f1*/**/*.infra.js'"
  },
  "dependencies": {
    "consul": "2.0.1",
    "dotenv": "18.0.10"
  },
  "devDependencies": {
    "@types/node": "26.6.6",
    "typescript": "6.0.3"
  }
}
```

`tsconfig.json` (solo lo usa el tema 1; TypeScript comprueba los tipos y **Node ejecuta los `.ts` directamente**):

```jsonc
{
  // Módulo 17 · TypeScript 6.0.3 solo como verificador de tipos (noEmit): Node.js 26 ejecuta los .ts
  // directamente quitando los tipos (type stripping), por eso se exige sintaxis "borrable" y
  // las importaciones llevan la extensión .ts.
  "compilerOptions": {
    "target": "es2024",
    "module": "nodenext",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "erasableSyntaxOnly": true,
    "verbatimModuleSyntax": true,
    "types": ["node"],
    "skipLibCheck": true
  },
  "include": ["f109-estructura"]
}
```

`docker-compose.yml` (temas 3 y 4):

```yaml
# Módulo 17 · Consul 2.1.0 en modo desarrollo (un solo agente servidor, datos en memoria).
# Uso: docker compose up -d --wait   ·   UI: http://localhost:8500   ·   Apagar: docker compose down -v
name: modulo-21
services:
  consul:
    image: hashicorp/consul:2.1.0
    command: ["agent", "-dev", "-client=0.0.0.0", "-ui"]
    ports:
      - "8500:8500" # API HTTP y UI
    healthcheck:
      test: ["CMD", "consul", "members"]
      interval: 2s
      timeout: 2s
      retries: 30
```

`comun/consul.js` (crea el cliente de Consul que usan los temas 3 y 4):

```javascript
// Crea el cliente de Consul a partir de CONSUL_HTTP_ADDR (la misma variable que usa la CLI `consul`).
// Requisitos: consul 2.0.1 (cliente npm) contra un agente Consul 2.1.0 (docker-compose.yml del laboratorio).
import Consul from 'consul';

export function clienteConsul(direccion = process.env.CONSUL_HTTP_ADDR ?? '127.0.0.1:8500') {
  const [host, port] = direccion.replace(/^https?:\/\//, '').split(':');
  return new Consul({ host, port: Number(port ?? 8500) });
}

// Para los tests: usa el Consul real si CONSUL_REAL=1 y, si no, el doble en memoria.
export async function consulParaTests() {
  if (process.env.CONSUL_REAL === '1') return { consul: clienteConsul(), detener: async () => {}, real: true };
  const { crearConsulDePrueba } = await import('./consul-de-prueba.js');
  const doble = crearConsulDePrueba();
  const { host, port } = await doble.iniciar();
  return { consul: new Consul({ host, port }), detener: () => doble.detener(), real: false };
}
```

Los tests de los temas 3 y 4 corren por defecto contra `comun/consul-de-prueba.js`, un **doble en memoria** de la parte
de la API HTTP de Consul que usa el módulo (registro con check TTL, salud y KV con consultas bloqueantes): así
los comandos de verificación indicados funciona sin Docker. Con `CONSUL_REAL=1` los mismos tests hablan con el Consul de `docker-compose.yml`.
Si no tienes Docker, `node comun/consul-de-prueba.js` deja el doble escuchando en `127.0.0.1:8500` para hacer los
laboratorios (no es Consul: no tiene UI, DNS ni clúster).

---

### Estructura de carpetas escalable

#### 1. UBICACIÓN

Módulo 17, Lección 1 de 4 · Fase 2.

#### 2. PRERREQUISITOS

- Una API HTTP en Node con rutas y errores (Módulo 14) y tests con `node --test` (Módulo 16).
- Módulos ES (`import`/`export`), interfaces de TypeScript y tipos estrictos (Módulo 13).

#### 3. OBJETIVO DE APRENDIZAJE

**Organizar** un microservicio Node en capas y módulos de negocio (`config/`, `shared/`, `modules/<módulo>/{dominio,
aplicacion,infraestructura,http}`), **aplicar** la regla de dependencias (todo apunta hacia el dominio) y **defenderla**
con un test automático; lo compruebas cuando `node --test 'f109-estructura/test/*.test.ts'` pasa 8 de 8 y
`revisar-capas.ts` informa «0 violaciones».

#### 4. ANALOGÍA VISUAL

Dibuja un **restaurante visto desde arriba**, sin techo. A la izquierda, la **puerta y el salón**: meseros que toman
la orden en una libreta y la traducen a una comanda (la capa `http/`). En el centro, la **cocina**: el chef sigue la
receta paso a paso y pide ingredientes por una ventanilla (la capa `aplicacion/`). En una vitrina cerrada, bajo llave,
el **recetario de la casa**: las reglas que no cambian aunque se cambie de local, de meseros o de proveedor (la capa
`dominio/`). Al fondo, la **bodega y la puerta de proveedores**: neveras, despensa, el camión del proveedor (la capa
`infraestructura/`). Las **flechas del dibujo** van todas hacia la vitrina: el mesero conoce la cocina, la cocina
conoce el recetario, la bodega surte lo que la cocina pide por la ventanilla; el recetario no menciona ni al mesero
ni a la marca de la nevera. Junto a la entrada, un **tablero de fusibles** con etiquetas (la carpeta `config/`), y un
**cajón de utensilios** que usa todo el mundo (la carpeta `shared/`). Si el restaurante abre una segunda línea de
negocio (domicilios), se construye **otra cocina completa al lado** con sus mismas cuatro zonas (otro módulo), no se
mezclan las ollas.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart TB
    MAIN["main.ts<br/>(arranque)"] --> APP["app.ts"]
    MAIN --> CFG["config/"]
    APP --> IDX["modules/pedidos/index.ts<br/>(API pública del módulo)"]
    subgraph MOD["modules/pedidos/"]
        IDX --> HTTP["http/<br/>rutas, códigos de estado"]
        IDX --> INFRA["infraestructura/<br/>repositorios, clientes"]
        HTTP --> APL["aplicacion/<br/>casos de uso + puertos"]
        INFRA -. "implementa los puertos" .-> APL
        APL --> DOM["dominio/<br/>entidades y reglas"]
    end
    DOM --> SH["shared/"]
    HTTP --> SH
    APL --> SH
```

**Texto alternativo:** `main.ts` importa `app.ts` y `config/`. `app.ts` solo importa `modules/pedidos/index.ts`, la
API pública del módulo. Dentro del módulo, `index.ts` conecta `http/` e `infraestructura/`; `http/` depende de
`aplicacion/`; `infraestructura/` implementa los puertos que define `aplicacion/` (flecha punteada); `aplicacion/`
depende de `dominio/`. `dominio/`, `aplicacion/` y `http/` pueden usar `shared/`. Ninguna flecha sale de `dominio/`
hacia las otras capas.

#### 6. EXPLICACIÓN NIVEL 0

- Un programa pequeño cabe en un archivo. Un servicio real tiene cientos de archivos: sin un orden, encontrar dónde
  cambiar algo cuesta más que el cambio.
- **Estructura de carpetas** es decidir de antemano **dónde vive cada tipo de código**. Es como los cajones de una
  cocina: cubiertos en uno, ollas en otro. No hace el programa más rápido; hace que **las personas** trabajen rápido.
- Aquí hay cuatro cajones por cada tema de negocio (por ejemplo, «pedidos»):
  - **dominio**: las reglas del negocio («un pedido necesita al menos una línea»).
  - **aplicación**: los pasos de cada acción («crear pedido: validar, guardar»).
  - **infraestructura**: lo que habla con el exterior (base de datos, otros servicios).
  - **http**: lo que recibe peticiones web y devuelve respuestas.
- **Escalable** significa que al añadir el tema 2, 3 o 10 repites el mismo molde, sin reordenar lo anterior.

#### 7. EXPLICACIÓN INTERMEDIA

- **Por capas técnicas vs por módulos de negocio.** La estructura clásica `controllers/`, `services/`, `models/`
  agrupa por tipo de archivo: para cambiar «pedidos» tocas tres carpetas y todas crecen sin límite. Agrupar primero por
  **módulo de negocio** (`modules/pedidos/`) y dentro por capa mantiene junto lo que cambia junto, y un módulo entero
  se puede extraer a otro servicio.
- **Regla de dependencias:** las importaciones apuntan hacia adentro. `dominio/` no importa nada (ni librerías);
  `aplicacion/` importa `dominio/`; `http/` e `infraestructura/` importan `aplicacion/` y `dominio/`. Nunca al revés.
- **Puertos y adaptadores:** `aplicacion/puertos.ts` declara interfaces (`RepositorioDePedidos`). `infraestructura/`
  las implementa. El caso de uso recibe la implementación **por parámetro** (inyección de dependencias a mano), así un
  test le pasa un repositorio falso y producción uno de PostgreSQL sin tocar el caso de uso.
- **`index.ts` es la puerta del módulo:** lo de fuera solo importa de `modules/pedidos/index.ts`. Lo demás es privado.
- **`config/` es el único que lee `process.env`**; los módulos reciben valores ya validados.
- **`main.ts` (arranque) y `app.ts` (armado) separados:** `app.ts` no abre puertos, y los tests la arrancan en un
  puerto libre.
- **TypeScript sin compilar:** Node.js 26 ejecuta `.ts` quitando los tipos (*type stripping*). Requiere importar con
  la extensión `.ts` y sintaxis «borrable» (sin `enum` ni propiedades de parámetro); `tsc --noEmit` solo comprueba
  tipos. NestJS (Módulo 14) sí necesita compilar, por sus decoradores.
- **La estructura se verifica:** `herramientas/revisar-capas.ts` lee los `import` de cada archivo y falla si alguno va
  en la dirección prohibida. Es un test más.

#### 8. EXPLICACIÓN MAESTRA

- **Alternativas y trade-offs.**
  1. **Capas técnicas planas** (`routes/`, `services/`, `repositories/`): mínima ceremonia; válida para un servicio de
     5 a 10 archivos. Se degrada cuando hay varios conceptos de negocio.
  2. **Módulos de negocio con capas internas** (la de esta ficha, estilo hexagonal): más archivos y más indirección
     (interfaces, inyección) a cambio de tests rápidos y de poder cambiar base de datos o framework sin tocar reglas.
  3. **Vertical slices** (una carpeta por caso de uso: `crear-pedido/` con su ruta, su lógica y su consulta): máxima
     cohesión por funcionalidad, poca reutilización; funciona bien con CQRS (Módulo 22).
  4. **Framework con estructura propia** (NestJS: módulos, providers): la convención viene dada y la inyección la hace
     el contenedor; pagas acoplamiento al framework y compilación.
- **Monorepo vs un repositorio por servicio.** Con muchos servicios Node, un monorepo (workspaces de npm o pnpm, Nx,
  Turborepo) comparte tipos y herramientas, pero facilita importar código interno de otro servicio: la regla «solo
  `index.ts`» se vuelve «solo el contrato publicado». Un repositorio por servicio aísla mejor y duplica más.
- **`shared/` es peligroso.** Crece hasta convertirse en un segundo monolito del que todo depende. Regla práctica: ahí
  solo entra código sin reglas de negocio y estable (errores base, utilidades de fechas); si dos módulos comparten una
  regla de negocio, probablemente es un tercer módulo.
- **El dominio sin librerías** cuesta: no puedes usar el decorador del ORM en la entidad ni Zod en el dominio. A
  cambio, una actualización mayor de una librería no toca las reglas. En servicios que son casi solo CRUD ese
  aislamiento no se paga.
- **Cuándo NO usar esta estructura:** un servicio que es un adaptador delgado (recibe un webhook y publica un evento),
  un prototipo que quizá se descarte o un CRUD sin reglas. Ahí cuatro capas son burocracia: empieza plano y mueve a
  módulos cuando aparezca el segundo concepto de negocio.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** (ejecuta los `.ts`), **TypeScript 6.0.3** (`tsc --noEmit`) y **@types/node 26.6.6**;
sin dependencias de ejecución. `package.json` y `tsconfig.json` están al inicio del módulo.

```text
f109-estructura/
├── src/
│   ├── main.ts                      ← arranque: config, listen, apagado
│   ├── app.ts                       ← arma el servidor con los módulos
│   ├── config/config.ts             ← único lector de process.env
│   ├── shared/errores.ts            ← errores base, sin negocio
│   └── modules/
│       └── pedidos/
│           ├── index.ts             ← API pública del módulo
│           ├── dominio/pedido.ts
│           ├── aplicacion/puertos.ts
│           ├── aplicacion/casos-de-uso.ts
│           ├── infraestructura/repositorio-en-memoria.ts
│           └── http/pedidos.rutas.ts
├── herramientas/revisar-capas.ts    ← test de arquitectura
└── test/
    ├── pedidos.test.ts
    └── arquitectura.test.ts
```

`src/main.ts`:

```typescript
// Módulo 17 · F109 · Estructura de carpetas escalable.
// Requisitos: Node.js 26.13.1 LTS (ejecuta TypeScript quitando los tipos). Ejecuta: node f109-estructura/src/main.ts
// main.ts es el punto de entrada: lee la configuración, arma la app, escucha y apaga con orden.
import { crearApp } from './app.ts';
import { leerConfig } from './config/config.ts';

const config = leerConfig();
const servidor = crearApp(config);
servidor.listen(config.puerto, () => console.log(`${config.servicio} escuchando en http://localhost:${config.puerto}`));

for (const senal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(senal, () => servidor.close(() => process.exit(0)));
}
```

`src/app.ts`:

```typescript
// app.ts: arma el servidor con los módulos. No escucha en ningún puerto: eso lo hace main.ts,
// y así los tests pueden arrancarlo en un puerto libre (listen(0)).
import { createServer, type Server } from 'node:http';
import type { Config } from './config/config.ts';
import { moduloDePedidos } from './modules/pedidos/index.ts';

export function crearApp(config: Config): Server {
  const modulos = [moduloDePedidos({ montoMaximo: config.montoMaximo })];
  return createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url === '/salud') {
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ servicio: config.servicio, estado: 'ok' }));
        return;
      }
      for (const modulo of modulos) if (await modulo(req, res)) return;
      res.writeHead(404, { 'content-type': 'application/json' }).end(JSON.stringify({ detalle: `No existe ${req.method} ${req.url}` }));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'content-type': 'application/json' }).end(JSON.stringify({ detalle: 'Error interno' }));
    }
  });
}
```

`src/config/config.ts`:

```typescript
// config/: el ÚNICO lugar que lee process.env. El resto del código recibe un objeto ya validado.
export interface Config {
  readonly servicio: string;
  readonly puerto: number;
  readonly montoMaximo: number;
}

export function leerConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const puerto = Number(env.PORT ?? 3109);
  const montoMaximo = Number(env.MONTO_MAXIMO ?? 5_000_000);
  if (!Number.isInteger(puerto) || puerto < 0 || puerto > 65535) throw new Error(`PORT inválido: ${env.PORT}`);
  if (!Number.isFinite(montoMaximo) || montoMaximo <= 0) throw new Error(`MONTO_MAXIMO inválido: ${env.MONTO_MAXIMO}`);
  return Object.freeze({ servicio: 'pedidos', puerto, montoMaximo });
}
```

`src/shared/errores.ts`:

```typescript
// shared/: código sin reglas de negocio que cualquier módulo puede usar. Debe ser pequeño y estable.
export class ErrorDeDominio extends Error {
  readonly codigo: string;
  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeDominio';
    this.codigo = codigo;
  }
}

export class NoEncontrado extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'NoEncontrado';
  }
}
```

`src/modules/pedidos/dominio/pedido.ts`:

```typescript
// dominio/: las reglas del negocio. NO importa nada de http/, infraestructura/ ni librerías externas:
// así se puede probar sin servidor ni base de datos y sobrevive a un cambio de framework.
import { ErrorDeDominio } from '../../../shared/errores.ts';

export interface Linea {
  readonly producto: string;
  readonly cantidad: number;
  readonly precioUnitario: number;
}

export interface Pedido {
  readonly id: string;
  readonly cliente: string;
  readonly lineas: readonly Linea[];
  readonly total: number;
  readonly estado: 'CREADO';
}

export function crearPedido(id: string, cliente: string, lineas: readonly Linea[], montoMaximo: number): Pedido {
  if (cliente.trim() === '') throw new ErrorDeDominio('CLIENTE_VACIO', 'El pedido necesita un cliente');
  if (lineas.length === 0) throw new ErrorDeDominio('SIN_LINEAS', 'El pedido necesita al menos una línea');
  for (const l of lineas) {
    if (!Number.isInteger(l.cantidad) || l.cantidad <= 0) {
      throw new ErrorDeDominio('CANTIDAD_INVALIDA', `Cantidad inválida para ${l.producto}`);
    }
  }
  const total = lineas.reduce((suma, l) => suma + l.cantidad * l.precioUnitario, 0);
  if (total > montoMaximo) throw new ErrorDeDominio('MONTO_EXCEDIDO', `El total ${total} supera el máximo ${montoMaximo}`);
  return Object.freeze({ id, cliente, lineas, total, estado: 'CREADO' });
}
```

`src/modules/pedidos/aplicacion/puertos.ts`:

```typescript
// aplicacion/puertos.ts: lo que el caso de uso NECESITA del exterior, descrito como interfaces ("puertos").
// La infraestructura las implementa ("adaptadores"); la aplicación nunca importa la implementación.
import type { Pedido } from '../dominio/pedido.ts';

export interface RepositorioDePedidos {
  guardar(pedido: Pedido): Promise<void>;
  buscar(id: string): Promise<Pedido | undefined>;
}

export interface GeneradorDeIds {
  siguiente(): string;
}
```

`src/modules/pedidos/aplicacion/casos-de-uso.ts`:

```typescript
// aplicacion/: los casos de uso. Orquestan el dominio y los puertos; no saben de HTTP ni de SQL.
import { NoEncontrado } from '../../../shared/errores.ts';
import { crearPedido, type Linea, type Pedido } from '../dominio/pedido.ts';
import type { GeneradorDeIds, RepositorioDePedidos } from './puertos.ts';

export interface Dependencias {
  readonly repositorio: RepositorioDePedidos;
  readonly ids: GeneradorDeIds;
  readonly montoMaximo: number;
}

export interface CasosDeUsoDePedidos {
  crear(entrada: { cliente: string; lineas: Linea[] }): Promise<Pedido>;
  consultar(id: string): Promise<Pedido>;
}

export function crearCasosDeUso({ repositorio, ids, montoMaximo }: Dependencias): CasosDeUsoDePedidos {
  return {
    async crear({ cliente, lineas }) {
      const pedido = crearPedido(ids.siguiente(), cliente, lineas, montoMaximo);
      await repositorio.guardar(pedido);
      return pedido;
    },
    async consultar(id) {
      const pedido = await repositorio.buscar(id);
      if (!pedido) throw new NoEncontrado(`No existe el pedido ${id}`);
      return pedido;
    },
  };
}
```

`src/modules/pedidos/infraestructura/repositorio-en-memoria.ts`:

```typescript
// infraestructura/: adaptadores hacia el mundo exterior (base de datos, colas, otros servicios).
// Este guarda en memoria; el de producción (PostgreSQL, Módulo 15) implementa la MISMA interfaz.
import type { GeneradorDeIds, RepositorioDePedidos } from '../aplicacion/puertos.ts';
import type { Pedido } from '../dominio/pedido.ts';

export function repositorioEnMemoria(): RepositorioDePedidos {
  const datos = new Map<string, Pedido>();
  return {
    async guardar(pedido) {
      datos.set(pedido.id, pedido);
    },
    async buscar(id) {
      return datos.get(id);
    },
  };
}

export function idsSecuenciales(): GeneradorDeIds {
  let n = 0;
  return { siguiente: () => `P-${++n}` };
}
```

`src/modules/pedidos/http/pedidos.rutas.ts`:

```typescript
// http/: traduce HTTP ⇄ casos de uso. Aquí viven los códigos de estado; no hay reglas de negocio.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { ErrorDeDominio, NoEncontrado } from '../../../shared/errores.ts';
import type { CasosDeUsoDePedidos } from '../aplicacion/casos-de-uso.ts';

function responder(res: ServerResponse, status: number, cuerpo: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(cuerpo));
}

async function leerJson(req: IncomingMessage): Promise<any> {
  let texto = '';
  for await (const trozo of req) texto += trozo;
  return JSON.parse(texto || '{}');
}

// Devuelve true si la ruta era de este módulo (así app.ts puede probar con el siguiente módulo).
export function rutasDePedidos(casos: CasosDeUsoDePedidos) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<boolean> => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    try {
      if (req.method === 'POST' && url.pathname === '/pedidos') {
        const cuerpo = await leerJson(req);
        const pedido = await casos.crear({ cliente: String(cuerpo.cliente ?? ''), lineas: cuerpo.lineas ?? [] });
        responder(res, 201, pedido);
        return true;
      }
      const m = /^\/pedidos\/([\w-]+)$/.exec(url.pathname);
      if (req.method === 'GET' && m) {
        responder(res, 200, await casos.consultar(m[1]!));
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof ErrorDeDominio) responder(res, 422, { codigo: error.codigo, detalle: error.message });
      else if (error instanceof NoEncontrado) responder(res, 404, { detalle: error.message });
      else if (error instanceof SyntaxError) responder(res, 400, { detalle: 'JSON inválido' });
      else throw error;
      return true;
    }
  };
}
```

`src/modules/pedidos/index.ts`:

```typescript
// index.ts: la API PÚBLICA del módulo. Otros módulos y app.ts solo pueden importar desde aquí;
// lo demás (dominio/, aplicacion/, infraestructura/, http/) es privado del módulo.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { crearCasosDeUso } from './aplicacion/casos-de-uso.ts';
import { rutasDePedidos } from './http/pedidos.rutas.ts';
import { idsSecuenciales, repositorioEnMemoria } from './infraestructura/repositorio-en-memoria.ts';

export type { Pedido } from './dominio/pedido.ts';

export function moduloDePedidos(opciones: { montoMaximo: number }): (req: IncomingMessage, res: ServerResponse) => Promise<boolean> {
  // Raíz de composición del módulo: aquí (y solo aquí) se eligen las implementaciones concretas.
  const casos = crearCasosDeUso({
    repositorio: repositorioEnMemoria(),
    ids: idsSecuenciales(),
    montoMaximo: opciones.montoMaximo,
  });
  return rutasDePedidos(casos);
}
```

`herramientas/revisar-capas.ts`:

```typescript
// Módulo 17 · F109 · Fitness function de arquitectura: comprueba que las carpetas respetan la regla
// de dependencias (las flechas apuntan hacia el dominio). Ejecuta: node f109-estructura/herramientas/revisar-capas.ts
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

// Qué capas puede importar cada capa de un módulo (además de sí misma y de shared/).
const PERMITIDO: Record<string, readonly string[]> = {
  dominio: [],
  aplicacion: ['dominio'],
  infraestructura: ['aplicacion', 'dominio'],
  http: ['aplicacion', 'dominio'],
};

export interface Violacion {
  readonly archivo: string;
  readonly importa: string;
  readonly regla: string;
}

function archivosTs(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? archivosTs(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : [],
  );
}

// «modules/pedidos/dominio/pedido.ts» → { modulo: 'pedidos', capa: 'dominio' }
function ubicar(rutaRelativa: string): { modulo?: string; capa?: string; raiz: string } {
  const partes = rutaRelativa.split(sep);
  if (partes[0] !== 'modules') return { raiz: partes[0]! };
  return { raiz: 'modules', modulo: partes[1], capa: partes.length > 3 ? partes[2] : 'index' };
}

export function revisarCapas(src: string): Violacion[] {
  const violaciones: Violacion[] = [];
  for (const archivo of archivosTs(src)) {
    const origen = ubicar(relative(src, archivo));
    const codigo = readFileSync(archivo, 'utf8');
    for (const [, especificador] of codigo.matchAll(/from\s+'([^']+)'/g)) {
      const rel = relative(src, archivo);
      if (!especificador!.startsWith('.')) {
        // Paquete o módulo de Node: el dominio y la aplicación deben quedar libres de librerías.
        if (origen.capa === 'dominio' || origen.capa === 'aplicacion') {
          violaciones.push({ archivo: rel, importa: especificador!, regla: `${origen.capa}/ no importa librerías ni node:*` });
        }
        continue;
      }
      const destinoRel = relative(src, resolve(dirname(archivo), especificador!));
      const destino = ubicar(destinoRel);
      if (destino.raiz === 'shared') continue; // shared/ lo puede usar cualquiera
      if (origen.raiz === 'shared') {
        violaciones.push({ archivo: rel, importa: destinoRel, regla: 'shared/ no importa de módulos ni de config/' });
      } else if (origen.raiz === 'modules' && destino.raiz === 'modules' && origen.modulo !== destino.modulo && destino.capa !== 'index') {
        violaciones.push({ archivo: rel, importa: destinoRel, regla: 'un módulo solo importa el index.ts de otro módulo' });
      } else if (origen.raiz !== 'modules' && destino.raiz === 'modules' && destino.capa !== 'index') {
        violaciones.push({ archivo: rel, importa: destinoRel, regla: 'fuera de modules/ solo se importa el index.ts del módulo' });
      } else if (origen.raiz === 'modules' && origen.modulo === destino.modulo && origen.capa !== 'index' && origen.capa !== destino.capa) {
        if (!(PERMITIDO[origen.capa!] ?? []).includes(destino.capa!)) {
          violaciones.push({ archivo: rel, importa: destinoRel, regla: `${origen.capa}/ no puede importar ${destino.capa}/` });
        }
      } else if (origen.raiz === 'modules' && destino.raiz === 'config') {
        violaciones.push({ archivo: rel, importa: destinoRel, regla: 'los módulos reciben la configuración por parámetro' });
      }
    }
  }
  return violaciones;
}

if (import.meta.main) {
  const src = resolve(import.meta.dirname, '..', process.argv[2] ?? 'src');
  const violaciones = revisarCapas(src);
  for (const v of violaciones) console.log(`✘ ${v.archivo} → ${v.importa}  (${v.regla})`);
  console.log(violaciones.length === 0 ? '✔ 0 violaciones: todas las dependencias apuntan hacia el dominio' : `${violaciones.length} violación(es)`);
  process.exitCode = violaciones.length === 0 ? 0 : 1;
}
```

#### 10. MINI-LABORATORIO

1. Instala las dependencias fijadas (una sola vez para todo el módulo), comprueba los tipos y arranca el servicio:
   ```bash
   npm ci
   npm run typecheck
   node f109-estructura/src/main.ts
   ```
2. En otra terminal, recorre las capas de afuera hacia adentro:
   ```bash
   curl -s -w ' [%{http_code}]\n' -X POST localhost:3109/pedidos -H 'content-type: application/json' -d '{"cliente":"Ana","lineas":[{"producto":"Teclado","cantidad":2,"precioUnitario":120000}]}'
   curl -s -w ' [%{http_code}]\n' localhost:3109/pedidos/P-1
   curl -s -w ' [%{http_code}]\n' -X POST localhost:3109/pedidos -d '{"cliente":"Ana","lineas":[]}'
   curl -s -w ' [%{http_code}]\n' -X POST localhost:3109/pedidos -d '{"cliente":"Ana","lineas":[{"producto":"Servidor","cantidad":1,"precioUnitario":9000000}]}'
   ```
3. Revisa la regla de dependencias; después rómpela a propósito y vuelve a revisar:
   ```bash
   node f109-estructura/herramientas/revisar-capas.ts
   # edita src/modules/pedidos/dominio/pedido.ts y añade esta primera línea:
   #   import { repositorioEnMemoria } from '../infraestructura/repositorio-en-memoria.ts';
   node f109-estructura/herramientas/revisar-capas.ts ; echo "código de salida: $?"
   # deshaz el cambio antes de seguir
   ```

**Output esperado** (paso 1, terminal 1; `npm run typecheck` no imprime errores):

```text
pedidos escuchando en http://localhost:3109
```

**Output esperado** (paso 2, salida real):

```text
{"id":"P-1","cliente":"Ana","lineas":[{"producto":"Teclado","cantidad":2,"precioUnitario":120000}],"total":240000,"estado":"CREADO"} [201]
{"id":"P-1","cliente":"Ana","lineas":[{"producto":"Teclado","cantidad":2,"precioUnitario":120000}],"total":240000,"estado":"CREADO"} [200]
{"codigo":"SIN_LINEAS","detalle":"El pedido necesita al menos una línea"} [422]
{"codigo":"MONTO_EXCEDIDO","detalle":"El total 9000000 supera el máximo 5000000"} [422]
```

**Output esperado** (paso 3, salida real antes y después de romper la regla):

```text
✔ 0 violaciones: todas las dependencias apuntan hacia el dominio
✘ modules/pedidos/dominio/pedido.ts → modules/pedidos/infraestructura/repositorio-en-memoria.ts  (dominio/ no puede importar infraestructura/)
1 violación(es)
código de salida: 1
```

**Captura comentada:** el `total` (240000) lo calculó `dominio/`; el `201` y el `422` los eligió `http/`; el máximo
(5000000) llegó desde `config/` como parámetro. Los dos 422 tienen un `codigo` distinto porque la regla rota es
distinta, pero la capa `http/` los traduce con una sola línea. En el paso 3, el revisor te dice el archivo, lo que
importó y la regla: eso mismo falla en la integración continua antes de que el cambio llegue a `main`.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec 'f109-estructura/test/*.test.ts'
```

Salida real:

```text
✔ src/ respeta la regla de dependencias (3.94146ms)
✔ detecta un dominio que importa infraestructura y un acceso al interior de otro módulo (3.279776ms)
▶ dominio (sin servidor, sin base de datos)
  ✔ calcula el total del pedido (0.741411ms)
  ✔ rechaza un pedido que supera el monto máximo (0.510575ms)
✔ dominio (sin servidor, sin base de datos) (2.411145ms)
▶ aplicación (con un repositorio falso: el puerto se sustituye sin tocar el caso de uso)
  ✔ crear guarda el pedido en el repositorio que le inyectan (0.647ms)
✔ aplicación (con un repositorio falso: el puerto se sustituye sin tocar el caso de uso) (0.867709ms)
▶ http (la app completa en un puerto libre)
  ✔ POST /pedidos → 201 y GET /pedidos/P-1 → 200 (38.792139ms)
  ✔ una regla de dominio rota se traduce a 422 en la capa http (4.914317ms)
  ✔ GET /pedidos/P-999 → 404 (4.551795ms)
✔ http (la app completa en un puerto libre) (51.958873ms)
ℹ tests 8
ℹ pass 8
ℹ fail 0
```

Los tests (`test/pedidos.test.ts`): uno por capa, cada uno con lo mínimo que necesita.

```typescript
// Módulo 17 · F109 · Tests por capa. Ejecuta: node --test f109-estructura/test/pedidos.test.ts
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import { after, before, describe, test } from 'node:test';
import { crearApp } from '../src/app.ts';
import { leerConfig } from '../src/config/config.ts';
import { crearCasosDeUso } from '../src/modules/pedidos/aplicacion/casos-de-uso.ts';
import { crearPedido, type Pedido } from '../src/modules/pedidos/dominio/pedido.ts';
import { ErrorDeDominio } from '../src/shared/errores.ts';

describe('dominio (sin servidor, sin base de datos)', () => {
  test('calcula el total del pedido', () => {
    const pedido = crearPedido('P-1', 'Ana', [{ producto: 'Teclado', cantidad: 2, precioUnitario: 120000 }], 5_000_000);
    assert.equal(pedido.total, 240000);
    assert.equal(pedido.estado, 'CREADO');
  });

  test('rechaza un pedido que supera el monto máximo', () => {
    assert.throws(
      () => crearPedido('P-1', 'Ana', [{ producto: 'Servidor', cantidad: 1, precioUnitario: 9_000_000 }], 5_000_000),
      (e: unknown) => e instanceof ErrorDeDominio && e.codigo === 'MONTO_EXCEDIDO',
    );
  });
});

describe('aplicación (con un repositorio falso: el puerto se sustituye sin tocar el caso de uso)', () => {
  test('crear guarda el pedido en el repositorio que le inyectan', async () => {
    const guardados: Pedido[] = [];
    const casos = crearCasosDeUso({
      repositorio: { guardar: async (p) => void guardados.push(p), buscar: async () => undefined },
      ids: { siguiente: () => 'P-77' },
      montoMaximo: 1000,
    });
    const pedido = await casos.crear({ cliente: 'Luis', lineas: [{ producto: 'Cable', cantidad: 1, precioUnitario: 500 }] });
    assert.equal(pedido.id, 'P-77');
    assert.deepEqual(guardados, [pedido]);
  });
});

describe('http (la app completa en un puerto libre)', () => {
  const servidor = crearApp(leerConfig({ PORT: '0', MONTO_MAXIMO: '1000000' }));
  let base = '';
  before(async () => {
    await new Promise<void>((ok) => servidor.listen(0, ok));
    base = `http://localhost:${(servidor.address() as AddressInfo).port}`;
  });
  after(() => servidor.close());

  test('POST /pedidos → 201 y GET /pedidos/P-1 → 200', async () => {
    const res = await fetch(`${base}/pedidos`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cliente: 'Ana', lineas: [{ producto: 'Mouse', cantidad: 3, precioUnitario: 50000 }] }),
    });
    assert.equal(res.status, 201);
    assert.deepEqual(await res.json(), {
      id: 'P-1', cliente: 'Ana', lineas: [{ producto: 'Mouse', cantidad: 3, precioUnitario: 50000 }], total: 150000, estado: 'CREADO',
    });
    assert.equal((await fetch(`${base}/pedidos/P-1`)).status, 200);
  });

  test('una regla de dominio rota se traduce a 422 en la capa http', async () => {
    const res = await fetch(`${base}/pedidos`, { method: 'POST', body: JSON.stringify({ cliente: 'Ana', lineas: [] }) });
    assert.equal(res.status, 422);
    assert.deepEqual(await res.json(), { codigo: 'SIN_LINEAS', detalle: 'El pedido necesita al menos una línea' });
  });

  test('GET /pedidos/P-999 → 404', async () => {
    assert.equal((await fetch(`${base}/pedidos/P-999`)).status, 404);
  });
});
```

Y el test de arquitectura (`test/arquitectura.test.ts`):

```typescript
// Módulo 17 · F109 · La estructura se defiende con un test: si alguien importa en la dirección
// prohibida, el build falla. Ejecuta: node --test f109-estructura/test/arquitectura.test.ts
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { revisarCapas } from '../herramientas/revisar-capas.ts';

test('src/ respeta la regla de dependencias', () => {
  assert.deepEqual(revisarCapas(join(import.meta.dirname, '..', 'src')), []);
});

test('detecta un dominio que importa infraestructura y un acceso al interior de otro módulo', () => {
  const src = mkdtempSync(join(tmpdir(), 'capas-'));
  try {
    for (const d of ['modules/pedidos/dominio', 'modules/pedidos/infraestructura', 'modules/pagos/aplicacion']) {
      mkdirSync(join(src, d), { recursive: true });
    }
    writeFileSync(join(src, 'modules/pedidos/infraestructura/repo.ts'), 'export const repo = {};\n');
    writeFileSync(join(src, 'modules/pedidos/dominio/pedido.ts'), "import { repo } from '../infraestructura/repo.ts';\nexport const p = repo;\n");
    writeFileSync(join(src, 'modules/pagos/aplicacion/cobrar.ts'), "import { p } from '../../pedidos/dominio/pedido.ts';\nexport const c = p;\n");
    const reglas = revisarCapas(src).map((v) => v.regla).sort();
    assert.deepEqual(reglas, ['dominio/ no puede importar infraestructura/', 'un módulo solo importa el index.ts de otro módulo']);
  } finally {
    rmSync(src, { recursive: true, force: true });
  }
});
```

**Pregunta de comprobación:** quieres guardar los pedidos en PostgreSQL. ¿Qué archivos creas o cambias y cuáles **no**
tocas? (Respuesta: creas `infraestructura/repositorio-postgres.ts` que implementa `RepositorioDePedidos` y cambias una
línea en `index.ts`, la raíz de composición. `dominio/`, `aplicacion/` y `http/` no se tocan y sus tests siguen pasando.)

#### 12. ERROR COMÚN

**Síntoma:** mueves un archivo de carpeta o importas una carpeta «como siempre» y el servicio no arranca. En módulos
ES, Node **no** adivina extensiones ni busca `index` dentro de una carpeta.

```typescript
// src/app.ts
import { moduloDePedidos } from './modules/pedidos';          // ❌ carpeta
import { moduloDePedidos } from './modules/pedidos/index';    // ❌ sin extensión
import { moduloDePedidos } from './modules/pedidos/index.ts'; // ✔
```

**Cómo se ve** (salida real de `node f109-estructura/src/main.ts` con Node.js 26.13.1; rutas recortadas con `…`):

```text
Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '…/f109-estructura/src/modules/pedidos' is not supported resolving ES modules imported from …/f109-estructura/src/app.ts
  code: 'ERR_UNSUPPORTED_DIR_IMPORT',
```

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/f109-estructura/src/modules/pedidos/index' imported from …/f109-estructura/src/app.ts
```

Y `npm run typecheck` (TypeScript 6.0.3) lo detecta **antes** de ejecutar:

```text
f109-estructura/src/app.ts(5,33): error TS2834: Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'. Consider adding an extension to the import path.
```

**Diagnóstico visual:** el mensaje trae dos rutas: la que **no encontró** y el archivo que **la importó** (`imported
from`). Abre el segundo y mira la línea del `import`: falta la extensión o apunta a una carpeta. **Arreglo:** ruta
relativa completa con `.ts`, y ejecuta `npm run typecheck` en cada cambio (o en un *hook* de pre-commit) para que
los movimientos de archivos se detecten sin arrancar el servicio.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cómo organizas el código de un microservicio Node para que siga siendo mantenible cuando crece?»

**Respuesta modelo:** agrupo primero por módulo de negocio y dentro por capa: dominio (reglas, sin dependencias),
aplicación (casos de uso y las interfaces de lo que necesitan), infraestructura (implementaciones: base de datos,
clientes de otros servicios) y la capa de entrada (HTTP, consumidores de mensajes). Las dependencias apuntan hacia el
dominio y las implementaciones se inyectan en una raíz de composición, lo que me da tests rápidos por capa y me deja
cambiar de base de datos o de framework sin tocar reglas. Cada módulo expone una API pública y lo demás es privado;
la configuración se lee y valida en un solo lugar. Y no confío en la disciplina: un test de arquitectura (o
dependency-cruiser, o las reglas de ESLint) rompe el build si alguien importa en la dirección prohibida. Para un
servicio muy pequeño empiezo plano y paso a esta estructura cuando aparece el segundo concepto de negocio.

#### 14. ANTI-PATRÓN RELACIONADO

**La carpeta `utils/` (o `helpers/`, `common/`) que lo sabe todo, y el controlador que hace todo:**

```typescript
// ❌ src/routes/pedidos.ts — HTTP, reglas de negocio, SQL y configuración en la misma función
import { pool } from '../utils/db.ts';
import { enviarCorreo, calcularIva, formatearFecha, validarNit } from '../utils/helpers.ts'; // 1.800 líneas

export async function crearPedido(req, res) {
  if (req.body.total > Number(process.env.MONTO_MAXIMO)) return res.writeHead(400).end(); // regla + config aquí
  await pool.query('INSERT INTO pedidos …');                                                // SQL aquí
  await enviarCorreo(req.body.cliente);                                                     // efecto externo aquí
  res.writeHead(201).end();
}
```

Se ve así: para probar la regla del monto máximo necesitas un servidor HTTP **y** una base de datos; `helpers.ts` lo
importan todos los archivos y cualquier cambio en él obliga a volver a probar todo; y dos personas que tocan «pedidos»
y «pagos» chocan siempre en los mismos tres archivos.

---

### dotenv

#### 1. UBICACIÓN

Módulo 17, Lección 2 de 4 · Fase 2.

#### 2. PRERREQUISITOS

- Variables de entorno y `process.env` (Módulo 0.4); `config/` como único lector de la configuración (ficha anterior).
- Git y `.gitignore` (Módulo 0.4).

#### 3. OBJETIVO DE APRENDIZAJE

**Configurar** un servicio Node con un archivo `.env` cargado con dotenv, **validar** y convertir cada variable al
arrancar (fallando con todos los errores a la vez) y **explicar** qué gana cuando una variable está en el archivo y
en el entorno; lo compruebas cuando `node --test f110-dotenv/config.test.js` pasa 5 de 5.

#### 4. ANALOGÍA VISUAL

Dibuja un **apartamento de alquiler amoblado**. En la pared de la entrada hay un **panel de interruptores con
etiquetas escritas a mano**: «temperatura del calentador: 40», «clave del wifi: …», «hora del riego: 6:00». El
apartamento (el código) es **idéntico** para todos los inquilinos; lo que cambia es la **hoja pegada junto al panel**
con los valores de cada uno (el archivo `.env`). El inquilino nuevo recibe una **hoja de ejemplo** con las etiquetas y
valores de muestra (`.env.example`), la copia y pone los suyos; su hoja **no sale del apartamento** (no va a Git). Si
el administrador del edificio fija un interruptor desde el **cuarto de control central** (una variable real del
entorno, puesta por Docker o Kubernetes), ese valor manda sobre lo que diga la hoja. Y antes de entregar las llaves, un
**inspector** recorre el panel: si falta una etiqueta obligatoria o dice «temperatura: caliente» donde va un número,
no entrega el apartamento y deja una lista con **todos** los problemas.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    EX[".env.example<br/>(en Git)"] -. "cp" .-> ENV[".env<br/>(NO en Git)"]
    ENV --> DOT["dotenv.config()"]
    REAL["entorno real<br/>(shell, Docker, Kubernetes)"] --> PE["process.env"]
    DOT -- "solo las que faltan<br/>(override: false)" --> PE
    PE --> VAL{"validar()<br/>tipos, obligatorias"}
    VAL -- "válida" --> CFG["config inmutable<br/>(PORT: 3110 número)"]
    VAL -- "inválida" --> FAIL["lista de errores<br/>exit 1"]
    CFG --> APP["resto del servicio"]
```

**Texto alternativo:** `.env.example`, que está en Git, se copia a `.env`, que no está en Git. `dotenv.config()` lee
`.env` y escribe en `process.env` solo las variables que faltan; el entorno real (shell, Docker, Kubernetes) escribe
en `process.env` directamente y por eso gana. `validar()` revisa tipos y obligatorias: si la configuración es válida
produce un objeto inmutable con los valores convertidos que usa el resto del servicio; si es inválida imprime la
lista de errores y el proceso termina con código 1.

#### 6. EXPLICACIÓN NIVEL 0

- Un mismo programa corre en tu portátil, en pruebas y en producción. Lo que cambia entre esos lugares (el puerto, la
  dirección de la base de datos, las claves) es la **configuración**, y no debe estar escrita dentro del código.
- Una **variable de entorno** es un dato con nombre que el sistema operativo le pasa al programa al arrancar:
  `PORT=3110`.
- Escribir diez variables cada vez que arrancas es incómodo. Un archivo **`.env`** es una lista de esas variables,
  una por línea.
- **dotenv** es una librería que, al arrancar, lee `.env` y pone esas variables donde el programa las espera
  (`process.env`).
- El archivo `.env` tiene claves reales: **no se sube a Git**. Lo que se sube es `.env.example`, la plantilla sin
  secretos.

#### 7. EXPLICACIÓN INTERMEDIA

- **API:** `dotenv.config({ path, override, quiet, processEnv })` devuelve `{ parsed }` o `{ error }` (no lanza si el
  archivo no existe). `import 'dotenv/config'` hace lo mismo con los valores por defecto.
- **Precedencia:** con `override: false` (por defecto) dotenv **no pisa** lo que ya existe en `process.env`. Por eso
  `PORT=8080 node main.js` gana al `PORT=3110` del archivo, y por eso en producción el mismo código funciona sin `.env`.
- **Todo es texto:** `process.env.PORT` es `'3110'`, no `3110`, y `process.env.DEBUG = 'false'` es un texto no vacío
  (verdadero en un `if`). Hay que **convertir y validar**; `config.js` lo hace con un esquema mínimo y devuelve un
  objeto congelado (`Object.freeze`).
- **Fail-fast:** si falta `DATABASE_URL`, es mejor no arrancar (y que el orquestador lo vea) que descubrirlo en la
  primera petición. `validar()` junta todos los errores para corregirlos de una vez.
- **Sintaxis del archivo:** `CLAVE=valor`, `#` para comentarios, comillas dobles para espacios y `\n`. Sin `export`.
- **dotenv 17 y 18 imprimen una línea** al cargar (`◇ injected env (6) from .env`); `quiet: true` la quita. En un
  servicio que escribe logs JSON esa línea suelta rompe el formato.
- **Orden de carga:** dotenv debe ejecutarse **antes** de que cualquier módulo lea `process.env` (ver el error común).
- **Node sin dotenv:** `node --env-file=.env main.js` (y `--env-file-if-exists`, y `process.loadEnvFile()`) cargan el
  archivo sin instalar nada. Diferencia que comprobarás: si el archivo no existe, `--env-file` **aborta** con
  `node: .env: not found`.

#### 8. EXPLICACIÓN MAESTRA

- **Alternativas y trade-offs.**
  1. **dotenv**: funciona en cualquier versión de Node y desde código (rutas, varios archivos, `processEnv` para
     tests); es una dependencia más y su orden de carga es una fuente clásica de errores.
  2. **`node --env-file`** (nativo): cero dependencias y se carga antes que cualquier módulo, así que elimina el
     error de orden; depende de cómo se lance el proceso (hay que acordarse del flag en `package.json`, en el
     Dockerfile y en el depurador).
  3. **Nada de archivos**: el orquestador inyecta las variables (`environment:` de Compose, `envFrom` de Kubernetes
     con ConfigMaps y Secrets). Es lo correcto en producción; el `.env` queda solo para tu máquina.
  4. **Validación con esquema**: en un servicio real usa Zod (Módulo 14), `envalid` o `@nestjs/config` con
     `validationSchema` en vez del esquema casero de esta ficha; la idea (convertir, validar, congelar) es la misma.
- **Un `.env` por entorno en el repositorio (`.env.production`) es un error de diseño:** mezcla código y despliegue, y
  acaba con secretos en Git. El factor III de 12-Factor pide que la configuración viva en el entorno, no en archivos
  agrupados por «entorno».
- **Los secretos en variables de entorno** se filtran con facilidad (volcados de `process.env` en un error, `docker
  inspect`, procesos hijos que las heredan). Para secretos de verdad: un gestor (Vault, AWS Secrets Manager; Módulo
  20) que los entrega como archivo montado o por API, con rotación.
- **dotenv no recarga:** cambia el archivo y tienes que reiniciar. Si necesitas cambiar valores sin reiniciar, eso es
  configuración centralizada (ficha 4).
- **Cuándo NO usar dotenv:** en la imagen de producción (el `.env` no se copia a la imagen; añádelo a `.dockerignore`),
  en librerías (una librería no debe leer archivos de entorno por su cuenta) y cuando tu plataforma ya inyecta todo.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** y **dotenv 18.0.10** (dependencia del `package.json` del laboratorio).

`f110-dotenv/.env.example` (se copia a `.env`, que está en `.gitignore`):

```bash
# Plantilla de configuración LOCAL. Cópiala a .env (que NO se sube a Git) y pon tus valores.
# En producción no hay archivo .env: la plataforma (Docker, Kubernetes) inyecta las variables.
PORT=3110
NODE_ENV=development
DATABASE_URL=postgres://pedidos:cambia-esta-clave@localhost:5432/pedidos
PAGOS_URL=http://localhost:3200
PAGOS_TIMEOUT_MS=2000
# Las comillas dobles permiten espacios y saltos de línea (\n)
MENSAJE_BIENVENIDA="Hola desde pedidos"
```

`f110-dotenv/config.js`:

```javascript
// Módulo 17 · F110 · dotenv: configuración por variables de entorno, validada al arrancar.
// Requisitos: Node.js 26.13.1 LTS y dotenv 18.0.10 (package.json del laboratorio).
import dotenv from 'dotenv';
import { join } from 'node:path';

// Esquema mínimo: qué variables existen, de qué tipo son y cuáles son obligatorias.
const ESQUEMA = {
  PORT: { tipo: 'entero', porDefecto: 3110 },
  NODE_ENV: { tipo: 'texto', porDefecto: 'development', opciones: ['development', 'test', 'production'] },
  DATABASE_URL: { tipo: 'url', secreto: true }, // sin porDefecto = obligatoria
  PAGOS_URL: { tipo: 'url' },
  PAGOS_TIMEOUT_MS: { tipo: 'entero', porDefecto: 2000 },
  MENSAJE_BIENVENIDA: { tipo: 'texto', porDefecto: 'Hola' },
};

function convertir(nombre, valor, regla) {
  if (regla.tipo === 'entero') {
    if (!/^\d+$/.test(valor)) throw new Error(`${nombre} debe ser un entero y llegó "${valor}"`);
    return Number(valor);
  }
  if (regla.tipo === 'url') {
    if (!URL.canParse(valor)) throw new Error(`${nombre} debe ser una URL y llegó "${valor}"`);
    return valor;
  }
  if (regla.opciones && !regla.opciones.includes(valor)) {
    throw new Error(`${nombre} debe ser uno de ${regla.opciones.join(', ')} y llegó "${valor}"`);
  }
  return valor;
}

// Valida un objeto de entorno y devuelve la configuración tipada e inmutable. Reúne TODOS los errores
// para mostrarlos de una vez (fail-fast: mejor no arrancar que arrancar mal configurado).
export function validar(env) {
  const config = {};
  const errores = [];
  for (const [nombre, regla] of Object.entries(ESQUEMA)) {
    const valor = env[nombre];
    if (valor === undefined || valor === '') {
      if ('porDefecto' in regla) config[nombre] = regla.porDefecto;
      else errores.push(`${nombre} es obligatoria y no está definida`);
      continue;
    }
    try {
      config[nombre] = convertir(nombre, valor, regla);
    } catch (error) {
      errores.push(error.message);
    }
  }
  if (errores.length > 0) throw new Error(`Configuración inválida:\n  - ${errores.join('\n  - ')}`);
  return Object.freeze(config);
}

// Carga .env (si existe) dentro de `env` SIN pisar lo que ya esté definido, y valida.
export function cargarConfig({ carpeta = import.meta.dirname, env = process.env } = {}) {
  // override:false (por defecto) → una variable real del entorno le gana al archivo .env.
  // quiet:true → dotenv no imprime su línea «injected env (N) from .env».
  const resultado = dotenv.config({ path: join(carpeta, '.env'), processEnv: env, quiet: true });
  const origen = resultado.error ? 'solo entorno (no hay .env)' : '.env + entorno';
  return { config: validar(env), origen };
}

// Para los logs: nunca imprimas un secreto.
export function sinSecretos(config) {
  return Object.fromEntries(
    Object.entries(config).map(([k, v]) => [k, ESQUEMA[k]?.secreto ? '***' : v]),
  );
}
```

`f110-dotenv/main.js`:

```javascript
// Módulo 17 · F110 · Arranque: carga la configuración UNA vez, antes que cualquier otra cosa.
// Ejecuta: node f110-dotenv/main.js
import { cargarConfig, sinSecretos } from './config.js';

let cargada;
try {
  cargada = cargarConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1); // fail-fast: el orquestador verá que el contenedor no arranca
}
console.log(`Origen: ${cargada.origen}`);
console.log(JSON.stringify(sinSecretos(cargada.config), null, 2));
```

#### 10. MINI-LABORATORIO

1. Arranca **sin** `.env`: el servicio debe negarse a arrancar.
   ```bash
   node f110-dotenv/main.js ; echo "código de salida: $?"
   ```
2. Crea tu `.env` desde la plantilla y arranca de nuevo:
   ```bash
   cp f110-dotenv/.env.example f110-dotenv/.env
   node f110-dotenv/main.js
   git status --short f110-dotenv/     # .env no aparece: está ignorado
   ```
3. Comprueba la precedencia: una variable real le gana al archivo.
   ```bash
   PORT=8080 node f110-dotenv/main.js | head -3
   ```
4. Rompe un valor y mira el fallo; después compara con el cargador nativo de Node:
   ```bash
   PAGOS_TIMEOUT_MS=dos-segundos node f110-dotenv/main.js
   node --env-file=f110-dotenv/.env -e 'console.log(process.env.PORT, process.env.MENSAJE_BIENVENIDA)'
   node --env-file=no-existe.env -e '1' ; echo "código de salida: $?"
   ```

**Output esperado** (paso 1, salida real):

```text
Configuración inválida:
  - DATABASE_URL es obligatoria y no está definida
  - PAGOS_URL es obligatoria y no está definida
código de salida: 1
```

**Output esperado** (paso 2; `git status` no imprime nada):

```text
Origen: .env + entorno
{
  "PORT": 3110,
  "NODE_ENV": "development",
  "DATABASE_URL": "***",
  "PAGOS_URL": "http://localhost:3200",
  "PAGOS_TIMEOUT_MS": 2000,
  "MENSAJE_BIENVENIDA": "Hola desde pedidos"
}
```

**Output esperado** (paso 3):

```text
Origen: .env + entorno
{
  "PORT": 8080,
```

**Output esperado** (paso 4, salida real con Node.js 26.13.1):

```text
Configuración inválida:
  - PAGOS_TIMEOUT_MS debe ser un entero y llegó "dos-segundos"
3110 Hola desde pedidos
node: no-existe.env: not found
código de salida: 9
```

**Captura comentada:** `PORT` sale sin comillas (es un número: lo convirtió `validar()`), `DATABASE_URL` sale como
`***` (`sinSecretos()`), y `MENSAJE_BIENVENIDA` perdió las comillas del archivo. En el paso 3 el `8080` de la terminal
ganó al `3110` del archivo sin cambiar código. El código de salida 9 del último comando es de Node («argumento
inválido»): el archivo de `--env-file` es obligatorio; con dotenv, en cambio, la falta del archivo no es un error y
quien decide es tu validación.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec f110-dotenv/config.test.js
```

Salida real:

```text
✔ carga .env, convierte tipos y aplica valores por defecto (3.254936ms)
✔ una variable del entorno real le gana al archivo .env (1.183948ms)
✔ sin archivo .env funciona solo con el entorno (así corre en producción) (0.978277ms)
✔ falla al arrancar con TODOS los errores juntos (1.381429ms)
✔ la configuración es inmutable y los secretos no llegan al log (0.910484ms)
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

`f110-dotenv/config.test.js` (cada test escribe su propio `.env` en una carpeta temporal y pasa un entorno aislado
con `processEnv`, así no depende de tu `.env` ni de tu shell):

```javascript
// Módulo 17 · F110 · Ejecuta: node --test f110-dotenv/config.test.js
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { cargarConfig, sinSecretos, validar } from './config.js';

let carpeta;
beforeEach(() => { carpeta = mkdtempSync(join(tmpdir(), 'dotenv-')); });
afterEach(() => rmSync(carpeta, { recursive: true, force: true }));

const ENV_VALIDO = 'PORT=4000\nDATABASE_URL=postgres://u:secreto@db:5432/pedidos\nPAGOS_URL=http://pagos:3200\nMENSAJE_BIENVENIDA="Hola desde el archivo"\n';

test('carga .env, convierte tipos y aplica valores por defecto', () => {
  writeFileSync(join(carpeta, '.env'), ENV_VALIDO);
  const { config, origen } = cargarConfig({ carpeta, env: {} });
  assert.equal(origen, '.env + entorno');
  assert.deepEqual(config, {
    PORT: 4000, // número, no texto
    NODE_ENV: 'development', // por defecto
    DATABASE_URL: 'postgres://u:secreto@db:5432/pedidos',
    PAGOS_URL: 'http://pagos:3200',
    PAGOS_TIMEOUT_MS: 2000, // por defecto
    MENSAJE_BIENVENIDA: 'Hola desde el archivo', // sin las comillas
  });
});

test('una variable del entorno real le gana al archivo .env', () => {
  writeFileSync(join(carpeta, '.env'), ENV_VALIDO);
  const { config } = cargarConfig({ carpeta, env: { PORT: '9999' } });
  assert.equal(config.PORT, 9999);
});

test('sin archivo .env funciona solo con el entorno (así corre en producción)', () => {
  const { config, origen } = cargarConfig({ carpeta, env: { DATABASE_URL: 'postgres://a:b@c/d', PAGOS_URL: 'http://pagos' } });
  assert.equal(origen, 'solo entorno (no hay .env)');
  assert.equal(config.PORT, 3110);
});

test('falla al arrancar con TODOS los errores juntos', () => {
  assert.throws(() => validar({ PORT: 'tres mil', NODE_ENV: 'prod', PAGOS_URL: 'pagos sin esquema' }), {
    message: 'Configuración inválida:\n  - PORT debe ser un entero y llegó "tres mil"\n  - NODE_ENV debe ser uno de development, test, production y llegó "prod"\n  - DATABASE_URL es obligatoria y no está definida\n  - PAGOS_URL debe ser una URL y llegó "pagos sin esquema"',
  });
});

test('la configuración es inmutable y los secretos no llegan al log', () => {
  const config = validar({ DATABASE_URL: 'postgres://u:secreto@db/p', PAGOS_URL: 'http://pagos' });
  assert.throws(() => { config.PORT = 1; }, TypeError);
  assert.equal(sinSecretos(config).DATABASE_URL, '***');
  assert.ok(!JSON.stringify(sinSecretos(config)).includes('secreto'));
});
```

**Pregunta de comprobación:** en producción defines `PORT=80` en Kubernetes y alguien copió por error un `.env` con
`PORT=3110` dentro de la imagen. ¿En qué puerto escucha el servicio y por qué? (Respuesta: en el 80. dotenv, con
`override: false`, no pisa una variable que ya existe en el entorno. Con `override: true` escucharía en el 3110: por
eso no se activa.)

#### 12. ERROR COMÚN

**Síntoma:** «en mi `.env` está la variable, pero el código ve `undefined`». Casi siempre un módulo leyó
`process.env` **antes** de que dotenv se ejecutara. En módulos ES, todos los `import` se evalúan antes que el cuerpo
del archivo que los importa. `f110-dotenv/cliente-pagos.js`:

```javascript
// Lee la variable EN EL MOMENTO DE IMPORTARSE (nivel superior del módulo): ahí está el problema.
export const urlDePagos = process.env.PAGOS_URL;
```

`f110-dotenv/error-comun.js`:

```javascript
// Módulo 17 · F110 · ERROR COMÚN: leer process.env ANTES de que dotenv cargue el archivo.
// Ejecuta: node f110-dotenv/error-comun.js   (con f110-dotenv/.env creado)
// En módulos ES todos los `import` se evalúan antes que el cuerpo del archivo: cliente-pagos.js lee
// process.env.PAGOS_URL al importarse, cuando dotenv.config() todavía no se ha ejecutado.
import dotenv from 'dotenv';
import { join } from 'node:path';
import { urlDePagos } from './cliente-pagos.js';

dotenv.config({ path: join(import.meta.dirname, '.env'), quiet: true });

console.log('PAGOS_URL al importar el cliente:', urlDePagos);
console.log('PAGOS_URL después de dotenv.config():', process.env.PAGOS_URL);
new URL('/cobros', urlDePagos); // TypeError: Invalid URL
```

**Cómo se ve** (`node f110-dotenv/error-comun.js`, salida real con Node.js 26.13.1; la ruta recortada con `…`):

```text
PAGOS_URL al importar el cliente: undefined
PAGOS_URL después de dotenv.config(): http://localhost:3200
node:internal/url:911
      href = bindingUrl.parse(input, base, true);
                        ^

TypeError: Invalid URL
    at new URL (node:internal/url:911:25)
    at file:///…/f110-dotenv/error-comun.js:13:1
    at ModuleJob.run (node:internal/modules/esm/module_job:569:25)
    at async node:internal/modules/esm/loader:650:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:105:5) {
  code: 'ERR_INVALID_URL',
  input: '/cobros'
}
```

**Diagnóstico visual:** las dos primeras líneas lo cuentan todo: el mismo proceso ve `undefined` y, un instante
después, el valor correcto. El `input: '/cobros'` del error muestra que la base llegó vacía. **Arreglo** (cualquiera
de los tres): (1) ningún módulo lee `process.env` al importarse: reciben la configuración por parámetro desde
`config.js`, como en la ficha 1; (2) carga dotenv antes que todo con `node --import dotenv/config main.js`; (3) usa
`node --env-file=.env`, que carga el archivo antes de evaluar cualquier módulo.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cómo gestionas la configuración de un servicio Node entre tu máquina, pruebas y producción?»

**Respuesta modelo:** la configuración vive en variables de entorno, no en el código (factor III de 12-Factor). En
desarrollo las cargo desde un `.env` local con dotenv o con `--env-file`; ese archivo está en `.gitignore` y el
repositorio trae un `.env.example` como documentación. En producción no hay archivo: las inyecta la plataforma, y como
dotenv no pisa lo que ya existe, el mismo código funciona en los dos sitios. Un único módulo lee `process.env`, lo
convierte a tipos, lo valida contra un esquema y falla al arrancar con todos los errores; el resto del código recibe
un objeto inmutable. Los secretos no van en el `.env` compartido ni en la imagen: vienen de un gestor de secretos, y
nunca se imprimen en logs.

#### 14. ANTI-PATRÓN RELACIONADO

**El `.env` en Git y `process.env` repartido por todo el código:**

```javascript
// ❌ .env subido al repositorio «para que funcione al clonar» (con la clave real de producción)
// DATABASE_URL=postgres://admin:Pr0d-2026!@db.interna:5432/pedidos

// ❌ src/modules/pagos/cobrar.js — cada archivo lee, convierte y pone su propio valor por defecto
const timeout = parseInt(process.env.PAGOS_TIMEOUT) || 3000;   // ¿era PAGOS_TIMEOUT o PAGOS_TIMEOUT_MS?
if (process.env.ENVIO_GRATIS) { /* 'false' es un texto no vacío: esto SIEMPRE se ejecuta */ }
```

Se ve así: `git log -p -- .env` muestra las claves a cualquiera con acceso al repositorio (y borrar el archivo no las
borra del historial: hay que rotarlas); una variable mal escrita no falla, usa el valor por defecto en silencio; y
nadie sabe qué variables necesita el servicio sin buscar `process.env` en todo el código.

---

### Service Discovery con Consul

#### 1. UBICACIÓN

Módulo 17, Lección 3 de 4 · Fase 2
`docker-compose.yml`).

#### 2. PRERREQUISITOS

- Un servicio HTTP en Node con apagado ordenado ante `SIGTERM` (Módulo 13) y un cliente `fetch` con timeout.
- Docker Compose (Módulo 0.5) y variables de entorno (ficha anterior).

#### 3. OBJETIVO DE APRENDIZAJE

**Implementar** el auto-registro de un servicio Node en Consul con un check TTL, **descubrir** sus instancias sanas
desde un cliente y **repartir** las llamadas por turnos, incluida la baja ordenada y la caída sin aviso; lo
compruebas cuando `node --test f111-consul/descubrimiento.test.js` pasa 4 de 4 y el cliente deja de recibir a la
instancia que mataste.

#### 4. ANALOGÍA VISUAL

Dibuja la **recepción de un hospital grande**. En la pared hay un **tablero electrónico** con filas: «Pediatría —
consultorio 204 — Dra. Ruiz — ● verde», «Pediatría — consultorio 311 — Dr. Mora — ● verde». Cada médico, al llegar,
pasa por recepción y **se anota** en el tablero (registro). Mientras atiende, **pulsa un botón cada pocos minutos**
que dice «sigo aquí» (latido TTL); si deja de pulsarlo, su luz pasa a **rojo** y, tras un rato en rojo, la fila
**desaparece**. Al terminar el turno, el médico avisa en recepción y su fila se borra en el acto (baja ordenada). Un
paciente que llega **no sabe** en qué consultorio está Pediatría hoy: pregunta en recepción «¿quién atiende
Pediatría?» y recibe solo las filas en verde (descubrimiento); si hay dos, recepción las alterna para no llenar una
sola sala (balanceo). Dibuja también al paciente con una **nota en el bolsillo** con lo que le dijeron hace un
minuto: si la recepción cierra un momento, usa la nota (caché).

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant A as catalogo-3111
    participant B as catalogo-3112
    participant C as Consul (8500)
    participant P as cliente (pedidos)
    A->>C: PUT /v1/agent/service/register (check TTL 3s)
    B->>C: PUT /v1/agent/service/register (check TTL 3s)
    loop cada 1 s
        A->>C: PUT /v1/agent/check/pass/service:catalogo-3111
        B->>C: PUT /v1/agent/check/pass/service:catalogo-3112
    end
    P->>C: GET /v1/health/service/catalogo?passing=true
    C-->>P: [3111, 3112]
    P->>A: GET /productos/1
    P->>B: GET /productos/1
    Note over A: kill -9 (deja de latir)
    Note over C: 3 s sin latido → critical
    P->>C: GET /v1/health/service/catalogo?passing=true
    C-->>P: [3112]
    B->>C: PUT /v1/agent/service/deregister/catalogo-3112 (SIGTERM)
```

**Texto alternativo:** diagrama de secuencia. Las instancias catalogo-3111 y catalogo-3112 se registran en Consul con
un check TTL de 3 segundos y cada segundo envían un latido «pass». El cliente pregunta a Consul por las instancias
sanas de «catalogo», recibe las dos y alterna sus peticiones entre ellas. La instancia 3111 muere con kill -9 y deja
de latir; a los 3 segundos sin latido Consul la marca como critical. El cliente vuelve a preguntar y recibe solo la
3112. Al recibir SIGTERM, la 3112 se da de baja con deregister.

#### 6. EXPLICACIÓN NIVEL 0

- En tu máquina, el servicio B está en `localhost:3111`. En producción hay varias copias de B, en máquinas que
  cambian: se crean más cuando hay carga, se reemplazan en cada despliegue, mueren. **Su dirección no es fija.**
- **Service Discovery** («descubrimiento de servicios») es el mecanismo para que un servicio encuentre a otro **por
  su nombre** («catalogo») en vez de por una dirección escrita a mano.
- Funciona con un **registro**: una libreta central donde cada copia se apunta al arrancar («soy catalogo, estoy en
  10.0.3.7:3111») y de la que se borra al apagarse.
- El registro también vigila la **salud**: si una copia deja de dar señales de vida, deja de recomendarla.
- **Consul** es un programa de HashiCorp que hace de registro (y más cosas: también guarda configuración, ficha 4).

#### 7. EXPLICACIÓN INTERMEDIA

- **Tres operaciones:** *registrar* (`PUT /v1/agent/service/register` con nombre, id único, dirección, puerto y un
  check), *consultar* (`GET /v1/health/service/<nombre>?passing=true` devuelve solo instancias con todos sus checks
  en `passing`) y *dar de baja* (`PUT /v1/agent/service/deregister/<id>`).
- **Nombre vs id:** `name` es lo que buscan los clientes (`catalogo`); `id` identifica **una** instancia
  (`catalogo-3111`). Dos instancias con el mismo id se pisan.
- **Health checks.** Consul puede llamarte él (check HTTP, TCP o gRPC cada N segundos) o puedes avisarle tú (check
  **TTL**: prometes un latido antes de que venza el plazo con `PUT /v1/agent/check/pass/service:<id>`). Un check recién
  registrado empieza en `critical` hasta el primer resultado: por eso `registro.js` envía un latido enseguida.
- **`DeregisterCriticalServiceAfter`:** si la instancia pasa ese tiempo en `critical`, Consul la borra del catálogo.
  El mínimo es 1 minuto y el proceso que limpia corre cada 30 segundos.
- **Orden al arrancar y al apagar:** escucha primero y regístrate después; date de baja primero y cierra después.
  Al revés, los clientes descubren una instancia que todavía no atiende o que ya cerró.
- **Descubrimiento del lado del cliente:** el cliente pide la lista y **él** elige (aquí, round-robin). Una caché
  corta evita preguntar a Consul en cada petición y permite seguir si Consul no responde.
- **El cliente npm `consul`** (2.0.1) envuelve la API HTTP: `consul.agent.service.register()`,
  `consul.agent.check.pass()`, `consul.health.service()`. La dirección del agente sale de `CONSUL_HTTP_ADDR`.
- **Ventana de inconsistencia:** entre que una instancia muere y vence su TTL (3 s aquí), Consul la sigue ofreciendo.
  El cliente **necesita** timeouts y reintentos contra otra instancia (Módulo 19).

#### 8. EXPLICACIÓN MAESTRA

- **Alternativas y trade-offs.**
  1. **Registro + descubrimiento del lado del cliente** (Consul o Eureka con librería en cada servicio): el cliente
     balancea con información fresca y sin salto de red extra; a cambio, cada lenguaje necesita su librería y la
     lógica de caché, reintentos y balanceo vive en tu código.
  2. **Descubrimiento del lado del servidor / DNS de plataforma** (un `Service` de Kubernetes: `http://catalogo`
     resuelve a una IP virtual y kube-proxy reparte): el código no sabe nada de registros. Es lo habitual hoy; pierdes
     control fino del balanceo (las conexiones HTTP/2 y gRPC de larga vida se quedan pegadas a un pod).
  3. **Service mesh** (Istio, Linkerd, Consul Connect; Módulo 27): un proxy junto a cada servicio descubre, balancea,
     reintenta y cifra con mTLS. Máxima funcionalidad sin tocar código, con el costo operativo más alto.
  4. **DNS de Consul** (`catalogo.service.consul` en el puerto 8600): descubrimiento sin librería; dependes de los TTL
     del DNS y de que el cliente HTTP no guarde la resolución para siempre.
- **Check TTL vs check HTTP.** TTL no requiere que Consul alcance al servicio por red (útil tras NAT, en tu portátil
  con Consul en Docker, o en trabajos sin puerto), pero solo prueba que el **bucle de latidos** vive: si el servidor
  HTTP se bloqueó y el temporizador sigue, mientes. Un check HTTP a `/salud` prueba el camino real. En producción el
  latido debería reflejar la salud real (por ejemplo, llamar a `check.fail` si la base de datos no responde).
- **Auto-registro vs registro por un tercero.** Aquí el servicio se registra solo (simple, pero acopla el código a
  Consul). La alternativa es que lo registre la plataforma (Nomad, el *sync catalog* de Consul con Kubernetes, o un
  agente Consul local con un archivo de definición), y el servicio queda limpio.
- **Consul es un sistema de consenso (Raft):** 3 o 5 servidores; si pierde quórum no acepta registros. Por eso el
  cliente debe degradar bien (la caché de `descubrir.js`) y nunca tratar al registro como siempre disponible.
- **Cuándo NO usar Consul para descubrir:** si despliegas en Kubernetes y no sales del clúster, su DNS ya resuelve el
  problema y añadir Consul es duplicar; con dos servicios y direcciones fijas, una variable de entorno con la URL es
  suficiente. Consul compensa con cargas mixtas (máquinas virtuales + contenedores, varios centros de datos).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **consul 2.0.1** (cliente npm) y **HashiCorp Consul 2.1.0** (imagen
`hashicorp/consul:2.1.0` del `docker-compose.yml` que está al inicio del módulo, junto con `comun/consul.js`).

`f111-consul/registro.js`:

```javascript
// Módulo 17 · F111 · Service Discovery con Consul: AUTO-REGISTRO de una instancia con check TTL.
// Requisitos: Node.js 26.13.1 LTS, consul 2.0.1 (npm) y un agente Consul 2.1.0.

// Registra la instancia y empieza a enviar latidos. Devuelve cómo darla de baja y cómo dejar de latir.
export async function registrar(consul, { nombre, id, direccion, puerto, ttlSegundos = 3, meta = {} }) {
  await consul.agent.service.register({
    name: nombre, // nombre lógico: lo que buscan los clientes («catalogo»)
    id, // identificador ÚNICO de esta instancia («catalogo-3111»)
    address: direccion,
    port: puerto,
    meta,
    check: {
      // Check TTL: la instancia promete avisar «sigo viva» antes de que venza el plazo.
      // Si deja de hacerlo (se colgó, murió, perdió la red), Consul la marca «critical».
      ttl: `${ttlSegundos}s`,
      // Y si pasa 1 minuto en critical, Consul la borra sola del catálogo.
      deregistercriticalserviceafter: '1m',
    },
  });
  const idCheck = `service:${id}`; // Consul nombra así el check declarado dentro de un servicio
  const latido = () => consul.agent.check.pass(idCheck).catch((e) => console.error(`latido fallido: ${e.message}`));
  await latido(); // primer latido: pasa de critical a passing
  const intervalo = setInterval(latido, (ttlSegundos * 1000) / 3); // 3 latidos por plazo: tolera perder 2
  intervalo.unref();

  return {
    detenerLatidos: () => clearInterval(intervalo),
    async darDeBaja() {
      clearInterval(intervalo);
      await consul.agent.service.deregister(id); // baja voluntaria: desaparece al instante
    },
  };
}
```

`f111-consul/descubrir.js`:

```javascript
// Módulo 17 · F111 · Service Discovery con Consul: DESCUBRIMIENTO del lado del cliente + balanceo round-robin.
// Requisitos: Node.js 26.13.1 LTS y consul 2.0.1 (npm).

export class SinInstancias extends Error {
  constructor(nombre) {
    super(`No hay instancias sanas de "${nombre}" en Consul`);
    this.name = 'SinInstancias';
  }
}

// Devuelve las instancias SANAS (todos sus checks en passing) de un servicio.
export async function instanciasSanas(consul, nombre) {
  const entradas = await consul.health.service({ service: nombre, passing: true });
  return entradas.map(({ Service, Node }) => ({
    id: Service.ID,
    // Si el servicio no declaró dirección, vale la del nodo donde corre el agente.
    url: `http://${Service.Address || Node.Address}:${Service.Port}`,
  }));
}

// Localizador con caché corta: no pregunta a Consul en cada petición y sobrevive unos segundos sin él.
export function crearLocalizador(consul, { cacheMs = 1000 } = {}) {
  const cache = new Map(); // nombre → { instancias, hasta }
  const turno = new Map(); // nombre → contador para el round-robin

  async function instancias(nombre) {
    const guardado = cache.get(nombre);
    if (guardado && Date.now() < guardado.hasta) return guardado.instancias;
    try {
      const frescas = await instanciasSanas(consul, nombre);
      cache.set(nombre, { instancias: frescas, hasta: Date.now() + cacheMs });
      return frescas;
    } catch (error) {
      if (guardado) return guardado.instancias; // Consul caído: sirve la última lista conocida
      throw error;
    }
  }

  return {
    // Elige la siguiente instancia por turnos (round-robin).
    async siguiente(nombre) {
      const lista = await instancias(nombre);
      if (lista.length === 0) throw new SinInstancias(nombre);
      const n = turno.get(nombre) ?? 0;
      turno.set(nombre, n + 1);
      return lista[n % lista.length];
    },
    olvidar: (nombre) => cache.delete(nombre),
  };
}
```

`f111-consul/servicio-catalogo.js`:

```javascript
// Módulo 17 · F111 · Una instancia del servicio «catalogo» que se registra sola en Consul.
// Ejecuta (dos terminales): PORT=3111 node f111-consul/servicio-catalogo.js   y   PORT=3112 node f111-consul/servicio-catalogo.js
import { createServer } from 'node:http';
import { clienteConsul } from '../comun/consul.js';
import { registrar } from './registro.js';

export async function iniciarCatalogo({ consul, puerto = 0, direccion = '127.0.0.1', ttlSegundos = 3 }) {
  let id = '';
  const servidor = createServer((req, res) => {
    if (req.url === '/productos/1') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ id: 1, nombre: 'Teclado', atendidoPor: id }));
    }
    res.writeHead(404).end();
  });
  await new Promise((ok) => servidor.listen(puerto, ok));
  const puertoReal = servidor.address().port;
  id = `catalogo-${puertoReal}`;
  // Se registra DESPUÉS de escuchar: nadie debe descubrir una instancia que aún no atiende.
  const registro = await registrar(consul, { nombre: 'catalogo', id, direccion, puerto: puertoReal, ttlSegundos });
  return {
    id,
    puerto: puertoReal,
    // Apagado ordenado: primero se da de baja (deja de recibir tráfico nuevo) y después cierra.
    async detener() {
      await registro.darDeBaja();
      await new Promise((ok) => servidor.close(ok));
    },
    // Simula una caída brusca (kill -9): cierra sin avisar a Consul y deja de latir.
    async morir() {
      registro.detenerLatidos();
      servidor.closeAllConnections();
      await new Promise((ok) => servidor.close(ok));
    },
  };
}

if (import.meta.main) {
  const instancia = await iniciarCatalogo({ consul: clienteConsul(), puerto: Number(process.env.PORT ?? 3111) });
  console.log(`${instancia.id} registrado en Consul y escuchando en :${instancia.puerto}`);
  for (const senal of ['SIGINT', 'SIGTERM']) {
    process.on(senal, async () => {
      await instancia.detener();
      console.log(`${instancia.id} dado de baja`);
      process.exit(0);
    });
  }
}
```

`f111-consul/cliente.js`:

```javascript
// Módulo 17 · F111 · Cliente que NO conoce direcciones: pregunta a Consul por «catalogo» y reparte por turnos.
// Ejecuta: node f111-consul/cliente.js
import { clienteConsul } from '../comun/consul.js';
import { crearLocalizador } from './descubrir.js';

const localizador = crearLocalizador(clienteConsul());
for (let i = 1; i <= 4; i++) {
  const { url } = await localizador.siguiente('catalogo');
  const producto = await (await fetch(`${url}/productos/1`, { signal: AbortSignal.timeout(2000) })).json();
  console.log(`petición ${i} → ${url} → atendida por ${producto.atendidoPor}`);
}
```

#### 10. MINI-LABORATORIO

1. Levanta Consul con Docker Compose y abre su interfaz en `http://localhost:8500`:
   ```bash
   docker compose up -d --wait
   ```
2. Arranca **dos** instancias de catálogo, cada una en su terminal:
   ```bash
   PORT=3111 node f111-consul/servicio-catalogo.js     # terminal 1
   PORT=3112 node f111-consul/servicio-catalogo.js     # terminal 2
   ```
3. En una tercera terminal, mira el registro y lanza el cliente:
   ```bash
   curl -s 'localhost:8500/v1/health/service/catalogo?passing=true' | jq -c '.[] | {id: .Service.ID, puerto: .Service.Port, checks: ([.Checks[].Status] | unique)}'
   node f111-consul/cliente.js
   ```
4. **Rompe el sistema a propósito:** mata la instancia 3111 sin dejarla despedirse y lanza el cliente enseguida; espera
   5 segundos y lánzalo otra vez:
   ```bash
   kill -9 "$(lsof -ti tcp:3111 -sTCP:LISTEN)"
   node f111-consul/cliente.js
   sleep 5; node f111-consul/cliente.js
   ```
5. Apaga la 3112 con Ctrl+C (baja ordenada), lanza el cliente una última vez y apaga Consul:
   ```bash
   node f111-consul/cliente.js
   docker compose down -v
   ```

**Output esperado** (paso 2, una línea en cada terminal; salida real en macOS con Consul 2.1.0):

```text
catalogo-3111 registrado en Consul y escuchando en :3111
catalogo-3112 registrado en Consul y escuchando en :3112
```

**Output esperado** (paso 3; Consul puede devolver las instancias en el otro orden, y entonces el reparto empieza por
la 3112). Las cuatro líneas de `cliente.js` son la salida real contra Consul 2.1.0; las dos de `jq` muestran la forma
que tiene cada elemento:

```text
{"id":"catalogo-3111","puerto":3111,"checks":["passing"]}
{"id":"catalogo-3112","puerto":3112,"checks":["passing"]}
petición 1 → http://127.0.0.1:3111 → atendida por catalogo-3111
petición 2 → http://127.0.0.1:3112 → atendida por catalogo-3112
petición 3 → http://127.0.0.1:3111 → atendida por catalogo-3111
petición 4 → http://127.0.0.1:3112 → atendida por catalogo-3112
```

**Output esperado** (paso 4: primero el fallo dentro de la ventana del TTL, recortado y obtenido en Linux; después,
solo la 3112, salida real contra Consul 2.1.0):

```text
[TypeError: fetch failed] {
  [cause]: Error: connect ECONNREFUSED 127.0.0.1:3111
      at TCPConnectWrap.afterConnect [as oncomplete] (node:net:2083:16) {
    errno: -111,
    code: 'ECONNREFUSED',
    syscall: 'connect',
    address: '127.0.0.1',
    port: 3111
  }
petición 1 → http://127.0.0.1:3112 → atendida por catalogo-3112
petición 2 → http://127.0.0.1:3112 → atendida por catalogo-3112
petición 3 → http://127.0.0.1:3112 → atendida por catalogo-3112
petición 4 → http://127.0.0.1:3112 → atendida por catalogo-3112
```

**Output esperado** (paso 5: la terminal 2 imprime `catalogo-3112 dado de baja` y el cliente falla con un error propio;
salida real, recortada a la línea del error):

```text
SinInstancias: No hay instancias sanas de "catalogo" en Consul
```

**Captura comentada:** el log del agente (`docker compose logs consul`) cuenta lo que pasó. En la corrida real del Mac
(Consul 2.1.0) la 3111 pasó a `passing` a las 04:33:49.941; el `kill -9` llegó antes de su siguiente latido y,
justo 3 segundos (el TTL) después, Consul escribió:

```text
2026-11-20T04:33:52.941Z [WARN]  agent: Check missed TTL, is now critical: check=service:catalogo-3111
```

Desde ese momento `?passing=true` ya no la devuelve. La instancia sigue en el catálogo, en estado `critical`, hasta que
se cumple `deregistercriticalserviceafter: '1m'`; la documentación de la API de checks de Consul avisa de que el
proceso que borra servicios críticos corre cada 30 segundos, así que puede tardar algo más del minuto. En la interfaz
web (`http://localhost:8500`) la verás en rojo durante ese tiempo. El `ECONNREFUSED` del paso 4 es la **ventana de
inconsistencia**: Consul todavía creía viva a la 3111 (si el turno cae en la 3112, la primera petición sale bien y
falla la segunda). La baja con Ctrl+C, en cambio, es instantánea: por eso el apagado ordenado importa. En macOS,
`errno` es `-61` en lugar de `-111`.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec f111-consul/descubrimiento.test.js               # con el doble en memoria
CONSUL_REAL=1 node --test --test-reporter=spec f111-consul/descubrimiento.test.js # contra el Consul de Docker
```

Salida real (con el doble en memoria):

```text
✔ dos instancias se registran y el cliente reparte las peticiones por turnos (57.366994ms)
✔ la baja voluntaria saca a la instancia del catálogo al instante (6.268847ms)
✔ una instancia que muere sin avisar deja de estar sana cuando vence su TTL (2507.218673ms)
✔ con Consul caído el localizador sirve la última lista conocida (5.833584ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

Salida real de la segunda orden (macOS, Consul 2.1.0 en Docker; los milisegundos cambian):

```text
✔ dos instancias se registran y el cliente reparte las peticiones por turnos (28.293875ms)
✔ la baja voluntaria saca a la instancia del catálogo al instante (5.040833ms)
✔ una instancia que muere sin avisar deja de estar sana cuando vence su TTL (2510.800083ms)
✔ con Consul caído el localizador sirve la última lista conocida (9.818833ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

`f111-consul/descubrimiento.test.js`:

```javascript
// Módulo 17 · F111 · Ejecuta: node --test f111-consul/descubrimiento.test.js
// Por defecto usa el doble en memoria (comun/consul-de-prueba.js). Contra el Consul real:
//   docker compose up -d --wait && CONSUL_REAL=1 node --test f111-consul/descubrimiento.test.js
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { setTimeout as dormir } from 'node:timers/promises';
import { consulParaTests } from '../comun/consul.js';
import { crearLocalizador, instanciasSanas, SinInstancias } from './descubrir.js';
import { iniciarCatalogo } from './servicio-catalogo.js';

let entorno;
before(async () => { entorno = await consulParaTests(); });
after(async () => { await entorno.detener(); });

test('dos instancias se registran y el cliente reparte las peticiones por turnos', async () => {
  const a = await iniciarCatalogo({ consul: entorno.consul });
  const b = await iniciarCatalogo({ consul: entorno.consul });
  try {
    const sanas = await instanciasSanas(entorno.consul, 'catalogo');
    assert.deepEqual(sanas.map((i) => i.id).sort(), [a.id, b.id].sort());

    const localizador = crearLocalizador(entorno.consul);
    const atendidas = [];
    for (let i = 0; i < 4; i++) {
      const { url } = await localizador.siguiente('catalogo');
      atendidas.push((await (await fetch(`${url}/productos/1`)).json()).atendidoPor);
    }
    assert.equal(atendidas.filter((id) => id === a.id).length, 2);
    assert.equal(atendidas.filter((id) => id === b.id).length, 2);
  } finally {
    await a.detener();
    await b.detener();
  }
});

test('la baja voluntaria saca a la instancia del catálogo al instante', async () => {
  const a = await iniciarCatalogo({ consul: entorno.consul });
  await a.detener();
  assert.deepEqual(await instanciasSanas(entorno.consul, 'catalogo'), []);
  await assert.rejects(crearLocalizador(entorno.consul).siguiente('catalogo'), SinInstancias);
});

test('una instancia que muere sin avisar deja de estar sana cuando vence su TTL', async () => {
  const a = await iniciarCatalogo({ consul: entorno.consul, ttlSegundos: 1 });
  try {
    assert.equal((await instanciasSanas(entorno.consul, 'catalogo')).length, 1);
    await a.morir(); // sin deregister y sin más latidos
    await dormir(2500); // TTL de 1 s + margen (Consul revisa los TTL con cierta holgura)
    assert.deepEqual(await instanciasSanas(entorno.consul, 'catalogo'), []);
  } finally {
    await entorno.consul.agent.service.deregister(a.id);
  }
});

test('con Consul caído el localizador sirve la última lista conocida', async () => {
  const a = await iniciarCatalogo({ consul: entorno.consul });
  try {
    let caido = false;
    const consulIntermitente = {
      health: { service: (o) => (caido ? Promise.reject(new Error('connect ECONNREFUSED')) : entorno.consul.health.service(o)) },
    };
    const localizador = crearLocalizador(consulIntermitente, { cacheMs: 0 });
    const antes = await localizador.siguiente('catalogo');
    caido = true;
    assert.deepEqual(await localizador.siguiente('catalogo'), antes);
  } finally {
    await a.detener();
  }
});
```

**Pregunta de comprobación:** subes el TTL de 3 s a 60 s «para no molestar a Consul con tantos latidos». ¿Qué cambia
para los clientes cuando una instancia muere con `kill -9`? (Respuesta: la ventana en la que Consul sigue ofreciendo
una instancia muerta pasa de unos 3 s a 60 s; durante ese minuto, una de cada N peticiones falla si el cliente no
reintenta contra otra instancia. El TTL es un compromiso entre tráfico de latidos y tiempo de detección.)

#### 12. ERROR COMÚN

**Síntoma:** el servicio no arranca (o el cliente falla) con `ECONNREFUSED 127.0.0.1:8500`, aunque «Consul está
arriba». Dos causas típicas: Consul no terminó de arrancar cuando el servicio intentó registrarse, o el servicio corre
**dentro de un contenedor**, donde `127.0.0.1` es el propio contenedor y no la máquina donde está Consul.

**Cómo se ve** (`node f111-consul/cliente.js` sin Consul, salida real con Node.js 26.13.1 y consul 2.0.1):

```text
node:internal/modules/run_main:111
    triggerUncaughtException(
    ^

Error: connect ECONNREFUSED 127.0.0.1:8500
    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:2083:16) {
  errno: -111,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 8500
}
```

**Diagnóstico visual:** mira `address` y `port` del error: dicen **a dónde** intentó conectarse. Desde la misma
máquina o contenedor donde corre el servicio, ejecuta `curl -s localhost:8500/v1/status/leader`: si no responde con
una dirección entre comillas (por ejemplo `"127.0.0.1:8300"`), el problema es de red o de arranque, no de tu código.
**Arreglo:** (1) define `CONSUL_HTTP_ADDR` con el nombre del servicio de Compose (`consul:8500`) cuando tu servicio
corre en un contenedor; (2) arranca con `docker compose up -d --wait`, que espera al *healthcheck*; (3) reintenta el
registro con espera creciente en lugar de morir al primer intento. El caso inverso también ocurre: con un check
**HTTP**, Consul dentro de Docker no alcanza a `127.0.0.1:3111` de tu máquina y el servicio queda en rojo para
siempre; por eso este laboratorio usa TTL.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué es Service Discovery, qué problema resuelve y qué pasa cuando una instancia muere sin avisar?»

**Respuesta modelo:** en un sistema donde las instancias se crean y destruyen todo el tiempo, las direcciones no se
pueden escribir en la configuración. Service Discovery introduce un registro: cada instancia se registra con su
nombre lógico, dirección y un health check; los clientes preguntan por nombre y reciben solo las instancias sanas.
Puede ser del lado del cliente (el cliente consulta el registro y balancea: Consul, Eureka) o del lado del servidor
(un balanceador o el DNS de la plataforma, como los Services de Kubernetes). Si una instancia muere sin darse de
baja, el registro lo detecta cuando falla su health check o vence su TTL; hasta entonces la sigue ofreciendo, así que
hay una ventana de inconsistencia. Por eso el cliente necesita timeouts, reintentos contra otra instancia y, en
general, no asumir que lo que devuelve el registro está vivo. Y en el apagado ordenado, el servicio se da de baja
antes de dejar de atender.

#### 14. ANTI-PATRÓN RELACIONADO

**Direcciones escritas a mano y descubrimiento «una sola vez al arrancar»:**

```javascript
// ❌ la lista de instancias vive en el código (o en un .env que alguien actualiza a mano)
const CATALOGO = ['http://10.0.3.7:3111', 'http://10.0.3.8:3111'];

// ❌ o se pregunta al registro UNA vez y se guarda para siempre
const [instancia] = await instanciasSanas(consul, 'catalogo'); // al arrancar
export const obtenerProducto = (id) => fetch(`${instancia.url}/productos/${id}`); // semanas después…
```

Se ve así: tras un despliegue de catálogo, pedidos sigue llamando a direcciones que ya no existen hasta que alguien
lo reinicia; una instancia nueva añadida por carga no recibe tráfico; y todo el tráfico va a la primera instancia de
la lista mientras las demás están ociosas. Un registro solo sirve si se consulta de forma continua (con caché corta)
y se elige instancia en cada llamada.

---

### Configuración centralizada

#### 1. UBICACIÓN

Módulo 17, Lección 4 de 4 · Fase 2
en `docker-compose.yml`).

#### 2. PRERREQUISITOS

- Configuración por variables de entorno, validación y fail-fast (ficha 2).
- Consul levantado y el cliente npm `consul` (ficha 3). `EventEmitter` de Node (Módulo 13).

#### 3. OBJETIVO DE APRENDIZAJE

**Construir** un servicio Node que lea su configuración del almacén clave-valor de Consul, la **combine** por capas
(valores por defecto < Consul < entorno), la **recargue en caliente** con una consulta bloqueante y **rechace** un
valor inválido conservando el anterior; lo compruebas cuando `node --test f112-config-central/config-central.test.js`
pasa 4 de 4 y `GET /config` cambia sin reiniciar el proceso.

#### 4. ANALOGÍA VISUAL

Dibuja un **aeropuerto**. Cada puerta de embarque tiene una **pantalla** (un servicio). Antes, cada pantalla tenía
pegado un **papel con los horarios** (el `.env` de cada servicio): cuando un vuelo se retrasaba, un empleado corría
puerta por puerta cambiando papeles, y siempre quedaba alguno viejo. Ahora hay una **torre de control con un único
tablero maestro** (el almacén de configuración): un operador cambia «vuelo 204 → 18:40» **una vez**, y todas las
pantallas, que están **suscritas** al tablero por un cable, se actualizan en segundos sin apagarse. Añade tres
detalles al dibujo: cada pantalla tiene **valores de fábrica** grabados por si el cable se corta (valores por
defecto); un **interruptor local con candado** que el técnico de esa puerta puede fijar y que manda sobre la torre
(variable de entorno); y un **filtro** en la entrada del cable: si la torre envía «hora: mañana por la tarde», la
pantalla **no lo muestra** y deja la hora anterior con una luz de aviso (validación).

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    OP["operador / pipeline"] -- "PUT /v1/kv/config/pedidos/pagos.timeoutMs" --> KV[("Consul KV<br/>config/pedidos/…")]
    KV -- "1 · lectura al arrancar<br/>GET ?recurse" --> S1["pedidos (instancia 1)"]
    KV -- "2 · consulta bloqueante<br/>GET ?recurse&index=N&wait=30s" --> S1
    KV --> S2["pedidos (instancia 2)"]
    subgraph S1D["dentro de cada instancia"]
        D["valores por defecto"] --> M{"combinar<br/>+ validar"}
        K2["valores de Consul"] --> M
        E["variables de entorno"] --> M
        M -- "válido" --> C["config vigente"]
        M -- "inválido" --> R["rechazo: conserva<br/>el valor anterior"]
    end
    S1 -.- S1D
```

**Texto alternativo:** un operador o un pipeline escribe una clave en el KV de Consul bajo el prefijo
`config/pedidos/`. Cada instancia del servicio pedidos lee todo el prefijo al arrancar y después mantiene una consulta
bloqueante con el último índice visto y una espera de 30 segundos, que Consul responde en cuanto algo cambia. Dentro
de cada instancia, los valores por defecto, los de Consul y las variables de entorno se combinan y validan: si el
resultado es válido se convierte en la configuración vigente; si un valor es inválido se rechaza y se conserva el
anterior.

#### 6. EXPLICACIÓN NIVEL 0

- Con un servicio, su configuración cabe en un archivo. Con veinte servicios y varias copias de cada uno, cambiar un
  valor compartido (por ejemplo, «el tiempo máximo de espera al llamar a pagos») significa editar muchos archivos y
  reiniciar muchos procesos.
- **Configuración centralizada** es guardar esos valores en **un solo lugar** al que todos los servicios preguntan.
- El lugar es un **almacén clave-valor**: una lista de pares como `config/pedidos/pagos.timeoutMs = 1500`.
- Lo mejor: los servicios pueden **quedarse escuchando** y enterarse del cambio en segundos, **sin reiniciarse**. A
  eso se le llama recarga en caliente.
- Consul, además de registro de servicios, trae un almacén clave-valor (KV). Lo usamos aquí.

#### 7. EXPLICACIÓN INTERMEDIA

- **Modelo de datos:** claves con forma de ruta (`config/<servicio>/<clave>`) y valores en bytes (Consul los devuelve
  en base64; el cliente npm los decodifica). `GET /v1/kv/config/pedidos/?recurse` trae todo el prefijo; `PUT
  /v1/kv/<clave>` escribe; cada clave tiene un `ModifyIndex`.
- **Capas:** valores por defecto en el código (el servicio arranca aunque Consul esté vacío) < KV de Consul (lo que
  comparten todas las instancias) < variables de entorno (la excepción local: una instancia en prueba, una urgencia).
- **Consulta bloqueante (long polling):** cada respuesta trae la cabecera `X-Consul-Index`. Si repites la petición
  con `?index=<ese valor>&wait=30s`, Consul **retiene** la respuesta hasta que algo cambie o pasen los 30 s (el máximo
  es 10 minutos; por defecto, 5). `consul.watch({ method: consul.kv.get, options })` hace ese bucle y emite `change`
  y `error`, con reintentos de espera creciente.
- **Validar también lo que llega en caliente:** un valor mal escrito en el KV llega a **todas** las instancias a la
  vez. `config-central.js` convierte y valida cada clave; si no pasa, emite `rechazo` y conserva el valor vigente.
- **Leer la configuración vigente en cada uso:** el servicio llama a `observador.actual()` en cada petición. Si copia
  el valor a una constante al arrancar, la recarga no tiene efecto.
- **Consul caído:** al arrancar, `servicio.js` sigue con valores por defecto + entorno y avisa; en marcha, conserva
  la última configuración y el vigilante reintenta. La configuración centralizada no debe ser un punto único de fallo.
- **Qué va en el KV:** parámetros de comportamiento (timeouts, límites, *feature flags*). **No** secretos (el KV de
  Consul no cifra en reposo por sí solo: para eso está Vault, Módulo 20) ni lo que define el despliegue (el puerto).

#### 8. EXPLICACIÓN MAESTRA

- **Alternativas y trade-offs.**
  1. **Variables de entorno / ConfigMaps de Kubernetes**: simple, versionable en Git (GitOps) y auditado por el
     pipeline; cambiar un valor es un despliegue (reinicio escalonado). Para la mayoría de la configuración es lo
     correcto, precisamente porque pasa por revisión.
  2. **Almacén KV con recarga en caliente** (Consul KV, etcd, ZooKeeper; AWS AppConfig o Azure App Configuration como
     servicio): cambios en segundos sin reinicio; a cambio, un cambio malo llega a todo el parque a la vez y sin
     pasar por el pipeline, salvo que añadas validación, despliegue gradual del valor y auditoría.
  3. **Servidor de configuración** (Spring Cloud Config, que también sirve a clientes Node por HTTP): la fuente es un
     repositorio Git con historial y revisión; la recarga necesita un aviso (bus de mensajes) o sondeo.
  4. **Plataforma de feature flags** (Unleash, OpenFeature con un proveedor): pensada para activar funciones por
     porcentaje o por usuario, con interfaz y auditoría; no sustituye a la configuración técnica.
- **Recarga en caliente ≠ gratis.** Solo es segura para valores que se leen en cada uso. Cambiar el tamaño de un pool
  de conexiones o una URL con conexiones abiertas exige recrear recursos con cuidado; muchas veces es más simple y
  seguro reiniciar. Además, cada instancia aplica el cambio en un instante distinto: durante unos segundos conviven
  dos configuraciones.
- **Consistencia.** Las lecturas del KV por defecto pueden venir de un servidor que acaba de dejar de ser líder
  (`default`); para lecturas estrictas existe `?consistent`. Para configuración, la lectura por defecto y el índice
  bastan; el índice puede retroceder tras una restauración, y entonces el cliente debe volver a empezar desde 0 (el
  vigilante del cliente npm lo hace).
- **Gobierno.** Quién puede escribir en `config/` (ACL de Consul), cómo se revisa un cambio y cómo se revierte
  (guardar el valor anterior, o gestionar el KV desde Git con una herramienta que lo sincronice) importan más que la
  librería.
- **Cuándo NO centralizar:** con pocos servicios y despliegue rápido, las variables de entorno por servicio son más
  simples y más seguras. Centraliza cuando el mismo valor vive en muchos servicios o cuando necesitas cambiarlo en
  segundos durante un incidente (subir un timeout, apagar una función).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **consul 2.0.1** (cliente npm) y **HashiCorp Consul 2.1.0** (el mismo
`docker-compose.yml` y `comun/consul.js` del inicio del módulo).

`f112-config-central/config-central.js`:

```javascript
// Módulo 17 · F112 · Configuración centralizada con el KV de Consul.
// Requisitos: Node.js 26.13.1 LTS, consul 2.0.1 (npm) y un agente Consul 2.1.0.
// Capas (de menor a mayor prioridad): valores por defecto < KV de Consul < variables de entorno.
import { EventEmitter } from 'node:events';

const POR_DEFECTO = { 'pagos.timeoutMs': 2000, 'pedidos.montoMaximo': 5000000, 'funciones.envioGratis': false };

// Convierte y valida. Una clave desconocida o un valor inválido NO entran: se conserva lo anterior.
function interpretar(clave, texto) {
  const ejemplo = POR_DEFECTO[clave];
  if (ejemplo === undefined) throw new Error(`clave desconocida: ${clave}`);
  if (typeof ejemplo === 'number') {
    if (!/^\d+$/.test(texto)) throw new Error(`${clave} debe ser un entero y llegó "${texto}"`);
    return Number(texto);
  }
  if (typeof ejemplo === 'boolean') {
    if (texto !== 'true' && texto !== 'false') throw new Error(`${clave} debe ser true o false y llegó "${texto}"`);
    return texto === 'true';
  }
  return texto;
}

// «pagos.timeoutMs» ⇄ variable de entorno «PAGOS_TIMEOUT_MS»
const variableDe = (clave) => clave.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/\./g, '_').toUpperCase();

export function combinar(paresKv, env = process.env) {
  const config = { ...POR_DEFECTO };
  const rechazadas = [];
  const aplicar = (clave, texto, origen) => {
    try { config[clave] = interpretar(clave, texto); } catch (error) { rechazadas.push(`${origen}: ${error.message}`); }
  };
  for (const [clave, texto] of paresKv) aplicar(clave, texto, 'consul');
  for (const clave of Object.keys(POR_DEFECTO)) {
    const texto = env[variableDe(clave)];
    if (texto !== undefined) aplicar(clave, texto, 'entorno');
  }
  return { config: Object.freeze(config), rechazadas };
}

// «config/pedidos/pagos.timeoutMs» → [«pagos.timeoutMs», «1500»]
const aPares = (items, prefijo) => (items ?? []).filter((i) => i.Key !== prefijo).map((i) => [i.Key.slice(prefijo.length), i.Value ?? '']);

// Lee una vez (al arrancar). Si Consul no responde, lanza: el servicio decide si arranca con los valores por defecto.
export async function leerConfig(consul, { prefijo = 'config/pedidos/', env = process.env } = {}) {
  const items = await consul.kv.get({ key: prefijo, recurse: true });
  return combinar(aPares(items, prefijo), env);
}

// Observa el prefijo con una consulta bloqueante (long polling): Consul retiene la petición hasta que
// algo cambia. Emite «cambio» con la configuración nueva y las claves que cambiaron; «rechazo» si llega
// un valor inválido (y entonces se conserva el valor anterior de esa clave).
export function observarConfig(consul, { prefijo = 'config/pedidos/', env = process.env, inicial } = {}) {
  const emisor = new EventEmitter();
  let actual = inicial ?? Object.freeze({ ...POR_DEFECTO });
  const vigilante = consul.watch({
    method: consul.kv.get,
    options: { key: prefijo, recurse: true, wait: '30s' },
    backoffFactor: 200,
  });
  vigilante.on('change', (items) => {
    const { config, rechazadas } = combinar(aPares(items, prefijo), env);
    const nueva = { ...config };
    // Una clave rechazada conserva su valor ANTERIOR (no vuelve al valor por defecto).
    for (const r of rechazadas) {
      const clave = Object.keys(POR_DEFECTO).find((k) => r.includes(` ${k} `));
      if (clave && r.startsWith('consul')) nueva[clave] = actual[clave];
      emisor.emit('rechazo', r);
    }
    const cambiadas = Object.keys(nueva).filter((k) => nueva[k] !== actual[k]);
    if (cambiadas.length === 0) return;
    actual = Object.freeze(nueva);
    emisor.emit('cambio', actual, cambiadas);
  });
  vigilante.on('error', (error) => emisor.emit('sinConsul', error)); // el vigilante reintenta solo con backoff
  emisor.actual = () => actual;
  emisor.detener = () => vigilante.end();
  return emisor;
}
```

`f112-config-central/sembrar.js`:

```javascript
// Módulo 17 · F112 · Escribe la configuración inicial del servicio «pedidos» en el KV de Consul.
// Ejecuta: node f112-config-central/sembrar.js            (equivale a `consul kv put config/pedidos/... valor`)
//          node f112-config-central/sembrar.js pagos.timeoutMs 800    (cambia una sola clave)
import { clienteConsul } from '../comun/consul.js';

const consul = clienteConsul();
const [clave, valor] = process.argv.slice(2);
const pares = clave ? [[clave, valor]] : [['pagos.timeoutMs', '1500'], ['pedidos.montoMaximo', '3000000'], ['funciones.envioGratis', 'false']];
for (const [k, v] of pares) {
  await consul.kv.set({ key: `config/pedidos/${k}`, value: String(v) });
  console.log(`config/pedidos/${k} = ${v}`);
}
```

`f112-config-central/servicio.js`:

```javascript
// Módulo 17 · F112 · Servicio «pedidos» que toma su configuración de Consul y la recarga EN CALIENTE.
// Ejecuta: node f112-config-central/servicio.js     (GET http://localhost:3120/config)
import { createServer } from 'node:http';
import { clienteConsul } from '../comun/consul.js';
import { combinar, leerConfig, observarConfig } from './config-central.js';

const consul = clienteConsul();
let inicial;
try {
  ({ config: inicial } = await leerConfig(consul));
  console.log('configuración inicial (Consul + entorno):', JSON.stringify(inicial));
} catch (error) {
  // Consul no responde al arrancar: se sigue con valores por defecto + entorno y se avisa.
  ({ config: inicial } = combinar([]));
  console.warn(`Consul no disponible (${error.message}); arranco con valores por defecto:`, JSON.stringify(inicial));
}

const observador = observarConfig(consul, { inicial });
observador.on('cambio', (config, claves) => console.log(`recargada en caliente [${claves.join(', ')}]:`, JSON.stringify(config)));
observador.on('rechazo', (motivo) => console.warn(`valor rechazado, conservo el anterior → ${motivo}`));
observador.on('sinConsul', (error) => console.warn(`sin conexión con Consul (${error.message}); sigo con la última configuración`));

const puerto = Number(process.env.PORT ?? 3120);
const servidor = createServer((req, res) => {
  if (req.url === '/config') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify(observador.actual())); // cada petición lee la configuración VIGENTE
  }
  res.writeHead(404).end();
});
servidor.listen(puerto, () => console.log(`pedidos escuchando en :${puerto}`));
for (const senal of ['SIGINT', 'SIGTERM']) {
  process.on(senal, () => { observador.detener(); servidor.close(() => process.exit(0)); });
}
```

#### 10. MINI-LABORATORIO

1. Levanta Consul, siembra la configuración y arranca el servicio:
   ```bash
   docker compose up -d --wait
   node f112-config-central/sembrar.js
   node f112-config-central/servicio.js
   ```
2. En otra terminal, consulta la configuración vigente, cambia un valor en Consul y vuelve a consultar **sin
   reiniciar** el servicio:
   ```bash
   curl -s localhost:3120/config; echo
   node f112-config-central/sembrar.js pagos.timeoutMs 800
   curl -s localhost:3120/config; echo
   ```
3. Envía un valor inválido a todo el parque y comprueba que el servicio se protege:
   ```bash
   node f112-config-central/sembrar.js pagos.timeoutMs rapido
   curl -s localhost:3120/config; echo
   ```
4. Detén el servicio (Ctrl+C) y arráncalo con una **excepción local** por variable de entorno:
   ```bash
   PAGOS_TIMEOUT_MS=250 node f112-config-central/servicio.js     # terminal 1
   ```
5. **Rompe el sistema a propósito:** con el servicio en marcha, apaga Consul, mira la terminal 1 y consulta de nuevo.
   Después limpia:
   ```bash
   docker compose stop consul
   curl -s localhost:3120/config; echo
   docker compose down -v
   ```

**Output esperado** (paso 1, terminal 1; salida real en macOS con Consul 2.1.0):

```text
config/pedidos/pagos.timeoutMs = 1500
config/pedidos/pedidos.montoMaximo = 3000000
config/pedidos/funciones.envioGratis = false
configuración inicial (Consul + entorno): {"pagos.timeoutMs":1500,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}
pedidos escuchando en :3120
```

**Output esperado** (pasos 2 y 3, terminal 2):

```text
{"pagos.timeoutMs":1500,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}
config/pedidos/pagos.timeoutMs = 800
{"pagos.timeoutMs":800,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}
config/pedidos/pagos.timeoutMs = rapido
{"pagos.timeoutMs":800,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}
```

**Output esperado** (pasos 2 y 3, lo que aparece en la terminal 1 mientras tanto; salida real con Consul 2.1.0):

```text
recargada en caliente [pagos.timeoutMs]: {"pagos.timeoutMs":800,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}
valor rechazado, conservo el anterior → consul: pagos.timeoutMs debe ser un entero y llegó "rapido"
```

**Output esperado** (paso 4, terminal 1: la variable de entorno gana a Consul, y el vigilante vuelve a avisar del
valor inválido que sigue guardado allí):

```text
configuración inicial (Consul + entorno): {"pagos.timeoutMs":250,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}
pedidos escuchando en :3120
valor rechazado, conservo el anterior → consul: pagos.timeoutMs debe ser un entero y llegó "rapido"
```

**Output esperado** (paso 5: la terminal 1 repite un aviso como el primero, con espera creciente entre intentos, y
`GET /config` sigue respondiendo; justo al cortar, el primer aviso puede decir `socket hang up` en lugar de
`ECONNREFUSED`, porque había una consulta bloqueante abierta):

```text
sin conexión con Consul (consul: kv.get: connect ECONNREFUSED 127.0.0.1:8500); sigo con la última configuración
{"pagos.timeoutMs":250,"pedidos.montoMaximo":3000000,"funciones.envioGratis":false}
```

**Captura comentada:** entre el `sembrar.js … 800` y la línea «recargada en caliente» pasan milisegundos: la consulta
bloqueante ya estaba abierta y Consul la respondió en cuanto cambió el índice. El valor `rapido` quedó guardado en
Consul, pero **ninguna** instancia lo aplicó. El `250` de la
variable de entorno ganó a Consul solo en esa instancia. Y con Consul apagado, el servicio siguió atendiendo con la
última configuración buena (el Consul de este laboratorio corre en modo `-dev`, con los datos en memoria: al apagarlo
se pierde lo sembrado).

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec f112-config-central/config-central.test.js               # doble en memoria
CONSUL_REAL=1 node --test --test-reporter=spec f112-config-central/config-central.test.js # Consul de Docker
```

Salida real (con el doble en memoria):

```text
✔ capas: por defecto < Consul < entorno (5.487148ms)
✔ valores inválidos y claves desconocidas se rechazan sin romper el resto (0.223232ms)
✔ lee del KV de Consul al arrancar (13.480193ms)
✔ recarga en caliente cuando cambia una clave y conserva el valor anterior si el nuevo es inválido (7.715927ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

Salida real de la segunda orden (macOS, Consul 2.1.0 en Docker; los milisegundos cambian):

```text
✔ capas: por defecto < Consul < entorno (0.539834ms)
✔ valores inválidos y claves desconocidas se rechazan sin romper el resto (0.079167ms)
✔ lee del KV de Consul al arrancar (7.051917ms)
✔ recarga en caliente cuando cambia una clave y conserva el valor anterior si el nuevo es inválido (3.84625ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

`f112-config-central/config-central.test.js`:

```javascript
// Módulo 17 · F112 · Ejecuta: node --test f112-config-central/config-central.test.js
// Por defecto usa el doble en memoria; contra el Consul real: CONSUL_REAL=1 node --test f112-config-central/config-central.test.js
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { after, before, test } from 'node:test';
import { consulParaTests } from '../comun/consul.js';
import { combinar, leerConfig, observarConfig } from './config-central.js';

const prefijo = `config/test-${process.pid}/`; // prefijo propio: no pisa la configuración del laboratorio
let entorno;
before(async () => { entorno = await consulParaTests(); });
after(async () => {
  await entorno.consul.kv.del({ key: prefijo, recurse: true }).catch(() => {});
  await entorno.detener();
});
const poner = (clave, valor) => entorno.consul.kv.set({ key: prefijo + clave, value: valor });

test('capas: por defecto < Consul < entorno', () => {
  const { config } = combinar([['pagos.timeoutMs', '1500'], ['funciones.envioGratis', 'true']], { PAGOS_TIMEOUT_MS: '300' });
  assert.deepEqual(config, { 'pagos.timeoutMs': 300, 'pedidos.montoMaximo': 5000000, 'funciones.envioGratis': true });
});

test('valores inválidos y claves desconocidas se rechazan sin romper el resto', () => {
  const { config, rechazadas } = combinar([['pagos.timeoutMs', 'rapido'], ['color', 'azul']], {});
  assert.equal(config['pagos.timeoutMs'], 2000);
  assert.deepEqual(rechazadas, ['consul: pagos.timeoutMs debe ser un entero y llegó "rapido"', 'consul: clave desconocida: color']);
});

test('lee del KV de Consul al arrancar', async () => {
  await poner('pagos.timeoutMs', '1500');
  await poner('pedidos.montoMaximo', '3000000');
  const { config } = await leerConfig(entorno.consul, { prefijo, env: {} });
  assert.deepEqual(config, { 'pagos.timeoutMs': 1500, 'pedidos.montoMaximo': 3000000, 'funciones.envioGratis': false });
});

test('recarga en caliente cuando cambia una clave y conserva el valor anterior si el nuevo es inválido', async () => {
  const { config: inicial } = await leerConfig(entorno.consul, { prefijo, env: {} });
  const observador = observarConfig(entorno.consul, { prefijo, env: {}, inicial });
  try {
    const cambio = once(observador, 'cambio');
    await poner('pagos.timeoutMs', '800');
    const [config, claves] = await cambio;
    assert.equal(config['pagos.timeoutMs'], 800);
    assert.deepEqual(claves, ['pagos.timeoutMs']);

    const rechazo = once(observador, 'rechazo');
    await poner('pagos.timeoutMs', 'ochocientos');
    assert.deepEqual(await rechazo, ['consul: pagos.timeoutMs debe ser un entero y llegó "ochocientos"']);
    assert.equal(observador.actual()['pagos.timeoutMs'], 800);
  } finally {
    observador.detener();
  }
});
```

**Pregunta de comprobación:** un compañero guarda `const timeout = observador.actual()['pagos.timeoutMs']` al
arrancar el servicio y usa `timeout` en cada llamada. Cambias la clave en Consul y el log dice «recargada en
caliente». ¿Qué timeout usan las llamadas? (Respuesta: el antiguo. La constante copió el número una vez; la recarga
cambió el objeto vigente, no esa copia. Hay que leer `observador.actual()` en cada uso o suscribirse a `cambio`.)

#### 12. ERROR COMÚN

**Síntoma:** el servicio **no arranca** (o se cae en bucle en Kubernetes) cuando Consul está caído o tarda, porque la
lectura inicial se trató como obligatoria. Un fallo del almacén de configuración tumba servicios que no tenían nada
que ver.

```javascript
// ❌ sin try/catch: si Consul no responde, el proceso muere al arrancar
const { config } = await leerConfig(consul);
```

**Cómo se ve** el error que lanza la lectura (salida real con consul 2.0.1 y Node.js 26.13.1, sin Consul):

```text
Error: consul: kv.get: connect ECONNREFUSED 127.0.0.1:8500
```

Y cómo se ve **bien manejado** (`node f112-config-central/servicio.js` sin Consul, salida real):

```text
Consul no disponible (consul: kv.get: connect ECONNREFUSED 127.0.0.1:8500); arranco con valores por defecto: {"pagos.timeoutMs":2000,"pedidos.montoMaximo":5000000,"funciones.envioGratis":false}
pedidos escuchando en :3120
sin conexión con Consul (consul: kv.get: connect ECONNREFUSED 127.0.0.1:8500); sigo con la última configuración
```

**Diagnóstico visual:** el prefijo `consul: kv.get:` dice qué operación falló y `ECONNREFUSED 127.0.0.1:8500` a dónde
iba. Si en el panel de tu orquestador ves **varios servicios distintos** reiniciándose a la vez, busca la dependencia
común: casi siempre es el registro o el almacén de configuración. **Arreglo:** valores por defecto seguros en el
código, lectura inicial tolerante (o con un límite de reintentos y la última configuración buena guardada en disco),
y el vigilante reintentando en segundo plano. Decide de forma explícita qué claves son imprescindibles para arrancar.

#### 13. PREGUNTA DE ENTREVISTA

«¿Cuándo usarías configuración centralizada con recarga en caliente y qué riesgos tiene?»

**Respuesta modelo:** la uso para parámetros de comportamiento que comparten muchos servicios o que necesito cambiar
en segundos sin desplegar: timeouts, límites, *feature flags*, apagar una integración durante un incidente. La
implemento por capas (valores por defecto en el código, almacén central, variable de entorno como excepción local),
con un vigilante por consulta bloqueante y validación de cada valor entrante, conservando el último bueno. Los
riesgos: un valor malo llega a todas las instancias a la vez y fuera del pipeline, así que necesito validación,
control de acceso, auditoría y una forma rápida de revertir; el almacén se vuelve una dependencia crítica, así que
los servicios deben arrancar y seguir sin él; y la recarga solo sirve para valores que se leen en cada uso, no para
recursos ya creados como pools o conexiones. Los secretos no van ahí, sino en un gestor de secretos. Para todo lo
demás, variables de entorno versionadas en Git y un despliegue normal son más simples y más seguras.

#### 14. ANTI-PATRÓN RELACIONADO

**El almacén central como cajón de todo, sin validación ni dueño:**

```text
config/global/DB_PASSWORD        = Pr0d-2026!          ← secreto en claro, legible por cualquier servicio
config/global/timeout            = 30                  ← ¿segundos? ¿milisegundos? ¿de quién?
config/pedidos/PORT              = 3109                ← lo define el despliegue, no el almacén
config/global/modo               = "nuevo"             ← 14 servicios cambian de comportamiento a la vez
```

```javascript
// ❌ se aplica lo que llegue, sin convertir ni validar
vigilante.on('change', (items) => { for (const i of items) config[i.Key] = i.Value; });
```

Se ve así: alguien escribe `timeout = 30s` en vez de `30` y todas las instancias empiezan a usar `NaN` milisegundos
al mismo tiempo; nadie sabe qué servicio lee `config/global/modo`, así que nadie se atreve a tocarlo; y una
auditoría de seguridad encuentra la clave de la base de datos visible en la interfaz de Consul. Claves por servicio,
con tipo y unidad en el nombre (`pagos.timeoutMs`), validadas al entrar y con un equipo responsable.
