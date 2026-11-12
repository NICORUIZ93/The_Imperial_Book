# Módulo 12: Sistemas de segundo orden

Es el tema más preguntado de los dos parciales. Un RLC, una masa con resorte o un motor con su control se comportan así.

**Al terminar podrás:**

- Leer \(K\), \(\omega_n\) y \(\zeta\) de cualquier \(G(s)\) de segundo orden.
- Clasificar el sistema (sub, crítica o sobreamortiguado) y predecir su forma.
- Calcular \(M_p\), \(t_p\), \(t_s\) y \(t_r\), y escribir \(y(t)\).
- Hacer el camino inverso: de una gráfica o de unas especificaciones a \(G(s)\).

## Aprende construyendo

### Tema 1: Forma estándar

**¿Por qué es importante?** Leer \(K\), \(\omega_n\) y \(\zeta\) de una \(G(s)\) es el primer paso de casi todas las preguntas del Parcial 2.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

\[G(s) = \frac{K\,\omega_n^2}{s^2 + 2\zeta\omega_n s + \omega_n^2}\]

| Parámetro | Nombre | Qué controla |
|---|---|---|
| \(K\) | Ganancia estática | El valor final ante escalón unitario |
| \(\omega_n\) | Frecuencia natural (rad/s) | La velocidad: a mayor \(\omega_n\), todo pasa más rápido |
| \(\zeta\) | Factor de amortiguamiento | Cuánto oscila: \(\zeta\) pequeño oscila mucho |

**Cómo leer los parámetros**

1. Asegúrate de que el coeficiente de \(s^2\) sea 1 (si no, divide todo por él).
2. El término independiente del denominador es \(\omega_n^2\): saca la raíz.
3. El coeficiente de \(s\) es \(2\zeta\omega_n\): despeja \(\zeta = \dfrac{\text{coef. de } s}{2\omega_n}\).
4. \(K = \dfrac{\text{numerador}}{\omega_n^2}\), que es lo mismo que \(G(0)\).

#### Ejemplo 1 · Leer los parámetros · *Básico*

**Enunciado.** Halla \(K\), \(\omega_n\) y \(\zeta\) de \(G = \dfrac{370}{s^2+2s+37}\).

1. Revisa que el coeficiente de \(s^2\) sea 1. Lo es.

   **¿Por qué?** La forma estándar lo exige; si no fuera 1, se divide todo por él.

2. Término independiente: \(\omega_n^2 = 37 \Rightarrow \omega_n = \sqrt{37} = 6{,}08\) rad/s.

   **¿Por qué?** En la forma estándar el último término es \(\omega_n^2\), no \(\omega_n\).

3. Coeficiente de \(s\): \(2\zeta\omega_n = 2 \Rightarrow \zeta = \dfrac{2}{2\cdot6{,}08} = 0{,}164\).

   **¿Por qué?** Se despeja \(\zeta\) usando el \(\omega_n\) que ya calculamos.

4. Ganancia: \(K = \dfrac{370}{37} = 10\).

   **¿Por qué?** El numerador es \(K\omega_n^2\). También: \(K = G(0)\).

**Resultado:** \(K = 10\), \(\omega_n = 6{,}08\), \(\zeta = 0{,}164\): subamortiguado

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Leer K, ωn y ζ de \(\frac{16}{s^{2} + 4 s + 16}\) · *Básico*

**Enunciado.** Identifica los parámetros de segundo orden.

1. \(\omega_n^2 = 16\), así \(\omega_n = 4\).

   **¿Por qué?** El término independiente del denominador es \(\omega_n^2\).

2. \(2\zeta\omega_n = 4\), así \(\zeta = \frac{1}{2}\).

   **¿Por qué?** El coeficiente de \(s\) es \(2\zeta\omega_n\).

3. \(K = \dfrac{\text{numerador}}{\omega_n^2\cdot a_2} = 1\).

   **¿Por qué?** La ganancia DC es \(G(0)\).

**Resultado.** \(K = 1,\ \omega_n = 4\,\text{rad/s},\ \zeta = 0{,}5\): sistema subamortiguado (oscila).

#### Ejemplo 3 · Leer K, ωn y ζ de \(\frac{50}{s^{2} + 6 s + 25}\) · *Básico*

**Enunciado.** Identifica los parámetros de segundo orden.

1. \(\omega_n^2 = 25\), así \(\omega_n = 5\).

   **¿Por qué?** El término independiente del denominador es \(\omega_n^2\).

2. \(2\zeta\omega_n = 6\), así \(\zeta = \frac{3}{5}\).

   **¿Por qué?** El coeficiente de \(s\) es \(2\zeta\omega_n\).

3. \(K = \dfrac{\text{numerador}}{\omega_n^2\cdot a_2} = 2\).

   **¿Por qué?** La ganancia DC es \(G(0)\).

**Resultado.** \(K = 2,\ \omega_n = 5\,\text{rad/s},\ \zeta = 0{,}6\): sistema subamortiguado (oscila).

#### Ejemplo 4 · Leer K, ωn y ζ de \(\frac{9}{2 s^{2} + 3 s + 18}\) · *Intermedio*

**Enunciado.** Identifica los parámetros de segundo orden.

1. Divide todo por \(2\) para que \(s^2\) tenga coeficiente 1.

   **¿Por qué?** La forma estándar \(\dfrac{K\omega_n^2}{s^2+2\zeta\omega_ns+\omega_n^2}\) tiene \(s^2\) "solo".

2. \(\omega_n^2 = 9\), así \(\omega_n = 3\).

   **¿Por qué?** El término independiente del denominador es \(\omega_n^2\).

3. \(2\zeta\omega_n = \frac{3}{2}\), así \(\zeta = \frac{1}{4}\).

   **¿Por qué?** El coeficiente de \(s\) es \(2\zeta\omega_n\).

4. \(K = \dfrac{\text{numerador}}{\omega_n^2\cdot a_2} = \frac{1}{2}\).

   **¿Por qué?** La ganancia DC es \(G(0)\).

**Resultado.** \(K = \frac{1}{2},\ \omega_n = 3\,\text{rad/s},\ \zeta = 0{,}25\): sistema subamortiguado (oscila).

#### Ejemplo 5 · Leer K, ωn y ζ de \(\frac{4}{s^{2} + s + 4}\) · *Básico*

**Enunciado.** Identifica los parámetros de segundo orden.

1. \(\omega_n^2 = 4\), así \(\omega_n = 2\).

   **¿Por qué?** El término independiente del denominador es \(\omega_n^2\).

2. \(2\zeta\omega_n = 1\), así \(\zeta = \frac{1}{4}\).

   **¿Por qué?** El coeficiente de \(s\) es \(2\zeta\omega_n\).

