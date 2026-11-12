# Módulo 14: Error en estado estacionario

Después de que pasa el transitorio, ¿la salida llega exactamente a la referencia? Depende del tipo de sistema y de la entrada.

**Al terminar podrás:**

- Calcular el error final ante escalón, rampa y parábola.
- Usar las constantes \(K_p\), \(K_v\) y \(K_a\).
- Elegir una ganancia para cumplir una especificación de error.

## Aprende construyendo

### Tema 1: Fórmula general

**¿Por qué es importante?** El error final dice si el sistema llega exactamente a la referencia, que es lo que más le importa a quien usa el sistema.

\[e_{ss} = \lim_{s\to0}\, s\,\frac{R(s)}{1+G(s)}\]

*Realimentación unitaria. \(G\) incluye controlador y planta. El sistema en lazo cerrado debe ser estable.*

#### Demostración

\(E = R - Y\) y \(Y = \dfrac{G}{1+G}R\), así que \(E = \left(1 - \dfrac{G}{1+G}\right)R = \dfrac{R}{1+G}\). El teorema del valor final (capítulo 3) da la fórmula.

∎

### Tema 2: Tipo de sistema y constantes

**¿Por qué es importante?** El tipo de sistema y las constantes \(K_p\), \(K_v\), \(K_a\) te dicen el error sin simular y orientan qué acción de control agregar.

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
