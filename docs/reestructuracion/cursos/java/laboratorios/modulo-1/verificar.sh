#!/usr/bin/env bash
# Java · M1 · Datos: tipos, variables y operadores — verificación del laboratorio.
# Ejecuta cada ejemplo del módulo y comprueba su salida. Sigue ante fallos y termina en «RESULTADO: OK».
# Uso: ./verificar.sh            (necesita JDK 25 en PATH; la calculadora usa el wrapper de Gradle)
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
# no_compila <descripción> <mensaje de javac> <carpeta> <archivo>
no_compila() { falla_con "$1" "$2" "$3" javac -d "$TMP/err" "$4"; }
# bytecode <descripción> <instrucción> <carpeta> <archivo> <clase>
bytecode() { espera "$1" "$2" "$3" sh -c "javac -d '$TMP/bc' $4 && javap -c -cp '$TMP/bc' $5"; }

titulo "Tema 1 · Primitivos"
espera "rangos y desbordamiento de int" 'MAX_VALUE + 1 = -2147483648' tema-1 $J Rangos.java
espera "la carga del día se desborda en int" 'ANTES   total en int:        -1294967296 g' tema-1 $J CargaDelDia.java
espera "multiplyExact avisa" 'multiplyExact dice:  integer overflow' tema-1 $J CargaDelDia.java
espera "en long cabe" 'DESPUÉS total en long:       3000000000 g' tema-1 $J CargaDelDia.java
espera "un emoji ocupa dos char" '"📦".length() = 2 · code points = 1 · U+1F4E6' tema-1 $J Literales.java
espera "un literal que empieza por 0 es octal" '1000000 255 10 8' tema-1 $J Literales.java
no_compila "literal entero demasiado grande" 'integer number too large' tema-1/errores LiteralGrande.java
no_compila "200 no cabe en byte" 'possible lossy conversion from int to byte' tema-1/errores ByteFueraDeRango.java
bytecode "cada tamaño de literal tiene su instrucción" 'ldc2_w' tema-1/por-dentro Constantes.java Constantes

titulo "Tema 2 · Valores frente a referencias"
espera "copiar un primitivo copia el valor" 'primitivos:  pesoA = 2500 · pesoB = 9999' tema-2 $J CopiaYAlias.java
espera "copiar una referencia crea un alias" 'referencias: notaA = frágil · urgente · notaB = frágil · urgente' tema-2 $J CopiaYAlias.java
falla_con "el método cambia el objeto, no la variable del que llama" 'tras reemplazar:    RF-000123 [URGENTE]' tema-2 $J EtiquetaDeEnvio.java
falla_con "usar null lanza NullPointerException" 'java.lang.NullPointerException: Cannot invoke "java.lang.StringBuilder.append(String)"' tema-2 $J EtiquetaDeEnvio.java
falla_con "con -g la excepción nombra la variable" 'because "sinEtiqueta" is null' tema-2 sh -c "javac -g -d '$TMP/t2' EtiquetaDeEnvio.java && java -cp '$TMP/t2' EtiquetaDeEnvio"
no_compila "un primitivo no puede ser null" '<null> cannot be converted to int' tema-2/errores PrimitivoNull.java
falla_con "String null" 'Cannot invoke "String.length()"' tema-2/errores $J DestinoNulo.java
espera "identidad de objetos" 'a y c, ¿misma identidad? false' tema-2/por-dentro $J Identidad.java
# Los tres de la sección 7 y 9 del tema 2: se comprueba el MÉTODO de leer el flag, no el número que da esta máquina.
espera "el grep de la sección 7 selecciona los cinco flags" '5' . sh -c 'java -XX:+PrintFlagsFinal -version 2>&1 | grep -cE " (ThreadStackSize|MaxHeapSize|InitialHeapSize|UseCompressedOops|UseCompactObjectHeaders) "'
espera "el tamaño de pila sin -Xss sale con origen {default}" 'intx ThreadStackSize = <valor> {pd product} {default}' . sh -c 'java -XX:+PrintFlagsFinal -version 2>&1 | grep -E " ThreadStackSize " | tr -s " " | sed -E "s/= [0-9]+/= <valor>/"'
espera "el mismo flag con -Xss256k sale con origen {command line}" 'intx ThreadStackSize = 256 {pd product} {command line}' . sh -c 'java -Xss256k -XX:+PrintFlagsFinal -version 2>&1 | grep -E " ThreadStackSize " | tr -s " "'

