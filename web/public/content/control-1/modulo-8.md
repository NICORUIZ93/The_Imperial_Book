# Módulo 8: Modelado de sistemas físicos

Sistemas mecánicos, motores, hornos y tanques se describen con las mismas ecuaciones que un circuito. Aprende a obtener su función de transferencia a partir de las leyes físicas.

**Al terminar podrás:**

- Modelar masa-resorte-amortiguador y sistemas rotacionales.
- Obtener la función de transferencia de un motor DC.
- Modelar sistemas térmicos e hidráulicos de primer orden.
- Usar las analogías entre dominios.

## Aprende construyendo


### Tema 1: Mecánico de traslación · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, Rational, N

m, b, k = 1, 4, 20
wn = sqrt(Rational(k, m))
zeta = Rational(b, 1) / (2 * sqrt(k * m))
final = 10 * Rational(1, k)
print("wn:", N(wn, 3))
print("zeta:", N(zeta, 3))
print("final:", final)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Mecánico de rotación · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, Rational, N

J, B, K = Rational(1, 2), 2, 10
wn = sqrt(K / J)
print("wn:", N(wn, 4))
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Motor DC (electromecánico) · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, solve, N

s = symbols("s")
R, L, J, B, Kt, Kb = 1, 0.5, 0.01, 0.1, 0.01, 0.01
den = (L * s + R) * (J * s + B) + Kt * Kb
polos = solve(den, s)
print("polos:", sorted(N(p, 3) for p in polos))
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Sistemas térmicos e hidráulicos · Avanzado · 40 min

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
A, R = 2, 5
G = R / (A * R * s + 1)
print("G(s):", G)
```

```bash
python3 verificacion.py
```

</details>

### Tema 5: Analogías entre sistemas eléctricos, mecánicos y térmicos · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, Rational, N

R, L, C = 4, 1, Rational(1, 20)
M, B, K = L, R, 1 / C
wn = sqrt(K / M)
zeta = B / (2 * sqrt(K * M))
print("wn:", N(wn, 3))
print("zeta:", N(zeta, 3))
```

```bash
python3 verificacion.py
```

</details>
