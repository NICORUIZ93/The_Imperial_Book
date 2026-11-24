# Módulo 28: Simulacro de examen final

El módulo 22 trae un simulacro de parcial (unidades 1 a 4). Este simulacro cubre lo que pide el examen final de Control I: respuesta en frecuencia, Nyquist, compensación en frecuencia, espacio de estados con observador y método algebraico. Son seis puntos para resolver en 90 minutos, en dos bloques de 45, con una calculadora, el formulario del módulo 22 y las reglas que anotaste en los pasos «Cierra» de los módulos 23 a 27 (criterio \(Z = N + P\), procedimiento del adelanto y del atraso, \(\mathcal C\) y \(\mathcal O\), Ackermann, \(AP + BQ = D\) y \(T = BM/D\)). Después corriges con python-control.

**Al terminar podrás:**

- Resolver en tiempo de examen los seis tipos de problema de las unidades 5, 6 y 7.
- Corregir tus respuestas con un script que reproduce cada resultado.
- Armar un plan de repaso a partir de los puntos fallados.

**Prerrequisitos:** módulos 20 y 23 a 27. **Cómo usarlo:** resuelve cada punto en papel antes de abrir la solución. Anota tu resultado y el tiempo que tardaste; la regla de la metodología es escribir primero tu predicción y después comparar.

## Aprende construyendo


### Tema 1: Bloque A — frecuencia (puntos 1 a 3) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar bloque a — frecuencia (puntos 1 a 3).

</details>

### Tema 2: Bloque B — estado y método algebraico (puntos 4 a 6) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar bloque b — estado y método algebraico (puntos 4 a 6).

</details>

### Tema 3: Corrige con python-control y planea el repaso · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# corrige_final.py
import numpy as np
import control as ct

# Punto 1
L1 = ct.tf([8], [1, 6, 8, 0])
gm, pm, w_pc, w_gc = ct.margin(L1)
print("P1: MG =", round(20 * np.log10(gm), 2), "dB en", round(w_pc, 2), "| MF =", round(pm, 1), "en", round(w_gc, 3))

# Punto 2
for K in (0.5, 2):
    L2 = ct.tf([K, 3 * K], [1, -1, 0])
    N = ct.nyquist_response(L2).count
    print(f"P2: K={K} N={N} Z={N + 1}")

# Punto 3
G3 = ct.tf([1], [1, 3, 0])
Gc = 151.5 * ct.tf([1, 4.82], [1, 16.2])
_, pm3, _, wc3 = ct.margin(Gc * G3)
print("P3: MF =", round(pm3, 1), "en", round(wc3, 2), "| Kv =", round(151.5 * 4.82 / 16.2 / 3, 2))
```

```text
P1: MG = 15.56 dB en 2.83 | MF = 53.4 en 0.891
P2: K=0.5 N=1 Z=2
P2: K=2 N=-1 Z=0
P3: MF = 51.5 en 8.85 | Kv = 15.03
```

```python
import sympy as sp

# Punto 4
c = sp.symbols("c")
A4 = sp.Matrix([[0, 1], [-6, -5]])
C4 = sp.Matrix([[c, 1]])
print("P4: det O =", sp.factor(C4.col_join(C4 * A4).det()))

# Punto 5
A5 = np.array([[0.0, 1], [0, -2]])
B5 = np.array([[0.0], [1]])
C5 = np.array([[1.0, 0]])
K5 = np.reshape(ct.acker(A5, B5, [-4 + 4j, -4 - 4j]), (1, 2))
L5 = np.reshape(ct.acker(A5.T, C5.T, [-16, -16]), (2, 1))
N5 = -1 / (C5 @ np.linalg.inv(A5 - B5 @ K5) @ B5)
print("P5: K =", K5.ravel().tolist(), "N =", round(N5.item(), 6), "L =", L5.ravel().tolist())

# Punto 6
D6 = [1, 14, 66, 144]
for nombre, num in (("un parametro", [17, 108]), ("dos parametros", [18, 144])):
    T6 = ct.tf(num, D6)
    print(f"P6 {nombre}: T(0) =", round(float(ct.dcgain(T6)), 3), "Mp =", round(ct.step_info(T6)["Overshoot"], 1))
```

```text
P4: det O = (c - 3)*(c - 2)
P5: K = [32.0, 6.0] N = 32.0 L = [30.0, 196.0]
P6 un parametro: T(0) = 0.75 Mp = 5.1
P6 dos parametros: T(0) = 1.0 Mp = 4.3
```

</details>
