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

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Organizar un microservicio Node en capas y módulos de negocio (config/, shared/, modules/<módulo>/{dominio, aplicacion,infraestructura,http}), aplicar la regla de dependencias (todo apunta hacia el dominio) y defenderla con un test automático; lo compruebas cuando node --test 'f1…

#### ► LA IDEA EN UNA FRASE
**Organizar un microservicio Node en capas y módulos de negocio (config/, shared/, modules/<módulo>/{dominio, aplicacion,infraestructura,http}), aplicar la regla de dependencias (todo apunta hacia el dominio) y defenderla con un test automático; lo compruebas cuando node --test 'f109-estructura/test/*.test.ts' pasa 8 de 8 y revisar-capas.ts informa «0 violaciones».**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en estructura de carpetas escalable como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un programa pequeño cabe en un archivo. Un servicio real tiene cientos de archivos: sin un orden, encontrar dónde
2. **Estructura de carpetas** es decidir de antemano **dónde vive cada tipo de código**. Es como los cajones de una
3. Aquí hay cuatro cajones por cada tema de negocio (por ejemplo, «pedidos»):
4. **dominio**: las reglas del negocio («un pedido necesita al menos una línea»).
5. **aplicación**: los pasos de cada acción («crear pedido: validar, guardar»).

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Estructura de carpetas escalable se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Estructura de carpetas escalable | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La carpeta utils/ (o helpers/, common/) que lo sabe todo, y el controlador que hace todo:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: estructura de carpetas escalable funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un programa pequeño cabe en un archivo. Un servicio real tiene cientos de archivos: sin un orden, encontrar dónde
- **Estructura de carpetas** es decidir de antemano **dónde vive cada tipo de código**. Es como los cajones de una
- Aquí hay cuatro cajones por cada tema de negocio (por ejemplo, «pedidos»):
- **dominio**: las reglas del negocio («un pedido necesita al menos una línea»).

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve estructura de carpetas escalable en tu contexto?
2. ¿Cómo sabrías que estructura de carpetas escalable no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar estructura de carpetas escalable?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### dotenv

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Configurar un servicio Node con un archivo .env cargado con dotenv, validar y convertir cada variable al arrancar (fallando con todos los errores a la vez) y explicar qué gana cuando una variable está en el archivo y en el entorno; lo compruebas cuando node --test f110-dotenv/con…

