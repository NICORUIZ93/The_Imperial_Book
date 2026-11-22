# Módulo 3: Formularios y eventos


## Aprende construyendo

**Servidor del módulo:** cada ejemplo se sirve con `npm run dev` dentro del proyecto `mi-react` del módulo 0; abre `http://localhost:5173` para ver el resultado y ejecuta `npm test` para las pruebas (Vitest, configurado una sola vez en «Prepara las pruebas» del módulo 0). Si el puerto cambia, usa el que imprima la terminal.


### Tema 1: Eventos sintéticos · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a manejar el envío del formulario de registro de envíos con e.preventDefault(), confirmando que ese método funciona igual sin importar el navegador. Prerrequisitos: Módulo 2 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a manejar el envío del formulario de registro de envíos con e.preventDefault(), confirmando que ese método funciona igual sin importar el navegador.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en eventos sintéticos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
graph LR
    A["Evento nativo<br/>del navegador"] -->|Envuelto| B["SyntheticEvent"]
    B -->|API consistente| C["preventDefault"]
    B -->|API consistente| D["target.value"]
    B -->|API consistente| E["currentTarget"]
    
    F["Sin preventDefault"] -->|Recarga| G["Estado perdido"]
    H["Con preventDefault"] -->|Sincrónico| I["Estado preservado"]
    
    style B fill:#e3f2fd
    style G fill:#ffebee
    style I fill:#e8f5e9
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Eventos sintéticos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Eventos sintéticos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses eventos sintéticos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: eventos sintéticos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Eventos sintéticos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve eventos sintéticos en tu contexto?
2. ¿Cómo sabrías que eventos sintéticos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar eventos sintéticos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
graph LR
    A["Evento nativo<br/>del navegador"] -->|Envuelto| B["SyntheticEvent"]
    B -->|API consistente| C["preventDefault"]
    B -->|API consistente| D["target.value"]
    B -->|API consistente| E["currentTarget"]
    
    F["Sin preventDefault"] -->|Recarga| G["Estado perdido"]
    H["Con preventDefault"] -->|Sincrónico| I["Estado preservado"]
    
    style B fill:#e3f2fd
    style G fill:#ffebee
    style I fill:#e8f5e9
```

```jsx
import { useState } from 'react';

export default function App() {
  const [registrados, setRegistrados] = useState([]);

  function manejarSubmit(e) {
    e.preventDefault(); // evita la recarga completa de la página
    const datos = new FormData(e.currentTarget);
    setRegistrados(prev => [...prev, datos.get('guia')]);
    e.currentTarget.reset();
  }

  return (
    <>
      <form onSubmit={manejarSubmit}>
        <label>Guía <input name="guia" required /></label>
        <button type="submit">Enviar</button>
      </form>
      <p>Registrados en esta sesión: {registrados.join(', ') || 'ninguno'}</p>
    </>
  );
}
```

```bash
npm run dev
```

</details>

### Tema 2: React Hook Form y el problema del re-render por tecla · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a medir cuántas veces se re-renderiza un formulario de registro de envíos con useState por campo, y a migrarlo a React Hook Form para eliminar ese costo. Prerrequisitos: Módulo 2 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a medir cuántas veces se re-renderiza un formulario de registro de envíos con useState por campo, y a migrarlo a React Hook Form para eliminar ese costo.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en react hook form y el problema del re-render por tecla como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
graph TD
    A["Formulario con 10+ campos"]
    
    B["Con useState individual"] -->|Cada tecla| C["setFieldValue dispara<br/>Re-render completo"]
    C -->|Costo| D["10+ renders por tecla<br/>Formulario lento"]
    
    E["Con React Hook Form"] -->|Cada tecla| F["useRef/DOM interno<br/>Sin setState"]
    F -->|Costo| G["0 re-renders de React<br/>Solo en submit"]
    
    A -->|Enfoque 1| B
    A -->|Enfoque 2| E
    
    style D fill:#ffebee
    style G fill:#e8f5e9
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| React Hook Form y el problema del re-render por tecla se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar React Hook Form y el problema del re-render por tecla | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses react hook form y el problema del re-render por tecla por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: react hook form y el problema del re-render por tecla funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- React Hook Form y el problema del re-render por tecla existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve react hook form y el problema del re-render por tecla en tu contexto?
2. ¿Cómo sabrías que react hook form y el problema del re-render por tecla no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar react hook form y el problema del re-render por tecla?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
graph TD
    A["Formulario con 10+ campos"]
    
    B["Con useState individual"] -->|Cada tecla| C["setFieldValue dispara<br/>Re-render completo"]
    C -->|Costo| D["10+ renders por tecla<br/>Formulario lento"]
    
    E["Con React Hook Form"] -->|Cada tecla| F["useRef/DOM interno<br/>Sin setState"]
    F -->|Costo| G["0 re-renders de React<br/>Solo en submit"]
    
    A -->|Enfoque 1| B
    A -->|Enfoque 2| E
    
    style D fill:#ffebee
    style G fill:#e8f5e9
```

