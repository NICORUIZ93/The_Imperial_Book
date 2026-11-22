# Módulo 5: Sistemas de control y diagramas de bloques

Qué es un sistema de control, cuáles son sus partes y cómo combinar bloques para llegar a una sola función de transferencia.

**Al terminar podrás:**

- Explicar lazo abierto y lazo cerrado con ejemplos.
- Enumerar y definir los elementos de cualquier sistema (punto 1 del Parcial 1).
- Reducir diagramas: serie, paralelo y realimentación.

## Aprende construyendo


### Tema 1: ¿Qué es un sistema de control? · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por ¿qué es un sistema de control? con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender ¿qué es un sistema de control? te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en ¿qué es un sistema de control? como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
![Diagrama de bloques de lazo cerrado](content/figures/control-1/lazo-cerrado.svg)

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| ¿Qué es un sistema de control? se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar ¿Qué es un sistema de control? | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses ¿qué es un sistema de control? por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: ¿qué es un sistema de control? funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- ¿Qué es un sistema de control? existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve ¿qué es un sistema de control? en tu contexto?
2. ¿Cómo sabrías que ¿qué es un sistema de control? no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar ¿qué es un sistema de control??

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
# Compara lazo abierto vs. lazo cerrado ante una perturbación D=1,
# usando Y/D = 1/(1+C*Gp) (se demuestra más adelante, en el Tema 3).
Gp = 10  # ganancia de la planta
C = 10   # ganancia del controlador
D = 1    # perturbación

y_abierto = D
y_cerrado = D / (1 + C * Gp)
print("lazo_abierto:", y_abierto)
print("lazo_cerrado:", y_cerrado)
```

```bash
python3 verificacion.py
```

```python
#!/usr/bin/env python3
"""Simula un tanque lineal con control P y PI; solo usa la biblioteca estándar."""

import argparse
import csv
from pathlib import Path

AREA = 2.0       # m²
SALIDA = 0.5     # m²/s; q_salida = SALIDA * altura
PASO = 0.02      # s
DURACION = 50.0  # s
CAMBIO = 5.0     # s

def simular(kp: float, ki: float) -> list[tuple[float, float, float, float]]:
    altura = 1.0
    integral = 0.0
    filas = []
    for n in range(round(DURACION / PASO) + 1):
        tiempo = n * PASO
        referencia = 1.0 if tiempo < CAMBIO else 1.5
        error = referencia - altura
        caudal_libre = 0.5 + kp * error + ki * integral
        caudal = max(0.0, min(1.5, caudal_libre))
        filas.append((tiempo, referencia, altura, caudal))
        if n < round(DURACION / PASO):
            if 0.0 < caudal_libre < 1.5 or (caudal == 0 and error > 0) or (caudal == 1.5 and error < 0):
                integral += error * PASO
            altura += (caudal - SALIDA * altura) / AREA * PASO
    return filas

def guardar_csv(ruta: Path, filas: list[tuple[float, float, float, float]]) -> None:
    with ruta.open("w", newline="", encoding="utf-8") as archivo:
        escritor = csv.writer(archivo)
        escritor.writerow(("tiempo_s", "referencia_m", "altura_m", "caudal_m3_s"))
        escritor.writerows((f"{valor:.4f}" for valor in fila) for fila in filas)

def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--salida", type=Path, default=Path("."))
    args = parser.parse_args()
    args.salida.mkdir(parents=True, exist_ok=True)
    for nombre, kp, ki in (("P", 0.8, 0.0), ("PI", 0.8, 0.15)):
        filas = simular(kp, ki)
        guardar_csv(args.salida / f"tanque-{nombre}.csv", filas)
        final = filas[-1][2]
        print(f"{nombre}: altura_final={final:.3f} m; error_final={1.5-final:.3f} m")

if __name__ == "__main__":
    main()
```

</details>

### Tema 2: Los elementos de un lazo de control · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por los elementos de un lazo de control con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender los elementos de un lazo de control te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en los elementos de un lazo de control como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que los elementos de un lazo de control resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Los elementos de un lazo de control se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Los elementos de un lazo de control | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses los elementos de un lazo de control por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: los elementos de un lazo de control funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Los elementos de un lazo de control existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve los elementos de un lazo de control en tu contexto?
2. ¿Cómo sabrías que los elementos de un lazo de control no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar los elementos de un lazo de control?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
sistema = {
    "variable": "temperatura (180 C)",
    "planta": "horno con aire y paredes",
    "sensor": "termopar",
    "actuador": "resistencia electrica",
    "controlador": "calcula error y decide la accion",
    "perturbacion": "apertura de la puerta",
}
for elemento, definicion in sistema.items():
    print(f"{elemento}: {definicion}")
```

```bash
python3 verificacion.py
```

</details>

### Tema 3: Álgebra de bloques · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por álgebra de bloques con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender álgebra de bloques te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en álgebra de bloques como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que álgebra de bloques resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Álgebra de bloques se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Álgebra de bloques | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses álgebra de bloques por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: álgebra de bloques funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Álgebra de bloques existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve álgebra de bloques en tu contexto?
2. ¿Cómo sabrías que álgebra de bloques no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar álgebra de bloques?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
# verificacion.py
from sympy import symbols, simplify, together

s = symbols("s")
G = 10 / (s + 2)
T = simplify(G / (1 + G))
print("T(s):", together(T))
```

```bash
python3 verificacion.py
```

</details>
