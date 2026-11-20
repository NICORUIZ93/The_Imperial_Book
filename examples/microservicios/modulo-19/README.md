# Laboratorio · Módulo 15 · Persistencia

Lección: [`web/public/content/microservices/modulo-19.md`](../../../web/public/content/microservices/modulo-19.md)
(Fase 2, fichas F101–F104, specs/018). Un solo `package.json` con lockfile para las cuatro fichas; cada carpeta
`fNNN-*` tiene el código, los programas de demostración y los tests de una ficha.

| Carpeta | Ficha | Programas | Tests (`node --test`) |
|---|---|---|---|
| `f101-mongoose` | MongoDB + Mongoose | `demo.js`, `error-buffering.js` (error común, no necesita MongoDB) | `modelo.test.js` (4, sin base) · `repositorio.test.js` (4, con MongoDB) |
| `f102-prisma-sequelize` | PostgreSQL + Prisma/Sequelize | `preparar.js` (aplica `sql/001-esquema.sql`), `sequelize-demo.js`, `prisma-demo.ts`, `n-mas-1.js` (error común) | `sequelize.test.js` (3) · `prisma.test.ts` (3, con `tsx`) |
| `f103-database-per-service` | Database-per-service | `arrancar.js` (pedidos en 3103, inventario en 3203), `demo.js`, `error-join.js` (error común) | `aislamiento.test.js` (4) |
| `f104-pool-transacciones` | Connection pooling y transacciones | `demo.js`, `fuga.js` (error común), `anti-patron.js` | `pool.test.js` (5) |

`config.js` tiene las direcciones de las bases; `initdb/01-bases.sql` crea las bases y los usuarios de PostgreSQL.

## Versiones

Node.js **26.13.1 LTS** · mongoose **9.12.2** · prisma, @prisma/client y @prisma/adapter-pg **7.10.1** · sequelize
**6.37.8** · pg **8.23.1** · express **5.3.0** · tsx **4.23.15** · TypeScript **6.0.3** · `@types/node` **26.6.6**.
Docker Compose: `mongo:9.0.8` (puerto 27019) y `postgres:18.7` (puerto 5519).

## Ejecutar

```bash
cd examples/microservicios/modulo-19
docker compose up -d --wait        # MongoDB y PostgreSQL «healthy»
npm ci
npm run generate                   # cliente de Prisma en f102-prisma-sequelize/generated/
node f101-mongoose/demo.js
node f102-prisma-sequelize/sequelize-demo.js
node --import tsx f102-prisma-sequelize/prisma-demo.ts
node f103-database-per-service/demo.js
node f104-pool-transacciones/demo.js
docker compose down
```

Para usar otras bases: `PG_HOST`, `PG_PORT` y `MONGO_URL` (ver `config.js`). Si usas un PostgreSQL propio, aplica
antes `initdb/01-bases.sql` con un superusuario llamado `tienda` (clave `tienda`).

## Verificar

```bash
./verificar.sh --compose   # levanta las bases, lo verifica todo y las apaga
./verificar.sh             # usa las bases que ya estén arriba; lo que no tenga base se omite y se avisa
```

Resultado esperado: `✔` en cada bloque y
`RESULTADO: OK · Módulo 15 (Persistencia) verificado · logs en logs/`. Si un bloque falla, el script sigue con los
demás, al final lista todos los fallos y termina con `RESULTADO: FALLA` y código 1. La salida completa de cada bloque
queda en `logs/NN-nombre.log` (y los logs de los contenedores en `logs/99-docker-compose.log`).

## Qué se ejecutó al escribirlo y qué falta

Ejecutado con Node.js 26.13.1 y PostgreSQL 16.15 local: todo F103 y F104, Sequelize y N+1 de F102, y de F101 la
validación del esquema y el error común. Falta en una máquina con Docker y acceso a `binaries.prisma.sh`: MongoDB
9.0.8 (demo y `repositorio.test.js`), Prisma (`npm run generate`, `prisma.test.ts`, `prisma-demo.ts`) y repetir todo
contra PostgreSQL 18.7. Detalle en `verificacion/microservicios/pendiente.md`.
