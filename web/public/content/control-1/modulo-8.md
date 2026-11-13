# Módulo 8: Modelado de sistemas físicos

Sistemas mecánicos, motores, hornos y tanques se describen con las mismas ecuaciones que un circuito. Aprende a obtener su función de transferencia a partir de las leyes físicas.

**Al terminar podrás:**

- Modelar masa-resorte-amortiguador y sistemas rotacionales.
- Obtener la función de transferencia de un motor DC.
- Modelar sistemas térmicos e hidráulicos de primer orden.
- Usar las analogías entre dominios.

## Aprende construyendo

### Tema 1: Mecánico de traslación

**¿Por qué es importante?** La masa-resorte-amortiguador es el modelo de suspensiones, estructuras y sensores, y tiene la misma forma que un RLC.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

| Elemento | Ley | En Laplace |
|---|---|---|
| Masa \(m\) | \(F = m\ddot x\) (Newton) | \(ms^2X\) |
| Resorte \(k\) | \(F = kx\) (Hooke) | \(kX\) |
| Amortiguador \(b\) | \(F = b\dot x\) | \(bsX\) |

#### Demostración · Derivación · masa, resorte y amortiguador

1. Diagrama de cuerpo libre: sobre la masa actúa la fuerza aplicada \(f\) hacia la derecha; el resorte (\(-kx\)) y el amortiguador (\(-b\dot x\)) se oponen al movimiento.
2. Segunda ley de Newton: \(m\ddot x = f - b\dot x - kx\), es decir \(m\ddot x + b\dot x + kx = f\).
3. Laplace: \((ms^2 + bs + k)X = F\), así que \(G(s) = \dfrac{X}{F} = \dfrac{1}{ms^2+bs+k}\).
4. Forma estándar: \(\dfrac{1/k\cdot\omega_n^2}{s^2+2\zeta\omega_ns+\omega_n^2}\) con \(\omega_n = \sqrt{k/m}\), \(\zeta = \dfrac{b}{2\sqrt{km}}\), \(K = 1/k\).

∎

#### Ejemplo 1 · Suspensión · *Intermedio*

**Enunciado.** \(m = 1\) kg, \(b = 4\) N·s/m, \(k = 20\) N/m. Halla \(\omega_n\), \(\zeta\), \(M_p\) y el desplazamiento final con 10 N.

1. \(G = \dfrac{1}{s^2+4s+20}\).

   **¿Por qué?** Fórmula \(\dfrac{1}{ms^2+bs+k}\) con \(m = 1\).

2. \(\omega_n = \sqrt{k/m} = \sqrt{20} = 4{,}47\) rad/s.

   **¿Por qué?** El término independiente es \(\omega_n^2\) (capítulo 13).

3. \(\zeta = \dfrac{b}{2\sqrt{km}} = \dfrac{4}{2\cdot4{,}47} = 0{,}447\).

   **¿Por qué?** El coeficiente de \(s\) es \(2\zeta\omega_n\).

4. \(M_p = e^{-\zeta\pi/\sqrt{1-\zeta^2}} = e^{-0{,}447\pi/0{,}894} = 20{,}8\,\%\).

   **¿Por qué?** Fórmula del sobrepico (capítulo 13).

5. Final: \(10\cdot G(0) = 10\cdot\dfrac{1}{20} = 0{,}5\) m.

   **¿Por qué?** Ante escalón, el valor final es la amplitud por \(G(0)\).

**Resultado:** Oscila un 20,8 % por encima y queda 0,5 m desplazada

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Masa-resorte-amortiguador: M = 1, B = 4, K = 20 · *Básico*

**Enunciado.** Halla \(X(s)/F(s)\), \(\omega_n\) y \(\zeta\).

1. Newton: \(1\ddot x + 4\dot x + 20x = f\).

   **¿Por qué?** Suma de fuerzas sobre la masa: fuerza aplicada menos la del amortiguador menos la del resorte.

2. \(\dfrac{X}{F} = \frac{1}{s^{2} + 4 s + 20}\).

   **¿Por qué?** Transformando con condiciones iniciales cero.

