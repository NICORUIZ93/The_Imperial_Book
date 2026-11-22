# Módulo 21: Parciales resueltos

Los dos parciales del curso, resueltos paso a paso. Intenta cada punto en papel antes de abrir la solución.

## Aprende construyendo


### Tema 1: Parcial 1 resuelto paso a paso · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por parcial 1 resuelto paso a paso con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender parcial 1 resuelto paso a paso te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en parcial 1 resuelto paso a paso como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que parcial 1 resuelto paso a paso resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Parcial 1 resuelto paso a paso se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Parcial 1 resuelto paso a paso | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses parcial 1 resuelto paso a paso por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: parcial 1 resuelto paso a paso funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Parcial 1 resuelto paso a paso existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve parcial 1 resuelto paso a paso en tu contexto?
2. ¿Cómo sabrías que parcial 1 resuelto paso a paso no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar parcial 1 resuelto paso a paso?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, inverse_laplace_transform, simplify, exp, sin

s, t = symbols("s t", positive=True)
G = 370 / (s**2 + 2*s + 37)
respuesta = inverse_laplace_transform(G, s, t)
esperada = 370 * exp(-t) * sin(6*t) / 6
print("impulso_correcto:", simplify(respuesta - esperada) == 0)
```

```bash
python3 verificacion.py
```

</details>
