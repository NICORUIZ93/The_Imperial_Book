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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Forma canónica de \(\frac{1}{s^{2} + 3 s + 2}\) · *Básico*

**Enunciado.** Escribe una representación en espacio de estados.

1. Elige \(x_1 = y\), \(x_2 = \dot y\), …: cada estado es la derivada del anterior.

   **¿Por qué?** Así una ecuación de orden \(n\) se vuelve \(n\) ecuaciones de primer orden.

2. \(A = \left[\begin{matrix}0 & 1\\-2 & -3\end{matrix}\right],\ B = \left[\begin{matrix}0\\1\end{matrix}\right],\ C = \left[\begin{matrix}1 & 0\end{matrix}\right]\).

   **¿Por qué?** La última fila de \(A\) son los coeficientes del denominador con signo cambiado.

**Resultado.** Comprobación: \(C(sI-A)^{-1}B = \frac{1}{s^{2} + 3 s + 2}\); valores propios de \(A\): \(-1, -2\), que son los polos.

#### Ejemplo 3 · Forma canónica de \(\frac{1}{s^{2} + 4 s + 8}\) · *Básico*

**Enunciado.** Escribe una representación en espacio de estados.

1. Elige \(x_1 = y\), \(x_2 = \dot y\), …: cada estado es la derivada del anterior.

   **¿Por qué?** Así una ecuación de orden \(n\) se vuelve \(n\) ecuaciones de primer orden.

2. \(A = \left[\begin{matrix}0 & 1\\-8 & -4\end{matrix}\right],\ B = \left[\begin{matrix}0\\1\end{matrix}\right],\ C = \left[\begin{matrix}1 & 0\end{matrix}\right]\).

   **¿Por qué?** La última fila de \(A\) son los coeficientes del denominador con signo cambiado.

**Resultado.** Comprobación: \(C(sI-A)^{-1}B = \frac{1}{s^{2} + 4 s + 8}\); valores propios de \(A\): \(-2 - 2 j, -2 + 2 j\), que son los polos.

#### Ejemplo 4 · Forma canónica de \(\frac{1}{s^{3} + 6 s^{2} + 11 s + 6}\) · *Intermedio*

**Enunciado.** Escribe una representación en espacio de estados.

1. Elige \(x_1 = y\), \(x_2 = \dot y\), …: cada estado es la derivada del anterior.

   **¿Por qué?** Así una ecuación de orden \(n\) se vuelve \(n\) ecuaciones de primer orden.

2. \(A = \left[\begin{matrix}0 & 1 & 0\\0 & 0 & 1\\-6 & -11 & -6\end{matrix}\right],\ B = \left[\begin{matrix}0\\0\\1\end{matrix}\right],\ C = \left[\begin{matrix}1 & 0 & 0\end{matrix}\right]\).

   **¿Por qué?** La última fila de \(A\) son los coeficientes del denominador con signo cambiado.

**Resultado.** Comprobación: \(C(sI-A)^{-1}B = \frac{1}{s^{3} + 6 s^{2} + 11 s + 6}\); valores propios de \(A\): \(-1, -2, -3\), que son los polos.

#### Ejemplo 5 · Forma canónica de \(\frac{1}{s^{2} + 9}\) · *Intermedio*

**Enunciado.** Escribe una representación en espacio de estados.

1. Elige \(x_1 = y\), \(x_2 = \dot y\), …: cada estado es la derivada del anterior.

   **¿Por qué?** Así una ecuación de orden \(n\) se vuelve \(n\) ecuaciones de primer orden.

2. \(A = \left[\begin{matrix}0 & 1\\-9 & 0\end{matrix}\right],\ B = \left[\begin{matrix}0\\1\end{matrix}\right],\ C = \left[\begin{matrix}1 & 0\end{matrix}\right]\).

   **¿Por qué?** La última fila de \(A\) son los coeficientes del denominador con signo cambiado.

**Resultado.** Comprobación: \(C(sI-A)^{-1}B = \frac{1}{s^{2} + 9}\); valores propios de \(A\): \(- 3 j, 3 j\), que son los polos.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 2 (forma canónica y valores propios).