3. \(K = \dfrac{\text{numerador}}{\omega_n^2\cdot a_2} = 1\).

   **¿Por qué?** La ganancia DC es \(G(0)\).

**Resultado.** \(K = 1,\ \omega_n = 2\,\text{rad/s},\ \zeta = 0{,}25\): sistema subamortiguado (oscila).

#### Ejemplo 6 · Leer K, ωn y ζ de \(\frac{100}{s^{2} + 20 s + 100}\) · *Intermedio*

**Enunciado.** Identifica los parámetros de segundo orden.

1. \(\omega_n^2 = 100\), así \(\omega_n = 10\).

   **¿Por qué?** El término independiente del denominador es \(\omega_n^2\).

2. \(2\zeta\omega_n = 20\), así \(\zeta = 1\).

   **¿Por qué?** El coeficiente de \(s\) es \(2\zeta\omega_n\).

3. \(K = \dfrac{\text{numerador}}{\omega_n^2\cdot a_2} = 1\).

   **¿Por qué?** La ganancia DC es \(G(0)\).

**Resultado.** \(K = 1,\ \omega_n = 10\,\text{rad/s},\ \zeta = 1\): sistema críticamente amortiguado.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 (lectura de parámetros).

```python
# verificacion.py
from sympy import sqrt, Rational, N

num, b, c = 370, 2, 37
wn = sqrt(c)
zeta = Rational(b, 1) / (2 * wn)
K = Rational(num, c)
print("wn:", N(wn, 4))
print("zeta:", N(zeta, 4))
print("K:", K)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `wn: 6.083`, `zeta: 0.1644` y `K: 10`, igual al Ejemplo 1 (\(K=10\), \(\omega_n=6{,}08\), \(\zeta=0{,}164\)).

**Práctica:** cambia `num, b, c` por `16, 4, 16` y confirma \(K=1\), \(\omega_n=4\), \(\zeta=0{,}5\) (Ejemplo 2).

**Límite:** esta lectura directa solo aplica cuando el coeficiente de \(s^2\) ya es 1; si no lo es (como en el Ejemplo 4 de este tema), primero hay que dividir todo el denominador por ese coeficiente.

### Tema 2: Simulador: mueve ζ y ωn

**¿Por qué es importante?** Mover \(\zeta\) y \(\omega_n\) en el simulador te da la intuición de qué hace cada parámetro antes de usar las fórmulas.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

Prueba esto: deja \(\omega_n = 2\) y mueve \(\zeta\) desde 0,05 hasta 1,5. Luego deja \(\zeta = 0{,}3\) y sube \(\omega_n\). Observa qué cambia en la curva y en los polos.

```anatomy
control-1-segundo-orden
```

*Respuesta al escalón unitario (arriba) y polos en el plano s (abajo).*

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Predice antes de mover el simulador: ζ = 0,1, ωn = 2 · *Básico*

**Enunciado.** Pon estos valores en el simulador. Antes, predice el sobrepico y el tiempo de establecimiento; después compara con la curva.

1. \(M_p = e^{-\zeta\pi/\sqrt{1-\zeta^2}} \approx 72{,}9\,\%\).

   **¿Por qué?** El sobrepico depende solo de \(\zeta\).

2. \(t_s \approx \dfrac{4}{\zeta\omega_n} = 20\,\text{s}\) y \(t_p = \dfrac{\pi}{\omega_d} = 1{,}58\,\text{s}\).

   **¿Por qué?** Los tiempos dependen de \(\omega_n\): duplicar \(\omega_n\) hace todo el doble de rápido sin cambiar la forma.

**Resultado.** Si la curva del simulador coincide, entendiste qué controla cada parámetro: \(\zeta\) la forma, \(\omega_n\) la escala de tiempo.

#### Ejemplo 2 · Predice antes de mover el simulador: ζ = 0,5, ωn = 2 · *Básico*

**Enunciado.** Pon estos valores en el simulador. Antes, predice el sobrepico y el tiempo de establecimiento; después compara con la curva.

1. \(M_p = e^{-\zeta\pi/\sqrt{1-\zeta^2}} \approx 16{,}3\,\%\).

   **¿Por qué?** El sobrepico depende solo de \(\zeta\).

2. \(t_s \approx \dfrac{4}{\zeta\omega_n} = 4\,\text{s}\) y \(t_p = \dfrac{\pi}{\omega_d} = 1{,}81\,\text{s}\).

   **¿Por qué?** Los tiempos dependen de \(\omega_n\): duplicar \(\omega_n\) hace todo el doble de rápido sin cambiar la forma.

**Resultado.** Si la curva del simulador coincide, entendiste qué controla cada parámetro: \(\zeta\) la forma, \(\omega_n\) la escala de tiempo.

#### Ejemplo 3 · Predice antes de mover el simulador: ζ = 0,9, ωn = 2 · *Básico*

**Enunciado.** Pon estos valores en el simulador. Antes, predice el sobrepico y el tiempo de establecimiento; después compara con la curva.

1. \(M_p = e^{-\zeta\pi/\sqrt{1-\zeta^2}} \approx 0{,}2\,\%\).

   **¿Por qué?** El sobrepico depende solo de \(\zeta\).

2. \(t_s \approx \dfrac{4}{\zeta\omega_n} = 2{,}22\,\text{s}\) y \(t_p = \dfrac{\pi}{\omega_d} = 3{,}6\,\text{s}\).

   **¿Por qué?** Los tiempos dependen de \(\omega_n\): duplicar \(\omega_n\) hace todo el doble de rápido sin cambiar la forma.

**Resultado.** Si la curva del simulador coincide, entendiste qué controla cada parámetro: \(\zeta\) la forma, \(\omega_n\) la escala de tiempo.

#### Ejemplo 4 · Predice antes de mover el simulador: ζ = 0,3, ωn = 1 · *Básico*

**Enunciado.** Pon estos valores en el simulador. Antes, predice el sobrepico y el tiempo de establecimiento; después compara con la curva.

1. \(M_p = e^{-\zeta\pi/\sqrt{1-\zeta^2}} \approx 37{,}2\,\%\).

   **¿Por qué?** El sobrepico depende solo de \(\zeta\).

2. \(t_s \approx \dfrac{4}{\zeta\omega_n} = 13{,}33\,\text{s}\) y \(t_p = \dfrac{\pi}{\omega_d} = 3{,}29\,\text{s}\).

   **¿Por qué?** Los tiempos dependen de \(\omega_n\): duplicar \(\omega_n\) hace todo el doble de rápido sin cambiar la forma.

**Resultado.** Si la curva del simulador coincide, entendiste qué controla cada parámetro: \(\zeta\) la forma, \(\omega_n\) la escala de tiempo.

#### Ejemplo 5 · Predice antes de mover el simulador: ζ = 0,3, ωn = 4 · *Básico*

**Enunciado.** Pon estos valores en el simulador. Antes, predice el sobrepico y el tiempo de establecimiento; después compara con la curva.

1. \(M_p = e^{-\zeta\pi/\sqrt{1-\zeta^2}} \approx 37{,}2\,\%\).

   **¿Por qué?** El sobrepico depende solo de \(\zeta\).

2. \(t_s \approx \dfrac{4}{\zeta\omega_n} = 3{,}33\,\text{s}\) y \(t_p = \dfrac{\pi}{\omega_d} = 0{,}82\,\text{s}\).

   **¿Por qué?** Los tiempos dependen de \(\omega_n\): duplicar \(\omega_n\) hace todo el doble de rápido sin cambiar la forma.

**Resultado.** Si la curva del simulador coincide, entendiste qué controla cada parámetro: \(\zeta\) la forma, \(\omega_n\) la escala de tiempo.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar las predicciones del Ejemplo 1 antes de mover el simulador.

```python
# verificacion.py
from sympy import exp, pi, sqrt, N

zeta, wn = 0.1, 2
Mp = N(exp(-zeta * pi / sqrt(1 - zeta ** 2)) * 100, 3)
ts = N(4 / (zeta * wn), 3)
wd = wn * sqrt(1 - zeta ** 2)
tp = N(pi / wd, 3)
print("Mp%:", Mp)
print("ts:", ts)
print("tp:", tp)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `Mp%: 72.9`, `ts: 20.0` y `tp: 1.58`, igual al Ejemplo 1.

**Práctica:** cambia `zeta, wn` a `0.5, 2` y confirma \(M_p\approx16{,}3\,\%\), \(t_s=4\) s (Ejemplo 2).

**Límite:** este script solo predice; verificar que coincide con el simulador no prueba que entendiste de dónde salen las fórmulas — ese es el objetivo de las demostraciones del Tema 4.

### Tema 3: Los cuatro casos según ζ

**¿Por qué es importante?** Clasificar el sistema por \(\zeta\) te dice de inmediato si va a oscilar y qué método usar para resolverlo.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

| \(\zeta\) | Caso | Polos | Respuesta al escalón |
|---|---|---|---|
| \(0\) | No amortiguado | \(\pm j\omega_n\) | Oscila para siempre |
| \(0<\zeta<1\) | Subamortiguado | \(-\sigma\pm j\omega_d\) | Se pasa, oscila y se calma |
| \(1\) | Críticamente amortiguado | \(-\omega_n\) doble | Lo más rápido posible sin pasarse |
| \(>1\) | Sobreamortiguado | Dos reales negativos | Lento, sin sobrepaso |

![Efecto de ζ en la respuesta al escalón](content/figures/control-1/segundo-orden-zetas.svg)

*Misma \(\omega_n = 2\) y \(K = 1\) con \(\zeta = 0{,}2\), \(0{,}5\), \(1\) y \(2\). A menor \(\zeta\), más sobrepico.*

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Clasificar \(\frac{9}{s^{2} + 2 s + 9}\) · *Básico*

**Enunciado.** Di qué caso es según \(\zeta\) y cómo será su respuesta al escalón.

1. \(\omega_n = 3\), \(\zeta = \dfrac{2}{2\cdot3} = \frac{1}{3}\).

   **¿Por qué?** Se compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\).

2. Polos: \(-1 - 2 \sqrt{2} j, -1 + 2 \sqrt{2} j\).

   **¿Por qué?** Los polos confirman la clasificación: complejos ↔ oscila, reales ↔ no oscila.

**Resultado.** Caso **subamortiguado**: oscila mientras se acerca al valor final.

#### Ejemplo 2 · Clasificar \(\frac{9}{s^{2} + 6 s + 9}\) · *Básico*

**Enunciado.** Di qué caso es según \(\zeta\) y cómo será su respuesta al escalón.

1. \(\omega_n = 3\), \(\zeta = \dfrac{6}{2\cdot3} = 1\).

   **¿Por qué?** Se compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\).

2. Polos: \(-3\).

   **¿Por qué?** Los polos confirman la clasificación: complejos ↔ oscila, reales ↔ no oscila.

**Resultado.** Caso **críticamente amortiguado**: llega lo más rápido posible sin sobrepasar.

#### Ejemplo 3 · Clasificar \(\frac{9}{s^{2} + 10 s + 9}\) · *Básico*

**Enunciado.** Di qué caso es según \(\zeta\) y cómo será su respuesta al escalón.

1. \(\omega_n = 3\), \(\zeta = \dfrac{10}{2\cdot3} = \frac{5}{3}\).

   **¿Por qué?** Se compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\).

2. Polos: \(-9, -1\).

   **¿Por qué?** Los polos confirman la clasificación: complejos ↔ oscila, reales ↔ no oscila.

**Resultado.** Caso **sobreamortiguado**: sube lento, sin oscilar (dos exponenciales).

#### Ejemplo 4 · Clasificar \(\frac{9}{s^{2} + 9}\) · *Básico*

**Enunciado.** Di qué caso es según \(\zeta\) y cómo será su respuesta al escalón.

1. \(\omega_n = 3\), \(\zeta = \dfrac{0}{2\cdot3} = 0\).

   **¿Por qué?** Se compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\).

2. Polos: \(- 3 j, 3 j\).

   **¿Por qué?** Los polos confirman la clasificación: complejos ↔ oscila, reales ↔ no oscila.

**Resultado.** Caso **no amortiguado**: oscila para siempre sin decaer (polos sobre el eje imaginario).

#### Ejemplo 5 · Clasificar \(\frac{4}{s^{2} + 5 s + 4}\) · *Intermedio*

**Enunciado.** Di qué caso es según \(\zeta\) y cómo será su respuesta al escalón.

1. \(\omega_n = 2\), \(\zeta = \dfrac{5}{2\cdot2} = \frac{5}{4}\).

   **¿Por qué?** Se compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\).

2. Polos: \(-4, -1\).

   **¿Por qué?** Los polos confirman la clasificación: complejos ↔ oscila, reales ↔ no oscila.

**Resultado.** Caso **sobreamortiguado**: sube lento, sin oscilar (dos exponenciales).

#### Ejemplo 6 · Clasificar \(\frac{25}{s^{2} + 4 s + 25}\) · *Intermedio*

**Enunciado.** Di qué caso es según \(\zeta\) y cómo será su respuesta al escalón.

1. \(\omega_n = 5\), \(\zeta = \dfrac{4}{2\cdot5} = \frac{2}{5}\).

   **¿Por qué?** Se compara con \(s^2 + 2\zeta\omega_ns + \omega_n^2\).

