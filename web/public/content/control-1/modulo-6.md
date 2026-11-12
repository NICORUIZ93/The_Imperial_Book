# Módulo 6: Reducción de diagramas de bloques y regla de Mason

Los diagramas reales tienen lazos dentro de lazos y señales que se cruzan. Aquí aprendes a mover bloques sin cambiar el sistema y a usar la regla de Mason, que resuelve cualquier diagrama de una vez.

**Al terminar podrás:**

- Mover puntos de suma y de bifurcación sin alterar el sistema.
- Convertir un diagrama de bloques en un grafo de flujo de señal.
- Aplicar la regla de Mason con lazos que se tocan y que no se tocan.
- Calcular la salida cuando hay referencia y perturbación a la vez.

## Aprende construyendo

### Tema 1: Reglas para mover bloques

**¿Por qué es importante?** Mover bloques correctamente permite simplificar diagramas que no se pueden reducir con solo serie y paralelo.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

> **Idea clave.** Mover un bloque es válido si cada señal sigue llegando al mismo lugar multiplicada por lo mismo. Para compensar, agregas el bloque (o su inverso) en la rama que cambió.

| Movimiento | Antes | Después | Por qué |
|---|---|---|---|
| Punto de suma hacia adelante de \(G\) | \(Y = G(A \pm B)\) | \(Y = GA \pm GB\): agrega \(G\) en la rama \(B\) | Distributiva |
| Punto de suma hacia atrás de \(G\) | \(Y = GA \pm B\) | \(Y = G\left(A \pm \tfrac{B}{G}\right)\): agrega \(1/G\) en la rama \(B\) | Factor común |
| Bifurcación hacia adelante de \(G\) | Se toma \(A\) antes de \(G\) | Se toma \(GA\) y se pasa por \(1/G\) | \(\tfrac1G\cdot GA = A\) |
| Bifurcación hacia atrás de \(G\) | Se toma \(GA\) después de \(G\) | Se toma \(A\) y se pasa por \(G\) | Misma señal |
| Realimentación no unitaria a unitaria | \(\dfrac{G}{1+GH}\) | \(\dfrac{1}{H}\cdot\dfrac{GH}{1+GH}\) | Álgebra |

#### Ejemplo 1 · Lazos entrelazados por reducción · *Intermedio*

**Enunciado.** \(R \to\) suma 1 \(\to G_1 \to\) suma 2 \(\to G_2 \to G_3 \to Y\). Realimentación \(H_1\) desde la salida de \(G_2\) a la suma 2; realimentación unitaria desde \(Y\) a la suma 1.

1. Lazo interno (\(G_2\) con \(H_1\)): \(\dfrac{G_2}{1+G_2H_1}\).

   **¿Por qué?** Es un lazo completo que no depende de los demás bloques.

2. Serie con \(G_1\) y \(G_3\): \(\dfrac{G_1G_2G_3}{1+G_2H_1}\).

   **¿Por qué?** Los tres bloques quedan uno tras otro.

3. Lazo externo unitario: \(\dfrac{N}{D+N} = \dfrac{G_1G_2G_3}{1+G_2H_1+G_1G_2G_3}\).

   **¿Por qué?** Truco de capítulo 6.

**Resultado:** \(\dfrac{G_1G_2G_3}{1+G_2H_1+G_1G_2G_3}\)

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Mover un punto de suma hacia la izquierda · *Intermedio*

**Enunciado.** Un sumador recibe \(G_1R\) y \(D\). Llévalo antes de \(G_1\).

1. Para conservar la salida, \(D\) debe dividirse por \(G_1\): el sumador queda con \(R\) y \(D/G_1\), y luego \(G_1\).

   **¿Por qué?** La salida antes era \(G_1R + D\); ahora es \(G_1(R + D/G_1) = G_1R + D\): idéntica.

**Resultado.** El diagrama cambia de forma pero la relación entre entradas y salida es la misma.

#### Ejemplo 3 · Mover un punto de toma hacia adelante · *Intermedio*

**Enunciado.** Se toma la señal \(X\) antes de \(G_2\). Pásala después de \(G_2\).

