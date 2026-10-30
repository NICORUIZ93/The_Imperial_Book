# Módulo 8: Testing en React


## Aprende construyendo

### Tema 1: Queries por rol, no por clase CSS

#### Paso 1 · Objetivo y preparación
Al finalizar vas a testear el botón "Confirmar entrega" de RutaFlow consultándolo por su rol accesible, en vez de por una clase CSS. Prerrequisitos: Módulo 3 completo.

#### Paso 2 · Contexto y caso real
El diseño de `BotonConfirmar` cambia de clase CSS varias veces por iteraciones de estilo (`btn-primary` → `btn-confirmar-v2`) sin que su comportamiento real cambie — un test que dependa de esa clase se rompería en cada rediseño cosmético.

#### Paso 3 · Teoría, modelo mental y analogía
Testing Library consulta por rol y nombre accesible, como lo haría un usuario o un lector de pantalla — identificar al actor que hace de rey por su rol en la obra, no por el número de camerino.

**Diagrama: Testing Library vs Testing tradicional**

```mermaid
graph TD
    A["Test: ¿Funciona el botón?"]
    
    B["Enfoque tradicional:<br/>getByClassName"]
    C["Busca: .btn-primary<br/>si el CSS cambia<br/>el test falla"]
    
    D["Testing Library:<br/>getByRole + name"]
    E["Busca: button + 'Confirmar'<br/>Independiente del CSS<br/>Refleja lo que ve el usuario"]
    
    A -->|Frágil| B
    B -->|Problema| C
    
    A -->|Robusto| D
    D -->|Ventaja| E
    
    style C fill:#ffebee
    style E fill:#e8f5e9
```

