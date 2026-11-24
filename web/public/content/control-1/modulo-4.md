# Módulo 4: Ecuaciones diferenciales y función de transferencia

Todo sistema físico se describe con una ecuación diferencial. Laplace la convierte en álgebra y de ahí sale la función de transferencia \(G(s)\).

**Al terminar podrás:**

- Pasar una ecuación diferencial a Laplace.
- Obtener \(G(s) = Y(s)/U(s)\) a partir de la ecuación.
- Resolver la ecuación para una entrada dada, con o sin condiciones iniciales.

## Aprende construyendo


### Tema 1: Qué es la función de transferencia · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify

s = symbols("s")
G = 12 / (2 * s + 6)
print("G(s) simplificado:", simplify(G))
```

```bash
python3 verificacion.py
```

</details>
