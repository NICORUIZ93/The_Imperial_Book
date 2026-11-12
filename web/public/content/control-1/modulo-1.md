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

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

Hay ecuaciones sin solución en los números reales, como \(x^2 = -1\). Para resolverlas se define la unidad imaginaria \(j\), con \(j^2 = -1\). En ingeniería se usa \(j\) en lugar de \(i\) porque \(i\) se reserva para la corriente.

Un número complejo tiene dos partes:

\[s = \underbrace{\sigma}_{\text{parte real}} + j\,\underbrace{\omega}_{\text{parte imaginaria}}\]

Piénsalo como un punto en un plano: \(\sigma\) es la coordenada horizontal y \(\omega\) la vertical. En control a ese plano se le llama **plano s**.

![Plano complejo con los puntos -3+4j, 2+1j y -3-4j](content/figures/control-1/plano-complejo.svg)

*Cada complejo es un punto. El conjugado es el reflejo respecto al eje horizontal. La distancia al origen es la magnitud.*

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Pasar \(3 + 4 j\) a forma polar · *Básico*

**Enunciado.** Escribe \(z = 3 + 4 j\) como magnitud y ángulo.

1. Parte real \(a = 3\), parte imaginaria \(b = 4\).

   **¿Por qué?** La forma rectangular \(a + jb\) da directamente las dos coordenadas del punto en el plano.

2. Magnitud: \(|z| = \sqrt{a^2+b^2} = \sqrt{9+16} = 5\).

   **¿Por qué?** La magnitud es la distancia del origen al punto: Pitágoras con catetos \(a\) y \(b\).

3. Ángulo de referencia \(\arctan\left|\tfrac{b}{a}\right| = 53{,}1^\circ\); el punto está en el primer cuadrante, así que \(\theta = 53{,}1^\circ\).

   **¿Por qué?** La calculadora devuelve \(\arctan(b/a)\) solo entre −90° y 90°. Hay que mirar los signos de \(a\) y \(b\) para ubicar el cuadrante; olvidar esto es el error más común.

**Resultado.** \(z = 5\,\angle\,53{,}1^\circ\).

**Comprobación.** \(|z|\cos\theta = 3\) y \(|z|\sin\theta = 4\) devuelven \(a\) y \(b\).

#### Ejemplo 2 · Pasar \(-2 + 2 j\) a forma polar · *Básico*

**Enunciado.** Escribe \(z = -2 + 2 j\) como magnitud y ángulo.

1. Parte real \(a = -2\), parte imaginaria \(b = 2\).

   **¿Por qué?** La forma rectangular \(a + jb\) da directamente las dos coordenadas del punto en el plano.

2. Magnitud: \(|z| = \sqrt{a^2+b^2} = \sqrt{4+4} = 2 \sqrt{2}\) \(\approx 2{,}828\).

   **¿Por qué?** La magnitud es la distancia del origen al punto: Pitágoras con catetos \(a\) y \(b\).

3. Ángulo de referencia \(\arctan\left|\tfrac{b}{a}\right| = 45^\circ\); el punto está en el segundo cuadrante, así que \(\theta = 135^\circ\).

   **¿Por qué?** La calculadora devuelve \(\arctan(b/a)\) solo entre −90° y 90°. Hay que mirar los signos de \(a\) y \(b\) para ubicar el cuadrante; olvidar esto es el error más común.

**Resultado.** \(z = 2 \sqrt{2}\,\angle\,135^\circ\).

**Comprobación.** \(|z|\cos\theta = -2\) y \(|z|\sin\theta = 2\) devuelven \(a\) y \(b\).

#### Ejemplo 3 · Pasar \(-1 - \sqrt{3} j\) a forma polar · *Intermedio*

**Enunciado.** Escribe \(z = -1 - \sqrt{3} j\) como magnitud y ángulo.

