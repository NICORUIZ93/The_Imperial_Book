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

**¿Por qué es importante?** Si un estado no se puede mover con la entrada, ningún controlador lo va a corregir: diseñar \(K\) sería pedir lo imposible. **Modelo mental:** la entrada empuja a \(x\) en la dirección \(B\); la dinámica la gira hacia \(AB\), \(A^2B\)…; si esas direcciones cubren todo el espacio, puedes llegar a cualquier estado.

**Proyecto integrador:** comprueba que la planta del módulo es controlable y encuentra un caso que no lo sea. **Límite:** la prueba del rango dice sí o no; no dice cuánto esfuerzo de control cuesta.

#### Subtema 1.1: Arma la matriz de controlabilidad · 10 min

**1. Contexto**

Para un sistema de orden \(n\):

\[\mathcal{C} = \begin{bmatrix} B & AB & A^2B & \cdots & A^{n-1}B \end{bmatrix}\]

El sistema es **completamente controlable** si y solo si \(\operatorname{rango}\mathcal{C} = n\).

**2. Hazlo tú**

Guarda en `academia-labs/control-1/controlabilidad.py`:

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

**Resultado esperado:** `C = [[0.0, 1.0], [1.0, -3.0]]`, `rango = 2 de 2` y `det = -1.0`.

**Fallo deliberado:** escribe `B = np.array([0, 1])` (un vector plano). **Diagnóstico:** python-control lo acepta, pero en tus cuentas a mano \(AB\) debe ser una columna; trabaja siempre con \(B\) de forma \(n\times1\) para no confundir filas y columnas.

**3. Entiende**

\(AB = \begin{bmatrix}0&1\\-2&-3\end{bmatrix}\begin{bmatrix}0\\1\end{bmatrix} = \begin{bmatrix}1\\-3\end{bmatrix}\). Las columnas \(B\) y \(AB\) no son paralelas (\(\det\mathcal C = -1 \ne 0\)): la entrada llega a los dos estados, a \(x_2\) directamente y a \(x_1\) a través de \(\dot x_1 = x_2\).

**4. Cierra**

Anota \(\mathcal C\) calculada a mano y compárala con la salida.

#### Subtema 1.2: Reconoce un sistema no controlable · 10 min

**1. Contexto**

Dos tanques independientes, con la bomba conectada solo al primero: el segundo evoluciona solo.

**2. Hazlo tú**

Añade a `controlabilidad.py`:

```python
A2 = np.diag([-1, -2])
B2 = np.array([[1], [0]])
Wc2 = ct.ctrb(A2, B2)
print("C2 =", Wc2.tolist(), "rango =", np.linalg.matrix_rank(Wc2))
```

**Resultado esperado:** `C2 = [[1.0, -1.0], [0.0, 0.0]] rango = 1`.

**Fallo deliberado:** decide con `np.linalg.det(Wc2) == 0`. **Diagnóstico:** aquí funciona, pero con números calculados el determinante casi nunca es cero exacto (puede salir `1e-17`). Usa `matrix_rank`, que aplica una tolerancia, y para sistemas de orden \(n > 1\) con una entrada recuerda que \(\mathcal C\) es cuadrada.

**3. Entiende**

Con \(A\) diagonal, \(\dot x_2 = -2x_2\) no tiene término en \(u\). La fila de ceros de \(\mathcal C\) lo dice: ninguna combinación de \(B, AB\) tiene componente en \(x_2\). El modo \(e^{-2t}\) no se puede mover; como es estable, el sistema es al menos **estabilizable**, pero ese polo en \(-2\) no lo cambia ningún \(K\).

**4. Cierra**

Escribe la diferencia entre «no controlable» y «no estabilizable» (un modo no controlable inestable).

#### Subtema 1.3: La controlabilidad depende de la realización · 10 min

**1. Contexto**

Una misma \(G(s)\) tiene muchas realizaciones. Si \(G\) tiene una cancelación polo-cero, alguna realización pierde controlabilidad u observabilidad.

**2. Hazlo tú**

Añade a `controlabilidad.py`:

