#!/usr/bin/env bash
# Java · M3 · Control de flujo y métodos — verificación del laboratorio.
# Ejecuta cada ejemplo del módulo y comprueba su salida. Sigue ante fallos y termina en «RESULTADO: OK».
# Uso: ./verificar.sh            (necesita JDK 25 en PATH; el laboratorio usa el wrapper de Gradle)
#      GRADLE="gradle --offline" ./verificar.sh   (usa un Gradle ya instalado)
#      GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts" ./verificar.sh   (máquina sin JDK 25: presta el toolchain 27)
#      EXIGIR_GRADLE=1 ./verificar.sh             (falla si Gradle no arranca, en vez de omitirlo)
# --- funciones comunes (bash 3.2: sin arreglos asociativos, sin mapfile) ---
cd "$(dirname "$0")" || exit 1
RAIZ=$(pwd)
TMP=$(mktemp -d 2>/dev/null || mktemp -d -t verificar)
trap 'rm -rf "$TMP"' EXIT
BIEN=0; MAL=0; OMITIDOS=0
J="java -Dstdout.encoding=UTF-8"

bien() { BIEN=$((BIEN + 1)); echo "  [ok]    $1"; }
mal()  { MAL=$((MAL + 1));  echo "  [FALLO] $1"; if [ -n "$2" ]; then echo "$2" | sed 's/^/          /' | head -12; fi; }
omitido() { OMITIDOS=$((OMITIDOS + 1)); echo "  [omitido] $1"; }

# espera <descripción> <texto esperado> <carpeta> <comando...>: el comando debe terminar bien y su salida contener el texto.
espera() {
    desc=$1; texto=$2; dir=$3; shift 3
    salida=$(cd "$RAIZ/$dir" && "$@" 2>&1); codigo=$?
    if [ $codigo -eq 0 ] && printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc"; else mal "$desc (código $codigo; se esperaba «$texto»)" "$salida"; fi
}
# falla_con <descripción> <texto esperado> <carpeta> <comando...>: el comando debe FALLAR y su salida contener el texto.
falla_con() {
    desc=$1; texto=$2; dir=$3; shift 3
    salida=$(cd "$RAIZ/$dir" && "$@" 2>&1); codigo=$?
    if [ $codigo -ne 0 ] && printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc"; else mal "$desc (código $codigo; se esperaba un fallo con «$texto»)" "$salida"; fi
}
# no_contiene <descripción> <texto prohibido> <carpeta> <comando...>: el comando debe terminar bien y su salida NO debe contener el texto.
no_contiene() {
    desc=$1; texto=$2; dir=$3; shift 3
    salida=$(cd "$RAIZ/$dir" && "$@" 2>&1); codigo=$?
    if [ $codigo -eq 0 ] && ! printf '%s\n' "$salida" | grep -F -q -- "$texto"; then bien "$desc"; else mal "$desc (apareció el texto prohibido «$texto»)" "$salida"; fi
}
titulo() { echo; echo "== $1 =="; }

resultado() {
    echo
    echo "Comprobaciones correctas: $BIEN · fallidas: $MAL · omitidas: $OMITIDOS"
    if [ $MAL -ne 0 ]; then echo "RESULTADO: FALLO"; exit 1; fi
    echo "RESULTADO: OK"
}

