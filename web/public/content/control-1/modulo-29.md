# Módulo 29: Electrónica, sensores y control para software e IoT

Capítulo de introducción aplicada a la electrónica, los sensores y el control industrial. Las explicaciones y programas siguientes son originales; las referencias técnicas sostienen el modelo y sus límites.

Este capítulo conecta programación con mediciones físicas. Empieza por unidades, circuitos y lógica antes de integrar sensores. Los ejemplos se ejecutan con la biblioteca estándar de Python; simulan fenómenos y decisiones, no sustituyen montaje, datasheets ni práctica de laboratorio.

**Preparación:** instala Python 3. Cada práctica parte de una carpeta vacía y tú escribes manualmente el archivo indicado; no necesitas clonar ningún proyecto. En Windows reemplaza `python3` por `py`. No requiere compra de componentes ni conexión de cargas eléctricas.

**Proyecto integrador:** diseña un sensor de temperatura para RutaFlow (la aplicación de seguimiento de entregas que se construye en el curso Fundamentos) con señal cruda, calibración, filtrado, consumo, contrato binario y criterios de aceptación. Conserva unidades y condiciones de medición en el registro, para que el backend no confunda una muestra con una verdad absoluta.

**Progresión profesional:** primero predice la salida; después ejecuta, cambia una entrada y explica el efecto. Solo avanza si puedes justificar unidades, supuestos y el límite del modelo. Una simulación que imprime un número no demuestra que un dispositivo funcione.

## Aprende construyendo


### Tema 1: Matemáticas aplicadas: derivada, integral y modelos · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás integrar muestras de corriente y contrastar la carga estimada con un resultado analítico. En una frase: Las matemáticas convierten una variación física en un modelo calculable para predecir corriente, energía o movimiento. Prerrequisitos: Python, variables, fu…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás integrar muestras de corriente y contrastar la carga estimada con un resultado analítico.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en matemáticas aplicadas: derivada, integral y modelos como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que matemáticas aplicadas: derivada, integral y modelos resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Matemáticas aplicadas: derivada, integral y modelos se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Matemáticas aplicadas: derivada, integral y modelos | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses matemáticas aplicadas: derivada, integral y modelos por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: matemáticas aplicadas: derivada, integral y modelos funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Matemáticas aplicadas: derivada, integral y modelos existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve matemáticas aplicadas: derivada, integral y modelos en tu contexto?
2. ¿Cómo sabrías que matemáticas aplicadas: derivada, integral y modelos no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar matemáticas aplicadas: derivada, integral y modelos?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
tiempos = [0, 1, 2, 3]
corrientes = [2 * t for t in tiempos]
# Trapecios: aproximan el área entre dos muestras.
carga = sum((corrientes[i] + corrientes[i+1]) / 2 *
            (tiempos[i+1] - tiempos[i]) for i in range(3))
print(f"Carga: {carga:.1f} C")
```

```bash
python3 matematicas.py
```

```text
Carga: 9.0 C
```

</details>

### Tema 2: Circuitos DC y AC: Kirchhoff, Thévenin y Norton · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás calcular el efecto de una carga usando el equivalente de Thévenin. En una frase: Un circuito distribuye tensiones y corrientes según sus conexiones y permite alimentar o medir dispositivos sin adivinar sus cargas. Prerrequisitos: Python, variables, funciones y…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás calcular el efecto de una carga usando el equivalente de Thévenin.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en circuitos dc y ac: kirchhoff, thévenin y norton como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que circuitos dc y ac: kirchhoff, thévenin y norton resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Circuitos DC y AC: Kirchhoff, Thévenin y Norton se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Circuitos DC y AC: Kirchhoff, Thévenin y Norton | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses circuitos dc y ac: kirchhoff, thévenin y norton por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: circuitos dc y ac: kirchhoff, thévenin y norton funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Circuitos DC y AC: Kirchhoff, Thévenin y Norton existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve circuitos dc y ac: kirchhoff, thévenin y norton en tu contexto?
2. ¿Cómo sabrías que circuitos dc y ac: kirchhoff, thévenin y norton no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar circuitos dc y ac: kirchhoff, thévenin y norton?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
fuente, r1, r2, carga = 5.0, 1000.0, 1000.0, 1000.0
vth = fuente * r2 / (r1 + r2)
rth = r1 * r2 / (r1 + r2)
# La entrada de medida es parte del circuito.
v_carga = vth * carga / (rth + carga)
print(f"Vth={vth:.3f} V; Rth={rth:.0f} ohm; salida={v_carga:.3f} V")
```

