# Módulo 27: Método algebraico de diseño

Los módulos anteriores diseñaban «de afuera hacia adentro»: eliges un compensador y miras dónde quedan los polos. El método algebraico va al revés: eliges primero la función de transferencia del lazo cerrado y despejas el controlador con álgebra de polinomios. Es la unidad 7 del programa de Control I: igualación de modelos, ubicación de polos con la ecuación diofántica y compensador de dos parámetros.

**Al terminar podrás:**

- Despejar el controlador que iguala una función de transferencia deseada y decidir si es implementable.
- Resolver la ecuación diofántica \(A(s)P(s) + B(s)Q(s) = D(s)\) para ubicar todos los polos del lazo cerrado.
- Diseñar un compensador de dos parámetros que fije los polos y, por separado, los ceros y la ganancia de la referencia.

**Prerrequisitos:** módulos 3 (fracciones parciales), 14 (error estacionario) y 25 (ubicación de polos). **Lee en la bibliografía:** Chen, *Analog and Digital Control System Design*, caps. 9 y 10 (el texto del programa para esta unidad); como complemento, la ubicación de polos de Ogata, cap. 10.

**Laboratorio.** Trabajas en `academia-labs/control-1` con SymPy y `python-control` (verificado con `control 0.10.2`).

## Aprende construyendo


### Tema 1: Igualación de modelos · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por igualación de modelos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender igualación de modelos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en igualación de modelos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que igualación de modelos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Igualación de modelos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Igualación de modelos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses igualación de modelos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: igualación de modelos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Igualación de modelos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve igualación de modelos en tu contexto?
2. ¿Cómo sabrías que igualación de modelos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar igualación de modelos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# igualacion.py
import sympy as sp

s = sp.symbols("s")
G = 2 / (s * (s + 2))
T = 16 / (s**2 + 4 * s + 16)
C = sp.factor(sp.simplify(T / (G * (1 - T))))
L = sp.factor(sp.simplify(C * G))
print("C(s) =", C)
print("L(s) =", L)
print("T comprobada =", sp.factor(sp.simplify(L / (1 + L))))
print("Kv =", sp.limit(s * L, s, 0))
```

```text
C(s) = 8*(s + 2)/(s + 4)
L(s) = 16/(s*(s + 4))
T comprobada = 16/(s**2 + 4*s + 16)
Kv = 4
```

```python
# igualacion_sim.py
import control as ct

