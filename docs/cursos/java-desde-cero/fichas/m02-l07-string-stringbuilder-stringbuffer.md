## FICHA DE TEMA: String, StringBuilder, StringBuffer

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