# Gradle: usa el wrapper; GRADLE="gradle ..." permite usar un Gradle ya instalado; EXIGIR_GRADLE=1 convierte la omisión en fallo.
gradle_disponible() {
    GRADLE=${GRADLE:-./gradlew}
    if (cd "$RAIZ" && $GRADLE --version > "$TMP/gradle-version.txt" 2>&1); then return 0; fi
    if [ "${EXIGIR_GRADLE:-0}" = "1" ]; then
        mal "Gradle no arranca con «$GRADLE»" "$(tail -3 "$TMP/gradle-version.txt")"
    else
        omitido "Gradle no arranca con «$GRADLE» (¿sin acceso a services.gradle.org?). Los pasos de Gradle no se ejecutaron."
    fi
    return 1
}
# ejecuta <descripción> <texto> <carpeta>: compila la carpeta entera y ejecuta la clase.
ejecuta() {
    desc=$1; texto=$2; dir=$3; clase=$4
    espera "$desc" "$texto" "$dir" sh -c "javac --release 25 -encoding UTF-8 -d '$TMP/e' $dir/*.java 2>/dev/null; $J -cp '$TMP/e' $clase"
}
# no_compila <descripción> <mensaje de javac> <carpeta> <archivo>
no_compila() { falla_con "$1" "$2" "$3" javac --release 25 -d "$TMP/err" "$4"; }
# bytecode <descripción> <texto esperado> <carpeta> <archivos> <clase>
bytecode() {
    desc=$1; texto=$2; dir=$3; archivos=$4; clase=$5
    espera "$desc" "$texto" "$dir" sh -c "javac --release 25 -d '$TMP/bc' $archivos && javap -c -p -cp '$TMP/bc' '$clase'"
}

titulo "Tema 1 · if, ternario y condiciones legibles"
espera "el if/else y el ternario dan la misma etiqueta" 'decisión: prioritario · prioritario' tema-1 $J DecidirPrecedencia.java
espera "las dos ramas del ternario se promueven a double" 'rama entera contra rama decimal: 1.0 (Double)' tema-1 $J DecidirPrecedencia.java
espera "el ternario asignado a Object no recuerda el tipo" 'valor guardado en Object: java.lang.String' tema-1 $J DecidirPrecedencia.java
espera "la frontera de peso cae en 1001 g" 'peso 1001 g -> mediano' tema-1 $J DecidirPrecedencia.java
espera "De Morgan coincide en las cuatro combinaciones" 'a=false b=false  !(a&&b)=true  (!a||!b)=true  coinciden=true' tema-1 $J CondicionesLegibles.java
espera "la tabla de legibilidad usa las cuatro filas" 'Barranquilla   3400 g  especial=true pesada=false' tema-1 $J CondicionesLegibles.java
falla_con "el ternario con Integer e int desempaca y lanza" 'java.lang.NullPointerException: Cannot invoke "java.lang.Integer.intValue()" because "<local1>" is null' tema-1/errores sh -c "$J TernarioDesempaqueta.java"
no_compila "el ternario no puede ensanchar un byte" 'possible lossy conversion from int to byte' tema-1/errores ConversionConPerdida.java
no_compila "un = dentro de if no es una comparación" 'incompatible types: int cannot be converted to boolean' tema-1/errores AsignarEnIf.java
no_compila "dos ramas sin tipo común para el destino" 'Integer cannot be converted to String' tema-1/errores TernarioTipos.java
bytecode "el ternario es un salto condicional, no una llamada" 'if_icmple' tema-1/por-dentro Ramas.java Ramas

