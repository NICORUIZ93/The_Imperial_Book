# Módulo 0: JSX, componentes y props


## Antes de comenzar: instala el entorno

React se estudia en el navegador, pero sus herramientas se ejecutan con Node.js. Instala **Node.js LTS**, **Git**, **Visual Studio Code** y un navegador moderno (Chrome, Edge o Firefox). No necesitas instalar React globalmente.

| Sistema | Instalación recomendada | Verificación |
|---|---|---|
| Windows | Instaladores oficiales de Node.js, Git y VS Code | `node -v`, `npm -v`, `git --version` en PowerShell |
| macOS | `brew install node git` después de instalar Homebrew | Los mismos tres comandos en Terminal |
| Ubuntu/Debian | Git con `apt`; Node LTS con `nvm` o NodeSource; VS Code desde su sitio oficial | Los mismos comandos en la terminal de VS Code |

### Crea tu primera aplicación

```bash
npm create vite@latest mi-react -- --template react
cd mi-react
npm install
npm run dev
```

Abre la dirección que muestra la terminal, normalmente `http://localhost:5173`. Edita `src/App.jsx`, guarda y confirma que el navegador cambia sin reiniciar el servidor. `npm install` descarga dependencias; `npm run dev` inicia el entorno de desarrollo; `Ctrl+C` lo detiene. Si aparece un error de permisos, no uses `sudo npm`: instala Node mediante `nvm` y vuelve a intentarlo.

### Prepara las pruebas (una sola vez)

El curso te pide `npm test` en muchos temas, pero la plantilla de Vite no trae ese script (si lo ejecutas ahora obtienes `npm error Missing script: "test"`). Configúralo una única vez dentro de `mi-react`: detén el servidor con `Ctrl+C` y ejecuta:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm pkg set scripts.test="vitest run"
```

Reemplaza `vite.config.js` por esta versión, que le dice a Vitest que simule un navegador con jsdom:

```js
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
})
```

Crea `src/setupTests.js`:

```js
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Desmonta lo renderizado por cada prueba para que no se mezclen.
afterEach(cleanup)
```

La primera prueba la escribes en el Tema 1. A partir de ahí, **todos los ejemplos del curso se ejecutan dentro de este mismo proyecto `mi-react`**: cuando un tema diga «pega el componente en `src/App.jsx`», reemplaza el contenido de ese archivo; cuando diga «Ejecuta `npm test`», Vitest ejecuta todos los archivos `*.test.jsx` de `src/`. Si un tema no trae su prueba escrita, escribe la tuya con el mismo patrón de `src/components/DeliveryCard.test.jsx` antes de ejecutar el comando.

## Mapa de la ruta

«React: fundamentos y aplicaciones» tiene 15 módulos en 4 etapas. Cada etapa se apoya en la anterior; usa la tabla para saltar a un módulo concreto.

```mermaid
flowchart LR
    E0["Fundamentos<br/>módulos 0–2"]
    E1["Aplicación<br/>módulos 3–5"]
    E2["Integración<br/>módulos 6–8"]
    E3["Experto<br/>módulos 9–14"]
    E0 --> E1
    E1 --> E2
    E2 --> E3
```

| Módulo | Etapa | Qué aprendes |
|---|---|---|
| 0 | Fundamentos | [JSX, componentes y props](/curso/react/0) |
| 1 | Fundamentos | [Estado local y el ciclo de render](/curso/react/1) |
| 2 | Fundamentos | [Hooks esenciales](/curso/react/2) |
| 3 | Aplicación | [Formularios y eventos](/curso/react/3) |
| 4 | Aplicación | [Context API y composición](/curso/react/4) |
| 5 | Aplicación | [React Router: navegación](/curso/react/5) |
| 6 | Integración | [Data fetching moderno](/curso/react/6) |
| 7 | Integración | [Gestión de estado global](/curso/react/7) |
| 8 | Integración | [Testing en React](/curso/react/8) |
| 9 | Experto | [Performance en React](/curso/react/9) |
| 10 | Experto | [Server Components y Next.js](/curso/react/10) |
| 11 | Experto | [TypeScript con React](/curso/react/11) |
| 12 | Experto | [Proyecto integrador: SPA con datos reales](/curso/react/12) |
| 13 | Experto | [React en producción: resiliencia, accesibilidad y seguridad](/curso/react/13) |
| 14 | Experto | [React Master: servidor, Next.js, a11y e i18n](/curso/react/14) |

## Aprende construyendo

**Servidor del módulo:** cada ejemplo se sirve con `npm run dev` dentro de `mi-react`; abre `http://localhost:5173` para ver el resultado y ejecuta `npm test` para las pruebas (configuradas en «Prepara las pruebas»). Si el puerto cambia, usa el que imprima la terminal.

### Tema 1: JSX es azúcar sintáctica sobre createElement · Básico · 40 min

#### Paso 1 · Objetivo y preparación
Al finalizar podrás crear un componente React desde cero. Prerrequisitos: Node.js LTS, npm y un editor. Verifica node --version y npm --version.

#### Paso 2 · Contexto y caso real
En un caso real de entregas, una pantalla transforma datos en componentes reutilizables y debe conservar identidad al actualizar listas. RutaFlow (Módulo 12) construirá su dashboard de rastreo de envíos con estos mismos componentes.