1. Después de \(G_2\) la señal es \(G_2X\); para recuperar \(X\) se agrega un bloque \(1/G_2\) en la rama tomada.

   **¿Por qué?** Toda regla de movimiento exige que cada señal conserve su valor.

**Resultado.** El diagrama cambia de forma pero la relación entre entradas y salida es la misma.

#### Ejemplo 4 · Mover un sumador hacia la derecha · *Intermedio*

**Enunciado.** Un sumador \(R - B\) entra a \(G_1\). Pásalo después de \(G_1\).

1. Ahora entran \(G_1R\) y \(G_1B\): la rama \(B\) necesita un bloque \(G_1\).

   **¿Por qué?** \(G_1(R-B) = G_1R - G_1B\) por linealidad.

**Resultado.** El diagrama cambia de forma pero la relación entre entradas y salida es la misma.

#### Ejemplo 5 · Lazo menor dentro de un lazo mayor · *Intermedio*

**Enunciado.** \(G_2\) tiene realimentación \(H\) y todo está en serie con \(G_1\) y realimentación unitaria.

1. Primero reduce el lazo interno: \(G_2/(1+G_2H)\). Luego queda un lazo simple con \(G_1G_2/(1+G_2H)\).

   **¿Por qué?** Siempre se reducen primero los lazos que no se cruzan con otros.

**Resultado.** \(T = \frac{G_{1} G_{2}}{G_{1} G_{2} + G_{2} H + 1}\).

### Tema 2: Grafos de flujo de señal

**¿Por qué es importante?** El grafo de flujo de señal es la representación que usa la regla de Mason; sin él no puedes contar caminos y lazos.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

Un grafo de flujo de señal es otra forma de dibujar lo mismo: las señales son **nodos** y los bloques son **ramas** con su ganancia. Un punto de suma es un nodo al que llegan varias ramas. Vocabulario:

- **Trayectoria directa:** camino de la entrada a la salida sin pasar dos veces por el mismo nodo. Su ganancia \(P_k\) es el producto de sus ramas.
- **Lazo:** camino cerrado que vuelve al nodo de partida. Su ganancia \(L_i\) es el producto de sus ramas, *incluido el signo menos* de la realimentación negativa.
- **Lazos que no se tocan:** no comparten ningún nodo.

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Dibujar el grafo: \(x_2 = 3x_1 - x_3\), \(x_3 = 2x_2\) · *Intermedio*

**Enunciado.** Construye el grafo de flujo de señal de \(x_2 = 3x_1 - x_3\), \(x_3 = 2x_2\).

1. Cada variable es un nodo; cada término de una ecuación es una rama que llega al nodo despejado.

   **¿Por qué?** Un grafo de flujo de señal es otra forma de escribir las ecuaciones: nodo = señal, rama = multiplicación.

2. Nodos \(x_1, x_2, x_3\); ramas \(x_1\to x_2\) (ganancia 3), \(x_3\to x_2\) (−1) y \(x_2\to x_3\) (2).

   **¿Por qué?** Se lee cada ecuación de derecha a izquierda.

**Resultado.** Un lazo \(x_2\to x_3\to x_2\) con ganancia \(2\cdot(-1) = -2\).

#### Ejemplo 2 · Dibujar el grafo: Lazo \(G\) con realimentación \(H\) · *Intermedio*

**Enunciado.** Construye el grafo de flujo de señal de Lazo \(G\) con realimentación \(H\).

1. Cada variable es un nodo; cada término de una ecuación es una rama que llega al nodo despejado.

   **¿Por qué?** Un grafo de flujo de señal es otra forma de escribir las ecuaciones: nodo = señal, rama = multiplicación.

2. Nodos \(R, E, Y\); ramas \(R\to E\) (1), \(E\to Y\) (\(G\)), \(Y\to E\) (\(-H\)).

   **¿Por qué?** Se lee cada ecuación de derecha a izquierda.

**Resultado.** Un lazo de ganancia \(-GH\) y un camino directo \(G\).

#### Ejemplo 3 · Dibujar el grafo: Dos bloques en serie con realimentación de cada uno · *Intermedio*

