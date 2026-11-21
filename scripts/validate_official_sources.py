#!/usr/bin/env python3
"""Verifica las fuentes oficiales de las lecciones: fecha de consulta y vigencia del enlace.

Es la herramienta que la sección 1.3 del MASTER-PROMPT promete («las fuentes caducan a los 120 días y se
vuelven a verificar») y que hasta hoy no existía: el apuntador estaba roto. Mide dos cosas distintas, y por
eso tienen dos modos:

  frescura  — cada lección declara «… consultadas el AAAA-MM-DD». Si esa fecha tiene más de
              `DIA_CADUCIDAD` días, la fuente está caducada y el tema no puede decirse actual.
  enlace    — la URL sigue respondiendo desde esta máquina. Se comprueba por HTTP y el resultado se
              guarda en el artefacto con su fecha; una URL comprobada hace menos de 120 días no se
              vuelve a pedir.

Salidas (artefactos versionados, para que el número sea auditable):
  docs/auditoria/fuentes-oficiales.json  resumen + estado de cada URL
  docs/auditoria/fuentes-caducadas.csv   una fila por declaración caducada (lista de trabajo)

Uso:
  python3 scripts/validate_official_sources.py              # recalcula, sin red
  python3 scripts/validate_official_sources.py --red --urls 40   # comprime 40 URLs más viejas
  python3 scripts/validate_official_sources.py --check      # falla si el artefacto está desactualizado
  python3 scripts/validate_official_sources.py --curso foundations
"""
from __future__ import annotations

import argparse
import concurrent.futures
import datetime as dt
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from audit_master_prompt_items import FUENTES, tema_blocks  # noqa: E402  mismo universo de 1608 temas

CONTENT = ROOT / "web" / "public" / "content"
OUT_DIR = ROOT / "docs" / "auditoria"
OUT_JSON = OUT_DIR / "fuentes-oficiales.json"
OUT_CSV = OUT_DIR / "fuentes-caducadas.csv"
DIA_CADUCIDAD = 120
USER_AGENT = "Academia-Floci-verificador-fuentes/1.0 (+docs/auditoria)"

FECHA = re.compile(r"(?:consultadas?|revisadas?|verificadas?|comprobadas?)\s+(?:el|al|de|a)\s+"
                   r"(?P<fecha>\d{4}-\d{2}-\d{2})", re.I)
URL = re.compile(r"https?://[^\s)\]\"'<>]+")
FENCE = re.compile(r"^\s*(?:```|~~~)")
BULLET = re.compile(r"^\s*(?:[-*+]|\d+[.)])\s+")
# Un enlace de ejemplo (`http://127.0.0.1:3000/health`, una IP del laboratorio) no es una fuente oficial:
# consultarla sería contar deuda donde no la hay.
LOCAL = re.compile(r"https?://(?:localhost|127\.|0\.0\.0\.0|\[?::1\]?|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)",
                   re.I)


def dias(atras: dt.date, hoy: dt.date) -> int:
    return (hoy - atras).days


def limpiar(url: str) -> str:
    return url.rstrip(".,;:)]}\"'*")


def region_de_fuentes(lineas: list[str]) -> list[str]:
    """Las líneas que declaran fuentes: la que dice fuentes/referencias/bibliografía y los bullets que le
    siguen. Lo que está dentro de un bloque de código se descarta: ahí un `http://127.0.0.1:8080` es parte
    del ejercicio, no una cita."""
    fuera, dentro = [], False
    for linea in lineas:
        if FENCE.match(linea):
            dentro = not dentro
            continue
        if not dentro:
            fuera.append(linea)
    region: list[str] = []
    saldo = 0
    for linea in fuera:
        if FUENTES.search(linea):
            saldo = 12
            region.append(linea)
        elif saldo and (BULLET.match(linea) or URL.search(linea) or not linea.strip()):
            saldo -= 1
            region.append(linea)
        elif saldo and linea.strip():
            saldo = 0
    return region


