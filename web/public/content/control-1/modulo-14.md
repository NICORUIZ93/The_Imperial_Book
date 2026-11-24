# Módulo 14: Error en estado estacionario

Después de que pasa el transitorio, ¿la salida llega exactamente a la referencia? Depende del tipo de sistema y de la entrada.

**Al terminar podrás:**

- Calcular el error final ante escalón, rampa y parábola.
- Usar las constantes \(K_p\), \(K_v\) y \(K_a\).
- Elegir una ganancia para cumplir una especificación de error.

## Aprende construyendo


### Tema 1: Fórmula general del error en estado estacionario · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, limit

s = symbols("s")
G = 10 / (s + 2)
R = 1 / s
E = R / (1 + G)
print("e_ss:", limit(s * E, s, 0))
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Tipo de sistema y constantes · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, limit, N

s = symbols("s")
G = 10 / ((s + 1) * (s + 2))
Kp = limit(G, s, 0)
e_ss = 1 / (1 + Kp)
print("Kp:", Kp)
print("e_ss:", N(e_ss, 3))
```

```bash
python3 verificacion.py
```

</details>
