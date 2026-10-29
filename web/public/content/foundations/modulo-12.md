# Módulo 12: Electrónica, sensores y control para software e IoT

Capítulo de introducción aplicada a las 16 áreas de la página 4 y al control industrial de la página 42 de `merged.pdf`. El PDF es una colección de capturas, no un manual validado. Las explicaciones y programas siguientes son originales; las referencias técnicas sostienen el modelo y sus límites.

Este capítulo conecta programación con mediciones físicas. Empieza por unidades, circuitos y lógica antes de integrar sensores. Los ejemplos se ejecutan con la biblioteca estándar de Python; simulan fenómenos y decisiones, no sustituyen montaje, datasheets ni práctica de laboratorio.

**Preparación:** instala Python 3 y Git, clona la academia y ejecuta los comandos desde la raíz. En Windows reemplaza `python3` por `py`. No requiere compra de componentes ni conexión de cargas eléctricas.

**Proyecto integrador:** diseña un sensor de temperatura para RutaFlow con señal cruda, calibración, filtrado, consumo, contrato binario y criterios de aceptación. Conserva unidades y condiciones de medición en el registro, para que el backend no confunda una muestra con una verdad absoluta.

**Progresión profesional:** primero predice la salida; después ejecuta, cambia una entrada y explica el efecto. Solo avanza si puedes justificar unidades, supuestos y el límite del modelo. Una simulación que imprime un número no demuestra que un dispositivo funcione.

## Aprende construyendo

### Tema 1: Matemáticas aplicadas: derivada, integral y modelos

#### Paso 1 · Objetivo y preparación
Al finalizar podrás integrar muestras de corriente y contrastar la carga estimada con un resultado analítico. **En una frase:** Las matemáticas convierten una variación física en un modelo calculable para predecir corriente, energía o movimiento. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/matematicas.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Un sensor de una entrega informa corriente cada segundo; integrar esas muestras estima carga consumida por su batería. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** La derivada es el velocímetro y la integral es el odómetro: una describe cuánto cambia algo y la otra acumula cambios. Para una carga Q(t)=t², I(t)=dQ/dt=2t. La integración numérica aproxima áreas; reducir el paso permite estudiar el error. Álgebra lineal expresa circuitos como Ax=b; las ecuaciones diferenciales describen RC/RLC; Laplace facilita estudiar transitorios y Fourier separa frecuencias. Las series aproximan funciones dentro de su región de convergencia, no universalmente.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/matematicas.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
tiempos = [0, 1, 2, 3]
corrientes = [2 * t for t in tiempos]
# Trapecios: aproximan el área entre dos muestras.
carga = sum((corrientes[i] + corrientes[i+1]) / 2 *
            (tiempos[i+1] - tiempos[i]) for i in range(3))
print(f"Carga: {carga:.1f} C")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/matematicas.py
```

**Salida esperada:**

```text
Carga: 9.0 C
```

**Explicación por bloques:** `tiempos` define segundos y `corrientes` amperios; la comprensión calcula I(t)=2t. Cada término de `sum` multiplica corriente media por duración: amperios por segundos son culombios. Hay tres intervalos aunque existan cuatro muestras. Para esta corriente lineal, el área 0–3 coincide con 3²=9 C.

**Fallo deliberado y diagnóstico:** Cambia el último tiempo a 2: el muestreo deja de representar intervalos de un segundo; diagnostica comparando cada diferencia de tiempos. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Calcula la carga hasta t=4 y contrasta con Q(4)-Q(0)=16 C. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** El trapecio es exacto aquí porque la corriente es lineal; para señales curvas existe error de discretización.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué unidad tiene la derivada de carga?
2. ¿Por qué el intervalo importa al integrar?
3. ¿Qué cambia al duplicar la frecuencia de muestreo?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 2: Circuitos DC y AC: Kirchhoff, Thévenin y Norton

#### Paso 1 · Objetivo y preparación
Al finalizar podrás calcular el efecto de una carga usando el equivalente de Thévenin. **En una frase:** Un circuito distribuye tensiones y corrientes según sus conexiones y permite alimentar o medir dispositivos sin adivinar sus cargas. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/circuitos.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Una entrada ADC carga un divisor de tensión; su voltaje cae respecto al valor calculado sin carga. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Una red de agua ayuda a recordar que en un nodo se conserva flujo, pero la corriente eléctrica exige un circuito cerrado. Kirchhoff impone suma de corrientes cero en nodos y suma de tensiones cero en lazos. Thévenin reduce una red lineal a Vth en serie con Rth; Norton usa In=Vth/Rth en paralelo. Superposición combina respuestas lineales, no potencias. En AC se usan impedancias: R, jωL y 1/(jωC); la potencia activa es Vrms·Irms·cos(φ). RC, RL y RLC almacenan energía y generan transitorios.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/circuitos.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
fuente, r1, r2, carga = 5.0, 1000.0, 1000.0, 1000.0
vth = fuente * r2 / (r1 + r2)
rth = r1 * r2 / (r1 + r2)
# La entrada de medida es parte del circuito.
v_carga = vth * carga / (rth + carga)
print(f"Vth={vth:.3f} V; Rth={rth:.0f} ohm; salida={v_carga:.3f} V")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/circuitos.py
```

**Salida esperada:**

```text
Vth=2.500 V; Rth=500 ohm; salida=1.667 V
```

**Explicación por bloques:** `fuente`, resistencias y carga definen el divisor. `vth` calcula su salida sin carga; `rth` calcula el paralelo de las resistencias con la fuente ideal cortocircuitada. La última expresión modela el divisor entre Rth y la carga: 2.5·1000/1500=1.667 V. Conectar la entrada no deja intacto el circuito.

