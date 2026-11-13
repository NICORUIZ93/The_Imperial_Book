# Módulo 15: Estabilidad y criterio de Routh-Hurwitz

Para un polinomio de tercer orden o más, sacar las raíces a mano es difícil. Routh te dice cuántas raíces están en el semiplano derecho sin calcularlas, y qué rango de ganancias deja al sistema estable.

**Al terminar podrás:**

- Definir estabilidad BIBO y relacionarla con los polos.
- Armar el arreglo de Routh y contar raíces inestables.
- Resolver los dos casos especiales.
- Hallar el rango de \(K\) que hace estable un lazo y la frecuencia de oscilación en el límite.

## Aprende construyendo

### Tema 1: Qué es estabilidad

**¿Por qué es importante?** Un sistema inestable es inútil o peligroso; definir estabilidad con precisión es el punto de partida de todo diseño.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis) y [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

> **Idea clave.** Un sistema es estable (BIBO) si toda entrada acotada produce una salida acotada.

#### Demostración · estable ⇔ polos en el semiplano izquierdo

1. La respuesta al impulso \(g(t)\) es una suma de términos \(c\,t^ke^{pt}\), uno por cada polo \(p\) (capítulo 4).
2. Si \(\operatorname{Re}(p) < 0\), cada término tiende a cero y \(\int_0^\infty |g|\,dt\) es finita.
3. La salida es la convolución \(y(t) = \int g(\tau)u(t-\tau)d\tau\). Si \(|u|\le M\), entonces \(|y| \le M\int|g| < \infty\): salida acotada.
4. Si algún polo tiene \(\operatorname{Re}(p)\ge0\), \(g(t)\) no se apaga y existe una entrada acotada (por ejemplo, una senoidal a la frecuencia del polo) que hace crecer la salida sin límite.

∎

> **Condición necesaria rápida:** si el polinomio característico tiene algún coeficiente negativo o cero (y no todos son del mismo signo), el sistema no es estable. Con todos positivos todavía hay que verificar con Routh, salvo en primer y segundo orden, donde basta.

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · ¿Estable? \(G(s) = \frac{1}{\left(s + 1\right) \left(s + 3\right)}\) · *Básico*

**Enunciado.** Clasifica la estabilidad mirando los polos.

1. Polos: \(-3, -1\).

   **¿Por qué?** Cada polo \(p\) aporta un término \(e^{pt}\) a la respuesta natural.

**Resultado.** Es **estable**: todos los polos en el semiplano izquierdo, la respuesta natural se apaga.

#### Ejemplo 2 · ¿Estable? \(G(s) = \frac{1}{\left(s - 2\right) \left(s + 1\right)}\) · *Básico*

**Enunciado.** Clasifica la estabilidad mirando los polos.

1. Polos: \(-1, 2\).

   **¿Por qué?** Cada polo \(p\) aporta un término \(e^{pt}\) a la respuesta natural.

**Resultado.** Es **inestable**: hay un polo con parte real positiva, su exponencial crece sin límite.

#### Ejemplo 3 · ¿Estable? \(G(s) = \frac{1}{s \left(s + 2\right)}\) · *Básico*

**Enunciado.** Clasifica la estabilidad mirando los polos.

1. Polos: \(-2, 0\).

   **¿Por qué?** Cada polo \(p\) aporta un término \(e^{pt}\) a la respuesta natural.

**Resultado.** Es **marginalmente estable**: hay polos sobre el eje imaginario (sin repetir), la respuesta natural ni crece ni se apaga.

#### Ejemplo 4 · ¿Estable? \(G(s) = \frac{1}{s^{2} + 4}\) · *Básico*

**Enunciado.** Clasifica la estabilidad mirando los polos.

1. Polos: \(- 2 j, 2 j\).

   **¿Por qué?** Cada polo \(p\) aporta un término \(e^{pt}\) a la respuesta natural.

**Resultado.** Es **marginalmente estable**: hay polos sobre el eje imaginario (sin repetir), la respuesta natural ni crece ni se apaga.

#### Ejemplo 5 · ¿Estable? \(G(s) = \frac{1}{s^{2} + 2 s + 10}\) · *Básico*

**Enunciado.** Clasifica la estabilidad mirando los polos.

1. Polos: \(-1 - 3 j, -1 + 3 j\).

   **¿Por qué?** Cada polo \(p\) aporta un término \(e^{pt}\) a la respuesta natural.

**Resultado.** Es **estable**: todos los polos en el semiplano izquierdo, la respuesta natural se apaga.

#### Ejemplo 6 · ¿Estable? \(G(s) = \frac{1}{s^{2} - s + 4}\) · *Intermedio*

**Enunciado.** Clasifica la estabilidad mirando los polos.

1. Polos: \(\frac{1}{2} - \frac{\sqrt{15} j}{2}, \frac{1}{2} + \frac{\sqrt{15} j}{2}\).

   **¿Por qué?** Cada polo \(p\) aporta un término \(e^{pt}\) a la respuesta natural.

**Resultado.** Es **inestable**: hay un polo con parte real positiva, su exponencial crece sin límite.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1.

```python
# verificacion.py
from sympy import symbols, solve

s = symbols("s")
polos = solve((s + 1) * (s + 3), s)
print("polos:", polos)
print("estable:", all(p < 0 for p in polos))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `polos: [-3, -1]` y `estable: True`, igual al Ejemplo 1.

#### Practica

cambia el polinomio a `(s - 2) * (s + 1)` y confirma que `estable` da `False` (Ejemplo 2). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** este criterio de "mirar el signo de la parte real" solo funciona cuando ya conoces los polos; para polinomios de tercer orden o más, calcular las raíces a mano es difícil — por eso existe el criterio de Routh-Hurwitz (Tema 2), que decide la estabilidad sin resolver el polinomio.

### Tema 2: El arreglo de Routh

**¿Por qué es importante?** Routh dice cuántas raíces son inestables sin calcularlas, lo que es indispensable para polinomios de tercer orden o más.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis) y [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

Para \(a_ns^n + a_{n-1}s^{n-1} + \cdots + a_0\):

**Cómo se arma**

1. Fila \(s^n\): \(a_n,\ a_{n-2},\ a_{n-4},\ldots\) Fila \(s^{n-1}\): \(a_{n-1},\ a_{n-3},\ldots\)
2. Cada elemento nuevo se calcula con las dos filas de arriba: \(b_1 = \dfrac{a_{n-1}a_{n-2} - a_na_{n-3}}{a_{n-1}}\), \(b_2 = \dfrac{a_{n-1}a_{n-4} - a_na_{n-5}}{a_{n-1}}\), y así.
3. Truco: es menos el determinante de 2×2 (primera columna y la columna siguiente) dividido por el primer elemento de la fila de arriba.
4. Sigue hasta la fila \(s^0\).

*Criterio*

El número de raíces en el semiplano derecho es igual al número de **cambios de signo** en la primera columna. Estable si no hay ninguno.

La demostración completa usa el teorema de Sturm y sale del alcance de Control 1. Sí puedes verificarla en el segundo orden: con \(s^2 + a_1s + a_0\), la primera columna es \(1, a_1, a_0\); no hay cambios de signo si y solo si \(a_1, a_0 > 0\), que es exactamente la condición para que las raíces \(\frac{-a_1\pm\sqrt{a_1^2-4a_0}}{2}\) tengan parte real negativa.

#### Ejemplo 1 · Estable · *Básico*

**Enunciado.** ¿Es estable \(s^3 + 6s^2 + 11s + 6\)?

1. Fila \(s^3\): coeficientes en posición 1, 3, … : \(1,\ 11\). Fila \(s^2\): posición 2, 4, … : \(6,\ 6\).

   **¿Por qué?** Las dos primeras filas se llenan alternando coeficientes.

2. Fila \(s^1\): \(\dfrac{6\cdot11 - 1\cdot6}{6} = \dfrac{60}{6} = 10\).

   **¿Por qué?** Fórmula del arreglo: cruce de las dos filas de arriba dividido por el primero de la fila inmediata.

3. Fila \(s^0\): \(\dfrac{10\cdot6 - 6\cdot0}{10} = 6\).

   **¿Por qué?** Mismo cálculo.

4. Primera columna: 1, 6, 10, 6. Sin cambios de signo.

   **¿Por qué?** Cada cambio de signo es una raíz inestable.

**Resultado:** Estable (raíces −1, −2, −3)

#### Ejemplo 2 · Inestable con coeficientes positivos · *Intermedio*

> **Qué cambia respecto al anterior:** Los coeficientes son todos positivos y aun así es inestable.

**Enunciado.** ¿Es estable \(s^3 + s^2 + 2s + 8\)?

1. \(s^3\): 1, 2. \(s^2\): 1, 8.

   **¿Por qué?** Primeras filas.

2. \(s^1\): \(\dfrac{1\cdot2 - 1\cdot8}{1} = -6\).

   **¿Por qué?** Aparece un negativo.

3. \(s^0\): 8. Primera columna 1, 1, −6, 8: dos cambios (1→−6 y −6→8).

   **¿Por qué?** Cada cambio cuenta.

**Resultado:** Inestable: dos raíces en el semiplano derecho

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 3 · Routh de \(s^{3} + 6 s^{2} + 11 s + 6\) · *Básico*

**Enunciado.** ¿Cuántas raíces hay en el semiplano derecho?

1. Primeras dos filas: coeficientes alternados, empezando por el de mayor potencia.

   **¿Por qué?** Así arranca siempre el arreglo.

2. Primer elemento de cada fila nueva: \(s^{1}:\ \dfrac{(6)(11) - (1)(6)}{6} = 10\); \(s^{0}:\ \dfrac{(10)(6) - (6)(0)}{10} = 6\).

   **¿Por qué?** Cada fila se calcula con las dos de arriba: producto cruzado (primero de abajo × siguiente de arriba − primero de arriba × siguiente de abajo) dividido por el primero de la fila de abajo.

3. Primera columna: \(1, 6, 10, 6\) → 0 cambio(s) de signo.

   **¿Por qué?** El número de cambios de signo en la primera columna es el número de raíces en el semiplano derecho.

Arreglo completo:

| Fila | col. 1 | col. 2 |
|---|---|---|
| \(s^{3}\) | \(1\) | \(11\) |
| \(s^{2}\) | \(6\) | \(6\) |
| \(s^{1}\) | \(10\) | \(0\) |
| \(s^{0}\) | \(6\) | \(0\) |

**Resultado.** 0 raíz(ces) en el semiplano derecho: **estable**.

**Comprobación.** Calculando las raíces numéricamente hay 0 con parte real positiva.

#### Ejemplo 4 · Routh de \(s^{3} + 2 s^{2} + 3 s + 10\) · *Intermedio*

**Enunciado.** ¿Cuántas raíces hay en el semiplano derecho?

1. Primeras dos filas: coeficientes alternados, empezando por el de mayor potencia.

   **¿Por qué?** Así arranca siempre el arreglo.

2. Primer elemento de cada fila nueva: \(s^{1}:\ \dfrac{(2)(3) - (1)(10)}{2} = -2\); \(s^{0}:\ \dfrac{(-2)(10) - (2)(0)}{-2} = 10\).

   **¿Por qué?** Cada fila se calcula con las dos de arriba: producto cruzado (primero de abajo × siguiente de arriba − primero de arriba × siguiente de abajo) dividido por el primero de la fila de abajo.

3. Primera columna: \(1, 2, -2, 10\) → 2 cambio(s) de signo.

   **¿Por qué?** El número de cambios de signo en la primera columna es el número de raíces en el semiplano derecho.

Arreglo completo:

| Fila | col. 1 | col. 2 |
|---|---|---|
| \(s^{3}\) | \(1\) | \(3\) |
| \(s^{2}\) | \(2\) | \(10\) |
| \(s^{1}\) | \(-2\) | \(0\) |
| \(s^{0}\) | \(10\) | \(0\) |

**Resultado.** 2 raíz(ces) en el semiplano derecho: **inestable**.

**Comprobación.** Calculando las raíces numéricamente hay 2 con parte real positiva.

#### Ejemplo 5 · Routh de \(s^{4} + 4 s^{3} + 6 s^{2} + 4 s + 5\) · *Intermedio*

**Enunciado.** ¿Cuántas raíces hay en el semiplano derecho?

1. Primeras dos filas: coeficientes alternados, empezando por el de mayor potencia.

   **¿Por qué?** Así arranca siempre el arreglo.

2. Primer elemento de cada fila nueva: \(s^{2}:\ \dfrac{(4)(6) - (1)(4)}{4} = 5\); \(s^{1}:\ \dfrac{(5)(4) - (4)(5)}{5} = 0\); \(s^{0}:\ \dfrac{(0)(5) - (5)(0)}{0} = \text{NaN}\).

   **¿Por qué?** Cada fila se calcula con las dos de arriba: producto cruzado (primero de abajo × siguiente de arriba − primero de arriba × siguiente de abajo) dividido por el primero de la fila de abajo.

3. Primera columna: \(1, 4, 5, 0, \text{NaN}\) → 2 cambio(s) de signo.

   **¿Por qué?** El número de cambios de signo en la primera columna es el número de raíces en el semiplano derecho.

Arreglo completo:

| Fila | col. 1 | col. 2 | col. 3 |
|---|---|---|---|
| \(s^{4}\) | \(1\) | \(6\) | \(5\) |
| \(s^{3}\) | \(4\) | \(4\) | \(0\) |
| \(s^{2}\) | \(5\) | \(5\) | \(0\) |
| \(s^{1}\) | \(0\) | \(0\) | \(0\) |
| \(s^{0}\) | \(\text{NaN}\) | \(\text{NaN}\) | \(0\) |

**Resultado.** 2 raíz(ces) en el semiplano derecho: **inestable**.

**Comprobación.** Calculando las raíces numéricamente hay 0 con parte real positiva.

#### Ejemplo 6 · Routh de \(2 s^{3} + 3 s^{2} + 5 s + 1\) · *Básico*

**Enunciado.** ¿Cuántas raíces hay en el semiplano derecho?

1. Primeras dos filas: coeficientes alternados, empezando por el de mayor potencia.

   **¿Por qué?** Así arranca siempre el arreglo.

2. Primer elemento de cada fila nueva: \(s^{1}:\ \dfrac{(3)(5) - (2)(1)}{3} = \frac{13}{3}\); \(s^{0}:\ \dfrac{(\frac{13}{3})(1) - (3)(0)}{\frac{13}{3}} = 1\).

   **¿Por qué?** Cada fila se calcula con las dos de arriba: producto cruzado (primero de abajo × siguiente de arriba − primero de arriba × siguiente de abajo) dividido por el primero de la fila de abajo.

3. Primera columna: \(2, 3, \frac{13}{3}, 1\) → 0 cambio(s) de signo.

   **¿Por qué?** El número de cambios de signo en la primera columna es el número de raíces en el semiplano derecho.

Arreglo completo:

| Fila | col. 1 | col. 2 |
|---|---|---|
| \(s^{3}\) | \(2\) | \(5\) |
| \(s^{2}\) | \(3\) | \(1\) |
| \(s^{1}\) | \(\frac{13}{3}\) | \(0\) |
| \(s^{0}\) | \(1\) | \(0\) |

**Resultado.** 0 raíz(ces) en el semiplano derecho: **estable**.

**Comprobación.** Calculando las raíces numéricamente hay 0 con parte real positiva.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar la "Comprobación" del Ejemplo 3: que las raíces reales coinciden con el conteo de Routh.

```python
# verificacion.py
from sympy import symbols, solve, re

s = symbols("s")
raices = solve(s ** 3 + 6 * s ** 2 + 11 * s + 6, s)
inestables = sum(1 for r in raices if re(r) > 0)
print("raices:", raices)
print("raices_en_semiplano_derecho:", inestables)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `raices: [-3, -2, -1]` y `raices_en_semiplano_derecho: 0`, confirmando el arreglo del Ejemplo 3 (0 cambios de signo → estable).

#### Practica

cambia el polinomio a `s**3 + 2*s**2 + 3*s + 10` y confirma `raices_en_semiplano_derecho: 2` (Ejemplo 4). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** este script resuelve el polinomio exactamente con sympy, algo que no se puede hacer a mano para orden 3 o más; el valor real del arreglo de Routh es que da el conteo de raíces inestables **sin** tener que resolver el polinomio.

### Tema 3: Casos especiales

**¿Por qué es importante?** Los casos especiales aparecen justo en el límite de estabilidad, que es donde se hacen las preguntas difíciles.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis) y [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

#### Ejemplo 1 · Un cero en la primera columna · *Nivel parcial*

> **Qué cambia respecto al anterior:** Aparece un cero en la primera columna.

**Enunciado.** \(s^4 + s^3 + 2s^2 + 2s + 3\).

1. \(s^4\): 1, 2, 3. \(s^3\): 1, 2. \(s^2\): \(\dfrac{1\cdot2-1\cdot2}{1} = 0\), 3.

   **¿Por qué?** Aparece un 0 en la primera columna.

2. Cámbialo por \(\varepsilon\), un número positivo muy pequeño.

   **¿Por qué?** No se puede dividir por 0, y \(\varepsilon\) permite seguir y ver los signos.

3. \(s^1\): \(\dfrac{2\varepsilon - 3}{\varepsilon} = 2 - \dfrac3\varepsilon\), muy negativo. \(s^0\): 3.

   **¿Por qué?** Con \(\varepsilon\) diminuto, \(3/\varepsilon\) es enorme.

4. Primera columna: 1, 1, \(+\varepsilon\), \(-\), 3: dos cambios.

   **¿Por qué?** Conteo.

**Resultado:** Dos raíces inestables

#### Ejemplo 2 · Una fila completa de ceros · *Experto*

> **Qué cambia respecto al anterior:** Toda una fila se anula.

**Enunciado.** \(s^5 + 2s^4 + 24s^3 + 48s^2 - 25s - 50\).

1. \(s^5\): 1, 24, −25. \(s^4\): 2, 48, −50. \(s^3\): 0, 0.

   **¿Por qué?** La fila \(s^4\) es exactamente el doble de la \(s^5\): por eso se anula toda la fila siguiente.

2. Polinomio auxiliar con la fila \(s^4\): \(P = 2s^4 + 48s^2 - 50\). Su derivada: \(8s^3 + 96s\). Usa 8, 96 como nueva fila \(s^3\).

   **¿Por qué?** Una fila de ceros indica raíces simétricas, que son las raíces de \(P\).

3. \(s^2\): \(\dfrac{8\cdot48 - 2\cdot96}{8} = 24\), −50. \(s^1\): \(\dfrac{24\cdot96 + 400}{24} = 112{,}7\). \(s^0\): −50.

   **¿Por qué?** Se sigue normal.

4. Primera columna 1, 2, 8, 24, 112,7, −50: un cambio.

   **¿Por qué?** Una raíz inestable.

5. \(P = 0\): \(s^4 + 24s^2 - 25 = (s^2+25)(s^2-1)\): \(\pm5j\), \(\pm1\).

   **¿Por qué?** Así se encuentran las raíces simétricas.

**Resultado:** Raíces \(1, -1, \pm5j, -2\)

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 3 · Cero en la primera columna · *Intermedio*

**Enunciado.** Aplica Routh a \(s^4 + s^3 + 2s^2 + 2s + 3\).

1. Filas \(s^4\): 1, 2, 3; \(s^3\): 1, 2. Fila \(s^2\): \(\tfrac{1\cdot2-1\cdot2}{1} = 0\) y 3.

   **¿Por qué?** Aparece un cero en la primera columna: no se puede dividir por él.

2. Reemplaza el 0 por \(\varepsilon > 0\) pequeño y sigue: \(s^1\): \(\tfrac{2\varepsilon - 3}{\varepsilon} \to -\infty\); \(s^0\): 3.

   **¿Por qué?** El truco del \(\varepsilon\) mira el signo que tendría ese elemento si el polinomio cambiara un poquito.

**Resultado.** Primera columna: \(1, 1, \varepsilon, -\infty, 3\): dos cambios de signo → **dos raíces en el semiplano derecho**.

**Comprobación.** Numéricamente hay 2 raíces con parte real positiva.

#### Ejemplo 4 · Fila completa de ceros · *Avanzado*

**Enunciado.** Aplica Routh a \(s^3 + 2s^2 + 4s + 8\).

1. \(s^3\): 1, 4; \(s^2\): 2, 8; \(s^1\): \(\tfrac{2\cdot4 - 1\cdot8}{2} = 0\): fila entera de ceros.

   **¿Por qué?** Una fila de ceros indica raíces simétricas respecto al origen (por ejemplo sobre el eje imaginario).

2. Polinomio auxiliar con la fila de arriba: \(A(s) = 2s^2 + 8\); su derivada \(4s\) reemplaza la fila de ceros.

   **¿Por qué?** Las raíces simétricas son las raíces de \(A(s)\).

**Resultado.** \(A(s) = 0 \Rightarrow s = \pm 2j\): **marginalmente estable**; la otra raíz es \(s=-2\) y no hay cambios de signo.

#### Ejemplo 5 · Polinomio con un coeficiente faltante · *Básico*

**Enunciado.** ¿Puede ser estable \(s^3 + 5s + 2\)?

1. Falta el término \(s^2\) (coeficiente 0).

   **¿Por qué?** Condición necesaria: todos los coeficientes deben existir y tener el mismo signo.

**Resultado.** No: un polinomio con un coeficiente cero o de signo distinto **no puede ser estable**; no hace falta construir el arreglo.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 4 (fila completa de ceros).

```python
# verificacion.py
from sympy import symbols, solve

s = symbols("s")
raices = solve(s ** 3 + 2 * s ** 2 + 4 * s + 8, s)
print("raices:", raices)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `raices: [-2, -2*I, 2*I]`, igual al Ejemplo 4 (\(s=\pm2j\) y \(s=-2\): marginalmente estable).

#### Practica

cambia el polinomio a `s**4 + s**3 + 2*s**2 + 2*s + 3` y confirma que hay 2 raíces con parte real positiva (Ejemplo 3). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** resolver el polinomio directamente (como hace este script) es la comprobación, no el método; en el examen debes llegar al mismo conteo de raíces inestables construyendo el arreglo con el truco de \(\varepsilon\) o el polinomio auxiliar, sin resolver el polinomio completo.

### Tema 4: Rango de K para estabilidad

**¿Por qué es importante?** El rango de \(K\) dice hasta dónde se puede subir la ganancia de un controlador y es la base de Ziegler-Nichols.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis) y [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

#### Ejemplo 1 · Rango de K · *Nivel parcial*

> **Qué cambia respecto al anterior:** Hay una ganancia desconocida.

**Enunciado.** \(G = \dfrac{K}{s(s+1)(s+2)}\) con realimentación unitaria. ¿Para qué \(K\) es estable?

1. Polinomio característico: \(1 + G = 0 \Rightarrow s(s+1)(s+2) + K = s^3 + 3s^2 + 2s + K\).

   **¿Por qué?** Los polos de lazo cerrado son las raíces de \(1+G = 0\), no las de la planta.

2. \(s^3\): 1, 2. \(s^2\): 3, \(K\). \(s^1\): \(\dfrac{3\cdot2 - 1\cdot K}{3} = \dfrac{6-K}{3}\). \(s^0\): \(K\).

   **¿Por qué?** Routh con una letra.

3. Sin cambios de signo: \(6 - K > 0\) y \(K > 0\).

   **¿Por qué?** Toda la primera columna debe ser positiva.

4. En \(K = 6\): fila auxiliar \(3s^2 + 6 = 0 \Rightarrow s = \pm j\sqrt2\).

   **¿Por qué?** En el límite los polos están sobre el eje imaginario: oscila.

**Resultado:** \(0 < K < 6\); en \(K = 6\) oscila a 1,41 rad/s

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar la frecuencia de oscilación en el límite \(K=6\).

```python
# verificacion.py
from sympy import symbols, solve

s, K = symbols("s K")
char = s * (s + 1) * (s + 2) + K
print("raices en K=6:", solve(char.subs(K, 6), s))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `raices en K=6: [-3, -sqrt(2)*I, sqrt(2)*I]`, confirmando que en \(K=6\) el sistema oscila a \(\sqrt2\approx1{,}41\) rad/s.

#### Practica

cambia `char` a \(s(s+1)(s+5)+K\) y evalúa en `K=30` para confirmar la oscilación a \(\sqrt5\) rad/s (práctica 2 de esta sección). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** este script confirma el límite de estabilidad sustituyendo un valor numérico de \(K\); no reemplaza construir el arreglo de Routh con \(K\) simbólico, que es lo que realmente da el rango completo (\(0<K<6\)), no solo el punto límite.

#### Errores comunes

- Usar el denominador de la planta en vez del polinomio característico \(1 + G(s)H(s) = 0\).
- Equivocar el orden de los coeficientes en las dos primeras filas.
- Contar elementos negativos en lugar de cambios de signo.

- **1.**¿Es estable \(s^3 + 4s^2 + 5s + 2\)?
  
  <details><summary>Respuesta</summary>
  
  \(s^1\): \((20-2)/4 = 4{,}5\). Primera columna 1, 4, 4,5, 2: estable.
  
  </details>

- **2.**Rango de \(K\) para \(G = \dfrac{K}{s(s+1)(s+5)}\).
  
  <details><summary>Respuesta</summary>
  
  \(s^3+6s^2+5s+K\): \(s^1 = (30-K)/6\). \(0<K<30\), oscila a \(\sqrt5\) rad/s.
  
  </details>

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Rango de K para \(G = \dfrac{K}{s \left(s + 2\right) \left(s + 4\right)}\) · *Básico*

**Enunciado.** Realimentación unitaria. ¿Para qué \(K\) es estable el lazo cerrado?

1. Ecuación característica \(1 + G = 0 \Rightarrow K + s^{3} + 6 s^{2} + 8 s = 0\).

   **¿Por qué?** Los polos en lazo cerrado son las raíces de \(D(s) + K = 0\).

2. Fila \(s^1\): \(\dfrac{6\cdot8 - K}{6} > 0 \Rightarrow K < 48\); fila \(s^0\): \(K > 0 \Rightarrow K > 0\).

   **¿Por qué?** Toda la primera columna debe ser positiva para que no haya cambios de signo.

**Resultado.** Estable para \(0 < K < 48\). En \(K = 48\) oscila a \(\omega = \sqrt{8} = 2 \sqrt{2}\approx 2{,}828\) rad/s (polinomio auxiliar \(6s^2 + 48\)).

#### Ejemplo 3 · Rango de K para \(G = \dfrac{K}{\left(s + 1\right) \left(s + 2\right) \left(s + 3\right)}\) · *Intermedio*

**Enunciado.** Realimentación unitaria. ¿Para qué \(K\) es estable el lazo cerrado?

1. Ecuación característica \(1 + G = 0 \Rightarrow K + s^{3} + 6 s^{2} + 11 s + 6 = 0\).

   **¿Por qué?** Los polos en lazo cerrado son las raíces de \(D(s) + K = 0\).

2. Fila \(s^1\): \(\dfrac{6\cdot11 - K + 6}{6} > 0 \Rightarrow K < 60\); fila \(s^0\): \(K + 6 > 0 \Rightarrow K > -6\).

   **¿Por qué?** Toda la primera columna debe ser positiva para que no haya cambios de signo.

**Resultado.** Estable para \(-6 < K < 60\). En \(K = 60\) oscila a \(\omega = \sqrt{11}\approx 3{,}317\) rad/s (polinomio auxiliar \(6s^2 + 66\)).

#### Ejemplo 4 · Rango de K para \(G = \dfrac{K}{s \left(s + 1\right) \left(s + 5\right)}\) · *Básico*

**Enunciado.** Realimentación unitaria. ¿Para qué \(K\) es estable el lazo cerrado?

1. Ecuación característica \(1 + G = 0 \Rightarrow K + s^{3} + 6 s^{2} + 5 s = 0\).

   **¿Por qué?** Los polos en lazo cerrado son las raíces de \(D(s) + K = 0\).

2. Fila \(s^1\): \(\dfrac{6\cdot5 - K}{6} > 0 \Rightarrow K < 30\); fila \(s^0\): \(K > 0 \Rightarrow K > 0\).

   **¿Por qué?** Toda la primera columna debe ser positiva para que no haya cambios de signo.

**Resultado.** Estable para \(0 < K < 30\). En \(K = 30\) oscila a \(\omega = \sqrt{5}\approx 2{,}236\) rad/s (polinomio auxiliar \(6s^2 + 30\)).

#### Ejemplo 5 · Rango de K para \(G = \dfrac{K}{s \left(s^{2} + 4 s + 8\right)}\) · *Intermedio*

**Enunciado.** Realimentación unitaria. ¿Para qué \(K\) es estable el lazo cerrado?

1. Ecuación característica \(1 + G = 0 \Rightarrow K + s^{3} + 4 s^{2} + 8 s = 0\).

   **¿Por qué?** Los polos en lazo cerrado son las raíces de \(D(s) + K = 0\).

2. Fila \(s^1\): \(\dfrac{4\cdot8 - K}{4} > 0 \Rightarrow K < 32\); fila \(s^0\): \(K > 0 \Rightarrow K > 0\).

   **¿Por qué?** Toda la primera columna debe ser positiva para que no haya cambios de signo.

**Resultado.** Estable para \(0 < K < 32\). En \(K = 32\) oscila a \(\omega = \sqrt{8} = 2 \sqrt{2}\approx 2{,}828\) rad/s (polinomio auxiliar \(4s^2 + 32\)).

#### Ejemplo 6 · Rango de K para \(G = \dfrac{K}{\left(s + 1\right)^{3}}\) · *Intermedio*

**Enunciado.** Realimentación unitaria. ¿Para qué \(K\) es estable el lazo cerrado?

1. Ecuación característica \(1 + G = 0 \Rightarrow K + s^{3} + 3 s^{2} + 3 s + 1 = 0\).

   **¿Por qué?** Los polos en lazo cerrado son las raíces de \(D(s) + K = 0\).

2. Fila \(s^1\): \(\dfrac{3\cdot3 - K + 1}{3} > 0 \Rightarrow K < 8\); fila \(s^0\): \(K + 1 > 0 \Rightarrow K > -1\).

   **¿Por qué?** Toda la primera columna debe ser positiva para que no haya cambios de signo.

**Resultado.** Estable para \(-1 < K < 8\). En \(K = 8\) oscila a \(\omega = \sqrt{3}\approx 1{,}732\) rad/s (polinomio auxiliar \(3s^2 + 9\)).

