#!/usr/bin/env python3
from pathlib import Path
import stat, textwrap
ROOT=Path('/Users/nicolasruiz/Documents/GitHub/Academia_Floci')
BASE=ROOT/'docs/cursos/java-desde-cero'
def w(p,c,exe=False):
    p=Path(p); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(c,encoding='utf-8')
    if exe: p.chmod(p.stat().st_mode|stat.S_IXUSR|stat.S_IXGRP|stat.S_IXOTH)

def lab(slug, files, verify, readme, ficha):
    lab=BASE/'labs'/slug
    for rel,content in files.items(): w(lab/rel,content)
    w(lab/'verify.sh',verify,exe=True)
    w(lab/'README.md',readme)
    w(BASE/'fichas'/f'{slug}.md',ficha)

lab('m02-l01-tipos-primitivos', {
'src/TiposDemo.java': '''public class TiposDemo {
  public static void main(String[] args) {
    int edad = 30;
    long poblacion = 8_000_000_000L;
    double precio = 19.99;
    boolean activo = true;
    char inicial = 'J';
    System.out.println("edad=" + edad);
    System.out.println("poblacion=" + poblacion);
    System.out.println("precio=" + precio);
    System.out.println("activo=" + activo);
    System.out.println("inicial=" + inicial);
  }
}
'''},
'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/TiposDemo.java
OUT="$(java -cp out TiposDemo)"
echo "$OUT" | grep -q "edad=30"
echo "$OUT" | grep -q "poblacion=8000000000"
echo "$OUT" | grep -q "activo=true"
echo "$OUT" | grep -q "inicial=J"
echo "RESULTADO: OK"
''',
'''# Lab M02-L01 — Tipos primitivos
## Qué se construyó
Demo de `int`, `long`, `double`, `boolean`, `char`.
## Cómo verificar
```bash
./verify.sh
```
## Output esperado
Valores de cada tipo y `RESULTADO: OK`.
''',
'''## FICHA DE TEMA: Tipos primitivos: int, long, double, boolean, char

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 2, Lección 1.

### 2. PRERREQUISITOS
- Módulo 1 completado.
- Saber compilar y ejecutar Java.

### 3. OBJETIVO DE APRENDIZAJE
**Declarar** y **usar** los tipos primitivos básicos de Java, imprimiendo sus valores y verificando el comportamiento con un script.

### 4. ANALOGÍA VISUAL
**Escena:** Cajas etiquetadas de distintos tamaños: una pequeña para enteros, una grande para números largos, una con decimales, un interruptor on/off y una ficha con una letra.  
**Texto alternativo:** Cinco contenedores representan int, long, double, boolean y char, cada uno con un valor de ejemplo.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  P[Tipos primitivos] --> I[int edad=30]
  P --> L[long poblacion=8_000_000_000L]
  P --> D[double precio=19.99]
  P --> B[boolean activo=true]
  P --> C[char inicial='J']
```
**Texto alternativo:** Los cinco tipos primitivos almacenan valores simples sin objetos.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Tipos primitivos son valores básicos incorporados en Java: enteros, decimales, booleanos y caracteres.
- **Para qué sirve:** Representar datos simples con eficiencia y semántica clara.
- **Cuándo NO usarlo:** No usar primitivos cuando necesitas nullabilidad, colecciones genéricas o comportamiento de objeto; usar wrappers o tipos adecuados.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `src/TiposDemo.java`.
2. Declarar una variable por tipo primitivo.
3. Usar sufijo `L` para long y literal char con comillas simples.
4. Imprimir cada valor con etiqueta.
5. Compilar y ejecutar.
6. Crear `verify.sh` que valide salidas clave.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class TiposDemo {
  public static void main(String[] args) {
    int edad = 30;
    long poblacion = 8_000_000_000L;
    double precio = 19.99;
    boolean activo = true;
    char inicial = 'J';
    System.out.println("edad=" + edad);
    System.out.println("poblacion=" + poblacion);
    System.out.println("precio=" + precio);
    System.out.println("activo=" + activo);
    System.out.println("inicial=" + inicial);
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `long poblacion = 8_000_000_000L;`: `L` indica literal long; sin él, el literal entero puede desbordar int.
- `char inicial = 'J';`: char usa comillas simples y representa un carácter UTF-16.
- `boolean activo = true;`: solo `true` o `false`.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/TiposDemo.java
java -cp out TiposDemo
./verify.sh
```
Output esperado:
```text
edad=30
poblacion=8000000000
precio=19.99
activo=true
inicial=J
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` compila, ejecuta y valida valores representativos.

### 12. MODIFICACIÓN GUIADA
- Cambio: quita la `L` de `8_000_000_000L`.
- Hipótesis: falla la compilación por literal fuera de rango int.
- Resultado observado: el compilador reporta “integer number too large”.

### 13. ERROR COMÚN
- **Síntoma:** `integer number too large`.
- **Causa:** literal entero grande sin sufijo `L`.
- **Diagnóstico visual:** revisar literal numérico y tipo destino.
- **Corrección:** agregar `L`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Cuándo usarías `int` vs `long`?
- **Respuesta modelo:** `int` para contadores y valores dentro de su rango; `long` cuando hay riesgo de desbordar int, como timestamps, IDs grandes o poblaciones. Elegir por rango y claridad.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** usar `double` para dinero sin considerar precisión decimal.
- **Cómo se ve:** errores de redondeo en cálculos financieros.
- **Alternativa:** `BigDecimal` o enteros en centavos según caso.
''')

lab('m02-l02-variables-constantes-scope', {
'src/ScopeDemo.java': '''public class ScopeDemo {
  static final double IVA = 0.19;
  public static void main(String[] args) {
    double subtotal = 100;
    double total = subtotal * (1 + IVA);
    if (total > 100) {
      String etiqueta = "caro";
      System.out.println(etiqueta);
    }
    System.out.println(total);
  }
}
'''},
'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/ScopeDemo.java
OUT="$(java -cp out ScopeDemo)"
echo "$OUT" | grep -q "caro"
echo "$OUT" | grep -q "119.0"
echo "RESULTADO: OK"
''',
'''# Lab M02-L02 — Variables, constantes, scope
## Qué se construyó
Constante `final`, variable local y scope de bloque.
## Cómo verificar
```bash
./verify.sh
```
''',
'''## FICHA DE TEMA: Variables, constantes (final), scope

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 2, Lección 2.

### 2. PRERREQUISITOS
- Tipos primitivos.
- Compilar/ejecutar Java.

### 3. OBJETIVO DE APRENDIZAJE
**Usar** variables locales, constantes `final` y comprender el scope de bloque, verificando el comportamiento por compilación y ejecución.

### 4. ANALOGÍA VISUAL
**Escena:** Una pizarra general del aula (constante/variable de clase) y notas adhesivas dentro de una caja (variables de bloque) que no existen fuera de la caja.  
**Texto alternativo:** IVA visible en toda la clase; etiqueta existe solo dentro del bloque if.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart TB
  C[Clase ScopeDemo] --> IVA[static final IVA]
  C --> M[main]
  M --> S[subtotal,total]
  M --> IF[bloque if]
  IF --> E[etiqueta solo aquí]
```
**Texto alternativo:** Las variables tienen distintos alcances según dónde se declaran.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Variable almacena un valor mutable; `final` impide reasignación; scope define dónde el nombre es visible.
- **Para qué sirve:** Evita errores, hace explícitas constantes y limita vida de variables.
- **Cuándo NO usarlo:** No hacer todo global/static; no usar `final` creyendo que hace inmutable un objeto mutable interno.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `ScopeDemo.java`.
2. Declarar `static final double IVA = 0.19;`.
3. En `main`, calcular `total`.
4. Dentro de `if`, declarar `etiqueta` e imprimirla.
5. Imprimir `total` fuera del if.
6. Verificar con `verify.sh`.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class ScopeDemo {
  static final double IVA = 0.19;
  public static void main(String[] args) {
    double subtotal = 100;
    double total = subtotal * (1 + IVA);
    if (total > 100) {
      String etiqueta = "caro";
      System.out.println(etiqueta);
    }
    System.out.println(total);
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `static final double IVA`: constante de clase.
- `String etiqueta` dentro del `if`: scope de bloque; no accesible fuera.
- `total` se calcula antes y se usa después.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/ScopeDemo.java
java -cp out ScopeDemo
./verify.sh
```
Output esperado:
```text
caro
119.0
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida salida. La modificación guiada valida scope por error de compilación.

### 12. MODIFICACIÓN GUIADA
- Cambio: intenta imprimir `etiqueta` fuera del `if`.
- Hipótesis: error de compilación “cannot find symbol”.
- Resultado observado: confirma límite de scope.

### 13. ERROR COMÚN
- **Síntoma:** `cannot find symbol` para una variable.
- **Causa:** se usa fuera de su scope.
- **Diagnóstico visual:** identificar llaves `{}` donde fue declarada.
- **Corrección:** declarar en scope adecuado o pasar valor.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿`final` hace inmutable un objeto?
- **Respuesta modelo:** No necesariamente. `final` impide reasignar la referencia; si el objeto es mutable, su estado interno puede cambiar.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** declarar todas las variables al inicio del método.
- **Cómo se ve:** scope innecesariamente amplio, difícil de leer.
- **Alternativa:** declarar cerca del primer uso.
''')
print('ok')
