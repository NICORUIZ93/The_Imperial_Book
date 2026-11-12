# Módulo 7: Circuitos y amplificadores operacionales

Con impedancias en Laplace, un circuito se resuelve como si solo tuviera resistencias. Es el atajo para el punto 2 del Parcial 1.

**Al terminar podrás:**

- Escribir la impedancia de R, C y L, y combinarlas en serie y en paralelo.
- Hallar \(G(s)\) de circuitos RC, RL y RLC con divisor de voltaje.
- Hallar \(G(s)\) de un op-amp inversor y de etapas en cascada.
- Reconocer qué acción de control (P, I, D, PI, PD) implementa cada circuito.

## Aprende construyendo

### Tema 1: Impedancias

**¿Por qué es importante?** Con impedancias resuelves un circuito como si solo tuviera resistencias; es el atajo que faltó en el punto 2 del Parcial 1.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

> **Idea clave.** En Laplace, el voltaje sobre un componente es su impedancia por la corriente: \(V = Z\,I\). Es la ley de Ohm generalizada.

| Componente | Ecuación en el tiempo | Impedancia \(Z(s)\) |
|---|---|---|
| Resistencia | \(v = Ri\) | \(R\) |
| Condensador | \(i = C\dfrac{dv}{dt}\) | \(\dfrac{1}{sC}\) |
| Bobina | \(v = L\dfrac{di}{dt}\) | \(sL\) |

#### Demostración de las impedancias

1. Resistencia: \(v = Ri \Rightarrow V = RI\), así que \(Z = V/I = R\).
2. Condensador: \(i = C\,\dfrac{dv}{dt}\). Con condiciones iniciales cero, la derivada se vuelve \(s\): \(I = sCV\), entonces \(Z = \dfrac{V}{I} = \dfrac{1}{sC}\).
3. Bobina: \(v = L\,\dfrac{di}{dt} \Rightarrow V = sLI\), así que \(Z = sL\).
4. Serie: misma corriente, los voltajes se suman: \(V = (Z_1+Z_2)I\). Paralelo: mismo voltaje, las corrientes se suman: \(I = V/Z_1 + V/Z_2\), así que \(\dfrac1Z = \dfrac{1}{Z_1}+\dfrac{1}{Z_2}\). Son las mismas leyes de Kirchhoff que con resistencias.

∎

- Serie: se suman
  
  \[R + \frac{1}{sC} = \frac{sRC+1}{sC}\]
  
  
- Paralelo: producto sobre suma
  
  \[R\parallel\frac{1}{sC} = \frac{R}{1+sRC}\]
  
  

> **Truco del paralelo:** es más fácil sumar admitancias: \(\dfrac{1}{Z} = \dfrac{1}{R} + sC = \dfrac{1+sRC}{R}\), y luego invertir.

#### Ejemplo 1 · Combinar impedancias · *Básico*

**Enunciado.** \(R = 2\) Ω y \(C = 0{,}5\) F. Halla la impedancia en serie y en paralelo.

1. \(Z_C = \dfrac{1}{sC} = \dfrac{1}{0{,}5s} = \dfrac2s\).

   **¿Por qué?** Tabla de impedancias.

2. Serie: \(Z = 2 + \dfrac2s = \dfrac{2s+2}{s}\).

   **¿Por qué?** En serie se suman, como resistencias.

3. Paralelo: \(\dfrac1Z = \dfrac12 + \dfrac{s}{2} = \dfrac{1+s}{2}\), así que \(Z = \dfrac{2}{s+1}\).

   **¿Por qué?** En paralelo se suman los inversos (admitancias) y al final se invierte.

**Resultado:** Serie \(\dfrac{2(s+1)}{s}\); paralelo \(\dfrac{2}{s+1}\)

#### Circuitos pasivos: divisor de voltaje

\[\frac{V_o}{V_i} = \frac{Z_{\text{salida}}}{Z_{\text{total}}}\]

#### Demostración del divisor