```bash
python3 circuitos.py
```

```text
Vth=2.500 V; Rth=500 ohm; salida=1.667 V
```

</details>

### Tema 3: Electrónica analógica: diodos, transistores y amplificadores · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás estimar ganancia de un operacional y detectar saturación por alimentación. En una frase: La electrónica analógica controla señales continuas para amplificar sensores, limitar tensiones y accionar cargas. Prerrequisitos: Python, variables, funciones y unidades…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás estimar ganancia de un operacional y detectar saturación por alimentación.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en electrónica analógica: diodos, transistores y amplificadores como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que electrónica analógica: diodos, transistores y amplificadores resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Electrónica analógica: diodos, transistores y amplificadores se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Electrónica analógica: diodos, transistores y amplificadores | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses electrónica analógica: diodos, transistores y amplificadores por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: electrónica analógica: diodos, transistores y amplificadores funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Electrónica analógica: diodos, transistores y amplificadores existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve electrónica analógica: diodos, transistores y amplificadores en tu contexto?
2. ¿Cómo sabrías que electrónica analógica: diodos, transistores y amplificadores no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar electrónica analógica: diodos, transistores y amplificadores?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
vin, rf, rg, alimentacion = 0.2, 9000, 1000, 3.3
ganancia = 1 + rf / rg
ideal = vin * ganancia
# Modelo didáctico: un amplificador no supera su alimentación.
salida = min(max(ideal, 0), alimentacion)
print(f"Ganancia={ganancia:.1f}; salida={salida:.2f} V")
```

```bash
python3 analogica.py
```

```text
Ganancia=10.0; salida=2.00 V
```

</details>

### Tema 4: Electrónica digital: lógica y máquinas de estados · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir una tabla de verdad y detectar un despacho no autorizado. En una frase: La electrónica digital representa decisiones mediante niveles discretos para construir controladores verificables. Prerrequisitos: Python, variables, funciones y unidades SI; par…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir una tabla de verdad y detectar un despacho no autorizado.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en electrónica digital: lógica y máquinas de estados como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que electrónica digital: lógica y máquinas de estados resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Electrónica digital: lógica y máquinas de estados se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Electrónica digital: lógica y máquinas de estados | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses electrónica digital: lógica y máquinas de estados por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: electrónica digital: lógica y máquinas de estados funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Electrónica digital: lógica y máquinas de estados existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve electrónica digital: lógica y máquinas de estados en tu contexto?
2. ¿Cómo sabrías que electrónica digital: lógica y máquinas de estados no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar electrónica digital: lógica y máquinas de estados?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
for paquete in (False, True):
    for cerrada in (False, True):
        # La decisión exige ambas condiciones.
        despachar = paquete and cerrada
        print(int(paquete), int(cerrada), int(despachar))
```

```bash
python3 digital.py
```

```text
0 0 0
0 1 0
1 0 0
1 1 1
```

</details>

