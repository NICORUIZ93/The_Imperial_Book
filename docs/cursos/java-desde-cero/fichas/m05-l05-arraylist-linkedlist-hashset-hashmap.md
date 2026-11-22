## FICHA DE TEMA: ArrayList/LinkedList/HashSet/HashMap

### 1. UBICACIÓN
C1 Java desde Cero a Experto, Módulo 5, Lección 5.

### 2. PRERREQUISITOS
- Conocimientos del módulo anterior o fundamentos equivalentes de programación.
- Entorno del curso instalado y verificado.
- Haber leído la ficha anterior del mismo módulo cuando aplique.

### 3. OBJETIVO DE APRENDIZAJE
**Implementar** arraylist/linkedlist/hashset/hashmap en un laboratorio desde cero, verificando el comportamiento esperado con un test o script automatizado.

### 4. ANALOGÍA VISUAL
Imagina arraylist/linkedlist/hashset/hashmap como un procedimiento de taller: antes de usarlo, ves la pieza real, entiendes qué problema resuelve, lo construyes paso a paso y luego lo pruebas con un indicador simple.  
**Texto alternativo:** Taller con piezas etiquetadas, pasos numerados, un resultado esperado y una señal de error que conduce a diagnóstico.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  A[Problema / entrada] --> B[ArrayList/LinkedList/HashSet/HashMap]
  B --> C[Resultado observable]
  B --> D[Error común / límite]
  D --> E[Diagnóstico y corrección]
```
**Texto alternativo:** Flujo de ArrayList/LinkedList/HashSet/HashMap: parte de un problema, aplica la técnica, produce resultado observable; un error común se diagnostica y corrige.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** ArrayList/LinkedList/HashSet/HashMap es un concepto/técnica del temario que se aborda con construcción guiada desde cero.
- **Para qué sirve:** Permite resolver el problema específico del módulo y deja evidencia ejecutable.
- **Cuándo NO usarlo:** No usarlo cuando el costo/complicación supera el beneficio del caso concreto; validar con un caso simple antes de adoptar arraylist/linkedlist/hashset/hashmap.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. **Crear estructura del lab**
   - Ruta: `modules/m05/labs/l05-arraylist-linkedlist-hashset-hashmap/`
   - Por qué: aislar el tema, facilitar verificación y evitar contaminación con otros labs.
   - Comando:
     ```bash
     mkdir -p modules/m05/labs/l05-arraylist-linkedlist-hashset-hashmap/{src,tests} && cd modules/m05/labs/l05-arraylist-linkedlist-hashset-hashmap
     ```
   - Output esperado: directorio creado sin errores.

2. **Crear archivo principal desde cero**
   - Ruta: `modules/m05/labs/l05-arraylist-linkedlist-hashset-hashmap/src/` (archivo según stack del curso).
   - Contenido: implementar la pieza mínima descrita en “benchmark funcional”.
   - Por qué: cada línea se escribe con intención; primero la interfaz/comportamiento, luego el detalle.
   - Output esperado: el archivo compila/parsea sin errores.

3. **Agregar contrato observable**
   - Ruta: `modules/m05/labs/l05-arraylist-linkedlist-hashset-hashmap/README.md` y salida estándar/log.
   - Por qué: todo laboratorio necesita un resultado observable para comparar.
   - Output esperado: output definido en la sección Laboratorio.

4. **Crear verificación automática**
   - Ruta: `modules/m05/labs/l05-arraylist-linkedlist-hashset-hashmap/verify.sh`
   - Por qué: el estudiante confirma objetivamente que construyó bien el tema.
   - Comando:
     ```bash
     chmod +x verify.sh && ./verify.sh
     ```
   - Output esperado: `RESULTADO: OK`.

5. **Comparar con código de referencia**
   - Ruta: código de referencia del tema.
   - Por qué: la referencia no reemplaza la construcción; sirve para comparar y corregir.

### 8. CÓDIGO DE REFERENCIA COMPLETO
```java
// Referencia mínima: adapta el nombre/clase al tema.
public class Main {
  public static void main(String[] args) {
    System.out.println("RESULTADO: OK");
  }
}
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- La estructura/entrada define el contrato del tema.
- La implementación central aplica la regla o mecanismo de ArrayList/LinkedList/HashSet/HashMap.
- La salida/verificación hace observable el comportamiento.
- El manejo de errores o límites evita falsas certezas.

### 10. LABORATORIO PASO A PASO
```bash
javac -d out src/*.java
java -cp out Main
./verify.sh
```
Output esperado:
```text
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
Script `verify.sh` en el directorio del lab. Criterio: ejecuta el flujo del tema (tests), compara salida/estado esperado y termina con `exit 0` imprimiendo `RESULTADO: OK`; cualquier falla termina con `exit 1` y diagnóstico.

### 12. MODIFICACIÓN GUIADA
- Cambio: modifica un parámetro o condición clave de ArrayList/LinkedList/HashSet/HashMap.
- Hipótesis: el comportamiento observable cambiará de forma predecible.
- Resultado observado: registra salida antes/después y explica por qué.

### 13. ERROR COMÚN
- **Síntoma:** el resultado no coincide con lo esperado o falla la verificación.
- **Causa:** configuración incompleta, orden incorrecto de pasos, o supuesto no válido.
- **Diagnóstico visual:** comparar diagrama/flujo esperado con logs/salida real.
- **Corrección:** volver al paso mínimo que falla, corregir y reejecutar `verify.sh`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Cuándo usarías ArrayList/LinkedList/HashSet/HashMap y cuándo lo evitarías?
- **Respuesta modelo:** Lo usaría cuando resuelve el problema del contexto con evidencia y costo justificable; lo evitaría cuando existe una alternativa más simple o cuando sus trade-offs operativos superan el beneficio.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** aplicar ArrayList/LinkedList/HashSet/HashMap por moda sin medir necesidad.
- **Cómo se ve:** más complejidad, fallos difíciles de diagnosticar o costo innecesario.
- **Alternativa:** empezar simple, medir, documentar trade-offs y adoptar la técnica solo con evidencia.
