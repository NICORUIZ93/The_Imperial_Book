# Ruta Control 1 — Sistemas de control desde cero (`control-1`) · especificación del prompt maestro v2

**Estado:** en-curso · **Prioridad:** según MASTER-PROMPT §3.2
**Spec marco:** [004](../004-programa-cursos-de-cero-a-master.md) · **Medición:** `docs/master-prompt-compliance.md`

Cada lote de esta ruta trabaja solo contra los criterios `pendiente`. Al cumplir uno, cambia su estado a `hecho`
en el mismo commit; `validate_specs.py --run` comprobará desde entonces que no retroceda.

## Criterios

- **T1** `hecho` — La ruta tiene módulos en los 4 niveles: Fundamentos, Aplicación, Integración y Experto (PAUTA 17). Medición al 2026-11-18: completo.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track control-1 --criterion T1`
- **T2** `pendiente` — La ruta cierra con un módulo Master cuyos temas pedidos están en `docs/requested-master-topics.json` y visibles en el contenido (PAUTA 17). Medición al 2026-11-18: sin registrar.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track control-1 --criterion T2`
- **T3** `pendiente` — Temas reales: cada tema del atlas oficial de la ruta (`docs/official-topic-atlas.json`) tiene un tema o encabezado propio con explicación y práctica; una mención suelta no cuenta. Medición al 2026-11-18: sin atlas oficial: primero hay que registrarlo en docs/official-topic-atlas.json.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track control-1 --criterion T3`
- **T4** `pendiente` — Todos los temas tienen ayuda visual: diagrama Mermaid o figura (PAUTA 14). Medición al 2026-11-18: 11/70.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track control-1 --criterion T4`
- **T5** `hecho` — Explicación fácil: al menos 90 % de los temas tienen oraciones de 25 palabras o menos en promedio (PAUTA 13). Medición al 2026-11-18: 70/70.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track control-1 --criterion T5`
- **T6** `pendiente` — Todos los temas cumplen specs/002 (captura real y ayuda de código) y están en `specs/visual-aids-scope.json` (PAUTAS 15 y 16). Medición al 2026-11-18: 0/70.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track control-1 --criterion T6`
- **T7** `pendiente` — Todos los temas transfieren un incremento al proyecto integrador. Medición al 2026-11-18: 5/70.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track control-1 --criterion T7`

## Temas reales por crear o convertir en tema propio (T3)

- [ ] Registrar el atlas oficial de la ruta (documentación primaria y certificación de referencia) y derivar de él la lista.

## Cómo ejecutar un lote

1. Elige un módulo y los criterios pendientes que vas a cerrar; anótalos aquí como subtareas.
2. Escribe o reescribe los temas con `MASTER-PROMPT.md` v2 (pautas 13–17) y specs/002.
3. Agrega cada tema a `specs/visual-aids-scope.json` con su captura real.
4. Corre `./scripts/validate.sh`; si un criterio pasa, márcalo `hecho` y corre `python3 scripts/validate_specs.py --run`.
