# Módulo 1: Datos, geografía y contabilidad de una entrega


## Aprende construyendo

### Tema 1: Modelo relacional e historial

**Conceptos clave:** identidades, claves, constraints, migraciones y auditoría.

Envio representa el agregado; EnvioEvento registra hechos inmutables. Una transición se valida dentro de una transacción y una restricción protege incluso ante errores de aplicación. Direcciones operativas se separan de su presentación pública. Las migraciones son código versionado, reversible cuando es posible y probado con datos realistas. El criterio no es memorizar la herramienta, sino poder predecir qué sucede ante duplicados, datos incompletos, concurrencia, pérdida de red o permisos insuficientes. Documenta supuestos y mide antes de optimizar.

**Analogía:** Es como un libro de actas: se agrega una corrección, no se borra el pasado.

**¿Por qué es importante?** Porque permite explicar qué ocurrió y reconstruir proyecciones. En RutaFlow la decisión se valida con una prueba automatizada y una observación operativa, no solo con una captura de pantalla.

**Casos de uso reales:** estudia el flujo normal, un reintento, un dato tardío y un acceso sin permiso. Dibuja primero el flujo y marca dónde puede fallar.

**Diagrama:**

```mermaid
flowchart LR
  A[Entrada] --> B[Regla de dominio]
  B --> C[(Estado durable)]
  C --> D[Evento observable]
  B -->|rechazo explícito| E[Error recuperable]
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás diseñar un esquema `envios` + `envio_eventos` append-only en PostgreSQL y explicar, con un error real del motor, por qué el historial no se edita. **Conocimiento previo:** terminal, SQL básico (`CREATE TABLE`, `INSERT`) y Docker para levantar Postgres local.

#### Paso 2 · Contexto y caso real

**Caso real:** un conductor marca "entregado" dos veces por un reintento de la app sin conexión, o un soporte intenta "corregir" un evento pasado en vez de agregar uno nuevo. El modelo debe impedir ambas cosas a nivel de base de datos, no solo en la capa de aplicación.

#### Paso 3 · Teoría, conceptos y analogía

```mermaid
flowchart LR
  A[INSERT envio] --> B[(envios: estado mutable)]
  B --> C[INSERT envio_eventos]
  C --> D[(envio_eventos: append-only)]
  C -->|UPDATE o DELETE| E[Error: historial inmutable]
```

#### Paso 4 · Demostración guiada desde cero
**Crea** el archivo `schema.sql` con las dos tablas y el trigger que ves más abajo, y guárdalo antes de aplicarlo con `psql -f schema.sql`.

Crea una carpeta independiente, levanta un Postgres local y aplica el esquema real de `envios` + historial:

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

**Resultado esperado:** la última consulta devuelve dos filas (`creado`, `en_transito`) para el envío `RF-4471`; el historial crece solo por `INSERT`.

**Fallo deliberado:** intenta editar un hecho pasado en vez de agregar uno nuevo:

```bash
psql "postgresql://postgres:rutaflow@localhost:5432/postgres" -c \
  "UPDATE envio_eventos SET tipo = 'cancelado' WHERE id = 1;"
