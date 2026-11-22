# Módulo 9: Performance en React


## Aprende construyendo

**Servidor del módulo:** cada ejemplo se sirve con `npm run dev` dentro del proyecto `mi-react` del módulo 0; abre `http://localhost:5173` para ver el resultado y ejecuta `npm test` para las pruebas (Vitest, configurado una sola vez en «Prepara las pruebas» del módulo 0). Si el puerto cambia, usa el que imprima la terminal.


### Tema 1: Medir antes de optimizar · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a grabar con React DevTools Profiler una interacción real de ListaEnvios (escribir en el filtro) para identificar qué componente específico se re-renderiza innecesariamente, antes de optimizar nada. Prerrequisitos: Módulo 8 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a grabar con React DevTools Profiler una interacción real de ListaEnvios (escribir en el filtro) para identificar qué componente específico se re-renderiza innecesariamente, antes de optimizar nada.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en medir antes de optimizar como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
graph TD
    A["Aplicación se 'siente' lenta"]
    
    B["Opción 1: Adivinar<br/>SIN Profiler"]
    C["Asumo que X es lento<br/>Optimizo todo<br/>Uso React.memo por defecto"]
    D["Resultado:<br/>Más complejidad<br/>Mejor? Quién sabe..."]
    
    E["Opción 2: Medir<br/>CON Profiler"]
    F["Identifico exactamente<br/>qué se re-renderiza<br/>Optimizo solo eso"]
    G["Resultado:<br/>Mejora medible<br/>Código simple"]
    
    A -->|Riesgoso| B
    B -->|Acción| C
    C -->|Consecuencia| D
    
    A -->|Seguro| E
    E -->|Acción| F
    F -->|Consecuencia| G
    
    style D fill:#ffebee
    style G fill:#e8f5e9
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Medir antes de optimizar se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Medir antes de optimizar | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses medir antes de optimizar por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: medir antes de optimizar funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Medir antes de optimizar existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve medir antes de optimizar en tu contexto?
2. ¿Cómo sabrías que medir antes de optimizar no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar medir antes de optimizar?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
graph TD
    A["Aplicación se 'siente' lenta"]
    
    B["Opción 1: Adivinar<br/>SIN Profiler"]
    C["Asumo que X es lento<br/>Optimizo todo<br/>Uso React.memo por defecto"]
    D["Resultado:<br/>Más complejidad<br/>Mejor? Quién sabe..."]
    
    E["Opción 2: Medir<br/>CON Profiler"]
    F["Identifico exactamente<br/>qué se re-renderiza<br/>Optimizo solo eso"]
    G["Resultado:<br/>Mejora medible<br/>Código simple"]
    
    A -->|Riesgoso| B
    B -->|Acción| C
    C -->|Consecuencia| D
    
    A -->|Seguro| E
    E -->|Acción| F
    F -->|Consecuencia| G
    
    style D fill:#ffebee
    style G fill:#e8f5e9
```

```
Profiler graba una interacción → muestra QUÉ componentes se re-renderizaron y POR QUÉ
(props cambiadas / estado cambiado / re-render heredado del padre)
```

```jsx
import { useState } from 'react';

function EncabezadoPanel({ titulo }) {
  return <h1>{titulo}</h1>; // no lee el filtro
}

function ListaEnvios({ zona }) {
  return <p>Envíos de la zona «{zona || 'todas'}»</p>;
}

