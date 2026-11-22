# Módulo 16 · Testing

**Fase 2 · Node.js de cero a experto** (semana 4 de 12, segunda mitad). **Duración:** 10 h (4 temas de 2 h y 2 h de
laboratorio integrador). **Dificultad:** 3 de 5. **Dependencias:** Módulo 14 (API con Express y TypeScript) y
Módulo 15 (PostgreSQL con `pg`, database-per-service); de la Fase 0, Docker básico. No necesita la Fase 1.
**Herramientas:** **Node.js 26.13.1 LTS**, **TypeScript 6.0.3**, **jest 30.5.2** con **ts-jest 29.4.15**,
**supertest 7.3.2**, **express 5.3.0**, **@pact-foundation/pact 17.1.4** y **@pact-foundation/pact-cli 18.10.9**,
**testcontainers** y **@testcontainers/postgresql 12.2.2**, **pg 8.23.1**; **Pact Broker 2.124.0** y
**PostgreSQL 18.7** con Docker. **Laboratorio:** `modulo-20` (una carpeta por tema;
los comandos de verificación indicados ejecuta todos los tests, los errores que deben fallar y el flujo con el Pact Broker, y
guarda los logs en `logs/`).

Un test es un programa que ejecuta tu programa y comprueba el resultado por ti, las veces que haga falta. En
microservicios eso no es un lujo: cambias un servicio varias veces por semana y otros equipos dependen de él. Este
módulo recorre la **pirámide de pruebas** de abajo arriba: lógica aislada con Jest, la API HTTP completa con
Supertest, el acuerdo entre dos servicios con Pact y el SQL contra una base real con Testcontainers.

```mermaid
flowchart TB
    T4["4 · Testcontainers para Node<br/>integración con PostgreSQL real · segundos"]
    T3["3 · Contract Testing con Pact<br/>el acuerdo entre dos servicios"]
    T2["2 · Supertest<br/>la API HTTP en memoria · milisegundos"]
    T1["1 · Jest<br/>lógica y dobles de prueba · milisegundos"]
    T1 --> T2 --> T3 --> T4
```

**Texto alternativo:** mapa del módulo como una pila de cuatro bloques que se recorre de abajo arriba. En la base, el
tema 1, Jest (lógica y dobles de prueba, milisegundos). Encima, el tema 2, Supertest (la API HTTP en memoria,
milisegundos). Después el tema 3, Contract Testing con Pact (el acuerdo entre dos servicios). Arriba, el tema 4,
Testcontainers para Node (integración con PostgreSQL real, segundos). Una flecha sube del 1 al 4.

**Cómo usar el laboratorio.** Necesitas Node 26 (`nvm install 26 && nvm use 26`) y, para las fichas 3 (broker) y 4,
Docker Desktop encendido:

```bash
los comandos de verificación indicados     # npm ci + tsc + Jest + errores esperados + Pact Broker + Testcontainers → «RESULTADO: OK»
```

Todas las órdenes de las fichas se ejecutan **desde `modulo-20`** después de `npm ci`. El
`package.json`, compartido por las cuatro fichas (`package-lock.json` fija el árbol completo):

```json
{
  "name": "modulo-16-testing-node",
  "version": "1.0.0",
  "private": true,
  "description": "Módulo 16 (Fase 2): Testing con Jest, Supertest, Pact y Testcontainers.",
  "engines": {
    "node": ">=26.13.1"
  },
  "scripts": {
    "typecheck": "tsc --noEmit -p tsconfig.json",
    "test": "jest --selectProjects unit",
    "test:cobertura": "jest --selectProjects unit --coverage",
    "test:pact:consumidor": "jest --selectProjects pact-consumidor",
    "test:pact:proveedor": "jest --selectProjects pact-proveedor",
    "test:contenedores": "jest --selectProjects contenedores"
  },
  "dependencies": {
    "express": "5.3.0",
    "pg": "8.23.1"
  },
  "devDependencies": {
    "@pact-foundation/pact": "17.1.4",
    "@pact-foundation/pact-cli": "18.10.9",
    "@testcontainers/postgresql": "12.2.2",
    "@types/express": "5.0.6",
    "@types/jest": "30.0.0",
    "@types/node": "26.6.6",
    "@types/pg": "8.23.1",
    "@types/supertest": "7.2.1",
    "jest": "30.5.2",
    "supertest": "7.3.2",
    "testcontainers": "12.2.2",
    "ts-jest": "29.4.15",
    "typescript": "6.0.3"
  }
}
```

`jest.config.js` (un *project* por tipo de prueba):

```javascript
// Módulo 16 · Configuración de Jest 30.5.2 con ts-jest 29.4.15 (compila TypeScript 6.0.3 al vuelo).
// Un «project» por tipo de prueba: así los tests rápidos no esperan a Docker ni al contrato.
const base = { preset: 'ts-jest', testEnvironment: 'node' };

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    { ...base, displayName: 'unit', testMatch: ['<rootDir>/f105-jest/src/**/*.test.ts', '<rootDir>/f106-supertest/src/**/*.test.ts'] },
    { ...base, displayName: 'errores', testMatch: ['<rootDir>/**/error-comun/*.test.ts'] },
    { ...base, displayName: 'pact-consumidor', testMatch: ['<rootDir>/f107-pact/consumidor/*.pact.test.ts'] },
    { ...base, displayName: 'pact-proveedor', testMatch: ['<rootDir>/f107-pact/proveedor/*.pact.test.ts'] },
    { ...base, displayName: 'contenedores', testMatch: ['<rootDir>/f108-testcontainers/*.test.ts'] },
  ],
  // Reportero clásico siempre: Jest 30 cambia a un informe resumido cuando detecta que lo ejecuta un asistente de IA.
  reporters: ['default'],
  // Cobertura (solo con --coverage): mide el código de producción, no los tests.
  collectCoverageFrom: ['f105-jest/src/**/*.ts', 'f106-supertest/src/**/*.ts', '!**/*.test.ts', '!**/servidor.ts'],
  coverageThreshold: { global: { lines: 90, branches: 80 } }, // por debajo de esto, jest termina con código 1
};
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node", "jest"]
  },
  "include": ["f105-jest", "f106-supertest", "f107-pact", "f108-testcontainers"]
}
```

Un detalle de la línea de órdenes que usarás todo el módulo: `--selectProjects` acepta varios nombres, así que el
**patrón de archivos va antes**: `npx jest carrito --selectProjects unit` (si lo escribes después, Jest lo toma por
otro nombre de proyecto).

---

### Jest

#### 1. UBICACIÓN

Módulo 16, Lección 1 de 4 · Fase 2.

#### 2. PRERREQUISITOS

- Funciones, clases, promesas y `async/await` (Módulo 13); tipos e interfaces de TypeScript (Módulo 13).
- Haber leído la salida de un test con `node --test` (Módulos 13 a 15).
- `npm ci` hecho en `modulo-20`.

#### 3. OBJETIVO DE APRENDIZAJE

**Escribir** tests unitarios con Jest usando el patrón preparar–ejecutar–comprobar, tablas de casos y los matchers
adecuados, **sustituir** dependencias (un servicio remoto, el reloj y un módulo) por dobles de prueba y **medir** la
cobertura; lo compruebas cuando `npx jest f105-jest --selectProjects unit` pasa 16 de 16 y explicas por qué un test
sin `await` no prueba nada.

#### 4. ANALOGÍA VISUAL

Dibuja un **banco de pruebas de un taller**. La pieza que acabas de fabricar (una función) se atornilla al banco,
**separada del coche**. El técnico le aplica una entrada conocida (gira la llave 30 grados) y un **medidor** compara
lo que sale con lo que dice la ficha técnica: luz **verde** si coincide, **roja** si no, con un papelito que dice
«esperaba 220 000, recibí 198 000». Como la pieza necesita otras para funcionar (la bomba de gasolina, el reloj del
tablero), el banco las reemplaza por **piezas de utilería**: una bomba falsa que siempre entrega «4 000» y anota
cuántas veces la llamaron, y un **reloj de pared con las manecillas movibles a mano** para simular que pasó un
minuto sin esperar un minuto. Encima del banco, un **plano de la pieza con zonas coloreadas**: en verde lo que alguna
prueba recorrió, en rojo lo que ninguna tocó (la cobertura).

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    CLI["npx jest"] --> CFG["jest.config.js<br/>projects · preset ts-jest"]
    CFG --> W1["Worker 1<br/>carrito.test.ts"]
    CFG --> W2["Worker 2<br/>cotizador.test.ts"]
    W2 --> TS["ts-jest: TypeScript → JavaScript"]
    TS --> MOCK["jest.mock('./notificador')<br/>el módulo real se cambia por jest.fn()"]
    MOCK --> SUT["Cotizador (código real)"]
    DOBLE["Doble: tasas.obtener = jest.fn()"] --> SUT
    RELOJ["Reloj falso: useFakeTimers"] --> SUT
    SUT --> EXP{"expect(...).toBe(...)"}
    EXP -- "coincide" --> OK["✓ PASS"]
    EXP -- "no coincide" --> KO["✕ FAIL + diferencia"]
```

**Texto alternativo:** diagrama de flujo. La orden npx jest lee jest.config.js (proyectos y el preset ts-jest) y
reparte los archivos de test entre procesos trabajadores: uno ejecuta carrito.test.ts y otro cotizador.test.ts. En el
segundo, ts-jest convierte TypeScript en JavaScript y jest.mock sustituye el módulo notificador real por funciones
jest.fn. El código real, la clase Cotizador, recibe además un doble de su dependencia (tasas.obtener es un jest.fn) y
un reloj falso. El resultado llega a una aserción expect: si coincide, el test pasa; si no, falla y muestra la
diferencia.

#### 6. EXPLICACIÓN NIVEL 0

- Un **test** es código que llama a tu código con datos conocidos y comprueba que el resultado es el esperado.
- **Jest** es el programa que encuentra tus tests (archivos `*.test.ts`), los ejecuta y te dice cuáles pasaron
  (✓) y cuáles fallaron (✕), con la diferencia entre lo esperado y lo recibido.
- `test('nombre', () => { … })` define un test. `expect(valor).toBe(esperado)` es una **aserción**: la comprobación.
- `describe('grupo', …)` agrupa tests relacionados.
- Un **doble de prueba** es un sustituto de algo que tu código necesita pero que no quieres usar de verdad en el test
  (un servicio de otra empresa, el envío de correos, el reloj): responde lo que tú le digas.
- Un test **unitario** prueba una pieza pequeña, aislada y en milisegundos. Son la base: tendrás muchos.

#### 7. EXPLICACIÓN INTERMEDIA

- **Jest y TypeScript.** Jest ejecuta JavaScript; `preset: 'ts-jest'` compila cada `.ts` al vuelo con tu
  `tsconfig.json` y comprueba los tipos. Sin transformador, un archivo TypeScript da un `SyntaxError` (ver error
  común).
- **Ciclo de vida.** `beforeAll/afterAll` corren una vez por archivo; `beforeEach/afterEach`, antes y después de cada
  test. Crea los dobles en `beforeEach` para que ningún test herede estado de otro. Cada archivo corre en su propio
  contexto y, con varios archivos, en procesos paralelos.
- **Matchers.** `toBe` (identidad, para números y textos), `toEqual` (mismo contenido, para objetos y arreglos),
  `toMatchObject` (al menos estos campos), `toThrow`, `toBeCloseTo` (decimales), `toHaveBeenCalledWith` (para dobles)
  y `.resolves` / `.rejects` para promesas (siempre con `await`).
- **`test.each`** ejecuta el mismo test con una tabla de casos; cada fila sale con su propio nombre.
- **Dobles.** `jest.fn()` crea una función que registra sus llamadas; `mockResolvedValue(x)` la hace devolver una
  promesa con `x` (un *stub*); `toHaveBeenCalledTimes(1)` comprueba la interacción (un *mock*).
  `jest.mock('./modulo')` sustituye un módulo entero y `jest.mocked(fn)` le pone tipos. `jest.spyOn(obj, 'metodo')`
  observa un método real.
- **Reloj falso.** `jest.useFakeTimers({ now })` congela `Date.now()` y los temporizadores;
  `jest.advanceTimersByTime(ms)` adelanta el tiempo. Así pruebas una caché de 60 s en microsegundos.
- **Cobertura.** `--coverage` mide qué líneas y ramas ejecutaron los tests; `coverageThreshold` hace fallar el
  comando si baja de un mínimo.
- **Asíncronos.** Si el test es asíncrono, la función debe ser `async` y cada promesa llevar `await` (o `return`).
  El tiempo máximo por test es 5 s (`jest.setTimeout` lo cambia).

#### 8. EXPLICACIÓN MAESTRA

- **Qué merece un test unitario:** reglas de negocio con ramas (descuentos, validaciones, cálculos, máquinas de
  estados). Lo que solo conecta piezas (un controlador que llama a un repositorio) se prueba mejor un nivel más
  arriba (fichas 2 y 4): un test unitario lleno de mocks ahí solo repite la implementación.
- **Diseñar para probar.** `Cotizador` recibe `ClienteDeTasas` por el constructor: el doble entra sin trucos.
  `jest.mock` es la herramienta para cuando no puedes inyectar (código heredado, módulos de terceros); abusar de él
  acopla el test a la *ruta del archivo* importado.
- **Alternativas y trade-offs:**
  1. *`node:test`* (integrado en Node, el de los Módulos 13 a 15): cero dependencias y arranque inmediato; menos
     matchers, y los mocks de módulos y el ecosistema son más limitados.
  2. *Vitest*: API casi idéntica a la de Jest, ESM y TypeScript nativos y muy rápido en modo *watch*; es lo habitual
     en proyectos con Vite y en muchos proyectos ESM nuevos.
  3. *Jest*: el más extendido en back-end Node y el que trae configurado NestJS; con ESM puro todavía exige una
     opción experimental de Node, por eso aquí los tests se compilan a CommonJS con ts-jest.
- **Cobertura: úsala como alarma, no como meta.** 100 % de líneas ejecutadas no significa 100 % de comportamientos
  comprobados (un test sin aserciones también «cubre»). Un umbral razonable (80–90 %) evita retrocesos; exigir 100 %
  produce tests triviales. Lo que encuentra errores es probar los **límites**: 0, negativo, vacío, repetido, vencido.
- **Tests inestables (*flaky*).** Casi siempre vienen de tiempo real, orden entre tests, red o estado compartido. Un
  test que a veces falla enseña al equipo a ignorar el rojo: arréglalo o bórralo.
- **Cuándo NO usar un test unitario con dobles:** para comprobar SQL, serialización HTTP o el contrato con otro
  servicio. El doble responde lo que tú crees que responde el de verdad; si te equivocas, el test pasa y producción
  falla. Para eso están las tres fichas siguientes.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **jest 30.5.2**, **ts-jest 29.4.15**, **typescript 6.0.3**, `@types/jest`
30.0.0. Usa el `package.json`, el `jest.config.js` y el `tsconfig.json` del inicio del módulo.

`carrito.ts`:

```typescript
// Módulo 16 · F105 · Jest: lógica PURA (sin red, sin reloj, sin base de datos). Es lo más fácil y barato de probar.
// Requisitos: Node.js 26.13.1 LTS, jest 30.5.2, ts-jest 29.4.15, typescript 6.0.3.
export interface Item {
  sku: string;
  precio: number; // en la moneda base (COP), sin decimales
  cantidad: number;
}

