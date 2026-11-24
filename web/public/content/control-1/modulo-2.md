# Módulo 2: Transformada de Laplace

Es la herramienta central del curso. Convierte funciones del tiempo en funciones de \(s\), y así las ecuaciones diferenciales se vuelven álgebra.

**Al terminar podrás:**

- Transformar las funciones típicas usando la tabla.
- Usar las propiedades: linealidad, desplazamiento, retardo, derivada e integral.
- Calcular el valor final de una salida sin resolverla completa.

## Aprende construyendo


### Tema 1: La idea de la transformada de Laplace: del tiempo al dominio s · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, exp, laplace_transform

t, s = symbols("t s", positive=True)
F, _, _ = laplace_transform(exp(-2 * t), t, s)
print("F(s):", F)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: La tabla de transformadas de Laplace · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, exp, laplace_transform

t, s = symbols("t s", positive=True)
F, _, _ = laplace_transform(t * exp(-4 * t), t, s)
print("F(s):", F)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Propiedades de la transformada de Laplace · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, apart

s = symbols("s")
Y = (s + 3) / ((s + 1) * (s + 2))
print("fracciones parciales:", apart(Y))
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Valor final y valor inicial · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CUÁNDO NO USAR ESTO
> Qué cambia respecto al anterior: Mismo cálculo, pero el sistema es inestable.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, limit

s = symbols("s")
sY = 10 / (s + 2)
print("valor_final:", limit(sY, s, 0))
```

```bash
python3 verificacion.py
```

</details>
