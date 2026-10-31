# Módulo 6: Facturación, recaudo, liquidaciones y fraude


## Aprende construyendo

### Tema 1: Cotización y facturación reproducible

**Conceptos clave:** Money, moneda, redondeo, vigencia, impuestos y versiones.

Money combina entero en unidad menor y moneda; nunca float. La cotización guarda tarifa, versión, entradas y desglose. El cambio de tarifa crea nueva vigencia. Impuestos dependen de jurisdicción y fecha, por lo que el motor recibe política explícita. El criterio no es memorizar la herramienta, sino poder predecir qué sucede ante duplicados, datos incompletos, concurrencia, pérdida de red o permisos insuficientes. Documenta supuestos y mide antes de optimizar.

**Analogía:** Es como un tiquete conserva fecha y tarifa aunque el precio cambie mañana.

**¿Por qué es importante?** Porque soporte y auditoría pueden reproducir cada cobro. En RutaFlow la decisión se valida con una prueba automatizada y una observación operativa, no solo con una captura de pantalla.

**Casos de uso reales:** estudia el flujo normal, un reintento, un dato tardío y un acceso sin permiso. Dibuja primero el flujo y marca dónde puede fallar.

#### Paso 1 · Objetivo y preparación

Al finalizar podrás construir y verificar **Tema 1: Cotización y facturación reproducible** dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. **Conocimiento previo:** terminal, Git y lectura de JSON.

#### Paso 2 · Contexto y caso real

**Caso real:** un cliente pide cotización para el envío RF-4471 el 3 de marzo, bajo la tarifa vigente ese día. El 10 de marzo la tarifa cambia. Si la factura se emite el 12 de marzo, debe reflejar la tarifa del 3 de marzo —la fecha de la cotización—, no la nueva. El sistema necesita conservar la vigencia exacta de cada tarifa para poder reconstruir ese cálculo meses después, ante un reclamo o una auditoría.

#### Paso 3 · Teoría, conceptos y analogía

Piensa este tema no como una estación de clasificación genérica, sino como una caja registradora que jamás puede dar un resultado distinto para la misma venta. Cada tarifa tiene una fecha de inicio y una de fin de vigencia; cotizar es elegir la tarifa correcta para la fecha de la operación, no la tarifa de hoy. Si el cálculo usa `double` para sumar dinero, ya perdió la capacidad de ser auditado: el error de redondeo es silencioso y se acumula sin avisar.

```mermaid
flowchart LR
  A[solicitud RF-4471] --> B[tarifa por fecha]
  B --> C[cálculo con BigDecimal<br/>cotización versionada]
  C --> D[factura reproducible]
```

#### Paso 4 · Demostración guiada desde cero

Crea una carpeta independiente para comprobar el concepto antes de conectarlo al monorepo. Después crea `CotizadorEnvio.java`:

```bash
mkdir -p rutaflow-labs/tema-1-cotizacion-facturacion
cd rutaflow-labs/tema-1-cotizacion-facturacion
```

**Ejecuta el ejemplo** (según la capa: backend con `./mvnw test`, app con `flutter run`):

```bash
./mvnw test
```
Confirma el resultado contra el criterio del paso.


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

Compílalo y ejecútalo:

```bash
javac CotizadorEnvio.java
java CotizadorEnvio
```

**Resultado esperado:** `RF-4471 total=128221.91` (`4309.98 × 25 × 1.19`, redondeado con escala fija a 2 decimales con `HALF_UP`), sin importar cuándo corras el programa ni si la tarifa de marzo ya fue reemplazada por la nueva.

**Fallo deliberado:** repite el mismo cálculo (mismo `valorPorKg`, mismo peso, mismo impuesto) pero con `double` en vez de `BigDecimal`:

```java
// FALLO: usar double en vez de BigDecimal para dinero
double valorPorKgFalloso = 4309.98;
double pesoKgFalloso = 25.0;
double impuestoFalloso = 0.19;
double subtotalFalloso = valorPorKgFalloso * pesoKgFalloso;       // 107749.49999999999, no 107749.50 exacto
double totalFalloso = subtotalFalloso + subtotalFalloso * impuestoFalloso;
System.out.printf("RF-4471 total (double)=%.2f%n", totalFalloso); // imprime 128221.90
```