2. Polos: \(-2 - \sqrt{21} j, -2 + \sqrt{21} j\).

   **¿Por qué?** Los polos confirman la clasificación: complejos ↔ oscila, reales ↔ no oscila.

**Resultado.** Caso **subamortiguado**: oscila mientras se acerca al valor final.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar la clasificación del Ejemplo 1.

```python
# verificacion.py
from sympy import sqrt, Rational, N

num, b, c = 9, 2, 9
wn = sqrt(c)
zeta = Rational(b, 1) / (2 * wn)
print("wn:", wn)
print("zeta:", N(zeta, 3))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `wn: 3` y `zeta: 0.333`, confirmando el caso **subamortiguado** (\(0<\zeta<1\)) del Ejemplo 1.

**Práctica:** cambia `b` a `6` y confirma que da \(\zeta=1\) (Ejemplo 2, críticamente amortiguado).

**Límite:** esta clasificación por \(\zeta\) solo aplica a un sistema de segundo orden estándar (sin ceros); un cero en el numerador, cercano a los polos, puede hacer que la respuesta real se vea distinta de lo que predice solo \(\zeta\) (capítulo 14).

### Tema 4: Fórmulas del caso subamortiguado

**¿Por qué es importante?** Las fórmulas de \(M_p\), \(t_p\), \(t_s\) y \(t_r\) son las especificaciones con las que se diseña un controlador.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

*Polos*

\[s = -\sigma \pm j\omega_d,\qquad \sigma = \zeta\omega_n,\qquad \omega_d = \omega_n\sqrt{1-\zeta^2},\qquad \zeta = \cos\theta\]

*Atajo: si completas el cuadrado del denominador, obtienes directamente \((s+\sigma)^2+\omega_d^2\).*

*Respuestas*

*Escalón unitario*

\[y(t) = K\left[1 - e^{-\sigma t}\left(\cos\omega_d t + \tfrac{\sigma}{\omega_d}\sin\omega_d t\right)\right]\]

*Impulso unitario*

\[y(t) = \frac{K\omega_n^2}{\omega_d}\,e^{-\sigma t}\sin\omega_d t\]

| Especificación | Significado | Fórmula |
|---|---|---|
| \(M_p\) | Cuánto se pasa del valor final | \(e^{-\zeta\pi/\sqrt{1-\zeta^2}} = e^{-\sigma\pi/\omega_d}\) |
| \(t_p\) | Cuándo ocurre el máximo | \(\dfrac{\pi}{\omega_d}\) |
| \(t_s\) | Cuándo entra y se queda en la banda | \(\dfrac{4}{\sigma}\) (2 %), \(\dfrac{3}{\sigma}\) (5 %) |
| \(t_r\) | Cuándo llega por primera vez al valor final | \(\dfrac{\pi-\theta}{\omega_d}\), con \(\theta = \arccos\zeta\) en radianes |
| \(y_{\max}\) | Valor máximo | \(K(1+M_p)\) |

#### Demostración completa de las fórmulas

#### Demostración · 1 · Los polos

Raíces de \(s^2 + 2\zeta\omega_ns + \omega_n^2\) con la fórmula cuadrática: \(s = -\zeta\omega_n \pm \omega_n\sqrt{\zeta^2-1}\). Si \(\zeta<1\), la raíz es imaginaria: \(s = -\zeta\omega_n \pm j\omega_n\sqrt{1-\zeta^2} = -\sigma \pm j\omega_d\). La distancia al origen es \(\sqrt{\sigma^2+\omega_d^2} = \omega_n\sqrt{\zeta^2 + 1 - \zeta^2} = \omega_n\), y \(\cos\theta = \sigma/\omega_n = \zeta\).

∎

#### Demostración · 2 · La respuesta al escalón

1. \(Y(s) = \dfrac{K\omega_n^2}{s(s^2+2\zeta\omega_ns+\omega_n^2)}\). Residuo en \(s=0\): \(K\).
2. Resta: \(Y - \dfrac Ks = \dfrac{K\omega_n^2 - K(s^2+2\zeta\omega_ns+\omega_n^2)}{s(\cdots)} = -\dfrac{K(s+2\zeta\omega_n)}{s^2+2\zeta\omega_ns+\omega_n^2}\).
3. Completa el cuadrado: el denominador es \((s+\sigma)^2+\omega_d^2\) y el numerador \(s + 2\sigma = (s+\sigma) + \sigma\).
4. Tabla: \(\dfrac{s+\sigma}{(s+\sigma)^2+\omega_d^2} \to e^{-\sigma t}\cos\omega_dt\) y \(\dfrac{\sigma}{(s+\sigma)^2+\omega_d^2} = \dfrac{\sigma}{\omega_d}\cdot\dfrac{\omega_d}{(\cdots)} \to \dfrac{\sigma}{\omega_d}e^{-\sigma t}\sin\omega_dt\).
5. Resultado: \(y(t) = K\left[1 - e^{-\sigma t}\left(\cos\omega_dt + \tfrac{\sigma}{\omega_d}\sin\omega_dt\right)\right]\).

**Forma compacta:** como \(\sin\theta = \sqrt{1-\zeta^2}\) y \(\cos\theta = \zeta\), la identidad \(\sin(a+\theta) = \sin a\cos\theta + \cos a\sin\theta\) da \(\cos\omega_dt + \tfrac{\zeta}{\sqrt{1-\zeta^2}}\sin\omega_dt = \dfrac{\sin(\omega_dt+\theta)}{\sqrt{1-\zeta^2}}\). Así:

\[y(t) = K\left[1 - \frac{e^{-\sigma t}}{\sqrt{1-\zeta^2}}\sin(\omega_dt+\theta)\right]\]

∎

#### Demostración · 3 · Tiempo pico y sobrepico

1. El máximo ocurre donde la derivada es cero. La derivada de la respuesta al escalón es la respuesta al impulso: \(y'(t) = \dfrac{K\omega_n^2}{\omega_d}e^{-\sigma t}\sin\omega_dt\).
2. \(y' = 0\) cuando \(\sin\omega_dt = 0\), es decir \(\omega_dt = 0, \pi, 2\pi, \ldots\) El primer máximo (después de \(t=0\)) es en \(\omega_dt = \pi\): \(t_p = \dfrac{\pi}{\omega_d}\).
3. Evalúa \(y\) ahí: \(\cos\pi = -1\), \(\sin\pi = 0\). Entonces \(y(t_p) = K\left[1 + e^{-\sigma\pi/\omega_d}\right]\).
4. Sobrepico relativo: \(M_p = \dfrac{y(t_p) - K}{K} = e^{-\sigma\pi/\omega_d} = e^{-\zeta\pi/\sqrt{1-\zeta^2}}\).

∎

#### Demostración · 4 · De Mp a ζ (fórmula inversa)

1. \(\ln M_p = -\dfrac{\zeta\pi}{\sqrt{1-\zeta^2}}\). Eleva al cuadrado: \(\ln^2M_p\,(1-\zeta^2) = \zeta^2\pi^2\).
2. \(\ln^2M_p = \zeta^2(\pi^2 + \ln^2M_p)\), así que \(\zeta = \dfrac{-\ln M_p}{\sqrt{\pi^2+\ln^2M_p}}\) (el signo menos porque \(\ln M_p<0\) y \(\zeta>0\)).

∎

#### Demostración · 5 · Tiempo de establecimiento

1. Con la forma compacta, la oscilación está encerrada entre las envolventes \(K\left(1 \pm \dfrac{e^{-\sigma t}}{\sqrt{1-\zeta^2}}\right)\).
2. Para estar dentro del 2 %: \(\dfrac{e^{-\sigma t}}{\sqrt{1-\zeta^2}} \le 0{,}02\), es decir \(t \ge \dfrac{1}{\sigma}\ln\dfrac{50}{\sqrt{1-\zeta^2}}\).
3. Para \(\zeta\) entre 0 y 0,7, \(\ln\dfrac{50}{\sqrt{1-\zeta^2}}\) está entre 3,9 y 4,3. Por eso se usa \(t_s \approx \dfrac4\sigma\). Al 5 %: \(\ln 20 \approx 3\), así que \(t_s \approx \dfrac3\sigma\).

∎

#### Demostración · 6 · Tiempo de subida

\(y = K\) cuando \(\sin(\omega_dt+\theta) = 0\) (forma compacta). La primera vez después de \(t=0\) es \(\omega_dt + \theta = \pi\), así que \(t_r = \dfrac{\pi-\theta}{\omega_d}\).

∎

| \(\zeta\) | 0,1 | 0,2 | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,8 |
|---|---|---|---|---|---|---|---|---|
| \(M_p\) | 72,9 % | 52,7 % | 37,2 % | 25,4 % | 16,3 % | 9,5 % | 4,6 % | 1,5 % |

#### Ejemplo 1 · Todas las especificaciones · *Básico*

> **Qué cambia respecto al anterior:** Ahora se calculan todas las especificaciones.

**Enunciado.** \(G = \dfrac{25}{s^2+6s+25}\) con escalón unitario.

1. \(\omega_n = 5\), \(2\zeta\cdot5 = 6 \Rightarrow \zeta = 0{,}6\), \(K = 25/25 = 1\).

   **¿Por qué?** Lectura del Ejemplo 1.

2. \(\sigma = \zeta\omega_n = 3\); \(\omega_d = \omega_n\sqrt{1-\zeta^2} = 5\sqrt{0{,}64} = 4\). Polos \(-3\pm4j\).

   **¿Por qué?** Fórmulas de los polos. Comprobación: completar el cuadrado da \((s+3)^2+16\).

3. \(M_p = e^{-\sigma\pi/\omega_d} = e^{-3\pi/4} = e^{-2{,}356} = 0{,}095\).

   **¿Por qué?** Fórmula demostrada arriba. Con \(\sigma\) y \(\omega_d\) es más directa.

4. \(t_p = \pi/\omega_d = \pi/4 = 0{,}785\) s.

   **¿Por qué?** El primer máximo ocurre cuando \(\omega_dt = \pi\).

5. \(t_s = 4/\sigma = 4/3 = 1{,}33\) s.

   **¿Por qué?** La envolvente \(e^{-\sigma t}\) cae al 2 % en \(t\approx4/\sigma\).

6. \(y(t) = 1 - e^{-3t}\left(\cos4t + \tfrac34\sin4t\right)\).

   **¿Por qué?** Fórmula general con \(\sigma/\omega_d = 3/4\).

**Resultado:** \(M_p = 9{,}5\,\%\), \(t_p = 0{,}785\) s, \(t_s = 1{,}33\) s

#### Ejemplo 2 · Impulso · *Básico*

> **Qué cambia respecto al anterior:** La entrada es un impulso, no un escalón.

**Enunciado.** \(G = \dfrac{10}{s^2+4s+20}\) con impulso unitario.

1. Con impulso, \(Y = G\). Completa el cuadrado: \((s+2)^2 + 16\), así que \(\sigma = 2\), \(\omega_d = 4\).

   **¿Por qué?** La respuesta al impulso es la inversa de \(G\).

2. Ajusta el numerador a \(\omega_d\): \(\dfrac{10}{4}\cdot\dfrac{4}{(s+2)^2+16}\).

   **¿Por qué?** La tabla del seno pide \(\omega\) arriba.

**Resultado:** \(y(t) = 2{,}5\,e^{-2t}\sin4t\)

#### Ejemplo 3 · Sobreamortiguado · *Intermedio*

> **Qué cambia respecto al anterior:** \(\zeta\) es mayor que 1.

**Enunciado.** \(G = \dfrac{6}{s^2+5s+6}\) con escalón unitario.

1. \(\omega_n = \sqrt6 = 2{,}45\); \(\zeta = \dfrac{5}{2\cdot2{,}45} = 1{,}02\).

   **¿Por qué?** Como \(\zeta > 1\), las raíces son reales: no hay oscilación ni \(M_p\).

2. Factoriza: \((s+2)(s+3)\). \(Y = \dfrac{6}{s(s+2)(s+3)}\).

   **¿Por qué?** Con raíces reales se usa el tapado de capítulo 4, no las fórmulas de \(M_p\).

3. Residuos: en 0, \(\dfrac{6}{6} = 1\); en \(-2\), \(\dfrac{6}{(-2)(1)} = -3\); en \(-3\), \(\dfrac{6}{(-3)(-1)} = 2\).

   **¿Por qué?** Tapado.

**Resultado:** \(y(t) = 1 - 3e^{-2t} + 2e^{-3t}\): sube sin pasarse

#### Ejemplo 4 · Críticamente amortiguado · *Intermedio*

> **Qué cambia respecto al anterior:** \(\zeta\) es exactamente 1.

**Enunciado.** \(G = \dfrac{9}{(s+3)^2}\) con escalón unitario.

1. \(\omega_n = 3\); expandiendo, \(s^2+6s+9\), así que \(2\zeta\cdot3 = 6\) y \(\zeta = 1\).

   **¿Por qué?** El caso límite entre oscilar y no oscilar.

2. \(Y = \dfrac{9}{s(s+3)^2} = \dfrac1s - \dfrac{1}{s+3} - \dfrac{3}{(s+3)^2}\).

   **¿Por qué?** Polo repetido (capítulo 4, Ejemplo 4).

**Resultado:** \(y(t) = 1 - e^{-3t} - 3te^{-3t}\)

#### Ejemplo 5 · De la gráfica a G(s) · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se hace al revés: de la curva a \(G\).

**Enunciado.** Escalón unitario. La salida sube hasta 2,5, se estabiliza en 2 y el pico ocurre en \(t = 1\) s.

1. \(K = \dfrac{y_\infty}{\text{escalón}} = \dfrac21 = 2\).

   **¿Por qué?** \(K\) es el valor final por unidad de entrada.

2. \(M_p = \dfrac{2{,}5 - 2}{2} = 0{,}25\).

   **¿Por qué?** Sobrepico relativo al valor final, en decimal.

3. \(\ln0{,}25 = -1{,}386\). \(\zeta = \dfrac{1{,}386}{\sqrt{\pi^2 + 1{,}386^2}} = \dfrac{1{,}386}{\sqrt{9{,}870+1{,}922}} = 0{,}404\).

   **¿Por qué?** Fórmula inversa demostrada arriba.

4. \(\omega_d = \dfrac{\pi}{t_p} = \pi\); \(\omega_n = \dfrac{\omega_d}{\sqrt{1-\zeta^2}} = \dfrac{3{,}142}{0{,}915} = 3{,}434\).

   **¿Por qué?** De \(t_p = \pi/\omega_d\) sale \(\omega_d\); de \(\omega_d = \omega_n\sqrt{1-\zeta^2}\) sale \(\omega_n\).

5. \(\omega_n^2 = 11{,}79\); \(2\zeta\omega_n = 2\cdot0{,}404\cdot3{,}434 = 2{,}77\).

   **¿Por qué?** Son los coeficientes del denominador.

**Resultado:** \(G = \dfrac{2(11{,}79)}{s^2+2{,}77s+11{,}79} = \dfrac{23{,}58}{s^2+2{,}77s+11{,}79}\)

#### Ejemplo 6 · De especificaciones a G(s) · *Nivel parcial*

> **Qué cambia respecto al anterior:** En vez de una gráfica, nos dan las especificaciones.

**Enunciado.** Diseña \(G\) con \(K = 1\), \(M_p = 10\,\%\) y \(t_s = 2\) s.

1. \(\zeta = \dfrac{-\ln0{,}1}{\sqrt{\pi^2+\ln^20{,}1}} = \dfrac{2{,}303}{\sqrt{9{,}870+5{,}302}} = 0{,}591\).

   **¿Por qué?** El sobrepico fija \(\zeta\).

2. \(\sigma = 4/t_s = 2\).

   **¿Por qué?** El tiempo de establecimiento fija \(\sigma\).

3. \(\omega_n = \sigma/\zeta = 2/0{,}591 = 3{,}38\), \(\omega_n^2 = 11{,}45\). Coeficiente de \(s\): \(2\sigma = 4\).

   **¿Por qué?** \(\sigma = \zeta\omega_n\) y \(2\zeta\omega_n = 2\sigma\).

**Resultado:** \(G = \dfrac{11{,}45}{s^2+4s+11{,}45}\)

#### Ejemplo 7 · Elegir la ganancia · *Nivel parcial*

> **Qué cambia respecto al anterior:** \(K\) es incógnita y está dentro de un lazo.

**Enunciado.** \(G = \dfrac{K}{s(s+2)}\) con realimentación unitaria. ¿Qué \(K\) da \(\zeta = 0{,}5\)?

1. Lazo cerrado: \(\dfrac{K}{s^2+2s+K}\).

   **¿Por qué?** Capítulo 6, Ejemplo 5.

2. Compara: \(\omega_n^2 = K\) y \(2\zeta\omega_n = 2\).

   **¿Por qué?** Forma estándar.

3. Con \(\zeta = 0{,}5\): \(\omega_n = \dfrac{2}{2\cdot0{,}5} = 2\), así que \(K = \omega_n^2 = 4\).

   **¿Por qué?** Se despeja.

**Resultado:** \(K = 4\): \(M_p = 16{,}3\,\%\), \(t_s = 4\) s

> Si subes \(K\), \(\omega_n\) sube pero \(\zeta = 1/\omega_n\) baja: más rápido pero más oscilatorio.

#### Errores comunes

- Leer \(\omega_n\) como el término independiente sin sacar la raíz.
- Usar \(\omega_n\) en lugar de \(\omega_d\) en \(t_p = \pi/\omega_d\).
- Usar \(M_p\) en porcentaje dentro del logaritmo: debe ir en decimal (0,25, no 25).
- Calcular \(M_p\) con el valor máximo dividido por la amplitud del escalón, en vez de por el valor final.

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 8 · Especificaciones con ζ = 0,6 y ωn = 5 · *Básico*

**Enunciado.** Calcula \(M_p\), \(t_p\), \(t_s\) (2 %) y \(t_r\).

1. \(\omega_d = \omega_n\sqrt{1-\zeta^2} = 4\) y \(\sigma = \zeta\omega_n = 3\).

   **¿Por qué?** Son la parte imaginaria y la parte real (con signo cambiado) de los polos.

2. \(M_p = 9{,}5\,\%\), \(t_p = \pi/\omega_d = 0{,}785\,\text{s}\).

   **¿Por qué?** Fórmulas demostradas en este tema.

3. \(t_s = 4/\sigma = 1{,}333\,\text{s}\), \(t_r = (\pi - \arccos\zeta)/\omega_d = 0{,}554\,\text{s}\).

   **¿Por qué?** \(\arccos\zeta\) es el ángulo \(\theta\) del polo, en radianes.

**Resultado.** \(M_p \approx 9{,}5\,\%,\ t_p \approx 0{,}79,\ t_s \approx 1{,}33,\ t_r \approx 0{,}55\) s.

#### Ejemplo 9 · Especificaciones con ζ = 0,25 y ωn = 10 · *Intermedio*

**Enunciado.** Calcula \(M_p\), \(t_p\), \(t_s\) (2 %) y \(t_r\).

1. \(\omega_d = \omega_n\sqrt{1-\zeta^2} = 9{,}682\) y \(\sigma = \zeta\omega_n = 2{,}5\).

   **¿Por qué?** Son la parte imaginaria y la parte real (con signo cambiado) de los polos.

2. \(M_p = 44{,}4\,\%\), \(t_p = \pi/\omega_d = 0{,}324\,\text{s}\).

   **¿Por qué?** Fórmulas demostradas en este tema.

3. \(t_s = 4/\sigma = 1{,}6\,\text{s}\), \(t_r = (\pi - \arccos\zeta)/\omega_d = 0{,}188\,\text{s}\).

   **¿Por qué?** \(\arccos\zeta\) es el ángulo \(\theta\) del polo, en radianes.

**Resultado.** \(M_p \approx 44{,}4\,\%,\ t_p \approx 0{,}32,\ t_s \approx 1{,}6,\ t_r \approx 0{,}19\) s.

#### Ejemplo 10 · Especificaciones con ζ = 0,7 y ωn = 1,5 · *Intermedio*

**Enunciado.** Calcula \(M_p\), \(t_p\), \(t_s\) (2 %) y \(t_r\).

1. \(\omega_d = \omega_n\sqrt{1-\zeta^2} = 1{,}071\) y \(\sigma = \zeta\omega_n = 1{,}05\).

   **¿Por qué?** Son la parte imaginaria y la parte real (con signo cambiado) de los polos.

2. \(M_p = 4{,}6\,\%\), \(t_p = \pi/\omega_d = 2{,}933\,\text{s}\).

   **¿Por qué?** Fórmulas demostradas en este tema.

3. \(t_s = 4/\sigma = 3{,}81\,\text{s}\), \(t_r = (\pi - \arccos\zeta)/\omega_d = 2{,}19\,\text{s}\).

   **¿Por qué?** \(\arccos\zeta\) es el ángulo \(\theta\) del polo, en radianes.

**Resultado.** \(M_p \approx 4{,}6\,\%,\ t_p \approx 2{,}93,\ t_s \approx 3{,}81,\ t_r \approx 2{,}19\) s.

#### Práctica para resolver sola o solo

- **1.**\(M_p\), \(t_p\), \(t_s\) de \(\dfrac{100}{s^2+10s+100}\).
  
  <details><summary>Respuesta</summary>
  
  \(\omega_n = 10\), \(\zeta = 0{,}5\), \(\sigma = 5\), \(\omega_d = 8{,}66\): \(M_p = 16{,}3\,\%\), \(t_p = 0{,}363\) s, \(t_s = 0{,}8\) s.
  
  </details>

- **2.**Impulso de \(\dfrac{29}{s^2+4s+29}\).
  
  <details><summary>Respuesta</summary>
  
  \((s+2)^2+25\): \(\dfrac{29}{5}e^{-2t}\sin5t = 5{,}8\,e^{-2t}\sin5t\).
  
  </details>

- **3.**Ante escalón de amplitud 2, la salida llega a 13 en \(t = 0{,}5\) s y se estabiliza en 10. Halla \(G\).
  
  <details><summary>Respuesta</summary>
  
  \(K = 5\), \(M_p = 0{,}3\), \(\zeta = 0{,}358\), \(\omega_d = 6{,}28\), \(\omega_n = 6{,}73\): \(G = \dfrac{226{,}4}{s^2+4{,}82s+45{,}28}\).
  
  </details>

- **4.**Clasifica \(\dfrac{16}{s^2+8s+16}\).
  
  <details><summary>Respuesta</summary>
  
  \(\omega_n = 4\), \(\zeta = 1\): críticamente amortiguado.
  
  </details>

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar las especificaciones del Ejemplo 1.

```python
# verificacion.py
from sympy import sqrt, exp, pi, N

