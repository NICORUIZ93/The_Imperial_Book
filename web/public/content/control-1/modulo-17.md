# Módulo 17: Lugar geométrico de las raíces

Cuando subes la ganancia \(K\) de un lazo, los polos de lazo cerrado se mueven. El lugar de las raíces es el dibujo de ese camino, y con él eliges \(K\) para poner los polos en la zona de diseño.

**Al terminar podrás:**

- Entender las condiciones de ángulo y de magnitud.
- Dibujar el lugar con las reglas, de forma justificada.
- Calcular el punto de quiebre, las asíntotas y el cruce con el eje imaginario.
- Hallar \(K\) para un \(\zeta\) deseado.

## Aprende construyendo


### Tema 1: Las dos condiciones del lugar de las raíces · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por las dos condiciones del lugar de las raíces con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender las dos condiciones del lugar de las raíces te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en las dos condiciones del lugar de las raíces como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que las dos condiciones del lugar de las raíces resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Las dos condiciones del lugar de las raíces se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Las dos condiciones del lugar de las raíces | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses las dos condiciones del lugar de las raíces por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: las dos condiciones del lugar de las raíces funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Las dos condiciones del lugar de las raíces existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve las dos condiciones del lugar de las raíces en tu contexto?
2. ¿Cómo sabrías que las dos condiciones del lugar de las raíces no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar las dos condiciones del lugar de las raíces?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import I, arg, deg, N, Abs

s = -2 + 2 * I
angulo = -(deg(arg(s)) + deg(arg(s + 4)))
K = N(Abs(s) * Abs(s + 4), 3)
print("angulo:", N(angulo, 4))
print("K:", K)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Reglas de construcción (con su porqué) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por reglas de construcción (con su porqué) con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender reglas de construcción (con su porqué) te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en reglas de construcción (con su porqué) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que reglas de construcción (con su porqué) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Reglas de construcción (con su porqué) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Reglas de construcción (con su porqué) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses reglas de construcción (con su porqué) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: reglas de construcción (con su porqué) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Reglas de construcción (con su porqué) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve reglas de construcción (con su porqué) en tu contexto?
2. ¿Cómo sabrías que reglas de construcción (con su porqué) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar reglas de construcción (con su porqué)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```anatomy
control-1-lugar-raices
```

```python
# verificacion.py
poles = [0, -1, -2]
n_m = 3
centroide = sum(poles) / n_m
print("centroide:", centroide)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Elegir K desde el lugar de las raíces · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por elegir k desde el lugar de las raíces con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender elegir k desde el lugar de las raíces te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en elegir k desde el lugar de las raíces como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que elegir k desde el lugar de las raíces resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Elegir K desde el lugar de las raíces se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Elegir K desde el lugar de las raíces | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses elegir k desde el lugar de las raíces por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: elegir k desde el lugar de las raíces funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Elegir K desde el lugar de las raíces existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve elegir k desde el lugar de las raíces en tu contexto?
2. ¿Cómo sabrías que elegir k desde el lugar de las raíces no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar elegir k desde el lugar de las raíces?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
a, zeta = 4, 0.5
wn = a / (2 * zeta)
K = wn ** 2
print("wn:", wn)
print("K:", K)
```

```bash
python3 verificacion.py
```

</details>
