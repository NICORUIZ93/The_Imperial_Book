#!/usr/bin/env python3
"""Extrae los temas ejecutables de Cloud y DevOps a scripts de pasos (specs/019).

Uso: python3 extraer.py            (desde cualquier carpeta; rutas relativas al kit)

Por cada sección ejecutable (`### Tema N`, `### Laboratorio …` y secciones `##` con código) de
web/public/content/{cloud,devops}/modulo-N.md genera build/<curso>/modulo-N/<unidad>/ con:

  pasos.sh       la secuencia de pasos (bloques de terminal y archivos), en el orden de la lección
  bloques/NN.sh  cada bloque de terminal, con los ajustes mínimos para ejecutarse sin TTY
  archivos/NN-*  cada archivo que la lección manda crear («Crea `x`:», «Archivo `x`:», «# archivo: x»)
  origen.txt     curso/modulo-N.md:LÍNEA del encabezado
  esperado.txt   los «Resultado esperado» / «Salida esperada» / error-output de la lección
  fragmentos.txt fragmentos literales de esos resultados que run.sh busca en la salida
  meta.sh        variables que run.sh lee (SKIP, herramientas, modo de Floci, timeout…)

Solo usa la biblioteca estándar. No modifica las lecciones.
"""
from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

KIT = Path(__file__).resolve().parent
REPO = KIT.parent.parent
CONTENIDO = REPO / "web" / "public" / "content"
BUILD = KIT / "build"
CURSOS = ("cloud", "devops")

# ---------------------------------------------------------------- clasificación de bloques
LENG_TERMINAL = {"bash", "sh", "shell", "zsh", "console"}
LENG_IGNORADOS = {"mermaid", "text", "", "anatomy", "error-output", "powershell", "promql", "output"}
LENG_ARCHIVO = {"js", "mjs", "javascript", "ts", "typescript", "python", "py", "json", "yaml", "yml",
                "hcl", "terraform", "sql", "ini", "nginx", "dotenv", "rego", "markdown", "md",
                "dockerfile", "java", "toml", "xml", "html", "css", "go"}

EXT = r"(?:m?js|cjs|ts|py|json|jsonl|ya?ml|tf|tfvars|sql|md|ini|conf|env|rego|sh|bash|txt|html|css|" \
      r"service|timer|toml|java|go|properties|xml|csv|cfg|example|lock|mod|graphql|hcl|j2)"
RUTA_RE = re.compile(r"`((?:[\w.@-]+/)*(?:[\w@-][\w.@-]*\." + EXT + r"|Dockerfile|Makefile|Containerfile|"
                     r"Jenkinsfile|\.env(?:\.\w+)?|\.gitignore|\.dockerignore|Chart\.yaml))`")
CREAR_RE = re.compile(r"\b(?:Crea|crea|Créa|Creá|creá|Escribe|escribe|Escribí|escribí|Guarda|guarda|Guardá|guardá)\b"
                      r"|(?:^|\s)Archivo\s+(?=`)|^(?=`[^`]+`:\s*$)")
EDITAR_RE = re.compile(r"\b(Cambia|cambia|Cambiá|cambiá|Añade|añade|Agrega|agrega|Agregá|agregá|Modifica|modifica|"
                       r"Reemplaza|reemplaza|Sustituye|sustituye|Actualiza|actualiza|Edita|edita|Ajusta|ajusta)\b")
CONTENIDO_COMPLETO_RE = re.compile(r"contenido completo|desde una carpeta vacía|en un proyecto nuevo", re.I)
ESPERADO_RE = re.compile(r"(Resultado esperado|Salida esperada|Debes ver|Deberías ver|Verás)", re.I)
FRAGMENTO_RE = re.compile(r"(Resultado esperado|Salida esperada|Debes ver|Deberías ver)", re.I)
FALLO_RE = re.compile(r"fallo deliberado|debe fallar|deberá fallar|va a fallar|fallará", re.I)
RUTA_COMENTARIO_RE = re.compile(r"^\s*(?:#|//|--)\s*((?:[\w.@-]+/)*[\w@-][\w.@-]*\." + EXT + r")\s*$")
FALLO_DESPUES_RE = re.compile(r"\b(debería|debe|va a) fallar\b|\bfallará\b", re.I)
INLINE_RE = re.compile(r"[Ee]jecut[aá] `((?:node|python3)\s+([\w./-]+\.(?:m?js|py)))`")
EXTRACTO_RE = re.compile(r"Este es su|[Ee]xtracto|[Ff]ragmento|de la raíz|raíz del proyecto|ya incluye|ya está definido")
DENTRO_RE = re.compile(r"dentro de `([\w./-]+)`")
TAGS_HTML = {"html", "head", "body", "div", "span", "p", "h1", "h2", "h3", "title", "script", "style", "ul",
             "li", "a", "br", "pre", "code", "strong", "em", "table", "tr", "td", "th", "meta", "link",
             "main", "section", "img", "button", "form", "input", "label", "nav", "footer", "header"}