#### Paso 3 · Teoría, modelo mental y analogía
JSX describe elementos que React transforma; key identifica una instancia de lista; composición combina piezas y fragments evita nodos extra. La analogía es una plantilla de despacho: cada paquete tiene etiqueta estable y cada sección puede reemplazarse sin rehacer el almacén.

**Diagrama: Transformación JSX a createElement**

```mermaid
graph TD
    A["JSX: &lt;Boton texto='Enviar' onClick={...} /&gt;"] -->|Babel/Compilador| B["React.createElement<br/>Boton,<br/>props,<br/>children"]
    B -->|Runtime| C["Objeto de descripción<br/>{type, props, key, ref}"]
    C -->|Render| D["Elemento DOM real<br/>&lt;button&gt;...&lt;/button&gt;"]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
```

**Conceptos clave:** `createElement`, expresiones embebidas, JSX no es HTML.

`DeliveryCard` es el primer componente real del proyecto integrador de este track (SPA con datos reales, Módulo 12): la misma disciplina de props tipadas y key estable en listas se repetirá en cada componente que muestre datos de la API a lo largo del track.

**Cuándo no usarlo:** JSX y `createElement` son la base de React; si el proyecto no necesita interactividad ni estado (una página completamente estática), generar esa capa de componentes es más complejidad de la que aporta HTML plano — React se justifica en cuanto la UI necesita reaccionar a datos que cambian.

JSX es una extensión de sintaxis de JavaScript que permite escribir marcado similar a HTML directamente dentro de código JavaScript (`<button onClick={onClick}>{texto}</button>`), pero JSX no es HTML ni un lenguaje de plantillas propio: es transformado en tiempo de compilación (por Babel o el compilador integrado en el toolchain del proyecto) a llamadas planas de `React.createElement(tipo, props, ...hijos)`, que a su vez producen objetos JavaScript planos que describen qué debe renderizarse, no el elemento DOM real todavía. Esta transformación explica por qué las llaves `{}` dentro de JSX embeben cualquier expresión JavaScript válida (no solo texto): `{texto}` no es una plantilla de texto especial, es literalmente un argumento pasado a `createElement`, y por lo tanto puede ser cualquier expresión: una variable, una llamada a función, una expresión ternaria, o incluso otro elemento JSX anidado.

Comprender que JSX se convierte en llamadas a función explica comportamientos que de otro modo parecerían mágicos: por qué un componente debe devolver un único elemento raíz (porque `createElement` devuelve un único objeto, no una lista suelta de objetos, de ahí la necesidad de Fragments, Tema 3), por qué los atributos usan `className` en vez de `class` (`class` es una palabra reservada en JavaScript, por lo que no puede usarse como nombre de prop), y por qué JSX permite mezclar libremente lógica JavaScript y marcado, algo que un motor de plantillas tradicional (como los estudiados en frameworks basados en archivos `.html` separados) no permite con la misma naturalidad.

**Analogía:** JSX es como una notación taquigráfica para escribir instrucciones detalladas de ensamblaje: no es el objeto ensamblado en sí, sino una forma más legible de escribir exactamente las mismas instrucciones (`createElement(...)`) que, de escribirse literalmente, serían mucho más verbosas y difíciles de leer a simple vista.

**¿Por qué es importante?** Entender que JSX es azúcar sintáctica sobre `createElement` explica por qué las llaves embeben cualquier expresión JavaScript, por qué un componente devuelve un único elemento raíz, y por qué se usa `className` en vez de `class`.

**Código del ejemplo:**

```jsx
function Boton({ texto, onClick }) {
  return <button onClick={onClick}>{texto}</button>;
}
// Se transforma en:
// React.createElement('button', { onClick }, texto)
```

#### Paso 4 · Demostración guiada desde cero
Trabaja en el proyecto `mi-react` del inicio. Crea la carpeta `src/components` y dentro `src/components/DeliveryCard.jsx`:

```jsx
export default function DeliveryCard({ guia, direccion }) {
  return (
    <article className="delivery-card">
      <h2>Guía {guia}</h2>
      <p>{direccion}</p>
    </article>
  )
}
```

Reemplaza `src/App.jsx` para usarlo con una lista de dos envíos:

```jsx
import DeliveryCard from './components/DeliveryCard.jsx'

const envios = [
  { id: 'RF-4471', direccion: 'Calle 10 # 5-20' },
  { id: 'RF-4472', direccion: 'Carrera 7 # 45-10' },
]

export default function App() {
  return (
    <main>
      <h1>Envíos de hoy</h1>
      {envios.map((envio) => (
        <DeliveryCard key={envio.id} guia={envio.id} direccion={envio.direccion} />
      ))}
    </main>
  )
}
```

Crea la primera prueba del curso en `src/components/DeliveryCard.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DeliveryCard from './DeliveryCard.jsx'

describe('DeliveryCard', () => {
  it('muestra la guía y la dirección recibidas por props', () => {
    render(<DeliveryCard guia="RF-4471" direccion="Calle 10 # 5-20" />)
    expect(screen.getByRole('heading', { name: 'Guía RF-4471' })).toBeInTheDocument()
    expect(screen.getByText('Calle 10 # 5-20')).toBeInTheDocument()
  })
})
```

