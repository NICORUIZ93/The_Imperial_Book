#!/usr/bin/env python3
"""Build a compact repository map for AI assistants.

The output is intentionally small enough to paste or preload at the beginning of
an assistant session. It favors stable navigation signals over full source text.
"""

from __future__ import annotations

import argparse
import ast
import json
import re
import subprocess
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_OUTPUT = Path("docs/repo-graph.md")
DEFAULT_JSON_OUTPUT = Path("docs/repo-graph.json")
MAX_SYMBOLS_PER_FILE = 24
MAX_HEADINGS_PER_FILE = 12
MAX_IMPORTS_PER_FILE = 20
MAX_FILES_BY_TYPE = 18

SKIP_DIRS = {
    ".angular",
    ".claude",
    ".dart_tool",
    ".git",
    ".venv",
    ".vscode",
    "__pycache__",
    "coverage",
    "dist",
    "node_modules",
    "playwright-report",
    "test-results",
}

SKIP_EXTENSIONS = {
    ".bak",
    ".ico",
    ".jpg",
    ".jpeg",
    ".lock",
    ".png",
    ".pyc",
    ".webp",
}

SKIP_NAMES = {
    ".gitignore",
    "manifest.json",
    "package-lock.json",
    "repo-graph.md",
    "repo-graph.json",
}

TEXT_EXTENSIONS = {
    ".css",
    ".dart",
    ".env",
    ".go",
    ".html",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".kt",
    ".md",
    ".mjs",
    ".py",
    ".rs",
    ".scss",
    ".sh",
    ".swift",
    ".tf",
    ".ts",
    ".txt",
    ".yaml",
    ".yml",
}


@dataclass
class FileNode:
    path: Path
    lines: int
    kind: str
    symbols: list[str] = field(default_factory=list)
    imports: list[str] = field(default_factory=list)
    headings: list[str] = field(default_factory=list)


def repo_files(root: Path) -> list[Path]:
    """Indexa archivos versionables, no artefactos privados o ignorados del equipo.

    `rglob` y los archivos no añadidos incluían configuración local que no forma
    parte del cambio versionado. Se indexa el contenido del índice de Git para que
    el grafo generado represente exactamente el conjunto que se publicará.
    """
    try:
        result = subprocess.run(
            ["git", "ls-files", "--cached", "-z"],
            cwd=root,
            check=True,
            capture_output=True,
        )
        candidates = sorted(Path(item.decode("utf-8")) for item in result.stdout.split(b"\0") if item)
    except (FileNotFoundError, subprocess.CalledProcessError, UnicodeDecodeError):
        candidates = [path.relative_to(root) for path in sorted(root.rglob("*")) if path.is_file()]

    files: list[Path] = []
    for rel in candidates:
        path = root / rel
        if not path.is_file():
            continue
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if path.name in SKIP_NAMES:
            continue
        if path.suffix.lower() in SKIP_EXTENSIONS:
            continue
        if path.suffix.lower() not in TEXT_EXTENSIONS and path.name not in {
            ".env.example",
            ".gitignore",
            "Dockerfile",
        }:
            continue
        files.append(rel)
    return files


def read_text(root: Path, rel: Path) -> str:
    try:
        return (root / rel).read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return (root / rel).read_text(encoding="latin-1")


def classify(rel: Path) -> str:
    parts = rel.parts
    suffix = rel.suffix.lower()
    if parts[:2] == ("web", "src"):
        return "angular-app"
    if parts[:3] == ("web", "public", "content"):
        return "course-content"
    if parts and parts[0] == "scripts":
        return "automation-script"
    if parts and parts[0] == "examples":
        return "example"
    if suffix in {".md", ".txt"}:
        return "documentation"
    if rel.name in {"docker-compose.yml", "Dockerfile"}:
        return "local-infra"
    return "project-file"


def parse_ts_symbols(text: str) -> list[str]:
    patterns = [
        r"\bexport\s+(?:abstract\s+)?class\s+([A-Za-z0-9_]+)",
        r"\bexport\s+interface\s+([A-Za-z0-9_]+)",
        r"\bexport\s+type\s+([A-Za-z0-9_]+)",
        r"\bexport\s+(?:async\s+)?function\s+([A-Za-z0-9_]+)",
        r"\b(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*(?:signal|computed|inject|new\s+Subject|new\s+BehaviorSubject)\b",
        r"\b(public|private|protected)?\s*([A-Za-z0-9_]+)\s*=\s*(?:signal|computed)\b",
    ]
    symbols: list[str] = []
    for pattern in patterns:
        for match in re.finditer(pattern, text):
            name = match.group(match.lastindex or 1)
            if name and name not in {"public", "private", "protected"}:
                symbols.append(name)
    return unique(symbols)


