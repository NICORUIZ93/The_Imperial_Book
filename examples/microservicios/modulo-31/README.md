# Laboratorio · Módulo 27 · Seguridad Zero-Trust

Lección: [`web/public/content/microservices/modulo-31.md`](../../../web/public/content/microservices/modulo-31.md)
(Fase 3, fichas F161–F164, specs/018). Un solo `package.json` con lockfile (solo `pg` 8.23.1, para la ficha de Vault);
todo lo demás es Node.js 26 sin dependencias (`node:tls`, `node:https`, `node:crypto`) para que veas cada comprobación
que hace una malla de servicios.

Los archivos `antes.js` son vulnerables **a propósito**: no copies nada de ellos. Cada ficha tiene un `ataque.js` que
lanza el mismo ataque contra `antes.js` y `despues.js` y enseña la diferencia.

| Carpeta | Ficha | Programas | Test |
|---|---|---|---|
| `pki/` | todas | `generar.sh`: CA de la malla y certificados con identidad SPIFFE (1 día) | — |
| `comun/` | todas | `pki.js` (identidad SPIFFE, huella `x5t#S256`), `jwt.js` (ES256 con `node:crypto`), `cliente.js` | — |
| `f161-mtls` | mTLS con Istio/Linkerd | `antes.js`, `despues.js`, `ataque.js`, `error-comun.js`, `k8s/` (Istio y Linkerd) | `mtls.test.js` (6) |
| `f162-token-exchange` | Token Exchange (RFC 8693) | `sts.js`, `antes.js`, `despues.js`, `ataque.js`, `error-comun.js` | `token-exchange.test.js` (4) |
| `f163-vault` | Vault | `antes.js`, `despues.js` (cliente de la API de Vault), `doble-vault.js`, `bd.js`, `rol.js`, `ataque.js`, `error-comun.js`, `real.js`, `vault/configurar.sh` | `vault.test.js` (5) |
| `f164-service-mesh` | Service Mesh | `app.js`, `antes.js`, `despues.js` (sidecar), `politica.json`, `ataque.js`, `error-comun.js`, `k8s/ambient.yaml` | `malla.test.js` (3) |

## Versiones

Node.js **26.13.1 LTS** · pg **8.23.1** · OpenSSL 3.x o LibreSSL de macOS. Infraestructura de `docker-compose.yml`
(solo F163): `hashicorp/vault:2.2.0` (modo dev, :18200) y `postgres:18.7` (:15432). Malla real (opcional, en kind):
Istio **1.32** (`istioctl`) o Linkerd **edge-26.11.2**, Kubernetes **1.37**.

## Ejecutar

```bash
cd examples/microservicios/modulo-31
npm ci
./pki/generar.sh
node f161-mtls/ataque.js
node f162-token-exchange/ataque.js
node f163-vault/ataque.js
node f164-service-mesh/ataque.js
```

## Verificar

```bash
./verificar.sh              # 18 tests (1 omitido sin PostgreSQL) y los 4 ataques ANTES/DESPUÉS (sin Docker)
PGURL=postgres://usuario:clave@127.0.0.1:5432/basedatos ./verificar.sh   # + SQL de Vault en un PostgreSQL tuyo
./verificar.sh --compose    # + Vault 2.2.0 y PostgreSQL 18.7 reales con una credencial dinámica de verdad
./f161-mtls/k8s/probar-istio.sh   # aparte: la misma política en Istio 1.32 dentro de kind (unos 5 minutos)
```

Toda la salida queda en `logs/verificar.log`. Resultado esperado: `ℹ tests 18`, `ℹ pass 17` (18 con `PGURL`), un `✔`
por comprobación y `RESULTADO: OK · Módulo 27 (Seguridad Zero-Trust) verificado`. Si algo falla, sigue con lo demás,
lista los fallos al final y termina con `RESULTADO: FALLA` y código 1. Si falta Docker u openssl, lo dice y sigue.

El usuario de `PGURL` necesita `CREATEROLE` (es el que usaría Vault). En un PostgreSQL local:
`CREATE ROLE vault_admin WITH LOGIN CREATEROLE PASSWORD 'solo-dev-vault'; CREATE DATABASE tienda OWNER vault_admin;`
