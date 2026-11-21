#!/usr/bin/env bash
# Java · M2 · Texto y entrada/salida de consola — verificación del laboratorio.
# Compila cada ejemplo con --release 25 y comprueba su salida contra los marcadores del borrador.
# Termina en «RESULTADO: OK» si todo cuadra; ante cualquier fallo, «RESULTADO: FALLO» y código 1.
# bash 3.2: sin arreglos asociativos ni mapfile.
#
# Uso:                     ./verificar.sh          (JDK 25 o superior en PATH)
#                          EXIGIR_PTY=1 ./verificar.sh   (falla en vez de omitir lo que necesita terminal)
#                          EXIGIR_GRADLE=1 ./verificar.sh  (falla en vez de omitir si Gradle no arranca)
# Sin JDK 25 instalado, los pasos de Gradle se hacen con la herramienta local y el toolchain prestado:
#   GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts" ./verificar.sh
# Notas de entorno: las comprobaciones que requieren un terminal real (Console no nulo, readPassword sin eco,
# consola.flush) se omiten si no hay pty; en esta máquina se midieron con «script -q /dev/null».
cd "$(dirname "$0")" || exit 1
RAIZ=$(pwd)
OUT="$RAIZ/out"
JFLAGS="-Dstdout.encoding=UTF-8"
BIEN=0
MAL=0
OMITIDOS=0

bien()  { BIEN=$((BIEN + 1));  printf '  [ok]    %s\n' "$1"; }
mal()   { MAL=$((MAL + 1));    printf '  [FALLO] %s\n' "$1"; printf '%s\n' "$2" | sed 's/^/          /' | head -12; }
omitido() { OMITIDOS=$((OMITIDOS + 1)); printf '  [omitido] %s\n' "$1"; }
titulo()  { printf '\n== %s ==\n' "$1"; }

# compila <descripción> <archivos...>
compila() {
    desc=$1; shift
    salida=$(javac --release 25 -encoding UTF-8 -d "$OUT" "$@" 2>&1)
    if [ $? -eq 0 ]; then bien "$desc"; else mal "$desc" "$salida"; fi
}

# espera <descripción> <texto> <clase> [args...]: stdout+stderr debe contener el texto
espera() {
    desc=$1; texto=$2; shift 2
    salida=$(java $JFLAGS ${JAVA_EXTRA:-} -cp "$OUT" "$@" 2>&1)
    if printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc"; else mal "$desc (se esperaba «$texto»)" "$salida"; fi
}

# espera_stdin <descripción> <texto> <entrada> <clase>: la entrada viene por tubería
espera_stdin() {
    desc=$1; texto=$2; entrada=$3; shift 3
    salida=$(printf '%b' "$entrada" | java $JFLAGS ${JAVA_EXTRA:-} -cp "$OUT" "$@" 2>&1)
    if printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc"; else mal "$desc (se esperaba «$texto»)" "$salida"; fi
}

# espera_archivo <descripción> <texto> <archivo> <clase>: la entrada viene redirigida desde un archivo
espera_archivo() {
    desc=$1; texto=$2; archivo=$3; shift 3
    salida=$(java $JFLAGS ${JAVA_EXTRA:-} -cp "$OUT" "$@" < "$archivo" 2>&1)
    if printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc"; else mal "$desc (se esperaba «$texto»)" "$salida"; fi
}

# codigo <descripción> <código esperado> <clase> [args...]
codigo() {
    desc=$1; esperado=$2; shift 2
    java $JFLAGS ${JAVA_EXTRA:-} -cp "$OUT" "$@" >/dev/null 2>&1
    real=$?
    if [ "$real" = "$esperado" ]; then bien "$desc (rc=$real)"; else mal "$desc (rc=$real, se esperaba $esperado)" ""; fi
}

