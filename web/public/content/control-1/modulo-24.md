# Módulo 24: Compensación en el dominio de la frecuencia

En el módulo 19 diseñaste adelantos y atrasos con el lugar de las raíces, a partir de polos deseados. Aquí los diseñas con el diagrama de Bode, a partir de dos números que se leen directamente: la constante de error y el margen de fase. Es el método que pide la unidad 5 del programa de Control I.

**Al terminar podrás:**

- Diseñar un compensador de adelanto que cumpla \(K_v\) y un margen de fase mínimo.
- Diseñar un compensador de atraso y un atraso-adelanto con el mismo procedimiento.
- Medir la robustez con el pico de sensibilidad \(M_s\) y elegir el tipo de compensador.

**Prerrequisitos:** módulos 14 (error estacionario), 19 (compensadores), 20 (Bode) y 23 (Nyquist). **Lee en la bibliografía:** Ogata, cap. 7; Nise, cap. 11; Dorf y Bishop, cap. 10; Golnaraghi y Kuo, cap. 11.

**Laboratorio.** Trabajas en `academia-labs/control-1` con `python-control` (verificado con `control 0.10.2`).

## Aprende construyendo

### Tema 1: Compensador de adelanto por margen de fase · Avanzado · 40 min

**¿Por qué es importante?** Subir la ganancia reduce el error, pero se come el margen de fase y el lazo oscila. El adelanto devuelve fase justo donde hace falta. **Modelo mental:** el adelanto es un «préstamo de fase» que se coloca en la nueva frecuencia de cruce.

**Proyecto integrador:** la planta \(G(s) = \dfrac{4}{s(s+2)}\) debe cumplir \(K_v = 20\ \text{s}^{-1}\) y \(MF \ge 50^\circ\). **Límite:** el adelanto aumenta el ancho de banda y con él el ruido que llega al actuador.

El compensador se escribe en la forma de Bode:

\[G_c(s) = K\,\frac{Ts + 1}{\alpha T s + 1} = K_c\,\frac{s + 1/T}{s + 1/(\alpha T)}, \qquad 0 < \alpha < 1, \quad K_c = \frac{K}{\alpha}\]

Como \(G_c(0) = K\), la ganancia \(K\) fija el error y la parte \(\dfrac{Ts+1}{\alpha Ts+1}\) solo cambia la fase cerca del cruce.

#### Subtema 1.1: Fija la ganancia por el error · 10 min

**1. Contexto**

El primer paso siempre es el estacionario: con \(K_v = \lim_{s\to0} s\,G_c(s)G(s) = K\cdot\dfrac{4}{2} = 2K\), para \(K_v = 20\) hace falta \(K = 10\).

**2. Hazlo tú**

Guarda en `academia-labs/control-1/adelanto.py`:

```python
# adelanto.py
import numpy as np
import control as ct

G = ct.tf([4], [1, 2, 0])                # 4/(s(s+2))
K = 20 / 2                               # Kv = 2K
KG = K * G
gm, pm0, w_pc, wc0 = ct.margin(KG)
print("K =", K)
print("MF sin compensar =", round(pm0, 1), "grados en wc =", round(wc0, 2))
```

**Resultado esperado:** `K = 10.0` y `MF sin compensar = 18.0 grados en wc = 6.17`.

**Fallo deliberado:** usa `K = 20` (confundir \(K_v\) con \(K\)). **Resultado observado:** el margen baja a \(12{,}8^\circ\) y \(K_v\) sería 40. **Diagnóstico:** calcula \(K_v\) con el límite antes de elegir \(K\); la planta ya aporta un factor 2.

**3. Entiende**

Con \(K = 10\), \(KG = \dfrac{40}{s(s+2)}\): el cruce está en \(\omega_c = 6{,}17\) rad/s y la fase ahí vale \(-162^\circ\), así que \(MF = 18^\circ\). Faltan \(32^\circ\) para llegar a \(50^\circ\).

**4. Cierra**

Registra \(K = 10\), \(MF = 18^\circ\) y el déficit de \(32^\circ\).

#### Subtema 1.2: Calcula α y el nuevo cruce · 15 min

**1. Contexto**

El adelanto da su fase máxima \(\phi_m\) en \(\omega_m = \dfrac{1}{T\sqrt\alpha}\), con