```python
# verificacion.py
from sympy import Matrix, symbols, eye, simplify

s = symbols("s")
A = Matrix([[0, 1], [-2, -3]])
B = Matrix([[0], [1]])
C = Matrix([[1, 0]])
G = simplify((C * (s * eye(2) - A).inv() * B)[0])
print("G(s):", G)
print("valores_propios:", A.eigenvals())
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `G(s): 1/(s**2 + 3*s + 2)` y un diccionario de valores propios con `-1` y `-2` (cada uno con multiplicidad 1), igual al Ejemplo 2 (polos \(-1,-2\)); el orden en que sympy los imprime puede variar.

#### Practica

repite con las matrices del Ejemplo 4 (3×3, denominador \(s^3+6s^2+11s+6\)) y confirma que los valores propios son \(-1,-2,-3\). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** `A.eigenvals()` da los polos directamente porque esta representación es la forma canónica controlable; con otra elección de estados, \(A\) cambia de forma pero sus valores propios (los polos) son siempre los mismos.

### Tema 2: De estados a función de transferencia

**¿Por qué es importante?** Pasar de matrices a \(G(s)\) muestra que las dos descripciones son equivalentes y que los polos son los valores propios de \(A\).

**Fuentes oficiales:** [Espacio de estados, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlStateSpace).

\[G(s) = C\,(sI - A)^{-1}B + D\]

#### Demostración

1. Laplace de \(\dot{\mathbf x} = A\mathbf x + Bu\) con condiciones iniciales cero: \(s\mathbf X = A\mathbf X + BU\).
2. \((sI - A)\mathbf X = BU\), así que \(\mathbf X = (sI-A)^{-1}BU\).
3. \(Y = C\mathbf X + DU = \left[C(sI-A)^{-1}B + D\right]U\).
4. Como \((sI-A)^{-1} = \dfrac{\operatorname{adj}(sI-A)}{\det(sI-A)}\), el denominador de \(G\) es \(\det(sI-A)\). Sus raíces son los **valores propios** de \(A\): los polos del sistema son los valores propios de \(A\).

∎

#### Ejemplo 1 · De vuelta a G(s) · *Experto*

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

#### Ejemplo 2 · Masa-resorte en estados · *Experto*

> **Qué cambia respecto al anterior:** Con letras físicas.

**Enunciado.** \(m\ddot x + b\dot x + kx = f\).

1. \(x_1 = x\), \(x_2 = \dot x\).

   **¿Por qué?** Igual que en el Ejemplo 1.

2. \(\dot x_2 = \dfrac{1}{m}(f - bx_2 - kx_1)\).

   **¿Por qué?** Se despeja la aceleración.

**Resultado:** \(A = \begin{bmatrix}0 & 1\\ -k/m & -b/m\end{bmatrix}\), \(B = \begin{bmatrix}0\\ 1/m\end{bmatrix}\)

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 3 · De matrices a función de transferencia · *Intermedio*

**Enunciado.** Con \(A = \left[\begin{matrix}0 & 1\\-5 & -2\end{matrix}\right],\ B = \left[\begin{matrix}0\\1\end{matrix}\right],\ C = \left[\begin{matrix}1 & 0\end{matrix}\right],\ D=0\), halla \(G(s)\).

1. \(sI - A = \left[\begin{matrix}s & -1\\5 & s + 2\end{matrix}\right]\) y \(\det(sI-A) = s^{2} + 2 s + 5\).

   **¿Por qué?** El determinante es el denominador: sus raíces son los polos.

2. \((sI-A)^{-1} = \dfrac{1}{\det}\,\text{adj}(sI-A)\).

   **¿Por qué?** Para 2×2: se intercambian los de la diagonal y se cambia el signo de los otros dos.

**Resultado.** \(G(s) = C(sI-A)^{-1}B = \frac{1}{s^{2} + 2 s + 5}\).

#### Ejemplo 4 · De matrices a función de transferencia · *Intermedio*

**Enunciado.** Con \(A = \left[\begin{matrix}-1 & 0\\1 & -3\end{matrix}\right],\ B = \left[\begin{matrix}1\\0\end{matrix}\right],\ C = \left[\begin{matrix}0 & 1\end{matrix}\right],\ D=0\), halla \(G(s)\).

1. \(sI - A = \left[\begin{matrix}s + 1 & 0\\-1 & s + 3\end{matrix}\right]\) y \(\det(sI-A) = \left(s + 1\right) \left(s + 3\right)\).

   **¿Por qué?** El determinante es el denominador: sus raíces son los polos.

2. \((sI-A)^{-1} = \dfrac{1}{\det}\,\text{adj}(sI-A)\).

   **¿Por qué?** Para 2×2: se intercambian los de la diagonal y se cambia el signo de los otros dos.

**Resultado.** \(G(s) = C(sI-A)^{-1}B = \frac{1}{s^{2} + 4 s + 3}\).

#### Ejemplo 5 · De matrices a función de transferencia · *Avanzado*

**Enunciado.** Con \(A = \left[\begin{matrix}-2 & 1\\0 & -4\end{matrix}\right],\ B = \left[\begin{matrix}0\\2\end{matrix}\right],\ C = \left[\begin{matrix}1 & 1\end{matrix}\right],\ D=0\), halla \(G(s)\).

1. \(sI - A = \left[\begin{matrix}s + 2 & -1\\0 & s + 4\end{matrix}\right]\) y \(\det(sI-A) = \left(s + 2\right) \left(s + 4\right)\).

   **¿Por qué?** El determinante es el denominador: sus raíces son los polos.

2. \((sI-A)^{-1} = \dfrac{1}{\det}\,\text{adj}(sI-A)\).

   **¿Por qué?** Para 2×2: se intercambian los de la diagonal y se cambia el signo de los otros dos.

**Resultado.** \(G(s) = C(sI-A)^{-1}B = \frac{2 \left(s + 3\right)}{s^{2} + 6 s + 8}\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 3.

```python
# verificacion.py
from sympy import Matrix, symbols, eye, simplify

s = symbols("s")
A = Matrix([[0, 1], [-5, -2]])
B = Matrix([[0], [1]])
C = Matrix([[1, 0]])
G = simplify((C * (s * eye(2) - A).inv() * B)[0])
print("G(s):", G)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `G(s): 1/(s**2 + 2*s + 5)`, igual al Ejemplo 3.

#### Practica

repite con las matrices del Ejemplo 5 (\(A=[[-2,1],[0,-4]]\), \(B=[[0],[2]]\), \(C=[[1,1]]\)) y confirma \(\dfrac{2(s+3)}{s^2+6s+8}\). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** la fórmula \(G=C(sI-A)^{-1}B+D\) exige invertir \((sI-A)\) simbólicamente, lo que crece mucho con el tamaño del sistema; para órdenes altos se prefiere calcular solo el polinomio característico \(\det(sI-A)\) y los residuos, no la inversa completa.

