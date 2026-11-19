#!/usr/bin/env python3
"""Extractor del kit android-kmp (specs/015).

Convierte el código Kotlin/Gradle de las lecciones
  web/public/content/android/modulo-N.md
  web/public/content/kotlin-multiplatform/modulo-N.md
y de los laboratorios de examples/ que citan esos cursos en proyectos Gradle
dentro de build/unidades/<id>/, uno por unidad (módulo + proyecto de la lección).

Cada unidad lleva:
  origen.txt    curso/modulo-N.md:LÍNEA de cada archivo y de cada pieza sintetizada
  unidad.env    parámetros para run.sh (tareas, JDK, versión de Gradle, expectativa)
  proyecto/     el proyecto Gradle (sin wrapper: run.sh lo añade)

Además escribe build/omitidos.tsv con los bloques que no se pueden verificar en el Mac
(fragmentos, ejercicios con huecos, pasos con dispositivo): curso, archivo:línea, SKIP, motivo.

Uso:
  python3 extraer.py              # versiones por defecto (sin red)
  python3 extraer.py --resolver   # consulta Maven Central / Google Maven para las versiones
                                  # que las lecciones no fijan (plantilla de Android Studio, etc.)
Sin dependencias: solo la biblioteca estándar de Python 3.
"""
from __future__ import annotations

import json
import os
import re
import shlex
import shutil
import sys
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path

KIT = Path(__file__).resolve().parent
REPO = KIT.parent.parent
CONTENIDO = REPO / "web" / "public" / "content"
EJEMPLOS = REPO / "examples"
BUILD = KIT / "build"
CURSOS = ("android", "kotlin-multiplatform")
CORTO = {"android": "and", "kotlin-multiplatform": "kmp"}

# ---------------------------------------------------------------------------
# Versiones
# ---------------------------------------------------------------------------
# Las que fijan las lecciones se leen de las lecciones (Kotlin, Ktor, Gradle...).
# Las que NO fijan (la plantilla «Empty Activity» de Android Studio, Koin, SQLDelight,
# Compose Multiplatform) se resuelven con --resolver a la última estable publicada.
GOOGLE = "https://dl.google.com/dl/android/maven2/"
CENTRAL = "https://repo1.maven.org/maven2/"
RESOLVIBLES = {
    # clave: (repositorio, ruta del artefacto, valor por defecto sin red)
    "agp": (GOOGLE, "com/android/tools/build/gradle", "9.0.0"),
    "composeBom": (GOOGLE, "androidx/compose/compose-bom", "2025.12.00"),
    "coreKtx": (GOOGLE, "androidx/core/core-ktx", "1.17.0"),
    "lifecycleRuntimeKtx": (GOOGLE, "androidx/lifecycle/lifecycle-runtime-ktx", "2.10.0"),
    "activityCompose": (GOOGLE, "androidx/activity/activity-compose", "1.12.0"),
    "junitVersion": (GOOGLE, "androidx/test/ext/junit", "1.3.0"),
    "espressoCore": (GOOGLE, "androidx/test/espresso/espresso-core", "3.7.0"),
    "securityCrypto": (GOOGLE, "androidx/security/security-crypto", "1.1.0"),
    "googleid": (GOOGLE, "com/google/android/libraries/identity/googleid/googleid", "1.1.1"),
    "koin": (CENTRAL, "io/insert-koin/koin-core", "4.1.1"),
    "sqldelight": (CENTRAL, "app/cash/sqldelight/runtime", "2.2.1"),
    "cmp": (CENTRAL, "org/jetbrains/compose/compose-gradle-plugin", "1.9.3"),
    "cmpMaterial3": (CENTRAL, "org/jetbrains/compose/material3/material3", "1.9.0"),
    "cmpNavigation": (CENTRAL, "org/jetbrains/androidx/navigation/navigation-compose", "2.9.1"),
    "kotlinxDatetime": (CENTRAL, "org/jetbrains/kotlinx/kotlinx-datetime", "0.7.1"),
}
ESTABLE = re.compile(r"^\d+(\.\d+)+$")


def _clave_version(v: str):
    return tuple(int(x) for x in v.split("."))


def resolver_versiones(con_red: bool) -> dict:
    res = {}
    for clave, (repo, ruta, defecto) in RESOLVIBLES.items():
        env = os.environ.get("VERSION_" + clave.upper())
        if env:
            res[clave] = {"version": env, "fuente": "variable VERSION_" + clave.upper()}
            continue
        if con_red:
            try:
                with urllib.request.urlopen(repo + ruta + "/maven-metadata.xml", timeout=20) as r:
                    xml = r.read().decode("utf-8", "replace")
                vs = [v for v in re.findall(r"<version>([^<]+)</version>", xml) if ESTABLE.match(v)]
                if vs:
                    res[clave] = {"version": max(vs, key=_clave_version),
                                  "fuente": "última estable en " + repo + ruta}
                    continue
            except Exception as e:  # sin red o repositorio caído: valor por defecto
                res[clave] = {"version": defecto, "fuente": f"por defecto (no se pudo resolver: {e.__class__.__name__})"}
                continue
        res[clave] = {"version": defecto, "fuente": "por defecto del kit (sin --resolver)"}
    return res


# ---------------------------------------------------------------------------
# Lectura de lecciones
# ---------------------------------------------------------------------------
EXT_CODIGO = (".kt", ".kts", ".toml", ".xml", ".sq", ".sqm", ".def", ".properties", ".pro", ".plist")
LENG_CODIGO = {"kotlin", "kt", "toml", "xml", "sql", "c", "properties", ""}
TOKEN_RUTA = re.compile(r"`([^`\n]+)`")


@dataclass
class Bloque:
    curso: str
    mod: int
    linea: int          # primera línea de contenido (1-based)
    leng: str
    lineas: list
    previo: str         # últimas líneas de prosa antes del bloque
    tema: str
    avanzado: bool


@dataclass
class Item:
    tipo: str            # archivo | fusion | anexo | tarea | omitir | fallo
    curso: str
    mod: int
    linea: int
    tema: str
    proyecto: str = ""
    ruta: str = ""
    contenido: str = ""
    nota: str = ""
    extra: dict = field(default_factory=dict)

    @property
    def origen(self) -> str:
        return f"{self.curso}/modulo-{self.mod}.md:{self.linea}"


def leer_leccion(curso: str, mod: int):
    p = CONTENIDO / curso / f"modulo-{mod}.md"
    return p.read_text(encoding="utf-8").split("\n")


def bloques_y_parrafos(curso: str, mod: int):
    """Devuelve la lista de bloques de código y la lista de párrafos «Fallo deliberado»."""
    L = leer_leccion(curso, mod)
    bloques, fallos = [], []
    tema, avanzado = "0", False
    i = 0
    while i < len(L):
        ln = L[i]
        h = re.match(r"^###\s+Tema\s+(\d+)", ln)
        if h:
            tema = h.group(1)
            avanzado = "·" in ln
        elif re.match(r"^##\s+(?!#)", ln) and not ln.startswith("## Aprende"):
            tema = "fin:" + ln[3:].strip()[:30]
            avanzado = False
        m = re.match(r"^(\s*)(?:>\s*)?```\s*([\w+-]*)\s*$", ln)
        if m and not ln.strip().startswith("```mermaid") or (m and False):
            pass
        if m:
            leng = m.group(2).lower()
            cita = ln.lstrip().startswith(">")
            j = i + 1
            cuerpo = []
            while j < len(L):
                lj = L[j]
                if cita:
                    lj = re.sub(r"^\s*>\s?", "", lj)
                if re.match(r"^\s*```\s*$", lj):
                    break
                cuerpo.append(lj)
                j += 1
            # prosa previa: hasta 3 líneas no vacías del párrafo anterior
            k = i - 1
            while k >= 0 and not L[k].strip():
                k -= 1
            par = []
            while k >= 0 and L[k].strip() and not L[k].strip().startswith("```") and len(par) < 3:
                par.insert(0, re.sub(r"^\s*>\s?", "", L[k]))
                k -= 1
            bloques.append(Bloque(curso, mod, i + 2, leng, cuerpo, " ".join(par).strip(), tema, avanzado))
            i = j + 1
            continue
        if "Fallo deliberado" in ln and "**" in ln:
            # párrafo completo (hasta la línea vacía)
            par = [ln]
            k = i + 1
            while k < len(L) and L[k].strip() and not L[k].lstrip().startswith(("```", "#", "|")):
                par.append(L[k])
                k += 1
            fallos.append((i + 1, tema, " ".join(par)))
        i += 1
    return bloques, fallos


def es_ruta(tok: str) -> bool:
    tok = tok.strip()
    if " " in tok or "..." in tok or tok.startswith(("./", "-")) or "*" in tok:
        return False
    return tok.endswith(EXT_CODIGO) and not tok.startswith("http")


def limpiar_ruta(tok: str):
    """'AndroidManifest.xml (fragmentos)' -> ('AndroidManifest.xml', True)."""
    frag = bool(re.search(r"fragment|dentro de", tok, re.I))
    tok = re.sub(r"\s*\(.*?\)\s*", "", tok).strip().rstrip(",:")
    tok = re.split(r",\s", tok)[0].strip()
    return tok, frag


def ruta_de_comentario(lineas):
    for ln in lineas[:2]:
        s = ln.strip()
        if not s:
            continue
        m = re.match(r"^(?://|--|#|<!--)\s*([\w./\-]+\.\w+)(.*)$", s)
        if m and "/" in m.group(1) or (m and m.group(1).endswith(EXT_CODIGO)):
            ruta, frag = limpiar_ruta(m.group(1) + " " + m.group(2))
            frag = frag or bool(re.search(r"fragment|dentro de", m.group(2), re.I))
            if es_ruta(ruta):
                return ruta, frag
        return None, False
    return None, False


def declarados(texto: str) -> set:
    return set(re.findall(r"^(?:\s*(?:public|internal|private|data|sealed|enum|abstract|open|value|annotation|expect|actual|inline|suspend|operator|infix|fun interface)\s+)*"
                          r"(?:class|interface|object|typealias|fun|val|var)\s+(?:<[^>]*>\s*)?(?:[\w.]+\.)?(\w+)", texto, re.M))


def ruta_de_prosa(previo: str, lineas):
    if not previo.rstrip().endswith(":"):
        return None, False
    ultima = re.split(r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚ¿*])", previo.strip())[-1]
    toks = [t for t in TOKEN_RUTA.findall(ultima)]
    if not any(es_ruta(limpiar_ruta(t)[0]) for t in toks):
        # la ruta puede estar en una frase anterior del párrafo: solo vale si nombra algo que el bloque declara
        nombres = declarados("\n".join(lineas))
        toks = [t for t in TOKEN_RUTA.findall(previo) if Path(limpiar_ruta(t)[0]).stem.split(".")[0] in nombres]
    cand = []
    for t in toks:
        r, frag = limpiar_ruta(t)
        if es_ruta(r):
            cand.append((r, frag or bool(re.search(r"fragment", t, re.I))))
    if not cand:
        return None, False
    if len(cand) > 1:
        nombres = declarados("\n".join(lineas))
        for r, f in cand:
            if Path(r).stem.split(".")[0] in nombres:
                return r, f
    return cand[-1]


PAQUETE = re.compile(r"^\s*package\s+([\w.]+)", re.M)


def paquete(texto: str) -> str:
    m = PAQUETE.search(texto)
    return m.group(1) if m else ""


# ---------------------------------------------------------------------------
# Clasificación de bloques en ítems
# ---------------------------------------------------------------------------
FRAG_GRADLE = re.compile(r"^\s*(kotlin|android|dependencies|sourceSets|plugins|buildTypes|publishing|iosSimulatorArm64|iosArm64|listOf\(ios|room|sqldelight|allOpen|benchmark|signingConfigs|compose)\b")
REQUIERE_IMPORTS = re.compile(r"@Composable|\bModifier\b|LaunchedEffect|viewModelScope|StateFlow|runTest|@Test\b|\bContext\b|remember\b|\bdp\b")
DISPOSITIVO = re.compile(r"publish\w*Repository|installDebug|installRelease|connected\w*AndroidTest|connectedCheck|\badb\b|xcrun simctl|^open |Benchmark\w*AndroidTest|hotRun|:run\b|BrowserTest|jsBrowser|xcodebuild|keytool|signingReport")
MKDIR_CD = re.compile(r"\bcd\s+([\w\-]+)")


def proyecto_android(paq: str, ruta: str, ctx: str) -> str:
    if ctx:
        return ctx
    if ruta.startswith("servidor/"):
        return "servidor"
    if paq.startswith("com.academia") or "/com/academia/" in ruta:
        return "academia"
    if paq.startswith("co.rutaflow") or "/co/rutaflow/" in ruta:
        return "RutaFlowConductor"
    if paq.startswith("com.example.restauracion") or "/com/example/restauracion/" in ruta:
        return "Restauracion"
    if paq.startswith("com.rutaflow.core") or ruta.startswith("core/src/main/java/com/rutaflow"):
        return "LocationPolicyLab"
    if paq:
        return "otro-" + paq.replace(".", "-")
    return ""


def proyecto_kmp(paq: str, ruta: str, ctx: str, avanzado: bool = False) -> str:
    if ctx:
        return ctx
    if avanzado and not paq.startswith("com.academia") and "/com/academia/" not in ruta:
        return "rutaflow"
    if paq.startswith("co.rutaflow") or "/co/rutaflow/" in ruta or ruta.startswith(("composeApp/", "build-logic/", "feature-envios/", "iosApp/")):
        return "rutaflow"
    return "academia"


def normalizar_ruta(curso: str, ruta: str, paq: str, leng: str) -> str:
    if curso == "android" and ruta in ("AndroidManifest.xml",):
        return "app/src/main/AndroidManifest.xml"
    return ruta


def ruta_inferida(curso: str, proyecto: str, paq: str, texto: str) -> str:
    nombres = [n for n in re.findall(r"^(?:\s*(?:data|sealed|enum|abstract|open)\s+)*(?:class|interface|object)\s+(\w+)", texto, re.M)]
    base = nombres[0] if nombres else "Archivo"
    es_test = bool(re.search(r"^import\s+(org\.junit|kotlin\.test)", texto, re.M))
    carpeta = paq.replace(".", "/")
    if curso == "android":
        return f"app/src/{'test' if es_test else 'main'}/java/{carpeta}/{base}.kt"
    return f"shared/src/{'commonTest' if es_test else 'commonMain'}/kotlin/{carpeta}/{base}.kt"


