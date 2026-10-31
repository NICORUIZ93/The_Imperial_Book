# Módulo 1: Git avanzado y estrategias de branching


## Aprende construyendo

### Tema 1: Trunk-based development vs GitFlow

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir entre trunk-based development y GitFlow según el tamaño y madurez operativa de un equipo, explicando qué rol cumplen los feature flags en cada modelo.

**Conocimiento previo:** uso básico de Git (`commit`, `branch`, `merge`) y Docker (Módulo 0 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real: la estrategia de branching de un equipo determina directamente qué tan rápido puede integrarse y validarse un cambio, qué tan fácil es depurar una regresión, y qué tan arriesgado es cada despliegue. Elegir mal esta estrategia genera fricción constante que el equipo siente todos los días.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** rama principal (`main`/`trunk`), integración continua, feature flag, rama de larga duración, ceremonia de release.

Trunk-based development es una estrategia donde todo el equipo integra sus cambios a la rama principal (`main` o `trunk`) con mucha frecuencia, manteniendo esa rama siempre en un estado desplegable. El trabajo incompleto se oculta con feature flags en vez de aislarlo en una rama de larga duración. Esta estrategia exige, casi como condición previa, un pipeline de CI/CD maduro (el que construirás en los Módulos 4 y 5 de este track).

GitFlow, en cambio, es un modelo más estructurado con varias ramas de larga duración con propósitos específicos: `develop` como integración continua de funcionalidades, `release/*` para preparar una versión, `hotfix/*` para corregir errores urgentes sobre producción, y `main` reservada al código en producción. Añade más ceremonia pero da más control explícito sobre qué contiene exactamente cada versión publicada.

La elección no es de cuál es "mejor" en abstracto, sino de qué encaja con la madurez operativa y el tamaño del equipo. Un error común es adoptar GitFlow por costumbre sin evaluar si la ceremonia adicional aporta valor; del mismo modo, forzar trunk-based sin disciplina de pruebas automatizadas degrada rápidamente la estabilidad de `main`.

**Analogía:** trunk-based development es como un grupo de cocineros que añaden ingredientes a la misma olla común constantemente, confiando en que cada uno prueba su ingrediente antes de añadirlo (las pruebas automatizadas). GitFlow es como preparar cada plato en una estación separada (rama de funcionalidad), y solo llevarlo a la olla común en una ceremonia formal de montaje (el proceso de release).

**Diagrama:**

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

Trunk-based: integración constante, feature flags ocultan trabajo incompleto. GitFlow: `feature/x` se integra en `develop`; `release/1.2` prepara la versión hacia `main`.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo1/branching` y simula un flujo trunk-based dentro de un contenedor Git aislado:

```bash
mkdir -p academia-devops/src/modulo1/branching/trunk-demo
cd academia-devops/src/modulo1/branching/trunk-demo
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c \
  "git init -q && git config user.email demo@academia.dev && git config user.name demo && \
   echo v1 > app.txt && git add . && git commit -qm inicio && \
   git checkout -qb feature/x && echo 'v2 tras flag' >> app.txt && git commit -qam 'feature x' && \
   git checkout -q main && git merge --no-ff -q feature/x -m 'integra feature x' && \
   git log --oneline --graph --all"
```

**Explicación línea por línea:** `git` es el comando de control de versiones que rastrea el historial de cambios del proyecto; `--no-ff` es la bandera que fuerza un commit de merge explícito aunque el merge pudiera resolverse en avance rápido, dejando visible en el historial cuándo se integró cada feature — el patrón típico de trunk-based con integración frecuente. Al ver el historial, `--oneline` es la bandera que muestra cada commit en una sola línea compacta, `--graph` es la bandera que dibuja las ramas y merges como un árbol ASCII, y `--all` es la bandera que incluye todas las ramas, no solo la actual.

**Resultado esperado:** `git log --oneline --graph --all` muestra dos commits en `main` con un merge explícito de `feature/x`, simulando una integración frecuente y de corta duración.

**Fallo deliberado:** repite el flujo pero mantén `feature/x` sin fusionar (agrega 5 commits más solo ahí, sin tocar `main`, antes de fusionar). El merge tiene más probabilidad de conflicto — diagnostica que cuanto más tiempo vive una rama sin integrarse, mayor el riesgo, exactamente el problema que trunk-based evita.

#### Paso 5 · Práctica guiada

Repite el demo simulando GitFlow: crea `develop` y `release/1.0`, y confirma con `git log --graph --all` que la estructura de ramas es más profunda que en trunk-based. **Pista:** cada rama de GitFlow tiene un propósito específico; nómbrala según ese propósito, no genéricamente.

#### Paso 6 · Práctica independiente

Para un equipo hipotético de 3 personas con despliegues diarios y buena cobertura de pruebas, decide qué estrategia recomendarías y justifica en 3-4 líneas basándote en los criterios del Paso 3.

#### Paso 7 · Cierre

Ya distingues cuándo la integración frecuente supera a la estructura de GitFlow. El siguiente tema limpia el historial de una rama antes de integrarla. Fuente oficial: [trunkbaseddevelopment.com](https://trunkbaseddevelopment.com/).

**Errores comunes:** adoptar GitFlow por costumbre sin evaluar si la ceremonia aporta valor real; forzar trunk-based sin disciplina de pruebas automatizadas.

**Cuándo no usarlo:** GitFlow frente a trunk-based no conviene invertirlo en un equipo de una sola persona sin necesidad de releases versionadas paralelas; el límite de GitFlow es la ceremonia que añade sin beneficio si nadie más la necesita.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Define cómo integrar un cambio de healthcheck en la rama principal con revisión y pruebas. Mide cuánto permanece abierta la rama y documenta cómo mantener funcional el servicio durante la integración.

### Tema 2: Rebase interactivo vs merge

#### Paso 1 · Objetivo y preparación

Al finalizar podrás limpiar un historial de commits con `git rebase -i` y explicar por qué nunca debe reescribirse el historial de una rama ya compartida.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real: confundir `reset`/`rebase` con operaciones seguras sobre una rama compartida es uno de los errores más comunes y disruptivos que un desarrollador nuevo con Git puede cometer.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `git rebase -i`, `pick`/`squash`/`reword`/`drop`, historial lineal, riesgo de reescribir historial compartido.

`git merge` combina dos ramas creando un commit de fusión con dos padres, preservando el historial tal como ocurrió. `git rebase` reescribe el historial: reaplica los commits de tu rama uno por uno sobre la punta actual de otra rama, produciendo un historial lineal sin commits de fusión.

`git rebase -i HEAD~3` abre un editor con los últimos tres commits: `pick` los mantiene, `squash` los combina con el anterior, `reword` cambia el mensaje sin tocar el contenido, y `drop` lo elimina. Útil para limpiar commits de trabajo en progreso ("WIP", "fix") en uno solo antes de abrir un pull request.

La regla de seguridad más importante: nunca reescribas el historial de una rama que otras personas ya tienen clonada. Como el rebase cambia los hashes de commit, cualquiera con la versión antigua terminará con un historial divergente e inconsistente.

**Analogía:** el merge es como pegar dos capítulos de un libro tal como fueron escritos, con una nota de "aquí se unieron ambas historias". El rebase es como reescribir un capítulo como si siempre hubiera continuado directamente donde terminó el otro, sin esa nota. Rebasar una rama que otros ya leyeron es como reescribir un capítulo que un grupo de lectores ya está discutiendo activamente.

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo1/rebase` y genera tres commits desprolijos dentro de un contenedor Git aislado:

```bash
mkdir -p academia-devops/src/modulo1/rebase
cd academia-devops/src/modulo1/rebase
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c \
  "git init -q && git config user.email demo@academia.dev && git config user.name demo && \
   echo v1 > archivo.txt && git add . && git commit -qm WIP && \
   echo v2 >> archivo.txt && git commit -qam fix && \
   echo v3 >> archivo.txt && git commit -qam 'fix de verdad' && git log --oneline"
```

**Explicación línea por línea:** se crean tres commits deliberadamente desprolijos para practicar limpiarlos con rebase interactivo.

Combina los tres en uno usando `GIT_SEQUENCE_EDITOR` para automatizar el editor interactivo:

```bash
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c \
  "GIT_SEQUENCE_EDITOR='sed -i 2,3s/^pick/squash/' git rebase -i HEAD~3 && git log --oneline"
```

**Resultado esperado:** un único commit en el historial en vez de tres, con un mensaje que combina los tres originales.

**Fallo deliberado:** antes del rebase, clona el repositorio a otra carpeta (`git clone academia-devops/src/modulo1/rebase clon-companero`), simulando a un compañero. Haz el rebase solo en el original, luego intenta `git -C clon-companero pull`. Verás un rechazo o historiales divergentes — diagnostica que el rebase cambió los hashes y por eso el clon con el historial antiguo ya no coincide.

#### Paso 5 · Práctica guiada

Repite el rebase pero usa `reword` en vez de `squash` en el commit final para mejorar solo su mensaje, sin combinar commits. **Pista:** `GIT_SEQUENCE_EDITOR` también puede cambiar `pick` por `reword` en una línea específica con `sed`.

#### Paso 6 · Práctica independiente

Provoca intencionalmente un conflicto durante un rebase (modifica la misma línea en dos commits distintos) y resuélvelo con `git rebase --continue` tras editar el archivo en conflicto.

#### Paso 7 · Cierre

Ya limpias tu propio historial local sin arriesgar el de otros. El siguiente tema usa búsqueda binaria para encontrar regresiones en cualquier historial, limpio o no. Fuente oficial: [Git — git-rebase](https://git-scm.com/docs/git-rebase).

**Errores comunes:** rebasar una rama que ya fue fusionada o compartida; olvidar `git rebase --continue` después de resolver un conflicto durante el rebase.

**Cuándo no usarlo:** frente a una rama pública con varios colaboradores activos, rebase no conviene; usa merge o coordina explícitamente con el equipo antes de reescribir cualquier historial ya compartido.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Integra dos cambios del pipeline en una rama de laboratorio y compara merge con rebase. Verifica el resultado funcional y explica qué historial conservarías sin reescribir commits ya compartidos.

### Tema 3: Bisect para encontrar regresiones

#### Paso 1 · Objetivo y preparación

Al finalizar podrás usar `git bisect` para encontrar por búsqueda binaria el commit exacto que introdujo una regresión, incluyendo su automatización con `bisect run`.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de cualquier proyecto con suficiente historial: encontrar manualmente el commit que introdujo un bug sutil puede consumir horas; `git bisect` reduce esa búsqueda a minutos.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `git bisect`, búsqueda binaria, commit `good`/`bad`, regresión.

`git bisect` automatiza la búsqueda del commit exacto que introdujo un bug usando búsqueda binaria. Empieza con `git bisect start`, marca un commit `bad` (donde el bug está presente) y otro `good` (donde no existía). Git hace checkout al punto medio, lo pruebas y lo marcas; con cada marca el rango sospechoso se reduce a la mitad hasta converger en un único commit. Para mil commits, esto reduce la búsqueda a unas diez iteraciones (log₂ de mil).

El proceso puede automatizarse por completo con `git bisect run <script>`, que ejecuta un script en cada punto medio y marca `good`/`bad` según su código de salida, sin intervención manual.

**Analogía:** `git bisect` es como buscar una palabra en un diccionario físico: en vez de leer página por página, abres el diccionario por la mitad, ves si la palabra viene antes o después, y repites hasta encontrarla en unos pocos pasos.

**Diagrama:**

```mermaid
flowchart LR
    G["good: v1.0"] --> M["punto medio"] --> B["bad: HEAD (bug presente)"]
```

El rango sospechoso se reduce a la mitad y el proceso se repite hasta converger.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo1/bisect` con seis commits, uno de ellos con un bug intencional:

```bash
mkdir -p academia-devops/src/modulo1/bisect
cd academia-devops/src/modulo1/bisect
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c '
  git init -q && git config user.email demo@academia.dev && git config user.name demo
  echo "def suma(a,b): return a+b" > operacion.py && git add . && git commit -qm v1
  echo "def resta(a,b): return a-b" >> operacion.py && git commit -qam v2
  echo "def bug(a,b): return a-b  # BUG: debería sumar" >> operacion.py && git commit -qam v3-bug
  echo "def multiplica(a,b): return a*b" >> operacion.py && git commit -qam v4
  echo "def divide(a,b): return a/b" >> operacion.py && git commit -qam v5
  git log --oneline'
```

**Explicación línea por línea:** el commit `v3-bug` introduce deliberadamente una función mal implementada, tres commits antes de `HEAD`, simulando una regresión que nadie notó de inmediato.

Automatiza la búsqueda con un script que detecta el bug (`grep` sobre el comentario `BUG`) y `bisect run`:

```bash
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c '
  echo "#!/bin/sh
  grep -q BUG operacion.py && exit 1 || exit 0" > /repo/test-bug.sh && chmod +x /repo/test-bug.sh
  git bisect start HEAD HEAD~4
  git bisect run ./test-bug.sh'
```

**Resultado esperado:** `git bisect run` reporta `v3-bug` (o su hash) como el primer commit "malo", exactamente donde se introdujo el comentario `BUG`.

**Fallo deliberado:** cambia el script de detección para que use `grep -q BUGG` (con un error tipográfico) y repite `bisect run`. El resultado converge en un commit incorrecto o falla por completo — diagnostica que la calidad de `bisect` depende enteramente de que el criterio `good`/`bad` sea correcto.

#### Paso 5 · Práctica guiada

Repite `git bisect start HEAD HEAD~4` pero esta vez marca manualmente cada punto medio con `git bisect good`/`git bisect bad` en vez de `bisect run`. **Pista:** en cada paso, revisa `cat operacion.py` para decidir si el bug está presente.

#### Paso 6 · Práctica independiente

Introduce una segunda regresión en un commit distinto del mismo historial y ejecuta `bisect run` de nuevo; confirma que encuentra la primera regresión introducida cronológicamente, no la segunda.

#### Paso 7 · Cierre

Ya conviertes una búsqueda manual de horas en un proceso de minutos con búsqueda binaria. El siguiente tema automatiza validaciones locales antes de cada commit con hooks. Fuente oficial: [Git — git-bisect](https://git-scm.com/docs/git-bisect).

**Errores comunes:** marcar `good`/`bad` incorrectamente en algún punto intermedio, lo que hace converger la búsqueda en un commit equivocado; olvidar `git bisect reset` al terminar, dejando el repositorio en estado "detached HEAD".

**Cuándo no usarlo:** frente a un bug que no es reproducible de forma determinista (depende de condiciones de carrera o datos externos variables), `bisect` no converge de forma confiable; necesitas primero un criterio `good`/`bad` reproducible.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Introduce una regresión reproducible en el healthcheck y localízala con bisect. Guarda el comando que clasifica cada revisión; debe devolver éxito o fallo sin depender de inspección manual.

### Tema 4: Hooks de Git y commits firmados

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar un hook `pre-commit` que bloquea commits inválidos localmente, y explicar por qué los commits firmados dan una garantía de autoría más fuerte que el `user.name` configurado.

**Conocimiento previo:** Temas 1 a 3 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de cualquier equipo: los hooks aceleran el ciclo de retroalimentación deteniendo un commit con un problema antes incluso de subirlo, ahorrando el ciclo de subir y esperar a que CI lo rechace.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** hook (`pre-commit`, `pre-push`), automatización local, commit firmado (GPG/SSH), verificación de autoría.

Un hook de Git es un script que se ejecuta automáticamente en un punto específico del flujo de trabajo, viviendo en `.git/hooks/`. Un hook `pre-commit` se ejecuta justo antes de completar un commit; si termina con código de salida distinto de cero, Git cancela el commit.

Un commit firmado añade una firma criptográfica (GPG o claves SSH) que verifica que ese commit fue efectivamente creado por quien dice haberlo creado. Esto es más fuerte que confiar en `git config user.name`, que cualquiera puede escribir libremente.

Los hooks son locales a cada copia del repositorio: no se distribuyen automáticamente con `git clone`, a menos que el equipo use una herramienta como Husky para sincronizarlos. Por eso los hooks son una primera línea de defensa rápida, pero la validación obligatoria para todo el equipo debe vivir en CI (Módulo 4 de este track), que no puede omitirse localmente.

**Analogía:** un hook de Git es como una alarma de humo en tu propia cocina: te avisa rápido, pero solo protege tu cocina, no la de tus vecinos, a menos que cada uno instale la suya. Un commit firmado es como notariar un documento: cualquiera firma con su nombre a mano, pero una firma notariada da una garantía mucho más fuerte de autoría.

**Diagrama:**

```mermaid
flowchart TD
    L["hook local (opcional)"] --> LC{"¿pasa?"}
    LC -->|"sí"| LO["commit creado"]
    LC -->|"no"| LX["commit cancelado"]
    C["CI del equipo (obligatoria)"] --> CC{"¿pasa?"}
    CC -->|"sí"| CO["PR fusionable"]
    CC -->|"no"| CX["PR bloqueada"]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo1/hooks` con un hook `pre-commit` que bloquea archivos con la palabra `SECRETO`:

```bash
mkdir -p academia-devops/src/modulo1/hooks
cd academia-devops/src/modulo1/hooks
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c '
  git init -q && git config user.email demo@academia.dev && git config user.name demo
  mkdir -p .git/hooks
  printf "#!/bin/sh\nif git diff --cached | grep -q SECRETO; then echo \"bloqueado: SECRETO detectado\"; exit 1; fi\n" > .git/hooks/pre-commit
  chmod +x .git/hooks/pre-commit
  echo "config normal" > config.txt && git add . && git commit -qm ok && git log --oneline'
```

**Explicación línea por línea:** el hook revisa el contenido en staging (`git diff --cached`, donde `--cached` es la bandera que compara contra lo ya agregado al staging en vez del árbol de trabajo) buscando la palabra `SECRETO`; si la encuentra, imprime un mensaje y sale con código 1, cancelando el commit.

Ejecuta la prueba que debe fallar:

```bash
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c '
  echo "DB_PASSWORD=SECRETO123" >> config.txt
  git add . && git commit -qm "intento con secreto"; echo "codigo de salida: $?"'
```

**Resultado esperado:** el commit anterior (`ok`) se crea sin problema; el segundo intento imprime `bloqueado: SECRETO detectado` y `codigo de salida: 1`, sin crear el commit.

**Fallo deliberado:** repite el segundo commit pero con `git commit --no-verify`. El commit se crea a pesar del hook — diagnostica que `--no-verify` omite explícitamente los hooks locales, confirmando por qué nunca deben ser la única línea de defensa frente a datos sensibles.

#### Paso 5 · Práctica guiada

Extiende el hook para que también bloquee la palabra `API_KEY`. **Pista:** usa `grep -qE "SECRETO|API_KEY"` para verificar ambos patrones en una sola condición.

#### Paso 6 · Práctica independiente

Investiga y anota los comandos para generar una clave GPG o SSH de firma y configurar `git config commit.gpgsign true`, sin necesariamente ejecutarlos si no tienes GPG disponible; explica qué cambiaría en `git log --show-signature` una vez configurado.

#### Paso 7 · Cierre

Ya bloqueas localmente commits con contenido prohibido y entiendes que los hooks no sustituyen a CI. El siguiente tema decide si tu proyecto vive en un monorepo o un polyrepo. Fuente oficial: [Git — githooks](https://git-scm.com/docs/githooks).

**Errores comunes:** confiar solo en el hook local sin un chequeo equivalente en CI; olvidar dar permisos de ejecución (`chmod +x`) al archivo del hook.

**Cuándo no usarlo:** frente a una regla que el equipo completo debe cumplir sin excepción, un hook local no basta (cualquiera puede omitirlo con `--no-verify` o simplemente no tenerlo instalado); esa regla debe vivir en CI.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Añade una comprobación local previa al commit y su equivalente obligatorio en CI. Demuestra que saltarse el hook local no permite integrar un pipeline inválido; verifica aparte la identidad de una firma.

### Tema 5: Monorepos vs polyrepos

#### Paso 1 · Objetivo y preparación

Al finalizar podrás argumentar cuándo un monorepo facilita cambios atómicos entre paquetes relacionados y cuándo un polyrepo da límites de ownership más claros.

**Conocimiento previo:** Tema 1 de este módulo (branching).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de arquitectura organizacional: la decisión entre monorepo y polyrepo afecta cómo se coordinan cambios entre equipos, qué tan rápido es el pipeline de CI, y qué tan claros son los límites de responsabilidad, y rara vez se revierte fácilmente una vez que un proyecto crece.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** monorepo, polyrepo, cambios atómicos, ownership, tooling compartido.

Un monorepo aloja múltiples proyectos relacionados en un único repositorio; un polyrepo distribuye cada proyecto en su propio repositorio. La ventaja del monorepo es hacer cambios atómicos que abarcan múltiples paquetes en un único commit y pull request. También facilita compartir tooling (linters, CI) de forma centralizada. La desventaja es que operaciones como clonar o correr CI sobre "todo" pueden volverse lentas sin herramientas específicas de monorepo.

Un polyrepo da límites de ownership más claros: cada equipo controla su propio repositorio y ciclo de despliegue independiente. La desventaja es la fricción de coordinar cambios que sí necesitan tocar múltiples repositorios a la vez.

**Analogía:** un monorepo es como un edificio de oficinas compartido donde varios departamentos coordinan infraestructura común fácilmente, pero cualquier obra grande afecta a todos los inquilinos. Un polyrepo es como cada departamento en su propio edificio: control total, pero coordinar una reunión conjunta requiere transporte entre edificios.

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía, simula un monorepo mínimo con dos paquetes que comparten una función:

```bash
mkdir -p academia-devops/src/modulo1/monorepo-demo
cd academia-devops/src/modulo1/monorepo-demo
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c '
  git init -q && git config user.email demo@academia.dev && git config user.name demo
  mkdir -p paquete-a paquete-b tooling-compartido
  echo "function formatear(x) { return x.toFixed(2); }" > tooling-compartido/formato.js
  echo "const { formatear } = require(\"../tooling-compartido/formato\"); console.log(formatear(3));" > paquete-a/index.js
  echo "const { formatear } = require(\"../tooling-compartido/formato\"); console.log(formatear(7));" > paquete-b/index.js
  git add . && git commit -qm "monorepo inicial con tooling compartido" && git log --oneline --stat'
```

**Explicación línea por línea:** ambos paquetes importan la misma función de `tooling-compartido/`; un solo commit registra los tres archivos relacionados, la ventaja atómica descrita en la teoría.

`--stat` es la bandera que agrega, debajo de cada commit, la lista de archivos tocados y cuántas líneas cambió cada uno.

**Resultado esperado:** `git log --oneline --stat` muestra un único commit tocando los tres archivos (`paquete-a/index.js`, `paquete-b/index.js`, `tooling-compartido/formato.js`) a la vez.

**Fallo deliberado:** modifica la firma de `formatear` en `tooling-compartido/formato.js` (agrega un parámetro obligatorio) sin actualizar `paquete-a` ni `paquete-b`, y ejecuta ambos con `node paquete-a/index.js`. Fallan por argumento faltante — diagnostica que el monorepo permitió el cambio atómico, pero no te exime de actualizar todos los consumidores en el mismo commit.

#### Paso 5 · Práctica guiada

Corrige `paquete-a` y `paquete-b` para que pasen el nuevo parámetro obligatorio, en el mismo commit que el cambio de `formatear`. **Pista:** revisa `git status` antes de confirmar para asegurarte de que los tres archivos quedan en el mismo commit.

#### Paso 6 · Práctica independiente

Simula ahora el equivalente en polyrepo: crea dos carpetas Git independientes (`repo-a`, `repo-b`) y explica en un README qué pasos manuales necesitarías para propagar el mismo cambio de `formatear` entre ambos repositorios separados.

#### Paso 7 · Cierre

Ya distingues cuándo el cambio atómico de un monorepo compensa la ceremonia de coordinar múltiples repositorios. El siguiente tema cubre comandos puntuales para deshacer cambios sin perder historial. Fuente oficial: [Google — Why Google Stores Billions of Lines in a Single Repository](https://cacm.acm.org/research/why-google-stores-billions-of-lines-of-code-in-a-single-repository/).

**Errores comunes:** tratar un monorepo como una excusa para no versionar cuidadosamente cada paquete por separado; subestimar la fricción real de coordinar cambios cruzados en polyrepo.

**Cuándo no usarlo:** un monorepo sin herramientas de build incremental (que solo reconstruyan lo que cambió) no conviene a partir de cierto tamaño; ese es el límite frente a invertir en tooling especializado o simplemente usar polyrepo.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Compara el cambio conjunto de API y pipeline en un repositorio único y en repositorios separados. Documenta qué artefacto vincula ambas versiones y cómo evitar desplegar una combinación incompatible.

### Tema 6: git cherry-pick, git stash, git reset vs git revert

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir entre `cherry-pick`, `stash`, `reset` y `revert` según si necesitas un cambio puntual, trabajo temporal, reescribir tu propio historial o deshacer algo de forma segura en una rama compartida.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real: confundir `reset --hard` con `revert` sobre una rama compartida es uno de los errores más comunes y potencialmente disruptivos que un desarrollador nuevo con Git puede cometer.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `cherry-pick`, `stash`, `reset` (soft/mixed/hard), `revert`, historial destructivo vs no destructivo.

`git cherry-pick <commit>` aplica un commit específico de otra rama sobre la actual, sin traer el resto de esa rama. `git stash` guarda temporalmente cambios no confirmados, dejando el directorio limpio, recuperables después con `git stash pop`.

`git reset` mueve la punta de una rama a un commit distinto: `--soft` deja los cambios en staging; `--mixed` (por defecto) los deja como cambios no confirmados; `--hard` los descarta por completo, el modo más destructivo. `git revert <commit>` no reescribe el historial: crea un commit nuevo que deshace exactamente los cambios de uno anterior, preservando ambos commits visibles — la diferencia crucial frente a `reset`, que sí es seguro usar sobre ramas ya compartidas.

**Analogía:** `cherry-pick` es fotocopiar una página de un libro ajeno sin llevarte el libro completo. `stash` es guardar en un cajón un trabajo a medio terminar. `reset --hard` es arrancar páginas de tu propio cuaderno. `revert` es escribir una nueva entrada de diario que dice "corrijo lo del martes", sin arrancar esa página.

**Diagrama:**

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

`reset --hard`: la rama retrocede, el historial desaparece. `revert`: el commit original sigue visible en el historial.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo1/reset-revert` con un historial de prueba:

```bash
mkdir -p academia-devops/src/modulo1/reset-revert
cd academia-devops/src/modulo1/reset-revert
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c '
  git init -q && git config user.email demo@academia.dev && git config user.name demo
  echo v1 > dato.txt && git add . && git commit -qm v1
  echo v2 >> dato.txt && git commit -qam v2
  echo v3-error >> dato.txt && git commit -qam "v3 con error"
  git revert --no-edit HEAD && cat dato.txt && git log --oneline'
```

**Explicación línea por línea:** `git revert --no-edit HEAD` deshace el último commit creando uno nuevo, sin pedir confirmación interactiva del mensaje (`--no-edit` es la bandera que evita ese prompt y usa el mensaje generado automáticamente); `cat dato.txt` confirma que el contenido volvió al estado de `v2`.

**Resultado esperado:** `dato.txt` contiene `v1` y `v2` (sin `v3-error`), y `git log --oneline` muestra **cuatro** commits: los tres originales más el commit de revert, con el commit erróneo todavía visible en el historial.

**Fallo deliberado:** en vez de `revert`, ejecuta `git reset --hard HEAD~1` sobre el mismo estado (antes del revert). El historial retrocede a solo tres commits y el commit `v3 con error` desaparece del historial visible — diagnostica que, si alguien más ya había clonado ese commit, esta operación causaría exactamente la divergencia peligrosa descrita en la teoría.

#### Paso 5 · Práctica guiada

Practica `git stash`: modifica `dato.txt` sin confirmar, guarda con `git stash`, confirma que `git status` está limpio, y recupera el cambio con `git stash pop`. **Pista:** `git stash list` muestra todos los stashes guardados si necesitas recuperar uno específico.

#### Paso 6 · Práctica independiente

Crea una segunda rama con un commit útil, y usa `git cherry-pick <hash>` para traer solo ese commit a `main` sin fusionar el resto de la rama.

#### Paso 7 · Cierre

Ya eliges la herramienta correcta según si el historial es local o ya compartido. El siguiente tema cubre `reflog`, `worktree` y `submodule` para casos menos frecuentes pero igualmente importantes. Fuente oficial: [Git — git-revert](https://git-scm.com/docs/git-revert).

**Errores comunes:** usar `reset --hard` sobre una rama que otros ya clonaron; olvidar que `stash pop` puede generar conflictos si el árbol de trabajo cambió mientras tanto.

**Cuándo no usarlo:** `revert` no conviene si de verdad quieres eliminar un commit sensible (una credencial expuesta) del historial por completo; ahí revert no basta porque el commit original sigue visible, y se necesita reescribir historial con herramientas como `git filter-repo`.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Reproduce un hotfix en una rama aislada y transpórtalo mediante cherry-pick. Practica su reversión con un nuevo commit, conservando evidencia de que el historial compartido sigue accesible.

### Tema 7: git reflog, git worktree y git submodule

#### Paso 1 · Objetivo y preparación

Al finalizar podrás recuperar commits "perdidos" con `git reflog`, trabajar en paralelo sobre varias ramas con `git worktree`, e incluir un repositorio externo versionado con `git submodule`.

**Conocimiento previo:** Temas 1 a 6 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de cualquier error aparentemente irreversible: `git reflog` en particular vale la pena conocerlo antes de necesitarlo en pánico, porque el momento en que más se necesita es exactamente el peor momento para aprender que existe por primera vez.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `reflog`, red de seguridad de Git, `worktree` (múltiples directorios de trabajo), `submodule` (repositorio anidado).

`git reflog` registra un historial local de a dónde ha apuntado `HEAD` a lo largo del tiempo, incluyendo rebases o resets. Si ejecutas un `reset --hard` por error, `reflog` casi siempre permite encontrar la referencia exacta y recuperarla.

`git worktree` permite tener múltiples directorios de trabajo asociados al mismo repositorio, cada uno con una rama distinta activa simultáneamente, sin clonar varias veces. `git submodule` permite incluir un repositorio Git completo dentro de otro, como referencia a un commit específico; tienen fama merecida de ser incómodos de operar (es fácil olvidar actualizar la referencia), por lo que muchos equipos prefieren, cuando es posible, un monorepo (Tema 5).

**Analogía:** `git reflog` es como la papelera de reciclaje del sistema operativo, pero para el historial del repositorio. `git worktree` es como tener varios escritorios físicos, cada uno con un proyecto distinto abierto. `git submodule` es como incluir literalmente un capítulo de otro libro, con una referencia exacta a qué edición estás incluyendo.

**Diagrama:**

```mermaid
flowchart TD
    R["git reflog"]
    R --> E1["a1b2c3d HEAD@{0}: reset: moving to HEAD~3"]
    R --> E2["e4f5g6h HEAD@{1}: commit: Añade validación"]
    R --> E3["i7j8k9l HEAD@{2}: checkout: moving from main"]
    E2 --> F["git reset --hard e4f5g6h"]
```

`e4f5g6h` "desapareció" de la rama, pero es recuperable con `git reset --hard e4f5g6h`.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo1/reflog` y provoca una "pérdida" recuperable:

```bash
mkdir -p academia-devops/src/modulo1/reflog
cd academia-devops/src/modulo1/reflog
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c '
  git init -q && git config user.email demo@academia.dev && git config user.name demo
  echo v1 > dato.txt && git add . && git commit -qm v1
  echo v2 > dato.txt && git commit -qam "commit importante"
  git reset --hard HEAD~1
  echo "--- tras el reset, dato.txt: ---" && cat dato.txt
  echo "--- reflog: ---" && git reflog
  HASH=$(git reflog | grep "commit importante" | head -1 | cut -d" " -f1)
  git reset --hard "$HASH"
  echo "--- recuperado: ---" && cat dato.txt'
```

**Explicación línea por línea:** tras el `reset --hard` el commit "importante" ya no es alcanzable desde ninguna rama, pero `git reflog` conserva su hash; `git reset --hard "$HASH"` lo recupera exactamente.

**Resultado esperado:** tras el primer reset, `dato.txt` muestra `v1`; después de recuperar con el hash del reflog, vuelve a mostrar `v2`, confirmando que el commit "perdido" nunca se eliminó realmente.

**Fallo deliberado:** ejecuta `git gc --prune=now --aggressive` inmediatamente después del `reset --hard` y antes de recuperar. En un repositorio real (fuera de esta demo corta), esto puede eliminar definitivamente commits no alcanzables — diagnostica que `reflog` es una red de seguridad temporal, no permanente, y que operaciones de garbage collection agresivas reducen la ventana de recuperación.

#### Paso 5 · Práctica guiada

Crea un `git worktree` adicional apuntando a una rama distinta del mismo repositorio (`git worktree add ../reflog-otra-rama nombre-rama`) y confirma que ambos directorios coexisten con contenido distinto. **Pista:** `git worktree list` muestra todos los directorios de trabajo activos.

#### Paso 6 · Práctica independiente

Agrega un submódulo de prueba (`git submodule add <url> libs/externa`) a un repositorio de práctica y explica, en un comentario en el README, qué comando adicional necesita ejecutar alguien que clona el repositorio por primera vez para que el submódulo no quede vacío.

#### Paso 7 · Cierre

Ya conoces la red de seguridad de `reflog` antes de necesitarla en un incidente real, y cuándo usar `worktree` o `submodule`. Esto cierra el módulo de Git avanzado; el siguiente módulo empaqueta aplicaciones en contenedores Docker reproducibles. Fuente oficial: [Git — git-reflog](https://git-scm.com/docs/git-reflog).

**Errores comunes:** confiar en `reflog` como recuperación permanente sin entender que expira; olvidar `git submodule update --init --recursive` al clonar un repositorio con submódulos, dejándolos vacíos.

**Cuándo no usarlo:** `submodule` no conviene si el repositorio externo cambia con la misma frecuencia que el principal; ahí un monorepo (Tema 5) o un gestor de paquetes propio evita la fricción operativa de mantener sincronizada la referencia.

---

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Usa un worktree para probar el hotfix sin alterar el despliegue en preparación. Recupera un commit de laboratorio mediante reflog y documenta qué dependencia externa queda fijada si usas submódulos.

## Laboratorio práctico

**Objetivo del laboratorio:** limpiar un historial de commits con rebase interactivo, provocar y resolver un conflicto de fusión manualmente, y usar `git bisect` para encontrar el commit exacto que introdujo un bug.

**Requisitos previos:** Git y Docker instalados (Módulo 0 de este track).

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crear tres commits desordenados | Haz tres cambios pequeños y confírmalos con mensajes como "WIP", "fix", "fix de verdad" | Simula el historial típico de trabajo en progreso | Tres commits nuevos en el historial |
| 2 | Limpiar el historial con rebase interactivo | `git rebase -i HEAD~3`, cambia los dos últimos de `pick` a `squash` | Combina los tres commits en uno con mensaje único | Un único commit coherente en vez de tres |
| 3 | Crear dos ramas que modifiquen la misma línea | Crea `rama-a` y `rama-b` desde el mismo punto, modifica la misma línea distinto en cada una | Prepara un conflicto de fusión intencional | Ambas ramas modifican la misma línea |
| 4 | Fusionar y provocar el conflicto | `git merge rama-a` (sin conflicto), luego `git merge rama-b` | El segundo merge falla por conflicto | Git reporta `CONFLICT (content)` |
| 5 | Resolver el conflicto manualmente | Edita entre `<<<<<<<`/`=======`/`>>>>>>>`, luego `git add` y `git commit` | Completa la fusión con la resolución elegida | El commit de merge se crea sin marcas restantes |
| 6 | Introducir un bug intencional | Sobre 5-6 commits, invierte una condición en uno intermedio | Prepara el escenario para `bisect` | El bug está presente desde ese commit en adelante |
| 7 | Usar bisect para encontrar el commit | `git bisect start`, `git bisect bad`, `git bisect good <inicial>`, marca cada punto medio | Converge por búsqueda binaria en el commit exacto | Git reporta el hash responsable |
| 8 | Terminar la sesión de bisect | `git bisect reset` | Vuelve al estado anterior a iniciar bisect | El repositorio vuelve a la rama original |

**Verificación:** el laboratorio se considera exitoso si el paso 2 deja un único commit limpio, si el conflicto del paso 4 se resuelve sin marcas restantes, y si `git bisect` identifica exactamente el commit del bug intencional.

**Errores comunes y soluciones**

- **El editor de `rebase -i` no se abre o se cierra sin aplicar cambios.** Verifica `git config --get core.editor`; en Vim recuerda `:wq` para guardar y salir.
- **Quedan marcas `<<<<<<<`/`=======`/`>>>>>>>` tras resolver un conflicto.** Revisa el archivo completo antes de `git add`.
- **`git bisect` converge en un commit que no tiene sentido.** Verifica que el criterio `good`/`bad` en cada paso fue correcto.
- **Reescribiste con rebase una rama que un compañero ya había clonado.** Coordina con el equipo para que vuelva a clonar la rama reescrita desde cero.

---
