# Módulo 11: Sistemas de primer orden y retardo

El sistema más simple: un tanque que se llena, un condensador que se carga o un horno que se calienta. Aprende a leerlo, resolverlo e identificarlo desde una gráfica.

**Al terminar podrás:**

- Leer \(K\) y \(\tau\) de cualquier \(G(s)\) de primer orden.
- Escribir la respuesta al impulso, al escalón y a la rampa.
- Manejar el retardo \(e^{-Ts}\) (punto 3.i del Parcial 1).
- Sacar \(G(s)\) a partir de una curva medida.

## Aprende construyendo


### Tema 1: Forma estándar de primer orden: K y τ · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por forma estándar de primer orden: k y τ con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender forma estándar de primer orden: k y τ te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en forma estándar de primer orden: k y τ como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que forma estándar de primer orden: k y τ resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Forma estándar de primer orden: K y τ se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Forma estándar de primer orden: K y τ | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses forma estándar de primer orden: k y τ por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: forma estándar de primer orden: k y τ funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Forma estándar de primer orden: K y τ existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve forma estándar de primer orden: k y τ en tu contexto?
2. ¿Cómo sabrías que forma estándar de primer orden: k y τ no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar forma estándar de primer orden: k y τ?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, Rational

s = symbols("s")
num, den = 5, 2 * s + 1
tau = den.coeff(s, 1)
K = Rational(num, den.coeff(s, 0))
print("K:", K)
print("tau:", tau)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Respuestas de primer orden al escalón, la rampa y el impulso · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por respuestas de primer orden al escalón, la rampa y el impulso con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender respuestas de primer orden al escalón, la rampa y el impulso te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en respuestas de primer orden al escalón, la rampa y el impulso como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
![Respuesta al escalón de un sistema de primer orden](content/figures/control-1/primer-orden-escalon.svg)

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Respuestas de primer orden al escalón, la rampa y el impulso se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Respuestas de primer orden al escalón, la rampa y el impulso | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses respuestas de primer orden al escalón, la rampa y el impulso por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: respuestas de primer orden al escalón, la rampa y el impulso funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Respuestas de primer orden al escalón, la rampa y el impulso existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve respuestas de primer orden al escalón, la rampa y el impulso en tu contexto?
2. ¿Cómo sabrías que respuestas de primer orden al escalón, la rampa y el impulso no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar respuestas de primer orden al escalón, la rampa y el impulso?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, Rational, inverse_laplace_transform

t, s = symbols("t s", positive=True)
K, tau = 3, Rational(1, 2)
Y = K / (s * (tau * s + 1))
print("y(t):", inverse_laplace_transform(Y, s, t))
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Retardo o tiempo muerto · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por retardo o tiempo muerto con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender retardo o tiempo muerto te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en retardo o tiempo muerto como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que retardo o tiempo muerto resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Retardo o tiempo muerto se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Retardo o tiempo muerto | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses retardo o tiempo muerto por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: retardo o tiempo muerto funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Retardo o tiempo muerto existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve retardo o tiempo muerto en tu contexto?
2. ¿Cómo sabrías que retardo o tiempo muerto no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar retardo o tiempo muerto?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, Rational, inverse_laplace_transform

t, s = symbols("t s", positive=True)
K, tau = 2, 4
Y0 = K / (s * (tau * s + 1))
y0 = inverse_laplace_transform(Y0, s, t)
print("y0(t):", y0)
print("y(t) con retardo 1.5 s:", y0.subs(t, t - Rational(3, 2)))
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Identificación desde una gráfica · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por identificación desde una gráfica con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender identificación desde una gráfica te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en identificación desde una gráfica como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que identificación desde una gráfica resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Identificación desde una gráfica se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Identificación desde una gráfica | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses identificación desde una gráfica por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: identificación desde una gráfica funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Identificación desde una gráfica existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve identificación desde una gráfica en tu contexto?
2. ¿Cómo sabrías que identificación desde una gráfica no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar identificación desde una gráfica?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import log, Rational

y_inf, A, t_obs, y_obs = 10, 1, 4, Rational(632, 100)
K = y_inf / A
tau = -t_obs / log(1 - y_obs / y_inf)
print("K:", K)
print("tau:", float(tau))
```

```bash
python3 verificacion.py
```

</details>
