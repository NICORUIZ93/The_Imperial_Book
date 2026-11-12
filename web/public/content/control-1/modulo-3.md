# Módulo 3: Transformada inversa

Para saber cómo se comporta la salida en el tiempo hay que volver de \(Y(s)\) a \(y(t)\). Casi siempre \(Y(s)\) no está en la tabla tal cual: hay que partirla.

**Al terminar podrás:**

- Descomponer en fracciones parciales con polos reales distintos y repetidos.
- Manejar polos complejos completando el cuadrado.
- Combinar las dos técnicas, como en la respuesta al escalón de segundo orden.

## Aprende construyendo

### Tema 1: Caso 1: polos reales distintos

**¿Por qué es importante?** Casi ninguna salida \(Y(s)\) está en la tabla tal cual; partirla en fracciones es la forma de volver al tiempo.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

Si el denominador se factoriza en factores distintos \((s+a)(s+b)\cdots\), cada factor aporta una fracción con una constante arriba:

\[\frac{N(s)}{(s+a)(s+b)} = \frac{A}{s+a} + \frac{B}{s+b}\]

**Método del “tapado” (residuos)**

1. Para hallar \(A\): tapa el factor \((s+a)\) en la fracción original.
2. Evalúa lo que queda en \(s = -a\) (el valor que hace cero ese factor).
3. Repite para cada factor y usa la tabla: \(\dfrac{A}{s+a} \to A e^{-at}\).

#### Demostración · por qué funciona el tapado

1. Parte de la igualdad \(\dfrac{N(s)}{(s+a)(s+b)} = \dfrac{A}{s+a} + \dfrac{B}{s+b}\).
2. Multiplica ambos lados por \((s+a)\): \(\dfrac{N(s)}{s+b} = A + \dfrac{B(s+a)}{s+b}\).
3. Evalúa en \(s=-a\): el último término se anula porque tiene el factor \((s+a)\). Queda \(A = \left.\dfrac{N(s)}{s+b}\right|_{s=-a}\).
4. “Tapar” el factor y evaluar es hacer estos dos pasos de un golpe.

∎

#### Ejemplo 1 · Dos factores, numerador constante · *Básico*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \dfrac{6}{s(s+3)}\).

1. Plantea \(\dfrac{6}{s(s+3)} = \dfrac{A}{s} + \dfrac{B}{s+3}\).

   **¿Por qué?** \(\dfrac{6}{s(s+3)}\) no está en la tabla, pero \(\dfrac1s\) y \(\dfrac{1}{s+3}\) sí. Lo partimos en esas piezas.

2. \(A\): tapa la \(s\) y evalúa lo que queda en \(s = 0\): \(\dfrac{6}{0+3} = 2\).

   **¿Por qué?** \(s = 0\) es el valor que anula el factor tapado (demostración del tapado).

3. \(B\): tapa \((s+3)\) y evalúa en \(s = -3\): \(\dfrac{6}{-3} = -2\).

   **¿Por qué?** \(s = -3\) anula \((s+3)\).

4. Tabla: \(\dfrac2s \to 2\) y \(\dfrac{-2}{s+3} \to -2e^{-3t}\).

   **¿Por qué?** Cada pieza sí está en la tabla.

5. Comprueba \(y(0) = 2 - 2 = 0\).

   **¿Por qué?** Un sistema que parte del reposo debe empezar en 0 ante un escalón. Si no da 0, hay un error.

**Resultado:** \(y(t) = 2 - 2e^{-3t} = 2(1-e^{-3t})\)

#### Ejemplo 2 · Numerador con s · *Básico*

> **Qué cambia respecto al anterior:** El numerador ahora tiene \(s\).

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \dfrac{s+5}{(s+1)(s+3)}\).

1. \(\dfrac{A}{s+1} + \dfrac{B}{s+3}\).

   **¿Por qué?** Dos factores distintos, dos fracciones.

2. \(A\): tapa \((s+1)\), evalúa en \(s=-1\): \(\dfrac{-1+5}{-1+3} = \dfrac42 = 2\).

   **¿Por qué?** Ahora el numerador también se evalúa, porque tiene \(s\).

3. \(B\): tapa \((s+3)\), evalúa en \(s=-3\): \(\dfrac{-3+5}{-3+1} = \dfrac{2}{-2} = -1\).

   **¿Por qué?** Mismo método.

**Resultado:** \(y(t) = 2e^{-t} - e^{-3t}\)

#### Ejemplo 3 · Tres factores · *Intermedio*

> **Qué cambia respecto al anterior:** Tres factores en lugar de dos. El método no cambia.

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \dfrac{10}{s(s+2)(s+5)}\).

1. \(\dfrac{A}{s} + \dfrac{B}{s+2} + \dfrac{C}{s+5}\).

   **¿Por qué?** Tres factores distintos, tres fracciones.

2. \(A\) en \(s=0\): \(\dfrac{10}{(2)(5)} = 1\).

   **¿Por qué?** Al tapar \(s\) quedan \((s+2)(s+5)\), que en 0 valen 2 y 5.

3. \(B\) en \(s=-2\): \(\dfrac{10}{(-2)(-2+5)} = \dfrac{10}{-6} = -\dfrac53\).

   **¿Por qué?** Al tapar \((s+2)\) quedan \(s\) y \((s+5)\).

4. \(C\) en \(s=-5\): \(\dfrac{10}{(-5)(-5+2)} = \dfrac{10}{15} = \dfrac23\).

   **¿Por qué?** Al tapar \((s+5)\) quedan \(s\) y \((s+2)\).

5. Comprueba \(y(0) = 1 - \tfrac53 + \tfrac23 = 0\).

   **¿Por qué?** Igual que en el Ejemplo 1.

**Resultado:** \(y(t) = 1 - \tfrac53e^{-2t} + \tfrac23e^{-5t}\)

### Tema 2: Caso 2: polos repetidos

**¿Por qué es importante?** Los polos repetidos aparecen en los sistemas críticamente amortiguados y necesitan un tratamiento distinto.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

Un factor \((s+a)^2\) aporta dos fracciones:

\[\frac{N(s)}{(s+a)^2} \to \frac{B}{s+a} + \frac{C}{(s+a)^2} \qquad\text{y}\qquad \frac{C}{(s+a)^2} \to C\,t\,e^{-at}\]

*\(C\) se halla tapando \((s+a)^2\) completo. \(B\) es la derivada de lo que queda, evaluada en \(s=-a\).*

#### Demostración · polos repetidos

1. Llama \(R(s)\) a todo lo que no es \((s+a)^2\): \(\dfrac{R(s)}{(s+a)^2} = \dfrac{B}{s+a} + \dfrac{C}{(s+a)^2} + \text{(otros)}\).
2. Multiplica todo por \((s+a)^2\): \(R(s) = B(s+a) + C + (s+a)^2\cdot\text{(otros)}\).
3. En \(s=-a\): \(R(-a) = C\).
4. Deriva respecto a \(s\): \(R'(s) = B + \left[(s+a)^2\cdot\text{(otros)}\right]'\). El corchete derivado todavía tiene un factor \((s+a)\), así que en \(s=-a\): \(R'(-a) = B\).
5. La transformada \(\dfrac{1}{(s+a)^2} \to te^{-at}\) sale de la propiedad “multiplicar por \(t\)” de capítulo 3.

∎

#### Ejemplo 4 · Polo repetido · *Intermedio*

> **Qué cambia respecto al anterior:** Ahora hay un factor repetido.

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \dfrac{1}{s(s+1)^2}\).

1. Plantea \(\dfrac{A}{s} + \dfrac{B}{s+1} + \dfrac{C}{(s+1)^2}\).

   **¿Por qué?** Un factor al cuadrado necesita dos fracciones: una con potencia 1 y otra con potencia 2.

2. \(A\) en \(s=0\): \(\dfrac{1}{(0+1)^2} = 1\).

   **¿Por qué?** Tapado normal.

3. \(C\): tapa todo \((s+1)^2\), queda \(\dfrac1s\); en \(s=-1\): \(C = -1\).

   **¿Por qué?** La potencia más alta se halla tapando el factor completo.

4. \(B\): deriva lo que quedó, \(\dfrac{d}{ds}\dfrac1s = -\dfrac{1}{s^2}\); en \(s=-1\): \(B = -1\).

   **¿Por qué?** Así lo demuestra la sección 3.2: la derivada separa el coeficiente de la potencia 1.

