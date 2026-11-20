#!/usr/bin/env python3
"""F073 · Revisa un dashboard de Grafana guardado como código antes de desplegarlo (sin Grafana).

Comprueba: uid y título; que cada panel use la fuente de datos aprovisionada (uid "prometheus");
que tenga unidad; que cada expresión tenga paréntesis balanceados; que los percentiles se calculen con
histogram_quantile sobre buckets sumados "by (le)" (y nunca promediando percentiles); y que el panel de
p99 marque el objetivo de 0.5 s.
Uso: python3 grafana/validar_dashboard.py grafana/dashboards/pedidos-red.json
"""
import json
import re
import sys


def balanceado(expr: str) -> bool:
    nivel = 0
    for c in expr:
        nivel += {"(": 1, ")": -1, "{": 1, "}": -1}.get(c, 0)
        if nivel < 0:
            return False
    return nivel == 0


def main(ruta: str) -> int:
    d = json.load(open(ruta, encoding="utf-8"))
    errores = []
    if not d.get("uid") or not d.get("title"):
        errores.append("falta uid o title")
    exprs = 0
    for p in d.get("panels", []):
        nombre = f'panel {p.get("id")} «{p.get("title")}»'
        ds = p.get("datasource")
        if not isinstance(ds, dict) or ds.get("uid") != "prometheus":   # un nombre suelto se rompe al renombrar
            errores.append(f"{nombre}: no usa la fuente aprovisionada uid=prometheus")
        if not p.get("fieldConfig", {}).get("defaults", {}).get("unit"):
            errores.append(f"{nombre}: sin unidad")
        for t in p.get("targets", []):
            e = t.get("expr", "")
            exprs += 1
            if not e or not balanceado(e):
                errores.append(f"{nombre}: expresión vacía o con paréntesis desbalanceados: {e}")
            if re.search(r"avg\s*(by\s*\([^)]*\)\s*)?\(\s*histogram_quantile", e):
                errores.append(f"{nombre}: promedia percentiles (no tiene sentido estadístico)")
            if "histogram_quantile" in e and not re.search(r"by \((\w+, )*le(, \w+)*\)", e):
                errores.append(f"{nombre}: histogram_quantile sin sumar por le")
    p99 = [p for p in d.get("panels", []) if any("histogram_quantile(0.99" in t.get("expr", "") for t in p.get("targets", []))]
    if not any(s.get("value") == 0.5 for p in p99
               for s in p.get("fieldConfig", {}).get("defaults", {}).get("thresholds", {}).get("steps", [])):
        errores.append("ningún panel de p99 marca el objetivo de 0.5 s")
    print(f'{d.get("title")} · uid={d.get("uid")} · {len(d.get("panels", []))} paneles · {exprs} expresiones PromQL')
    for e in errores:
        print("  ERROR:", e)
    print("OK: dashboard válido" if not errores else f"FALLA: {len(errores)} problema(s)")
    return 0 if not errores else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "grafana/dashboards/pedidos-red.json"))
