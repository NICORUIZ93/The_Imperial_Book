# Módulo 0.4 · Git, terminal, HTTP, JSON, YAML, variables de entorno

**Fase 0 · Fundamentos absolutos** (semanas 2 y 3 de 4). **Duración:** 12 h (6 temas de 2 h). **Dificultad:** 2 de
5. **Dependencias:** Módulos 0.1 a 0.3 (servidor, API, ejecutar Java y Node, leer tests). **Herramientas:** Git
2.4x o posterior (la que traiga tu sistema), bash o zsh, `curl`, **Node.js 26.13.1 LTS**, **JDK 25 LTS** y la
librería npm `yaml` 2.9.1. **Laboratorio:** `modulo-3` (se verifica con `./verificar.sh`).

Estas seis herramientas aparecen en **cada** microservicio que construyas: Git guarda la historia del código, la
terminal es tu panel de control, HTTP es el idioma con el que hablan los servicios, JSON es el formato de los
mensajes, YAML es el formato de la configuración (Docker Compose, Kubernetes, Spring Boot) y las variables de
entorno son la forma de configurar un servicio sin tocar su código.

```mermaid
flowchart LR
    G["Git<br/>historia del código"] --> T["Terminal<br/>panel de control"]
    T --> H["HTTP<br/>cómo hablan"]
    H --> J["JSON<br/>qué se dicen"]
    T --> Y["YAML<br/>cómo se configuran"]
    Y --> E["Variables de entorno<br/>configuración por despliegue"]
```

**Texto alternativo:** seis cajas conectadas. Git lleva a la terminal; de la terminal salen dos ramas: HTTP, que
lleva a JSON, y YAML, que lleva a variables de entorno.

---

### Git

#### 1. UBICACIÓN

Módulo 0.4, Lección 1 de 6 · Fase 0 · `web/public/content/microservices/modulo-3.md` · Laboratorio
`git`.

#### 2. PRERREQUISITOS

- Saber abrir la terminal y ejecutar un comando (Módulo 0.1).
- Tener Git: `git --version` debe responder `git version 2.x` (2.28 o posterior; en macOS lo instala
  `xcode-select --install` y en Windows el instalador de git-scm.com).

#### 3. OBJETIVO DE APRENDIZAJE

**Crear** un repositorio, **registrar** cambios con el ciclo editar → `add` → `commit`, **crear y unir** una rama
y **leer** la historia con `git log`; lo compruebas cuando `git/test-git.sh` pasa 4 de 4.

#### 4. ANALOGÍA VISUAL

Dibuja un **álbum de fotos de una obra en construcción**. Sobre la mesa, la maqueta del edificio (tu carpeta de
trabajo). A un lado, una **bandeja** con la etiqueta «para la próxima foto» (el área de preparación o *staging*):
pones ahí solo las piezas que quieres que salgan. Cuando estás listo, una **cámara** toma la foto y la pega en el
álbum con una nota al pie («Agrega README») y la firma de quien la tomó (el *commit*). Las páginas del álbum están
unidas por una **cinta** que va de la foto más nueva a la anterior (la historia). De una página sale una **cinta
paralela de otro color** donde alguien prueba otra fachada (una rama, «saludo»); al final, las dos cintas se
**anudan** en una sola (el *merge*). Nada de lo que está en el álbum se pierde: siempre puedes volver a una foto.

#### 5. DIAGRAMA TÉCNICO

```mermaid
gitGraph
    commit id: "Agrega README"
    branch saludo
    checkout saludo
    commit id: "Agrega saludo"
    checkout main
    merge saludo
```

**Texto alternativo:** grafo de Git con la rama main y un commit «Agrega README». De ahí sale la rama saludo con
el commit «Agrega saludo», que vuelve a unirse a main con un merge. Como main no tenía commits nuevos, Git hace un
avance rápido (*fast-forward*) y main queda apuntando a «Agrega saludo».

#### 6. EXPLICACIÓN NIVEL 0

**Git** es un programa que guarda la **historia** de una carpeta: cada vez que lo decides, toma una «foto» de tus
archivos y la guarda con un mensaje. Así puedes ver qué cambió, quién y cuándo, y volver atrás si algo se rompe.

Cuatro palabras bastan para empezar:

- **Repositorio:** la carpeta que Git vigila (contiene una carpeta oculta `.git` con toda la historia).
- **Commit:** una foto guardada con un mensaje.
- **Staging (`git add`):** elegir qué cambios entran en la próxima foto.
- **Rama:** una línea de trabajo paralela para probar algo sin tocar la principal (`main`).

GitHub y GitLab son sitios web que guardan copias de repositorios Git para compartirlos; Git funciona sin ellos.

#### 7. EXPLICACIÓN INTERMEDIA

- `git init -b main` crea `.git` con la rama inicial `main`. `git config user.name/user.email` (sin `--global`)
  fija la identidad **solo** en ese repositorio.
- `git status --short` resume el estado: `??` archivo no seguido, `A` añadido al staging, `M` modificado.
- Un commit guarda una **instantánea** completa (no solo diferencias), identificada por un *hash* SHA-1 de 40
  caracteres, y apunta a su commit padre: eso forma la cadena de la historia.
- Una rama es solo un **puntero móvil** a un commit. `git switch -c saludo` crea el puntero y te mueve a él.
- `git merge saludo` estando en `main`: si `main` no avanzó, Git solo mueve el puntero (*fast-forward*); si ambas
  avanzaron, crea un commit de unión, y si las dos cambiaron las mismas líneas, hay un **conflicto** que
  resuelves a mano.
- `git log --format='%s'` muestra solo los mensajes; `git log --oneline --graph` dibuja las ramas.

#### 8. EXPLICACIÓN MAESTRA

- **Estrategias de ramas.** *Trunk-based development* (ramas cortas, de horas o un día, que se unen a `main`
  detrás de *feature flags*) favorece la integración continua y es lo habitual en equipos de microservicios.
  *GitFlow* (ramas `develop`, `release`, `hotfix`) da más control de versiones pero retrasa la integración y
  multiplica los conflictos. Elige trunk-based salvo que publiques software con varias versiones mantenidas en
  paralelo.
- **Merge frente a rebase.** `merge` conserva la historia real con commits de unión; `rebase` la reescribe en
  línea recta (más legible) pero cambia los hashes: nunca hagas rebase de ramas que otros ya descargaron.
- **Monorepo frente a un repositorio por servicio.** Un monorepo facilita cambios atómicos entre servicios y
  herramientas comunes, pero exige CI selectiva; un repo por servicio refuerza la autonomía de cada equipo pero
  complica los cambios transversales. Lo retomas en los Módulos 17 y 29 (Ley de Conway).
- **Cuándo NO** usar Git para algo: archivos binarios grandes (videos, modelos, *dumps* de base de datos) y,
  sobre todo, **secretos**. Un secreto en un commit queda en la historia aunque lo borres después; hay que
  revocarlo.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Git 2.4x o posterior** (probado con 2.43.0; mínimo 2.28 por `git init -b`) y bash 3.2+ (el de
macOS sirve). Sin otras dependencias. `practica.sh`:

```bash
#!/usr/bin/env bash
# Módulo 0.4 · Git: crea un repositorio de práctica y recorre el ciclo editar -> preparar -> confirmar.
# Requisitos: Git 2.4x o posterior, la que traiga tu sistema (mínimo 2.28, que añadió `git init -b`). Probado con 2.43.0.
# Uso: ./practica.sh [carpeta]   (por defecto crea una carpeta nueva en /tmp)
set -euo pipefail
DIR="${1:-$(mktemp -d /tmp/practica-git.XXXX)}"
mkdir -p "$DIR" && cd "$DIR"

git init -q -b main                                  # 1. crea el repositorio (la carpeta oculta .git)
git config user.name "Estudiante"                     #    identidad SOLO para este repositorio
git config user.email "estudiante@example.com"

echo "# Mi primer repositorio" > README.md            # 2. editar
git status --short                                    #    ?? = archivo nuevo que Git aún no sigue
git add README.md                                     # 3. preparar (staging)
git commit -q -m "Agrega README"                      # 4. confirmar: una foto del proyecto

git switch -q -c saludo                               # 5. rama: una línea de trabajo paralela
echo "Hola, Git" > saludo.txt
git add saludo.txt && git commit -q -m "Agrega saludo"
git switch -q main
git merge -q saludo                                   # 6. unir la rama a main

echo "== Historia (del más nuevo al más viejo)"
git log --format='%s'
echo "== Ramas"
git branch --format='%(refname:short)'
echo "== Archivos en la última foto"
git ls-files
echo "Repositorio en: $DIR"
```

#### 10. MINI-LABORATORIO

1. Ejecuta el guion completo en una carpeta de práctica:
   ```bash
   ./git/practica.sh /tmp/mi-primer-repo
   ```
2. Explora el resultado a mano:
   ```bash
   cd /tmp/mi-primer-repo
   git log --oneline --graph --all
   ls -a
   ```
3. **Rómpelo a propósito:** intenta un commit sin haber hecho `add`:
   ```bash
   echo "cambio" >> README.md
   git commit -m "Intento sin add"
   ```

**Output esperado** (paso 1):

```text
?? README.md
== Historia (del más nuevo al más viejo)
Agrega saludo
Agrega README
== Ramas
main
saludo
== Archivos en la última foto
README.md
saludo.txt
Repositorio en: /tmp/mi-primer-repo
```