**Fallo deliberado y diagnóstico:** Sustituye r1 por 1 creyendo que representa 1 kΩ; diagnostica el error de unidades. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Usa una carga de 100000 ohm y explica por qué se aproxima a 2.5 V. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** Con fuentes dependientes se conservan sus relaciones y se aplica una fuente de prueba; no se borran todas las fuentes sin criterio.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué conserva Kirchhoff?
2. ¿Por qué cambia la salida al conectar una carga?
3. ¿Qué fuentes se desactivan para calcular Rth?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 3: Electrónica analógica: diodos, transistores y amplificadores

#### Paso 1 · Objetivo y preparación
Al finalizar podrás estimar ganancia de un operacional y detectar saturación por alimentación. **En una frase:** La electrónica analógica controla señales continuas para amplificar sensores, limitar tensiones y accionar cargas. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/analogica.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Una señal de temperatura de 0.2 V requiere ganancia diez para usar mejor el rango de un ADC de 3.3 V. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Un amplificador se parece a un megáfono: aumenta una señal usando energía de su alimentación. Un diodo conduce asimétricamente; el modelo de caída fija es una aproximación. BJT y MOSFET pueden amplificar o conmutar según su polarización. Un operacional con realimentación negativa aproxima V+=V− dentro de sus límites de alimentación, ganancia y ancho de banda. Fuentes y reguladores estabilizan alimentación; osciladores generan señales; filtros seleccionan frecuencias.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/analogica.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
vin, rf, rg, alimentacion = 0.2, 9000, 1000, 3.3
ganancia = 1 + rf / rg
ideal = vin * ganancia
# Modelo didáctico: un amplificador no supera su alimentación.
salida = min(max(ideal, 0), alimentacion)
print(f"Ganancia={ganancia:.1f}; salida={salida:.2f} V")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/analogica.py
```

**Salida esperada:**

```text
Ganancia=10.0; salida=2.00 V
```

**Explicación por bloques:** La razón `rf/rg` fija la ganancia no inversora 1+9=10. `ideal` calcula 0.2·10=2 V y `min/max` limita la salida entre 0 y 3.3 V. Ese recorte representa saturación, no una respuesta lineal que sigue amplificando. Un dispositivo real suele tener un margen adicional respecto a los rieles.

**Fallo deliberado y diagnóstico:** Cambia vin a 0.5: aparece saturación a 3.3 V; el diagnóstico compara salida ideal de 5 V con alimentación. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Calcula la máxima entrada sin saturar y compara con el datasheet de un operacional real. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** El modelo no incluye caída de salida, slew rate ni corriente máxima. En la página 65 del PDF identifica primero polaridades y si cada símbolo es Zener; prueba cada hipótesis de conducción mediante KCL y desigualdades. No traslades la caída de 0.5 V a cualquier componente real.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿De dónde sale la energía amplificada?
2. ¿Cuándo falla V+=V−?
3. ¿Por qué importa la polaridad de un diodo?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 4: Electrónica digital: lógica y máquinas de estados

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir una tabla de verdad y detectar un despacho no autorizado. **En una frase:** La electrónica digital representa decisiones mediante niveles discretos para construir controladores verificables. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/digital.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Una puerta de almacén autoriza despacho solo si hay paquete y la puerta está cerrada. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Un semáforo es una máquina de estados: la misma entrada produce efectos distintos según el estado actual. Álgebra booleana modela AND, OR y NOT; un circuito combinacional depende de entradas actuales y uno secuencial conserva memoria. Contadores, registros y memorias almacenan estado. TTL y CMOS describen familias eléctricas con umbrales, alimentación y capacidad de corriente distintos, no solo ceros y unos.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/digital.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
for paquete in (False, True):
    for cerrada in (False, True):
        # La decisión exige ambas condiciones.
        despachar = paquete and cerrada
        print(int(paquete), int(cerrada), int(despachar))
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/digital.py
```

**Salida esperada:**

```text
0 0 0
0 1 0
1 0 0
1 1 1
```

**Explicación por bloques:** Los dos bucles enumeran cuatro pares de entradas: no son cuatro instantes de una máquina con memoria. `and` exige ambas condiciones y `int` presenta False/True como 0/1. La única salida habilitada es 1,1; el contraejemplo con puerta abierta demuestra la diferencia respecto a `or`.

**Fallo deliberado y diagnóstico:** Cambia and por or: permite despacho con puerta abierta; localiza el contraejemplo en la tabla. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Añade estado BLOQUEADO y exige rearme después de una alarma. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** Una simulación booleana no verifica rebotes, tiempos de setup/hold ni metastabilidad.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué diferencia lógica combinacional y secuencial?
2. ¿Dónde se guarda el estado?
3. ¿Por qué 3.3 V no siempre es compatible con 5 V?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 5: Microcontroladores: GPIO, ADC, PWM e interrupciones