def clasificar(curso: str, mod: int):
    bloques, fallos = bloques_y_parrafos(curso, mod)
    items: list[Item] = []
    ctx_tema, ctx = None, ""
    ultimo_proy = {}
    for b in bloques:
        if curso == "android":
            elegir = proyecto_android
        else:
            elegir = (lambda paq, ruta, c, _av=b.avanzado: proyecto_kmp(paq, ruta, c, _av))
        if b.tema != ctx_tema:
            ctx_tema, ctx = b.tema, ""
        texto = "\n".join(b.lineas)
        if b.leng in ("bash", "sh", "shell", "console", "zsh"):
            # contexto de proyecto nuevo: mkdir X ... cd X
            creados = set(re.findall(r"mkdir\s+(?:-p\s+)?([\w\-]+)", texto))
            for c in MKDIR_CD.findall(texto):
                if c in creados and c not in ("academia-kmp", "academia-android"):
                    ctx = c
            # heredocs
            lineas = b.lineas
            k = 0
            while k < len(lineas):
                ln = lineas[k]
                m = re.search(r"cat\s+(>>?)\s*(\S+)\s+<<-?\s*['\"]?(\w+)['\"]?", ln)
                if m:
                    modo, ruta, fin = m.group(1), m.group(2), m.group(3)
                    cuerpo = []
                    k2 = k + 1
                    while k2 < len(lineas) and lineas[k2].strip() != fin:
                        cuerpo.append(lineas[k2])
                        k2 += 1
                    if ruta.endswith(EXT_CODIGO) or ruta.endswith(".gradle.kts.fragmento-version"):
                        cont = "\n".join(cuerpo) + "\n"
                        paq = paquete(cont)
                        proy = elegir(paq, ruta, ctx) if (paq or ctx or "/src/" in ruta) else ""
                        if proy:
                            ultimo_proy[b.tema] = proy
                        if ruta.endswith(".fragmento-version"):
                            items.append(Item("omitir", curso, mod, b.linea + k + 1, b.tema, proy, ruta, nota="archivo auxiliar que Gradle no lee (lo procesa un script de la lección)"))
                        else:
                            items.append(Item("archivo" if modo == ">" else "anexo", curso, mod, b.linea + k + 1, b.tema, proy, ruta, cont, nota="heredoc"))
                    k = k2 + 1
                    continue
                m = re.search(r"echo\s+'([^']*)'\s*>>\s*(\S+\.kts)", ln)
                if m:
                    items.append(Item("anexo", curso, mod, b.linea + k, b.tema, ctx or ultimo_proy.get(b.tema, ""), m.group(2), m.group(1) + "\n", nota="echo >>"))
                for cmd in re.findall(r"(?:^|&&|;)\s*(\./gradlew|gradle)\s+([^#\n]*)", ln):
                    args = re.split(r"\s(?:\||&&|;|>|2>)", " " + cmd[1].strip())[0].strip()
                    if not args or args.startswith("wrapper"):
                        continue
                    toks = args.split()
                    malos = [t for t in toks if not t.startswith("-") and DISPOSITIVO.search(t)]
                    buenos = [t for t in toks if t not in malos]
                    if malos:
                        items.append(Item("omitir", curso, mod, b.linea + k, b.tema,
                                          nota="requiere dispositivo/emulador, navegador, credenciales o interacción: «" + " ".join(malos)[:80] + "»"))
                    if [t for t in buenos if not t.startswith("-")]:
                        items.append(Item("tarea", curso, mod, b.linea + k, b.tema, ctx or ultimo_proy.get(b.tema, ""), contenido=" ".join(buenos),
                                          extra={"dispositivo": False, "tras_fallo": "Fallo deliberado" in b.previo or "**Error esperado" in b.previo}))
                if re.search(r"^\s*(adb|xcrun simctl|open\s+iosApp|keytool)\b", ln):
                    items.append(Item("omitir", curso, mod, b.linea + k, b.tema, nota="requiere dispositivo, emulador o simulador iOS en marcha: «" + ln.strip()[:70] + "»"))
                k += 1
            continue
        if b.leng not in LENG_CODIGO:
            continue
        if b.leng == "" and not re.search(r"\b(fun|class|import|package|plugins)\b", texto):
            continue
        if not texto.strip():
            continue
        ruta, frag = ruta_de_comentario(b.lineas)
        r2, f2 = ruta_de_prosa(b.previo, b.lineas)
        if not ruta:
            ruta, frag = r2, f2
        elif r2 and r2 == ruta:
            frag = frag or f2
        paq = paquete(texto) if b.leng in ("kotlin", "kt", "") else ""
        if "____" in texto:
            items.append(Item("omitir", curso, mod, b.linea, b.tema, nota="ejercicio «Completa el código» con huecos ____"))
            continue
        if b.leng == "c" and not ruta:
            m = re.search(r"Archivo `([^`]+\.def)`", b.previo)
            if m:
                ruta = m.group(1)
        if ruta and ruta.endswith(".plist"):
            items.append(Item("omitir", curso, mod, b.linea, b.tema, nota="Info.plist de la app iOS (Xcode): fuera de Gradle"))
            continue
        if not ruta and paq and b.leng in ("kotlin", "kt"):
            proy = elegir(paq, "", ctx)
            ruta = ruta_inferida(curso, proy, paq, texto)
            items.append(Item("archivo", curso, mod, b.linea, b.tema, proy, ruta, texto + "\n", nota="ruta inferida del package (la lección no la nombra)"))
            ultimo_proy[b.tema] = proy
            continue
        if not ruta and curso == "kotlin-multiplatform" and re.search(r"`commonMain`:?\s*$", b.previo) and re.search(r"^import ", texto, re.M):
            nombres = re.findall(r"^(?:data |sealed |enum )?(?:class|interface|object)\s+(\w+)", texto, re.M)
            ruta = f"shared/src/commonMain/kotlin/{(nombres or ['Ejemplo'])[0]}.kt"
            proy = elegir("", ruta, ctx) or "rutaflow"
            items.append(Item("archivo", curso, mod, b.linea, b.tema, proy, ruta, texto + "\n", nota="ruta inferida: la lección dice «en commonMain» sin nombrar el archivo"))
            continue
        if not ruta:
            primera = next((l for l in b.lineas if l.strip() and not l.strip().startswith("//")), "")
            if b.leng != "toml" and (FRAG_GRADLE.match(primera) or re.search(r"build\.gradle\.kts", b.previo + (b.lineas[0] if b.lineas else ""))):
                items.append(Item("fusion", curso, mod, b.linea, b.tema, ctx or ultimo_proy.get(b.tema, ""), "", texto + "\n",
                                  extra={"previo": b.previo}))
            elif b.leng == "toml":
                if not re.search(r"^\s*\[", texto, re.M):
                    msec = re.search(r"`\[(\w+)\]`", b.previo)
                    texto = f"[{msec.group(1) if msec else 'libraries'}]\n" + texto
                items.append(Item("fusion", curso, mod, b.linea, b.tema, ctx or ultimo_proy.get(b.tema, ""), "gradle/libs.versions.toml", texto + "\n", extra={"previo": b.previo}))
            elif b.leng == "xml" and re.search(r"AndroidManifest", b.previo):
                items.append(Item("fusion", curso, mod, b.linea, b.tema, ctx or ultimo_proy.get(b.tema, ""), "app/src/main/AndroidManifest.xml", texto + "\n", extra={"previo": b.previo}))
            else:
                items.append(Item("omitir", curso, mod, b.linea, b.tema, nota="fragmento ilustrativo sin archivo destino (no es un archivo completo)"))
            continue
        ruta = normalizar_ruta(curso, ruta, paq, b.leng)
        proy = elegir(paq, ruta, ctx) if (paq or ctx or "/src/" in ruta or "/" in ruta) else ""
        if proy:
            ultimo_proy[b.tema] = proy
        if ruta.endswith(".kt") and not paq and "import " not in texto and REQUIERE_IMPORTS.search(texto):
            items.append(Item("omitir", curso, mod, b.linea, b.tema, proy, ruta, nota=f"parcial: la lección manda crear {ruta} pero el bloque no trae package ni imports"))
            continue
        es_gradle = ruta.endswith(".gradle.kts") and not ruta.endswith("settings.gradle.kts")
        incompleto = (es_gradle and not re.search(r"^\s*plugins\s*\{", texto, re.M)) or re.search(r"^\s*//\s*\.\.\.", texto, re.M)
        if ruta.endswith("libs.versions.toml") and re.search(r"edita|añade|agrega", b.previo, re.I):
            frag = True
        if ruta.endswith("AndroidManifest.xml") and "<manifest" not in texto:
            frag = True
        if frag or incompleto:
            items.append(Item("fusion", curso, mod, b.linea, b.tema, proy, ruta, texto + "\n", extra={"previo": b.previo, "incompleto": bool(incompleto)}))
            continue
        items.append(Item("archivo", curso, mod, b.linea, b.tema, proy, ruta, texto + "\n"))
    # proyecto indeterminado (manifiestos, catálogos, archivos sin paquete): el del ítem con código más cercano del mismo tema
    for i, it in enumerate(items):
        if it.tipo in ("archivo", "fusion", "anexo", "tarea") and not it.proyecto:
            cand = [(abs(o.linea - it.linea), o.proyecto) for o in items
                    if o.tema == it.tema and o.proyecto and o.tipo in ("archivo", "fusion") and o is not it]
            it.proyecto = min(cand)[1] if cand else "academia"
    for (linea, tema, texto) in fallos:
        items.append(Item("fallo", curso, mod, linea, tema, contenido=texto))
    return items


# ---------------------------------------------------------------------------
# Dependencias por import
# ---------------------------------------------------------------------------
# Android: alias del catálogo del Módulo 0 (o de la plantilla). (regex import, [(config, notación)], [plugins])
DEPS_ANDROID = [
    (r"androidx\.lifecycle\.viewmodel\.compose|androidx\.lifecycle\.ViewModel\b|androidx\.lifecycle\.viewModelScope|androidx\.lifecycle\.SavedStateHandle", [("implementation", "libs.androidx.lifecycle.viewmodel.compose")], []),
    (r"androidx\.lifecycle\.compose", [("implementation", "libs.androidx.lifecycle.runtime.compose")], []),
    (r"androidx\.navigation", [("implementation", "libs.androidx.navigation.compose")], []),
    (r"kotlinx\.serialization", [("implementation", "libs.kotlinx.serialization.json")], ["kotlin.serialization"]),
    (r"retrofit2\.converter\.kotlinx|retrofit2\.converter", [("implementation", "libs.retrofit.kotlinx.serialization")], []),
    (r"retrofit2", [("implementation", "libs.retrofit")], []),
    (r"okhttp3\.logging", [("implementation", "libs.okhttp.logging")], []),
    (r"androidx\.room\.testing", [("androidTestImplementation", "libs.androidx.room.testing")], []),
    (r"androidx\.room", [("implementation", "libs.androidx.room.runtime"), ("ksp", "libs.androidx.room.compiler")], ["ksp", "room"]),
    (r"dagger\.hilt\.android\.testing", [("androidTestImplementation", "libs.hilt.android.testing"), ("kspAndroidTest", "libs.hilt.compiler")], ["ksp", "hilt"]),
    (r"dagger\.hilt|javax\.inject|^dagger\.", [("implementation", "libs.hilt.android"), ("ksp", "libs.hilt.compiler")], ["ksp", "hilt"]),
    (r"androidx\.hilt\.navigation", [("implementation", '"androidx.hilt:hilt-navigation-compose:1.3.0"')], []),
    (r"androidx\.work\.testing", [("androidTestImplementation", "libs.androidx.work.testing")], []),
    (r"androidx\.work", [("implementation", "libs.androidx.work.runtime.ktx")], []),
    (r"androidx\.datastore", [("implementation", "libs.androidx.datastore.preferences")], []),
    (r"androidx\.paging\.testing", [("testImplementation", '"androidx.paging:paging-testing:@paging@"')], []),
    (r"androidx\.paging\.compose", [("implementation", "libs.androidx.paging.compose")], []),
    (r"androidx\.paging", [("implementation", "libs.androidx.paging.runtime")], []),
    (r"com\.google\.firebase", [("implementation", "platform(libs.firebase.bom)"), ("implementation", "libs.firebase.messaging")], []),
    (r"com\.google\.android\.libraries\.identity\.googleid", [("implementation", '"com.google.android.libraries.identity.googleid:googleid:@googleid@"')], []),
    (r"androidx\.credentials", [("implementation", "libs.androidx.credentials"), ("implementation", "libs.androidx.credentials.play.services.auth")], []),
    (r"androidx\.camera\.mlkit", [("implementation", "libs.androidx.camera.mlkit.vision")], []),
    (r"androidx\.camera\.view", [("implementation", "libs.androidx.camera.view")], []),
    (r"androidx\.camera", [("implementation", "libs.androidx.camera.camera2"), ("implementation", "libs.androidx.camera.lifecycle"), ("implementation", "libs.androidx.camera.view")], []),
    (r"com\.google\.mlkit\.vision\.barcode", [("implementation", "libs.mlkit.barcode.scanning")], []),
    (r"com\.google\.maps\.android\.compose|com\.google\.android\.gms\.maps", [("implementation", "libs.maps.compose")], []),
    (r"com\.google\.android\.gms\.location", [("implementation", "libs.play.services.location")], []),
    (r"com\.google\.android\.play\.core\.integrity", [("implementation", "libs.play.integrity")], []),
    (r"androidx\.compose\.material\.icons", [("implementation", "libs.androidx.compose.material.icons.core")], []),
    (r"androidx\.security\.crypto", [("implementation", '"androidx.security:security-crypto:@securityCrypto@"')], []),
    (r"kotlinx\.coroutines\.test", [("testImplementation", "libs.kotlinx.coroutines.test"), ("androidTestImplementation", "libs.kotlinx.coroutines.test")], []),
    (r"androidx\.compose\.ui\.test", [("androidTestImplementation", "libs.androidx.compose.ui.test.junit4"), ("testImplementation", "platform(libs.androidx.compose.bom)"), ("testImplementation", "libs.androidx.compose.ui.test.junit4")], []),
    (r"androidx\.test\.core|androidx\.test\.ext", [("androidTestImplementation", "libs.androidx.junit"), ("androidTestImplementation", '"androidx.test:core-ktx:1.7.0"')], []),
]