PLACEHOLDER_RE = re.compile(r"<([a-záéíóúñ][a-záéíóúñ0-9_-]*)>", re.I)

HERRAMIENTAS = ["aws", "az", "gcloud", "floci", "docker", "kubectl", "kind", "terraform", "tofu", "helm",
                "node", "npm", "npx", "python3", "python", "pip", "pip3", "psql", "redis-cli", "valkey-cli",
                "cosign", "syft", "grype", "trivy", "opa", "conftest", "ansible-playbook", "ansible-vault",
                "ansible", "minikube", "argocd", "jq", "yq", "git", "curl", "make", "go", "java", "mvn",
                "k6", "hey", "gh", "flux", "kustomize", "skaffold", "ssh", "ssh-keygen", "scp", "openssl",
                "sqlite3", "envsubst", "shellcheck", "hadolint", "dive", "ab", "wrk", "nc", "dig", "nslookup",
                "kubeconform", "kubeval", "tflint", "checkov", "tfsec", "infracost", "pulumi", "cdk", "sam",
                "act", "gitleaks", "trufflehog", "sops", "age", "vault", "consul", "nomad", "packer",
                "vagrant", "stern", "k9s", "istioctl", "linkerd", "cilium", "velero", "promtool", "amtool",
                "logcli", "kubectl-argo-rollouts", "kyverno", "chaos", "litmusctl", "crane", "skopeo", "oras",
                "buildah", "podman", "nerdctl", "lima", "colima", "uv", "pytest", "deno", "bun", "yarn", "pnpm", "nmap", "newman",
                "dot", "mmdc", "pandoc", "rsync", "htop", "lsof", "parallel", "socat", "grpcurl", "websocat",
                "mkcert", "step", "cfssl", "kubectx", "kubens", "kompose", "terragrunt", "tfenv", "localstack",
                "awslocal", "tflocal", "cdklocal", "samlocal", "chamber", "aws-vault", "granted"]
# Lo que solo existe en Linux o necesita una máquina o cuenta ajena al Mac del dueño.
SKIP_COMANDO = {
    "sudo": "requiere sudo/Linux (no se ejecuta en el Mac del dueño)",
    "systemctl": "requiere systemd (Linux); macOS no lo tiene",
    "journalctl": "requiere systemd (Linux); macOS no lo tiene",
    "apt": "requiere apt (Linux)", "apt-get": "requiere apt (Linux)", "dnf": "requiere dnf (Linux)",
    "yum": "requiere yum (Linux)", "useradd": "requiere useradd (Linux)", "usermod": "requiere usermod (Linux)",
    "groupadd": "requiere groupadd (Linux)", "loginctl": "requiere systemd (Linux)",
    "iptables": "requiere iptables (Linux)", "nft": "requiere nftables (Linux)", "ufw": "requiere ufw (Linux)",
    "ssh": "requiere un servidor SSH de laboratorio", "scp": "requiere un servidor SSH de laboratorio",
    "ansible-playbook": "requiere un servidor de laboratorio por SSH (inventario)",
    "gh": "requiere cuenta de GitHub autenticada",
    "argocd": "requiere un servidor Argo CD",
    "vagrant": "requiere Vagrant/VM", "eksctl": "requiere cuenta AWS real",
}
SKIP_PATRONES = [
    (re.compile(r"\bgit\s+push\b"), "requiere un remoto Git real (git push)"),
    (re.compile(r"\baws\s+configure\s*(sso)?\s*$"), "pide credenciales de forma interactiva (aws configure)"),
    (re.compile(r"\baws\s+sso\b"), "requiere cuenta AWS real (SSO)"),
    (re.compile(r"\baz\s+login\b"), "requiere cuenta Azure real (az login)"),
    (re.compile(r"\bgcloud\s+(auth\s+login|init)\b"), "requiere cuenta Google Cloud real"),
    (re.compile(r"\bdocker\s+login\b(?!.*\b(localhost|127\.0\.0\.1)[:/\s])"), "requiere cuenta de registro (docker login)"),
    (re.compile(r"(^|[;&|]\s*)(nano|vim?|code|emacs)\s"), "pide editar un archivo a mano"),
    (re.compile(r"(^|[;&|]\s*)read\s"), "es interactivo (read)"),
    (re.compile(r"\bcertbot\b"), "requiere dominio público y servidor (certbot)"),
]
SERVIDOR_RE = re.compile(
    r"^\s*(?:[A-Z_][A-Z0-9_]*=\S+\s+)*("
    r"node\s+(?:--\S+\s+)*\S*(?:server|servidor|app|index|api|main|gateway|backend|proxy|worker)\w*\.(?:m?js|cjs|ts)\b"
    r"|npm\s+(?:run\s+)?(?:start|dev|serve)\b|npx\s+(?:serve|http-server|vite)\b"
    r"|python3?\s+-m\s+http\.server\b|python3?\s+\S*(?:server|servidor|app|api)\w*\.py\b"
    r"|flask\s+run\b|uvicorn\b|gunicorn\b"
    r"|kubectl\s+port-forward\b|minikube\s+tunnel\b|kubectl\s+proxy\b"
    r"|docker\s+compose\s+up\b(?!.*(\s-d\b|--detach|--abort-on-container-exit|--exit-code-from|--wait))"
    r")")
