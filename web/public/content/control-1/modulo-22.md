# Módulo 22: Simulacro y formulario

Un parcial nuevo con el estilo de los anteriores y el formulario completo para el examen.

## Aprende construyendo

### Tema 1: Simulacro con solución

**¿Por qué es importante?** Hacer un simulacro con tiempo es la mejor prueba de que puedes resolver sin mirar las soluciones.

**Fuentes oficiales:** [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis) y [Lugar de las raíces, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlRootLocus).

Un parcial nuevo con el mismo estilo de los dos anteriores. Ponte 90 minutos, usa solo el formulario y después compara.

#### Sistema de control · *Punto 1*

Presente el control de nivel de un tanque de agua. Dibuje el diagrama de bloques y defina cada elemento.

<details><summary>Respuesta</summary>

Lazo cerrado. Referencia: 1,5 m. Comparador y controlador: PLC con un PI. Señal de control: apertura de 0 a 100 %. Actuador: válvula de entrada. Planta: el tanque. Variable controlada: nivel. Sensor: ultrasónico. Perturbación: consumo de agua. Error: 1,5 m menos el nivel medido.

</details>

#### Circuito · *Punto 2*

Etapa 1: \(Z_i = R_1 = 10\) kΩ; \(Z_f = R_2 = 100\) kΩ en serie con \(C_2 = 10\) µF. Etapa 2: inversor con \(R_3 = 10\) kΩ y \(R_4 = 20\) kΩ. Halla \(V_o/V_i\) y di qué acción implementa.

<details><summary>Respuesta</summary>

1. \(G_1 = -\dfrac{R_2C_2s+1}{R_1C_2s} = -\dfrac{s+1}{0{,}1s}\).
2. \(G_2 = -\dfrac{20}{10} = -2\).
3. \(G = \dfrac{2(s+1)}{0{,}1s} = \dfrac{20(s+1)}{s} = 20 + \dfrac{20}{s}\).

Un PI con \(K_p = 20\) y \(K_i = 20\), sin inversión

</details>

#### Impulso · *Punto 3*

(i) \(G(s) = \dfrac{5e^{-2s}}{2s+1}\)   (ii) \(G(s) = \dfrac{8(29)}{s^2+4s+29}\)

<details><summary>Respuesta</summary>

1. (i) \(\dfrac{2{,}5}{s+0{,}5}\) → \(y(t) = 2{,}5\,e^{-(t-2)/2}\,u(t-2)\).
2. (ii) \((s+2)^2+25\): \(\dfrac{232}{5}\cdot\dfrac{5}{(s+2)^2+25}\) → \(y(t) = 46{,}4\,e^{-2t}\sin5t\).

</details>

#### Escalón · *Punto 4*

\(G(s) = \dfrac{2(50)}{s^2+2s+50}\), escalón unitario. Halla \(y(t)\), \(M_p\), \(t_p\) y \(t_s\).

<details><summary>Respuesta</summary>

1. \((s+1)^2+49\): \(\sigma = 1\), \(\omega_d = 7\), \(\omega_n = 7{,}07\), \(\zeta = 0{,}141\), \(K = 2\).
2. \(y(t) = 2\left[1 - e^{-t}\left(\cos7t + \tfrac17\sin7t\right)\right]\).
3. \(M_p = e^{-\pi/7} = 63{,}8\,\%\), \(t_p = 0{,}449\) s, \(t_s = 4\) s, \(y_{\max} = 3{,}28\).

</details>

#### Polos y zona · *Punto 5*

Polos en \(-4\pm4j\). (a) \(G(s)\) si \(K = 2\). (b) Zona de diseño y por qué.

<details><summary>Respuesta</summary>

1. \((s+4)^2+16 = s^2+8s+32\): \(G = \dfrac{64}{s^2+8s+32}\).
2. \(\zeta = 4/5{,}66 = 0{,}707\), \(\theta = 45°\), \(M_p = 4{,}3\,\%\), \(t_s = 1\) s, \(t_p = 0{,}785\) s.
3. Zona: izquierda de \(\sigma = -4\) y dentro del cono de ±45°. Cualquier polo ahí da \(M_p \le 4{,}3\,\%\) y \(t_s \le 1\) s.

</details>

#### Desde la gráfica · *Punto 6*

Ante escalón unitario la salida llega a 5 en \(t = 1{,}5\) s y se estabiliza en 4. Halla \(M_p\), \(G(s)\) y la zona de diseño.

<details><summary>Respuesta</summary>

1. \(K = 4\); \(M_p = 1/4 = 25\,\%\).
2. \(\zeta = 0{,}404\); \(\omega_d = \pi/1{,}5 = 2{,}094\); \(\omega_n = 2{,}289\); \(\omega_n^2 = 5{,}24\); \(2\zeta\omega_n = 1{,}85\).
3. \(G(s) = \dfrac{20{,}96}{s^2+1{,}85s+5{,}24}\).
4. Zona: \(\zeta \ge 0{,}404\) (cono ±66,2°) y \(\sigma \ge 0{,}924\) (\(t_s = 4{,}33\) s).

</details>

#### Teoría · *Punto 7*

¿Por qué un PI elimina el error estacionario y un P no? Explique con un ejemplo numérico.

<details><summary>Respuesta</summary>

