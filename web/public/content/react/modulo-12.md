# Módulo 12: Proyecto integrador — SPA con datos reales


## Aprende construyendo

### Tema 1: Estructura del proyecto integrador

#### Paso 1 · Objetivo y preparación
Al finalizar vas a organizar el proyecto integrador de RutaFlow en `features/envios/` y `features/auth/`, separando ambos del store de Zustand reservado solo para UI. Prerrequisitos: módulos 0-11 completos.

#### Paso 2 · Contexto y caso real
A lo largo del track construiste piezas sueltas (componentes, rutas, queries, store) en módulos distintos — nadie confirmó todavía que organizarlas en un único proyecto real no termina mezclando responsabilidades que deberían permanecer separadas.

#### Paso 3 · Teoría, modelo mental y analogía
Organizar por feature agrupa cada dominio (envíos, autenticación) con sus propios componentes y hooks; el estado de UI pura vive en un store separado, sin mezclarse con datos de servidor.

**Diagrama: Arquitectura por features**

```mermaid
graph TD
    A["src/"]
    
    B["features/<br/>envios/"]
    C["Componentes<br/>Hooks especializados<br/>Types"]
    
    D["features/<br/>auth/"]
    E["Componentes<br/>Hooks login/logout<br/>Types"]
    
    F["stores/<br/>UI store"]
    G["Solo UI:<br/>sidebarAbierto<br/>thema"]
    
    H["queries/<br/>TanStack Query"]
    I["Datos de servidor<br/>Cachés"]
    
    A --> B
    B --> C
    A --> D
    D --> E
    A --> F
    F --> G
    A --> H
    H --> I
    
    style B fill:#e8f5e9
    style D fill:#e8f5e9
    style F fill:#2196f3
    style H fill:#4caf50
```

#### Paso 4 · Demostración guiada desde cero
```text
src/
  features/
    envios/
      ListaEnvios.tsx
      useEnvios.ts        ← hook con TanStack Query
    auth/
      RutaProtegida.tsx
      useAuth.ts
  store/
    uiStore.ts             ← Zustand, solo estado de cliente
  router.tsx
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: recorriendo el código fuente carpeta por carpeta, ningún archivo de `features/envios/` importa nada de `features/auth/` directamente (ambos se comunican solo a través de `RutaProtegida`), y `uiStore.ts` no contiene ningún dato que provenga de una API.

#### Paso 5 · Práctica guiada
Pista: agregá temporalmente el estado de "sesión activa" (que viene de `useAuth`) dentro de `uiStore.ts` de Zustand, "para tenerlo centralizado" — ese es el fallo deliberado: ahora existen dos fuentes para saber si hay sesión activa (el store de Zustand y el propio `useAuth`), y pueden desincronizarse si alguna actualiza sin que la otra se entere.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 quitando el estado de sesión de `uiStore.ts`, dejando que `useAuth` sea la única fuente, y revisá el resto del proyecto buscando otras violaciones similares de la separación por feature.

#### Paso 7 · Cierre y evidencia
Entregá la estructura organizada por feature del Paso 4, la duplicación de fuente de verdad provocada en el Paso 5, y la revisión del Paso 6; explicá por qué integrar todos los módulos del track en un solo proyecto expone violaciones de organización que un módulo aislado nunca mostraría. Siguiente paso: integra rutas, TanStack Query y Zustand coordinadamente. Errores comunes: mezclar features sin un punto de integración explícito, duplicar en un store de UI un dato que ya tiene una fuente de verdad propia, y organizar carpetas por tipo de archivo en vez de por dominio. Fuentes oficiales: https://react.dev/learn/thinking-in-react y https://tanstack.com/query/latest/docs/framework/react/overview.
**¿Por qué es importante?** Separar features por dominio, y aislar el estado de UI puro en un store dedicado sin mezclarlo con datos de servidor, mantiene el proyecto comprensible y evita complicaciones de mezclar estados con ciclos de vida distintos.
**Evidencia de aprendizaje:** entrega estructura por feature, duplicación de fuente de verdad detectada y revisión completa confirmada.
**Conceptos clave:** organización por feature, separación entre `features/` y `store/`.

Siguiendo el principio de organización por feature (el mismo criterio aplicado en el proyecto integrador de Angular, Módulo 13 del track de Angular), el proyecto se estructura en `features/tareas/` (con `ListaTareas.tsx` para la vista y `useTareas.ts` como hook dedicado que encapsula el acceso a datos con TanStack Query) y `features/auth/` (con `RutaProtegida.tsx` y `useAuth.ts`), manteniendo separadas las responsabilidades de dominio de gestión de tareas y de autenticación, comunicándose entre sí únicamente a través de puntos de integración explícitos, exactamente el mismo criterio de cohesión estudiado en profundidad en el Módulo 8 del track de Angular.

`store/uiStore.ts`, un store de Zustand (Módulo 7) reservado exclusivamente para estado de interfaz puro (por ejemplo, si la barra lateral está abierta o cerrada), vive deliberadamente separado de la lógica de datos de cada feature, reflejando la separación estudiada en el Módulo 7 entre estado de servidor (que pertenece a los hooks de TanStack Query dentro de cada feature) y estado de cliente puro (que pertenece a este store dedicado, sin mezclarse con datos de red).

**Analogía:** la estructura del proyecto integrador es como una empresa con departamentos claramente delimitados por función (tareas, autenticación) más una oficina central separada que gestiona únicamente aspectos generales de la instalación (como si las luces de cierta sección están encendidas), sin que esa oficina central se entrometa en la lógica de negocio específica de cada departamento.

**Diagrama:**

```
src/
  features/
    tareas/
      ListaTareas.tsx
      useTareas.ts        ← hook con TanStack Query
    auth/
      RutaProtegida.tsx
      useAuth.ts
  store/
    uiStore.ts             ← Zustand, solo estado de cliente
  router.tsx