```jsx
const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(datos => crearUsuario(datos))}>
  <input {...register('email', { required: 'El email es obligatorio' })} />
  {errors.email && <span>{errors.email.message}</span>}
</form>
```

```jsx
import { useForm } from 'react-hook-form';

function registrarEnvio(datos) {
  console.log('Envío registrado:', datos);
}

function FormularioEnvio() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  console.log('render');

  return (
    <form onSubmit={handleSubmit(datos => registrarEnvio(datos))}>
      <label>
        Destinatario{' '}
        <input {...register('destinatario', { required: 'El destinatario es obligatorio' })} />
      </label>
      {errors.destinatario && <span role="alert">{errors.destinatario.message}</span>}
      <button type="submit">Registrar</button>
    </form>
  );
}

export default function App() {
  return <FormularioEnvio />;
}
```

```bash
npm install react-hook-form
npm run dev
```

</details>

### Tema 3: Validación con zod y formularios multi-paso · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a validar el formulario de registro de envíos con un schema de zod, y a dividirlo en dos pasos (datos del paquete, datos de entrega) sin perder información al retroceder. Prerrequisitos: Tema 2 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a validar el formulario de registro de envíos con un schema de zod, y a dividirlo en dos pasos (datos del paquete, datos de entrega) sin perder información al retroceder.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en validación con zod y formularios multi-paso como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que validación con zod y formularios multi-paso resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Validación con zod y formularios multi-paso se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Validación con zod y formularios multi-paso | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses validación con zod y formularios multi-paso por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: validación con zod y formularios multi-paso funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Validación con zod y formularios multi-paso existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve validación con zod y formularios multi-paso en tu contexto?
2. ¿Cómo sabrías que validación con zod y formularios multi-paso no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar validación con zod y formularios multi-paso?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```jsx
const schema = z.object({ email: z.email(), edad: z.number().min(18) });
useForm({ resolver: zodResolver(schema) });

const [paso, setPaso] = useState(1);
const [datos, setDatos] = useState({});
function siguientePaso(datosDelPaso) {
  setDatos(prev => ({ ...prev, ...datosDelPaso }));
  setPaso(p => p + 1);
}
```

```jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schemaPaquete = z.object({
  peso: z.number().positive('El peso debe ser mayor a 0'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
});

const schemaEntrega = z.object({
  destinatario: z.string().min(1, 'El destinatario es obligatorio'),
});

function PasoPaquete({ valores, alAvanzar }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schemaPaquete),
    defaultValues: valores, // prellena lo escrito antes al volver a este paso
  });
  return (
    <form onSubmit={handleSubmit(alAvanzar)}>
      <label>Peso (kg) <input type="number" step="0.1" {...register('peso', { valueAsNumber: true })} /></label>
      {errors.peso && <span role="alert">{errors.peso.message}</span>}
      <label>Dirección <input {...register('direccion')} /></label>
      {errors.direccion && <span role="alert">{errors.direccion.message}</span>}
      <button type="submit">Siguiente</button>
    </form>
  );
}

function PasoEntrega({ valores, alVolver, alAvanzar }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schemaEntrega),
    defaultValues: valores,
  });
  return (
    <form onSubmit={handleSubmit(alAvanzar)}>
      <label>Destinatario <input {...register('destinatario')} /></label>
      {errors.destinatario && <span role="alert">{errors.destinatario.message}</span>}
      <button type="button" onClick={alVolver}>Volver</button>
      <button type="submit">Registrar</button>
    </form>
  );
}

export default function App() {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState({});

  function siguientePaso(datosDelPaso) {
    setDatos(prev => ({ ...prev, ...datosDelPaso }));
    setPaso(p => p + 1);
  }

  if (paso === 1) return <PasoPaquete valores={datos} alAvanzar={siguientePaso} />;
  if (paso === 2) {
    return <PasoEntrega valores={datos} alVolver={() => setPaso(1)} alAvanzar={siguientePaso} />;
  }
  return <pre>{JSON.stringify(datos, null, 2)}</pre>;
}
```

