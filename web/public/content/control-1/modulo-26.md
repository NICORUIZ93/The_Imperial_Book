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

**¿Por qué es importante?** Sin \(x\) no hay realimentación de estados. Derivar \(y\) para obtener \(\dot y = x_2\) amplifica el ruido; el observador lo evita. **Modelo mental:** el observador es una copia de la planta que se corrige con la diferencia entre la salida medida y la que predice.

**Proyecto integrador:** diseña \(L\) para que el error de estimación tenga polos en \(-10\) (doble), unas tres veces más rápidos que el controlador. **Límite:** el observador supone que conoces \(A\), \(B\) y \(C\); si el modelo está mal, la estimación tiene error permanente.

#### Subtema 1.1: Comprueba que copiar la planta no basta · 10 min

**1. Contexto**

La copia sin corrección \(\dot{\hat x} = A\hat x + Bu\) tiene error \(e = x - \hat x\) con \(\dot e = Ae\): el error se apaga solo con los polos de la planta (y si la planta es inestable, crece).

**2. Hazlo tú**

Guarda en `academia-labs/control-1/observador.py`:

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

**Resultado esperado:** `copia t=1: |e| = 0.759`, `copia t=2: |e| = 0.344` y `copia t=3: |e| = 0.136`.

**Fallo deliberado:** cambia `A` por una planta inestable, `[[0, 1], [2, -1]]`. **Resultado observado:** \(|e|\) pasa de 1 a 2,53 en \(t = 1\) s y a 18,94 en \(t = 3\) s. **Diagnóstico:** la copia hereda los polos de la planta (aquí uno en \(+1\)); sin corrección el error nunca se apaga.

**3. Entiende**

Tres segundos después, la copia todavía se equivoca en un 14 % del error inicial. Lo que falta es usar la medición: si \(y \ne C\hat x\), la estimación está mal y hay que corregirla.

**4. Cierra**

Anota cuánto tarda la copia en bajar el error a la mitad (entre 1 y 2 s).

#### Subtema 1.2: Calcula L igualando coeficientes · 15 min

**1. Contexto**

El observador de Luenberger agrega una corrección proporcional al error de salida:

\[\dot{\hat x} = A\hat x + Bu + L\,(y - C\hat x) \quad\Rightarrow\quad \dot e = (A - LC)\,e\]

Ahora los polos del error son los valores propios de \(A - LC\), y \(L\) los ubica.

**2. Hazlo tú**

Guarda en `observador_l.py`:

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

**Resultado esperado:** `det(sI - A + LC) = 3*l1 + l2 + s**2 + s*(l1 + 3) + 2` y `L = {l1: 17, l2: 47}`.

**Fallo deliberado:** escribe `A - C * L` (orden invertido). **Resultado observado:** `ShapeError`, porque \(C\) es \(1\times2\) y \(L\) es \(2\times1\): \(CL\) es un escalar \(1\times1\). **Diagnóstico:** el término es \(LC\), una matriz \(2\times2\) que se resta de \(A\).

**3. Entiende**

\[A - LC = \begin{bmatrix} -l_1 & 1 \\ -2 - l_2 & -3 \end{bmatrix} \Rightarrow s^2 + (3 + l_1)s + (3l_1 + l_2 + 2)\]

Con \((s+10)^2 = s^2 + 20s + 100\): \(l_1 = 17\) y \(l_2 = 100 - 51 - 2 = 47\). Igual que \(K\) necesitaba controlabilidad, \(L\) necesita observabilidad: si \(\mathcal O\) no tiene rango completo, algún coeficiente no depende de \(L\).

**4. Cierra**

Registra \(L = [17\ \ 47]^T\).

#### Subtema 1.3: Usa la dualidad con python-control · 10 min

**1. Contexto**

Los valores propios de \(A - LC\) son los de \((A - LC)^T = A^T - C^TL^T\): es un problema de ubicación de polos para el par \((A^T, C^T)\) con ganancia \(L^T\).

**2. Hazlo tú**

Añade al final de `observador.py`:

