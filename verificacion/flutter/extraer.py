#!/usr/bin/env python3
"""Extrae el código Dart/Flutter de las lecciones a proyectos verificables (specs/019).

Fuentes:
  - web/public/content/flutter/modulo-*.md   (todo bloque ```dart)
  - web/public/content/rutaflow/modulo-*.md  (temas Flutter: bloques ```dart)
  - examples/flutter_rutaflow                (laboratorio completo, se copia tal cual)

Salida en verificacion/flutter/build/:
  <unidad>/unidad.env        variables que lee run.sh (TIPO, PLANTILLA, PROYECTO, ...)
  <unidad>/origen.txt        curso/modulo-N.md:LÍNEA <TAB> ruta escrita en el proyecto
  <unidad>/dependencias.txt  argumentos de cada `flutter|dart pub add` de la lección
  <unidad>/esperado.txt      líneas que `dart run` debe imprimir (si la lección las promete)
  <unidad>/archivos/...      lib/, test/, bin/... tal como la lección manda crearlos
  omitidos.tsv               bloques SKIP con su motivo (run.sh los copia a resultados.tsv)
  unidades.txt               índice de unidades

Uso: python3 verificacion/flutter/extraer.py [--listar]
Solo biblioteca estándar de Python 3.
"""
from __future__ import annotations

import re
import shlex
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path

KIT = Path(__file__).resolve().parent
REPO = KIT.parents[1]
CONTENT = REPO / "web" / "public" / "content"
LAB = REPO / "examples" / "flutter_rutaflow"
BUILD = KIT / "build"

CURSOS = ("flutter", "rutaflow")
LANGS_CODIGO = {"dart"}
LANGS_ARCHIVO = {"dart", "yaml", "json", "text"}  # no-dart solo si la lección les da ruta
EXT_TEXTO = (".routes",)  # entradas de builders en bloques ```text
RAICES = ("lib", "test", "bin", "integration_test", "example", "tool")
NOMBRES_GENERICOS = {"demo_flutter", "app", "ejemplo", "mi_primera_app", "demo_driver"}
PAQUETES_SDK = {"flutter", "flutter_test", "flutter_driver", "flutter_localizations",
                "flutter_web_plugins", "integration_test"}

RE_FENCE = re.compile(r"^```(\w*)\s*$")
RE_HEADING = re.compile(r"^(#{2,3})\s+(.*)")
RE_RUTA = re.compile(r"^(?:[\w.-]+/)*[\w.-]+\.(?:dart|yaml|arb|json|routes)$")
RE_COMENTARIO_RUTA = re.compile(
    r"^\s*//\s*((?:[\w.-]+/)*[\w.-]+\.(?:dart|yaml|arb))(?:\s*$|\s+[(—–-].*$|\s*:.*$)")
RE_COMENTARIO_RUTA_YAML = re.compile(r"^\s*#\s*((?:[\w.-]+/)*[\w.-]+\.yaml)\s*$")
RE_BACKTICK = re.compile(r"`([^`]+)`")
RE_HEREDOC = re.compile(r"cat\s*>\s*(\S+\.dart)\s*<<-?\s*'?\"?(\w+)'?\"?")
RE_PUB_ADD = re.compile(r"\b(flutter|dart) pub add ([^`\n#]+)")
RE_CREATE = re.compile(r"\b(flutter|dart) create\b([^`\n;&|]*)")
RE_MAIN = re.compile(r"^(?:void|Future<void>|int)\s+main\s*\(", re.M)
RE_IMPORT = re.compile(r"^\s*(?:import|export|part)\s+'([^']+)'", re.M)
RE_PKG_IMPORT = re.compile(r"^\s*(?:import|export)\s+'package:([\w]+)/", re.M)

# ---------------------------------------------------------------------------
# Decisiones manuales: lo que el texto de la lección dice en prosa y no se puede
# deducir con reglas. Clave: "curso/modulo-N.md#comienzo del bloque" (no el número de línea, que
# cambia al editar la lección).
#   ruta      -> archivo destino dentro del proyecto
#   proyecto  -> nombre del proyecto (y del paquete)
#   tipo      -> "dart" o "flutter"; plantilla -> plantilla de create
#   deps      -> lista de argumentos extra para `pub add`
#   skip      -> motivo para no compilar el bloque
# ---------------------------------------------------------------------------
DECISIONES: dict[str, dict] = {
    # «guarda el contenido de `cliente.dart` en `bin/cliente_posiciones.dart`» (prosa posterior)
    "rutaflow/modulo-5.md#import 'package:socket_io_client/socket_io_client.dart' as io;": {"ruta": "bin/cliente_posiciones.dart", "proyecto": "cliente_posiciones",
                                 "tipo": "dart", "plantilla": "console"},
    # Extractos del formulario (Tema «formularios»): la lección explica cada archivo por partes y no
    # muestra sus imports ni `delivery_issue_repository.dart`/`report_issue.dart` del árbol que propone.
    "flutter/modulo-4.md#enum SubmitStatus {": {"skip": "extracto de issue_form_state.dart sin imports (la lección lo "
                                        "explica por partes; no es el archivo completo)"},
    "flutter/modulo-4.md#final class IssueFormNotifier": {"skip": "extracto de issue_form_notifier.dart sin imports y con "
                                        "deliveryIssueRepositoryProvider, que la lección no define"},
    # El test de route_labels no lleva ruta en la línea previa: la prosa dice `test/route_labels_test.dart`.
    "flutter/modulo-17.md#import 'package:test/test.dart';\nimport 'package:route_labels/": {"ruta": "test/route_labels_test.dart"},
}

