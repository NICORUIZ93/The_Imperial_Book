# Módulo 13: Polos dominantes, polos adicionales y ceros

Las fórmulas de \(M_p\), \(t_p\) y \(t_s\) son exactas solo para el segundo orden puro. Aquí aprendes cuándo puedes usarlas en sistemas más grandes y qué hacen los ceros.

**Al terminar podrás:**

- Identificar los polos dominantes y aproximar un sistema de orden alto por uno de segundo orden.
- Explicar el efecto de un cero sobre el sobrepico.
- Reconocer un cero de fase no mínima (respuesta inversa).

## Aprende construyendo

### Tema 1: Polos dominantes

**¿Por qué es importante?** Los sistemas reales tienen más de dos polos; saber cuáles dominan te deja usar las fórmulas de segundo orden con confianza.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

> **Idea clave.** Cada polo aporta un término \(e^{pt}\). Los polos muy a la izquierda se apagan rápido y dejan de importar. Los que quedan cerca del eje imaginario dominan la respuesta.

> **Regla práctica:** si un polo está al menos 5 veces más a la izquierda que los dominantes (\(|\text{Re}| \ge 5\sigma\)), se puede despreciar. Al quitarlo, conserva la ganancia estática.

#### Demostración · por qué el polo lejano casi no aporta

1. Considera \(G = \dfrac{100}{(s+10)(s^2+2s+10)}\) (ganancia estática \(100/100 = 1\)). Con escalón, el residuo del polo en \(-10\) es \(\dfrac{100}{(-10)\left((-10)^2 - 20 + 10\right)} = \dfrac{100}{-900} = -0{,}111\).
2. Ese término es \(-0{,}111\,e^{-10t}\): pequeño desde el inicio y en \(t = 0{,}5\) s ya vale \(-0{,}0007\).
3. Los polos \(-1\pm3j\) aportan \(e^{-t}\): siguen vivos hasta \(t\approx4\) s. Ellos definen la forma.

∎

#### Ejemplo 1 · Aproximar por polos dominantes · *Nivel parcial*

**Enunciado.** \(G = \dfrac{100}{(s+10)(s^2+2s+10)}\). Aproxima por un segundo orden.

1. Polos: \(-10\) y \(-1\pm3j\). Compara las partes reales: \(10\) frente a \(1\).

   **¿Por qué?** La parte real dice qué tan rápido se apaga cada término.

2. \(10 \ge 5\cdot1\): el polo en \(-10\) se puede despreciar.

   **¿Por qué?** Regla práctica de 5 veces.

3. Quita \((s+10)\) y ajusta la ganancia para conservar \(G(0) = \dfrac{100}{10\cdot10} = 1\): \(\dfrac{10}{s^2+2s+10}\).

   **¿Por qué?** Si solo borras el factor, cambias el valor final. Por eso se ajusta el numerador.

4. Aproximado: \(\zeta = \dfrac{2}{2\sqrt{10}} = 0{,}316\), \(M_p = 35{,}1\,\%\). Exacto: \(33{,}2\,\%\).

   **¿Por qué?** Comparar confirma que la aproximación funciona.

**Resultado:** Error de unos 2 puntos en \(M_p\)

![Sistema de tercer orden frente a su aproximación de segundo orden](content/figures/control-1/polos-dominantes.svg)

*Azul: sistema de tercer orden exacto. Naranja: aproximación de segundo orden. Casi coinciden.*

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · ¿Es dominante el par complejo si el tercer polo está en −20? · *Básico*

**Enunciado.** \(G(s) = \frac{100}{\left(s + 20\right) \left(s^{2} + 2 s + 5\right)}\). ¿Se puede aproximar por el par \(-1\pm2j\)?

1. Parte real del par: −1. Tercer polo: \(-20\), 20 veces más a la izquierda.

   **¿Por qué?** La regla práctica pide que el polo lejano esté al menos 5 veces más a la izquierda: su exponencial se apaga mucho antes.

2. Aproximación (conservando la ganancia DC): \(G(s) \approx \dfrac{5}{s^2+2s+5}\).

   **¿Por qué?** Se quita el factor \((s+p)\) y se divide la ganancia por \(p\) para que \(G(0)\) no cambie.

**Resultado.** La aproximación es **buena**: \(M_p \approx 20{,}8\,\%\) y \(t_s \approx 4\) s.

#### Ejemplo 3 · ¿Es dominante el par complejo si el tercer polo está en −10? · *Intermedio*

