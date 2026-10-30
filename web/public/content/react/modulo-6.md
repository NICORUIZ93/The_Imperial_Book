# Módulo 6: Data fetching moderno


## Aprende construyendo

### Tema 1: useQuery y el problema que resuelve

#### Paso 1 · Objetivo y preparación
Al finalizar vas a reemplazar el `useState`+`useEffect` de `PanelEnvios` (Módulo 2) por `useQuery`, eliminando el manejo manual de loading/error/cache. Prerrequisitos: Módulo 5 completo.

#### Paso 2 · Contexto y caso real
Hoy, si `PanelEnvios` y `ResumenZona` ambos necesitan la misma lista de envíos, cada uno dispara su propio `fetch` independiente con su propio `useEffect`, duplicando la petición de red para el mismo dato.

#### Paso 3 · Teoría, modelo mental y analogía
`useQuery` reemplaza el patrón manual con una llamada declarativa que cachea bajo una `queryKey`, deduplicando peticiones idénticas simultáneas — un departamento centralizado que consulta al proveedor una sola vez y distribuye la respuesta a quien la pidió.

**Diagrama: TanStack Query cache y deduplicación**

```mermaid
graph TD
    A["PanelEnvios<br/>useQuery['envios', 'norte']"]
    B["ResumenZona<br/>useQuery['envios', 'norte']"]
    
    C["TanStack Query cache: envios/norte"]
    
    D["Network: una peticion"]
    E["Ambos reciben el mismo resultado cacheado"]
    
    A -->|queryKey| C
    B -->|queryKey| C
    
    C -->|primera vez| D
    D -->|almacenar| C
    
    C -->|segunda vez| E
    
    style D fill:#fff3e0
    style E fill:#e8f5e9
```

#### Paso 4 · Demostración guiada desde cero
Ejemplo independiente con React, Vite 8 y TanStack Query 5. Comprueba que tu Node es compatible con Vite y crea el proyecto desde una carpeta vacía:
```bash
npm create vite@8 consulta-envios -- --template react
cd consulta-envios
npm install
npm install @tanstack/react-query@5
```
Crea `public/envios-norte.json` con `[{"id":"ENV-42"}]` y `public/envios-sur.json` con `[{"id":"ENV-99"}]`. Son archivos estáticos servidos por Vite: no necesitas una API no incluida en el ejemplo.

Reemplaza `src/App.jsx` con el archivo completo:
```jsx
import { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const client = new QueryClient(); // Una caché compartida, fuera del render.
function Panel({ zona, titulo }) {
  const query = useQuery({
    queryKey: ['envios', zona],
    staleTime: 60_000,
    retry: false,
    queryFn: async () => {
      const response = await fetch(`/envios-${zona}.json`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
  });
  if (query.isPending) return <p role="status">Cargando {titulo}</p>;
  if (query.isError) return <p role="alert">{query.error.message}</p>;
  return <section><h2>{titulo}</h2>
    <ul>{query.data.map(envio => <li key={envio.id}>{envio.id}</li>)}</ul>
  </section>;
}
export default function App() {
  const [zona, setZona] = useState('norte');
  return <QueryClientProvider client={client}><main>
    <h1>Envíos por zona</h1><label htmlFor="zona">Zona</label>
    <select id="zona" value={zona} onChange={e => setZona(e.target.value)}>
      <option value="norte">Norte</option><option value="sur">Sur</option>
    </select>
    <Panel zona={zona} titulo="Panel de envíos" />
    <Panel zona={zona} titulo="Resumen de zona" />
  </main></QueryClientProvider>;
}
```
```bash
npm run dev
```
Abre la dirección indicada por Vite, normalmente `http://localhost:5173`. **Resultado esperado:** ambos paneles muestran `ENV-42`; al cambiar a sur, ambos muestran `ENV-99`. En Network filtra `envios-`: los dos paneles comparten la consulta de cada zona. `staleTime` evita revalidaciones por obsolescencia durante un minuto; no es una promesa de una única petición durante toda la vida de la aplicación.

