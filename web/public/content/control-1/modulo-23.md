# Módulo 23: Criterio de Nyquist

El diagrama de Bode (módulo 20) te dio los márgenes. El criterio de Nyquist explica de dónde salen y responde algo que Bode no puede: si el lazo cerrado es estable aunque el lazo abierto sea inestable. Es la unidad 5 del programa de Control I y entra en el examen final.

**Al terminar podrás:**

- Dibujar el diagrama polar de \(L(j\omega)\) y leer en él los márgenes de ganancia y de fase.
- Aplicar \(Z = N + P\) para decidir la estabilidad del lazo cerrado y hallar el rango de \(K\).
- Tratar polos en el origen y lazos abiertos inestables, y saber cuándo los márgenes de Bode engañan.

**Prerrequisitos:** módulos 15 (Routh-Hurwitz) y 20 (Bode y márgenes). **Lee en la bibliografía:** Ogata, cap. 7; Nise, cap. 10; Dorf y Bishop, cap. 9; Golnaraghi y Kuo, cap. 10.

**Laboratorio.** Trabajas en `academia-labs/control-1` con el entorno del módulo 0. Si aún no tienes `python-control`, instálalo con `python3 -m pip install control` (este módulo se verificó con `control 0.10.2`).

## Aprende construyendo


### Tema 1: Del Bode al diagrama polar · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por del bode al diagrama polar con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender del bode al diagrama polar te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en del bode al diagrama polar como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
![Diagrama de Nyquist de K/((s+1)(s+2)(s+3)) para K = 30 y K = 90](content/figures/control-1/nyquist-tercer-orden.svg)

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Del Bode al diagrama polar se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Del Bode al diagrama polar | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses del bode al diagrama polar por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: del bode al diagrama polar funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Del Bode al diagrama polar existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve del bode al diagrama polar en tu contexto?
2. ¿Cómo sabrías que del bode al diagrama polar no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar del bode al diagrama polar?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# nyquist_puntos.py
import numpy as np
import control as ct

L = ct.tf([30], [1, 6, 11, 6])        # 30/((s+1)(s+2)(s+3))
w_cruce = np.sqrt(11)

print("L(j0) =", round(L(0j).real, 3))
print("w_cruce =", round(w_cruce, 3))
print("L(j w_cruce) =", round(L(1j * w_cruce).real, 3))
print("|L(j1000)| =", f"{abs(L(1000j)):.1e}")
```

```text
L(j0) = 5.0
w_cruce = 3.317
L(j w_cruce) = -0.5
|L(j1000)| = 3.0e-08
```

```python
gm, pm, w_pc, w_gc = ct.margin(L)
print("MG =", round(gm, 2), "veces =", round(20 * np.log10(gm), 2), "dB")
print("MF =", round(pm, 1), "grados en w =", round(w_gc, 2))
```

```python
# nyquist_figura.py
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import control as ct

L = ct.tf([30], [1, 6, 11, 6])
ct.nyquist_plot(L)
plt.savefig("nyquist_k30.png")
print("L(+j2) =", complex(round(L(2j).real, 3), round(L(2j).imag, 3)))
print("L(-j2) =", complex(round(L(-2j).real, 3), round(L(-2j).imag, 3)))
```

</details>

### Tema 2: El criterio Z = N + P · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por el criterio z = n + p con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender el criterio z = n + p te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en el criterio z = n + p como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que el criterio z = n + p resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| El criterio Z = N + P se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar El criterio Z = N + P | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses el criterio z = n + p por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: el criterio z = n + p funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- El criterio Z = N + P existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve el criterio z = n + p en tu contexto?
2. ¿Cómo sabrías que el criterio z = n + p no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar el criterio z = n + p?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# nyquist_criterio.py
import numpy as np
import control as ct

for K in (30, 90):
    L = ct.tf([K], [1, 6, 11, 6])
    N = ct.nyquist_response(L).count      # vueltas horarias alrededor de -1
    P = int(np.sum(L.poles().real > 0))   # polos de L en el semiplano derecho
    Z = N + P
    inestables = int(np.sum(ct.feedback(L, 1).poles().real > 0))
    print(f"K={K}: N={N}, P={P}, Z={Z}, polos inestables del lazo cerrado={inestables}")
```

```text
K=30: N=0, P=0, Z=0, polos inestables del lazo cerrado=0
K=90: N=2, P=0, Z=2, polos inestables del lazo cerrado=2
```

```python
L1 = ct.tf([1], [1, 6, 11, 6])           # el lazo con K = 1
cruce = L1(1j * np.sqrt(11)).real
print("cruce con K=1:", round(cruce, 4))
print("K limite:", round(-1 / cruce, 1))
print("polos con K=60:", np.round(ct.feedback(60 * L1, 1).poles(), 3))
```

```python
# nyquist_inestable.py
import numpy as np
import control as ct

for K in (0.5, 2):
    L = ct.tf([K], [1, -1])              # K/(s - 1)
    N = ct.nyquist_response(L).count
    P = int(np.sum(L.poles().real > 0))
    polo = ct.feedback(L, 1).poles()[0].real
    print(f"K={K}: N={N}, P={P}, Z={N + P}, polo del lazo cerrado={polo}")
```

```text
K=0.5: N=0, P=1, Z=1, polo del lazo cerrado=0.5
K=2: N=-1, P=1, Z=0, polo del lazo cerrado=-1.0
```

</details>

### Tema 3: Polos en el origen y estabilidad relativa · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por polos en el origen y estabilidad relativa con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender polos en el origen y estabilidad relativa te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en polos en el origen y estabilidad relativa como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que polos en el origen y estabilidad relativa resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Polos en el origen y estabilidad relativa se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Polos en el origen y estabilidad relativa | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses polos en el origen y estabilidad relativa por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: polos en el origen y estabilidad relativa funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Polos en el origen y estabilidad relativa existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve polos en el origen y estabilidad relativa en tu contexto?
2. ¿Cómo sabrías que polos en el origen y estabilidad relativa no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar polos en el origen y estabilidad relativa?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# nyquist_integrador.py
import numpy as np
import control as ct

L1 = ct.tf([1], [1, 3, 2, 0])            # 1/(s(s+1)(s+2))
print("cruce con K=1:", round(L1(1j * np.sqrt(2)).real, 4))
print("asintota real:", round(L1(1e-4j).real, 3))
for K in (3, 9):
    L = K * L1
    N = ct.nyquist_response(L).count
    print(f"K={K}: N={N}, polos LC={np.round(ct.feedback(L, 1).poles(), 3)}")
```

```text
cruce con K=1: -0.1667
asintota real: -0.75
K=3: N=0, polos LC=[-2.672+0.j    -0.164+1.047j -0.164-1.047j]
K=9: N=2, polos LC=[-3.24+0.j     0.12+1.662j  0.12-1.662j]
```

```python
L = 3 * L1
gm, pm, w_pc, w_gc = ct.margin(L)
w = np.logspace(-2, 2, 20000)
distancia = np.min(np.abs(1 + L(1j * w)))
print("MG =", round(gm, 2), "MF =", round(pm, 1), "distancia minima a -1 =", round(distancia, 3))
```

```python
# margenes_engano.py
import control as ct

L = ct.tf([2], [1, -1])                  # 2/(s - 1), estable en lazo cerrado
gm, pm, w_pc, w_gc = ct.margin(L)
print("MG =", round(gm, 2), "MF =", round(pm, 1))
print("polo del lazo cerrado:", ct.feedback(L, 1).poles()[0].real)
print("N =", ct.nyquist_response(L).count)
```

</details>
