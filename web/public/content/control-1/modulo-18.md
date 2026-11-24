# Módulo 18: Acciones básicas de control: P, I, D

El controlador decide cuánta acción aplicar según el error. Aquí verás qué hace cada acción con números y no solo con palabras, para que puedas explicar ventajas y desventajas con argumentos.

**Al terminar podrás:**

- Escribir la ley de control y \(C(s)\) de ON/OFF, P, I, D, PI, PD y PID.
- Calcular el error en estado estacionario y ver por qué la acción integral lo elimina.
- Mostrar con un ejemplo numérico el efecto de cada ganancia.
- Responder el punto 4 del Parcial 1 con argumentos técnicos.

## Aprende construyendo


### Tema 1: La idea de las acciones P, I y D: presente, pasado y tendencia · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
Kp, Ki, Kd = 4, 2, 0.5
Ti = Kp / Ki
Td = Kd / Kp
print("Ti:", Ti)
print("Td:", Td)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Error en estado estacionario · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, limit

s = symbols("s")
P = 1 / (s + 2)
C = 4
e_ss = limit(1 / (1 + C * P), s, 0)
print("e_ss:", e_ss)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Cada acción, con números · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Efecto de subir Kp](content/figures/control-1/efecto-kp.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import Rational

Kp = 9
e_ss = Rational(1, 1 + Kp)
print("e_ss:", e_ss)
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Ventajas y desventajas (punto 4 del Parcial 1) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, limit

s = symbols("s")
CG = 4 / (s * (s + 2))
Kv = limit(s * CG, s, 0)
print("Kv:", Kv)
print("error_rampa:", 1 / Kv)
```

```bash
python3 verificacion.py
```

</details>

### Tema 5: Sintonía de Ziegler-Nichols · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
Ku, Pu = 10, 2
Kp_P = 0.5 * Ku
Kp_PI, Ti_PI = 0.45 * Ku, Pu / 1.2
Kp_PID, Ti_PID, Td_PID = 0.6 * Ku, Pu / 2, Pu / 8
print("P:", Kp_P)
print("PI:", Kp_PI, Ti_PI)
print("PID:", Kp_PID, Ti_PID, Td_PID)
```

```bash
python3 verificacion.py
```

</details>
