#!/usr/bin/env python3
"""Valida el curso «Microservicios de Cero a Maestro» contra el prompt del dueño (specs/018).

Cada tema del inventario (docs/temarios/microservicios-inventario.json) debe existir como
`### <tema>` en su módulo y tener la ficha completa de 14 puntos, con las pruebas que exige
el prompt: diagrama Mermaid con texto alternativo, código ejecutable, laboratorio con
output esperado, verificación con test, error común, pregunta con respuesta modelo y
anti-patrón. También comprueba los entregables globales y los laboratorios por módulo.

Uso:
  python3 scripts/validate_fichas.py            # informe y código de salida (0 = todo cumple)
  python3 scripts/validate_fichas.py --resumen  # solo la cobertura por módulo
"""
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "web/public/content/microservices"
INVENTARIO = ROOT / "docs/temarios/microservicios-inventario.json"
ENTREGABLES = ROOT / "docs/microservicios"
LABS = ROOT / "examples/microservicios"

SECCIONES = [
    "UBICACIÓN", "PRERREQUISITOS", "OBJETIVO DE APRENDIZAJE", "ANALOGÍA VISUAL",
    "DIAGRAMA TÉCNICO", "EXPLICACIÓN NIVEL 0", "EXPLICACIÓN INTERMEDIA", "EXPLICACIÓN MAESTRA",
    "CÓDIGO EJECUTABLE", "MINI-LABORATORIO", "VERIFICACIÓN", "ERROR COMÚN",
    "PREGUNTA DE ENTREVISTA", "ANTI-PATRÓN RELACIONADO",
]
# Módulos del prompt con exigencias extra (por etiqueta).
SEGURIDAD = {"Módulo 9", "Módulo 20", "Módulo 27"}
RESILIENCIA = {"Módulo 8", "Módulo 19"}

ENTREGABLES_REQUERIDOS = {
    "01-portada.md": "Portada visual (paleta, tipografía, estilo gráfico)",
    "02-mapa.md": "Mapa visual del curso",
    "03-tabla-de-contenidos.md": "Tabla de contenidos con duración, dificultad y dependencias",
    "04-indice-de-fichas.md": "Índice de fichas",
    "05-glosario.md": "Glosario visual de 120 términos",
    "06-cheat-sheets.md": "Cheat sheets por fase",
    "07-plantillas.md": "Plantillas: ADR, rúbrica del Comité, diario de aprendizaje",
    "08-herramientas-y-versiones.md": "Checklist de herramientas con versiones",
    "09-costos.md": "Estimación de costo de infraestructura",
    "10-accesibilidad.md": "Guía de accesibilidad",
}


