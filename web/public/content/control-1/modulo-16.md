# Módulo 16: Plano s, estabilidad y zona de diseño

Dónde están los polos te dice cómo se comporta el sistema sin hacer cuentas. Las especificaciones se vuelven regiones del plano.

**Al terminar podrás:**

- Decidir si un sistema es estable mirando sus polos.
- Leer \(\zeta\), \(\omega_n\), \(M_p\), \(t_p\) y \(t_s\) de la posición de un polo.
- Dibujar la zona de diseño para unas especificaciones y explicar por qué es esa (Parcial 2).
- Verificar si unos polos candidatos cumplen.

## Aprende construyendo


### Tema 1: Geometría de un polo en el plano s · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Geometría de un polo complejo: sigma, omega d, omega n y theta](content/figures/control-1/geometria-polo.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, N

sigma, wd = 2, 2
wn = sqrt(sigma ** 2 + wd ** 2)
zeta = sigma / wn
print("wn:", N(wn, 4))
print("zeta:", N(zeta, 4))
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Estabilidad según la posición de los polos · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, solve, re

s = symbols("s")
raices = solve(s ** 2 - s + 2, s)
print("raices:", raices)
print("estable:", all(re(r) < 0 for r in raices))
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: La zona de diseño · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Zona de diseño para polos en -3 más o menos 5j](content/figures/control-1/zona-diseno.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import log, sqrt, pi, acos, deg, N

Mp, ts = 0.20, 2
zeta_min = N(-log(Mp) / sqrt(pi ** 2 + log(Mp) ** 2), 3)
theta_max = N(deg(acos(zeta_min)), 3)
sigma_min = 4 / ts
print("zeta_min:", zeta_min)
print("theta_max:", theta_max)
print("sigma_min:", sigma_min)
```

```bash
python3 verificacion.py
```

</details>