SEGUIR_RE = re.compile(r"(\blogs\s+(?:\S+\s+)*(-f|--follow)\b|\btail\s+-f\b|^\s*watch\s|\s(-w|--watch)(\s|$)|\btop\b)")
FIN_HEREDOC_RE = re.compile(r"<<-?\s*(['\"]?)([A-Za-z_][\w]*)\1")


def quitar_comillas(s: str) -> str:
    s = re.sub(r"'[^']*'", "''", s)
    return re.sub(r'"(?:[^"\\]|\\.)*"', '""', s)


def palabras_comando(linea: str) -> list[str]:
    """Primeras palabras de cada comando de una línea lógica, fuera de comillas."""
    s = quitar_comillas(linea)
    s = re.sub(r"#.*$", "", s)
    out = []
    for parte in re.split(r"&&|\|\||[;|&(]|\$\(|`", s):
        toks = parte.strip().split()
        while toks and re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", toks[0]):
            toks.pop(0)
        while toks and toks[0] in ("time", "exec", "env", "!", "then", "do", "else", "{", "if", "while", "until"):
            toks.pop(0)
        if toks:
            out.append(toks[0])
    return out


def lineas_logicas(texto: str):
    """(índices de líneas físicas, texto unido) fuera de heredocs; los heredocs se saltan."""
    fis = texto.split("\n")
    i, res = 0, []
    while i < len(fis):
        idx = [i]
        acc = fis[i]
        while acc.endswith("\\") and i + 1 < len(fis):
            i += 1
            idx.append(i)
            acc = acc[:-1] + " " + fis[i].lstrip()
        res.append((idx, acc))
        m = FIN_HEREDOC_RE.search(quitar_comillas_heredoc(acc))
        i += 1
        if m:
            fin = m.group(2)
            while i < len(fis) and fis[i].strip() != fin:
                i += 1
            i += 1
    return res


def quitar_comillas_heredoc(s: str) -> str:
    # conserva <<'EOF' pero quita cadenas que no lo contienen
    return re.sub(r"\"[^\"<]*\"", '""', s)


# ---------------------------------------------------------------- segmentación
class Bloque:
    def __init__(self, leng, linea, texto, intro, despues):
        self.leng, self.linea, self.texto, self.intro, self.despues = leng, linea, texto, intro, despues


def parrafo_antes(lineas, i):
    """Párrafo inmediatamente anterior a la línea i (sin cruzar encabezados ni otros bloques)."""
    j = i - 1
    while j >= 0 and not lineas[j].strip():
        j -= 1
    par = []
    while j >= 0 and lineas[j].strip() and not lineas[j].startswith("```") and not lineas[j].startswith("#"):
        par.insert(0, lineas[j])
        j -= 1
    if not par and j >= 0 and lineas[j].startswith("####"):
        par = [lineas[j]]
    return " ".join(par)


