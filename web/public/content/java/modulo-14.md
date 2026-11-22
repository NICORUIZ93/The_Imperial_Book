# Módulo 14: Java en producción — memoria, benchmarks y runtime seguro

El proyecto integrador ya funciona; en producción aparecen otras fronteras: visibilidad de memoria entre hilos, mediciones engañosas por optimizaciones del JIT, deserialización insegura, y el runtime como parte del artefacto. Este módulo trabaja estas fronteras con evidencia.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: Compartir memoria requiere orden y visibilidad · Avanzado · 45 min

Un hilo escribe `data` y `ready`; otro espera `ready`. Sin happens-before, puede ver estado inconsistente.

#### Visibilidad

**Definición formal.** Garantía de que una escritura realizada por un hilo es observable por otro hilo.

**Para qué sirve.** Evita lecturas obsoletas o estados imposibles.

**Cuándo usarlo.** Siempre que haya estado compartido entre hilos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t1-vis && cd /tmp/java-m14-t1-vis
```

```java
public class DemoVis {
    static volatile boolean ready = false; static int data = 0;
    public static void main(String[] args) throws Exception {
        Thread t = new Thread(() -> { data = 42; ready = true; });
        t.start(); while (!ready) Thread.onSpinWait(); System.out.println(data); t.join();
    }
}
```

**Caso de uso real.** Flag de parada en worker.

**Error común.** Flag no volátil/sin sincronización. Síntoma: bucle infinito o dato obsoleto. Corrección: `volatile`, lock o utilidades concurrentes.

**Verificación (JDK 27, 2026-05-22).** Salida: `42`.

#### Happens-before y JMM

**Definición formal.** El Java Memory Model define relaciones happens-before que garantizan orden y visibilidad entre acciones.

**Para qué sirve.** Razonar correctamente la concurrencia.

**Cuándo usarlo.** Al diseñar comunicación entre hilos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t1-hb && cd /tmp/java-m14-t1-hb
```

```java
public class DemoHB {
    public static void main(String[] args) throws Exception {
        final int[] box = {0};
        Thread t = new Thread(() -> box[0] = 5);
        t.start(); t.join(); // join establece happens-before
        System.out.println(box[0]);
    }
}
```

**Caso de uso real.** Hilo principal lee resultado tras `join`.

**Error común.** Asumir orden por “parece que corre en orden”. Corrección: usar garantías HB.

**Verificación (JDK 27, 2026-05-22).** Salida: `5`.

#### `volatile` y sincronización

**Definición formal.** `volatile` da visibilidad y orden para una variable; `synchronized`/locks dan exclusión mutua y happens-before para secciones críticas.

**Para qué sirve.** `volatile` para flags/publicación simple; locks para invariantes compuestos.

**Cuándo usarlo y cuándo no.** No uses `volatile` para `count++` (RMW compuesto).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t1-sync && cd /tmp/java-m14-t1-sync
```

```java
public class DemoSync {
    static int c=0; static synchronized void inc(){ c++; }
    public static void main(String[] args) throws Exception {
        Thread a=new Thread(() -> { for(int i=0;i<1000;i++) inc(); });
        Thread b=new Thread(() -> { for(int i=0;i<1000;i++) inc(); });
        a.start(); b.start(); a.join(); b.join(); System.out.println(c);
    }
}
```

**Caso de uso real.** Proteger contador/invariante compartido.

**Error común.** Usar volatile para operación compuesta. Corrección: `AtomicInteger` o lock.

**Verificación (JDK 27, 2026-05-22).** Salida: `2000`.

### Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo · Avanzado · 45 min

Un microbenchmark marca 0ms porque JIT eliminó el trabajo.

#### Optimizaciones JIT

**Definición formal.** La JVM JIT compila código caliente a nativo y aplica optimizaciones como inlining, escape analysis y eliminación de código muerto.

**Para qué sirve.** Mejora rendimiento, pero puede invalidar mediciones ingenuas.

**Cuándo tenerlo en cuenta.** Benchmarks y performance tuning.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t2-jit && cd /tmp/java-m14-t2-jit
```

```java
public class DemoJit { static long work(int n){ long s=0; for(int i=0;i<n;i++) s+=i; return s; }
    public static void main(String[] args){ for(int i=0;i<3;i++){ long t1=System.nanoTime(); System.out.println(work(1_000_000)); System.out.println((System.nanoTime()-t1)/1_000_000); } }
}
```

**Caso de uso real.** Calentamiento de servicio.

**Error común.** Comparar primera iteración cold con hot sin control. Corrección: warmup y JMH.

**Verificación (JDK 27, 2026-05-22).** Imprime resultados y tiempos; tiempos varían.

