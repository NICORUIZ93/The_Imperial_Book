# Módulo 7: Circuitos y amplificadores operacionales

Con impedancias en Laplace, un circuito se resuelve como si solo tuviera resistencias. Es el atajo para el punto 2 del Parcial 1.

**Al terminar podrás:**

- Escribir la impedancia de R, C y L, y combinarlas en serie y en paralelo.
- Hallar \(G(s)\) de circuitos RC, RL y RLC con divisor de voltaje.
- Hallar \(G(s)\) de un op-amp inversor y de etapas en cascada.
- Reconocer qué acción de control (P, I, D, PI, PD) implementa cada circuito.

## Aprende construyendo


### Tema 1: Impedancias de resistencia, bobina y condensador en s · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols

s = symbols("s")
R, L = 2000, 0.5
Z = R + L * s
print("Z(s):", Z)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Circuitos pasivos: divisor de voltaje · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify, Rational

s = symbols("s")
R = 10000
C = Rational(1, 10000)  # 100 microfaradios
G = simplify((1 / (C * s)) / (R + 1 / (C * s)))
print("G(s):", G)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: El op-amp inversor · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Op-amp inversor con Zi a la entrada y Zf de realimentación](content/figures/control-1/opamp-inversor.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify, Rational, apart

s = symbols("s")
R1, R2 = 10000, 100000
C = Rational(1, 100000)  # 10 microfaradios
Zf = R2 + 1 / (C * s)
G = simplify(-Zf / R1)
print("G(s):", apart(G))
```

```bash
python3 verificacion.py
```

</details>
