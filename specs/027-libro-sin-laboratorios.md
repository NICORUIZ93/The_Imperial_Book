# 027 · Libro que lo muestra todo: retirada de laboratorios y explicación desde cero

**Estado:** en curso
**Origen:** revisión del 2026-11-22. El dueño define la página como un libro que le muestra
todo al estudiante; los `examples/` son un apéndice que el alumno nunca ve y que pertenece a
una concepción anterior del proyecto (curso de laboratorios ejecutables).

**Principio rector:** destilar, no volcar. Los 2729 archivos de `examples/` son fuente para
elegir el fragmento mínimo que aclara cada tema, no contenido para copiar en las lecciones.
Cada tema explica sus prerrequisitos en el momento en que los usa; «desde cero» no significa
repetirlo todo en cada tema, porque eso haría el libro ilegible.

**Preservación:** el material queda en el tag `retirado/examples-2026-11-22` antes de borrarlo.

## 1. Criterios

### Fase A — retirada limpia

- **C1** `hecho` — El tag `retirado/examples-2026-11-22` contiene el árbol completo de
  `examples/` antes de la retirada.
  Verificación: `git cat-file -e retirado/examples-2026-11-22^{commit} && git ls-tree -r --name-only retirado/examples-2026-11-22 examples/ | wc -l`

- **C2** `hecho` — Cero referencias a `examples/` en las lecciones publicadas
  (`web/public/content/**/*.md`) y en la app (`web/src/app/**`). El código se muestra en el
  propio tema; no se pide al alumno que navegue a una carpeta ni ejecute `./verificar.sh`.
  Verificación: `! grep -rIl 'examples/' web/public/content web/src/app --include='*.md' --include='*.ts' --include='*.html'`

- **C3** `hecho` — `examples/` eliminado del árbol y del índice de Git; no queda carpeta
  física ni referencia en `.gitignore` que la resucite.
  Verificación: `! test -e examples && ! git ls-files examples | grep -q .`

- **C4** `hecho` — Se retira toda la maquinaria que solo servía a los laboratorios:
  `scripts/validate_lesson_labs.py`, el bloque Maven de `.github/workflows/ci.yml`, y las
  comprobaciones de punteros/rutas de laboratorio en `scripts/audit_code_coherence.py` y
  `scripts/validate_fichas.py`. `validate.sh` y el CI no invocan nada retirado.
  Verificación: `! grep -q "validate_lesson_labs" scripts/validate.sh .github/workflows/ci.yml && ! grep -q "examples/" scripts/validate.sh .github/workflows/ci.yml scripts/audit_code_coherence.py scripts/validate_fichas.py`

- **C5** `hecho` — Los informes regenerables se recalculan y el trinquete no retrocede:
  `validate.sh: ok`, `check_deuda: al día`, 42 unitarias y 88 e2e en verde.
  Verificación: `VALIDATE_SH_EN_CURSO=1 ./scripts/validate.sh`

### Fase B — explicación desde cero (por lotes)

- **C6** `hecho` — Auditor de prerrequisitos: detecta ausencia de declaración de prerrequisitos y
  términos técnicos de alta señal usados antes de definirse/verlos en el curso. Genera informes en
  `docs/auditoria/prerrequisitos.{md,csv,json}`; `--check` solo falla en cursos declarados en
  `docs/reestructuracion/cursos-desde-cero.json` para migrar por lotes sin legalizar deuda.
  Verificación: `python3 scripts/audit_prerrequisitos.py --resumen`

- **C7** `en-curso` — **Piloto, una línea por lote**: Fundamentos, Microservicios y Angular.
  Cada tema del lote declara «Para entender esto necesitas…», explica esos conceptos antes de
  usarlos y muestra el código mínimo con qué hace / por qué / qué pasa si cambia.
  Avance: `foundations` declarado en `cursos-desde-cero.json` y limpio por auditor (2026-11-22);
  faltan `microservices` y `angular`.
  Verificación: `python3 scripts/audit_prerrequisitos.py --check --curso <curso>`

- **C8** `pendiente` — Los 13 cursos restantes se migran por capítulos, con `validate.sh` y e2e
  en verde al cierre de cada lote. No se marca `hecho` en bloque.
  Verificación: `python3 scripts/audit_prerrequisitos.py --check`

## 2. Reglas de ejecución

1. Un criterio pasa a `hecho` solo cuando su verificación se ejecutó en esta máquina y se registró.
2. No se borra nada sin tag previo; el tag de preservación es parte de C1.
3. Los informes que `validate.sh` comprueba se regeneran antes de cerrar cada lote.
4. Los cambios de contenido llevan detrás `build_web_topic_index.py`, informes y e2e.
5. Fase B se ejecuta por lotes pequeños; ningún lote se marca `hecho` en bloque.
6. No se tocan ramas, stash ni tags existentes sin confirmación del dueño.
