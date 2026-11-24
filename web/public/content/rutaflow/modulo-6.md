# Módulo 6: Facturación, recaudo, liquidaciones y fraude


## Aprende construyendo


### Tema 1: Cotización y facturación reproducible · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 1: Cotización y facturación reproducible dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y Java básico (track Java).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[solicitud RF-4471] --> B[tarifa por fecha]
  B --> C[cálculo con BigDecimal<br/>cotización versionada]
  C --> D[factura reproducible]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
mkdir -p rutaflow-labs/tema-1-cotizacion-facturacion
cd rutaflow-labs/tema-1-cotizacion-facturacion
```

```java
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

public class CotizadorEnvio {

    public record Tarifa(BigDecimal valorPorKg, BigDecimal impuesto, LocalDate vigenteDesde, LocalDate vigenteHasta) {}

    private final List<Tarifa> tarifas;

    public CotizadorEnvio(List<Tarifa> tarifas) {
        this.tarifas = tarifas;
    }

    // Elige la tarifa vigente en la fecha de la SOLICITUD, no la fecha actual.
    public BigDecimal cotizar(BigDecimal pesoKg, LocalDate fechaSolicitud) {
        Tarifa vigente = tarifas.stream()
            .filter(t -> !fechaSolicitud.isBefore(t.vigenteDesde()) && !fechaSolicitud.isAfter(t.vigenteHasta()))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("No hay tarifa vigente para " + fechaSolicitud));

        BigDecimal subtotal = vigente.valorPorKg().multiply(pesoKg);
        BigDecimal impuesto = subtotal.multiply(vigente.impuesto());
        return subtotal.add(impuesto).setScale(2, RoundingMode.HALF_UP);
    }

    public static void main(String[] args) {
        Tarifa tarifaMarzo = new Tarifa(new BigDecimal("4309.98"), new BigDecimal("0.19"),
            LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 9));
        Tarifa tarifaNueva = new Tarifa(new BigDecimal("4450.00"), new BigDecimal("0.19"),
            LocalDate.of(2026, 3, 10), LocalDate.of(2026, 12, 31));

        CotizadorEnvio cotizador = new CotizadorEnvio(List.of(tarifaMarzo, tarifaNueva));

        // La factura del 12 de marzo para el envio RF-4471 debe usar la tarifa
        // vigente el 3 de marzo (fecha de la cotizacion original), no la nueva.
        BigDecimal total = cotizador.cotizar(new BigDecimal("25.0"), LocalDate.of(2026, 3, 3));
        System.out.println("RF-4471 total=" + total);
    }
}
```

```bash
javac CotizadorEnvio.java
java CotizadorEnvio
```

```java
// FALLO: usar double en vez de BigDecimal para dinero
double valorPorKgFalloso = 4309.98;
double pesoKgFalloso = 25.0;
double impuestoFalloso = 0.19;
double subtotalFalloso = valorPorKgFalloso * pesoKgFalloso;       // 107749.49999999999, no 107749.50 exacto
double totalFalloso = subtotalFalloso + subtotalFalloso * impuestoFalloso;
System.out.printf("RF-4471 total (double)=%.2f%n", totalFalloso); // imprime 128221.90
```

</details>

### Tema 2: Recaudo, liquidación y conciliación · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 2: Recaudo, liquidación y conciliación dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git, Java básico (track Java) y el SQL con PostgreSQL del Módulo…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[Recaudo reportado por el conductor] --> C{Coincide con la factura del sistema?}
  B[Monto facturado por el sistema] --> C
  C -->|Si| D[Liquidacion cerrada sin ajuste]
  C -->|No| E[Nuevo movimiento de ajuste compensatorio]
  E --> F[Movimiento original queda intacto]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[Recaudo reportado por el conductor] --> C{Coincide con la factura del sistema?}
  B[Monto facturado por el sistema] --> C
  C -->|Si| D[Liquidacion cerrada sin ajuste]
  C -->|No| E[Nuevo movimiento de ajuste compensatorio]
  E --> F[Movimiento original queda intacto]
```

```bash
mkdir -p rutaflow-labs/tema-2-recaudo-liquidacion-conciliacion
cd rutaflow-labs/tema-2-recaudo-liquidacion-conciliacion
```