```

* Ejecutar: `npm test`

**Límites y decisión de uso:** Organizar por funcionalidades no exige duplicar cada componente compartido ni crear una capa para cada carpeta. Mueve piezas según responsabilidades y cambios conjuntos, manteniendo las pruebas que permiten reorganizar sin alterar comportamiento.

### Tema 2: Integrando rutas, TanStack Query y Zustand

#### Paso 1 · Objetivo y preparación
Al finalizar vas a proteger las rutas de `features/envios/` con `RutaProtegida` (que usa `useAuth`), mientras `useEnvios` (Tema 3) gestiona su propio ciclo de cache sin ninguna interferencia del store de Zustand. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Un conductor sin sesión activa no debería poder ver `/envios` en absoluto — pero nadie confirmó todavía que la protección de ruta y la consulta de datos no interfieren entre sí de alguna forma inesperada.

#### Paso 3 · Teoría, modelo mental y analogía
`RutaProtegida` verifica la sesión antes de permitir el acceso; `useEnvios` encapsula el acceso a datos; el store de Zustand se mantiene exclusivamente para estado de UI — tres piezas independientes coordinadas a través de puntos de integración explícitos.
**Conceptos clave:** rutas protegidas con layout, estado de servidor centralizado en un hook dedicado.

`RutaProtegida` (Módulo 5) envuelve las rutas de la feature de tareas, verificando la sesión activa mediante `useAuth` antes de permitir el acceso, redirigiendo a `/login` en caso contrario; el layout compartido de esas rutas (con la navegación común) se define una única vez en la configuración de rutas anidadas, evitando duplicarlo en cada vista individual de la feature de tareas.

`useTareas()` (Tema 3) encapsula completamente el acceso a datos de tareas detrás de un hook dedicado de la feature, de modo que los componentes de vista (`ListaTareas.tsx`) simplemente invocan ese hook sin necesidad de conocer los detalles de `queryKey`, `queryFn`, ni la configuración específica de TanStack Query subyacente, un nivel de abstracción que hace que la lógica de acceso a datos sea reemplazable o modificable (por ejemplo, cambiando el endpoint real consultado) sin tocar el código de los componentes de vista que simplemente consumen el resultado del hook.

El store de Zustand (`uiStore.ts`) se consume únicamente para estado de interfaz pura, como si la barra lateral está abierta, completamente desacoplado de `useTareas`, que gestiona su propio ciclo de cache, invalidación y refetch de forma independiente mediante TanStack Query, sin ninguna interferencia entre ambos sistemas de estado.

**Analogía:** integrar estas piezas es como coordinar la entrada de seguridad de un edificio (la ruta protegida), un departamento de datos centralizado que sabe cómo consultar y actualizar información real (el hook `useTareas`), y un panel de control de instalaciones generales completamente separado (el store de Zustand para UI), cada uno operando de forma independiente pero coordinada a través de puntos de integración claros.

**¿Por qué es importante?** Encapsular el acceso a datos detrás de un hook dedicado por feature hace que la lógica de datos sea reemplazable sin afectar los componentes de vista; mantener el estado de UI completamente separado del estado de servidor evita interferencias entre ambos sistemas.

**Diagrama:**

```
RutaProtegida (useAuth) → protege las rutas de tareas con layout compartido
ListaTareas.tsx → consume useTareas() → TanStack Query gestiona cache/invalidación
uiStore.ts (Zustand) → solo estado de UI pura, desacoplado de useTareas
```

* Ejecutar: `npm test`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

#### Paso 4 · Demostración guiada desde cero
```tsx
<Route path="/envios" element={
  <RutaProtegida><LayoutEnvios /></RutaProtegida>
}>
  <Route index element={<ListaEnvios />} />