**Enunciado.** \(G(s) = \frac{50}{\left(s + 10\right) \left(s^{2} + 2 s + 5\right)}\). ¿Se puede aproximar por el par \(-1\pm2j\)?

1. Parte real del par: −1. Tercer polo: \(-10\), 10 veces más a la izquierda.

   **¿Por qué?** La regla práctica pide que el polo lejano esté al menos 5 veces más a la izquierda: su exponencial se apaga mucho antes.

2. Aproximación (conservando la ganancia DC): \(G(s) \approx \dfrac{5}{s^2+2s+5}\).

   **¿Por qué?** Se quita el factor \((s+p)\) y se divide la ganancia por \(p\) para que \(G(0)\) no cambie.

**Resultado.** La aproximación es **buena**: \(M_p \approx 20{,}8\,\%\) y \(t_s \approx 4\) s.

#### Ejemplo 4 · ¿Es dominante el par complejo si el tercer polo está en −4? · *Intermedio*

**Enunciado.** \(G(s) = \frac{20}{\left(s + 4\right) \left(s^{2} + 2 s + 5\right)}\). ¿Se puede aproximar por el par \(-1\pm2j\)?

1. Parte real del par: −1. Tercer polo: \(-4\), 4 veces más a la izquierda.

   **¿Por qué?** La regla práctica pide que el polo lejano esté al menos 5 veces más a la izquierda: su exponencial se apaga mucho antes.

2. Aproximación (conservando la ganancia DC): \(G(s) \approx \dfrac{5}{s^2+2s+5}\).

   **¿Por qué?** Se quita el factor \((s+p)\) y se divide la ganancia por \(p\) para que \(G(0)\) no cambie.

**Resultado.** La aproximación **no es confiable**: el tercer polo está cerca y vuelve la respuesta más lenta y con menos sobrepico que lo que predicen las fórmulas.

#### Ejemplo 5 · ¿Es dominante el par complejo si el tercer polo está en −50? · *Básico*

**Enunciado.** \(G(s) = \frac{250}{\left(s + 50\right) \left(s^{2} + 2 s + 5\right)}\). ¿Se puede aproximar por el par \(-1\pm2j\)?

1. Parte real del par: −1. Tercer polo: \(-50\), 50 veces más a la izquierda.

   **¿Por qué?** La regla práctica pide que el polo lejano esté al menos 5 veces más a la izquierda: su exponencial se apaga mucho antes.

2. Aproximación (conservando la ganancia DC): \(G(s) \approx \dfrac{5}{s^2+2s+5}\).

   **¿Por qué?** Se quita el factor \((s+p)\) y se divide la ganancia por \(p\) para que \(G(0)\) no cambie.

**Resultado.** La aproximación es **buena**: \(M_p \approx 20{,}8\,\%\) y \(t_s \approx 4\) s.

#### Ejemplo 6 · ¿Es dominante el par complejo si el tercer polo está en −3? · *Avanzado*

**Enunciado.** \(G(s) = \frac{15}{\left(s + 3\right) \left(s^{2} + 2 s + 5\right)}\). ¿Se puede aproximar por el par \(-1\pm2j\)?

1. Parte real del par: −1. Tercer polo: \(-3\), 3 veces más a la izquierda.

   **¿Por qué?** La regla práctica pide que el polo lejano esté al menos 5 veces más a la izquierda: su exponencial se apaga mucho antes.

2. Aproximación (conservando la ganancia DC): \(G(s) \approx \dfrac{5}{s^2+2s+5}\).

   **¿Por qué?** Se quita el factor \((s+p)\) y se divide la ganancia por \(p\) para que \(G(0)\) no cambie.

**Resultado.** La aproximación **no es confiable**: el tercer polo está cerca y vuelve la respuesta más lenta y con menos sobrepico que lo que predicen las fórmulas.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar la aproximación del Ejemplo 1.

