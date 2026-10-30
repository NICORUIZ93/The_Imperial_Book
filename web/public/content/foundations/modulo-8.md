# Módulo 8: Sistemas operativos, concurrencia, Linux y contenedores

Hasta ahora construiste un inventario, lo protegiste con pruebas y seguridad y separaste su arquitectura. En este capítulo aprenderás qué sucede **debajo** del código: quién entrega CPU y memoria, cómo dos tareas interfieren, cómo investigar un servicio Linux y qué hace realmente Docker. El objetivo no es memorizar comandos, sino formar un modelo mental para diagnosticar sistemas reales.


## Aprende construyendo

### Tema 1: El sistema operativo como administrador y frontera

#### Paso 1 · Objetivo y preparación
Al finalizar vas a lanzar como proceso real el cálculo de ruta de `examples/rutaflow/foundation/domain.py`, inspeccionarlo con `ps` y detenerlo con una señal. Prerrequisitos: Python 3 instalado.

#### Paso 2 · Contexto y caso real
A lo largo de estos 12 módulos vas a construir el proyecto integrador Fundamentos, y en este módulo en particular vas a escribir pruebas para cada función del gestor de tareas. `nearest_neighbor_route` de RutaFlow puede tardar notablemente en una zona con muchas paradas — si un operador necesita cancelarlo a mitad de camino, necesita entender qué hace el sistema operativo con ese proceso, no solo con el código Python.

#### Paso 3 · Teoría, modelo mental y analogía
Un programa es el archivo `domain.py`; un proceso es ese programa corriendo de verdad, con PID, memoria y descriptores propios — el kernel es el bibliotecario que presta esos recursos, nunca el programa accediendo directo al hardware.

**Escenario:** Tu worker de validación procesa batches de 1000 entregas. Recibe SIGTERM a mitad de un batch. ¿Cómo terminas sin corrupción?

**Tu tarea:**
1. Diseña qué debe pasar en el handler.
2. ¿Cómo evitas que SIGTERM intervenga en medio de una transacción BD?
3. ¿Timeout de gracia? ¿Cuántos segundos?
4. ¿Qué logueas antes de salir?

[SOLUCIÓN PLEGADA]
> Handler: cambiar flag `shutdown_requested=True`, rechazar entrada, esperar workers en vuelo. Protección BD: transacciones son atómicas — si SIGTERM interrumpe, la BD revierte automáticamente (el conexión se cierra). Timeout de gracia: 30 segundos (configurable, < readiness probe de Kubernetes). Log: `{timestamp, entregas_procesadas, entregas_pendientes, motivo_salida}`. Salir con código 0 (éxito ordenado) para que Kubernetes no reinicie indefinidamente.

**Conceptos clave:** hardware, kernel, espacio de usuario, llamada al sistema, programa, proceso, PID, descriptor de archivo, sistema de archivos, usuario, permisos, señal y código de salida.

Un **programa** es información almacenada en un archivo. Un **proceso** es una instancia viva del programa con identidad, memoria, recursos y estado. Al ejecutar `python app.py`, la shell pide al kernel crear un proceso. El kernel carga el intérprete, asigna memoria, agenda momentos de CPU y registra descriptores para entrada, salida y errores. Python no escribe directamente en el disco: solicita la operación mediante llamadas al sistema.

El kernel separa el acceso privilegiado al hardware del espacio de las aplicaciones. Esa frontera limita daños y permite compartir recursos. En Unix, cada proceso empieza normalmente con los descriptores `0` (stdin), `1` (stdout) y `2` (stderr).

```bash
python app.py >salida.log 2>errores.log &
ps -o pid,ppid,state,etime,command
kill -TERM 12345
```

`SIGTERM` solicita un apagado ordenado que el programa puede manejar para cerrar conexiones. `SIGKILL` termina inmediatamente y no puede manejarse; por eso `kill -9` no debe ser el primer recurso. El código de salida `0` comunica éxito y otro valor comunica un resultado excepcional que una shell o CI puede interpretar.

Los permisos clásicos distinguen propietario, grupo y otros mediante lectura (`r`), escritura (`w`) y ejecución (`x`). En una carpeta, `x` permite atravesarla. Conceder `777` oculta el diagnóstico y amplía el acceso. Investiga primero con `id`, `ls -ld` y `namei -l ruta`.

**Analogía:** el kernel es la administración de una biblioteca. Los lectores no entran al depósito: presentan solicitudes, reciben préstamos identificados y respetan permisos y turnos.

**¿Por qué es importante?** porque “permiso denegado”, un puerto ocupado o datos sin vaciar no se comprenden mirando solamente el código fuente.

**Casos de uso reales:** apagar una API sin perder solicitudes, investigar permisos, redirigir logs en CI y terminar un worker atascado conservando evidencia.

**Diagrama:**

```mermaid
flowchart LR
    FILE["app.py"] --> PROCESS["proceso Python"] --> SYSCALL["llamadas al sistema"] --> KERNEL["kernel"]
    PROCESS --> MEMORY["memoria"]
    PROCESS --> FD["archivos y sockets"]
    KERNEL --> CPU["CPU"]
    KERNEL --> DISK["disco"]
    KERNEL --> NET["red"]
```
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
#### Profundización · Dos instancias del CLI, dos procesos distintos

Lanzá el gestor de tareas del proyecto integrador dos veces en paralelo (`python3 cli.py list &` repetido dos veces) e inspeccioná ambas con `ps -o pid,ppid,etime,command | grep cli.py`.

Vas a ver dos PIDs distintos, cada uno con su propia memoria y sus propios descriptores de archivo — aunque los dos ejecuten exactamente el mismo programa `cli.py`, el sistema operativo nunca confunde ni comparte su estado entre sí.

[SOLUCIÓN PLEGADA]
> Dos líneas en la salida de `ps`, con PIDs diferentes y el mismo `command`. Si `almacenamiento.py` no coordina el acceso al archivo de tareas (ver Tema 2 de este módulo), ambas instancias podrían leer y escribir `tareas.json` al mismo tiempo y perder una actualización silenciosamente.

**¿Por qué importa?** Confundir "programa" con "proceso" hace invisible el riesgo de que dos instancias del mismo CLI interfieran entre sí sin que el código tenga ningún error evidente.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/ejemplo.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

```bash
python3 -c "
import time
from examples.rutaflow.foundation.domain import Stop, nearest_neighbor_route
paradas = [Stop(f'RF-{i}', i*0.01, i*0.01) for i in range(50000)]
time.sleep(5)
nearest_neighbor_route((0,0), paradas)
" &
ps -o pid,ppid,state,etime,command | grep python3
```
Resultado esperado: `ps` muestra el proceso con su propio PID, su estado y el tiempo transcurrido — el cálculo O(n²) sobre 50000 paradas todavía no terminó, y el sistema operativo ya le asignó identidad y recursos propios desde el instante en que arrancó.

#### Paso 5 · Práctica guiada
Pista: enviá `kill -9 <PID>` (SIGKILL) a ese proceso mientras todavía calcula — ese es el fallo deliberado: el proceso termina de inmediato sin poder liberar nada ni loguear qué estaba haciendo, a diferencia de `kill -TERM <PID>`, que le daría la oportunidad de cerrar ordenadamente.

#### Paso 6 · Práctica independiente
Repetí el cálculo con una lista de paradas mucho más chica (50 en vez de 50000), y comparzá cuánto tarda en terminar solo con el tiempo reportado por `ps -o etime` en ambos casos — documentando por qué `kill -TERM` sí alcanzaría a interrumpirlo a tiempo en el caso chico.

#### Paso 7 · Cierre y evidencia
Entregá el proceso real inspeccionado con `ps` del Paso 4, la terminación abrupta con SIGKILL del Paso 5, y la comparación de tiempos del Paso 6; explicá la diferencia entre SIGTERM y SIGKILL en términos de qué puede (y qué no puede) hacer tu código antes de terminar. Errores comunes: usar `kill -9` como primer recurso en vez de `SIGTERM`, asumir que un proceso terminado liberó sus recursos de forma ordenada sin confirmarlo, y no revisar el código de salida que un proceso deja al terminar. Fuentes oficiales: https://man7.org/linux/man-pages/man7/signal.7.html.
**¿Por qué es importante?** Porque un proceso que recibe SIGKILL no tiene ninguna oportunidad de cerrar una transacción o loguear su estado — la diferencia entre SIGTERM y SIGKILL es la diferencia entre un apagado ordenado y una pérdida de evidencia.
### Tema 2: Memoria y concurrencia sin magia

#### Paso 1 · Objetivo y preparación
Al finalizar vas a provocar una condición de carrera real sobre el contador de capacidad de un vehículo de reparto, y a corregirla con un lock. Prerrequisitos: Python 3 instalado.

#### Paso 2 · Contexto y caso real
Si dos procesos de asignación intentaran reservar un lugar en el mismo vehículo al mismo tiempo (dos envíos asignándose casi simultáneamente), ambos podrían leer la misma capacidad disponible antes de que ninguno la actualice — perdiendo una reserva sin que nadie lo note.

#### Paso 3 · Teoría, modelo mental y analogía
`capacidad = capacidad - 1` no es una operación atómica: es leer, calcular y escribir — dos hilos pueden leer el mismo valor antes de que ninguno escriba, perdiendo una actualización, igual que dos agentes vendiendo el mismo último asiento desde copias separadas.

**Escenario:** Dos procesos en tu inventario: uno transfiere stock de bodega A a B, otro de B a A. Ambos pueden quedarse bloqueados esperándose mutuamente.

**Tu tarea:**
1. Escribe código en pseudocódigo que deadlocker.
2. ¿Por qué ocurre? (Condiciones de Coffman.)
3. ¿Cómo detectarlo? (Timeout, detector de ciclos.)
4. ¿Cómo prevenirlo sin sacrificar concurrencia?

[SOLUCIÓN PLEGADA]
> Pseudocódigo: P1 lock(A) → lock(B); P2 lock(B) → lock(A). Ambas retienen un lock y esperan al otro. Condiciones Coffman: (1) exclusión mutua (locks), (2) sin preemption (no desalojar), (3) retención con espera, (4) espera circular. Detección: timeout en lock (si esperas >30s, rollback), o detector de ciclos de espera. Prevención: ordenar locks (A siempre antes de B) o usar transacciones serializables que detectan y revierten.

**Conceptos clave:** memoria virtual, stack, heap, proceso, hilo, concurrencia, paralelismo, intercalado, sección crítica, condición de carrera, mutex, semáforo, deadlock e inmutabilidad.

Cada proceso observa un espacio de direcciones virtual propio. El sistema y el hardware traducen direcciones a memoria física. El **stack** contiene normalmente marcos de llamadas y variables locales; el **heap** guarda objetos con vida más flexible. Es un modelo útil, aunque los detalles dependen del lenguaje y su runtime.

Los hilos de un proceso comparten heap y descriptores, pero tienen stack y estado propios. **Concurrencia** significa que varias tareas progresan en períodos solapados; **paralelismo**, que ejecutan simultáneamente, por ejemplo en núcleos diferentes. Puede haber concurrencia en un solo núcleo por intercalado.

`saldo = saldo - cantidad` parece una operación, pero implica leer, calcular y escribir. Dos tareas pueden leer el mismo saldo antes de escribir y perder una actualización. El resultado depende entonces de un orden temporal no controlado: una condición de carrera.

```python
from threading import Lock

lock = Lock()

def retirar(conexion, producto_id, cantidad):
    with lock, conexion:
        cursor = conexion.execute(
            "UPDATE productos SET stock = stock - ? "
            "WHERE id = ? AND stock >= ?",
            (cantidad, producto_id, cantidad),
        )
        if cursor.rowcount != 1:
            raise ValueError("stock insuficiente")
```

El lock coordina hilos de este proceso; la transacción y la condición SQL protegen también cuando existen varios procesos. Bloquear demasiado reduce rendimiento. Dos tareas que esperan recursos bloqueados entre sí forman un **deadlock**. Se previene reduciendo estado compartido, adquiriendo locks en un orden constante, limitando esperas y prefiriendo mensajes o datos inmutables cuando corresponda.

**Analogía:** dos agentes venden el último asiento desde copias distintas. Un control de reserva atómico decide quién lo obtiene; pedir que trabajen más rápido no resuelve el conflicto.

**Casos de uso reales:** descontar inventario, procesar pagos idempotentes, ejecutar workers, actualizar cachés y evitar migraciones simultáneas.

**Diagrama:**

```mermaid
sequenceDiagram
    participant A as Tarea A
    participant S as Stock compartido
    participant B as Tarea B
    A->>S: leer 10
    B->>S: leer 10
    A->>S: escribir 9
    B->>S: escribir 9
    Note over S: incorrecto 9, esperado 8
```

El proyecto integrador Fundamentos tiene la misma sección crítica escondida en `almacenamiento.py`: si dos invocaciones de `python3 cli.py add` corrieran en paralelo, ambas podrían leer la misma lista de tareas antes de que ninguna la reescriba, y una de las dos tareas agregadas se perdería silenciosamente — el mismo patrón de leer-calcular-escribir sin lock que este Tema demuestra con `capacidad["disponible"]`.

**Límites y decisión de uso:** Más concurrencia no implica más velocidad y puede introducir carreras o presión de memoria. Identifica estado compartido y trabajo independiente antes de añadir tareas; compara resultados y recursos con la versión secuencial.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/ejemplo.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

```python
from threading import Thread

capacidad = {"disponible": 10}

def reservar_lugar():
    actual = capacidad["disponible"]
    capacidad["disponible"] = actual - 1

hilos = [Thread(target=reservar_lugar) for _ in range(10)]
[h.start() for h in hilos]
[h.join() for h in hilos]
print(capacidad["disponible"])
```

**Ejecuta el ejemplo** (guarda el código en un archivo y córrelo desde la terminal):

```bash
python3 ejemplo.py
```
Observa la salida impresa y compárala con el resultado esperado.

Resultado esperado: en la mayoría de las corridas, el resultado NO es `0` (el esperado tras 10 reservas de un vehículo con capacidad 10) — algunas actualizaciones se pisan entre sí, y el número exacto varía de ejecución en ejecución.

#### Paso 5 · Práctica guiada
Pista: ese resultado inconsistente del Paso 4 ES el fallo deliberado — corrélo varias veces y anotá que el número final cambia entre corridas (a veces 2, a veces 4, nunca garantizado 0), la firma de una condición de carrera real, no un bug determinista que siempre falla igual.

#### Paso 6 · Práctica independiente
Corregí el Paso 4 envolviendo la lectura-cálculo-escritura en un `Lock()` (como en el ejemplo de `retirar()` de este mismo Tema), y confirmá que ahora el resultado es siempre `0`, sin importar cuántas veces repitas la corrida.

#### Paso 7 · Cierre y evidencia
Entregá el resultado inconsistente del Paso 4-5, y el resultado corregido y determinista del Paso 6; explicá por qué un lock en un solo proceso no alcanzaría si la asignación de vehículos corriera en dos procesos o instancias distintas. Errores comunes: asumir que una línea de código como `capacidad -= 1` es atómica, proteger con un lock de un solo proceso una operación que en realidad corre en varios procesos distintos, y bloquear una sección más grande de la necesaria sacrificando rendimiento sin motivo. Fuentes oficiales: https://docs.python.org/3/library/threading.html.
**¿Por qué es importante?** Porque las pruebas secuenciales de `reservar_lugar()` pueden pasar siempre y el sistema real fallar solo bajo tráfico concurrente — la condición de carrera no se ve leyendo el código línea por línea.
### Tema 3: Linux como entorno observable

#### Paso 1 · Objetivo y preparación
Al finalizar vas a diagnosticar, con herramientas reales de Linux, un servicio mínimo que expone la lógica de `domain.py` como endpoint de salud. Prerrequisitos: Python 3 instalado; Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Si el servicio que calcula rutas para RutaFlow dejara de responder, un operador necesita un flujo real de diagnóstico — no adivinar reiniciando a ciegas y perdiendo la evidencia de qué estaba pasando.

#### Paso 3 · Teoría, modelo mental y analogía
Operar un servicio es como la medicina clínica: observás signos (CPU, puertos, logs) antes de intervenir, en vez de "reiniciar y ver si se arregla".

**Escenario:** Tu worker de validación "usa demasiada memoria" según quejas. Necesitas inspeccionar `/proc/PID/status` para diagnosticar.

**Tu tarea:**
1. ¿Qué es `VmRSS` vs `VmSize`? ¿Cuál es el problema real?
2. ¿Qué es `VmPeak`? ¿Cuándo es útil?
3. Lee `/proc/self/status` en vivo desde tu shell, explica 5 campos.
4. ¿Cómo una fuga de memoria se ve en `/proc`?

[SOLUCIÓN PLEGADA]
> `VmSize`: memoria virtual total; `VmRSS`: resident (realmente usada). Si VmSize >> VmRSS, es fragmentación, no fuga. `VmPeak`: máximo histórico de VmSize. Una fuga se ve como `VmRSS` creciente sin límite. `FDSize`: file descriptors abiertos (fuga de archivos o sockets se vería como FDSize creciente). `Threads`: cantidad de hilos (spike indebido señala paralización descontrolada).

**Conceptos clave:** shell, variable de entorno, pipe, proceso padre, daemon, servicio, log, socket, puerto, healthcheck, CPU, memoria y runbook.

Operar Linux no significa encadenar comandos desconocidos. Formula una pregunta y conserva evidencia. `pwd` responde dónde estás; `id`, con qué identidad; `ps`, qué procesos existen; `ss -ltnp`, qué sockets TCP escuchan; `df -h`, cuánto almacenamiento queda; `free -h`, el estado de memoria; `top`, actividad dinámica.

Un pipe conecta stdout de un proceso con stdin de otro. No comparte memoria:

```bash
ps -eo pid,user,%cpu,%mem,command | sort -k3 -nr | head
curl --fail --silent http://127.0.0.1:8000/health
ss -ltnp
```

`--fail` es la bandera que hace que `curl` termine con error si la respuesta HTTP es un código de fallo (en vez de imprimir la página de error como si fuera éxito), y `--silent` es la bandera que oculta la barra de progreso, dejando solo la respuesta. Un servicio debe escribir logs útiles en stdout/stderr, responder una comprobación de salud y manejar `SIGTERM`. La salud debe indicar si puede cumplir su función, no solo si el proceso existe. Una variable de entorno configura, pero puede aparecer en inspecciones o procesos hijos: no es una caja fuerte. En producción, los secretos pertenecen al gestor de la plataforma y reciben acceso mínimo en ejecución.

**Analogía:** operar un servicio se parece a la medicina clínica: antes de intervenir, se observan signos, se formula una hipótesis y se solicita una prueba capaz de refutarla.

**¿Por qué es importante?** porque reiniciar a ciegas puede ocultar síntomas y destruir la evidencia necesaria para encontrar la causa raíz.

**Casos de uso reales:** localizar quién ocupa un puerto, distinguir falta de CPU de espera de I/O, detectar disco lleno, seguir logs y comprobar un despliegue.

**Diagrama:**

```mermaid
flowchart LR
    REQUEST["petición"] --> PORT["puerto"] --> PROCESS2["proceso"] --> DATA["SQLite / volumen"]
    PROCESS2 --> LOGS["stdout / stderr"]
    PROCESS2 --> HEALTH["/health"]
    PROCESS2 --> METRICS["CPU / memoria"]
```

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** Identifica proceso, puerto y logs del gestor en Linux. Detén únicamente el proceso de laboratorio y conserva el diagnóstico que diferencia aplicación detenida de error en sus datos.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/ejemplo.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

```bash
python3 -m http.server 8000 --directory /tmp &
sleep 1
curl --fail --silent http://127.0.0.1:8000/ > /dev/null && echo "sano"
ss -ltnp | grep 8000
ps -o pid,ppid,%cpu,%mem,command | grep http.server
```
Resultado esperado: `curl --fail` confirma que el servicio responde (`sano`); `ss -ltnp` muestra el puerto `8000` escuchando con su PID; `ps` confirma el mismo proceso con su consumo real de CPU y memoria — tres ángulos distintos del mismo servicio, antes de tocar nada.

#### Paso 5 · Práctica guiada
Pista: matá el proceso con `kill -9 <PID>` y repetí el mismo `curl --fail` — ese es el fallo deliberado reproducido a propósito: el comando termina con error (código de salida distinto de 0) en vez de "sano", confirmando con evidencia, no con una suposición, que el servicio ya no responde.

#### Paso 6 · Práctica independiente
Repetí el Paso 4 completo, pero esta vez redirigiendo la salida del servidor a un log (`> servicio.log 2>&1 &`) y seguilo con `tail -f servicio.log` mientras hacés una petición — documentando qué evidencia adicional te da el log que `ps` y `ss` no muestran.

#### Paso 7 · Cierre y evidencia
Entregá los tres ángulos de diagnóstico del Paso 4, el fallo real confirmado con `curl --fail` del Paso 5, y el log seguido en vivo del Paso 6; explicá por qué reiniciar sin esta evidencia previa puede ocultar la causa raíz de un fallo real. Errores comunes: reiniciar el servicio antes de capturar `ps`, `ss` o los logs, confundir que el proceso exista con que el servicio funcione correctamente, y no diferenciar falta de CPU de espera de I/O antes de diagnosticar. Fuentes oficiales: https://man7.org/linux/man-pages/man8/ss.8.html.
**¿Por qué es importante?** Porque `ps` puede mostrar que el proceso sigue vivo mientras `curl --fail` confirma que ya no responde — sin los tres ángulos de diagnóstico, reiniciar a ciegas destruye la evidencia de qué estaba fallando realmente.
### Tema 4: Contenedores: aislamiento reproducible

#### Paso 1 · Objetivo y preparación
Al finalizar vas a contenerizar `domain.py` de RutaFlow con un usuario sin privilegios y a confirmar que los datos sobreviven a recrear el contenedor. Prerrequisitos: Docker instalado; Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
Si el cálculo de rutas de RutaFlow corriera en un contenedor, necesitaría guardar un caché de rutas calculadas en un volumen — perderlo cada vez que se recrea el contenedor sería inaceptable para un servicio real.

#### Paso 3 · Teoría, modelo mental y analogía
La imagen es una receta sellada; el contenedor es una preparación concreta de esa receta; el volumen es la despensa externa — podés cambiar la cocina (recrear el contenedor) sin perder lo que había en la despensa.

**Escenario:** Tu worker y tu BD corren en el mismo `docker-compose.yml`. Sin límites, el worker consume toda la RAM y mata la BD. Necesitas garantizar 512MB para BD, 256MB para worker.

**Tu tarea:**
1. Escribe `docker-compose.yml` con `limits` y `reservations`.
2. ¿Cuál es la diferencia? (Soft vs hard.)
3. ¿Qué pasa cuando worker se pasa del límite?
4. ¿Cómo monitorearlo sin instrumentación adicional?

[SOLUCIÓN PLEGADA]
> `limits: memory: 256M` es OOMKill hard. `reservations: memory: 256M` es solicitud al scheduler, no hard. Docker-compose usa ambas: reservations para scheduling, limits para evitar OOM. Si se pasa límite, proceso recibe SIGKILL (crash). Monitorear: `docker stats` muestra uso vivo. En Kubernetes, readiness/liveness probes detectan crash; agregar métricas: `RSS / limit` a Prometheus y alertar si > 90%.

**Conceptos clave:** máquina virtual, contenedor, imagen, capa, registro, namespace, cgroup, volumen, red, puerto, usuario no root, build reproducible y cadena de suministro.

Una máquina virtual incluye un sistema operativo invitado. Un contenedor es un conjunto de procesos aislados que **comparte el kernel del host**. Los namespaces separan vistas como procesos, red y mounts; los cgroups limitan o contabilizan recursos. Una imagen es una plantilla inmutable por capas; un contenedor es su ejecución con una capa escribible efímera.

Docker mejora repetibilidad, pero no vuelve segura una aplicación. Dependencias sin fijar cambian entre builds; root aumenta impacto; copiar secretos los conserva en capas; guardar SQLite en la capa efímera pierde datos al recrear. Los datos durables pertenecen a un volumen.

```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN useradd --create-home --uid 10001 appuser
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY src ./src
RUN mkdir /data && chown appuser:appuser /data
USER appuser
ENV INVENTORY_DB=/data/inventory.db
EXPOSE 8000
CMD ["python", "-m", "src.server"]
```

`EXPOSE` documenta; no publica un puerto. `-p 127.0.0.1:8000:8000` conecta host y contenedor. `-v inventory-data:/data` conserva SQLite. `.dockerignore` excluye `.git`, entornos y secretos del contexto. Los límites requieren pruebas: observa si el servicio degrada, rechaza trabajo o termina de forma controlada.

**Analogía:** una imagen es una receta sellada y un contenedor una preparación concreta. El volumen es la despensa externa: puedes sustituir la cocina sin perder ingredientes persistentes.

**¿Por qué es importante?** porque “funciona en mi máquina” suele ocultar diferencias de dependencias, identidad, configuración y filesystem.

**Casos de uso reales:** CI reproducible, despliegue de APIs, herramientas aisladas y entornos desechables. Un contenedor no es una frontera absoluta contra código hostil.

**Diagrama:**

```mermaid
flowchart TB
    KERNEL2["Kernel Linux compartido"] --> C1["contenedor app"]
    KERNEL2 --> C2["otro contenedor"]
    C1 --> PY["proceso Python"] --> VOL["volumen /data"]
    LIMITS["cgroups: límites"] --> C1
    NS["namespaces: vistas"] --> C1
```

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** Empaqueta el gestor y ejecuta su prueba de humo desde un contenedor limpio. Recrea el proceso y comprueba qué datos persisten mediante el volumen, sin depender de archivos de tu equipo.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

#### Paso 4 · Demostración guiada desde cero
```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN useradd --create-home --uid 10001 rutaflow
COPY examples/rutaflow/foundation/domain.py ./domain.py
RUN mkdir /data && chown rutaflow:rutaflow /data
USER rutaflow
CMD ["python", "-c", "from domain import nearest_neighbor_route, Stop; print(nearest_neighbor_route((0,0),[Stop('RF-1',1,1)]))"]
```
```bash
docker build -t rutaflow-rutas .
docker run --rm -v rutaflow-cache:/data rutaflow-rutas
```
Resultado esperado: el contenedor corre como `rutaflow` (UID 10001), nunca como root, e imprime la ruta calculada — el mismo cálculo del Tema 1, ahora empaquetado de forma reproducible.

#### Paso 5 · Práctica guiada
Pista: quitá `USER rutaflow` del Dockerfile y volvé a construir — ese es el fallo deliberado: el proceso dentro del contenedor corre como root, aumentando el impacto de cualquier vulnerabilidad en el código o en una dependencia, exactamente lo que el usuario no privilegiado existía para evitar.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `USER rutaflow`, escribí un archivo dentro de `/data` desde el contenedor, recreá el contenedor por completo (`docker rm` + `docker run` de nuevo con el mismo volumen), y confirmá que el archivo sigue ahí — la prueba de que el volumen, no el contenedor, es lo que persiste.

#### Paso 7 · Cierre y evidencia
Entregá el contenedor corriendo como usuario no root del Paso 4, el root innecesario detectado del Paso 5, y la persistencia confirmada del Paso 6; explicá por qué "funciona en mi máquina" suele ocultar justo estas diferencias de identidad y filesystem. Errores comunes: correr el proceso del contenedor como root por omisión, guardar datos que deben persistir en la capa escribible del contenedor en vez de un volumen, y asumir que `EXPOSE` publica un puerto cuando solo lo documenta. Fuentes oficiales: https://docs.docker.com/develop/develop-images/dockerfile_best-practices/.
**¿Por qué es importante?** Porque un contenedor que corre como root o guarda sus datos en la capa efímera funciona igual en una demo y pierde la base de datos (o amplifica una vulnerabilidad) en el primer `docker rm` real.

### Tema 5: Problemas clásicos de concurrencia: filósofos y lectores-escritores

#### Paso 1 · Objetivo y preparación
Al finalizar podrás reproducir un interbloqueo (deadlock) con la cena de los filósofos, evitarlo imponiendo un orden global de recursos y permitir lecturas concurrentes con exclusión de escritores. Prerrequisito: Tema 2 de este módulo (memoria y concurrencia).

#### Paso 2 · Contexto y caso real
En RutaFlow, cinco despachadores comparten cinco radios y cada uno necesita dos para coordinar una entrega. Un día el sistema se congeló sin errores: cada uno tenía una radio y esperaba la otra. El mismo caso real aparece con bloqueos de base de datos y con locks en servicios. Los libros de *Clean Code* y de sistemas operativos lo enseñan como los problemas clásicos de concurrencia.

#### Paso 3 · Teoría, modelo mental y analogía
Un **interbloqueo** requiere cuatro condiciones a la vez (Coffman): exclusión mutua, retener y esperar, no expropiación y **espera circular**. Romper cualquiera lo evita; la forma más práctica es un **orden global de recursos**: todos toman primero el de menor número, así no puede formarse un ciclo. El problema de **lectores y escritores** permite muchos lectores a la vez pero un solo escritor: el primer lector bloquea a los escritores y el último los libera (esta versión favorece a los lectores y puede dejar esperando a un escritor).

**Analogía:** cinco personas en una mesa redonda con un palillo entre cada par; si todas toman el de su izquierda al mismo tiempo, nadie come nunca.

**Diagrama:**

```mermaid
flowchart LR
    M0[mensajero 0] -- tiene --> R0[radio 0]
    M0 -. espera .-> R1[radio 1]
    M1[mensajero 1] -- tiene --> R1
    M1 -. espera .-> R2[radio 2]
    M4[mensajero 4] -- tiene --> R4[radio 4]
    M4 -. espera .-> R0
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir concurrencia && cd concurrencia
```

Crea `concurrencia_clasica.py`:

```python
import threading, time

# --- Cena de los filósofos: 5 mensajeros comparten 5 radios; cada uno necesita 2 para coordinar
N = 5
radios = [threading.Lock() for _ in range(N)]
comidas = [0] * N

def mensajero(i, rondas=50):
    izquierda, derecha = i, (i + 1) % N
    # Orden global de recursos: siempre tomar primero el de menor número rompe la espera circular
    primero, segundo = min(izquierda, derecha), max(izquierda, derecha)
    for _ in range(rondas):
        with radios[primero]:
            time.sleep(0.001)                  # tiene una radio en la mano y espera la otra
            with radios[segundo]:
                comidas[i] += 1

hilos = [threading.Thread(target=mensajero, args=(i,)) for i in range(N)]
inicio = time.perf_counter()
for h in hilos: h.start()
for h in hilos: h.join(timeout=3)
vivos = sum(h.is_alive() for h in hilos)
print(f"Filósofos: rondas por mensajero={comidas}, hilos bloqueados={vivos}")

# --- Lectores y escritores: muchos leen el tablero a la vez, uno solo escribe
class Tablero:
    def __init__(self):
        self.datos = {"BO-1": "en ruta"}
        self.lectores = 0
        self.mutex = threading.Lock()          # protege el contador de lectores
        self.escritura = threading.Lock()      # exclusión para escritores
        self.max_simultaneos = 0
    def leer(self, guia):
        with self.mutex:
            self.lectores += 1
            if self.lectores == 1: self.escritura.acquire()   # el primer lector bloquea escritores
            self.max_simultaneos = max(self.max_simultaneos, self.lectores)
        time.sleep(0.01)
        valor = self.datos.get(guia)
        with self.mutex:
            self.lectores -= 1
            if self.lectores == 0: self.escritura.release()   # el último lector libera
        return valor
    def escribir(self, guia, estado):
        with self.escritura:
            self.datos[guia] = estado

tablero = Tablero()
lectores = [threading.Thread(target=tablero.leer, args=("BO-1",)) for _ in range(8)]
for h in lectores: h.start()
for h in lectores: h.join()
tablero.escribir("BO-1", "entregado")
print(f"Lectores simultáneos máximos: {tablero.max_simultaneos}, estado final: {tablero.leer('BO-1')}")
```

**Ejecuta el ejemplo:**

```bash
python3 concurrencia_clasica.py
```

**Resultado esperado:**

```text
Filósofos: rondas por mensajero=[50, 50, 50, 50, 50], hilos bloqueados=0
Lectores simultáneos máximos: 8, estado final: entregado
```

Todos completaron sus 50 rondas sin bloquearse. Los 8 lectores leyeron a la vez porque la lectura no excluye a otros lectores.

**Fallo deliberado:** Cambia `primero, segundo = min(izquierda, derecha), max(izquierda, derecha)` por `primero, segundo = izquierda, derecha`. Ahora imprime `Filósofos: rondas por mensajero=[0, 0, 0, 0, 0], hilos bloqueados=5` y el programa **no termina**: cada hilo tiene una radio y espera la del vecino, formando un ciclo. Detenlo con Ctrl+C. El `sleep` dentro del primer bloqueo hace visible un error que, sin él, aparecería solo de vez en cuando.

#### Paso 5 · Práctica guiada
Cuenta cuánto tiempo espera cada mensajero para obtener sus dos radios y muestra el mayor tiempo de espera. **Pista:** mide con `time.perf_counter()` antes del primer `with` y justo dentro del segundo, y guarda el máximo por mensajero.

#### Paso 6 · Práctica independiente
Escribe una versión de lectores-escritores que dé prioridad a los escritores y demuestra con un experimento que un escritor ya no espera indefinidamente.

#### Paso 7 · Cierre y evidencia
Entrega como evidencia la salida real del Paso 4 y la explicación del fallo deliberado. **¿Por qué es importante?** porque los interbloqueos no lanzan errores: congelan sistemas en producción, y reconocer la espera circular es la clave para diagnosticarlos.
**Fuente oficial:** [threading (docs.python.org)](https://docs.python.org/3/library/threading.html), [Dining philosophers problem (Wikipedia)](https://en.wikipedia.org/wiki/Dining_philosophers_problem); Robert C. Martin, *Código limpio*, cap. 13.
**Conceptos clave:** interbloqueo, condiciones de Coffman, espera circular, orden global de recursos, inanición, lectores-escritores, `threading.Lock`.
**Cuándo no usarlo:** si puedes evitar compartir estado (colas, mensajes, datos inmutables), hazlo: es más simple que coordinar locks.

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** protege con un orden fijo de bloqueos la asignación de dos recursos (persona y vehículo) a una tarea.
Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.
**Errores comunes:** tomar los locks en el orden "natural" de cada hilo (izquierda, derecha) en vez de un orden global por número, lo que crea una espera circular y bloquea todo el programa (el fallo deliberado); y usar la versión de lectores-escritores que favorece lectores sin medir que, bajo lectura constante, un escritor puede quedar esperando indefinidamente (inanición).

## Construcción guiada del capítulo

### Proyecto 8 — Inventario operable en un contenedor

Parte de la raíz del proyecto acumulativo. Si no tienes servidor HTTP, crea un adaptador mínimo con `GET /health` y una consulta; no coloques lógica de negocio en las rutas.

1. Crea `Dockerfile`, `.dockerignore` y `compose.yaml` desde archivos vacíos.
2. Fija dependencias, crea un usuario sin privilegios y usa forma exec en `CMD`.
3. Monta un volumen en `/data`; aplica la migración al ejecutar, nunca durante el build.
4. Añade healthcheck con inicio, intervalo, timeout y reintentos razonados.
5. Publica el puerto en `127.0.0.1` durante desarrollo y añade límites de CPU/memoria.
6. Envía `SIGTERM` durante una petición y confirma cierre limpio de SQLite.
7. Ejecuta retiradas simultáneas y demuestra que nunca aparece stock negativo.
8. Recrea el contenedor y prueba persistencia; usa otro volumen para demostrar aislamiento.
9. Escribe `docs/runbook.md`: iniciar, salud, logs, backup, restore, actualización, reversión y fallos comunes.

```yaml
services:
  inventory:
    build: .
    ports: ["127.0.0.1:8000:8000"]
    volumes: ["inventory-data:/data"]
    init: true
    healthcheck:
      test: ["CMD", "python", "-m", "src.healthcheck"]
      interval: 10s
      timeout: 3s
      retries: 3
    mem_limit: 256m
    cpus: 0.50
volumes:
  inventory-data:
```

**Verificación:** conserva la salida de la configuración resuelta, build, usuario, salud, límites, prueba concurrente, señal y recreación con datos. Las pruebas deben pasar fuera y dentro de la imagen. Otra persona debe reproducirlo siguiendo solo el README.

**Errores comunes y soluciones**

- Permiso denegado en `/data`: inspecciona UID/GID; no concedas `777`.
- Solo responde dentro: escucha en `0.0.0.0` dentro y restringe la publicación en el host.
- Datos desaparecen: confirma que SQLite usa la ruta montada.
- `SIGTERM` no llega: usa `CMD` exec y evita una shell como PID 1.
- Carrera pese al lock: un lock local no coordina varios procesos; protege en la base.
