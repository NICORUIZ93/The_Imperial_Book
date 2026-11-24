# Módulo 5: Sistemas operativos, concurrencia, Linux y contenedores

**Entorno comprobado para esta edición (2026-11-24):** OpenJDK 25.0.5.1 (con `jcmd`) y bash 5.2.21 en Linux (Ubuntu 24.04, x86_64, 2 núcleos), procps-ng 4.0.4 (`ps`, `top`, `free`), strace 6.8, lsof 4.95.0, curl 8.5.0, H2 2.3.232, Docker Engine 29.9.3 y Docker Compose v5.7.1. Todas las transcripciones son literales y se ejecutaron como el usuario sin privilegios `estudiante`, en `/home/estudiante/labs/m8` (tu `~/labs/m8`). Los PID, las fechas, los identificadores de contenedor y los tiempos medidos cambian en cada máquina. El equipo de referencia no tenía acceso a Docker Hub: por eso la imagen base de las capturas, `rutaflow/jdk-base:25`, se creó localmente con `jlink` a partir del mismo OpenJDK 25.0.5.1. En tu equipo usa `eclipse-temurin:25-jdk`; las salidas de `docker build` con esa imagen no se capturaron. El `compose.yaml` del proyecto se validó con `docker compose config`, pero no se levantó.

Hasta ahora construiste un inventario, lo protegiste con pruebas y seguridad y separaste su arquitectura. En este
módulo miras **debajo** del código: quién entrega CPU y memoria, cómo dos tareas se estorban, cómo investigar un
servicio en Linux y qué hace realmente Docker. El objetivo no es memorizar comandos, sino formar un modelo mental
para diagnosticar sistemas reales.

Al terminar este módulo podrás:
- inspeccionar un proceso, sus descriptores y sus llamadas al sistema, y detenerlo con la señal adecuada;
- reproducir una condición de carrera con hilos y corregirla con una sección crítica mínima;
- diagnosticar un servicio Linux por sus permisos, su puerto, su memoria y su log;
- construir una imagen que se ejecuta sin root, guarda datos en un volumen y respeta un límite de memoria;
- provocar un interbloqueo y eliminarlo con un orden global de recursos.

**Qué necesitas saber antes:** sistema operativo, programa, proceso, PID, terminal y comando (Módulo 0, Tema 1);
shell, argumento y código de salida (Módulo 0, Tema 4); entrada y salida estándar y tubería (Módulo 0, Tema 5);
métodos, clases y records (Módulo 1); puerto, localhost, cliente y servidor y `jwebserver` (Módulo 3, Tema 1); JDBC
con H2 y registro con `java.util.logging` (Módulo 4).

**Esquema del módulo:**
1. El sistema operativo como administrador y frontera.
2. Memoria y concurrencia sin magia.
3. Linux como entorno observable.
4. Contenedores: aislamiento reproducible.
5. Problemas clásicos de concurrencia: filósofos y lectores-escritores.
6. Proyecto 8: inventario operable en un contenedor.


## Aprende construyendo


### Tema 1: El sistema operativo como administrador y frontera · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- explicar qué hace el núcleo y por qué un programa le pide todo mediante llamadas al sistema;
- lanzar un proceso en segundo plano, inspeccionarlo con `ps` y listar sus descriptores en `/proc`;
- detenerlo con una señal y deducir qué señal recibió a partir de su código de salida;
- escribir un programa que atienda `SIGTERM` y se apague sin dejar trabajo a medias.

**Conceptos clave:** núcleo, llamada al sistema, descriptor de archivo, redirección, proceso en segundo plano, señal, ps, kill

#### El problema
El cálculo de rutas de RutaFlow tarda varios minutos con miles de paradas. La coordinadora lo deja corriendo en el
servidor y sigue trabajando en la misma terminal. Luego necesita saber si sigue vivo, dónde escribe sus mensajes y
cómo detenerlo sin dañar los datos. Ver solo el archivo `.java` no responde ninguna de esas preguntas.

Este tema usa lo que ya conoces: **sistema operativo**, **proceso**, **PID** y **terminal** tienen ficha en el
Módulo 0, Tema 1; **shell** y **código de salida**, en el Módulo 0, Tema 4; **entrada estándar y salida estándar**,
en el Módulo 0, Tema 5. Aquí no se redefinen.

#### Glosario del tema

**núcleo (kernel)**
- **Definición técnica:** parte del sistema operativo que se ejecuta con privilegio máximo; controla CPU, memoria y dispositivos y atiende las peticiones de los procesos.
- **En palabras sencillas:** el único empleado con llave de todas las salas; los demás le piden lo que necesitan.
- **Dónde se rompe la comparación:** no aparece en `ps` como un proceso más; trabaja por debajo de todos ellos.
- **Ejemplo:** `uname -r` muestra su versión; en el equipo de referencia, `6.18.44-fc-v819`.
- **Error típico:** creer que Java escribe directamente en el disco; la JVM siempre se lo pide al núcleo.

**llamada al sistema**
- **Definición técnica:** petición formal que un proceso hace al núcleo para usar un recurso protegido: abrir un archivo (`openat`), escribir (`write`), cerrar (`close`) o crear procesos.
- **En palabras sencillas:** un trámite en ventanilla: el proceso no entra al archivero; pide y el núcleo responde.
- **Dónde se rompe la comparación:** un trámite tarda minutos; una llamada tarda microsegundos, aunque cuesta más que una suma.
- **Ejemplo:** `IO.println("registro guardado")` terminó en `write(1</dev/pts/0>, "registro guardado\n", 18) = 18` (Problema resuelto 1.2).
- **Error típico:** buscar el fallo en Java cuando lo rechazó el núcleo: `AccessDeniedException` es la respuesta del núcleo, traducida por Java.

**descriptor de archivo**
- **Definición técnica:** número entero que el núcleo entrega a un proceso al abrir un archivo, una terminal o una conexión; el proceso lo usa en las llamadas siguientes.
- **En palabras sencillas:** la ficha del guardarropa: entregas la ficha 3 y te devuelven tu abrigo.
- **Dónde se rompe la comparación:** cada proceso tiene su propia numeración; el 3 de un proceso no es el 3 de otro.
- **Ejemplo:** todo proceso nace con 0 (entrada estándar), 1 (salida estándar) y 2 (salida de errores, *stderr*); el siguiente archivo abierto recibe el menor número libre. La JVM ya ocupa el 3 con sus propios módulos.
- **Error típico:** abrir archivos sin cerrarlos; al llegar al límite aparece `FileSystemException: a.txt: Too many open files`. Usa `try (...)` para cerrarlos siempre.

**redirección**
- **Definición técnica:** instrucción del shell que conecta un descriptor del proceso con un archivo antes de ejecutarlo: `>` redirige el 1, `2>` el 2 y `2>&1` envía el 2 adonde ya apunta el 1.
- **En palabras sencillas:** cambiar la dirección del correo: lo que iba a la terminal llega a un archivo.
- **Dónde se rompe la comparación:** el programa no se entera del cambio; sigue escribiendo en su descriptor 1.
- **Ejemplo:** con `java Lento.java > proceso.log 2>&1 &`, los descriptores 1 y 2 apuntan a `proceso.log`.
- **Error típico:** invertir el orden (`2>&1 > proceso.log`): los errores siguen saliendo por la terminal.

**proceso en segundo plano**
- **Definición técnica:** proceso lanzado con `&` al final del comando; el shell no espera a que termine y devuelve el control de inmediato. La variable `$!` guarda su PID.
- **En palabras sencillas:** dejar la lavadora funcionando mientras haces otra cosa en la casa.
- **Dónde se rompe la comparación:** si cierras la terminal, el shell suele terminar también sus procesos en segundo plano.
- **Ejemplo:** al lanzar `Lento.java`, bash respondió `[1] 7629`: trabajo número 1, PID 7629.
- **Error típico:** escribir con un `BufferedWriter` sin `flush()` ni `close()` y ver el log vacío: el texto se queda en memoria hasta acumular suficiente.

**señal**
- **Definición técnica:** notificación asíncrona que el núcleo entrega a un proceso. Cada una tiene nombre y número: `SIGINT` (2) es Ctrl+C, `SIGKILL` (9) obliga a terminar y `SIGTERM` (15) lo pide.
- **En palabras sencillas:** un timbre: `SIGTERM` dice «por favor, cierra»; `SIGKILL` es cortar la luz.
- **Dónde se rompe la comparación:** `SIGKILL` no se puede atender ni ignorar; el proceso no alcanza a guardar nada.
- **Ejemplo:** tras `kill -TERM`, `echo $?` mostró `143`, es decir 128 + 15.
- **Error típico:** usar `kill -9` como primera opción: el proceso muere sin cerrar archivos ni terminar el envío en curso.

**ps y kill**
- **Definición técnica:** `ps` lista procesos con las columnas que pides (`-o pid,ppid,stat,etime,command`); `kill` envía una señal a un PID, por defecto `SIGTERM`.
- **En palabras sencillas:** `ps` es la lista de asistencia; `kill` es el timbre de una puerta concreta.
- **Dónde se rompe la comparación:** pese al nombre, `kill` solo entrega la señal; el proceso decide qué hacer, salvo con `SIGKILL`.
- **Ejemplo:** `ps -o pid,ppid,stat,etime,command -p "$PID"` mostró el estado `Sl` (dormido, con varios hilos) y como padre el PID de la terminal.
- **Error típico:** usar un PID viejo: `kill -TERM 999999` responde `bash: kill: (999999) - No such process`.

#### ► CÓMO FUNCIONA
El sistema operativo tiene dos zonas. En la zona de usuario viven los procesos: tu programa, la terminal, el shell.
En la zona del núcleo vive el único código que toca el hardware. La frontera entre ambas son las llamadas al sistema.

1. El shell pide al núcleo crear un proceso y, si hay redirección, conecta sus descriptores 1 y 2 a un archivo.
2. La JVM abre archivos con `openat`; el núcleo comprueba permisos y devuelve el menor descriptor libre.
3. Cada `IO.println` o escritura en un archivo se convierte en una llamada `write` sobre un descriptor.
4. Cuando llega una señal, el núcleo interrumpe al proceso: si tiene un manejador, lo ejecuta; si no, lo termina. La JVM trae su propio manejador para `SIGTERM` y `SIGINT`: ejecuta los *shutdown hooks* del programa y luego sale.
5. Al terminar, el núcleo informa al padre un código: si murió por la señal N, el shell muestra 128 + N. La JVM imita esa regla: tras `SIGTERM` sale con 143 aunque haya cerrado ordenadamente.

```mermaid
flowchart LR
    SHELL["shell (bash)"] -->|"crea y redirige 1 y 2"| PROC["proceso java Lento.java"]
    PROC -->|"openat / write / close"| KERNEL["núcleo"]
    KERNEL -->|"descriptor 3"| PROC
    KERNEL --> DISK["disco: proceso.log"]
    KERNEL --> CPU["CPU y memoria"]
    KILL["kill -TERM PID"] -->|"señal 15"| KERNEL
    KERNEL -->|"entrega la señal"| PROC
    PROC -->|"código 143 = 128 + 15"| SHELL
```

#### Problema resuelto 1.1
Lanza un cálculo de ruta largo en segundo plano, comprueba que vive, mira adónde escribe y detenlo con `SIGTERM`.

**Razonamiento:**
1. Hace falta un programa que tarde: el cálculo `vecinoMasCercano` con miles de paradas y una pausa inicial.
2. El `&` lo deja en segundo plano; `$!` guarda su PID para no copiarlo a mano.
3. `ps -p` informa su estado; `/proc/PID/fd` muestra a qué apunta cada descriptor.
4. `kill -TERM` lo detiene y `wait` recupera su código de salida.

```java
// Ruta.java — cálculo de ruta mínimo de RutaFlow
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

class Ruta {
    record Parada(String guia, double latitud, double longitud) {}

    /** Heurística educativa O(n²); no afirma encontrar la ruta óptima. */
    static List<Parada> vecinoMasCercano(double origenLat, double origenLon, List<Parada> paradas) {
        List<Parada> pendientes = new ArrayList<>(paradas);
        List<Parada> ordenadas = new ArrayList<>();
        double lat = origenLat, lon = origenLon;
        while (!pendientes.isEmpty()) {
            final double desdeLat = lat, desdeLon = lon;
            Parada elegida = pendientes.stream()
                    .min(Comparator.comparingDouble(p -> Math.hypot(p.latitud() - desdeLat, p.longitud() - desdeLon)))
                    .orElseThrow();
            ordenadas.add(elegida);
            pendientes.remove(elegida);
            lat = elegida.latitud();
            lon = elegida.longitud();
        }
        return ordenadas;
    }
}
```

```java
// Lento.java — un cálculo de ruta que tarda lo suficiente para observarlo
void main() throws InterruptedException {
    List<Ruta.Parada> paradas = new ArrayList<>();
    for (int i = 0; i < 3000; i++) {
        paradas.add(new Ruta.Parada("RF-" + i, i * 0.01, i * 0.01));
    }
    IO.println("pid=" + ProcessHandle.current().pid() + " paradas=" + paradas.size());
    Thread.sleep(30_000);
    List<Ruta.Parada> ruta = Ruta.vecinoMasCercano(0, 0, paradas);
    IO.println("primera parada: " + ruta.getFirst().guia());
}
```

```text
$ echo $$
7624
$ java Lento.java > proceso.log 2>&1 &
[1] 7629
$ PID=$!
$ sleep 2
$ ps -o pid,ppid,stat,etime,command -p "$PID"
  PID  PPID STAT     ELAPSED COMMAND
 7629  7624 Sl         00:04 java Lento.java
$ cat proceso.log
pid=7629 paradas=3000
$ ls -l /proc/$PID/fd
total 0
lrwx------ 1 estudiante estudiante 64 Nov 24 23:22 0 -> /dev/pts/0
l-wx------ 1 estudiante estudiante 64 Nov 24 23:22 1 -> /home/estudiante/labs/m8/proceso.log
l-wx------ 1 estudiante estudiante 64 Nov 24 23:22 2 -> /home/estudiante/labs/m8/proceso.log
lr-x------ 1 estudiante estudiante 64 Nov 24 23:22 3 -> /usr/lib/jvm/java-25-openjdk-amd64/lib/modules
$ kill -TERM "$PID"
$ wait "$PID"
[1]+  Exit 143                java Lento.java > proceso.log 2>&1
$ echo $?
143
```

**Explicación por partes.**
- `Ruta.java`: es el cálculo de ruta del curso. Con 3000 paradas compara cada parada pendiente en cada paso. Es una clase normal porque `Lento.java` la usa desde otro archivo.
- `Lento.java`, líneas 3–6: crea 3000 paradas en diagonal. Línea 7: `ProcessHandle.current().pid()` es el PID que el núcleo le asignó al proceso.
- `Lento.java`, línea 8: la pausa de 30 segundos te da tiempo de observar el proceso antes de que calcule.
- `echo $$` muestra el PID de la terminal (`7624`); `ps` confirma que es el padre (columna `PPID`).
- `STAT` vale `Sl`: `S`, el proceso duerme dentro de `Thread.sleep`; `l`, tiene varios hilos, porque la JVM arranca los suyos además de `main`. `ELAPSED` cuenta el tiempo vivo.
- `/proc/7629/fd` muestra los descriptores: el 0 sigue en la terminal (`/dev/pts/0`), el 1 y el 2 van al log y el 3 es el archivo de módulos del JDK, que la JVM abre al arrancar.
- `wait` espera al hijo y deja su código en `$?`: `143` significa «terminó por la señal 15». Bash escribe `Exit 143` y no `Terminated` porque la JVM atendió la señal y salió por su cuenta con ese código.

> **Error común.** Enviar una señal a un proceso ajeno. `kill -TERM 1` responde
> `bash: kill: (1) - Operation not permitted`. El PID existe, pero pertenece a otro usuario y el núcleo rechaza la
> petición. Si el mensaje es `No such process`, el problema es otro: ese PID ya no existe.

> **Prevenir errores.** Guarda el PID con `PID=$!` justo después del `&`. Copiar el número a mano es la forma más
> común de detener el proceso equivocado.

#### Problema resuelto 1.2
Comprueba con evidencia que Java no escribe directamente en el disco ni en la terminal: le pide al núcleo.

