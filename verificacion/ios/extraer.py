#!/usr/bin/env python3
"""Extrae el código Swift de web/public/content/ios/*.md a unidades verificables (specs/019).

Uso:  python3 verificacion/ios/extraer.py
Genera verificacion/ios/build/<unidad>/ con:
  archivos/   los archivos que la lección manda crear, en las rutas que indica
  pasos.sh    los comandos de la lección (o el typecheck equivalente) que run.sh ejecuta en macOS
  origen.txt  ios/modulo-N.md:LÍNEA de cada bloque usado (LÍNEA = la de la valla ```swift)
  esperado.txt  salida que la lección promete, cuando la promete
y build/_skips.tsv con los bloques marcados SKIP (con motivo) o que el extractor no pudo ubicar.

Cada bloque ```swift de las lecciones debe tener una regla aquí (unidad o SKIP). Las reglas
localizan el bloque por un ANCLA (texto que aparece en un único bloque del módulo), así que
sobreviven a cambios de número de línea. Un bloque sin regla sale como FAIL «sin clasificar».

Nada se inventa: el kit solo (a) copia bloques, (b) reparte un bloque entre archivos cuando la
prosa lo pide, (c) añade los imports que la prosa dice escribir, y (d) reproduce los archivos que
Xcode genera (plantilla App) cuando la lección los da por existentes. Todo eso queda en origen.txt.
"""
from __future__ import annotations

import re
import shutil
import sys
from dataclasses import dataclass, field
from pathlib import Path

KIT = Path(__file__).resolve().parent
REPO = KIT.parent.parent
LECCIONES = REPO / "web" / "public" / "content" / "ios"
BUILD = KIT / "build"
CURSO = "ios"
IOS_POR_DEFECTO = "26.0"  # las lecciones piden Xcode 26: un proyecto nuevo apunta a iOS 26

# ----------------------------------------------------------------------------- plantillas Xcode
# Archivos que «File ▸ New ▸ Project ▸ iOS ▸ App» (SwiftUI) genera y que las lecciones dan por
# existentes («el ContentView.swift generado», «el RutaFlowApp.swift generado»).
PLANTILLA_CONTENT_VIEW = """import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack {
            Image(systemName: "globe")
                .imageScale(.large)
                .foregroundStyle(.tint)
            Text("Hello, world!")
            //@@DENTRO_DEL_VSTACK@@
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
"""

PLANTILLA_APP = """import SwiftUI

@main
struct {tipo}: App {{
    var body: some Scene {{
        WindowGroup {{
            {raiz}
        }}
    }}
}}
"""


# ----------------------------------------------------------------------------- lectura de bloques
@dataclass
class Bloque:
    modulo: int
    linea: int          # línea de la valla de apertura (1-based)
    texto: str
    usado: bool = False

    @property
    def ref(self) -> str:
        return f"{CURSO}/modulo-{self.modulo}.md:{self.linea}"


def leer_bloques() -> dict[int, list[Bloque]]:
    bloques: dict[int, list[Bloque]] = {}
    for md in sorted(LECCIONES.glob("modulo-*.md"), key=lambda p: int(p.stem.split("-")[1])):
        n = int(md.stem.split("-")[1])
        lineas = md.read_text(encoding="utf-8").split("\n")
        i = 0
        while i < len(lineas):
            if lineas[i].strip().startswith("```swift"):
                j = i + 1
                while j < len(lineas) and not lineas[j].strip().startswith("```"):
                    j += 1
                bloques.setdefault(n, []).append(Bloque(n, i + 1, "\n".join(lineas[i + 1:j]) + "\n"))
                i = j
            i += 1
    return bloques


BLOQUES = leer_bloques()
ERRORES: list[tuple[str, str]] = []  # (ref, detalle) → FAIL de extracción


def buscar(modulo: int, ancla: str) -> Bloque | None:
    hallados = [b for b in BLOQUES.get(modulo, []) if ancla in b.texto]
    if len(hallados) > 1:  # un ancla igual al bloque completo lo distingue de otro que lo contiene
        hallados = [b for b in hallados if b.texto.strip() == ancla.strip()] or hallados
    if len(hallados) != 1:
        ERRORES.append((f"{CURSO}/modulo-{modulo}.md:0",
                        f"ancla {'ausente' if not hallados else 'ambigua'} en extraer.py: {ancla!r}"))
        return None
    hallados[0].usado = True
    return hallados[0]


# ----------------------------------------------------------------------------- reglas
@dataclass
class Pieza:
    """Un bloque (o un tramo de él) que va a un archivo."""
    modulo: int
    ancla: str
    ruta: str                     # ruta dentro de la unidad (la que la lección indica)
    desde: str | None = None      # empieza en la primera línea que contiene este texto
    cabecera: str | None = None   # antepone las líneas previas a la primera que contiene este texto
    hasta: str | None = None      # termina antes de la primera línea (posterior) que lo contiene
    prefijo: str = ""             # imports que la prosa manda escribir, o el de la plantilla
    sufijo: str = ""              # p. ej. el #Preview que la prosa manda añadir
    nota: str = ""                # por qué se usó prefijo/sufijo/tramo
    modo: str = "nuevo"           # nuevo | anexar_plantilla | dentro_del_vstack | anexar


@dataclass
class Mutante:
    """Fallo deliberado que la lección promete: debe FALLAR así para dar PASS."""
    nombre: str
    ruta: str                     # archivo de la unidad que se modifica
    viejo: str
    nuevo: str
    patron: str                   # regex (grep -E) que debe aparecer en la salida
    como: str = "falla"           # falla | salida_sin
    descripcion: str = ""


@dataclass
class Unidad:
    nombre: str
    tipo: str                     # ios | ios_tests | script | shell
    piezas: list[Pieza]
    pasos: list[str] = field(default_factory=list)   # tipo shell: comandos de la lección
    verificar: list[str] = field(default_factory=list)  # tipo shell: lo que decide PASS/FAIL
    esperado: str | None = None
    ios: str = IOS_POR_DEFECTO
    modulo_swift: str = "RutaFlowApp"
    plantilla: bool = True        # ios: añadir los archivos que Xcode genera si faltan
    raiz: str = "ContentView()"   # ios: vista raíz del App de la plantilla
    extension: bool = False       # ios: target de extensión (widget)
    tests: list[Pieza] = field(default_factory=list)  # ios_tests: archivos del target de pruebas
    tests_desde: str | None = None  # ios_tests: unidad cuyo código de app reutiliza
    mutantes: list[Mutante] = field(default_factory=list)
    nota: str = ""


@dataclass
class Skip:
    modulo: int
    ancla: str
    motivo: str


def P(m, ancla, ruta, **kw):
    return Pieza(m, ancla, ruta, **kw)


PRACTICA = [
    # «Ejecuta el ejemplo» de las lecciones con código de nivel superior (tabla del capítulo 0)
    "mkdir Practica && cd Practica",
    "swift package init --type executable",
    "rm Sources/Practica/Practica.swift",
    "copiar_archivos",
]
IMPORT_SWIFTUI_PLANTILLA = "import SwiftUI\n\n"
NOTA_PLANTILLA_CV = "se escribe en el ContentView.swift generado por Xcode (la lección no dice reemplazarlo)"

UNIDADES: list[Unidad] = [
    # ======================================================================= Módulo 0
    Unidad("m00-t1-teoria-optionals", "script", [P(0, "explícitamente puede no tener valor", "main.swift")]),
    Unidad("m00-t1-swift-optionals", "shell",
           [P(0, "func etiquetaDestinatario", "SwiftOptionals/Sources/SwiftOptionals/main.swift")],
           pasos=["mkdir SwiftOptionals", "cd SwiftOptionals",
                  "swift package init --type executable", "rm Sources/SwiftOptionals/SwiftOptionals.swift",
                  "copiar_archivos"],
           verificar=["swift_run"],
           esperado="Entregar a: Ana\nSin destinatario\n",
           mutantes=[Mutante("force-unwrap", "SwiftOptionals/Sources/SwiftOptionals/main.swift",
                             '    guard let nombre, !nombre.isEmpty else { return "Sin destinatario" }\n',
                             '    return "Entregar a: \\(nombre!)"\n',
                             r"Unexpectedly found nil",
                             descripcion="Paso 5: return con nombre! termina con force unwrap de nil")]),
    Unidad("m00-t2-teoria-punto", "script", [P(0, "var p2 = p1", "main.swift")]),
    Unidad("m00-t2-teoria-punto-decl", "script", [P(0, "value type: copia independiente", "main.swift")]),
    Unidad("m00-t2-swift-identidad", "shell",
           [P(0, "struct Paquete { var estado: String }", "SwiftIdentidad/Sources/SwiftIdentidad/main.swift")],
           pasos=["mkdir SwiftIdentidad", "cd SwiftIdentidad",
                  "swift package init --type executable", "rm Sources/SwiftIdentidad/SwiftIdentidad.swift",
                  "copiar_archivos"],
           verificar=["swift_run"],
           esperado="creado en ruta\nLuis Luis\n",
           mutantes=[Mutante("let-inmutable", "SwiftIdentidad/Sources/SwiftIdentidad/main.swift",
                             'var original = Paquete(estado: "creado")\n',
                             'let original = Paquete(estado: "creado")\noriginal.estado = "en ruta"\n',
                             r"'let' constant",
                             descripcion="Paso 5: mutar un struct declarado con let no compila")]),
    Unidad("m00-t3-teoria-describible", "script", [P(0, "extension Int: Describible", "main.swift")]),
    Unidad("m00-t3-swift-protocolos-estados", "shell",
           [P(0, "enum EstadoEntrega: Describible", "SwiftProtocolosEstados/Sources/SwiftProtocolosEstados/main.swift")],
           pasos=["mkdir SwiftProtocolosEstados", "cd SwiftProtocolosEstados",
                  "swift package init --type executable", "rm Sources/SwiftProtocolosEstados/SwiftProtocolosEstados.swift",
                  "copiar_archivos"],
           verificar=["swift_run"],
           esperado="En ruta con Ana\n",
           mutantes=[Mutante("switch-no-exhaustivo",
                             "SwiftProtocolosEstados/Sources/SwiftProtocolosEstados/main.swift",
                             "    case fallida(motivo: String)\n",
                             "    case fallida(motivo: String)\n    case entregada\n",
                             r"must be exhaustive",
                             descripcion="Paso 5: case entregada sin cubrir en el switch")]),
    Unidad("m00-t4-rutafoundation", "shell",
           [P(0, "public struct Stop: Equatable", "RutaFoundation/Sources/RutaFoundation/RoutePreparation.swift",
              nota="la lección muestra RoutePreparation.swift en tres bloques consecutivos"),
            P(0, "public enum DuplicateID", "RutaFoundation/Sources/RutaFoundation/RoutePreparation.swift", modo="anexar"),
            P(0, "public final class RouteObserver", "RutaFoundation/Sources/RutaFoundation/RoutePreparation.swift", modo="anexar")],
           pasos=["mkdir RutaFoundation && cd RutaFoundation", "swift package init --type library", "copiar_archivos"],
           verificar=["swift test"]),
    Unidad("m00-t4-swiftcolecciones", "shell",
           [P(0, "public func coordenadasValidas", "SwiftColecciones/Sources/SwiftColecciones/RoutePreparation.swift"),
            P(0, "@testable import SwiftColecciones", "SwiftColecciones/Tests/SwiftColeccionesTests/RoutePreparationTests.swift")],
           pasos=["mkdir SwiftColecciones", "cd SwiftColecciones", "swift package init --type library", "copiar_archivos"],
           verificar=["swift test"],
           mutantes=[Mutante("rango-de-longitud", "SwiftColecciones/Sources/SwiftColecciones/RoutePreparation.swift",
                             "(-90...90)", "(-180...180)", r"recorded an issue|failed",
                             descripcion="Paso 5: con (-180...180) la prueba falla porque 120 no se descarta")]),
    Unidad("m00-t5-propiedad", "shell",
           [P(0, "struct CodigoEntrega: ~Copyable", "Propiedad/Sources/Propiedad/main.swift")],
           pasos=["mkdir Propiedad && cd Propiedad && swift package init --type executable",
                  "rm Sources/Propiedad/Propiedad.swift", "copiar_archivos"],
           verificar=["swift_run"],
           esperado="mostrando 7Q4K\nmostrando 7Q4K\nconfirmando entrega con 7Q4K\ncódigo 7Q4K destruido\nfin\n",
           mutantes=[Mutante("uso-tras-consumir", "Propiedad/Sources/Propiedad/main.swift",
                             "    // confirmar(codigo) // ❌ error: 'codigo' consumed more than once\n",
                             "    confirmar(codigo)\n", r"consumed more than once",
                             descripcion="descomentar la segunda llamada a confirmar(codigo)")]),

    # ======================================================================= Módulo 1
    Unidad("m01-t1-integracion", "ios", [P(1, "let entregada: Bool", "RutaFlowApp/ListaEnvios.swift")],
           raiz="ListaEnvios()",
           nota="la lección pide usar WindowGroup { ListaEnvios() } en el App generado"),
    Unidad("m01-t1-composicion", "ios",
           [P(1, "Text(\"\\(guia): \\(estado)\").padding().background(Color.blue.opacity(0.1))",
              "RutaFlowApp/ContentView.swift", modo="anexar_plantilla",
              sufijo="\n#Preview { ListaEnvios() }\n",
              nota=NOTA_PLANTILLA_CV + "; el #Preview { ListaEnvios() } lo pide la prosa"),
            P(1, "struct ListaEnviosConDuplicacion", "RutaFlowApp/ContentView.swift", modo="anexar",
              nota="Paso 5 (fallo deliberado visual, no de compilación): se declara en el mismo proyecto")]),
    Unidad("m01-teoria-tarjeta-tarea", "ios",
           [P(1, "struct TarjetaTarea: View", "Teoria.swift", prefijo=IMPORT_SWIFTUI_PLANTILLA,
              nota="bloque ilustrativo sin imports: el kit añade import SwiftUI"),
            P(1, "TarjetaTarea(titulo: \"Comprar leche\")", "Teoria.swift", modo="anexar")],
           plantilla=False),
    Unidad("m01-t2-modificadores", "ios",
           [P(1, "Text(\"RF-4471: en ruta\").padding().background(Color.blue)", "RutaFlowApp/ContentView.swift",
              modo="dentro_del_vstack",
              nota="la prosa: «escribe ambas líneas dentro de un VStack en el ContentView.swift generado»"),
            P(1, "struct TarjetaEnvioConOrderIncorrecto", "RutaFlowApp/ContentView.swift", modo="anexar",
              nota="Paso 5: «declara en ese mismo archivo las vistas nuevas»")]),
    Unidad("m01-t3-grid", "ios",
           [P(1, "import SwiftUI\n\nstruct TarjetaEnvio: View {\n    let guia: String\n    let estado: String\n\n",
              "RutaFlowApp/TarjetaEnvio.swift"),
            P(1, "struct ListaEnviosGrid", "RutaFlowApp/ContentView.swift", modo="anexar_plantilla",
              nota=NOTA_PLANTILLA_CV)]),

    # ======================================================================= Módulo 2
    Unidad("m02-teoria-contador", "ios",
           [P(2, "struct PantallaContador", "Teoria.swift", prefijo=IMPORT_SWIFTUI_PLANTILLA,
              nota="bloque ilustrativo sin imports: el kit añade import SwiftUI")], plantilla=False),
    Unidad("m02-t1-estado", "ios", [P(2, "struct DetalleEnvio: View {\n    @State private var entregado", "EstadoDemo/ContentView.swift",
                                      nota="la prosa: «Reemplaza manualmente el contenido de ContentView.swift»")],
           modulo_swift="EstadoDemo", raiz="DetalleEnvio()", nota="la prosa pide WindowGroup { DetalleEnvio() }"),
    Unidad("m02-t2-observable", "ios", [P(2, "var conductorActivo", "EstadoDemo/ContentView.swift",
                                          nota="la prosa: «Reemplaza el ContentView.swift generado»")],
           modulo_swift="EstadoDemo", raiz="ListaEnvios()", nota="la prosa pide WindowGroup { ListaEnvios() }"),
    Unidad("m02-t3-environment", "ios",
           [P(2, "var base = \"https://api.rutaflow.dev\"", "EstadoDemo/ServicioAPI.swift", hasta="@main",
              nota="la prosa reparte el bloque: clase e imports en ServicioAPI.swift"),
            P(2, "var base = \"https://api.rutaflow.dev\"", "EstadoDemo/EstadoDemoApp.swift", desde="@main",
              hasta="struct ListaEnvios", prefijo=IMPORT_SWIFTUI_PLANTILLA,
              nota="tipo @main en el EstadoDemoApp.swift generado (conserva su import SwiftUI)"),
            P(2, "var base = \"https://api.rutaflow.dev\"", "EstadoDemo/ContentView.swift", desde="struct ListaEnvios",
              prefijo="import SwiftUI\n\n", nota="las dos vistas en ContentView.swift «junto con import SwiftUI»")],
           modulo_swift="EstadoDemo"),

    # ======================================================================= Módulo 3
    Unidad("m03-t1-navegacion", "ios", [P(3, "struct ListaEnvios: View {\n    let guias", "RutaFlowApp/AppRutaFlow.swift")],
           raiz="AppRutaFlow()", nota="la prosa pide WindowGroup { AppRutaFlow() }"),
    Unidad("m03-t2-modales", "ios",
           [P(3, "struct ListaEnvios: View {\n    let guias", "RutaFlowApp/AppRutaFlow.swift", nota="proyecto del Tema 1"),
            P(3, "struct OnboardingConductorView", "RutaFlowApp/ContentView.swift")]),
    Unidad("m03-t3-deep-link", "ios",
           [P(3, "struct ListaEnvios: View {\n    let guias", "RutaFlowApp/AppRutaFlow.swift", hasta="struct AppRutaFlow",
              nota="Tema 1 sin su AppRutaFlow: «Reemplaza la struct AppRutaFlow del Tema 1»"),
            P(3, ".onOpenURL { url in\n            guard", "RutaFlowApp/AppRutaFlow.swift", modo="anexar")],
           raiz="AppRutaFlow()"),

    # ======================================================================= Módulo 4
    Unidad("m04-t1-task", "ios", [P(4, "func obtenerEnvio(guia: String)", "RutaFlowApp/DetalleEnvio.swift")],
           raiz='DetalleEnvio(guia: "RF-4471")'),
    Unidad("m04-t2-actor-practica", "shell", [P(4, "actor ContadorEntregas {\n    private var confirmadasHoy", "Practica/Sources/Practica/main.swift")],
           pasos=PRACTICA, verificar=["swift_run"], esperado="101\n"),
    Unidad("m04-t3-mainactor", "ios",
           [P(4, "func obtenerEnvio(guia: String)", "RutaFlowApp/DetalleEnvio.swift", nota="proyecto del Tema 1"),
            P(4, "class DetalleEnvioViewModel", "RutaFlowApp/DetalleEnvioViewModel.swift")],
           raiz='DetalleEnvio(guia: "RF-4471")'),
    Unidad("m04-t4-cancelacion", "shell", [P(4, "@main struct Demo", "cancelacion-swift/Cancelacion.swift")],
           pasos=["mkdir cancelacion-swift", "cd cancelacion-swift", "copiar_archivos",
                  "swiftc -parse-as-library Cancelacion.swift -o cancelacion"],
           verificar=["./cancelacion > salida.txt 2>&1; s=$?; cat salida.txt; [ $s -eq 0 ] || return $s; contiene_salida salida.txt"],
           esperado="Consulta cancelada; no se publica resultado\n"),
    Unidad("m04-t5-swift6-sendable", "shell",
           [P(4, "name: \"RutaFlowKit\",\n    targets:", "RutaFlowKit/Package.swift"),
            P(4, "public actor ContadorEntregas", "RutaFlowKit/Sources/Dominio/Contador.swift"),
            P(4, "func registraMilEntregasSinPerder", "RutaFlowKit/Tests/DominioTests/ContadorTests.swift")],
           pasos=["mkdir -p RutaFlowKit/Sources/Dominio RutaFlowKit/Tests/DominioTests", "copiar_archivos", "cd RutaFlowKit"],
           verificar=["swift test 2>&1 | tee salida.txt; s=${PIPESTATUS[0]}; [ $s -eq 0 ] || return $s; contiene_salida salida.txt"],
           esperado="✔ Test registraMilEntregasSinPerder() passed after "),
    Unidad("m04-t6-posiciones", "shell", [P(4, "final class SimuladorGPS", "Posiciones/Sources/Posiciones/main.swift")],
           pasos=["mkdir Posiciones && cd Posiciones && swift package init --type executable",
                  "rm Sources/Posiciones/Posiciones.swift", "copiar_archivos"],
           verificar=["swift_run"],
           esperado="posición 4.61\nposición 4.62\nposición 4.63\nGPS detenido\nbucle terminado\n",
           mutantes=[Mutante("sin-onTermination", "Posiciones/Sources/Posiciones/main.swift",
                             "        continuacion.onTermination = { _ in gps.detener() } // al cancelar o terminar\n", "",
                             "GPS detenido", como="salida_sin",
                             descripcion="sin onTermination no aparece «GPS detenido»")]),

    # ======================================================================= Módulo 5
    Unidad("m05-teoria-tarea", "script", [P(5, "struct Tarea: Codable, Identifiable", "main.swift")]),
    Unidad("m05-teoria-errorred", "script", [P(5, "case decodificacion", "main.swift")]),
    Unidad("m05-t1-urlsession", "ios",
           [P(5, "nonisolated final class ServidorSimulado", "RutaFlowApp/ServidorSimulado.swift"),
            P(5, "case urlInvalida\n    case servidor\n}", "RutaFlowApp/ConfirmarEntrega.swift"),
            P(5, "@State private var estado = \"sin confirmar\"", "RutaFlowApp/ContentView.swift")]),
    Unidad("m05-t2-errores", "ios",
           [P(5, "nonisolated final class ServidorSimulado", "RutaFlowApp/ServidorSimulado.swift"),
            P(5, "case urlInvalida\n    case servidor\n}", "RutaFlowApp/ConfirmarEntrega.swift", hasta="func confirmarEntrega",
              nota="Tema 1 sin su confirmarEntrega: «Reemplaza la función del Tema 1»"),
            P(5, "enum ErrorEntrega: Error", "RutaFlowApp/ConfirmarEntrega.swift", modo="anexar"),
            P(5, "@State private var estado = \"sin confirmar\"", "RutaFlowApp/ContentView.swift")]),
    Unidad("m05-t3-reintentos", "ios",
           [P(5, "nonisolated final class ServidorSimulado", "RutaFlowApp/ServidorSimulado.swift"),
            P(5, "case urlInvalida\n    case servidor\n}", "RutaFlowApp/ConfirmarEntrega.swift", hasta="func confirmarEntrega",
              nota="proyecto del Tema 2"),
            P(5, "enum ErrorEntrega: Error", "RutaFlowApp/ConfirmarEntrega.swift", modo="anexar"),
            P(5, "@State private var estado = \"sin confirmar\"", "RutaFlowApp/ContentView.swift"),
            P(5, "func confirmarConReintentos", "RutaFlowApp/Reintentos.swift", nota="la lección no nombra el archivo")]),

    # ======================================================================= Módulo 6
    Unidad("m06-teoria-model-query", "ios",
           [P(6, "class Tarea {\n    var titulo: String", "Teoria.swift", prefijo="import SwiftData\nimport SwiftUI\n\n",
              nota="bloques ilustrativos sin imports: el kit añade SwiftData y SwiftUI"),
            P(6, "struct ListaTareasView: View", "Teoria.swift", modo="anexar")], plantilla=False),
    Unidad("m06-t1-model", "ios", [P(6, "class EnvioLocal {\n    var guia: String\n    var pin: String\n    var sincronizado: Bool\n    init",
                                     "RutaFlowApp/EnvioLocal.swift", nota="la lección no nombra el archivo")]),
    Unidad("m06-t2-query", "ios",
           [P(6, "class EnvioLocal {\n    var guia: String\n    var pin: String\n    var sincronizado: Bool\n    init",
              "RutaFlowApp/EnvioLocal.swift", nota="modelo del Tema 1, mismo proyecto"),
            P(6, "struct PendientesDeSincronizar", "RutaFlowApp/PendientesDeSincronizar.swift",
              nota="la lección no nombra el archivo")]),
    Unidad("m06-t3-migracion", "ios", [P(6, "var fotoPath: String?", "RutaFlowApp/EnvioLocal.swift",
                                         nota="reemplaza el modelo del Tema 1")]),
    Unidad("m06-t4-cloudkit", "ios",
           [P(6, "final class NotaCliente", "academia-ios/RutaFlowApp/RutaFlowApp/NotaCliente.swift"),
            P(6, "cloudKitDatabase: .private", "academia-ios/RutaFlowApp/RutaFlowApp/RutaFlowApp.swift"),
            P(6, "struct NotasView: View", "academia-ios/RutaFlowApp/RutaFlowApp/NotasView.swift")]),
    Unidad("m06-t5-archivos", "ios",
           [P(6, "struct AlmacenArchivos", "academia-ios/RutaFlowApp/RutaFlowApp/AlmacenArchivos.swift"),
            P(6, "struct AdjuntarPDF: View", "academia-ios/RutaFlowApp/RutaFlowApp/AdjuntarPDF.swift")]),

    # ======================================================================= Módulo 7
    Unidad("m07-t1-combine", "ios", [P(7, "print(\"buscando: \\(valor)\")", "RutaFlowApp/BuscadorEnviosViewModel.swift",
                                       nota="la lección: «escribe la práctica en ... BuscadorEnviosViewModel.swift»")]),
    Unidad("m07-t2-operadores", "ios", [P(7, "@Published var zonaFiltro", "RutaFlowApp/BuscadorEnviosViewModel.swift",
                                          nota="reemplaza el archivo del Tema 1")]),
    Unidad("m07-t3-combine-vs-async", "shell", [P(7, "PassthroughSubject", "Practica/Sources/Practica/main.swift")],
           pasos=PRACTICA, verificar=["swift_run"], esperado="buscando guía: RF-4471\nRF-4471 entregado\n"),

    # ======================================================================= Módulo 8
    Unidad("m08-t1-mvvm", "ios", [P(8, "// Antes: ListaEnvios hace fetching", "RutaFlowApp/ListaEnvios.swift",
                                    cabecera="// Antes", desde="// Después",
                                    nota="bloque antes/después: imports y servicio + solo el «Después»")]),
    Unidad("m08-t2-capas", "ios",
           [P(8, "// Archivo ViewModels/EnviosViewModel.swift", "RutaFlowApp/ViewModels/EnviosViewModel.swift",
              desde="// Archivo ViewModels/EnviosViewModel.swift", hasta="// Archivo Servicios/ServicioAPI.swift"),
            P(8, "// Archivo ViewModels/EnviosViewModel.swift", "RutaFlowApp/Servicios/ServicioAPI.swift",
              desde="// Archivo Servicios/ServicioAPI.swift")]),
    Unidad("m08-t3-caso-de-uso", "ios", [P(8, "struct EsEnvioAtrasado", "RutaFlowApp/EsEnvioAtrasado.swift",
                                           cabecera="// Antes", desde="// Después",
                                           nota="bloque antes/después: import y Envio + solo el «Después»")]),

    # ======================================================================= Módulo 9
    Unidad("m09-t1-xctest", "ios_tests", [], tests_desde="m08-t3-caso-de-uso",
           tests=[P(9, "final class EsEnvioAtrasadoTests: XCTestCase", "RutaFlowAppTests/EsEnvioAtrasadoXCTests.swift",
                    hasta="// Swift Testing", nota="alternativa XCTest del bloque; app = m08 Tema 3 (EsEnvioAtrasado)")]),
    Unidad("m09-t1-swift-testing", "ios_tests", [], tests_desde="m08-t3-caso-de-uso",
           tests=[P(9, "final class EsEnvioAtrasadoTests: XCTestCase", "RutaFlowAppTests/EsEnvioAtrasadoTests.swift",
                    desde="// Swift Testing", nota="alternativa Swift Testing del bloque; app = m08 Tema 3")]),
    Unidad("m09-t2-async-test", "ios_tests", [], tests_desde="m05-t2-errores",
           tests=[P(9, "func confirmarEntregaDelConductorAsignado", "RutaFlowAppTests/ConfirmarEntregaTests.swift",
                    nota="app = proyecto del módulo 5 Tema 2 (confirmarEntrega con ErrorEntrega)")]),

    Unidad("m09-t3-ui-test", "ios_tests", [],
           tests=[P(9, "final class ConfirmacionEntregaUITests", "RutaFlowAppUITests/ConfirmacionEntregaUITests.swift",
                    nota="target UI Testing: solo typecheck (ejecutarlo exige simulador)")]),

    # ======================================================================= Módulo 10
    Unidad("m10-t1-voiceover", "ios", [P(10, "struct DetalleEntregaView: View", "RutaFlowApp/DetalleEntregaView.swift")]),
    Unidad("m10-t2-hig", "ios", [P(10, "struct TarjetaDireccion: View", "RutaFlowApp/TarjetaDireccion.swift")]),
    Unidad("m10-t3-uikit", "ios", [P(10, "final class StopsViewController: UIViewController {\n    private let tableView",
                                     "RutaFlowApp/StopsViewController.swift")]),
    Unidad("m10-t4-localizacion", "ios", [P(10, "struct ResumenDia: View", "academia-ios/RutaFlowApp/RutaFlowApp/ResumenDia.swift")]),

    # ======================================================================= Módulo 12
    Unidad("m12-t1-sincronizacion", "ios",
           [P(12, "@Attribute(.unique) var id: String", "RutaFlowApp/Dominio/EnvioLocal.swift"),
            P(12, "[EnvioRemoto(id: \"RF-4471\"", "RutaFlowApp/Servicios/ServicioAPI.swift"),
            P(12, "func cargarLocales()", "RutaFlowApp/ViewModels/EnviosViewModel.swift"),
            P(12, "await vm.sincronizar()", "RutaFlowApp/Vistas/ListaEnvios.swift"),
            P(12, "WindowGroup { ListaEnvios(vm: vm) }", "RutaFlowApp/RutaFlowApp.swift")]),
    Unidad("m12-t3-paquete-local", "shell",
           [P(12, "platforms: [.iOS(.v17), .macOS(.v14)]", "academia-ios/Paquetes/RutaFlowKit/Package.swift"),
            P(12, "public struct Tarifa", "academia-ios/Paquetes/RutaFlowKit/Sources/Dominio/Tarifa.swift"),
            P(12, "public struct ColaDeTarifas", "academia-ios/Paquetes/RutaFlowKit/Sources/Red/ColaDeTarifas.swift"),
            P(12, "func tarifaDeDosKilos", "academia-ios/Paquetes/RutaFlowKit/Tests/DominioTests/TarifaTests.swift")],
           pasos=["mkdir -p academia-ios/Paquetes/RutaFlowKit", "cd academia-ios/Paquetes/RutaFlowKit",
                  "swift package init --type library --name RutaFlowKit", "copiar_archivos"],
           verificar=["swift build", "swift test"],
           mutantes=[Mutante("dominio-sin-collections", "academia-ios/Paquetes/RutaFlowKit/Sources/Dominio/Tarifa.swift",
                             "public struct Tarifa", "import Collections\n\npublic struct Tarifa",
                             r"(no such module|unable to resolve module dependency:) 'Collections'",
                             descripcion="import Collections en Dominio no compila")]),

    # ======================================================================= Módulo 13
    Unidad("m13-t1-deeplink", "ios", [P(13, "func envioID(from url: URL", "RutaFlowApp/EnlaceEnvio.swift",
                                        nota="la lección no nombra el archivo")]),
    Unidad("m13-t2-keychain", "ios", [P(13, "func guardarToken(_ data: Data, conductorID", "RutaFlowApp/SesionVault.swift")]),
    Unidad("m13-t4-signpost-app", "ios", [P(13, "let motorSincronizacion = MotorSincronizacion()", "RutaFlowApp/MotorSincronizacion.swift",
                                            nota="la prosa: crea MotorSincronizacion.swift en el target RutaFlowApp")]),
    Unidad("m13-t4-signpost-practica", "shell",
           [P(13, "let motorSincronizacion = MotorSincronizacion()", "Practica/Sources/Practica/main.swift",
              nota="«Ejecuta el ejemplo» de la lección: paquete Practica")],
           pasos=PRACTICA, verificar=["swift build"]),
    Unidad("m13-t5-llavero", "ios", [P(13, "enum Llavero", "Sources/RutaFlowApp/Llavero.swift")]),
    Unidad("m13-t6-permisos", "ios", [P(13, "class GestorUbicacion", "Sources/RutaFlowApp/GestorUbicacion.swift")]),
    Unidad("m13-t7-push", "ios", [P(13, "class AppDelegate", "Sources/RutaFlowApp/AppDelegate.swift")]),
    Unidad("m13-t8-ubicacion", "ios", [P(13, "struct RutaView: View", "academia-ios/RutaFlowApp/RutaFlowApp/RutaView.swift")],
           ios="18.0", nota="la lección pide destino iOS 18+"),
    Unidad("m13-t9-background", "ios", [P(13, "import BackgroundTasks", "academia-ios/RutaFlowApp/RutaFlowApp/RutaFlowApp.swift")]),
    Unidad("m13-t10-faceid", "ios",
           [P(13, "func verificarDueno", "academia-ios/RutaFlowApp/RutaFlowApp/ConfirmacionSegura.swift"),
            P(13, "struct CobroView: View", "academia-ios/RutaFlowApp/RutaFlowApp/CobroView.swift")]),

    # ======================================================================= Módulo 14
    Unidad("m14-t1-cancelacion-tests", "ios_tests",
           [P(14, "var error: Error?", "RutaFlowApp/EnviosViewModel.swift")],
           tests=[P(14, "actor ServicioControlado", "RutaFlowAppTests/CancelacionTests.swift")]),
    Unidad("m14-t2-viewinspector-app", "ios",
           [P(14, "init(servicio: any ServicioEnvios, envios: [Envio] = [])", "RutaFlowApp/EnviosViewModel.swift"),
            P(14, "Text(\"Sin envíos\")", "RutaFlowApp/ListaEnvios.swift")],
           nota="código de app del tema; la prueba con ViewInspector va como SKIP"),
    Unidad("m14-t3-switch-to-latest", "ios", [P(14, ".switchToLatest()", "RutaFlowApp/BuscadorEnviosViewModel.swift")]),
    Unidad("m14-t3-transicion", "ios", [P(14, "struct TransicionEnvio: View", "RutaFlowApp/TransicionEnvio.swift")]),
    Unidad("m14-t4-mapa", "ios", [P(14, "struct MapaRuta: UIViewRepresentable", "RutaFlowApp/MapaRuta.swift")]),
    Unidad("m14-t5-picker", "ios", [P(14, "struct SelectorFotoEntrega", "RutaFlowApp/SelectorFotoEntrega.swift")]),
    Unidad("m14-t6-ocr", "ios", [P(14, "enum OCREntrega", "RutaFlowApp/OCREntrega.swift")]),
    Unidad("m14-t7-gestos", "ios", [P(14, "struct FilaEntrega: View", "academia-ios/RutaFlowApp/RutaFlowApp/FilaEntrega.swift")]),
    Unidad("m14-t8-widget-extension", "ios",
           [P(14, "struct PendientesWidget: Widget", "academia-ios/RutaFlowApp/PendientesWidget/PendientesWidget.swift")],
           modulo_swift="PendientesWidget", plantilla=False, extension=True, ios="17.0",
           nota="target de extensión de widget (iOS 17: containerBackground)"),
    Unidad("m14-t8-widget-app", "ios", [P(14, "func publicarPendientes", "academia-ios/RutaFlowApp/RutaFlowApp/ActualizarWidget.swift")],
           ios="17.0"),
    Unidad("m14-t9-app-intents", "ios", [P(14, "struct EntregasPendientesIntent", "academia-ios/RutaFlowApp/RutaFlowApp/EntregasPendientesIntent.swift")],
           ios="17.0", nota="la lección: «Continúa RutaFlowApp (iOS 17+)»"),
]

