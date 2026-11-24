# Módulo 19: Compensadores de adelanto y atraso

Cuando subir la ganancia no basta (módulo 14, Ejemplo 4), se agrega un compensador: un cero y un polo bien puestos que cambian la forma del lugar de las raíces. Este módulo va después de Bode y Nyquist en la ruta: aquí diseñas con el lugar de las raíces y en el módulo 24 diseñas los mismos compensadores con el margen de fase.

**Al terminar podrás:**

- Distinguir adelanto (mejora el transitorio) y atraso (mejora el error).
- Diseñar un adelanto con la condición de ángulo.
- Diseñar un atraso para multiplicar \(K_v\) sin mover los polos.
- Implementarlos con op-amps.

## Aprende construyendo

\[G_c(s) = K_c\,\frac{s+z}{s+p}\qquad \text{adelanto: } z<p \qquad \text{atraso: } z>p\]

- Adelanto (lead)El cero está más cerca del origen que el polo. Aporta ángulo positivo: \(\angle(s+z) - \angle(s+p) > 0\). Jala el lugar a la izquierda: más rápido y más amortiguado. Se parece a un PD.
- Atraso (lag)El polo está más cerca del origen. Con \(z\) y \(p\) muy pequeños casi no cambia el lugar, pero multiplica la ganancia en \(s=0\) por \(z/p\). Mejora el error. Se parece a un PI.


### Tema 1: Diseño de un adelanto · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sin, pi, N

phi = pi / 6  # 30 grados
alpha = N((1 - sin(phi)) / (1 + sin(phi)), 3)
print("alpha:", alpha)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Diseño de un atraso · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
z, p = 0.1, 0.01
print("beta:", z / p)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Implementación con op-amps · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
R1, C1, R2, C2 = 100e3, 1e-6, 10e3, 1e-6
cero = -1 / (R1 * C1)
polo = -1 / (R2 * C2)
print("cero:", cero)
print("polo:", polo)
```

```bash
python3 verificacion.py
```

</details>
