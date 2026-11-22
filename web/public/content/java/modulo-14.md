# Módulo 14: Java en producción — memoria, benchmarks y runtime seguro

El proyecto integrador ya funciona; en producción aparecen otras fronteras: visibilidad de memoria entre hilos, mediciones engañosas por optimizaciones del JIT, deserialización insegura, y el runtime como parte del artefacto. Este módulo trabaja estas fronteras con evidencia.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Explicar happens-before y corregir errores de visibilidad/publicación |
| 2 | Medir rendimiento con criterio y evitar cronómetros ingenuos |
| 3 | Tratar deserialización como frontera de confianza |
| 4 | Empaquetar y operar un runtime con ciclo de vida |
| 5 | Usar CDS/AOT cache para mejorar arranque cuando aplica |
| 6 | Planear migraciones LTS con `jdeprscan` y `jdeps` |

## Aprende construyendo

### Tema 1: Compartir memoria requiere orden y visibilidad · Avanzado · 45 min

**Caso guía**: un hilo escribe `data` y `ready`; otro espera `ready`. Sin happens-before, puede ver estado inconsistente.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Visibilidad | Escritura de un hilo observable por otro | Evitar lecturas obsoletas | Necesita happens-before | Flag no volatile |
| Orden (happens-before JMM) | Garantías de orden/visibilidad entre acciones | Razonar concurrencia | `volatile`, lock, start/join establecen HB | Asumir orden del código |
| `volatile` | Visibilidad + orden de variable; no atomicidad compuesta | Flags/publicación simple | No usar para RMW | `count++` con volatile |
| Sincronización | `synchronized`/Lock: exclusión mutua + HB | Proteger invariantes compuestos | Proteger sección crítica completa | Check-then-act sin lock |

**Implementación desde cero** (`mkdir -p ~/academia-java/modulo-14 && cd ~/academia-java/modulo-14`)
```java
public class DemoVisibilidad {
  static volatile boolean ready = false; static int data = 0;
  public static void main(String[] args) throws Exception {
    Thread t = new Thread(() -> { data = 42; ready = true; });
    t.start(); while (!ready) Thread.onSpinWait(); System.out.println(data); t.join();
  }
}
```
**Ejecución/salida real**: `javac DemoVisibilidad.java && java DemoVisibilidad` → `42`. **Verificación**: quita `volatile` y observa no determinismo posible.

### Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo · Avanzado · 45 min

**Caso guía**: microbenchmark marca 0ms porque JIT eliminó el trabajo.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| Optimizaciones JIT | Inlining, C2, escape analysis, etc. | Código hot se optimiza | Medir sin warmup |
| Dead Code Elimination (DCE) | Elimina cómputo sin efecto observable | Consume resultado | Benchmark devuelve valor ignorado |
| Benchmark ingenuo | nanoTime sin control estadístico/warmup | No usar para decisiones | “0ms” falso |
| JMH | Harness oficial para microbenchmarks | Usa `@Benchmark`, `Blackhole` | Inventar framework casero |

**Implementación desde cero**
```java
public class DemoDce { static int work(){ int s=0; for(int i=0;i<1_000_000;i++) s+=i; return s; }
  public static void main(String[] args){ for(int i=0;i<5;i++){ long t1=System.nanoTime(); int r=work(); long t2=System.nanoTime(); System.out.println(r+" "+((t2-t1)/1_000_000)); } } }
```
**Ejecución**: `javac DemoDce.java && java DemoDce`. **Salida real**: primera iteración mayor, luego baja (varía). **Verificación**: usa JMH para mediciones serias.

### Tema 3: Deserializar es permitir construcción y comportamiento · Avanzado · 45 min

**Caso guía**: deserializar input no confiable puede crear objetos inválidos o explotar gadgets.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| Deserialización segura | Reconstruir datos validando tipo/esquema/invariantes | Allowlist, DTOs, validación | Java serialization con input externo |
| Superficie de ataque | Tipos/callbacks alcanzables durante parseo | Minimizar tipos aceptados | Polymorphic typing inseguro |
| Validación post-deserialización | Verificar invariantes tras construir | Nunca confiar en input | Aceptar valores negativos/formatos |
| Contrato de datos | Esquema esperado explícito | Rechazar lo inesperado | Parsear “lo que venga” |

**Implementación desde cero**
```java
record Guia(String id, int pesoKg) {
  static Guia parse(String csv){ var p=csv.split(","); if(p.length!=2) throw new IllegalArgumentException("formato"); String id=p[0].trim(); int peso=Integer.parseInt(p[1].trim()); if(id.isBlank()||peso<=0) throw new IllegalArgumentException("invalido"); return new Guia(id,peso); }
}
public class DemoValidar { public static void main(String[] args){ System.out.println(Guia.parse("G-1,2")); try{ Guia.parse("G-2,-1"); }catch(Exception e){ System.out.println("rechazado"); } } }
```
**Salida real**: `Guia[id=G-1, pesoKg=2]` y `rechazado`. **Verificación**: input inválido siempre rechazado.

### Tema 4: El runtime es parte del artefacto y necesita ciclo de vida · Avanzado · 45 min

**Caso guía**: app funciona local pero falla en contenedor por JRE distinto.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| Runtime como artefacto | JDK/JRE/jlink image se versiona y entrega | Fijar versión en CI/Dockerfile | Usar runtime del host |
| Ciclo de vida | Upgrade, parches, EOL, rollback | Planificar migraciones LTS | Runtime EOL en prod |
| `jlink` | Genera runtime image con módulos necesarios | Incluir solo módulos requeridos | Omitir módulo necesario |
| Compatibilidad | App+deps+runtime probados juntos | Probar en runtime objetivo | “Compila, ya está” |

**Implementación desde cero**
```bash
cat > App.java <<'JAVA'
public class App { public static void main(String[] args){ System.out.println(System.getProperty("java.version")); } }
JAVA
javac App.java && java -cp . App
```
**Salida real**: versión del JDK instalado (ej. `27`). **Verificación**: fija la misma versión en CI/contenedor.

### Tema 5: Arranque más rápido: archivos CDS y la caché AOT · Avanzado · 40 min

**Caso guía**: CLI arranca lento; CDS/AppCDS puede reducir startup.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| CDS | Class Data Sharing de metadata de clases | Generar archive compatible con classpath/JDK | Archive incompatible |
| AppCDS | CDS para clases de aplicación | Mismo classpath que producción | Classpath distinto |
| Caché AOT | Artefactos AOT para acelerar arranque (según JDK) | Verificar flags de tu versión | Confundir con Graal native |
| Trade-off startup/pico | Mejora arranque, no siempre throughput pico | Medir antes/después | Optimizar lo irrelevante |

**Implementación desde cero**
```bash
cat > App.java <<'JAVA'
public class App { public static void main(String[] args){ System.out.println("hola"); } }
JAVA
javac App.java && jar cf app.jar App.class
java -Xshare:dump -XX:SharedArchiveFile=app.jsa -cp app.jar App
java -XX:SharedArchiveFile=app.jsa -cp app.jar App
```
**Salida real**: `hola` dos veces. **Nota**: flags varían por JDK; verifica con `java -Xshare:dump -help`.

### Tema 6: Migrar entre versiones LTS: de 17 a 21 y 25 con jdeprscan y jdeps · Avanzado · 45 min

**Caso guía**: migras de 17 a 21/25 y necesitas detectar APIs removidas y dependencias internas.

| Concepto | Definición | Regla | Error |
|---|---|---|---|
| Migración LTS | 17→21→25 con pruebas y plan | CI matriz de JDKs | Saltar sin tests |
| `jdeprscan` | Detecta uso de APIs deprecated/for removal | Ejecutar sobre jars | Ignorar warnings |
| `jdeps` | Analiza dependencias de módulos/paquetes/APIs internas | Revisar `sun.*`/internos | No revisar transitivas |
| Compatibilidad | Compilar+ejecutar tests en target | Actualizar plugins/deps | Solo compilar |

**Implementación desde cero**
```bash
cat > App.java <<'JAVA'
public class App { public static void main(String[] args){ System.out.println("ok"); } }
JAVA
javac App.java && jar cf app.jar App.class
jdeprscan app.jar || true
jdeps -summary app.jar
```
**Salida real**: resumen de dependencias; jdeprscan puede no reportar uso. **Verificación**: ejecutar suite de tests en JDK target.


## Cierre del módulo

Producción exige evidencia: visibilidad de memoria correcta, benchmarks fiables, deserialización defensiva, runtime empaquetado y migraciones planificadas. Con estas bases, el siguiente módulo lleva Java al backend con Spring Boot.
