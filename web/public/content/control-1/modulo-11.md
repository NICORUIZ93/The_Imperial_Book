# Módulo 11: Sistemas de primer orden y retardo

El sistema más simple: un tanque que se llena, un condensador que se carga o un horno que se calienta. Aprende a leerlo, resolverlo e identificarlo desde una gráfica.

**Al terminar podrás:**

- Leer \(K\) y \(\tau\) de cualquier \(G(s)\) de primer orden.
- Escribir la respuesta al impulso, al escalón y a la rampa.
- Manejar el retardo \(e^{-Ts}\) (punto 3.i del Parcial 1).
- Sacar \(G(s)\) a partir de una curva medida.

## Aprende construyendo

### Tema 1: Forma estándar

**¿Por qué es importante?** La forma estándar de primer orden te deja leer la ganancia y la constante de tiempo sin hacer cuentas.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

\[G(s) = \frac{K}{\tau s+1}\]

*\(K\): ganancia estática, cuánto vale la salida al final por cada unidad de entrada. \(\tau\): constante de tiempo, qué tan lento es. Polo en \(s = -1/\tau\).*

**Cómo llevar cualquier G(s) a la forma estándar**

1. Haz que el término independiente del denominador sea 1: divide arriba y abajo por él.
2. Ejemplo: \(\dfrac{10}{s+5} = \dfrac{10/5}{s/5+1} = \dfrac{2}{0{,}2s+1}\). Entonces \(K=2\) y \(\tau=0{,}2\) s.

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Leer K y τ de \(\frac{5}{2 s + 1}\) · *Básico*

**Enunciado.** Escribe \(G(s) = \frac{5}{2 s + 1}\) en la forma \(\dfrac{K}{\tau s + 1}\).

1. Divide numerador y denominador por el término independiente del denominador (\(1\)).

   **¿Por qué?** La forma estándar exige que el denominador termine en "+1"; así \(K\) y \(\tau\) se leen directamente.

2. \(G(s) = \dfrac{5}{2s + 1}\).

   **¿Por qué?** Es la misma función, solo reescrita.

**Resultado.** \(K = 5\) (valor final ante un escalón unitario) y \(\tau = 2\,\text{s}\); \(t_s \approx 4\tau = 8\,\text{s}\); polo en \(s = -1/\tau = - \frac{1}{2}\).

#### Ejemplo 2 · Leer K y τ de \(\frac{6}{2 s + 4}\) · *Básico*

**Enunciado.** Escribe \(G(s) = \frac{6}{2 s + 4}\) en la forma \(\dfrac{K}{\tau s + 1}\).

1. Divide numerador y denominador por el término independiente del denominador (\(2\)).

   **¿Por qué?** La forma estándar exige que el denominador termine en "+1"; así \(K\) y \(\tau\) se leen directamente.

2. \(G(s) = \dfrac{\frac{3}{2}}{\frac{1}{2}s + 1}\).

   **¿Por qué?** Es la misma función, solo reescrita.

**Resultado.** \(K = \frac{3}{2}\) (valor final ante un escalón unitario) y \(\tau = \frac{1}{2}\,\text{s}\); \(t_s \approx 4\tau = 2\,\text{s}\); polo en \(s = -1/\tau = -2\).

#### Ejemplo 3 · Leer K y τ de \(\frac{10}{s + 5}\) · *Básico*

**Enunciado.** Escribe \(G(s) = \frac{10}{s + 5}\) en la forma \(\dfrac{K}{\tau s + 1}\).

1. Divide numerador y denominador por el término independiente del denominador (\(5\)).

   **¿Por qué?** La forma estándar exige que el denominador termine en "+1"; así \(K\) y \(\tau\) se leen directamente.

2. \(G(s) = \dfrac{2}{\frac{1}{5}s + 1}\).

   **¿Por qué?** Es la misma función, solo reescrita.

**Resultado.** \(K = 2\) (valor final ante un escalón unitario) y \(\tau = \frac{1}{5}\,\text{s}\); \(t_s \approx 4\tau = 0{,}8\,\text{s}\); polo en \(s = -1/\tau = -5\).

