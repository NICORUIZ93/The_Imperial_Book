# Módulo 3: Transformada inversa

Para saber cómo se comporta la salida en el tiempo hay que volver de \(Y(s)\) a \(y(t)\). Casi siempre \(Y(s)\) no está en la tabla tal cual: hay que partirla.

**Al terminar podrás:**

- Descomponer en fracciones parciales con polos reales distintos y repetidos.
- Manejar polos complejos completando el cuadrado.
- Combinar las dos técnicas, como en la respuesta al escalón de segundo orden.

## Aprende construyendo


### Tema 1: Caso 1: polos reales distintos · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► POR QUÉ EXISTE ESTO
1. Parte de la igualdad \(\dfrac{N(s)}{(s+a)(s+b)} = \dfrac{A}{s+a} + \dfrac{B}{s+b}\). 2. Multiplica ambos lados por \((s+a)\): \(\dfrac{N(s)}{s+b} = A + \dfrac{B(s+a)}{s+b}\). 3. Evalúa en \(s=-a\): el último término se anula porque tiene el factor \((s+a)\). Queda \(A = \left.\dfrac{N(s)}{s+b}\right|_{s=-a}\). 4. “Tapar” el factor y evaluar es hacer estos dos pasos de un golpe.

#### ► CÓMO FUNCIONA
1. Parte de la igualdad \(\dfrac{N(s)}{(s+a)(s+b)} = \dfrac{A}{s+a} + \dfrac{B}{s+b}\).
2. Multiplica ambos lados por \((s+a)\): \(\dfrac{N(s)}{s+b} = A + \dfrac{B(s+a)}{s+b}\).
3. Evalúa en \(s=-a\): el último término se anula porque tiene el factor \((s+a)\).
4. Queda \(A = \left.\dfrac{N(s)}{s+b}\right|_{s=-a}\).
5. “Tapar” el factor y evaluar es hacer estos dos pasos de un golpe.

#### ► LO QUE DEBES RECORDAR
- Parte de la igualdad \(\dfrac{N(s)}{(s+a)(s+b)} = \dfrac{A}{s+a} + \dfrac{B}{s+b}\).
- Multiplica ambos lados por \((s+a)\): \(\dfrac{N(s)}{s+b} = A + \dfrac{B(s+a)}{s+b}\).
- Evalúa en \(s=-a\): el último término se anula porque tiene el factor \((s+a)\).
- Queda \(A = \left.\dfrac{N(s)}{s+b}\right|_{s=-a}\).
</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, apart

s = symbols("s")
Y = 6 / (s * (s + 3))
print("fracciones:", apart(Y))
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Caso 2: polos repetidos · Básico · 45 min

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
Y = 1 / (s * (s + 1) ** 2)
print("fracciones:", apart(Y))
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Caso 3: polos complejos (completar el cuadrado) · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, expand

s = symbols("s")
completado = expand((s + 1) ** 2 + 36)
print("completado:", completado)
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Resolver una ecuación diferencial completa · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, Function, dsolve, Eq, Derivative

t = symbols("t")
y = Function("y")
sol = dsolve(Eq(Derivative(y(t), t) + 2 * y(t), 4), y(t), ics={y(0): 0})
print("y(t):", sol)
```

```bash
python3 verificacion.py
```

</details>