**Enunciado.** Construye el grafo de flujo de señal de Dos bloques en serie con realimentación de cada uno.

1. Cada variable es un nodo; cada término de una ecuación es una rama que llega al nodo despejado.

   **¿Por qué?** Un grafo de flujo de señal es otra forma de escribir las ecuaciones: nodo = señal, rama = multiplicación.

2. Ramas \(E\to X\) (\(G_1\)), \(X\to Y\) (\(G_2\)), \(X\to E\) (\(-H_1\)), \(Y\to X\) (\(-H_2\)).

   **¿Por qué?** Se lee cada ecuación de derecha a izquierda.

**Resultado.** Dos lazos: \(-G_1H_1\) y \(-G_2H_2\); se tocan porque comparten el nodo \(X\).

#### Ejemplo 4 · Dibujar el grafo: Entrada con perturbación · *Intermedio*

**Enunciado.** Construye el grafo de flujo de señal de Entrada con perturbación.

1. Cada variable es un nodo; cada término de una ecuación es una rama que llega al nodo despejado.

   **¿Por qué?** Un grafo de flujo de señal es otra forma de escribir las ecuaciones: nodo = señal, rama = multiplicación.

2. Ramas \(R\to E\) (1), \(E\to U\) (\(C\)), \(U\to Y\) (\(P\)), \(D\to Y\) (1), \(Y\to E\) (−1).

   **¿Por qué?** Se lee cada ecuación de derecha a izquierda.

**Resultado.** Un lazo \(-CP\); dos entradas (\(R\) y \(D\)) con caminos directos \(CP\) y 1.

#### Ejemplo 5 · Dibujar el grafo: Ecuaciones de un circuito RC en cascada · *Intermedio*

**Enunciado.** Construye el grafo de flujo de señal de Ecuaciones de un circuito RC en cascada.

1. Cada variable es un nodo; cada término de una ecuación es una rama que llega al nodo despejado.

   **¿Por qué?** Un grafo de flujo de señal es otra forma de escribir las ecuaciones: nodo = señal, rama = multiplicación.

2. \(V_1 = \tfrac{1}{RCs}(V_i - V_1) - \tfrac{1}{RCs}(V_1 - V_o)\), \(V_o = \tfrac{1}{RCs}(V_1 - V_o)\).

   **¿Por qué?** Se lee cada ecuación de derecha a izquierda.

**Resultado.** Tres lazos: dos propios de cada etapa y uno que conecta las etapas.

### Tema 3: Regla de Mason

**¿Por qué es importante?** Mason resuelve de una vez diagramas con varios lazos, donde la reducción paso a paso es larga y propensa a errores.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

\[T = \frac{Y}{R} = \frac{1}{\Delta}\sum_k P_k\,\Delta_k\]

    

\[\Delta = 1 - \sum L_i + \sum L_iL_j - \sum L_iL_jL_k + \cdots\]

*\(\sum L_i\): todos los lazos. \(\sum L_iL_j\): productos de pares de lazos que no se tocan. \(\sum L_iL_jL_k\): tríos que no se tocan, etc. \(\Delta_k\): el mismo \(\Delta\) pero solo con los lazos que no tocan la trayectoria \(k\).*

#### Demostración en el caso de un lazo (y por qué Δ tiene esa forma)

1. Con una sola trayectoria \(P = G\) y un solo lazo \(L = -GH\) que la toca: \(\Delta = 1 - L = 1 + GH\) y \(\Delta_1 = 1\). Mason da \(\dfrac{G}{1+GH}\), la fórmula de capítulo 6.
2. Con dos lazos que no se tocan, \(L_1\) y \(L_2\), en cascada: cada uno por separado da \(\dfrac{1}{1-L_1}\) y \(\dfrac{1}{1-L_2}\). En serie se multiplican: \(\dfrac{1}{(1-L_1)(1-L_2)} = \dfrac{1}{1 - L_1 - L_2 + L_1L_2}\). Ahí aparece el término \(+L_1L_2\) de los lazos que no se tocan.
3. En general, \(\Delta\) es el determinante del sistema de ecuaciones lineales de los nodos, y la regla de Mason es la regla de Cramer aplicada a ese sistema.