def parrafo_despues(lineas, i):
    j = i + 1
    while j < len(lineas) and not lineas[j].strip():
        j += 1
    par = []
    while j < len(lineas) and lineas[j].strip() and not lineas[j].startswith("```") and not lineas[j].startswith("#"):
        par.append(lineas[j])
        j += 1
    return " ".join(par)


def segmentar(ruta: Path):
    lineas = ruta.read_text(encoding="utf-8").split("\n")
    segs, actual = [], None
    en_bloque, leng, ini, cuerpo = False, "", 0, []
    for i, l in enumerate(lineas):
        if l.startswith("```"):
            if not en_bloque:
                en_bloque, leng, ini, cuerpo = True, l[3:].strip().lower(), i, []
            else:
                en_bloque = False
                if actual is not None:
                    actual["bloques"].append(Bloque(leng, ini + 1, "\n".join(cuerpo),
                                                    parrafo_antes(lineas, ini), parrafo_despues(lineas, i)))
            continue
        if en_bloque:
            cuerpo.append(l)
            continue
        m = re.match(r"^(##|###) (.+)$", l)
        if m:
            actual = {"titulo": m.group(2).strip(), "nivel": len(m.group(1)), "linea": i + 1,
                      "bloques": [], "texto": []}
            segs.append(actual)
            continue
        if actual is not None:
            actual["texto"].append((i + 1, l))
    return segs


def nombre_unidad(titulo: str, usados: set) -> str:
    m = re.match(r"Tema (\d+)", titulo)
    if m:
        base = f"tema-{m.group(1)}"
    else:
        m = re.match(r"Laboratorio\s+([\d.]+)", titulo)
        if m:
            base = "lab-" + m.group(1).strip(".").replace(".", "-")
        else:
            slug = re.sub(r"[^a-z0-9]+", "-", titulo.lower()
                          .translate(str.maketrans("áéíóúñü", "aeiounu"))).strip("-")[:40]
            base = "sec-" + (slug or "x")
    n, k = base, 2
    while n in usados:
        n, k = f"{base}-{k}", k + 1
    usados.add(n)
    return n


# ---------------------------------------------------------------- transformación de bloques
def adaptar_bloque(texto: str, notas: list) -> str:
    """Ajustes mínimos para ejecutar sin terminal interactiva; no cambia la intención del bloque."""
    fis = texto.split("\n")
    sufijos = {}
    for idx, log in lineas_logicas(texto):
        sin = quitar_comillas(log).strip()
        if not sin or sin.startswith("#"):
            continue
        ult = idx[-1]
        if re.search(r"\b(docker|kubectl)\b", sin) and re.search(r"\s-(it|ti)\b", log):
            for k in idx:
                fis[k] = re.sub(r"(\s)-(it|ti)\b", r"\1-i", fis[k])
            notas.append("-it→-i (sin TTY)")
        if re.match(r"^\s*open\s+https?://", log):
            for k in idx:
                fis[k] = "# [kit] omitido (abre navegador): " + fis[k]
            continue
        if SERVIDOR_RE.search(sin) and not re.search(r"(?<!&)&\s*$", sin):
            sufijos[ult] = ' > "$__EST/servidor-$RANDOM.log" 2>&1 &\nsleep "${ESPERA_SERVIDOR:-5}"  # [kit] servidor en segundo plano'
            notas.append("servidor en segundo plano")
        elif re.search(r"(?<!&)&\s*$", sin):
            sufijos[ult] = '\nsleep "${ESPERA_SERVIDOR:-5}"  # [kit] espera al proceso en segundo plano'
        elif SEGUIR_RE.search(sin):
            sufijos[ult] = (' &\n__p=$!; sleep "${ESPERA_SEGUIR:-8}"; kill $__p 2>/dev/null; '
                            'wait $__p 2>/dev/null || true  # [kit] comando de seguimiento acotado')
            notas.append("seguimiento (-f/-w) acotado")
    for k, suf in sufijos.items():
        fis[k] = fis[k] + suf
    return "\n".join(fis)


def ruta_en(intro: str):
    rutas = [r for r in RUTA_RE.findall(intro) if "://" not in r]
    for m in reversed(list(CREAR_RE.finditer(intro))):
        tras = [r for r in RUTA_RE.findall(intro[m.end():]) if "://" not in r]
        if tras:
            return tras[0]
    return rutas[0] if rutas else None