wn, zeta = 5, 0.6
sigma = zeta * wn
wd = wn * sqrt(1 - zeta ** 2)
Mp = N(exp(-sigma * pi / wd) * 100, 3)
tp = N(pi / wd, 3)
ts = N(4 / sigma, 3)
print("sigma:", sigma, "wd:", float(wd))
print("Mp%:", Mp, "tp:", tp, "ts:", ts)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `sigma: 3.0 wd: 4.0` y `Mp%: 9.48 tp: 0.785 ts: 1.33` (el 9,48 ≈ 9,5 % del texto, por redondeo), igual al Ejemplo 1.

**Práctica:** cambia `wn, zeta` a `10, 0.25` y confirma los valores del Ejemplo 9 (\(M_p\approx44{,}4\,\%\), \(t_s\approx1{,}6\) s).

**Límite:** \(t_s\approx4/\sigma\) es una aproximación válida para \(\zeta\) entre 0 y 0,7 aproximadamente (demostración 5); fuera de ese rango el tiempo de establecimiento real se aleja de \(4/\sigma\) y conviene usar la fórmula exacta con el logaritmo.

### Tema 5: De las especificaciones a la función de transferencia

**¿Por qué es importante?** Los parciales piden el camino inverso: dan el sobrepico y el tiempo de establecimiento y preguntan por \(\zeta\), \(\omega_n\), los polos o la \(G(s)\) que los cumple. Es la base de todo el diseño de controladores.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

