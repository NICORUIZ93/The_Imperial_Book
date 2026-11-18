# 004 · Programa: todos los cursos con temas reales y el estándar del prompt maestro v2

**Estado:** vigente
**Origen:** pedido del 2026-11-18: usar Spec-Driven para que todas las rutas tengan los temas reales
y cumplan las especificaciones del prompt maestro, sin trabajo duplicado.

## Cómo funciona

- Cada ruta tiene su propia spec en [`specs/tracks/<ruta>.md`](tracks/) con los mismos siete criterios
  (T1–T7) y la lista concreta de temas oficiales que todavía no tienen tema propio.
- Los criterios se miden con `scripts/audit_track_master_prompt.py`; la matriz completa está en
  `docs/master-prompt-compliance.md`. Un criterio pasa a `hecho` solo cuando su comando sale con 0, y
  desde ese momento `validate_specs.py --run` impide que retroceda.
- Ningún lote toca una ruta sin abrir antes su spec: así dos sesiones nunca rehacen el mismo tema.
- «Temas reales» significa contrastados con el atlas oficial de la ruta (documentación primaria y
  certificaciones), no títulos inventados ni encabezados copiados de un libro.

## Criterios del programa

- **R1** `hecho` — Las 16 rutas tienen spec propia en `specs/tracks/` con los criterios T1–T7 y su
  verificación por comando.
  Verificación: `test $(ls specs/tracks/*.md | wc -l) -eq $(python3 -c "import json;print(len(json.load(open('web/public/content/topic-index.json'))))")`
- **R2** `hecho` — La matriz `docs/master-prompt-compliance.md` está al día con el contenido real.
  Verificación: `python3 scripts/audit_track_master_prompt.py --check`
- **R3** `hecho` — Las figuras y capturas servidas desde `content/figures/` cuentan como ayuda visual en
  la auditoría editorial (antes solo contaban Mermaid y diagramas de texto; Control 1 pasó de 0 a 11).
  Verificación: `python3 scripts/audit_topic_learning_quality.py --check`
- **R4** `pendiente` — Las rutas sin atlas oficial (`foundations`, `microservices`, `rutaflow`,
  `control-1`) lo registran en `docs/official-topic-atlas.json` para poder medir T3.
  Verificación: `python3 -c "import json,sys;a={t['id'] for t in json.load(open('docs/official-topic-atlas.json'))['tracks']};sys.exit(0 if {'foundations','microservices','rutaflow','control-1'}<=a else 1)"`
- **R5** `pendiente` — Todas las rutas cumplen T1–T7 (o tienen exención con motivo).
  Verificación: `python3 scripts/audit_track_master_prompt.py --check && python3 -c "import json,sys;d=json.load(open('docs/master-prompt-compliance.json'));sys.exit(0 if all(v or k in r['exempt'] for r in d['tracks'] for k,v in r['status'].items()) else 1)"`

## Orden de los lotes

Prioridad de `MASTER-PROMPT.md`: **Java → Spring Boot → Microservicios → DevOps (Docker/Kubernetes) →
Flutter**, luego el resto. Dentro de cada ruta: primero T3 (temas reales que faltan), después T4–T6
(ayudas visuales, capturas y ayudas de código) módulo por módulo.

## Límites de la medición

- T5 (explicación fácil) usa la longitud media de las oraciones como señal; no reemplaza leer el tema.
- T3 busca el tema oficial en títulos y encabezados; un tema con otro nombre puede requerir revisión
  humana antes de crear un duplicado.
