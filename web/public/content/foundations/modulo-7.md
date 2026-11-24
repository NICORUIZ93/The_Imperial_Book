# Módulo 7: Ciencias de la Computación: mapa de especializaciones

**Entorno comprobado para esta edición (2026-11-24):** Python 3.13.18 en Linux x86_64, con el módulo `sqlite3` de
la biblioteca estándar (SQLite 3.53.1). No se instaló ningún paquete externo. Todas las salidas son literales de esa
ejecución, en la carpeta de práctica `/home/estudiante/labs/especializaciones` (tu `~/labs/especializaciones`). Los
valores aleatorios usan una semilla fija, así que deben coincidir con los tuyos. Los comandos para Windows no se
ejecutaron.

## Apertura del módulo

#### Objetivos del módulo
Al terminar este módulo podrás:
- reconocer seis grandes áreas de las ciencias de la computación y el problema central que resuelve cada una;
- ejecutar un experimento pequeño por área y explicar qué muestra su salida;
- distinguir usar una herramienta de comprender el fundamento que la hace funcionar;
- identificar qué matemáticas y qué módulos previos exige cada especialización antes de profundizar;
- elegir una especialización para estudiar después, con evidencia de tus propios experimentos.

#### Esquema del módulo
1. Sistemas, arquitectura y sistemas operativos.
2. Algoritmos, autómatas, lenguajes y compiladores.
3. Bases de datos, almacenes analíticos y minería de datos.
4. Inteligencia artificial, aprendizaje automático y visión.
5. Gráficos y cómputo científico.
6. Redes, seguridad, web e ingeniería profesional.
7. Proyecto 11: portafolio de orientación.

#### Qué necesitas saber antes
Los Módulos 0, 1 y 2 completos: procesos, funciones, clases, listas, diccionarios, colas, árboles y complejidad. El
Módulo 3 para redes y HTTP, el Módulo 4 para SQL con SQLite y el Módulo 5 para depurar con evidencia. Cada
término nuevo se define en el tema donde aparece por primera vez.

Este módulo es un **mapa**, no un curso de cada área. Un experimento de veinte líneas te muestra la idea central de
una especialización; dominarla exige meses de estudio. Ese límite se repite en cada tema a propósito.

## Aprende construyendo

Crea la carpeta de práctica una sola vez y trabaja dentro de ella en los seis temas:

```text
$ mkdir -p ~/labs/especializaciones
$ cd ~/labs/especializaciones
$ python3 --version
Python 3.13.18
```

### Tema 1: Sistemas, arquitectura y sistemas operativos · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- simular el reparto de la CPU con Round Robin y calcular el tiempo de retorno de cada proceso;
- contar los cambios de contexto y explicar por qué un quantum pequeño los multiplica;
- ejecutar a mano el ciclo de instrucción de una CPU de juguete con registros y contador de programa;
- reconocer qué roles trabajan en sistemas y qué estudian antes de especializarse.

**Conceptos clave:** planificador de procesos, Round Robin, quantum, cambio de contexto, tiempo de retorno, conjunto de instrucciones, registro del procesador, contador de programa, ciclo de instrucción

#### El problema
El dispositivo que lleva cada mensajero de RutaFlow tiene **una sola CPU**. Al mismo tiempo debe leer el GPS,
sincronizar entregas con el servidor y comprimir las fotos de las firmas. Si la compresión ocupa la CPU un minuto
entero, el mapa se congela. ¿Cómo reparte el sistema operativo una CPU entre varios procesos sin que ninguno se
quede esperando para siempre? ¿Y qué hace la CPU, por dentro, con cada instrucción?

Este tema usa lo que ya conoces: **CPU**, **sistema operativo** y **proceso** tienen su ficha en el Módulo 0, Tema 1;
**cola** y **deque**, en el Módulo 2, Tema 2. Aquí no se redefinen.

#### Glosario del tema

**planificador de procesos**
- **Definición técnica:** parte del sistema operativo que decide qué proceso listo usa la CPU a continuación y durante cuánto tiempo.
- **En palabras sencillas:** el turnero de un banco que dice a quién atiende la única ventanilla.
- **Dónde se rompe la comparación:** el planificador puede interrumpir a quien está siendo atendido y mandarlo al final de la fila.
- **Ejemplo:** en `planificador.py`, el bucle `while procesos:` hace de planificador: saca uno, lo atiende y decide si vuelve.
- **Error típico:** creer que los procesos corren «a la vez» en una sola CPU; se turnan tan rápido que lo parece.

**Round Robin**
- **Definición técnica:** política de planificación que atiende la cola en orden de llegada y da a cada proceso un tiempo máximo fijo antes de pasar al siguiente.
- **En palabras sencillas:** una ronda: cada uno tiene un turno corto y, si no terminó, vuelve al final.
- **Dónde se rompe la comparación:** en una ronda de juego todos tienen el mismo turno; aquí quien termina antes cede el resto de su tiempo.
- **Ejemplo:** con turnos de 2 unidades, `gps` usa 2, `sync` usa 2, `fotos` usa 2 y vuelve `gps`.
- **Error típico:** pensar que Round Robin termina antes todos los trabajos; reparte mejor, pero no reduce el trabajo total.

**quantum**
- **Definición técnica:** duración máxima que el planificador concede a un proceso en cada turno de CPU antes de expulsarlo.
- **En palabras sencillas:** cuántos minutos te deja hablar el moderador antes de dar la palabra al siguiente.
- **Dónde se rompe la comparación:** un sistema real mide el quantum en milisegundos y lo ajusta según la carga.
- **Ejemplo:** `quantum = 2` en la línea 9 de `planificador.py`.
- **Error típico:** escoger un quantum diminuto: la CPU pasa más tiempo cambiando de proceso que trabajando.

**cambio de contexto**
- **Definición técnica:** operación del sistema operativo que guarda el estado de un proceso (registros, contador de programa) y carga el de otro.
- **En palabras sencillas:** marcar la página del libro que lees, cerrarlo y abrir otro donde lo dejaste.
- **Dónde se rompe la comparación:** cambiar de libro no cuesta nada; un cambio de contexto gasta tiempo de CPU que nadie aprovecha.
- **Ejemplo:** la salida de `planificador.py` cuenta `cambios de contexto: 6`.
- **Error típico:** ignorar su costo al comparar políticas; en la simulación cuesta cero, en un sistema real no.

**tiempo de retorno**
- **Definición técnica:** tiempo transcurrido desde que un proceso llega a la cola hasta que termina; en inglés, *turnaround time*.
- **En palabras sencillas:** cuánto esperaste desde que pediste el trámite hasta que te lo entregaron completo.
- **Dónde se rompe la comparación:** no es lo mismo que el tiempo de respuesta, que mide cuánto tardas en ser atendido la primera vez.
- **Ejemplo:** `sync` llega en `t=0` y termina en `t=9`; su tiempo de retorno es 9.
- **Error típico:** sumar solo el tiempo de CPU del proceso (3) y olvidar el tiempo que pasó esperando en la cola.

**conjunto de instrucciones**
- **Definición técnica:** lista de operaciones que una CPU sabe ejecutar, con su formato; define la arquitectura que ve el software (*ISA*, como x86-64 o ARM).
- **En palabras sencillas:** el vocabulario completo que entiende la CPU; nada fuera de él se puede pedir.
- **Dónde se rompe la comparación:** un idioma acepta palabras nuevas; una CPU rechaza cualquier código que no esté en su conjunto.
- **Ejemplo:** la CPU de juguete de `maquina.py` solo entiende `CARGAR`, `SUMAR`, `MULTIPLICAR` y `PARAR`.
- **Error típico:** copiar un programa compilado para ARM a una máquina x86-64 y esperar que corra sin recompilar.

**registro del procesador**
- **Definición técnica:** celda de memoria dentro de la CPU, muy pequeña y muy rápida, donde se guardan los valores que la instrucción actual usa.
- **En palabras sencillas:** la mano del cajero: lo que tiene en la mano lo usa ya; lo demás está en el cajón.
- **Dónde se rompe la comparación:** una CPU real tiene decenas de registros, no dos, y cada uno tiene un tamaño fijo en bits.
- **Ejemplo:** `registros = {"A": 0, "B": 0}` en la línea 10 de `maquina.py`.
- **Error típico:** confundirlo con el registro de eventos (`logging`) del Módulo 5: comparten nombre y nada más.

**contador de programa**
- **Definición técnica:** registro especial que guarda la dirección de la próxima instrucción que la CPU va a buscar.
- **En palabras sencillas:** el dedo que señala en qué renglón de la receta vas.
- **Dónde se rompe la comparación:** un salto (`if`, bucle) cambia el contador a otro renglón; el dedo no siempre baja de a uno.
- **Ejemplo:** `pc = 0` en la línea 11 y `pc += 1` en la línea 15 de `maquina.py`.
- **Error típico:** olvidar avanzarlo: la CPU ejecutaría la misma instrucción para siempre.

**ciclo de instrucción**
- **Definición técnica:** secuencia que la CPU repite sin parar: buscar la instrucción que indica el contador, decodificarla y ejecutarla.
- **En palabras sencillas:** leer el renglón, entender qué pide y hacerlo; luego el siguiente renglón.
- **Dónde se rompe la comparación:** las CPU modernas solapan varias instrucciones a la vez (*pipeline*); el orden se respeta solo en el resultado.
- **Ejemplo:** las líneas 13 a 26 de `maquina.py` son un ciclo de instrucción completo.
- **Error típico:** creer que una línea de Python es una instrucción de CPU; una sola línea puede costar cientos.

#### ► CÓMO FUNCIONA
Un proceso pasa por tres estados. **Listo** significa que espera en la cola; **ejecutando**, que tiene la CPU;
**terminado**, que ya no necesita nada. El planificador saca el primero de la cola y le da como máximo un quantum.
Si el proceso no terminó, vuelve al final de la cola. Cada vez que la CPU pasa a otro proceso, hay un cambio de contexto.

Dentro de la CPU ocurre algo parecido a otra escala. El contador de programa dice qué instrucción sigue. La CPU la
busca, la decodifica, la ejecuta sobre sus registros y avanza el contador. Ese ciclo se repite miles de millones de
veces por segundo.

| Nivel | Qué se reparte | Quién decide | Unidad de trabajo |
|---|---|---|---|
| Sistema operativo | Tiempo de CPU entre procesos | Planificador | Quantum |
| Procesador | Registros y unidades de cálculo | Ciclo de instrucción | Instrucción |

```mermaid
stateDiagram-v2
    [*] --> Listo: llega a la cola
    Listo --> Ejecutando: el planificador lo elige
    Ejecutando --> Listo: se agotó el quantum y le falta trabajo
    Ejecutando --> Terminado: restante llega a 0
    Terminado --> [*]
```

#### Problema resuelto 1.1
Tres procesos del dispositivo llegan juntos: `gps` necesita 5 unidades de CPU, `sync` 3 y `fotos` 4. Simula Round
Robin con quantum 2 e informa el tiempo de retorno de cada uno y los cambios de contexto.

**Razonamiento:**
1. La cola de listos es una `deque`: sacar por la izquierda y meter por la derecha cuesta O(1) (Módulo 2, Tema 2).
2. En cada turno el proceso usa `min(quantum, restante)`: nunca más de lo que le falta.
3. Un reloj acumula lo usado; cuando un proceso llega a 0, su tiempo de retorno es el reloj en ese momento.
4. Hay cambio de contexto cuando el proceso que entra no es el mismo que acaba de salir.

```python
# planificador.py — reparte la CPU de un dispositivo de RutaFlow con Round Robin
from collections import deque

procesos = deque([
    {"id": "gps", "restante": 5},
    {"id": "sync", "restante": 3},
    {"id": "fotos", "restante": 4},
])
quantum = 2
reloj = 0
cambios = 0
anterior = None
fin = {}

while procesos:
    proceso = procesos.popleft()
    if anterior is not None and anterior != proceso["id"]:
        cambios += 1                       # la CPU pasa a otro proceso
    anterior = proceso["id"]
    usado = min(quantum, proceso["restante"])
    reloj += usado
    proceso["restante"] -= usado
    print(f"t={reloj:2}  {proceso['id']:<5} usa {usado}, resta {proceso['restante']}")
    if proceso["restante"] > 0:            # solo vuelve a la cola si le falta trabajo
        procesos.append(proceso)
    else:
        fin[proceso["id"]] = reloj

print("tiempo de retorno:", fin)
print("cambios de contexto:", cambios)
```

```text
$ python3 planificador.py
t= 2  gps   usa 2, resta 3
t= 4  sync  usa 2, resta 1
t= 6  fotos usa 2, resta 2
t= 8  gps   usa 2, resta 1
t= 9  sync  usa 1, resta 0
t=11  fotos usa 2, resta 0
t=12  gps   usa 1, resta 0
tiempo de retorno: {'sync': 9, 'fotos': 11, 'gps': 12}
cambios de contexto: 6
```

**Explicación por partes.**
- Líneas 4–8: la cola de listos, en orden de llegada. Cada proceso es un diccionario con lo que le falta.
- Líneas 16–19: el planificador saca el primero y cuenta un cambio si la CPU pasa a otro proceso.
- Línea 20: `min` evita que `gps`, con 1 unidad pendiente, gaste un quantum completo.
- Líneas 24–27: si falta trabajo, vuelve al final de la cola; si no, se anota su tiempo de retorno.
- La salida confirma la ronda: `sync` termina en `t=9` aunque solo necesitaba 3 unidades de CPU. Esperó 6.

> **Error común.** Crear la cola con corchetes, `procesos = [...]`, en vez de `deque([...])`. El programa se detiene
> en la línea 16 con `AttributeError: 'list' object has no attribute 'popleft'`. El mensaje dice que una lista no
> tiene ese método. Usa `deque`, o `pop(0)` sabiendo que en una lista cuesta O(n).

> **Rendimiento.** Con quantum 2 hubo 6 cambios de contexto; con quantum 10 (Ejercicio verificable 1) hay 2. Un
> quantum pequeño mejora la sensación de respuesta y aumenta el tiempo perdido en cambios.

#### Problema resuelto 1.2
Construye una CPU de juguete con dos registros que calcule el costo de un envío: 3 kg a 4200 por kg más un recargo
de 3000. Muestra el estado de los registros después de cada instrucción.

**Razonamiento:**
1. El programa es una lista de instrucciones; cada una es una tupla `(operación, destino, origen)`.
2. El contador de programa empieza en 0 y avanza de a uno; `PARAR` rompe el ciclo.
3. Cada vuelta del `while` es un ciclo de instrucción: buscar, decodificar con `if/elif` y ejecutar.