### Tema 5: Microcontroladores: GPIO, ADC, PWM e interrupciones · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás cuantizar una tensión y medir el error de reconstrucción de un ADC. En una frase: Un microcontrolador combina procesador, memoria y periféricos para interactuar con sensores y actuadores. Prerrequisitos: Python, variables, funciones y unidades SI; para temas d…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás cuantizar una tensión y medir el error de reconstrucción de un ADC.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en microcontroladores: gpio, adc, pwm e interrupciones como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que microcontroladores: gpio, adc, pwm e interrupciones resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Microcontroladores: GPIO, ADC, PWM e interrupciones se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Microcontroladores: GPIO, ADC, PWM e interrupciones | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses microcontroladores: gpio, adc, pwm e interrupciones por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: microcontroladores: gpio, adc, pwm e interrupciones funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Microcontroladores: GPIO, ADC, PWM e interrupciones existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve microcontroladores: gpio, adc, pwm e interrupciones en tu contexto?
2. ¿Cómo sabrías que microcontroladores: gpio, adc, pwm e interrupciones no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar microcontroladores: gpio, adc, pwm e interrupciones?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
bits, referencia, voltaje = 12, 3.3, 1.65
maximo = 2 ** bits - 1
# Cuantización ideal; no representa ruido ni tolerancias.
codigo = round(voltaje / referencia * maximo)
reconstruido = codigo / maximo * referencia
print(f"ADC={codigo}; reconstruido={reconstruido:.4f} V")
```

```bash
python3 microcontroladores.py
```

```text
ADC=2048; reconstruido=1.6504 V
```

</details>

### Tema 6: Comunicaciones: modulación y detección de errores · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás detectar un cambio de bit y demostrar una limitación de la paridad. En una frase: Una comunicación codifica información sobre un canal para reconstruirla pese a ruido y limitaciones de ancho de banda. Prerrequisitos: Python, variables, funciones y unidades SI;…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás detectar un cambio de bit y demostrar una limitación de la paridad.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en comunicaciones: modulación y detección de errores como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que comunicaciones: modulación y detección de errores resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Comunicaciones: modulación y detección de errores se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Comunicaciones: modulación y detección de errores | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses comunicaciones: modulación y detección de errores por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: comunicaciones: modulación y detección de errores funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Comunicaciones: modulación y detección de errores existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve comunicaciones: modulación y detección de errores en tu contexto?
2. ¿Cómo sabrías que comunicaciones: modulación y detección de errores no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar comunicaciones: modulación y detección de errores?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
dato = 0b10110010
paridad = bin(dato).count("1") % 2
recibido = dato ^ 0b00000001
# Un cambio de un bit altera la paridad.
valido = bin(recibido).count("1") % 2 == paridad
print(f"Trama válida: {valido}")
```

```bash
python3 comunicaciones.py
```

```text
Trama válida: False
```

</details>

### Tema 7: Señales y sistemas: muestreo, Fourier y convolución · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás reproducir aliasing y justificar una frecuencia de muestreo. En una frase: Una señal describe una magnitud que cambia y un sistema transforma esa señal para medir o controlar algo. Prerrequisitos: Python, variables, funciones y unidades SI; para temas de señal…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás reproducir aliasing y justificar una frecuencia de muestreo.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en señales y sistemas: muestreo, fourier y convolución como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que señales y sistemas: muestreo, fourier y convolución resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Señales y sistemas: muestreo, Fourier y convolución se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Señales y sistemas: muestreo, Fourier y convolución | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses señales y sistemas: muestreo, fourier y convolución por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: señales y sistemas: muestreo, fourier y convolución funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Señales y sistemas: muestreo, Fourier y convolución existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve señales y sistemas: muestreo, fourier y convolución en tu contexto?
2. ¿Cómo sabrías que señales y sistemas: muestreo, fourier y convolución no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar señales y sistemas: muestreo, fourier y convolución?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
import math
fs = 10
a = [math.cos(2 * math.pi * 7 * n / fs) for n in range(10)]
b = [math.cos(2 * math.pi * 3 * n / fs) for n in range(10)]
# El alias se comprueba sobre todas las muestras.
print(f"Diferencia máxima: {max(abs(x-y) for x,y in zip(a,b)):.6f}")
```

```bash
python3 senales.py
```

```text
Diferencia máxima: 0.000000
```

</details>

### Tema 8: DSP: filtros digitales y compresión · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás cuantificar el efecto y el retardo de una media móvil causal. En una frase: El procesamiento digital de señales transforma muestras para reducir ruido, extraer información o reducir almacenamiento. Prerrequisitos: Python, variables, funciones y unidades SI; pa…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás cuantificar el efecto y el retardo de una media móvil causal.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en dsp: filtros digitales y compresión como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que dsp: filtros digitales y compresión resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| DSP: filtros digitales y compresión se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar DSP: filtros digitales y compresión | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses dsp: filtros digitales y compresión por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: dsp: filtros digitales y compresión funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- DSP: filtros digitales y compresión existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve dsp: filtros digitales y compresión en tu contexto?
2. ¿Cómo sabrías que dsp: filtros digitales y compresión no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar dsp: filtros digitales y compresión?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
muestras = [20, 20, 29, 20, 20]
ventana = 3
# Media causal: solo usa presente y pasado.
filtradas = [sum(muestras[i-ventana+1:i+1]) / ventana
             for i in range(ventana-1, len(muestras))]
print(filtradas)
```

