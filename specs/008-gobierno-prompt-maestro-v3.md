# 008 · Gobierno: prompt maestro v3 y plan por fases

**Estado:** vigente
**Origen:** pedido del 2026-11-18: «hagamos las cosas desde cero, con spec driven, el mayor número de
temas posibles, cambiar el master prompt, limpiar la basura del repo, una página más académica, cada
tema con ejemplo, capturas y ejercicios, un curso completo de Docker y Kubernetes, agentes de diseño
para maquetación y UI/UX, backend, DevOps y microservicios». Prompt aprobado por el dueño el mismo día.

## Decisiones del dueño (2026-11-18)

- «Desde cero» significa medir cada tema con el estándar v3 y reescribir solo los que no lo cumplen.
- La limpieza mueve lo aprobado a la rama `archivo`; no destruye archivos.
- Orden: gobierno → limpieza → Docker (piloto) → web académica → Kubernetes → maquetación y UI/UX →
  backend, microservicios y DevOps → migración de las rutas actuales.

## Criterios

- **G1** `hecho` — `MASTER-PROMPT.md` es la v3: constitución, flujo SDD, protocolo de investigación,
  estándar de tema de 12 partes, agentes, bucle de revisión, ingreso de capturas, equivalencias con la v2
  y cifras reales.
  Verificación: `python3 scripts/validate_master_prompt.py && grep -q "MASTER-PROMPT v3" MASTER-PROMPT.md`
- **G2** `hecho` — `CLAUDE.md` y las specs de ruta remiten a la v3, no a la v2.
  Verificación: `grep -q "MASTER-PROMPT.md\` v3" CLAUDE.md && ! grep -rq "MASTER-PROMPT.md\` v2" CLAUDE.md specs/tracks`

## Fases (cada una con su propia spec)

| Fase | Spec | Estado |
|---|---|---|
| 1 · Limpieza del repo | 009 | por escribir: inventario para aprobación |
| 2 · Curso Docker de cero a experto (piloto) | 010 | por escribir |
| 3 · Web académica y sistema de diseño | 011 | por escribir |
| 4 · Kubernetes (CKAD, CKA y CKS vigentes) | 012 | por escribir |
| 5 · Maquetación profesional y UI/UX | 013 | por escribir |
| 6 · Backend, microservicios y DevOps | 014 | por escribir |
| 7 · Migración de las rutas actuales | 015 | por escribir |