```python
# maquina.py — una CPU de juguete: dos registros, un contador de programa y cuatro instrucciones
programa = [
    ("CARGAR", "A", 4200),        # tarifa por kg
    ("CARGAR", "B", 3),           # kilos del envío
    ("MULTIPLICAR", "A", "B"),    # A = A * B
    ("CARGAR", "B", 3000),        # recargo urgente
    ("SUMAR", "A", "B"),          # A = A + B
    ("PARAR", None, None),
]
registros = {"A": 0, "B": 0}
pc = 0                            # contador de programa: índice de la siguiente instrucción

while True:
    operacion, destino, origen = programa[pc]     # 1. buscar
    pc += 1
    if operacion == "CARGAR":                     # 2. decodificar y 3. ejecutar
        registros[destino] = origen
    elif operacion == "SUMAR":
        registros[destino] = registros[destino] + registros[origen]
    elif operacion == "MULTIPLICAR":
        registros[destino] = registros[destino] * registros[origen]
    elif operacion == "PARAR":
        break
    else:
        raise ValueError(f"instrucción desconocida: {operacion}")
    print(f"pc={pc}  {operacion:<11}  A={registros['A']:>5}  B={registros['B']:>5}")

print("total del envío:", registros["A"])
```

```text
$ python3 maquina.py
pc=1  CARGAR       A= 4200  B=    0
pc=2  CARGAR       A= 4200  B=    3
pc=3  MULTIPLICAR  A=12600  B=    3
pc=4  CARGAR       A=12600  B= 3000
pc=5  SUMAR        A=15600  B= 3000
total del envío: 15600
```

**Explicación por partes.**
- Líneas 2–9: el programa. Es el «código máquina» de esta CPU: solo usa operaciones de su conjunto de instrucciones.
- Línea 14: **buscar**. El contador de programa elige la tupla; la asignación múltiple la separa en tres nombres.
- Línea 15: el contador avanza antes de ejecutar, como en una CPU real.
- Líneas 16–25: **decodificar y ejecutar**. Una operación fuera del conjunto lanza `ValueError`.
- La traza muestra que `B` se reutiliza: primero guarda los kilos y después el recargo. Los registros son pocos y se reciclan.

> **Error común.** Agregar `("RESTAR", "A", "B")` al programa sin enseñarle a la CPU esa operación. La ejecución
> termina con `ValueError: instrucción desconocida: RESTAR`. Es lo mismo que pasa al correr código de otra arquitectura.

> **Buena práctica.** Cuando estudies sistemas, simula antes de medir. Una simulación de 30 líneas te deja cambiar el
> quantum y ver el efecto; después lo compruebas en Linux con herramientas como `top` (Módulo 8).

#### Checkpoint 1.1
En la salida de `planificador.py`, ¿cuánto tiempo esperó `fotos` en la cola, sin contar el tiempo que usó la CPU?

Respuesta: 7 unidades. Su tiempo de retorno es 11 y necesitaba 4 de CPU: `11 - 4 = 7`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Simula el planificador
En `~/labs/especializaciones`, escribe `planificador.py` y ejecútalo con `python3 planificador.py`. Compara tu salida
con la del Problema resuelto 1.1 línea por línea.

#### Paso 2 · Cambia el quantum
Cambia la línea 9 a `quantum = 1` y después a `quantum = 10`. Anota en `evidencia-tema1.txt` el tiempo de retorno de
`sync` y los cambios de contexto de cada versión.

#### Paso 3 · Ejecuta la CPU de juguete
Escribe `maquina.py` y ejecútalo. Antes de cada línea de la traza, predice en papel los valores de `A` y `B`.

#### Paso 4 · Provoca el error
Agrega una instrucción `RESTAR` al programa sin cambiar el ciclo. Lee el `ValueError` y luego agrega la rama que falta.

#### Resumen
- El **planificador de procesos** decide qué proceso usa la única CPU y por cuánto tiempo.
- **Round Robin** atiende en orden de llegada con un **quantum** fijo; quien no termina vuelve al final de la cola.
- Cada **cambio de contexto** guarda el estado de un proceso y carga otro; cuesta tiempo real.
- El **tiempo de retorno** incluye la espera en la cola, no solo el tiempo de CPU.
- Una CPU ejecuta solo su **conjunto de instrucciones**, sobre unos pocos **registros del procesador**.
- El **contador de programa** señala la próxima instrucción; el **ciclo de instrucción** busca, decodifica y ejecuta.

#### Ejercicio verificable 1
Básico. Cambia `quantum = 2` por `quantum = 10` en `planificador.py`. Predice la salida antes de ejecutar.

Respuesta esperada:

```text
t= 5  gps   usa 5, resta 0
t= 8  sync  usa 3, resta 0
t=12  fotos usa 4, resta 0
tiempo de retorno: {'gps': 5, 'sync': 8, 'fotos': 12}
cambios de contexto: 2
```

Con un quantum mayor que todo trabajo, Round Robin se comporta como «primero en llegar, primero en ser atendido».

#### Ejercicio verificable 2
Intermedio. Agrega a `maquina.py` la operación `RESTAR` y aplica un descuento de 1000 después del recargo.

Respuesta esperada: una rama `elif operacion == "RESTAR":` con
`registros[destino] = registros[destino] - registros[origen]`, y en el programa `("CARGAR", "B", 1000)` seguido de
`("RESTAR", "A", "B")` antes de `PARAR`. Las dos últimas líneas de la traza son `pc=7  RESTAR       A=14600  B= 1000`
y `total del envío: 14600`.

#### Ejercicio verificable 3
Reto. Agrega al planificador el **tiempo de respuesta**: el reloj en el momento en que cada proceso recibe la CPU
por primera vez. Compara quantum 2 y quantum 10.

Respuesta esperada: guarda el reloj antes de sumar `usado`, solo si el proceso aún no tiene respuesta. Con quantum 2:
`{'gps': 0, 'sync': 2, 'fotos': 4}`. Con quantum 10: `{'gps': 0, 'sync': 5, 'fotos': 8}`. Round Robin responde
antes a todos; a cambio, el tiempo de retorno promedio sube de 8.33 (quantum 10) a 10.67 (quantum 2).

#### En el trabajo
Sistemas es la especialización que está debajo de todas las demás. Los roles típicos son **ingeniero de sistemas
operativos y kernel**, **ingeniero de sistemas embebidos y firmware**, **ingeniero de rendimiento** y
**arquitecto de procesadores**. Trabajan en fabricantes de chips y dispositivos (Intel, AMD, ARM, NVIDIA, Qualcomm,
Apple, Samsung), en equipos de sistemas operativos (Microsoft, Google con Android, Red Hat, Canonical) y en la
nube (AWS, Azure). Para llegar ahí necesitas C, arquitectura de computadores y el Módulo 8 de este curso. En
RutaFlow, este conocimiento decide si el dispositivo del mensajero agota la batería en cuatro horas o en doce.

</details>

### Tema 2: Algoritmos, autómatas, lenguajes y compiladores · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- construir un autómata finito que acepta o rechaza textos según un formato;
- separar un texto en tokens con un analizador léxico escrito a mano;
- construir un árbol de sintaxis a partir de una gramática y evaluarlo respetando la precedencia;
- describir las fases de un compilador y qué hace cada una.

**Conceptos clave:** autómata finito, lenguaje formal, compilador, analizador léxico, token, gramática, analizador sintáctico, árbol de sintaxis

#### El problema
Los operadores de RutaFlow escriben guías a mano y a veces se equivocan: `RF-20A8` o `RF-12345`. Además, el área
comercial quiere escribir tarifas como texto, por ejemplo `4200 * 2.5 + 3000`, y que el sistema las calcule. ¿Cómo
decide un programa si un texto tiene la forma correcta? ¿Cómo entiende que la multiplicación va antes que la suma?

Este tema usa lo que ya conoces: **algoritmo** (Módulo 1, Tema 1), `__name__` (Módulo 1, Tema 4), **recursión**
(Módulo 2, Tema 4), **árbol** (Módulo 2, Tema 5) y `sys.argv` (Módulo 0, Tema 4).

#### Glosario del tema

**autómata finito**
- **Definición técnica:** modelo de cómputo con un número finito de estados, un estado inicial, estados de aceptación y una regla que, según el estado actual y el símbolo leído, decide el estado siguiente.
- **En palabras sencillas:** un torniquete con memoria mínima: solo recuerda en qué paso va, no todo lo que pasó.
- **Dónde se rompe la comparación:** un torniquete gira sin fin; un autómata termina al acabarse el texto y entonces dice «acepto» o «rechazo».
- **Ejemplo:** `es_guia` en `automata.py` pasa por `INICIO`, `VIO_R`, `VIO_F` y `DIGITOS`.
- **Error típico:** querer reconocer paréntesis bien cerrados con un autómata finito; no puede contar sin límite.

**lenguaje formal**
- **Definición técnica:** conjunto de cadenas de símbolos que cumplen unas reglas precisas; las reglas las da un autómata o una gramática.
- **En palabras sencillas:** la lista de todos los textos «válidos», definida por reglas y no por ejemplos.
- **Dónde se rompe la comparación:** un idioma humano tolera errores y ambigüedad; un lenguaje formal acepta o rechaza sin término medio.
- **Ejemplo:** el lenguaje de las guías contiene `RF-2048` y `RF-0000`, y no contiene `RF-204` ni `rf-2048`.
- **Error típico:** definir el formato con ejemplos sueltos («algo como RF-1234») en vez de una regla verificable.

**compilador**
- **Definición técnica:** programa que traduce código fuente de un lenguaje a otro, normalmente a instrucciones de máquina, pasando por análisis léxico, sintáctico y semántico, optimización y generación de código.
- **En palabras sencillas:** un traductor que primero entiende la frase completa y después la reescribe en el idioma de la CPU.
- **Dónde se rompe la comparación:** un traductor humano adivina la intención; un compilador rechaza el texto si no cumple la gramática.
- **Ejemplo:** `calculadora.py` hace las dos primeras fases; en vez de generar código, evalúa el árbol directamente.
- **Error típico:** creer que Python no tiene fases de compilación; las tiene y por eso un `SyntaxError` aparece antes de ejecutar nada.

**analizador léxico**
- **Definición técnica:** fase que recorre el texto carácter por carácter y lo agrupa en tokens, descartando espacios y comentarios; también se llama *lexer* o tokenizador.
- **En palabras sencillas:** quien separa una frase en palabras antes de que alguien la lea.
- **Dónde se rompe la comparación:** separar palabras es fácil; aquí `2.5` es un solo token aunque tenga tres caracteres.
- **Ejemplo:** `tokenizar("4200 * 2.5")` devuelve `[('NUM', 4200.0), ('OP', '*'), ('NUM', 2.5)]`.
- **Error típico:** dejar pasar caracteres desconocidos en silencio; el error aparece después, más lejos de su causa.

**token**
- **Definición técnica:** unidad mínima con significado que produce el analizador léxico: un par formado por su categoría y su valor.
- **En palabras sencillas:** una ficha con etiqueta: «esto es un número y vale 4200».
- **Dónde se rompe la comparación:** dos fichas iguales pueden tener papeles distintos según dónde aparezcan; eso lo decide la gramática.
- **Ejemplo:** `('OP', '+')` es un token de categoría operador.
- **Error típico:** guardar los números como texto (`'4200'`) en el token y olvidar convertirlos antes de operar.

**gramática**
- **Definición técnica:** conjunto de reglas de producción que describen cómo se combinan los tokens en estructuras válidas; las gramáticas libres de contexto permiten anidar sin límite.
- **En palabras sencillas:** las reglas de construcción de frases: «una suma son términos unidos por más».
- **Dónde se rompe la comparación:** la gramática de un idioma tiene excepciones; una gramática formal no admite ninguna.
- **Ejemplo:** `termino -> factor ('*' factor)*` dice que un término es uno o más factores unidos por `*`.
- **Error típico:** poner suma y multiplicación en la misma regla: entonces `2 + 3 * 4` daría 20 en vez de 14.

**analizador sintáctico**
- **Definición técnica:** fase que recibe los tokens, comprueba que siguen la gramática y construye su estructura; en inglés, *parser*.
- **En palabras sencillas:** quien revisa que las palabras formen una frase bien armada y dibuja cómo se agrupan.
- **Dónde se rompe la comparación:** una persona entiende una frase mal armada; el analizador se detiene en el primer token inesperado.
- **Ejemplo:** la clase `Analizador` tiene un método por regla de la gramática: `expr`, `termino` y `factor`.
- **Error típico:** analizar con trucos de texto (`split("+")`); falla en cuanto aparecen paréntesis.

**árbol de sintaxis**
- **Definición técnica:** árbol cuyos nodos internos son operaciones y cuyas hojas son valores; representa la estructura del programa sin paréntesis ni espacios.
- **En palabras sencillas:** el esquema de la cuenta: qué se calcula primero queda más abajo.
- **Dónde se rompe la comparación:** un esquema dibujado se lee de arriba abajo; el árbol se evalúa de las hojas hacia la raíz.
- **Ejemplo:** `('+', ('*', 4200.0, 2.5), 3000.0)`: la multiplicación es hija de la suma, así que va primero.
- **Error típico:** evaluar el texto de izquierda a derecha sin construir el árbol y perder la precedencia.

#### ► CÓMO FUNCIONA
Un compilador trabaja por fases, como una línea de producción. El **analizador léxico** convierte caracteres en
tokens. El **analizador sintáctico** comprueba la gramática y construye el árbol. Después vienen el análisis de
tipos, la optimización y la generación de código. Este tema construye las dos primeras fases y evalúa el árbol.

Hay dos herramientas teóricas detrás. Un **autómata finito** basta para reconocer formatos planos, como una guía o
un correo. Una **gramática** hace falta cuando hay anidamiento, como paréntesis dentro de paréntesis.

```mermaid
flowchart LR
    T["texto: 4200 * 2.5 + 3000"] --> L["analizador léxico"]
    L --> K["tokens: NUM OP NUM OP NUM"]
    K --> P["analizador sintáctico"]
    P --> A["árbol: + con hijo * a la izquierda"]
    A --> E["evaluar: 13500.0"]
    L -. "carácter desconocido" .-> X["ValueError"]
    P -. "token inesperado" .-> X
```

#### Problema resuelto 2.1
Escribe un autómata que acepte solo guías con el formato `RF-` seguido de exactamente cuatro dígitos.

**Razonamiento:**
1. Los estados son los pasos del formato: aún no vi nada, vi `R`, vi `F`, ya estoy en los dígitos.
2. Cada símbolo válido para el estado actual avanza; cualquier otro rechaza de inmediato.
3. Al acabar el texto se acepta solo si estás en `DIGITOS` con exactamente cuatro.

```python
# automata.py — autómata finito que reconoce guías de RutaFlow con el formato RF-####
def es_guia(texto: str) -> bool:
    estado = "INICIO"
    digitos = 0
    for simbolo in texto:
        if estado == "INICIO" and simbolo == "R":
            estado = "VIO_R"
        elif estado == "VIO_R" and simbolo == "F":
            estado = "VIO_F"
        elif estado == "VIO_F" and simbolo == "-":
            estado = "DIGITOS"
        elif estado == "DIGITOS" and simbolo.isdigit():
            digitos += 1
        else:
            return False                  # símbolo inválido para el estado actual
    return estado == "DIGITOS" and digitos == 4


for valor in ["RF-2048", "RF-20A8", "RF-12345", "RF-", "rf-2048"]:
    print(f"{valor:<9} {es_guia(valor)}")
```

```text
$ python3 automata.py
RF-2048   True
RF-20A8   False
RF-12345  False
RF-       False
rf-2048   False
```

**Explicación por partes.**
- Línea 3: el estado inicial. El autómata solo recuerda dos cosas: su estado y cuántos dígitos vio.
- Líneas 6–13: cada `elif` es una transición: estado actual más símbolo leído da el estado siguiente.
- Línea 15: cualquier combinación sin transición rechaza; por eso `RF-20A8` muere en la `A`.
- Línea 16: el estado final decide. `RF-` termina en `DIGITOS` con 0 dígitos y `RF-12345` con 5: ambos se rechazan.
- `rf-2048` se rechaza porque el autómata distingue mayúsculas: `"r" == "R"` es falso.

> **Buena práctica.** Escribe primero la tabla de transiciones (estado, símbolo, siguiente) y después el código. La
> tabla se revisa en papel con el equipo; el código solo la copia.

#### Problema resuelto 2.2
Construye una calculadora de tarifas que acepte `+`, `*`, paréntesis y números con decimales, respetando que la
multiplicación va antes que la suma.

**Razonamiento:**
1. Gramática con un nivel por precedencia: `expr` suma términos, `termino` multiplica factores, `factor` es un número o una `expr` entre paréntesis.
2. El analizador léxico agrupa dígitos y punto en un solo token `NUM`.
3. El analizador sintáctico tiene un método por regla; `factor` llama a `expr` para los paréntesis: es recursión.
4. `evaluar` recorre el árbol: una hoja devuelve su número, un nodo opera los resultados de sus hijos.

```python
# calculadora.py — analizador léxico y sintáctico para expresiones de tarifa
def tokenizar(texto):
    tokens = []
    i = 0
    while i < len(texto):
        simbolo = texto[i]
        if simbolo == " ":
            i += 1
        elif simbolo.isdigit():
            inicio = i
            while i < len(texto) and (texto[i].isdigit() or texto[i] == "."):
                i += 1
            tokens.append(("NUM", float(texto[inicio:i])))
        elif simbolo in "+*()":
            tokens.append(("OP", simbolo))
            i += 1
        else:
            raise ValueError(f"carácter inesperado {simbolo!r} en la posición {i}")
    return tokens


class Analizador:
    """Gramática: expr -> termino ('+' termino)* ; termino -> factor ('*' factor)* ;
    factor -> NUM | '(' expr ')'"""

    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def mirar(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else ("FIN", None)

    def consumir(self, esperado):
        tipo, valor = self.mirar()
        if valor != esperado:
            raise ValueError(f"se esperaba {esperado!r} y llegó {valor!r}")
        self.pos += 1

    def expr(self):
        arbol = self.termino()
        while self.mirar() == ("OP", "+"):
            self.consumir("+")
            arbol = ("+", arbol, self.termino())
        return arbol

    def termino(self):
        arbol = self.factor()
        while self.mirar() == ("OP", "*"):
            self.consumir("*")
            arbol = ("*", arbol, self.factor())
        return arbol

    def factor(self):
        tipo, valor = self.mirar()
        if tipo == "NUM":
            self.pos += 1
            return valor
        self.consumir("(")
        arbol = self.expr()
        self.consumir(")")
        return arbol


def evaluar(arbol):
    if isinstance(arbol, float):
        return arbol
    operador, izquierda, derecha = arbol
    if operador == "+":
        return evaluar(izquierda) + evaluar(derecha)
    return evaluar(izquierda) * evaluar(derecha)


if __name__ == "__main__":
    for texto in ["4200 * 2.5 + 3000", "4200 * (2.5 + 1)"]:
        tokens = tokenizar(texto)
        arbol = Analizador(tokens).expr()
        print("texto: ", texto)
        print("tokens:", tokens)
        print("árbol: ", arbol)
        print("valor: ", evaluar(arbol))
```

```text
$ python3 calculadora.py
texto:  4200 * 2.5 + 3000
tokens: [('NUM', 4200.0), ('OP', '*'), ('NUM', 2.5), ('OP', '+'), ('NUM', 3000.0)]
árbol:  ('+', ('*', 4200.0, 2.5), 3000.0)
valor:  13500.0
texto:  4200 * (2.5 + 1)
tokens: [('NUM', 4200.0), ('OP', '*'), ('OP', '('), ('NUM', 2.5), ('OP', '+'), ('NUM', 1.0), ('OP', ')')]
árbol:  ('*', 4200.0, ('+', 2.5, 1.0))
valor:  14700.0
```

**Explicación por partes.**
- Líneas 2–19: el analizador léxico. Las líneas 9–13 consumen todos los dígitos y puntos seguidos y los convierten con `float`.
- Líneas 30–37: `mirar` muestra el token actual sin avanzar; `consumir` exige uno concreto o lanza `ValueError`.
- Líneas 39–51: `expr` y `termino` son la gramática hecha código. Como `expr` llama a `termino`, la multiplicación queda más abajo en el árbol.
- Líneas 53–61: `factor` acepta un número o abre un paréntesis y vuelve a empezar en `expr`.
- Líneas 64–70: `evaluar` es recursivo. Las hojas son `float`; los nodos son tuplas `(operador, izquierda, derecha)`.
- En la segunda expresión el paréntesis cambia el árbol: la suma queda dentro de la multiplicación y el valor sube a `14700.0`.

Para probar otras entradas sin editar el archivo, este programa recibe la expresión como argumento:

```python
# revisar.py — analiza la expresión que recibe como argumento del comando
import sys

from calculadora import Analizador, evaluar, tokenizar

arbol = Analizador(tokenizar(sys.argv[1])).expr()
print("árbol:", arbol)
print("valor:", evaluar(arbol))
```

```text
$ python3 revisar.py "2 + 3 * 4"
árbol: ('+', 2.0, ('*', 3.0, 4.0))
valor: 14.0
```

> **Error común.** Escribir la multiplicación con `x`. El analizador léxico se detiene en el primer carácter que no
> conoce:
>
> ```text
> $ python3 revisar.py "4200 x 2.5"
> Traceback (most recent call last):
>   File "/home/estudiante/labs/especializaciones/revisar.py", line 6, in <module>
>     arbol = Analizador(tokenizar(sys.argv[1])).expr()
>                        ~~~~~~~~~^^^^^^^^^^^^^
>   File "/home/estudiante/labs/especializaciones/calculadora.py", line 18, in tokenizar
>     raise ValueError(f"carácter inesperado {simbolo!r} en la posición {i}")
> ValueError: carácter inesperado 'x' en la posición 5
> ```
>
> La última línea dice qué carácter y en qué posición (contando desde 0). Escribe `*`.

> **Error común.** Olvidar cerrar un paréntesis. Con `python3 revisar.py "4200 * (2.5 + 1"` el traceback atraviesa
> `expr`, `termino`, `factor` y `consumir`, y termina en `ValueError: se esperaba ')' y llegó None`. `None` significa
> que el texto se acabó antes de tiempo.

#### Checkpoint 2.1
¿Qué árbol construye `calculadora.py` para `(1 + 2) * 3` y cuánto vale?

Respuesta: `('*', ('+', 1.0, 2.0), 3.0)` y vale `9.0`. El paréntesis hace que la suma sea un `factor` y quede como
hija de la multiplicación.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Dibuja y programa el autómata
Dibuja en papel los cuatro estados de `automata.py` con flechas etiquetadas. Luego escribe el archivo y ejecútalo.

#### Paso 2 · Separa en tokens
Escribe `calculadora.py`. En una terminal interactiva (`python3`), importa `tokenizar` y pruébalo con `"12.5*(3+1)"`.

#### Paso 3 · Construye el árbol
Ejecuta `python3 calculadora.py` y dibuja a mano los dos árboles de la salida, con la raíz arriba.

#### Paso 4 · Provoca los dos errores
Escribe `revisar.py` y ejecútalo con `"4200 x 2.5"` y con `"4200 * (2.5 + 1"`. Señala qué fase falló en cada caso.

#### Resumen
- Un **autómata finito** reconoce un **lenguaje formal** plano con un número fijo de estados.
- Un **compilador** traduce por fases: léxica, sintáctica, semántica, optimización y generación de código.
- El **analizador léxico** convierte caracteres en **tokens** con categoría y valor.
- La **gramática** define cómo se combinan los tokens; un nivel por precedencia ordena las operaciones.
- El **analizador sintáctico** sigue la gramática y construye el **árbol de sintaxis**.
- Evaluar el árbol de las hojas a la raíz respeta la precedencia sin reglas extra.

#### Ejercicio verificable 1
Básico. Predice qué devuelve `es_guia` para `"RF-0000"`, `"RF-204"` y `""` (texto vacío).

Respuesta esperada: `True`, `False` y `False`. El texto vacío no entra al bucle y el estado queda en `INICIO`, que no
es de aceptación.

#### Ejercicio verificable 2
Intermedio. Sin ejecutar, escribe el árbol y el valor de `python3 revisar.py "2 + 3 * 4"`. Luego compruébalo.

Respuesta esperada: `árbol: ('+', 2.0, ('*', 3.0, 4.0))` y `valor: 14.0`. La multiplicación queda como hija derecha
de la suma porque `termino` la resuelve antes de que `expr` vea el `+`.

#### Ejercicio verificable 3
Reto. Agrega la resta. Debe tener la misma precedencia que la suma y asociar a la izquierda: `10 - 2 - 3` vale 5.

Respuesta esperada: agrega `-` a los símbolos del analizador léxico. En `expr`, repite el bucle mientras el token
sea `("OP", "+")` o `("OP", "-")`, y usa ese operador en el nodo. En `evaluar`, agrega la rama de la resta. La salida es
`árbol: ('-', ('-', 10.0, 2.0), 3.0)` y `valor: 5.0`.

