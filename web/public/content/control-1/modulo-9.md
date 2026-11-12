# Módulo 9: Linealización

Todo lo que ves en este curso supone sistemas lineales. Los reales casi nunca lo son (un tanque que se vacía por gravedad, un péndulo). Linealizar es aproximarlos por una recta alrededor del punto donde trabajan.

**Al terminar podrás:**

- Encontrar un punto de equilibrio.
- Linealizar con la serie de Taylor y obtener una \(G(s)\) válida cerca de ese punto.

## Aprende construyendo

### Tema 1: La idea

**¿Por qué es importante?** Casi ningún sistema real es lineal; linealizar alrededor del punto de operación es lo que permite usar todo este curso con ellos.

**Fuentes oficiales:** [Espacio de estados, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlStateSpace).

> **Idea clave.** Cerca de un punto, cualquier curva suave se parece a su recta tangente. Si el sistema trabaja con variaciones pequeñas alrededor de ese punto, la recta basta.

\[f(x) \approx f(x_0) + f'(x_0)\,(x - x_0)\]

*Serie de Taylor cortada en el primer término. Con dos variables: \(f(x,u) \approx f(x_0,u_0) + \dfrac{\partial f}{\partial x}\delta x + \dfrac{\partial f}{\partial u}\delta u\).*

**Procedimiento**

1. Escribe la ecuación no lineal \(\dot x = f(x,u)\).
2. Halla el equilibrio: \(f(x_0,u_0) = 0\) (nada cambia).
3. Define desviaciones \(\delta x = x - x_0\), \(\delta u = u - u_0\).
4. \(\dot{\delta x} = \dfrac{\partial f}{\partial x}\Big|_0\delta x + \dfrac{\partial f}{\partial u}\Big|_0\delta u\). Ya es lineal: aplica Laplace.

#### Ejemplo 1 · Tanque con salida libre · *Experto*

**Enunciado.** \(A\dot h = q_i - k\sqrt h\), con \(A = 1\) m², \(k = 0{,}5\). Linealiza alrededor de \(h_0 = 4\) m.

1. Equilibrio: \(\dot h = 0 \Rightarrow q_{i0} = k\sqrt{h_0} = 0{,}5\cdot2 = 1\) m³/s.

   **¿Por qué?** En equilibrio nada cambia: lo que entra es igual a lo que sale.

2. Lo no lineal es \(k\sqrt h\). Su pendiente: \(\dfrac{d}{dh}k\sqrt h = \dfrac{k}{2\sqrt h}\). En \(h_0 = 4\): \(\dfrac{0{,}5}{4} = 0{,}125\).

   **¿Por qué?** Se reemplaza la curva por su recta tangente, y la pendiente de la tangente es la derivada.

3. Ecuación en desviaciones: \(A\,\dot{\delta h} = \delta q_i - 0{,}125\,\delta h\).

   **¿Por qué?** Taylor: \(k\sqrt h \approx k\sqrt{h_0} + 0{,}125\,\delta h\), y los términos de equilibrio se cancelan.

4. Laplace: \((s + 0{,}125)\Delta H = \Delta Q_i\), es decir \(\dfrac{\Delta H}{\Delta Q_i} = \dfrac{8}{8s+1}\).

   **¿Por qué?** Se multiplica arriba y abajo por 8 para tener la forma \(\dfrac{K}{\tau s+1}\).

**Resultado:** \(\dfrac{8}{8s+1}\): vale solo cerca de 4 m

#### Ejemplo 2 · Péndulo · *Experto*

> **Qué cambia respecto al anterior:** La no linealidad está en un seno, no en una raíz.

**Enunciado.** \(mL^2\ddot\theta + mgL\sin\theta = T\). Linealiza alrededor de \(\theta_0 = 0\).

1. Para ángulos pequeños, \(\sin\theta \approx \theta\).

   **¿Por qué?** Taylor de \(\sin\) en 0: \(\sin0 + \cos0\cdot\theta = \theta\).

2. \(mL^2\ddot\theta + mgL\theta = T\). Laplace: \(\dfrac{\Theta}{T} = \dfrac{1/(mL^2)}{s^2+g/L}\).

   **¿Por qué?** Ya es lineal.

3. Polos \(\pm j\sqrt{g/L}\).

   **¿Por qué?** Oscila sin amortiguamiento: no hay fricción en el modelo.

**Resultado:** Oscilador con \(\omega_n = \sqrt{g/L}\). Si se linealiza en \(\theta_0 = \pi\) (invertido), aparece un polo positivo: inestable

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 3 · Linealizar \(\sin{\left(x \right)}\) en \(0\) · *Básico*

**Enunciado.** Linealiza \(\sin{\left(x \right)}\) alrededor de \(x_0 = 0\) (péndulo cerca de la vertical inferior).

1. Valor en el punto: \(f(x_0) = 0\).

   **¿Por qué?** La aproximación lineal pasa por el punto de operación.

2. Pendiente: \(f'(x_0) = 1\).

   **¿Por qué?** La recta tangente es la mejor aproximación lineal cerca del punto (Taylor de primer orden).

**Resultado.** \(f(x) \approx 0 + 1\,\delta x\), con \(\delta x = x - x_0\) pequeño.

#### Ejemplo 4 · Linealizar \(\sin{\left(x \right)}\) en \(\pi\) · *Intermedio*

**Enunciado.** Linealiza \(\sin{\left(x \right)}\) alrededor de \(x_0 = \pi\) (péndulo invertido (cerca de la vertical superior)).

1. Valor en el punto: \(f(x_0) = 0\).

   **¿Por qué?** La aproximación lineal pasa por el punto de operación.

2. Pendiente: \(f'(x_0) = -1\).

   **¿Por qué?** La recta tangente es la mejor aproximación lineal cerca del punto (Taylor de primer orden).

**Resultado.** \(f(x) \approx 0 + -1\,\delta x\), con \(\delta x = x - x_0\) pequeño.

#### Ejemplo 5 · Linealizar \(\sqrt{x}\) en \(4\) · *Intermedio*

**Enunciado.** Linealiza \(\sqrt{x}\) alrededor de \(x_0 = 4\) (salida de un tanque \(q = k\sqrt{h}\) con \(h_0 = 4\)).

1. Valor en el punto: \(f(x_0) = 2\).

   **¿Por qué?** La aproximación lineal pasa por el punto de operación.

2. Pendiente: \(f'(x_0) = \frac{1}{4}\).

   **¿Por qué?** La recta tangente es la mejor aproximación lineal cerca del punto (Taylor de primer orden).

**Resultado.** \(f(x) \approx 2 + \frac{1}{4}\,\delta x\), con \(\delta x = x - x_0\) pequeño.

#### Ejemplo 6 · Linealizar \(x^{2}\) en \(3\) · *Básico*

**Enunciado.** Linealiza \(x^{2}\) alrededor de \(x_0 = 3\) (potencia en una resistencia \(P = v^2/R\) con \(v_0 = 3\)).

1. Valor en el punto: \(f(x_0) = 9\).

   **¿Por qué?** La aproximación lineal pasa por el punto de operación.

2. Pendiente: \(f'(x_0) = 6\).

   **¿Por qué?** La recta tangente es la mejor aproximación lineal cerca del punto (Taylor de primer orden).

**Resultado.** \(f(x) \approx 9 + 6\,\delta x\), con \(\delta x = x - x_0\) pequeño.

