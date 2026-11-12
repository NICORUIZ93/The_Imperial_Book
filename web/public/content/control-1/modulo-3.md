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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 4 · Polos reales distintos: \(\frac{10}{\left(s + 1\right) \left(s + 4\right)}\) · *Básico*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{10}{\left(s + 1\right) \left(s + 4\right)}\).

1. Factoriza el denominador: \(\left(s + 1\right) \left(s + 4\right)\). Polos: \(-1, -4\).

   **¿Por qué?** Son reales y distintos, así que hay una fracción con constante por cada polo (caso 1).

2. Coeficiente de \(\tfrac{1}{s + 1}\): tapa \((s + 1)\) y evalúa lo que queda en \(s=-1\): \(\frac{10}{s + 4}\big|_{s=-1} = \frac{10}{3}\).

   **¿Por qué?** \(s=-1\) es el valor que anula el factor tapado; los demás términos se hacen cero.

3. Coeficiente de \(\tfrac{1}{s + 4}\): tapa \((s + 4)\) y evalúa lo que queda en \(s=-4\): \(\frac{10}{s + 1}\big|_{s=-4} = - \frac{10}{3}\).

   **¿Por qué?** \(s=-4\) es el valor que anula el factor tapado; los demás términos se hacen cero.

4. Queda \(\frac{10}{\left(s + 1\right) \left(s + 4\right)} = \frac{10}{3 \left(s + 1\right)} + - \frac{10}{3 \left(s + 4\right)}\); con la tabla, \(\tfrac{A}{s+a}\to Ae^{-at}\).

   **¿Por qué?** Cada fracción es una exponencial; el polo en \(s=0\) da una constante.

**Resultado.** \(y(t) = \frac{\left(10 e^{3 t} - 10\right) e^{- 4 t}}{3}\).

**Comprobación.** \(y(0) = 0\) y el valor inicial \(\lim_{s\to\infty}sY(s) = 0\) coinciden.

#### Ejemplo 5 · Polos reales distintos: \(\frac{s + 5}{s \left(s + 2\right) \left(s + 3\right)}\) · *Intermedio*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{s + 5}{s \left(s + 2\right) \left(s + 3\right)}\).

1. Factoriza el denominador: \(s \left(s + 2\right) \left(s + 3\right)\). Polos: \(0, -2, -3\).

   **¿Por qué?** Son reales y distintos, así que hay una fracción con constante por cada polo (caso 1).

2. Coeficiente de \(\tfrac{1}{s}\): tapa \((s)\) y evalúa lo que queda en \(s=0\): \(\frac{s + 5}{\left(s + 2\right) \left(s + 3\right)}\big|_{s=0} = \frac{5}{6}\).

   **¿Por qué?** \(s=0\) es el valor que anula el factor tapado; los demás términos se hacen cero.

3. Coeficiente de \(\tfrac{1}{s + 2}\): tapa \((s + 2)\) y evalúa lo que queda en \(s=-2\): \(\frac{s + 5}{s \left(s + 3\right)}\big|_{s=-2} = - \frac{3}{2}\).

   **¿Por qué?** \(s=-2\) es el valor que anula el factor tapado; los demás términos se hacen cero.

4. Coeficiente de \(\tfrac{1}{s + 3}\): tapa \((s + 3)\) y evalúa lo que queda en \(s=-3\): \(\frac{s + 5}{s \left(s + 2\right)}\big|_{s=-3} = \frac{2}{3}\).

   **¿Por qué?** \(s=-3\) es el valor que anula el factor tapado; los demás términos se hacen cero.

5. Queda \(\frac{s + 5}{s \left(s + 2\right) \left(s + 3\right)} = \frac{5}{6 s} + - \frac{3}{2 \left(s + 2\right)} + \frac{2}{3 \left(s + 3\right)}\); con la tabla, \(\tfrac{A}{s+a}\to Ae^{-at}\).

   **¿Por qué?** Cada fracción es una exponencial; el polo en \(s=0\) da una constante.

