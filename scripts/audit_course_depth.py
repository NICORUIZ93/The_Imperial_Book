#!/usr/bin/env python3
"""Inventario de revisión de profundidad; señales, nunca certificación de aprendizaje."""
from __future__ import annotations
import argparse
from collections import Counter
import json
from pathlib import Path
import re
from audit_topic_learning_quality import student_visible_content, topic_blocks

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/course-depth-review.json'
MD = ROOT / 'docs/course-depth-review.md'
# Prioridades editoriales derivadas de la lectura del catálogo, objetivos y demostraciones.
# Son criterios a verificar, no ausencia inferida de una palabra en un título.
PRIORITIES = {
 'foundations': ('HTML/CSS antes de frameworks; archivos y ejecución antes de persistencia avanzada', 'Interfaz semántica operable por teclado, algoritmo con casos límite y SQL reproducible'),
 'javascript': ('Formularios, DOM y errores de red antes de patrones avanzados', 'Cliente que conserva entrada, anuncia errores y distingue cancelación de fallo'),
 'node': ('HTTP y validación antes de autenticación e integraciones', 'API con límites de carga, paginación estable, pruebas y cierre ordenado'),
 'angular': ('HTML/CSS/TypeScript explícitos; RxJS y estado con ejemplos completos', 'Rutas, formularios, datos remotos y cambios sin guardar comprobados con navegador'),
 'react': ('JSX y estado antes de efectos; proveedor, dependencias y API visibles', 'Carga, error, vacío y carrera de respuestas; caché observada, no supuesta'),
 'java': ('Clases completas antes de concurrencia; no reemplazar implementación por un enunciado', 'Compilación, errores, Futures, recursos cerrados y cancelación cooperativa'),
 'spring-boot': ('Java/HTTP/SQL como requisitos; proyecto y starters reproducibles', 'Contratos HTTP, validación, autorización por recurso y consulta real con límites'),
 'android': ('Kotlin antes de Compose; distinguir recomposición, recreación y muerte de proceso', 'App instalable con permisos, restauración, persistencia y pruebas en dispositivo'),
 'ios': ('Swift antes de SwiftUI; explicitar macOS/Xcode y destino', 'Cancelación, estados de red, persistencia y accesibilidad comprobados en simulador'),
 'flutter': ('Dart antes de widgets; ejemplo con main y destino de ejecución', 'Restauración, red, pruebas de widget, integración y publicación por plataforma'),
 'kotlin-multiplatform': ('Kotlin y source sets antes de interoperabilidad', 'Política común sin dependencias nativas; reloj controlado y pruebas por destino'),
 'cloud': ('Terminal/HTTP/Docker antes de servicios; emulación distinta de cloud real', 'Infraestructura, permisos mínimos, restauración ensayada, RPO/RTO y costes observados'),
 'devops': ('Aplicación ejecutable antes de CI/CD; código de salida y artefactos identificables', 'Pipeline con promoción, rollback comprobado, observabilidad e incidente ensayado'),
 'rutaflow': ('Integrar una especialidad por incremento; dominio y contratos antes de microservicios', 'Flujo completo con versión antigua/nueva, fallo y recuperación sin pérdida semántica'),
}

def signals(demo: str) -> list[str]:
    found = []
    if not demo: return ['demostracion-no-delimitada']
    if re.search(r'python3? ejemplo\.py', demo) and not re.search(r'(crea|guarda|archivo)[^\n]{0,80}ejemplo\.py', demo, re.I):
        found.append('archivo-ejemplo-no-presentado')
    if re.search(r'\bnpm test\b', demo) and 'no trae un comando `npm test`' not in demo and not re.search(r'"test"\s*:|vitest|jest|plantilla de pruebas|suite existente', demo, re.I):
        found.append('comprobar-script-test')
    code = [(lang, body) for lang, body in re.findall(r'^```(\w*)\n(.*?)^```', demo, re.M | re.S)
            if lang not in ('mermaid', 'text', 'bash', 'sh', 'shell')]
    # No confundir rest/spread (...items) con un hueco marcado por puntos suspensivos.
    if any(re.search(r'(?<!\.)\.\.\.(?=\s*[);\n}]|\s*$)|\bTODO\b|YOUR_API', body) for _, body in code):
        found.append('comprobar-fragmento-incompleto')
    if code and sum(len([line for line in body.splitlines() if line.strip()]) for _, body in code) < 5:
        found.append('ejemplo-breve-revisar-contexto')
    if re.search(r'useQuery\(', demo) and not re.search(r'QueryClientProvider|plantilla|repositorio', demo):
        found.append('proveedor-query-no-visible')
    if re.search(r'(crea|implementa)[^\n]{0,150}\.java', demo, re.I) and not re.search(r'\bclass\s+\w+', demo):
        found.append('clase-java-no-visible')
    return found


