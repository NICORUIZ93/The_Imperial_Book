# Módulo 7: Gestión de estado global


## Aprende construyendo

### Tema 1: Zustand — stores mínimos sin boilerplate

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear un store de Zustand para el filtro de zona de RutaFlow (`useFiltroStore`), compartido entre `BarraFiltro` y `PanelEnvios` sin ningún Provider. Prerrequisitos: Módulo 6 completo.

#### Paso 2 · Contexto y caso real
El filtro de zona seleccionado necesita leerse tanto en `BarraFiltro` (para mostrar el valor activo) como en `PanelEnvios` (para pasar `zona` a `useQuery`), sin que ninguno sea ancestro directo del otro.

#### Paso 3 · Teoría, modelo mental y analogía
Zustand crea un store global con una función `create()`, sin requerir ningún Provider; la suscripción selectiva re-renderiza solo a quien lee la porción que efectivamente cambió.

**Diagrama: Zustand vs Redux vs Context**

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

**Evidencia de aprendizaje:** entrega store compartido, divergencia detectada y tercer consumidor sincronizado.
**Conceptos clave:** `create`, suscripción selectiva, sin Provider obligatorio.

Zustand crea un store global mediante una única función `create((set, get) => ({...}))`, donde `set` actualiza el estado (de forma similar en espíritu a un setter de `useState` pero operando sobre un store compartido fuera del árbol de componentes) y `get` lee el estado actual dentro de las propias acciones del store (`total: () => get().items.reduce((s, i) => s + i.precio, 0)`), sin requerir ningún `Provider` envolvente en el árbol de componentes (a diferencia de Context, Módulo 4, que exige un Provider explícito para que sus consumidores funcionen).

La característica más importante de Zustand para el rendimiento es la suscripción selectiva: `const items = useCarrito(state => state.items)` suscribe al componente únicamente a la porción específica del store que la función selectora extrae (`state.items`), re-renderizando ese componente solo cuando esa porción específica cambia, no ante cualquier cambio en cualquier otra parte del store, resolviendo directamente el problema de granularidad de re-render que Context tiene (Módulo 4, Tema 2), donde cualquier consumidor se re-renderiza ante cualquier cambio del valor completo provisto, sin distinción de qué porción específica cambió.

**Analogía:** Zustand es como un tablero de anuncios central donde cada persona puede suscribirse específicamente solo a la sección del tablero que le interesa, notificándose únicamente cuando esa sección específica cambia, en vez de recibir una notificación cada vez que cualquier sección del tablero completo se actualiza.

**¿Por qué es importante?** La suscripción selectiva de Zustand evita re-renders innecesarios de componentes que no dependen de la porción específica del estado que cambió, un problema que Context no resuelve de forma nativa.

**Código del ejemplo:**

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

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow

#### Paso 4 · Demostración guiada desde cero
```jsx
const useFiltroStore = create((set) => ({
  zona: 'todas',
  setZona: (zona) => set({ zona }),
}));

function BarraFiltro() {
  const zona = useFiltroStore(state => state.zona); // solo re-renderiza si `zona` cambia
  const setZona = useFiltroStore(state => state.setZona);
  return <select value={zona} onChange={e => setZona(e.target.value)}>...</select>;
}
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: `PanelEnvios`, en cualquier otra parte del árbol, lee `useFiltroStore(state => state.zona)` y recibe el mismo valor actualizado sin que ningún Provider envuelva a ninguno de los dos componentes.

#### Paso 5 · Práctica guiada
Pista: agregá un segundo `useState('todas')` local dentro de `PanelEnvios` "para la zona", en vez de leer del store — ese es el fallo deliberado: cambiar la zona en `BarraFiltro` actualiza el store, pero `PanelEnvios` sigue consultando su propio `useState` local desincronizado, mostrando envíos de una zona distinta a la que `BarraFiltro` muestra seleccionada.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo `PanelEnvios` a leer `useFiltroStore`, y agregá un tercer componente (`ContadorZona`) que también lea `zona` del mismo store, confirmando que los tres siempre muestran el mismo valor sin ninguna sincronización manual entre ellos.

#### Paso 7 · Cierre y evidencia
Entregá el store compartido del Paso 4, la divergencia por estado duplicado del Paso 5, y el tercer consumidor del Paso 6; explicá por qué tener dos fuentes de verdad para el mismo dato es el mismo problema de fondo que una base de datos duplicada sin sincronización, solo que a escala de un componente. Siguiente paso: estudia Redux Toolkit para comparar la ceremonia. Errores comunes: duplicar en estado local un valor que ya vive en el store global, suscribirse al store completo en vez de seleccionar la porción necesaria, y usar un store global para un valor que solo necesita un único componente. Fuentes oficiales: https://zustand.docs.pmnd.rs/getting-started/introduction y https://zustand.docs.pmnd.rs/guides/typescript.
**¿Por qué es importante?** La suscripción selectiva de Zustand evita re-renders innecesarios, y un store único como fuente de verdad evita la divergencia que ocurre cuando el mismo dato vive duplicado en dos lugares.

### Tema 2: Redux Toolkit — slices y ceremonia

#### Paso 1 · Objetivo y preparación
Al finalizar vas a reimplementar el store de filtro de zona del Tema 1 con Redux Toolkit, para comparar directamente la cantidad de código y ceremonia frente a Zustand. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
El equipo de RutaFlow está evaluando si migrar todo su estado de cliente a Redux Toolkit porque "es el estándar de la industria", sin haber medido todavía cuánto código adicional eso implica para un caso tan simple como un filtro de zona.

#### Paso 3 · Teoría, modelo mental y analogía
Redux Toolkit reduce el boilerplate del Redux clásico con `createSlice` e Immer, pero sigue requiriendo slice + store central + Provider, más ceremonia que la función única de Zustand.

**Evidencia de aprendizaje:** entrega implementación con Redux Toolkit, selector de granularidad gruesa detectado y corrección con selector específico.
**Conceptos clave:** `createSlice`, Immer para mutación segura, comparación de ceremonia con Zustand.

Redux Toolkit es la forma moderna y recomendada de usar Redux, reduciendo drásticamente el boilerplate del Redux clásico (que requería definir manualmente constantes de action types, creadores de actions, y reducers con switch statements extensos): `createSlice({ name: 'carrito', initialState: { items: [] }, reducers: { agregar: (state, action) => { state.items.push(action.payload); } } })` genera automáticamente los creadores de actions y el reducer correspondiente a partir de una única definición declarativa, y crucialmente usa Immer internamente, permitiendo escribir código que "parece" mutar el estado directamente (`state.items.push(...)`) mientras Immer, por debajo, produce en realidad un nuevo objeto de estado inmutable, preservando la garantía de inmutabilidad que Redux requiere sin que el desarrollador tenga que escribir manualmente el spread de objetos y arreglos.

A pesar de esta reducción significativa de boilerplate respecto al Redux clásico, Redux Toolkit sigue trayendo más ceremonia estructural que Zustand para el mismo caso de uso: un store de Redux Toolkit requiere definir slices, configurar un store central, y envolver la aplicación con un `Provider` de Redux, mientras que el mismo carrito implementado con Zustand (Tema 1) es una única función `create()` sin ninguna infraestructura adicional, reflejando la misma relación de ceremonia frente a beneficio estudiada para NgRx frente a un store de signals en el Módulo 9 del track de Angular: Redux Toolkit se justifica cuando el proyecto necesita las herramientas de depuración de historial (Redux DevTools), RTK Query para gestión de datos del servidor integrada, o un patrón único obligatorio en un equipo grande.

**Analogía:** Redux Toolkit es como un sistema de contabilidad corporativo con procedimientos estandarizados y auditoría integrada, considerablemente más simple que la contabilidad manual tradicional (Redux clásico) pero todavía más formal y estructurado que llevar las cuentas en una libreta simple (Zustand).

**¿Por qué es importante?** Redux Toolkit reduce drásticamente el boilerplate del Redux clásico mediante `createSlice` e Immer, pero sigue trayendo más ceremonia estructural que Zustand, justificada cuando se necesitan sus herramientas de depuración o su ecosistema (RTK Query).

**Código del ejemplo:**

```jsx
const carritoSlice = createSlice({
  name: 'carrito',
  initialState: { items: [] },
  reducers: {
    agregar: (state, action) => { state.items.push(action.payload); }, // Immer permite "mutar" de forma segura
  },
});
```

* Ejecutar: `npm test`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

#### Paso 4 · Demostración guiada desde cero
```jsx
const filtroSlice = createSlice({
  name: 'filtro',
  initialState: { zona: 'todas' },
  reducers: {
    setZona: (state, action) => { state.zona = action.payload; }, // Immer permite "mutar" de forma segura
  },
});
const store = configureStore({ reducer: { filtro: filtroSlice.reducer } });
// y envolver la app: <Provider store={store}>...
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: lograr el mismo comportamiento que el store de Zustand del Tema 1 exige además definir el slice, configurar `configureStore`, y envolver la aplicación completa con `<Provider>` — tres piezas de infraestructura que Zustand no necesitó para el mismo filtro de zona.