def fragmentos_de(texto: str, codigo: str) -> list[str]:
    frs = []
    partes = texto.split("`")
    for f in partes[1:len(partes) - (len(partes) + 1) % 2:2]:
        f = f.strip()
        if not f or len(f) > 120 or "\n" in f:
            continue
        if PLACEHOLDER_RE.search(f) or len(f) < 3 or "…" in f or "..." in f:
            continue
        if f in codigo:  # es un comando o un nombre que aparece en el código, no salida
            continue
        if RUTA_RE.fullmatch("`" + f + "`") or ".exe" in f or re.match(r"^[A-Z][a-z]+-[A-Z]\w+", f):
            continue
        if f.split()[0] in HERRAMIENTAS or f.split()[0] in ("cd", "ls", "cat", "echo", "export", "eval", "mkdir"):
            continue
        frs.append(f)
    return frs


# ---------------------------------------------------------------- unidad
def procesar(curso: str, md: Path, seg: dict, nombre: str, modulo_meta: dict):
    origen = f"{curso}/{md.name}:{seg['linea']}"
    pasos, skip, notas = [], [], []
    herramientas, archivos, bloques_sh = set(), [], []
    codigo_total = "\n".join(b.texto for b in seg["bloques"])
    terminal = [b for b in seg["bloques"] if b.leng in LENG_TERMINAL]
    # «Ejecuta `node x.mjs`» en el texto, tras crear x.mjs: también es un paso de la demostración.
    nombres = {Path(r).name for b in seg["bloques"] if b.leng not in LENG_TERMINAL for r in RUTA_RE.findall(b.intro)}
    extra = []
    for ln, t in seg["texto"]:
        for m in INLINE_RE.finditer(t):
            if Path(m.group(2)).name in nombres:
                extra.append(Bloque("bash", ln, m.group(1), "", t[m.end():]))
                notas.append(f"`{m.group(1)}` (línea {ln}) se toma del texto")
    seg = dict(seg, bloques=sorted(seg["bloques"] + extra, key=lambda b: b.linea))
    diferidos = {}
    parcial = ""
    n = 0
    for b in seg["bloques"]:
        leng = b.leng
        if leng in LENG_IGNORADOS and leng != "error-output":
            continue
        if leng == "error-output":
            continue
        primera = next((x for x in b.texto.split("\n") if x.strip()), "")
        m_arch = re.match(r"^\s*(?:#|//)\s*archivo:\s*([\w./-]+)", primera)
        m_coment = RUTA_COMENTARIO_RE.match(primera)
        ruta = ruta_en(b.intro)
        if m_coment and leng not in LENG_TERMINAL:
            ruta = m_coment.group(1)
        es_terminal = leng in LENG_TERMINAL
        crea_heredoc = es_terminal and re.search(r"(cat|tee)\s+(-a\s+)?>?\s*[\w./-]+\s*<<", primera)
        # ¿El bloque es el contenido de un archivo?
        archivo = None
        if m_arch:
            archivo = m_arch.group(1)
        elif es_terminal:
            if ruta and re.search(r"\.(sh|bash)$", ruta) and CREAR_RE.search(b.intro) and not crea_heredoc \
                    and (primera.startswith("#!") or re.search(r"^\s*set -", b.texto, re.M) or
                         not re.search(r"\b(bash|sh|chmod)\s+\S*" + re.escape(Path(ruta).name), b.texto)):
                archivo = ruta
        elif leng in LENG_ARCHIVO:
            if m_coment and not (EDITAR_RE.search(b.intro) and not CREAR_RE.search(b.intro)):
                archivo = ruta
            elif ruta and (CREAR_RE.search(b.intro) or CONTENIDO_COMPLETO_RE.search(b.intro)):
                archivo = ruta
            elif not ruta and not EDITAR_RE.search(b.intro):
                notas.append(f"bloque {leng} de la línea {b.linea} sin nombre de archivo: no se crea (revisar si hace falta)")
                continue
            elif EDITAR_RE.search(b.intro) or re.search(r"^\s*(\.\.\.|…|//\s*\.\.\.|#\s*\.\.\.)\s*$", b.texto, re.M):
                motivo = f"edición parcial de un archivo (línea {b.linea}): la lección muestra solo un fragmento"
                if any(p.startswith("__bloque") for p in pasos):
                    parcial = f"verificado hasta la línea {b.linea}; desde ahí la lección pide editar un archivo a mano"
                    break
                skip.append(motivo)
                break
            elif ruta and EXTRACTO_RE.search(b.intro):
                notas.append(f"bloque {leng} de la línea {b.linea} es un extracto de `{ruta}`: no se crea")
                continue
            elif ruta:
                archivo = ruta
            else:
                notas.append(f"bloque {leng} de la línea {b.linea} sin nombre de archivo: no se crea (revisar si hace falta)")
                continue
        else:
            notas.append(f"bloque «{leng}» en línea {b.linea} no se ejecuta")
            continue

        if archivo:
            if re.search(r"^\s*(\.\.\.|…)\s*$", b.texto, re.M):
                if any(p.startswith("__bloque") for p in pasos):
                    parcial = f"verificado hasta la línea {b.linea}; `{archivo}` está incompleto («...»)"
                else:
                    skip.append(f"archivo incompleto `{archivo}` (línea {b.linea}): contiene «...»")
                break
            n += 1
            nom = f"{n:02d}-{Path(archivo).name}"
            archivos.append((nom, b.texto + ("\n" if not b.texto.endswith("\n") else "")))
            dentro = DENTRO_RE.search(b.intro)
            base = Path(archivo).name
            usado_luego = any(re.search(r"(bash|sh|source|\.)\s+(\S*/)?" + re.escape(base) + r"\b", x.texto)
                              for x in terminal if x.linea > b.linea or (m_arch and x.linea != b.linea))
            if m_arch and es_terminal and not usado_luego:
                # «Practícalo tú» que ningún otro bloque invoca: se ejecuta tal cual.
                pass
            elif m_arch:
                diferidos[base] = nom
                pasos.append(f"__diferido {nom} {base}")
                continue
            else:
                pasos.append(f"__archivo {nom} '{archivo}' '{dentro.group(1) if dentro else ''}'"
                             f"  # línea {b.linea}")
                if not es_terminal:
                    continue
                continue
        # «Ejecuta el ejemplo: bash ejemplo.sh» → el bloque de terminal anterior es ejemplo.sh
        m_ej = re.fullmatch(r"\s*(?:bash|sh)\s+([\w.-]+\.sh)\s*", b.texto)
        if m_ej and m_ej.group(1) not in diferidos and not any(a.endswith("-" + m_ej.group(1)) for a, _ in archivos) \
                and pasos and pasos[-1].startswith("__bloque") and bloques_sh:
            nb_prev, texto_prev, _ = bloques_sh.pop()
            pasos.pop()
            nom = f"{nb_prev}-{m_ej.group(1)}"
            archivos.append((nom, texto_prev + "\n"))
            diferidos[m_ej.group(1)] = nom
            pasos.append(f"__diferido {nom} {m_ej.group(1)}")
            notas.append(f"el bloque anterior a «bash {m_ej.group(1)}» se guarda como {m_ej.group(1)}")
        # bloque de terminal
        for idx, log in lineas_logicas(b.texto):
            sin = quitar_comillas(log)
            for w in palabras_comando(log):
                w2 = w.split("/")[-1]
                if w2 in SKIP_COMANDO:
                    skip.append(f"{SKIP_COMANDO[w2]} (línea {b.linea + 1 + idx[0]})")
                if w2 in HERRAMIENTAS:
                    herramientas.add(w2)
            for pat, motivo in SKIP_PATRONES:
                if pat.search(log):
                    skip.append(f"{motivo} (línea {b.linea + 1 + idx[0]})")
            for ph in PLACEHOLDER_RE.findall(sin):
                if ph.lower() not in TAGS_HTML:
                    skip.append(f"marcador `<{ph}>` para completar a mano (línea {b.linea + 1 + idx[0]})")
        n += 1
        nb = f"{n:02d}"
        modo = "fallo" if (FALLO_RE.search(b.intro) or FALLO_DESPUES_RE.search(b.despues[:300])) else "normal"
        adaptado = adaptar_bloque(b.texto, notas)
        bloques_sh.append((nb, adaptado, fragmentos_de(b.despues, codigo_total) if modo == "fallo" else []))
        pasos.append(f"__bloque {nb} {b.linea} {modo}")

    if not pasos or not any(p.startswith("__bloque") for p in pasos):
        if not pasos and not skip:
            return None
        if not skip:
            skip.append("solo crea archivos; no hay órdenes que ejecutar en la lección")

    for nom, contenido in archivos:  # scripts que la lección manda guardar y ejecutar
        if nom.endswith((".sh", ".bash")):
            for _, log in lineas_logicas(contenido):
                herramientas.update(w for w in palabras_comando(log) if w in HERRAMIENTAS)
    texto = "\n".join(t for _, t in seg["texto"])
    textos_todos = texto + "\n" + codigo_total
    # Terraform: proveedores de nube real sin endpoint local
    tf = "\n".join(c for nom, c in archivos if nom.endswith(".tf"))
    if "terraform" in herramientas or "tofu" in herramientas:
        for prov in ("azurerm", "google"):
            if re.search(r'provider\s+"' + prov + '"', tf) and not re.search(r"localhost|127\.0\.0\.1|endpoint", tf):
                skip.append(f"Terraform con proveedor {prov} contra la nube real")
    # Floci
    usa_aws = re.search(r"(^|[\s;&|(])aws\s", codigo_total, re.M) or "4566" in codigo_total \
        or re.search(r"@aws-sdk|boto3", codigo_total)
    usa_az = re.search(r"(^|[\s;&|(])az\s", codigo_total, re.M) or "4577" in codigo_total
    usa_gcp = re.search(r"(^|[\s;&|(])gcloud\s", codigo_total, re.M) or "4588" in codigo_total
    propio = bool(re.search(r"4566:4566|FlociContainer", codigo_total))
    crea_compose = any(re.search(r"(compose|docker-compose)\.ya?ml$", a) for a, _ in archivos) or \
        bool(re.search(r"(cat|tee)\s+>?\s*\S*(compose|docker-compose)\.ya?ml", codigo_total))
    compose_raiz = not crea_compose and bool(re.search(r"docker\s+compose\b[^\n]*\b(aws-local|azure-local|gcp-local|stackport)\b",
                                  codigo_total)) or (
        re.search(r"docker\s+compose\s+(ps|config|up|down)", codigo_total) is not None
        and not any(re.search(r"(compose|docker-compose)\.ya?ml$", a) for a, _ in archivos)
        and not re.search(r"(compose|docker-compose)\.ya?ml", " ".join(b.texto for b in terminal if "<<" in b.texto))
        and re.search(r"raíz|The_Imperial_Book|del proyecto", texto) is not None)
    if propio:
        floci = "propio"
    elif modulo_meta["cli"] and (usa_aws or "floci" in herramientas):
        floci = "cli"
    elif usa_aws or usa_az or usa_gcp:
        floci = "compose"
    else:
        floci = "ninguno"
    if "pip" in herramientas or "pip3" in herramientas:
        notas.append("pip se ejecuta dentro de un entorno virtual del kit")
    kind = "kind" in herramientas or "kubectl" in herramientas
    depende = bool(re.search(r"Continuando|Continúa en|continúa en|del tema anterior|en la carpeta del Tema", texto)) or bool(re.search(r"Temas?\s[\d, y-]+(de este módulo|del Tema)|del Tema \d|Tema \d+ de este módulo",
                             texto)) or bool(re.search(r"\bdel Tema \d", textos_todos))
    timeout = 1500 if kind or "terraform" in herramientas else 900
    esperado = []
    for ln, t in seg["texto"]:
        if ESPERADO_RE.search(t):
            esperado.append(f"{curso}/{md.name}:{ln}: {t.strip()}")
    for b in seg["bloques"]:
        if b.leng == "error-output":
            esperado.append(f"{curso}/{md.name}:{b.linea} (error-output):\n{b.texto}")
    frags = []
    for ln, t in seg["texto"]:
        if FRAGMENTO_RE.search(t):
            for f in fragmentos_de(t, codigo_total):
                if f not in frags:
                    frags.append(f)

    return {
        "origen": origen, "pasos": pasos, "bloques": bloques_sh, "archivos": archivos,
        "skip": list(dict.fromkeys(skip)), "notas": list(dict.fromkeys(notas)), "herramientas": sorted(herramientas),
        "floci": floci, "aws": bool(usa_aws), "az": bool(usa_az), "gcp": bool(usa_gcp),
        "compose_raiz": compose_raiz, "kind": kind, "depende": depende, "timeout": timeout,
        "esperado": esperado, "fragmentos": frags, "titulo": seg["titulo"], "parcial": parcial,
    }


