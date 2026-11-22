# Módulo 0: Cómo funciona tu entorno de desarrollo

## Antes de comenzar: prepara tu primera sesión

Hoy vas a crear un archivo, ejecutar un programa y corregir un error. Puedes trabajar por temas y volver después: el objetivo es poder repetir el procedimiento y explicar lo que observaste.

Una **carpeta** reúne archivos. Un **archivo** guarda contenido con un nombre, como `saludo.py`. El **editor** permite escribir ese contenido; la **terminal** permite pedirle acciones al computador escribiendo comandos. No pegues comandos en el archivo Python ni código Python directamente en la terminal.

Las siete palabras que se usan todo el capítulo, con la acción que te piden:

| Palabra | Qué es | Qué haces con ella |
|---|---|---|
| `mkdir nombre` | crear una carpeta vacía | `mkdir primera-sesion` |
| `cd nombre` | entrar en una carpeta | `cd primera-sesion` |
| `pwd` | imprimir la carpeta donde estás | `pwd` |
| `cat archivo` | imprimir el contenido de un archivo | `cat saludo.py` |
| `.py` | extensión de un archivo de Python | `saludo.py` |
| `.md` | extensión de un archivo de texto con formato ligero (Markdown) | `README.md` |

La **tubería** se escribe con el carácter `|` y conecta dos comandos: lo que el de la izquierda escribe en la
salida entra por la entrada estándar del de la derecha, sin que nadie teclee nada. `echo Ana | python3.14
entrada.py` significa «escribe `Ana` y pásaselo a `entrada.py` como si lo hubiera escrito yo». Se usa en las
capturas de este capítulo para que el resultado no dependa de que alguien teclee en el momento exacto.

Un **`README.md`** es solo un archivo de texto con esas tres letras en mayúscula: se abre en cualquier editor
y sirve para dejar apuntado lo que hiciste. No es un programa y no se ejecuta; lo escribes tú. Para crear
cualquier archivo en VS Code: **File → New File** (Archivo → Nuevo archivo), escribe el nombre completo con
su extensión (`saludo.py`, `README.md`) y guarda con **File → Save**.


### Instala y comprueba

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por instala y comprueba con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender instala y comprueba te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en instala y comprueba como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    E0["Fundamentos<br/>módulos 0–3"]
    E1["Aplicación<br/>módulos 4–5 y 12"]
    E2["Integración<br/>módulos 6–8 y 13–14"]
    E3["Experto<br/>módulos 9–11"]
    E0 --> E1
    E1 --> E2
    E2 --> E3
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Instala y comprueba se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Instala y comprueba | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses instala y comprueba por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: instala y comprueba funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Instala y comprueba existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve instala y comprueba en tu contexto?
2. ¿Cómo sabrías que instala y comprueba no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar instala y comprueba?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    E0["Fundamentos<br/>módulos 0–3"]
    E1["Aplicación<br/>módulos 4–5 y 12"]
    E2["Integración<br/>módulos 6–8 y 13–14"]
    E3["Experto<br/>módulos 9–11"]
    E0 --> E1
    E1 --> E2
    E2 --> E3
```

</details>

### Tema 1: Computador, sistema operativo, programa y proceso · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás distinguir CPU, memoria, almacenamiento, periféricos, sistema operativo, programa, intérprete y proceso; además observarás desde un archivo real qué sistema ejecuta Python y qué identificador recibe cada ejecución. Prerrequisitos: ninguno de programación; sólo…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás distinguir CPU, memoria, almacenamiento, periféricos, sistema operativo, programa, intérprete y proceso; además observarás desde un archivo real qué sistema ejecuta Python y qué identificador recibe cada ejecución.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en computador, sistema operativo, programa y proceso como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A["entorno.py<br/>almacenamiento"] --> B["Intérprete Python"]
    SO["Sistema operativo"] -->|crea y administra| P["Proceso Python<br/>PID + memoria"]
    B --> P
    P --> CPU["CPU<br/>ejecuta instrucciones"]
    P <--> RAM["RAM<br/>datos activos"]
    P --> IO["Terminal / archivos<br/>entrada y salida"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Computador, sistema operativo, programa y proceso se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Computador, sistema operativo, programa y proceso | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses computador, sistema operativo, programa y proceso por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: computador, sistema operativo, programa y proceso funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Computador, sistema operativo, programa y proceso existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve computador, sistema operativo, programa y proceso en tu contexto?
2. ¿Cómo sabrías que computador, sistema operativo, programa y proceso no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar computador, sistema operativo, programa y proceso?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    A["entorno.py<br/>almacenamiento"] --> B["Intérprete Python"]
    SO["Sistema operativo"] -->|crea y administra| P["Proceso Python<br/>PID + memoria"]
    B --> P
    P --> CPU["CPU<br/>ejecuta instrucciones"]
    P <--> RAM["RAM<br/>datos activos"]
    P --> IO["Terminal / archivos<br/>entrada y salida"]
```