El camino inverso usa las mismas fórmulas, despejadas:

1. **Del sobrepico sale \(\zeta\):** \(\zeta = \dfrac{-\ln M_p}{\sqrt{\pi^2 + \ln^2M_p}}\) (con \(M_p\) en fracción, no en porcentaje).

2. **Del tiempo de establecimiento sale \(\sigma\):** \(\sigma = \zeta\omega_n = 4/t_s\) (criterio del 2 %) o \(3/t_s\) (5 %).

3. **Con los dos sale \(\omega_n = \sigma/\zeta\)** y los polos \(-\sigma \pm j\omega_n\sqrt{1-\zeta^2}\).

4. **Se arma** \(G(s) = \dfrac{K\omega_n^2}{s^2 + 2\zeta\omega_ns + \omega_n^2}\) con la ganancia pedida.

Si dan el tiempo pico en vez del de establecimiento, se usa \(\omega_d = \pi/t_p\) y \(\omega_n = \omega_d/\sqrt{1-\zeta^2}\). Siempre conviene comprobar al final recalculando las especificaciones con los valores obtenidos.

#### Ejemplos resueltos

#### Ejemplo 1 · De especificaciones a G(s): Mp = 10 %, ts = 2 s, K = 1 · *Intermedio*

**Enunciado.** Encuentra un sistema de segundo orden con sobrepico 10 %, tiempo de establecimiento (2 %) 2 s y ganancia DC 1.