1. Parte real \(a = -1\), parte imaginaria \(b = - \sqrt{3}\).

   **¿Por qué?** La forma rectangular \(a + jb\) da directamente las dos coordenadas del punto en el plano.

2. Magnitud: \(|z| = \sqrt{a^2+b^2} = \sqrt{1+3} = 2\).

   **¿Por qué?** La magnitud es la distancia del origen al punto: Pitágoras con catetos \(a\) y \(b\).

3. Ángulo de referencia \(\arctan\left|\tfrac{b}{a}\right| = 60^\circ\); el punto está en el tercer cuadrante, así que \(\theta = -120^\circ\).

   **¿Por qué?** La calculadora devuelve \(\arctan(b/a)\) solo entre −90° y 90°. Hay que mirar los signos de \(a\) y \(b\) para ubicar el cuadrante; olvidar esto es el error más común.

**Resultado.** \(z = 2\,\angle\,-120^\circ\).

**Comprobación.** \(|z|\cos\theta = -1\) y \(|z|\sin\theta = -1{,}732\) devuelven \(a\) y \(b\).

#### Ejemplo 4 · Pasar \(5 - 12 j\) a forma polar · *Intermedio*

**Enunciado.** Escribe \(z = 5 - 12 j\) como magnitud y ángulo.

1. Parte real \(a = 5\), parte imaginaria \(b = -12\).

   **¿Por qué?** La forma rectangular \(a + jb\) da directamente las dos coordenadas del punto en el plano.

2. Magnitud: \(|z| = \sqrt{a^2+b^2} = \sqrt{25+144} = 13\).

   **¿Por qué?** La magnitud es la distancia del origen al punto: Pitágoras con catetos \(a\) y \(b\).

3. Ángulo de referencia \(\arctan\left|\tfrac{b}{a}\right| = 67{,}4^\circ\); el punto está en el cuarto cuadrante, así que \(\theta = -67{,}4^\circ\).

   **¿Por qué?** La calculadora devuelve \(\arctan(b/a)\) solo entre −90° y 90°. Hay que mirar los signos de \(a\) y \(b\) para ubicar el cuadrante; olvidar esto es el error más común.

**Resultado.** \(z = 13\,\angle\,-67{,}4^\circ\).

**Comprobación.** \(|z|\cos\theta = 5\) y \(|z|\sin\theta = -12\) devuelven \(a\) y \(b\).

#### Ejemplo 5 · Pasar \(-4\) a forma polar · *Básico*

**Enunciado.** Escribe \(z = -4\) como magnitud y ángulo.

1. Parte real \(a = -4\), parte imaginaria \(b = 0\).

   **¿Por qué?** La forma rectangular \(a + jb\) da directamente las dos coordenadas del punto en el plano.

2. Magnitud: \(|z| = \sqrt{a^2+b^2} = \sqrt{16+0} = 4\).

   **¿Por qué?** La magnitud es la distancia del origen al punto: Pitágoras con catetos \(a\) y \(b\).

3. El punto está sobre un eje: el ángulo es \(180^\circ\).

   **¿Por qué?** El punto está sobre un eje, así que el ángulo se lee sin calculadora: 0°, 90°, 180° o −90°.

**Resultado.** \(z = 4\,\angle\,180^\circ\).

**Comprobación.** \(|z|\cos\theta = -4\) y \(|z|\sin\theta = 0\) devuelven \(a\) y \(b\).

#### Ejemplo 6 · Pasar \(3 j\) a forma polar · *Básico*

**Enunciado.** Escribe \(z = 3 j\) como magnitud y ángulo.

1. Parte real \(a = 0\), parte imaginaria \(b = 3\).

   **¿Por qué?** La forma rectangular \(a + jb\) da directamente las dos coordenadas del punto en el plano.

2. Magnitud: \(|z| = \sqrt{a^2+b^2} = \sqrt{0+9} = 3\).

   **¿Por qué?** La magnitud es la distancia del origen al punto: Pitágoras con catetos \(a\) y \(b\).