# Fallos deliberados con código (misma clave): qué etapa debe fallar y con qué texto (regex sobre el log).
# Sin entrada aquí, un bloque de fallo deliberado queda SKIP con motivo.
FALLOS: dict[str, dict] = {
    # Paso 4 Tema 1: la versión acoplada de ListaEnvios ya no recibe repositorio y
    # verificar.dart deja de compilar porque todavía llama ListaEnvios(repo).
    "rutaflow/modulo-4.md#// lib/features/entrega/presentation/lista_envios.dart (versión acoplada)": {"etapa": "analyze",
                                 "patron": r"extra_positional_arguments|[Tt]oo many positional arguments"},
    # Tema 3: sin el filtro `sincronizado = 0` la prueba cuenta 2 llamadas y esperaba 1.
    "rutaflow/modulo-4.md#Future<void> sincronizar(": {"etapa": "test", "patron": r"Expected: <1>"},
    # Tema 2: el fallo prometido es una excepción en un emulador con permiso deniedForever.
    "rutaflow/modulo-4.md#Future<void> asegurarPermisoIngenuo(": {"skip": "fallo deliberado solo observable en un emulador con permiso "
                                         "deniedForever (no hay dispositivo en esta verificación)"},
}


def buscar(tabla: dict[str, dict], b: "Bloque") -> dict | None:
    """Entrada de DECISIONES/FALLOS cuyo archivo coincide y cuyo prefijo abre el bloque."""
    inicio = "\n".join(b.cuerpo[:3])
    for clave, valor in tabla.items():
        archivo, _, prefijo = clave.partition("#")
        if archivo == f"{b.curso}/{b.modulo}" and inicio.startswith(prefijo):
            return valor
    return None


@dataclass
class Bloque:
    curso: str
    modulo: str
    linea: int            # línea (1-based) de la valla de apertura
    lang: str
    cuerpo: list[str]
    intro: str            # párrafo inmediatamente anterior
    tema: int
    desde_heredoc: str = ""

    @property
    def origen(self) -> str:
        return f"{self.curso}/{self.modulo}:{self.linea}"


@dataclass
class Tema:
    curso: str
    modulo: str
    indice: int
    titulo: str
    inicio: int
    lineas: list[str] = field(default_factory=list)
    bloques: list[Bloque] = field(default_factory=list)


@dataclass
class Unidad:
    nombre: str
    curso: str
    proyecto: str
    tipo: str = "flutter"
    plantilla: str = "app"
    archivos: dict[str, str] = field(default_factory=dict)
    origenes: dict[str, str] = field(default_factory=dict)  # ruta -> origen
    deps: list[str] = field(default_factory=list)
    implicitas: list[str] = field(default_factory=list)
    esperado: list[str] = field(default_factory=list)
    ejecutar: str = ""
    espera_fallo: str = ""
    patron_fallo: str = ""
    generate: bool = False
    args_test: str = ""
    completo: str = ""
    nota: str = ""


def numero_modulo(p: Path) -> int:
    return int(re.search(r"(\d+)", p.stem).group(1))


def leer_temas(curso: str, md: Path) -> list[Tema]:
    lineas = md.read_text(encoding="utf-8").split("\n")
    temas = [Tema(curso, md.name, 0, "(preámbulo)", 1)]
    i = 0
    parrafo: list[str] = []
    anterior: list[str] = []  # último párrafo cerrado por una línea en blanco
    while i < len(lineas):
        linea = lineas[i]
        h = RE_HEADING.match(linea)
        m = RE_FENCE.match(linea)
        if h:
            temas.append(Tema(curso, md.name, len(temas), h.group(2).strip(), i + 1))
            temas[-1].lineas.append(linea)
            parrafo, anterior = [], []
            i += 1
            continue
        if m:
            lang = m.group(1)
            j = i + 1
            while j < len(lineas) and not lineas[j].startswith("```"):
                j += 1
            cuerpo = lineas[i + 1:j]
            tema = temas[-1]
            tema.lineas.extend(lineas[i:j + 1])
            intro = " ".join(parrafo or anterior)
            if lang in LANGS_ARCHIVO:
                tema.bloques.append(Bloque(curso, md.name, i + 1, lang, cuerpo, intro, tema.indice))
            if lang in ("bash", "sh", "zsh", ""):
                # Archivos .dart creados con heredoc dentro de un bloque de shell.
                k = 0
                while k < len(cuerpo):
                    hd = RE_HEREDOC.search(cuerpo[k])
                    if hd:
                        fin = k + 1
                        while fin < len(cuerpo) and cuerpo[fin].strip() != hd.group(2):
                            fin += 1
                        b = Bloque(curso, md.name, i + 2 + k, "dart", cuerpo[k + 1:fin], intro, tema.indice,
                                   desde_heredoc=hd.group(1))
                        tema.bloques.append(b)
                        k = fin
                    k += 1
            parrafo, anterior = [], []
            i = j + 1
            continue
        temas[-1].lineas.append(linea)
        if linea.strip():
            parrafo.append(linea.strip())
        elif parrafo:
            anterior, parrafo = parrafo, []
        i += 1
    return temas