KTOR = "3.5.0"     # Módulo 3 y 5 de KMP
SERIAL_KMP = "1.12.0"  # Módulo 5 de KMP
COROUTINES = "1.11.0"  # Módulo 0 de KMP
DEPS_KMP = [
    (r"io\.ktor\.client\.engine\.mock", ["io.ktor:ktor-client-mock:" + KTOR], []),
    (r"io\.ktor\.client\.plugins\.contentnegotiation", ["io.ktor:ktor-client-content-negotiation:" + KTOR], []),
    (r"io\.ktor\.serialization\.kotlinx", ["io.ktor:ktor-serialization-kotlinx-json:" + KTOR], ["serialization"]),
    (r"io\.ktor\.client\.plugins\.auth", ["io.ktor:ktor-client-auth:" + KTOR], []),
    (r"io\.ktor\.client\.engine\.darwin", ["io.ktor:ktor-client-darwin:" + KTOR], []),
    (r"io\.ktor\.client\.engine\.okhttp", ["io.ktor:ktor-client-okhttp:" + KTOR], []),
    (r"io\.ktor", ["io.ktor:ktor-client-core:" + KTOR], []),
    (r"kotlinx\.serialization", ["org.jetbrains.kotlinx:kotlinx-serialization-json:" + SERIAL_KMP], ["serialization"]),
    (r"kotlinx\.datetime", ["org.jetbrains.kotlinx:kotlinx-datetime:@kotlinxDatetime@"], []),
    (r"org\.koin\.test", ["io.insert-koin:koin-test:@koin@"], []),
    (r"org\.koin", ["io.insert-koin:koin-core:@koin@"], []),
    (r"app\.cash\.sqldelight\.driver\.jdbc", ["app.cash.sqldelight:sqlite-driver:@sqldelight@"], ["sqldelight"]),
    (r"app\.cash\.sqldelight\.driver\.android", ["app.cash.sqldelight:android-driver:@sqldelight@"], ["sqldelight"]),
    (r"app\.cash\.sqldelight\.driver\.native", ["app.cash.sqldelight:native-driver:@sqldelight@"], ["sqldelight"]),
    (r"app\.cash\.sqldelight\.coroutines", ["app.cash.sqldelight:coroutines-extensions:@sqldelight@"], ["sqldelight"]),
    (r"app\.cash\.sqldelight", ["app.cash.sqldelight:runtime:@sqldelight@"], ["sqldelight"]),
    (r"androidx\.compose\.ui\.test", ["org.jetbrains.compose.ui:ui-test:@cmp@"], ["compose"]),
    (r"androidx\.compose\.material3", ["org.jetbrains.compose.material3:material3:@cmpMaterial3@"], ["compose"]),
    (r"androidx\.compose\.foundation", ["org.jetbrains.compose.foundation:foundation:@cmp@"], ["compose"]),
    (r"androidx\.compose\.ui", ["org.jetbrains.compose.ui:ui:@cmp@"], ["compose"]),
    (r"androidx\.compose\.runtime", ["org.jetbrains.compose.runtime:runtime:@cmp@"], ["compose"]),
    (r"org\.jetbrains\.compose\.resources", ["org.jetbrains.compose.components:components-resources:@cmp@"], ["compose"]),
    (r"androidx\.navigation", ["org.jetbrains.androidx.navigation:navigation-compose:@cmpNavigation@"], ["compose"]),
    (r"kotlinx\.coroutines\.test", ["org.jetbrains.kotlinx:kotlinx-coroutines-test:" + COROUTINES], []),
    (r"kotlinx\.coroutines", ["org.jetbrains.kotlinx:kotlinx-coroutines-core:" + COROUTINES], []),
    (r"androidx\.security\.crypto", ["androidx.security:security-crypto:@securityCrypto@"], []),
]

IMPORTS = re.compile(r"^\s*import\s+([\w.]+)", re.M)


# ---------------------------------------------------------------------------
# Unidad
# ---------------------------------------------------------------------------
@dataclass
class Unidad:
    uid: str
    curso: str
    mod: int
    proyecto: str
    plataforma: str                 # kmp | android | jvm
    archivos: dict = field(default_factory=dict)   # ruta -> contenido
    origen: dict = field(default_factory=dict)     # ruta -> texto de origen
    notas: list = field(default_factory=list)
    tareas: list = field(default_factory=list)
    tareas_ios_test: list = field(default_factory=list)
    tareas_ios_link: list = field(default_factory=list)
    ios: bool = False
    espera: str = "pass"
    mensaje: str = ""
    salida: str = ""
    padre: str = ""
    linea_ref: str = ""
    gradle: str = "kmp"
    jdk: str = "kmp"
    timeout: int = 1200
    sintetizado: list = field(default_factory=list)
    pre: list = field(default_factory=list)
    mutacion: dict = field(default_factory=dict)

    def poner(self, ruta, contenido, origen):
        self.archivos[ruta] = contenido
        self.origen[ruta] = origen


V = {}  # versiones resueltas: clave -> versión
GRADLE_LECCION = "9.7.0"
KOTLIN = "2.4.21"


def sustituir_versiones(t: str) -> str:
    return re.sub(r"@(\w+)@", lambda m: V.get(m.group(1), m.group(0)), t)


# ---------------------------- KMP ------------------------------------------
def base_kmp_leccion():
    """Lee del Paso 0 del Módulo 0 de KMP los heredocs de settings y shared/build."""
    items = clasificar("kotlin-multiplatform", 0)
    base = {}
    for it in items:
        if it.tipo == "archivo" and it.nota == "heredoc" and it.ruta in ("settings.gradle.kts", "shared/build.gradle.kts"):
            base.setdefault(it.ruta, (it.contenido, it.origen))
    return base


def fuente_set(ruta: str) -> str:
    m = re.search(r"/src/(\w+)/", "/" + ruta)
    return m.group(1) if m else "commonMain"


def construir_build_kmp(u: Unidad, modulo: str, ns: str, raiz_con_versiones: bool, base_leccion: str | None):
    """Genera <modulo>/build.gradle.kts para un módulo KMP a partir de lo que usa el código."""
    fuentes = {r: c for r, c in u.archivos.items() if r.startswith(modulo + "/src/")}
    sets = {fuente_set(r[len(modulo):]) for r in fuentes}
    deps: dict[str, list] = {}
    plugins = set()
    for r, c in fuentes.items():
        ss = fuente_set(r[len(modulo):])
        if r.endswith((".sq", ".sqm")):
            plugins.add("sqldelight")
            deps.setdefault("commonMain", []).append("app.cash.sqldelight:runtime:@sqldelight@")
            continue
        imps = IMPORTS.findall(c)
        if re.search(r"@Composable", c):
            plugins.add("compose")
            deps.setdefault(ss, []).append("org.jetbrains.compose.runtime:runtime:@cmp@")
        if re.search(r"@Serializable", c):
            plugins.add("serialization")
        for imp in imps:
            for rx, ds, pls in DEPS_KMP:
                if re.match(rx, imp):
                    for d in ds:
                        destino = ss
                        deps.setdefault(destino, []).append(d)
                    plugins.update(pls)
                    break
        if re.search(r"Res\.(string|drawable|plurals)", c):
            plugins.add("compose")
            deps.setdefault("commonMain", []).append("org.jetbrains.compose.components:components-resources:@cmp@")
    android = any(s.startswith("android") for s in sets)
    ios = any(s.startswith(("ios", "apple", "native")) for s in sets) or u.ios
    x64 = any("IosX64" in t for t in u.tareas) or any(s.startswith("iosX64") for s in sets)
    if "compose" in plugins and any(s in ("commonTest", "jvmTest") for s in sets):
        deps.setdefault("jvmTest", []).append("compose.desktop.currentOs")
    if "compose" in plugins:
        deps.setdefault("jvmMain", []).append("compose.desktop.currentOs")
    if "sqldelight" in plugins and "jvmTest" in sets:
        deps.setdefault("jvmTest", []).append("app.cash.sqldelight:sqlite-driver:@sqldelight@")
    # dependencias que la lección ya declara en su base
    base_deps = {"commonMain": ["org.jetbrains.kotlinx:kotlinx-coroutines-core:" + COROUTINES],
                 "commonTest": ["kotlin(\"test\")", "org.jetbrains.kotlinx:kotlinx-coroutines-test:" + COROUTINES]}
    sintet = []
    v = "" if not raiz_con_versiones else ""
    lin = ["plugins {"]
    ver = (lambda s: "") if not raiz_con_versiones else (lambda s: f' version "{s}"')
    lin.append(f'    kotlin("multiplatform"){ver(KOTLIN)}')
    if "serialization" in plugins:
        lin.append(f'    kotlin("plugin.serialization"){ver(KOTLIN)}')
        sintet.append("plugin kotlinx.serialization (por @Serializable)")
    if android:
        lin.append(f'    id("com.android.library"){ver(V["agp"])}')
        sintet.append(f'Android: com.android.library {V["agp"]} + androidTarget() (lo pide la lección; AGP en modo heredado: android.builtInKotlin=false, android.newDsl=false)')
    if "sqldelight" in plugins:
        lin.append(f'    id("app.cash.sqldelight"){ver(V["sqldelight"])}')
        sintet.append(f'SQLDelight {V["sqldelight"]} (la lección no fija versión ni bloque sqldelight)')
    if "compose" in plugins:
        lin.append(f'    id("org.jetbrains.compose"){ver(V["cmp"])}')
        lin.append(f'    kotlin("plugin.compose"){ver(KOTLIN)}')
        sintet.append(f'Compose Multiplatform {V["cmp"]} / material3 {V["cmpMaterial3"]} (la lección no fija versión)')
    lin.append("}")
    lin.append("")
    lin.append("kotlin {")
    lin.append("    jvm()")
    if android:
        lin.append("    androidTarget()")
    if ios:
        lin.append("    iosArm64()")
        lin.append("    iosSimulatorArm64()")
        if x64:
            lin.append("    iosX64()")
    lin.append("    sourceSets {")
    todos = {}
    for k, vs in base_deps.items():
        todos.setdefault(k, []).extend(vs)
    for k, vs in deps.items():
        todos.setdefault(k, []).extend(vs)
    orden = ["commonMain", "commonTest", "jvmMain", "jvmTest", "androidMain", "androidUnitTest", "iosMain", "iosTest"]
    for ss in sorted(todos, key=lambda s: orden.index(s) if s in orden else 99):
        vistos = []
        for d in todos[ss]:
            if d not in vistos:
                vistos.append(d)
        if ss not in orden:
            # source sets como iosSimulatorArm64Main no tienen accesor .dependencies corto
            acc = f'getByName("{ss}").dependencies'
        else:
            acc = f"{ss}.dependencies"
        lin.append(f"        {acc} {{")
        for d in vistos:
            if d.startswith(("kotlin(", "compose.")):
                lin.append(f"            implementation({d})")
            else:
                lin.append(f'            implementation("{sustituir_versiones(d)}")')
        lin.append("        }")
        extra = [d for d in todos[ss] if d not in base_deps.get(ss, [])]
        if extra:
            sintet.append(f"{ss}: " + ", ".join(sorted({sustituir_versiones(d) for d in extra})) + " (inferidas de los imports)")
    lin.append("    }")
    lin.append("}")
    if android:
        lin += ["", "android {", f'    namespace = "{ns}"', "    compileSdk = 36", "    defaultConfig { minSdk = 24 }", "}"]
    if "sqldelight" in plugins:
        pk = ""
        for r in u.archivos:
            m = re.search(r"/sqldelight/(.+)/[^/]+\.sqm?$", r)
            if m:
                pk = m.group(1).replace("/migrations", "").replace("/", ".")
                break
        lin += ["", "// sqldelight (kit)", "sqldelight {", "    databases {", '        create("Database") {', f'            packageName.set("{pk or ns}")', "        }", "    }", "}"]
    texto = "\n".join(lin) + "\n"
    if base_leccion is not None and not plugins and not android and not ios:
        return base_leccion, [], {"android": False, "ios": False, "compose": False}
    return texto, sintet, {"android": android, "ios": ios, "compose": "compose" in plugins}


def settings_kmp(nombre: str, modulos, google: bool, base_leccion: str | None):
    if base_leccion is not None and not google and list(modulos) == ["shared"]:
        return base_leccion
    rep = "        google()\n" if google else ""
    inc = ", ".join(f'":{m}"' for m in modulos)
    return ("pluginManagement {\n    repositories {\n" + rep + "        gradlePluginPortal()\n        mavenCentral()\n    }\n}\n"
            "dependencyResolutionManagement {\n    repositories {\n" + rep + "        mavenCentral()\n    }\n}\n"
            f'rootProject.name = "{nombre}"\n' + f"include({inc})\n")


# ---------------------------- Android ---------------------------------------
def catalogo_plantilla() -> str:
    """libs.versions.toml de la plantilla «Empty Activity» (AGP 9, Kotlin integrado)."""
    return sustituir_versiones(f"""[versions]
agp = "@agp@"
kotlin = "{KOTLIN}"
coreKtx = "@coreKtx@"
junit = "4.13.2"
junitVersion = "@junitVersion@"
espressoCore = "@espressoCore@"
lifecycleRuntimeKtx = "@lifecycleRuntimeKtx@"
activityCompose = "@activityCompose@"
composeBom = "@composeBom@"

[libraries]
androidx-core-ktx = {{ group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }}
junit = {{ group = "junit", name = "junit", version.ref = "junit" }}
androidx-junit = {{ group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }}
androidx-espresso-core = {{ group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }}
androidx-lifecycle-runtime-ktx = {{ group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }}
androidx-activity-compose = {{ group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }}
androidx-compose-bom = {{ group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }}
androidx-compose-ui = {{ group = "androidx.compose.ui", name = "ui" }}
androidx-compose-ui-graphics = {{ group = "androidx.compose.ui", name = "ui-graphics" }}
androidx-compose-ui-tooling = {{ group = "androidx.compose.ui", name = "ui-tooling" }}
androidx-compose-ui-tooling-preview = {{ group = "androidx.compose.ui", name = "ui-tooling-preview" }}
androidx-compose-ui-test-manifest = {{ group = "androidx.compose.ui", name = "ui-test-manifest" }}
androidx-compose-ui-test-junit4 = {{ group = "androidx.compose.ui", name = "ui-test-junit4" }}
androidx-compose-material3 = {{ group = "androidx.compose.material3", name = "material3" }}
androidx-ui-test-manifest = {{ group = "androidx.compose.ui", name = "ui-test-manifest" }}
androidx-ui-test-junit4 = {{ group = "androidx.compose.ui", name = "ui-test-junit4" }}

[plugins]
android-application = {{ id = "com.android.application", version.ref = "agp" }}
android-library = {{ id = "com.android.library", version.ref = "agp" }}
kotlin-compose = {{ id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }}
""")


def parse_toml(texto: str):
    """TOML de catálogo de versiones -> lista de (sección, clave, línea completa)."""
    sec, out = None, []
    for ln in texto.split("\n"):
        s = ln.strip()
        if not s or s.startswith("#"):
            continue
        m = re.match(r"^\[(\w+)\]$", s)
        if m:
            sec = m.group(1)
            continue
        m = re.match(r"^([\w\-]+)\s*=", s)
        if m and sec:
            out.append((sec, m.group(1), s))
    return out


def fusionar_toml(base: str, frag: str):
    """Añade las entradas de frag a base; si la clave existe con otro valor, gana frag."""
    entradas = parse_toml(base)
    notas = []
    for sec, clave, linea in parse_toml(frag):
        prev = [e for e in entradas if e[0] == sec and e[1] == clave]
        if prev:
            if prev[0][2] != linea:
                notas.append(f"[{sec}] {clave} ya existía ({prev[0][2]}); se usa {linea}")
            entradas = [e for e in entradas if not (e[0] == sec and e[1] == clave)]
        entradas.append((sec, clave, linea))
    secciones = []
    for sec, _, _ in entradas:
        if sec not in secciones:
            secciones.append(sec)
    orden = ["versions", "libraries", "bundles", "plugins"]
    secciones.sort(key=lambda s: orden.index(s) if s in orden else 9)
    txt = ""
    for sec in secciones:
        txt += f"[{sec}]\n" + "\n".join(e[2] for e in entradas if e[0] == sec) + "\n\n"
    return txt, notas


def alias_existe(toml: str, alias: str, plugin=False) -> bool:
    clave = alias.replace(".", "-")
    sec = "plugins" if plugin else "libraries"
    return any(s == sec and k.replace("_", "-") == clave for s, k, _ in parse_toml(toml))


def manifest_plantilla(paq_app: str, tema: str, nombre_app: str, application_name: str = "") -> str:
    an = f' android:name="{application_name}"' if application_name else ""
    return f"""<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <application{an}
        android:allowBackup="true"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/{tema}">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/{tema}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />

                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
"""


