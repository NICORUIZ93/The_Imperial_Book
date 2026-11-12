# Módulo 14: Error en estado estacionario

Después de que pasa el transitorio, ¿la salida llega exactamente a la referencia? Depende del tipo de sistema y de la entrada.

**Al terminar podrás:**

- Calcular el error final ante escalón, rampa y parábola.
- Usar las constantes \(K_p\), \(K_v\) y \(K_a\).
- Elegir una ganancia para cumplir una especificación de error.

## Aprende construyendo

### Tema 1: Fórmula general

**¿Por qué es importante?** El error final dice si el sistema llega exactamente a la referencia, que es lo que más le importa a quien usa el sistema.

**Fuentes oficiales:** [Controladores PID, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlPID) y [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

\[e_{ss} = \lim_{s\to0}\, s\,\frac{R(s)}{1+G(s)}\]

*Realimentación unitaria. \(G\) incluye controlador y planta. El sistema en lazo cerrado debe ser estable.*

#### Demostración

\(E = R - Y\) y \(Y = \dfrac{G}{1+G}R\), así que \(E = \left(1 - \dfrac{G}{1+G}\right)R = \dfrac{R}{1+G}\). El teorema del valor final (capítulo 3) da la fórmula.

∎

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 1 · Error final de \(\frac{10}{s + 2}\) ante escalón · *Básico*

**Enunciado.** Realimentación unitaria. Halla \(e_{ss}\).

1. \(E(s) = \dfrac{R(s)}{1+G(s)} = \frac{s + 2}{s \left(s + 12\right)}\).

   **¿Por qué?** Con realimentación unitaria \(E = R - Y = R/(1+G)\).

2. Lazo cerrado estable: sí.

   **¿Por qué?** El teorema del valor final solo se puede usar si el lazo cerrado es estable.

**Resultado.** \(e_{ss} = \lim_{s\to0} sE(s) = \frac{1}{6}\).

#### Ejemplo 2 · Error final de \(\frac{10}{s \left(s + 2\right)}\) ante escalón · *Básico*

**Enunciado.** Realimentación unitaria. Halla \(e_{ss}\).

1. \(E(s) = \dfrac{R(s)}{1+G(s)} = \frac{s + 2}{s \left(s + 2\right) + 10}\).

   **¿Por qué?** Con realimentación unitaria \(E = R - Y = R/(1+G)\).

2. Lazo cerrado estable: sí.

   **¿Por qué?** El teorema del valor final solo se puede usar si el lazo cerrado es estable.

**Resultado.** \(e_{ss} = \lim_{s\to0} sE(s) = 0\).

#### Ejemplo 3 · Error final de \(\frac{10}{s \left(s + 2\right)}\) ante rampa · *Intermedio*

**Enunciado.** Realimentación unitaria. Halla \(e_{ss}\).

1. \(E(s) = \dfrac{R(s)}{1+G(s)} = \frac{s + 2}{s \left(s \left(s + 2\right) + 10\right)}\).

   **¿Por qué?** Con realimentación unitaria \(E = R - Y = R/(1+G)\).

2. Lazo cerrado estable: sí.

   **¿Por qué?** El teorema del valor final solo se puede usar si el lazo cerrado es estable.

**Resultado.** \(e_{ss} = \lim_{s\to0} sE(s) = \frac{1}{5}\).

#### Ejemplo 4 · Error final de \(\frac{5}{s + 1}\) ante rampa · *Intermedio*

**Enunciado.** Realimentación unitaria. Halla \(e_{ss}\).

1. \(E(s) = \dfrac{R(s)}{1+G(s)} = \frac{s + 1}{s^{2} \left(s + 6\right)}\).

   **¿Por qué?** Con realimentación unitaria \(E = R - Y = R/(1+G)\).

2. Lazo cerrado estable: sí.

   **¿Por qué?** El teorema del valor final solo se puede usar si el lazo cerrado es estable.

**Resultado.** \(e_{ss} = \lim_{s\to0} sE(s) = \infty\).

#### Ejemplo 5 · Error final de \(\frac{20}{s^{2} \left(s + 5\right)}\) ante parábola · *Avanzado*

**Enunciado.** Realimentación unitaria. Halla \(e_{ss}\).

1. \(E(s) = \dfrac{R(s)}{1+G(s)} = \frac{s + 5}{s \left(s^{2} \left(s + 5\right) + 20\right)}\).

   **¿Por qué?** Con realimentación unitaria \(E = R - Y = R/(1+G)\).

2. Lazo cerrado estable: no.

   **¿Por qué?** El teorema del valor final solo se puede usar si el lazo cerrado es estable.

**Resultado.** \(e_{ss} = \lim_{s\to0} sE(s) = \frac{1}{4}\).

#### Ejemplo 6 · Error final de \(\frac{8}{\left(s + 1\right) \left(s + 4\right)}\) ante escalón de amplitud 3 · *Básico*

**Enunciado.** Realimentación unitaria. Halla \(e_{ss}\).

1. \(E(s) = \dfrac{R(s)}{1+G(s)} = \frac{3 \left(s + 1\right) \left(s + 4\right)}{s \left(\left(s + 1\right) \left(s + 4\right) + 8\right)}\).

   **¿Por qué?** Con realimentación unitaria \(E = R - Y = R/(1+G)\).

2. Lazo cerrado estable: sí.

   **¿Por qué?** El teorema del valor final solo se puede usar si el lazo cerrado es estable.

**Resultado.** \(e_{ss} = \lim_{s\to0} sE(s) = 1\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1.

```python
# verificacion.py
from sympy import symbols, limit

s = symbols("s")
G = 10 / (s + 2)
R = 1 / s
E = R / (1 + G)
print("e_ss:", limit(s * E, s, 0))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `e_ss: 1/6`, igual al Ejemplo 1.

**Práctica:** cambia `G` a `10/(s*(s+2))` y `R` a `1/s**2` (rampa) y confirma \(e_{ss}=1/5\) (Ejemplo 3).

**Límite:** esta fórmula exige confirmar primero que el lazo cerrado es estable; en el Ejemplo 5 de este tema el número que da el límite (\(1/4\)) es engañoso porque el sistema en lazo cerrado en realidad es inestable — el error final no tiene sentido físico ahí.

### Tema 2: Tipo de sistema y constantes

**¿Por qué es importante?** El tipo de sistema y las constantes \(K_p\), \(K_v\), \(K_a\) te dicen el error sin simular y orientan qué acción de control agregar.

**Fuentes oficiales:** [Controladores PID, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlPID) y [Análisis de sistemas, Control Tutorials (U. de Michigan)](https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=SystemAnalysis).

Escribe \(G(s) = \dfrac{K(s+z_1)\cdots}{s^N(s+p_1)\cdots}\). El **tipo** es \(N\): cuántos integradores puros tiene.

#### Demostración de cada caso

1. **Escalón** \(R = 1/s\): \(e_{ss} = \dfrac{1}{1+\lim_{s\to0}G} = \dfrac{1}{1+K_p}\), con \(K_p = \lim_{s\to0}G(s)\).
2. **Rampa** \(R = 1/s^2\): \(e_{ss} = \lim\dfrac{1}{s+sG} = \dfrac{1}{\lim sG} = \dfrac{1}{K_v}\), con \(K_v = \lim_{s\to0}sG(s)\).
3. **Parábola** \(R = 1/s^3\) (es \(t^2/2\)): \(e_{ss} = \dfrac{1}{\lim s^2G} = \dfrac{1}{K_a}\), con \(K_a = \lim_{s\to0}s^2G(s)\).
4. Si \(N = 0\): \(K_p\) es finito, \(K_v = K_a = 0\). Si \(N = 1\): \(K_p = \infty\), \(K_v\) finito, \(K_a = 0\). Si \(N = 2\): \(K_p = K_v = \infty\), \(K_a\) finito.

∎

| Tipo | Escalón | Rampa | Parábola |
|---|---|---|---|
| 0 | \(\dfrac{1}{1+K_p}\) | \(\infty\) | \(\infty\) |
| 1 | \(0\) | \(\dfrac{1}{K_v}\) | \(\infty\) |
| 2 | \(0\) | \(0\) | \(\dfrac{1}{K_a}\) |

#### Ejemplo 1 · Tipo 0 con escalón · *Básico*

**Enunciado.** \(G = \dfrac{10}{(s+1)(s+2)}\). Error ante escalón unitario.

1. Cuenta integradores: ningún factor \(s\) suelto abajo, así que es tipo 0.

   **¿Por qué?** El tipo decide qué fila de la tabla usar.

2. \(K_p = G(0) = \dfrac{10}{1\cdot2} = 5\).

   **¿Por qué?** Constante de posición.

3. \(e_{ss} = \dfrac{1}{1+5} = 0{,}167\).

   **¿Por qué?** Fórmula para tipo 0 con escalón.

**Resultado:** 16,7 % de error

#### Ejemplo 2 · Tipo 1 con rampa · *Intermedio*

> **Qué cambia respecto al anterior:** Ahora hay un integrador y la entrada es una rampa.

**Enunciado.** \(G = \dfrac{10}{s(s+2)}\). Error ante escalón y ante rampa.

1. Hay una \(s\) suelta abajo: tipo 1.

   **¿Por qué?** Un integrador.

2. Escalón: \(e = 0\).

   **¿Por qué?** \(K_p = \infty\) porque \(G(0)\) divide por cero.

3. Rampa: \(K_v = \lim_{s\to0} sG = \dfrac{10}{2} = 5\); \(e = 1/5 = 0{,}2\).

   **¿Por qué?** La \(s\) de \(K_v\) cancela el integrador y queda un número finito.

**Resultado:** Escalón 0; rampa 0,2

#### Ejemplo 3 · Tipo 2 con parábola · *Intermedio*

> **Qué cambia respecto al anterior:** Dos integradores y entrada parabólica.

**Enunciado.** \(G = \dfrac{10(s+1)}{s^2(s+5)}\). Error ante parábola.

1. \(s^2\) abajo: tipo 2.

   **¿Por qué?** Dos integradores.

2. \(K_a = \lim s^2G = \dfrac{10\cdot1}{5} = 2\); \(e = 1/2\).

   **¿Por qué?** La \(s^2\) cancela los dos integradores.

**Resultado:** Error 0,5. Antes de confiar en el número, verifica estabilidad (capítulo 16)

#### Ejemplo 4 · Diseñar K para un error · *Nivel parcial*

> **Qué cambia respecto al anterior:** \(K\) es la incógnita.

**Enunciado.** \(G = \dfrac{K}{s(s+4)}\). ¿Qué \(K\) da error ante rampa de 5 % o menos?

1. Tipo 1: \(K_v = \lim sG = K/4\).

   **¿Por qué?** Ejemplo 2.

2. \(e = \dfrac{4}{K} \le 0{,}05 \Rightarrow K \ge 80\).

   **¿Por qué?** Se despeja \(K\).

3. Lazo cerrado con \(K = 80\): \(s^2+4s+80\), \(\zeta = \dfrac{4}{2\sqrt{80}} = 0{,}224\), \(M_p = 48{,}6\,\%\).

   **¿Por qué?** Siempre hay que revisar el transitorio.

**Resultado:** \(K \ge 80\), pero el sobrepico queda muy alto. Se necesita un compensador (capítulo 20)

#### Errores comunes

- Aplicar las fórmulas sin verificar estabilidad.
- Calcular \(K_p\) de la función de lazo cerrado en vez de la de lazo abierto \(G\).
- Contar como integrador un polo que no está exactamente en cero.

- **1.**\(G = \dfrac{50}{(s+5)(s+10)}\): error ante escalón.
  
  <details><summary>Respuesta</summary>
  
  \(K_p = 1\): \(e = 0{,}5\).
  
  </details>

- **2.**\(G = \dfrac{20}{s(s+5)(s+1)}\): error ante rampa.
  
  <details><summary>Respuesta</summary>
  
  \(K_v = 20/5 = 4\): \(e = 0{,}25\).
  
  </details>

#### Más ejemplos resueltos

Cada ejemplo indica qué se hace en cada paso y por qué. Todos los resultados se comprobaron con cálculo simbólico (sympy).

#### Ejemplo 5 · Tipo y constantes de \(\frac{50}{\left(s + 2\right) \left(s + 5\right)}\) · *Básico*

**Enunciado.** Halla el tipo, \(K_p\), \(K_v\), \(K_a\) y los errores ante escalón, rampa y parábola.

1. Integradores (factores \(s\) en el denominador): 0 → **tipo 0**.

   **¿Por qué?** El tipo es el número de polos en el origen de \(G\).

2. \(K_p = 5,\ K_v = 0,\ K_a = 0\).

   **¿Por qué?** \(K_p = \lim G\), \(K_v = \lim sG\), \(K_a = \lim s^2G\) cuando \(s\to0\).

**Resultado.** Escalón: \(e = \frac{1}{6}\); rampa: \(e = \infty\); parábola: \(e = \infty\).

#### Ejemplo 6 · Tipo y constantes de \(\frac{12}{s \left(s + 3\right)}\) · *Básico*

**Enunciado.** Halla el tipo, \(K_p\), \(K_v\), \(K_a\) y los errores ante escalón, rampa y parábola.

1. Integradores (factores \(s\) en el denominador): 1 → **tipo 1**.

   **¿Por qué?** El tipo es el número de polos en el origen de \(G\).

2. \(K_p = \infty,\ K_v = 4,\ K_a = 0\).

   **¿Por qué?** \(K_p = \lim G\), \(K_v = \lim sG\), \(K_a = \lim s^2G\) cuando \(s\to0\).

**Resultado.** Escalón: \(e = 0\); rampa: \(e = \frac{1}{4}\); parábola: \(e = \infty\).

#### Ejemplo 7 · Tipo y constantes de \(\frac{30 s + 30}{s^{2} \left(s + 6\right)}\) · *Intermedio*

**Enunciado.** Halla el tipo, \(K_p\), \(K_v\), \(K_a\) y los errores ante escalón, rampa y parábola.

1. Integradores (factores \(s\) en el denominador): 2 → **tipo 2**.

   **¿Por qué?** El tipo es el número de polos en el origen de \(G\).

2. \(K_p = \infty,\ K_v = \infty,\ K_a = 5\).

   **¿Por qué?** \(K_p = \lim G\), \(K_v = \lim sG\), \(K_a = \lim s^2G\) cuando \(s\to0\).

**Resultado.** Escalón: \(e = 0\); rampa: \(e = 0\); parábola: \(e = \frac{1}{5}\).

#### Ejemplo 8 · Tipo y constantes de \(\frac{100}{s \left(s + 4\right) \left(s + 10\right)}\) · *Intermedio*

**Enunciado.** Halla el tipo, \(K_p\), \(K_v\), \(K_a\) y los errores ante escalón, rampa y parábola.

1. Integradores (factores \(s\) en el denominador): 1 → **tipo 1**.

   **¿Por qué?** El tipo es el número de polos en el origen de \(G\).

2. \(K_p = \infty,\ K_v = \frac{5}{2},\ K_a = 0\).

   **¿Por qué?** \(K_p = \lim G\), \(K_v = \lim sG\), \(K_a = \lim s^2G\) cuando \(s\to0\).

**Resultado.** Escalón: \(e = 0\); rampa: \(e = \frac{2}{5}\); parábola: \(e = \infty\).

#### Verificación con código

Guarda este script como `verificacion.py` y ejecútalo para comprobar el Ejemplo 1 de este tema (tipo 0).

```python
# verificacion.py
from sympy import symbols, limit, N

s = symbols("s")
G = 10 / ((s + 1) * (s + 2))
Kp = limit(G, s, 0)
e_ss = 1 / (1 + Kp)
print("Kp:", Kp)
print("e_ss:", N(e_ss, 3))
```

Ejecuta:

```bash
python3 verificacion.py
```

**Resultado esperado:** `Kp: 5` y `e_ss: 0.167`, igual al Ejemplo 1 (16,7 % de error).

**Práctica:** cambia `G` a `10/(s*(s+2))` y calcula \(K_v=\lim_{s\to0}sG\) (Ejemplo 2) para confirmar \(K_v=5\), \(e=0{,}2\).

**Límite:** estas constantes (\(K_p\), \(K_v\), \(K_a\)) se calculan sobre \(G\) de **lazo abierto**, no sobre la función de lazo cerrado; mezclarlas es uno de los errores comunes señalados al final de esta sección.

