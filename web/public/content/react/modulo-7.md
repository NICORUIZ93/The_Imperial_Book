# Módulo 7: Gestión de estado global


## Aprende construyendo

**Servidor del módulo:** cada ejemplo se sirve con `npm run dev` dentro del proyecto `mi-react` del módulo 0; abre `http://localhost:5173` para ver el resultado y ejecuta `npm test` para las pruebas (Vitest, configurado una sola vez en «Prepara las pruebas» del módulo 0). Si el puerto cambia, usa el que imprima la terminal.


### Tema 1: Zustand — stores mínimos sin boilerplate · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear un store de Zustand para el filtro de zona de RutaFlow (useFiltroStore), compartido entre BarraFiltro y PanelEnvios sin ningún Provider. Prerrequisitos: Módulo 6 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a crear un store de Zustand para el filtro de zona de RutaFlow (useFiltroStore), compartido entre BarraFiltro y PanelEnvios sin ningún Provider.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en zustand — stores mínimos sin boilerplate como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
graph TD
    A["Estado global necesario"]
    
    B["Complexity?"]
    B -->|Mínimo| C["Zustand<br/>create, sin Provider<br/>Suscripción selectiva"]
    B -->|Máximo| D["Redux Toolkit<br/>Slices, Actions<br/>Mucho boilerplate"]
    
    E["¿Es React?"]
    E -->|Sí, estado pequeño| F["Context API<br/>Provider + Hook<br/>Nativo de React"]
    
    style C fill:#e8f5e9
    style F fill:#e8f5e9
    style D fill:#fff3e0
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Zustand — stores mínimos sin boilerplate se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Zustand — stores mínimos sin boilerplate | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses zustand — stores mínimos sin boilerplate por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: zustand — stores mínimos sin boilerplate funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Zustand — stores mínimos sin boilerplate existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve zustand — stores mínimos sin boilerplate en tu contexto?
2. ¿Cómo sabrías que zustand — stores mínimos sin boilerplate no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar zustand — stores mínimos sin boilerplate?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
graph TD
    A["Estado global necesario"]
    
    B["Complexity?"]
    B -->|Mínimo| C["Zustand<br/>create, sin Provider<br/>Suscripción selectiva"]
    B -->|Máximo| D["Redux Toolkit<br/>Slices, Actions<br/>Mucho boilerplate"]
    
    E["¿Es React?"]
    E -->|Sí, estado pequeño| F["Context API<br/>Provider + Hook<br/>Nativo de React"]
    
    style C fill:#e8f5e9
    style F fill:#e8f5e9
    style D fill:#fff3e0
```

```jsx
const useCarrito = create((set, get) => ({
  items: [],
  agregar: (item) => set(state => ({ items: [...state.items, item] })),
  total: () => get().items.reduce((s, i) => s + i.precio, 0),
}));

function Carrito() {
  const items = useCarrito(state => state.items); // solo re-renderiza si `items` cambia
  return <ul>{items.map(i => <li key={i.id}>{i.nombre}</li>)}</ul>;
}
```

```jsx
import { create } from 'zustand';

const useFiltroStore = create((set) => ({
  zona: 'todas',
  setZona: (zona) => set({ zona }),
}));

function BarraFiltro() {
  const zona = useFiltroStore(state => state.zona); // solo re-renderiza si `zona` cambia
  const setZona = useFiltroStore(state => state.setZona);
  return (
    <select value={zona} onChange={e => setZona(e.target.value)} aria-label="Zona">
      <option value="todas">Todas</option>
      <option value="norte">Norte</option>
      <option value="sur">Sur</option>
    </select>
  );
}

function PanelEnvios() {
  const zona = useFiltroStore(state => state.zona);
  return <p>Mostrando envíos de: {zona}</p>;
}

export default function App() {
  // Sin Provider: los dos componentes leen el mismo store.
  return (
    <main>
      <BarraFiltro />
      <PanelEnvios />
    </main>
  );
}
```

```bash
npm install zustand
npm run dev
```

</details>

### Tema 2: Redux Toolkit — slices y ceremonia · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a reimplementar el store de filtro de zona del Tema 1 con Redux Toolkit, para comparar directamente la cantidad de código y ceremonia frente a Zustand. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a reimplementar el store de filtro de zona del Tema 1 con Redux Toolkit, para comparar directamente la cantidad de código y ceremonia frente a Zustand.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en redux toolkit — slices y ceremonia como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que redux toolkit — slices y ceremonia resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Redux Toolkit — slices y ceremonia se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Redux Toolkit — slices y ceremonia | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses redux toolkit — slices y ceremonia por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: redux toolkit — slices y ceremonia funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Redux Toolkit — slices y ceremonia existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve redux toolkit — slices y ceremonia en tu contexto?
2. ¿Cómo sabrías que redux toolkit — slices y ceremonia no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar redux toolkit — slices y ceremonia?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```jsx
const carritoSlice = createSlice({
  name: 'carrito',
  initialState: { items: [] },
  reducers: {
    agregar: (state, action) => { state.items.push(action.payload); }, // Immer permite "mutar" de forma segura
  },
});
```

```jsx
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';

