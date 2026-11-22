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

**¿Por qué es importante?** Si la especificación es «quiero que el lazo cerrado se comporte como este segundo orden», no hace falta tantear: el controlador sale de una división. **Modelo mental:** \(T = \dfrac{CG}{1 + CG}\) se puede despejar como cualquier ecuación.

**Proyecto integrador:** para \(G(s) = \dfrac{2}{s(s+2)}\), consigue \(T(s) = \dfrac{16}{s^2 + 4s + 16}\) (\(\zeta = 0{,}5\), \(\omega_n = 4\)). **Límite:** el método cancela dinámica de la planta; solo es aceptable si lo cancelado es estable y bien conocido.

#### Subtema 1.1: Despeja el controlador · 10 min

**1. Contexto**

\[T = \frac{CG}{1 + CG} \quad\Longrightarrow\quad \boxed{C = \frac{T}{G\,(1 - T)}}\]

**2. Hazlo tú**

Guarda en `academia-labs/control-1/igualacion.py`:

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

**Resultado esperado:**

```text
C(s) = 8*(s + 2)/(s + 4)
L(s) = 16/(s*(s + 4))
T comprobada = 16/(s**2 + 4*s + 16)
Kv = 4
```

**Fallo deliberado:** escribe `C = T / (G * (1 + T))`. **Diagnóstico:** el resultado ya no reproduce \(T\) al cerrar el lazo. Despeja de nuevo: \(T(1 + CG) = CG \Rightarrow C\,G\,(1 - T) = T\).

**3. Entiende**

\(1 - T = \dfrac{s(s+4)}{s^2+4s+16}\), así que \(C = \dfrac{16}{s(s+4)}\cdot\dfrac{s(s+2)}{2} = \dfrac{8(s+2)}{s+4}\). Es un adelanto cuyo cero cancela el polo de la planta en \(-2\) y lo reemplaza por uno en \(-4\). La cancelación es aceptable porque \(-2\) es estable.

**4. Cierra**

Registra \(C(s)\) y comprueba que el integrador de la planta sobrevive en \(L\) (por eso \(K_v\) es finito y el error ante escalón es cero).

#### Subtema 1.2: Verifica la respuesta · 10 min

**1. Contexto**

Toda igualación se verifica simulando el lazo con la planta y el controlador por separado, no con la \(T\) que pediste.

**2. Hazlo tú**

Guarda en `igualacion_sim.py`:

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

**Resultado esperado:** `polos: [(-2+3.4641j), (-2-3.4641j), (-2+0j)]` y `Mp = 16.3 % ts = 2.02 s`.

**Fallo deliberado:** busca solo dos polos. **Diagnóstico:** el lazo construido con `feedback` es de orden 3: aparece el polo cancelado en \(-2\). No se ve en la salida porque el cero de \(C\) lo cancela, pero existe; si la planta real tuviera el polo en \(-2{,}2\), la cancelación sería imperfecta y dejaría una cola lenta.

**3. Entiende**

\(M_p = 16{,}3\,\%\) es el de \(\zeta = 0{,}5\) (módulo 12). El polo en \(-2\) cancelado sigue presente en el lazo; la igualación de modelos siempre conserva los polos cancelados como modos ocultos.

**4. Cierra**

Anota el orden real del lazo y por qué la cancelación es aceptable aquí.

#### Subtema 1.3: Reconoce cuándo T no es implementable · 15 min

**1. Contexto**

No toda \(T\) se puede pedir. Hay dos reglas:

1. **Causalidad:** el grado relativo de \(T\) (grado del denominador menos el del numerador) debe ser al menos el de \(G\); si no, \(C\) es impropio.
2. **Estabilidad interna:** \(T\) debe conservar los ceros de \(G\) en el semiplano derecho, y \(C\) no puede cancelar polos inestables de \(G\).

**2. Hazlo tú**

Guarda en `implementable.py`:

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

**Resultado esperado:**

```text
C impropio: 2*(s + 2)
C que cancela el polo inestable: 4*(s - 1)/s
de la perturbacion a la salida: s/((s - 1)*(s + 4))
```

**Fallo deliberado:** acepta \(C = \dfrac{4(s-1)}{s}\) porque \(T = \dfrac{4}{s+4}\) es estable. **Diagnóstico:** una perturbación a la entrada de la planta llega a la salida con el polo en \(+1\): la salida crece sin límite. El lazo es **internamente inestable** aunque \(T\) se vea bien.

