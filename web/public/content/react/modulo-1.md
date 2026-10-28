# Módulo 1: Estado local y el ciclo de render


## Aprende construyendo

### Tema 1: useState y actualizaciones funcionales

#### Paso 1 · Objetivo y preparación
Al finalizar vas a construir un contador de "intentos de confirmación" en `FormularioConfirmacion` que se incremente correctamente incluso ante un doble click rápido en el botón. Prerrequisitos: Módulo 0 completo.

#### Paso 2 · Contexto y caso real
Un conductor con mala señal a veces hace doble click en "Confirmar entrega" sin darse cuenta — cada click debería contar como un intento real, no perderse uno por culpa de cómo se actualiza el estado. En RutaFlow (Módulo 12), el formulario de confirmación debe registrar correctamente cada intento de envío, incluso si el usuario hace doble click accidentalmente.

#### Paso 3 · Teoría, modelo mental y analogía
Cada render ejecuta la función del componente desde cero, y cada variable de `useState` leída dentro de un manejador queda "congelada" en el closure de esa ejecución; la forma funcional del setter (`setIntentos(i => i + 1)`) lee siempre el valor más reciente, no el capturado.

**Diagrama: Valor capturado vs forma funcional**

```mermaid
graph TD
    A["Inicio: intentos = 0<br/>Usuario hace click"]
    
    B["setIntentos intentos + 1<br/>setIntentos intentos + 1"]
    C["setIntentos i => i + 1<br/>setIntentos i => i + 1"]
    
    A -->|Forma estática| B
    A -->|Forma funcional| C
    
    B -->|Ambas leen<br/>el mismo 0| D["Resultado:<br/>intentos = 1<br/>ERROR"]
    C -->|Primera obtiene 0,<br/>Segunda obtiene 1| E["Resultado:<br/>intentos = 2<br/>CORRECTO"]
    
    style D fill:#ffebee
    style E fill:#e8f5e9
```

#### Paso 4 · Demostración guiada desde cero
```jsx
function FormularioConfirmacion() {
  const [intentos, setIntentos] = useState(0);
  function confirmarDosVeces() {
    setIntentos(intentos + 1);
    setIntentos(intentos + 1); // ambas leen el mismo `intentos` capturado
  }
  return <button onClick={confirmarDosVeces}>Intentos: {intentos}</button>;
}
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: tras un click en el botón, `intentos` pasa de 0 a 1, no a 2 — ambas llamadas a `setIntentos` dentro de `confirmarDosVeces` leyeron el mismo valor `0` capturado en esa ejecución del render, así que la segunda llamada sobrescribe a la primera con el mismo resultado.

**Demo con React DevTools:**
1. Abre tu aplicación con el componente anterior
2. En DevTools → Componentes tab, inspecciona `<FormularioConfirmacion />`
3. En el panel lateral, mira el estado: `intentos: 0`
4. Haz click en el botón una vez
5. Mira cómo `intentos` cambió a `1` en el panel de DevTools (no a 2)
6. Ahora edita el código del manejador para usar la forma funcional: `setIntentos(i => i + 1)` en ambas líneas
7. Recarga el componente en DevTools (o rehazlo completamente)
8. Haz click nuevamente: ahora `intentos` salta a `2` en el panel de DevTools
9. Resultado esperado: ver en tiempo real cómo la forma funcional acumula correctamente los cambios de estado.

#### Paso 5 · Práctica guiada
Pista: dejá el código del Paso 4 y esperá que `intentos` llegue a 2 "porque llamé a `setIntentos` dos veces" — ese es el fallo deliberado: el contador queda en 1, no en 2, porque ambas llamadas leyeron el mismo `intentos` capturado antes de que ninguna de las dos se aplicara.

#### Paso 6 · Práctica independiente
Corregí `confirmarDosVeces` usando la forma funcional (`setIntentos(i => i + 1)`) en ambas llamadas, y confirmá que ahora un solo click sí lleva el contador de 0 a 2, porque cada llamada recibe el valor más reciente en el momento en que React efectivamente la aplica.

#### Paso 7 · Cierre y evidencia
Entregá el contador con el bug de los Pasos 4-5, y la corrección con forma funcional del Paso 6; explicá por qué dos llamadas a `setIntentos(intentos + 1)` en el mismo manejador no se acumulan, mientras que dos llamadas a `setIntentos(i => i + 1)` sí lo hacen. Siguiente paso: estudia la diferencia entre render y commit. Errores comunes: depender del valor capturado cuando el nuevo estado depende del anterior, mutar un objeto de estado directamente en vez de crear uno nuevo, y leer el estado inmediatamente después de llamar al setter esperando el valor ya actualizado. Fuentes oficiales: https://react.dev/learn/state-a-components-memory y https://react.dev/learn/queueing-a-series-of-state-updates.
**¿Por qué es importante?** Porque depender del valor de estado capturado en el closure, en vez de la forma funcional, pierde actualizaciones cuando el nuevo valor depende del valor anterior dentro del mismo manejador.
**Evidencia de aprendizaje:** entrega contador con el bug detectado y corrección con forma funcional.
**Conceptos clave:** valor capturado por closure, forma funcional del setter.

#### Por qué los Hooks dependen del orden de llamada

`useState` no es una palabra reservada de JavaScript ni una anotación: es una función de React que consulta el **dispatcher** activo durante el render. React asocia cada llamada con una posición estable dentro de la secuencia de Hooks del componente; en renderizados posteriores, esa misma posición permite recuperar la celda de estado correcta. Esta es la razón mecánica de las Reglas de Hooks, no una preferencia de estilo.

No llames Hooks dentro de `if`, ciclos, callbacks o después de un retorno condicional. Si una condición cambia el orden, la segunda llamada de un render puede ocupar la posición que pertenecía a otro estado en el render anterior. Los Hooks deben estar en el nivel superior de un componente o de un Hook personalizado; el prefijo `use` permite además que el linter reconozca y verifique ese contrato.

```jsx
// Incorrecto: la posición de la llamada cambia según `habilitado`
if (habilitado) {
  const [filtro, setFiltro] = useState('');
}

