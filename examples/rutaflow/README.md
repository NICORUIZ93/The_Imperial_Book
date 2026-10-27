# RutaFlow: plataforma educativa de entregas

RutaFlow es el proyecto transversal de The Imperial Book. Modela una operación de paquetería sin copiar marcas, interfaces ni procesos privados. Cada ruta tecnológica implementa una capacidad del mismo producto y respeta contratos compartidos.

## Primer recorrido funcional

```text
cliente crea envío
  -> backend valida y guarda
  -> planificador asigna ruta
  -> conductor descarga paradas
  -> aplicación captura ubicación y prueba de entrega
  -> backend acepta el comando una sola vez
  -> tracking actualiza al cliente
  -> contabilidad registra movimientos balanceados
```

## Invariantes

- Un envío conserva un identificador estable durante todo su ciclo de vida.
- Una transición de estado inválida se rechaza; nunca se corrige silenciosamente.
- Confirmar una entrega es idempotente: repetir el mismo comando no duplica efectos.
- La ubicación incluye momento, precisión y origen; una coordenada aislada no prueba entrega.
- El modo offline conserva operaciones en una outbox y vuelve a enviar la misma clave.
- Los movimientos contables son inmutables, balanceados y se corrigen con reversos.
- Los logs no contienen tokens, direcciones completas, fotografías ni coordenadas precisas.

## Implementación por ruta

| Ruta | Archivo | Capacidad |
|---|---|---|
| Fundamentos | `foundation/domain.py` | Estados, invariantes y algoritmo de asignación |
| JavaScript | `javascript/tracking-widget.js` | Seguimiento accesible y seguro |
| Node.js | `node/confirm-delivery.ts` | Caso de uso idempotente y contrato HTTP |
| Angular | `angular/operations.store.ts` | Estado derivado de consola operativa |
| React | `react/use-shipment-tracking.tsx` | Suscripción cancelable y UI por estados |
| Java | `java/PricingEngine.java` | Motor de tarifas con reglas comprobables |
| Spring Boot | `spring-boot/DeliveryService.java` | Transacción, outbox y autorización |
| Kotlin Multiplatform | `kotlin-multiplatform/SyncEngine.kt` | Dominio y sincronización compartidos |
| Android | `android/LocationPolicy.kt` | Muestreo GPS consciente de batería |
| iOS | `ios/LocationPolicy.swift` | Política de ubicación y privacidad |
| Flutter | `flutter/delivery_outbox.dart` | Cola offline persistente y reintentos |
| DevOps | `devops/deployment.yaml` | Despliegue, salud, recursos y seguridad |
| Cloud | `cloud/template.yaml` | API, cola y almacenamiento con IaC |
| Datos/contabilidad | `database/schema.sql` | Integridad, eventos y libro mayor |

Cada archivo es pequeño a propósito: enseña una decisión central y declara qué falta para producción. Los capítulos finales conectan estas piezas gradualmente; no se debe copiar todo en una sola sesión.

## Verificar respaldo y restauración

`database/backup_verified.sh` trabaja sobre una base de laboratorio con `envios`
y `envio_eventos`. `DATABASE_URL` selecciona el origen; `PGHOST`, `PGPORT` y
`PGUSER` seleccionan el servidor de restauración. Detén escrituras durante la
comparación. El destino necesita permisos para crear una base temporal.

```bash
bash examples/rutaflow/database/backup_verified.sh backup-envios.dump
python3 -m unittest discover -s scripts/tests -p 'test_backup_verified.py' -v
```

El script rechaza sobrescrituras, restaura funciones y secuencias junto con los
datos, compara el contenido de ambas tablas y elimina su base temporal incluso
ante fallo. Las pruebas crean un clúster propio con socket local y nunca usan
una base preexistente. Requieren herramientas PostgreSQL en PATH; si no están
instaladas, unittest informa esas pruebas como omitidas. CI instala las herramientas.
