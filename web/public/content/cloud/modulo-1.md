# Módulo 1: Fundamentos de Docker y contenedores


## Aprende construyendo

### Tema 1: Virtualización vs contenedores

#### Paso 1 · Objetivo y preparación
Al finalizar podrás comparar virtualización y contenedores desde cero. Prerrequisitos: Docker; verifica `docker --version`.
#### Paso 2 · Contexto y caso real
Un servicio cloud necesita aislamiento y un coste de ejecución razonable.
#### Paso 3 · Teoría, modelo mental y analogía
Una VM emula una casa completa; un contenedor comparte cimientos y aísla habitaciones.

**Conceptos clave:** hipervisor, máquina virtual, kernel compartido, aislamiento de procesos, sobrecarga de recursos.

La virtualización tradicional funciona instalando un hipervisor sobre tu sistema operativo (o directamente sobre el hardware), que crea máquinas virtuales completas: cada una con su propio kernel, su propio sistema operativo instalado desde cero, y sus propios recursos de CPU y memoria reservados. Si quieres correr tres aplicaciones aisladas con máquinas virtuales, estás cargando tres sistemas operativos completos, cada uno con su propio consumo de arranque, de memoria y de disco, incluso si las tres aplicaciones son ligeras.

Los contenedores resuelven el mismo problema —aislar aplicaciones para que no interfieran entre sí— de una forma radicalmente más ligera: en vez de virtualizar hardware completo, aíslan procesos dentro del mismo kernel del sistema operativo anfitrión. Un contenedor no arranca un sistema operativo nuevo; arranca un proceso (o varios) que cree estar solo en su propio sistema de archivos, su propia red y su propio espacio de procesos, pero en realidad comparte el kernel de Linux (o de Windows) con el resto de contenedores y con el propio host. Esto es posible gracias a mecanismos del kernel como los namespaces (que aíslan qué ve cada proceso) y los cgroups (que limitan cuánta CPU y memoria puede usar).

La consecuencia práctica es enorme: un contenedor típico arranca en menos de un segundo, mientras que una máquina virtual puede tardar decenas de segundos o minutos en arrancar su sistema operativo completo. Un contenedor pesa, en muchos casos, decenas de megabytes; una máquina virtual con su sistema operativo completo puede pesar varios gigabytes. Esto es exactamente lo que hace posible que en este curso levantes y destruyas Floci en segundos, tantas veces como quieras, sin esperar minutos cada vez.

Esto no significa que los contenedores reemplacen completamente a las máquinas virtuales: las máquinas virtuales siguen siendo necesarias cuando se necesita aislar kernels distintos (por ejemplo, correr Windows y Linux en la misma máquina física), o cuando se necesita el aislamiento de seguridad más fuerte posible entre cargas de trabajo que no confían entre sí. De hecho, Docker Desktop en macOS y Windows internamente usa una máquina virtina ligera de Linux para poder ejecutar contenedores Linux sobre esos sistemas operativos, porque los contenedores Linux necesitan un kernel Linux por debajo.

**Analogía:** una máquina virtual es como construir un edificio completo nuevo —con su propia estructura, tuberías y sistema eléctrico— cada vez que quieres alquilar una oficina. Un contenedor es como alquilar una oficina dentro de un edificio ya construido: compartes la estructura, las tuberías y la electricidad del edificio (el kernel), pero tu oficina está completamente separada y con llave propia de las demás.

**¿Por qué es importante?** Docker, y por extensión los contenedores, se convirtieron en el estándar de la industria para empaquetar y distribuir software precisamente por esta ligereza: te permite correr docenas de servicios aislados en un portátil normal, algo impensable con máquinas virtuales completas. Todo el ecosistema de nube moderno —incluyendo cómo se distribuyen y ejecutan Floci, tus propias aplicaciones, y servicios como ECS o Kubernetes que verás en módulos avanzados— se construye sobre esta idea.

**Diagrama:**