def main_activity_plantilla(paq: str, tema_fun: str) -> str:
    return f"""package {paq}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import {paq}.ui.theme.{tema_fun}

class MainActivity : ComponentActivity() {{
    override fun onCreate(savedInstanceState: Bundle?) {{
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {{
            {tema_fun} {{
                Scaffold(modifier = Modifier.fillMaxSize()) {{ innerPadding ->
                    Greeting(name = "Android", modifier = Modifier.padding(innerPadding))
                }}
            }}
        }}
    }}
}}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {{
    Text(text = "Hello $name!", modifier = modifier)
}}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {{
    {tema_fun} {{ Greeting("Android") }}
}}
"""


def tema_plantilla(paq: str, tema_fun: str) -> dict:
    return {
        "Color.kt": f"""package {paq}.ui.theme

import androidx.compose.ui.graphics.Color

val Purple80 = Color(0xFFD0BCFF)
val PurpleGrey80 = Color(0xFFCCC2DC)
val Pink80 = Color(0xFFEFB8C8)

val Purple40 = Color(0xFF6650a4)
val PurpleGrey40 = Color(0xFF625b71)
val Pink40 = Color(0xFF7D5260)
""",
        "Theme.kt": f"""package {paq}.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(primary = Purple80, secondary = PurpleGrey80, tertiary = Pink80)
private val LightColorScheme = lightColorScheme(primary = Purple40, secondary = PurpleGrey40, tertiary = Pink40)

@Composable
fun {tema_fun}(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {{
    val colorScheme = when {{
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {{
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }}
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }}
    MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}}
""",
        "Type.kt": f"""package {paq}.ui.theme

import androidx.compose.material3.Typography

val Typography = Typography()
""",
    }


PROYECTOS_ANDROID = {
    # proyecto -> (namespace de app, nombre de la app, función de tema)
    "academia": ("com.academia.android", "academia-android", "AcademiaAndroidTheme"),
    "RutaFlowConductor": ("co.rutaflow.conductor", "RutaFlowConductor", "RutaFlowConductorTheme"),
    "Restauracion": ("com.example.restauracion", "Restauracion", "RestauracionTheme"),
    "LocationPolicyLab": ("com.rutaflow.locationpolicylab", "LocationPolicyLab", "LocationPolicyLabTheme"),
}


def proyecto_android_info(proy: str):
    if proy in PROYECTOS_ANDROID:
        return PROYECTOS_ANDROID[proy]
    if proy.startswith("android-plataforma"):
        return ("com.rutaflow.repartidor", "Repartidor", "RepartidorTheme")
    nombre = re.sub(r"\W", "", proy.title()) or "App"
    return ("com.academia." + nombre.lower(), proy, nombre + "Theme")


# ---------------------------------------------------------------------------
# Fusión de fragmentos Gradle / manifiesto
# ---------------------------------------------------------------------------
def envolver_fragmento_gradle(frag: str, plataforma: str):
    """Devuelve el texto a anexar al build del módulo, o None si no se puede fusionar."""
    cuerpo = "\n".join(l for l in frag.split("\n") if not re.match(r"^\s*//\s*(app/)?build\.gradle\.kts", l))
    primera = next((l.strip() for l in cuerpo.split("\n") if l.strip() and not l.strip().startswith("//")), "")
    if re.match(r"^(android|dependencies|kotlin|room|sqldelight|allOpen|benchmark)\s*\{", primera):
        if re.search(r"^\s*plugins\s*\{", cuerpo, re.M):
            return None
        return cuerpo
    if re.match(r"^buildTypes\b|^signingConfigs\b|^flavorDimensions|^productFlavors", primera):
        return "android {\n" + cuerpo + "\n}"
    if re.match(r"^(sourceSets|iosSimulatorArm64|iosArm64|listOf\(ios|androidTarget|jvm\(\))", primera) and plataforma == "kmp":
        return "kotlin {\n" + cuerpo + "\n}"
    if re.match(r"^(implementation|testImplementation|androidTestImplementation|ksp|debugImplementation)\(", primera):
        return "dependencies {\n" + cuerpo + "\n}"
    return None


def fusionar_manifest(manifest: str, frag: str) -> str:
    frag = re.sub(r"<!--.*?-->", "", frag, flags=re.S).strip()
    perms = re.findall(r"<uses-(?:permission|feature)[^>]*/>", frag, re.S)
    resto = frag
    for p in perms:
        resto = resto.replace(p, "")
    resto = resto.strip()
    for p in perms:
        if p not in manifest:
            manifest = manifest.replace("\n    <application", "\n    " + p + "\n\n    <application", 1)
    if resto:
        if resto.startswith("<intent-filter"):
            manifest = manifest.replace("        </activity>", "            " + resto.replace("\n", "\n            ") + "\n        </activity>", 1)
        elif resto.startswith(("<activity", "<provider", "<receiver", "<service", "<meta-data")):
            if resto.startswith("<activity") and 'android:name=".MainActivity"' in resto:
                manifest = re.sub(r"\s*<activity\s+android:name=\"\.MainActivity\".*?</activity>", "\n        " + resto.replace("\n", "\n        "), manifest, count=1, flags=re.S)
            else:
                manifest = manifest.replace("    </application>", "        " + resto.replace("\n", "\n        ") + "\n    </application>", 1)
    return manifest


# ---------------------------------------------------------------------------
# Arrastre de símbolos de módulos anteriores
# ---------------------------------------------------------------------------
STD = set("""String Int Long Double Float Boolean Unit Any Nothing List Map Set MutableList MutableMap Pair Triple
Array ByteArray Result Exception IllegalStateException IllegalArgumentException Throwable Regex Char Short Byte
Test Composable Modifier""".split())


def declarados_sup(texto: str) -> set:
    return set(re.findall(r"^(?:(?:public|internal|data|sealed|enum|abstract|open|value|annotation|inline|suspend|fun interface)\s+)*"
                          r"(?:class|interface|object|typealias|fun|val|var)\s+(?:<[^>]*>\s*)?(?:[\w.]+\.)?(\w+)", texto, re.M))


def usados(texto: str) -> set:
    sin_com = re.sub(r"//.*|/\*.*?\*/|\"(?:\\.|[^\"\\])*\"", " ", texto, flags=re.S)
    return set(re.findall(r"\b([A-Z]\w+)\b", sin_com)) | set(re.findall(r"\b([a-z]\w+)\s*\(", sin_com))


def es_principal(ruta: str) -> bool:
    return bool(re.search(r"/src/(main|commonMain|androidMain|iosMain|jvmMain)/", "/" + ruta))


# ---------------------------------------------------------------------------
# Construcción de unidades
# ---------------------------------------------------------------------------
def id_unidad(curso, mod, proy):
    return f"{CORTO[curso]}-m{mod:02d}-{proy}"


def construir():
    global GRADLE_LECCION
    omitidos = []      # (curso, origen, motivo)
    todas: dict[str, Unidad] = {}
    por_curso_items = {}
    for curso in CURSOS:
        mods = sorted(int(re.search(r"(\d+)", p.name).group(1)) for p in (CONTENIDO / curso).glob("modulo-*.md"))
        por_curso_items[curso] = {m: clasificar(curso, m) for m in mods}
    # versión de Gradle que pide la lección (Paso 0 de KMP)
    t0 = (CONTENIDO / "kotlin-multiplatform" / "modulo-0.md").read_text(encoding="utf-8")
    m = re.search(r"--gradle-version\s+([\d.]+)", t0)
    if m:
        GRADLE_LECCION = m.group(1)

    base_kmp = base_kmp_leccion()
    catalogos_m0, deps_curso, plugins_curso = {}, {}, {}
    historial: dict[tuple, list] = {}   # (curso, proyecto) -> [(mod, ruta, contenido, origen)]

    for curso in CURSOS:
        catalogo_m0 = None
        deps_acumuladas: list = []  # android academia: (config, notación, origen)
        plugins_acum: list = []
        for mod, items in por_curso_items[curso].items():
            # dependencias declaradas en la prosa del módulo (Android: «Antes de empezar»)
            texto_mod = "\n".join(leer_leccion(curso, mod))
            if curso == "android":
                intro = "\n".join(l for l in texto_mod.split("\n")[:40] if l.startswith(">"))
                for cfg, nota in re.findall(r"\b(implementation|ksp|testImplementation|androidTestImplementation|kspAndroidTest|debugImplementation)\((platform\(libs\.[\w.]+\)|libs\.[\w.]+)\)", intro):
                    deps_acumuladas.append((cfg, nota, f"android/modulo-{mod}.md (Antes de empezar)"))
                for pl in re.findall(r"alias\(libs\.plugins\.([\w.]+)\)", intro):
                    plugins_acum.append((pl, f"android/modulo-{mod}.md (Antes de empezar)"))
            unidades_mod: dict[str, Unidad] = {}
            for it in items:
                if it.tipo == "omitir":
                    omitidos.append((curso, it.origen, it.nota))
                    continue
                if it.tipo == "fallo" or it.tipo == "tarea":
                    continue
                proy = it.proyecto or "academia"
                if curso == "android" and proy == "servidor":
                    plataforma = "jvm"
                elif curso == "kotlin-multiplatform" and proy in ("reloj-kotlin",):
                    plataforma = "jvm"
                else:
                    plataforma = "android" if curso == "android" else "kmp"
                uid = id_unidad(curso, mod, proy)
                u = unidades_mod.get(uid)
                if not u:
                    u = Unidad(uid, curso, mod, proy, plataforma)
                    u.linea_ref = it.origen
                    unidades_mod[uid] = u
                if it.tipo == "archivo":
                    ruta = it.ruta
                    if plataforma == "jvm" and "/" not in ruta:
                        ruta = "src/main/kotlin/" + ruta
                    if plataforma == "jvm" and ruta.startswith("servidor/"):
                        ruta = ruta[len("servidor/"):]
                    if ruta in u.archivos and u.archivos[ruta] != it.contenido:
                        omitidos.append((curso, u.origen[ruta], f"versión anterior de {ruta}: la lección la reemplaza en {it.origen}; se verifica la versión final"))
                    u.poner(ruta, it.contenido, it.origen)
                    if curso == "android" and mod == 0 and ruta == "gradle/libs.versions.toml":
                        catalogo_m0 = (it.contenido, it.origen)
                elif it.tipo == "anexo":
                    previo = u.archivos.get(it.ruta, "")
                    u.archivos.setdefault("__anexos__", "")
                    u.archivos["__anexos__"] += f"{it.ruta}\t{it.origen}\t{it.contenido}"
                    u.origen.setdefault("__anexos__", "")
                elif it.tipo == "fusion":
                    if curso == "android" and mod == 0 and it.ruta.endswith("libs.versions.toml"):
                        if catalogo_m0:
                            catalogo_m0 = (fusionar_toml(catalogo_m0[0], it.contenido)[0], catalogo_m0[1] + " + " + it.origen)
                        else:
                            catalogo_m0 = (it.contenido, it.origen)
                        continue
                    u.archivos.setdefault("__fusiones__", [])
                    u.archivos["__fusiones__"].append(it)
            # tareas y fallos deliberados: a la unidad de su tema/proyecto
            tras_fallo = []
            for it in items:
                if it.tipo == "tarea" and it.extra.get("tras_fallo"):
                    tras_fallo.append(it)
                    continue
                if it.tipo == "tarea":
                    if it.extra.get("dispositivo"):
                        omitidos.append((curso, it.origen, "requiere dispositivo/emulador, navegador o interacción: «" + it.contenido[:80] + "»"))
                        continue
                    proy = it.proyecto or "academia"
                    uid = id_unidad(curso, mod, proy)
                    if uid in unidades_mod:
                        unidades_mod[uid].tareas.append((it.contenido, it.origen))
                    else:
                        # tarea sin código propio en el módulo: se verifica con la unidad del proyecto si existe
                        cand = [u for u in unidades_mod.values() if u.proyecto == proy] or list(unidades_mod.values())
                        if cand:
                            cand[0].tareas.append((it.contenido, it.origen))
                        else:
                            omitidos.append((curso, it.origen, "comando Gradle sin código Kotlin propio en el módulo (no hay proyecto que compilar): «" + it.contenido[:60] + "»"))
            for it in items:
                if it.tipo == "fallo":
                    # se asigna a la unidad cuyo archivo aparece antes y más cerca
                    mejor = None
                    for u in unidades_mod.values():
                        for r, o in u.origen.items():
                            if not isinstance(o, str) or ":" not in o:
                                continue
                            ln = int(o.rsplit(":", 1)[1])
                            if ln < it.linea and (mejor is None or ln > mejor[0]):
                                mejor = (ln, u)
                    if mejor:
                        it.extra["tareas"] = [t.contenido for t in tras_fallo if 0 < t.linea - it.linea < 12]
                        mejor[1].archivos.setdefault("__fallos__", [])
                        mejor[1].archivos["__fallos__"].append(it)
                    else:
                        omitidos.append((curso, it.origen, "fallo deliberado sin código verificable en el módulo"))
            catalogos_m0[curso] = catalogo_m0
            deps_curso[curso] = deps_acumuladas
            plugins_curso[curso] = plugins_acum
            for uid, u in unidades_mod.items():
                propios = [r for r, c in u.archivos.items() if isinstance(c, str) and not r.startswith("__")
                           and (r.endswith((".kt", ".sq", ".sqm", ".def")) or r.endswith("settings.gradle.kts") or (r.endswith(".gradle.kts") and "plugins" in c))]
                if not propios:
                    for it in u.archivos.get("__fusiones__", []):
                        omitidos.append((curso, it.origen, "fragmento de configuración sin código Kotlin de la lección en el módulo con el que verificarlo"))
                    for it in u.archivos.get("__fallos__", []):
                        omitidos.append((curso, it.origen, "fallo deliberado sin código verificable en el módulo"))
                    for args, o in u.tareas:
                        omitidos.append((curso, o, "comando Gradle sin código Kotlin propio en el módulo (no hay proyecto que compilar): «" + args[:60] + "»"))
                    for r, c in u.archivos.items():
                        if isinstance(c, str) and not r.startswith("__"):
                            omitidos.append((curso, u.origen.get(r, ""), f"{r}: recurso sin código Kotlin de la lección con el que compilarlo"))
                    continue
                completar_unidad(u, base_kmp, catalogo_m0, deps_acumuladas, plugins_acum, historial, omitidos)
                todas[uid] = u
                # historial para arrastre (solo lo que viene de la lección)
                for r, c in u.archivos.items():
                    o = u.origen.get(r, "")
                    if isinstance(c, str) and not r.startswith("__") and re.match(rf"^{re.escape(curso)}/modulo-\d+\.md:\d+$", o):
                        historial.setdefault((curso, u.proyecto), []).append((mod, r, c, o))
    # proyecto acumulado: lo que tiene el alumno que sigue todo el curso en un único proyecto
    for curso in CURSOS:
        lecc = re.compile(rf"^{re.escape(curso)}/modulo-\d+\.md:\d+$")
        acum = Unidad(f"{CORTO[curso]}-acumulado-academia", curso, 99, "academia", "android" if curso == "android" else "kmp")
        mods = sorted(u.mod for u in todas.values() if u.curso == curso and u.proyecto == "academia" and not u.padre)
        if not mods:
            continue
        for u in sorted((u for u in todas.values() if u.curso == curso and u.proyecto == "academia" and not u.padre), key=lambda x: x.mod):
            for r, c in u.archivos.items():
                o = u.origen.get(r, "")
                if isinstance(c, str) and lecc.match(o) and not r.endswith("libs.versions.toml") and not (curso == "kotlin-multiplatform" and r in ("settings.gradle.kts", "shared/build.gradle.kts")):
                    acum.poner(r, c, o)
        acum.mod = mods[-1]
        acum.linea_ref = f"{curso}/modulo-{mods[0]}.md:1"
        acum.notas.append(f"proyecto acumulado de los módulos {mods[0]}–{mods[-1]}: un solo proyecto academia con todos los archivos (el posterior reemplaza al anterior en la misma ruta), como lo tendría quien sigue el curso de corrido")
        sin_uso = []
        completar_unidad(acum, base_kmp, catalogos_m0.get(curso), deps_curso.get(curso, []), plugins_curso.get(curso, []), {}, sin_uso)
        acum.tareas = [t for t in acum.tareas if not re.search(r"projects|tasks|bundle|lint|assembleRelease|Benchmark|dependencies", t)]
        todas[acum.uid] = acum
    # laboratorios de examples/
    for u in unidades_laboratorios(omitidos, base_kmp, por_curso_items):
        todas[u.uid] = u
    # variantes de fallo deliberado
    variantes = []
    for u in list(todas.values()):
        for it in u.archivos.pop("__fallos__", []):
            var = variante_fallo(u, it, omitidos)
            if var:
                variantes.append(var)
    for v in variantes + variantes_resultado_esperado(todas, omitidos):
        todas[v.uid] = v
    return todas, omitidos


