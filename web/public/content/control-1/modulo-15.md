# Módulo 15: Estabilidad y criterio de Routh-Hurwitz

Para un polinomio de tercer orden o más, sacar las raíces a mano es difícil. Routh te dice cuántas raíces están en el semiplano derecho sin calcularlas, y qué rango de ganancias deja al sistema estable.

**Al terminar podrás:**

- Definir estabilidad BIBO y relacionarla con los polos.
- Armar el arreglo de Routh y contar raíces inestables.
- Resolver los dos casos especiales.
- Hallar el rango de \(K\) que hace estable un lazo y la frecuencia de oscilación en el límite.

## Aprende construyendo


### Tema 1: Qué es estabilidad · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, solve

s = symbols("s")
polos = solve((s + 1) * (s + 3), s)
print("polos:", polos)
print("estable:", all(p < 0 for p in polos))
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: El arreglo de Routh · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, solve, re

s = symbols("s")
raices = solve(s ** 3 + 6 * s ** 2 + 11 * s + 6, s)
inestables = sum(1 for r in raices if re(r) > 0)
print("raices:", raices)
print("raices_en_semiplano_derecho:", inestables)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Casos especiales del arreglo de Routh · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, solve

s = symbols("s")
raices = solve(s ** 3 + 2 * s ** 2 + 4 * s + 8, s)
print("raices:", raices)
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Rango de K para estabilidad · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, solve

s, K = symbols("s K")
char = s * (s + 1) * (s + 2) + K
print("raices en K=6:", solve(char.subs(K, 6), s))
```

```bash
python3 verificacion.py
```

</details>