export default function App() {
  const [zona, setZona] = useState('');
  return (
    <main>
      <EncabezadoPanel titulo="Panel de envíos" />
      <label>
        Filtro de zona{' '}
        <input value={zona} onChange={e => setZona(e.target.value)} />
      </label>
      <ListaEnvios zona={zona} />
    </main>
  );
}
```

```text
1. Abre React DevTools > pestaña Profiler
2. Haz click en grabar (●)
3. Escribe una letra en el campo de filtro de zona
4. Detén la grabación
5. Inspecciona qué componentes aparecen resaltados y por qué
```

```bash
npm run dev
```

</details>

### Tema 2: React.memo con criterio · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a envolver EncabezadoPanel (identificado en el Tema 1 con el Profiler) en React.memo, confirmando que el render heredado innecesario desaparece. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a envolver EncabezadoPanel (identificado en el Tema 1 con el Profiler) en React.memo, confirmando que el render heredado innecesario desaparece.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en react.memo con criterio como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que react.memo con criterio resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| React.memo con criterio se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar React.memo con criterio | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses react.memo con criterio por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: react.memo con criterio funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- React.memo con criterio existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve react.memo con criterio en tu contexto?
2. ¿Cómo sabrías que react.memo con criterio no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar react.memo con criterio?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```jsx
const Fila = React.memo(function Fila({ item }) {
  return <li>{item.nombre}</li>;
}); // solo se re-renderiza si `item` cambia (comparación superficial)
```

```jsx
import { memo, useState } from 'react';

const EncabezadoPanel = memo(function EncabezadoPanel({ titulo }) {
  return <h1>{titulo}</h1>; // se salta el render si `titulo` no cambia
});

function ListaEnvios({ zona }) {
  return <p>Envíos de la zona «{zona || 'todas'}»</p>;
}

export default function App() {
  const [zona, setZona] = useState('');
  return (
    <main>
      <EncabezadoPanel titulo="Panel de envíos" />
      <label>
        Filtro de zona{' '}
        <input value={zona} onChange={e => setZona(e.target.value)} />
      </label>
      <ListaEnvios zona={zona} />
    </main>
  );
}
```

```bash
npm run dev
```

</details>

### Tema 3: Virtualización de listas largas · Avanzado · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a virtualizar ListaEnvios cuando RutaFlow acumula miles de envíos históricos, renderizando en el DOM solo los que están visibles en pantalla. Prerrequisitos: Tema 2 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a virtualizar ListaEnvios cuando RutaFlow acumula miles de envíos históricos, renderizando en el DOM solo los que están visibles en pantalla.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en virtualización de listas largas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que virtualización de listas largas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Virtualización de listas largas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Virtualización de listas largas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses virtualización de listas largas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: virtualización de listas largas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Virtualización de listas largas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve virtualización de listas largas en tu contexto?
2. ¿Cómo sabrías que virtualización de listas largas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar virtualización de listas largas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```jsx
import { List } from 'react-window'; // react-window 2: `List` reemplaza a `FixedSizeList`
<List rowComponent={Fila} rowCount={10000} rowHeight={40} rowProps={{ datos }} style={{ height: 600 }} />
```

```jsx
import { List } from 'react-window';

const envios = Array.from({ length: 10_000 }, (_, i) => ({ guia: `RF-${String(i).padStart(5, '0')}` }));

function FilaEnvio({ index, style, envios }) {
  // `style` posiciona la fila; react-window solo monta las filas visibles.
  return <div style={style}>{envios[index].guia}</div>;
}