FRAG = "fragmento ilustrativo: "
SKIPS: list[Skip] = [
    # Módulo 0
    Skip(0, "switch resultado {", FRAG + "usa `resultado`, que no se declara (ilustra el switch)"),
    # Módulo 1
    Skip(1, "padding queda DENTRO del fondo azul", FRAG + "expresiones sueltas de modificadores, sin vista contenedora"),
    Skip(1, "ZStack { Image(\"fondo\")", FRAG + "VStack suelto, sin vista contenedora"),
    Skip(1, ".padding(16)", FRAG + "corrección del Paso 5 como expresión suelta"),
    # Módulo 2
    Skip(2, "struct PantallaTareas", FRAG + "usa `Tarea`, que el tema no define"),
    Skip(2, "solo las vistas que LEEN `tareas`", FRAG + "usa `Tarea`, que el tema no define"),
    Skip(2, "struct MiApp: App", FRAG + "ContentView sin body y ServicioAPI no definido (ilustra @Environment)"),
    Skip(2, "// Cualquier vista descendiente puede leer", FRAG + "WindowGroup suelto"),
    # Módulo 3
    Skip(3, "NavigationStack(path: $path) {\n    ListaTareasView()\n        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }\n}",
         FRAG + "NavigationStack suelto con tipos no definidos"),
    Skip(3, "path.append(tarea) // navega", FRAG + "sentencia suelta"),
    Skip(3, "path.append(tarea) // push programático", FRAG + "NavigationStack y sentencia sueltos"),
    Skip(3, "FormularioTareaView()", FRAG + "modificadores sin vista base"),
    Skip(3, "InicioView()", FRAG + "TabView suelto con vistas no definidas"),
    Skip(3, "extraerID(de: url)", FRAG + "modificador suelto"),
    # Módulo 4
    Skip(4, "func obtenerUsuario(id: String)", FRAG + "usa `Usuario`, que no se define"),
    Skip(4, "do { usuario = try await obtenerUsuario", FRAG + "modificador .task suelto"),
    Skip(4, "actor CacheTareas", FRAG + "usa `Tarea`, que no se define"),
    Skip(4, "withThrowingTaskGroup(of: Any.self)", FRAG + "funciones no definidas; el grupo no devuelve la tupla"),
    Skip(4, "var envios: [Envio] = [] // garantizado", FRAG + "usa `Envio`, que el tema no define"),
    # Módulo 5
    Skip(5, "// Fragmento: `url`", "la propia lección lo declara fragmento"),
    Skip(5, "func obtenerConReintentos", FRAG + "usa obtenerTareas(), que no se define"),
    Skip(5, "// más tarde, si el usuario cancela:", FRAG + "usa obtenerTareas(), que no se define"),
    Skip(5, "tarea.cancel() // evita procesar", FRAG + "usa obtenerTareas(), que no se define"),
    # Módulo 6
    Skip(6, ".modelContainer(for: Tarea.self)", FRAG + "WindowGroup suelto"),
    Skip(6, "context.insert(Tarea(titulo: \"Nueva tarea\"))", FRAG + "propiedad y sentencias sueltas"),
    Skip(6, ".modelContainer(for: EnvioLocal.self)", "fragmento del Paso 4: WindowGroup suelto y AppRutaFlow no definido"),
    # Módulo 7
    Skip(7, "class BuscadorViewModel: ObservableObject", FRAG + "llama a self?.buscar, que no se define"),
    Skip(7, ".sink { valor in buscar(valor) }", FRAG + "cadena de Combine suelta"),
    Skip(7, "Publishers.CombineLatest($filtro, $orden)", FRAG + "cadena de Combine suelta"),
    # Módulo 8
    Skip(8, "@State var vm: EnviosViewModel  // la vista solo describe", FRAG + "usa EnviosViewModel sin definir"),
    Skip(8, "// Test: EnviosViewModel(servicio: ServicioAPIFalso())", FRAG + "init suelto"),
    # Módulo 9
    Skip(9, "func testSuma()", FRAG + "usa `Calculadora`, que no se define"),
    Skip(9, "@Test func suma()", FRAG + "usa `Calculadora`, que no se define"),
    Skip(9, "// XCTest\nXCTAssertEqual", FRAG + "aserciones sueltas"),
    Skip(9, "func obtieneUsuario()", FRAG + "usa `servicio`, que no se define"),
    Skip(9, "func testCrearTarea()", FRAG + "método de XCTestCase sin clase"),
    # Módulo 10
    Skip(10, "Image(systemName: \"trash\")\n    .accessibilityLabel", FRAG + "expresión suelta"),
    Skip(10, "Image(systemName: \"trash\").accessibilityLabel", FRAG + "expresión suelta"),
    Skip(10, "Text(\"Título\").font(.title)", FRAG + "expresiones sueltas"),
    Skip(10, "enum Section { case main }", "teoría parcial: la lección lista 5 archivos (StopSummary, StopsViewModel, "
         "Representable…) y solo muestra trozos de 2"),
    Skip(10, "private func makeDataSource()", "teoría parcial: métodos de StopsViewController fuera de su clase"),
    Skip(10, "final class StopCell: UITableViewCell", "teoría parcial: usa StopSummary, que la lección no muestra"),
    # Módulo 12
    Skip(12, "remotos.forEach { context.insert($0) }", FRAG + "usa servicio/context no declarados"),
    # Módulo 13
    Skip(13, "url.host == \"tasks.example.com\"", FRAG + "usa Session/TaskID, que no se definen"),
    Skip(13, "func saveToken(", FRAG + "sin imports y usa SessionError, que no se define"),
    Skip(13, "struct PendingMutation", FRAG + "usa store/sendAndReconcile/Operation, que no se definen"),
    Skip(13, "struct ConfirmacionPendiente", "la lección lo declara parcial: el estudiante escribe «el almacén y las "
         "funciones que el fragmento del Paso 4 invoca»"),
    Skip(13, "func measuredSync()", FRAG + "usa syncEngine, que no se define"),
    # Módulo 14
    Skip(14, "import ViewInspector", "requiere la dependencia externa ViewInspector enlazada por Xcode al target de "
         "pruebas; swiftc suelto no la resuelve"),
]


