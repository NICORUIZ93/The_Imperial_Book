#!/usr/bin/env sh
# Validación mínima del repositorio (specs/011).
set -eu
ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

echo "== Paridad: cada módulo de un track tiene su archivo Markdown"
node <<'NODE'
const fs = require('fs');
const data = fs.readFileSync('web/src/app/course-data.ts', 'utf8');
const ids = [...data.matchAll(/\{ id: '([\w-]+)', name:/g)].map(m => m[1]);
let fallos = 0;
for (const id of ids) {
  const dir = `web/public/content/${id === 'cloud' ? 'cloud' : id}`;
  if (!fs.existsSync(dir)) { console.error(`Falta la carpeta ${dir}`); fallos++; continue; }
  const md = fs.readdirSync(dir).filter(f => /^modulo-\d+\.md$/.test(f)).length;
  console.log(`${id}: ${md} archivos de módulo`);
  if (md === 0) { console.error(`${id} no tiene módulos`); fallos++; }
}
if (fallos) process.exit(1);
NODE

echo "== Índice de temas al día"
python3 scripts/build_web_topic_index.py --check

echo "== Página Temario al día"
python3 scripts/build_curriculum_catalog.py --check

echo "== Laboratorios citados por las lecciones"
python3 scripts/validate_lesson_labs.py

echo "== Capturas y ayudas de código de los temas en alcance (specs/002)"
python3 scripts/audit_visual_aids.py

echo "== Recursos enlazados por las lecciones y conteos declarados (specs/001)"
python3 scripts/audit_lesson_assets.py

echo "== Reportes del prompt maestro al día (specs/003 y specs/004)"
python3 scripts/build_zero_to_master_report.py --check
python3 scripts/audit_track_master_prompt.py --check

echo "== Specs"
python3 scripts/validate_specs.py

echo "validate.sh: ok"