</Route>

function ListaEnvios() {
  const { data: envios } = useEnvios(); // TanStack Query, independiente de RutaProtegida
  const sidebarAbierta = useUiStore(s => s.sidebarAbierta); // Zustand, solo UI
  return /* ... */;
}
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: un conductor sin sesión es redirigido a `/login` antes de que `ListaEnvios` llegue a montarse, por lo que `useEnvios()` nunca dispara ninguna petición de red para un usuario no autenticado.

#### Paso 5 · Práctica guiada
Pista: movés la llamada a `useEnvios()` a un componente por encima de `RutaProtegida` en el árbol (por ejemplo, el layout raíz de la app) "para cargar los datos más temprano" — ese es el fallo deliberado: ahora `useEnvios()` dispara su petición antes de que `RutaProtegida` verifique la sesión, consultando `/api/envios` incluso para un conductor sin sesión activa.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo `useEnvios()` dentro de `ListaEnvios` (bajo `RutaProtegida`), y confirmá con la pestaña Network que ningún conductor sin sesión dispara esa petición.

**Evidencia de aprendizaje:** entrega integración ordenada, petición indebida detectada y corrección confirmada en Network.

#### Paso 7 · Cierre y evidencia
Entregá la integración correctamente ordenada del Paso 4, la petición indebida provocada en el Paso 5, y la corrección confirmada del Paso 6; explicá por qué el orden en el árbol de componentes determina cuándo efectivamente se dispara una consulta de datos. Siguiente paso: estudia useEnvios en profundidad. Errores comunes: disparar consultas de datos sensibles antes de verificar autenticación, mezclar el store de Zustand con lógica de autenticación que ya tiene su propia fuente en `useAuth`, y duplicar el layout de rutas protegidas en cada vista individual. Fuentes oficiales: https://reactrouter.com/start/framework/routing y https://tanstack.com/query/latest/docs/framework/react/overview.
**¿Por qué es importante?** El orden de envoltura en el árbol de componentes determina si una consulta de datos se dispara antes o después de verificar autenticación, con implicancias reales de seguridad y de tráfico de red innecesario.

### Tema 3: useTareas — hook dedicado con TanStack Query

#### Paso 1 · Objetivo y preparación
Al finalizar vas a encapsular `useQuery` detrás de `useEnvios()`, de forma que ningún componente de la feature necesite conocer la `queryKey` ni la `queryFn` reales. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Si tres componentes distintos (`ListaEnvios`, `ResumenZona`, `ContadorPendientes`) invocaran `useQuery` directamente cada uno con su propia `queryKey` escrita a mano, un simple typo en uno de ellos (`['envio']` en vez de `['envios']`) rompería silenciosamente la deduplicación entre los tres.

#### Paso 3 · Teoría, modelo mental y analogía
Encapsular `queryKey`/`queryFn` detrás de un hook con nombre significativo centraliza los detalles de acceso a datos en un único lugar — un mostrador de atención específico, sin que quien consulta necesite saber cómo se obtiene la información.

#### Paso 4 · Demostración guiada desde cero
```tsx
function useEnvios() {
  return useQuery<Envio[]>({
    queryKey: ['envios'],
    queryFn: () => fetch('/api/envios').then(r => r.json()),
  });
}
```

**Ejecuta el ejemplo** (monta un proyecto React con Vite desde cero, pega el componente en `src/App.jsx` y arráncalo):

```bash
npm create vite@latest demo-react -- --template react
cd demo-react && npm install
npm run dev
```
Abre http://localhost:5173 para ver el resultado; corre las pruebas con `npm test`.

Resultado esperado: `ListaEnvios`, `ResumenZona` y `ContadorPendientes` llaman los tres a `useEnvios()` sin que ninguno escriba `queryKey` ni `queryFn` directamente — los tres comparten automáticamente la misma cache, sin riesgo de un typo que rompa la deduplicación entre ellos.

