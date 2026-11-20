# Laboratorio · Módulo 17 · Introducción a microservicios en Node

Lección: [`web/public/content/microservices/modulo-21.md`](../../../web/public/content/microservices/modulo-21.md)
(Fase 2, fichas F109–F112, specs/018). Un solo `package.json` con lockfile para las cuatro fichas. F109 es TypeScript
que Node ejecuta directamente (type stripping; `tsc` solo comprueba tipos); el resto es JavaScript con módulos ES.

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `f109-estructura` | Estructura de carpetas escalable | `src/main.ts` (:3109), `herramientas/revisar-capas.ts` | `test/pedidos.test.ts` (6) y `test/arquitectura.test.ts` (2) |
| `f110-dotenv` | dotenv | `main.js`, `config.js`, `.env.example`, `error-comun.js` | `config.test.js` (5) |
| `f111-consul` | Service Discovery con Consul | `servicio-catalogo.js` (:3111, :3112), `cliente.js`, `registro.js`, `descubrir.js` | `descubrimiento.test.js` (4) |
| `f112-config-central` | Configuración centralizada | `servicio.js` (:3120), `sembrar.js`, `config-central.js` | `config-central.test.js` (4) |
| `comun` | (F111 y F112) | `consul.js` (cliente), `consul-de-prueba.js` (doble en memoria de la API de Consul) | — |

## Versiones

Node.js **26.13.1 LTS** · TypeScript **6.0.3** · @types/node **26.6.6** · dotenv **18.0.10** · consul **2.0.1**
(cliente npm) · HashiCorp Consul **2.1.0** (`hashicorp/consul:2.1.0`, Docker Compose v5.6.1 o posterior).

## Ejecutar

```bash
cd examples/microservicios/modulo-21
npm ci
node f109-estructura/src/main.ts                  # curl -s localhost:3109/salud
cp f110-dotenv/.env.example f110-dotenv/.env && node f110-dotenv/main.js
docker compose up -d --wait                       # Consul en http://localhost:8500
PORT=3111 node f111-consul/servicio-catalogo.js   # y en otra terminal: node f111-consul/cliente.js
node f112-config-central/sembrar.js && node f112-config-central/servicio.js   # curl -s localhost:3120/config
docker compose down -v
```

Sin Docker: `node comun/consul-de-prueba.js` deja un doble en memoria en `127.0.0.1:8500` (no es Consul: sin UI, DNS
ni clúster) con el que funcionan los programas de F111 y F112.

## Verificar

```bash
./verificar.sh             # sin Docker: npm ci, tsc, 21 tests (Consul = doble en memoria), demos de F109 y F110
./verificar.sh --compose   # además levanta Consul 2.1.0 y repite tests y laboratorios de F111 y F112 contra él
./verificar.sh --externo   # igual, contra un Consul ya arrancado en CONSUL_HTTP_ADDR (por defecto 127.0.0.1:8500)
```

Requiere Node.js 26.13.1, npm, `curl` y `jq` (y Docker para `--compose`). Toda la salida queda también en
`logs/verificar.log` y la de cada programa en `logs/<ficha>-*.log`; con `--compose`, los logs del contenedor en
`logs/compose.log`. Resultado esperado: `ℹ tests 21 · ℹ pass 21` (más `ℹ tests 8 · ℹ pass 8` con Consul real), un `✔`
por comprobación y `RESULTADO: OK · Módulo 17 (Introducción a microservicios en Node) verificado`. Si algo falla,
sigue con lo demás, lista todos los fallos al final y termina con `RESULTADO: FALLA` y código 1.