```bash
python3 dsp.py
```

```text
[23.0, 23.0, 23.0]
```

</details>

### Tema 9: Instrumentación: calibración, DAQ e incertidumbre · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás calibrar una lectura con dos referencias y comprobar un tercer punto. En una frase: La instrumentación convierte una magnitud física en una medición con unidades, calibración y límites conocidos. Prerrequisitos: Python, variables, funciones y unidades SI; para…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás calibrar una lectura con dos referencias y comprobar un tercer punto.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en instrumentación: calibración, daq e incertidumbre como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que instrumentación: calibración, daq e incertidumbre resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Instrumentación: calibración, DAQ e incertidumbre se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Instrumentación: calibración, DAQ e incertidumbre | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses instrumentación: calibración, daq e incertidumbre por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: instrumentación: calibración, daq e incertidumbre funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Instrumentación: calibración, DAQ e incertidumbre existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve instrumentación: calibración, daq e incertidumbre en tu contexto?
2. ¿Cómo sabrías que instrumentación: calibración, daq e incertidumbre no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar instrumentación: calibración, daq e incertidumbre?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
raw_frio, raw_caliente = 102, 902
ref_frio, ref_caliente = 0.0, 100.0
pendiente = (ref_caliente-ref_frio) / (raw_caliente-raw_frio)
offset = ref_frio - pendiente * raw_frio
# Modelo lineal válido entre referencias bajo estas condiciones.
print(f"Temperatura: {pendiente * 502 + offset:.2f} °C")
```

```bash
python3 sensores.py
```

```text
Temperatura: 50.00 °C
```

</details>

### Tema 10: Control automático: realimentación, PID y estabilidad · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás simular un lazo proporcional y explicar su error estacionario. En una frase: El control automático compara una medición con una referencia y ajusta una acción para reducir el error. Prerrequisitos: Python, variables, funciones y unidades SI; para temas de seña…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás simular un lazo proporcional y explicar su error estacionario.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en control automático: realimentación, pid y estabilidad como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que control automático: realimentación, pid y estabilidad resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Control automático: realimentación, PID y estabilidad se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Control automático: realimentación, PID y estabilidad | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses control automático: realimentación, pid y estabilidad por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: control automático: realimentación, pid y estabilidad funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Control automático: realimentación, PID y estabilidad existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve control automático: realimentación, pid y estabilidad en tu contexto?
2. ¿Cómo sabrías que control automático: realimentación, pid y estabilidad no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar control automático: realimentación, pid y estabilidad?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
temperatura, referencia = 20.0, 25.0
for _ in range(100):
    error = referencia - temperatura
    # Control P con saturación y planta discreta de primer orden.
    potencia = min(10.0, max(0.0, 2 * error))
    temperatura += 0.1 * (potencia - (temperatura - 20))
print(f"Temperatura: {temperatura:.2f} °C")
```

```bash
python3 control.py
```

```text
Temperatura: 23.33 °C
```

</details>

