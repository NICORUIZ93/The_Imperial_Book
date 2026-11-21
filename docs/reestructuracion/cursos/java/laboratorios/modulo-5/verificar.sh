#!/usr/bin/env bash
# Java · M5 · Objetos y clases — verificación del laboratorio.
# Ejecuta cada ejemplo del módulo y comprueba su salida. Sigue ante fallos y termina en «RESULTADO: OK».
# Uso: ./verificar.sh            (necesita JDK 25 en PATH)
# Cada bloque de tema se añade al escribirlo; el recuento del módulo es el que imprime la última línea.
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

# igual <descripción> <salida1> <salida2>: dos textos deben coincidir carácter a carácter.
igual() {
    if [ "$2" = "$3" ]; then bien "$1"; else mal "$1 (difieren)" "A: $2
B: $3"; fi
}
# igual_no_vacio <descripción> <a> <b>: como igual(), pero dos vacios NO cuentan como prueba.
igual_no_vacio() {
    if [ -z "$2" ] || [ -z "$3" ]; then
        mal "$1 (texto vacio: la comparacion no prueba nada)" "A: [$2]
B: [$3]"
    elif [ "$2" = "$3" ]; then bien "$1"; else mal "$1 (difieren)" "A: $2
B: $3"; fi
}
# distinto <descripción> <salida1> <salida2>: dos textos NO deben coincidir.
distinto() {
    if [ "$2" != "$3" ]; then bien "$1"; else mal "$1 (son iguales: $2)" ""; fi
}
# no_compila <descripción> <mensaje de javac> <carpeta> <archivo>
no_compila() { falla_con "$1" "$2" "$3" javac -d "$TMP/err" "$4"; }
# bytecode <descripción> <instrucción> <carpeta> <archivo> <clase>
bytecode() { espera "$1" "$2" "$3" sh -c "javac -d '$TMP/bc' $4 && javap -c -cp '$TMP/bc' $5"; }
# cuerpo <carpeta> <archivo> <clase> <firma>: las instrucciones de un metodo, con su desplazamiento.
# El separador de columna se quita con sub(/^ +/), no buscando la firma en la columna 1: javap imprime
# cada miembro con dos espacios delante, y una condicion ==1 habria devuelto vacio sin decir nada.
cuerpo() {
    (cd "$RAIZ/$1" && javac -d "$TMP/cuerpo" "$2" && javap -c -p -cp "$TMP/cuerpo" "$3") \
        | awk -v f="$4" '{ l=$0; sub(/^ +/, "", l) }
            index(l, f"(") == 1 { dentro=1; next }
            dentro && l == "Code:" { next }
            dentro && l ~ /^[0-9]+:/ { print l; next }
            dentro { dentro=0 }'
}
# constructor <carpeta> <archivo> <clase> <descriptor>: las instrucciones del <init> con ESE descriptor.
# Un metodo normal no sirve para esto: javap imprime los tres constructores como «Guia(...)», y la unica
# forma de separarlos es el descriptor que solo aparece en la linea del <init>.
constructor() {
    (cd "$RAIZ/$1" && javac --release 25 -d "$TMP/ctor" "$2" && javap -c -p -cp "$TMP/ctor" "$3") \
        | awk -v f="$4" '{ l=$0; sub(/^ +/, "", l) }
            index(l, "init)") > 0 && index(l, f) > 0 { dentro=1; next }
            dentro && l == "Code:" { next }
            dentro && l ~ /^[0-9]+:/ { print l; next }
            dentro { dentro=0 }'
}
# cuenta <carpeta> <archivo> <clase> <descriptor> <patrón>: veces que aparece un patron en ese constructor.
cuenta() {
    constructor "$1" "$2" "$3" "$4" | grep -c "$5"
}

titulo "Tema 1 · Clases, objetos, campos, metodos y this"
(cd "$RAIZ/tema-1" && javac --release 25 -d "$TMP/t1" ClaseYObjetos.java) > "$TMP/t1.log" 2>&1 \
    || { mal "Compilar tema-1/ClaseYObjetos.java" "$(cat "$TMP/t1.log")"; exit 1; }
(cd "$RAIZ/tema-1/por-dentro" && javac --release 25 -d "$TMP/bc2" CamposEnBytecode.java) > "$TMP/bc2.log" 2>&1 \
    || { mal "Compilar tema-1/por-dentro/CamposEnBytecode.java" "$(cat "$TMP/bc2.log")"; exit 1; }