El PI agrega un polo en el origen, que vuelve el sistema tipo 1, y así el error ante escalón es cero. Con la planta \(\dfrac{1}{s+1}\): P con \(K_p = 9\) deja error \(1/(1+9) = 10\,\%\); un PI con \(K_p = 3\), \(K_i = 8\) da lazo cerrado \(\dfrac{3s+8}{s^2+4s+8}\), con valor final 1 y error 0.

</details>

#### Formulario

Todo lo que necesitas en una página.

| Tema | Fórmula |
|---|---|
| Raíces complejas | \(s^2+bs+c \to -\tfrac b2 \pm j\sqrt{c-\tfrac{b^2}{4}}\) |
| Polos a polinomio | \(-\sigma\pm j\omega_d \to (s+\sigma)^2+\omega_d^2\) |
| Tabla básica | \(\delta\to1\), \(u\to\frac1s\), \(t\to\frac1{s^2}\), \(e^{-at}\to\frac1{s+a}\), \(te^{-at}\to\frac{1}{(s+a)^2}\) |
| Seno y coseno amortiguados | \(e^{-at}\sin\omega t \to \frac{\omega}{(s+a)^2+\omega^2}\), \(e^{-at}\cos\omega t \to \frac{s+a}{(s+a)^2+\omega^2}\) |
| Retardo | \(e^{-Ts}F(s) \to f(t-T)\,u(t-T)\) |
| Valor final | \(y(\infty) = \lim_{s\to0}sY(s)\); ante escalón unitario, \(G(0)\) |
| Lazo cerrado | \(\frac{G}{1+GH}\); con \(H=1\) y \(G=\frac ND\): \(\frac{N}{D+N}\) |
| Impedancias | \(Z_R = R\), \(Z_C = \frac1{sC}\), \(Z_L = sL\); paralelo \(R\parallel C = \frac{R}{1+sRC}\) |
| Op-amp inversor | \(\frac{V_o}{V_i} = -\frac{Z_f}{Z_i}\); etapas en cascada se multiplican |
| Primer orden | \(\frac{K}{\tau s+1}\): impulso \(\frac K\tau e^{-t/\tau}\); escalón \(K(1-e^{-t/\tau})\); \(t_s = 4\tau\) |
| Segundo orden | \(\frac{K\omega_n^2}{s^2+2\zeta\omega_ns+\omega_n^2}\); \(\sigma = \zeta\omega_n\), \(\omega_d = \omega_n\sqrt{1-\zeta^2}\), \(\zeta = \cos\theta\) |
| Escalón 2.º orden | \(K\left[1-e^{-\sigma t}(\cos\omega_dt+\tfrac{\sigma}{\omega_d}\sin\omega_dt)\right]\) |
| Impulso 2.º orden | \(\frac{K\omega_n^2}{\omega_d}e^{-\sigma t}\sin\omega_dt\) |
| Especificaciones | \(M_p = e^{-\sigma\pi/\omega_d}\), \(t_p = \frac{\pi}{\omega_d}\), \(t_s = \frac4\sigma\), \(t_r = \frac{\pi-\theta}{\omega_d}\) |
| De \(M_p\) a \(\zeta\) | \(\zeta = \frac{-\ln M_p}{\sqrt{\pi^2+\ln^2M_p}}\); de gráfica \(M_p = \frac{y_{\max}-y_\infty}{y_\infty}\) |
| Zona de diseño | \(M_p\) → cono \(\theta \le \arccos\zeta_{\min}\); \(t_s\) → \(\sigma\ge\frac{4}{t_s}\); \(t_p\) → \(\omega_d\ge\frac{\pi}{t_p}\) |
| PID | \(C(s) = K_p + \frac{K_i}{s} + K_ds\) |
| Error estacionario | Escalón: \(\frac{1}{1+K_{pos}}\) (tipo 0), 0 (tipo ≥ 1); rampa: \(\frac{1}{K_v}\) (tipo 1) |

| \(\zeta\) | 0,1 | 0,2 | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,8 |
|---|---|---|---|---|---|---|---|---|
| \(M_p\) | 72,9 % | 52,7 % | 37,2 % | 25,4 % | 16,3 % | 9,5 % | 4,6 % | 1,5 % |

#### Verificación con código del simulacro

Resuelve primero los Puntos 2 y 4 en papel. Después guarda este script en `academia-labs/control-1/verificacion.py`:

```python
# verificacion.py
from sympy import symbols, simplify, exp, pi

s = symbols("s")
controlador = 20 * (s + 1) / s
print("PI_correcto:", simplify(controlador - (20 + 20/s)) == 0)
sobrepico = 100 * exp(-pi / 7)
print("sobrepico_porcentaje:", round(float(sobrepico), 1))
```

Con el entorno del módulo 0 activo, ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `PI_correcto: True` y `sobrepico_porcentaje: 63.8`. El primer resultado confirma la separación de la acción proporcional e integral; el segundo usa los polos \(-1\pm7j\) del Punto 4.

**Práctica:** cambia \(\sigma\) de 1 a 2 en \(e^{-\sigma\pi/\omega_d}\), calcula el nuevo sobrepico sin ejecutar y luego compruébalo. **Límite:** el sobrepico ideal supone el modelo de segundo orden y escalón unitario; no evalúa saturación del actuador del Punto 1.