export const CUPONES: Record<string, number> = { BIENVENIDA: 0.1, VIP: 0.2 };

export function calcularTotal(items: Item[], cupon?: string): number {
  if (items.length === 0) throw new RangeError('El carrito está vacío');
  for (const { sku, cantidad } of items) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) throw new RangeError(`Cantidad inválida para ${sku}`);
  }
  const subtotal = items.reduce((suma, { precio, cantidad }) => suma + precio * cantidad, 0);
  const descuento = cupon ? (CUPONES[cupon] ?? 0) : 0;
  return Math.round(subtotal * (1 - descuento));
}
```

`notificador.ts`:

```typescript
// Módulo 16 · F105 · Un módulo con efecto externo (en la vida real enviaría un correo). En los tests se reemplaza con jest.mock.
export async function enviarCorreo(destino: string, asunto: string): Promise<void> {
  throw new Error(`Sin servidor de correo configurado: no se pudo enviar «${asunto}» a ${destino}`);
}
```

`cotizador.ts`:

```typescript
// Módulo 16 · F105 · Código CON dependencias: un servicio de tasas de cambio (red), el reloj y un notificador.
import { calcularTotal, type Item } from './carrito';
import { enviarCorreo } from './notificador';

// La dependencia se recibe por el constructor (inyección): en producción será un cliente HTTP; en el test, un doble.
export interface ClienteDeTasas {
  obtener(moneda: string): Promise<number>; // cuántos COP vale 1 unidad de `moneda`
}

const VIGENCIA_MS = 60_000;

export class Cotizador {
  private cache = new Map<string, { tasa: number; hasta: number }>();

  constructor(private readonly tasas: ClienteDeTasas) {}

  // Convierte el total del carrito a otra moneda. Guarda cada tasa 60 s para no llamar al servicio en cada petición.
  async cotizar(items: Item[], moneda: string): Promise<number> {
    const total = calcularTotal(items);
    const tasa = await this.tasaVigente(moneda);
    return Math.round((total / tasa) * 100) / 100;
  }

  async cotizarYAvisar(items: Item[], moneda: string, correo: string): Promise<number> {
    const valor = await this.cotizar(items, moneda);
    await enviarCorreo(correo, `Tu cotización: ${valor} ${moneda}`);
    return valor;
  }

  private async tasaVigente(moneda: string): Promise<number> {
    const guardada = this.cache.get(moneda);
    if (guardada && guardada.hasta > Date.now()) return guardada.tasa;
    const tasa = await this.tasas.obtener(moneda);
    if (tasa <= 0) throw new Error(`Tasa inválida para ${moneda}`);
    this.cache.set(moneda, { tasa, hasta: Date.now() + VIGENCIA_MS });
    return tasa;
  }
}
```

#### 10. MINI-LABORATORIO

1. Instala las dependencias fijadas (una vez para todo el módulo) y ejecuta los tests de esta ficha:
   ```bash
   npm ci
   npx jest f105-jest --selectProjects unit --verbose
   ```
2. Mide la cobertura de los tests unitarios del módulo:
   ```bash
   npm run test:cobertura
   ```
3. Rompe el código a propósito: en `f105-jest/src/carrito.ts` cambia `BIENVENIDA: 0.1` por `BIENVENIDA: 0.15`,
   repite el paso 1, lee el fallo y **deshaz el cambio**.

**Output esperado** (paso 1, salida real con Node 26.13.1 y jest 30.5.2; los milisegundos cambian):

```text
PASS unit f105-jest/src/cotizador.test.ts
  Cotizador
    ✓ convierte el total con la tasa del servicio (stub: respuesta preparada) (4 ms)
    ✓ si el servicio de tasas falla, el error llega a quien llama (8 ms)
    ✓ guarda la tasa 60 s: dos cotizaciones seguidas hacen UNA llamada (reloj falso) (3 ms)
    ✓ rechaza una tasa inválida y no la guarda (1 ms)
    ✓ cotizarYAvisar envía el correo con el valor (módulo simulado con jest.mock)
    ✓ jest.spyOn observa un método real sin reemplazarlo

PASS unit f105-jest/src/carrito.test.ts
  calcularTotal
    ✓ suma precio × cantidad de cada item (1 ms)
    ✓ con el cupón BIENVENIDA el total es 198000 (1 ms)
    ✓ con el cupón VIP el total es 176000
    ✓ con el cupón NO-EXISTE el total es 220000 (1 ms)
    ✓ con el cupón undefined el total es 220000
    ✓ rechaza un carrito vacío (3 ms)
    ✓ rechaza la cantidad 0 (2 ms)
    ✓ rechaza la cantidad -1 (1 ms)
    ✓ rechaza la cantidad 1.5 (1 ms)
    ✓ toBe compara identidad; toEqual compara contenido (1 ms)

Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        1.385 s, estimated 2 s
Ran all test suites matching f105-jest.
```

**Output esperado** (paso 2, salida real; incluye también los tests de la ficha de Supertest):

```text
PASS unit f106-supertest/src/app.test.ts
PASS unit f105-jest/src/cotizador.test.ts
PASS unit f105-jest/src/carrito.test.ts
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
--------------------|---------|----------|---------|---------|-------------------
All files           |   98.59 |    95.12 |   93.33 |   98.24 |                   
 f105-jest/src      |   96.96 |      100 |   85.71 |   96.42 |                   
  carrito.ts        |     100 |      100 |     100 |     100 |                   
  cotizador.ts      |     100 |      100 |     100 |     100 |                   
  notificador.ts    |      50 |      100 |       0 |      50 | 3                 
 f106-supertest/src |     100 |       92 |     100 |     100 |                   
  app.ts            |     100 |       92 |     100 |     100 | 17,39             
--------------------|---------|----------|---------|---------|-------------------

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
```

**Output esperado** (paso 3): el test «con el cupón BIENVENIDA el total es 198000» sale con `✕` y Jest muestra
`Expected: 198000` y `Received: 187000`; los otros 15 siguen en verde.

**Captura comentada:** cada fila de `test.each` aparece como un test con su nombre, así sabes qué caso falló. En la
tabla de cobertura, `notificador.ts` tiene la línea 3 sin cubrir **a propósito**: es el envío real de correo, que
`jest.mock` sustituyó; el doble demuestra que `Cotizador` lo llama bien, no que el correo funcione. Las ramas sin
cubrir de `app.ts` (líneas 17 y 39) son valores por defecto que ningún test ejercita: la columna «Uncovered» te dice
exactamente dónde mirar.

#### 11. VERIFICACIÓN

```bash
npx jest f105-jest --selectProjects unit
```

Debe terminar en `Tests:       16 passed, 16 total`. Los tests:

`f105-jest/src/carrito.test.ts`:

```typescript
// Verificación F105 (lógica pura): npx jest f105-jest/src/carrito.test.ts --selectProjects unit
import { calcularTotal, type Item } from './carrito';

const teclado: Item = { sku: 'TEC-001', precio: 120000, cantidad: 1 };
const mouse: Item = { sku: 'MOU-001', precio: 50000, cantidad: 2 };

describe('calcularTotal', () => {
  // Patrón AAA: Arrange (preparar), Act (ejecutar), Assert (comprobar).
  test('suma precio × cantidad de cada item', () => {
    const items = [teclado, mouse]; // Arrange
    const total = calcularTotal(items); // Act
    expect(total).toBe(220000); // Assert
  });

  // test.each: la misma prueba con una tabla de casos. Cada fila aparece como un test con su nombre.
  test.each([
    ['BIENVENIDA', 198000],
    ['VIP', 176000],
    ['NO-EXISTE', 220000],
    [undefined, 220000],
  ])('con el cupón %s el total es %i', (cupon, esperado) => {
    expect(calcularTotal([teclado, mouse], cupon)).toBe(esperado);
  });

  test('rechaza un carrito vacío', () => {
    // Para comprobar una excepción se pasa una FUNCIÓN: si llamaras calcularTotal([]) directamente, el error mataría al test.
    expect(() => calcularTotal([])).toThrow(RangeError);
    expect(() => calcularTotal([])).toThrow('El carrito está vacío');
  });

  test.each([0, -1, 1.5])('rechaza la cantidad %p', (cantidad) => {
    expect(() => calcularTotal([{ ...teclado, cantidad }])).toThrow('Cantidad inválida para TEC-001');
  });

  test('toBe compara identidad; toEqual compara contenido', () => {
    const copia = { ...teclado };
    expect(copia).not.toBe(teclado); // son dos objetos distintos
    expect(copia).toEqual(teclado); // con el mismo contenido
    expect(copia).toMatchObject({ sku: 'TEC-001' }); // «al menos estos campos»
    expect(0.1 + 0.2).toBeCloseTo(0.3); // decimales: nunca toBe
  });
});
```

`f105-jest/src/cotizador.test.ts`:

```typescript
// Verificación F105 (dobles de prueba): npx jest f105-jest/src/cotizador.test.ts --selectProjects unit
import { Cotizador, type ClienteDeTasas } from './cotizador';
import { enviarCorreo } from './notificador';

// jest.mock reemplaza TODO el módulo por funciones simuladas (jest.fn) antes de que cotizador.ts lo importe.
jest.mock('./notificador');
const enviarCorreoMock = jest.mocked(enviarCorreo);

const items = [{ sku: 'TEC-001', precio: 120000, cantidad: 1 }];