def completar_unidad(u: Unidad, base_kmp, catalogo_m0, deps_acum, plugins_acum, historial, omitidos):
    fusiones = u.archivos.pop("__fusiones__", [])
    anexos = u.archivos.pop("__anexos__", "")
    u.origen.pop("__anexos__", None)
    fallos = u.archivos.get("__fallos__")
    # arrastre: símbolos usados y no declarados que existen en módulos anteriores del mismo proyecto
    if u.plataforma in ("kmp", "android"):
        hist = historial.get((u.curso, u.proyecto), [])
        for _ in range(4):
            decl = set()
            texto_total = ""
            for r, c in u.archivos.items():
                if isinstance(c, str) and r.endswith(".kt"):
                    decl |= declarados(c)
                    texto_total += c + "\n"
            importados = set(re.findall(r"^import\s+[\w.]+\.(\w+)\s*$", texto_total, re.M))
            for r, c in u.archivos.items():
                if isinstance(c, str) and r.endswith(".sq"):
                    for tabla in re.findall(r"CREATE TABLE\s+(\w+)", c, re.I):
                        importados |= {tabla, tabla + "Queries", "Database"}
            faltan = usados(texto_total) - decl - STD - importados
            nuevos = 0
            for nombre in sorted(faltan):
                prov = None
                for (m, r, c, o) in hist:
                    if r.endswith(".kt") and es_principal(r) and nombre in declarados_sup(c) and r not in u.archivos:
                        prov = (m, r, c, o)   # el más reciente gana
                if prov and not (declarados(prov[2]) & decl):
                    u.poner(prov[1], prov[2], prov[3] + " (arrastrado de un módulo anterior: lo usa este módulo)")
                    u.notas.append(f"arrastra {prov[1]} del módulo {prov[0]} (define {nombre})")
                    decl |= declarados(prov[2])
                    nuevos += 1
            if not nuevos:
                break
    if u.plataforma == "kmp":
        completar_kmp(u, base_kmp, fusiones, historial, omitidos)
    elif u.plataforma == "android":
        completar_android(u, catalogo_m0, deps_acum, plugins_acum, fusiones, anexos, omitidos)
    else:
        completar_jvm(u, fusiones, omitidos)


def tareas_leccion(u: Unidad):
    out = []
    for args, origen in u.tareas:
        toks = [t for t in shlex.split(args) if not t.startswith("--scan")]
        limpios = []
        saltar = False
        for t in toks:
            if saltar:
                saltar = False
                continue
            if t in ("--tests", "--configuration", "--dependency", "--group"):
                saltar = True
                continue
            if t.startswith("-") or t.startswith(">") or t == "|":
                continue
            limpios.append(t)
        out.extend(limpios)
    vistos = []
    for t in out:
        if t not in vistos:
            vistos.append(t)
    return vistos


def completar_kmp(u: Unidad, base_kmp, fusiones, historial, omitidos):
    propio_settings = "settings.gradle.kts" in u.archivos
    # infraestructura de convention plugins de un módulo anterior (p. ej. rutaflow.kmp.library)
    usa_conv = any(isinstance(c, str) and 'id("rutaflow.' in c for c in u.archivos.values())
    if usa_conv and not any(r.startswith("build-logic/") for r in u.archivos):
        hist = historial.get((u.curso, u.proyecto), [])
        for (m, r, c, o) in reversed(hist):
            if (r.startswith("build-logic/") or r in ("gradle/libs.versions.toml", "settings.gradle.kts") or re.match(r"^[\w-]+/build\.gradle\.kts$", r)) and r not in u.archivos:
                u.poner(r, c, o + f" (arrastrado del módulo {m}: el plugin de convención vive allí)")
        u.notas.append("arrastra build-logic/, catálogo y settings del módulo donde se definió el plugin de convención")
        propio_settings = "settings.gradle.kts" in u.archivos
    modulos = sorted({r.split("/")[0] for r in u.archivos if "/src/" in r and not r.startswith("build-logic/")})
    if not modulos and propio_settings:
        modulos = []
    raiz_plana = any(r.startswith("src/") for r in u.archivos)
    # fusiones (fragmentos de build.gradle.kts)
    anexos_build = {}
    for it in fusiones:
        if it.ruta.endswith("libs.versions.toml"):
            omitidos.append((u.curso, it.origen, "fragmento de catálogo sin catálogo completo en la unidad"))
            continue
        if it.ruta.endswith("AndroidManifest.xml"):
            omitidos.append((u.curso, it.origen, "fragmento de manifiesto de composeApp (app Android no compilada: requiere dispositivo)"))
            continue
        imports_frag = re.findall(r"^import\s+[\w.]+\s*$", it.contenido, re.M)
        cuerpo_frag = re.sub(r"^import\s+[\w.]+\s*$\n?", "", it.contenido, flags=re.M)
        env = envolver_fragmento_gradle(cuerpo_frag, "kmp")
        destino = it.ruta if it.ruta.endswith(".gradle.kts") and "/" in it.ruta else "shared/build.gradle.kts"
        refs = set(re.findall(r'project\(":([\w\-]+)"\)', it.contenido))
        if refs - set(modulos):
            omitidos.append((u.curso, it.origen, "fragmento de configuración que usa módulos que la lección no define (" + ", ".join(sorted(refs)) + ")"))
            continue
        if env is not None and imports_frag:
            env = "\n".join(imports_frag) + "\n@@CUERPO@@\n" + env
        if env is None or re.search(r"publishing|abiValidation|version\.properties|readLines", it.contenido):
            omitidos.append((u.curso, it.origen, "fragmento de configuración Gradle que la lección no da como archivo completo"))
            continue
        anexos_build.setdefault(destino, []).append((env, it.origen))
    # módulos KMP sin build propio: se sintetiza
    sintet_total = []
    flags = {"android": False, "ios": False, "compose": False}
    if not raiz_plana:
        for mod in modulos or ["shared"]:
            bpath = f"{mod}/build.gradle.kts"
            if bpath in u.archivos:
                if re.search(r"\bios\w*\(\)|iosSimulatorArm64|rutaflow\.kmp\.library", u.archivos[bpath]) or usa_conv:
                    flags["ios"] = True
                continue
            ns = "com.academia.kmp" if u.proyecto == "academia" else ("co.rutaflow." + mod.lower().replace("-", ""))
            base_l = base_kmp.get("shared/build.gradle.kts", (None, None))[0] if (mod == "shared" and len(modulos or ["shared"]) == 1) else None
            if any("/src/ios" in r or "/src/apple" in r for r in u.archivos):
                u.ios = True
            # fragmentos con iOS/cinterop fuerzan targets iOS
            if any("ios" in e.lower() for e, _ in anexos_build.get(bpath, [])):
                u.ios = True
            texto, sintet, fl = construir_build_kmp(u, mod, ns, raiz_con_versiones=len(modulos or ["shared"]) == 1, base_leccion=base_l)
            for k in flags:
                flags[k] = flags[k] or fl[k]
            u.poner(bpath, texto, (base_kmp["shared/build.gradle.kts"][1] + " (base del Paso 0" + (", ampliada por el kit)" if texto != base_l else ")")) if base_l else "sintetizado por el kit (la lección no da este build.gradle.kts)")
            sintet_total += [f"{mod}: {s}" for s in sintet]
        if not propio_settings:
            base_s = base_kmp.get("settings.gradle.kts", (None, None))
            google = flags["android"] or flags["compose"]
            nombre = "academia-kmp" if u.proyecto == "academia" else "rutaflow"
            mods = modulos or ["shared"]
            texto = settings_kmp(nombre, mods, google, base_s[0] if mods == ["shared"] else None)
            u.poner("settings.gradle.kts", texto, base_s[1] + (" (Paso 0)" if texto == base_s[0] else " (Paso 0, ampliado por el kit: google() / módulos)"))
            if len(mods) > 1:
                # versiones de plugins en la raíz para no cargarlos varias veces
                pl = [f'    kotlin("multiplatform") version "{KOTLIN}" apply false']
                todo = "\n".join(c for c in u.archivos.values() if isinstance(c, str))
                if "plugin.serialization" in todo:
                    pl.append(f'    kotlin("plugin.serialization") version "{KOTLIN}" apply false')
                if "org.jetbrains.compose" in todo:
                    pl.append(f'    id("org.jetbrains.compose") version "{V["cmp"]}" apply false')
                    pl.append(f'    kotlin("plugin.compose") version "{KOTLIN}" apply false')
                if "com.android.library" in todo:
                    pl.append(f'    id("com.android.library") version "{V["agp"]}" apply false')
                if "app.cash.sqldelight" in todo:
                    pl.append(f'    id("app.cash.sqldelight") version "{V["sqldelight"]}" apply false')
                u.poner("build.gradle.kts", "plugins {\n" + "\n".join(pl) + "\n}\n", "sintetizado por el kit (raíz multi-módulo)")
        else:
            # proyecto con settings de la lección: si falta un build de módulo incluido, se anota
            for mod in modulos:
                if f"{mod}/build.gradle.kts" not in u.archivos:
                    u.notas.append(f"el módulo {mod} no tiene build.gradle.kts en la lección")
    for destino, lista in anexos_build.items():
        if destino not in u.archivos:
            for _, o in lista:
                omitidos.append((u.curso, o, f"fragmento para {destino}, que no existe en la unidad"))
            continue
        for env, o in lista:
            if re.match(r"\s*sqldelight\s*\{", env) and "// sqldelight (kit)" in u.archivos[destino]:
                u.archivos[destino] = re.sub(r"\n// sqldelight \(kit\)\nsqldelight \{.*?\n\}\n", "\n", u.archivos[destino], flags=re.S)
            if "@@CUERPO@@" in env:
                imps, env = env.split("\n@@CUERPO@@\n", 1)
                u.archivos[destino] = imps + "\n" + u.archivos[destino]
            u.archivos[destino] += "\n// --- fragmento de la lección " + o + " ---\n" + env + "\n"
            u.origen[destino] += f"; + fragmento {o}"
            if "ios" in env.lower():
                u.ios = True
    if flags["android"] or any("com.android" in c for c in u.archivos.values() if isinstance(c, str)):
        u.poner("gradle.properties", "org.gradle.jvmargs=-Xmx4g -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nandroid.builtInKotlin=false\nandroid.newDsl=false\n",
                "sintetizado por el kit (AGP 9 con KMP + com.android.library en modo heredado)")
    else:
        u.poner("gradle.properties", "org.gradle.jvmargs=-Xmx3g -Dfile.encoding=UTF-8\n", "sintetizado por el kit")
    # recursos de Compose referenciados que no existen: marcador de posición
    for r, c in list(u.archivos.items()):
        if isinstance(c, str) and r.endswith(".kt"):
            for d in set(re.findall(r"Res\.drawable\.(\w+)", c)):
                mod = r.split("/")[0]
                if not any(re.search(rf"/composeResources/drawable[^/]*/{d}\.\w+$", x) for x in u.archivos):
                    u.poner(f"{mod}/src/commonMain/composeResources/drawable/{d}.xml",
                            '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24">\n    <path android:fillColor="#FF000000" android:pathData="M2,2h20v20h-20z"/>\n</vector>\n',
                            "sintetizado por el kit: imagen de marcador (la lección supone que ya tienes el recurso)")
                    u.notas.append(f"imagen de marcador para Res.drawable.{d}")
    # tareas
    lec = tareas_leccion(u)
    estandar = []
    if raiz_plana or propio_settings:
        incluidos = set(re.findall(r'"?:([\w\-]+)"', u.archivos.get("settings.gradle.kts", "")))
        estandar = [t for t in lec if not t.startswith(":") or t.split(":")[1] in incluidos]
        if not estandar:
            estandar = ["build"]
    else:
        for mod in modulos or ["shared"]:
            estandar += [f":{mod}:compileKotlinMetadata", f":{mod}:jvmTest"]
            if flags["android"]:
                estandar += [f":{mod}:compileDebugKotlinAndroid"]
        for t in lec:
            if re.search(r"Ios|^ios|Apple|XCFramework|[Mm]acos", t.rsplit(":", 1)[-1]):
                continue
            if t.endswith(("allTests", "assemble", "compileKotlinMetadata", "jvmTest", "build")):
                continue
            estandar.append(t)
    def es_ios(t):
        nombre = t.rsplit(":", 1)[-1]
        return bool(re.search(r"Ios|^ios|XCFramework|[Mm]acos|Apple", nombre))
    if not (raiz_plana or propio_settings):
        estandar += [t for t in lec if es_ios(t)]
    tareas_ios = [t for t in estandar if es_ios(t)]
    estandar = [t for t in estandar if t not in tareas_ios]
    if u.ios or flags["ios"]:
        u.ios = True
        for mod in (modulos or ["shared"]) if not (raiz_plana) else [""]:
            pre = f":{mod}:" if mod else ""
            u.tareas_ios_test.append(pre + "iosSimulatorArm64Test")
            u.tareas_ios_link.append(pre + "compileTestKotlinIosSimulatorArm64")
        u.tareas_ios_link += [t for t in tareas_ios if not t.endswith("Test")]
        u.tareas_ios_test += [t for t in tareas_ios if not t.endswith("Test")]
    # allTests incluye iOS: sin simulador se sustituye por jvmTest y allTests pasa a las tareas iOS
    if u.ios:
        for t in estandar:
            if t.endswith("allTests") and t not in u.tareas_ios_test:
                u.tareas_ios_test.append(t)
    estandar = [t.replace("allTests", "jvmTest") if (u.ios and t.endswith("allTests")) else t for t in estandar]
    u.tareas = list(dict.fromkeys(estandar))
    u.tareas_ios_test = list(dict.fromkeys(u.tareas_ios_test))
    u.tareas_ios_link = list(dict.fromkeys(u.tareas_ios_link))
    u.gradle = "kmp"
    u.jdk = "kmp"
    u.sintetizado = sintet_total