Explica cada bloque: QueryClientProvider hace disponible la caché, queryKey identifica los datos, queryFn valida HTTP y los paneles representan carga, error o resultado. El template de Vite no trae un comando `npm test`: aquí la comprobación es explícitamente de navegador. Si borras `public/envios-sur.json`, comprueba el estado de error; algunos servidores dev devuelven HTML con 200 para rutas inexistentes y entonces falla el parseo JSON.

#### Paso 5 · Práctica guiada
Pista: usá `queryKey: ['envios']` (sin incluir `zona`) en ambos componentes, pero seguí pasando `zona` dentro de `queryFn` — ese es el fallo deliberado: cambiar de zona no dispara una nueva petición, porque TanStack Query identifica la query por su `queryKey`, y como esa key no cambió, sigue devolviendo el resultado cacheado de la zona anterior aunque `queryFn` internamente apunte a la zona nueva.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo `zona` a la `queryKey`, y agregá una tercera consulta (`['envios', zona, 'urgentes']`) para los envíos marcados como urgentes de esa misma zona, confirmando que cada combinación distinta de `queryKey` cachea de forma independiente.

#### Paso 7 · Cierre y evidencia
Entregá la deduplicación del Paso 4, la cache desincronizada por `queryKey` incompleta del Paso 5, y la tercera consulta del Paso 6; explicá por qué la `queryKey` debe incluir cualquier variable que afecte qué datos trae `queryFn`, no solo las que "parecen importantes". Siguiente paso: estudia mutations e invalidación. Errores comunes: una `queryKey` que no incluye todas las variables relevantes del `queryFn`, seguir usando `useState`+`useEffect` para datos que ya tiene una query equivalente, y no aprovechar React Query Devtools para inspeccionar el estado real de la cache. Fuentes oficiales: https://tanstack.com/query/latest/docs/framework/react/guides/queries y https://tanstack.com/query/latest/docs/framework/react/guides/query-keys.
**¿Por qué es importante?** `useQuery` elimina el "loading hell" de gestionar manualmente estado de carga/error/cache en cada componente, agregando deduplicación y cache compartida automáticamente.
**Evidencia de aprendizaje:** entrega deduplicación confirmada, cache desincronizada detectada y tercera consulta independiente.
**Conceptos clave:** `queryKey`, deduplicación, refetch automático.

Manejar fetching manualmente con `useState` + `useEffect` (guardar el resultado, un booleano de carga, y un posible error, todo como estados separados sincronizados manualmente en cada componente que necesita datos de una API) es un patrón que se repite virtualmente idéntico en cada componente que consume datos remotos, y que además omite fácilmente casos importantes (deduplicación de peticiones idénticas simultáneas desde distintos componentes, revalidación automática cuando el usuario vuelve a la pestaña tras un tiempo ausente, cancelación de peticiones obsoletas) a menos que se implemente esa lógica adicional manualmente y de forma repetida en cada lugar.

`useQuery({ queryKey: ['tareas'], queryFn: () => fetch('/api/tareas').then(r => r.json()) })` reemplaza todo ese patrón manual con una única llamada declarativa: TanStack Query gestiona automáticamente el estado de `isLoading`, `error` y `data`, cachea el resultado bajo la clave `queryKey` proporcionada (permitiendo que múltiples componentes que usan la misma `queryKey` compartan automáticamente el mismo resultado cacheado sin disparar peticiones duplicadas), revalida automáticamente en segundo plano cuando la ventana del navegador recupera el foco (asumiendo que los datos podrían haber cambiado mientras el usuario estaba en otra pestaña), y deduplica peticiones idénticas simultáneas lanzadas por distintos componentes en el mismo instante, consolidándolas en una única petición de red real.

**Analogía:** manejar fetching manualmente con `useState`/`useEffect` en cada componente es como cada persona de una oficina llamando individualmente al mismo proveedor para pedir la misma información, sin coordinarse entre sí; TanStack Query es como un único departamento centralizado que recibe todas esas solicitudes, consulta al proveedor una única vez cuando es necesario, y distribuye la misma respuesta a quien la solicitó, evitando llamadas redundantes.