3. El punto está sobre un eje: el ángulo es \(90^\circ\).

   **¿Por qué?** El punto está sobre un eje, así que el ángulo se lee sin calculadora: 0°, 90°, 180° o −90°.

**Resultado.** \(z = 3\,\angle\,90^\circ\).

**Comprobación.** \(|z|\cos\theta = 0\) y \(|z|\sin\theta = 3\) devuelven \(a\) y \(b\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 con cálculo simbólico.

```python
# verificacion.py
from sympy import I, Abs, arg, deg, N

z = 3 + 4 * I
print("magnitud:", N(Abs(z)))
print("angulo_grados:", N(deg(arg(z))))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `magnitud: 5.00000000000000` y `angulo_grados: 53.1301023541560`, igual al \(5\,\angle\,53{,}1^\circ\) del Ejemplo 1.

**Práctica:** cambia `z` por \(-5+12j\) y vuelve a ejecutar. Resultado esperado: magnitud 13 y ángulo ≈ \(112{,}62^\circ\) (segundo cuadrante).

**Límite:** la forma polar no está definida en \(z=0\) (el ángulo queda indeterminado); ese caso se trata aparte, no con esta fórmula.

### Tema 2: Operaciones

**¿Por qué es importante?** Multiplicar conjugados y dividir complejos aparece en cada cálculo de polos, ángulos y respuestas en frecuencia.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 6 · Dividir multiplicando por el conjugado · *Intermedio*

**Enunciado.** Calcula \(\dfrac{2 + 3 j}{1 - j}\).

1. Multiplica arriba y abajo por el conjugado \(1 + j\).

   **¿Por qué?** El producto de un número por su conjugado es real: \((a+jb)(a-jb)=a^2+b^2\). Así desaparece la \(j\) del denominador.

2. Numerador: \((2 + 3 j)(1 + j) = -1 + 5 j\); denominador: \(2\).

   **¿Por qué?** Se usa \(j^2=-1\) al expandir.

**Resultado.** \(- \frac{1}{2} + \frac{5 j}{2}\).

#### Ejemplo 7 · Multiplicar y dividir en forma polar · *Intermedio*

**Enunciado.** Con \(z_1 = 4\angle 30^\circ\) y \(z_2 = 2\angle 75^\circ\), calcula \(z_1z_2\) y \(z_1/z_2\).

1. Producto: multiplica magnitudes y suma ángulos: \(4\cdot2\,\angle(30^\circ+75^\circ) = 8\angle105^\circ\).

   **¿Por qué?** Por Euler, \(r_1e^{j\theta_1}\,r_2e^{j\theta_2} = r_1r_2e^{j(\theta_1+\theta_2)}\): los exponentes se suman.

2. Cociente: divide magnitudes y resta ángulos: \(\tfrac42\,\angle(30^\circ-75^\circ) = 2\angle-45^\circ\).

   **¿Por qué?** Dividir exponenciales resta los exponentes.

**Resultado.** \(z_1z_2 = 8\angle105^\circ\) y \(z_1/z_2 = 2\angle-45^\circ = \sqrt2 - j\sqrt2\).

#### Ejemplo 8 · Potencia de un complejo · *Intermedio*

**Enunciado.** Calcula \((1+j)^6\) sin expandir el binomio.

1. Pasa a polar: \(|1+j| = \sqrt2\), ángulo 45°.

   **¿Por qué?** En polar las potencias son fáciles: magnitud a la potencia y ángulo multiplicado.

2. \((\sqrt2)^6 = 8\) y \(6\cdot45^\circ = 270^\circ\).

   **¿Por qué?** Regla de De Moivre: \((re^{j\theta})^n = r^ne^{jn\theta}\).

**Resultado.** \(8\angle270^\circ = - 8 j\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar los Ejemplos 2, 4 y 8 con cálculo simbólico.

```python
# verificacion.py
from sympy import I, expand, nsimplify

producto = expand((2 + 3 * I) * (1 - 5 * I))
division = nsimplify((1 + 2 * I) / (3 - 4 * I))
potencia = expand((1 + I) ** 6)
print("producto:", producto)
print("division:", division)
print("potencia:", potencia)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `producto: 17 - 7*I`, `division: -1/5 + 2*I/5` y `potencia: -8*I`, iguales a los resultados manuales de los Ejemplos 2, 4 y 8.

**Práctica:** calcula \((1+j)(2+3j)\) y \(\dfrac{4+2j}{1+j}\) a mano y confirma modificando `verificacion.py`. Resultado esperado: \(-1+5j\) y \(3-j\).

**Límite:** la regla "multiplica magnitudes y suma ángulos" en polar exige que ambos ángulos estén en el mismo rango (p. ej. \((-180°,180°]\)); si no, hay que normalizar sumando o restando 360° antes de sumar.

### Tema 3: Raíces de s²+bs+c

**¿Por qué es importante?** Las raíces de \(s^2+bs+c\) son los polos de un sistema de segundo orden: de ellas sale si el sistema oscila o no.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

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

#### Ejemplo 1 · Raíces reales · *Básico*

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

#### Ejemplo 2 · Raíces complejas · *Básico*

> **Qué cambia respecto al anterior:** Ahora \(\Delta\) es negativo.

**Enunciado.** Halla las raíces de \(s^2+4s+13\).

1. \(\Delta = 16 - 52 = -36\).

   **¿Por qué?** Es negativo: la raíz cuadrada de un negativo da un imaginario, así que las raíces son complejas.

2. \(\sqrt{-36} = \sqrt{36}\cdot\sqrt{-1} = 6j\).

   **¿Por qué?** Se separa el signo menos como \(\sqrt{-1} = j\).

3. \(s = \dfrac{-4 \pm 6j}{2} = -2 \pm 3j\).

   **¿Por qué?** Se divide cada parte por 2.

**Resultado:** \(s = -2 \pm 3j\)

#### Ejemplo 3 · El atajo · *Intermedio*

> **Qué cambia respecto al anterior:** El mismo resultado del Ejemplo 7 con menos cuentas.

**Enunciado.** Halla las raíces de \(s^2+2s+37\) sin la fórmula completa.

1. Parte real: \(-b/2 = -2/2 = -1\).

   **¿Por qué?** Cuando las raíces son complejas, la fórmula siempre deja \(-b/2\) como parte real.

2. Parte imaginaria: \(\sqrt{c - b^2/4} = \sqrt{37 - 1} = 6\).

   **¿Por qué?** Es lo que queda dentro de la raíz después de sacar el 4 y el signo menos. Verifica con el Ejemplo 7: \(\sqrt{13-4} = 3\).

**Resultado:** \(s = -1 \pm 6j\). Es el denominador del punto 3(ii) del Parcial 1

#### Ejemplo 4 · Del polo al polinomio · *Nivel parcial*

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 5 · Raíces de \(s^{2} + 4 s + 13\) · *Básico*

**Enunciado.** Halla las raíces de \(s^{2} + 4 s + 13=0\) y di qué comportamiento producen como polos.

1. Discriminante \(\Delta = b^2-4c = 16-52=-36\).

   **¿Por qué?** El signo del discriminante decide si las raíces son reales distintas, repetidas o complejas.

2. \(s = \dfrac{-b \pm \sqrt{\Delta}}{2}\) da \(-2 - 3 j, -2 + 3 j\).

   **¿Por qué?** Es la fórmula cuadrática con coeficiente principal 1.

**Resultado.** Hay polos complejos \(-2{,}0\pm j3\): la parte real da el decaimiento \(e^{-2{,}0t}\) y la imaginaria la frecuencia de oscilación.

#### Ejemplo 6 · Raíces de \(s^{2} + 6 s + 9\) · *Básico*

**Enunciado.** Halla las raíces de \(s^{2} + 6 s + 9=0\) y di qué comportamiento producen como polos.

1. Discriminante \(\Delta = b^2-4c = 36-36=0\).

   **¿Por qué?** El signo del discriminante decide si las raíces son reales distintas, repetidas o complejas.

2. \(s = \dfrac{-b \pm \sqrt{\Delta}}{2}\) da \(-3\).

   **¿Por qué?** Es la fórmula cuadrática con coeficiente principal 1.

**Resultado.** Hay un polo doble: respuesta crítica, la más rápida sin oscilar.

#### Ejemplo 7 · Raíces de \(s^{2} + 2 s - 3\) · *Básico*

**Enunciado.** Halla las raíces de \(s^{2} + 2 s - 3=0\) y di qué comportamiento producen como polos.

1. Discriminante \(\Delta = b^2-4c = 4--12=16\).

   **¿Por qué?** El signo del discriminante decide si las raíces son reales distintas, repetidas o complejas.

2. \(s = \dfrac{-b \pm \sqrt{\Delta}}{2}\) da \(-3, 1\).

   **¿Por qué?** Es la fórmula cuadrática con coeficiente principal 1.

**Resultado.** Hay dos polos reales distintos: respuesta con dos exponenciales, sin oscilar; uno es positivo, así que el sistema sería **inestable**.

#### Ejemplo 8 · Raíces de \(s^{2} + \frac{4 s}{5} + 4\) · *Intermedio*

**Enunciado.** Halla las raíces de \(s^{2} + \frac{4 s}{5} + 4=0\) y di qué comportamiento producen como polos.

1. Discriminante \(\Delta = b^2-4c = \frac{16}{25}-16=- \frac{384}{25}\).

   **¿Por qué?** El signo del discriminante decide si las raíces son reales distintas, repetidas o complejas.

2. \(s = \dfrac{-b \pm \sqrt{\Delta}}{2}\) da \(- \frac{2}{5} - \frac{4 \sqrt{6} j}{5}, - \frac{2}{5} + \frac{4 \sqrt{6} j}{5}\).

   **¿Por qué?** Es la fórmula cuadrática con coeficiente principal 1.

**Resultado.** Hay polos complejos \(- \frac{2}{5}\pm j\frac{4 \sqrt{6}}{5}\): la parte real da el decaimiento \(e^{- \frac{2}{5}t}\) y la imaginaria la frecuencia de oscilación.

#### Práctica para resolver sola o solo

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

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el atajo del Ejemplo 3.

```python
# verificacion.py
from sympy import symbols, solve

s = symbols("s")
raices = solve(s ** 2 + 2 * s + 37, s)
print("raices:", raices)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `raices: [-1 - 6*I, -1 + 6*I]`, igual al \(s=-1\pm6j\) del Ejemplo 3 (atajo).

**Práctica:** cambia el polinomio a \(s^2+8s+41\) y vuelve a ejecutar. Resultado esperado: \(s=-4\pm5j\).

**Límite:** el atajo \(-b/2 \pm j\sqrt{c-b^2/4}\) solo aplica a polinomios de segundo orden con coeficiente 1 en \(s^2\); para orden 3 o mayor no existe una fórmula cerrada general y se recurre a factorización por inspección o métodos numéricos.

### Tema 4: Forma polar, fórmula de Euler y evaluación de G(jω)

**¿Por qué es importante?** Escribir un complejo como magnitud y ángulo convierte productos y cocientes en operaciones simples, y es exactamente lo que se hace al evaluar \(G(j\omega)\) en respuesta en frecuencia.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

La fórmula de Euler dice \(e^{j\theta} = \cos\theta + j\sin\theta\). Por eso todo complejo se puede escribir como \(z = r e^{j\theta} = r\angle\theta\), con \(r = |z|\) y \(\theta\) su ángulo.

**Qué ganamos:** al multiplicar dos complejos en polar se multiplican las magnitudes y se **suman** los ángulos; al dividir se dividen magnitudes y se **restan** ángulos. Esto es lo que hace manejable una función de transferencia evaluada en \(s = j\omega\).

**Receta para \(G(j\omega)\):** (1) cambia cada \(s\) por \(j\omega\); (2) calcula magnitud y ángulo de cada factor del numerador y del denominador; (3) magnitud total = producto de magnitudes de arriba / producto de magnitudes de abajo; (4) fase total = suma de ángulos de arriba − suma de ángulos de abajo.

**Error típico:** calcular el ángulo con \(\arctan(b/a)\) sin mirar el cuadrante. Un factor como \(-1 + j\) tiene 135°, no −45°.

#### Ejemplos resueltos

#### Ejemplo 1 · Magnitud y fase de \(G(s) = \frac{10}{s + 2}\) en \(\omega = 2\) · *Básico*

**Enunciado.** Calcula \(|G(j2)|\) y \(\angle G(j2)\).

1. Sustituye \(s = j2\): \(G(j2) = \frac{10}{j_{2} + 2}\).

   **¿Por qué?** Una entrada senoidal \(\sin\omega t\) "ve" al sistema evaluado en \(s = j\omega\).

2. Magnitud = |numerador| / |denominador| y fase = ángulo del numerador − ángulo del denominador.

   **¿Por qué?** En polar, dividir complejos divide magnitudes y resta ángulos (fórmula de Euler).

**Resultado.** \(|G| \approx 3{,}536\) (\(10{,}97\,\text{dB}\)) y \(\angle G \approx -45^\circ\).

**Comprobación.** Forma rectangular: \(G(j2) \approx 2{,}5-2{,}5j\).

#### Ejemplo 2 · Magnitud y fase de \(G(s) = \frac{5}{s + 1}\) en \(\omega = 1\) · *Básico*

**Enunciado.** Calcula \(|G(j1)|\) y \(\angle G(j1)\).

1. Sustituye \(s = j1\): \(G(j1) = \frac{5}{j_{1} + 1}\).

   **¿Por qué?** Una entrada senoidal \(\sin\omega t\) "ve" al sistema evaluado en \(s = j\omega\).

2. Magnitud = |numerador| / |denominador| y fase = ángulo del numerador − ángulo del denominador.

   **¿Por qué?** En polar, dividir complejos divide magnitudes y resta ángulos (fórmula de Euler).

**Resultado.** \(|G| \approx 3{,}536\) (\(10{,}97\,\text{dB}\)) y \(\angle G \approx -45^\circ\).

**Comprobación.** Forma rectangular: \(G(j1) \approx 2{,}5-2{,}5j\).

#### Ejemplo 3 · Magnitud y fase de \(G(s) = \frac{4}{s \left(s + 2\right)}\) en \(\omega = 2\) · *Intermedio*

**Enunciado.** Calcula \(|G(j2)|\) y \(\angle G(j2)\).

1. Sustituye \(s = j2\): \(G(j2) = \frac{4}{j_{2} \left(j_{2} + 2\right)}\).

   **¿Por qué?** Una entrada senoidal \(\sin\omega t\) "ve" al sistema evaluado en \(s = j\omega\).

2. Magnitud = |numerador| / |denominador| y fase = ángulo del numerador − ángulo del denominador.

   **¿Por qué?** En polar, dividir complejos divide magnitudes y resta ángulos (fórmula de Euler).

**Resultado.** \(|G| \approx 0{,}707\) (\(-3{,}01\,\text{dB}\)) y \(\angle G \approx -135^\circ\).

**Comprobación.** Forma rectangular: \(G(j2) \approx -0{,}5-0{,}5j\).

#### Ejemplo 4 · Magnitud y fase de \(G(s) = \frac{25}{s^{2} + 4 s + 25}\) en \(\omega = 5\) · *Intermedio*

**Enunciado.** Calcula \(|G(j5)|\) y \(\angle G(j5)\).

1. Sustituye \(s = j5\): \(G(j5) = \frac{25}{j_{5}^{2} + 4 j_{5} + 25}\).

   **¿Por qué?** Una entrada senoidal \(\sin\omega t\) "ve" al sistema evaluado en \(s = j\omega\).

2. Magnitud = |numerador| / |denominador| y fase = ángulo del numerador − ángulo del denominador.

   **¿Por qué?** En polar, dividir complejos divide magnitudes y resta ángulos (fórmula de Euler).

**Resultado.** \(|G| \approx 1{,}25\) (\(1{,}94\,\text{dB}\)) y \(\angle G \approx -90^\circ\).

**Comprobación.** Forma rectangular: \(G(j5) \approx 0-1{,}25j\).

#### Ejemplo 5 · Magnitud y fase de \(G(s) = \frac{s + 1}{s + 10}\) en \(\omega = 1\) · *Intermedio*

**Enunciado.** Calcula \(|G(j1)|\) y \(\angle G(j1)\).

1. Sustituye \(s = j1\): \(G(j1) = \frac{j_{1} + 1}{j_{1} + 10}\).

   **¿Por qué?** Una entrada senoidal \(\sin\omega t\) "ve" al sistema evaluado en \(s = j\omega\).

2. Magnitud = |numerador| / |denominador| y fase = ángulo del numerador − ángulo del denominador.

   **¿Por qué?** En polar, dividir complejos divide magnitudes y resta ángulos (fórmula de Euler).

**Resultado.** \(|G| \approx 0{,}141\) (\(-17{,}03\,\text{dB}\)) y \(\angle G \approx 39{,}3^\circ\).

**Comprobación.** Forma rectangular: \(G(j1) \approx 0{,}109+0{,}089j\).

#### Ejemplo 6 · Magnitud y fase de \(G(s) = \frac{100}{\left(s + 1\right) \left(s + 10\right)}\) en \(\omega = 3\) · *Avanzado*

**Enunciado.** Calcula \(|G(j3)|\) y \(\angle G(j3)\).

1. Sustituye \(s = j3\): \(G(j3) = \frac{100}{\left(j_{3} + 1\right) \left(j_{3} + 10\right)}\).

   **¿Por qué?** Una entrada senoidal \(\sin\omega t\) "ve" al sistema evaluado en \(s = j\omega\).

2. Magnitud = |numerador| / |denominador| y fase = ángulo del numerador − ángulo del denominador.

   **¿Por qué?** En polar, dividir complejos divide magnitudes y resta ángulos (fórmula de Euler).

**Resultado.** \(|G| \approx 3{,}029\) (\(9{,}63\,\text{dB}\)) y \(\angle G \approx -88{,}3^\circ\).

**Comprobación.** Forma rectangular: \(G(j3) \approx 0{,}092-3{,}028j\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1.

```python
# verificacion.py
from sympy import I, Abs, arg, deg, N

s = 2 * I
G = 10 / (s + 2)
print("magnitud:", N(Abs(G)))
print("fase_grados:", N(deg(arg(G))))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `magnitud: 3.53553390593274` y `fase_grados: -45.0000000000000`, igual al Ejemplo 1 (\(|G|\approx3{,}536\), \(\angle G\approx-45^\circ\)).

**Práctica:** evalúa \(G(s)=\dfrac{20}{s+5}\) en \(\omega=5\) modificando el script. Resultado esperado: magnitud ≈ 2,83 y fase ≈ −45°.

**Límite:** evaluar \(G(j\omega)\) para describir la respuesta en frecuencia en estado estacionario solo tiene sentido si \(G(s)\) es estable; con un polo en el semiplano derecho la salida no converge a una senoidal y la sustitución \(s=j\omega\) pierde su interpretación física.

