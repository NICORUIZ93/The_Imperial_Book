#!/usr/bin/env sh
# Validación mínima para la página web.
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
  const dir = `web/public/content/${id}`;
  if (!fs.existsSync(dir)) { console.error(`Falta la carpeta ${dir}`); fallos++; continue; }
  const md = fs.readdirSync(dir).filter(f => /^modulo-\d+\.md$/.test(f)).length;
  console.log(`${id}: ${md} archivos de módulo`);
  if (md === 0) { console.error(`${id} no tiene módulos`); fallos++; }
}
if (fallos) process.exit(1);
NODE

echo "== Índice de temas al día"
python3 scripts/build_web_topic_index.py --check

echo "== Recursos enlazados por las lecciones y conteos declarados"
python3 scripts/audit_lesson_assets.py

echo "validate.sh: ok"
