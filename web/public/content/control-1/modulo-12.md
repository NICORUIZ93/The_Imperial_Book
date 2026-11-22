# Módulo 12: Sistemas de segundo orden

Es el tema más preguntado de los dos parciales. Un RLC, una masa con resorte o un motor con su control se comportan así.

**Al terminar podrás:**

- Leer \(K\), \(\omega_n\) y \(\zeta\) de cualquier \(G(s)\) de segundo orden.
- Clasificar el sistema (sub, crítica o sobreamortiguado) y predecir su forma.
- Calcular \(M_p\), \(t_p\), \(t_s\) y \(t_r\), y escribir \(y(t)\).
- Hacer el camino inverso: de una gráfica o de unas especificaciones a \(G(s)\).

## Aprende construyendo


### Tema 1: Forma estándar de segundo orden: K, ωn y ζ · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por forma estándar de segundo orden: k, ωn y ζ con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender forma estándar de segundo orden: k, ωn y ζ te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en forma estándar de segundo orden: k, ωn y ζ como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que forma estándar de segundo orden: k, ωn y ζ resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Forma estándar de segundo orden: K, ωn y ζ se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Forma estándar de segundo orden: K, ωn y ζ | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses forma estándar de segundo orden: k, ωn y ζ por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: forma estándar de segundo orden: k, ωn y ζ funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Forma estándar de segundo orden: K, ωn y ζ existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve forma estándar de segundo orden: k, ωn y ζ en tu contexto?
2. ¿Cómo sabrías que forma estándar de segundo orden: k, ωn y ζ no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar forma estándar de segundo orden: k, ωn y ζ?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, Rational, N

num, b, c = 370, 2, 37
wn = sqrt(c)
zeta = Rational(b, 1) / (2 * wn)
K = Rational(num, c)
print("wn:", N(wn, 4))
print("zeta:", N(zeta, 4))
print("K:", K)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Simulador: mueve ζ y ωn · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por simulador: mueve ζ y ωn con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender simulador: mueve ζ y ωn te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en simulador: mueve ζ y ωn como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que simulador: mueve ζ y ωn resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Simulador: mueve ζ y ωn se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Simulador: mueve ζ y ωn | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses simulador: mueve ζ y ωn por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: simulador: mueve ζ y ωn funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Simulador: mueve ζ y ωn existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve simulador: mueve ζ y ωn en tu contexto?
2. ¿Cómo sabrías que simulador: mueve ζ y ωn no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar simulador: mueve ζ y ωn?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```anatomy
control-1-segundo-orden
```

```python
# verificacion.py
from sympy import exp, pi, sqrt, N

zeta, wn = 0.1, 2
Mp = N(exp(-zeta * pi / sqrt(1 - zeta ** 2)) * 100, 3)
ts = N(4 / (zeta * wn), 3)
wd = wn * sqrt(1 - zeta ** 2)
tp = N(pi / wd, 3)
print("Mp%:", Mp)
print("ts:", ts)
print("tp:", tp)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Los cuatro casos según ζ · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por los cuatro casos según ζ con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender los cuatro casos según ζ te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en los cuatro casos según ζ como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
![Efecto de ζ en la respuesta al escalón](content/figures/control-1/segundo-orden-zetas.svg)

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Los cuatro casos según ζ se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Los cuatro casos según ζ | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses los cuatro casos según ζ por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: los cuatro casos según ζ funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Los cuatro casos según ζ existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve los cuatro casos según ζ en tu contexto?
2. ¿Cómo sabrías que los cuatro casos según ζ no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar los cuatro casos según ζ?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, Rational, N

num, b, c = 9, 2, 9
wn = sqrt(c)
zeta = Rational(b, 1) / (2 * wn)
print("wn:", wn)
print("zeta:", N(zeta, 3))
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Fórmulas del caso subamortiguado · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por fórmulas del caso subamortiguado con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender fórmulas del caso subamortiguado te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en fórmulas del caso subamortiguado como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que fórmulas del caso subamortiguado resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Fórmulas del caso subamortiguado se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Fórmulas del caso subamortiguado | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses fórmulas del caso subamortiguado por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: fórmulas del caso subamortiguado funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Fórmulas del caso subamortiguado existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve fórmulas del caso subamortiguado en tu contexto?
2. ¿Cómo sabrías que fórmulas del caso subamortiguado no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar fórmulas del caso subamortiguado?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, exp, pi, N

wn, zeta = 5, 0.6
sigma = zeta * wn
wd = wn * sqrt(1 - zeta ** 2)
Mp = N(exp(-sigma * pi / wd) * 100, 3)
tp = N(pi / wd, 3)
ts = N(4 / sigma, 3)
print("sigma:", sigma, "wd:", float(wd))
print("Mp%:", Mp, "tp:", tp, "ts:", ts)
```

```bash
python3 verificacion.py
```

</details>

### Tema 5: De las especificaciones a la función de transferencia · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por de las especificaciones a la función de transferencia con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender de las especificaciones a la función de transferencia te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en de las especificaciones a la función de transferencia como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que de las especificaciones a la función de transferencia resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| De las especificaciones a la función de transferencia se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar De las especificaciones a la función de transferencia | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses de las especificaciones a la función de transferencia por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: de las especificaciones a la función de transferencia funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- De las especificaciones a la función de transferencia existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve de las especificaciones a la función de transferencia en tu contexto?
2. ¿Cómo sabrías que de las especificaciones a la función de transferencia no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar de las especificaciones a la función de transferencia?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import log, sqrt, pi, N

Mp, ts = 0.10, 2
zeta = N(-log(Mp) / sqrt(pi ** 2 + log(Mp) ** 2), 4)
sigma = 4 / ts
wn = N(sigma / zeta, 4)
print("zeta:", zeta)
print("wn:", wn)
print("wn^2:", N(wn ** 2, 5))
```

```bash
python3 verificacion.py
```

</details>
