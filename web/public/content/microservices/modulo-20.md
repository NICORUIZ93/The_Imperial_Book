# Módulo 16 · Testing

**Fase 2 · Node.js de cero a experto** (semana 4 de 12, segunda mitad). **Duración:** 10 h (4 temas de 2 h y 2 h de
laboratorio integrador). **Dificultad:** 3 de 5. **Dependencias:** Módulo 14 (API con Express y TypeScript) y
Módulo 15 (PostgreSQL con `pg`, database-per-service); de la Fase 0, Docker básico. No necesita la Fase 1.
**Herramientas:** **Node.js 26.13.1 LTS**, **TypeScript 6.0.3**, **jest 30.5.2** con **ts-jest 29.4.15**,
**supertest 7.3.2**, **express 5.3.0**, **@pact-foundation/pact 17.1.4** y **@pact-foundation/pact-cli 18.10.9**,
**testcontainers** y **@testcontainers/postgresql 12.2.2**, **pg 8.23.1**; **Pact Broker 2.124.0** y
**PostgreSQL 18.7** con Docker.
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

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Escribir tests unitarios con Jest usando el patrón preparar–ejecutar–comprobar, tablas de casos y los matchers adecuados, sustituir dependencias (un servicio remoto, el reloj y un módulo) por dobles de prueba y medir la cobertura; lo compruebas cuando npx jest f105-jest --selectP…

#### ► LA IDEA EN UNA FRASE
**Escribir tests unitarios con Jest usando el patrón preparar–ejecutar–comprobar, tablas de casos y los matchers adecuados, sustituir dependencias (un servicio remoto, el reloj y un módulo) por dobles de prueba y medir la cobertura; lo compruebas cuando npx jest f105-jest --selectProjects unit pasa 16 de 16 y explicas por qué un test sin await no prueba nada.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en jest como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un **test** es código que llama a tu código con datos conocidos y comprueba que el resultado es el esperado.
2. **Jest** es el programa que encuentra tus tests (archivos `*.test.ts`), los ejecuta y te dice cuáles pasaron
3. `test('nombre', () => { … })` define un test. `expect(valor).toBe(esperado)` es una **aserción**: la comprobación.
4. `describe('grupo', …)` agrupa tests relacionados.
5. Un **doble de prueba** es un sustituto de algo que tu código necesita pero que no quieres usar de verdad en el test

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Jest se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Jest | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Probar el doble (*testing the mock*): el test configura un mock y después afirma lo que el propio mock devuelve. Ninguna línea de tu código puede hacerlo fallar.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: jest funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un **test** es código que llama a tu código con datos conocidos y comprueba que el resultado es el esperado.
- **Jest** es el programa que encuentra tus tests (archivos `*.test.ts`), los ejecuta y te dice cuáles pasaron
- `test('nombre', () => { … })` define un test. `expect(valor).toBe(esperado)` es una **aserción**: la comprobación.
- `describe('grupo', …)` agrupa tests relacionados.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve jest en tu contexto?
2. ¿Cómo sabrías que jest no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar jest?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Verificación
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

</details>

### Supertest

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Probar una API de Express de extremo a extremo dentro del proceso de test (ruta, middleware, validación, serialización y manejo de errores) con Supertest, comprobando estado, cabeceras y cuerpo, sin abrir un puerto fijo; lo compruebas cuando npx jest f106-supertest --selectProjec…

#### ► LA IDEA EN UNA FRASE
**Probar una API de Express de extremo a extremo dentro del proceso de test (ruta, middleware, validación, serialización y manejo de errores) con Supertest, comprobando estado, cabeceras y cuerpo, sin abrir un puerto fijo; lo compruebas cuando npx jest f106-supertest --selectProjects unit pasa 8 de 8 y sabes por qué la app y el listen viven en archivos distintos.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en supertest como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Una API recibe **peticiones HTTP** y devuelve **respuestas** con un código de estado (200 bien, 404 no existe…),
2. Podrías probarla a mano con `curl` cada vez que cambias algo. **Supertest** es una librería que hace esas
3. No necesitas arrancar el servidor en otra terminal: le pasas tu aplicación a `request(app)` y Supertest se encarga
4. Así pruebas lo que de verdad ve quien consume tu API: la URL, el código, el JSON.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Supertest se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Supertest | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Tests encadenados contra un servidor compartido: los tests dependen de un servidor ya encendido en un puerto fijo y del estado que dejó el test anterior.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: supertest funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Una API recibe **peticiones HTTP** y devuelve **respuestas** con un código de estado (200 bien, 404 no existe…),
- Podrías probarla a mano con `curl` cada vez que cambias algo. **Supertest** es una librería que hace esas
- No necesitas arrancar el servidor en otra terminal: le pasas tu aplicación a `request(app)` y Supertest se encarga
- Así pruebas lo que de verdad ve quien consume tu API: la URL, el código, el JSON.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve supertest en tu contexto?
2. ¿Cómo sabrías que supertest no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar supertest?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

