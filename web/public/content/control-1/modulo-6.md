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

### Tema 2: Grafos de flujo de señal

**¿Por qué es importante?** El grafo de flujo de señal es la representación que usa la regla de Mason; sin él no puedes contar caminos y lazos.

Un grafo de flujo de señal es otra forma de dibujar lo mismo: las señales son **nodos** y los bloques son **ramas** con su ganancia. Un punto de suma es un nodo al que llegan varias ramas. Vocabulario:

- **Trayectoria directa:** camino de la entrada a la salida sin pasar dos veces por el mismo nodo. Su ganancia \(P_k\) es el producto de sus ramas.
- **Lazo:** camino cerrado que vuelve al nodo de partida. Su ganancia \(L_i\) es el producto de sus ramas, *incluido el signo menos* de la realimentación negativa.
- **Lazos que no se tocan:** no comparten ningún nodo.

### Tema 3: Regla de Mason

**¿Por qué es importante?** Mason resuelve de una vez diagramas con varios lazos, donde la reducción paso a paso es larga y propensa a errores.

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

#### Ejemplo 2 · El mismo sistema con Mason · *Intermedio*

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

#### Ejemplo 3 · Lazos que no se tocan · *Nivel parcial*

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

#### Ejemplo 4 · Dos trayectorias · *Nivel parcial*

> **Qué cambia respecto al anterior:** Ahora hay dos trayectorias directas.

**Enunciado.** Desde la suma, la señal va a \(Y\) por \(G_1\) y por \(G_2\) a la vez. Realimentación \(H\) desde \(Y\).

1. \(P_1 = G_1\), \(P_2 = G_2\).

   **¿Por qué?** Hay dos caminos de \(R\) a \(Y\).

2. Lazos \(L_1 = -G_1H\), \(L_2 = -G_2H\). Se tocan.

   **¿Por qué?** Comparten la suma y \(Y\).

3. \(\Delta = 1 + G_1H + G_2H\), \(\Delta_1 = \Delta_2 = 1\).

   **¿Por qué?** Los dos lazos tocan las dos trayectorias.

**Resultado:** \(T = \dfrac{G_1+G_2}{1+(G_1+G_2)H}\)

### Tema 4: Referencia y perturbación juntas

**¿Por qué es importante?** Calcular el efecto de una perturbación muestra con números por qué vale la pena cerrar el lazo.

Con varias entradas se usa superposición: se calcula la salida para cada entrada con las demás en cero, y se suman.

#### Ejemplo 5 · Referencia y perturbación · *Nivel parcial*

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

### Tema 5: Práctica

**¿Por qué es importante?** Resolver el mismo diagrama por dos métodos te da una forma de comprobar tus respuestas.

- **1.**\(G_1 = \dfrac1s\), \(G_2 = \dfrac{1}{s+1}\), \(H_1 = 2\) (lazo interno sobre \(G_2\)), lazo externo unitario. \(T\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{1}{s^2+3s+1}\) (Ejemplo 5 de capítulo 6).
  
  </details>

- **2.**Con Mason: \(P_1 = G_1G_2\), \(P_2 = G_3\), un lazo \(L_1 = -G_2H\) que toca \(P_1\) pero no \(P_2\).
  
  <details><summary>Respuesta</summary>
  
  \(\Delta = 1+G_2H\), \(\Delta_1 = 1\), \(\Delta_2 = 1+G_2H\): \(T = \dfrac{G_1G_2 + G_3(1+G_2H)}{1+G_2H}\).
  
  </details>