```sql
CREATE TABLE recaudo_movimiento (
    id BIGSERIAL PRIMARY KEY,
    envio_id TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('recaudo', 'ajuste_compensatorio')),
    monto NUMERIC(12,2) NOT NULL,
    referencia_movimiento_id BIGINT REFERENCES recaudo_movimiento(id),
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Turno de Ana para RF-4471: reporta 120.000, el sistema facturo 135.000.
INSERT INTO recaudo_movimiento (envio_id, tipo, monto) VALUES ('RF-4471', 'recaudo', 120000.00);
```

```java
import java.math.BigDecimal;
import java.util.Optional;

public class ConciliadorRecaudo {

    public record Recaudo(String envioId, long movimientoOriginalId, BigDecimal montoReportado, BigDecimal montoFacturado) {}

    public Optional<BigDecimal> detectarDiscrepancia(Recaudo recaudo) {
        BigDecimal diferencia = recaudo.montoFacturado().subtract(recaudo.montoReportado());
        return diferencia.compareTo(BigDecimal.ZERO) != 0 ? Optional.of(diferencia) : Optional.empty();
    }

    // Nunca editamos recaudo_movimiento: insertamos un ajuste que referencia al original.
    public String construirAjusteCompensatorio(Recaudo recaudo, BigDecimal diferencia) {
        return "INSERT INTO recaudo_movimiento (envio_id, tipo, monto, referencia_movimiento_id) "
            + "VALUES ('" + recaudo.envioId() + "', 'ajuste_compensatorio', " + diferencia
            + ", " + recaudo.movimientoOriginalId() + ");";
    }

    public static void main(String[] args) {
        ConciliadorRecaudo conciliador = new ConciliadorRecaudo();
        Recaudo turnoAna = new Recaudo("RF-4471", 1L, new BigDecimal("120000.00"), new BigDecimal("135000.00"));
        conciliador.detectarDiscrepancia(turnoAna)
            .ifPresent(diferencia -> System.out.println(conciliador.construirAjusteCompensatorio(turnoAna, diferencia)));
    }
}
```

```bash
psql "postgresql://postgres:rutaflow@localhost:5432/postgres" -v ON_ERROR_STOP=1 -f recaudo.sql
java ConciliadorRecaudo.java
```

```sql
UPDATE recaudo_movimiento
SET monto = 135000.00
WHERE envio_id = 'RF-4471' AND tipo = 'recaudo';
```

</details>

### Tema 3: Fraude responsable · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 3: Fraude responsable dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y Java básico (track Java).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A[Confirmacion de entrega con GPS] --> B[Calcular distancia a la direccion registrada]
  B --> C{Distancia mayor a 500 m?}
  C -->|No| D[Entrega confirmada automaticamente]
  C -->|Si| E[Caso encolado para revision humana]
  E --> F[Un analista aprueba o revierte, nunca el sistema solo]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A[Confirmacion de entrega con GPS] --> B[Calcular distancia a la direccion registrada]
  B --> C{Distancia mayor a 500 m?}
  C -->|No| D[Entrega confirmada automaticamente]
  C -->|Si| E[Caso encolado para revision humana]
  E --> F[Un analista aprueba o revierte, nunca el sistema solo]
```

```bash
mkdir -p rutaflow-labs/tema-3-fraude-responsable
cd rutaflow-labs/tema-3-fraude-responsable
```

```java
import java.util.Optional;

public class DetectorSenalFraude {

    private static final double UMBRAL_METROS = 500.0;

    public record Coordenada(double lat, double lon) {}

    public double distanciaMetros(Coordenada a, Coordenada b) {
        double dLat = Math.toRadians(b.lat() - a.lat());
        double dLon = Math.toRadians(b.lon() - a.lon());
        double radioTierraMetros = 6371000;
        double parcial = Math.pow(Math.sin(dLat / 2), 2)
            + Math.cos(Math.toRadians(a.lat())) * Math.cos(Math.toRadians(b.lat()))
            * Math.pow(Math.sin(dLon / 2), 2);
        double angulo = 2 * Math.atan2(Math.sqrt(parcial), Math.sqrt(1 - parcial));
        return radioTierraMetros * angulo;
    }