(cd "$RAIZ/tema-1/por-dentro" && javac --release 25 -g -d "$TMP/bc3" CamposEnBytecode.java) > "$TMP/bc3.log" 2>&1 \
    || { mal "Compilar con -g la matriz de bytecode" "$(cat "$TMP/bc3.log")"; exit 1; }
espera "un campo de referencia nace null y uno primitivo en cero" 'recien creada       : RF-000123 · 0 g · null' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "dos new son dos objetos: el codigo se comparte, la referencia no" 'referencia distinta? true' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "cada objeto tiene SU casilla para el mismo campo" 'primera tras 1250: RF-000123 · 1250 g · null' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "el segundo objeto no se entera de lo del primero" 'segunda tras 3400: RF-000124 · 3400 g · null' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "identityHashCode no es una garantia del lenguaje: con la estrategia fija la linea sale con numeros iguales" 'referencia distinta? true' tema-1 sh -c "java -XX:+UnlockExperimentalVMOptions -XX:hashCode=2 -Dstdout.encoding=UTF-8 -cp '$TMP/t1' ClaseYObjetos"
FILA2=$( (cd "$RAIZ/tema-1" && java -XX:+UnlockExperimentalVMOptions -XX:hashCode=2 -Dstdout.encoding=UTF-8 -cp "$TMP/t1" ClaseYObjetos) | sed -n '2p')
igual "con esa estrategia, dos objetos DISTINCTOS dan el MISMO numero" "$(printf '%s' "$FILA2" | awk '{print $5}')" "$(printf '%s' "$FILA2" | awk '{print $8}')"
FILA0=$( (cd "$RAIZ/tema-1" && java -XX:+UnlockExperimentalVMOptions -XX:hashCode=0 -Dstdout.encoding=UTF-8 -cp "$TMP/t1" ClaseYObjetos) | sed -n '2p')
distinto "y cambiando solo la estrategia de la JVM los numeros cambian del todo" "$(printf '%s' "$FILA0" | awk '{print $5}')" "$(printf '%s' "$FILA2" | awk '{print $5}')"
espera "el receptor se reconoce a si mismo dentro del metodo" '· yo soy ' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "asignar una variable copia la referencia, no el objeto" 'alias misma identidad: true' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "lo que cambia el alias lo ve el otro nombre" 'por la primera      : 890' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "this devuelto es el mismo objeto, no una copia" 'conZona devuelve el mismo objeto: true · y se queda con SUR' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "campos iguales no hacen objetos iguales" 'campos iguales       : mismo codigo true · misma referencia false' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "el parametro que tapa al campo deja el campo en null, sin avisar" 'campo con el parametro tapando : null' tema-1 sh -c "javac --release 25 -Xlint:all -d '$TMP/som' SombraDeCampo.java && java -Dstdout.encoding=UTF-8 -cp '$TMP/som' SombraDeCampo"
espera "el mismo constructor con this. si escribe la casilla del objeto" 'campo con this.                : RF-000123' tema-1 sh -c "java -Dstdout.encoding=UTF-8 -cp '$TMP/som' SombraDeCampo"
espera "dos objetos con el mismo codigo siguen siendo dos" 'dos Bien con el mismo codigo   : false' tema-1 sh -c "java -Dstdout.encoding=UTF-8 -cp '$TMP/som' SombraDeCampo"
espera "contra Object la comparacion si esta permitida" 'contra Object si se puede      : false' tema-1 sh -c "java -Dstdout.encoding=UTF-8 -cp '$TMP/som' SombraDeCampo"
espera "null es ausencia de referencia, no un objeto vacio" 'es ninguna referencia: true' tema-1 $J -cp "$TMP/t1" ClaseYObjetos
espera "llamar un metodo sobre null cae con el nombre del metodo" 'Cannot invoke "ClaseYObjetos$Guia.etiqueta()"' tema-1 $J -cp "$TMP/t1" ClaseYObjetos

# Las dos lineas anteriores usan la compilacion SIN -g; la de abajo recompila CON -g y nombra la variable.
espera "con -g el mensaje dice el nombre de la variable, sin -g dice su ranura" 'because "nadie" is null' tema-1 sh -c "javac --release 25 -g -d '$TMP/t1g' ClaseYObjetos.java && java -Dstdout.encoding=UTF-8 -cp '$TMP/t1g' ClaseYObjetos"
espera "sin -g el mismo punto de llamada sale como ranura de frame" 'because "<local' tema-1 sh -c "java -Dstdout.encoding=UTF-8 -cp '$TMP/t1' ClaseYObjetos"

