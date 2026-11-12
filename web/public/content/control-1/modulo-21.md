# Módulo 21: Parciales resueltos

Los dos parciales del curso, resueltos paso a paso. Intenta cada punto en papel antes de abrir la solución.

## Aprende construyendo

### Tema 1: Parcial 1

**¿Por qué es importante?** Resolver el Parcial 1 completo muestra cómo se combinan los capítulos en una sola evaluación.

Intenta cada punto en papel antes de abrir la solución. Al lado de cada punto está la lección que lo explica.

#### Sistema de control y sus elementos · ver capítulo 6 · *Punto 1*

Explique y presente un sistema de control diferente a los vistos en clase. Con base en ese sistema enumere y defina los elementos básicos.

<details><summary>Respuesta</summary>

**Sistema:** aire acondicionado con termostato. Es de lazo cerrado porque mide la temperatura del cuarto, la compara con la deseada y actúa según la diferencia.

Dibuja el diagrama de bloques de capítulo 6 y define cada elemento:

- **Referencia:** 22 °C programados.
- **Comparador:** resta la medición de la referencia.
- **Error:** \(e = 22 - T_{medida}\).
- **Controlador:** la tarjeta del termostato decide encender o apagar (ON/OFF) o cuánto enfriar.
- **Actuador:** compresor y ventilador.
- **Planta:** el cuarto.
- **Variable controlada:** temperatura del cuarto.
- **Sensor:** termistor.
- **Perturbación:** sol en la ventana, personas, puerta abierta.

</details>

#### Función de transferencia con op-amps · ver capítulo 8 · *Punto 2*

Etapa 1: \(R_1\parallel C_1\) a la entrada y \(C_2\) de realimentación. Etapa 2: \(C_3\) a la entrada y \((C_5\) en serie con \(R_2)\parallel C_4\) de realimentación.

<details><summary>Respuesta</summary>

1. Etapa 1: \(Z_{i1} = \dfrac{R_1}{1+sR_1C_1}\), \(Z_{f1} = \dfrac{1}{sC_2}\) → \(G_1 = -\dfrac{1+sR_1C_1}{sR_1C_2}\).
2. Etapa 2, entrada: \(Z_{i2} = \dfrac{1}{sC_3}\).
3. Rama superior: \(R_2 + \dfrac{1}{sC_5} = \dfrac{1+sR_2C_5}{sC_5}\).
4. En paralelo con \(\dfrac{1}{sC_4}\) (producto sobre suma): \(Z_{f2} = \dfrac{1+sR_2C_5}{s\,(C_4+C_5+sR_2C_4C_5)}\).
5. \(G_2 = -Z_{f2}\cdot sC_3 = -\dfrac{C_3(1+sR_2C_5)}{C_4+C_5+sR_2C_4C_5}\).

\[\frac{V_o}{V_i} = G_1G_2 = \frac{C_3\,(1+sR_1C_1)(1+sR_2C_5)}{sR_1C_2\,(C_4+C_5+sR_2C_4C_5)}\]

Lectura: un integrador, dos ceros en \(-1/(R_1C_1)\) y \(-1/(R_2C_5)\), y un polo en \(-(C_4+C_5)/(R_2C_4C_5)\). Es un PID con filtro.

</details>

#### Respuesta al impulso · ver capítulo 4 y capítulo 12 · *Punto 3*

(i) \(G(s) = \dfrac{7}{9s+1}e^{-3s}\)   (ii) \(G(s) = \dfrac{10(37)}{s^2+2s+37}\)

<details><summary>Respuesta</summary>

**(i)**

1. Polo limpio: \(\dfrac{7/9}{s+1/9}\) → \(\tfrac79 e^{-t/9}\).
2. Retardo de 3 s: \(t \to t-3\) y multiplicar por \(u(t-3)\).

\[y(t) = \frac79\,e^{-(t-3)/9}\,u(t-3) \approx 0{,}778\,e^{-0{,}111(t-3)}\,u(t-3)\]

**(ii)**

1. \((s+1)^2+36\): \(\sigma = 1\), \(\omega_d = 6\).
2. \(\dfrac{370}{6}\cdot\dfrac{6}{(s+1)^2+36}\).

\[y(t) = \frac{370}{6}\,e^{-t}\sin6t \approx 61{,}67\,e^{-t}\sin6t\]

Datos adicionales: \(\omega_n = 6{,}08\), \(\zeta = 0{,}164\), \(K = 10\), polos \(-1\pm6j\).

</details>

#### Ventajas y desventajas · ver capítulo 19 · *Punto 4*

