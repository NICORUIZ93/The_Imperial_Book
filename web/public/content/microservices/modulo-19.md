# Módulo 15 · Persistencia en Node.js

**Entorno de referencia (2026-05-22):** Node.js v24.18.0, Docker 29.9.3. Se verifican conceptos de pooling, transacciones lógicas y ownership con simulaciones/SQLite. MongoDB/Mongoose/PostgreSQL/Prisma/Sequelize reales requieren drivers/DB; **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: MongoDB + Mongoose · Intermedio · 150 min

#### Documento y Mongoose

**Definición formal.** MongoDB es una base documental; Mongoose es ODM para Node.js con esquemas, modelos y validación.

**Para qué sirve.** Persistencia flexible de documentos.

**Cuándo usarlo y cuándo no.** Úsalo cuando el modelo documental encaja. No fuerces joins complejos relacionales.

**Ejemplo mínimo enfocado (conceptual ejecutable de documento).**

```bash
node -e "const doc={_id:'1',name:'A',tags:['x']}; console.log(doc.tags[0])"
```

**Caso de uso real.** Catálogo con atributos variables.

**Error común.** Esquema sin validación. Corrección: schema Mongoose y validación.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `x`. **Nota:** MongoDB/Mongoose real requiere DB y paquete.

### Tema 2: PostgreSQL + Prisma/Sequelize · Intermedio · 150 min

#### ORM/Query builder

**Definición formal.** Prisma y Sequelize son herramientas de acceso a datos para Node.js; Prisma usa schema declarativo y cliente tipado, Sequelize es ORM tradicional.

**Para qué sirve.** Abstraen SQL y mapeo.

**Cuándo usarlo y cuándo no.** Úsalo para productividad; entiende SQL generado.

**Ejemplo mínimo enfocado (SQL verificable con sqlite).**

```bash
python3 - <<'PY'
import sqlite3
db=sqlite3.connect(':memory:')
db.execute('create table users(id int,name text)')
db.execute('insert into users values(1,"Ada")')
print(db.execute('select name from users').fetchone()[0])
PY
```

**Caso de uso real.** CRUD relacional.

**Error común.** N+1 por ORM. Corrección: includes/joins y observación SQL.

**Verificación (Python/sqlite3, 2026-05-22).** Salida: `Ada`. **Nota:** Prisma/Sequelize/Postgres real requieren DB y paquetes.

### Tema 3: Database-per-service · Intermedio · 90 min

#### Aislamiento de datos

**Definición formal.** Cada servicio posee su almacenamiento; no comparte tablas directamente.

**Para qué sirve.** Autonomía y menor acoplamiento.

**Cuándo usarlo y cuándo no.** Úsalo en microservicios maduros.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const services={orders:{db:'orders_db'},billing:{db:'billing_db'}}; console.log(services.orders.db!==services.billing.db)"
```

**Caso de uso real.** Orders no lee tabla de Billing.

**Error común.** Shared DB por comodidad. Corrección: API/eventos.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`.

### Tema 4: Connection pooling y transacciones · Avanzado · 120 min

#### Connection pool

**Definición formal.** Pool de conexiones reutiliza conexiones abiertas a la DB para reducir overhead.

**Para qué sirve.** Rendimiento y control de recursos.

**Cuándo usarlo y cuándo no.** Siempre en servicios DB. Ajusta tamaño.

**Ejemplo mínimo enfocado (ejecutable, pool simulado).**

```bash
node -e "const max=2; let used=0; function acquire(){ if(used<max){used++; return true;} return false;} console.log(acquire(),acquire(),acquire())"
```

**Caso de uso real.** PgBouncer/Hikari/Prisma pool.

**Error común.** Pool demasiado grande. Corrección: dimensionar por DB y carga.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true true false`.

#### Transacción

**Definición formal.** Unidad atómica commit/rollback.

**Para qué sirve.** Consistencia.

**Cuándo usarlo y cuándo no.** Para cambios multi-paso.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const db={a:10,b:10}; try{db.a-=5; throw new Error('x'); db.b+=5;}catch(e){ /* rollback sim */ db.a+=5;} console.log(db.a,db.b)"
```

**Caso de uso real.** Transferencia.

**Error común.** Transacciones largas. Corrección: mantener cortas.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `10 10`.

## Cierre del módulo

La persistencia en Node.js requiere elegir modelo de datos, herramienta y políticas operativas (pool, transacciones, ownership). Los drivers/ORM se validan con DB real en integración.