titulo "Tema 2 · switch: sentencia, expresión, flecha, yield y caída"
espera "sin break se cae al siguiente caso" 'tramos=1  clasico=1110  con break=10  nombre=norte' tema-2 $J ZonaClasica.java
espera "el break corta la caída" 'tramos=1  clasico=1110  con break=10' tema-2 $J ZonaClasica.java
espera "la variable sin asignar se nota en el default" 'tramos=9  clasico=0  con break=0  nombre=sin asignar' tema-2 $J ZonaClasica.java
espera "el switch de enum con flecha da el recargo" 'OCCIDENTE base=1500 con 3400 g=1900' tema-2 $J ZonaConFlecha.java
espera "el bloque con yield produce su valor" 'NORTE base=1200 con 3400 g=1200' tema-2 $J ZonaConFlecha.java
espera "el default atiende lo que la tabla no lista" '(zona sin tabla: se cobra la Tarifa Vieja)' tema-2 $J ZonaConFlecha.java
espera "dos constantes comparten un caso" 'CARIBE base=1500 con 3400 g=1900' tema-2 $J ZonaConFlecha.java
espera "case null atiende el valor nulo" 'null -> sin ciudad' tema-2 $J CambiosYDias.java
espera "switch de String, char y número en una pasada" '02 -> 28 · 04 -> 30 · 13 -> 0' tema-2 $J CambiosYDias.java
espera "las mayúsculas se plegan con un caso de dos letras" 'A -> P · C -> S · Z -> R' tema-2 $J CambiosYDias.java
espera "el nombre de la ciudad llega traducido" 'Bogotá -> norte' tema-2 $J CambiosYDias.java
espera "sin el break clásico la cuenta sigue sumando" '1 tramo -> 1115 (se esperaban 10)' tema-2/errores $J SinRomper.java
falla_con "un null sin case null en switch de String" 'Cannot invoke "String.hashCode()" because "<local1>" is null' tema-2/errores $J NuloSinCaseNull.java
no_compila "una expresión switch no exhaustiva no compila" 'the switch expression does not cover all possible input values' tema-2/errores NoExaustivo.java
no_compila "los patrones primitivos siguen en preview" 'primitive patterns are a preview feature and are disabled by default' tema-2/errores SobreLong.java
no_compila "un switch de long rechaza la etiqueta int de una vez" 'constant label of type int is not compatible with switch selector type long' tema-2/errores LargoConCaseInt.java
falla_con "con --release 25 no se puede probar ninguna preview" 'invalid source release 25 with --enable-preview' tema-2/errores sh -c "javac --release 25 --enable-preview -d '$TMP/pv' SobreLong.java"
no_compila "dos casos con la misma constante" 'duplicate case label' tema-2/errores CaseDuplicado.java
no_compila "una sentencia switch no necesita return pero un método sí" 'missing return statement' tema-2/errores FaltaReturn.java
bytecode "los casos densos salen en una tableswitch" 'tableswitch' tema-2/por-dentro SwitchInterno.java SwitchInterno
bytecode "los casos dispersos salen en una lookupswitch" 'lookupswitch' tema-2/por-dentro SwitchInterno.java SwitchInterno
bytecode "el switch de String se resuelve con hashCode y luego equals" 'String.hashCode' tema-2/por-dentro SwitchInterno.java SwitchInterno
bytecode "case null en un switch de String cambia la implementacion a typeSwitch" 'InvokeDynamic #0:typeSwitch' tema-2 CambiosYDias.java CambiosYDias
bytecode "un enum de la misma unidad se resuelve con ordinal(), sin mapa" 'SwitchInterno$Zona.ordinal' tema-2/por-dentro SwitchInterno.java SwitchInterno
espera "un enum de otra unidad sí necesita el mapa \$SwitchMap\$" '$SwitchMap$ZonaExt:[I' tema-2/por-dentro sh -c "javac --release 25 -d '$TMP/mapa' ZonaExt.java UsaZonaExterna.java && javap -c -p -cp '$TMP/mapa' 'UsaZonaExterna\$1'"
espera "con case null el mapa se va y entra SwitchBootstraps.enumSwitch" 'java/lang/runtime/SwitchBootstraps.enumSwitch' tema-2/por-dentro sh -c "javac --release 25 -d '$TMP/bs' ZonaExt.java SwitchConNull.java && javap -v -p -cp '$TMP/bs' SwitchConNull"
no_contiene "con case null javac no crea la clase sintetica \$1" 'SwitchConNull$1' tema-2/por-dentro sh -c "rm -rf '$TMP/syn'; javac --release 25 -d '$TMP/syn' ZonaExt.java SwitchConNull.java && ls '$TMP/syn'"
espera "el null llega al tableswitch como -1" 'tableswitch   { // -1 to 2' tema-2/por-dentro sh -c "javac --release 25 -d '$TMP/min1' ZonaExt.java SwitchConNull.java && javap -c -p -cp '$TMP/min1' SwitchConNull"
espera "case null atiende el nulo y el default lo que no se nombra" 'null -> 2100' tema-2/por-dentro sh -c "javac --release 25 -encoding UTF-8 -d '$TMP/run' *.java && $J -cp '$TMP/run' SwitchConNull"

