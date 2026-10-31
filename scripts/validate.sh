#!/usr/bin/env sh
set -eu

ROOT="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$ROOT"

node <<'NODE'
const fs = require('fs');
const crypto = require('crypto');

const requiredFiles = [
  'README.md',
  'docker-compose.yml',
  '.env.example',
  'web/package.json',
  'web/src/app/course-data.ts',
  'web/src/app/course/lesson-viewer.ts',
  'web/src/app/course/lesson-viewer.html',
  'web/src/app/content.service.ts',
];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) throw new Error(`Falta ${file}`);
}

if (fs.existsSync('floci-install.sh')) {
  const flociDocs = fs.readFileSync('docs/floci.md', 'utf8');
  const expected = flociDocs.match(/SHA-256 del instalador descargado \(corte 2026-10-30\):\s*`([a-f0-9]{64})`/);
  if (!expected) throw new Error('docs/floci.md no registra el SHA-256 aprobado del instalador');
  const actual = crypto.createHash('sha256').update(fs.readFileSync('floci-install.sh')).digest('hex');
  if (actual !== expected[1]) {
    throw new Error(`floci-install.sh no coincide con el SHA-256 documentado (esperado ${expected[1]}, actual ${actual})`);
  }
}

const angularCourseData = fs.readFileSync('web/src/app/course-data.ts', 'utf8');

// ── App Angular (tracks universitarios) ──────────────────────────────────────
// Por cada track real, el numero de archivos web/public/content/<track>/modulo-*.md
// debe coincidir exactamente con el numero de modulos definidos en su fuente
// TypeScript (cada uno declarado como m(<numero>, ...)), para detectar contenido
// huerfano o modulos sin redactar.
const TRACK_SOURCES = {
  foundations: 'web/src/app/tracks/foundations.track.ts',
  cloud: 'web/src/app/course-data.ts',
  devops: 'web/src/app/tracks/devops.track.ts',
  javascript: 'web/src/app/tracks/javascript.track.ts',
  node: 'web/src/app/tracks/node.track.ts',
  angular: 'web/src/app/tracks/angular.track.ts',
  react: 'web/src/app/tracks/react.track.ts',
  java: 'web/src/app/tracks/java.track.ts',
  'spring-boot': 'web/src/app/tracks/spring-boot.track.ts',
  'kotlin-multiplatform': 'web/src/app/tracks/kotlin-multiplatform.track.ts',
  android: 'web/src/app/tracks/android.track.ts',
  ios: 'web/src/app/tracks/ios.track.ts',
  flutter: 'web/src/app/tracks/flutter.track.ts',
  rutaflow: 'web/src/app/tracks/rutaflow.track.ts',
};

const trackIdsInData = [...angularCourseData.matchAll(/id:\s*'([a-z-]+)'/g)].map((m) => m[1]);
for (const trackId of Object.keys(TRACK_SOURCES)) {
  if (!trackIdsInData.includes(trackId)) {
    throw new Error(`web/src/app/course-data.ts no registra el track '${trackId}' en TRACKS`);
  }
}
if (trackIdsInData.length !== Object.keys(TRACK_SOURCES).length) {
  throw new Error(`TRACKS debe tener ${Object.keys(TRACK_SOURCES).length} tracks. Encontrados=${trackIdsInData.length}`);
}