```

Postgres responde con `ERROR: envio_eventos es append-only: UPDATE no está permitido` (el trigger aborta la transacción). Diagnostica leyendo el mensaje del trigger, no el código de la aplicación; corrige insertando un evento compensatorio (`INSERT INTO envio_eventos (envio_id, tipo) VALUES (1, 'cancelado');`) en vez de mutar la fila existente, y repite la consulta para confirmar que el historial quedó completo y sin ediciones.

#### Paso 5 · Práctica guiada

1. Agrega una columna `actor TEXT NOT NULL DEFAULT 'sistema'` a `envio_eventos` para registrar quién generó el hecho.
2. Confirma que un `DELETE FROM envio_eventos WHERE id = 1;` también es bloqueado por el mismo trigger.
3. Pista: la restricción `UNIQUE (envio_id, tipo, ocurrido_en)` evita duplicar el mismo hecho si un reintento de red reenvía el mismo evento con el mismo timestamp.

#### Paso 6 · Práctica independiente

Escribe una función `registrar_evento(envio_id, tipo)` en PL/pgSQL (o en Node usando `pg`) que inserte un evento nuevo y nunca actualice uno existente, incluso si se la llama dos veces con los mismos datos. No reutilices el trigger como atajo para evitar escribir la validación en la función; el objetivo es razonar el contrato antes de delegarlo.

#### Paso 7 · Cierre, evidencia y proyecto

Entrega `schema.sql`, la salida de la consulta con los dos eventos, y la salida exacta del error del trigger al intentar el `UPDATE`. El **Tema 2: Geografía con precisión útil** retoma esta misma tabla `envios` para ubicar conductores cerca del punto de recogida con PostGIS. **Fuente oficial:** [PostgreSQL — PL/pgSQL Trigger Procedures](https://www.postgresql.org/docs/current/plpgsql-trigger.html).

**Errores comunes:** ejecutar el `UPDATE` esperando que falle solo "en la aplicación" y no a nivel de base de datos; olvidar el `REFERENCES envios(id)` y permitir eventos huérfanos; reutilizar el mismo `ocurrido_en` para eventos distintos y chocar con el `UNIQUE`.

**Transferencia al proyecto integrador «RutaFlow»:** Añade el esquema de envíos e historial a migraciones versionadas. Inserta una transición válida e intenta modificar el hecho anterior; guarda la evidencia de integridad y la política de corrección mediante eventos nuevos.

**Límites y decisión de uso:** Un historial append-only conserva evidencia, pero no impide insertar hechos falsos o duplicados. Valida identidad y transiciones y controla permisos; corrige mediante nuevos eventos, con una política distinta para datos personales que requieran tratamiento especial.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
### Tema 2: Geografía con precisión útil

**Conceptos clave:** PostGIS, SRID, índices, distancia, geocodificación y privacidad.

Latitud y longitud no son texto. Se almacenan con sistema de referencia explícito y se consultan con índices espaciales. La distancia geodésica no equivale a la distancia por carretera. Guardar seis decimales no hace exacto un GPS con error de veinte metros; la interfaz debe comunicar precisión y antigüedad. El criterio no es memorizar la herramienta, sino poder predecir qué sucede ante duplicados, datos incompletos, concurrencia, pérdida de red o permisos insuficientes. Documenta supuestos y mide antes de optimizar.

**Analogía:** Es como una fotografía desenfocada guardada en alta resolución sigue desenfocada.

**¿Por qué es importante?** Porque impide decisiones falsas, consultas lentas y exposición innecesaria. En RutaFlow la decisión se valida con una prueba automatizada y una observación operativa, no solo con una captura de pantalla.

**Casos de uso reales:** estudia el flujo normal, un reintento, un dato tardío y un acceso sin permiso. Dibuja primero el flujo y marca dónde puede fallar.

**Diagrama:**

```mermaid
flowchart LR
  A[Entrada] --> B[Regla de dominio]
  B --> C[(Estado durable)]
  C --> D[Evento observable]
  B -->|rechazo explícito| E[Error recuperable]
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás modelar ubicaciones con PostGIS (`geography(Point, 4326)`) y calcular distancias reales con `ST_DWithin`, explicando por qué `geometry` sin castear da resultados incorrectos. **Conocimiento previo:** SQL básico, el esquema `envios` del Tema 1 y Postgres local con la extensión PostGIS disponible.

#### Paso 2 · Contexto y caso real

**Caso real:** un GPS reporta la posición de un conductor con 6 decimales de precisión, pero si la columna no es `geography(Point, 4326)` la "precisión" del dato no sirve de nada: la consulta de cercanía puede estar comparando grados contra metros sin que Postgres avise.

#### Paso 3 · Teoría, conceptos y analogía

```mermaid
flowchart LR
  A[Conductor: lat/lon GPS] --> B[geography Point 4326]
  C[Punto de recogida RF-4471] --> B
  B --> D[ST_DWithin 2000 metros]
  D -->|dentro del radio| E[Conductor candidato]
  D -->|fuera del radio| F[Descartado]
```

#### Paso 4 · Demostración guiada desde cero
**Crea** el archivo `conductores.sql` con la extensión PostGIS, la tabla `conductores` y la consulta de cercanía que ves más abajo, y guárdalo antes de aplicarlo con `psql -f conductores.sql`.

Usa el mismo Postgres del Tema anterior y activa PostGIS:

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

**Resultado esperado:** solo `Conductor RF-01` aparece, con `distancia_m` cercano a `668.9` (metros reales); `Conductor RF-02` queda fuera del radio de 2000 metros.

**Fallo deliberado:** cambia la columna a `geometry` en vez de `geography` y repite la misma consulta:

```sql
ALTER TABLE conductores ADD COLUMN ubicacion_geom GEOMETRY(Point, 4326);
UPDATE conductores SET ubicacion_geom = ubicacion::geometry;

SELECT nombre, ST_Distance(ubicacion_geom, ST_SetSRID(ST_MakePoint(-74.0721, 4.7050), 4326)) AS distancia_grados
FROM conductores;
```