titulo "Tema 3 · bucles, etiquetas, break y continue"
espera "while, for y for-each suman lo mismo" 'while    : 13390 g' tema-3 $J RecorrerGuias.java
espera "el do-while entra aunque la condición ya sea falsa" 'do-while : 5 vueltas para recorrer 5 guias' tema-3 $J RecorrerGuias.java
espera "el for-each sobre List usa un Iterator" 'for-each sobre List<Integer>: 60 cajas' tema-3 $J RecorrerGuias.java
espera "la variable del for muere al salir del bucle" 'fuera del bucle queda: 13390' tema-3 $J RecorrerGuias.java
espera "sin etiqueta el break solo corta el bucle de dentro" 'paradas visitadas sin etiqueta : 10' tema-3 $J EtiquetasEnMatriz.java
espera "con etiqueta el break sale de los dos bucles" 'paradas visitadas con break    : 5' tema-3 $J EtiquetasEnMatriz.java
espera "continue con etiqueta abandona la fila entera" 'suma con continue SALTO (filas): 1445' tema-3 $J EtiquetasEnMatriz.java
espera "continue sin etiqueta salta solo la parada" 'suma con continue solo (paradas): 1895' tema-3 $J EtiquetasEnMatriz.java
falla_con "el índice llega hasta length y se pasa" 'java.lang.ArrayIndexOutOfBoundsException: Index 3 out of bounds for length 3' tema-3/errores $J IndiceFuera.java
espera "en el for el continue sí ejecuta el avance" 'for con el mismo continue              : 3 vueltas' tema-3/errores $J AvanceTrasContinue.java
espera "en el while el continue se salta el avance y no para" 'while con continue delante del avance : 13 vueltas para 3 guias' tema-3/errores $J AvanceTrasContinue.java
falla_con "mutar la lista durante el for-each la corta" 'java.util.ConcurrentModificationException' tema-3/errores $J CambiaMientrasRecorres.java
espera "con tres casillas, borrar la ultima tambien corta" 'tres casillas, borrar la ultima -> ConcurrentModificationException' tema-3/errores $J BorraDetras.java
espera "con dos casillas, borrar la ultima pasa en silencio" 'dos casillas, borrar la ultima -> sin excepcion, quedan [bogota]' tema-3/errores $J BorraDetras.java
bytecode "for y while dan la misma secuencia de instrucciones" 'iinc' tema-3/por-dentro Bucles.java Bucles
bytecode "el for-each sobre List se compila contra Iterator" 'java/util/Iterator.next' tema-3/por-dentro Bucles.java Bucles

titulo "Tema 4 · métodos: firma, retorno, paso por valor, sobrecarga y varargs"
espera "un void admite return sin valor" 'registrada RF-001' tema-4 $J Llamadas.java
espera "la sobrecarga se resuelve por la firma" 'tarifa(int,int)    : 18000' tema-4 $J Llamadas.java
espera "el tipo de retorno no forma parte de la firma" 'tarifa(double)     : 9.0' tema-4 $J Llamadas.java
espera "desde main un campo de instancia necesita el objeto" 'campo de instancia : ruta 12' tema-4 $J Llamadas.java
espera "la recursividad mutua para cuando toca" 'esCero(7) por recursividad mutua: 1' tema-4 $J Llamadas.java
espera "pasar un primitivo copia el valor" 'despues de intentaCambiarElNumero(10): n = 10' tema-4 $J PasoPorValor.java
espera "reasignar la referencia dentro no se ve fuera" 'tras reasignar el arreglo dentro: tanda[0] = 1250' tema-4 $J PasoPorValor.java
espera "mudar el contenido sí se ve fuera" 'tras mudar el contenido dentro  : tanda[0] = 7' tema-4 $J PasoPorValor.java
espera "cambiar un campo del objeto sí se ve fuera" 'tras cambiar un campo dentro    : e.gramos = 3400' tema-4 $J PasoPorValor.java
espera "varargs es un arreglo y cada llamada crea uno nuevo" 'dos llamadas iguales crean arreglos distintos: true' tema-4 $J Reparto.java
espera "si le pasas tu arreglo, el método lo muda" 'tras pisaPrimera(mias), mias[0] = -1' tema-4 $J Reparto.java
espera "varargs admite cero argumentos" 'Bogota con 0 paradas' tema-4 $J Reparto.java
espera "la coincidencia exacta gana a todo lo demás" 'fase(5)                -> int' tema-4 $J Sobrecargas.java
espera "ensanchar va antes que embolsar" 'orden(5)           -> ensanchado' tema-4 $J Sobrecargas.java
espera "embolsar va antes que varargs" 'ultima(5)          -> embolsado' tema-4 $J Sobrecargas.java
espera "con null elige el tipo más específico" 'nulo(null)         -> String' tema-4 $J Sobrecargas.java
no_compila "dos sobrecargas que embolsan igual son ambiguas" 'reference to elige is ambiguous' tema-4/errores Ambigua.java
no_compila "solo cambiar el tipo de retorno no es sobrecargar" 'method tarifa(int) is already defined in class RepiteFirma' tema-4/errores RepiteFirma.java
no_compila "los varargs tienen que cerrar la lista de parametros" 'varargs parameter must be the last parameter' tema-4/errores VarArgsNoLast.java
no_compila "un campo de instancia no se ve desde un metodo static" 'non-static variable conduccion cannot be referenced from a static context' tema-4/errores CampoSinObjeto.java
espera "this ocupa la casilla 0 y el parámetro la 1" '0  this   LSlots;' tema-4/por-dentro sh -c "javac --release 25 -g -d '$TMP/slots' Slots.java && javap -c -p -l -cp '$TMP/slots' Slots"
espera "tras un long el siguiente parametro cae en la casilla 2" '2 siguiente   I' tema-4/por-dentro sh -c "javap -c -p -l -cp '$TMP/slots' Slots"

