# Revisión integral y trazable

Este informe agrega los auditores versionados; no reemplaza sus resultados detallados. Cada conteo debe leerse según el alcance de su detector. Una coincidencia textual no demuestra corrección, ejecución, comprensión ni calidad pedagógica.

## Cobertura y estado por capa

| Capa | Cobertura y resultado registrado | Límite / pendiente | Evidencia detallada |
|---|---|---|---|
| Inventario estructural | 14 tracks, 245 módulos y 1100 temas en Markdown. | La paridad de archivos y metadatos no evalúa el aprendizaje. | [Curso por tema](./course-depth-review.md) |
| Criterios editoriales | 1094/1100 temas muestran el perfil de presencia; 6 no lo completan. | Detector heurístico; no valida el contenido de cada criterio. | [Métricas](./topic-learning-quality.md) · [Deuda](./editorial-backlog.md) |
| Marcadores de siete pasos | 1100/1100 cumplen todos los marcadores medidos. | Presencia de marcadores, no utilidad ni calidad de las prácticas. | [Metodología](./seven-step-methodology.md) |
| Sustancia Markdown | 303/1100 temas presentan al menos una señal; 184/245 módulos, secciones heredadas. | Las señales requieren inspección del texto; no son defectos confirmados. | [Sustancia](./lesson-substance.md) |
| Código y visuales | 1100 temas revisados; 581 con Mermaid, 18 con Archify y 216 con visual ASCII pendiente. | La presencia no acredita que el código se compile o que un diagrama se renderice y sea correcto. | [Código y visuales](./code-visual-quality.md) |
| Fuentes oficiales | 720/1100 temas contienen una URL de dominios oficiales reconocidos por el detector. | El enlace puede estar desactualizado o no sustentar la afirmación concreta; la vigencia es una comprobación distinta. | [Auditoría de visuales y fuentes](./code-visual-quality.md) · [Vigencia](./official-sources.json) |
| Renderizado estructural de navegador | El snapshot disponible registra 241 páginas y 1076/1100 temas; 0 hallazgos agregados, 0 errores de página y 0 errores de renderizado. | El snapshot no registra fecha y cubre 24 temas menos que el inventario actual; actualizar el barrido antes de declarar cobertura completa. | [Snapshot](./browser-course-review.json) |
| Ejecución de ejemplos | 13/14 laboratorios seleccionados figuran como comprobados con límites; 1 sigue pendiente. | Muestra delimitada; no cubre todos los ejemplos históricos ni certifica aprendizaje. | [Registro de ejecución](../examples/professional-bridges/verification.json) |
| Revisión pedagógica humana | 0/1100 temas tienen un estado distinto de pendiente en el registro actual. | La revisión humana y la prueba con personas siguen pendientes según [el registro tema por tema](./course-depth-review.md). | [Revisión por tema](./course-depth-review.json) |
| Similitud entre temas | No medida; el auditor detecta repetición literal dentro de cada tema en 5 temas. | No se ejecutó análisis semántico, similitud entre temas ni detección de plagio. | [Límites de la auditoría de sustancia](./lesson-substance.md) |

## Hallazgos estructurales que requieren priorización

| Señal | Conteo | Lectura correcta |
|---|---:|---|
| Bloques editoriales repetidos | 202 temas | Requiere inspección y reescritura; no se elimina automáticamente. |
| Andamiaje genérico | 125 temas | Revisar si la instrucción realmente conduce a un artefacto específico. |
| Cola posterior al cierre | 1 tema | Señal de contenido posiblemente desplazado, no diagnóstico pedagógico automático. |
| Párrafos repetidos | 5 temas | Confirmar duplicación dentro del contexto de cada tema. |
| Temas breves | 2 temas | La brevedad sola no prueba insuficiencia; revisar objetivo y práctica. |

## Registro de revisión manual

El registro estructural incluye una fila por tema y conserva `humanPedagogicalReview` como estado separado. Ningún tema se marca como pedagógicamente revisado por ejecutar un script, generar un reporte o superar una prueba de navegador. Para cerrar una revisión humana hay que actualizar el registro tema por tema con responsable, fecha, evidencia examinada y resultado.

La validación de navegador es otra capa. El snapshot anterior cubre menos temas que el inventario actual y no registra su fecha; hasta regenerarlo y documentar el recorrido real, no se declara que los 1.098 temas se hayan probado en navegador.

## Reproducibilidad

Este resumen se genera con `python3 scripts/build_full_review.py` y se verifica con `python3 scripts/build_full_review.py --check`. Los reportes enlazados se regeneran por sus respectivos auditores; consulta `./scripts/validate.sh` para sus comandos de verificación.