# ----------------------------------------------------------------------------- construcción
def tramo(texto: str, desde: str | None, hasta: str | None) -> str:
    lineas = texto.split("\n")
    ini = 0
    if desde:
        ini = next((i for i, l in enumerate(lineas) if desde in l), None)
        if ini is None:
            raise ValueError(f"marca desde={desde!r} no encontrada")
    fin = len(lineas)
    if hasta:
        fin = next((i for i, l in enumerate(lineas) if i > ini and hasta in l), None)
        if fin is None:
            raise ValueError(f"marca hasta={hasta!r} no encontrada")
    return "\n".join(lineas[ini:fin]).rstrip() + "\n"


def plantilla_cv(inserto: str = "") -> str:
    return PLANTILLA_CONTENT_VIEW.replace("            //@@DENTRO_DEL_VSTACK@@\n", inserto)


def nombre_tipo_app(modulo_swift: str) -> str:
    return re.sub(r"\W", "", modulo_swift) + "App"


def escribir_piezas(piezas: list[Pieza], destino: Path, origen: list[str]) -> dict[str, str]:
    archivos: dict[str, str] = {}
    for p in piezas:
        b = buscar(p.modulo, p.ancla)
        if b is None:
            continue
        try:
            cuerpo = tramo(b.texto, p.desde, p.hasta)
            if p.cabecera:
                cuerpo = tramo(b.texto, None, p.cabecera).rstrip() + "\n\n" + cuerpo
        except ValueError as e:
            ERRORES.append((b.ref, f"extraer.py: {e}"))
            continue
        cuerpo = p.prefijo + cuerpo + p.sufijo
        if p.modo == "anexar_plantilla":
            contenido = plantilla_cv() + "\n" + cuerpo
        elif p.modo == "dentro_del_vstack":
            sangrado = "".join("            " + l + "\n" if l.strip() else "\n" for l in cuerpo.rstrip("\n").split("\n"))
            contenido = plantilla_cv(sangrado)
        elif p.modo == "anexar":
            contenido = archivos.get(p.ruta, "") + "\n" + cuerpo
        else:
            contenido = cuerpo
        archivos[p.ruta] = contenido
        extra = []
        if p.desde or p.hasta or p.cabecera:
            extra.append(f"tramo cabecera<{p.cabecera!r} desde={p.desde!r} hasta={p.hasta!r}")
        if p.nota:
            extra.append(p.nota)
        origen.append(f"{b.ref}\t{p.ruta}" + (f"\t{'; '.join(extra)}" if extra else ""))
    for ruta, contenido in archivos.items():
        f = destino / ruta
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(contenido, encoding="utf-8")
    return archivos


