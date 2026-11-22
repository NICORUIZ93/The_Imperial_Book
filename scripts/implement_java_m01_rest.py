#!/usr/bin/env python3
from pathlib import Path
import stat as statmod
ROOT=Path('/Users/nicolasruiz/Documents/GitHub/Academia_Floci')
BASE=ROOT/'docs/cursos/java-desde-cero'
def w(p,c,exe=False):
    p=Path(p); p.parent.mkdir(parents=True,exist_ok=True); p.write_text(c,encoding='utf-8')
    if exe: p.chmod(p.stat().st_mode|statmod.S_IXUSR|statmod.S_IXGRP|statmod.S_IXOTH)

# L06 estructura .java
lab=BASE/'labs/m01-l06-estructura-java'
w(lab/'src/com/academia/app/Main.java','''package com.academia.app;

import com.academia.app.util.Saludador;

public class Main {
  public static void main(String[] args) {
    Saludador s = new Saludador("Academia");
    System.out.println(s.saludar());
  }
}
''')
w(lab/'src/com/academia/app/util/Saludador.java','''package com.academia.app.util;

public class Saludador {
  private final String nombre;
  public Saludador(String nombre) { this.nombre = nombre; }
  public String saludar() { return "Hola desde " + nombre; }
}
''')
w(lab/'verify.sh','''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
rm -rf out && mkdir -p out
javac -d out src/com/academia/app/util/Saludador.java src/com/academia/app/Main.java
OUT="$(java -cp out com.academia.app.Main)"
[[ "$OUT" == "Hola desde Academia" ]] || { echo "FALLA: $OUT"; exit 1; }
echo "RESULTADO: OK"
''',exe=True)
w(lab/'README.md','''# Lab M01-L06 — Estructura de un archivo .java
## Qué se construyó
Proyecto con `package`, `import`, clase, constructor, método y `main`.
## Cómo verificar
```bash
./verify.sh
```
## Output esperado
`Hola desde Academia` y `RESULTADO: OK`.
''')
w(BASE/'fichas/m01-l06-estructura-java.md','''## FICHA DE TEMA: Estructura de un archivo .java: package, imports, clase, main

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 1, Lección 6.

### 2. PRERREQUISITOS
- Compilar y ejecutar Java básico.
- Conocer clases y métodos.

### 3. OBJETIVO DE APRENDIZAJE
**Construir** un programa Java con paquete, import, clase auxiliar y `main`, compilándolo por estructura de directorios y verificando su ejecución.

### 4. ANALOGÍA VISUAL
**Escena:** Un edificio con dirección (package), puerta de acceso (import), habitaciones (clases) y recepción (main).  
**Texto alternativo:** El package ubica la clase, el import la hace visible, main inicia la ejecución.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart TB
  P[package com.academia.app] --> M[Main.java]
  I[import Saludador] --> M
  U[util/Saludador.java] --> M
  M --> OUT[Hola desde Academia]
```
**Texto alternativo:** Main en un paquete importa Saludador de otro paquete y produce salida.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** La estructura mínima de un archivo Java incluye declaración de paquete opcional, imports, declaración de tipo y métodos.
- **Para qué sirve:** Organiza código, evita colisiones de nombres y permite compilación escalable.
- **Cuándo NO usarlo:** No usar paquetes excesivamente profundos sin necesidad; no poner todo en el paquete por defecto en proyectos reales.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear directorios `src/com/academia/app/util`.
2. Crear `Saludador.java` con `package com.academia.app.util;`.
3. Crear `Main.java` con `package com.academia.app;` e `import com.academia.app.util.Saludador;`.
4. Compilar indicando fuentes: `javac -d out src/com/academia/app/util/Saludador.java src/com/academia/app/Main.java`.
5. Ejecutar con nombre fully qualified: `java -cp out com.academia.app.Main`.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
package com.academia.app;
import com.academia.app.util.Saludador;
public class Main {
  public static void main(String[] args) {
    Saludador s = new Saludador("Academia");
    System.out.println(s.saludar());
  }
}
```
```java
package com.academia.app.util;
public class Saludador {
  private final String nombre;
  public Saludador(String nombre) { this.nombre = nombre; }
  public String saludar() { return "Hola desde " + nombre; }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `package ...`: namespace de la clase.
- `import ...`: atajo para nombre completo.
- `private final String nombre`: estado inmutable tras construcción.
- `main`: punto de entrada.

### 10. LABORATORIO PASO A PASO
```bash
javac -d out src/com/academia/app/util/Saludador.java src/com/academia/app/Main.java
java -cp out com.academia.app.Main
./verify.sh
```
Output esperado:
```text
Hola desde Academia
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` compila estructura por paquetes y valida salida exacta.

### 12. MODIFICACIÓN GUIADA
- Cambio: mueve `Saludador` a otro paquete sin actualizar import.
- Hipótesis: fallará compilación.
- Resultado observado: error `cannot find symbol`/paquete.

### 13. ERROR COMÚN
- **Síntoma:** `Could not find or load main class Main`.
- **Causa:** se ejecutó sin nombre de paquete completo.
- **Diagnóstico visual:** la clase está en `out/com/academia/app/Main.class`.
- **Corrección:** `java -cp out com.academia.app.Main`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Para qué sirve `package` en Java?
- **Respuesta modelo:** Organiza clases en namespaces, evita colisiones de nombres y refleja estructura del proyecto; también influye en acceso package-private.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** usar el paquete por defecto para todo.
- **Cómo se ve:** conflictos, mala organización, problemas al escalar.
- **Alternativa:** usar paquetes por dominio/capa desde el inicio.
''')