```python
# verificacion.py
from sympy import sqrt, exp, pi, N

wn = sqrt(10)
zeta = 2 / (2 * wn)
Mp = N(exp(-zeta * pi / sqrt(1 - zeta ** 2)) * 100, 3)
print("zeta:", N(zeta, 3))
print("Mp_approx%:", Mp)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `zeta: 0.316` y `Mp_approx%: 35.1`, igual a la aproximación del Ejemplo 1 (el valor exacto es 33,2 %; el error es de unos 2 puntos).

**Práctica:** repite el cálculo del Ejemplo 6 (tercer polo en \(-3\), solo 3 veces más a la izquierda) y observa por qué el enunciado dice que esa aproximación **no es confiable**.

**Límite:** la regla de "5 veces más a la izquierda" es heurística, no exacta; con una relación de 3 a 4 veces (Ejemplos 4 y 6) el error ya es significativo, así que siempre conviene comparar contra la respuesta exacta antes de confiar en la aproximación.

### Tema 2: Efecto de un cero

**¿Por qué es importante?** Un cero cambia el sobrepico aunque los polos sean los mismos; ignorarlo lleva a diseños que se pasan.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

Un cero en \(-a\) se puede escribir como \(G_z = \left(1 + \dfrac{s}{a}\right)G_0\), donde \(G_0\) es el sistema sin cero.

#### Demostración · el cero suma la derivada

\(Y = \left(1+\dfrac sa\right)G_0R = G_0R + \dfrac1a\,sG_0R\). Multiplicar por \(s\) es derivar, así que \(y(t) = y_0(t) + \dfrac1a\,y_0'(t)\). La salida es la original más una porción de su derivada. La derivada es positiva mientras la curva sube, así que el pico se adelanta y crece. Cuanto más cerca del origen esté el cero (\(a\) pequeño), más pesa la derivada.

∎

| Sistema base \(\omega_n = 2\), \(\zeta = 0{,}5\) | \(M_p\) | \(t_p\) |
|---|---|---|
| Sin cero | 16,3 % | 1,81 s |
| Cero en \(-4\) | 19,1 % | 1,51 s |
| Cero en \(-1\) | 69,9 % | 0,91 s |
| Cero en \(-0{,}5\) | 171 % | 0,74 s |

![Efecto de un cero sobre el sobrepico](content/figures/control-1/efecto-cero.svg)

*Mismos polos, distinto cero. Cuanto más cerca del origen, más sobrepico.*

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Efecto de un cero en s = −10 · *Básico*

**Enunciado.** \(G(s) = \frac{\frac{2 s}{5} + 4}{s^{2} + 2 s + 4}\) tiene los mismos polos que \(\dfrac{4}{s^2+2s+4}\) (\(\zeta = 0{,}5\), \(M_p = 16{,}3\,\%\)). ¿Qué sobrepico tiene?

1. La respuesta con cero es la sin cero más una fracción de su derivada: \(y = y_0 + \tfrac1a\dot y_0\).

   **¿Por qué?** Multiplicar por \((s+a)/a\) en \(s\) suma \(1/a\) veces la derivada en el tiempo.

2. Cuanto más cerca del origen está el cero (más pequeño \(a\)), más pesa la derivada, que es grande al principio.

   **¿Por qué?** Por eso un cero cercano aumenta el sobrepico y adelanta el pico.

**Resultado.** Sobrepico ≈ 16,7 % (casi igual al de los polos solos).

#### Ejemplo 2 · Efecto de un cero en s = −2 · *Intermedio*

**Enunciado.** \(G(s) = \frac{2 s + 4}{s^{2} + 2 s + 4}\) tiene los mismos polos que \(\dfrac{4}{s^2+2s+4}\) (\(\zeta = 0{,}5\), \(M_p = 16{,}3\,\%\)). ¿Qué sobrepico tiene?

1. La respuesta con cero es la sin cero más una fracción de su derivada: \(y = y_0 + \tfrac1a\dot y_0\).

   **¿Por qué?** Multiplicar por \((s+a)/a\) en \(s\) suma \(1/a\) veces la derivada en el tiempo.

2. Cuanto más cerca del origen está el cero (más pequeño \(a\)), más pesa la derivada, que es grande al principio.

   **¿Por qué?** Por eso un cero cercano aumenta el sobrepico y adelanta el pico.

**Resultado.** Sobrepico ≈ 29,8 % (mayor que el 16,3 % de los polos solos).

#### Ejemplo 3 · Efecto de un cero en s = −1 · *Intermedio*

**Enunciado.** \(G(s) = \frac{4 s + 4}{s^{2} + 2 s + 4}\) tiene los mismos polos que \(\dfrac{4}{s^2+2s+4}\) (\(\zeta = 0{,}5\), \(M_p = 16{,}3\,\%\)). ¿Qué sobrepico tiene?

1. La respuesta con cero es la sin cero más una fracción de su derivada: \(y = y_0 + \tfrac1a\dot y_0\).

   **¿Por qué?** Multiplicar por \((s+a)/a\) en \(s\) suma \(1/a\) veces la derivada en el tiempo.

2. Cuanto más cerca del origen está el cero (más pequeño \(a\)), más pesa la derivada, que es grande al principio.

   **¿Por qué?** Por eso un cero cercano aumenta el sobrepico y adelanta el pico.

**Resultado.** Sobrepico ≈ 69,9 % (mayor que el 16,3 % de los polos solos).

#### Ejemplo 4 · Efecto de un cero en s = −0,5 · *Avanzado*

**Enunciado.** \(G(s) = \frac{8 s + 4}{s^{2} + 2 s + 4}\) tiene los mismos polos que \(\dfrac{4}{s^2+2s+4}\) (\(\zeta = 0{,}5\), \(M_p = 16{,}3\,\%\)). ¿Qué sobrepico tiene?

1. La respuesta con cero es la sin cero más una fracción de su derivada: \(y = y_0 + \tfrac1a\dot y_0\).

   **¿Por qué?** Multiplicar por \((s+a)/a\) en \(s\) suma \(1/a\) veces la derivada en el tiempo.

2. Cuanto más cerca del origen está el cero (más pequeño \(a\)), más pesa la derivada, que es grande al principio.

   **¿Por qué?** Por eso un cero cercano aumenta el sobrepico y adelanta el pico.

**Resultado.** Sobrepico ≈ 171,2 % (mayor que el 16,3 % de los polos solos).

#### Ejemplo 5 · Efecto de un cero en s = −5 · *Básico*

**Enunciado.** \(G(s) = \frac{\frac{4 s}{5} + 4}{s^{2} + 2 s + 4}\) tiene los mismos polos que \(\dfrac{4}{s^2+2s+4}\) (\(\zeta = 0{,}5\), \(M_p = 16{,}3\,\%\)). ¿Qué sobrepico tiene?

1. La respuesta con cero es la sin cero más una fracción de su derivada: \(y = y_0 + \tfrac1a\dot y_0\).

   **¿Por qué?** Multiplicar por \((s+a)/a\) en \(s\) suma \(1/a\) veces la derivada en el tiempo.

2. Cuanto más cerca del origen está el cero (más pequeño \(a\)), más pesa la derivada, que es grande al principio.

   **¿Por qué?** Por eso un cero cercano aumenta el sobrepico y adelanta el pico.

**Resultado.** Sobrepico ≈ 18 % (casi igual al de los polos solos).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar la identidad \(G_z=(1+s/a)G_0\) del Ejemplo 3 (cero en \(-1\)).

```python
# verificacion.py
from sympy import symbols, simplify

