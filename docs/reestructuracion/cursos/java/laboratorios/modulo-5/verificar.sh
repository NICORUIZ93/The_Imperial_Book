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

resultado