**Resultado.** \(\omega_n = \sqrt{K/M} = 2 \sqrt{5}\approx 4{,}472\) rad/s, \(\zeta = \dfrac{B}{2\sqrt{MK}} \approx 0{,}447\); ganancia DC \(1/K = \frac{1}{20}\) m/N.

#### Ejemplo 3 · Masa-resorte-amortiguador: M = 2, B = 8, K = 50 · *Intermedio*

**Enunciado.** Halla \(X(s)/F(s)\), \(\omega_n\) y \(\zeta\).

1. Newton: \(2\ddot x + 8\dot x + 50x = f\).

   **¿Por qué?** Suma de fuerzas sobre la masa: fuerza aplicada menos la del amortiguador menos la del resorte.

2. \(\dfrac{X}{F} = \frac{1}{2 s^{2} + 8 s + 50}\).

   **¿Por qué?** Transformando con condiciones iniciales cero.

**Resultado.** \(\omega_n = \sqrt{K/M} = 5\) rad/s, \(\zeta = \dfrac{B}{2\sqrt{MK}} \approx 0{,}4\); ganancia DC \(1/K = \frac{1}{50}\) m/N.

#### Ejemplo 4 · Masa-resorte-amortiguador: M = 0,5, B = 1, K = 8 · *Intermedio*

**Enunciado.** Halla \(X(s)/F(s)\), \(\omega_n\) y \(\zeta\).

1. Newton: \(\frac{1}{2}\ddot x + 1\dot x + 8x = f\).

   **¿Por qué?** Suma de fuerzas sobre la masa: fuerza aplicada menos la del amortiguador menos la del resorte.

2. \(\dfrac{X}{F} = \frac{1}{\frac{s^{2}}{2} + s + 8}\).

   **¿Por qué?** Transformando con condiciones iniciales cero.

**Resultado.** \(\omega_n = \sqrt{K/M} = 4\) rad/s, \(\zeta = \dfrac{B}{2\sqrt{MK}} \approx 0{,}25\); ganancia DC \(1/K = \frac{1}{8}\) m/N.

#### Ejemplo 5 · Dos masas acopladas · *Avanzado*

**Enunciado.** Dos masas \(M_1, M_2\) unidas por un resorte \(K\); la fuerza actúa sobre \(M_1\) y \(M_2\) tiene amortiguador \(B\) a tierra.

1. Ecuaciones: \(M_1\ddot x_1 + K(x_1-x_2) = f\) y \(M_2\ddot x_2 + B\dot x_2 + K(x_2-x_1) = 0\).

   **¿Por qué?** Una ecuación de Newton por cada masa; el resorte actúa según la diferencia de posiciones.

2. De la segunda: \(X_2 = \dfrac{K}{M_2s^2+Bs+K}X_1\).

   **¿Por qué?** Se despeja una variable y se sustituye en la otra.

**Resultado.** \(\dfrac{X_2}{F} = \dfrac{K}{(M_1s^2+K)(M_2s^2+Bs+K)-K^2}\): un sistema de cuarto orden.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 (suspensión).