```mermaid
flowchart LR
    subgraph VM["VIRTUALIZACIÓN TRADICIONAL — 3 SO completos, más pesado"]
        direction TB
        VA["App A — SO A"]
        VB["App B — SO B"]
        VC["App C — SO C"]
        VH["Hipervisor"]
        VHW["Hardware físico"]
        VA --> VH
        VB --> VH
        VC --> VH
        VH --> VHW
    end
    subgraph CT["CONTENEDORES — 1 kernel compartido, más ligero"]
        direction TB
        CA["App A"]
        CB["App B"]
        CC["App C"]
        CE["Docker Engine"]
        CK["Kernel del host (Linux)"]
        CHW["Hardware físico"]
        CA --> CE
        CB --> CE
        CC --> CE
        CE --> CK
        CK --> CHW
    end
```

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Ejecuta el servicio de entregas dentro de un contenedor y registra qué comparte con el host. Reinícialo y comprueba que los datos persistentes dependen del volumen configurado, no del proceso anterior.

#### Paso 4 · Demostración guiada
Crea `src/isolation.md` desde una carpeta vacía.
```bash
mkdir ejemplo-contenedores
docker --version
```
Resultado esperado: Docker disponible.
#### Paso 5 · Práctica guiada
Pista: ejecuta un contenedor con recurso inválido para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Compara memoria y tiempo de arranque y conserva la salida.
#### Paso 7 · Cierre
Entrega comandos, salida, fallo y corrección; explica el resultado. Siguiente paso: imágenes. Errores comunes: confundir aislamiento con seguridad total y olvidar límites. Fuente oficial: https://docs.docker.com/get-started/docker-overview/.

### Tema 2: Imágenes y capas

#### Paso 1 · Objetivo y preparación
Al finalizar podrás construir una imagen desde cero. Prerrequisitos: Docker; verifica `docker --version`.
#### Paso 2 · Contexto y caso real
Una imagen reproducible evita diferencias entre desarrollo y producción.
#### Paso 3 · Teoría, modelo mental y analogía
Las capas son transparencias acumuladas; una capa inmutable puede reutilizarse.

**Conceptos clave:** imagen, capa (layer), Dockerfile, caché de construcción, inmutabilidad.

Una imagen Docker es un paquete inmutable que contiene todo lo necesario para ejecutar una aplicación: el código, las dependencias, las librerías del sistema, las variables de entorno por defecto, y el comando que se ejecuta al arrancar. Un contenedor, en cambio, es una instancia en ejecución de una imagen: puedes crear diez contenedores distintos a partir de la misma imagen, cada uno con su propio estado en memoria y en disco, igual que puedes crear varios documentos distintos a partir de la misma plantilla.

Las imágenes se construyen en capas. Cada instrucción de un Dockerfile —el archivo de texto que describe cómo se construye una imagen— genera una capa nueva que se apila sobre la anterior. Si la primera capa instala el sistema operativo base, la segunda instala las dependencias, y la tercera copia el código de la aplicación, Docker guarda cada una de esas capas por separado, y las reutiliza como caché si vuelves a construir la imagen y esa capa no cambió. Esto acelera enormemente las reconstrucciones: si solo cambias tu código de aplicación (la última capa), Docker no vuelve a instalar el sistema operativo ni las dependencias, solo reconstruye la capa que cambió.

Este diseño en capas también explica por qué las imágenes se pueden compartir eficientemente: si dos imágenes distintas comparten las mismas primeras capas (por ejemplo, ambas se basan en la misma imagen de Node.js), Docker solo necesita descargar esas capas una vez y las reutiliza para ambas imágenes. Es exactamente lo que ocurre cuando descargas la imagen de Floci: Docker descarga cada capa que compone esa imagen, y si en el futuro descargas otra imagen que comparte alguna de esas capas base, no las vuelve a descargar.

La inmutabilidad de las imágenes es una propiedad de diseño deliberada: una vez construida, una imagen no cambia. Si necesitas una versión distinta de tu aplicación, construyes una imagen nueva (normalmente con una etiqueta de versión distinta, como `mi-app:1.1` en vez de `mi-app:1.0`), en vez de modificar la imagen existente. Esto es lo que hace que los despliegues con contenedores sean predecibles: la imagen que probaste en tu máquina es exactamente la misma que se ejecuta en cualquier otro entorno, byte por byte.

**Analogía:** una imagen es como la receta impresa de un pastel, con cada paso (capa) numerado y guardado por separado: la masa base, el relleno, la cobertura. Si cambias solo la cobertura, no necesitas rehacer la masa ni el relleno desde cero; reutilizas esos pasos ya hechos. Un contenedor es el pastel horneado a partir de esa receta: puedes hornear varios pasteles idénticos (contenedores) a partir de la misma receta (imagen), y cada uno existe de forma independiente una vez servido.

**¿Por qué es importante?** Entender la diferencia entre imagen y contenedor es la base para entender casi cualquier comando de Docker que vas a usar en este módulo: `docker images` lista las recetas que tienes descargadas, `docker ps` lista los pasteles (contenedores) que están actualmente en el horno (ejecutándose). Confundir estos dos conceptos es el error más común de quien empieza con Docker.

**Diagrama:**

```mermaid
flowchart TD
    D1["FROM node:20"] --> L1["Capa 1: node:20 base"]
    D2["RUN npm install"] --> L2["Capa 2: dependencias"]
    D3["COPY . ."] --> L3["Capa 3: código app"]
    D4["CMD node app.js"]
    L1 --> L2 --> L3 --> IMG["Imagen (capas apiladas)"]
    IMG -->|"docker run"| CNT["Contenedor (instancia en ejecución,\ncon su propio estado)"]
```

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Construye la imagen del consumidor de entregas y modifica solo su código. Compara capas reutilizadas y tamaño final; la imagen debe arrancar sin archivos de desarrollo ni credenciales incorporadas.

#### Paso 4 · Demostración guiada
Crea `src/image.js` y `Dockerfile` en `ejemplo-imagen` desde una carpeta vacía.
```bash
mkdir ejemplo-imagen
docker --version
```
Resultado esperado: contexto listo.
#### Paso 5 · Práctica guiada
Pista: usa una instrucción inválida para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Reduce capas y compara tamaños.
#### Paso 7 · Cierre
Entrega Dockerfile, salida, fallo y corrección; explica el resultado. Siguiente paso: registros. Errores comunes: copiar secretos y usar etiquetas ambiguas. Fuente oficial: https://docs.docker.com/build/building/best-practices/.

### Tema 3: Registros de contenedores (Docker Hub)

#### Paso 1 · Objetivo y preparación
Al finalizar podrás publicar una imagen de forma segura. Prerrequisitos: Docker; verifica `docker --version`.
#### Paso 2 · Contexto y caso real
Un registro distribuye artefactos y controla quién puede descargarlos.
#### Paso 3 · Teoría, modelo mental y analogía
Un registry es una biblioteca con estanterías, etiquetas y permisos.

**Conceptos clave:** registro (registry), repositorio, etiqueta (tag), imagen pública vs privada.

Un registro de contenedores es un servidor que almacena y distribuye imágenes Docker, de forma parecida a como un repositorio de Git almacena y distribuye código fuente. Docker Hub es el registro público más usado del mundo: cuando ejecutas `docker pull floci/floci:latest`, Docker contacta con Docker Hub, localiza el repositorio `floci/floci`, descarga la imagen etiquetada como `latest`, y la guarda localmente para que puedas usarla con `docker run`.

Cada imagen en un registro vive dentro de un repositorio, identificado normalmente como `usuario-u-organización/nombre-imagen`, y cada repositorio puede tener múltiples versiones distinguidas por etiquetas (tags). La etiqueta `latest` es una convención —no una regla técnica— que casi todos los proyectos usan para señalar la versión más reciente estable, pero en proyectos serios es buena práctica fijar una versión explícita (como `floci/floci:2.3.0`) en vez de depender de `latest`, precisamente porque `latest` puede cambiar de contenido con el tiempo y romper algo que funcionaba antes sin previo aviso.

Además de Docker Hub, existen registros privados (para imágenes internas de una empresa que no deben ser públicas) y registros gestionados por proveedores de nube, como Amazon ECR, que vas a conocer en un módulo avanzado más adelante en este mismo track. El flujo de trabajo es siempre el mismo independientemente del registro: construyes una imagen localmente, la etiquetas con el nombre del registro de destino, y la subes (`push`) para que otras personas o sistemas puedan descargarla (`pull`).

Para este módulo, lo único que necesitas hacer es descargar (`pull`) imágenes ya publicadas —la de prueba `hello-world` y la de Floci—, sin necesidad de publicar nada tú mismo todavía. Publicar tus propias imágenes es algo que verás en el módulo avanzado de ECR/ECS, cuando empaquetes tu propia aplicación del proyecto final.

**Analogía:** Docker Hub es como una tienda de aplicaciones (App Store o Play Store) pero para contenedores: buscas por nombre, ves las versiones disponibles (como las versiones de una app), y descargas (`pull`) la que necesitas. La diferencia es que cualquiera puede publicar sus propias "aplicaciones" (imágenes) sin pasar por un proceso de revisión tan estricto como el de esas tiendas.

**¿Por qué es importante?** Sin un registro central, cada persona tendría que construir cada imagen desde cero en su propia máquina, incluyendo imágenes complejas como la de Floci, que empaqueta múltiples emuladores de servicios de nube. El registro es lo que hace posible que en el siguiente laboratorio simplemente ejecutes un comando de `pull` y tengas Floci funcionando en minutos, en vez de construirlo tú mismo desde su código fuente.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Cuando empaquetes tu propia API en el módulo de ECR/ECS, vas a repetir este mismo flujo (`build` → `tag` → `push`) pero contra un registro privado en vez de Docker Hub; fijar una versión explícita en vez de `latest` evita que un despliegue se rompa por un cambio silencioso en la imagen.

**Diagrama:**

```mermaid
flowchart LR
    A["Tu máquina\n(construyes)"] -->|"docker push"| B["Docker Hub\nfloci/floci:latest"]
    B -->|"docker pull"| C["Tu máquina\n(descargas)"]
```

#### Paso 4 · Demostración guiada
Crea `src/registry.md` en `ejemplo-registry` desde una carpeta vacía.
```bash
mkdir ejemplo-registry
docker --version
```
Resultado esperado: entorno listo.
#### Paso 5 · Práctica guiada
Pista: usa una etiqueta inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Documenta una etiqueta inmutable y una política de acceso.
#### Paso 7 · Cierre
Entrega configuración, salida, fallo y corrección; explica el resultado. Siguiente paso: comandos. Errores comunes: usar latest en producción y dejar repositorios públicos. Fuente oficial: https://docs.docker.com/docker-hub/.

### Tema 4: Comandos esenciales de Docker

#### Paso 1 · Objetivo y preparación
Al finalizar podrás operar contenedores desde cero. Prerrequisitos: Docker; verifica `docker --version`.
#### Paso 2 · Contexto y caso real
Operar incluye iniciar, inspeccionar, detener y diagnosticar.
#### Paso 3 · Teoría, modelo mental y analogía
Los comandos son controles de una flota: estado, arranque, parada y bitácora.

**Conceptos clave:** `pull`, `run`, `ps`, `stop`, `rm`, `images`, `exec`, `logs`.

Estos ocho comandos cubren el ciclo de vida completo de un contenedor y son, con diferencia, los que más vas a usar en todo el curso. `docker pull <imagen>` descarga una imagen desde un registro sin ejecutarla todavía. `docker run <imagen>` crea y arranca un contenedor nuevo a partir de una imagen (descargándola primero si no la tienes localmente); con la opción `-d` lo ejecuta en segundo plano (modo *detached*), y con `-p host:contenedor` mapea un puerto de tu máquina a un puerto dentro del contenedor, que es exactamente lo que vas a usar para exponer Floci en el puerto 4566.

`docker ps` lista los contenedores que están actualmente en ejecución, mostrando su ID, la imagen de la que provienen, cuánto tiempo llevan corriendo, y los puertos mapeados; añadiendo `-a` muestra también los contenedores detenidos, no solo los activos. `docker stop <id>` detiene un contenedor en ejecución de forma ordenada, enviándole una señal que le da tiempo a cerrar limpiamente antes de forzarlo. `docker rm <id>` elimina un contenedor ya detenido (no se puede eliminar uno en ejecución sin forzarlo con `-f`); esto libera el nombre y el espacio que ocupaba, pero no borra la imagen de la que provenía.

`docker images` lista las imágenes que tienes descargadas localmente, con su repositorio, etiqueta, ID y tamaño en disco; es el comando análogo a `docker ps` pero para imágenes en vez de contenedores en ejecución. `docker exec -it <id> <comando>` ejecuta un comando dentro de un contenedor que ya está corriendo, sin necesidad de detenerlo; el uso más común es abrir una terminal interactiva dentro del contenedor con `docker exec -it <id> /bin/sh` o `/bin/bash`, muy útil para inspeccionar el estado interno de Floci si algo no funciona como esperas.

`docker logs <id>` muestra la salida estándar (y de error) que ha generado un contenedor desde que arrancó; con la opción `-f` sigue mostrando nuevas líneas en tiempo real, similar a `tail -f` sobre un archivo de log. Este comando es tu primera herramienta de diagnóstico cuando algo en Floci no responde como esperas: casi siempre el motivo está explicado en sus logs.

**Analogía:** si piensas en un contenedor como un electrodoméstico, `docker pull` es comprarlo (llega a tu casa pero no está enchufado), `docker run` es enchufarlo y encenderlo, `docker ps` es mirar qué electrodomésticos están encendidos ahora mismo, `docker stop` es apagarlo con el botón (de forma ordenada), `docker rm` es sacarlo de la habitación una vez apagado, `docker exec` es abrir una trampilla de servicio para revisar su interior mientras sigue encendido, y `docker logs` es leer el panel de diagnóstico que muestra lo que ha estado haciendo.

**¿Por qué es importante?** Estos ocho comandos son, con diferencia, la interacción diaria más común con Docker en cualquier trabajo real que use contenedores. Vas a usarlos constantemente a lo largo de todo el curso, empezando por el laboratorio de este mismo módulo, así que vale la pena que los practiques hasta que los escribas sin pensar.

**Diagrama:**

```mermaid
flowchart TD
    P["docker pull"] --> IMG["imagen en disco"]
    IMG --> R["docker run"]
    R --> C["contenedor corriendo"]
    C --> PS["docker ps\n(ver si corre)"]
    C --> LOGS["docker logs\n(ver su salida)"]
    C --> EXEC["docker exec\n(entrar dentro)"]
    C --> STOP["docker stop\n(apagarlo)"]
    STOP --> RM["docker rm\n(eliminarlo)"]
```

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Escribe un procedimiento de diagnóstico para el emulador con listado, logs e inspección de puertos. Provoca un contenedor detenido y demuestra cómo identificarlo antes de recrear recursos cloud.

#### Paso 4 · Demostración guiada
Crea `src/commands.md` en `ejemplo-comandos` desde una carpeta vacía.
```bash
mkdir ejemplo-comandos
docker --version
```
Resultado esperado: entorno listo.
#### Paso 5 · Práctica guiada
Pista: consulta un contenedor inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Ejecuta un servicio, inspecciona logs y documenta su ciclo.
#### Paso 7 · Cierre
Entrega comandos, salida, fallo y corrección; explica el resultado. Siguiente paso: Compose. Errores comunes: borrar antes de leer logs y exponer puertos sin necesidad. Fuente oficial: https://docs.docker.com/engine/reference/commandline/cli/.

### Tema 5: Docker Compose — servicios, redes y volúmenes

#### Paso 1 · Objetivo y preparación
Al finalizar podrás coordinar servicios desde cero. Prerrequisitos: Docker Compose; verifica `docker compose version`.
#### Paso 2 · Contexto y caso real
Una aplicación necesita API, base de datos y red reproducible.
#### Paso 3 · Teoría, modelo mental y analogía
Compose es el plano de un edificio: servicios, conexiones y almacenamiento.

**Conceptos clave:** `docker-compose.yml`, servicio, red por defecto, volumen, `docker compose up/down`.

Docker Compose resuelve un problema que aparece en cuanto necesitas más de un contenedor trabajando juntos: en vez de escribir un comando `docker run` largo y repetirlo cada vez (con todos sus puertos, variables de entorno y volúmenes), describes toda la configuración una sola vez en un archivo de texto llamado `docker-compose.yml`, y Docker Compose se encarga de levantar (o destruir) todos los contenedores descritos con un solo comando.

Cada bloque bajo la clave `services` en ese archivo describe un servicio: qué imagen usa, qué puertos expone, qué variables de entorno necesita, y qué volúmenes monta. Cuando ejecutas `docker compose up`, Compose crea automáticamente una red virtual compartida entre todos los servicios definidos en ese archivo, de forma que cada servicio puede llamar a los demás usando su nombre de servicio como si fuera un nombre de host (por ejemplo, un servicio `backend` puede conectarse a un servicio `db` simplemente usando `db` como dirección, sin necesidad de conocer una IP).

Los volúmenes resuelven el problema de la persistencia: por defecto, todo lo que un contenedor escribe en su sistema de archivos desaparece cuando el contenedor se elimina, porque esos datos viven dentro de la capa superior (efímera) del contenedor. Un volumen monta un directorio del host (o un volumen gestionado por Docker) dentro del contenedor, de forma que los datos escritos ahí sobreviven aunque el contenedor se destruya y se vuelva a crear. Esto es relevante para Floci: si quieres que el estado de tus buckets S3 o tus tablas DynamoDB sobreviva a un reinicio del contenedor, necesitas montar un volumen para la carpeta donde Floci guarda su estado.

`docker compose up -d` levanta todos los servicios definidos en segundo plano; `docker compose down` los detiene y elimina (pero no borra los volúmenes con nombre, a menos que añadas la opción `-v`); `docker compose ps` lista el estado de los servicios definidos en el archivo actual; y `docker compose logs -f` muestra los logs combinados de todos los servicios en tiempo real. Este conjunto de comandos reemplaza, con mucha más comodidad, a levantar cada contenedor manualmente con `docker run`.

**Analogía:** si `docker run` es encender un electrodoméstico a la vez, Docker Compose es el interruptor general de una casa inteligente: con un solo comando enciendes (o apagas) todos los dispositivos configurados, cada uno con su propia configuración ya guardada, y todos conectados entre sí por la misma red doméstica sin que tengas que configurar esa conexión cada vez.

**¿Por qué es importante?** En el laboratorio de este módulo vas a usar `floci-cli` como flujo principal, pero Docker Compose sigue siendo la herramienta correcta en cuanto necesites correr Floci junto a otros servicios de tu propia aplicación —como probablemente hagas en el proyecto final del Módulo 9— o correr AWS, Azure y GCP local a la vez. Escribir un `docker-compose.yml` correcto es una habilidad que se usa a diario en el desarrollo de software moderno, con o sin Floci de por medio.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Define un `docker-compose.yml` que levante Floci junto a tu propia API (el proyecto final del Módulo 9) con un volumen nombrado para persistir el estado de DynamoDB/S3 entre reinicios, en vez de perderlo cada vez que destruyas el contenedor.

**Diagrama:**

```mermaid
flowchart LR
    subgraph YML["docker-compose.yml"]
        Y1["services:"]
        Y2["floci:"]
        Y3["image: floci/floci:latest"]
        Y4["ports: 4566 to 4566"]
        Y5["persistent volume: ./data to /state"]
    end
    YML -->|"docker compose up"| NET["Red compartida compose_default"]
    NET --> CNT["Contenedor: floci\nPuerto 4566 expuesto\nVolumen ./data ↔ /state"]
```

---

**Límites y decisión de uso:** Compose sirve para reproducir varios servicios en un host, pero no garantiza alta disponibilidad entre máquinas. Que un contenedor haya arrancado tampoco implica que su dependencia esté lista: combina healthchecks con recuperación en la aplicación.

#### Paso 4 · Demostración guiada
Crea `docker-compose.yml` en `ejemplo-compose` desde una carpeta vacía.
```bash
mkdir ejemplo-compose
docker compose version
```
Resultado esperado: Compose disponible.
#### Paso 5 · Práctica guiada
Pista: usa un volumen inexistente para provocar un fallo deliberado y corrígelo.
#### Paso 6 · Práctica independiente
Añade red, volumen y healthcheck.
#### Paso 7 · Cierre
Entrega YAML, salida, fallo y corrección; explica el resultado. Siguiente paso: servicios cloud. Errores comunes: datos efímeros, puertos duplicados y dependencias sin healthcheck. Fuente oficial: https://docs.docker.com/compose/.

## Laboratorio práctico

**Objetivo del laboratorio:** ejecutar los comandos esenciales de Docker sobre una imagen de prueba, instalar `floci-cli` —la herramienta oficial recomendada para gestionar Floci— y levantarlo por primera vez con la AWS CLI ya configurada para hablar con él.

**Requisitos previos:** Docker instalado y verificado (Módulo 0), AWS CLI instalada y verificada (Módulo 0).

### Laboratorio 1.1 — Comandos esenciales con una imagen de prueba

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Descargar imagen de prueba | `docker pull hello-world` | Descarga la imagen sin ejecutarla todavía | Líneas de descarga terminando en `Status: Downloaded newer image for hello-world:latest` |
| 2 | Ejecutarla | `docker run hello-world` | Crea y arranca un contenedor a partir de esa imagen | Texto que empieza con `Hello from Docker!` |
| 3 | Ver contenedores detenidos | `docker ps -a` | El contenedor de `hello-world` termina su trabajo y se detiene solo; `-a` lo muestra aunque ya no esté corriendo | Una fila con `hello-world` y estado `Exited (0)` |
| 4 | Ver imágenes descargadas | `docker images` | Lista las imágenes locales, incluyendo `hello-world` | Una fila `hello-world latest ...` |
| 5 | Eliminar el contenedor detenido | `docker rm <id-del-contenedor>` (el ID sale de `docker ps -a`) | Libera el contenedor detenido; la imagen sigue en disco | No hay salida (o se imprime el ID eliminado) |

### Laboratorio 1.2 — Instalar floci-cli y levantar Floci

A partir de aquí, este curso usa `floci-cli` —la CLI oficial del proyecto— como flujo principal para levantar, verificar y detener Floci. Gestiona el contenedor por ti (incluyendo el montaje del socket de Docker) y expone comandos memorables en vez de flags largos de `docker run`.

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Instalar floci-cli (macOS/Linux) | `curl -fsSL https://floci.io/install.sh \| sh` | Descarga e instala el binario nativo de la CLI; en Windows usa `iwr https://floci.io/install.ps1 \| iex` en PowerShell, o `brew install floci-io/floci/floci` con Homebrew | Mensaje `Floci CLI ... installed to ...` |
| 2 | Levantar Floci (AWS) | `floci start` | Descarga la imagen si hace falta, arranca el contenedor y espera a que esté listo — sin que tengas que escribir `-p 4566:4566` ni montar el socket de Docker a mano | Un mensaje confirmando que Floci está corriendo en el puerto 4566 |
| 3 | Diagnosticar el entorno | `floci doctor` | Verifica Docker, el socket, la conectividad y la versión de la imagen en un solo comando | Una lista de chequeos, todos en verde/OK |
| 4 | Cargar las variables de entorno de AWS | `eval $(floci env)` | Exporta `AWS_ENDPOINT_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` y `AWS_DEFAULT_REGION` en tu sesión actual, apuntando a Floci — a partir de aquí, el resto del curso asume que ejecutaste este paso, así que los comandos de `aws` ya no necesitan repetir `--endpoint-url` | Sin salida visible (las variables quedan exportadas en tu shell) |
| 5 | Confirmar el estado | `floci status` | Detecta automáticamente el puerto y consulta la salud del servidor | Estado `running` con el detalle de servicios habilitados |

### Laboratorio 1.3 — Probar la AWS CLI contra Floci

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Listar buckets S3 (debería estar vacío) | `aws s3 ls` | Con `eval $(floci env)` ya cargado, la CLI habla con Floci sin necesidad de ningún flag adicional | Ninguna línea de salida (todavía no hay buckets) |
| 2 | Ver los logs de arranque | `floci logs --tail 50` | Floci imprime en sus logs qué servicios ha inicializado correctamente | Líneas indicando que S3, SQS, DynamoDB, Lambda, API Gateway e IAM están listos |
| 3 | Detener Floci al terminar | `floci stop` | Detiene el contenedor de forma ordenada; usa `floci stop --remove` si además quieres eliminarlo | Confirmación de que el contenedor se detuvo |

**Alternativa: Docker Compose.** Si prefieres orquestar Floci junto a otros servicios (o necesitas correr AWS, Azure y GCP local a la vez, como en los Módulos 8 y 31), el `docker-compose.yml` de la raíz del proyecto sigue siendo válido:

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
```

```bash
docker compose up -d
# equivalente manual a `eval $(floci env)`:
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1
```

### Laboratorio 1.4 — Usar StackPort y Floci UI

La academia ya incluye **StackPort** en su `docker-compose.yml`. Levántalo junto con Floci y abre `http://localhost:8080`:

```bash
docker compose up -d aws-local stackport
```

StackPort es útil como explorador AWS ligero y arranca en la misma red del laboratorio. También puedes usar Floci UI durante el curso; no son alternativas excluyentes.

Floci UI es un proyecto oficial separado porque incluye su propio frontend, API proxy y configuración de runtimes. No intentes iniciarlo con `docker run floci/floci-ui:latest`: clona el repositorio y usa su Docker Compose, que mantiene coordinados todos sus servicios.

```bash
git clone https://github.com/floci-io/floci-ui.git
cd floci-ui
docker compose up -d
docker compose ps
```

**Evita el conflicto del puerto 4566:** el Compose de Floci UI incluye por defecto su propio runtime Floci, igual que la academia. Para probar su stack completo, detén primero el Compose de la academia con `docker compose down` desde la carpeta de The_Imperial_Book. Para mantener StackPort y Floci UI abiertos simultáneamente y viendo exactamente los mismos recursos, configura la API de Floci UI con `FLOCI_ENDPOINT` apuntando al runtime ya existente y no levantes el segundo servicio Floci; sigue el Compose y `.env.example` de la versión de Floci UI que hayas clonado.

Abre `http://localhost:4500`. Debes ver **Console Home**, el estado del runtime AWS y el acceso a **Cloud Explorer**. Para levantar también runtimes Azure y GCP usa `docker compose --profile multicloud up -d`. Los puertos predeterminados son UI `4500`, API `4501` y Floci AWS `4566`.

Realiza una primera comprobación de extremo a extremo:

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://mi-primer-bucket-visual
```

Repite la comprobación visual primero en StackPort y después en Floci UI, o en ambas simultáneamente si las configuraste contra el mismo runtime. Localiza `mi-primer-bucket-visual`, confirma proveedor, región y tipo, elimínalo desde CLI y comprueba que desaparece. Así aprendes las fortalezas de ambas interfaces sin confundir dos runtimes independientes.

**Mapa de disponibilidad actual:** Storage es la superficie multi-cloud más completa; AWS Compute, Networking, EKS y Serverless tienen flujos reales; Secrets Manager conserva una página AWS dedicada. Queue (SQS) e IAM, que en versiones anteriores de Floci UI aparecían como placeholders, ya tienen páginas conectadas desde la versión 0.4.0 en adelante. Verificá siempre la versión instalada (`floci-ui --version` o el changelog en github.com/floci-io/floci-ui/releases): si corrés una versión anterior, esas secciones sí pueden seguir mostrándose como placeholder. Cuando una operación no esté conectada en tu versión, usa CLI/SDK como fuente de verdad.

**Verificación:** el laboratorio se considera exitoso si `floci status` reporta el servidor corriendo, `aws s3 ls` funciona con el endpoint local y el bucket creado por CLI aparece al menos en una consola visual configurada —idealmente en StackPort y Floci UI— antes de desaparecer tras su eliminación.

**Errores comunes y soluciones**

- **`floci start` falla con un error de Docker.** Docker Desktop debe estar abierto y corriendo; `floci doctor` te dice exactamente qué chequeo falló (Docker no instalado, socket no accesible, daemon no iniciado).
- **`aws s3 ls` responde `Unable to locate credentials` o intenta conectar a AWS real.** Se te olvidó ejecutar `eval $(floci env)` en la sesión actual de terminal, o abriste una pestaña nueva donde esas variables no están exportadas — las variables de entorno no persisten entre sesiones de shell.
- **Puerto ya en uso al ejecutar `floci start`.** Otro proceso (quizá una instancia previa de Floci o de LocalStack) ya usa el puerto 4566. Usa `floci start --port 4599` para un puerto alternativo, o detén el proceso anterior con `floci stop`.
- **`floci doctor` reporta el socket de Docker inaccesible en Podman o un daemon remoto.** Exporta `DOCKER_HOST` apuntando a tu socket o daemon (`unix:///run/user/1000/podman/podman.sock` para Podman rootless, por ejemplo); `floci start` lo detecta automáticamente sin flags adicionales.

---