#### Paso 1 · Objetivo y preparación
Al finalizar podrás cuantizar una tensión y medir el error de reconstrucción de un ADC. **En una frase:** Un microcontrolador combina procesador, memoria y periféricos para interactuar con sensores y actuadores. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/microcontroladores.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** El dispositivo del repartidor convierte la batería en una lectura ADC y reporta autonomía. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Es una pequeña oficina: CPU decide, memoria conserva trabajo y periféricos atienden entradas y salidas. GPIO lee niveles; ADC cuantiza voltaje; PWM varía el ciclo de trabajo de pulsos. UART es comunicación serial asíncrona; I2C usa direcciones y dos líneas; SPI suele usar reloj y selección de dispositivo. Interrupciones notifican eventos y temporizadores marcan periodos sin bloquear el programa. C/C++ permiten controlar registros y memoria, pero Python aquí solo simula el cálculo.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/microcontroladores.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
bits, referencia, voltaje = 12, 3.3, 1.65
maximo = 2 ** bits - 1
# Cuantización ideal; no representa ruido ni tolerancias.
codigo = round(voltaje / referencia * maximo)
reconstruido = codigo / maximo * referencia
print(f"ADC={codigo}; reconstruido={reconstruido:.4f} V")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/microcontroladores.py
```

**Salida esperada:**

```text
ADC=2048; reconstruido=1.6504 V
```

**Explicación por bloques:** 12 bits representan 4096 códigos de 0 a 4095; por eso `maximo` resta uno. `round` asigna 1.65 V al código 2048, y la operación inversa da 1.6504 V. Este modelo de escala es didáctico: el fabricante puede especificar umbrales y LSB con otra convención. El error de redondeo no representa toda la incertidumbre.

**Fallo deliberado y diagnóstico:** Usa referencia=5 con una placa de 3.3 V: la conversión reporta un voltaje incorrecto. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Compara cuantización a 8 y 12 bits; agrega validación de 0 <= voltaje <= referencia. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** No se conectan voltajes fuera del rango de un pin. La arquitectura real requiere reloj, datasheet y niveles compatibles.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué hace el ADC?
2. ¿Por qué PWM no es tensión analógica instantánea?
3. ¿Qué trabajo debe evitar una interrupción?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 6: Comunicaciones: modulación y detección de errores

#### Paso 1 · Objetivo y preparación
Al finalizar podrás detectar un cambio de bit y demostrar una limitación de la paridad. **En una frase:** Una comunicación codifica información sobre un canal para reconstruirla pese a ruido y limitaciones de ancho de banda. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/comunicaciones.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Un sensor envía un byte y un bit de paridad; el receptor detecta una alteración simple. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Hablar por teléfono separa mensaje, medio y receptor. Modulación modifica amplitud, frecuencia o fase de una portadora; demodulación recupera el mensaje. La teoría de información relaciona incertidumbre, tasa y capacidad. Código de línea representa bits físicamente; antenas y propagación determinan alcance y pérdidas. Detectar un error no equivale a corregirlo ni autenticar al emisor.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/comunicaciones.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
dato = 0b10110010
paridad = bin(dato).count("1") % 2
recibido = dato ^ 0b00000001
# Un cambio de un bit altera la paridad.
valido = bin(recibido).count("1") % 2 == paridad
print(f"Trama válida: {valido}")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/comunicaciones.py
```

**Salida esperada:**

```text
Trama válida: False
```

**Explicación por bloques:** `bin(x).count("1")` cuenta los bits en 1 del byte; el módulo dos calcula paridad. XOR con 1 invierte un bit sin tocar los demás. El receptor vuelve a calcular y compara: una cuenta impar cambia de paridad. Invertir dos bits puede mantenerla, así que el resultado True no demostraría integridad completa.

**Fallo deliberado y diagnóstico:** Invierte dos bits con ^ 0b00000011: la paridad acepta una trama corrupta; identifica su límite. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Propón CRC para detección y un MAC para autenticidad; explica qué problema resuelve cada uno. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** El ejemplo opera sobre bits ideales; no modela BER, sincronización ni presupuesto de enlace.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué modula una portadora?
2. ¿Por qué paridad falla con dos cambios?
3. ¿Detectar errores autentica al sensor?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 7: Señales y sistemas: muestreo, Fourier y convolución

