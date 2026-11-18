#!/usr/bin/env python3
"""Evalúa las skills del repositorio con NVIDIA SkillEvaluator (specs/005).

Corre `skillevaluator quality-check` (Tier 1 estático, sin claves ni Docker) sobre cada carpeta de
`.claude/skills/` y exige el puntaje mínimo de la spec. Escribe docs/skill-evaluation.{md,json}.

  python3 scripts/evaluate_skills.py            # evalúa y escribe el reporte
  python3 scripts/evaluate_skills.py --min 90   # cambia el umbral (por defecto 80)

Instalación: `uv tool install --python 3.13 skillevaluator` o `pip install skillevaluator`
(Python 3.12–3.14). https://github.com/NVIDIA/skillevaluator
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / ".claude" / "skills"
OUT_JSON = ROOT / "docs" / "skill-evaluation.json"
OUT_MD = ROOT / "docs" / "skill-evaluation.md"


def evaluate(skill: Path) -> dict:
    """Ejecuta quality-check con salida JSON y devuelve puntaje, nota y hallazgos."""
    with tempfile.TemporaryDirectory() as out:
        subprocess.run(
            ["skillevaluator", "quality-check", str(skill), "-r", "json", "-o", out],
            capture_output=True, text=True, check=False,
        )
        report_path = Path(out) / "skillevaluator-quality.json"
        if not report_path.is_file():
            return {"skill": skill.name, "score": 0.0, "grade": "?", "passed": False,
                    "findings": ["skillevaluator no produjo reporte"]}
        report = json.loads(report_path.read_text(encoding="utf-8"))
    summary = (report.get("quality_summary") or [{}])[0]
    findings = [f"[{g['severity']}] {g['message']}" for g in report.get("finding_groups", [])]
    return {
        "skill": skill.name,
        "score": float(summary.get("overall_score", 0.0)),
        "grade": summary.get("grade", "?"),
        "passed": bool(report.get("overall_passed")),
        "findings": findings,
        "version": report.get("version"),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--min", type=float, default=80.0, help="puntaje mínimo por skill")
    args = parser.parse_args()
    if shutil.which("skillevaluator") is None:
        print("evaluate_skills: falta skillevaluator. Instálalo con `uv tool install --python 3.13 skillevaluator`.")
        return 2

    results = [evaluate(s) for s in sorted(p for p in SKILLS.iterdir() if (p / "SKILL.md").is_file())]
    failing = [r for r in results if not r["passed"] or r["score"] < args.min]
    data = {"tool": "NVIDIA SkillEvaluator quality-check (Tier 1)", "minimum": args.min, "skills": results}
    OUT_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    lines = [
        "# Evaluación de skills con NVIDIA SkillEvaluator",
        "",
        f"> Generado por `scripts/evaluate_skills.py` (specs/005). Tier 1 estático; umbral del repo: {args.min:.0f}/100.",
        "> Tier 2 (duplicación) y Tier 3 (agente en sandbox) requieren proveedor LLM y no se corrieron.",
        "",
        "| Skill | Puntaje | Nota | Pasa | Hallazgos pendientes |",
        "|---|---:|:---:|:---:|---|",
    ]
    for r in results:
        ok = r["passed"] and r["score"] >= args.min
        lines.append(f"| {r['skill']} | {r['score']:.1f} | {r['grade']} | {'sí' if ok else '**no**'} | "
                     f"{'; '.join(r['findings']) or '—'} |")
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")
    for r in results:
        print(f"evaluate_skills: {r['skill']} {r['score']:.1f}/100 ({r['grade']})")
    if failing:
        print(f"evaluate_skills: {len(failing)} skill(s) bajo el umbral {args.min:.0f}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