```python
# verificacion.py
from sympy import sqrt, Rational, N

m, b, k = 1, 4, 20
wn = sqrt(Rational(k, m))
zeta = Rational(b, 1) / (2 * sqrt(k * m))
final = 10 * Rational(1, k)
print("wn:", N(wn, 3))
print("zeta:", N(zeta, 3))
print("final:", final)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `wn: 4.47`, `zeta: 0.447` y `final: 1/2`, igual al Ejemplo 1.

**Práctica:** cambia `m, b, k` a `2, 8, 50` y confirma \(\omega_n=5\), \(\zeta=0{,}4\) (práctica 1 de esta sección).

**Límite:** estas fórmulas valen para un sistema lineal de un solo grado de libertad; con dos masas acopladas (Ejemplo 5) el sistema es de cuarto orden y \(\zeta\), \(\omega_n\) ya no se leen de un solo término cuadrático.

### Tema 2: Mecánico de rotación

**¿Por qué es importante?** Los sistemas rotacionales modelan ejes, brazos robóticos y antenas.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

Las mismas leyes con ángulo \(\theta\) y torque \(T\): inercia \(J\) (\(J\ddot\theta\)), fricción viscosa \(B\) (\(B\dot\theta\)) y resorte torsional \(K\) (\(K\theta\)):

\[J\ddot\theta + B\dot\theta + K\theta = T \quad\Rightarrow\quad \frac{\Theta(s)}{T(s)} = \frac{1}{Js^2+Bs+K}\]

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Eje con J = 0,1 kg·m², B = 1 N·m·s, K = 0 N·m/rad · *Básico*

**Enunciado.** Halla \(\Theta(s)/T(s)\) y, si aplica, \(\Omega(s)/T(s)\).

1. Newton rotacional: \(\frac{1}{10}\ddot\theta + 1\dot\theta = \tau\).

   **¿Por qué?** Torque aplicado = inercia × aceleración angular + fricción viscosa + torsión del eje.

2. \(\dfrac{\Theta}{T} = \frac{1}{\frac{s^{2}}{10} + s}\).

   **¿Por qué?** Transformada con condiciones iniciales nulas.

**Resultado.** Hay un polo en \(s=0\): la posición crece sin límite ante un torque constante. En velocidad, \(\dfrac{\Omega}{T} = \frac{10}{s + 10}\), primer orden con \(\tau = J/B = \frac{1}{10}\) s.

#### Ejemplo 2 · Eje con J = 0,5 kg·m², B = 2 N·m·s, K = 10 N·m/rad · *Intermedio*

**Enunciado.** Halla \(\Theta(s)/T(s)\) y, si aplica, \(\Omega(s)/T(s)\).

1. Newton rotacional: \(\frac{1}{2}\ddot\theta + 2\dot\theta + 10\theta = \tau\).

   **¿Por qué?** Torque aplicado = inercia × aceleración angular + fricción viscosa + torsión del eje.

2. \(\dfrac{\Theta}{T} = \frac{1}{\frac{s^{2}}{2} + 2 s + 10}\).

   **¿Por qué?** Transformada con condiciones iniciales nulas.

**Resultado.** Segundo orden con \(\omega_n = \sqrt{K/J} \approx 4{,}472\) rad/s.

#### Ejemplo 3 · Eje con J = 1 kg·m², B = 3 N·m·s, K = 0 N·m/rad · *Básico*

**Enunciado.** Halla \(\Theta(s)/T(s)\) y, si aplica, \(\Omega(s)/T(s)\).

1. Newton rotacional: \(1\ddot\theta + 3\dot\theta = \tau\).

   **¿Por qué?** Torque aplicado = inercia × aceleración angular + fricción viscosa + torsión del eje.

2. \(\dfrac{\Theta}{T} = \frac{1}{s^{2} + 3 s}\).

   **¿Por qué?** Transformada con condiciones iniciales nulas.

**Resultado.** Hay un polo en \(s=0\): la posición crece sin límite ante un torque constante. En velocidad, \(\dfrac{\Omega}{T} = \frac{1}{s + 3}\), primer orden con \(\tau = J/B = \frac{1}{3}\) s.

#### Ejemplo 4 · Eje con J = 2 kg·m², B = 1 N·m·s, K = 8 N·m/rad · *Intermedio*

**Enunciado.** Halla \(\Theta(s)/T(s)\) y, si aplica, \(\Omega(s)/T(s)\).

1. Newton rotacional: \(2\ddot\theta + 1\dot\theta + 8\theta = \tau\).

   **¿Por qué?** Torque aplicado = inercia × aceleración angular + fricción viscosa + torsión del eje.

2. \(\dfrac{\Theta}{T} = \frac{1}{2 s^{2} + s + 8}\).

   **¿Por qué?** Transformada con condiciones iniciales nulas.

**Resultado.** Segundo orden con \(\omega_n = \sqrt{K/J} \approx 2\) rad/s.

#### Ejemplo 5 · Engranajes · *Intermedio*

**Enunciado.** Un motor mueve una carga \(J_L = 2\) kg·m² a través de engranajes \(N_1 = 10\), \(N_2 = 50\) dientes. ¿Qué inercia ve el motor?

1. Inercia reflejada: \(J_L\left(\tfrac{N_1}{N_2}\right)^2 = 2\cdot(0{,}2)^2 = 0{,}08\) kg·m².

   **¿Por qué?** Los engranajes reducen la velocidad y aumentan el torque; la carga se ve "más liviana" por el cuadrado de la relación.

**Resultado.** El motor ve 0,08 kg·m² más su propia inercia.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 2 (eje J=0,5, B=2, K=10).

```python
# verificacion.py
from sympy import sqrt, Rational, N

