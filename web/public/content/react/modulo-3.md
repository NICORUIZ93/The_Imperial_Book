# Módulo 3: Formularios y eventos


## Aprende construyendo

### Tema 1: React Hook Form y el problema del re-render por tecla

#### Paso 1 · Objetivo y preparación
Al finalizar vas a medir cuántas veces se re-renderiza un formulario de registro de envíos con `useState` por campo, y a migrarlo a React Hook Form para eliminar ese costo. Prerrequisitos: Módulo 2 completo.

#### Paso 2 · Contexto y caso real
El formulario de alta de un nuevo envío en RutaFlow tiene más de diez campos (remitente, destinatario, dirección, peso, dimensiones...); con `useState` individual por campo, cada tecla en cualquier campo re-renderiza el formulario completo.

#### Paso 3 · Teoría, modelo mental y analogía
React Hook Form registra cada input de forma no controlada por debajo (mediante referencias del DOM), evitando que cada tecla dispare un re-render de React — dejar que cada persona escriba en su propio papel privado en vez de anunciar en voz alta cada letra.

**Diagrama: useState vs React Hook Form en formularios**

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

**Evidencia de aprendizaje:** entrega formulario sin re-renders por tecla, campo controlado mezclado detectado y campo adicional confirmado.
**Conceptos clave:** registro no controlado por debajo, rendimiento en formularios grandes.

Manejar cada campo de un formulario con su propio `useState` individual (el enfoque controlado estudiado en el Módulo 1) funciona perfectamente bien para formularios pequeños, pero en formularios con muchos campos, cada tecla presionada en cualquier campo dispara un re-render de todo el componente formulario completo (dado que el estado vive en ese componente padre), un costo que se vuelve mensurable cuando el formulario tiene decenas de campos, cada uno re-renderizándose innecesariamente cada vez que cualquier otro campo cambia, no solo el que efectivamente recibió la tecla.

React Hook Form (`const { register, handleSubmit, formState: { errors } } = useForm();`) resuelve este problema registrando cada input de forma "no controlada" por debajo (similar en espíritu al enfoque no controlado mencionado en el Módulo 1, gestionado internamente mediante referencias del DOM en vez de estado de React sincronizado en cada tecla): `{...register('email', { required: 'El email es obligatorio' })}` conecta el input directamente al sistema interno de la librería sin que cada tecla dispare un re-render de React, permitiendo que formularios con muchos campos permanezcan responsivos incluso a gran escala, mientras React Hook Form gestiona la validación y el estado de errores internamente y de forma eficiente.

`handleSubmit(datos => crearUsuario(datos))` recolecta todos los valores actuales del formulario solo en el momento del envío (no en cada tecla), ejecutando primero cualquier validación configurada y solo invocando la función de envío proporcionada si esa validación pasa exitosamente, con `errors` reflejando de forma reactiva cualquier error de validación encontrado, disponible para mostrarse condicionalmente junto a cada campo correspondiente.

**Analogía:** manejar cada campo con `useState` individual es como anunciar en voz alta a toda la sala cada letra que alguien escribe en cualquier formulario de la sala; React Hook Form es como dejar que cada persona escriba en su propio papel privado, y solo recolectar y anunciar el contenido completo cuando alguien efectivamente entrega su formulario terminado.

**Código del ejemplo:**

```jsx
const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(datos => crearUsuario(datos))}>
  <input {...register('email', { required: 'El email es obligatorio' })} />
  {errors.email && <span>{errors.email.message}</span>}
</form>
```

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow

**Límites y decisión de uso:** Evitar renders por tecla no elimina validación costosa ni asegura buena interacción. Elige campos controlados cuando su comportamiento lo requiera y mide el formulario real antes de introducir complejidad solo para reducir un contador.

