# Módulo 12: Proyecto integrador — SPA sin framework


## Aprende construyendo


### Tema 1: Routing manual con History API · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás resolver rutas estáticas y con parámetro, navegar sin recarga, responder a atrás/adelante y respetar enlaces modificados. Construirás el router accesible de la SPA del proyecto.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás resolver rutas estáticas y con parámetro, navegar sin recarga, responder a atrás/adelante y respetar enlaces modificados.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en routing manual con history api como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que routing manual con history api resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Routing manual con History API se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Routing manual con History API | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses routing manual con history api por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: routing manual con history api funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Routing manual con History API existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve routing manual con history api en tu contexto?
2. ¿Cómo sabrías que routing manual con history api no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar routing manual con history api?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-history-router
cd ejemplo-history-router
npm init -y
npm install -D vitest vite
npm pkg set scripts.test="vitest run" scripts.dev="vite" scripts.build="vite build" scripts.preview="vite preview"
mkdir src
```

```js
export function resolverRuta(pathname) {
  if (pathname === "/") return { vista: "inicio", parametros: {} };
  if (pathname === "/guias") return { vista: "guias", parametros: {} };
  const detalle = pathname.match(/^\/guias\/([^/]+)$/);
  if (detalle) return { vista: "detalle", parametros: { numero: decodeURIComponent(detalle[1]) } };
  return { vista: "no-encontrada", parametros: {} };
}

