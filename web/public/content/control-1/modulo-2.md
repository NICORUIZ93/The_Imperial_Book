# Módulo 2: Transformada de Laplace

Es la herramienta central del curso. Convierte funciones del tiempo en funciones de \(s\), y así las ecuaciones diferenciales se vuelven álgebra.

**Al terminar podrás:**

- Transformar las funciones típicas usando la tabla.
- Usar las propiedades: linealidad, desplazamiento, retardo, derivada e integral.
- Calcular el valor final de una salida sin resolverla completa.

## Aprende construyendo

### Tema 1: La idea

**¿Por qué es importante?** Laplace convierte ecuaciones diferenciales en álgebra; es la herramienta con la que se resuelve todo el curso.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 2 · \(\mathcal{L}\{1\}\) con la definición · *Básico*

**Enunciado.** Calcula la transformada de \(f(t) = 1\) usando \(F(s)=\int_0^\infty f(t)e^{-st}dt\).

1. Escribe \(F(s) = \int_0^\infty 1\,e^{-st}\,dt\).

   **¿Por qué?** La definición multiplica la señal por \(e^{-st}\) y suma (integra) desde \(t=0\).

2. Resuelve: la integral de \(e^{-st}\) desde 0 hasta ∞.

   **¿Por qué?** Es la única operación necesaria; \(e^{-st}\to0\) cuando \(t\to\infty\) si \(s\) es suficientemente grande.

**Resultado.** \(F(s) = \frac{1}{s}\).

**Comprobación.** sympy da \(\frac{1}{s}\), igual a la tabla.

#### Ejemplo 3 · \(\mathcal{L}\{e^{- 3 t}\}\) con la definición · *Básico*

**Enunciado.** Calcula la transformada de \(f(t) = e^{- 3 t}\) usando \(F(s)=\int_0^\infty f(t)e^{-st}dt\).

1. Escribe \(F(s) = \int_0^\infty e^{- 3 t}\,e^{-st}\,dt\).

   **¿Por qué?** La definición multiplica la señal por \(e^{-st}\) y suma (integra) desde \(t=0\).

2. Resuelve: se combinan los exponentes.

   **¿Por qué?** Es la única operación necesaria; \(e^{-st}\to0\) cuando \(t\to\infty\) si \(s\) es suficientemente grande.

**Resultado.** \(F(s) = \frac{1}{s + 3}\).

**Comprobación.** sympy da \(\frac{1}{s + 3}\), igual a la tabla.

#### Ejemplo 4 · \(\mathcal{L}\{t\}\) con la definición · *Intermedio*

**Enunciado.** Calcula la transformada de \(f(t) = t\) usando \(F(s)=\int_0^\infty f(t)e^{-st}dt\).

1. Escribe \(F(s) = \int_0^\infty t\,e^{-st}\,dt\).

   **¿Por qué?** La definición multiplica la señal por \(e^{-st}\) y suma (integra) desde \(t=0\).

2. Resuelve: integración por partes.

   **¿Por qué?** Es la única operación necesaria; \(e^{-st}\to0\) cuando \(t\to\infty\) si \(s\) es suficientemente grande.

**Resultado.** \(F(s) = \frac{1}{s^{2}}\).

**Comprobación.** sympy da \(\frac{1}{s^{2}}\), igual a la tabla.

#### Ejemplo 5 · \(\mathcal{L}\{5 e^{2 t}\}\) con la definición · *Intermedio*

**Enunciado.** Calcula la transformada de \(f(t) = 5 e^{2 t}\) usando \(F(s)=\int_0^\infty f(t)e^{-st}dt\).

1. Escribe \(F(s) = \int_0^\infty 5 e^{2 t}\,e^{-st}\,dt\).

   **¿Por qué?** La definición multiplica la señal por \(e^{-st}\) y suma (integra) desde \(t=0\).

2. Resuelve: la integral converge solo si \(s>2\).

   **¿Por qué?** Es la única operación necesaria; \(e^{-st}\to0\) cuando \(t\to\infty\) si \(s\) es suficientemente grande.

**Resultado.** \(F(s) = \frac{5}{s - 2}\).

**Comprobación.** sympy da \(\frac{5}{s - 2}\), igual a la tabla.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 con la transformada de Laplace de sympy.

```python
# verificacion.py
from sympy import symbols, exp, laplace_transform

t, s = symbols("t s", positive=True)
F, _, _ = laplace_transform(exp(-2 * t), t, s)
print("F(s):", F)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `F(s): 1/(s + 2)`, igual al \(\dfrac{1}{s+2}\) calculado a mano en el Ejemplo 1.

**Práctica:** cambia `exp(-2 * t)` por `t**2` y vuelve a ejecutar. Resultado esperado: `2/s**3`.

**Límite:** la integral de la definición solo converge para \(s\) mayor que cierto valor (aquí \(s>-2\)); por eso la tabla y sus propiedades existen, para no repetir esa integral (y su análisis de convergencia) en cada ejercicio.

### Tema 2: La tabla

**¿Por qué es importante?** La tabla es lo que usarás en cada examen para pasar del tiempo a \(s\) y de vuelta; entender cada fila evita errores de memoria.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Transformada de \(3 e^{- 2 t}\) con la tabla · *Básico*

**Enunciado.** Halla \(\mathcal{L}\{3 e^{- 2 t}\}\).

1. Busca cada término en la tabla: \(3 e^{- 2 t}\to \frac{3}{s + 2}\).

   **¿Por qué?** Cada fila de la tabla está demostrada en este capítulo; aquí solo se aplica.

**Resultado.** \(F(s) = \frac{3}{s + 2}\).

#### Ejemplo 2 · Transformada de \(4 \sin{\left(5 t \right)}\) con la tabla · *Básico*

**Enunciado.** Halla \(\mathcal{L}\{4 \sin{\left(5 t \right)}\}\).

1. Busca cada término en la tabla: \(4 \sin{\left(5 t \right)}\to \frac{20}{s^{2} + 25}\).

   **¿Por qué?** Cada fila de la tabla está demostrada en este capítulo; aquí solo se aplica.

**Resultado.** \(F(s) = \frac{20}{s^{2} + 25}\).

#### Ejemplo 3 · Transformada de \(2 \cos{\left(3 t \right)}\) con la tabla · *Básico*

**Enunciado.** Halla \(\mathcal{L}\{2 \cos{\left(3 t \right)}\}\).

1. Busca cada término en la tabla: \(2 \cos{\left(3 t \right)}\to \frac{2 s}{s^{2} + 9}\).

   **¿Por qué?** Cada fila de la tabla está demostrada en este capítulo; aquí solo se aplica.

**Resultado.** \(F(s) = \frac{2 s}{s^{2} + 9}\).

#### Ejemplo 4 · Transformada de \(t^{2}\) con la tabla · *Básico*

**Enunciado.** Halla \(\mathcal{L}\{t^{2}\}\).

1. Busca cada término en la tabla: \(t^{2}\to \frac{2}{s^{3}}\).

   **¿Por qué?** Cada fila de la tabla está demostrada en este capítulo; aquí solo se aplica.

**Resultado.** \(F(s) = \frac{2}{s^{3}}\).

#### Ejemplo 5 · Transformada de \(- 2 t + 7 + e^{- t}\) con la tabla · *Intermedio*

**Enunciado.** Halla \(\mathcal{L}\{- 2 t + 7 + e^{- t}\}\).

1. Separa en términos: \(7\), \(- 2 t\), \(e^{- t}\).

   **¿Por qué?** Linealidad: la transformada de una suma es la suma de transformadas, y las constantes salen.

2. Busca cada término en la tabla: \(7\to \frac{7}{s}\); \(- 2 t\to - \frac{2}{s^{2}}\); \(e^{- t}\to \frac{1}{s + 1}\).

   **¿Por qué?** Cada fila de la tabla está demostrada en este capítulo; aquí solo se aplica.

**Resultado.** \(F(s) = \frac{8 s^{2} + 5 s - 2}{s^{2} \left(s + 1\right)}\).

#### Ejemplo 6 · Transformada de \(t e^{- 4 t}\) con la tabla · *Intermedio*

**Enunciado.** Halla \(\mathcal{L}\{t e^{- 4 t}\}\).

1. Busca cada término en la tabla: \(t e^{- 4 t}\to \frac{1}{\left(s + 4\right)^{2}}\).

   **¿Por qué?** Cada fila de la tabla está demostrada en este capítulo; aquí solo se aplica.

**Resultado.** \(F(s) = \frac{1}{\left(s + 4\right)^{2}}\).

#### Ejemplo 7 · Transformada de \(e^{- t} \cos{\left(2 t \right)}\) con la tabla · *Intermedio*

**Enunciado.** Halla \(\mathcal{L}\{e^{- t} \cos{\left(2 t \right)}\}\).

1. Busca cada término en la tabla: \(e^{- t} \cos{\left(2 t \right)}\to \frac{s + 1}{\left(s + 1\right)^{2} + 4}\).

   **¿Por qué?** Cada fila de la tabla está demostrada en este capítulo; aquí solo se aplica.

**Resultado.** \(F(s) = \frac{s + 1}{\left(s + 1\right)^{2} + 4}\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 6 (polo repetido) con la tabla simbólica.

```python
# verificacion.py
from sympy import symbols, exp, laplace_transform

t, s = symbols("t s", positive=True)
F, _, _ = laplace_transform(t * exp(-4 * t), t, s)
print("F(s):", F)
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `F(s): (s + 4)**(-2)`, igual al \(\dfrac{1}{(s+4)^2}\) del Ejemplo 6.

**Práctica:** cambia `t * exp(-4 * t)` por `3*exp(-2*t)*sympy.sin(5*t)` (importa `sin` de sympy) y confirma que da \(\dfrac{15}{(s+2)^2+25}\).

**Límite:** la tabla solo cubre las formas listadas (escalón, rampa, exponencial, seno/coseno y sus combinaciones); una función que no se pueda descomponer en esos bloques exige volver a la integral de definición o usar una tabla más amplia.

### Tema 3: Propiedades

**¿Por qué es importante?** Las propiedades (derivada, desplazamiento, retardo) explican por qué una función de transferencia tiene la forma que tiene.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

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

#### Ejemplo 1 · Una constante · *Básico*

**Enunciado.** Transforma \(f(t) = 5\) (para \(t \ge 0\)).

1. Escribe \(5 = 5\cdot u(t)\).

   **¿Por qué?** Una constante que empieza en \(t=0\) es un escalón multiplicado por esa constante.

2. Usa la tabla, \(u(t)\to\dfrac1s\), y saca el 5 por linealidad.

   **¿Por qué?** Linealidad: las constantes salen de la transformada.

**Resultado:** \(\dfrac{5}{s}\)

#### Ejemplo 2 · Suma de términos · *Básico*

> **Qué cambia respecto al anterior:** Varios términos a la vez.

**Enunciado.** Transforma \(f(t) = 3 + 2t - 5e^{-2t}\).

1. Separa en tres términos y transforma cada uno.

   **¿Por qué?** Linealidad: la transformada de una suma es la suma de las transformadas.

2. \(3 \to \dfrac3s\) (Ejemplo 2); \(2t \to \dfrac{2}{s^2}\) (rampa por 2); \(5e^{-2t} \to \dfrac{5}{s+2}\) (Ejemplo 1 por 5).

   **¿Por qué?** Cada uno es una fila de la tabla multiplicada por una constante.

**Resultado:** \(\dfrac3s + \dfrac{2}{s^2} - \dfrac{5}{s+2}\)

#### Ejemplo 3 · Un seno · *Básico*

> **Qué cambia respecto al anterior:** Una función nueva de la tabla: el seno.

**Enunciado.** Transforma \(f(t) = \sin 3t\).

1. Identifica \(\omega = 3\) (el número que multiplica a \(t\)).

   **¿Por qué?** La tabla dice \(\sin\omega t \to \dfrac{\omega}{s^2+\omega^2}\).

2. Reemplaza: \(\dfrac{3}{s^2+9}\).

   **¿Por qué?** Arriba va \(\omega = 3\) y abajo \(\omega^2 = 9\).

**Resultado:** \(\dfrac{3}{s^2+9}\)

#### Ejemplo 4 · Seno multiplicado por exponencial · *Intermedio*

> **Qué cambia respecto al anterior:** Se agrega \(e^{-2t}\), que solo desplaza la \(s\).

**Enunciado.** Transforma \(f(t) = e^{-2t}\sin 3t\).

