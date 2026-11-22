## FICHA DE TEMA: Productor y consumidor Kafka desde cero

### 1. UBICACIÓN
C2 Spring Boot Microservicios desde Cero, Módulo 6, Lección 6.

### 2. PRERREQUISITOS
- Conocimientos del módulo anterior o fundamentos equivalentes de programación.
- Entorno del curso instalado y verificado.
- Haber leído la ficha anterior del mismo módulo cuando aplique.

### 3. OBJETIVO DE APRENDIZAJE
**Construir** productor y consumidor kafka desde cero siguiendo una guía paso a paso, produciendo un artefacto ejecutable verificable con pruebas o script.

### 4. ANALOGÍA VISUAL
Imagina productor y consumidor kafka desde cero como un procedimiento de taller: antes de usarlo, ves la pieza real, entiendes qué problema resuelve, lo construyes paso a paso y luego lo pruebas con un indicador simple.  
**Texto alternativo:** Taller con piezas etiquetadas, pasos numerados, un resultado esperado y una señal de error que conduce a diagnóstico.

### 5. DIAGRAMA TÉCNICO
```mermaid
flowchart LR
  A[Problema / entrada] --> B[Productor y consumidor Kafka desde cero]
  B --> C[Resultado observable]
  B --> D[Error común / límite]
  D --> E[Diagnóstico y corrección]
```
**Texto alternativo:** Flujo de Productor y consumidor Kafka desde cero: parte de un problema, aplica la técnica, produce resultado observable; un error común se diagnostica y corrige.

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** Productor y consumidor Kafka desde cero es un concepto/técnica del temario que se aborda con construcción guiada desde cero.
- **Para qué sirve:** Permite resolver el problema específico del módulo y deja evidencia ejecutable.
- **Cuándo NO usarlo:** No usarlo cuando un mensaje simple o una llamada síncrona resuelve el caso; Kafka agrega complejidad operativa y semántica de consumo.

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
1. **Crear estructura del lab**
   - Ruta: `modules/m06/labs/l06-productor-y-consumidor-kafka-desde-cero/`
   - Por qué: aislar el tema, facilitar verificación y evitar contaminación con otros labs.
   - Comando:
     ```bash
     mkdir -p modules/m06/labs/l06-productor-y-consumidor-kafka-desde-cero/{src,tests} && cd modules/m06/labs/l06-productor-y-consumidor-kafka-desde-cero
     ```
   - Output esperado: directorio creado sin errores.

2. **Crear archivo principal desde cero**
   - Ruta: `modules/m06/labs/l06-productor-y-consumidor-kafka-desde-cero/src/` (archivo según stack del curso).
   - Contenido: implementar la pieza mínima descrita en “topic+group”.
   - Por qué: cada línea se escribe con intención; primero la interfaz/comportamiento, luego el detalle.
   - Output esperado: el archivo compila/parsea sin errores.

3. **Agregar contrato observable**
   - Ruta: `modules/m06/labs/l06-productor-y-consumidor-kafka-desde-cero/README.md` y salida estándar/log.
   - Por qué: todo laboratorio necesita un resultado observable para comparar.
   - Output esperado: output definido en la sección Laboratorio.

4. **Crear verificación automática**
   - Ruta: `modules/m06/labs/l06-productor-y-consumidor-kafka-desde-cero/verify.sh`
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
// Referencia mínima Spring Boot / Java del tema.
@SpringBootApplication
public class App { public static void main(String[] args){ SpringApplication.run(App.class,args);} }
```

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- La estructura/entrada define el contrato del tema.
- La implementación central aplica la regla o mecanismo de Productor y consumidor Kafka desde cero.
- La salida/verificación hace observable el comportamiento.
- El manejo de errores o límites evita falsas certezas.

### 10. LABORATORIO PASO A PASO
```bash
mvn test
# o docker compose up -d --wait cuando aplique
./verify.sh
```
Output esperado:
```text
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
Script `verify.sh` en el directorio del lab. Criterio: ejecuta el flujo del tema (verify.sh), compara salida/estado esperado y termina con `exit 0` imprimiendo `RESULTADO: OK`; cualquier falla termina con `exit 1` y diagnóstico.

### 12. MODIFICACIÓN GUIADA
- Cambio: modifica un parámetro o condición clave de Productor y consumidor Kafka desde cero.
- Hipótesis: el comportamiento observable cambiará de forma predecible.
- Resultado observado: registra salida antes/después y explica por qué.

### 13. ERROR COMÚN
- **Síntoma:** el resultado no coincide con lo esperado o falla la verificación.
- **Causa:** configuración incompleta, orden incorrecto de pasos, o supuesto no válido.
- **Diagnóstico visual:** comparar diagrama/flujo esperado con logs/salida real.
- **Corrección:** volver al paso mínimo que falla, corregir y reejecutar `verify.sh`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Cuándo usarías Productor y consumidor Kafka desde cero y cuándo lo evitarías?
- **Respuesta modelo:** Lo usaría cuando resuelve el problema del contexto con evidencia y costo justificable; lo evitaría cuando existe una alternativa más simple o cuando sus trade-offs operativos superan el beneficio.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** aplicar Productor y consumidor Kafka desde cero por moda sin medir necesidad.
- **Cómo se ve:** más complejidad, fallos difíciles de diagnosticar o costo innecesario.
- **Alternativa:** empezar simple, medir, documentar trade-offs y adoptar la técnica solo con evidencia.
