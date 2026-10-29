#!/usr/bin/env python3
"""Valida código, capítulos y presencia curricular de RutaFlow."""

from pathlib import Path
import importlib.util
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
README = ROOT / "examples" / "rutaflow" / "README.md"
EXPECTED = {
    "foundation": "foundation/domain.py",
    "javascript": "javascript/tracking-widget.js",
    "node": "node/confirm-delivery.ts",
    "angular": "angular/operations.store.ts",
    "react": "react/use-shipment-tracking.tsx",
    "java": "java/PricingEngine.java",
    "spring-boot": "spring-boot/DeliveryService.java",
    "kotlin-multiplatform": "kotlin-multiplatform/SyncEngine.kt",
    "android": "android/LocationPolicy.kt",
    "ios": "ios/LocationPolicy.swift",
    "flutter": "flutter/delivery_outbox.dart",
    "devops": "devops/deployment.yaml",
    "cloud": "cloud/template.yaml",
    "database": "database/schema.sql",
}
errors: list[str] = []
if not README.exists():
    errors.append("falta examples/rutaflow/README.md")
for capability, relative in EXPECTED.items():
    path = ROOT / "examples" / "rutaflow" / relative
    if not path.exists() or len(path.read_text(encoding="utf-8").splitlines()) < 10:
        errors.append(f"{capability}: implementación ausente o demasiado pequeña ({relative})")

# RutaFlow es un módulo aparte: por decisión explícita del curso, ningún otro
# track debe depender de él ni referenciarlo desde su contenido. Este validador
# ya no exige una sección "Proyecto transversal RutaFlow" en los demás tracks
# (ver scripts/enrich_rutaflow_projects.py, retirado por el mismo motivo).
# Solo se valida la implementación y el contenido propio de RutaFlow debajo.

route_source = ROOT / "web/src/app/tracks/rutaflow.track.ts"
course_data = (ROOT / "web/src/app/course-data.ts").read_text(encoding="utf-8")
if "id: 'rutaflow'" not in course_data or "modules: RUTAFLOW_MODULES" not in course_data:
    errors.append("RutaFlow no está registrado como ruta navegable")
if route_source.read_text(encoding="utf-8").count("  m(") != 8:
    errors.append("RutaFlow debe definir exactamente ocho módulos progresivos")
for module_id in range(8):
    path = ROOT / "web/public/content/rutaflow" / f"modulo-{module_id}.md"
    if not path.exists():
        errors.append(f"falta el capítulo visible RutaFlow {module_id}")
        continue
    text = path.read_text(encoding="utf-8")
    for heading in ("## Aprende construyendo",):
        if heading not in text:
            errors.append(f"rutaflow/{path.name}: falta {heading}")

# Ejecuta la referencia de fundamentos y valida la sintaxis del widget; así el
# proyecto no queda reducido a archivos que solo parecen código.
domain_path = ROOT / "examples" / "rutaflow" / "foundation" / "domain.py"
spec = importlib.util.spec_from_file_location("rutaflow_domain", domain_path)
if spec is None or spec.loader is None:
    errors.append("no se pudo cargar el dominio RutaFlow")
else:
    domain = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = domain
    spec.loader.exec_module(domain)
    route = domain.nearest_neighbor_route(
        (0.0, 0.0),
        [domain.Stop("far", 4.0, 0.0), domain.Stop("near", 1.0, 0.0)],
    )
    if [stop.shipment_id for stop in route] != ["near", "far"]:
        errors.append("la heurística RutaFlow no conserva el contrato esperado")
    try:
        domain.transition(domain.ShipmentStatus.CREATED, domain.ShipmentStatus.DELIVERED)
        errors.append("el dominio permitió una transición inválida")
    except ValueError:
        pass

javascript = ROOT / "examples" / "rutaflow" / "javascript" / "tracking-widget.js"
syntax = subprocess.run(["node", "--check", javascript], capture_output=True, text=True)
if syntax.returncode:
    errors.append(f"tracking-widget.js no compila: {syntax.stderr.strip()}")
if errors:
    print("RutaFlow FALLÓ:")
    for error in errors:
        print(f"- {error}")
    raise SystemExit(1)
print(f"RutaFlow OK: ruta visible de 8 capítulos y {len(EXPECTED)} implementaciones, sin acoplar otros tracks.")
