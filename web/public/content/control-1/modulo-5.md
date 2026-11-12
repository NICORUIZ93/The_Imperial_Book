# Módulo 5: Sistemas de control y diagramas de bloques

Qué es un sistema de control, cuáles son sus partes y cómo combinar bloques para llegar a una sola función de transferencia.

**Al terminar podrás:**

- Explicar lazo abierto y lazo cerrado con ejemplos.
- Enumerar y definir los elementos de cualquier sistema (punto 1 del Parcial 1).
- Reducir diagramas: serie, paralelo y realimentación.

## Aprende construyendo

### Tema 1: ¿Qué es un sistema de control?

**¿Por qué es importante?** Saber distinguir lazo abierto de lazo cerrado es la base para entender por qué se controla con realimentación.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

> **Idea clave.** Un conjunto de elementos que hace que una variable llegue a un valor deseado y se quede ahí, aunque haya perturbaciones.

- Lazo abiertoLa acción no depende de la salida: no mide el resultado.**Ejemplos:** tostadora con temporizador, lavadora por tiempo, semáforo por tiempo.**Ventaja:** simple y barato. **Desventaja:** no corrige perturbaciones.
- Lazo cerradoMide la salida, la compara con la referencia y corrige según el error.**Ejemplos:** termostato, control crucero, nivel de un tanque.**Ventaja:** preciso y rechaza perturbaciones. **Desventaja:** más caro y puede volverse inestable.

![Diagrama de bloques de lazo cerrado](content/figures/control-1/lazo-cerrado.svg)

*Estructura general de un lazo cerrado. Todos los sistemas del punto 1 se pueden dibujar así.*

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · ¿Lazo abierto o cerrado? Tostadora con temporizador · *Básico*

**Enunciado.** Clasifica el sistema «tostadora con temporizador» y justifica.

1. Pregunta clave: ¿la salida real se mide y se compara con lo deseado?

   **¿Por qué?** Esa comparación (realimentación) es lo único que distingue un lazo cerrado de uno abierto.

2. El tiempo se fija de antemano y nadie mide si el pan ya está dorado: la salida no vuelve al controlador.

   **¿Por qué?** Se revisa si existe sensor y si su medición cambia la acción.

**Resultado.** Es un sistema de **lazo abierto**.

#### Ejemplo 2 · ¿Lazo abierto o cerrado? Termostato de una nevera · *Básico*

**Enunciado.** Clasifica el sistema «termostato de una nevera» y justifica.

1. Pregunta clave: ¿la salida real se mide y se compara con lo deseado?

   **¿Por qué?** Esa comparación (realimentación) es lo único que distingue un lazo cerrado de uno abierto.

2. Un sensor mide la temperatura interior y el compresor se enciende o apaga según el error frente a la consigna.

   **¿Por qué?** Se revisa si existe sensor y si su medición cambia la acción.

**Resultado.** Es un sistema de **lazo cerrado**.

#### Ejemplo 3 · ¿Lazo abierto o cerrado? Control de crucero de un carro · *Básico*

**Enunciado.** Clasifica el sistema «control de crucero de un carro» y justifica.

1. Pregunta clave: ¿la salida real se mide y se compara con lo deseado?

   **¿Por qué?** Esa comparación (realimentación) es lo único que distingue un lazo cerrado de uno abierto.

2. Mide la velocidad real y ajusta el acelerador; si hay una subida, el error crece y el controlador compensa.

   **¿Por qué?** Se revisa si existe sensor y si su medición cambia la acción.

**Resultado.** Es un sistema de **lazo cerrado**.

#### Ejemplo 4 · ¿Lazo abierto o cerrado? Semáforo de tiempo fijo · *Básico*

**Enunciado.** Clasifica el sistema «semáforo de tiempo fijo» y justifica.

1. Pregunta clave: ¿la salida real se mide y se compara con lo deseado?

   **¿Por qué?** Esa comparación (realimentación) es lo único que distingue un lazo cerrado de uno abierto.

2. Cambia de luz por horario; no mide cuántos carros hay esperando.

   **¿Por qué?** Se revisa si existe sensor y si su medición cambia la acción.

**Resultado.** Es un sistema de **lazo abierto**.

#### Ejemplo 5 · ¿Lazo abierto o cerrado? Riego por goteo con sensor de humedad · *Básico*

**Enunciado.** Clasifica el sistema «riego por goteo con sensor de humedad» y justifica.

1. Pregunta clave: ¿la salida real se mide y se compara con lo deseado?

   **¿Por qué?** Esa comparación (realimentación) es lo único que distingue un lazo cerrado de uno abierto.

2. La válvula abre solo cuando el sensor indica que la humedad bajó del valor deseado.

   **¿Por qué?** Se revisa si existe sensor y si su medición cambia la acción.

**Resultado.** Es un sistema de **lazo cerrado**.

#### Ejemplo 6 · ¿Lazo abierto o cerrado? Lavadora que llena el tambor por tiempo · *Básico*

**Enunciado.** Clasifica el sistema «lavadora que llena el tambor por tiempo» y justifica.

1. Pregunta clave: ¿la salida real se mide y se compara con lo deseado?

   **¿Por qué?** Esa comparación (realimentación) es lo único que distingue un lazo cerrado de uno abierto.

2. Abre la válvula un número fijo de segundos; si la presión del agua baja, se llena menos y no lo corrige.

   **¿Por qué?** Se revisa si existe sensor y si su medición cambia la acción.

**Resultado.** Es un sistema de **lazo abierto**.

### Tema 2: Los elementos

**¿Por qué es importante?** Nombrar y definir cada elemento es exactamente lo que pedía el punto 1 del Parcial 1.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

| Elemento | Definición técnica |
|---|---|
| **Referencia** \(r(t)\) | Valor deseado de la variable controlada (set point). |
| **Comparador** | Resta la medición de la referencia y produce el error. |
| **Error** \(e(t)\) | \(e = r - b\). Si es cero, la salida es la deseada. |
| **Controlador** | Calcula la acción de control a partir del error (ON/OFF, P, PI, PID). |
| **Señal de control** \(u(t)\) | La orden que sale del controlador. |
| **Actuador** | Convierte la señal de control en una acción física con energía (motor, válvula, resistencia). |
| **Planta o proceso** | El sistema físico cuya variable se quiere controlar. |
| **Variable controlada** \(y(t)\) | La salida que se mide y se controla. |
| **Sensor / transductor** | Mide la salida y la convierte en una señal comparable con la referencia. |
| **Perturbación** \(d(t)\) | Entrada no deseada que saca la salida de su valor. |

#### Cinco sistemas listos para el punto 1

| Sistema | Variable y referencia | Controlador | Actuador | Sensor | Perturbación |
|---|---|---|---|---|---|
| Aire acondicionado | Temperatura, 22 °C | Termostato | Compresor | Termistor | Sol, puerta abierta |
| Nivel de un tanque | Altura del agua, 1,5 m | PLC con PI | Válvula de entrada | Sensor ultrasónico | Consumo variable |
| Control crucero | Velocidad, 80 km/h | ECU del carro | Acelerador electrónico | Sensor de rueda | Pendiente, viento |
| Horno eléctrico | Temperatura, 180 °C | Controlador PID | Resistencia con relé de estado sólido | Termopar | Abrir la puerta |
| Altura de un dron | Altura, 10 m | Microcontrolador | Motores y hélices | Barómetro | Ráfagas de viento |

> **Plantilla de respuesta:** (1) describe el sistema en dos líneas; (2) di si es lazo abierto o cerrado y por qué; (3) dibuja el diagrama con todas las señales; (4) define cada elemento con tu ejemplo.

#### Ejemplo 1 · Describir un sistema (como en el punto 1) · *Básico*

**Enunciado.** Presenta el control de nivel de un tanque de agua y define sus elementos.

1. Di qué variable se controla y qué valor se quiere: el nivel del agua, por ejemplo 1,5 m.

   **¿Por qué?** Todo sistema de control existe para llevar una variable a un valor. Empezar por ahí ordena la respuesta.

2. Di si es lazo abierto o cerrado: cerrado, porque un sensor mide el nivel y el controlador abre o cierra la válvula según la diferencia.

   **¿Por qué?** Si el sistema usa la medición de la salida para decidir, es lazo cerrado. Es lo primero que evalúan.

3. Asigna cada elemento: referencia 1,5 m; sensor ultrasónico; comparador y controlador en un PLC; actuador, la válvula de entrada; planta, el tanque; perturbación, el consumo de agua.

   **¿Por qué?** Recorre el diagrama de 5.1 en orden. Así no se te queda ningún elemento.

4. Define el error con números: si el sensor mide 1,2 m, \(e = 1{,}5 - 1{,}2 = 0{,}3\) m y el controlador abre más la válvula.

   **¿Por qué?** Un ejemplo numérico muestra que entiendes cómo funciona el lazo, no solo los nombres.

**Resultado:** Diagrama de bloques más una definición de cada elemento aplicada al tanque

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Elementos del lazo: horno eléctrico de panadería · *Básico*

**Enunciado.** Identifica referencia, planta, sensor, actuador, controlador y perturbación en «horno eléctrico de panadería».

1. **Referencia:** temperatura deseada (180 °C). **Planta:** el horno con su aire y sus paredes.

   **¿Por qué?** La referencia es lo que se quiere; la planta es lo que se quiere controlar.

2. **Sensor:** termopar. **Actuador:** resistencia eléctrica.

   **¿Por qué?** El sensor convierte la salida en una señal medible; el actuador es lo que realmente cambia la planta.

3. **Controlador:** calcula el error (referencia − medición) y decide la acción. **Perturbación:** apertura de la puerta.

   **¿Por qué?** La perturbación es lo que cambia la salida sin que nadie lo ordene; el lazo cerrado existe para rechazarla.

**Resultado.** Con estos elementos se dibuja el diagrama de bloques del capítulo y se escribe el error \(E = R - Y\).

#### Ejemplo 3 · Elementos del lazo: nivel de un tanque de agua · *Básico*

**Enunciado.** Identifica referencia, planta, sensor, actuador, controlador y perturbación en «nivel de un tanque de agua».

1. **Referencia:** nivel deseado (1,2 m). **Planta:** el tanque.

   **¿Por qué?** La referencia es lo que se quiere; la planta es lo que se quiere controlar.

2. **Sensor:** sensor ultrasónico de nivel. **Actuador:** bomba o válvula de entrada.

   **¿Por qué?** El sensor convierte la salida en una señal medible; el actuador es lo que realmente cambia la planta.

3. **Controlador:** calcula el error (referencia − medición) y decide la acción. **Perturbación:** consumo variable de salida.

   **¿Por qué?** La perturbación es lo que cambia la salida sin que nadie lo ordene; el lazo cerrado existe para rechazarla.

**Resultado.** Con estos elementos se dibuja el diagrama de bloques del capítulo y se escribe el error \(E = R - Y\).

#### Ejemplo 4 · Elementos del lazo: velocidad de un motor dc · *Básico*

**Enunciado.** Identifica referencia, planta, sensor, actuador, controlador y perturbación en «velocidad de un motor dc».

1. **Referencia:** velocidad deseada (1500 rpm). **Planta:** motor y carga.

   **¿Por qué?** La referencia es lo que se quiere; la planta es lo que se quiere controlar.

2. **Sensor:** encoder o tacómetro. **Actuador:** driver que fija el voltaje.

   **¿Por qué?** El sensor convierte la salida en una señal medible; el actuador es lo que realmente cambia la planta.

3. **Controlador:** calcula el error (referencia − medición) y decide la acción. **Perturbación:** cambio de carga en el eje.

   **¿Por qué?** La perturbación es lo que cambia la salida sin que nadie lo ordene; el lazo cerrado existe para rechazarla.

**Resultado.** Con estos elementos se dibuja el diagrama de bloques del capítulo y se escribe el error \(E = R - Y\).

#### Ejemplo 5 · Elementos del lazo: posición de un brazo robótico · *Básico*

**Enunciado.** Identifica referencia, planta, sensor, actuador, controlador y perturbación en «posición de un brazo robótico».

1. **Referencia:** ángulo deseado (45°). **Planta:** brazo y articulación.

   **¿Por qué?** La referencia es lo que se quiere; la planta es lo que se quiere controlar.

2. **Sensor:** potenciómetro o encoder. **Actuador:** servomotor.

   **¿Por qué?** El sensor convierte la salida en una señal medible; el actuador es lo que realmente cambia la planta.

3. **Controlador:** calcula el error (referencia − medición) y decide la acción. **Perturbación:** peso del objeto agarrado.

   **¿Por qué?** La perturbación es lo que cambia la salida sin que nadie lo ordene; el lazo cerrado existe para rechazarla.

**Resultado.** Con estos elementos se dibuja el diagrama de bloques del capítulo y se escribe el error \(E = R - Y\).

#### Ejemplo 6 · Elementos del lazo: iluminación automática · *Básico*

**Enunciado.** Identifica referencia, planta, sensor, actuador, controlador y perturbación en «iluminación automática».

1. **Referencia:** nivel de luz deseado (500 lux). **Planta:** la habitación.

   **¿Por qué?** La referencia es lo que se quiere; la planta es lo que se quiere controlar.

2. **Sensor:** fotorresistencia. **Actuador:** regulador (dimmer) de la lámpara.

   **¿Por qué?** El sensor convierte la salida en una señal medible; el actuador es lo que realmente cambia la planta.

3. **Controlador:** calcula el error (referencia − medición) y decide la acción. **Perturbación:** luz del sol que entra.

   **¿Por qué?** La perturbación es lo que cambia la salida sin que nadie lo ordene; el lazo cerrado existe para rechazarla.

**Resultado.** Con estos elementos se dibuja el diagrama de bloques del capítulo y se escribe el error \(E = R - Y\).

### Tema 3: Álgebra de bloques

**¿Por qué es importante?** Con el álgebra de bloques reduces cualquier sistema a una sola función de transferencia que luego puedes analizar.

**Fuentes oficiales:** [Modelado de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemModeling).

- Serie (cascada)
  
  \[G_{eq} = G_1\,G_2\]
  
  
- Paralelo
  
  \[G_{eq} = G_1 \pm G_2\]
  
  

*Realimentación negativa (la más importante)*

\[\frac{Y}{R} = \frac{G}{1+G\,H} \qquad\text{con } H=1:\ \ \frac{G}{1+G}\]

*“Lo de adelante sobre uno más todo el lazo.” Con realimentación positiva el signo de abajo es menos.*

#### Demostración de la fórmula de realimentación

1. El comparador produce el error: \(E = R - HY\).
2. El bloque directo produce la salida: \(Y = GE\).
3. Reemplaza el error: \(Y = G(R - HY) = GR - GHY\).
4. Pasa los términos con \(Y\) a un lado: \(Y + GHY = GR\), es decir \(Y(1+GH) = GR\).
5. Despeja: \(\dfrac{Y}{R} = \dfrac{G}{1+GH}\).

∎

#### Demostración · la realimentación rechaza perturbaciones

Si la perturbación \(D\) entra a la salida de la planta \(G_p\) con controlador \(C\) y \(H=1\): \(Y = G_pCE + D\) y \(E = R - Y\). Con \(R = 0\): \(Y = -G_pCY + D\), así que \(\dfrac{Y}{D} = \dfrac{1}{1+CG_p}\).

En lazo abierto la perturbación pasa entera (\(Y/D = 1\)). En lazo cerrado se divide por \(1+CG_p\): si la ganancia del lazo es 100, la perturbación se reduce unas 100 veces. Esa es la razón principal para cerrar el lazo.

∎

> **Truco para fracciones:** si \(G = N/D\) y \(H = 1\), entonces \(\dfrac{G}{1+G} = \dfrac{N}{D+N}\). El numerador se queda y el denominador pasa a ser \(D+N\).

#### Ejemplo 1 · Serie · *Básico*

**Enunciado.** \(G_1 = \dfrac{2}{s+1}\) seguido de \(G_2 = \dfrac{3}{s+4}\).

1. Multiplica: \(G = G_1G_2 = \dfrac{2\cdot3}{(s+1)(s+4)}\).

   **¿Por qué?** La salida de \(G_1\) es la entrada de \(G_2\): \(Y = G_2(G_1U)\).

2. Expande el denominador: \((s+1)(s+4) = s^2+5s+4\).

   **¿Por qué?** Así se lee como un segundo orden.

**Resultado:** \(G = \dfrac{6}{s^2+5s+4}\)

#### Ejemplo 2 · Paralelo · *Básico*

> **Qué cambia respecto al anterior:** Los bloques están lado a lado en vez de uno tras otro.

**Enunciado.** \(G_1 = \dfrac{1}{s+1}\) y \(G_2 = \dfrac{2}{s+2}\) en paralelo (sus salidas se suman).

1. Suma: \(\dfrac{1}{s+1} + \dfrac{2}{s+2}\).

   **¿Por qué?** Las dos ramas reciben la misma entrada y sus salidas se suman: \(Y = G_1U + G_2U\).

2. Denominador común \((s+1)(s+2)\): \(\dfrac{(s+2) + 2(s+1)}{(s+1)(s+2)} = \dfrac{3s+4}{s^2+3s+2}\).

   **¿Por qué?** Como al sumar fracciones normales.

**Resultado:** \(G = \dfrac{3s+4}{s^2+3s+2}\)

#### Ejemplo 3 · Realimentación unitaria · *Básico*

> **Qué cambia respecto al anterior:** Ahora la salida vuelve a la entrada.

**Enunciado.** \(G = \dfrac{10}{s+2}\), \(H = 1\). Halla el lazo cerrado.

1. Aplica \(\dfrac{G}{1+G}\): \(\dfrac{\frac{10}{s+2}}{1+\frac{10}{s+2}}\).

   **¿Por qué?** Es la fórmula demostrada arriba con \(H = 1\).

2. Multiplica arriba y abajo por \((s+2)\): \(\dfrac{10}{(s+2)+10} = \dfrac{10}{s+12}\).

   **¿Por qué?** Para quitar la fracción dentro de la fracción. Es el truco \(\dfrac{N}{D+N}\).

3. Compara: el polo pasó de \(-2\) a \(-12\).

   **¿Por qué?** Un polo más a la izquierda significa una respuesta más rápida (\(\tau\) pasó de 0,5 s a 0,083 s).

**Resultado:** \(\dfrac{10}{s+12}\), seis veces más rápido. Valor final \(10/12 = 0{,}83\)

#### Ejemplo 4 · Lazo con ganancia K · *Intermedio*

> **Qué cambia respecto al anterior:** La ganancia es una letra: se ve cómo \(K\) cambia los polos.

**Enunciado.** \(G = \dfrac{K}{s(s+2)}\), \(H = 1\). Halla el lazo cerrado y evalúa con \(K = 8\).

1. \(N = K\), \(D = s(s+2) = s^2+2s\). Lazo cerrado \(\dfrac{N}{D+N} = \dfrac{K}{s^2+2s+K}\).

   **¿Por qué?** Mismo truco del Ejemplo 4.

2. Con \(K = 8\): \(s^2+2s+8\). Polos: \(-1 \pm \sqrt{8-1}\,j = -1\pm2{,}65j\).

   **¿Por qué?** Atajo de capítulo 2.

**Resultado:** \(\dfrac{K}{s^2+2s+K}\); con \(K=8\), polos \(-1\pm2{,}65j\)

> Mover los polos cambiando \(K\) es la idea central del diseño (capítulo 18).

#### Ejemplo 5 · Sensor con dinámica · *Intermedio*

> **Qué cambia respecto al anterior:** \(H\) ya no es 1.

**Enunciado.** \(G = \dfrac{10}{s+1}\), \(H = \dfrac{2}{s+5}\).

1. \(GH = \dfrac{20}{(s+1)(s+5)}\).

   **¿Por qué?** El lazo completo pasa por los dos bloques.

2. \(\dfrac{G}{1+GH} = \dfrac{\frac{10}{s+1}}{1+\frac{20}{(s+1)(s+5)}}\).

   **¿Por qué?** Fórmula general con \(H \ne 1\).

3. Multiplica arriba y abajo por \((s+1)(s+5)\): \(\dfrac{10(s+5)}{(s+1)(s+5)+20} = \dfrac{10(s+5)}{s^2+6s+25}\).

   **¿Por qué?** Se elimina la fracción interna.

**Resultado:** \(\dfrac{10(s+5)}{s^2+6s+25}\)

#### Ejemplo 6 · Lazo dentro de otro lazo · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se combinan serie y dos realimentaciones.

**Enunciado.** Lazo interno: \(G_2 = \dfrac{1}{s+1}\) con \(H_1 = 2\). En serie con \(G_1 = \dfrac1s\). Todo con realimentación unitaria.

1. Reduce primero el lazo interno: \(\dfrac{\frac{1}{s+1}}{1+\frac{2}{s+1}} = \dfrac{1}{s+3}\).

   **¿Por qué?** Siempre de adentro hacia afuera: el lazo interno es un bloque más del externo.

2. Serie con \(G_1\): \(\dfrac1s\cdot\dfrac{1}{s+3} = \dfrac{1}{s(s+3)}\).

   **¿Por qué?** Ejemplo 2.

3. Lazo externo unitario: \(\dfrac{1}{s^2+3s+1}\).

   **¿Por qué?** Ejemplo 4: \(\dfrac{N}{D+N}\).

**Resultado:** \(\dfrac{Y}{R} = \dfrac{1}{s^2+3s+1}\)

#### Errores comunes

- En el punto 1, dibujar sin definir los elementos.
- Confundir actuador con controlador: el controlador decide, el actuador ejecuta con energía.
- Escribir \(\dfrac{G}{1-GH}\) para realimentación negativa.

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 7 · Lazo con \(G = \frac{10}{s + 1}\) y \(H = 1\) · *Básico*

**Enunciado.** Reduce el lazo de realimentación negativa a una sola función.

1. Usa \(T = \dfrac{G}{1+GH}\).

   **¿Por qué?** Sale de \(Y = G(R - HY)\): despejando \(Y\) queda esa fórmula.

2. \(GH = \frac{10}{s + 1}\); sustituye y multiplica arriba y abajo por el denominador de \(GH\).

   **¿Por qué?** Así desaparecen las fracciones dentro de fracciones.

**Resultado.** \(T(s) = \frac{10}{s + 11}\); polos en lazo cerrado: \(-11\).

#### Ejemplo 8 · Lazo con \(G = \frac{5}{s \left(s + 2\right)}\) y \(H = 2\) · *Intermedio*

**Enunciado.** Reduce el lazo de realimentación negativa a una sola función.

1. Usa \(T = \dfrac{G}{1+GH}\).

   **¿Por qué?** Sale de \(Y = G(R - HY)\): despejando \(Y\) queda esa fórmula.

2. \(GH = \frac{10}{s \left(s + 2\right)}\); sustituye y multiplica arriba y abajo por el denominador de \(GH\).

   **¿Por qué?** Así desaparecen las fracciones dentro de fracciones.

**Resultado.** \(T(s) = \frac{5}{s \left(s + 2\right) + 10}\); polos en lazo cerrado: \(-1 - 3 j, -1 + 3 j\).

#### Ejemplo 9 · Lazo con \(G = \frac{4}{s + 3}\) y \(H = \frac{1}{s + 1}\) · *Intermedio*

**Enunciado.** Reduce el lazo de realimentación negativa a una sola función.

1. Usa \(T = \dfrac{G}{1+GH}\).

   **¿Por qué?** Sale de \(Y = G(R - HY)\): despejando \(Y\) queda esa fórmula.

2. \(GH = \frac{4}{\left(s + 1\right) \left(s + 3\right)}\); sustituye y multiplica arriba y abajo por el denominador de \(GH\).

   **¿Por qué?** Así desaparecen las fracciones dentro de fracciones.

**Resultado.** \(T(s) = \frac{4 \left(s + 1\right)}{\left(s + 1\right) \left(s + 3\right) + 4}\); polos en lazo cerrado: \(-2 - \sqrt{3} j, -2 + \sqrt{3} j\).

#### Práctica para resolver sola o solo

- **1.**Lazo cerrado unitario de \(G = \dfrac{4}{s(s+1)}\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{4}{s^2+s+4}\).
  
  </details>

- **2.**Paralelo de \(\dfrac{1}{s+1}\) y \(\dfrac{2}{s+2}\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{(s+2)+2(s+1)}{(s+1)(s+2)} = \dfrac{3s+4}{s^2+3s+2}\).
  
  </details>

- **3.**Escribe los elementos del control de nivel de un tanque.
  
  <details><summary>Respuesta</summary>
  
  Referencia: nivel deseado. Controlador: PLC. Actuador: válvula. Planta: tanque. Variable: nivel. Sensor: ultrasónico o flotador. Perturbación: consumo de agua. Error: nivel deseado menos medido.
  
  </details>