describe('Cotizador', () => {
  let tasas: jest.Mocked<ClienteDeTasas>;
  let cotizador: Cotizador;

  beforeEach(() => {
    // Un doble por test: ningún test hereda llamadas ni respuestas de otro.
    tasas = { obtener: jest.fn() };
    cotizador = new Cotizador(tasas);
    enviarCorreoMock.mockReset();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('convierte el total con la tasa del servicio (stub: respuesta preparada)', async () => {
    tasas.obtener.mockResolvedValue(4000); // 1 USD = 4000 COP
    await expect(cotizador.cotizar(items, 'USD')).resolves.toBe(30);
    expect(tasas.obtener).toHaveBeenCalledWith('USD'); // mock: además verificamos CÓMO lo llamaron
  });

  test('si el servicio de tasas falla, el error llega a quien llama', async () => {
    tasas.obtener.mockRejectedValue(new Error('503 del servicio de tasas'));
    await expect(cotizador.cotizar(items, 'USD')).rejects.toThrow('503 del servicio de tasas');
  });

  test('guarda la tasa 60 s: dos cotizaciones seguidas hacen UNA llamada (reloj falso)', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-19T10:00:00Z') });
    tasas.obtener.mockResolvedValueOnce(4000).mockResolvedValueOnce(5000);

    expect(await cotizador.cotizar(items, 'USD')).toBe(30);
    jest.advanceTimersByTime(59_000); // pasan 59 s: la tasa sigue vigente
    expect(await cotizador.cotizar(items, 'USD')).toBe(30);
    expect(tasas.obtener).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(2_000); // 61 s: venció
    expect(await cotizador.cotizar(items, 'USD')).toBe(24);
    expect(tasas.obtener).toHaveBeenCalledTimes(2);
  });

  test('rechaza una tasa inválida y no la guarda', async () => {
    tasas.obtener.mockResolvedValueOnce(0).mockResolvedValueOnce(4000);
    await expect(cotizador.cotizar(items, 'USD')).rejects.toThrow('Tasa inválida para USD');
    await expect(cotizador.cotizar(items, 'USD')).resolves.toBe(30);
  });

  test('cotizarYAvisar envía el correo con el valor (módulo simulado con jest.mock)', async () => {
    tasas.obtener.mockResolvedValue(4000);
    await cotizador.cotizarYAvisar(items, 'USD', 'ana@correo.co');
    expect(enviarCorreoMock).toHaveBeenCalledTimes(1);
    expect(enviarCorreoMock).toHaveBeenCalledWith('ana@correo.co', 'Tu cotización: 30 USD');
  });

  test('jest.spyOn observa un método real sin reemplazarlo', async () => {
    tasas.obtener.mockResolvedValue(4000);
    const espia = jest.spyOn(Math, 'round');
    await cotizador.cotizar(items, 'USD');
    expect(espia).toHaveBeenCalled();
    espia.mockRestore();
  });
});
```

**Pregunta de comprobación:** en el test del reloj falso, ¿por qué la tercera cotización da 24 y no 30? (Respuesta:
pasaron 61 s, la tasa guardada venció y `Cotizador` volvió a llamar al doble, que la segunda vez responde 5000:
120 000 / 5000 = 24. Si la caché no venciera nunca, el test fallaría con `Received: 30`.)

#### 12. ERROR COMÚN

**Síntoma:** un test con código asíncrono «pasa» aunque la aserción es falsa, o Jest se cae con un error que no
nombra ningún test. `f105-jest/error-comun/sin-await.test.ts`:

```typescript
// ERROR COMÚN F105: una aserción dentro de una promesa que nadie espera (falta await o return).
// Ejecuta: npx jest sin-await --selectProjects errores
import { Cotizador } from '../src/cotizador';

const items = [{ sku: 'TEC-001', precio: 120000, cantidad: 1 }];
const cotizador = new Cotizador({ obtener: async () => 4000 });

test('MAL: el test termina antes de que se ejecute la aserción', () => {
  cotizador.cotizar(items, 'USD').then((valor) => {
    expect(valor).toBe(999); // 30 no es 999, pero esto corre cuando el test YA terminó
  });
});
```

**Cómo se ve** (salida real de `npx jest sin-await --selectProjects errores`, Node 26.13.1 y jest 30.5.2; código de
salida 1):

```text
…/modulo-20/f105-jest/error-comun/sin-await.test.ts:10
        expect(valor).toBe(999); // 30 no es 999, pero esto corre cuando el test YA terminó
                      ^

JestAssertionError: expect(received).toBe(expected) // Object.is equality

Expected: 999
Received: 30
    at …/modulo-20/f105-jest/error-comun/sin-await.test.ts:10:19 {
  matcherResult: {
    actual: 30,
    expected: 999,
    …
  }
}

Node.js v26.13.1
```

**Diagnóstico visual:** fíjate en lo que **falta**: no hay línea `PASS`/`FAIL`, ni nombre de test, ni resumen
`Tests:`. La aserción se ejecutó cuando el test ya había terminado, fuera del control de Jest; su fallo se convirtió
en una promesa rechazada sin dueño y Node cerró el proceso. **Arreglo:** función `async` y `await` delante de la
promesa (`const valor = await cotizador.cotizar(…)`), o `await expect(promesa).resolves.toBe(30)`.

**Variante silenciosa: el falso verde.** `f105-jest/error-comun/falso-verde.test.ts` espera un error con
`try/catch`; como el error no ocurre, no se ejecuta ninguna aserción y el test pasa:

```typescript
// ERROR COMÚN F105 (variante): el «falso verde». Ejecuta: npx jest falso-verde --selectProjects errores
import { Cotizador } from '../src/cotizador';

const items = [{ sku: 'TEC-001', precio: 120000, cantidad: 1 }];
const cotizador = new Cotizador({ obtener: async () => 4000 }); // la tasa es VÁLIDA: cotizar no lanza

test('MAL: espera un error con try/catch; como no hay error, no se ejecuta ninguna aserción y sale en verde', async () => {
  try {
    await cotizador.cotizar(items, 'USD');
  } catch (error) {
    expect((error as Error).message).toBe('Tasa inválida para USD');
  }
});

test('BIEN: expect.assertions(1) exige que la aserción se ejecute', async () => {
  expect.assertions(1);
  try {
    await cotizador.cotizar(items, 'USD');
  } catch (error) {
    expect((error as Error).message).toBe('Tasa inválida para USD');
  }
});
```

Salida real de `npx jest falso-verde --selectProjects errores`:

```text
FAIL errores f105-jest/error-comun/falso-verde.test.ts
  ✓ MAL: espera un error con try/catch; como no hay error, no se ejecuta ninguna aserción y sale en verde (1 ms)
  ✕ BIEN: expect.assertions(1) exige que la aserción se ejecute (1 ms)

  ● BIEN: expect.assertions(1) exige que la aserción se ejecute

    expect.assertions(1)

    Expected one assertion to be called but received zero assertion calls.
```

El primer test es **verde y no comprueba nada**. `expect.assertions(n)` lo delata; mejor aún, escribe
`await expect(promesa).rejects.toThrow('…')`, que falla si la promesa no se rechaza.

**Y el error de instalación más frecuente:** ejecutar Jest sobre TypeScript sin `preset: 'ts-jest'`. Mensaje real:

```text
SyntaxError: …/modulo-20/f105-jest/src/carrito.test.ts: Unexpected token, expected "," (2:29)
```

Jest intentó leer el archivo como JavaScript y tropezó con la primera sintaxis de tipos. Revisa que el `preset` esté
en el *project* que ejecuta ese archivo.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué diferencia hay entre un stub, un mock y un spy? ¿Cuándo es mala idea usar mocks?»

**Respuesta modelo:** los tres son dobles de prueba. Un *stub* devuelve respuestas preparadas para que el código bajo
prueba pueda continuar (`mockResolvedValue(4000)`); compruebo el resultado final. Un *mock* además verifica la
interacción: que lo llamaron, cuántas veces y con qué argumentos (`toHaveBeenCalledWith`); lo uso cuando el efecto
*es* la llamada, como enviar un correo. Un *spy* envuelve una función real para observarla sin cambiar su
comportamiento. Es mala idea usarlos cuando acaban describiendo la implementación en lugar del comportamiento (el
test se rompe con cada refactor aunque nada cambió para el usuario) y cuando sustituyen justo lo que quiero
comprobar: mockear la base de datos para «probar» una consulta SQL, o el cliente HTTP para «probar» el contrato con
otro servicio. Ahí uso una base real en contenedor o un test de contrato. Regla práctica: doblo lo que es lento, no
determinista o ajeno (red, reloj, terceros), no mis propias clases.

#### 14. ANTI-PATRÓN RELACIONADO

**Probar el doble** (*testing the mock*): el test configura un mock y después afirma lo que el propio mock devuelve.
Ninguna línea de tu código puede hacerlo fallar.

```typescript
// ❌ ¿Qué código de producción se ejecuta aquí? Ninguno: se comprueba que jest.fn devuelve lo que se le pidió.
test('obtiene la tasa', async () => {
  const tasas = { obtener: jest.fn().mockResolvedValue(4000) };
  expect(await tasas.obtener('USD')).toBe(4000);
  expect(tasas.obtener).toHaveBeenCalledWith('USD');
});

// ✅ El doble alimenta al código real, y la aserción es sobre lo que el código real calcula con él.
test('convierte 120000 COP a 30 USD', async () => {
  const cotizador = new Cotizador({ obtener: jest.fn().mockResolvedValue(4000) });
  await expect(cotizador.cotizar([{ sku: 'TEC-001', precio: 120000, cantidad: 1 }], 'USD')).resolves.toBe(30);
});
```

**Cómo se ve:** la suite está en verde con una cobertura alta y aun así los errores llegan a producción; borras una
línea del código real y ningún test falla (esa es la prueba rápida: rompe el código y mira si alguien se queja); los
tests tienen más líneas de `mockReturnValue` que de `expect`. Su pariente es el **test de instantáneas gigante**
(`toMatchSnapshot` sobre un objeto de 300 líneas): cuando falla, todos ejecutan `--updateSnapshot` sin leer la
diferencia.

---

### Supertest

#### 1. UBICACIÓN

Módulo 16, Lección 2 de 4 · Fase 2.

#### 2. PRERREQUISITOS

- Ficha anterior (Jest: `test`, `expect`, `beforeEach`, dobles).
- Una API con Express: rutas, middleware, manejo de errores y códigos de estado (Módulo 14).
- `npm ci` hecho en `modulo-20`.

#### 3. OBJETIVO DE APRENDIZAJE

**Probar** una API de Express de extremo a extremo dentro del proceso de test (ruta, middleware, validación,
serialización y manejo de errores) con Supertest, **comprobando** estado, cabeceras y cuerpo, sin abrir un puerto
fijo; lo compruebas cuando `npx jest f106-supertest --selectProjects unit` pasa 8 de 8 y sabes por qué la app y el
`listen` viven en archivos distintos.

#### 4. ANALOGÍA VISUAL

Dibuja un **restaurante en la noche de ensayo general**, antes de abrir al público. La puerta de la calle está
cerrada (no hay puerto abierto), pero dentro todo funciona de verdad: el camarero, la cocina, la caja. Un **cliente
de prueba** (Supertest) está sentado en una mesa *dentro* del local y hace pedidos reales: «la carta, por favor»
(GET), «quiero añadir este plato al menú» (POST), un pedido absurdo a propósito, un pedido sin identificarse. Anota
en una libreta tres cosas de cada respuesta: **el gesto del camarero** (el código de estado: 200, 404, 401), **la
nota que acompaña el plato** (las cabeceras) y **lo que hay en el plato** (el cuerpo JSON). La despensa es de
utilería (el repositorio en memoria), pero el recorrido de la comanda por el local es el real. Comparado con probar
al cocinero a solas (un test unitario del handler), aquí se descubre si el camarero entiende mal la comanda.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant T as Test (Jest)
    participant S as Supertest
    participant A as app de Express (crearApp)
    participant R as Repositorio en memoria
    T->>S: request(app).post('/productos').set(...).send({...})
    S->>A: abre un puerto efímero y envía HTTP real por 127.0.0.1
    A->>A: express.json() → ¿x-api-key? → validación
    A->>R: guardar(producto)
    R-->>A: ok
    A-->>S: 201 · Location: /productos/MOU-001 · JSON
    S-->>T: respuesta { status, headers, body }
    T->>T: expect(respuesta.status).toBe(201)
    Note over S,A: al terminar la petición, Supertest cierra el puerto
```

**Texto alternativo:** diagrama de secuencia con cuatro participantes: el test de Jest, Supertest, la app de Express
creada con crearApp y un repositorio en memoria. El test llama a request(app).post('/productos') con cabeceras y
cuerpo. Supertest abre un puerto efímero y envía una petición HTTP real por 127.0.0.1 a la app. La app pasa el cuerpo
por express.json(), comprueba la cabecera x-api-key y valida los datos; después llama a guardar en el repositorio,
que responde ok. La app devuelve 201 con la cabecera Location y un JSON. Supertest entrega al test un objeto con
status, headers y body, y el test hace sus aserciones. Una nota indica que al terminar la petición Supertest cierra
el puerto.

#### 6. EXPLICACIÓN NIVEL 0

- Una API recibe **peticiones HTTP** y devuelve **respuestas** con un código de estado (200 bien, 404 no existe…),
  cabeceras y un cuerpo, casi siempre JSON.
- Podrías probarla a mano con `curl` cada vez que cambias algo. **Supertest** es una librería que hace esas
  peticiones desde un test y te deja comprobar la respuesta con `expect`.
- No necesitas arrancar el servidor en otra terminal: le pasas tu aplicación a `request(app)` y Supertest se encarga
  de encenderla un instante para esa petición.
- Así pruebas lo que de verdad ve quien consume tu API: la URL, el código, el JSON.

#### 7. EXPLICACIÓN INTERMEDIA

- **Separa la app del servidor.** `crearApp()` construye y **devuelve** la aplicación de Express; solo `servidor.ts`
  llama a `listen(puerto)`. Los tests importan `crearApp`, nunca `servidor.ts`.
- **Cómo funciona.** `request(app)` hace `app.listen(0)`: el puerto 0 pide al sistema operativo un puerto libre
  cualquiera. La petición viaja por HTTP real en tu máquina, de modo que se ejercitan el enrutamiento, el *parser*
  de JSON, los middleware y tu manejador de errores, igual que en producción.
- **Construir la petición:** `.get(ruta)`, `.post(ruta)`, `.set(cabecera, valor)`, `.query({…})`, `.send(objeto)`
  (lo serializa como JSON y pone `Content-Type`).
- **Comprobar la respuesta**, de dos maneras que puedes mezclar: con Jest (`const r = await request(app).get(…)`;
  `expect(r.status)`, `expect(r.body)`, `expect(r.headers[...])`) o con el encadenado de Supertest
  (`.expect(404)`, `.expect('Content-Type', /json/)`, `.expect(200, cuerpoEsperado)`).
- **Siempre `await`** (o `return`) la cadena: es una promesa. Sin él cometes el error común de la ficha de Jest.
- **Aislamiento.** Crea la app y sus datos en `beforeEach`: cada test parte del mismo estado y no depende del orden.
- **Qué se inyecta.** El repositorio entra por parámetro: en estos tests es uno en memoria; para simular una caída
  de la base basta un doble cuyo `buscar` rechaza la promesa.

#### 8. EXPLICACIÓN MAESTRA

- **Dónde encaja.** Un test con Supertest es de *componente*: el servicio entero por su puerta HTTP, con sus
  dependencias externas sustituidas. Es el mejor sitio para comprobar códigos de estado, validación, formato de
  errores, autenticación y cabeceras: cosas que un test unitario del handler no ve y que un test de extremo a extremo
  comprueba muy caro.
- **Alternativas y trade-offs:**
  1. *`fetch` contra un servidor que tú levantas* en `beforeAll` (`app.listen(0)`) y cierras en `afterAll`: sin
     dependencia extra y usando el cliente estándar; escribes tú la gestión del ciclo de vida.
  2. *Inyección sin red* (`fastify.inject()` en Fastify): más rápido, no pasa por el sistema de sockets; no existe
     de serie en Express.
  3. *`@nestjs/testing` + Supertest*: en NestJS levantas el módulo con `Test.createTestingModule` y pasas
     `app.getHttpServer()` a `request()`; puedes sobrescribir *providers* con dobles.
  4. *Tests de extremo a extremo* contra el entorno desplegado: prueban la configuración real, pero son lentos,
     frágiles y difíciles de diagnosticar; reserva unos pocos para los flujos críticos.
- **¿Repositorio en memoria o base real?** En memoria: rapidísimo, prueba la capa HTTP. Base real (ficha 4): prueba
  también el SQL. Una combinación sana: la mayoría de los casos HTTP con repositorio en memoria y un puñado de casos
  con Supertest **y** Testcontainers juntos.
- **Cuándo NO usarlo:** para reglas de negocio con muchas combinaciones (pruébalas en la función, con `test.each`;
  por HTTP solo un caso feliz y uno de error) y para comprobar que **otro** servicio responde lo que esperas (eso es
  un contrato, ficha 3).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **express 5.3.0**, **supertest 7.3.2** (`@types/supertest` 7.2.1), **jest
30.5.2**, **ts-jest 29.4.15**, **typescript 6.0.3**. Usa el `package.json`, el `jest.config.js` y el `tsconfig.json`
del inicio del módulo.

`app.ts`:

```typescript
// Módulo 16 · F106 · Supertest: la API se construye en una función que NO abre ningún puerto.
// Requisitos: Node.js 26.13.1 LTS, express 5.3.0, supertest 7.3.2, jest 30.5.2, ts-jest 29.4.15.
import express, { type ErrorRequestHandler, type Express } from 'express';

export interface Producto {
  sku: string;
  nombre: string;
  precio: number;
}

// El repositorio llega como parámetro: el test pasa uno en memoria; producción, uno con base de datos.
export interface Repositorio {
  buscar(sku: string): Promise<Producto | undefined>;
  guardar(producto: Producto): Promise<void>;
}

export function repositorioEnMemoria(iniciales: Producto[] = []): Repositorio {
  const datos = new Map(iniciales.map((p) => [p.sku, p]));
  return {
    buscar: async (sku) => datos.get(sku),
    guardar: async (producto) => {
      datos.set(producto.sku, producto);
    },
  };
}

export function crearApp(repositorio: Repositorio): Express {
  const app = express();
  app.use(express.json());

  app.get('/productos/:sku', async (req, res) => {
    const producto = await repositorio.buscar(req.params.sku);
    if (!producto) return res.status(404).json({ error: `No existe el producto ${req.params.sku}` });
    res.json(producto);
  });

  app.post('/productos', async (req, res) => {
    if (req.get('x-api-key') !== 'clave-de-prueba') return res.status(401).json({ error: 'Falta la cabecera x-api-key' });
    const { sku, nombre, precio } = req.body ?? {};
    const errores: string[] = [];
    if (typeof sku !== 'string' || !/^[A-Z]{3}-\d{3}$/.test(sku)) errores.push('sku debe tener la forma ABC-123');
    if (typeof nombre !== 'string' || nombre.length < 3) errores.push('nombre debe tener al menos 3 letras');
    if (typeof precio !== 'number' || precio <= 0) errores.push('precio debe ser un número mayor que 0');
    if (errores.length > 0) return res.status(400).json({ errores });
    if (await repositorio.buscar(sku)) return res.status(409).json({ error: `Ya existe el producto ${sku}` });
    await repositorio.guardar({ sku, nombre, precio });
    res.status(201).location(`/productos/${sku}`).json({ sku, nombre, precio });
  });

  // Express 5 envía aquí los errores de los handlers async (por ejemplo, si el repositorio lanza).
  const manejarErrores: ErrorRequestHandler = (error, _req, res, _next) => {
    // express.json() marca así un cuerpo que no es JSON válido: es culpa del cliente (400), no del servidor.
    if (error?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON mal formado' });
    res.status(500).json({ error: 'Error interno' }); // nunca devuelvas el mensaje o la traza del error real
  };
  app.use(manejarErrores);

  return app;
}
```

`servidor.ts`:

```typescript
// Módulo 16 · F106 · El ÚNICO archivo que abre un puerto. Los tests no lo importan nunca: importan crearApp de app.ts.
// En producción se compila con tsc y se ejecuta el JavaScript resultante (Módulo 23).
import { crearApp, repositorioEnMemoria } from './app';

const puerto = Number(process.env.PORT ?? 3106);
crearApp(repositorioEnMemoria([{ sku: 'TEC-001', nombre: 'Teclado', precio: 120000 }])).listen(puerto, () => {
  console.log(`API de productos en http://localhost:${puerto}`);
});
```

#### 10. MINI-LABORATORIO

1. Ejecuta los tests de la API:
   ```bash
   npx jest f106-supertest --selectProjects unit --verbose
   ```
2. Rompe la API a propósito: en `f106-supertest/src/app.ts` cambia `res.status(201)` por `res.status(200)`, repite el
   paso 1, lee qué test falla y **deshaz el cambio**.
3. Provoca el error común de la ficha (dos archivos de test que importan una app que abre un puerto fijo):
   ```bash
   npx jest puerto- --selectProjects errores --forceExit
   ```

**Output esperado** (paso 1, salida real con Node 26.13.1, jest 30.5.2 y supertest 7.3.2; los milisegundos cambian):

```text
PASS unit f106-supertest/src/app.test.ts
  API de productos
    ✓ GET /productos/:sku → 200 con el JSON del producto (33 ms)
    ✓ GET de un sku que no existe → 404 con mensaje (11 ms)
    ✓ POST válido → 201, cabecera Location y el producto queda consultable (12 ms)
    ✓ POST sin x-api-key → 401 (4 ms)
    ✓ POST inválido → 400 con un mensaje por campo (3 ms)
    ✓ POST de un sku repetido → 409 (3 ms)
    ✓ JSON mal formado → 400 (no 500) (4 ms)
    ✓ si el repositorio falla → 500 sin filtrar el mensaje interno (doble que lanza) (5 ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        2.255 s
Ran all test suites matching f106-supertest.
```

**Output esperado** (paso 2): falla solo «POST válido → 201, cabecera Location y el producto queda consultable», con
`Expected: 201` y `Received: 200`; los otros 7 siguen en verde.

**Output esperado** (paso 3): ver la sección 12.

**Captura comentada:** cada test tarda milisegundos aunque hace HTTP de verdad. El último usa un repositorio doble
que lanza `base caída`: la respuesta es `{"error":"Error interno"}`, sin el mensaje real. Eso también es un
requisito que el test protege: los detalles internos no deben salir por la API.

#### 11. VERIFICACIÓN

```bash
npx jest f106-supertest --selectProjects unit
```

Debe terminar en `Tests:       8 passed, 8 total`. El test (`f106-supertest/src/app.test.ts`):

```typescript
// Verificación F106: npx jest f106-supertest --selectProjects unit
import request from 'supertest';
import { crearApp, repositorioEnMemoria, type Repositorio } from './app';

const teclado = { sku: 'TEC-001', nombre: 'Teclado', precio: 120000 };

describe('API de productos', () => {
  let app: ReturnType<typeof crearApp>;

  beforeEach(() => {
    // App y datos NUEVOS en cada test: el orden de los tests no importa.
    app = crearApp(repositorioEnMemoria([teclado]));
  });

  test('GET /productos/:sku → 200 con el JSON del producto', async () => {
    // request(app) levanta la app en un puerto efímero, hace la petición y lo cierra.
    const respuesta = await request(app).get('/productos/TEC-001');
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toEqual(teclado);
  });

  test('GET de un sku que no existe → 404 con mensaje', async () => {
    // Estilo encadenado: .expect() de Supertest comprueba estado, cabeceras y cuerpo.
    await request(app).get('/productos/XXX-999').expect(404).expect('Content-Type', /json/).expect({ error: 'No existe el producto XXX-999' });
  });

  test('POST válido → 201, cabecera Location y el producto queda consultable', async () => {
    const mouse = { sku: 'MOU-001', nombre: 'Mouse', precio: 50000 };
    const creado = await request(app).post('/productos').set('x-api-key', 'clave-de-prueba').send(mouse);
    expect(creado.status).toBe(201);
    expect(creado.headers.location).toBe('/productos/MOU-001');
    await request(app).get(creado.headers.location).expect(200, mouse);
  });

  test('POST sin x-api-key → 401', async () => {
    await request(app).post('/productos').send(teclado).expect(401);
  });

  test('POST inválido → 400 con un mensaje por campo', async () => {
    const respuesta = await request(app).post('/productos').set('x-api-key', 'clave-de-prueba').send({ sku: 'x', nombre: 'TV', precio: -1 });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores).toEqual([
      'sku debe tener la forma ABC-123',
      'nombre debe tener al menos 3 letras',
      'precio debe ser un número mayor que 0',
    ]);
  });

  test('POST de un sku repetido → 409', async () => {
    await request(app).post('/productos').set('x-api-key', 'clave-de-prueba').send(teclado).expect(409);
  });

  test('JSON mal formado → 400 (no 500)', async () => {
    const respuesta = await request(app).post('/productos').set('x-api-key', 'clave-de-prueba').set('Content-Type', 'application/json').send('{"sku": ');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual({ error: 'JSON mal formado' });
  });

  test('si el repositorio falla → 500 sin filtrar el mensaje interno (doble que lanza)', async () => {
    const roto: Repositorio = { buscar: jest.fn().mockRejectedValue(new Error('base caída')), guardar: jest.fn() };
    await request(crearApp(roto)).get('/productos/TEC-001').expect(500, { error: 'Error interno' });
  });
});
```

**Pregunta de comprobación:** el test «POST válido» hace un `GET` después del `POST`. ¿Qué error dejaría pasar si no
lo hiciera? (Respuesta: una API que responde 201 y el JSON correcto pero **no guarda** nada. Comprobar el efecto
observable por la propia API, y no mirando dentro del repositorio, mantiene el test válido aunque cambies cómo se
guarda.)

#### 12. ERROR COMÚN

**Síntoma:** al añadir un segundo archivo de tests, uno de los dos empieza a fallar antes de ejecutar nada, y Jest no
termina. La causa es el archivo que crea la app y, además, abre el puerto.
`f106-supertest/error-comun/app-que-escucha.ts`:

```typescript
// ERROR COMÚN F106: el mismo archivo crea la app Y abre el puerto. Cada archivo de test que lo importe intentará abrir el 3106.
import express from 'express';