def parse_ts_imports(text: str) -> list[str]:
    imports: list[str] = []
    for match in re.finditer(r"\bfrom\s+['\"]([^'\"]+)['\"]", text):
        imports.append(match.group(1))
    for match in re.finditer(r"\bimport\s*\(\s*['\"]([^'\"]+)['\"]\s*\)", text):
        imports.append(match.group(1))
    return unique(imports)


def parse_python_symbols(text: str) -> list[str]:
    try:
        tree = ast.parse(text)
    except SyntaxError:
        return []
    symbols: list[str] = []
    for node in ast.iter_child_nodes(tree):
        if isinstance(node, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef)):
            symbols.append(node.name)
    return symbols


def parse_python_imports(text: str) -> list[str]:
    try:
        tree = ast.parse(text)
    except SyntaxError:
        return []
    imports: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            imports.append(node.module)
    return unique(imports)


def parse_markdown_headings(text: str) -> list[str]:
    headings = []
    for line in text.splitlines():
        match = re.match(r"^(#{1,4})\s+(.+)$", line)
        if match:
            headings.append(f"{match.group(1)} {match.group(2).strip()}")
    return headings[:MAX_HEADINGS_PER_FILE]


def unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    output: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            output.append(value)
    return output


def analyze_file(root: Path, rel: Path) -> FileNode:
    text = read_text(root, rel)
    suffix = rel.suffix.lower()
    node = FileNode(
        path=rel,
        lines=text.count("\n") + (1 if text else 0),
        kind=classify(rel),
    )

    if suffix in {".ts", ".js", ".mjs"}:
        node.symbols = parse_ts_symbols(text)[:MAX_SYMBOLS_PER_FILE]
        node.imports = parse_ts_imports(text)[:MAX_IMPORTS_PER_FILE]
    elif suffix == ".py":
        node.symbols = parse_python_symbols(text)[:MAX_SYMBOLS_PER_FILE]
        node.imports = parse_python_imports(text)[:MAX_IMPORTS_PER_FILE]
    elif suffix == ".md":
        node.headings = parse_markdown_headings(text)
    elif suffix == ".html":
        node.symbols = unique(re.findall(r"\bid=['\"]([^'\"]+)['\"]", text))[:MAX_SYMBOLS_PER_FILE]

    return node


def import_edges(nodes: list[FileNode]) -> list[tuple[str, str]]:
    by_path = {node.path.as_posix(): node for node in nodes}
    edges: list[tuple[str, str]] = []
    for node in nodes:
        base = node.path.parent
        for specifier in node.imports:
            if not specifier.startswith("."):
                continue
            target_base = (base / specifier).as_posix()
            candidates = [
                target_base,
                f"{target_base}.ts",
                f"{target_base}.js",
                f"{target_base}.mjs",
                f"{target_base}.py",
                f"{target_base}/index.ts",
            ]
            for candidate in candidates:
                normalized = str(Path(candidate))
                if normalized in by_path:
                    edges.append((node.path.as_posix(), normalized))
                    break
    return edges


def render_markdown(root: Path, nodes: list[FileNode]) -> str:
    generated = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    kind_counts = Counter(node.kind for node in nodes)
    suffix_counts = Counter(node.path.suffix.lower() or node.path.name for node in nodes)
    edges = import_edges(nodes)
    inbound = Counter(target for _, target in edges)
    outbound = Counter(source for source, _ in edges)
    by_kind: dict[str, list[FileNode]] = defaultdict(list)
    for node in nodes:
        by_kind[node.kind].append(node)

    lines = [
        "# The Imperial Book Repo Graph",
        "",
        f"Generated: {generated}",
        f"Root: `{root.name}`",
        f"Indexed files: {len(nodes)}",
        f"Import edges: {len(edges)}",
        "",
        "Use this file as the first, compact context for AI assistants. Refresh it with:",
        "",
        "```bash",
        "python3 scripts/build_repo_graph.py --json docs/repo-graph.json",
        "```",
        "",
        "For automated lookups, use `docs/repo-graph.json`.",
        "",
        "## Project Shape",
        "",
    ]

    for kind, count in sorted(kind_counts.items()):
        lines.append(f"- `{kind}`: {count} files")

    lines.extend(["", "## File Types", ""])
    for suffix, count in suffix_counts.most_common():
        lines.append(f"- `{suffix}`: {count}")

    lines.extend(["", "## High Signal Files", ""])
    key_files = [
        "README.md",
        "scripts/validate.sh",
        "scripts/build_repo_graph.py",
        "web/src/app/app.ts",
        "web/src/app/course-data.ts",
        "web/src/app/catalog/course-catalog.ts",
        "web/src/app/course/course-shell.ts",
        "web/src/app/course/lesson-viewer.ts",
        "web/public/content/manifest.json",
        "web/public/content/es/pasos.md",
    ]
    node_by_path = {node.path.as_posix(): node for node in nodes}
    for path in key_files:
        node = node_by_path.get(path)
        if not node:
            continue
        lines.append(f"- `{path}` ({node.lines} lines, {node.kind})")
        if node.symbols:
            lines.append(f"  - symbols: {', '.join(node.symbols[:10])}")
        if node.headings:
            lines.append(f"  - headings: {', '.join(node.headings[:5])}")

    lines.extend(["", "## Internal Import Graph", ""])
    if edges:
        for source, target in sorted(edges):
            lines.append(f"- `{source}` -> `{target}`")
    else:
        lines.append("- No local import edges detected.")

    lines.extend(["", "## Most Connected Files", ""])
    connected = sorted(
        set(inbound) | set(outbound),
        key=lambda path: (inbound[path] + outbound[path], inbound[path], path),
        reverse=True,
    )[:20]
    if connected:
        for path in connected:
            lines.append(f"- `{path}`: in={inbound[path]}, out={outbound[path]}")
    else:
        lines.append("- No connected files detected.")

    lines.extend(["", "## Files By Area", ""])
    for kind in sorted(by_kind):
        lines.extend(["", f"### {kind}", ""])
        for node in sorted(by_kind[kind], key=lambda item: item.path.as_posix())[:MAX_FILES_BY_TYPE]:
            detail = []
            if node.symbols:
                detail.append("symbols: " + ", ".join(node.symbols[:8]))
            if node.imports:
                detail.append("imports: " + ", ".join(node.imports[:8]))
            if node.headings:
                detail.append("headings: " + ", ".join(node.headings[:4]))
            suffix = f" - {'; '.join(detail)}" if detail else ""
            lines.append(f"- `{node.path.as_posix()}` ({node.lines} lines){suffix}")
        remaining = len(by_kind[kind]) - MAX_FILES_BY_TYPE
        if remaining > 0:
            lines.append(f"- ... {remaining} more files")

    return "\n".join(lines) + "\n"