titulo "Tema 3 · Variables, ámbito, final, var y asignación definitiva"
espera "ámbito de bloque" 'Medellín: 3000 g de un tope de 30000 g' tema-3 $J Ambito.java
espera "sombreado de un campo" 'local: 40 · campo: 3' tema-3 $J ResumenDeRuta.java
espera "asignación definitiva por dos caminos" 'larga distancia' tema-3 $J ResumenDeRuta.java
no_compila "variable sin inicializar" 'variable categoria might not have been initialized' tema-3/errores SinInicializar.java
no_compila "final reasignada" 'cannot assign a value to final variable TOPE_GRAMOS' tema-3/errores FinalReasignada.java
no_compila "variable repetida en el mismo método" 'variable peso is already defined in method main(String[])' tema-3/errores FueraDeAmbito.java
no_compila "var sin inicializador" "cannot use 'var' on variable without initializer" tema-3/errores VarSinInicializador.java
no_compila "var con null" "variable initializer is 'null'" tema-3/errores VarNull.java
no_compila "var en declaración compuesta" "'var' is not allowed in a compound declaration" tema-3/errores VarCompuesta.java
no_compila "var no cambia de tipo" 'String cannot be converted to int' tema-3/errores VarCambiaDeTipo.java
espera "var e int producen el mismo bytecode" 'iguales' tema-3/por-dentro sh -c "javac -d '$TMP/t3' ConVar.java SinVar.java && javap -c -cp '$TMP/t3' ConVar | sed -n '/static int f/,/ireturn/p' > '$TMP/con.txt' && javap -c -cp '$TMP/t3' SinVar | sed -n '/static int f/,/ireturn/p' > '$TMP/sin.txt' && diff '$TMP/con.txt' '$TMP/sin.txt' && echo iguales"

titulo "Tema 4 · Conversiones"
espera "int a float pierde precisión" 'int 16777217 → float 1.6777216E7 → int 16777216' tema-4 $J Conversiones.java
espera "(byte) 200 da -56" '(byte) 200 = -56 · (byte) 128 = -128' tema-4 $J Conversiones.java
espera "(int) de un double enorme satura" '(int) 1e20 = 2147483647 · (int) NaN = 0' tema-4 $J Conversiones.java
falla_con "división entera y casting tardío" 'promedio: mal 2533.0 · bien 2533.3333333333335' tema-4 $J ConvertirPeso.java
falla_con "toIntExact falla en vez de recortar" 'java.lang.ArithmeticException: integer overflow' tema-4 $J ConvertirPeso.java
no_compila "estrechar sin casting" 'possible lossy conversion from double to int' tema-4/errores Estrechar.java
bytecode "las conversiones son instrucciones (d2i)" 'd2i' tema-4/por-dentro Conv.java Conv

titulo "Tema 5 · Operadores"
espera "orden de evaluación de izquierda a derecha" 'orden: a b c → 7' tema-5 $J Operadores.java
espera "&& no evalúa la derecha" '&&: izq → false' tema-5 $J Operadores.java
espera "& sí la evalúa" '&:  izq der → false' tema-5 $J Operadores.java
espera "i = i++ no cambia i" 'tras i = i++: 7' tema-5 $J Operadores.java
espera "+= lleva casting implícito" 'cajas = 15 · pesos = 103 · desbordado = -126' tema-5 $J Operadores.java
falla_con "marcas en bits" 'tras cambios    = 010' tema-5 $J ReglasDeDespacho.java
falla_con "los paréntesis cambian la regla" 'con paréntesis: false' tema-5 $J ReglasDeDespacho.java
falla_con "sin cortocircuito, NullPointerException" 'Cannot invoke "String.isBlank()"' tema-5 $J ReglasDeDespacho.java
no_compila "= en una condición" 'int cannot be converted to boolean' tema-5/errores AsignarEnCondicion.java
bytecode "el cortocircuito es un salto (ifnull)" 'ifnull' tema-5/por-dentro Corto.java Corto