```python
L = np.reshape(ct.acker(A.T, C.T, [-10, -10]), (2, 1))
print("L =", L.ravel().tolist())
print("polos del error:", np.linalg.eigvals(A - L @ C).real.round(6).tolist())
print("L con place en -10 y -12:", ct.place(A.T, C.T, [-10, -12]).T.ravel().round(6).tolist())
```

**Resultado esperado:** `L = [17.0, 47.0]`, `polos del error: [-10.0, -10.0]` y `L con place en -10 y -12: [19.0, 61.0]`.

**Fallo deliberado:** escribe `ct.acker(A, C, [-10, -10])`. **Resultado observado:** `ControlDimension: state-space matrix B has the wrong number of rows`. **Diagnóstico:** python-control rechaza \(C\) como matriz de entrada. Para observadores transpón: `acker(A.T, C.T, ...)` y vuelve a transponer el resultado.

**3. Entiende**

Regla práctica: los polos del observador se ponen de 2 a 6 veces más rápidos que los del controlador. Aquí el controlador tiene \(\sigma = 3\) y el observador \(\sigma = 10\).

**4. Cierra**

Comprueba que obtuviste el mismo \(L\) a mano y con `acker`.

#### Ejercicios del tema

1. Para el motor \(A = \begin{bmatrix}0&1\\0&-4\end{bmatrix}\), \(C = [1\ 0]\), halla \(L\) con polos del error en \(-20\) (doble).

   <details><summary>Solución</summary>

   \(A - LC = \begin{bmatrix}-l_1 & 1\\ -l_2 & -4\end{bmatrix}\), polinomio \(s^2 + (4 + l_1)s + (4l_1 + l_2)\). Con \(s^2 + 40s + 400\): \(l_1 = 36\), \(l_2 = 400 - 144 = 256\). `ct.acker(A.T, C.T, [-20, -20])` da `[36, 256]`.

   </details>

2. ¿Se puede diseñar un observador para \(A = \operatorname{diag}(-1, -2)\) con \(C = [0\ 1]\)?

   <details><summary>Solución</summary>

   No con polos arbitrarios: el par no es observable (módulo 25). El polo en \(-1\) del error no depende de \(L\). Como es estable, el error de ese estado igual se apaga, pero a la velocidad de la planta (el sistema es detectable).

   </details>

**Hito del tema:**

- [ ] Mostré que la copia sin corrección converge con los polos de la planta.
- [ ] Calculé \(L = [17\ \ 47]^T\) igualando coeficientes.
- [ ] Obtuve el mismo \(L\) por dualidad con `acker`.
- [ ] Diagnostiqué el orden \(LC\) frente a \(CL\).

