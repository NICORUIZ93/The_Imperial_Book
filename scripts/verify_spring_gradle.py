#!/usr/bin/env python3
"""Ejecuta Gradle realmente; distingue tests, compilación y casos especiales.

Los resultados no acreditan broker, despliegue o un binario nativo. Use --projects
para repetir solo proyectos fallidos; --report permite guardar tandas separadas.
"""
import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import date
import json
import hashlib
import os
from pathlib import Path
import subprocess
import tempfile
import time
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

def input_digest(folder):
    files = []
    for file in folder.rglob('*'):
        if not file.is_file():
            continue
        relative = file.relative_to(folder)
        if any(part in {'build', 'target', '.gradle', '.git'} for part in relative.parts):
            continue
        if relative.parts[0] in {'src', 'gradle'} or file.name in {'build.gradle', 'settings.gradle', 'gradle.properties', 'gradlew', 'gradlew.bat', 'pom.xml'}:
            files.append(file)
    digest = hashlib.sha256()
    for file in sorted(files):
        digest.update(str(file.relative_to(folder)).encode())
        digest.update(b'\0')
        digest.update(file.read_bytes())
    return digest.hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--projects', nargs='*')
    parser.add_argument('--exclude', nargs='*', default=[])
    parser.add_argument('--workers', type=int, default=2)
    parser.add_argument('--report', default='docs/spring-gradle-verification.json')
    parser.add_argument('--timeout', type=int, default=360)
    args = parser.parse_args()
    manifest = json.loads((ROOT / 'docs/spring-gradle-labs.json').read_text())
    projects = [row['project'] for row in manifest['projects']]
    if args.projects:
        unknown = set(args.projects) - set(projects)
        if unknown:
            raise SystemExit(f'Proyectos desconocidos: {unknown}')
        projects = args.projects
    projects = [project for project in projects if project not in args.exclude]
    env = os.environ.copy()
    # Docker también funciona: solo descubre Podman cuando no hay DOCKER_HOST.
    if not env.get('DOCKER_HOST'):
        try:
            socket = subprocess.check_output(['podman', 'machine', 'inspect', '--format', '{{.ConnectionInfo.PodmanSocket.Path}}'], text=True, stderr=subprocess.DEVNULL, timeout=10).strip()
            if socket and Path(socket).exists():
                env.update(DOCKER_HOST='unix://' + socket,
                           TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE='/var/run/docker.sock',
                           TESTCONTAINERS_RYUK_DISABLED='true')
        except (OSError, subprocess.SubprocessError):
            pass
    logs = Path(tempfile.mkdtemp(prefix='imperial-gradle-'))
    print(f'Logs: {logs}', flush=True)

    def run(project):
        folder = ROOT / project
        tasks = ['clean', 'verifyContracts'] if folder.name == 'spring-cloud-contract-rutaflow' else ['clean', 'classes', 'test']
        command = ['./gradlew', '--no-daemon', '--console=plain'] + tasks
        started = time.monotonic()
        log = logs / (folder.name + '.log')
        try:
            with log.open('w') as out:
                code = subprocess.run(command, cwd=folder, env=env, stdout=out, stderr=subprocess.STDOUT, timeout=args.timeout).returncode
        except subprocess.TimeoutExpired:
            code = 124
        counts = {key: 0 for key in ['tests', 'failures', 'errors', 'skipped']}
        for file in folder.glob('**/build/test-results/**/TEST-*.xml'):
            attributes = ET.parse(file).getroot().attrib
            for key in counts:
                counts[key] += int(attributes.get(key, 0))
        row = dict(project=project, command=command, exitCode=code,
                   seconds=round(time.monotonic() - started, 1), sourceSha256=input_digest(folder), **counts)
        print(json.dumps(row), flush=True)
        return row

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        rows = list(pool.map(run, projects))
    report = dict(date=date.today().isoformat(), gradle=manifest['gradle'],
                  scope='Gradle classes/tests; cero tests es compilación. No ejecuta todos los ejercicios, infraestructura distribuida ni nativeCompile.',
                  results=rows)
    (ROOT / args.report).write_text(json.dumps(report, indent=2) + '\n')
    raise SystemExit(any(row['exitCode'] != 0 for row in rows))

if __name__ == '__main__':
    main()