def render_json(nodes: list[FileNode]) -> str:
    payload = {
        "files": [
            {
                "path": node.path.as_posix(),
                "lines": node.lines,
                "kind": node.kind,
                "symbols": node.symbols,
                "imports": node.imports,
                "headings": node.headings,
            }
            for node in nodes
        ],
        "edges": [{"source": source, "target": target} for source, target in import_edges(nodes)],
    }
    return json.dumps(payload, indent=2, ensure_ascii=True) + "\n"


def normalize_markdown_for_check(text: str) -> str:
    """Ignora lo que depende del entorno donde se generó el grafo.

    ``Generated`` es una marca de tiempo y ``Root`` es el nombre de la carpeta
    local: el mismo repositorio se clona como ``The_Imperial_Book`` en CI y con
    otro nombre en cada máquina. Comparar esos valores hacía fallar la
    validación en ambos sentidos y provocó una cadena de commits de "regenerar
    repo graph" que no corregían nada.
    """
    text = re.sub(r"^Generated: .*$", "Generated: <ignored>", text, flags=re.MULTILINE)
    return re.sub(r"^Root: `[^`]*`$", "Root: `<ignored>`", text, flags=re.MULTILINE)


def check_file(path: Path, expected: str, markdown: bool = False) -> bool:
    if not path.exists():
        print(f"Missing {path}")
        return False
    actual = path.read_text(encoding="utf-8")
    if markdown:
        actual = normalize_markdown_for_check(actual)
        expected = normalize_markdown_for_check(expected)
    if actual != expected:
        print(f"Outdated {path}")
        return False
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", default=".", help="Repository root to index.")
    parser.add_argument("--output", default=DEFAULT_OUTPUT, type=Path, help="Markdown output path.")
    parser.add_argument(
        "--json",
        dest="json_output",
        default=DEFAULT_JSON_OUTPUT,
        type=Path,
        help="Machine-readable JSON output path.",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit with an error if generated files are missing or outdated.",
    )
    args = parser.parse_args()

    root = Path(args.root).resolve()
    nodes = [analyze_file(root, rel) for rel in repo_files(root)]

    output = args.output if args.output.is_absolute() else root / args.output
    markdown = render_markdown(root, nodes)

    json_output = args.json_output if args.json_output.is_absolute() else root / args.json_output
    json_text = render_json(nodes)

    if args.check:
        markdown_ok = check_file(output, markdown, markdown=True)
        json_ok = check_file(json_output, json_text)
        if not markdown_ok or not json_ok:
            raise SystemExit("Repo graph is outdated. Run: python3 scripts/build_repo_graph.py")
        print(f"Repo graph OK: {len(nodes)} indexed files.")
        return

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(markdown, encoding="utf-8")

    json_output.parent.mkdir(parents=True, exist_ok=True)
    json_output.write_text(json_text, encoding="utf-8")

    print(
        f"Wrote {output.relative_to(root)} and {json_output.relative_to(root)} "
        f"with {len(nodes)} indexed files."
    )


if __name__ == "__main__":
    main()
