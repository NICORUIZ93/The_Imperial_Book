# Módulo 1: Números complejos

Los polos de un sistema casi siempre son números complejos. Si los manejas con soltura, el resto del curso es mucho más fácil.

**Al terminar podrás:**

- Sumar, multiplicar y dividir complejos.
- Ubicar un complejo en el plano y sacar su magnitud y ángulo.
- Hallar las raíces de \(s^2+bs+c\) y reconocer si son reales o complejas.
- Armar el polinomio a partir de dos polos conjugados (pregunta típica de parcial).

## Aprende construyendo


### Tema 1: ¿Qué es un número complejo? · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Plano complejo con los puntos -3+4j, 2+1j y -3-4j](content/figures/control-1/plano-complejo.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import I, Abs, arg, deg, N

z = 3 + 4 * I
print("magnitud:", N(Abs(z)))
print("angulo_grados:", N(deg(arg(z))))
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Operaciones con números complejos: suma, producto y división · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import I, expand, nsimplify

producto = expand((2 + 3 * I) * (1 - 5 * I))
division = nsimplify((1 + 2 * I) / (3 - 4 * I))
potencia = expand((1 + I) ** 6)
print("producto:", producto)
print("division:", division)
print("potencia:", potencia)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Raíces de s²+bs+c · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, solve

s = symbols("s")
raices = solve(s ** 2 + 2 * s + 37, s)
print("raices:", raices)
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Forma polar, fórmula de Euler y evaluación de G(jω) · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import I, Abs, arg, deg, N

s = 2 * I
G = 10 / (s + 2)
print("magnitud:", N(Abs(G)))
print("fase_grados:", N(deg(arg(G))))
```

```bash
python3 verificacion.py
```

</details>
