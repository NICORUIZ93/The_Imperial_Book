#!/usr/bin/env python3
"""Build living topic indexes and source crosswalks for priority tracks."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "web/public/content"
REPORT = ROOT / "docs/atomic-subtopics.json"
TRACKS = {
    "java": {
        "name": "Java",
        "project": "Motor de asignación de entregas",
        "prerequisite": "Fundamentos de programación; el módulo 0 comienza con JDK y terminal.",
        "sources": [
            ("roadmap.sh Java", "https://roadmap.sh/java"),
            ("Dev.java Learn", "https://dev.java/learn/"),
            ("Java SE 25 documentation", "https://docs.oracle.com/en/java/javase/25/"),
        ],
        "crosswalk": [
            ("Lenguaje, sintaxis y orientación a objetos", "M0–M1"),
            ("Colecciones, genéricos, excepciones y streams", "M2–M4, M20"),
            ("Concurrencia y programación asíncrona", "M5"),
            ("Archivos, fechas, HTTP y seguridad", "M6, M14, M18"),
            ("Builds, módulos y pruebas", "M8–M10, M15"),
            ("JVM, memoria, profiling y rendimiento", "M11, M14"),
            ("Patrones, integración y persistencia", "M12–M13, M15–M17, M20"),
        ],
    },
    "spring-boot": {
        "name": "Spring Boot",
        "project": "RutaFlow: plataforma de entregas basada en servicios",
        "prerequisite": "Java, HTTP, SQL y pruebas; los módulos iniciales vuelven a presentar cada herramienta.",
        "sources": [
            ("roadmap.sh Spring Boot", "https://roadmap.sh/spring-boot"),
            ("Spring Boot Reference", "https://docs.spring.io/spring-boot/reference/"),
            ("Spring Cloud Stream Reference", "https://docs.spring.io/spring-cloud-stream/reference/"),
        ],
        "crosswalk": [
            ("IoC, beans, configuración, AOP y starters", "M0–M1, M5"),
            ("REST, MVC, validación y documentación", "M2, M17"),
            ("JDBC, JPA, transacciones y migraciones", "M3, M13, M16–M17"),
            ("Seguridad, autenticación y autorización", "M4, M18"),
            ("Pruebas, observabilidad y Actuator", "M6–M7"),
            ("Kafka, eventos, entrega e idempotencia", "M8, M13–M15, M21"),
            ("Microservicios, Spring Cloud y resiliencia", "M10, M20–M22, M25"),
            ("Batch, GraphQL, Modulith y empaquetado", "M9, M11–M12, M19, M23–M24"),
        ],
    },
    "node": {
        "name": "Node.js",
        "project": "API operativa de entregas y workers RutaFlow",
        "prerequisite": "JavaScript, terminal y HTTP; el módulo 0 comienza por el runtime.",
        "sources": [
            ("roadmap.sh Node.js", "https://roadmap.sh/nodejs"),
            ("Node.js Learn", "https://nodejs.org/en/learn"),
            ("Kafka JavaScript client", "https://docs.confluent.io/kafka-clients/javascript/current/overview.html"),
            ("RabbitMQ tutorials and confirms", "https://www.rabbitmq.com/tutorials/tutorial-one-javascript"),
        ],
        "crosswalk": [
            ("Runtime, Event Loop, módulos y paquetes", "M0–M1"),
            ("Filesystem, streams, backpressure y HTTP", "M2–M3"),
            ("Express/Fastify, validación y WebSocket", "M4"),
            ("PostgreSQL, MongoDB, auth y pruebas", "M5–M7"),
            ("Workers, colas, Redis y event-driven", "M8, M14"),
            ("Logging, métricas, trazas y seguridad", "M9–M10"),
            ("Docker, despliegue, CI/CD y proyecto", "M11–M12, M14"),
            ("TypeScript, Kafka, RabbitMQ, Deno y Bun", "M13–M15"),
        ],
    },
    "flutter": {
        "name": "Flutter",
        "project": "RutaFlow Driver: aplicación de entregas conectada",
        "prerequisite": "Dart y fundamentos de UI; el módulo 0 comienza con el lenguaje.",
        "sources": [
            ("roadmap.sh Flutter", "https://roadmap.sh/flutter"),
            ("Flutter documentation", "https://docs.flutter.dev/"),
            ("Riverpod Notifier provider", "https://riverpod.dev/docs/providers/notifier_provider"),
        ],
        "crosswalk": [
            ("Dart, null safety, async y colecciones", "M0"),
            ("Widgets, layout, navegación y responsive", "M1–M3"),
            ("Estado, Riverpod y BLoC", "M4–M5, M14, M19"),
            ("HTTP, JSON y persistencia offline", "M6–M7, M19"),
            ("Plugins y comunicación con plataforma", "M8, M16–M17"),
            ("Firebase, animación, rendimiento y pruebas", "M9–M11, M18, M20"),
            ("Temas, publicación, web y desktop", "M12–M15"),
            ("App RutaFlow, compras y publicidad", "M19–M22"),
        ],
    },
}


def build(track: str, info: dict, report: dict) -> str:
    topics = report["topics"][track]
    summary = report["summary"][track]
    module_files = sorted(
        CONTENT.joinpath(track).glob("modulo-*.md"),
        key=lambda path: int(re.search(r"(\d+)", path.stem).group(1)),
    )
    by_module: dict[int, list[dict]] = {}
    for topic in topics:
        by_module.setdefault(topic["module"], []).append(topic)

    lines = [
        f"# Temario completo de {info['name']} — índice de expansión",
        "",
        "> Documento vivo de cobertura. Los archivos de lección enlazados son el contenido canónico. El índice conserva todos los temas existentes; un tema sin subtemas 4-pasos sigue pendiente aunque ya tenga explicación anterior.",
        "",
        f"**Proyecto continuo:** {info['project']}.",
        f"**Prerrequisito de entrada:** {info['prerequisite']}.",
        "**Duración objetivo:** temas de 20–45 minutos; cada tema se divide en 3–6 acciones de 5–15 minutos.",
        f"**Estado estructural:** {summary['completeTopics']}/{summary['topics']} temas migrados; auditoría estructural actualizada el 2026-11-03.",
        "",
        "## Índice de módulos y temas",
        "",
        "Los enlaces abren el Markdown de lección que la aplicación publica. La etiqueta `[4 pasos]` refleja solo criterios estructurales detectados; no significa que el ejemplo se haya ejecutado ni que una revisión pedagógica humana lo haya aprobado.",
        "",
    ]
    for path in module_files:
        module = int(re.search(r"(\d+)", path.stem).group(1))
        text = path.read_text(encoding="utf-8")
        module_heading = next((line[2:].strip() for line in text.splitlines() if line.startswith("# ")), f"Módulo {module}")
        relative = f"../web/public/content/{track}/{path.name}"
        lines.extend([f"### {module_heading}", "", f"[Abrir lección completa]({relative})", ""])
        for topic in by_module.get(module, []):
            title = topic["topic"].removeprefix("### ").strip()
            status = "[4 pasos]" if topic["complete"] else "[pendiente de migrar]"
            lines.append(f"- {status} {title}")
            for subtopic in topic["subtopics"]:
                sub_title = subtopic["title"].removeprefix("#### ").strip()
                sub_status = "✓" if subtopic["complete"] else "pendiente"
                lines.append(f"  - {sub_status} {sub_title}")
        lines.append("")

    lines.extend([
        "## Comparación de cobertura con fuentes de referencia",
        "",
        "La tabla registra presencia de áreas en el inventario del track, no profundidad profesional. La columna de migración usa la auditoría automática de estructura; los temas pendientes requieren revisión de contenidos, ejemplos y fuentes antes de declarar el curso exhaustivo.",
        "",
        "| Área de referencia | Módulos del inventario | Estado de contenido | Estado de cuatro pasos |",
        "|---|---|---|---|",
    ])
    for area, modules in info["crosswalk"]:
        lines.append(f"| {area} | {modules} | Inventariada; revisión temática manual pendiente | Migración parcial |")
    lines.extend(["", "### Fuentes consultadas", ""])
    for name, url in info["sources"]:
        lines.append(f"- [{name}]({url})")
    lines.extend([
        "",
        "### Huecos y límites reportados",
        "",
        f"- El repositorio contiene {summary['topics']} temas en {len(module_files)} módulos; {summary['completeTopics']} cumplen hoy los marcadores estructurales de 3–6 subtemas y cuatro pasos.",
        "- No hay base para afirmar que el track esté completo: la comparación con la fuente de referencia está pendiente de revisión humana módulo por módulo.",
        "- Los elementos de la fuente que todavía deben verificarse de forma explícita están enumerados en la tabla anterior; cualquier técnica crítica que no tenga tema propio debe añadirse conservando el currículo base.",
        "- La ejecución de ejemplos, el comportamiento con brokers/plataformas reales y la calidad pedagógica humana se registran por separado.",
        "",
        "## Proyecto integrador y hito final",
        "",
        f"Evoluciona el proyecto **{info['project']}** a través de los módulos. Al cerrar cada módulo, conserva el código, salida esperada, fallo diagnosticado y evidencia de la decisión técnica. El capstone queda pendiente hasta que el índice completo y sus huecos de referencia hayan sido revisados.",
        "",
    ])
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    report = json.loads(REPORT.read_text(encoding="utf-8"))
    stale = []
    for track, info in TRACKS.items():
        path = ROOT / f"docs/{track}-temario-completo.md"
        text = build(track, info, report)
        if args.check:
            if not path.exists() or path.read_text(encoding="utf-8") != text:
                stale.append(str(path.relative_to(ROOT)))
        else:
            path.write_text(text, encoding="utf-8")
    if stale:
        raise SystemExit("Temarios prioritarios desactualizados: " + ", ".join(stale))
    print(f"Temarios prioritarios {'verificados' if args.check else 'generados'}: {len(TRACKS)} tracks")


if __name__ == "__main__":
    main()
