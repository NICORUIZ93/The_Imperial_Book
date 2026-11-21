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

echo "== Orden pedagógico de los temas (numeración continua y nivel no decreciente)"
python3 scripts/audit_topic_order.py --check

echo "== Citas numéricas entre temas (existen, no se auto-citan, miran hacia atrás)"
python3 scripts/audit_topic_citations.py --check

echo "== Completitud de cada curso (capítulos registrados, etapas, capítulo Master, anclas)"
python3 scripts/audit_course_completeness.py --check

echo "== Microservicios de Cero a Maestro: fichas de 14 puntos, track e índice (specs/018)"
python3 scripts/validate_fichas.py --resumen > /dev/null
echo "validate_fichas: ok"
python3 scripts/build_microservices_track.py --check
python3 scripts/build_microservices_indice.py --check

echo "== Laboratorios citados por las lecciones"
python3 scripts/validate_lesson_labs.py

echo "== Capturas y ayudas de código de los temas en alcance (specs/002)"
python3 scripts/audit_visual_aids.py

echo "== Recursos enlazados por las lecciones y conteos declarados (specs/001)"
python3 scripts/audit_lesson_assets.py

echo "== Reportes del prompt maestro al día (specs/003 y specs/004)"
python3 scripts/build_zero_to_master_report.py --check
python3 scripts/audit_track_master_prompt.py --check

echo "== Auditoría de los 12 puntos de la definición de terminado (MASTER-PROMPT sección 4)"
# Se comprueba que el informe esté al día, no un porcentaje: la puerta de umbral solo se pone
# cuando el criterio exista en todos, si no se legaliza la deuda que hay hoy.
python3 scripts/audit_master_prompt_items.py --check

echo "== Coherencia material del código de cada tema (rutas usadas que ningún tema crea)"
# Solo frescura del informe, no el número: mientras queden temas con C1 sin revisar no hay umbral que
# gatear, y fijar uno ahora legalizaría la deuda. La puerta de umbral se pondrá sobre el 90 %.
python3 scripts/audit_code_coherence.py --check

echo "== Fuentes oficiales: fecha de consulta y enlace vivo (MASTER-PROMPT sección 1.3)"
# Se gatea que el registro refleje el contenido de hoy, no que todas las fuentes estén fechadas: la fecha
# la declaran 7 de 1608 temas y un umbral ahora legalizaría esa deuda. El número se lee en el artefacto.
python3 scripts/validate_official_sources.py --check

echo "== Specs"
echo "== Formato único (specs/021)"
python3 scripts/validate_formato.py --check > /tmp/validate_formato.out || { tail -1 /tmp/validate_formato.out; exit 1; }
tail -1 /tmp/validate_formato.out
python3 scripts/build_estado_temas.py --check

# Guarda contra recursión: hay criterios cuya verificación es este mismo script.
if [ -n "${VALIDATE_SH_EN_CURSO:-}" ]; then
  python3 scripts/validate_specs.py
else
  VALIDATE_SH_EN_CURSO=1 python3 scripts/validate_specs.py --run
fi

echo "validate.sh: ok"
