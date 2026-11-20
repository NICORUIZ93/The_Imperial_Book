# Laboratorio · Módulo 30 · Anti-patrones y cuándo NO usar microservicios (modulo-34)

Lección: [`web/public/content/microservices/modulo-34.md`](../../../web/public/content/microservices/modulo-34.md) ·
fichas F173–F176 · Fase 3 (Experto).

**Versiones:** Node.js 26.13.1 LTS · pg 8.23.1 · PostgreSQL 18.7 (imagen `postgres:18.7`). `package-lock.json` fija el
árbol completo.

```bash
cd examples/microservicios/modulo-34
npm ci
docker compose up -d --wait     # PostgreSQL :5432 (academia/academia) para F175
./verificar.sh --compose        # tests, demos y errores comunes de las 4 fichas → «RESULTADO: OK»
docker compose down -v
```

Sin `--compose`, `./verificar.sh` ejecuta F173, F174 y F176 (levantan sus propios servidores HTTP con `node:http`) y
F175 si PostgreSQL responde en `localhost:5432`; si no, la omite avisando. Cambia la base con `PG_URL` (ver
`comun/config.js`).

| Carpeta | Ficha | Qué hay |
|---|---|---|
| `comun/` | — | `http.js` (servicios HTTP en puertos libres, GET y POST con timeout), `config.js` (`PG_URL`) |
| `f173-monolito-distribuido/` | F173 Monolito distribuido | `sistema.js` (pedidos → inventario y precios → impuestos, todo síncrono; diagnóstico de síntomas), `demo.js`, `monolito.test.js`, `error-comun.js` (DTO compartido que obliga a desplegar en bloque) |
| `f174-sobre-descomposicion/` | F174 Sobre-descomposición | `nano.js` (el mismo cálculo en proceso y con 4 nanoservicios HTTP; métrica de granularidad), `demo.js`, `nano.test.js`, `error-comun.js` (un servicio por entidad) |
| `f175-sagas-innecesarias/` | F175 Sagas innecesarias | `tienda.js` (transacción local frente a saga con compensaciones en PostgreSQL), `demo.js`, `sagas.test.js`, `error-comun.js` (compensación no idempotente) |
| `f176-fitness-functions/` | F176 Fitness functions | `fitness.js` (internos ajenos, ciclos entre servicios y presupuesto de latencia), `ejemplo-ok/` y `ejemplo-roto/`, `demo.js` (sale con código 1 si hay violaciones, como en CI), `fitness.test.js`, `error-comun.js` (regex que no ve `import()`) |

**Verificado en el entorno de autoría** (Node 26.13.1, PostgreSQL 16.15 local): `./verificar.sh` → `RESULTADO: OK`
con las 4 fichas. Pendiente en el Mac (ver `verificacion/microservicios/pendiente.md`): `./verificar.sh --compose` con
la imagen `postgres:18.7` (aquí no hay acceso a Docker Hub).
