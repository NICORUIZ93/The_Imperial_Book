# Módulo 10: Introducción al espacio de estados

Otra forma de describir sistemas, con matrices y ecuaciones de primer orden. Es la base del control moderno y forma parte del examen final de Control I (unidad 6). Aquí ves cómo se arma y cómo se relaciona con \(G(s)\); el análisis y el diseño con estados siguen en los módulos 25 (controlabilidad, observabilidad y ubicación de polos) y 26 (observadores).

**Al terminar podrás:**

- Pasar una ecuación diferencial a la forma \(\dot x = Ax + Bu\), \(y = Cx + Du\).
- Obtener \(G(s)\) a partir de las matrices.
- Ver que los polos son los valores propios de \(A\).

## Aprende construyendo


### Tema 1: La forma de espacio de estados · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por la forma de espacio de estados con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender la forma de espacio de estados te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en la forma de espacio de estados como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que la forma de espacio de estados resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| La forma de espacio de estados se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar La forma de espacio de estados | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses la forma de espacio de estados por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: la forma de espacio de estados funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- La forma de espacio de estados existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve la forma de espacio de estados en tu contexto?
2. ¿Cómo sabrías que la forma de espacio de estados no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar la forma de espacio de estados?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import Matrix, symbols, eye, simplify

s = symbols("s")
A = Matrix([[0, 1], [-2, -3]])
B = Matrix([[0], [1]])
C = Matrix([[1, 0]])
G = simplify((C * (s * eye(2) - A).inv() * B)[0])
print("G(s):", G)
print("valores_propios:", A.eigenvals())
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: De estados a función de transferencia · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por de estados a función de transferencia con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender de estados a función de transferencia te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en de estados a función de transferencia como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que de estados a función de transferencia resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| De estados a función de transferencia se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar De estados a función de transferencia | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses de estados a función de transferencia por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: de estados a función de transferencia funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- De estados a función de transferencia existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve de estados a función de transferencia en tu contexto?
2. ¿Cómo sabrías que de estados a función de transferencia no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar de estados a función de transferencia?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import Matrix, symbols, eye, simplify

s = symbols("s")
A = Matrix([[0, 1], [-5, -2]])
B = Matrix([[0], [1]])
C = Matrix([[1, 0]])
G = simplify((C * (s * eye(2) - A).inv() * B)[0])
print("G(s):", G)
```

```bash
python3 verificacion.py
```

</details>
