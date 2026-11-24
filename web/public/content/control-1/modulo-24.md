# Módulo 24: Compensación en el dominio de la frecuencia

En el módulo 19 diseñaste adelantos y atrasos con el lugar de las raíces, a partir de polos deseados. Aquí los diseñas con el diagrama de Bode, a partir de dos números que se leen directamente: la constante de error y el margen de fase. Es el método que pide la unidad 5 del programa de Control I.

**Al terminar podrás:**

- Diseñar un compensador de adelanto que cumpla \(K_v\) y un margen de fase mínimo.
- Diseñar un compensador de atraso y un atraso-adelanto con el mismo procedimiento.
- Medir la robustez con el pico de sensibilidad \(M_s\) y elegir el tipo de compensador.

**Prerrequisitos:** módulos 14 (error estacionario), 19 (compensadores), 20 (Bode) y 23 (Nyquist). **Lee en la bibliografía:** Ogata, cap. 7; Nise, cap. 11; Dorf y Bishop, cap. 10; Golnaraghi y Kuo, cap. 11.

**Laboratorio.** Trabajas en `academia-labs/control-1` con `python-control` (verificado con `control 0.10.2`).

## Aprende construyendo


### Tema 1: Compensador de adelanto por margen de fase · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Bode del lazo antes y después del adelanto](content/figures/control-1/adelanto-bode.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# adelanto.py
import numpy as np
import control as ct

G = ct.tf([4], [1, 2, 0])                # 4/(s(s+2))
K = 20 / 2                               # Kv = 2K
KG = K * G
gm, pm0, w_pc, wc0 = ct.margin(KG)
print("K =", K)
print("MF sin compensar =", round(pm0, 1), "grados en wc =", round(wc0, 2))
```

```python
extra = 8                                # grados de corrección
phi_m = 50 - pm0 + extra
alpha = (1 - np.sin(np.radians(phi_m))) / (1 + np.sin(np.radians(phi_m)))
# nuevo cruce: donde |KG(jw)| = sqrt(alpha), es decir 40/(w*sqrt(w^2+4)) = sqrt(alpha)
x = (-4 + np.sqrt(16 + 4 * 1600 / alpha)) / 2
wm = np.sqrt(x)
print("phi_m =", round(phi_m, 1), "alpha =", round(alpha, 3))
print("ganancia del adelanto en wm =", round(10 * np.log10(1 / alpha), 2), "dB")
print("nuevo cruce wm =", round(wm, 2))
```

```python
T = 1 / (wm * np.sqrt(alpha))
cero, polo, Kc = 1 / T, 1 / (alpha * T), K / alpha
print("cero =", round(cero, 2), "polo =", round(polo, 2), "Kc =", round(Kc, 1))

Gc = 46.1 * ct.tf([1, 4.27], [1, 19.7])  # valores redondeados
L = Gc * G
gm, pm, w_pc, wc = ct.margin(L)
print("MF compensado =", round(pm, 1), "en wc =", round(wc, 2))
for nombre, lazo in (("sin", KG), ("con", L)):
    info = ct.step_info(ct.feedback(lazo, 1))
    print(nombre, "compensador: Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 2), "s")
```

```text
cero = 4.27 polo = 19.66 Kc = 46.1
MF compensado = 52.4 en wc = 9.15
sin compensador: Mp = 60.3 % ts = 3.69 s
con compensador: Mp = 19.8 % ts = 0.63 s
```

</details>

### Tema 2: Compensador de atraso por margen de fase · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# atraso.py
import numpy as np
import control as ct
from scipy.optimize import brentq

G = ct.tf([1], np.polymul([1, 1, 0], [0.5, 1]))   # 1/(s(s+1)(0.5s+1))
K = 5
KG = K * G
gm, pm0, w_pc, wc0 = ct.margin(KG)
print("MF sin compensar =", round(pm0, 1))

objetivo = -180 + 40 + 12
w1 = brentq(lambda w: np.degrees(np.angle(KG(1j * w))) - objetivo, 0.05, 1.4)
beta = abs(KG(1j * w1))
print("nuevo cruce w1 =", round(w1, 3), "|KG(j w1)| =", round(beta, 2))
```

```python
T = 1 / 0.05                             # cero en 0.05 rad/s (cerca de w1/10)
Gc = K * ct.tf([T, 1], [10 * T, 1])      # beta = 10
L = Gc * G
gm, pm, w_pc, wc = ct.margin(L)
info = ct.step_info(ct.feedback(L, 1))
print("Gc =", Gc)
print("MF =", round(pm, 1), "MG =", round(20 * np.log10(gm), 1), "dB en wc =", round(wc, 3))
print("Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 1), "s")
```

```python
# comparar.py
import control as ct

adelanto = 46.1 * ct.tf([1, 4.27], [1, 19.7]) * ct.tf([4], [1, 2, 0])
atraso = 5 * ct.tf([20, 1], [200, 1]) * ct.tf([1], [0.5, 1.5, 1, 0])
for nombre, L in (("adelanto", adelanto), ("atraso", atraso)):
    T = ct.feedback(L, 1)
    print(nombre, "ancho de banda =", round(ct.bandwidth(T), 2), "rad/s")
```

</details>

### Tema 3: Atraso-adelanto y sensibilidad · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# atraso_adelanto.py
import numpy as np
import control as ct

G = ct.tf([1], [1, 3, 2, 0])
K = 20
gm0, pm0, _, _ = ct.margin(K * G)
print("sin compensar: MF =", round(pm0, 1), "MG =", round(20 * np.log10(gm0), 1), "dB")

adelanto = ct.tf([1 / 0.5, 1], [1 / 5, 1])        # cero 0.5, polo 5 (alpha = 0.1)
atraso = ct.tf([1 / 0.15, 1], [1 / 0.015, 1])     # cero 0.15, polo 0.015 (beta = 10)
L = K * adelanto * atraso * G
gm, pm, _, wc = ct.margin(L)
info = ct.step_info(ct.feedback(L, 1))
print("compensado: MF =", round(pm, 1), "MG =", round(20 * np.log10(gm), 1), "dB en wc =", round(wc, 2))
print("Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 1), "s")
```

```text
sin compensar: MF = -28.1 MG = -10.5 dB
compensado: MF = 50.5 MG = 13.0 dB en wc = 1.38
Mp = 19.1 % ts = 14.7 s
```

```python
# sensibilidad.py
import numpy as np
import control as ct

G = ct.tf([4], [1, 2, 0])
lazos = {
    "solo ganancia": 10 * G,
    "con adelanto": 46.1 * ct.tf([1, 4.27], [1, 19.7]) * G,
}
w = np.logspace(-2, 3, 50000)
for nombre, L in lazos.items():
    S = ct.feedback(1, L)                 # S = 1/(1 + L)
    Ms = np.max(np.abs(S(1j * w)))
    print(nombre, ": Ms =", round(Ms, 2), "=", round(20 * np.log10(Ms), 1), "dB")
```

```python
# elegir.py
import numpy as np
import control as ct

casos = {
    "4/(s(s+2)), K=10": 10 * ct.tf([4], [1, 2, 0]),
    "1/(s(s+1)(s+2)), K=20": 20 * ct.tf([1], [1, 3, 2, 0]),
}
for nombre, L in casos.items():
    _, pm, _, wc = ct.margin(L)
    deficit = 50 - pm + 5
    print(nombre, ": MF =", round(pm, 1), "deficit =", round(deficit, 1), "grados")
```

</details>