#### ► LA IDEA EN UNA FRASE
**Configurar un servicio Node con un archivo .env cargado con dotenv, validar y convertir cada variable al arrancar (fallando con todos los errores a la vez) y explicar qué gana cuando una variable está en el archivo y en el entorno; lo compruebas cuando node --test f110-dotenv/config.test.js pasa 5 de 5.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en dotenv como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un mismo programa corre en tu portátil, en pruebas y en producción. Lo que cambia entre esos lugares (el puerto, la
2. Una **variable de entorno** es un dato con nombre que el sistema operativo le pasa al programa al arrancar:
3. Escribir diez variables cada vez que arrancas es incómodo. Un archivo **`.env`** es una lista de esas variables,
4. **dotenv** es una librería que, al arrancar, lee `.env` y pone esas variables donde el programa las espera
5. El archivo `.env` tiene claves reales: **no se sube a Git**. Lo que se sube es `.env.example`, la plantilla sin

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| dotenv se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar dotenv | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El .env en Git y process.env repartido por todo el código:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: dotenv funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un mismo programa corre en tu portátil, en pruebas y en producción. Lo que cambia entre esos lugares (el puerto, la
- Una **variable de entorno** es un dato con nombre que el sistema operativo le pasa al programa al arrancar:
- Escribir diez variables cada vez que arrancas es incómodo. Un archivo **`.env`** es una lista de esas variables,
- **dotenv** es una librería que, al arrancar, lee `.env` y pone esas variables donde el programa las espera

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve dotenv en tu contexto?
2. ¿Cómo sabrías que dotenv no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar dotenv?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
   node f110-dotenv/main.js ; echo "código de salida: $?"
   ```

```bash
   cp f110-dotenv/.env.example f110-dotenv/.env
   node f110-dotenv/main.js
   git status --short f110-dotenv/     # .env no aparece: está ignorado
   ```

</details>

### Service Discovery con Consul

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Implementar el auto-registro de un servicio Node en Consul con un check TTL, descubrir sus instancias sanas desde un cliente y repartir las llamadas por turnos, incluida la baja ordenada y la caída sin aviso; lo compruebas cuando node --test f111-consul/descubrimiento.test.js pas…

#### ► LA IDEA EN UNA FRASE
**Implementar el auto-registro de un servicio Node en Consul con un check TTL, descubrir sus instancias sanas desde un cliente y repartir las llamadas por turnos, incluida la baja ordenada y la caída sin aviso; lo compruebas cuando node --test f111-consul/descubrimiento.test.js pasa 4 de 4 y el cliente deja de recibir a la instancia que mataste.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en service discovery con consul como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. En tu máquina, el servicio B está en `localhost:3111`. En producción hay varias copias de B, en máquinas que
2. **Service Discovery** («descubrimiento de servicios») es el mecanismo para que un servicio encuentre a otro **por
3. Funciona con un **registro**: una libreta central donde cada copia se apunta al arrancar («soy catalogo, estoy en
4. El registro también vigila la **salud**: si una copia deja de dar señales de vida, deja de recomendarla.
5. **Consul** es un programa de HashiCorp que hace de registro (y más cosas: también guarda configuración, ficha 4).

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Service Discovery con Consul se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Service Discovery con Consul | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Direcciones escritas a mano y descubrimiento «una sola vez al arrancar»:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: service discovery con consul funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- En tu máquina, el servicio B está en `localhost:3111`. En producción hay varias copias de B, en máquinas que
- **Service Discovery** («descubrimiento de servicios») es el mecanismo para que un servicio encuentre a otro **por
- Funciona con un **registro**: una libreta central donde cada copia se apunta al arrancar («soy catalogo, estoy en
- El registro también vigila la **salud**: si una copia deja de dar señales de vida, deja de recomendarla.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve service discovery con consul en tu contexto?
2. ¿Cómo sabrías que service discovery con consul no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar service discovery con consul?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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

</details>

### Configuración centralizada

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Construir un servicio Node que lea su configuración del almacén clave-valor de Consul, la combine por capas (valores por defecto < Consul < entorno), la recargue en caliente con una consulta bloqueante y rechace un valor inválido conservando el anterior; lo compruebas cuando node…

#### ► LA IDEA EN UNA FRASE
**Construir un servicio Node que lea su configuración del almacén clave-valor de Consul, la combine por capas (valores por defecto < Consul < entorno), la recargue en caliente con una consulta bloqueante y rechace un valor inválido conservando el anterior; lo compruebas cuando node --test f112-config-central/config-central.test.js pasa 4 de 4 y GET /config cambia sin reiniciar el proceso.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en configuración centralizada como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Con un servicio, su configuración cabe en un archivo. Con veinte servicios y varias copias de cada uno, cambiar un
2. **Configuración centralizada** es guardar esos valores en **un solo lugar** al que todos los servicios preguntan.
3. El lugar es un **almacén clave-valor**: una lista de pares como `config/pedidos/pagos.timeoutMs = 1500`.
4. Lo mejor: los servicios pueden **quedarse escuchando** y enterarse del cambio en segundos, **sin reiniciarse**. A
5. Consul, además de registro de servicios, trae un almacén clave-valor (KV). Lo usamos aquí.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Configuración centralizada se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Configuración centralizada | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
El almacén central como cajón de todo, sin validación ni dueño:

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: configuración centralizada funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Con un servicio, su configuración cabe en un archivo. Con veinte servicios y varias copias de cada uno, cambiar un
- **Configuración centralizada** es guardar esos valores en **un solo lugar** al que todos los servicios preguntan.
- El lugar es un **almacén clave-valor**: una lista de pares como `config/pedidos/pagos.timeoutMs = 1500`.
- Lo mejor: los servicios pueden **quedarse escuchando** y enterarse del cambio en segundos, **sin reiniciarse**. A

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve configuración centralizada en tu contexto?
2. ¿Cómo sabrías que configuración centralizada no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar configuración centralizada?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
   docker compose up -d --wait
   node f112-config-central/sembrar.js
   node f112-config-central/servicio.js
   ```

```bash
   curl -s localhost:3120/config; echo
   node f112-config-central/sembrar.js pagos.timeoutMs 800
   curl -s localhost:3120/config; echo
   ```

</details>