5. Tabla: \(\dfrac{1}{(s+1)^2} \to te^{-t}\).

   **¿Por qué?** Capítulo 3, Ejemplo 8.

**Resultado:** \(y(t) = 1 - e^{-t} - te^{-t}\)

#### Caso 3: polos complejos (completar el cuadrado)

Si el factor \(s^2+bs+c\) tiene raíces complejas, no lo partas con números complejos. Escríbelo como \((s+a)^2+\omega^2\) y ajusta el numerador para que coincida con las formas seno y coseno de la tabla.

**Procedimiento**

1. Completa el cuadrado: \(s^2+bs+c = (s+a)^2+\omega^2\), con \(a = b/2\) y \(\omega = \sqrt{c-a^2}\).
2. Reescribe el numerador como \(\alpha(s+a) + \beta\).
3. La parte \(\alpha(s+a)\) da coseno: \(\alpha e^{-at}\cos\omega t\).
4. La parte \(\beta\) da seno, después de multiplicar y dividir por \(\omega\): \(\dfrac{\beta}{\omega}e^{-at}\sin\omega t\).

#### Demostración · por qué no hace falta trabajar con complejos

Con fracciones complejas tendrías \(\dfrac{M}{s+a-j\omega} + \dfrac{\bar M}{s+a+j\omega}\) (los residuos de polos conjugados son conjugados). En el tiempo eso da \(Me^{(-a+j\omega)t} + \bar Me^{(-a-j\omega)t} = 2\operatorname{Re}\{Me^{(-a+j\omega)t}\}\). Con \(M = m_r + jm_i\) y Euler sale \(2e^{-at}(m_r\cos\omega t - m_i\sin\omega t)\): siempre una combinación real de seno y coseno amortiguados. Completar el cuadrado llega al mismo resultado sin pasar por complejos.

∎

#### Ejemplo 5 · Seno puro · *Básico*

**Enunciado.** Inversa de \(\dfrac{6}{s^2+9}\).

1. Compara con \(\dfrac{\omega}{s^2+\omega^2}\): \(\omega^2 = 9\), así que \(\omega = 3\).

   **¿Por qué?** Es la forma del seno.

2. El numerador debería ser 3 y es 6: escribe \(6 = 2\cdot3\).

   **¿Por qué?** Para usar la tabla, el numerador tiene que ser exactamente \(\omega\).

3. \(2\cdot\dfrac{3}{s^2+9} \to 2\sin3t\).

   **¿Por qué?** Linealidad.

**Resultado:** \(y(t) = 2\sin3t\)

#### Ejemplo 6 · Seno amortiguado (completar el cuadrado) · *Básico*

> **Qué cambia respecto al anterior:** El denominador tiene un término en \(s\): hay que completar el cuadrado.

**Enunciado.** Inversa de \(\dfrac{370}{s^2+2s+37}\) (punto 3.ii del Parcial 1).

1. El denominador tiene término en \(s\), así que no es \(s^2+\omega^2\). Completa el cuadrado: \(s^2+2s+37 = (s+1)^2 + 36\).

   **¿Por qué?** Con el término \(2s\) no podemos usar la tabla del seno directamente. Completar el cuadrado lo deja como \((s+a)^2+\omega^2\), que sí está en la tabla.

2. Lee \(a = 1\) y \(\omega = \sqrt{36} = 6\).

   **¿Por qué?** Comparando con \(\dfrac{\omega}{(s+a)^2+\omega^2}\).

3. Haz que el numerador sea 6: \(370 = \dfrac{370}{6}\cdot6\).

   **¿Por qué?** Mismo ajuste del Ejemplo 5.

4. \(\dfrac{370}{6}\cdot\dfrac{6}{(s+1)^2+36} \to \dfrac{370}{6}e^{-t}\sin6t\).

   **¿Por qué?** Tabla del seno amortiguado.

**Resultado:** \(y(t) = 61{,}67\,e^{-t}\sin6t\)

#### Ejemplo 7 · Seno y coseno juntos · *Intermedio*

> **Qué cambia respecto al anterior:** El numerador tiene \(s\): aparecen seno y coseno.

**Enunciado.** Inversa de \(\dfrac{s+3}{s^2+2s+5}\).