**Demo con Redux DevTools:**
1. Abre la app con Redux Toolkit implementado
2. Abre DevTools → Redux tab (necesitas la extensión Redux DevTools instalada)
3. Haz click en el botón de cambiar zona
4. Observa en la pestaña Redux el "action log" que muestra cada dispatch: `filtro/setZona` con el payload
5. Mira en el panel de "State" cómo el estado se actualizó: `{ filtro: { zona: 'norte' } }`
6. Usa el time-travel: haz click en el action anterior en el log para "revertir" el estado al punto anterior
7. Resultado esperado: ver el historial completo de actions y poder viajar atrás en el tiempo, una herramienta de depuración que Zustand no ofrece por defecto (aunque hay extensiones de terceros).

#### Paso 5 · Práctica guiada
Pista: usá `useSelector(state => state.filtro)` en un componente para leer todo el slice `filtro` en vez de `useSelector(state => state.filtro.zona)` — ese es el fallo deliberado: si el slice `filtro` más adelante agrega otro campo (`orden`) que cambia con frecuencia, ese componente se re-renderiza también ante cambios de `orden`, aunque solo le interese `zona`.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo el selector específico (`state => state.filtro.zona`), y envolvé la aplicación con `<Provider store={store}>`, confirmando que el componente ya no se re-renderiza ante cambios de otros campos del mismo slice.

#### Paso 7 · Cierre y evidencia
Entregá la implementación con Redux Toolkit del Paso 4, el selector de granularidad gruesa detectado en el Paso 5, y la corrección del Paso 6; contá explícitamente cuántas piezas adicionales necesitó Redux Toolkit frente a la única función de Zustand del Tema 1 para el mismo caso. Siguiente paso: estudia cuándo ninguno de los dos es necesario. Errores comunes: usar un selector que lee más del slice de lo que el componente realmente necesita, adoptar Redux Toolkit "porque es el estándar" sin medir el costo real de ceremonia, y olvidar envolver la aplicación con el `Provider` de Redux. Fuentes oficiales: https://redux-toolkit.js.org/tutorials/quick-start y https://react-redux.js.org/api/hooks.
**¿Por qué es importante?** Redux Toolkit reduce el boilerplate del Redux clásico, pero sigue trayendo más ceremonia estructural que Zustand para el mismo caso, una diferencia medible y no solo una preferencia estilística.

### Tema 3: Estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto

#### Paso 1 · Objetivo y preparación
Al finalizar vas a clasificar cada pieza de estado del panel de RutaFlow (lista de envíos, filtro de zona, modal de confirmación abierto) según si pertenece a TanStack Query, a Zustand, o a un simple `useState` local. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Alguien propuso guardar la lista de envíos (que viene de la API) dentro del mismo store de Zustand que ya tiene el filtro de zona, "para tener todo centralizado en un solo lugar".

#### Paso 3 · Teoría, modelo mental y analogía
El estado de servidor (datos de una API, sujetos a expiración y revalidación) pertenece a TanStack Query; el estado de cliente puro (un modal abierto, un filtro) pertenece a Zustand/Context/`useState`; mezclarlos reimplementa peor lo que TanStack Query ya ofrece.