∎

**Procedimiento**

1. Identifica todas las trayectorias directas y calcula sus ganancias \(P_k\).
2. Identifica todos los lazos y sus ganancias \(L_i\), con signo.
3. Busca pares (y tríos) de lazos que no se tocan.
4. Calcula \(\Delta\) y cada \(\Delta_k\) (quita los lazos que tocan la trayectoria \(k\)).
5. Aplica la fórmula.

#### Ejemplo 1 · El mismo sistema con Mason · *Intermedio*

> **Qué cambia respecto al anterior:** Misma pregunta, otro método. Sirve para comprobar.

**Enunciado.** Resuelve el Ejemplo 1 con la regla de Mason.

1. Trayectorias de \(R\) a \(Y\): solo una, \(P_1 = G_1G_2G_3\).

   **¿Por qué?** Es el único camino que va hacia adelante.

2. Lazos: \(L_1 = -G_2H_1\) y \(L_2 = -G_1G_2G_3\).

   **¿Por qué?** Ambos con signo menos porque las dos realimentaciones son negativas.

3. ¿Se tocan? Sí, los dos pasan por \(G_2\). No hay productos de pares.

   **¿Por qué?** Solo los lazos que no comparten nodos aportan productos.

4. \(\Delta = 1 - (L_1+L_2) = 1 + G_2H_1 + G_1G_2G_3\). Ambos tocan \(P_1\): \(\Delta_1 = 1\).

   **¿Por qué?** Fórmula de \(\Delta\).

**Resultado:** El mismo resultado que por reducción

#### Ejemplo 2 · Lazos que no se tocan · *Nivel parcial*

> **Qué cambia respecto al anterior:** Ahora hay lazos que no se tocan.

**Enunciado.** \(G_1\) con realimentación \(H_1\), seguido de \(G_2\) con realimentación \(H_2\).

1. \(P_1 = G_1G_2\). Lazos \(L_1 = -G_1H_1\) y \(L_2 = -G_2H_2\).

   **¿Por qué?** Cada subsistema tiene su lazo.

2. No se tocan (no comparten nodos), así que aparece el producto \(L_1L_2 = G_1G_2H_1H_2\).

   **¿Por qué?** Por eso existe el término \(+\sum L_iL_j\).

3. \(\Delta = 1 + G_1H_1 + G_2H_2 + G_1G_2H_1H_2\), \(\Delta_1 = 1\).

   **¿Por qué?** Fórmula.

4. Verificación: \((1+G_1H_1)(1+G_2H_2)\) da lo mismo al expandir.

   **¿Por qué?** Es el producto de los dos lazos cerrados en serie.

**Resultado:** \(T = \dfrac{G_1G_2}{(1+G_1H_1)(1+G_2H_2)}\)

#### Ejemplo 3 · Dos trayectorias · *Nivel parcial*

> **Qué cambia respecto al anterior:** Ahora hay dos trayectorias directas.

**Enunciado.** Desde la suma, la señal va a \(Y\) por \(G_1\) y por \(G_2\) a la vez. Realimentación \(H\) desde \(Y\).

1. \(P_1 = G_1\), \(P_2 = G_2\).

   **¿Por qué?** Hay dos caminos de \(R\) a \(Y\).

2. Lazos \(L_1 = -G_1H\), \(L_2 = -G_2H\). Se tocan.

   **¿Por qué?** Comparten la suma y \(Y\).

3. \(\Delta = 1 + G_1H + G_2H\), \(\Delta_1 = \Delta_2 = 1\).

   **¿Por qué?** Los dos lazos tocan las dos trayectorias.

**Resultado:** \(T = \dfrac{G_1+G_2}{1+(G_1+G_2)H}\)

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 4 · Mason con dos lazos que se tocan · *Intermedio*

**Enunciado.** Camino directo \(G_1G_2\); lazos \(-G_1H_1\) y \(-G_2H_2\) que comparten un nodo.

1. \(\Delta = 1 - (L_1 + L_2) = 1 + G_1H_1 + G_2H_2\).

   **¿Por qué?** Como los lazos se tocan, no hay producto de lazos disjuntos.