def completar_plantilla(u: Unidad, archivos: dict[str, str], destino: Path, origen: list[str]) -> None:
    """Añade los archivos que Xcode genera y la lección da por existentes."""
    if not u.plantilla:
        return
    carpeta = min((Path(r).parent for r in archivos), key=lambda c: len(c.parts)) if archivos else Path(u.modulo_swift)
    if not any(re.search(r"^\s*@main\b", c, re.M) for c in archivos.values()):
        tipo = nombre_tipo_app(u.modulo_swift)
        ruta = carpeta / f"{tipo}.swift"
        (destino / ruta).parent.mkdir(parents=True, exist_ok=True)
        (destino / ruta).write_text(PLANTILLA_APP.format(tipo=tipo, raiz=u.raiz), encoding="utf-8")
        origen.append(f"plantilla-xcode\t{ruta}\tApp generado por Xcode (WindowGroup {{ {u.raiz} }})")
    if not any(Path(r).name == "ContentView.swift" for r in archivos):
        ruta = carpeta / "ContentView.swift"
        (destino / ruta).write_text(plantilla_cv(), encoding="utf-8")
        origen.append(f"plantilla-xcode\t{ruta}\tContentView generado por Xcode")


def pasos_shell(u: Unidad, verificacion: list[str]) -> str:
    cuerpo = "\n".join(f"{p} || exit $?" for p in u.pasos)  # se detiene en el primer paso que falle
    verif = "\n".join(f"  {v}" if (";" in v or "return" in v) else f"  {v} || return $?" for v in verificacion)
    return f"""{cuerpo}
verificar() {{
{verif}
}}
"""


