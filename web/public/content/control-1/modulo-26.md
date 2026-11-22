# Módulo 26: Observadores de estado

En el módulo 25 ubicaste los polos con \(u = -Kx\), suponiendo que mides todo el estado. En la práctica solo mides \(y\). Un observador reconstruye \(\hat x\) a partir de \(y\) y \(u\), y el controlador usa \(u = -K\hat x\). Cierra la unidad 6 del programa de Control I.

**Al terminar podrás:**

- Diseñar la ganancia \(L\) de un observador de orden completo por coeficientes y por dualidad.
- Simular la convergencia del observador y elegir su velocidad sabiendo qué cuesta.
- Unir controlador y observador, comprobar el principio de separación y obtener el compensador equivalente \(C(s)\).

**Prerrequisitos:** módulo 25. **Lee en la bibliografía:** Ogata, cap. 10; Nise, cap. 12; Dorf y Bishop, cap. 11; Golnaraghi y Kuo, cap. 8.

**Laboratorio.** Trabajas en `academia-labs/control-1` con `python-control` (verificado con `control 0.10.2`). Sigues con la planta del módulo 25:

\[A = \begin{bmatrix} 0 & 1 \\ -2 & -3 \end{bmatrix}, \quad B = \begin{bmatrix} 0 \\ 1 \end{bmatrix}, \quad C = \begin{bmatrix} 1 & 0 \end{bmatrix}, \quad K = \begin{bmatrix} 23 & 3 \end{bmatrix}\]

## Aprende construyendo


### Tema 1: El observador de orden completo · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por el observador de orden completo con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender el observador de orden completo te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en el observador de orden completo como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que el observador de orden completo resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| El observador de orden completo se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar El observador de orden completo | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses el observador de orden completo por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: el observador de orden completo funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- El observador de orden completo existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve el observador de orden completo en tu contexto?
2. ¿Cómo sabrías que el observador de orden completo no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar el observador de orden completo?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# observador.py
import numpy as np
import control as ct

A = np.array([[0.0, 1], [-2, -3]])
B = np.array([[0.0], [1]])
C = np.array([[1.0, 0]])
t = np.linspace(0, 3, 3001)

# copia sin corrección: el error evoluciona con e' = A e, desde e(0) = [1, 0]
copia = ct.initial_response(ct.ss(A, B, np.eye(2), 0), T=t, X0=[1, 0])
for tt in (1, 2, 3):
    print(f"copia t={tt}: |e| =", round(float(np.linalg.norm(copia.states[:, tt * 1000])), 3))
```

```python
# observador_l.py
import sympy as sp

s, l1, l2 = sp.symbols("s l1 l2")
A = sp.Matrix([[0, 1], [-2, -3]])
C = sp.Matrix([[1, 0]])
L = sp.Matrix([l1, l2])
caracteristico = sp.expand((s * sp.eye(2) - (A - L * C)).det())
print("det(sI - A + LC) =", sp.collect(caracteristico, s))
deseado = sp.expand((s + 10) ** 2)
print("L =", sp.solve(sp.Poly(caracteristico - deseado, s).all_coeffs(), [l1, l2]))
```

```python
L = np.reshape(ct.acker(A.T, C.T, [-10, -10]), (2, 1))
print("L =", L.ravel().tolist())
print("polos del error:", np.linalg.eigvals(A - L @ C).real.round(6).tolist())
print("L con place en -10 y -12:", ct.place(A.T, C.T, [-10, -12]).T.ravel().round(6).tolist())
```

</details>

### Tema 2: Elige la velocidad del observador · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por elige la velocidad del observador con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender elige la velocidad del observador te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en elige la velocidad del observador como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
![Estado x1 y su estimación con un observador rápido y uno lento](content/figures/control-1/observador-error.svg)

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Elige la velocidad del observador se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Elige la velocidad del observador | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses elige la velocidad del observador por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: elige la velocidad del observador funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Elige la velocidad del observador existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve elige la velocidad del observador en tu contexto?
2. ¿Cómo sabrías que elige la velocidad del observador no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar elige la velocidad del observador?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# convergencia.py
import numpy as np
import control as ct

A = np.array([[0.0, 1], [-2, -3]])
C = np.array([[1.0, 0]])
t = np.linspace(0, 2, 2001)


def error_estimacion(polos):
    L = np.reshape(ct.acker(A.T, C.T, polos), (2, 1))
    # estados [x; x_hat] sin entrada: x' = A x, x_hat' = L C x + (A - L C) x_hat
    A_aug = np.block([[A, np.zeros((2, 2))], [L @ C, A - L @ C]])
    r = ct.initial_response(ct.ss(A_aug, np.zeros((4, 1)), np.eye(4), 0), T=t, X0=[1, 0, 0, 0])
    e = r.states[0:2] - r.states[2:4]
    return L, np.linalg.norm(e, axis=0)


for nombre, polos in (("rapido", [-10, -10]), ("lento", [-1, -1])):
    L, norma = error_estimacion(polos)
    print(nombre, "L =", L.ravel().tolist(), "|e| en t=0.5:", round(float(norma[500]), 3), "en t=1:", round(float(norma[1000]), 3))
```

