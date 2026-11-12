# Módulo 16: Plano s, estabilidad y zona de diseño

Dónde están los polos te dice cómo se comporta el sistema sin hacer cuentas. Las especificaciones se vuelven regiones del plano.

**Al terminar podrás:**

- Decidir si un sistema es estable mirando sus polos.
- Leer \(\zeta\), \(\omega_n\), \(M_p\), \(t_p\) y \(t_s\) de la posición de un polo.
- Dibujar la zona de diseño para unas especificaciones y explicar por qué es esa (Parcial 2).
- Verificar si unos polos candidatos cumplen.

## Aprende construyendo

### Tema 1: Geometría de un polo

**¿Por qué es importante?** Leer la geometría de un polo te da \(\zeta\), \(\omega_n\) y las especificaciones mirando un dibujo.

**Fuentes oficiales:** [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

![Geometría de un polo complejo: sigma, omega d, omega n y theta](content/figures/control-1/geometria-polo.svg)

*La distancia al origen es \(\omega_n\), la distancia al eje imaginario es \(\sigma\), la altura es \(\omega_d\) y el ángulo con el eje real negativo es \(\theta\), con \(\zeta = \cos\theta\).*

| Si el polo se mueve… | Efecto |
|---|---|
| Más a la izquierda (\(\sigma\) ↑) | Se estabiliza antes: \(t_s = 4/\sigma\) ↓ |
| Más arriba (\(\omega_d\) ↑) | Pico más temprano: \(t_p = \pi/\omega_d\) ↓ |
| Más cerca del eje real (\(\theta\) ↓) | Más amortiguado: \(\zeta\) ↑, \(M_p\) ↓ |
| Más lejos del origen (\(\omega_n\) ↑) con el mismo ángulo | Más rápido, mismo \(M_p\) |

#### Estabilidad

| Dónde están los polos | Sistema |
|---|---|
| Todos con parte real negativa | Estable |
| Alguno en el eje imaginario (simple), ninguno a la derecha | Marginalmente estable: oscila o se queda constante |
| Alguno con parte real positiva o repetido en el eje imaginario | Inestable |

#### Ejemplo 1 · Clasificar por estabilidad · *Básico*

**Enunciado.** Clasifica: (a) \((s+1)(s+4)\), (b) \(s^2 - s + 2\), (c) \(s^2+9\), (d) \(s^2+4s+13\).

1. (a) Raíces \(-1\) y \(-4\): ambas negativas. Estable.

   **¿Por qué?** Polos reales negativos dan \(e^{-at}\), que se apaga.

2. (b) Hay un coeficiente negativo: \(-1\). Raíces \(\dfrac{1\pm\sqrt{1-8}}{2} = 0{,}5\pm1{,}32j\). Inestable.

   **¿Por qué?** Parte real positiva da \(e^{+0{,}5t}\), que crece.

3. (c) \(s^2 = -9 \Rightarrow \pm3j\). Marginalmente estable.

   **¿Por qué?** Parte real cero: \(\sin3t\), que oscila para siempre sin crecer ni apagarse.

4. (d) Atajo de capítulo 2: \(-2\pm3j\). Estable.

   **¿Por qué?** Parte real negativa.

**Resultado:** Estable: (a) y (d). Inestable: (b). Marginal: (c)

> Atajo para segundo orden: todos los coeficientes positivos ⇔ estable.

#### Ejemplo 2 · Leer todo desde el polo · *Intermedio*

> **Qué cambia respecto al anterior:** Ya no se clasifica: se miden las especificaciones.

**Enunciado.** Polos en \(-4\pm3j\).

1. \(\sigma = 4\) (distancia al eje imaginario), \(\omega_d = 3\) (altura).

   **¿Por qué?** Lectura directa de la geometría (figura 16.1).

2. \(\omega_n = \sqrt{4^2+3^2} = 5\); \(\zeta = \sigma/\omega_n = 0{,}8\).

   **¿Por qué?** \(\omega_n\) es la distancia al origen y \(\zeta = \cos\theta\).

3. \(M_p = e^{-4\pi/3} = 1{,}5\,\%\); \(t_p = \pi/3 = 1{,}05\) s; \(t_s = 4/4 = 1\) s.

   **¿Por qué?** Fórmulas de capítulo 13 con \(\sigma\) y \(\omega_d\).

**Resultado:** \(\zeta = 0{,}8\), \(M_p = 1{,}5\,\%\), \(t_s = 1\) s

#### La zona de diseño

> **Idea clave.** Es la región del plano s donde deben quedar los polos para cumplir las especificaciones. Cada especificación traza una frontera; la zona es la intersección de todas.

| Especificación | Se convierte en | Frontera |
|---|---|---|
| \(M_p \le M_{\max}\) | \(\zeta \ge \zeta_{\min}\) | Un cono desde el origen con \(\theta \le \arccos\zeta_{\min}\) |
| \(t_s \le t_{\max}\) | \(\sigma \ge 4/t_{\max}\) | Línea vertical; los polos a su izquierda |
| \(t_p \le t_{\max}\) | \(\omega_d \ge \pi/t_{\max}\) | Líneas horizontales; los polos por fuera de la franja |

#### Demostración · por qué cada especificación es esa frontera

1. **Sobrepico → cono.** \(M_p\) depende solo de \(\zeta\) y crece cuando \(\zeta\) baja. Entonces \(M_p \le M_{\max} \iff \zeta \ge \zeta_{\min}\). Como \(\zeta = \cos\theta\) y el coseno decrece entre 0° y 90°, \(\zeta \ge \zeta_{\min} \iff \theta \le \arccos\zeta_{\min}\). Los puntos con ángulo menor que \(\theta_{\max}\) respecto al eje real negativo forman un cono con vértice en el origen.
2. **Establecimiento → vertical.** \(t_s = 4/\sigma \le t_{\max} \iff \sigma \ge 4/t_{\max}\). Los puntos con parte real \(\le -4/t_{\max}\) están a la izquierda de una recta vertical.
3. **Tiempo pico → horizontales.** \(t_p = \pi/\omega_d \le t_{\max} \iff \omega_d \ge \pi/t_{\max}\): parte imaginaria por encima de una recta horizontal (y su espejo abajo).
4. Todas deben cumplirse a la vez, así que la zona es la intersección de las tres regiones.

∎

![Zona de diseño para polos en -3 más o menos 5j](content/figures/control-1/zona-diseno.svg)

*Zona del Parcial 2, punto 2: a la izquierda de \(\sigma = -3\) y dentro del cono de ±59°.*

**Procedimiento para dibujar la zona**

1. Pasa \(M_p\) a \(\zeta_{\min}\) con \(\zeta = \dfrac{-\ln M_p}{\sqrt{\pi^2+\ln^2M_p}}\), y luego a \(\theta_{\max} = \arccos\zeta_{\min}\).
2. Pasa \(t_s\) a \(\sigma_{\min} = 4/t_s\).
3. Si hay \(t_p\), pásalo a \(\omega_{d,\min} = \pi/t_p\).
4. Dibuja las fronteras y sombrea donde se cumplen todas a la vez.
5. Explica el porqué: cada especificación depende solo de la posición del polo.

#### Ejemplo 3 · Zona desde especificaciones · *Intermedio*

**Enunciado.** \(M_p \le 20\,\%\) y \(t_s \le 2\) s.

1. \(\ln0{,}2 = -1{,}609\). \(\zeta_{\min} = \dfrac{1{,}609}{\sqrt{9{,}870+2{,}590}} = 0{,}456\).

   **¿Por qué?** El sobrepico fija el amortiguamiento mínimo.

2. \(\theta_{\max} = \arccos0{,}456 = 62{,}9°\).

   **¿Por qué?** \(\zeta = \cos\theta\): menos ángulo, más amortiguamiento.

3. \(\sigma_{\min} = 4/2 = 2\).

   **¿Por qué?** \(t_s = 4/\sigma\).

**Resultado:** Izquierda de \(s = -2\) y dentro del cono de ±62,9°

#### Ejemplo 4 · Tres especificaciones · *Intermedio*

> **Qué cambia respecto al anterior:** Se agrega el tiempo pico.

**Enunciado.** \(M_p \le 5\,\%\), \(t_s \le 0{,}8\) s, \(t_p \le 0{,}5\) s.

1. \(\zeta_{\min} = \dfrac{2{,}996}{\sqrt{9{,}870+8{,}974}} = 0{,}690\); \(\theta_{\max} = 46{,}4°\).

   **¿Por qué?** Como en el Ejemplo 3.

2. \(\sigma_{\min} = 4/0{,}8 = 5\).

   **¿Por qué?** Igual.

3. \(\omega_{d,\min} = \pi/0{,}5 = 6{,}28\).

   **¿Por qué?** El tiempo pico agrega las rectas horizontales.

**Resultado:** Izquierda de \(-5\), cono de ±46,4° y \(|\omega_d| \ge 6{,}28\)

#### Ejemplo 5 · ¿Cumple un candidato? · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se usa la zona para verificar.

**Enunciado.** Con \(M_p \le 20\,\%\) y \(t_s \le 2\) s, ¿sirven \(-3\pm4j\) y \(-2\pm5j\)?

1. \(-3\pm4j\): \(\sigma = 3 \ge 2\) sí. \(\theta = \arctan(4/3) = 53{,}1° \le 62{,}9°\) sí.

   **¿Por qué?** Hay que revisar las dos fronteras del Ejemplo 3.

2. \(-2\pm5j\): \(\sigma = 2\), justo en el límite. \(\theta = \arctan(5/2) = 68{,}2° > 62{,}9°\): no cumple.

   **¿Por qué?** Está fuera del cono: \(\zeta = 2/\sqrt{29} = 0{,}371\) da \(M_p = 28{,}5\,\%\).

**Resultado:** \(-3\pm4j\) sí; \(-2\pm5j\) no

#### Ejemplo 6 · De polos a G(s) y su zona (Parcial 2) · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se pide \(G\) y la zona a la vez.

**Enunciado.** Polos en \(-3\pm5j\), \(K = 10\).

1. Denominador: \((s+3)^2 + 25 = s^2+6s+34\). \(\omega_n^2 = 34\).

   **¿Por qué?** Producto de conjugados (capítulo 2).

2. \(G = \dfrac{K\omega_n^2}{\ldots} = \dfrac{340}{s^2+6s+34}\).

   **¿Por qué?** Forma estándar con \(K = 10\).

3. \(\zeta = 3/\sqrt{34} = 0{,}514\), \(\theta = 59°\), \(M_p = e^{-3\pi/5} = 15{,}2\,\%\), \(t_s = 1{,}33\) s.

   **¿Por qué?** Ejemplo 2.

4. Zona: izquierda de \(\sigma = -3\) y dentro del cono de ±59°.

   **¿Por qué?** Cualquier polo ahí es al menos igual de rápido y de amortiguado.

**Resultado:** \(G = \dfrac{340}{s^2+6s+34}\) y la zona de la figura

#### Errores comunes

- Medir \(\theta\) desde el eje real positivo: es desde el negativo.
- Poner los polos a la derecha de la línea de \(\sigma\): a la izquierda es más rápido.
- Dibujar la zona sin explicar el porqué, que también lo preguntan.

#### Práctica

- **1.**Zona para \(M_p \le 10\,\%\) y \(t_s \le 1\) s.
  
  <details><summary>Respuesta</summary>
  
  \(\zeta \ge 0{,}591\) (cono ±53,8°) y \(\sigma \ge 4\).
  
  </details>

- **2.**Polos \(-4\pm4j\), \(K = 2\): \(G\), \(M_p\), \(t_s\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{64}{s^2+8s+32}\), \(\zeta = 0{,}707\), \(M_p = 4{,}3\,\%\), \(t_s = 1\) s.
  
  </details>

- **3.**¿Es estable \(s^2+2s-3\)?
  
  <details><summary>Respuesta</summary>
  
  \((s+3)(s-1)\): polo en \(+1\), inestable.
  
  </details>