El valor correcto es `$128.221,91` (eso es lo que calculó `BigDecimal`), pero la representación binaria de `4309.98` y `25.0` no es exacta: el subtotal queda en `107749.49999999999` en vez de `107749.50`, y ese error minúsculo empuja el total final a `128221.90499999998` —justo debajo del punto donde debería redondear hacia `.91`. El programa imprime `128221.90`: un centavo menos, en una sola operación. Individualmente insignificante, pero multiplicado por miles de guías al mes es un sesgo sistemático e imposible de rastrear transacción por transacción. Diagnostica comparando contra el resultado de `BigDecimal` con el mismo input; corrige volviendo a `BigDecimal` con `setScale(2, RoundingMode.HALF_UP)` en cada operación monetaria, nunca `double` ni `float`.

#### Paso 5 · Práctica guiada

1. Agrega una segunda tarifa con una vigencia distinta y verifica que `cotizar` elija la tarifa correcta según la **fecha de la solicitud**, no la tarifa más reciente.
2. Haz que `cotizar` lance una excepción explícita cuando la fecha no cae en ninguna vigencia, en vez de usar silenciosamente la tarifa más cercana.
3. Pista: nunca uses `double` para sumar o multiplicar dinero; si el peso o la tarifa llegan como texto (JSON), conviértelos directo a `BigDecimal`, nunca pasando por `double`.

#### Paso 6 · Práctica independiente

Implementa `CotizadorEnvio` con al menos dos tarifas de vigencias distintas, un método `cotizar(pesoKg, fechaSolicitud)` que seleccione la tarifa por rango de fechas y calcule con `BigDecimal` y escala fija, y una prueba que demuestre que una cotización de hace un mes sigue dando el mismo resultado aunque la tarifa actual ya cambió. No copies la solución del paso anterior; escribe primero el contrato (qué tarifa debería ganar en cada caso) y después el código.

#### Paso 7 · Cierre y proyecto

Entrega `CotizadorEnvio.java`, la salida reproducible para RF-4471, la comparación `BigDecimal` contra `double` del fallo deliberado y una breve explicación de por qué el redondeo de punto flotante es inaceptable en dinero. El siguiente tema (**Tema 2: Recaudo, liquidación y conciliación**) toma esta cotización reproducible como el monto que debe conciliarse contra lo efectivamente recaudado en efectivo o por pago electrónico. **Fuente oficial:** [BigDecimal — Java SE documentation](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/math/BigDecimal.html).

**Errores comunes:** usar `double` o `float` para cualquier monto; comparar fechas de vigencia con `<`/`>` en vez de `isBefore`/`isAfter` (error de límite en los bordes del rango); olvidar fijar la escala y el modo de redondeo antes de persistir o mostrar el total; recalcular con la tarifa de "hoy" en vez de la tarifa vigente en la fecha de la cotización original.

**Transferencia al proyecto integrador «RutaFlow»:** Versiona la tarifa usada al cotizar y conserva sus entradas. Recalcula una cotización histórica después de cambiar precios y comprueba que sigue explicándose con la versión original.

### Tema 2: Recaudo, liquidación y conciliación

**Conceptos clave:** doble partida, efectivo contra entrega, pagos, settlement, reversos y diferencias.

Cobrar efectivo aumenta caja del conductor y obligación a entregar; liquidar mueve ambas cuentas. Un pago electrónico cruza procesador, banco y ledger interno. Conciliación compara fuentes por referencia, monto, moneda y ventana; las diferencias entran a una cola, no se eliminan. El criterio no es memorizar la herramienta, sino poder predecir qué sucede ante duplicados, datos incompletos, concurrencia, pérdida de red o permisos insuficientes. Documenta supuestos y mide antes de optimizar.

**Analogía:** Es como cerrar caja: el total esperado y el contado se comparan y toda diferencia se investiga.

**¿Por qué es importante?** Porque separa el movimiento real de la representación contable. En RutaFlow la decisión se valida con una prueba automatizada y una observación operativa, no solo con una captura de pantalla.

**Casos de uso reales:** estudia el flujo normal, un reintento, un dato tardío y un acceso sin permiso. Dibuja primero el flujo y marca dónde puede fallar.

#### Paso 1 · Objetivo y preparación

Al finalizar podrás construir y verificar **Tema 2: Recaudo, liquidación y conciliación** dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. **Conocimiento previo:** terminal, Git y lectura de JSON.

#### Paso 2 · Contexto y caso real