    // La senal SOLO encola para revision humana; nunca decide el estado final.
    public Optional<String> evaluarEnvio(String envioId, Coordenada confirmacionGps, Coordenada direccionRegistrada) {
        double distancia = distanciaMetros(confirmacionGps, direccionRegistrada);
        if (distancia > UMBRAL_METROS) {
            return Optional.of("Envio " + envioId + " encolado para revision humana: GPS a "
                + Math.round(distancia) + " m de la direccion registrada");
        }
        return Optional.empty();
    }

    public static void main(String[] args) {
        DetectorSenalFraude detector = new DetectorSenalFraude();
        // Caso de Carlos: entrega legitima, edificio sin acceso vehicular.
        Coordenada direccionRegistrada = new Coordenada(4.6730, -74.0480);
        Coordenada confirmacionGps = new Coordenada(4.6780, -74.0480);
        System.out.println(detector.evaluarEnvio("RF-7788", confirmacionGps, direccionRegistrada)
            .orElse("Sin senal: distancia dentro del umbral"));
    }
}
```

```java
public EstadoEnvio evaluarEnvioAutoBloqueo(String envioId, Coordenada confirmacionGps, Coordenada direccionRegistrada) {
    double distancia = distanciaMetros(confirmacionGps, direccionRegistrada);
    if (distancia > UMBRAL_METROS) {
        return EstadoEnvio.RECHAZADO_POR_FRAUDE; // cancela la entrega sin revision humana
    }
    return EstadoEnvio.CONFIRMADO;
}
```

</details>

### Tema 4: Tokenización de pagos: un identificador opaco no sustituye autorización ni confirmación · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar definirás una frontera de cobro que recibe un identificador de prueba y un importe entero, sin recoger datos de tarjeta. Prerrequisitos: contratos, validación, dinero en unidades menores e idempotencia; Node 24. Ejemplo independiente desde carpeta vacía. No se proces…

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    U["App o navegador"] --> A["Captura de datos sensibles"]
    A --> P["Componente del proveedor"]
    P --> R["Referencia opaca pm_test_..."]
    R --> S["Servidor de RutaFlow"]
    S --> V{"¿Cliente, pedido, importe, moneda e idempotencia válidos?"}
    V -->|"sí"| C["Solicitar confirmación al proveedor"]
    V -->|"no"| E["Rechazar sin cobrar"]
    C --> W["Verificar webhook auténtico"]
    W --> O["Marcar el pedido como pagado"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    U["App o navegador"] --> A["Captura de datos sensibles"]
    A --> P["Componente del proveedor"]
    P --> R["Referencia opaca pm_test_..."]
    R --> S["Servidor de RutaFlow"]
    S --> V{"¿Cliente, pedido, importe, moneda e idempotencia válidos?"}
    V -->|"sí"| C["Solicitar confirmación al proveedor"]
    V -->|"no"| E["Rechazar sin cobrar"]
    C --> W["Verificar webhook auténtico"]
    W --> O["Marcar el pedido como pagado"]
```

```bash
mkdir ejemplo-pagos && cd ejemplo-pagos
node --test contrato.test.mjs
```

```javascript
export function prepararCobro({ paymentMethodId, amountCents, currency }) {
  if (typeof paymentMethodId !== 'string' || !/^pm_test_[a-z0-9]+$/.test(paymentMethodId)) {
    throw new TypeError('Se requiere un identificador opaco del proveedor de prueba');
  }
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || currency !== 'COP') {
    throw new TypeError('Importe o moneda inválidos');
  }
  // Un ID de método de pago no autoriza por sí solo una operación.
  return { paymentMethodId, amountCents, currency };
}
```

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { prepararCobro } from './contrato.mjs';
test('solo acepta un identificador de prueba, sin datos de tarjeta', () => {
  const body = prepararCobro({ paymentMethodId: 'pm_test_abc', amountCents: 10000, currency: 'COP' });
  assert.deepEqual(Object.keys(body).sort(), ['amountCents', 'currency', 'paymentMethodId']);
  assert.throws(() => prepararCobro({ paymentMethodId: 'numero-de-tarjeta', amountCents: 10000, currency: 'COP' }));
});
test('no transforma silenciosamente el importe', () => {
  assert.throws(() => prepararCobro({ paymentMethodId: 'pm_test_abc', amountCents: 10.5, currency: 'COP' }));
});
```

</details>
