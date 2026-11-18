#!/usr/bin/env python3
"""Genera una captura de terminal (SVG) ejecutando comandos de verdad (specs/002, V2).

Ejemplo:
  python3 scripts/render_terminal_capture.py --cwd /tmp/ejemplo --title "estimar.py" \\
    --out web/public/content/figures/foundations/diseno-estimacion.svg \\
    --cmd "python3 estimar.py" --cmd 'echo "salida: $?"'

Cada --cmd se ejecuta en orden con bash dentro de --cwd; la salida real (stdout + stderr) se dibuja
debajo de su prompt. El SVG guarda en <desc> los comandos, la fecha y el código de salida, para que
cualquiera pueda reproducir la captura. Nunca se escribe salida a mano.
"""
from __future__ import annotations

import argparse
import datetime as dt
import subprocess
import sys
from pathlib import Path
from xml.sax.saxutils import escape

FONT_SIZE = 13
LINE_HEIGHT = 19
CHAR_WIDTH = 7.9  # ancho aproximado de un carácter monoespaciado a 13 px
PADDING = 18
TITLE_BAR = 30
MAX_COLUMNS = 96
COLORS = {"bg": "#1e1f24", "bar": "#2b2d33", "text": "#e6e6e6", "prompt": "#7dd3a8", "muted": "#9aa0a6"}


def run_commands(commands: list[str], cwd: Path, shell_state: str = "") -> tuple[list[tuple[str, str]], int]:
    """Ejecuta los comandos en una misma sesión de bash para conservar $? entre ellos."""
    transcript: list[tuple[str, str]] = []
    last_code = 0
    for command in commands:
        # Se encadena 'exit $last' para que "echo $?" vea el código del comando anterior.
        script = f"(exit {last_code}); {command}"
        result = subprocess.run(["bash", "-c", script], cwd=cwd, capture_output=True, text=True)
        transcript.append(("prompt", command))
        output = (result.stdout + result.stderr).rstrip("\n")
        for line in output.splitlines() if output else []:
            transcript.append(("out", line))
        last_code = result.returncode
    return transcript, last_code


def wrap(lines: list[tuple[str, str]]) -> list[tuple[str, str]]:
    wrapped = []
    for kind, text in lines:
        text = text.replace("\t", "    ")
        prefix = 2 if kind == "prompt" else 0
        width = MAX_COLUMNS - prefix
        chunks = [text[i:i + width] for i in range(0, len(text), width)] or [""]
        wrapped += [(kind if j == 0 else "out", chunk) for j, chunk in enumerate(chunks)]
    return wrapped


def render(lines: list[tuple[str, str]], title: str, desc: str) -> str:
    lines = wrap(lines)
    columns = max([len(t) + (2 if k == "prompt" else 0) for k, t in lines] + [40])
    width = int(PADDING * 2 + columns * CHAR_WIDTH)
    height = TITLE_BAR + PADDING * 2 + LINE_HEIGHT * len(lines)
    rows = []
    for i, (kind, text) in enumerate(lines):
        y = TITLE_BAR + PADDING + FONT_SIZE + i * LINE_HEIGHT
        if kind == "prompt":
            rows.append(
                f'<text x="{PADDING}" y="{y}" style="white-space: pre"><tspan fill="{COLORS["prompt"]}">$ </tspan>'
                f'<tspan fill="{COLORS["text"]}">{escape(text)}</tspan></text>'
            )
        else:
            rows.append(f'<text x="{PADDING}" y="{y}" style="white-space: pre" fill="{COLORS["text"]}">{escape(text)}</text>')
    dots = "".join(
        f'<circle cx="{18 + i * 18}" cy="{TITLE_BAR / 2}" r="5.5" fill="{c}"/>'
        for i, c in enumerate(("#ff5f57", "#febc2e", "#28c840"))
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" '
        f'role="img" aria-label="Captura de terminal: {escape(title, {chr(34): "&quot;"})}">\n'
        f"<title>Captura de terminal: {escape(title)}</title>\n<desc>{escape(desc)}</desc>\n"
        f'<rect width="{width}" height="{height}" rx="8" fill="{COLORS["bg"]}"/>\n'
        f'<rect width="{width}" height="{TITLE_BAR}" rx="8" fill="{COLORS["bar"]}"/>'
        f'<rect y="{TITLE_BAR - 8}" width="{width}" height="8" fill="{COLORS["bar"]}"/>{dots}\n'
        f'<text x="{width / 2}" y="{TITLE_BAR / 2 + 4}" text-anchor="middle" fill="{COLORS["muted"]}" '
        f'font-family="ui-sans-serif, system-ui, sans-serif" font-size="12">{escape(title)}</text>\n'
        f'<g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="{FONT_SIZE}" '
        f'xml:space="preserve" style="white-space: pre">\n' + "\n".join(rows) + "\n</g>\n</svg>\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--cwd", type=Path, required=True, help="carpeta donde se ejecutan los comandos")
    parser.add_argument("--title", required=True, help="título de la ventana (p. ej. el archivo o la tarea)")
    parser.add_argument("--out", type=Path, required=True, help="ruta del SVG de salida")
    parser.add_argument("--cmd", action="append", required=True, help="comando a ejecutar (repetible)")
    args = parser.parse_args()

    transcript, code = run_commands(args.cmd, args.cwd.resolve())
    stamp = dt.date.today().isoformat()
    desc = f"Generado con scripts/render_terminal_capture.py el {stamp}. Comandos en orden: {' ; '.join(args.cmd)}. Código de salida final: {code}."
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(render(transcript, args.title, desc), encoding="utf-8")
    print(f"captura escrita en {args.out} ({len(transcript)} líneas, salida final {code})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
