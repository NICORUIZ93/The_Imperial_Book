# Revisión independiente: Docker · módulo 0 (5 temas)

- Archivo revisado: `web/public/content/docker/modulo-0.md` (1004 líneas). No se editó.
- Fecha: 2026-11-18. Revisor independiente (no autor).
- Entorno de prueba: Ubuntu 24.04.5, kernel 6.18, root, util-linux 2.39.3, bash 5.2.21, `/bin/sh` = dash,
  sin swap, **cgroup v1 (híbrido)**: el controlador de memoria está ligado a v1, así que el tema 4 no se pudo ejecutar
  tal como está escrito; se verificó su lógica con el equivalente v1.
- Archivos copiados con su contenido exacto a `/tmp/revision/tema1` … `/tmp/revision/tema5` y ejecutados sin `sudo`.

## 1. Tabla de puntajes

Rúbrica MASTER-PROMPT v3 §6 (1 a 5). Se publica con ≥4 en todo y 5 en exactitud.

| Criterio | Tema 1 Señales | Tema 2 Capacidades | Tema 3 Namespaces | Tema 4 cgroups v2 | Tema 5 Sin Docker |
|---|---|---|---|---|---|
| Exactitud técnica | 4 | 3 | 3 | 4 | 3 |
| Actualidad | 5 | 4 | 4 | 4 | 5 |
| Claridad para principiantes | 5 | 4 | 5 | 4 | 5 |
| Profundidad para expertos | 3 | 4 | 4 | 4 | 4 |
| Ejemplo ejecutable | 5 | 3 | 4 | 2 | 5 |
| Ayudas visuales | 5 | 5 | 5 | 2 | 5 |
| Ejercicios | 3 | 4 | 4 | 4 | 3 |
| Accesibilidad | 4 | 4 | 4 | 4 | 4 |
| **¿Publicable?** | No | No | No | No | No |

Ningún tema llega a 5 en exactitud. Los temas 1, 3 y 5 están cerca: necesitan correcciones de texto, no
reescritura. El tema 2 tiene un error en el código. El tema 4 sigue sin captura y sin una ejecución real en cgroup v2.

## 2. Hallazgos de exactitud

### Tema 1: procesos y señales

1. **Falta el caso especial del PID 1, y la tabla engaña justo en el contexto de Docker.** El texto dice
   «SIGTERM (15) … 143 si no la atendió» y, dos párrafos después, «Dentro de un contenedor, tu programa suele ser el **PID 1**».
   Pero el kernel **no** aplica la acción por defecto (morir) a las señales que recibe el PID 1 de un namespace
   cuando ese proceso no instaló un manejador. Así que un PID 1 sin `trap` **ignora** SIGTERM, `docker stop`
   espera los 10 s y termina con 137, no con 143. Lo comprobé: `unshare --pid --fork --mount-proc bash worker_sin_trap.sh`
   y luego `kill -TERM` desde fuera; el proceso siguió vivo («SIGUE VIVO tras SIGTERM»). El diagnóstico del fallo
   deliberado («En un contenedor verías que `docker stop` tarda») acierta en lo que pasa, pero no explica la causa.
   Es la idea más importante de este tema para Docker (`--init`, tini) y no aparece.
2. «`docker stop` le envía SIGTERM y, si no termina en 10 segundos, le envía SIGKILL» es correcto para el valor
   por defecto, pero `STOPSIGNAL`, `--stop-signal` y `--stop-timeout`/`-t` lo cambian (opcional mencionarlo).
3. Ejercicio de nivel 3: «la señal le llega a `sh`, no a Python» **depende de la distribución**. En Ubuntu
   (dash 0.5.12) se reproduce: obtuve 143, Python quedó huérfano y vivo. En Fedora y Arch, `sh` es bash, y
   `bash -c "python3 contador.py"` hace `exec` implícito del único comando. Lo comprobé: con `bash -c` la salida fue
   «guardé 2 segundos» y 0, es decir, **no hay nada que demostrar**. El módulo dice que Fedora sirve.
   Además, el Python huérfano sigue corriendo y la solución no indica cómo terminarlo.

### Tema 2: usuarios y capacidades