export function crearRouter({ renderizar }) {
  const renderActual = () => renderizar(resolverRuta(location.pathname));
  const navegar = (ruta) => { history.pushState({}, "", ruta); renderActual(); };
  const alClick = (evento) => {
    const enlace = evento.target.closest("a[data-link]");
    if (!enlace || evento.defaultPrevented || evento.button !== 0 ||
        evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    evento.preventDefault();
    navegar(enlace.pathname);
  };
  addEventListener("popstate", renderActual);
  document.addEventListener("click", alClick);
  return { navegar, iniciar: renderActual, destroy: () => {
    removeEventListener("popstate", renderActual);
    document.removeEventListener("click", alClick);
  } };
}
```

```js
import { describe, it, expect } from "vitest";
import { resolverRuta } from "./router.js";

describe("resolverRuta", () => {
  it("resuelve las rutas estáticas", () => {
    expect(resolverRuta("/").vista).toBe("inicio");
    expect(resolverRuta("/guias").vista).toBe("guias");
  });

  it("extrae y decodifica el número del detalle", () => {
    expect(resolverRuta("/guias/RF%2D101")).toEqual({
      vista: "detalle",
      parametros: { numero: "RF-101" },
    });
  });

  it("devuelve no-encontrada ante una ruta desconocida", () => {
    expect(resolverRuta("/otra").vista).toBe("no-encontrada");
  });
});
```

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>Guías</title>
  </head>
  <body>
    <nav>
      <a href="/" data-link>Inicio</a>
      <a href="/guias" data-link>Guías</a>
      <a href="/guias/RF-101" data-link>RF-101</a>
    </nav>
    <main id="app"></main>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

```js
import { crearRouter } from "./router.js";

const raiz = document.querySelector("#app");
const router = crearRouter({
  renderizar: ({ vista, parametros }) => {
    raiz.textContent = vista === "detalle" ? `Detalle de ${parametros.numero}` : `Vista: ${vista}`;
  },
});
router.iniciar();
```

```bash
npm test -- src/router.test.js
npm run dev
```

</details>

### Tema 2: Estado de aplicación con un store propio · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás crear un store con lectura, actualización funcional, suscripción y cleanup, verificando inmutabilidad y orden de notificación. Centralizarás filtro y carga de guías del proyecto.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás crear un store con lectura, actualización funcional, suscripción y cleanup, verificando inmutabilidad y orden de notificación.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en estado de aplicación con un store propio como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant A as Acción
    participant S as Store
    participant V as Vista
    V->>S: subscribe(render)
    A->>S: setState(cambio)
    S-->>V: estado nuevo
    V->>S: unsubscribe() al destruirse
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Estado de aplicación con un store propio se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Estado de aplicación con un store propio | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses estado de aplicación con un store propio por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: estado de aplicación con un store propio funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Estado de aplicación con un store propio existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve estado de aplicación con un store propio en tu contexto?
2. ¿Cómo sabrías que estado de aplicación con un store propio no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar estado de aplicación con un store propio?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-store
cd ejemplo-store
npm init -y
npm install -D vitest
npm pkg set scripts.test="vitest run"
mkdir src test
```

```js
export function crearStore(estadoInicial) {
  let estado = estadoInicial;
  const listeners = new Set();
  return {
    getState: () => estado,
    setState: (actualizacion) => {
      const parcial = typeof actualizacion === "function"
        ? actualizacion(estado)
        : actualizacion;
      // Crea referencia nueva para que cambios sean observables y predecibles.
      estado = Object.freeze({ ...estado, ...parcial });
      listeners.forEach((listener) => listener(estado));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
```

```mermaid
sequenceDiagram
    participant A as Acción
    participant S as Store
    participant V as Vista
    V->>S: subscribe(render)
    A->>S: setState(cambio)
    S-->>V: estado nuevo
    V->>S: unsubscribe() al destruirse
```

```js
import { describe, it, expect, vi } from "vitest";
import { crearStore } from "../src/store.js";

describe("crearStore", () => {
  it("notifica, crea una referencia nueva y respeta la desuscripción", () => {
    const store = crearStore({ filtro: "TODAS" });
    const cabecera = vi.fn();
    const lista = vi.fn();
    store.subscribe(cabecera);
    const desuscribirLista = store.subscribe(lista);
    const anterior = store.getState();

    store.setState({ filtro: "EN_RUTA" });
    expect(cabecera).toHaveBeenCalledTimes(1);
    expect(lista).toHaveBeenCalledTimes(1);
    expect(store.getState()).not.toBe(anterior);

    desuscribirLista();
    store.setState((estado) => ({ filtro: `${estado.filtro}-URGENTE` }));
    expect(cabecera).toHaveBeenCalledTimes(2);
    expect(lista).toHaveBeenCalledTimes(1);
    expect(store.getState().filtro).toBe("EN_RUTA-URGENTE");
  });
});
```

```bash
npm test -- test/store.test.js
```

</details>

### Tema 3: Consumo de una API real con manejo de errores · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás modelar una operación remota como estados mutuamente excluyentes, validar JSON y cancelar al abandonar la vista. Conectarás el cliente de guías del proyecto al store sin dejar pantallas ambiguas.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás modelar una operación remota como estados mutuamente excluyentes, validar JSON y cancelar al abandonar la vista.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en consumo de una api real con manejo de errores como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que consumo de una api real con manejo de errores resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Consumo de una API real con manejo de errores se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Consumo de una API real con manejo de errores | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses consumo de una api real con manejo de errores por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: consumo de una api real con manejo de errores funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Consumo de una API real con manejo de errores existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve consumo de una api real con manejo de errores en tu contexto?
2. ¿Cómo sabrías que consumo de una api real con manejo de errores no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar consumo de una api real con manejo de errores?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-api-client
cd ejemplo-api-client
npm init -y
npm install -D vitest
npm pkg set scripts.test="vitest run"
mkdir src test
```

```js
export function parsearGuia(valor) {
  if (typeof valor?.numero !== "string" || typeof valor?.estado !== "string") {
    throw new TypeError("Guía inválida");
  }
  return { numero: valor.numero, estado: valor.estado };
}
```

```js
import { parsearGuia } from "./parsear-guia.js";

export async function cargarGuias(store, { fetchImpl = fetch, signal } = {}) {
  store.setState({ remoto: { tipo: "loading" } });
  try {
    const respuesta = await fetchImpl("/api/guias.json", { signal });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const json = await respuesta.json();
    if (!Array.isArray(json)) throw new TypeError("Respuesta de guías inválida");
    // parsearGuia valida cada frontera antes de entrar al dominio.
    const guias = json.map(parsearGuia);
    store.setState({ remoto: { tipo: "success", guias } });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    console.error("Carga de guías", error);
    store.setState({ remoto: {
      tipo: "error",
      mensaje: "No pudimos cargar las entregas. Intenta de nuevo.",
    } });
  }
}
```

```js
import { describe, it, expect, vi } from "vitest";
import { cargarGuias } from "../src/cargar.js";

function crearStoreFalso() {
  const tipos = [];
  return { tipos, setState: (cambio) => tipos.push(cambio.remoto.tipo) };
}

const responder = (status, cuerpo) => async () =>
  new Response(JSON.stringify(cuerpo), { status });

describe("cargarGuias", () => {
  it("pasa de loading a success con datos válidos", async () => {
    const store = crearStoreFalso();
    await cargarGuias(store, { fetchImpl: responder(200, [{ numero: "RF-101", estado: "EN_RUTA" }]) });
    expect(store.tipos).toEqual(["loading", "success"]);
  });

  it("trata un HTTP 500 como error aunque el cuerpo sea JSON", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const store = crearStoreFalso();
    await cargarGuias(store, { fetchImpl: responder(500, []) });
    expect(store.tipos).toEqual(["loading", "error"]);
  });

  it("trata un JSON con forma inválida como error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const store = crearStoreFalso();
    await cargarGuias(store, { fetchImpl: responder(200, { guias: [] }) });
    expect(store.tipos).toEqual(["loading", "error"]);
  });
});
```

```bash
npm test -- test/cargar.test.js
```

</details>

### Tema 4: Conectando todo — el patrón completo de una SPA · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás ensamblar dependencias en un composition root, montar una vista por ruta y ejecutar su destroy antes de cambiar. Entregarás una SPA funcional en desarrollo y producción.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás ensamblar dependencias en un composition root, montar una vista por ruta y ejecutar su destroy antes de cambiar.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en conectando todo — el patrón completo de una spa como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    ROUTER["URL y router"] --> VIEW["vista activa"] --> ACTION["acción del usuario"] --> API["caso de uso / API"] --> STORE["store inmutable"] --> VIEW
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Conectando todo — el patrón completo de una SPA se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Conectando todo — el patrón completo de una SPA | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses conectando todo — el patrón completo de una spa por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: conectando todo — el patrón completo de una spa funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Conectando todo — el patrón completo de una SPA existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve conectando todo — el patrón completo de una spa en tu contexto?
2. ¿Cómo sabrías que conectando todo — el patrón completo de una spa no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar conectando todo — el patrón completo de una spa?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    ROUTER["URL y router"] --> VIEW["vista activa"] --> ACTION["acción del usuario"] --> API["caso de uso / API"] --> STORE["store inmutable"] --> VIEW
```