s = symbols("s")
a = 1
G0 = 4 / (s ** 2 + 2 * s + 4)
Gz = (1 + s / a) * G0
print("Gz simplificada:", simplify(Gz))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `Gz simplificada: 4*(s + 1)/(s**2 + 2*s + 4)`, que es \(\dfrac{4s+4}{s^2+2s+4}\) del Ejemplo 3.

**Práctica:** cambia `a` a `10` y confirma que da \(\dfrac{2s}{5}+4\) sobre el mismo denominador (Ejemplo 1, cero lejano con casi ningún efecto en \(M_p\)).

**Límite:** esta fórmula asume un cero real simple en \(-a\) sobre un sistema de segundo orden; con un sistema de orden mayor o un cero complejo, el efecto sobre \(M_p\) ya no sigue esta tabla exacta y hay que simular la respuesta completa.

### Tema 3: Cero de fase no mínima

**¿Por qué es importante?** Los ceros de fase no mínima explican respuestas que primero van al revés y limitan qué tan rápido se puede controlar.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

Si el cero está en el semiplano derecho (\(a<0\)), la derivada entra con signo menos: la salida primero se va en la dirección contraria. Se llama **respuesta inversa**.

#### Ejemplo 1 · Cero en el semiplano derecho · *Experto*

> **Qué cambia respecto al anterior:** El cero está a la derecha.

**Enunciado.** \(G = \dfrac{-4(s-1)}{s^2+2s+4}\). ¿Qué pasa con un escalón?

1. \(G(0) = \dfrac{-4(-1)}{4} = 1\): termina en 1.

   **¿Por qué?** Valor final.

2. Escribe \(G = (1 - s)G_0\), con \(G_0 = \dfrac{4}{s^2+2s+4}\). Entonces \(y = y_0 - y_0^{\prime}\).

   **¿Por qué?** Es el resultado de 13.2 con \(a = -1\): la derivada entra restando.

