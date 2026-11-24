# Módulo 0: Git avanzado y estrategias de branching

> **Requisitos de este curso:** [Fundamentos](/curso/foundations). Lo que esos cursos enseñan aquí se usa sin volver a explicarlo; si algo no te suena, vuelve a su capítulo antes de seguir.


## Aprende construyendo


### Tema 1: Trunk-based development vs GitFlow · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir entre trunk-based development y GitFlow según el tamaño y madurez operativa de un equipo, explicando qué rol cumplen los feature flags en cada modelo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph TRUNK["Trunk-based"]
        direction LR
        TM1(("main")) --> TM2(("main")) --> TM3(("main")) --> TM4(("main")) --> TM5(("main")) --> TM6(("main")) --> TM7(("main")) --> TM8(("main"))
    end
    subgraph FLOW["GitFlow"]
        direction LR
        GM1(("main")) --> GM2(("main"))
        GD1(("develop")) --> GD2(("develop")) --> GD3(("develop"))
        GD1 --> GFX1(("feature/x")) --> GFX2(("feature/x")) --> GFX3(("feature/x")) --> GD2
        GD3 --> GR1(("release/1.2")) --> GR2(("release/1.2")) --> GM2
    end
```

#### ► REGLA PRÁCTICA
Si el equipo despliega varias veces al día con CI/CD y puede ocultar trabajo incompleto detrás de un feature flag, trunk-based es la opción natural; si el producto se libera en versiones programadas (apps móviles con revisión de tienda, software con soporte LTS), GitFlow da una rama `release/` estable donde congelar y parchear sin bloquear `develop`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
mkdir -p academia-devops/src/modulo1/branching/trunk-demo
cd academia-devops/src/modulo1/branching/trunk-demo
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c \
  "git init -q -b main && git config user.email demo@academia.dev && git config user.name demo && \
   echo v1 > app.txt && git add . && git commit -qm inicio && \
   git checkout -qb feature/x && echo 'v2 tras flag' >> app.txt && git commit -qam 'feature x' && \
   git checkout -q main && git merge --no-ff -q feature/x -m 'integra feature x' && \
   git log --oneline --graph --all"
```

</details>

### Tema 2: Rebase interactivo vs merge · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás limpiar un historial de commits con git rebase -i y explicar por qué nunca debe reescribirse el historial de una rama ya compartida.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph Antes["Antes"]
        direction LR
        A_main(("main")) --> A_f1(("WIP")) --> A_f2(("fix")) --> A_f3(("fix2"))
    end
    subgraph Despues["Después de squash"]
        direction LR
        D_main(("main")) --> D_f1(("Añade validación"))
    end
```

#### ► REGLA PRÁCTICA
`git rebase -i` solo es seguro en commits que nadie más haya descargado todavía (tu rama local de feature antes del push, o justo después si nadie más la tocó); en cuanto la rama es compartida, usa merge o tendrás que forzar el push y reescribir el historial que otros ya tienen.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    subgraph Antes["Antes"]
        direction LR
        A_main(("main")) --> A_f1(("WIP")) --> A_f2(("fix")) --> A_f3(("fix2"))
    end
    subgraph Despues["Después de squash"]
        direction LR
        D_main(("main")) --> D_f1(("Añade validación"))
    end
```

```bash
mkdir -p academia-devops/src/modulo1/rebase
cd academia-devops/src/modulo1/rebase
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c \
  "git init -q -b main && git config user.email demo@academia.dev && git config user.name demo && \
   echo v1 > archivo.txt && git add . && git commit -qm WIP && \
   echo v2 >> archivo.txt && git commit -qam fix && \
   echo v3 >> archivo.txt && git commit -qam 'fix de verdad' && git log --oneline"
```

```bash
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c \
  "GIT_SEQUENCE_EDITOR='sed -i 2,3s/^pick/squash/' GIT_EDITOR=true git rebase -i --root && git log --oneline"
```

</details>

