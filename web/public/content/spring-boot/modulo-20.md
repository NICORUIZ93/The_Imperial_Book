# Módulo 20: Proyecto integrador: backend de entregas productivo

Integra los conceptos del track en un backend de entregas: API, persistencia, seguridad, observabilidad, resiliencia y despliegue. Este módulo es de integración; las verificaciones son por componente y por smoke end-to-end.

**Entorno (2026-05-22):** JDK 27, Maven 3.10.0, Docker 29.9.3.

## Aprende construyendo

### Tema 1: Diseño del dominio y contratos · Avanzado · 60 min
#### Bounded context y contrato
**Definición formal.** Bounded context delimita un modelo de dominio; contrato define API/eventos estables.
**Para qué sirve.** Evitar acoplamiento accidental.
**Cuándo usarlo.** Desde el inicio del diseño.
**Ejemplo mínimo enfocado (ejecutable modelo simple).**
```bash
mkdir -p /tmp/sb20-dom && cd /tmp/sb20-dom
cat > DemoDom.java << 'JAVA'
record Envio(String id,String estado){} public class DemoDom { public static void main(String[] args){ System.out.println(new Envio("E1","CREADO").estado()); } }
JAVA
javac DemoDom.java && java DemoDom
```
**Caso de uso real.** Envíos, tracking, notificaciones.
**Error común.** Empezar por BD sin contrato. Corrección: definir casos de uso y contratos.
**Verificación (JDK 27, 2026-05-22).** Salida: `CREADO`.

### Tema 2: Persistencia, transacciones y migraciones · Avanzado · 60 min
#### Transacción de negocio
**Definición formal.** Unidad atómica que preserva invariantes del dominio.
**Para qué sirve.** Consistencia.
**Cuándo usarlo.** Operaciones write críticas.
**Ejemplo mínimo enfocado.** `@Transactional` en service + Flyway.
**Caso de uso real.** Crear envío + evento outbox.
**Error común.** Transacción en controller. Corrección: límite en service.
**Verificación.** **Nota:** requiere app+BD.

### Tema 3: Seguridad, observabilidad y resiliencia · Avanzado · 60 min
#### Checklist productivo
**Definición formal.** Conjunto mínimo de controles: authz, validación, logs, métricas, health, timeouts, retries.
**Para qué sirve.** Operar con confianza.
**Cuándo usarlo.** Antes de producción.
**Ejemplo mínimo enfocado (ejecutable checklist).**
```bash
cat <<'C'
authz OK
validation OK
timeouts OK
metrics OK
health OK
C
```
**Caso de uso real.** Go-live checklist.
**Error común.** “Funciona en local” sin observabilidad. Corrección: instrumentar y probar fallos.
**Verificación (2026-05-22).** Checklist impreso.

### Tema 4: Smoke end-to-end y entrega · Avanzado · 60 min
#### Smoke test
**Definición formal.** Prueba breve que valida el flujo crítico tras desplegar.
**Para qué sirve.** Detectar fallos graves rápidamente.
**Cuándo usarlo.** Cada despliegue.
**Ejemplo mínimo enfocado (conceptual).**
```bash
curl -f http://localhost:8080/actuator/health
curl -f -X POST http://localhost:8080/envios ...
```
**Caso de uso real.** Crear envío y consultar estado.
**Error común.** Desplegar sin smoke test. Corrección: automatizar smoke en pipeline.
**Verificación.** **Nota:** requiere app desplegada.

## Cierre
El integrador demuestra que los conceptos funcionan juntos: contratos, datos, seguridad, resiliencia y observabilidad no son módulos aislados.