4. **Error en el código: el bit 31 no es `setpcap`.** `NOMBRES = {… 31: "setpcap"}`: `CAP_SETPCAP` es el bit **8**
   y el bit 31 es `CAP_SETFCAP` (`man 7 capabilities`, `linux/capability.h`). Lo comprobé:
   con `setpriv --bounding-set -setpcap` el script sigue mostrando «setpcap», y con `--bounding-set -setfcap`
   deja de mostrarlo. El ejemplo enseña un dato falso.
5. «Los demás usuarios solo pueden tocar sus propios archivos» es falso tal cual: lo que decide el acceso son los bits de
   permiso (dueño/grupo/otros) y las ACL. Un usuario normal lee `/etc/passwd` y escribe en `/tmp`.
6. «no pueden, por ejemplo, abrir puertos menores que 1024» y la tabla «`net_bind_service` | abrir puertos
   menores que 1024» omiten que el umbral lo fija `net.ipv4.ip_unprivileged_port_start` (1024 por defecto en el host;
   aquí también valía 1024). Esto importa en un curso de Docker: desde Docker 20.10 los contenedores arrancan con
   `ip_unprivileged_port_start=0`, así que un usuario sin privilegios **dentro** de un contenedor puede abrir el puerto 80
   sin `NET_BIND_SERVICE`. La rúbrica del reto de nivel 3 («Forma 1 … `--cap-add NET_BIND_SERVICE`») queda
   incompleta sin esto.
7. «Linux lo divide en unas 40 capacidades»: correcto (41 en kernels actuales, bits 0 a 40). Las afirmaciones sobre `CapEff` y `CapBnd` son correctas.

### Tema 3: namespaces

8. «Linux tiene varios tipos; los que usa todo contenedor son: … USER | UID y GID | puede ser «root» dentro sin serlo fuera».
   **Falso para Docker por defecto**: Docker no crea un namespace de usuario si no se configura `userns-remap` o
   se usa el modo rootless. Por eso, en el tema 5, el ejercicio 1 concluye con razón que el contenedor es root.
   La tabla contradice al tema 5. Además falta el namespace **cgroup**, que Docker usa por defecto en hosts con cgroup v2
   (`--cgroupns=private`); hay también un namespace `time` que Docker no usa.
9. «PID … él mismo es el PID 1 y solo ve a sus hijos» es impreciso: ve a todos los procesos de su namespace
   (sus descendientes), no solo a sus hijos directos.
10. «NET … solo `lo`»: correcto, aunque `lo` empieza **apagada** (DOWN). Se puede mencionar si luego se usa la red.
11. Las explicaciones de `--fork` y `--mount-proc` son correctas, y el fallo deliberado también.

### Tema 4: cgroups v2

12. «Cuando un proceso supera `memory.max`, el kernel no le niega memoria con un error: lo **mata** (OOM kill)
    con SIGKILL» simplifica demasiado. Primero intenta recuperar memoria (caché de páginas y swap). Si no puede,
    el OOM killer elige a un proceso **del cgroup**, normalmente el que más usa, que no siempre es el que pidió
    la memoria. «Por eso un contenedor que se queda sin memoria termina con código 137» solo es cierto si muere
    el proceso principal. Si muere un hijo, el contenedor puede seguir.
13. `memory.peak` (ejercicio 1) existe desde el kernel **5.19**. El prerrequisito dice «Ubuntu 22.04 o superior»,
    pero 22.04 trae el kernel 5.15 (el GA, sin HWE), donde el archivo no existe.
14. Son correctas: el uso de `cgroup.subtree_control`, `memory.max` con sufijo `50M` (en v1 el mismo `memparse` dio
    52428800), `memory.swap.max`, `memory.events`/`oom_kill`, `cpu.max "20000 100000"` = `--cpus=0.2`,
    `--memory` sin `--memory-swap` (swap adicional igual a `--memory`) y `.State.OOMKilled`.

### Tema 5: contenedor sin Docker

15. La rúbrica del reto de nivel 3 enumera como «protecciones que Docker agrega»:
    - «namespace de usuario (root dentro no es root fuera)»: **no** está activo por defecto (ver hallazgo 8).
    - «cgroups por defecto para PID (evita una bomba de procesos)»: **falso**. Docker no fija `--pids-limit`
      por defecto (sin límite), y tampoco fija límite de memoria.
    Un estudiante que copie esa tabla aprende dos protecciones que su `docker run` no tiene.