### Tema 3: Bisect para encontrar regresiones · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás usar git bisect para encontrar por búsqueda binaria el commit exacto que introdujo una regresión, incluyendo su automatización con bisect run.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    G["good: v1.0"] --> M["punto medio"] --> B["bad: HEAD (bug presente)"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    G["good: v1.0"] --> M["punto medio"] --> B["bad: HEAD (bug presente)"]
```

```bash
mkdir -p academia-devops/src/modulo1/bisect
cd academia-devops/src/modulo1/bisect
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c '
  git init -q -b main && git config user.email demo@academia.dev && git config user.name demo
  echo "def suma(a,b): return a+b" > operacion.py && git add . && git commit -qm v1
  echo "def resta(a,b): return a-b" >> operacion.py && git commit -qam v2
  echo "def bug(a,b): return a-b  # BUG: debería sumar" >> operacion.py && git commit -qam v3-bug
  echo "def multiplica(a,b): return a*b" >> operacion.py && git commit -qam v4
  echo "def divide(a,b): return a/b" >> operacion.py && git commit -qam v5
  git log --oneline'
```

```bash
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c '
  echo "#!/bin/sh
  grep -q BUG operacion.py && exit 1 || exit 0" > /repo/test-bug.sh && chmod +x /repo/test-bug.sh
  git bisect start HEAD HEAD~4
  git bisect run ./test-bug.sh'
```

</details>

### Tema 4: Hooks de Git y commits firmados · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás configurar un hook pre-commit que bloquea commits inválidos localmente, y explicar por qué los commits firmados dan una garantía de autoría más fuerte que el user.name configurado.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    L["hook local (opcional)"] --> LC{"¿pasa?"}
    LC -->|"sí"| LO["commit creado"]
    LC -->|"no"| LX["commit cancelado"]
    C["CI del equipo (obligatoria)"] --> CC{"¿pasa?"}
    CC -->|"sí"| CO["PR fusionable"]
    CC -->|"no"| CX["PR bloqueada"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    L["hook local (opcional)"] --> LC{"¿pasa?"}
    LC -->|"sí"| LO["commit creado"]
    LC -->|"no"| LX["commit cancelado"]
    C["CI del equipo (obligatoria)"] --> CC{"¿pasa?"}
    CC -->|"sí"| CO["PR fusionable"]
    CC -->|"no"| CX["PR bloqueada"]
```

```bash
mkdir -p academia-devops/src/modulo1/hooks
cd academia-devops/src/modulo1/hooks
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c '
  git init -q -b main && git config user.email demo@academia.dev && git config user.name demo
  mkdir -p .git/hooks
  printf "#!/bin/sh\nif git diff --cached | grep -q SECRETO; then echo \"bloqueado: SECRETO detectado\"; exit 1; fi\n" > .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  echo "config normal" > config.txt && git add . && git commit -qm ok && git log --oneline'
```

```bash
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c '
  echo "DB_PASSWORD=SECRETO123" >> config.txt
  git add . && git commit -qm "intento con secreto"; echo "codigo de salida: $?"'
```

</details>

### Tema 5: Monorepos vs polyrepos · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás argumentar cuándo un monorepo facilita cambios atómicos entre paquetes relacionados y cuándo un polyrepo da límites de ownership más claros.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph Monorepo
        M1["/paquete-a /paquete-b (un commit toca ambos)"]
    end
    subgraph Polyrepo
        P1["repo-a (propio CI)"]
        P2["repo-b (propio CI)"]
    end
```

#### ► REGLA PRÁCTICA
Si varios paquetes cambian juntos con frecuencia y necesitas que un mismo commit los actualice de forma atómica (como `paquete-a`/`paquete-b` compartiendo `tooling-compartido`), un monorepo evita el infierno de versiones cruzadas; si cada equipo necesita su propio pipeline de CI, su propio ritmo de release y fronteras de acceso claras, un polyrepo protege esos límites de ownership mejor que cualquier convención dentro de un único repo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    subgraph Monorepo
        M1["/paquete-a /paquete-b (un commit toca ambos)"]
    end
    subgraph Polyrepo
        P1["repo-a (propio CI)"]
        P2["repo-b (propio CI)"]
    end
```

```bash
mkdir -p academia-devops/src/modulo1/monorepo-demo
cd academia-devops/src/modulo1/monorepo-demo
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c '
  git init -q -b main && git config user.email demo@academia.dev && git config user.name demo
  mkdir -p paquete-a paquete-b tooling-compartido
  echo "function formatear(x) { return x.toFixed(2); }" > tooling-compartido/formato.js
  echo "const { formatear } = require(\"../tooling-compartido/formato\"); console.log(formatear(3));" > paquete-a/index.js
  echo "const { formatear } = require(\"../tooling-compartido/formato\"); console.log(formatear(7));" > paquete-b/index.js
  git add . && git commit -qm "monorepo inicial con tooling compartido" && git log --oneline --stat'
```

</details>

### Tema 6: git cherry-pick, git stash, git reset vs git revert · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir entre cherry-pick, stash, reset y revert según si necesitas un cambio puntual, trabajo temporal, reescribir tu propio historial o deshacer algo de forma segura en una rama compartida.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph Reset["git reset --hard &lt;anterior&gt;"]
        direction LR
        R1(("main")) --> R2(("●")) --> R3(("●")) --> R4(("●"))
    end
    subgraph Revert["git revert &lt;a-deshacer&gt;"]
        direction LR
        V1(("main")) --> V2(("●")) --> V3(("●")) --> V4(("●")) --> V5(("revierte"))
    end
```

#### ► REGLA PRÁCTICA
La pregunta que decide es "¿la rama ya es compartida?": en tu propia rama local usa `reset` para reescribir libremente; en una rama que otros ya descargaron (como `main`), usa `revert`, que agrega un commit nuevo que deshace el anterior sin borrar historia que alguien más tiene. `cherry-pick` trae UN commit puntual de otra rama sin fusionar todo lo demás; `stash` guarda cambios sin terminar para volver a ellos después, sin crear un commit.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    subgraph Reset["git reset --hard &lt;anterior&gt;"]
        direction LR
        R1(("main")) --> R2(("●")) --> R3(("●")) --> R4(("●"))
    end
    subgraph Revert["git revert &lt;a-deshacer&gt;"]
        direction LR
        V1(("main")) --> V2(("●")) --> V3(("●")) --> V4(("●")) --> V5(("revierte"))
    end
```

```bash
mkdir -p academia-devops/src/modulo1/reset-revert
cd academia-devops/src/modulo1/reset-revert
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c '
  git init -q -b main && git config user.email demo@academia.dev && git config user.name demo
  echo v1 > dato.txt && git add . && git commit -qm v1
  echo v2 >> dato.txt && git commit -qam v2
  echo v3-error >> dato.txt && git commit -qam "v3 con error"
  git revert --no-edit HEAD && cat dato.txt && git log --oneline'
```

</details>

### Tema 7: git reflog, git worktree y git submodule · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás recuperar commits "perdidos" con git reflog, trabajar en paralelo sobre varias ramas con git worktree, e incluir un repositorio externo versionado con git submodule.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    R["git reflog"]
    R --> E1["a1b2c3d HEAD@{0}: reset: moving to HEAD~3"]
    R --> E2["e4f5g6h HEAD@{1}: commit: Añade validación"]
    R --> E3["i7j8k9l HEAD@{2}: checkout: moving from main"]
    E2 --> F["git reset --hard e4f5g6h"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    R["git reflog"]
    R --> E1["a1b2c3d HEAD@{0}: reset: moving to HEAD~3"]
    R --> E2["e4f5g6h HEAD@{1}: commit: Añade validación"]
    R --> E3["i7j8k9l HEAD@{2}: checkout: moving from main"]
    E2 --> F["git reset --hard e4f5g6h"]
```

```bash
mkdir -p academia-devops/src/modulo1/reflog
cd academia-devops/src/modulo1/reflog
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd)":/repo -w /repo --entrypoint sh alpine/git -c '
  git init -q -b main && git config user.email demo@academia.dev && git config user.name demo
  echo v1 > dato.txt && git add . && git commit -qm v1
  echo v2 > dato.txt && git commit -qam "commit importante"
  git reset --hard HEAD~1
  echo "--- tras el reset, dato.txt: ---" && cat dato.txt
  echo "--- reflog: ---" && git reflog
  HASH=$(git reflog | grep "commit importante" | head -1 | cut -d" " -f1)
  git reset --hard "$HASH"
  echo "--- recuperado: ---" && cat dato.txt'
```

</details>

### Tema 8: Referencia rápida de Git: los tres árboles y los comandos por intención · Básico · 30 min

## Motivación

Las chuletas de Git que circulan en redes suelen listar 80 comandos sin decir para qué sirve cada uno, y a menudo con errores: «git bratus», «git cherry-pirk», `git rebase --shert`. Este tema ordena los comandos por **lo que quieres conseguir** y los explica con el modelo que hay debajo: los tres árboles.

## Concepto

Git maneja tus archivos en tres lugares, y casi todos los comandos mueven cambios entre ellos:

```mermaid
flowchart LR
  W["Directorio de trabajo<br/>(tus archivos)"] -- "git add" --> S["Área de preparación<br/>(staging / index)"]
  S -- "git commit" --> R["Repositorio<br/>(HEAD, historial)"]
  S -- "git restore --staged" --> W
  R -- "git restore / git switch" --> W
```

- **Directorio de trabajo:** los archivos que editas.
- **Área de preparación (*staging*):** lo que entrará en el próximo commit.
- **Repositorio:** los commits confirmados; `HEAD` apunta al actual.

## Comandos por intención

| Quiero… | Comando |
|---|---|
| Identificarme (una vez por máquina) | `git config --global user.name "Tu Nombre"` · `git config --global user.email "tu@correo.com"` |
| Empezar o copiar un repositorio | `git init` · `git clone <url> [carpeta]` |
| Ver qué cambió | `git status` · `git diff` (sin preparar) · `git diff --staged` (preparado) |
| Preparar y confirmar | `git add <archivo>` o `git add .` · `git commit -m "mensaje"` · `git commit -am "mensaje"` (solo archivos ya rastreados) |
| Sacar algo del staging | `git restore --staged <archivo>` |
| Descartar cambios locales de un archivo | `git restore <archivo>` (**se pierden**) |
| Renombrar o borrar rastreando el cambio | `git mv <viejo> <nuevo>` · `git rm <archivo>` |
| Trabajar en una rama | `git switch -c <rama>` (crear) · `git switch <rama>` · `git branch` (listar) · `git branch -d <rama>` |
| Integrar una rama | `git merge <rama>` · `git merge --no-ff <rama>` (siempre crea commit de fusión) · `git rebase <rama>` (Tema 2) |
| Sincronizar con el remoto | `git remote -v` · `git fetch` · `git pull` · `git push -u origin <rama>` (la primera vez) · `git push --force-with-lease` (tras un rebase) |
| Leer el historial | `git log --oneline --graph --all` · `git show <commit>` · `git blame <archivo>` · `git shortlog -sn` (commits por autor) |
| Guardar cambios a medias | `git stash` · `git stash list` · `git stash pop` (aplica y borra) · `git stash apply` (aplica y conserva) (Tema 6) |
| Deshacer un commit ya publicado | `git revert <commit>`: crea un commit inverso sin reescribir el historial |
| Deshacer commits locales | `git reset --soft <commit>` (conserva staging) · `--mixed` (conserva archivos) · `--hard` (**borra todo**) (Tema 6) |
| Corregir el último commit | `git commit --amend` · `git commit --amend --no-edit` |
| Traer un commit concreto | `git cherry-pick <commit>` |
| Encontrar qué commit rompió algo | `git bisect start` · `git bisect bad` · `git bisect good <commit>` · `git bisect reset` (Tema 3) |
| Recuperar algo «perdido» | `git reflog` (Tema 7) |
| Limpiar archivos no rastreados | `git clean -n` (simula) · `git clean -fd` (**borra**) |
| Marcar versiones | `git tag v1.2.0` · `git push origin v1.2.0` |
| Empaquetar el código de una rama | `git archive --format=zip -o codigo.zip main` |

## Reglas y casos límite

- **Antes de `reset --hard`, `clean -fd` o `restore`, mira `git status`.** Son los tres comandos que borran trabajo sin confirmación.
- **`--force-with-lease` y no `--force`.** Si alguien subió commits a la rama mientras tanto, `--force-with-lease` se niega a sobrescribirlos.
- **`revert` para lo publicado, `reset` para lo local.** Reescribir commits que otros ya descargaron les rompe sus copias.
- **Fusión *fast-forward* o de tres vías.** Si tu rama no se movió desde que creaste la otra, `merge` solo avanza el puntero (*fast-forward*). Si ambas avanzaron, crea un commit de fusión (*three-way*).

## Compruébalo

1. Modificas `a.txt`, haces `git add a.txt` y te arrepientes. ¿Qué comando lo saca del staging sin perder la edición?
2. ¿Qué diferencia hay entre `git stash pop` y `git stash apply` si hay un conflicto al aplicar?