**Fuentes oficiales:** [acker y place, python-control](https://python-control.readthedocs.io/en/latest/generated/control.place_acker.html) y [Diseño de observadores, Feedback Systems (Åström y Murray)](https://fbswiki.org/wiki/index.php/State_Feedback).

### Tema 2: Elige la velocidad del observador · Avanzado · 30 min

**¿Por qué es importante?** Un observador rápido converge pronto pero amplifica el ruido del sensor; uno lento filtra el ruido pero entrega estimaciones viejas. **Modelo mental:** \(L\) grande significa «confío mucho en el sensor».

**Proyecto integrador:** compara un observador rápido (polos en \(-10\)) con uno lento (polos en \(-1\)). **Límite:** el ruido se modela aquí como una senoidal de alta frecuencia; un análisis completo usa el filtro de Kalman (fuera de este curso).

#### Subtema 2.1: Simula la convergencia · 10 min

**1. Contexto**

La planta parte de \(x(0) = [1\ \ 0]^T\) y el observador de \(\hat x(0) = 0\): no sabe dónde está la planta.

**2. Hazlo tú**

Guarda en `convergencia.py`:

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

**Resultado esperado:**

```text
rapido L = [17.0, 47.0] |e| en t=0.5: 0.166 en t=1: 0.002
lento L = [-1.0, 2.0] |e| en t=0.5: 1.716 en t=1: 1.839
```

**Fallo deliberado:** elige polos del observador más lentos que la planta, como el caso `lento`. **Resultado observado:** en \(t = 1\) s el error es mayor que el inicial y mayor que el de la copia sin corrección (0,759). **Diagnóstico:** un observador más lento que la planta es peor que no corregir; sus polos deben ser más rápidos que los de la planta y que los del controlador.

**3. Entiende**

![Estado x1 y su estimación con un observador rápido y uno lento](content/figures/control-1/observador-error.svg)

*Con polos en \(-10\) la estimación alcanza a \(x_1\) antes de 0,5 s; con polos en \(-1\) se aleja.*

Con polos en \(-10\) el error cae al 0,2 % en un segundo. Al principio la norma del error sube (pico de unos 1,8 cerca de \(t = 0{,}1\) s) porque la corrección grande sacude primero la estimación de la velocidad: es el precio de la rapidez.

**4. Cierra**

Anota \(|e|\) de los dos observadores en \(t = 1\) s.

#### Subtema 2.2: Mide cuánto ruido deja pasar · 10 min

**1. Contexto**

Si el sensor mide \(y + n\), el error cumple \(\dot e = (A - LC)e - Ln\). La función de transferencia de \(n\) al error de \(x_1\) dice cuánto ruido llega a la estimación.

**2. Hazlo tú**

Añade a `convergencia.py`:

```python
for nombre, polos in (("rapido", [-10, -10]), ("lento", [-1, -1])):
    L, _ = error_estimacion(polos)
    ruido_a_error = ct.ss(A - L @ C, -L, np.array([[1.0, 0]]), 0)
    print(nombre, "ganancia del ruido en w=100:", round(abs(ruido_a_error(100j)), 4))
```

**Resultado esperado:** `rapido ganancia del ruido en w=100: 0.1686` y `lento ganancia del ruido en w=100: 0.01`.

**Fallo deliberado:** compara las ganancias en \(\omega = 1\) rad/s. **Diagnóstico:** a baja frecuencia las dos dejan pasar casi todo (0,98 y 0,71) porque ahí el «ruido» se confunde con la señal. El ruido de un sensor suele ser de alta frecuencia: evalúalo donde está.

**3. Entiende**

El observador rápido deja pasar 17 veces más ruido de 100 rad/s. Por eso no se ponen los polos del observador arbitrariamente lejos: de 2 a 6 veces la velocidad del controlador es un compromiso entre convergencia y ruido.

**4. Cierra**

Escribe en una línea el compromiso que elegiste para tu planta.

#### Subtema 2.3: Compara con derivar la salida · 10 min

**1. Contexto**

La alternativa ingenua a un observador es \(\hat x_2 = \dot y\). Un derivador tiene ganancia \(\omega\): crece sin límite con la frecuencia.

**2. Hazlo tú**

Añade a `convergencia.py`:

```python
derivador = ct.tf([1, 0], [1])
L, _ = error_estimacion([-10, -10])
ruido_a_x2 = ct.ss(A - L @ C, -L, np.array([[0.0, 1]]), 0)
print("derivador en w=100:", abs(derivador(100j)))
print("observador (estado x2) en w=100:", round(abs(ruido_a_x2(100j)), 3))
```

**Resultado esperado:** `derivador en w=100: 100.0` y `observador (estado x2) en w=100: 0.465`.

**Fallo deliberado:** compara con la ganancia del observador para \(x_1\) (0,1686). **Diagnóstico:** la comparación justa es con el mismo estado que se quiere reconstruir, la velocidad \(x_2\).

**3. Entiende**

Derivar multiplica el ruido de 100 rad/s por 100; el observador, por menos de 0,5. El observador es un derivador «filtrado» que además usa el modelo y la entrada \(u\).

**4. Cierra**

Anota las dos ganancias y concluye cuál usarías con un encoder ruidoso.

#### Ejercicios del tema

1. ¿Qué pasa con la ganancia del ruido si llevas los polos del observador a \(-30\) (doble)?

   <details><summary>Solución</summary>

   \(L\) crece (\(l_1 = 57\), \(l_2 = 900 - 171 - 2 = 727\)) y la ganancia del ruido en alta frecuencia aumenta: el observador converge más rápido pero se vuelve más sensible al sensor.

   </details>

2. ¿Por qué el observador recibe \(u\) además de \(y\)?

   <details><summary>Solución</summary>

   Para que su predicción siga a la planta cuando cambia la entrada. Sin el término \(Bu\), cada cambio de \(u\) produciría un error de estimación que solo la corrección \(L\) podría eliminar.

   </details>

**Hito del tema:**

- [ ] Simulé la convergencia de un observador rápido y uno lento.
- [ ] Mostré que un observador más lento que la planta empeora la estimación.
- [ ] Medí la ganancia del ruido de alta frecuencia en los dos casos.
- [ ] Comparé el observador con un derivador puro.

**Fuentes oficiales:** [initial_response, python-control](https://python-control.readthedocs.io/en/latest/generated/control.initial_response.html) y [Diseño de observadores, Feedback Systems (Åström y Murray)](https://fbswiki.org/wiki/index.php/State_Feedback).

### Tema 3: Controlador con observador · Avanzado · 35 min

**¿Por qué es importante?** El controlador final usa \(u = -K\hat x + \bar N r\). Hay que saber si juntar controlador y observador conserva los polos que diseñaste por separado, y cómo se implementa el conjunto. **Modelo mental:** el principio de separación dice que puedes diseñar \(K\) y \(L\) por separado y sumar sus polos.

**Proyecto integrador:** une \(K = [23\ \ 3]\), \(L = [17\ \ 47]^T\) y \(\bar N = 25\). **Límite:** la separación vale con el modelo exacto; los márgenes del Subtema 3.2 dicen cuánto error de modelo tolera.

#### Subtema 3.1: Comprueba el principio de separación · 10 min

**1. Contexto**

Con \(u = -K\hat x\) y \(\hat x = x - e\), el sistema completo en coordenadas \((x, e)\) es triangular por bloques:

\[\begin{bmatrix}\dot x\\ \dot e\end{bmatrix} = \begin{bmatrix} A - BK & BK \\ 0 & A - LC \end{bmatrix}\begin{bmatrix}x\\ e\end{bmatrix}\]

**2. Hazlo tú**

Guarda en `separacion.py`:

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

**Resultado esperado:** `partes reales: [-10.0, -10.0, -3.0, -3.0]`, `partes imaginarias: [0.0, 0.0, -4.0, 4.0]` y `Mp = 9.5 % ts = 1.2 s`.

**Fallo deliberado:** en `B_cl` pon `np.vstack([B * N_bar, np.zeros((2, 1))])` (el observador no recibe \(u\)). **Diagnóstico:** el observador deja de saber qué entrada se aplicó; la referencia excita el error de estimación y la respuesta cambia: `ct.dcgain` pasa de 1 a 1,74 y la salida ya no sigue a \(r\).

**3. Entiende**

Los polos son la unión de los del controlador (\(-3 \pm 4j\)) y los del observador (\(-10, -10\)). Ante la referencia, la respuesta es la misma que con estados medidos (\(M_p \approx 9{,}5\,\%\)): los modos del observador no se excitan con \(r\) porque el observador recibe la misma \(u\) que la planta.

**4. Cierra**

Anota los cuatro polos y la respuesta.

#### Subtema 3.2: Obtén el compensador equivalente · 15 min

**1. Contexto**

De \(y\) a \(u\), el conjunto observador + \(K\) es una función de transferencia:

\[C(s) = K\,(sI - A + BK + LC)^{-1}L\]

Es un compensador dinámico que se puede implementar como cualquier otro y analizar con Bode.

**2. Hazlo tú**

Añade a `separacion.py`:

```python
compensador = ct.tf(ct.ss(A - B @ K - L @ C, L, K, 0))
print(compensador)
G = ct.tf(ct.ss(A, B, C, 0))
gm, pm, _, wc = ct.margin(compensador * G)
print("MF =", round(pm, 1), "MG =", round(20 * np.log10(gm), 1), "dB en wc =", round(wc, 2))
```

**Resultado esperado:** la función `(532 s + 2152)/(s^2 + 23 s + 174)` y `MF = 58.1 MG = 16.1 dB en wc = 3.69`.

**Fallo deliberado:** usa `ct.ss(A - L @ C, L, K, 0)` (sin \(-BK\)). **Resultado observado:** el denominador pasa a ser \(s^2 + 20s + 100\), el polinomio del observador. **Diagnóstico:** ese no es el compensador del lazo: el observador debe incluir el término \(Bu = -BK\hat x\) porque \(u\) sale de \(\hat x\).

**3. Entiende**

\[C(s) = \frac{532\,s + 2152}{s^2 + 23s + 174} = \frac{532\,(s + 4{,}05)}{(s + 11{,}5)^2 + 6{,}46^2}\]

Es un adelanto de segundo orden: cero en \(-4{,}05\) y polos complejos en \(-11{,}5 \pm 6{,}46j\). Lo que diseñaste en estados equivale a un compensador clásico con \(MF = 58^\circ\) y \(MG = 16\) dB: tolera bien errores de modelo.

**4. Cierra**

Registra \(C(s)\) y sus márgenes. Ahora puedes implementarlo con op-amps o en un microcontrolador.

#### Subtema 3.3: Prueba la robustez ante un error de modelo · 10 min

**1. Contexto**

Si la planta real tiene un coeficiente distinto, el observador ya no es exacto. Los márgenes predicen que el lazo aguanta; compruébalo.

**2. Hazlo tú**

Añade a `separacion.py`:

```python
A_real = np.array([[0.0, 1], [-2.5, -3]])  # rigidez 25 % mayor
A_cl_real = np.block([[A_real, -B @ K], [L @ C, A - B @ K - L @ C]])
T_real = ct.ss(A_cl_real, B_cl, C_cl, 0)
print("polos con error de modelo:", np.round(np.sort_complex(np.linalg.eigvals(A_cl_real)), 3).tolist())
print("ganancia estatica:", round(float(ct.dcgain(T_real)), 4))
```

**Resultado esperado:** `polos con error de modelo: [(-10.046-0.573j), (-10.046+0.573j), (-2.954-4.102j), (-2.954+4.102j)]` y `ganancia estatica: 0.9664`.

**Fallo deliberado:** espera ganancia estática 1. **Diagnóstico:** \(\bar N\) se calculó con el modelo nominal; con la planta real la salida no llega a la referencia. El remedio es el integrador del ejercicio 2 del módulo 25.

**3. Entiende**

La estabilidad se conserva (márgenes amplios), pero el seguimiento exacto no: la realimentación de estados con \(\bar N\) no es robusta en estado estacionario.

**4. Cierra**

Anota la ganancia estática (0,9664) y el error relativo: 3,4 % de error permanente.

#### Ejercicios del tema

1. Para el motor del ejercicio del Tema 1 (\(K = [32\ \ 4]\), \(L = [36\ \ 256]^T\)), ¿cuáles son los polos del sistema completo?

   <details><summary>Solución</summary>

   Por separación: \(-4 \pm 4j\) (controlador) y \(-20, -20\) (observador).

   </details>

2. ¿Por qué el compensador equivalente tiene orden 2 si el controlador \(K\) es una ganancia?

   <details><summary>Solución</summary>

   Porque el observador tiene dos estados. \(C(s)\) tiene el orden del observador; un observador de orden reducido (que solo estima lo que no se mide) daría un compensador de orden 1.

   </details>

**Hito del tema:**

- [ ] Comprobé que los polos del conjunto son la unión de los de \(K\) y \(L\).
- [ ] Obtuve el compensador equivalente y sus márgenes.
- [ ] Diagnostiqué el observador sin la entrada \(u\).
- [ ] Probé el efecto de un error de modelo en la estabilidad y en el error.

**Fuentes oficiales:** [ss y tf, python-control](https://python-control.readthedocs.io/en/latest/generated/control.ss.html) y [Diseño de observadores, Feedback Systems (Åström y Murray)](https://fbswiki.org/wiki/index.php/State_Feedback).