2. \(\Delta_1 = 1\): el camino directo toca ambos lazos.

   **¿Por qué?** Se eliminan los lazos que tocan el camino.

**Resultado.** \(T = \dfrac{G_1G_2}{1 + G_1H_1 + G_2H_2}\).

#### Ejemplo 5 · Mason con dos lazos que no se tocan · *Avanzado*

**Enunciado.** Camino directo \(G_1G_2G_3\); lazos \(L_1=-G_1H_1\) (en el primer tramo) y \(L_2=-G_3H_2\) (en el último tramo), sin nodos comunes.

1. \(\Delta = 1 - (L_1+L_2) + L_1L_2 = 1 + G_1H_1 + G_3H_2 + G_1H_1G_3H_2\).

   **¿Por qué?** Cuando dos lazos no se tocan aparece el término del producto.

2. \(\Delta_1 = 1\).

   **¿Por qué?** El camino directo toca los dos lazos.

**Resultado.** \(T = \dfrac{G_1G_2G_3}{(1+G_1H_1)(1+G_3H_2)}\): el denominador se factoriza, como si fueran dos lazos independientes en serie.

#### Ejemplo 6 · Mason con dos caminos directos · *Avanzado*

**Enunciado.** Caminos \(P_1 = G_1G_2\) y \(P_2 = G_3\) (en paralelo); un lazo \(-G_2H_1\) que solo toca \(P_1\).

1. \(\Delta = 1 + G_2H_1\).

   **¿Por qué?** Un solo lazo.

2. \(\Delta_1 = 1\) (\(P_1\) toca el lazo) y \(\Delta_2 = 1 + G_2H_1\) (\(P_2\) no lo toca).

   **¿Por qué?** Para cada camino se quitan los lazos que lo tocan.

**Resultado.** \(T = \dfrac{G_1G_2 + G_3(1+G_2H_1)}{1+G_2H_1}\).

### Tema 4: Referencia y perturbación juntas

**¿Por qué es importante?** Calcular el efecto de una perturbación muestra con números por qué vale la pena cerrar el lazo.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

Con varias entradas se usa superposición: se calcula la salida para cada entrada con las demás en cero, y se suman.

#### Ejemplo 1 · Referencia y perturbación · *Nivel parcial*

> **Qué cambia respecto al anterior:** Hay dos entradas.

**Enunciado.** \(C = K\), \(G = \dfrac{1}{s+1}\), realimentación unitaria. Una perturbación \(D\) se suma a la entrada de la planta. Halla \(Y\) y el efecto de un escalón de \(D\) con \(K=9\).

1. Con \(D = 0\): \(\dfrac{Y}{R} = \dfrac{KG}{1+KG} = \dfrac{K}{s+1+K}\).

   **¿Por qué?** Superposición: una entrada a la vez.

2. Con \(R = 0\): el camino de \(D\) a \(Y\) es solo \(G\); el lazo sigue siendo \(-KG\). \(\dfrac YD = \dfrac{G}{1+KG} = \dfrac{1}{s+1+K}\).

   **¿Por qué?** Mason con \(P_1 = G\).

3. Escalón en \(D\) con \(K = 9\): \(y(\infty) = \dfrac{1}{0+1+9} = 0{,}1\).

   **¿Por qué?** Valor final \(= G(0)\) de esta función.

4. Sin control: \(y(\infty) = G(0) = 1\).

   **¿Por qué?** Para comparar el efecto del lazo.

**Resultado:** La perturbación queda reducida 10 veces

#### Errores comunes

- Olvidar el signo menos en la ganancia de los lazos con realimentación negativa.
- Contar como “que no se tocan” dos lazos que comparten un nodo.
- Olvidar los \(\Delta_k\) cuando hay lazos que no tocan una trayectoria.

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Referencia y perturbación con \(C = 10\), \(P = \frac{1}{s + 1}\) · *Básico*

**Enunciado.** La perturbación entra a la entrada de la planta. Halla \(Y\) en función de \(R\) y \(D\) y el efecto final de un escalón de perturbación.

