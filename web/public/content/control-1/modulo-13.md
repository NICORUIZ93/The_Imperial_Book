# Módulo 13: Polos dominantes, polos adicionales y ceros

Las fórmulas de \(M_p\), \(t_p\) y \(t_s\) son exactas solo para el segundo orden puro. Aquí aprendes cuándo puedes usarlas en sistemas más grandes y qué hacen los ceros.

**Al terminar podrás:**

- Identificar los polos dominantes y aproximar un sistema de orden alto por uno de segundo orden.
- Explicar el efecto de un cero sobre el sobrepico.
- Reconocer un cero de fase no mínima (respuesta inversa).

## Aprende construyendo

### Tema 1: Polos dominantes

**¿Por qué es importante?** Los sistemas reales tienen más de dos polos; saber cuáles dominan te deja usar las fórmulas de segundo orden con confianza.

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

### Tema 2: Efecto de un cero

**¿Por qué es importante?** Un cero cambia el sobrepico aunque los polos sean los mismos; ignorarlo lleva a diseños que se pasan.

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

### Tema 3: Cero de fase no mínima

**¿Por qué es importante?** Los ceros de fase no mínima explican respuestas que primero van al revés y limitan qué tan rápido se puede controlar.

Si el cero está en el semiplano derecho (\(a<0\)), la derivada entra con signo menos: la salida primero se va en la dirección contraria. Se llama **respuesta inversa**.

#### Ejemplo 2 · Cero en el semiplano derecho · *Experto*

> **Qué cambia respecto al anterior:** El cero está a la derecha.

**Enunciado.** \(G = \dfrac{-4(s-1)}{s^2+2s+4}\). ¿Qué pasa con un escalón?

1. \(G(0) = \dfrac{-4(-1)}{4} = 1\): termina en 1.

   **¿Por qué?** Valor final.

2. Escribe \(G = (1 - s)G_0\), con \(G_0 = \dfrac{4}{s^2+2s+4}\). Entonces \(y = y_0 - y_0^{\prime}\).

   **¿Por qué?** Es el resultado de 13.2 con \(a = -1\): la derivada entra restando.

3. Al inicio \(y_0^{\prime} > 0\) (la curva sube), así que \(y\) empieza negativa (llega a \(-0{,}75\)).

   **¿Por qué?** Por eso la salida primero se va en la dirección contraria.

**Resultado:** Respuesta inversa: baja a −0,75, sube, se pasa (28,6 %) y termina en 1
