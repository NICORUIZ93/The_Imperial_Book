# Módulo 1: Datos, geografía y contabilidad de una entrega


## Aprende construyendo


### Tema 1: Modelo relacional e historial · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás diseñar un esquema envios + envio_eventos append-only en PostgreSQL y explicar, con un error real del motor, por qué el historial no se edita. Conocimiento previo: terminal, SQL básico (CREATE TABLE, INSERT) y Docker para levantar Postgres local.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[INSERT envio] --> B[(envios: estado mutable)]
  B --> C[INSERT envio_eventos]
  C --> D[(envio_eventos: append-only)]
  C -->|UPDATE o DELETE| E[Error: historial inmutable]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[INSERT envio] --> B[(envios: estado mutable)]
  B --> C[INSERT envio_eventos]
  C --> D[(envio_eventos: append-only)]
  C -->|UPDATE o DELETE| E[Error: historial inmutable]
```

```bash
mkdir -p rutaflow-labs/tema-1-modelo-relacional-e-historial
cd rutaflow-labs/tema-1-modelo-relacional-e-historial
docker run --name rutaflow-pg -e POSTGRES_PASSWORD=rutaflow -p 5432:5432 -d postgres:16
```

```sql
-- schema.sql
CREATE TABLE envios (
  id BIGSERIAL PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  estado TEXT NOT NULL DEFAULT 'creado',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE envio_eventos (
  id BIGSERIAL PRIMARY KEY,
  envio_id BIGINT NOT NULL REFERENCES envios(id),
  tipo TEXT NOT NULL,
  ocurrido_en TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (envio_id, tipo, ocurrido_en)
);

-- Regla de dominio: envio_eventos es append-only, nunca se edita ni se borra.
CREATE OR REPLACE FUNCTION bloquear_mutacion_historial() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'envio_eventos es append-only: % no está permitido', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER envio_eventos_sin_update
  BEFORE UPDATE OR DELETE ON envio_eventos
  FOR EACH ROW EXECUTE FUNCTION bloquear_mutacion_historial();
```

```bash
psql "postgresql://postgres:rutaflow@localhost:5432/postgres" -f schema.sql
psql "postgresql://postgres:rutaflow@localhost:5432/postgres" -c \
  "INSERT INTO envios (codigo) VALUES ('RF-4471'); INSERT INTO envio_eventos (envio_id, tipo) VALUES (1, 'creado'), (1, 'en_transito');"
psql "postgresql://postgres:rutaflow@localhost:5432/postgres" -c "SELECT * FROM envio_eventos ORDER BY id;"
```

```bash
psql "postgresql://postgres:rutaflow@localhost:5432/postgres" -c \
  "UPDATE envio_eventos SET tipo = 'cancelado' WHERE id = 1;"
```

</details>

### Tema 2: Geografía con precisión útil · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás modelar ubicaciones con PostGIS (geography(Point, 4326)) y calcular distancias reales con ST_DWithin, explicando por qué geometry sin castear da resultados incorrectos. Conocimiento previo: SQL básico, el esquema envios del Tema 1 y Postgres local con la exten…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[Conductor: lat/lon GPS] --> B[geography Point 4326]
  C[Punto de recogida RF-4471] --> B
  B --> D[ST_DWithin 2000 metros]
  D -->|dentro del radio| E[Conductor candidato]
  D -->|fuera del radio| F[Descartado]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[Conductor: lat/lon GPS] --> B[geography Point 4326]
  C[Punto de recogida RF-4471] --> B
  B --> D[ST_DWithin 2000 metros]
  D -->|dentro del radio| E[Conductor candidato]
  D -->|fuera del radio| F[Descartado]
```

```bash
mkdir -p rutaflow-labs/tema-2-geografia-con-precision-util
cd rutaflow-labs/tema-2-geografia-con-precision-util
```

```sql
-- conductores.sql
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE conductores (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  ubicacion GEOGRAPHY(Point, 4326) NOT NULL
);

INSERT INTO conductores (nombre, ubicacion) VALUES
  ('Conductor RF-01', ST_SetSRID(ST_MakePoint(-74.0721, 4.7110), 4326)::geography),
  ('Conductor RF-02', ST_SetSRID(ST_MakePoint(-74.0500, 4.6900), 4326)::geography);

-- Punto de recogida del envío RF-4471
SELECT nombre,
       ROUND(ST_Distance(ubicacion, ST_SetSRID(ST_MakePoint(-74.0721, 4.7050), 4326)::geography)::numeric, 1) AS distancia_m
FROM conductores
WHERE ST_DWithin(ubicacion, ST_SetSRID(ST_MakePoint(-74.0721, 4.7050), 4326)::geography, 2000);
```

```bash
psql "postgresql://postgres:rutaflow@localhost:5432/postgres" -f conductores.sql
```

```sql
ALTER TABLE conductores ADD COLUMN ubicacion_geom GEOMETRY(Point, 4326);
UPDATE conductores SET ubicacion_geom = ubicacion::geometry;

SELECT nombre, ST_Distance(ubicacion_geom, ST_SetSRID(ST_MakePoint(-74.0721, 4.7050), 4326)) AS distancia_grados
FROM conductores;
```

</details>

### Tema 3: Ledger de doble partida · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás modelar un ledger de doble partida en PostgreSQL y escribir la consulta que detecta un asiento desbalanceado, usando un ejemplo real de cobro y comisión. Conocimiento previo: SQL básico (GROUP BY, HAVING) y los conceptos de débito/crédito.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[Cobro efectivo RF-4471] --> B[Asiento contable]
  B --> C[Debito: efectivo_conductor]
  B --> D[Credito: obligacion_comercio]
  B --> E[Credito: comision_plataforma]
  C --> F{SUM debito = SUM credito}
  D --> F
  E --> F
  F -->|balanceado| G[Asiento válido]
  F -->|desbalanceado| H[Asiento rechazado]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[Cobro efectivo RF-4471] --> B[Asiento contable]
  B --> C[Debito: efectivo_conductor]
  B --> D[Credito: obligacion_comercio]
  B --> E[Credito: comision_plataforma]
  C --> F{SUM debito = SUM credito}
  D --> F
  E --> F
  F -->|balanceado| G[Asiento válido]
  F -->|desbalanceado| H[Asiento rechazado]
```

```bash
mkdir -p rutaflow-labs/tema-3-ledger-de-doble-partida
cd rutaflow-labs/tema-3-ledger-de-doble-partida
```

```sql
-- ledger.sql
CREATE TABLE movimientos_contables (
  id BIGSERIAL PRIMARY KEY,
  asiento_id BIGINT NOT NULL,
  cuenta TEXT NOT NULL,
  debito NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (debito >= 0),
  credito NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (credito >= 0),
  envio_codigo TEXT NOT NULL,
  moneda CHAR(3) NOT NULL DEFAULT 'COP', -- un asiento balancea dentro de una misma moneda
  CHECK (debito = 0 OR credito = 0)
);

-- Asiento 1: se cobra en efectivo la entrega RF-4471 ($25.000)
INSERT INTO movimientos_contables (asiento_id, cuenta, debito, credito, envio_codigo) VALUES
  (1, 'efectivo_conductor',  25000,     0, 'RF-4471'),
  (1, 'obligacion_comercio',     0, 22000, 'RF-4471'),
  (1, 'comision_plataforma',     0,  3000, 'RF-4471');

-- Verificación: todo asiento_id presente en este resultado está desbalanceado
SELECT asiento_id, moneda, SUM(debito) AS total_debito, SUM(credito) AS total_credito
FROM movimientos_contables
GROUP BY asiento_id, moneda
HAVING SUM(debito) <> SUM(credito);
```

```bash
psql "postgresql://postgres:rutaflow@localhost:5432/postgres" -f ledger.sql
```

```sql
INSERT INTO movimientos_contables (asiento_id, cuenta, debito, credito, envio_codigo)
VALUES (2, 'efectivo_conductor', 10000, 0, 'RF-5002');
```

</details>