# L07 estilo
lab=BASE/'labs/m01-l07-comentarios-convenciones-estilo'
w(lab/'src/CalculadoraImpuestos.java','''/**
 * Calculadora simple de impuestos.
 * Convenciones: clase PascalCase, métodos camelCase, constantes UPPER_SNAKE_CASE.
 */
public class CalculadoraImpuestos {
  public static final double TASA_IVA = 0.19;

  public double calcularTotal(double subtotal) {
    // Valida entrada antes de calcular.
    if (subtotal < 0) {
      throw new IllegalArgumentException("subtotal negativo");
    }
    return subtotal * (1 + TASA_IVA);
  }

  public static void main(String[] args) {
    CalculadoraImpuestos calc = new CalculadoraImpuestos();
    System.out.println(calc.calcularTotal(100));
  }
}
''')
w(lab/'verify.sh','''#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
javac -d out src/CalculadoraImpuestos.java
OUT="$(java -cp out CalculadoraImpuestos)"
[[ "$OUT" == "119.0" || "$OUT" == "119" ]] || { echo "FALLA: $OUT"; exit 1; }
grep -q "TASA_IVA" src/CalculadoraImpuestos.java || { echo "FALLA: falta constante UPPER_SNAKE_CASE"; exit 1; }
grep -q "/\*\*" src/CalculadoraImpuestos.java || { echo "FALLA: falta Javadoc/comentario"; exit 1; }
echo "RESULTADO: OK"
''',exe=True)
w(lab/'README.md','''# Lab M01-L07 — Comentarios, convenciones, estilo
## Qué se construyó
Clase con convenciones de nombres, constante, comentario Javadoc y validación.
## Cómo verificar
```bash
./verify.sh
```
''')
w(BASE/'fichas/m01-l07-comentarios-convenciones-estilo.md','''## FICHA DE TEMA: Comentarios, convenciones de nombres, estilo de código

### 1. UBICACIÓN
Curso 1: Java desde Cero a Experto, Módulo 1, Lección 7.

### 2. PRERREQUISITOS
- Saber escribir clases, métodos y variables en Java.

### 3. OBJETIVO DE APRENDIZAJE
**Aplicar** convenciones de nombres y estilo Java en una clase pequeña, usando comentarios solo donde aportan intención, y verificar comportamiento con un script.

### 4. ANALOGÍA VISUAL
**Escena:** Un taller con herramientas etiquetadas y manual breve. Las etiquetas claras (nombres) evitan errores; el manual (comentarios) solo explica lo no obvio.  
**Texto alternativo:** Código con nombres claros, constante en mayúsculas y comentario Javadoc.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  N[Nombre claro] --> L[Legibilidad]
  C[Constante UPPER_SNAKE_CASE] --> L
  J[Javadoc útil] --> M[Mantenibilidad]
  L --> Q[Código de calidad]
  M --> Q
```
**Texto alternativo:** Convenciones y comentarios útiles mejoran legibilidad y mantenibilidad.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Convenciones: clases PascalCase, métodos/variables camelCase, constantes UPPER_SNAKE_CASE, paquetes minúsculas. Comentarios explican intención, no lo obvio.
- **Para qué sirve:** Facilita lectura, revisión y mantenimiento.
- **Cuándo NO usarlo:** No comentar cada línea obvia; no usar nombres crípticos; no mantener comentarios desactualizados.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. Crear `CalculadoraImpuestos.java`.
2. Definir constante `TASA_IVA`.
3. Implementar `calcularTotal` con validación.
4. Agregar Javadoc breve y comentario solo en validación.
5. Compilar y ejecutar; verificar con script.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
/**
 * Calculadora simple de impuestos.
 * Convenciones: clase PascalCase, métodos camelCase, constantes UPPER_SNAKE_CASE.
 */
public class CalculadoraImpuestos {
  public static final double TASA_IVA = 0.19;
  public double calcularTotal(double subtotal) {
    if (subtotal < 0) {
      throw new IllegalArgumentException("subtotal negativo");
    }
    return subtotal * (1 + TASA_IVA);
  }
  public static void main(String[] args) {
    CalculadoraImpuestos calc = new CalculadoraImpuestos();
    System.out.println(calc.calcularTotal(100));
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- `TASA_IVA`: constante con convención UPPER_SNAKE_CASE.
- `calcularTotal`: camelCase, verbo claro.
- Javadoc: describe propósito sin repetir lo obvio.
- Validación: protege invariante de dominio.

### 10. LABORATORIO PASO A PASO
```bash
mkdir -p out
javac -d out src/CalculadoraImpuestos.java
java -cp out CalculadoraImpuestos
./verify.sh
```
Output esperado:
```text
119.0
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
`verify.sh` valida salida, presencia de constante y Javadoc.

### 12. MODIFICACIÓN GUIADA
- Cambio: renombra `TASA_IVA` a `tasa`.
- Hipótesis: funciona pero viola convención; actualiza verificador si quieres imponer estilo.
- Resultado observado: diferencia entre corrección funcional y calidad de estilo.

### 13. ERROR COMÚN
- **Síntoma:** código funciona pero es difícil de leer.
- **Causa:** nombres pobres, comentarios obsoletos o exceso de comentarios.
- **Diagnóstico visual:** leer método sin contexto; si no se entiende, nombres/comentarios fallan.
- **Corrección:** renombrar por intención, borrar comentarios obvios, documentar decisiones.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Cuándo prefieres un buen nombre antes que un comentario?
- **Respuesta modelo:** Casi siempre. Un nombre claro hace el código autoexplicativo; el comentario se reserva para intención, trade-offs, invariantes o decisiones no obvias.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** comentarios que repiten el código (`i++; // incrementa i`).
- **Cómo se ve:** ruido, desactualización y baja señal.
- **Alternativa:** nombres expresivos y comentarios de intención.
''')
print('ok')