Postgres no lanza ningún error: devuelve `0.0060...` para `Conductor RF-01`, porque calculó la distancia como grados sobre un plano, no como metros sobre la curvatura terrestre. Si el código asumiera que ese número está en metros, creería que el conductor está a 6 milímetros, y un radio de "2000" comparado contra grados haría que conductores de otras ciudades calificaran como cercanos. Diagnóstico: el tipo de la columna (`geometry` vs `geography`), no el valor de las coordenadas; corrección: volver a `geography(Point, 4326)` o castear explícitamente `::geography` en cada consulta de distancia.

#### Paso 5 · Práctica guiada

1. Crea un índice `CREATE INDEX conductores_ubicacion_gix ON conductores USING GIST (ubicacion);` y confirma con `EXPLAIN ANALYZE` que la consulta del Paso 4 lo usa.
2. Cambia el radio de `ST_DWithin` a `5000` y verifica cuántos conductores más entran en el resultado.
3. Pista: `EXPLAIN ANALYZE` solo muestra el índice si la condición usa la columna `geography` directamente, no una expresión casteada.

#### Paso 6 · Práctica independiente

Escribe una función `conductores_cercanos(lat, lon, radio_metros)` en PL/pgSQL que reciba coordenadas y un radio, use `ST_DWithin` sobre la columna `geography` con índice, y devuelva los conductores ordenados por distancia ascendente. Debe fallar explícitamente (con una excepción clara) si se la llama contra una columna `geometry` sin castear.

#### Paso 7 · Cierre, evidencia y proyecto

Entrega `conductores.sql`, la salida con la distancia correcta en metros y la salida del fallo deliberado mostrando la distancia en grados. El **Tema 3: Ledger de doble partida** deja la geografía y pasa a la contabilidad: cómo registrar el cobro en efectivo del envío `RF-4471` sin descuadrar el libro contable. **Fuente oficial:** [PostGIS — ST_DWithin](https://postgis.net/docs/ST_DWithin.html).

**Errores comunes:** comparar `geometry` contra `geography` sin castear y obtener un error de tipo; olvidar el índice `GiST` y forzar un recorrido completo de la tabla; asumir que más decimales en el GPS implican más precisión real.

**Transferencia al proyecto integrador «RutaFlow»:** Consulta candidatos cercanos a una recogida con coordenadas conocidas. Verifica distancia, unidad y precisión, y conserva un caso donde cercanía geográfica no equivale a menor tiempo de conducción.

**Límites y decisión de uso:** Distancia geodésica y precisión decimal no predicen tiempo de conducción ni calidad del GPS. Considera red vial, antigüedad y error reportado; no asignes una entrega solo porque un punto parece cercano en el mapa.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
### Tema 3: Ledger de doble partida

**Conceptos clave:** cuentas, débitos, créditos, tarifas versionadas y conciliación.

El saldo es una proyección de movimientos, no un campo que se corrige manualmente. Cada asiento debe balancear débitos y créditos en la misma moneda. Una tarifa conserva versión y vigencia para reproducir una cotización histórica. Recaudo, comisión, obligación al comercio y efectivo del conductor son cuentas diferentes. El criterio no es memorizar la herramienta, sino poder predecir qué sucede ante duplicados, datos incompletos, concurrencia, pérdida de red o permisos insuficientes. Documenta supuestos y mide antes de optimizar.

**Analogía:** Es como una balanza: todo valor que aparece en un lado debe explicar su contrapartida.

**¿Por qué es importante?** Porque hace auditables el efectivo, pagos, liquidaciones y reversos. En RutaFlow la decisión se valida con una prueba automatizada y una observación operativa, no solo con una captura de pantalla.

**Casos de uso reales:** estudia el flujo normal, un reintento, un dato tardío y un acceso sin permiso. Dibuja primero el flujo y marca dónde puede fallar.

**Diagrama:**

```mermaid
flowchart LR
  A[Entrada] --> B[Regla de dominio]
  B --> C[(Estado durable)]
  C --> D[Evento observable]
  B -->|rechazo explícito| E[Error recuperable]
```

#### Paso 1 · Objetivo y preparación

Al finalizar podrás modelar un ledger de doble partida en PostgreSQL y escribir la consulta que detecta un asiento desbalanceado, usando un ejemplo real de cobro y comisión. **Conocimiento previo:** SQL básico (`GROUP BY`, `HAVING`) y los conceptos de débito/crédito.

#### Paso 2 · Contexto y caso real

**Caso real:** un conductor recauda $25.000 en efectivo por el envío `RF-4471`. De eso, $22.000 son obligación con el comercio y $3.000 son comisión de la plataforma. Si alguien inserta el movimiento de comisión pero olvida el de obligación al comercio, el sistema debe poder detectarlo con una consulta, no confiando en que "nadie se equivocó".

#### Paso 3 · Teoría, conceptos y analogía

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

#### Paso 4 · Demostración guiada desde cero
**Crea** el archivo `ledger.sql` con la tabla `movimientos_contables` y el asiento de ejemplo que ves más abajo, y guárdalo antes de aplicarlo con `psql -f ledger.sql`.

Usa el mismo Postgres de los Temas anteriores:

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
  CHECK (debito = 0 OR credito = 0)
);