**3. Entiende**

- \(C = 2(s+2)\) tiene más ceros que polos: es un derivador puro, no se puede construir sin filtrar y amplifica el ruido sin límite.
- Las cancelaciones de polos inestables nunca son exactas en la realidad y, aunque lo fueran, dejan una función de transferencia interna inestable.

**4. Cierra**

Escribe las dos reglas en tu formulario con un ejemplo de cada una.

#### Ejercicios del tema

1. Para \(G(s) = \dfrac{5}{(s+1)(s+5)}\), halla \(C\) que dé \(T(s) = \dfrac{25}{s^2 + 8s + 25}\).

   <details><summary>Solución</summary>

   \(1 - T = \dfrac{s(s+8)}{s^2+8s+25}\). \(C = \dfrac{25}{s(s+8)}\cdot\dfrac{(s+1)(s+5)}{5} = \dfrac{5(s+1)(s+5)}{s(s+8)}\): un PID con filtro que cancela los dos polos estables de la planta. Es propio (grados 2 y 2).

   </details>

2. ¿Puedes pedir \(T = \dfrac{1}{s+1}\) para \(G = \dfrac{1}{s(s+3)}\)?

   <details><summary>Solución</summary>

   No: \(T\) tiene grado relativo 1 y \(G\) grado relativo 2; el controlador saldría \(C = (s+3)\), impropio.

   </details>

**Hito del tema:**

- [ ] Despejé \(C = 8(s+2)/(s+4)\) y comprobé que reproduce \(T\).
- [ ] Simulé el lazo y encontré el polo cancelado.
- [ ] Identifiqué un controlador impropio y uno internamente inestable.
- [ ] Escribí las dos reglas de implementabilidad.