### Tema 11: Potencia: conversión, eficiencia y disipación · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás calcular relación de conversión y pérdidas de una fuente DC. En una frase: La electrónica de potencia transforma energía eléctrica para alimentar cargas dentro de límites eléctricos y térmicos. Prerrequisitos: Python, variables, funciones y unidades SI; para t…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás calcular relación de conversión y pérdidas de una fuente DC.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en potencia: conversión, eficiencia y disipación como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que potencia: conversión, eficiencia y disipación resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Potencia: conversión, eficiencia y disipación se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Potencia: conversión, eficiencia y disipación | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses potencia: conversión, eficiencia y disipación por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: potencia: conversión, eficiencia y disipación funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Potencia: conversión, eficiencia y disipación existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve potencia: conversión, eficiencia y disipación en tu contexto?
2. ¿Cómo sabrías que potencia: conversión, eficiencia y disipación no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar potencia: conversión, eficiencia y disipación?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
vin, vout, corriente, eficiencia = 12, 5, 1, 0.9
duty = vout / vin
pout = vout * corriente
pin = pout / eficiencia
# Las pérdidas se convierten principalmente en calor.
print(f"Duty={duty:.3f}; pérdidas={pin-pout:.3f} W")
```

```bash
python3 potencia.py
```

```text
Duty=0.417; pérdidas=0.556 W
```

</details>

### Tema 12: PCB: esquemático, ERC, DRC y fabricación · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás evaluar una separación de pistas y distinguirla de una revisión DRC completa. En una frase: El diseño de PCB convierte un circuito en conexiones físicas fabricables con reglas eléctricas y geométricas. Prerrequisitos: Python, variables, funciones y unidades SI…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás evaluar una separación de pistas y distinguirla de una revisión DRC completa.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en pcb: esquemático, erc, drc y fabricación como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que pcb: esquemático, erc, drc y fabricación resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| PCB: esquemático, ERC, DRC y fabricación se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar PCB: esquemático, ERC, DRC y fabricación | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses pcb: esquemático, erc, drc y fabricación por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: pcb: esquemático, erc, drc y fabricación funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- PCB: esquemático, ERC, DRC y fabricación existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve pcb: esquemático, erc, drc y fabricación en tu contexto?
2. ¿Cómo sabrías que pcb: esquemático, erc, drc y fabricación no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar pcb: esquemático, erc, drc y fabricación?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
centros_mm, ancho_a, ancho_b, minimo = 0.50, 0.30, 0.30, 0.25
# Distancia de centros menos ambas mitades de pista.
espacio = centros_mm - (ancho_a + ancho_b) / 2
print(f"Espacio={espacio:.2f} mm; cumple={espacio >= minimo}")
```

```bash
python3 pcb.py
```

```text
Espacio=0.20 mm; cumple=False
```

</details>

### Tema 13: Sistemas embebidos: RTOS, buses y firmware · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás estimar utilización de tareas y separar ese cálculo de garantías temporales. En una frase: Un sistema embebido ejecuta una tarea dedicada y coordina hardware y software con restricciones de tiempo, memoria y energía. Prerrequisitos: Python, variables, funcione…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás estimar utilización de tareas y separar ese cálculo de garantías temporales.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en sistemas embebidos: rtos, buses y firmware como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que sistemas embebidos: rtos, buses y firmware resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Sistemas embebidos: RTOS, buses y firmware se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Sistemas embebidos: RTOS, buses y firmware | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses sistemas embebidos: rtos, buses y firmware por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sistemas embebidos: rtos, buses y firmware funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Sistemas embebidos: RTOS, buses y firmware existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sistemas embebidos: rtos, buses y firmware en tu contexto?
2. ¿Cómo sabrías que sistemas embebidos: rtos, buses y firmware no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sistemas embebidos: rtos, buses y firmware?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
def simular_rms(tareas, horizonte_ms):
    """Planificación por prioridad fija Rate Monotonic (menor periodo = mayor
    prioridad), con preempción real tick a tick (resolución 1 ms). Un deadline
    incumplido se detecta observando la ejecución -- no sumando utilización --:
    ocurre cuando llega una nueva instancia de una tarea y la anterior todavía
    tiene trabajo pendiente."""
    orden = sorted(tareas, key=lambda t: t[2])  # menor periodo primero
    restante = {nombre: 0 for nombre, _, _ in tareas}
    fallos = []
    for tick in range(horizonte_ms):
        for nombre, coste, periodo in tareas:
            if tick % periodo == 0:
                if restante[nombre] > 0:
                    fallos.append((tick, nombre, restante[nombre]))
                restante[nombre] = coste
        activa = next((nombre for nombre, _, _ in orden if restante[nombre] > 0), None)
        if activa:
            restante[activa] -= 1
    return fallos


