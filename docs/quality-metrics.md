# Métricas de calidad editorial

Corte: 2026-10-30. Estos reportes son detectores estáticos del Markdown real.
Ninguno certifica aprendizaje, corrección técnica ni que todos los ejemplos se
hayan ejecutado. La revisión de navegador y la revisión pedagógica humana son
capas separadas.

| Métrica | Mide | NO mide | Fuente | Estado |
|---|---|---|---|---|
| Temas practicables | Presencia heurística de explicación, código, ruta, comando, resultado, práctica, proyecto, modelo mental y límites. En este corte: 1094/1100. | Corrección, profundidad, legibilidad real ni ejecución del ejemplo. | [topic-learning-quality.md](./topic-learning-quality.md) y [audit_topic_learning_quality.py](../scripts/audit_topic_learning_quality.py) | 6 temas con algún criterio ausente; deuda detectable por criterio. |
| Siete pasos | 17 marcadores textuales para objetivo, prerrequisitos, contexto, teoría, demo, explicación, ejecución, fallo, práctica, evidencia y apoyos. En este corte: 1100/1100 según marcadores. | Que cada paso sea correcto, útil, coherente o comprendido. | [seven-step-methodology.md](./seven-step-methodology.md) y [audit_seven_step_methodology.py](../scripts/audit_seven_step_methodology.py) | Sin ausencias detectadas por los marcadores actuales; requiere revisión humana. |
| Calidad Markdown | Señales de andamiaje genérico, bloques y párrafos repetidos, cola tras el cierre y temas breves. En este corte: 293/1100 temas con al menos una señal. | Plagio, similitud semántica completa ni calidad de estilo; cada señal puede ser falso positivo. | [lesson-substance.md](./lesson-substance.md) y [audit_lesson_substance.py](../scripts/audit_lesson_substance.py) | 293 temas señalados; 184/245 módulos con apéndices heredados. |
| Calidad de visuales | Presencia de Mermaid, enlaces Archify locales, visuales ASCII, código, comentarios, rutas y fuentes. En este corte: 581 temas con Mermaid, 18 enlaces Archify y 216 con ASCII pendiente. | Que una figura renderice, sea accesible o represente correctamente el concepto. | [code-visual-quality.md](./code-visual-quality.md) y [audit_code_visual_quality.py](../scripts/audit_code_visual_quality.py) | 216 visuales ASCII siguen pendientes de redibujo y revisión; no se sustituyen con gráficos decorativos. |
| Deuda editorial | Criterios de presencia ausentes por tema y módulo. En este corte: 6 temas incompletos en el perfil de 9 criterios; 5 sin conexión detectada a proyecto y 1 sin ruta detectada. | La deuda pedagógica completa; una coincidencia positiva no demuestra que el contenido enseñe. | [editorial-backlog.md](./editorial-backlog.md) | 6 temas requieren revisión específica según el detector; hay defectos de sustancia adicionales en su auditoría independiente. |

## Cobertura de pruebas de la aplicación

Las pruebas unitarias Angular usan el proveedor V8 fijado en `web/package.json`.
CI exige como mínimo 60% de statements, 50% de branches, 55% de functions y
60% de lines, calculado globalmente (no por archivo). Es un piso de regresión
basado en la cobertura medida el 2026-10-30, no evidencia de que todos los
flujos de usuario estén probados ni de la calidad del contenido curricular.
Compruébalo con `cd web && npm test -- --watch=false --coverage`.

## Cómo usar los resultados

1. Trata cada señal como una pista que requiere inspección del tema fuente.
2. No sumes ni compares las métricas como si compartieran una misma rúbrica.
3. Para ejemplos ejecutables, corre la verificación específica del lenguaje o del
   proyecto; una mención a un comando no prueba que funcione.
4. Para renderizado y navegación, usa pruebas de navegador y registra cuántos
   temas se inspeccionaron realmente.
5. La revisión pedagógica humana sigue pendiente para los temas que no tengan
   una entrada explícita en un registro manual.