def rutas_en_texto(texto: str) -> list[str]:
    rutas = []
    for t in RE_BACKTICK.findall(texto):
        t = t.strip()
        if t.startswith("package:") or " " in t:
            continue
        if RE_RUTA.match(t):
            rutas.append(t)
    return rutas


def partir_por_comentarios(b: Bloque) -> list[tuple[str | None, list[str]]]:
    """Separa un bloque con varios archivos marcados por `// lib/x.dart`."""
    partes: list[tuple[str | None, list[str]]] = []
    actual: str | None = None
    buf: list[str] = []
    patron = RE_COMENTARIO_RUTA if b.lang == "dart" else RE_COMENTARIO_RUTA_YAML
    for n, linea in enumerate(b.cuerpo):
        m = patron.match(linea)
        if m and (n == 0 or "/" in m.group(1)):
            if buf and any(x.strip() for x in buf):
                partes.append((actual, buf))
            actual, buf = m.group(1), [linea]
            continue
        buf.append(linea)
    if buf:
        partes.append((actual, buf))
    return partes


def parse_create(texto: str) -> list[tuple[str, str, str]]:
    """Devuelve (herramienta, plantilla, nombre) por cada `flutter|dart create`."""
    res = []
    for m in RE_CREATE.finditer(texto):
        herr = m.group(1)
        toks = m.group(2).split()
        plantilla = "app" if herr == "flutter" else "console"
        nombre = None
        k = 0
        while k < len(toks):
            t = toks[k].strip("`")
            if t in ("-t", "--template"):
                if k + 1 < len(toks):
                    plantilla = toks[k + 1].strip("`")
                k += 2
                continue
            if t.startswith("--template="):
                plantilla = t.split("=", 1)[1]
            elif t.startswith("-"):
                pass
            else:
                nombre = t
                break
            k += 1
        if nombre and re.fullmatch(r"[a-z_][a-z0-9_]*", nombre):
            res.append((herr, plantilla, nombre))
    return res


def parse_deps(texto: str) -> list[str]:
    """Cada paquete de `flutter|dart pub add ...` como argumento listo para `pub add`."""
    deps = []
    for m in RE_PUB_ADD.finditer(texto):
        args = m.group(2).strip().rstrip(".,;:)")
        args = re.split(r"\s+(?:&&|\|\||;)\s*|\s+y\s+", args)[0].strip()
        try:
            toks = shlex.split(args)
        except ValueError:
            toks = args.split()
        dev = "--dev" in toks or "-d" in toks
        sdk = next((t for t in toks if t.startswith("--sdk")), None)
        for t in toks:
            if t.startswith("-"):
                continue
            nombre = t.strip("`")
            if not re.fullmatch(r"(dev:)?[a-z_][a-z0-9_]*(:.+)?", nombre):
                continue
            if sdk:
                deps.append(f"{nombre}\t{sdk}")
            elif dev and not nombre.startswith("dev:"):
                deps.append(f"dev:{nombre}")
            else:
                deps.append(nombre)
    vistos, unicos = set(), []
    for d in deps:
        if d not in vistos:
            vistos.add(d)
            unicos.append(d)
    return unicos


def nombre_dep(d: str) -> str:
    return d.split("\t")[0].removeprefix("dev:").split(":")[0]


RE_DECL = re.compile(
    r"^(?:import|export|part|library|@|class|abstract|sealed|final|base|interface|mixin|enum|extension|"
    r"typedef|const|var|late|external|void|dynamic|\}|\)|\]|;|\(.*\)\??\s+\w+\s*(?:\(|=)|"
    r"[A-Za-z_][\w.]*(?:<[^=;{]*>)?\??\s+(?:get\s+)?[A-Za-z_]\w*\s*(?:\(|=|;|=>|\{))")


def es_archivo_completo(lineas: list[str]) -> bool:
    """Todas las líneas de nivel superior son declaraciones (no sentencias sueltas)."""
    en_cadena = False
    hay = False
    for l in lineas:
        if l.count("'''") % 2 == 1 or l.count('"""') % 2 == 1:
            en_cadena = not en_cadena
            continue
        if en_cadena or not l.strip() or l.startswith((" ", "\t")) or l.lstrip().startswith(("//", "/*", "*")):
            continue
        hay = True
        if not RE_DECL.match(l):
            return False
    return hay


def es_fallo_deliberado(b: Bloque) -> bool:
    return "fallo deliberado" in b.intro.lower()