**Código del ejemplo:**

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ['tareas'],
  queryFn: () => fetch('/api/tareas').then(r => r.json()),
});
```

* Ejecutar: `npm test`
* Proyecto: proyecto integrador RutaFlow

**Límites y decisión de uso:** La caché de consultas no conoce por sí sola cambios realizados fuera de su cliente. Define claves, caducidad e invalidación, y prueba mutaciones y cambio de identidad para no reutilizar datos privados de otra sesión.

### Tema 2: Mutations e invalidación

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear una mutación que registre un nuevo envío y, al completarse, invalide la query de la lista para que `PanelEnvios` la muestre sin recargar la página. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Después de registrar un envío nuevo con el formulario del Módulo 3, la lista en `PanelEnvios` sigue mostrando los mismos envíos de antes — nadie le avisó a esa query que los datos reales del servidor cambiaron.

#### Paso 3 · Teoría, modelo mental y analogía
`useMutation` ejecuta cambios en el servidor; invalidar la query relacionada tras el éxito marca esos datos como obsoletos y dispara un refetch automático — avisarle al departamento de inventario que recuente, en vez de confiar en una anotación manual.

**Diagrama: Mutations e invalidación**

```mermaid
graph TD
    A["Usuario: Crear envío nuevo"]
    
    B["useMutation ejecuta"]
    C["POST /api/envios<br/>crea en servidor"]
    
    D["onSuccess:<br/>invalidateQueries"]
    E["PanelEnvios<br/>queryKey: ['envios']"]
    
    F["queryClient marca obsoleto"]
    G["Refetch automático<br/>GET /api/envios"]
    
    H["PanelEnvios<br/>muestra nuevo envío"]
    
    A -->|dispara| B
    B -->|ejecuta| C
    C -->|exitoso| D
    D -->|invalida| E
    E -->|dispara| F
    F -->|causa| G
    G -->|resultado| H
    
    style C fill:#fff3e0
    style H fill:#e8f5e9