def completar_android(u: Unidad, catalogo_m0, deps_acum, plugins_acum, fusiones, anexos, omitidos):
    ns, nombre_app, tema_fun = proyecto_android_info(u.proyecto)
    tema_estilo = "Theme." + re.sub(r"\W", "", nombre_app.title().replace("-", ""))
    sintet = [f"plantilla «Empty Activity» de Android Studio (AGP {V['agp']}, Compose BOM {V['composeBom']}, compileSdk 36): la lección la genera con el asistente"]
    # catálogo
    toml = catalogo_plantilla()
    orig_toml = "sintetizado por el kit: catálogo de la plantilla Empty Activity"
    if catalogo_m0:
        toml, nts = fusionar_toml(toml, catalogo_m0[0])
        orig_toml += f" + catálogo del curso {catalogo_m0[1]}"
    for it in fusiones:
        if it.ruta.endswith("libs.versions.toml"):
            toml, nts = fusionar_toml(toml, it.contenido)
            orig_toml += f" + {it.origen}"
            for n in nts:
                u.notas.append(f"catálogo {it.origen}: {n}")
    if "gradle/libs.versions.toml" in u.archivos and u.mod == 0:
        u.archivos.pop("gradle/libs.versions.toml")
    # módulos: app + otros con fuentes
    otros = sorted({r.split("/")[0] for r in u.archivos if "/src/" in r and not r.startswith("app/")} - {"servidor"})
    if any(r.startswith("macrobenchmark/") for r in u.archivos) or any(r.startswith("feature/") for r in u.archivos):
        for r in [r for r in u.archivos if r.startswith(("macrobenchmark/", "feature/"))]:
            omitidos.append((u.curso, u.origen[r].split(" ")[0], f"{r}: módulo sin build.gradle.kts completo en la lección (plugin de convención o módulo com.android.test no definidos); ejecutarlo requiere dispositivo"))
            u.archivos.pop(r)
            u.origen.pop(r)
        otros = [o for o in otros if o not in ("macrobenchmark", "feature")]
    # dependencias: acumuladas del curso (solo proyecto academia) + inferidas
    deps = []   # (config, notación, motivo)
    plugins = []
    if u.proyecto == "academia":
        for cfg, nota, o in deps_acum:
            if int(re.search(r"modulo-(\d+)", o).group(1)) <= u.mod:
                deps.append((cfg, nota, o))
        for pl, o in plugins_acum:
            if int(re.search(r"modulo-(\d+)", o).group(1)) <= u.mod:
                plugins.append((pl, o))
    elif u.mod in (15, 16):
        for cfg, nota, o in deps_acum:
            if f"modulo-{u.mod}.md" in o:
                deps.append((cfg, nota, o))
        for pl, o in plugins_acum:
            if f"modulo-{u.mod}.md" in o and pl not in ("google.services", "secrets"):
                plugins.append((pl, o))
    inferidas = []
    for r, c in u.archivos.items():
        if not isinstance(c, str) or not r.endswith(".kt") or not r.startswith("app/"):
            continue
        ss = "androidTest" if "/androidTest/" in r else ("test" if "/test/" in r else "main")
        for imp in IMPORTS.findall(c):
            for rx, ds, pls in DEPS_ANDROID:
                if re.match(rx, imp):
                    for cfg, nota in ds:
                        if ss == "test" and cfg.startswith("androidTest"):
                            continue
                        if ss == "androidTest" and cfg.startswith("test"):
                            continue
                        if ss == "main" and cfg.startswith(("test", "androidTest", "kspAndroidTest")):
                            continue
                        if not any(d[0] == cfg and d[1] == nota for d in deps):
                            deps.append((cfg, nota, "inferida del import " + imp))
                            inferidas.append(f"{cfg}({nota})")
                    for p in pls:
                        if not any(x[0] == p for x in plugins):
                            plugins.append((p, "inferido del import " + imp))
                    break
        if re.search(r"@Serializable", c) and not any(p[0] == "kotlin.serialization" for p in plugins):
            plugins.append(("kotlin.serialization", "inferido de @Serializable"))
        if re.search(r"@HiltAndroidApp|@AndroidEntryPoint|@HiltViewModel", c) and not any(p[0] == "hilt" for p in plugins):
            plugins += [("ksp", "inferido de Hilt"), ("hilt", "inferido de Hilt")]
    if any(p[0] == "room" for p in plugins) and not any("room.runtime" in d[1] for d in deps):
        deps += [("implementation", "libs.androidx.room.runtime", "plugin room"), ("ksp", "libs.androidx.room.compiler", "plugin room")]
    if any(p[0] == "hilt" for p in plugins) and not any("hilt.android" == d[1].replace("libs.", "") for d in deps):
        deps += [("implementation", "libs.hilt.android", "plugin hilt"), ("ksp", "libs.hilt.compiler", "plugin hilt")]
    plugins = [p for p in plugins if p[0] not in ("google.services", "secrets")]
    if any(pl in ("google.services",) for pl, _ in plugins_acum if u.proyecto == "academia"):
        sintet.append("plugin google-services no aplicado: exige google-services.json de un proyecto Firebase real")
    # dependencias cuyo alias no existe en el catálogo: se anotan y se omiten
    validas = []
    for cfg, nota, o in deps:
        alias = re.sub(r"^platform\((.*)\)$", r"\1", nota)
        if alias.startswith("libs.") and not alias_existe(toml, alias[5:]):
            u.notas.append(f"la dependencia {nota} ({o}) no existe en el catálogo")
            continue
        validas.append((cfg, nota, o))
    deps = validas
    # aplicar plugins pedidos
    app_plugins = ["alias(libs.plugins.android.application)", "alias(libs.plugins.kotlin.compose)"]
    raiz_plugins = ["alias(libs.plugins.android.application) apply false", "alias(libs.plugins.kotlin.compose) apply false"]
    for p, o in plugins:
        if not alias_existe(toml, p, plugin=True):
            u.notas.append(f"plugin libs.plugins.{p} ({o}) no existe en el catálogo")
            continue
        a = f"alias(libs.plugins.{p})"
        if a not in app_plugins:
            app_plugins.append(a)
            raiz_plugins.append(a + " apply false")
    extra_android = ""
    extra_raiz = ""
    if any("room" in p for p in app_plugins):
        extra_raiz += '\nroom {\n    schemaDirectory("$projectDir/schemas")   // obligatorio con el plugin de Room\n}\n'
    lineas_deps = []
    for cfg, nota, o in deps:
        nota_s = sustituir_versiones(nota)
        if nota_s.startswith("libs.") or nota_s.startswith("platform("):
            lineas_deps.append(f"    {cfg}({nota_s})")
        else:
            lineas_deps.append(f"    {cfg}({nota_s})")
    lineas_deps = list(dict.fromkeys(lineas_deps))
    # módulos adicionales (core)
    modulos_extra = []
    for o in otros:
        bpath = f"{o}/build.gradle.kts"
        if bpath not in u.archivos:
            es_android = any(re.search(r"^import\s+android", c, re.M) for r, c in u.archivos.items() if r.startswith(o + "/") and isinstance(c, str)) or u.proyecto == "LocationPolicyLab"
            if es_android:
                u.poner(bpath, f"""plugins {{
    alias(libs.plugins.android.library)
}}

android {{
    namespace = "{ns.rsplit('.', 1)[0]}.{o}"
    compileSdk = 36
    defaultConfig {{ minSdk = 24 }}
    compileOptions {{
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }}
}}

dependencies {{
    testImplementation(libs.junit)
}}
""", f"sintetizado por el kit: módulo Android Library :{o} (la lección lo crea con el asistente)")
                if "alias(libs.plugins.android.library) apply false" not in raiz_plugins:
                    raiz_plugins.append("alias(libs.plugins.android.library) apply false")
            else:
                u.poner(bpath, "plugins { alias(libs.plugins.kotlin.jvm) }\n", "sintetizado por el kit")
        contenido_b = u.archivos[bpath]
        for a in re.findall(r"alias\((libs\.plugins\.[\w.]+)\)", contenido_b):
            if a.endswith("kotlin.jvm") and not alias_existe(toml, "kotlin.jvm", plugin=True):
                toml, _ = fusionar_toml(toml, '[plugins]\nkotlin-jvm = { id = "org.jetbrains.kotlin.jvm", version.ref = "kotlin" }\n')
            r_ = f"alias({a}) apply false"
            if r_ not in raiz_plugins:
                raiz_plugins.append(r_)
        modulos_extra.append(o)
        lineas_deps.append(f'    implementation(project(":{o}"))')
    # manifiesto
    app_name_attr = ""
    for r, c in u.archivos.items():
        if isinstance(c, str) and r.startswith("app/src/main") and re.search(r"@HiltAndroidApp\s*\n\s*class\s+(\w+)", c):
            app_name_attr = "." + re.search(r"@HiltAndroidApp\s*\n\s*class\s+(\w+)", c).group(1)
            pk = paquete(c)
            if pk != ns:
                app_name_attr = pk + app_name_attr[0:] if False else f"{pk}{app_name_attr}"
    if "app/src/main/AndroidManifest.xml" not in u.archivos:
        man = manifest_plantilla(ns, tema_estilo, nombre_app, app_name_attr)
        orig_man = "sintetizado por el kit: manifiesto de la plantilla"
        if u.proyecto == "academia" and u.mod >= 5:
            man = fusionar_manifest(man, '<uses-permission android:name="android.permission.INTERNET" />')
            orig_man += " + INTERNET (android/modulo-5.md, Antes de empezar)"
        for it in fusiones:
            if it.ruta.endswith("AndroidManifest.xml"):
                man = fusionar_manifest(man, it.contenido)
                orig_man += f" + fragmento {it.origen}"
        u.poner("app/src/main/AndroidManifest.xml", man, orig_man)
    if u.proyecto == "academia" and u.mod >= 5 and "app/src/debug/AndroidManifest.xml" not in u.archivos:
        u.poner("app/src/debug/AndroidManifest.xml", '<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <application android:usesCleartextTraffic="true" />\n</manifest>\n',
                "android/modulo-5.md (Antes de empezar)")
    # recursos y código de la plantilla
    base_res = f"app/src/main/res"
    if f"{base_res}/values/strings.xml" not in u.archivos:
        extra_str = ""
        if u.proyecto == "academia":
            extra_str = '    <string name="titulo_bienvenida">Bienvenido</string>\n'
        u.poner(f"{base_res}/values/strings.xml", f'<resources>\n    <string name="app_name">{nombre_app}</string>\n{extra_str}</resources>\n',
                "sintetizado por el kit: plantilla" + (" + titulo_bienvenida (android/modulo-0.md, Tema 2)" if extra_str else ""))
    u.poner(f"{base_res}/values/themes.xml", f'<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <style name="{tema_estilo}" parent="android:Theme.Material.Light.NoActionBar" />\n</resources>\n', "sintetizado por el kit: plantilla")
    ruta_main = f"app/src/main/java/{ns.replace('.', '/')}/MainActivity.kt"
    if not any(r.endswith("/MainActivity.kt") and r.startswith("app/") for r in u.archivos):
        u.poner(ruta_main, main_activity_plantilla(ns, tema_fun), "sintetizado por el kit: MainActivity de la plantilla")
    for nombre, cont in tema_plantilla(ns, tema_fun).items():
        u.poner(f"app/src/main/java/{ns.replace('.', '/')}/ui/theme/{nombre}", cont, "sintetizado por el kit: tema de la plantilla")
    u.poner("app/proguard-rules.pro", "# Reglas de la plantilla (vacías)\n", "sintetizado por el kit: plantilla")
    # build de app
    fusion_app = []
    intro = []
    for it in fusiones:
        if it.ruta.endswith(("libs.versions.toml", "AndroidManifest.xml")):
            continue
        if it.linea <= 40:
            intro.append(it.origen)   # bloque de «Antes de empezar»: ya aplicado al leer sus dependencias
            continue
        destino = it.ruta if it.ruta.endswith(".gradle.kts") else "app/build.gradle.kts"
        env = envolver_fragmento_gradle(it.contenido, "android")
        if destino != "app/build.gradle.kts" or env is None:
            omitidos.append((u.curso, it.origen, f"fragmento de configuración Gradle para {destino or 'build.gradle.kts'} que no se puede fusionar sin ambigüedad"))
            continue
        if "signingConfig" in env:
            omitidos.append((u.curso, it.origen, "firma de release con keystore fuera del repositorio (keytool y variables de entorno del dueño): no se automatiza"))
            continue
        fusion_app.append((env, it.origen))
    app = f"""plugins {{
{chr(10).join('    ' + p for p in app_plugins)}
}}

android {{
    namespace = "{ns}"
    compileSdk = 36

    defaultConfig {{
        applicationId = "{ns}"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }}

    buildTypes {{
        release {{
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }}
    }}
    compileOptions {{
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }}
    buildFeatures {{
        compose = true
    }}
}}

kotlin {{
    compilerOptions {{
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
    }}
}}
{extra_raiz}
dependencies {{
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
{chr(10).join(lineas_deps)}
}}
"""
    origen_app = "sintetizado por el kit: app/build.gradle.kts de la plantilla"
    if lineas_deps:
        origen_app += " + dependencias de «Antes de empezar» de cada módulo" if u.proyecto == "academia" else " + dependencias del módulo"
    if intro:
        origen_app += "; «Antes de empezar»: " + ", ".join(intro)
    for env, o in fusion_app:
        app += f"\n// --- fragmento de la lección {o} ---\n{env}\n"
        origen_app += f"; + fragmento {o}"
    if "app/build.gradle.kts" in u.archivos:
        u.notas.append("la lección da un app/build.gradle.kts completo: se usa el de la lección")
    else:
        u.poner("app/build.gradle.kts", app, origen_app)
    if any(r.startswith("app/src/test/") for r in u.archivos) and any("kotlinx.coroutines.test" in c for c in u.archivos.values() if isinstance(c, str)):
        pass
    u.poner("build.gradle.kts", "plugins {\n" + "\n".join("    " + p for p in raiz_plugins) + "\n}\n", "sintetizado por el kit: build.gradle.kts raíz de la plantilla + plugins pedidos")
    u.poner("settings.gradle.kts", f"""pluginManagement {{
    repositories {{
        google {{
            content {{
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }}
        }}
        mavenCentral()
        gradlePluginPortal()
    }}
}}
dependencyResolutionManagement {{
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {{
        google()
        mavenCentral()
    }}
}}

rootProject.name = "{nombre_app}"
include(":app")
""" + "".join(f'include(":{o}")\n' for o in modulos_extra), "sintetizado por el kit: settings de la plantilla" + ("; include de módulos según la lección" if modulos_extra else ""))
    for linea in anexos.strip("\n").split("\n") if anexos else []:
        if not linea:
            continue
        ruta, o, cont = (linea.split("\t") + ["", ""])[:3]
        if ruta == "settings.gradle.kts":
            if cont.strip() not in u.archivos["settings.gradle.kts"]:
                u.archivos["settings.gradle.kts"] += cont + "\n"
            u.origen["settings.gradle.kts"] += f"; + {o}"
    u.poner("gradle/libs.versions.toml", toml, orig_toml)
    u.poner("gradle.properties", "org.gradle.jvmargs=-Xmx4g -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nandroid.nonTransitiveRClass=true\n", "sintetizado por el kit: plantilla")
    # tareas
    tareas = [":app:assembleDebug", ":app:testDebugUnitTest"]
    if any(r.startswith("app/src/androidTest/") for r in u.archivos):
        tareas.append(":app:compileDebugAndroidTestKotlin")
    for o in modulos_extra:
        if "android.library" in u.archivos[f"{o}/build.gradle.kts"]:
            tareas += [f":{o}:assembleDebug", f":{o}:testDebugUnitTest"]
        else:
            tareas += [f":{o}:test"]
    lec = tareas_leccion(u)
    if any("productFlavors" in e for e, _ in fusion_app):
        tareas = [t for t in lec if not re.search(r"dependencies|dependencyInsight|projects|^clean$|tasks", t)] or [":app:assembleDebug", ":app:test"]
    else:
        for t in lec:
            if re.search(r"dependencies|dependencyInsight|^projects$|^clean$|tasks|feature:|^test$|^:app:test$|lint|bundleRelease|assembleRelease", t):
                if re.search(r"bundleRelease|assembleRelease|lint", t) and t not in tareas:
                    tareas.append(t if t.startswith(":") else ":app:" + t)
                continue
            t2 = t if t.startswith(":") else ":app:" + t
            if t2 not in tareas and re.match(r"^:\w+:\w+$", t2):
                tareas.append(t2)
    presentes = {"app"} | set(modulos_extra)
    u.tareas = [t for t in dict.fromkeys(tareas) if not t.startswith(":") or t.split(":")[1] in presentes]
    u.gradle = os.environ.get("GRADLE_ANDROID", "kmp")
    u.jdk = "kmp"   # JDK 25 + Gradle 9.7 para todo (sonda de specs/015, docs/VERSIONES.md)
    u.sintetizado = sintet + ([f"dependencias inferidas de los imports: {', '.join(sorted(set(inferidas)))}"] if inferidas else [])


