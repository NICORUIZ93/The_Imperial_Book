# Módulo 25: Controlabilidad, observabilidad y ubicación de polos

En el módulo 10 escribiste sistemas en espacio de estados y obtuviste \(G(s)\) desde las matrices. Aquí das el paso de análisis a diseño: compruebas si la entrada puede mover todos los estados (controlabilidad), si la salida deja ver todos los estados (observabilidad) y, cuando se puede, colocas los polos del lazo cerrado donde quieras con \(u = -Kx\). Es la unidad 6 del programa de Control I.

**Al terminar podrás:**

- Construir las matrices de controlabilidad y de observabilidad y decidir con su rango.
- Relacionar la pérdida de controlabilidad u observabilidad con una cancelación polo-cero.
- Calcular la ganancia \(K\) por igualación de coeficientes y por Ackermann, y la ganancia de referencia \(\bar N\).

**Prerrequisitos:** módulos 10 (espacio de estados), 12 (segundo orden) y 16 (zona de diseño). **Lee en la bibliografía:** Ogata, caps. 9 y 10; Nise, cap. 12; Dorf y Bishop, cap. 11; Golnaraghi y Kuo, cap. 8.

**Laboratorio.** Trabajas en `academia-labs/control-1` con NumPy y `python-control` (verificado con `control 0.10.2`). El proyecto del módulo es la planta \(\ddot y + 3\dot y + 2y = u\), es decir \(G(s) = \dfrac{1}{(s+1)(s+2)}\), en forma canónica controlable:

\[A = \begin{bmatrix} 0 & 1 \\ -2 & -3 \end{bmatrix}, \quad B = \begin{bmatrix} 0 \\ 1 \end{bmatrix}, \quad C = \begin{bmatrix} 1 & 0 \end{bmatrix}\]

## Aprende construyendo


### Tema 1: Controlabilidad · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por controlabilidad con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender controlabilidad te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en controlabilidad como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que controlabilidad resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Controlabilidad se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Controlabilidad | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses controlabilidad por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: controlabilidad funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Controlabilidad existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve controlabilidad en tu contexto?
2. ¿Cómo sabrías que controlabilidad no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar controlabilidad?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# controlabilidad.py
import numpy as np
import control as ct

A = np.array([[0, 1], [-2, -3]])
B = np.array([[0], [1]])
Wc = ct.ctrb(A, B)
print("C =", Wc.tolist())
print("rango =", np.linalg.matrix_rank(Wc), "de", A.shape[0])
print("det =", round(np.linalg.det(Wc), 3))
```

```python
A2 = np.diag([-1, -2])
B2 = np.array([[1], [0]])
Wc2 = ct.ctrb(A2, B2)
print("C2 =", Wc2.tolist(), "rango =", np.linalg.matrix_rank(Wc2))
```

```python
# G(s) = (s+1)/((s+1)(s+2)) en forma canónica observable
Ao = A.T
Bo = np.array([[1], [1]])
Co = np.array([[0, 1]])
print("rango C =", np.linalg.matrix_rank(ct.ctrb(Ao, Bo)))
print(ct.ss2tf(ct.ss(Ao, Bo, Co, 0)))
```

</details>

### Tema 2: Observabilidad · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por observabilidad con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender observabilidad te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en observabilidad como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que observabilidad resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Observabilidad se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Observabilidad | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses observabilidad por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: observabilidad funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Observabilidad existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve observabilidad en tu contexto?
2. ¿Cómo sabrías que observabilidad no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar observabilidad?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# observabilidad.py
import numpy as np
import control as ct

A = np.array([[0, 1], [-2, -3]])
C = np.array([[1, 0]])
Wo = ct.obsv(A, C)
print("O =", Wo.tolist(), "rango =", np.linalg.matrix_rank(Wo))
```

```python
A2 = np.diag([-1, -2])
C2 = np.array([[0, 1]])
print("O2 =", ct.obsv(A2, C2).tolist(), "rango =", np.linalg.matrix_rank(ct.obsv(A2, C2)))
```

```python
B = np.array([[0], [1]])
Cz = np.array([[1, 1]])                  # numerador s + 1
print("rango O =", np.linalg.matrix_rank(ct.obsv(A, Cz)))
print("rango C de la dual =", np.linalg.matrix_rank(ct.ctrb(A.T, Cz.T)))
```

</details>

### Tema 3: Ubicación de polos por realimentación de estados · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por ubicación de polos por realimentación de estados con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender ubicación de polos por realimentación de estados te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en ubicación de polos por realimentación de estados como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que ubicación de polos por realimentación de estados resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Ubicación de polos por realimentación de estados se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Ubicación de polos por realimentación de estados | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses ubicación de polos por realimentación de estados por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: ubicación de polos por realimentación de estados funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Ubicación de polos por realimentación de estados existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve ubicación de polos por realimentación de estados en tu contexto?
2. ¿Cómo sabrías que ubicación de polos por realimentación de estados no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar ubicación de polos por realimentación de estados?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# ubicacion.py
import numpy as np
import sympy as sp

s, k1, k2 = sp.symbols("s k1 k2")
A = sp.Matrix([[0, 1], [-2, -3]])
B = sp.Matrix([0, 1])
K = sp.Matrix([[k1, k2]])
caracteristico = sp.expand((s * sp.eye(2) - (A - B * K)).det())
print("det(sI - A + BK) =", caracteristico)
deseado = sp.expand(s**2 + 6 * s + 25)
solucion = sp.solve(sp.Poly(caracteristico - deseado, s).all_coeffs(), [k1, k2])
print("K =", solucion)
```

```python
import control as ct

An = np.array([[0.0, 1], [-2, -3]])
Bn = np.array([[0.0], [1]])
phi = An @ An + 6 * An + 25 * np.eye(2)
K_ack = np.array([[0, 1]]) @ np.linalg.inv(ct.ctrb(An, Bn)) @ phi
print("Ackermann a mano:", K_ack.round(6).tolist())
print("ct.place:", ct.place(An, Bn, [-3 + 4j, -3 - 4j]).round(6).tolist())
print("polos:", np.linalg.eigvals(An - Bn @ K_ack))
```

```python
Cn = np.array([[1.0, 0]])
Acl = An - Bn @ K_ack
N_bar = -1 / (Cn @ np.linalg.inv(Acl) @ Bn)
T = ct.ss(Acl, Bn * N_bar, Cn, 0)
info = ct.step_info(T)
print("N_bar =", N_bar.round(6).tolist())
print("ganancia estatica =", round(float(ct.dcgain(T)), 6))
print("Mp =", round(info["Overshoot"], 2), "% ts =", round(info["SettlingTime"], 2), "s")
```

</details>
