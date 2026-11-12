#!/usr/bin/env python3
"""Execute the Python verification blocks published in Control 1 lessons.

This checks that snippets run; it does not grade the mathematical explanation or
the independent exercises. Install sympy, scipy and matplotlib in the chosen
Python environment before running this script.
"""

from concurrent.futures import ThreadPoolExecutor
from datetime import date
import hashlib
from importlib.metadata import PackageNotFoundError, version
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content/control-1"
REPORT = ROOT / "docs/control-1-code-verification.json"


def examples():
    for path in sorted(CONTENT.glob("modulo-*.md"), key=lambda p: int(p.stem.split("-")[1])):
        text = path.read_text()
        for heading in re.finditer(r"^#### Verificación con código[^\n]*\n", text, re.M):
            block = re.search(r"^```python\n(.*?)^```", text[heading.end():], re.M | re.S)
            if block is None:
                raise ValueError(f"Bloque Python ausente: {path.name}:{text[:heading.start()].count(chr(10)) + 1}")
            yield path, text[:heading.start()].count("\n") + 1, block.group(1)


def execute(item):
    path, line, code = item
    with tempfile.TemporaryDirectory(prefix="control1-code-") as folder:
        try:
            result = subprocess.run(
                [sys.executable, "-c", code], cwd=folder, capture_output=True,
                text=True, timeout=20, env={**os.environ, "MPLBACKEND": "Agg"},
            )
            return {
                "source": str(path.relative_to(ROOT)), "line": line,
                "codeSha256": hashlib.sha256(code.encode()).hexdigest(),
                "exitCode": result.returncode, "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip()[-500:],
            }
        except subprocess.TimeoutExpired:
            return {
                "source": str(path.relative_to(ROOT)), "line": line,
                "codeSha256": hashlib.sha256(code.encode()).hexdigest(),
                "exitCode": 124, "stdout": "", "stderr": "timeout 20 s",
            }


def main():
    items = list(examples())
    topic_count = sum(len(re.findall(r"^### Tema", path.read_text(), re.M))
                      for path in CONTENT.glob("modulo-*.md"))
    if len(items) != topic_count:
        raise SystemExit(f"Control 1: {len(items)} verificaciones para {topic_count} temas")
    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(execute, items))
    report = {
        "date": date.today().isoformat(),
        "python": sys.version.split()[0],
        "packages": {name: package_version(name) for name in ("sympy", "scipy", "matplotlib")},
        "scope": "Ejecución de cada bloque Python bajo el encabezado Verificación con código de Control 1. No acredita ejercicios independientes ni revisión pedagógica humana.",
        "summary": {"snippets": len(rows), "passed": sum(row["exitCode"] == 0 for row in rows),
                    "failed": sum(row["exitCode"] != 0 for row in rows)},
        "results": rows,
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(f"Control 1: {report['summary']['passed']}/{len(rows)} bloques Python ejecutados")
    raise SystemExit(report["summary"]["failed"] != 0)


def package_version(name):
    try:
        return version(name)
    except PackageNotFoundError:
        return None


if __name__ == "__main__":
    main()