titulo "Tema 5 · recursión y la pila de llamadas"
espera "el trabajo en el camino de ida sale en orden" 'recoge 1250 g' tema-5 $J CuentaAtras.java
espera "el trabajo en el camino de vuelta sale invertido" 'suelta 890 g' tema-5 $J CuentaAtras.java
espera "los marcos vivos son uno por llamada más el main" 'marcos vivos en el fondo para 3 envios: 5' tema-5 sh -c "javac --release 25 -d '$TMP/marcos' CuentaAtras.java && $J -cp '$TMP/marcos' CuentaAtras"
espera "java Archivo.java añade los marcos del lanzador" 'marcos vivos en el fondo para 3 envios: 10' tema-5 $J CuentaAtras.java
espera "el marco mas nuevo del fondo es el que llego al caso base" 'CuentaAtras.marcoVivo(CuentaAtras.java:39)' tema-5 sh -c "javac --release 25 -d '$TMP/mv' CuentaAtras.java && $J -cp '$TMP/mv' CuentaAtras"
espera "tres marcos se quedan esperando en la linea de la llamada" '3' tema-5 sh -c "javac --release 25 -d '$TMP/mv' CuentaAtras.java && $J -cp '$TMP/mv' CuentaAtras | grep -c 'marcoVivo(CuentaAtras.java:42)'"
espera "el fondo de la torre siempre es el main que empezo todo" 'CuentaAtras.main(CuentaAtras.java:53)' tema-5 sh -c "javac --release 25 -d '$TMP/mv' CuentaAtras.java && $J -cp '$TMP/mv' CuentaAtras"
espera "con -Xss256k el techo baja y se puede leer en la propia JVM" 'ThreadStackSize de la JVM (-Xss): 256 KB' tema-5 sh -c "javac --release 25 -d '$TMP/pila' ProfundidadPila.java && java -Xss256k -cp '$TMP/pila' ProfundidadPila"
espera "el tope de la traza es un límite aparte del de la pila" 'marcos que aparece en la traza    : 1024' tema-5 $J ProfundidadPila.java
espera "la pila es bytes: con la misma pila, el marco con 4 longs llega menos lejos" 'el marco pesado llega MENOS lejos con la misma pila' tema-5 sh -c "javac --release 25 -d '$TMP/mg' MarcoGrande.java && java -Xss256k -cp '$TMP/mg' MarcoGrande"
espera "bajar el tope de la traza no cambia cuanto aguanta la pila" 'marcos que aparece en la traza    : 5' tema-5 sh -c "javac --release 25 -d '$TMP/pila2' ProfundidadPila.java && java -XX:MaxJavaStackTraceDepth=5 -cp '$TMP/pila2' ProfundidadPila"
espera "el StackOverflowError no trae mensaje" 'getMessage()                      : null' tema-5 $J ProfundidadPila.java
espera "la recursión de cola desborda igual" 'sumaDeCola desbordo' tema-5 $J ColaSinOptimizacion.java
bytecode "una llamada recursiva es un invokestatic al propio método" 'Method factorialDeCola:(JJ)J' tema-5/por-dentro Recursividad.java Recursividad
espera "sin caso base, la traza repite la linea de la llamada 1023 veces" '1023' tema-5/errores sh -c "javac --release 25 -d '$TMP/re' SinCasoBase.java && java -Xss256k -cp '$TMP/re' SinCasoBase 2>&1 | grep -c 'SinCasoBase.java:8)'"
falla_con "sin caso base alcanzable la traza repite la misma línea" 'java.lang.StackOverflowError' tema-5/errores sh -c "javac --release 25 -d '$TMP/re' SinCasoBase.java && java -Xss256k -cp '$TMP/re' SinCasoBase"