En serie circula una sola corriente \(I = V_i/Z_{total}\). El voltaje de salida es \(V_o = Z_{salida}I = Z_{salida}\dfrac{V_i}{Z_{total}}\).

∎

#### Ejemplo 2 · RC pasa-bajas · *Básico*

**Enunciado.** \(R = 10\) kΩ en serie, \(C = 100\) µF a tierra, salida en \(C\).

1. Divisor: \(\dfrac{V_o}{V_i} = \dfrac{Z_C}{R + Z_C} = \dfrac{1/(sC)}{R + 1/(sC)}\).

   **¿Por qué?** La salida está sobre \(C\), y \(R\) y \(C\) están en serie.

2. Multiplica arriba y abajo por \(sC\): \(\dfrac{1}{RCs+1}\).

   **¿Por qué?** Quita la fracción interna.

3. \(RC = 10^4\cdot10^{-4} = 1\) s.

   **¿Por qué?** \(\mu = 10^{-6}\), así que \(100\,\mu\text{F} = 10^{-4}\) F.

**Resultado:** \(G = \dfrac{1}{s+1}\): primer orden con \(\tau = 1\) s

#### Ejemplo 3 · RC pasa-altas · *Básico*

> **Qué cambia respecto al anterior:** Cambia dónde se toma la salida.

**Enunciado.** Mismo circuito, salida en \(R\).

1. \(\dfrac{V_o}{V_i} = \dfrac{R}{R + 1/(sC)}\).

   **¿Por qué?** Ahora la salida está sobre \(R\).

2. Por \(sC\): \(\dfrac{RCs}{RCs+1}\).

   **¿Por qué?** Mismo paso.

**Resultado:** \(G = \dfrac{s}{s+1}\): \(G(0) = 0\), bloquea la continua

#### Ejemplo 4 · RLC serie · *Intermedio*

> **Qué cambia respecto al anterior:** Se agrega una bobina: aparece \(s^2\).

**Enunciado.** \(L = 1\) H, \(R = 2\) Ω, \(C = 0{,}2\) F en serie; salida en \(C\).

1. \(Z_{total} = sL + R + \dfrac{1}{sC}\), \(Z_{salida} = \dfrac{1}{sC}\).

   **¿Por qué?** Tres elementos en serie.

2. Divisor y multiplica por \(sC\): \(\dfrac{1}{LCs^2 + RCs + 1}\).

   **¿Por qué?** Cada término de abajo se multiplica por \(sC\).

3. Valores: \(LC = 0{,}2\), \(RC = 0{,}4\): \(\dfrac{1}{0{,}2s^2+0{,}4s+1}\).

   **¿Por qué?** Reemplazo.

4. Divide arriba y abajo por 0,2: \(\dfrac{5}{s^2+2s+5}\).

   **¿Por qué?** Para que el coeficiente de \(s^2\) sea 1 (forma estándar de capítulo 13).

**Resultado:** \(G = \dfrac{5}{s^2+2s+5}\): segundo orden, polos \(-1\pm2j\)

### Tema 2: El op-amp inversor

**¿Por qué es importante?** Los controladores P, I, D, PI y PD se construyen con op-amps; saber leer el circuito te dice qué acción implementa.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

Con la entrada \(+\) a tierra, el op-amp ideal cumple dos reglas:

1. La entrada \(-\) también queda a 0 V (**tierra virtual**).
2. No entra corriente a las entradas del op-amp.

Entonces la corriente que llega por \(Z_i\) es la misma que sale por \(Z_f\): \(\dfrac{V_i - 0}{Z_i} = \dfrac{0 - V_o}{Z_f}\). Despejando:

\[\frac{V_o(s)}{V_i(s)} = -\frac{Z_f(s)}{Z_i(s)}\]

*\(Z_i\): entre la entrada y la pata −. \(Z_f\): entre la pata − y la salida.*

#### Demostración del inversor (con ganancia finita A)