export default function App() {
  return (
    <List
      rowComponent={FilaEnvio}
      rowCount={envios.length}
      rowHeight={48}
      rowProps={{ envios }}
      style={{ height: 600 }}
    />
  );
}
```

```bash
npm install react-window
npm run dev
```

</details>

### Tema 4: useTransition, useDeferredValue y Fiber · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a usar useTransition para que escribir en el filtro de zona de RutaFlow siga respondiendo instantáneamente, aunque filtrar 10,000 envíos sea un cálculo costoso en segundo plano. Prerrequisitos: Tema 3 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a usar useTransition para que escribir en el filtro de zona de RutaFlow siga respondiendo instantáneamente, aunque filtrar 10,000 envíos sea un cálculo costoso en segundo plano.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en usetransition, usedeferredvalue y fiber como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
graph LR
    A["Tecla presionada<br/>urgente"] -->|Prioridad 1| B["Actualizar input<br/>render inmediato"]
    C["Filtrar 10k items<br/>no urgente"] -->|Prioridad 2| D["useTransition<br/>puede esperar"]
    A -.->|Interrumpe| D
    B --> E["Input responde<br/>instantáneamente"]
    D --> F["Lista se actualiza<br/>en background"]
    
    G["Fiber: árbol interrumpible<br/>y priorizable"]
    G -.->|Posibilita| A
    G -.->|Posibilita| D
    
    style B fill:#4caf50
    style E fill:#4caf50
    style F fill:#ff9800
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| useTransition, useDeferredValue y Fiber se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar useTransition, useDeferredValue y Fiber | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses usetransition, usedeferredvalue y fiber por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: usetransition, usedeferredvalue y fiber funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- useTransition, useDeferredValue y Fiber existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve usetransition, usedeferredvalue y fiber en tu contexto?
2. ¿Cómo sabrías que usetransition, usedeferredvalue y fiber no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar usetransition, usedeferredvalue y fiber?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
graph LR
    A["Tecla presionada<br/>urgente"] -->|Prioridad 1| B["Actualizar input<br/>render inmediato"]
    C["Filtrar 10k items<br/>no urgente"] -->|Prioridad 2| D["useTransition<br/>puede esperar"]
    A -.->|Interrumpe| D
    B --> E["Input responde<br/>instantáneamente"]
    D --> F["Lista se actualiza<br/>en background"]
    
    G["Fiber: árbol interrumpible<br/>y priorizable"]
    G -.->|Posibilita| A
    G -.->|Posibilita| D
    
    style B fill:#4caf50
    style E fill:#4caf50
    style F fill:#ff9800
```

```jsx
import { useState, useTransition } from 'react';

const envios = Array.from({ length: 20_000 }, (_, i) => `RF-${String(i).padStart(5, '0')} zona-${i % 2 ? 'norte' : 'sur'}`);

function filtrarEnvios(lista, texto) {
  return lista.filter(envio => envio.includes(texto)).slice(0, 200);
}

export default function App() {
  const [textoInput, setTextoInput] = useState('');
  const [enviosFiltrados, setEnviosFiltrados] = useState(() => filtrarEnvios(envios, ''));
  const [isPending, startTransition] = useTransition();

  function manejarCambioFiltro(texto) {
    setTextoInput(texto); // urgente: el input responde de inmediato
    startTransition(() => {
      setEnviosFiltrados(filtrarEnvios(envios, texto)); // no urgente: puede esperar
    });
  }

  return (
    <main>
      <input value={textoInput} onChange={e => manejarCambioFiltro(e.target.value)} aria-label="Filtro" />
      {isPending && <span> Actualizando…</span>}
      <ul style={{ opacity: isPending ? 0.6 : 1 }}>
        {enviosFiltrados.map(envio => <li key={envio}>{envio}</li>)}
      </ul>
    </main>
  );
}
```

```bash
npm run dev
```

</details>

### Tema 5: Suspense y React.lazy: carga diferida de componentes y rutas · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por suspense y react.lazy: carga diferida de componentes y rutas con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender suspense y react.lazy: carga diferida de componentes y rutas te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en suspense y react.lazy: carga diferida de componentes y rutas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que suspense y react.lazy: carga diferida de componentes y rutas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Suspense y React.lazy: carga diferida de componentes y rutas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Suspense y React.lazy: carga diferida de componentes y rutas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses suspense y react.lazy: carga diferida de componentes y rutas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: suspense y react.lazy: carga diferida de componentes y rutas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Suspense y React.lazy: carga diferida de componentes y rutas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve suspense y react.lazy: carga diferida de componentes y rutas en tu contexto?
2. ¿Cómo sabrías que suspense y react.lazy: carga diferida de componentes y rutas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar suspense y react.lazy: carga diferida de componentes y rutas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```jsx
export default function PanelAnalitica() {
  return <div>Gráficos pesados aquí</div>;
}
```

```jsx
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { haFallado: false };

  static getDerivedStateFromError() {
    return { haFallado: true };
  }

  render() {
    return this.state.haFallado ? this.props.fallback : this.props.children;
  }
}
```