```text
rapido L = [17.0, 47.0] |e| en t=0.5: 0.166 en t=1: 0.002
lento L = [-1.0, 2.0] |e| en t=0.5: 1.716 en t=1: 1.839
```

```python
for nombre, polos in (("rapido", [-10, -10]), ("lento", [-1, -1])):
    L, _ = error_estimacion(polos)
    ruido_a_error = ct.ss(A - L @ C, -L, np.array([[1.0, 0]]), 0)
    print(nombre, "ganancia del ruido en w=100:", round(abs(ruido_a_error(100j)), 4))
```

```python
derivador = ct.tf([1, 0], [1])
L, _ = error_estimacion([-10, -10])
ruido_a_x2 = ct.ss(A - L @ C, -L, np.array([[0.0, 1]]), 0)
print("derivador en w=100:", abs(derivador(100j)))
print("observador (estado x2) en w=100:", round(abs(ruido_a_x2(100j)), 3))
```

</details>

### Tema 3: Controlador con observador · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por controlador con observador con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender controlador con observador te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en controlador con observador como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que controlador con observador resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Controlador con observador se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Controlador con observador | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses controlador con observador por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: controlador con observador funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Controlador con observador existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve controlador con observador en tu contexto?
2. ¿Cómo sabrías que controlador con observador no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar controlador con observador?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# separacion.py
import numpy as np
import control as ct

A = np.array([[0.0, 1], [-2, -3]])
B = np.array([[0.0], [1]])
C = np.array([[1.0, 0]])
K = np.array([[23.0, 3]])
L = np.array([[17.0], [47]])
N_bar = 25.0

# estados [x; x_hat], u = -K x_hat + N_bar r
A_cl = np.block([[A, -B @ K], [L @ C, A - B @ K - L @ C]])
B_cl = np.vstack([B * N_bar, B * N_bar])
C_cl = np.hstack([C, np.zeros((1, 2))])
polos = np.sort_complex(np.linalg.eigvals(A_cl))
print("partes reales:", (np.round(polos.real, 4) + 0.0).tolist())
print("partes imaginarias:", (np.round(polos.imag, 4) + 0.0).tolist())
T = ct.ss(A_cl, B_cl, C_cl, 0)
info = ct.step_info(T)
print("Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 1), "s")
```

```python
compensador = ct.tf(ct.ss(A - B @ K - L @ C, L, K, 0))
print(compensador)
G = ct.tf(ct.ss(A, B, C, 0))
gm, pm, _, wc = ct.margin(compensador * G)
print("MF =", round(pm, 1), "MG =", round(20 * np.log10(gm), 1), "dB en wc =", round(wc, 2))
```

```python
A_real = np.array([[0.0, 1], [-2.5, -3]])  # rigidez 25 % mayor
A_cl_real = np.block([[A_real, -B @ K], [L @ C, A - B @ K - L @ C]])
T_real = ct.ss(A_cl_real, B_cl, C_cl, 0)
print("polos con error de modelo:", np.round(np.sort_complex(np.linalg.eigvals(A_cl_real)), 3).tolist())
print("ganancia estatica:", round(float(ct.dcgain(T_real)), 4))
```

</details>
