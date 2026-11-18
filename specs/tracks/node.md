# Ruta Node.js: fundamentos de backend (`node`) · especificación del prompt maestro v2

**Estado:** en-curso · **Prioridad:** según MASTER-PROMPT §3.2
**Spec marco:** [004](../004-programa-cursos-de-cero-a-master.md) · **Medición:** `docs/master-prompt-compliance.md`

Cada lote de esta ruta trabaja solo contra los criterios `pendiente`. Al cumplir uno, cambia su estado a `hecho`
en el mismo commit; `validate_specs.py --run` comprobará desde entonces que no retroceda.

## Criterios

- **T1** `hecho` — La ruta tiene módulos en los 4 niveles: Fundamentos, Aplicación, Integración y Experto (PAUTA 17). Medición al 2026-11-18: completo.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track node --criterion T1`
- **T2** `hecho` — La ruta cierra con un módulo Master cuyos temas pedidos están en `docs/requested-master-topics.json` y visibles en el contenido (PAUTA 17). Medición al 2026-11-18: registrado.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track node --criterion T2`
- **T3** `pendiente` — Temas reales: cada tema del atlas oficial de la ruta (`docs/official-topic-atlas.json`) tiene un tema o encabezado propio con explicación y práctica; una mención suelta no cuenta. Medición al 2026-11-18: 15/46 temas oficiales con tema propio.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track node --criterion T3`
- **T4** `pendiente` — Todos los temas tienen ayuda visual: diagrama Mermaid o figura (PAUTA 14). Medición al 2026-11-18: 36/83.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track node --criterion T4`
- **T5** `hecho` — Explicación fácil: al menos 90 % de los temas tienen oraciones de 25 palabras o menos en promedio (PAUTA 13). Medición al 2026-11-18: 83/83.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track node --criterion T5`
- **T6** `pendiente` — Todos los temas cumplen specs/002 (captura real y ayuda de código) y están en `specs/visual-aids-scope.json` (PAUTAS 15 y 16). Medición al 2026-11-18: 0/83.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track node --criterion T6`
- **T7** `hecho` — Todos los temas transfieren un incremento al proyecto integrador. Medición al 2026-11-18: 83/83.
  Verificación: `python3 scripts/audit_track_master_prompt.py --track node --criterion T7`

## Temas reales por crear o convertir en tema propio (T3)

- [ ] timers
- [ ] microtasks
- [ ] EventEmitter
- [ ] buffers
- [ ] filesystem
- [ ] paths y URLs
- [ ] señales
- [ ] child_process
- [ ] permission model
- [ ] HTTP/HTTPS
- [ ] HTTP/2
- [ ] DNS
- [ ] TCP/UDP
- [ ] TLS
- [ ] proxies
- [ ] timeouts
- [ ] Web APIs compatibles
- [ ] SQLite
- [ ] serialización
- [ ] compresión
- [ ] crypto
- [ ] blobs
- [ ] configuración validada
- [ ] coverage
- [ ] benchmarks
- [ ] diagnostics_channel
- [ ] AsyncLocalStorage
- [ ] inspector
- [ ] package exports
- [ ] seguridad de dependencias
- [ ] observabilidad

## Cómo ejecutar un lote

1. Elige un módulo y los criterios pendientes que vas a cerrar; anótalos aquí como subtareas.
2. Escribe o reescribe los temas con `MASTER-PROMPT.md` v3 (sección 4) y specs/002.
3. Agrega cada tema a `specs/visual-aids-scope.json` con su captura real.
4. Corre `./scripts/validate.sh`; si un criterio pasa, márcalo `hecho` y corre `python3 scripts/validate_specs.py --run`.
