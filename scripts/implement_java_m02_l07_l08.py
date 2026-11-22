#!/usr/bin/env python3
from pathlib import Path
import stat
ROOT=Path('/Users/nicolasruiz/Documents/GitHub/Academia_Floci')
BASE=ROOT/'docs/cursos/java-desde-cero'
def w(p,c,exe=False):
    p=Path(p); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(c,encoding='utf-8')
    if exe: p.chmod(p.stat().st_mode|stat.S_IXUSR|stat.S_IXGRP|stat.S_IXOTH)

def lab(slug, files, verify, readme, ficha):
    labd=BASE/'labs'/slug
    for rel,content in files.items(): w(labd/rel,content)
    w(labd/'verify.sh',verify,exe=True)
    w(labd/'README.md',readme)
    w(BASE/'fichas'/f'{slug}.md',ficha)

lab('m02-l07-string-stringbuilder-stringbuffer',{
'src/StringDemo.java':'''public class StringDemo {
  public static void main(String[] args) {
    String a = "hola";
    String b = a + " mundo";
    StringBuilder sb = new StringBuilder();
    sb.append("java").append("-").append(21);
    StringBuffer sbf = new StringBuffer();
    sbf.append("seguro");
    System.out.println(b);
    System.out.println(sb.toString());
    System.out.println(sbf.toString());
    System.out.println(a == "hola");
  }
}
'''},r'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/StringDemo.java
OUT="$(java -cp out StringDemo)"
echo "$OUT" | grep -q "hola mundo"
echo "$OUT" | grep -q "java-21"
echo "$OUT" | grep -q "seguro"
echo "RESULTADO: OK"
''','''# Lab M02-L07 — String, StringBuilder, StringBuffer

## Qué se construyó
Ejemplos mínimos de inmutabilidad de `String`, construcción mutable con `StringBuilder` y uso básico de `StringBuffer`.

## Cómo verificar
```bash
./verify.sh
```

## Output esperado
Incluye `hola mundo`, `java-21`, `seguro` y `RESULTADO: OK`.
''','''## FICHA DE TEMA: String, StringBuilder, StringBuffer

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 2, Lección 7.

### 2. PRERREQUISITOS
- Tipos primitivos y variables.
- Compilar/ejecutar Java.

### 3. OBJETIVO DE APRENDIZAJE
**Distinguir** `String`, `StringBuilder` y `StringBuffer` construyendo ejemplos pequeños, observando inmutabilidad/mutabilidad y verificando salidas.

### 4. ANALOGÍA VISUAL
**Escena:** `String` es una etiqueta impresa: para cambiarla, imprimes otra. `StringBuilder` es una pizarra borrable personal; `StringBuffer` es una pizarra compartida con candado.  
**Texto alternativo:** String crea nuevos objetos; StringBuilder muta contenido; StringBuffer sincroniza acceso.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  S[String inmutable] --> S2[nueva instancia al "modificar"]
  B[StringBuilder mutable] --> B2[append modifica buffer]
  F[StringBuffer mutable+synchronized] --> F2[seguro en acceso concurrente simple]
```
**Texto alternativo:** Comparación de mutabilidad y sincronización.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** `String` es inmutable. `StringBuilder` es mutable y no sincronizado. `StringBuffer` es mutable y sincronizado.
- **Para qué sirve:** Elegir según mutabilidad, rendimiento y concurrencia.
- **Cuándo NO usarlo:** No usar concatenación en bucles grandes con `String`; no usar `StringBuffer` por defecto si no hay contención concurrente.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `src/StringDemo.java`.
2. Crear `String a = "hola"` y `b = a + " mundo"`.
3. Usar `StringBuilder` con `append`.
4. Usar `StringBuffer` con `append`.
5. Imprimir resultados y verificar con script.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class StringDemo {
  public static void main(String[] args) {
    String a = "hola";
    String b = a + " mundo";
    StringBuilder sb = new StringBuilder();
    sb.append("java").append("-").append(21);
    StringBuffer sbf = new StringBuffer();
    sbf.append("seguro");
    System.out.println(b);
    System.out.println(sb.toString());
    System.out.println(sbf.toString());
    System.out.println(a == "hola");
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `a + " mundo"` crea un nuevo `String`; `a` no cambia.
- `StringBuilder.append(...)` modifica el mismo buffer.
- `StringBuffer` ofrece API similar pero métodos sincronizados.
- `a == "hola"` puede ser `true` por interning, pero comparar contenido debe hacerse con `equals`.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/StringDemo.java
java -cp out StringDemo
./verify.sh
```
Output esperado:
```text
hola mundo
java-21
seguro
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` compila, ejecuta y valida las salidas clave.

### 12. MODIFICACIÓN GUIADA
- Cambio: construye un string en un bucle con `+=` y otro con `StringBuilder`.
- Hipótesis: `StringBuilder` escala mejor en muchas iteraciones.
- Resultado observado: diferencia de costo por inmutabilidad.

### 13. ERROR COMÚN
- **Síntoma:** comparación de strings falla.
- **Causa:** usar `==` en vez de `equals`.
- **Diagnóstico visual:** imprimir ambos valores y resultado de comparación.
- **Corrección:** usar `a.equals(b)`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Cuándo usar `StringBuilder` en vez de `String`?
- **Respuesta modelo:** Cuando construyes texto dinámicamente en múltiples pasos, especialmente en bucles, porque evita crear muchos objetos intermedios.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** concatenar strings en bucles grandes con `+`.
- **Cómo se ve:** degradación de rendimiento y GC.
- **Alternativa:** `StringBuilder` local.
''')

lab('m02-l08-manipulacion-de-strings-desde-cero',{
'src/StringLab.java':'''public class StringLab {
  static String normalizar(String s){
    return s.trim().toLowerCase();
  }
  static boolean esEmailSimple(String s){
    String n = normalizar(s);
    int at = n.indexOf('@');
    int dot = n.lastIndexOf('.');
    return at > 0 && dot > at + 1 && dot < n.length() - 1;
  }
  static String slug(String s){
    return normalizar(s).replaceAll("[^a-z0-9]+","-").replaceAll("^-|-$","");
  }
  public static void main(String[] args){
    System.out.println(normalizar("  Hola Mundo  "));
    System.out.println(esEmailSimple(" USER@Example.com "));
    System.out.println(esEmailSimple("malo@com"));
    System.out.println(slug(" Hola, Java 21! "));
  }
}
'''},r'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/StringLab.java
OUT="$(java -cp out StringLab)"
echo "$OUT" | grep -q "hola mundo"
echo "$OUT" | grep -q "true"
echo "$OUT" | grep -q "false"
echo "$OUT" | grep -q "hola-java-21"
echo "RESULTADO: OK"
''','''# Lab M02-L08 — Manipulación de strings desde cero

## Qué se construyó
Utilidades de normalización, validación simple de email y generación de slug.

## Cómo verificar
```bash
./verify.sh
```
''','''## FICHA DE TEMA: Construcción guiada: manipulación de strings desde cero

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 2, Lección 8.

### 2. PRERREQUISITOS
- String/StringBuilder.
- Métodos y condicionales básicos.

### 3. OBJETIVO DE APRENDIZAJE
**Construir** utilidades de manipulación de strings desde cero (normalizar, validar, slugificar) con verificación automática.

### 4. ANALOGÍA VISUAL
**Escena:** Una mesa de edición: recortar espacios, pasar a minúsculas, revisar forma y convertir a etiqueta limpia.  
**Texto alternativo:** Entrada de texto pasa por normalización, validación y transformación.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  I[Input] --> N[normalizar trim+lower]
  N --> V[validar email simple]
  N --> S[slug regex]
  V --> O[true/false]
  S --> O2[slug limpio]
```
**Texto alternativo:** El texto se transforma en salidas observables.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Manipulación de strings es transformar/validar texto con reglas explícitas.
- **Para qué sirve:** Limpieza de entrada, validaciones básicas, generación de identificadores legibles.
- **Cuándo NO usarlo:** No validar emails complejos con regex simplista en producción crítica; usar librerías/estándares adecuados.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `StringLab.java`.
2. Implementar `normalizar` con `trim` y `toLowerCase`.
3. Implementar `esEmailSimple` con checks de `@` y `.`.
4. Implementar `slug` con regex.
5. Probar en `main` y verificar con script.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class StringLab {
  static String normalizar(String s){
    return s.trim().toLowerCase();
  }
  static boolean esEmailSimple(String s){
    String n = normalizar(s);
    int at = n.indexOf('@');
    int dot = n.lastIndexOf('.');
    return at > 0 && dot > at + 1 && dot < n.length() - 1;
  }
  static String slug(String s){
    return normalizar(s).replaceAll("[^a-z0-9]+","-").replaceAll("^-|-$","");
  }
  public static void main(String[] args){
    System.out.println(normalizar("  Hola Mundo  "));
    System.out.println(esEmailSimple(" USER@Example.com "));
    System.out.println(esEmailSimple("malo@com"));
    System.out.println(slug(" Hola, Java 21! "));
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `trim().toLowerCase()`: normaliza espacios y mayúsculas.
- `indexOf('@')`/`lastIndexOf('.')`: validación simple de estructura.
- `replaceAll("[^a-z0-9]+","-")`: reemplaza no alfanumérico por guion.
- limpieza final de guiones bordes: evita `-hola-`.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/StringLab.java
java -cp out StringLab
./verify.sh
```
Output esperado:
```text
hola mundo
true
false
hola-java-21
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida normalización, validación simple y slug.

### 12. MODIFICACIÓN GUIADA
- Cambio: agrega soporte para guiones bajos en slug.
- Hipótesis: deberás ajustar regex y casos.
- Resultado observado: reglas de normalización son decisiones de producto.

### 13. ERROR COMÚN
- **Síntoma:** slug con guiones dobles o bordes.
- **Causa:** regex sin normalización posterior.
- **Diagnóstico visual:** imprimir entrada intermedia.
- **Corrección:** colapsar separadores y recortar bordes.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Por qué no usar una regex gigante para validar todo email?
- **Respuesta modelo:** Porque el estándar de email es complejo; una regex simple puede rechazar válidos o aceptar inválidos. Para producción, combinar validación razonable con verificación por envío o librerías probadas.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** confiar en validación de string como seguridad completa.
- **Cómo se ve:** datos inválidos o ataques pasan por validaciones superficiales.
- **Alternativa:** validar formato, semántica y contexto; sanitizar según destino.
''')

print('ok')