**Caso real:** el conductor Ana reporta haber recaudado $120.000 en efectivo durante su turno del 5 de marzo para el envío RF-4471, pero el sistema registra que las facturas de contraentrega de ese turno suman $135.000. La diferencia de $15.000 debe quedar visible en una cola de discrepancias —nunca restada en silencio del saldo de Ana ni "corregida" sobre el registro original.

#### Paso 3 · Teoría, conceptos y analogía

Piensa este tema como un libro contable de doble entrada: cada recaudo reportado y cada factura del sistema son hechos independientes que ya ocurrieron y no pueden reescribirse. Si aparece una diferencia, el libro no borra la página anterior —agrega una página nueva que explica y compensa la diferencia. Esa es la única forma de que, meses después, alguien pueda reconstruir exactamente qué pasó.

```mermaid
flowchart LR
  A[Recaudo reportado por el conductor] --> C{Coincide con la factura del sistema?}
  B[Monto facturado por el sistema] --> C
  C -->|Si| D[Liquidacion cerrada sin ajuste]
  C -->|No| E[Nuevo movimiento de ajuste compensatorio]
  E --> F[Movimiento original queda intacto]
```

#### Paso 4 · Demostración guiada desde cero
**Crea** el archivo `ConciliadorRecaudo.java` con la clase que ves más abajo, y guárdalo antes de ejecutarlo con `./mvnw test`.

Crea una carpeta independiente para comprobar el concepto antes de conectarlo al monorepo:

```bash
mkdir -p rutaflow-labs/tema-2-recaudo-liquidacion-conciliacion
cd rutaflow-labs/tema-2-recaudo-liquidacion-conciliacion
```

**Ejecuta el ejemplo** (según la capa: backend con `./mvnw test`, app con `flutter run`):

```bash
./mvnw test
```
Confirma el resultado contra el criterio del paso.


Primero el esquema PostgreSQL: una tabla de movimientos **append-only**, donde un ajuste siempre referencia al movimiento que corrige:

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

