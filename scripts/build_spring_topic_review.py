#!/usr/bin/env python3
"""Inventario por tema/subtema unido a notas de revisión técnica explícitas.

El conteo automático no emite un juicio pedagógico ni ejecuta los ejemplos.
Las notas de revisión se mantienen aparte, para no inventarlas desde marcadores.
"""
from pathlib import Path
import argparse
import json
import re

ROOT = Path(__file__).resolve().parents[1]

def build():
    notes = json.loads((ROOT / 'docs/spring-boot-topic-review-notes.json').read_text())
    modules = []
    rows = []
    for number in range(26):
        relative = f'web/public/content/spring-boot/modulo-{number}.md'
        text = (ROOT / relative).read_text()
        matches = list(re.finditer(r'^### Tema[^\n]*\n', text, re.M))
        assert len(matches) == len(notes[str(number)]), f'Notas desactualizadas: módulo {number}'
        topics = []
        for index, match in enumerate(matches):
            end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
            body = text[match.end():end]
            submatches = list(re.finditer(r'^#### Subtema[^\n]*\n', body, re.M))
            subtopics = []
            for subindex, submatch in enumerate(submatches):
                subend = submatches[subindex + 1].start() if subindex + 1 < len(submatches) else len(body)
                subbody = body[submatch.end():subend]
                prose = re.sub(r'^```[^\n]*\n.*?^```', '', subbody, flags=re.M | re.S)
                prose = re.sub(r'^#{1,6}[^\n]*$', '', prose, flags=re.M)
                blocks = re.findall(r'^```([^\n]*)\n(.*?)^```', subbody, re.M | re.S)
                subtopics.append({
                    'heading': submatch.group().strip().removeprefix('#### '),
                    'line': text[:match.end()].count('\n') + body[:submatch.start()].count('\n') + 1,
                    'proseWords': len(prose.split()),
                    'codeLines': sum(len(code.splitlines()) for _, code in blocks),
                    'hasBodyBeyondHeading': bool(prose.strip()),
                    'codeLanguages': list(dict.fromkeys(language for language, _ in blocks)),
                })
            title = match.group().strip().removeprefix('### ')
            topics.append({
                'topic': index + 1, 'title': title,
                'line': text[:match.start()].count('\n') + 1,
                'review': notes[str(number)][index],
                'buildRoute': 'javac/Node.js' if number == 22 else 'Python (complemento SOAP)' if number == 20 and index == 5 else 'Maven y alternativa Gradle',
                'subtopics': subtopics,
            })
            link = f'../{relative}#L{text[:match.start()].count(chr(10)) + 1}'
            rows.append(f'| {number}.{index + 1} | [{title.replace("|", "/")}]({link}) | {len(subtopics)} | {notes[str(number)][index]} |')
        modules.append({'module': number, 'source': relative, 'topics': topics})
    subs = [sub for module in modules for topic in module['topics'] for sub in topic['subtopics']]
    paths = sorted(set(path.rstrip('.') for module in modules for path in re.findall(r'(?<![\w/])examples/[\w./-]+', (ROOT / module['source']).read_text())))
    missing = [path for path in paths if not (ROOT / path).exists()]
    lab_roots = {ROOT / Path(*Path(path).parts[:2]) for path in paths}
    gradle_builds = sorted(str(build.relative_to(ROOT)) for lab in lab_roots
                           for build in lab.rglob('build.gradle*')
                           if not any(part in {'target', 'node_modules', 'build'} for part in build.relative_to(lab).parts))
    report = {
        'date': '2026-11-11',
        'scope': 'Lectura técnica asistida y revisión de secuencia por tema; inventario de todos los subtemas. No revisión pedagógica humana ni ejecución individual de 393 ejercicios.',
        'summary': {'modules': len(modules), 'topics': len(rows), 'subtopics': len(subs),
                    'subtopicsWithBody': sum(sub['hasBodyBeyondHeading'] for sub in subs),
                    'explicitRepositoryPaths': len(paths), 'missingRepositoryPaths': missing,
                    'gradleLaboratories': len(json.loads((ROOT / 'docs/spring-gradle-labs.json').read_text())['projects']) if (ROOT / 'docs/spring-gradle-labs.json').exists() else len(gradle_builds), 'gradleBuildFiles': gradle_builds},
        'modules': modules,
    }
    intro = (ROOT / 'docs/spring-boot-topic-review-intro.md').read_text()
    markdown = intro.rstrip() + '\n\n| Módulo.tema | Tema real | Subtemas | Revisión de secuencia, ejemplo y límite |\n|---|---|---:|---|\n' + '\n'.join(rows) + '\n'
    return report, markdown

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    report, markdown = build()
    outputs = {'docs/spring-boot-revision-tema-por-tema.json': json.dumps(report, ensure_ascii=False, indent=2) + '\n',
               'docs/SPRING-BOOT-REVISION-TEMA-POR-TEMA.md': markdown}
    for relative, text in outputs.items():
        path = ROOT / relative
        if args.check:
            if not path.exists() or path.read_text() != text:
                raise SystemExit(f'Revisión desactualizada: {relative}')
        else:
            path.write_text(text)
    assert report['summary']['topics'] == 111
    assert report['summary']['subtopics'] == 393
    assert report['summary']['subtopicsWithBody'] == 393
    assert not report['summary']['missingRepositoryPaths']
    print(json.dumps(report['summary'], ensure_ascii=False))

if __name__ == '__main__':
    main()