#### Ejemplo 4 · Leer K y τ de \(\frac{3}{\frac{s}{2} + 3}\) · *Intermedio*

**Enunciado.** Escribe \(G(s) = \frac{3}{\frac{s}{2} + 3}\) en la forma \(\dfrac{K}{\tau s + 1}\).

1. Divide numerador y denominador por el término independiente del denominador (\(6\)).

   **¿Por qué?** La forma estándar exige que el denominador termine en "+1"; así \(K\) y \(\tau\) se leen directamente.

2. \(G(s) = \dfrac{1}{\frac{1}{6}s + 1}\).

   **¿Por qué?** Es la misma función, solo reescrita.

**Resultado.** \(K = 1\) (valor final ante un escalón unitario) y \(\tau = \frac{1}{6}\,\text{s}\); \(t_s \approx 4\tau = 0{,}667\,\text{s}\); polo en \(s = -1/\tau = -6\).

#### Ejemplo 5 · Leer K y τ de \(\frac{8}{4 s + 2}\) · *Intermedio*

**Enunciado.** Escribe \(G(s) = \frac{8}{4 s + 2}\) en la forma \(\dfrac{K}{\tau s + 1}\).

1. Divide numerador y denominador por el término independiente del denominador (\(1\)).

   **¿Por qué?** La forma estándar exige que el denominador termine en "+1"; así \(K\) y \(\tau\) se leen directamente.

2. \(G(s) = \dfrac{4}{2s + 1}\).

   **¿Por qué?** Es la misma función, solo reescrita.

**Resultado.** \(K = 4\) (valor final ante un escalón unitario) y \(\tau = 2\,\text{s}\); \(t_s \approx 4\tau = 8\,\text{s}\); polo en \(s = -1/\tau = - \frac{1}{2}\).

#### Ejemplo 6 · Leer K y τ de \(\frac{1}{s + \frac{1}{10}}\) · *Intermedio*

**Enunciado.** Escribe \(G(s) = \frac{1}{s + \frac{1}{10}}\) en la forma \(\dfrac{K}{\tau s + 1}\).

1. Divide numerador y denominador por el término independiente del denominador (\(1\)).

   **¿Por qué?** La forma estándar exige que el denominador termine en "+1"; así \(K\) y \(\tau\) se leen directamente.

2. \(G(s) = \dfrac{10}{10s + 1}\).

   **¿Por qué?** Es la misma función, solo reescrita.