titulo "Tema 6 · leer una traza y depurar con método"
falla_con "la cabecera dice qué y el cuerpo dice dónde" 'java.lang.NumberFormatException: For input string: "sin peso"' tema-6 $J Trazas.java
falla_con "la traza va del marco más nuevo al main" 'at Trazas.main(Trazas.java:19)' tema-6 $J Trazas.java
falla_con "el marco propio aparece con su archivo y su línea" 'Trazas.reparte(Trazas.java:7)' tema-6 $J Trazas.java
espera "la causa encadenada nombra el origen real" 'Caused by: java.lang.ArithmeticException: / by zero' tema-6 $J CausaEncadenada.java
espera "el marco compartido se marca con «... 1 more» en vez de repetirse" '... 1 more' tema-6 sh -c "javac --release 25 -d '$TMP/ce' CausaEncadenada.java Tabla.java && $J -cp '$TMP/ce' CausaEncadenada"
falla_con "los marcos de la libreria traen el modulo delante" 'at java.base/java.lang.Integer.parseInt' tema-6 $J Trazas.java
espera "el segundo acceso no repite la causa" 'NoClassDefFoundError -> Could not initialize class Tabla' tema-6 $J CausaEncadenada.java
espera "depurar por partición localiza la entrada mala" 'el indice 6 es el culpable: For input string: "sin peso"' tema-6 $J DepuraConMetodo.java
espera "la partición de 8 entradas cuesta 3 rondas" 'entradas: 8 · localizadas en 3 rondas' tema-6 $J DepuraConMetodo.java
falla_con "sin la información de línea la traza dice Unknown Source" 'TrazasSinLineas.reparte(Unknown Source)' tema-6/por-dentro sh -c "javac --release 25 -g:none -d '$TMP/nog' TrazasSinLineas.java && $J -cp '$TMP/nog' TrazasSinLineas"
espera "con -g la misma traza sí da el número de línea" 'TrazasSinLineas.reparte(TrazasSinLineas.java:' tema-6/por-dentro sh -c "javac --release 25 -g -d '$TMP/cong' TrazasSinLineas.java && java -cp '$TMP/cong' TrazasSinLineas 2>&1 || true"

titulo "Laboratorio · despacho con Gradle"
espera "el build está escrito en Kotlin DSL con toolchain y catálogo" 'ok' . sh -c 'grep -q "JavaLanguageVersion.of" build.gradle.kts && grep -q "rutaflow-nucleo" settings.gradle.kts && grep -q "^java = \"25\"" gradle/libs.versions.toml && test -f gradle/wrapper/gradle-wrapper.jar && echo ok'
if gradle_disponible; then
    espera "gradle test: las 12 pruebas pasan" 'BUILD SUCCESSFUL' . $GRADLE --console=plain test
    espera "gradle run despacha la tanda" 'gramos totales de la tanda     : 5540' . $GRADLE --console=plain -q run
fi

resultado