J, B, K = Rational(1, 2), 2, 10
wn = sqrt(K / J)
print("wn:", N(wn, 4))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `wn: 4.472`, igual al Ejemplo 2.

**Práctica:** cambia `J, K` a `2, 8` y confirma \(\omega_n=2\) (Ejemplo 4).

**Límite:** esto asume el eje rígido conectado directamente a la carga; con engranajes (Ejemplo 5) la inercia y la fricción de la carga deben reflejarse multiplicando por el cuadrado de la relación de transmisión antes de aplicar esta fórmula.

### Tema 3: Motor DC (electromecánico)

**¿Por qué es importante?** El motor DC es el actuador más común en control; su función de transferencia aparece en casi todos los proyectos.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

Un motor DC une un circuito (la armadura) con un sistema rotacional (el eje). Dos leyes los conectan: el torque es proporcional a la corriente, \(T = K_t i\), y el motor genera un voltaje que se opone, proporcional a la velocidad, \(e_b = K_b\omega\).

#### Demostración · Derivación de ω/V

1. Circuito de armadura (Kirchhoff): \(v = Ri + L\dfrac{di}{dt} + K_b\omega\). En Laplace: \(V = (Ls+R)I + K_b\Omega\).
2. Eje (Newton rotacional): \(J\dot\omega + B\omega = K_ti\). En Laplace: \((Js+B)\Omega = K_tI\), así que \(I = \dfrac{(Js+B)\Omega}{K_t}\).
3. Reemplaza \(I\) en la primera: \(V = \left[\dfrac{(Ls+R)(Js+B)}{K_t} + K_b\right]\Omega\).
4. \(\dfrac{\Omega(s)}{V(s)} = \dfrac{K_t}{(Ls+R)(Js+B) + K_tK_b}\).
5. Si \(L\) es muy pequeña (\(L\approx0\)): \(\dfrac{K_t}{R(Js+B)+K_tK_b}\), un primer orden. Para la posición, \(\Theta = \Omega/s\): se agrega un integrador.

∎

#### Ejemplo 1 · Motor DC con valores · *Nivel parcial*

> **Qué cambia respecto al anterior:** Dos dominios (eléctrico y mecánico) conectados.

**Enunciado.** \(R = 1\) Ω, \(L = 0{,}5\) H, \(J = 0{,}01\), \(B = 0{,}1\), \(K_t = K_b = 0{,}01\). Halla \(\Omega/V\), los polos y la velocidad con 12 V.

1. Reemplaza en \(\dfrac{K_t}{(Ls+R)(Js+B)+K_tK_b}\).

   \[\frac{0{,}01}{(0{,}5s+1)(0{,}01s+0{,}1)+0{,}0001}\]

   **¿Por qué?** Es la fórmula derivada arriba.

2. Expande: \((0{,}5s+1)(0{,}01s+0{,}1) = 0{,}005s^2 + 0{,}05s + 0{,}01s + 0{,}1 = 0{,}005s^2+0{,}06s+0{,}1\). Más 0,0001.

   **¿Por qué?** Distributiva.

3. Divide todo por 0,005: \(\dfrac{2}{s^2+12s+20{,}02}\).

   **¿Por qué?** Para que \(s^2\) tenga coeficiente 1.

4. Polos: \(-6\pm\sqrt{36-20{,}02} = -6\pm4{,}0\): \(-2\) y \(-10\).

   **¿Por qué?** \(\Delta > 0\): reales. El lento (\(-2\)) es el mecánico y el rápido (\(-10\)) el eléctrico.

5. \(G(0) = 2/20{,}02 = 0{,}0999\) rad/s por voltio. Con 12 V: 1,2 rad/s.

   **¿Por qué?** Valor final.