#### Paso 1 · Objetivo y preparación
Al finalizar podrás reproducir aliasing y justificar una frecuencia de muestreo. **En una frase:** Una señal describe una magnitud que cambia y un sistema transforma esa señal para medir o controlar algo. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/senales.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Un sensor vibratorio de 7 Hz muestreado a 10 Hz produce muestras indistinguibles de otra frecuencia. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Tomar fotos de una rueda ilustra el muestreo: si fotografías demasiado lento puede parecer que gira al revés. Un sistema LTI es lineal e invariante en el tiempo; su salida es la convolución de entrada con respuesta al impulso. Correlación mide semejanza a distintos desplazamientos. Fourier analiza frecuencias y Laplace incluye dinámica y condiciones de convergencia. Reconstrucción exige señal acotada en banda y filtrado antialias previo.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/senales.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
import math
fs = 10
a = [math.cos(2 * math.pi * 7 * n / fs) for n in range(10)]
b = [math.cos(2 * math.pi * 3 * n / fs) for n in range(10)]
# El alias se comprueba sobre todas las muestras.
print(f"Diferencia máxima: {max(abs(x-y) for x,y in zip(a,b)):.6f}")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/senales.py
```

**Salida esperada:**

```text
Diferencia máxima: 0.000000
```

**Explicación por bloques:** Ambas listas toman diez muestras en los mismos instantes n/fs. Una describe coseno de 7 Hz y otra de 3 Hz; a 10 muestras/s sus valores coinciden por periodicidad y simetría del coseno. `max(abs(...))` comprueba toda la secuencia; la salida redondeada a seis decimales oculta solo residuos de coma flotante, no la identidad de las señales continuas.

**Fallo deliberado y diagnóstico:** Concluye que la señal original era de 3 Hz: el fallo es inferir frecuencia sin controlar el muestreo. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Sube fs a 20 y compara otra vez; explica el criterio fs > 2·fmax. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** El teorema ideal no garantiza reconstrucción con ruido, banda desconocida o reloj irregular.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué conserva una muestra?
2. ¿Qué es aliasing?
3. ¿Por qué el filtro antialias debe actuar antes del ADC?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

**Diagrama interactivo:** [Muestreo y aliasing: 7 Hz y 3 Hz a 10 muestras/s](/visuals/temas/foundations/modulo-12-tema-7-aliasing.html).

### Tema 8: DSP: filtros digitales y compresión

#### Paso 1 · Objetivo y preparación
Al finalizar podrás cuantificar el efecto y el retardo de una media móvil causal. **En una frase:** El procesamiento digital de señales transforma muestras para reducir ruido, extraer información o reducir almacenamiento. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/dsp.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** La temperatura del paquete tiene un pico aislado; una media móvil lo atenúa sin demostrar que el pico fuera falso. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Promediar varias opiniones reduce fluctuaciones, pero retrasa una noticia nueva: un filtro también introduce compromiso entre ruido y respuesta. Un FIR combina muestras finitas; un IIR reutiliza salidas y necesita estabilidad. La transformada Z estudia sistemas discretos; polos y ceros condicionan respuesta. Compresión sin pérdida conserva muestras y con pérdida admite distorsión a cambio de menor tamaño; audio, imagen y video requieren métricas apropiadas.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/dsp.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
muestras = [20, 20, 29, 20, 20]
ventana = 3
# Media causal: solo usa presente y pasado.
filtradas = [sum(muestras[i-ventana+1:i+1]) / ventana
             for i in range(ventana-1, len(muestras))]
print(filtradas)
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/dsp.py
```

**Salida esperada:**

```text
[23.0, 23.0, 23.0]
```

**Explicación por bloques:** La ventana incluye tres muestras y el primer índice de salida es dos: no se inventan datos anteriores. Cada ventana alrededor del pico suma 69 y su promedio es 23. Se emiten tres salidas correspondientes a posiciones 2, 3 y 4. Un filtro de longitud tres tiene retardo de grupo de una muestra en su régimen FIR lineal; una alarma exige analizar también el umbral de detección.

**Fallo deliberado y diagnóstico:** Usa el promedio para ocultar una alarma real; diagnostica comparando señal cruda y filtrada. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Procesa [20,20,29,29,29]; mide cuándo el filtro reconoce el escalón. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** No suavices señales de seguridad sin especificar tiempo máximo de detección. Conserva muestras originales.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Por qué aparece retardo?
2. ¿Cuál es la diferencia FIR/IIR?
3. ¿Qué evidencia permite elegir una ventana?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

**Diagrama interactivo:** [Media móvil causal: ventanas, salida y retardo](/visuals/temas/foundations/modulo-12-tema-8-media-movil.html).

### Tema 9: Instrumentación: calibración, DAQ e incertidumbre

#### Paso 1 · Objetivo y preparación
Al finalizar podrás calibrar una lectura con dos referencias y comprobar un tercer punto. **En una frase:** La instrumentación convierte una magnitud física en una medición con unidades, calibración y límites conocidos. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/sensores.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Dos referencias permiten corregir ganancia y offset de un sensor térmico del transporte. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Una regla desplazada puede medir siempre dos centímetros de más: muchos dígitos no la vuelven exacta. Sensores de temperatura, presión, humedad, luz y posición requieren acondicionamiento y adquisición DAQ. Calibración compara referencias; linealización corrige una curva; transductores convierten energía y actuadores cambian el entorno. Resolución, repetibilidad, exactitud e incertidumbre describen propiedades distintas.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/sensores.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
raw_frio, raw_caliente = 102, 902
ref_frio, ref_caliente = 0.0, 100.0
pendiente = (ref_caliente-ref_frio) / (raw_caliente-raw_frio)
offset = ref_frio - pendiente * raw_frio
# Modelo lineal válido entre referencias bajo estas condiciones.
print(f"Temperatura: {pendiente * 502 + offset:.2f} °C")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/sensores.py
```

**Salida esperada:**

```text
Temperatura: 50.00 °C
```

**Explicación por bloques:** La pendiente convierte diferencias de cuentas a grados: 100/800=0.125 °C/cuenta. El offset obliga a que la cuenta 102 represente 0 °C. La cuenta 502 queda 400 cuentas por encima y produce 50 °C. El tercer punto permite detectar que una recta de dos puntos puede no representar la curva real.

**Fallo deliberado y diagnóstico:** Introduce raw_caliente=102: ZeroDivisionError revela referencias indistinguibles; revisa adquisición y configuración. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Comprueba un tercer punto a 25 °C; calcula residuo y documenta incertidumbre de la referencia. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** Dos puntos no prueban linealidad ni cubren deriva temporal; no extrapoles sin caracterización.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué es offset?
2. ¿Qué distingue resolución y exactitud?
3. ¿Por qué se necesita un tercer punto?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 10: Control automático: realimentación, PID y estabilidad

#### Paso 1 · Objetivo y preparación
Al finalizar podrás simular un lazo proporcional y explicar su error estacionario. **En una frase:** El control automático compara una medición con una referencia y ajusta una acción para reducir el error. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/control.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Se simula la temperatura de un compartimento con pérdidas y potencia acotada. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Un termostato compara temperatura deseada y real. El modelo de planta describe su dinámica; P reacciona al error, I lo acumula y D estima su cambio. Saturación exige anti-windup. Bode, Nyquist y Routh permiten analizar estabilidad bajo sus supuestos; ver una respuesta rápida no demuestra margen ante retardo o perturbaciones. Compensadores modifican la dinámica del lazo.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/control.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

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
mkdir -p examples/electronics
python3 examples/electronics/control.py
```

