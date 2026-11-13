# Módulo 20: Respuesta en frecuencia y diagramas de Bode

Otra forma de ver un sistema: qué le hace a una entrada senoidal de cada frecuencia. Con ella se miden los márgenes de estabilidad. Es el puente hacia Control 2.

**Al terminar podrás:**

- Explicar qué es \(G(j\omega)\) y por qué describe la salida senoidal.
- Trazar Bode asintótico de polos, ceros e integradores.
- Calcular el margen de fase y relacionarlo con \(\zeta\).

## Aprende construyendo

### Tema 1: Qué es la respuesta en frecuencia

**¿Por qué es importante?** La respuesta en frecuencia describe cómo responde un sistema a vibraciones y señales periódicas.

**Fuentes oficiales:** [Respuesta en frecuencia, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).

\[u(t) = \sin\omega t \quad\Longrightarrow\quad y_{ss}(t) = |G(j\omega)|\,\sin\big(\omega t + \angle G(j\omega)\big)\]

*Un sistema lineal estable no cambia la frecuencia: solo multiplica la amplitud por \(|G(j\omega)|\) y desfasa en \(\angle G(j\omega)\).*

#### Demostración

1. \(Y(s) = G(s)\dfrac{\omega}{s^2+\omega^2} = G(s)\dfrac{\omega}{(s-j\omega)(s+j\omega)}\).
2. Fracciones parciales: los polos de \(G\) (estables) dan términos que se apagan. Quedan los de \(\pm j\omega\).
3. Residuo en \(j\omega\): \(\dfrac{G(j\omega)\,\omega}{2j\omega} = \dfrac{G(j\omega)}{2j}\). En \(-j\omega\), su conjugado.
4. \(y_{ss} = \dfrac{G(j\omega)}{2j}e^{j\omega t} - \dfrac{\overline{G(j\omega)}}{2j}e^{-j\omega t}\). Con \(G(j\omega) = |G|e^{j\phi}\): \(y_{ss} = |G|\,\dfrac{e^{j(\omega t+\phi)} - e^{-j(\omega t+\phi)}}{2j} = |G|\sin(\omega t+\phi)\) (Euler, capítulo 2).

∎

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Salida de \(\frac{10}{s + 10}\) ante \(1\sin(10t)\) · *Básico*

**Enunciado.** Halla la salida en régimen permanente.

1. \(|G(j10)| \approx 0{,}707,\ \angle G \approx -45^\circ\).

   **¿Por qué?** En régimen permanente un sistema lineal estable responde a un seno con un seno de la misma frecuencia, escalado por \(|G|\) y desfasado \(\angle G\).

**Resultado.** \(y_{ss}(t) \approx 0{,}707\sin(10t -45^\circ)\).

#### Ejemplo 2 · Salida de \(\frac{5}{s + 1}\) ante \(2\sin(t)\) · *Básico*

**Enunciado.** Halla la salida en régimen permanente.

1. \(|G(j1)| \approx 3{,}536,\ \angle G \approx -45^\circ\).

   **¿Por qué?** En régimen permanente un sistema lineal estable responde a un seno con un seno de la misma frecuencia, escalado por \(|G|\) y desfasado \(\angle G\).

**Resultado.** \(y_{ss}(t) \approx 7{,}071\sin(t -45^\circ)\).

#### Ejemplo 3 · Salida de \(\frac{100}{s^{2} + 2 s + 100}\) ante \(1\sin(10t)\) · *Intermedio*

**Enunciado.** Halla la salida en régimen permanente.

1. \(|G(j10)| \approx 5,\ \angle G \approx -90^\circ\).

   **¿Por qué?** En régimen permanente un sistema lineal estable responde a un seno con un seno de la misma frecuencia, escalado por \(|G|\) y desfasado \(\angle G\).

**Resultado.** \(y_{ss}(t) \approx 5\sin(10t -90^\circ)\).

#### Ejemplo 4 · Salida de \(\frac{1}{s + 2}\) ante \(4\sin(2t)\) · *Básico*

