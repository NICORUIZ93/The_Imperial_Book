# Módulo 17: Consistencia, contratos y operación distribuida

Cubre sagas, consistencia eventual, contratos, versionado y operación distribuida.

**Entorno (2026-05-22):** JDK 27. Patrones distribuidos requieren múltiples servicios/infra.

## Aprende construyendo

### Tema 1: Consistencia eventual y sagas · Avanzado · 45 min
#### Saga
**Definición formal.** Secuencia de transacciones locales coordinadas por eventos/comandos con compensaciones ante fallo.
**Para qué sirve.** Consistencia de negocio sin transacción distribuida 2PC.
**Cuándo usarlo.** Flujos cross-service.
**Ejemplo mínimo enfocado (ejecutable simulación).**
```bash
mkdir -p /tmp/sb17-saga && cd /tmp/sb17-saga
cat > DemoSaga.java << 'JAVA'
public class DemoSaga { static boolean pago(){ return false; } static void compensarReserva(){ System.out.println("compensar"); }
  public static void main(String[] args){ System.out.println("reservar"); if(!pago()) compensarReserva(); } }
JAVA
javac DemoSaga.java && java DemoSaga
```
**Caso de uso real.** Reserva->Pago->Envío con compensación.
**Error común.** No definir compensaciones. Corrección: diseñar pasos reversibles.
**Verificación (JDK 27, 2026-05-22).** Salida: `reservar`, `compensar`.

#### Consistencia eventual
**Definición formal.** Modelo donde las réplicas/servicios convergen a un estado consistente con el tiempo, no inmediatamente.
**Para qué sirve.** Escalabilidad/disponibilidad.
**Cuándo usarlo.** Cuando la latencia de convergencia es aceptable.
**Ejemplo mínimo enfocado.** evento procesado luego, UI muestra estado pendiente.
**Caso de uso real.** Inventario actualizado tras evento.
**Error común.** Prometer consistencia inmediata. Corrección: hacer visible el estado.
**Verificación.** **Nota:** conceptual/operacional.

### Tema 2: Contratos de API y compatibilidad · Avanzado · 45 min
#### Contract testing
**Definición formal.** Pruebas que verifican que proveedor y consumidor cumplen un contrato acordado.
**Para qué sirve.** Evitar rupturas entre servicios.
**Cuándo usarlo.** Integraciones inter-equipos.
**Ejemplo mínimo enfocado (conceptual).** Pact/Spring Cloud Contract.
**Caso de uso real.** Consumer espera `id:string`.
**Error común.** Cambiar response sin avisar. Corrección: versionado + contract tests.
**Verificación.** **Nota:** requiere tooling.

### Tema 3: Operación distribuida: idempotencia, retries, DLQ · Avanzado · 45 min
#### Idempotency key
**Definición formal.** Clave que identifica una operación para evitar efectos duplicados.
**Para qué sirve.** Seguridad en retries.
**Cuándo usarlo.** APIs de creación/pagos/eventos.
**Ejemplo mínimo enfocado (ejecutable).**
```bash
mkdir -p /tmp/sb17-idk && cd /tmp/sb17-idk
cat > DemoIdk.java << 'JAVA'
import java.util.*; public class DemoIdk { public static void main(String[] args){ Set<String> keys=new HashSet<>(); System.out.println(keys.add("K1")); System.out.println(keys.add("K1")); } }
JAVA
javac DemoIdk.java && java DemoIdk
```
**Caso de uso real.** Evitar doble cobro.
**Error común.** Retry de POST no idempotente. Corrección: idempotency key.
**Verificación (JDK 27, 2026-05-22).** Salida: `true`, `false`.

## Cierre
Distribuido implica duplicados, latencia y fallos parciales. Diseña contratos, idempotencia y compensaciones.