def medir(curso: str | None, hoy: dt.date) -> tuple[dict, list[list[str]], dict[str, str]]:
    """(resumen, filas caducadas, {url: ruta que la cita}) sobre los temas que ya define el auditor."""
    caducadas: list[list[str]] = []
    urls: dict[str, str] = {}
    temas = {"con_region": 0, "con_fecha": 0, "sin_fecha": 0, "sin_enlace": 0, "caducos": 0,
             "total": 0, "locales": 0}
    pistas = [curso] if curso else sorted({p.parent.name for p in CONTENT.glob("*/modulo-*.md")})
    for pista in pistas:
        for bloque in tema_blocks(pista):
            temas["total"] += 1
            region = region_de_fuentes(bloque["lineas"])
            if not region:
                continue
            temas["con_region"] += 1
            enlaces = []
            for enlace in (limpiar(u) for u in URL.findall("\n".join(region))):
                if LOCAL.match(enlace):
                    temas["locales"] += 1
                else:
                    enlaces.append(enlace)
                    urls.setdefault(enlace, pista)
            if not any(FUENTES.search(l) for l in region if URL.search(l) or BULLET.match(l)):
                continue
            if not enlaces:
                temas["sin_enlace"] += 1
                continue
            fechas = [dt.date.fromisoformat(m.group("fecha")) for m in FECHA.finditer("\n".join(region))]
            if not fechas:
                temas["sin_fecha"] += 1
                continue
            temas["con_fecha"] += 1
            mas_vieja = min(fechas)
            if dias(mas_vieja, hoy) > DIA_CADUCIDAD:
                temas["caducos"] += 1
                caducadas.append([pista, f"modulo-{bloque['modulo']}", bloque["titulo"][:70],
                                  str(mas_vieja), str(len(set(enlaces)))])
    temas["porcentaje_sin_fecha"] = (round(100 * (temas["sin_fecha"] + temas["sin_enlace"]) / temas["total"], 1)
                                     if temas["total"] else 0)
    return temas, caducadas, urls


def verificar_red(viejas: dict[str, str], limite: int) -> dict[str, dict]:
    """Comprueba por HTTP las `limite` URLs más antiguas del registro. Devuelve el estado de cada una."""
    hoy = dt.date.today().isoformat()
    elegidas = sorted(viejas.items(), key=lambda kv: kv[1].get("comprobada", "0000"))[:limite]
    resultados: dict[str, dict] = {}

    def pedir(url: str) -> tuple[str, dict]:
        if url.count("(") != url.count(")"):
            # Documentación con firma de función (`…/publisher/switchtolatest(…): el recorte del regex
            # cierra mal el paréntesis: no es un enlace roto, es un enlace que la extracción no resuelve.
            return url, {"estado": "parentesis-sin-cerrar", "final": url, "comprobada": hoy}
        peticion = urllib.request.Request(url, headers={"User-Agent": USER_AGENT,
                                                        "Accept": "text/html,application/xhtml+xml"})
        try:
            with urllib.request.urlopen(peticion, timeout=25) as respuesta:
                return url, {"estado": respuesta.status, "final": respuesta.url, "comprobada": hoy}
        except urllib.error.HTTPError as error:
            return url, {"estado": error.code, "final": url, "comprobada": hoy}
        except Exception as error:  # noqa: BLE001 - un fallo de red es un dato, no una excepción del informe
            return url, {"estado": f"error: {type(error).__name__}", "final": url, "comprobada": hoy}

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
        for url, dato in pool.map(pedir, [u for u, _ in elegidas]):
            resultados[url] = dato
    return resultados


def esta_roto(dato: dict) -> bool:
    """Un 404/403/timeout es deuda real; `parentesis-sin-cerrar` es un límite del extractor, no un enlace roto."""
    estado = dato.get("estado")
    return not (isinstance(estado, int) and estado < 400) and estado != "parentesis-sin-cerrar"


