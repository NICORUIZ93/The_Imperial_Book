# Módulo 3: Transformada inversa

Para saber cómo se comporta la salida en el tiempo hay que volver de \(Y(s)\) a \(y(t)\). Casi siempre \(Y(s)\) no está en la tabla tal cual: hay que partirla.

**Al terminar podrás:**

- Descomponer en fracciones parciales con polos reales distintos y repetidos.
- Manejar polos complejos completando el cuadrado.
- Combinar las dos técnicas, como en la respuesta al escalón de segundo orden.

## Aprende construyendo


### Tema 1: Caso 1: polos reales distintos · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por caso 1: polos reales distintos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender caso 1: polos reales distintos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
1. Parte de la igualdad \(\dfrac{N(s)}{(s+a)(s+b)} = \dfrac{A}{s+a} + \dfrac{B}{s+b}\). 2. Multiplica ambos lados por \((s+a)\): \(\dfrac{N(s)}{s+b} = A + \dfrac{B(s+a)}{s+b}\). 3. Evalúa en \(s=-a\): el último término se anula porque tiene el factor \((s+a)\). Queda \(A = \left.\dfrac{N(s)}{s+b}\right|_{s=-a}\). 4. “Tapar” el factor y evaluar es hacer estos dos pasos de un golpe.

#### ► LA ANALOGÍA
Piensa en caso 1: polos reales distintos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Parte de la igualdad \(\dfrac{N(s)}{(s+a)(s+b)} = \dfrac{A}{s+a} + \dfrac{B}{s+b}\).
2. Multiplica ambos lados por \((s+a)\): \(\dfrac{N(s)}{s+b} = A + \dfrac{B(s+a)}{s+b}\).
3. Evalúa en \(s=-a\): el último término se anula porque tiene el factor \((s+a)\).
4. Queda \(A = \left.\dfrac{N(s)}{s+b}\right|_{s=-a}\).
5. “Tapar” el factor y evaluar es hacer estos dos pasos de un golpe.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Caso 1: polos reales distintos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Caso 1: polos reales distintos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses caso 1: polos reales distintos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: caso 1: polos reales distintos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Parte de la igualdad \(\dfrac{N(s)}{(s+a)(s+b)} = \dfrac{A}{s+a} + \dfrac{B}{s+b}\).
- Multiplica ambos lados por \((s+a)\): \(\dfrac{N(s)}{s+b} = A + \dfrac{B(s+a)}{s+b}\).
- Evalúa en \(s=-a\): el último término se anula porque tiene el factor \((s+a)\).
- Queda \(A = \left.\dfrac{N(s)}{s+b}\right|_{s=-a}\).

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve caso 1: polos reales distintos en tu contexto?
2. ¿Cómo sabrías que caso 1: polos reales distintos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar caso 1: polos reales distintos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, apart

s = symbols("s")
Y = 6 / (s * (s + 3))
print("fracciones:", apart(Y))
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Caso 2: polos repetidos · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por caso 2: polos repetidos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender caso 2: polos repetidos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en caso 2: polos repetidos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que caso 2: polos repetidos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Caso 2: polos repetidos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Caso 2: polos repetidos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses caso 2: polos repetidos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: caso 2: polos repetidos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Caso 2: polos repetidos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve caso 2: polos repetidos en tu contexto?
2. ¿Cómo sabrías que caso 2: polos repetidos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar caso 2: polos repetidos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, apart

s = symbols("s")
Y = 1 / (s * (s + 1) ** 2)
print("fracciones:", apart(Y))
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Caso 3: polos complejos (completar el cuadrado) · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por caso 3: polos complejos (completar el cuadrado) con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender caso 3: polos complejos (completar el cuadrado) te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en caso 3: polos complejos (completar el cuadrado) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que caso 3: polos complejos (completar el cuadrado) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Caso 3: polos complejos (completar el cuadrado) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Caso 3: polos complejos (completar el cuadrado) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses caso 3: polos complejos (completar el cuadrado) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: caso 3: polos complejos (completar el cuadrado) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Caso 3: polos complejos (completar el cuadrado) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve caso 3: polos complejos (completar el cuadrado) en tu contexto?
2. ¿Cómo sabrías que caso 3: polos complejos (completar el cuadrado) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar caso 3: polos complejos (completar el cuadrado)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, expand

s = symbols("s")
completado = expand((s + 1) ** 2 + 36)
print("completado:", completado)
```

```bash
python3 verificacion.py
```

</details>

### Tema 4: Resolver una ecuación diferencial completa · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por resolver una ecuación diferencial completa con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender resolver una ecuación diferencial completa te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en resolver una ecuación diferencial completa como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que resolver una ecuación diferencial completa resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Resolver una ecuación diferencial completa se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Resolver una ecuación diferencial completa | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses resolver una ecuación diferencial completa por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: resolver una ecuación diferencial completa funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Resolver una ecuación diferencial completa existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve resolver una ecuación diferencial completa en tu contexto?
2. ¿Cómo sabrías que resolver una ecuación diferencial completa no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar resolver una ecuación diferencial completa?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, Function, dsolve, Eq, Derivative

t = symbols("t")
y = Function("y")
sol = dsolve(Eq(Derivative(y(t), t) + 2 * y(t), 4), y(t), ics={y(0): 0})
print("y(t):", sol)
```

```bash
python3 verificacion.py
```

</details>