export const app = express();
app.get('/salud', (_req, res) => res.json({ ok: true }));
app.listen(3106);
```

Lo importan dos archivos idénticos, `puerto-uno.test.ts` y `puerto-dos.test.ts`:

```typescript
// ERROR COMÚN F106 · Ejecuta: npx jest puerto- --selectProjects errores --forceExit
import request from 'supertest';
import { app } from './app-que-escucha';

test('salud (uno)', async () => {
  await request(app).get('/salud').expect(200, { ok: true });
});
```

**Cómo se ve** (salida real de `npx jest puerto- --selectProjects errores --forceExit`; cuál de los dos archivos
falla depende de cuál arranque primero):

```text
PASS errores f106-supertest/error-comun/puerto-dos.test.ts
FAIL errores f106-supertest/error-comun/puerto-uno.test.ts

  ● Test suite failed to run

    listen EADDRINUSE: address already in use 0.0.0.0:3106

      4 | export const app = express();
      5 | app.get('/salud', (_req, res) => res.json({ ok: true }));
    > 6 | app.listen(3106);
        |     ^
      7 |

      at app.listen (node_modules/express/lib/application.js:605:24)
      at Object.<anonymous> (f106-supertest/error-comun/app-que-escucha.ts:6:5)
      at Object.<anonymous> (f106-supertest/error-comun/puerto-uno.test.ts:3:1)

Test Suites: 1 failed, 1 passed, 2 total
Tests:       2 passed, 2 total
Force exiting Jest: Have you considered using `--detectOpenHandles` to detect async operations that kept running after all tests finished?
```

Sin `--forceExit`, en lugar de la última línea Jest se queda colgado tras este aviso (salida real):

```text
Jest did not exit one second after the test run has completed.

'This usually means that there are asynchronous operations that weren't stopped in your tests. Consider running Jest with `--detectOpenHandles` to troubleshoot this issue.
```

**Diagnóstico visual:** `EADDRINUSE` significa «ese puerto ya tiene dueño»: cada archivo de test carga el módulo de
nuevo y cada carga ejecuta `listen(3106)`. El «did not exit» es la otra cara: el servidor que sí logró abrir el
puerto sigue encendido y mantiene vivo el proceso. **Arreglo:** exporta una función que construye la app
(`crearApp`) y deja el `listen` en un archivo aparte que los tests no importan; Supertest abrirá y cerrará un puerto
efímero por petición. `--forceExit` es un parche para el laboratorio, no una solución.

#### 13. PREGUNTA DE ENTREVISTA

«¿Por qué separar la creación de la app de Express de la llamada a `listen`? ¿Qué pruebas con Supertest que no
pruebas con un test unitario del controlador?»

**Respuesta modelo:** si el módulo que exporta la app también hace `listen`, importarlo tiene un efecto secundario:
ocupa un puerto fijo. Dos archivos de test en paralelo chocan con `EADDRINUSE` y el proceso de test no termina
porque el servidor queda abierto. Separándolos, el test recibe la app sin puerto y Supertest la monta en un puerto
efímero. Con Supertest pruebo el contrato HTTP completo: que la ruta y el verbo existen, que el *parser* de JSON y
los middleware (autenticación, validación) se aplican en el orden correcto, los códigos de estado, las cabeceras
como `Location` o `Content-Type`, la forma exacta del JSON de error y que una excepción inesperada acaba en un 500
sin filtrar detalles. Un test unitario del controlador, llamando a la función con `req` y `res` falsos, se salta
todo eso y además me obliga a fabricar dobles de Express que nadie mantiene.

#### 14. ANTI-PATRÓN RELACIONADO

**Tests encadenados contra un servidor compartido:** los tests dependen de un servidor ya encendido en un puerto
fijo y del estado que dejó el test anterior.

```typescript
// ❌ Necesita `npm start` en otra terminal, y el test 2 solo pasa si el test 1 corrió antes.
const api = request('http://localhost:3106');
let skuCreado: string;

test('1. crea un producto', async () => {
  const r = await api.post('/productos').set('x-api-key', 'clave-de-prueba').send({ sku: 'MOU-001', nombre: 'Mouse', precio: 50000 });
  skuCreado = r.body.sku;
});
test('2. lo consulta', async () => {
  await api.get(`/productos/${skuCreado}`).expect(200); // falla si ejecutas solo este test, o la segunda vez (409 en el 1)
});