```jsx
import { lazy, Suspense, useState } from 'react';
import ErrorBoundary from './ErrorBoundary.jsx';

// El panel de analítica se separa en su propio chunk y se descarga bajo demanda.
const PanelAnalitica = lazy(() => import('./PanelAnalitica.jsx'));

export default function Analitica() {
  const [verAnalitica, setVerAnalitica] = useState(false);
  return (
    <>
      <h1>Panel de envíos</h1>
      <button onClick={() => setVerAnalitica(true)}>Abrir analítica</button>
      {verAnalitica && (
        <ErrorBoundary fallback={<p role="alert">No se pudo cargar la analítica. Recarga la página.</p>}>
          <Suspense fallback={<p role="status">Cargando analítica…</p>}>
            <PanelAnalitica />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
}
```

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import Analitica from './Analitica.jsx';

it('descarga el panel solo al pulsar el botón', async () => {
  render(<Analitica />);
  expect(screen.queryByText('Gráficos pesados aquí')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Abrir analítica' }));
  expect(await screen.findByText('Gráficos pesados aquí')).toBeInTheDocument();
});
```

```bash
npm test
npm run build
```

```text
dist/assets/PanelAnalitica-Dnrl6zdc.js    0.14 kB │ gzip:  0.15 kB
dist/assets/index-C1lJPiOr.js           221.53 kB │ gzip: 69.39 kB
```

</details>

### Tema 6: El hook use: leer una promesa con Suspense y un contexto de forma condicional · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa React 19 o superior. Parte del proyecto de Vite del módulo y trabaja en src/DetalleEnvio.jsx.

#### ► LA IDEA EN UNA FRASE
**Usa React 19 o superior.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en el hook use: leer una promesa con suspense y un contexto de forma condicional como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    P["Padre: crea la promesa una vez"] --> S["Suspense fallback: Cargando"]
    S --> D["DetalleEnvio: use(promesa)"]
    D -->|pendiente| S
    D -->|resuelta| V["muestra el envío"]
    D -->|rechazada| E["ErrorBoundary: mensaje"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| El hook use: leer una promesa con Suspense y un contexto de forma condicional se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar El hook use: leer una promesa con Suspense y un contexto de forma condicional | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses el hook use: leer una promesa con suspense y un contexto de forma condicional por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: el hook use: leer una promesa con suspense y un contexto de forma condicional funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- El hook use: leer una promesa con Suspense y un contexto de forma condicional existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve el hook use: leer una promesa con suspense y un contexto de forma condicional en tu contexto?
2. ¿Cómo sabrías que el hook use: leer una promesa con suspense y un contexto de forma condicional no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar el hook use: leer una promesa con suspense y un contexto de forma condicional?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TB
    P["Padre: crea la promesa una vez"] --> S["Suspense fallback: Cargando"]
    S --> D["DetalleEnvio: use(promesa)"]
    D -->|pendiente| S
    D -->|resuelta| V["muestra el envío"]
    D -->|rechazada| E["ErrorBoundary: mensaje"]
```

```jsx
import { createContext, Suspense, use, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const PreferenciasContext = createContext({ mostrarRuta: false });

function pedirEnvio(codigo) {
  return new Promise((resolver, rechazar) => setTimeout(() => {
    if (codigo === 'ENV-404') rechazar(new Error('Envío no encontrado'));
    else resolver({ codigo, estado: 'EN_RUTA', ruta: ['Bodega', 'Calle 26'] });
  }, 800));
}

function Detalle({ promesaEnvio }) {
  const envio = use(promesaEnvio); // suspende hasta que llega
  if (envio.estado !== 'EN_RUTA') return <p>{envio.codigo}: {envio.estado}</p>;
  const { mostrarRuta } = use(PreferenciasContext); // contexto después de un return
  return <p>{envio.codigo} · {mostrarRuta ? envio.ruta.join(' → ') : 'en ruta'}</p>;
}

export default function DetalleEnvio() {
  // La promesa se crea en un evento del padre, no en el render del hijo.
  const [promesa, setPromesa] = useState(() => pedirEnvio('ENV-42'));
  return (
    <PreferenciasContext value={{ mostrarRuta: true }}>
      <button onClick={() => setPromesa(pedirEnvio('ENV-404'))}>Pedir envío inexistente</button>
      <ErrorBoundary fallback={<p role="alert">No se pudo cargar el envío</p>} resetKeys={[promesa]}>
        <Suspense fallback={<p>Cargando envío…</p>}>
          <Detalle promesaEnvio={promesa} />
        </Suspense>
      </ErrorBoundary>
    </PreferenciasContext>
  );
}
```

```bash
cd academia-react
npm install react-error-boundary
npm run dev
```

```text
Al cargar: «Cargando envío…» durante unos 800 ms y luego «ENV-42 · Bodega → Calle 26».
Al pulsar «Pedir envío inexistente»: «Cargando envío…» y luego «No se pudo cargar el envío».
```

</details>

### Tema 7: React Compiler y las reglas de React: memoización automática · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa React 19 y un proyecto de Vite 8 (con @vitejs/plugin-react 6, el que instala hoy npm create vite@latest). Instalarás babel-plugin-react-compiler, @rolldown/plugin-babel, @babel/core, ESLint y eslint-plugin-react-hooks 7 o superior. Necesitas la extensión React DevTools en el…

#### ► LA IDEA EN UNA FRASE
**Usa React 19 y un proyecto de Vite 8 (con @vitejs/plugin-react 6, el que instala hoy npm create vite@latest).**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en react compiler y las reglas de react: memoización automática como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    C["Código del componente"] --> L{"¿Cumple las reglas de React?"}
    L -->|sí| M["Compiler agrega memoización"]
    L -->|no| S["Compiler lo salta + aviso del linter"]
    M --> D["React DevTools: insignia Memo ✨"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| React Compiler y las reglas de React: memoización automática se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar React Compiler y las reglas de React: memoización automática | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses react compiler y las reglas de react: memoización automática por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: react compiler y las reglas de react: memoización automática funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- React Compiler y las reglas de React: memoización automática existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve react compiler y las reglas de react: memoización automática en tu contexto?
2. ¿Cómo sabrías que react compiler y las reglas de react: memoización automática no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar react compiler y las reglas de react: memoización automática?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    C["Código del componente"] --> L{"¿Cumple las reglas de React?"}
    L -->|sí| M["Compiler agrega memoización"]
    L -->|no| S["Compiler lo salta + aviso del linter"]
    M --> D["React DevTools: insignia Memo ✨"]
```

```js
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Con @vitejs/plugin-react 6 la antigua opción `react({ babel: { plugins: [...] } })`
  // se ignora sin aviso: el compilador se conecta con @rolldown/plugin-babel.
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
});
```

```js
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['src/**/*.{js,jsx}'],
    ...reactHooks.configs.flat.recommended, // incluye las reglas que usa el compilador
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },
];
```

```jsx
export default function ListaEnvios({ envios, filtro }) {
  // ❌ Rompe la inmutabilidad: reemplaza un elemento del array que llegó por props.
  // envios[0] = { ...envios[0], codigo: envios[0].codigo.toUpperCase() };

  // ✅ Crea una copia. El compilador memoiza este cálculo sin useMemo.
  const visibles = envios
    .filter((e) => e.codigo.includes(filtro))
    .toSorted((a, b) => a.codigo.localeCompare(b.codigo));

  return <ul>{visibles.map((e) => <li key={e.codigo}>{e.codigo}</li>)}</ul>;
}
```

```bash
cd academia-react
npm install -D @rolldown/plugin-babel @babel/core babel-plugin-react-compiler eslint eslint-plugin-react-hooks@latest
npx eslint src
npm run dev
```

```text
npx eslint src termina sin errores.
En React DevTools > Components, ListaEnvios muestra la insignia «Memo ✨».
Al escribir en un campo que no afecta a la lista, el Profiler muestra que ListaEnvios no se volvió a renderizar.
```

</details>