def completar_jvm(u: Unidad, fusiones, omitidos):
    for it in fusiones:
        omitidos.append((u.curso, it.origen, "fragmento de configuración sin build completo"))
    principal = ""
    for r, c in u.archivos.items():
        if r.endswith(".kt") and re.search(r"^fun main\s*\(", c, re.M):
            principal = (paquete(c) + "." if paquete(c) else "") + Path(r).stem + "Kt"
    u.poner("settings.gradle.kts", f'rootProject.name = "{u.proyecto}"\n', "sintetizado por el kit")
    plugins = f'    kotlin("jvm") version "{KOTLIN}"\n' + ("    application\n" if principal else "")
    u.poner("build.gradle.kts", "plugins {\n" + plugins + "}\n\nrepositories { mavenCentral() }\n" + (f'\napplication {{ mainClass.set("{principal}") }}\n' if principal else ""),
            "sintetizado por el kit: proyecto Kotlin/JVM mínimo" + (" que ejecuta main (equivale a kotlinc + java -jar)" if principal else ""))
    u.tareas = ["run"] if principal else ["build"]
    u.gradle = "kmp"
    u.jdk = "kmp"
    u.sintetizado = ["proyecto Kotlin/JVM mínimo del kit (Kotlin " + KOTLIN + ")"]


# ---------------------------------------------------------------------------
# Laboratorios de examples/
# ---------------------------------------------------------------------------
def unidades_laboratorios(omitidos, base_kmp, por_curso_items):
    out = []
    for man in sorted(EJEMPLOS.glob("*/manifest.json")):
        try:
            datos = json.loads(man.read_text(encoding="utf-8"))
        except Exception:
            continue
        entradas = datos if isinstance(datos, list) else datos.get("items", datos.get("entries", []))
        for e in entradas:
            if not isinstance(e, dict):
                continue
            leccion = e.get("path") or e.get("lesson") or ""
            curso = next((c for c in CURSOS if f"/content/{c}/" in leccion), None)
            if not curso:
                continue
            mod = int(re.search(r"modulo-(\d+)", leccion).group(1))
            for ej in e.get("examples", []):
                p = REPO / ej
                if not p.exists():
                    omitidos.append((curso, f"{ej}:1", "el laboratorio citado no existe en examples/"))
                    continue
                if not p.name.endswith((".kt", ".kts")):
                    omitidos.append((curso, f"{ej}:1", "laboratorio que no es Kotlin/Gradle"))
                    continue
                texto = p.read_text(encoding="utf-8")
                nombre = re.sub(r"[^\w]+", "-", p.parent.parent.name + "-" + p.parent.name + "-" + p.stem).strip("-").lower()
                uid = f"lab-{nombre}"
                ref = f"{ej}:1"
                # línea de la lección donde aparece el mismo archivo
                lin_lec = ""
                for it in por_curso_items[curso][mod]:
                    if it.tipo == "archivo" and Path(it.ruta).name == p.name:
                        lin_lec = it.origen
                if curso == "kotlin-multiplatform" and "fun main" in texto and "import android" not in texto:
                    u = Unidad(uid, curso, mod, nombre, "jvm")
                    u.poner("src/main/kotlin/" + p.name, texto, ref + (f" (mismo ejemplo que {lin_lec})" if lin_lec else ""))
                    completar_jvm(u, [], omitidos)
                    m = re.search(r'println\("([^"$]+)"\)\s*$', texto, re.M)
                    if m:
                        u.salida = m.group(1)
                else:
                    paq = paquete(texto)
                    proy = proyecto_android(paq, "", "")
                    u = Unidad(uid, curso, mod, proy, "android")
                    ruta = f"app/src/main/java/{paq.replace('.', '/')}/{p.name}"
                    u.poner(ruta, texto, ref + (f" (mismo ejemplo que {lin_lec})" if lin_lec else ""))
                    completar_android(u, None, [], [], [], "", omitidos)
                u.linea_ref = ref
                u.notas.append(f"laboratorio citado por {leccion} ({man.relative_to(REPO)})")
                out.append(u)
    return out


# ---------------------------------------------------------------------------
# Fallos deliberados -> unidades variante
# ---------------------------------------------------------------------------
NO_AUTOMATIZABLE = re.compile(r"\badb\b|emulador|\bdispositivo\b|TalkBack|VoiceOver|Layout Inspector|logcat|parpadea|Xcode|simulador|Play Console|navegador|rota(r|ción)|Recientes|200 %|fuente al|keytool|Firebase|Hot Reload|guarda\b|modo oscuro|casi no se lee|se recorta|script|python|curl|Python", re.I)
NO_PROMETE = re.compile(r"sigue pasando|sigue compilando y|no falla|vuelve a pasar|El test pasa|el build compila|fallaría|podría aceptar|\"funciona\"|parece", re.I)

# Fallos deliberados que exigen un cambio que la prosa describe sin «cambia `A` por `B`».
# (curso, módulo, texto que identifica el párrafo) -> {"ops": [...], "mensaje": None|"texto"}
#   ("reemplazar", sufijo_de_archivo, viejo, nuevo) | ("nuevo", ruta, contenido) | ("tras_paquete", sufijo, texto)
MANUALES = {
    ("kotlin-multiplatform", 0, 'igualdadEsPorValorNoPorIdentidad'): {"ops": [("reemplazar", "/PersonaTest.kt", 'assertEquals(Persona("Ana", 28), Persona("Ana", 28))', 'assertTrue(Persona("Ana", 28) === Persona("Ana", 28))')], "mensaje": ""},
    ("kotlin-multiplatform", 0, 'agrega un cuarto subtipo'): {"ops": [("reemplazar", "/EstadoUI.kt", "    data class Error(val mensaje: String) : EstadoUI()\n}", "    data class Error(val mensaje: String) : EstadoUI()\n    data class Vacio(val razon: String) : EstadoUI()\n}")]},
    ("kotlin-multiplatform", 1, 'intenta pasar `accion: (String) -> Unit`'): {"ops": [("nuevo", "shared/src/commonMain/kotlin/com/academia/kmp/FalloDeliberado.kt", "package com.academia.kmp\n\nfun usoIncorrecto() = procesarLista(listOf(1, 2, 3)) { texto: String -> println(texto) }\n")], "mensaje": ""},
    ("kotlin-multiplatform", 1, 'para usar `run` en vez de `apply`'): {"ops": [("reemplazar", "/ScopeFunctions.kt", "Config().apply {", "Config().run {")], "mensaje": ""},
    ("kotlin-multiplatform", 1, 'invierte el orden a `map` antes de `filter`'): {"ops": [("reemplazar", "/EstadoYColecciones.kt", "filter { it.edad >= 18 }.map { it.nombre }", "map { it.nombre }.filter { it.edad >= 18 }")]},
    ("kotlin-multiplatform", 1, 'cambia la firma de `ruta`'): {"ops": [("reemplazar", "/DslBuilder.kt", "bloque: RutaBuilder.() -> Unit", "bloque: (RutaBuilder) -> Unit")], "mensaje": ""},
    ("kotlin-multiplatform", 1, 'quita `out` de'): {"ops": [("reemplazar", "/Genericos.kt", "Resultado<out T>", "Resultado<T>")]},
    ("kotlin-multiplatform", 2, 'cambia `cargarPantalla` para llamar a `.await()`'): {"ops": [("reemplazar", "/ConcurrenciaEstructurada.kt", "    val usuario = async { obtenerUsuario() }\n    val pedidos = async { obtenerPedidos() }\n    Pair(usuario.await(), pedidos.await())",
                                             "    val usuario = async { obtenerUsuario() }.await()\n    val pedidos = async { obtenerPedidos() }.await()\n    Pair(usuario, pedidos)")], "mensaje": ""},
    ("kotlin-multiplatform", 2, 'mueve el `yield()`'): {"ops": [("reemplazar", "/ErroresYMutex.kt", "        mutex.withLock { // exclusión mutua compatible con suspensión\n            val leido = valor\n            yield()\n            valor = leido + 1\n        }",
                                             "        val leido = mutex.withLock { valor }\n        yield()\n        valor = leido + 1")], "mensaje": ""},
    ("kotlin-multiplatform", 3, 'mueve el contenido de `Plataforma.android.kt` a `commonMain`'): {"ops": [("nuevo", "shared/src/commonMain/kotlin/com/academia/kmp/Plataforma.kt", "package com.academia.kmp\n\nimport android.os.Build\n\nactual fun nombrePlataforma(): String = \"Android ${Build.VERSION.SDK_INT}\"\n")]},
    ("kotlin-multiplatform", 3, 'agrega `"androidMain" to listOf("appleMain"'): {"ops": [("reemplazar", "/JerarquiaSourceSetsTest.kt", '"androidMain" to listOf("commonMain"),', '"androidMain" to listOf("commonMain"),\n        "androidMain" to listOf("appleMain", "commonMain"),')], "mensaje": ""},
    ("kotlin-multiplatform", 4, 'para que reciba directamente la implementación de prueba'): {"ops": [("reemplazar", "/Dominio.kt", "ObtenerTareasPendientesUseCase(private val repositorio: TareaRepository)", "ObtenerTareasPendientesUseCase(private val repositorio: RepositorioEnMemoria)")]},
    ("kotlin-multiplatform", 4, 'cambia la firma de `guardar` en `FakeTareaRepository`'): {"ops": [("reemplazar", "/Repositorio.kt", "    override suspend fun guardar(tarea: Tarea) { datos.add(tarea) }", "    override suspend fun guardar(id: String, titulo: String) { datos.add(Tarea(id, titulo, false)) }")]},
    ("kotlin-multiplatform", 4, 'cambia `single<TareaRepository>'): {"ops": [("reemplazar", "/DiModule.kt", "single<TareaRepository>", "factory<TareaRepository>")], "mensaje": ""},
    ("kotlin-multiplatform", 4, 'en `manejar`, elimina la rama'): {"ops": [("reemplazar", "/ResultadoTest.kt", '    is Resultado.Error -> "error manejado explícitamente: ${resultado.mensaje}"\n', "")]},
    ("kotlin-multiplatform", 5, 'en el mock, cambia el contenido de la respuesta'): {"ops": [("reemplazar", "/NetworkingTest.kt", '"""[{"id":"1","titulo":"Comprar leche"}]"""', '"""{"id":"1","titulo":"Comprar leche"}"""')], "mensaje": ""},
    ("kotlin-multiplatform", 5, 'en `obtenerTareasSeguro`, elimina el `try`'): {"ops": [("reemplazar", "/NetworkingSeguro.kt", "= try {\n    Resultado.Exito(obtenerTareas(client))\n} catch (e: Exception) {\n    Resultado.Error(e.message ?: \"Error de red\")\n}", "= Resultado.Exito(obtenerTareas(client))")], "mensaje": ""},
    ("kotlin-multiplatform", 5, 'quita el bloque `install(Auth)'): {"ops": [("reemplazar", "/ClienteAutenticado.kt", "    install(Auth) {\n        bearer {\n            loadTokens { BearerTokens(\"token-abc123\", \"refresh-xyz\") }\n        }\n    }\n", "")], "mensaje": ""},
    ("kotlin-multiplatform", 6, 'intenta importar `app.cash.sqldelight.driver.android.AndroidSqliteDriver`'): {"ops": [("nuevo", "shared/src/commonMain/kotlin/com/academia/kmp/DriverEnCommon.kt", "package com.academia.kmp\n\nimport app.cash.sqldelight.driver.android.AndroidSqliteDriver\n\nfun driverEnCommon(): AndroidSqliteDriver? = null\n")]},
    ("kotlin-multiplatform", 7, 'agrega `import android.content.Context` dentro de `PantallaTareas.kt`'): {"ops": [("tras_paquete", "/PantallaTareas.kt", "import android.content.Context\n")]},
    ("kotlin-multiplatform", 7, 'por una variable plana `var contador = 0`'): {"ops": [("reemplazar", "/PantallaContador.kt", "var contador by remember { mutableStateOf(0) }", "var contador = 0")]},
    ("kotlin-multiplatform", 7, 'nombra el recurso `entregar-ya`'): {"ops": [("reemplazar", "/values/strings.xml", 'name="entregar"', 'name="entregar-ya"')], "mensaje": ""},
    ("kotlin-multiplatform", 5, 'quita la anotación `@Serializable` de `Envio`'): {"ops": [("reemplazar", "/Envio.kt", "@Serializable\ndata class Envio", "data class Envio")]},
    ("kotlin-multiplatform", 6, 'SELECT id, tituloo FROM Tarea'): {"ops": [("reemplazar", "/Tarea.sq", "selectTodas:\nSELECT * FROM Tarea;", "selectTodas:\nSELECT id, tituloo FROM Tarea;")], "mensaje": "tituloo"},
    ("kotlin-multiplatform", 7, 'quita `mergeDescendants = true`'): {"ops": [("reemplazar", "/TarjetaEnvio.kt", "mergeDescendants = true", "")]},
    ("android", 0, 'mueve el segundo `async` debajo de `detalle.await()`'): {"ops": [("reemplazar", "/CargarResumen.kt", "        val eventos = async { repository.eventos(id) }\n        ResumenEnvio(detalle.await(), eventos.await())",
                               "        val primero = detalle.await()\n        val eventos = async { repository.eventos(id) }\n        ResumenEnvio(primero, eventos.await())")], "mensaje": ""},
    ("android", 0, 'agrega `val invalida = { valor -> valor.toString() }`'): {"ops": [("nuevo", "app/src/main/java/com/academia/lambdas/FalloInferencia.kt", "package com.academia.lambdas\n\nval invalida = { valor -> valor.toString() }\n")], "mensaje": ""},
    ("android", 12, 'agrega en el caso de uso `import android.util.Log`'): {"ops": [("reemplazar", "/PuedeTomarEnvioUseCase.kt", "import javax.inject.Inject\n", "import android.util.Log\nimport javax.inject.Inject\n"),
                               ("reemplazar", "/PuedeTomarEnvioUseCase.kt", "        val conductor = conductores.actual()", "        Log.d(\"Dominio\", \"evaluando ${envio.codigo}\")\n        val conductor = conductores.actual()")]},
    ("android", 4, 'intenta mutar `estado`'): {"ops": [("nuevo", "app/src/main/kotlin/com/academia/android/FalloEncapsulamiento.kt", "package com.academia.android\n\nfun romperEncapsulamiento(viewModel: TareasViewModelConEstado) {\n    viewModel._estado.value = EstadoUI.Cargando\n}\n")], "mensaje": ""},
    ("android", 4, 'alguna rama asigne directamente `viewModel.estado.value'): {"ops": [("nuevo", "app/src/main/kotlin/com/academia/android/FalloUdf.kt", "package com.academia.android\n\nfun romperUdf(viewModel: TareasViewModelConEstado) {\n    viewModel.estado.value = EstadoUI.Cargando\n}\n")], "mensaje": ""},
}


