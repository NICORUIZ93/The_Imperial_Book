# Módulo 4: Ecuaciones diferenciales y función de transferencia

Todo sistema físico se describe con una ecuación diferencial. Laplace la convierte en álgebra y de ahí sale la función de transferencia \(G(s)\).

**Al terminar podrás:**

- Pasar una ecuación diferencial a Laplace.
- Obtener \(G(s) = Y(s)/U(s)\) a partir de la ecuación.
- Resolver la ecuación para una entrada dada, con o sin condiciones iniciales.

## Aprende construyendo

### Tema 1: Qué es la función de transferencia

**¿Por qué es importante?** La función de transferencia resume un sistema completo en una fracción; con ella se calcula la salida para cualquier entrada.

> **Idea clave.** \(G(s)\) es la salida dividida por la entrada, en Laplace, con condiciones iniciales cero. Describe al sistema sin importar qué entrada le pongas.

\[G(s) = \frac{Y(s)}{U(s)} \qquad\Longrightarrow\qquad Y(s) = G(s)\,U(s)\]

- **Polos:** raíces del denominador. Deciden la forma de la respuesta (si oscila, si se apaga, qué tan rápido).
- **Ceros:** raíces del numerador. Modifican cuánto pesa cada término.
- **Orden:** el grado del denominador.
- **Ganancia estática:** \(G(0)\), el valor final ante escalón unitario.

**De la ecuación a G(s)**

