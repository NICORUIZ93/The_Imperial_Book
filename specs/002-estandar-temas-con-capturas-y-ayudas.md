# 002 · Estándar para crear temas con capturas, ayudas de código y ayudas visuales

**Estado:** vigente (se aplica a todo tema nuevo o reescrito desde 2026-11-18)
**Alcance verificable:** los temas listados en [`visual-aids-scope.json`](visual-aids-scope.json).
Quien crea o reescribe un tema lo agrega a esa lista en el mismo commit; así el estándar crece sin
reauditar a mano los temas antiguos.

## Contexto y límites

- Complementa, no reemplaza, `docs/editorial-contract.md` y `docs/METODOLOGIA-DE-APRENDIZAJE.md`
  (los 9 criterios editoriales siguen midiéndose con `audit_topic_learning_quality.py`).
- Una **captura** muestra algo que ocurrió de verdad: la salida de un comando ejecutado o la app
  renderizada. Nunca se dibuja a mano una salida inventada.
- Las imágenes viven en `web/public/content/figures/<track>/` y se enlazan como
  `![texto alternativo](content/figures/<track>/<archivo>)`, que es la ruta que la app ya sirve.

## Criterios

- **V1** `hecho` — Cada tema en alcance tiene al menos una **ayuda visual**: un diagrama Mermaid o una
  figura que explique el modelo mental (flujo, arquitectura, estados).
  Verificación: `python3 scripts/audit_visual_aids.py`
- **V2** `hecho` — Cada tema en alcance tiene al menos una **captura** generada desde una ejecución
  real: salida de terminal con `scripts/render_terminal_capture.py` (SVG con el comando y la fecha en
  `<desc>`) o pantalla de la app con Playwright. Si la demostración necesita algo que no existe en el
  entorno de generación (Docker, un clúster, credenciales), el tema queda en el alcance con
  `"capture": "pendiente"` y el motivo; la auditoría lo reporta como pendiente, no como cumplido.
  Verificación: `python3 scripts/audit_visual_aids.py`
- **V3** `hecho` — **Ayuda de código:** cada bloque de código de programa o configuración (no los de
  `bash`, `text` ni `mermaid`) va precedido, en las 3 líneas anteriores, por el nombre del archivo
  entre comillas invertidas, y el tema incluye una explicación por bloques o línea por línea.
  Verificación: `python3 scripts/audit_visual_aids.py`
- **V4** `hecho` — Cada captura va acompañada en el mismo tema de un **Resultado esperado** escrito,
  para que la lección siga siendo útil con lector de pantalla o sin imágenes.
  Verificación: `python3 scripts/audit_visual_aids.py`
- **V5** `hecho` — Integridad de imágenes en **todas** las lecciones: el archivo enlazado existe,
  el texto alternativo tiene al menos 10 caracteres y la imagen pesa menos de 300 KB.
  Verificación: `python3 scripts/audit_lesson_assets.py --images`

## Cómo crear un tema con este estándar

1. Escribe el tema con los 7 pasos del módulo (objetivo, contexto, teoría + diagrama, demostración,
   práctica guiada, práctica independiente, cierre).
2. En la demostración, nombra cada archivo antes de su bloque de código y explica los bloques.
3. Ejecuta la demostración de verdad y genera la captura:

   ```bash
   python3 scripts/render_terminal_capture.py \
     --cwd /ruta/al/ejemplo --title "estimar.py" \
     --out web/public/content/figures/foundations/diseno-estimacion.svg \
     -- python3 estimar.py
   ```

4. Inserta la imagen justo después del bloque del comando y antes del **Resultado esperado**.
5. Agrega el tema a `specs/visual-aids-scope.json` y corre `./scripts/validate.sh`.

## Piloto

Los tres temas agregados el 2026-11-17 (`foundations/7` Tema 6, `foundations/10` Tema 7 y
`devops/6` Tema 8) son el piloto de esta spec. El de Minikube queda con captura `pendiente` hasta
ejecutarlo en una máquina con Docker y Minikube.
