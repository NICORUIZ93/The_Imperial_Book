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

lab('m03-l04-juego-de-adivinanza-desde-cero',{
'src/Adivinanza.java':'''public class Adivinanza {
  static String evaluar(int secreto, int intento){
    if(intento == secreto) return "correcto";
    if(intento < secreto) return "muy bajo";
    return "muy alto";
  }
  public static void main(String[] args){
    int secreto = 7;
    int[] intentos = {3,9,7};
    for(int i: intentos){
      System.out.println(evaluar(secreto,i));
    }
  }
}
'''},r'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/Adivinanza.java
OUT="$(java -cp out Adivinanza)"
[ "$(echo "$OUT" | sed -n '1p')" = "muy bajo" ]
[ "$(echo "$OUT" | sed -n '2p')" = "muy alto" ]
[ "$(echo "$OUT" | sed -n '3p')" = "correcto" ]
echo "RESULTADO: OK"
''','''# Lab M03-L04 — Juego de adivinanza desde cero
## Verificar
```bash
./verify.sh
```
''','''## FICHA DE TEMA: Construcción guiada: juego de adivinanza desde cero

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 3, Lección 4.

### 2. PRERREQUISITOS
- Condicionales, bucles, métodos.

### 3. OBJETIVO DE APRENDIZAJE
**Construir** un juego de adivinanza simple desde cero con lógica de comparación y verificación automática.

### 4. ANALOGÍA VISUAL
**Escena:** Un termómetro de cercanía: “muy bajo”, “muy alto”, “correcto”.  
**Texto alternativo:** Cada intento se compara con el secreto y produce feedback.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart TD
  I[intento] --> C{== secreto?}
  C -->|sí| OK[correcto]
  C -->|no| L{< secreto?}
  L -->|sí| B[muy bajo]
  L -->|no| H[muy alto]
```
**Texto alternativo:** Decisiones en cascada clasifican el intento.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Un programa que compara intentos contra un valor secreto.
- **Para qué sirve:** Practicar control de flujo, métodos y pruebas.
- **Cuándo NO usarlo:** No exponer el secreto en logs/cliente real; este lab es didáctico.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `Adivinanza.java`.
2. Implementar `evaluar(secreto,intento)`.
3. En `main`, simular intentos y imprimir respuestas.
4. Verificar con script.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class Adivinanza {
  static String evaluar(int secreto, int intento){
    if(intento == secreto) return "correcto";
    if(intento < secreto) return "muy bajo";
    return "muy alto";
  }
  public static void main(String[] args){
    int secreto = 7;
    int[] intentos = {3,9,7};
    for(int i: intentos){
      System.out.println(evaluar(secreto,i));
    }
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `evaluar`: encapsula regla de negocio.
- Bucle `for-each`: prueba varios casos.
- Salidas deterministas: fáciles de verificar.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out && javac -d out src/Adivinanza.java
java -cp out Adivinanza
./verify.sh
```
Output esperado:
```text
muy bajo
muy alto
correcto
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida secuencia exacta de respuestas.

### 12. MODIFICACIÓN GUIADA
- Cambio: lee intentos de `args`.
- Hipótesis: el juego se vuelve interactivo por CLI.
- Resultado observado: debes validar entrada.

### 13. ERROR COMÚN
- **Síntoma:** siempre responde “muy alto”.
- **Causa:** comparación invertida.
- **Diagnóstico visual:** probar casos límite.
- **Corrección:** revisar condiciones `<`/`>`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Por qué extraer `evaluar` como método?
- **Respuesta modelo:** Separa lógica de IO, facilita pruebas unitarias y reutilización.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** mezclar entrada, lógica y salida en un bloque.
- **Cómo se ve:** difícil de testear.
- **Alternativa:** métodos puros para lógica.
''')

lab('m03-l05-pattern-matching-instanceof',{
'src/PatternDemo.java':'''public class PatternDemo {
  static String describir(Object o){
    if(o instanceof String s) return "str:" + s.length();
    if(o instanceof Integer i) return "int:" + (i*2);
    return "otro";
  }
  public static void main(String[] args){
    System.out.println(describir("hola"));
    System.out.println(describir(21));
    System.out.println(describir(3.5));
  }
}
'''},r'''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out && javac -d out src/PatternDemo.java
OUT="$(java -cp out PatternDemo)"
[ "$(echo "$OUT" | sed -n '1p')" = "str:4" ]
[ "$(echo "$OUT" | sed -n '2p')" = "int:42" ]
[ "$(echo "$OUT" | sed -n '3p')" = "otro" ]
echo "RESULTADO: OK"
''','''# Lab M03-L05 — Pattern matching para instanceof
```bash
./verify.sh
```
''','''## FICHA DE TEMA: Pattern matching para instanceof (Java 16+)

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 3, Lección 5.

### 2. PRERREQUISITOS
- Condicionales, tipos, casting básico.

### 3. OBJETIVO DE APRENDIZAJE
**Usar** pattern matching de `instanceof` para simplificar type checks y casts, verificando comportamiento por casos.

### 4. ANALOGÍA VISUAL
**Escena:** Un clasificador de paquetes: al identificar la etiqueta, ya abre la caja con el tipo correcto.  
**Texto alternativo:** instanceof con patrón comprueba y asigna variable tipada.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  O[Object] --> C{instanceof String s?}
  C -->|sí| S[usar s.length()]
  C -->|no| I{instanceof Integer i?}
  I -->|sí| N[usar i*2]
  I -->|no| X[otro]
```
**Texto alternativo:** El patrón evita cast explícito posterior.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Sintaxis que combina test de tipo y binding de variable.
- **Para qué sirve:** Reduce casts redundantes y errores.
- **Cuándo NO usarlo:** No reemplaza buen diseño polimórfico; si hay muchos instanceof, considera polimorfismo.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `PatternDemo.java`.
2. Implementar `describir(Object o)` con `instanceof String s` e `Integer i`.
3. Probar con String, Integer y Double.
4. Verificar.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
public class PatternDemo {
  static String describir(Object o){
    if(o instanceof String s) return "str:" + s.length();
    if(o instanceof Integer i) return "int:" + (i*2);
    return "otro";
  }
  public static void main(String[] args){
    System.out.println(describir("hola"));
    System.out.println(describir(21));
    System.out.println(describir(3.5));
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `instanceof String s`: si es String, `s` ya está tipada en el bloque.
- Evita `(String) o` manual.
- Caso final maneja tipos no contemplados.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out && javac -d out src/PatternDemo.java
java -cp out PatternDemo
./verify.sh
```
Output esperado:
```text
str:4
int:42
otro
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida los tres casos.

### 12. MODIFICACIÓN GUIADA
- Cambio: agrega caso `Double d`.
- Hipótesis: 3.5 devolverá algo como `double:...`.
- Resultado observado: patrón se extiende por tipo.

### 13. ERROR COMÚN
- **Síntoma:** `ClassCastException` en código antiguo.
- **Causa:** cast manual sin verificar tipo real.
- **Diagnóstico visual:** revisar `instanceof` y cast.
- **Corrección:** usar pattern matching o verificación previa.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Qué mejora el pattern matching de instanceof?
- **Respuesta modelo:** Elimina el cast explícito tras la comprobación, reduce boilerplate y errores, y hace el flujo más claro.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** cadenas largas de instanceof en lógica de dominio.
- **Cómo se ve:** difícil extender, viola abierto/cerrado.
- **Alternativa:** polimorfismo, visitor o sealed types/pattern switch cuando aplique.
''')
print('ok')