**Resultado:** \(\dfrac{\Omega}{V} = \dfrac{2}{s^2+12s+20{,}02}\), \(\omega_\infty = 1{,}2\) rad/s

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Motor DC (inductancia despreciable): Ra = 1 Ω, K = 0,1, J = 0,01, B = 0,001 · *Intermedio*

**Enunciado.** Halla \(\Omega(s)/V(s)\), la ganancia y la constante de tiempo.

1. Eléctrica: \(V = R_aI + K\Omega\). Mecánica: \(J s\Omega + B\Omega = KI\).

   **¿Por qué?** La fuerza contraelectromotriz \(K\Omega\) se opone al voltaje; el torque \(KI\) mueve el eje.

2. Despeja \(I\) de la eléctrica y sustituye en la mecánica.

   **¿Por qué?** Así queda solo la relación entre voltaje y velocidad.

**Resultado.** \(\dfrac{\Omega}{V} = \dfrac{K}{JR_as + BR_a + K^2} \approx \dfrac{9{,}091}{0{,}909s + 1}\): primer orden con \(\tau = 0{,}909\,\text{s}\) y ganancia \(9{,}091\) rad/s por voltio.

#### Ejemplo 3 · Motor DC (inductancia despreciable): Ra = 2 Ω, K = 0,5, J = 0,05, B = 0,01 · *Intermedio*

**Enunciado.** Halla \(\Omega(s)/V(s)\), la ganancia y la constante de tiempo.

1. Eléctrica: \(V = R_aI + K\Omega\). Mecánica: \(J s\Omega + B\Omega = KI\).

   **¿Por qué?** La fuerza contraelectromotriz \(K\Omega\) se opone al voltaje; el torque \(KI\) mueve el eje.

2. Despeja \(I\) de la eléctrica y sustituye en la mecánica.

   **¿Por qué?** Así queda solo la relación entre voltaje y velocidad.

**Resultado.** \(\dfrac{\Omega}{V} = \dfrac{K}{JR_as + BR_a + K^2} \approx \dfrac{1{,}852}{0{,}37s + 1}\): primer orden con \(\tau = 0{,}37\,\text{s}\) y ganancia \(1{,}852\) rad/s por voltio.

#### Ejemplo 4 · Motor DC (inductancia despreciable): Ra = 0,5 Ω, K = 0,05, J = 0,001, B = 0 · *Avanzado*

**Enunciado.** Halla \(\Omega(s)/V(s)\), la ganancia y la constante de tiempo.

1. Eléctrica: \(V = R_aI + K\Omega\). Mecánica: \(J s\Omega + B\Omega = KI\).

   **¿Por qué?** La fuerza contraelectromotriz \(K\Omega\) se opone al voltaje; el torque \(KI\) mueve el eje.

2. Despeja \(I\) de la eléctrica y sustituye en la mecánica.

   **¿Por qué?** Así queda solo la relación entre voltaje y velocidad.

**Resultado.** \(\dfrac{\Omega}{V} = \dfrac{K}{JR_as + BR_a + K^2} \approx \dfrac{20}{0{,}2s + 1}\): primer orden con \(\tau = 0{,}2\,\text{s}\) y ganancia \(20\) rad/s por voltio.

#### Ejemplo 5 · Motor DC (inductancia despreciable): Ra = 4 Ω, K = 0,2, J = 0,02, B = 0,005 · *Intermedio*

**Enunciado.** Halla \(\Omega(s)/V(s)\), la ganancia y la constante de tiempo.

1. Eléctrica: \(V = R_aI + K\Omega\). Mecánica: \(J s\Omega + B\Omega = KI\).

   **¿Por qué?** La fuerza contraelectromotriz \(K\Omega\) se opone al voltaje; el torque \(KI\) mueve el eje.

2. Despeja \(I\) de la eléctrica y sustituye en la mecánica.

   **¿Por qué?** Así queda solo la relación entre voltaje y velocidad.

**Resultado.** \(\dfrac{\Omega}{V} = \dfrac{K}{JR_as + BR_a + K^2} \approx \dfrac{3{,}333}{1{,}333s + 1}\): primer orden con \(\tau = 1{,}333\,\text{s}\) y ganancia \(3{,}333\) rad/s por voltio.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar los polos del Ejemplo 1 (motor DC completo).