**Evidencia de aprendizaje:** entrega mezcla incorrecta identificada, divergencia provocada y store limpio con responsabilidades separadas.
**Conceptos clave:** separación de responsabilidades entre TanStack Query y estado global, sobre-ingeniería evitable.

El estado de servidor (datos que provienen de una API externa, sujetos a expiración, necesitados de revalidación periódica, y potencialmente compartidos entre múltiples usuarios simultáneos) pertenece conceptualmente a TanStack Query (Módulo 6), que ya resuelve cache, invalidación y refetch específicamente para ese tipo de estado; el estado de cliente puro (si un modal está abierto, qué pestaña está activa, el tema visual seleccionado) pertenece a Zustand, Context, o simplemente `useState` local, dado que ese estado no tiene ningún origen ni necesidad de sincronización con un servidor externo.

Mezclar ambos tipos de estado en el mismo store (por ejemplo, guardar tanto la lista de tareas obtenida de una API como el estado de si un modal está abierto en el mismo store de Zustand) suele complicar innecesariamente ambos casos: el estado de servidor terminaría reimplementando manualmente (de forma más pobre) la cache, invalidación y revalidación que TanStack Query ya ofrece de fábrica, mientras que el estado de cliente puro no se beneficia en nada de vivir junto a datos de red que tienen un ciclo de vida completamente distinto.

Finalmente, una parte importante de gestión de estado con criterio es reconocer cuándo ninguna librería de estado global es necesaria en absoluto: si el estado relevante solo se usa dentro de un único componente (o un componente y sus hijos directos, pasables cómodamente vía props), introducir Zustand, Redux, o incluso Context es sobre-ingeniería que agrega indirección sin ningún beneficio real; `useState` local sigue siendo, en la inmensa mayoría de los casos, la herramienta correcta por defecto.

**Analogía:** mezclar estado de servidor y de cliente en el mismo store es como guardar en el mismo cajón tanto la correspondencia que llega diariamente del exterior (que necesita revisarse y actualizarse constantemente) como los objetos personales fijos que nunca cambian, complicando la gestión de ambos innecesariamente; reconocer cuándo no se necesita ninguna librería es como no instalar un sistema de gestión de inventario completo para organizar tres objetos personales en un cajón.

**¿Por qué es importante?** Separar claramente estado de servidor (TanStack Query) de estado de cliente (Zustand/Context/`useState`) evita reimplementar manualmente capacidades que TanStack Query ya ofrece, y evita complicar estado de cliente simple con infraestructura innecesaria; reconocer cuándo ningún estado global es necesario evita sobre-ingeniería.

**Diagrama:**

```
Estado de servidor (API, cache, expiración) → TanStack Query
Estado de cliente puro (modal abierto, tema) → Zustand / Context / useState local
Estado usado en un único componente → useState local, sin ninguna librería global
```

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