#### Paso 4 · Demostración guiada desde cero
```jsx
const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(datos => registrarEnvio(datos))}>
  <input {...register('destinatario', { required: 'El destinatario es obligatorio' })} />
  {errors.destinatario && <span>{errors.destinatario.message}</span>}
</form>
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: agregando un `console.log('render')` en el cuerpo del componente, escribir en el campo `destinatario` no imprime ese log en cada tecla — React Hook Form gestiona el valor internamente sin pasar por `setState` de React en cada cambio.

#### Paso 5 · Práctica guiada
Pista: reemplazá el campo `destinatario` por una versión controlada con `useState` + `onChange` manual, dejando el resto del formulario con `register` "para comparar" — ese es el fallo deliberado: ahora ese campo específico sí re-renderiza el formulario completo en cada tecla (visible en el `console.log`), mientras los demás campos no lo hacen, mezclando dos modelos sin necesidad.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo `destinatario` a `register`, y agregá un campo nuevo (`peso`) también con `register`, confirmando que agregar campos a React Hook Form no incrementa el costo de render de los campos existentes.

#### Paso 7 · Cierre y evidencia
Entregá el formulario sin re-renders por tecla del Paso 4, el campo controlado mezclado del Paso 5, y el campo adicional del Paso 6; explicá por qué mezclar un campo controlado dentro de un formulario de React Hook Form reintroduce exactamente el costo que React Hook Form existe para evitar. Siguiente paso: estudia cómo validar ese formulario con un schema de zod. Errores comunes: mezclar campos controlados y no controlados en el mismo formulario sin necesidad, no medir realmente el costo de render antes de migrar a React Hook Form, y olvidar `{...register(...)}` en algún input dejándolo sin conectar. Fuentes oficiales: https://react-hook-form.com/get-started y https://react.dev/learn/sharing-state-between-components.
**¿Por qué es importante?** React Hook Form evita el costo de re-renderizar el formulario completo en cada tecla, un problema de rendimiento mensurable en formularios con muchos campos.

### Tema 2: Validación con zod y formularios multi-paso

#### Paso 1 · Objetivo y preparación
Al finalizar vas a validar el formulario de registro de envíos con un schema de zod, y a dividirlo en dos pasos (datos del paquete, datos de entrega) sin perder información al retroceder. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
El peso de un envío debe ser un número positivo y la dirección no puede estar vacía — validar esto manualmente campo por campo en el `onSubmit` sería repetitivo y difícil de mantener sincronizado con las reglas reales del backend.

#### Paso 3 · Teoría, modelo mental y analogía
Un schema de zod describe declarativamente qué forma y qué restricciones debe cumplir un objeto de datos válido, conectado a React Hook Form mediante `zodResolver` — una plantilla de aduana que especifica qué documentos son válidos para pasar.
**Conceptos clave:** schema declarativo, `zodResolver`, estado compartido entre pasos.

Un schema de zod (`z.object({ email: z.string().email(), edad: z.number().min(18) })`) describe declarativamente qué forma y qué restricciones debe cumplir un objeto de datos válido, de forma similar en espíritu a los validadores declarativos de Reactive Forms estudiados en el Módulo 5 del track de Angular, pero expresado como un schema TypeScript-first reutilizable también para validar datos en otros contextos (por ejemplo, validar la misma forma de datos en el backend, Módulo 8 del track de Node.js, compartiendo literalmente el mismo schema entre cliente y servidor). Conectar ese schema a React Hook Form mediante `useForm({ resolver: zodResolver(schema) })` delega toda la lógica de validación a zod, poblando automáticamente `errors` con los mensajes correspondientes cuando el schema rechaza algún valor.

Un formulario multi-paso mantiene el estado combinado de todos los pasos en un componente padre compartido (`const [datos, setDatos] = useState({})`), donde cada paso individual es un sub-formulario independiente que, al completarse, fusiona sus propios datos con el estado acumulado existente (`setDatos(prev => ({ ...prev, ...datosDelPaso }))`) antes de avanzar al siguiente paso (`setPaso(p => p + 1)`); al retroceder a un paso anterior, ese estado combinado ya existente permite prellenar nuevamente los campos con los valores previamente ingresados, en vez de perderlos y forzar al usuario a reescribirlos desde cero.

**Analogía:** un schema de zod es como una plantilla de aduana que especifica exactamente qué documentos y en qué formato son válidos para pasar, rechazando automáticamente cualquier envío que no cumpla esos requisitos declarados; un formulario multi-paso es como llenar un formulario largo en varias hojas separadas que se van acumulando en la misma carpeta, permitiendo volver a una hoja anterior sin perder lo ya escrito en las demás.

**Código del ejemplo:**

```jsx
const schema = z.object({ email: z.string().email(), edad: z.number().min(18) });
useForm({ resolver: zodResolver(schema) });