def ignora_el_dia(texto: str) -> str:
    """El día de la medición no es contenido: si se compara tal cual, `--check` se pondría rojo al cambiar
    la fecha aunque nadie haya tocado una fuente. Se quita y nada más."""
    return re.sub(r'"medido": "\d{4}-\d{2}-\d{2}"', '"medido": ""',
                  re.sub(r"^medido,\d{4}-\d{2}-\d{2}$", "medido,", texto, flags=re.M))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--curso")
    ap.add_argument("--red", action="store_true", help="comprueba URLs por HTTP")
    ap.add_argument("--urls", type=int, default=40)
    ap.add_argument("--resumen", action="store_true")
    a = ap.parse_args()
    hoy = dt.date.today()

    temas, caducadas, urls = medir(a.curso, hoy)
    registro = {}
    if OUT_JSON.is_file():
        registro = json.loads(OUT_JSON.read_text(encoding="utf-8")).get("urls", {})
    if a.red:
        viejas = {u: registro.get(u, {"comprobada": "0000-01-01"}) for u in urls if u not in registro
                  or dias(dt.date.fromisoformat(registro[u]["comprobada"]), hoy) > DIA_CADUCIDAD}
        registro.update(verificar_red(viejas, a.urls))
    citadas = {u: registro[u] for u in sorted(registro) if u in urls}
    pendientes = sorted(u for u in urls if u not in registro
                        or dias(dt.date.fromisoformat(registro[u]["comprobada"]), hoy) > DIA_CADUCIDAD)
    rotas = sorted(u for u, dato in citadas.items() if esta_roto(dato))

    datos = {"medido": hoy.isoformat(), "caducidad_dias": DIA_CADUCIDAD,
             "curso": a.curso or "todos", "temas": temas,
             "urls_distintas": len(urls), "urls_sin_comprobar": len(pendientes),
             "urls_rotas": len(rotas), "urls": citadas}

    if a.resumen:
        print(f"temas: {temas['total']} · declaran fuentes: {temas['con_region']} · "
              f"con URL y fecha de consulta: {temas['con_fecha']} · con URL sin fecha: "
              f"{temas['sin_fecha']} · sin URL: {temas['sin_enlace']} · no mencionan fuentes: "
              f"{temas['total'] - temas['con_region']}")
        print(f"caducados (>{DIA_CADUCIDAD} días): {temas['caducos']} · URLs oficiales distintas: "
              f"{len(urls)} · pendientes de comprobar: {len(pendientes)} · rotas: {len(rotas)} · "
              f"enlaces de ejemplo (localhost/IP del laboratorio) descartados: {temas['locales']}")
        for url in rotas[:5]:
            print(f"  {url}: {citadas[url]['estado']}")
        return 0

    lineas = [f"curso,{a.curso or 'todos'}", f"medido,{hoy.isoformat()}",
              f"temas_medidos,{temas['total']}", f"temas_declaran_fuentes,{temas['con_region']}",
              f"temas_con_fecha_y_url,{temas['con_fecha']}",
              f"temas_con_url_sin_fecha,{temas['sin_fecha']}", f"temas_sin_url,{temas['sin_enlace']}",
              f"temas_caducos,{temas['caducos']}", f"enlaces_ejemplo_descartados,{temas['locales']}",
              f"urls_distintas,{len(urls)}", f"urls_sin_comprobar,{len(pendientes)}",
              f"urls_rotas,{len(rotas)}", "",
              "ruta,archivo,tema,fecha_mas_vieja,urls"]
    lineas += [",".join(fila) for fila in caducadas]
    csv_texto = "\n".join(lineas) + "\n"
    json_texto = json.dumps(datos, ensure_ascii=False, indent=2) + "\n"

    if a.check:
        desactualizado = [p.name for p, texto in ((OUT_JSON, json_texto), (OUT_CSV, csv_texto))
                          if not p.is_file()
                          or ignora_el_dia(p.read_text(encoding="utf-8")) != ignora_el_dia(texto)]
        print("validate_official_sources: " + (f"desactualizado {desactualizado} — recalcula con "
                                               "`python3 scripts/validate_official_sources.py --red`"
                                               if desactualizado else
                                               f"al día ({temas['total']} temas, {len(urls)} URLs, "
                                               f"{len(rotas)} rotas)"))
        return 1 if desactualizado else 0
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json_texto, encoding="utf-8")
    OUT_CSV.write_text(csv_texto, encoding="utf-8")
    print(f"validate_official_sources: {temas['total']} temas · {temas['caducos']} caducos · "
          f"{len(urls)} URLs ({len(rotas)} rotas), {len(pendientes)} sin comprobar")
    return 0


if __name__ == "__main__":
    sys.exit(main())
