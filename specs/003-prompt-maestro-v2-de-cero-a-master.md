# 003 · Prompt maestro v2: de cero a master, fácil, práctico y con ayudas visuales y de código

**Estado:** vigente
**Origen:** pedido del 2026-11-18: revisar las capturas guardadas, validar sus temas, agregarlos al
temario del prompt maestro y mejorar ese prompt para que todos los cursos lleven de cero a nivel
profesional master con explicaciones fáciles, práctica real y ayudas visuales y de código.

## Contexto y límites

- `MASTER-PROMPT.md` es el prompt que ejecuta un agente sobre cada lote; `docs/PROMPT-MAESTRO-METODOLOGIA-EDUCATIVA.md`
  es la metodología detallada. Los dos se actualizan juntos y no se contradicen.
- El inventario del prompt maestro es `docs/temario-maestro-unificado.json`, generado desde
  `docs/course-curriculum-inventory.json` y los libros. Las capturas entran por `docs/capture-intake.json`.
- Mejorar el prompt no reescribe por sí solo los 1326 temas: cada ruta se mejora en lotes con su propia
  spec, medidos por `docs/zero-to-master.md`. Ningún reporte estructural acredita revisión humana.

## Criterios

- **P1** `hecho` — Cada captura recibida tiene registro en `docs/capture-intake.json` con una decisión
  por tema (cubierto o agregado con su ubicación real, candidato con motivo, o fuera de alcance con
  motivo). Lote 2026-11-17: 29 temas (23 cubiertos, 3 agregados, 1 candidato, 2 fuera de alcance).
  Verificación: `python3 scripts/validate_capture_intake.py`
- **P2** `hecho` — Los cursos y rutas validados de las capturas están en
  `docs/course-curriculum-inventory.json` y en el temario maestro regenerado, que ahora incluye las
  rutas `microservices` y `control-1` (29 stacks, 1326 temas actuales).
  Verificación: `python3 scripts/validate_capture_intake.py`
- **P3** `hecho` — `MASTER-PROMPT.md` v2 declara, con sección propia: SDD obligatorio, explicación fácil
  (reglas de lenguaje para principiantes), ayudas visuales, capturas reales, ayudas de código, mapa
  de cobertura de cero a master por ruta, ingreso de capturas y cifras vigentes iguales a `topic-index.json`.
  Verificación: `python3 scripts/validate_master_prompt.py`
- **P4** `hecho` — `docs/PROMPT-MAESTRO-METODOLOGIA-EDUCATIVA.md` usa el nombre The Imperial Book,
  remite a specs/002 para visuales y código, y su contrato de tema incluye explicación fácil,
  captura real y ayuda de código.
  Verificación: `python3 scripts/validate_master_prompt.py`
- **P5** `pendiente` — Crear en Spring Boot un tema de Spring AI (ChatClient, herramientas, RAG y MCP)
  que cubra el hueco detectado al validar «Spring Boot Harness», con el estándar de specs/002.
  Verificación: `python3 scripts/audit_visual_aids.py && grep -qi "spring ai" web/public/content/topic-index.json`
- **P6** `hecho` — `docs/zero-to-master.md` mide por ruta niveles, módulo Master, ayudas visuales y
  transferencia al proyecto, y está al día; es la entrada para elegir el siguiente lote.
  Verificación: `python3 scripts/build_zero_to_master_report.py --check`

## Huecos que deja visibles la medición (siguientes lotes, cada uno con su spec)

| Ruta | Hueco medido en `docs/zero-to-master.md` |
|---|---|
| java | 19/111 temas con ayuda visual |
| spring-boot | 43/113 con ayuda visual; falta Spring AI (P5) |
| microservices | solo nivel Fundamentos (2 módulos); faltan Aplicación, Integración y Experto |
| control-1 | 0/70 con diagrama detectado y 5/70 con proyecto; sin módulo Master |
| node | 36/83 con ayuda visual |
| foundations, rutaflow | sin módulo Master (decidir si aplica: Fundamentos y RutaFlow están exentos de capstone) |