// ✅ Cada test construye su app y sus datos; se puede ejecutar solo, en cualquier orden y en paralelo.
test('consulta un producto existente', async () => {
  const app = crearApp(repositorioEnMemoria([{ sku: 'MOU-001', nombre: 'Mouse', precio: 50000 }]));
  await request(app).get('/productos/MOU-001').expect(200);
});
```

**Cómo se ve:** tests con números en el nombre, «en mi máquina pasa» (porque tu servidor local tiene datos viejos),
una suite que pasa la primera vez y falla la segunda, y fallos en cascada: se rompe el primero y caen veinte detrás,
todos con mensajes que no señalan la causa.

---

### Contract Testing con Pact

#### 1. UBICACIÓN

Módulo 16, Lección 3 de 4 · Fase 2.

#### 2. PRERREQUISITOS

- Fichas 1 y 2 (Jest y una API de Express bajo prueba).
- Database-per-service (Módulo 15): pedidos consulta el stock **por la API** de inventario.
- `npm ci` hecho en `modulo-20`; Docker encendido para los pasos con el Pact Broker.

#### 3. OBJETIVO DE APRENDIZAJE

**Escribir** el test de consumidor que genera el contrato entre pedidos e inventario, **verificar** ese contrato
contra la API real del proveedor con estados de proveedor, y **publicar** contrato y resultado en un Pact Broker
para decidir un despliegue con `can-i-deploy`; lo compruebas cuando `npm run test:pact:consumidor` y
`npm run test:pact:proveedor` pasan y, al renombrar un campo en el proveedor, la verificación falla nombrando el
campo que falta.

#### 4. ANALOGÍA VISUAL

Dibuja un **enchufe y una toma de corriente** fabricados por dos empresas en dos ciudades. Si cada fábrica prueba
solo su pieza, el día del montaje descubren que las patas no entran. La solución cara es juntar las dos fábricas
para cada prueba (un test de extremo a extremo). La solución de Pact: el fabricante del enchufe (el **consumidor**)
hace un **molde de yeso** de sus patas —solo de las patas que de verdad usa— y lo envía por correo. El fabricante
de la toma (el **proveedor**) prueba **su toma real contra ese molde** en su propia fábrica, cada vez que cambia
algo. Entre ambas hay una **oficina de correos con archivo** (el Pact Broker) que guarda cada molde con su fecha y
un sello: «verificado contra la toma versión 1.0.0». Antes de enviar un producto nuevo a las tiendas, cualquiera de
los dos pregunta en la ventanilla: «¿puedo desplegar?». El molde no dice cómo es la toma por dentro ni si da 220
voltios: solo si **encajan**.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant C as Test del consumidor (pedidos)
    participant M as Servidor falso de Pact
    participant F as pedidos-inventario.json (el contrato)
    participant B as Pact Broker
    participant V as Verificador de Pact
    participant P as API real del proveedor (inventario)
    C->>M: «si recibes GET /stock/TEC-001, responde 200 { sku, disponible }»
    C->>M: ClienteInventario.obtenerStock('TEC-001') (cliente real)
    M-->>C: 200 { sku: "TEC-001", disponible: 3 }
    M->>F: escribe las interacciones
    F->>B: pact broker publish (versión 1.0.0, rama main)
    B->>V: entrega el contrato
    V->>P: estado «existe el producto TEC-001 con 3 unidades» (stateHandler)
    V->>P: GET /stock/TEC-001 (petición del contrato)
    P-->>V: 200 { sku, disponible, bodega }
    V->>B: resultado: verificado por inventario 1.0.0
    Note over B: can-i-deploy consulta esta matriz
```

**Texto alternativo:** diagrama de secuencia con seis participantes. El test del consumidor (pedidos) le dice al
servidor falso de Pact qué responder ante GET /stock/TEC-001 y después llama al cliente real, que recibe 200 con sku
y disponible. El servidor falso escribe las interacciones en el archivo pedidos-inventario.json, el contrato. El
contrato se publica en el Pact Broker con la versión 1.0.0 y la rama main. En el lado del proveedor, el verificador
de Pact recibe el contrato del broker, pone a la API real de inventario en el estado «existe el producto TEC-001 con
3 unidades» mediante un stateHandler, le envía la petición del contrato y compara la respuesta, que trae sku,
disponible y un campo extra, bodega. El verificador publica en el broker que inventario 1.0.0 verificó el contrato.
Una nota indica que can-i-deploy consulta esa matriz.

#### 6. EXPLICACIÓN NIVEL 0

- Cuando un servicio (pedidos) llama a otro (inventario), los dos tienen que estar de acuerdo en la **forma** de la
  petición y de la respuesta: qué URL, qué campos, de qué tipo. Ese acuerdo es el **contrato**.
- El que llama es el **consumidor**; el que responde es el **proveedor**.
- El problema: el equipo de inventario renombra un campo, sus tests pasan, despliega… y pedidos se rompe en
  producción.
- **Contract testing** convierte el acuerdo en un archivo que se prueba **en los dos lados por separado**, sin
  tener que encender los dos servicios a la vez.
- **Pact** es la herramienta más usada para eso. El contrato lo genera el **consumidor** a partir de lo que de
  verdad usa (*consumer-driven*: guiado por el consumidor).
- El **Pact Broker** es un servidor que guarda los contratos y quién los ha verificado.

#### 7. EXPLICACIÓN INTERMEDIA

- **Lado consumidor.** El test describe cada **interacción**: `given` (el estado que necesita el proveedor),
  `uponReceiving` (un nombre), `withRequest` (método, ruta, cabeceras) y `willRespondWith` (estado y cuerpo). Pact
  levanta un **servidor falso** que responde exactamente eso; dentro de `executeTest` llamas a **tu cliente real**
  apuntando a ese servidor. Si el cliente hizo la petición descrita, Pact escribe el contrato en `pacts/`.
- **Matchers.** `like('TEC-001')` significa «un texto» e `integer(3)` «un entero»: el contrato fija **tipos y
  estructura**, no los valores de ejemplo. Sin matchers, el proveedor tendría que devolver exactamente `3`.
- **Solo lo que usas.** El contrato incluye `sku` y `disponible` porque es lo que lee `ClienteInventario`. El
  proveedor devuelve además `bodega` y la verificación pasa igual: añadir campos no rompe a nadie.
- **Lado proveedor.** `Verifier` arranca contra la API **real** de inventario, lee el contrato y **reproduce** cada
  petición. Antes de cada una ejecuta el `stateHandler` cuyo nombre coincide con el `given` del consumidor, para
  dejar los datos como hace falta («existe el producto TEC-001 con 3 unidades»).
- **Pact Broker.** `pact broker publish` sube el contrato con la versión del consumidor (lo normal: el SHA del
  commit) y su rama. El proveedor verifica «el último contrato de la rama main» (`consumerVersionSelectors`) y, con
  `publishVerificationResult`, deja constancia de qué versión suya lo cumple.
- **`can-i-deploy`** consulta esa matriz de versiones: «¿la versión X de pedidos tiene sus contratos verificados por
  la versión de inventario que está desplegada?». Si la respuesta es no, el pipeline se detiene **antes** de
  desplegar.

#### 8. EXPLICACIÓN MAESTRA

| | Contrato guiado por el consumidor (Pact) | Esquema del proveedor (OpenAPI + validación) | Extremo a extremo |
|---|---|---|---|
| Quién define | Cada consumidor, con lo que usa | El proveedor, con todo lo que ofrece | Nadie: se observa |
| Detecta «rompí a un consumidor» | Sí, y dice a cuál | Solo si el cambio viola el esquema | Sí, tarde y sin señalar la causa |
| Entorno | Cada servicio por separado | Cada servicio por separado | Todos los servicios desplegados |
| Coste | Flujo y broker que mantener | Bajo | Alto, lento, inestable |
| Sirve para APIs públicas | No (consumidores desconocidos) | Sí | Parcialmente |

- **Qué te compra Pact que OpenAPI no:** saber qué campos usa **cada** consumidor. Puedes eliminar un campo que
  nadie lee con la certeza de que no rompes nada, y un cambio incompatible falla en el pipeline del proveedor con el
  nombre del consumidor afectado.
- **Alternativas:** *contratos bidireccionales* (el proveedor publica su OpenAPI y el consumidor su pacto; una
  herramienta los compara sin ejecutar la verificación; función del producto comercial PactFlow), *validación de
  esquema en CI* contra el OpenAPI del proveedor, y para mensajería, pactos de **mensajes** (misma idea sobre eventos
  de Kafka o RabbitMQ) o un Schema Registry con reglas de compatibilidad.
- **El flujo maduro** añade: *pending pacts* (un contrato nuevo no rompe el build del proveedor hasta que lo
  verifique por primera vez), *webhooks* del broker (publicar un contrato dispara la verificación del proveedor) y
  `record-deployment` (el broker sabe qué versión hay en cada entorno).
- **Límites.** Pact comprueba **compatibilidad de forma**, no comportamiento: no demuestra que el stock devuelto sea
  correcto. Los `given` son un acoplamiento entre equipos: mantenlos pocos y descriptivos.
- **Cuándo NO usarlo:** una API pública con consumidores que no controlas (publica y versiona un OpenAPI); un único
  equipo con dos servicios que se despliegan siempre juntos (puede bastar un test de integración); o si el equipo
  del proveedor no va a ejecutar la verificación en su pipeline: un contrato que nadie verifica es documentación
  desactualizada.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **@pact-foundation/pact 17.1.4** (especificación Pact V4),
**@pact-foundation/pact-cli 18.10.9**, **jest 30.5.2**, **ts-jest 29.4.15**, **express 5.3.0**; **Pact Broker
2.124.0** (imagen `pactfoundation/pact-broker:3.2.0-pactbroker2.124.0`) con **PostgreSQL 18.7**.

**Consumidor** — `cliente-inventario.ts`:

```typescript
// Módulo 16 · F107 · Contract Testing con Pact: el CONSUMIDOR. El servicio «pedidos» usa este cliente para hablar con «inventario».
// Requisitos: Node.js 26.13.1 LTS (fetch nativo), @pact-foundation/pact 17.1.4, jest 30.5.2, ts-jest 29.4.15.
export interface Stock {
  sku: string;
  disponible: number;
}

export class ClienteInventario {
  constructor(private readonly baseUrl: string) {}

  // Devuelve el stock, o null si inventario no conoce el producto.
  async obtenerStock(sku: string): Promise<Stock | null> {
    const respuesta = await fetch(`${this.baseUrl}/stock/${sku}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(2000),
    });
    if (respuesta.status === 404) return null;
    if (!respuesta.ok) throw new Error(`inventario respondió ${respuesta.status}`);
    const cuerpo = (await respuesta.json()) as Stock;
    return { sku: cuerpo.sku, disponible: cuerpo.disponible }; // SOLO usamos estos dos campos: eso es lo que irá al contrato
  }

  async hayStock(sku: string, cantidad: number): Promise<boolean> {
    const stock = await this.obtenerStock(sku);
    return stock !== null && stock.disponible >= cantidad;
  }
}
```

`f107-pact/consumidor/cliente-inventario.pact.test.ts`:

```typescript
// Verificación F107 (lado consumidor): npm run test:pact:consumidor
// Pact levanta un servidor FALSO de inventario; el cliente real le habla; si todo coincide, escribe el contrato en pacts/.
import path from 'node:path';
import { Pact, Matchers } from '@pact-foundation/pact';
import { ClienteInventario } from './cliente-inventario';

const { like, integer } = Matchers;

const pact = new Pact({
  consumer: 'pedidos',
  provider: 'inventario',
  dir: path.resolve(__dirname, '..', 'pacts'), // → f107-pact/pacts/pedidos-inventario.json
  logLevel: 'warn',
});

describe('contrato pedidos → inventario', () => {
  test('GET /stock/:sku de un producto que existe', async () => {
    await pact
      .addInteraction()
      .given('existe el producto TEC-001 con 3 unidades') // ESTADO que el proveedor deberá preparar
      .uponReceiving('una consulta de stock de TEC-001')
      .withRequest('GET', '/stock/TEC-001', (peticion) => {
        peticion.headers({ accept: 'application/json' });
      })
      .willRespondWith(200, (respuesta) => {
        // jsonBody añade Content-Type: application/json. Matchers: el contrato exige el TIPO (texto, entero), no estos valores.
        respuesta.jsonBody({ sku: like('TEC-001'), disponible: integer(3) });
      })
      .executeTest(async (servidorFalso) => {
        const cliente = new ClienteInventario(servidorFalso.url);
        await expect(cliente.obtenerStock('TEC-001')).resolves.toEqual({ sku: 'TEC-001', disponible: 3 });
        // (una sola petición por interacción: el servidor falso exige que cada una ocurra exactamente una vez)
      });
  });

  test('GET /stock/:sku de un producto que no existe', async () => {
    await pact
      .addInteraction()
      .given('no existe el producto XXX-999')
      .uponReceiving('una consulta de stock de XXX-999')
      .withRequest('GET', '/stock/XXX-999')
      .willRespondWith(404)
      .executeTest(async (servidorFalso) => {
        const cliente = new ClienteInventario(servidorFalso.url);
        await expect(cliente.obtenerStock('XXX-999')).resolves.toBeNull();
      });
  });
});
```

**Proveedor** — `f107-pact/proveedor/app.ts`:

```typescript
// Módulo 16 · F107 · Contract Testing con Pact: el PROVEEDOR. La API real del servicio «inventario».
import express, { type Express } from 'express';

export const stock = new Map<string, number>(); // en un servicio real sería su base de datos

