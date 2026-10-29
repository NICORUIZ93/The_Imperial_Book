# Módulo 0: Cómo funciona tu entorno de desarrollo

## Antes de comenzar: prepara tu primera sesión

Hoy vas a crear un archivo, ejecutar un programa y corregir un error. Puedes trabajar por temas y volver después: el objetivo es poder repetir el procedimiento y explicar lo que observaste.

Una **carpeta** reúne archivos. Un **archivo** guarda contenido con un nombre, como `saludo.py`. El **editor** permite escribir ese contenido; la **terminal** permite pedirle acciones al computador escribiendo comandos. No pegues comandos en el archivo Python ni código Python directamente en la terminal.

### Instala y comprueba

1. Instala [Visual Studio Code](https://code.visualstudio.com/) y [Python 3](https://www.python.org/downloads/) desde sus sitios oficiales. En Windows, sigue las indicaciones del instalador para habilitar los comandos de Python. Git se usará más adelante; no hace falta para esta práctica.
2. Abre VS Code. Elige **File → Open Folder** (Archivo → Abrir carpeta), crea una carpeta llamada `primera-sesion` dentro de Documentos y ábrela. Si VS Code pregunta por la confianza, confirma solo si es la carpeta que acabas de crear.
3. Abre **Terminal → New Terminal** (Terminal → Nueva terminal). El panel inferior es donde escribirás los comandos. Pulsa Enter después de cada uno.
4. Comprueba Python con el comando de tu sistema:

| Sistema | Comando de comprobación | Comando para ejecutar un archivo |
|---|---|---|
| Windows / PowerShell | `py --version` | `py saludo.py` |
| macOS / Terminal | `python3 --version` | `python3 saludo.py` |
| Linux / terminal | `python3 --version` | `python3 saludo.py` |

**Resultado esperado:** una línea que empieza por `Python 3.`. Los ejemplos usan funciones básicas de Python 3 y no necesitan instalar paquetes. En Ubuntu/Debian, si Python falta, puedes instalarlo con `sudo apt update` y después `sudo apt install python3`; son comandos del sistema y pueden pedir la contraseña de administrador.

Si aparece «comando no encontrado» o «no se reconoce», cierra y vuelve a abrir la terminal después de instalar. En Windows prueba `python --version` si `py` no está disponible; si funciona, usa `python` en lugar de `py` durante el capítulo. Si aparece `>>>`, abriste Python en modo interactivo: escribe `exit()` y pulsa Enter para volver a la terminal. No avances hasta ver la versión.

**Al terminar conservarás:** `saludo.py`, `presentacion.py` y un `README.md` con tus comandos, resultados y diagnóstico. Serán el primer registro de trabajo de tu futuro gestor de tareas por terminal. No necesitas construir ese gestor todavía.

## Aprende construyendo

### Tema 1: Del hardware al programa en ejecución

#### Paso 1 · Objetivo y preparación

Al finalizar podrás guardar `saludo.py`, ejecutarlo dos veces y explicar qué diferencia hay entre el archivo y su ejecución. **Prerrequisitos:** Python responde con su versión y tienes abierta una carpeta vacía en VS Code. Si entraste directamente, sigue la preparación anterior.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Poder ejecutar un cambio pequeño te permite comprobar que estás trabajando sobre el archivo correcto.

El primer paso de cualquier herramienta, incluido nuestro proyecto integrador de gestor de tareas, es conseguir que el computador ejecute una instrucción que escribiste. Vamos a mostrar un mensaje; después añadiremos entrada de datos. Cada cambio tendrá un resultado visible.

#### Paso 3 · Teoría, modelo mental y analogía

Un **programa** es un conjunto de instrucciones. Aquí lo guardarás en un archivo de texto terminado en `.py`. Python es el **intérprete**: lee esas instrucciones y las ejecuta. `print` es una función de Python que muestra un valor en la terminal.

**Analogía:** el archivo se parece a una receta y ejecutarlo se parece a cocinarla. Puedes conservar la receta y usarla varias veces. El límite de la analogía es que Python necesita instrucciones con una sintaxis precisa: una persona puede entender una receta mal escrita; el intérprete puede rechazarla.

El sistema operativo coordina la ejecución. La CPU realiza operaciones, la RAM mantiene datos del trabajo activo y el almacenamiento conserva el archivo guardado. Llamamos **proceso** al programa mientras se ejecuta. Por ahora basta con distinguir el archivo que queda guardado de la ejecución que empieza y termina; estudiarás memoria y persistencia más adelante.

#### Paso 4 · Demostración guiada desde cero

Si todavía no tienes carpeta de trabajo, puedes crearla desde la terminal con `mkdir primera-sesion` y entrar con `cd primera-sesion`; abre esa carpeta en VS Code. Si ya la creaste en la preparación, no la crees de nuevo.

En la carpeta vacía `primera-sesion`, pulsa **New File** (Nuevo archivo) en el explorador de VS Code. Crea `saludo.py` con este contenido completo y guárdalo con **File → Save**:

```python
# Muestra un mensaje en la terminal.
print("Hola, mundo")
```

Explicación de cada línea: la primera empieza por `#` y es un comentario para quien lee; no produce una salida. La segunda llama a `print`. Los paréntesis contienen lo que se mostrará y las comillas delimitan el texto. Las comillas no forman parte del mensaje final.

En la terminal de VS Code, situada en `primera-sesion`, ejecuta **solo el comando de tu sistema**:

```bash
python3 saludo.py
```

En Windows / PowerShell:

```bash
py saludo.py
```

**Salida esperada:**

```text
Hola, mundo
```

El comando termina y vuelve a aparecer el indicador de la terminal. Ejecuta otra vez: aparece una nueva línea con el mismo mensaje. No se crea otro archivo; se vuelve a ejecutar el que ya guardaste.

#### Paso 5 · Práctica guiada

Antes de tocar el código, predice qué aparecerá si cambias `Hola, mundo` por `Mi primera práctica funciona`. **Pista:** cambia solo el contenido entre comillas; guarda y repite el mismo comando. Debe aparecer el mensaje nuevo.

**Fallo deliberado:** ejecuta `python3 saludo-inexistente.py` (`py saludo-inexistente.py` en Windows). El error indica que no puede abrir ese archivo. Comprueba el nombre en el explorador: existe `saludo.py`, no el nombre pedido. Corrige el argumento del comando y ejecútalo otra vez. No reinstales Python: ya arrancó y te informó del archivo que falta.

#### Paso 6 · Práctica independiente

Crea `presentacion.py` en la misma carpeta, sin copiar el archivo completo anterior. Debe mostrar dos líneas: tu nombre y `Estoy aprendiendo a ejecutar programas`. Usa dos llamadas a `print`; ejecuta `python3 presentacion.py` o `py presentacion.py`. **Resultado esperado:** las dos líneas aparecen en ese orden. Cambiar este archivo no debe cambiar la salida de `saludo.py`.

#### Paso 7 · Cierre y evidencia

Crea `README.md` en `primera-sesion`. Registra el sistema operativo, el comando que funcionó, la salida de ambos programas y el error de nombre con su corrección. **Evidencia de aprendizaje:** explica por qué guardar el archivo no muestra el mensaje hasta ejecutarlo y demuestra que puedes volver a ejecutarlo tras cerrar y abrir la terminal.

**Errores comunes:** guardar como `saludo.py.txt` (comprueba el nombre completo), ejecutar sin guardar (usa File → Save) o pegar el comando dentro del archivo (el comando va en la terminal). **Límites y decisión de uso:** `print` sirve para observar un valor; mostrarlo no lo guarda en un archivo de datos. En el siguiente tema localizarás tus archivos sin depender de que el editor haya abierto la carpeta correcta.

**Fuentes oficiales:** [Ejecución con el intérprete Python](https://docs.python.org/3/tutorial/interpreter.html) y [ejecutar Python en VS Code](https://code.visualstudio.com/docs/python/run).

### Tema 2: Archivos, carpetas y rutas sin perderse

#### Paso 1 · Objetivo y preparación

Al finalizar podrás ejecutar el mismo archivo desde dos carpetas usando la ruta adecuada y diagnosticar un archivo no encontrado. **Prerrequisitos:** distinguir editor y terminal; disponer del comando de Python comprobado al inicio. El ejemplo es independiente y puede hacerse desde cero.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Comprobar tu ubicación evita confundir una ruta equivocada con un archivo perdido.

Una herramienta necesita encontrar sus archivos. Un comando puede estar bien escrito y fallar porque la terminal está en otra carpeta. Vamos a cambiar de lugar de forma controlada para observar ese caso real antes de trabajar con datos del gestor de tareas.

#### Paso 3 · Teoría, modelo mental y analogía

La **carpeta de trabajo** es el lugar desde el que la terminal interpreta una ruta. Una **ruta relativa**, como `ejemplo-rutas/ubicacion.py`, describe cómo llegar desde ese lugar. Una **ruta absoluta** incluye el recorrido completo desde la raíz; en Windows normalmente incluye una unidad, como `C:\Users\Ana\Documents\primera-sesion`.

**Analogía:** una dirección completa se parece a una ruta absoluta; «entra en la siguiente puerta» se parece a una relativa. La analogía deja de servir si ignoras la sintaxis: debes respetar nombres, separadores y comillas cuando hay espacios. `cd` cambia de carpeta; `..` significa la carpeta superior.

#### Paso 4 · Demostración guiada desde cero

Abre una carpeta vacía en VS Code. En su terminal ejecuta estos comandos, uno por uno; funcionan en PowerShell y en la terminal de macOS/Linux:

```bash
mkdir ejemplo-rutas
cd ejemplo-rutas
pwd
```

`mkdir` crea la carpeta; `cd` entra en ella; `pwd` muestra dónde estás. En el explorador, crea `ejemplo-rutas/ubicacion.py` con este contenido completo:

```python
# Este mensaje permite comprobar qué archivo ejecutamos.
print("Encontraste ubicacion.py")
```

Explica cada línea: el comentario identifica el propósito; `print` muestra el mensaje. Guarda y ejecuta desde `ejemplo-rutas`:

```bash
python3 ubicacion.py
```

En Windows usa `py ubicacion.py`. **Resultado esperado:** `Encontraste ubicacion.py`. Ahora ejecuta `cd ..` y repite el mismo comando. **Fallo deliberado:** Python informa que no encuentra el archivo porque ahora buscas en la carpeta superior. Comprueba la ubicación con `pwd` y confirma en el explorador que el archivo sigue dentro de `ejemplo-rutas`.

#### Paso 5 · Práctica guiada

Sin cambiar de carpeta otra vez, ejecuta `python3 ejemplo-rutas/ubicacion.py` o `py ejemplo-rutas/ubicacion.py`. **Pista:** el primer tramo de la ruta indica la carpeta por la que debes pasar. La salida debe ser idéntica a la anterior; cambia el camino, no el contenido del archivo.

#### Paso 6 · Práctica independiente

Desde esa carpeta superior, ejecuta el archivo usando una ruta absoluta. En VS Code, haz clic derecho en `ubicacion.py` y elige **Copy Path** (Copiar ruta); úsala como argumento entre comillas después de `python3` o `py`. **Resultado esperado:** el mismo mensaje. Guarda ambos comandos en `README.md` y explica cuál depende de la carpeta actual.

#### Paso 7 · Cierre y evidencia

**Evidencia de aprendizaje:** registra la salida de `pwd` antes y después de `cd ..`, el error y las dos ejecuciones correctas. En el proyecto integrador revisarás primero la carpeta y la ruta cuando falte un archivo. **Errores comunes:** omitir un tramo de la ruta o no entrecomillar una ruta con espacios. **Límites y decisión de uso:** una ruta absoluta de tu equipo no es portable a otro computador; una relativa requiere conocer su punto de partida. El siguiente tema te ayudará a separar el programa, sus opciones y sus argumentos.

**Fuentes oficiales:** [Python: línea de comandos](https://docs.python.org/3/using/cmdline.html) y [terminal integrada de VS Code](https://code.visualstudio.com/docs/terminal/basics).

### Tema 3: Cómo leer un comando antes de ejecutarlo

#### Paso 1 · Objetivo y preparación

Al finalizar podrás identificar qué programa ejecuta un comando y qué archivo recibe. **Prerrequisitos:** comprobar Python y localizar la carpeta de trabajo. Trabajarás en un ejemplo independiente desde una carpeta vacía, sin necesitar archivos de los temas anteriores.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Distinguir las partes de un comando permite cambiar una sola cosa y diagnosticar su efecto.

En el futuro gestor de tareas usarás comandos para ejecutar programas y herramientas. Copiarlos sin distinguir sus partes dificulta saber qué corregir. Vamos a comparar una opción que consulta información con un argumento que selecciona un archivo.

#### Paso 3 · Teoría, modelo mental y analogía

En `python3 --version`, `python3` elige el programa y `--version` es una **opción** que pide su versión. En `python3 mensaje.py`, `mensaje.py` es un **argumento** que indica qué archivo ejecutar. Las opciones no son universales: cada herramienta define las suyas.

**Analogía:** el programa es la persona a quien haces un pedido; los argumentos son los detalles. El límite es que una terminal no interpreta una intención ambigua: un carácter distinto puede cambiar el pedido. No copies el indicador `$` ni las marcas de formato de una guía; escribe solo el comando.

#### Paso 4 · Demostración guiada desde cero

En una carpeta vacía abierta en VS Code, usa la terminal:

```bash
mkdir ejemplo-comandos
cd ejemplo-comandos
python3 --version
```

En Windows reemplaza la última línea por `py --version`. Crea `ejemplo-comandos/mensaje.py` y guarda:

```python
# El argumento del comando seleccionará este archivo.
print("Ejecutaste mensaje.py")
```

Explicación de cada línea: el comentario documenta la selección del archivo; `print` escribe el mensaje. Ejecuta:

```bash
python3 mensaje.py
```

En Windows: `py mensaje.py`. **Resultado esperado:** la primera consulta mostró la versión; la segunda ejecución muestra `Ejecutaste mensaje.py`. El archivo no se ejecuta cuando solo consultas la versión.

#### Paso 5 · Práctica guiada

**Fallo deliberado:** ejecuta `python3 --opcion-inexistente` o `py --opcion-inexistente`. Observa el error de opción desconocida; el texto exacto puede variar según el lanzador. **Pista:** el problema está en el pedido, no en `mensaje.py`. Consulta `python3 --help` o `py --help`, busca `--version` y repite la consulta válida.

#### Paso 6 · Práctica independiente

Crea `segundo.py` en `ejemplo-comandos` con una instrucción que muestre `Elegiste otro archivo`. Antes de ejecutar predice qué parte de `python3 mensaje.py` debes sustituir. **Resultado esperado:** el nuevo mensaje aparece al ejecutar `python3 segundo.py` o `py segundo.py`; la versión del intérprete no cambia.

#### Paso 7 · Cierre y evidencia

**Evidencia de aprendizaje:** en `README.md`, separa programa y argumento en los dos comandos, y registra el error de opción con su corrección. Esto te prepara para leer las instrucciones del proyecto integrador sin ejecutarlas a ciegas. **Errores comunes:** confundir una opción con el nombre de archivo, pegar varias líneas como un solo comando o asumir que todas las herramientas comparten opciones. **Límites y decisión de uso:** antes de usar comandos que modifican archivos, consulta su ayuda y el directorio donde operan. El siguiente tema diagnosticará un error dentro del propio programa.

**Fuente oficial:** [Opciones del intérprete Python](https://docs.python.org/3/using/cmdline.html).

### Tema 4: Primer programa, primer error y primera evidencia

#### Paso 1 · Objetivo y preparación

Al finalizar podrás pedir un nombre, mostrar un saludo y localizar un error de sintaxis usando el archivo y la línea informados por Python. **Prerrequisitos:** guardar un `.py`, ejecutarlo y encontrar la carpeta de trabajo. El ejemplo independiente comienza desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Leer el error antes de cambiar código te permite corregir su causa y comprobar la recuperación.

El proyecto integrador de gestor de tareas necesitará recibir información, procesarla y mostrar un resultado. Antes de gestionar listas, vamos a recorrer ese ciclo con un nombre: una entrada pequeña que puedes comprobar sin herramientas adicionales.

#### Paso 3 · Teoría, modelo mental y analogía

`input` muestra una pregunta y espera texto hasta que pulses Enter. Una **variable** es un nombre asociado a un valor; aquí `nombre` permite reutilizar el texto recibido. Una cadena con prefijo `f` inserta el valor de una variable donde hay llaves. **Analogía:** una etiqueta permite encontrar lo que guardaste; el límite es que una variable pertenece a la ejecución y no guarda por sí sola un archivo para la próxima sesión.

El mecanismo será entrada → valor asociado a `nombre` → saludo en la salida. La terminal seguirá esperando mientras no respondas; eso es parte del programa, no un fallo.

#### Paso 4 · Demostración guiada desde cero

En una carpeta vacía abierta en VS Code, ejecuta:

```bash
mkdir ejemplo-entrada
cd ejemplo-entrada
```

Crea `ejemplo-entrada/entrada.py` con este contenido completo:

```python
# Recibe texto y lo asocia al nombre de variable.
nombre = input("¿Cómo te llamas? ")
# Inserta ese texto en el saludo.
print(f"Hola, {nombre}")
```

Explicación de cada línea ejecutable: primero `input` espera tu respuesta y `=` la asocia a `nombre`; después la cadena `f` sustituye `{nombre}` por esa respuesta y `print` muestra el resultado.

```bash
python3 entrada.py
```

En Windows: `py entrada.py`. **Salida esperada** al escribir `Ana` y pulsar Enter:

```text
¿Cómo te llamas? Ana
Hola, Ana
```

#### Paso 5 · Práctica guiada

**Fallo deliberado:** quita la comilla de cierre del saludo, guarda y ejecuta. Python informa de un `SyntaxError` y señala el archivo y una línea; según la versión puede mencionar una cadena sin terminar. **Pista:** revisa esa línea y compara las comillas de apertura y cierre. Repón la comilla, guarda y repite: vuelve a aparecer el saludo. No necesitas reinstalar ni borrar la carpeta.

#### Paso 6 · Práctica independiente

Crea `destino.py` en la misma carpeta. Pide una ciudad y muestra `Destino registrado: <ciudad>` con el texto recibido. Comprueba dos entradas, `Bogotá` y `Cali`. **Resultado esperado:** cada ejecución incluye su ciudad correspondiente; no debe mostrar siempre la primera. Esta será una primera entrada de datos para un caso de entregas de RutaFlow.

#### Paso 7 · Cierre y evidencia

**Evidencia de aprendizaje:** conserva ambos archivos y añade a `README.md` las dos entradas, sus salidas, el error deliberado y la corrección. Explica qué línea espera información y cuál muestra el resultado. **Errores comunes:** olvidar guardar, escribir `Nombre` cuando definiste `nombre` (son distintos), o dejar fuera la `f` y ver `{nombre}` literalmente. **Límites y decisión de uso:** `input` devuelve texto; aquí no convertimos números ni validamos datos. Eso llegará en el siguiente módulo, Pensamiento computacional y programación.

Para cerrar la sesión, vuelve a ejecutar uno de los archivos sin consultar la demostración. Guarda tu carpeta en un lugar que reconozcas. La marca de capítulo conserva tu recorrido en el navegador; no guarda tus programas ni acredita comprensión. Desde el catálogo puedes descargar una copia del progreso, que es distinta de una copia de tus archivos.

**Fuentes oficiales:** [Funciones `input` y `print`](https://docs.python.org/3/library/functions.html) y [formato de cadenas](https://docs.python.org/3/tutorial/inputoutput.html).


## Ampliación de la página 50 del PDF

### Tema complementario: VS Code, comandos y atajos comprobables

#### Paso 1 · Objetivo y preparación
Al finalizar podrás abrir, guardar y localizar archivos usando comandos identificados por nombre, sin depender de una tabla incorrecta. **Prerrequisitos:** VS Code instalado y el programa `saludo.py` del primer tema. La captura del PDF mezcla atajos de edición de texto con otros programas; los bindings varían según sistema, teclado y extensiones.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Un compañero necesita reproducir el proyecto integrador de Fundamentos. Si el README dice «Ctrl+E para copiar», el procedimiento falla. Documenta «Copiar» y el binding efectivo de tu equipo, no una combinación asumida. En macOS muchas acciones usan Command; Windows y Linux suelen usar Ctrl, con excepciones.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía:** el comando es una dirección y el atajo es una ruta rápida hacia ella. Puede cambiar la ruta sin cambiar la acción. VS Code resuelve contextos (`when`) y prioridades; extensiones o ajustes pueden cambiar qué recibe una tecla. Busca «Preferences: Open Keyboard Shortcuts» en la paleta y comprueba el nombre, binding y contexto.

#### Paso 4 · Demostración guiada desde cero
Crea `saludo.py` en una carpeta vacía, ábrelo desde File > Open Folder y guarda el archivo antes de ejecutar:

```python
# La salida identifica la versión realmente guardada del archivo.
print("Archivo guardado: versión 1")
```

```bash
mkdir -p practica-editor
python3 saludo.py
```

Ejecuta la segunda línea desde la carpeta donde guardaste `saludo.py`; crear la carpeta no cambia automáticamente la ubicación. **Salida esperada:** `Archivo guardado: versión 1`. Abre la paleta por View > Command Palette; busca «Go to File» y luego «Go to Line». En Windows/Linux los valores predeterminados habituales son Ctrl+P y Ctrl+G; consulta los de tu instalación en lugar de trasladarlos a macOS.

**Fallo deliberado:** cambia el texto a versión 2 y ejecuta sin guardar. Si Auto Save está desactivado sigue apareciendo versión 1; diagnostica el indicador de cambios del editor. Si Auto Save está activo, observa que guardar ocurre automáticamente y registra esa condición.

#### Paso 5 · Práctica guiada
**Pista:** abre Keyboard Shortcuts y busca «Copy», «Save» y «Toggle Integrated Terminal». Registra nombre y binding en `atajos.md`; no asumas que Ctrl+B significa negrita en un editor de código.

#### Paso 6 · Práctica independiente
Escribe tres instrucciones del proyecto integrador usando nombres de comando y añade tus bindings como ayuda local. **Límites:** la tabla de tu equipo no define una regla universal; revisa conflictos y contextos antes de cambiarla.

#### Paso 7 · Cierre y evidencia
Entrega `atajos.md`, salida de ambas versiones y explicación del fallo. **Errores comunes:** ejecutar sin guardar, confundir terminal y editor, copiar bindings de otra plataforma. Antes del siguiente tema responde: ¿qué acción realiza el comando?, ¿qué cambia al usar otro sistema?, ¿cómo compruebas un conflicto? **Fuente oficial:** [VS Code keybindings](https://code.visualstudio.com/docs/configure/keybindings).
