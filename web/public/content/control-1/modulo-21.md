# Módulo 21: Parciales resueltos

Los dos parciales del curso, resueltos paso a paso. Intenta cada punto en papel antes de abrir la solución.

## Aprende construyendo


### Tema 1: Parcial 1 resuelto paso a paso · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, inverse_laplace_transform, simplify, exp, sin

s, t = symbols("s t", positive=True)
G = 370 / (s**2 + 2*s + 37)
respuesta = inverse_laplace_transform(G, s, t)
esperada = 370 * exp(-t) * sin(6*t) / 6
print("impulso_correcto:", simplify(respuesta - esperada) == 0)
```

```bash
python3 verificacion.py
```

</details>
