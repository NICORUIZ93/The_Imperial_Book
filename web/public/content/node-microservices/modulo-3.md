# Módulo 3 · Testing en Node.js

**Entorno de referencia (2026-05-22):** Node.js v24.18.0, Docker 29.9.3. Se verifican tests con `node --test` y conceptos de contrato/integración con simulaciones. Jest, Supertest, Pact, Testcontainers Node requieren paquetes; **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: Jest · Intermedio · 120 min

#### Test unitario

**Definición formal.** Jest es un framework de testing para JS/TS con runner, aserciones y mocks. Node también provee `node:test`.

**Para qué sirve.** Regresiones rápidas.

**Cuándo usarlo y cuándo no.** Úsalo en lógica pura; no dependas solo de E2E.

**Ejemplo mínimo enfocado (ejecutable con node:test).**

```bash
mkdir -p /tmp/ms20-jest && cd /tmp/ms20-jest
cat > sum.test.mjs << 'JS'
import test from 'node:test';
import assert from 'node:assert/strict';
test('suma', ()=> assert.equal(2+3,5));
JS
node --test
```

**Caso de uso real.** `expect(...).toBe(...)` en Jest.

**Error común.** Tests frágiles por tiempo real. Corrección: fakes/timers controlados.

**Verificación (Node 24.18.0, 2026-05-22).** `node --test` reporta 1 test pasando. **Nota:** Jest requiere paquete `jest`.

### Tema 2: Supertest · Intermedio · 90 min

#### HTTP integration test

**Definición formal.** Supertest prueba APIs HTTP Node (comúnmente Express) sin levantar puerto externo manualmente.

**Para qué sirve.** Validar status/body/headers.

**Cuándo usarlo y cuándo no.** Úsalo en API HTTP. No sustituye unit tests.

**Ejemplo mínimo enfocado (ejecutable con fetch local).**

```bash
mkdir -p /tmp/ms20-http && cd /tmp/ms20-http
cat > t.mjs << 'JS'
import http from 'node:http';
import test from 'node:test';
import assert from 'node:assert/strict';
test('GET /ok', async ()=>{ const s=http.createServer((_,res)=>{res.writeHead(200);res.end('ok')}); await new Promise(r=>s.listen(0,r)); const p=s.address().port; const r=await fetch(`http://127.0.0.1:${p}/ok`); assert.equal(await r.text(),'ok'); s.close(); });
JS
node --test
```

**Caso de uso real.** Supertest `request(app).get('/ok').expect(200)`.

**Error común.** No cerrar server en test. Corrección: hooks/close.

**Verificación (Node 24.18.0, 2026-05-22).** Test pasa.

### Tema 3: Contract Testing con Pact · Avanzado · 120 min

#### Contrato

**Definición formal.** Pact valida que consumidor y proveedor cumplen un contrato de interacción.

**Para qué sirve.** Evita rupturas entre servicios.

**Cuándo usarlo y cuándo no.** Despliegues independientes.

**Ejemplo mínimo enfocado (ejecutable, contrato simple).**

```bash
node -e "const c={status:200,body:{id:1}}; console.log(c.status===200 && c.body.id===1)"
```

**Caso de uso real.** Pact Broker en CI.

**Error común.** Contratos demasiado rígidos. Corrección: matchers.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`. **Nota:** Pact real requiere paquetes.

### Tema 4: Testcontainers para Node · Avanzado · 120 min

#### Integración con contenedores

**Definición formal.** Testcontainers Node levanta contenedores Docker para tests de integración.

**Para qué sirve.** Fidelidad con DB/broker real.

**Cuándo usarlo y cuándo no.** Integración; requiere Docker.

**Ejemplo mínimo enfocado (prerequisito verificado).**

```bash
docker run --rm hello-world >/dev/null && echo docker-ok
```

**Caso de uso real.** Postgres container en tests.

**Error común.** CI sin Docker. Corrección: configurar runner.

**Verificación (Docker 29.9.3, 2026-05-22).** Salida: `docker-ok`. **Nota:** Testcontainers Node requiere paquete.

## Cierre del módulo

Node.js tiene `node:test` para empezar simple; Jest/Supertest/Pact/Testcontainers añaden capacidades según el nivel de fidelidad requerido.
