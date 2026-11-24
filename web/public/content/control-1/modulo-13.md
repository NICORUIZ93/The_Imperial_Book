# Módulo 13: Polos dominantes, polos adicionales y ceros

Las fórmulas de \(M_p\), \(t_p\) y \(t_s\) son exactas solo para el segundo orden puro. Aquí aprendes cuándo puedes usarlas en sistemas más grandes y qué hacen los ceros.

**Al terminar podrás:**

- Identificar los polos dominantes y aproximar un sistema de orden alto por uno de segundo orden.
- Explicar el efecto de un cero sobre el sobrepico.
- Reconocer un cero de fase no mínima (respuesta inversa).

## Aprende construyendo


### Tema 1: Polos dominantes · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Sistema de tercer orden frente a su aproximación de segundo orden](content/figures/control-1/polos-dominantes.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, exp, pi, N

wn = sqrt(10)
zeta = 2 / (2 * wn)
Mp = N(exp(-zeta * pi / sqrt(1 - zeta ** 2)) * 100, 3)
print("zeta:", N(zeta, 3))
print("Mp_approx%:", Mp)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Efecto de un cero · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Efecto de un cero sobre el sobrepico](content/figures/control-1/efecto-cero.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify

s = symbols("s")
a = 1
G0 = 4 / (s ** 2 + 2 * s + 4)
Gz = (1 + s / a) * G0
print("Gz simplificada:", simplify(Gz))
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Cero de fase no mínima · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, limit, oo

s = symbols("s")
G = (2 - 2 * s) / ((s + 1) * (s + 2))
Y = G / s
valor_final = limit(s * Y, s, 0)
pendiente_inicial = limit(s * (s * Y), s, oo)
print("valor_final:", valor_final)
print("pendiente_inicial:", pendiente_inicial)
```

```bash
python3 verificacion.py
```

</details>