const [paso, setPaso] = useState(1);
const [datos, setDatos] = useState({});
function siguientePaso(datosDelPaso) {
  setDatos(prev => ({ ...prev, ...datosDelPaso }));
  setPaso(p => p + 1);
}
```

* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

**Límites y decisión de uso:** El esquema del cliente puede omitirse o quedar desactualizado; el servidor debe validar también. En pasos múltiples conserva datos válidos y errores por campo, sin perder el borrador ni enviar campos ocultos que ya no corresponden.

#### Paso 4 · Demostración guiada desde cero
```jsx
const schemaPaquete = z.object({
  peso: z.number().positive('El peso debe ser mayor a 0'),
  direccion: z.string().min(1, 'La dirección es obligatoria'),
});
useForm({ resolver: zodResolver(schemaPaquete) });
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: intentar enviar el paso 1 con `peso: -5` o `direccion: ''` puebla automáticamente `errors.peso`/`errors.direccion` con el mensaje del schema, sin que el componente escriba ninguna lógica de validación manual.

#### Paso 5 · Práctica guiada
**Fallo deliberado #1 (sobrescribir estado):**
Cambiá `setDatos(prev => ({ ...prev, ...datosDelPaso }))` por `setDatos(datosDelPaso)` (sin el spread) — al llegar al paso 2, los datos del paso 1 desaparecen, y retroceder muestra un formulario vacío.

**Fallo deliberado #2 (schema incompleto):**
Remové la validación de `peso: z.number().positive()` del schema, dejando solo `direccion` — ahora puedes enviar un peso negativo (-10 kg) sin que zod lo rechace, porque nunca lo validó.

**Fallo deliberado #3 (duplicar validación):**
Mantén el schema de zod pero agregá además validación manual en el `onSubmit`: `if (peso < 0) setErrors(...)` — ahora tenés dos lugares donde validar la misma regla, fácil de desincronizar cuando una cambia.
**Pista:** revertí cada fallo antes de probar el siguiente — el Fallo #1 se nota de inmediato al retroceder de paso, pero el Fallo #2 (schema incompleto) solo se nota si intentás enviar explícitamente un valor que debería haber sido rechazado.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando el spread, y agregá un tercer paso (confirmación) que muestre un resumen de todos los datos acumulados de los pasos 1 y 2, confirmando que nada se perdió en el camino.

**Evidencia de aprendizaje:** entrega schema con validación, pérdida de datos detectada y paso de confirmación con resumen completo.

#### Paso 7 · Cierre y evidencia
Entregá el schema con validación del Paso 4, la pérdida de datos provocada en el Paso 5, y el paso de confirmación del Paso 6; explicá por qué `setDatos(prev => ({ ...prev, ...datosDelPaso }))` es necesario, dado que cada paso solo conoce sus propios campos, no los de los demás pasos. Siguiente paso: estudia cómo React normaliza los eventos del formulario. Errores comunes: sobrescribir el estado acumulado en vez de fusionarlo al avanzar de paso, duplicar reglas de validación entre el schema y código manual adicional, y no validar un paso antes de permitir avanzar al siguiente. Fuentes oficiales: https://zod.dev/ y https://react-hook-form.com/docs/useform.
**¿Por qué es importante?** Un schema de zod centraliza y hace reutilizable la lógica de validación; conservar el estado combinado entre pasos evita que el usuario pierda datos ya ingresados al navegar entre pasos.

### Tema 3: Eventos sintéticos

#### Paso 1 · Objetivo y preparación
Al finalizar vas a manejar el envío del formulario de registro de envíos con `e.preventDefault()`, confirmando que ese método funciona igual sin importar el navegador. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Sin llamar expresamente a `preventDefault()`, enviar el formulario de registro de envíos recarga la página completa (el comportamiento nativo por defecto de un `<form>`), perdiendo cualquier estado de React en el proceso.