\[\sin\phi_m = \frac{1-\alpha}{1+\alpha} \quad\Longleftrightarrow\quad \alpha = \frac{1 - \sin\phi_m}{1 + \sin\phi_m}\]

y en esa frecuencia sube la magnitud en \(10\log_{10}(1/\alpha)\) dB. Por eso el cruce **se corre a la derecha**, donde la planta tiene menos fase; hay que pedir unos grados extra.

**2. Hazlo tú**

Añade a `adelanto.py`:

```python
extra = 8                                # grados de corrección
phi_m = 50 - pm0 + extra
alpha = (1 - np.sin(np.radians(phi_m))) / (1 + np.sin(np.radians(phi_m)))
# nuevo cruce: donde |KG(jw)| = sqrt(alpha), es decir 40/(w*sqrt(w^2+4)) = sqrt(alpha)
x = (-4 + np.sqrt(16 + 4 * 1600 / alpha)) / 2
wm = np.sqrt(x)
print("phi_m =", round(phi_m, 1), "alpha =", round(alpha, 3))
print("ganancia del adelanto en wm =", round(10 * np.log10(1 / alpha), 2), "dB")
print("nuevo cruce wm =", round(wm, 2))
```

**Resultado esperado:** `phi_m = 40.0 alpha = 0.217`, `ganancia del adelanto en wm = 6.63 dB` y `nuevo cruce wm = 9.16`.

**Fallo deliberado:** cambia `extra = 8` por `extra = 5` y completa el Subtema 1.3. **Resultado observado:** el margen final es \(49{,}8^\circ\), no cumple. **Diagnóstico:** al pasar el cruce de 6,17 a 8,85 rad/s, la planta pierde fase (\(-90^\circ - \arctan(\omega/2)\) baja de \(-162^\circ\) a \(-167^\circ\)). La corrección debe cubrir esa pérdida: entre 5° y 12°, y se comprueba.

**3. Entiende**

El nuevo cruce es la frecuencia donde la planta con ganancia vale \(-10\log(1/\alpha) = -6{,}63\) dB: así, sumando los \(+6{,}63\) dB del adelanto, la magnitud total queda en 0 dB justo donde el adelanto da su fase máxima. Para esta planta se resuelve exacto con \(x = \omega^2\): \(x^2 + 4x - 1600/\alpha = 0\).

**4. Cierra**

Anota \(\alpha = 0{,}217\) y \(\omega_m = 9{,}16\) rad/s.

#### Subtema 1.3: Ubica el cero y el polo, y verifica · 15 min

**1. Contexto**

Con \(\omega_m\) y \(\alpha\): \(T = \dfrac{1}{\omega_m\sqrt\alpha}\), el cero en \(1/T\) y el polo en \(1/(\alpha T)\).

**2. Hazlo tú**

Añade a `adelanto.py`:

```python
T = 1 / (wm * np.sqrt(alpha))
cero, polo, Kc = 1 / T, 1 / (alpha * T), K / alpha
print("cero =", round(cero, 2), "polo =", round(polo, 2), "Kc =", round(Kc, 1))

Gc = 46.1 * ct.tf([1, 4.27], [1, 19.7])  # valores redondeados
L = Gc * G
gm, pm, w_pc, wc = ct.margin(L)
print("MF compensado =", round(pm, 1), "en wc =", round(wc, 2))
for nombre, lazo in (("sin", KG), ("con", L)):
    info = ct.step_info(ct.feedback(lazo, 1))
    print(nombre, "compensador: Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 2), "s")
```

**Resultado esperado:**

```text
cero = 4.27 polo = 19.66 Kc = 46.1
MF compensado = 52.4 en wc = 9.15
sin compensador: Mp = 60.3 % ts = 3.69 s
con compensador: Mp = 19.8 % ts = 0.63 s
```

**Fallo deliberado:** escribe `Gc = 10 * ct.tf([1, 4.27], [1, 19.7])` (olvidar dividir por \(\alpha\)). **Diagnóstico:** \(G_c(0)\) queda en \(10\cdot4{,}27/19{,}7 = 2{,}2\), no en 10: \(K_v\) cae a 4,3. La ganancia del compensador es \(K_c = K/\alpha\) para que \(G_c(0) = K\).

**3. Entiende**

\[G_c(s) = 46{,}1\,\frac{s + 4{,}27}{s + 19{,}7}\]