#### Paso 4 · Demostración guiada desde cero
```jsx
// Mal: mezclar estado de servidor dentro del store de cliente
const useFiltroStore = create((set) => ({
  zona: 'todas',
  envios: [], // esto no debería vivir acá
  setEnvios: (envios) => set({ envios }),
}));
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: con `envios` metido en Zustand, cualquier necesidad de revalidación, cache por zona, o invalidación tras una mutación (todo lo que TanStack Query ya resuelve, Módulo 6) tendría que reimplementarse manualmente dentro del store — y efectivamente nadie lo hace, dejando esos datos sin revalidar nunca después de la carga inicial.

#### Paso 5 · Práctica guiada
Pista: implementá un botón "Refrescar" que llame manualmente a `setEnvios(nuevosDatos)` después de un `fetch` directo, en paralelo a seguir usando `useQuery` para la carga inicial en otro componente — ese es el fallo deliberado: ahora hay dos fuentes de la lista de envíos (la cache de TanStack Query y la copia en Zustand), y pueden mostrar datos distintos entre sí según cuál se refrescó más recientemente.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 quitando `envios` y `setEnvios` del store de Zustand por completo, dejando que `useQuery` (Módulo 6) sea la única fuente de la lista de envíos, y que el store de Zustand contenga solamente `zona` (estado de cliente puro).

#### Paso 7 · Cierre y evidencia
Entregá la mezcla incorrecta del Paso 4, las dos fuentes divergentes provocadas en el Paso 5, y el store limpio del Paso 6; explicá con tus propias palabras por qué "centralizar todo en un solo store" ignora que el estado de servidor y el de cliente tienen ciclos de vida fundamentalmente distintos. Siguiente paso: estudia Jotai y XState como alternativas para casos específicos. Errores comunes: guardar datos de una API dentro de un store de estado de cliente, mantener dos fuentes de verdad para el mismo dato remoto, e introducir cualquier librería de estado global para un valor que solo necesita un componente y sus hijos directos. Fuentes oficiales: https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state y https://zustand.docs.pmnd.rs/getting-started/introduction.
**¿Por qué es importante?** Separar estado de servidor (TanStack Query) de estado de cliente (Zustand) evita reimplementar manualmente capacidades que TanStack Query ya ofrece, y evita que el mismo dato remoto tenga dos fuentes de verdad divergentes.

### Tema 4: Jotai, Recoil y XState como alternativas

#### Paso 1 · Objetivo y preparación
Al finalizar vas a modelar con XState el ciclo de vida de una confirmación de entrega (inactivo → confirmando → éxito/error), rechazando explícitamente transiciones inválidas que un `useReducer` simple no impediría. Prerrequisitos: Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
Con el `useReducer` del Módulo 2, nada impide escribir por error una transición de "éxito" directamente a "confirmando" sin pasar por "inactivo" — una secuencia que no debería ser posible en el flujo real de confirmación.

#### Paso 3 · Teoría, modelo mental y analogía
XState modela estado como una máquina de estados finitos con transiciones explícitamente definidas; un estado solo puede alcanzarse desde las transiciones que la máquina efectivamente declara, rechazando cualquier otra.

**Evidencia de aprendizaje:** entrega máquina con transiciones explícitas, transición inválida detectada en el reducer simple y quinto estado agregado.
**Conceptos clave:** modelo atómico frente a store centralizado, máquinas de estado explícitas.

Jotai modela el estado global como átomos independientes y pequeños (`const contadorAtom = atom(0)`) en vez de un único store centralizado grande, permitiendo componer átomos derivados a partir de otros átomos de forma similar en espíritu a `computed()` de signals (Módulo 2 del track de Angular), con una granularidad de suscripción naturalmente fina dado que cada átomo es independiente por diseño; Recoil ofrece un modelo conceptualmente similar basado en "atoms" y "selectors" (valores derivados memoizados), aunque con menor adopción activa actualmente que Jotai en el ecosistema.

XState modela estado como una máquina de estados finitos explícita, con estados nombrados y transiciones explícitamente definidas entre ellos (por ejemplo, un estado "inactivo" que solo puede transicionar a "cargando" ante cierto evento, que a su vez solo puede transicionar a "éxito" o "error"), apropiado específicamente para flujos con reglas de transición complejas y estrictas donde ciertos estados simplemente no deberían ser alcanzables desde ciertos otros estados, una garantía estructural que un simple `useState`/`useReducer` no impone por sí solo (nada impide, en un reducer simple, escribir una transición de estado lógicamente inválida por error, mientras que una máquina de estados de XState rechaza explícitamente transiciones no definidas).

**Analogía:** Jotai es como gestionar el inventario mediante etiquetas individuales pequeñas e independientes en cada producto, en vez de un único gran libro de inventario centralizado; XState es como un diagrama de flujo estricto de un proceso de fábrica, donde cada estación solo puede recibir el producto desde ciertas estaciones anteriores específicas, rechazando explícitamente cualquier secuencia de transición no contemplada en el diagrama.

**¿Por qué es importante?** Jotai/Recoil ofrecen un modelo atómico con granularidad fina por diseño; XState aporta garantías estructurales sobre qué transiciones de estado son válidas, apropiado para flujos con reglas de transición complejas y estrictas.

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

* Ejecutar: `npm test -- --testNamePattern="xstate|state machine"`
* Código: `src/hooks/useDeliveryMachine.tsx`

---

#### Paso 4 · Demostración guiada desde cero
```jsx
const maquinaConfirmacion = createMachine({
  initial: 'inactivo',
  states: {
    inactivo: { on: { CONFIRMAR: 'confirmando' } },
    confirmando: { on: { EXITO: 'exito', ERROR: 'error' } },
    exito: {},
    error: { on: { CONFIRMAR: 'confirmando' } },
  },
});
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: enviar el evento `EXITO` mientras la máquina está en `inactivo` no produce ninguna transición (la máquina permanece en `inactivo`), porque ese estado solo declara una transición válida para el evento `CONFIRMAR` — a diferencia de un reducer manual, donde un `case 'EXITO':` sin ninguna guarda aplicaría ese cambio sin importar el estado actual.

