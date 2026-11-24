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