El lazo compensado (con los valores redondeados) cruza en 9,15 rad/s con \(MF = 52{,}4^\circ\) y mantiene \(K_v = 46{,}1\cdot\dfrac{4{,}27}{19{,}7}\cdot2 \approx 20\). El sobrepico baja de 60 % a 20 % y la respuesta es seis veces más rápida.

![Bode del lazo antes y después del adelanto](content/figures/control-1/adelanto-bode.svg)

*La curva compensada cruza 0 dB más a la derecha (9,15 rad/s) y su fase queda \(52^\circ\) por encima de \(-180^\circ\).*

**4. Cierra**

Guarda `adelanto.py` con los resultados. El procedimiento completo es: (1) \(K\) por el error; (2) margen sin compensar; (3) \(\phi_m\) con corrección; (4) \(\alpha\); (5) \(\omega_m\) donde \(|KG| = \sqrt\alpha\); (6) \(T\); (7) verificar.

#### Ejercicios del tema

1. ¿Qué \(\phi_m\) máximo da un adelanto con \(\alpha = 0{,}1\)? ¿Y con \(\alpha = 0{,}05\)?

   <details><summary>Solución</summary>

   \(\sin\phi_m = 0{,}9/1{,}1 = 0{,}818 \Rightarrow \phi_m = 54{,}9^\circ\). Con \(0{,}05\): \(\sin\phi_m = 0{,}95/1{,}05 \Rightarrow \phi_m = 64{,}8^\circ\). Más allá de unos \(60^\circ\) conviene usar dos adelantos en serie.

   </details>

2. Diseña un adelanto para \(G(s) = \dfrac{1}{s(s+1)}\) con \(K_v = 10\) y \(MF \ge 45^\circ\). Verifica con python-control.

   <details><summary>Solución</summary>

   \(K = 10\); sin compensar \(MF = 18^\circ\) en 3,08 rad/s. Con 8° de corrección: \(\phi_m = 35^\circ\), \(\alpha = 0{,}271\), \(\omega_m = 4{,}33\) rad/s, cero en 2,25 y polo en 8,32: \(G_c = 37\,\dfrac{s+2{,}25}{s+8{,}32}\). `ct.margin` da \(MF = 48{,}0^\circ\). Con 5° de corrección el margen queda en 45,5°, justo en el límite.

   </details>

**Hito del tema:**

- [ ] Fijé \(K\) con la constante de error y medí el margen sin compensar.
- [ ] Calculé \(\alpha\), \(\omega_m\), el cero y el polo del adelanto.
- [ ] Provoqué el fallo de 5° de corrección y expliqué por qué el cruce se corre.
- [ ] Verifiqué \(MF\), \(K_v\) y la respuesta al escalón con python-control.