```python
# verificacion.py
from sympy import symbols, solve, N

s = symbols("s")
R, L, J, B, Kt, Kb = 1, 0.5, 0.01, 0.1, 0.01, 0.01
den = (L * s + R) * (J * s + B) + Kt * Kb
polos = solve(den, s)
print("polos:", sorted(N(p, 3) for p in polos))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `polos: [-10.0, -2.00]`, igual al Ejemplo 1 (polo eléctrico rápido en −10, polo mecánico lento en −2).

**Práctica:** usa los valores del Ejemplo 3 (\(R_a=2,\ K=0{,}5,\ J=0{,}05,\ B=0{,}01\), sin inductancia) para construir \(G=\dfrac{K}{JR_as+BR_a+K^2}\) y confirma \(\tau\approx0{,}37\) s.

**Límite:** cuando \(L\) no es despreciable el sistema es de segundo orden con dos polos (eléctrico y mecánico); la aproximación de primer orden de los Ejemplos 2 a 5 solo es válida si el polo eléctrico \(R/L\) es mucho más rápido que el mecánico.

### Tema 4: Sistemas térmicos e hidráulicos

**¿Por qué es importante?** Hornos y tanques son los procesos típicos de la industria y se modelan como sistemas de primer orden.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

- Térmico (horno)Capacidad térmica \(C\) y resistencia térmica \(R\) hacia el ambiente. Balance de energía: lo que entra menos lo que sale se acumula.
  
  \[C\frac{dT}{dt} = q - \frac{T - T_a}{R}\]
  
  Con \(\theta = T - T_a\): \(\dfrac{\Theta}{Q} = \dfrac{R}{RCs+1}\).
- Hidráulico (tanque)Área \(A\) y válvula de salida con resistencia \(R\) (\(q_o = h/R\)). Balance de masa:
  
  \[A\frac{dh}{dt} = q_i - \frac{h}{R}\]
  
  \(\dfrac{H}{Q_i} = \dfrac{R}{ARs+1}\).

#### Ejemplo 1 · Tanque · *Intermedio*

> **Qué cambia respecto al anterior:** Otro dominio físico, primer orden.

**Enunciado.** \(A = 2\) m², \(R = 5\) s/m². El caudal de entrada sube 0,1 m³/s. ¿Cuánto sube el nivel y en cuánto tiempo?

1. \(G = \dfrac{R}{ARs+1} = \dfrac{5}{10s+1}\).

   **¿Por qué?** Fórmula del tanque.

2. Lee \(K = 5\), \(\tau = AR = 10\) s.

   **¿Por qué?** Forma estándar de primer orden (capítulo 12).

3. \(\Delta h = 0{,}1\cdot5 = 0{,}5\) m; \(t_s = 4\tau = 40\) s.

   **¿Por qué?** Amplitud por \(K\); establecimiento en \(4\tau\).

**Resultado:** Sube 0,5 m y se estabiliza en 40 s

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Horno con resistencia térmica · *Básico*

**Enunciado.** Capacidad térmica \(C_t = 500\) J/°C y resistencia térmica \(R_t = 0{,}2\) °C/W. Halla \(\Theta(s)/Q(s)\).

1. Balance: \(C_t\dot\theta = q - \dfrac{\theta}{R_t}\).

   **¿Por qué?** El calor que entra menos el que se pierde se acumula como aumento de temperatura.

**Resultado.** \(\dfrac{\Theta}{Q} = \dfrac{R_t}{R_tC_ts+1} = \dfrac{0{,}2}{100s+1}\): \(\tau = 100\) s y 0,2 °C por vatio en régimen permanente.

#### Ejemplo 3 · Tanque con salida libre (linealizado) · *Intermedio*

**Enunciado.** Área \(A = 2\) m² y resistencia hidráulica \(R_h = 50\) s/m². Halla \(H(s)/Q_i(s)\).

1. Balance de volumen: \(A\dot h = q_i - \dfrac{h}{R_h}\).

   **¿Por qué?** Lo que entra menos lo que sale cambia el volumen \(Ah\).

**Resultado.** \(\dfrac{H}{Q_i} = \dfrac{50}{100s+1}\): \(\tau = AR_h = 100\) s.

#### Ejemplo 4 · Dos tanques en cascada (no interactuantes) · *Avanzado*

**Enunciado.** Tanque 1 (\(\tau_1 = 50\) s, ganancia 2) descarga en el tanque 2 (\(\tau_2 = 20\) s, ganancia 1).

1. Como el segundo no afecta al primero, las funciones se multiplican.

   **¿Por qué?** Bloques en serie sin carga mutua.

**Resultado.** \(\dfrac{H_2}{Q_i} = \dfrac{2}{(50s+1)(20s+1)}\): segundo orden sobreamortiguado (dos polos reales).

#### Ejemplo 5 · Termómetro como sistema de primer orden · *Básico*

**Enunciado.** Un termómetro tarda 30 s en marcar el 63 % de un salto de temperatura. ¿Cuál es su modelo?

1. El 63,2 % se alcanza en \(t = \tau\).

   **¿Por qué?** En \(1-e^{-t/\tau}\), para \(t=\tau\) queda \(1-e^{-1} = 0{,}632\).

**Resultado.** \(G(s) = \dfrac{1}{30s+1}\) (ganancia 1, porque al final marca la temperatura real).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 (tanque).

```python
# verificacion.py
from sympy import symbols

