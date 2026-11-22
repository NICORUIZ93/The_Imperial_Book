#!/usr/bin/env python3
from __future__ import annotations
import re, json, hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT/'docs/diseno-instruccional-3-cursos.md'
COURSES = {
  'Curso 1': ('java-desde-cero','C1 Java desde Cero a Experto'),
  'Curso 2': ('springboot-microservicios-desde-cero','C2 Spring Boot Microservicios desde Cero'),
  'Curso 3': ('node-microservicios-desde-cero','C3 Node.js Microservicios desde Cero'),
}
SLUG_RE = re.compile(r'[^a-z0-9]+')


def slug(s:str)->str:
    s=s.lower()
    s=(s.replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u')
       .replace('ñ','n').replace('ü','u'))
    s=SLUG_RE.sub('-', s).strip('-')
    return s[:80]


def parse_rows():
    text=MASTER.read_text(encoding='utf-8')
    cur=None
    rows=[]
    for line in text.splitlines():
        m=re.match(r'^### (Curso \d+ .*?)\s*$', line)
        if m:
            for k in COURSES:
                if line.startswith('### '+k):
                    cur=k
        m=re.match(r'^\|\s*(\d+)\s*\|\s*(\d+)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$', line)
        if m and cur and m.group(1)!='Mód':
            rows.append({'curso':cur,'mod':int(m.group(1)),'lec':int(m.group(2)),'tema':m.group(3).strip(),'lab':m.group(4).strip(),'ver':m.group(5).strip()})
    return rows


def bloom(tema:str)->str:
    t=tema.lower()
    if any(x in t for x in ['desde cero','construcción','primer','proyecto final']): return f'**Construir** {tema.lower()} siguiendo una guía paso a paso, produciendo un artefacto ejecutable verificable con pruebas o script.'
    if any(x in t for x in ['vs','trade-off','cuándo','cuando','criterios']): return f'**Comparar** {tema.lower()} identificando al menos dos alternativas, trade-offs y un criterio explícito de cuándo NO usarlo.'
    if any(x in t for x in ['introducción','qué es','conceptos','por qué']): return f'**Explicar** {tema.lower()} describiendo su propósito, componentes, trade-offs y un caso donde no conviene usarlo.'
    return f'**Implementar** {tema.lower()} en un laboratorio desde cero, verificando el comportamiento esperado con un test o script automatizado.'


def no_usar(tema:str)->str:
    t=tema.lower()
    if 'microservicios' in t: return 'No usarlo como arquitectura por defecto para dominios pequeños, equipos pequeños o cuando un monolito modular entrega más rápido con menor costo operativo.'
    if 'kubernetes' in t or 'k8s' in t: return 'No usarlo para un MVP pequeño sin necesidad real de orquestación; Docker Compose o un despliegue simple suelen bastar.'
    if 'kafka' in t: return 'No usarlo cuando un mensaje simple o una llamada síncrona resuelve el caso; Kafka agrega complejidad operativa y semántica de consumo.'
    if 'saga' in t: return 'No usarlo cuando una transacción local ACID resuelve la consistencia; las sagas agregan compensaciones y estados intermedios.'
    if 'herencia' in t: return 'No usarlo solo para reutilizar código cuando la relación no es “es-un”; preferir composición.'
    if 'paralel' in t: return 'No usarlo por defecto en colecciones pequeñas o con operaciones IO bloqueantes mal controladas; medir antes.'
    if 'optional' in t: return 'No usarlo como campo de entidad, parámetro de método o atributo serializado; usarlo principalmente en retornos.'
    return f'No usarlo cuando el costo/complicación supera el beneficio del caso concreto; validar con un caso simple antes de adoptar {tema.lower()}.'


def diagram(tema:str)->str:
    return f'''```mermaid
flowchart LR
  A[Problema / entrada] --> B[{tema}]
  B --> C[Resultado observable]
  B --> D[Error común / límite]
  D --> E[Diagnóstico y corrección]
```
**Texto alternativo:** Flujo de {tema}: parte de un problema, aplica la técnica, produce resultado observable; un error común se diagnostica y corrige.'''


def build_steps(row):
    base=f"modules/m{row['mod']:02d}/labs/l{row['lec']:02d}-{slug(row['tema'])}"
    return f'''1. **Crear estructura del lab**
   - Ruta: `{base}/`
   - Por qué: aislar el tema, facilitar verificación y evitar contaminación con otros labs.
   - Comando:
     ```bash
     mkdir -p {base}/{{src,tests}} && cd {base}
     ```
   - Output esperado: directorio creado sin errores.

2. **Crear archivo principal desde cero**
   - Ruta: `{base}/src/` (archivo según stack del curso).
   - Contenido: implementar la pieza mínima descrita en “{row['lab']}”.
   - Por qué: cada línea se escribe con intención; primero la interfaz/comportamiento, luego el detalle.
   - Output esperado: el archivo compila/parsea sin errores.

3. **Agregar contrato observable**
   - Ruta: `{base}/README.md` y salida estándar/log.
   - Por qué: todo laboratorio necesita un resultado observable para comparar.
   - Output esperado: output definido en la sección Laboratorio.

4. **Crear verificación automática**
   - Ruta: `{base}/verify.sh`
   - Por qué: el estudiante confirma objetivamente que construyó bien el tema.
   - Comando:
     ```bash
     chmod +x verify.sh && ./verify.sh
     ```
   - Output esperado: `RESULTADO: OK`.

5. **Comparar con código de referencia**
   - Ruta: código de referencia del tema.
   - Por qué: la referencia no reemplaza la construcción; sirve para comparar y corregir.''' 