**Enunciado.** Halla la salida en régimen permanente.

1. \(|G(j2)| \approx 0{,}354,\ \angle G \approx -45^\circ\).

   **¿Por qué?** En régimen permanente un sistema lineal estable responde a un seno con un seno de la misma frecuencia, escalado por \(|G|\) y desfasado \(\angle G\).

**Resultado.** \(y_{ss}(t) \approx 1{,}414\sin(2t -45^\circ)\).

#### Ejemplo 5 · Salida de \(\frac{50}{\left(s + 1\right) \left(s + 10\right)}\) ante \(1\sin(5t)\) · *Intermedio*

**Enunciado.** Halla la salida en régimen permanente.

1. \(|G(j5)| \approx 0{,}877,\ \angle G \approx -105{,}3^\circ\).

   **¿Por qué?** En régimen permanente un sistema lineal estable responde a un seno con un seno de la misma frecuencia, escalado por \(|G|\) y desfasado \(\angle G\).

**Resultado.** \(y_{ss}(t) \approx 0{,}877\sin(5t -105{,}3^\circ)\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1.

```python
# verificacion.py
from sympy import I, Abs, arg, deg, N

s = 10 * I
G = 10 / (s + 10)
print("mag:", N(Abs(G), 4))
print("fase_grados:", N(deg(arg(G)), 4))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `mag: 0.7071` y `fase_grados: -45.00`, igual al Ejemplo 1.

**Práctica:** cambia `s` a `1*I` con `G = 5/(s+1)` y confirma el Ejemplo 2 (\(|G|\approx3{,}536\), fase \(\approx-45°\)).

**Límite:** esta fórmula solo describe la salida en **régimen permanente** (\(y_{ss}\)); no incluye el transitorio inicial, que depende de las condiciones iniciales y se apaga con el tiempo (capítulo 13).

### Tema 2: Decibeles y la escala logarítmica

**¿Por qué es importante?** Los decibeles y la escala logarítmica convierten productos en sumas y permiten dibujar Bode a mano.

**Fuentes oficiales:** [Respuesta en frecuencia, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).

Se dibuja \(|G|\) en decibeles, \(20\log_{10}|G|\), contra \(\omega\) en escala logarítmica. La ventaja: el logaritmo de un producto es la suma de logaritmos, así que el Bode de \(G_1G_2\) es la suma de los Bode de cada factor. Los ángulos también se suman.

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Pasar 10 a decibeles · *Básico*

**Enunciado.** ¿Cuántos dB son una ganancia de 10?

1. \(20\log_{10}(10) = 20\,\text{dB}\).

   **¿Por qué?** Los dB comprimen en sumas lo que en magnitud serían productos: ×10 son +20 dB, ×2 son ≈ +6 dB.

**Resultado.** 20 dB.

#### Ejemplo 2 · Pasar 100 a decibeles · *Básico*

**Enunciado.** ¿Cuántos dB son una ganancia de 100?

1. \(20\log_{10}(100) = 40\,\text{dB}\).

   **¿Por qué?** Los dB comprimen en sumas lo que en magnitud serían productos: ×10 son +20 dB, ×2 son ≈ +6 dB.

**Resultado.** 40 dB.

#### Ejemplo 3 · Pasar 0,1 a decibeles · *Básico*

**Enunciado.** ¿Cuántos dB son una ganancia de 0,1?

1. \(20\log_{10}(0{,}1) = -20\,\text{dB}\).

   **¿Por qué?** Los dB comprimen en sumas lo que en magnitud serían productos: ×10 son +20 dB, ×2 son ≈ +6 dB.

**Resultado.** -20 dB. Una ganancia menor que 1 da dB negativos (atenúa).

#### Ejemplo 4 · Pasar 2 a decibeles · *Básico*

**Enunciado.** ¿Cuántos dB son una ganancia de 2?

1. \(20\log_{10}(2) = 6{,}02\,\text{dB}\).

   **¿Por qué?** Los dB comprimen en sumas lo que en magnitud serían productos: ×10 son +20 dB, ×2 son ≈ +6 dB.

**Resultado.** 6,02 dB.

#### Ejemplo 5 · Pasar 0,5 a decibeles · *Básico*

**Enunciado.** ¿Cuántos dB son una ganancia de 0,5?

1. \(20\log_{10}(0{,}5) = -6{,}02\,\text{dB}\).

   **¿Por qué?** Los dB comprimen en sumas lo que en magnitud serían productos: ×10 son +20 dB, ×2 son ≈ +6 dB.

**Resultado.** -6,02 dB. Una ganancia menor que 1 da dB negativos (atenúa).

#### Ejemplo 6 · Pasar 50 a decibeles · *Intermedio*

**Enunciado.** ¿Cuántos dB son una ganancia de 50?

1. \(20\log_{10}(50) = 33{,}98\,\text{dB}\).

   **¿Por qué?** Los dB comprimen en sumas lo que en magnitud serían productos: ×10 son +20 dB, ×2 son ≈ +6 dB.

**Resultado.** 33,98 dB.

#### Ejemplo 7 · De -6 dB a magnitud · *Básico*

**Enunciado.** ¿Qué ganancia corresponde a -6 dB?

1. \(|G| = 10^{\text{dB}/20} = 10^{-0{,}3} \approx 0{,}501\).

   **¿Por qué?** Es la operación inversa: se despeja \(|G|\) de \(20\log_{10}|G|\).

**Resultado.** 0,501. Por eso −6 dB se lee como "la mitad".

#### Ejemplo 8 · De 34 dB a magnitud · *Intermedio*

**Enunciado.** ¿Qué ganancia corresponde a 34 dB?

1. \(|G| = 10^{\text{dB}/20} = 10^{1{,}7} \approx 50{,}119\).

   **¿Por qué?** Es la operación inversa: se despeja \(|G|\) de \(20\log_{10}|G|\).

**Resultado.** 50,119.

#### Ejemplo 9 · Ganancia total de dos bloques en serie · *Intermedio*

**Enunciado.** Un bloque amplifica 20 dB y el siguiente atenúa a la mitad. ¿Cuál es la ganancia total?

1. En magnitud: \(10 \times 0{,}5 = 5\). En dB: \(20 + (-6{,}02) = 13{,}98\) dB.

   **¿Por qué?** Multiplicar magnitudes equivale a sumar dB; por eso Bode suma las curvas de cada factor.

**Resultado.** 5 veces, o ≈ 14 dB (\(20\log_{10}5 \approx 13{,}98\)).

#### Ejemplo 10 · Leer una pendiente de −40 dB/década · *Intermedio*

**Enunciado.** Entre \(\omega = 10\) y \(\omega = 100\) la magnitud baja de 0 dB a −40 dB. ¿Qué indica?

1. Una década es multiplicar la frecuencia por 10; −40 dB son una división por 100.

   **¿Por qué?** La magnitud cae como \(1/\omega^2\).

**Resultado.** Hay dos polos más que ceros actuando en ese rango (cada polo aporta −20 dB/década).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar los Ejemplos 1 y 7 (ida y vuelta).

```python
# verificacion.py
from sympy import log, N

dB = N(20 * log(10, 10), 4)
print("dB:", dB)

magnitud = N(10 ** (-6 / 20), 4)
print("magnitud:", magnitud)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `dB: 20.00` (Ejemplo 1) y `magnitud: 0.5012` (Ejemplo 7, −6 dB ≈ la mitad).

**Práctica:** cambia `log(10, 10)` a `log(50, 10)` y confirma `dB: 33.98` (Ejemplo 6).

**Límite:** esta conversión es exacta pero solo para la **magnitud**; los ángulos no se convierten a dB, se suman directamente en grados (o radianes) al combinar bloques en serie.

### Tema 3: Los bloques básicos

**¿Por qué es importante?** Con los bloques básicos trazas el Bode asintótico de cualquier función de transferencia.

**Fuentes oficiales:** [Respuesta en frecuencia, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).

| Factor | Magnitud | Fase |
|---|---|---|
| Ganancia \(K\) | Recta horizontal en \(20\log K\) | 0° |
| Integrador \(1/s\) | −20 dB/década, pasa por 0 dB en \(\omega=1\) | −90° |
| Polo \(\dfrac{1}{\tau s+1}\) | 0 dB hasta \(1/\tau\), luego −20 dB/década | 0° → −90°, vale −45° en \(1/\tau\) |
| Cero \(\tau s+1\) | 0 dB hasta \(1/\tau\), luego +20 dB/década | 0° → +90° |
| Par complejo \(\dfrac{\omega_n^2}{s^2+2\zeta\omega_ns+\omega_n^2}\) | 0 dB hasta \(\omega_n\), luego −40 dB/década; pico si \(\zeta<0{,}707\) | 0° → −180°, vale −90° en \(\omega_n\) |

#### Demostración · el polo de primer orden

1. \(G(j\omega) = \dfrac{1}{1+j\omega\tau}\), así que \(|G| = \dfrac{1}{\sqrt{1+\omega^2\tau^2}}\) y \(\angle G = -\arctan(\omega\tau)\).
2. Si \(\omega\tau \ll 1\): \(|G|\approx1\), 0 dB.
3. Si \(\omega\tau \gg 1\): \(|G|\approx\dfrac{1}{\omega\tau}\), en dB \(-20\log\omega - 20\log\tau\): una recta de pendiente −20 dB por cada década de \(\omega\).
4. En \(\omega = 1/\tau\): \(|G| = 1/\sqrt2\), que es −3 dB, y \(\angle G = -\arctan1 = -45°\).

∎

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Bode asintótico de Constante \(K = 20\) · *Básico*

**Enunciado.** Traza las asíntotas de magnitud y fase de Constante \(K = 20\).

1. Recta horizontal en \(20\log20 \approx 26\) dB; fase 0°.

   **¿Por qué?** Una ganancia no depende de la frecuencia.

**Resultado.** Esa es la forma que se suma con los demás factores para obtener el diagrama completo.

#### Ejemplo 2 · Bode asintótico de Integrador \(1/s\) · *Básico*

**Enunciado.** Traza las asíntotas de magnitud y fase de Integrador \(1/s\).

1. Recta de −20 dB/década que cruza 0 dB en \(\omega = 1\); fase −90° constante.

   **¿Por qué?** \(|1/(j\omega)| = 1/\omega\): cada década la magnitud baja 10 veces.

**Resultado.** Esa es la forma que se suma con los demás factores para obtener el diagrama completo.

#### Ejemplo 3 · Bode asintótico de Polo simple \(\dfrac{1}{s/5 + 1}\) · *Básico*

**Enunciado.** Traza las asíntotas de magnitud y fase de Polo simple \(\dfrac{1}{s/5 + 1}\).

1. 0 dB hasta \(\omega = 5\) y luego −20 dB/década; en la esquina el valor real es −3 dB. Fase de 0° a −90°, con −45° en \(\omega = 5\).

   **¿Por qué?** Para \(\omega \ll 5\) el factor vale ≈1; para \(\omega \gg 5\) se comporta como \(5/(j\omega)\).

**Resultado.** Esa es la forma que se suma con los demás factores para obtener el diagrama completo.

#### Ejemplo 4 · Bode asintótico de Cero simple \(s/2 + 1\) · *Básico*

**Enunciado.** Traza las asíntotas de magnitud y fase de Cero simple \(s/2 + 1\).

1. 0 dB hasta \(\omega = 2\) y luego +20 dB/década; fase de 0° a +90°.

   **¿Por qué?** Es el inverso del polo: todo cambia de signo.

**Resultado.** Esa es la forma que se suma con los demás factores para obtener el diagrama completo.

#### Ejemplo 5 · Bode asintótico de Polos complejos \(\dfrac{100}{s^2 + 4s + 100}\) · *Intermedio*

**Enunciado.** Traza las asíntotas de magnitud y fase de Polos complejos \(\dfrac{100}{s^2 + 4s + 100}\).

1. 0 dB hasta \(\omega_n = 10\) y luego −40 dB/década; pico de resonancia porque \(\zeta = 0{,}2\). Fase de 0° a −180°.

   **¿Por qué?** Dos polos juntos duplican la pendiente; un \(\zeta\) pequeño produce el pico.

**Resultado.** Esa es la forma que se suma con los demás factores para obtener el diagrama completo.

#### Ejemplo 6 · Bode asintótico de Producto \(\dfrac{10}{s(s/10 + 1)}\) · *Intermedio*

**Enunciado.** Traza las asíntotas de magnitud y fase de Producto \(\dfrac{10}{s(s/10 + 1)}\).

1. Integrador + ganancia: −20 dB/década pasando por 20 dB en \(\omega = 1\); desde \(\omega = 10\) la pendiente pasa a −40 dB/década.

   **¿Por qué?** En Bode los factores se suman: se trazan por separado y se suman las rectas.

**Resultado.** Esa es la forma que se suma con los demás factores para obtener el diagrama completo.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 (constante \(K=20\)).

```python
# verificacion.py
from sympy import log, N

K = 20
print("dB:", N(20 * log(K, 10), 3))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `dB: 26.0`, igual a la recta horizontal del Ejemplo 1.

**Práctica:** calcula en cuántos dB se cruza el eje 0 dB el integrador \(1/s\) del Ejemplo 2: ¿en qué \(\omega\) pasa de positivo a negativo?

**Límite:** esta tabla da las **asíntotas** (rectas aproximadas); el valor real en la esquina del polo/cero se desvía hasta 3 dB (demostración de este tema), y la curva real es suave, no angulosa como la asíntota.

### Tema 4: Márgenes de estabilidad

**¿Por qué es importante?** El margen de fase mide qué tan lejos está un sistema de la inestabilidad y se relaciona con \(\zeta\).

**Fuentes oficiales:** [Respuesta en frecuencia, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlFrequency).

- **Frecuencia de cruce de ganancia \(\omega_c\):** donde \(|G(j\omega)| = 1\) (0 dB).
- **Margen de fase:** \(MF = 180° + \angle G(j\omega_c)\). Cuánto atraso adicional aguanta antes de volverse inestable.
- **Margen de ganancia:** cuánto se puede multiplicar la ganancia en la frecuencia donde la fase vale −180°.

> **Regla práctica:** para \(\zeta\) hasta 0,6 aproximadamente, \(MF \approx 100\,\zeta\) (en grados). Un margen de fase de 45° a 60° da buen comportamiento.

#### Ejemplo 1 · Un polo simple · *Básico*

**Enunciado.** \(G = \dfrac{10}{s+10}\). ¿Cuánto vale la magnitud en \(\omega = 1\), 10 y 100 rad/s?

1. Forma de Bode: \(\dfrac{1}{0{,}1s+1}\). Corte en \(1/\tau = 10\).

   **¿Por qué?** Para leer la frecuencia de corte se usa la forma \(\tau s+1\).

2. \(\omega = 1\): muy por debajo del corte, \(\approx 0\) dB.

   **¿Por qué?** Antes del corte el polo no hace nada.

3. \(\omega = 10\): \(1/\sqrt2\), es decir \(-3\) dB y \(-45°\).

   **¿Por qué?** Justo en el corte (demostración arriba).

4. \(\omega = 100\): una década después, \(\approx -20\) dB.

   **¿Por qué?** Después del corte baja 20 dB por década.

**Resultado:** 0 dB, −3 dB, −20 dB

#### Ejemplo 2 · Bode y margen de fase · *Experto*

> **Qué cambia respecto al anterior:** Se combinan un integrador y un polo, y se calcula el margen.

**Enunciado.** \(G = \dfrac{100}{s(s+10)}\).

1. Forma de Bode: \(\dfrac{10}{s(0{,}1s+1)}\): ganancia 10, un integrador, un polo en 10.

   **¿Por qué?** Se separan los bloques básicos de la tabla.

2. Magnitud: recta de −20 dB/década que vale 20 dB en \(\omega = 1\); desde 10 baja a −40 dB/década.

   **¿Por qué?** El integrador da −20 y el polo agrega otros −20 después de su corte.

3. Cruce: \(\dfrac{100}{\omega\sqrt{\omega^2+100}} = 1 \Rightarrow \omega^4 + 100\omega^2 - 10\,000 = 0\). Con \(x = \omega^2\): \(x = 61{,}8\), \(\omega_c = 7{,}86\).

   **¿Por qué?** Se eleva al cuadrado y se resuelve una cuadrática en \(\omega^2\).

4. Fase: \(-90° - \arctan(7{,}86/10) = -128{,}2°\). \(MF = 180° - 128{,}2° = 51{,}8°\).

   **¿Por qué?** Definición del margen de fase.

5. Comprobación: lazo cerrado \(s^2 + 10s + 100\), \(\zeta = 0{,}5\); \(MF \approx 100\zeta = 50°\).

   **¿Por qué?** La regla práctica coincide.

**Resultado:** \(MF = 51{,}8°\)

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar las magnitudes del Ejemplo 1.

```python
# verificacion.py
from sympy import I, Abs, log, N

def mag_dB(omega):
    s = omega * I
    G = 10 / (s + 10)
    return N(20 * log(Abs(G), 10), 3)

print("omega=1:", mag_dB(1))
print("omega=10:", mag_dB(10))
print("omega=100:", mag_dB(100))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `omega=1: -0.0432` (≈0 dB), `omega=10: -3.01` y `omega=100: -20.0`, igual al Ejemplo 1.

**Práctica:** cambia `G` a `100/(s*(s+10))` y evalúa en `omega=7.86` para confirmar que la magnitud está cerca de 0 dB (el \(\omega_c\) del Ejemplo 2).

**Límite:** este script evalúa la magnitud exacta en puntos concretos; el margen de fase del Ejemplo 2 exige además encontrar \(\omega_c\) resolviendo \(|G(j\omega)|=1\), que no es una simple sustitución sino resolver una ecuación.

![Bode de magnitud](content/figures/control-1/bode-magnitud.svg)

![Bode de fase](content/figures/control-1/bode-fase.svg)

*Bode de \(\dfrac{100}{s(s+10)}\): magnitud (arriba) y fase (abajo). La línea vertical marca \(\omega_c = 7{,}86\) rad/s.*

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 3 · Márgenes de \(\frac{10}{s^{3} + 3 s^{2} + 2 s}\) · *Intermedio*

**Enunciado.** Halla el margen de fase y el margen de ganancia.

1. Cruce de ganancia (|G| = 1): \(\omega_{gc} \approx 1{,}802\) rad/s, donde la fase vale \(-193^\circ\).

   **¿Por qué?** El margen de fase es cuánto le falta a la fase para llegar a −180° justo donde la ganancia es 1.

2. Cruce de fase (−180°): \(\omega_{pc} \approx 1{,}414\) rad/s, donde \(|G| \approx 1{,}667\).

   **¿Por qué?** El margen de ganancia es cuánto se puede multiplicar la ganancia antes de que \(|G| = 1\) en ese punto.

**Resultado.** \(MF \approx -13^\circ\), \(MG \approx -4{,}4\,\text{dB}\): lazo cerrado **inestable**.

#### Ejemplo 4 · Márgenes de \(\frac{40}{s^{3} + 6 s^{2} + 8 s}\) · *Intermedio*

**Enunciado.** Halla el margen de fase y el margen de ganancia.

1. Cruce de ganancia (|G| = 1): \(\omega_{gc} \approx 2{,}577\) rad/s, donde la fase vale \(-175^\circ\).

   **¿Por qué?** El margen de fase es cuánto le falta a la fase para llegar a −180° justo donde la ganancia es 1.

2. Cruce de fase (−180°): \(\omega_{pc} \approx 2{,}828\) rad/s, donde \(|G| \approx 0{,}833\).

   **¿Por qué?** El margen de ganancia es cuánto se puede multiplicar la ganancia antes de que \(|G| = 1\) en ese punto.

**Resultado.** \(MF \approx 5^\circ\), \(MG \approx 1{,}6\,\text{dB}\): lazo cerrado **estable**.

#### Ejemplo 5 · Márgenes de \(\frac{5}{s^{3} + 3 s^{2} + 3 s + 1}\) · *Intermedio*

**Enunciado.** Halla el margen de fase y el margen de ganancia.

1. Cruce de ganancia (|G| = 1): \(\omega_{gc} \approx 1{,}387\) rad/s, donde la fase vale \(-162{,}6^\circ\).

   **¿Por qué?** El margen de fase es cuánto le falta a la fase para llegar a −180° justo donde la ganancia es 1.

2. Cruce de fase (−180°): \(\omega_{pc} \approx 1{,}732\) rad/s, donde \(|G| \approx 0{,}625\).

   **¿Por qué?** El margen de ganancia es cuánto se puede multiplicar la ganancia antes de que \(|G| = 1\) en ese punto.

**Resultado.** \(MF \approx 17{,}4^\circ\), \(MG \approx 4{,}1\,\text{dB}\): lazo cerrado **estable**.

#### Ejemplo 6 · Márgenes de \(\frac{100}{s^{3} + 15 s^{2} + 50 s}\) · *Avanzado*

**Enunciado.** Halla el margen de fase y el margen de ganancia.

1. Cruce de ganancia (|G| = 1): \(\omega_{gc} \approx 1{,}845\) rad/s, donde la fase vale \(-120{,}7^\circ\).

   **¿Por qué?** El margen de fase es cuánto le falta a la fase para llegar a −180° justo donde la ganancia es 1.

2. Cruce de fase (−180°): \(\omega_{pc} \approx 7{,}071\) rad/s, donde \(|G| \approx 0{,}133\).

   **¿Por qué?** El margen de ganancia es cuánto se puede multiplicar la ganancia antes de que \(|G| = 1\) en ese punto.

**Resultado.** \(MF \approx 59{,}3^\circ\), \(MG \approx 17{,}5\,\text{dB}\): lazo cerrado **estable**.

#### Verificación con código

En `academia-labs/control-1/verificacion.py`, comprueba el cruce y el margen del Ejemplo 2. La variable `x` representa \(\omega_c^2\); se conserva solo su raíz positiva porque la frecuencia no puede ser negativa.

```python
# verificacion.py
from sympy import symbols, solve, sqrt, atan, deg

x = symbols("x", real=True)
raiz_positiva = next(r for r in solve(x**2 + 100*x - 10000, x) if r > 0)
omega_c = sqrt(raiz_positiva)
fase = -90 - deg(atan(omega_c / 10))
margen = 180 + fase
print("cruce:", round(float(omega_c), 2))
print("fase:", round(float(fase), 1))
print("margen:", round(float(margen), 1))
```

Con el entorno del módulo 0 activo, ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `cruce: 7.86`, `fase: -128.2`, `margen: 51.8`. Si aparece una frecuencia imaginaria, revisa que elegiste la raíz positiva de \(x\).

**Práctica:** cambia la ganancia de 100 a 25. Sustituye `10000` por `625` en la ecuación de `x` y calcula de nuevo \(\omega_c\), fase y margen antes de ejecutar. **Límite:** este cálculo cubre un cruce de ganancia del Ejemplo 2; para sistemas con varios cruces también hay que inspeccionar todos los cruces y el margen de ganancia.

