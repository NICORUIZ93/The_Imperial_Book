# Módulo 11: Sistemas de primer orden y retardo

El sistema más simple: un tanque que se llena, un condensador que se carga o un horno que se calienta. Aprende a leerlo, resolverlo e identificarlo desde una gráfica.

**Al terminar podrás:**

- Leer \(K\) y \(\tau\) de cualquier \(G(s)\) de primer orden.
- Escribir la respuesta al impulso, al escalón y a la rampa.
- Manejar el retardo \(e^{-Ts}\) (punto 3.i del Parcial 1).
- Sacar \(G(s)\) a partir de una curva medida.

## Aprende construyendo


### Tema 1: Forma estándar de primer orden: K y τ · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, Rational

s = symbols("s")
num, den = 5, 2 * s + 1
tau = den.coeff(s, 1)
K = Rational(num, den.coeff(s, 0))
print("K:", K)
print("tau:", tau)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Respuestas de primer orden al escalón, la rampa y el impulso · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Respuesta al escalón de un sistema de primer orden](content/figures/control-1/primer-orden-escalon.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, Rational, inverse_laplace_transform

t, s = symbols("t s", positive=True)
K, tau = 3, Rational(1, 2)
Y = K / (s * (tau * s + 1))
print("y(t):", inverse_laplace_transform(Y, s, t))
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Retardo o tiempo muerto · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, Rational, inverse_laplace_transform

t, s = symbols("t s", positive=True)
K, tau = 2, 4
Y0 = K / (s * (tau * s + 1))
y0 = inverse_laplace_transform(Y0, s, t)
print("y0(t):", y0)
print("y(t) con retardo 1.5 s:", y0.subs(t, t - Rational(3, 2)))
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Identificación desde una gráfica · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import log, Rational

y_inf, A, t_obs, y_obs = 10, 1, 4, Rational(632, 100)
K = y_inf / A
tau = -t_obs / log(1 - y_obs / y_inf)
print("K:", K)
print("tau:", float(tau))
```

```bash
python3 verificacion.py
```

</details>