```python
# G(s) = (s+1)/((s+1)(s+2)) en forma canónica observable
Ao = A.T
Bo = np.array([[1], [1]])
Co = np.array([[0, 1]])
print("rango C =", np.linalg.matrix_rank(ct.ctrb(Ao, Bo)))
print(ct.ss2tf(ct.ss(Ao, Bo, Co, 0)))
```

**Resultado esperado:** `rango C = 1` y la función `(s + 1)/(s^2 + 3 s + 2)`.

**Fallo deliberado:** concluye que la planta \(1/(s+2)\) «es» no controlable. **Diagnóstico:** la controlabilidad es una propiedad de la **realización** \((A, B)\), no de \(G(s)\). La realización mínima de \(1/(s+2)\), de orden 1, sí es controlable.

**3. Entiende**

El numerador \(s+1\) cancela el polo en \(-1\). En la forma canónica observable ese modo queda desconectado de la entrada; en la forma canónica controlable quedaría desconectado de la salida (Tema 2). **Una realización es mínima si y solo si es controlable y observable.**

**4. Cierra**

Anota la regla: cancelación polo-cero en \(G(s)\) ⇒ la realización de orden completo no es mínima.

#### Ejercicios del tema

1. ¿Para qué valores de \(a\) es controlable \(A = \begin{bmatrix}0&1\\-6&-5\end{bmatrix}\), \(B = \begin{bmatrix}1\\a\end{bmatrix}\)?

   <details><summary>Solución</summary>

   \(AB = \begin{bmatrix}a\\-6-5a\end{bmatrix}\), \(\det\mathcal C = -6 - 5a - a^2 = -(a+2)(a+3)\). Controlable si \(a \ne -2\) y \(a \ne -3\). Los valores coinciden con los polos \(-2\) y \(-3\): ahí \(B\) queda alineado con un vector propio y solo excita un modo.

   </details>

2. Un sistema de orden 3 tiene \(\operatorname{rango}\mathcal C = 2\). ¿Cuántos polos puedes reubicar con \(u = -Kx\)?

   <details><summary>Solución</summary>

   Dos. El tercer polo (el modo no controlable) queda donde está para cualquier \(K\).

   </details>

**Hito del tema:**

- [ ] Calculé \(\mathcal C\) a mano y con `ct.ctrb` y decidí con el rango.
- [ ] Identifiqué el estado que no recibe la entrada en un sistema no controlable.
- [ ] Mostré que la controlabilidad depende de la realización.
- [ ] Expliqué la relación entre cancelación polo-cero y realización mínima.

