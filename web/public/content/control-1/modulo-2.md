# Módulo 2: Transformada de Laplace

Es la herramienta central del curso. Convierte funciones del tiempo en funciones de \(s\), y así las ecuaciones diferenciales se vuelven álgebra.

**Al terminar podrás:**

- Transformar las funciones típicas usando la tabla.
- Usar las propiedades: linealidad, desplazamiento, retardo, derivada e integral.
- Calcular el valor final de una salida sin resolverla completa.

## Aprende construyendo

### Tema 1: La idea

**¿Por qué es importante?** Laplace convierte ecuaciones diferenciales en álgebra; es la herramienta con la que se resuelve todo el curso.

> **Idea clave.** Laplace es un traductor: \(f(t)\) en el “idioma del tiempo” pasa a \(F(s)\) en el “idioma de \(s\)”. En el idioma de \(s\), derivar es multiplicar y integrar es dividir.

\[F(s) = \mathcal{L}\{f(t)\} = \int_0^{\infty} f(t)\,e^{-st}\,dt\]

*Casi nunca calcularás esta integral: usarás la tabla y las propiedades. Pero conviene saber de dónde salen.*

#### Ejemplo 1 · Calcular una transformada con la definición · *Básico*

**Enunciado.** Calcula \(\mathcal{L}\{e^{-2t}\}\) con la integral.

1. Escribe la definición con \(f(t) = e^{-2t}\).

   \[\int_0^\infty e^{-2t}e^{-st}\,dt\]

   **¿Por qué?** Es la única herramienta que tenemos antes de construir la tabla.

2. Junta las exponenciales: \(e^{-2t}e^{-st} = e^{-(s+2)t}\).

   **¿Por qué?** Al multiplicar potencias de la misma base se suman los exponentes. Así queda una sola exponencial, fácil de integrar.

3. Integra: \(\displaystyle\int_0^\infty e^{-(s+2)t}dt = \left[\frac{-e^{-(s+2)t}}{s+2}\right]_0^\infty\).

   **¿Por qué?** La integral de \(e^{-at}\) es \(-e^{-at}/a\).

4. Evalúa: en \(\infty\) vale 0, en 0 vale \(\dfrac{-1}{s+2}\). Resta: \(0 - \dfrac{-1}{s+2}\).

   **¿Por qué?** La exponencial con exponente negativo tiende a cero cuando \(t\to\infty\) (suponiendo \(s > -2\)).

**Resultado:** \(\dfrac{1}{s+2}\). En general, \(\mathcal{L}\{e^{-at}\} = \dfrac{1}{s+a}\)

### Tema 2: La tabla

**¿Por qué es importante?** La tabla es lo que usarás en cada examen para pasar del tiempo a \(s\) y de vuelta; entender cada fila evita errores de memoria.

| \(f(t)\) | \(F(s)\) | Nombre / uso |
|---|---|---|
| \(\delta(t)\) | \(1\) | Impulso: un golpe instantáneo |
| \(u(t)\) | \(\dfrac1s\) | Escalón: encender y dejar |
| \(t\) | \(\dfrac{1}{s^2}\) | Rampa |
| \(t^n\) | \(\dfrac{n!}{s^{n+1}}\) | Potencias |
| \(e^{-at}\) | \(\dfrac{1}{s+a}\) | Decaimiento (polo real) |
| \(t\,e^{-at}\) | \(\dfrac{1}{(s+a)^2}\) | Polo repetido |
| \(\sin\omega t\) | \(\dfrac{\omega}{s^2+\omega^2}\) | Oscilación |
| \(\cos\omega t\) | \(\dfrac{s}{s^2+\omega^2}\) | Oscilación |
| \(e^{-at}\sin\omega t\) | \(\dfrac{\omega}{(s+a)^2+\omega^2}\) | Oscilación amortiguada |
| \(e^{-at}\cos\omega t\) | \(\dfrac{s+a}{(s+a)^2+\omega^2}\) | Oscilación amortiguada |

#### Demostración de cada fila de la tabla

#### Demostración · Escalón: ℒ(u(t)) = 1/s

\(\displaystyle\int_0^\infty 1\cdot e^{-st}dt = \left[-\frac{e^{-st}}{s}\right]_0^\infty = 0 - \left(-\frac1s\right) = \frac1s\), válido si \(\operatorname{Re}(s)>0\) para que \(e^{-st}\to0\).

∎

#### Demostración · Rampa: ℒ(t) = 1/s² (integración por partes)

1. Por partes con \(u = t\), \(dv = e^{-st}dt\): \(du = dt\), \(v = -e^{-st}/s\).
2. \(\displaystyle\int_0^\infty te^{-st}dt = \left[-\frac{te^{-st}}{s}\right]_0^\infty + \frac1s\int_0^\infty e^{-st}dt\).
3. El corchete vale 0 en los dos extremos (la exponencial le gana a \(t\)). La integral que queda es \(1/s\). Total \(\dfrac{1}{s}\cdot\dfrac1s = \dfrac{1}{s^2}\).
4. Repitiendo por partes \(n\) veces: \(\mathcal{L}\{t^n\} = \dfrac{n}{s}\mathcal{L}\{t^{n-1}\} = \dfrac{n!}{s^{n+1}}\).

∎

#### Demostración · Seno y coseno (con Euler, capítulo 2)

1. Con la misma cuenta del Ejemplo 1: \(\mathcal{L}\{e^{j\omega t}\} = \dfrac{1}{s-j\omega}\) y \(\mathcal{L}\{e^{-j\omega t}\} = \dfrac{1}{s+j\omega}\).
2. Seno:

   \[\mathcal{L}\{\sin\omega t\} = \frac{1}{2j}\left(\frac{1}{s-j\omega} - \frac{1}{s+j\omega}\right) = \frac{1}{2j}\cdot\frac{2j\omega}{s^2+\omega^2} = \frac{\omega}{s^2+\omega^2}\]

    (la resta de fracciones da \((s+j\omega)-(s-j\omega) = 2j\omega\) arriba y \(s^2+\omega^2\) abajo).
3. Coseno:

   \[\mathcal{L}\{\cos\omega t\} = \frac12\left(\frac{1}{s-j\omega} + \frac{1}{s+j\omega}\right) = \frac12\cdot\frac{2s}{s^2+\omega^2} = \frac{s}{s^2+\omega^2}\]

∎

#### Demostración · Impulso: ℒ(δ(t)) = 1

1. El impulso es el límite de un pulso de ancho \(\varepsilon\) y altura \(1/\varepsilon\) (área 1) cuando \(\varepsilon\to0\).
2. Transformada del pulso: \(\displaystyle\int_0^\varepsilon \frac1\varepsilon e^{-st}dt = \frac{1-e^{-\varepsilon s}}{\varepsilon s}\).
3. Cuando \(\varepsilon\to0\) es una forma 0/0. Por L'Hôpital en \(\varepsilon\): \(\dfrac{s\,e^{-\varepsilon s}}{s}\to 1\).

∎

### Tema 3: Propiedades

**¿Por qué es importante?** Las propiedades (derivada, desplazamiento, retardo) explican por qué una función de transferencia tiene la forma que tiene.