def normalizar_ruta(ruta: str) -> tuple[str | None, str]:
    """('proyecto' o None, ruta relativa a la raíz del proyecto)."""
    partes = ruta.split("/")
    for k, p in enumerate(partes):
        if p in RAICES:
            pref = partes[:k]
            proyecto = pref[-1] if pref and re.fullmatch(r"[a-z_][a-z0-9_]*", pref[-1]) else None
            return proyecto, "/".join(partes[k:])
    return None, ruta


def resolver_imports(u: Unidad, ruta: str, vistos: set[str] | None = None) -> set[str]:
    """Archivos de la unidad alcanzables desde `ruta` (imports relativos y package:<proyecto>/)."""
    vistos = vistos if vistos is not None else set()
    if ruta in vistos or ruta not in u.archivos:
        return vistos
    vistos.add(ruta)
    base = Path(ruta).parent
    for imp in RE_IMPORT.findall(u.archivos[ruta]):
        if imp.startswith("dart:"):
            continue
        if imp.startswith("package:"):
            pkg, _, resto = imp[len("package:"):].partition("/")
            if pkg == u.proyecto:
                resolver_imports(u, f"lib/{resto}", vistos)
            continue
        destino = str((base / imp)).replace("\\", "/")
        destino = str(Path(destino)).replace("\\", "/")
        # normaliza ../
        partes: list[str] = []
        for p in destino.split("/"):
            if p == "..":
                if partes:
                    partes.pop()
            elif p != ".":
                partes.append(p)
        resolver_imports(u, "/".join(partes), vistos)
    return vistos


def faltantes(u: Unidad) -> list[str]:
    """Imports relativos o del propio paquete que la lección no incluye (excepto *.g.dart y l10n)."""
    faltan = []
    for ruta, texto in u.archivos.items():
        if not ruta.endswith(".dart"):
            continue
        base = Path(ruta).parent
        for imp in RE_IMPORT.findall(texto):
            if imp.startswith("dart:"):
                continue
            if imp.startswith("package:"):
                pkg, _, resto = imp[len("package:"):].partition("/")
                if pkg != u.proyecto:
                    continue
                destino = f"lib/{resto}"
            else:
                partes: list[str] = []
                for p in (str(base) + "/" + imp).split("/"):
                    if p == "..":
                        if partes:
                            partes.pop()
                    elif p not in (".", ""):
                        partes.append(p)
                destino = "/".join(partes)
            if destino.endswith((".g.dart", ".freezed.dart")) or "/l10n/" in destino \
                    or destino.endswith("app_localizations.dart"):
                continue
            if u.plantilla != "app" and destino not in u.archivos:
                # Plantillas de dart create / package generan lib/<proyecto>.dart y similares.
                if destino in (f"lib/{u.proyecto}.dart", f"lib/src/{u.proyecto}_base.dart",
                               f"lib/{u.proyecto}_bindings_generated.dart"):
                    continue
            if destino not in u.archivos:
                faltan.append(f"{ruta} importa {imp}")
    return faltan


def paquetes_importados(u: Unidad) -> set[str]:
    pk = set()
    for ruta, texto in u.archivos.items():
        if ruta.endswith(".dart"):
            pk.update(RE_PKG_IMPORT.findall(texto))
    return pk - PAQUETES_SDK - {u.proyecto}


def importa_flutter(u: Unidad, ruta: str) -> bool:
    for r in resolver_imports(u, ruta):
        if re.search(r"'package:flutter(_test)?/|'dart:ui'", u.archivos.get(r, "")):
            return True
    return False


def esperado_tras(tema: Tema, b_linea: int, ruta_main: str, proyecto: str) -> tuple[str, list[str]]:
    """Busca `dart run`/`dart <archivo>` posterior al bloque y la salida prometida."""
    texto = "\n".join(tema.lineas)
    # Inline: Ejecuta `dart lib/x.dart`. **Resultado esperado:** `texto`
    m = re.search(r"`dart (?:run )?([\w/.-]+\.dart)`[^\n]*?Resultado esperado:\*\*\s*`([^`]+)`", texto)
    if m and m.group(1).endswith(ruta_main.split("/")[-1]):
        return ruta_main, [m.group(2)]
    # Bloque ```text tras «Resultado esperado» después de un bloque bash con `dart run`.
    lineas = tema.lineas
    for k, l in enumerate(lineas):
        if re.match(r"^\s*dart run\s*$", l) or re.match(rf"^\s*dart run\s+{re.escape(ruta_main)}\s*$", l):
            for q in range(k + 1, min(k + 25, len(lineas))):
                if "Resultado esperado" in lineas[q]:
                    for r in range(q + 1, min(q + 6, len(lineas))):
                        if lineas[r].startswith("```text"):
                            fin = r + 1
                            salida = []
                            while fin < len(lineas) and not lineas[fin].startswith("```"):
                                salida.append(lineas[fin])
                                fin += 1
                            return ruta_main, [s for s in salida if s.strip()]
                    break
    return "", []