**Salida esperada:**

```text
Temperatura: 23.33 °C
```

**Explicación por bloques:** Cada iteración calcula error, potencia saturada y actualización de la planta. La planta pierde energía proporcional a T−20. En equilibrio 2·(25−T)=T−20, de modo que T=70/3≈23.33 °C. El periodo implícito y el modelo térmico están fijados en esta simulación; una temperatura diferente no se corrige aumentando Kp sin estudiar estabilidad.

**Fallo deliberado y diagnóstico:** Espera 25 °C exactos: el control P deja error estacionario por las pérdidas; el diagnóstico usa equilibrio de la planta. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Añade acción integral con límite y prueba una referencia inalcanzable antes de volver a 25 °C. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** La simulación no certifica un controlador físico; mide retardo, saturación y margen de estabilidad.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué variable se realimenta?
2. ¿Por qué P deja error?
3. ¿Qué ocurre con la integral cuando el actuador satura?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

**Diagrama interactivo:** [Lazo proporcional: realimentación y error estacionario](/visuals/temas/foundations/modulo-12-tema-10-lazo-p.html).

### Tema 11: Potencia: conversión, eficiencia y disipación

#### Paso 1 · Objetivo y preparación
Al finalizar podrás calcular relación de conversión y pérdidas de una fuente DC. **En una frase:** La electrónica de potencia transforma energía eléctrica para alimentar cargas dentro de límites eléctricos y térmicos. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/potencia.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** La unidad de seguimiento requiere 5 V y 1 A desde la batería de 12 V de un vehículo. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Un convertidor se parece a una transmisión: cambia la relación de salida, no crea energía. Rectificadores convierten AC en DC; inversores hacen DC a AC; buck reduce DC y boost la eleva. En un buck ideal Vout=D·Vin. Motores requieren dimensionar arranque, conmutación y protecciones; las fuentes conmutadas disipan pérdidas y generan rizado. La temperatura depende de pérdidas y resistencia térmica.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/potencia.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
vin, vout, corriente, eficiencia = 12, 5, 1, 0.9
duty = vout / vin
pout = vout * corriente
pin = pout / eficiencia
# Las pérdidas se convierten principalmente en calor.
print(f"Duty={duty:.3f}; pérdidas={pin-pout:.3f} W")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/potencia.py
```

**Salida esperada:**

```text
Duty=0.417; pérdidas=0.556 W
```

**Explicación por bloques:** El duty ideal es 5/12 y la potencia de salida 5·1=5 W. Dividir por eficiencia 0.9 exige entrada de 5.556 W. La diferencia 0.556 W es la pérdida total del modelo; no puede atribuirse entera a un MOSFET sin descomponer pérdidas. La resistencia térmica permite una estimación preliminar de temperatura.

**Fallo deliberado y diagnóstico:** Fija eficiencia=1.2: el modelo produce pérdidas negativas; diagnostica una entrada físicamente inválida. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Calcula pérdidas a 80% y aumento térmico con 40 °C/W; compara con el límite del componente. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** Estos cálculos no dimensionan inductancia, MOSFET, SOA, aislamiento ni compensación del convertidor; el laboratorio es numérico.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué significa duty?
2. ¿Por qué hay pérdidas?
3. ¿Por qué medir eficiencia a varias cargas?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 12: PCB: esquemático, ERC, DRC y fabricación

#### Paso 1 · Objetivo y preparación
Al finalizar podrás evaluar una separación de pistas y distinguirla de una revisión DRC completa. **En una frase:** El diseño de PCB convierte un circuito en conexiones físicas fabricables con reglas eléctricas y geométricas. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/pcb.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** La placa del sensor tiene dos pistas paralelas cuyo espacio debe respetar la regla del fabricante. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** El esquemático es el plano de conexiones y el layout es la distribución real de calles. ERC encuentra incompatibilidades eléctricas y DRC verifica geometría; ninguno demuestra funcionamiento. Retorno de corriente, desacoplo, integridad de señal y gestión térmica importan tanto como unir redes. KiCad organiza esquemático, placa, BOM y Gerbers; el fabricante define anchos, separaciones y tolerancias.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/pcb.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
centros_mm, ancho_a, ancho_b, minimo = 0.50, 0.30, 0.30, 0.25
# Distancia de centros menos ambas mitades de pista.
espacio = centros_mm - (ancho_a + ancho_b) / 2
print(f"Espacio={espacio:.2f} mm; cumple={espacio >= minimo}")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/pcb.py
```

**Salida esperada:**

```text
Espacio=0.20 mm; cumple=False
```

**Explicación por bloques:** Los centros están a 0.50 mm y cada pista ocupa 0.15 mm a cada lado de su centro. Restar ambas mitades deja 0.20 mm entre bordes, menor que 0.25 mm permitidos. Esta relación solo corresponde a pistas paralelas con esa geometría; un verificador de placa analiza todos los objetos y reglas de red.