1. Completa: \(s^2+2s+5 = (s+1)^2+4\). Entonces \(a=1\), \(\omega=2\).

   **¿Por qué?** Como en el Ejemplo 6.

2. El numerador \(s+3\) tiene \(s\). Escríbelo con \((s+1)\): \(s+3 = (s+1)+2\).

   **¿Por qué?** La tabla del coseno necesita exactamente \((s+a)\) arriba. Lo que sobra va al seno.

3. Separa: \(\dfrac{s+1}{(s+1)^2+4} + \dfrac{2}{(s+1)^2+4}\).

   **¿Por qué?** Una fracción para cada forma de la tabla.

4. Primera → \(e^{-t}\cos2t\). Segunda: el numerador ya es \(\omega = 2\) → \(e^{-t}\sin2t\).

   **¿Por qué?** Tabla.

**Resultado:** \(y(t) = e^{-t}(\cos2t + \sin2t)\)

#### Ejemplo 8 · Escalón en un sistema de segundo orden · *Nivel parcial*

> **Qué cambia respecto al anterior:** Se combina el Ejemplo 1 (polo en cero) con el Ejemplo 7 (polos complejos).

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \dfrac{5}{s(s^2+2s+5)}\).

1. Separa el polo en cero: \(\dfrac{A}{s} + \text{(resto)}\). \(A = \dfrac{5}{0+0+5} = 1\).

   **¿Por qué?** El \(s\) solo viene del escalón; se trata con el tapado normal.

2. Resto \(= Y - \dfrac1s = \dfrac{5 - (s^2+2s+5)}{s(s^2+2s+5)} = \dfrac{-s^2-2s}{s(s^2+2s+5)} = \dfrac{-(s+2)}{s^2+2s+5}\).

   **¿Por qué?** Restar \(A/s\) deja solo la parte de segundo orden. Al simplificar, la \(s\) se cancela.

3. Completa: \((s+1)^2+4\), y \(s+2 = (s+1)+1\).

   **¿Por qué?** Igual que en el Ejemplo 7.

4. \(-\dfrac{s+1}{(\ldots)} \to -e^{-t}\cos2t\); \(-\dfrac{1}{(\ldots)} = -\dfrac12\cdot\dfrac{2}{(\ldots)} \to -\tfrac12e^{-t}\sin2t\).

   **¿Por qué?** Para el seno el numerador debe ser \(\omega = 2\), así que se multiplica y divide por 2.

5. Comprueba \(y(0) = 1 - 1 - 0 = 0\).

   **¿Por qué?** Parte del reposo.

**Resultado:** \(y(t) = 1 - e^{-t}\left(\cos2t + \tfrac12\sin2t\right)\)

> Esta forma, \(1 - e^{-\sigma t}(\cos\omega_dt + \tfrac{\sigma}{\omega_d}\sin\omega_dt)\), es la respuesta general al escalón de segundo orden (capítulo 13).

#### Errores comunes

- Olvidar la fracción \(A/s\) cuando la entrada es un escalón.
- En el caso complejo, poner \(\omega\) en vez de dividir por \(\omega\) el término del seno.
- No comprobar \(y(0) = 0\): es una forma rápida de detectar errores de signo.

#### Práctica

- **1.**Inversa de \(\dfrac{6}{s(s+3)}\).
  
  <details><summary>Respuesta</summary>
  
  \(2 - 2e^{-3t}\).
  
  </details>

- **2.**Inversa de \(\dfrac{4}{(s+1)(s+5)}\).
  
  <details><summary>Respuesta</summary>
  
  \(A = 4/4 = 1\), \(B = 4/(-4) = -1\): \(e^{-t} - e^{-5t}\).
  
  </details>

- **3.**Inversa de \(\dfrac{9}{s(s+3)^2}\).
  
  <details><summary>Respuesta</summary>
  
  \(1 - e^{-3t} - 3t\,e^{-3t}\).
  
  </details>

- **4.**Inversa de \(\dfrac{20}{s^2+4s+20}\).
  
  <details><summary>Respuesta</summary>
  
  \((s+2)^2+16\): \(\dfrac{20}{4}e^{-2t}\sin 4t = 5e^{-2t}\sin4t\).
  
  </details>