def sh_q(s: str) -> str:
    return "'" + s.replace("'", "'\\''") + "'"


def escribir(curso, modulo, nombre, u):
    d = BUILD / curso / modulo / nombre
    (d / "bloques").mkdir(parents=True, exist_ok=True)
    (d / "archivos").mkdir(exist_ok=True)
    (d / "origen.txt").write_text(u["origen"] + "\n" + u["titulo"] + "\n", encoding="utf-8")
    (d / "esperado.txt").write_text("\n".join(u["esperado"]) + ("\n" if u["esperado"] else ""), encoding="utf-8")
    (d / "fragmentos.txt").write_text("".join(f + "\n" for f in u["fragmentos"]), encoding="utf-8")
    for nb, texto, frs in u["bloques"]:
        (d / "bloques" / f"{nb}.sh").write_text(texto + "\n", encoding="utf-8")
        if frs:
            (d / "bloques" / f"{nb}.esperado").write_text("".join(f + "\n" for f in frs), encoding="utf-8")
    for nom, contenido in u["archivos"]:
        (d / "archivos" / nom).write_text(contenido, encoding="utf-8")
    meta = {
        "ORIGEN": u["origen"], "SKIP": " · ".join(u["skip"]), "NOTAS": " · ".join(u["notas"]),
        "HERRAMIENTAS": " ".join(u["herramientas"]), "FLOCI": u["floci"],
        "USA_AWS": int(u["aws"]), "USA_AZ": int(u["az"]), "USA_GCP": int(u["gcp"]),
        "COMPOSE_RAIZ": int(u["compose_raiz"]), "KUBE": int(u["kind"]), "DEPENDE": int(u["depende"]),
        "TIMEOUT": u["timeout"], "PARCIAL": u["parcial"],
    }
    (d / "meta.sh").write_text("".join(f"{k}={sh_q(str(v))}\n" for k, v in meta.items()), encoding="utf-8")
    cuerpo = "\n".join(u["pasos"])
    (d / "pasos.sh").write_text(
        "#!/usr/bin/env bash\n"
        f"# Generado por extraer.py desde {u['origen']} — {u['titulo']}\n"
        "# Se ejecuta con run.sh (define KIT_DIR, UNIDAD, TRABAJO y __EST).\n"
        '. "$KIT_DIR/lib/motor.sh"\n'
        "__inicio\n" + cuerpo + "\n__fin\n", encoding="utf-8")
    (d / "pasos.sh").chmod(0o755)