def reemplazar_miembro(texto: str, nuevo: str) -> str | None:
    """Reemplaza la declaración cuyo nombre coincide con la primera línea de `nuevo`."""
    m = re.match(r"\s*(?:[\w<>,? ]+\s+)?(\w+)\s*\(", nuevo)
    if not m:
        return None
    nombre = m.group(1)
    lineas = texto.split("\n")
    for k, l in enumerate(lineas):
        if re.search(rf"\b{re.escape(nombre)}\s*\(", l) and "{" in l and not l.strip().startswith("//") \
                and not re.search(rf"\.\s*{re.escape(nombre)}\s*\(", l) and "await" not in l:
            prof = 0
            for fin in range(k, len(lineas)):
                prof += lineas[fin].count("{") - lineas[fin].count("}")
                if prof == 0 and fin >= k:
                    sangria = re.match(r"\s*", l).group(0)
                    reemplazo = [sangria + x if x.strip() else x for x in nuevo.rstrip("\n").split("\n")]
                    return "\n".join(lineas[:k] + reemplazo + lineas[fin + 1:])
    return None


def construir() -> tuple[list[Unidad], list[tuple[str, str, str]]]:
    unidades: list[Unidad] = []
    omitidos: list[tuple[str, str, str]] = []  # (curso, origen, motivo)

    for curso in CURSOS:
        mds = sorted((CONTENT / curso).glob("modulo-*.md"), key=numero_modulo)
        for md in mds:
            nmod = numero_modulo(md)
            temas = leer_temas(curso, md)
            texto_preambulo = "\n".join(temas[0].lineas)
            deps_modulo = parse_deps(texto_preambulo)
            for tema in temas:
                if not tema.bloques:
                    continue
                if not any(b.lang == "dart" for b in tema.bloques):
                    continue
                texto_tema = "\n".join(tema.lineas)
                creates_tema = parse_create(texto_tema)
                deps_tema = parse_deps(texto_tema) or deps_modulo
                # «agrega `generate: true`» en prosa equivale al fragmento de pubspec.yaml.
                generate_tema = bool(re.search(r"generate:\s*true", texto_tema))
                # Opciones que la lección pasa a `flutter test` (p. ej. --dart-define-from-file=...).
                args_test_tema = ""
                for mt in re.finditer(r"^\s*flutter test\b([^\n`]*)$", texto_tema, re.M):
                    opciones = [t for t in mt.group(1).split() if t.startswith("--dart-define")]
                    if opciones:
                        args_test_tema = "\t".join(opciones)
                        break
                base = f"{curso}-m{nmod:02d}-t{tema.indice:02d}"
                abiertas: dict[str, Unidad] = {}
                etapas: dict[str, int] = {}

                def nueva(proyecto: str, herr: str = "flutter", plantilla: str = "app") -> Unidad:
                    etapas[proyecto] = etapas.get(proyecto, 0) + 1
                    sufijo = "" if etapas[proyecto] == 1 else f"-e{etapas[proyecto]}"
                    u = Unidad(f"{base}-{proyecto}{sufijo}", curso, proyecto,
                               tipo="dart" if herr == "dart" else "flutter", plantilla=plantilla)
                    u.deps = list(deps_tema)
                    u.generate = generate_tema
                    u.args_test = args_test_tema
                    return u

                def cerrar(u: Unidad) -> None:
                    if u.archivos and u not in unidades:
                        unidades.append(u)

                lineas_md = md.read_text(encoding="utf-8").split("\n")

                def proyecto_para(linea: int) -> tuple[str, str, str]:
                    fin_tema = linea
                    previo = "\n".join(lineas_md[tema.inicio - 1:fin_tema])
                    cs = parse_create(previo) or creates_tema
                    if cs:
                        herr, plantilla, nombre = cs[-1] if parse_create(previo) else cs[0]
                        return herr, plantilla, nombre
                    return "flutter", "app", "app"

                for b in tema.bloques:
                    dec = buscar(DECISIONES, b) or {}
                    if "skip" in dec:
                        omitidos.append((curso, b.origen, dec["skip"]))
                        continue
                    if b.lang != "dart" and not rutas_en_texto(b.intro) and not partir_por_comentarios(b)[0][0]:
                        continue  # yaml/json sin ruta: configuración ajena al proyecto Dart
                    partes = partir_por_comentarios(b)
                    if b.desde_heredoc:
                        partes = [(b.desde_heredoc, b.cuerpo)]
                    if len(partes) == 1 and partes[0][0] is None:
                        candidatas = [r for r in rutas_en_texto(b.intro)
                                      if (b.lang == "dart") == r.endswith(".dart")
                                      and (b.lang != "text" or r.endswith(EXT_TEXTO))]
                        if "ruta" in dec:
                            partes = [(dec["ruta"], b.cuerpo)]
                        elif candidatas:
                            partes = [(candidatas[-1], b.cuerpo)]
                    if b.lang != "dart":
                        if partes[0][0] is None:
                            continue
                    herr, plantilla, proyecto = proyecto_para(b.linea)
                    if "proyecto" in dec:
                        proyecto = dec["proyecto"]
                        herr = dec.get("tipo", herr)
                        plantilla = dec.get("plantilla", plantilla)

                    if partes[0][0] is None:
                        cuerpo = "\n".join(b.cuerpo)
                        primera = next((x for x in b.cuerpo if x.strip() and not x.strip().startswith("//")), "")
                        if es_fallo_deliberado(b):
                            pass  # se trata abajo como variante
                        elif primera.startswith("import ") and es_archivo_completo(b.cuerpo):
                            # Archivo completo sin ruta: se verifica solo (lib/main.dart si tiene main).
                            ruta = "lib/main.dart" if RE_MAIN.search(cuerpo) else f"lib/ejemplo_l{b.linea}.dart"
                            nombre = proyecto if proyecto != "app" else f"programa_l{b.linea}"
                            u = nueva(nombre, herr, plantilla)
                            u.nombre = f"{base}-l{b.linea}"
                            # Dependencias: las del paso donde está el bloque (su «Ejecuta el ejemplo»);
                            # si no hay, las del tema que el archivo realmente importa.
                            fin_paso = b.linea
                            while fin_paso < len(lineas_md) and not lineas_md[fin_paso].startswith(("### ", "#### ")):
                                fin_paso += 1
                            deps_paso = parse_deps("\n".join(lineas_md[b.linea:fin_paso]))
                            importados = set(RE_PKG_IMPORT.findall(cuerpo))
                            u.deps = deps_paso or [d for d in deps_tema if nombre_dep(d) in importados]
                            u.archivos[ruta] = cuerpo + "\n"
                            u.origenes[ruta] = b.origen
                            u.nota = f"archivo completo sin ruta en la lección; se verifica como {ruta}"
                            cerrar(u)
                            continue
                        else:
                            if primera.startswith("import "):
                                motivo = "fragmento parcial: tiene imports pero mezcla sentencias sueltas"
                            elif es_archivo_completo(b.cuerpo):
                                motivo = "extracto ilustrativo: declaraciones sin imports ni archivo destino"
                            else:
                                motivo = "fragmento de expresiones o sentencias sueltas (no es un archivo)"
                            omitidos.append((curso, b.origen, motivo))
                            continue

                    if es_fallo_deliberado(b):
                        fallo = buscar(FALLOS, b)
                        if not fallo or "skip" in fallo:
                            motivo = fallo["skip"] if fallo else \
                                "fallo deliberado sin error de compilación/prueba verificable automáticamente"
                            omitidos.append((curso, b.origen, motivo))
                            continue
                        # Variante: copia del estado actual de la unidad con el cambio aplicado.
                        candidatas = [u for u in abiertas.values()]
                        if not candidatas:
                            omitidos.append((curso, b.origen, "fallo deliberado sin proyecto base en el tema"))
                            continue
                        baseu = candidatas[-1]
                        v = Unidad(f"{baseu.nombre}-fallo-l{b.linea}", curso, baseu.proyecto, baseu.tipo,
                                   baseu.plantilla, dict(baseu.archivos), {}, list(baseu.deps))
                        v.generate = baseu.generate
                        v.args_test = baseu.args_test
                        cuerpo = "\n".join(b.cuerpo) + "\n"
                        if partes[0][0] is not None:
                            _, ruta = normalizar_ruta(partes[0][0])
                            v.archivos[ruta] = cuerpo
                        else:
                            hecho = False
                            for ruta, texto in v.archivos.items():
                                nuevo = reemplazar_miembro(texto, cuerpo)
                                if nuevo is not None:
                                    v.archivos[ruta] = nuevo
                                    hecho = True
                                    break
                            if not hecho:
                                omitidos.append((curso, b.origen,
                                                 "fallo deliberado: no se encontró la declaración a reemplazar"))
                                continue
                            ruta = "(miembro reemplazado)"
                        v.origenes = {ruta: b.origen}
                        v.espera_fallo = fallo["etapa"]
                        v.patron_fallo = fallo["patron"]
                        v.nota = "fallo deliberado: PASS si la etapa falla con el error prometido"
                        unidades.append(v)
                        continue

                    for ruta_leccion, lineas_parte in partes:
                        if ruta_leccion is None:
                            # Texto antes del primer comentario-ruta (normalmente vacío).
                            if any(x.strip() for x in lineas_parte):
                                omitidos.append((curso, b.origen, "texto previo al primer archivo del bloque"))
                            continue
                        pref, ruta = normalizar_ruta(ruta_leccion)
                        proy = pref or proyecto
                        h, pl = herr, plantilla
                        if pref and pref != proyecto:
                            # Proyecto nombrado por la ruta: busca su create en el tema.
                            for hh, pp, nn in creates_tema:
                                if nn == pref:
                                    h, pl = hh, pp
                        if "/" not in ruta and ruta.endswith(".dart") and ruta not in ("main.dart",) \
                                and not b.desde_heredoc and "ruta" not in dec:
                            # Nombre suelto (p. ej. `issue_form_state.dart`): misma carpeta que el último
                            # archivo de lib/ de la unidad, o lib/.
                            u0 = abiertas.get(proy)
                            dirs = [str(Path(r).parent) for r in (u0.archivos if u0 else {}) if r.startswith("lib/")]
                            ruta = f"{dirs[-1]}/{ruta}" if dirs else f"lib/{ruta}"
                        if ruta.endswith(".dart") and not es_archivo_completo(lineas_parte):
                            omitidos.append((curso, b.origen, f"fragmento parcial para insertar en `{ruta}` "
                                                              "(la lección no da el archivo completo)"))
                            continue
                        u = abiertas.get(proy)
                        if u is None:
                            u = nueva(proy, h, pl)
                            abiertas[proy] = u
                        contenido = "\n".join(lineas_parte) + "\n"
                        if ruta in u.archivos and u.archivos[ruta] != contenido:
                            # La lección reescribe el archivo: la versión anterior se verifica en su etapa.
                            cerrar(u)
                            u2 = nueva(proy, u.tipo if u.tipo == "flutter" else "dart", u.plantilla)
                            u2.archivos = dict(u.archivos)
                            u2.generate = u.generate
                            u2.args_test = u.args_test
                            u2.origenes = {r: o for r, o in u.origenes.items() if r != ruta}
                            u = u2
                            abiertas[proy] = u
                        if ruta == "pubspec.yaml":
                            if re.search(r"^\s+generate:\s*true", contenido, re.M) and "name:" not in contenido:
                                u.generate = True
                                u.origenes[ruta] = b.origen
                                continue
                        u.archivos[ruta] = contenido
                        u.origenes[ruta] = b.origen
                for u in abiertas.values():
                    cerrar(u)

    # Ajustes finales por unidad
    finales: list[Unidad] = []
    for u in unidades:
        # Nombre de paquete: `package:X/p` con lib/p presente en la unidad es el propio paquete
        # (quien sigue la lección creó el proyecto con ese nombre).
        propios = set()
        for t in u.archivos.values():
            for pkg, resto in re.findall(r"'package:(\w+)/([^']+)'", t):
                if f"lib/{resto}" in u.archivos:
                    propios.add(pkg)
        conocidos = {nombre_dep(d) for d in u.deps} | PAQUETES_SDK
        if u.proyecto in NOMBRES_GENERICOS:
            # Un import package:rutaflow*/ en un proyecto genérico es el paquete de la propia app.
            propios.update(p for p in paquetes_importados(u) if p.startswith("rutaflow") and p not in conocidos)
        if len(propios - conocidos) == 1 and u.proyecto not in propios:
            nuevo = next(iter(propios - conocidos))
            u.nota = (u.nota + "; " if u.nota else "") + f"paquete renombrado {u.proyecto} -> {nuevo} por sus imports"
            u.proyecto = nuevo
        # Dependencias usadas pero no añadidas por la lección (se añaden y se anotan).
        usados = paquetes_importados(u)
        if u.tipo == "dart" and u.plantilla in ("console", "package", "console-simple"):
            usados -= {"test"} if u.plantilla != "console-simple" else set()
        faltan_deps = sorted(p for p in usados if p not in conocidos and p != u.proyecto)
        for p in faltan_deps:
            es_test = any(r.startswith("test/") and f"package:{p}/" in t for r, t in u.archivos.items()) and \
                not any(r.startswith(("lib/", "bin/")) and f"package:{p}/" in t for r, t in u.archivos.items())
            u.implicitas.append(("dev:" if es_test else "") + p)
        # Programa con salida prometida.
        for ruta in sorted(u.archivos):
            if ruta.endswith(".dart") and ruta.startswith(("bin/", "lib/")) and RE_MAIN.search(u.archivos[ruta]):
                if importa_flutter(u, ruta):
                    continue
                o = u.origenes.get(ruta, "")
                if not o:
                    continue
                curso, resto = o.split("/", 1)
                md_nombre, linea = resto.split(":")
                temas = leer_temas(curso, CONTENT / curso / md_nombre)
                tema = next((t for t in temas if any(b.origen == o for b in t.bloques)), None)
                if tema:
                    r, esp = esperado_tras(tema, int(linea), ruta, u.proyecto)
                    if r and esp:
                        u.ejecutar, u.esperado = r, esp
                        break
        falt = faltantes(u)
        if falt:
            malos = {f.split(" importa ")[0] for f in falt}
            # Propaga: todo archivo que importe uno incompleto también queda incompleto.
            cambio = True
            while cambio:
                cambio = False
                for ruta in list(u.archivos):
                    if ruta in malos or not ruta.endswith(".dart"):
                        continue
                    alcanzados = resolver_imports(u, ruta) - {ruta}
                    if alcanzados & malos:
                        malos.add(ruta)
                        cambio = True
            for ruta in sorted(malos):
                motivos = [f.split(" importa ")[1] for f in falt if f.startswith(ruta + " importa ")]
                if any("firebase_options.dart" in m for m in motivos):
                    otros = [m for m in motivos if "firebase_options" not in m]
                    motivo = ("requiere firebase_options.dart, que genera `flutterfire configure` con una "
                              "cuenta de Firebase" + ("; además importa " + ", ".join(otros) if otros else ""))
                elif motivos:
                    motivo = "importa " + ", ".join(motivos) + ", que la lección no muestra"
                else:
                    motivo = "depende de un archivo incompleto de la misma unidad"
                o = u.origenes.pop(ruta, None)
                u.archivos.pop(ruta, None)
                if o and o not in u.origenes.values():
                    omitidos.append((u.curso, o, "unidad incompleta: " + motivo))
            if not any(r.endswith(".dart") for r in u.archivos):
                for o in set(u.origenes.values()):
                    omitidos.append((u.curso, o, "unidad incompleta: sin archivos Dart verificables"))
                continue
        finales.append(u)

    # Laboratorio completo
    lab = Unidad("lab-flutter_rutaflow", "laboratorio", "flutter_rutaflow")
    lab.completo = "examples/flutter_rutaflow"
    for p in sorted(LAB.rglob("*")):
        rel_partes = p.relative_to(LAB).parts
        if p.is_file() and not any(x.startswith(".") or x == "build" for x in rel_partes):
            rel = p.relative_to(LAB).as_posix()
            lab.archivos[rel] = p.read_text(encoding="utf-8")
            if rel.endswith(".dart"):
                lab.origenes[rel] = f"examples/flutter_rutaflow/{rel}:1"
    finales.append(lab)
    return finales, omitidos


def escribir(unidades: list[Unidad], omitidos: list[tuple[str, str, str]]) -> None:
    if BUILD.exists():
        shutil.rmtree(BUILD)
    BUILD.mkdir(parents=True)
    indice = []
    for u in unidades:
        d = BUILD / u.nombre
        a = d / "archivos"
        a.mkdir(parents=True)
        for ruta, texto in u.archivos.items():
            dest = a / ruta
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_text(texto, encoding="utf-8")
        env = {
            "CURSO": u.curso,
            "TIPO": u.tipo,
            "PLANTILLA": u.plantilla,
            "PROYECTO": u.proyecto,
            "EJECUTAR": u.ejecutar,
            "ESPERA_FALLO": u.espera_fallo,
            "PATRON_FALLO": u.patron_fallo,
            "GENERATE": "1" if u.generate else "",
            "ARGS_TEST": u.args_test,
            "BUILD_RUNNER": "1" if any(nombre_dep(x) == "build_runner" for x in u.deps)
            or re.search(r"part '[^']+\.g\.dart'", "\n".join(u.archivos.values())) else "",
            "COMPLETO": u.completo,
            "NOTA": u.nota,
        }
        with open(d / "unidad.env", "w", encoding="utf-8") as f:
            for k, v in env.items():
                v = v.replace("'", "'\\''")
                f.write(f"{k}='{v}'\n")
        with open(d / "origen.txt", "w", encoding="utf-8") as f:
            for ruta, o in sorted(u.origenes.items(), key=lambda x: x[1]):
                f.write(f"{o}\t{ruta}\n")
        # Un paquete por línea; los argumentos de una misma línea van separados por TAB.
        with open(d / "dependencias.txt", "w", encoding="utf-8") as f:
            for dep in ([] if u.completo else u.deps):
                f.write(dep + "\n")
        with open(d / "implicitas.txt", "w", encoding="utf-8") as f:
            for dep in ([] if u.completo else u.implicitas):
                f.write(dep + "\n")
        if u.esperado:
            (d / "esperado.txt").write_text("\n".join(u.esperado) + "\n", encoding="utf-8")
        indice.append(u.nombre)
    (BUILD / "unidades.txt").write_text("\n".join(indice) + "\n", encoding="utf-8")
    with open(BUILD / "omitidos.tsv", "w", encoding="utf-8") as f:
        for curso, o, motivo in omitidos:
            f.write(f"{curso}\t{o.split('/', 1)[1]}\tSKIP\t{motivo}\n")


def main() -> int:
    unidades, omitidos = construir()
    escribir(unidades, omitidos)
    bloques_en_unidades = sum(len(set(u.origenes.values())) for u in unidades)
    print(f"unidades: {len(unidades)} (bloques verificados: {bloques_en_unidades})")
    print(f"omitidos (SKIP): {len(omitidos)}")
    if "--listar" in sys.argv:
        for u in unidades:
            extra = []
            if u.deps:
                extra.append("deps=" + ",".join(u.deps))
            if u.implicitas:
                extra.append("implícitas=" + ",".join(u.implicitas))
            if u.ejecutar:
                extra.append(f"ejecuta={u.ejecutar}")
            if u.espera_fallo:
                extra.append(f"espera_fallo={u.espera_fallo}")
            print(f"  {u.nombre} [{u.tipo}/{u.plantilla}] {' '.join(extra)}")
            if not u.completo:
                for r, o in u.origenes.items():
                    print(f"      {o} -> {r}")
        motivos: dict[str, int] = {}
        for _, o, m in omitidos:
            clave = m.split(":")[0]
            motivos[clave] = motivos.get(clave, 0) + 1
        for m, n in sorted(motivos.items(), key=lambda x: -x[1]):
            print(f"  SKIP {n:3d}  {m}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