const filtroSlice = createSlice({
  name: 'filtro',
  initialState: { zona: 'todas' },
  reducers: {
    setZona: (state, action) => { state.zona = action.payload; }, // Immer permite "mutar" de forma segura
  },
});
const { setZona } = filtroSlice.actions;
const store = configureStore({ reducer: { filtro: filtroSlice.reducer } });

function BarraFiltro() {
  const zona = useSelector(state => state.filtro.zona);
  const dispatch = useDispatch();
  return (
    <select value={zona} onChange={e => dispatch(setZona(e.target.value))} aria-label="Zona">
      <option value="todas">Todas</option>
      <option value="norte">Norte</option>
      <option value="sur">Sur</option>
    </select>
  );
}

function PanelEnvios() {
  const zona = useSelector(state => state.filtro.zona);
  return <p>Mostrando envíos de: {zona}</p>;
}

export default function App() {
  return (
    <Provider store={store}>
      <BarraFiltro />
      <PanelEnvios />
    </Provider>
  );
}
```

```bash
npm install @reduxjs/toolkit react-redux
npm run dev
```

</details>

### Tema 3: Estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a clasificar cada pieza de estado del panel de RutaFlow (lista de envíos, filtro de zona, modal de confirmación abierto) según si pertenece a TanStack Query, a Zustand, o a un simple useState local. Prerrequisitos: Tema 2 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a clasificar cada pieza de estado del panel de RutaFlow (lista de envíos, filtro de zona, modal de confirmación abierto) según si pertenece a TanStack Query, a Zustand, o a un simple useState local.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto en tu contexto?
2. ¿Cómo sabrías que estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
Estado de servidor (API, cache, expiración) → TanStack Query
Estado de cliente puro (modal abierto, tema) → Zustand / Context / useState local
Estado usado en un único componente → useState local, sin ninguna librería global
```

```jsx
import { create } from 'zustand';

// Mal: mezclar estado de servidor dentro del store de cliente
const useFiltroStore = create((set) => ({
  zona: 'todas',
  envios: [], // esto no debería vivir aquí
  setEnvios: (envios) => set({ envios }),
}));

export default function App() {
  const envios = useFiltroStore(state => state.envios);
  const setEnvios = useFiltroStore(state => state.setEnvios);
  return (
    <main>
      <button onClick={() => setEnvios([{ id: 'RF-4471' }])}>Cargar una vez</button>
      <ul>{envios.map(envio => <li key={envio.id}>{envio.id}</li>)}</ul>
      <p>Nadie vuelve a pedir esta lista: no hay caché por zona, ni revalidación, ni invalidación.</p>
    </main>
  );
}
```

```bash
npm install zustand
npm run dev
```

</details>

### Tema 4: Jotai y XState como alternativas · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a modelar con XState el ciclo de vida de una confirmación de entrega (inactivo → confirmando → éxito/error), rechazando explícitamente transiciones inválidas que un useReducer simple no impediría. Prerrequisitos: Tema 3 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a modelar con XState el ciclo de vida de una confirmación de entrega (inactivo → confirmando → éxito/error), rechazando explícitamente transiciones inválidas que un useReducer simple no impediría.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
XState modela estado como una máquina de estados finitos con transiciones explícitamente definidas; un estado solo puede alcanzarse desde las transiciones que la máquina efectivamente declara, rechazando cualquier otra.
**Conceptos clave:** modelo atómico frente a store centralizado, máquinas de estado explícitas.