#### Paso 5 · Práctica guiada
Pista: agregá un cuarto componente que, "para un caso puntual", invoque `useQuery` directamente con `queryKey: ['envio']` (singular, un typo) en vez de usar `useEnvios()` — ese es el fallo deliberado: ese componente mantiene su propia cache separada y desincronizada del resto, disparando una petición de red adicional redundante que los otros tres ya tenían cacheada bajo la key correcta.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo ese cuarto componente a `useEnvios()`, y agregá un `useCrearEnvio()` complementario que envuelva `useMutation` con su propia invalidación de `['envios']` configurada.

#### Paso 7 · Cierre y evidencia
Entregá `useEnvios()` compartido por tres componentes del Paso 4, la cache duplicada por typo del Paso 5, y `useCrearEnvio()` del Paso 6; explicá por qué encapsular el acceso a datos detrás de un hook con nombre significativo previene exactamente la clase de error que ocurrió en el Paso 5. Siguiente paso: cerrá el track con el laboratorio integrador completo. Errores comunes: invocar `useQuery` directamente en vez de a través de un hook dedicado, escribir la misma `queryKey` a mano en múltiples lugares, y no extender la misma capa de hooks a las mutaciones relacionadas. Fuentes oficiales: https://tanstack.com/query/latest/docs/framework/react/guides/query-keys y https://react.dev/learn/reusing-logic-with-custom-hooks.

**Diagrama:**

```mermaid
graph TD
    A["Patrón correcto<br/>useEnvios encapsulado"]
    B["Componente 1<br/>useEnvios"]
    C["Componente 2<br/>useEnvios"]
    D["Componente 3<br/>useEnvios"]
    E["Cache unificada<br/>queryKey: envios"]
    
    A --> B
    A --> C
    A --> D
    B -->|comparte| E
    C -->|comparte| E
    D -->|comparte| E
    
    F["Patrón incorrecto<br/>useQuery directo"]
    G["Componente typo<br/>queryKey: envio"]
    H["Cache duplicada<br/>disparada redundante"]
    
    F --> G
    G -->|crea| H
    
    style E fill:#e8f5e9
    style H fill:#ffebee
```

* Ejecutar: `npm test -- --testNamePattern="custom.hook|query.*key"`
* Código: `src/hooks/useTareas.tsx`
* Proyecto: proyecto integrador RutaFlow
* Cuándo: encapsular `useQuery` siempre cuando múltiples componentes lo usen; no conviene si es usado una única vez en un componente aislado (entonces usa `useQuery` directamente).

**¿Por qué es importante?** Encapsular `queryKey`/`queryFn` detrás de un hook con nombre significativo centraliza los detalles de acceso a datos, facilitando cambios futuros y evitando inconsistencias entre componentes.
**Evidencia de aprendizaje:** entrega useEnvios compartido, cache duplicada por typo detectada y useCrearEnvio agregado.

## Laboratorio práctico

**Objetivo del laboratorio:** construir la SPA integradora completa con rutas protegidas, TanStack Query, Zustand para UI, y tests del flujo crítico.

**Requisitos previos:** Módulos 0-11 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Organizar el proyecto por features | Ver Tema 1 | `tareas/`, `auth/` separados |
| 2 | Implementar rutas protegidas con layout | Ver Tema 2 | `RutaProtegida` + layout compartido |
| 3 | Conectar TanStack Query con `useTareas` | Ver Tema 3 | Queries y mutations encapsuladas |
| 4 | Agregar `uiStore` de Zustand solo para UI | Ver Tema 1 | Separado del estado de servidor |
| 5 | Escribir tests del flujo crítico | Módulo 8 | Testing Library + MSW |

**Verificación:** el laboratorio (y el track completo) se considera exitoso si la aplicación protege correctamente las rutas de tareas, si el estado de servidor y de UI permanecen completamente separados, y si los tests del flujo crítico pasan de forma determinista sin depender de red real.

**Errores comunes y soluciones**

- **Invocar `useQuery` directamente en cada componente en vez de encapsularlo en un hook dedicado.** Centraliza el acceso a datos en hooks como `useTareas`.
- **Mezclar estado de UI y de servidor en el mismo store.** Mantén `uiStore` exclusivamente para estado de interfaz pura.
- **Omitir tests del flujo crítico.** Prioriza probar el camino principal completo (login → ver tareas → crear tarea) sobre casos secundarios.

---

* Ejecutar: `npm test`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama
