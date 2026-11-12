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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Leer el polo \(-2 \pm j2\) · *Básico*

**Enunciado.** Halla \(\omega_n\), \(\zeta\), el ángulo \(\theta\) y las especificaciones que produce.

1. \(\omega_n = \sqrt{\sigma^2 + \omega_d^2} = \sqrt{4 + 4} \approx 2{,}828\).

   **¿Por qué?** \(\omega_n\) es la distancia del polo al origen.

2. \(\zeta = \cos\theta = \sigma/\omega_n \approx 0{,}707\), \(\theta \approx 45^\circ\).

   **¿Por qué?** El ángulo se mide desde el semieje real negativo; su coseno es \(\zeta\).

**Resultado.** \(M_p \approx 4{,}3\,\%\), \(t_s = 4/\sigma \approx 2\,\text{s}\), \(t_p = \pi/\omega_d \approx 1{,}571\,\text{s}\).

#### Ejemplo 2 · Leer el polo \(-1 \pm j3\) · *Básico*

**Enunciado.** Halla \(\omega_n\), \(\zeta\), el ángulo \(\theta\) y las especificaciones que produce.

1. \(\omega_n = \sqrt{\sigma^2 + \omega_d^2} = \sqrt{1 + 9} \approx 3{,}162\).

   **¿Por qué?** \(\omega_n\) es la distancia del polo al origen.

2. \(\zeta = \cos\theta = \sigma/\omega_n \approx 0{,}316\), \(\theta \approx 71{,}6^\circ\).

   **¿Por qué?** El ángulo se mide desde el semieje real negativo; su coseno es \(\zeta\).

**Resultado.** \(M_p \approx 35{,}1\,\%\), \(t_s = 4/\sigma \approx 4\,\text{s}\), \(t_p = \pi/\omega_d \approx 1{,}047\,\text{s}\).

#### Ejemplo 3 · Leer el polo \(-3 \pm j4\) · *Básico*

**Enunciado.** Halla \(\omega_n\), \(\zeta\), el ángulo \(\theta\) y las especificaciones que produce.

1. \(\omega_n = \sqrt{\sigma^2 + \omega_d^2} = \sqrt{9 + 16} \approx 5\).

   **¿Por qué?** \(\omega_n\) es la distancia del polo al origen.

2. \(\zeta = \cos\theta = \sigma/\omega_n \approx 0{,}6\), \(\theta \approx 53{,}1^\circ\).

   **¿Por qué?** El ángulo se mide desde el semieje real negativo; su coseno es \(\zeta\).

**Resultado.** \(M_p \approx 9{,}5\,\%\), \(t_s = 4/\sigma \approx 1{,}333\,\text{s}\), \(t_p = \pi/\omega_d \approx 0{,}785\,\text{s}\).

#### Ejemplo 4 · Leer el polo \(-4 \pm j3\) · *Intermedio*

**Enunciado.** Halla \(\omega_n\), \(\zeta\), el ángulo \(\theta\) y las especificaciones que produce.

1. \(\omega_n = \sqrt{\sigma^2 + \omega_d^2} = \sqrt{16 + 9} \approx 5\).

   **¿Por qué?** \(\omega_n\) es la distancia del polo al origen.

2. \(\zeta = \cos\theta = \sigma/\omega_n \approx 0{,}8\), \(\theta \approx 36{,}9^\circ\).

   **¿Por qué?** El ángulo se mide desde el semieje real negativo; su coseno es \(\zeta\).

**Resultado.** \(M_p \approx 1{,}5\,\%\), \(t_s = 4/\sigma \approx 1\,\text{s}\), \(t_p = \pi/\omega_d \approx 1{,}047\,\text{s}\).

#### Ejemplo 5 · Leer el polo \(-0{,}5 \pm j2\) · *Intermedio*

**Enunciado.** Halla \(\omega_n\), \(\zeta\), el ángulo \(\theta\) y las especificaciones que produce.

1. \(\omega_n = \sqrt{\sigma^2 + \omega_d^2} = \sqrt{0{,}25 + 4} \approx 2{,}062\).

   **¿Por qué?** \(\omega_n\) es la distancia del polo al origen.

2. \(\zeta = \cos\theta = \sigma/\omega_n \approx 0{,}243\), \(\theta \approx 76^\circ\).

   **¿Por qué?** El ángulo se mide desde el semieje real negativo; su coseno es \(\zeta\).