| Propiedad | En el tiempo | En \(s\) |
|---|---|---|
| Linealidad | \(a f(t) + b g(t)\) | \(aF(s)+bG(s)\) |
| Derivada | \(\dfrac{df}{dt}\) | \(sF(s) - f(0)\) |
| Segunda derivada | \(\dfrac{d^2f}{dt^2}\) | \(s^2F(s) - sf(0) - f'(0)\) |
| Integral | \(\int_0^t f\,d\tau\) | \(\dfrac{F(s)}{s}\) |
| Desplazamiento en \(s\) | \(e^{-at}f(t)\) | \(F(s+a)\) |
| Retardo | \(f(t-T)\,u(t-T)\) | \(e^{-Ts}F(s)\) |
| Multiplicar por \(t\) | \(t\,f(t)\) | \(-\dfrac{dF}{ds}\) |

#### Demostración de cada propiedad

#### Demostración · Linealidad

La integral de una suma es la suma de integrales y las constantes salen: \(\int(af+bg)e^{-st} = a\int fe^{-st} + b\int ge^{-st}\).

∎

#### Demostración · Derivada: ℒ(f') = sF(s) - f(0)

1. Por partes con \(u = e^{-st}\), \(dv = f'(t)dt\): \(du = -se^{-st}dt\), \(v = f(t)\).
2. \(\displaystyle\int_0^\infty f'e^{-st}dt = \left[f(t)e^{-st}\right]_0^\infty + s\int_0^\infty f e^{-st}dt = (0 - f(0)) + sF(s)\).
3. Aplicándola dos veces: \(\mathcal{L}\{f''\} = s\,\mathcal{L}\{f'\} - f'(0) = s^2F - sf(0) - f'(0)\).

**Por qué importa:** derivar en el tiempo es multiplicar por \(s\). Es lo que convierte ecuaciones diferenciales en álgebra.

∎

#### Demostración · Integral: ℒ(∫ f) = F(s)/s

Llama \(g(t) = \int_0^t f(\tau)d\tau\). Entonces \(g' = f\) y \(g(0) = 0\). Por la propiedad de la derivada: \(F = sG - 0\), así que \(G = F/s\).

∎

#### Demostración · Desplazamiento en s: ℒ(e^-atf) = F(s+a)

\(\displaystyle\int_0^\infty e^{-at}f(t)e^{-st}dt = \int_0^\infty f(t)e^{-(s+a)t}dt\). Es la definición de \(F\) evaluada en \(s+a\).

∎

#### Demostración · Retardo: ℒ(f(t-T)u(t-T)) = e^-TsF(s)

1. Antes de \(T\) la función vale cero: \(\displaystyle\int_T^\infty f(t-T)e^{-st}dt\).
2. Cambio de variable \(\tau = t-T\) (\(t = \tau+T\), \(dt = d\tau\); cuando \(t=T\), \(\tau=0\)): \(\displaystyle\int_0^\infty f(\tau)e^{-s(\tau+T)}d\tau = e^{-sT}\int_0^\infty f(\tau)e^{-s\tau}d\tau\).

∎

#### Demostración · Multiplicar por t: ℒ(tf) = -dF/ds

Deriva la definición respecto a \(s\): \(\dfrac{dF}{ds} = \displaystyle\int_0^\infty f(t)\frac{\partial}{\partial s}e^{-st}dt = \int_0^\infty -t\,f(t)e^{-st}dt = -\mathcal{L}\{tf\}\).

∎

> **Desplazamiento en s:** multiplicar por \(e^{-at}\) en el tiempo equivale a cambiar cada \(s\) por \(s+a\). Por eso \(\sin\omega t \to \dfrac{\omega}{s^2+\omega^2}\) se vuelve \(e^{-at}\sin\omega t \to \dfrac{\omega}{(s+a)^2+\omega^2}\).

#### Ejemplo 2 · Una constante · *Básico*

**Enunciado.** Transforma \(f(t) = 5\) (para \(t \ge 0\)).

1. Escribe \(5 = 5\cdot u(t)\).

   **¿Por qué?** Una constante que empieza en \(t=0\) es un escalón multiplicado por esa constante.

2. Usa la tabla, \(u(t)\to\dfrac1s\), y saca el 5 por linealidad.

   **¿Por qué?** Linealidad: las constantes salen de la transformada.

**Resultado:** \(\dfrac{5}{s}\)

#### Ejemplo 3 · Suma de términos · *Básico*

> **Qué cambia respecto al anterior:** Varios términos a la vez.

**Enunciado.** Transforma \(f(t) = 3 + 2t - 5e^{-2t}\).

1. Separa en tres términos y transforma cada uno.

   **¿Por qué?** Linealidad: la transformada de una suma es la suma de las transformadas.

2. \(3 \to \dfrac3s\) (Ejemplo 2); \(2t \to \dfrac{2}{s^2}\) (rampa por 2); \(5e^{-2t} \to \dfrac{5}{s+2}\) (Ejemplo 1 por 5).

   **¿Por qué?** Cada uno es una fila de la tabla multiplicada por una constante.

**Resultado:** \(\dfrac3s + \dfrac{2}{s^2} - \dfrac{5}{s+2}\)

#### Ejemplo 4 · Un seno · *Básico*

> **Qué cambia respecto al anterior:** Una función nueva de la tabla: el seno.

**Enunciado.** Transforma \(f(t) = \sin 3t\).

1. Identifica \(\omega = 3\) (el número que multiplica a \(t\)).

   **¿Por qué?** La tabla dice \(\sin\omega t \to \dfrac{\omega}{s^2+\omega^2}\).

2. Reemplaza: \(\dfrac{3}{s^2+9}\).

   **¿Por qué?** Arriba va \(\omega = 3\) y abajo \(\omega^2 = 9\).

**Resultado:** \(\dfrac{3}{s^2+9}\)

#### Ejemplo 5 · Seno multiplicado por exponencial · *Intermedio*

> **Qué cambia respecto al anterior:** Se agrega \(e^{-2t}\), que solo desplaza la \(s\).

**Enunciado.** Transforma \(f(t) = e^{-2t}\sin 3t\).

1. Empieza por la parte sin exponencial: \(\sin 3t \to \dfrac{3}{s^2+9}\).

   **¿Por qué?** Es el Ejemplo 4.

2. El factor \(e^{-2t}\) desplaza: cambia cada \(s\) por \(s+2\).

   \[\frac{3}{(s+2)^2+9}\]

   **¿Por qué?** Propiedad de desplazamiento en \(s\) (demostrada arriba): \(e^{-at}f(t) \to F(s+a)\).

**Resultado:** \(\dfrac{3}{(s+2)^2+9}\)

> Este es el tipo de término que aparece en todos los sistemas de segundo orden: una oscilación que se apaga.

#### Ejemplo 6 · Coseno amortiguado con constante · *Intermedio*

> **Qué cambia respecto al anterior:** Ahora es un coseno y hay una constante delante.

**Enunciado.** Transforma \(g(t) = 2e^{-t}\cos 5t\).

1. \(\cos 5t \to \dfrac{s}{s^2+25}\).

   **¿Por qué?** Tabla del coseno con \(\omega = 5\). Arriba va \(s\), no \(\omega\).

2. Desplaza con \(e^{-t}\): cada \(s\) pasa a \(s+1\), también la de arriba.

   \[\frac{s+1}{(s+1)^2+25}\]

   **¿Por qué?** El desplazamiento se aplica a toda la función, numerador incluido.

3. Multiplica por 2.

   **¿Por qué?** Linealidad.

**Resultado:** \(\dfrac{2(s+1)}{(s+1)^2+25}\)

#### Ejemplo 7 · Retardo · *Intermedio*

> **Qué cambia respecto al anterior:** La función empieza tarde.

**Enunciado.** Transforma (a) un escalón que se enciende en \(t=2\) y (b) una rampa que empieza en \(t=1\).

1. (a) Se escribe \(u(t-2)\). Sin retardo sería \(\dfrac1s\); el retardo multiplica por \(e^{-2s}\).

   **¿Por qué?** Propiedad del retardo: \(f(t-T)u(t-T) \to e^{-Ts}F(s)\), con \(T = 2\).

2. (b) La rampa retrasada es \((t-1)u(t-1)\). Sin retardo, \(\dfrac{1}{s^2}\); con retardo, \(\dfrac{e^{-s}}{s^2}\).

   **¿Por qué?** La función tiene que estar escrita con \((t-1)\) adentro. \(t\,u(t-1)\) sería otra función (una rampa que salta de golpe a 1).

**Resultado:** (a) \(\dfrac{e^{-2s}}{s}\); (b) \(\dfrac{e^{-s}}{s^2}\)

#### Ejemplo 8 · Multiplicar por t · *Intermedio*

> **Qué cambia respecto al anterior:** Aparece una \(t\) multiplicando.

**Enunciado.** Transforma \(f(t) = t\,e^{-4t}\).

1. Sin la \(t\): \(e^{-4t} \to \dfrac{1}{s+4}\).

   **¿Por qué?** Tabla.

2. La \(t\) delante significa derivar respecto a \(s\) y cambiar el signo.

   \[-\frac{d}{ds}(s+4)^{-1} = -(-1)(s+4)^{-2} = \frac{1}{(s+4)^2}\]

   **¿Por qué?** Propiedad “multiplicar por \(t\)”: \(tf(t) \to -\dfrac{dF}{ds}\).

**Resultado:** \(\dfrac{1}{(s+4)^2}\): un polo repetido

### Tema 4: Valor final y valor inicial

**¿Por qué es importante?** El valor final te dice a dónde llega un sistema sin resolverlo completo, y saber cuándo no aplica evita respuestas falsas.

\[y(\infty) = \lim_{s\to0} s\,Y(s) \qquad\qquad y(0^+) = \lim_{s\to\infty} s\,Y(s)\]

*El valor final solo vale si el sistema es estable: todos los polos de \(sY(s)\) en el semiplano izquierdo.*

#### Demostración del teorema del valor final

1. Parte de la propiedad de la derivada: \(\displaystyle\int_0^\infty y'(t)e^{-st}dt = sY(s) - y(0)\).
2. Toma el límite \(s\to0\): la exponencial vale 1 y queda \(\displaystyle\int_0^\infty y'(t)dt = \lim_{s\to0}sY(s) - y(0)\).
3. La integral de una derivada es la diferencia de extremos: \(y(\infty) - y(0)\).
4. Igualando: \(y(\infty) - y(0) = \lim_{s\to0}sY - y(0)\), así que \(y(\infty) = \lim_{s\to0}sY(s)\).

El paso 2 exige que \(y(\infty)\) exista. Por eso el sistema debe ser estable. El valor inicial sale igual con \(s\to\infty\): la exponencial anula la integral y queda \(0 = \lim sY - y(0^+)\).

∎

#### Ejemplo 9 · Valor final de primer orden · *Básico*

**Enunciado.** \(G(s) = \dfrac{10}{s+2}\) recibe un escalón unitario. ¿A dónde llega la salida?

1. Escribe la salida: \(Y(s) = G(s)\cdot\dfrac1s = \dfrac{10}{s(s+2)}\).

   **¿Por qué?** La salida en Laplace es la función de transferencia por la entrada, y el escalón unitario es \(1/s\).

2. Multiplica por \(s\): \(sY(s) = \dfrac{10}{s+2}\).

   **¿Por qué?** El teorema pide \(sY(s)\). La \(s\) se cancela con la del escalón.

3. Toma el límite \(s \to 0\): \(\dfrac{10}{0+2} = 5\).

   **¿Por qué?** El teorema dice que ese límite es el valor final. Antes hay que revisar que el polo (\(-2\)) esté a la izquierda: sí.

**Resultado:** La salida llega a 5

#### Ejemplo 10 · Valor final e inicial de segundo orden · *Nivel parcial*

> **Qué cambia respecto al anterior:** Segundo orden y además se pide el valor inicial.

**Enunciado.** \(G(s) = \dfrac{2s+8}{s^2+3s+4}\) con escalón unitario. ¿Dónde empieza y dónde termina la salida?

1. \(sY(s) = \dfrac{2s+8}{s^2+3s+4}\).

   **¿Por qué?** Igual que en el Ejemplo 9.

2. Verifica estabilidad: raíces de \(s^2+3s+4\): \(\Delta = 9-16 < 0\), parte real \(-3/2\). Estable.

   **¿Por qué?** El teorema del valor final solo vale si el sistema es estable (lo pide la demostración).

3. Final, \(s\to0\): \(\dfrac{0+8}{0+0+4} = 2\).

   **¿Por qué?** Se reemplaza \(s = 0\).

4. Inicial, \(s\to\infty\): solo importan los términos de mayor grado, \(\dfrac{2s}{s^2} = \dfrac2s \to 0\).

   **¿Por qué?** Cuando \(s\) es enorme, \(s^2\) le gana a todo lo demás.

**Resultado:** Arranca en 0 y termina en 2

> Atajo: ante escalón unitario, el valor final siempre es \(G(0)\).

#### Ejemplo 11 · Cuándo no se puede usar · *Intermedio*

> **Qué cambia respecto al anterior:** Mismo cálculo, pero el sistema es inestable.

**Enunciado.** ¿Se puede usar el teorema con \(Y(s) = \dfrac{1}{s(s-2)}\)?

1. \(sY = \dfrac{1}{s-2}\): tiene un polo en \(+2\).

   **¿Por qué?** Un polo positivo da \(e^{2t}\), que crece sin límite.

2. Si aplicaras la fórmula darías \(\dfrac{1}{0-2} = -\tfrac12\), un número que no significa nada.

   **¿Por qué?** La demostración supone que \(y(\infty)\) existe. Aquí no existe.

**Resultado:** No se puede: la salida crece sin límite

#### Errores comunes

- Usar \(\dfrac{1}{s^2+\omega^2}\) para el seno: falta \(\omega\) en el numerador.
- Aplicar el retardo sin reescribir en \((t-T)\).
- Usar el valor final en un sistema inestable.

### Tema 5: Práctica

**¿Por qué es importante?** Transformar con soltura es el requisito para todos los capítulos siguientes.

- **1.**Transforma \(4 - 3e^{-5t}\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac4s - \dfrac{3}{s+5}\).
  
  </details>

- **2.**Transforma \(e^{-2t}\sin 3t\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{3}{(s+2)^2+9}\).
  
  </details>

- **3.**Transforma \(5\,u(t-3)\).
  
  <details><summary>Respuesta</summary>
  
  \(\dfrac{5e^{-3s}}{s}\).
  
  </details>

- **4.**Valor final de la salida de \(G = \dfrac{12}{s^2+5s+4}\) ante escalón de amplitud 2.
  
  <details><summary>Respuesta</summary>
  
  \(2\cdot G(0) = 2\cdot\dfrac{12}{4} = 6\).
  
  </details>
