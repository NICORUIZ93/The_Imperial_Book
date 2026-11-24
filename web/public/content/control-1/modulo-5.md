# Módulo 5: Sistemas de control y diagramas de bloques

Qué es un sistema de control, cuáles son sus partes y cómo combinar bloques para llegar a una sola función de transferencia.

**Al terminar podrás:**

- Explicar lazo abierto y lazo cerrado con ejemplos.
- Enumerar y definir los elementos de cualquier sistema (punto 1 del Parcial 1).
- Reducir diagramas: serie, paralelo y realimentación.

## Aprende construyendo


### Tema 1: ¿Qué es un sistema de control? · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Diagrama de bloques de lazo cerrado](content/figures/control-1/lazo-cerrado.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
# Compara lazo abierto vs. lazo cerrado ante una perturbación D=1,
# usando Y/D = 1/(1+C*Gp) (se demuestra más adelante, en el Tema 3).
Gp = 10  # ganancia de la planta
C = 10   # ganancia del controlador
D = 1    # perturbación

y_abierto = D
y_cerrado = D / (1 + C * Gp)
print("lazo_abierto:", y_abierto)
print("lazo_cerrado:", y_cerrado)
```

```bash
python3 verificacion.py
```

```python
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
```

</details>

### Tema 2: Los elementos de un lazo de control · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
sistema = {
    "variable": "temperatura (180 C)",
    "planta": "horno con aire y paredes",
    "sensor": "termopar",
    "actuador": "resistencia electrica",
    "controlador": "calcula error y decide la accion",
    "perturbacion": "apertura de la puerta",
}
for elemento, definicion in sistema.items():
    print(f"{elemento}: {definicion}")
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Álgebra de bloques · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify, together

s = symbols("s")
G = 10 / (s + 2)
T = simplify(G / (1 + G))
print("T(s):", together(T))
```

```bash
python3 verificacion.py
```

</details>