#### Verificación
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

</details>

### Contract Testing con Pact

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Escribir el test de consumidor que genera el contrato entre pedidos e inventario, verificar ese contrato contra la API real del proveedor con estados de proveedor, y publicar contrato y resultado en un Pact Broker para decidir un despliegue con can-i-deploy; lo compruebas cuando…

#### ► LA IDEA EN UNA FRASE
**Escribir el test de consumidor que genera el contrato entre pedidos e inventario, verificar ese contrato contra la API real del proveedor con estados de proveedor, y publicar contrato y resultado en un Pact Broker para decidir un despliegue con can-i-deploy; lo compruebas cuando npm run test:pact:consumidor y npm run test:pact:proveedor pasan y, al renombrar un campo en el proveedor, la verificación falla nombrando el campo que falta.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en contract testing con pact como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Cuando un servicio (pedidos) llama a otro (inventario), los dos tienen que estar de acuerdo en la **forma** de la
2. El que llama es el **consumidor**; el que responde es el **proveedor**.
3. El problema: el equipo de inventario renombra un campo, sus tests pasan, despliega… y pedidos se rompe en
4. **Contract testing** convierte el acuerdo en un archivo que se prueba **en los dos lados por separado**, sin
5. **Pact** es la herramienta más usada para eso. El contrato lo genera el **consumidor** a partir de lo que de

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Contract Testing con Pact se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Contract Testing con Pact | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
Usar el contrato como test funcional del proveedor: el consumidor fija valores exactos y escribe una interacción por cada regla de negocio del proveedor.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: contract testing con pact funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cuando un servicio (pedidos) llama a otro (inventario), los dos tienen que estar de acuerdo en la **forma** de la
- El que llama es el **consumidor**; el que responde es el **proveedor**.
- El problema: el equipo de inventario renombra un campo, sus tests pasan, despliega… y pedidos se rompe en
- **Contract testing** convierte el acuerdo en un archivo que se prueba **en los dos lados por separado**, sin

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve contract testing con pact en tu contexto?
2. ¿Cómo sabrías que contract testing con pact no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar contract testing con pact?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código de referencia / ejecutable
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

</details>

### Testcontainers para Node

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Escribir tests de integración que arrancan un PostgreSQL real en un contenedor desde el propio test, ejecutar contra él SQL específico del motor (ON CONFLICT, jsonb, FILTER) y garantizar datos limpios en cada test y limpieza al terminar; lo compruebas cuando npm run test:contened…

#### ► LA IDEA EN UNA FRASE
**Escribir tests de integración que arrancan un PostgreSQL real en un contenedor desde el propio test, ejecutar contra él SQL específico del motor (ON CONFLICT, jsonb, FILTER) y garantizar datos limpios en cada test y limpieza al terminar; lo compruebas cuando npm run test:contenedores pasa 6 de 6 y, al acabar, docker ps no muestra ningún contenedor del test.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en testcontainers para node como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

1. Un **test de integración** comprueba que tu código funciona junto con algo real de fuera: aquí, una base de datos.
2. Un **contenedor** es un programa empaquetado con todo lo que necesita, que Docker arranca aislado y puede borrar
3. **Testcontainers** es una librería que, **desde el test**, le pide a Docker un contenedor (por ejemplo, un
4. No instalas PostgreSQL, no compartes una base con nadie y no dejas datos de una ejecución para la siguiente.
5. El precio: necesitas Docker encendido y el test tarda segundos en lugar de milisegundos.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Testcontainers para Node se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Testcontainers para Node | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
La base de datos de pruebas compartida (y su versión local: «antes de los tests, levanta tú la base»): todos los desarrolladores y el CI apuntan a la misma instancia, con datos que nadie controla.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: testcontainers para node funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Un **test de integración** comprueba que tu código funciona junto con algo real de fuera: aquí, una base de datos.
- Un **contenedor** es un programa empaquetado con todo lo que necesita, que Docker arranca aislado y puede borrar
- **Testcontainers** es una librería que, **desde el test**, le pide a Docker un contenedor (por ejemplo, un
- No instalas PostgreSQL, no compartes una base con nadie y no dejas datos de una ejecución para la siguiente.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve testcontainers para node en tu contexto?
2. ¿Cómo sabrías que testcontainers para node no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar testcontainers para node?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Construcción guiada
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

#### Código de referencia / ejecutable
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

</details>