**Razonamiento:**
1. `strace` registra cada llamada al sistema de un proceso con sus argumentos y su resultado; `-f` sigue también a los hilos, y la JVM tiene muchos.
2. Un programa pequeño que abre un archivo, escribe y avisa en la terminal produce pocas llamadas interesantes.
3. Con `-o traza.txt` la traza va a un archivo; `grep` filtra las líneas del registro y las escrituras.
4. `-y` muestra a qué ruta apunta cada descriptor, así no hay que adivinarlo.

```java
// Guardar.java — registra una entrega en un archivo y avisa en la terminal
void main() throws IOException {
    Files.writeString(Path.of("entregas.txt"), "RF-4471 entregado\n",
            StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    IO.println("registro guardado");
}
```

```text
$ strace -f -y -o traza.txt -e trace=openat,write,close java Guardar.java
registro guardado
$ grep -E 'entregas|registro' traza.txt
7688  openat(AT_FDCWD</home/estudiante/labs/m8>, "entregas.txt", O_WRONLY|O_CREAT|O_APPEND, 0666) = 4</home/estudiante/labs/m8/entregas.txt>
7688  write(4</home/estudiante/labs/m8/entregas.txt>, "RF-4471 entregado\n", 18) = 18
7688  close(4</home/estudiante/labs/m8/entregas.txt>) = 0
7688  write(1</dev/pts/0>, "registro guardado\n", 18) = 18
$ wc -l traza.txt
270 traza.txt
$ grep -c 'openat' traza.txt
134
```

**Explicación por partes.**
- Líneas 3–4: `Files.writeString` con `CREATE` y `APPEND` se convierte en `openat` con `O_CREAT` (crear si falta) y `O_APPEND` (agregar al final).
- El núcleo responde `= 4`: el menor descriptor libre. El 3 lo tiene la JVM, como viste en `/proc`.
- `write(4, ...)` es la escritura del texto; el `= 18` confirma que escribió 18 bytes. Después, `close(4)` libera el descriptor.
- Línea 5: `IO.println` es un `write` sobre el descriptor 1, que apunta a la terminal.
- El número al inicio de cada línea (`7688`) es el hilo que hizo la llamada; con `-f`, `strace` los distingue así.
- `wc -l` cuenta 270 líneas y 134 son `openat`: casi todas son la JVM abriendo sus propias bibliotecas y compilando el archivo.

> **Buena práctica.** Cuando un programa «no encuentra» un archivo que sí existe, mira la llamada `openat` en la
> traza. Muestra la ruta exacta que pidió y la respuesta del núcleo, sin suposiciones.

#### Problema resuelto 1.3
Haz que el procesador de envíos atienda `SIGTERM`: debe terminar el envío en curso, informar y salir ordenadamente.

**Razonamiento:**
1. Java no registra manejadores de señales directamente. Ofrece algo más portable: un *shutdown hook*, un hilo
   que la JVM ejecuta cuando recibe `SIGTERM` o `SIGINT`, o cuando el programa termina normalmente.
2. El hook no corta el trabajo: marca `detener = true` y espera a que `main` avise que cerró su envío.
3. El bucle revisa la marca entre envíos; así nunca se interrumpe un envío a la mitad.
4. Para comparar, se envía `SIGKILL` a `Lento.java`, que no puede atenderla.

```java
// Apagado.java — procesa envíos y se detiene limpio al recibir SIGTERM
import java.util.concurrent.CountDownLatch;

volatile boolean detener = false;
int procesados = 0;

void main() throws InterruptedException {
    CountDownLatch terminado = new CountDownLatch(1);
    Runtime.getRuntime().addShutdownHook(new Thread(() -> {
        IO.println("apagado pedido; termino el envío actual");
        detener = true;
        try {
            terminado.await();                       // espera a que main cierre su envío
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
        }
    }));
    IO.println("pid=" + ProcessHandle.current().pid() + " procesando envíos");
    while (!detener) {
        Thread.sleep(500);                           // simula procesar un envío
        procesados++;
    }
    IO.println("apagado limpio: " + procesados + " envíos procesados");
    terminado.countDown();
}
```

```text
$ java Apagado.java > apagado.log &
[1] 7728
$ PID=$!
$ sleep 3
$ kill -TERM "$PID"
$ wait "$PID"
[1]+  Exit 143                java Apagado.java > apagado.log
$ echo $?
143
$ cat apagado.log
pid=7728 procesando envíos
apagado pedido; termino el envío actual
apagado limpio: 10 envíos procesados
$ java Lento.java > proceso.log 2>&1 &
[1] 7768
$ PID=$!
$ sleep 2
$ kill -KILL "$PID"
$ wait "$PID"
[1]+  Killed                  java Lento.java > proceso.log 2>&1
$ echo $?
137
```

**Explicación por partes.**
- Línea 4: `volatile` garantiza que `main` vea el cambio que hace otro hilo, el del hook. Sin esa palabra, `main` podría seguir viendo `false` (lo estudiarás en el Tema 2).
- Línea 8: `CountDownLatch(1)` es una puerta con un cerrojo: `await` espera hasta que alguien llame `countDown` una vez.
- Líneas 9–17: registra el hook. Al llegar `SIGTERM`, la JVM lo arranca: avisa, marca `detener` y espera en la línea 13.
- Líneas 19–22: el bucle revisa `detener` antes de cada envío; el envío en curso siempre termina.
- Líneas 23–24: `main` informa y abre la puerta; el hook termina y la JVM sale.
- `Exit 143`: aunque el cierre fue ordenado, la JVM sale con 128 + 15 para avisar que la detuvo una señal. Docker y los orquestadores tratan 143 como un apagado normal.
- `Killed` y `137` (128 + 9): esta vez lo terminó el núcleo, sin ejecutar nada del programa.

> **Error común.** Esperar que `SIGKILL` ejecute el hook. Bash informa `Killed` y el código es `137`; la línea
> «apagado limpio» nunca se escribe. Ningún programa puede atender `SIGKILL`.

> **Buena práctica.** Detén servicios con `SIGTERM`, espera unos segundos y usa `SIGKILL` solo si no responde.
> Docker y los orquestadores siguen la misma secuencia al apagar un contenedor.

#### Checkpoint 1.1
Un proceso de RutaFlow termina y `echo $?` muestra `137`. ¿Qué señal recibió y quién pudo enviarla?

Respuesta: `SIGKILL` (137 − 128 = 9). La envió alguien con `kill -KILL` o el propio núcleo, por ejemplo al superar
un límite de memoria (lo verás en el Tema 4).

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Ejecuta `mkdir -p ~/labs/m8 && cd ~/labs/m8`. Crea `Ruta.java` y `Lento.java` con el código del Problema resuelto 1.1.

#### Paso 2 · Lanza y observa
Ejecuta `echo $$`, luego `java Lento.java > proceso.log 2>&1 &` y `PID=$!`. Ejecuta el `ps` del problema resuelto y
comprueba que el `PPID` coincide con el número de `echo $$`.

#### Paso 3 · Mira los descriptores
Ejecuta `ls -l /proc/$PID/fd` antes de que pasen 30 segundos. Comprueba que el 1 y el 2 apuntan a `proceso.log`.
En macOS no existe `/proc`; usa `lsof -p $PID`.

#### Paso 4 · Detén y lee el código
Ejecuta `kill -TERM "$PID"`, `wait "$PID"` y `echo $?`. Debes ver `143`.

#### Paso 5 · Traza las llamadas al sistema
Crea `Guardar.java` y ejecuta el `strace` del Problema resuelto 1.2. Si responde `command not found`, instálalo con
`sudo apt install strace`. En macOS no hay `strace`; el equivalente aproximado es `dtruss`, que exige permisos extra.

#### Paso 6 · Apaga limpio
Crea `Apagado.java`, lánzalo en segundo plano y envíale `SIGTERM` a los tres segundos. Revisa `apagado.log` y el código.

#### Resumen
- El **núcleo** es la parte privilegiada del sistema operativo; los procesos le piden todo con **llamadas al sistema**.
- Un **descriptor de archivo** es el número que identifica un archivo abierto dentro de un proceso: 0, 1 y 2 vienen de fábrica.
- La **redirección** (`>`, `2>&1`) cambia adónde apuntan los descriptores sin que el programa se entere.
- Un **proceso en segundo plano** (`&`) libera la terminal; `$!` guarda su PID.
- Una **señal** pide (`SIGTERM`) u obliga (`SIGKILL`) a terminar; el código 128 + N delata la señal N. En Java, `SIGTERM` y `SIGINT` se atienden con un *shutdown hook*.
- **ps** muestra estado y padre de un proceso; **kill** entrega una señal, no necesariamente lo mata.

#### Ejercicio verificable 1
Básico. Ejecuta `java Lento.java` en primer plano y pulsa Ctrl+C antes de 30 segundos. ¿Qué código de salida
muestra `echo $?` y por qué?

Respuesta esperada: `130`. Ctrl+C envía `SIGINT` (2) y 128 + 2 = 130. La JVM no imprime ninguna traza de pila: atiende
la señal, ejecuta los hooks que haya (aquí ninguno) y sale.

#### Ejercicio verificable 2
Intermedio. Con `Lento.java` corriendo en segundo plano, ejecuta `ls /proc/$PID/fd | wc -l` y luego
`ls /proc/$PID/task | wc -l`. ¿Qué cuenta cada uno y por qué el segundo es mucho mayor que 1?

Respuesta esperada: el primero cuenta descriptores abiertos (4: los tres de fábrica y los módulos del JDK). El
segundo cuenta hilos: la JVM arranca, además de `main`, hilos para el recolector de basura, el compilador JIT y otras
tareas internas. Por eso `ps` mostró la `l` en `Sl`. El número exacto depende de tu máquina.

#### Ejercicio verificable 3
Reto. Ejecuta `Apagado.java` en primer plano y pulsa Ctrl+C. ¿Se ejecuta el hook? ¿Qué código de salida obtienes?

Respuesta esperada: sí. La JVM ejecuta los mismos hooks con `SIGINT` que con `SIGTERM`: se imprime
`apagado pedido; termino el envío actual`, luego «apagado limpio», y el código es `130` (128 + 2). No hace falta
registrar nada más.

#### En el trabajo
En los servidores de RutaFlow, los servicios se detienen con `SIGTERM` durante cada despliegue. Un servicio que no lo
atiende pierde los envíos en curso o deja archivos a medias. En Java, eso significa registrar un *shutdown hook*
o usar un framework, como Spring Boot, que lo registra por ti. Ante un fallo raro, el equipo de operaciones revisa
`ps`, los descriptores en `/proc` y, si hace falta, una traza con `strace`.

</details>

### Tema 2: Memoria y concurrencia sin magia · Avanzado · 70 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- demostrar que los hilos de un proceso comparten memoria y que dos procesos no;
- distinguir concurrencia de paralelismo midiendo el mismo trabajo con hilos y con procesos;
- provocar una condición de carrera real con hilos de Java y explicar el valor incorrecto;
- corregirla con un cerrojo alrededor de la sección crítica mínima, con un contador atómico y con una actualización atómica en la base de datos.

**Conceptos clave:** hilo, memoria compartida, concurrencia, paralelismo, visibilidad y atomicidad, condición de carrera, sección crítica, cerrojo

#### El problema
Un vehículo de RutaFlow tiene 10 lugares. Diez repartidores reservan un lugar al mismo tiempo desde la aplicación.
Cada reserva lee los lugares libres, resta uno y guarda el resultado. Al final deberían quedar 0 lugares, pero el
sistema dice que quedan 9. Nadie cambió el código: solo llegaron todos a la vez.

Este tema usa **proceso** y **PID** (Módulo 0, Tema 1), **método** (Módulo 1, Tema 4), **`System.nanoTime`** para
medir (Módulo 2, Tema 4) y el ***shutdown hook*** con `volatile` del Tema 1. Aquí no se redefinen.

#### Glosario del tema

**hilo**
- **Definición técnica:** secuencia de ejecución dentro de un proceso; todos los hilos de un proceso comparten su memoria y sus descriptores, pero cada uno tiene su propia pila de llamadas.
- **En palabras sencillas:** varios cocineros en la misma cocina, usando la misma despensa.
- **Dónde se rompe la comparación:** los cocineros se ven y se avisan; los hilos no saben nada del otro salvo que tú los coordines.
- **Ejemplo:** `new Thread(() -> registrar("RF-1"))` crea un hilo que ejecuta `registrar("RF-1")` al llamar a `start()`.
- **Error típico:** olvidar `join()`: el programa principal imprime el resultado antes de que los hilos terminen.

**memoria compartida**
- **Definición técnica:** región de memoria que varios flujos de ejecución pueden leer y escribir; los hilos de un proceso la comparten por defecto, los procesos no.
- **En palabras sencillas:** una pizarra en la pared de la cocina: lo que uno escribe, los demás lo ven.
- **Dónde se rompe la comparación:** en una pizarra ves a alguien escribiendo; en memoria, dos escrituras pueden pisarse sin rastro.
- **Ejemplo:** en `Memoria.java`, el hilo agrega `RF-1` y el principal lo ve; el proceso hijo agrega `RF-2` y el principal no.
- **Error típico:** esperar que un proceso hijo modifique una lista del padre: trabaja en su propia memoria.

**concurrencia**
- **Definición técnica:** propiedad de un programa con varias tareas en curso cuyos pasos pueden intercalarse en cualquier orden, avancen o no al mismo instante.
- **En palabras sencillas:** un cocinero que alterna entre tres ollas: todas avanzan, pero atiende una a la vez.
- **Dónde se rompe la comparación:** el cocinero elige cuándo cambiar de olla; el planificador del sistema decide por ti.
- **Ejemplo:** diez hilos que reservan un lugar son concurrentes aunque el equipo tenga un solo núcleo: sus pasos se intercalan.
- **Error típico:** creer que más hilos siempre terminan antes.

**paralelismo**
- **Definición técnica:** ejecución simultánea de varias tareas en distintos núcleos de CPU en el mismo instante.
- **En palabras sencillas:** dos cocineros con dos estufas: cada uno cocina su olla al mismo tiempo.
- **Dónde se rompe la comparación:** repartir y juntar el trabajo cuesta tiempo; dos núcleos casi nunca dan la mitad exacta.
- **Ejemplo:** en `Paralelo.java`, dos hilos hicieron en 1.57 s lo que en secuencia tardó 3.40 s.
- **Error típico:** esperar paralelismo de una tarea que espera disco o red; ahí la CPU no es el límite.

**visibilidad y atomicidad**
- **Definición técnica:** dos garantías distintas entre hilos. **Visibilidad**: que un hilo vea el valor que otro escribió (`volatile` la da). **Atomicidad**: que una operación de varios pasos, como `total++` (leer, sumar, escribir), ocurra entera sin que otro hilo se meta en medio (`AtomicInteger` o un cerrojo la dan).
- **En palabras sencillas:** visibilidad es que todos lean la misma pizarra; atomicidad es que nadie escriba en ella mientras tú borras y reescribes.
- **Dónde se rompe la comparación:** en la pizarra ambas cosas vienen juntas; en Java son independientes y una no trae la otra.
- **Ejemplo:** con `volatile int total`, cuatro hilos que hacen `total++` un millón de veces cada uno dieron `2,472,248`, no `4,000,000`.
- **Error típico:** creer que `volatile` hace segura una suma compartida; solo garantiza ver el último valor, no que el `++` sea indivisible.

**condición de carrera**
- **Definición técnica:** defecto en el que el resultado depende del orden en que se intercalan operaciones concurrentes sobre un dato compartido.
- **En palabras sencillas:** dos personas leen «quedan 10», cada una escribe «quedan 9», y una reserva desaparece.
- **Dónde se rompe la comparación:** entre personas se nota; en un programa el error aparece a veces y casi nunca en tu equipo.
- **Ejemplo:** `java Carrera.java 1` mostró `lugares disponibles: 9 (esperado: 0)` en una de sus ejecuciones.
- **Error típico:** dar por correcto un programa porque pasó tres ejecuciones seguidas.

**sección crítica**
- **Definición técnica:** fragmento de código que accede a un dato compartido y debe ejecutarse por un solo hilo a la vez para mantener el dato válido.
- **En palabras sencillas:** el baño con una sola llave: mientras alguien está adentro, los demás esperan.
- **Dónde se rompe la comparación:** la sección debe incluir lectura y escritura juntas; proteger solo una no sirve.
- **Ejemplo:** en `CarreraLock.java`, las líneas 11–13 (leer, pausar, escribir) forman la sección crítica.
- **Error típico:** hacerla enorme: si incluye trabajo que no toca el dato, los hilos esperan sin necesidad.

**cerrojo (lock)**
- **Definición técnica:** objeto de sincronización (`ReentrantLock`) con dos operaciones: `lock` lo toma o espera hasta que esté libre, y `unlock` lo libera. Java también tiene la forma corta `synchronized (objeto) { ... }`, que toma y libera el cerrojo propio de un objeto.
- **En palabras sencillas:** la llave del baño: quien la tiene entra; los demás hacen fila.
- **Dónde se rompe la comparación:** solo quien tomó la llave puede devolverla; si otro hilo lo intenta, Java lo trata como error.
- **Ejemplo:** `candado.lock()` con `unlock()` en un `finally` deja `lugares disponibles: 0 (esperado: 0)` en `CarreraLock.java`.
- **Error típico:** liberar un cerrojo que el hilo no tiene: `unlock()` lanza `IllegalMonitorStateException`.

#### ► CÓMO FUNCIONA
Restar un lugar parece una sola operación, pero son tres: **leer** el valor, **calcular** el nuevo y **escribirlo**.
Si un hilo pierde la CPU entre leer y escribir, otro hilo lee el mismo valor viejo. Las dos escrituras guardan el
mismo resultado y una reserva se pierde.

1. El hilo A lee 10 y el planificador lo pausa.
2. El hilo B lee 10, calcula 9 y escribe 9.
3. El hilo A despierta, calcula 9 con su valor viejo y escribe 9.
4. Hubo dos reservas, pero el contador solo bajó una vez.

Un cerrojo convierte los tres pasos en una sección crítica: B no puede leer hasta que A haya escrito.

```mermaid
sequenceDiagram
    participant A as Hilo A
    participant S as disponible
    participant B as Hilo B
    A->>S: leer 10
    Note over A: pausa (sleep o cambio de hilo)
    B->>S: leer 10
    B->>S: escribir 9
    A->>S: escribir 9
    Note over S: incorrecto 9, esperado 8
```

#### Problema resuelto 2.1
Demuestra que un hilo ve los cambios del programa principal y que un proceso hijo no.

**Razonamiento:**
1. Una lista en un campo del programa sirve de dato compartido.
2. Un hilo y un proceso hijo ejecutan el mismo método, que agrega una guía y muestra cuántas ve.
3. Java no puede copiar un proceso en marcha: un proceso hijo es otra JVM que arranca desde cero. El mismo archivo
   sirve para los dos papeles: si recibe los argumentos `hijo RF-2`, solo registra y termina.
4. Al final, el principal muestra la lista: solo contendrá lo que agregaron quienes comparten su memoria.

```java
// Memoria.java — los hilos comparten memoria; los procesos no
List<String> entregas = new ArrayList<>();

void registrar(String guia) {
    entregas.add(guia);
    IO.println("PID " + ProcessHandle.current().pid() + " agregó " + guia + "; ve " + entregas.size() + " entrega(s)");
}

void main(String[] args) throws Exception {
    if (args.length == 2 && args[0].equals("hijo")) {
        registrar(args[1]);                                  // así trabaja el proceso hijo
        return;
    }
    IO.println("proceso principal PID " + ProcessHandle.current().pid());
    Thread hilo = new Thread(() -> registrar("RF-1"));
    hilo.start();
    hilo.join();
    Process hijo = new ProcessBuilder("java", "Memoria.java", "hijo", "RF-2").inheritIO().start();
    hijo.waitFor();
    IO.println("el principal ve: " + entregas);
}
```

```text
$ java Memoria.java
proceso principal PID 7937
PID 7937 agregó RF-1; ve 1 entrega(s)
PID 7958 agregó RF-2; ve 1 entrega(s)
el principal ve: [RF-1]
```

**Explicación por partes.**
- Líneas 15–17: el hilo corre dentro del mismo proceso; por eso informa el mismo PID 7937.
- Línea 18: `ProcessBuilder` arranca otra JVM (PID 7958) con `java Memoria.java hijo RF-2`; `inheritIO` hace que escriba en la misma terminal.
- Líneas 10–13: el hijo entra por esta rama. Su memoria es nueva: su lista empieza vacía y por eso ve una sola entrega, la suya.
- Línea 20: el principal ve `[RF-1]`. Lo que hizo el hijo desapareció al terminar.
- En otros lenguajes, un proceso hijo puede nacer como **copia** del padre (llamada `fork`) y vería también `RF-1`. Pero ni siquiera así comparte: sus cambios tampoco volverían al padre.

#### Problema resuelto 2.2
Mide si dos hilos o dos procesos terminan antes que hacer dos cálculos seguidos en una CPU de 2 núcleos.

**Razonamiento:**
1. Un cálculo que solo usa CPU (sumar restos) evita esperas de disco o red.
2. Se mide primero en secuencia, luego con dos hilos y luego con dos procesos.
3. Si los hilos son paralelos, deberían tardar cerca de la mitad.
4. Una vuelta de calentamiento antes de medir deja que el compilador JIT optimice `calcular` (Módulo 2, Tema 4).

```java
// Paralelo.java — mismo trabajo en secuencia, con hilos y con procesos
long calcular() {
    long total = 0;
    for (long i = 0; i < 2_000_000_000L; i++) {
        total += i % 7;
    }
    return total;
}

double medirHilos() throws InterruptedException {
    long inicio = System.nanoTime();
    Thread a = new Thread(this::calcular);
    Thread b = new Thread(this::calcular);
    a.start();
    b.start();
    a.join();
    b.join();
    return (System.nanoTime() - inicio) / 1e9;
}

double medirProcesos() throws Exception {
    long inicio = System.nanoTime();
    Process a = new ProcessBuilder("java", "Paralelo.java", "uno").start();
    Process b = new ProcessBuilder("java", "Paralelo.java", "uno").start();
    a.waitFor();
    b.waitFor();
    return (System.nanoTime() - inicio) / 1e9;
}

void main(String[] args) throws Exception {
    if (args.length == 1) {                     // modo hijo: un solo cálculo
        calcular();
        return;
    }
    calcular();                                 // calentamiento: deja que el JIT compile calcular
    long inicio = System.nanoTime();
    calcular();
    calcular();
    IO.println(String.format(Locale.ROOT, "secuencial:   %.2f s", (System.nanoTime() - inicio) / 1e9));
    IO.println(String.format(Locale.ROOT, "dos hilos:    %.2f s", medirHilos()));
    IO.println(String.format(Locale.ROOT, "dos procesos: %.2f s", medirProcesos()));
}
```

```text
$ nproc
2
$ java Paralelo.java
secuencial:   3.40 s
dos hilos:    1.57 s
dos procesos: 3.19 s
```

**Explicación por partes.**
- Línea 4: 2000 millones de vueltas; el contador es `long` porque no cabe en un `int`.
- Líneas 10–19: dos hilos ejecutan `calcular` a la vez; `this::calcular` pasa el método como tarea.
- Líneas 21–28: dos procesos hijos, cada uno una JVM con `java Paralelo.java uno`.
- Dos hilos tardan menos de la mitad de la secuencia: los hilos de Java son paralelos de verdad y cada uno usó un núcleo.
- Dos procesos casi no mejoran: cada JVM nueva tiene que arrancar, compilar el archivo y calentar su JIT desde cero, y eso cuesta más de un segundo.

> **Rendimiento.** En Java, para trabajo de CPU dentro de un programa, usa hilos (o un `ExecutorService`, que
> los reparte por ti). Los procesos separados convienen cuando necesitas aislamiento: que el fallo de uno no tumbe
> al otro, o límites de memoria distintos.

#### Problema resuelto 2.3
Reproduce la reserva simultánea del vehículo y obtén un resultado incorrecto con hilos reales de Java.

**Razonamiento:**
1. Diez hilos ejecutan la reserva: leer, esperar un instante, escribir.
2. La pausa entre leer y escribir representa cualquier trabajo intermedio (consultar otra tabla, registrar un log).
3. Un argumento permite elegir la pausa en milisegundos y repetir el experimento.
4. Como segundo caso, un contador sin pausas: cuatro hilos que suman 1 un millón de veces cada uno.

```java
// Carrera.java — diez repartidores reservan un lugar del mismo vehículo a la vez
int disponible = 10;
long pausaMs;

void reservarLugar() {
    int actual = disponible;                    // 1. leer
    dormir(pausaMs);                            // 2. el hilo puede ser interrumpido aquí
    disponible = actual - 1;                    // 3. escribir
}

void dormir(long milisegundos) {
    try {
        Thread.sleep(milisegundos);
    } catch (InterruptedException error) {
        Thread.currentThread().interrupt();
    }
}

void main(String[] args) throws InterruptedException {
    pausaMs = args.length > 0 ? Long.parseLong(args[0]) : 0;
    List<Thread> hilos = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        hilos.add(new Thread(this::reservarLugar));
    }
    for (Thread h : hilos) h.start();
    for (Thread h : hilos) h.join();
    IO.println("lugares disponibles: " + disponible + " (esperado: 0)");
}
```

```java
// Contador.java — cuatro hilos suman 1 un millón de veces cada uno, sin pausas
int total = 0;

void sumar() {
    for (int i = 0; i < 1_000_000; i++) {
        total++;
    }
}

void main() throws InterruptedException {
    List<Thread> hilos = new ArrayList<>();
    for (int i = 0; i < 4; i++) {
        hilos.add(new Thread(this::sumar));
    }
    for (Thread h : hilos) h.start();
    for (Thread h : hilos) h.join();
    IO.println(String.format(Locale.ROOT, "total = %,d (esperado: 4,000,000)", total));
}
```

```text
$ java Carrera.java
lugares disponibles: 5 (esperado: 0)
$ for i in 1 2 3 4 5; do java Carrera.java 1; done
lugares disponibles: 6 (esperado: 0)
lugares disponibles: 8 (esperado: 0)
lugares disponibles: 6 (esperado: 0)
lugares disponibles: 9 (esperado: 0)
lugares disponibles: 7 (esperado: 0)
$ for i in 1 2 3; do java Contador.java; done
total = 3,990,285 (esperado: 4,000,000)
total = 3,986,195 (esperado: 4,000,000)
total = 3,986,507 (esperado: 4,000,000)
```

**Explicación por partes.**
- `Carrera.java`, línea 20: `args[0]` es la pausa en milisegundos; sin argumento vale `0`.
- Líneas 6–8: los tres pasos separados. Durante `Thread.sleep`, otro hilo lee el mismo valor viejo.
- Líneas 11–17: `dormir` envuelve `Thread.sleep`, que obliga a atender `InterruptedException`; si llega, se restaura la marca de interrupción.
- Con pausa `0` quedaron 5: hasta `sleep(0)` cede el turno, y el resultado cambia en cada ejecución.
- Con pausa `1`, varios hilos leen el mismo valor antes de que otro escriba. El resultado varía según cuánto tardó en arrancar cada hilo.
- `Contador.java` perdió unas 10 000 sumas cada vez, sin ninguna pausa: `total++` son tres pasos y los hilos corren a la vez en los dos núcleos.

> **Error común.** Marcar el contador como `volatile` y creer que con eso basta. Con `volatile int total`, el mismo
> `Contador.java` dio `total = 2,472,248 (esperado: 4,000,000)`: `volatile` asegura que cada hilo lea el último valor,
> pero no que leer, sumar y escribir ocurran juntos. Para un contador usa `AtomicInteger` y `incrementAndGet()`, que
> da `4,000,000` siempre.

> **Prevenir errores.** Para probar código concurrente, agranda la ventana a propósito con una pausa entre leer y
> escribir, y repite la prueba muchas veces. Un error que aparece «a veces» en producción aparece siempre así.

#### Problema resuelto 2.4
Corrige `Carrera.java` para que cualquier pausa deje 0 lugares, y mide el costo de la corrección.

**Razonamiento:**
1. El dato compartido es `disponible`; leerlo y escribirlo debe ocurrir sin interrupciones de otro hilo.
2. Un `ReentrantLock` compartido protege esos tres pasos: es la sección crítica mínima.
3. Con la pausa dentro de la sección, los hilos se forman en fila: el tiempo debería ser cercano a 10 × pausa.

```java
// CarreraLock.java — la misma reserva, protegida con un cerrojo
import java.util.concurrent.locks.ReentrantLock;

int disponible = 10;
long pausaMs;
final ReentrantLock candado = new ReentrantLock();

void reservarLugar() {
    candado.lock();                             // solo un hilo a la vez pasa de aquí
    try {
        int actual = disponible;
        dormir(pausaMs);
        disponible = actual - 1;
    } finally {
        candado.unlock();                       // se libera aunque haya una excepción
    }
}

void dormir(long milisegundos) {
    try {
        Thread.sleep(milisegundos);
    } catch (InterruptedException error) {
        Thread.currentThread().interrupt();
    }
}

void main(String[] args) throws InterruptedException {
    pausaMs = args.length > 0 ? Long.parseLong(args[0]) : 0;
    List<Thread> hilos = new ArrayList<>();
    for (int i = 0; i < 10; i++) {
        hilos.add(new Thread(this::reservarLugar));
    }
    long inicio = System.nanoTime();
    for (Thread h : hilos) h.start();
    for (Thread h : hilos) h.join();
    IO.println("lugares disponibles: " + disponible + " (esperado: 0)");
    IO.println(String.format(Locale.ROOT, "tiempo: %.3f s", (System.nanoTime() - inicio) / 1e9));
}
```

```text
$ for i in 1 2 3; do java CarreraLock.java 1; done
lugares disponibles: 0 (esperado: 0)
tiempo: 0.014 s
lugares disponibles: 0 (esperado: 0)
tiempo: 0.015 s
lugares disponibles: 0 (esperado: 0)
tiempo: 0.014 s
```

**Explicación por partes.**
- Línea 6: un único cerrojo compartido por todos los hilos. Un cerrojo por hilo no protegería nada.
- Línea 9: `lock()` toma el cerrojo o espera a que se libere.
- Líneas 10–13: leer, pausar y escribir quedan juntos; ningún otro hilo lee un valor viejo.
- Líneas 14–16: `unlock()` va en `finally`, así se libera aunque el código de adentro lance una excepción.
- El tiempo, unos 0.014 s, se acerca a 10 × 0.001 s: la corrección convierte la concurrencia en una fila.

> **Buena práctica.** Escribe siempre `candado.lock();` seguido de `try { ... } finally { candado.unlock(); }`. Si
> el código de adentro lanza una excepción y el `unlock` no está en `finally`, el cerrojo queda tomado para siempre y
> los demás hilos esperan sin fin. La forma `synchronized (candado) { ... }` libera sola.

#### Problema resuelto 2.5
El inventario guarda el stock en una base H2, como en el Módulo 4. Doce pedidos retiran una unidad de un producto
con 10 en stock. Garantiza que se acepten exactamente 10 y que el stock nunca sea negativo.

**Razonamiento:**
1. Leer el stock en Java y luego escribirlo repetiría la carrera de `Carrera.java`.
2. Un solo `UPDATE ... WHERE stock >= ?` lee, compara y escribe dentro de la base, en una sola sentencia atómica.
3. Si ninguna fila cumple la condición, `executeUpdate` devuelve 0: el pedido se rechaza.
4. Cada hilo abre su propia conexión; los contadores de resultados también son compartidos y son `AtomicInteger`.
5. El programa necesita el jar de H2 en el classpath. Descárgalo una vez de Maven Central
   (`com.h2database:h2:2.3.232`) y guárdalo en `~/herramientas`.

```java
// RetiroSql.java — doce pedidos retiran stock de la misma fila en H2
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.concurrent.atomic.AtomicInteger;

final String URL = "jdbc:h2:./stock";
final AtomicInteger aceptados = new AtomicInteger();
final AtomicInteger rechazados = new AtomicInteger();

boolean retirar(Connection conexion, int productoId, int cantidad) throws SQLException {
    String sql = "UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?";
    try (PreparedStatement orden = conexion.prepareStatement(sql)) {
        orden.setInt(1, cantidad);
        orden.setInt(2, productoId);
        orden.setInt(3, cantidad);
        return orden.executeUpdate() == 1;               // filas cambiadas: 1 o 0
    }
}

void pedido() {
    try (Connection conexion = DriverManager.getConnection(URL)) {
        if (retirar(conexion, 1, 1)) {
            aceptados.incrementAndGet();
        } else {
            rechazados.incrementAndGet();
        }
    } catch (SQLException error) {
        throw new IllegalStateException(error);
    }
}

void main() throws Exception {
    try (Connection base = DriverManager.getConnection(URL); Statement sql = base.createStatement()) {
        sql.execute("DROP TABLE IF EXISTS productos");
        sql.execute("CREATE TABLE productos (id INT PRIMARY KEY, stock INT NOT NULL)");
        sql.execute("INSERT INTO productos VALUES (1, 10)");
    }
    List<Thread> hilos = new ArrayList<>();
    for (int i = 0; i < 12; i++) {
        hilos.add(new Thread(this::pedido));
    }
    for (Thread h : hilos) h.start();
    for (Thread h : hilos) h.join();
    try (Connection base = DriverManager.getConnection(URL); Statement sql = base.createStatement()) {
        var fila = sql.executeQuery("SELECT stock FROM productos WHERE id = 1");
        fila.next();
        IO.println("aceptados=" + aceptados + " rechazados=" + rechazados + " stock final: " + fila.getInt(1));
    }
}
```

```text
$ java -cp ~/herramientas/h2-2.3.232.jar RetiroSql.java
aceptados=10 rechazados=2 stock final: 0
$ java -cp ~/herramientas/h2-2.3.232.jar RetiroSql.java
aceptados=10 rechazados=2 stock final: 0
```

**Explicación por partes.**
- Línea 9: `jdbc:h2:./stock` guarda la base en el archivo `stock.mv.db` de la carpeta actual.
- Líneas 14–19: la condición `stock >= ?` va dentro del `UPDATE`; la base nunca deja el stock en negativo. `PreparedStatement` llena los `?` con valores, sin pegar texto.
- Línea 19: `executeUpdate` devuelve cuántas filas cambió; 0 significa que no había stock.
- Línea 24: cada hilo abre su propia conexión y la cierra al terminar.
- Líneas 10–11 y 26–28: los contadores son `AtomicInteger`; `incrementAndGet` suma sin carrera.
- La condición en SQL protege incluso contra otros procesos; un cerrojo de Java solo coordinaría los hilos de este proceso.

#### Checkpoint 2.1
En `CarreraLock.java` mueves `dormir(pausaMs)` fuera del cerrojo, antes de `lock()`. ¿Sigue siendo correcto el
resultado? ¿Cambia el tiempo?

Respuesta: sigue siendo correcto, porque leer y escribir quedan juntos dentro del cerrojo. El tiempo baja, porque las
pausas ocurren a la vez fuera de la sección crítica. Con `10` ms, el equipo de referencia pasó de `0.104 s` a
`0.020 s`: por eso conviene que la sección sea mínima.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Comparte y separa memoria
En `~/labs/m8`, crea `Memoria.java` y ejecútalo. Comprueba que el hilo informa el mismo PID que el principal.

#### Paso 2 · Mide concurrencia y paralelismo
Ejecuta `nproc` para saber cuántos núcleos tienes y luego `java Paralelo.java`. Con un solo núcleo, los hilos no
mejoran; con cuatro, agrega dos hilos más en `medirHilos` y compara.

#### Paso 3 · Provoca la carrera
Crea `Carrera.java` y `Contador.java`, y ejecuta los bucles `for` (la carrera con pausa `1`). Anota los resultados.

#### Paso 4 · Corrígela
Crea `CarreraLock.java` y repite el bucle. Todos los resultados deben ser 0. Luego cambia el contador por `AtomicInteger` y comprueba `4,000,000`.

#### Paso 5 · Deja que la base decida
Crea `RetiroSql.java` y ejecútalo dos veces. Consulta la base con la consola que trae H2:
`java -cp ~/herramientas/h2-2.3.232.jar org.h2.tools.Shell -url jdbc:h2:./stock -sql "SELECT * FROM productos"`.
Debe mostrar `1  | 0`: el stock es 0.

#### Resumen
- Un **hilo** ejecuta dentro de un proceso y comparte su memoria; un proceso hijo trabaja sobre una copia.
- La **memoria compartida** es lo que permite a los hilos colaborar y, a la vez, estorbarse.
- **Concurrencia** es intercalar tareas; **paralelismo** es ejecutarlas en el mismo instante en varios núcleos.
- Los hilos de Java son paralelos de verdad: aceleran trabajo de CPU y, por lo mismo, se estorban sin coordinación. `volatile` da **visibilidad**; la **atomicidad** la dan `AtomicInteger` o un cerrojo.
- Una **condición de carrera** aparece cuando leer y escribir un dato compartido pueden intercalarse.
- Un **cerrojo** alrededor de la **sección crítica** mínima la elimina; en una base, una sentencia `UPDATE ... WHERE` atómica.

#### Ejercicio verificable 1
Básico. Ejecuta `java CarreraLock.java 10`. Antes, predice el tiempo.

Respuesta esperada: `lugares disponibles: 0 (esperado: 0)` y un tiempo cercano a 0.1 s (en el equipo de
referencia, `0.104 s`): diez hilos en fila con 10 ms cada uno.

#### Ejercicio verificable 2
Intermedio. En `RetiroSql.java`, cambia `i < 12` por `i < 15`. ¿Cuántos pedidos se aceptan y cuántos se
rechazan?

Respuesta esperada: `aceptados=10 rechazados=5 stock final: 0`. El stock inicial es 10; la condición del `UPDATE`
rechaza los cinco pedidos sobrantes.

#### Ejercicio verificable 3
Reto. En `CarreraLock.java`, alguien protege con el cerrojo **solo la lectura** y deja fuera la pausa y la
escritura. Escribe esa versión, ejecútala con `10` y explica el resultado.

Respuesta esperada: muestra `lugares disponibles: 9 (esperado: 0)`. El cerrojo impide leer a la vez, pero cada hilo
lee 10 y lo suelta antes de escribir; la sección crítica debe incluir lectura y escritura.

#### En el trabajo
Las reservas de cupos, el stock y los saldos son los lugares típicos de una condición de carrera en una empresa
de envíos. Casi nunca aparecen en pruebas locales y sí en un día de alta demanda. Los equipos las previenen con
actualizaciones atómicas en la base y con pruebas concurrentes que agrandan la ventana a propósito.

</details>

### Tema 3: Linux como entorno observable · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- leer los permisos de un archivo en `ls -l` y cambiarlos con `chmod` para ejecutar un script o proteger un secreto;
- comprobar qué usuario ejecuta un proceso y qué puede hacer otro usuario con tus archivos;
- diagnosticar un servicio por su proceso, su puerto en escucha, su memoria y su log;
- leer el estado del equipo con `free`, `top` y el sistema de archivos `/proc`.

**Conceptos clave:** usuario, grupo, permisos, chmod, sistema de archivos, /proc, RSS, top, free, lsof

#### El problema
El servicio de seguimiento de RutaFlow dejó de responder en el servidor. Hay tres sospechas: el script de
comprobación no se ejecuta, el puerto lo ocupa otro proceso o el servicio se quedó sin memoria. Además, un archivo
con un token de mapas quedó legible para todos. Necesitas evidencia para cada sospecha, no intuiciones.

Este tema usa **proceso** y **PID** (Módulo 0, Tema 1), **ruta** (Módulo 0, Tema 3), **puerto**, **localhost** y
**curl** (Módulo 3, Tema 1), **registro** (Módulo 5, Tema 1) y las **señales** del Tema 1 de este módulo.

#### Glosario del tema

**usuario y grupo**
- **Definición técnica:** un usuario es una identidad numérica (UID) con la que el núcleo decide qué puede hacer cada proceso; un grupo (GID) reúne usuarios para darles permisos en común.
- **En palabras sencillas:** el carné de cada empleado y el área a la que pertenece.
- **Dónde se rompe la comparación:** el núcleo no lee nombres, solo números; el nombre es una traducción guardada en `/etc/passwd`.
- **Ejemplo:** `id` mostró `uid=30033(estudiante) gid=30033(estudiante) groups=30033(estudiante),996(docker)`.
- **Error típico:** trabajar siempre como `root` (UID 0): el núcleo no le niega nada y un error borra lo que sea.

**permisos**
- **Definición técnica:** nueve bits por archivo, en tres grupos de lectura (`r`), escritura (`w`) y ejecución (`x`): para el dueño, para su grupo y para los demás.
- **En palabras sencillas:** tres listas de quién puede leer, cambiar o usar algo: tú, tu área y el resto.
- **Dónde se rompe la comparación:** en una carpeta, `x` no significa ejecutar, sino poder entrar a ella.
- **Ejemplo:** `-rwxr--r--` en `estado.sh`: el dueño lee, escribe y ejecuta; grupo y demás solo leen.
- **Error típico:** ejecutar un script sin `x`: `bash: ./estado.sh: Permission denied`.

**chmod**
- **Definición técnica:** comando que cambia los bits de permiso; acepta forma simbólica (`u+x`) u octal (`600`), donde cada cifra suma 4 (r), 2 (w) y 1 (x).
- **En palabras sencillas:** el candado con tres diales: uno para ti, uno para tu área y uno para el resto.
- **Dónde se rompe la comparación:** solo el dueño (o `root`) puede girar los diales de un archivo.
- **Ejemplo:** `chmod 600 secreto.env` deja `-rw-------`: solo el dueño lee y escribe.
- **Error típico:** «arreglar» todo con `chmod 777`: cualquier usuario del equipo puede cambiar el archivo.

**sistema de archivos**
- **Definición técnica:** estructura con la que el núcleo organiza datos en un dispositivo como un árbol de carpetas y archivos, con dueño, permisos y fechas. Cada uno se monta en una carpeta del árbol.
- **En palabras sencillas:** el sistema de estanterías y etiquetas de una bodega.
- **Dónde se rompe la comparación:** algunos no guardan nada en disco: `/proc` los inventa el núcleo cuando los lees.
- **Ejemplo:** `df -hT /home /proc` mostró `ext4` montado en `/` y `proc` montado en `/proc`.
- **Error típico:** buscar en el disco un archivo de `/proc`: desaparece en cuanto termina el proceso.

**`/proc`**
- **Definición técnica:** sistema de archivos virtual de Linux que expone como texto el estado del núcleo y de cada proceso, en `/proc/PID/`.
- **En palabras sencillas:** una ventana a la oficina del núcleo, con una carpeta por proceso.
- **Dónde se rompe la comparación:** la ventana muestra el instante actual; si vuelves a leer, los números cambian.
- **Ejemplo:** `grep -E 'State|VmRSS|Threads' /proc/$PID/status` mostró `State: S (sleeping)`.
- **Error típico:** buscarlo en macOS; allí no existe y se usan `ps` y `lsof`.

**RSS (memoria residente)**
- **Definición técnica:** *Resident Set Size*; cantidad de memoria RAM física que ocupa un proceso en este momento, en kilobytes.
- **En palabras sencillas:** cuánto espacio de la mesa de trabajo está usando ese proceso ahora.
- **Dónde se rompe la comparación:** la memoria compartida con otros procesos se cuenta en cada uno; la suma de RSS exagera.
- **Ejemplo:** el servidor de prueba tenía `RSS 19912` en `ps` y `VmRSS: 19912 kB` en `/proc`.
- **Error típico:** confundir RSS con `VIRT` de `top`: la memoria virtual reservada casi nunca está toda en uso.

**top y free**
- **Definición técnica:** `top` muestra carga, tareas, CPU y memoria del sistema y la lista de procesos; con `-b -n1` imprime una sola vez. `free -h` resume la RAM total, usada y disponible.
- **En palabras sencillas:** el tablero de control del equipo: cuánto trabaja y cuánta mesa queda libre.
- **Dónde se rompe la comparación:** `free` baja aunque nada falle: Linux usa la RAM libre como caché y la devuelve al pedirla.
- **Ejemplo:** `free -h` mostró `available 7.3Gi`; esa columna, no `free`, dice cuánta memoria pueden pedir los procesos.
- **Error típico:** leer `load average: 0.46` como porcentaje; es el promedio de procesos listos o en ejecución.

**lsof**
- **Definición técnica:** *list open files*; lista descriptores abiertos de los procesos, incluidos los sockets de red. Con `-iTCP:PUERTO -sTCP:LISTEN` muestra quién escucha en un puerto.
- **En palabras sencillas:** preguntar quién tiene la llave del apartamento 8765.
- **Dónde se rompe la comparación:** solo ve los procesos de tu usuario, salvo que lo ejecutes como `root`.
- **Ejemplo:** `lsof -nP -iTCP:8765 -sTCP:LISTEN` mostró `jwebserve 9027 estudiante ... TCP 127.0.0.1:8765 (LISTEN)`.
- **Error típico:** arrancar un segundo servidor en un puerto ocupado: `java.net.BindException: Address already in use`.

#### ► CÓMO FUNCIONA
Cada vez que un proceso toca un archivo, el núcleo compara el UID del proceso con el dueño del archivo. Si coinciden,
usa los permisos del dueño; si el proceso pertenece al grupo, los del grupo; si no, los de los demás. Cuando un
servicio no responde, se recorre la cadena desde afuera hacia adentro.

1. **Petición:** `curl` contra el puerto dice si alguien responde.
2. **Puerto:** `lsof` dice qué proceso escucha ahí.
3. **Proceso:** `ps` y `/proc/PID/status` dicen su estado, su usuario y su memoria.
4. **Log:** la salida redirigida dice qué peticiones llegaron y qué errores hubo.
5. **Equipo:** `free` y `top` dicen si el problema es de todo el servidor.

```mermaid
flowchart LR
    REQ["curl a 127.0.0.1:8765"] --> PORT["puerto 8765<br/>lsof"]
    PORT --> PROC["proceso jwebserver<br/>ps, /proc/PID/status"]
    PROC --> LOG["servicio.log<br/>stdout y stderr"]
    PROC --> RES["CPU y memoria<br/>top, free"]
    PROC --> FILES["archivos<br/>permisos y dueño"]
```

#### Problema resuelto 3.1
El script `estado.sh` no se ejecuta y `secreto.env` es legible por cualquiera. Arregla ambos y comprueba qué ve
otro usuario del servidor, `repartidor`.

**Razonamiento:**
1. `ls -l` muestra los permisos actuales; `id` muestra quién eres.
2. Para ejecutar `./estado.sh` falta el bit `x` del dueño: `chmod u+x`.
3. El secreto solo debe leerlo su dueño: `chmod 600`.
4. La prueba real es intentar leer y escribir como el otro usuario.

```bash
#!/bin/bash
# estado.sh — informa si el servicio de RutaFlow responde
curl --fail --silent http://127.0.0.1:8765/ > /dev/null && echo "servicio sano" || echo "servicio caído"
```

```text
$ id
uid=30033(estudiante) gid=30033(estudiante) groups=30033(estudiante),996(docker)
$ ls -l
total 8
-rw-r--r-- 1 estudiante estudiante 178 Nov 24 07:33 estado.sh
-rw-r--r-- 1 estudiante estudiante  19 Nov 24 07:33 secreto.env
$ ./estado.sh
bash: ./estado.sh: Permission denied
$ chmod u+x estado.sh
$ ls -l estado.sh
-rwxr--r-- 1 estudiante estudiante 178 Nov 24 07:33 estado.sh
$ ./estado.sh
servicio caído
$ chmod 600 secreto.env
$ ls -l secreto.env
-rw------- 1 estudiante estudiante 19 Nov 24 07:33 secreto.env
```

Ahora, en una sesión del usuario `repartidor`:

```text
$ whoami
repartidor
$ cat /home/estudiante/labs/m8/servicio/secreto.env
cat: /home/estudiante/labs/m8/servicio/secreto.env: Permission denied
$ head -2 /home/estudiante/labs/m8/servicio/estado.sh
#!/bin/bash
# estado.sh — informa si el servicio de RutaFlow responde
$ echo "otra línea" >> /home/estudiante/labs/m8/servicio/estado.sh
bash: /home/estudiante/labs/m8/servicio/estado.sh: Permission denied
```

**Explicación por partes.**
- `estado.sh`, línea 1: `#!/bin/bash` indica qué intérprete ejecuta el archivo cuando lo llamas como `./estado.sh`.
- `estado.sh`, línea 3: `&&` ejecuta el `echo` sano si `curl` termina con 0; `||` ejecuta el otro si falla.
- La primera columna de `ls -l` empieza con `-` (archivo normal) y sigue con los nueve bits: dueño, grupo, demás.
- «servicio caído» es correcto: todavía no hay servidor. El script ya se ejecuta.
- `repartidor` cae en «demás»: con `600` no lee el secreto; con `r--` lee el script, pero no puede escribirlo.
- El grupo `docker` de `id` permite usar Docker en el Tema 4.

> **Error común.** Corregir `Permission denied` con `sudo`. Si `./estado.sh` falla, el problema es el bit `x`, no
> tus privilegios; con `sudo` el script corre como `root` y oculta el error real.

> **Buena práctica.** Los archivos con secretos (`.env`, claves) van con `600` y fuera del repositorio. Revísalo con
> `stat -c "%A %a %U %G %n" secreto.env`, que mostró
> `-rw------- 600 estudiante estudiante secreto.env`.

#### Problema resuelto 3.2
Diagnostica el servicio de seguimiento de principio a fin: arráncalo, comprueba que responde y ubica su proceso,
su puerto, su memoria y su log. Luego provoca y lee el error de puerto ocupado.

**Razonamiento:**
1. `jwebserver`, el servidor de archivos del JDK (Módulo 3), sirve la carpeta; basta un `index.html` con `ok`.
2. Se recorre la cadena del Cómo funciona: petición, puerto, proceso, log.
3. Un segundo servidor en el mismo puerto reproduce el fallo típico de un reinicio a medias.
4. Al final se detiene con `SIGTERM` y el script debe decir «caído».

```text
$ echo "ok" > index.html
$ jwebserver -p 8765 > servicio.log 2>&1 &
[1] 9027
$ PID=$!
$ sleep 2
$ curl --fail --silent http://127.0.0.1:8765/ && echo "sano"
ok
sano
$ ./estado.sh
servicio sano
$ lsof -nP -iTCP:8765 -sTCP:LISTEN
COMMAND    PID       USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
jwebserve 9027 estudiante    5u  IPv4  40034      0t0  TCP 127.0.0.1:8765 (LISTEN)
$ ps -o pid,user,stat,%cpu,%mem,rss,command -p "$PID"
  PID USER     STAT %CPU %MEM   RSS COMMAND
 9027 estudia+ Sl    4.3  0.7 61332 jwebserver -p 8765
$ grep -E 'State|VmRSS|Threads' /proc/$PID/status
State:	S (sleeping)
VmRSS:	   61332 kB
Threads:	22
$ cat servicio.log
Binding to loopback by default. For all interfaces use "-b 0.0.0.0" or "-b ::".
Serving /home/estudiante/labs/m8/servicio and subdirectories on 127.0.0.1 port 8765
URL http://127.0.0.1:8765/
127.0.0.1 - - [24/Nov/2026:23:28:33 +0000] "GET / HTTP/1.1" 200 -
127.0.0.1 - - [24/Nov/2026:23:28:34 +0000] "GET / HTTP/1.1" 200 -
$ jwebserver -p 8765 2>&1 | tail -1
Error: server config failed: java.net.BindException: Address already in use
$ kill -TERM "$PID"
$ wait "$PID"
[1]+  Exit 143                jwebserver -p 8765 > servicio.log 2>&1
$ ./estado.sh
servicio caído
```

**Explicación por partes.**
- `lsof`: la columna `FD` vale `5u`: el socket que escucha es el descriptor 5, abierto para leer y escribir. `jwebserve` es el nombre recortado a nueve letras.
- `TCP 127.0.0.1:8765 (LISTEN)`: escucha solo en localhost. El propio log lo avisa en su primera línea: para todas las interfaces hace falta `-b 0.0.0.0`.
- `ps`: `estudia+` es `estudiante` recortado; `RSS 61332` son unos 60 MB de RAM física. Una JVM con el servidor cargado ocupa más que un programa pequeño en C, aunque no haga nada.
- `/proc/PID/status` confirma lo mismo desde el núcleo y añade que el servidor tiene 22 hilos: los de la JVM más los que atienden peticiones.
- El log tiene, después de las tres líneas de arranque, una línea por la petición de `curl` y otra por la de `estado.sh`. El `200` es «correcto».
- El segundo servidor falla al pedir el puerto: el núcleo ya se lo había dado al PID 9027.
- `Exit 143`: igual que en el Tema 1, la JVM atendió `SIGTERM` y salió con 128 + 15.

> **Error común.** Reiniciar un servicio sin detener el anterior. El nuevo termina con
> `Error: server config failed: java.net.BindException: Address already in use`. Busca al dueño del puerto con `lsof -nP -iTCP:8765 -sTCP:LISTEN`
> y detenlo con `SIGTERM` antes de arrancar otra vez.

#### Problema resuelto 3.3
Antes de culpar al servicio, comprueba si el servidor completo tiene problemas de memoria, de carga o de disco.

**Razonamiento:**
1. `free -h` responde «¿queda memoria?».
2. Las primeras cinco líneas de `top` resumen carga, tareas, CPU y memoria.
3. `df -hT` muestra los sistemas de archivos y su espacio libre.
4. `/proc/loadavg` da la carga en crudo, útil para scripts.

```text
$ free -h
               total        used        free      shared  buff/cache   available
Mem:           7.8Gi       564Mi       6.1Gi        13Mi       1.4Gi       7.3Gi
Swap:             0B          0B          0B
$ top -b -n1 | head -5
top - 07:33:12 up 21 min,  0 user,  load average: 0.46, 0.31, 0.16
Tasks:  79 total,   1 running,  78 sleeping,   0 stopped,   0 zombie
%Cpu(s):  0.0 us,  0.0 sy,  0.0 ni,100.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st 
MiB Mem :   8023.6 total,   6288.9 free,    564.4 used,   1440.0 buff/cache     
MiB Swap:      0.0 total,      0.0 free,      0.0 used.   7459.2 avail Mem 
$ df -hT /home /proc
Filesystem     Type  Size  Used Avail Use% Mounted on
/dev/vda       ext4  252G   13G   30G  30% /
proc           proc     0     0     0    - /proc
$ cat /proc/loadavg
0.58 0.34 0.18 1/132 5195
```

**Explicación por partes.**
- `free`: de 7.8 GiB hay 7.3 GiB disponibles; los 1.4 GiB de `buff/cache` se devuelven si un proceso los pide.
- `top`, línea 1: los tres números de `load average` son promedios de 1, 5 y 15 minutos; con 2 núcleos, 0.46 es poca carga.
- `top`, línea 3: `100.0 id` significa CPU ociosa; `wa` alto indicaría procesos esperando disco.
- `df`: `/home` vive en el sistema `ext4` montado en `/`; `/proc` mide 0 porque no ocupa disco.
- `/proc/loadavg`: además de las tres cargas, `1/132` son procesos en ejecución sobre el total y `5195` el último PID creado.

> **Prevenir errores.** Guarda estas cinco salidas cuando abras un incidente. Comparar con la foto de un día normal
> vale más que cualquier umbral memorizado.

#### Checkpoint 3.1
`ls -l reporte.csv` muestra `-rw-r-----`, con dueño `estudiante` y grupo `rutaflow`. ¿Puede leerlo `repartidor`,
que pertenece al grupo `rutaflow`? ¿Puede modificarlo?

Respuesta: puede leerlo, porque el grupo tiene `r--`. No puede modificarlo: el grupo no tiene `w`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta del servicio
Ejecuta `mkdir -p ~/labs/m8/servicio && cd ~/labs/m8/servicio`. Crea `estado.sh` y un `secreto.env` con una línea
inventada, por ejemplo `TOKEN_MAPAS=abc123`.

#### Paso 2 · Arregla los permisos
Intenta `./estado.sh`, lee el error y corrígelo con `chmod u+x`. Protege el secreto con `chmod 600` y compruébalo
con `ls -l`.

#### Paso 3 · Prueba con otro usuario
Si tienes permisos de administrador, crea un usuario de prueba con `sudo useradd -m repartidor` y entra con
`sudo -iu repartidor`. Repite los tres intentos del Problema resuelto 3.1. Si no puedes crear usuarios, omite este paso.

#### Paso 4 · Diagnostica el servicio
Ejecuta la secuencia del Problema resuelto 3.2 en orden. Anota el PID, el puerto, el RSS y las líneas del log.

#### Paso 5 · Toma la foto del equipo
Ejecuta `free -h`, `top -b -n1 | head -5` y `df -hT /home`. En macOS, `free` no existe; usa `vm_stat` y `top -l 1 | head -10`.

#### Resumen
- Cada proceso actúa como un **usuario** y un **grupo**; el núcleo decide con números (UID y GID), no con nombres.
- Los **permisos** `rwx` se aplican al dueño, al grupo y a los demás; **chmod** los cambia en forma simbólica u octal.
- Un **sistema de archivos** se monta en una carpeta del árbol; **`/proc`** es uno virtual con el estado de cada proceso.
- **RSS** es la RAM física que usa un proceso ahora; **top** y **free** muestran la carga y la memoria del equipo.
- **lsof** dice qué proceso escucha en un puerto; `Address already in use` significa que ya hay uno.
- Diagnostica de afuera hacia adentro: petición, puerto, proceso, log y equipo.

#### Ejercicio verificable 1
Básico. Cambia los permisos de `secreto.env` para que tu grupo también pueda leerlo, sin dar escritura a nadie más.

Respuesta esperada: `chmod 640 secreto.env`; `ls -l` muestra `-rw-r-----`. Vuelve a `600` al terminar.

#### Ejercicio verificable 2
Intermedio. Con el servidor de la Capa 2 corriendo, obtén **solo** el PID del proceso que escucha en 8765, sin
columnas extra.

Respuesta esperada: `lsof -t -iTCP:8765 -sTCP:LISTEN` imprime solo el número, por ejemplo `9027`. La opción `-t`
existe para usarlo en otros comandos.

#### Ejercicio verificable 3
Reto. Detén el servidor con una sola línea que no use el PID escrito a mano y comprueba con `estado.sh` que cayó.

Respuesta esperada: `kill -TERM "$(lsof -t -iTCP:8765 -sTCP:LISTEN)"`. Bash informa `Exit 143` para el trabajo
y `./estado.sh` muestra `servicio caído`.

#### En el trabajo
Cuando un servicio de RutaFlow cae en la madrugada, la persona de guardia sigue un *runbook*: una lista de comandos
como los de este tema, en orden. Primero confirma el síntoma con `curl`, luego busca puerto, proceso, log y recursos.
Las auditorías de seguridad revisan además permisos de secretos y servicios que corren como `root`.

</details>

### Tema 4: Contenedores: aislamiento reproducible · Avanzado · 75 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- escribir un `Dockerfile` para el cálculo de rutas en Java y construir una imagen capa por capa;
- ejecutar el contenedor con un usuario sin privilegios y guardar sus datos en un volumen que sobrevive al contenedor;
- demostrar con PID y versión del núcleo qué aísla un contenedor y qué comparte con el equipo;
- limitar su memoria y reconocer cuándo el núcleo lo terminó por superarla.

**Conceptos clave:** contenedor, imagen, Dockerfile, capa, variable de entorno, volumen, namespace, cgroup

#### El problema
El cálculo de rutas funciona en el portátil de quien lo escribió, pero falla en el servidor: otra versión de
Java, otra carpeta de datos, otro usuario. Además, si se descontrola, puede consumir toda la memoria del servidor.
RutaFlow necesita empaquetarlo con todo lo que requiere, ejecutarlo sin `root`, conservar sus datos y ponerle un tope.

Este tema usa **núcleo**, **señal** y el código de salida 128 + N (Tema 1), y **usuario**, **permisos** y
**sistema de archivos** (Tema 3) de este módulo.

#### Glosario del tema

**contenedor**
- **Definición técnica:** proceso del equipo al que el núcleo le da una vista aislada de procesos, red, nombre de equipo y sistema de archivos, y unos límites de recursos.
- **En palabras sencillas:** un proceso dentro de una habitación con paredes: cree que la casa entera es esa habitación.
- **Dónde se rompe la comparación:** no es una máquina virtual; comparte el núcleo del equipo con todos los demás procesos.
- **Ejemplo:** dentro del contenedor el programa informa `pid=1`; desde el equipo, `ps` lo ve como el PID 14598.
- **Error típico:** guardar datos dentro del contenedor y borrarlo con `--rm`: los datos se van con él.

**imagen**
- **Definición técnica:** paquete de solo lectura con un sistema de archivos (programas, bibliotecas, tu código) y la configuración de arranque; cada contenedor se crea a partir de una imagen.
- **En palabras sencillas:** el molde; los contenedores son las piezas que salen de él.
- **Dónde se rompe la comparación:** de un molde salen piezas iguales; cada contenedor puede escribir cambios propios que el molde nunca ve.
- **Ejemplo:** `docker build -t rutaflow-app:2 .` crea la imagen `rutaflow-app` con la etiqueta `2`.
- **Error típico:** cambiar `App.java` y ejecutar el contenedor sin reconstruir: corre el código viejo copiado en la imagen.

**Dockerfile**
- **Definición técnica:** archivo de texto con las instrucciones para construir una imagen: `FROM` (imagen base), `WORKDIR`, `COPY`, `RUN`, `USER`, `ENV` y `CMD`, entre otras.
- **En palabras sencillas:** la receta del molde, paso por paso.
- **Dónde se rompe la comparación:** `RUN` se ejecuta al construir, una vez; `CMD` se ejecuta cada vez que arranca un contenedor.
- **Ejemplo:** `USER 10001:10001` hace que todo lo que sigue, y el contenedor, corra con UID 10001.
- **Error típico:** olvidar `USER`: el proceso corre como `root` dentro del contenedor.

**capa**
- **Definición técnica:** conjunto de cambios de archivos que produce una instrucción del Dockerfile; la imagen es la pila de capas, y Docker reutiliza las que no cambiaron.
- **En palabras sencillas:** hojas transparentes apiladas: cada una agrega o tapa algo de las de abajo.
- **Dónde se rompe la comparación:** borrar un archivo en una capa superior no lo quita de la de abajo; la imagen sigue pesando lo mismo.
- **Ejemplo:** `docker history rutaflow-app:2` mostró `COPY Ruta.java App.java ./` con `16.4kB` y `USER 10001:10001` con `0B`.
- **Error típico:** copiar un secreto en una capa y borrarlo en la siguiente: sigue dentro de la imagen.

**variable de entorno**
- **Definición técnica:** par nombre-valor de texto que el sistema operativo entrega a un proceso al crearlo; Java lo lee con `System.getenv`.
- **En palabras sencillas:** una nota pegada en la puerta que el programa lee al entrar.
- **Dónde se rompe la comparación:** la nota se copia al crear el proceso; cambiarla después no afecta a los que ya corren.
- **Ejemplo:** `ENV RUTAS_ARCHIVO=/data/calculos.txt` en el Dockerfile; `System.getenv().getOrDefault("RUTAS_ARCHIVO", "calculos.txt")` la lee en `App.java`.
- **Error típico:** leerla con `System.getenv("RUTAS_ARCHIVO")` cuando puede faltar: devuelve `null` y `Path.of(null)` termina con `NullPointerException`.

**volumen**
- **Definición técnica:** almacenamiento administrado por Docker que se monta en una carpeta del contenedor y existe aparte de él; sobrevive cuando el contenedor se borra.
- **En palabras sencillas:** un disco externo que conectas a cada pieza nueva que sale del molde.
- **Dónde se rompe la comparación:** dos contenedores pueden conectar el mismo volumen a la vez; un disco físico, no.
- **Ejemplo:** con `-v rutas-datos:/data`, el contador pasó de 1 a 2 aunque cada contenedor era nuevo.
- **Error típico:** montar un volumen en una carpeta que el usuario del contenedor no puede escribir: `java.nio.file.AccessDeniedException: /data/calculos.txt`.

**namespace**
- **Definición técnica:** mecanismo del núcleo Linux que da a un grupo de procesos su propia vista de un recurso: PID, red, nombre de equipo, puntos de montaje o usuarios.
- **En palabras sencillas:** las paredes de la habitación: desde adentro no ves a los vecinos.
- **Dónde se rompe la comparación:** las paredes son de vidrio por un lado: desde el equipo sí ves todo lo de adentro.
- **Ejemplo:** dentro, `/proc` lista solo `[1, 24]`; afuera, `ps` muestra el mismo proceso con PID 14598.
- **Error típico:** creer que el aislamiento es total: un fallo del núcleo afecta a todos los contenedores.

**cgroup**
- **Definición técnica:** *control group*; mecanismo del núcleo que limita y mide los recursos (memoria, CPU, procesos) de un grupo de procesos.
- **En palabras sencillas:** el contador de luz con interruptor automático de cada apartamento.
- **Dónde se rompe la comparación:** al superar el límite de memoria no se corta solo un aparato: el núcleo termina el proceso.
- **Ejemplo:** con `--memory 64m` y `-Xmx300m`, reservar 100 MB terminó con código `137` y `OOMKilled=true`.
- **Error típico:** poner un límite menor que lo que la aplicación necesita para arrancar y ver reinicios sin mensaje de error.

#### ► CÓMO FUNCIONA
Docker no inventa un sistema operativo nuevo. Pide al núcleo del equipo tres cosas para un proceso normal.

1. **Un sistema de archivos propio:** las capas de la imagen apiladas, más una capa de escritura para ese contenedor.
2. **Namespaces:** su propia numeración de procesos (él es el PID 1), su nombre de equipo y su red.
3. **Un cgroup:** los límites de memoria y CPU que indiques al ejecutarlo.

Los volúmenes se montan encima, en la carpeta que indiques. Cuando borras el contenedor, se van su capa de
escritura y su proceso; la imagen y los volúmenes quedan.

```mermaid
flowchart TB
    KERNEL["núcleo Linux del equipo (compartido)"]
    KERNEL --> NS["namespaces: PID 1, hostname propio"]
    KERNEL --> CG["cgroup: memoria máx. 64 MB"]
    NS --> C1["contenedor: java App.java<br/>UID 10001"]
    CG --> C1
    IMG["imagen rutaflow-app:2<br/>capas de solo lectura"] --> C1
    C1 --> VOL["volumen rutas-datos<br/>montado en /data"]
```

#### Problema resuelto 4.1
Empaqueta el cálculo de rutas con un programa que guarda cuántas veces se ha ejecutado en un archivo. Ejecútalo sin
`root` y lee el primer error.

**Razonamiento:**
1. `App.java` calcula una ruta con `Ruta.java` (Tema 1), agrega una línea a un archivo cuya ruta llega por la variable
   `RUTAS_ARCHIVO`, cuenta las líneas y muestra host, PID y UID.
2. Primero se prueba fuera del contenedor: si falla aquí, no es culpa de Docker.
3. El Dockerfile parte de una imagen con el JDK 25, copia los dos archivos y cambia a un usuario sin privilegios. El
   contenedor ejecuta `java App.java`, igual que tú en la terminal.
4. El archivo irá en `/data`, la carpeta pensada para el volumen.

```java
// App.java — calcula una ruta y guarda cuántas veces se ha calculado
import com.sun.security.auth.module.UnixSystem;
import java.net.InetAddress;
import java.nio.file.StandardOpenOption;

void main() throws IOException {
    Path archivo = Path.of(System.getenv().getOrDefault("RUTAS_ARCHIVO", "calculos.txt"));
    List<Ruta.Parada> paradas = List.of(
            new Ruta.Parada("RF-3", 3, 3), new Ruta.Parada("RF-1", 1, 1), new Ruta.Parada("RF-2", 2, 2));
    List<String> orden = Ruta.vecinoMasCercano(0, 0, paradas).stream().map(Ruta.Parada::guia).toList();

    Files.writeString(archivo, String.join(",", orden) + "\n",
            StandardOpenOption.CREATE, StandardOpenOption.APPEND);
    int total = Files.readAllLines(archivo).size();

    IO.println("host=" + InetAddress.getLocalHost().getHostName()
            + " pid=" + ProcessHandle.current().pid() + " uid=" + new UnixSystem().getUid());
    IO.println("ruta=" + orden + " cálculos guardados=" + total);
}
```

```dockerfile
FROM rutaflow/jdk-base:25
WORKDIR /app
COPY Ruta.java App.java ./
USER 10001:10001
ENV RUTAS_ARCHIVO=/data/calculos.txt
CMD ["java", "App.java"]
```

```text
$ java App.java
host=vm pid=13996 uid=30033
ruta=[RF-1, RF-2, RF-3] cálculos guardados=1
$ docker build -t rutaflow-app:1 . 2>&1 | tail -3
#8 naming to docker.io/library/rutaflow-app:1 done
#8 unpacking to docker.io/library/rutaflow-app:1 0.0s done
#8 DONE 0.1s
$ docker run --rm rutaflow-app:1 2>&1 | head -1
Exception in thread "main" java.nio.file.NoSuchFileException: /data/calculos.txt
$ docker run --rm -v rutas-datos:/data rutaflow-app:1 2>&1 | head -1
Exception in thread "main" java.nio.file.AccessDeniedException: /data/calculos.txt
```

**Explicación por partes.**
- `App.java`, línea 7: lee `RUTAS_ARCHIVO`; fuera del contenedor no existe y usa `calculos.txt` en la carpeta actual.
- Líneas 12–14: agrega la ruta como una línea nueva (`APPEND`) y cuenta cuántas líneas tiene el archivo.
- Líneas 16–17: muestran el nombre del equipo, el PID y el UID. `UnixSystem` está en el módulo `jdk.security.auth` del JDK; funciona en Linux y en macOS.
- Dockerfile, línea 1: la imagen base de las capturas. En tu equipo escribe `FROM eclipse-temurin:25-jdk`. Debe ser un JDK y no solo un JRE, porque `java App.java` compila el archivo al arrancar.
- Línea 2: `WORKDIR /app` crea la carpeta y la vuelve la carpeta de trabajo de las instrucciones siguientes.
- Línea 4: el usuario 10001 no necesita existir en `/etc/passwd`; el núcleo solo usa el número.
- Primer error: `/data` no existe en la imagen (`NoSuchFileException`). Segundo error: Docker crea `/data` para el volumen, pero con dueño `root`, y UID 10001 no puede escribir ahí (`AccessDeniedException`).

> **Error común.** Montar un volumen en una carpeta que el usuario del contenedor no puede escribir. Java responde
> `java.nio.file.AccessDeniedException: /data/calculos.txt`: el núcleo rechazó a UID 10001 al crear el archivo en
> `/data`, que pertenece a `root`.

#### Problema resuelto 4.2
Crea `/data` en la imagen con dueño 10001 y comprueba que los datos sobreviven a borrar y recrear el contenedor.

**Razonamiento:**
1. La carpeta debe existir en la imagen, con el dueño correcto, **antes** de `USER`.
2. `COPY --chown=10001:10001 datos/ /data/` copia una carpeta vacía del proyecto y crea `/data` con ese dueño. No
   necesita un shell dentro de la imagen; con una imagen que sí lo tiene, también sirve
   `RUN mkdir /data && chown 10001:10001 /data`.
3. Un volumen nuevo se inicializa con el contenido y el dueño de esa carpeta de la imagen.
4. `--rm` borra el contenedor al terminar: si el contador sube igual, los datos están en el volumen.

```dockerfile
FROM rutaflow/jdk-base:25
WORKDIR /app
COPY Ruta.java App.java ./
COPY --chown=10001:10001 datos/ /data/
USER 10001:10001
ENV RUTAS_ARCHIVO=/data/calculos.txt
CMD ["java", "App.java"]
```

```text
$ docker volume rm rutas-datos
rutas-datos
$ docker build -t rutaflow-app:2 . 2>&1 | grep -E '^#[0-9]+ \['
#1 [internal] load build definition from Dockerfile
#2 [internal] load metadata for docker.io/rutaflow/jdk-base:25
#3 [internal] load .dockerignore
#4 [internal] load build context
#5 [1/4] FROM docker.io/rutaflow/jdk-base:25@sha256:9929ce794483ddaedcaf20a7f7addda8959db0572038c368fe01a886d7b4bb03
#6 [2/4] WORKDIR /app
#7 [3/4] COPY Ruta.java App.java ./
#8 [4/4] COPY --chown=10001:10001 datos/ /data/
$ docker run --rm -v rutas-datos:/data rutaflow-app:2
host=e436092b57b8 pid=1 uid=10001
ruta=[RF-1, RF-2, RF-3] cálculos guardados=1
$ docker run --rm -v rutas-datos:/data rutaflow-app:2
host=4361b0eaa646 pid=1 uid=10001
ruta=[RF-1, RF-2, RF-3] cálculos guardados=2
$ docker volume ls
DRIVER    VOLUME NAME
local     rutas-datos
$ docker history rutaflow-app:2 --format '{{.CreatedBy}} | {{.Size}}' | head -6
CMD ["java" "App.java"] | 0B
ENV RUTAS_ARCHIVO=/data/calculos.txt | 0B
USER 10001:10001 | 0B
COPY --chown=10001:10001 datos/ /data/ # bui… | 8.19kB
COPY Ruta.java App.java ./ # buildkit | 16.4kB
WORKDIR /app | 8.19kB
```

**Explicación por partes.**
- Primero se borra `rutas-datos`: ese volumen se creó vacío y con dueño `root` en el Problema resuelto 4.1. Un volumen nuevo copia el contenido y el dueño de `/data` de la imagen.
- Línea 4: `COPY --chown` crea `/data` con dueño 10001. La carpeta `datos` del proyecto está vacía: solo sirve de molde. Créala con `mkdir datos`.
- La construcción tiene 4 pasos numerados `[1/4]` a `[4/4]`, uno por instrucción que cambia archivos.
- Cada ejecución tiene otro `host` (otro contenedor), pero el contador sube de 1 a 2: el archivo vive en el volumen.
- `pid=1`: dentro de su namespace, la JVM de `App.java` es el primer proceso. `uid=10001`: no corre como `root`.
- `docker history` lista las capas de arriba abajo; `USER`, `ENV` y `CMD` solo cambian configuración y pesan `0B`.

> **Buena práctica.** Declara un UID numérico fijo con `USER` y dale a ese UID solo las carpetas que debe escribir.
> Si alguien compromete la aplicación, queda sin privilegios dentro del contenedor.

> **Prevenir errores.** Prueba el programa fuera del contenedor antes de construir la imagen. Si `java App.java`
> falla en tu equipo, el problema no es Docker.

#### Problema resuelto 4.3
Demuestra qué aísla el contenedor y qué comparte con el equipo: procesos, usuario y núcleo.

**Razonamiento:**
1. Un contenedor que duerme 120 segundos da tiempo de mirarlo desde adentro y desde afuera.
2. Adentro, `docker exec` ejecuta un programa Java que muestra su PID, los procesos visibles en `/proc` y la versión del núcleo.
3. Los dos programas auxiliares van en una carpeta `mirar` que se monta en el contenedor con `-v`, en modo solo
   lectura (`:ro`); así no hay que reconstruir la imagen.
4. Afuera, `docker inspect` da el PID real y `ps` lo muestra como cualquier otro proceso.
5. `uname -r` en el equipo debe coincidir con la versión que se vio adentro.

```java
// Espera.java — duerme dos minutos para observar el contenedor
void main() throws InterruptedException {
    Thread.sleep(120_000);
}
```

```java
// Mirar.java — muestra qué ve un proceso desde dentro del contenedor
void main() throws IOException {
    IO.println("PID dentro: " + ProcessHandle.current().pid() + " kernel: " + System.getProperty("os.version"));
    try (var entradas = Files.list(Path.of("/proc"))) {
        List<String> procesos = entradas.map(p -> p.getFileName().toString())
                .filter(nombre -> nombre.chars().allMatch(Character::isDigit))
                .sorted(Comparator.comparingInt(Integer::parseInt))
                .toList();
        IO.println("procesos visibles: " + procesos);
    }
}
```

```text
$ docker run -d --name ruta-lenta -v "$PWD/mirar:/mirar:ro" rutaflow-app:2 java /mirar/Espera.java
e89bbe79821c9d03bf56856874a4379fc19c497f7f08fbd411d847ecd4ba2e06
$ sleep 3
$ docker exec ruta-lenta java /mirar/Mirar.java
PID dentro: 24 kernel: 6.18.44-fc-v819
procesos visibles: [1, 24]
$ docker inspect -f '{{.State.Pid}}' ruta-lenta
14598
$ ps -o pid,user,command -p "$(docker inspect -f '{{.State.Pid}}' ruta-lenta)"
  PID USER     COMMAND
14598 10001    java /mirar/Espera.java
$ uname -r
6.18.44-fc-v819
$ docker rm -f ruta-lenta
ruta-lenta
```

**Explicación por partes.**
- `-d` ejecuta el contenedor en segundo plano y muestra su identificador completo.
- Dentro solo existen dos procesos: el 1 (la JVM de `Espera.java`) y el 24 (la JVM de `docker exec`). Los demás del equipo no se ven.
- Fuera, el mismo proceso es el PID 14598 y su usuario es `10001`, sin nombre porque el equipo no tiene esa cuenta.
- La versión del núcleo es idéntica adentro y afuera: el contenedor no trae núcleo propio. `System.getProperty("os.version")` la lee del núcleo.
- `docker rm -f` envía la señal de parada y borra el contenedor.

> **Error común.** Usar Docker con un usuario que no tiene acceso al servicio. La respuesta es
> `permission denied while trying to connect to the docker API at unix:///var/run/docker.sock`. Pertenecer al grupo
> `docker` lo resuelve, pero equivale a tener privilegios de `root` en el equipo: dalo solo a quien lo necesite.

#### Problema resuelto 4.4
Limita el contenedor a 64 MB de memoria y comprueba qué pasa cuando el programa pide más.

**Razonamiento:**
1. `--memory 64m` crea un cgroup con ese tope.
2. `new byte[N]` llena de ceros N megabytes: obliga a usar memoria real de inmediato.
3. La JVM lee el límite del cgroup y fija el tamaño máximo de su *heap* (la zona donde viven los objetos) a una
   fracción de él. Así puede fallar por su cuenta antes de que el núcleo la mate.
4. Para ver al núcleo actuar, `-Xmx300m` le permite a la JVM un heap mayor que el límite del contenedor.
5. Sin `--rm`, ese contenedor queda registrado y `docker inspect` puede decir por qué terminó.

```java
// Reservar.java — pide N megabytes de memoria de una vez
void main(String[] args) {
    int megas = Integer.parseInt(args[0]);
    byte[] datos = new byte[megas * 1024 * 1024];
    IO.println("reservé " + datos.length / (1024 * 1024) + " MB; máximo del heap: "
            + Runtime.getRuntime().maxMemory() / (1024 * 1024) + " MB");
}
```

```text
$ docker run --rm --memory 64m -v "$PWD/mirar:/mirar:ro" rutaflow-app:2 java /mirar/Reservar.java 10
reservé 10 MB; máximo del heap: 30 MB
$ docker run --rm --memory 64m -v "$PWD/mirar:/mirar:ro" rutaflow-app:2 java /mirar/Reservar.java 200 2>&1 | head -2
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
	at Reservar.main(Reservar.java:4)
$ docker run --name sin-memoria --memory 64m -v "$PWD/mirar:/mirar:ro" rutaflow-app:2 java -Xmx300m /mirar/Reservar.java 100
$ echo $?
137
$ docker inspect -f 'OOMKilled={{.State.OOMKilled}} ExitCode={{.State.ExitCode}}' sin-memoria
OOMKilled=true ExitCode=137
$ docker rm sin-memoria
sin-memoria
```

**Explicación por partes.**
- Con 10 MB el programa termina normal. Su heap máximo es de 30 MB: la JVM lo calculó a partir de los 64 MB del contenedor.
- Con 200 MB, la JVM se niega antes de pasarse del límite: `OutOfMemoryError: Java heap space`, código 1. El contenedor sigue sano; el error es del programa.
- Con `-Xmx300m`, la JVM cree que puede crecer y el núcleo la detiene: no imprime nada, código `137` (128 + 9, `SIGKILL`, como en el Checkpoint 1.1).
- `OOMKilled=true` confirma la causa: el cgroup superó su límite (*out of memory*).
- Nunca fijes `-Xmx` por encima del límite del contenedor; deja que la JVM lo calcule o usa `-XX:MaxRAMPercentage`.

> **Rendimiento.** Un límite de memoria convierte un problema de todo el servidor en un problema de un contenedor.
> Mide primero cuánto usa tu servicio (RSS, Tema 3) y deja un margen sobre esa cifra.

#### Checkpoint 4.1
Ejecutas `docker run --rm rutaflow-app:2` tres veces **sin** `-v`. ¿Qué número de cálculos guardados muestra la
tercera ejecución? ¿Por qué?

Respuesta: `1`. Sin volumen, el archivo vive en la capa de escritura del contenedor, que `--rm` borra al terminar.
Cada contenedor nuevo parte de la imagen, donde `/data` está vacía.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Ejecuta `mkdir -p ~/labs/m8/contenedor && cd ~/labs/m8/contenedor`. Copia `Ruta.java` del Tema 1 y crea `App.java`.
Ejecuta `java App.java` y borra el `calculos.txt` que se crea.

#### Paso 2 · Comprueba Docker
Ejecuta `docker version`. Si ves `permission denied while trying to connect to the docker API`, pide acceso al grupo
`docker` o usa Docker Desktop.

#### Paso 3 · Construye la primera versión
Escribe el Dockerfile del Problema resuelto 4.1 con `FROM eclipse-temurin:25-jdk` en la línea 1. Construye con
`docker build -t rutaflow-app:1 .` y ejecuta los dos `docker run`. Lee el error.

#### Paso 4 · Corrige y prueba la persistencia
Crea la carpeta vacía `datos`, agrega la línea `COPY --chown` del Problema resuelto 4.2, borra el volumen con `docker volume rm rutas-datos`, construye
`rutaflow-app:2` y ejecuta dos veces con `-v rutas-datos:/data`.

#### Paso 5 · Mira adentro y afuera
Crea la carpeta `mirar` con `Espera.java` y `Mirar.java` y repite el Problema resuelto 4.3. En Docker Desktop (macOS o Windows), el `ps` del equipo no muestra el proceso:
los contenedores corren en una máquina virtual Linux.

#### Paso 6 · Pon un límite
Agrega `Reservar.java` a `mirar`, repite el Problema resuelto 4.4 y confirma `OOMKilled=true`.

#### Resumen
- Un **contenedor** es un proceso del equipo con vista aislada y límites; comparte el núcleo.
- Una **imagen** es el molde de solo lectura; el **Dockerfile** es su receta y cada instrucción produce una **capa**.
- Un **volumen** guarda datos fuera del contenedor; debe montarse en una carpeta que el usuario del contenedor pueda escribir.
- Los **namespaces** dan al contenedor su propio PID 1 y su nombre de equipo; desde afuera se ve como un proceso más.
- Un **cgroup** limita sus recursos; al superar la memoria, el núcleo lo termina con `SIGKILL` (código 137). La JVM lee ese límite y ajusta su heap para fallar antes con un `OutOfMemoryError`.
- `USER` con un UID fijo evita que el proceso corra como `root`; una **variable de entorno** (`ENV`) le indica dónde guardar los datos.

#### Ejercicio verificable 1
Básico. Después de los dos `docker run` del Problema resuelto 4.2, ejecuta uno más con el mismo volumen. ¿Qué
muestra?

Respuesta esperada: `cálculos guardados=3`, con otro `host` y otra vez `pid=1 uid=10001`.

#### Ejercicio verificable 2
Intermedio. Ejecuta el contenedor con un volumen nuevo, `-v rutas-nuevo:/data`. ¿Qué número muestra y qué pasó
con el volumen anterior?

Respuesta esperada: `cálculos guardados=1`. Docker creó un volumen vacío nuevo; `rutas-datos` sigue intacto con su
cuenta, como muestra `docker volume ls`.

#### Ejercicio verificable 3
Reto. Ejecuta el contenedor con `--read-only` y el volumen `rutas-datos`. ¿Funciona? Luego, con `--read-only`,
ejecuta un `Escribir.java` montado en `/mirar` que intente crear `/app/x.txt`, y lee el error.

Respuesta esperada: funciona (`cálculos guardados` sube), porque solo escribe en el volumen y `java App.java`
compila en memoria. Escribir en `/app` falla con
`java.nio.file.FileSystemException: /app/x.txt: Read-only file system`. Un sistema de archivos de solo lectura limita
el daño de un atacante.

#### En el trabajo
En RutaFlow, cada servicio se publica como una imagen etiquetada y el mismo molde corre en pruebas y en producción.
Los equipos de plataforma exigen usuario no `root`, volúmenes para los datos y límites de memoria en todos los
contenedores. Un `OOMKilled` en el panel de monitoreo es una de las alertas más frecuentes de la guardia.

</details>

### Tema 5: Problemas clásicos de concurrencia: filósofos y lectores-escritores · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- reproducir un interbloqueo real con la cena de los filósofos y detectarlo sin colgar el programa;
- eliminarlo imponiendo un orden global de recursos y explicar qué condición rompe;
- permitir lecturas simultáneas con exclusión de escritores (lectores-escritores);
- medir la inanición de un escritor y proponer cómo evitarla.

**Conceptos clave:** interbloqueo, espera circular, orden global de recursos, hilo daemon, lectores-escritores, inanición

#### El problema
Cinco mensajeros de RutaFlow se sientan en círculo y comparten cinco radios, una entre cada par. Para coordinar una
entrega, cada uno necesita las dos radios a su lado. Si todos toman la de su izquierda al mismo tiempo, todos
esperan la de la derecha para siempre. El programa no falla ni avisa: simplemente se queda quieto.

Además, el tablero de estados lo consultan muchos a la vez, pero solo uno debe cambiarlo. ¿Cómo dejas leer a
muchos sin que un cambio a medias se vea?

Este tema usa **hilo**, **cerrojo**, **sección crítica** y **condición de carrera** del Tema 2 de este módulo, y el
**código de salida** (Módulo 0, Tema 4).

#### Glosario del tema

**interbloqueo (deadlock)**
- **Definición técnica:** situación en la que un grupo de hilos o procesos espera indefinidamente, porque cada uno retiene un recurso que otro del grupo necesita.
- **En palabras sencillas:** cuatro carros en un cruce, cada uno esperando a que pase el de su derecha.
- **Dónde se rompe la comparación:** en el cruce alguien termina cediendo; los hilos nunca ceden por su cuenta.
- **Ejemplo:** `FilosofosBloqueo.java` termina con `rondas=[0, 0, 0, 0, 0] hilos bloqueados=5`.
- **Error típico:** buscar un mensaje de error: un interbloqueo no imprime nada; el programa simplemente deja de avanzar. En Java, `jcmd PID Thread.print` sí lo detecta y lo describe.

**espera circular**
- **Definición técnica:** cadena cerrada de esperas: A espera un recurso de B, B uno de C… y el último, uno de A. Es una de las cuatro condiciones necesarias del interbloqueo, junto con exclusión mutua, retener y esperar, y no expropiación.
- **En palabras sencillas:** una ronda en la que cada persona mira la mano de la siguiente.
- **Dónde se rompe la comparación:** basta con que una persona mire en otra dirección para que la ronda se rompa.
- **Ejemplo:** mensajero 0 retiene la radio 0 y espera la 1; el 4 retiene la 4 y espera la 0.
- **Error típico:** agregar más cerrojos para «proteger mejor»: cada lock nuevo es otra oportunidad de cerrar un círculo.

**orden global de recursos**
- **Definición técnica:** regla que numera los recursos y obliga a todo hilo a adquirirlos en orden creciente; con ella no puede formarse una espera circular.
- **En palabras sencillas:** todos toman primero la radio con el número menor; nadie puede quedar mirando hacia atrás.
- **Dónde se rompe la comparación:** solo funciona si **todos** los hilos respetan el orden; uno que no lo haga rompe la garantía.
- **Ejemplo:** `int primero = Math.min(izquierda, derecha), segundo = Math.max(izquierda, derecha);` dio `rondas por mensajero=[50, 50, 50, 50, 50]`.
- **Error típico:** ordenar por nombre en un módulo y por número en otro: dos órdenes distintos vuelven a permitir el círculo.

**hilo daemon**
- **Definición técnica:** hilo marcado con `setDaemon(true)` antes de arrancarlo; la JVM no espera a que termine para cerrar el programa.
- **En palabras sencillas:** un ayudante que se va a casa cuando cierra la tienda, haya terminado o no.
- **Dónde se rompe la comparación:** el ayudante recoge sus cosas; un hilo daemon se corta sin limpiar nada.
- **Ejemplo:** en `FilosofosBloqueo.java`, los hilos bloqueados son daemon y el programa termina con código 0.
- **Error típico:** usar hilos daemon para escribir archivos: el programa puede cerrar a mitad de una escritura.

**lectores-escritores**
- **Definición técnica:** problema clásico de sincronización: muchos lectores pueden acceder a la vez a un dato, pero un escritor necesita acceso exclusivo, sin lectores ni otros escritores.
- **En palabras sencillas:** muchos pueden mirar el tablero a la vez; para cambiarlo, el tablero debe quedar solo.
- **Dónde se rompe la comparación:** en la vida real alguien avisa «voy a escribir»; aquí debes programar ese aviso.
- **Ejemplo:** el `Tablero` de `ConcurrenciaClasica.java` alcanzó `Lectores simultáneos máximos: 8`.
- **Error típico:** proteger cada lectura con el mismo cerrojo del escritor: es correcto, pero los lectores hacen fila sin necesidad.

**inanición (starvation)**
- **Definición técnica:** situación en la que un hilo listo para avanzar nunca obtiene el recurso, porque otros lo obtienen siempre antes que él.
- **En palabras sencillas:** quedarte en la fila mientras otros se cuelan una y otra vez.
- **Dónde se rompe la comparación:** a diferencia del interbloqueo, el sistema sí avanza; solo uno se queda atrás.
- **Ejemplo:** en `Inanicion.java`, el escritor esperó `0.95 s`, casi todo el tiempo que hubo lectores.
- **Error típico:** confundirla con lentitud general: el resto del sistema responde bien y solo una operación tarda.

#### ► CÓMO FUNCIONA
Un interbloqueo necesita cuatro condiciones a la vez: exclusión mutua (un cerrojo lo tiene uno solo), retener y
esperar (tienes uno y pides otro), no expropiación (nadie te lo quita) y espera circular. Rompe cualquiera y
desaparece. La más fácil de romper en código es la espera circular: si todos piden los recursos en el mismo orden,
el último de la cadena nunca puede esperar al primero.

En lectores-escritores, un contador de lectores protegido por un cerrojo propio decide quién bloquea al escritor: el
primer lector que entra toma el permiso de escritura y el último que sale lo suelta.

```mermaid
flowchart LR
    M0["mensajero 0"] -- tiene --> R0["radio 0"]
    M0 -. espera .-> R1["radio 1"]
    M1["mensajero 1"] -- tiene --> R1
    M1 -. espera .-> R2["radio 2"]
    M4["mensajero 4"] -- tiene --> R4["radio 4"]
    M4 -. espera .-> R0
    FIX["orden global: el mensajero 4 pide primero la radio 0"] -.->|rompe el círculo| M4
```

#### Problema resuelto 5.1
Reproduce el interbloqueo de los cinco mensajeros y detéctalo sin que el programa se quede colgado.

**Razonamiento:**
1. Cinco `ReentrantLock` representan las cinco radios; el mensajero `i` usa la `i` y la `(i + 1) % 5`.
2. Cada uno toma la izquierda, espera un instante y pide la derecha: la pausa asegura que todos tengan una.
3. `join(2000)` deja de esperar a los dos segundos; `isAlive()` dice cuántos siguen atascados.
4. Los hilos son daemon para que el programa pueda terminar aunque ellos sigan bloqueados.
5. Cada hilo lleva un nombre (`mensajero-0`…); así se reconoce en las herramientas de diagnóstico.

```java
// FilosofosBloqueo.java — cinco mensajeros toman primero la radio izquierda y luego la derecha
import java.util.concurrent.locks.ReentrantLock;

final int N = 5;
final ReentrantLock[] radios = new ReentrantLock[N];
final int[] rondas = new int[N];

void mensajero(int i) {
    int izquierda = i, derecha = (i + 1) % N;
    radios[izquierda].lock();
    try {
        dormir(100);                         // todos alcanzan a tomar su radio izquierda
        radios[derecha].lock();
        try {
            rondas[i]++;
        } finally {
            radios[derecha].unlock();
        }
    } finally {
        radios[izquierda].unlock();
    }
}

void dormir(long milisegundos) {
    try {
        Thread.sleep(milisegundos);
    } catch (InterruptedException error) {
        Thread.currentThread().interrupt();
    }
}

void main() throws InterruptedException {
    for (int i = 0; i < N; i++) radios[i] = new ReentrantLock();
    List<Thread> hilos = new ArrayList<>();
    for (int i = 0; i < N; i++) {
        final int numero = i;
        Thread hilo = new Thread(() -> mensajero(numero), "mensajero-" + i);
        hilo.setDaemon(true);
        hilos.add(hilo);
    }
    for (Thread h : hilos) h.start();
    for (Thread h : hilos) h.join(2000);
    long bloqueados = hilos.stream().filter(Thread::isAlive).count();
    IO.println("rondas=" + Arrays.toString(rondas) + " hilos bloqueados=" + bloqueados);
}
```

Sin daemon (archivo `FilosofosColgado.java`, idéntico salvo la línea `hilo.setDaemon(true);`), el programa no termina
nunca. `timeout 5` lo detiene a los cinco segundos. Y mientras sigue colgado, `jcmd`, una herramienta del JDK, le pide
a la JVM un informe de sus hilos:

```text
$ java FilosofosBloqueo.java
rondas=[0, 0, 0, 0, 0] hilos bloqueados=5
$ echo $?
0
$ timeout 5 java FilosofosColgado.java
$ echo $?
124
$ java FilosofosColgado.java &
[1] 15408
$ PID=$!
$ sleep 4
$ jcmd "$PID" Thread.print | grep -A 12 'Found one Java-level deadlock'
Found one Java-level deadlock:
=============================
"mensajero-0":
  waiting for ownable synchronizer 0x00000000a3e24380, (a java.util.concurrent.locks.ReentrantLock$NonfairSync),
  which is held by "mensajero-1"

"mensajero-1":
  waiting for ownable synchronizer 0x00000000a3e243b0, (a java.util.concurrent.locks.ReentrantLock$NonfairSync),
  which is held by "mensajero-2"

"mensajero-2":
  waiting for ownable synchronizer 0x00000000a3e243e0, (a java.util.concurrent.locks.ReentrantLock$NonfairSync),
  which is held by "mensajero-3"
$ kill -KILL "$PID"
```

**Explicación por partes.**
- Línea 9: el mensajero 4 usa la radio 4 y la `(4 + 1) % 5 = 0`; así se cierra el círculo.
- Líneas 10–13: con la pausa de la línea 12, los cinco tienen su radio izquierda antes de pedir la derecha.
- Líneas 37–38: el hilo se crea con nombre y se marca como daemon antes de `start()`.
- Línea 42: `join(2000)` vuelve aunque el hilo no haya terminado; con cinco hilos atascados, `main` espera 2 s por cada uno.
- Línea 43: `isAlive()` vale `true` para los cinco: ninguno completó una ronda.
- `124` es el código que usa `timeout` para decir «lo detuve yo».
- `jcmd PID Thread.print` imprime la pila de cada hilo y, al final, el análisis de la JVM: `Found one Java-level deadlock`, con quién espera a quién. La salida sigue con los mensajeros 3 y 4 y cierra el círculo.

> **Error común.** Esperar una traza de pila de un interbloqueo. No hay ninguna: la terminal queda quieta y `echo $?`
> no se puede consultar hasta que alguien detiene el proceso. Si un programa concurrente deja de imprimir sin
> error, sospecha primero un interbloqueo.

> **Prevenir errores.** En pruebas de código concurrente, usa siempre `join(milisegundos)` y verifica `isAlive()`.
> Una prueba que se cuelga no informa nada; una que falla por tiempo te dice dónde mirar.

#### Problema resuelto 5.2
Elimina el interbloqueo con un orden global de recursos y permite que muchos lean el tablero de estados a la vez,
con un escritor exclusivo.

**Razonamiento:**
1. Si cada mensajero toma primero la radio de menor número, el mensajero 4 pide la 0 antes que la 4 y el círculo no se cierra.
2. Para medir que funciona, cada mensajero hace 50 rondas; todas deben completarse y ningún hilo debe quedar vivo.
3. El tablero usa dos piezas: un `ReentrantLock` protege el contador de lectores y un `Semaphore` de un permiso da
   exclusión a la escritura.
4. El primer lector toma el permiso de escritura; el último lo devuelve. Pueden ser hilos distintos, y por eso se usa
   un semáforo: un `ReentrantLock` solo puede liberarlo el hilo que lo tomó.
5. El `Tablero` va en su propio archivo porque el Problema resuelto 5.3 lo reutiliza.

```java
// ConcurrenciaClasica.java — filósofos con orden global y tablero de lectores y escritores
import java.util.concurrent.locks.ReentrantLock;

final int N = 5;
final ReentrantLock[] radios = new ReentrantLock[N];
final int[] comidas = new int[N];

void mensajero(int i) {
    int izquierda = i, derecha = (i + 1) % N;
    // Orden global de recursos: siempre tomar primero el de menor número rompe la espera circular
    int primero = Math.min(izquierda, derecha), segundo = Math.max(izquierda, derecha);
    for (int ronda = 0; ronda < 50; ronda++) {
        radios[primero].lock();
        try {
            dormir(1);                           // tiene una radio en la mano y espera la otra
            radios[segundo].lock();
            try {
                comidas[i]++;
            } finally {
                radios[segundo].unlock();
            }
        } finally {
            radios[primero].unlock();
        }
    }
}

void dormir(long milisegundos) {
    try {
        Thread.sleep(milisegundos);
    } catch (InterruptedException error) {
        Thread.currentThread().interrupt();
    }
}

void main() throws InterruptedException {
    for (int i = 0; i < N; i++) radios[i] = new ReentrantLock();
    List<Thread> hilos = new ArrayList<>();
    for (int i = 0; i < N; i++) {
        final int numero = i;
        hilos.add(new Thread(() -> mensajero(numero)));
    }
    for (Thread h : hilos) h.start();
    for (Thread h : hilos) h.join(3000);
    long vivos = hilos.stream().filter(Thread::isAlive).count();
    IO.println("Filósofos: rondas por mensajero=" + Arrays.toString(comidas) + ", hilos bloqueados=" + vivos);

    Tablero tablero = new Tablero();
    List<Thread> lectores = new ArrayList<>();
    for (int i = 0; i < 8; i++) {
        lectores.add(Thread.ofPlatform().unstarted(() -> {
            try {
                tablero.leer("BO-1");
            } catch (InterruptedException error) {
                Thread.currentThread().interrupt();
            }
        }));
    }
    for (Thread h : lectores) h.start();
    for (Thread h : lectores) h.join();
    tablero.escribir("BO-1", "entregado");
    IO.println("Lectores simultáneos máximos: " + tablero.maxSimultaneos + ", estado final: " + tablero.leer("BO-1"));
}
```

```java
// Tablero.java — muchos leen el tablero a la vez, uno solo escribe
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Semaphore;
import java.util.concurrent.locks.ReentrantLock;

class Tablero {
    private final Map<String, String> datos = new HashMap<>(Map.of("BO-1", "en ruta"));
    private int lectores = 0;
    private final ReentrantLock mutex = new ReentrantLock();       // protege el contador de lectores
    private final Semaphore escritura = new Semaphore(1);          // exclusión para escritores
    int maxSimultaneos = 0;

    String leer(String guia) throws InterruptedException {
        mutex.lock();
        try {
            lectores++;
            if (lectores == 1) escritura.acquire();                // el primer lector bloquea escritores
            maxSimultaneos = Math.max(maxSimultaneos, lectores);
        } finally {
            mutex.unlock();
        }
        Thread.sleep(10);
        String valor = datos.get(guia);
        mutex.lock();
        try {
            lectores--;
            if (lectores == 0) escritura.release();                // el último lector libera
        } finally {
            mutex.unlock();
        }
        return valor;
    }

    void escribir(String guia, String estado) throws InterruptedException {
        escritura.acquire();
        try {
            datos.put(guia, estado);
        } finally {
            escritura.release();
        }
    }
}
```

```text
$ java ConcurrenciaClasica.java
Filósofos: rondas por mensajero=[50, 50, 50, 50, 50], hilos bloqueados=0
Lectores simultáneos máximos: 8, estado final: entregado
```

**Explicación por partes.**
- `ConcurrenciaClasica.java`, línea 11: para el mensajero 4, `Math.min(4, 0)` es 0: pide primero la radio 0, igual que el mensajero 0. Uno de los dos espera sin retener nada.
- Líneas 12–25: 50 rondas con una radio en la mano y la pausa que antes causaba el bloqueo; ahora todas terminan.
- Líneas 51–57: `Thread.ofPlatform().unstarted(...)` crea cada lector sin arrancarlo; el `try` atiende la `InterruptedException` de `leer`.
- `Tablero.java`, línea 10: `mutex` protege `lectores`, que es memoria compartida, igual que en el Tema 2.
- Líneas 15–21: el primer lector toma el permiso de `escritura`; mientras haya lectores, `escribir` espera en la línea 36.
- Líneas 25–31: el último lector en salir devuelve el permiso. Ocho lectores estuvieron adentro a la vez.
- `ConcurrenciaClasica.java`, línea 61: el escritor cambia el estado cuando ya no hay lectores; la lectura final ve `entregado`.

> **Error común.** Usar un `ReentrantLock` para `escritura`. El último lector suele ser otro hilo, y al llamar
> `unlock()` Java responde `Exception in thread "Thread-12" java.lang.IllegalMonitorStateException`. Ese hilo muere,
> el cerrojo queda tomado y el escritor espera para siempre: el programa se cuelga. Cuando quien toma y quien suelta
> pueden ser hilos distintos, usa un `Semaphore`.

#### Problema resuelto 5.3
Mide cuánto espera un escritor cuando llegan lectores sin pausa durante un segundo.

**Razonamiento:**
1. Cuatro lectores leen en bucle durante 1 s; mientras uno siga adentro, el permiso de escritura está tomado.
2. El escritor llega a los 0.05 s, cuando ya hay lectores.
3. Si el escritor espera casi todo el segundo, hay inanición: los lectores nuevos siempre entran antes que él.
4. Se reutiliza la clase `Tablero`: Java la encuentra en `Tablero.java`, en la misma carpeta, sin ejecutar nada más.

```java
// Inanicion.java — un escritor espera mientras llegan lectores sin pausa
void main() throws InterruptedException {
    Tablero tablero = new Tablero();
    long finLectores = System.nanoTime() + 1_000_000_000L;
    List<Thread> lectores = new ArrayList<>();
    for (int i = 0; i < 4; i++) {
        lectores.add(new Thread(() -> {
            try {
                while (System.nanoTime() < finLectores) {
                    tablero.leer("BO-1");
                }
            } catch (InterruptedException error) {
                Thread.currentThread().interrupt();
            }
        }));
    }
    for (Thread h : lectores) h.start();
    Thread.sleep(50);                            // el escritor llega cuando ya hay lectores
    long inicio = System.nanoTime();
    tablero.escribir("BO-1", "entregado");
    IO.println(String.format(Locale.ROOT, "el escritor esperó %.2f s", (System.nanoTime() - inicio) / 1e9));
    for (Thread h : lectores) h.join();
}
```

```text
$ java Inanicion.java
el escritor esperó 0.95 s
```

**Explicación por partes.**
- Líneas 7–13: cada lector vuelve a entrar apenas sale; siempre hay al menos uno adentro.
- Línea 20: el escritor pide `escritura`, pero el primer lector tomó el permiso y ningún «último lector» llega a devolverlo.
- `0.95 s` es prácticamente el segundo completo menos los 0.05 s iniciales: el escritor solo entró cuando los lectores pararon.
- A diferencia de otros lenguajes, usar `Tablero` desde otro archivo no ejecuta la demostración de `ConcurrenciaClasica.java`: cada archivo tiene su propio `main`.

> **Ingeniería de software.** Esta versión prioriza a los lectores. Si las escrituras son urgentes (un envío
> marcado como entregado), usa una variante con prioridad de escritor: cuando un escritor espera, los lectores
> nuevos hacen fila detrás de él. Java ya la trae: `ReentrantReadWriteLock` (Ejercicio verificable 3).

#### Checkpoint 5.1
En `FilosofosBloqueo.java` cambias solo el mensajero 4 para que tome primero la radio 0 y luego la 4. Los demás
siguen tomando izquierda y luego derecha. ¿Puede haber interbloqueo?

Respuesta: no. El mensajero 4 ahora pide los recursos en orden creciente, igual que todos los demás; nadie puede
retener la radio 4 y esperar la 0, así que la espera circular no puede cerrarse.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Ejecuta `mkdir -p ~/labs/m8/concurrencia && cd ~/labs/m8/concurrencia`.

#### Paso 2 · Provoca el interbloqueo
Crea `FilosofosBloqueo.java` y ejecútalo. Comprueba `hilos bloqueados=5` y el código 0.

#### Paso 3 · Comprueba que sin daemon se cuelga
Copia el archivo como `FilosofosColgado.java`, quita la línea `hilo.setDaemon(true);` y ejecútalo con `timeout 5`.
Debes ver `124`. Luego lánzalo en segundo plano y diagnostícalo con `jcmd "$PID" Thread.print`. En macOS, `timeout`
no viene instalado: usa `gtimeout` (de `brew install coreutils`) o detenlo con Ctrl+C.

#### Paso 4 · Ordena los recursos y comparte la lectura
Crea `Tablero.java` y `ConcurrenciaClasica.java` y ejecuta el segundo. Las dos líneas deben coincidir con el Problema resuelto 5.2.

#### Paso 5 · Mide la inanición
Crea `Inanicion.java` en la misma carpeta y ejecútalo. Anota cuánto esperó el escritor.

#### Resumen
- Un **interbloqueo** ocurre cuando hay exclusión mutua, retener y esperar, no expropiación y **espera circular** a la vez.
- No imprime error: se detecta con `join(milisegundos)` e `isAlive()`, o con `jcmd PID Thread.print`, que lo describe.
- Un **orden global de recursos** (siempre el número menor primero) rompe la espera circular.
- Un **hilo daemon** no impide que el programa termine; sirve para diagnosticar, no para trabajo que deba completarse.
- **Lectores-escritores** permite muchas lecturas a la vez y una escritura exclusiva con un cerrojo, un semáforo y un contador, o con `ReentrantReadWriteLock`.
- La prioridad para lectores puede causar **inanición** del escritor; se mide con el tiempo de espera.

#### Ejercicio verificable 1
Básico. De las cuatro condiciones del interbloqueo, ¿cuál rompe `ConcurrenciaClasica.java` y en qué línea?

Respuesta esperada: la espera circular, en la línea 11, donde `Math.min` y `Math.max` fijan el orden en que se piden las
radios. Las otras tres siguen presentes.

#### Ejercicio verificable 2
Intermedio. Corrige `FilosofosBloqueo.java` aplicando el orden global de recursos en el método `mensajero`, sin
tocar la pausa. Guárdalo como `FilosofosOrden.java` y ejecútalo.

Respuesta esperada: agrega `int primero = Math.min(izquierda, derecha), segundo = Math.max(izquierda, derecha);` y
usa `radios[primero]` y `radios[segundo]`. La salida es `rondas=[1, 1, 1, 1, 1] hilos bloqueados=0`.

#### Ejercicio verificable 3
Reto. Reescribe `Tablero` con `ReentrantReadWriteLock`: `readLock()` alrededor de la lectura y `writeLock()`
alrededor de la escritura, cada uno con `lock()` y `unlock()` en `finally`. Ejecuta `Inanicion.java` con esa versión.
¿Cuánto espera ahora el escritor?

Respuesta esperada: `el escritor esperó 0.01 s` (o `0.00 s`). En cuanto un escritor hace fila, `ReentrantReadWriteLock`
no deja entrar lectores nuevos delante de él: espera solo a que salgan los que ya estaban. Con
`new ReentrantReadWriteLock(true)` el orden es estrictamente el de llegada.

#### En el trabajo
Los interbloqueos aparecen en bases de datos cuando dos transacciones actualizan las mismas filas en distinto orden;
PostgreSQL los detecta y cancela una de ellas. La regla práctica es la misma de este tema: actualizar siempre en el
mismo orden, por ejemplo por identificador. Los cachés de lectura intensa usan locks de lectores-escritores.

</details>

### Proyecto 8 — Inventario operable en un contenedor

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

El proyecto une los cinco temas en el inventario acumulativo del curso. El servicio del Módulo 4 pasa a correr en
un contenedor sin `root`, con datos persistentes, límites, apagado limpio y una prueba concurrente. No hay técnicas
nuevas: cada entregable remite al tema donde se explicó. La única pieza nueva es `docker compose`, que guarda en un
archivo las opciones de `docker run` que ya conoces.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Entregables
1. **Apagado limpio.** El servicio atiende `SIGTERM` con un *shutdown hook*, termina la operación en curso y lo registra en el log antes de salir (Tema 1, Problema resuelto 1.3).
2. **Prueba concurrente.** Una prueba lanza al menos 12 retiros simultáneos sobre el mismo producto y comprueba que el stock nunca queda negativo (Tema 2, Problema resuelto 2.5).
3. **Runbook operativo.** Un `RUNBOOK.md` con los comandos de diagnóstico en orden: petición, puerto, proceso, log y equipo (Tema 3).
4. **Imagen no root.** Un `Dockerfile` con UID fijo en `USER` y `/data` como única carpeta escribible (Tema 4, Problema resuelto 4.2).
5. **Persistencia.** Evidencia de que los datos sobreviven a `docker compose down` y `docker compose up` con el volumen `inventory-data` (Tema 4).
6. **Healthcheck y límites.** Un archivo `Healthcheck.java`, copiado en `/app`, que termina con código 0 si el servicio responde y con 1 si no (`System.exit(1)`); límites de memoria y CPU en `compose.yaml`.
7. **Sin interbloqueos.** Si el servicio usa más de un cerrojo, un comentario documenta el orden global en que se adquieren (Tema 5).

#### Archivo de Compose
```yaml
services:
  inventory:
    build: .
    ports: ["127.0.0.1:8000:8000"]
    volumes: ["inventory-data:/data"]
    init: true
    healthcheck:
      test: ["CMD", "java", "/app/Healthcheck.java"]
      interval: 10s
      timeout: 5s
      retries: 3
    mem_limit: 256m
    cpus: 0.50
volumes:
  inventory-data:
```

```text
$ docker compose config --quiet && echo "compose.yaml válido"
compose.yaml válido
$ docker compose version
Docker Compose version v5.7.1
```

**Explicación por partes.**
- `build: .` construye la imagen con el `Dockerfile` de la carpeta, como `docker build`.
- `ports` publica el 8000 solo en `127.0.0.1`: desde otros equipos no se puede entrar.
- `volumes` monta `inventory-data` en `/data`; el bloque final `volumes:` lo declara.
- `init: true` agrega un proceso PID 1 mínimo que reenvía las señales a tu programa y recoge procesos terminados.
- `healthcheck` ejecuta `java /app/Healthcheck.java` cada 10 s, con 5 s de plazo porque compilar el archivo tarda un poco; tras 3 fallos seguidos, Docker marca el contenedor como `unhealthy`.
- `mem_limit` y `cpus` crean el cgroup del Tema 4: 256 MB y medio núcleo. La JVM lee ese límite y ajusta su heap, como viste en el Problema resuelto 4.4.
- `docker compose config --quiet` valida la sintaxis sin construir nada. Este archivo no se levantó en el equipo de referencia: tu evidencia es `docker compose up -d` y `docker compose ps` mostrando `healthy`.

#### Criterio de terminado
Desde un clon limpio, `docker compose up -d --build` deja el servicio `healthy`. `docker compose down` seguido de
`up` conserva los datos, y `docker compose stop` muestra en el log el mensaje de apagado limpio. El código de salida
será 143: es lo normal en Java tras `SIGTERM`.

</details>