16. «`pivot_root` en lugar de `chroot` (no se puede salir de la raíz)» exagera. Con `pivot_root` y el desmontaje de la raíz vieja
    falla el escape clásico de `chroot`, pero con `CAP_SYS_ADMIN` existen otros escapes. Mejor: «es mucho más difícil salir de la raíz».
17. Son correctas: `chroot` frente a `pivot_root` (runc usa `pivot_root`), la explicación de `ldd` y del cargador dinámico,
    el error engañoso «No such file or directory» y la idea de que «una imagen es en esencia una carpeta».

### Introducción del módulo

18. «Docker de cero a experto» tiene 1 módulos»: error de concordancia, y además contradice la tabla de
    RutaFlow (módulos 0–11). Si el texto lo genera un script, hay que corregir el generador.

## 3. Lo que ejecuté y su resultado real

| Tema | Qué | Resultado | ¿Coincide con el texto? |
|---|---|---|---|
| 1 | `bash demo.sh` | 7 líneas idénticas a «Resultado esperado» (0 y 137) | Sí |
| 1 | Fallo deliberado (sin `trap`) | `código de salida tras SIGTERM: 143` | Sí |
| 1 | Ejercicio 1 (`apagado.log`) | una sola línea «apagado ordenado a las 15:50:16» | Sí |
| 1 | Ejercicio 2 `contador.py` (solución) | «guardé 2 segundos», `0`; sin manejador `143` | Sí (el Python es correcto) |
| 1 | Ejercicio 3 con `sh` = dash | `143`, Python huérfano sigue vivo | Sí, pero queda un proceso suelto |
| 1 | Ejercicio 3 con `bash -c` (equivale a Fedora) | «guardé 2 segundos», `0` | **No**: el problema no se reproduce |
| 1 | Ejercicio 3 con `exec` | «guardé 2 segundos», `0` | Sí |
| 1 | Extra: worker sin `trap` como PID 1 (`unshare --pid --fork`) + `kill -TERM` | el proceso **sigue vivo** | El texto no lo explica (hallazgo 1) |
| 2 | 3 ejecuciones de `capacidades.py` | root 40 capacidades / nobody 0 / nobody 1 y puerto 80 «sí» | Sí, pero en la tercera ejecución el texto **omite** la línea `¿puede abrir el puerto 80? sí` (la captura SVG sí la tiene) |
| 2 | Fallo deliberado `+net_admin` | `net_admin`, `no (PermissionError)` | Sí |
| 2 | `--bounding-set -setpcap` / `-setfcap` | el nombre «setpcap» aparece o desaparece con **setfcap** | Confirma el error del bit 31 |
| 2 | nobody con la carpeta personal en 750 (Ubuntu ≥21.04, `HOME_MODE 0750` en `/etc/login.defs`) | `python3: can't open file …: [Errno 13] Permission denied` | **No**: el principiante se bloquea |
| 2 | Ejercicios 1 y 2 | `CapEff` 0 y `CapBnd` lleno como nobody; root «puede escribir en /etc», nobody «no puede» | Sí |
| 3 | `bash namespaces.sh` | idéntico (`1 sh`, `2 ps`, `lo`) | Sí (con dash) |
| 3 | Mismo comando con `bash -c` | dentro solo aparece `1 ps` (bash hace `exec` del último comando) | **No** en Fedora/Arch |
| 3 | Fallo sin `--mount-proc` | 91 líneas: procesos del host (`1 process_api`, `2 kthreadd`…) | Sí |
| 3 | Ejercicio 1 (`/proc/self/ns`) | cambian solo `uts` y `net`; las demás (incluidas `cgroup` y `time`) no cambian | Sí |
| 3 | Ejercicios 2 y 3 | `sleep` PID 2 dentro y 7143 fuera; `nsenter … ps -e` muestra 1 sleep, 2 sleep, 3 ps | Sí, **pero** `pgrep -n sleep` devolvió otro proceso (`sleep 0.2`) |
| 4 | `bash limitar-memoria.sh` en v1 | `este host no usa cgroup v2`, código 1 | La comprobación funciona |
| 4 | Equivalente en v1 (`memory.limit_in_bytes=50M`, mismo `sh -c … exec python3`) | `52428800`, **`/bin/bash: line 1: 7662 Killed  sh -c …`**, `código de salida: 137`, `oom_kill 1` | La lógica es correcta, pero bash imprime una línea «Killed» en stderr que el «Resultado esperado» no muestra |
| 4 | `bytearray(100 MiB)` | maxrss 111 MiB: sí toca las páginas | Sí, la reserva es real |
| 5 | `bash aislar.sh` | idéntico: 19 archivos, `bin lib lib64 proc`, `1 sh`, `6 ps`, `lo` | Sí |
| 5 | Fallo (bucle de bibliotecas comentado) | `chroot: failed to run command '/bin/sh': No such file or directory`, código 127 | Sí |
| 5 | Ejercicio 1 (`id`) | `dentro: 0` | Sí |
| 5 | Ejercicio 2 (`head -c 50M /dev/zero \| tail`, `mknod /dev/zero c 1 5`, cgroup v1 de 20M) | `Killed`, `dentro: código 137`, `oom_kill 1` | Sí (lógica comprobada en v1) |

Las cuatro capturas SVG existentes coinciden con salidas reales. El tema 4 sigue con «Captura pendiente».

## 4. Simulación de un principiante desde una carpeta vacía: dónde se pierde

1. **Introducción:** lee «tiene 1 módulos» justo después de una tabla con los módulos 0–11. No sabe si el curso está incompleto.
2. **Tema 1:** «Crea la carpeta `~/academia-docker/m0-senales`», pero el encabezado dice «Archivo
   `academia-docker/m0-senales/worker.sh`», sin `~/`. Funciona si estaba en `~`, aunque confunde. En el ejercicio 3, en Fedora
   ve «guardé…» y 0 en la demostración del problema y cree que lo hizo mal. En Ubuntu le queda un `python3` huérfano
   imprimiendo cada segundo y no sabe cómo detenerlo.
3. **Tema 2:** en Ubuntu 21.04 o superior (la versión recomendada), la segunda y la tercera ejecución fallan con
   `Permission denied`, porque `nobody` no puede entrar en `~` (permisos 750). Es el bloqueo más grave del módulo. En la tercera
   ejecución ve una línea «sí» que el resultado esperado no tiene. El proyecto integrador (worker como `nobody`) y los
   ejercicios 1 y 2 chocan con el mismo problema de permisos.
4. **Tema 3:** en el ejercicio 3, `pgrep -n sleep` puede devolver otro `sleep` del sistema y `nsenter` entra en el
   proceso equivocado. El enunciado pide `hostname`, pero la solución no lo ejecuta, y como el ejercicio 2 no creó un namespace UTS,
   verá el mismo nombre de host sin entender por qué.
5. **Tema 4:** si su sistema no tiene swap (frecuente en máquinas virtuales en la nube), el fallo deliberado no falla y no sabe
   qué observar. En Ubuntu 22.04 con el kernel GA, `memory.peak` no existe. El resultado real tiene una línea
   `... Killed sh -c ...` que no aparece en el esperado. En el ejercicio 2 no sabe que debe crear su propio grupo, porque el script del
   ejemplo lo borra al final con `rmdir`.
6. **Tema 5:** en el ejercicio 2, «escribe el PID de tu shell en `cgroup.procs`» falla con `Permission denied` si
   usa `sudo echo $$ > …`, porque la redirección no se hace como root. Además su shell queda atrapada en un grupo de 20M y no
   puede borrarlo hasta cerrarla. Crear `/dev/zero` (`mknod`) no se explica.

## 5. Correcciones obligatorias (bloquean la publicación)

**O1 · Tema 1, PID 1 (exactitud).** Después de «Por eso el programa debe atender SIGTERM.», añadir:
> «Ojo: el PID 1 es especial. El kernel no le aplica la acción por defecto de una señal si el proceso no instaló
> un manejador, así que un PID 1 sin `trap` **ignora** SIGTERM: no sale con 143, sino que `docker stop` espera los 10 s
> y lo mata con SIGKILL (137). Por eso existen `docker run --init` y `tini`.»

En la tabla, cambiar «0 si limpió, 143 si no la atendió» por «0 si limpió; 143 si no la atendió (fuera de un
contenedor; si es PID 1, la ignora)». En el diagnóstico del fallo deliberado, cambiar «En un contenedor verías que
`docker stop` tarda o que se pierden datos» por «En un contenedor, como PID 1, ni siquiera moriría: `docker stop`
tardaría 10 s y acabaría en 137».

**O2 · Tema 1, ejercicio 3 (portabilidad).** Cambiar la demostración `sh -c "python3 contador.py"` por
`sh -c "python3 contador.py; echo fin"`. Con dos comandos, ninguna shell hace `exec`, y el problema se reproduce en Ubuntu y en Fedora.
Añadir: «Python queda huérfano y sigue contando: termínalo con `pkill -f contador.py`». Explicar en la rúbrica que
algunas shells ya hacen `exec` del último comando por su cuenta, y que por eso no conviene confiar en ello.

**O3 · Tema 2, bit 31.** Cambiar `21: "sys_admin", 31: "setpcap"}` por `8: "setpcap", 21: "sys_admin"}`, o por
`31: "setfcap"`, y actualizar el resultado esperado y la captura: «chown, dac_override, setpcap, net_bind_service, net_admin, sys_admin».

**O4 · Tema 2, resultado esperado incompleto.** Añadir al final del bloque `text` la línea
`  ¿puede abrir el puerto 80? sí`.

**O5 · Tema 2, permisos de la carpeta personal.** Antes de «Ejecútalo tres veces», añadir:
> «En Ubuntu 21.04 o superior tu carpeta personal tiene permisos 750 y `nobody` no puede leer el script. Trabaja desde una
> copia: `cp capacidades.py /tmp/ && cd /tmp`.»

Aplicar lo mismo a los ejercicios 1 y 2 y al proyecto integrador.

**O6 · Tema 2, puertos bajos.** Cambiar «Los demás usuarios solo pueden tocar sus propios archivos y no pueden, por
ejemplo, abrir puertos menores que 1024» por «Los demás usuarios quedan limitados por los permisos de cada archivo y,
por defecto, no pueden abrir puertos menores que 1024 (el umbral lo fija `net.ipv4.ip_unprivileged_port_start`)».
En la rúbrica del nivel 3 añadir: «Dentro de un contenedor, Docker (desde 20.10) pone ese umbral en 0, así que
un usuario sin privilegios ya puede escuchar en el 80 sin `NET_BIND_SERVICE`».

**O7 · Tema 3, tabla de namespaces.** Cambiar «los que usa todo contenedor son:» por «los que usa un contenedor de
Docker son (USER solo si activas `userns-remap` o Docker rootless):». Añadir la fila
`| CGROUP | la vista de la jerarquía de cgroups | su propio `/sys/fs/cgroup` como raíz |`. Cambiar «solo ve a sus
hijos» por «solo ve a los procesos de su namespace».

**O8 · Tema 3, resultado según la shell.** Debajo del resultado esperado, añadir: «Si tu `/bin/sh` es bash (Fedora,
Arch), puede que veas solo `1 ps`: bash reemplaza la shell por el último comando». Otra opción es cambiar `sh -c` por
`dash -c` o añadir `; true` al final del comando.

**O9 · Tema 3, ejercicio 3.** Cambiar `pid=$(pgrep -n sleep)` por `pid=$(pgrep -f 'sleep 300')` y añadir `hostname`
a la solución: `sudo nsenter --target "$pid" --pid --mount --uts sh -c 'hostname; ps -e'`. Explicar que el nombre
coincide con el del host porque el ejercicio 2 no creó un namespace UTS.

**O10 · Tema 4, OOM.** Cambiar «Cuando un proceso supera `memory.max`, el kernel no le niega memoria con un error: lo
**mata** (OOM kill) con SIGKILL. Por eso un contenedor que se queda sin memoria termina con código 137.» por:
> «Cuando el grupo llega a `memory.max`, el kernel primero intenta liberar memoria (caché y swap). Si no puede, el OOM
> killer mata con SIGKILL a un proceso del grupo, normalmente el que más usa. Si ese proceso es el principal del
> contenedor, el contenedor termina con 137.»

**O11 · Tema 4, resultado esperado y captura.** Añadir al resultado esperado, antes de `código de salida: 137`,
la línea que bash imprime en stderr (`limitar-memoria.sh: línea 9: NNNN Matado  sh -c …`, o «Killed» con locale en
inglés) y explicarla. Tomar la captura real en un host con cgroup v2 con `scripts/render_terminal_capture.py`. Hasta entonces,
«Ayudas visuales» y «Ejemplo ejecutable» no pueden subir de 2.

**O12 · Tema 4, `memory.peak`.** Cambiar el prerrequisito por «Ubuntu 22.04 con kernel 5.19 o superior (HWE), o Ubuntu
24.04» o, en el ejercicio 1, añadir: «`memory.peak` existe desde el kernel 5.19; si no lo tienes, mira solo `memory.current`».

**O13 · Tema 5, rúbrica del reto.** Quitar «namespace de usuario» y «cgroups por defecto para PID» de la lista de
protecciones por defecto de Docker, o marcarlas como «disponibles si las activas (`userns-remap`, `--pids-limit`)».
Las protecciones que Docker sí aplica por defecto son: capacidades recortadas, seccomp, AppArmor/SELinux, `pivot_root`, `/proc` y
`/sys` parcialmente de solo lectura o enmascarados, y `no-new-privileges` (opcional). Cambiar «(no se puede salir de la raíz)» por «(es
mucho más difícil salir de la raíz que con `chroot`)».

**O14 · Introducción.** Cambiar «tiene 1 módulos» por «tiene, por ahora, 1 módulo publicado (el plan completo va del 0
al 11)». Si la frase sale de un generador, corregir la concordancia en ese script.

## 6. Correcciones opcionales (mejoran la nota)

- P1 · Tema 1: mencionar `STOPSIGNAL`, `--stop-signal` y `docker stop -t` (profundidad para expertos).
- P2 · Tema 1: unificar las rutas: «Archivo `~/academia-docker/m0-senales/worker.sh`» en lugar de `academia-docker/…`, en los 5 temas.
- P3 · Tema 3: indicar que `lo` empieza DOWN (`ip link set lo up` dentro).
- P4 · Tema 4, fallo deliberado: añadir «Si `swapon --show` no muestra nada, no tienes swap y este fallo no cambia
  el resultado: es lo esperado».
- P5 · Tema 4, ejercicios 1 y 2: dar los comandos para crear el grupo (el script del ejemplo lo borra con `rmdir`), por ejemplo
  `sudo mkdir /sys/fs/cgroup/ej1 && echo 50M | sudo tee /sys/fs/cgroup/ej1/memory.max`.
- P6 · Tema 4: mencionar que `memory.swap.max` solo existe si el kernel tiene la contabilidad de swap activa.
- P7 · Tema 5, ejercicio 2: usar `echo $$ | sudo tee /sys/fs/cgroup/<grupo>/cgroup.procs`, explicar
  `sudo mknod -m 666 raiz-minima/dev/zero c 1 5` y cómo salir del grupo (`echo $$ | sudo tee /sys/fs/cgroup/cgroup.procs`) antes de `rmdir`.
- P8 · Accesibilidad: añadir una frase que describa cada diagrama Mermaid para lectores de pantalla (el texto alrededor
  lo describe solo en parte). La captura del tema 2 muestra un encabezado cortado (« +net_bind_service python3 capacidades.py»).

## 7. Resumen

Los ejemplos de los temas 1, 3 y 5 funcionan tal como están escritos en Ubuntu, y las soluciones en Python y bash son correctas.
Los bloqueos son: un error de código (bit 31 = `setfcap`), afirmaciones falsas sobre lo que Docker hace por defecto
(namespace de usuario y límite de PID), la omisión del comportamiento del PID 1 ante las señales, un bloqueo por permisos en el tema 2
que afecta a la distribución recomendada, problemas de portabilidad con Fedora y el tema 4 sin verificar ni capturar en cgroup v2.

Veredicto: requiere cambios
