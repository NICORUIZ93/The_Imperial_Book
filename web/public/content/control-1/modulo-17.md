# Módulo 17: Lugar geométrico de las raíces

Cuando subes la ganancia \(K\) de un lazo, los polos de lazo cerrado se mueven. El lugar de las raíces es el dibujo de ese camino, y con él eliges \(K\) para poner los polos en la zona de diseño.

**Al terminar podrás:**

- Entender las condiciones de ángulo y de magnitud.
- Dibujar el lugar con las reglas, de forma justificada.
- Calcular el punto de quiebre, las asíntotas y el cruce con el eje imaginario.
- Hallar \(K\) para un \(\zeta\) deseado.

## Aprende construyendo


### Tema 1: Las dos condiciones del lugar de las raíces · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import I, arg, deg, N, Abs

s = -2 + 2 * I
angulo = -(deg(arg(s)) + deg(arg(s + 4)))
K = N(Abs(s) * Abs(s + 4), 3)
print("angulo:", N(angulo, 4))
print("K:", K)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Reglas de construcción (con su porqué) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```anatomy
control-1-lugar-raices
```

```python
# verificacion.py
poles = [0, -1, -2]
n_m = 3
centroide = sum(poles) / n_m
print("centroide:", centroide)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Elegir K desde el lugar de las raíces · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
a, zeta = 4, 0.5
wn = a / (2 * zeta)
K = wn ** 2
print("wn:", wn)
print("K:", K)
```

```bash
python3 verificacion.py
```

</details>
