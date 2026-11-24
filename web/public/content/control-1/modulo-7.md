# Módulo 7: Circuitos y amplificadores operacionales

Con impedancias en Laplace, un circuito se resuelve como si solo tuviera resistencias. Es el atajo para el punto 2 del Parcial 1.

**Al terminar podrás:**

- Escribir la impedancia de R, C y L, y combinarlas en serie y en paralelo.
- Hallar \(G(s)\) de circuitos RC, RL y RLC con divisor de voltaje.
- Hallar \(G(s)\) de un op-amp inversor y de etapas en cascada.
- Reconocer qué acción de control (P, I, D, PI, PD) implementa cada circuito.

## Aprende construyendo


### Tema 1: Impedancias de resistencia, bobina y condensador en s · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols

s = symbols("s")
R, L = 2000, 0.5
Z = R + L * s
print("Z(s):", Z)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Circuitos pasivos: divisor de voltaje · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify, Rational

s = symbols("s")
R = 10000
C = Rational(1, 10000)  # 100 microfaradios
G = simplify((1 / (C * s)) / (R + 1 / (C * s)))
print("G(s):", G)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: El op-amp inversor · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► CÓMO FUNCIONA
![Op-amp inversor con Zi a la entrada y Zf de realimentación](content/figures/control-1/opamp-inversor.svg)

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify, Rational, apart

s = symbols("s")
R1, R2 = 10000, 100000
C = Rational(1, 100000)  # 10 microfaradios
Zf = R2 + 1 / (C * s)
G = simplify(-Zf / R1)
print("G(s):", apart(G))
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: El op-amp no inversor y el regulador de tensión en serie · Intermedio · 45 min

## Motivación

Las fuentes de laboratorio y muchos cargadores entregan una tensión fija aunque la entrada o la carga cambien. Por dentro suelen tener un op-amp, un zener y un transistor, y la tensión de salida sale de una sola ecuación: la del amplificador no inversor que viste junto al inversor.

## Concepto

En el **amplificador no inversor**, la señal entra por la entrada (+) y la salida se realimenta a la entrada (−) mediante un divisor \(R_1\) (de la salida a −) y \(R_2\) (de − a tierra). Con realimentación negativa, el op-amp ajusta su salida hasta que \(V_- = V_+\). Como \(V_- = V_o \cdot \frac{R_2}{R_1+R_2}\):

\[ V_o = V_+ \left(1 + \frac{R_1}{R_2}\right) \]

La ganancia es siempre ≥ 1 y no invierte el signo.

Un **regulador serie** usa esa misma ecuación con tres piezas:
- **Referencia:** un zener fija \(V_+\) a una tensión estable.
- **Transistor de paso:** \(Q_1\) va entre la entrada y la salida y aporta la corriente que el op-amp no puede dar.
- **Op-amp:** maneja la base de \(Q_1\) para que la salida cumpla la ecuación.

## Ejemplo resuelto

Entrada \(V_i = 36\) V. El zener de 6,2 V, polarizado con 1 kΩ, fija la entrada (+). El divisor de salida es de 30 kΩ (arriba) y 10 kΩ (abajo). ¿Cuánto vale \(V_o\)? Opciones: 12,4 V · 18,6 V · 24,8 V · 30,0 V.

\[ V_o\,\frac{10}{30+10} = 6{,}2 \;\Rightarrow\; V_o = 6{,}2\left(1+\frac{30}{10}\right) = 24{,}8\ \text{V} \]

**Archivo:** `regulador.py`

```python
# regulador.py — regulador serie: op-amp no inversor + transistor de paso
from sympy import Rational, symbols, solve

Vo = symbols("Vo")
Vz, R1, R2, Vi = Rational(62, 10), 30_000, 10_000, 36

# El op-amp iguala sus entradas: la tensión del divisor vale lo mismo que la del zener
salida = solve(Vo * R2 / (R1 + R2) - Vz, Vo)[0]
print("Vo =", float(salida), "V")
print("Caída en Q1 =", float(Vi - salida), "V")
```

```text
$ python3 regulador.py
Vo = 24.8 V
Caída en Q1 = 11.2 V
```

Respuesta: **24,8 V**. Las opciones 12,4 y 18,6 salen de errores típicos: usar el doble de \(V_z\) (12,4 V), o multiplicar solo por \(R_1/R_2\), que es la ganancia del inversor (18,6 V).

## Reglas y casos límite

- **Margen de entrada.** El regulador solo funciona si \(V_i - V_o\) supera la caída mínima del transistor (unos 0,7 V de \(V_{BE}\) más la saturación del op-amp). Aquí sobran 11,2 V.
- **Potencia en \(Q_1\).** Disipa \((V_i - V_o)\cdot I_{carga}\). Con 1 A son 11,2 W: necesita disipador. Por eso, cuando la diferencia es grande, se usan reguladores conmutados.
- **La resistencia del zener** limita su corriente: \((36 - 6{,}2)/1\,k\Omega \approx 29{,}8\) mA.

## Compruébalo

1. ¿Qué resistencia superior da 15 V de salida con el mismo zener y 10 kΩ abajo?
2. Si el zener fuera de 5,1 V, ¿cuánto valdría \(V_o\) con el divisor original?

