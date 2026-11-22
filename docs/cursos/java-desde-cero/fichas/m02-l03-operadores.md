## FICHA DE TEMA: Operadores aritméticos, lógicos, relacionales, bit a bit

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