1. \(Y = \dfrac{CP}{1+CP}R + \dfrac{P}{1+CP}D\).

   **¿Por qué?** Superposición: se calcula el efecto de cada entrada con la otra en cero (sistema lineal).

2. \(\tfrac{Y}{D} = \frac{1}{s + 11}\).

   **¿Por qué?** Mismo denominador \(1+CP\): ambas entradas comparten los polos del lazo.

**Resultado.** Ante un escalón unitario de perturbación, \(y_D(\infty) = \frac{1}{11}\); sin control habría sido \(1\), así que el lazo la reduce \(11\) veces.

#### Ejemplo 3 · Referencia y perturbación con \(C = 5\), \(P = \frac{2}{s \left(s + 4\right)}\) · *Intermedio*

**Enunciado.** La perturbación entra a la entrada de la planta. Halla \(Y\) en función de \(R\) y \(D\) y el efecto final de un escalón de perturbación.

1. \(Y = \dfrac{CP}{1+CP}R + \dfrac{P}{1+CP}D\).

   **¿Por qué?** Superposición: se calcula el efecto de cada entrada con la otra en cero (sistema lineal).

2. \(\tfrac{Y}{D} = \frac{2}{s \left(s + 4\right) + 10}\).

   **¿Por qué?** Mismo denominador \(1+CP\): ambas entradas comparten los polos del lazo.

**Resultado.** Ante un escalón unitario de perturbación, \(y_D(\infty) = \frac{1}{5}\); sin control, la salida crecería sin límite (la planta integra), así que el lazo la acota.

#### Ejemplo 4 · Referencia y perturbación con \(C = 2 + \frac{1}{s}\), \(P = \frac{1}{s + 2}\) · *Intermedio*

**Enunciado.** La perturbación entra a la entrada de la planta. Halla \(Y\) en función de \(R\) y \(D\) y el efecto final de un escalón de perturbación.

1. \(Y = \dfrac{CP}{1+CP}R + \dfrac{P}{1+CP}D\).

   **¿Por qué?** Superposición: se calcula el efecto de cada entrada con la otra en cero (sistema lineal).

2. \(\tfrac{Y}{D} = \frac{s}{s^{2} + 4 s + 1}\).

   **¿Por qué?** Mismo denominador \(1+CP\): ambas entradas comparten los polos del lazo.

**Resultado.** Ante un escalón unitario de perturbación, \(y_D(\infty) = 0\): la acción integral la elimina por completo.

#### Ejemplo 5 · Referencia y perturbación con \(C = 20\), \(P = \frac{1}{s + 5}\) · *Básico*

**Enunciado.** La perturbación entra a la entrada de la planta. Halla \(Y\) en función de \(R\) y \(D\) y el efecto final de un escalón de perturbación.

1. \(Y = \dfrac{CP}{1+CP}R + \dfrac{P}{1+CP}D\).

   **¿Por qué?** Superposición: se calcula el efecto de cada entrada con la otra en cero (sistema lineal).

2. \(\tfrac{Y}{D} = \frac{1}{s + 25}\).

   **¿Por qué?** Mismo denominador \(1+CP\): ambas entradas comparten los polos del lazo.

**Resultado.** Ante un escalón unitario de perturbación, \(y_D(\infty) = \frac{1}{25}\); sin control habría sido \(\frac{1}{5}\), así que el lazo la reduce \(5\) veces.

#### Práctica para resolver sola o solo

- **1.**\(G_1 = \dfrac1s\), \(G_2 = \dfrac{1}{s+1}\), \(H_1 = 2\) (lazo interno sobre \(G_2\)), lazo externo unitario. \(T\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{1}{s^2+3s+1}\) (Ejemplo 5 de capítulo 6).
  
  </details>

- **2.**Con Mason: \(P_1 = G_1G_2\), \(P_2 = G_3\), un lazo \(L_1 = -G_2H\) que toca \(P_1\) pero no \(P_2\).
  
  <details><summary>Respuesta</summary>
  
  \(\Delta = 1+G_2H\), \(\Delta_1 = 1\), \(\Delta_2 = 1+G_2H\): \(T = \dfrac{G_1G_2 + G_3(1+G_2H)}{1+G_2H}\).
  
  </details>

