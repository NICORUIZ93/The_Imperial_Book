# Módulo 12: Sistemas de segundo orden

Es el tema más preguntado de los dos parciales. Un RLC, una masa con resorte o un motor con su control se comportan así.

**Al terminar podrás:**

- Leer \(K\), \(\omega_n\) y \(\zeta\) de cualquier \(G(s)\) de segundo orden.
- Clasificar el sistema (sub, crítica o sobreamortiguado) y predecir su forma.
- Calcular \(M_p\), \(t_p\), \(t_s\) y \(t_r\), y escribir \(y(t)\).
- Hacer el camino inverso: de una gráfica o de unas especificaciones a \(G(s)\).

## Aprende construyendo


### Tema 1: Forma estándar de segundo orden: K, ωn y ζ · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, Rational, N

num, b, c = 370, 2, 37
wn = sqrt(c)
zeta = Rational(b, 1) / (2 * wn)
K = Rational(num, c)
print("wn:", N(wn, 4))
print("zeta:", N(zeta, 4))
print("K:", K)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Simulador: mueve ζ y ωn · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```anatomy
control-1-segundo-orden
```

```python
# verificacion.py
from sympy import exp, pi, sqrt, N

zeta, wn = 0.1, 2
Mp = N(exp(-zeta * pi / sqrt(1 - zeta ** 2)) * 100, 3)
ts = N(4 / (zeta * wn), 3)
wd = wn * sqrt(1 - zeta ** 2)
tp = N(pi / wd, 3)
print("Mp%:", Mp)
print("ts:", ts)
print("tp:", tp)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Los cuatro casos según ζ · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Efecto de ζ en la respuesta al escalón](content/figures/control-1/segundo-orden-zetas.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, Rational, N

num, b, c = 9, 2, 9
wn = sqrt(c)
zeta = Rational(b, 1) / (2 * wn)
print("wn:", wn)
print("zeta:", N(zeta, 3))
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Fórmulas del caso subamortiguado · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, exp, pi, N

wn, zeta = 5, 0.6
sigma = zeta * wn
wd = wn * sqrt(1 - zeta ** 2)
Mp = N(exp(-sigma * pi / wd) * 100, 3)
tp = N(pi / wd, 3)
ts = N(4 / sigma, 3)
print("sigma:", sigma, "wd:", float(wd))
print("Mp%:", Mp, "tp:", tp, "ts:", ts)
```

```bash
python3 verificacion.py
```

</details>

### Tema 5: De las especificaciones a la función de transferencia · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import log, sqrt, pi, N

Mp, ts = 0.10, 2
zeta = N(-log(Mp) / sqrt(pi ** 2 + log(Mp) ** 2), 4)
sigma = 4 / ts
wn = N(sigma / zeta, 4)
print("zeta:", zeta)
print("wn:", wn)
print("wn^2:", N(wn ** 2, 5))
```

```bash
python3 verificacion.py
```

</details>
