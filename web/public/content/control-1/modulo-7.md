# Módulo 7: Circuitos y amplificadores operacionales

Con impedancias en Laplace, un circuito se resuelve como si solo tuviera resistencias. Es el atajo para el punto 2 del Parcial 1.

**Al terminar podrás:**

- Escribir la impedancia de R, C y L, y combinarlas en serie y en paralelo.
- Hallar \(G(s)\) de circuitos RC, RL y RLC con divisor de voltaje.
- Hallar \(G(s)\) de un op-amp inversor y de etapas en cascada.
- Reconocer qué acción de control (P, I, D, PI, PD) implementa cada circuito.

## Aprende construyendo


### Tema 1: Impedancias de resistencia, bobina y condensador en s · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por impedancias de resistencia, bobina y condensador en s con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender impedancias de resistencia, bobina y condensador en s te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en impedancias de resistencia, bobina y condensador en s como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que impedancias de resistencia, bobina y condensador en s resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Impedancias de resistencia, bobina y condensador en s se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Impedancias de resistencia, bobina y condensador en s | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses impedancias de resistencia, bobina y condensador en s por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: impedancias de resistencia, bobina y condensador en s funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Impedancias de resistencia, bobina y condensador en s existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve impedancias de resistencia, bobina y condensador en s en tu contexto?
2. ¿Cómo sabrías que impedancias de resistencia, bobina y condensador en s no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar impedancias de resistencia, bobina y condensador en s?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols

s = symbols("s")
R, L = 2000, 0.5
Z = R + L * s
print("Z(s):", Z)
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Circuitos pasivos: divisor de voltaje · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por circuitos pasivos: divisor de voltaje con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender circuitos pasivos: divisor de voltaje te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en circuitos pasivos: divisor de voltaje como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que circuitos pasivos: divisor de voltaje resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Circuitos pasivos: divisor de voltaje se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Circuitos pasivos: divisor de voltaje | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses circuitos pasivos: divisor de voltaje por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: circuitos pasivos: divisor de voltaje funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Circuitos pasivos: divisor de voltaje existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve circuitos pasivos: divisor de voltaje en tu contexto?
2. ¿Cómo sabrías que circuitos pasivos: divisor de voltaje no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar circuitos pasivos: divisor de voltaje?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify, Rational

s = symbols("s")
R = 10000
C = Rational(1, 10000)  # 100 microfaradios
G = simplify((1 / (C * s)) / (R + 1 / (C * s)))
print("G(s):", G)
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: El op-amp inversor · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por el op-amp inversor con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender el op-amp inversor te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en el op-amp inversor como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
![Op-amp inversor con Zi a la entrada y Zf de realimentación](content/figures/control-1/opamp-inversor.svg)

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| El op-amp inversor se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar El op-amp inversor | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses el op-amp inversor por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: el op-amp inversor funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- El op-amp inversor existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve el op-amp inversor en tu contexto?
2. ¿Cómo sabrías que el op-amp inversor no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar el op-amp inversor?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify, Rational, apart

s = symbols("s")
R1, R2 = 10000, 100000
C = Rational(1, 100000)  # 10 microfaradios
Zf = R2 + 1 / (C * s)
G = simplify(-Zf / R1)
print("G(s):", apart(G))
```

```bash
python3 verificacion.py
```

</details>