**Fuentes oficiales:** [ctrb, python-control](https://python-control.readthedocs.io/en/latest/generated/control.ctrb.html) y [Diseño en espacio de estados, Feedback Systems (Åström y Murray)](https://fbswiki.org/wiki/index.php/State_Feedback).

### Tema 2: Observabilidad · Intermedio · 30 min

**¿Por qué es importante?** La realimentación de estados necesita \(x\), pero normalmente solo se mide \(y\). Si el sistema es observable, \(x\) se puede reconstruir a partir de \(y\) y \(u\) (módulo 26). **Modelo mental:** cada derivada de la salida (\(y, \dot y, \ddot y\)…) es una «foto» del estado desde otro ángulo; si las fotos cubren todo, ves el estado completo.

**Proyecto integrador:** comprueba que la planta es observable con \(C = [1\ 0]\) y encuentra una salida que la vuelva no observable. **Límite:** como la controlabilidad, es una prueba de sí o no.

#### Subtema 2.1: Arma la matriz de observabilidad · 10 min

**1. Contexto**

\[\mathcal{O} = \begin{bmatrix} C \\ CA \\ \vdots \\ CA^{n-1} \end{bmatrix}, \qquad \text{observable} \iff \operatorname{rango}\mathcal O = n\]

**2. Hazlo tú**

Guarda en `observabilidad.py`:

```python
# observabilidad.py
import numpy as np
import control as ct

A = np.array([[0, 1], [-2, -3]])
C = np.array([[1, 0]])
Wo = ct.obsv(A, C)
print("O =", Wo.tolist(), "rango =", np.linalg.matrix_rank(Wo))
```

**Resultado esperado:** `O = [[1.0, 0.0], [0.0, 1.0]] rango = 2`.

**Fallo deliberado:** arma la matriz como `np.hstack([C, C @ A])`. **Diagnóstico:** obtienes una fila de 4 elementos y rango 1. \(\mathcal O\) apila **filas** (\(C\) arriba de \(CA\)); \(\mathcal C\) junta **columnas**.

**3. Entiende**

\(y = x_1\) y \(\dot y = x_2\): con la salida y su derivada conoces los dos estados. Por eso \(\mathcal O = I\).

**4. Cierra**

Anota la razón física: medir la posición basta para conocer la velocidad (derivándola).

#### Subtema 2.2: Reconoce un sistema no observable · 10 min

**1. Contexto**

Con los dos tanques independientes, si el sensor está en el segundo, el primero no se ve.

**2. Hazlo tú**

Añade a `observabilidad.py`:

```python
A2 = np.diag([-1, -2])
C2 = np.array([[0, 1]])
print("O2 =", ct.obsv(A2, C2).tolist(), "rango =", np.linalg.matrix_rank(ct.obsv(A2, C2)))
```

**Resultado esperado:** `O2 = [[0.0, 1.0], [0.0, -2.0]] rango = 1`.

**Fallo deliberado:** intenta reconstruir \(x_1\) derivando \(y\) más veces. **Diagnóstico:** todas las derivadas de \(y = x_2\) dependen solo de \(x_2\) (\(\dot y = -2x_2\)…); la columna de ceros de \(\mathcal O\) indica que ninguna combinación de salidas ve a \(x_1\).

**3. Entiende**

Un modo no observable no aparece en \(y\). Si es inestable, crece sin que el sensor lo note: el sistema no es **detectable** y ningún observador lo estima.

**4. Cierra**

Escribe un ejemplo físico propio de modo no observable.

#### Subtema 2.3: Cancelación y dualidad · 10 min

**1. Contexto**

La misma \(G(s) = \dfrac{s+1}{(s+1)(s+2)}\) en forma canónica **controlable** pierde la observabilidad.

**2. Hazlo tú**

Añade a `observabilidad.py`:

```python
B = np.array([[0], [1]])
Cz = np.array([[1, 1]])                  # numerador s + 1
print("rango O =", np.linalg.matrix_rank(ct.obsv(A, Cz)))
print("rango C de la dual =", np.linalg.matrix_rank(ct.ctrb(A.T, Cz.T)))
```

**Resultado esperado:** `rango O = 1` y `rango C de la dual = 1`.

**Fallo deliberado:** verifica la observabilidad con `ct.ctrb(A, Cz)`. **Diagnóstico:** `ctrb` espera una matriz \(n\times m\) de entradas; con \(C\) de \(1\times n\) obtienes `ControlDimension: state-space matrix B has the wrong number of rows`. La dualidad se escribe con transpuestas: \((A, C)\) observable \(\iff\) \((A^T, C^T)\) controlable.

**3. Entiende**

\[\mathcal O = \begin{bmatrix}1 & 1\\ -2 & -2\end{bmatrix}\]

Las filas son proporcionales: el modo \(e^{-t}\) queda invisible porque el cero en \(-1\) lo cancela. Con la dualidad, todo lo que sabes de controlabilidad vale para observabilidad cambiando \(A \to A^T\), \(B \to C^T\).

**4. Cierra**

Completa la tabla: forma canónica controlable ⇒ siempre controlable; forma canónica observable ⇒ siempre observable; con cancelación, pierde la otra propiedad.

#### Ejercicios del tema

1. ¿Es observable \(A = \begin{bmatrix}0&1\\0&-4\end{bmatrix}\) con \(C = [0\ 1]\) (solo se mide la velocidad)?

   <details><summary>Solución</summary>

   \(CA = [0\ \ {-4}]\). \(\mathcal O = \begin{bmatrix}0&1\\0&-4\end{bmatrix}\), rango 1: no. Midiendo solo la velocidad no se recupera la posición (falta la constante de integración).

   </details>

2. Con \(C = [1\ 0]\) en el mismo \(A\), ¿es observable?

   <details><summary>Solución</summary>

   \(\mathcal O = \begin{bmatrix}1&0\\0&1\end{bmatrix}\), rango 2: sí. Midiendo la posición se obtiene la velocidad derivando.

   </details>

**Hito del tema:**

- [ ] Calculé \(\mathcal O\) a mano y con `ct.obsv`.
- [ ] Identifiqué el modo invisible en un sistema no observable.
- [ ] Diagnostiqué el error de apilar columnas en vez de filas.
- [ ] Usé la dualidad para verificar observabilidad con `ctrb`.

**Fuentes oficiales:** [obsv, python-control](https://python-control.readthedocs.io/en/latest/generated/control.obsv.html) y [Diseño en espacio de estados, Feedback Systems (Åström y Murray)](https://fbswiki.org/wiki/index.php/State_Feedback).

### Tema 3: Ubicación de polos por realimentación de estados · Avanzado · 40 min

**¿Por qué es importante?** Con un PID mueves los polos a lo largo del lugar de las raíces. Con \(u = -Kx + \bar N r\) y un sistema controlable, los pones exactamente donde quieras. **Modelo mental:** cada ganancia de \(K\) cambia un coeficiente del polinomio característico.

**Proyecto integrador:** lleva los polos de la planta (en \(-1\) y \(-2\)) a \(-3 \pm 4j\) (\(\zeta = 0{,}6\), \(\omega_n = 5\)) y deja error cero ante escalón. **Límite:** necesitas medir o estimar los dos estados; el módulo 26 resuelve la estimación.

#### Subtema 3.1: Iguala coeficientes · 15 min

**1. Contexto**

Con \(u = -Kx\), \(\dot x = (A - BK)x\). Los polos del lazo cerrado son los valores propios de \(A - BK\). El polinomio deseado es \((s+3)^2 + 16 = s^2 + 6s + 25\).

**2. Hazlo tú**

Guarda en `ubicacion.py`:

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

**Resultado esperado:** `det(sI - A + BK) = k1 + k2*s + s**2 + 3*s + 2` y `K = {k1: 23, k2: 3}`.

**Fallo deliberado:** escribe `A + B * K`. **Resultado observado:** `K = {k1: -23, k2: -3}`. **Diagnóstico:** con \(u = -Kx\) la matriz del lazo cerrado es \(A - BK\); el signo cambia todas las ganancias.

**3. Entiende**

\[A - BK = \begin{bmatrix}0 & 1\\ -2-k_1 & -3-k_2\end{bmatrix} \Rightarrow s^2 + (3 + k_2)s + (2 + k_1)\]

Igualando con \(s^2 + 6s + 25\): \(k_2 = 3\), \(k_1 = 23\). En forma canónica controlable cada ganancia ajusta un coeficiente: por eso esta forma hace el cálculo inmediato.

**4. Cierra**

Escribe \(K = [23\ \ 3]\) y la regla: en forma canónica controlable, \(k_i = \) coeficiente deseado \(-\) coeficiente original.

#### Subtema 3.2: Usa Ackermann y python-control · 10 min

**1. Contexto**

Para órdenes mayores, igualar coeficientes a mano es largo. La fórmula de Ackermann da \(K\) directamente:

\[K = \begin{bmatrix}0 & \cdots & 0 & 1\end{bmatrix}\mathcal{C}^{-1}\,\phi(A), \qquad \phi(A) = A^2 + 6A + 25I\]

**2. Hazlo tú**

Añade a `ubicacion.py`:

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

**Resultado esperado:** `Ackermann a mano: [[23.0, 3.0]]`, `ct.place: [[23.0, 3.0]]` y `polos: [-3.+4.j -3.-4.j]`.

**Fallo deliberado:** pide `ct.place(An, Bn, [-5, -5])`. **Resultado observado:** `ValueError: at least one of the requested pole is repeated more than rank(B) times`. **Diagnóstico:** `place` usa un algoritmo que no admite polos repetidos con una sola entrada. Usa `ct.acker(An, Bn, [-5, -5])`, que sí los acepta (para órdenes bajos).

**3. Entiende**

Ackermann exige \(\mathcal C^{-1}\): si el sistema no es controlable, \(\mathcal C\) no se invierte y no hay \(K\). Es la conexión directa entre el Tema 1 y el diseño.

**4. Cierra**

Comprueba que obtuviste el mismo \(K\) por tres caminos.

#### Subtema 3.3: Ajusta la ganancia de referencia · 15 min

**1. Contexto**

Con \(u = -Kx\) los polos son correctos, pero la salida no sigue la referencia: hace falta \(u = -Kx + \bar N r\) con \(\bar N\) elegido para ganancia estática 1.

**2. Hazlo tú**

Añade a `ubicacion.py`:

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

**Resultado esperado:** `N_bar = [[25.0]]`, `ganancia estatica = 1.0` y `Mp = 9.47 % ts = 1.21 s`.

**Fallo deliberado:** omite `N_bar` (usa `Bn` en lugar de `Bn * N_bar`). **Resultado observado:** ganancia estática 0,04. **Diagnóstico:** el lazo cerrado es \(\dfrac{1}{s^2+6s+25}\), que vale \(1/25\) en \(s = 0\); sin \(\bar N\) la salida se queda en 4 % de la referencia.

**3. Entiende**

\[T(s) = \frac{\bar N}{s^2 + 6s + 25}, \qquad T(0) = 1 \Rightarrow \bar N = 25\]

\(M_p = e^{-\pi\zeta/\sqrt{1-\zeta^2}} = e^{-0{,}75\pi} = 9{,}5\,\%\), como predice el módulo 12, y \(t_s \approx 4/\sigma = 1{,}33\) s (la simulación da 1,21 s). \(\bar N\) depende del modelo: si la planta cambia, aparece error. Para error cero robusto se agrega un integrador (ejercicio 2).

**4. Cierra**

Registra \(K\), \(\bar N\), \(M_p\) y \(t_s\). Tu controlador completo es \(u = 25r - 23x_1 - 3x_2\).

#### Ejercicios del tema

1. Para \(A = \begin{bmatrix}0&1\\0&-4\end{bmatrix}\), \(B = \begin{bmatrix}0\\1\end{bmatrix}\), \(C = [1\ 0]\) (un motor), halla \(K\) y \(\bar N\) para polos en \(-4 \pm 4j\).

   <details><summary>Solución</summary>

   \(\det(sI - A + BK) = s^2 + (4 + k_2)s + k_1\). Deseado: \(s^2 + 8s + 32\). \(K = [32\ \ 4]\), \(\bar N = 32\). Con python-control, `ct.acker(A, B, [-4+4j, -4-4j])` da `[32, 4]` y la respuesta tiene \(M_p = 4{,}3\,\%\) (\(\zeta = 0{,}707\)).

   </details>

2. ¿Cómo eliminarías el error estacionario sin depender de \(\bar N\)?

   <details><summary>Solución</summary>

   Agrega un estado integrador \(\dot x_I = r - y\) y ubica los polos del sistema aumentado de orden 3 con \(u = -Kx - k_I x_I\). El integrador garantiza error cero ante escalón aunque los parámetros cambien, como la acción I del módulo 18.

   </details>

**Hito del tema:**

- [ ] Calculé \(K = [23\ \ 3]\) igualando coeficientes.
- [ ] Obtuve el mismo \(K\) con Ackermann y con `ct.place`.
- [ ] Diagnostiqué el error de signo \(A + BK\) y el de polos repetidos en `place`.
- [ ] Ajusté \(\bar N = 25\) y verifiqué \(M_p = 9{,}47\,\%\).

**Fuentes oficiales:** [place y acker, python-control](https://python-control.readthedocs.io/en/latest/generated/control.place.html) y [Diseño en espacio de estados, Feedback Systems (Åström y Murray)](https://fbswiki.org/wiki/index.php/State_Feedback).