espera "los dos metodos leen el mismo campo y dan el mismo numero" 'conThis/sinThis    : 3 / 3' tema-1/por-dentro $J -cp "$TMP/bc2" CamposEnBytecode
espera "un objeto creado dentro de un metodo trae los campos en su valor por defecto" 'creado dentro      : 0' tema-1/por-dentro $J -cp "$TMP/bc2" CamposEnBytecode
espera "un arreglo de objetos viene con referencias null, no con objetos" 'casilla 0 sin crear es null? true' tema-1/por-dentro $J -cp "$TMP/bc2" CamposEnBytecode

# Preparar las clases compiladas una vez para los volcados.
espera "crear un objeto son tres pasos: new, dup e invokespecial al constructor" 'Method "<init>":()V' tema-1/por-dentro sh -c "javap -c -p -cp '$TMP/bc3' 'CamposEnBytecode\$Punto'"
espera "el constructor encadena hacia Object antes de tocar los campos" 'Method java/lang/Object."<init>":()V' tema-1/por-dentro sh -c "javap -c -p -cp '$TMP/bc3' 'CamposEnBytecode\$Punto'"
espera "el campo se accede con getfield/putfield, no con una variable" 'Field x:I' tema-1/por-dentro sh -c "javap -c -p -cp '$TMP/bc3' 'CamposEnBytecode\$Punto'"
espera "el receptor del metodo de instancia es la ranura 0" 'aload_0' tema-1/por-dentro sh -c "javap -c -p -cp '$TMP/bc3' 'CamposEnBytecode\$Punto'"
espera "los parametros de un metodo de instancia empiezan en la 1" 'iload_1' tema-1/por-dentro sh -c "javap -c -p -cp '$TMP/bc3' 'CamposEnBytecode\$Punto'"
CUERPO_CON=$(cuerpo tema-1/por-dentro CamposEnBytecode.java 'CamposEnBytecode$Punto' 'int conThis')
CUERPO_SIN=$(cuerpo tema-1/por-dentro CamposEnBytecode.java 'CamposEnBytecode$Punto' 'int sinThis')
igual_no_vacio "escribir this. en el fuente no cambia una sola instruccion, desplazamientos incluidos" "$CUERPO_CON" "$CUERPO_SIN"

espera "un .java con una clase anidada suelta dos .class" 'ClaseYObjetos$Guia.class' tema-1 sh -c "javac --release 25 -d '$TMP/m5class' ClaseYObjetos.java && ls '$TMP/m5class'"
espera "un campo sin modificador queda con acceso de paquete, y eso se ve en el .class" 'java.lang.String codigo;' tema-1 sh -c "javap -p -cp '$TMP/m5class' 'ClaseYObjetos\$Guia'"
espera "la exterior y la anidada forman un nest" 'NestMembers' tema-1 sh -c "javap -v -p -cp '$TMP/m5class' ClaseYObjetos"
NACC=$( (cd "$RAIZ/tema-1" && javap -p -cp "$TMP/m5class" ClaseYObjetos | grep -c 'access\$') )
igual "por eso no hace falta un metodo sintetico de acceso entre las dos" "0" "$NACC"
espera "quien llama a un metodo de instancia deja el objeto en la pila primero" 'aload_1' tema-1/por-dentro sh -c "javap -c -p -cp '$TMP/bc3' CamposEnBytecode"
espera "el descriptor del metodo deja ver los tipos de los parametros" 'mover:(II)V' tema-1/por-dentro sh -c "javap -c -p -cp '$TMP/bc3' CamposEnBytecode"
espera "un metodo static se llama sin objeto en la pila" 'invokestatic' tema-1/por-dentro sh -c "javap -c -p -cp '$TMP/bc3' CamposEnBytecode"

no_compila "this no existe en un metodo static" 'non-static variable this cannot be referenced from a static context' tema-1 errores/ThisDesdeStatic.java
no_compila "un metodo de instancia necesita un objeto" 'non-static method etiqueta() cannot be referenced from a static context' tema-1 errores/MetodoSinObjeto.java
no_compila "la variable local no tiene valor por defecto" 'variable local might not have been initialized' tema-1 errores/LocalSinValor.java
no_compila "una public por archivo, y el archivo se llama como la clase" 'class Guia is public, should be declared in a file named Guia.java' tema-1 errores/DosPublicasEnUnArchivo.java
no_compila "dos clases sin parentesco ni se pueden comparar" 'incomparable types: Mal and Bien' tema-1 errores/ComparaTiposDistintos.java

resultado