s = symbols("s")
A, R = 2, 5
G = R / (A * R * s + 1)
print("G(s):", G)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `G(s): 5/(10*s + 1)`, igual a \(K=5\), \(\tau=10\) del Ejemplo 1.

**Práctica:** cambia `A, R` a los del horno del Ejemplo 2 (\(C_t=500\), \(R_t=0{,}2\), usando \(G=R_t/(R_tC_ts+1)\)) y confirma \(\tau=100\) s.

**Límite:** este modelo de primer orden asume mezcla perfecta y una pérdida lineal con la salida; un tanque con válvula de salida turbulenta real (\(q\propto\sqrt h\)) no es lineal y esta fórmula es solo una linealización alrededor de un punto de operación.

**Conexión con el proyecto integrador:** el proyecto `examples/control-1-tanque/` usa exactamente este modelo lineal, con \(A=2\) m² y salida \(q=0{,}5h\) (es decir \(R=1/0{,}5=2\) s/m²). Calcula \(G(s)=R/(ARs+1)\) con esos valores (\(K=2\), \(\tau=4\) s) y anótalo como el primer dato de tu bitácora antes de ejecutar `simular.py`.

### Tema 5: Analogías

**¿Por qué es importante?** Las analogías te permiten reutilizar lo aprendido en un dominio para entender cualquier otro.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

| Eléctrico | Traslación | Rotación | Hidráulico | Térmico |
|---|---|---|---|---|
| Voltaje \(v\) | Fuerza \(f\) | Torque \(T\) | Presión / nivel \(h\) | Temperatura \(\theta\) |
| Corriente \(i\) | Velocidad \(\dot x\) | Velocidad angular \(\omega\) | Caudal \(q\) | Flujo de calor \(q\) |
| Resistencia \(R\) | Amortiguador \(b\) | Fricción \(B\) | Válvula \(R\) | Resistencia térmica \(R\) |
| Inductancia \(L\) | Masa \(m\) | Inercia \(J\) | Inercia del fluido | — |
| Capacitancia \(C\) | \(1/k\) | \(1/K\) | Área \(A\) | Capacidad térmica \(C\) |

Con esta tabla, el RLC serie \(LC\ddot q + RC\dot q + q\) y la masa-resorte \(m\ddot x + b\dot x + kx\) son la misma ecuación. Lo que aprendes en uno vale para el otro.

#### Errores comunes

- Equivocar el signo de las fuerzas que se oponen al movimiento.
- Olvidar la fuerza contraelectromotriz \(K_b\omega\) en el motor.
- Confundir la velocidad \(\Omega\) con la posición \(\Theta = \Omega/s\).

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Analogía fuerza–voltaje: Masa \(M\) · *Básico*

**Enunciado.** ¿A qué equivale Masa \(M\) en un circuito y en un sistema rotacional?

1. Circuito: Inductancia \(L\). Rotación: Inercia \(J\).

   **¿Por qué?** Ambos acumulan energía cinética / magnética: \(\tfrac12Mv^2\) ↔ \(\tfrac12Li^2\).

