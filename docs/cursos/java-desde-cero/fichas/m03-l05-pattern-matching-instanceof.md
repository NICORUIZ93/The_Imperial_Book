## FICHA DE TEMA: Pattern matching para instanceof (Java 16+)

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
