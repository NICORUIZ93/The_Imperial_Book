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

### Tema 2: Simulador: mueve ζ y ωn

**¿Por qué es importante?** Mover \(\zeta\) y \(\omega_n\) en el simulador te da la intuición de qué hace cada parámetro antes de usar las fórmulas.

Prueba esto: deja \(\omega_n = 2\) y mueve \(\zeta\) desde 0,05 hasta 1,5. Luego deja \(\zeta = 0{,}3\) y sube \(\omega_n\). Observa qué cambia en la curva y en los polos.

```anatomy
control-1-segundo-orden
```

*Respuesta al escalón unitario (arriba) y polos en el plano s (abajo).*

### Tema 3: Los cuatro casos según ζ

**¿Por qué es importante?** Clasificar el sistema por \(\zeta\) te dice de inmediato si va a oscilar y qué método usar para resolverlo.

| \(\zeta\) | Caso | Polos | Respuesta al escalón |
|---|---|---|---|
| \(0\) | No amortiguado | \(\pm j\omega_n\) | Oscila para siempre |
| \(0<\zeta<1\) | Subamortiguado | \(-\sigma\pm j\omega_d\) | Se pasa, oscila y se calma |
| \(1\) | Críticamente amortiguado | \(-\omega_n\) doble | Lo más rápido posible sin pasarse |
| \(>1\) | Sobreamortiguado | Dos reales negativos | Lento, sin sobrepaso |

![Efecto de ζ en la respuesta al escalón](content/figures/control-1/segundo-orden-zetas.svg)

*Misma \(\omega_n = 2\) y \(K = 1\) con \(\zeta = 0{,}2\), \(0{,}5\), \(1\) y \(2\). A menor \(\zeta\), más sobrepico.*

### Tema 4: Fórmulas del caso subamortiguado

**¿Por qué es importante?** Las fórmulas de \(M_p\), \(t_p\), \(t_s\) y \(t_r\) son las especificaciones con las que se diseña un controlador.

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

#### Ejemplo 2 · Todas las especificaciones · *Básico*

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

#### Ejemplo 3 · Impulso · *Básico*

> **Qué cambia respecto al anterior:** La entrada es un impulso, no un escalón.

**Enunciado.** \(G = \dfrac{10}{s^2+4s+20}\) con impulso unitario.

1. Con impulso, \(Y = G\). Completa el cuadrado: \((s+2)^2 + 16\), así que \(\sigma = 2\), \(\omega_d = 4\).

   **¿Por qué?** La respuesta al impulso es la inversa de \(G\).

2. Ajusta el numerador a \(\omega_d\): \(\dfrac{10}{4}\cdot\dfrac{4}{(s+2)^2+16}\).

   **¿Por qué?** La tabla del seno pide \(\omega\) arriba.

**Resultado:** \(y(t) = 2{,}5\,e^{-2t}\sin4t\)

#### Ejemplo 4 · Sobreamortiguado · *Intermedio*

> **Qué cambia respecto al anterior:** \(\zeta\) es mayor que 1.

**Enunciado.** \(G = \dfrac{6}{s^2+5s+6}\) con escalón unitario.

1. \(\omega_n = \sqrt6 = 2{,}45\); \(\zeta = \dfrac{5}{2\cdot2{,}45} = 1{,}02\).

   **¿Por qué?** Como \(\zeta > 1\), las raíces son reales: no hay oscilación ni \(M_p\).

2. Factoriza: \((s+2)(s+3)\). \(Y = \dfrac{6}{s(s+2)(s+3)}\).

   **¿Por qué?** Con raíces reales se usa el tapado de capítulo 4, no las fórmulas de \(M_p\).

3. Residuos: en 0, \(\dfrac{6}{6} = 1\); en \(-2\), \(\dfrac{6}{(-2)(1)} = -3\); en \(-3\), \(\dfrac{6}{(-3)(-1)} = 2\).

   **¿Por qué?** Tapado.

**Resultado:** \(y(t) = 1 - 3e^{-2t} + 2e^{-3t}\): sube sin pasarse

#### Ejemplo 5 · Críticamente amortiguado · *Intermedio*

> **Qué cambia respecto al anterior:** \(\zeta\) es exactamente 1.

**Enunciado.** \(G = \dfrac{9}{(s+3)^2}\) con escalón unitario.

1. \(\omega_n = 3\); expandiendo, \(s^2+6s+9\), así que \(2\zeta\cdot3 = 6\) y \(\zeta = 1\).

   **¿Por qué?** El caso límite entre oscilar y no oscilar.

2. \(Y = \dfrac{9}{s(s+3)^2} = \dfrac1s - \dfrac{1}{s+3} - \dfrac{3}{(s+3)^2}\).

   **¿Por qué?** Polo repetido (capítulo 4, Ejemplo 4).

**Resultado:** \(y(t) = 1 - e^{-3t} - 3te^{-3t}\)

#### Ejemplo 6 · De la gráfica a G(s) · *Nivel parcial*

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

#### Ejemplo 7 · De especificaciones a G(s) · *Nivel parcial*

> **Qué cambia respecto al anterior:** En vez de una gráfica, nos dan las especificaciones.

**Enunciado.** Diseña \(G\) con \(K = 1\), \(M_p = 10\,\%\) y \(t_s = 2\) s.

1. \(\zeta = \dfrac{-\ln0{,}1}{\sqrt{\pi^2+\ln^20{,}1}} = \dfrac{2{,}303}{\sqrt{9{,}870+5{,}302}} = 0{,}591\).

   **¿Por qué?** El sobrepico fija \(\zeta\).

2. \(\sigma = 4/t_s = 2\).

   **¿Por qué?** El tiempo de establecimiento fija \(\sigma\).

3. \(\omega_n = \sigma/\zeta = 2/0{,}591 = 3{,}38\), \(\omega_n^2 = 11{,}45\). Coeficiente de \(s\): \(2\sigma = 4\).

   **¿Por qué?** \(\sigma = \zeta\omega_n\) y \(2\zeta\omega_n = 2\sigma\).

**Resultado:** \(G = \dfrac{11{,}45}{s^2+4s+11{,}45}\)

#### Ejemplo 8 · Elegir la ganancia · *Nivel parcial*

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

### Tema 5: Práctica

**¿Por qué es importante?** Practicar el camino directo y el inverso (desde una gráfica) cubre los dos tipos de pregunta del parcial.

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
