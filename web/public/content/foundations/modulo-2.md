# Módulo 2: Estructuras de datos, algoritmos y complejidad


## Aprende construyendo

### Tema 1: Elegir estructuras según las operaciones

#### Paso 1 · Objetivo y preparación
Al finalizar vas a comparar guardar las tareas de tu gestor en una `list` contra guardarlas en un `dict` indexado por id, para la operación "buscar la tarea con id X", y vas a reproducir un bug real de confundir la posición de una lista con la identidad de una tarea. **Prerrequisitos:** Python instalado; comprobá `python3 --version` (o `py --version` en Windows).

#### Paso 2 · Contexto y caso real
El gestor de tareas CLI (proyecto integrador Fundamentos) necesita, desde el primer módulo, responder rápido a "¿existe la tarea con id 42?". Si guardás las tareas en una `list` y buscás por posición, cada eliminación desplaza los índices de todas las tareas que estaban después; un índice que guardaste antes de esa eliminación ya no es confiable, aunque Python no te avise.

#### Paso 3 · Teoría, modelo mental y analogía
Una `list` en Python es una secuencia: accedés rápido por posición (`lista[0]`), pero buscar por valor exige recorrerla elemento por elemento en el peor caso — es O(n). Un `dict` guarda pares clave-valor en una tabla hash: calcula dónde vive cada clave y accede casi siempre en O(1), sin importar cuántos elementos tenga. La diferencia de fondo es qué identifica a una tarea: en el diccionario, la clave (el id) es la identidad lógica de la tarea y no cambia; en la lista, la posición es solo un lugar físico que se corre cada vez que insertás o eliminás algo antes. La analogía es un archivador con carpetas rotuladas —vas directo a la etiqueta que buscás— contra una fila de cajas sin rotular, donde tenés que revisar caja por caja.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía y crea `src/tareas_estructura.py`:
```bash
mkdir ejemplo-estructuras
cd ejemplo-estructuras
mkdir src
```
```python
tareas = [
    {"id": 1, "descripcion": "comprar leche", "estado": "pendiente"},
    {"id": 2, "descripcion": "pagar factura", "estado": "pendiente"},
    {"id": 3, "descripcion": "llamar al dentista", "estado": "hecho"},
]

def buscar_por_id_lista(tareas, id_buscado):
    for tarea in tareas:
        if tarea["id"] == id_buscado:
            return tarea
    return None

por_id = {tarea["id"]: tarea for tarea in tareas}

indice_guardado = 1  # "la tarea 2 está en la posición 1" — guardado para usar después
print(tareas[indice_guardado]["descripcion"])
```
```bash
python src/tareas_estructura.py
```
**Resultado esperado:** `pagar factura` — la tarea 2 vive en la posición 1, y tanto `buscar_por_id_lista(tareas, 2)` como `por_id[2]` devuelven lo mismo. **Fallo deliberado:** eliminá la tarea 1 con `del tareas[0]` (como si "comprar leche" se completara y se sacara de la lista) y volvé a ejecutar `print(tareas[indice_guardado]["descripcion"])` sin tocar `indice_guardado`. Ahora imprime `llamar al dentista`: el índice 1 sigue siendo válido pero ya no apunta a la tarea 2, porque la eliminación desplazó una posición a todo lo que estaba después — sin ningún error. `por_id[2]` sigue devolviendo la tarea correcta porque el diccionario no depende de la posición física. Corregí siempre buscando por `por_id[id]`, nunca guardando un índice de lista para usar después.

#### Paso 5 · Práctica guiada
Pista: después de cualquier `del tareas[i]`, cualquier índice que guardaste antes queda potencialmente inválido aunque no lance error — confirmalo guardando el índice de la última tarea antes y después de eliminar la primera, y compará qué tarea devuelve cada vez.

#### Paso 6 · Práctica independiente
Agregá 50 tareas más a la lista y al diccionario (ids del 4 al 53), medí con `time.perf_counter()` cuánto tarda `buscar_por_id_lista` comparado con `por_id[53]` para el peor caso (el último id), y repetí con 5000 tareas. Anotá cómo crece el tiempo de la lista mientras el del diccionario se mantiene estable.

#### Paso 7 · Cierre y evidencia
Guardá el código con `buscar_por_id_lista`, el diccionario `por_id` y la demostración del índice desactualizado tras `del tareas[0]`; como siguiente paso, en el Tema 2 vas a usar pilas y colas para las funciones "deshacer" y "procesar en orden" del mismo gestor de tareas. Errores comunes: guardar un índice de lista y asumir que sigue apuntando a la misma tarea después de cualquier eliminación; elegir diccionario sin medir si en tu caso realmente hay más búsquedas que inserciones. Fuentes oficiales: https://docs.python.org/es/3/tutorial/datastructures.html y https://docs.python.org/es/3/library/stdtypes.html#dict.
**¿Por qué es importante?** Porque un id guardado en el lugar equivocado —una posición en vez de una clave— produce errores que no lanzan excepción: la tarea que "aparece" es simplemente otra.
**Evidencia de aprendizaje:** entregá la búsqueda por lista y por diccionario, el código que reproduce el índice desactualizado después de `del tareas[0]`, y la corrección usando `por_id`.
**Conceptos clave:** lista, tupla, conjunto, diccionario, orden, duplicados, clave, acceso, inserción y mutabilidad.

Una estructura de datos organiza valores para facilitar ciertas operaciones. No existe una estructura universalmente mejor. Una lista conserva orden y permite duplicados; un conjunto representa pertenencia sin duplicados; un diccionario relaciona claves únicas con valores; una tupla expresa una agrupación fija que no se modifica.

```python
productos = [
    {"sku": "A-10", "nombre": "Teclado", "stock": 4},
    {"sku": "B-20", "nombre": "Mouse", "stock": 9},
]

por_sku = {producto["sku"]: producto for producto in productos}
categorias = {"periféricos", "oficina", "periféricos"}
```

`productos` sirve para recorrer y conservar un orden. `por_sku` permite expresar “dame el producto cuya clave es A-10” sin revisar conceptualmente todos. `categorias` elimina el duplicado porque la pregunta relevante es pertenencia, no posición.

Antes de elegir, escribe las operaciones dominantes: buscar por SKU, listar en orden, agregar, eliminar y comprobar categorías. La estructura se decide por esas operaciones y por restricciones como memoria u orden estable. Duplicar una vista derivada —lista y diccionario— puede mejorar lectura a cambio de sincronización y memoria; esa es una decisión, no magia gratuita.

**Ejemplo desde cero:** modela cinco contactos. Primero usa una lista y escribe una búsqueda por teléfono. Después crea un diccionario indexado por teléfono y compara claridad. No afirmes que uno “es más rápido” sin explicar tamaño, operación y coste de mantener el índice.

**Analogía:** una lista es una fila numerada, un conjunto es un control de invitados únicos y un diccionario es un archivador con una etiqueta única por carpeta. Cada organización acelera preguntas distintas.

**¿Por qué es importante?** Seleccionar una estructura adecuada suele producir mejoras mayores y código más claro que optimizar instrucciones individuales. Bases de datos e índices generalizan la misma idea.

**Casos de uso reales:** carrito ordenado, permisos únicos, caché por identificador, catálogo por SKU y registro de coordenadas inmutables.

**Diagrama:**