**Resultado.** \(y(t) = \frac{\left(5 e^{3 t} - 9 e^{t} + 4\right) e^{- 3 t}}{6}\).

**Comprobación.** \(y(0) = 0\) y el valor inicial \(\lim_{s\to\infty}sY(s) = 0\) coinciden.

#### Ejemplo 6 · Polos reales distintos: \(\frac{4}{s^{2} + 5 s + 4}\) · *Básico*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{4}{s^{2} + 5 s + 4}\).

1. Factoriza el denominador: \(\left(s + 1\right) \left(s + 4\right)\). Polos: \(-1, -4\).

   **¿Por qué?** Son reales y distintos, así que hay una fracción con constante por cada polo (caso 1).

2. Coeficiente de \(\tfrac{1}{s + 1}\): tapa \((s + 1)\) y evalúa lo que queda en \(s=-1\): \(\frac{4}{s + 4}\big|_{s=-1} = \frac{4}{3}\).

   **¿Por qué?** \(s=-1\) es el valor que anula el factor tapado; los demás términos se hacen cero.

3. Coeficiente de \(\tfrac{1}{s + 4}\): tapa \((s + 4)\) y evalúa lo que queda en \(s=-4\): \(\frac{4}{s + 1}\big|_{s=-4} = - \frac{4}{3}\).

   **¿Por qué?** \(s=-4\) es el valor que anula el factor tapado; los demás términos se hacen cero.

4. Queda \(\frac{4}{s^{2} + 5 s + 4} = \frac{4}{3 \left(s + 1\right)} + - \frac{4}{3 \left(s + 4\right)}\); con la tabla, \(\tfrac{A}{s+a}\to Ae^{-at}\).

   **¿Por qué?** Cada fracción es una exponencial; el polo en \(s=0\) da una constante.

**Resultado.** \(y(t) = \frac{\left(4 e^{3 t} - 4\right) e^{- 4 t}}{3}\).

**Comprobación.** \(y(0) = 0\) y el valor inicial \(\lim_{s\to\infty}sY(s) = 0\) coinciden.

#### Ejemplo 7 · Polos reales distintos: \(\frac{2 s + 1}{s \left(s + 1\right)}\) · *Básico*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{2 s + 1}{s \left(s + 1\right)}\).

1. Factoriza el denominador: \(s \left(s + 1\right)\). Polos: \(0, -1\).

   **¿Por qué?** Son reales y distintos, así que hay una fracción con constante por cada polo (caso 1).

2. Coeficiente de \(\tfrac{1}{s}\): tapa \((s)\) y evalúa lo que queda en \(s=0\): \(\frac{2 s + 1}{s + 1}\big|_{s=0} = 1\).

   **¿Por qué?** \(s=0\) es el valor que anula el factor tapado; los demás términos se hacen cero.

3. Coeficiente de \(\tfrac{1}{s + 1}\): tapa \((s + 1)\) y evalúa lo que queda en \(s=-1\): \(2 + \frac{1}{s}\big|_{s=-1} = 1\).

   **¿Por qué?** \(s=-1\) es el valor que anula el factor tapado; los demás términos se hacen cero.

4. Queda \(\frac{2 s + 1}{s \left(s + 1\right)} = \frac{1}{s} + \frac{1}{s + 1}\); con la tabla, \(\tfrac{A}{s+a}\to Ae^{-at}\).

   **¿Por qué?** Cada fracción es una exponencial; el polo en \(s=0\) da una constante.

**Resultado.** \(y(t) = 1 + e^{- t}\).

**Comprobación.** \(y(0) = 2\) y el valor inicial \(\lim_{s\to\infty}sY(s) = 2\) coinciden.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 con fracciones parciales simbólicas.

```python
# verificacion.py
from sympy import symbols, apart

s = symbols("s")
Y = 6 / (s * (s + 3))
print("fracciones:", apart(Y))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `fracciones: -2/(s + 3) + 2/s`, igual a \(A=2\), \(B=-2\) del Ejemplo 1. El orden de los sumandos puede variar.

**Práctica:** cambia `Y` por \(\dfrac{10}{(s+1)(s+4)}\) y confirma los coeficientes del Ejemplo 4.

**Límite:** `apart` solo separa factores reales distintos tal cual están escritos; si el denominador tiene un factor cuadrático irreducible (polos complejos, Tema 3) no lo descompone en seno/coseno — hay que completar el cuadrado a mano.

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

#### Ejemplo 1 · Polo repetido · *Intermedio*

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · Polo repetido: \(\frac{1}{s \left(s + 1\right)^{2}}\) · *Intermedio*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{1}{s \left(s + 1\right)^{2}}\).

1. Polos: \(-1\ (\text{multiplicidad } 2)\), \(0\).

   **¿Por qué?** Un polo de multiplicidad \(k\) necesita \(k\) fracciones: una por cada potencia del factor, de 1 hasta \(k\).

2. Plantea y resuelve los coeficientes (tapado para la potencia más alta; derivando o igualando coeficientes para las otras): \(\frac{1}{s \left(s + 1\right)^{2}} = - \frac{1}{s + 1} - \frac{1}{\left(s + 1\right)^{2}} + \frac{1}{s}\).

   **¿Por qué?** El tapado solo da el coeficiente de la potencia más alta; los otros salen de derivar o de comparar coeficientes.

3. Tabla: \(\tfrac{1}{(s+a)^2}\to te^{-at}\) y \(\tfrac{2}{(s+a)^3}\to t^2e^{-at}\).

   **¿Por qué?** La potencia del factor repetido se convierte en potencia de \(t\) (propiedad de multiplicar por \(t\)).

**Resultado.** \(y(t) = \left(- t + e^{t} - 1\right) e^{- t}\).

**Comprobación.** \(y(0) = 0\), igual al valor inicial \(0\).

#### Ejemplo 3 · Polo repetido: \(\frac{s + 3}{\left(s + 1\right)^{2}}\) · *Básico*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{s + 3}{\left(s + 1\right)^{2}}\).

1. Polos: \(-1\ (\text{multiplicidad } 2)\).

   **¿Por qué?** Un polo de multiplicidad \(k\) necesita \(k\) fracciones: una por cada potencia del factor, de 1 hasta \(k\).

2. Plantea y resuelve los coeficientes (tapado para la potencia más alta; derivando o igualando coeficientes para las otras): \(\frac{s + 3}{\left(s + 1\right)^{2}} = \frac{1}{s + 1} + \frac{2}{\left(s + 1\right)^{2}}\).

   **¿Por qué?** El tapado solo da el coeficiente de la potencia más alta; los otros salen de derivar o de comparar coeficientes.

3. Tabla: \(\tfrac{1}{(s+a)^2}\to te^{-at}\) y \(\tfrac{2}{(s+a)^3}\to t^2e^{-at}\).

   **¿Por qué?** La potencia del factor repetido se convierte en potencia de \(t\) (propiedad de multiplicar por \(t\)).

**Resultado.** \(y(t) = \left(2 t + 1\right) e^{- t}\).

**Comprobación.** \(y(0) = 1\), igual al valor inicial \(1\).

#### Ejemplo 4 · Polo repetido: \(\frac{4}{s^{2} \left(s + 2\right)}\) · *Intermedio*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{4}{s^{2} \left(s + 2\right)}\).

1. Polos: \(-2\), \(0\ (\text{multiplicidad } 2)\).

   **¿Por qué?** Un polo de multiplicidad \(k\) necesita \(k\) fracciones: una por cada potencia del factor, de 1 hasta \(k\).

2. Plantea y resuelve los coeficientes (tapado para la potencia más alta; derivando o igualando coeficientes para las otras): \(\frac{4}{s^{2} \left(s + 2\right)} = \frac{1}{s + 2} - \frac{1}{s} + \frac{2}{s^{2}}\).

   **¿Por qué?** El tapado solo da el coeficiente de la potencia más alta; los otros salen de derivar o de comparar coeficientes.

3. Tabla: \(\tfrac{1}{(s+a)^2}\to te^{-at}\) y \(\tfrac{2}{(s+a)^3}\to t^2e^{-at}\).

   **¿Por qué?** La potencia del factor repetido se convierte en potencia de \(t\) (propiedad de multiplicar por \(t\)).

**Resultado.** \(y(t) = 2 t - 1 + e^{- 2 t}\).

**Comprobación.** \(y(0) = 0\), igual al valor inicial \(0\).

#### Ejemplo 5 · Polo repetido: \(\frac{9}{s \left(s + 3\right)^{2}}\) · *Intermedio*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{9}{s \left(s + 3\right)^{2}}\).

1. Polos: \(-3\ (\text{multiplicidad } 2)\), \(0\).

   **¿Por qué?** Un polo de multiplicidad \(k\) necesita \(k\) fracciones: una por cada potencia del factor, de 1 hasta \(k\).

2. Plantea y resuelve los coeficientes (tapado para la potencia más alta; derivando o igualando coeficientes para las otras): \(\frac{9}{s \left(s + 3\right)^{2}} = - \frac{1}{s + 3} - \frac{3}{\left(s + 3\right)^{2}} + \frac{1}{s}\).

   **¿Por qué?** El tapado solo da el coeficiente de la potencia más alta; los otros salen de derivar o de comparar coeficientes.

3. Tabla: \(\tfrac{1}{(s+a)^2}\to te^{-at}\) y \(\tfrac{2}{(s+a)^3}\to t^2e^{-at}\).

   **¿Por qué?** La potencia del factor repetido se convierte en potencia de \(t\) (propiedad de multiplicar por \(t\)).

**Resultado.** \(y(t) = \left(- 3 t + e^{3 t} - 1\right) e^{- 3 t}\).

**Comprobación.** \(y(0) = 0\), igual al valor inicial \(0\).

#### Ejemplo 6 · Polo repetido: \(\frac{2}{\left(s + 2\right)^{3}}\) · *Básico*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{2}{\left(s + 2\right)^{3}}\).

1. Polos: \(-2\ (\text{multiplicidad } 3)\).

   **¿Por qué?** Un polo de multiplicidad \(k\) necesita \(k\) fracciones: una por cada potencia del factor, de 1 hasta \(k\).

2. Plantea y resuelve los coeficientes (tapado para la potencia más alta; derivando o igualando coeficientes para las otras): \(\frac{2}{\left(s + 2\right)^{3}} = \frac{2}{\left(s + 2\right)^{3}}\).

   **¿Por qué?** El tapado solo da el coeficiente de la potencia más alta; los otros salen de derivar o de comparar coeficientes.

3. Tabla: \(\tfrac{1}{(s+a)^2}\to te^{-at}\) y \(\tfrac{2}{(s+a)^3}\to t^2e^{-at}\).

   **¿Por qué?** La potencia del factor repetido se convierte en potencia de \(t\) (propiedad de multiplicar por \(t\)).

**Resultado.** \(y(t) = t^{2} e^{- 2 t}\).

**Comprobación.** \(y(0) = 0\), igual al valor inicial \(0\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 (polo repetido).

```python
# verificacion.py
from sympy import symbols, apart

s = symbols("s")
Y = 1 / (s * (s + 1) ** 2)
print("fracciones:", apart(Y))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `fracciones: -1/(s + 1) - 1/(s + 1)**2 + 1/s`, igual a \(A=1\), \(B=-1\), \(C=-1\) del Ejemplo 1. El orden de los sumandos puede variar.

**Práctica:** cambia `Y` por \(\dfrac{4}{s^2(s+2)}\) y confirma los coeficientes del Ejemplo 4.

**Límite:** el coeficiente \(B\) de la potencia más baja sale de derivar lo que queda tras tapar; con multiplicidad 3 o más hay que derivar varias veces y dividir por el factorial correspondiente, no solo una vez.

### Tema 3: Caso 3: polos complejos (completar el cuadrado)

**¿Por qué es importante?** Completar el cuadrado es exactamente lo que pedía el punto 3 del Parcial 1 y la base de la respuesta de segundo orden.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

Si el factor \(s^2+bs+c\) tiene raíces complejas, no lo partas con números complejos. Escríbelo como \((s+a)^2+\omega^2\) y ajusta el numerador para que coincida con las formas seno y coseno de la tabla.

**Procedimiento**

1. Completa el cuadrado: \(s^2+bs+c = (s+a)^2+\omega^2\), con \(a = b/2\) y \(\omega = \sqrt{c-a^2}\).
2. Reescribe el numerador como \(\alpha(s+a) + \beta\).
3. La parte \(\alpha(s+a)\) da coseno: \(\alpha e^{-at}\cos\omega t\).
4. La parte \(\beta\) da seno, después de multiplicar y dividir por \(\omega\): \(\dfrac{\beta}{\omega}e^{-at}\sin\omega t\).

#### Demostración · por qué no hace falta trabajar con complejos

Con fracciones complejas tendrías \(\dfrac{M}{s+a-j\omega} + \dfrac{\bar M}{s+a+j\omega}\) (los residuos de polos conjugados son conjugados). En el tiempo eso da \(Me^{(-a+j\omega)t} + \bar Me^{(-a-j\omega)t} = 2\operatorname{Re}\{Me^{(-a+j\omega)t}\}\). Con \(M = m_r + jm_i\) y Euler sale \(2e^{-at}(m_r\cos\omega t - m_i\sin\omega t)\): siempre una combinación real de seno y coseno amortiguados. Completar el cuadrado llega al mismo resultado sin pasar por complejos.

∎

#### Ejemplo 1 · Seno puro · *Básico*

**Enunciado.** Inversa de \(\dfrac{6}{s^2+9}\).

1. Compara con \(\dfrac{\omega}{s^2+\omega^2}\): \(\omega^2 = 9\), así que \(\omega = 3\).

   **¿Por qué?** Es la forma del seno.

2. El numerador debería ser 3 y es 6: escribe \(6 = 2\cdot3\).

   **¿Por qué?** Para usar la tabla, el numerador tiene que ser exactamente \(\omega\).

3. \(2\cdot\dfrac{3}{s^2+9} \to 2\sin3t\).

   **¿Por qué?** Linealidad.

**Resultado:** \(y(t) = 2\sin3t\)

#### Ejemplo 2 · Seno amortiguado (completar el cuadrado) · *Básico*

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

#### Ejemplo 3 · Seno y coseno juntos · *Intermedio*

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

#### Ejemplo 4 · Escalón en un sistema de segundo orden · *Nivel parcial*

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 5 · Polos complejos: \(\frac{5}{s^{2} + 2 s + 5}\) · *Básico*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{5}{s^{2} + 2 s + 5}\).

1. El discriminante \(2^2-4\cdot5 = -16\) es negativo: polos complejos. Completa el cuadrado: \(s^{2} + 2 s + 5 = (s+1)^2 + 4\).

   **¿Por qué?** Con polos complejos no se parte en factores reales; se escribe el denominador como \((s+a)^2+\omega^2\) para usar las filas de seno y coseno amortiguados.

2. Reescribe el numerador en términos de \((s+1)\): \(5 = 5\).

   **¿Por qué?** El coseno amortiguado necesita \((s+a)\) arriba y el seno amortiguado necesita \(\omega\) arriba; por eso se reorganiza el numerador así.

3. Multiplica y divide el término constante por \(\omega = 2\): \(0\tfrac{s+1}{(s+1)^2+4} + \frac{5}{2}\tfrac{2}{(s+1)^2+4}\).

   **¿Por qué?** Así cada pieza coincide exactamente con una fila de la tabla.

**Resultado.** \(y(t) = \frac{5 e^{- t} \sin{\left(2 t \right)}}{2}\): oscila a \(2\,\text{rad/s}\) y se apaga como \(e^{-1t}\).

**Comprobación.** \(y(0) = 0\), igual a \(\lim_{s\to\infty}sY(s) = 0\).

#### Ejemplo 6 · Polos complejos: \(\frac{s + 3}{s^{2} + 4 s + 13}\) · *Intermedio*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{s + 3}{s^{2} + 4 s + 13}\).

1. El discriminante \(4^2-4\cdot13 = -36\) es negativo: polos complejos. Completa el cuadrado: \(s^{2} + 4 s + 13 = (s+2)^2 + 9\).

   **¿Por qué?** Con polos complejos no se parte en factores reales; se escribe el denominador como \((s+a)^2+\omega^2\) para usar las filas de seno y coseno amortiguados.

2. Reescribe el numerador en términos de \((s+2)\): \(s + 3 = 1(s+2) + 1\).

   **¿Por qué?** El coseno amortiguado necesita \((s+a)\) arriba y el seno amortiguado necesita \(\omega\) arriba; por eso se reorganiza el numerador así.

3. Multiplica y divide el término constante por \(\omega = 3\): \(1\tfrac{s+2}{(s+2)^2+9} + \frac{1}{3}\tfrac{3}{(s+2)^2+9}\).

   **¿Por qué?** Así cada pieza coincide exactamente con una fila de la tabla.

**Resultado.** \(y(t) = \left(\frac{\sin{\left(3 t \right)}}{3} + \cos{\left(3 t \right)}\right) e^{- 2 t}\): oscila a \(3\,\text{rad/s}\) y se apaga como \(e^{-2t}\).

**Comprobación.** \(y(0) = 1\), igual a \(\lim_{s\to\infty}sY(s) = 1\).

#### Ejemplo 7 · Polos complejos: \(\frac{2 s + 1}{s^{2} + 6 s + 25}\) · *Intermedio*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{2 s + 1}{s^{2} + 6 s + 25}\).

1. El discriminante \(6^2-4\cdot25 = -64\) es negativo: polos complejos. Completa el cuadrado: \(s^{2} + 6 s + 25 = (s+3)^2 + 16\).

   **¿Por qué?** Con polos complejos no se parte en factores reales; se escribe el denominador como \((s+a)^2+\omega^2\) para usar las filas de seno y coseno amortiguados.

2. Reescribe el numerador en términos de \((s+3)\): \(2 s + 1 = 2(s+3) + -5\).

   **¿Por qué?** El coseno amortiguado necesita \((s+a)\) arriba y el seno amortiguado necesita \(\omega\) arriba; por eso se reorganiza el numerador así.

3. Multiplica y divide el término constante por \(\omega = 4\): \(2\tfrac{s+3}{(s+3)^2+16} + - \frac{5}{4}\tfrac{4}{(s+3)^2+16}\).

   **¿Por qué?** Así cada pieza coincide exactamente con una fila de la tabla.

**Resultado.** \(y(t) = \frac{\left(- 5 \sin{\left(4 t \right)} + 8 \cos{\left(4 t \right)}\right) e^{- 3 t}}{4}\): oscila a \(4\,\text{rad/s}\) y se apaga como \(e^{-3t}\).

**Comprobación.** \(y(0) = 2\), igual a \(\lim_{s\to\infty}sY(s) = 2\).

#### Ejemplo 8 · Escalón en un sistema con polos complejos · *Avanzado*

**Enunciado.** Halla \(y(t)\) si \(Y(s) = \frac{10}{s \left(s^{2} + 2 s + 10\right)}\) (respuesta al escalón).

1. Plantea \(\tfrac{A}{s} + \tfrac{Bs+C}{s^2+2s+10}\). Tapado en \(s=0\): \(A = \tfrac{10}{10} = 1\).

   **¿Por qué?** El polo real se resuelve con tapado y el par complejo necesita un numerador de primer grado.

2. Igualando coeficientes: \(B=-1,\ C=-2\), es decir \(- \frac{s + 2}{s^{2} + 2 s + 10} + \frac{1}{s}\).

   **¿Por qué?** Se multiplica todo por el denominador común y se comparan potencias de \(s\).

3. Completa el cuadrado \(s^2+2s+10 = (s+1)^2+9\) y reescribe \(-(s+2) = -(s+1) - \tfrac13\cdot3\).

   **¿Por qué?** Para tener coseno y seno amortiguados.