**Fallo deliberado y diagnóstico:** Compara distancia entre centros con mínimo: acepta falsamente las pistas; diagnostica midiendo borde a borde. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Aumenta centros a 0.60 mm y reproduce la restricción en KiCad con ERC/DRC y captura de resultados. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** El cálculo es una regla geométrica introductoria; no sustituye KiCad, revisión de retorno, EMC ni pruebas de placa. Fuente específica: https://docs.kicad.org/

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué compara DRC?
2. ¿Qué diferencia esquemático y layout?
3. ¿Dónde regresa la corriente?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 13: Sistemas embebidos: RTOS, buses y firmware

#### Paso 1 · Objetivo y preparación
Al finalizar podrás estimar utilización de tareas y separar ese cálculo de garantías temporales. **En una frase:** Un sistema embebido ejecuta una tarea dedicada y coordina hardware y software con restricciones de tiempo, memoria y energía. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/embebidos.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** El sensor debe adquirir temperatura cada 20 ms y publicar cada 100 ms. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Una cocina con varias órdenes requiere prioridad y plazos, no solo velocidad media. RTOS planifica tareas; tiempo real significa cumplir deadlines. SPI, I2C, CAN y USB tienen contratos y costes distintos; firmware inicializa hardware, valida datos y recupera fallos. IoT añade conectividad, identidad y actualizaciones. Una tarea que bloquea un bus puede impedir medir a tiempo aunque la CPU esté libre.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/embebidos.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
tareas = [("sensor", 2, 20), ("publicar", 5, 100)]
# Utilización necesaria; no es prueba suficiente de planificabilidad.
utilizacion = sum(coste / periodo for _, coste, periodo in tareas)
print(f"Utilización: {utilizacion:.2%}")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/embebidos.py
```

**Salida esperada:**

```text
Utilización: 15.00%
```

**Explicación por bloques:** Las tuplas declaran nombre, coste y periodo, ambos en milisegundos. El sensor requiere 2/20=10% y publicar 5/100=5%; su suma es 15%. Que quede 85% de CPU no acota automáticamente bloqueos ni deadlines. El coste debe ser peor caso medido o analizado, no solo promedio de una ejecución.

**Fallo deliberado y diagnóstico:** Añade una tarea de 100 ms cada 100 ms: utilización supera 100%; diagnostica sobrecarga antes de ajustar prioridades. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Incluye bloqueo máximo del bus y registra latencia peor caso; explica por qué promedio no basta. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** El modelo ignora jitter, inversión de prioridad y WCET real. La validación de tiempo exige mediciones y análisis de planificación.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué es un deadline?
2. ¿Por qué baja utilización no prueba cumplimiento?
3. ¿Qué hace firmware cuando pierde red?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 14: Programación de bajo nivel: C, memoria y depuración

#### Paso 1 · Objetivo y preparación
Al finalizar podrás codificar una medición de 16 bits y diagnosticar un desacuerdo de endianness. **En una frase:** La programación de bajo nivel controla representación y memoria para implementar firmware y diagnosticar errores cercanos al hardware. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/bajo-nivel.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Un mensaje UART transmite una medición sin signo de 16 bits en little-endian. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Un buffer es una fila de casillas con capacidad fija; escribir fuera invade otra responsabilidad. C/C++ dan control explícito y requieren ownership, límites y vida útil; ASM expresa instrucciones de máquina. Estructuras y algoritmos condicionan coste; depuración con GDB, warnings y sanitizers ayuda a localizar errores. Python puede ensayar un contrato binario, pero no reproduce comportamiento indefinido de C.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/bajo-nivel.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
import struct
medicion = 513
# Contrato explícito: dos bytes, sin signo, little-endian.
trama = struct.pack("<H", medicion)
print(trama.hex(), struct.unpack("<H", trama)[0])
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/bajo-nivel.py
```

**Salida esperada:**

```text
0102 513
```

**Explicación por bloques:** `<H` indica unsigned short de dos bytes en little-endian. 513=2·256+1 se representa como bytes 01 y 02; `hex` muestra 0102 y `unpack` reconstruye 513. Leer esos bytes en big-endian calcula 1·256+2=258, un valor legal pero incorrecto que podría pasar inadvertido sin comprobar el contrato.

**Fallo deliberado y diagnóstico:** Decodifica con >H: obtienes 258; diagnostica el desacuerdo de endianness entre emisor y receptor. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Prueba 65535, 65536 y una trama de un byte; registra errores y exige tamaño antes de decodificar. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** Un contrato binario no gestiona ownership ni sincronización. Para C usa compilación con warnings y AddressSanitizer en un entorno compatible.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué significa little-endian?
2. ¿Cuántos valores caben en 16 bits?
3. ¿Por qué C necesita comprobar límites?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 15: Electromagnetismo: Faraday y líneas de transmisión

#### Paso 1 · Objetivo y preparación
Al finalizar podrás estimar tensión inducida y explicar cómo influye el área de un lazo. **En una frase:** El electromagnetismo relaciona cargas, campos y ondas para entender interferencia, antenas y señales rápidas. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/electromagnetismo.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Un cable de sensor cercano a un motor capta tensión inducida por un campo cambiante. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Un lazo de cable funciona como una pequeña antena: capta cambios de flujo magnético. Coulomb describe fuerzas entre cargas; Faraday relaciona variación de flujo con tensión inducida; Maxwell unifica campos eléctricos y magnéticos. Ondas y líneas de transmisión requieren considerar velocidad de propagación, impedancia y terminaciones cuando el retardo no es despreciable frente al flanco.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/electromagnetismo.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
area, cambio_campo, intervalo = 0.001, 0.01, 0.001
# Campo uniforme y perpendicular; una sola vuelta.
voltaje = -area * cambio_campo / intervalo
print(f"Tensión inducida: {voltaje:.3f} V")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/electromagnetismo.py
```

**Salida esperada:**

```text
Tensión inducida: -0.010 V
```

**Explicación por bloques:** El cambio de flujo es área por cambio de campo bajo orientación perpendicular. Dividir 0.001·0.01 por 0.001 s da 0.01 V; el signo menos expresa oposición al cambio según la orientación de referencia. Reducir área reduce magnitud; no modifica el hecho de que la inducción necesita variación de flujo.

**Fallo deliberado y diagnóstico:** Usa 10 cm² como 10 m²: el error de conversión domina el resultado; convierte primero a 0.001 m². Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Reduce el área del lazo diez veces; explica por qué trenzar conductores puede reducir captación. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** El cálculo supone geometría y campo uniformes; no reemplaza simulación EM ni ensayos de compatibilidad.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué cambia para inducir tensión?
2. ¿Qué expresa el signo negativo?
3. ¿Cuándo una pista exige modelo de línea?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 16: Gestión profesional: requisitos, riesgos y evidencia

#### Paso 1 · Objetivo y preparación
Al finalizar podrás evaluar un criterio de aceptación y documentar cobertura de medida. **En una frase:** La gestión técnica convierte una necesidad en entregables comprobables y decisiones documentadas que un equipo puede mantener. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/gestion.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** RutaFlow acepta un sensor si su error máximo medido es menor o igual a 0.5 °C en los puntos acordados. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Construir un puente exige acordar carga, plazo y prueba de aceptación antes de elegir materiales. Documentación técnica captura supuestos y decisiones; trabajo en equipo necesita interfaces y responsables; pensamiento crítico separa observación y explicación. Innovación y aprendizaje continuo consisten en experimentar con criterios, no perseguir herramientas sin objetivo.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/gestion.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
referencias = [0, 25, 50]
medidas = [0.2, 25.4, 49.7]
# La aceptación parte de un requisito medible.
errores = [abs(a-b) for a,b in zip(referencias, medidas)]
print(f"Error máximo={max(errores):.2f} °C; acepta={max(errores) <= 0.5}")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/gestion.py
```

**Salida esperada:**

```text
Error máximo=0.40 °C; acepta=True
```

**Explicación por bloques:** `zip` empareja tres medidas con sus referencias; `abs` convierte diferencias firmadas en magnitudes de error. Los errores son 0.2, 0.4 y 0.3 °C; máximo 0.4 cumple el umbral 0.5. La conclusión se limita a estos puntos y condiciones: una medida válida en laboratorio no acredita todo rango ni meses de uso.

**Fallo deliberado y diagnóstico:** Modifica 49.7 a 48: la aceptación falla; no cambies el umbral para ocultar el defecto. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Redacta requisito de latencia, dueño, riesgo y plan de prueba; agrega una decisión sobre recalibración. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** Tres muestras no demuestran exactitud en todo rango; define cobertura, condiciones y evidencia antes de aprobar.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué hace verificable un requisito?
2. ¿Por qué documentar supuestos?
3. ¿Quién decide si una desviación es aceptable?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

### Tema 17: PLC y control industrial: ciclo de scan e IEC 61131-3

#### Paso 1 · Objetivo y preparación
Al finalizar podrás reproducir un interlock de control y verificar una orden de marcha. **En una frase:** Un PLC lee entradas, ejecuta lógica y actualiza salidas cíclicamente para controlar procesos industriales. **Prerrequisitos:** Python, variables, funciones y unidades SI; para temas de señales repasa circuitos y matemáticas. Ubicación: `examples/electronics/plc.py`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** La cinta del almacén debe detenerse si se abre una puerta o se activa una alarma. En el proyecto integrador de RutaFlow documenta esta decisión antes de enviar mediciones al backend: el valor calculado solo tiene sentido junto a sus condiciones y unidades.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía y mecanismo:** Es un supervisor que toma una foto de entradas, decide y publica órdenes en cada ronda. El ciclo de scan no es instantáneo: entradas pueden cambiar entre rondas. IEC 61131-3 define lenguajes de programación de controladores; Structured Text y Ladder tienen semántica y herramientas propias. Variables globales, bus de campo, HMI y registro cumplen funciones distintas. Una HMI muestra y solicita acciones; el control valida interlocks.

#### Paso 4 · Demostración guiada desde cero
Crea `examples/electronics/plc.py` en un proyecto nuevo o utiliza el archivo incluido en el repositorio:

```python
entradas = {"marcha": True, "puerta_cerrada": False, "alarma": False}
# Interlock: marcha solicitada no basta para habilitar motor.
motor = entradas["marcha"] and entradas["puerta_cerrada"] and not entradas["alarma"]
print(f"Motor habilitado: {motor}")
```

```bash
mkdir -p examples/electronics
python3 examples/electronics/plc.py
```

**Salida esperada:**

```text
Motor habilitado: False
```

**Explicación por bloques:** El diccionario representa la foto de entradas de un scan. Se necesita marcha, puerta cerrada y ausencia de alarma simultáneamente. La puerta False deshabilita la salida aunque exista marcha True. La asignación produce la decisión de un ciclo; el código no contiene memoria de rearme, ni watchdog ni circuito independiente de seguridad.

**Fallo deliberado y diagnóstico:** Elimina puerta_cerrada de la condición: el motor se habilita; diagnostica ausencia de interlock mediante tabla de entradas. Conserva ambas salidas y corrige la entrada o condición responsable antes de continuar.

#### Paso 5 · Práctica guiada
**Pista específica:** Construye la tabla completa y agrega política de rearme manual; describe entradas, lógica, salidas y tiempo máximo de respuesta. Cambia una sola variable y escribe la predicción antes de ejecutar. No tomes una salida diferente como error hasta contrastarla con el modelo.

#### Paso 6 · Práctica independiente
Integra este resultado en el registro del sensor del proyecto transversal RutaFlow: escribe entrada, unidad, resultado y condición del ensayo. **Límites y decisión de uso:** Python simula lógica, no es runtime PLC ni implementación de seguridad funcional. Consulta documentación del controlador y edición aplicable del estándar; un interlock didáctico no certifica una máquina.

#### Paso 7 · Cierre y evidencia
Entrega el archivo, salida normal, fallo diagnosticado y resultado de la práctica; explica qué supuesto cambiaste. Para avanzar al siguiente tema, contesta sin mirar:

1. ¿Qué ocurre en un scan?
2. ¿Quién valida una orden de la HMI?
3. ¿Por qué se separa control normal y seguridad?

**Errores comunes:** omitir las unidades; tratar un modelo ideal como dispositivo real; aceptar el caso normal sin revisar el contraejemplo descrito. Si fallas una pregunta, vuelve a la analogía y repite el cálculo con otros datos; no memorices solo la salida.

**Fuente oficial:** [MIT OpenCourseWare: circuitos y electrónica](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/). Para procesamiento digital: [referencia de SciPy Signal](https://docs.scipy.org/doc/scipy/reference/signal.html). Las herramientas específicas citadas en el tema requieren su propia documentación.

**Diagrama interactivo:** [Scan PLC: interlock y actualización de salida](/visuals/temas/foundations/modulo-12-tema-17-plc-scan.html).

## Ampliación: ejercicio de Thévenin de la página 67

Aquí sí se pudo leer la topología: tierra inferior, fuente de 4 V con positivo abajo (`Va=-4 V`), resistencia de carga 6 Ω entre a y b, resistencia de 12 Ω de b a tierra, fuente de 8 V positiva en b y negativa en c (`Vb-Vc=8 V`), otra resistencia de 12 Ω de c a tierra y fuente de 2 A desde tierra hacia c.

Retira la carga. El supernodo b-c cumple `Vb/12 + Vc/12 = 2`; junto con `Vb-Vc=8` da `Vb=16 V`, `Vc=8 V`. Por tanto `Vth=Va-Vb=-20 V`. Para hallar Rth, cortocircuita fuentes independientes de tensión y abre la de corriente: ambas resistencias de 12 Ω quedan en paralelo y `Rth=6 Ω`. Reconecta la carga: `Iab=-20/(6+6)=-5/3 A` y `Vab=Iab·6=-10 V`. El signo indica que b está 10 V por encima de a.

Comprueba por nodos con carga: `(Vb+4)/6 + Vb/12 + Vc/12 = 2` y `Vc=Vb-8`; resulta `Vb=6 V`, `Vc=-2 V`, coherente con `Va-Vb=-10 V`. Para Norton, `In=Vth/Rth=-10/3 A`. Si cambias la polaridad de una fuente, cambia el sistema de ecuaciones antes de ejecutar: no reutilices este resultado para otro dibujo.

## Ampliación: cuatro diodos de la página 65

Se leyó el dibujo ampliado: referencia inferior izquierda 0 V, inferior derecha -10 V por VA; fuente V1 superior +8 V; VB positiva arriba de 10 V. D1 y D4 tienen sentido directo hacia abajo, D2 de izquierda a derecha y D3 de abajo hacia arriba. Se usa el modelo dado: directa a 0.5 V y ruptura inversa a 8 V. Si una copia del diagrama tiene otra orientación, estas ecuaciones deben cambiar.

Llama x al nodo de R1/D1/D2, y al superior derecho, z al punto entre R2 y D3, w al punto bajo VB y u al punto entre R3 y D4. Por VB, w=y-10. Hipótesis: D1 y D2 directos, D3 en ruptura y D4 bloqueado. Entonces x=0.5, y=x-0.5=0, z=-10+8=-2, u=w=-10 V.

La corriente por R1 es (8-0.5)/3000 = 2.5 mA. R2 conduce (0-(-2))/1000 = 2 mA hacia D3; por tanto D2 lleva 2 mA y D1 recibe los 0.5 mA restantes. D3 conduce 2 mA en sentido inverso: ánodo a -10 V y cátodo a -2 V. D4 tiene 0 V ánodo-cátodo y 0 mA, consistente con bloqueo. Se cumplen KCL y las desigualdades de los cuatro estados; asumirlos sin comprobar corrientes no sería una solución.

Desde la raíz ejecuta:

```bash
python3 examples/electronics/diodos-pdf.py
```

**Salida esperada:** D1 directa 0.500 mA; D2 directa 2.000 mA; D3 ruptura Zener 2.000 mA inversos; D4 bloqueado 0.000 mA. El archivo usa fracciones exactas para comprobar KCL y condiciones de estado. **Fallo deliberado:** cambia la referencia derecha a +10 V sin actualizar los nodos: las aserciones de polarización fallan y te obligan a reconstruir el modelo. **Práctica:** calcula potencia en R1 y R2 y demuestra que son no negativas.

**Límite profesional:** esto valida el modelo de umbral y las polaridades interpretadas del dibujo, no curvas reales, temperatura ni potencia máxima de los Zener. La comparación con SPICE y datasheets queda pendiente. No se afirma haber simulado hardware.
