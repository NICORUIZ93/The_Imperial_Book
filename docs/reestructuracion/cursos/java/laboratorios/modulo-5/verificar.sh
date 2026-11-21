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
# miembro <carpeta> <archivo> <clase> <cabecera>: instrucciones del miembro cuya linea de cabecera coincide
# exacta (sin el sangrado). Hace falta esto y no el descriptor: javap imprime «Guia();» y «static {};» con el
# MISMO descriptor ()V, y ninguna busqueda por descriptor los separa. Tampoco sirve buscar la firma sin mas:
# «Guia(int);» empieza igual que «Guia();», y un index()>0 meteria los tres constructores en el mismo corte.
miembro() {
    (cd "$RAIZ/$1" && javac --release 25 -d "$TMP/mie" "$2" && javap -c -p -cp "$TMP/mie" "$3") \
        | awk -v h="$4" '{ l=$0; sub(/^ +/, "", l) }
            l == h { dentro=1; next }
            dentro && l ~ /^[0-9]+:/ { print l; next }
            dentro && l != "Code:" { dentro=0 }'
}
# cuenta <carpeta> <archivo> <clase> <cabecera> <patrón>: veces que aparece el patron en ESE miembro.
cuenta() { miembro "$1" "$2" "$3" "$4" | grep -c "$5"; }
# cero <descripción> <carpeta> <archivo> <clase> <cabecera> <patrón>: el miembro existe —su cuerpo tiene
# instrucciones— y aun asi el patron no aparece. Sin esta forma, un cero sacado de un volcado vacio
# (clase mal escrita, cabecera que no cuadra) pasa como ok sin haber mirado nada.
cero() {
    desc=$1; cue=$(miembro "$2" "$3" "$4" "$5")
    if [ -z "$cue" ]; then mal "$1 (el miembro «$5» no salio del volcado: el cero no prueba nada)" ""; return; fi
    n=$(printf '%s\n' "$cue" | grep -c "$6")
    if [ "$n" = "0" ]; then bien "$1"; else mal "$1 (aparece $n veces)" "$cue"; fi
}
# veces <descripción> <salida> <línea> <n>: esa linea exacta aparece N veces en la salida.
veces() {
    n=$(printf '%s\n' "$2" | grep -c -F -- "$3")
    if [ "$n" = "$4" ]; then bien "$1"; else mal "$1 (aparece $n veces, se esperaban $4)" ""; fi
}
# antes <descripción> <salida> <línea1> <línea2>: la primera aparición de línea1 va NUMERICAMENTE antes
# que la de línea2. Si falta una de las dos el recuento sale vacio y la comparación falla: aqui un orden
# solo tiene sentido sobre las dos lineas vivas, y un orden entre dos desaparecidos seria un falso ok.
antes() {
    n1=$(printf '%s\n' "$2" | grep -n -F -m1 -- "$3" | cut -d: -f1)
    n2=$(printf '%s\n' "$2" | grep -n -F -m1 -- "$4" | cut -d: -f1)
    if [ -n "$n1" ] && [ -n "$n2" ] && [ "$n1" -lt "$n2" ]; then bien "$1"; else mal "$1 (línea ${n1:-?} frente a línea ${n2:-?})" ""; fi
}
# vacio <descripción> <texto>: un comando que no debe decir NADA. Es la comprobacion del aviso que falta.
vacio() { if [ -z "$2" ]; then bien "$1"; else mal "$1 (si dijo algo)" "$2"; fi; }
# lleva <descripción> <texto> <variable>: el texto debe estar en lo YA capturado, sin repetir el comando.
lleva() { if printf '%s\n' "$3" | grep -F -q -- "$2"; then bien "$1"; else mal "$1 (no esta en lo capturado: «$2»)" "$3"; fi; }
# cero_en <descripción> <patrón> <variable>: el patron no aparece NI UNA VEZ en lo capturado. Hace falta
# porque un grep -c sobre un volcado vacio tambien da cero: aqui el volcado se capturo antes, en su propio
# paso, y si ese paso fallo el script ya paro.
cero_en() {
    n=$(printf '%s\n' "$3" | grep -c "$2")
    if [ "$n" = "0" ]; then bien "$1"; else mal "$1 (aparece $n veces)" "$3"; fi
}
# bandera <descripción> <cabecera del miembro> <línea flags esperada>: la bandera real del .class.
# Se compara la linea ENTERA, no el numero: «ACC_PUBLIC» tambien sale en la clase, y buscarlo suelto
# daria ok aunque el miembro estuviera privado.
bandera() {
    v=$( (cd "$RAIZ/tema-3/por-dentro" && javap -v -p -cp "$TMP/t3p" NivelesEnClass) \
        | awk -v h="$2" '{ l=$0; sub(/^ +/, "", l) }
            l == h { dentro=1; next }
            dentro && l ~ /^flags:/ { print l; exit }')
    igual_no_vacio "$1" "$3" "$v"
}
# cuerpo_llamar <release>: el metodo llamar() de NivelesEnClass compilado con ESE release.
cuerpo_llamar() {
    rel=$1; out="$TMP/t3ll$rel"
    (cd "$RAIZ/tema-3/por-dentro" && javac --release "$rel" -d "$out" NivelesEnClass.java) > /dev/null 2>&1 \
        || { mal "Compilar NivelesEnClass con --release $rel" ""; return; }
    javap -c -p -cp "$out" NivelesEnClass | awk '{ l=$0; sub(/^ +/, "", l) }
        l == "void llamar();" { dentro=1; next }
        dentro && l ~ /^[0-9]+:/ { print l; next }
        dentro && l != "Code:" { dentro=0 }'
}

# no_entre <descripción> <salida> <línea inicial> <línea final> <patrón>: el patron NO aparece entre esas
# dos lineas. Hace falta porque un cero sobre TODA la salida seria falso: el <clinit> si corre, pero mas tarde,
# y lo que hay que probar es que NO corrio en el tramo que va del literal de clase al primer forName.
no_entre() {
    n=$(printf '%s\n' "$2" | awk -v a="$3" -v b="$4" -v p="$5" '
        index($0, a) == 1 { dentro=1 }
        dentro && index($0, b) == 1 { dentro=0; next }
        dentro && index($0, p) > 0 { c++ }
        END { print c+0 }')
    if [ "$n" = "0" ]; then bien "$1"; else mal "$1 (aparece $n veces entre «$3» y «$4»)" ""; fi
}
# flags_de <descripción> <volcado -v> <cabecera> <línea flags>: como bandera(), pero sobre un volcado YA
# capturado en su propio paso, sin recompilar la clase en cada comprobacion.
flags_de() {
    v=$(printf '%s\n' "$2" | awk -v h="$3" '{ l=$0; sub(/^ +/, "", l) }
        l == h { dentro=1; next }
        dentro && l ~ /^flags:/ { print l; exit }')
    igual_no_vacio "$1" "$4" "$v"
}
# cuenta_en <descripción> <volcado -c> <cabecera> <patrón> <n>: conteo DENTRO de un miembro de un volcado
# ya capturado. Si el miembro no esta en el volcado, el corte sale vacio y la comprobacion falla: un cero
# sacado de un corte vacio no es una prueba (es la trampa que ya cazamos con «cero» en el tema 2).
cuenta_en() {
    cue=$(printf '%s\n' "$2" | awk -v h="$3" '{ l=$0; sub(/^ +/, "", l) }
        l == h { dentro=1; next }
        dentro && l ~ /^[0-9]+:/ { print l; next }
        dentro && l != "Code:" { dentro=0 }')
    if [ -z "$cue" ]; then mal "$1 (el miembro «$3» no salio del volcado: el conteo no prueba nada)" ""; return; fi
    n=$(printf '%s\n' "$cue" | grep -c -- "$4")
    if [ "$n" = "$5" ]; then bien "$1"; else mal "$1 (aparece $n veces, se esperaban $5)" "$cue"; fi
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

titulo "Tema 2 · Constructores, encadenamiento con this(), bloques y orden de inicializacion"
(cd "$RAIZ/tema-2" && javac --release 25 -d "$TMP/t2" ConstructoresYOrden.java) > "$TMP/t2.log" 2>&1 \
    || { mal "Compilar tema-2/ConstructoresYOrden.java" "$(cat "$TMP/t2.log")"; exit 1; }
(cd "$RAIZ/tema-2" && javac --release 25 -d "$TMP/t2e" EncadenamientoSilencioso.java) > "$TMP/t2e.log" 2>&1 \
    || { mal "Compilar tema-2/EncadenamientoSilencioso.java" "$(cat "$TMP/t2e.log")"; exit 1; }
(cd "$RAIZ/tema-2/por-dentro" && javac --release 25 -d "$TMP/t2b" OrdenEnBytecode.java) > "$TMP/t2b.log" 2>&1 \
    || { mal "Compilar tema-2/por-dentro/OrdenEnBytecode.java" "$(cat "$TMP/t2b.log")"; exit 1; }
(cd "$RAIZ/tema-2/por-dentro" && javac --release 25 -d "$TMP/t2c" SinEncadenar.java) > "$TMP/t2c.log" 2>&1 \
    || { mal "Compilar tema-2/por-dentro/SinEncadenar.java" "$(cat "$TMP/t2c.log")"; exit 1; }
(cd "$RAIZ/tema-2" && javap -p -cp "$TMP/t2" 'ConstructoresYOrden$Vacia' > "$TMP/t2vacia.txt" 2>&1) \
    || { mal "Volcar el .class de ConstructoresYOrden\$Vacia" ""; exit 1; }
SAL2=$( (cd "$RAIZ/tema-2" && $J -cp "$TMP/t2" ConstructoresYOrden) )

espera "tocar un campo static fuerza la inicializacion de la clase" 'static campo aviso   : clase inicializada' tema-2 $J -cp "$TMP/t2" ConstructoresYOrden
espera "cuando llega el primer objeto, el static ya esta puesto" 'a = sin-codigo · 0 g · umbral 700' tema-2 $J -cp "$TMP/t2" ConstructoresYOrden
veces "el static corre UNA sola vez aunque se creen tres objetos" "$SAL2" 'static campo aviso' 1
veces "los inicializadores de instancia corren una vez POR OBJETO" "$SAL2" 'inst   campo gramos' 3
veces "el cuerpo del constructor delegado corre en los tres objetos" "$SAL2" 'ctor   Guia()' 3
antes "el bloque static va antes que el primer inicializador de instancia" "$SAL2" 'static bloque' 'inst   campo codigo'
antes "y el ultimo inicializador de instancia va antes que el cuerpo del constructor" "$SAL2" 'inst   bloque 2' 'ctor   Guia()'
antes "en la cadena, el cuerpo del delegado corre antes que el del que delega" "$SAL2" 'ctor   Guia()' 'ctor   Guia(String)'
espera "los dos saltos de this() no repiten los inicializadores" 'c = RF-888 · 1250 g · umbral 700' tema-2 $J -cp "$TMP/t2" ConstructoresYOrden
espera "un inicializador que lama a un metodo ve el campo como estaba, no como va a quedar" 'gramos al inicializar = 0 | y al leerlo despues, gramos = 1250' tema-2 $J -cp "$TMP/t2" ConstructoresYOrden
espera "sin escribir ningun constructor, new Vacia() funciona y los campos salen en su valor por defecto" 'v = null | 0' tema-2 $J -cp "$TMP/t2" ConstructoresYOrden

# El orden impreso tiene que ser el orden del bytecode, no una coincidencia de la maquina.
espera "el <init> que no delega arranca encadenando a Object" 'Method java/lang/Object."<init>":()V' tema-2/por-dentro sh -c "javap -c -p -cp '$TMP/t2b' 'OrdenEnBytecode\$Guia'"
espera "quien ejecuta new deja el objeto en la pila y despues guarda la variable" 'astore_1' tema-2/por-dentro sh -c "javap -c -p -cp '$TMP/t2b' OrdenEnBytecode"
espera "el enlace se hace por descriptor: un argumento es (I)V" 'Method OrdenEnBytecode$Guia."<init>":(I)V' tema-2/por-dentro sh -c "javap -c -p -cp '$TMP/t2b' OrdenEnBytecode"
espera "y dos argumentos son (II)V, que es otro metodo" 'Method OrdenEnBytecode$Guia."<init>":(II)V' tema-2/por-dentro sh -c "javap -c -p -cp '$TMP/t2b' OrdenEnBytecode"
igual "el constructor que no delega ejecuta los DOS inicializadores" "2" "$(cuenta tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia();' 'invokestatic')"
cero "el que delega con this() no ejecuta NINGUNO" tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia(int);' 'invokestatic'
cero "el del segundo salto tampoco" tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia(int, int);' 'invokestatic'
igual "la cadena se ve como un invokespecial al otro descriptor" "1" "$(cuenta tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia(int);' '"<init>":()V')"
igual "y el ultimo salta al del medio, no al primero" "1" "$(cuenta tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia(int, int);' '"<init>":(I)V')"
igual "el campo static solo se escribe en <clinit>" "1" "$(cuenta tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'static {};' 'putstatic')"
cero "ningun <init> de instancia toca ese campo static" tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia();' 'putstatic'
distinto "los dos <init> son bytecode distinto: no hay un unico constructor que se herede" \
    "$(miembro tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia();')" \
    "$(miembro tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia(int);')"

# La otra cara de la cadena: el MISMO caso escrito sin this(). Lo que se gana con this() no se ve en los
# valores, se ve en el tamano de cada metodo; por eso se comparan los dos fuentes y no se narra de memoria.
VAL1=$( (cd "$RAIZ/tema-2/por-dentro" && $J -cp "$TMP/t2b" OrdenEnBytecode) | sed -n 's/.*\(a\/b = .*\)/\1/p' )
VAL2=$( (cd "$RAIZ/tema-2/por-dentro" && $J -cp "$TMP/t2c" SinEncadenar) | sed -n 's/.*\(a\/b = .*\)/\1/p' )
igual_no_vacio "encadenar o no encadenar deja los MISMOS valores en los tres objetos" "$VAL1" "$VAL2"
espera "el <init> suelta llega a escribir los dos campos y luego los pisa" 'sin encadenar, new Guia(5, 6) : a/b = 5 / 6' tema-2/por-dentro $J -cp "$TMP/t2c" SinEncadenar
igual "el que no delega gasta 11 instrucciones encadenando" "11" "$(cuenta tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia();' '^[0-9]')"
igual "y exactamente 11 sin encadenar: ahi this() no ahorra nada" "11" "$(cuenta tema-2/por-dentro SinEncadenar.java 'SinEncadenar$Guia' 'SinEncadenar$Guia();' '^[0-9]')"
igual "quien si ahorra es el del medio: 6 instrucciones con this()" "6" "$(cuenta tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia(int);' '^[0-9]')"
igual "frente a 14 sin la cadena: los inicializadores se han copiado enteros" "14" "$(cuenta tema-2/por-dentro SinEncadenar.java 'SinEncadenar$Guia' 'SinEncadenar$Guia(int);' '^[0-9]')"
igual "y el del segundo salto, 7 con this()" "7" "$(cuenta tema-2/por-dentro OrdenEnBytecode.java 'OrdenEnBytecode$Guia' 'OrdenEnBytecode$Guia(int, int);' '^[0-9]')"
igual "frente a 17 sin ella" "17" "$(cuenta tema-2/por-dentro SinEncadenar.java 'SinEncadenar$Guia' 'SinEncadenar$Guia(int, int);' '^[0-9]')"
igual "sin cadena, invokestatic vuelve a salir en el primer <init>" "2" "$(cuenta tema-2/por-dentro SinEncadenar.java 'SinEncadenar$Guia' 'SinEncadenar$Guia();' 'invokestatic')"
igual "y en el segundo, que con this() era cero" "2" "$(cuenta tema-2/por-dentro SinEncadenar.java 'SinEncadenar$Guia' 'SinEncadenar$Guia(int);' 'invokestatic')"
igual "y en el tercero, que con this() tambien era cero" "2" "$(cuenta tema-2/por-dentro SinEncadenar.java 'SinEncadenar$Guia' 'SinEncadenar$Guia(int, int);' 'invokestatic')"

espera "escribir un campo antes de this() compila, pero el this() pisa esa escritura" 'escribir antes de this() : v = 9' tema-2 $J -cp "$TMP/t2e" EncadenamientoSilencioso
espera "la linea que llega al objeto es la que va despues de this()" 'escribir despues de this(): v = 5' tema-2 $J -cp "$TMP/t2e" EncadenamientoSilencioso
vacio "javac -Xlint:all no avisa de ese campo pisado: el bug sale mudo" "$( (cd "$RAIZ/tema-2" && javac --release 25 -Xlint:all -d "$TMP/t2w" EncadenamientoSilencioso.java) 2>&1 )"

espera "las anidadas y la exterior forman un nest" 'NestMembers' tema-2 sh -c "javap -p -v -cp '$TMP/t2' ConstructoresYOrden"
espera "cada anidada declara su NestHost, que es lo que le da acceso a lo privado del vecino" 'NestHost' tema-2 sh -c "javap -p -v -cp '$TMP/t2' 'ConstructoresYOrden\$Vacia'"
igual "por eso aqui tampoco hace falta un metodo sintetico de acceso" "0" "$( (cd "$RAIZ/tema-2" && javap -p -cp "$TMP/t2" ConstructoresYOrden 'ConstructoresYOrden$Guia' 'ConstructoresYOrden$Trampa' 'ConstructoresYOrden$Vacia') | grep -c 'access\$' )"
espera "el constructor implicito copia el acceso de la clase: en la exterior publica sale public" 'public ConstructoresYOrden();' tema-2 sh -c "javap -p -cp '$TMP/t2' ConstructoresYOrden"
igual "y en la anidada de paquete no aparece ni un public" "0" "$(grep -c public "$TMP/t2vacia.txt")"

no_compila "tocar el objeto antes de la cadena esta prohibido" 'reference to this may only appear after an explicit constructor invocation' tema-2 errores/ThisAntesDeTiempo.java
no_compila "lo mismo con un campo: solo se puede leer despues de la llamada explicita" 'reference to v may only appear after an explicit constructor invocation' tema-2 errores/CampoAntesDeSuper.java
no_compila "this() llamandose a si mismo" 'recursive constructor invocation' tema-2 errores/ConstructorRecursivo.java
no_compila "un final que el constructor no asigna" 'variable codigo might not have been initialized' tema-2 errores/FinalSinAsignar.java
no_compila "un inicializador que lee un campo mas abajo" 'illegal forward reference' tema-2 errores/ReferenciaAdelantada.java
no_compila "poner un constructor es borrar el que venia gratis" 'constructor Guia in class Guia cannot be applied to given types' tema-2 errores/SinConstructorPorDefecto.java

titulo "Tema 3 · Encapsulacion y modificadores de acceso"
# bodega y afuera se compilan JUNTAS: la barrera de paquete solo existe si las dos mitades estan delante.
(cd "$RAIZ/tema-3" && javac --release 25 -Xlint:all -d "$TMP/t3" src/bodega/*.java src/afuera/*.java) > "$TMP/t3aviso.log" 2>&1 \
    || { mal "Compilar tema-3 (bodega y afuera juntos)" "$(cat "$TMP/t3aviso.log")"; exit 1; }
vacio "los cuatro niveles y los dos fallos silenciosos compilan con -Xlint:all SIN decir una sola palabra" "$(cat "$TMP/t3aviso.log")"
(cd "$RAIZ/tema-3/por-dentro" && javac --release 25 -d "$TMP/t3p" NivelesEnClass.java) > "$TMP/t3p.log" 2>&1 \
    || { mal "Compilar tema-3/por-dentro/NivelesEnClass.java" "$(cat "$TMP/t3p.log")"; exit 1; }
(cd "$RAIZ/tema-3/por-dentro/jvm" && javac --release 25 -d "$TMP/t3j1" v1/bodega/Envio.java \
    && javac --release 25 -d "$TMP/t3j2" v2/bodega/Envio.java \
    && javac --release 25 -cp "$TMP/t3j1" -d "$TMP/t3jl" Lector.java) > "$TMP/t3j.log" 2>&1 \
    || { mal "Compilar el trio del IllegalAccessError (v1, v2 y Lector contra v1)" "$(cat "$TMP/t3j.log")"; exit 1; }
SAL3=$( (cd "$RAIZ/tema-3" && $J -cp "$TMP/t3" bodega.Demo) ); COD3=$?
# Sin esta linea, una demo que revienta al final (por ejemplo al mutar comprueba a protected, donde la red
# de Ruta si entra y lanza) cascada en once fallos que culpan a A1, que salio bien. El codigo se comprueba
# primero y la culpa recae donde esta.
igual "la demo de los cuatro niveles se termina sola, sin que ninguna linea lance" "0" "$COD3"

# ---- nivel de paquete: sin escribir nada, se ve y se escribe desde OTRA clase del mismo paquete ----
espera "un campo sin modificador lo escribe otra clase del paquete, sin getter ni setter" 'sello de paquete leido y escrito desde bodega: 8' tema-3 $J -cp "$TMP/t3" bodega.Demo
# ---- private: ni el vecino del mismo paquete pasa por el campo ----
espera "y ese mismo vecino, ante el privado, ya necesita la puerta publica" 'gramos por la puerta publica desde otra clase del paquete: 0' tema-3 $J -cp "$TMP/t3" bodega.Demo
# ---- el invariante detras del setter ----
espera "el setter rechaza el peso negativo con su mensaje" 'gramos no puede ser negativo: -50' tema-3 $J -cp "$TMP/t3" bodega.Demo
cero_en "la rama que se imprimiria si el setter aceptara el -50 no se imprime" 'EL SETTER NO TENIA QUE ACEPTAR' "$SAL3"
igual "tras el rechazo el objeto conserva el valor de antes, no el intentado" "0" "$(printf '%s\n' "$SAL3" | sed -n 's/^A4 .* : //p')"
espera "afuera solo puede leer el privado por el getter" '1250 (solo por el getter)' tema-3 $J -cp "$TMP/t3" bodega.Demo

# ---- protected: la subclase de OTRO paquete escribe el campo con this ----
espera "una subclase en otro paquete anade al protected propio con this" '2 hitos' tema-3 $J -cp "$TMP/t3" bodega.Demo

# ---- FALLO SILENCIOSO 1: el getter que devuelve la lista viva ----
igual "antes de que nadie la toque, la lista del envio tiene un hito" "1 · [creado]" "$(printf '%s\n' "$SAL3" | sed -n 's/^A7 .* : //p')"
igual "y despues del ataque desde afuera tiene DOS, sin haber llamado a ningun metodo de Envio" "2 · [creado, MANIPULADO-DESDE-AFUERA]" "$(printf '%s\n' "$SAL3" | sed -n 's/^A8 .* : //p')"
igual "el motivo cabe en el tipo devuelto: es la lista de dentro, no una copia" "java.util.ArrayList" "$(printf '%s\n' "$SAL3" | sed -n 's/^A9 .* : //p')"
# ---- la misma clase con copia defensiva ----
espera "con copia, el mismo intento de afuera revienta contra la lista" 'rechazado con UnsupportedOperationException' tema-3 $J -cp "$TMP/t3" bodega.Demo
igual "el tipo devuelto ahora es una lista inmutable" "java.util.ImmutableCollections\$List12" "$(printf '%s\n' "$SAL3" | sed -n 's/^B2 .* : //p')"
igual "y el estado interno de Envio no se entero del intento" "2" "$(printf '%s\n' "$SAL3" | sed -n 's/^B3 .* : //p')"
distinto "los dos tipos devueltos no son el mismo: ahi estaba la diferencia, no en la buena voluntad" \
    "$(printf '%s\n' "$SAL3" | sed -n 's/^A9 .* : //p')" \
    "$(printf '%s\n' "$SAL3" | sed -n 's/^B2 .* : //p')"

# ---- FALLO SILENCIOSO 2: el herede que «redefine» un private y no sustituye nada ----
igual "Ruta promete vetar mas de 30 000 g y el peso de 50 000 entra igual" "50000 g" "$(printf '%s\n' "$SAL3" | sed -n 's/^B5 .* : //p')"
veces "la comprobacion de bodega corre tres veces en toda la demo" "$SAL3" 'bodega: la comprobacion de Envio corre' 3
veces "la de Ruta, que es la mas estricta, no corre ninguna" "$SAL3" 'afuera: la comprobacion mas estricta de Ruta corre' 0
COLA3=$(printf '%s\n' "$SAL3" | sed -n '/^B4 ·/,$p')
veces "justo despues de la promesa de Ruta, quien habla es bodega" "$COLA3" 'bodega: la comprobacion de Envio corre' 1
veces "y la red de seguridad de Ruta sigue callada justo ahi" "$COLA3" 'afuera: la comprobacion' 0
espera "un campo publico lo pisa quien quiera, sin pasar por nada" 'PISADO-DESDE-AFUERA' tema-3 $J -cp "$TMP/t3" bodega.Demo

# ---- los cuatro niveles como bits del .class, no como palabras del fuente ----
JP3=$( (cd "$RAIZ/tema-3/por-dentro" && javap -p -cp "$TMP/t3p" NivelesEnClass) )
# Las cabeceras van CON la palabra del modificador porque javap la imprime; lo de paquete es la unica
# que va desnuda. Un header equivocado da vacio, y aqui un vacio NO puede pasar como ok: eso es igual_no_vacio.
bandera "public sale con su bandera exacta" 'public int publico;' 'flags: (0x0001) ACC_PUBLIC'
bandera "protected sale con la suya" 'protected int protegido;' 'flags: (0x0004) ACC_PROTECTED'
bandera "private sale con la suya" 'private int privado;' 'flags: (0x0002) ACC_PRIVATE'
bandera "y el acceso de paquete es la AUSENCIA de bandera, no una bandera nueva" 'int dePaquete;' 'flags: (0x0000)'
bandera "un metodo sin modificador, lo mismo: cero banderas" 'void llamar();' 'flags: (0x0000)'
cero_en "por eso javap no tiene ninguna palabra que escribir ante lo de paquete" 'package' "$JP3"
espera "pero una interface SIN modificador si es publica, y el .class lo dice" 'public abstract int calcula();' tema-3/por-dentro sh -c "javap -p -cp '$TMP/t3p' 'NivelesEnClass\$Tarifa'"
L25=$(cuerpo_llamar 25); L8=$(cuerpo_llamar 8)
lleva "con --release 25 el publico se llama con invokevirtual" 'invokevirtual' "$(printf '%s\n' "$L25" | grep -F 'visible:()V')"
lleva "y el private, desde la misma clase, tambien" 'invokevirtual' "$(printf '%s\n' "$L25" | grep -F 'oculto:()V')"
lleva "con --release 8 el publico no cambio" 'invokevirtual' "$(printf '%s\n' "$L8" | grep -F 'visible:()V')"
lleva "el que cambio fue el private: antes iba con invokespecial" 'invokespecial' "$(printf '%s\n' "$L8" | grep -F 'oculto:()V')"

# ---- por que pudo cambiar: los nest de JDK 11 ----
(cd "$RAIZ/tema-3/por-dentro" && javac --release 8 -d "$TMP/t3n8" NidoPrivate.java) > /dev/null 2>&1 \
    || { mal "Compilar NidoPrivate con --release 8" ""; exit 1; }
(cd "$RAIZ/tema-3/por-dentro" && javac --release 25 -d "$TMP/t3n25" NidoPrivate.java) > /dev/null 2>&1 \
    || { mal "Compilar NidoPrivate con --release 25" ""; exit 1; }
igual "en release 8, javac se inventa un metodo estatico de acceso al privado" "1" "$( (cd "$RAIZ/tema-3/por-dentro" && javap -p -cp "$TMP/t3n8" NidoPrivate) | grep -c 'access\$' )"
igual "en release 25 no inventa nada" "0" "$( (cd "$RAIZ/tema-3/por-dentro" && javap -p -cp "$TMP/t3n25" NidoPrivate) | grep -c 'access\$' )"
espera "y el puente ese se llamaba con invokestatic, no con un acceso a campo" 'invokestatic' tema-3/por-dentro sh -c "javap -c -p -cp '$TMP/t3n8' 'NidoPrivate\$Visitor'"
espera "sin puente, el acceso es un getfield directo al campo privado" 'getfield' tema-3/por-dentro sh -c "javap -c -p -cp '$TMP/t3n25' 'NidoPrivate\$Visitor'"
espera "lo que autoriza ese acceso directo es el anfitrion declarado en la anidada" 'NestHost: class NidoPrivate' tema-3/por-dentro sh -c "javap -v -p -cp '$TMP/t3n25' 'NidoPrivate\$Visitor'"
espera "y el anfitrion declara quien compone el nest" 'NestMembers' tema-3/por-dentro sh -c "javap -v -p -cp '$TMP/t3n25' NidoPrivate"
cero_en "en release 8 esos dos atributos no existen: el nest es de JDK 11" 'Nest\(Host\|Members\)' "$( (cd "$RAIZ/tema-3/por-dentro" && javap -v -p -cp "$TMP/t3n8" NidoPrivate 'NidoPrivate$Visitor') )"
espera "las dos versiones dan el mismo 42: esto es un cambio de bytecode, no de comportamiento" 'el visitor lee el privado: 42' tema-3/por-dentro sh -c "java -Dstdout.encoding=UTF-8 -cp '$TMP/t3n8' NidoPrivate"
espera "y la de release 25 tambien" 'el visitor lee el privado: 42' tema-3/por-dentro sh -c "java -Dstdout.encoding=UTF-8 -cp '$TMP/t3n25' NidoPrivate"

# ---- el acceso tambien se comprueba al ENLACE, en tiempo de ejecucion (JVMS 5.4.4) ----
espera "mientras el campo es publico, el Lector ya compilado funciona" 'Lector leo gramos: 1250' tema-3/por-dentro/jvm $J -cp "$TMP/t3jl:$TMP/t3j1" Lector
espera "el Lector no guardo la visibilidad, guardo el nombre completo del campo" 'Field bodega/Envio.gramos:I' tema-3/por-dentro/jvm sh -c "javap -c -p -cp '$TMP/t3jl' Lector"
falla_con "cambiar el campo a private rompe, SIN RECOMPILAR al Lector, en tiempo de ejecucion" 'java.lang.IllegalAccessError: class Lector tried to access private field bodega.Envio.gramos' tema-3/por-dentro/jvm $J -cp "$TMP/t3jl:$TMP/t3j2" Lector

# ---- los seis cortes del compilador ----
falla_con "el private NO se relaja por estar en el mismo paquete" 'gramos has private access in Envio' tema-3 javac --release 25 -cp "$TMP/t3" -d "$TMP/t3err" errores/PrivadoEnOtraClaseDelPaquete.java
falla_con "sin modificador no es «publicito»: es de paquete y la barrera es real" 'selloDePaquete is not public in Envio; cannot be accessed from outside package' tema-3 javac --release 25 -cp "$TMP/t3" -d "$TMP/t3err" errores/PaqueteDesdeOtroPaquete.java
falla_con "heredar desde otro paquete tampoco abre lo de paquete" 'selloDePaquete is not public in Envio; cannot be accessed from outside package' tema-3 javac --release 25 -cp "$TMP/t3" -d "$TMP/t3err" errores/HerederoDeOtroPaqueteLeeLoDelPaquete.java
falla_con "protected exige que la expresion que califica sea la propia subclase" 'hitos has protected access in Envio' tema-3 javac --release 25 -cp "$TMP/t3" -d "$TMP/t3err" errores/ProtegidoConReferenciaDelPadre.java
falla_con "al sobreescribir se puede ampliar el acceso, nunca reducirlo" 'attempting to assign weaker access privileges; was public' tema-3 javac --release 25 -cp "$TMP/t3" -d "$TMP/t3err" errores/ReducirAccesoAlSobreescribir.java
falla_con "y @Override es lo unico que avisa de que un private no se puede sobrescribir" 'comprueba(int) in OverrideDeUnPrivado does not override or implement a method from a supertype' tema-3 javac --release 25 -cp "$TMP/t3" -d "$TMP/t3err" errores/OverrideDeUnPrivado.java

titulo "Tema 4 · static: campos, metodos, constantes e inicializacion de clase"
(cd "$RAIZ/tema-4" && javac --release 25 -d "$TMP/t4" CamposEstaticos.java InicializacionBajoDemanda.java ContadorCompartido.java) > "$TMP/t4.log" 2>&1 \
    || { mal "Compilar los tres ejemplos del tema 4" "$(cat "$TMP/t4.log")"; exit 1; }
vacio "los tres ejemplos compilan sin un solo aviso" "$(cat "$TMP/t4.log")"
(cd "$RAIZ/tema-4/por-dentro" && javac --release 25 -Xlint:all -d "$TMP/t4f" FlagsEstaticos.java) > "$TMP/t4f.log" 2>&1 \
    || { mal "Compilar tema-4/por-dentro/FlagsEstaticos.java con -Xlint:all" "$(cat "$TMP/t4f.log")"; exit 1; }
vacio "y FlagsEstaticos tampoco dice nada con -Xlint:all" "$(cat "$TMP/t4f.log")"
(cd "$RAIZ/tema-4/por-dentro/constante" && javac --release 25 -d "$TMP/t4k1" v1/Config.java Lector.java \
    && javac --release 25 -d "$TMP/t4k2" v2/Config.java) > "$TMP/t4k.log" 2>&1 \
    || { mal "Compilar el experimento de constantes (el Lector con v1; v2 aparte)" "$(cat "$TMP/t4k.log")"; exit 1; }
(cd "$RAIZ/tema-4/errores" && javac --release 25 -d "$TMP/t4i" InitQueRevienta.java) > "$TMP/t4i.log" 2>&1 \
    || { mal "Compilar InitQueRevienta: su error es de ejecucion, no de compilacion" "$(cat "$TMP/t4i.log")"; exit 1; }

SC=$( (cd "$RAIZ/tema-4" && $J -cp "$TMP/t4" CamposEstaticos) ); CSC=$?
igual "el ejemplo de los campos de clase se termina solo: ninguna linea lanza" "0" "$CSC"
# ---- lo de clase es UNO solo, lo de objeto es uno por objeto ----
lleva "al crear el primer objeto el contador arranca en uno" 'tras crear a           : creadas=1 · fueraDePeso=0' "$SC"
lleva "al crear el segundo NO nace otro contador: sube el mismo" 'tras crear b           : creadas=2 · fueraDePeso=0   (un contador, no dos)' "$SC"
lleva "mientras, el codigo sigue siendo casilla de cada objeto" 'lo de cada objeto      : RF-000123 / RF-000124' "$SC"
lleva "y los dos nombres ven la MISMA casilla escrita por el otro" 'los dos ven el mismo   : true' "$SC"
lleva "un golpe de un objeto se nota en la cuenta comun" 'un golpe en lo de clase: creadas=2 · fueraDePeso=1   (a pesaba 30000, b no)' "$SC"

CC=$( (cd "$RAIZ/tema-4" && javap -c -p -cp "$TMP/t4" CamposEstaticos) )
VC=$( (cd "$RAIZ/tema-4" && javap -v -p -cp "$TMP/t4" CamposEstaticos) )
# El constructor escribe las dos cosas: la casilla de la clase (putstatic) y la del objeto (putfield).
cuenta_en "el creadas++ sin this del constructor es un putstatic: va a la clase" "$CC" 'CamposEstaticos(java.lang.String);' 'putstatic' '1'
cuenta_en "y en la misma linea el this.codigo si es un putfield: va al objeto" "$CC" 'CamposEstaticos(java.lang.String);' 'putfield' '1'
igual "aun escrito «a.creadas», el acceso sale getstatic: cinco veces en el .class" "5" "$(printf '%s\n' "$CC" | grep -c 'getstatic.*Field creadas:I')"
igual "y ni un solo getfield de ese campo: la hoja del objeto no lo tiene" "0" "$(printf '%s\n' "$CC" | grep -c 'getfield.*Field creadas')"
flags_de "en el .class, lo de clase se distingue con una bandera" "$VC" 'static int creadas;' 'flags: (0x0008) ACC_STATIC'
flags_de "y lo de objeto no lleva ninguna" "$VC" 'int gramos;' 'flags: (0x0000)'

# ---- ocultacion frente a sustitucion ----
lleva "el objeto real es la subclase" 'el objeto real         : Ruta' "$SC"
lleva "el metodo de instancia se busca en el OBJETO: sale hijo" 'metodo de instancia    : hijo   (busca en el objeto)' "$SC"
lleva "el de clase se busca en el TIPO DEL FUENTE: sale el total del padre" 'metodo de clase        : creadas=3 · fueraDePeso=1   (busca en el tipo del fuente)' "$SC"
lleva "y solo escrito por el nombre de la subclase aparece la version oculta" 'el mismo por su nombre : creadas=3 · hitos=1' "$SC"
antes "la diferencia se ve en la MISMA variable, linea tras linea" "$SC" 'metodo de instancia    : hijo' 'metodo de clase        : creadas=3'
igual "los dos llamados sobre p: dos invokevirtual (describe) y cinco invokestatic (total)" "2" "$(printf '%s\n' "$CC" | grep -c 'invokevirtual.*Method describe:()Ljava/lang/String;')"
igual "el total() del padre se invoco cinco veces, siempre con invokestatic" "5" "$(printf '%s\n' "$CC" | grep -c '// Method total:()Ljava/lang/String;')"
cero_en "ningun invokevirtual resuelve un metodo de clase: total jamas se despacha por el objeto" 'invokevirtual.*// Method total' "$CC"
lleva "y la version oculta entra en el pool con su clase exacta" 'Method CamposEstaticos$Ruta.total:()Ljava/lang/String;' "$CC"
flags_de "la bandera ACC_STATIC es lo que el enlace mira para decidirlo" "$VC" 'static java.lang.String total();' 'flags: (0x0008) ACC_STATIC'

# ---- null: la expresion objetivo de un miembro de clase NI SE EVALUA ----
lleva "un metodo de clase sobre null funciona" 'de clase via null      : creadas=3 · fueraDePeso=1' "$SC"
lleva "igual un campo de clase sobre null" 'campo de clase via null: 3' "$SC"
lleva "pero el de instancia sobre null cae, y el mensaje dice el metodo y la ranura" 'de instancia via null  : NullPointerException · Cannot invoke "CamposEstaticos.describe()" because "<local4>" is null' "$SC"

# ---- variable constante frente a casilla de clase ----
lleva "las dos pintan igual en el fuente y el programa las imprime iguales" 'la constante           : 25000 · el umbral vivo: 25000' "$SC"
flags_de "la constante lleva ACC_STATIC, ACC_FINAL..." "$VC" 'static final int PESO_MAXIMO;' 'flags: (0x0018) ACC_STATIC, ACC_FINAL'
lleva "...y su valor en el atributo ConstantValue, fuera de todo objeto y de todo <clinit>" 'ConstantValue: int 25000' "$VC"
igual "por eso en el bytecode no queda un acceso al campo, sino el numero horneado: dos sipush 25000" "2" "$(printf '%s\n' "$CC" | grep -c 'sipush        25000')"
cero_en "y ni una referencia a Field PESO_MAXIMO en todo el .class" 'Field PESO_MAXIMO' "$CC"
VT=$( (cd "$RAIZ/tema-4" && javap -v -p -cp "$TMP/t4" 'CamposEstaticos$Topes') )
lleva "en una interface el campo sale sin escribir ningun modificador" 'en una interface       : 25000' "$SC"
flags_de "pero el .class le pone las tres banderas" "$VT" 'public static final int LIMITE;' 'flags: (0x0019) ACC_PUBLIC, ACC_STATIC, ACC_FINAL'
VTAR=$( (cd "$RAIZ/tema-4" && javap -v -p -cp "$TMP/t4" 'CamposEstaticos$Tarifas') )
lleva "la utileria se usa sin objetos" 'utileria sin objetos   : 1.25' "$SC"
lleva "y si alguien intenta instanciarla, su constructor privado lanza" 'su constructor privado : AssertionError: no se instancia' "$SC"
flags_de "ese constructor es private en el .class, que es lo que el enlace comprueba" "$VTAR" 'private CamposEstaticos$Tarifas();' 'flags: (0x0002) ACC_PRIVATE'

# ---- el aviso que el compilador guarda ----
XL=$( (cd "$RAIZ/tema-4" && javac --release 25 -Xlint:static -d "$TMP/t4x" CamposEstaticos.java) 2>&1 )
XL0=$( (cd "$RAIZ/tema-4" && javac --release 25 -d "$TMP/t4x0" CamposEstaticos.java) 2>&1 )
vacio "sin -Xlint el compilador NO dice nada de los cinco accesos por expresion" "$XL0"
igual "con -Xlint:static salen exactamente cinco avisos" "5" "$(printf '%s\n' "$XL" | grep -c 'warning: \[static\]')"
lleva "tres por campos de clase leidos por el objeto" 'static variable should be qualified by type name, CamposEstaticos, instead of by an expression' "$XL"
lleva "y dos por metodos de clase llamados por la expresion" 'static method should be qualified by type name, CamposEstaticos, instead of by an expression' "$XL"
cero_en "ninguno es un error: el codigo compila igual con el aviso puesto" 'error:' "$XL"

# ---- que es static dentro del .class ----
VF=$( (cd "$RAIZ/tema-4/por-dentro" && javap -v -p -cp "$TMP/t4f" FlagsEstaticos) )
SF=$( (cd "$RAIZ/tema-4/por-dentro" && $J -cp "$TMP/t4f" FlagsEstaticos) )
lleva "el contador de clase sube aunque lo mueva un metodo de instancia" 'mover(5)  =5 · contador=0' "$SF"
lleva "sumar no toca ningun objeto: solo la casilla de clase" 'sumar(1,2)=3 · destino del objeto=5' "$SF"
lleva "y al usar los dos, cada uno crece por su lado" 'tras usar los dos: contador=8 · destino=7' "$SF"
flags_de "un metodo de clase lleva ACC_STATIC" "$VF" 'static int sumar(int, int);' 'flags: (0x0008) ACC_STATIC'
flags_de "uno de instancia ninguna" "$VF" 'int mover(int);' 'flags: (0x0000)'
LSUM=$(printf '%s\n' "$VF" | awk '{ l=$0; sub(/^ +/, "", l) } l == "static int sumar(int, int);" { d=1; next } d && l ~ /^stack=/ { print l; exit }')
LMOV=$(printf '%s\n' "$VF" | awk '{ l=$0; sub(/^ +/, "", l) } l == "int mover(int);" { d=1; next } d && l ~ /^stack=/ { print l; exit }')
igual "sin this, los dos parametros ocupan las ranuras 0 y 1" 'stack=2, locals=2, args_size=2' "$LSUM"
igual "con this el conteo de ranuras no sube: el receptor se come la 0" 'stack=3, locals=2, args_size=2' "$LMOV"
# El volcado -v trae descriptor y flags antes de Code:, y el corte de cuenta_en exige el -c puro.
CF=$( (cd "$RAIZ/tema-4/por-dentro" && javap -c -p -cp "$TMP/t4f" FlagsEstaticos) )
cuenta_en "por eso sumar no carga ningun receptor: cero aload_0" "$CF" 'static int sumar(int, int);' 'aload_0' '0'
cuenta_en "y mover abre siempre cargando el this: tres aload_0" "$CF" 'int mover(int);' 'aload_0' '3'
lleva "CONSTANTE vive en ConstantValue, no en el inicializador" 'ConstantValue: int 42' "$VF"
cuenta_en "el <clinit> de la clase tiene un solo putstatic: el de VIVA, que NO es constante" "$CF" 'static {};' 'putstatic' '1'
cuenta_en "y en ese <clinit> la palabra CONSTANTE no aparece" "$CF" 'static {};' 'CONSTANTE' '0'

# ---- la constante se enlaza al compilar: el llamante se queda con el valor ----
K1=$( (cd "$RAIZ/tema-4/por-dentro/constante" && $J -cp "$TMP/t4k1" Lector) )
K2=$( (cd "$RAIZ/tema-4/por-dentro/constante" && $J -cp "$TMP/t4k2:$TMP/t4k1" Lector) )
lleva "con v1 los dos campos valen 5" 'LIMITE_CONSTANTE como lo vio el Lector: 5' "$K1"
lleva "el Lector, SIN RECOMPILAR, contra el Config nuevo sigue viendo 5 en la constante" 'LIMITE_CONSTANTE como lo vio el Lector: 5' "$K2"
lleva "pero el campo no constante ya vale 99: ese si se busca en la clase al ejecutar" 'LIMITE_VIVO      como lo vio el Lector: 99' "$K2"
CL=$( (cd "$RAIZ/tema-4/por-dentro/constante" && javap -c -p -cp "$TMP/t4k1" Lector) )
lleva "el valor quedo horneado dentro del literal de string del Lector" 'String LIMITE_CONSTANTE como lo vio el Lector: 5' "$CL"
cero_en "y por eso el Lector no guarda ninguna referencia al campo constante" 'Field Config.LIMITE_CONSTANTE' "$CL"
lleva "del campo vivo si guarda el getstatic, que es lo que inicializa la clase" 'Field Config.LIMITE_VIVO:I' "$CL"

# ---- cuando corre <clinit> ----
SI=$( (cd "$RAIZ/tema-4" && $J -cp "$TMP/t4" InicializacionBajoDemanda) )
lleva "el literal de clase no inicializa nada" 'leido Bascula.class, la clase es Bascula' "$SI"
lleva "leer una variable constante tampoco" 'Bascula.CONSTANTE = 7' "$SI"
lleva "forName con false tampoco: carga la clase y la deja sin inicializar" 'forName(.., false, ..) devolvio la Class sin inicializar' "$SI"
no_entre "y es cierto: entre el paso 1 y el 4 no corre el inicializador de campo" "$SI" 'paso 1 · literal de clase: no debe imprimir nada' 'paso 4 · Class.forName normal: aqui SI, y en orden de texto' 'arranca(): inicializador de campo'
no_entre "ni tampoco el bloque static explicito" "$SI" 'paso 1 · literal de clase: no debe imprimir nada' 'paso 4 · Class.forName normal: aqui SI, y en orden de texto' 'bloque static explicito'
lleva "forName normal SI la inicializa" 'arranca(): inicializador de campo (texto 1)' "$SI"
lleva "y en orden de texto: el campo primero" 'bloque static explicito (texto 2)' "$SI"
antes "el inicializador de campo gana al bloque porque va antes en el fuente" "$SI" 'arranca(): inicializador de campo (texto 1)' 'bloque static explicito (texto 2)'
antes "y los dos terminan antes de que forName devuelva" "$SI" 'bloque static explicito (texto 2)' 'forName(..) ya termino'
veces "el <clinit> de Bascula corre UNA sola vez en toda la ejecucion" "$SI" '      arranca(): inicializador de campo (texto 1)' '1'
veces "el bloque static tambien una" "$SI" '      bloque static explicito (texto 2)' '1'
veces "mientras que <init> corre por cada objeto: dos" "$SI" '      <init> de Bascula' '2'
lleva "crear objetos no sube lo de clase" 'dos basculas creadas, vivas siguen siendo 1 (objetos distintos)' "$SI"
no_entre "leer el campo vivo despues no repite el inicializador" "$SI" 'paso 5 · leer el campo NO constante: ya estaba inicializada, nada nuevo' 'paso 6 · dos objetos: <clinit> una vez, <init> dos veces' 'arranca()'
antes "el padre se inicializa antes que el hijo" "$SI" '      <clinit> de Padre' '      <clinit> de Hijo'
veces "y el del padre no vuelve a correr al leerlo suelto despues" "$SI" '      <clinit> de Padre' '1'
lleva "una interface de puras constantes no se inicializa al leer su campo" 'ConConstante.LIMITE = 25000' "$SI"
IM=$( (cd "$RAIZ/tema-4" && javap -c -p -cp "$TMP/t4" InicializacionBajoDemanda) )
lleva "el literal de clase entra con ldc de tipo, que no inicializa" 'class InicializacionBajoDemanda$Bascula' "$IM"
cero_en "por eso no queda ningun acceso al campo CONSTANTE: el 7 ya estaba en el string" 'Field InicializacionBajoDemanda$Bascula.CONSTANTE' "$IM"
lleva "en cambio el campo NO constante si es un getstatic, que es lo que dispara el <clinit>" 'Field InicializacionBajoDemanda$Bascula.viva:I' "$IM"
lleva "y el LIMITE de la interface corre la misma suerte: horneado en el texto" 'String ConConstante.LIMITE = 25000' "$IM"

# ---- el contador de clase es estado GLOBAL del programa ----
SK=$( (cd "$RAIZ/tema-4" && $J -cp "$TMP/t4" ContadorCompartido) )
lleva "el orden del fuente decide el numero: la consulta del bloque A se lleva el #1" 'consulta · por dentro crea #1 · RF-000999' "$SK"
lleva "la misma guia, con el mismo codigo, sale #3 en el bloque B" 'la misma guia RF-000999 salio antes con #1 y ahora con #3' "$SK"
lleva "y los 500 objetos descartados no borraron la cuenta" '500 solicitudes ya inexistentes: la clase sigue en 503' "$SK"
N1=$(printf '%s\n' "$SK" | sed -n 's/^      mostrador 1: \(#[0-9]*\).*/\1/p')
N2=$(printf '%s\n' "$SK" | sed -n 's/^      mostrador 2: \(#[0-9]*\).*/\1/p')
igual_no_vacio "el remedio: la cuenta la lleva un objeto y cada mostrador empieza en 1" "$N1" "$N2"

# ---- los cortes del compilador ----
no_compila "leer un campo de objeto desde un metodo static" 'non-static variable codigo cannot be referenced from a static context' tema-4 errores/CampoDeInstanciaDesdeStatic.java
no_compila "un case exige una VARIABLE CONSTANTE, no un static final cualquiera" 'constant expression required' tema-4 errores/CaseNoConstante.java
no_compila "un static final solo se escribe en su declaracion o en el <clinit>" 'cannot assign a value to static final variable LOTE' tema-4 errores/FinalEstaticoEnBlanco.java
no_compila "y un static final que nadie asigna tampoco pasa" 'variable LOTE might not have been initialized' tema-4 errores/FinalEstaticoNuncaAsignado.java
IO=$( (cd "$RAIZ/tema-4/errores" && javac --release 25 -d "$TMP/t4io" InstanceOverrideDeStatic.java) 2>&1 )
lleva "un metodo de instancia no puede sustituir el static del padre" 'total() in Hijo cannot override total() in Padre' "$IO"
lleva "y el javac lo dice en dos lineas: la razon es que el de arriba es static" 'overridden method is static' "$IO"
no_compila "@Override sobre una ocultacion: no hay nada que sobrescribir" 'static method total() in Hijo cannot be annotated with @Override' tema-4 errores/OverrideDeUnStatic.java

# ---- la cota historica: inner class con static ----
(cd "$RAIZ/tema-4/errores" && javac --release 25 -d "$TMP/t4s25" StaticEnClaseInterna.java) > "$TMP/t4s25.log" 2>&1 \
    || { mal "Compilar StaticEnClaseInterna con --release 25" "$(cat "$TMP/t4s25.log")"; exit 1; }
(cd "$RAIZ/tema-4/errores" && javac --release 16 -d "$TMP/t4s16" StaticEnClaseInterna.java) > "$TMP/t4s16.log" 2>&1 \
    || { mal "Compilar StaticEnClaseInterna con --release 16" "$(cat "$TMP/t4s16.log")"; exit 1; }
vacio "hoy un static en una inner es legal: con --release 25 compila limpio" "$(cat "$TMP/t4s25.log")"
vacio "y la cota exacta es el 16 (JEP 395): con --release 16 tambien" "$(cat "$TMP/t4s16.log")"
S15=$( (cd "$RAIZ/tema-4/errores" && javac --release 15 -d "$TMP/t4s15" StaticEnClaseInterna.java) 2>&1 )
igual "con --release 15 son DOS errores, uno por miembro declarado static" "2" "$(printf '%s\n' "$S15" | grep -c 'Illegal static declaration in inner class')"
lleva "y el mensaje viejo decia donde estaba permitido" "modifier 'static' is only allowed in constant variable declarations" "$S15"

# ---- el inicializador que revienta ----
I1=$( (cd "$RAIZ/tema-4/errores" && $J -cp "$TMP/t4i" InitQueRevienta) 2>&1 ); CI1=$?
igual "el primer contacto cae con codigo 1" "1" "$CI1"
lleva "el error es ExceptionInInitializerError, no el que lanzo el codigo" 'java.lang.ExceptionInInitializerError' "$I1"
lleva "la causa real va enlazada debajo" 'Caused by: java.lang.IllegalStateException: no hay configuracion' "$I1"
lleva "y el trazo dice que fue dentro del <clinit>" 'at InitQueRevienta$Rompe.<clinit>(InitQueRevienta.java:7)' "$I1"
I2=$( (cd "$RAIZ/tema-4/errores" && $J -cp "$TMP/t4i" InitQueRevienta dos) 2>&1 )
lleva "atrapado, el primer contacto se puede leer" 'primer contacto: java.lang.ExceptionInInitializerError · la causa es java.lang.IllegalStateException: no hay configuracion' "$I2"
lleva "el reintento da OTRO error: la clase quedo marcada como fallida" 'java.lang.NoClassDefFoundError: Could not initialize class InitQueRevienta$Rompe' "$I2"
cero_en "y el reintento no vuelve a correr el inicializador: esa linea jamas se imprime" 'segundo contacto:' "$I2"

titulo "Tema 5 · Paquetes, import, import static, import module y los nombres"
(cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/t5" \
    src/bodega/package-info.java src/bodega/Envio.java src/bodega/Flete.java src/otra/Sello.java src/Rasgo.java \
    otros-src/bodega/Balanza.java src/afuera/Cliente.java NombresEnRuntime.java) > "$TMP/t5.log" 2>&1 \
    || { mal "Compilar el arbol de paquetes del tema 5" "$(cat "$TMP/t5.log")"; exit 1; }
vacio "ocho fuentes de cuatro carpetas compilan sin decir nada" "$(cat "$TMP/t5.log")"
T5=$( (cd "$TMP/t5" && find . -name '*.class' | LC_ALL=C sort) )
lleva "las dos carpetas de fuente (src y otros-src) acaban en la MISMA carpeta de clases" './bodega/Balanza.class' "$T5"
lleva "y alli son vecinos del mismo paquete" './bodega/Envio.class' "$T5"
cero_en "la ruta de la fuente no deja rastro del lado de las clases" 'otros-src' "$T5"
lleva "Rasgo, sin declaracion de paquete, cae en la RAIZ del arbol de clases" './Rasgo.class' "$T5"
lleva "el tipo anidado se guarda con dolar, no con otra carpeta" './bodega/Envio$Sello.class' "$T5"
lleva "package-info.class solo existe porque el fuente lleva una anotacion" './bodega/package-info.class' "$T5"
cero_en "importar un modulo no copia ni un .class de el a nuestro arbol" 'java/sql' "$T5"

# ---- el paquete es un espacio de nombres, no una carpeta ----
SB=$( (cd "$RAIZ/tema-5" && $J -cp "$TMP/t5" bodega.Balanza) 2>&1 ); CSB=$?
igual "una clase de paquete, sin public, se puede lanzar desde la consola" "0" "$CSB"
lleva "Balanza (otros-src) lee FIRMA, que es de paquete en src" 'FIRMA desde otra carpeta : bodega' "$SB"
lleva "el nombre binario lo declara la linea package, no la ruta" 'nombre binario de Balanza : bodega.Balanza' "$SB"
lleva "y el vecino sin public del otro arbol tambien es accesible" 'vecino de paquete         : Flete-dentro-de-bodega' "$SB"
lleva "getPackageName devuelve lo mismo que escribio el fuente" 'paquete de Envio     : bodega' "$SB"
lleva "getName, el nombre con punto que usa el programador" 'nombre binario       : bodega.Envio' "$SB"
falla_con "fuera del paquete, la ausencia de public se paga: para afuera no existe" 'Balanza is not public in bodega; cannot be accessed from outside package' "tema-5" javac --release 25 -cp "$TMP/t5" -d "$TMP/err5" errores/BalanzaDesdeAfuera.java
WN=$( (cd "$RAIZ/tema-5" && $J -cp "$TMP/t5/bodega" Envio) 2>&1 ); CWN=$?
igual "pedir la clase sin su prefijo se cobra en el cargador, no en el codigo" "1" "$CWN"
lleva "el .class lleva su paquete escrito: de ahi sale «wrong name»" 'wrong name: bodega/Envio' "$WN"

# ---- los cinco tipos de importacion, en un solo fuente ----
SC=$( (cd "$RAIZ/tema-5" && $J -cp "$TMP/t5" afuera.Cliente) 2>&1 ); CSC=$?
igual "el ejemplo de los cinco imports corre entero" "0" "$CSC"
lleva "1) single-type-import: bodega.Envio se escribe sin prefijo" 'single-type          : bodega.Envio' "$SC"
lleva "2) type-import-on-demand: entra el nombre, no el paquete" 'on-demand java.time  : SATURDAY' "$SC"
lleva "2b) un on-demand SI puede terminar en un subpaquete" 'on-demand con punto  : java.util.Random' "$SC"
lleva "3) single-static-import de una constante" 'constante importada  : 24' "$SC"
lleva "3b) y de un campo de clase que no es constante" 'campo de clase       : 3' "$SC"
lleva "3c) un tipo anidado tambien se importa con estatica" 'tipo anidado static  : Sello-RutaFlow' "$SC"
lleva "4) static-import-on-demand: todos los estaticos de ChronoUnit" 'static-on-demand     : Days · Months' "$SC"
lleva "5) single-module-import (JEP 511): los tipos exportados por java.sql" 'modulo importado     : java.sql.Driver' "$SC"
lleva "5b) y los de OTRA exportacion del mismo modulo" 'otra exportacion     : javax.sql.DataSource' "$SC"
CC=$( (cd "$RAIZ/tema-5" && javap -c -p -cp "$TMP/t5" afuera.Cliente) 2>&1 )
igual "tres unicas referencias simbolicas a Envio: la clase, el campo y el anidado" "3" "$(printf '%s\n' "$CC" | grep -c 'bodega/Envio')"
cuenta_en "el single-type deja un ldc de LA CLASE, no de un miembro" "$CC" 'public static void main(java.lang.String[]);' '// class bodega/Envio' '1'
cuenta_en "el campo de clase se lee con getstatic: la importacion estatica no copia nada" "$CC" 'public static void main(java.lang.String[]);' 'Field bodega/Envio.vivas:I' '1'
cuenta_en "el tipo anidado se invoca por su nombre interno con dolar" "$CC" 'public static void main(java.lang.String[]);' 'Method bodega/Envio$Sello.pauta' '1'
cero_en "la constante importada NO deja ninguna referencia: el 24 venia de ConstantValue" 'Field bodega/Envio.LOTE' "$CC"
lleva "y el numero ya esta horneado dentro del texto que se imprime" 'String constante importada  : 24' "$CC"
lleva "el estatico de ChronoUnit llega referenciado, no copiado" 'Field java/time/temporal/ChronoUnit.DAYS' "$CC"
lleva "el import de modulo deja el nombre simbolico de Driver" '// class java/sql/Driver' "$CC"
lleva "y el de la segunda exportacion del mismo modulo" '// class javax/sql/DataSource' "$CC"

# ---- que guarda el .class del paquete ----
VE=$( (cd "$RAIZ/tema-5" && javap -v -p -cp "$TMP/t5" bodega.Envio) 2>&1 )
lleva "dentro del .class el nombre interno va con barras: es la notacion de la VM" '// bodega/Envio' "$VE"
lleva "y la version de class file es la 69, la de Java 25" 'major version: 69' "$VE"
flags_de "la constante lleva Public, Static y Final" "$VE" 'public static final int LOTE;' 'flags: (0x0019) ACC_PUBLIC, ACC_STATIC, ACC_FINAL'
flags_de "FIRMA es de paquete: Static y Final, sin ninguna Public" "$VE" 'static final java.lang.String FIRMA;' 'flags: (0x0018) ACC_STATIC, ACC_FINAL'
flags_de "gramos, de instancia y de paquete, no lleva ninguna bandera" "$VE" 'int gramos;' 'flags: (0x0000)'
lleva "LOTE se horneo en el ConstantValue" 'ConstantValue: int 24' "$VE"
lleva "FIRMA tambien es un ConstantValue, de texto" 'ConstantValue: String bodega' "$VE"
lleva "el anidado se inscribe en InnerClasses con su dolar" 'Sello=class bodega/Envio$Sello of class bodega/Envio' "$VE"
PI=$( (cd "$RAIZ/tema-5" && javap -v -p -cp "$TMP/t5" 'bodega.package-info') 2>&1 )
lleva "el archivo de paquete se compila a una INTERFACE, no a una clase" 'interface bodega.package-info' "$PI"
lleva "y a una interface SINTETICA: nadie lo escribio como tipo" 'flags: (0x1600) ACC_INTERFACE, ACC_ABSTRACT, ACC_SYNTHETIC' "$PI"
lleva "su unico contenido son las anotaciones del paquete" 'Ljava/lang/Deprecated;' "$PI"
lleva "su nombre interno es un miembro mas del paquete" '// bodega/package-info' "$PI"
SL=$( (cd "$RAIZ/tema-5" && javac --release 25 -Xlint:all -d "$TMP/t5l" src/bodega/package-info.java src/bodega/Envio.java src/bodega/Flete.java) 2>&1 )
lleva "con -Xlint:all javac avisa de que anotar el paquete no alcanza para sus tipos" '@Deprecated annotation has no effect on this package declaration' "$SL"
SL2=$( (cd "$RAIZ/tema-5" && javac --release 25 -Xlint:all -cp "$TMP/t5" -d "$TMP/t5l2" src/afuera/Cliente.java) 2>&1 ); CSL2=$?
igual "usar Envio desde otro paquete compila con codigo 0" "0" "$CSL2"
cero_en "y no produce ni un solo aviso de deprecacion: el @Deprecated de paquete no llega a los tipos" 'eprecat' "$SL2"
PV=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/t5pv" errores/paquete-vacio/package-info.java) 2>&1 ); CPV=$?
igual "un package-info.java sin ninguna anotacion compila" "0" "$CPV"
vacio "y javac no dice nada al hacerlo" "$PV"
PVT=$( find "$TMP/t5pv" -name '*.class' 2>/dev/null )
vacio "pero NO escribe ningun .class: el archivo de paquete existe solo por sus anotaciones" "$PVT"

# ---- los nombres que ve la maquina virtual ----
SN=$( (cd "$RAIZ/tema-5" && $J -cp "$TMP/t5" NombresEnRuntime) 2>&1 )
lleva "el paquete sin nombre se ve como corchetes vacios" 'binario=NombresEnRuntime         paquete=[] canonico=NombresEnRuntime' "$SN"
lleva "el prefijo binario va con punto, igual que el canonico" 'binario=bodega.Envio             paquete=[bodega] canonico=bodega.Envio' "$SN"
lleva "el anidado: dolar en el binario, punto en el canonico" 'binario=bodega.Envio$Sello       paquete=[bodega] canonico=bodega.Envio.Sello' "$SN"
lleva "un arreglo pone el corchete y la L DELANTE del prefijo de paquete" 'binario=[Lbodega.Envio;          paquete=[bodega] canonico=bodega.Envio[]' "$SN"
lleva "String vive en java.lang, el paquete que todo fuente importa sin escribirlo" 'binario=java.lang.String         paquete=[java.lang] canonico=java.lang.String' "$SN"
lleva "una primitiva no tiene prefijo en el binario, pero la JVM la apunta a java.lang" 'binario=int                      paquete=[java.lang] canonico=int' "$SN"

# ---- paquete y modulo vistos desde el programa ----
RL=$( (cd "$RAIZ/tema-5" && javac --release 25 -cp "$TMP/t5" -d "$TMP/t5" por-dentro/ReflejoDelPaquete.java) 2>&1 ); CRL=$?
igual "el reflejo de paquetes compila" "0" "$CRL"
lleva "Package.getPackage esta deprecado y javac lo recuerda" 'uses or overrides a deprecated API' "$RL"
RF=$( (cd "$RAIZ/tema-5" && $J -cp "$TMP/t5" reflejo.ReflejoDelPaquete) 2>&1 )
lleva "un Package se imprime como la palabra package seguida del nombre" 'toString           : package bodega' "$RF"
lleva "las anotaciones del package-info.java SI se ven en ejecucion" 'esDeprecated       : true' "$RF"
lleva "y viajan como una instancia real de la anotacion" 'anotaciones        : [@java.lang.Deprecated(forRemoval=false, since="")]' "$RF"
lleva "un paquete sin package-info.class no tiene anotaciones que leer" 'nombre sin archivo : otra · esDeprecated=false · lista=[]' "$RF"
lleva "Package.getPackage devuelve la MISMA instancia que getPackage() de una clase" 'getPackage igual   : true' "$RF"
lleva "un paquete nunca cargado no es un Package vacio: es null" 'nunca cargado      : null' "$RF"
lleva "el modulo que exporta un tipo si tiene nombre" 'modulo de Driver   : java.sql' "$RF"
lleva "el de lo nuestro es el anonimo, que no se llama" 'modulo de lo mio   : null' "$RF"
lleva "y el anonimo lee todos los modulos observables: de ahi que el import de modulo funcione" 'mi modulo lo lee   : true' "$RF"
lleva "isExported responde por paquete, no por clase" 'exporta java.sql   : true' "$RF"
lleva "java.sql exporta DOS paquetes y los dos son visibles" 'exporta javax.sql  : true' "$RF"
lleva "un paquete fuera de la lista de exports no es visible para nadie" 'exporta un invento : false' "$RF"

# ---- a quien gana cada nombre ----
MP=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/t5p" por-dentro/FechaResuelta.java por-dentro/AmbiguoResuelto.java) 2>&1 )
vacio "un fuente puede mezclar on-demand, import de modulo y single-type a la vez" "$MP"
FR=$( (cd "$RAIZ/tema-5" && $J -cp "$TMP/t5p" FechaResuelta) 2>&1 )
lleva "el single-type-import gana al type-import-on-demand" 'Date resuelto      : java.sql.Date' "$FR"
lleva "y gana tambien a los nombres que trae un import de modulo" 'List por el modulo : java.util.ArrayList' "$FR"
AR=$( (cd "$RAIZ/tema-5" && $J -cp "$TMP/t5p" AmbiguoResuelto) 2>&1 )
lleva "desempatar dos modulos con un import explicito funciona" 'List desempado     : java.util.ImmutableCollections$List12' "$AR"
AM=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/AmbiguoDeModulos.java) 2>&1 ); CAM=$?
igual "sin el explicito, el nombre compartido por dos modulos sale con codigo 1" "1" "$CAM"
lleva "JLS 7.5.3: dos imports de modulo con el mismo nombre simple son ambiguos" 'reference to List is ambiguous' "$AM"
lleva "y javac enlista los dos candidatos con su paquete" 'both class java.awt.List in java.awt and interface java.util.List in java.util match' "$AM"
DM=$( (cd "$RAIZ/tema-5" && javac --release 25 -Xlint:all -d "$TMP/t5dm" por-dentro/DosMismos.java) 2>&1 ); CDM=$?
igual "dos on-demand del MISMO paquete son redundantes, no ambiguos" "0" "$CDM"
vacio "y -Xlint:all no los menciona" "$DM"
espera "el programa corre con una sola copia del nombre" 'dos on-demand      : 0' "tema-5" $J -cp "$TMP/t5dm" DosMismos
no_compila "un on-demand de un paquete inexistente se corta al escribirlo" 'package no.existe does not exist' "tema-5/errores" OnDemandInexistente.java

# ---- la frontera y el modulo que no se lee ----
R24=$( (cd "$RAIZ/tema-5" && javac --release 24 -cp "$TMP/t5" -d "$TMP/err5" src/afuera/Cliente.java) 2>&1 ); C24=$?
igual "la frontera del import de modulo esta entre 24 y 25" "1" "$C24"
lleva "con --release 24 el import de modulo es ilegal" 'module imports are not supported in -source 24' "$R24"
lleva "y javac dice exactamente lo que hay que subir" '(use -source 25 or higher to enable module imports)' "$R24"
ML=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/ModuloNoLeido.java) 2>&1 ); CML=$?
igual "un modulo que existe pero no se lee falla con codigo 1" "1" "$CML"
lleva "JLS 7.5.5: el modulo anonimo no lee java.se" 'unnamed module does not read: java.se' "$ML"
MA=$( (cd "$RAIZ/tema-5" && javac --release 25 --add-modules java.se -d "$TMP/t5a" errores/ModuloNoLeido.java) 2>&1 ); CMA=$?
igual "el MISMO fuente compila en cuanto el modulo entra en el grafo" "0" "$CMA"
vacio "y no dice nada al hacerlo" "$MA"
falla_con "un nombre de modulo inexistente no se confunde con un paquete" 'imported module not found: no.existe' "tema-5" javac --release 25 -d "$TMP/err5" errores/ModuloInexistente.java

# ---- la unidad de compilacion compacta (JEP 512) ----
CM=$( (cd "$RAIZ/tema-5" && $J por-dentro/Compacta.java) 2>&1 ); CCM=$?
igual "la forma compacta corre sin una linea de import" "0" "$CCM"
lleva "los nombres de java.base llegan implicitamente" 'compacta             : [compacta, sin una linea de import]' "$CM"
lleva "la clase implicita se llama como el archivo" 'clase que me cargo    : Compacta' "$CM"
lleva "y cae en el paquete sin nombre" 'paquete donde caigo   : []' "$CM"
CD=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/t5c" por-dentro/Compacta.java) 2>&1 ); CCD=$?
igual "javac tambien acepta la forma compacta a nivel 25" "0" "$CCD"
CG=$( (cd "$RAIZ/tema-5" && javap -p -cp "$TMP/t5c" Compacta) 2>&1 )
lleva "la clase implicita sale FINAL y sin public" 'final class Compacta' "$CG"
lleva "su main es de instancia, sin argumentos" 'void main();' "$CG"
cero_en "el .class no lleva adaptador estatico: quien instancia y llama es el lanzador" 'static void main' "$CG"
C24b=$( (cd "$RAIZ/tema-5" && javac --release 24 -d "$TMP/err5" por-dentro/Compacta.java) 2>&1 )
lleva "la clase implicita tambien nacio en el 25: con 24 es ilegal" 'implicitly declared classes are not supported in -source 24' "$C24b"
falla_con "una compacta no puede declarar paquete: la gramatica no lo admite" 'compact source file should not have package declaration' "tema-5/errores" javac --release 25 -d "$TMP/err5" CompactaConPaquete.java
falla_con "y una compacta sin main no es compacta" 'compact source file does not have main method in the form of void main()' "tema-5/errores" javac --release 25 -d "$TMP/err5" CompactaSinMetodo.java
C24CP=$( (cd "$RAIZ/tema-5" && javac --release 24 -d "$TMP/err5" errores/CompactaConPaquete.java) 2>&1 ); CC24CP=$?
igual "el ilegal de paquete, medido en la cota vieja, tambien cae" "1" "$CC24CP"
veces "pero en 24 corta DOS veces: a la regla de forma se le suma la de las clases implicitas" "$C24CP" 'error:' 2
lleva "y el error anadido es justo el que en 25 no existe" 'implicitly declared classes are not supported in -source 24' "$C24CP"
C24CS=$( (cd "$RAIZ/tema-5" && javac --release 24 -d "$TMP/err5" errores/CompactaSinMetodo.java) 2>&1 )
cero_en "en cambio la regla del main NO llega a decirse en 24: ahi solo cae la de las implicitas" 'does not have main method' "$C24CS"
C24SE=$( (cd "$RAIZ/tema-5" && javac --release 24 -d "$TMP/err5" errores/SoloEnunciados.java) 2>&1 )
lleva "y hasta la lista de tokens del mismo error cambia de una cota a otra" 'class, interface, enum, or record expected' "$C24SE"
falla_con "el archivo de SOLO enunciados tampoco: la gramatica pide al menos un metodo" 'class, interface, annotation type, enum, record, method or field expected' "tema-5/errores" javac --release 25 -d "$TMP/err5" SoloEnunciados.java
SE=$( (cd "$RAIZ/tema-5" && $J errores/SoloEnunciados.java) 2>&1 ); CSE=$?
igual "y el lanzador lo rechaza antes aun que javac" "1" "$CSE"
lleva "con su propio mensaje, que no es el de javac" 'error: no class declared in source file' "$SE"

# ---- un paquete partido entre dos modulos ----
MS=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/t5m" --module-source-path por-dentro/modulos $(find por-dentro/modulos -name '*.java' | LC_ALL=C sort)) 2>&1 ); CMS=$?
igual "el paquete partido con un lector comun corta la compilacion" "1" "$CMS"
lleva "JLS 7.4.3: un tipo tiene que ser univocamente visible" 'module ambos reads package bodega from both uno and dos' "$MS"
lleva "y el senalado es el module-info del lector, no los dos paquetes" 'por-dentro/modulos/ambos/module-info.java' "$MS"
MS2=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/t5m2" --module-source-path por-dentro/modulos $(find por-dentro/modulos -name '*.java' -not -path '*ambos*' | LC_ALL=C sort)) 2>&1 ); CMS2=$?
igual "los dos modulos partidos compilan solos: el error lo comete quien los lee juntos" "0" "$CMS2"
MT=$( (cd "$TMP/t5m2" && find . -name '*.class' | LC_ALL=C sort) )
lleva "cada modulo guarda su mitad del paquete en su carpeta" './uno/bodega/A.class' "$MT"
lleva "y el otro la suya" './dos/bodega/B.class' "$MT"
cero_en "y ninguna de las dos mitades queda suelta en la raiz" '^\./bodega' "$MT"

# ---- donde mira javac las fuentes que no le diste ----
PS=$( (cd "$RAIZ/tema-5" && javac --release 25 -sourcepath arbol/bien -d "$TMP/t5s" arbol/bien/usa/Usa.java) 2>&1 ); CPS=$?
igual "javac encuentra la fuente que no esta en la linea de ordenes" "0" "$CPS"
PT=$( (cd "$TMP/t5s" && find . -name '*.class' | LC_ALL=C sort) )
lleva "y la compila implicitamente: A.class aparece sin haberlo pedido" './bodega/A.class' "$PT"
espera "el programa corre con la clase que javac encontro solo" 'fuente encontrada    : A-de-bodega' "tema-5" $J -cp "$TMP/t5s" usa.Usa
PN=$( (cd "$RAIZ/tema-5" && javac --release 25 -sourcepath arbol/bien -implicit:none -d "$TMP/t5sn" arbol/bien/usa/Usa.java) 2>&1 ); CPN=$?
igual "-implicit:none compila igual de bien" "0" "$CPN"
PNT=$( (cd "$TMP/t5sn" && find . -name '*.class' | LC_ALL=C sort) )
lleva "Usa.class si esta" './usa/Usa.class' "$PNT"
cero_en "A.class no: javac la analizo pero no la escribio" './bodega/A.class' "$PNT"
PSN=$( (cd "$RAIZ/tema-5" && $J -cp "$TMP/t5sn" usa.Usa) 2>&1 ); CPSN=$?
igual "y al correr, la clase que falta se cobra con codigo 1" "1" "$CPSN"
lleva "el fallo es NoClassDefFoundError, no un error del programa" 'java.lang.NoClassDefFoundError: bodega/A' "$PSN"
lleva "con su causa, que usa el nombre con punto" 'Caused by: java.lang.ClassNotFoundException: bodega.A' "$PSN"
PM=$( (cd "$RAIZ/tema-5" && javac --release 25 -sourcepath arbol/mal -d "$TMP/t5sm" arbol/mal/Usa.java) 2>&1 ); CPM=$?
igual "el mismo fuente, con el arbol de fuentes mal apuntado, no compila" "1" "$CPM"
lleva "y el mensaje culpa al paquete, no al archivo" 'package bodega does not exist' "$PM"

# ---- los errores del capitulo 7, uno por uno ----
PJ=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/t5pj" errores/PackageJavaReservado.java) 2>&1 ); CPJ=$?
igual "un paquete bajo java.* SI compila" "0" "$CPJ"
vacio "y javac no avisa de nada" "$PJ"
lleva "el .class cae en la carpeta que anuncia el paquete" 'java/mio/PackageJavaReservado.class' "$( (cd "$TMP/t5pj" && find . -name '*.class') )"
PR=$( (cd "$RAIZ/tema-5" && $J -cp "$TMP/t5pj" java.mio.PackageJavaReservado) 2>&1 ); CPR=$?
igual "pero el paquete java.* esta reservado: al cargar, codigo 1" "1" "$CPR"
lleva "el cargador lo rechaza con SecurityException" 'java.lang.SecurityException: Prohibited package name: java.mio' "$PR"
DD=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/DosDeclaracionesDePaquete.java) 2>&1 ); CDD=$?
igual "dos declaraciones de paquete: codigo 1" "1" "$CDD"
lleva "la segunda declaracion package deja de ser palabra clave" 'class, interface, enum, or record expected' "$DD"
lleva "y el senalado es el renglon de la segunda" 'DosDeclaracionesDePaquete.java:4' "$DD"
PD=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/PackageDespuesDeImport.java) 2>&1 ); CPD=$?
igual "package despues de un import: codigo 1" "1" "$CPD"
lleva "el analizador ya estaba dentro del cuerpo de la clase implicita" 'class, interface, annotation type, enum, record, method or field expected' "$PD"
no_compila "un tipo publico debe vivir en el archivo de su nombre" 'class Guia is public, should be declared in a file named Guia.java' "tema-5/errores" ArchivoMalNombrado.java
DP=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/DosPublicas.java) 2>&1 ); CDP=$?
igual "y no puede haber dos: la regla del nombre implica UNA por archivo" "1" "$CDP"
lleva "los dos renglones salen cortados, no solo el segundo" '2 errors' "$DP"
PC=$( (cd "$RAIZ/tema-5" && javac --release 25 -Xlint:all -d "$TMP/t5pc" por-dentro/SoloPuntoComa.java) 2>&1 ); CPC=$?
igual "los punto y coma sueltos entre clases son inocuos: compilan sin avisar" "0" "$CPC"
vacio "con -Xlint:all tampoco dicen nada" "$PC"
PCT=$( (cd "$TMP/t5pc" && find . -name '*.class' | LC_ALL=C sort) )
lleva "y las dos clases del MISMO archivo salen igual" './puntocoma/Otra.class' "$PCT"
lleva "una" './puntocoma/Una.class' "$PCT"
DU=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/duplicado-uno/Guia.java errores/duplicado-dos/Guia.java) 2>&1 ); CDU=$?
igual "dos miembros homonimos en el mismo paquete: codigo 1" "1" "$CDU"
lleva "JLS 7.1: un paquete no puede tener dos miembros con el mismo nombre simple" 'duplicate class: bodega.Guia' "$DU"
lleva "y la carpeta no salva a ninguno: el paquete es el mismo" 'errores/duplicado-dos/Guia.java' "$DU"
no_compila "un tipo de nivel superior no puede ser static" 'modifier static not allowed here' "tema-5/errores" TopLevelStatic.java
no_compila "ni protected: nadie hereda un tipo de paquete fuera de el" 'modifier protected not allowed here' "tema-5/errores" TopLevelProtected.java
no_compila "import java.util no es un alias del paquete" 'symbol:   class util' "tema-5/errores" ImportDeSubpaquete.java
no_compila "y el error apunta al paquete java, que no tiene un miembro util como tipo" 'location: package java' "tema-5/errores" ImportDeSubpaquete.java
no_compila "el paquete sin nombre no se puede importar" "'.' expected" "tema-5/errores" PaqueteSinNombreImportado.java
no_compila "ni siquiera se puede nombrar desde un paquete con nombre" 'symbol:   class Rasgo' "tema-5/errores" PaqueteSinNombreReferido.java
no_compila "dos single-type-import del mismo nombre: el segundo es error al escribirse" 'a type with the same simple name is already defined by the single-type-import of Date' "tema-5/errores" DosFechasExplicitas.java
FA=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/FechaAmbigua.java) 2>&1 ); CFA=$?
igual "dos on-demand homonimos conviven hasta que se usa el nombre" "1" "$CFA"
lleva "ahi la ambiguedad se declara en el uso" 'reference to Date is ambiguous' "$FA"
lleva "y javac enumera a los dos" 'both class java.sql.Date in java.sql and class java.util.Date in java.util match' "$FA"
falla_con "import static de un campo de instancia: no hay una casilla unica que importar" 'symbol:   static gramos' "tema-5" javac --release 25 -cp "$TMP/t5" -d "$TMP/err5" errores/StaticDeCampoDeInstancia.java
falla_con "y el miembro tiene que existir, no solo el paquete" 'symbol:   static noExiste' "tema-5" javac --release 25 -cp "$TMP/t5" -d "$TMP/err5" errores/StaticDeMiembroInexistente.java
falla_con "un nombre estatico y un single-type chocan: la estatica pierde" 'a type with the same simple name is already defined by the static single-type-import of Sello' "tema-5" javac --release 25 -cp "$TMP/t5" -d "$TMP/err5" errores/ChoqueDeNombreExplicito.java
LS=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/ListaSinImport.java) 2>&1 ); CLS=$?
igual "una unidad ordinaria no importa java.base: solo la compacta" "1" "$CLS"
lleva "List no se ve" 'symbol:   class List' "$LS"
lleva "y es el UNICO error: ArrayList, que si esta importado, se ve" '1 error' "$LS"
VI=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/vecinos/ConImport.java errores/vecinos/SinImport.java) 2>&1 ); CVI=$?
igual "el import de un vecino del MISMO paquete no llega al otro archivo" "1" "$CVI"
lleva "el error es de quien NO escribio el import" 'location: class SinImport' "$VI"
veces "y son DOS, no uno: la misma linea falla dos veces porque el nombre se busca dos veces" "$VI" 'location: class SinImport' 2
cero_en "y el vecino que si lo escribio no da ningun error" 'class ConImport' "$VI"
VS=$( (cd "$RAIZ/tema-5" && javac --release 25 -d "$TMP/err5" errores/vecinos/ConImport.java errores/vecinos/SinImportEstatico.java) 2>&1 ); CVS=$?
igual "por la puerta estatica tampoco llega: Date no es un miembro del vecino" "1" "$CVS"
lleva "los dos errores siguen siendo del que importa estaticos" 'location: class SinImportEstatico' "$VS"
veces "y aca tambien son DOS, con lo que el conteo no dependio de la forma del import" "$VS" 'location: class SinImportEstatico' 2
cero_en "y ConImport vuelve a salir limpio" 'class ConImport' "$VS"

resultado