#### Paso 4 · Demostración guiada desde cero
```jsx
render(<DetalleEnvio envio={envioDePrueba} />);
const boton = screen.getByRole('button', { name: /confirmar entrega/i });
await userEvent.click(boton);
expect(screen.getByText(/entrega confirmada/i)).toBeInTheDocument();
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: el test encuentra el botón por su rol semántico (`button`) y su nombre accesible ("Confirmar entrega"), sin importar qué clase CSS tenga en ese momento, y confirma que el mensaje de éxito aparece tras el click.

#### Paso 5 · Práctica guiada
Pista: escribí deliberadamente una segunda versión del mismo test usando `document.querySelector('.btn-primary')` en vez de `getByRole` — ese es el fallo deliberado: cambiá la clase de `BotonConfirmar` a `btn-confirmar-v2` (un rediseño puramente cosmético) y esa segunda versión del test se rompe inmediatamente, aunque el comportamiento real del botón no cambió en absoluto.

#### Paso 6 · Práctica independiente
Confirmá que la versión del Paso 4 (con `getByRole`) sigue pasando sin ningún cambio después del rediseño, y documentá explícitamente qué detalle de implementación cambió (la clase CSS) frente a qué se mantuvo igual (el rol y el nombre accesible del botón).

#### Paso 7 · Cierre y evidencia
Entregá el test resiliente del Paso 4, la comparación con el selector de clase roto del Paso 5, y la confirmación del Paso 6; explicá qué detalle de implementación cambió y por qué no debería haber roto ningún test de comportamiento. Siguiente paso: estudia cómo interceptar la llamada de red real con MSW. Errores comunes: consultar por clase CSS o estructura del DOM en vez de por rol/texto, usar `getByText` con un texto que cambia seguido por copywriting en vez de un rol estable, y usar `container.querySelector` como escape hatch habitual en vez de ocasional. Fuentes oficiales: https://testing-library.com/docs/react-testing-library/intro/ y https://testing-library.com/docs/queries/byrole/.
**¿Por qué es importante?** Consultar por rol/texto en vez de por selectores de implementación hace que las pruebas sobrevivan a refactors internos cosméticos que no afectan el comportamiento real observable.
**Evidencia de aprendizaje:** entrega test resiliente por rol, comparación con selector de clase roto y explicación del cambio cosmético.
**Conceptos clave:** `getByRole`, `getByText`, resiliencia a refactors.

React Testing Library promueve deliberadamente consultar el DOM renderizado de la misma forma en que un usuario real (o una tecnología asistiva como un lector de pantalla) identificaría un elemento: por su rol semántico de accesibilidad (`screen.getByRole('button', { name: /enviar/i })`) o por el texto visible que muestra (`screen.getByText(/enviado con éxito/i)`), evitando deliberadamente consultas basadas en detalles internos de implementación como nombres de clases CSS o la estructura exacta del árbol DOM interno (`getByClassName`, deliberadamente no ofrecido como API principal por la librería), un principio de diseño idéntico al estudiado para Angular Testing Library en el Módulo 10 del track de Angular.

Esta elección deliberada produce pruebas que sobreviven a refactors internos del componente que no cambian su comportamiento observable: si se reorganiza el HTML interno de un componente, o se renombra una clase CSS puramente por razones cosméticas, una prueba que consulta por rol/texto sigue pasando sin cambios, mientras que una prueba que dependiera de un selector CSS interno específico se rompería inmediatamente ante ese mismo cambio cosmético, aunque el comportamiento real del componente permanezca completamente intacto.

**Analogía:** consultar por rol/texto es como identificar a alguien por su función visible en una obra de teatro (el actor que hace de rey) en vez de por el número de camerino que ocupa detrás del escenario: si cambia de camerino (un detalle interno irrelevante), sigue siendo identificable de la misma forma por su rol visible en la obra.

**¿Por qué es importante?** Consultar por rol/texto en vez de por selectores de implementación hace que las pruebas sobrevivan a refactors internos cosméticos que no afectan el comportamiento real observable del componente.

**Código del ejemplo:**

```jsx
render(<Formulario />);
const boton = screen.getByRole('button', { name: /enviar/i }); // como lo "vería" un usuario/lector de pantalla
await userEvent.click(boton);
expect(screen.getByText(/enviado con éxito/i)).toBeInTheDocument();
```

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow

### Tema 2: Mock Service Worker (MSW)

#### Paso 1 · Objetivo y preparación
Al finalizar vas a interceptar con MSW la llamada real que `confirmarEntrega` hace a `/api/envios/:id/confirmar`, para testear el flujo completo sin un backend real corriendo. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Testear `DetalleEnvio` end-to-end exigiría tener un backend real corriendo con datos de prueba consistentes — un servidor real es lento, frágil, y comparte estado entre ejecuciones de tests distintas.

#### Paso 3 · Teoría, modelo mental y analogía
MSW intercepta peticiones a nivel de red; el código de producción hace sus peticiones exactamente igual que en producción, sin saber que está siendo interceptado — un servidor de pruebas que se hace pasar transparentemente por el real.
**Conceptos clave:** interceptación a nivel de red, sin conocimiento del código de producción.

MSW intercepta peticiones HTTP a nivel de red (registrando un service worker o, en entornos de prueba, interceptando directamente las llamadas de red del entorno de ejecución) en vez de parchear directamente la función `fetch` global del código de la aplicación (`vi.fn()` o un mock manual de `fetch`, un enfoque alternativo pero más frágil, dado que requiere que el mock replique exactamente la forma en que el código de producción invoca `fetch`); con MSW, el código de producción realiza sus peticiones exactamente igual que en producción real, sin ninguna modificación ni conocimiento de que está siendo interceptado, siendo el propio MSW el que intercepta esas peticiones a nivel de red antes de que lleguen a un servidor real.

`setupServer(http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nombre: 'Ana' }])))` define un manejador que responde a peticiones GET hacia esa ruta específica con datos simulados; `server.listen()` activa la interceptación antes de que las pruebas corran, `server.resetHandlers()` restaura los manejadores por defecto entre pruebas individuales (evitando que un manejador personalizado definido en una prueba específica afecte accidentalmente a pruebas posteriores), y `server.close()` detiene la interceptación al finalizar toda la suite.

**Analogía:** MSW es como un servidor de pruebas que se hace pasar de forma completamente transparente por el servidor real en una red aislada, de modo que el código bajo prueba nunca se entera de que está hablando con un impostor, en vez de reemplazar directamente la línea telefónica del código bajo prueba con un cable falso que requiere modificar el propio código para usarlo.

**Código del ejemplo:**

```js
const server = setupServer(
  http.get('/api/usuarios', () => HttpResponse.json([{ id: 1, nombre: 'Ana' }]))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

* Ejecutar: `npm test`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

**Límites y decisión de uso:** MSW controla la red de la prueba, pero no demuestra que el backend real cumpla el contrato. Mantén pruebas contractuales o de integración y configura handlers que rechacen solicitudes no previstas para no ocultar rutas equivocadas.

#### Paso 4 · Demostración guiada desde cero
```jsx
const server = setupServer(
  http.post('/api/envios/:id/confirmar', () => HttpResponse.json({ estado: 'entregado' }))
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: al hacer click en "Confirmar entrega" dentro del test, la llamada real a `fetch('/api/envios/RF-4471/confirmar', ...)` del código de `DetalleEnvio` es interceptada por MSW, que responde con `{ estado: 'entregado' }` sin que ningún servidor real haya recibido nada.

#### Paso 5 · Práctica guiada
Pista: dentro de un test agregá `server.use(http.post('/api/envios/:id/confirmar', () => HttpResponse.error()))` para simular un fallo, y quitá el `afterEach(() => server.resetHandlers())` global — ese es el fallo deliberado: ese handler de error queda activo y afecta a la PRÓXIMA prueba de la suite, que ahora falla inesperadamente aunque su propio código esté correcto.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `afterEach(() => server.resetHandlers())`, y agregá una prueba explícita del caso de error verificando que `DetalleEnvio` muestra un mensaje de error apropiado, no una pantalla en blanco.

**Evidencia de aprendizaje:** entrega handler de éxito, fuga de handler sin reset detectada y prueba del caso de error.

#### Paso 7 · Cierre y evidencia
Entregá el handler de éxito interceptado del Paso 4, el handler de error sin reset identificado en el Paso 5, y la prueba del caso de error del Paso 6; explicá por qué `resetHandlers()` entre pruebas es tan importante como el propio handler que define el comportamiento simulado. Siguiente paso: estudia cómo testear un hook personalizado aislado. Errores comunes: olvidar `server.resetHandlers()` entre pruebas, testear solo el camino feliz sin el caso de error de red, y definir handlers tan genéricos que interceptan peticiones que la prueba no pretendía simular. Fuentes oficiales: https://mswjs.io/docs/ y https://mswjs.io/docs/api/setup-server.
**¿Por qué es importante?** MSW intercepta a nivel de red, permitiendo probar el código de producción exactamente como se ejecutaría en producción real, sin mockear `fetch` de forma frágil.

### Tema 3: Testing de hooks personalizados

#### Paso 1 · Objetivo y preparación
Al finalizar vas a testear `useFiltroZona` (un hook personalizado que envuelve el store de Zustand del Módulo 7) con `renderHook`, sin necesidad de un componente visual. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
`useFiltroZona` tiene su propia lógica (normalizar el nombre de zona a minúsculas antes de guardarlo) — testear eso envolviéndolo en un componente visual completo solo para invocar el hook sería innecesario.

#### Paso 3 · Teoría, modelo mental y analogía
`renderHook` prueba un hook aislado sin un componente dedicado; `act` garantiza que React procese completamente una actualización antes de la siguiente aserción — probar el motor en un banco de pruebas, sin montar la carrocería completa.
**Conceptos clave:** `renderHook`, `act`, aislar la lógica del hook de un componente visual.

`renderHook(() => useContador())` permite probar un hook personalizado de forma aislada, sin necesidad de crear un componente de prueba dedicado únicamente para invocar ese hook y exponer indirectamente su resultado; el `result` devuelto expone `.current` con el valor actual retornado por el hook, actualizándose automáticamente entre renders sucesivos provocados dentro de la prueba. `act(() => result.current.incrementar())` envuelve cualquier interacción que dispare una actualización de estado dentro del hook, garantizando que React procese completamente esa actualización (incluyendo cualquier efecto asociado) antes de que la aserción siguiente se ejecute, de forma análoga en propósito a `await fixture.whenStable()` en las pruebas de Angular (Módulo 10 del track de Angular).

Probar hooks personalizados de forma aislada, sin envolverlos en un componente visual completo, mantiene la prueba enfocada específicamente en la lógica del hook (sus transiciones de estado, sus efectos), sin acoplar esa prueba a detalles de renderizado visual que no tienen relación real con la lógica que efectivamente se está verificando.

**Analogía:** probar un hook con `renderHook` es como probar el motor de un vehículo en un banco de pruebas aislado, verificando su comportamiento sin necesidad de montar la carrocería completa del vehículo únicamente para poder encenderlo.

**Código del ejemplo:**

```jsx
const { result } = renderHook(() => useContador());
act(() => result.current.incrementar());
expect(result.current.valor).toBe(1);
```

#### Paso 8 · Diseño y decisiones de arquitectura
**Cuándo NO usar `renderHook`:** si el hook depende fuertemente del árbol de contexto o del layout real (por ejemplo un hook que lee `getBoundingClientRect` de un elemento padre específico), aislarlo con `renderHook` produce un falso positivo — en ese caso conviene testear a través de un componente real con `render`, aceptando el costo extra de montar el árbol completo a cambio de una prueba fiel al comportamiento real en pantalla.

En el proyecto integrador RutaFlow (`examples/rutaflow/react/dashboard/src/hooks/useFiltroZona.test.ts`), este hook se testea de forma aislada porque su lógica (normalizar el texto de zona) no depende de ningún layout visual — justo el caso donde `renderHook` es la decisión correcta frente a un test de componente más costoso.

```mermaid
flowchart LR
    A[renderHook invoca el hook] --> B[result.current expone el valor actual]
    B --> C{Interacción cambia estado?}
    C -->|Sí| D[act envuelve la actualización]
    D --> E[React procesa el update + efectos]
    E --> B
    C -->|No| F[Assert sobre result.current]
```

Ejercicio: corré la suite de este hook de forma aislada y confirmá el tiempo de ejecución frente a un test de componente equivalente:
```bash
npm test -- --testPathPattern=useFiltroZona
```
Resultado esperado: la suite pasa en milisegundos porque no monta ningún árbol de componentes — solo invoca el hook y verifica `result.current`.

---

#### Paso 4 · Demostración guiada desde cero
```jsx
const { result } = renderHook(() => useFiltroZona());
act(() => result.current.setZona('NORTE'));
expect(result.current.zona).toBe('norte'); // normalizado a minúsculas
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: el test confirma que `useFiltroZona` normaliza `'NORTE'` a `'norte'` internamente, sin haber renderizado ningún componente visual — solo se invocó el hook y se inspeccionó su resultado.

#### Paso 5 · Práctica guiada
Pista: quitá `act(...)` y llamá directamente `result.current.setZona('NORTE')` fuera de ese wrapper — ese es el fallo deliberado: React advierte en consola que una actualización no fue envuelta en `act(...)`, y en casos más complejos la aserción siguiente puede ejecutarse antes de que React termine de procesar la actualización, leyendo un valor todavía no actualizado.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `act`, y agregá una segunda prueba que confirme que llamar `setZona('')` (cadena vacía) hace que `useFiltroZona` vuelva al valor por defecto `'todas'`, en vez de guardar una cadena vacía inválida.

**Evidencia de aprendizaje:** entrega test aislado del hook, advertencia de act detectada y segunda prueba del valor por defecto.

#### Paso 7 · Cierre y evidencia
Entregá el test aislado del Paso 4, la advertencia de React por falta de `act` del Paso 5, y la segunda prueba del Paso 6; explicá por qué testear este hook con `renderHook` en vez de envolverlo en un componente visual mantiene la prueba enfocada específicamente en su lógica de estado. Siguiente paso: cerrá el módulo integrando los tres enfoques en la suite completa de RutaFlow. Errores comunes: envolver un hook en un componente visual completo solo para poder testearlo, no envolver actualizaciones de estado en `act`, y testear un hook personalizado únicamente a través de pruebas end-to-end de componentes, sin ninguna prueba aislada de su lógica. Fuentes oficiales: https://testing-library.com/docs/react-testing-library/api/#renderhook y https://react.dev/reference/react/act.
**¿Por qué es importante?** `renderHook` aísla la prueba de un hook personalizado de cualquier componente visual innecesario, manteniendo la prueba enfocada específicamente en la lógica de estado y efectos del hook.

## Laboratorio práctico

**Objetivo del laboratorio:** escribir una suite de pruebas completa de un flujo de formulario con fetching mockeado.

**Requisitos previos:** Módulos 0-7 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Renderizar un componente y consultarlo por rol | Ver Tema 1 | No uses `getByClassName` |
| 2 | Simular un clic con `userEvent` | Ver Tema 1 | Verifica el resultado visible |
| 3 | Configurar MSW para interceptar una llamada | Ver Tema 2 | Sin red real |
| 4 | Probar el flujo completo: formulario + envío + éxito | Ver Tema 2 | Verifica el mensaje final tras la respuesta mockeada |
| 5 | Probar un hook personalizado con `renderHook` | Ver Tema 3 | Con `act` para las actualizaciones |

**Verificación:** el laboratorio se considera exitoso si todas las pruebas consultan el DOM por rol/texto, si ninguna prueba depende de una petición de red real, y si el hook personalizado se prueba de forma aislada sin un componente visual innecesario.

**Errores comunes y soluciones**

- **Consultar por clase CSS en vez de por rol/texto.** Usa `getByRole`/`getByText` para pruebas resilientes a refactors.
- **Olvidar `server.resetHandlers()` entre pruebas.** Sin él, un manejador personalizado de una prueba puede afectar a las siguientes.
- **No envolver actualizaciones de estado del hook en `act`.** Sin `act`, la aserción puede ejecutarse antes de que React procese la actualización.

---

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama
