# Módulo 1: Números complejos

Los polos de un sistema casi siempre son números complejos. Si los manejas con soltura, el resto del curso es mucho más fácil.

**Al terminar podrás:**

- Sumar, multiplicar y dividir complejos.
- Ubicar un complejo en el plano y sacar su magnitud y ángulo.
- Hallar las raíces de \(s^2+bs+c\) y reconocer si son reales o complejas.
- Armar el polinomio a partir de dos polos conjugados (pregunta típica de parcial).

## Aprende construyendo

### Tema 1: ¿Qué es un número complejo?

**¿Por qué es importante?** Los polos de casi todos los sistemas que estudiarás son números complejos; sin entenderlos no puedes leer su comportamiento.

Hay ecuaciones sin solución en los números reales, como \(x^2 = -1\). Para resolverlas se define la unidad imaginaria \(j\), con \(j^2 = -1\). En ingeniería se usa \(j\) en lugar de \(i\) porque \(i\) se reserva para la corriente.

Un número complejo tiene dos partes:

\[s = \underbrace{\sigma}_{\text{parte real}} + j\,\underbrace{\omega}_{\text{parte imaginaria}}\]

Piénsalo como un punto en un plano: \(\sigma\) es la coordenada horizontal y \(\omega\) la vertical. En control a ese plano se le llama **plano s**.

![Plano complejo con los puntos -3+4j, 2+1j y -3-4j](content/figures/control-1/plano-complejo.svg)

*Cada complejo es un punto. El conjugado es el reflejo respecto al eje horizontal. La distancia al origen es la magnitud.*

### Tema 2: Operaciones

**¿Por qué es importante?** Multiplicar conjugados y dividir complejos aparece en cada cálculo de polos, ángulos y respuestas en frecuencia.

- Suma y restaReal con real, imaginaria con imaginaria.
  
  \[(a+jb)+(c+jd) = (a+c)+j(b+d)\]
  
  
- MultiplicaciónDistribuye como siempre y reemplaza \(j^2 = -1\).
  
  \[(a+jb)(c+jd) = (ac-bd)+j(ad+bc)\]
  
  
- ConjugadoCambia el signo de la parte imaginaria.
  
  \[\overline{a+jb} = a-jb\]
  
  
- DivisiónMultiplica arriba y abajo por el conjugado del denominador.
  
  \[\frac{a+jb}{c+jd} = \frac{(a+jb)(c-jd)}{c^2+d^2}\]
  
  

*Magnitud y ángulo (forma polar)*

\[|s| = \sqrt{\sigma^2+\omega^2} \qquad \angle s = \arctan\frac{\omega}{\sigma}\ \ (\text{corrige el cuadrante})\]

#### Demostración · de dónde sale la magnitud

El punto \((\sigma, \omega)\), el origen y el pie de la perpendicular sobre el eje real forman un triángulo rectángulo con catetos \(|\sigma|\) y \(|\omega|\). Por Pitágoras, la hipotenusa (la distancia al origen) es \(\sqrt{\sigma^2+\omega^2}\). El ángulo cumple \(\tan\varphi = \omega/\sigma\) por definición de tangente: cateto opuesto sobre cateto adyacente.

Otra forma: \(s\,\bar s = (\sigma+j\omega)(\sigma-j\omega) = \sigma^2 - j^2\omega^2 = \sigma^2+\omega^2\). Entonces \(|s|^2 = s\bar s\), un número real y positivo.

∎

#### Forma polar y fórmula de Euler

Todo complejo se puede escribir con su magnitud \(r\) y su ángulo \(\varphi\): \(s = r(\cos\varphi + j\sin\varphi)\). La fórmula de Euler lo compacta:

\[e^{j\varphi} = \cos\varphi + j\sin\varphi \qquad\Rightarrow\qquad s = r\,e^{j\varphi}\]

#### Demostración de la fórmula de Euler (series de Taylor)

1. Las series de Taylor alrededor de 0 son: \(e^x = 1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \frac{x^4}{4!} + \cdots\), \(\cos x = 1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots\) y \(\sin x = x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots\)
2. Reemplaza \(x = j\varphi\) en la de \(e^x\) y usa \(j^2=-1\), \(j^3=-j\), \(j^4=1\):

   \[e^{j\varphi} = 1 + j\varphi - \frac{\varphi^2}{2!} - j\frac{\varphi^3}{3!} + \frac{\varphi^4}{4!} + j\frac{\varphi^5}{5!} - \cdots\]

3. Agrupa los términos sin \(j\) y los que tienen \(j\):

   \[e^{j\varphi} = \underbrace{\left(1 - \frac{\varphi^2}{2!} + \frac{\varphi^4}{4!} - \cdots\right)}_{\cos\varphi} + j\underbrace{\left(\varphi - \frac{\varphi^3}{3!} + \frac{\varphi^5}{5!} - \cdots\right)}_{\sin\varphi}\]

∎

Dos consecuencias que usarás en Laplace (capítulo 3):

\[\cos\omega t = \frac{e^{j\omega t}+e^{-j\omega t}}{2} \qquad \sin\omega t = \frac{e^{j\omega t}-e^{-j\omega t}}{2j}\]

*Salen de sumar y restar \(e^{j\omega t} = \cos\omega t + j\sin\omega t\) y \(e^{-j\omega t} = \cos\omega t - j\sin\omega t\).*

> **Multiplicar en forma polar es fácil:** \(r_1e^{j\varphi_1}\cdot r_2e^{j\varphi_2} = r_1r_2\,e^{j(\varphi_1+\varphi_2)}\). Las magnitudes se multiplican y los ángulos se suman. Esto es la base de la condición de ángulo del lugar de las raíces (capítulo 18) y de los diagramas de Bode (capítulo 21).

#### Ejemplo 1 · Sumar dos complejos · *Básico*

**Enunciado.** Calcula \((3+2j) + (1+4j)\).

1. Suma las partes reales entre sí: \(3 + 1 = 4\).

   **¿Por qué?** La parte real y la imaginaria son como las coordenadas \(x\) y \(y\) de un punto. Nunca se mezclan: lo horizontal se suma con lo horizontal.

2. Suma las partes imaginarias entre sí: \(2 + 4 = 6\).

   **¿Por qué?** Lo mismo con la parte vertical. El \(j\) solo indica “esto va en el eje vertical”.

**Resultado:** \(4 + 6j\)

#### Ejemplo 2 · Multiplicar dos complejos · *Básico*

> **Qué cambia respecto al anterior:** Ahora se multiplica en lugar de sumar, y aparece \(j^2\).

**Enunciado.** Calcula \((2+3j)(1-5j)\).

1. Multiplica cada término del primero por cada término del segundo (como \((a+b)(c+d)\) en álgebra).

   \[2\cdot1 + 2\cdot(-5j) + 3j\cdot1 + 3j\cdot(-5j) = 2 - 10j + 3j - 15j^2\]

   **¿Por qué?** Un complejo es una suma de dos términos, así que se aplica la propiedad distributiva igual que con cualquier binomio.

2. Reemplaza \(j^2\) por \(-1\): el término \(-15j^2\) se vuelve \(+15\).

   \[2 - 10j + 3j + 15\]

   **¿Por qué?** Por definición \(j = \sqrt{-1}\), entonces \(j^2 = -1\). Este es el único paso nuevo frente al álgebra normal.

3. Agrupa reales e imaginarios: \(2 + 15 = 17\) y \(-10j + 3j = -7j\).

   **¿Por qué?** Igual que en el Ejemplo 1: cada parte por su lado.

**Resultado:** \(17 - 7j\)

#### Ejemplo 3 · Multiplicar por el conjugado · *Básico*

> **Qué cambia respecto al anterior:** Los dos factores son conjugados, así que el resultado queda sin \(j\).

**Enunciado.** Calcula \((-3+4j)(-3-4j)\).

1. Observa que el segundo es el conjugado del primero: igual parte real, parte imaginaria con signo contrario.

   **¿Por qué?** Reconocer conjugados ahorra trabajo: su producto siempre es un número real.

2. Usa la diferencia de cuadrados \((a+b)(a-b) = a^2 - b^2\) con \(a = -3\) y \(b = 4j\).

   \[(-3)^2 - (4j)^2 = 9 - 16j^2 = 9 + 16\]

   **¿Por qué?** Es la misma multiplicación del Ejemplo 2, pero los términos cruzados \(+12j\) y \(-12j\) se cancelan.

**Resultado:** \(25\), un número real. Es \(|{-3+4j}|^2 = 3^2+4^2\)

> Este truco se usa en todo el curso: dos polos \(-\sigma \pm j\omega\) multiplicados dan \((s+\sigma)^2+\omega^2\), un polinomio con coeficientes reales.

#### Ejemplo 4 · Dividir · *Intermedio*

> **Qué cambia respecto al anterior:** Se divide. Se usa el truco del conjugado del Ejemplo 3.

**Enunciado.** Calcula \(\dfrac{1+2j}{3-4j}\).

1. Multiplica arriba y abajo por el conjugado del denominador, \(3+4j\).

   \[\frac{1+2j}{3-4j}\cdot\frac{3+4j}{3+4j}\]

   **¿Por qué?** Así el denominador se vuelve real (Ejemplo 3) y la división queda como “número complejo dividido por un número normal”. Multiplicar arriba y abajo por lo mismo no cambia el valor.

2. Denominador: \((3-4j)(3+4j) = 9 + 16 = 25\).

   **¿Por qué?** Producto de conjugados: parte real al cuadrado más parte imaginaria al cuadrado.

3. Numerador: \((1+2j)(3+4j) = 3 + 4j + 6j + 8j^2 = 3 + 10j - 8 = -5 + 10j\).

   **¿Por qué?** Multiplicación normal como en el Ejemplo 2, con \(j^2 = -1\).

4. Divide cada parte por 25: \(\dfrac{-5}{25} + \dfrac{10}{25}j\).

   **¿Por qué?** Ahora el denominador es real y se puede repartir.

**Resultado:** \(-0{,}2 + 0{,}4j\)

#### Ejemplo 5 · Magnitud y ángulo · *Intermedio*

> **Qué cambia respecto al anterior:** Ya no se opera: se mide el punto (distancia y dirección).

**Enunciado.** Halla la magnitud y el ángulo de \(s = -3+4j\).

1. Ubica el punto: 3 a la izquierda y 4 hacia arriba (segundo cuadrante).

   **¿Por qué?** Dibujarlo evita errores de signo en el ángulo.

2. Magnitud con Pitágoras: \(|s| = \sqrt{(-3)^2 + 4^2} = \sqrt{25} = 5\).

   **¿Por qué?** La distancia al origen es la hipotenusa de un triángulo con catetos 3 y 4.

3. Ángulo con el eje real negativo: \(\theta = \arctan\dfrac{4}{3} = 53{,}13°\).

   **¿Por qué?** En control casi siempre se mide desde el eje real negativo, porque los polos estables están a la izquierda. Ese ángulo da el amortiguamiento: \(\zeta = \cos\theta\) (capítulo 13).

4. Ángulo desde el eje real positivo (el “matemático”): \(180° - 53{,}13° = 126{,}87°\).

   **¿Por qué?** La calculadora da \(\arctan(4/-3) = -53{,}13°\), que está en el cuadrante equivocado. Hay que corregir sumando 180°.

**Resultado:** \(|s| = 5\); \(\theta = 53{,}13°\) desde el eje real negativo

### Tema 3: Raíces de s²+bs+c

**¿Por qué es importante?** Las raíces de \(s^2+bs+c\) son los polos de un sistema de segundo orden: de ellas sale si el sistema oscila o no.

Los denominadores de segundo orden tienen esta forma. Sus raíces se sacan con la fórmula cuadrática. Lo que decide el tipo de raíces es el discriminante \(\Delta = b^2-4c\):

\[s = \frac{-b \pm \sqrt{b^2-4c}}{2}\]

#### Demostración · completar el cuadrado

1. Parte de \(s^2 + bs + c = 0\). Suma y resta \((b/2)^2\): \(s^2 + bs + \tfrac{b^2}{4} - \tfrac{b^2}{4} + c = 0\).
2. Los tres primeros términos son un cuadrado perfecto: \(\left(s+\tfrac b2\right)^2 = \tfrac{b^2}{4} - c\).
3. Saca raíz: \(s + \tfrac b2 = \pm\sqrt{\tfrac{b^2-4c}{4}}\), es decir \(s = \dfrac{-b\pm\sqrt{b^2-4c}}{2}\).
4. Si \(b^2-4c<0\), \(\sqrt{b^2-4c} = j\sqrt{4c-b^2}\), y queda \(s = -\tfrac b2 \pm j\sqrt{c-\tfrac{b^2}{4}}\): el atajo de abajo.

∎

#### Demostración · por qué los polos complejos vienen en parejas

Sea \(P(s)\) un polinomio con coeficientes reales y \(p\) una raíz: \(P(p) = 0\). El conjugado de una suma es la suma de los conjugados y el de un producto es el producto de los conjugados. Como los coeficientes son reales, no cambian al conjugarlos. Entonces \(\overline{P(p)} = P(\bar p)\). Pero \(\overline{P(p)} = \bar 0 = 0\), así que \(P(\bar p) = 0\): el conjugado también es raíz.

∎

| Discriminante | Raíces | Ejemplo |
|---|---|---|
| \(\Delta > 0\) | Dos reales distintas | \(s^2+5s+6 \to -2,\ -3\) |
| \(\Delta = 0\) | Una real repetida | \(s^2+4s+4 \to -2\) (doble) |
| \(\Delta < 0\) | Complejas conjugadas | \(s^2+4s+13 \to -2 \pm 3j\) |

**Atajo para raíces complejas**

1. Parte real: \(-b/2\).
2. Parte imaginaria: \(\sqrt{c - b^2/4}\).
3. Raíces: \(-\tfrac{b}{2} \pm j\sqrt{c-\tfrac{b^2}{4}}\).

#### Ejemplo 6 · Raíces reales · *Básico*

**Enunciado.** Halla las raíces de \(s^2+5s+6\).

1. Identifica \(b = 5\) y \(c = 6\).

   **¿Por qué?** La fórmula cuadrática necesita estos coeficientes (el de \(s^2\) es 1).

2. Calcula el discriminante: \(\Delta = b^2 - 4c = 25 - 24 = 1\).

   **¿Por qué?** El signo de \(\Delta\) decide el tipo de raíces. Positivo: dos reales distintas.

3. Aplica la fórmula: \(s = \dfrac{-5 \pm \sqrt1}{2} = \dfrac{-5\pm1}{2}\).

   **¿Por qué?** Es la fórmula demostrada arriba.

4. Las dos raíces: \(\dfrac{-4}{2} = -2\) y \(\dfrac{-6}{2} = -3\).

   **¿Por qué?** Comprobación: \((s+2)(s+3) = s^2+5s+6\). Correcto.

**Resultado:** \(s = -2\) y \(s = -3\)

#### Ejemplo 7 · Raíces complejas · *Básico*

> **Qué cambia respecto al anterior:** Ahora \(\Delta\) es negativo.

**Enunciado.** Halla las raíces de \(s^2+4s+13\).

1. \(\Delta = 16 - 52 = -36\).

   **¿Por qué?** Es negativo: la raíz cuadrada de un negativo da un imaginario, así que las raíces son complejas.

2. \(\sqrt{-36} = \sqrt{36}\cdot\sqrt{-1} = 6j\).

   **¿Por qué?** Se separa el signo menos como \(\sqrt{-1} = j\).

3. \(s = \dfrac{-4 \pm 6j}{2} = -2 \pm 3j\).

   **¿Por qué?** Se divide cada parte por 2.

**Resultado:** \(s = -2 \pm 3j\)

#### Ejemplo 8 · El atajo · *Intermedio*

> **Qué cambia respecto al anterior:** El mismo resultado del Ejemplo 7 con menos cuentas.

**Enunciado.** Halla las raíces de \(s^2+2s+37\) sin la fórmula completa.

1. Parte real: \(-b/2 = -2/2 = -1\).

   **¿Por qué?** Cuando las raíces son complejas, la fórmula siempre deja \(-b/2\) como parte real.

2. Parte imaginaria: \(\sqrt{c - b^2/4} = \sqrt{37 - 1} = 6\).

   **¿Por qué?** Es lo que queda dentro de la raíz después de sacar el 4 y el signo menos. Verifica con el Ejemplo 7: \(\sqrt{13-4} = 3\).

**Resultado:** \(s = -1 \pm 6j\). Es el denominador del punto 3(ii) del Parcial 1

#### Ejemplo 9 · Del polo al polinomio · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se hace el camino inverso: de las raíces al polinomio.

**Enunciado.** Un sistema tiene polos en \(-1\pm8j\). ¿Cuál es su denominador?

1. Escribe un factor por polo: \((s - p_1)(s - p_2) = (s - (-1+8j))(s - (-1-8j))\).

   **¿Por qué?** Si \(p\) es raíz, \((s-p)\) es un factor: es la definición de raíz al revés.

2. Simplifica los signos: \((s+1-8j)(s+1+8j)\).

   **¿Por qué?** Restar un número negativo es sumar.

3. Es un producto de conjugados con \(a = s+1\) y \(b = 8j\): \((s+1)^2 - (8j)^2 = (s+1)^2 + 64\).

   **¿Por qué?** Mismo truco del Ejemplo 3.

4. Expande: \(s^2 + 2s + 1 + 64 = s^2+2s+65\).

   **¿Por qué?** Se deja en forma de polinomio porque así aparece en los parciales.

**Resultado:** \(s^2+2s+65\), el denominador del punto 1 del Parcial 2

#### Errores comunes

- Olvidar que \(j^2 = -1\) al multiplicar: el término \(-15j^2\) se vuelve \(+15\).
- Equivocar el signo del factor: el polo \(-3\) da el factor \((s+3)\), no \((s-3)\).
- Dar el ángulo sin revisar el cuadrante cuando la parte real es negativa.

### Tema 4: Práctica

**¿Por qué es importante?** Practicar las operaciones hasta hacerlas sin pensar te libera para concentrarte en el razonamiento de control.

- **1.**Calcula \((3-2j)(4+j)\).
  
  <details><summary>Respuesta</summary>
  
  \(12+3j-8j-2j^2 = 14-5j\).
  
  </details>

- **2.**Raíces de \(s^2+6s+25\).
  
  <details><summary>Respuesta</summary>
  
  \(-3 \pm j\sqrt{25-9} = -3\pm4j\).
  
  </details>

- **3.**Denominador con polos en \(-2\pm5j\).
  
  <details><summary>Respuesta</summary>
  
  \((s+2)^2+25 = s^2+4s+29\).
  
  </details>

- **4.**Magnitud y ángulo con el eje real negativo de \(-4+3j\).
  
  <details><summary>Respuesta</summary>
  
  \(|s|=5\), \(\theta = \arctan(3/4) = 36{,}87°\).
  
  </details>
