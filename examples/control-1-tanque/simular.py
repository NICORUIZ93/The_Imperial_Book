#!/usr/bin/env python3
"""Simula un tanque lineal con control P y PI; solo usa la biblioteca estándar."""

import argparse
import csv
from pathlib import Path

AREA = 2.0       # m²
SALIDA = 0.5     # m²/s; q_salida = SALIDA * altura
PASO = 0.02      # s
DURACION = 50.0  # s
CAMBIO = 5.0     # s


def simular(kp: float, ki: float) -> list[tuple[float, float, float, float]]:
    altura = 1.0
    integral = 0.0
    filas = []
    for n in range(round(DURACION / PASO) + 1):
        tiempo = n * PASO
        referencia = 1.0 if tiempo < CAMBIO else 1.5
        error = referencia - altura
        caudal_libre = 0.5 + kp * error + ki * integral
        caudal = max(0.0, min(1.5, caudal_libre))
        filas.append((tiempo, referencia, altura, caudal))
        if n < round(DURACION / PASO):
            if 0.0 < caudal_libre < 1.5 or (caudal == 0 and error > 0) or (caudal == 1.5 and error < 0):
                integral += error * PASO
            altura += (caudal - SALIDA * altura) / AREA * PASO
    return filas


def guardar_csv(ruta: Path, filas: list[tuple[float, float, float, float]]) -> None:
    with ruta.open("w", newline="", encoding="utf-8") as archivo:
        escritor = csv.writer(archivo)
        escritor.writerow(("tiempo_s", "referencia_m", "altura_m", "caudal_m3_s"))
        escritor.writerows((f"{valor:.4f}" for valor in fila) for fila in filas)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--salida", type=Path, default=Path("."))
    args = parser.parse_args()
    args.salida.mkdir(parents=True, exist_ok=True)
    for nombre, kp, ki in (("P", 0.8, 0.0), ("PI", 0.8, 0.15)):
        filas = simular(kp, ki)
        guardar_csv(args.salida / f"tanque-{nombre}.csv", filas)
        final = filas[-1][2]
        print(f"{nombre}: altura_final={final:.3f} m; error_final={1.5-final:.3f} m")


if __name__ == "__main__":
    main()
