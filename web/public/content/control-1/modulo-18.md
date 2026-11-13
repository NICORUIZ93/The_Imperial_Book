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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · ¿Qué mira la acción Proporcional (P)? · *Básico*

**Enunciado.** Explica con una frase qué información usa la acción proporcional (p).

1. Mira el error de ahora.

   **¿Por qué?** Un error grande produce una acción grande; si el error es cero, la acción es cero.

**Resultado.** Por eso proporcional se escribe \(K_pe(t)\).

#### Ejemplo 2 · ¿Qué mira la acción Integral (I)? · *Básico*

**Enunciado.** Explica con una frase qué información usa la acción integral (i).

1. Mira la suma de todos los errores pasados.

   **¿Por qué?** Mientras quede error, la integral sigue creciendo y empuja hasta eliminarlo.

**Resultado.** Por eso integral se escribe \(K_i\int_0^t e\,d\tau\).

#### Ejemplo 3 · ¿Qué mira la acción Derivativa (D)? · *Básico*

**Enunciado.** Explica con una frase qué información usa la acción derivativa (d).

1. Mira qué tan rápido cambia el error.

   **¿Por qué?** Frena antes de llegar si el error está cayendo rápido: anticipa y amortigua.

**Resultado.** Por eso derivativa se escribe \(K_d\,de/dt\).

#### Ejemplo 4 · La ducha como PID · *Básico*

**Enunciado.** Ajustas el agua de la ducha. ¿Qué haces como P, como I y como D?

1. P: si está muy fría, giras mucho la llave; si está casi bien, poco.

   **¿Por qué?** Acción proporcional al error de temperatura.

2. I: si después de un rato sigue un poco fría, sigues girando de a poquito hasta que queda bien.

   **¿Por qué?** Acumulas el error que persiste.

3. D: si notas que se está calentando muy rápido, dejas de girar antes de llegar.

   **¿Por qué?** Reaccionas a la velocidad de cambio para no pasarte.

**Resultado.** Las tres acciones juntas son un PID humano.

#### Ejemplo 5 · Leer un PID escrito en s · *Intermedio*

**Enunciado.** Interpreta \(C(s) = 4 + \dfrac{2}{s} + 0{,}5s\).

1. \(K_p = 4\), \(K_i = 2\), \(K_d = 0{,}5\).

   **¿Por qué?** Cada término de \(C(s)\) es una acción: constante, \(1/s\) (integra) y \(s\) (deriva).

**Resultado.** Forma estándar: \(C(s) = K_p\left(1 + \dfrac{1}{T_is} + T_ds\right)\) con \(T_i = K_p/K_i = 2\) s y \(T_d = K_d/K_p = 0{,}125\) s.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 5.

```python
# verificacion.py
Kp, Ki, Kd = 4, 2, 0.5
Ti = Kp / Ki
Td = Kd / Kp
print("Ti:", Ti)
print("Td:", Td)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `Ti: 2.0` y `Td: 0.125`, igual al Ejemplo 5.

#### Practica

cambia `Kp, Ki, Kd` a `2, 0.5, 1` y calcula \(T_i\) y \(T_d\) para ese controlador (práctica 3 de la sección final del módulo, con \(T_i=4\)). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** esta conversión entre \((K_p,K_i,K_d)\) y \((K_p,T_i,T_d)\) es solo notación; ninguna de las dos formas dice todavía si esas ganancias son buenas — eso depende de cómo responde el lazo cerrado (Tema 3).

### Tema 2: Error en estado estacionario

**¿Por qué es importante?** El error estacionario muestra con números por qué la acción integral es necesaria en la mayoría de procesos.

**Fuentes oficiales:** [Controladores PID, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlPID).

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Error ante escalón con P con Kp = 4 · *Básico*

**Enunciado.** Planta \(P = \frac{1}{s + 2}\), realimentación unitaria, \(C = 4\). Halla el error final ante un escalón.

1. \(e_{ss} = \lim_{s\to0} \dfrac{1}{1 + C(s)P(s)}\).

   **¿Por qué?** Valor final del error con realimentación unitaria.

**Resultado.** \(e_{ss} = \frac{1}{3}\) (33,3 %): con solo P siempre queda error; subir \(K_p\) lo reduce pero no lo anula.

#### Ejemplo 2 · Error ante escalón con P con Kp = 18 · *Básico*

**Enunciado.** Planta \(P = \frac{1}{s + 2}\), realimentación unitaria, \(C = 18\). Halla el error final ante un escalón.

1. \(e_{ss} = \lim_{s\to0} \dfrac{1}{1 + C(s)P(s)}\).

   **¿Por qué?** Valor final del error con realimentación unitaria.

**Resultado.** \(e_{ss} = \frac{1}{10}\) (10 %): con solo P siempre queda error; subir \(K_p\) lo reduce pero no lo anula.

#### Ejemplo 3 · Error ante escalón con PI · *Intermedio*

**Enunciado.** Planta \(P = \frac{1}{s + 2}\), realimentación unitaria, \(C = 4 + \frac{2}{s}\). Halla el error final ante un escalón.

1. \(e_{ss} = \lim_{s\to0} \dfrac{1}{1 + C(s)P(s)}\).

   **¿Por qué?** Valor final del error con realimentación unitaria.

**Resultado.** \(e_{ss} = 0\) = 0: la integral lo elimina.

#### Ejemplo 4 · Error ante escalón con P con Kp = 98 · *Básico*

**Enunciado.** Planta \(P = \frac{1}{s + 2}\), realimentación unitaria, \(C = 98\). Halla el error final ante un escalón.

1. \(e_{ss} = \lim_{s\to0} \dfrac{1}{1 + C(s)P(s)}\).

   **¿Por qué?** Valor final del error con realimentación unitaria.

**Resultado.** \(e_{ss} = \frac{1}{50}\) (2 %): con solo P siempre queda error; subir \(K_p\) lo reduce pero no lo anula.

#### Ejemplo 5 · Error ante escalón con PI con Ki = 5 · *Intermedio*

**Enunciado.** Planta \(P = \frac{1}{s + 2}\), realimentación unitaria, \(C = 1 + \frac{5}{s}\). Halla el error final ante un escalón.

1. \(e_{ss} = \lim_{s\to0} \dfrac{1}{1 + C(s)P(s)}\).

   **¿Por qué?** Valor final del error con realimentación unitaria.

**Resultado.** \(e_{ss} = 0\) = 0: la integral lo elimina.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1.

```python
# verificacion.py
from sympy import symbols, limit

s = symbols("s")
P = 1 / (s + 2)
C = 4
e_ss = limit(1 / (1 + C * P), s, 0)
print("e_ss:", e_ss)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `e_ss: 1/3`, igual al Ejemplo 1 (33,3 %).

#### Practica

cambia `C` a `4 + 2/s` (PI) y confirma `e_ss: 0` (Ejemplo 3): la integral lo elimina. Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** este cálculo solo da el error en **estado estacionario**; no dice nada sobre el sobrepico o el tiempo de establecimiento del transitorio, que hay que revisar aparte (Tema 3).

### Tema 3: Cada acción, con números

**¿Por qué es importante?** Ver el efecto de cada acción con un ejemplo numérico te da argumentos reales para el punto 4 del Parcial 1.

**Fuentes oficiales:** [Controladores PID, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlPID).

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 5 · Efecto de P (Kp = 8) sobre \(P = \frac{1}{s \left(s + 4\right)}\) · *Intermedio*

**Enunciado.** Halla \(\zeta\), \(\omega_n\) y el sobrepico del lazo cerrado.

1. Ecuación característica: \(s \left(s + 4\right) + 8 = 0\).

   **¿Por qué?** Denominador de \(CP/(1+CP)\).

2. \(\omega_n \approx 2{,}828,\ \zeta \approx 0{,}707\).

   **¿Por qué?** Comparando con la forma estándar.

**Resultado.** \(M_p \approx 4{,}3\,\%\). Subir \(K_p\) acelera pero aumenta el sobrepico.

#### Ejemplo 6 · Efecto de P (Kp = 20) sobre \(P = \frac{1}{s \left(s + 4\right)}\) · *Intermedio*

**Enunciado.** Halla \(\zeta\), \(\omega_n\) y el sobrepico del lazo cerrado.

1. Ecuación característica: \(s \left(s + 4\right) + 20 = 0\).

   **¿Por qué?** Denominador de \(CP/(1+CP)\).

2. \(\omega_n \approx 4{,}472,\ \zeta \approx 0{,}447\).

   **¿Por qué?** Comparando con la forma estándar.

**Resultado.** \(M_p \approx 20{,}8\,\%\). Subir \(K_p\) acelera pero aumenta el sobrepico.

#### Ejemplo 7 · Efecto de PD (Kp = 20, Kd = 4) sobre \(P = \frac{1}{s \left(s + 4\right)}\) · *Intermedio*

**Enunciado.** Halla \(\zeta\), \(\omega_n\) y el sobrepico del lazo cerrado.

1. Ecuación característica: \(s^{2} + 8 s + 20 = 0\).

   **¿Por qué?** Denominador de \(CP/(1+CP)\).

2. \(\omega_n \approx 4{,}472,\ \zeta \approx 0{,}894\).

   **¿Por qué?** Comparando con la forma estándar.

**Resultado.** \(M_p \approx 0{,}2\,\%\). La derivada aumenta el amortiguamiento y quita casi todo el sobrepico sin perder velocidad.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 de este tema (control P).

```python
# verificacion.py
from sympy import Rational

Kp = 9
e_ss = Rational(1, 1 + Kp)
print("e_ss:", e_ss)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `e_ss: 1/10`, igual al Ejemplo 1.

#### Practica

cambia `Kp` a `99` y confirma `e_ss: 1/100` (el mismo ejemplo con ganancia mayor: el error baja pero nunca llega a cero). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** la fórmula \(1/(1+K_p)\) solo aplica a sistemas tipo 0 (sin integrador en la planta); con un integrador en la planta misma, el error ante escalón ya es cero incluso con solo P (como en el Ejemplo 4 de este tema, donde la planta es \(1/s^2\)).

### Tema 4: Ventajas y desventajas (punto 4 del Parcial 1)

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

#### Ejemplo 1 · Error ante rampa · *Intermedio*

**Enunciado.** \(CG = \dfrac{4}{s(s+2)}\). Error ante escalón y ante rampa.

1. Tipo 1: error ante escalón 0.

   **¿Por qué?** Hay un integrador.

2. \(K_v = \lim s\cdot\dfrac{4}{s(s+2)} = 2\). Error \(1/2\).

   **¿Por qué?** Capítulo 15.

**Resultado:** Escalón 0; rampa 0,5

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Elegir controlador: Horno industrial lento, sin ruido en el senso… · *Intermedio*

**Enunciado.** Horno industrial lento, sin ruido en el sensor; se exige error cero. ¿Qué controlador eliges?

1. Elección: **PI**.

   **¿Por qué?** La integral elimina el error; el proceso es lento y no necesita la anticipación de D.

**Resultado.** PI, justificado por la ventaja que aporta y la desventaja que se evita.

#### Ejemplo 3 · Elegir controlador: Posición de un motor que oscila demasiado con… · *Intermedio*

**Enunciado.** Posición de un motor que oscila demasiado con solo P. ¿Qué controlador eliges?

1. Elección: **PD**.

   **¿Por qué?** La derivada agrega amortiguamiento; un motor ya tiene un integrador natural (posición), así que el error al escalón ya es cero.

**Resultado.** PD, justificado por la ventaja que aporta y la desventaja que se evita.

#### Ejemplo 4 · Elegir controlador: Medición de flujo muy ruidosa.… · *Intermedio*

**Enunciado.** Medición de flujo muy ruidosa. ¿Qué controlador eliges?

1. Elección: **PI (sin D)**.

   **¿Por qué?** La derivada amplifica el ruido de alta frecuencia; se evita o se filtra.

**Resultado.** PI (sin D), justificado por la ventaja que aporta y la desventaja que se evita.

#### Ejemplo 5 · Elegir controlador: Brazo que debe llegar rápido, sin sobrepico y… · *Intermedio*

**Enunciado.** Brazo que debe llegar rápido, sin sobrepico y sin error. ¿Qué controlador eliges?

1. Elección: **PID**.

   **¿Por qué?** Se necesita la rapidez de P, la exactitud de I y el amortiguamiento de D.

**Resultado.** PID, justificado por la ventaja que aporta y la desventaja que se evita.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 de este tema.

```python
# verificacion.py
from sympy import symbols, limit

s = symbols("s")
CG = 4 / (s * (s + 2))
Kv = limit(s * CG, s, 0)
print("Kv:", Kv)
print("error_rampa:", 1 / Kv)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `Kv: 2` y `error_rampa: 1/2`, igual al Ejemplo 1 (escalón 0, rampa 0,5).

#### Practica

cambia `CG` por la del PD del Ejemplo 7 de Tema 3 (\(CG=\dfrac{4s+20}{s(s+4)}\), usando \(K_d=4\)) y calcula de nuevo \(K_v\). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** esta tabla de ventajas/desventajas es una guía general; la elección real de controlador (Ejemplos 2-5) siempre depende del caso concreto — ruido del sensor, velocidad del proceso y tolerancia al sobrepico — no de aplicar la tabla mecánicamente.

**Conexión con el proyecto integrador:** la bitácora de `examples/control-1-tanque/` pide justamente esta decisión con datos, no solo con la tabla. Con los dos CSV que genera `simular.py` (P y PI), argumenta por escrito por qué el PI es la elección correcta para un tanque que no puede quedarse con error permanente, y qué desventaja del PI (windup, si el caudal se satura en 1,5 m³/s) habría que vigilar en la planta real.

### Tema 5: Sintonía de Ziegler-Nichols

**¿Por qué es importante?** Ziegler-Nichols es el método práctico para sintonizar un PID cuando no hay un modelo exacto.

**Fuentes oficiales:** [Controladores PID, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlPID).

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

#### Ejemplo 1 · PID por ganancia crítica · *Nivel parcial*

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

#### Ejemplo 2 · PID por curva de reacción · *Intermedio*

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 3 · Ziegler-Nichols por oscilación: Ku = 10, Pu = 2 s · *Básico*

**Enunciado.** Calcula las ganancias P, PI y PID.

1. Tabla: P → \(K_p = 0{,}5K_u\); PI → \(0{,}45K_u\), \(T_i = P_u/1{,}2\); PID → \(0{,}6K_u\), \(T_i = P_u/2\), \(T_d = P_u/8\).

   **¿Por qué?** Son las reglas empíricas de Ziegler-Nichols para el método de la ganancia crítica.

**Resultado.** P: \(K_p = 5\). PI: \(K_p = 4{,}5,\ T_i = 1{,}667\) s. PID: \(K_p = 6,\ T_i = 1,\ T_d = 0{,}25\) s, es decir \(K_i = 6,\ K_d = 1{,}5\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar las tres filas de la tabla con \(K_u=10\), \(P_u=2\).

```python
# verificacion.py
Ku, Pu = 10, 2
Kp_P = 0.5 * Ku
Kp_PI, Ti_PI = 0.45 * Ku, Pu / 1.2
Kp_PID, Ti_PID, Td_PID = 0.6 * Ku, Pu / 2, Pu / 8
print("P:", Kp_P)
print("PI:", Kp_PI, Ti_PI)
print("PID:", Kp_PID, Ti_PID, Td_PID)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `P: 5.0`, `PI: 4.5 1.6666666666666667` y `PID: 6.0 1.0 0.25`, igual al Ejemplo 3.

#### Practica

cambia `Ku, Pu` a `4.8, 1.2` y confirma los valores del Ejemplo 4 (\(K_p=2{,}4\) para P). Confírmalo modificando `verificacion.py` y ejecutándolo de nuevo.

**Límite:** Ziegler-Nichols da un punto de partida, no el ajuste final; en la práctica casi siempre hay que afinar a mano después (reducir sobrepico, verificar saturación del actuador), sobre todo si la planta tiene mucho retardo.

#### Ejemplo 4 · Ziegler-Nichols por oscilación: Ku = 4,8, Pu = 1,2 s · *Intermedio*

**Enunciado.** Calcula las ganancias P, PI y PID.

1. Tabla: P → \(K_p = 0{,}5K_u\); PI → \(0{,}45K_u\), \(T_i = P_u/1{,}2\); PID → \(0{,}6K_u\), \(T_i = P_u/2\), \(T_d = P_u/8\).

   **¿Por qué?** Son las reglas empíricas de Ziegler-Nichols para el método de la ganancia crítica.

**Resultado.** P: \(K_p = 2{,}4\). PI: \(K_p = 2{,}16,\ T_i = 1\) s. PID: \(K_p = 2{,}88,\ T_i = 0{,}6,\ T_d = 0{,}15\) s, es decir \(K_i = 4{,}8,\ K_d = 0{,}432\).

#### Ejemplo 5 · Ziegler-Nichols por oscilación: Ku = 25, Pu = 0,5 s · *Intermedio*

**Enunciado.** Calcula las ganancias P, PI y PID.

1. Tabla: P → \(K_p = 0{,}5K_u\); PI → \(0{,}45K_u\), \(T_i = P_u/1{,}2\); PID → \(0{,}6K_u\), \(T_i = P_u/2\), \(T_d = P_u/8\).

   **¿Por qué?** Son las reglas empíricas de Ziegler-Nichols para el método de la ganancia crítica.

**Resultado.** P: \(K_p = 12{,}5\). PI: \(K_p = 11{,}25,\ T_i = 0{,}417\) s. PID: \(K_p = 15,\ T_i = 0{,}25,\ T_d = 0{,}062\) s, es decir \(K_i = 60,\ K_d = 0{,}938\).

#### Ejemplo 6 · Obtener Ku y Pu con Routh · *Avanzado*

**Enunciado.** Planta \(\dfrac{1}{(s+1)^3}\) con control P. Halla \(K_u\), \(P_u\) y el PID de Ziegler-Nichols.

1. \((s+1)^3 + K = s^3 + 3s^2 + 3s + 1 + K\). Fila \(s^1\): \(9 - (1+K) = 0 \Rightarrow K_u = 8\).

   **¿Por qué?** La ganancia crítica es la que pone el lazo justo al borde de la estabilidad.

2. Polinomio auxiliar \(3s^2 + 9 = 0 \Rightarrow \omega = \sqrt3\); \(P_u = 2\pi/\sqrt3 \approx 3{,}63\) s.

   **¿Por qué?** El periodo de la oscilación sostenida.

**Resultado.** PID: \(K_p = 4{,}8\), \(T_i \approx 1{,}81\) s, \(T_d \approx 0{,}45\) s.

#### Práctica para resolver sola o solo

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