**Resultado.** \(y(t) = \left(e^{t} - \frac{\sin{\left(3 t \right)}}{3} - \cos{\left(3 t \right)}\right) e^{- t}\).

**Comprobación.** \(y(0)=0\) y \(y(\infty)=1\) (valor final \(\lim sY = 1\)).

#### Práctica para resolver sola o solo

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

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar que completar el cuadrado del Ejemplo 2 es correcto.

```python
# verificacion.py
from sympy import symbols, expand

s = symbols("s")
completado = expand((s + 1) ** 2 + 36)
print("completado:", completado)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `completado: s**2 + 2*s + 37`, igual al denominador original del Ejemplo 2.

**Práctica:** completa el cuadrado de \(s^2+4s+13\) a mano, confirma con el script (`(s + 2) ** 2 + 9`) y verifica que expande de vuelta a `s**2 + 4*s + 13`.

**Límite:** completar el cuadrado solo aplica a un factor cuadrático; si el denominador tiene un factor cúbico o mayor con raíces complejas, se necesita descomposición en fracciones parciales de orden superior o un cambio de variable distinto.

### Tema 4: Resolver una ecuación diferencial completa

**¿Por qué es importante?** Es el uso más directo de todo el capítulo: transformar, despejar, partir en fracciones e invertir. Así se resuelve cualquier sistema lineal con entrada y condiciones iniciales.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

El procedimiento siempre es el mismo:

1. **Transforma** la ecuación completa: las derivadas con \(\mathcal{L}\{y'\} = sY - y(0)\) y \(\mathcal{L}\{y''\} = s^2Y - sy(0) - y'(0)\); la entrada con la tabla.

2. **Despeja** \(Y(s)\). Quedará una fracción cuyo denominador tiene los polos del sistema y los polos de la entrada.

3. **Parte en fracciones** (caso 1, 2 o 3 según los factores).

4. **Invierte** con la tabla y **comprueba** \(y(0)\) y, si existe, \(y(\infty)\).

Los polos del sistema producen la parte transitoria (la que se apaga si el sistema es estable) y los polos de la entrada producen la parte forzada (la que queda).

#### Ejemplos resueltos

#### Ejemplo 1 · Resolver \(y'+2y=4\) · *Básico*

**Enunciado.** Resuelve \(y'+2y = 4 u(t)\) con \(y(0)=0\).

1. Transforma cada término con la propiedad de la derivada y la entrada con la tabla.

   **¿Por qué?** Así la ecuación diferencial se vuelve una ecuación algebraica en \(Y(s)\).

2. Despeja: \(Y(s) = \frac{4}{s \left(s + 2\right)}\).

   **¿Por qué?** Las condiciones iniciales quedan en el numerador; la entrada aporta sus propios polos.

3. Fracciones parciales: \(- \frac{2}{s + 2} + \frac{2}{s}\).

   **¿Por qué?** Así cada pieza está en la tabla.

**Resultado.** \(y(t) = 2 - 2 e^{- 2 t}\).

**Comprobación.** \(y(0) = 0\) coincide con la condición inicial.

#### Ejemplo 2 · Resolver \(y''+5y'+6y=6\) · *Intermedio*

**Enunciado.** Resuelve \(y''+5y'+6y = 6 u(t)\) con \(y(0)=0, y'(0)=0\).

1. Transforma cada término con la propiedad de la derivada y la entrada con la tabla.

   **¿Por qué?** Así la ecuación diferencial se vuelve una ecuación algebraica en \(Y(s)\).

2. Despeja: \(Y(s) = \frac{6}{s \left(s^{2} + 5 s + 6\right)}\).

   **¿Por qué?** Las condiciones iniciales quedan en el numerador; la entrada aporta sus propios polos.

3. Fracciones parciales: \(\frac{2}{s + 3} - \frac{3}{s + 2} + \frac{1}{s}\).

   **¿Por qué?** Así cada pieza está en la tabla.

**Resultado.** \(y(t) = 1 - 3 e^{- 2 t} + 2 e^{- 3 t}\).

**Comprobación.** \(y(0) = 0\) coincide con la condición inicial.

#### Ejemplo 3 · Resolver \(y''+2y'+5y=0\) · *Intermedio*

**Enunciado.** Resuelve \(y''+2y'+5y = 0\) con \(y(0)=1, y'(0)=0\).

1. Transforma cada término con la propiedad de la derivada y la entrada con la tabla.

   **¿Por qué?** Así la ecuación diferencial se vuelve una ecuación algebraica en \(Y(s)\).

2. Despeja: \(Y(s) = \frac{s + 2}{s^{2} + 2 s + 5}\).

   **¿Por qué?** Las condiciones iniciales quedan en el numerador; la entrada aporta sus propios polos.

3. Fracciones parciales: \(\frac{s + 2}{s^{2} + 2 s + 5}\).

   **¿Por qué?** Así cada pieza está en la tabla.

**Resultado.** \(y(t) = \left(\frac{\sin{\left(2 t \right)}}{2} + \cos{\left(2 t \right)}\right) e^{- t}\).

**Comprobación.** \(y(0) = 1\) coincide con la condición inicial.

#### Ejemplo 4 · Resolver \(y''+4y=8\) · *Intermedio*

**Enunciado.** Resuelve \(y''+4y = 8 u(t)\) con \(y(0)=0, y'(0)=0\).

1. Transforma cada término con la propiedad de la derivada y la entrada con la tabla.

   **¿Por qué?** Así la ecuación diferencial se vuelve una ecuación algebraica en \(Y(s)\).

2. Despeja: \(Y(s) = \frac{8}{s \left(s^{2} + 4\right)}\).

   **¿Por qué?** Las condiciones iniciales quedan en el numerador; la entrada aporta sus propios polos.

3. Fracciones parciales: \(- \frac{2 s}{s^{2} + 4} + \frac{2}{s}\).

   **¿Por qué?** Así cada pieza está en la tabla.

**Resultado.** \(y(t) = 4 \sin^{2}{\left(t \right)}\).

**Comprobación.** \(y(0) = 0\) coincide con la condición inicial.

#### Ejemplo 5 · Resolver \(y'+3y=e^{- t}\) · *Avanzado*

**Enunciado.** Resuelve \(y'+3y = e^{- t}\) con \(y(0)=2\).

1. Transforma cada término con la propiedad de la derivada y la entrada con la tabla.

   **¿Por qué?** Así la ecuación diferencial se vuelve una ecuación algebraica en \(Y(s)\).

2. Despeja: \(Y(s) = \frac{2 s + 3}{\left(s + 1\right) \left(s + 3\right)}\).

   **¿Por qué?** Las condiciones iniciales quedan en el numerador; la entrada aporta sus propios polos.

3. Fracciones parciales: \(\frac{3}{2 \left(s + 3\right)} + \frac{1}{2 \left(s + 1\right)}\).

   **¿Por qué?** Así cada pieza está en la tabla.

**Resultado.** \(y(t) = \frac{\left(e^{2 t} + 3\right) e^{- 3 t}}{2}\).

**Comprobación.** \(y(0) = 2\) coincide con la condición inicial.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 resolviendo la EDO directamente.

```python
# verificacion.py
from sympy import symbols, Function, dsolve, Eq, Derivative

t = symbols("t")
y = Function("y")
sol = dsolve(Eq(Derivative(y(t), t) + 2 * y(t), 4), y(t), ics={y(0): 0})
print("y(t):", sol)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `y(t): Eq(y(t), 2 - 2*exp(-2*t))`, igual al Ejemplo 1.

**Práctica:** cambia la ecuación y las condiciones iniciales para resolver \(y''+4y=8\) con \(y(0)=0,\ y'(0)=0\) (usa `Derivative(y(t), t, 2)`) y confirma el Ejemplo 4.

**Límite:** `dsolve` resuelve la ecuación completa de un tirón; en el examen debes mostrar el camino (transformar, despejar, partir en fracciones, invertir) paso a paso, no solo el resultado final.

