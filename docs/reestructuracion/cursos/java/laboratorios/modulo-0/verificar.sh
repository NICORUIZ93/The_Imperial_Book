#!/usr/bin/env bash
# Java · M0 · Plataforma, herramientas y primer programa — verificación del laboratorio.
# Ejecuta cada ejemplo del módulo y comprueba su salida. Sigue ante fallos y termina en «RESULTADO: OK».
# Uso: ./verificar.sh            (necesita JDK 25 en PATH; el tema 7 usa el wrapper de Gradle)
#      GRADLE="gradle --offline" ./verificar.sh   (usa un Gradle ya instalado)
#      GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts" ./verificar.sh
#                                 (máquina sin JDK 25: el init script presta el toolchain instalado)
#      EXIGIR_GRADLE=1 ./verificar.sh             (falla si Gradle no arranca, en vez de omitirlo)
#      EXIGIR_JDK25=1 ./verificar.sh              (falla si el runtime de esta máquina no es el 25)
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
# La frase que imprime el lanzador `java` cuando algo sale mal NO es comprobable: cambia de plataforma y de
# idioma. Comprobado en macOS arm64 con Temurin 27 y locale es_CO: aunque el programa dentro de la JVM ve
# `user.language=es`, el lanzador imprime `Error: Could not find or load main class …` en inglés, y repetir
# la corrida con -Duser.language=es -Duser.country=CO no lo traduce. Las comprobaciones de abajo exigen, por
# eso, lo que imprime la propia JVM (el nombre de la excepción, la firma que pide) y código de salida
# distinto de cero, nunca la frase del lanzador.

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

titulo "Tema 1 · Qué es Java hoy"
# «java es la entrega 25» habla del runtime, no del compilador: con otra JVM en PATH da otro número.
# Se omite (no se afloja: no se acepta cualquier valor) y EXIGIR_JDK25=1 lo convierte en fallo.
ENTREGA=$(java -XshowSettings:properties -version 2>&1 | sed -n 's/.*java\.version = \([0-9]*\).*/\1/p')
if [ "$ENTREGA" = "25" ]; then
    espera "java es la entrega 25" 'Número de entrega (feature): 25' tema-1 $J VersionDeJava.java
elif [ "${EXIGIR_JDK25:-0}" = "1" ]; then
    mal "java es la entrega 25 (esta JVM es la $ENTREGA)"
else
    omitido "java es la entrega 25: en esta máquina ejecuta la $ENTREGA; el número lo da el runtime, así que hay que repetirlo con JDK 25 en PATH"
fi
espera "informe de entorno válido" 'RESULTADO: plataforma válida para rutaflow-nucleo' tema-1 $J InformeDeEntorno.java
espera "el JDK trae javac, javap, jshell y jdb" 'jdb' . sh -c 'for h in javac javap jshell jdb jar; do command -v $h > /dev/null || exit 1; done; echo jdb'
espera "el formato de clase de la entrega 25 es el 69" 'major version: 69' tema-1 sh -c "javac --release 25 -d '$TMP/t1' VersionDeJava.java && javap -v -cp '$TMP/t1' VersionDeJava"

titulo "Tema 2 · Instalar JDK 25 y convivir con varias versiones"
espera "java.home apunta a un JDK" 'java.home = ' tema-2 $J DondeEstaJava.java
if [ -n "$JAVA_HOME" ]; then
    espera "JAVA_HOME y PATH apuntan al mismo JDK 25" 'RESULTADO: entorno coherente' tema-2 $J ComprobarEntorno.java
else
    falla_con "sin JAVA_HOME, la comprobación lo detecta" 'JAVA_HOME no está definida' tema-2 $J ComprobarEntorno.java
fi
falla_con "con JAVA_HOME equivocada, la comprobación lo detecta" 'problema(s)' tema-2 env JAVA_HOME=/ruta/que/no/existe $J ComprobarEntorno.java

titulo "Tema 3 · Del fuente al bytecode"
espera "javac crea Arranque.class y java lo ejecuta" 'rutaflow-nucleo en marcha' tema-3 sh -c "javac -d '$TMP/t3' src/Arranque.java && java -cp '$TMP/t3' Arranque"
espera "javap muestra la llamada a println" 'invokevirtual' tema-3 javap -c -cp "$TMP/t3" Arranque
espera "dos fuentes, dos .class, una ejecución" 'de 2500 g: $11400' tema-3 sh -c "javac -d '$TMP/t3' src/Despacho.java src/Tarifa.java && $J -cp '$TMP/t3' Despacho"
espera "-sourcepath encuentra Tarifa.java sin nombrarlo" 'Tarifa.class' tema-3 sh -c "javac -d '$TMP/t3b' -sourcepath src src/Despacho.java && ls '$TMP/t3b'"
falla_con "classpath equivocado: la JVM no encontró la clase" 'java.lang.ClassNotFoundException: Despacho' tema-3 java -cp src Despacho
falla_con "dependencia borrada: NoClassDefFoundError" 'java.lang.NoClassDefFoundError: Tarifa' tema-3 sh -c "rm '$TMP/t3/Tarifa.class' && java -cp '$TMP/t3' Despacho"
falla_con "archivo con otro nombre que su clase pública" 'should be declared in a file named Arranque.java' tema-3 sh -c "cp src/Arranque.java '$TMP/arranque.java' && javac -d '$TMP/t3c' '$TMP/arranque.java'"

titulo "Tema 4 · Anatomía de main"
espera "main clásico recibe los argumentos en orden" 'args[1] = Medellín' tema-4 $J MainClasico.java Bogotá Medellín
espera "archivo compacto con main de instancia (JEP 512)" 'RF-000123 · frágil · 2500 g' tema-4 $J Etiqueta.java
espera "cotizador compacto" 'Tarifa: $11400' tema-4 $J CotizarEnvio.java Bogotá Medellín 2500
falla_con "cotizador sin argumentos: uso y código 64" 'Uso: java CotizarEnvio.java' tema-4 $J CotizarEnvio.java
espera "con dos main gana main(String[])" 'elegido: static main(String[] args)' tema-4 $J DosMain.java
espera "main de instancia: primero el constructor" '2. y después llama a main() sobre ese objeto' tema-4 $J SoloInstancia.java
espera "un archivo compacto importa java.base" 'tarifa: 11400.00' tema-4 $J ImportImplicito.java
espera "el archivo compacto es una clase final con main de instancia" 'final class Etiqueta' tema-4 sh -c "javac -d '$TMP/t4' Etiqueta.java && javap -p -cp '$TMP/t4' Etiqueta"
falla_con "sin método main (clase compilada): la JVM dice la firma que espera" 'public static void main(String[] args)' tema-4 sh -c "javac -d '$TMP/t4' SinMain.java && java -cp '$TMP/t4' SinMain"
falla_con "sin método main (desde el fuente)" "can't find main(String[]) or main() method in class: SinMain" tema-4 java SinMain.java
falla_con "main privado no cuenta" "can't find main(String[]) or main() method in class: MainPrivado" tema-4 java MainPrivado.java
falla_con "archivo compacto con --release 21" 'implicitly declared classes are not supported in -source 21' tema-4 javac --release 21 -d "$TMP/t4b" Etiqueta.java

titulo "Tema 5 · JShell y el lanzador de código fuente"
espera "JShell evalúa la tarifa" '$4 ==> 11400' tema-5 sh -c 'jshell -q < tarifa.jsh'
espera "JShell: método que espera a otro" 'cannot be invoked until method tarifa(int) is declared' tema-5 sh -c 'jshell -q < exploracion.jsh'
espera "JShell muestra el error sin terminar la sesión" 'incompatible types: java.lang.String cannot be converted to int' tema-5 sh -c 'jshell -q < errores.jsh'
espera "lanzador: un archivo" 'lanzado desde el fuente, sin .class en disco' tema-5 $J Saludo.java
espera "lanzador: varios archivos (JEP 458)" 'Guía RF-000123 · zona sur' tema-5/rastreo $J Rastreo.java RF-000123
espera "lanzador: desde otra carpeta" 'Guía RF-000124 · zona norte' tema-5 $J rastreo/Rastreo.java RF-000124
falla_con "guía inválida: código de salida 1" 'Guía inválida: 123' tema-5/rastreo $J Rastreo.java 123
espera "el lanzador no deja .class en disco" '0' tema-5 sh -c "$J rastreo/Rastreo.java RF-000123 > /dev/null && find . -name '*.class' | wc -l | tr -d ' '"
espera "script con shebang" '[RF-000123] RutaFlow' tema-5 sh -c 'chmod +x etiquetar && ./etiquetar RF-000123'
falla_con "falta un archivo del programa" 'cannot find symbol' tema-5 sh -c "mkdir -p '$TMP/t5' && cp rastreo/Rastreo.java rastreo/Guia.java '$TMP/t5/' && cd '$TMP/t5' && java Rastreo.java RF-000123"

titulo "Tema 6 · El IDE y el depurador"
espera "programa mínimo" 'paquetes cargados: 6' tema-6 $J Contador.java
espera "el programa con el fallo da 1000 g" 'volumétrico: 1000 g' tema-6 $J PesoVolumetrico.java
espera "el programa corregido da 1800 g" 'facturable:  1800 g' tema-6 $J PesoVolumetricoCorregido.java
espera "javac -g guarda los nombres de las variables" 'volumenCm3' tema-6 sh -c "javac -g -d '$TMP/t6' PesoVolumetrico.java && javap -l -c -cp '$TMP/t6' PesoVolumetrico"
# jdb lee las órdenes de una en una, con pausa, como las teclearía una persona.
sesion_jdb() { ( while IFS= read -r orden; do printf '%s\n' "$orden"; sleep 2; done < "$1" ) | jdb -classpath "$2" PesoVolumetrico; }
salida=$(cd "$RAIZ/tema-6" && sesion_jdb sesion.jdb "$TMP/t6" 2>&1)
if printf '%s\n' "$salida" | grep -F -q 'kilos = 1' && printf '%s\n' "$salida" | grep -F -q 'volumenCm3 * 1000 / 5000 = 1800'; then
    bien "jdb se detiene en la línea 8, muestra kilos = 1 y evalúa la corrección (1800)"
else
    mal "sesión de jdb" "$salida"
fi
salida=$(cd "$RAIZ/tema-6" && javac -g:none -d "$TMP/t6sin" PesoVolumetrico.java && sesion_jdb sin-g.jdb "$TMP/t6sin" 2>&1)
if printf '%s\n' "$salida" | grep -F -q 'Local variable information not available'; then bien "sin -g el depurador no ve las variables"; else mal "jdb sin -g" "$salida"; fi

titulo "Tema 7 · Primer build con el wrapper de Gradle"
espera "el build está escrito en Kotlin DSL con toolchain y catálogo" 'ok' . sh -c 'grep -q "JavaLanguageVersion.of" build.gradle.kts && grep -q "rutaflow-nucleo" settings.gradle.kts && grep -q "^java = \"25\"" gradle/libs.versions.toml && test -f gradle/wrapper/gradle-wrapper.jar && echo ok'
if gradle_disponible; then
    espera "gradle test: 3 pruebas pasan" 'BUILD SUCCESSFUL' . $GRADLE --console=plain test
    espera "gradle run cotiza un envío" 'Tarifa: $11400' . $GRADLE --console=plain -q run --args="Bogotá Medellín 2500"
    espera "gradle build deja el JAR" 'rutaflow-nucleo-0.1.0.jar' . sh -c "$GRADLE --console=plain -q build && ls build/libs"
    espera "el JAR se ejecuta con java -jar" 'Tarifa: $9600' . $J -jar build/libs/rutaflow-nucleo-0.1.0.jar Cali Pasto 1001
    espera "las clases del build son de Java 25 (formato 69)" 'major version: 69' . javap -v -cp build/classes/java/main rutaflow.nucleo.Tarifa
fi

resultado