#### Paso 3 · Teoría, modelo mental y analogía
React envuelve los eventos nativos del DOM en un `SyntheticEvent` con una API consistente entre navegadores — un traductor universal que normaliza mensajes de distintos "idiomas nativos" en uno común.

#### Paso 4 · Demostración guiada desde cero
```jsx
function manejarSubmit(e) {
  e.preventDefault(); // evita la recarga completa de la página
  handleSubmit(datos => registrarEnvio(datos))(e);
}
<form onSubmit={manejarSubmit}>
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: al enviar el formulario, la página no se recarga (no aparece el parpadeo característico de una recarga completa), y el estado de React (los datos ya ingresados, cualquier mensaje de error visible) permanece intacto mientras `registrarEnvio` procesa el envío.

#### Paso 5 · Práctica guiada
Pista: quitá `e.preventDefault()` del manejador — ese es el fallo deliberado: al tocar "Enviar", el navegador recarga la página completa con su comportamiento nativo, perdiendo instantáneamente todo el estado de React, incluyendo cualquier dato ya ingresado en los otros pasos del formulario multi-paso del Tema 2.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `e.preventDefault()`, y agregá un manejador `onKeyDown` en el campo de peso que llame a `e.preventDefault()` específicamente cuando se presione una tecla que no sea un dígito, evitando escribir letras en un campo numérico.

#### Paso 7 · Cierre y evidencia
Entregá el manejador con `preventDefault` del Paso 4, la recarga de página provocada en el Paso 5, y el bloqueo de teclas no numéricas del Paso 6; explicá por qué `e.preventDefault()` dentro de un `SyntheticEvent` de React funciona de forma idéntica sin importar el navegador. Siguiente paso: estudia routing con React Router. Errores comunes: olvidar `preventDefault` en el submit de un formulario, confundir `e.target` con `e.currentTarget` en un evento con burbujeo, y depender de comportamiento específico de un navegador en vez de la API sintética unificada. Fuentes oficiales: https://react.dev/learn/responding-to-events y https://react.dev/reference/react-dom/components/common#react-event-object.

**Diagrama:**

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

* Ejecutar: `npm test -- --testNamePattern="events|synthetic"`
* Código: `src/components/ShipmentForm.tsx`
* Proyecto: proyecto integrador RutaFlow
* Cuándo: usar `preventDefault` siempre en formularios para evitar recarga del navegador; `SyntheticEvent` garantiza consistencia entre navegadores en vez de depender de APIs nativas inconsistentes.

**¿Por qué es importante?** El envoltorio de eventos sintéticos garantiza una API de eventos consistente entre navegadores, y sin `preventDefault` el comportamiento nativo del navegador destruye todo el estado de React acumulado.
**Evidencia de aprendizaje:** entrega manejador con preventDefault, recarga de página provocada y bloqueo de teclas no numéricas.

## Laboratorio práctico

**Objetivo del laboratorio:** construir un formulario de registro multi-paso con React Hook Form y validación con zod.

**Requisitos previos:** Módulos 0-2 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Construir un formulario de registro con React Hook Form | Ver Tema 1 | `register`, `handleSubmit`, `errors` |
| 2 | Agregar validación con un schema de zod | Ver Tema 2 | `zodResolver(schema)` |
| 3 | Implementar el formulario multi-paso | Ver Tema 2 | Conserva datos al avanzar y retroceder |
| 4 | Manejar el evento de submit correctamente | Ver Tema 3 | `preventDefault` |

**Verificación:** el laboratorio se considera exitoso si el formulario valida correctamente según el schema de zod, y si los datos de un paso anterior permanecen visibles al retroceder y volver a avanzar.

**Errores comunes y soluciones**

- **Manejar cada campo con `useState` individual en un formulario grande.** Usa React Hook Form para evitar re-renders innecesarios en cada tecla.
- **Olvidar `preventDefault` en el submit.** Sin él, el navegador recarga la página por defecto.
- **Perder los datos de pasos anteriores al retroceder.** Fusiona siempre los datos del paso actual con el estado acumulado antes de avanzar.

---

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama
