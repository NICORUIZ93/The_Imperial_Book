#!/usr/bin/env bash
# Java · M4 · Arreglos y primeras colecciones — verificación del laboratorio.
# Ejecuta cada ejemplo del módulo y comprueba su salida. Sigue ante fallos y termina en «RESULTADO: OK».
# Uso: ./verificar.sh            (necesita JDK 25 en PATH; el manifiesto usa el wrapper de Gradle)
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

titulo "Tema 1 · Arreglos: crear, recorrer y sus valores por defecto"
espera "longitud, primer y ultimo indice" 'llegada   : longitud 5 · primer indice 0 = 1250 · ultimo indice 4 = 250' tema-1 $J CrearYRecorrer.java
espera "new int[n] sale lleno de ceros" 'porTamano(3): longitud 3 · su primer valor es 0' tema-1 $J CrearYRecorrer.java
espera "new int[] {...} sirve como expresion" 'porExpresion: longitud 3' tema-1 $J CrearYRecorrer.java
espera "for con indice y for-each suman igual" 'suma con indice: 13390 · suma con for-each: 13390' tema-1 $J CrearYRecorrer.java
espera "un arreglo de tamano cero se recorre sin problema" 'arreglo vacio: length 0 · la suma de sus elementos es 0' tema-1 $J CrearYRecorrer.java
espera "reasignar con new si se puede" 'reasignado: empezo con length 5, ahora length 3 · [0] = 1250' tema-1 $J CrearYRecorrer.java
espera "los int nacen en cero y su clase es [I" 'int    [3]: 0 0 0 · su clase es class [I' tema-1 $J ValoresPorDefecto.java
espera "double nace en 0.0, no en null" 'double [2]: 0.0 0.0' tema-1 $J ValoresPorDefecto.java
espera "boolean nace en false" 'boolean[2]: false false' tema-1 $J ValoresPorDefecto.java
espera "char nace en el caracter cero, no en espacio" 'char   [2]: u+000 (cero) · u+000 (cero)' tema-1 $J ValoresPorDefecto.java
espera "las referencias nacen en null" 'String [2]: null · null · componente class java.lang.String' tema-1 $J ValoresPorDefecto.java
espera "0.0 == 0 si es legal y null == null tambien" '0 == false ? no compila; 0.0 == 0 ? true; null == null ? true' tema-1 $J ValoresPorDefecto.java
espera "escribir un hueco se ve al leer el mismo arreglo" 'tras gramos[1] = 3400: 0 3400 0 · suma 3400' tema-1 $J ValoresPorDefecto.java
falla_con "la condicion <= pasa de length" 'java.lang.ArrayIndexOutOfBoundsException: Index 5 out of bounds for length 5' tema-1 $J errores/IndiceHastaLength.java
falla_con "un indice negativo es igual de ilegal" 'java.lang.ArrayIndexOutOfBoundsException: Index -1 out of bounds for length 3' tema-1 $J errores/IndiceNegativo.java
no_compila "length es campo, no metodo" 'cannot find symbol' tema-1/errores ConfundeParentesisConLength.java
no_compila "el mensaje nombra el tipo de la variable" 'location: variable llegada of type int[]' tema-1/errores ConfundeParentesisConLength.java
no_compila "las llaves sin new solo van en la declaracion" 'illegal start of expression' tema-1/errores InicializadorFueraDeDeclaracion.java
espera "la clase real de un arreglo es su firma" 'clase real de un int[]   : [I' tema-1/por-dentro $J FormaDeUnArreglo.java
espera "un int[][] se firma con dos corchetes" 'clase real de un int[][] : [[I' tema-1/por-dentro $J FormaDeUnArreglo.java
espera "un arreglo es un Object con interfaces" 'isArray                  : true · superclass: class java.lang.Object' tema-1/por-dentro $J FormaDeUnArreglo.java
espera "clone devuelve Object y hay que casting" 'clone devuelve Object    : original[0]=1250 copia[0]=9999' tema-1/por-dentro $J FormaDeUnArreglo.java
espera "reflect.Array lee el arreglo sin saber su tipo" 'reflect.Array.getLength  : 3 · y su elemento 1 es 3400' tema-1/por-dentro $J FormaDeUnArreglo.java
bytecode "crear un arreglo de primitivos es newarray" 'newarray       int' tema-1/por-dentro FormaDeUnArreglo.java FormaDeUnArreglo
bytecode "guardar un int es iastore" 'iastore' tema-1/por-dentro FormaDeUnArreglo.java FormaDeUnArreglo

titulo "Tema 2 · Matrices y la clase Arrays"
espera "una matriz tiene longitud de filas y de columnas" 'longitud de la fila 0 : 3 columnas' tema-2 $J Matrices.java
espera "el recorrido con dos indices usa la longitud de la fila" '  fila 0 suma 5540' tema-2 $J Matrices.java
espera "el for-each de una matriz entrega FILAS" '  fila de 3 columnas suma 5540' tema-2 $J Matrices.java
espera "una matriz irregular tiene filas de otro tamano" 'irregular: filas 3 · longitudes 2 1 4' tema-2 $J Matrices.java
espera "final no congela el contenido del arreglo" 'tras POR_FILA[0][0] = 9999 -> fila 0: 9999 · fila 1: 7600' tema-2 $J Matrices.java
espera "clone de una matriz es superficial" 'clone es superficial: original[0][0]=1 · copia[0][0]=1 (misma fila: true)' tema-2 $J Matrices.java
espera "Arrays.sort deja el orden pedido" 'ordenado: [250, 890, 1250, 3400, 7600]' tema-2 $J UsosDeArrays.java
espera "binarySearch devuelve el indice" 'binarySearch(1250) : 2' tema-2 $J UsosDeArrays.java
espera "si no esta, devuelve -(posicion) - 1" 'binarySearch(1000) : -3 · deberia ir en el indice 2' tema-2 $J UsosDeArrays.java
espera "copyOf rellena de ceros al crecer" 'copyOf(...,7)      : [250, 890, 1250, 3400, 7600, 0, 0]' tema-2 $J UsosDeArrays.java
espera "copyOfRange corta un trozo" 'copyOfRange(1,3)   : [890, 1250] · length 2' tema-2 $J UsosDeArrays.java
espera "fill cubre un rango" 'fill(5,7,42)       : [250, 890, 1250, 3400, 7600, 42, 42]' tema-2 $J UsosDeArrays.java
espera "equals compara contenido, no identidad" 'igualdad: == false · equals true · equals del propio true' tema-2 $J UsosDeArrays.java
espera "mismatch dice donde empiezan a diferir" 'mismatch           : -1 ( -1 = no difiere en nada)' tema-2 $J UsosDeArrays.java
espera "toString de una matriz solo ve la primera capa" "toString            : empieza '[[I' y tiene '@' si · 2 trozos" tema-2 $J UsosDeArrays.java
espera "deepToString si baja a las filas" 'deepToString        : [[1, 2], [3, 4]]' tema-2 $J UsosDeArrays.java
espera "equals de matrices compara FILAS por identidad" 'equals / deepEquals : false / true' tema-2 $J UsosDeArrays.java
espera "asList es una vista: set cambia el arreglo" 'tras vista.set(0)   : arreglo [Envigado, Bogota, Cali] · vista [Envigado, Bogota, Cali]' tema-2 $J UsosDeArrays.java
espera "buscar sin ordenar acierta por casualidad" 'binarySearch(1250) = 2 · adivina el indice 2 por casualidad' tema-2 $J BuscaSinOrdenar.java
espera "y otras veces dice que no esta si lo esta" 'binarySearch(890)  = -1 · dice que no esta, y SI esta en el indice 3' tema-2 $J BuscaSinOrdenar.java
espera "ordenado, la misma busqueda responde bien" '  binarySearch(890)  = 1' tema-2 $J BuscaSinOrdenar.java
espera "asList de un int[] da UNA lista con un arreglo" 'List<int[]>  : size 1' tema-2 $J UnaListaDeUnArreglo.java
espera "y ese elemento conserva su firma de arreglo" 'su UNICO elemento es de clase [I' tema-2 $J UnaListaDeUnArreglo.java
espera "con envoltorios si salen tres elementos" 'List<Integer>: size 3 · suma 5540' tema-2 $J UnaListaDeUnArreglo.java
no_compila "los arreglos no tienen metodo sort" 'symbol:   method sort()' tema-2/errores SinMetodosPropios.java
no_compila "asList de primitivos no inference Integer" 'inference variable T has incompatible bounds' tema-2/errores AsListDePrimitivos.java
falla_con "new int[3][] deja las filas en null" 'Cannot read the array length because' tema-2/errores $J FilaNula.java
falla_con "con -g la excepcion nombra la expresion" 'because "porFila[i]" is null' tema-2 sh -c "javac -g -d '$TMP/t2' errores/FilaNula.java 2>/dev/null; javac -g --release 25 -d '$TMP/t2b' errores/FilaNula.java && java -cp '$TMP/t2b' FilaNula"
falla_con "la vista de asList no se alarga" 'java.lang.UnsupportedOperationException' tema-2/errores $J AnadeAAsList.java
espera "una matriz es un arreglo de arreglos" 'clase de int[][]     : [[I · filas 2' tema-2/por-dentro $J FormaDeUnaMatriz.java
espera "su componente es la fila, otra vez arreglo" 'componente del entero: [I' tema-2/por-dentro $J FormaDeUnaMatriz.java
espera "rectangular e irregular son la MISMA clase" 'misma clase?         : true' tema-2/por-dentro $J FormaDeUnaMatriz.java
espera "cualquier hueco de la fila es accesible" 'cambiar la fila fuera: r[0][0] = 9999' tema-2/por-dentro $J FormaDeUnaMatriz.java
bytecode "new int[2][3] es una sola instruccion" 'multianewarray' tema-2/por-dentro FormaDeUnaMatriz.java FormaDeUnaMatriz
bytecode "fila por fila usa anewarray de [I" 'anewarray' tema-2/por-dentro FormaDeUnaMatriz.java FormaDeUnaMatriz

titulo "Tema 3 · Covarianza y ArrayStoreException"
espera "la vista Object no cambia la clase real" 'la clase real NO cambia: [Ljava.lang.String;' tema-3 $J Covarianza.java
espera "asignar una referencia no copia nada" 'misma identidad?         : true' tema-3 $J Covarianza.java
espera "escribir por la vista escribe en el original" 'por el arreglo original  : RF-000123' tema-3 $J Covarianza.java
espera "el cast de vuelta funciona mientras el tipo aguante" 'cast de vuelta           : hueco · RF-000124' tema-3 $J Covarianza.java
espera "un int[] es un Object pero no un Object[]" 'int[] asignado a Object  : [I' tema-3 $J Covarianza.java
espera "el metodo ve la clase REAL del arreglo" '  dentro del metodo ve un  : [Ljava.lang.String;' tema-3 $J EscribeEnObject.java
espera "en Object[] cabe un Integer sin avisar" 'Object[] con un Integer   : 7 de Integer' tema-3 $J EscribeEnObject.java
espera "el ClassCastException llega al LEER" 'el error aparece al leer  : ClassCastException · class java.lang.Integer cannot be cast to class java.lang.String' tema-3 $J EscribeEnObject.java
espera "la escritura ilegal deja lo anterior guardado" 'arreglo a medio escribir  : ArrayStoreException · java.lang.Integer' tema-3 $J EscribeEnObject.java
espera "y el indice que no toco conserva su valor" '  el resto quedo viejo    : RF-0001 · RF-0002' tema-3 $J EscribeEnObject.java
espera "en Integer[] el mismo paso falla de una" 'sobre Integer[] falla ya  : ArrayStoreException · el indice 0 sigue siendo Integer' tema-3 $J EscribeEnObject.java
falla_con "el cast de Object[] a String[] lo niega la JVM" 'class [Ljava.lang.Object; cannot be cast to class [Ljava.lang.String;' tema-3/errores $J CastInvalido.java
no_compila "una lista de String no es una lista de Object" 'List<String> cannot be converted to List<Object>' tema-3/errores ListaNoCovariante.java
no_compila "int[] no se convierte en Object[]" 'int[] cannot be converted to Object[]' tema-3/errores PrimitivosNoSonObjectArray.java
espera "un primitivo sigue guardandose en su propio arreglo" 'primitivo guardado     : 1250' tema-3/por-dentro $J UnaInstruccionParaGuardar.java
espera "y el desempaquetado de la lista no menciona String" 'lista declarada String : 2 elementos' tema-3/por-dentro $J UnaInstruccionParaGuardar.java
espera "la lista admite el Integer sin protestar" 'anadido sin excepcion   : 1 elementos · un Integer' tema-3/por-dentro $J ListaSinGuarda.java
espera "el cast doble compila y la talla no cambia" 'la trampa compila       : true' tema-3/por-dentro $J ListaSinGuarda.java
espera "las dos listas ven el MISMO objeto" 'mismo objeto en las dos : true' tema-3/por-dentro $J ListaSinGuarda.java
espera "y el error aparece al leer, no al escribir" 'revienta al leer        : ClassCastException' tema-3/por-dentro $J ListaSinGuarda.java
espera "el mensaje nombra los dos tipos" 'nombra los dos tipos  : true' tema-3/por-dentro $J ListaSinGuarda.java
bytecode "el lector lleva el checkcast que javac inserta" 'checkcast' tema-3/por-dentro ListaSinGuarda.java ListaSinGuarda
bytecode "y get devuelve Object: el tipo no esta en la firma" 'java/util/List.get:(I)Ljava/lang/Object;' tema-3/por-dentro ListaSinGuarda.java ListaSinGuarda
espera "sin la anotacion, javac avisa del cast" 'unchecked cast' . sh -c "sed 's/@SuppressWarnings(\"unchecked\")//' tema-3/por-dentro/ListaSinGuarda.java > '$TMP/ListaSinGuarda.java' && javac -Xlint:unchecked --release 25 -d '$TMP/lsg' '$TMP/ListaSinGuarda.java' 2>&1"
bytecode "una sola instruccion para guardar cualquier objeto" 'aastore' tema-3/por-dentro UnaInstruccionParaGuardar.java UnaInstruccionParaGuardar
bytecode "el borrado de tipos deja List.add con Object" 'java/util/List.add:(Ljava/lang/Object;)Z' tema-3/por-dentro UnaInstruccionParaGuardar.java UnaInstruccionParaGuardar
espera "la matriz de Object sigue siendo matriz de String[]" 'componente real: [Ljava.lang.String;' tema-3/por-dentro $J MatrizCovariante.java
espera "bajar una capa tambien la rechaza la JVM" 'rechaza una capa abajo  : ArrayStoreException · [Ljava.lang.Integer;' tema-3/por-dentro $J MatrizCovariante.java
espera "la casilla que si cabe se guarda normal" 'casilla 1 admitida     : [ok]' tema-3/por-dentro $J MatrizCovariante.java
espera "la casilla rechazada no se escribe a medias" 'casilla 0 sigue siendo : null' tema-3/por-dentro $J MatrizCovariante.java

titulo "Tema 4 · ArrayList y HashMap"
espera "una lista recien creada esta vacia" 'vacia                    : size 0 · isEmpty true' tema-4 $J ListaDeGuias.java
espera "add al final conserva el orden de llegada" 'tras 3 add               : [RF-000123, RF-000124, RF-000125]' tema-4 $J ListaDeGuias.java
espera "add(i, x) desplaza en vez de sustituir" 'add(1, ...)              : [RF-000123, RF-000123B, RF-000124, RF-000125]' tema-4 $J ListaDeGuias.java
espera "indexOf de un ausente es -1" 'contiene / indexOf       : true / 3 · ausente -1' tema-4 $J ListaDeGuias.java
espera "remove(int) quita por posicion" 'remove(0) por posicion   : devolvio RF-000123' tema-4 $J ListaDeGuias.java
espera "remove(Object) quita por valor" 'queda [RF-000123B, RF-000125]' tema-4 $J ListaDeGuias.java
espera "con cajas, remove(1) sigue siendo la POSICION" 'pesos.remove(1)          : [10, 7] · quito la POSICION' tema-4 $J ListaDeGuias.java
espera "para quitar por valor hay que empaquetar" 'remove(Integer.valueOf(7)): [10]' tema-4 $J ListaDeGuias.java
espera "addAll y clear tambien cuentan" 'clear                    : size 0 · isEmpty true' tema-4 $J ListaDeGuias.java
espera "put repetido devuelve el valor anterior" 'put repetido             : devolvio 20000 · queda 25000' tema-4 $J MapaDeZonas.java
espera "putIfAbsent no toca lo que ya esta" 'putIfAbsent(Medellin)    : 30000 · sigue 30000' tema-4 $J MapaDeZonas.java
espera "replace de una clave ausente devuelve null" 'replace de ausente       : null (null = no estaba)' tema-4 $J MapaDeZonas.java
espera "get de una clave ausente es null en silencio" 'get de ausente           : null · getOrDefault: 0' tema-4 $J MapaDeZonas.java
espera "y sumar ese null revienta al desempaquetar" 'desempaquetar el null    : NullPointerException' tema-4 $J MapaDeZonas.java
espera "merge acumula sin preguntar si existe" 'merge ordenado           : {Bogota=1000, Cali=1000, Medellin=3000}' tema-4 $J MapaDeZonas.java
espera "computeIfAbsent solo calcula si falta" 'computeIfAbsent ordenado : {Bogota=1000, Cali=1000, Medellin=3000, Pereira=500}' tema-4 $J MapaDeZonas.java
espera "HashMap no respeta el orden de insercion" 'HashMap conserva el orden de insercion? false' tema-4 $J MapaDeZonas.java
espera "LinkedHashMap si lo respeta" 'LinkedHashMap si lo conserva: [Medellin, Bogota, Cali]' tema-4 $J MapaDeZonas.java
espera "un mapa admite una clave null" 'clave null               : sin zona asignada' tema-4 $J MapaDeZonas.java
espera "removeIf borra lo que cumple" 'removeIf                 : [RF-000123, RF-000124, RF-000125]' tema-4 $J BorrarSinRomper.java
espera "iterator.remove recorre todo y borra uno" 'iterator.remove          : visitados 4 · queda [RF-000123, RF-000125, RF-000900]' tema-4 $J BorrarSinRomper.java
espera "recorrer una copia si deja borrar de la original" 'recorrer una copia       : [RF-000123, RF-000124, RF-000900]' tema-4 $J BorrarSinRomper.java
espera "el for con indice al reves tambien sirve" 'for con indice al reves  : [RF-000124, RF-000125, RF-000900]' tema-4 $J BorrarSinRomper.java
espera "List.of no admite add" 'List.of + add     : UnsupportedOperationException' tema-4 $J FijasYMutables.java
espera "Map.of no admite put" 'Map.of + put      : UnsupportedOperationException' tema-4 $J FijasYMutables.java
espera "copiar en ArrayList si deja crecer" 'copia en ArrayList: [RF-000123, RF-000124, RF-000125]' tema-4 $J FijasYMutables.java
espera "y la fija queda intacta" 'original intacta  : [RF-000123, RF-000124]' tema-4 $J FijasYMutables.java
espera "List.of tampoco admite null" 'List.of con null  : NullPointerException' tema-4 $J FijasYMutables.java
espera "un HashMap si guarda un valor null" 'HashMap con null  : null · la clave si esta: true' tema-4 $J FijasYMutables.java
espera "copiar un mapa fijo lo vuelve editable" 'copia de mapa fijo  : size 2 · el original sigue en 1' tema-4 $J FijasYMutables.java
falla_con "borrar dentro del for-each rompe el recorrido" 'java.util.ConcurrentModificationException' tema-4/errores $J IterarYBorrar.java
falla_con "get(0) de una lista vacia no perdona" 'java.lang.IndexOutOfBoundsException: Index 0 out of bounds for length 0' tema-4/errores $J VaciaConIndice.java
falla_con "una coleccion fija no crece" 'java.lang.UnsupportedOperationException' tema-4/errores $J ImmutablesNoCrecen.java
espera "las dos formas de recorrer dan la misma suma" 'conIndice / conForEach : 5540 / 5540' tema-4/por-dentro $J RecorridoEnBytecode.java
espera "ArrayList es RandomAccess y LinkedList no" 'LinkedList es RandomAccess: false' tema-4/por-dentro $J RecorridoEnBytecode.java
espera "length es campo del arreglo, size() metodo de la lista" 'arreglo.length / lista.size(): 3 / 3' tema-4/por-dentro $J RecorridoEnBytecode.java
espera "equals de listas compara elementos" 'equals de listas          : true · lista.equals(arreglo): false' tema-4/por-dentro $J RecorridoEnBytecode.java
bytecode "el for-each se compila con iterator" 'java/util/List.iterator:()Ljava/util/Iterator;' tema-4/por-dentro RecorridoEnBytecode.java RecorridoEnBytecode
bytecode "el for con indice se compila con get" 'java/util/List.get:(I)Ljava/lang/Object;' tema-4/por-dentro RecorridoEnBytecode.java RecorridoEnBytecode
espera "ArrayList no reserva hueco hasta el primer add" 'recien creada : size 0 · hueco 0' tema-4/por-dentro java -Dstdout.encoding=UTF-8 --add-opens java.base/java.util=ALL-UNNAMED Crecimiento.java
espera "el primer salto es de 10 a 15, no de 10 a 11" 'tras 11       : size 11 · hueco 15' tema-4/por-dentro java -Dstdout.encoding=UTF-8 --add-opens java.base/java.util=ALL-UNNAMED Crecimiento.java
espera "y el segundo de 15 a 22" 'tras 16       : size 16 · hueco 22' tema-4/por-dentro java -Dstdout.encoding=UTF-8 --add-opens java.base/java.util=ALL-UNNAMED Crecimiento.java
espera "la regla del salto se reproduce en los dos saltos" 'los saltos    : 5 y 7 · cada salto es hueco viejo + hueco viejo/2' tema-4/por-dentro java -Dstdout.encoding=UTF-8 --add-opens java.base/java.util=ALL-UNNAMED Crecimiento.java

titulo "Tema 5 · Wrappers, autoboxing y la cache de Integer"
espera "encajar y desencajar sin escribir nada" 'caja / suelto          : 1250 / 1250' tema-5 $J EncajarYDesencajar.java
espera "el argumento int se encaja en el parametro Integer" 'parametro int -> Integer: 28900.0' tema-5 $J EncajarYDesencajar.java
espera "el return Integer se desencaja en int" 'Integer -> int de vuelta: 1250' tema-5 $J EncajarYDesencajar.java
espera "la aritmetica con cajas vuelve a encajar" 'suma con cajas         : 5540 · clase Integer' tema-5 $J EncajarYDesencajar.java
espera "new y valueOf no son el mismo objeto" 'valueOf vs new         : false · equals true · hashCode igual: true' tema-5 $J EncajarYDesencajar.java
espera "parseInt da un int y valueOf una caja" 'parseInt / valueOf     : 890 · 890' tema-5 $J EncajarYDesencajar.java
espera "int == Integer desempaca la caja" 'int == Integer         : true' tema-5 $J EncajarYDesencajar.java
espera "entre cajas, == es identidad" '1000 == 1000 con cajas : false · equals true · compareTo 0' tema-5 $J EncajarYDesencajar.java
espera "un literal que cabe se estrecha y se encaja" 'constante que cabe     : 120 / 120 · Byte.valueOf(120) == cajaChica: true' tema-5 $J EncajarYDesencajar.java
espera "el javac avisa del constructor deprecado" 'uses or overrides a deprecated API' tema-5 sh -c "javac --release 25 -d '$TMP/t5' EncajarYDesencajar.java 2>&1"
espera "127 comparte caja, 128 no" 'valueOf(128) misma caja : false' tema-5 $J CacheDeInteger.java
espera "el corte por arriba se puede medir" 'corte por arriba        : 128 (el primero que ya no)' tema-5 $J CacheDeInteger.java
espera "el corte por abajo tambien" 'corte por abajo         : -129 (el primero que ya no)' tema-5 $J CacheDeInteger.java
espera "equals nunca noto la cache" 'equals no lo nota       : true · compareTo 0' tema-5 $J CacheDeInteger.java
espera "el autoboxing hereda la cache" 'autoboxing 127 == 127   : true' tema-5 $J CacheDeInteger.java
espera "y hereda tambien el corte" 'autoboxing 128 == 128   : false' tema-5 $J CacheDeInteger.java
espera "Long y Short cortan en el mismo sitio" 'Long        -128/127    : true / true · 128: false' tema-5 $J CacheDeInteger.java
espera "Character guarda hasta el 127" 'Character        0/127  : true / true · 128: false' tema-5 $J CacheDeInteger.java
espera "Byte esta completo en la cache" 'Byte   toda la gama     : true y true' tema-5 $J CacheDeInteger.java
espera "Double no tiene cache" 'Boolean constantes      : true · Double NO tiene cache: false' tema-5 $J CacheDeInteger.java
espera "con la propiedad, el corte sube a 5001" 'corte por arriba        : 5001 (el primero que ya no)' tema-5 sh -c "java -Djava.lang.Integer.IntegerCache.high=5000 -Dstdout.encoding=UTF-8 CacheDeInteger.java"
espera "autoboxing compila a valueOf, no a new" 'empaca(127)  es caja   : 127 · misma que valueOf: true' tema-5/por-dentro $J AutoboxingEnBytecode.java
espera "y el new forzaco no cae en la cache" 'new Integer(30)        : 30 · NO es la cache: false' tema-5/por-dentro $J AutoboxingEnBytecode.java
bytecode "encajar es invokestatic valueOf" 'java/lang/Integer.valueOf:(I)Ljava/lang/Integer;' tema-5/por-dentro AutoboxingEnBytecode.java AutoboxingEnBytecode
bytecode "desencajar es invokevirtual intValue" 'java/lang/Integer.intValue:()I' tema-5/por-dentro AutoboxingEnBytecode.java AutoboxingEnBytecode
falla_con "sumar un get ausente revienta al desempaquetar" 'Cannot invoke "java.lang.Integer.intValue()"' tema-5/errores $J SumaCajaNula.java
falla_con "el ternario numerico desempaca la caja nula" 'java.lang.NullPointerException' tema-5/errores $J TernarioDesempacota.java
no_compila "un literal sin L no llega a Long" 'int cannot be converted to Long' tema-5/errores LongSinEle.java
no_compila "128 no cabe en Byte ni encajado" 'int cannot be converted to Byte' tema-5/errores BordeDeByte.java

titulo "Tema 6 · Algoritmos a mano y coste"
espera "la lineal devuelve el indice y conto sus comparaciones" 'lineal 890 : indice 3 · comparaciones 4' tema-6 $J BuscarYOrdenarAMano.java
espera "y en el peor caso repasa todo" 'comparaciones 7 (repaso los 7 porque no estaba)' tema-6 $J BuscarYOrdenarAMano.java
espera "la binaria necesita el orden y conta menos" 'binaria 890: indice 2 · comparaciones 3' tema-6 $J BuscarYOrdenarAMano.java
espera "mi binaria coincide con la de Arrays" 'mismo resultado que Arrays.binarySearch: true' tema-6 $J BuscarYOrdenarAMano.java
espera "insercion ordena con menos comparaciones" 'insercion  : [45, 250, 890, 1250, 3400, 7600, 18000] · comparaciones 14' tema-6 $J BuscarYOrdenarAMano.java
espera "burbuja ordena igual con mas" 'burbuja    : [45, 250, 890, 1250, 3400, 7600, 18000] · comparaciones 21' tema-6 $J BuscarYOrdenarAMano.java
espera "al duplicar n, la lineal duplica y la binaria suma uno" '8000   8000    13       31996000' tema-6 $J Crecimiento.java
espera "en el peor caso las dos cuadratricas empatan" 'invertido 8000   : insercion 31996000 · burbuja 31996000' tema-6 $J Crecimiento.java
espera "en casi-ordenado insercion gana por 2000 veces" 'casi ordenado 8000: insercion 15997 · burbuja 31996000' tema-6 $J Crecimiento.java
espera "el contador en int se desborda" '100000*(99999)/2 : long 4999950000 · int 704982704' tema-6 $J Crecimiento.java
espera "intercambio sin temporal pierde un valor" 'intercambio roto  : [3400, 3400, 890] · perdió el 1250' tema-6 $J OrdenRoto.java
espera "(bajo+alto)/2 se desborda a negativo" 'medio peligroso   : -1' tema-6 $J OrdenRoto.java
espera "bajo + (alto-bajo)/2 no" 'medio seguro      : 2147483646' tema-6 $J OrdenRoto.java
espera "insertar sin rescatar duplica el mayor" 'sin rescatar      : [7600, 7600, 7600]' tema-6 $J OrdenRoto.java
falla_con "el limite interior mal puesto salta fuera del arreglo" 'java.lang.ArrayIndexOutOfBoundsException: Index 4 out of bounds for length 4' tema-6/errores $J BurbujaFueraDeRango.java
falla_con "bajo = medio no converge nunca" 'IllegalStateException: no converge: 1001 vueltas' tema-6/errores $J BusquedaQueNoTermina.java
no_compila "las cadenas no se comparan con <" 'bad operand types for binary operator' tema-6/errores ComparaConMenorQue.java
espera "un intercambio son cuatro accesos al arreglo" 'intercambio        : [1250, 250, 7600]' tema-6/por-dentro $J CosteEnBytecode.java
espera "las dos sumas dan lo mismo" 'sumaVista/sumaGuardada: 9100 / 9100' tema-6/por-dentro $J CosteEnBytecode.java
bytecode "el intercambio usa iaload e iastore" 'iastore' tema-6/por-dentro CosteEnBytecode.java CosteEnBytecode
bytecode "la longitud se lee con arraylength" 'arraylength' tema-6/por-dentro CosteEnBytecode.java CosteEnBytecode
bytecode "y el contador sube con iinc" 'iinc' tema-6/por-dentro CosteEnBytecode.java CosteEnBytecode

titulo "Laboratorio · manifiesto de carga con Gradle"
espera "el build esta escrito en Kotlin DSL con toolchain y catalogo" 'ok' . sh -c 'grep -q "JavaLanguageVersion.of" build.gradle.kts && grep -q "rutaflow-nucleo" settings.gradle.kts && grep -q "^java = \"25\"" gradle/libs.versions.toml && test -f gradle/wrapper/gradle-wrapper.jar && echo ok'
if gradle_disponible; then
    espera "gradle test: las 9 pruebas pasan" 'BUILD SUCCESSFUL' . $GRADLE --console=plain test
    espera "gradle run liquida el manifiesto" 'las dos versiones cuadran: true' . $GRADLE --console=plain -q run --args="2100"
    espera "gradle run filtra por el tope del argumento" 'sobre el tope 2100  : [3400] · contando con binarySearch: 1' . $GRADLE --console=plain -q run --args="2100"
fi

resultado