```bash
npm test
npm run dev
```

Resultado esperado: `npm test` informa `1 passed`, y el navegador muestra el título y dos tarjetas. `export default` permite que otro archivo importe el componente; `guia` y `direccion` llegan como props; `key={envio.id}` identifica cada tarjeta en la lista (lo estudias en el Tema 2).

**Demo con React DevTools:**
1. Abre `http://localhost:5173` en Chrome
2. Abre DevTools (F12) → pestaña Components → busca `<DeliveryCard />`
3. En el panel derecho, mira las **props** en tiempo real: `{ guia: "RF-4471", direccion: "..." }`
4. Edita el valor de una prop en el editor del panel de DevTools (p. ej., cambia `guia` a `RF-999`)
5. Observa cómo la UI se actualiza **sin recargar la página**
6. Resultado esperado: verás que React re-renderiza solo ese componente con el nuevo prop, demostrando cómo los props fluyen de arriba hacia abajo.

#### Paso 5 · Práctica guiada
Pista: crea dos componentes `<Boton>` idénticos pero con `onClick` handlers distintos (uno que incremente un contador, otro que lo decremente). Luego, usa deliberadamente el `id` de componente (no el tipo de componente) como clave en la inspección de DevTools. Intenta cambiar props desde DevTools — si lo haces correctamente, ambos botones responderán. Ahora comete el fallo deliberado: crea un componente `Boton` que no acepte un prop `key` en sus props visibles (porque `key` es especial en React y no llega al componente, solo React la usa), pero demuestra en la consola que React sí ve la `key` internamente. Resultado esperado: entender que `key` existe para React, no para tu código.

#### Paso 6 · Práctica independiente
Añade estados vacío/error, composición con Fragment y estilos accesibles; prueba teclado y responsive.

#### Paso 7 · Cierre
Guarda estructura, comandos, captura y log; como siguiente paso estudia estado. Errores comunes: key aleatoria, componente gigante, HTML inválido y estilos que dependen solo de color. Fuentes oficiales: https://react.dev/learn y https://vite.dev/guide/.
**Implicación práctica:** Entender el modelo de renderizado evita bugs sutiles al crecer la interfaz.

### Tema 2: Listas con key estable · Básico · 45 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a renderizar una lista de envíos (`EnvioCard`) con `.map()`, usando el `id` de cada envío como `key` en vez de su posición en el array. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
La lista de envíos de RutaFlow se reordena seguido (los envíos urgentes suben al principio); si la `key` de cada fila fuera su posición en el array, React no podría distinguir "el envío que se movió" de "un envío nuevo en esa posición". Este patrón exacto se repetirá en el dashboard de rastreo (Módulo 12) cuando los operadores reordenen envíos por estado o prioridad.

#### Paso 3 · Teoría, modelo mental y analogía
`key` es la identidad estable que React usa para decidir qué actualizar, reordenar o recrear entre renders — identificar a las personas de una fila por su nombre, no por "la tercera posición".

**Diagrama: Key estable vs índice del array**

```mermaid
graph TD
    A["Array inicial:<br/>envio1, envio2, envio3"] -->|Reordenar| B["Array después:<br/>envio3, envio1, envio2"]
    
    C["Con key=índice:<br/>React piensa que<br/>posición 0 cambió<br/>de contenido"]
    D["Con key=id:<br/>React sabe que<br/>cada envío se movió<br/>pero sigue siendo<br/>el mismo envío"]
    
    A -.->|ERROR| C
    A -.->|CORRECTO| D
    
    C -->|Resultado| E["Estado de envio1<br/>se pierde o mezcla"]
    D -->|Resultado| F["Estado de envio1<br/>se mantiene<br/>donde se mueva"]
    
    style C fill:#ffebee
    style D fill:#e8f5e9
    style E fill:#ffcdd2
    style F fill:#c8e6c9
```

**Conceptos clave:** identidad de elementos entre renders, riesgo del índice como key.

Cuando React renderiza una lista de elementos generada dinámicamente (típicamente con `.map()`), necesita una forma de identificar de forma estable qué elemento de una nueva lista corresponde a cuál elemento de la lista anterior, para decidir eficientemente qué debe actualizar, cuál debe reordenar, y cuál debe crear o eliminar del DOM real, en vez de descartar y recrear la lista completa en cada cambio; la prop especial `key` (`<li key={tarea.id}>{tarea.titulo}</li>`) es exactamente esa identidad estable que React usa para esa comparación entre renders sucesivos.

Usar el índice del array como `key` (`key={indice}`) parece funcionar en casos simples, pero se vuelve problemático en cuanto la lista se reordena, se filtra, o se inserta un elemento en medio: dado que el índice de un elemento cambia cuando la lista cambia de orden o de longitud, React puede terminar asociando el estado interno o las referencias del DOM del elemento equivocado a la posición equivocada (por ejemplo, si un input controlado con estado propio está dentro de cada fila, y la fila se reordena, el valor tecleado en el input puede aparecer asociado a la fila incorrecta tras el reordenamiento, porque React identificó las filas por posición, no por identidad real). Usar un identificador estable e inherente al dato (`tarea.id`, no su posición circunstancial en el array actual) evita completamente este problema, porque esa identidad no cambia sin importar cómo se reordene o filtre la lista.

