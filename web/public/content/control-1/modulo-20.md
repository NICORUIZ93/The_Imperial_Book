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

#### Decibeles y la escala logarítmica

Se dibuja \(|G|\) en decibeles, \(20\log_{10}|G|\), contra \(\omega\) en escala logarítmica. La ventaja: el logaritmo de un producto es la suma de logaritmos, así que el Bode de \(G_1G_2\) es la suma de los Bode de cada factor. Los ángulos también se suman.

#### Los bloques básicos

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

#### Márgenes de estabilidad

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

![Bode de magnitud](content/figures/control-1/bode-magnitud.svg)

![Bode de fase](content/figures/control-1/bode-fase.svg)

*Bode de \(\dfrac{100}{s(s+10)}\): magnitud (arriba) y fase (abajo). La línea vertical marca \(\omega_c = 7{,}86\) rad/s.*
