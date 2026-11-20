# 018 · Microservicios de Cero a Maestro (Spring Boot y Node.js por separado)

**Estado:** hecho
**Origen:** el 2026-11-19 el dueño entregó el prompt
[docs/temarios/PROMPT-MICROSERVICIOS-CERO-A-MAESTRO.md](../docs/temarios/PROMPT-MICROSERVICIOS-CERO-A-MAESTRO.md)
y pidió aplicarlo «tal cual, punto a punto, sin que se escape nada», con las **versiones más recientes**.
Reemplaza el temario de Microservicios de specs/017 (N4) y la forma de los temas de ese curso.

## Decisiones

- El curso `microservices` pasa a tener los 37 módulos del prompt, en su orden: Módulos 0.1–0.5
  (`modulo-0` … `modulo-4`) y Módulos 1–32 (`modulo-5` … `modulo-36`). Los títulos conservan la etiqueta
  del prompt («Módulo 0.3», «Módulo 14»…).
- Los 187 temas del inventario están en
  [docs/temarios/microservicios-inventario.json](../docs/temarios/microservicios-inventario.json), generado
  del prompt (las viñetas de las fases 1–3 y los temas que nombran los títulos de la fase 0).
- En este curso, cada tema es una **ficha de 14 puntos** con los encabezados exactos del prompt
  (`#### 1. UBICACIÓN` … `#### 14. ANTI-PATRÓN RELACIONADO`); sustituye la plantilla general de la
  metodología. Siguen valiendo la exactitud (todo ejecutado o con fuente primaria) y el tuteo.
- El dueño aceptó que el curso repita contenido de Fundamentos, Java, Spring Boot, Node, Docker y
  Kubernetes: la regla de oro del prompt exige que cada tema esté completo dentro del curso.
- **Versiones:** la estable más reciente (GA) de cada herramienta el día de escribir, comprobada en la
  fuente oficial y compatible con el resto; se registra en `docs/microservicios/08-herramientas-y-versiones.md`.
  Los mínimos del prompt (Java 21, Spring Boot 3.3+, Node 20 LTS…) quedan como suelo, no como objetivo.
  Esta línea es propia del curso; los demás cursos siguen `docs/VERSIONES.md`.
- Los laboratorios viven en `examples/microservicios/<modulo>/` y los que usan infraestructura arrancan con
  Docker Compose. Se verifican en el Mac del dueño (specs/015).
- El contenido anterior del curso (M0–M1 publicados y el borrador de M2–M4) se guarda en
  `docs/microservicios/material-previo/` como fuente para las fichas.
- La metadata de cada módulo se escribe en `docs/microservicios/track/modulo-N.json` y
  `scripts/build_microservices_track.py` genera el track; así varios autores no editan el mismo archivo.

## Criterios

- **M1** `hecho` — Las 187 fichas existen y cumplen los 14 puntos y las reglas del prompt; están los
  10 entregables, el glosario de 120 términos, los 3 ejercicios de «no usar microservicios» y un
  laboratorio por módulo.
  Verificación: `python3 scripts/validate_fichas.py`
- **M2** `hecho` — Los laboratorios del curso pasan en el Mac del dueño.
  Verificación: `! grep -h "	FAIL	" verificacion/microservicios/resultados.tsv`
- **M3** `hecho` — El track generado coincide con los módulos escritos.
  Verificación: `python3 scripts/build_microservices_track.py --check`
