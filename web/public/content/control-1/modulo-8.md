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

#### Mecánico de rotación

Las mismas leyes con ángulo \(\theta\) y torque \(T\): inercia \(J\) (\(J\ddot\theta\)), fricción viscosa \(B\) (\(B\dot\theta\)) y resorte torsional \(K\) (\(K\theta\)):

\[J\ddot\theta + B\dot\theta + K\theta = T \quad\Rightarrow\quad \frac{\Theta(s)}{T(s)} = \frac{1}{Js^2+Bs+K}\]

#### Motor DC (electromecánico)

Un motor DC une un circuito (la armadura) con un sistema rotacional (el eje). Dos leyes los conectan: el torque es proporcional a la corriente, \(T = K_t i\), y el motor genera un voltaje que se opone, proporcional a la velocidad, \(e_b = K_b\omega\).

#### Demostración · Derivación de ω/V

1. Circuito de armadura (Kirchhoff): \(v = Ri + L\dfrac{di}{dt} + K_b\omega\). En Laplace: \(V = (Ls+R)I + K_b\Omega\).
2. Eje (Newton rotacional): \(J\dot\omega + B\omega = K_ti\). En Laplace: \((Js+B)\Omega = K_tI\), así que \(I = \dfrac{(Js+B)\Omega}{K_t}\).
3. Reemplaza \(I\) en la primera: \(V = \left[\dfrac{(Ls+R)(Js+B)}{K_t} + K_b\right]\Omega\).
4. \(\dfrac{\Omega(s)}{V(s)} = \dfrac{K_t}{(Ls+R)(Js+B) + K_tK_b}\).
5. Si \(L\) es muy pequeña (\(L\approx0\)): \(\dfrac{K_t}{R(Js+B)+K_tK_b}\), un primer orden. Para la posición, \(\Theta = \Omega/s\): se agrega un integrador.

∎

#### Ejemplo 2 · Motor DC con valores · *Nivel parcial*

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

#### Sistemas térmicos e hidráulicos

- Térmico (horno)Capacidad térmica \(C\) y resistencia térmica \(R\) hacia el ambiente. Balance de energía: lo que entra menos lo que sale se acumula.
  
  \[C\frac{dT}{dt} = q - \frac{T - T_a}{R}\]
  
  Con \(\theta = T - T_a\): \(\dfrac{\Theta}{Q} = \dfrac{R}{RCs+1}\).
- Hidráulico (tanque)Área \(A\) y válvula de salida con resistencia \(R\) (\(q_o = h/R\)). Balance de masa:
  
  \[A\frac{dh}{dt} = q_i - \frac{h}{R}\]
  
  \(\dfrac{H}{Q_i} = \dfrac{R}{ARs+1}\).

#### Ejemplo 3 · Tanque · *Intermedio*

> **Qué cambia respecto al anterior:** Otro dominio físico, primer orden.

**Enunciado.** \(A = 2\) m², \(R = 5\) s/m². El caudal de entrada sube 0,1 m³/s. ¿Cuánto sube el nivel y en cuánto tiempo?

1. \(G = \dfrac{R}{ARs+1} = \dfrac{5}{10s+1}\).

   **¿Por qué?** Fórmula del tanque.

2. Lee \(K = 5\), \(\tau = AR = 10\) s.

   **¿Por qué?** Forma estándar de primer orden (capítulo 12).

3. \(\Delta h = 0{,}1\cdot5 = 0{,}5\) m; \(t_s = 4\tau = 40\) s.

   **¿Por qué?** Amplitud por \(K\); establecimiento en \(4\tau\).

**Resultado:** Sube 0,5 m y se estabiliza en 40 s

#### Analogías

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

#### Práctica

- **1.**\(m = 2\), \(b = 8\), \(k = 50\). \(\omega_n\), \(\zeta\), \(G(s)\).
  
  <details><summary>Respuesta</summary>
  
  \(G = \dfrac{1}{2s^2+8s+50} = \dfrac{0{,}5}{s^2+4s+25}\); \(\omega_n = 5\), \(\zeta = 0{,}4\).
  
  </details>

- **2.**Horno con \(R = 0{,}5\) °C/W y \(C = 400\) J/°C. \(\tau\) y aumento con 200 W.
  
  <details><summary>Respuesta</summary>
  
  \(\tau = RC = 200\) s; \(\Delta\theta = 200\cdot0{,}5 = 100\) °C.
  
  </details>
