# Revisión integral y trazable

Este informe agrega los auditores versionados; no reemplaza sus resultados detallados. Cada conteo debe leerse según el alcance de su detector. Una coincidencia textual no demuestra corrección, ejecución, comprensión ni calidad pedagógica.

## Cobertura y estado por capa

| Capa | Cobertura y resultado registrado | Límite / pendiente | Evidencia detallada |
|---|---|---|---|
| Inventario estructural | 14 tracks, 245 módulos y 1100 temas en Markdown. | La paridad de archivos y metadatos no evalúa el aprendizaje. | [Curso por tema](./course-depth-review.md) |
| Criterios editoriales | 1100/1100 temas muestran el perfil de presencia; 0 no lo completan. | Detector heurístico; no valida el contenido de cada criterio. | [Métricas](./topic-learning-quality.md) · [Deuda](./editorial-backlog.md) |
| Marcadores de siete pasos | 1100/1100 cumplen todos los marcadores medidos. | Presencia de marcadores, no utilidad ni calidad de las prácticas. | [Metodología](./seven-step-methodology.md) |
| Sustancia Markdown | 0/1100 temas presentan al menos una señal; 183/245 módulos, secciones heredadas. | Las señales requieren inspección del texto; no son defectos confirmados. | [Sustancia](./lesson-substance.md) |
| Código y visuales | 1100 temas revisados; 592 con Mermaid, 18 con Archify y 211 con visual ASCII pendiente. | La presencia no acredita que el código se compile o que un diagrama se renderice y sea correcto. | [Código y visuales](./code-visual-quality.md) |
| Fuentes oficiales | 869/1100 temas contienen una URL de host oficial exacto en la prosa visible; 231 siguen sin dominio reconocido. La revisión parcial del 2026-10-31 verificó acceso a 175/175 citas existentes; 0 pendiente. | El aumento de reconocimiento corrige omisiones del detector, no añade contenido. Los 378 temas del registro conservan revisión manual pendiente de pertinencia; el éxito HTTP no prueba vigencia ni respaldo de afirmaciones. | [Auditoría](./code-visual-quality.md) · [Registro por tema](./topic-source-review.json) · [Vigencia](./official-sources.json) |
| Renderizado estructural de navegador | Snapshot del 2026-10-31: 245 páginas y 1100/1100 temas; 0 hallazgos agregados, 0 errores de página y 0 errores de renderizado. | Cobertura completa del renderizado estructural; no ejecuta ejercicios ni acredita calidad pedagógica. | [Snapshot](./browser-course-review.json) |
| Ejecución de ejemplos | 14/14 laboratorios seleccionados figuran como comprobados con límites; ninguno pendiente. | Muestra delimitada; no cubre todos los ejemplos históricos ni certifica aprendizaje. | [Registro de ejecución](../examples/professional-bridges/verification.json) |
| Revisión pedagógica humana | 0/1100 temas con firma humana; 14 con pre-lectura de agente sin firma. | La pre-lectura no acredita ejecución, comprensión ni calidad; la firma humana sigue pendiente según [el registro manual](./manual-review-log.md). | [Registro manual](./manual-review-log.md) · [Revisión por tema](./course-depth-review.json) |
| Similitud entre temas | No medida; el auditor detecta repetición literal dentro de cada tema en 0 temas. | No se ejecutó análisis semántico, similitud entre temas ni detección de plagio. | [Límites de la auditoría de sustancia](./lesson-substance.md) |

## Hallazgos estructurales que requieren priorización

| Señal | Conteo | Lectura correcta |
|---|---:|---|
| Bloques editoriales repetidos | 0 temas | Requiere inspección y reescritura; no se elimina automáticamente. |
| Andamiaje genérico | 0 temas | Revisar si la instrucción realmente conduce a un artefacto específico. |
| Cola posterior al cierre | 0 temas | Señal de contenido posiblemente desplazado, no diagnóstico pedagógico automático. |
| Párrafos repetidos | 0 temas | Confirmar duplicación dentro del contexto de cada tema. |
| Temas breves | 0 temas | La brevedad sola no prueba insuficiencia; revisar objetivo y práctica. |

## Registro de revisión manual

El registro estructural incluye una fila por tema y conserva `humanPedagogicalReview` como estado separado. Ningún tema se marca como pedagógicamente revisado por ejecutar un script, generar un reporte o superar una prueba de navegador. Las 14 pre-lecturas de la muestra inicial están en [el registro manual](./manual-review-log.md) con firma humana pendiente. Para cerrar una revisión humana hay que actualizar el registro tema por tema con responsable, fecha, evidencia examinada y resultado.

La validación de navegador se ejecutó el 2026-10-31 sobre 245 páginas y 1100/1100 temas. Comprueba estructura y errores de renderizado; no sustituye pruebas funcionales ni revisión humana.

## Reproducibilidad

Este resumen se genera con `python3 scripts/build_full_review.py` y se verifica con `python3 scripts/build_full_review.py --check`. Los reportes enlazados se regeneran por sus respectivos auditores; consulta `./scripts/validate.sh` para sus comandos de verificación.