**Fuentes oficiales:** [margin y step_info, python-control](https://python-control.readthedocs.io/en/latest/generated/control.margin.html) y [Diseño en frecuencia, Feedback Systems (Åström y Murray)](https://fbswiki.org/wiki/index.php/Frequency_Domain_Analysis).

### Tema 2: Compensador de atraso por margen de fase · Avanzado · 35 min

**¿Por qué es importante?** Cuando la planta ya tiene buena fase a baja frecuencia, no hace falta prestarle fase: basta bajar la ganancia en alta frecuencia y conservarla en baja para el error. **Modelo mental:** el atraso es un «atenuador» que mueve el cruce hacia la izquierda, donde la fase sobra.

**Proyecto integrador:** \(G(s) = \dfrac{1}{s(s+1)(0{,}5s+1)}\) con \(K_v = 5\ \text{s}^{-1}\) y \(MF \ge 40^\circ\). **Límite:** el atraso hace la respuesta más lenta.

\[G_c(s) = K\,\frac{Ts + 1}{\beta T s + 1}, \qquad \beta > 1\]

#### Subtema 2.1: Busca la frecuencia con la fase que necesitas · 10 min

**1. Contexto**

Con \(K = 5\) (porque \(K_v = K\)), el lazo \(KG = \dfrac{10}{s(s+1)(s+2)}\) es el del Ejemplo 3 del módulo 20: \(MF = -13^\circ\), inestable. Se busca la frecuencia donde la fase de \(KG\) vale \(-180^\circ + 40^\circ + 12^\circ = -128^\circ\); los 12° compensan el atraso residual del compensador.

**2. Hazlo tú**

Guarda en `atraso.py`:

```python
# atraso.py
import numpy as np
import control as ct
from scipy.optimize import brentq

G = ct.tf([1], np.polymul([1, 1, 0], [0.5, 1]))   # 1/(s(s+1)(0.5s+1))
K = 5
KG = K * G
gm, pm0, w_pc, wc0 = ct.margin(KG)
print("MF sin compensar =", round(pm0, 1))

objetivo = -180 + 40 + 12
w1 = brentq(lambda w: np.degrees(np.angle(KG(1j * w))) - objetivo, 0.05, 1.4)
beta = abs(KG(1j * w1))
print("nuevo cruce w1 =", round(w1, 3), "|KG(j w1)| =", round(beta, 2))
```

**Resultado esperado:** `MF sin compensar = -13.0` y `nuevo cruce w1 = 0.465 |KG(j w1)| = 9.51`.

**Fallo deliberado:** cambia el intervalo de `brentq` a `(0.05, 5)`. **Resultado observado:** `ValueError: f(a) and f(b) must have different signs`. **Diagnóstico:** `np.angle` devuelve ángulos entre \(-180^\circ\) y \(180^\circ\); por encima de 1,41 rad/s la fase real (\(< -180^\circ\)) aparece como positiva y la función ya no cambia de signo una sola vez. Acota el intervalo por debajo del cruce de fase.

**3. Entiende**

En \(\omega_1 = 0{,}465\) rad/s la fase del lazo es \(-128^\circ\), pero la magnitud es 9,51 (19,6 dB). Si el compensador baja la magnitud **solo** ahí en un factor \(\beta = 9{,}51\), ese punto se vuelve el nuevo cruce con el margen deseado.

**4. Cierra**

Anota \(\omega_1 = 0{,}465\) y \(\beta \approx 9{,}5\); redondéalo a \(\beta = 10\).

#### Subtema 2.2: Coloca el cero una década antes y verifica · 15 min

**1. Contexto**

El atraso atenúa \(\beta\) veces por encima de su cero. Si el cero está una década por debajo de \(\omega_1\), la atenuación ya es completa en \(\omega_1\) y el desfase que agrega ahí es pequeño (unos \(-6^\circ\), cubiertos por la corrección de 12°).

**2. Hazlo tú**

Añade a `atraso.py`:

```python
T = 1 / 0.05                             # cero en 0.05 rad/s (cerca de w1/10)
Gc = K * ct.tf([T, 1], [10 * T, 1])      # beta = 10
L = Gc * G
gm, pm, w_pc, wc = ct.margin(L)
info = ct.step_info(ct.feedback(L, 1))
print("Gc =", Gc)
print("MF =", round(pm, 1), "MG =", round(20 * np.log10(gm), 1), "dB en wc =", round(wc, 3))
print("Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 1), "s")
```

**Resultado esperado:** la función `(100 s + 5)/(200 s + 1)` (es \(5\,(20s+1)/(200s+1)\) desarrollada) y `MF = 47.5 MG = 15.0 dB en wc = 0.448`, con `Mp = 25.1 % ts = 31.5 s`.

**Fallo deliberado:** pide solo 5° de corrección (objetivo \(-135^\circ\)) y usa el \(\beta\) exacto que sale. **Resultado observado:** \(MF = 39{,}9^\circ\). **Diagnóstico:** el atraso aún resta unos \(6^\circ\) en el cruce; por eso la corrección habitual del atraso es de 5° a 12°, mayor cuanto más cerca esté el cero del cruce.

**3. Entiende**

\[G_c(s) = 5\,\frac{20s + 1}{200s + 1} = 0{,}5\,\frac{s + 0{,}05}{s + 0{,}005}\]

\(G_c(0) = 5\), así que \(K_v = 5\) se conserva. El polo en 0,005 y el cero en 0,05 forman un dipolo cerca del origen: en el lugar de las raíces casi no mueven los polos dominantes (módulo 19), pero dejan una cola lenta en la respuesta (\(t_s = 31{,}5\) s).

**4. Cierra**

Registra \(G_c\), \(MF\), \(MG\) y la respuesta. Compara con el adelanto del Tema 1: aquel aceleró, este frenó.

#### Subtema 2.3: Compara adelanto y atraso · 10 min

**1. Contexto**

Los dos compensadores cumplen el margen, pero por caminos opuestos. Elegir mal cuesta velocidad o ruido.

**2. Hazlo tú**

Guarda en `comparar.py`:

```python
# comparar.py
import control as ct

adelanto = 46.1 * ct.tf([1, 4.27], [1, 19.7]) * ct.tf([4], [1, 2, 0])
atraso = 5 * ct.tf([20, 1], [200, 1]) * ct.tf([1], [0.5, 1.5, 1, 0])
for nombre, L in (("adelanto", adelanto), ("atraso", atraso)):
    T = ct.feedback(L, 1)
    print(nombre, "ancho de banda =", round(ct.bandwidth(T), 2), "rad/s")
```

**Resultado esperado:** `adelanto ancho de banda = 14.92 rad/s` y `atraso ancho de banda = 0.81 rad/s`.

**Fallo deliberado:** escribe `ct.bandwidth(L)` sobre el lazo abierto. **Resultado observado:** `nan`. **Diagnóstico:** el lazo abierto con integrador tiene ganancia infinita en \(\omega = 0\) y no hay una ganancia de referencia desde la cual medir la caída de 3 dB; el ancho de banda se mide en el lazo **cerrado**.

**3. Entiende**

| | Adelanto | Atraso |
|---|---|---|
| Qué hace | Agrega fase en el cruce | Atenúa en alta frecuencia |
| Cruce | Se mueve a la derecha | Se mueve a la izquierda |
| Respuesta | Más rápida | Más lenta |
| Ruido | Lo amplifica | Lo filtra |
| Cuándo | Falta fase y se quiere velocidad | Sobra fase a baja frecuencia y se quiere error pequeño |

**4. Cierra**

Escribe con tus palabras en qué caso no sirve un atraso (pista: cuando a ninguna frecuencia razonable la planta tiene la fase que pides).

#### Ejercicios del tema

1. Para el atraso del Tema 2, ¿cuánto desfase aporta el compensador en \(\omega_c = 0{,}448\) rad/s?

   <details><summary>Solución</summary>

   \(\arctan(20\cdot0{,}448) - \arctan(200\cdot0{,}448) = 83{,}6^\circ - 89{,}4^\circ = -5{,}7^\circ\). Por eso la corrección de 12° deja el margen en 47,5°, por encima del pedido.

   </details>

2. ¿Por qué el polo del atraso debe ser mucho menor que el cruce?

   <details><summary>Solución</summary>

   Porque entre el polo y el cero el compensador resta fase; si esa zona alcanzara el cruce, el atraso destruiría el margen que pretende conseguir. Una década de separación limita el desfase a unos \(-6^\circ\).

   </details>

**Hito del tema:**

- [ ] Encontré la frecuencia con la fase objetivo y la atenuación \(\beta\).
- [ ] Ubiqué el cero una década por debajo y verifiqué \(MF = 47{,}5^\circ\).
- [ ] Diagnostiqué el fallo de `brentq` con la fase envuelta.
- [ ] Comparé el ancho de banda del adelanto y del atraso.

**Fuentes oficiales:** [bandwidth, python-control](https://python-control.readthedocs.io/en/latest/generated/control.bandwidth.html) y [Diseño en frecuencia, Feedback Systems (Åström y Murray)](https://fbswiki.org/wiki/index.php/Frequency_Domain_Analysis).

### Tema 3: Atraso-adelanto y sensibilidad · Avanzado · 35 min

**¿Por qué es importante?** Hay plantas a las que un adelanto no les alcanza (pedirían más de \(60^\circ\)) y un atraso las haría demasiado lentas. El atraso-adelanto reparte el trabajo. La sensibilidad dice si el diseño resultante es robusto. **Modelo mental:** el adelanto pone la fase, el atraso pone la atenuación.

**Proyecto integrador:** \(G(s) = \dfrac{1}{s(s+1)(s+2)}\) con \(K_v = 10\ \text{s}^{-1}\), \(MF \ge 50^\circ\) y \(MG \ge 10\) dB. **Límite:** cuatro parámetros dan muchas soluciones; esta es una, comprobada.

#### Subtema 3.1: Diseña el atraso-adelanto · 15 min

**1. Contexto**

\(K_v = K/2 = 10 \Rightarrow K = 20\). Con esa ganancia, \(MF = -28^\circ\) y \(MG = -10{,}5\) dB: muy inestable. Procedimiento:

1. Elige el nuevo cruce en el cruce de fase original, \(\omega_c = \sqrt2 \approx 1{,}41\) rad/s, donde la fase vale \(-180^\circ\).
2. El adelanto aporta \(50^\circ + 5^\circ = 55^\circ\): \(\alpha = \dfrac{1-\sin55^\circ}{1+\sin55^\circ} \approx 0{,}1\).
3. En \(\omega_c\), \(|KG| = 20/6 = 3{,}33\) y el adelanto suma \(1/\sqrt\alpha = 3{,}16\): hay que atenuar \(\beta \approx 3{,}33\cdot3{,}16 \approx 10\). El atraso lo hace con su cero una década antes del cruce.

**2. Hazlo tú**

Guarda en `atraso_adelanto.py`:

```python
# atraso_adelanto.py
import numpy as np
import control as ct

G = ct.tf([1], [1, 3, 2, 0])
K = 20
gm0, pm0, _, _ = ct.margin(K * G)
print("sin compensar: MF =", round(pm0, 1), "MG =", round(20 * np.log10(gm0), 1), "dB")

adelanto = ct.tf([1 / 0.5, 1], [1 / 5, 1])        # cero 0.5, polo 5 (alpha = 0.1)
atraso = ct.tf([1 / 0.15, 1], [1 / 0.015, 1])     # cero 0.15, polo 0.015 (beta = 10)
L = K * adelanto * atraso * G
gm, pm, _, wc = ct.margin(L)
info = ct.step_info(ct.feedback(L, 1))
print("compensado: MF =", round(pm, 1), "MG =", round(20 * np.log10(gm), 1), "dB en wc =", round(wc, 2))
print("Mp =", round(info["Overshoot"], 1), "% ts =", round(info["SettlingTime"], 1), "s")
```

**Resultado esperado:**

```text
sin compensar: MF = -28.1 MG = -10.5 dB
compensado: MF = 50.5 MG = 13.0 dB en wc = 1.38
Mp = 19.1 % ts = 14.7 s
```

**Fallo deliberado:** usa los valores sin redondear hacia arriba: cero del adelanto en 0,45, polo en 4,5, cero del atraso en 0,14 y polo en 0,014. **Resultado observado:** \(MF = 47{,}7^\circ\). **Diagnóstico:** el cruce terminó en 1,48 rad/s, no en 1,41, y el atraso restó unos \(6^\circ\). Subir un poco las frecuencias del adelanto (más fase a la derecha) y del atraso (menos desfase en el cruce) recupera el margen. Por eso cada diseño se verifica.

**3. Entiende**

\[G_c(s) = 20\,\frac{(s + 0{,}5)(s + 0{,}15)}{(s + 5)(s + 0{,}015)}\]

\(G_c(0) = 20\cdot\dfrac{0{,}5\cdot0{,}15}{5\cdot0{,}015} = 20\), así que \(K_v = 10\). Cumple \(MF = 50{,}5^\circ\) y \(MG = 13\) dB.

**4. Cierra**

Escribe \(G_c\) en tu formulario y anota qué parte del compensador aportó la fase y cuál la atenuación.

#### Subtema 3.2: Mide la robustez con la sensibilidad · 10 min

**1. Contexto**

La función de sensibilidad \(S = \dfrac{1}{1 + L}\) dice cuánto se amplifica una perturbación a la salida. Su pico \(M_s\) es el inverso de la distancia mínima de la curva de Nyquist a \(-1\) (módulo 23).

**2. Hazlo tú**

Guarda en `sensibilidad.py`:

```python
# sensibilidad.py
import numpy as np
import control as ct

G = ct.tf([4], [1, 2, 0])
lazos = {
    "solo ganancia": 10 * G,
    "con adelanto": 46.1 * ct.tf([1, 4.27], [1, 19.7]) * G,
}
w = np.logspace(-2, 3, 50000)
for nombre, L in lazos.items():
    S = ct.feedback(1, L)                 # S = 1/(1 + L)
    Ms = np.max(np.abs(S(1j * w)))
    print(nombre, ": Ms =", round(Ms, 2), "=", round(20 * np.log10(Ms), 1), "dB")
```

**Resultado esperado:** `solo ganancia : Ms = 3.35 = 10.5 dB` y `con adelanto : Ms = 1.37 = 2.8 dB`.

**Fallo deliberado:** escribe `S = ct.feedback(L, 1)`. **Diagnóstico:** eso es \(T = L/(1+L)\), la complementaria. \(S\) es el lazo de una entrada a la salida con el bloque directo igual a 1: `ct.feedback(1, L)`.

**3. Entiende**

Un \(M_s\) pequeño garantiza márgenes mínimos (Åström y Murray):

\[MG \ge \frac{M_s}{M_s - 1}, \qquad MF \ge 2\arcsin\frac{1}{2M_s}\]

Con \(M_s = 2\): \(MG \ge 2\) (6 dB) y \(MF \ge 29^\circ\). Un diseño con \(M_s\) entre 1,2 y 2 se considera robusto; con \(M_s = 3{,}35\) una perturbación de cierta frecuencia se amplifica más de tres veces.

**4. Cierra**

Anota \(M_s\) antes y después del adelanto y explica por qué un solo número resume ambos márgenes.

#### Subtema 3.3: Elige el compensador · 10 min

**1. Contexto**

Antes de calcular, decide qué compensador usar mirando el lazo con la ganancia del error.

**2. Hazlo tú**

Guarda en `elegir.py`:

```python
# elegir.py
import numpy as np
import control as ct

casos = {
    "4/(s(s+2)), K=10": 10 * ct.tf([4], [1, 2, 0]),
    "1/(s(s+1)(s+2)), K=20": 20 * ct.tf([1], [1, 3, 2, 0]),
}
for nombre, L in casos.items():
    _, pm, _, wc = ct.margin(L)
    deficit = 50 - pm + 5
    print(nombre, ": MF =", round(pm, 1), "deficit =", round(deficit, 1), "grados")
```

**Resultado esperado:** `4/(s(s+2)), K=10 : MF = 18.0 deficit = 37.0 grados` y `1/(s(s+1)(s+2)), K=20 : MF = -28.1 deficit = 83.1 grados`.

**Fallo deliberado:** intenta un solo adelanto para el segundo caso: \(\phi_m = 83^\circ\) exige \(\alpha = 0{,}0036\). **Diagnóstico:** un adelanto así subiría la magnitud 24,4 dB y llevaría el cruce a una zona con aún menos fase. Con déficit mayor de unos \(60^\circ\) usa atraso-adelanto o dos adelantos.

**3. Entiende**

| Situación con la ganancia del error | Compensador |
|---|---|
| Déficit de fase de hasta ~\(55^\circ\) y se quiere más velocidad | Adelanto |
| La fase deseada existe a una frecuencia menor y la lentitud es aceptable | Atraso |
| Déficit grande o se quieren velocidad y error pequeño a la vez | Atraso-adelanto |

**4. Cierra**

Clasifica las tres plantas de este módulo con la tabla y comprueba que coincide con lo que diseñaste.

#### Ejercicios del tema

1. Calcula \(MF\) mínimo garantizado para \(M_s = 1{,}4\).

   <details><summary>Solución</summary>

   \(2\arcsin(1/2{,}8) = 2\arcsin(0{,}357) = 41{,}8^\circ\), y \(MG \ge 1{,}4/0{,}4 = 3{,}5\) (10,9 dB).

   </details>

2. En el atraso-adelanto, ¿qué pasa con \(K_v\) si quitas el atraso y dejas solo el adelanto con \(K = 20\)?

   <details><summary>Solución</summary>

   \(K_v\) sigue en 10 porque el adelanto en forma \((Ts+1)/(\alpha Ts+1)\) vale 1 en \(s = 0\). Lo que se pierde es la atenuación: el cruce subiría a una frecuencia donde la planta tiene mucha menos fase y el margen sería negativo.

   </details>

**Hito del tema:**

- [ ] Diseñé y verifiqué un atraso-adelanto con \(MF = 50{,}5^\circ\) y \(MG = 13\) dB.
- [ ] Calculé \(M_s\) antes y después de compensar.
- [ ] Diagnostiqué la confusión entre \(S\) y \(T\).
- [ ] Elegí el tipo de compensador a partir del déficit de fase.

**Fuentes oficiales:** [feedback, python-control](https://python-control.readthedocs.io/en/latest/generated/control.feedback.html) y [Feedback Systems, Åström y Murray, cap. 12 (robustez)](https://fbswiki.org/wiki/index.php/Feedback_Systems:_An_Introduction_for_Scientists_and_Engineers).