```mermaid
flowchart TD
    Q{"¿qué operación domina?"}
    Q -->|"orden o posición"| LIST["lista"]
    Q -->|"pertenencia única"| SET["conjunto"]
    Q -->|"búsqueda por clave"| MAP["diccionario"]
    Q -->|"grupo fijo"| TUPLE["tupla"]
```

#### Profundización · Diseño: Estructura óptima para "búsqueda frecuente, inserción rara"

**Escenario real:** El gestor de tareas mantiene 1000 tareas. Operación común: "¿existe tarea con ID 42?" (búsqueda). Inserción: una vez por día.

**Tu tarea (sin mirar solución):**

1. **Opciones:** Lista (array), diccionario (hash map), árbol ordenado. Compara búsqueda vs inserción.
2. **Costo:** Lista ordenada: búsqueda O(?), inserción O(?). Diccionario: O(?), O(?).
3. **Elige:** ¿Qué estructura para tu gestor?, ¿por qué?
4. **Trade-off:** Si cambias a "inserción frecuente", ¿cambias estructura?

**Escribe tu respuesta:**
```
Lista búsqueda: O(_), inserción: O(_)
Diccionario búsqueda: O(_), inserción: O(_)
Elegida para Fundamentos: _________ (¿por qué?)
Si inserción = 50/seg: cambiarías a _________
```

<details>
<summary>SOLUCIÓN — Lee solo después de intentar</summary>

> **Respuesta esperada:**
>
> **Lista:** Búsqueda O(n) / O(log n) si ordenada, inserción O(n).
>
> **Diccionario:** Búsqueda O(1), inserción O(1) promedio.
>
> **Fundamentos:** Diccionario `{id: tarea}` porque búsqueda es frecuente y O(1) es crítica.
>
> **Si 50 inserciones/seg:** Seguiría con diccionario (ambas O(1)). Solo si necesitas orden, usaría árbol.

</details>

### Tema 2: Pilas, colas y abstracciones de comportamiento

#### Paso 1 · Objetivo y preparación
Al finalizar vas a implementar un "deshacer" (undo) con una pila y un "procesar en el orden en que llegaron" con una cola, y vas a medir por qué usar una lista como cola (con `pop(0)`) es una trampa de rendimiento que no se nota hasta que la cola crece. **Prerrequisitos:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
El mismo gestor de tareas necesita dos comportamientos nuevos: un "deshacer" que revierta la última acción primero (crear tarea, luego marcarla hecha, luego deshacer debe revertir "marcarla hecha" antes que "crear tarea"), y un "procesar pendientes" que las atienda en el orden exacto en que se agregaron. Son dos abstracciones distintas —pila y cola— aunque ambas puedan implementarse con una lista de Python.

#### Paso 3 · Teoría, modelo mental y analogía
Una pila es LIFO: lo último que entra es lo primero que sale; una cola es FIFO: lo primero que entra es lo primero que sale. Esto es un contrato de comportamiento, no una implementación — podés construir ambas con una `list`. Lo que cambia es el costo: `list.append()` y `list.pop()` (sin índice) operan sobre el final de la lista y son O(1), porque Python solo ajusta un puntero; pero `list.pop(0)` o `list.insert(0, x)` operan sobre el principio y son O(n), porque hay que desplazar todos los elementos restantes una posición. `collections.deque` está pensada para operar en O(1) en AMBOS extremos. La analogía: una pila es una torre de platos (sacás el de arriba); una cola bien implementada es una fila donde atender al primero no mueve a nadie más; `list.pop(0)` es esa misma fila pero donde, cada vez que atienden a alguien, el resto tiene que dar un paso al frente.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía y crea `src/pila_cola.py`:
```bash
mkdir ejemplo-pila-cola
cd ejemplo-pila-cola
mkdir src
```
```python
import time
from collections import deque

# "Deshacer": cada acción se apila; deshacer = pop() (LIFO, la última entra, sale primero)
acciones = []
acciones.append("crear tarea 1")
acciones.append("marcar tarea 1 como hecha")
acciones.append("crear tarea 2")
print("deshacer:", acciones.pop())

# "Procesar en el orden en que llegaron": dos formas de representar la misma cola
pendientes_lista = list(range(20_000))
pendientes_deque = deque(range(20_000))

inicio = time.perf_counter()
while pendientes_lista:
    pendientes_lista.pop(0)
tiempo_lista = time.perf_counter() - inicio

inicio = time.perf_counter()
while pendientes_deque:
    pendientes_deque.popleft()
tiempo_deque = time.perf_counter() - inicio

print(f"list.pop(0): {tiempo_lista:.4f}s | deque.popleft(): {tiempo_deque:.4f}s")
```
```bash
python src/pila_cola.py
```
**Resultado esperado:** `deshacer: crear tarea 2` (deshace la acción más reciente primero), y dos tiempos donde `list.pop(0)` es notablemente más lento que `deque.popleft()` para vaciar las mismas 20 000 tareas. **Fallo deliberado:** usar `list.pop(0)` para una cola no lanza ningún error ni da un resultado incorrecto — el bug es de rendimiento oculto. Vaciar una cola con `list.pop(0)` cuesta O(n²) en total, porque cada `pop(0)` debe desplazar todos los elementos restantes una posición; `deque.popleft()` cuesta O(n) en total porque cada extracción es O(1). Con 20 000 elementos la diferencia ya es medible; en el Paso 6 vas a subir a 100 000 y la vas a ver crecer. Corregí usando `deque` desde el principio cuando la operación dominante sea sacar del frente.

#### Paso 5 · Práctica guiada
Pista: implementá `deshacer_todo` vaciando la pila con `pop()` hasta que esté vacía, y `procesar_todo` vaciando la cola con `popleft()` hasta que esté vacía; comprobá que llamar una vez de más sobre cualquiera de las dos ya vacías produce `IndexError`, y decidí cómo evitarlo (validar antes de extraer).

#### Paso 6 · Práctica independiente
Repetí la medición del Paso 4 con `pendientes_lista` y `pendientes_deque` de 100 000 elementos. La brecha entre `list.pop(0)` y `deque.popleft()` debería crecer, porque el costo de desplazar el resto escala con el tamaño de la lista, no es un costo fijo.

#### Paso 7 · Cierre y evidencia
Guardá el código de la pila de deshacer, la cola de pendientes y la medición de `list.pop(0)` contra `deque.popleft()`; como siguiente paso, en el Tema 3 vas a necesitar que esas mismas tareas estén ordenadas para poder buscarlas con búsqueda binaria. Errores comunes: usar `list.pop(0)` para una cola y no notar el costo porque con pocos elementos no se nota; desapilar o desencolar sin comprobar antes si la estructura está vacía. Fuentes oficiales: https://docs.python.org/es/3/library/collections.html#collections.deque y https://docs.python.org/es/3/tutorial/datastructures.html#using-lists-as-stacks.
**¿Por qué es importante?** Porque elegir mal entre lista y deque no se nota con 10 elementos ni con 100 — se nota cuando la cola de pendientes crece, y para entonces ya está en producción.
**Evidencia de aprendizaje:** entregá la pila de deshacer, la cola de pendientes y los dos tiempos medidos (`list.pop(0)` vs `deque.popleft()`) con al menos dos tamaños distintos.
**Conceptos clave:** tipo abstracto de datos, pila, cola, LIFO, FIFO, push, pop, enqueue y dequeue.

Una estructura también puede definirse por las operaciones permitidas, no por su implementación concreta. Una **pila** sigue LIFO: el último elemento agregado sale primero. Una **cola** sigue FIFO: el primero en entrar sale primero. Python puede representarlas con listas o `deque`, pero el comportamiento conceptual es independiente del lenguaje.

