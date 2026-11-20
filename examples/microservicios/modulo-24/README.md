# Laboratorio · Módulo 20 · Seguridad (Node.js)

Lección: [`web/public/content/microservices/modulo-24.md`](../../../web/public/content/microservices/modulo-24.md)
(Fase 2, fichas F124–F129, specs/018). Un solo `package.json` con lockfile. Cada ficha tiene `antes.js`
(**vulnerable a propósito: no lo copies**), `despues.js` (seguro) y `ataque.js`, que lanza el mismo ataque contra los
dos y muestra la diferencia.

| Carpeta | Ficha | Antes / después | Otros | Test |
|---|---|---|---|---|
| `f124-jwt` | JWT con jsonwebtoken | `antes.js` (:3124) / `despues.js` (:3224) | `tokens.js`, `ataque.js`, `error-comun.js` | `tokens.test.js` (7) |
| `f125-passport` | Passport.js | `antes.js` (:3125) / `despues.js` (:3225, necesita `JWT_SECRETO`) | `ataque.js`, `error-comun.js` | `passport.test.js` (7) |
| `f126-helmet-cors` | Helmet, CORS | `antes.js` (:3126) / `despues.js` (:3226) | `ataque.js`, `error-comun.js`, `anti-patron.js` | `cabeceras.test.js` (4) |
| `f127-nosql` | Prevención de inyecciones NoSQL | `antes.js` (:3127) / `despues.js` (:3227) | `datos.js`, `ataque.js` (MongoDB), `error-comun.js` | `filtros.test.js` (5) y `nosql.integracion.js` (2, MongoDB) |
| `f128-owasp` | OWASP Top 10 (edición 2025) | `antes.js` (:3128) / `despues.js` (:3228) | `comun.js`, `ataque.js` | `owasp.test.js` (5) |
| `f129-secretos` | Secretos: AWS Secrets Manager, Vault, Azure Key Vault | `antes.js` (:3129) / `despues.js` (:3229) | `secretos.js`, `sembrar.js`, `ataque.js`, `error-comun.js` | `secretos.test.js` (6) y `secretos.integracion.js` (3, emuladores) |

## Versiones

Node.js **26.13.1 LTS** · express **5.3.0** · jsonwebtoken **9.0.3** · passport **0.7.0** · passport-local **1.0.0**
· passport-jwt **4.0.1** · helmet **8.3.0** · cors **2.8.6** · zod **4.6.7** · mongodb **7.9.1** ·
@aws-sdk/client-secrets-manager **3.1173.0** · node-vault **0.13.0** · @azure/keyvault-secrets **4.12.0** ·
@azure/identity **4.14.1**. Infraestructura (`docker-compose.yml`): MongoDB **9.0.8**, Floci **2.2.0** (AWS, :4566),
Floci-Az **0.14.0** (Azure, :4577), HashiCorp Vault **2.2.0** en modo dev (:8200, token `root`). Floci y Floci-Az son
las mismas imágenes del `docker-compose.yml` de la raíz; si ese ya está arriba, levanta solo `mongo vault`.

## Ejecutar

```bash
cd examples/microservicios/modulo-24
npm ci
node f124-jwt/ataque.js                     # y los demás ataque.js
docker compose up -d --wait                 # para f127 (MongoDB) y f129 (gestores de secretos)
node f129-secretos/sembrar.js
SECRETOS=vault VAULT_ADDR=http://127.0.0.1:8200 VAULT_TOKEN=root node f129-secretos/despues.js
docker compose down
```

## Verificar

```bash
./verificar.sh              # 34 tests y los ataques sin infraestructura (avisa de lo omitido)
./verificar.sh --compose    # todo: además MongoDB y los tres gestores de secretos
```

Toda la salida queda en `logs/verificar.log`, la de cada script en `logs/<carpeta>-<script>.log` y la de cada API en
`logs/api-3229-<proveedor>.log`. Resultado esperado: `ℹ tests 34 · ℹ pass 34`, un `✔` por comprobación y
`RESULTADO: OK · Módulo 20 (Seguridad en Node.js) verificado`. Si algo falla, sigue con lo demás, lista los fallos al
final y termina con `RESULTADO: FALLA` y código 1.