Jotai modela el estado global como átomos independientes y pequeños (`const contadorAtom = atom(0)`) en vez de un único store centralizado grande, permitiendo componer átomos derivados a partir de otros átomos como valores calculados a partir de otros, con una granularidad de suscripción naturalmente fina dado que cada átomo es independiente por diseño. Quizá encuentres Recoil en proyectos antiguos, con un modelo parecido de "atoms" y "selectors": no lo uses en código nuevo, porque ya no se mantiene (su última versión en npm es de febrero de 2024 y un mantenedor lo confirmó en [el issue #2288](https://github.com/facebookexperimental/Recoil/issues/2288)); Jotai cubre el mismo modelo atómico.

XState modela estado como una máquina de estados finitos explícita, con estados nombrados y transiciones explícitamente definidas entre ellos (por ejemplo, un estado "inactivo" que solo puede transicionar a "cargando" ante cierto evento, que a su vez solo puede transicionar a "éxito" o "error"), apropiado específicamente para flujos con reglas de transición complejas y estrictas donde ciertos estados simplemente no deberían ser alcanzables desde ciertos otros estados, una garantía estructural que un simple `useState`/`useReducer` no impone por sí solo (nada impide, en un reducer simple, escribir una transición de estado lógicamente inválida por error, mientras que una máquina de estados de XState rechaza explícitamente transiciones no definidas).

**Analogía:** Jotai es como gestionar el inventario mediante etiquetas individuales pequeñas e independientes en cada producto, en vez de un único gran libro de inventario centralizado; XState es como un diagrama de flujo estricto de un proceso de fábrica, donde cada estación solo puede recibir el producto desde ciertas estaciones anteriores específicas, rechazando explícitamente cualquier secuencia de transición no contemplada en el diagrama.

**¿Por qué es importante?** Jotai ofrece un modelo atómico con granularidad fina por diseño; XState aporta garantías estructurales sobre qué transiciones de estado son válidas, apropiado para flujos con reglas de transición complejas y estrictas.

**Diagrama:**

```mermaid
stateDiagram-v2
    [*] --> Inactivo
    Inactivo --> Confirmando: CONFIRMAR
    Confirmando --> Exito: EXITO
    Confirmando --> Error: ERROR
    Error --> Confirmando: CONFIRMAR
    Exito --> [*]
    
    note right of Inactivo
        No acepta EXITO ni ERROR
    end note
    note right of Confirmando
        Solo transita a Exito o Error
    end note
```


---

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
```mermaid
stateDiagram-v2
    [*] --> Inactivo
    Inactivo --> Confirmando: CONFIRMAR
    Confirmando --> Exito: EXITO
    Confirmando --> Error: ERROR
    Error --> Confirmando: CONFIRMAR
    Exito --> [*]
    
    note right of Inactivo
        No acepta EXITO ni ERROR
    end note
    note right of Confirmando
        Solo transita a Exito o Error
    end note
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Jotai y XState como alternativas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Jotai y XState como alternativas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses jotai y xstate como alternativas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: jotai y xstate como alternativas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Jotai y XState como alternativas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve jotai y xstate como alternativas en tu contexto?
2. ¿Cómo sabrías que jotai y xstate como alternativas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar jotai y xstate como alternativas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
stateDiagram-v2
    [*] --> Inactivo
    Inactivo --> Confirmando: CONFIRMAR
    Confirmando --> Exito: EXITO
    Confirmando --> Error: ERROR
    Error --> Confirmando: CONFIRMAR
    Exito --> [*]
    
    note right of Inactivo
        No acepta EXITO ni ERROR
    end note
    note right of Confirmando
        Solo transita a Exito o Error
    end note
```

```jsx
import { createMachine } from 'xstate';
import { useMachine } from '@xstate/react';

const maquinaConfirmacion = createMachine({
  initial: 'inactivo',
  states: {
    inactivo: { on: { CONFIRMAR: 'confirmando' } },
    confirmando: { on: { EXITO: 'exito', ERROR: 'error' } },
    exito: {},
    error: { on: { CONFIRMAR: 'confirmando' } },
  },
});

export default function App() {
  const [estado, enviar] = useMachine(maquinaConfirmacion);
  return (
    <main>
      <p>Estado actual: {String(estado.value)}</p>
      <button onClick={() => enviar({ type: 'CONFIRMAR' })}>CONFIRMAR</button>
      <button onClick={() => enviar({ type: 'EXITO' })}>EXITO</button>
      <button onClick={() => enviar({ type: 'ERROR' })}>ERROR</button>
    </main>
  );
}
```

```bash
npm install xstate @xstate/react
npm run dev
```

```jsx
import { atom, useAtom, useAtomValue } from 'jotai';

const zonaAtom = atom('norte');
const etiquetaAtom = atom(get => `Zona seleccionada: ${get(zonaAtom).toUpperCase()}`); // átomo derivado

function SelectorZona() {
  const [zona, setZona] = useAtom(zonaAtom);
  return (
    <select value={zona} onChange={e => setZona(e.target.value)} aria-label="Zona">
      <option value="norte">Norte</option>
      <option value="sur">Sur</option>
    </select>
  );
}

function Etiqueta() {
  return <p>{useAtomValue(etiquetaAtom)}</p>;
}

export default function App() {
  // Sin Provider explícito, Jotai usa un almacén por defecto.
  return (
    <main>
      <SelectorZona />
      <Etiqueta />
    </main>
  );
}
```

</details>