# falla <descripción> <texto> <clase> [args...]: debe fallar y decir el texto
falla() {
    desc=$1; texto=$2; shift 2
    salida=$(java $JFLAGS ${JAVA_EXTRA:-} -cp "$OUT" "$@" 2>&1)
    rc=$?
    if [ $rc -ne 0 ] && printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc (rc=$rc)"; else mal "$desc (rc=$rc; se esperaba fallo con «$texto»)" "$salida"; fi
}

# falla_stdin <descripción> <texto> <entrada> <clase>: igual, con la entrada por tubería
falla_stdin() {
    desc=$1; texto=$2; entrada=$3; shift 3
    salida=$(printf '%b' "$entrada" | java $JFLAGS ${JAVA_EXTRA:-} -cp "$OUT" "$@" 2>&1)
    rc=$?
    if [ $rc -ne 0 ] && printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc (rc=$rc)"; else mal "$desc (rc=$rc; se esperaba fallo con «$texto»)" "$salida"; fi
}

# no_compila <descripción> <texto> <archivo...>: javac debe rechazarlo
no_compila() {
    desc=$1; texto=$2; shift 2
    salida=$(javac --release 25 -encoding UTF-8 -d "$OUT" "$@" 2>&1)
    rc=$?
    if [ $rc -ne 0 ] && printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc"; else mal "$desc (se esperaba «$texto»)" "$salida"; fi
}

# cuenta <descripción> <n> <comando...> — usado con grep, se pasa como cadena única vía sh -c
cuenta() {
    desc=$1; n=$2; cmd=$3
    real=$(sh -c "$cmd")
    if [ "$real" = "$n" ]; then bien "$desc ($n)"; else mal "$desc (obtuve $real, se esperaba $n)" ""; fi
}

# Gradle: usa el wrapper; GRADLE="gradle ..." permite usar un Gradle ya instalado; EXIGIR_GRADLE=1 convierte la omisión en fallo.
gradle_disponible() {
    GRADLE=${GRADLE:-./gradlew}
    if (cd "$RAIZ" && $GRADLE --version >/dev/null 2>&1); then return 0; fi
    if [ "${EXIGIR_GRADLE:-0}" = "1" ]; then
        mal "Gradle no arranca con «$GRADLE»" "$(cd "$RAIZ" && $GRADLE --version 2>&1 | tail -3)"
    else
        omitido "Gradle no arranca con «$GRADLE» (¿sin acceso a services.gradle.org?). Los pasos de Gradle no se ejecutaron."
    fi
    return 1
}

# espera_gradle <descripción> <texto> <orden>: la orden se ejecuta con sh -c desde la raíz y debe terminar bien diciendo el texto
espera_gradle() {
    desc=$1; texto=$2; cmd=$3
    salida=$(cd "$RAIZ" && sh -c "$cmd" 2>&1); rc=$?
    if [ $rc -eq 0 ] && printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc"; else mal "$desc (rc=$rc; se esperaba «$texto»)" "$salida"; fi
}

resultado() {
    printf '\nComprobaciones correctas: %s · fallidas: %s · omitidas: %s\n' "$BIEN" "$MAL" "$OMITIDOS"
    if [ $MAL -ne 0 ]; then echo "RESULTADO: FALLO"; exit 1; fi
    echo "RESULTADO: OK"
}

mkdir -p "$OUT" || exit 1
echo "JDK: $(java -version 2>&1 | head -1)"
echo "Compilación: javac --release 25 -encoding UTF-8 -d out"