**Resultado.** Por eso sus ecuaciones tienen la misma forma y se resuelven igual.

#### Ejemplo 2 · Analogía fuerza–voltaje: Amortiguador \(B\) · *Básico*

**Enunciado.** ¿A qué equivale Amortiguador \(B\) en un circuito y en un sistema rotacional?

1. Circuito: Resistencia \(R\). Rotación: Fricción viscosa \(B\).

   **¿Por qué?** Disipan energía: fuerza \(Bv\) ↔ voltaje \(Ri\).

**Resultado.** Por eso sus ecuaciones tienen la misma forma y se resuelven igual.

#### Ejemplo 3 · Analogía fuerza–voltaje: Resorte \(K\) · *Básico*

**Enunciado.** ¿A qué equivale Resorte \(K\) en un circuito y en un sistema rotacional?

1. Circuito: Capacitor \(1/C\). Rotación: Rigidez torsional \(K\).

   **¿Por qué?** Acumulan energía potencial: \(\tfrac12Kx^2\) ↔ \(\tfrac12q^2/C\).

**Resultado.** Por eso sus ecuaciones tienen la misma forma y se resuelven igual.

#### Ejemplo 4 · Del RLC serie a la masa-resorte · *Intermedio*

**Enunciado.** Escribe el sistema mecánico análogo de un RLC serie con \(R = 4\), \(L = 1\), \(C = 0{,}05\).

1. \(L\ddot q + R\dot q + q/C = v\) se compara con \(M\ddot x + B\dot x + Kx = f\).

   **¿Por qué?** Misma ecuación con otros nombres.

**Resultado.** \(M = 1\), \(B = 4\), \(K = 20\): \(\omega_n = \sqrt{20}\approx4{,}47\) rad/s y \(\zeta \approx 0{,}45\) en los dos sistemas.

#### Ejemplo 5 · Elegir el análogo eléctrico de un eje · *Intermedio*

**Enunciado.** Un eje con \(J = 0{,}5\), \(B = 2\) y sin resorte. ¿Qué circuito se comporta igual en velocidad?

1. Velocidad: \(J\dot\omega + B\omega = \tau\) ↔ \(L\,di/dt + Ri = v\).

   **¿Por qué?** Primer orden en ambos casos.

**Resultado.** Un RL serie con \(L = 0{,}5\) y \(R = 2\): constante de tiempo \(L/R = J/B = 0{,}25\) s.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 4 (RLC a masa-resorte).

```python
# verificacion.py
from sympy import sqrt, Rational, N

R, L, C = 4, 1, Rational(1, 20)
M, B, K = L, R, 1 / C
wn = sqrt(K / M)
zeta = B / (2 * sqrt(K * M))
print("wn:", N(wn, 3))
print("zeta:", N(zeta, 3))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `wn: 4.47` y `zeta: 0.447`, igual al Ejemplo 4.

**Práctica:** usa la analogía del Ejemplo 5 (\(J=0{,}5\), \(B=2\) ↔ \(L=0{,}5\), \(R=2\)) y confirma que \(\tau=L/R=J/B=0{,}25\) s.

**Límite:** la analogía fuerza-voltaje empareja masa↔inductancia y resorte↔capacitancia; existe otra convención (fuerza-corriente) que empareja al revés — mezclar las dos convenciones en el mismo problema da un modelo incorrecto.

#### Práctica para resolver sola o solo

- **1.**\(m = 2\), \(b = 8\), \(k = 50\). \(\omega_n\), \(\zeta\), \(G(s)\).
  
  <details><summary>Respuesta</summary>
  
  \(G = \dfrac{1}{2s^2+8s+50} = \dfrac{0{,}5}{s^2+4s+25}\); \(\omega_n = 5\), \(\zeta = 0{,}4\).
  
  </details>

- **2.**Horno con \(R = 0{,}5\) °C/W y \(C = 400\) J/°C. \(\tau\) y aumento con 200 W.
  
  <details><summary>Respuesta</summary>
  
  \(\tau = RC = 200\) s; \(\Delta\theta = 200\cdot0{,}5 = 100\) °C.
  
  </details>