1. Empieza por la parte sin exponencial: \(\sin 3t \to \dfrac{3}{s^2+9}\).

   **¿Por qué?** Es el Ejemplo 4.

2. El factor \(e^{-2t}\) desplaza: cambia cada \(s\) por \(s+2\).

   \[\frac{3}{(s+2)^2+9}\]

   **¿Por qué?** Propiedad de desplazamiento en \(s\) (demostrada arriba): \(e^{-at}f(t) \to F(s+a)\).

**Resultado:** \(\dfrac{3}{(s+2)^2+9}\)

> Este es el tipo de término que aparece en todos los sistemas de segundo orden: una oscilación que se apaga.

#### Ejemplo 5 · Coseno amortiguado con constante · *Intermedio*

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

#### Ejemplo 6 · Retardo · *Intermedio*

> **Qué cambia respecto al anterior:** La función empieza tarde.

**Enunciado.** Transforma (a) un escalón que se enciende en \(t=2\) y (b) una rampa que empieza en \(t=1\).

1. (a) Se escribe \(u(t-2)\). Sin retardo sería \(\dfrac1s\); el retardo multiplica por \(e^{-2s}\).

   **¿Por qué?** Propiedad del retardo: \(f(t-T)u(t-T) \to e^{-Ts}F(s)\), con \(T = 2\).

2. (b) La rampa retrasada es \((t-1)u(t-1)\). Sin retardo, \(\dfrac{1}{s^2}\); con retardo, \(\dfrac{e^{-s}}{s^2}\).

   **¿Por qué?** La función tiene que estar escrita con \((t-1)\) adentro. \(t\,u(t-1)\) sería otra función (una rampa que salta de golpe a 1).

**Resultado:** (a) \(\dfrac{e^{-2s}}{s}\); (b) \(\dfrac{e^{-s}}{s^2}\)

#### Ejemplo 7 · Multiplicar por t · *Intermedio*

> **Qué cambia respecto al anterior:** Aparece una \(t\) multiplicando.

**Enunciado.** Transforma \(f(t) = t\,e^{-4t}\).

1. Sin la \(t\): \(e^{-4t} \to \dfrac{1}{s+4}\).

   **¿Por qué?** Tabla.

2. La \(t\) delante significa derivar respecto a \(s\) y cambiar el signo.

   \[-\frac{d}{ds}(s+4)^{-1} = -(-1)(s+4)^{-2} = \frac{1}{(s+4)^2}\]

   **¿Por qué?** Propiedad “multiplicar por \(t\)”: \(tf(t) \to -\dfrac{dF}{ds}\).

**Resultado:** \(\dfrac{1}{(s+4)^2}\): un polo repetido

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 8 · Transformar una EDO con condiciones iniciales · *Intermedio*

**Enunciado.** Transforma \(y'' + 3y' + 2y = 0\) con \(y(0)=1\), \(y'(0)=0\) y despeja \(Y(s)\).

1. \(\mathcal{L}\{y''\} = s^2Y - s\,y(0) - y'(0) = s^2Y - s\) y \(\mathcal{L}\{y'\} = sY - 1\).

   **¿Por qué?** La propiedad de la derivada mete las condiciones iniciales directamente en la ecuación.

2. Sustituye: \(s^2Y - s + 3(sY-1) + 2Y = 0\), así que \(Y(s^2+3s+2) = s+3\).

   **¿Por qué?** Se agrupan los términos con \(Y\).

**Resultado.** \(Y(s) = \dfrac{s+3}{(s+1)(s+2)}\) y, invirtiendo, \(y(t) = \left(2 e^{t} - 1\right) e^{- 2 t}\).

**Comprobación.** \(y(0) = 2 - 1 = 1\) ✓.

#### Ejemplo 9 · Desplazamiento en s · *Intermedio*

**Enunciado.** Halla \(\mathcal{L}\{e^{-2t}t^2\}\).

1. \(\mathcal{L}\{t^2\} = \dfrac{2}{s^3}\).

   **¿Por qué?** Primero se transforma la parte sin exponencial.

2. Multiplicar por \(e^{-2t}\) cambia \(s\) por \(s+2\).

   **¿Por qué?** Propiedad de desplazamiento en \(s\): \(\mathcal{L}\{e^{-at}f\} = F(s+a)\).

