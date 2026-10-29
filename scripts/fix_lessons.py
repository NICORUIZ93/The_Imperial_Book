#!/usr/bin/env python3
"""
Escanea prosa del repositorio (docs, scripts, app Angular) en busca de mojibake,
palabras sospechosas de una mala conversión de codificación y signos `?` pegados
dentro de una palabra.

Uso: python3 scripts/fix_lessons.py
"""
import ast
import glob
import os
import re

ROOT = os.path.dirname(os.path.dirname(__file__))
TEXT_CHECK_GLOBS = [
    os.path.join(ROOT, 'README.md'),
    os.path.join(ROOT, 'install.sh'),
    os.path.join(ROOT, 'scripts', '*.py'),
    os.path.join(ROOT, 'web', 'src', 'app', '*.*'),
    os.path.join(ROOT, 'web', 'e2e', '*.*'),
]

MOJIBAKE_MARKERS = ['Ã', 'Â', '�', 'â€', 'â€œ', 'â€�', 'â€”']
MOJIBAKE_RE = re.compile('|'.join(re.escape(marker) for marker in MOJIBAKE_MARKERS))
QUESTION_IN_WORD_RE = re.compile(r'[A-Za-zÁÉÍÓÚáéíóúñÑ]\?[A-Za-zÁÉÍÓÚáéíóúñÑ]')
QUERY_STRING_RE = re.compile(r'[/\w.-]+\?[A-Za-z_][A-Za-z0-9_-]*=')
SUSPICIOUS_WORDS = [
    'idiomás',
    'Problemás',
    'SQSé',
    'simpleí',
    'correpsond',
    'operatico',
    'prpyecto',
    'selccionar',
    'emepzar',
    'funcioonar',
]
SUSPICIOUS_WORD_RE = re.compile('|'.join(re.escape(word) for word in SUSPICIOUS_WORDS), re.IGNORECASE)
SUSPICIOUS_ACRONYM_RE = re.compile(r'\b[A-Z]{2,}é\b')


def safe_print(value):
    print(str(value).encode('ascii', errors='backslashreplace').decode('ascii'))


def iter_text_check_files():
    files = []
    for pattern in TEXT_CHECK_GLOBS:
        files.extend(glob.glob(pattern))
    return sorted(set(files))


def find_text_quality_issues():
    issues = []
    for path in iter_text_check_files():
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError as exc:
            issues.append((path, 0, f'No es UTF-8 válido: {exc}'))
            continue

        # Excluye patrones re y literales raw con sintaxis regex; conserva la prosa.
        question_lines = content.splitlines()
        if path.endswith('.py'):
            for node in ast.walk(ast.parse(content)):
                pattern = None
                if (isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
                        and isinstance(node.func.value, ast.Name) and node.func.value.id == 're'
                        and node.func.attr in {'compile', 'search', 'match', 'fullmatch', 'sub', 'subn', 'findall', 'finditer', 'split'}
                        and node.args and isinstance(node.args[0], ast.Constant)
                        and isinstance(node.args[0].value, str)):
                    pattern = node.args[0]
                elif isinstance(node, ast.Constant) and isinstance(node.value, str):
                    source = ast.get_source_segment(content, node) or ''
                    if re.match(r"(?i)^r[\"']", source) and '(?:' in node.value:
                        pattern = node
                if pattern is not None:
                    for index in range(pattern.lineno - 1, pattern.end_lineno):
                        # AST expresa columnas como offsets UTF-8.
                        line_bytes = question_lines[index].encode('utf-8')
                        start = pattern.col_offset if index == pattern.lineno - 1 else 0
                        end = pattern.end_col_offset if index == pattern.end_lineno - 1 else len(line_bytes)
                        question_lines[index] = (line_bytes[:start] + b' ' * (end - start) + line_bytes[end:]).decode('utf-8')

        for number, line in enumerate(content.splitlines(), 1):
            if os.path.basename(path) == 'fix_lessons.py' and 20 <= number <= 40:
                continue
            if MOJIBAKE_RE.search(line):
                issues.append((path, number, 'Texto mojibake: ' + line[:180]))
            if QUESTION_IN_WORD_RE.search(question_lines[number - 1]) and not QUERY_STRING_RE.search(line):
                issues.append((path, number, 'Signo ? dentro de palabra: ' + line[:180]))
            if SUSPICIOUS_WORD_RE.search(line):
                issues.append((path, number, 'Palabra sospechosa: ' + line[:180]))
            if SUSPICIOUS_ACRONYM_RE.search(line):
                issues.append((path, number, 'Acrónimo con tilde sospechosa: ' + line[:180]))
    return issues


def main():
    text_issues = find_text_quality_issues()

    print('Problemas de texto detectados:', len(text_issues))
    for path, line, message in text_issues[:80]:
        rel = os.path.relpath(path, ROOT)
        safe_print(f'{rel}:{line}: {message}')

    return 1 if text_issues else 0


if __name__ == '__main__':
    raise SystemExit(main())