```bash
npm install react-hook-form zod@4 @hookform/resolvers
npm run dev
```

</details>

### Tema 4: Formularios con Actions: useActionState y useOptimistic · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa React 19 o superior. Parte del proyecto de Vite del módulo y trabaja en src/Notas.jsx. El «servidor» se simula con una función que tarda un segundo.

#### ► LA IDEA EN UNA FRASE
**Usa React 19 o superior.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en formularios con actions: useactionstate y useoptimistic como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant U as Mensajero
    participant F as Formulario
    participant S as Servidor
    U->>F: envía «portería cerrada»
    F->>F: agregarOptimista: nota «enviando…»
    F->>S: guardarNota()
    S-->>F: ok o error
    F->>F: notas reales actualizadas o nota optimista retirada
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Formularios con Actions: useActionState y useOptimistic se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Formularios con Actions: useActionState y useOptimistic | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses formularios con actions: useactionstate y useoptimistic por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: formularios con actions: useactionstate y useoptimistic funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Formularios con Actions: useActionState y useOptimistic existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve formularios con actions: useactionstate y useoptimistic en tu contexto?
2. ¿Cómo sabrías que formularios con actions: useactionstate y useoptimistic no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar formularios con actions: useactionstate y useoptimistic?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
    participant U as Mensajero
    participant F as Formulario
    participant S as Servidor
    U->>F: envía «portería cerrada»
    F->>F: agregarOptimista: nota «enviando…»
    F->>S: guardarNota()
    S-->>F: ok o error
    F->>F: notas reales actualizadas o nota optimista retirada
```

```jsx
import { useActionState, useOptimistic, useState } from 'react';

async function guardarNota(texto) {
  await new Promise((listo) => setTimeout(listo, 1000)); // simula el servidor
  if (texto.includes('error')) throw new Error('El servidor rechazó la nota');
  return { id: crypto.randomUUID(), texto };
}

export default function Notas() {
  const [notas, setNotas] = useState([]);
  const [notasVisibles, agregarOptimista] = useOptimistic(
    notas,
    (actuales, texto) => [...actuales, { id: 'temporal', texto, enviando: true }],
  );

  const [error, enviar, enviando] = useActionState(async (_errorAnterior, formData) => {
    const texto = formData.get('texto').trim();
    if (!texto) return 'Escribe una nota';
    agregarOptimista(texto);
    try {
      const guardada = await guardarNota(texto);
      setNotas((actuales) => [...actuales, guardada]);
      return null;
    } catch (e) {
      return e.message; // la nota optimista desaparece sola
    }
  }, null);

  return (
    <form action={enviar}>
      <ul>
        {notasVisibles.map((n) => <li key={n.id}>{n.texto}{n.enviando && ' (enviando…)'}</li>)}
      </ul>
      <input name="texto" placeholder="Nota para el envío" />
      <button disabled={enviando}>{enviando ? 'Enviando…' : 'Agregar'}</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

```bash
cd academia-react
npm run dev
```

```text
Al enviar «portería cerrada»: la nota aparece al instante con «(enviando…)», el botón dice «Enviando…» y, un segundo después, la nota queda sin la marca.
Al enviar «error de prueba»: la nota aparece un segundo y desaparece, y se muestra «El servidor rechazó la nota».
```

</details>