Enumere y explique las ventajas y desventajas de las acciones básicas de control.

<details><summary>Respuesta</summary>

Usa la tabla 10.4 completa: para cada acción escribe la ley de control, \(C(s)\), dos ventajas y dos desventajas con su porqué. Cierra con la tabla del efecto de subir cada ganancia y un ejemplo numérico, como el Ejemplo 1 de capítulo 19 (el P deja 10 % de error y el PI lo elimina).

</details>

### Tema 2: Parcial 2

**¿Por qué es importante?** El Parcial 2 concentra segundo orden y zona de diseño, los temas con más peso del curso.

Todo este parcial es capítulo 13 y capítulo 17.

#### Salida ante escalón · ver capítulo 13 · *Punto 1*

\(G(s) = \dfrac{3(\cdot)}{s^2+2s+65}\), \(u(t) = \mu(t)\). Halla \(y(t)\).

> **Ojo:** el numerador se lee “3(8)”. Siguiendo el formato del Parcial 1, lo más probable es \(K\omega_n^2 = 3(65)\). Confírmalo con el profesor; abajo está también la variante con 24.

<details><summary>Respuesta</summary>

1. \(\omega_n = \sqrt{65} = 8{,}06\), \(\zeta = 2/(2\cdot8{,}06) = 0{,}124\), \(K = 3\).
2. \((s+1)^2+64\): \(\sigma = 1\), \(\omega_d = 8\), polos \(-1\pm8j\).

\[y(t) = 3\left[1 - e^{-t}\left(\cos8t + \tfrac18\sin8t\right)\right]\]

\(M_p = e^{-\pi/8} = 67{,}5\,\%\) · \(t_p = 0{,}39\) s · \(y_{\max} = 5{,}03\) · \(t_s = 4\) s.

**Si el numerador es 24:** todo se multiplica por \(24/195\) y el valor final es 0,369. \(M_p\), \(t_p\) y \(t_s\) no cambian.

</details>

#### Polos en −3 ± 5j · ver capítulo 17 · *Punto 2*

(a) ¿Cuál es \(G(s)\) si \(K = 10\)? (b) ¿Cuál es la zona de diseño y por qué?

<details><summary>Respuesta</summary>

1. \((s+3)^2+25 = s^2+6s+34\), así que \(\omega_n^2 = 34\) y \(G = \dfrac{340}{s^2+6s+34}\).
2. \(\zeta = 3/5{,}83 = 0{,}514\), \(\theta = 59°\), \(M_p = 15{,}2\,\%\), \(t_s = 1{,}33\) s, \(t_p = 0{,}63\) s.
3. **Zona:** a la izquierda de \(\sigma = -3\) y dentro del cono de ±59° (figura de capítulo 17).
4. **Por qué:** cualquier polo ahí tiene \(\sigma \ge 3\) (se establece en 1,33 s o menos) y \(\zeta \ge 0{,}514\) (sobrepico de 15,2 % o menos). Además está en el semiplano izquierdo: estable y subamortiguado.

</details>

#### Desde la gráfica · ver capítulo 13 y capítulo 17 · *Punto 3*

Máximo ≈ 5, valor final 3, pico en \(t \approx 2\) s. (a) \(M_p\); (b) \(G(s)\) si \(K = 3\); (c) zona de diseño.

<details><summary>Respuesta</summary>

1. \(M_p = \dfrac{5-3}{3} = 0{,}667 = 66{,}7\,\%\).
2. \(\zeta = \dfrac{0{,}405}{\sqrt{\pi^2+0{,}405^2}} = 0{,}128\).
3. \(\omega_d = \pi/2 = 1{,}571\); \(\omega_n = 1{,}584\); \(\omega_n^2 = 2{,}51\); \(2\zeta\omega_n = 0{,}405\).

\[G(s) = \frac{3(2{,}51)}{s^2+0{,}405s+2{,}51} = \frac{7{,}53}{s^2+0{,}405s+2{,}51}\]

**(c)** \(\zeta \ge 0{,}128\): cono de ±82,6°. \(\sigma \ge 0{,}203\): a la izquierda de \(s = -0{,}203\) (\(t_s = 19{,}7\) s). Es un sistema muy oscilatorio; un buen diseño llevaría \(\zeta\) a 0,4–0,8.

> **Ojo:** si la gráfica arranca en \(t = 1\) (retardo de 1 s), \(t_p\) se mide desde ahí: \(t_p = 1\) s, \(\omega_n = 3{,}17\), \(G = \dfrac{30{,}1\,e^{-s}}{s^2+0{,}81s+10{,}03}\).

</details>