// Correcto: el Hook conserva su posición; la condición afecta al uso del valor
const [filtro, setFiltro] = useState('');
const filtroActivo = habilitado ? filtro : '';
```

Cada vez que un componente se renderiza, la función del componente se ejecuta de nuevo desde el principio, y cada variable declarada dentro de ella (incluyendo el valor devuelto por `useState`) es una nueva variable local de esa ejecución específica, capturada en el closure de los manejadores de eventos definidos en esa misma ejecución (el concepto de closure, estudiado en profundidad en el Módulo 4 del track de JavaScript, aplicado aquí directamente al modelo de componentes de React): esto explica por qué llamar `setCount(count + 1)` dos veces seguidas dentro del mismo manejador de evento no duplica el incremento, dado que ambas llamadas leen el mismo valor de `count` capturado en esa ejecución específica del componente, sin que la primera llamada a `setCount` actualice sincrónicamente el valor de `count` que la segunda llamada leería.

La forma funcional del setter (`setCount(c => c + 1)`) resuelve este problema: en vez de calcular el nuevo valor a partir de la variable capturada en el closure, se le pasa una función que React invoca con el valor de estado más actualizado disponible en el momento en que efectivamente aplica esa actualización, garantizando que actualizaciones sucesivas dentro de un mismo manejador de evento efectivamente se acumulen correctamente unas sobre otras, en vez de sobreescribirse mutuamente basándose en el mismo valor obsoleto capturado.

Esta distinción importa especialmente en cualquier escenario donde múltiples actualizaciones del mismo estado ocurren antes de que el componente vuelva a renderizarse (por ejemplo, dentro de un mismo manejador de evento, o dentro de una función asíncrona que actualiza el mismo estado en distintos momentos), siendo la forma funcional la opción segura por defecto cuando el nuevo valor depende del valor anterior, en vez de asumir que la variable local capturada refleja siempre el estado más reciente.

**Analogía:** usar el valor capturado directamente es como escribir tres notas separadas basadas en la misma fotografía de un marcador que tomaste al principio del día, sin darte cuenta de que el marcador ya cambió después de la primera nota; usar la forma funcional es como pedirle a alguien que consulte el marcador actual real justo antes de escribir cada nota, garantizando que cada una parte del valor efectivamente más reciente.

**¿Por qué es importante?** La forma funcional del setter evita el bug clásico de actualizaciones de estado que se sobreescriben mutuamente al depender de un valor capturado obsoleto en el closure de la ejecución de render en curso.

**Código del ejemplo:**

```jsx
const [count, setCount] = useState(0);

// PELIGROSO: ambas llamadas leen el mismo `count` capturado
setCount(count + 1);
setCount(count + 1); // count sigue siendo el valor original aquí

// SEGURO: la forma funcional siempre recibe el valor más reciente
setCount(c => c + 1);
setCount(c => c + 1); // ahora sí suma 2
```

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow

### Tema 2: Render frente a commit

#### Paso 1 · Objetivo y preparación
Al finalizar vas a demostrar con un `console.log` dentro de `FormularioConfirmacion` que ejecutar la función del componente (render) no siempre produce un cambio visible en el DOM (commit). Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Nadie confirmó todavía si actualizar el estado con el mismo valor que ya tenía (por ejemplo, "re-confirmar" el mismo PIN sin cambiarlo) realmente vuelve a tocar el DOM, o si React se da cuenta de que no hay nada nuevo que mostrar.

#### Paso 3 · Teoría, modelo mental y analogía
React separa render (ejecutar la función del componente y calcular un nuevo árbol de elementos) de commit (comparar ese árbol con el anterior y aplicar solo los cambios mínimos al DOM real) — un arquitecto dibujando planos no es lo mismo que el equipo de construcción moviendo ladrillos.

**Diagrama: Render vs Commit**

```mermaid
graph TD
    A["Estado cambia:<br/>pin = '123456'"]
    
    B["FASE DE RENDER:<br/>Ejecuta función del componente<br/>Genera nuevo árbol de elementos"]
    C["console.log se ejecuta aquí<br/>(tal vez múltiples veces)"]
    
    D["Reconciliación:<br/>Compara árbol nuevo vs anterior<br/>¿Hay cambios reales?"]
    
    E["Cambios encontrados"]
    F["No hay cambios"]
    
    G["FASE DE COMMIT:<br/>Aplica cambios al DOM real<br/>El input se actualiza en pantalla"]
    H["NO aplica nada al DOM<br/>El input se ve igual<br/>(pero la función se ejecutó)"]
    
    A -->|1| B
    B -->|durante| C
    B -->|2| D
    D -->|Sí| E
    D -->|No| F
    E -->|3| G
    F -->|3| H
    
    style B fill:#fff3e0
    style G fill:#4caf50
    style H fill:#ffeb3b
```

#### Paso 4 · Demostración guiada desde cero
```jsx
function FormularioConfirmacion() {
  const [pin, setPin] = useState('837201');
  console.log('render de FormularioConfirmacion');
  return <input value={pin} onChange={e => setPin(e.target.value)} />;
}
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: llamar a `setPin('837201')` con el mismo valor que `pin` ya tiene dispara una nueva ejecución de la función (el `console.log` se imprime de nuevo), pero el input en pantalla no cambia visualmente, porque React compara el árbol resultante y no encuentra ninguna diferencia real que aplicar al DOM.

#### Paso 5 · Práctica guiada
Pista: afirmá que "si el `console.log` se imprime de nuevo, significa que algo cambió visualmente" sin comprobar el caso contrario — ese es el fallo deliberado: llamar a `setPin` con el mismo valor también reimprime el `console.log`, sin que haya ningún cambio visual real; la frecuencia del log no te dice nada por sí sola sobre si hubo un commit visible.

#### Paso 6 · Práctica independiente
Corregí tu conclusión del Paso 5 agregando una segunda prueba: actualizá `pin` a un valor distinto y confirmá explícitamente (mirando el input renderizado) que esta vez sí hubo un cambio visual, a diferencia del Paso 4 donde el valor era idéntico.

#### Paso 7 · Cierre y evidencia
Entregá la prueba del Paso 4 (render sin cambio visual), la aclaración del Paso 5, y la comparación del Paso 6; explicá por qué "la función del componente se ejecutó" no es lo mismo que "algo cambió en pantalla", y por qué esa distinción importa para decidir dónde vive un efecto secundario. Siguiente paso: estudia batching de actualizaciones. Errores comunes: asumir que cada render produce un cambio visual, poner efectos secundarios directamente en el cuerpo del componente en vez de `useEffect`, y confundir la frecuencia de ejecución de un `console.log` con la frecuencia de cambios reales en el DOM. Fuentes oficiales: https://react.dev/learn/render-and-commit y https://react.dev/reference/react/useState.
**¿Por qué es importante?** Entender que renderizar no equivale automáticamente a un cambio visual real explica por qué los efectos secundarios deben vivir dentro de `useEffect`, no directamente en el cuerpo del componente.
**Evidencia de aprendizaje:** entrega prueba de render sin cambio visual, aclaración del malentendido y comparación con cambio real.
**Conceptos clave:** fase de render (cálculo), fase de commit (aplicación al DOM real).

React separa internamente el trabajo de actualizar la interfaz en dos fases distintas: la fase de render, durante la cual React ejecuta la función del componente (y de todos sus componentes hijos afectados) para calcular una descripción de qué debería verse en pantalla (una nueva versión del árbol de elementos producido por JSX/`createElement`, Módulo 0), sin todavía tocar el DOM real del navegador; y la fase de commit, durante la cual React compara esa nueva descripción con la anterior (un proceso llamado reconciliation) y aplica al DOM real únicamente los cambios mínimos necesarios para reflejar las diferencias encontradas.

Esta separación explica por qué ejecutar la función de un componente (la fase de render) no necesariamente implica que algo cambie visualmente en pantalla: si el árbol de elementos resultante de esa ejecución es idéntico al anterior, React no necesita aplicar ningún cambio real al DOM durante la fase de commit, aunque la función del componente sí se haya ejecutado completamente de nuevo. Comprender esta separación es fundamental para entender por qué código con efectos secundarios directos dentro del cuerpo de la función componente (fuera de un `useEffect`, Módulo 2) es problemático: ese código se ejecutaría en cada fase de render, potencialmente múltiples veces antes de que cualquier commit real ocurra, en vez de ejecutarse una única vez cuando el cambio efectivamente se aplica.

**Analogía:** la fase de render es como un arquitecto dibujando planos actualizados de un edificio basándose en los requisitos más recientes, sin todavía haber movido un solo ladrillo real; la fase de commit es como el equipo de construcción aplicando físicamente solo los cambios necesarios entre los planos anteriores y los nuevos, sin reconstruir el edificio completo desde cero cada vez.

**¿Por qué es importante?** Entender que renderizar (ejecutar la función del componente) no equivale automáticamente a un cambio visual real explica por qué los efectos secundarios deben vivir dentro de `useEffect` y no directamente en el cuerpo de la función componente.

**Diagrama:**

```
Render:  ejecuta la función componente → calcula el nuevo árbol de elementos
Commit:  compara con el árbol anterior → aplica solo los cambios mínimos al DOM real
(Render puede ocurrir sin que el commit produzca ningún cambio visual)
```

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow

### Tema 3: Batching de actualizaciones

#### Paso 1 · Objetivo y preparación
Al finalizar vas a confirmar con un `console.log` que tres llamadas a `setState` dentro del mismo manejador de `FormularioConfirmacion` producen un único render, no tres. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Al confirmar una entrega en RutaFlow (Módulo 12), el formulario actualiza tres estados a la vez (`enviando`, `intentos`, `error`) — nadie confirmó todavía si eso dispara tres renders separados o uno solo combinado. En una aplicación de rastreo de envíos, eso es crítico para el rendimiento.

#### Paso 3 · Teoría, modelo mental y analogía
React agrupa (batchea) múltiples actualizaciones de estado ocurridas dentro del mismo manejador de evento en un único ciclo de render y commit — un cajero que espera a que termines de pedir los tres artículos antes de calcular el total una sola vez.

**Diagrama: Batching de actualizaciones**

```mermaid
graph TD
    A["3 setState en el mismo manejador:<br/>setEnviando true<br/>setIntentos i => i + 1<br/>setError null"]
    
    B["SIN BATCHING:<br/>3 renders + 3 commits<br/>Ineficiente"]
    C["CON BATCHING:<br/>1 render + 1 commit<br/>Aplicá el estado final"]
    
    A -->|Antes de React 18| B
    A -->|React 18+| C
    
    B -->|Resultado visual| D["console.log impreso 3 veces<br/>DOM actualizado 3 veces"]
    C -->|Resultado visual| E["console.log impreso 1 vez<br/>DOM actualizado 1 vez<br/>(pero reflejá el estado final)"]
    
    style B fill:#ffebee
    style C fill:#e8f5e9
    style D fill:#ffcdd2
    style E fill:#c8e6c9
```

#### Paso 4 · Demostración guiada desde cero
```jsx
function confirmar() {
  setEnviando(true);
  setIntentos(i => i + 1);
  setError(null);
}
// dentro del componente: console.log('render')
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: después de un click que dispara `confirmar()`, el `console.log('render')` se imprime una única vez adicional, no tres — las tres llamadas a setters se agrupan en un único ciclo de render y commit que refleja el efecto combinado de las tres.

#### Paso 5 · Práctica guiada
Pista: envolvé cada `setState` dentro de su propio `setTimeout(() => ..., 0)` por separado — ese es el fallo deliberado: sacar las actualizaciones del manejador síncrono original rompe el batching automático en ese contexto, y ahora el `console.log` se imprime varias veces en vez de una sola.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 quitando los `setTimeout` innecesarios, y agregá una cuarta actualización de estado (`setUltimoIntento(new Date())`) al mismo manejador — confirmá que sigue siendo un único render adicional, no cuatro.

#### Paso 7 · Cierre y evidencia
Entregá la prueba de un solo render del Paso 4, la ruptura del batching provocada en el Paso 5, y la cuarta actualización del Paso 6; explicá por qué agrupar múltiples actualizaciones en un único render es una optimización deliberada, no un detalle incidental. Siguiente paso: estudia componentes controlados. Errores comunes: asumir que cada llamada a un setter dispara su propio render inmediato, sacar actualizaciones de estado fuera de manejadores de evento sin saber que eso puede afectar el batching, y depender del orden de ejecución de los `console.log` para razonar sobre el estado en vez de sobre el valor final. Fuentes oficiales: https://react.dev/learn/queueing-a-series-of-state-updates y https://react.dev/reference/react/useState.
**¿Por qué es importante?** El batching evita ciclos de render y commit redundantes cuando múltiples actualizaciones de estado ocurren en el mismo manejador, aplicando únicamente el estado final combinado en un único ciclo.
**Evidencia de aprendizaje:** entrega prueba de un solo render, ruptura del batching detectada y cuarta actualización confirmada.
**Conceptos clave:** agrupación de múltiples `setState`, un único re-render.

Cuando múltiples llamadas a funciones de actualización de estado ocurren dentro del mismo manejador de evento (`setA(1); setB(2); setC(3);` dentro de una misma función `manejarClick`), React no vuelve a renderizar el componente inmediatamente después de cada llamada individual, sino que agrupa (batchea) todas esas actualizaciones y ejecuta un único ciclo de render y commit que refleja el efecto combinado de las tres, en vez de tres ciclos separados de render y commit, uno por cada llamada individual a una función de actualización de estado.

Este comportamiento es una optimización de rendimiento deliberada: sin batching, cada llamada individual a `setState` dispararía su propio ciclo completo de render y commit, un desperdicio considerable de trabajo cuando en la práctica el componente solo necesita reflejar el estado final combinado de las tres actualizaciones, no cada estado intermedio parcial entre ellas. Este comportamiento se puede verificar empíricamente colocando un `console.log` dentro del cuerpo del componente (que se ejecuta una vez por cada render): tras las tres llamadas a `setState`, ese `console.log` se ejecuta una única vez adicional, no tres veces, confirmando que las tres actualizaciones efectivamente se agruparon en un único render.

**Analogía:** el batching es como un cajero que espera a que termines de pedir los tres artículos completos antes de calcular el total una única vez, en vez de recalcular y anunciar un nuevo total parcial después de cada artículo individual que mencionas.

**¿Por qué es importante?** El batching evita ciclos de render y commit redundantes cuando múltiples actualizaciones de estado ocurren en el mismo manejador de evento, aplicando únicamente el estado final combinado en un único ciclo.

**Código del ejemplo:**

```jsx
function manejarClick() {
  setA(1);
  setB(2);
  setC(3);
  // React agrupa (batchea) estas tres actualizaciones en un único re-render, no en tres
}
```

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow

**Límites y decisión de uso:** El batching agrupa trabajo, pero no convierte el estado leído en un valor actualizado inmediatamente. Si una actualización depende de la anterior, usa su forma funcional y comprueba la secuencia, como explica [React sobre actualizaciones de estado](https://react.dev/learn/queueing-a-series-of-state-updates).

### Tema 4: Componentes controlados

#### Paso 1 · Objetivo y preparación
Al finalizar vas a convertir el campo de PIN de `FormularioConfirmacion` en un componente controlado, con `value` y `onChange` gobernados completamente por `useState`. Prerrequisitos: Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
Si el input de PIN no está controlado, React no tiene ninguna forma de validar o transformar lo que el conductor escribe en tiempo real (por ejemplo, rechazar letras y aceptar solo dígitos) antes de que llegue al envío del formulario.

#### Paso 3 · Teoría, modelo mental y analogía
Un componente controlado tiene su valor gobernado completamente por el estado de React (`value` + `onChange`), no por el estado interno que el elemento del DOM mantendría por su cuenta — un teleprompter cuyo texto siempre viene de un guion central, no una pizarra libre.

**Diagrama: Componentes controlados**

```mermaid
graph TD
    A["Usuario tipea '5' en el input"]
    
    B["onChange se dispara<br/>setPin 5"]
    
    C["React actualiza estado:<br/>pin = '5'"]
    
    D["Re-render del componente<br/>value={pin}"]
    
    E["Input muestra '5'<br/>sincronizado con estado"]
    
    F["React es la única<br/>fuente de verdad"]
    
    A -->|Evento del DOM| B
    B -->|Actualiza estado| C
    C -->|Genera nuevo render| D
    D -->|Lee el nuevo valor| E
    
    E -->|Siempre sincronizado| F
    
    style F fill:#e8f5e9