```bash
mkdir ejemplo-spa-completa
cd ejemplo-spa-completa
npm init -y
npm install -D vite
npm pkg set scripts.dev="vite" scripts.build="vite build" scripts.preview="vite preview"
mkdir -p src/router src/estado src/api src/vistas public/api
cp ../ejemplo-history-router/src/router.js src/router/router.js
cp ../ejemplo-store/src/store.js src/estado/store.js
cp ../ejemplo-api-client/src/cargar.js src/api/cargar.js
cp ../ejemplo-api-client/src/parsear-guia.js src/api/parsear-guia.js
```

```json
[
  { "numero": "RF-101", "estado": "EN_RUTA" },
  { "numero": "RF-102", "estado": "ENTREGADA" }
]
```

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>SPA de guías</title>
  </head>
  <body>
    <nav>
      <a href="/" data-link>Inicio</a>
      <a href="/guias" data-link>Guías</a>
      <a href="/no-existe" data-link>Ruta rota</a>
    </nav>
    <main id="app"></main>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

```js
function crearTitulo(raiz, texto) {
  const titulo = document.createElement("h1");
  titulo.textContent = texto;
  titulo.tabIndex = -1;
  raiz.append(titulo);
  titulo.focus();
}

export function crearVistaInicio(raiz) {
  crearTitulo(raiz, "Seguimiento de guías");
  return { destroy() {} };
}

export function crearVistaGuias(raiz, { store, cliente }) {
  crearTitulo(raiz, "Guías");
  const contenido = document.createElement("div");
  contenido.setAttribute("aria-live", "polite");
  raiz.append(contenido);

  const pintar = ({ remoto }) => {
    if (remoto.tipo === "loading") contenido.textContent = "Cargando…";
    if (remoto.tipo === "error") contenido.textContent = remoto.mensaje;
    if (remoto.tipo === "success") {
      const lista = document.createElement("ul");
      for (const guia of remoto.guias) {
        const item = document.createElement("li");
        item.textContent = `${guia.numero}: ${guia.estado}`;
        lista.append(item);
      }
      contenido.replaceChildren(lista);
    }
  };

  const desuscribir = store.subscribe(pintar);
  const controlador = new AbortController();
  cliente.cargarGuias(store, { signal: controlador.signal });
  // destroy deja de escuchar el store y cancela la petición en curso.
  return { destroy() { controlador.abort(); desuscribir(); } };
}

export function crearVista404(raiz) {
  crearTitulo(raiz, "Página no encontrada");
  return { destroy() {} };
}
```

```js
import { crearRouter } from "./router/router.js";
import { crearStore } from "./estado/store.js";
import { crearVistaGuias, crearVistaInicio, crearVista404 } from "./vistas/index.js";

export function crearAplicacion(raiz, dependencias) {
  const store = crearStore({ remoto: { tipo: "idle" }, filtro: "TODAS" });
  let vistaActual = { destroy() {} };

  const renderizar = (ruta) => {
    // El ciclo de vida anterior termina antes de montar el siguiente.
    vistaActual.destroy();
    raiz.replaceChildren();
    if (ruta.vista === "inicio") vistaActual = crearVistaInicio(raiz);
    else if (ruta.vista === "guias") {
      vistaActual = crearVistaGuias(raiz, { store, cliente: dependencias.cliente });
    } else vistaActual = crearVista404(raiz);
  };

  const router = crearRouter({ renderizar });
  router.iniciar();
  return { destroy() { vistaActual.destroy(); router.destroy(); } };
}
```

</details>

### Comprueba lo construido

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por comprueba lo construido con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender comprueba lo construido te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en comprueba lo construido como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que comprueba lo construido resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Comprueba lo construido se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Comprueba lo construido | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses comprueba lo construido por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: comprueba lo construido funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Comprueba lo construido existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve comprueba lo construido en tu contexto?
2. ¿Cómo sabrías que comprueba lo construido no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar comprueba lo construido?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar comprueba lo construido.

</details>
