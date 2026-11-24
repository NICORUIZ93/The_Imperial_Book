# Módulo 20: Respuesta en frecuencia y diagramas de Bode

Otra forma de ver un sistema: qué le hace a una entrada senoidal de cada frecuencia. Con ella se miden los márgenes de estabilidad. Es la unidad 5 del programa de Control I y sigue con el criterio de Nyquist (módulo 23) y la compensación en frecuencia (módulo 24).

**Al terminar podrás:**

- Explicar qué es \(G(j\omega)\) y por qué describe la salida senoidal.
- Trazar Bode asintótico de polos, ceros e integradores.
- Calcular el margen de fase y relacionarlo con \(\zeta\).

## Aprende construyendo


### Tema 1: Qué es la respuesta en frecuencia · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import I, Abs, arg, deg, N

s = 10 * I
G = 10 / (s + 10)
print("mag:", N(Abs(G), 4))
print("fase_grados:", N(deg(arg(G)), 4))
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Decibeles y la escala logarítmica · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import log, N

dB = N(20 * log(10, 10), 4)
print("dB:", dB)

magnitud = N(10 ** (-6 / 20), 4)
print("magnitud:", magnitud)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Los bloques básicos del diagrama de Bode · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import log, N

K = 20
print("dB:", N(20 * log(K, 10), 3))
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Márgenes de estabilidad · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Bode de magnitud](content/figures/control-1/bode-magnitud.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import I, Abs, log, N

def mag_dB(omega):
    s = omega * I
    G = 10 / (s + 10)
    return N(20 * log(Abs(G), 10), 3)

print("omega=1:", mag_dB(1))
print("omega=10:", mag_dB(10))
print("omega=100:", mag_dB(100))
```

```bash
python3 verificacion.py
```

```python
# verificacion.py
from sympy import symbols, solve, sqrt, atan, deg

x = symbols("x", real=True)
raiz_positiva = next(r for r in solve(x**2 + 100*x - 10000, x) if r > 0)
omega_c = sqrt(raiz_positiva)
fase = -90 - deg(atan(omega_c / 10))
margen = 180 + fase
print("cruce:", round(float(omega_c), 2))
print("fase:", round(float(fase), 1))
print("margen:", round(float(margen), 1))
```

```bash
python3 verificacion.py
```

</details>