3. Al inicio \(y_0^{\prime} > 0\) (la curva sube), así que \(y\) empieza negativa (llega a \(-0{,}75\)).

   **¿Por qué?** Por eso la salida primero se va en la dirección contraria.

**Resultado:** Respuesta inversa: baja a −0,75, sube, se pasa (28,6 %) y termina en 1

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Respuesta inversa con cero en s = +1 · *Intermedio*

**Enunciado.** \(G(s) = \frac{2 - 2 s}{\left(s + 1\right) \left(s + 2\right)}\). Describe el comienzo de la respuesta al escalón.

1. Valor final \(G(0) = 1\): positivo.

   **¿Por qué?** Teorema del valor final.

2. Pendiente inicial \(\dot y(0^+) = \lim_{s\to\infty} s\cdot sY(s) = -2\): negativa.

   **¿Por qué?** Valor inicial aplicado a la derivada.

**Resultado.** Primero baja y luego sube hasta 1: \(y(t) = 1 - 4 e^{- t} + 3 e^{- 2 t}\). Es la firma de un cero de fase no mínima.

#### Ejemplo 3 · Respuesta inversa con cero en s = +2 · *Intermedio*

**Enunciado.** \(G(s) = \frac{4 - 2 s}{\left(s + 2\right) \left(2 s + 2\right)}\). Describe el comienzo de la respuesta al escalón.

1. Valor final \(G(0) = 1\): positivo.

   **¿Por qué?** Teorema del valor final.

2. Pendiente inicial \(\dot y(0^+) = \lim_{s\to\infty} s\cdot sY(s) = -1\): negativa.

   **¿Por qué?** Valor inicial aplicado a la derivada.

**Resultado.** Primero baja y luego sube hasta 1: \(y(t) = 1 - 3 e^{- t} + 2 e^{- 2 t}\). Es la firma de un cero de fase no mínima.

#### Ejemplo 4 · Respuesta inversa con cero en s = +3 · *Intermedio*

**Enunciado.** \(G(s) = \frac{6 - 2 s}{\left(s + 2\right) \left(3 s + 3\right)}\). Describe el comienzo de la respuesta al escalón.

1. Valor final \(G(0) = 1\): positivo.

   **¿Por qué?** Teorema del valor final.

2. Pendiente inicial \(\dot y(0^+) = \lim_{s\to\infty} s\cdot sY(s) = - \frac{2}{3}\): negativa.

   **¿Por qué?** Valor inicial aplicado a la derivada.

**Resultado.** Primero baja y luego sube hasta 1: \(y(t) = 1 - \frac{8 e^{- t}}{3} + \frac{5 e^{- 2 t}}{3}\). Es la firma de un cero de fase no mínima.

#### Ejemplo 5 · Respuesta inversa con cero en s = +4 · *Avanzado*

**Enunciado.** \(G(s) = \frac{8 - 2 s}{\left(s + 2\right) \left(4 s + 4\right)}\). Describe el comienzo de la respuesta al escalón.

1. Valor final \(G(0) = 1\): positivo.

   **¿Por qué?** Teorema del valor final.

2. Pendiente inicial \(\dot y(0^+) = \lim_{s\to\infty} s\cdot sY(s) = - \frac{1}{2}\): negativa.

   **¿Por qué?** Valor inicial aplicado a la derivada.

**Resultado.** Primero baja y luego sube hasta 1: \(y(t) = 1 - \frac{5 e^{- t}}{2} + \frac{3 e^{- 2 t}}{2}\). Es la firma de un cero de fase no mínima.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 2.

```python
# verificacion.py
from sympy import symbols, limit, oo

s = symbols("s")
G = (2 - 2 * s) / ((s + 1) * (s + 2))
Y = G / s
valor_final = limit(s * Y, s, 0)
pendiente_inicial = limit(s * (s * Y), s, oo)
print("valor_final:", valor_final)
print("pendiente_inicial:", pendiente_inicial)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `valor_final: 1` y `pendiente_inicial: -2`, igual al Ejemplo 2 (termina positivo pero empieza bajando).

**Práctica:** cambia `G` por la del Ejemplo 3 (\(\dfrac{4-2s}{(s+2)(2s+2)}\)) y confirma `valor_final: 1` y `pendiente_inicial: -1`.

**Límite:** `valor_final` y `pendiente_inicial` solo dicen el signo de arranque y el destino; no dicen cuánto se hunde la respuesta antes de subir — para ese detalle hay que invertir \(Y(s)\) completa, como en el resultado de cada ejemplo.