def generar(u: Unidad, base: Path) -> None:
    d = base / u.nombre
    origen: list[str] = []
    archivos = escribir_piezas(u.piezas, d / "archivos", origen)
    if u.tipo == "ios_tests":
        if u.tests_desde:
            fuente = BUILD / u.tests_desde / "archivos"
            shutil.copytree(fuente, d / "archivos", dirs_exist_ok=True)
            origen.append(f"unidad:{u.tests_desde}\t(código de app)\treutiliza los archivos de esa unidad")
        else:
            completar_plantilla(u, archivos, d / "archivos", origen)
        tests_origen: list[str] = []
        escribir_piezas(u.tests, d / "tests", tests_origen)
        origen += tests_origen
    elif u.tipo == "ios":
        completar_plantilla(u, archivos, d / "archivos", origen)
    if u.esperado is not None:
        (d / "esperado.txt").write_text(u.esperado, encoding="utf-8")
    if u.nota:
        origen.append(f"nota\t-\t{u.nota}")
    (d / "origen.txt").write_text("\n".join(origen) + "\n", encoding="utf-8")

    cabecera = "# Generado por extraer.py: no editar. Lo ejecuta run.sh con lib.sh cargado.\n"
    if u.tipo == "ios":
        script = f'ios_typecheck "{u.ios}" "{u.modulo_swift}" "{1 if u.extension else 0}"\n'
    elif u.tipo == "ios_tests":
        script = f'ios_typecheck_tests "{u.ios}" "{u.modulo_swift}"\n'
    elif u.tipo == "script":
        script = "macos_script_typecheck main.swift\n"
    else:
        script = pasos_shell(u, u.verificar) + "verificar\n"
    (d / "pasos.sh").write_text(cabecera + "set -o pipefail\n" + script, encoding="utf-8")

    for m in u.mutantes:
        generar_mutante(u, m, base, origen)


