## FICHA DE TEMA: Casting implícito y explícito

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