titulo "Tema 6 · Punto flotante IEEE 754"
espera "0.1 + 0.2 no es 0.3" '0.1 + 0.2 = 0.30000000000000004 · ¿== 0.3? false' tema-6 $J PuntoFlotante.java
espera "NaN no es igual a sí mismo" 'NaN == NaN ? false · Double.isNaN: true' tema-6 $J PuntoFlotante.java
espera "el valor exacto de 0.1" '0.1000000000000000055511151231257827021181583404541015625' tema-6 $J PuntoFlotante.java
espera "dinero en centavos: exacto" 'DESPUÉS (centavos): 100000,00' tema-6 $J SumaDeTarifas.java
espera "dinero en double: no coincide" '¿coinciden? false' tema-6 $J SumaDeTarifas.java
falla_con "entre enteros, dividir entre cero lanza excepción" 'java.lang.ArithmeticException: / by zero' tema-6/errores $J DivisionEntera.java
espera "los bits de 0.1" 'exponente: 01111111011 = 1019 (menos 1023 = -4)' tema-6/por-dentro $J Bits.java
bytecode "== entre double es dcmpl" 'dcmpl' tema-6/por-dentro Fp.java Fp

titulo "Tema 7 · Math, RandomGenerator, BigInteger y BigDecimal"
espera "floorMod frente a %" '-7 % 5 = -2 · floorMod(-7, 5) = 3' tema-7 $J UtilidadesMath.java
espera "abs(Integer.MIN_VALUE) sigue negativo" 'abs(Integer.MIN_VALUE) = -2147483648' tema-7 $J UtilidadesMath.java
espera "con semilla, la secuencia se repite" 'pesos simulados (g): 9082 1910 7666 21844 21454' tema-7 $J Aleatorios.java
espera "sin semilla, el dado cae en rango" 'dado entre 1 y 6: en rango' tema-7 $J Aleatorios.java
espera "BigDecimal desde texto es exacto" '0.1 + 0.2             = 0.3' tema-7 $J LiquidacionDeFlete.java
espera "flete con IVA" 'flete 11500.00 + IVA 2185.00 = 13685.00' tema-7 $J LiquidacionDeFlete.java
espera "equals frente a compareTo" '2.0 equals 2.00 ? false · compareTo: 0' tema-7 $J LiquidacionDeFlete.java
espera "BigInteger no se desborda" '25! = 15511210043330985984000000' tema-7 $J LiquidacionDeFlete.java
falla_con "división sin fin decimal" 'Non-terminating decimal expansion' tema-7/errores $J DecimalSinFin.java
espera "BigDecimal: entero sin escala y escala" 'producto: 2185.0000 · sin escala 21850000 · escala 4' tema-7/por-dentro $J Escala.java
no_compila "BigDecimal no admite operadores" "bad operand types for binary operator '*'" tema-7/errores OperadoresEnBigDecimal.java

titulo "Laboratorio · calculadora de tarifas con Gradle"
espera "el build está escrito en Kotlin DSL con toolchain y catálogo" 'ok' . sh -c 'grep -q "JavaLanguageVersion.of" build.gradle.kts && grep -q "rutaflow-nucleo" settings.gradle.kts && grep -q "^java = \"25\"" gradle/libs.versions.toml && test -f gradle/wrapper/gradle-wrapper.jar && echo ok'
if gradle_disponible; then
    espera "gradle test: las 11 pruebas pasan" 'BUILD SUCCESSFUL' . $GRADLE --console=plain test
    espera "gradle run liquida un envío" 'Total con IVA: $13566.00' . $GRADLE --console=plain -q run --args="2500"
fi

resultado
