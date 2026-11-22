#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import stat, textwrap
ROOT=Path('/Users/nicolasruiz/Documents/GitHub/Academia_Floci')
BASE=ROOT/'docs/cursos/java-desde-cero'
def w(p,c,exe=False):
    p=Path(p); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(c,encoding='utf-8')
    if exe: p.chmod(p.stat().st_mode|stat.S_IXUSR|stat.S_IXGRP|stat.S_IXOTH)

# helper to create simple java lab
def java_lab(slug, title, files:dict, verify, readme, ficha):
    lab=BASE/'labs'/slug
    for rel,content in files.items(): w(lab/rel,content)
    w(lab/'verify.sh',verify,exe=True)
    w(lab/'README.md',readme)
    w(BASE/'fichas'/f'{slug}.md',ficha)

# M01 L03
java_lab('m01-l03-instalacion-jdk-21-y-java-home','Instalación JDK 21 y JAVA_HOME',{
'src/CheckJava.java':'''public class CheckJava {
  public static void main(String[] args) {
    String version = System.getProperty("java.version");
    String home = System.getProperty("java.home");
    System.out.println("JAVA_VERSION=" + version);
    System.out.println("JAVA_HOME=" + (home!=null && !home.isBlank()?"OK":"MISSING"));
  }
}
'''},
'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
command -v java >/dev/null || { echo "FALLA: java no está en PATH"; exit 1; }
command -v javac >/dev/null || { echo "FALLA: javac no está en PATH"; exit 1; }
mkdir -p out
javac -d out src/CheckJava.java
OUT="$(java -cp out CheckJava)"
echo "$OUT" | grep -q "JAVA_VERSION=" || { echo "FALLA: no reporta versión"; exit 1; }
echo "$OUT" | grep -q "JAVA_HOME=OK" || { echo "FALLA: java.home vacío"; exit 1; }
echo "RESULTADO: OK"
''',
'''# Lab M01-L03 — Instalación JDK 21 y JAVA_HOME

## Qué se construyó
Script de verificación de entorno Java usando un programa que lee `java.version` y `java.home`.

## Prerrequisitos
JDK instalado y en PATH.

## Cómo compilar
```bash
mkdir -p out && javac -d out src/CheckJava.java
```
## Cómo ejecutar
```bash
java -cp out CheckJava
```
## Output esperado
```text
JAVA_VERSION=<tu versión>
JAVA_HOME=OK
```
## Cómo verificar
```bash
./verify.sh
```
## Qué modificar para experimentar
Ejecuta con un JDK diferente en PATH y compara `JAVA_VERSION`.
## Error común
`javac: command not found`: instalaste JRE/runtime pero no JDK.
''',
r'''## FICHA DE TEMA: Instalación de JDK 21 (LTS) y configuración de JAVA_HOME

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 1, Lección 3.

### 2. PRERREQUISITOS
- Saber abrir terminal y editar variables de entorno básicas.
- Conocer diferencia conceptual JDK/JRE/JVM (M1L2).

### 3. OBJETIVO DE APRENDIZAJE
**Configurar** y **verificar** un entorno JDK funcional comprobando `java`, `javac` y `java.home` mediante un programa y script automatizado.

### 4. ANALOGÍA VISUAL
**Escena:** Antes de cocinar necesitas que la cocina tenga gas, cuchillos y horno conectados. JDK es el equipamiento; JAVA_HOME/PATH es la señalización que dice dónde está.  
**Texto alternativo:** Caja de herramientas JDK conectada por flechas PATH/JAVA_HOME a la terminal, que ejecuta java y javac.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  JDK[JDK instalado] --> PATH[PATH incluye bin]
  JDK --> HOME[JAVA_HOME apunta al JDK]
  PATH --> JAVA[java/javac disponibles]
  HOME --> TOOLS[Herramientas/IDEs encuentran JDK]
  JAVA --> OK[Compila y ejecuta]
```
**Texto alternativo:** El JDK instalado se expone por PATH y JAVA_HOME; la terminal puede compilar y ejecutar.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** JDK 21 LTS es la distribución de desarrollo Java de soporte largo. JAVA_HOME apunta al directorio del JDK; PATH permite invocar binarios.
- **Para qué sirve:** Garantiza compilación/ejecución reproducible y que herramientas (Maven/Gradle/IDE) encuentren el JDK correcto.
- **Cuándo NO usarlo:** No fijar JAVA_HOME globalmente si trabajas con múltiples JDKs sin un gestor (sdkman/jenv); no usar un JRE cuando necesitas compilar.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. **Crear lab**
   - Ruta: `modules/m01/labs/l03-instalacion-jdk-21-y-java-home/`
   - Comando: `mkdir -p src out`
   - Por qué: aislar verificación. Output: carpeta creada.
2. **Crear `src/CheckJava.java`**
   - Código: lee `System.getProperty("java.version")` y `java.home`.
   - Por qué: prueba real del runtime activo. Output: archivo creado.
3. **Compilar y ejecutar**
   - Comando: `javac -d out src/CheckJava.java && java -cp out CheckJava`
   - Por qué: confirma JDK + JVM. Output: `JAVA_VERSION=...` y `JAVA_HOME=OK`.
4. **Crear `verify.sh`**
   - Verifica comandos y salida. Output: `RESULTADO: OK`.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class CheckJava {
  public static void main(String[] args) {
    String version = System.getProperty("java.version");
    String home = System.getProperty("java.home");
    System.out.println("JAVA_VERSION=" + version);
    System.out.println("JAVA_HOME=" + (home!=null && !home.isBlank()?"OK":"MISSING"));
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `System.getProperty("java.version")`: versión del runtime que ejecuta el programa.
- `System.getProperty("java.home")`: ruta del runtime/JDK usado.
- Verificación `!home.isBlank()`: evita aceptar configuración vacía.

### 10. LABORATORIO PASO A PASO
```bash
javac -d out src/CheckJava.java
java -cp out CheckJava
./verify.sh
```
Output esperado:
```text
JAVA_VERSION=<versión>
JAVA_HOME=OK
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida `java/javac` en PATH, compila, ejecuta y confirma salida. Exit 0 = OK.

### 12. MODIFICACIÓN GUIADA
- Cambio: imprime también `System.getProperty("java.vendor")`.
- Hipótesis: verás el proveedor del JDK.
- Resultado observado: útil para diagnosticar diferencias entre entornos.

### 13. ERROR COMÚN
- **Síntoma:** `javac: command not found`.
- **Causa:** JRE instalado o PATH sin `bin` del JDK.
- **Diagnóstico visual:** `which java` apunta a runtime, `which javac` falla.
- **Corrección:** instalar JDK 21, exportar JAVA_HOME y PATH, reiniciar terminal.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Por qué `java -version` puede funcionar pero `javac` no?
- **Respuesta modelo:** Porque puede estar instalado solo el runtime/JRE o el PATH apunta a un runtime sin herramientas de desarrollo; `javac` pertenece al JDK.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** instalar varias versiones de Java sin control y sin verificar cuál usa el proyecto.
- **Cómo se ve:** compila local, falla en CI o al revés.
- **Alternativa:** fijar versión, documentarla, verificar con script y usar gestor de versiones.
''')

# M01 L04
java_lab('m01-l04-primer-programa-desde-cero-sin-ide','Primer programa Java desde cero (sin IDE)',{
'src/HolaRuta.java':'''public class HolaRuta {
  public static void main(String[] args) {
    String nombre = args.length > 0 ? args[0] : "mundo";
    System.out.println("Hola, " + nombre + "!");
  }
}
'''},
'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/HolaRuta.java
OUT1="$(java -cp out HolaRuta)"
OUT2="$(java -cp out HolaRuta Ada)"
[[ "$OUT1" == "Hola, mundo!" ]] || { echo "FALLA: $OUT1"; exit 1; }
[[ "$OUT2" == "Hola, Ada!" ]] || { echo "FALLA: $OUT2"; exit 1; }
echo "RESULTADO: OK"
''',
'''# Lab M01-L04 — Primer programa desde cero sin IDE

## Qué se construyó
Programa Java CLI que recibe argumento opcional y saluda.

## Cómo compilar
```bash
mkdir -p out && javac -d out src/HolaRuta.java
```
## Cómo ejecutar
```bash
java -cp out HolaRuta
java -cp out HolaRuta Ada
```
## Output esperado
```text
Hola, mundo!
Hola, Ada!
```
## Cómo verificar
```bash
./verify.sh
```
## Qué modificar para experimentar
Cambia el saludo por defecto o agrega validación de argumentos.
## Error común
Ejecutar `java HolaRuta.java` desde otra carpeta sin classpath/ruta correcta; usa `-cp out`.
''',
r'''## FICHA DE TEMA: Construcción guiada: primer programa Java desde cero (sin IDE)

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 1, Lección 4.

### 2. PRERREQUISITOS
- JDK instalado y `java/javac` funcionando.
- Saber crear archivos y ejecutar comandos en terminal.

### 3. OBJETIVO DE APRENDIZAJE
**Construir** un programa Java desde cero sin IDE, **compilarlo** y **ejecutarlo** con y sin argumentos, verificando la salida esperada.

### 4. ANALOGÍA VISUAL
**Escena:** Escribir una nota a mano, traducirla con un traductor oficial (javac) y leerla en voz alta con un lector (JVM).  
**Texto alternativo:** Archivo .java pasa a javac, genera .class y java lo ejecuta mostrando texto en terminal.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  A[src/HolaRuta.java] --> B[javac]
  B --> C[out/HolaRuta.class]
  C --> D[java -cp out HolaRuta Ada]
  D --> E["Hola, Ada!"]
```
**Texto alternativo:** El código fuente se compila y la JVM ejecuta el bytecode con un argumento.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Un programa Java mínimo con clase pública y método `main`.
- **Para qué sirve:** Entender el ciclo fuente→bytecode→ejecución sin depender de un IDE.
- **Cuándo NO usarlo:** No evitar el IDE siempre; úsalo cuando aporta productividad, pero aprende el ciclo base para diagnosticar problemas.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `src/HolaRuta.java` con clase y `main`.
2. Leer `args`: si hay argumento usarlo, si no usar `mundo`.
3. Imprimir con `System.out.println`.
4. Compilar: `javac -d out src/HolaRuta.java`.
5. Ejecutar: `java -cp out HolaRuta` y `java -cp out HolaRuta Ada`.
6. Crear `verify.sh` comparando ambas salidas.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class HolaRuta {
  public static void main(String[] args) {
    String nombre = args.length > 0 ? args[0] : "mundo";
    System.out.println("Hola, " + nombre + "!");
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `args.length > 0 ? args[0] : "mundo"`: usa argumento o valor por defecto.
- `System.out.println(...)`: salida observable para humanos y scripts.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/HolaRuta.java
java -cp out HolaRuta
java -cp out HolaRuta Ada
./verify.sh
```
Output esperado:
```text
Hola, mundo!
Hola, Ada!
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` ejecuta ambos casos y compara salidas exactas.

### 12. MODIFICACIÓN GUIADA
- Cambio: soporta nombre y apellido: `args[0] + " " + args[1]`.
- Hipótesis: necesitarás validar longitud de args.
- Resultado observado: sin validación puede lanzar `ArrayIndexOutOfBoundsException`.

### 13. ERROR COMÚN
- **Síntoma:** `Could not find or load main class HolaRuta`.
- **Causa:** classpath incorrecto o no compilaste en `out`.
- **Diagnóstico visual:** `ls out` debe mostrar `HolaRuta.class`.
- **Corrección:** `java -cp out HolaRuta`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Qué hace el método `main` en Java?
- **Respuesta modelo:** Es el punto de entrada estándar que la JVM invoca para iniciar una aplicación Java; recibe argumentos de línea de comandos como `String[]`.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** depender del IDE para todo y no saber ejecutar/compilar manualmente.
- **Cómo se ve:** ante un fallo de build/CI, no se sabe diagnosticar.
- **Alternativa:** conocer el ciclo CLI básico aunque uses IDE.
''')

# M01 L05
java_lab('m01-l05-compilacion-javac-y-ejecucion-java','Compilación javac y ejecución java',{
'src/Saludo.java':'public class Saludo { public static String mensaje(){ return "compilado y ejecutado"; } }',
'src/Main.java':'public class Main { public static void main(String[] args){ System.out.println(Saludo.mensaje()); } }'
},
'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
rm -rf out && mkdir -p out
javac -d out src/Saludo.java src/Main.java
test -f out/Main.class && test -f out/Saludo.class || { echo "FALLA: faltan .class"; exit 1; }
OUT="$(java -cp out Main)"
[[ "$OUT" == "compilado y ejecutado" ]] || { echo "FALLA: $OUT"; exit 1; }
echo "RESULTADO: OK"
''',
'''# Lab M01-L05 — Compilación javac y ejecución java
## Qué se construyó
Compilación de dos clases y ejecución con classpath.
## Cómo verificar
```bash
./verify.sh
```
## Output esperado
```text
compilado y ejecutado
RESULTADO: OK
```
''',
r'''## FICHA DE TEMA: Compilación con javac y ejecución con java

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 1, Lección 5.

### 2. PRERREQUISITOS
- Saber crear clases y método main.
- JDK en PATH.

### 3. OBJETIVO DE APRENDIZAJE
**Compilar** múltiples archivos Java con `javac` y **ejecutar** el programa con `java -cp`, verificando la generación de `.class`.

### 4. ANALOGÍA VISUAL
**Escena:** Dos piezas de un rompecabezas se fabrican por separado (compilan) y luego se ensamblan en la mesa (classpath) para usarlas.  
**Texto alternativo:** Saludo.java y Main.java se compilan a .class y se ejecutan juntos con classpath.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  S[src/Saludo.java] --> J[javac -d out]
  M[src/Main.java] --> J
  J --> C1[out/Saludo.class]
  J --> C2[out/Main.class]
  C1 --> R[java -cp out Main]
  C2 --> R
  R --> O[compilado y ejecutado]
```
**Texto alternativo:** javac genera dos clases; java carga ambas desde out.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** `javac` compila fuentes; `java` ejecuta bytecode cargando clases desde classpath.
- **Para qué sirve:** Entender dependencias entre clases y errores de compilación/ejecución.
- **Cuándo NO usarlo:** No compilar manualmente en proyectos grandes; usar Maven/Gradle, pero entender la base.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `src/Saludo.java` con método `mensaje()`.
2. Crear `src/Main.java` que llama `Saludo.mensaje()`.
3. Compilar: `javac -d out src/Saludo.java src/Main.java`.
4. Verificar `.class` generados.
5. Ejecutar: `java -cp out Main`.
6. Automatizar con `verify.sh`.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class Saludo { public static String mensaje(){ return "compilado y ejecutado"; } }
```
```java
public class Main { public static void main(String[] args){ System.out.println(Saludo.mensaje()); } }
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `javac -d out ...`: coloca bytecode en `out`.
- `java -cp out Main`: define classpath y clase principal.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/Saludo.java src/Main.java
java -cp out Main
./verify.sh
```
Output esperado:
```text
compilado y ejecutado
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` confirma `.class` y salida exacta.

### 12. MODIFICACIÓN GUIADA
- Cambio: renombra `mensaje()` a `texto()` solo en `Saludo`.
- Hipótesis: la compilación falla por símbolo no encontrado.
- Resultado observado: enseña dependencia de compilación.

### 13. ERROR COMÚN
- **Síntoma:** `NoClassDefFoundError`.
- **Causa:** clase compilada pero classpath incorrecto en ejecución.
- **Diagnóstico visual:** revisar ubicación de `.class` y `-cp`.
- **Corrección:** usar `java -cp out Main`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Diferencia entre `javac` y `java`?
- **Respuesta modelo:** `javac` compila código fuente a bytecode; `java` inicia la JVM para ejecutar bytecode.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** compilar “a ojo” y no limpiar `out`.
- **Cómo se ve:** clases viejas enmascaran errores.
- **Alternativa:** `rm -rf out && mkdir -p out` antes de compilar.
''')
print('m01 3-5')