```python
import os
import platform
import sys

mensaje_temporal = "Este valor existe mientras vive el proceso"

print(f"sistema={platform.system()}")
print(f"arquitectura={platform.machine()}")
print(f"python={sys.executable}")
print(f"pid={os.getpid()}")
print(f"cpu_logicas={os.cpu_count()}")
print(f"memoria_proceso={mensaje_temporal}")
```

```bash
python3.14 entorno.py
python3.14 entorno.py
```

```text
$ python3.14 --version
Python 3.14.10
$ python3.14 entorno.py
sistema=Darwin
arquitectura=arm64
python=/opt/homebrew/opt/python@3.14/bin/python3.14
pid=60920
cpu_logicas=10
memoria_proceso=Este valor existe mientras vive el proceso
$ python3.14 entorno.py
sistema=Darwin
arquitectura=arm64
python=/opt/homebrew/opt/python@3.14/bin/python3.14
pid=60923
cpu_logicas=10
memoria_proceso=Este valor existe mientras vive el proceso
$ python3.14 roto.py; echo "codigo_de_salida=$?"
sistema=Darwin
arquitectura=arm64
python=/opt/homebrew/opt/python@3.14/bin/python3.14
codigo_de_salida=1
Traceback (most recent call last):
  File "/private/tmp/f0m0/t1/fundamentos-entorno/roto.py", line 10, in <module>
    print(f"pid={os.getpid(1)}")
                 ~~~~~~~~~^^^
TypeError: posix.getpid() takes no arguments (1 given)
```

```text
python_version=3.14.10
version_info=sys.version_info(major=3, minor=14, micro=10, releaselevel='final', serial=0)
arquitectura_plataforma=('64bit', 'Mach-O')
```

</details>

### Tema 2: Del archivo fuente al programa en ejecución · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás guardar saludo.py, ejecutarlo dos veces, cambiar su contenido y explicar qué diferencia hay entre el archivo y su ejecución. Prerrequisitos: Python responde con su versión y tienes abierta una carpeta vacía en VS Code. Si entraste directamente, sigue la prepar…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás guardar saludo.py, ejecutarlo dos veces, cambiar su contenido y explicar qué diferencia hay entre el archivo y su ejecución.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en del archivo fuente al programa en ejecución como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A["Escribes en el editor"] -->|"File → Save"| B["saludo.py<br/>en el almacenamiento"]
    B -->|"python3.14 saludo.py"| C["Intérprete Python<br/>un proceso nuevo"]
    C --> D["Hola, mundo<br/>en la terminal"]
    A -.->|"si no guardas"| E["El disco conserva<br/>la versión anterior"]
    E --> C
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Del archivo fuente al programa en ejecución se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Del archivo fuente al programa en ejecución | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses del archivo fuente al programa en ejecución por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: del archivo fuente al programa en ejecución funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Del archivo fuente al programa en ejecución existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve del archivo fuente al programa en ejecución en tu contexto?
2. ¿Cómo sabrías que del archivo fuente al programa en ejecución no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar del archivo fuente al programa en ejecución?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    A["Escribes en el editor"] -->|"File → Save"| B["saludo.py<br/>en el almacenamiento"]
    B -->|"python3.14 saludo.py"| C["Intérprete Python<br/>un proceso nuevo"]
    C --> D["Hola, mundo<br/>en la terminal"]
    A -.->|"si no guardas"| E["El disco conserva<br/>la versión anterior"]
    E --> C
```

```python
# Muestra un mensaje en la terminal.
print("Hola, mundo")
```

```bash
python3.14 saludo.py
python3.14 saludo.py
```

```text
$ python3.14 saludo.py
Hola, mundo
$ python3.14 saludo.py
Hola, mundo
$ python3.14 saludo-inexistente.py; echo "codigo_de_salida=$?"
codigo_de_salida=2
/opt/homebrew/Cellar/python@3.14/3.14.10/Frameworks/Python.framework/Versions/3.14/Resources/Pyt
hon.app/Contents/MacOS/Python: can't open file '/private/tmp/f0m0/t2/primera-sesion/saludo-inexi
stente.py': [Errno 2] No such file or directory
$ cp saludo2.py saludo.py && python3.14 saludo.py
Mi primera práctica funciona
$ python3.14 presentacion.py
Ana Torres
Estoy aprendiendo a ejecutar programas
```

```python
# Muestra un mensaje en la terminal.
print("Mi primera práctica funciona")
```

```bash
cp saludo2.py saludo.py && python3.14 saludo.py
python3.14 saludo.py
```

</details>

### Tema 3: Archivos, carpetas y rutas sin perderse · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás ejecutar el mismo archivo desde dos carpetas usando la ruta adecuada y diagnosticar un archivo no encontrado. Prerrequisitos: distinguir editor y terminal; disponer del comando de Python comprobado al inicio. El ejemplo es independiente y puede hacerse desde c…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás ejecutar el mismo archivo desde dos carpetas usando la ruta adecuada y diagnosticar un archivo no encontrado.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en archivos, carpetas y rutas sin perderse como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    R["/  raíz"] --> D["private/tmp/f0m0/t3<br/>carpeta de trabajo (lo que dice pwd)"]
    D --> E["ejemplo-rutas/"]
    E --> U["ubicacion.py"]
    D -.->|"python3.14 ubicacion.py<br/>desde aquí: falla, Errno 2"| U
    D -->|"python3.14 ejemplo-rutas/ubicacion.py<br/>ruta relativa: funciona"| U
    R -->|"python3.14 /private/tmp/f0m0/t3/ejemplo-rutas/ubicacion.py<br/>ruta absoluta: funciona desde cualquier sitio"| U
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Archivos, carpetas y rutas sin perderse se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Archivos, carpetas y rutas sin perderse | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses archivos, carpetas y rutas sin perderse por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: archivos, carpetas y rutas sin perderse funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Archivos, carpetas y rutas sin perderse existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve archivos, carpetas y rutas sin perderse en tu contexto?
2. ¿Cómo sabrías que archivos, carpetas y rutas sin perderse no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar archivos, carpetas y rutas sin perderse?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    R["/  raíz"] --> D["private/tmp/f0m0/t3<br/>carpeta de trabajo (lo que dice pwd)"]
    D --> E["ejemplo-rutas/"]
    E --> U["ubicacion.py"]
    D -.->|"python3.14 ubicacion.py<br/>desde aquí: falla, Errno 2"| U
    D -->|"python3.14 ejemplo-rutas/ubicacion.py<br/>ruta relativa: funciona"| U
    R -->|"python3.14 /private/tmp/f0m0/t3/ejemplo-rutas/ubicacion.py<br/>ruta absoluta: funciona desde cualquier sitio"| U
```

```bash
mkdir ejemplo-rutas
cd ejemplo-rutas
pwd
```

```python
# Este mensaje permite comprobar qué archivo ejecutamos.
print("Encontraste ubicacion.py")
```

```bash
pwd
python3.14 ubicacion.py
cd .. && python3.14 ubicacion.py; echo "codigo_de_salida=$?"; cd ejemplo-rutas
cd .. && python3.14 ejemplo-rutas/ubicacion.py; cd ejemplo-rutas
```

```text
$ pwd
/private/tmp/f0m0/t3/ejemplo-rutas
$ python3.14 ubicacion.py
Encontraste ubicacion.py
$ cd .. && python3.14 ubicacion.py; echo "codigo_de_salida=$?"; cd ejemplo-rutas
codigo_de_salida=2
/opt/homebrew/Cellar/python@3.14/3.14.10/Frameworks/Python.framework/Versions/3.14/Resources/Pyt
hon.app/Contents/MacOS/Python: can't open file '/private/tmp/f0m0/t3/ubicacion.py': [Errno 2] No
 such file or directory
$ cd .. && python3.14 ejemplo-rutas/ubicacion.py; cd ejemplo-rutas
Encontraste ubicacion.py
```

```bash
python3.14 ./ubicacion.py
python3.14 ../ejemplo-rutas/ubicacion.py
```

</details>

### Tema 4: Cómo leer un comando antes de ejecutarlo · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás identificar qué programa ejecuta un comando y qué archivo recibe. Prerrequisitos: comprobar Python y localizar la carpeta de trabajo (Temas 1 y 3). Trabajarás en un ejemplo independiente desde una carpeta vacía, sin necesitar archivos de los temas anteriores.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás identificar qué programa ejecuta un comando y qué archivo recibe.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en cómo leer un comando antes de ejecutarlo como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    C["python3.14 mensaje.py"] --> P["Programa: `python3.14`<br/>qué intérprete arranca"]
    C --> A["Argumento: `mensaje.py`<br/>qué archivo se ejecuta"]
    V["python3.14 --version"] --> P2["Programa: `python3.14`"]
    V --> O["Opción: `--version`<br/>consulta, no abre ningún archivo"]
    O -.->|"una sola barra: -version"| X["Python lee letras sueltas<br/>y rechaza la primera que no conoce"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Cómo leer un comando antes de ejecutarlo se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Cómo leer un comando antes de ejecutarlo | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses cómo leer un comando antes de ejecutarlo por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: cómo leer un comando antes de ejecutarlo funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Cómo leer un comando antes de ejecutarlo existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve cómo leer un comando antes de ejecutarlo en tu contexto?
2. ¿Cómo sabrías que cómo leer un comando antes de ejecutarlo no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar cómo leer un comando antes de ejecutarlo?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    C["python3.14 mensaje.py"] --> P["Programa: `python3.14`<br/>qué intérprete arranca"]
    C --> A["Argumento: `mensaje.py`<br/>qué archivo se ejecuta"]
    V["python3.14 --version"] --> P2["Programa: `python3.14`"]
    V --> O["Opción: `--version`<br/>consulta, no abre ningún archivo"]
    O -.->|"una sola barra: -version"| X["Python lee letras sueltas<br/>y rechaza la primera que no conoce"]
```

```bash
mkdir ejemplo-comandos
cd ejemplo-comandos
```

```python
# El argumento del comando seleccionará este archivo.
print("Ejecutaste mensaje.py")
```

```python
# Segundo archivo: cambia solo el nombre del argumento.
print("Elegiste otro archivo")
```

```bash
python3.14 --version
python3.14 mensaje.py
python3.14 --opcion-inexistente; echo "codigo_de_salida=$?"
python3.14 segundo.py
```

```text
$ python3.14 --version
Python 3.14.10
$ python3.14 mensaje.py
Ejecutaste mensaje.py
$ python3.14 --opcion-inexistente; echo "codigo_de_salida=$?"
codigo_de_salida=2
Unknown option: --opcion-inexistente
usage: /opt/homebrew/Cellar/python@3.14/3.14.10/Frameworks/Python.framework/Versions/3.14/Resour
ces/Python.app/Contents/MacOS/Python [option] ... [-c cmd | -m mod | file | -] [arg] ...
Try `python -h' for more information.
$ python3.14 segundo.py
Elegiste otro archivo
```

</details>

### Tema 5: Primer programa, primer error y primera evidencia · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás pedir un nombre, mostrar un saludo y localizar un error de sintaxis usando el archivo y la línea informados por Python. Prerrequisitos: guardar un .py, ejecutarlo y encontrar la carpeta de trabajo (Temas 2 y 3). No se necesita ningún archivo de los temas anter…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás pedir un nombre, mostrar un saludo y localizar un error de sintaxis usando el archivo y la línea informados por Python.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en primer programa, primer error y primera evidencia como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    T["Terminal<br/>escribes Ana y pulsas Enter"] --> I["entrada.py<br/>`input(\"¿Cómo te llamas? \")`"]
    I --> V["variable `nombre`<br/>valor durante esta ejecución"]
    V --> F["cadena `f`<br/>sustituye `{nombre}`"]
    F --> S["`print`<br/>Hola, Ana en la terminal"]
    X["texto sin comilla de cierre"] -.->|"Python lo detecta antes de ejecutar"| E["SyntaxError<br/>archivo y línea señalados"]
    E -.->|"corriges, guardas, vuelves a ejecutar"| I
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Primer programa, primer error y primera evidencia se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Primer programa, primer error y primera evidencia | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses primer programa, primer error y primera evidencia por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: primer programa, primer error y primera evidencia funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Primer programa, primer error y primera evidencia existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve primer programa, primer error y primera evidencia en tu contexto?
2. ¿Cómo sabrías que primer programa, primer error y primera evidencia no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar primer programa, primer error y primera evidencia?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    T["Terminal<br/>escribes Ana y pulsas Enter"] --> I["entrada.py<br/>`input(\"¿Cómo te llamas? \")`"]
    I --> V["variable `nombre`<br/>valor durante esta ejecución"]
    V --> F["cadena `f`<br/>sustituye `{nombre}`"]
    F --> S["`print`<br/>Hola, Ana en la terminal"]
    X["texto sin comilla de cierre"] -.->|"Python lo detecta antes de ejecutar"| E["SyntaxError<br/>archivo y línea señalados"]
    E -.->|"corriges, guardas, vuelves a ejecutar"| I
```

```bash
mkdir ejemplo-entrada
cd ejemplo-entrada
```

```python
# Recibe texto y lo asocia al nombre de variable.
nombre = input("¿Cómo te llamas? ")
# Inserta ese texto en el saludo.
print(f"Hola, {nombre}")
```

```bash
python3.14 entrada.py
```

```text
$ echo Ana | python3.14 entrada.py
¿Cómo te llamas? Hola, Ana
$ printf 'Bogotá\n' | python3.14 destino.py
¿A dónde enviamos? Destino registrado: Bogotá
$ echo Cali | python3.14 destino.py
¿A dónde enviamos? Destino registrado: Cali
$ python3.14 roto.py; echo "codigo_de_salida=$?"
codigo_de_salida=1
  File "/private/tmp/f0m0/t5/ejemplo-entrada/roto.py", line 4
    print(f"Hola, {nombre}
          ^
SyntaxError: unterminated f-string literal (detected at line 4)
```

```python
# Pide un destino.
ciudad = input("¿A dónde enviamos? ")
print(f"Destino registrado: {ciudad}")
```

</details>

### Tema 6: VS Code, comandos y atajos comprobables · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás nombrar la acción que realiza un comando de VS Code, buscar en tu instalación el atajo que esa acción tiene realmente, y explicar por qué la terminal ejecutó el contenido del disco y no lo que tú ves en el editor. Prerrequisitos: Tema 2 (escribir y guardar sal…

#### ► LA IDEA EN UNA FRASE
****Comando:** la acción. Tiene un nombre visible (**Save**, **Go to File**) y un identificador**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en vs code, comandos y atajos comprobables como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    B["Búfer del editor<br/>lo que ves en pantalla"]
    D["Disco<br/>saludo.py"]
    P["Proceso<br/>python3.14 saludo.py"]
    K["Pulsación<br/>Cmd+S, Ctrl+S o acorde"]
    R["Reglas de VS Code<br/>se leen de abajo hacia arriba"]
    B -->|"Save, o Auto Save a los 1000 ms"| D
    D -->|"el intérprete lee el archivo"| P
    K -->|"busca la primera regla que coincide"| R
    R -->|"ejecuta el comando sobre el editor"| B
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| VS Code, comandos y atajos comprobables se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar VS Code, comandos y atajos comprobables | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses vs code, comandos y atajos comprobables por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: vs code, comandos y atajos comprobables funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- VS Code, comandos y atajos comprobables existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve vs code, comandos y atajos comprobables en tu contexto?
2. ¿Cómo sabrías que vs code, comandos y atajos comprobables no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar vs code, comandos y atajos comprobables?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```json
{ "key": "ctrl+shift+k", "command": "editor.action.deleteLines", "when": "editorTextFocus" }
```

```mermaid
flowchart LR
    B["Búfer del editor<br/>lo que ves en pantalla"]
    D["Disco<br/>saludo.py"]
    P["Proceso<br/>python3.14 saludo.py"]
    K["Pulsación<br/>Cmd+S, Ctrl+S o acorde"]
    R["Reglas de VS Code<br/>se leen de abajo hacia arriba"]
    B -->|"Save, o Auto Save a los 1000 ms"| D
    D -->|"el intérprete lee el archivo"| P
    K -->|"busca la primera regla que coincide"| R
    R -->|"ejecuta el comando sobre el editor"| B
```

```bash
mkdir practica-editor
cd practica-editor
```

```python
# La salida identifica la versión realmente guardada del archivo.
print("Archivo guardado: versión 1")
```

```python
# La salida identifica la versión realmente guardada del archivo.
print("Archivo guardado: versión 2")
```

```bash
python3.14 --version
python3.14 saludo.py
cp sin-guardar.py saludo.py && python3.14 saludo.py
```

</details>