**Resultado.** \(K = 10\) (valor final ante un escalón unitario) y \(\tau = 10\,\text{s}\); \(t_s \approx 4\tau = 40\,\text{s}\); polo en \(s = -1/\tau = - \frac{1}{10}\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1.

```python
# verificacion.py
from sympy import symbols, Rational

s = symbols("s")
num, den = 5, 2 * s + 1
tau = den.coeff(s, 1)
K = Rational(num, den.coeff(s, 0))
print("K:", K)
print("tau:", tau)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `K: 5` y `tau: 2`, igual al Ejemplo 1.

**Práctica:** cambia `num, den` por `10, s + 5` y confirma \(K=2\), \(\tau=1/5\) (Ejemplo 3).

**Límite:** esto exige que el denominador sea de primer grado en \(s\); con dos o más polos (segundo orden o mayor) \(K\) sigue siendo \(G(0)\), pero ya no hay un único \(\tau\) — aparecen varias constantes de tiempo (capítulo 13).

### Tema 2: Respuestas

**¿Por qué es importante?** Las respuestas al impulso, al escalón y a la rampa son las que se piden en los exámenes y las que se miden en el laboratorio.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

| Entrada | \(Y(s)\) | \(y(t)\) |
|---|---|---|
| Impulso | \(\dfrac{K}{\tau s+1} = \dfrac{K/\tau}{s+1/\tau}\) | \(\dfrac{K}{\tau}e^{-t/\tau}\) |
| Escalón de amplitud \(A\) | \(\dfrac{AK}{s(\tau s+1)}\) | \(AK\left(1-e^{-t/\tau}\right)\) |
| Rampa \(t\) | \(\dfrac{K}{s^2(\tau s+1)}\) | \(K\left(t - \tau + \tau e^{-t/\tau}\right)\) |

#### Demostración de la respuesta a la rampa

1. \(\dfrac{K}{s^2(\tau s+1)} = \dfrac{A}{s^2} + \dfrac{B}{s} + \dfrac{C}{\tau s+1}\).
2. \(A\): multiplica por \(s^2\) y evalúa en 0: \(A = K\). \(C\): multiplica por \((\tau s+1)\) y evalúa en \(s = -1/\tau\): \(C = K\tau^2\).
3. \(B\) es la derivada de \(\dfrac{K}{\tau s+1}\) en \(s=0\): \(-K\tau\).
4. \(\dfrac{K\tau^2}{\tau s+1} = \dfrac{K\tau}{s+1/\tau} \to K\tau e^{-t/\tau}\). Total: \(K(t - \tau + \tau e^{-t/\tau})\).

∎

![Respuesta al escalón de un sistema de primer orden](content/figures/control-1/primer-orden-escalon.svg)

*Escalón en \(G = \dfrac{5}{2s+1}\). En \(t = \tau\) llega al 63,2 %, en \(2\tau\) al 86,5 %, en \(3\tau\) al 95 % y en \(4\tau\) al 98 % (\(t_s\)).*

| Tiempo | \(\tau\) | \(2\tau\) | \(3\tau\) | \(4\tau\) | \(5\tau\) |
|---|---|---|---|---|---|
| % del valor final | 63,2 | 86,5 | 95,0 | 98,2 | 99,3 |

#### Demostración de la respuesta al escalón y de los porcentajes

1. \(Y = \dfrac{K}{s(\tau s+1)} = \dfrac{K/\tau}{s(s+1/\tau)}\). Tapado: en \(s=0\) da \(K\); en \(s=-1/\tau\) da \(\dfrac{K/\tau}{-1/\tau} = -K\).
2. \(y(t) = K - Ke^{-t/\tau} = K(1-e^{-t/\tau})\).
3. En \(t = n\tau\): \(y/K = 1 - e^{-n}\). Con \(n=1\): \(1 - 0{,}368 = 0{,}632\). Con \(n=4\): \(1 - 0{,}018 = 0{,}982\).
4. Tiempo de establecimiento exacto al 2 %: \(e^{-t/\tau} = 0{,}02 \Rightarrow t = \tau\ln 50 = 3{,}91\tau \approx 4\tau\). Al 5 %: \(\tau\ln20 = 3\tau\).
5. Pendiente inicial: \(y'(0) = \dfrac{K}{\tau}e^{0} = \dfrac{K}{\tau}\). Si la salida siguiera subiendo con esa pendiente, llegaría a \(K\) justo en \(t = \tau\). Es otra forma de leer \(\tau\) en una gráfica: la tangente en el origen corta el valor final en \(t=\tau\).
6. La respuesta al impulso es la derivada de la del escalón: \(\dfrac{d}{dt}K(1-e^{-t/\tau}) = \dfrac{K}{\tau}e^{-t/\tau}\). Tiene sentido: el impulso es la derivada del escalón.

∎

#### Ejemplo 1 · Ya en forma estándar · *Básico*

**Enunciado.** \(G = \dfrac{3}{0{,}5s+1}\). Halla la respuesta al escalón unitario, al impulso y el tiempo de establecimiento.

1. Compara con \(\dfrac{K}{\tau s+1}\): \(K = 3\), \(\tau = 0{,}5\) s.

   **¿Por qué?** Ya está en forma estándar: el término independiente del denominador es 1.

2. Escalón: \(K(1-e^{-t/\tau}) = 3(1-e^{-t/0{,}5}) = 3(1-e^{-2t})\).

   **¿Por qué?** Fórmula demostrada arriba. \(1/0{,}5 = 2\).

3. Impulso: \(\dfrac K\tau e^{-t/\tau} = \dfrac{3}{0{,}5}e^{-2t} = 6e^{-2t}\).

   **¿Por qué?** Es la derivada de la respuesta al escalón.

4. \(t_s = 4\tau = 2\) s.

   **¿Por qué?** En \(4\tau\) la salida está a menos del 2 % del final.

**Resultado:** Escalón \(3(1-e^{-2t})\), impulso \(6e^{-2t}\), \(t_s = 2\) s

#### Ejemplo 2 · Primero hay que llevarlo a la forma estándar · *Básico*

> **Qué cambia respecto al anterior:** La \(G\) no venía en forma estándar.

**Enunciado.** \(G = \dfrac{10}{s+5}\), escalón unitario.

1. El término independiente es 5, no 1. Divide arriba y abajo por 5: \(\dfrac{2}{0{,}2s+1}\).

   **¿Por qué?** Solo en la forma \(\tau s+1\) se pueden leer \(K\) y \(\tau\) directamente.

2. \(K = 2\), \(\tau = 0{,}2\) s.

   **¿Por qué?** Lectura directa.

3. \(y = 2(1-e^{-5t})\), \(t_s = 0{,}8\) s.

   **¿Por qué?** \(1/\tau = 5\).

**Resultado:** \(y(t) = 2(1-e^{-5t})\)

> Error típico: decir que \(\tau = 5\). En realidad \(\tau = 1/5\).

#### Ejemplo 3 · Escalón de amplitud 4 · *Intermedio*

> **Qué cambia respecto al anterior:** La entrada no es unitaria.

**Enunciado.** \(G = \dfrac{2}{3s+1}\) con escalón de 4 V. ¿Cuánto vale la salida en \(t = 3\) s?

1. \(y = 4\cdot K(1-e^{-t/\tau}) = 4\cdot2(1-e^{-t/3}) = 8(1-e^{-t/3})\).

   **¿Por qué?** Un escalón de 4 es 4 veces el unitario; por linealidad la salida también se multiplica por 4.

2. En \(t = 3 = \tau\): \(8(1-e^{-1}) = 8(1-0{,}368) = 8\cdot0{,}632\).

   **¿Por qué?** En una constante de tiempo llega al 63,2 %.

**Resultado:** \(y(3) = 5{,}06\) V

#### Ejemplo 4 · Rampa · *Intermedio*

> **Qué cambia respecto al anterior:** La entrada es una rampa.

**Enunciado.** \(G = \dfrac{1}{s+1}\) con \(r(t) = t\).

1. \(Y = \dfrac{1}{s^2(s+1)}\).

   **¿Por qué?** La rampa es \(1/s^2\).

2. Fracciones: \(\dfrac{1}{s^2} - \dfrac1s + \dfrac{1}{s+1}\).

   **¿Por qué?** Demostración de la rampa (arriba) con \(K = \tau = 1\).

3. \(y = t - 1 + e^{-t}\).

   **¿Por qué?** Tabla.

**Resultado:** La salida sigue a la rampa con 1 unidad de atraso (\(=\tau\))

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 5 · Respuesta de \(\frac{4}{2 s + 1}\) a un escalón de amplitud 3 · *Básico*

**Enunciado.** Halla \(y(t)\) y descríbela.

1. \(Y(s) = \frac{12}{s \left(2 s + 1\right)}\).

   **¿Por qué?** Salida = función de transferencia × transformada de la entrada.

2. Fracciones parciales: \(- \frac{24}{2 s + 1} + \frac{12}{s}\).

   **¿Por qué?** Para invertir con la tabla.

**Resultado.** \(y(t) = 12 - 12 e^{- \frac{t}{2}}\).

#### Ejemplo 6 · Respuesta de \(\frac{5}{s + 5}\) a un impulso unitario · *Básico*

**Enunciado.** Halla \(y(t)\) y descríbela.

1. \(Y(s) = \frac{5}{s + 5}\).

   **¿Por qué?** Salida = función de transferencia × transformada de la entrada.

2. Fracciones parciales: \(\frac{5}{s + 5}\).

   **¿Por qué?** Para invertir con la tabla.

**Resultado.** \(y(t) = 5 e^{- 5 t}\).

#### Ejemplo 7 · Respuesta de \(\frac{2}{s + 2}\) a un rampa unitaria · *Intermedio*

**Enunciado.** Halla \(y(t)\) y descríbela.

1. \(Y(s) = \frac{2}{s^{2} \left(s + 2\right)}\).

   **¿Por qué?** Salida = función de transferencia × transformada de la entrada.

2. Fracciones parciales: \(\frac{1}{2 \left(s + 2\right)} - \frac{1}{2 s} + \frac{1}{s^{2}}\).

   **¿Por qué?** Para invertir con la tabla.

**Resultado.** \(y(t) = t - \frac{1}{2} + \frac{e^{- 2 t}}{2}\).

**Comprobación.** Para \(t\) grande \(y \approx t - 0{,}5\): sigue la rampa con un atraso constante igual a \(\tau = 0{,}5\) s.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar la respuesta al escalón del Ejemplo 1.

```python
# verificacion.py
from sympy import symbols, Rational, inverse_laplace_transform

t, s = symbols("t s", positive=True)
K, tau = 3, Rational(1, 2)
Y = K / (s * (tau * s + 1))
print("y(t):", inverse_laplace_transform(Y, s, t))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `y(t): 3 - 3*exp(-2*t)`, igual a \(3(1-e^{-2t})\) del Ejemplo 1.

**Práctica:** cambia `K, tau` por `1, 1` y la entrada a rampa (`Y = K/(s**2*(tau*s+1))`) y confirma el Ejemplo 4: \(y(t) = t - 1 + e^{-t}\).

**Límite:** `inverse_laplace_transform` asume condiciones iniciales cero y una entrada estándar (impulso, escalón, rampa); con una entrada arbitraria medida en laboratorio hay que calcular su transformada primero, no se puede invertir directamente una señal sin fórmula cerrada.

### Tema 3: Retardo o tiempo muerto

**¿Por qué es importante?** El retardo aparece en procesos reales (bandas, tuberías, hornos) y en el punto 3 del Parcial 1.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

Un factor \(e^{-Ts}\) significa que la misma respuesta empieza \(T\) segundos tarde. Pasa en bandas transportadoras, tuberías largas y procesos térmicos.

**Procedimiento**

1. Ignora el \(e^{-Ts}\) y halla la respuesta sin retardo, \(y_0(t)\).
2. Cambia cada \(t\) por \((t-T)\).
3. Multiplica por \(u(t-T)\): la salida es cero antes de \(T\).

#### Ejemplo 1 · Escalón con retardo · *Intermedio*

> **Qué cambia respecto al anterior:** Aparece un retardo.

**Enunciado.** \(G = \dfrac{2e^{-1{,}5s}}{4s+1}\), escalón unitario.

1. Ignora \(e^{-1{,}5s}\): \(y_0 = 2(1-e^{-t/4})\).

   **¿Por qué?** Primero el sistema sin retardo, como en el Ejemplo 1.

2. Cambia \(t\) por \(t-1{,}5\) y multiplica por \(u(t-1{,}5)\).

   **¿Por qué?** Propiedad del retardo (capítulo 3): la misma respuesta corrida 1,5 s.

**Resultado:** \(y(t) = 2\left(1-e^{-(t-1{,}5)/4}\right)u(t-1{,}5)\)

#### Ejemplo 2 · Impulso con retardo (como el Parcial 1) · *Nivel parcial*

> **Qué cambia respecto al anterior:** Impulso en lugar de escalón.

**Enunciado.** \(G = \dfrac{4e^{-2s}}{5s+1}\), impulso unitario.

1. Sin retardo: \(\dfrac{4}{5s+1} = \dfrac{4/5}{s+1/5} = \dfrac{0{,}8}{s+0{,}2}\).

   **¿Por qué?** Para usar \(\dfrac{1}{s+a}\) el coeficiente de \(s\) tiene que ser 1.

2. \(y_0 = 0{,}8e^{-0{,}2t}\).

   **¿Por qué?** Tabla.

3. Con retardo de 2 s: \(y = 0{,}8e^{-0{,}2(t-2)}u(t-2)\).

   **¿Por qué?** Mismo paso del Ejemplo 5.

**Resultado:** Vale 0 hasta \(t = 2\) s, salta a 0,8 y decae

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 3 · Escalón en \(\dfrac{2e^{-1s}}{5s+1}\) · *Básico*

**Enunciado.** Halla \(y(t)\) ante un escalón unitario y los tiempos característicos.

1. Sin retardo: \(y_0(t) = 2(1 - e^{-t/5})\).

   **¿Por qué?** Respuesta estándar de primer orden.

2. El factor \(e^{-1s}\) desplaza la respuesta \(1\) s a la derecha.

   **¿Por qué?** Propiedad del retardo: \(e^{-Ts}F(s) \to f(t-T)u(t-T)\).

**Resultado.** \(y(t) = 2\left(1 - e^{-(t-1)/5}\right)u(t-1)\): no se mueve hasta \(t=1\), llega al 63 % en \(t = 6\) s y se establece en \(\approx 21\) s.

#### Ejemplo 4 · Escalón en \(\dfrac{\frac{1}{2}e^{-3s}}{10s+1}\) · *Intermedio*

**Enunciado.** Halla \(y(t)\) ante un escalón unitario y los tiempos característicos.

1. Sin retardo: \(y_0(t) = \frac{1}{2}(1 - e^{-t/10})\).

   **¿Por qué?** Respuesta estándar de primer orden.

2. El factor \(e^{-3s}\) desplaza la respuesta \(3\) s a la derecha.

   **¿Por qué?** Propiedad del retardo: \(e^{-Ts}F(s) \to f(t-T)u(t-T)\).

**Resultado.** \(y(t) = \frac{1}{2}\left(1 - e^{-(t-3)/10}\right)u(t-3)\): no se mueve hasta \(t=3\), llega al 63 % en \(t = 13\) s y se establece en \(\approx 43\) s.

#### Ejemplo 5 · Escalón en \(\dfrac{4e^{-\frac{1}{2}s}}{2s+1}\) · *Intermedio*

**Enunciado.** Halla \(y(t)\) ante un escalón unitario y los tiempos característicos.

1. Sin retardo: \(y_0(t) = 4(1 - e^{-t/2})\).

   **¿Por qué?** Respuesta estándar de primer orden.

2. El factor \(e^{-\frac{1}{2}s}\) desplaza la respuesta \(\frac{1}{2}\) s a la derecha.

   **¿Por qué?** Propiedad del retardo: \(e^{-Ts}F(s) \to f(t-T)u(t-T)\).

**Resultado.** \(y(t) = 4\left(1 - e^{-(t-\frac{1}{2})/2}\right)u(t-\frac{1}{2})\): no se mueve hasta \(t=\frac{1}{2}\), llega al 63 % en \(t = 2{,}5\) s y se establece en \(\approx 8{,}5\) s.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 (escalón con retardo).

```python
# verificacion.py
from sympy import symbols, Rational, inverse_laplace_transform

t, s = symbols("t s", positive=True)
K, tau = 2, 4
Y0 = K / (s * (tau * s + 1))
y0 = inverse_laplace_transform(Y0, s, t)
print("y0(t):", y0)
print("y(t) con retardo 1.5 s:", y0.subs(t, t - Rational(3, 2)))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `y0(t): 2 - 2*exp(-t/4)` y `y(t) con retardo 1.5 s: 2 - 2*exp(3/8 - t/4)` (es la misma exponencial corrida: \(3/8 = 1{,}5/4\)), igual al Ejemplo 1 (falta multiplicar por \(u(t-1{,}5)\), que el script no incluye).

**Práctica:** cambia `K, tau` a `4, 5` con retardo `1` s y confirma el Ejemplo 3: \(y(t)=2(1-e^{-(t-1)/5})u(t-1)\).

**Límite:** este script calcula la forma \(y_0(t-T)\) pero no impone que valga cero antes de \(T\); olvidar el factor \(u(t-T)\) a mano (como aquí) es exactamente el error común de esta sección — la expresión sin el escalón unitario predice una salida que no existe antes del retardo.

### Tema 4: Identificación desde una gráfica

**¿Por qué es importante?** Identificar \(K\), \(\tau\) y el retardo desde una curva es como se modela una planta real a partir de un experimento.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

**Procedimiento**

1. Lee el valor final \(y_\infty\) y la amplitud del escalón \(A\). Entonces \(K = y_\infty/A\).
2. Calcula el 63,2 % del valor final y busca en qué tiempo la curva llega ahí. Ese tiempo es \(\tau\), medido desde que empieza a subir.
3. Si la curva tarda en arrancar, ese tiempo es el retardo \(T\).

#### Ejemplo 1 · Identificar desde una gráfica · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se hace el camino inverso: de la curva a \(G\).

**Enunciado.** Un escalón de 2 V da una salida que arranca en \(t = 0{,}5\) s, se estabiliza en 6 V y vale 3,79 V en \(t = 4{,}5\) s.

1. \(K = \dfrac{y_\infty}{A} = \dfrac62 = 3\).

   **¿Por qué?** \(K\) es salida final por unidad de entrada.

2. 63,2 % del final: \(0{,}632\cdot6 = 3{,}79\) V, alcanzado en \(t = 4{,}5\) s.

   **¿Por qué?** En \(t = \tau\) (desde que arranca) la salida vale el 63,2 % del final.

3. Retardo \(T = 0{,}5\) s. Entonces \(\tau = 4{,}5 - 0{,}5 = 4\) s.

   **¿Por qué?** \(\tau\) se mide desde que empieza a subir, no desde 0.

**Resultado:** \(G = \dfrac{3e^{-0{,}5s}}{4s+1}\)

#### Errores comunes

- Leer \(\tau\) sin pasar primero a la forma estándar: en \(\dfrac{10}{s+5}\), \(\tau\) no es 5.
- Olvidar multiplicar por la amplitud del escalón.
- Con retardo, olvidar el \(u(t-T)\): la salida no existe antes de \(T\).
- Medir \(\tau\) desde \(t=0\) cuando la curva tiene retardo.

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Identificar el modelo: valor final 10, 63 % en t = 4 s · *Básico*

**Enunciado.** Ante un escalón unitario la salida llega a 10 y alcanza 6,32 en 4 s. Encuentra el modelo.

1. Ganancia: \(K = \dfrac{y(\infty)}{\text{escalón}} = 10\).

   **¿Por qué?** En régimen permanente \(G(0) = K\).

2. 6,32 es el 63,2 % del final: es el punto de una constante de tiempo. Así \(\tau = 4\) s.

   **¿Por qué?** En primer orden \(y(\tau) = K(1-e^{-1}) \approx 0{,}632K\).

**Resultado.** \(G(s) = \dfrac{10}{4s+1}\).

#### Ejemplo 3 · Identificar el modelo: valor final 2,5, 63 % en t = 12 s · *Básico*

**Enunciado.** Ante un escalón unitario la salida llega a 2,5 y alcanza 1,58 en 12 s. Encuentra el modelo.

1. Ganancia: \(K = \dfrac{y(\infty)}{\text{escalón}} = 2{,}5\).

   **¿Por qué?** En régimen permanente \(G(0) = K\).

2. 1,58 es el 63,2 % del final: es el punto de una constante de tiempo. Así \(\tau = 12\) s.

   **¿Por qué?** En primer orden \(y(\tau) = K(1-e^{-1}) \approx 0{,}632K\).

**Resultado.** \(G(s) = \dfrac{2{,}5}{12s+1}\).

#### Ejemplo 4 · Identificar el modelo: valor final 50, 63 % en t = 0,8 s · *Intermedio*

**Enunciado.** Ante un escalón unitario la salida llega a 50 y alcanza 31,6 en 0,8 s. Encuentra el modelo.

1. Ganancia: \(K = \dfrac{y(\infty)}{\text{escalón}} = 50\).

   **¿Por qué?** En régimen permanente \(G(0) = K\).

2. 31,6 es el 63,2 % del final: es el punto de una constante de tiempo. Así \(\tau = 0{,}8\) s.

   **¿Por qué?** En primer orden \(y(\tau) = K(1-e^{-1}) \approx 0{,}632K\).

**Resultado.** \(G(s) = \dfrac{50}{0{,}8s+1}\).

#### Ejemplo 5 · Identificar el modelo: valor final 3, 63 % en t = 9 s, retardo 2 s · *Intermedio*

**Enunciado.** Ante un escalón unitario la salida llega a 3 y alcanza 1,9 en 9 s; no reacciona antes de 2 s. Encuentra el modelo.

1. Ganancia: \(K = \dfrac{y(\infty)}{\text{escalón}} = 3\).

   **¿Por qué?** En régimen permanente \(G(0) = K\).

2. 1,9 es el 63,3 % del final: es el punto de una constante de tiempo. Se resta el retardo: \(\tau = 9-2 = 7\) s.

   **¿Por qué?** En primer orden \(y(\tau) = K(1-e^{-1}) \approx 0{,}632K\).

**Resultado.** \(G(s) = \dfrac{3e^{-2s}}{7s+1}\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 2 con el método general (no solo el punto del 63,2 %).

```python
# verificacion.py
from sympy import log, Rational

y_inf, A, t_obs, y_obs = 10, 1, 4, Rational(632, 100)
K = y_inf / A
tau = -t_obs / log(1 - y_obs / y_inf)
print("K:", K)
print("tau:", float(tau))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `K: 10.0` y `tau: 4.00...` (≈4, el pequeño error viene de redondear 63,2 %), igual al Ejemplo 2.

**Práctica:** cambia los datos a los del Ejemplo 3 (`y_inf=2.5, t_obs=12, y_obs=1.58`) y confirma \(\tau\approx12\) s.

**Límite:** esta fórmula identifica un modelo de primer orden sin retardo; si la curva tarda en arrancar (Ejemplo 5), primero hay que restar ese retardo \(T\) del tiempo observado antes de aplicar la fórmula, o \(\tau\) saldrá sobreestimado.

**Conexión con el proyecto integrador:** ejecuta `python3 examples/control-1-tanque/simular.py --salida /tmp/control-1-tanque` y abre `tanque-P.csv`. Identifica \(K\) y \(\tau\) con este método usando dos filas cualesquiera de la columna `altura_m` antes del cambio de referencia en \(t=5\) s, y compáralo con el \(G(s)=2/(4s+1)\) que calculaste en el capítulo 9 (módulo 8). Anota ambos valores en tu bitácora.

#### Práctica para resolver sola o solo

- **1.**Impulso y escalón de \(\dfrac{8}{4s+2}\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{4}{2s+1}\): impulso \(2e^{-0{,}5t}\), escalón \(4(1-e^{-0{,}5t})\).
  
  </details>

- **2.**Escalón de \(\dfrac{3e^{-2s}}{s+3}\).
  
  <details><summary>Respuesta</summary>
  
  \(\left(1-e^{-3(t-2)}\right)u(t-2)\).
  
  </details>

- **3.**Con escalón unitario la salida llega a 10 y vale 6,32 en \(t = 0{,}3\) s, sin retardo. Halla \(G\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{10}{0{,}3s+1}\).
  
  </details>

- **4.**Impulso de \(\dfrac{6e^{-s}}{3s+1}\).
  
  <details><summary>Respuesta</summary>
  
  \(2e^{-(t-1)/3}u(t-1)\).
  
  </details>