-- Asiento 1: se cobra en efectivo la entrega RF-4471 ($25.000)
INSERT INTO movimientos_contables (asiento_id, cuenta, debito, credito, envio_codigo) VALUES
  (1, 'efectivo_conductor',  25000,     0, 'RF-4471'),
  (1, 'obligacion_comercio',     0, 22000, 'RF-4471'),
  (1, 'comision_plataforma',     0,  3000, 'RF-4471');

-- Verificación: todo asiento_id presente en este resultado está desbalanceado
SELECT asiento_id, SUM(debito) AS total_debito, SUM(credito) AS total_credito
FROM movimientos_contables
GROUP BY asiento_id
HAVING SUM(debito) <> SUM(credito);
```

```bash
psql "postgresql://postgres:rutaflow@localhost:5432/postgres" -f ledger.sql
```

**Resultado esperado:** la consulta `HAVING` no devuelve ninguna fila, porque `25000 = 22000 + 3000`: el asiento 1 está balanceado.

**Fallo deliberado:** registra un cobro del envío `RF-5002` sin su contrapartida:

```sql
INSERT INTO movimientos_contables (asiento_id, cuenta, debito, credito, envio_codigo)
VALUES (2, 'efectivo_conductor', 10000, 0, 'RF-5002');
```

Repite la consulta de verificación: ahora devuelve `asiento_id = 2 | total_debito = 10000.00 | total_credito = 0.00`, exponiendo el asiento descuadrado. Diagnóstico: cualquier `asiento_id` que aparezca en esa consulta nunca debe liquidarse ni conciliarse; corrección: insertar el movimiento de contrapartida faltante (`INSERT INTO movimientos_contables (asiento_id, cuenta, debito, credito, envio_codigo) VALUES (2, 'obligacion_comercio', 0, 10000, 'RF-5002');`) y volver a ejecutar la consulta hasta que no devuelva filas.

#### Paso 5 · Práctica guiada

1. Agrega una cuarta cuenta (`impuestos`) al asiento 1 repartiendo los $3.000 de comisión en $2.500 de comisión y $500 de impuestos, sin dejar de balancear.
2. Escribe una consulta que liste los `asiento_id` balanceados (lo opuesto al `HAVING` del Paso 4), usando una subconsulta o un `CTE`.
3. Pista: la restricción `CHECK (debito = 0 OR credito = 0)` impide que una fila sea débito y crédito a la vez, pero no impide que un asiento completo quede descuadrado entre filas; eso solo lo detecta la agregación por `asiento_id`.

#### Paso 6 · Práctica independiente

Implementa una función `registrar_asiento(movimientos[])` (en PL/pgSQL con una transacción explícita, o en Node con una transacción de `pg`) que inserte todos los movimientos de un asiento y haga `ROLLBACK` si `SUM(debito) <> SUM(credito)` antes de confirmar, en vez de insertarlos y detectar el desbalance después.

#### Paso 7 · Cierre, evidencia y proyecto

Entrega `ledger.sql`, la salida vacía de la verificación para el asiento balanceado y la fila expuesta por el asiento 2 desbalanceado. Con los Temas 1, 2 y 3 completos, el **Módulo 2: Backend: envíos, asignación e idempotencia** conecta este modelo de datos, geografía y ledger con el backend real de RutaFlow que los expone como API. **Fuente oficial:** [PostgreSQL — Constraints (CHECK)](https://www.postgresql.org/docs/current/ddl-constraints.html).

**Errores comunes:** confiar en el `CHECK` por fila y asumir que eso ya garantiza el balance del asiento completo; olvidar filtrar por `envio_codigo` al conciliar y mezclar movimientos de distintos envíos; redondear montos antes de sumar en vez de sumar primero y redondear al mostrar.

**Transferencia al proyecto integrador «RutaFlow»:** Registra un cobro con contrapartidas balanceadas y una corrección mediante reverso. Comprueba igualdad de débitos y créditos por asiento y moneda, sin editar movimientos históricos para cuadrar el saldo.

**Límites y decisión de uso:** Que un asiento balancee no demuestra que represente un cobro autorizado o verdadero. Conserva referencia del hecho, moneda e idempotencia y concilia con la fuente externa; no mezcles monedas para forzar una suma cero.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