```python
from collections import deque

historial = []
historial.append("abrir archivo")
historial.append("editar título")
ultima_accion = historial.pop()

trabajos = deque()
trabajos.append("generar factura 1")
trabajos.append("generar factura 2")
primero = trabajos.popleft()
```

En el historial, `pop` devuelve “editar título”: base de deshacer. En trabajos, `popleft` devuelve la factura 1: orden de llegada. Usar `list.pop(0)` desplaza los elementos restantes y expresa peor una cola; `deque` está diseñada para operar eficientemente en ambos extremos.

Implementa una pila con funciones `apilar`, `desapilar` y `esta_vacia`. Define qué ocurre al desapilar vacía. Ese comportamiento forma parte del contrato. Después utiliza la pila para comprobar paréntesis balanceados: al abrir, apila; al cerrar, verifica y desapila; al final debe quedar vacía.

**Analogía:** una pila es una torre de platos; una cola es la fila de atención. Sacar el plato inferior o atender al último que llegó viola el modelo.

**¿Por qué es importante?** Pilas aparecen en llamadas, navegación y parsing; colas en mensajería, impresión y procesamiento asíncrono. Reconocer el patrón evita diseñar estados confusos.

**Casos de uso reales:** undo/redo, historial del navegador, cola de emails, tareas en background y recorrido de grafos.

**Diagrama:**

```mermaid
flowchart LR
    subgraph LIFO["Pila · LIFO"]
      A1["A"] --> B1["B"] --> C1["C sale primero"]
    end
    subgraph FIFO["Cola · FIFO"]
      A2["A sale primero"] --> B2["B"] --> C2["C"]
    end
```

#### Profundización · Diseño: Deshacer/Rehacer con pilas vs colas

**Escenario real:** Gestor de tareas con "Deshacer" (Undo): editar una tarea, cambiar su estado, agregar nota. Necesitas poder revertir en orden inverso.

**Tu tarea (sin mirar solución):**

1. **Analiza:** Deshacer = LIFO (last-in-first-out). ¿Es pila o cola?
2. **Diseña:** Estructura con dos pilas: `pila_undo` y `pila_redo`.
3. **Escenario:** Usuario: edita → edita → edita → Deshacer → Deshacer → Rehacer. Dibuja estado de pilas.
4. **Alternativa:** ¿Por qué no usar una cola?, ¿qué perderías?

**Escribe tu respuesta:**
```
Deshacer = _________ (pila/cola)
Dos pilas: push/pop en undo, cómo se alimenta redo: _________
Estado tras 2 × Deshacer y 1 × Rehacer: _________ items en undo, _________ en redo
Cola vs pila: Perderías _________ (¿qué?)
```

[SOLUCIÓN — Lee solo después de intentar]

> **Respuesta esperada:**
>
> **Deshacer = Pila** (LIFO: la última acción se revierte primero).
>
> **Flujo:**
> - Acción A → push pila_undo, clear pila_redo
> - Deshacer → pop undo, push redo
> - Rehacer → pop redo, push undo
>
> **Dibuja:**
> ```
> Tras 3 ediciones: undo=[A,B,C], redo=[]
> Tras 2 × Deshacer: undo=[A], redo=[C,B]
> Tras 1 × Rehacer: undo=[A,B], redo=[C]
> ```
>
> **Cola:** Invertirías el orden de reversión (FIFO). Deshacer sería mal: "deshacer A primero" en vez de "deshacer C primero".

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** Usa una cola para tareas pendientes y una pila para una demostración de deshacer. Prueba el orden de extracción y explica qué operaciones necesitarían persistencia antes de usarse en el gestor real.

### Tema 3: Búsqueda, precondiciones y demostración de corrección

#### Paso 1 · Objetivo y preparación
Al finalizar vas a implementar búsqueda binaria sobre una lista de tareas ordenada por fecha límite, y vas a reproducir el fallo silencioso de aplicarla sobre una lista que no cumple esa precondición. **Prerrequisitos:** Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
El gestor de tareas va a necesitar listar tareas por fecha límite y, más adelante, encontrar rápido la que vence en una fecha exacta. Si la lista de tareas está ordenada por fecha, podés usar búsqueda binaria; si no lo está —por ejemplo, porque alguien agregó una tarea nueva al final sin reordenar— la búsqueda binaria no se rompe con un error: devuelve una respuesta incorrecta sin avisar.

#### Paso 3 · Teoría, modelo mental y analogía
La búsqueda binaria exige una precondición explícita: la lista tiene que estar ordenada según el mismo criterio que usás para comparar. A cambio, cada paso descarta la mitad del espacio de búsqueda restante — por eso es O(log n) en vez de O(n). Esa garantía depende enteramente de que la precondición se cumpla; si no se cumple, el algoritmo no "se rompe" con una excepción, simplemente deja de ser correcto, y nada en su código te avisa. Un algoritmo se demuestra correcto respecto a un contrato explícito (precondición + poscondición), no porque "funcionó" en un caso de prueba. La analogía: buscar una palabra en un diccionario abriéndolo por la mitad funciona porque está ordenado alfabéticamente; hacer lo mismo con hojas sueltas sin ordenar no te dice nada sobre dónde está la palabra.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía y crea `src/busqueda.py`:
```bash
mkdir ejemplo-busqueda
cd ejemplo-busqueda
mkdir src
```
```python
tareas_por_fecha = [
    {"id": 1, "fecha": "2026-01-05"},
    {"id": 2, "fecha": "2026-02-10"},
    {"id": 3, "fecha": "2026-03-01"},
    {"id": 4, "fecha": "2026-04-20"},
]

def buscar_binaria_por_fecha(tareas, fecha_objetivo):
    izquierda, derecha = 0, len(tareas) - 1
    while izquierda <= derecha:
        medio = (izquierda + derecha) // 2
        if tareas[medio]["fecha"] == fecha_objetivo:
            return tareas[medio]
        if tareas[medio]["fecha"] < fecha_objetivo:
            izquierda = medio + 1
        else:
            derecha = medio - 1
    return None

print(buscar_binaria_por_fecha(tareas_por_fecha, "2026-03-01"))
```
```bash
python src/busqueda.py
```
**Resultado esperado:** imprime la tarea con id 3 (`fecha: "2026-03-01"`) porque `tareas_por_fecha` está ordenada de la fecha más antigua a la más reciente — esa es la precondición de `buscar_binaria_por_fecha`. **Fallo deliberado:** desordená la lista a mano (por ejemplo, poné la tarea de id 3 primero) y volvé a buscar la misma fecha `"2026-03-01"`. La función devuelve `None` aunque la tarea EXISTE en la lista — sin ningún error, solo un resultado silenciosamente incorrecto, porque la mitad que descarta en cada paso ya no garantiza nada cuando el orden está roto. Corregí ordenando con `tareas_por_fecha.sort(key=lambda t: t["fecha"])` antes de buscar, o usando búsqueda lineal cuando no puedas garantizar el orden.

#### Paso 5 · Práctica guiada
Pista: probá con la lista desordenada del Paso 4 buscando una fecha que quedó en la primera posición y otra que quedó en la última — vas a ver que a veces "por suerte" sí la encuentra. Eso es lo más peligroso de violar una precondición: el fallo no es consistente, así que un solo caso de prueba que "funciona" no demuestra nada.

