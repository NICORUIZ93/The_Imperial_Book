#!/usr/bin/env python3
from pathlib import Path
import stat
ROOT=Path('/Users/nicolasruiz/Documents/GitHub/Academia_Floci')
BASE=ROOT/'docs/cursos/java-desde-cero'
def w(p,c,exe=False):
    p=Path(p); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(c,encoding='utf-8')
    if exe: p.chmod(p.stat().st_mode|stat.S_IXUSR|stat.S_IXGRP|stat.S_IXOTH)
def lab(slug, files, verify, readme, ficha):
    d=BASE/'labs'/slug
    for rel,content in files.items(): w(d/rel,content)
    w(d/'verify.sh',verify,exe=True); w(d/'README.md',readme); w(BASE/'fichas'/f'{slug}.md',ficha)

lab('m03-l01-if-else-switch-switch-expressions',{
'src/ControlFlow.java':'''public class ControlFlow {
  static String clasificar(int n){
    if(n<0) return "negativo";
    else if(n==0) return "cero";
    return "positivo";
  }
  static String dia(int n){
    return switch(n){
      case 1 -> "lunes";
      case 2 -> "martes";
      default -> "otro";
    };
  }
  public static void main(String[] args){
    System.out.println(clasificar(-1));
    System.out.println(clasificar(0));
    System.out.println(clasificar(5));
    System.out.println(dia(1));
    System.out.println(dia(9));
  }
}
'''},r'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/ControlFlow.java
OUT="$(java -cp out ControlFlow)"
echo "$OUT" | grep -q "negativo"
echo "$OUT" | grep -q "cero"
echo "$OUT" | grep -q "positivo"
echo "$OUT" | grep -q "lunes"
echo "$OUT" | grep -q "otro"
echo "RESULTADO: OK"
''','''# Lab M03-L01 — if/else, switch, switch expressions
```bash
./verify.sh
```
''','''## FICHA DE TEMA: if/else, switch, switch expressions

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 3, Lección 1.

### 2. PRERREQUISITOS
- Variables, operadores y tipos básicos.

### 3. OBJETIVO DE APRENDIZAJE
**Implementar** decisiones con `if/else` y `switch` expressions, verificando salidas para múltiples casos.

### 4. ANALOGÍA VISUAL
**Escena:** Semáforo y selector de carriles: `if/else` evalúa condiciones en orden; `switch` selecciona un caso por valor.  
**Texto alternativo:** El flujo entra, evalúa condición/caso y sale por una rama observable.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart TD
  A[n] --> B{if/else}
  B -->|<0| N[negativo]
  B -->|==0| Z[cero]
  B -->|>0| P[positivo]
  A --> C{switch}
  C -->|1| L[lunes]
  C -->|default| O[otro]
```
**Texto alternativo:** if/else clasifica por rangos; switch por casos discretos.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Estructuras de control condicional.
- **Para qué sirve:** Ejecutar diferentes caminos según estado/entrada.
- **Cuándo NO usarlo:** No usar switch gigante cuando un polimorfismo/mapa de estrategias es más claro; no anidar ifs profundos sin refactor.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crea `ControlFlow.java`.
2. Implementa `clasificar` con `if/else`.
3. Implementa `dia` con switch expression.
4. En `main`, imprime casos representativos.
5. Verifica con script.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class ControlFlow {
  static String clasificar(int n){
    if(n<0) return "negativo";
    else if(n==0) return "cero";
    return "positivo";
  }
  static String dia(int n){
    return switch(n){
      case 1 -> "lunes";
      case 2 -> "martes";
      default -> "otro";
    };
  }
  public static void main(String[] args){
    System.out.println(clasificar(-1));
    System.out.println(clasificar(0));
    System.out.println(clasificar(5));
    System.out.println(dia(1));
    System.out.println(dia(9));
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `if/else if/else`: orden importa; primera condición verdadera gana.
- `switch` expression con `->`: retorna valor, sin fall-through accidental.
- `default`: cubre casos no contemplados.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out && javac -d out src/ControlFlow.java
java -cp out ControlFlow
./verify.sh
```
Output esperado:
```text
negativo
cero
positivo
lunes
otro
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida las cinco salidas.

### 12. MODIFICACIÓN GUIADA
- Cambio: agrega `case 2 -> "martes"` y pruébalo.
- Hipótesis: salida para 2 cambia a martes.
- Resultado observado: switch expression facilita mapeos discretos.

### 13. ERROR COMÚN
- **Síntoma:** caso inesperado en switch antiguo.
- **Causa:** fall-through por falta de `break`.
- **Diagnóstico visual:** trazar ejecución caso por caso.
- **Corrección:** usar switch expression `->` o `break`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Cuándo prefieres switch expression sobre if/else?
- **Respuesta modelo:** Cuando mapeas un valor discreto a resultados claros; mejora legibilidad y evita fall-through. Para rangos o lógica compleja, if/else o estrategias.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** ifs anidados profundos.
- **Cómo se ve:** difícil de leer y probar.
- **Alternativa:** guard clauses, switch, o extraer métodos.
''')

lab('m03-l02-bucles',{
'src/BuclesDemo.java':'''public class BuclesDemo {
  public static void main(String[] args){
    int sumFor=0; for(int i=1;i<=5;i++) sumFor+=i;
    int sumWhile=0; int j=1; while(j<=5){ sumWhile+=j; j++; }
    int sumDo=0; int k=1; do{ sumDo+=k; k++; }while(k<=5);
    System.out.println(sumFor);
    System.out.println(sumWhile);
    System.out.println(sumDo);
  }
}
'''},r'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/BuclesDemo.java
OUT="$(java -cp out BuclesDemo)"
[ "$(echo "$OUT" | sed -n '1p')" = "15" ]
[ "$(echo "$OUT" | sed -n '2p')" = "15" ]
[ "$(echo "$OUT" | sed -n '3p')" = "15" ]
echo "RESULTADO: OK"
''','''# Lab M03-L02 — Bucles
```bash
./verify.sh
```
''','''## FICHA DE TEMA: for, while, do-while, for-each

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 3, Lección 2.

### 2. PRERREQUISITOS
- Condicionales y operadores.

### 3. OBJETIVO DE APRENDIZAJE
**Implementar** bucles `for`, `while` y `do-while` para resolver el mismo problema y verificar equivalencia de resultados.

### 4. ANALOGÍA VISUAL
**Escena:** Tres rutas para dar 5 vueltas a una pista: contador fijo (for), mientras haya vueltas (while), y hacer una y luego repetir (do-while).  
**Texto alternativo:** Diferentes estructuras de bucle pueden producir el mismo resultado.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  I[i=1,sum=0] --> F{condición}
  F -->|true| B[sum+=i; i++]
  B --> F
  F -->|false| O[sum=15]
```
**Texto alternativo:** Un bucle repite mientras la condición sea verdadera.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Estructuras de repetición.
- **Para qué sirve:** Ejecutar lógica repetitiva controlada.
- **Cuándo NO usarlo:** No usar bucle cuando una operación de stream/colección es más clara; evitar bucles infinitos sin condición de salida.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `BuclesDemo.java`.
2. Sumar 1..5 con `for`.
3. Repetir con `while`.
4. Repetir con `do-while`.
5. Imprimir los tres resultados y verificar.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class BuclesDemo {
  public static void main(String[] args){
    int sumFor=0; for(int i=1;i<=5;i++) sumFor+=i;
    int sumWhile=0; int j=1; while(j<=5){ sumWhile+=j; j++; }
    int sumDo=0; int k=1; do{ sumDo+=k; k++; }while(k<=5);
    System.out.println(sumFor);
    System.out.println(sumWhile);
    System.out.println(sumDo);
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `for(init;cond;inc)`: compacto para contadores.
- `while(cond)`: evalúa antes de entrar.
- `do{...}while(cond)`: ejecuta al menos una vez.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out && javac -d out src/BuclesDemo.java
java -cp out BuclesDemo
./verify.sh
```
Output esperado:
```text
15
15
15
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` compara las tres líneas con `15`.

### 12. MODIFICACIÓN GUIADA
- Cambio: cambia límite a 10.
- Hipótesis: los tres resultados serán 55.
- Resultado observado: misma lógica, distinto parámetro.

### 13. ERROR COMÚN
- **Síntoma:** bucle infinito.
- **Causa:** condición nunca se vuelve falsa o contador no avanza.
- **Diagnóstico visual:** imprimir contador en cada iteración.
- **Corrección:** asegurar progreso hacia la condición de salida.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Diferencia entre `while` y `do-while`?
- **Respuesta modelo:** `while` puede no ejecutar ninguna vez; `do-while` ejecuta el cuerpo al menos una vez antes de evaluar la condición.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** modificar la variable de control de forma confusa dentro del for.
- **Cómo se ve:** difícil razonar, bugs sutiles.
- **Alternativa:** mantener control claro o usar while.
''')

lab('m03-l03-break-continue-return',{
'src/BreakContinue.java':'''public class BreakContinue {
  public static void main(String[] args){
    int firstEven=-1;
    int sumOdd=0;
    for(int i=1;i<=6;i++){
      if(i%2==0){ firstEven=i; break; }
    }
    for(int i=1;i<=6;i++){
      if(i%2==0) continue;
      sumOdd+=i;
    }
    System.out.println(firstEven);
    System.out.println(sumOdd);
  }
}
'''},r'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/BreakContinue.java
OUT="$(java -cp out BreakContinue)"
[ "$(echo "$OUT" | sed -n '1p')" = "2" ]
[ "$(echo "$OUT" | sed -n '2p')" = "9" ]
echo "RESULTADO: OK"
''','''# Lab M03-L03 — break, continue, return
```bash
./verify.sh
```
''','''## FICHA DE TEMA: break, continue, return

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 3, Lección 3.

### 2. PRERREQUISITOS
- Bucles y condicionales.

### 3. OBJETIVO DE APRENDIZAJE
**Usar** `break`, `continue` y comprender `return` para controlar flujo, verificando efectos observables.

### 4. ANALOGÍA VISUAL
**Escena:** En una cinta de inspección, `continue` salta una pieza defectuosa, `break` detiene la cinta, `return` termina el turno completo.  
**Texto alternativo:** Tres instrucciones alteran el flujo con alcances distintos.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart TD
  A[loop] --> C{condición}
  C -->|continue| A
  C -->|break| E[sale del loop]
  C -->|return| R[sale del método]
```
**Texto alternativo:** continue salta iteración, break sale del bucle, return sale del método.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Instrucciones de salto controlado.
- **Para qué sirve:** Simplificar lógica de bucles y salidas tempranas.
- **Cuándo NO usarlo:** No abusar para crear flujo spaghetti; evitar múltiples returns confusos en métodos complejos sin claridad.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `BreakContinue.java`.
2. Usar `break` para encontrar primer par.
3. Usar `continue` para sumar impares.
4. Imprimir resultados y verificar.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class BreakContinue {
  public static void main(String[] args){
    int firstEven=-1;
    int sumOdd=0;
    for(int i=1;i<=6;i++){
      if(i%2==0){ firstEven=i; break; }
    }
    for(int i=1;i<=6;i++){
      if(i%2==0) continue;
      sumOdd+=i;
    }
    System.out.println(firstEven);
    System.out.println(sumOdd);
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `break`: sale del primer for al encontrar el primer par.
- `continue`: salta pares, solo suma impares.
- `sumOdd` termina en 1+3+5=9.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out && javac -d out src/BreakContinue.java
java -cp out BreakContinue
./verify.sh
```
Output esperado:
```text
2
9
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida ambas líneas.

### 12. MODIFICACIÓN GUIADA
- Cambio: elimina `break`.
- Hipótesis: `firstEven` terminará en 6.
- Resultado observado: break corta temprano.

### 13. ERROR COMÚN
- **Síntoma:** bucle no procesa todos los elementos esperados.
- **Causa:** `break` o `continue` mal ubicado.
- **Diagnóstico visual:** trazar iteraciones.
- **Corrección:** revisar condición y posición del salto.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Diferencia entre `break` y `return` dentro de un bucle?
- **Respuesta modelo:** `break` sale del bucle/switch actual; `return` sale del método completo, sin importar bucles anidados.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** usar saltos para ocultar lógica compleja.
- **Cómo se ve:** difícil mantenimiento.
- **Alternativa:** extraer funciones y condiciones claras.
''')
print('ok')