1. Un op-amp real amplifica la diferencia de sus entradas: \(V_o = A(V_+ - V_-) = -AV_-\), porque \(V_+ = 0\). Así que \(V_- = -V_o/A\).
2. No entra corriente al op-amp (impedancia de entrada muy alta): la corriente por \(Z_i\) es igual a la corriente por \(Z_f\): \(\dfrac{V_i - V_-}{Z_i} = \dfrac{V_- - V_o}{Z_f}\).
3. Reemplaza \(V_-\) y despeja: \(\dfrac{V_o}{V_i} = -\dfrac{Z_f}{Z_i}\cdot\dfrac{1}{1 + \frac{1}{A}\left(1+\frac{Z_f}{Z_i}\right)}\).
4. En un op-amp real \(A \approx 10^5\) o más, así que el segundo factor vale prácticamente 1, y \(V_- \approx 0\): la **tierra virtual**.

∎

![Op-amp inversor con Zi a la entrada y Zf de realimentación](content/figures/control-1/opamp-inversor.svg)

*Inversor: la pata − queda a 0 V (tierra virtual), así que la ganancia solo depende de \(Z_f/Z_i\).*

#### Configuraciones típicas

| \(Z_i\) | \(Z_f\) | \(V_o/V_i\) | Acción |
|---|---|---|---|
| \(R_1\) | \(R_2\) | \(-\dfrac{R_2}{R_1}\) | Proporcional (P) |
| \(R\) | \(C\) | \(-\dfrac{1}{RCs}\) | Integral (I) |
| \(C\) | \(R\) | \(-RCs\) | Derivativa (D) |
| \(R_1\) | \(R_2\) en serie con \(C\) | \(-\dfrac{R_2Cs+1}{R_1Cs}\) | PI |
| \(R_1\parallel C\) | \(R_2\) | \(-\dfrac{R_2}{R_1}(R_1Cs+1)\) | PD |
| \(R_1\) | \(R_2\parallel C\) | \(-\dfrac{R_2/R_1}{R_2Cs+1}\) | Primer orden (filtro) |

**Procedimiento para cualquier circuito con op-amps**

1. Separa el circuito en etapas: cada op-amp es una etapa.
2. En cada etapa identifica \(Z_i\) y \(Z_f\).
3. Escribe cada una con \(R\) y \(\dfrac{1}{sC}\) y simplifícala a **una sola fracción**.
4. Aplica \(G_k = -Z_f/Z_i\). Dividir por una fracción es multiplicar por su inversa.
5. Multiplica las etapas: \(G = G_1 G_2\cdots\). Dos signos menos se cancelan.

#### Ejemplo 5 · Proporcional e integrador · *Básico*

**Enunciado.** (a) \(Z_i = 10\) kΩ, \(Z_f = 47\) kΩ. (b) \(Z_i = 100\) kΩ, \(Z_f = 10\) µF.

1. (a) \(-\dfrac{Z_f}{Z_i} = -\dfrac{47}{10} = -4{,}7\).

   **¿Por qué?** Fórmula del inversor. Solo resistencias: ganancia constante.

2. (b) \(Z_f = \dfrac{1}{sC}\): \(-\dfrac{1/(sC)}{R} = -\dfrac{1}{RCs}\). \(RC = 10^5\cdot10^{-5} = 1\).

   **¿Por qué?** Con un condensador en la realimentación aparece \(1/s\): integra.

**Resultado:** (a) \(-4{,}7\) (P); (b) \(-\dfrac1s\) (I)

#### Ejemplo 6 · PI · *Intermedio*

> **Qué cambia respecto al anterior:** \(Z_f\) es ahora una combinación R+C.

**Enunciado.** \(Z_i = R_1 = 10\) kΩ; \(Z_f = R_2 = 100\) kΩ en serie con \(C = 10\) µF.

1. \(Z_f = R_2 + \dfrac{1}{sC} = \dfrac{R_2Cs+1}{sC}\).

   **¿Por qué?** Serie: se suman. Se pasa a una sola fracción.

2. \(G = -\dfrac{Z_f}{Z_i} = -\dfrac{R_2Cs+1}{sC}\cdot\dfrac{1}{R_1} = -\dfrac{R_2Cs+1}{R_1Cs}\).

   **¿Por qué?** Dividir por \(R_1\) es multiplicar por \(1/R_1\).

3. \(R_2C = 1\), \(R_1C = 0{,}1\): \(-\dfrac{s+1}{0{,}1s} = -10 - \dfrac{10}{s}\).

   **¿Por qué?** Al separar se ve un término constante (P) más uno con \(1/s\) (I).

**Resultado:** PI con \(K_p = 10\) y \(K_i = 10\)

#### Ejemplo 7 · Paralelo a la entrada · *Intermedio*

> **Qué cambia respecto al anterior:** Ahora es \(Z_i\) la que tiene dos componentes.

**Enunciado.** \(Z_i = R_1\parallel C_1\), \(Z_f = C_2\).

1. \(Z_i = \dfrac{R_1}{1+sR_1C_1}\) (paralelo), \(Z_f = \dfrac{1}{sC_2}\).

   **¿Por qué?** Ejemplo 1.

2. \(G = -\dfrac{1}{sC_2}\cdot\dfrac{1+sR_1C_1}{R_1} = -\dfrac{1+sR_1C_1}{sR_1C_2}\).

   **¿Por qué?** Dividir por \(Z_i\) es multiplicar por su inversa.

**Resultado:** \(-\left[\dfrac{C_1}{C_2} + \dfrac{1}{sR_1C_2}\right]\): un PI. Es la etapa 1 del Parcial 1

#### Ejemplo 8 · Dos etapas en cascada · *Nivel parcial*

> **Qué cambia respecto al anterior:** Hay dos op-amps: se multiplican.

**Enunciado.** Etapa 1: \(Z_i = 10\) kΩ, \(Z_f = 20\) kΩ \(\parallel\) 50 µF. Etapa 2: inversor con \(R_3 = R_4\).

1. \(Z_f = \dfrac{R_2}{1+sR_2C}\); \(R_2C = 2\cdot10^4\cdot5\cdot10^{-5} = 1\): \(Z_f = \dfrac{20\,000}{s+1}\).

   **¿Por qué?** Paralelo R‖C.

2. \(G_1 = -\dfrac{20\,000}{10\,000(s+1)} = -\dfrac{2}{s+1}\).

   **¿Por qué?** Inversor.

3. \(G_2 = -1\). \(G = G_1G_2 = \dfrac{2}{s+1}\).

   **¿Por qué?** Las etapas se multiplican y los dos signos menos se cancelan.

**Resultado:** \(\dfrac{2}{s+1}\): primer orden sin inversión

#### Errores comunes

- Trabajar con derivadas en el tiempo en vez de impedancias: es más largo y fácil de equivocar.
- Sumar impedancias en paralelo como si estuvieran en serie.
- Olvidar el signo menos de cada etapa inversora.
- Dejar fracciones dentro de fracciones sin simplificar.

#### Práctica

- **1.**RL: \(V_i\), \(L\) en serie, salida en \(R\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{R}{sL+R} = \dfrac{R/L}{s+R/L}\).
  
  </details>

- **2.**Op-amp con \(Z_i = C\) y \(Z_f = R\), \(R = 1\) MΩ, \(C = 1\) µF.
  
  <details><summary>Respuesta</summary>
  
  \(-RCs = -s\): derivador.
  
  </details>

- **3.**Op-amp con \(Z_i = R_1\parallel C\) y \(Z_f = R_2\).
  
  <details><summary>Respuesta</summary>
  
  \(-\dfrac{R_2(1+sR_1C)}{R_1}\): un PD.
  
  </details>

- **4.**RLC serie con \(L = 0{,}5\) H, \(R = 3\) Ω, \(C = 0{,}1\) F, salida en \(C\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{1}{0{,}05s^2+0{,}3s+1} = \dfrac{20}{s^2+6s+20}\).
  
  </details>