// `campo` existe solo para el laboratorio: permite simular que alguien renombra «disponible» y rompe a los consumidores.
export function crearApp(campo = 'disponible'): Express {
  const app = express();
  app.get('/stock/:sku', (req, res) => {
    const unidades = stock.get(req.params.sku);
    if (unidades === undefined) return res.status(404).json({ error: 'SKU desconocido' });
    // El proveedor puede devolver MÁS campos de los que usa el consumidor (bodega): el contrato no se rompe por eso.
    res.json({ sku: req.params.sku, [campo]: unidades, bodega: 'BOG-1' });
  });
  return app;
}
```

`f107-pact/proveedor/inventario.pact.test.ts`:

```typescript
// Verificación F107 (lado proveedor): npm run test:pact:proveedor   (después de test:pact:consumidor)
// Pact REPRODUCE contra la API real cada petición del contrato y compara las respuestas.
import path from 'node:path';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Verifier } from '@pact-foundation/pact';
import { crearApp, stock } from './app';

jest.setTimeout(30_000);

describe('inventario cumple los contratos de sus consumidores', () => {
  let servidor: Server;

  beforeAll((listo) => {
    servidor = crearApp(process.env.CAMPO_STOCK).listen(0, listo); // CAMPO_STOCK=cantidad simula el cambio que rompe
  });
  afterAll((listo) => {
    servidor.close(listo);
  });

  test('verifica el contrato de pedidos', async () => {
    const broker = process.env.PACT_BROKER_URL; // si está definido, los contratos se leen del Pact Broker
    const salida = await new Verifier({
      provider: 'inventario',
      providerBaseUrl: `http://127.0.0.1:${(servidor.address() as AddressInfo).port}`,
      logLevel: 'warn',
      // De dónde salen los contratos: del archivo local o del Broker.
      ...(broker
        ? {
            pactBrokerUrl: broker,
            consumerVersionSelectors: [{ branch: 'main' }], // el contrato más reciente de la rama main de cada consumidor
            publishVerificationResult: true,
            providerVersion: process.env.VERSION_PROVEEDOR ?? '1.0.0',
            providerVersionBranch: 'main',
          }
        : { pactUrls: [path.resolve(__dirname, '..', 'pacts', 'pedidos-inventario.json')] }),
      // Cada `given(...)` del consumidor tiene aquí la función que deja al proveedor en ese estado.
      stateHandlers: {
        'existe el producto TEC-001 con 3 unidades': async () => {
          stock.clear();
          stock.set('TEC-001', 3);
        },
        'no existe el producto XXX-999': async () => {
          stock.clear();
        },
      },
    }).verifyProvider();
    expect(salida).toBeDefined();
  });
});
```

`docker-compose.yml` (el Pact Broker y su base):

```yaml
# Módulo 16 (modulo-20) · Testing en Node.js
# Pact Broker:  docker compose up -d --wait     → http://localhost:9220  (sin usuario ni clave: solo para laboratorio)
# Detén todo:   docker compose down             (sin volúmenes: los contratos publicados se pierden, a propósito)
# Testcontainers (F108) NO usa este archivo: el propio test arranca y destruye su PostgreSQL.
services:
  pact-db:
    image: postgres:18.7
    environment:
      POSTGRES_USER: pact
      POSTGRES_PASSWORD: pact
      POSTGRES_DB: pact
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U pact -d pact"]
      interval: 2s
      timeout: 3s
      retries: 30
  pact-broker:
    image: pactfoundation/pact-broker:3.2.0-pactbroker2.124.0   # Pact Broker 2.124.0
    depends_on:
      pact-db:
        condition: service_healthy
    environment:
      PACT_BROKER_DATABASE_URL: postgres://pact:pact@pact-db/pact
      PACT_BROKER_PORT: "9292"
      PACT_BROKER_LOG_LEVEL: INFO
    ports: ["9220:9292"]   # 9220 en tu máquina para no chocar con el broker del Módulo 3 (9292)
    healthcheck:
      # la imagen trae Ruby: se usa para no depender de curl dentro del contenedor
      test: ["CMD", "ruby", "-rnet/http", "-e", "exit(Net::HTTP.get_response(URI('http://localhost:9292/diagnostic/status/heartbeat')).code == '200' ? 0 : 1)"]
      interval: 3s
      timeout: 5s
      retries: 40
