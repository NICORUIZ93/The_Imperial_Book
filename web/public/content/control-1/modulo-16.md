# Módulo 16: Plano s, estabilidad y zona de diseño

Dónde están los polos te dice cómo se comporta el sistema sin hacer cuentas. Las especificaciones se vuelven regiones del plano.

**Al terminar podrás:**

- Decidir si un sistema es estable mirando sus polos.
- Leer \(\zeta\), \(\omega_n\), \(M_p\), \(t_p\) y \(t_s\) de la posición de un polo.
- Dibujar la zona de diseño para unas especificaciones y explicar por qué es esa (Parcial 2).
- Verificar si unos polos candidatos cumplen.

## Aprende construyendo


### Tema 1: Geometría de un polo en el plano s · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por geometría de un polo en el plano s con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender geometría de un polo en el plano s te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en geometría de un polo en el plano s como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
![Geometría de un polo complejo: sigma, omega d, omega n y theta](content/figures/control-1/geometria-polo.svg)

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Geometría de un polo en el plano s se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Geometría de un polo en el plano s | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses geometría de un polo en el plano s por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: geometría de un polo en el plano s funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Geometría de un polo en el plano s existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve geometría de un polo en el plano s en tu contexto?
2. ¿Cómo sabrías que geometría de un polo en el plano s no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar geometría de un polo en el plano s?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import sqrt, N

sigma, wd = 2, 2
wn = sqrt(sigma ** 2 + wd ** 2)
zeta = sigma / wn
print("wn:", N(wn, 4))
print("zeta:", N(zeta, 4))
```

```bash
python3 verificacion.py
```

</details>

### Tema 2: Estabilidad según la posición de los polos · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por estabilidad según la posición de los polos con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender estabilidad según la posición de los polos te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en estabilidad según la posición de los polos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que estabilidad según la posición de los polos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Estabilidad según la posición de los polos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Estabilidad según la posición de los polos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses estabilidad según la posición de los polos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: estabilidad según la posición de los polos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Estabilidad según la posición de los polos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve estabilidad según la posición de los polos en tu contexto?
2. ¿Cómo sabrías que estabilidad según la posición de los polos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar estabilidad según la posición de los polos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, solve, re

s = symbols("s")
raices = solve(s ** 2 - s + 2, s)
print("raices:", raices)
print("estable:", all(re(r) < 0 for r in raices))
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: La zona de diseño · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por la zona de diseño con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender la zona de diseño te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en la zona de diseño como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
![Zona de diseño para polos en -3 más o menos 5j](content/figures/control-1/zona-diseno.svg)

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| La zona de diseño se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar La zona de diseño | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses la zona de diseño por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: la zona de diseño funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- La zona de diseño existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve la zona de diseño en tu contexto?
2. ¿Cómo sabrías que la zona de diseño no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar la zona de diseño?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import log, sqrt, pi, acos, deg, N

Mp, ts = 0.20, 2
zeta_min = N(-log(Mp) / sqrt(pi ** 2 + log(Mp) ** 2), 3)
theta_max = N(deg(acos(zeta_min)), 3)
sigma_min = 4 / ts
print("zeta_min:", zeta_min)
print("theta_max:", theta_max)
print("sigma_min:", sigma_min)
```

```bash
python3 verificacion.py
```

</details>