#### Dead Code Elimination (DCE)

**Definición formal.** Optimización donde la JVM elimina cómputo cuyo resultado no tiene efecto observable.

**Para qué sirve.** Rendimiento; pero arruina benchmarks mal escritos.

**Cuándo tenerlo en cuenta.** Al medir microbenchmarks.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t2-dce && cd /tmp/java-m14-t2-dce
```

```java
public class DemoDce {
    static int work(){ int s=0; for(int i=0;i<1_000_000;i++) s+=i; return s; }
    public static void main(String[] args){ long t1=System.nanoTime(); work(); long t2=System.nanoTime(); System.out.println((t2-t1)>=0); }
}
```

**Caso de uso real.** Benchmark que parece “demasiado rápido”.

**Error común.** Ignorar el resultado. Corrección: consumir resultado (`Blackhole` en JMH).

**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

#### JMH

**Definición formal.** Java Microbenchmark Harness, herramienta oficial para escribir microbenchmarks controlando warmup, forks, y consumo de resultados.

**Para qué sirve.** Medir micro-rendimiento con rigor.

**Cuándo usarlo.** Solo cuando un microbenchmark es necesario. Para sistemas, medir end-to-end.

**Ejemplo mínimo enfocado (ejecutable como dependencia/comando).**

```bash
# En un proyecto Maven con dependencia jmh-core/jmh-generator-annprocess
mvn -q -DskipTests package
java -jar target/benchmarks.jar
```

**Caso de uso real.** Comparar dos algoritmos de serialización.

**Error común.** Usar `System.nanoTime` casero. Corrección: JMH.

**Verificación.** JMH genera reporte; **nota**: requiere proyecto con dependencias JMH.

### Tema 3: Deserializar es permitir construcción y comportamiento · Avanzado · 45 min

Deserializar input no confiable puede crear objetos inválidos o explotar gadgets.

#### Deserialización segura

**Definición formal.** Reconstruir datos externos validando tipo, esquema e invariantes antes de confiar en ellos.

**Para qué sirve.** Evita objetos inválidos y reduce superficie de ataque.

**Cuándo usarlo.** Toda entrada externa: JSON, CSV, mensajes, sockets.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t3-sec && cd /tmp/java-m14-t3-sec
```

```java
record Guia(String id, int pesoKg) {
    static Guia parse(String csv){
        var p=csv.split(","); if(p.length!=2) throw new IllegalArgumentException("formato");
        String id=p[0].trim(); int peso=Integer.parseInt(p[1].trim());
        if(id.isBlank()||peso<=0) throw new IllegalArgumentException("invalido");
        return new Guia(id,peso);
    }
}
public class DemoSec { public static void main(String[] args){ System.out.println(Guia.parse("G-1,2")); } }
```

**Caso de uso real.** Validar payload antes de usarlo.

**Error común.** Deserializar Java nativo desde fuentes no confiables. Corrección: formatos de datos (JSON) con allowlist y validación.

**Verificación (JDK 27, 2026-05-22).** Salida: `Guia[id=G-1, pesoKg=2]`.

#### Superficie de ataque y contrato de datos

**Definición formal.** Superficie de ataque son tipos/operaciones alcanzables durante parseo; contrato de datos es el esquema esperado.

**Para qué sirve.** Minimizar riesgo y rechazar input inesperado.

**Cuándo usarlo.** Fronteras de sistema.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t3-attack && cd /tmp/java-m14-t3-attack
```

```java
public class DemoAttack {
    static int parsePeso(String s){ int p=Integer.parseInt(s); if(p<=0) throw new IllegalArgumentException("peso"); return p; }
    public static void main(String[] args){ try { parsePeso("-1"); } catch(Exception e){ System.out.println("rechazado"); } }
}
```

**Caso de uso real.** Rechazar tipo/campo inesperado en JSON.

**Error común.** Aceptar “lo que venga”. Corrección: allowlist y validación.

**Verificación (JDK 27, 2026-05-22).** Salida: `rechazado`.

### Tema 4: El runtime es parte del artefacto y necesita ciclo de vida · Avanzado · 45 min

La app funciona local pero falla en contenedor por JRE distinto.

#### Runtime como artefacto

**Definición formal.** El JDK/JRE/runtime image usado para ejecutar es parte del entregable y debe versionarse y probarse.

**Para qué sirve.** Evita divergencias “en mi máquina”.

**Cuándo usarlo.** CI/CD, contenedores, jlink.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t4-rt && cd /tmp/java-m14-t4-rt
```

```java
public class DemoRt { public static void main(String[] args){ System.out.println(System.getProperty("java.version")); } }
```