Y la lógica de conciliación en Java, que detecta la discrepancia y registra el ajuste **sin tocar el movimiento original**:

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
        Recaudo turnoAna = new Recaudo("RF-4471", 501L, new BigDecimal("120000.00"), new BigDecimal("135000.00"));
        conciliador.detectarDiscrepancia(turnoAna)
            .ifPresent(diferencia -> System.out.println(conciliador.construirAjusteCompensatorio(turnoAna, diferencia)));
    }
}
```

**Resultado esperado:** el programa imprime `INSERT INTO recaudo_movimiento (envio_id, tipo, monto, referencia_movimiento_id) VALUES ('RF-4471', 'ajuste_compensatorio', 15000.00, 501);` — una fila **nueva** que referencia a la fila original (id 501, el recaudo de $120.000), que sigue existiendo sin cambios.

**Fallo deliberado:** en vez de insertar el ajuste, "corrige" el movimiento original directamente:

```sql
UPDATE recaudo_movimiento
SET monto = 135000.00
WHERE envio_id = 'RF-4471' AND tipo = 'recaudo';
```

Ejecuta `SELECT * FROM recaudo_movimiento WHERE envio_id = 'RF-4471'` después de esto: la fila ahora dice que Ana reportó $135.000 desde el principio —la discrepancia de $15.000 desapareció del historial por completo, como si nunca hubiera existido. Cualquier auditoría posterior que sume `recaudo` por conductor verá los totales cuadrados y nunca sabrá que hubo que investigar una diferencia, que es exactamente el comportamiento que permitiría ocultar un fraude real. Diagnostica comparando contra un respaldo o un log de la aplicación (la tabla misma ya no tiene la evidencia); corrige revirtiendo el `UPDATE` e insertando en su lugar el `ajuste_compensatorio` de $15.000 referenciando la fila original, que nunca debió modificarse.

#### Paso 5 · Práctica guiada

1. Agrega una ventana de liquidación (`periodo_inicio`, `periodo_fin`) y agrupa los movimientos por conductor y ventana antes de comparar `recaudo` contra facturación.
2. Si el conductor reportó **más** de lo que el sistema facturó (sobrante, no faltante), registra el ajuste con signo contrario para que el saldo neto de la ventana quede en cero.
3. Pista: ninguna consulta de cierre de turno debe usar `UPDATE` ni `DELETE` sobre `recaudo_movimiento`; toda corrección es un `INSERT` nuevo con `referencia_movimiento_id`.

#### Paso 6 · Práctica independiente

Implementa `ConciliadorRecaudo` completo: agrupa movimientos por `envio_id` y ventana de liquidación, detecta discrepancias con `BigDecimal` (nunca `double`) y genera el `INSERT` de ajuste compensatorio sin mutar ninguna fila existente. Escribe una prueba que, tras aplicar el ajuste, verifique que la fila original de $120.000 sigue intacta y que la suma de `recaudo` + `ajuste_compensatorio` para RF-4471 ahora coincide con los $135.000 facturados. No copies la solución del paso anterior; escribe primero el contrato (qué fila no debe cambiar nunca) y después el código.

#### Paso 7 · Cierre y proyecto

Entrega el esquema SQL, `ConciliadorRecaudo.java`, la secuencia del fallo deliberado (el `UPDATE` que borra la evidencia) y la corrección con el `INSERT` compensatorio. El siguiente tema (**Tema 3: Fraude responsable**) usa esta misma cola de discrepancias como una de las señales que alimentan la puntuación de revisión: una diferencia de recaudo repetida en el mismo conductor es justamente el tipo de patrón que el modelo de fraude debe marcar para revisión humana, nunca para bloqueo automático. **Fuente oficial:** [PostgreSQL — Numeric Types](https://www.postgresql.org/docs/current/datatype-numeric.html).

**Errores comunes:** usar `UPDATE`/`DELETE` sobre un movimiento histórico para "corregir" una diferencia; comparar montos con `double` en vez de `NUMERIC`/`BigDecimal`; omitir `referencia_movimiento_id` y perder la trazabilidad entre el ajuste y el movimiento que corrige; conciliar sin fijar una ventana de liquidación clara, mezclando turnos distintos.

**Transferencia al proyecto integrador «RutaFlow»:** Concilia cobros del conductor con movimientos registrados y reporta diferencias identificables. Prueba un pago repetido y uno ausente; el proceso debe generar una revisión sin corregir saldos a mano.

### Tema 3: Fraude responsable

**Conceptos clave:** señales, reglas, modelos, explicabilidad, revisión, sesgo y privacidad.

Velocidad imposible, evidencia repetida o concentración de reversos son señales, no culpabilidad. Una puntuación prioriza revisión y registra factores. Bloquear automáticamente por un GPS impreciso puede perjudicar zonas rurales. Se miden falsos positivos por segmento y existe apelación. El criterio no es memorizar la herramienta, sino poder predecir qué sucede ante duplicados, datos incompletos, concurrencia, pérdida de red o permisos insuficientes. Documenta supuestos y mide antes de optimizar.

**Analogía:** Es como una alarma de humo solicita inspección; no condena el edificio.

**¿Por qué es importante?** Porque reduce pérdidas sin convertir correlaciones defectuosas en decisiones irreversibles. En RutaFlow la decisión se valida con una prueba automatizada y una observación operativa, no solo con una captura de pantalla.

**Casos de uso reales:** estudia el flujo normal, un reintento, un dato tardío y un acceso sin permiso. Dibuja primero el flujo y marca dónde puede fallar.

#### Paso 1 · Objetivo y preparación

Al finalizar podrás construir y verificar **Tema 3: Fraude responsable** dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. **Conocimiento previo:** terminal, Git y lectura de JSON.

#### Paso 2 · Contexto y caso real

**Caso real:** el conductor Carlos confirma la entrega del envío RF-7788 a unos 556 metros de la dirección registrada, porque el edificio no tiene acceso vehicular y el cliente bajó a la avenida principal a recibirlo. Una regla que bloquea automáticamente por distancia marcaría esta entrega legítima como fraude y le retendría el pago a Carlos por un patrón perfectamente normal en esa zona.

#### Paso 3 · Teoría, conceptos y analogía

Piensa este tema como una alarma de humo, no como un veredicto: la alarma solicita inspección, no condena el edificio. Una señal de fraude (distancia GPS, velocidad imposible, reversos repetidos) prioriza un caso en una cola para que una persona lo revise con contexto completo; nunca cambia por sí misma el estado final de la entrega. Si un sistema automatizado tiene el poder de bloquear sin revisión humana, cualquier señal ruidosa —y el GPS siempre es ruidoso— se convierte en una decisión irreversible contra alguien inocente.

```mermaid
flowchart LR
  A[Confirmacion de entrega con GPS] --> B[Calcular distancia a la direccion registrada]
  B --> C{Distancia mayor a 500 m?}
  C -->|No| D[Entrega confirmada automaticamente]
  C -->|Si| E[Caso encolado para revision humana]
  E --> F[Un analista aprueba o revierte, nunca el sistema solo]
```

#### Paso 4 · Demostración guiada desde cero

Crea una carpeta independiente para comprobar el concepto antes de conectarlo al monorepo. Después crea `DetectorSenalFraude.java`:

```bash
mkdir -p rutaflow-labs/tema-3-fraude-responsable
cd rutaflow-labs/tema-3-fraude-responsable
```

**Ejecuta el ejemplo** (según la capa: backend con `./mvnw test`, app con `flutter run`):

```bash
./mvnw test
```
Confirma el resultado contra el criterio del paso.


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

**Resultado esperado:** el programa imprime `Envio RF-7788 encolado para revision humana: GPS a 556 m de la direccion registrada` — el caso queda marcado para que un analista lo revise con contexto (zona, hora, historial del conductor), pero la entrega **no** se bloquea ni se cancela automáticamente.

**Fallo deliberado:** reemplaza `evaluarEnvio` por una versión que decide sola, sin cola de revisión:

```java
public EstadoEnvio evaluarEnvioAutoBloqueo(String envioId, Coordenada confirmacionGps, Coordenada direccionRegistrada) {
    double distancia = distanciaMetros(confirmacionGps, direccionRegistrada);
    if (distancia > UMBRAL_METROS) {
        return EstadoEnvio.RECHAZADO_POR_FRAUDE; // cancela la entrega sin revision humana
    }
    return EstadoEnvio.CONFIRMADO;
}
```

Corre este método con el mismo caso de Carlos (RF-7788, 556 m): devuelve `RECHAZADO_POR_FRAUDE` de forma automática. La entrega de Carlos era legítima —el edificio simplemente no tiene acceso vehicular— pero el sistema ya tomó la decisión final sin que nadie la revisara: a Carlos se le retiene el pago y al cliente se le cancela una entrega que sí ocurrió, solo porque una sola señal de distancia superó el umbral. Diagnostica identificando que el error no está en el cálculo de distancia (es correcto) sino en que una señal automatizada obtuvo poder de decisión final; corrige volviendo a la versión que solo devuelve `Optional<String>` para encolar el caso, nunca un `EstadoEnvio` terminal.

#### Paso 5 · Práctica guiada

1. Agrega un segundo umbral (por ejemplo, 1000 m) que marque el caso con prioridad alta en la cola, sin que eso cambie que la decisión final la tome siempre un humano.
2. Registra en el caso encolado la distancia exacta y la hora de la confirmación, para que el analista tenga contexto real y no solo un booleano de "sospechoso/no sospechoso".
3. Pista: ninguna señal automatizada —ni esta ni ninguna futura que agregues— debe poder cambiar `EstadoEnvio` a un estado terminal (`CONFIRMADO`/`RECHAZADO_POR_FRAUDE`) sin pasar por revisión humana.

#### Paso 6 · Práctica independiente

Implementa `DetectorSenalFraude` completo con al menos dos señales (distancia GPS y, por ejemplo, reversos repetidos del mismo conductor en 24 horas), que combine ambas en una prioridad de cola sin que ninguna, ni juntas, bloqueen la entrega automáticamente. Escribe un caso de prueba con el escenario de Carlos (falso positivo por GPS) y verifica que el resultado sea "encolado para revisión", nunca un estado terminal. No copies la solución del paso anterior; escribe primero el contrato (qué puede decidir el sistema y qué debe decidir siempre una persona) y después el código.

#### Paso 7 · Cierre y proyecto

Entrega `DetectorSenalFraude.java`, el caso encolado real para RF-7788, la versión de auto-bloqueo del fallo deliberado y una breve explicación de por qué ninguna señal automatizada debe decidir sola. El siguiente módulo (**Módulo 7: Producción — Tema 1: Infraestructura y entrega segura**) retoma esta misma disciplina: ninguna automatización del pipeline o de la operación debe tener poder de decisión final sin evidencia y, cuando aplica, sin revisión humana. **Fuente oficial:** [GDPR — Artículo 22: decisiones individuales automatizadas](https://gdpr-info.eu/art-22-gdpr/).

**Errores comunes:** dejar que una señal automatizada escriba un `EstadoEnvio` terminal; usar un solo umbral sin registrar la distancia real para el analista; tratar la señal como culpabilidad en vez de como prioridad de revisión; no versionar el umbral, perdiendo la capacidad de explicar por qué un caso viejo se marcó y uno nuevo no.

**Transferencia al proyecto integrador «RutaFlow»:** Genera una señal de revisión a partir de datos sintéticos y conserva su explicación. Evalúa falsos positivos y limita acceso a la información; una sospecha no debe cancelar automáticamente una entrega legítima.

**Límites y decisión de uso:** Una puntuación de riesgo no prueba fraude y puede perjudicar a usuarios legítimos. Evalúa errores por grupos relevantes, conserva revisión humana y limita los datos usados; no conviertas una señal incierta en sanción automática.


## Aplicación del material de referencia

### Tema 4: Tokenización de pagos: un identificador opaco no sustituye autorización ni confirmación

#### Paso 1 · Objetivo y preparación
Al finalizar definirás una frontera de cobro que recibe un identificador de prueba y un importe entero, sin recoger datos de tarjeta. **Prerrequisitos:** contratos, validación, dinero en unidades menores e idempotencia; Node 24. Ejemplo independiente desde carpeta vacía. No se procesan pagos ni se llama a un proveedor.

#### Paso 2 · Contexto y caso real
Una captura afirma que un token robado no sirve para nada. Esa afirmación necesita contexto: hay tokens utilizables bajo determinadas credenciales y alcances. **¿Por qué es importante?** El proyecto integrador no debe inferir que poseer un identificador de pago autoriza a cobrar a cualquier cliente.

#### Paso 3 · Teoría, modelo mental y analogía
La integración de bajo riesgo recoge datos sensibles mediante componentes del proveedor y devuelve referencias opacas. Un método de pago es distinto de un JWT de sesión y distinto del estado confirmado de una operación. El servidor verifica cliente, pedido, importe, moneda, idempotencia y resultado auténtico del proveedor.

**Analogía:** una ficha de guardarropa apunta a un objeto, pero no reemplaza todas las comprobaciones para entregarlo. El límite es que el proveedor define alcance, reutilización y requisitos de cada referencia. Usar tokenización no certifica automáticamente cumplimiento ni elimina obligaciones de seguridad.

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero
```bash
cp -R examples/rutaflow-material/payments ejemplo-pagos
cd ejemplo-pagos
node --test contrato.test.mjs
```
Para crear el ejemplo manualmente, guarda estos dos archivos juntos, sin `payments/`:

Crea `payments/contrato.mjs` con este contenido completo:
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

Crea `payments/contrato.test.mjs` con este contenido completo:
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

**Resultado esperado:** dos pruebas correctas. Explica cada bloque: solo admitimos IDs ficticios `pm_test_...`, el importe es entero positivo y la salida no contiene PAN ni CVV. Documenta el contrato en `payments/README.md`: formato del identificador, moneda admitida y campos prohibidos. Este patrón es un contrato didáctico; no afirma que el prefijo sea una credencial real o que una expresión regular proteja pagos.

#### Paso 5 · Práctica guiada
**Fallo deliberado:** sustituye `Number.isSafeInteger` por una comprobación que acepta cualquier número positivo. El test de 10.5 deja de ser rechazado y falla. **Pista:** las unidades son parte del contrato; convertir sin una regla de redondeo puede cambiar el importe.

#### Paso 6 · Práctica independiente
Añade ID de pedido y una clave de idempotencia vinculada a cliente, pedido, importe y moneda. Diseña pruebas de reintento y de acceso a un pedido ajeno. Describe cómo verificarías el webhook del proveedor sin usar el identificador opaco como prueba de pago confirmado.

#### Paso 7 · Cierre
El siguiente paso requiere sandbox del proveedor y verificación de webhooks; no se presenta como ejecutado. **Errores comunes:** registrar datos de tarjeta, tratar token como autorización y confirmar el pedido solo por una respuesta del navegador. **Límites y decisión de uso:** el ejemplo no implementa tokenización criptográfica, vault, cobros reales ni certificación PCI.

**Fuente oficial:** [guía de seguridad de integración de Stripe](https://docs.stripe.com/security/guide).
