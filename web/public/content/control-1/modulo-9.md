# Módulo 9: Linealización

Todo lo que ves en este curso supone sistemas lineales. Los reales casi nunca lo son (un tanque que se vacía por gravedad, un péndulo). Linealizar es aproximarlos por una recta alrededor del punto donde trabajan.

**Al terminar podrás:**

- Encontrar un punto de equilibrio.
- Linealizar con la serie de Taylor y obtener una \(G(s)\) válida cerca de ese punto.

## Aprende construyendo


### Tema 1: La idea de la linealización: aproximar con la recta tangente · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, sqrt, diff

x = symbols("x")
f = sqrt(x)
print("f(4):", f.subs(x, 4))
print("f'(4):", diff(f, x).subs(x, 4))
```

```bash
python3 verificacion.py
```

</details>
