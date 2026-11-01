# Registro de migración — Spring Boot

Actualizado: 2026-10-31. Fuente de verdad: `docs/migration-status.json`.
Alcance de este registro: bloques M0–M7 y M8–M11. El track completo (91 temas)
sigue en curso; este documento no acredita la migración total ni revisión humana.

## Preservación

| Módulo | Temas originales | Temas migrados | Proyecto de cierre |
|---|---:|---:|---|
| M0 · Fundamentos de Spring: IoC y DI | 3 | 3 | Sí, rúbrica 100 |
| M1 · CLI y estructura de proyecto | 3 | 3 | Sí, rúbrica 100 |
| M2 · REST APIs con Spring Web | 6 | 6 | Sí, rúbrica 100 |
| M3 · Persistencia con Spring Data JPA | 3 | 3 | Sí, rúbrica 100 |
| M4 · Spring Security | 5 | 5 | Sí, rúbrica 100 |
| M5 · Configuración, perfiles y manejo de errores | 3 | 3 | Sí, rúbrica 100 |
| M6 · Testing en Spring Boot | 3 | 3 | Sí, rúbrica 100 |
| M7 · Observabilidad con Actuator | 3 | 3 | Sí, rúbrica 100 |
| M8 · Mensajería — Kafka/RabbitMQ | 5 | 5 | Sí, rúbrica 100 |
| M9 · Programación reactiva con WebFlux | 3 | 3 | Sí, rúbrica 100 |
| M10 · Microservicios con Spring Cloud | 8 | 8 | Sí, rúbrica 100 |
| M11 · Empaquetado y despliegue | 3 | 3 | Sí, rúbrica 100 |
| **Acumulado** | **48** | **48** | **12 proyectos** |

No se eliminó ningún tema. Los proyectos de cierre son secciones nuevas de
módulo y no cuentan como temas del inventario (1131 permanece igual).

## Niveles del bloque

| Nivel | Temas |
|---|---:|
| Básico | 4 (8,3 %) |
| Intermedio | 23 |
| Avanzado | 18 |
| Experto | 3 (M4 T4 SSRF, M8 T3 exactly-once, M10 T8 Temporal y Saga) |

El máximo de 30 % Básico se cumple y el track conserva temas Experto. Aun
así, el track no se cierra: faltan 43 temas de 11 módulos, el capstone y la
revisión humana.

## Identidad y progreso

- Los títulos conservan el texto original y solo añaden `· [Nivel] · [Duración]`.
- `web/public/content/topic-index.json` no cambió: los fragmentos son
  idénticos a los anteriores.
- No se renumeraron módulos ni se movieron temas entre módulos en estos bloques.
- No se modificó el esquema de progreso porque ninguna clave `${moduleId}:${fragment}`
  cambió.

## Verificación ejecutada

- `python3 scripts/validate_migration.py`: 12 módulos en formato nuevo, sin
  pérdida de temas.
- `rg -n '^#### Paso' web/public/content/spring-boot/modulo-{0..11}.md`: sin
  resultados.
- `./scripts/validate.sh`: en verde.
- `python3 scripts/audit_topic_learning_quality.py --require-practicable
  --min-practicable 1100`: 1131/1131 temas practicables.
- `python3 scripts/audit_lesson_substance.py --strict`: 0 temas con señal.
- `python3 scripts/audit_code_visual_quality.py`: sin hallazgos.
- `python3 scripts/validate_learning_priorities.py`: sin evaluaciones generadas
  ni gamificación.
- `python3 scripts/audit_course_depth.py`: ninguno de los 48 temas migrados
  conserva señales de profundidad (145 señales en el resto del curso).

Estas comprobaciones detectan estructura y marcadores. No prueban que los
ejemplos se hayan ejecutado ni sustituyen la revisión pedagógica humana, que
sigue pendiente.

## Pendiente

1. Migrar M12–M22 y registrar el siguiente bloque.
2. Revisar que el capstone del track exista y tenga rúbrica antes de cerrar la
   Fase 2.
3. Revisión humana de los 48 temas migrados: 0/48.
4. Decidir el mapa definitivo de reordenamiento y fusión, con remapeo de
   progreso y redirecciones, antes de renumerar módulos.