**Resultado.** \(\dfrac{2}{(s+2)^3}\).

#### Ejemplo 10 · Integral de una señal · *Básico*

**Enunciado.** Halla la transformada de \(g(t) = \int_0^t e^{-\tau}\,d\tau\).

1. \(\mathcal{L}\{e^{-t}\} = \dfrac{1}{s+1}\).

   **¿Por qué?** Se transforma lo que está dentro de la integral.

2. Integrar en el tiempo divide por \(s\).

   **¿Por qué?** Propiedad de la integral.

**Resultado.** \(G(s) = \dfrac{1}{s(s+1)}\); invirtiendo, \(g(t) = 1 - e^{-t}\), que es justo la integral calculada a mano.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 8 (fracciones parciales de la EDO transformada).

```python
# verificacion.py
from sympy import symbols, apart

s = symbols("s")
Y = (s + 3) / ((s + 1) * (s + 2))
print("fracciones parciales:", apart(Y))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `fracciones parciales: -1/(s + 2) + 2/(s + 1)`, que invertido da \(y(t) = 2e^{-t} - e^{-2t}\), igual al Ejemplo 8. SymPy puede cambiar el orden de los sumandos sin cambiar la expresión.

**Práctica:** cambia `Y` por la transformada de \(y''+5y'+6y=0\) con \(y(0)=2\), \(y'(0)=0\) (debes construir \(Y(s)\) primero) y confirma sus fracciones parciales.

**Límite:** la propiedad de la derivada \(sF(s)-f(0)\) exige que \(f\) y sus derivadas sean continuas por tramos y de orden exponencial; con discontinuidades o condiciones iniciales en \(t\neq0\) hay que desplazar el origen antes de aplicarla.

### Tema 4: Valor final y valor inicial

**¿Por qué es importante?** El valor final te dice a dónde llega un sistema sin resolverlo completo, y saber cuándo no aplica evita respuestas falsas.

**Fuentes oficiales:** [Ecuaciones diferenciales y Laplace, MIT OpenCourseWare 18.03SC](https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/).

\[y(\infty) = \lim_{s\to0} s\,Y(s) \qquad\qquad y(0^+) = \lim_{s\to\infty} s\,Y(s)\]

*El valor final solo vale si el sistema es estable: todos los polos de \(sY(s)\) en el semiplano izquierdo.*

#### Demostración del teorema del valor final

1. Parte de la propiedad de la derivada: \(\displaystyle\int_0^\infty y'(t)e^{-st}dt = sY(s) - y(0)\).
2. Toma el límite \(s\to0\): la exponencial vale 1 y queda \(\displaystyle\int_0^\infty y'(t)dt = \lim_{s\to0}sY(s) - y(0)\).
3. La integral de una derivada es la diferencia de extremos: \(y(\infty) - y(0)\).
4. Igualando: \(y(\infty) - y(0) = \lim_{s\to0}sY - y(0)\), así que \(y(\infty) = \lim_{s\to0}sY(s)\).

El paso 2 exige que \(y(\infty)\) exista. Por eso el sistema debe ser estable. El valor inicial sale igual con \(s\to\infty\): la exponencial anula la integral y queda \(0 = \lim sY - y(0^+)\).

∎

#### Ejemplo 1 · Valor final de primer orden · *Básico*

**Enunciado.** \(G(s) = \dfrac{10}{s+2}\) recibe un escalón unitario. ¿A dónde llega la salida?

1. Escribe la salida: \(Y(s) = G(s)\cdot\dfrac1s = \dfrac{10}{s(s+2)}\).

   **¿Por qué?** La salida en Laplace es la función de transferencia por la entrada, y el escalón unitario es \(1/s\).

2. Multiplica por \(s\): \(sY(s) = \dfrac{10}{s+2}\).

   **¿Por qué?** El teorema pide \(sY(s)\). La \(s\) se cancela con la del escalón.

3. Toma el límite \(s \to 0\): \(\dfrac{10}{0+2} = 5\).

   **¿Por qué?** El teorema dice que ese límite es el valor final. Antes hay que revisar que el polo (\(-2\)) esté a la izquierda: sí.

**Resultado:** La salida llega a 5

#### Ejemplo 2 · Valor final e inicial de segundo orden · *Nivel parcial*

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

#### Ejemplo 3 · Cuándo no se puede usar · *Intermedio*

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

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 4 · Valor final de \(\frac{10}{s \left(s + 5\right)}\) · *Básico*

**Enunciado.** Halla \(y(\infty)\) si \(Y(s) = \frac{10}{s \left(s + 5\right)}\).

1. Polos de \(sY(s) = \frac{10}{s + 5}\): \(-5\).

   **¿Por qué?** El teorema solo vale si todos los polos de \(sY(s)\) están en el semiplano izquierdo.

2. Todos tienen parte real negativa; evalúa \(\lim_{s\to0} sY(s) = 2\).

   **¿Por qué?** Condición cumplida, se puede aplicar.

**Resultado.** \(y(\infty) = 2\).

**Comprobación.** La respuesta completa \(y(t) = 2 - 2 e^{- 5 t}\) tiende a ese valor.

#### Ejemplo 5 · Valor final de \(\frac{2 s + 8}{s \left(s^{2} + 4 s + 8\right)}\) · *Intermedio*

**Enunciado.** Halla \(y(\infty)\) si \(Y(s) = \frac{2 s + 8}{s \left(s^{2} + 4 s + 8\right)}\).

1. Polos de \(sY(s) = \frac{2 \left(s + 4\right)}{s^{2} + 4 s + 8}\): \(-2 - 2 j, -2 + 2 j\).

   **¿Por qué?** El teorema solo vale si todos los polos de \(sY(s)\) están en el semiplano izquierdo.

2. Todos tienen parte real negativa; evalúa \(\lim_{s\to0} sY(s) = 1\).

   **¿Por qué?** Condición cumplida, se puede aplicar.

**Resultado.** \(y(\infty) = 1\).

**Comprobación.** La respuesta completa \(y(t) = 1 - e^{- 2 t} \cos{\left(2 t \right)}\) tiende a ese valor.

#### Ejemplo 6 · Valor final de \(\frac{3}{s \left(s - 1\right)}\) · *Intermedio*

**Enunciado.** Halla \(y(\infty)\) si \(Y(s) = \frac{3}{s \left(s - 1\right)}\).

1. Polos de \(sY(s) = \frac{3}{s - 1}\): \(1\).

   **¿Por qué?** El teorema solo vale si todos los polos de \(sY(s)\) están en el semiplano izquierdo.

2. Hay un polo en el semiplano derecho o sobre el eje imaginario.

   **¿Por qué?** Entonces \(y(t)\) crece u oscila para siempre: no tiene valor final.

**Resultado.** **No se puede aplicar** el teorema; el límite numérico sería engañoso.

**Comprobación.** \(y(t) = 3 e^{t} - 3\) no converge.

#### Ejemplo 7 · Valor final de \(\frac{5}{s \left(s^{2} + 9\right)}\) · *Avanzado*

**Enunciado.** Halla \(y(\infty)\) si \(Y(s) = \frac{5}{s \left(s^{2} + 9\right)}\).

1. Polos de \(sY(s) = \frac{5}{s^{2} + 9}\): \(- 3 j, 3 j\).

   **¿Por qué?** El teorema solo vale si todos los polos de \(sY(s)\) están en el semiplano izquierdo.

2. Hay un polo en el semiplano derecho o sobre el eje imaginario.

   **¿Por qué?** Entonces \(y(t)\) crece u oscila para siempre: no tiene valor final.

**Resultado.** **No se puede aplicar** el teorema; el límite numérico sería engañoso.

**Comprobación.** \(y(t) = \frac{5}{9} - \frac{5 \cos{\left(3 t \right)}}{9}\) no converge.

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 del teorema del valor final.

```python
# verificacion.py
from sympy import symbols, limit

s = symbols("s")
sY = 10 / (s + 2)
print("valor_final:", limit(sY, s, 0))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `valor_final: 5`, igual al Ejemplo 1.

**Límite:** este script no revisa estabilidad; antes de confiar en el número hay que verificar a mano (como en los Ejemplos 6 y 7) que todos los polos de \(sY(s)\) están en el semiplano izquierdo, o el resultado numérico será engañoso.

#### Práctica para resolver sola o solo

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