def build() -> dict:
    manifest = json.loads((ROOT / 'examples/professional-bridges/manifest.json').read_text())
    material = ROOT / 'examples/rutaflow-material/manifest.json'
    if material.exists(): manifest += json.loads(material.read_text())
    new_topics = {(x['track'], x['module'], x['title']) for x in manifest}
    rows = []
    for path in sorted((ROOT / 'web/public/content').glob('*/modulo-*.md')):
        raw = path.read_text()
        module = int(re.search(r'\d+', path.stem)[0])
        for title, block in topic_blocks(student_visible_content(raw)):
            demo = re.search(r'^#### Paso 4[^\n]*\n([\s\S]*?)(?=^#### Paso 5|\Z)', block, re.M | re.I)
            clean_title = re.sub(r'^Tema(?:\s+(?:\d+|complementario))?\s*:\s*', '', title)
            rows.append({'track':path.parent.name, 'module':module, 'title':title,
                'file':str(path.relative_to(ROOT)), 'line':next((i for i, line in enumerate(raw.splitlines(), 1) if line.endswith(title)), 1),
                'signals':signals(demo[1] if demo else ''),
                'newLaboratory':(path.parent.name, module, clean_title) in new_topics,
                'humanPedagogicalReview':'pending', 'executionEvidence':'see examples/professional-bridges/verification.json for new laboratories; historical examples not executed by this audit'})
    return {'method':'Lectura automática de todos los bloques visibles; alertas para revisión, no veredictos de corrección ni aprendizaje. Una demo breve puede ser suficiente. La ausencia de alertas no acredita ejecutabilidad.',
        'totals':{'tracks':len(PRIORITIES),'modules':len(list((ROOT/'web/public/content').glob('*/modulo-*.md'))),'topics':len(rows),
            'topicsWithSignals':sum(bool(x['signals']) for x in rows),'newLaboratories':len(new_topics)},
        'priorities':{track:{'sequence':a,'evidence':b} for track,(a,b) in PRIORITIES.items()}, 'topics':rows}


def markdown(data: dict) -> str:
    lines=['# Revisión de profundidad de todos los cursos','',data['method'],'',
        'Se distingue revisión estructural, ejecución de ejemplos, pruebas de navegador y revisión pedagógica con personas. La columna de señales NO cuenta temas ausentes ni errores confirmados. Las prioridades describen el alcance a demostrar para pasar de la base a la práctica profesional.','',
        '| Curso | Temas | Con señales | Prioridad de secuencia | Evidencia requerida |','|---|---:|---:|---|---|']
    for track,p in data['priorities'].items():
        rows=[x for x in data['topics'] if x['track']==track]
        lines.append(f"| {track} | {len(rows)} | {sum(bool(x['signals']) for x in rows)} | {p['sequence']} | {p['evidence']} |")
    lines+=['','## Registro tema por tema','', 'La revisión pedagógica humana permanece pendiente para todos los temas. Los laboratorios nuevos tienen una verificación técnica separada; la ejecución correcta tampoco demuestra comprensión.','',
        '| Curso / módulo | Tema | Señales para revisar |','|---|---|---|']
    for row in data['topics']:
        signals_text=', '.join(row['signals']) or 'Sin señales de estos detectores; revisión pendiente'
        lines.append(f"| {row['track']} / {row['module']} | [{row['title'].replace('|','/')}](../{row['file']}) | {signals_text} |")
    return '\n'.join(lines)+'\n'


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    data=build(); outputs={OUT:json.dumps(data,ensure_ascii=False,indent=2)+'\n',MD:markdown(data)}
    if args.check:
        stale=[str(p.relative_to(ROOT)) for p,text in outputs.items() if not p.exists() or p.read_text()!=text]
        if stale: raise SystemExit('Regenera revisión de profundidad: '+', '.join(stale))
    else:
        for p,text in outputs.items():p.write_text(text)
    print('Revisión estructural de profundidad:',data['totals'])

if __name__ == '__main__':main()
