# Módulo 9: Linealización

Todo lo que ves en este curso supone sistemas lineales. Los reales casi nunca lo son (un tanque que se vacía por gravedad, un péndulo). Linealizar es aproximarlos por una recta alrededor del punto donde trabajan.

**Al terminar podrás:**

- Encontrar un punto de equilibrio.
- Linealizar con la serie de Taylor y obtener una \(G(s)\) válida cerca de ese punto.

## Aprende construyendo


### Tema 1: La idea de la linealización: aproximar con la recta tangente · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por la idea de la linealización: aproximar con la recta tangente con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender la idea de la linealización: aproximar con la recta tangente te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en la idea de la linealización: aproximar con la recta tangente como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que la idea de la linealización: aproximar con la recta tangente resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| La idea de la linealización: aproximar con la recta tangente se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar La idea de la linealización: aproximar con la recta tangente | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses la idea de la linealización: aproximar con la recta tangente por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: la idea de la linealización: aproximar con la recta tangente funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- La idea de la linealización: aproximar con la recta tangente existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve la idea de la linealización: aproximar con la recta tangente en tu contexto?
2. ¿Cómo sabrías que la idea de la linealización: aproximar con la recta tangente no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar la idea de la linealización: aproximar con la recta tangente?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, sqrt, diff

x = symbols("x")
f = sqrt(x)
print("f(4):", f.subs(x, 4))
print("f'(4):", diff(f, x).subs(x, 4))
```

```bash
python3 verificacion.py
```

</details>