1. \(\zeta = \dfrac{-\ln M_p}{\sqrt{\pi^2 + \ln^2 M_p}} = \dfrac{2{,}303}{\sqrt{\pi^2+5{,}302}} \approx 0{,}591\).

   **¿Por qué?** Se despeja \(\zeta\) de la fórmula del sobrepico (demostración 4).

2. \(\sigma = \zeta\omega_n = 4/t_s = 2\), así \(\omega_n = \sigma/\zeta \approx 3{,}383\).

   **¿Por qué?** El tiempo de establecimiento fija la parte real de los polos.

3. \(2\zeta\omega_n \approx 4,\ \omega_n^2 \approx 11{,}446\).

   **¿Por qué?** Son los coeficientes del denominador estándar.

**Resultado.** \(G(s) \approx \dfrac{11{,}446}{s^2 + 4s + 11{,}446}\); polos \(-2\pm j2{,}729\).

**Comprobación.** Con esos valores, \(M_p = 10\,\%\) y \(t_s = 2\) s.

#### Ejemplo 2 · De especificaciones a G(s): Mp = 5 %, ts = 4 s, K = 1 · *Intermedio*

**Enunciado.** Encuentra un sistema de segundo orden con sobrepico 5 %, tiempo de establecimiento (2 %) 4 s y ganancia DC 1.