**Analogía:** usar el índice como key es como identificar a las personas de una fila por su posición ("la tercera persona") en vez de por su nombre: si la fila se reordena, "la tercera persona" pasa a ser alguien completamente distinto, aunque la persona original que ocupaba esa posición siga siendo la misma persona en otra posición nueva de la fila.

**Código del ejemplo:**

```jsx
{tareas.map(tarea => <li key={tarea.id}>{tarea.titulo}</li>)}
// key={tarea.id}: estable sin importar el orden
// key={indice}: riesgoso si la lista se reordena o filtra
```


**Límites y decisión de uso:** La key identifica hermanos a lo largo de los renders; no debe generarse de nuevo cada vez ni basarse en posición si la lista cambia. Usa identidad persistente según la [guía de listas de React](https://react.dev/learn/rendering-lists).

**¿Por qué es importante?** Porque una key inestable asocia estado o referencias del DOM al elemento equivocado en cuanto la lista se reordena, filtra, o modifica.

#### Paso 4 · Demostración guiada desde cero
```jsx
import { useState } from 'react';

const enviosIniciales = [
  { id: 'RF-4471', direccion: 'Calle 10 # 5-20' },
  { id: 'RF-4472', direccion: 'Carrera 7 # 45-10' },
  { id: 'RF-4473', direccion: 'Avenida 68 # 13-50' },
];

function EnvioCard({ envio }) {
  return (
    <li>
      {envio.id} — {envio.direccion}{' '}
      <input aria-label={`Nota de ${envio.id}`} placeholder="Nota del operador" />
    </li>
  );
}

function ListaEnvios({ envios }) {
  return (
    <ul>
      {envios.map(envio => <EnvioCard key={envio.id} envio={envio} />)}
    </ul>
  );
}

export default function App() {
  // useState se estudia en el módulo 1; aquí solo guarda el orden de la lista.
  const [envios, setEnvios] = useState(enviosIniciales);
  const moverUltimoAlPrincipio = () => setEnvios([envios.at(-1), ...envios.slice(0, -1)]);

  return (
    <main>
      <button onClick={moverUltimoAlPrincipio}>Mover el último al principio</button>
      <ListaEnvios envios={envios} />
    </main>
  );
}
```

**Ejecuta el ejemplo** en tu proyecto `mi-react` (lo creaste y preparaste para pruebas al inicio del módulo 0): reemplaza todo el contenido de `src/App.jsx` por el bloque anterior y arráncalo:

```bash
npm run dev
```

Resultado esperado: al reordenar `envios` (por ejemplo, moviendo un envío urgente al principio del array), cada `EnvioCard` conserva su propio estado interno (como un `<input>` de nota que el operador esté escribiendo en esa fila) asociado al envío correcto, porque `key={envio.id}` identifica cada fila por su identidad real, no por su posición circunstancial. Ejecuta `npm test` para confirmar que la prueba del Tema 1 sigue en verde.

**Demo con React DevTools:**
1. Abre tu aplicación con una lista de 3+ elementos, cada uno con un `<input>` controlado dentro
2. Escribe algo en el input del primer elemento (ej. "nota importante")
3. Abre DevTools → pestaña Components → inspecciona `<EnvioCard key="RF-4471" />`
4. Nota que en el árbol de componentes, cada `EnvioCard` muestra su `key` como etiqueta
5. **Hazlo mal primero (fallo deliberado):** cambia `key={envio.id}` a `key={indice}` en el código
6. Reinicia, escribe "nota importante" en el primer elemento de nuevo
7. Reordena el array con el botón «Mover el último al principio»
8. Observa en DevTools que el `<EnvioCard>` ahora tiene `key="0"` pero el contenido del input se movió junto con la posición, **no** con el envío real
9. Cambia de nuevo a `key={envio.id}` y repite: ahora el texto se mantiene con el envío correcto incluso al reordenar
10. Resultado esperado: ver en DevTools cómo la `key` es el identificador visual estable que React usa internamente.

#### Paso 5 · Práctica guiada
**Fallo deliberado #1 (índice como key):** 
Cambia `envios.map(envio =>` por `envios.map((envio, indice) =>` y `key={envio.id}` por `key={indice}`. Escribe algo en el `<input>` de nota de la primera fila (RF-4471) y pulsa el botón: ese texto se queda en la primera fila, que ahora es RF-4473, en vez de acompañar a RF-4471.

**Fallo deliberado #2 (key aleatoria):**
Cambia ahora a `key={Math.random()}` — cada render de `App` genera keys nuevas, así que React cree que todas las filas son nuevas. Observa:
- Escribe notas en varias filas y pulsa el botón: todas las notas se borran, porque React desmontó cada `<input>` y montó uno nuevo vacío.
- En la pestaña Elements de DevTools, los `<li>` parpadean al pulsar el botón: el DOM se recrea entero en vez de moverse.

**Fallo deliberado #3 (key duplicada):**
Crea una lista donde dos envíos tienen el mismo `id` accidentalmente y usa `key={envio.id}`. React renderiza ambos elementos en el DOM, muestra en consola la advertencia «Encountered two children with the same key», y solo puede seguir la identidad de uno correctamente, causando comportamientos impredecibles cuando filtras o reordenas.
**Pista:** reproduce los fallos #1, #2 y #3 de a uno, restaurando `key={envio.id}` entre cada uno — mezclarlos te deja con dos causas distintas (índice inestable y key duplicada) produciendo el mismo síntoma confuso en el DOM.
#### Paso 6 · Práctica independiente
Corrige el Paso 5 devolviendo `key={envio.id}`, y agrega a cada fila un botón "mover al principio" que reordene el array — confirma que el texto escrito en el input de nota de cualquier fila sigue esa fila específica, sin importar a qué posición se mueva. Cuando lo tengas verde, traslada la lista de envíos del proyecto integrador RutaFlow a `key={envio.id}` y documenta qué fila conserva su nota al reordenar.

#### Paso 7 · Cierre
Entrega la lista con key estable del Paso 4, el bug de identidad provocado en el Paso 5, y la prueba de reordenamiento del Paso 6; explica por qué el índice "funciona" en una lista que nunca cambia de orden ni de longitud, pero falla en cuanto eso deja de ser cierto. Siguiente paso: estudia composición con `children` y Fragments. Errores comunes: usar el índice como key en listas que se reordenan o filtran, generar una key aleatoria en cada render (`key={Math.random()}`), y repetir keys duplicadas dentro de la misma lista. Fuentes oficiales: https://react.dev/learn/rendering-lists y https://react.dev/learn/preserving-and-resetting-state.

### Tema 3: Composición sobre herencia, y Fragments · Básico · 45 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a construir un componente `Tarjeta` genérico que use `children`, y a envolver su contenido en un Fragment en vez de un `<div>` extra sin propósito. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
`EnvioCard` y una futura `ConductorCard` comparten el mismo marco visual (borde, sombra, padding) pero contenido completamente distinto — duplicar ese marco en cada componente específico repetiría el mismo CSS en dos lugares. En RutaFlow (Módulo 12), reutilizarás esta misma `Tarjeta` para mostrar envíos, conductores y entregas completadas.

#### Paso 3 · Teoría, modelo mental y analogía
React compone componentes pequeños pasando contenido a través de `children`, en vez de heredar de una clase base — bloques de Lego intercambiables en vez de una pieza única hecha a medida.

**Diagrama: Composición vs Herencia**

```mermaid
graph TD
    A["Herencia<br/>TarjetaEspecial extends Tarjeta<br/>duplica lógica, rígido"]
    B["Composición<br/>Tarjeta renderiza children<br/>reutilizable para cualquier contenido"]
    
    A -->|Problema| C["Cambiar Tarjeta base<br/>afecta todas las subclases"]
    B -->|Ventaja| D["Tarjeta es agnóstica<br/>el contenido es independiente"]
    
    B -->|Uso 1| E["&lt;Tarjeta&gt;<br/>  &lt;p&gt;Envío&lt;/p&gt;<br/>&lt;/Tarjeta&gt;"]
    B -->|Uso 2| F["&lt;Tarjeta&gt;<br/>  &lt;p&gt;Conductor&lt;/p&gt;<br/>&lt;/Tarjeta&gt;"]
    B -->|Uso 3| G["&lt;Tarjeta&gt;<br/>  &lt;p&gt;Entrega&lt;/p&gt;<br/>&lt;/Tarjeta&gt;"]
    
    style C fill:#ffebee
    style D fill:#e8f5e9
    style E fill:#e3f2fd
    style F fill:#e3f2fd
    style G fill:#e3f2fd
```

**Conceptos clave:** `children`, composición de componentes pequeños, `<> </>`.

React favorece deliberadamente la composición de componentes pequeños sobre la herencia de clases como mecanismo de reutilización de UI: en vez de crear una jerarquía de clases donde un componente "TarjetaEspecial" hereda de un componente "Tarjeta" base y sobreescribe cierto comportamiento (el patrón típico de programación orientada a objetos tradicional), React resuelve el mismo problema componiendo componentes pequeños e independientes entre sí, pasando contenido a través de la prop especial `children` (`function Tarjeta({ children }) { return <div className="tarjeta">{children}</div>; }`, usado como `<Tarjeta><Avatar /><Nombre texto="Ana" /></Tarjeta>`), donde `Tarjeta` no necesita saber nada específico sobre qué contenido recibirá, simplemente lo envuelve en su propio marcado estructural.

Este enfoque de composición evita los problemas clásicos de jerarquías de herencia profundas y rígidas (donde cambiar el comportamiento de una clase base afecta impredeciblemente a todas sus subclases), permitiendo en cambio ensamblar interfaces complejas a partir de piezas pequeñas, independientes y fácilmente reemplazables, cada una con una única responsabilidad clara.

Los Fragments (`<> </>`, o explícitamente `<React.Fragment>`) resuelven la restricción de que un componente debe devolver un único elemento raíz (Tema 1) sin necesidad de envolver el contenido en un `<div>` adicional puramente estructural que no tiene ningún propósito semántico ni visual real, evitando anidar el DOM con contenedores vacíos innecesarios que no aportan nada más que cumplir la restricción técnica de un único elemento raíz.

**Analogía:** la composición es como construir con bloques de Lego pequeños e intercambiables, cada uno con una función clara, ensamblados según se necesite; la herencia profunda es como fabricar una pieza única y rígida hecha a medida para un caso específico, difícil de adaptar o reutilizar para un caso ligeramente distinto.

**¿Por qué es importante?** Componer componentes pequeños con `children` produce piezas de UI más reutilizables e independientes entre sí que una jerarquía de herencia rígida; los Fragments evitan contenedores DOM innecesarios que la restricción de un único elemento raíz de otro modo forzaría.

**Código del ejemplo:**

```jsx
function Tarjeta({ children }) {
  return <div className="tarjeta">{children}</div>;
}

<Tarjeta><Avatar /><Nombre texto="Ana" /></Tarjeta>
// Composición: Tarjeta no sabe qué contenido recibirá, solo lo envuelve
```


#### Paso 4 · Demostración guiada desde cero
```jsx
function Tarjeta({ children }) {
  return <div className="tarjeta">{children}</div>;
}

function EnvioCard({ envio }) {
  return (
    <Tarjeta>
      <>
        <p>{envio.guia}</p>
        <p>{envio.direccion}</p>
      </>
    </Tarjeta>
  );
}

export default function App() {
  return <EnvioCard envio={{ guia: 'RF-4471', direccion: 'Calle 10 # 5-20' }} />;
}
```

**Ejecuta el ejemplo** en tu proyecto `mi-react` (lo creaste y preparaste para pruebas al inicio del módulo 0): reemplaza todo el contenido de `src/App.jsx` por el bloque anterior y arráncalo:

```bash
npm run dev
```

Resultado esperado: `Tarjeta` no sabe nada sobre guías ni direcciones — solo envuelve lo que reciba en `children` con el marco visual común; el Fragment (`<> </>`) agrupa los dos `<p>` sin agregar ningún `<div>` extra al DOM. Ejecuta `npm test` para confirmar que la prueba del Tema 1 sigue en verde.

**Demo con React DevTools:**
1. Crea `<Tarjeta>`, `<EnvioCard>` y `<ConductorCard>` (distinto contenido)
2. Abre DevTools → pestaña Components
3. Inspecciona la estructura: verás `<Tarjeta>` una sola vez en el árbol, pero su contenido (children) varía
4. Expande `<EnvioCard>` → verás la estructura interna: `<Tarjeta>` → `<>` (Fragment) → dos `<p>`
5. Nota que **no hay un `<div>` vacío extra** que envuelva los dos `<p>` (gracias al Fragment)
6. Comparación: cambia `<>` a `<div className="wrapper">` — en DevTools verás un `<div>` adicional innecesario en la jerarquía
7. Resultado esperado: comprender visualmente que Fragments evitan contenedores DOM extra.

#### Paso 5 · Práctica guiada
**Fallo deliberado #1 (dos raíces en un `return`):**
Primero quita solo el Fragment, dejando los dos `<p>` dentro de `<Tarjeta>`: sigue compilando, porque ahora son dos hijos de `Tarjeta` y JSX acepta varios hijos dentro de una etiqueta. Ahora quita también `<Tarjeta>` para que `EnvioCard` devuelva `<p>…</p><p>…</p>` directamente: el proyecto deja de compilar con `Adjacent JSX elements must be wrapped in an enclosing tag.`, porque un `return` debe producir una única expresión raíz. Vuelve a envolverlos con `<>…</>` y compila de nuevo.

**Fallo deliberado #2 (Fragment explícito vs abreviado):**
Agrega `import { Fragment } from 'react';` al inicio y reemplaza `<>...</>` por `<Fragment>...</Fragment>` — funciona igual, pero es más verboso. Luego intenta pasar una `key` a un Fragment: `<Fragment key={id}>` funciona, pero `<>` abreviado no acepta `key`. Este es un edge case real que encontrarás en listas de Fragments.

**Fallo deliberado #3 (children no es automático):**
Crea una versión incorrecta de `Tarjeta` que no use `children`: `function Tarjeta() { return <div>contenido fijo</div>; }`. Ahora usa `<Tarjeta><p>Esto se ignora</p></Tarjeta>` — el `<p>` simplemente desaparece, no se renderiza. Luego corrige a `function Tarjeta({ children })` para demostrar que `children` es un prop como cualquier otro, que debe ser recibido explícitamente.
**Pista:** revierte cada fallo antes de probar el siguiente — el error de compilación del Fallo #1 es ruidoso y fácil de notar, pero el `<p>` que desaparece silenciosamente en el Fallo #3 solo se nota si comparas el DOM renderizado contra lo que esperabas.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando el Fragment, y creá una segunda tarjeta (`ConductorCard`) que también use `Tarjeta` con contenido completamente distinto (nombre y vehículo del conductor) — confirmá que `Tarjeta` no necesitó ningún cambio para soportar este nuevo caso. En el proyecto integrador RutaFlow, aplica `Tarjeta` a la ficha del envío y a la del conductor sin duplicar estilos, y anota qué parte quedó compartida.

#### Paso 7 · Cierre
Entrega `Tarjeta` con `children` del Paso 4, el error de compilación del Paso 5, y `ConductorCard` del Paso 6; explica por qué `Tarjeta` pudo reutilizarse para un contenido completamente distinto sin ninguna modificación, algo que una jerarquía de herencia rígida no ofrece con la misma facilidad. Siguiente paso: estudia renderizado condicional y estilos. Errores comunes: hacer que un componente "contenedor" conozca detalles específicos del contenido que envuelve, olvidar que un componente debe devolver un único elemento raíz, y usar un `<div>` extra en vez de un Fragment cuando no se necesita ningún elemento real. Fuentes oficiales: https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children y https://react.dev/reference/react/Fragment.
**Implicación práctica:** Componer con `children` produce piezas de UI reutilizables e independientes entre sí; los Fragments evitan contenedores DOM innecesarios que la restricción de un único elemento raíz forzaría.

### Tema 4: Renderizado condicional y estilos · Básico · 45 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a mostrar un `Spinner` mientras `EnvioCard` carga, y a elegir entre `&&` y el operador ternario según si existe una sola alternativa o dos. Prerrequisitos: Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
Mientras RutaFlow todavía no recibió la respuesta de la API, `EnvioCard` no tiene ningún dato real que mostrar — necesita decidir qué renderizar durante ese instante sin dato. En el dashboard de rastreo (Módulo 12), distintos envíos estarán en distintos estados simultáneamente (algunos cargando, otros con datos, otros en error).

#### Paso 3 · Teoría, modelo mental y analogía
`{cargando && <Spinner />}` aprovecha el cortocircuito de `&&` cuando existe una sola alternativa (algo o nada); el ternario es apropiado cuando existen dos alternativas de contenido reales.

**Diagrama: Renderizado condicional**

```mermaid
graph TD
    A["Estado: cargando"] -->|true| B["Mostrar Spinner"]
    A -->|false| C["Spinner no renderiza"]
    
    D["Estado: envio"] -->|envio existe| E["Mostrar Perfil del envío"]
    D -->|envio es null| F["Mostrar mensaje 'Sin datos'"]
    
    B -.->|"&&"| G["Cortocircuito:<br/>algo o nada"]
    E -.->|"ternario"| H["Dos alternativas<br/>reales de contenido"]
    F -.->|"ternario"| H
    
    style B fill:#4caf50
    style C fill:#9e9e9e
    style E fill:#4caf50
    style F fill:#ff9800
    style G fill:#e3f2fd
    style H fill:#e3f2fd
```

**¿Por qué es importante?** Elegir entre `&&` y el ternario según si existe una única alternativa o dos alternativas de contenido reales evita bugs como el "0" fantasma y produce código más predecible.

#### Paso 4 · Demostración guiada desde cero
```jsx
function Spinner() {
  return <p role="status">Cargando envío…</p>;
}

function EnvioCard({ envio, cargando }) {
  return (
    <div className="tarjeta">
      {cargando && <Spinner />}
      {envio ? <p>{envio.direccion}</p> : <p>Sin datos todavía</p>}
    </div>
  );
}

export default function App() {
  return (
    <>
      <EnvioCard envio={null} cargando={true} />
      <EnvioCard envio={{ id: 1, direccion: 'Calle Principal 123' }} cargando={false} />
    </>
  );
}
```

**Ejecuta el ejemplo** en tu proyecto `mi-react` (lo creaste y preparaste para pruebas al inicio del módulo 0): reemplaza todo el contenido de `src/App.jsx` por el bloque anterior y arráncalo:

```bash
npm run dev
```

Resultado esperado: mientras `cargando` es `true`, se muestra el `Spinner` (y nada más si `cargando` es `false`, gracias al cortocircuito); una vez que `envio` tiene datos, se muestra su dirección; si nunca llegó ningún envío, se muestra "Sin datos todavía" en vez de nada.

**Demo con React DevTools:**
1. Crea un componente `<EnvioCard envio={null} cargando={true} />`
2. Abre DevTools → pestaña Components → inspecciona el árbol
3. Verás `<Spinner />` renderizado porque `cargando` es `true`
4. En el panel lateral de DevTools, edita la prop `cargando` a `false`
5. Observa cómo el `<Spinner />` desaparece del árbol inmediatamente (DOM actualizado en tiempo real)
6. Ahora edita `envio` de `null` a un objeto con datos: `{ id: 1, direccion: "..." }`
7. Verás que el renderizado condicional cambia: ahora aparece `<p>Calle Principal 123</p>` en vez del "Sin datos todavía"
8. Resultado esperado: comprender en tiempo real cómo los props controlan qué se renderiza.

Escribe `src/EnvioCard.test.jsx` con el patrón de `DeliveryCard.test.jsx` (mueve `EnvioCard` y `Spinner` a `src/EnvioCard.jsx` con `export default`): renderiza `<EnvioCard envio={null} cargando />` y comprueba que aparece «Cargando envío…» y «Sin datos todavía». Después ejecuta `npm test`.

#### Paso 5 · Práctica guiada
**Fallo deliberado #1 (ternario con 0 falsy):**
Cambia `{cargando && <Spinner />}` por `{cargando ? <Spinner /> : 0}` — cuando `cargando` es `false`, React renderiza literalmente el número `0` en la pantalla (porque `0` es un valor renderizable válido en JSX, a diferencia de `false` o `undefined`), mostrando un "0" visible y confuso. Esto es una trampa específica de JSX: `&&` con `0` también falla del mismo modo.

**Fallo deliberado #2 (renderizar valores falsy problemáticos):**
Intenta renderizar directamente:
- `{count}` cuando `count` es `0` → aparece "0" en la pantalla (a veces deseado, a veces no)
- `{isActive}` cuando `isActive` es `false` → no aparece nada (correcto, porque `false` no se renderiza)
- `{0 && <Spinner />}` → aparece "0" en la pantalla (ERROR)
- `{false && <Spinner />}` → no aparece nada (correcto)

**Fallo deliberado #3 (olvidar el return en expresiones condicionales):**
Escribe: `function Card() { if (loading) { <Spinner /> } return <div>...</div>; }` — el `<Spinner />` nunca se renderiza porque no está en un return. El if debe devolver algo que React pueda procesar.
**Pista:** prueba primero con `cargando` en `false` y `envio` en `null` y cambia una sola prop a la vez desde React DevTools — así identificas exactamente cuál combinación produce el "0" fantasma antes de pasar a la siguiente.
#### Paso 6 · Práctica independiente
Corrige el Paso 5 volviendo a `{cargando && <Spinner />}`, y agrega estilos con CSS Modules o Tailwind a la tarjeta para que el estado de carga tenga una apariencia visualmente distinta al estado con datos. En el proyecto integrador RutaFlow, reemplaza el `&&` del estado vacío por un ternario cuando haya dos alternativas y documenta el caso del `0` fantasma.

#### Paso 7 · Cierre
Entrega el renderizado condicional del Paso 4, el "0" fantasma detectado en el Paso 5, y los estilos del Paso 6; explica por qué `&&` con un operando numérico falsy (`0`, no `false`) es una trampa específica de JSX que no ocurre con un booleano. Siguiente paso: estudia cómo React maneja el estado con `useState`. Errores comunes: usar `&&` con un valor que puede ser `0`, confundir cuándo usar `&&` (una alternativa) frente al ternario (dos alternativas reales), y depender solo del color para comunicar estado sin texto ni ícono adicional. Fuentes oficiales: https://react.dev/learn/conditional-rendering y https://react.dev/learn/writing-markup-with-jsx.


## Ruta de proyecto progresivo desde carpeta vacía

No crees un proyecto desechable por módulo. Conserva un único repositorio que evoluciona durante todo el track y etiqueta cada hito (`git tag modulo-N`). Empieza con el proyecto `mi-react` del inicio (ya tiene Vitest configurado): `cd mi-react && git init`. Ejecuta el comando paso a paso, inspecciona los archivos generados y registra versiones y precondiciones en el README.

| Hito | Evolución acumulativa | Antes de avanzar |
|---|---|---|
| Base | componentes y estado. | Arranque reproducible, commit limpio y prueba mínima. |
| Aplicación | rutas, formularios y datos. | Casos normales, límite y error automatizados. |
| Integración | Conecta capas y reemplaza dobles por infraestructura controlada. | Diagrama, contratos y prueba de integración. |
| Experto | arquitectura, accesibilidad y producción. | Perfil o threat model, telemetría y runbook de recuperación. |

Al iniciar cada laboratorio crea una rama `modulo-N`, implementa el incremento, verifica el criterio de éxito y fusiona solo con pruebas verdes. Si un módulo necesita un experimento aislado, colócalo en `experiments/modulo-N/`; el producto acumulativo permanece ejecutable. Al terminar, otra persona debe poder clonar el repositorio y reproducir el último hito siguiendo únicamente el README.


## Laboratorio práctico

**Objetivo del laboratorio:** construir un set de componentes de presentación reutilizables (botón, tarjeta, lista) con JSX, composición y renderizado condicional.

**Requisitos previos:** conocimientos de JavaScript ES6+ (Módulos del track de JavaScript).

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear `Boton` con props `texto`/`onClick` | Ver Tema 1 | Componente de función simple |
| 2 | Renderizar una lista con `key` estable | Ver Tema 2 | Usa `tarea.id`, no el índice |
| 3 | Crear `Tarjeta` con `children` | Ver Tema 3 | Composición sin herencia |
| 4 | Implementar renderizado condicional | Ver Tema 4 | `&&` y ternario según el caso |
| 5 | Componer `Avatar`, `Nombre` y `Tarjeta` en `Usuario` | Ver Tema 3 | Sin usar herencia |

**Verificación:** el laboratorio se considera exitoso si la lista renderizada mantiene el estado correcto de cada fila al reordenar (verificable con un input controlado por fila), y si los componentes se ensamblan mediante composición, sin ninguna clase que herede de otra.

**Errores comunes y soluciones**

- **Usar el índice del array como key.** Usa siempre un identificador estable inherente al dato (`item.id`).
- **Olvidar que un componente debe devolver un único elemento raíz.** Envuelve en un Fragment (`<>`) si no necesitas un `<div>` real.
- **Confundir `class` con `className`.** JSX usa `className` porque `class` es palabra reservada en JavaScript.

---