**Fuentes oficiales:** [SymPy: simplificación](https://docs.sympy.org/latest/tutorials/intro-tutorial/simplification.html) y [feedback, python-control](https://python-control.readthedocs.io/en/latest/generated/control.feedback.html).

### Tema 2: Ubicación de polos con la ecuación diofántica · Avanzado · 40 min

**¿Por qué es importante?** La igualación de modelos cancela la planta. La ecuación diofántica ubica **todos** los polos del lazo cerrado sin cancelar nada, solo con la función de transferencia (sin estados ni observador). **Modelo mental:** es la versión en polinomios del módulo 25: el controlador de orden \(n - 1\) da justo las incógnitas necesarias.

**Proyecto integrador:** para \(G(s) = \dfrac{B(s)}{A(s)} = \dfrac{1}{(s+1)(s+2)}\), ubica los polos en \(-3 \pm 4j\) y \(-10\). **Límite:** \(A\) y \(B\) deben ser coprimos (sin raíces comunes).

#### Subtema 2.1: Plantea la ecuación · 10 min

**1. Contexto**

Con \(C(s) = \dfrac{Q(s)}{P(s)}\) en realimentación unitaria, el polinomio característico es

\[A(s)P(s) + B(s)Q(s) = D(s)\]

Si la planta es de orden \(n\), un controlador propio de orden \(n - 1\) tiene \(2n - 1\) coeficientes libres y \(D\) es de grado \(2n - 1\): hay tantas ecuaciones como incógnitas. Para \(n = 2\): \(C = \dfrac{q_1 s + q_0}{s + p_0}\) y \(D = (s^2 + 6s + 25)(s + 10)\).

**2. Hazlo tú**

Guarda en `diofantica.py`:

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

**Resultado esperado:** `D(s) = s**3 + 16*s**2 + 85*s + 250` y `A P + B Q = 2*p0 + q0 + s**3 + s**2*(p0 + 3) + s*(3*p0 + q1 + 2)`.

**Fallo deliberado:** usa \(D\) de grado 2, `D = s**2 + 6*s + 25`. **Diagnóstico:** el lado izquierdo siempre tiene \(s^3\) (grado de \(A\) más grado de \(P\)); un \(D\) de grado 2 no se puede igualar. El grado de \(D\) es \(2n - 1 = 3\): el polo extra (\(-10\)) se elige más rápido que los dominantes.

**3. Entiende**

Igualando coeficientes:

\[s^2:\ 3 + p_0 = 16, \qquad s^1:\ 2 + 3p_0 + q_1 = 85, \qquad s^0:\ 2p_0 + q_0 = 250\]

Es un sistema **lineal** en \(p_0, q_1, q_0\); su matriz se llama matriz de Sylvester y es invertible si \(A\) y \(B\) son coprimos.

**4. Cierra**

Escribe las tres ecuaciones a mano antes de resolverlas.

#### Subtema 2.2: Resuelve y verifica · 15 min

**1. Contexto**

El sistema lineal se resuelve con `sp.solve` o con NumPy. Después se cierra el lazo para comprobar los polos y el error.

**2. Hazlo tú**

Añade a `diofantica.py`:

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

**Resultado esperado:** `solucion: {p0: 13, q0: 224, q1: 44}`, `polos: [(-10+0j), (-3+4j), (-3-4j)]` y `T(0) = 0.896`.

**Fallo deliberado:** elige \(D\) con un polo en \(-1\), por ejemplo \((s^2 + 6s + 25)(s + 1)\). **Diagnóstico:** el controlador sale con un cero en \(-1\) que cancela el polo de la planta; es válido, pero el modo lento \(e^{-t}\) queda oculto en el lazo. Elige el polo extra más rápido que los dominantes (de 2 a 5 veces su parte real).

**3. Entiende**

\[C(s) = \frac{44s + 224}{s + 13}, \qquad T(s) = \frac{44s + 224}{s^3 + 16s^2 + 85s + 250}\]

Los polos son los pedidos, pero \(T(0) = 224/250 = 0{,}896\): la planta es tipo 0 y el controlador no tiene integrador, así que queda un error del 10,4 % ante escalón. Además, el cero de \(Q\) en \(-5{,}09\) aumenta el sobrepico (módulo 13).

**4. Cierra**

Registra \(C(s)\), los polos y el error estacionario.

#### Subtema 2.3: Agrega un integrador · 15 min

**1. Contexto**

Para error cero ante escalón se impone \(P(s) = s\,(s + p_0)\). Ahora \(C = \dfrac{q_2 s^2 + q_1 s + q_0}{s(s + p_0)}\) tiene cuatro incógnitas y \(D\) debe ser de grado 4: se agrega otro polo en \(-10\).

**2. Hazlo tú**

Guarda en `diofantica_integral.py`:

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

**Resultado esperado:** `solucion: {p0: 23, q0: 2500, q1: 1054, q2: 174}`, y `T(0) = 1.0` tanto con la planta nominal como con la planta 20 % más ganadora.

**Fallo deliberado:** quita el integrador (\(P = s + p_0\)) y repite la prueba con ganancia 1,2. **Resultado observado:** \(T(0)\) pasa de 0,896 a 0,912. **Diagnóstico:** sin integrador el error depende de los parámetros de la planta; con integrador es cero mientras el lazo sea estable.

**3. Entiende**

\[C(s) = \frac{174s^2 + 1054s + 2500}{s(s + 23)}\]

Es un PID con filtro: \(P\) contiene el integrador y \(Q\) da las acciones proporcional y derivativa. El método algebraico entrega el PID que ubica exactamente los cuatro polos.

**4. Cierra**

Compara este \(C(s)\) con un PID de Ziegler-Nichols (módulo 18): aquí los polos se eligieron, allá se aceptan los que resulten.

#### Ejercicios del tema

1. Para \(G = \dfrac{2}{(s+1)(s+3)}\), con \(C = \dfrac{q_1 s + q_0}{s + p_0}\), ubica los polos en las raíces de \((s^2 + 6s + 18)(s + 10)\).

   <details><summary>Solución</summary>

   \(D = s^3 + 16s^2 + 78s + 180\). \(s^2\): \(4 + p_0 = 16 \Rightarrow p_0 = 12\). \(s^1\): \(3 + 4p_0 + 2q_1 = 78 \Rightarrow q_1 = 13{,}5\). \(s^0\): \(3p_0 + 2q_0 = 180 \Rightarrow q_0 = 72\). \(C = \dfrac{13{,}5s + 72}{s + 12}\), \(T(0) = 144/180 = 0{,}8\).

   </details>

2. ¿Qué pasa si \(A\) y \(B\) tienen una raíz común, por ejemplo \(G = \dfrac{s+1}{(s+1)(s+2)}\) sin simplificar?

   <details><summary>Solución</summary>

   La matriz de Sylvester es singular: el polo en \(-1\) aparece en todo \(AP + BQ\), así que \(D\) debe contener \((s+1)\). Ese polo no se puede mover (es el modo no controlable u observable del módulo 25).

   </details>

**Hito del tema:**

- [ ] Planteé \(AP + BQ = D\) con los grados correctos.
- [ ] Obtuve \(C = (44s + 224)/(s + 13)\) y verifiqué los polos.
- [ ] Agregué un integrador y comprobé \(T(0) = 1\) con la planta modificada.
- [ ] Diagnostiqué el grado incorrecto de \(D\).

**Fuentes oficiales:** [SymPy: Poly y solve](https://docs.sympy.org/latest/modules/polys/reference.html) y [feedback y dcgain, python-control](https://python-control.readthedocs.io/en/latest/generated/control.dcgain.html).

### Tema 3: Compensador de dos parámetros · Avanzado · 30 min

**¿Por qué es importante?** Con realimentación unitaria, el mismo \(Q\) que ubica los polos pone ceros en \(T\) que aumentan el sobrepico. El compensador de dos parámetros separa las tareas: \(Q/P\) estabiliza y rechaza perturbaciones; \(M/P\) da forma a la respuesta a la referencia. **Modelo mental:** el lazo se diseña para las perturbaciones y la prealimentación para la referencia.

**Proyecto integrador:** con la planta y el controlador del Tema 2, consigue \(T = \dfrac{25}{s^2 + 6s + 25}\) exactamente. **Límite:** \(M\) no mueve polos: los polos del lazo siguen siendo las raíces de \(D\).

#### Subtema 3.1: Escribe la estructura · 10 min

**1. Contexto**

\[u = \frac{M(s)}{P(s)}\,r - \frac{Q(s)}{P(s)}\,y \quad\Longrightarrow\quad T(s) = \frac{B(s)\,M(s)}{A(s)P(s) + B(s)Q(s)} = \frac{B\,M}{D}\]

En realimentación unitaria \(M = Q\). Con dos parámetros \(M\) es libre.

**2. Hazlo tú**

Guarda en `dos_parametros.py`:

```python
# dos_parametros.py
import control as ct

D = [1, 16, 85, 250]                     # (s^2+6s+25)(s+10)
T_un_parametro = ct.tf([44, 224], D)     # M = Q
info = ct.step_info(T_un_parametro)
print("un parametro: Mp =", round(info["Overshoot"], 1), "% T(0) =", round(float(ct.dcgain(T_un_parametro)), 3))
```

**Resultado esperado:** `un parametro: Mp = 16.0 % T(0) = 0.896`.

**Fallo deliberado:** compara con \(M_p\) del segundo orden puro (9,5 %) y concluye que \(\zeta\) está mal. **Diagnóstico:** los polos dominantes sí tienen \(\zeta = 0{,}6\); el sobrepico extra lo pone el cero de \(Q\) en \(-5{,}09\), cerca de los polos dominantes.

**3. Entiende**

El cero de \(T\) es el cero del controlador. Con un parámetro no se puede quitar sin mover los polos.

**4. Cierra**

Anota \(M_p\) y \(T(0)\) del diseño de un parámetro.

#### Subtema 3.2: Elige M para cancelar el polo extra · 10 min

**1. Contexto**

Si \(M(s) = k\,(s + 10)\), el factor \((s + 10)\) de \(D\) se cancela en \(T\) (es estable y conocido, porque lo elegiste) y \(k\) fija \(T(0) = 1\).

**2. Hazlo tú**

Añade a `dos_parametros.py`:

```python
T_dos_parametros = ct.tf([25, 250], D)   # M = 25 (s + 10), B = 1
info = ct.step_info(T_dos_parametros)
print("dos parametros: Mp =", round(info["Overshoot"], 1), "% T(0) =", round(float(ct.dcgain(T_dos_parametros)), 3))
print("T simplificada:", ct.minreal(T_dos_parametros, verbose=False))
```

**Resultado esperado:** `dos parametros: Mp = 9.5 % T(0) = 1.0` y la función `25/(s^2 + 6 s + 25)`.

**Fallo deliberado:** usa \(M = 25\) constante. **Diagnóstico:** \(T = 25/D\) da \(T(0) = 0{,}1\); con \(M\) constante habría que usar \(M = 250\) y quedaría un polo extra en \(-10\) (\(M_p\) de 8 %, más lento). Cancelar el factor de \(D\) que tú elegiste reproduce exactamente el segundo orden.

**3. Entiende**

\[T(s) = \frac{1\cdot25(s+10)}{(s^2 + 6s + 25)(s + 10)} = \frac{25}{s^2 + 6s + 25}\]

![Respuesta al escalón con compensador de uno y de dos parámetros](content/figures/control-1/dos-grados-libertad.svg)

*Los tres diseños tienen los polos dominantes en \(-3 \pm 4j\) y los demás en \(-10\); lo que cambia son los ceros de \(T\) (el diseño con integrador se completa en el Subtema 3.3).*

Esta cancelación sí es legítima: \(-10\) es un polo del lazo que tú elegiste, estable y exacto en el controlador. Es la versión en polinomios de \(\bar N\) del módulo 25, pero sin depender de un modelo exacto para los polos.

**4. Cierra**

Registra \(M(s)\) y el nuevo \(M_p\).

#### Subtema 3.3: Combina integrador y dos parámetros · 10 min

**1. Contexto**

El diseño del Subtema 2.3 tiene error cero robusto, pero su \(Q\) de segundo grado agrega dos ceros a \(T\). Con dos parámetros los quitas.

**2. Hazlo tú**

Añade a `dos_parametros.py`:

```python
import numpy as np

D4 = [1, 26, 245, 1100, 2500]            # (s^2+6s+25)(s+10)^2
T_integral_1p = ct.tf([174, 1054, 2500], D4)
T_integral_2p = ct.tf(np.polymul([25], [1, 20, 100]), D4)   # M = 25 (s+10)^2
for nombre, T in (("integral, un parametro", T_integral_1p), ("integral, dos parametros", T_integral_2p)):
    info = ct.step_info(T)
    print(nombre, ": Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 2), "s")
```

**Resultado esperado:** `integral, un parametro : Mp = 31.4 % ts = 1.37 s` e `integral, dos parametros : Mp = 9.5 % ts = 1.2 s`.

**Fallo deliberado:** aplica \(M = 25(s+10)^2\) a un lazo sin integrador. **Diagnóstico:** el seguimiento de la referencia queda bien con el modelo nominal, pero una perturbación constante deja error; el integrador va en \(P\) (el lazo), no en \(M\).

**3. Entiende**

El integrador en el lazo garantiza error cero ante escalón y rechazo de perturbaciones constantes; \(M\) quita los ceros que el integrador obligó a poner. Con un parámetro el sobrepico es 31 %; con dos, 9,5 %, con los mismos polos.

**4. Cierra**

Escribe el controlador completo: \(u = \dfrac{25(s+10)^2}{s(s+23)}\,r - \dfrac{174s^2 + 1054s + 2500}{s(s+23)}\,y\).

#### Ejercicios del tema

1. Para el ejercicio 1 del Tema 2 (\(G = \dfrac{2}{(s+1)(s+3)}\), \(D = (s^2 + 6s + 18)(s + 10)\)), elige \(M\) para que \(T = \dfrac{18}{s^2 + 6s + 18}\).

   <details><summary>Solución</summary>

   \(T = \dfrac{2M}{D}\). Con \(M = 9(s+10)\): \(T = \dfrac{18(s+10)}{(s^2+6s+18)(s+10)} = \dfrac{18}{s^2+6s+18}\), \(T(0) = 1\) y \(M_p = 4{,}3\,\%\) (\(\zeta = 0{,}707\)).

   </details>

2. ¿Por qué \(M\) no puede cancelar las raíces de \(s^2 + 6s + 25\)?

   <details><summary>Solución</summary>

   Sí podría cancelarlas en \(T\), pero entonces la respuesta a la referencia quedaría dominada por los polos en \(-10\) y el diseño de los polos dominantes no se vería en la salida. Además, los polos dominantes siguen en el lazo y siguen determinando el rechazo de perturbaciones.

   </details>

**Hito del tema:**

- [ ] Escribí \(T = BM/D\) y medí el sobrepico con \(M = Q\).
- [ ] Elegí \(M = 25(s+10)\) y obtuve exactamente el segundo orden.
- [ ] Combiné integrador y dos parámetros: \(M_p\) de 31 % a 9,5 %.
- [ ] Diagnostiqué por qué el integrador va en el lazo y no en \(M\).

**Fuentes oficiales:** [minreal y step_info, python-control](https://python-control.readthedocs.io/en/latest/generated/control.step_info.html) y [Feedback Systems (Åström y Murray)](https://fbswiki.org/wiki/index.php/PID_Control).