1. \(\zeta = \dfrac{-\ln M_p}{\sqrt{\pi^2 + \ln^2 M_p}} = \dfrac{2{,}996}{\sqrt{\pi^2+8{,}974}} \approx 0{,}69\).

   **¿Por qué?** Se despeja \(\zeta\) de la fórmula del sobrepico (demostración 4).

2. \(\sigma = \zeta\omega_n = 4/t_s = 1\), así \(\omega_n = \sigma/\zeta \approx 1{,}449\).

   **¿Por qué?** El tiempo de establecimiento fija la parte real de los polos.

3. \(2\zeta\omega_n \approx 2,\ \omega_n^2 \approx 2{,}1\).

   **¿Por qué?** Son los coeficientes del denominador estándar.

**Resultado.** \(G(s) \approx \dfrac{2{,}1}{s^2 + 2s + 2{,}1}\); polos \(-1\pm j1{,}049\).

**Comprobación.** Con esos valores, \(M_p = 5\,\%\) y \(t_s = 4\) s.

#### Ejemplo 3 · De especificaciones a G(s): Mp = 20 %, ts = 1 s, K = 2 · *Intermedio*

**Enunciado.** Encuentra un sistema de segundo orden con sobrepico 20 %, tiempo de establecimiento (2 %) 1 s y ganancia DC 2.

1. \(\zeta = \dfrac{-\ln M_p}{\sqrt{\pi^2 + \ln^2 M_p}} = \dfrac{1{,}609}{\sqrt{\pi^2+2{,}59}} \approx 0{,}456\).

   **¿Por qué?** Se despeja \(\zeta\) de la fórmula del sobrepico (demostración 4).

2. \(\sigma = \zeta\omega_n = 4/t_s = 4\), así \(\omega_n = \sigma/\zeta \approx 8{,}773\).

   **¿Por qué?** El tiempo de establecimiento fija la parte real de los polos.

3. \(2\zeta\omega_n \approx 8,\ \omega_n^2 \approx 76{,}964\).

   **¿Por qué?** Son los coeficientes del denominador estándar.

**Resultado.** \(G(s) \approx \dfrac{153{,}927}{s^2 + 8s + 76{,}964}\); polos \(-4\pm j7{,}808\).

**Comprobación.** Con esos valores, \(M_p = 20\,\%\) y \(t_s = 1\) s.

#### Ejemplo 4 · De especificaciones a G(s): Mp = 16,3 %, ts = 0,8 s, K = 1 · *Avanzado*

**Enunciado.** Encuentra un sistema de segundo orden con sobrepico 16,3 %, tiempo de establecimiento (2 %) 0,8 s y ganancia DC 1.

1. \(\zeta = \dfrac{-\ln M_p}{\sqrt{\pi^2 + \ln^2 M_p}} = \dfrac{1{,}814}{\sqrt{\pi^2+3{,}291}} \approx 0{,}5\).

   **¿Por qué?** Se despeja \(\zeta\) de la fórmula del sobrepico (demostración 4).

2. \(\sigma = \zeta\omega_n = 4/t_s = 5\), así \(\omega_n = \sigma/\zeta \approx 9{,}999\).

   **¿Por qué?** El tiempo de establecimiento fija la parte real de los polos.

3. \(2\zeta\omega_n \approx 10,\ \omega_n^2 \approx 99{,}983\).

   **¿Por qué?** Son los coeficientes del denominador estándar.

**Resultado.** \(G(s) \approx \dfrac{99{,}983}{s^2 + 10s + 99{,}983}\); polos \(-5\pm j8{,}659\).

**Comprobación.** Con esos valores, \(M_p = 16{,}3\,\%\) y \(t_s = 0{,}8\) s.

#### Ejemplo 5 · De especificaciones a G(s): Mp = 30 %, ts = 3 s, K = 5 · *Avanzado*

**Enunciado.** Encuentra un sistema de segundo orden con sobrepico 30 %, tiempo de establecimiento (2 %) 3 s y ganancia DC 5.

1. \(\zeta = \dfrac{-\ln M_p}{\sqrt{\pi^2 + \ln^2 M_p}} = \dfrac{1{,}204}{\sqrt{\pi^2+1{,}45}} \approx 0{,}358\).

   **¿Por qué?** Se despeja \(\zeta\) de la fórmula del sobrepico (demostración 4).

2. \(\sigma = \zeta\omega_n = 4/t_s = 1{,}333\), así \(\omega_n = \sigma/\zeta \approx 3{,}726\).

   **¿Por qué?** El tiempo de establecimiento fija la parte real de los polos.

3. \(2\zeta\omega_n \approx 2{,}667,\ \omega_n^2 \approx 13{,}882\).

   **¿Por qué?** Son los coeficientes del denominador estándar.

**Resultado.** \(G(s) \approx \dfrac{69{,}411}{s^2 + 2{,}667s + 13{,}882}\); polos \(-1{,}333\pm j3{,}479\).

**Comprobación.** Con esos valores, \(M_p = 30\,\%\) y \(t_s = 3\) s.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 (camino inverso).

```python
# verificacion.py
from sympy import log, sqrt, pi, N

Mp, ts = 0.10, 2
zeta = N(-log(Mp) / sqrt(pi ** 2 + log(Mp) ** 2), 4)
sigma = 4 / ts
wn = N(sigma / zeta, 4)
print("zeta:", zeta)
print("wn:", wn)
print("wn^2:", N(wn ** 2, 5))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `zeta: 0.5912`, `wn: 3.383` y `wn^2: 11.446`, igual al Ejemplo 1.

**Práctica:** cambia `Mp, ts` a `0.05, 4` y confirma el Ejemplo 2 (\(\zeta\approx0{,}69\), \(\omega_n\approx1{,}449\)).

**Límite:** este camino inverso asume que las especificaciones (\(M_p\), \(t_s\)) provienen de un sistema de segundo orden puro; si el sistema real tiene polos adicionales o ceros, el \(\zeta\) y \(\omega_n\) calculados son solo una aproximación del comportamiento dominante.

