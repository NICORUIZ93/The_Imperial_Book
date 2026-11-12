# Módulo 18: Acciones básicas de control: P, I, D

El controlador decide cuánta acción aplicar según el error. Aquí verás qué hace cada acción con números y no solo con palabras, para que puedas explicar ventajas y desventajas con argumentos.

**Al terminar podrás:**

- Escribir la ley de control y \(C(s)\) de ON/OFF, P, I, D, PI, PD y PID.
- Calcular el error en estado estacionario y ver por qué la acción integral lo elimina.
- Mostrar con un ejemplo numérico el efecto de cada ganancia.
- Responder el punto 4 del Parcial 1 con argumentos técnicos.

## Aprende construyendo

### Tema 1: La idea

**¿Por qué es importante?** Entender qué mira cada acción (presente, pasado, tendencia) explica para qué sirve cada término del PID.

**Fuentes oficiales:** [Controladores PID, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlPID).

> **Idea clave.** El controlador mira el error de tres maneras: cuánto hay ahora (P), cuánto se ha acumulado (I) y hacia dónde va (D).

\[u(t) = K_p\,e(t) + K_i\int_0^t e(\tau)\,d\tau + K_d\frac{de(t)}{dt}\]

    

\[C(s) = K_p + \frac{K_i}{s} + K_d s = K_p\left(1 + \frac{1}{T_i s} + T_d s\right)\]

*\(T_i = K_p/K_i\) es el tiempo integral y \(T_d = K_d/K_p\) el tiempo derivativo.*

#### Error en estado estacionario

Con realimentación unitaria, el error final ante un escalón unitario depende de cuántos integradores (polos en \(s=0\)) tiene \(C(s)G(s)\). A ese número se le llama **tipo** del sistema.

| Tipo | Error ante escalón | Error ante rampa |
|---|---|---|
| 0 (sin integrador) | \(\dfrac{1}{1+K_{pos}}\), con \(K_{pos} = \lim_{s\to0}CG\) | \(\infty\) |
| 1 (un integrador) | \(0\) | \(\dfrac{1}{K_v}\), con \(K_v = \lim_{s\to0}s\,CG\) |
| 2 | \(0\) | \(0\) |

> **Por eso la acción integral elimina el error:** el \(1/s\) del controlador sube el tipo en uno.

#### Demostración · el integrador elimina el error ante escalón

1. El error en lazo cerrado unitario es \(E = R - Y = R - \dfrac{CG}{1+CG}R = \dfrac{R}{1+CG}\).
2. Con escalón \(R = 1/s\) y valor final: \(e_{ss} = \lim_{s\to0} s\cdot\dfrac{1}{s}\cdot\dfrac{1}{1+CG} = \dfrac{1}{1+\lim_{s\to0}CG}\).
3. Sin integrador, \(\lim CG = K_{pos}\) es finito y \(e_{ss} = \dfrac{1}{1+K_{pos}} \ne 0\).
4. Con integrador, \(CG = \dfrac{\ldots}{s(\ldots)}\) y \(\lim_{s\to0}CG = \infty\), así que \(e_{ss} = 0\).

∎

#### Demostración · por qué la D amplifica el ruido

Un ruido senoidal \(n(t) = a\sin\omega t\) tiene derivada \(a\omega\cos\omega t\): su amplitud queda multiplicada por \(\omega\). El ruido de los sensores es de alta frecuencia (\(\omega\) grande), así que la acción D lo amplifica mucho. En la práctica se usa \(K_d\dfrac{s}{1+s/N}\) (derivada filtrada) para limitar la ganancia a altas frecuencias.

∎

#### Cada acción, con números

#### ON/OFF (dos posiciones)

El actuador solo está prendido o apagado. Se usa con histéresis para que no conmute a cada instante. Ejemplos: nevera, plancha, termostato básico.

#### Proporcional: C(s) = Kp

#### Ejemplo 1 · El P deja error · *Básico*

**Enunciado.** Planta \(G = \dfrac{1}{s+1}\), control P con \(K_p = 9\), realimentación unitaria.