def extraer_mensaje(texto: str) -> str:
    if re.search(r"o similar", texto):
        return ""
    for rx in (r"\*\*Error esperado:?\*\*:?\s*(?:[^`\"«]{0,40}?)[`\"«]([^`\"»]{6,160})[`\"»]",
               r"falla(?:rá|n)?\s+(?:[^`\"«(.]{0,80}?)\bcon\s+(?:un error de \w+\s*)?\(?[`\"«]([^`\"»]{6,160})[`\"»]",
               r"(?:error|excepción)\s+(?:real\s+)?de\s+[\w`]+\s*\([`\"«]([^`\"»]{6,160})[`\"»]"):
        m = re.search(rx, texto)
        if m:
            return m.group(1).strip()
    return ""


def aplicar_ops(v: "Unidad", ops, fuentes) -> str | None:
    """Aplica mutaciones; devuelve None si todo fue bien o el motivo del fallo."""
    for op in ops:
        if op[0] == "nuevo":
            _, ruta, cont = op
            v.archivos[ruta] = cont
            v.origen[ruta] = "mutación del kit (fallo deliberado)"
            v.notas.append(f"variante: crea {ruta}")
            continue
        _, suf, viejo = op[:3]
        cand = [r for r in v.archivos if isinstance(v.archivos[r], str) and (r.endswith(suf) or ("/" + r).endswith(suf))]
        if op[0] == "tras_paquete":
            if len(cand) != 1:
                return f"no hay un único archivo *{suf}"
            r = cand[0]
            v.archivos[r] = re.sub(r"^(package [\w.]+\n)", r"\1\n" + viejo.replace("\\", "\\\\"), v.archivos[r], count=1, flags=re.M)
            v.notas.append(f"variante: añade «{viejo.strip()}» en {r}")
            continue
        nuevo = op[3]
        cand = [r for r in cand if viejo in v.archivos[r]]
        if len(cand) != 1 or v.archivos[cand[0]].count(viejo) != 1:
            return f"`{viejo[:50]}` no aparece exactamente una vez en *{suf}"
        r = cand[0]
        v.archivos[r] = v.archivos[r].replace(viejo, nuevo, 1)
        v.notas.append(f"variante: en {r} cambia «{viejo.strip()[:60]}» por «{nuevo.strip()[:60]}»")
    return None


def nueva_variante(u: "Unidad", sufijo: str, origen: str) -> "Unidad":
    v = Unidad(f"{u.uid}--{sufijo}", u.curso, u.mod, u.proyecto, u.plataforma)
    v.archivos = {k: c for k, c in u.archivos.items() if not k.startswith("__")}
    v.origen = dict(u.origen)
    v.tareas = list(u.tareas)
    v.tareas_ios_test, v.tareas_ios_link, v.ios = list(u.tareas_ios_test), list(u.tareas_ios_link), u.ios
    v.espera = "fail"
    v.padre = u.uid
    v.linea_ref = origen
    v.gradle, v.jdk = u.gradle, u.jdk
    v.sintetizado = u.sintetizado
    return v


def variante_fallo(u: Unidad, it: Item, omitidos):
    texto = re.sub(r"^.*?Fallo deliberado[^:]*:?\*\*:?\s*", "", it.contenido)
    origen = it.origen
    manual = next((v for (c, m, firma), v in MANUALES.items() if c == u.curso and m == u.mod and firma in it.contenido), None)
    if not manual:
        if NO_PROMETE.search(texto) and not re.search(r"ya no compila|ahora falla|falla en tiempo|FALLA", texto):
            omitidos.append((u.curso, origen, "fallo deliberado que no promete un fallo de build o de prueba (observación o razonamiento)"))
            return None
        if NO_AUTOMATIZABLE.search(texto):
            omitidos.append((u.curso, origen, "fallo deliberado que se observa en dispositivo, IDE, script Python o a mano: no automatizable en el Mac sin emulador"))
            return None
        if not re.search(r"falla|no compila|rechaza|FAIL|timeout|indefinidamente|Error esperado", texto, re.I):
            omitidos.append((u.curso, origen, "fallo deliberado sin un fallo verificable descrito"))
            return None
    fuentes = {r: c for r, c in u.archivos.items() if isinstance(c, str) and r.endswith((".kt", ".kts", ".sq", ".toml", ".xml"))
               and not r.startswith("__") and not u.origen.get(r, "").startswith(("sintetizado", "mutación"))}
    v = nueva_variante(u, f"fallo-L{it.linea}", origen)
    if manual:
        ops = manual["ops"]
        v.mensaje = extraer_mensaje(texto) if manual.get("mensaje") is None else manual["mensaje"]
    else:
        m = re.search(r"(?:cambia|reemplaza|sustituye)(?:r)?\s+(?:[^`]{0,80}?)`([^`]+)`\s+por\s+`([^`]+)`", texto, re.I)
        m_quita = re.search(r"(?:quit[aá]|elimin[aá]|eliminando|borr[aá])\s+(?:la línea\s+|la rama\s+|el bloque\s+|la anotación\s+)?`([^`]+)`", texto)
        if m:
            a, b2 = m.group(1), m.group(2)
            if "\\n" in a:
                a, b2 = a.replace("\\n", "\n"), b2.replace("\\n", "\n")
            if "..." in a:
                omitidos.append((u.curso, origen, "fallo deliberado con «…» en el texto a cambiar: requiere edición manual"))
                return None
            ops = [("reemplazar", "", a, b2)]
        elif m_quita and not m_quita.group(1).endswith(".kt"):
            a = m_quita.group(1)
            if "..." in a:
                omitidos.append((u.curso, origen, "fallo deliberado con «…» en el texto a quitar: requiere edición manual"))
                return None
            ops = [("reemplazar", "", a, "")]
        elif m_quita:
            nombre = m_quita.group(1)
            cand = [r for r in fuentes if r.endswith("/" + nombre)]
            if len(cand) != 1:
                omitidos.append((u.curso, origen, f"fallo deliberado: no hay un único archivo {nombre} en la unidad"))
                return None
            v.archivos.pop(cand[0])
            v.origen.pop(cand[0])
            v.notas.append(f"variante: borra {cand[0]}")
            ops = []
        else:
            omitidos.append((u.curso, origen, "fallo deliberado sin cambio concreto «cambia `A` por `B`» / «quita `A`» que se pueda aplicar automáticamente"))
            return None
        # el cambio automático debe caer en un único archivo de la lección que además mencione
        # algún identificador citado en el párrafo (evita mutar el archivo equivocado)
        if ops:
            a = ops[0][2]
            cand = [r for r, c in fuentes.items() if a in c]
            if len(cand) != 1 or fuentes[cand[0]].count(a) != 1:
                omitidos.append((u.curso, origen, f"fallo deliberado: `{a[:50]}` no aparece exactamente una vez en el código de la lección de la unidad"))
                return None
            ids = {t for t in re.findall(r"`([A-Za-z_]\w+)`", texto) if t not in (a, ops[0][3])}
            if ids and not any(i in fuentes[cand[0]] or Path(cand[0]).stem == i for i in ids):
                omitidos.append((u.curso, origen, f"fallo deliberado: el texto `{a[:40]}` aparece en {cand[0]}, que no es el archivo del que habla el párrafo"))
                return None
            ops = [("reemplazar", "/" + cand[0], ops[0][2], ops[0][3])]
        v.mensaje = extraer_mensaje(texto)
    motivo = aplicar_ops(v, ops, fuentes)
    if motivo:
        omitidos.append((u.curso, origen, "fallo deliberado: " + motivo))
        return None
    mutados = [r for r in v.archivos if v.archivos.get(r) != u.archivos.get(r)] + [r for r in u.archivos if r not in v.archivos and not r.startswith("__")]
    if any("/androidTest/" in r for r in mutados):
        omitidos.append((u.curso, origen, "fallo deliberado en una prueba instrumentada (androidTest): solo falla al ejecutarla en un dispositivo"))
        return None
    if it.extra.get("tareas"):
        extra = tareas_leccion(Unidad("x", u.curso, u.mod, u.proyecto, u.plataforma, tareas=[(t, origen) for t in it.extra["tareas"]]))
        v.tareas = [t if t.startswith(":") or u.plataforma != "android" else ":app:" + t for t in extra] or v.tareas
        v.notas.append("tareas del comando que sigue al párrafo: " + " ".join(v.tareas))
    return v


def variantes_resultado_esperado(todas: dict, omitidos):
    """Fallos prometidos en «Resultado esperado» que necesitan dos fases (p. ej. volcado ABI)."""
    out = []
    for u in todas.values():
        if u.curso == "kotlin-multiplatform" and u.proyecto == "ejemplo-abi" and not u.padre:
            lec = leer_leccion(u.curso, u.mod)
            ln = next((i + 1 for i, l in enumerate(lec) if "Si cambiás la firma a" in l), None)
            if not ln:
                continue
            v = nueva_variante(u, f"abi-L{ln}", f"{u.curso}/modulo-{u.mod}.md:{ln}")
            api = next((r for r in v.archivos if r.endswith("Api.kt")), None)
            if not api:
                continue
            v.pre = ["updateKotlinAbi"]
            v.mutacion = {api: v.archivos[api].replace("saludo(nombre: String)", "saludo(nombre: String, idioma: String)", 1)}
            v.tareas = ["checkKotlinAbi"]
            v.notas.append("variante en dos fases: updateKotlinAbi con la firma original; luego cambia saludo(nombre, idioma) y checkKotlinAbi debe fallar")
            out.append(v)
    return out


# ---------------------------------------------------------------------------
# Escritura
# ---------------------------------------------------------------------------
def q(s) -> str:
    return shlex.quote(str(s))


def escribir(todas: dict, omitidos: list, versiones: dict):
    unidades_dir = BUILD / "unidades"
    if unidades_dir.exists():
        shutil.rmtree(unidades_dir)
    unidades_dir.mkdir(parents=True)
    for uid, u in sorted(todas.items()):
        d = unidades_dir / uid
        p = d / "proyecto"
        for r, c in u.archivos.items():
            if not isinstance(c, str) or r.startswith("__"):
                continue
            f = p / r
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_text(c, encoding="utf-8")
        for r, c in u.mutacion.items():
            f = d / "mutacion" / r
            f.parent.mkdir(parents=True, exist_ok=True)
            f.write_text(c, encoding="utf-8")
        lineas = [f"# Unidad {uid}", f"curso: {u.curso}", f"módulo: {u.mod}", f"proyecto: {u.proyecto}",
                  f"referencia: {u.linea_ref}", ""]
        if u.padre:
            lineas += [f"variante de fallo deliberado de {u.padre}: debe FALLAR" + (f" con «{u.mensaje}»" if u.mensaje else ""), ""]
        lineas.append("# archivo\torigen")
        for r in sorted(x for x in u.origen if not x.startswith("__")):
            lineas.append(f"{r}\t{u.origen[r]}")
        if u.sintetizado:
            lineas += ["", "# piezas que la lección no da y el kit sintetiza"] + [f"- {s}" for s in u.sintetizado]
        if u.notas:
            lineas += ["", "# notas"] + [f"- {n}" for n in u.notas]
        (d / "origen.txt").write_text("\n".join(lineas) + "\n", encoding="utf-8")
        detalle = "; ".join(u.notas[:6])
        env = {
            "UNIDAD": uid, "CURSO": u.curso, "ORIGEN": u.linea_ref.replace("kotlin-multiplatform/", "kotlin-multiplatform/").split(" ")[0],
            "PLATAFORMA": u.plataforma, "TAREAS": " ".join(u.tareas),
            "TAREAS_IOS_TEST": " ".join(u.tareas_ios_test), "TAREAS_IOS_LINK": " ".join(u.tareas_ios_link),
            "IOS": "1" if u.ios else "0", "ESPERA": u.espera, "MENSAJE": u.mensaje, "SALIDA": u.salida,
            "PADRE": u.padre, "GRADLE": u.gradle, "JDK": u.jdk, "TIMEOUT": str(u.timeout), "NOTAS": detalle,
            "SINTETIZADO": "sí" if u.sintetizado else "no", "PRE_TAREAS": " ".join(u.pre),
        }
        (d / "unidad.env").write_text("".join(f"{k}={q(v)}\n" for k, v in env.items()), encoding="utf-8")
    vistos = set()
    with open(BUILD / "omitidos.tsv", "w", encoding="utf-8") as f:
        for curso, origen, motivo in omitidos:
            clave = (curso, origen, motivo)
            if clave in vistos:
                continue
            vistos.add(clave)
            f.write(f"{curso}\t{origen.split(' ')[0]}\tSKIP\t{motivo.replace(chr(9), ' ')}\n")
    (BUILD / "versiones.json").write_text(json.dumps(versiones, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    (BUILD / "versiones.env").write_text(f"GRADLE_LECCION={q(GRADLE_LECCION)}\nKOTLIN={q(KOTLIN)}\n" +
                                          "".join(f"VERSION_{k.upper()}={q(v['version'])}\n" for k, v in versiones.items()), encoding="utf-8")


def main():
    con_red = "--resolver" in sys.argv
    versiones = resolver_versiones(con_red)
    V.update({k: v["version"] for k, v in versiones.items()})
    BUILD.mkdir(exist_ok=True)
    todas, omitidos = construir()
    escribir(todas, omitidos, versiones)
    n_var = sum(1 for u in todas.values() if u.padre)
    print(f"unidades: {len(todas)} ({len(todas) - n_var} proyectos + {n_var} variantes de fallo deliberado)")
    print(f"omitidos (SKIP): {len(set(omitidos))}")
    print(f"versiones: {'resueltas en red' if con_red else 'por defecto'} -> build/versiones.json")


if __name__ == "__main__":
    main()