for (const [trackId, sourceFile] of Object.entries(TRACK_SOURCES)) {
  const source = fs.readFileSync(sourceFile, 'utf8');
  const definedModules = (source.match(/^\s*m\(\d+,/gm) || []).length;
  const contentDir = `web/public/content/${trackId}`;
  const moduleFiles = fs.existsSync(contentDir)
    ? fs.readdirSync(contentDir).filter((f) => /^modulo-\d+\.md$/.test(f)).length
    : 0;
  if (definedModules === 0) {
    throw new Error(`${sourceFile} no define ningun modulo m(...)`);
  }
  if (moduleFiles !== definedModules) {
    throw new Error(`El track '${trackId}' define ${definedModules} modulos en ${sourceFile} pero tiene ${moduleFiles} archivos en ${contentDir}/`);
  }
  for (const heading of ['## Aprende construyendo']) {
    const missing = [];
    for (let i = 0; i < moduleFiles; i += 1) {
      const file = `${contentDir}/modulo-${i}.md`;
      if (!fs.existsSync(file)) { missing.push(i); continue; }
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes(heading)) missing.push(i);
    }
    if (missing.length) {
      throw new Error(`Track '${trackId}': faltan modulos sin '${heading}': ${missing.join(', ')}`);
    }
  }
  const modulesWithoutTopics = [];
  for (let i = 0; i < moduleFiles; i += 1) {
    const content = fs.readFileSync(`${contentDir}/modulo-${i}.md`, 'utf8');
    if (!/^### Tema(?:\s|:)/m.test(content)) modulesWithoutTopics.push(i);
  }
  if (modulesWithoutTopics.length) {
    throw new Error(`Track '${trackId}': módulos sin temas prácticos: ${modulesWithoutTopics.join(', ')}`);
  }
}

const readme = fs.readFileSync('README.md', 'utf8');
const fullReview = fs.readFileSync('docs/full-review.md', 'utf8');
const readmeCoverage = readme.match(/registra (\d+)\/(\d+) temas con los nueve criterios detectados/);
const reportCoverage = fullReview.match(/\| Criterios editoriales \| (\d+)\/(\d+) temas/);
if (readme.includes('1094/1100') || !readmeCoverage || !reportCoverage ||
    readmeCoverage[1] !== reportCoverage[1] || readmeCoverage[2] !== reportCoverage[2]) {
  throw new Error('README desactualizado vs full-review.md: criterios editoriales');
}
const sourceRegistry = JSON.parse(fs.readFileSync('docs/official-sources.json', 'utf8'));
const readmeExpiry = readme.match(/La comprobación vence a los (\d+) días/);
if (!readmeExpiry || Number(readmeExpiry[1]) !== sourceRegistry.maxAgeDays) {
  throw new Error('README desactualizado vs official-sources.json: caducidad');
}
const declaredInventory = readme.match(/La academia reúne 14 tracks, (\d+) módulos y (\d+) temas editoriales/);
if (!declaredInventory) {
  throw new Error('README.md debe declarar el inventario actual de 14 tracks, módulos y temas');
}
const moduleTable = readme.match(
  /^\| Track \| Módulos \| Enfoque \|\n^\|[-| :]+\|\n((?:^\|[^\n]+\|\n?)+)/m,
);
if (!moduleTable) throw new Error('README.md debe incluir la tabla Track | Módulos | Enfoque');
const tableRows = [...moduleTable[1].matchAll(/^\| [^|]+ \| (\d+) \| [^|]+ \|$/gm)];
const moduleTotal = tableRows.reduce((total, row) => total + Number(row[1]), 0);
const expectedModuleTotal = Object.values(TRACK_SOURCES).reduce((total, sourceFile) => {
  const source = fs.readFileSync(sourceFile, 'utf8');
  return total + (source.match(/^\s*m\(\d+,/gm) || []).length;
}, 0);
if (Number(declaredInventory[1]) !== moduleTotal || moduleTotal !== expectedModuleTotal) {
  throw new Error(
    `README.md declara ${declaredInventory[1]} módulos; tabla=${moduleTotal}, tracks=${expectedModuleTotal}`,
  );
}

// Los 3 diagramas Mermaid pedidos (arquitectura, flujo de peticion, comparativa)
// deben existir en el contenido real del track Cloud.
const cloudModulo0 = fs.readFileSync('web/public/content/cloud/modulo-0.md', 'utf8');
const cloudModulo6 = fs.readFileSync('web/public/content/cloud/modulo-6.md', 'utf8');
const cloudModulo8 = fs.readFileSync('web/public/content/cloud/modulo-8.md', 'utf8');
if (!cloudModulo0.includes('```mermaid') || !cloudModulo0.includes('flowchart')) {
  throw new Error('cloud/modulo-0.md debe incluir el diagrama Mermaid de arquitectura de Floci');
}
if (!cloudModulo6.includes('```mermaid') || !cloudModulo6.includes('sequenceDiagram')) {
  throw new Error('cloud/modulo-6.md debe incluir el diagrama Mermaid de flujo de peticion');
}
if (!cloudModulo8.includes('| Categoría | AWS | Azure | GCP |')) {
  throw new Error('cloud/modulo-8.md debe incluir la tabla comparativa AWS vs Azure vs GCP');
}

console.log(`Validación OK: aplicación Angular única, ${trackIdsInData.length} tracks y contenido Markdown completo.`);
NODE

python3 -m unittest discover -s scripts/tests
python3 scripts/validate_pedagogy.py
python3 scripts/validate_curriculum.py
python3 scripts/validate_merged_pdf.py
python3 scripts/validate_official_sources.py
python3 scripts/validate_official_learning_paths.py
python3 scripts/validate_floci_official_curriculum.py
python3 scripts/validate_code_quality.py
python3 scripts/validate_rutaflow.py
python3 scripts/validate_requested_master_topics.py
python3 examples/manim/build_curriculum_scenes.py --check
python3 scripts/validate_markdown_fences.py
python3 scripts/audit_topic_learning_quality.py --check --require-practicable --min-practicable 1100
python3 scripts/audit_seven_step_methodology.py --check
python3 scripts/audit_lesson_substance.py --check --strict
python3 scripts/audit_code_visual_quality.py --check
python3 scripts/build_editorial_backlog.py --check
python3 scripts/validate_learning_priorities.py
python3 scripts/build_web_topic_index.py --check
python3 scripts/build_prerequisite_graph.py --check
python3 scripts/build_repo_graph.py --check

python3 scripts/audit_course_depth.py --check
python3 scripts/build_full_review.py --check
python3 scripts/verify_professional_bridges.py
python3 scripts/validate_rutaflow_material.py
