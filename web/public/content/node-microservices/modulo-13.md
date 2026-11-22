# Módulo 13 · API Gateway, BFF y edge en Node

Cuando crecen los clientes y servicios, exponer microservicios directamente genera acoplamiento, duplicación de cross-cutting concerns y contratos incómodos. Este módulo cubre API Gateway, BFF, agregación, auth en edge, rate limiting y request shaping, con criterio de cuándo usarlos.

**Entorno de referencia verificado (2026-05-22):** Node.js v24.18.0. Se verifican patrones de routing, agregación, rate limit y auth con Node. Kong/Nginx/Envoy/K8s Ingress reales se tratan con **Nota de verificación**.

## Aprende construyendo

### Tema 1: Gateway pattern · Intermedio · 120 min

Caso guía: un cliente móvil no debe conocer 10 URLs internas.

#### API Gateway

**Definición formal.** Un API Gateway es un punto de entrada que recibe requests externos, aplica políticas (auth, rate limit, routing, observabilidad) y las enruta a servicios internos.

**Para qué sirve.** Centralizar cross-cutting concerns y simplificar el cliente.

**Cuándo usarlo / cuándo no.** Úsalo cuando hay múltiples servicios/clientes. No lo conviertas en monolito lógico con reglas de negocio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm13-gw
cd nm13-gw
```

Crea el archivo `gateway.mjs`:

```js
const routes = { '/orders': 'http://orders:3001', '/catalog': 'http://catalog:3002' };
function resolve(path) { return routes[path] ?? null; }
console.log(resolve('/orders'));
console.log(resolve('/unknown') === null);
```

```bash
node gateway.mjs
```

**Caso de uso real.** Spring Cloud Gateway/Kong/Nginx/Express gateway.

**Error común.** Poner lógica de dominio en gateway.

**Síntoma.** gateway difícil de cambiar, despliegues coordinados. **Causa.** acoplar reglas de negocio. **Corrección.** gateway para concerns transversales; dominio en servicios. **Señal observable.** cambios de negocio requieren tocar gateway.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `http://orders:3001`, `true`.

### Tema 2: BFF (Backend for Frontend) · Intermedio · 120 min

Caso guía: móvil necesita payload pequeño; web necesita vista rica.

#### BFF

**Definición formal.** BFF es un backend específico por experiencia de cliente (web, móvil, partner) que orquesta y adapta datos a esa UI.

**Para qué sirve.** Evitar over/under-fetching y acoplar el backend genérico a cada UI.

**Cuándo usarlo / cuándo no.** Úsalo cuando clientes tienen necesidades muy distintas. No crees un BFF por pantalla sin necesidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm13-bff
cd nm13-bff
```

Crea el archivo `bff.mjs`:

```js
const order = { id: 'o1', total: 100, items: [{ sku: 'A1' }], internalNote: 'x' };
const mobile = ({ id, total }) => ({ id, total });
const web = ({ id, total, items }) => ({ id, total, items });
console.log(Object.keys(mobile(order)).length);
console.log(Object.keys(web(order)).includes('items'));
```

```bash
node bff.mjs
```

**Caso de uso real.** BFF Node/GraphQL agregando catalog+orders.

**Error común.** BFF duplicando lógica de dominio.

**Síntoma.** reglas inconsistentes entre clientes. **Causa.** BFF toma decisiones de negocio. **Corrección.** BFF adapta/compone; dominio queda en servicios. **Señal observable.** bug corregido en web BFF pero no en mobile BFF.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `2`, `true`.

### Tema 3: Auth en edge, rate limiting y request shaping · Avanzado · 120 min

Caso guía: bloquear requests inválidas antes de llegar a servicios.

#### Políticas de edge

**Definición formal.** Auth en edge valida identidad/token en el punto de entrada; rate limiting controla cuota; request shaping transforma/limita tamaño, headers o forma de la request.

**Para qué sirve.** Proteger servicios y reducir carga innecesaria.

**Cuándo usarlo / cuándo no.** Úsalo para controles transversales. No confíes solo en edge para autorización fina por recurso.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm13-edge
cd nm13-edge
```

Crea el archivo `edge.mjs`:

```js
function edge(req) {
  if (!req.auth) return { status: 401 };
  if (req.rateExceeded) return { status: 429 };
  if (req.bodyBytes > 1024) return { status: 413 };
  return { status: 200, forward: { userId: req.userId, path: req.path } };
}
console.log(edge({ auth: false }).status);
console.log(edge({ auth: true, rateExceeded: true }).status);
console.log(edge({ auth: true, rateExceeded: false, bodyBytes: 100, userId: 'u1', path: '/orders' }).status);
```

```bash
node edge.mjs
```

**Caso de uso real.** Gateway valida JWT, aplica cuota y pasa `X-User-Id`.

**Error común.** Confiar en headers internos sin trust boundary.

**Síntoma.** suplantación interna. **Causa.** servicio acepta `X-User-Id` desde internet. **Corrección.** aceptar identidad solo desde gateway confiable/mTLS. **Señal observable.** requests externas con header interno forjado.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `401`, `429`, `200`.

### Tema 4: Agregación, version routing y resiliencia en edge · Avanzado · 120 min

Caso guía: combinar respuestas y enrutar v1/v2 sin romper clientes.

#### Aggregation y routing

**Definición formal.** Agregación combina respuestas de múltiples servicios en una sola respuesta. Version routing dirige tráfico por versión de API/cliente.

**Para qué sirve.** Reducir chattiness y soportar evolución.

**Cuándo usarlo / cuándo no.** Úsalo con cuidado; agregación síncrona aumenta acoplamiento temporal. No agregues todo en gateway si crea punto crítico complejo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p nm13-agg
cd nm13-agg
```

Crea el archivo `agg.mjs`:

```js
async function aggregate() {
  const [order, catalog] = await Promise.all([
    Promise.resolve({ id: 'o1', sku: 'A1' }),
    Promise.resolve({ sku: 'A1', name: 'Keyboard' }),
  ]);
  return { ...order, name: catalog.name };
}
console.log((await aggregate()).name);
function routeVersion(v) { return v === '2' ? 'orders-v2' : 'orders-v1'; }
console.log(routeVersion('1'));
console.log(routeVersion('2'));
```

```bash
node agg.mjs
```

**Caso de uso real.** BFF agrega order+catalog; gateway rutea `/v2/orders`.

**Error común.** Agregación sin timeout parcial.

**Síntoma.** un servicio lento tumba toda la respuesta. **Causa.** no hay degradación por parte. **Corrección.** timeouts, partial response/fallback por sección. **Señal observable.** p99 del BFF igual al peor downstream.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `Keyboard`, `orders-v1`, `orders-v2`.

## Cierre

Gateway y BFF son herramientas de borde: simplifican clientes y centralizan políticas, pero pueden volverse cuellos de botella si absorben dominio. Mantén el borde fino, observable y resiliente.

## Checklist

- Gateway solo con concerns transversales.
- BFF adapta por cliente, no duplica dominio.
- Auth/rate limit/request shaping en edge con trust boundary clara.
- Agregación con timeout y degradación parcial.
- Version routing para evolución compatible.