En el paso 2, `ls -a` muestra `.git` junto a tus archivos, y el grafo muestra dos commits con hashes de 7
caracteres (distintos en tu máquina). En el paso 3, Git responde `no changes added to commit (use "git add" and/or
"git commit -a")` y no crea ninguna foto.

**Captura comentada:** la primera línea, `?? README.md`, es la foto del momento previo al `add`: Git ve el archivo
pero aún no lo sigue. La historia se lee de arriba (más nuevo) abajo (más viejo).

#### 11. VERIFICACIÓN

```bash
./git/test-git.sh
```

Salida real:

```text
✔ hay 2 commits en main
✔ el último commit es 'Agrega saludo'
✔ existe la rama saludo
✔ no quedan cambios sin confirmar
Git: todos los tests pasaron
```

El test ejecuta `practica.sh` en una carpeta temporal y comprueba el repositorio con comandos de Git
(`rev-list --count`, `log -1`, `branch --list`, `status --porcelain`). **Pregunta de comprobación:** después del
merge, ¿por qué `main` tiene 2 commits y no 3? *(Porque `main` no había avanzado: el merge fue fast-forward y solo
movió el puntero.)*

#### 12. ERROR COMÚN

**Síntoma:** tu primer commit en un computador nuevo falla. **Cómo se ve:**

```text
Author identity unknown

*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

to set your account's default identity.
Omit --global to set the identity only in this repository.

fatal: no email was given and auto-detection is disabled
```

**Diagnóstico:** Git firma cada commit con nombre y correo y no los encuentra. Revisa con
`git config --global user.email`. **Arreglo:** ejecuta los dos comandos que propone el mensaje con tus datos. Otro
clásico: `nothing added to commit but untracked files present (use "git add" to track)` significa que olvidaste
`git add`.

#### 13. PREGUNTA DE ENTREVISTA

«Subiste por error una contraseña a un repositorio y luego la borraste en otro commit. ¿Está resuelto?»

**Respuesta modelo:** no. Cada commit es una instantánea completa y la contraseña sigue en la historia y en
todos los clones. Lo primero es **revocar y rotar** el secreto (asumir que está comprometido). Después, si la
política lo exige, reescribir la historia con `git filter-repo` y forzar el *push*, avisando a todos para que
vuelvan a clonar. Para prevenirlo: `.gitignore` para archivos `.env`, escáneres de secretos en *pre-commit* y en
CI, y secretos en un gestor (Vault, Módulo 9).

#### 14. ANTI-PATRÓN RELACIONADO

**Commits gigantes con mensajes vacíos de significado:**

```text
✖ a1b2c3d cambios
✖ d4e5f6a arreglos varios
✖ 0f9e8d7 wip
```

Se ve como un `git log` que no cuenta nada y commits que tocan 80 archivos de cosas distintas. Es imposible
revisar, revertir solo una parte o encontrar cuándo entró un error (`git bisect`). Haz commits pequeños, de un solo
propósito, con mensajes en imperativo que expliquen el **porqué** («Valida cantidad mayor que 0 en pedidos»).

---

### Terminal

#### 1. UBICACIÓN

Módulo 0.4, Lección 2 de 6 · Fase 0.

#### 2. PRERREQUISITOS

- Haber ejecutado comandos sueltos (`node`, `curl`, `git`) en los temas anteriores.
- Tener bash o zsh: en macOS la terminal usa zsh por defecto; en Windows usa WSL (Ubuntu) o Git Bash.

#### 3. OBJETIVO DE APRENDIZAJE

**Navegar** carpetas, **inspeccionar** archivos, **combinar** comandos con tuberías (`|`) y redirecciones (`>`,
`2>`) e **interpretar** códigos de salida en un guion que analiza un log; lo compruebas cuando
`terminal/test-terminal.sh` pasa 4 de 4.

#### 4. ANALOGÍA VISUAL

Dibuja la **cabina de un tren de carga**. Cada comando es un **vagón-máquina** con una entrada a la izquierda y
dos salidas a la derecha: una salida verde (la salida estándar, *stdout*) y una salida roja más pequeña (la
salida de errores, *stderr*). Entre vagones hay **mangueras** (`|`) que conectan la salida verde de uno con la
entrada del siguiente: el vagón `grep` filtra solo las cajas con la etiqueta «ERROR» y el vagón `wc -l` las
cuenta. Al final del tren, un **embudo** (`>`) vierte el resultado en un barril (un archivo). Sobre cada vagón, un
**semáforo** pequeño: verde con un 0 si todo salió bien, rojo con otro número si algo falló (el código de salida).
El maquinista, sentado en la cabina, eres tú escribiendo en el *prompt*.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    F[("datos/app.log")] -->|stdin| G["grep ERROR"]
    G -->|"stdout |"| C["cut -c21-"]
    C -->|stdout| P["pantalla"]
    G -.->|stderr| E["pantalla (errores)"]
    C -.->|"código de salida $?"| S{"0 = bien<br/>≠0 = fallo"}
```

**Texto alternativo:** un archivo app.log entra por la entrada estándar a grep ERROR; su salida estándar pasa por
una tubería a cut, que escribe en pantalla. Una flecha punteada muestra que los errores de grep van a la pantalla
por la salida de errores, y otra que cada comando deja un código de salida: 0 significa bien y otro número, fallo.

#### 6. EXPLICACIÓN NIVEL 0

La **terminal** es una ventana donde escribes órdenes en texto en lugar de hacer clic. El programa que las
interpreta se llama **shell** (bash o zsh). Todo lo que hagas con microservicios (arrancar contenedores, leer
logs, desplegar) se hace aquí, porque los servidores no tienen pantalla ni ratón.

Los comandos esenciales:

| Comando | Qué hace | Ejemplo |
|---|---|---|
| `pwd` | dónde estoy | `/Users/ana/curso` |
| `ls` | qué hay aquí | `ls -l datos` |
| `cd` | moverme de carpeta | `cd terminal`, `cd ..` (subir) |
| `mkdir` | crear carpeta | `mkdir logs` |
| `cat` | mostrar un archivo | `cat datos/app.log` |
| `grep` | buscar líneas con un texto | `grep ERROR datos/app.log` |
| `wc -l` | contar líneas | `wc -l datos/app.log` |
| `echo` | escribir un texto | `echo hola > saludo.txt` |

Y tres símbolos: `|` (pasa la salida de un comando al siguiente), `>` (guarda la salida en un archivo, borrando lo
que había) y `>>` (la añade al final).

#### 7. EXPLICACIÓN INTERMEDIA

- Cada proceso tiene tres canales: **stdin** (0), **stdout** (1) y **stderr** (2). `2> /dev/null` descarta los
  errores; `>&2` escribe en stderr. Así puedes guardar resultados en un archivo y seguir viendo los errores.
- Cada comando termina con un **código de salida**: `0` es éxito; cualquier otro, fallo (`grep -c` devuelve 1
  cuando no encuentra nada; nuestro guion devuelve `2` si falta el archivo). `$?` guarda el código del último
  comando, y `&&` ejecuta el siguiente solo si el anterior terminó en 0.
- Un **guion** (*script*) es un archivo de comandos. La primera línea `#!/usr/bin/env bash` (*shebang*) dice con
  qué intérprete ejecutarlo, y necesita **permiso de ejecución** (`chmod +x`).
- `set -euo pipefail` hace el guion estricto: se detiene ante un error (`-e`), ante una variable sin definir
  (`-u`) y si falla cualquier comando de una tubería (`pipefail`).
- `$( comando )` guarda la salida de un comando en una variable; `${1:?mensaje}` exige el primer argumento.
- Las comillas importan: `"$ARCHIVO"` protege rutas con espacios.

#### 8. EXPLICACIÓN MAESTRA

- **Shell frente a lenguaje de programación.** Bash es insuperable para pegar herramientas (logs, Docker, kubectl)
  en 10 líneas, pero frágil para lógica compleja: comillas, espacios, diferencias entre macOS (BSD) y Linux (GNU) en
  `sed`, `date` o `grep`. Regla: si el guion pasa de ~50 líneas o necesita estructuras de datos, escríbelo en
  Node, Java o Python. Para portabilidad, usa solo opciones POSIX y pruébalo en ambos sistemas.
- **Terminal frente a interfaces gráficas.** Docker Desktop, Lens o la consola web de la nube son cómodos, pero
  no se pueden versionar ni repetir; un comando sí (y es lo que se automatiza en CI/CD, Módulo 23).
- **Observabilidad básica.** `grep | wc -l` sobre un log es la versión artesanal de lo que harás con Loki o ELK
  (Módulo 21): sirve para un servidor, no para 40 réplicas.
- **Cuándo NO** usar la terminal para operar producción: cambios manuales sin registro («entré por **SSH**, acceso remoto seguro por terminal, y
  reinicié») rompen la trazabilidad. En producción, los cambios pasan por Git y por un *pipeline* (GitOps,
  Módulo 12).

#### 9. CÓDIGO EJECUTABLE

Versiones: **bash 3.2 o posterior** (el de macOS sirve; probado con bash 5.2.21) y `grep`/`cut` del sistema. Sin
dependencias. `contar-errores.sh`:

```bash
#!/usr/bin/env bash
# Módulo 0.4 · Terminal: cuenta las líneas ERROR de un log y muestra cuáles son.
# Requisitos: bash 3.2+ (el de macOS sirve) y grep. Sin otras dependencias.
# Uso: ./contar-errores.sh datos/app.log
set -euo pipefail
ARCHIVO="${1:?Uso: $0 ARCHIVO_DE_LOG}"     # ${1:?...} = si falta el argumento, error con este mensaje
if [ ! -f "$ARCHIVO" ]; then
  echo "No existe el archivo: $ARCHIVO" >&2  # >&2 = escribir en la salida de errores
  exit 2                                     # código de salida distinto de 0 = algo falló
fi
TOTAL=$(grep -c "ERROR" "$ARCHIVO" || true) # $( ) = guarda la salida de un comando en una variable
echo "Errores encontrados: $TOTAL"
grep "ERROR" "$ARCHIVO" | cut -c21- || true  # tubería |: la salida de grep entra a cut (quita la fecha)
```

El log de práctica `terminal/datos/app.log` tiene 6 líneas: 3 `INFO`, 1 `WARN` y 2 `ERROR`.

#### 10. MINI-LABORATORIO

1. Navega e inspecciona:
   ```bash
   pwd
   ls datos
   cat datos/app.log
   ```
2. Combina comandos con tuberías:
   ```bash
   grep ERROR datos/app.log | wc -l
   grep -c INFO datos/app.log
   ```
3. Ejecuta el guion, sin argumentos y con un archivo que no existe, y mira el código de salida cada vez:
   ```bash
   ./contar-errores.sh datos/app.log; echo "código: $?"
   ./contar-errores.sh; echo "código: $?"
   ./contar-errores.sh no-existe.log; echo "código: $?"
   ```

**Output esperado** (paso 2): `2` y `3`. Paso 3:

```text
Errores encontrados: 2
ERROR no hay conexión con la base de datos
ERROR tiempo de espera agotado en /api/pedidos
código: 0
./contar-errores.sh: line 6: 1: Uso: ./contar-errores.sh ARCHIVO_DE_LOG
código: 1
No existe el archivo: no-existe.log
código: 2
```

**Captura comentada:** con el archivo correcto, el semáforo queda en `0`. Sin argumento, bash detiene el guion en
la línea 6 con el mensaje de uso (código 1). Con un archivo inexistente, el guion decide su propio código (`2`)
y el mensaje sale por stderr: si ejecutas `./contar-errores.sh no-existe.log 2> /dev/null` no verás nada.

#### 11. VERIFICACIÓN

```bash
./terminal/test-terminal.sh
```

(desde `modulo-3`). Salida real:

```text
✔ cuenta 2 errores
✔ termina con código 0 si todo va bien
✔ termina con código 2 si falta el archivo
✔ la tubería grep | wc -l da lo mismo
Terminal: todos los tests pasaron
```

**Pregunta de comprobación:** ¿qué diferencia hay entre `./contar-errores.sh datos/app.log > salida.txt` y
`./contar-errores.sh no-existe.log > salida.txt`? *(En el primero, el resultado va al archivo y no ves nada; en el
segundo, el archivo queda vacío y el mensaje de error aparece en pantalla, porque va por stderr.)*

#### 12. ERROR COMÚN

**Síntoma:** copias un guion y al ejecutarlo la terminal dice `Permission denied`. **Cómo se ve** (en bash; en zsh
el texto es `zsh: permission denied: ./contar-errores.sh`):

```text
/bin/bash: line 1: ./contar-errores.sh: Permission denied
```

con código de salida `126`. **Diagnóstico:** `ls -l contar-errores.sh` muestra `-rw-r--r--` (sin `x`): el archivo
no tiene permiso de ejecución. **Arreglo:** `chmod +x contar-errores.sh`, y vuelve a mirar: `-rwxr-xr-x`. Otro
clásico: `cd mis proyectos` responde `cd: too many arguments`; las rutas con espacios van entre comillas
(`cd "mis proyectos"`).

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué hace `set -euo pipefail` y por qué es importante en un guion de despliegue?»

**Respuesta modelo:** `-e` detiene el guion cuando un comando falla, `-u` lo detiene si se usa una variable no
definida (evita que `rm -rf "$DIR/"` se convierta en `rm -rf /`) y `pipefail` hace que una tubería falle si
falla cualquiera de sus comandos, no solo el último. Sin esas opciones, un guion de despliegue puede seguir
ejecutándose después de que falló la compilación y publicar una versión rota. Hay matices: `-e` no se aplica dentro
de condiciones `if` o con `||`, así que los casos esperados se manejan explícitamente (como el `|| true` del
guion).

#### 14. ANTI-PATRÓN RELACIONADO

**Copiar y pegar comandos de internet que se ejecutan con privilegios sin leerlos:**

```bash
# ✖ Anti-patrón: descargar y ejecutar como administrador algo que no has leído
curl -s https://sitio-desconocido.example/instalar.sh | sudo bash
```

Se ve como una sola línea «mágica» que promete instalarlo todo. Ejecuta código ajeno con permisos totales sobre tu
máquina. Descarga primero el guion, léelo, y usa instaladores oficiales o gestores de paquetes (Homebrew, apt,
winget).

---

### HTTP

#### 1. UBICACIÓN

Módulo 0.4, Lección 3 de 6 · Fase 0.

#### 2. PRERREQUISITOS

- Módulo 0.1: servidor y API (método, ruta, código de estado, `curl`).
- Tema «Terminal» (dos terminales, códigos de salida).

#### 3. OBJETIVO DE APRENDIZAJE

**Identificar** las partes de un mensaje HTTP (línea de petición, cabeceras, cuerpo, código de estado),
**provocar** respuestas 200, 201, 400, 404, 405 y 415 con `curl` y **elegir** el código correcto para cada
situación; lo compruebas cuando `http/servidor-http.test.js` pasa 6 de 6.

#### 4. ANALOGÍA VISUAL

Dibuja un **sobre de correo certificado** abierto sobre una mesa, con tres partes separadas por colores:

- en la **solapa** (azul), una línea escrita con letra grande: «POST /eco» (qué quieres y a dónde);
- en el **anverso del sobre** (amarillo), varias etiquetas pegadas como sellos: «Content-Type: application/json»,
  «Accept-Language: es» (las cabeceras: datos sobre el envío);
- **dentro**, una carta (blanca): `{"nombre":"Ana"}` (el cuerpo).

Junto a él, el **sobre de respuesta** con un **sello circular numerado** grande en la esquina: verde `201`
(creado), rojo `404` (no existe esa dirección), naranja `405` (a esa ventanilla no se le puede pedir eso; en la
etiqueta «Allow: GET» dice qué sí acepta), naranja `415` (mandaste la carta en un idioma que no se lee aquí).

#### 5. DIAGRAMA TÉCNICO

```mermaid
sequenceDiagram
    participant C as curl
    participant S as servidor-http.js
    C->>S: POST /eco HTTP/1.1<br/>Content-Type: application/json<br/><br/>{"nombre":"Ana"}
    S-->>C: HTTP/1.1 201 Created<br/>Content-Type: application/json<br/><br/>{"recibido":{"nombre":"Ana"}}
    C->>S: DELETE /saludo
    S-->>C: 405 Method Not Allowed · Allow: GET
```

**Texto alternativo:** diagrama de secuencia entre curl y el servidor. curl envía «POST /eco» con la cabecera
Content-Type application/json y un cuerpo JSON; el servidor responde «201 Created» con un JSON que repite lo
recibido. Luego curl envía «DELETE /saludo» y recibe «405 Method Not Allowed» con la cabecera Allow: GET.

#### 6. EXPLICACIÓN NIVEL 0

**HTTP** es el idioma con el que hablan los navegadores, las apps y los microservicios. Siempre es una
conversación de dos turnos: el cliente envía una **petición** y el servidor contesta con una **respuesta**.

Una petición tiene: un **método** (qué quieres hacer: `GET` leer, `POST` crear, `PUT` reemplazar, `DELETE`
borrar), una **ruta** (`/saludo`), **cabeceras** (datos extra, como el idioma) y, a veces, un **cuerpo** (los
datos que envías).

Una respuesta tiene: un **código de estado** (un número de tres cifras), cabeceras y un cuerpo. Los códigos se
agrupan por la primera cifra:

| Grupo | Significado | Ejemplos |
|---|---|---|
| 2xx | éxito | 200 OK, 201 Created |
| 3xx | ve a otro lado | 301, 304 |
| 4xx | **tú** (el cliente) pediste mal | 400, 404, 405, 415 |
| 5xx | **yo** (el servidor) fallé | 500, 503 |

#### 7. EXPLICACIÓN INTERMEDIA

- HTTP/1.1 es **texto** sobre una conexión **TCP** (protocolo de transporte confiable): `curl -i` muestra la línea de estado y las cabeceras;
  `curl -v` muestra también la petición (líneas que empiezan con `>`).
- Las cabeceras no distinguen mayúsculas (`Content-Type` = `content-type`); Node las entrega en minúsculas en
  `req.headers`.
- **Negociación:** `Accept-Language` pide un idioma y el servidor elige (`Hello` o `Hola`); `Content-Type` dice
  el formato del cuerpo que envías. Si no es el esperado, `415 Unsupported Media Type`.
- **405 frente a 404:** 404 = la ruta no existe; 405 = existe pero no con ese método, y la respuesta **debe**
  incluir la cabecera `Allow` con los métodos válidos.
- **Idempotencia:** `GET`, `PUT` y `DELETE` son idempotentes (repetirlos deja el mismo estado); `POST` no
  (repetirlo puede crear dos pedidos). Es clave para reintentos (Módulos 8 y 19).
- HTTP es **sin estado**: cada petición lleva todo lo necesario; la «sesión» se simula con cabeceras (cookies,
  tokens).
- `Connection: keep-alive` reutiliza la conexión TCP para varias peticiones; `Transfer-Encoding: chunked` indica
  que el cuerpo se envía por trozos sin conocer su tamaño de antemano.

#### 8. EXPLICACIÓN MAESTRA

- **HTTP/1.1, HTTP/2 y HTTP/3.** HTTP/1.1 (texto, una petición a la vez por conexión) es universal y fácil de
  depurar. HTTP/2 (binario, multiplexado sobre una conexión, cabeceras comprimidas) es la base de gRPC y reduce
  latencia entre servicios. HTTP/3 corre sobre QUIC (UDP) y evita el bloqueo de cabeza de línea de TCP; útil en
  redes móviles, raro entre servicios internos. En un microservicio típico: HTTP/1.1 o HTTP/2 detrás de un
  balanceador.
- **Códigos como contrato operativo.** Los balanceadores, *circuit breakers* y alertas leen los códigos: devolver
  500 por un error de validación dispara alertas falsas y reintentos inútiles; devolver 200 con un error dentro
  esconde fallos. Alternativa estándar para el cuerpo de los errores: `application/problem+json` (RFC 9457).
- **Síncrono frente a asíncrono.** HTTP petición-respuesta acopla en el tiempo a cliente y servidor (ambos
  deben estar vivos). La mensajería (Kafka, RabbitMQ, Módulos 6 y 11) desacopla a cambio de complejidad.
- **Cuándo NO** usar HTTP petición-respuesta: notificaciones a muchos interesados, procesos de larga duración
  (minutos) o flujos continuos de eventos; ahí van colas, *webhooks* o *streams*.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** (también Node 22); solo `node:http`. `package.json` del laboratorio en
`modulo-3/` (incluye la dependencia del tema **YAML**, formato de texto para configuración; este tema no la usa):

```json
{
  "name": "modulo-0-4-herramientas",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=26.13.1" },
  "scripts": { "test": "node --test" },
  "dependencies": { "yaml": "2.9.1" }
}
```

`servidor-http.js`:

```javascript
// Módulo 0.4 · HTTP: un servidor que muestra las piezas de HTTP (método, ruta, cabeceras, estado, cuerpo).
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Usa solo 'node:http'.
// Ejecuta: node http/servidor-http.js   y en otra terminal:  curl -i http://localhost:3002/saludo

import http from 'node:http';

export function crearServidor() {
  return http.createServer(async (req, res) => {
    // LÍNEA DE PETICIÓN: método + ruta.  CABECERAS: req.headers (en minúsculas).
    const idioma = req.headers['accept-language']?.startsWith('en') ? 'en' : 'es';

    if (req.url === '/saludo') {
      if (req.method !== 'GET') {
        // 405: la ruta existe, pero no acepta ese método. La cabecera Allow dice cuáles sí.
        res.writeHead(405, { Allow: 'GET', 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Método no permitido\n');
      }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Curso': 'microservicios' });
      return res.end(idioma === 'en' ? 'Hello\n' : 'Hola\n');
    }

    if (req.url === '/eco' && req.method === 'POST') {
      let cuerpo = '';
      for await (const trozo of req) cuerpo += trozo;
      if (!req.headers['content-type']?.startsWith('application/json')) {
        res.writeHead(415, { 'Content-Type': 'text/plain; charset=utf-8' }); // 415: formato no soportado
        return res.end('Envía Content-Type: application/json\n');
      }
      let datos;
      try {
        datos = JSON.parse(cuerpo);
      } catch {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); // 400: petición mal formada
        return res.end('El cuerpo no es JSON válido\n');
      }
      res.writeHead(201, { 'Content-Type': 'application/json' }); // 201: se creó algo
      return res.end(JSON.stringify({ recibido: datos }));
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); // 404: no existe
    res.end('No encontrado\n');
  });
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3002);
  crearServidor().listen(puerto, () => console.log(`HTTP de práctica en http://localhost:${puerto}`));
}
```

#### 10. MINI-LABORATORIO

1. **Terminal 1** (desde `modulo-3`): `node http/servidor-http.js`
2. **Terminal 2**, mira la respuesta completa con `-i`:
   ```bash
   curl -i http://localhost:3002/saludo
   curl -i -X DELETE http://localhost:3002/saludo
   curl -i -X POST http://localhost:3002/eco -H 'Content-Type: application/json' -d '{"nombre":"Ana"}'
   ```
3. Cambia cabeceras y cuerpo para provocar cada código:
   ```bash
   curl -s -H 'Accept-Language: en' http://localhost:3002/saludo
   curl -s -X POST http://localhost:3002/eco -d 'nombre=Ana' -w '[%{http_code}]\n'
   curl -s -X POST http://localhost:3002/eco -H 'Content-Type: application/json' -d "{'nombre':'Ana'}" -w '[%{http_code}]\n'
   curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3002/nada
   ```

**Output esperado** (paso 2; la fecha cambia):

```text
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
X-Curso: microservicios
Date: Fri, 20 Nov 2026 01:57:39 GMT
Connection: keep-alive
Keep-Alive: timeout=5
Transfer-Encoding: chunked

Hola
HTTP/1.1 405 Method Not Allowed
Allow: GET
Content-Type: text/plain; charset=utf-8
…
Método no permitido
HTTP/1.1 201 Created
Content-Type: application/json
…
{"recibido":{"nombre":"Ana"}}
```

Paso 3:

```text
Hello
Envía Content-Type: application/json
[415]
El cuerpo no es JSON válido
[400]
404
```

**Captura comentada:** la primera línea de cada respuesta es la línea de estado; después vienen las cabeceras,
una por línea, y tras una **línea en blanco** el cuerpo. `X-Curso` es una cabecera inventada por nuestro servidor:
puedes añadir las tuyas. `curl -d` sin `-H` envía `application/x-www-form-urlencoded`, por eso el 415.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec http/servidor-http.test.js
```

Salida real:

```text
✔ GET /saludo -> 200 con cabecera propia (22.333821ms)
✔ la cabecera Accept-Language cambia la respuesta (4.890576ms)
✔ DELETE /saludo -> 405 con cabecera Allow (2.702721ms)
✔ POST /eco con JSON -> 201 y devuelve lo recibido (6.170839ms)
✔ POST /eco sin Content-Type JSON -> 415 (5.286706ms)
✔ ruta inexistente -> 404 (1.933575ms)
ℹ tests 6
ℹ pass 6
ℹ fail 0
```

**Pregunta de comprobación:** un cliente envía `POST /eco` con `Content-Type: application/json` y el cuerpo
`{"nombre":"Ana",}`. ¿Qué código recibe y de quién es la culpa? *(400: el JSON tiene una coma final inválida; es
error del cliente, grupo 4xx.)*

#### 12. ERROR COMÚN

**Síntoma:** tu API responde siempre 415 o 400 aunque el JSON es correcto. **Cómo se ve:** `curl -v` muestra en
la petición `> Content-Type: application/x-www-form-urlencoded`. **Diagnóstico:** `curl -d` usa ese tipo por
defecto; el servidor rechaza el formato. Mira siempre la petición real con `-v` antes de culpar al servidor:

```bash
curl -v -X POST http://localhost:3002/eco -d '{"nombre":"Ana"}' 2>&1 | grep '> Content-Type'
```

**Arreglo:** añade `-H 'Content-Type: application/json'` (o usa `curl --json '{"nombre":"Ana"}'`, disponible desde
curl 7.82, que pone las cabeceras correctas).

#### 13. PREGUNTA DE ENTREVISTA

«¿Qué significa que un método HTTP sea idempotente y por qué importa en microservicios?»

**Respuesta modelo:** que ejecutarlo una o varias veces deja el servidor en el mismo estado. `GET`, `HEAD`, `PUT`
y `DELETE` lo son por especificación; `POST` no. Importa porque en sistemas distribuidos los reintentos son
inevitables: si un timeout corta la respuesta, el cliente no sabe si la operación se aplicó. Reintentar un `PUT`
es seguro; reintentar un `POST` puede duplicar un pago. Para hacer seguro un `POST` se usa una **clave de
idempotencia** (cabecera `Idempotency-Key`) que el servidor recuerda para no aplicar dos veces la misma operación.

#### 14. ANTI-PATRÓN RELACIONADO

**«Todo es POST y todo responde 200»** (RPC disfrazado de REST):

```text
✖ POST /api/obtenerUsuario       → 200 {"ok":false,"error":"no existe"}
✖ POST /api/borrarUsuario?id=7   → 200 {"ok":true}
✖ GET  /api/borrarTodo           → 200      (un GET que borra: un rastreador web puede dispararlo)
```

Se ve como verbos en las rutas, códigos 200 para errores y operaciones peligrosas en `GET`. Rompe cachés,
reintentos automáticos y monitoreo. Usa sustantivos en las rutas, el método que corresponde a la acción y el
código que describe el resultado.

---

### JSON

#### 1. UBICACIÓN

Módulo 0.4, Lección 4 de 6 · Fase 0.

#### 2. PRERREQUISITOS

- Tema «HTTP» (cuerpo de una petición y `Content-Type: application/json`).
- Módulo 0.3: objetos y listas en JavaScript, records en Java.

#### 3. OBJETIVO DE APRENDIZAJE

**Convertir** texto JSON en datos (`JSON.parse`) y datos en texto (`JSON.stringify`), **reconocer** los seis tipos
de JSON y **diagnosticar** los errores de sintaxis más frecuentes; lo compruebas cuando `json/json.test.js` pasa 4
de 4.

#### 4. ANALOGÍA VISUAL

Dibuja un **formulario de pedido en papel** con casillas: «cliente: Ana», «pagado: ☐ sí ☑ no», «nota: (vacío)» y
una tabla de ítems con dos columnas (plato, cantidad). A la derecha, el **mismo formulario escrito a máquina en
una tira de papel continua**: `{"cliente":"Ana","items":[{"plato":"Arepa","cantidad":2}],"pagado":false,"nota":null}`.
Entre ambos, dos flechas con nombres: de la tira al formulario, **parse** («leer la tira y llenar las casillas»);
del formulario a la tira, **stringify** («pasar a máquina»). La tira es lo único que viaja por el tubo neumático
(la red); al llegar, alguien la vuelve a convertir en formulario. Abajo, en rojo, una tira rota con una coma de
más al final y comillas simples: el lector la rechaza.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    O["Objeto en memoria<br/>{cliente, items[], pagado, nota}"] -->|"JSON.stringify"| T["Texto JSON<br/>(string)"]
    T -->|"red / archivo / cola"| T2["Texto JSON"]
    T2 -->|"JSON.parse"| O2["Objeto en memoria"]
    T2 -.->|"sintaxis inválida"| X["SyntaxError"]
```

**Texto alternativo:** un objeto en memoria se convierte con JSON.stringify en texto JSON; ese texto viaja por la
red, un archivo o una cola, y en el destino JSON.parse lo vuelve a convertir en objeto. Si la sintaxis es
inválida, parse produce un SyntaxError.

#### 6. EXPLICACIÓN NIVEL 0

**JSON** (*JavaScript Object Notation*) es una forma de escribir datos como **texto** para que dos programas
(aunque estén en lenguajes distintos, como Java y Node) se entiendan. Es el formato que usarán casi todas las APIs
del curso.

Tiene solo seis tipos de valor:

| Tipo | Ejemplo |
|---|---|
| texto (*string*) | `"Ana"` (siempre comillas **dobles**) |
| número | `2`, `4500.5` |
| booleano | `true`, `false` |
| nulo | `null` |
| objeto | `{"clave": valor, ...}` |
| lista (*array*) | `[valor, valor]` |

Reglas que más se olvidan: las claves siempre van entre comillas dobles, no se permiten comas al final, no hay
comentarios.

#### 7. EXPLICACIÓN INTERMEDIA

- `JSON.parse(texto)` analiza el texto y construye objetos, listas, números… Si la sintaxis es inválida lanza
  `SyntaxError`, por eso se envuelve en `try/catch` (o se responde 400 en una API).
- `JSON.stringify(valor, null, 2)` produce texto; el tercer argumento añade sangría para personas. Sin él, el
  texto va compacto (lo que se envía por la red).
- **Lo que JSON no puede representar:** `undefined` y funciones desaparecen; `Date` se convierte en texto ISO
  (`"2026-11-19T00:00:00.000Z"`) y al volver es un *string*, no una fecha; `NaN` e `Infinity` se convierten en
  `null`.
- En Java no hay JSON en la librería estándar: en la Fase 1 usarás **Jackson** (que Spring Boot configura solo);
  en la Fase 2, `JSON` nativo y validación con Zod o class-validator.
- El tipo de contenido es `application/json`, y el texto debe ir en UTF-8.

#### 8. EXPLICACIÓN MAESTRA

- **JSON frente a alternativas.** XML (más verboso, con esquemas XSD y espacios de nombres; sigue vivo en
  integraciones bancarias y SOAP), **Protocol Buffers** y **Avro** (binarios, compactos, con esquema obligatorio y
  evolución controlada; Módulos 6 y 11), **MessagePack/CBOR** (JSON binario). JSON gana en legibilidad y
  universalidad; pierde en tamaño, velocidad de análisis y ausencia de esquema.
- **Números grandes.** JavaScript representa los números como *double*: los enteros por encima de
  2^53 − 1 (9007199254740991) pierden precisión al hacer `JSON.parse`. IDs de 64 bits (como los de Twitter o
  Snowflake) deben viajar como texto. El dinero, como entero en centavos o como texto decimal, nunca como
  `0.1 + 0.2`.
- **Esquemas y evolución.** Sin esquema, cualquier productor puede romper a los consumidores. Alternativas: JSON
  Schema, OpenAPI (Módulo 14), o formatos con esquema y registro (Schema Registry, Módulo 11). Regla de
  compatibilidad: añadir campos opcionales sí; quitar o renombrar campos, no sin nueva versión.
- **Cuándo NO** usar JSON: eventos de alto volumen (millones por segundo) donde el tamaño y el costo de CPU
  importan, o contratos internos que necesitan esquema estricto y evolución verificada; ahí Avro o Protobuf.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** (también Node 22); `JSON` viene incluido en JavaScript. Usa el `package.json`
de `modulo-3/`. `json.js`:

```javascript
// Módulo 0.4 · JSON: convertir texto JSON en datos (parse) y datos en texto JSON (stringify).
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). JSON viene incluido en JavaScript.
// Ejecuta: node json/json.js

// Así llega un pedido por la red: es TEXTO, aunque parezca un objeto.
const texto = '{"cliente":"Ana","items":[{"plato":"Arepa","cantidad":2}],"pagado":false,"nota":null}';

// parse: texto -> datos que el programa puede usar
export function leerPedido(textoJson) {
  try {
    return { ok: true, datos: JSON.parse(textoJson) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// stringify: datos -> texto para enviar o guardar (con sangría de 2 espacios para leerlo)
export function escribirPedido(pedido) {
  return JSON.stringify(pedido, null, 2);
}

if (import.meta.main) {
  const { datos } = leerPedido(texto);
  console.log(`typeof texto = ${typeof texto}, typeof datos = ${typeof datos}`);
  console.log(`Cliente: ${datos.cliente}, primer plato: ${datos.items[0].plato} x${datos.items[0].cantidad}`);
  datos.pagado = true;
  console.log(escribirPedido(datos));
  // JSON inválido: comillas simples y coma final NO están permitidas en JSON.
  console.log(leerPedido("{'cliente':'Ana',}"));
}
```

#### 10. MINI-LABORATORIO

1. Desde `modulo-3`:
   ```bash
   node json/json.js
   ```
2. Comprueba la pérdida de precisión con números grandes:
   ```bash
   node -e "console.log(JSON.parse('{\"id\": 9007199254740993}').id)"
   ```
3. Valida un archivo JSON desde la terminal (útil antes de enviarlo con `curl -d @archivo`):
   ```bash
   echo '{"platoId":2,"cantidad":3}' > /tmp/pedido.json
   node -e "JSON.parse(require('fs').readFileSync('/tmp/pedido.json','utf8')); console.log('JSON válido')"
   ```

**Output esperado** (paso 1):

```text
typeof texto = string, typeof datos = object
Cliente: Ana, primer plato: Arepa x2
{
  "cliente": "Ana",
  "items": [
    {
      "plato": "Arepa",
      "cantidad": 2
    }
  ],
  "pagado": true,
  "nota": null
}
{
  ok: false,
  error: "Expected property name or '}' in JSON at position 1 (line 1 column 2)"
}
```

Paso 2: `9007199254740992` (¡no 993!). Paso 3: `JSON válido`.

**Captura comentada:** `typeof` confirma la transformación: lo que llega es `string` y tras `parse` es `object`.
El último bloque muestra el mensaje de error del analizador de V8; la redacción exacta puede variar entre
versiones de Node, pero siempre indica la posición del primer carácter inválido (la comilla simple, columna 2).

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec json/json.test.js
```

Salida real:

```text
✔ parse convierte texto en objeto con sus tipos (0.793464ms)
✔ ida y vuelta: stringify y luego parse devuelve lo mismo (0.607577ms)
✔ comillas simples o coma final -> error de sintaxis (0.121733ms)
✔ JSON no guarda undefined ni funciones, y convierte fechas en texto (0.711212ms)
ℹ tests 4
ℹ pass 4
ℹ fail 0
```

**Pregunta de comprobación:** si un servicio envía `{"fecha": new Date()}` con `JSON.stringify` y otro hace
`JSON.parse`, ¿qué tipo tiene `fecha` al llegar? *(Un string en formato ISO 8601; hay que convertirlo de nuevo a
fecha explícitamente.)*

#### 12. ERROR COMÚN

**Síntoma:** `SyntaxError: Unexpected token` o `Expected property name or '}'` al leer un JSON escrito a mano.
**Cómo se ve:** el mensaje incluye `position N`: cuenta N caracteres desde el inicio (empezando en 0) y ahí está
el problema. **Diagnóstico:** casi siempre es una de cuatro cosas: comillas simples, coma final, comentario `//`
o clave sin comillas. Valídalo con `node -e "JSON.parse(...)"` o `python3 -m json.tool archivo.json`, que señala
línea y columna. **Arreglo:** corrige la sintaxis; si el archivo es configuración escrita por personas,
considera YAML (siguiente tema), que admite comentarios.

#### 13. PREGUNTA DE ENTREVISTA

«Un servicio Java envía IDs de tipo `long` en JSON y el frontend o un servicio Node los recibe cambiados. ¿Qué pasa
y cómo lo resuelves?»

**Respuesta modelo:** JSON no limita los números, pero JavaScript los convierte a *double* (IEEE 754), que solo
representa enteros exactos hasta 2^53 − 1. Un `long` mayor pierde los últimos dígitos al hacer `JSON.parse`, sin
error. La solución estándar es serializar esos IDs como **string** (en Jackson con
`@JsonFormat(shape = STRING)` o `ToStringSerializer`), documentarlo en el contrato OpenAPI, y en Node tratarlos
como texto o `BigInt`. Para dinero, igual: enteros en unidades mínimas o decimales como texto.

#### 14. ANTI-PATRÓN RELACIONADO

**Construir JSON concatenando textos a mano:**

```javascript
// ✖ Anti-patrón: si el nombre trae comillas, el JSON queda roto (o inyectado)
const nombre = 'Ana "la jefa"';
const cuerpo = '{"cliente":"' + nombre + '","total":' + total + '}';
```

Se ve como cadenas con `'{"` y `+` por todas partes. Un nombre con comillas o saltos de línea rompe el JSON, y un
atacante puede inyectar campos (`","admin":true,"x":"`). Construye siempre un objeto y usa `JSON.stringify` (o
Jackson en Java), que escapa los caracteres especiales.

---

### YAML

#### 1. UBICACIÓN

Módulo 0.4, Lección 5 de 6 · Fase 0.

#### 2. PRERREQUISITOS

- Tema «JSON» (objetos, listas, tipos).
- Saber instalar dependencias con `npm install` (lo harás aquí por primera vez: descarga la librería `yaml` del
  registro de npm).

#### 3. OBJETIVO DE APRENDIZAJE

**Leer** un archivo de configuración YAML, **traducirlo** mentalmente a su JSON equivalente y **evitar** los dos
errores clásicos (tabulaciones en la sangría y valores que YAML convierte de tipo sin avisar); lo compruebas
cuando `yaml/leer-config.test.js` pasa 5 de 5.

#### 4. ANALOGÍA VISUAL

Dibuja el **índice de un libro** con sangrías: «servicio» al margen; debajo, corridos dos espacios, «nombre:
pedidos», «puerto: 8080»; luego, otra vez al margen, «base_de_datos», y debajo sus detalles. Más abajo, una **lista
de compras con viñetas** (guiones): «- CO», «- MX», «- "NO"». Una regla graduada sobre el margen izquierdo marca
cada **dos espacios**: la distancia al margen decide quién es «hijo» de quién. A un lado, un sello rojo con una
tecla **Tab** tachada (prohibida) y una bandera de Noruega con un globo de diálogo: «¿me llamaste "falso"?»,
recordando que, en YAML antiguo, `NO` sin comillas significaba falso.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    Y["config.yaml<br/>servicio:<br/>&nbsp;&nbsp;nombre: pedidos<br/>&nbsp;&nbsp;puerto: 8080<br/>paises_habilitados:<br/>&nbsp;&nbsp;- CO"] -->|"parse (librería yaml)"| O["Objeto<br/>{servicio:{nombre:'pedidos',puerto:8080},<br/>paises_habilitados:['CO',…]}"]
    O -->|"JSON.stringify"| J["JSON equivalente"]
```

**Texto alternativo:** un archivo config.yaml con claves sangradas y una lista con guiones se convierte, con la
librería yaml, en un objeto anidado con un número 8080 y una lista de países; ese objeto se puede escribir como
JSON equivalente.

#### 6. EXPLICACIÓN NIVEL 0

**YAML** es otro formato de texto para datos, pensado para que **personas** lo escriban y lean con comodidad. Lo
encontrarás en archivos de configuración: Docker Compose (`docker-compose.yml`), Kubernetes, GitHub Actions y
Spring Boot (`application.yml`).

Dice lo mismo que JSON pero sin llaves ni comillas obligatorias:

- `clave: valor` en cada línea;
- la **sangría** (espacios al inicio) indica qué está dentro de qué;
- un **guion** `-` inicia cada elemento de una lista;
- `#` empieza un **comentario** (JSON no los tiene).

Regla de oro: sangría con **espacios**, nunca con la tecla Tab, y siempre la misma cantidad (dos espacios es lo
habitual).

#### 7. EXPLICACIÓN INTERMEDIA

- YAML es (casi) un **superconjunto de JSON**: un JSON válido suele ser YAML válido.
- **Tipos implícitos:** `8080` es número, `false` es booleano, `pedidos` es texto, `null` o `~` es nulo. Para
  forzar texto, usa comillas: `"8080"`, `"NO"`.
- **YAML 1.1 frente a 1.2:** en YAML 1.1 (el de muchas herramientas antiguas) `yes`, `no`, `on`, `off` y `NO`
  son booleanos; en YAML 1.2 (el de la librería `yaml` 2.x por defecto) solo `true`/`false`. El test lo demuestra
  con `parse('pais: NO', { version: '1.1' })` → `false`.
- Nodo no trae lector de YAML: se usa una librería. `yaml` 2.9.1 ofrece `parse` y `stringify`; en Java, Spring
  Boot usa SnakeYAML por debajo.
- Una tabulación en la sangría produce `YAMLParseError: Tabs are not allowed as indentation`.
- Bloques multilínea: `|` conserva saltos de línea; `>` los une en una línea.

#### 8. EXPLICACIÓN MAESTRA

- **YAML frente a JSON frente a TOML/properties.** YAML: legible, comentarios, anclas (`&`/`*`) para no repetir;
  pero ambiguo (tipos implícitos, sangría significativa) y con analizadores que difieren entre lenguajes. JSON:
  estricto e inequívoco, sin comentarios: ideal para máquinas. `.properties` (Spring) o TOML: planos y simples,
  pero incómodos para estructuras profundas. Para configuración que escriben personas, YAML con validación de
  esquema; para intercambio entre programas, JSON.
- **Plantillas y generación.** En Kubernetes, YAML crece hasta miles de líneas; Helm (plantillas) y Kustomize
  (parches) existen para no copiar y pegar (Módulo 12). Alternativas con tipos: CUE, Jsonnet, o generarlo desde
  código.
- **Seguridad.** Algunos analizadores YAML (SnakeYAML antiguo, PyYAML con `load` sin `SafeLoader`) podían crear
  objetos arbitrarios desde el archivo: ejecución remota de código. Usa siempre el modo seguro y versiones
  actualizadas.
- **Cuándo NO** usar YAML: para datos que intercambian programas en tiempo de ejecución (APIs, eventos): usa JSON
  u otro formato estricto. Tampoco para guardar secretos en texto plano en Git (Módulo 9).

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** y la librería **`yaml` 2.9.1** (versión exacta en `package.json` de
`modulo-3/`, mostrado en el tema HTTP; se instala con `npm install`). `config.yaml`:

```yaml
# Módulo 0.4 · YAML: configuración de un servicio. Los espacios de la izquierda SON la estructura.
# Regla: sangría con ESPACIOS (nunca tabulaciones). Un "-" inicia un elemento de lista.
servicio:
  nombre: pedidos
  puerto: 8080
  depuracion: false
base_de_datos:
  url: "postgres://localhost:5432/pedidos"
  pool: 10
paises_habilitados:
  - CO
  - MX
  - "NO"   # entre comillas: así siempre es el texto "NO" (Noruega), en cualquier versión de YAML
```

`leer-config.js`:

```javascript
// Módulo 0.4 · YAML: leer un archivo de configuración YAML y usarlo como datos.
// Requisitos: Node.js 26.13.1 LTS y la librería yaml 2.9.1 (npm install, ver package.json).
// Ejecuta (desde la carpeta yaml/):  npm install && node leer-config.js

import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

export function leerConfig(textoYaml) {
  return parse(textoYaml);
}

if (import.meta.main) {
  const config = leerConfig(readFileSync(new URL('./config.yaml', import.meta.url), 'utf8'));
  console.log(`Servicio: ${config.servicio.nombre} en el puerto ${config.servicio.puerto} (tipo ${typeof config.servicio.puerto})`);
  console.log(`Depuración: ${config.servicio.depuracion} (tipo ${typeof config.servicio.depuracion})`);
  console.log(`Países: ${config.paises_habilitados.join(', ')}`);
  console.log('Mismo contenido en JSON:', JSON.stringify(config));
}
```

#### 10. MINI-LABORATORIO

1. Instala la dependencia y lee la configuración (desde `modulo-3`):
   ```bash
   npm install
   cd yaml
   node leer-config.js
   ```
2. **Rómpelo a propósito con una tabulación:**
   ```bash
   printf 'servicio:\n\tnombre: pedidos\n' > /tmp/tab.yaml
   node -e "import('yaml').then(y => { try { y.parse(require('fs').readFileSync('/tmp/tab.yaml','utf8')) } catch (e) { console.log(e.name + ': ' + e.message) } })"
   ```
3. **El problema de Noruega:** compara YAML 1.2 y 1.1:
   ```bash
   node -e "import('yaml').then(y => console.log(y.parse('pais: NO'), y.parse('pais: NO', { version: '1.1' })))"
   ```

**Output esperado** (paso 1):

```text
Servicio: pedidos en el puerto 8080 (tipo number)
Depuración: false (tipo boolean)
Países: CO, MX, NO
Mismo contenido en JSON: {"servicio":{"nombre":"pedidos","puerto":8080,"depuracion":false},"base_de_datos":{"url":"postgres://localhost:5432/pedidos","pool":10},"paises_habilitados":["CO","MX","NO"]}
```

Paso 2:

```text
YAMLParseError: Tabs are not allowed as indentation at line 2, column 1:

servicio:
	nombre: pedidos
^
```

Paso 3: `{ pais: 'NO' } { pais: false }`.

**Captura comentada:** la última línea del paso 1 es la prueba de que YAML y JSON describen el mismo objeto. En el
paso 2, el `^` apunta al inicio de la línea 2, donde está la tabulación invisible.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec yaml/leer-config.test.js
```

(desde `modulo-3`, después de `npm install`). Salida real:

```text
✔ la sangría crea objetos anidados (0.997086ms)
✔ YAML adivina tipos: 8080 es número y false es booleano (0.193361ms)
✔ los guiones forman una lista (0.854853ms)
✔ una tabulación en la sangría es un error (1.358585ms)
✔ NO sin comillas: texto en YAML 1.2, falso en YAML 1.1 (1.242312ms)
ℹ tests 5
ℹ pass 5
ℹ fail 0
```

**Pregunta de comprobación:** escribe el JSON equivalente de `base_de_datos:` con sus dos claves. *(`{"base_de_datos":
{"url":"postgres://localhost:5432/pedidos","pool":10}}`.)*

#### 12. ERROR COMÚN

**Síntoma:** un `docker-compose.yml` o `application.yml` «no toma» un valor, o una clave aparece en el lugar
equivocado sin ningún error. **Cómo se ve:** una clave sangrada con 3 espacios en vez de 2, o al mismo nivel que su
padre: el archivo es YAML válido pero con otra estructura. **Diagnóstico:** convierte el archivo a JSON y míralo:

```bash
node -e "import('yaml').then(y => console.log(JSON.stringify(y.parse(require('fs').readFileSync('config.yaml','utf8')), null, 2)))"
```

En JSON la anidación es explícita y el error salta a la vista. **Arreglo:** configura tu editor para insertar
espacios al pulsar Tab y mostrar caracteres invisibles; usa `docker compose config` o `kubectl apply --dry-run`
para validar antes de aplicar.

#### 13. PREGUNTA DE ENTREVISTA

«¿Por qué en un archivo YAML conviene poner entre comillas valores como versiones, códigos de país o códigos
postales?»

**Respuesta modelo:** porque YAML infiere tipos. `version: 1.10` se lee como el número 1.1 (pierde el cero),
`codigo: 00123` puede perder los ceros iniciales o leerse como octal en YAML 1.1, y `pais: NO` o `activo: off` son
booleanos en YAML 1.1. Distintas herramientas usan distintas versiones del estándar, así que el mismo archivo
puede leerse diferente. Poner comillas fuerza el tipo texto y hace el archivo inequívoco; además conviene validar
con un esquema (JSON Schema o el de la herramienta).

#### 14. ANTI-PATRÓN RELACIONADO

**Copiar y pegar bloques YAML idénticos entre entornos y servicios:**

```yaml
# ✖ Anti-patrón: el mismo bloque copiado en 12 archivos, cada uno con una diferencia sutil
servicio-pedidos-dev:   { imagen: pedidos:1.2, memoria: 512Mi, replicas: 1 }
servicio-pedidos-qa:    { imagen: pedidos:1.2, memoria: 512Mi, replicas: 1 }
servicio-pedidos-prod:  { imagen: pedidos:1.1, memoria: 521Mi, replicas: 3 }   # ¿1.1? ¿521?
```

Se ve como bloques casi iguales donde nadie nota el `1.1` ni el `521`. Usa una base común y solo las diferencias
por entorno (anclas YAML, perfiles de Spring, Helm o Kustomize).

---

### Variables de entorno

#### 1. UBICACIÓN

Módulo 0.4, Lección 6 de 6 · Fase 0.

#### 2. PRERREQUISITOS

- Tema «Terminal» (ejecutar comandos, códigos de salida, stderr).
- Módulo 0.3 (ejecutar Java y Node).
- Tema «Git» (qué no se debe subir a un repositorio).

#### 3. OBJETIVO DE APRENDIZAJE

**Configurar** un programa en Node.js y en Java con variables de entorno, **cargar** valores desde un archivo con
`node --env-file` y **validar** la configuración al arrancar para fallar rápido; lo compruebas cuando
`env/config.test.js` pasa 5 de 5 y `java ConfigTest.java` pasa 3 de 3.

#### 4. ANALOGÍA VISUAL

Dibuja una **misma cafetera** (el programa, sin cambios) en tres cocinas distintas: la de tu casa
(desarrollo), la de una oficina de pruebas (QA) y la de un restaurante (producción). Cada cocina tiene pegada en
la pared una **etiqueta con ajustes**: «PUERTO=8080, MODO=desarrollo» en casa; «PUERTO=8081, MODO=produccion,
CLAVE_API=abc…» en el restaurante. La cafetera **lee la etiqueta de la pared de donde está** al encenderse: no
hay que abrirla ni cambiarle piezas para usarla en otro lugar. La etiqueta del restaurante tiene una parte
**tapada con cinta** (el secreto): la cafetera lo usa, pero nunca lo muestra en su pantalla. Si la etiqueta dice
algo absurdo («PUERTO=ochenta»), la cafetera se niega a encender y muestra un aviso.

#### 5. DIAGRAMA TÉCNICO

```mermaid
flowchart LR
    SO["Sistema operativo / Docker / Kubernetes<br/>PUERTO=9000 MODO=produccion CLAVE_API=…"] -->|"entorno del proceso"| P["Proceso<br/>process.env · System.getenv"]
    F[".env.example"] -->|"node --env-file"| P
    P --> V{"¿valores válidos?"}
    V -- "sí" --> A["arranca con la configuración"]
    V -- "no" --> X["termina con código 1<br/>«Configuración inválida»"]
```

**Texto alternativo:** el sistema operativo, Docker o Kubernetes entregan variables al proceso; también un
archivo .env puede cargarse con node --env-file. El proceso las lee con process.env o System.getenv y las valida:
si son válidas arranca, y si no, termina con código 1 y el mensaje «Configuración inválida».

#### 6. EXPLICACIÓN NIVEL 0

Una **variable de entorno** es un par **NOMBRE=valor** que el sistema operativo le entrega a cada programa al
arrancarlo. Sirven para **configurar** un programa sin cambiar su código: en tu computador el servicio usa el
puerto 8080 y una base de datos de prueba; en producción, otro puerto y la base real. El código es el mismo; solo
cambia el entorno.

En la terminal:

- `PUERTO=9000 node config.js` define la variable **solo para ese comando**;
- `export PUERTO=9000` la define para todos los comandos siguientes de esa terminal;
- `echo $PUERTO` muestra su valor.

Los **secretos** (contraseñas, claves de API) también suelen llegar por variables de entorno, y nunca se escriben
en el código ni se suben a Git.

#### 7. EXPLICACIÓN INTERMEDIA

- En Node: `process.env.PUERTO` (siempre **texto** o `undefined`); en Java: `System.getenv("PUERTO")` (texto o
  `null`). Hay que convertir y validar: `Number(...)`, `Integer.parseInt(...)`.
- `??` (Node) y `Objects.requireNonNullElse` (Java) aplican valores por defecto **solo** si la variable no existe.
- **Fallar rápido:** validar al arrancar y terminar con código 1 es mejor que descubrir a medianoche que el puerto
  era `"ochenta"`.
- `node --env-file=.env.example config.js` (desde Node 20.6) carga variables desde un archivo sin librerías; las
  variables ya definidas en el entorno tienen prioridad. Antes se usaba el paquete `dotenv` (Módulo 17).
- Los procesos hijos **heredan** el entorno del padre; el test usa eso para lanzar `config.js` y `Config.java`
  con entornos controlados (`spawnSync` en Node, `ProcessBuilder` en Java).
- Un archivo `.env` con valores reales va en `.gitignore`; al repositorio solo sube un `.env.example` con valores
  falsos que documenta qué variables existen.

#### 8. EXPLICACIÓN MAESTRA

- **Factor III de la 12-Factor App** (Módulo 5): la configuración que cambia entre despliegues vive en el
  entorno, no en el código. Alternativas: archivos de configuración por entorno (`application-prod.yml`, Spring
  Profiles; legibles y versionados, pero hay que empaquetarlos o montarlos), servidores de configuración
  centralizada (Spring Cloud Config, Consul; cambios en caliente y auditoría a cambio de otra pieza de
  infraestructura, Módulo 7), y ConfigMaps/Secrets de Kubernetes, que terminan inyectándose como variables o
  archivos (Módulo 12).
- **Secretos en variables de entorno: aceptable, no ideal.** Son visibles para cualquier proceso que inspeccione
  el entorno (`/proc/<pid>/environ`, `docker inspect`) y pueden filtrarse en logs de errores. Para producción
  seria: gestores de secretos (Vault, AWS Secrets Manager) con rotación y credenciales de corta vida (Módulos 9 y
  20).
- **Tipado y esquema de configuración.** A partir de 5 variables, centraliza su lectura en un único módulo
  validado (como `leerConfig`), con Zod en Node o `@ConfigurationProperties` + validación en Spring.
- **Cuándo NO** usar variables de entorno: para valores que cambian en tiempo de ejecución (un *feature flag* que
  se activa sin reiniciar) o estructuras grandes (listas de 200 reglas); ahí, un servicio de configuración o un
  archivo montado.

#### 9. CÓDIGO EJECUTABLE

Versiones: **Node.js 26.13.1 LTS** (`--env-file` desde Node 20.6) y **JDK 25 LTS**. Sin dependencias.
`config.js`:

```javascript
// Módulo 0.4 · Variables de entorno: la configuración llega DESDE FUERA del código.
// Requisitos: Node.js 26.13.1 LTS (--env-file existe desde Node 20.6). Sin dependencias.
// Ejecuta (desde la carpeta env/):
//   node config.js                              -> usa los valores por defecto
//   PUERTO=9000 MODO=produccion node config.js   -> los define solo para este comando
//   node --env-file=.env.example config.js      -> los lee de un archivo

export function leerConfig(env) {
  const puerto = Number(env.PUERTO ?? 8080); // ?? = "si no existe, usa esto"
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error(`PUERTO inválido: "${env.PUERTO}"`); // fallar al arrancar, no a medianoche
  }
  const modo = env.MODO ?? 'desarrollo';
  if (!['desarrollo', 'produccion'].includes(modo)) {
    throw new Error(`MODO inválido: "${modo}" (usa desarrollo o produccion)`);
  }
  // Un secreto nunca tiene valor por defecto y nunca se imprime completo.
  const claveApi = env.CLAVE_API;
  if (modo === 'produccion' && !claveApi) {
    throw new Error('En produccion CLAVE_API es obligatoria');
  }
  return { puerto, modo, claveApi };
}

if (import.meta.main) {
  try {
    const c = leerConfig(process.env);
    console.log(`puerto=${c.puerto} modo=${c.modo} claveApi=${c.claveApi ? c.claveApi.slice(0, 3) + '***' : '(sin definir)'}`);
  } catch (e) {
    console.error(`Configuración inválida: ${e.message}`);
    process.exit(1);
  }
}
```

`.env.example` (valores falsos, para practicar):

```bash
# Archivo de ejemplo: valores FALSOS para practicar. El .env real nunca se sube a Git.
PUERTO=8081
MODO=produccion
CLAVE_API=abc123-falsa
```

`Config.java`:

```java
// Módulo 0.4 · Variables de entorno en Java: System.getenv lee el entorno del proceso.
// Requisitos: JDK 25 LTS (funciona desde JDK 11 con `java Config.java`). Sin dependencias.
// Ejecuta (desde la carpeta env/):
//   java Config.java
//   PUERTO=9000 java Config.java

public class Config {
    public static void main(String[] args) {
        // getenv devuelve null si la variable no existe; Objects.requireNonNullElse pone el valor por defecto.
        String textoPuerto = java.util.Objects.requireNonNullElse(System.getenv("PUERTO"), "8080");
        String modo = java.util.Objects.requireNonNullElse(System.getenv("MODO"), "desarrollo");
        int puerto;
        try {
            puerto = Integer.parseInt(textoPuerto);
        } catch (NumberFormatException e) {
            System.err.println("Configuración inválida: PUERTO inválido: \"" + textoPuerto + "\"");
            System.exit(1);
            return;
        }
        System.out.println("puerto=" + puerto + " modo=" + modo);
    }
}
```

#### 10. MINI-LABORATORIO

1. Desde `env`, ejecuta con distintos entornos:
   ```bash
   node config.js
   PUERTO=9000 MODO=produccion node config.js; echo "código: $?"
   PUERTO=9000 MODO=produccion CLAVE_API=xyz789 node config.js
   node --env-file=.env.example config.js
   PUERTO=ochenta node config.js; echo "código: $?"
   ```
2. Lo mismo en Java:
   ```bash
   java Config.java
   PUERTO=9000 MODO=produccion java Config.java
   ```
3. Comprueba que la variable del paso 1 **no** quedó definida en tu terminal, y luego defínela con `export`:
   ```bash
   echo "PUERTO=$PUERTO"
   export PUERTO=7000
   node config.js
   unset PUERTO
   ```

**Output esperado** (paso 1):

```text
puerto=8080 modo=desarrollo claveApi=(sin definir)
Configuración inválida: En produccion CLAVE_API es obligatoria
código: 1
puerto=9000 modo=produccion claveApi=xyz***
puerto=8081 modo=produccion claveApi=abc***
Configuración inválida: PUERTO inválido: "ochenta"
código: 1
```

Paso 2: `puerto=8080 modo=desarrollo` y `puerto=9000 modo=produccion`. Paso 3: `PUERTO=` (vacío) y luego
`puerto=7000 modo=desarrollo claveApi=(sin definir)`.

**Captura comentada:** el mismo archivo `config.js`, sin tocarlo, produce cinco comportamientos distintos. La
clave de API nunca aparece completa (`xyz***`). Los errores de configuración salen por stderr y con código 1: un
orquestador (Docker, Kubernetes) verá que el proceso falló al arrancar.

#### 11. VERIFICACIÓN

```bash
node --test --test-reporter=spec env/config.test.js
(cd env && java ConfigTest.java)
```

(desde `modulo-3`). Salida real:

```text
✔ sin variables usa los valores por defecto (30.106975ms)
✔ las variables cambian el comportamiento sin tocar el código (25.976607ms)
✔ --env-file lee el archivo .env.example y oculta el secreto (26.487097ms)
✔ un valor inválido detiene el programa con código 1 (29.240734ms)
✔ produccion sin CLAVE_API es un error (0.468251ms)
ℹ tests 5
ℹ pass 5
ℹ fail 0
✔ sin variables usa los valores por defecto
✔ PUERTO=9000 y MODO=produccion cambian la salida
✔ PUERTO inválido termina con código 1
Java: todos los tests pasaron
```

Para el módulo completo: `./verificar.sh` (Git 4, terminal 4, Node 20 tests, Java 3 y `RESULTADO: OK · Módulo 0.4
(Git, terminal, HTTP, JSON, YAML, entorno) verificado`). **Pregunta de comprobación:** si defines `PUERTO=9000`
con `export` y además el archivo `.env.example` dice `PUERTO=8081`, ¿cuál usa `node --env-file=.env.example
config.js`? *(9000: las variables que ya existen en el entorno tienen prioridad sobre las del archivo.)*

#### 12. ERROR COMÚN

**Síntoma:** defines la variable en una terminal y el programa no la ve en otra (o en tu editor). **Cómo se ve:**
`echo $PUERTO` vacío y el programa usa el valor por defecto. **Diagnóstico:** las variables viven en el proceso
de **esa** terminal y en sus hijos; otra terminal es otro proceso. Con `VAR=valor comando` solo existe para ese
comando. Otro caso: `node --env-file=.env config.js` falla con `node: .env: not found` (código 9) porque el
archivo no existe en la carpeta actual. **Arreglo:** usa `export` en la misma terminal, el archivo con
`--env-file` correcto, o configura la variable donde se lanza el proceso (Docker Compose `environment:`,
Kubernetes `env:`).

#### 13. PREGUNTA DE ENTREVISTA

«¿Dónde debe vivir la configuración de un microservicio y dónde los secretos?»

**Respuesta modelo:** la configuración que cambia entre entornos (URLs, puertos, tamaños de *pool*, *flags*) fuera
del artefacto: variables de entorno, archivos montados o un servidor de configuración, de modo que la misma
imagen se promueve de QA a producción sin reconstruirla (Factor III de 12-Factor). Los secretos, en un gestor de
secretos (Vault, Secrets Manager, Key Vault) con control de acceso, auditoría y rotación; se entregan al proceso
en tiempo de ejecución (variables o archivos en memoria) y nunca se versionan en Git ni se imprimen en logs. La
aplicación debe validar su configuración al arrancar y fallar rápido.

#### 14. ANTI-PATRÓN RELACIONADO

**Configuración y secretos «quemados» en el código o en la imagen:**

```javascript
// ✖ Anti-patrón: la contraseña de producción vive en el código y en Git para siempre
const db = conectar('postgres://admin:SuperSecreta123@db-produccion:5432/pedidos');
const MODO = 'produccion'; // para probar en local hay que editar y recompilar
```

Se ve como URLs con usuario y contraseña dentro del código, o `if (entorno === 'prod')` repartidos por todos los
archivos. Cualquiera con acceso al repositorio (o a la imagen Docker) tiene la contraseña, y cada entorno exige
otra versión del código. Lee todo del entorno en un único módulo validado, como `leerConfig`.