#### En el trabajo
Esta especialización tiene dos caras. La teórica (autómatas, computabilidad, complejidad) vive en universidades y
centros de investigación. La aplicada construye compiladores, intérpretes y herramientas de desarrollo. Los roles
son **ingeniero de compiladores**, **ingeniero de herramientas de lenguaje** (editores, linters, formateadores) e
**investigador en algoritmos**. Trabajan en equipos de lenguajes y compiladores (LLVM en Apple y Google, Microsoft
con TypeScript y C#, JetBrains con Kotlin, Oracle con Java) y en fabricantes de chips que necesitan compiladores
propios (NVIDIA, Intel). Todo sistema que valida formatos o lee configuraciones usa estas ideas, incluido RutaFlow.

</details>

### Tema 3: Bases de datos, almacenes analíticos y minería de datos · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- distinguir un sistema transaccional de un almacén analítico por el tipo de pregunta que responde;
- resumir datos por grupos con funciones de agregación y `GROUP BY`;
- proteger la calidad del dato con una restricción `CHECK` y leer el error que produce;
- calcular soporte y confianza de una regla de asociación e interpretar si aporta algo.

**Conceptos clave:** sistema transaccional, almacén analítico, función de agregación, GROUP BY, restricción CHECK, minería de datos, regla de asociación, soporte, confianza

#### El problema
La gerente de operaciones de RutaFlow no quiere ver cada entrega: quiere saber **qué zona tarda más** y **por qué**.
Además, sospecha que la lluvia retrasa las entregas del sur, pero no tiene más que una corazonada. ¿Cómo convierte
una base de datos miles de filas en una respuesta por zona? ¿Cómo se pone a prueba una sospecha con datos?

Este tema usa lo que ya conoces: tablas, `SELECT`, `INSERT` y consultas con parámetros `?` en SQLite (Módulo 4), y
**hipótesis** y **evidencia** (Módulo 5, Tema 1; Módulo 0, Tema 5).

#### Glosario del tema

**sistema transaccional**
- **Definición técnica:** base de datos diseñada para muchas escrituras y lecturas pequeñas y concurrentes, con garantías de consistencia por operación; se le llama OLTP (*online transaction processing*).
- **En palabras sencillas:** la caja registradora: anota cada venta al instante y sin errores.
- **Dónde se rompe la comparación:** una caja no responde «¿cuánto vendimos por zona este año?»; un sistema transaccional puede, pero lento.
- **Ejemplo:** la tabla de RutaFlow donde cada mensajero marca «entregado» al llegar.
- **Error típico:** lanzar reportes pesados contra la base transaccional en hora pico y frenar las entregas.

**almacén analítico**
- **Definición técnica:** base de datos optimizada para leer y agregar grandes volúmenes históricos, alimentada por copias periódicas de los sistemas transaccionales; se le llama OLAP o *data warehouse*.
- **En palabras sencillas:** el archivo del contador: no atiende clientes, pero responde preguntas sobre todo el año.
- **Dónde se rompe la comparación:** el archivo es estático; un almacén se recarga cada hora o cada noche y sus datos llegan con retraso.
- **Ejemplo:** una tabla con todas las entregas de 2026 que solo se consulta para reportes por zona y mes.
- **Error típico:** esperar que el almacén muestre la entrega de hace un minuto; refleja la última carga.

**función de agregación**
- **Definición técnica:** función de SQL que recibe muchas filas y devuelve un solo valor: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`.
- **En palabras sencillas:** resumir una columna entera en un número.
- **Dónde se rompe la comparación:** `COUNT(*)` cuenta filas, pero `AVG(columna)` ignora las filas con `NULL` en esa columna.
- **Ejemplo:** `ROUND(AVG(minutos), 1)` da el promedio de minutos con un decimal.
- **Error típico:** mezclar una agregación con una columna sin agrupar: el resultado de esa columna queda sin sentido.

**GROUP BY**
- **Definición técnica:** cláusula de SQL que parte las filas en grupos con el mismo valor en las columnas indicadas y aplica las funciones de agregación a cada grupo.
- **En palabras sencillas:** hacer montones por zona y resumir cada montón por separado.
- **Dónde se rompe la comparación:** los montones no tienen orden; si quieres un orden fijo, agrega `ORDER BY`.
- **Ejemplo:** `GROUP BY zona` produce una fila para `centro`, otra para `norte` y otra para `sur`.
- **Error típico:** filtrar grupos con `WHERE COUNT(*) >= 2`; el filtro de grupos se escribe con `HAVING`.

**restricción CHECK**
- **Definición técnica:** regla declarada en la tabla que la base de datos evalúa en cada `INSERT` o `UPDATE`; si es falsa, rechaza la operación.
- **En palabras sencillas:** un portero en la puerta de la tabla que no deja entrar datos imposibles.
- **Dónde se rompe la comparación:** el portero solo revisa lo que le dijiste; un dato posible pero falso (`minutos = 30` cuando fueron 90) entra igual.
- **Ejemplo:** `minutos INTEGER NOT NULL CHECK (minutos > 0)`.
- **Error típico:** validar solo en el programa; otro programa o una consulta manual inserta el dato imposible.

**minería de datos**
- **Definición técnica:** proceso de descubrir patrones útiles y no evidentes en grandes volúmenes de datos con métodos estadísticos y algorítmicos: reglas de asociación, agrupamiento, detección de anomalías.
- **En palabras sencillas:** buscar regularidades en el historial que nadie había visto a simple vista.
- **Dónde se rompe la comparación:** a diferencia de minar oro, aquí siempre «encuentras» algo; la mitad puede ser casualidad.
- **Ejemplo:** descubrir en el historial que las entregas del sur con lluvia se retrasan más que el promedio.
- **Error típico:** tratar un patrón como causa; la minería muestra asociaciones, no explica por qué ocurren.

**regla de asociación**
- **Definición técnica:** implicación del tipo «si A, entonces B» extraída de los datos, acompañada de medidas que dicen con qué frecuencia y fiabilidad se cumple.
- **En palabras sencillas:** «cuando pasa esto, suele pasar aquello», con números que dicen qué tan seguido.
- **Dónde se rompe la comparación:** «suele pasar» en lenguaje común es vago; aquí se mide con soporte y confianza.
- **Ejemplo:** «si es zona sur con lluvia, entonces hay retraso».
- **Error típico:** aceptar una regla con confianza alta sin compararla con lo que pasa en general.

**soporte**
- **Definición técnica:** fracción de todas las filas que cumplen a la vez la condición y la consecuencia de la regla.
- **En palabras sencillas:** qué tan común es el caso completo en todo el historial.
- **Dónde se rompe la comparación:** un soporte bajo no hace falsa la regla; solo dice que hay pocos casos para creerle.
- **Ejemplo:** 3 de 10 entregas fueron «sur, lluvia y retraso»: soporte `0.30`.
- **Error típico:** sacar conclusiones de una regla que se cumplió dos veces en diez mil filas.

**confianza**
- **Definición técnica:** fracción de las filas que cumplen la condición que también cumplen la consecuencia; estima P(B | A).
- **En palabras sencillas:** cuando se da la condición, qué tan seguido se da el resultado.
- **Dónde se rompe la comparación:** «confianza» aquí es una proporción, no una certeza ni un intervalo estadístico.
- **Ejemplo:** de 4 entregas del sur con lluvia, 3 se retrasaron: confianza `0.75`.
- **Error típico:** dividir entre todas las filas en vez de entre las que cumplen la condición; eso es el soporte.

#### ► CÓMO FUNCIONA
Los datos viven primero en el sistema transaccional, que registra cada entrega. Cada noche, un proceso copia esos
datos al almacén analítico. Allí se responden preguntas agregadas con `GROUP BY`. La minería de datos va un paso más
allá: no responde una pregunta que traes, sino que busca reglas que no habías formulado.

Una regla solo vale si supera a la referencia. Si el 40 % de todas las entregas se retrasa, una regla con confianza
del 40 % no aporta nada. Por eso se divide la confianza entre la tasa general: ese cociente se llama **elevación**.

```mermaid
flowchart LR
    O["sistema transaccional: una fila por entrega"] -->|"carga nocturna"| W["almacén analítico"]
    W --> G["GROUP BY zona: promedio y máximo"]
    W --> M["minería: busca reglas si A entonces B"]
    M --> S["soporte y confianza"]
    S --> D{"¿confianza mayor que la tasa general?"}
    D -->|"sí"| H["hipótesis para comprobar"]
    D -->|"no"| R["descartar la regla"]
```

#### Problema resuelto 3.1
Calcula, por zona, cuántas entregas hubo, el promedio y el máximo de minutos. Después comprueba que la tabla rechaza
un tiempo negativo.

**Razonamiento:**
1. La tabla declara la regla de negocio: los minutos son enteros positivos. La base de datos la hará cumplir.
2. `GROUP BY zona` arma un grupo por zona; `COUNT`, `AVG` y `MAX` resumen cada grupo.
3. Para demostrar la restricción, el programa intenta insertar `-5` al final y debe fallar.

```python
# entregas.py — tiempos de entrega de RutaFlow agregados por zona con SQLite
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("""CREATE TABLE entrega (
    zona TEXT NOT NULL,
    minutos INTEGER NOT NULL CHECK (minutos > 0)
)""")
db.executemany("INSERT INTO entrega VALUES (?, ?)",
               [("norte", 31), ("norte", 25), ("sur", 48), ("sur", 52), ("centro", 19)])

consulta = """SELECT zona, COUNT(*), ROUND(AVG(minutos), 1), MAX(minutos)
              FROM entrega GROUP BY zona ORDER BY zona"""
for zona, total, promedio, maximo in db.execute(consulta):
    print(f"{zona:<7} envíos={total}  promedio={promedio}  máximo={maximo}")

db.execute("INSERT INTO entrega VALUES (?, ?)", ("sur", -5))   # dato imposible
```

```text
$ python3 entregas.py
centro  envíos=1  promedio=19.0  máximo=19
norte   envíos=2  promedio=28.0  máximo=31
sur     envíos=2  promedio=50.0  máximo=52
Traceback (most recent call last):
  File "/home/estudiante/labs/especializaciones/entregas.py", line 17, in <module>
    db.execute("INSERT INTO entrega VALUES (?, ?)", ("sur", -5))   # dato imposible
    ~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
sqlite3.IntegrityError: CHECK constraint failed: minutos > 0
```

**Explicación por partes.**
- Línea 4: `":memory:"` crea una base de datos temporal en la RAM; desaparece al terminar el programa.
- Líneas 5–8: la tabla declara `NOT NULL` y `CHECK (minutos > 0)`. La regla vive en el esquema, no en el código.
- Líneas 12–13: una consulta de agregación. Cada fila del resultado es un grupo, no una entrega.
- Línea 15: las cuatro columnas del `SELECT` llegan como tupla y se desempaquetan en el `for`.
- Línea 17: el `INSERT` con `-5` viola la restricción y SQLite lo rechaza con `IntegrityError`.

> **Error común.** Insertar un dato imposible y no leer el mensaje. La última línea dice
> `sqlite3.IntegrityError: CHECK constraint failed: minutos > 0`: qué tipo de error es (`IntegrityError`) y qué regla
> se violó. No se corrige quitando la restricción, sino corrigiendo el dato o el programa que lo produjo.

> **Buena práctica.** Declara en la tabla las reglas que nunca deben romperse (`NOT NULL`, `CHECK`, `UNIQUE`). El
> programa puede tener un error; la base de datos las sigue haciendo cumplir para todos los programas.

#### Problema resuelto 3.2
Con un historial de diez entregas, comprueba si «zona sur con lluvia» se asocia con retraso más que el promedio.

**Razonamiento:**
1. Filtra las filas que cumplen la condición; de ellas, las que además cumplen la consecuencia.
2. Soporte: casos completos entre todas las filas. Confianza: casos completos entre los que cumplen la condición.
3. Calcula la tasa general de retraso y compárala con la confianza: ese cociente es la elevación.

```python
# mineria.py — busca una regla «si llueve en el sur, entonces hay retraso» en el historial
historial = [
    {"zona": "sur", "lluvia": True, "retraso": True},
    {"zona": "sur", "lluvia": True, "retraso": True},
    {"zona": "sur", "lluvia": True, "retraso": False},
    {"zona": "sur", "lluvia": False, "retraso": False},
    {"zona": "norte", "lluvia": True, "retraso": False},
    {"zona": "norte", "lluvia": False, "retraso": False},
    {"zona": "norte", "lluvia": False, "retraso": True},
    {"zona": "centro", "lluvia": True, "retraso": False},
    {"zona": "centro", "lluvia": False, "retraso": False},
    {"zona": "sur", "lluvia": True, "retraso": True},
]


def evaluar_regla(filas, condicion, consecuencia):
    cumplen_si = [f for f in filas if condicion(f)]
    cumplen_ambas = [f for f in cumplen_si if consecuencia(f)]
    soporte = len(cumplen_ambas) / len(filas)
    confianza = len(cumplen_ambas) / len(cumplen_si)
    base = len([f for f in filas if consecuencia(f)]) / len(filas)
    return soporte, confianza, base


def llueve_en_sur(fila):
    return fila["zona"] == "sur" and fila["lluvia"]


def hubo_retraso(fila):
    return fila["retraso"]


soporte, confianza, base = evaluar_regla(historial, llueve_en_sur, hubo_retraso)
print(f"soporte={soporte:.2f}  confianza={confianza:.2f}  retraso en general={base:.2f}")
print(f"la regla multiplica la probabilidad de retraso por {confianza / base:.2f}")
```

```text
$ python3 mineria.py
soporte=0.30  confianza=0.75  retraso en general=0.40
la regla multiplica la probabilidad de retraso por 1.88
```

**Explicación por partes.**
- Líneas 2–13: el historial. Cada diccionario es una entrega; en la práctica vendría del almacén con una consulta.
- Línea 16: `evaluar_regla` recibe la condición y la consecuencia como funciones. Así sirve para cualquier regla.
- Líneas 17–18: dos comprensiones de lista filtran primero por la condición y después por la consecuencia.
- Líneas 19–21: soporte, confianza y tasa general, cada una con su denominador distinto.
- Línea 35: la elevación es 1.88. La regla casi duplica la tasa de retraso: merece una hipótesis y más datos.

> **Error común.** Evaluar una regla cuya condición no se cumple en ninguna fila, por ejemplo con la zona `"oriente"`.
> La línea 20 divide entre una lista vacía y el programa termina con `ZeroDivisionError: division by zero`. Antes
> de dividir, comprueba que `cumplen_si` tenga filas.

> **Prevenir errores.** Con diez filas, una regla es solo una pista. Antes de cambiar rutas, repite el cálculo con
> meses de historial y anota el número de casos junto a cada porcentaje.

#### Checkpoint 3.1
En `mineria.py`, ¿por qué la confianza (0.75) y el soporte (0.30) son distintos si cuentan los mismos tres casos?

Respuesta: porque dividen entre cosas distintas. El soporte divide entre las 10 filas; la confianza, entre las 4 filas
del sur con lluvia: `3 / 10 = 0.30` y `3 / 4 = 0.75`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Agrega por zona
Escribe `entregas.py` y ejecútalo. Comprueba a mano el promedio del sur: `(48 + 52) / 2 = 50.0`.

#### Paso 2 · Viola la restricción
Lee la última línea del traceback. Cambia `-5` por `0` y confirma que también se rechaza: `0 > 0` es falso.

#### Paso 3 · Mide una regla
Escribe `mineria.py` y ejecútalo. Cuenta tú las filas del sur con lluvia en las líneas 3–12 y compara con la salida.

#### Paso 4 · Busca una regla que no sirva
Cambia `"sur"` por `"norte"` en `llueve_en_sur` y anota en `evidencia-tema3.txt` qué pasa con la elevación.

#### Resumen
- Un **sistema transaccional** registra cada operación; un **almacén analítico** responde preguntas sobre el historial.
- Una **función de agregación** resume muchas filas en un valor; **GROUP BY** la aplica a cada grupo.
- Una **restricción CHECK** hace que la base de datos rechace datos imposibles con `IntegrityError`.
- La **minería de datos** busca patrones que no habías preguntado, como una **regla de asociación**.
- El **soporte** mide qué tan común es el caso completo; la **confianza**, qué tan seguido se cumple la consecuencia.
- Una regla solo aporta si su confianza supera la tasa general; ese cociente es la elevación.

#### Ejercicio verificable 1
Básico. Agrega la entrega `("centro", 23)` al `executemany` de `entregas.py`. Predice la fila de `centro`.

Respuesta esperada: `centro  envíos=2  promedio=21.0  máximo=23`. Las filas de `norte` y `sur` no cambian.

#### Ejercicio verificable 2
Intermedio. Modifica la consulta para mostrar solo las zonas con al menos dos entregas, sin tocar los datos originales.

Respuesta esperada: `GROUP BY zona HAVING COUNT(*) >= 2 ORDER BY zona`. Solo salen `norte` y `sur`; `centro` tiene una
entrega. `HAVING` filtra grupos después de agregar; `WHERE` filtra filas antes.

#### Ejercicio verificable 3
Reto. Evalúa la regla «zona norte con lluvia, entonces retraso» y explica el resultado. Después, haz que
`evaluar_regla` devuelva `None` cuando ninguna fila cumpla la condición, en vez de fallar.

Respuesta esperada: la salida es `soporte=0.00  confianza=0.00  retraso en general=0.40`. La única entrega del norte
con lluvia llegó a tiempo: no hay evidencia de esa regla. Para el caso vacío, agrega `if not cumplen_si: return None`
después de la línea 17 y comprueba el `None` antes de imprimir.

#### En el trabajo
Los datos son una de las especialidades con más vacantes. Los roles son **administrador de bases de datos (DBA)**,
**ingeniero de datos** (mueve datos del sistema transaccional al almacén), **analista de datos** (escribe las
consultas y los tableros) y **científico de datos** (minería y modelos). Trabajan con almacenes como Snowflake,
Google BigQuery, Amazon Redshift y Databricks, y con motores como PostgreSQL, Oracle y SQL Server. Los contratan
bancos, comercio electrónico (Mercado Libre, Rappi), logística y telecomunicaciones. Para profundizar necesitas
SQL avanzado (Módulo 4) y estadística: probabilidad condicional, muestreo y pruebas de hipótesis.

</details>

### Tema 4: Inteligencia artificial, aprendizaje automático y visión · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- separar datos de entrenamiento y de prueba y explicar por qué se evalúa solo con los de prueba;
- construir una línea base y medir con el error absoluto medio si un modelo la supera;
- ajustar a mano una regresión lineal por mínimos cuadrados;
- aplicar una convolución a una imagen pequeña para detectar un borde.

**Conceptos clave:** inteligencia artificial, aprendizaje automático, modelo, datos de entrenamiento, datos de prueba, línea base, error absoluto medio, regresión lineal, mínimos cuadrados, sobreajuste, visión por computador, convolución

#### El problema
Los clientes de RutaFlow preguntan «¿a qué hora llega mi paquete?». Hoy el sistema responde siempre «en unos 28
minutos». Alguien propone usar «inteligencia artificial». Antes de comprar nada, ¿cómo sabes si un modelo predice
mejor que esa respuesta fija? Y para la foto de la firma: ¿cómo encuentra un programa dónde empieza la etiqueta?

Este tema usa lo que ya conoces: listas y comprensiones de lista (Módulo 2, Tema 1), **funciones** (Módulo 1, Tema 4)
y **punto flotante** (Módulo 1, Tema 5). La función `zip(a, b)` recorre dos listas a la vez, en pares.

#### Glosario del tema

**inteligencia artificial y aprendizaje automático**
- **Definición técnica:** la inteligencia artificial (IA) estudia programas que realizan tareas que asociamos con inteligencia. El aprendizaje automático (*machine learning*) es la rama que ajusta parámetros a partir de datos, en vez de programar las reglas a mano.
- **En palabras sencillas:** en lugar de escribir la regla «cada km suma 2.33 minutos», le das ejemplos y el programa calcula ese número.
- **Dónde se rompe la comparación:** el programa no «entiende» las entregas; solo encuentra los números que mejor encajan con los ejemplos.
- **Ejemplo:** `modelo.py` calcula `a` y `b` a partir de cinco entregas pasadas.
- **Error típico:** llamar «IA» a cualquier `if`; si nada se ajusta con datos, no es aprendizaje automático.

**modelo**
- **Definición técnica:** función matemática con parámetros ajustables que recibe datos de entrada (variables explicativas) y produce una predicción.
- **En palabras sencillas:** una fórmula con perillas; entrenar es girar las perillas hasta que la fórmula acierte en los ejemplos.
- **Dónde se rompe la comparación:** una perilla se gira a mano; los parámetros se calculan con un método, aquí con una fórmula cerrada.
- **Ejemplo:** `minutos = 17.29 + 2.33·km`, donde `a = 17.29` y `b = 2.33` son los parámetros.
- **Error típico:** usar el modelo fuera del rango de los datos (200 km) y creer la predicción igual.

**datos de entrenamiento y datos de prueba**
- **Definición técnica:** partición del conjunto de datos. Los de entrenamiento ajustan los parámetros. Los de prueba, nunca vistos durante el ajuste, estiman el error con datos nuevos.
- **En palabras sencillas:** estudias con unos ejercicios y te evalúan con otros distintos.
- **Dónde se rompe la comparación:** en un examen el profesor elige preguntas nuevas; aquí tú separas los datos y debes resistir la tentación de mirar los de prueba.
- **Ejemplo:** `km_entreno` y `min_entreno` tienen 5 entregas; `km_prueba` y `min_prueba`, 2.
- **Error típico:** medir el error con los mismos datos de entrenamiento: sale optimista.

**línea base**
- **Definición técnica:** predictor trivial que sirve de referencia mínima; un modelo solo se justifica si la supera en datos de prueba.
- **En palabras sencillas:** la respuesta perezosa: «siempre 28 minutos». Si tu modelo no la gana, sobra.
- **Dónde se rompe la comparación:** la respuesta perezosa a veces es muy buena; superarla por poco puede no valer el costo del modelo.
- **Ejemplo:** `promedio = 28.0`, el promedio de las entregas de entrenamiento.
- **Error típico:** presentar el error de un modelo sin el de la línea base; sin referencia, el número no dice nada.

**error absoluto medio**
- **Definición técnica:** promedio de las diferencias absolutas entre valores reales y predichos, MAE = Σ|real − predicho| / n; se mide en las unidades del dato.
- **En palabras sencillas:** en promedio, por cuántos minutos se equivoca la predicción.
- **Dónde se rompe la comparación:** un promedio esconde los casos extremos; un MAE de 2 puede incluir un error de 30 minutos.
- **Ejemplo:** la línea base tiene `MAE=4.00`: se equivoca por 4 minutos en promedio.
- **Error típico:** olvidar el valor absoluto: errores de +4 y −4 se cancelan y el promedio da 0.

**regresión lineal**
- **Definición técnica:** modelo que predice un valor numérico como combinación lineal de las entradas: y = a + b·x en el caso de una variable.
- **En palabras sencillas:** la recta que mejor pasa entre los puntos de un gráfico.
- **Dónde se rompe la comparación:** «mejor» no es a ojo: lo define el criterio de mínimos cuadrados.
- **Ejemplo:** con `b = 2.33`, cada kilómetro extra suma unos 2.33 minutos.
- **Error típico:** usar una recta cuando la relación es curva; el error crece en los extremos.

**mínimos cuadrados**
- **Definición técnica:** método que elige los parámetros que minimizan la suma de los cuadrados de los errores; para una recta da b = Σ(x−x̄)(y−ȳ) / Σ(x−x̄)² y a = ȳ − b·x̄.
- **En palabras sencillas:** de todas las rectas posibles, la que menos se aleja de los puntos, castigando más los errores grandes.
- **Dónde se rompe la comparación:** elevar al cuadrado hace que un solo dato raro tire de la recta con mucha fuerza.
- **Ejemplo:** las líneas 18–23 de `modelo.py` aplican esa fórmula paso a paso.
- **Error típico:** aplicarla cuando todos los `x` son iguales: el denominador es cero.

**sobreajuste**
- **Definición técnica:** situación en que un modelo se ajusta tanto a los datos de entrenamiento, incluido su ruido, que su error en datos nuevos es mucho mayor; en inglés, *overfitting*.
- **En palabras sencillas:** memorizar las respuestas del taller en vez de aprender el método.
- **Dónde se rompe la comparación:** un estudiante sabe que memorizó; el modelo no, y solo lo delata el error en prueba.
- **Ejemplo:** la recta tiene MAE 0.21 en entrenamiento y 0.51 en prueba; la diferencia es pequeña, no hay sobreajuste grave.
- **Error típico:** agregar variables hasta que el error de entrenamiento sea cero y celebrarlo.

**visión por computador**
- **Definición técnica:** área que extrae información de imágenes y video; una imagen digital es una matriz de números (píxeles) que el programa transforma.
- **En palabras sencillas:** enseñar al programa a «ver» tratando la foto como una tabla de números.
- **Dónde se rompe la comparación:** tú ves una etiqueta; el programa ve números y solo detecta cambios entre ellos.
- **Ejemplo:** en `vision.py`, `0` es negro y `9` es blanco; la etiqueta blanca empieza en la columna 3.
- **Error típico:** olvidar que la fila 0 está arriba, al revés del eje y de un gráfico matemático.

**convolución**
- **Definición técnica:** operación que desliza un filtro pequeño sobre la imagen y, en cada posición, suma los productos entre el filtro y los píxeles que cubre.
- **En palabras sencillas:** pasar una lupa con una regla de cálculo por toda la foto y anotar un número en cada lugar.
- **Dónde se rompe la comparación:** la lupa no cambia la foto; la convolución produce una imagen nueva, más pequeña que la original.
- **Ejemplo:** el filtro `[-1, 1]` calcula «píxel derecho menos píxel izquierdo»; da 9 justo en el borde.
- **Error típico:** quedarse con el valor máximo y olvidar que un borde de blanco a negro da un número negativo.

#### ► CÓMO FUNCIONA
Todo proyecto de aprendizaje automático sigue el mismo orden. Separa los datos en entrenamiento y prueba. Construye
una línea base. Ajusta el modelo **solo** con los datos de entrenamiento. Mide el error de ambos con los datos de
prueba. Si el modelo no gana con claridad, te quedas con la línea base.

La visión por computador usa la misma idea con otros datos. Una imagen es una matriz de números. Un filtro de
convolución resalta un patrón; las redes neuronales profundas aprenden miles de filtros en vez de escribirlos a mano.

```mermaid
flowchart LR
    D["7 entregas: km y minutos"] --> S["separar"]
    S --> E["entrenamiento: 5"]
    S --> P["prueba: 2"]
    E --> B["línea base: promedio"]
    E --> R["regresión: mínimos cuadrados"]
    B --> M["MAE en prueba"]
    R --> M
    P --> M
    M --> C{"¿el modelo gana con claridad?"}
```

#### Problema resuelto 4.1
Con cinco entregas de entrenamiento (km y minutos), compara la línea base «siempre el promedio» con una regresión
lineal. Mide ambas con dos entregas de prueba.

**Razonamiento:**
1. La línea base no usa los kilómetros: predice siempre el promedio de entrenamiento.
2. La regresión calcula la pendiente `b` y el intercepto `a` con las fórmulas de mínimos cuadrados.
3. Ambas se evalúan con el MAE sobre las entregas de prueba, que ninguna vio al ajustarse.

```python
# modelo.py — línea base contra regresión lineal para predecir minutos de entrega
km_entreno = [2, 3, 4, 6, 8]
min_entreno = [22, 24, 27, 31, 36]
km_prueba = [3.5, 7]
min_prueba = [25, 33]


def mae(reales, predichos):
    errores = [abs(r - p) for r, p in zip(reales, predichos)]
    return sum(errores) / len(errores)


# 1. Línea base: predecir siempre el promedio del entrenamiento.
promedio = sum(min_entreno) / len(min_entreno)
base = [promedio for _ in km_prueba]

# 2. Regresión lineal por mínimos cuadrados: minutos ≈ a + b · km.
media_x = sum(km_entreno) / len(km_entreno)
media_y = promedio
numerador = sum([(x - media_x) * (y - media_y) for x, y in zip(km_entreno, min_entreno)])
denominador = sum([(x - media_x) ** 2 for x in km_entreno])
b = numerador / denominador
a = media_y - b * media_x
lineal = [a + b * x for x in km_prueba]

print(f"línea base: predice {promedio:.1f} min siempre   MAE={mae(min_prueba, base):.2f}")
print(f"regresión:  minutos = {a:.2f} + {b:.2f}·km       MAE={mae(min_prueba, lineal):.2f}")
for km, real, pred in zip(km_prueba, min_prueba, lineal):
    print(f"  {km} km → real {real}, predicho {pred:.1f}")
```

```text
$ python3 modelo.py
línea base: predice 28.0 min siempre   MAE=4.00
regresión:  minutos = 17.29 + 2.33·km       MAE=0.51
  3.5 km → real 25, predicho 25.4
  7 km → real 33, predicho 33.6
```

**Explicación por partes.**
- Líneas 2–5: los datos ya separados. Las dos entregas de prueba no se usan hasta la línea 26.
- Líneas 8–10: `mae` empareja reales y predichos con `zip` y promedia las diferencias absolutas.
- Líneas 14–15: la línea base repite el promedio, `28.0`, una vez por cada entrega de prueba.
- Líneas 18–21: medias, numerador y denominador de mínimos cuadrados, término por término.
- Líneas 22–23: la pendiente y el intercepto. `b = 2.33` minutos por km; `a = 17.29` minutos fijos de cargue.
- La regresión baja el MAE de 4.00 a 0.51 en datos nuevos. Aquí el modelo sí se justifica.

> **Error común.** Entrenar con entregas que tienen todas la misma distancia, por ejemplo `km_entreno = [5, 5, 5, 5, 5]`.
> El denominador de la línea 21 da cero y el programa termina con `ZeroDivisionError: float division by zero` en la
> línea 22. Sin variación en `x` no hay recta que ajustar: necesitas datos más variados, no otra fórmula.

> **Prevenir errores.** Separa los datos de prueba antes de mirar nada y no los toques hasta el final. Si ajustas el
> modelo mirando el error de prueba, ese error deja de medir lo que pasará con datos nuevos.

#### Problema resuelto 4.2
Una foto de la etiqueta llega en escala de grises, con un poco de ruido. Encuentra en cada fila la columna donde
empieza la etiqueta blanca.

**Razonamiento:**
1. Un borde es un cambio brusco entre píxeles vecinos: de 0 a 9.
2. El filtro `[-1, 1]` calcula «derecho menos izquierdo»; es grande y positivo en un borde de negro a blanco.
3. En cada fila, la posición del valor máximo marca el borde, aunque haya ruido pequeño.

```python
# vision.py — detecta el borde de una etiqueta blanca en una foto en escala de grises
imagen = [                      # 0 = negro, 9 = blanco; la etiqueta empieza en la columna 3
    [0, 0, 0, 9, 9, 9],
    [0, 0, 0, 9, 9, 9],
    [0, 1, 0, 9, 8, 9],
    [0, 0, 0, 9, 9, 9],
]
filtro = [-1, 1]                # resta cada píxel de su vecino derecho


def convolucion_horizontal(img, k):
    salida = []
    for fila in img:
        nueva = []
        for c in range(len(fila) - len(k) + 1):
            ventana = fila[c:c + len(k)]
            nueva.append(sum([v * p for v, p in zip(ventana, k)]))
        salida.append(nueva)
    return salida


bordes = convolucion_horizontal(imagen, filtro)
for fila in bordes:
    print(" ".join([f"{v:2}" for v in fila]))
for numero, fila in enumerate(bordes):
    c = fila.index(max(fila))
    print(f"fila {numero}: borde entre las columnas {c} y {c + 1}")
```

```text
$ python3 vision.py
 0  0  9  0  0
 0  0  9  0  0
 1 -1  9 -1  1
 0  0  9  0  0
fila 0: borde entre las columnas 2 y 3
fila 1: borde entre las columnas 2 y 3
fila 2: borde entre las columnas 2 y 3
fila 3: borde entre las columnas 2 y 3
```

**Explicación por partes.**
- Líneas 2–7: la imagen. La fila 2 tiene ruido: un `1` en la zona negra y un `8` en la blanca.
- Línea 15: hay `6 - 2 + 1 = 5` posiciones donde cabe el filtro; por eso cada fila de salida tiene 5 números.
- Líneas 16–17: la ventana toma dos píxeles y la suma de productos aplica el filtro.
- Líneas 25–27: `enumerate` da el número de fila; `index(max(fila))` encuentra la posición del mayor valor.
- La salida marca el borde entre las columnas 2 y 3 en las cuatro filas. El ruido produce valores de 1 y −1, mucho menores que 9.

> **Buena práctica.** Antes de usar una red neuronal para un problema de imágenes, prueba un filtro simple como
> este. Si un borde basta para encontrar la etiqueta, el sistema será más barato, rápido y fácil de explicar.

#### Checkpoint 4.1
¿Qué predice la regresión de `modelo.py` para una entrega de 10 km? ¿Por qué debes desconfiar un poco de ese número?

Respuesta: unos 40.57 minutos (`17.29 + 2.33 × 10`, con los valores sin redondear). Hay que desconfiar porque 10 km
está fuera del rango de entrenamiento (2 a 8 km): el modelo nunca vio una entrega así.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Mide la línea base
Escribe solo las líneas 1–15 de `modelo.py` y agrega un `print` del MAE de la línea base. Debe dar `4.0`.

#### Paso 2 · Ajusta la recta
Completa el archivo y ejecútalo. Comprueba a mano la media de los km de entrenamiento: `(2 + 3 + 4 + 6 + 8) / 5 = 4.6`.

#### Paso 3 · Compara entrenamiento y prueba
Calcula el MAE de la regresión sobre los datos de entrenamiento y anótalo en `evidencia-tema4.txt` junto al de prueba.

#### Paso 4 · Detecta el borde
Escribe `vision.py` y ejecútalo. Cambia el `8` de la fila 2 por `2` y observa si el borde sigue en su lugar.

#### Resumen
- La **inteligencia artificial** busca comportamiento inteligente; el **aprendizaje automático** lo obtiene ajustando un **modelo** con datos.
- Los **datos de entrenamiento** ajustan los parámetros; los **datos de prueba** estiman el error con casos nuevos.
- Toda comparación empieza con una **línea base**; el **error absoluto medio** dice por cuánto se equivoca cada una.
- La **regresión lineal** ajusta una recta y los **mínimos cuadrados** dan sus parámetros con una fórmula cerrada.
- El **sobreajuste** se detecta cuando el error de prueba es mucho mayor que el de entrenamiento.
- La **visión por computador** trata la imagen como matriz; una **convolución** con un filtro resalta bordes.

#### Ejercicio verificable 1
Básico. Agrega al final de `modelo.py` la predicción para 10 km con dos decimales.

Respuesta esperada: `print(f"{a + b * 10:.2f}")` muestra `40.57`.

#### Ejercicio verificable 2
Intermedio. Calcula el MAE de la regresión y de la línea base sobre los **datos de entrenamiento**. ¿Qué indican?

Respuesta esperada: regresión `0.21` y línea base `4.40` (redondeados a dos decimales). La regresión se equivoca más
en prueba (0.51) que en entrenamiento (0.21), como es normal. La diferencia es pequeña: no hay sobreajuste grave.

#### Ejercicio verificable 3
Reto. Cambia el filtro de `vision.py` a `[1, -1]` y ejecuta. Explica por qué la detección falla y corrígela.

Respuesta esperada: la columna del borde vale `-9` y `max` elige otra posición; la fila 0 dice «entre las columnas 0 y
1». Corrige buscando el mayor **valor absoluto**: `c = [abs(v) for v in fila].index(max([abs(v) for v in fila]))`. Así
el borde vuelve a estar entre las columnas 2 y 3, sin importar su dirección.

#### En el trabajo
Los roles son **ingeniero de aprendizaje automático** (lleva modelos a producción), **científico de datos**
(experimenta y mide), **ingeniero de visión por computador** e **investigador en IA**. Las empresas de modelos
grandes (Google DeepMind, OpenAI, Anthropic, Meta) investigan; casi todas las demás aplican: logística (estimación de
llegada en Uber, Rappi o DHL), bancos (fraude), salud (imágenes médicas) y manufactura (inspección visual). Para
profundizar necesitas álgebra lineal, cálculo, probabilidad y estadística, en ese orden. El hábito profesional más
valioso es el de este tema: medir contra una línea base antes de prometer nada.

</details>

### Tema 5: Gráficos y cómputo científico · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- rotar puntos con una matriz de rotación y comprobar que las distancias se conservan;
- convertir grados a radianes y explicar por qué las funciones trigonométricas los exigen;
- rasterizar puntos en una cuadrícula de texto, como hace una pantalla con sus píxeles;
- aproximar una integral con la regla del trapecio y medir cómo baja el error de discretización.

**Conceptos clave:** gráficos por computador, transformación geométrica, matriz de rotación, radián, rasterización, cómputo científico, método numérico, regla del trapecio, error de discretización

#### El problema
El mapa de RutaFlow debe girar cuando el mensajero gira, para que «adelante» siempre apunte hacia arriba. Si el giro
deforma el mapa, las distancias mentirían. Además, el camión solo reporta su **velocidad** cada minuto, y finanzas
necesita la **distancia** recorrida para pagar el combustible. ¿Cómo se gira un dibujo sin deformarlo? ¿Cómo se
calcula una distancia si solo conoces velocidades sueltas?

Este tema usa lo que ya conoces: **punto flotante y error de redondeo** (Módulo 1, Tema 5) y funciones que reciben
otras funciones como argumento (Tema 3 de este módulo).

#### Glosario del tema

**gráficos por computador**
- **Definición técnica:** área que genera y manipula imágenes con modelos geométricos: transforma coordenadas, proyecta escenas 3D en 2D y calcula el color de cada píxel.
- **En palabras sencillas:** enseñar al computador a dibujar a partir de números.
- **Dónde se rompe la comparación:** un dibujante ve el dibujo; el programa solo maneja coordenadas hasta el último paso, cuando pinta píxeles.
- **Ejemplo:** girar el mapa del mensajero 90° y volver a dibujarlo.
- **Error típico:** pensar que los gráficos son solo diseño visual; su núcleo es álgebra lineal.

**transformación geométrica**
- **Definición técnica:** función que asigna a cada punto del plano o del espacio un punto nuevo; las básicas son traslación, rotación y escala.
- **En palabras sencillas:** mover, girar o agrandar un dibujo aplicando la misma regla a todos sus puntos.
- **Dónde se rompe la comparación:** mover una hoja de papel no la cambia; una escala sí cambia las distancias.
- **Ejemplo:** `rotar(punto, 90)` es una transformación geométrica.
- **Error típico:** aplicar la transformación a unos puntos y no a otros: el dibujo se rompe.

**matriz de rotación**
- **Definición técnica:** matriz 2×2 que gira un punto un ángulo θ alrededor del origen: x' = x·cos θ − y·sin θ, y' = x·sin θ + y·cos θ.
- **En palabras sencillas:** la receta fija para girar cualquier punto: dos multiplicaciones y una suma por coordenada.
- **Dónde se rompe la comparación:** gira alrededor del origen `(0, 0)`, no alrededor del centro del dibujo; para eso hay que trasladar antes.
- **Ejemplo:** con θ = 90°, el punto `(2, 0)` pasa a `(0, 2)`.
- **Error típico:** cambiar un signo de la fórmula: el dibujo gira al revés o se refleja como en un espejo.

**radián**
- **Definición técnica:** unidad de ángulo en la que una vuelta completa mide 2π; se convierte con radianes = grados · π / 180.
- **En palabras sencillas:** otra forma de medir ángulos, la que usan `math.cos` y `math.sin`.
- **Dónde se rompe la comparación:** los grados son cómodos para las personas; los radianes, para las fórmulas.
- **Ejemplo:** 90° son π/2 ≈ 1.5708 radianes.
- **Error típico:** pasar grados directamente: `cos(90)` da `-0.448…`, no `0`.

**rasterización**
- **Definición técnica:** conversión de figuras geométricas con coordenadas reales en una cuadrícula de píxeles con coordenadas enteras.
- **En palabras sencillas:** pasar un dibujo perfecto a una hoja cuadriculada, pintando las casillas más cercanas.
- **Dónde se rompe la comparación:** en la hoja cuadriculada eliges tú; aquí `round` decide, y dos puntos cercanos pueden caer en la misma casilla.
- **Ejemplo:** `rasterizar` convierte `(2.0, 1.0)` en la fila 1, columna 5 de una rejilla de 7×5.
- **Error típico:** olvidar que la fila 0 de la pantalla está arriba: el dibujo sale de cabeza.

**cómputo científico**
- **Definición técnica:** área que resuelve con computador problemas matemáticos de la ciencia y la ingeniería (integrales, ecuaciones diferenciales, sistemas lineales) cuando no hay solución exacta práctica.
- **En palabras sencillas:** usar el computador como calculadora gigante para problemas que a mano no terminarías.
- **Dónde se rompe la comparación:** una calculadora da la respuesta exacta; aquí casi siempre obtienes una aproximación con un error que debes medir.
- **Ejemplo:** estimar la distancia recorrida a partir de la velocidad del camión.
- **Error típico:** reportar todos los decimales de una aproximación como si fueran exactos.

**método numérico**
- **Definición técnica:** algoritmo que aproxima la solución de un problema matemático con operaciones aritméticas finitas, junto con una forma de estimar su error.
- **En palabras sencillas:** una receta para acercarte tanto como quieras a una respuesta que no puedes calcular exacta.
- **Dónde se rompe la comparación:** «tanto como quieras» tiene límite: con pasos demasiado pequeños aparece el error de redondeo.
- **Ejemplo:** la regla del trapecio es un método numérico para integrales.
- **Error típico:** usar un método sin comprobarlo antes en un caso cuya respuesta exacta conoces.

**regla del trapecio**
- **Definición técnica:** método que aproxima la integral de f entre a y b dividiendo el intervalo en n tramos de ancho h y sumando el área de un trapecio en cada tramo.
- **En palabras sencillas:** medir el área bajo una curva cortándola en franjas y tratando cada franja como un trapecio.
- **Dónde se rompe la comparación:** un trapecio tiene lados rectos; la curva no, y esa diferencia es el error.
- **Ejemplo:** con `n=8` franjas, la distancia estimada es `1.171875` km.
- **Error típico:** olvidar dividir entre 2 los extremos `f(a)` y `f(b)`: cada uno pertenece a un solo trapecio.

**error de discretización**
- **Definición técnica:** diferencia entre la solución exacta de un problema continuo y la de su versión dividida en pasos finitos; en el trapecio es proporcional a h².
- **En palabras sencillas:** lo que pierdes por mirar la curva en puntos sueltos en vez de completa.
- **Dónde se rompe la comparación:** no es un error de programación: aparece aunque el código sea perfecto.
- **Ejemplo:** al duplicar `n`, el error de la salida se divide aproximadamente entre 4.
- **Error típico:** confundirlo con el error de redondeo del punto flotante, que es mucho más pequeño aquí.

#### ► CÓMO FUNCIONA
Un programa de gráficos trabaja en dos mundos. En el **mundo geométrico**, los puntos tienen coordenadas reales y
se transforman con fórmulas exactas. En el **mundo de la pantalla**, solo hay píxeles en filas y columnas enteras.
La rasterización es el puente entre los dos.

El cómputo científico tiene un puente parecido. El problema real es continuo: la velocidad cambia en cada instante.
El computador solo maneja pasos finitos. Un método numérico cruza ese puente y te dice cuánto error cometes.

```mermaid
flowchart TB
    subgraph G["gráficos"]
        P["puntos reales"] --> R["rotación: cos y sin"] --> Q["puntos rotados"] --> X["rasterización: round"] --> PX["píxeles"]
    end
    subgraph C["cómputo científico"]
        V["velocidad continua"] --> T["n tramos de ancho h"] --> A["suma de trapecios"] --> E["distancia con error proporcional a h²"]
    end
```

#### Problema resuelto 5.1
Gira 90° una ruta de tres paradas, comprueba que la longitud de cada tramo no cambia y dibuja la ruta antes y
después en una rejilla de texto.

**Razonamiento:**
1. Convertir grados a radianes y aplicar la matriz de rotación a cada punto.
2. Medir cada tramo con `math.dist` antes y después; una rotación no debe cambiar ninguna distancia.
3. Rasterizar: redondear cada coordenada y llevarla a fila y columna, con el origen en el centro de la rejilla.

```python
# transformar.py — rota las paradas de una ruta y comprueba que las distancias se conservan
from math import cos, dist, pi, sin


def rotar(punto, grados):
    radianes = grados * pi / 180
    x, y = punto
    return (x * cos(radianes) - y * sin(radianes),
            x * sin(radianes) + y * cos(radianes))


def rasterizar(puntos, ancho=7, alto=5):
    """Dibuja cada punto en la celda entera más cercana de una cuadrícula de texto."""
    rejilla = [["." for _ in range(ancho)] for _ in range(alto)]
    for i, (x, y) in enumerate(puntos):
        columna = round(x) + ancho // 2
        fila = alto // 2 - round(y)          # en pantalla, la fila 0 está arriba
        rejilla[fila][columna] = str(i)
    return "\n".join(["".join(f) for f in rejilla])


ruta = [(0.0, 0.0), (2.0, 0.0), (2.0, 1.0)]   # salida, parada 1, entrega
rotada = [rotar(p, 90) for p in ruta]

for antes, despues in zip(ruta, rotada):
    print(antes, "→", (round(despues[0], 6), round(despues[1], 6)))
for i in range(len(ruta) - 1):
    print(f"tramo {i}-{i + 1}: antes {dist(ruta[i], ruta[i + 1]):.6f}  "
          f"después {dist(rotada[i], rotada[i + 1]):.6f}")
print(rasterizar(ruta))
print()
print(rasterizar(rotada))
print("x de la parada 1 sin redondear:", rotada[1][0])
```

```text
$ python3 transformar.py
(0.0, 0.0) → (0.0, 0.0)
(2.0, 0.0) → (0.0, 2.0)
(2.0, 1.0) → (-1.0, 2.0)
tramo 0-1: antes 2.000000  después 2.000000
tramo 1-2: antes 1.000000  después 1.000000
.......
.....2.
...0.1.
.......
.......

..21...
.......
...0...
.......
.......
x de la parada 1 sin redondear: 1.2246467991473532e-16
```

**Explicación por partes.**
- Línea 6: la conversión a radianes. Sin ella, `cos` y `sin` interpretan 90 como 90 radianes.
- Líneas 8–9: la matriz de rotación escrita como dos expresiones, una por coordenada.
- Líneas 16–17: la rasterización. `ancho // 2` centra el origen; la resta en la fila invierte el eje vertical.
- Líneas 27–29: `dist` mide cada tramo. Antes y después dan `2.000000` y `1.000000`: la rotación conserva distancias.
- En la rejilla, el número es el índice de la parada: `0` es la salida y no se mueve, porque está en el origen.
- Línea 33: `cos(π/2)` no da 0 exacto sino `6.1e-17`; multiplicado por 2 da `1.2246467991473532e-16`. Es error de redondeo.

> **Error común.** Pasar el ángulo como texto, por ejemplo `rotar((2.0, 0.0), "90")` cuando el valor viene de un
> formulario. La línea 6 falla con `TypeError: can't multiply sequence by non-int of type 'float'`. Python intenta
> repetir el texto `"90"` 3.14 veces. Convierte primero con `float(...)` (Módulo 1, Tema 2).

> **Prevenir errores.** Redondea solo al mostrar, nunca al guardar. Si guardas `round(x, 6)` después de cada giro, el
> error se acumula; si guardas el valor completo, solo se redondea lo que ves.

#### Problema resuelto 5.2
La velocidad del camión durante un tramo de 10 minutos es v(t) = 0.01·t + 0.002·t² km por minuto. Aproxima la
distancia con la regla del trapecio para varios `n` y compara con la integral exacta.

**Razonamiento:**
1. La distancia es el área bajo la curva de velocidad entre 0 y 10 minutos.
2. La integral exacta, calculada a mano, es 0.005·t² + 0.002·t³/3 evaluada en 10: 1.166667 km.
3. Con la regla del trapecio, duplica `n` varias veces y observa cómo cambia el error.

```python
# trapecio.py — distancia recorrida a partir de la velocidad, con la regla del trapecio
def velocidad(t):
    """Velocidad del camión en km por minuto: acelera durante los 10 minutos del tramo."""
    return 0.01 * t + 0.002 * t ** 2


def trapecio(f, a, b, n):
    h = (b - a) / n
    suma = (f(a) + f(b)) / 2
    for i in range(1, n):
        suma += f(a + i * h)
    return h * suma


exacta = 0.005 * 10 ** 2 + 0.002 * 10 ** 3 / 3     # integral calculada a mano
for n in [2, 4, 8, 16, 32]:
    aprox = trapecio(velocidad, 0, 10, n)
    print(f"n={n:2}  distancia={aprox:.6f} km  error={abs(aprox - exacta):.6f}")
print(f"exacta     {exacta:.6f} km")
```

```text
$ python3 trapecio.py
n= 2  distancia=1.250000 km  error=0.083333
n= 4  distancia=1.187500 km  error=0.020833
n= 8  distancia=1.171875 km  error=0.005208
n=16  distancia=1.167969 km  error=0.001302
n=32  distancia=1.166992 km  error=0.000326
exacta     1.166667 km
```

**Explicación por partes.**
- Líneas 2–4: la velocidad como función de Python; `trapecio` la recibe como argumento.
- Línea 8: `h` es el ancho de cada franja.
- Línea 9: los extremos cuentan la mitad, porque cada uno pertenece a un solo trapecio.
- Líneas 10–11: los puntos interiores cuentan completos, porque cada uno es lado de dos trapecios.
- Línea 15: el valor exacto permite medir el error; sin él solo verías que los números se estabilizan.
- La columna de error baja de `0.083333` a `0.020833`: cada vez que `n` se duplica, se divide entre 4. Eso es «error proporcional a h²».

> **Buena práctica.** Valida todo método numérico con un caso cuya respuesta exacta conoces, como aquí. Cuando lo
> uses con datos reales sin fórmula, compara dos valores de `n` para estimar el error.

#### Checkpoint 5.1
Si la tendencia se mantiene, ¿qué error esperas con `n=64`?

Respuesta: unos `0.000081`, la cuarta parte de `0.000326`. Al ejecutarlo, la distancia es `1.166748` y el error, `0.000081`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Rota y mide
Escribe `transformar.py` y ejecútalo. Comprueba con papel cuadriculado que la parada 2 pasa de `(2, 1)` a `(-1, 2)`.

#### Paso 2 · Rompe la conversión
Borra `* pi / 180` en la línea 6 y ejecuta. Anota en `evidencia-tema5.txt` qué pasa con las coordenadas y con las distancias.

#### Paso 3 · Integra
Escribe `trapecio.py` y ejecútalo. Divide cada error entre el siguiente y comprueba que el cociente es cercano a 4.

#### Paso 4 · Rompe los extremos
Cambia la línea 9 por `suma = f(a) + f(b)` y ejecuta. El error ahora solo se divide entre 2 al duplicar `n`:
el método perdió su precisión de orden h².

#### Resumen
- Los **gráficos por computador** son geometría primero y píxeles al final.
- Una **transformación geométrica** aplica la misma regla a todos los puntos; la **matriz de rotación** gira sin deformar.
- `cos` y `sin` trabajan en **radianes**: radianes = grados · π / 180.
- La **rasterización** pasa coordenadas reales a píxeles enteros con la fila 0 arriba.
- El **cómputo científico** resuelve problemas continuos con un **método numérico** y mide su error.
- La **regla del trapecio** aproxima una integral; su **error de discretización** se divide entre 4 al duplicar `n`.

#### Ejercicio verificable 1
Básico. Ejecuta `print(rotar((2.0, 0.0), 180))` al final de `transformar.py`. Explica el número muy pequeño de la salida.

Respuesta esperada: `(-2.0, 2.4492935982947064e-16)`. La `y` debería ser 0; el valor `2.4e-16` es error de redondeo
porque `sin(π)` no da exactamente 0 en punto flotante.

#### Ejercicio verificable 2
Intermedio. Agrega `64` a la lista de `n` en `trapecio.py`. Predice la distancia y el error antes de ejecutar.

Respuesta esperada: `n=64  distancia=1.166748 km  error=0.000081`. El error es la cuarta parte del de `n=32`.

#### Ejercicio verificable 3
Reto. Escribe `escalar(punto, factor)`, que multiplica ambas coordenadas por `factor`. Aplica factor 2 a la ruta y
mide los tramos. ¿Qué diferencia hay con la rotación?

Respuesta esperada: `return (punto[0] * factor, punto[1] * factor)`. Los tramos pasan de `2.0` y `1.0` a `4.0` y `2.0`.
La escala también es una transformación geométrica, pero no conserva distancias: las multiplica por el factor.

#### En el trabajo
Los roles de gráficos son **programador de motores gráficos**, **programador de shaders**, **desarrollador de
videojuegos** e **ingeniero de mapas y sistemas de información geográfica**. Trabajan en NVIDIA y AMD, en motores
como Unity y Unreal (Epic Games), en estudios de videojuegos y en mapas (Google Maps, Mapbox, Esri). El cómputo
científico tiene roles de **ingeniero de simulación** e **ingeniero de cómputo de alto rendimiento (HPC)** en
energía, clima, aeroespacial y laboratorios de investigación. Ambas especialidades exigen álgebra lineal, cálculo y
métodos numéricos antes que cualquier herramienta.

</details>

### Tema 6: Redes, seguridad, web e ingeniería profesional · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- resumir latencias con percentiles y explicar por qué el promedio esconde la cola lenta;
- separar evidencia, inferencia y decisión en un hallazgo que no se pueda editar en silencio;
- sellar un reporte con un hash criptográfico y detectar si alguien lo alteró;
- seudonimizar datos personales con HMAC antes de compartir un reporte.

**Conceptos clave:** latencia, percentil, semilla, reproducibilidad, inferencia, dataclass, dato inmutable, hash criptográfico, HMAC, seudonimización, ética profesional

#### El problema
Varios clientes de RutaFlow se quejan: «la página de seguimiento a veces tarda una eternidad». Un ingeniero propone
comprar el doble de servidores. Otro dice que el problema es una sola dependencia, la API de mapas. Hay que medir,
escribir un hallazgo honesto y compartirlo con otro equipo sin exponer teléfonos de clientes. ¿Cómo se hace eso de
forma que nadie pueda cambiar los números después?

Este tema usa lo que ya conoces: **red**, **cliente y servidor**, **HTTP** y **petición** (Módulo 3, Temas 1 y 2),
**evidencia** (Módulo 0, Tema 5), **hipótesis** (Módulo 5, Tema 1), **JSON** (Módulo 3, Tema 2) y **función hash**
(Módulo 2, Tema 6).

#### Glosario del tema

**latencia**
- **Definición técnica:** tiempo entre el envío de una petición y la llegada de su respuesta, medido desde el cliente; incluye red, colas y procesamiento.
- **En palabras sencillas:** cuánto esperas desde que pides algo hasta que te contestan.
- **Dónde se rompe la comparación:** no es la velocidad de la conexión: una red rápida con un servidor saturado tiene latencia alta.
- **Ejemplo:** `610` ms en la lista de `hallazgo.py` es una petición lenta a la API de mapas.
- **Error típico:** medir la latencia solo desde el servidor y olvidar el tiempo de red que sí sufre el cliente.

**percentil**
- **Definición técnica:** el percentil p de una muestra es el valor por debajo del cual queda el p % de las observaciones; p50 es la mediana y p95 marca la cola lenta.
- **En palabras sencillas:** «el 95 % de las peticiones tardó esto o menos».
- **Dónde se rompe la comparación:** hay varias formas de calcularlo; con muestras pequeñas dan valores distintos y conviene decir cuál usaste.
- **Ejemplo:** `p50=164 ms` y `p95=610 ms`: la petición típica es rápida y la cola es casi cuatro veces más lenta.
- **Error típico:** reportar solo el promedio; dos peticiones de 700 ms se diluyen entre dieciocho rápidas.

**semilla**
- **Definición técnica:** valor inicial de un generador de números pseudoaleatorios; con la misma semilla, el generador produce siempre la misma secuencia.
- **En palabras sencillas:** el número que hace que el «azar» se repita igual cada vez que ejecutas.
- **Dónde se rompe la comparación:** una semilla fija sirve para experimentos y pruebas; para contraseñas o claves es un error grave.
- **Ejemplo:** `random.Random(2026)` en la línea 8 de `hallazgo.py`.
- **Error típico:** no fijar la semilla en un experimento y no poder reproducir el resultado que se reportó.

**reproducibilidad**
- **Definición técnica:** propiedad de un resultado que otra persona obtiene de nuevo con el mismo código, datos, versiones y semilla.
- **En palabras sencillas:** que tu compañera ejecute lo mismo y vea exactamente lo mismo.
- **Dónde se rompe la comparación:** reproducir no es repetir a mano; exige anotar versiones, semillas y origen de los datos.
- **Ejemplo:** el sello `d32b25280e855610` sale igual en cada ejecución de `hallazgo.py`.
- **Error típico:** reportar un número que salió una vez y que nadie, ni tú, puede volver a obtener.

**inferencia**
- **Definición técnica:** conclusión que se razona a partir de la evidencia y que va más allá de ella; debe poder fallar con nueva evidencia.
- **En palabras sencillas:** lo que crees que significan los datos, escrito aparte de los datos.
- **Dónde se rompe la comparación:** en la conversación diaria se mezclan dato y opinión; en un hallazgo técnico van en campos distintos.
- **Ejemplo:** «la latencia alta podría concentrarse en una dependencia» es inferencia; «2 de 20 superaron 500 ms» es evidencia.
- **Error típico:** escribir la inferencia como si fuera evidencia: «la API de mapas es lenta» sin haberla medido aparte.

**dataclass**
- **Definición técnica:** clase de Python generada por el decorador `@dataclass` del módulo `dataclasses`, que crea `__init__`, `__repr__` y `__eq__` a partir de los atributos declarados con su tipo.
- **En palabras sencillas:** una clase para guardar datos en la que Python escribe por ti el código repetitivo.
- **Dónde se rompe la comparación:** las anotaciones de tipo (`evidencia: str`) no se comprueban al ejecutar; documentan, no validan.
- **Ejemplo:** `class Hallazgo` con tres campos de texto en las líneas 17–21.
- **Error típico:** olvidar la anotación de tipo: sin `: str`, el atributo no se convierte en campo.

**dato inmutable**
- **Definición técnica:** objeto cuyo estado no puede cambiar después de crearse; en una dataclass se obtiene con `frozen=True`, que hace fallar toda asignación a sus campos.
- **En palabras sencillas:** un acta firmada: si hay que corregir, se escribe otra acta, no se tacha la vieja.
- **Dónde se rompe la comparación:** la inmutabilidad es superficial: si un campo guarda una lista, la lista sí se puede modificar.
- **Ejemplo:** `@dataclass(frozen=True)` en la línea 17 de `hallazgo.py`.
- **Error típico:** creer que inmutable protege el archivo guardado; solo protege el objeto en memoria. Para el archivo existe el sello.

**hash criptográfico**
- **Definición técnica:** función hash diseñada para que sea inviable encontrar dos entradas con el mismo resultado o deducir la entrada desde el resultado; SHA-256 produce 256 bits.
- **En palabras sencillas:** una huella digital del texto: cualquier cambio, por mínimo que sea, da otra huella.
- **Dónde se rompe la comparación:** a diferencia del `hash()` de Python (Módulo 2, Tema 6), SHA-256 da el mismo resultado en toda máquina y ejecución.
- **Ejemplo:** cambiar `610` por `210` en el reporte cambia el sello de `44017978fe1ad6ce` a `66d025ba01c3029c`.
- **Error típico:** usar un hash sin clave para ocultar datos con pocos valores posibles, como teléfonos: se prueban todos.

**HMAC**
- **Definición técnica:** código de autenticación de mensajes que combina una función hash con una clave secreta; solo quien tiene la clave puede calcularlo o verificarlo.
- **En palabras sencillas:** una huella digital con sello privado: sin la clave, nadie puede fabricar la misma huella.
- **Dónde se rompe la comparación:** si la clave se filtra, el sello deja de proteger; la clave vale tanto como los datos.
- **Ejemplo:** `hmac.new(CLAVE, dato.encode("utf-8"), hashlib.sha256)` en la línea 15 de `seudonimo.py`.
- **Error típico:** escribir la clave real dentro del código y subirla al repositorio.

**seudonimización**
- **Definición técnica:** reemplazo de un identificador personal por un seudónimo estable que no revela la identidad sin información adicional guardada aparte.
- **En palabras sencillas:** cambiar el teléfono del cliente por un código que solo tu equipo puede relacionar con él.
- **Dónde se rompe la comparación:** no es anonimizar: con la clave se puede volver a enlazar, así que la ley la sigue tratando como dato personal.
- **Ejemplo:** `+57 300 555 0101` se publica como `5a5959bec9` en las dos quejas de ese cliente.
- **Error típico:** seudonimizar el teléfono y dejar el nombre o la dirección en otra columna.

**ética profesional**
- **Definición técnica:** conjunto de deberes del ingeniero con usuarios, colegas y sociedad: honestidad en los resultados, protección de datos, competencia y responsabilidad por las consecuencias; los recogen códigos como el de ACM.
- **En palabras sencillas:** no inventar números, no exponer a las personas y decir lo que no sabes.
- **Dónde se rompe la comparación:** no es solo seguir la ley: algo legal puede seguir siendo engañoso o dañino.
- **Ejemplo:** recomendar «añadir trazas antes de comprar servidores» en vez de pedir presupuesto sin evidencia.
- **Error típico:** borrar los datos que contradicen la conclusión que el jefe esperaba.

#### ► CÓMO FUNCIONA
Un hallazgo profesional tiene tres partes separadas. La **evidencia** son mediciones reproducibles. La **inferencia**
es lo que crees que significan. La **decisión** es lo que propones hacer y debe ser coherente con ambas.

Después, el hallazgo se protege. Un objeto inmutable evita cambios accidentales en memoria. Un sello SHA-256 detecta
cambios en el texto guardado. Antes de compartir, los datos personales se reemplazan por seudónimos con HMAC.

```mermaid
flowchart LR
    M["mediciones con semilla"] --> P["p50 y p95"]
    P --> H["Hallazgo inmutable: evidencia, inferencia, decisión"]
    H --> J["JSON ordenado"]
    J --> S["sello SHA-256"]
    Q["quejas con teléfonos"] --> N["seudónimo HMAC"]
    N --> R["reporte compartible"]
    R --> S2["sello del reporte"]
    S2 -. "recalcular y comparar" .-> V{"¿coincide?"}
```

#### Problema resuelto 6.1
Simula 20 latencias de la página de seguimiento, con dos peticiones lentas a la API de mapas. Calcula p50 y p95,
registra el hallazgo como dato inmutable y séllalo.

**Razonamiento:**
1. Semilla fija para que la muestra sea reproducible; las dos peticiones lentas se agregan explícitamente.
2. Percentil por rango más cercano: ordenar y tomar la posición `ceil(p · n) - 1`.
3. `Hallazgo` congelado con tres campos; el sello se calcula sobre su JSON con claves ordenadas.

```python
# hallazgo.py — mide latencias simuladas y registra un hallazgo que no se puede editar en silencio
import hashlib
import json
import math
import random
from dataclasses import asdict, dataclass

generador = random.Random(2026)                    # semilla fija: misma muestra en cada ejecución
latencias = [round(generador.uniform(80, 220)) for _ in range(18)]
latencias += [610, 740]                            # dos peticiones lentas a la API de mapas
ordenadas = sorted(latencias)
p50 = ordenadas[len(ordenadas) // 2]
p95 = ordenadas[math.ceil(0.95 * len(ordenadas)) - 1]
lentas = len([ms for ms in latencias if ms > 500])


@dataclass(frozen=True)
class Hallazgo:
    evidencia: str
    inferencia: str
    decision: str


hallazgo = Hallazgo(
    evidencia=f"{lentas} de {len(latencias)} peticiones superaron 500 ms; p50={p50} ms, p95={p95} ms",
    inferencia="la latencia alta podría concentrarse en una dependencia, no en todo el servicio",
    decision="añadir trazas por dependencia antes de comprar más servidores",
)
texto = json.dumps(asdict(hallazgo), ensure_ascii=False, sort_keys=True)
sello = hashlib.sha256(texto.encode("utf-8")).hexdigest()

print("muestra:", latencias[:5], "...")
print(hallazgo.evidencia)
print("sello SHA-256:", sello[:16])
```

```text
$ python3 hallazgo.py
muestra: [97, 150, 152, 200, 94] ...
2 de 20 peticiones superaron 500 ms; p50=164 ms, p95=610 ms
sello SHA-256: d32b25280e855610
```

**Explicación por partes.**
- Línea 8: `random.Random(2026)` crea un generador propio con semilla; no depende del estado global de `random`.
- Líneas 9–10: dieciocho latencias normales entre 80 y 220 ms, más las dos lentas.
- Líneas 12–13: la mediana y el p95. Con 20 datos, el p95 es el 19.º ordenado: la más rápida de las dos lentas.
- Líneas 17–21: la dataclass congelada. Los tres campos obligan a escribir la inferencia aparte de la evidencia.
- Línea 29: `asdict` convierte el hallazgo en diccionario; `sort_keys=True` fija el orden para que el sello sea estable.
- Línea 30: SHA-256 del texto en UTF-8. Se muestran 16 caracteres; el sello completo tiene 64.

Ahora intenta cambiar la decisión después de registrada:

```python
# congelado.py — intenta cambiar la decisión de un hallazgo ya registrado
from hallazgo import hallazgo

hallazgo.decision = "comprar más servidores"
```

```text
$ python3 congelado.py
muestra: [97, 150, 152, 200, 94] ...
2 de 20 peticiones superaron 500 ms; p50=164 ms, p95=610 ms
sello SHA-256: d32b25280e855610
Traceback (most recent call last):
  File "/home/estudiante/labs/especializaciones/congelado.py", line 4, in <module>
    hallazgo.decision = "comprar más servidores"
    ^^^^^^^^^^^^^^^^^
  File "<string>", line 17, in __setattr__
dataclasses.FrozenInstanceError: cannot assign to field 'decision'
```

> **Error común.** Intentar «corregir» un hallazgo asignando a un campo. Una dataclass con `frozen=True` responde
> `dataclasses.FrozenInstanceError: cannot assign to field 'decision'`. No es un fallo que haya que silenciar: si la
> decisión cambia, crea un hallazgo nuevo y conserva el anterior.

> **Ingeniería de software.** Las tres líneas de salida de `hallazgo.py` salen antes del traceback de `congelado.py`
> porque importar un módulo ejecuta su código. En un proyecto real protegerías esas líneas con
> `if __name__ == "__main__":` (Módulo 1, Tema 4).

#### Problema resuelto 6.2
Comparte con el equipo de mapas las quejas de clientes sin exponer sus teléfonos. Sella el reporte y demuestra que
un cambio posterior se detecta.

**Razonamiento:**
1. Reemplazar cada teléfono por un HMAC truncado: el mismo cliente recibe siempre el mismo seudónimo.
2. La clave del HMAC vive fuera del reporte; quien recibe el reporte no puede revertir el seudónimo.
3. Sellar el reporte, simular una alteración y recalcular el sello.

```python
# seudonimo.py — comparte quejas sin datos personales y detecta si alguien altera el reporte
import hashlib
import hmac
import json

CLAVE = b"clave-de-ejemplo-que-vive-fuera-del-reporte"
quejas = [
    {"cliente": "+57 300 555 0101", "guia": "RF-2048", "minutos": 610},
    {"cliente": "+57 300 555 0101", "guia": "RF-2051", "minutos": 740},
    {"cliente": "+57 311 555 0199", "guia": "RF-2060", "minutos": 95},
]


def seudonimo(dato):
    return hmac.new(CLAVE, dato.encode("utf-8"), hashlib.sha256).hexdigest()[:10]


def sellar(filas):
    texto = json.dumps(filas, sort_keys=True)
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()[:16]


publicas = [{"cliente": seudonimo(q["cliente"]), "guia": q["guia"], "minutos": q["minutos"]}
            for q in quejas]
for fila in publicas:
    print(fila)
sello = sellar(publicas)
print("sello original:   ", sello)

publicas[0]["minutos"] = 210                      # alguien «mejora» un dato sin avisar
print("sello recalculado:", sellar(publicas), "coincide:", sellar(publicas) == sello)
```

```text
$ python3 seudonimo.py
{'cliente': '5a5959bec9', 'guia': 'RF-2048', 'minutos': 610}
{'cliente': '5a5959bec9', 'guia': 'RF-2051', 'minutos': 740}
{'cliente': 'c850705378', 'guia': 'RF-2060', 'minutos': 95}
sello original:    44017978fe1ad6ce
sello recalculado: 66d025ba01c3029c coincide: False
```

**Explicación por partes.**
- Línea 6: la clave de ejemplo. En producción vendría de un gestor de secretos, nunca del código.
- Líneas 14–15: el seudónimo. Las dos quejas del mismo teléfono reciben `5a5959bec9`; así el equipo ve que es un cliente recurrente.
- Líneas 18–20: el sello serializa con `sort_keys=True` y aplica SHA-256.
- Líneas 23–24: el reporte público solo lleva seudónimo, guía y minutos: minimiza los datos.
- Línea 30: alguien cambia 610 por 210 «para que se vea mejor». El sello recalculado ya no coincide.

> **Error común.** Seudonimizar con un hash sin clave: `hashlib.sha256(telefono.encode()).hexdigest()`. Los teléfonos
> de un país son pocos millones; un atacante calcula el hash de todos y recupera cada número. Usa HMAC con clave secreta.

> **Buena práctica.** Publica el sello por un canal distinto al del reporte, por ejemplo en el ticket. Si alguien
> cambia el archivo y el sello en el mismo lugar, el sello no protege nada.

#### Checkpoint 6.1
Con 20 latencias, ¿por qué el p95 es 610 ms y no 740 ms? ¿Qué pasaría con el promedio si quitas las dos lentas?

Respuesta: `ceil(0.95 × 20) - 1 = 18`, y la posición 18 (la 19.ª) de la lista ordenada es `610`; `740` es la 20.ª. Sin
las dos lentas, el promedio baja de 205.5 a 153.3 ms, apenas un 25 %. El p95 baja de 610 a 200 ms: el percentil
delata la cola y el promedio la diluye.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Mide y registra
Escribe `hallazgo.py` y ejecútalo dos veces. Comprueba que el sello `d32b25280e855610` aparece igual en ambas.

#### Paso 2 · Intenta editar
Escribe `congelado.py`, ejecútalo y copia la última línea del traceback en `evidencia-tema6.txt`.

#### Paso 3 · Seudonimiza y sella
Escribe `seudonimo.py` y ejecútalo. Confirma que las dos quejas del mismo teléfono tienen el mismo seudónimo.

#### Paso 4 · Cambia la clave
Cambia una letra de `CLAVE` y ejecuta. Anota qué cambia en la salida y qué no.

#### Resumen
- La **latencia** se resume con **percentiles**: p50 para lo típico y p95 para la cola lenta.
- Una **semilla** fija hace reproducible un experimento con números aleatorios; la **reproducibilidad** exige además versiones y datos.
- Un hallazgo separa evidencia, **inferencia** y decisión, cada una en su campo.
- Una **dataclass** con `frozen=True` crea un **dato inmutable**; corregir es crear un hallazgo nuevo.
- Un **hash criptográfico** como SHA-256 sella el texto: cualquier cambio da otro sello.
- La **seudonimización** con **HMAC** protege identidades; la clave se guarda aparte.
- La **ética profesional** exige no inventar, no exponer y decir lo que no sabes.

#### Ejercicio verificable 1
Básico. Cambia la semilla de `hallazgo.py` a `7` y ejecuta. ¿Qué cambia y qué se mantiene?

Respuesta esperada: la muestra cambia a `[125, 101, 171, 90, 155] ...`, el p50 a `139 ms` y el sello a
`9d1adf608094be59`. Se mantienen `2 de 20 peticiones superaron 500 ms` y `p95=610 ms`, porque dependen de las dos
latencias lentas agregadas a mano.

#### Ejercicio verificable 2
Intermedio. Calcula el seudónimo de `+57 300 555 0101` con la clave `b"otra-clave"` y con SHA-256 sin clave. ¿Cuál
podría revertir un atacante que no conoce ninguna clave?

Respuesta esperada: con `b"otra-clave"` da `f8c55fb008`; con `hashlib.sha256(...)` sin clave, `1ccc7c9dc6`. El de
SHA-256 sin clave se revierte probando todos los teléfonos posibles; el HMAC no, mientras la clave siga secreta.

#### Ejercicio verificable 3
Reto. Escribe `verificar(filas, sello_esperado)` en `seudonimo.py`, que devuelva `True` solo si el reporte no cambió.
Úsala antes y después de la alteración de la línea 30.

Respuesta esperada: `return sellar(filas) == sello_esperado`. Antes de la línea 30 devuelve `True`; después, `False`.
Para comparar sellos en un sistema real, usa `hmac.compare_digest`, que tarda lo mismo aunque los textos difieran
pronto y no da pistas por el tiempo.

#### En el trabajo
Redes y seguridad tienen roles muy demandados: **ingeniero de redes**, **ingeniero de confiabilidad (SRE)**,
**analista de seguridad (SOC)**, **pentester**, **ingeniero de seguridad de aplicaciones** y **oficial de
protección de datos**. Trabajan en Cisco, Cloudflare, Akamai, en la nube (AWS, Azure, Google Cloud), en empresas
de seguridad (CrowdStrike, Palo Alto Networks) y en los equipos internos de bancos y telecomunicaciones. La web y la
ingeniería profesional atraviesan todas las especialidades: cualquier rol del mapa escribe hallazgos, mide latencias
y maneja datos personales. Para profundizar, vuelve a los Módulos 3, 6 y 10.

</details>

### Proyecto 11: portafolio de orientación

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

El proyecto convierte los seis experimentos en una decisión. No hay técnicas nuevas: cada entregable remite al tema
donde se explicó. El objetivo es elegir qué especialización estudiar después, con evidencia propia y no por moda.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Entregables
1. **Seis experimentos.** Los programas de los Temas 1 a 6 en `~/labs/especializaciones`, cada uno con su archivo `evidencia-temaN.txt`.
2. **Una variación propia por tema.** Un cambio que no esté en los ejercicios, con la salida antes y después.
3. **Mapa de prerrequisitos.** Una tabla con una fila por especialización: matemáticas que exige, módulos de este curso que la preparan y un rol de «En el trabajo».
4. **Dos respuestas escritas.** ¿Qué diferencia existe entre usar una herramienta y comprender su fundamento? ¿Qué especializaciones requieren matemáticas adicionales antes de profundizar? Usa un experimento como ejemplo en cada respuesta.
5. **Hallazgo de elección.** Un `Hallazgo` como el del Tema 6: evidencia (qué experimento disfrutaste y entendiste mejor), inferencia y decisión (qué estudiarás los próximos tres meses), con su sello SHA-256.

#### Criterio de terminado
Otra persona clona tu carpeta, ejecuta los seis programas con `python3` y obtiene las mismas salidas que tus archivos
de evidencia, incluido el sello del hallazgo de elección.

</details>