1. Cambia cada derivada por una potencia de \(s\): \(y' \to sY\), \(y'' \to s^2Y\) (condiciones iniciales cero).
2. Agrupa todo lo que tiene \(Y\) a un lado y lo que tiene \(U\) al otro.
3. Despeja \(Y/U\).

#### Demostración · por qué G(s) no depende de la entrada

1. Toda ecuación lineal de coeficientes constantes tiene la forma \(a_n y^{(n)} + \cdots + a_1\dot y + a_0 y = b_m u^{(m)} + \cdots + b_0 u\).
2. Con condiciones iniciales cero, cada derivada \(k\)-ésima se vuelve \(s^k\) (propiedad de la derivada, capítulo 3): \((a_ns^n + \cdots + a_0)Y(s) = (b_ms^m + \cdots + b_0)U(s)\).
3. Despejando: \(\dfrac{Y}{U} = \dfrac{b_ms^m + \cdots + b_0}{a_ns^n + \cdots + a_0}\). Solo aparecen los coeficientes del sistema, no la entrada.
4. Además, como \(\mathcal{L}\{\delta\} = 1\), la respuesta al impulso es \(g(t) = \mathcal{L}^{-1}\{G(s)\}\): la función de transferencia es la transformada de la respuesta al impulso.

∎

> **Respuesta libre y forzada:** si hay condiciones iniciales, la salida es la suma de dos partes: la que causa la entrada (\(G\cdot U\)) y la que causan las condiciones iniciales. \(G(s)\) solo describe la primera.

#### Ejemplo 1 · Primer orden · *Básico*

**Enunciado.** Halla \(G(s)\) de \(2\dot y + 6y = 12u\) y la respuesta a un escalón unitario.

1. Pasa a Laplace: \(\dot y \to sY\), \(y \to Y\), \(u \to U\).

   \[2sY + 6Y = 12U\]

   **¿Por qué?** Con condiciones iniciales cero, derivar es multiplicar por \(s\) (capítulo 3).

2. Saca \(Y\) como factor común: \(Y(2s+6) = 12U\).

   **¿Por qué?** Queremos \(Y/U\), así que \(Y\) tiene que quedar sola.

3. Divide: \(G(s) = \dfrac{Y}{U} = \dfrac{12}{2s+6}\). Simplifica dividiendo todo por 2: \(\dfrac{6}{s+3}\).

   **¿Por qué?** Simplificar deja el polo a la vista: \(s = -3\).

4. Escalón: \(Y = \dfrac{6}{s(s+3)}\). Es el Ejemplo 1 de capítulo 4: \(y = 2(1-e^{-3t})\).

   **¿Por qué?** Ya sabemos invertir esa forma.

**Resultado:** \(G(s) = \dfrac{6}{s+3}\), \(y(t) = 2(1-e^{-3t})\)

#### Ejemplo 2 · Con condición inicial · *Básico*

> **Qué cambia respecto al anterior:** No hay entrada; lo que mueve al sistema es la condición inicial.

**Enunciado.** Resuelve \(\dot y + 2y = 0\) con \(y(0) = 5\).

1. Laplace con condición inicial: \(\dot y \to sY - y(0) = sY - 5\).

   **¿Por qué?** Ahora \(y(0)\) no es cero, así que se usa la propiedad completa de la derivada.

2. \(sY - 5 + 2Y = 0 \Rightarrow Y(s+2) = 5 \Rightarrow Y = \dfrac{5}{s+2}\).

   **¿Por qué?** Despejar \(Y\).

3. Tabla: \(5e^{-2t}\).

   **¿Por qué?** Forma \(\dfrac{1}{s+a}\).

**Resultado:** \(y(t) = 5e^{-2t}\): la salida parte de 5 y se descarga sola

#### Ejemplo 3 · Segundo orden · *Intermedio*

> **Qué cambia respecto al anterior:** La ecuación tiene segunda derivada.

**Enunciado.** Halla \(G(s)\) de \(\ddot y + 3\dot y + 2y = 4u\) y sus polos.

1. \(\ddot y \to s^2Y\), \(\dot y \to sY\).

   \[s^2Y + 3sY + 2Y = 4U\]

   **¿Por qué?** Cada derivada es un factor \(s\); la segunda derivada es \(s^2\).

2. \(G(s) = \dfrac{4}{s^2+3s+2}\).

   **¿Por qué?** Mismo despeje del Ejemplo 1.

3. Factoriza: \(s^2+3s+2 = (s+1)(s+2)\). Polos \(-1\) y \(-2\). Ganancia \(G(0) = 4/2 = 2\).

   **¿Por qué?** Dos números que sumen 3 y multipliquen 2.

**Resultado:** \(G(s) = \dfrac{4}{(s+1)(s+2)}\)

#### Ejemplo 4 · Un sistema físico · *Intermedio*

> **Qué cambia respecto al anterior:** Los coeficientes ahora tienen significado físico.

**Enunciado.** Masa \(m = 1\) kg, resorte \(k = 20\) N/m, amortiguador \(b = 4\) N·s/m: \(m\ddot x + b\dot x + kx = f\). Halla \(X/F\).

1. Laplace: \((ms^2 + bs + k)X = F\).

   **¿Por qué?** Igual que en el Ejemplo 3, con letras.

2. \(G = \dfrac{1}{s^2+4s+20}\).

   **¿Por qué?** Se reemplazan los valores.

3. Polos con el atajo de capítulo 2: \(-4/2 = -2\) y \(\sqrt{20-4} = 4\): \(-2\pm4j\).

   **¿Por qué?** \(\Delta < 0\): oscila.

4. \(G(0) = 1/20 = 0{,}05\) m/N.

   **¿Por qué?** Con 1 N, la masa termina desplazada 5 cm.

**Resultado:** \(G = \dfrac{1}{s^2+4s+20}\), polos \(-2\pm4j\)

#### Ejemplo 5 · Resolver completa · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se pide \(y(t)\) completo: se juntan capítulo 4 y capítulo 5.

**Enunciado.** Resuelve \(\ddot y + 4\dot y + 13y = 26u(t)\), condiciones iniciales cero.

1. \(Y = \dfrac{26}{s(s^2+4s+13)}\).

   **¿Por qué?** \(G = \dfrac{26}{s^2+4s+13}\) por el escalón \(1/s\).

2. \(A = \dfrac{26}{13} = 2\). Resto \(= \dfrac{26 - 2(s^2+4s+13)}{s(\ldots)} = \dfrac{-2s^2-8s}{s(\ldots)} = \dfrac{-2(s+4)}{s^2+4s+13}\).

   **¿Por qué?** Mismo método del Ejemplo 8 de capítulo 4.

3. Completa: \((s+2)^2+9\) y \(s+4 = (s+2)+2\).

   **¿Por qué?** \(a = 2\), \(\omega = 3\).

4. \(-2\dfrac{s+2}{(\ldots)} \to -2e^{-2t}\cos3t\); \(-2\cdot\dfrac{2}{(\ldots)} = -\dfrac43\cdot\dfrac{3}{(\ldots)} \to -\tfrac43e^{-2t}\sin3t\).

   **¿Por qué?** El seno necesita \(\omega = 3\) arriba.

**Resultado:** \(y(t) = 2\left[1 - e^{-2t}\left(\cos3t + \tfrac23\sin3t\right)\right]\)

#### Errores comunes

- Dejar \(G(s)\) sin simplificar, por ejemplo \(\dfrac{12}{2s+6}\) en lugar de \(\dfrac{6}{s+3}\): así es fácil equivocar el polo.
- Olvidar la condición inicial cuando el ejercicio la da.

### Tema 2: Práctica

**¿Por qué es importante?** Pasar de la ecuación a \(G(s)\) y resolverla te prepara para modelar circuitos y sistemas físicos.

- **1.**\(G(s)\) de \(5\dot y + y = 3u\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{3}{5s+1}\): \(K=3\), \(\tau=5\).
  
  </details>

- **2.**\(G(s)\) y polos de \(\ddot y + 6\dot y + 25 y = 50u\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{50}{s^2+6s+25}\), polos \(-3\pm4j\), ganancia 2.
  
  </details>

- **3.**Resuelve \(\dot y + 4y = 8\) (escalón de amplitud 8), \(y(0)=0\).
  
  <details><summary>Respuesta</summary>
  
  \(Y = \dfrac{8}{s(s+4)}\): \(y = 2(1-e^{-4t})\).
  
  </details>