#### Paso 6 · Práctica independiente
Generá 1000 tareas con fechas aleatorias, ordenalas con `.sort(key=...)` antes de buscar, y medí con `time.perf_counter()` si `buscar_binaria_por_fecha` sigue siendo más rápida que una búsqueda lineal equivalente a ese tamaño.

#### Paso 7 · Cierre y evidencia
Guardá `buscar_binaria_por_fecha`, la versión que falla sobre la lista desordenada y la corrección (ordenar antes o usar búsqueda lineal); como siguiente paso, en el Tema 4 vas a medir cuánto cuesta ese orden previo —y el resto de las operaciones— a medida que crece el número de tareas. Errores comunes: aplicar búsqueda binaria sin verificar que la lista esté ordenada por la misma clave que usás para comparar; confundir "no la encontró" con "no existe" cuando en realidad la precondición estaba rota. Fuentes oficiales: https://docs.python.org/es/3/library/bisect.html y https://opendsa-server.cs.vt.edu/.
**¿Por qué es importante?** Porque un algoritmo que exige una precondición y la da por sentada sin verificarla no está mal "a veces": está mal siempre que alguien la rompa, y el síntoma es un resultado incorrecto sin ningún aviso.
**Evidencia de aprendizaje:** entregá la búsqueda binaria correcta, el caso que falla en silencio sobre la lista desordenada, y la corrección aplicada.
**Conceptos clave:** búsqueda lineal, búsqueda binaria, precondición, invariante, corrección y caso ausente.

La búsqueda lineal revisa elementos hasta encontrar el objetivo o terminar. Funciona aunque los datos no estén ordenados.

```python
def buscar_lineal(valores, objetivo):
    for indice, valor in enumerate(valores):
        if valor == objetivo:
            return indice
    return -1
```

El retorno `-1` expresa ausencia. Prueba objetivo al inicio, medio, final, ausente y lista vacía. El invariante es: antes de cada iteración, el objetivo no está en las posiciones ya examinadas.

La búsqueda binaria descarta la mitad en cada paso, pero exige datos ordenados:

```python
def buscar_binaria(valores, objetivo):
    izquierda, derecha = 0, len(valores) - 1
    while izquierda <= derecha:
        medio = (izquierda + derecha) // 2
        if valores[medio] == objetivo:
            return medio
        if valores[medio] < objetivo:
            izquierda = medio + 1
        else:
            derecha = medio - 1
    return -1
```

Traza `[2, 5, 9, 12, 20]` buscando `12`. Anota izquierda, derecha y medio. La región posible se reduce sin excluir el objetivo. Probar el algoritmo con una lista desordenada no demuestra que esté roto: viola su precondición. La interfaz o documentación debe hacer esa exigencia visible.

**Error deliberado:** usa `while izquierda < derecha`. Busca un valor que quede como último candidato y observa cómo se omite. El caso de una lista de un elemento detecta rápidamente este error.

**Analogía:** la búsqueda lineal revisa cada página; la binaria abre un diccionario por la mitad y decide en qué mitad continuar, posible solo porque está ordenado.

**¿Por qué es importante?** Un algoritmo no es correcto “porque funcionó una vez”. Debe funcionar para todas las entradas que satisfacen su contrato y terminar en tiempo finito.

**Casos de uso reales:** localizar registros, autocompletado, índices ordenados y diagnóstico de versiones mediante bisección.

**Diagrama:**

```mermaid
flowchart LR
    ALL[“2 · 5 · 9 · 12 · 20”] --> MID[“medio = 9”]
    MID --> RIGHT[“descartar 2 · 5 · 9”] --> FOUND[“encontrar 12”]
```

#### Profundización · Diseño: Búsqueda binaria con duplicados

**Escenario real:** Lista de tareas completadas ordenadas por timestamp: `[t1, t1, t2, t2, t2, t3]`. Búsqueda binaria clásica devuelve un índice de t2. Necesitas el PRIMERO y el ÚLTIMO de todos los t2.

**Tu tarea (sin mirar solución):**

1. **Precondición:** ¿Qué debe garantizarse sobre la lista?
2. **Desafío:** Búsqueda binaria estándar encuentra T, pero ¿cómo ubicas primer y último?
3. **Algoritmo:** Modifica búsqueda para hallar `primer_t2` y `ultimo_t2`.
4. **Correctitud:** Si hay 0 coincidencias, ¿qué devuelves?

**Escribe tu respuesta:**
```
Precondición: lista _________ (¿ordenada?)
Algoritmo para primer_t2: búsqueda binaria pero _________
Algoritmo para ultimo_t2: búsqueda binaria pero _________
Si 0 coincidencias: devuelve _________ (None, -1, excepción)
```

[SOLUCIÓN — Lee solo después de intentar]

> **Respuesta esperada:**
>
> **Precondición:** Lista **ordenada** (creciente o decreciente).
>
> **primer_t2:** Busca binaria normal, luego expande hacia izquierda hasta encontrar valor distinto.
>
> **ultimo_t2:** Busca binaria normal, luego expande hacia derecha hasta valor distinto.
>
> **Si 0 coincidencias:** Devuelve `(-1, -1)` o lanza `ValueError`.
>
> **Pseudocódigo:**
> ```
> idx = busqueda_binaria(lista, t2)
> primer = idx; ultimo = idx
> mientras primer > 0 y lista[primer-1] == t2: primer -= 1
> mientras ultimo < len(lista)-1 y lista[ultimo+1] == t2: ultimo += 1
> return (primer, ultimo)
> ```

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** Busca una tarea por identificador con precondiciones explícitas. Si usas búsqueda binaria, prueba una colección desordenada y muestra por qué primero debes establecer y conservar el orden.

### Tema 4: Complejidad, medición, ordenamiento y recursión

#### Paso 1 · Objetivo y preparación
Al finalizar vas a medir con `time.perf_counter()` cuánto tarda ordenar una lista de tareas con `sorted()` comparado con una implementación propia de bubble sort, en varios tamaños, y vas a ver en números reales por qué O(n²) deja de ser aceptable mucho antes de lo que parece. **Prerrequisitos:** Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
A medida que el gestor de tareas acumula historial, vas a necesitar ordenarlo (por fecha, por prioridad) con cierta frecuencia. Python ya trae una función de ordenamiento (`sorted()`) optimizada, pero para entender qué estás ganando al usarla conviene compararla con una implementación propia simple, y medir —no asumir— cuánto cuesta cada una a medida que crece la cantidad de tareas.

#### Paso 3 · Teoría, modelo mental y analogía
Big O describe cómo CRECE el trabajo cuando crece la entrada, no cuánto tarda en segundos —eso depende de la máquina—. `sorted()` en Python usa Timsort, un algoritmo híbrido que aprovecha el orden que ya pueda tener la entrada y logra O(n log n). Una implementación ingenua como bubble sort compara cada par de elementos adyacentes en pasadas repetidas sobre toda la lista —dos bucles anidados que dan O(n²)—. La teoría predice que la brecha entre ambas crece sin límite a medida que n crece; medir con `time.perf_counter()` en unos pocos tamaños es la única forma de confirmar esa predicción con números reales, en tu propia máquina.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía y crea `src/medir.py`:
```bash
mkdir ejemplo-complejidad
cd ejemplo-complejidad
mkdir src
```
```python
import time
import random

def bubble_sort(valores):
    valores = valores.copy()
    n = len(valores)
    for i in range(n):
        for j in range(n - 1 - i):
            if valores[j] > valores[j + 1]:
                valores[j], valores[j + 1] = valores[j + 1], valores[j]
    return valores

for tamano in (500, 1000, 2000):
    tareas = [random.random() for _ in range(tamano)]

    inicio = time.perf_counter()
    sorted(tareas)
    tiempo_sorted = time.perf_counter() - inicio

    inicio = time.perf_counter()
    bubble_sort(tareas)
    tiempo_bubble = time.perf_counter() - inicio

    print(f"n={tamano}: sorted()={tiempo_sorted:.5f}s  bubble_sort()={tiempo_bubble:.5f}s")
```
```bash
python src/medir.py
```
**Resultado esperado:** para n=500, 1000 y 2000, `sorted()` apenas crece, mientras que `bubble_sort()` crece mucho más rápido: al duplicar n, `sorted()` tarda un poco más del doble, pero `bubble_sort()` tarda aproximadamente CUATRO veces más, porque n² duplicado es (2n)² = 4n². **Fallo deliberado:** cambiá `tamano` a `20_000` sin tocar nada más. `bubble_sort()` pasa de tardar milisegundos a tardar varios segundos —la misma función que "andaba bien" con 500 elementos, usada sin medir antes con una entrada 40 veces más grande—. `sorted()` sigue siendo casi instantáneo. Corregí: para listas que pueden crecer, usá `sorted()`/`.sort()` (Timsort) y reservá una implementación manual como `bubble_sort` solo para fines didácticos.

#### Paso 5 · Práctica guiada
Pista: anotá el cociente `tiempo_bubble / tiempo_sorted` en cada tamaño del Paso 4 — ese cociente debería crecer a medida que n crece, porque O(n²) crece mucho más rápido que O(n log n); si el cociente se mantiene parecido, medí de nuevo con tamaños más separados.

#### Paso 6 · Práctica independiente
Agregá un tercer tamaño (10 000) a la medición del Paso 4, y una función de ordenamiento intermedia (por ejemplo insertion sort) para ver dónde queda ubicada respecto a `sorted()` y `bubble_sort()`. Anotá si el orden relativo de las tres (quién es más rápida) se mantiene igual en los tres tamaños.

#### Paso 7 · Cierre y evidencia
Guardá la tabla de tiempos de `sorted()` contra `bubble_sort()` en los tres tamaños medidos; con esto cerrás el Módulo 2. Como siguiente paso, en el Módulo 3 vas a aplicar este mismo tipo de razonamiento —medir antes de asumir— a cómo viaja una petición desde una URL hasta un servidor. Errores comunes: concluir con una sola medición; comparar tamaños demasiado parecidos para notar la diferencia entre O(n log n) y O(n²); usar bubble sort (o cualquier O(n²)) sobre una entrada que puede crecer sin límite. Fuentes oficiales: https://docs.python.org/es/3/library/time.html#time.perf_counter y https://docs.python.org/es/3/howto/sorting.html.
**¿Por qué es importante?** Porque la teoría (Big O) predice la forma del crecimiento, pero solo medir con reloj real confirma si esa diferencia importa en tu caso concreto —y cuánto—.
**Evidencia de aprendizaje:** entregá la tabla de tiempos con al menos tres tamaños, y la explicación de qué pasó al multiplicar por cuarenta el tamaño en `bubble_sort`.
**Conceptos clave:** tamaño de entrada, Big O, tiempo, espacio, O(1), O(log n), O(n), O(n²), ordenamiento y recursión.

Big O describe cómo crece el trabajo cuando crece la entrada; no es un cronómetro. Una búsqueda lineal es O(n): duplicar elementos puede duplicar comparaciones. La binaria es O(log n): duplicar el tamaño añade aproximadamente un paso. Dos bucles anidados sobre la entrada suelen sugerir O(n²).

```python
def tiene_duplicados_lento(valores):
    for i in range(len(valores)):
        for j in range(i + 1, len(valores)):
            if valores[i] == valores[j]:
                return True
    return False

def tiene_duplicados(valores):
    return len(valores) != len(set(valores))
```

La segunda solución usa memoria adicional para un conjunto y suele acercarse a O(n). Este intercambio tiempo-espacio debe documentarse. No concluyas solo por cinco elementos; mide tamaños crecientes con `time.perf_counter`, repite y evita incluir entrada/salida en la región medida.

Ordenar permite búsqueda binaria, pero ordenar también cuesta. Si harás una sola búsqueda, quizá no compense; si harás miles, puede hacerlo. El análisis debe considerar el flujo completo.

Recursión significa que una función resuelve un caso mediante una versión más pequeña del mismo problema. Necesita caso base y progreso.

```python
def factorial(n):
    if n < 0:
        raise ValueError("n debe ser no negativo")
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```

Traza `factorial(4)` y dibuja llamadas. El caso base detiene; `n-1` progresa. Sin cualquiera aparece recursión infinita hasta agotar la pila. En Python, un bucle puede ser más apropiado para problemas lineales; recursión brilla en árboles y estructuras naturalmente anidadas.

**Analogía:** Big O compara la forma de crecimiento de rutas, no el modelo del vehículo. Un automóvil lento en una autopista escalable puede superar a uno rápido obligado a visitar cada par de ciudades.

**¿Por qué es importante?** El análisis permite anticipar fallos de escala antes de producción y comunicar decisiones con un vocabulario compartido.

**Casos de uso reales:** detectar duplicados, ordenar reportes, recorrer directorios, buscar en índices y evitar endpoints cuadráticos.

**Diagrama:**

```mermaid
xychart-beta
    title "Crecimiento aproximado de operaciones"
    x-axis "n" [10, 100, 1000]
    y-axis "operaciones" 0 --> 1000000
    line "O(n)" [10, 100, 1000]
    line "O(n²)" [100, 10000, 1000000]
```

#### Profundización · Diseño: Punto de inflexión O(n) vs O(n²) con 10M items

**Escenario real:** Gestor de tareas con 10 millones de tareas. Algoritmo A: O(n), Algoritmo B: O(n²). ¿En qué momento B es inaceptable?

**Tu tarea (sin mirar solución):**

1. **Calcula:** 10M × O(n) ¿cuántas operaciones?, ¿cuánto tiempo estimado?
2. **Calcula:** 10M × O(n²) = ?, ¿es viable en producción?
3. **Punto de inflexión:** ¿A qué tamaño de N, O(n²) > 10 segundos (timeout)?
4. **Medición real:** Escribe un script que mida tiempos reales de ambos.

**Escribe tu respuesta:**
```
10M con O(n): _________ operaciones, ~_________ segundos
10M con O(n²): _________ operaciones, ~_________ segundos (¿viable?)
Punto inflexión (timeout 10s): N máximo = _________
Medición: time.time() antes/después, imprime diferencia
```

[SOLUCIÓN — Lee solo después de intentar]

> **Respuesta esperada:**
>
> **O(n):** 10M operaciones ≈ 0.01s (10ms).
>
> **O(n²):** (10M)² = (10⁷)² = 10¹⁴ operaciones. Con la misma tasa de 10⁻⁹ s/operación usada arriba: 10¹⁴ × 10⁻⁹ s = 10⁵ segundos ≈ **1.16 días**. Sigue siendo inviable para un gestor interactivo, pero la cifra correcta es días, no siglos.
>
> **Punto inflexión:** Resolviendo n² × 10⁻⁹ s/op ≈ 10s → N ≈ 100,000 items máximo para O(n²).
>
> **Script:**
> ```python
> import time
> n = 1000000
> start = time.time()
> # O(n): for i in range(n): pass
> # O(n²): for i in range(n): for j in range(n): pass
> print(f"Tiempo: {time.time() - start:.4f}s")
> ```

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** Compara dos estrategias de ordenamiento con tareas equivalentes y tamaños crecientes. Verifica primero que producen el mismo orden y registra condiciones de medición antes de elegir por velocidad.

### Tema 5: Árboles y árboles binarios de búsqueda (BST)

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar un árbol binario de búsqueda que inserta y busca elementos manteniendo un orden, y explicar por qué una búsqueda en un BST equilibrado cuesta O(log n) en vez de O(n). Prerrequisitos: Temas 1-4 de este módulo (recursión y complejidad).

#### Paso 2 · Contexto y caso real
En el gestor de tareas, cuando tienes 10.000 tareas y necesitas encontrar una por su fecha de vencimiento, recorrer una lista entera (O(n)) es lento. Un árbol binario de búsqueda ordenado por fecha encuentra cualquier tarea en unos pocos saltos, el mismo principio que usan los índices de una base de datos (Módulo 4).

#### Paso 3 · Teoría, modelo mental y analogía
Un árbol es una estructura jerárquica: cada nodo tiene hijos. Un **BST** añade una regla de orden: todo lo menor que un nodo va a su izquierda, todo lo mayor a su derecha. Buscar es como adivinar un número entre 1 y 100 preguntando "¿mayor o menor?": cada pregunta descarta la mitad. Por eso la búsqueda es logarítmica mientras el árbol esté equilibrado.

**Analogía:** un BST es como un torneo de eliminación donde en cada ronda descartas la mitad de los candidatos; una lista es como revisar a cada candidato uno por uno hasta el final.

**Diagrama:**

```mermaid
graph TD
    A[50] --> B[30]
    A --> C[70]
    B --> D[20]
    B --> E[40]
    C --> F[60]
    C --> G[80]
```

**Diagrama interactivo:** [Árbol binario de búsqueda: invariante de orden y por qué degenera](/visuals/temas/foundations/modulo-2-tema-5-bst.html) — versión explorable con temas claro/oscuro y la regla de orden de cada nodo.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `bst.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

Crea `bst.py`:

```python
class Nodo:
    def __init__(self, valor):
        self.valor = valor
        self.izq = None
        self.der = None

class BST:
    def __init__(self):
        self.raiz = None

    def insertar(self, valor):
        self.raiz = self._insertar(self.raiz, valor)

    def _insertar(self, nodo, valor):
        if nodo is None:
            return Nodo(valor)
        if valor < nodo.valor:
            nodo.izq = self._insertar(nodo.izq, valor)
        elif valor > nodo.valor:
            nodo.der = self._insertar(nodo.der, valor)
        return nodo

    def buscar(self, valor):
        nodo = self.raiz
        pasos = 0
        while nodo is not None:
            pasos += 1
            if valor == nodo.valor:
                return pasos          # encontrado en 'pasos' comparaciones
            nodo = nodo.izq if valor < nodo.valor else nodo.der
        return -1                      # no está

arbol = BST()
for v in [50, 30, 70, 20, 40, 60, 80]:
    arbol.insertar(v)
print("Buscar 60:", arbol.buscar(60), "comparaciones")
print("Buscar 99:", arbol.buscar(99))
```

**Ejecuta el ejemplo:**

```bash
python3 bst.py
```

**Resultado esperado:** `Buscar 60: 3 comparaciones` (raíz 50 → 70 → 60) y `Buscar 99: -1`. Con 7 nodos, hallar un elemento cuesta a lo sumo 3 pasos, no 7 — ahí se ve el O(log n). **Fallo deliberado:** inserta los valores ya ordenados (`[20, 30, 40, 50, 60, 70, 80]`) y vuelve a buscar 80: ahora cuesta 7 comparaciones, porque el árbol degeneró en una lista. Diagnostica por qué un BST sin equilibrar pierde su ventaja y por qué existen los árboles balanceados (AVL, rojo-negro).

#### Paso 5 · Práctica guiada
Añade un recorrido en orden (`inorder`) que imprima los valores de menor a mayor. Pista: recorre recursivamente izquierda → nodo → derecha; en un BST eso devuelve los elementos ordenados automáticamente.

#### Paso 6 · Práctica independiente
Implementa `eliminar(valor)` para el caso de un nodo hoja y un nodo con un solo hijo. Entrega el árbol antes y después de eliminar, y explica por qué eliminar un nodo con dos hijos es el caso difícil.

#### Paso 7 · Cierre y evidencia
Entrega la búsqueda con conteo de pasos, el árbol degenerado del fallo deliberado y el recorrido en orden. **¿Por qué es importante?** los BST (y sus variantes balanceadas) son la base de los índices de bases de datos, los mapas ordenados (`TreeMap` en Java, `std::map` en C++) y los sistemas de autocompletado. Entender por qué el equilibrio importa es lo que separa usar la estructura de elegirla bien. Fuentes: [Binary Search Tree (Wikipedia)](https://en.wikipedia.org/wiki/Binary_search_tree).
**Conceptos clave:** jerarquía, invariante de orden, búsqueda logarítmica, degeneración y equilibrio.
**Cuándo no usarlo:** si solo necesitas buscar por igualdad exacta sin orden, una tabla hash (Tema 6) da O(1) promedio y es más simple; el BST brilla cuando necesitas orden (rangos, mínimo, máximo, recorrido ordenado).

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** indexa las tareas por fecha de vencimiento en un BST y compara el número de comparaciones de una búsqueda contra el recorrido lineal de la lista, con 100 y 10.000 tareas.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** insertar datos ya ordenados en un BST sin balancear (como `[20, 30, 40, 50, 60, 70, 80]`), lo que lo degenera en una lista enlazada y hace que `buscar` cueste O(n) en vez de O(log n); y asumir que "es un BST" garantiza O(log n) sin verificar si quedó equilibrado.
**Fuente oficial:** [documentación de fundamentos](https://developer.mozilla.org/es/).
### Tema 6: Tablas hash — búsqueda en tiempo constante

#### Paso 1 · Objetivo y preparación
Al finalizar podrás implementar una tabla hash con manejo de colisiones por encadenamiento, y explicar por qué el acceso promedio es O(1) y qué lo degrada a O(n). Prerrequisitos: Temas 1-4 de este módulo.

#### Paso 2 · Contexto y caso real
En el gestor de tareas, buscar una tarea por su ID exacto debería ser instantáneo sin importar cuántas tareas haya. Una tabla hash (lo que en Python es un `dict`) hace justo eso: convierte la clave en una posición directa del arreglo.

#### Paso 3 · Teoría, modelo mental y analogía
Una tabla hash usa una **función hash** que transforma una clave en un índice de un arreglo. Como dos claves distintas pueden caer en el mismo índice (**colisión**), se guarda una lista en cada posición (encadenamiento). Mientras las colisiones sean pocas, acceder es O(1).

**Analogía:** es como un guardarropa numerado: en vez de buscar tu abrigo revisando todos, la función hash (tu número de ficha) te lleva directo al casillero. Una colisión es cuando dos personas comparten casillero: hay que mirar los pocos abrigos de ESE casillero, no los de todo el guardarropa.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `tabla_hash.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

Crea `tabla_hash.py`:

```python
class TablaHash:
    def __init__(self, capacidad=8):
        self.capacidad = capacidad
        self.cubetas = [[] for _ in range(capacidad)]

    def _indice(self, clave):
        return hash(clave) % self.capacidad   # función hash -> posición

    def poner(self, clave, valor):
        cubeta = self.cubetas[self._indice(clave)]
        for i, (k, _) in enumerate(cubeta):
            if k == clave:
                cubeta[i] = (clave, valor)    # actualiza si ya existe
                return
        cubeta.append((clave, valor))         # inserta si es nueva

    def obtener(self, clave):
        cubeta = self.cubetas[self._indice(clave)]
        for k, v in cubeta:
            if k == clave:
                return v
        raise KeyError(clave)

tabla = TablaHash()
tabla.poner("RF-4471", "en ruta")
tabla.poner("RF-5002", "entregado")
print("RF-4471 ->", tabla.obtener("RF-4471"))
print("Distribución:", [len(c) for c in tabla.cubetas])
```

**Ejecuta el ejemplo:**

```bash
python3 tabla_hash.py
```

**Resultado esperado:** `RF-4471 -> en ruta` y una distribución donde las dos claves caen en cubetas (idealmente distintas). **Fallo deliberado:** fija `capacidad=1`: todas las claves caen en la única cubeta, y `obtener` vuelve a ser O(n) porque debe recorrer la lista entera. Diagnostica por qué el tamaño de la tabla y una buena función hash son lo que mantiene el O(1); por eso los `dict` reales redimensionan automáticamente cuando se llenan.

#### Paso 5 · Práctica guiada
Añade un método `eliminar(clave)`. Pista: encuentra la cubeta correcta y quita solo el par con esa clave, sin tocar los demás de la misma cubeta.

#### Paso 6 · Práctica independiente
Mide cuántas claves caen en cada cubeta al insertar 1000 claves con `capacidad=16` vs `capacidad=256`, y explica la relación entre el "factor de carga" (claves/capacidad) y el rendimiento.

#### Paso 7 · Cierre y evidencia
Entrega la tabla funcionando, la distribución de cubetas y el fallo deliberado con capacidad 1. **¿Por qué es importante?** las tablas hash son probablemente la estructura más usada en programación real — todo `dict`, `Map`, `HashMap`, caché o índice en memoria es una. Entender colisiones y factor de carga explica por qué a veces un `dict` "se pone lento" y cómo evitarlo. Fuentes: [Hash table (Wikipedia)](https://en.wikipedia.org/wiki/Hash_table).
**Conceptos clave:** función hash, colisión, encadenamiento, factor de carga, O(1) amortizado.
**Cuándo no usarlo:** si necesitas recorrer los datos en orden o buscar rangos, usa un árbol (Tema 5); una tabla hash no tiene orden.

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** guarda las tareas en una tabla hash indexada por ID y mide el factor de carga a medida que crece el inventario, confirmando que la búsqueda por ID se mantiene constante.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** usar una capacidad demasiado chica para la tabla (como `capacidad=1`), lo que fuerza a todas las claves a la misma cubeta y degrada `obtener` a O(n); y confundir el O(1) *promedio* con una garantía absoluta, ignorando que un factor de carga alto o una mala función hash lo rompen.
**Fuente oficial:** [documentación de fundamentos](https://developer.mozilla.org/es/).
### Tema 7: Grafos y recorridos BFS/DFS

#### Paso 1 · Objetivo y preparación
Al finalizar podrás representar un grafo y recorrerlo en anchura (BFS) y en profundidad (DFS), y decidir cuál usar según el problema. Prerrequisitos: Temas 2 (pilas/colas) y 5 (árboles) de este módulo.

#### Paso 2 · Contexto y caso real
En RutaFlow, las ciudades conectadas por carreteras forman un grafo. Encontrar la ruta con menos tramos entre dos ciudades es un BFS; explorar todas las ciudades alcanzables desde un depósito es un DFS. Los grafos modelan redes sociales, dependencias entre tareas, mapas y rutas.

#### Paso 3 · Teoría, modelo mental y analogía
Un **grafo** son nodos (vértices) conectados por aristas. **BFS** explora por niveles usando una **cola** (primero los vecinos directos, luego los vecinos de los vecinos): encuentra el camino más corto en número de saltos. **DFS** explora yendo lo más profundo posible usando una **pila** (o recursión) antes de retroceder.

**Analogía:** BFS es explorar un laberinto con un equipo que avanza en abanico, cubriendo todo lo cercano antes de alejarse; DFS es una sola persona que sigue un pasillo hasta el final, y si no hay salida, retrocede al último cruce.

**Diagrama:**

```mermaid
graph LR
    A[Depósito] --- B[Ciudad B]
    A --- C[Ciudad C]
    B --- D[Ciudad D]
    C --- D
    D --- E[Ciudad E]
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `grafos.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

Crea `grafos.py`:

```python
from collections import deque

grafo = {
    "Deposito": ["B", "C"],
    "B": ["Deposito", "D"],
    "C": ["Deposito", "D"],
    "D": ["B", "C", "E"],
    "E": ["D"],
}

def bfs(inicio):
    visitados, cola, orden = {inicio}, deque([inicio]), []
    while cola:
        nodo = cola.popleft()          # cola: primero en entrar, primero en salir
        orden.append(nodo)
        for vecino in grafo[nodo]:
            if vecino not in visitados:
                visitados.add(vecino)
                cola.append(vecino)
    return orden

def dfs(inicio, visitados=None, orden=None):
    if visitados is None:
        visitados, orden = set(), []
    visitados.add(inicio)
    orden.append(inicio)
    for vecino in grafo[inicio]:
        if vecino not in visitados:
            dfs(vecino, visitados, orden)  # recursión = pila implícita
    return orden

print("BFS:", bfs("Deposito"))
print("DFS:", dfs("Deposito"))
```

**Ejecuta el ejemplo:**

```bash
python3 grafos.py
```

**Resultado esperado:** `BFS: ['Deposito', 'B', 'C', 'D', 'E']` (por niveles: primero B y C, luego D, luego E) y `DFS: ['Deposito', 'B', 'D', 'C', 'E']` (baja por un camino antes de retroceder). Observa cómo la **cola** produce exploración por niveles y la **recursión/pila** produce exploración en profundidad. **Fallo deliberado:** quita el conjunto `visitados` del BFS: con el ciclo Depósito↔B↔D↔C↔Depósito el programa entra en bucle infinito. Diagnostica por qué en un grafo (a diferencia de un árbol) SIEMPRE hay que marcar lo visitado.

#### Paso 5 · Práctica guiada
Modifica `bfs` para que devuelva el camino más corto (lista de nodos) entre dos ciudades, no solo el orden de visita. Pista: guarda de qué nodo llegaste a cada vecino y reconstruye el camino al llegar al destino.

#### Paso 6 · Práctica independiente
Añade una ciudad aislada (sin aristas) y confirma que no aparece en el recorrido desde el depósito. Luego cuenta cuántos "componentes conectados" tiene el grafo.

#### Paso 7 · Cierre y evidencia
Entrega los recorridos BFS y DFS, el camino más corto y el bucle infinito del fallo deliberado. **¿Por qué es importante?** los grafos y sus recorridos están detrás de los mapas (rutas), las redes sociales (amigos de amigos), los planificadores de tareas (orden de dependencias) y los rastreadores web. BFS para "el más cercano", DFS para "explorar todo" es una decisión que tomarás muchas veces. Fuentes: [Graph traversal (Wikipedia)](https://en.wikipedia.org/wiki/Graph_traversal).
**Conceptos clave:** vértices y aristas, lista de adyacencia, BFS con cola, DFS con pila/recursión, marcar visitados.
**Cuándo no usarlo:** para datos jerárquicos de un solo padre (un sistema de archivos, un organigrama) un árbol (Tema 5) es más simple; el grafo general se justifica cuando hay múltiples conexiones o ciclos.

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** modela las dependencias entre tareas (una tarea que debe hacerse antes que otra) como un grafo y usa un recorrido para detectar si hay un ciclo de dependencias imposible de resolver.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** recorrer un grafo con ciclos sin marcar los nodos visitados (como en el fallo deliberado), lo que produce un bucle infinito porque, a diferencia de un árbol, un grafo puede volver al mismo nodo; y usar DFS cuando el problema necesita el camino más corto, que es exactamente lo que garantiza BFS por niveles.
**Fuente oficial:** [documentación de fundamentos](https://developer.mozilla.org/es/).
### Tema 8: Programación dinámica — resolver una vez, recordar el resultado

#### Paso 1 · Objetivo y preparación
Al finalizar podrás reconocer un problema con subproblemas repetidos y resolverlo con memoización, convirtiendo una solución exponencial en una lineal. Prerrequisitos: Tema 4 (recursión y complejidad) de este módulo.

#### Paso 2 · Contexto y caso real
En RutaFlow, calcular el costo mínimo de una ruta con muchos tramos recalcula los mismos sub-tramos una y otra vez si lo haces ingenuamente. La programación dinámica guarda cada resultado la primera vez que lo calcula, para no repetirlo — la diferencia entre una respuesta instantánea y una que tarda minutos.

#### Paso 3 · Teoría, modelo mental y analogía
La **programación dinámica (DP)** aplica a problemas con dos propiedades: subproblemas que se **solapan** (se repiten) y una solución que se construye desde subproblemas más pequeños. La **memoización** guarda cada resultado ya calculado en un diccionario (una tabla hash, Tema 6) y lo reutiliza.

**Analogía:** es como hacer un examen donde varias preguntas comparten el mismo cálculo intermedio: en vez de rehacerlo cada vez, lo escribes una vez en el margen y lo copias. Fibonacci ingenuo recalcula `fib(5)` miles de veces; con memoización, cada valor se calcula exactamente una vez.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `dp.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

Crea `dp.py`:

```python
import time

# Versión ingenua: recalcula los mismos subproblemas (exponencial, O(2^n))
def fib_ingenuo(n):
    if n < 2:
        return n
    return fib_ingenuo(n - 1) + fib_ingenuo(n - 2)

# Versión con memoización: cada subproblema se resuelve una sola vez (lineal, O(n))
def fib_dp(n, memo=None):
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n in memo:
        return memo[n]                     # ya calculado: lo reutiliza
    memo[n] = fib_dp(n - 1, memo) + fib_dp(n - 2, memo)
    return memo[n]

for etiqueta, fn in [("ingenuo", fib_ingenuo), ("con DP", fib_dp)]:
    inicio = time.time()
    resultado = fn(32)
    print(f"fib(32) {etiqueta}: {resultado} en {time.time() - inicio:.3f}s")
```

**Ejecuta el ejemplo:**

```bash
python3 dp.py
```

**Resultado esperado:** ambos dan `fib(32): 2178309`, pero el ingenuo tarda un tiempo perceptible (décimas de segundo o más) y el de DP es casi instantáneo. **Fallo deliberado:** sube a `fib_ingenuo(45)`: el programa se cuelga segundos o minutos, porque hace miles de millones de llamadas repetidas, mientras `fib_dp(45)` responde al instante. Diagnostica contando (con un contador global) cuántas veces se llama a cada función: ahí ves el crecimiento exponencial frente al lineal.

#### Paso 5 · Práctica guiada
Añade un contador que cuente cuántas veces se ejecuta el cuerpo de cada versión para `n=20`, y compara los números. Pista: el ingenuo hará miles de llamadas; el de DP, unas 20.

#### Paso 6 · Práctica independiente
Resuelve con DP el problema de "cuántas formas hay de subir una escalera de n escalones dando pasos de 1 o 2". Entrega la versión memoizada y explica cuáles son los subproblemas que se solapan.

#### Paso 7 · Cierre y evidencia
Entrega las dos versiones de Fibonacci con sus tiempos, el conteo de llamadas y el problema de la escalera. **¿Por qué es importante?** la DP aparece en entrevistas técnicas constantemente y en problemas reales: rutas óptimas, diffs de texto, asignación de recursos, subsecuencias. Reconocer "esto tiene subproblemas repetidos" y aplicar memoización es una de las habilidades que más distingue a un programador que resuelve de uno que solo codifica. Fuentes: [Dynamic programming (Wikipedia)](https://en.wikipedia.org/wiki/Dynamic_programming).
**Conceptos clave:** subproblemas solapados, memoización, tabla de resultados, exponencial vs lineal.
**Cuándo no usarlo:** si los subproblemas no se repiten (cada uno es único), la DP no aporta y añade complejidad; úsala solo cuando detectes recálculo del mismo subproblema.

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** si el gestor calcula alguna métrica acumulada sobre rangos de fechas repetidos, memoiza el resultado por rango y demuestra con un contador que evitas recalcular los mismos rangos.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** no reconocer que un problema tiene subproblemas solapados y resolverlo con recursión simple (como `fib_ingenuo`), lo que vuelve exponencial algo que debería ser lineal y cuelga el programa con entradas apenas más grandes; y aplicar memoización a un problema cuyos subproblemas no se repiten, agregando complejidad sin ningún beneficio.
**Fuente oficial:** [documentación de fundamentos](https://developer.mozilla.org/es/).
## Construcción guiada del capítulo

### Proyecto 2: gestor de inventario con análisis de rendimiento

Desde una carpeta vacía crea `inventario/`, inicializa Git y construye una aplicación de consola que permita agregar, actualizar, listar, buscar y eliminar productos por SKU. Persiste los productos en `inventario.json` usando la biblioteca estándar.

Fases y commits sugeridos:

1. Modelo de producto y lista inicial.
2. CRUD en memoria con validaciones.
3. Índice por SKU y justificación escrita.
4. Guardado/carga JSON con manejo de archivo inexistente o corrupto.
5. Búsqueda lineal y binaria implementadas manualmente.
6. Generador de 100, 1 000 y 10 000 productos y medición repetida.
7. README con tabla de resultados, complejidad esperada y límites.

No uses una librería de benchmarking para ocultar el proceso. Aísla la operación, usa el mismo conjunto de consultas y registra entorno. La medición no sustituye el análisis: explica discrepancias por constantes, orden previo, caché o tamaño insuficiente.

**Verificación:** reiniciar el programa conserva datos; SKU duplicado se rechaza; búsqueda ausente no rompe; JSON corrupto produce mensaje accionable; las mediciones son reproducibles y no afirman causalidad sin evidencia.

**Errores comunes y soluciones**

- Elegir diccionario “porque es rápido” sin describir operaciones: escribe requisitos primero.
- Aplicar binaria a datos desordenados: valida o garantiza la precondición.
- Medir una sola vez: repite y reporta variabilidad.
- Confundir O(1) con tiempo cero: significa crecimiento independiente de n en el modelo.
- Recursión sin progreso: identifica caso base y reducción.
