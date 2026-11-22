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

lab('m02-l03-operadores',{'src/OperadoresDemo.java':'''public class OperadoresDemo {
  public static void main(String[] args) {
    int a=10,b=3;
    System.out.println(a+b);
    System.out.println(a>b);
    System.out.println(a>5 && b<5);
    System.out.println(a & b);
  }
}
'''},
'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/OperadoresDemo.java
OUT="$(java -cp out OperadoresDemo)"
printf "%s" "$OUT" | grep -q "13"
printf "%s" "$OUT" | grep -q "true"
printf "%s" "$OUT" | grep -q "2"
echo "RESULTADO: OK"
''',
'''# Lab M02-L03 — Operadores
## Verificar
```bash
./verify.sh
```
''',
'''## FICHA DE TEMA: Operadores aritméticos, lógicos, relacionales, bit a bit

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 2, Lección 3.

### 2. PRERREQUISITOS
- Variables y tipos primitivos.

### 3. OBJETIVO DE APRENDIZAJE
**Aplicar** operadores aritméticos, relacionales, lógicos y bit a bit en Java, verificando resultados observables.

### 4. ANALOGÍA VISUAL
**Escena:** Una calculadora con cuatro modos: sumar/restar, comparar tamaños, combinar condiciones y operar interruptores binarios.  
**Texto alternativo:** Operadores producen números, booleanos o bits según el modo.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  A[Operandos] --> B[+ - * / %]
  A --> C[> < == !=]
  A --> D[&& || !]
  A --> E[& | ^ ~ << >>]
```
**Texto alternativo:** Distintos operadores transforman operandos en resultados.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Operadores son símbolos que ejecutan operaciones sobre valores.
- **Para qué sirve:** Calcular, comparar y combinar condiciones.
- **Cuándo NO usarlo:** No abusar de operadores bit a bit para lógica booleana normal; no escribir expresiones complejas sin paréntesis/claridad.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `OperadoresDemo.java`.
2. Declarar `a=10,b=3`.
3. Imprimir suma, comparación, condición lógica y AND bit a bit.
4. Compilar y ejecutar.
5. Verificar con `verify.sh`.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class OperadoresDemo {
  public static void main(String[] args) {
    int a=10,b=3;
    System.out.println(a+b);
    System.out.println(a>b);
    System.out.println(a>5 && b<5);
    System.out.println(a & b);
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `a+b` produce `13`.
- `a>b` produce `true`.
- `a>5 && b<5` evalúa ambas condiciones.
- `a & b` (1010 & 0011) produce `2`.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/OperadoresDemo.java
java -cp out OperadoresDemo
./verify.sh
```
Output esperado:
```text
13
true
true
2
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida salidas representativas.

### 12. MODIFICACIÓN GUIADA
- Cambio: cambia `&&` por `||` y ajusta condiciones.
- Hipótesis: el resultado lógico puede cambiar.
- Resultado observado: comprender cortocircuito y lógica booleana.

### 13. ERROR COMÚN
- **Síntoma:** resultado inesperado en división entera.
- **Causa:** `int/int` trunca decimales.
- **Diagnóstico visual:** imprimir operandos y tipo.
- **Corrección:** castear a `double`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Diferencia entre `&` y `&&` en booleanos?
- **Respuesta modelo:** `&&` es cortocircuito: no evalúa el segundo operando si el primero ya define el resultado. `&` evalúa ambos; en enteros también es AND bit a bit.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** expresiones densas sin paréntesis.
- **Cómo se ve:** bugs de precedencia.
- **Alternativa:** paréntesis y variables intermedias con nombres claros.
''')

lab('m02-l04-casting-implicito-explicito',{'src/CastingDemo.java':'''public class CastingDemo {
  public static void main(String[] args) {
    int i = 10;
    double d = i; // implícito
    double x = 9.7;
    int y = (int) x; // explícito
    System.out.println(d);
    System.out.println(y);
  }
}
'''},
'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/CastingDemo.java
OUT="$(java -cp out CastingDemo)"
echo "$OUT" | grep -q "10.0"
echo "$OUT" | grep -q "^9$"
echo "RESULTADO: OK"
''',
'''# Lab M02-L04 — Casting
## Verificar
```bash
./verify.sh
```
''',
'''## FICHA DE TEMA: Casting implícito y explícito

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 2, Lección 4.

### 2. PRERREQUISITOS
- Tipos primitivos.

### 3. OBJETIVO DE APRENDIZAJE
**Aplicar** casting implícito y explícito en Java, identificando pérdida de información en conversiones narrowing.

### 4. ANALOGÍA VISUAL
**Escena:** Verter agua de un vaso pequeño a uno grande (cabe bien, implícito) vs verter de un balde grande a un vaso pequeño (se derrama, explícito y con pérdida).  
**Texto alternativo:** Widening es seguro; narrowing requiere cast y puede perder datos.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  I[int 10] -->|widening implícito| D[double 10.0]
  X[double 9.7] -->|narrowing explícito (int)| Y[int 9]
```
**Texto alternativo:** El cast explícito de 9.7 a int trunca la parte decimal.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Casting es convertir un valor de un tipo a otro. Implícito cuando es seguro; explícito cuando puede perder información.
- **Para qué sirve:** Controlar conversiones entre tipos numéricos.
- **Cuándo NO usarlo:** No hacer narrowing sin entender la pérdida; no usar cast para ocultar un diseño de tipos incorrecto.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `CastingDemo.java`.
2. Asignar `int` a `double` (implícito).
3. Convertir `double 9.7` a `int` con `(int)`.
4. Imprimir resultados y verificar.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class CastingDemo {
  public static void main(String[] args) {
    int i = 10;
    double d = i; // implícito
    double x = 9.7;
    int y = (int) x; // explícito
    System.out.println(d);
    System.out.println(y);
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `double d = i;`: widening automático.
- `(int) x`: narrowing explícito; trunca, no redondea.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/CastingDemo.java
java -cp out CastingDemo
./verify.sh
```
Output esperado:
```text
10.0
9
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida conversión y truncamiento.

### 12. MODIFICACIÓN GUIADA
- Cambio: usa `Math.round(x)`.
- Hipótesis: obtendrás 10 en vez de 9.
- Resultado observado: redondeo vs truncamiento son decisiones distintas.

### 13. ERROR COMÚN
- **Síntoma:** pérdida silenciosa de decimales.
- **Causa:** cast narrowing sin considerar reglas.
- **Diagnóstico visual:** comparar valor antes/después.
- **Corrección:** elegir redondeo o tipo adecuado.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Qué pasa al castear `9.7` a `int` en Java?
- **Respuesta modelo:** Se trunca la parte decimal, resultando `9`. No redondea.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** hacer casts para “silenciar” incompatibilidades.
- **Cómo se ve:** bugs de precisión/datos.
- **Alternativa:** modelar tipos correctamente desde el inicio.
''')
print('ok')
