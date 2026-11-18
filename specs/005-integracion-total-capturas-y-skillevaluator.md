# 005 · Integración total de las capturas y evaluación de skills con SkillEvaluator

**Estado:** vigente
**Origen:** pedido del 2026-11-18: revisar de nuevo las capturas, integrar todo en el proyecto y evaluar
las skills con [NVIDIA SkillEvaluator](https://github.com/NVIDIA/skillevaluator). Ese mismo día llegó
un video (weincode, «Flutter 3.50 vs Previous Versions: What Actually Changed?») que entra por el mismo
proceso de ingreso de capturas.

## Contexto y límites

- Las decisiones de cada tema extraído viven en `docs/capture-intake.json` (lote `capturas-2026-11-17` y
  lote `video-2026-11-18`). Esta spec solo agrega lo que esas decisiones dejaron como hueco.
- Los temas nuevos siguen specs/002. Si la demostración necesita una clave de un proveedor de IA o el SDK
  de Flutter, la captura queda `pendiente` con motivo: no se dibujan salidas.
- SkillEvaluator corre aquí su Tier 1 (`quality-check`, sin claves). Tier 2 y Tier 3 necesitan un
  proveedor LLM y no se declaran como ejecutados.

## Criterios

- **E1** `hecho` — Cada skill de `.claude/skills/` pasa `skillevaluator quality-check` con 80/100 o más;
  el reporte queda en `docs/skill-evaluation.md` y CI lo repite en el job `skills`.
  Verificación: `python3 scripts/evaluate_skills.py --min 80`
- **E2** `hecho` — Las skills también se publican en `.agents/skills/` (enlaces a `.claude/skills/`), la
  ruta que leen Codex y OpenClaw según `skillevaluator harness-check`.
  Verificación: `test -f .agents/skills/academy-flow-inspector/SKILL.md && test -f .agents/skills/archify/SKILL.md`
- **E3** `hecho` — Corrección: Spring Boot ya enseña Spring AI (M20 Tema 7, ChatClient y herramientas;
  Tema 8, RAG); la revisión del 2026-11-17 no lo vio porque la búsqueda se cortó. El hueco real es MCP:
  se agrega un tema para exponer y consumir herramientas con Model Context Protocol en Spring AI.
  Verificación: `python3 scripts/audit_visual_aids.py && grep -q "Model Context Protocol" web/public/content/topic-index.json`
- **E4** `hecho` — Hay un tema propio «DDD: mitos y verdades» con ejemplo Java ejecutable y captura real.
  Verificación: `python3 scripts/audit_visual_aids.py && grep -q "mitos y verdades" web/public/content/topic-index.json`
- **E5** `hecho` — El recorrido de 17 pasos de la captura de Java aparece en la app (Java, capítulo 0) como
  ruta recomendada con un enlace por paso al tema de la academia que lo enseña.
  Verificación: `python3 scripts/validate_capture_intake.py`
- **E6** `hecho` — El video de Flutter 3.50 está registrado con decisión por tema, y Flutter tiene temas de
  migración a Flutter 3.50/Dart 3.14, integración de IA con Firebase AI Logic y flujo de autenticación con
  tokens.
  Verificación: `python3 scripts/validate_capture_intake.py && python3 scripts/audit_visual_aids.py`