```

#### 10. MINI-LABORATORIO

1. Genera el contrato desde el consumidor y míralo:
   ```bash
   npm run test:pact:consumidor
   cat f107-pact/pacts/pedidos-inventario.json
   ```
2. Verifica al proveedor contra ese archivo:
   ```bash
   npm run test:pact:proveedor
   ```
3. Rompe el contrato a propósito: el proveedor «renombra» `disponible` a `cantidad`.
   ```bash
   CAMPO_STOCK=cantidad npm run test:pact:proveedor
   ```
4. Ahora con el Pact Broker. Levántalo, publica el contrato, verifica desde el broker y pregunta si puedes
   desplegar:
   ```bash
   docker compose up -d --wait
   npx pact broker publish f107-pact/pacts --consumer-app-version 1.0.0 --branch main --broker-base-url http://localhost:9220
   PACT_BROKER_URL=http://localhost:9220 VERSION_PROVEEDOR=1.0.0 npm run test:pact:proveedor
   npx pact broker can-i-deploy --pacticipant pedidos --version 1.0.0 --pacticipant inventario --version 1.0.0 --broker-base-url http://localhost:9220
   docker compose down
   ```

**Output esperado** (paso 1, salida real con Node 26.13.1 y @pact-foundation/pact 17.1.4):

```text
PASS pact-consumidor f107-pact/consumidor/cliente-inventario.pact.test.ts
  contrato pedidos → inventario
    ✓ GET /stock/:sku de un producto que existe (34 ms)
    ✓ GET /stock/:sku de un producto que no existe (8 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

y el contrato generado (fragmento real: la primera interacción y los metadatos):

```json
{
  "consumer": {
    "name": "pedidos"
  },
  "interactions": [
    {
      "description": "una consulta de stock de TEC-001",
      "pending": false,
      "providerStates": [
        {
          "name": "existe el producto TEC-001 con 3 unidades"
        }
      ],
      "request": {
        "headers": {
          "accept": [
            "application/json"
          ]
        },
        "method": "GET",
        "path": "/stock/TEC-001"
      },
      "response": {
        "body": {
          "content": {
            "disponible": 3,
            "sku": "TEC-001"
          },
          "contentType": "application/json",
          "encoded": false
        },
        "headers": {
          "Content-Type": [
            "application/json"
          ]
        },
        "matchingRules": {
          "body": {
            "$.disponible": {
              "combine": "AND",
              "matchers": [
                {
                  "match": "integer"
                }
              ]
            },
            "$.sku": {
              "combine": "AND",
              "matchers": [
                {
                  "match": "type"
                }
              ]
            }
          }
        },
        "status": 200
      },
      "type": "Synchronous/HTTP"
    }
  ],
  "metadata": {
    "pact-js": {
      "version": "17.1.4"
    },
    "pactRust": {
      "ffi": "0.5.8",
      "models": "1.3.16"
    },
    "pactSpecification": {
      "version": "4.0"
    }
  },
  "provider": {
    "name": "inventario"
  }
}
```

**Output esperado** (paso 2, salida real en macOS con Node 26.13.1 y @pact-foundation/pact 17.1.4; el número de
proceso, la hora y los milisegundos cambian, y en la terminal los `OK` salen en color):

```text
Running one project: pact-proveedor
(node:75838) [DEP0060] DeprecationWarning: The `util._extend` API is deprecated. Please use Object.assign() instead.
(Use `node --trace-deprecation ...` to show where the warning was created)
2026-11-20T04:33:31.630166Z  WARN ThreadId(11) pact_matching::metrics: 

Please note:
We are tracking events anonymously to gather important usage statistics like Pact version and operating system. To disable tracking, set the 'PACT_DO_NOT_TRACK' environment variable to 'true'.



Verifying a pact between pedidos and inventario

  una consulta de stock de TEC-001 (0s loading, 37ms verification)
     Given existe el producto TEC-001 con 3 unidades
    returns a response which
      has status code 200 (OK)
      includes headers
        "Content-Type" with value "application/json" (OK)
      has a matching body (OK)

  una consulta de stock de XXX-999 (0s loading, 2ms verification)
     Given no existe el producto XXX-999
    returns a response which
      has status code 404 (OK)
      has a matching body (OK)


PASS pact-proveedor f107-pact/proveedor/inventario.pact.test.ts
  inventario cumple los contratos de sus consumidores
    ✓ verifica el contrato de pedidos (322 ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

Las primeras líneas no son errores. El aviso `DEP0060` lo produce `http-proxy` 1.18.1, una dependencia de
@pact-foundation/pact que usa `require('util')._extend` (está en `node_modules/http-proxy/lib/http-proxy/index.js`).
El `WARN … pact_matching::metrics` avisa de que el núcleo de Pact envía estadísticas de uso anónimas; desaparece con
`PACT_DO_NOT_TRACK=true`, como dice el propio mensaje.

**Output esperado** (paso 3): ver la sección 12 (`has a matching body (FAILED)` y código de salida 1).

**Output esperado** (paso 4, salida real con Pact Broker 2.124.0). `publish`:

```text
📨 Attempting to publish pact for consumer: pedidos against provider: inventario
✅ Created pedidos version 1.0.0 with branch main
Pact successfully published for pedidos version 1.0.0 and provider inventario.
View the published pact at http://localhost:9220/pacts/provider/inventario/consumer/pedidos/version/1.0.0
Events detected: contract_published, contract_content_changed (first time untagged pact published)
Next steps:
* Add Pact verification tests to the inventario build. See https://docs.pact.io/go/provider_verification
* Configure separate inventario pact verification build and webhook to trigger it when the pact content changes. See https://docs.pact.io/go/webhooks
```

La verificación desde el broker imprime, antes del bloque `Verifying a pact…` del paso 2 (con los mismos avisos
iniciales), por qué eligió ese contrato, y vuelve a terminar en `Tests:       1 passed, 1 total` (el identificador
`pact-version` es un hash del contenido del contrato):

```text
The pact at http://localhost:9220/pacts/provider/inventario/consumer/pedidos/pact-version/44f1fb453db5f6f38368aec5e2e649cac231a82a is being verified because the pact content belongs to the consumer version matching the following criterion:
    * latest version from branch 'main' (1.0.0)
```

`can-i-deploy` responde con la matriz y termina con código de salida 0 (compruébalo con `echo $?`):

```text
┌──────────┬───────────┬────────────┬───────────┬──────────┬────────┐
│ CONSUMER ┆ C.VERSION ┆ PROVIDER   ┆ P.VERSION ┆ SUCCESS? ┆ RESULT │
╞══════════╪═══════════╪════════════╪═══════════╪══════════╪════════╡
│ pedidos  ┆ 1.0.0     ┆ inventario ┆ 1.0.0     ┆ true     ┆ 1      │
└──────────┴───────────┴────────────┴───────────┴──────────┴────────┘

VERIFICATION RESULTS
--------------------
1. http://localhost:9220/pacts/provider/inventario/consumer/pedidos/pact-version/44f1fb453db5f6f38368aec5e2e649cac231a82a/metadata/Y3ZuPTEuMC4w/verification-results/200 (success)


All required verification results are published and successful


✅ Computer says yes \o/
```

**Captura descrita:** en `http://localhost:9220` la tabla de integraciones muestra una fila *pedidos → inventario* con la última verificación en verde.

**Captura comentada:** en el contrato, `matchingRules` es lo que escribieron `like` e `integer`: «`$.sku` de tipo
texto, `$.disponible` entero». Los valores `TEC-001` y `3` son solo el ejemplo que devolvió el servidor falso. El
campo `bodega`, que el proveedor sí devuelve, no aparece: el consumidor no lo usa.

#### 11. VERIFICACIÓN

```bash
npm run test:pact:consumidor && npm run test:pact:proveedor
```

Deben terminar en `Tests:       2 passed, 2 total` y `Tests:       1 passed, 1 total`. Los dos archivos de test son
los de la sección 9 (`cliente-inventario.pact.test.ts` e `inventario.pact.test.ts`). Además, un test rápido de que
el contrato generado dice lo que crees (ejecútalo tal cual después del consumidor):

```bash
node -e "
const pacto = require('./f107-pact/pacts/pedidos-inventario.json');
const assert = require('node:assert/strict');
assert.equal(pacto.consumer.name, 'pedidos');
assert.equal(pacto.provider.name, 'inventario');
assert.deepEqual(pacto.interactions.map((i) => i.response.status), [200, 404]);
assert.deepEqual(Object.keys(pacto.interactions[0].response.body.content).sort(), ['disponible', 'sku']);
console.log('contrato OK: 2 interacciones, solo los campos que usa el consumidor');
"
```

Salida real:

```text
contrato OK: 2 interacciones, solo los campos que usa el consumidor
```

**Pregunta de comprobación:** el proveedor quiere **eliminar** el campo `bodega`. ¿Fallará la verificación del
contrato de pedidos? ¿Y si elimina `disponible`? (Respuesta: `bodega` no está en el contrato, así que puede
eliminarlo sin romper a pedidos; `disponible` sí está: la verificación falla y nombra el campo.)

#### 12. ERROR COMÚN

**Síntoma:** el equipo del proveedor hace un cambio «pequeño» en una respuesta, sus tests unitarios pasan y el
consumidor se rompe. Con Pact, ese cambio falla en el pipeline del proveedor. Paso 3 del laboratorio
(`CAMPO_STOCK=cantidad`): el proveedor responde `{ "sku": …, "cantidad": 3, "bodega": … }`.

**Cómo se ve** (salida real del paso 3 en macOS; Jest la muestra y marca el test con `✕`):

```text
  una consulta de stock de TEC-001 (0s loading, 11ms verification)
     Given existe el producto TEC-001 con 3 unidades
    returns a response which
      has status code 200 (OK)
      includes headers
        "Content-Type" with value "application/json" (OK)
      has a matching body (FAILED)

Failures:

1) Verifying a pact between pedidos and inventario Given existe el producto TEC-001 con 3 unidades - una consulta de stock de TEC-001
    1.1) has a matching body
           $ -> Actual map is missing the following keys: disponible
    {
    -  "disponible": 3,
    +  "bodega": "BOG-1",
  "cantidad": 3,
      "sku": "TEC-001"
}


There were 1 pact failures
```

Debajo, pact-core 20.2.0 añade `ERROR (…): pact-core@20.2.0: Verification unsuccessful` y Jest termina con
`✕ verifica el contrato de pedidos (195 ms)` y `Tests:       1 failed, 1 total`.

**Diagnóstico visual:** lee tres cosas. *Entre quién*: «a pact between pedidos and inventario». *En qué
interacción*: la consulta de stock de TEC-001. *Qué falta*: `Actual map is missing the following keys: disponible`,
con la diferencia en estilo `-`/`+`. **Arreglo:** no es «actualizar el contrato para que pase». O el proveedor
mantiene `disponible` (puede añadir `cantidad` al lado y retirar el campo viejo cuando ningún contrato lo use), o
ambos equipos acuerdan el cambio y el consumidor publica primero una versión que acepte el campo nuevo.

Otros dos tropiezos reales al empezar:

- **El `given` no coincide con ningún `stateHandler`** (una letra distinta basta): el proveedor no prepara los datos
  y la respuesta es un 404 donde el contrato espera 200. Copia el texto del estado, no lo reescribas.
- **Detrás de un proxy corporativo.** Si tu terminal tiene definida la variable `HTTPS_PROXY`, pact-js 17.1.4 envía
  por ese proxy también las peticiones al proveedor en `127.0.0.1`, y la verificación falla con códigos que tu API
  nunca devuelve (en nuestra prueba, `expected 200 but was 403`). Ejecuta la verificación en una terminal sin esa
  variable.

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué problema resuelve el contract testing guiado por el consumidor y en qué se diferencia de un test de extremo a
extremo?»

**Respuesta modelo:** resuelve el «yo cambié mi API, mis tests pasaron y rompí a otro equipo». El consumidor
escribe un test contra un servidor falso que describe exactamente las peticiones que hace y los campos que lee; de
ahí sale un contrato. El proveedor ejecuta ese contrato contra su API real en su propio pipeline. Cada lado se
prueba aislado, en segundos, y el fallo aparece donde se originó el cambio y nombra al consumidor afectado. Un test
de extremo a extremo necesita todos los servicios desplegados con datos coherentes: es lento, inestable y cuando
falla no dice quién tiene la culpa. Con un broker además sé qué versiones son compatibles entre sí y uso
`can-i-deploy` como puerta antes de desplegar. Lo que el contrato no cubre es el comportamiento: comprueba que las
piezas encajan, no que el proveedor calcule bien; eso lo prueban los tests del propio proveedor. Por eso mantengo
unos pocos extremo a extremo para los flujos críticos y dejo la compatibilidad a los contratos.

#### 14. ANTI-PATRÓN RELACIONADO

**Usar el contrato como test funcional del proveedor:** el consumidor fija valores exactos y escribe una
interacción por cada regla de negocio del proveedor.

```typescript
// ❌ Valores exactos y reglas del proveedor dentro del contrato del consumidor.
respuesta.jsonBody({ sku: 'TEC-001', disponible: 3, bodega: 'BOG-1', actualizado: '2026-11-19T10:00:00Z' });
// … y 40 interacciones más: «stock negativo devuelve 422», «sku en minúsculas devuelve 400», «sku con espacios»…

// ✅ Solo los campos que el consumidor LEE, por tipo; y solo las respuestas que el consumidor TRATA distinto.
respuesta.jsonBody({ sku: like('TEC-001'), disponible: integer(3) });
// interacciones: «existe» (200) y «no existe» (404), porque el cliente hace cosas distintas con cada una.
```

**Cómo se ve:** el build del proveedor se rompe cada vez que cambia un dato de prueba o añade un campo; los
`stateHandlers` se convierten en un segundo juego de datos que hay que mantener; el equipo del proveedor empieza a
«arreglar» los contratos en vez de su código y, al final, desactiva la verificación. El contrato debe ser **lo
mínimo que el consumidor necesita para no romperse**; las reglas del proveedor se prueban en los tests del
proveedor.

---

### Testcontainers para Node

#### 1. UBICACIÓN

Módulo 16, Lección 4 de 4 · Fase 2.

#### 2. PRERREQUISITOS

- Fichas 1 y 2 (Jest, ciclo de vida `beforeAll/afterAll/beforeEach`).
- PostgreSQL con el driver `pg` y pool de conexiones (Módulo 15).
- Docker encendido (`docker info` responde) y `npm ci` hecho en `modulo-20`.

#### 3. OBJETIVO DE APRENDIZAJE

**Escribir** tests de integración que arrancan un PostgreSQL real en un contenedor desde el propio test,
**ejecutar** contra él SQL específico del motor (`ON CONFLICT`, `jsonb`, `FILTER`) y **garantizar** datos limpios en
cada test y limpieza al terminar; lo compruebas cuando `npm run test:contenedores` pasa 6 de 6 y, al acabar,
`docker ps` no muestra ningún contenedor del test.

#### 4. ANALOGÍA VISUAL

Dibuja una **cocina de pruebas desechable**. Para ensayar una receta nueva, el chef no usa una maqueta de cartón (un
doble en memoria: no quema, no hierve, no avisa si la receta está mal) ni la cocina del restaurante en pleno servicio
(la base compartida de pruebas: otro cocinero movió los ingredientes). Llega un **camión con un contenedor**: dentro
hay una cocina **real**, idéntica a la del restaurante (misma marca y modelo de horno: misma versión de PostgreSQL),
recién estrenada y vacía. El chef cocina, prueba, y entre plato y plato **limpia la encimera** (`TRUNCATE`). Al
terminar, **el camión se lleva el contenedor** y no queda ni rastro. En la esquina del dibujo, un **empleado de
limpieza con cronómetro** (el contenedor auxiliar *Ryuk*): si el chef se desmaya a mitad del ensayo (el proceso de
test muere), él retira el contenedor igualmente.

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant J as Jest (repositorio.test.ts)
    participant TC as Testcontainers
    participant D as Docker
    participant PG as Contenedor postgres:18.7
    J->>TC: beforeAll: new PostgreSqlContainer('postgres:18.7').start()
    TC->>D: crea el contenedor auxiliar Ryuk (limpieza)
    TC->>D: descarga la imagen (solo la 1.ª vez) y crea el contenedor, puerto 5432 → puerto libre del anfitrión
    D->>PG: arranca
    TC->>PG: espera hasta que acepta conexiones
    TC-->>J: getConnectionUri() → postgres://test:test@localhost:PUERTO/test
    J->>PG: migrar(): CREATE TABLE pedidos
    loop cada test
      J->>PG: TRUNCATE pedidos (beforeEach)
      J->>PG: SQL real del repositorio
    end
    J->>TC: afterAll: pool.end() y contenedor.stop()
    TC->>D: elimina el contenedor
```

**Texto alternativo:** diagrama de secuencia entre Jest, Testcontainers, Docker y un contenedor postgres:18.7. En
beforeAll, el test pide a Testcontainers arrancar un PostgreSqlContainer. Testcontainers crea en Docker el contenedor
auxiliar Ryuk, encargado de la limpieza, descarga la imagen si es la primera vez y crea el contenedor publicando el
puerto 5432 en un puerto libre del anfitrión. Docker lo arranca y Testcontainers espera hasta que acepta conexiones;
entonces devuelve al test la cadena de conexión con ese puerto. El test crea la tabla pedidos. Después, en un bucle
por cada test, vacía la tabla con TRUNCATE y ejecuta el SQL real del repositorio. En afterAll cierra el pool y
detiene el contenedor, y Docker lo elimina.

#### 6. EXPLICACIÓN NIVEL 0

- Un **test de integración** comprueba que tu código funciona junto con algo real de fuera: aquí, una base de datos.
- Un **contenedor** es un programa empaquetado con todo lo que necesita, que Docker arranca aislado y puede borrar
  sin dejar rastro (Módulo 0.5).
- **Testcontainers** es una librería que, **desde el test**, le pide a Docker un contenedor (por ejemplo, un
  PostgreSQL), espera a que esté listo, te da su dirección y lo destruye al terminar.
- No instalas PostgreSQL, no compartes una base con nadie y no dejas datos de una ejecución para la siguiente.
- El precio: necesitas Docker encendido y el test tarda segundos en lugar de milisegundos.

#### 7. EXPLICACIÓN INTERMEDIA

- **Módulos.** `testcontainers` trae `GenericContainer` (cualquier imagen); los paquetes `@testcontainers/…`
  añaden contenedores preconfigurados. `PostgreSqlContainer` crea base, usuario y clave (`test`/`test`/`test` por
  defecto; se cambian con `withDatabase`, `withUsername`, `withPassword`), espera a que el servidor acepte
  conexiones y ofrece `getConnectionUri()`.
- **Puerto aleatorio.** El 5432 del contenedor se publica en un puerto **libre** del anfitrión, distinto en cada
  ejecución: nunca escribas el puerto a mano; pregúntaselo al contenedor (`getPort()` o la URI). Así dos
  ejecuciones simultáneas no chocan.
- **Imagen con versión fija.** `postgres:18.7`, la misma versión *mayor* que producción. Con `latest`, el test de
  hoy y el de mañana pueden correr contra motores distintos.
- **Ciclo de vida.** Arrancar un contenedor cuesta segundos: hazlo **una vez por archivo** (`beforeAll`) y limpia
  los datos **en cada test** (`beforeEach` con `TRUNCATE`). Cierra en `afterAll`: primero el pool, después el
  contenedor.
- **Tiempo límite.** El `beforeAll` supera los 5 s por defecto de Jest: `jest.setTimeout(180_000)` da margen para
  la primera descarga de la imagen.
- **Ryuk.** Testcontainers arranca un contenedor auxiliar (`testcontainers/ryuk`) que elimina los contenedores del
  test si el proceso muere sin llegar al `afterAll`.
- **Qué prueba que un doble no puede:** el SQL real (sintaxis, `ON CONFLICT`, operadores `jsonb`), las restricciones
  de la base (`CHECK`, únicos), la conversión de tipos del driver y tus migraciones.

#### 8. EXPLICACIÓN MAESTRA

| Opción para probar el acceso a datos | Fidelidad | Velocidad | Aislamiento | Requisitos |
|---|---|---|---|---|
| Doble en memoria / mock del pool | Nula para SQL | Milisegundos | Total | Ninguno |
| Base embebida distinta (SQLite, pg-mem) | Parcial: otro dialecto | Rápida | Total | Ninguno |
| Base compartida de «test» | Alta | Rápida | Mala: datos de otros, orden | Red, mantenimiento |
| Docker Compose levantado antes de los tests | Alta | Rápida tras arrancar | Media: puerto fijo, estado entre ejecuciones | Docker, un paso manual |
| Testcontainers | Alta | Segundos de arranque | Total | Docker |

- **Trade-off:** Testcontainers cambia segundos de arranque por la certeza de que el SQL funciona en el motor real
  y por tests que cualquiera ejecuta con un solo comando. En CI necesita un *runner* con Docker.
- **Acelerar sin perder aislamiento:** un contenedor por archivo (o uno global en `globalSetup` de Jest para toda la
  suite, con una base o un esquema por *worker*); `TRUNCATE` o una transacción con `ROLLBACK` por test; restaurar
  una instantánea (`snapshot()` / `restoreSnapshot()` de `PostgreSqlContainer`) cuando los datos base son grandes;
  y contenedores reutilizables (`withReuse()`) solo en desarrollo local.
- **Más allá de la base:** existen módulos para Kafka, RabbitMQ, Redis, MongoDB o LocalStack, y `GenericContainer`
  para cualquier imagen, por ejemplo tu propio servicio vecino.
- **Dónde ponerlos en la pirámide:** pocos y dirigidos: una suite por repositorio o por adaptador, no un contenedor
  para probar un `if`. Sepáralos de los unitarios (aquí, el *project* `contenedores`) para que el ciclo rápido no
  dependa de Docker.
- **Cuándo NO usarlo:** para lógica que no toca infraestructura (test unitario), para comprobar el acuerdo con otro
  servicio (contrato, ficha 3), o como sustituto de un entorno de pruebas de carga: un contenedor en tu portátil no
  dice nada del rendimiento en producción.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS**, **testcontainers 12.2.2** y **@testcontainers/postgresql 12.2.2**, **pg
8.23.1**, **jest 30.5.2**, **ts-jest 29.4.15**; imagen **postgres:18.7**; Docker en marcha. Usa el `package.json`,
el `jest.config.js` y el `tsconfig.json` del inicio del módulo. Este tema **no** usa `docker-compose.yml`: el
contenedor lo crea el test.

`repositorio-pedidos.ts`:

```typescript
// Módulo 16 · F108 · Testcontainers para Node: un repositorio que usa SQL PROPIO de PostgreSQL (ON CONFLICT, jsonb, FILTER).
// Un doble en memoria no puede decirte si este SQL es correcto: hay que ejecutarlo contra un PostgreSQL de verdad.
// Requisitos: Node.js 26.13.1 LTS, pg 8.23.1; para el test: testcontainers y @testcontainers/postgresql 12.2.2, Docker.
import type { Pool } from 'pg';

export interface Pedido {
  id: string;
  cliente: string;
  total: number;
  estado: 'CREADO' | 'PAGADO' | 'CANCELADO';
  items: { sku: string; cantidad: number }[];
}

export async function migrar(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id      TEXT PRIMARY KEY,
      cliente TEXT NOT NULL,
      total   INTEGER NOT NULL CHECK (total > 0),
      estado  TEXT NOT NULL,
      items   JSONB NOT NULL
    )`);
}

export class RepositorioDePedidos {
  constructor(private readonly pool: Pool) {}

  // «Upsert»: inserta, o si el id ya existe actualiza estado y total. Es idempotente: repetirlo no duplica.
  async guardar(pedido: Pedido): Promise<void> {
    await this.pool.query(
      `INSERT INTO pedidos (id, cliente, total, estado, items) VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado, total = EXCLUDED.total`,
      [pedido.id, pedido.cliente, pedido.total, pedido.estado, JSON.stringify(pedido.items)],
    );
  }

  async buscar(id: string): Promise<Pedido | null> {
    const { rows } = await this.pool.query('SELECT id, cliente, total, estado, items FROM pedidos WHERE id = $1', [id]);
    return rows[0] ?? null;
  }

  // Operador @> de jsonb: pedidos cuyo arreglo de items CONTIENE un item con ese sku.
  async conSku(sku: string): Promise<string[]> {
    const { rows } = await this.pool.query('SELECT id FROM pedidos WHERE items @> $1::jsonb ORDER BY id', [JSON.stringify([{ sku }])]);
    return rows.map((fila) => fila.id);
  }

  async resumen(cliente: string): Promise<{ pagado: number; pendientes: number }> {
    const { rows } = await this.pool.query(
      `SELECT COALESCE(SUM(total) FILTER (WHERE estado = 'PAGADO'), 0)::int AS pagado,
              (COUNT(*) FILTER (WHERE estado = 'CREADO'))::int AS pendientes
         FROM pedidos WHERE cliente = $1`,
      [cliente],
    );
    return rows[0];
  }
}
```

`repositorio.test.ts`:

```typescript
// Verificación F108: npm run test:contenedores   (necesita Docker en marcha; la primera vez descarga postgres:18.7)
import { Pool } from 'pg';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { migrar, RepositorioDePedidos, type Pedido } from './repositorio-pedidos';

jest.setTimeout(180_000); // arrancar (y la primera vez descargar) la imagen tarda más que los 5 s por defecto

const pedido: Pedido = { id: 'p-1', cliente: 'ana', total: 120000, estado: 'CREADO', items: [{ sku: 'TEC-001', cantidad: 1 }] };

describe('RepositorioDePedidos contra PostgreSQL real', () => {
  let contenedor: StartedPostgreSqlContainer;
  let pool: Pool;
  let repositorio: RepositorioDePedidos;

  beforeAll(async () => {
    // UN contenedor para todo el archivo: versión fija (la misma de producción), puerto libre elegido por Docker.
    contenedor = await new PostgreSqlContainer(process.env.IMAGEN_POSTGRES ?? 'postgres:18.7').start();
    pool = new Pool({ connectionString: contenedor.getConnectionUri() });
    await migrar(pool);
    repositorio = new RepositorioDePedidos(pool);
  });

  afterAll(async () => {
    await pool?.end();
    await contenedor?.stop();
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE pedidos'); // datos limpios en cada test: es mucho más barato que otro contenedor
  });

  test('el contenedor es un PostgreSQL de verdad, en un puerto que no es el 5432 del anfitrión', async () => {
    const { rows } = await pool.query('SHOW server_version');
    expect(rows[0].server_version).toMatch(/^\d+\.\d+/);
    expect(contenedor.getPort()).not.toBe(5432);
  });

  test('guardar y buscar conservan el jsonb', async () => {
    await repositorio.guardar(pedido);
    await expect(repositorio.buscar('p-1')).resolves.toEqual(pedido);
    await expect(repositorio.buscar('no-existe')).resolves.toBeNull();
  });

  test('guardar dos veces el mismo id actualiza en lugar de duplicar (ON CONFLICT)', async () => {
    await repositorio.guardar(pedido);
    await repositorio.guardar({ ...pedido, estado: 'PAGADO' });
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM pedidos');
    expect(rows[0].n).toBe(1);
    expect((await repositorio.buscar('p-1'))?.estado).toBe('PAGADO');
  });

  test('conSku busca dentro del jsonb con @>', async () => {
    await repositorio.guardar(pedido);
    await repositorio.guardar({ ...pedido, id: 'p-2', items: [{ sku: 'MOU-001', cantidad: 2 }] });
    await repositorio.guardar({ ...pedido, id: 'p-3', items: [{ sku: 'MOU-001', cantidad: 1 }, { sku: 'TEC-001', cantidad: 1 }] });
    await expect(repositorio.conSku('TEC-001')).resolves.toEqual(['p-1', 'p-3']);
  });

  test('resumen agrega con FILTER', async () => {
    await repositorio.guardar({ ...pedido, estado: 'PAGADO' });
    await repositorio.guardar({ ...pedido, id: 'p-2', total: 50000 });
    await repositorio.guardar({ ...pedido, id: 'p-3', cliente: 'luis', estado: 'PAGADO' });
    await expect(repositorio.resumen('ana')).resolves.toEqual({ pagado: 120000, pendientes: 1 });
    await expect(repositorio.resumen('nadie')).resolves.toEqual({ pagado: 0, pendientes: 0 });
  });

  test('la restricción CHECK de la base rechaza un total de 0', async () => {
    await expect(repositorio.guardar({ ...pedido, total: 0 })).rejects.toMatchObject({ code: '23514' });
  });
});
```

#### 10. MINI-LABORATORIO

1. Comprueba que Docker responde y ejecuta los tests (la primera vez descarga `postgres:18.7` y
   `testcontainers/ryuk`; puede tardar un minuto):
   ```bash
   docker info --format '{{.ServerVersion}}'
   npm run test:contenedores
   ```
2. Repite el paso 1 y, mientras corre, mira en otra terminal los contenedores que creó el test:
   ```bash
   docker ps --format '{{.Image}}  {{.Ports}}'
   ```
3. Cuando termine, comprueba que no quedó nada:
   ```bash
   docker ps --filter "ancestor=postgres:18.7" --format '{{.ID}}' | wc -l
   ```
4. Rompe el SQL a propósito: en `repositorio-pedidos.ts` borra la línea que empieza por `ON CONFLICT`, repite el
   paso 1, lee el fallo y **deshaz el cambio**.

**Output esperado** (paso 1; salida real en macOS con Docker Desktop (Docker Engine 29.9.3), Node 26.13.1, jest 30.5.2,
testcontainers 12.2.2 y `postgres:18.7` ya descargada; el tiempo depende de la máquina y de si la imagen ya está
descargada):

```text
Running one project: contenedores
PASS contenedores f108-testcontainers/repositorio.test.ts
  RepositorioDePedidos contra PostgreSQL real
    ✓ el contenedor es un PostgreSQL de verdad, en un puerto que no es el 5432 del anfitrión (3 ms)
    ✓ guardar y buscar conservan el jsonb (3 ms)
    ✓ guardar dos veces el mismo id actualiza en lugar de duplicar (ON CONFLICT) (3 ms)
    ✓ conSku busca dentro del jsonb con @> (2 ms)
    ✓ resumen agrega con FILTER (3 ms)
    ✓ la restricción CHECK de la base rechaza un total de 0 (2 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        2.766 s
Ran all test suites.
```

Si un archivo de test tarda más de 5 s, Jest añade su duración al final de la línea `PASS` (por ejemplo
`(9.231 s)` en una máquina más lenta o con la imagen recién descargada).

**Output esperado** (paso 2): dos líneas, una con la imagen `postgres:18.7` y un puerto alto del anfitrión que
apunta al `5432/tcp` del contenedor (por ejemplo `0.0.0.0:55012->5432/tcp`; el número cambia en cada ejecución) y
otra con la imagen `testcontainers/ryuk`.

**Output esperado** (paso 3):

```text
0
```

**Output esperado** (paso 4): falla «guardar dos veces el mismo id actualiza en lugar de duplicar (ON CONFLICT)»
con el error de PostgreSQL `duplicate key value violates unique constraint "pedidos_pkey"`; un doble en memoria
basado en un `Map` nunca habría detectado ese cambio.

**Captura comentada:** casi todo el tiempo (unos 3 s en el Mac; 9 s o más en máquinas más lentas) es el arranque del
contenedor en `beforeAll`; cada test tarda milisegundos. El primer test deja constancia de que hablas con un servidor real (`SHOW server_version`) y de que el
puerto lo eligió Docker.

#### 11. VERIFICACIÓN

```bash
npm run test:contenedores
```

Debe terminar en `Tests:       6 passed, 6 total`, y después `docker ps` no debe listar ningún contenedor
`postgres:18.7`. El test es `f108-testcontainers/repositorio.test.ts` (sección 9).

**Pregunta de comprobación:** ¿por qué el contenedor se crea en `beforeAll` y los datos se borran en `beforeEach`,
y no al revés? (Respuesta: arrancar el contenedor cuesta segundos y vaciar una tabla, milisegundos. Un contenedor
por test multiplicaría el tiempo por el número de tests sin dar más aislamiento que el `TRUNCATE`; y no borrar entre
tests haría que el resultado dependa del orden.)

#### 12. ERROR COMÚN

**Síntoma:** todos los tests del archivo fallan en bloque antes de empezar, en tu máquina o en CI.

**Cómo se ve** (salida real de `npm run test:contenedores` cuando el proceso no puede hablar con Docker: Docker
Desktop apagado, o un usuario sin permiso sobre el socket de Docker):

```text
FAIL contenedores f108-testcontainers/repositorio.test.ts
  RepositorioDePedidos contra PostgreSQL real
    ✕ el contenedor es un PostgreSQL de verdad, en un puerto que no es el 5432 del anfitrión
    ✕ guardar y buscar conservan el jsonb
    …

  ● RepositorioDePedidos contra PostgreSQL real › el contenedor es un PostgreSQL de verdad, en un puerto que no es el 5432 del anfitrión

    Could not find a working container runtime strategy

      15 |   beforeAll(async () => {
      16 |     // UN contenedor para todo el archivo: versión fija (la misma de producción), puerto libre elegido por Docker.
    > 17 |     contenedor = await new PostgreSqlContainer(process.env.IMAGEN_POSTGRES ?? 'postgres:18.7').start();
         |                  ^
```

**Diagnóstico visual:** el fallo está en la línea del `.start()` dentro de `beforeAll`, y por eso caen **todos** los
tests a la vez con el mismo mensaje: no es tu SQL. «No encontré un entorno de contenedores que funcione» significa
que Testcontainers probó las formas que conoce de llegar a Docker y ninguna respondió. **Arreglo:** ejecuta
`docker info`. Si falla, enciende Docker Desktop (o arranca el servicio en Linux); si responde con `sudo` pero no sin
él, añade tu usuario al grupo `docker`; en CI, usa un *runner* que tenga Docker. Para ver qué intentó:
`DEBUG=testcontainers* npm run test:contenedores`.

El segundo clásico tiene otro mensaje. Si el contenedor arranca pero la imagen no se puede descargar (sin red, o un
registro bloqueado por un proxy), el error real es del propio Docker y nombra la imagen:

```text
(HTTP code 500) server error - failed to resolve reference "docker.io/library/postgres:18.7": failed to do request: Head "https://registry-1.docker.io/v2/library/postgres/manifests/18.7": …
```

Ahí el arreglo es de red: `docker pull postgres:18.7` a mano hasta que funcione, o configurar el registro espejo de
tu empresa. Y si lo que ves es `Exceeded timeout of 5000 ms for a hook`, falta el `jest.setTimeout`.

#### 13. PREGUNTA DE ENTREVISTA

«¿Por qué probar el acceso a datos contra una base real en contenedor en lugar de usar mocks o una base en memoria?
¿Cómo evitas que esos tests sean lentos?»

**Respuesta modelo:** porque lo que quiero comprobar es justo lo que el mock no tiene: que mi SQL es válido en ese
motor, que las restricciones y los índices únicos se comportan como espero, que los tipos (`jsonb`, fechas,
enteros grandes) van y vuelven bien por el driver y que las migraciones se aplican. Un mock del pool devuelve lo que
yo le programé; una base en memoria tipo SQLite habla otro dialecto y no tiene `ON CONFLICT … DO UPDATE` igual ni
`jsonb`. Con Testcontainers arranco desde el test la misma versión de PostgreSQL que en producción, en un puerto
aleatorio, y se destruye al acabar, así que no hay estado compartido ni «en mi máquina funciona». Para la velocidad:
un contenedor por archivo o por suite, no por test; limpio datos con `TRUNCATE` o con una transacción que deshago;
separo estos tests de los unitarios para que el ciclo rápido no dependa de Docker; y mantengo pocos, enfocados en
los repositorios. Lo demás se cubre más abajo en la pirámide.

#### 14. ANTI-PATRÓN RELACIONADO

**La base de datos de pruebas compartida** (y su versión local: «antes de los tests, levanta tú la base»): todos
los desarrolladores y el CI apuntan a la misma instancia, con datos que nadie controla.

```typescript
// ❌ Depende de una base que alguien instaló, en un puerto fijo, con datos de ejecuciones anteriores y de otras personas.
const pool = new Pool({ connectionString: 'postgres://qa:qa@db-pruebas.interna:5432/qa' });

test('resumen de ana', async () => {
  // pasa o falla según lo que otro test (u otra persona) haya dejado en la tabla
  await expect(new RepositorioDePedidos(pool).resumen('ana')).resolves.toEqual({ pagado: 120000, pendientes: 1 });
});

// ✅ El test trae su propia base: versión fija, vacía, puerto libre, destruida al terminar.
const contenedor = await new PostgreSqlContainer('postgres:18.7').start();
const poolAislado = new Pool({ connectionString: contenedor.getConnectionUri() });
```

**Cómo se ve:** tests que fallan «solo a veces» y pasan al reintentar; fallos cuando dos *pipelines* corren a la
vez; un `DELETE FROM pedidos` en un `beforeEach` que borra los datos del compañero; miedo a actualizar la versión de
la base porque «rompe los tests de todos». Los vecinos de este anti-patrón son la imagen `postgres:latest` (el
motor cambia sin avisar) y **un contenedor por test** (aislamiento perfecto, suite de 20 minutos).