def generar_mutante(u: Unidad, m: Mutante, base: Path, origen_base: list[str]) -> None:
    d = base / f"{u.nombre}--fallo-{m.nombre}"
    shutil.copytree(base / u.nombre, d)
    f = d / "archivos" / m.ruta
    texto = f.read_text(encoding="utf-8")
    ref = next((o.split("\t")[0] for o in origen_base if o.split("\t")[1:2] == [m.ruta]), "?")
    if texto.count(m.viejo) != 1:
        ERRORES.append((ref, f"extraer.py: el fallo deliberado «{m.nombre}» no encuentra su texto en el bloque"))
        shutil.rmtree(d)
        return
    f.write_text(texto.replace(m.viejo, m.nuevo), encoding="utf-8")
    (d / "origen.txt").write_text(
        f"{ref}\t{m.ruta}\tFALLO DELIBERADO «{m.nombre}»: {m.descripcion}; se espera /{m.patron}/ ({m.como})\n",
        encoding="utf-8")
    patron = m.patron.replace("'", "'\\''")
    verif = [v if v != "swift_run" else "swift_run_sin_comparar" for v in u.verificar]
    funcion = "verif_mutante() {\n" + "\n".join(
        f"  {v}" if (";" in v or "return" in v) else f"  {v} || return $?" for v in verif) + "\n}\n"
    comprobador = "espera_fallo" if m.como == "falla" else "espera_salida_sin"
    u2 = Unidad(u.nombre, u.tipo, [], pasos=u.pasos)
    (d / "pasos.sh").write_text("# Generado por extraer.py: fallo deliberado (PASS si falla como promete la lección)\n"
                                "set -o pipefail\n" + funcion
                                + pasos_shell(u2, [f"{comprobador} '{patron}' verif_mutante"]) + "verificar\n",
                                encoding="utf-8")
    (d / "esperado.txt").unlink(missing_ok=True)