1. Lazo cerrado: \(\dfrac{9}{s+1+9} = \dfrac{9}{s+10}\).

   **¿Por qué?** \(\dfrac{N}{D+N}\) (capítulo 6).

2. Valor final: \(9/10 = 0{,}9\).

   **¿Por qué?** \(G(0)\) del lazo cerrado.

3. Error: \(1 - 0{,}9 = 0{,}1\). Con la fórmula: \(\dfrac{1}{1+K_p} = \dfrac{1}{10}\).

   **¿Por qué?** Sistema tipo 0 (capítulo 15).

4. Con \(K_p = 99\): error \(1/100\).

   **¿Por qué?** Baja, pero solo llega a cero con \(K_p\) infinito.

**Resultado:** El P reduce el error, pero no lo elimina

#### Ejemplo 2 · El precio de subir Kp · *Intermedio*

> **Qué cambia respecto al anterior:** La planta es de segundo orden: ahora también aparece sobrepico.

**Enunciado.** Planta \(\dfrac{1}{(s+1)(s+2)}\) con P. Compara \(K_p = 10\) y \(K_p = 40\).

1. Lazo cerrado: \(\dfrac{K_p}{s^2+3s+2+K_p}\). Error: \(\dfrac{1}{1+K_p/2} = \dfrac{2}{2+K_p}\).

   **¿Por qué?** \(G(0) = 1/2\), así que \(K_{pos} = K_p/2\).

2. \(K_p = 10\): \(s^2+3s+12\), \(\zeta = \dfrac{3}{2\sqrt{12}} = 0{,}433\), \(M_p = 22{,}1\,\%\), error 16,7 %.

   **¿Por qué?** Capítulo 13.

3. \(K_p = 40\): \(s^2+3s+42\), \(\zeta = 0{,}231\), \(M_p = 47{,}4\,\%\), error 4,8 %.

   **¿Por qué?** Subir \(K_p\) sube \(\omega_n\) pero no el término en \(s\), así que \(\zeta\) baja.

**Resultado:** Menos error a cambio de más sobrepico

![Efecto de subir Kp](content/figures/control-1/efecto-kp.svg)

*Ejemplo 2: \(K_p = 10\) (azul) y \(K_p = 40\) (naranja). Ninguna llega a 1 (línea punteada).*

#### Integral: C(s) = Ki/s

#### Ejemplo 3 · El PI quita el error · *Intermedio*

> **Qué cambia respecto al anterior:** Se agrega la acción integral.

**Enunciado.** Planta \(\dfrac{1}{s+1}\) con PI: \(K_p = 3\), \(K_i = 8\).

1. \(C = 3 + \dfrac8s = \dfrac{3s+8}{s}\). \(CG = \dfrac{3s+8}{s(s+1)}\).

   **¿Por qué?** Se pasa \(C\) a una sola fracción.

2. Tiene un integrador: tipo 1, error ante escalón 0.

   **¿Por qué?** Capítulo 15.

3. Lazo cerrado: \(\dfrac{3s+8}{s(s+1)+3s+8} = \dfrac{3s+8}{s^2+4s+8}\). Valor final \(8/8 = 1\).

   **¿Por qué?** Se confirma: llega exacto a 1.

**Resultado:** Error cero; el sistema pasó a segundo orden (\(\zeta = 0{,}707\))

#### Derivativa: C(s) = Kd s

#### Ejemplo 4 · El D amortigua · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se agrega la acción derivativa.

**Enunciado.** Planta \(\dfrac{1}{s^2}\). Compara P (\(K_p = 4\)) con PD (\(K_p = 4\), \(K_d = 2{,}8\)).

1. P: \(\dfrac{4}{s^2+4}\). Polos \(\pm2j\): no hay término en \(s\), así que \(\zeta = 0\) y oscila para siempre.

   **¿Por qué?** La planta no tiene fricción y el P tampoco la agrega.

2. PD: \(CG = \dfrac{2{,}8s+4}{s^2}\). Lazo cerrado: \(\dfrac{2{,}8s+4}{s^2+2{,}8s+4}\).

   **¿Por qué?** La D aporta el término \(2{,}8s\).

3. \(\omega_n = 2\), \(\zeta = \dfrac{2{,}8}{2\cdot2} = 0{,}7\).

   **¿Por qué?** Ese término en \(s\) es justamente el amortiguamiento.

**Resultado:** La D convierte una oscilación eterna en una respuesta amortiguada

### Tema 2: Ventajas y desventajas (punto 4 del Parcial 1)

**¿Por qué es importante?** Las ventajas y desventajas son la pregunta teórica más repetida de los parciales.

**Fuentes oficiales:** [Controladores PID, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlPID).

| Acción | Ventajas | Desventajas |
|---|---|---|
| **ON/OFF** | Muy barato, simple, robusto | Oscilación permanente alrededor de la referencia; desgasta el actuador; necesita histéresis |
| **P** | Simple, un solo parámetro; respuesta inmediata; subir \(K_p\) acelera y reduce el error | Deja error estacionario en plantas tipo 0; \(K_p\) alto aumenta sobrepico y puede desestabilizar |
| **I** | Elimina el error ante escalón; rechaza perturbaciones constantes | Más lento y oscilatorio; resta estabilidad (90° de atraso de fase); windup si el actuador se satura |
| **D** | Anticipa: reduce sobrepico y oscilación; mejora estabilidad | Amplifica el ruido del sensor; nunca se usa sola; no quita el error; pico grande ante escalones en la referencia |
| **PI** | Error cero con buena velocidad; el más usado en procesos (nivel, flujo, temperatura) | Sobrepico y windup |
| **PD** | Rápido y amortiguado; ideal en posición y servomotores | Sensible al ruido; no elimina el error estacionario |
| **PID** | Exacto, rápido y amortiguado | Tres parámetros para sintonizar; ruido y windup |

#### Efecto de subir cada ganancia

| Subir | Tiempo de subida | Sobrepico | Establecimiento | Error estacionario | Estabilidad |
|---|---|---|---|---|---|
| \(K_p\) | Baja | Sube | Poco cambio | Baja, no a cero | Empeora |
| \(K_i\) | Baja | Sube | Sube | Se elimina | Empeora |
| \(K_d\) | Poco cambio | Baja | Baja | No cambia | Mejora si \(K_d\) es pequeño |

#### Ejemplo 5 · Error ante rampa · *Intermedio*

**Enunciado.** \(CG = \dfrac{4}{s(s+2)}\). Error ante escalón y ante rampa.

1. Tipo 1: error ante escalón 0.

   **¿Por qué?** Hay un integrador.

2. \(K_v = \lim s\cdot\dfrac{4}{s(s+2)} = 2\). Error \(1/2\).

   **¿Por qué?** Capítulo 15.

**Resultado:** Escalón 0; rampa 0,5

#### Sintonía de Ziegler-Nichols

> **Idea clave.** Cuando no tienes un modelo exacto, Ziegler-Nichols da valores iniciales de \(K_p\), \(T_i\) y \(T_d\) a partir de un experimento. Después se ajustan a mano.

#### Método 1: ganancia crítica (lazo cerrado)

**Procedimiento**

1. Deja solo la acción P y sube \(K_p\) hasta que la salida oscile de forma sostenida. Esa es la ganancia crítica \(K_{cr}\).
2. Mide el período de la oscilación, \(P_{cr}\). (Con modelo: Routh da los dos, capítulo 16.)
3. Usa la tabla.

| Controlador | \(K_p\) | \(T_i\) | \(T_d\) |
|---|---|---|---|
| P | \(0{,}5K_{cr}\) | — | — |
| PI | \(0{,}45K_{cr}\) | \(P_{cr}/1{,}2\) | — |
| PID | \(0{,}6K_{cr}\) | \(0{,}5P_{cr}\) | \(0{,}125P_{cr}\) |

#### Ejemplo 6 · PID por ganancia crítica · *Nivel parcial*

**Enunciado.** Planta \(\dfrac{1}{s(s+1)(s+5)}\).

1. Con solo P: \(s^3+6s^2+5s+K_p = 0\). Routh: \(s^1 = \dfrac{30 - K_p}{6}\). Oscila en \(K_{cr} = 30\).

   **¿Por qué?** Ziegler-Nichols necesita la ganancia del límite de estabilidad.

2. Auxiliar: \(6s^2 + 30 = 0 \Rightarrow \omega = \sqrt5 = 2{,}236\). \(P_{cr} = 2\pi/2{,}236 = 2{,}81\) s.

   **¿Por qué?** El período es \(2\pi/\omega\).

3. Tabla PID: \(K_p = 0{,}6\cdot30 = 18\); \(T_i = 0{,}5\cdot2{,}81 = 1{,}405\); \(T_d = 0{,}125\cdot2{,}81 = 0{,}351\).

   **¿Por qué?** Fórmulas empíricas del método.

**Resultado:** \(C = 18\left(1 + \dfrac{1}{1{,}405s} + 0{,}351s\right)\)

#### Método 2: curva de reacción (lazo abierto)

Se aplica un escalón a la planta sin controlador y se ajusta la curva a \(\dfrac{Ke^{-Ls}}{Ts+1}\) (capítulo 12, identificación): \(L\) es el retardo y \(T\) la constante de tiempo.

| Controlador | \(K_p\) | \(T_i\) | \(T_d\) |
|---|---|---|---|
| P | \(\dfrac{T}{KL}\) | — | — |
| PI | \(0{,}9\dfrac{T}{KL}\) | \(L/0{,}3\) | — |
| PID | \(1{,}2\dfrac{T}{KL}\) | \(2L\) | \(0{,}5L\) |

#### Ejemplo 7 · PID por curva de reacción · *Intermedio*

> **Qué cambia respecto al anterior:** Se usa un experimento en lazo abierto en vez de Routh.

**Enunciado.** Planta identificada con \(K = 2\), \(L = 1\) s, \(T = 5\) s.

1. \(K_p = 1{,}2\dfrac{T}{KL} = 1{,}2\cdot\dfrac{5}{2\cdot1} = 3\).

   **¿Por qué?** Tabla del método 2.

2. \(T_i = 2L = 2\) s; \(T_d = 0{,}5L = 0{,}5\) s.

   **¿Por qué?** Igual.

**Resultado:** \(C = 3\left(1 + \dfrac{1}{2s} + 0{,}5s\right)\)

#### Detalles de implementación real

- **Derivada filtrada:** \(K_d\dfrac{s}{1+s/N}\) con \(N\) entre 5 y 20, para limitar el ruido.
- **Derivada sobre la medición:** derivar \(-y\) en vez de \(e\) evita el pico cuando cambia la referencia.
- **Anti-windup:** detener la integral cuando el actuador está saturado, para que no acumule error que luego produce sobrepicos enormes.

#### Errores comunes

- Decir que el P elimina el error: solo lo reduce.
- Proponer un controlador solo D.
- Listar ventajas sin explicar el porqué (por ejemplo: “elimina el error porque agrega un integrador”).

#### Práctica

- **1.**Planta \(\dfrac{2}{s+4}\) con P de \(K_p = 6\). Error ante escalón.
  
  <details><summary>Respuesta</summary>
  
  \(K_{pos} = 6\cdot\tfrac24 = 3\): error \(1/4 = 25\,\%\).
  
  </details>

- **2.**¿Qué acción usarías si el sensor es muy ruidoso y necesitas error cero?
  
  <details><summary>Respuesta</summary>
  
  PI: el I quita el error y se evita la D, que amplifica el ruido.
  
  </details>

- **3.**Escribe \(C(s)\) de un PID con \(K_p = 2\), \(T_i = 4\), \(T_d = 0{,}5\).
  
  <details><summary>Respuesta</summary>
  
  \(2\left(1 + \dfrac{1}{4s} + 0{,}5s\right) = 2 + \dfrac{0{,}5}{s} + s\).
  
  </details>