```

#### Paso 4 · Demostración guiada desde cero
```jsx
const [pin, setPin] = useState('');
<input
  value={pin}
  onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
  maxLength={6}
/>
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: escribir letras en el campo de PIN no las muestra en absoluto (`.replace(/\D/g, '')` las descarta antes de llegar a `setPin`), y el input nunca puede mostrar más de 6 caracteres — el valor mostrado en pantalla es siempre exactamente lo que React decidió que `pin` debía ser, nunca lo que el usuario tecleó directamente sin pasar por esa validación.

#### Paso 5 · Práctica guiada
Pista: quitá el atributo `value` del input, dejando solo `onChange` ("para que sea más simple") — ese es el fallo deliberado: el input pasa a ser no controlado (React ya no gobierna su valor), y la transformación de `onChange` deja de reflejarse visualmente en el campo, porque el DOM ahora mantiene su propio valor interno sin que React lo sincronice de vuelta.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `value={pin}`, y agregá un segundo input controlado para la guía del envío, con su propia validación (sin espacios) — confirmá que ambos campos están sincronizados con su estado de React respectivo.

#### Paso 7 · Cierre y evidencia
Entregá el input de PIN controlado del Paso 4, la pérdida de sincronización del Paso 5, y el segundo campo del Paso 6; explicá por qué quitar `value` (dejando solo `onChange`) convierte un input controlado en no controlado, y qué se pierde exactamente al hacerlo. Siguiente paso: estudia efectos con `useEffect`. Errores comunes: dejar `onChange` sin `value` (input no controlado accidental), mezclar un input controlado con manipulación directa del DOM vía referencia, y no considerar el costo de un re-render por tecla en formularios extremadamente grandes. Fuentes oficiales: https://react.dev/reference/react-dom/components/input y https://react.dev/learn/sharing-state-between-components.

* Ejecutar: `npm test -- --match="*controlled*"`
* Código: `src/components/ControlledInput.tsx`
* Proyecto: proyecto integrador RutaFlow
* Cuándo: usar componentes controlados para validación y transformación en tiempo real; no conviene en formularios con miles de campos donde el costo de re-render por tecla se vuelve relevante (usa React Hook Form en ese caso).