def main() -> int:
    if BUILD.exists():
        shutil.rmtree(BUILD)
    BUILD.mkdir(parents=True)
    nombres = [u.nombre for u in UNIDADES]
    assert len(nombres) == len(set(nombres)), "nombres de unidad repetidos"
    # primero las unidades base de las que otras reutilizan código
    orden = sorted(UNIDADES, key=lambda u: u.tipo == "ios_tests")
    for u in orden:
        generar(u, BUILD)
    filas = []
    for s in SKIPS:
        b = buscar(s.modulo, s.ancla)
        if b is not None:
            filas.append((b.ref, "SKIP", s.motivo))
    for bloques in BLOQUES.values():
        for b in bloques:
            if not b.usado:
                filas.append((b.ref, "FAIL", "bloque sin clasificar en extraer.py (añadir unidad o SKIP)"))
    filas += [(r, "FAIL", d) for r, d in ERRORES]
    with open(BUILD / "_skips.tsv", "w", encoding="utf-8") as fh:
        for ref, estado, detalle in filas:
            fh.write(f"{CURSO}\t{ref}\t{estado}\t{detalle}\n")
    unidades = sorted(p.name for p in BUILD.iterdir() if p.is_dir())
    (BUILD / "_unidades.txt").write_text("\n".join(unidades) + "\n", encoding="utf-8")
    total = sum(len(v) for v in BLOQUES.values())
    n_skip = sum(1 for f in filas if f[1] == "SKIP")
    n_err = sum(1 for f in filas if f[1] == "FAIL")
    n_mut = sum(1 for n in unidades if "--fallo-" in n)
    print(f"extraer: {total} bloques swift; {len(unidades)} unidades ({n_mut} de fallo deliberado); "
          f"{n_skip} SKIP; {n_err} errores de extracción → {BUILD.relative_to(REPO)}")
    for ref, estado, detalle in filas:
        if estado == "FAIL":
            print(f"  FAIL {ref}: {detalle}", file=sys.stderr)
    return 1 if n_err else 0


if __name__ == "__main__":
    sys.exit(main())