G = ct.tf([2], [1, 2, 0])
C = ct.tf([8, 16], [1, 4])
T = ct.feedback(C * G, 1)
info = ct.step_info(T)
print("polos:", T.poles().round(4).tolist())
print("Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 2), "s")
```

```python
# implementable.py
import sympy as sp

s = sp.symbols("s")

G = 2 / (s * (s + 2))
T_rapida = 4 / (s + 4)                   # grado relativo 1 < 2
print("C impropio:", sp.factor(sp.simplify(T_rapida / (G * (1 - T_rapida)))))

G_inestable = 1 / (s - 1)
T = 4 / (s + 4)
C = sp.factor(sp.simplify(T / (G_inestable * (1 - T))))
print("C que cancela el polo inestable:", C)
perturbacion_a_salida = sp.factor(sp.cancel(G_inestable / (1 + C * G_inestable)))
print("de la perturbacion a la salida:", perturbacion_a_salida)
```

```text
C impropio: 2*(s + 2)
C que cancela el polo inestable: 4*(s - 1)/s
de la perturbacion a la salida: s/((s - 1)*(s + 4))
```

</details>

### Tema 2: Ubicación de polos con la ecuación diofántica · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por ubicación de polos con la ecuación diofántica con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender ubicación de polos con la ecuación diofántica te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en ubicación de polos con la ecuación diofántica como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que ubicación de polos con la ecuación diofántica resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Ubicación de polos con la ecuación diofántica se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Ubicación de polos con la ecuación diofántica | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses ubicación de polos con la ecuación diofántica por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: ubicación de polos con la ecuación diofántica funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Ubicación de polos con la ecuación diofántica existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve ubicación de polos con la ecuación diofántica en tu contexto?
2. ¿Cómo sabrías que ubicación de polos con la ecuación diofántica no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar ubicación de polos con la ecuación diofántica?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# diofantica.py
import sympy as sp

s, p0, q1, q0 = sp.symbols("s p0 q1 q0")
A = (s + 1) * (s + 2)
B = 1
D = sp.expand((s**2 + 6 * s + 25) * (s + 10))
izquierda = sp.expand(A * (s + p0) + B * (q1 * s + q0))
print("D(s) =", D)
print("A P + B Q =", sp.collect(izquierda, s))
```

```python
import control as ct

solucion = sp.solve(sp.Poly(izquierda - D, s).all_coeffs(), [p0, q1, q0])
print("solucion:", solucion)
C = ct.tf([float(solucion[q1]), float(solucion[q0])], [1, float(solucion[p0])])
G = ct.tf([1], [1, 3, 2])
T = ct.feedback(C * G, 1)
print("polos:", sorted(T.poles().round(4).tolist(), key=lambda p: p.real))
print("T(0) =", round(float(ct.dcgain(T)), 3))
```

```python
# diofantica_integral.py
import sympy as sp
import control as ct

s, p0, q2, q1, q0 = sp.symbols("s p0 q2 q1 q0")
A = (s + 1) * (s + 2)
D = sp.expand((s**2 + 6 * s + 25) * (s + 10) ** 2)
izquierda = sp.expand(A * s * (s + p0) + (q2 * s**2 + q1 * s + q0))
solucion = sp.solve(sp.Poly(izquierda - D, s).all_coeffs(), [p0, q2, q1, q0])
print("solucion:", solucion)

C = ct.tf([float(solucion[q2]), float(solucion[q1]), float(solucion[q0])], [1, float(solucion[p0]), 0])
for ganancia in (1.0, 1.2):                       # planta nominal y con 20 % más de ganancia
    T = ct.feedback(C * ct.tf([ganancia], [1, 3, 2]), 1)
    print(f"ganancia de planta {ganancia}: T(0) =", round(float(ct.dcgain(T)), 6))
```

</details>

### Tema 3: Compensador de dos parámetros · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por compensador de dos parámetros con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender compensador de dos parámetros te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en compensador de dos parámetros como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
![Respuesta al escalón con compensador de uno y de dos parámetros](content/figures/control-1/dos-grados-libertad.svg)

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Compensador de dos parámetros se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Compensador de dos parámetros | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses compensador de dos parámetros por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: compensador de dos parámetros funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Compensador de dos parámetros existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve compensador de dos parámetros en tu contexto?
2. ¿Cómo sabrías que compensador de dos parámetros no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar compensador de dos parámetros?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# dos_parametros.py
import control as ct

D = [1, 16, 85, 250]                     # (s^2+6s+25)(s+10)
T_un_parametro = ct.tf([44, 224], D)     # M = Q
info = ct.step_info(T_un_parametro)
print("un parametro: Mp =", round(info["Overshoot"], 1), "% T(0) =", round(float(ct.dcgain(T_un_parametro)), 3))
```

```python
T_dos_parametros = ct.tf([25, 250], D)   # M = 25 (s + 10), B = 1
info = ct.step_info(T_dos_parametros)
print("dos parametros: Mp =", round(info["Overshoot"], 1), "% T(0) =", round(float(ct.dcgain(T_dos_parametros)), 3))
print("T simplificada:", ct.minreal(T_dos_parametros, verbose=False))
```

```python
import numpy as np

D4 = [1, 26, 245, 1100, 2500]            # (s^2+6s+25)(s+10)^2
T_integral_1p = ct.tf([174, 1054, 2500], D4)
T_integral_2p = ct.tf(np.polymul([25], [1, 20, 100]), D4)   # M = 25 (s+10)^2
for nombre, T in (("integral, un parametro", T_integral_1p), ("integral, dos parametros", T_integral_2p)):
    info = ct.step_info(T)
    print(nombre, ": Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 2), "s")
```

</details>