# ---------------------------------------------------------------- Tema 1
titulo "Tema 1 · String: inmutabilidad, pool y == frente a equals"
compila "tema-1 compila" tema-1/*.java
espera "buscar por == no encuentra el texto del formulario" 'buscarMal(desde formulario)  : null' CompararGuias
espera "== entre literales concatenados en el compilador es true" 'a == d            : true' PoolDeLiterales
espera "== frente a un String construido en runtime es false" 'a == c            : false' PoolDeLiterales
espera "intern() devuelve la del pool" 'a == c.intern()   : true' PoolDeLiterales
espera "replace sin coincidencia devuelve el mismo objeto" '¿mismo objeto: true' Inmutables
cuenta "una sola entrada de pool para los dos literales iguales" 1 \
    "javap -v -p -cp '$OUT' PoolDeLiterales | grep -c '= String             #8 '"

# ---------------------------------------------------------------- Tema 2
titulo "Tema 2 · API moderna de String"
compila "tema-2 compila" tema-2/ApiTexto.java tema-2/LimpiarYPartir.java tema-2/EscapesInvalidos.java tema-2/PlantillaEtiqueta.java tema-2/SaltosLinea.java
espera "el bloque de texto tiene 4 líneas" 'leídas totales   : 4' ApiTexto
espera "filter(!isBlank) deja 3 envíos" 'sin líneas basura: 3' ApiTexto
espera "strip sí deja solo Bogotá" 'strip()      : «Bogotá» · longitud 6 · U+42 U+6F U+67 U+6F U+74 U+E1' LimpiarYPartir
cuenta "trim conserva el U+2028 delante de Bogotá" 1 \
    "java -cp '$OUT' LimpiarYPartir | grep '^trim' | grep -c 'U+2028 U+42'"
espera "isWhitespace no considera NBSP espacio" 'isWhitespace(U+00A0)        : false' LimpiarYPartir
falla "las escapes procesadas por el compilador estallan al leerlas" 'IllegalArgumentException' EscapesInvalidos
no_compila "el escape ilegal del fuente no compila" 'illegal escape character' tema-2/errores/EscapeIlegal.java

# ---------------------------------------------------------------- Tema 3
titulo "Tema 3 · StringBuilder y el coste real de concatenar"
compila "tema-3 compila" tema-3/Precedencia.java tema-3/Crecimiento.java tema-3/CosteReal.java tema-3/errores/ConstructorReutilizado.java tema-3/errores/ValueOfNull.java tema-3/por-dentro/SumaEncadenada.java
espera "1 + 2 + \"RF\" suma antes de concatenar" '1 + 2 + "RF"        : 3RF' Precedencia
espera "'A' + 1 es aritmética de char" "'A' + 1              : 66" Precedencia
espera "los caracteres copiados de += frente a StringBuilder" 'caracteres copiados : += 2002000 · builder sin capacidad 4592 · builder con capacidad 0' Crecimiento
espera "el bucle con StringBuilder llega a la misma longitud" 'n=2000 : ' CosteReal
espera "setLength olvidado acumula los tres envíos" 'con setLength olvidado: envío 1envío 2envío 3' ConstructorReutilizado
espera "toString() no es una foto del buffer" 'otra == guia           : true' ConstructorReutilizado
falla "valueOf(char[]) con null lanza NPE" 'NullPointerException' ValueOfNull
cuenta "dos makeConcatWithConstants en el bytecode" 2 \
    "javap -c -p -cp '$OUT' SumaEncadenada | grep -c makeConcatWithConstants"

# ---------------------------------------------------------------- Tema 4
titulo "Tema 4 · Unicode de verdad y charsets"
compila "tema-4 compila" tema-4/CodePoints.java tema-4/Normalizacion.java tema-4/Charsets.java tema-4/errores/BytesTruncados.java
espera "el emoji ocupa 2 char y es un code point" 'codePointAt(0)      : U+1F4E6 · 📦 · ocupa 2 char' CodePoints
espera "la línea leída tiene 20 code points" 'code points leídos  : 20' CodePoints
espera "NFC y NFD no son equals" 'equals             : false' Normalizacion
espera "Medellín en UTF-8 son 9 bytes" 'UTF-8      : 9 bytes · 4d 65 64 65 6c 6c c3 ad 6e' Charsets
espera "Medellín en Latin-1 son 8 bytes" 'ISO-8859-1 : 8 bytes' Charsets
JAVA_EXTRA="-Dfile.encoding=ISO-8859-1" espera "con -Dfile.encoding=ISO-8859-1 el charset por defecto cambia" 'Charset.defaultCharset() : ISO-8859-1' Charsets

# ---------------------------------------------------------------- Tema 5
titulo "Tema 5 · printf, String.format y Formatter"
compila "tema-5 compila" tema-5/*.java tema-5/errores/*.java
espera "%,.2f sin idioma usa el locale de la máquina" '%,.2f sin idioma    : 1.234,57' Formato
espera "%,d con Locale.US" '%,d con Locale.US   : 1,234,567' Formato
JAVA_EXTRA="-Duser.language=en -Duser.country=US" espera "el mismo código en inglés da 1,234.57" '%,.2f sin idioma    : 1,234.57' Formato
espera "el TOTAL alineado de la tabla" 'TOTAL  28.300,50' Tabla
espera "el Formatter sobre StringBuilder acumuló 109 caracteres" 'caracteres acumulados en el builder: 109' Tabla
espera "%-3d rellena por la derecha" '|a12 q|' Ancho
espera "%3d rellena por la izquierda" '|a 12q|' Ancho
espera "el ancho en variable se construye, no se pide con *" '|    12|' Ancho
espera "%-*s no existe en Java" "UnknownFormatConversionException: Conversion = '-'" Ancho
espera "%g es formato general con seis cifras" '1,23457e+06' General
espera "stripTrailingZeros se imprime en notación científica" 'BigDecimal stripping   : 1.14E+4' General
espera "toPlainString devuelve el número llano" 'stripping + plain      : 11400' General
falla "%d sobre un Double" 'IllegalFormatConversionException: d != java.lang.Double' ConversionYTipo
falla "faltan argumentos" "MissingFormatArgumentException: Format specifier '%d'" FaltanArgumentos
falla "una conversión inventada" "UnknownFormatConversionException: Conversion = 'q'" ConversionInventada

# ---------------------------------------------------------------- Tema 6
titulo "Tema 6 · IO, Scanner, Console y argumentos"
compila "tema-6 compila" tema-6/*.java tema-6/errores/*.java
espera "el shell parte los argumentos" 'args.length        : 3' Argumentos --guia=RF-000123 --destino=Bogotá 2500
espera "las comillas agrupan: dos piezas" 'args[0]        : «Bogotá Centro» · 13 char · 13 code points' Argumentos "Bogotá Centro" 2500
espera "2.500 no es un número para el programa" '¿solo dígitos? false' Argumentos --peso=2.500
codigo "sin argumentos el programa avisa y sale con 64" 64 Argumentos
espera_stdin "readln con prompt, entrada por tubería" 'destino leído      : «Bogotá»' 'Bogotá\n2500\nextra\n' ConPrompt
espera_stdin "la etiqueta sale alineada" 'etiqueta           : Bogotá → Bogotá        2500 g · 2 kg' 'Bogotá\n2500\nextra\n' ConPrompt
espera_archivo "el lector termina solo: null tras 7 lecturas" 'readln() devolvió null tras 7 lecturas' tema-6/datos/guias.txt LectorDeGuias
espera_archivo "3 válidas y 4 descartadas" 'válidas           : 3 · descartadas: 4' tema-6/datos/guias.txt LectorDeGuias
espera_archivo "el emoji a mitad de campo se descarta por longitud" 'guía «📦 RF-000999» tiene 11 caracteres, se esperan 9' tema-6/datos/guias.txt LectorDeGuias
espera_archivo "el peso en letras no son solo dígitos" 'peso «dos mil» no son solo dígitos' tema-6/datos/guias.txt LectorDeGuias
espera "Scanner sobre el archivo: 149 bytes" 'existe true · 149 bytes' ScannerArchivo tema-6/datos/guias.txt
espera "readString cuenta 145 char y 144 code points" 'readString         : 145 char · 144 code points · 7 líneas' ScannerArchivo tema-6/datos/guias.txt
espera "split(\\R) da 7 piezas" 'split(\R)          : 7 piezas' ScannerArchivo tema-6/datos/guias.txt
espera_stdin "nextInt deja el resto de la línea" 'nextLine() después : « Bogotá» · longitud 7' 'nada\n' TrampaScanner
espera_stdin "con delimitador \R, hasNextLine sigue en true" 'hasNextLine tras agotar: true' 'nada\n' TrampaScanner
espera_stdin "sin terminal, System.console() es null" 'System.console()   : null' 'RF-000123\nRF-000456\n' SinConsola
espera_stdin "aun sin Console, IO.readln() lee" 'IO.readln() sigue funcionando: «RF-000123»' 'RF-000123\nRF-000456\n' SinConsola
espera_archivo "con /dev/null la primera lectura ya es null" 'IO.readln() sigue funcionando: «null»' /dev/null SinConsola
espera_archivo "y null en EOF es true" 'null en EOF: true' /dev/null SinConsola
espera_stdin "readln se queda los bytes en su búfer" 'System.in.available: 0 bytes pendientes en el flujo crudo' 'primera\nsegunda\ntercera\n' MezclaFlujos
espera_stdin "y sin embargo la segunda lectura llega" 'readln() #2        : «segunda»' 'primera\nsegunda\ntercera\n' MezclaFlujos
espera_stdin "\\R dentro de [ ] es PatternSyntaxException" 'PatternSyntaxException: Illegal/unsupported escape sequence near index 3' 'primera\nsegunda\ntercera\n' MezclaFlujos
falla_stdin "cerrar el Scanner de System.in cierra System.in" 'java.io.IOError: java.io.IOException: Stream closed' 'RF-000123\nRF-000456\n' CierreScanner
espera "en es_CO, nextDouble acepta la coma" 'nextDouble()       : 2.5' ScannerConComa
JAVA_EXTRA="-Duser.language=en -Duser.country=US" falla "en en_US el mismo dato revienta antes" 'InputMismatchException' ScannerConComa
cuenta "IO no tiene readInt: 25 símbolos que no existen" 25 \
    "javac --release 25 -encoding UTF-8 -d '$OUT' sonda/SondaIO.java 2>&1 | grep -c 'cannot find symbol'"

# ---------------------------------------------------------------- proyecto guía con Gradle
titulo "Laboratorio · lector de guías de rutaflow-nucleo con Gradle"
espera_gradle "el build está escrito en Kotlin DSL con toolchain y catálogo" 'ok' \
    'grep -q "JavaLanguageVersion.of" build.gradle.kts && grep -q "rutaflow-nucleo" settings.gradle.kts && grep -q "^java = \"25\"" gradle/libs.versions.toml && test -f gradle/wrapper/gradle-wrapper.jar && echo ok'
if gradle_disponible; then
    espera_gradle "gradle test: las 12 pruebas pasan" 'BUILD SUCCESSFUL' "$GRADLE --console=plain test"
    espera_gradle "gradle run lee el archivo de datos del tema 6" 'válidas           : 3 · descartadas: 4' \
        "$GRADLE --console=plain -q run < tema-6/datos/guias.txt"
fi

# ---------------------------------------------------------------- cierre
titulo "Comprobaciones que necesitan un terminal de verdad"
if [ "${EXIGIR_PTY:-0}" = "1" ]; then
    mal "Console no nulo bajo pty" "este script no abre un pty: ejecuta «script -q /dev/null java -cp out SinConsola»"
    mal "readPassword sin eco bajo pty" "ídem"
    mal "consola.flush() necesario para ver la última línea" "ídem"
else
    omitido "System.console() no nulo, readPassword sin eco y consola.flush(): medidos con «script -q /dev/null java -cp out SinConsola», no reproducibles en script"
    omitido "eco del tecleo junto al prompt en ConPrompt: medido bajo pty («script -q /dev/null java -cp out ConPrompt»)"
fi

resultado
