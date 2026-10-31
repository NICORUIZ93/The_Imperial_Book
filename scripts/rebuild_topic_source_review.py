#!/usr/bin/env python3
"""Reconstruye el registro acotado de fuentes sin convertir acceso HTTP en pertinencia."""

from __future__ import annotations

import argparse
import json
import re
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

from audit_code_visual_quality import official_source_urls, structural_text, student_visible_content

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "docs/topic-source-review.json"
URL_PATTERN = re.compile(r"https?://[^\s<>\[\])`\"']+", re.IGNORECASE)
TRAILING_PUNCTUATION = ".,;:"


def topic_blocks(text: str) -> dict[str, tuple[str, int]]:
    visible = student_visible_content(text)
    headings = list(re.finditer(r"^###\s+(Tema(?:[^:]*)?:\s*[^\n]+)", visible, re.MULTILINE))
    result: dict[str, tuple[str, int]] = {}
    for index, heading in enumerate(headings):
        end = headings[index + 1].start() if index + 1 < len(headings) else len(visible)
        title = heading.group(1).strip()
        result[title] = (visible[heading.start():end], visible[:heading.start()].count("\n") + 1)
    return result


def prose_urls(block: str) -> list[str]:
    visible = structural_text(student_visible_content(block))
    return sorted({match.rstrip(TRAILING_PUNCTUATION) for match in URL_PATTERN.findall(visible)})


def check_url(url: str) -> dict[str, object]:
    checked_at = datetime.now(timezone.utc).isoformat()
    process = subprocess.run(
        [
            "curl", "-L", "-sS", "-o", "/dev/null", "--max-time", "30",
            "-w", "%{http_code}\t%{url_effective}\t%{content_type}", url,
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    fields = process.stdout.strip().split("\t", 2)
    status = int(fields[0]) if fields and fields[0].isdigit() else 0
    return {
        "url": url,
        "status": status,
        "finalUrl": fields[1] if len(fields) > 1 else url,
        "contentType": fields[2] if len(fields) > 2 else "",
        "title": None,
        "checkedAt": checked_at,
        "scope": "HTTP GET; no valida pertinencia, vigencia ni afirmaciones",
        **({"error": process.stderr.strip()} if process.returncode else {}),
    }


def is_reachable(check: dict[str, object]) -> bool:
    status = check.get("status")
    return isinstance(status, int) and 200 <= status < 400


def rebuild(check_new_urls: bool) -> dict:
    data = json.loads(REPORT.read_text(encoding="utf-8"))
    files: dict[str, dict[str, tuple[str, int]]] = {}

    for row in data["topics"]:
        path = row["path"]
        if path not in files:
            files[path] = topic_blocks((ROOT / path).read_text(encoding="utf-8"))
        block_data = files[path].get(row["topic"])
        if block_data is None:
            raise ValueError(f"Tema del registro no encontrado: {path} · {row['topic']}")
        block, line = block_data
        citations = sorted({url.rstrip(TRAILING_PUNCTUATION) for url in official_source_urls(block)})
        row["line"] = line
        row["originalProseUrls"] = prose_urls(block)
        row["providerCitations"] = citations
        row["recognitionStatus"] = "primary-domain-detected" if citations else "unrecognized-source-pending"
        row["reason"] = (
            "Dominio documental exacto reconocido; falta revisar su aplicación a la afirmación concreta."
            if citations else
            "El host no está clasificado o la URL es local/de ejemplo; revisión manual pendiente."
        )

    previous_checks = {row["url"]: row for row in data.get("urlChecks", [])}
    cited_urls = sorted({url for row in data["topics"] for url in row["providerCitations"]})
    missing = [url for url in cited_urls if not is_reachable(previous_checks.get(url, {}))]
    if check_new_urls and missing:
        with ThreadPoolExecutor(max_workers=8) as pool:
            futures = {pool.submit(check_url, url): url for url in missing}
            for future in as_completed(futures):
                previous_checks[futures[future]] = future.result()
    for url in missing:
        previous_checks.setdefault(url, {
            "url": url,
            "status": 0,
            "finalUrl": url,
            "contentType": "",
            "title": None,
            "checkedAt": None,
            "scope": "Comprobación HTTP pendiente; no valida pertinencia, vigencia ni afirmaciones",
        })
    data["urlChecks"] = [previous_checks[url] for url in cited_urls]

    topics = data["topics"]
    checks = data["urlChecks"]
    data["reviewedAt"] = datetime.now(timezone.utc).date().isoformat()
    data["summary"] = {
        "baselineUnrecognizedTopics": len(topics),
        "additionalRecognizedTopics": sum(bool(row["providerCitations"]) for row in topics),
        "remainingUnrecognizedTopics": sum(not row["providerCitations"] for row in topics),
        "applicabilityPendingTopics": sum(row["applicabilityReview"] == "revisión manual pendiente" for row in topics),
        "urlsChecked": len(checks),
        "urlsReachable": sum(is_reachable(row) for row in checks),
        "urlsPending": sum(not is_reachable(row) for row in checks),
    }
    data["providerHostsReviewed"] = sorted({
        urlsplit(url).hostname
        for row in topics for url in row["providerCitations"]
        if urlsplit(url).hostname
    })
    return data


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-new-urls", action="store_true")
    parser.add_argument("--check", action="store_true", help="Falla si el archivo generado difiere.")
    args = parser.parse_args()
    data = rebuild(args.check_new_urls)
    rendered = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if REPORT.read_text(encoding="utf-8") != rendered:
            raise SystemExit("docs/topic-source-review.json está desactualizado")
        return
    REPORT.write_text(rendered, encoding="utf-8")


if __name__ == "__main__":
    main()
