# Módulo 6: Reducción de diagramas de bloques y regla de Mason

Los diagramas reales tienen lazos dentro de lazos y señales que se cruzan. Aquí aprendes a mover bloques sin cambiar el sistema y a usar la regla de Mason, que resuelve cualquier diagrama de una vez.

**Al terminar podrás:**

- Mover puntos de suma y de bifurcación sin alterar el sistema.
- Convertir un diagrama de bloques en un grafo de flujo de señal.
- Aplicar la regla de Mason con lazos que se tocan y que no se tocan.
- Calcular la salida cuando hay referencia y perturbación a la vez.

## Aprende construyendo


### Tema 1: Reglas para mover bloques en un diagrama · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify

G1, G2, H = symbols("G1 G2 H")
interno = G1 * G2 / (1 + G2 * H)
T = simplify(interno / (1 + interno))
print("T:", T)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Grafos de flujo de señal · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, Eq, solve

x1, x2, x3 = symbols("x1 x2 x3")
sol = solve([Eq(x2, 3 * x1 - x3), Eq(x3, 2 * x2)], [x2, x3])
print("x2/x1:", sol[x2] / x1)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Regla de Mason · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify

G1, G2, H1, H2 = symbols("G1 G2 H1 H2")
P1 = G1 * G2
L1, L2 = -G1 * H1, -G2 * H2
delta = 1 - (L1 + L2) + L1 * L2
T = simplify(P1 / delta)
print("T:", T)
print("coincide_con_factorizado:", simplify((1 + G1 * H1) * (1 + G2 * H2) - delta) == 0)
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Referencia y perturbación juntas · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, limit

s, K = symbols("s K")
YoD = 1 / (s + 1 + K)
print("y_D_infinito:", limit(YoD, s, 0).subs(K, 9))
```

```bash
python3 verificacion.py
```

</details>