**¿Por qué es importante?** Los componentes controlados hacen del estado de React la única fuente de verdad del valor de un input, permitiendo validación y transformación centralizada en cada cambio.
**Evidencia de aprendizaje:** entrega input de PIN controlado, pérdida de sincronización detectada y segundo campo agregado.
**Conceptos clave:** `value` + `onChange`, React como única fuente de verdad.

Un componente controlado es un elemento de formulario (`<input>`, `<select>`, `<textarea>`) cuyo valor está gobernado completamente por el estado de React, no por el estado interno propio que el elemento del DOM mantendría por defecto: `<input value={valor} onChange={e => setValor(e.target.value)} />` establece que el valor mostrado en el input siempre proviene directamente del estado de React (`valor`), y que cualquier cambio tecleado por el usuario dispara `onChange`, que a su vez actualiza ese mismo estado, que a su vez vuelve a renderizar el input con el nuevo valor — un ciclo completo donde React es la única fuente de verdad, y el DOM nunca "decide" su propio valor de forma independiente sin que React lo sepa.

Esto contrasta con un componente no controlado, donde el DOM mantiene su propio valor interno de forma autónoma, y React solo lo consulta puntualmente cuando es necesario (típicamente mediante una referencia con `useRef`, Módulo 2), en vez de sincronizar ese valor en cada tecla. Los componentes controlados son el enfoque recomendado por defecto porque permiten validar, transformar, o reaccionar al valor tecleado en cada cambio de forma centralizada en el estado de React (útil para validación en tiempo real, formateo automático, o sincronización con otros campos), a costa de un re-render en cada tecla, un costo generalmente insignificante salvo en formularios extremadamente grandes, donde React Hook Form (Módulo 3) ofrece una alternativa que evita ese costo mediante un enfoque no controlado optimizado.

**Analogía:** un componente controlado es como un teleprompter donde el texto mostrado siempre proviene de un guion central que se actualiza en cada cambio; un componente no controlado es como una pizarra donde alguien escribe libremente y solo se consulta lo que dice cuando alguien decide leerla, sin que exista un guion central sincronizado en todo momento.

**¿Por qué es importante?** Los componentes controlados hacen del estado de React la única fuente de verdad del valor de un input, permitiendo validación y transformación centralizada en cada cambio, a costa de un re-render adicional por cada tecla.

**Código del ejemplo:**

```jsx
const [valor, setValor] = useState('');
<input value={valor} onChange={e => setValor(e.target.value)} />
// El DOM nunca "decide" su propio valor de forma independiente
```

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un formulario controlado con validación en tiempo real, demostrando actualizaciones funcionales y batching.

**Requisitos previos:** Módulo 0 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Crear un contador y demostrar el bug de `count + 1` repetido | Ver Tema 1 | Compara con la forma funcional |
| 2 | Construir un input controlado | Ver Tema 4 | `value` + `onChange` |
| 3 | Agregar 3 `setState` en un mismo manejador | Ver Tema 3 | Verifica con `console.log` que hay un único render |
| 4 | Implementar un formulario de 3 campos controlados | Ver Tema 4 | Con validación en cada tecla |
| 5 | Explicar render vs commit con un ejemplo propio | Ver Tema 2 | Un caso donde el render no cambia el DOM |

**Verificación:** el laboratorio se considera exitoso si el contador con la forma funcional acumula correctamente múltiples incrementos en un mismo manejador, y si el formulario valida y refleja el estado en tiempo real en cada tecla.

**Errores comunes y soluciones**

- **Depender del valor capturado en vez de la forma funcional cuando el nuevo estado depende del anterior.** Usa siempre `setEstado(valorAnterior => nuevoValor)` en esos casos.
- **Confundir la ejecución del render con un cambio visual garantizado.** Recuerda que React puede ejecutar la función del componente sin producir ningún cambio real en el DOM.
- **Mezclar un input controlado con actualización directa del DOM.** No mezcles `value` controlado con manipulación directa del elemento vía referencia.

---

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow
