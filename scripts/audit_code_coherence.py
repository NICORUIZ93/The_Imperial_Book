#!/usr/bin/env python3
"""Audita si el código de cada tema se sostiene solo o da contexto por hecho.

Qué mide (seis comprobaciones mecánicas, todas verificables a mano en el archivo):

  C1 ruta_inventada            una ruta que el tema **usa** en un comando o en un bloque de código,
                               pero que ningún tema del curso crea y que no existe en el repo.
  C2 raiz_incoherente          los comandos crean/abren una carpeta y el código del tema vive en otra.
  C3 declarado_no_creado       la estructura de archivos que el tema muestra no aparece en ningún
                               «Guarda en …» / `cat > …` del propio tema.
  C4 bloque_sin_archivo        un bloque de código de 4+ líneas que no declara a qué archivo pertenece.
  C5 puntero_roto              el tema manda a ejecutar un laboratorio (`verify.sh`, `examples/…`) cuya
                               ruta no existe en el repo.
  C6 ruta_versionada           la ruta sí está versionada en `examples/`, pero ningún tema manda crearla:
                               el estudiante solo la tiene si clonó el repo, no si siguió la lección.

No se cuenta como defecto, solo como contexto, la **reutilización explicada**: una frase que dice
«la raíz del proyecto del Módulo 0» o «el archivo que ya existe» cumple la regla del prompt, que prohíbe
reutilizar *sin explicar*, no reutilizar.

Cómo reconoce, para que el contador no sea un wishing:

  - **Asimetría uso/declaración.** Una ruta solo es *usada* si aparece en un bloque de código o en un
    comando; ahí es donde el estudiante se queda parado. La prosa que la nombra la declara, y una
    declaración (verbo de creación, `cat > x`, `tee x`, destino de `aws s3 cp`, ancla `` `x.ts:` ``,
    comentario `# archivo: x.sh`) salda el punto.
  - Un renglón de comentario dentro de un bloque **no se ejecuta**: nombra el archivo, no lo usa. Eso
    quitó de un golpe los falsos positivos de los laboratorios de cloud.
  - Las URLs y los hosts con puerto (`http://…`, `localhost:3224/…`) no son rutas del proyecto.
  - No son rutas del proyecto: llamadas (`r.json()`, `ct.tf(…)`), paquetes (`org.gradle`), dominios,
    rutas absolutas del contenedor, nombres elípticos (`V3__…sql`) y archivos que crea una herramienta
    (`package-lock.json` lo crea npm).
  - C4 hereda el archivo del bloque anterior pegado del mismo lenguaje (es «el resto de ese archivo») y
    de las soluciones desplegables, que pertenecen al ejercicio de arriba.

Qué NO mide: si el código compila, si la salida escrita es la real o si la explicación es buena. Eso lo
siguen midiendo validate_lesson_labs.py, audit_topic_citations.py y la revisión humana. Un tema con los
seis contadores en cero cumple la **coherencia material** del prompt maestro («Nada se da por hecho»,
«sin reutilizar código de módulos anteriores sin explicar»), no su calidad pedagógica.

De las seis, C4 es la más blanda: un bloque sin nombre de archivo puede ser un fragmento ilustrativo.
C1, C2, C5 y C6 son las que describe literalmente el prompt maestro y las que hay que bajar.

Los dos formatos de tema se miden con las mismas seis comprobaciones; reutiliza el parser de
audit_master_prompt_items.py, que ya reconoce `### Tema N:` y la ficha de 15 puntos.

Salidas:
  docs/auditoria/coherencia-codigo.md     resumen por curso
  docs/auditoria/coherencia-codigo.json   lo mismo, máquina-leíble
  docs/auditoria/coherencia-codigo.csv    una fila por tema con las rutas concretas (lista de trabajo)

Uso:
  python3 scripts/audit_code_coherence.py           # genera las tres salidas
  python3 scripts/audit_code_coherence.py --check   # falla si están desactualizadas
  python3 scripts/audit_code_coherence.py --resumen # solo totales
  python3 scripts/audit_code_coherence.py --temas   # los 15 temas con más incidencias
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from audit_master_prompt_items import (CONTENT, OUT_DIR, ROOT, sin_diacriticos,  # noqa: E402
                                       tema_blocks)

OUT_MD = OUT_DIR / "coherencia-codigo.md"
OUT_JSON = OUT_DIR / "coherencia-codigo.json"
OUT_CSV = OUT_DIR / "coherencia-codigo.csv"

# Extensiones que indican que un token es un archivo de proyecto, no un número de versión ni un host.
EXTS = ("js mjs cjs ts tsx jsx java kt kts groovy gradle py go rs rb php cs scala swift sh bash zsh ps1 "
        "yaml yml json json5 toml xml properties conf cfg ini env md txt html htm css scss sql tf tfvars "
        "proto graphql vue svelte ipynb lock sum mod avro tpl j2 hpp".split())
# Ordenadas de más larga a más corta y con la negativa detrás: sin eso, `lifecycle.json` se leía como
# `lifecycle.js` (la alternativa `js` venía antes que `json` y nada exigía que la extensión terminara)
# y el archivo creado quedaba invisibilizado. El `(?![\w-])` cierra la misma trampa en cualquier patrón.
EXT = r"(?:" + "|".join(re.escape(e) for e in sorted(EXTS, key=len, reverse=True)) + r")(?![\w-])"
# `Node.js`, `Vue.js`… son marcas, no rutas de proyecto.
MARCAS = {"node.js", "vue.js", "react.js", "next.js", "deno.js", "bun.js", "express.js", "three.js",
          "d3.js", "jquery.js", "lodash.js", "backbone.js", "npm.js", "dart.js", "ember.js", "nuxt.js"}
# Rutas que una herramienta genera sola: pedirlas «creadas» sería exigir que el tema escriba `target/`.
GENERADAS = ("build/", "target/", "node_modules/", ".gradle/", "dist/", "bin/", "out/", "coverage/",
             ".venv/", "venv/", "__pycache__/", ".next/", ".svelte-kit/", "vendor/", ".mvn/",
             ".idea/", ".vscode/", "logs/", ".cache/", "tmp/", "temp/")
# Rutas del sistema o del contenedor que el tema no crea ni debe crear.
SISTEMA = ("/usr/", "/etc/", "/var/", "/opt/", "/proc/", "/sys/", "/dev/", "/lib/", "/bin/", "/sbin/",
           "/root/", "/app", "/workspace", "/data", "$HOME", "~/", "/tmp/", "/private/")
# Dominios de documentación y de ejemplo: son fuentes, nunca archivos del proyecto del estudiante.
DOMINIOS = ("com", "org", "net", "io", "edu", "gob", "gov", "co", "es", "mx", "ar", "cl", "dev",
            "site", "cloud", "run", "me", "app", "xyz", "uk", "de", "fr", "it", "pt", "br")
# Archivos que crea una herramienta, no el estudiante: pedirle que los `mkdir` sería exigirle que
# escriba a mano lo que `npm install` o `flutter create` ya generaron en ese mismo tema.
GENERADA_POR = (
    (re.compile(r"npm\s+(?:init|install|i)\b|pnpm\s+(?:init|install|add)\b|yarn\s+(?:init|add)\b", re.I),
     {"package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "node_modules"}),
    (re.compile(r"flutter\s+create\b|dart\s+create\b", re.I), {"pubspec.yaml"}),
    (re.compile(r"\bng\s+(?:new|generate)\b", re.I), {"angular.json"}),
    (re.compile(r"gradle\s+init\b|\./gradlew\s+wrapper\b|\bmvn\b|\bmvnw\b", re.I),
     {"settings.gradle", "settings.gradle.kts", "build.gradle", "build.gradle.kts", "pom.xml",
      "gradlew", "gradle.properties"}),
    (re.compile(r"create-vite|npm\s+(?:create|init)\s+vite|npm\s+create\s+react", re.I),
     {"vite.config.ts", "vite.config.js", "tsconfig.json", "index.html"}),
    (re.compile(r"cargo\s+(?:new|init)\b", re.I), {"Cargo.toml"}),
    (re.compile(r"pip3?\s+install|poetry\s+new|uv\s+(?:init|add)|conda\s+create", re.I),
     {"requirements.txt", "pyproject.toml"}),
    (re.compile(r"git\s+init\b", re.I), {".gitignore"}),
    (re.compile(r"helm\s+create\b|kubernet|kustomize build", re.I), {"Chart.yaml", "values.yaml"}),
)

# Cadenas de identificadores de código que parecen rutas pero no son archivos del proyecto:
# `res.json`, `process.env`, `express.json`, `org.gradle`. Se filtra por la primera palabra, porque
# por forma serían indistinguibles de `app.js` o `guia.ts`, que sí son archivos.
IDENTIFICADORES = {"res", "req", "response", "request", "process", "express", "window", "document",
                   "console", "module", "exports", "global", "this", "props", "state", "org", "com",
                   "io", "javax", "jakarta", "net", "edu", "gov", "class", "function", "proto", "ctx"}
# Pieza intermedia que sí convierte una cadena de tres partes en un archivo real: `main.min.js`.
SUFIJOS = {"min", "test", "spec", "e2e", "config", "prod", "dev", "bundle", "chunk", "umd", "esm",
           "legacy", "server", "client", "d", "es", "cjs", "mjs", "data", "local", "sample", "example"}
# Extensiones que también son palabras normales de un paquete: `tools.jackson.databind.json` es un
# nombre de librería, no un archivo que el tema deba crear.
EXTENSIONES_DUDOSAS = {"json", "properties", "xml", "yml", "yaml", "md", "txt", "conf", "toml",
                       "ini", "cfg", "env", "gradle", "sum", "lock"}
# Nombres que en un proyecto son siempre archivos, aunque se escriban sin barra.
CANONICAS = {e.lower() for e in (
    "package.json package-lock.json yarn.lock pnpm-lock.yaml tsconfig.json jsconfig.json".split()
    + "vite.config.ts vite.config.js next.config.js webpack.config.js babel.config.js".split()
    + "jest.config.js vitest.config.ts playwright.config.ts .eslintrc.js .prettierrc".split()
    + "pom.xml build.gradle build.gradle.kts settings.gradle settings.gradle.kts gradle.properties".split()
    + "requirements.txt pyproject.toml setup.py Pipfile environment.yml go.mod go.sum cargo.toml".split()
    + "gemfile composer.json pubspec.yaml Podfile Dockerfile docker-compose.yml docker-compose.yaml".split()
    + "compose.yaml Makefile CMakeLists.txt README.md CONTRIBUTING.md Procfile Chart.yaml values.yaml".split()
    + "kustomization.yaml appsettings.json web.xml MANIFEST.MF package.swift .env .gitignore".split())}
# Comandos que abren o escriben un archivo: si el token viene después, el tema lo está tratando como ruta.
COMANDO_ARCHIVO = re.compile(
    r"(?:^|[\s;|&(`])(?:node|npx|tsx|python3?|ruby|php|java|cat|head|tail|less|open|vim|nano|code|"
    r"source|bash|sh|zsh|grep|sed|awk|mv|cp|ls|touch|tee|kubectl|helm|terraform|mvn|gradle|\./gradlew|"
    r"docker|pytest|jest|vitest|tsc|go|cargo|curl|wget|apply|tree|run)\b[^|;&\n]*$",
    re.I)
# `package academia.graphql;` y `using System.IO` nombran un paquete, no un archivo que crear.
PAQUETE_PREVIO = re.compile(r"(?:package|using|namespace|import|from|require|module)\s+$", re.I)
# Redirección en cualquier punto del renglón: `echo hola > salida.txt` crea ese archivo.
REDIRECT = re.compile(r">>?\s*[\"'`]?([\w./@+-]+\." + EXT + r")", re.I)
# Reutilización EXPLÍCITA de algo de otro tema o módulo: el prompt la permite, lo que prohíbe es
# reutilizar «sin explicar». Una frase que dice de dónde viene el archivo no da contexto por hecho.
# «la plantilla de Swift trae un main.swift» o `swift package init` explican un archivo que el
# andamiaje creó por el estudiante: no es un vacío, es una eliminación sobre algo ya justificado.
EXPLICADA = re.compile(r"m[óo]dulo\s*\d+|tema\s*\d+|del\s+(?:cap[íi]tulo|lecci[óo]n|m[óo]dulo|proyecto)|"
                      r"anterior|ya\s+(?:existe|est[áa]|creado)|creado\s+en|viene\s+de|copiado\s+de|"
                      r"en\s+este\s+tema|de\s+la\s+lecci[óo]n|"
                      r"plantilla|andamien|scaffold|template|package\s+init|flutter\s+create|"
                      r"create-|--?output\s+el|genera\s+(?:el|la|un|una)", re.I)
# Un renglón de comentario dentro de un bloque no se ejecuta: es prosa que le dice al estudiante qué
# archivo es o dónde guardarlo. Contar su ruta como «uso» era el mayor falso positivo de los laboratorios
# de cloud (`# archivo: src/labs/modulo-21/tema-2.sh — ejecutar con: bash …`).
COMENTARIO = re.compile(r"^\s*(?:#|//|--|/?\*+)(?:\s|$)")


def indice_ejemplos() -> tuple[set[str], set[str]]:
    """Nombres de archivo que sí existen en `examples/`: están versionados aunque ningún tema los cree."""
    sueltos: set[str] = set()
    colas: set[str] = set()
    carpeta = ROOT / "examples"
    if carpeta.is_dir():
        for path in carpeta.rglob("*"):
            if not path.is_file():
                continue
            piezas = path.relative_to(carpeta).parts
            sueltos.add(path.name)
            if len(piezas) >= 2:
                colas.add("/".join(piezas[-2:]))
    return sueltos, colas
# Un diagrama nombra archivos para explicar el sistema, no para mandarlos crear: no es un uso.
DIAGRAMAS = {"mermaid", "diagram", "dot", "graphviz", "plantuml", "puml", "d2", "nomnoml"}
# Lenguajes que viven en un archivo: un bloque de estos DEBE decir en qué archivo se guarda.
LENGUAJES_ARCHIVO = {"js", "mjs", "cjs", "jsx", "ts", "tsx", "java", "kt", "kts", "groovy", "gradle",
                     "py", "python", "go", "rs", "rb", "php", "c", "h", "cpp", "cs", "scala", "swift",
                     "yaml", "yml", "json", "json5", "toml", "xml", "properties", "html", "css", "scss",
                     "sql", "tf", "proto", "graphql", "vue", "svelte"}

TOKEN_RUTA = re.compile(r"(?<![\w./-])([~./\w$@-][\w./@$+\-]*\." + EXT + r")(?![\w-])")
FENCE = re.compile(r"^```([^\n]*)\n(.*?)^```", re.M | re.S)
# Creaciones explícitas dentro de un bloque de shell.
CREAR_SHELL = re.compile(
    r"(?:^|[;&|])\s*(?:mkdir\s+(?:-[^\s]*\s+)*|touch\s+|tee\s+(?:-a\s+)?|cp\s+(?:-[^\s]*\s+)*\S+\s+|"
    r"mv\s+(?:-[^\s]*\s+)*\S+\s+|cat\s*(?:<<[^\n]*\n)?[^|;&]*?>\s*|printf\s+[^>]*>\s*|"
    r"echo\s+[^>]*>\s*|vim\s+|nano\s+|code\s+|open\s+)(`?[\w./@-]+\.(?:" + EXT + r")`?|"
    r"`?[\w./@-]+`?(?=[\s&|;)]|$))", re.I | re.M)
CREAR_TXT = re.compile(r"^\s*(?:mkdir\s+(?:-[^\s]*\s+)*|cd\s+)\[?([~\w][\w./@+-]*)\]?", re.I)
# Creación en prosa: «Guarda en `src/main.js`:», «Creamos `pom.xml`.», «Añade a `build.gradle`».
# Un renglón que manda crear algo crea TODAS las rutas que nombra: «crea manualmente `contrato.txt`,
# `domain.py` y `test_contrato.py`», «Crea java-motor-colecciones/src/OrdenDemo.java:», «Archivo
# `src/main.ts`:».
# «la carpeta `ejemplo-mocks`» o «la carpeta src/main/java»: una carpeta dicha en prosa sin acentos de
# ruta no cuenta, porque «carpeta vacía», «carpeta actual» y «carpeta temporal» son adjetivos, no nombres.
CREAR_CARPETA = re.compile(
    r"(?:carpeta|directorio|folder)\s+(?:de\s+lamar\s+|llamada\s+|llamado\s+)?`([^`]+)`"
    r"|(?:carpeta|directorio|folder)\s+(?:de\s+lamar\s+|llamada\s+|llamado\s+)?"
    r"([\w./@+-]*[./][\w./@+-]*)", re.I)
# El propio código del ejemplo crea archivos: writeFileSync, curl --output, wget -O, open(..., 'w').
CREAR_CODIGO = re.compile(
    r"(?:writeFileSync|writeFile|appendFileSync|copyFileSync)\s*\(\s*[\"']([^\"']+)[\"']"
    r"|\bcurl\b[^|\n]*?(?:-o|--output|-c|-D|--cookie-jar|--dump-header)\s+(\S+)"
    r"|\bwget\b[^|\n]*?-O\s+(\S+)"
    r"|\bopen\s*\(\s*[\"']([^\"']+)[\"']\s*,\s*[\"']w"
    r"|Path\s*\(\s*[\"']([^\"']+)[\"']\s*\)\s*\.\s*write_text"
    r"|Set-Content\s+[\"']?([^\"'\s;|]+)", re.I)
# Las fichas declaran el archivo en su propio renglón: `` `src/main.ts`: `` antes del bloque, o como
# comentario dentro del bloque: `// app.ts: arma el servidor`. Ninguno lleva verbo y ambos son ancla.
ANCLA_RENGOLON = re.compile(r"^\s*(?:[-*]\s*)?`([^`]*\." + EXT + r")`\s*[:—–-]", re.M | re.I)
ANCLA_COMENTARIO = re.compile(
    r"^\s*(?://|#|--|/?\*)\s*(?:archivo|fichero|file|ruta|path|script)?\s*[:\-]?\s*"
    r"([\w./@+-]*\." + EXT + r")\s*[:.\s—–\-]", re.M | re.I)
EJEMPLO = re.compile(r"examples/[\w./@+-]+|[\w./@+-]*verify\.sh|[\w./@+-]*verificar\.sh", re.I)
# AWS escribe archivos locales sin redirección: `aws s3 cp s3://bucket/clave descarga.txt` y
# `aws lambda invoke … respuesta.json` terminan creando ese archivo. Son destinos, no insumos, así que
# el renglón que los nombra no puede contarse como un contexto dado por hecho.
CREAR_DESTINO = re.compile(
    r"(?:\bs3\s+(?:cp|sync|mv|download)\b[^\n]*?\s(?:--\S+\s+)*([\w./@+-]+\." + EXT + r")"
    r"|\binvoke(?:-model)?\b[^\n]*?\s(?:--\S+\s+)*((?!file://)[\w./@+-]+\." + EXT + r")\s*$)", re.I)
ARBOL = re.compile(r"[├└]──\s*([^\s─│]+)")


LAB_SUELTOS, LAB_COLAS = indice_ejemplos()


def rutas_de(texto: str) -> list[str]:
    """Rutas de proyecto de un texto.

    Un token con extensión NO basta: `ct.tf([4], [1, 2, 0])`, `r.json()` y `process.env` son llamadas,
    y `dev.java` o `docs.swift` son dominios. Solo cuenta como ruta si el texto la trata como archivo:
    lleva barra, es un nombre canónico de proyecto, viene detrás de un comando que abre archivos, o está
    escrita entrecomillada en la prosa sin ser una llamada.
    """
    salida = []
    # Las URLs no son archivos del proyecto: `http://localhost:8091/sensor.json` es un endpoint y el
    # fragmento `8091/sensor.json` que sobrevivía al recorte del protocolo era un falso positivo.
    # `file://` sí señala un archivo local, así que se le quita el prefijo y la ruta se conserva.
    texto = re.sub(r"\bfile://", " ", texto, flags=re.I)
    texto = re.sub(r"\b\w+://\S+", " ", texto)
    texto = re.sub(r"(?<![\w./-])(?:localhost|0\.0\.0\.0|127\.0\.0\.1|host\.docker\.internal|"
                   r"[\w.-]+\.internal|[\w.-]+\.svc\.cluster\.local)(?::\d+)(?:/\S*)?", " ", texto)
    for cruce in TOKEN_RUTA.finditer(texto):
        crudo = cruce.group(1)
        if "..." in crudo or "…" in crudo:
            continue                                          # V3__...sql: nombre elíptico, no ruta
        if crudo.startswith("/") and not crudo.startswith("//"):
            continue                                          # /etc/nginx/conf.d/default.conf: ruta del contenedor
        ruta = crudo.strip("`").strip("./")
        if not ruta or "://" in ruta or ruta.startswith("http"):
            continue
        if any(g in ruta for g in GENERADAS) or any(ruta.startswith(s) or s.rstrip("/") == ruta for s in SISTEMA):
            continue
        if len(ruta) > 90 or ruta.count(".") > 4:
            continue
        if ruta.lower() in MARCAS:
            continue                                          # Node.js, Next.js: marca, no archivo
        anterior = texto[max(0, cruce.start() - 60):cruce.start()]
        entre_comillas = anterior.endswith("`") and texto[cruce.end():cruce.end() + 2].strip() != "("
        es_archivo = ("/" in ruta or ruta.lower() in CANONICAS or entre_comillas
                      or bool(COMANDO_ARCHIVO.search(anterior)))
        primera = ruta.split("/")[0]
        if "/" in ruta and len(primera.split(".")) >= 2 \
                and primera.split(".")[-1].lower() in DOMINIOS:
            continue                                          # ctms.engin.umich.edu/…, nodejs.org/api/…
        partes = ruta.split(".")
        if not es_archivo:
            continue
        if "/" not in ruta and PAQUETE_PREVIO.search(anterior):
            continue                                          # package academia.graphql: paquete, no archivo
        if ruta.lower() in CANONICAS:
            salida.append(ruta)                                 # settings.gradle.kts sigue siendo archivo
            continue
        if "/" not in ruta and partes[0].lower() in IDENTIFICADORES:
            continue                                          # res.json, process.env, org.gradle.api
        if "/" not in ruta and len(partes) == 3 and ruta == ruta.lower() and partes[1] not in SUFIJOS:
            continue                                          # docs.swift, org.gradle.awesome
        if ("/" not in ruta and len(partes) >= 3 and ruta == ruta.lower()
                and partes[-1] in EXTENSIONES_DUDOSAS):
            continue                                          # tools.jackson.databind.json: paquete, no archivo
        salida.append(ruta)
    return salida


def normaliza(ruta: str) -> str:
    ruta = ruta.strip("`* ").strip("./").strip()
    ruta = re.sub(r"^`|`$|^@", "", ruta)      # `@falso.txt` es la marca de subida de curl, no otro archivo
    return ruta


def misma(a: str, b: str) -> bool:
    """Dos rutas que nombran el mismo archivo, aunque una lleve el prefijo del proyecto."""
    return a == b or a.endswith("/" + b) or b.endswith("/" + a)


def creado_por(texto_tema: str) -> tuple[set[str], set[str]]:
    """(rutas creadas, nombres de carpeta creados o abiertos) dentro de un tema."""
    creadas: set[str] = set()
    carpetas: set[str] = set()
    for bloque in re.split(r"```", texto_tema):
        paso = bloque.lstrip()
        es_shell = paso.startswith(("bash", "sh", "shell", "console", "text", "zsh", ""))
        if es_shell:
            # Un renglón partido con `\` sigue siendo el mismo comando: `aws lambda invoke \` +
            # `  --function-name … respuesta.json` creaba el archivo y el patrón no lo veía. Y el bloque
            # se corta por tuberías porque en `echo x | tee -a salida/log.txt` el destino lo crea el
            # `tee`; leído de corrido, el patrón se quedaba con el `>/dev/null` del `echo`.
            unido = re.sub(r"\\\s*\n[ \t]*", " ", bloque)
            for segmento in re.split(r"[|;\n]", unido):
                for patron in (CREAR_SHELL, CREAR_DESTINO):
                    for cruce in patron.finditer(segmento):
                        blanco = normaliza(next((g for g in cruce.groups() if g), ""))
                        # Una ruta absoluta (`/dev/null`, `/etc/hosts`) tampoco es un uso: rutas_de ya
                        # descarta los tokens que empiezan por `/`, así que no hay nada que cubrir.
                        if blanco and not blanco.startswith(("-", "/")) and "://" not in blanco:
                            creadas.add(blanco)
            for linea in bloque.splitlines():
                cruce = CREAR_TXT.match(linea)
                if cruce:
                    carpetas.add(normaliza(cruce.group(1)))
    prosa = "\n".join(lineas_de(texto_tema.splitlines(), fuera_fence=True))
    # La prosa declara archivos aunque no use un verbo de creación: «el script `cambiar-a.sh green` que
    # recibe el entorno» presenta el archivo al estudiante, y eso es lo que el prompt exige.
    for fuente in (prosa, sin_diacriticos(prosa)):
        creadas.update(rutas_de(fuente))
        for cruce in CREAR_CARPETA.finditer(fuente):
            blanco = normaliza(next((g for g in cruce.groups() if g), ""))
            if not blanco or ("/" not in blanco and re.search(r"\." + EXT + r"$", blanco, re.I)):
                continue                                        # es un archivo, no una carpeta
            carpetas.add(blanco)
    for bloque in re.split(r"```", texto_tema)[1::2]:
        for cruce in CREAR_CODIGO.finditer(bloque):
            blanco = normaliza(next((g for g in cruce.groups() if g), ""))
            if blanco and "." in blanco:                        # writeFileSync('x.ts', ”) y curl -o crean
                creadas.add(blanco)
    for bloque in re.split(r"```", texto_tema):
        if bloque.lstrip().startswith(("bash", "sh", "shell", "console", "text", "zsh", "")):
            for cruce in REDIRECT.finditer(bloque):
                blanco = normaliza(cruce.group(1))
                if not blanco.startswith("/"):
                    creadas.add(blanco)                        # «echo hola > salida.txt» crea salida.txt
    for cruce in ANCLA_RENGOLON.finditer(texto_tema):
        creadas.add(normaliza(cruce.group(1)))
    for bloque in re.split(r"```", texto_tema)[1::2]:
        for linea in bloque.splitlines():
            if COMENTARIO.match(linea):
                # `# pega el código en Sources/Practica/main.swift` le dice al estudiante dónde escribir:
                # es una declaración, la otra cara del renglón que acabamos de excluir de los usos.
                creadas.update(rutas_de(linea))
    for bloque in re.split(r"```", texto_tema)[1::2]:
        for cruce in ANCLA_COMENTARIO.finditer(bloque):
            ruta = normaliza(cruce.group(1))
            if not ruta.startswith("/"):
                creadas.add(ruta)
    for patron, nombres in GENERADA_POR:
        if patron.search(texto_tema):
            creadas |= nombres                                # package-lock.json lo crea npm, no el tema
    return creadas, carpetas


def usos_de(texto: str) -> list[tuple[str, str]]:
    """(ruta, renglón) que el tema **usa de verdad**, no las que solo nombra.

    Un archivo se usa cuando un bloque de código o de comandos lo ejecuta, lo importa o lo aplica:
    ahí es donde el estudiante se queda parado si nadie lo creó. La prosa que lo menciona se cuenta
    como declaración (vea `creado_por`), y los diagramas se excluyen: nombran archivos para explicar
    el sistema, no mandan abrirlos.
    """
    salida: list[tuple[str, str]] = []
    for etiqueta, cuerpo in FENCE.findall(texto):
        if etiqueta.split(":")[0].strip().lower() in DIAGRAMAS or "-->" in cuerpo:
            continue
        for sublinea in cuerpo.splitlines():
            if COMENTARIO.match(sublinea):
                continue                       # un comentario no se ejecuta: nombra el archivo, no lo usa
            salida += [(r, sublinea) for r in rutas_de(sublinea)]
    for linea in lineas_de(texto.splitlines(), fuera_fence=True):
        # Un renglón de prosa puede mandar un comando entre comillas: «**Ejecuta:** `bash ejemplo.sh`».
        for span in re.findall(r"`([^`\n]{4,120})`", linea):
            if COMANDO_ARCHIVO.search(span + " "):
                salida += [(r, span) for r in rutas_de(span)]
    return salida


def lineas_de(bloque_lineas: list[str], fuera_fence: bool) -> list[str]:
    """Las líneas del tema, opcionalmente solo las que no están dentro de un bloque de código."""
    dentro = False
    salida = []
    for linea in bloque_lineas:
        if linea.startswith("```"):
            dentro = not dentro
            continue
        if fuera_fence == (not dentro):
            salida.append(linea)
    return salida


def arbol_de(texto: str) -> list[str]:
    """Rutas declaradas en un bloque de estructura (el dibujo con ├── y └──)."""
    rutas: list[str] = []
    for _, bloque in FENCE.findall(texto):
        if not re.search(r"[├└]──", bloque):
            continue
        pila: dict[int, str] = {}
        for linea in bloque.splitlines():
            rama = ARBOL.search(linea)
            if not rama:
                continue
            nombre = rama.group(1).rstrip("/").strip("… ")
            nivel = max((i for i in range(len(linea)) if linea[i] in "├└"), default=0) // 4
            pila[nivel] = nombre
            for k in [k for k in pila if k > nivel]:
                del pila[k]
            cadena = "/".join(pila[n] for n in sorted(pila))
            if re.search(r"\." + EXT + r"$", nombre, re.I):
                rutas.append(cadena)
    return rutas


def medir(bloque: dict, previas: set[str], carpetas_previas: set[str],
          rutas_track: set[str]) -> dict:
    lineas = bloque["lineas"]
    texto = "\n".join(lineas)
    texto_sin_fence = "\n".join(lineas_de(lineas, fuera_fence=True))
    creadas, carpetas = creado_por(texto)
    usos = usos_de(texto)
    cubiertas = creadas | previas
    raices = {normaliza(c) for c in carpetas | carpetas_previas if normaliza(c)}

    inventadas, reutilizadas, versionadas, fuera_raiz = [], [], [], []
    declarado_no_creado, punteros_rotos = [], []
    for ruta, contexto in usos:
        normalizada = normaliza(ruta)
        if any(misma(normalizada, c) for c in cubiertas | rutas_track):
            continue
        if EXPLICADA.search(contexto):
            reutilizadas.append(normalizada)     # «la raíz del proyecto del Módulo 0»: explicado, no asumido
            continue
        cola = "/".join(normalizada.split("/")[-2:])
        if cola in LAB_COLAS or ("/" not in normalizada and normalizada in LAB_SUELTOS):
            versionadas.append(normalizada)      # existe en examples/, pero ningún tema lo crea
            continue
        if (ROOT / normalizada).exists():
            continue                             # `docs/VERSIONES.md`: archivo real del repo, no un vacío
        inventadas.append(normalizada)
    inventadas, reutilizadas, versionadas = (sorted(set(x)) for x in (inventadas, reutilizadas, versionadas))

    # C2: los comandos crean una carpeta y el código del tema vive en otra.
    usadas_con_raiz = {r.split("/")[0] for r, _ in usos if "/" in r}
    # `$RELEASE/`, `$PWD/`, `$(mktemp -d)/`: una raíz que viene de una variable no es comparable con el
    # nombre literal que crea `mkdir`, así que no puede dar incidencia.
    usadas_con_raiz = {r for r in usadas_con_raiz if not re.search(r"[$()*{}]", r)}
    raiz_de_usos = {r for r in usadas_con_raiz if not r.endswith((".js", ".ts", ".java", ".json", ".md"))}
    raices_creadas_aqui = ({c.split("/")[0] for c in carpetas} | {c.split("/")[-1] for c in carpetas}
                           | {p for c in carpetas for p in c.split("/") if len(p) > 3})
    # Un tema que se mete dentro de una ruta (`cd examples/java-jpa-lab`) escribe después en rutas
    # relativas a ese directorio: si la raíz usada vive ahí dentro, no está huérfana.
    anidadas = {r for r in raiz_de_usos for c in carpetas
                if (ROOT / normaliza(c) / r).is_dir() or r in normaliza(c).split("/")}
    huerfanas = sorted(r for r in raiz_de_usos - anidadas
                       if r not in raices_creadas_aqui and r not in raices
                       and not any(u.startswith(r + "/") for u in creadas)
                       and len(r) > 3 and "." not in r)
    cuelgan = sorted(c for c in raices_creadas_aqui
                     if c not in raiz_de_usos and not any(u.startswith(c + "/") for u in creadas)
                     and not any(u.startswith(c) for u in usadas_con_raiz) and len(c) > 3)
    if huerfanas and cuelgan:
        fuera_raiz.append(f"{cuelgan[0]} (creada) ≠ {huerfanas[0]} (usada)")

    # C3: la estructura dibujada no aparece en ninguna creación del tema.
    for declarada in arbol_de(texto):
        base = declarada.split("/")[-1]
        if not any(misma(normaliza(base), normaliza(c)) or c.endswith(base) for c in creadas | previas):
            declarado_no_creado.append(declarada)

    # C4: bloque de archivo (lenguaje que vive en un fichero) de 4+ líneas sin declarar cuál.
    sin_archivo = 0
    bloques_largos = 0
    anterior_fin = anterior_lenguaje = None
    for cruce in FENCE.finditer(texto):
        lenguaje = cruce.group(1).lower().split(":")[0].strip()
        cuerpo = cruce.group(2)
        if lenguaje not in LENGUAJES_ARCHIVO:
            anterior_fin = anterior_lenguaje = None
            continue
        # Continuación: un bloque que pega directo al anterior del mismo lenguaje es «el resto de ese
        # archivo». El tema ya lo nombró arriba, y exigir el nombre dos veces es medir otra cosa.
        es_continuacion = (anterior_fin is not None and lenguaje == anterior_lenguaje
                           and not texto[anterior_fin:cruce.start()].strip("- \n\t"))
        anterior_fin, anterior_lenguaje = cruce.end(), lenguaje
        if es_continuacion:
            continue
        if len([l for l in cuerpo.splitlines() if l.strip()]) < 4:
            continue
        bloques_largos += 1
        if ":" in cruce.group(1).lower():                       # ```ts:src/main.ts
            continue
        antes = [l for l in texto[:cruce.start()].splitlines() if l.strip()]
        antes = [l for l in texto[:cruce.start()].splitlines() if l.strip()]
        anterior = antes[-2:]
        # Las dos líneas de arriba declaran el archivo si nombran una ruta, la lean como el auditor la
        # lee: entre backticks, suelta antes de dos puntos («Crea java-motor-colecciones/src/GenericosDemo.java:»)
        # o con la palabra archivo. Un renglón que solo dice «**Código del ejemplo:**» no declara nada.
        if any(rutas_de(l) or re.search(r"`[^`]*\." + EXT + r"`|\b(?:archivo|fichero|file)\b\s*[:.]", l, re.I)
               for l in anterior):
            continue
        # Una solución desplegable (`<details><summary>Solución</summary>`) pertenece al ejercicio que
        # tiene arriba: nombrar el archivo otra vez no forma, y contarla como defecto infla la cifra.
        if any(re.search(r"<summary>\s*(?:Solución|Respuesta)|^\*\*(?:Solución|Respuesta)", l, re.I)
               for l in antes[-8:]):
            continue
        if ANCLA_COMENTARIO.search(cuerpo) or ANCLA_RENGOLON.search(cuerpo):
            continue
        if re.search(r"cat\s*>|tee\s|printf\s+.*>|touch\s", cuerpo):
            continue
        sin_archivo += 1

    # C5: laboratorios citados que no existen en el repo.
    # `…/modulo-7/f034-pact-` + renglón nuevo + `consumidor/` es una palabra partida por el salto de
    # línea del markdown: sin reunirla, la cita apunta a una carpeta que no existe.
    citas = re.sub(r"(?<=\w)-\n(?=\w)", "-", texto_sin_fence)
    for cruce in EJEMPLO.findall(citas):
        # El punto final de una frase («ejecutá ./mvnw desde examples/java-jpa-lab.») no forma parte del
        # nombre, y un guiño partido por el renglón («f034-pact-\nconsumidor/») deja un prefijo: si ese
        # prefijo identifica un laboratorio único, la cita es buena y el renglón la escribió mal.
        candidato = cruce.strip("`").strip().rstrip(".,:;)")
        if "/" in candidato and candidato.split("/")[-1] in ("", ".", ".."):
            continue
        if candidato.startswith("examples/"):
            if (ROOT / candidato).exists():
                continue
            prefijo = candidato.split("/")[-1]
            if len(prefijo) > 3 and prefijo != prefijo.rstrip("-_"):
                if len({p.name for p in (ROOT / "examples").rglob("*")
                        if p.is_dir() and p.name.startswith(prefijo)}) == 1:
                    continue
            punteros_rotos.append(candidato)
        else:
            nombre = candidato.split("/")[-1]
            if nombre in ("verify.sh", "verificar.sh") and nombre not in LAB_SUELTOS:
                punteros_rotos.append(candidato)

    return {"C1": len(inventadas), "C2": len(fuera_raiz), "C3": len(declarado_no_creado),
            "C4": sin_archivo, "C5": len(punteros_rotos), "C6": len(versionadas),
            "bloques_largos": bloques_largos, "explicadas": len(reutilizadas),
            "inventadas": inventadas[:6], "fuera_raiz": fuera_raiz[:3], "versionadas": versionadas[:4],
            "explicadas_lista": reutilizadas[:4],
            "declarado_no_creado": declarado_no_creado[:4], "punteros_rotos": punteros_rotos[:3]}


CHECKS = {
    "C1": "ruta usada que ningún tema del curso crea y que no existe en el repo",
    "C2": "la carpeta que crean los comandos no es donde vive el código",
    "C3": "estructura de archivos dibujada que el tema no crea",
    "C4": "bloque de código largo sin declarar su archivo",
    "C5": "laboratorio citado cuya ruta no existe en el repo",
    "C6": "ruta que sí está versionada en `examples/` pero ningún tema manda crear",
}


def medir_curso(track: str) -> list[dict]:
    filas = []
    previas: set[str] = set()
    carpetas_previas: set[str] = set()
    bloques = tema_blocks(track)
    rutas_track: set[str] = set()
    for bloque in bloques:
        texto = "\n".join(bloque["lineas"])
        creadas, _ = creado_por(texto)
        rutas_track |= {normaliza(c) for c in creadas}
    for bloque in bloques:
        fila = {"track": track, "modulo": bloque["modulo"], "titulo": bloque["titulo"],
                "formato": bloque["formato"]}
        fila.update(medir(bloque, previas, carpetas_previas, rutas_track))
        filas.append(fila)
        texto = "\n".join(bloque["lineas"])
        nuevas, carpetas = creado_por(texto)
        previas |= {normaliza(c) for c in nuevas}
        carpetas_previas |= {normaliza(c) for c in carpetas}
    return filas


def generar() -> tuple[dict, str, str, str]:
    index = json.loads((CONTENT / "topic-index.json").read_text(encoding="utf-8"))
    por_curso = {track: medir_curso(track) for track in sorted(index)}
    todas = [fila for filas in por_curso.values() for fila in filas]
    total = len(todas)
    resumen = {c: {"temas_con_incidencia": sum(1 for f in todas if f[c]),
                   "incidencias": sum(f[c] for f in todas)} for c in CHECKS}
    limpias = sum(1 for f in todas if not any(f[c] for c in CHECKS))
    datos = {"temas_medidos": total, "comprobaciones": CHECKS, "resumen": resumen,
             "temas_sin_incidencia": limpias,
             "por_curso": {t: {c: sum(f[c] for f in filas) for c in CHECKS}
                           for t, filas in por_curso.items()},
             "temas_por_curso": {t: len(filas) for t, filas in por_curso.items()}}

    lineas = [
        "# Coherencia material del código de cada tema",
        "",
        "> Generado por `scripts/audit_code_coherence.py` sobre `topic-index.json`"
        f" ({total} temas en {len(por_curso)} cursos).",
        "> Mide si el código de un tema se sostiene solo: rutas que se usan sin haberse creado nunca,",
        "> la carpeta que crean los comandos frente a donde vive el código, bloques sin archivo declarado",
        "> y punteros a laboratorios inexistentes. **No** comprueba que el código compile ni que la salida",
        "> escrita sea real: eso lo hacen `validate_lesson_labs.py`, `audit_topic_citations.py` y los",
        "> `verificar.sh` ejecutados en la Mac del dueño.",
        "> De las seis, C4 es la más blanda: un bloque sin nombre de archivo puede ser un fragmento",
        "> ilustrativo. C1, C2, C5 y C6 son las que cita literalmente el prompt maestro y las que hay",
        "> que bajar. La lista de trabajo está en el CSV, con la ruta concreta de cada incidencia.",
        "",
        f"Temas sin ninguna incidencia: **{limpias}/{total}** ({round(100 * limpias / total) if total else 0} %).",
        "",
        "| Comprobación | Qué significa | Temas con incidencia | Incidencias |",
        "|---|---|---:|---:|",
    ]
    for c, nombre in CHECKS.items():
        r = resumen[c]
        lineas.append(f"| {c} | {nombre} | {r['temas_con_incidencia']}/{total} "
                      f"| {r['incidencias']} |")
    lineas += ["", "## Por curso", "",
               "| Curso | Temas | " + " | ".join(CHECKS) + " | Sin incidencia |",
               "|---|---:|" + "---:|" * len(CHECKS) + "---:|"]
    for track, filas in por_curso.items():
        n = len(filas)
        limpias_t = sum(1 for f in filas if not any(f[c] for c in CHECKS))
        lineas.append(f"| {track} | {n} | " + " | ".join(str(sum(f[c] for f in filas))
                                                        for c in CHECKS) + f" | {limpias_t}/{n} |")
    lineas += ["", "## Cómo se usa", "",
               "`docs/auditoria/coherencia-codigo.csv` tiene una fila por tema con las rutas concretas.",
               "Cada incidencia es literal: se comprueba abriendo el capítulo en la línea indicada.",
               "Un tema con las cinco columnas en `0` no da contexto por hecho en su código.", ""]
    markdown = "\n".join(lineas)

    bufer = io.StringIO()
    escritor = csv.writer(bufer, lineterminator="\n")
    escritor.writerow(["curso", "modulo", "titulo", "formato", "tema"] + list(CHECKS) + ["explicadas"]
                      + ["ruta_inventada", "carpeta_incoherente", "estructura_no_creada", "puntero_roto",
                         "ruta_versionada", "reutilizada_explicada"])
    for fila in todas:
        escritor.writerow([fila["track"], fila["modulo"], fila["titulo"], fila["formato"],
                           f"{fila['track']}/modulo-{fila['modulo']}"]
                          + [fila[c] for c in CHECKS] + [fila["explicadas"]]
                          + [" ".join(fila["inventadas"]), " ".join(fila["fuera_raiz"]),
                             " ".join(fila["declarado_no_creado"]), " ".join(fila["punteros_rotos"]),
                             " ".join(fila["versionadas"]), " ".join(fila["explicadas_lista"])])
    csv_texto = bufer.getvalue()
    return datos, markdown, json.dumps(datos, ensure_ascii=False, indent=2) + "\n", csv_texto


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--resumen", action="store_true")
    parser.add_argument("--temas", action="store_true")
    args = parser.parse_args()
    datos, markdown, json_texto, csv_texto = generar()

    if args.resumen or args.temas:
        for c, nombre in CHECKS.items():
            r = datos["resumen"][c]
            print(f"{c} {r['temas_con_incidencia']:>5}/{datos['temas_medidos']} "
                  f"({r['incidencias']:>5} incidencias)  {nombre}")
        print(f"temas medidos: {datos['temas_medidos']} · sin incidencia: {datos['temas_sin_incidencia']}")
        if args.temas:
            filas = []
            for lectura in csv.DictReader(io.StringIO(csv_texto)):
                peso = sum(int(lectura[c]) for c in CHECKS)
                filas.append((peso, lectura["tema"], lectura["ruta_inventada"], lectura["carpeta_incoherente"]))
            for peso, tema, inv, raiz in sorted(filas, reverse=True)[:15]:
                print(f"  {peso:>3}  {tema}  {inv[:70]}  {raiz[:50]}")
        return 0

    nuevas = [(OUT_MD, markdown), (OUT_JSON, json_texto), (OUT_CSV, csv_texto)]
    if args.check:
        desactualizadas = [p.name for p, texto in nuevas if not p.is_file() or p.read_text(encoding="utf-8") != texto]
        print("audit_code_coherence: " + (f"desactualizado {desactualizadas}" if desactualizadas else "al día"))
        return 1 if desactualizadas else 0
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for path, texto in nuevas:
        path.write_text(texto, encoding="utf-8")
    peor = max(CHECKS, key=lambda c: datos["resumen"][c]["temas_con_incidencia"])
    print(f"audit_code_coherence: {datos['temas_medidos']} temas; sin incidencia "
          f"{datos['temas_sin_incidencia']}; comprobación con más temas "
          f"{peor} {datos['resumen'][peor]['temas_con_incidencia']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