def norm(texto: str) -> str:
    texto = unicodedata.normalize("NFKD", texto.lower())
    texto = "".join(c for c in texto if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", texto).strip()


def temas(md: str):
    """Devuelve (título, cuerpo) de cada `### ` del módulo."""
    partes = re.split(r"^### ", md, flags=re.MULTILINE)
    for parte in partes[1:]:
        titulo, _, cuerpo = parte.partition("\n")
        yield titulo.strip(), cuerpo


def secciones(cuerpo: str) -> dict:
    res = {}
    for m in re.finditer(r"^#### (\d{1,2})\. ([^\n]+)\n(.*?)(?=^#### \d{1,2}\. |\Z)", cuerpo, re.MULTILINE | re.DOTALL):
        res[int(m.group(1))] = (m.group(2).strip(), m.group(3))
    return res


def bloques(texto: str):
    return re.findall(r"^```([\w+.-]*)\n(.*?)^```", texto, re.MULTILINE | re.DOTALL)


def revisar_ficha(item: dict, cuerpo: str) -> list[str]:
    faltas = []
    secs = secciones(cuerpo)
    for i, nombre in enumerate(SECCIONES, 1):
        if i not in secs:
            faltas.append(f"falta la sección {i}. {nombre}")
        elif norm(secs[i][0]) != norm(nombre):
            faltas.append(f"la sección {i} se llama «{secs[i][0]}» y debe ser «{nombre}»")
    def texto(n):
        return secs.get(n, ("", ""))[1]
    if not any(lang == "mermaid" for lang, _ in bloques(texto(5))):
        faltas.append("5: el diagrama técnico no tiene bloque mermaid")
    if "texto alternativo" not in texto(5).lower():
        faltas.append("5: el diagrama no tiene texto alternativo")
    codigo = [b for b in bloques(texto(9)) if b[0] not in ("", "text", "mermaid")]
    if not codigo:
        faltas.append("9: no hay código ejecutable")
    if "versión" not in texto(9).lower() and "version" not in texto(9).lower():
        faltas.append("9: el código no declara versiones")
    if "output esperado" not in texto(10).lower():
        faltas.append("10: el laboratorio no tiene «Output esperado»")
    if not bloques(texto(10)):
        faltas.append("10: el laboratorio no tiene comandos")
    if not bloques(texto(11)) or "test" not in texto(11).lower():
        faltas.append("11: la verificación no incluye un test ejecutable")
    if "respuesta modelo" not in texto(13).lower():
        faltas.append("13: la pregunta no tiene «Respuesta modelo»")
    if item["etiqueta"] in SEGURIDAD:
        bajo = cuerpo.lower()
        if "antes (vulnerable)" not in bajo or "después (seguro)" not in bajo:
            faltas.append("seguridad: falta el código «Antes (vulnerable)» y «Después (seguro)»")
    if item["etiqueta"] in RESILIENCIA and "simulación del fallo" not in cuerpo.lower():
        faltas.append("resiliencia: falta la «Simulación del fallo» con script")
    return faltas


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--resumen", action="store_true")
    a = ap.parse_args()
    inventario = json.loads(INVENTARIO.read_text())["fichas"]
    problemas: dict[str, list[str]] = {}
    por_modulo: dict[str, list[int]] = {}
    cache: dict[str, list] = {}
    for item in inventario:
        ruta = CONTENT / item["archivo"]
        if item["archivo"] not in cache:
            cache[item["archivo"]] = list(temas(ruta.read_text())) if ruta.exists() else []
        clave = norm(item["tema"])
        encontrado = next((c for t, c in cache[item["archivo"]] if clave and clave in norm(t)), None)
        faltas = ["no existe el tema en su módulo"] if encontrado is None else revisar_ficha(item, encontrado)
        ok, total = por_modulo.setdefault(f'{item["etiqueta"]} ({item["archivo"]})', [0, 0]), None
        ok[1] += 1
        if faltas:
            problemas[f'{item["id"]} {item["etiqueta"]} · {item["tema"]}'] = faltas
        else:
            ok[0] += 1

    globales = []
    for nombre, desc in ENTREGABLES_REQUERIDOS.items():
        if not (ENTREGABLES / nombre).exists():
            globales.append(f"falta el entregable {desc} (docs/microservicios/{nombre})")
    glosario = ENTREGABLES / "05-glosario.md"
    if glosario.exists():
        filas = [l for l in glosario.read_text().splitlines() if l.startswith("| ") and not l.startswith("| Término") and "---" not in l]
        if len(filas) < 120:
            globales.append(f"el glosario tiene {len(filas)} términos y debe tener 120")
    contenido = "\n".join(p.read_text() for p in CONTENT.glob("modulo-*.md"))
    no_usar = contenido.lower().count("respuesta correcta: no usar microservicios")
    if no_usar < 3:
        globales.append(f"hay {no_usar} ejercicios cuya respuesta correcta es no usar microservicios; deben ser 3 o más")
    for item in {i["archivo"]: i for i in inventario}.values():
        lab = LABS / Path(item["archivo"]).stem
        if not (lab / "README.md").exists():
            globales.append(f"falta el laboratorio examples/microservicios/{lab.name}/README.md ({item['etiqueta']})")
        # bash 3.2 de macOS: «$var» seguido de un carácter no ASCII («, …, ñ) da «unbound variable». Usar ${var}.
        for sh in lab.rglob("*.sh"):
            if "node_modules" in sh.parts:
                continue
            for n, linea in enumerate(sh.read_text(errors="replace").splitlines(), 1):
                if re.search(r"\$[A-Za-z_][A-Za-z0-9_]*[^\x00-\x7F]", linea):
                    globales.append(f"{sh.relative_to(ROOT)}:{n}: variable junto a carácter no ASCII; usa ${{var}} (bash 3.2)")

    total = len(inventario)
    completas = total - len(problemas)
    print(f"Fichas completas: {completas}/{total}")
    for mod, (ok, n) in por_modulo.items():
        print(f"  {'✔' if ok == n else '✘'} {mod}: {ok}/{n}")
    if not a.resumen:
        for clave, faltas in problemas.items():
            print(f"\n✘ {clave}")
            for f in faltas:
                print(f"   - {f}")
        if globales:
            print("\nEntregables y reglas globales:")
            for g in globales:
                print(f"   - {g}")
    return 0 if not problemas and not globales else 1


if __name__ == "__main__":
    sys.exit(main())