**Caso de uso real.** Fijar imagen base JDK en Dockerfile.

**Error común.** Usar runtime del host. Corrección: fijar versión en CI/contenedor.

**Verificación (JDK 27, 2026-05-22).** Imprime la versión del JDK (ej. `27...`).

#### Ciclo de vida y compatibilidad

**Definición formal.** Planificar upgrades, parches, EOL y rollback del runtime junto con app y dependencias.

**Para qué sirve.** Operación segura.

**Cuándo usarlo.** Antes de entrar a producción y en mantenimiento.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
java -version
```

**Caso de uso real.** Migrar de 17 a 21 o 25 LTS.

**Error común.** Runtime EOL sin plan. Corrección: política de upgrade.

**Verificación (2026-05-22).** `java -version` muestra runtime instalado.

### Tema 5: Arranque más rápido: archivos CDS y la caché AOT · Avanzado · 40 min

Una CLI arranca lento; CDS/AppCDS puede reducir startup.

#### CDS/AppCDS

**Definición formal.** Class Data Sharing permite compartir metadata de clases preprocesada en un archive; AppCDS extiende a clases de aplicación.

**Para qué sirve.** Mejorar tiempo de arranque.

**Cuándo usarlo.** CLIs, serverless, procesos de vida corta. Medir antes/después.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t5-cds && cd /tmp/java-m14-t5-cds
```

```java
public class App { public static void main(String[] args){ System.out.println("hola"); } }
```

```bash
javac App.java && jar cf app.jar App.class
java -Xshare:dump -XX:SharedArchiveFile=app.jsa -cp app.jar App
java -XX:SharedArchiveFile=app.jsa -cp app.jar App
```

**Caso de uso real.** Acelerar arranque de herramientas CLI.

**Error común.** Archive incompatible con classpath/JDK. Corrección: regenerar con mismo runtime y classpath.

**Verificación (JDK 27, 2026-05-22).** Ambas ejecuciones imprimen `hola`. **Nota:** flags pueden variar por JDK.

#### Caché AOT

**Definición formal.** Artefactos de compilación/caché ahead-of-time que pueden acelerar arranque según capacidades del JDK.

**Para qué sirve.** Reducir warmup/startup en escenarios soportados.

**Cuándo usarlo.** Cuando el JDK objetivo lo soporte y la mejora sea medible.

**Ejemplo mínimo enfocado (ejecutable como verificación de versión).**

```bash
java -XX:+UnlockDiagnosticVMOptions -XX:+PrintFlagsFinal -version | head -1
```

**Caso de uso real.** Optimización de arranque en servicios.

**Error común.** Confundir con GraalVM native image. Corrección: verificar tecnología y límites.

**Verificación.** Validar flags disponibles en el JDK en uso; **nota** de compatibilidad por versión.

### Tema 6: Migrar entre versiones LTS: de 17 a 21 y 25 con jdeprscan y jdeps · Avanzado · 45 min

Migras de 17 a 21/25 y necesitas detectar APIs removidas y dependencias internas.

#### Migración LTS

**Definición formal.** Proceso planificado de mover app/deps/build/runtime a una versión LTS soportada.

**Para qué sirve.** Seguridad, soporte y acceso a mejoras del lenguaje/plataforma.

**Cuándo usarlo.** Antes del EOL o por requisitos de plataforma.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
java -version
javac -version
```

**Caso de uso real.** 17 → 21 → 25.

**Error común.** Saltar sin tests. Corrección: matriz de CI y pruebas de regresión.

**Verificación (2026-05-22).** JDK 27 instalado.

#### `jdeprscan` y `jdeps`

**Definición formal.** `jdeprscan` analiza uso de APIs deprecated/for removal; `jdeps` analiza dependencias de clases/paquetes/módulos.

**Para qué sirve.** Detectar riesgos de migración y uso de APIs internas.

**Cuándo usarlo.** Antes y durante la migración.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m14-t6 && cd /tmp/java-m14-t6
cat > App.java << 'JAVA'
public class App { public static void main(String[] args){ System.out.println("ok"); } }
JAVA
javac App.java && jar cf app.jar App.class
jdeprscan app.jar || true
jdeps -summary app.jar
```

**Caso de uso real.** Detectar dependencia a `sun.*` o API removida.

**Error común.** Ignorar warnings. Corrección: remediar antes del upgrade.

**Verificación (JDK 27, 2026-05-22).** `jdeps -summary` muestra dependencias; `jdeprscan` puede no reportar elementos para este jar simple.

## Cierre del módulo

Producción exige evidencia: visibilidad correcta, benchmarks fiables, deserialización defensiva, runtime controlado y migraciones planificadas.
