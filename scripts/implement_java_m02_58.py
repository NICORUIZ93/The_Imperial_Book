#!/usr/bin/env python3
from pathlib import Path
import stat
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

lab('m02-l05-calculadora-de-consola-desde-cero',{
'src/Calculadora.java':'''public class Calculadora {
  public static int sumar(int a,int b){ return a+b; }
  public static int restar(int a,int b){ return a-b; }
  public static int multiplicar(int a,int b){ return a*b; }
  public static int dividir(int a,int b){
    if(b==0) throw new IllegalArgumentException("division por cero");
    return a/b;
  }
  public static void main(String[] args){
    if(args.length<3){ System.out.println("USO: op a b"); return; }
    String op=args[0]; int a=Integer.parseInt(args[1]); int b=Integer.parseInt(args[2]);
    int r=switch(op){
      case "sumar" -> sumar(a,b);
      case "restar" -> restar(a,b);
      case "mult" -> multiplicar(a,b);
      case "div" -> dividir(a,b);
      default -> throw new IllegalArgumentException("op invalida");
    };
    System.out.println(r);
  }
}
'''},
'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/Calculadora.java
[[ "$(java -cp out Calculadora sumar 2 3)" == "5" ]] || exit 1
[[ "$(java -cp out Calculadora restar 5 2)" == "3" ]] || exit 1
[[ "$(java -cp out Calculadora mult 4 3)" == "12" ]] || exit 1
[[ "$(java -cp out Calculadora div 8 2)" == "4" ]] || exit 1
echo "RESULTADO: OK"
''',
'''# Lab M02-L05 — Calculadora de consola desde cero
## Verificar
```bash
./verify.sh
```
''',
'''## FICHA DE TEMA: Construcción guiada: calculadora de consola desde cero

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 2, Lección 5.

### 2. PRERREQUISITOS
- Tipos primitivos, operadores, métodos básicos.

### 3. OBJETIVO DE APRENDIZAJE
**Construir** una calculadora CLI en Java desde cero, implementando operaciones y validaciones básicas, verificadas por script.

### 4. ANALOGÍA VISUAL
**Escena:** Una caja registradora con botones: sumar, restar, multiplicar, dividir. Cada botón ejecuta una operación clara.  
**Texto alternativo:** Entrada op,a,b pasa por un selector y produce resultado numérico.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  A[args: op a b] --> S{switch op}
  S -->|sumar| R[a+b]
  S -->|restar| R2[a-b]
  S -->|mult| R3[a*b]
  S -->|div| R4[a/b]
  R --> O[println]
```
**Texto alternativo:** La operación seleccionada determina el cálculo.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Una CLI simple que parsea argumentos y ejecuta operaciones.
- **Para qué sirve:** Practicar tipos, operadores, control de flujo, métodos y manejo de errores.
- **Cuándo NO usarlo:** No usar este enfoque sin validación/sanitización en entradas no confiables; para expresiones complejas usar parser dedicado.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `Calculadora.java`.
2. Implementar métodos `sumar/restar/multiplicar/dividir`.
3. En `main`, validar args y parsear enteros.
4. Usar `switch` por operación.
5. Manejar división por cero con `IllegalArgumentException`.
6. Verificar con `verify.sh`.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class Calculadora {
  public static int sumar(int a,int b){ return a+b; }
  public static int restar(int a,int b){ return a-b; }
  public static int multiplicar(int a,int b){ return a*b; }
  public static int dividir(int a,int b){
    if(b==0) throw new IllegalArgumentException("division por cero");
    return a/b;
  }
  public static void main(String[] args){
    if(args.length<3){ System.out.println("USO: op a b"); return; }
    String op=args[0]; int a=Integer.parseInt(args[1]); int b=Integer.parseInt(args[2]);
    int r=switch(op){
      case "sumar" -> sumar(a,b);
      case "restar" -> restar(a,b);
      case "mult" -> multiplicar(a,b);
      case "div" -> dividir(a,b);
      default -> throw new IllegalArgumentException("op invalida");
    };
    System.out.println(r);
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `Integer.parseInt`: convierte texto CLI a entero.
- `switch` expression: selecciona operación y retorna valor.
- Validación `b==0`: evita división inválida.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/Calculadora.java
java -cp out Calculadora sumar 2 3
./verify.sh
```
Output esperado:
```text
5
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` prueba las cuatro operaciones.

### 12. MODIFICACIÓN GUIADA
- Cambio: agrega operación `mod`.
- Hipótesis: deberás actualizar switch y verify.
- Resultado observado: diseño extensible por casos.

### 13. ERROR COMÚN
- **Síntoma:** `NumberFormatException`.
- **Causa:** argumentos no numéricos.
- **Diagnóstico visual:** imprimir args recibidos.
- **Corrección:** validar/atrapar parseo.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Por qué separar operaciones en métodos?
- **Respuesta modelo:** Mejora legibilidad, prueba y reutilización; `main` orquesta y los métodos encapsulan lógica.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** todo el cálculo dentro de `main`.
- **Cómo se ve:** código difícil de probar.
- **Alternativa:** métodos pequeños con responsabilidad clara.
''')

lab('m02-l06-wrappers-y-autoboxing',{'src/WrappersDemo.java':'''import java.util.*;
public class WrappersDemo {
  public static void main(String[] args){
    Integer a = 10; // autoboxing
    int b = a; // unboxing
    List<Integer> nums = new ArrayList<>();
    nums.add(1); nums.add(2);
    System.out.println(b);
    System.out.println(Integer.parseInt("42"));
    System.out.println(nums.size());
  }
}
'''},
'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/WrappersDemo.java
OUT="$(java -cp out WrappersDemo)"
echo "$OUT" | grep -q "10"
echo "$OUT" | grep -q "42"
echo "$OUT" | grep -q "2"
echo "RESULTADO: OK"
''',
'''# Lab M02-L06 — Wrappers y autoboxing
## Verificar
```bash
./verify.sh
```
''',
'''## FICHA DE TEMA: Wrappers: Integer, Double, Boolean, y autoboxing

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 2, Lección 6.

### 2. PRERREQUISITOS
- Primitivos y colecciones básicas.

### 3. OBJETIVO DE APRENDIZAJE
**Usar** wrappers y autoboxing/unboxing, identificando cuándo son necesarios y riesgos comunes (null).

### 4. ANALOGÍA VISUAL
**Escena:** Un número primitivo es una moneda suelta; un wrapper es la moneda dentro de una caja etiquetada que puede guardarse en estantes (colecciones).  
**Texto alternativo:** Autoboxing mete el primitivo en caja; unboxing lo saca.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  P[int 10] -->|autoboxing| W[Integer 10]
  W -->|unboxing| P2[int 10]
  W --> C[List<Integer>]
```
**Texto alternativo:** Wrappers permiten usar primitivos en colecciones genéricas.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Wrappers son clases objeto para primitivos. Autoboxing/unboxing convierte automáticamente.
- **Para qué sirve:** Colecciones genéricas, APIs que requieren objetos, utilidades (`parseInt`).
- **Cuándo NO usarlo:** No usar wrappers innecesariamente en bucles intensivos; cuidado con `null` al hacer unboxing.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `WrappersDemo.java`.
2. Autoboxing `Integer a = 10`.
3. Unboxing `int b = a`.
4. Usar `List<Integer>` y `Integer.parseInt`.
5. Verificar salida.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
import java.util.*;
public class WrappersDemo {
  public static void main(String[] args){
    Integer a = 10; // autoboxing
    int b = a; // unboxing
    List<Integer> nums = new ArrayList<>();
    nums.add(1); nums.add(2);
    System.out.println(b);
    System.out.println(Integer.parseInt("42"));
    System.out.println(nums.size());
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `Integer a = 10`: autoboxing.
- `int b = a`: unboxing.
- `List<Integer>`: genéricos requieren tipos objeto.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/WrappersDemo.java
java -cp out WrappersDemo
./verify.sh
```
Output esperado:
```text
10
42
2
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` confirma valores y tamaño de lista.

### 12. MODIFICACIÓN GUIADA
- Cambio: `Integer n = null; int x = n;`
- Hipótesis: `NullPointerException` en unboxing.
- Resultado observado: riesgo real de wrappers.

### 13. ERROR COMÚN
- **Síntoma:** `NullPointerException` al unboxear.
- **Causa:** wrapper nulo convertido a primitivo.
- **Diagnóstico visual:** rastrear origen del `Integer` nulo.
- **Corrección:** validar null o usar `OptionalInt`/diseño alternativo.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Por qué existe autoboxing y cuál es su costo?
- **Respuesta modelo:** Facilita interoperar primitivos con APIs de objetos/genéricos. Cuesta asignaciones/objetos y puede causar NPE en unboxing o overhead en loops.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** usar `Integer` en todas partes “por si acaso”.
- **Cómo se ve:** nulls inesperados y overhead.
- **Alternativa:** primitivos por defecto; wrappers cuando se necesiten.
''')
print('ok')