**Resultado.** \(M_p \approx 45{,}6\,\%\), \(t_s = 4/\sigma \approx 8\,\text{s}\), \(t_p = \pi/\omega_d \approx 1{,}571\,\text{s}\).

#### Ejemplo 6 · Leer el polo \(-5 \pm j8{,}66\) · *Intermedio*

**Enunciado.** Halla \(\omega_n\), \(\zeta\), el ángulo \(\theta\) y las especificaciones que produce.

1. \(\omega_n = \sqrt{\sigma^2 + \omega_d^2} = \sqrt{25 + 75} \approx 10\).

   **¿Por qué?** \(\omega_n\) es la distancia del polo al origen.

2. \(\zeta = \cos\theta = \sigma/\omega_n \approx 0{,}5\), \(\theta \approx 60^\circ\).

   **¿Por qué?** El ángulo se mide desde el semieje real negativo; su coseno es \(\zeta\).

**Resultado.** \(M_p \approx 16{,}3\,\%\), \(t_s = 4/\sigma \approx 0{,}8\,\text{s}\), \(t_p = \pi/\omega_d \approx 0{,}363\,\text{s}\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1.

```python
# verificacion.py
from sympy import sqrt, N

sigma, wd = 2, 2
wn = sqrt(sigma ** 2 + wd ** 2)
zeta = sigma / wn
print("wn:", N(wn, 4))
print("zeta:", N(zeta, 4))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `wn: 2.828` y `zeta: 0.7071`, igual al Ejemplo 1 (\(\omega_n\approx2{,}83\), \(\zeta\approx0{,}707\)).

**Práctica:** cambia `sigma, wd` a `1, 3` y confirma \(\omega_n\approx3{,}16\), \(\zeta\approx0{,}316\) (Ejemplo 2).

**Límite:** esta lectura geométrica solo aplica a un polo complejo de un sistema de segundo orden dominante; con polos adicionales o ceros cercanos (capítulo 13), las especificaciones reales se desvían de lo que predice solo la posición de este polo.

### Tema 2: Estabilidad

**¿Por qué es importante?** Decidir estabilidad mirando el plano s es la forma más rápida de revisar un resultado.

**Fuentes oficiales:** [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 3 · Estabilidad por la posición de los polos: \(-3\), \(-1 \pm 2j\) · *Básico*

**Enunciado.** ¿Cómo es la respuesta natural?

1. Mira la parte real de cada polo.

   **¿Por qué?** Parte real negativa → decae; positiva → crece; cero → no decae.

**Resultado.** **Estable**: todos en el semiplano izquierdo; el más lento es el par \(-1\pm2j\), que se apaga como \(e^{-t}\).

#### Ejemplo 4 · Estabilidad por la posición de los polos: \(2\), \(-5\) · *Básico*

**Enunciado.** ¿Cómo es la respuesta natural?

1. Mira la parte real de cada polo.

   **¿Por qué?** Parte real negativa → decae; positiva → crece; cero → no decae.

**Resultado.** **Inestable**: el polo en +2 da \(e^{2t}\), que crece.

#### Ejemplo 5 · Estabilidad por la posición de los polos: \(\pm 4j\), \(-1\) · *Intermedio*

**Enunciado.** ¿Cómo es la respuesta natural?

1. Mira la parte real de cada polo.

   **¿Por qué?** Parte real negativa → decae; positiva → crece; cero → no decae.

**Resultado.** **Marginalmente estable**: el par \(\pm4j\) da una oscilación de amplitud constante a 4 rad/s.

#### Ejemplo 6 · Estabilidad por la posición de los polos: \(0\), \(0\), \(-2\) · *Intermedio*

**Enunciado.** ¿Cómo es la respuesta natural?

1. Mira la parte real de cada polo.

   **¿Por qué?** Parte real negativa → decae; positiva → crece; cero → no decae.

**Resultado.** **Inestable**: el polo doble en el origen da un término \(t\), que crece sin límite (un polo repetido sobre el eje no es marginal).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el caso (b) del Ejemplo 1.

```python
# verificacion.py
from sympy import symbols, solve, re

s = symbols("s")
raices = solve(s ** 2 - s + 2, s)
print("raices:", raices)
print("estable:", all(re(r) < 0 for r in raices))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `raices: [1/2 - sqrt(7)*I/2, 1/2 + sqrt(7)*I/2]` y `estable: False`, igual al caso (b) del Ejemplo 1 (parte real positiva → inestable).

**Práctica:** cambia el polinomio a `(s+1)*(s+4)` (caso a) y confirma `estable: True`.

**Límite:** `re(r) < 0` para cada raíz exacta es la definición misma de estabilidad; en un examen sin software hay que decidirlo mirando los coeficientes (atajo de segundo orden) o con Routh-Hurwitz (capítulo 15) para polinomios más grandes, sin resolver las raíces.

### Tema 3: La zona de diseño

**¿Por qué es importante?** La zona de diseño traduce especificaciones a una región del plano; es lo que pedía el punto 2 del Parcial 2.

**Fuentes oficiales:** [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

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

#### Ejemplo 1 · Zona desde especificaciones · *Intermedio*

**Enunciado.** \(M_p \le 20\,\%\) y \(t_s \le 2\) s.

1. \(\ln0{,}2 = -1{,}609\). \(\zeta_{\min} = \dfrac{1{,}609}{\sqrt{9{,}870+2{,}590}} = 0{,}456\).

   **¿Por qué?** El sobrepico fija el amortiguamiento mínimo.

2. \(\theta_{\max} = \arccos0{,}456 = 62{,}9°\).

   **¿Por qué?** \(\zeta = \cos\theta\): menos ángulo, más amortiguamiento.

3. \(\sigma_{\min} = 4/2 = 2\).

   **¿Por qué?** \(t_s = 4/\sigma\).

**Resultado:** Izquierda de \(s = -2\) y dentro del cono de ±62,9°

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar las fronteras del Ejemplo 1.

```python
# verificacion.py
from sympy import log, sqrt, pi, acos, deg, N

Mp, ts = 0.20, 2
zeta_min = N(-log(Mp) / sqrt(pi ** 2 + log(Mp) ** 2), 3)
theta_max = N(deg(acos(zeta_min)), 3)
sigma_min = 4 / ts
print("zeta_min:", zeta_min)
print("theta_max:", theta_max)
print("sigma_min:", sigma_min)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `zeta_min: 0.456`, `theta_max: 62.9` y `sigma_min: 2.0`, igual al Ejemplo 1.

**Práctica:** cambia `Mp, ts` a `0.05, 0.8` y confirma \(\zeta_{\min}\approx0{,}69\), \(\theta_{\max}\approx46{,}4°\), \(\sigma_{\min}=5\) (Ejemplo 2).

**Límite:** esta zona define condiciones **necesarias** sobre un polo dominante de segundo orden; verificar que un candidato cae dentro de la zona (Ejemplo 3) no reemplaza comprobar que de verdad es el polo dominante del sistema completo (capítulo 13).

#### Ejemplo 2 · Tres especificaciones · *Intermedio*

> **Qué cambia respecto al anterior:** Se agrega el tiempo pico.

**Enunciado.** \(M_p \le 5\,\%\), \(t_s \le 0{,}8\) s, \(t_p \le 0{,}5\) s.

1. \(\zeta_{\min} = \dfrac{2{,}996}{\sqrt{9{,}870+8{,}974}} = 0{,}690\); \(\theta_{\max} = 46{,}4°\).

   **¿Por qué?** Como en el Ejemplo 3.

2. \(\sigma_{\min} = 4/0{,}8 = 5\).

   **¿Por qué?** Igual.

3. \(\omega_{d,\min} = \pi/0{,}5 = 6{,}28\).

   **¿Por qué?** El tiempo pico agrega las rectas horizontales.

**Resultado:** Izquierda de \(-5\), cono de ±46,4° y \(|\omega_d| \ge 6{,}28\)

#### Ejemplo 3 · ¿Cumple un candidato? · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se usa la zona para verificar.

**Enunciado.** Con \(M_p \le 20\,\%\) y \(t_s \le 2\) s, ¿sirven \(-3\pm4j\) y \(-2\pm5j\)?

1. \(-3\pm4j\): \(\sigma = 3 \ge 2\) sí. \(\theta = \arctan(4/3) = 53{,}1° \le 62{,}9°\) sí.

   **¿Por qué?** Hay que revisar las dos fronteras del Ejemplo 3.

2. \(-2\pm5j\): \(\sigma = 2\), justo en el límite. \(\theta = \arctan(5/2) = 68{,}2° > 62{,}9°\): no cumple.

   **¿Por qué?** Está fuera del cono: \(\zeta = 2/\sqrt{29} = 0{,}371\) da \(M_p = 28{,}5\,\%\).

**Resultado:** \(-3\pm4j\) sí; \(-2\pm5j\) no

#### Ejemplo 4 · De polos a G(s) y su zona (Parcial 2) · *Nivel parcial*

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 5 · Zona de diseño: Mp ≤ 10 %, ts ≤ 2 s; ¿sirve \(-3 \pm j3\)? · *Intermedio*

**Enunciado.** Dibuja la zona y decide si el polo candidato cumple.

1. Sobrepico: \(\zeta \ge 0{,}591\), es decir \(\theta \le 53{,}8^\circ\) (cono alrededor del eje real negativo).

   **¿Por qué?** Menos sobrepico exige más amortiguamiento: polos dentro de un ángulo máximo.

2. Establecimiento: \(\sigma \ge 4/t_s = 2\) (a la izquierda de la recta \(\text{Re}(s) = -2\)).

   **¿Por qué?** Más rapidez exige polos más a la izquierda.

3. Candidato: \(\sigma = 3\), \(\theta \approx 45^\circ\).

   **¿Por qué?** Se compara con los dos límites.

**Resultado.** **Cumple**: está dentro de la zona.

#### Ejemplo 6 · Zona de diseño: Mp ≤ 5 %, ts ≤ 1 s; ¿sirve \(-5 \pm j4\)? · *Intermedio*

**Enunciado.** Dibuja la zona y decide si el polo candidato cumple.

1. Sobrepico: \(\zeta \ge 0{,}69\), es decir \(\theta \le 46{,}4^\circ\) (cono alrededor del eje real negativo).

   **¿Por qué?** Menos sobrepico exige más amortiguamiento: polos dentro de un ángulo máximo.

2. Establecimiento: \(\sigma \ge 4/t_s = 4\) (a la izquierda de la recta \(\text{Re}(s) = -4\)).

   **¿Por qué?** Más rapidez exige polos más a la izquierda.

3. Candidato: \(\sigma = 5\), \(\theta \approx 38{,}7^\circ\).

   **¿Por qué?** Se compara con los dos límites.

**Resultado.** **Cumple**: está dentro de la zona.

#### Ejemplo 7 · Zona de diseño: Mp ≤ 20 %, ts ≤ 4 s; ¿sirve \(-1{,}5 \pm j2\)? · *Intermedio*

**Enunciado.** Dibuja la zona y decide si el polo candidato cumple.

1. Sobrepico: \(\zeta \ge 0{,}456\), es decir \(\theta \le 62{,}9^\circ\) (cono alrededor del eje real negativo).

   **¿Por qué?** Menos sobrepico exige más amortiguamiento: polos dentro de un ángulo máximo.

2. Establecimiento: \(\sigma \ge 4/t_s = 1\) (a la izquierda de la recta \(\text{Re}(s) = -1\)).

   **¿Por qué?** Más rapidez exige polos más a la izquierda.

3. Candidato: \(\sigma = 1{,}5\), \(\theta \approx 53{,}1^\circ\).

   **¿Por qué?** Se compara con los dos límites.

**Resultado.** **Cumple**: está dentro de la zona.

#### Ejemplo 8 · Zona de diseño: Mp ≤ 15 %, ts ≤ 0,5 s; ¿sirve \(-8 \pm j6\)? · *Avanzado*

**Enunciado.** Dibuja la zona y decide si el polo candidato cumple.

1. Sobrepico: \(\zeta \ge 0{,}517\), es decir \(\theta \le 58{,}9^\circ\) (cono alrededor del eje real negativo).

   **¿Por qué?** Menos sobrepico exige más amortiguamiento: polos dentro de un ángulo máximo.

2. Establecimiento: \(\sigma \ge 4/t_s = 8\) (a la izquierda de la recta \(\text{Re}(s) = -8\)).

   **¿Por qué?** Más rapidez exige polos más a la izquierda.

3. Candidato: \(\sigma = 8\), \(\theta \approx 36{,}9^\circ\).

   **¿Por qué?** Se compara con los dos límites.

**Resultado.** **Cumple**: está dentro de la zona.

#### Práctica para resolver sola o solo

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

