# Módulo 10: Introducción al espacio de estados

Otra forma de describir sistemas, con matrices y ecuaciones de primer orden. Es la base del control moderno y forma parte del examen final de Control I (unidad 6). Aquí ves cómo se arma y cómo se relaciona con \(G(s)\); el análisis y el diseño con estados siguen en los módulos 25 (controlabilidad, observabilidad y ubicación de polos) y 26 (observadores).

**Al terminar podrás:**

- Pasar una ecuación diferencial a la forma \(\dot x = Ax + Bu\), \(y = Cx + Du\).
- Obtener \(G(s)\) a partir de las matrices.
- Ver que los polos son los valores propios de \(A\).

## Aprende construyendo


### Tema 1: La forma de espacio de estados · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import Matrix, symbols, eye, simplify

s = symbols("s")
A = Matrix([[0, 1], [-2, -3]])
B = Matrix([[0], [1]])
C = Matrix([[1, 0]])
G = simplify((C * (s * eye(2) - A).inv() * B)[0])
print("G(s):", G)
print("valores_propios:", A.eigenvals())
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: De estados a función de transferencia · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import Matrix, symbols, eye, simplify

s = symbols("s")
A = Matrix([[0, 1], [-5, -2]])
B = Matrix([[0], [1]])
C = Matrix([[1, 0]])
G = simplify((C * (s * eye(2) - A).inv() * B)[0])
print("G(s):", G)
```

```bash
python3 verificacion.py
```

</details>