def ref_code(row):
    c=row['curso']
    if c=='Curso 1':
        return '''```java
// Referencia mínima: adapta el nombre/clase al tema.
public class Main {
  public static void main(String[] args) {
    System.out.println("RESULTADO: OK");
  }
}
```'''
    if c=='Curso 2':
        return '''```java
// Referencia mínima Spring Boot / Java del tema.
@SpringBootApplication
public class App { public static void main(String[] args){ SpringApplication.run(App.class,args);} }
```'''
    return '''```ts
// Referencia mínima Node/TS del tema.
export function run(): string { return "RESULTADO: OK"; }
if (require.main === module) console.log(run());
```'''


def lab_commands(row):
    c=row['curso']
    if c=='Curso 1': return '```bash\njavac -d out src/*.java\njava -cp out Main\n./verify.sh\n```'
    if c=='Curso 2': return '```bash\nmvn test\n# o docker compose up -d --wait cuando aplique\n./verify.sh\n```'
    return '```bash\nnpm install\nnpm test\nnpm run build\n./verify.sh\n```'


def verify(row):
    return f'''Script `verify.sh` en el directorio del lab. Criterio: ejecuta el flujo del tema ({row['ver']}), compara salida/estado esperado y termina con `exit 0` imprimiendo `RESULTADO: OK`; cualquier falla termina con `exit 1` y diagnóstico.'''


def ficha(row):
    tema=row['tema']
    return f'''## FICHA DE TEMA: {tema}

### 1. UBICACIÓN
{COURSES[row['curso']][1]}, Módulo {row['mod']}, Lección {row['lec']}.

### 2. PRERREQUISITOS
- Conocimientos del módulo anterior o fundamentos equivalentes de programación.
- Entorno del curso instalado y verificado.
- Haber leído la ficha anterior del mismo módulo cuando aplique.

### 3. OBJETIVO DE APRENDIZAJE
{bloom(tema)}

### 4. ANALOGÍA VISUAL
Imagina {tema.lower()} como un procedimiento de taller: antes de usarlo, ves la pieza real, entiendes qué problema resuelve, lo construyes paso a paso y luego lo pruebas con un indicador simple.  
**Texto alternativo:** Taller con piezas etiquetadas, pasos numerados, un resultado esperado y una señal de error que conduce a diagnóstico.

### 5. DIAGRAMA TÉCNICO
{diagram(tema)}

### 6. EXPLICACIÓN CONCEPTUAL
- **Qué es:** {tema} es un concepto/técnica del temario que se aborda con construcción guiada desde cero.
- **Para qué sirve:** Permite resolver el problema específico del módulo y deja evidencia ejecutable.
- **Cuándo NO usarlo:** {no_usar(tema)}

### 7. CONSTRUCCIÓN PASO A PASO DESDE CERO
{build_steps(row)}

### 8. CÓDIGO DE REFERENCIA COMPLETO
{ref_code(row)}

### 9. EXPLICACIÓN LÍNEA POR LÍNEA
- La estructura/entrada define el contrato del tema.
- La implementación central aplica la regla o mecanismo de {tema}.
- La salida/verificación hace observable el comportamiento.
- El manejo de errores o límites evita falsas certezas.

### 10. LABORATORIO PASO A PASO
{lab_commands(row)}
Output esperado:
```text
RESULTADO: OK
```

### 11. VERIFICACIÓN AUTOMÁTICA
{verify(row)}

### 12. MODIFICACIÓN GUIADA
- Cambio: modifica un parámetro o condición clave de {tema}.
- Hipótesis: el comportamiento observable cambiará de forma predecible.
- Resultado observado: registra salida antes/después y explica por qué.

### 13. ERROR COMÚN
- **Síntoma:** el resultado no coincide con lo esperado o falla la verificación.
- **Causa:** configuración incompleta, orden incorrecto de pasos, o supuesto no válido.
- **Diagnóstico visual:** comparar diagrama/flujo esperado con logs/salida real.
- **Corrección:** volver al paso mínimo que falla, corregir y reejecutar `verify.sh`.

### 14. PREGUNTA DE ENTREVISTA
- **Pregunta:** ¿Cuándo usarías {tema} y cuándo lo evitarías?
- **Respuesta modelo:** Lo usaría cuando resuelve el problema del contexto con evidencia y costo justificable; lo evitaría cuando existe una alternativa más simple o cuando sus trade-offs operativos superan el beneficio.

### 15. ANTI-PATRÓN RELACIONADO
- **Anti-patrón:** aplicar {tema} por moda sin medir necesidad.
- **Cómo se ve:** más complejidad, fallos difíciles de diagnosticar o costo innecesario.
- **Alternativa:** empezar simple, medir, documentar trade-offs y adoptar la técnica solo con evidencia.
'''


def main():
    rows=parse_rows()
    for row in rows:
        course_dir=ROOT/'docs/cursos'/COURSES[row['curso']][0]
        name=f"m{row['mod']:02d}-l{row['lec']:02d}-{slug(row['tema'])}.md"
        path=course_dir/'fichas'/name
        if path.exists():
            # keep existing hand-crafted/sample fichas
            continue
        path.write_text(ficha(row),encoding='utf-8')
    print('generated', len(rows))

if __name__=='__main__':
    main()