def main():
    if BUILD.exists():
        shutil.rmtree(BUILD)
    BUILD.mkdir()
    indice, total, skips = [], 0, 0
    motivos = {}
    for curso in CURSOS:
        mds = sorted((CONTENIDO / curso).glob("modulo-*.md"), key=lambda p: int(re.findall(r"\d+", p.stem)[0]))
        for md in mds:
            modulo = md.stem
            segs = segmentar(md)
            todo = "\n".join(b.texto for s in segs for b in s["bloques"] if b.leng in LENG_TERMINAL)
            modulo_meta = {"cli": bool(re.search(r"(^|[\s;&|])floci\s+start\b", todo, re.M))}
            usados = set()
            for seg in segs:
                if not any(b.leng in LENG_TERMINAL or b.leng in LENG_ARCHIVO for b in seg["bloques"]):
                    continue
                nombre = nombre_unidad(seg["titulo"], usados)
                u = procesar(curso, md, seg, nombre, modulo_meta)
                if u is None:
                    continue
                escribir(curso, modulo, nombre, u)
                total += 1
                if u["skip"]:
                    skips += 1
                    for s in u["skip"]:
                        clave = re.sub(r"\s*\(línea.*?\)|`[^`]*`|línea \d+", "", s).strip(" :")
                        motivos[clave] = motivos.get(clave, 0) + 1
                indice.append(f"{curso}\t{modulo}\t{nombre}\t{u['origen']}\t{u['floci']}\t"
                              f"{'SKIP' if u['skip'] else 'EJECUTAR'}\t{' · '.join(u['skip'])}")
    (BUILD / "indice.tsv").write_text("curso\tmodulo\tunidad\torigen\tfloci\tplan\tmotivo\n" +
                                      "\n".join(indice) + "\n", encoding="utf-8")
    (BUILD / "resumen.json").write_text(json.dumps({"unidades": total, "skip": skips, "motivos": motivos},
                                                   ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"unidades: {total}  ejecutables: {total - skips}  skip (estático): {skips}")
    for k, v in sorted(motivos.items(), key=lambda x: -x[1]):
        print(f"  {v:4d}  {k}")
    print(f"índice: {BUILD / 'indice.tsv'}")


if __name__ == "__main__":
    sys.exit(main())