tareas = [("sensor", 2, 20), ("publicar", 5, 100)]
fallos = simular_rms(tareas, horizonte_ms=200)
print(f"Deadlines incumplidos en 200 ms simulados: {len(fallos)}")
for tick, nombre, pendiente in fallos:
    print(f"  t={tick}ms tarea={nombre}: quedan {pendiente}ms de la instancia anterior")
```

```bash
python3 embebidos.py
```

```text
Deadlines incumplidos en 200 ms simulados: 0
```

</details>

### Tema 14: Programación de bajo nivel: C, memoria y depuración · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás codificar una medición de 16 bits y diagnosticar un desacuerdo de endianness. En una frase: La programación de bajo nivel controla representación y memoria para implementar firmware y diagnosticar errores cercanos al hardware. Prerrequisitos: Python, variables…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás codificar una medición de 16 bits y diagnosticar un desacuerdo de endianness.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en programación de bajo nivel: c, memoria y depuración como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que programación de bajo nivel: c, memoria y depuración resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Programación de bajo nivel: C, memoria y depuración se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Programación de bajo nivel: C, memoria y depuración | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses programación de bajo nivel: c, memoria y depuración por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: programación de bajo nivel: c, memoria y depuración funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Programación de bajo nivel: C, memoria y depuración existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve programación de bajo nivel: c, memoria y depuración en tu contexto?
2. ¿Cómo sabrías que programación de bajo nivel: c, memoria y depuración no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar programación de bajo nivel: c, memoria y depuración?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
import struct
medicion = 513
# Contrato explícito: dos bytes, sin signo, little-endian.
trama = struct.pack("<H", medicion)
print(trama.hex(), struct.unpack("<H", trama)[0])
```

```bash
python3 bajo-nivel.py
```

```text
0102 513
```

</details>

### Tema 15: Electromagnetismo: Faraday y líneas de transmisión · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás estimar tensión inducida y explicar cómo influye el área de un lazo. En una frase: El electromagnetismo relaciona cargas, campos y ondas para entender interferencia, antenas y señales rápidas. Prerrequisitos: Python, variables, funciones y unidades SI; para te…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás estimar tensión inducida y explicar cómo influye el área de un lazo.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en electromagnetismo: faraday y líneas de transmisión como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que electromagnetismo: faraday y líneas de transmisión resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Electromagnetismo: Faraday y líneas de transmisión se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Electromagnetismo: Faraday y líneas de transmisión | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses electromagnetismo: faraday y líneas de transmisión por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: electromagnetismo: faraday y líneas de transmisión funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Electromagnetismo: Faraday y líneas de transmisión existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve electromagnetismo: faraday y líneas de transmisión en tu contexto?
2. ¿Cómo sabrías que electromagnetismo: faraday y líneas de transmisión no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar electromagnetismo: faraday y líneas de transmisión?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
area, cambio_campo, intervalo = 0.001, 0.01, 0.001
# Campo uniforme y perpendicular; una sola vuelta.
voltaje = -area * cambio_campo / intervalo
print(f"Tensión inducida: {voltaje:.3f} V")
```

```bash
python3 electromagnetismo.py
```

```text
Tensión inducida: -0.010 V
```

</details>

### Tema 16: Gestión profesional: requisitos, riesgos y evidencia · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás evaluar un criterio de aceptación y documentar cobertura de medida. En una frase: La gestión técnica convierte una necesidad en entregables comprobables y decisiones documentadas que un equipo puede mantener. Prerrequisitos: Python, variables, funciones y unid…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás evaluar un criterio de aceptación y documentar cobertura de medida.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en gestión profesional: requisitos, riesgos y evidencia como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que gestión profesional: requisitos, riesgos y evidencia resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Gestión profesional: requisitos, riesgos y evidencia se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Gestión profesional: requisitos, riesgos y evidencia | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses gestión profesional: requisitos, riesgos y evidencia por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: gestión profesional: requisitos, riesgos y evidencia funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Gestión profesional: requisitos, riesgos y evidencia existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve gestión profesional: requisitos, riesgos y evidencia en tu contexto?
2. ¿Cómo sabrías que gestión profesional: requisitos, riesgos y evidencia no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar gestión profesional: requisitos, riesgos y evidencia?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
referencias = [0, 25, 50]
medidas = [0.2, 25.4, 49.7]
# La aceptación parte de un requisito medible.
errores = [abs(a-b) for a,b in zip(referencias, medidas)]
print(f"Error máximo={max(errores):.2f} °C; acepta={max(errores) <= 0.5}")
```

```bash
python3 gestion.py
```

```text
Error máximo=0.40 °C; acepta=True
```

</details>

### Tema 17: PLC y control industrial: ciclo de scan e IEC 61131-3 · Avanzado · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás reproducir un interlock de control y verificar una orden de marcha. En una frase: Un PLC lee entradas, ejecuta lógica y actualiza salidas cíclicamente para controlar procesos industriales. Prerrequisitos: Python, variables, funciones y unidades SI; para temas…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás reproducir un interlock de control y verificar una orden de marcha.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en plc y control industrial: ciclo de scan e iec 61131-3 como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que plc y control industrial: ciclo de scan e iec 61131-3 resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| PLC y control industrial: ciclo de scan e IEC 61131-3 se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar PLC y control industrial: ciclo de scan e IEC 61131-3 | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses plc y control industrial: ciclo de scan e iec 61131-3 por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: plc y control industrial: ciclo de scan e iec 61131-3 funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- PLC y control industrial: ciclo de scan e IEC 61131-3 existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve plc y control industrial: ciclo de scan e iec 61131-3 en tu contexto?
2. ¿Cómo sabrías que plc y control industrial: ciclo de scan e iec 61131-3 no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar plc y control industrial: ciclo de scan e iec 61131-3?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```python
entradas = {"marcha": True, "puerta_cerrada": False, "alarma": False}
# Interlock: marcha solicitada no basta para habilitar motor.
motor = entradas["marcha"] and entradas["puerta_cerrada"] and not entradas["alarma"]
print(f"Motor habilitado: {motor}")
```

```bash
python3 plc.py
```

```text
Motor habilitado: False
```

```bash
mkdir practica-diodos && cd practica-diodos
```

```python
from fractions import Fraction as F

izquierda, derecha = F(0), F(-10)
x, y, z, u = F(1, 2), F(0), F(-2), F(-10)
w = y - 10
# Corrientes orientadas de ánodo a cátodo según la lista de conexiones.
i2 = (y - z) / 1000
i3 = (z - y) / 1000
i4 = (w - u) / 1000
i1 = (8 - x) / 3000 - i2

# KCL en los cuatro nodos desconocidos.
assert (x - 8) / 3000 + i1 + i2 == 0
assert (y - z) / 1000 + (w - u) / 1000 - i2 == 0
assert (z - y) / 1000 - i3 == 0
assert (u - w) / 1000 + i4 == 0
# Cada hipótesis debe satisfacer tanto tensión como corriente.
assert x - izquierda == F(1, 2) and i1 > 0
assert x - y == F(1, 2) and i2 > 0
assert derecha - z == -8 and i3 < 0
assert -8 < u - derecha < F(1, 2) and i4 == 0

print(f"D1 directa: {float(i1 * 1000):.3f} mA")
print(f"D2 directa: {float(i2 * 1000):.3f} mA")
print(f"D3 ruptura Zener: {float(-i3 * 1000):.3f} mA (sentido inverso)")
print("D4 bloqueado: 0.000 mA")
```

```bash
python3 diodos.py
```

</details>