#### Paso 5 · Práctica guiada
Pista: implementá el mismo flujo con un `useReducer` simple donde el `case 'EXITO'` no verifica el estado actual antes de aplicar la transición — ese es el fallo deliberado: llamar `dispatch({ type: 'EXITO' })` estando en `inactivo` (por un bug en otra parte del código) transiciona igual a `exito`, un estado lógicamente imposible en el flujo real, sin que nada en el reducer lo haya impedido.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 volviendo a la máquina de XState del Paso 4, y agregá un quinto estado (`cancelado`) alcanzable solo desde `confirmando`, confirmando que ningún otro estado puede transicionar directamente a `cancelado` sin pasar por `confirmando` primero.

#### Paso 7 · Cierre y evidencia
Entregá la máquina con transiciones explícitas del Paso 4, la transición inválida permitida por el reducer simple del Paso 5, y el quinto estado agregado del Paso 6; explicá en qué tipo de flujo (con reglas de transición estrictas y consecuencias reales si se viola el orden) XState aporta una garantía estructural que un `useReducer` simple no ofrece por sí solo. Siguiente paso: cerrá el módulo documentando qué estrategia de estado usa cada parte del proyecto integrador. Errores comunes: usar XState para estados triviales sin reglas de transición reales, escribir un reducer sin guardas que permita transiciones lógicamente imposibles, y no documentar explícitamente qué transiciones están permitidas en un flujo crítico. Fuentes oficiales: https://stately.ai/docs/machines y https://jotai.org/docs/introduction.
**¿Por qué es importante?** XState aporta garantías estructurales sobre qué transiciones de estado son válidas, una protección que un `useReducer` simple no impone por sí solo y que importa en flujos con reglas estrictas.

## Laboratorio práctico

**Objetivo del laboratorio:** construir un carrito de compras con Zustand, y la misma funcionalidad con Redux Toolkit para comparar.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear el store de Zustand del carrito | Ver Tema 1 | `items`, `agregar`, `quitar`, `total` |
| 2 | Consumirlo desde dos componentes no relacionados | Ver Tema 1 | Verifica la suscripción selectiva |
| 3 | Implementar el mismo carrito con Redux Toolkit | Ver Tema 2 | Compara la cantidad de código |
| 4 | Clasificar el estado de tu propio proyecto | Ver Tema 3 | Servidor (TanStack Query) vs cliente (Zustand) |

**Verificación:** el laboratorio se considera exitoso si ambos componentes reflejan el mismo estado del carrito de Zustand en tiempo real, y si puedes explicar concretamente la diferencia de ceremonia entre la implementación de Zustand y la de Redux Toolkit.

**Errores comunes y soluciones**

- **Mezclar estado de servidor y de cliente en el mismo store.** Sepáralos: TanStack Query para servidor, Zustand/Context para cliente.
- **Introducir Zustand o Redux para estado usado en un único componente.** Usa `useState` local en ese caso.
- **Suscribirse al store completo en vez de seleccionar la porción específica necesaria.** Usa una función selectora (`state => state.items`) para limitar los re-renders.

---

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Visualización: concepto mostrado en diagrama
