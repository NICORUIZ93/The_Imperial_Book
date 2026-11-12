# Módulo 10: Introducción al espacio de estados

Otra forma de describir sistemas, con matrices y ecuaciones de primer orden. Es la base del control moderno. Aquí ves cómo se arma y cómo se relaciona con \(G(s)\).

**Al terminar podrás:**

- Pasar una ecuación diferencial a la forma \(\dot x = Ax + Bu\), \(y = Cx + Du\).
- Obtener \(G(s)\) a partir de las matrices.
- Ver que los polos son los valores propios de \(A\).

## Aprende construyendo

### Tema 1: La forma de estado

**¿Por qué es importante?** El espacio de estados describe sistemas con varias entradas y salidas y es la base del control moderno.

**Fuentes oficiales:** [Espacio de estados, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlStateSpace).

\[\dot{\mathbf x} = A\mathbf x + B u \qquad y = C\mathbf x + Du\]

*\(\mathbf x\): vector de estados (lo mínimo que hay que saber del sistema para predecir su futuro). \(A\): dinámica. \(B\): cómo entra la entrada. \(C\): qué se mide.*

**De una ecuación de orden n a estados**

1. Elige como estados la salida y sus derivadas: \(x_1 = y\), \(x_2 = \dot y\), …
2. Escribe \(\dot x_1 = x_2\), \(\dot x_2 = x_3\), … y despeja la última de la ecuación original.
3. Ordénalo en matrices.

#### Ejemplo 1 · A espacio de estados · *Experto*

**Enunciado.** \(\ddot y + 3\dot y + 2y = 4u\).

1. Elige \(x_1 = y\) y \(x_2 = \dot y\).

   **¿Por qué?** Un sistema de segundo orden necesita dos estados. Con la posición y la velocidad se puede predecir el futuro.

2. \(\dot x_1 = x_2\).

   **¿Por qué?** La derivada de \(y\) es \(\dot y\), que es \(x_2\).

3. \(\dot x_2 = \ddot y = -2x_1 - 3x_2 + 4u\).

   **¿Por qué?** Se despeja \(\ddot y\) de la ecuación original.

4. Ordena en matrices.

   \[A = \begin{bmatrix}0 & 1\\ -2 & -3\end{bmatrix},\ B = \begin{bmatrix}0\\4\end{bmatrix},\ C = \begin{bmatrix}1 & 0\end{bmatrix}\]

   **¿Por qué?** Cada fila de \(A\) dice cómo depende cada derivada de los estados.

**Resultado:** Las matrices de arriba, con \(D = 0\)

#### De estados a función de transferencia

\[G(s) = C\,(sI - A)^{-1}B + D\]

#### Demostración

1. Laplace de \(\dot{\mathbf x} = A\mathbf x + Bu\) con condiciones iniciales cero: \(s\mathbf X = A\mathbf X + BU\).
2. \((sI - A)\mathbf X = BU\), así que \(\mathbf X = (sI-A)^{-1}BU\).
3. \(Y = C\mathbf X + DU = \left[C(sI-A)^{-1}B + D\right]U\).
4. Como \((sI-A)^{-1} = \dfrac{\operatorname{adj}(sI-A)}{\det(sI-A)}\), el denominador de \(G\) es \(\det(sI-A)\). Sus raíces son los **valores propios** de \(A\): los polos del sistema son los valores propios de \(A\).

∎

#### Ejemplo 2 · De vuelta a G(s) · *Experto*

> **Qué cambia respecto al anterior:** Se hace el camino inverso.

**Enunciado.** Calcula \(G = C(sI-A)^{-1}B\) con las matrices del Ejemplo 1.

1. \(sI - A = \begin{bmatrix}s & -1\\ 2 & s+3\end{bmatrix}\).

   **¿Por qué?** \(sI\) tiene \(s\) en la diagonal; se le resta \(A\).

2. \(\det = s(s+3) - (-1)(2) = s^2+3s+2\).

   **¿Por qué?** Determinante 2×2: diagonal menos antidiagonal.

3. Inversa: \(\dfrac{1}{s^2+3s+2}\begin{bmatrix}s+3 & 1\\ -2 & s\end{bmatrix}\).

   **¿Por qué?** Para 2×2: intercambia la diagonal, cambia de signo los otros dos y divide por el determinante.

4. \(C\) toma la primera fila, \([s+3,\ 1]\). Por \(B\): \((s+3)\cdot0 + 1\cdot4 = 4\).

   **¿Por qué?** Producto fila por columna.

**Resultado:** \(G = \dfrac{4}{s^2+3s+2}\), la misma de capítulo 5

#### Ejemplo 3 · Masa-resorte en estados · *Experto*

> **Qué cambia respecto al anterior:** Con letras físicas.

**Enunciado.** \(m\ddot x + b\dot x + kx = f\).

1. \(x_1 = x\), \(x_2 = \dot x\).

   **¿Por qué?** Igual que en el Ejemplo 1.

2. \(\dot x_2 = \dfrac{1}{m}(f - bx_2 - kx_1)\).

   **¿Por qué?** Se despeja la aceleración.

**Resultado:** \(A = \begin{bmatrix}0 & 1\\ -k/m & -b/m\end{bmatrix}\), \(B = \begin{bmatrix}0\\ 1/m\end{bmatrix}\)
