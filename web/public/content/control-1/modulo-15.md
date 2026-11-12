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

> **Idea clave.** Un sistema es estable (BIBO) si toda entrada acotada produce una salida acotada.

#### Demostración · estable ⇔ polos en el semiplano izquierdo

1. La respuesta al impulso \(g(t)\) es una suma de términos \(c\,t^ke^{pt}\), uno por cada polo \(p\) (capítulo 4).
2. Si \(\operatorname{Re}(p) < 0\), cada término tiende a cero y \(\int_0^\infty |g|\,dt\) es finita.
3. La salida es la convolución \(y(t) = \int g(\tau)u(t-\tau)d\tau\). Si \(|u|\le M\), entonces \(|y| \le M\int|g| < \infty\): salida acotada.
4. Si algún polo tiene \(\operatorname{Re}(p)\ge0\), \(g(t)\) no se apaga y existe una entrada acotada (por ejemplo, una senoidal a la frecuencia del polo) que hace crecer la salida sin límite.

∎

> **Condición necesaria rápida:** si el polinomio característico tiene algún coeficiente negativo o cero (y no todos son del mismo signo), el sistema no es estable. Con todos positivos todavía hay que verificar con Routh, salvo en primer y segundo orden, donde basta.

### Tema 2: El arreglo de Routh

**¿Por qué es importante?** Routh dice cuántas raíces son inestables sin calcularlas, lo que es indispensable para polinomios de tercer orden o más.

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

### Tema 3: Casos especiales

**¿Por qué es importante?** Los casos especiales aparecen justo en el límite de estabilidad, que es donde se hacen las preguntas difíciles.

#### Ejemplo 3 · Un cero en la primera columna · *Nivel parcial*

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

#### Ejemplo 4 · Una fila completa de ceros · *Experto*

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

### Tema 4: Rango de K para estabilidad

**¿Por qué es importante?** El rango de \(K\) dice hasta dónde se puede subir la ganancia de un controlador y es la base de Ziegler-Nichols.

#### Ejemplo 5 · Rango de K · *Nivel parcial*

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
