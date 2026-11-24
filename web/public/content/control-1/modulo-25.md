# Módulo 25: Controlabilidad, observabilidad y ubicación de polos

En el módulo 10 escribiste sistemas en espacio de estados y obtuviste \(G(s)\) desde las matrices. Aquí das el paso de análisis a diseño: compruebas si la entrada puede mover todos los estados (controlabilidad), si la salida deja ver todos los estados (observabilidad) y, cuando se puede, colocas los polos del lazo cerrado donde quieras con \(u = -Kx\). Es la unidad 6 del programa de Control I.

**Al terminar podrás:**

- Construir las matrices de controlabilidad y de observabilidad y decidir con su rango.
- Relacionar la pérdida de controlabilidad u observabilidad con una cancelación polo-cero.
- Calcular la ganancia \(K\) por igualación de coeficientes y por Ackermann, y la ganancia de referencia \(\bar N\).

**Prerrequisitos:** módulos 10 (espacio de estados), 12 (segundo orden) y 16 (zona de diseño). **Lee en la bibliografía:** Ogata, caps. 9 y 10; Nise, cap. 12; Dorf y Bishop, cap. 11; Golnaraghi y Kuo, cap. 8.

**Laboratorio.** Trabajas en `academia-labs/control-1` con NumPy y `python-control` (verificado con `control 0.10.2`). El proyecto del módulo es la planta \(\ddot y + 3\dot y + 2y = u\), es decir \(G(s) = \dfrac{1}{(s+1)(s+2)}\), en forma canónica controlable:

\[A = \begin{bmatrix} 0 & 1 \\ -2 & -3 \end{bmatrix}, \quad B = \begin{bmatrix} 0 \\ 1 \end{bmatrix}, \quad C = \begin{bmatrix} 1 & 0 \end{bmatrix}\]

## Aprende construyendo


### Tema 1: Controlabilidad · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# controlabilidad.py
import numpy as np
import control as ct

A = np.array([[0, 1], [-2, -3]])
B = np.array([[0], [1]])
Wc = ct.ctrb(A, B)
print("C =", Wc.tolist())
print("rango =", np.linalg.matrix_rank(Wc), "de", A.shape[0])
print("det =", round(np.linalg.det(Wc), 3))
```

```python
A2 = np.diag([-1, -2])
B2 = np.array([[1], [0]])
Wc2 = ct.ctrb(A2, B2)
print("C2 =", Wc2.tolist(), "rango =", np.linalg.matrix_rank(Wc2))
```

```python
# G(s) = (s+1)/((s+1)(s+2)) en forma canónica observable
Ao = A.T
Bo = np.array([[1], [1]])
Co = np.array([[0, 1]])
print("rango C =", np.linalg.matrix_rank(ct.ctrb(Ao, Bo)))
print(ct.ss2tf(ct.ss(Ao, Bo, Co, 0)))
```

</details>

### Tema 2: Observabilidad · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# observabilidad.py
import numpy as np
import control as ct

A = np.array([[0, 1], [-2, -3]])
C = np.array([[1, 0]])
Wo = ct.obsv(A, C)
print("O =", Wo.tolist(), "rango =", np.linalg.matrix_rank(Wo))
```

```python
A2 = np.diag([-1, -2])
C2 = np.array([[0, 1]])
print("O2 =", ct.obsv(A2, C2).tolist(), "rango =", np.linalg.matrix_rank(ct.obsv(A2, C2)))
```

```python
B = np.array([[0], [1]])
Cz = np.array([[1, 1]])                  # numerador s + 1
print("rango O =", np.linalg.matrix_rank(ct.obsv(A, Cz)))
print("rango C de la dual =", np.linalg.matrix_rank(ct.ctrb(A.T, Cz.T)))
```

</details>

### Tema 3: Ubicación de polos por realimentación de estados · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# ubicacion.py
import numpy as np
import sympy as sp

s, k1, k2 = sp.symbols("s k1 k2")
A = sp.Matrix([[0, 1], [-2, -3]])
B = sp.Matrix([0, 1])
K = sp.Matrix([[k1, k2]])
caracteristico = sp.expand((s * sp.eye(2) - (A - B * K)).det())
print("det(sI - A + BK) =", caracteristico)
deseado = sp.expand(s**2 + 6 * s + 25)
solucion = sp.solve(sp.Poly(caracteristico - deseado, s).all_coeffs(), [k1, k2])
print("K =", solucion)
```

```python
import control as ct

An = np.array([[0.0, 1], [-2, -3]])
Bn = np.array([[0.0], [1]])
phi = An @ An + 6 * An + 25 * np.eye(2)
K_ack = np.array([[0, 1]]) @ np.linalg.inv(ct.ctrb(An, Bn)) @ phi
print("Ackermann a mano:", K_ack.round(6).tolist())
print("ct.place:", ct.place(An, Bn, [-3 + 4j, -3 - 4j]).round(6).tolist())
print("polos:", np.linalg.eigvals(An - Bn @ K_ack))
```

```python
Cn = np.array([[1.0, 0]])
Acl = An - Bn @ K_ack
N_bar = -1 / (Cn @ np.linalg.inv(Acl) @ Bn)
T = ct.ss(Acl, Bn * N_bar, Cn, 0)
info = ct.step_info(T)
print("N_bar =", N_bar.round(6).tolist())
print("ganancia estatica =", round(float(ct.dcgain(T)), 6))
print("Mp =", round(info["Overshoot"], 2), "% ts =", round(info["SettlingTime"], 2), "s")
```

</details>