```

**Evidencia de aprendizaje:** entrega invalidación tras crear, lista desactualizada detectada y doble invalidación confirmada.
**Conceptos clave:** `useMutation`, `invalidateQueries`, sincronización tras un cambio.

`useMutation` gestiona operaciones que modifican datos en el servidor (crear, actualizar, eliminar), a diferencia de `useQuery`, orientado a leer datos: `const crear = useMutation({ mutationFn: (tarea) => fetch('/api/tareas', { method: 'POST', body: JSON.stringify(tarea) }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tareas'] }) })` ejecuta la petición de creación, y al completarse exitosamente, invalida la query de la lista de tareas (marcándola como obsoleta y disparando automáticamente un refetch de esa query), garantizando que la lista mostrada en pantalla refleje el nuevo elemento recién creado sin que el componente que muestra la lista necesite saber explícitamente que ocurrió una creación en otro lugar de la aplicación.

Esta invalidación explícita tras una mutación exitosa es el mecanismo estándar de sincronización entre escrituras y lecturas en TanStack Query: en vez de actualizar manualmente la cache local con el resultado exacto devuelto por la mutación (un enfoque posible pero propenso a desincronizarse sutilmente de lo que el servidor realmente tiene), invalidar y dejar que TanStack Query vuelva a solicitar los datos reales garantiza que la vista siempre refleje el estado verdadero del servidor tras el cambio, al costo de una petición de red adicional para refrescar esa query invalidada.

**Analogía:** invalidar una query tras una mutación es como avisar a un departamento de inventario que se acaba de agregar un producto nuevo, provocando que ese departamento recuente y actualice su registro completo, en vez de simplemente confiar en anotar manualmente el cambio sin verificar que el recuento real coincide.

**¿Por qué es importante?** Invalidar la query relacionada tras una mutación exitosa garantiza que la vista refleje el estado real y actualizado del servidor, sin necesidad de sincronizar manualmente la cache local con el resultado exacto de cada mutación.

**Código del ejemplo:**

```jsx
const queryClient = useQueryClient();
const crear = useMutation({
  mutationFn: (tarea) => fetch('/api/tareas', { method: 'POST', body: JSON.stringify(tarea) }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tareas'] }), // refetch automático
});
```

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow

#### Paso 4 · Demostración guiada desde cero
```jsx
const queryClient = useQueryClient();
const registrar = useMutation({
  mutationFn: (envio) => fetch('/api/envios', { method: 'POST', body: JSON.stringify(envio) }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['envios'] }),
});
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: al llamar `registrar.mutate(nuevoEnvio)` y completarse exitosamente, TanStack Query invalida todas las queries cuya key empiece con `['envios']` (incluyendo `['envios', 'norte']`, `['envios', 'sur']`, etc.) y las refetchea automáticamente — `PanelEnvios` muestra el nuevo envío sin que nadie haya llamado a `setEnvios` manualmente.

#### Paso 5 · Práctica guiada
**Fallo deliberado #1 (olvidar invalidación):**
Quitá el `onSuccess` de la mutación — el envío se crea en el servidor, pero `PanelEnvios` sigue mostrando la lista vieja sin actualizar.

**Fallo deliberado #2 (invalidar queryKey incorrecta):**
Cambiá `invalidateQueries({ queryKey: ['envios'] })` a `invalidateQueries({ queryKey: ['envios', 'norte'] })` — si la lista estaba filtrando por zona "sur", esa query nunca se invalida porque las keys no coinciden exactamente.

**Fallo deliberado #3 (olvidar `await` en cancelación):**
Remové el `await queryClient.cancelQueries(...)` del `onMutate` en un optimistic update — ahora el `getQueryData` obtiene datos desactualizados porque la query aún se estaba refetcheando.
**Pista:** restaurá cada fallo antes de probar el siguiente — el Fallo #1 y el #2 se notan de inmediato en `PanelEnvios`, pero el Fallo #3 solo aparece bajo una carrera real entre el refetch en curso y la cancelación faltante.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando la invalidación, y agregá un segundo `onSuccess` para una mutación de "marcar como entregado" que invalide tanto `['envios']` como una query separada `['estadisticas']` que cuenta entregas del día.

#### Paso 7 · Cierre y evidencia
Entregá la invalidación tras crear del Paso 4, la lista desactualizada provocada en el Paso 5, y la doble invalidación del Paso 6; explicá por qué invalidar y refetchear (en vez de actualizar manualmente la cache con el resultado exacto de la mutación) garantiza que la vista refleje el estado verdadero del servidor. Siguiente paso: estudia optimistic updates para no esperar ese refetch. Errores comunes: olvidar invalidar la query relacionada tras una mutación exitosa, invalidar una `queryKey` demasiado específica que no cubre todas las variantes relacionadas, y actualizar la cache manualmente de forma que puede desincronizarse del servidor real. Fuentes oficiales: https://tanstack.com/query/latest/docs/framework/react/guides/mutations y https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation.
**¿Por qué es importante?** Invalidar la query relacionada tras una mutación exitosa garantiza que la vista refleje el estado real del servidor, sin sincronizar manualmente la cache con el resultado exacto de cada mutación.

### Tema 3: Optimistic updates

#### Paso 1 · Objetivo y preparación
Al finalizar vas a hacer que marcar un envío como "entregado" se refleje instantáneamente en `PanelEnvios`, antes de que el servidor confirme, revirtiendo si la confirmación falla. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Esperar la invalidación + refetch completo del Tema 2 para ver un envío marcado como entregado introduce un retraso visible — el operador toca el botón y, por una fracción de segundo, no ve ningún cambio hasta que la petición de red completa su viaje de ida y vuelta.

#### Paso 3 · Teoría, modelo mental y analogía
Un optimistic update actualiza la cache inmediatamente con el resultado esperado, antes de la confirmación del servidor; si la mutación falla, se revierte al estado anterior guardado — marcar una tarea como completada en papel, confiando en que el sistema central lo registrará, y tachar de nuevo si falla.

**Evidencia de aprendizaje:** entrega optimistic update funcionando, sobrescritura por refetch detectada y notificación de reversión agregada.
**Conceptos clave:** actualizar la UI antes de la confirmación del servidor, revertir ante error.

Un optimistic update actualiza la interfaz inmediatamente con el resultado esperado de una mutación, antes incluso de que el servidor confirme que esa operación efectivamente se completó exitosamente, mejorando la percepción de velocidad de la aplicación para el usuario (que ve el cambio reflejado instantáneamente, sin esperar el viaje de ida y vuelta completo de la petición de red); si la petición finalmente falla, la actualización optimista se revierte, devolviendo la interfaz al estado anterior consistente con lo que el servidor realmente tiene.

`onMutate` se ejecuta inmediatamente al iniciar la mutación (antes de que la petición de red siquiera complete): cancela cualquier refetch en curso de esa query (`cancelQueries`, para evitar que una respuesta tardía sobreescriba la actualización optimista recién aplicada), guarda una copia del estado anterior (`getQueryData`, necesaria para poder revertir si la mutación falla), y aplica el cambio optimista directamente sobre la cache (`setQueryData`); `onError` usa esa copia guardada para revertir la cache exactamente al estado anterior si la mutación efectivamente falla, evitando que la interfaz quede mostrando un cambio que en realidad nunca se aplicó en el servidor.

Este patrón introduce un riesgo inherente: durante la ventana de tiempo entre la actualización optimista y la confirmación real del servidor, la interfaz muestra un estado que todavía no es definitivamente cierto, pudiendo requerir revertirse visualmente si la operación finalmente falla, una experiencia que, aunque generalmente rara si las mutaciones fallan poco frecuentemente, debe comunicarse con cuidado (por ejemplo, con una notificación clara al revertir) para no confundir al usuario sobre qué efectivamente ocurrió.

**Analogía:** un optimistic update es como marcar una tarea como completada en una lista física inmediatamente al terminarla, confiando en que se registrará correctamente en el sistema central más tarde; si luego se descubre que el registro central falló, hay que tachar de nuevo esa marca prematura y notificar que en realidad no se completó.

**¿Por qué es importante?** Los optimistic updates mejoran la percepción de velocidad al reflejar cambios instantáneamente, a costa del riesgo de tener que revertir visualmente la interfaz si la operación finalmente falla en el servidor.

**Código del ejemplo:**

```jsx
useMutation({
  mutationFn: actualizarTarea,
  onMutate: async (nuevaTarea) => {
    await queryClient.cancelQueries({ queryKey: ['tareas'] });
    const anterior = queryClient.getQueryData(['tareas']);
    queryClient.setQueryData(['tareas'], (old) => actualizarEnLista(old, nuevaTarea)); // UI optimista
    return { anterior };
  },
  onError: (err, vars, contexto) => queryClient.setQueryData(['tareas'], contexto.anterior), // revierte si falla
});
```

#### Paso 8 · Diseño y decisiones de arquitectura
**Cuándo NO usar optimistic updates:** si la mutación tiene alta probabilidad de fallar (pagos con validación de fondos en tiempo real) o si revertir visualmente confunde más de lo que ayuda (operaciones irreversibles como "eliminar cuenta"), conviene esperar la confirmación del servidor aunque introduzca latencia perceptible — el trade-off es velocidad percibida frente al riesgo de mostrar temporalmente un estado que resulta falso.

En el proyecto integrador RutaFlow (`examples/rutaflow/react/dashboard/src/hooks/useMarcarEntregado.ts`), este patrón se aplica al botón "Marcar entregado": como la probabilidad de rechazo del servidor es baja, el optimistic update mejora la experiencia del operador sin generar reversiones frecuentes y confusas.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant C as Cache (React Query)
    participant S as Servidor
    U->>C: onMutate actualiza cache optimista
    C-->>U: UI refleja cambio instantáneo
    C->>S: mutationFn envía petición real
    alt Servidor confirma
        S-->>C: éxito
        C-->>U: estado final confirmado
    else Servidor rechaza
        S-->>C: error
        C->>C: onError revierte a "anterior"
        C-->>U: UI vuelve al estado previo + notificación
    end
```

Ejercicio: ejecutá el test de este hook y confirmá que la reversión funciona:
```bash
npm test -- --testPathPattern=useMarcarEntregado
```
Resultado esperado: el test simula un fallo del servidor y verifica que `queryClient.getQueryData(['envios'])` vuelve exactamente al valor de `anterior` tras ejecutarse `onError`.

---

#### Paso 4 · Demostración guiada desde cero
```jsx
useMutation({
  mutationFn: marcarEntregado,
  onMutate: async (envioId) => {
    await queryClient.cancelQueries({ queryKey: ['envios'] });
    const anterior = queryClient.getQueryData(['envios']);
    queryClient.setQueryData(['envios'], old => old.map(e => e.id === envioId ? { ...e, estado: 'entregado' } : e));
    return { anterior };
  },
  onError: (err, envioId, contexto) => queryClient.setQueryData(['envios'], contexto.anterior),
});
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: tocar "Marcar entregado" cambia visualmente el estado del envío en la lista de forma instantánea, sin esperar ninguna respuesta de red; si la mutación falla (el servidor rechaza porque ese envío ya fue entregado por otro operador), la lista vuelve exactamente al estado anterior guardado en `anterior`.

#### Paso 5 · Práctica guiada
Pista: quitá `await queryClient.cancelQueries({ queryKey: ['envios'] })` del `onMutate` — ese es el fallo deliberado: si un refetch en segundo plano de `['envios']` estaba en vuelo y completa después del `setQueryData` optimista, esa respuesta vieja sobrescribe el cambio optimista, haciendo que el envío "vuelva" a verse como no entregado por un instante confuso.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `cancelQueries`, y agregá una notificación visual explícita ("no se pudo confirmar, se revirtió el cambio") dentro de `onError`, para que el operador entienda por qué el envío volvió a su estado anterior.

#### Paso 7 · Cierre y evidencia
Entregá el optimistic update del Paso 4, la sobrescritura por refetch en vuelo provocada en el Paso 5, y la notificación de reversión del Paso 6; explicá por qué `cancelQueries` es necesario específicamente para evitar que una respuesta tardía de un refetch anterior pise la actualización optimista recién aplicada. Siguiente paso: cerrá el módulo integrando query, mutation y optimistic update en el flujo completo de confirmación de entrega. Errores comunes: no cancelar queries en curso en `onMutate`, no implementar `onError` para revertir, y no comunicar visualmente al usuario cuando un cambio optimista se revierte. Fuentes oficiales: https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates.
**¿Por qué es importante?** Los optimistic updates mejoran la percepción de velocidad al reflejar cambios instantáneamente, a costa del riesgo de tener que revertir visualmente la interfaz si la operación finalmente falla.

## Laboratorio práctico

**Objetivo del laboratorio:** reemplazar fetching manual por TanStack Query, con mutaciones e optimistic updates.

**Requisitos previos:** Módulos 0-5 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Reemplazar `useEffect`+`useState` por `useQuery` | Ver Tema 1 | Verifica la cache con React Query Devtools |
| 2 | Implementar una mutación de creación | Ver Tema 2 | Invalida la query de la lista al completarse |
| 3 | Implementar un optimistic update | Ver Tema 3 | Con reversión ante error simulado |
| 4 | Observar el estado "obsoleto" (stale) | React Query Devtools | Explica cuándo una query se considera obsoleta |

**Verificación:** el laboratorio se considera exitoso si la lista se actualiza automáticamente tras crear un elemento (sin refrescar la página manualmente), y si el optimistic update revierte correctamente la interfaz ante un error simulado en la mutación.

**Errores comunes y soluciones**

- **Olvidar invalidar la query relacionada tras una mutación.** Sin invalidación, la lista mostrada puede quedar desactualizada respecto al servidor.
- **No cancelar queries en curso en `onMutate`.** Una respuesta tardía de un refetch anterior podría sobreescribir la actualización optimista.
- **No implementar `onError` para revertir.** Sin reversión, la interfaz puede mostrar un cambio que en realidad nunca se aplicó en el servidor.

---

* Ejecutar: `npm test`
* Código: `examples/rutaflow/react/use-shipment-tracking.tsx`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama
