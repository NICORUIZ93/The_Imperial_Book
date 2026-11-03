# Migración a cuatro pasos y subtemas atómicos

Este archivo conserva su nombre para no romper enlaces históricos. La metodología vigente está en [`METODOLOGIA-DE-APRENDIZAJE.md`](METODOLOGIA-DE-APRENDIZAJE.md) y sigue el contrato del Master Prompt aportado para la academia.

## Formato que se aplica

Cada tema dura 20–45 minutos y contiene entre 3 y 6 subtemas de 5–15 minutos. Cada subtema usa cuatro pasos:

1. **Contexto** del caso y prerrequisito `M<N> T<D>`.
2. **Hazlo tú** con archivo, contenido completo, comando, salida esperada y fallo diagnosticado.
3. **Entiende** el mecanismo, una decisión y un límite con lenguaje directo.
4. **Cierra** con evidencia concreta para continuar el proyecto.

El tema termina con un hito de cuatro comprobaciones. No se declara completo por tener encabezados, palabras clave o código sin ejecutar.

## Estado de migración

La adopción es parcial. `scripts/audit_atomic_subtopics.py` y `docs/atomic-subtopics.md` reportan qué temas ya cumplen la estructura y cuáles faltan; la cifra del reporte no equivale a revisión pedagógica humana ni a ejecución de todos los ejemplos.

Los pilotos actuales son Spring Boot M10 T3, M21 y M25, Java M0 T1 y M20 T1, Node M14 T7–T8 y Flutter M19 T1. No se borra ni renombra ningún tema base. Todo el resto del inventario continúa pendiente de migración y revisión.
