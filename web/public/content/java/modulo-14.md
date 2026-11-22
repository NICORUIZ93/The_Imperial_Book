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

**Caso guía**

Un hilo reserva inventario y otro lo lee. Sin sincronización, el segundo puede ver estado parcialmente actualizado o no ver la actualización. El bug no aparece siempre.

**Fundamento técnico y modelo mental**

**Definición formal.** El *Java Memory Model* (JMM) define qué valores puede observar una lectura de memoria compartida. Una relación *happens-before* entre acciones garantiza visibilidad y ordenamiento de efectos para esas acciones. La *publicación segura* es hacer visible un objeto a otros hilos sin exponer estado incompletamente construido.

**Contrato / invariantes / reglas.** `synchronized`, `volatile`, inicio/fin de hilos, `final` correctamente publicados y utilidades concurrentes establecen happens-before según el JMM. `volatile` da visibilidad y ordenamiento, pero no atomicidad de operaciones compuestas como `count++`. El acceso no sincronizado a estado mutable compartido crea data races/condiciones de carrera. Los objetos inmutables correctamente publicados son seguros para compartir.

**Modelo mental.** Sin sincronización, cada hilo puede trabajar con una fotocopia vieja de la pizarra; happens-before es el protocolo que obliga a actualizar la pizarra antes de que otro la lea.

**Implementación desde cero**

```java
public class Inventario {
    private int disponibles;
    private int reservados;

    public Inventario(int disponibles) {
        this.disponibles = disponibles;
    }

    public synchronized boolean reservar() {
        if (disponibles <= 0) return false;
        disponibles--;
        reservados++;
        return true;
    }

    public synchronized int getDisponibles() { return disponibles; }
    public synchronized int getReservados() { return reservados; }
}

class DemoInventario {
    public static void main(String[] args) throws Exception {
        Inventario inv = new Inventario(1000);
        Thread t1 = new Thread(() -> { for (int i = 0; i < 500; i++) inv.reservar(); });
        Thread t2 = new Thread(() -> { for (int i = 0; i < 500; i++) inv.reservar(); });
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println(inv.getDisponibles());
        System.out.println(inv.getReservados());
    }
}
```

**Desglose del código**

- `synchronized` en `reservar` crea exclusión mutua y happens-before entre liberación y adquisición del monitor.
- El invariante `disponibles + reservados` se preserva bajo concurrencia.
- `join()` también establece happens-before: el main ve los efectos de los hilos terminados.
- Si quitas `synchronized`, el resultado puede ser inconsistente.

**Ejecución y salida real**

```bash
javac Inventario.java
java DemoInventario
```

```text
0
1000
```

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Estado inconsistente intermitente | Data race | Sincroniza o usa estructuras concurrentes |
| `volatile` no arregla `count++` | Operación compuesta no atómica | Usa `AtomicInteger` o lock |
| Deadlock | Orden de locks inconsistente | Define orden global y reduce sección crítica |

**Verificación rápida**

Ejecuta varias veces; con `synchronized` el resultado debe ser estable. Quita `synchronized` en un experimento y observa la posible inconsistencia.

### Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo · Avanzado · 45 min

**Caso guía**

Mides dos algoritmos con `System.nanoTime()` en un bucle simple y concluyes que uno es 10x más rápido. Luego en producción no ves la diferencia. El benchmark estaba mal.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *microbenchmark* es una medición de un fragmento pequeño de código. El JIT puede aplicar inlining, dead-code elimination, constant folding y otras optimizaciones que invalidan mediciones ingenuas. JMH (Java Microbenchmark Harness) es la herramienta estándar para microbenchmarks en la JVM.

**Contrato / invariantes / reglas.** Un resultado de benchmark solo es válido si el trabajo medido no es eliminado por el optimizador y si el entorno de medición controla warm-up, GC, forking y estado. `Blackhole.consume`/retorno de valor evita eliminación de código muerto. `System.nanoTime()` mide tiempo de pared de alta resolución, no tiempo CPU aislado; su uso aislado no corrige sesgos de JIT. Comparar algoritmos requiere misma entrada, misma máquina, warm-up y repetición.

**Modelo mental.** Medir con un cronómetro ingenuo es cronometrar a un corredor mientras el juez le permite tomar atajos invisibles. JMH pone reglas al circuito.

**Implementación desde cero**

Ejemplo conceptual con JMH (requiere dependencias `org.openjdk.jmh:jmh-core` y `jmh-generator-annprocess`):

```java
import org.openjdk.jmh.annotations.*;
import org.openjdk.jmh.infra.Blackhole;
import java.util.concurrent.TimeUnit;

@BenchmarkMode(Mode.AverageTime)
@OutputTimeUnit(TimeUnit.NANOSECONDS)
@State(Scope.Thread)
class SumaBenchmark {
    private int n = 1000;

    @Benchmark
    public void loop(Blackhole bh) {
        long s = 0;
        for (int i = 0; i < n; i++) s += i;
        bh.consume(s);
    }
}
```

Ejemplo ilustrativo de cronómetro ingenuo (no usar para conclusiones):

```java
public class CronometroIngenuo {
    public static void main(String[] args) {
        long t1 = System.nanoTime();
        long s = 0;
        for (int i = 0; i < 1_000_000; i++) s += i;
        long t2 = System.nanoTime();
        System.out.println("suma=" + s);
        System.out.println("ns=" + (t2 - t1));
    }
}
```

**Desglose del código**

- `@BenchmarkMode` y `@OutputTimeUnit` declaran qué se mide.
- `Blackhole.consume` evita que el JIT elimine el cálculo.
- El cronómetro ingenuo no controla warm-up ni optimizaciones; sirve solo como demostración de riesgo.
- JMH ejecuta forks, warm-up e iteraciones para estabilizar mediciones.

**Ejecución y salida real**

Cronómetro ingenuo (compilable sin dependencias externas):

```bash
javac CronometroIngenuo.java
java CronometroIngenuo
```

```text
suma=499999500000
ns=1234567
```

El tiempo varía; no lo uses como evidencia de rendimiento comparativo.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Benchmark “demasiado rápido” | JIT eliminó trabajo muerto | Usa JMH y `Blackhole` |
| Resultados inestables | Sin warm-up/forks | Usa JMH con configuración adecuada |
| Conclusión desde una corrida | Ruido de sistema | Repite, controla entorno, reporta distribución |

**Verificación rápida**

```bash
javac CronometroIngenuo.java && java CronometroIngenuo
```

Ejecuta varias veces: verás variación. Para decisiones reales, migra la medición a JMH.

### Tema 3: Deserializar es permitir construcción y comportamiento · Avanzado · 45 min

**Caso guía**

Tu servicio recibe JSON. Si aceptas cualquier estructura o usas deserialización Java nativa sobre datos no confiables, puedes terminar instanciando tipos inesperados o aceptando estado inválido.

**Fundamento técnico y modelo mental**

**Definición formal.** La *deserialización* es reconstruir objetos desde una representación externa. En contextos no confiables, es una frontera de seguridad: el input puede forzar construcción, asignación de estado o, en mecanismos vulnerables, ejecución de gadget chains.

**Contrato / invariantes / reglas.** Nunca deserializar datos no confiables con Java serialization nativa sin controles estrictos; la recomendación moderna es evitarla. Con Jackson/JSON, restringir esquema, validar tipos, deshabilitar características peligrosas, y no habilitar polimorfismo por defecto (`default typing`) en entradas no confiables. Los DTO/records deben validar invariantes tras deserializar. Un objeto deserializado no es confiable por “haber sido parseado”.

**Modelo mental.** Deserializar es dejar entrar a alguien con un formulario: aceptar el formulario no significa que el contenido sea verdadero ni seguro.

**Implementación desde cero**

Ejemplo con Jackson (requiere `jackson-databind`):

```java
import com.fasterxml.jackson.databind.*;

class EntradaJson {
    record Registro(String guia, String estado) {
        Registro {
            if (guia == null || guia.isBlank()) throw new IllegalArgumentException("guia requerida");
            if (estado == null || estado.isBlank()) throw new IllegalArgumentException("estado requerido");
        }
    }

    public static void main(String[] args) throws Exception {
        ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);
        Registro r = mapper.readValue("{\"guia\":\"G-1\",\"estado\":\"OK\"}", Registro.class);
        System.out.println(r.guia());
        System.out.println(r.estado());
    }
}
```

**Desglose del código**

- El record valida invariantes en el constructor compacto: el parseo no es suficiente.
- `FAIL_ON_UNKNOWN_PROPERTIES` endurece el esquema para entradas inesperadas.
- El tipo destino es explícito (`Registro.class`); evita mapeos polimórficos abiertos.
- La validación de negocio debe ocurrir después o durante la construcción.

**Ejecución y salida real**

Con Jackson en classpath:

```text
G-1
OK
```

Si llega `{"guia":"G-1","estado":"OK","extra":1}`, falla por propiedad desconocida.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| Aceptas datos basura | Sin validación post-deserialización | Valida invariantes en el DTO/record |
| Vulnerabilidad por deserialización Java | `ObjectInputStream` con datos no confiables | Evita Java serialization en fronteras no confiables |
| Polimorfismo inseguro en JSON | Default typing habilitado | Usa tipos explícitos y allowlists |

**Verificación rápida**

Prueba un JSON con campo faltante o extra y verifica que se rechaza.

### Tema 4: El runtime es parte del artefacto y necesita ciclo de vida · Avanzado · 45 min

**Caso guía**

Tu app funciona con un JDK completo instalado en la máquina. En despliegue, quieres un runtime más pequeño y controlado, y saber qué módulos necesita realmente.

**Fundamento técnico y modelo mental**

**Definición formal.** Un *runtime image* personalizada es una distribución de JVM construida con `jlink` que incluye solo módulos requeridos. `jdeps` analiza dependencias de clases/JARs y puede sugerir módulos. El *ciclo de vida* del runtime incluye construcción, verificación, despliegue, observabilidad y actualización.

**Contrato / invariantes / reglas.** `jlink` trabaja con módulos (JPMS). La lista de módulos debe cubrir dependencias reales y servicios usados por reflexión/carga dinámica. Un runtime mínimo reduce superficie y tamaño, pero puede romper si faltan módulos dinámicos. La imagen se reconstruye ante actualizaciones de JDK o cambios de dependencia. Observabilidad (logs, métricas, JFR) debe planearse como parte del artefacto operativo.

**Modelo mental.** Entregar un JDK completo es enviar todo el taller; `jlink` es armar una caja de herramientas con solo lo necesario para ese trabajo.

**Implementación desde cero**

```bash
# Analizar dependencias de módulos
jdeps --print-module-deps --ignore-missing-deps app.jar

# Crear runtime mínimo (ejemplo)
jlink --add-modules java.base,java.logging \
      --output runtime-min \
      --strip-debug --no-header-files --no-man-pages

# Ejecutar con el runtime generado
./runtime-min/bin/java -version
```

**Desglose del código**

- `jdeps --print-module-deps` sugiere módulos para un artefacto.
- `jlink` genera la imagen con módulos seleccionados.
- `--strip-debug --no-header-files --no-man-pages` reduce tamaño.
- El runtime generado debe probarse como artefacto, no asumirse correcto.

**Ejecución y salida real**

`./runtime-min/bin/java -version` debe mostrar la versión del JDK usado para construir la imagen.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| `Module not found` en runtime generado | Faltó un módulo | Ajusta `--add-modules` según `jdeps` y pruebas |
| Imagen funciona en pruebas pero falla en prod | Dependencia dinámica no detectada | Prueba escenarios reales; agrega módulos/servicios |
| Nunca actualizas runtime | Riesgo de seguridad | Incluye actualización de imagen en el ciclo de release |

**Verificación rápida**

Construye una imagen mínima con `java.base` y verifica `java -version` desde `./runtime-min/bin/java`.

### Tema 5: Arranque más rápido: archivos CDS y la caché AOT · Avanzado · 40 min

**Caso guía**

Tu servicio arranca lento en escalado automático. Parte del costo es carga/enlace de clases y warm-up. CDS/AOT cache pueden reducir ese tiempo de arranque en escenarios adecuados.

**Fundamento técnico y modelo mental**

**Definición formal.** *Class Data Sharing (CDS)* permite almacenar metadatos de clases preprocesadas para acelerar arranque. La *AOT cache* (Java moderno, evolutiva según versión) extiende la idea almacenando artefactos precomputados para mejorar startup/warm-up. Son optimizaciones de arranque, no cambios de semántica del programa.

**Contrato / invariantes / reglas.** La caché debe generarse con la misma configuración relevante (JDK, classpath/module path, opciones) que la ejecución. Si cambia el classpath/JDK, la caché puede invalidarse o no usarse. La mejora depende del tipo de app; no garantiza beneficio en todos los casos. Medir antes/después con el mismo escenario es obligatorio.

**Modelo mental.** CDS/AOT cache es dejar parte del trabajo de preparación hecho antes de abrir la tienda, no cambiar el producto que vendes.

**Implementación desde cero**

Ejemplo CDS clásico (AppCDS, depende de versión/configuración):

```bash
# 1. Crear lista de clases
java -Xshare:off -XX:DumpLoadedClassList=app.classlist -jar app.jar --dry-run

# 2. Crear archivo compartido
java -Xshare:dump -XX:SharedClassListFile=app.classlist -XX:SharedArchiveFile=app.jsa -jar app.jar

# 3. Ejecutar usando el archivo
java -Xshare:on -XX:SharedArchiveFile=app.jsa -jar app.jar
```

**Desglose del código**

- El primer paso observa qué clases se cargan.
- El segundo genera el archivo compartido.
- El tercero intenta usarlo al arrancar.
- Siempre compara tiempos de arranque antes y después.

**Ejecución y salida real**

La salida exacta depende de la app/JDK. Busca mensajes o métricas que indiquen uso de archivo compartido y compara startup.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| No hay mejora | App no limitada por carga de clases | Mide; no fuerces CDS/AOT |
| Cache no se usa | JDK/classpath/opciones distintas | Regenera con la misma configuración |
| Asumes mejora en throughput | CDS/AOT apunta a arranque/warm-up | Mide el objetivo correcto |

**Verificación rápida**

Mide `time`/startup con y sin cache en el mismo entorno y compara.

### Tema 6: Migrar entre versiones LTS: de 17 a 21 y 25 con jdeprscan y jdeps · Avanzado · 45 min

**Caso guía**

Tu aplicación corre en Java 17 y quieres migrar a 21/25. No puedes “cambiar el número y rezar”: necesitas detectar APIs obsoletas, dependencias internas y problemas de módulos/reflexión.

**Fundamento técnico y modelo mental**

**Definición formal.** La migración entre LTS es el proceso controlado de actualizar runtime, compilador, dependencias y configuración para mantener compatibilidad funcional y operativa. `jdeprscan` detecta usos de APIs deprecated/removidas; `jdeps` analiza dependencias entre clases y módulos, incluyendo usos internos del JDK.

**Contrato / invariantes / reglas.** Migrar implica compilar, testear y ejecutar en el JDK objetivo; pasar compilación no garantiza ausencia de regresiones. Las APIs `forRemoval=true` son deuda prioritaria. Dependencias de `sun.*`/APIs internas son frágiles. El classpath/module path, flags de GC, y comportamiento de seguridad pueden cambiar entre versiones. La migración segura es incremental, con CI, pruebas y rollback.

**Modelo mental.** Cambiar de LTS es cambiar el motor y la normativa del vehículo: puede andar mejor, pero debes revisar compatibilidad pieza por pieza.

**Implementación desde cero**

```bash
# Compilar con target del JDK objetivo (ejemplo)
javac --release 21 -d out src/**/*.java

# Buscar deprecaciones relevantes
jdeprscan --release 21 --class-path out

# Analizar dependencias y uso de APIs internas
jdeps --jdk-internals --class-path out -R out
```

```java
import java.util.Date;

public class Legado {
    public static void main(String[] args) {
        Date fecha = new Date(); // API antigua: revisar si conviene migrar a java.time
        System.out.println(fecha.getTime());
    }
}
```

**Desglose del código**

- `javac --release 21` ayuda a detectar incompatibilidades de compilación/lenguaje/API objetivo.
- `jdeprscan` identifica uso de APIs obsoletas; prioriza `forRemoval`.
- `jdeps --jdk-internals` detecta dependencias a APIs internas del JDK.
- La migración termina en verde solo con pruebas funcionales, de integración y operativas.

**Ejecución y salida real**

```bash
javac Legado.java
jdeprscan --class-path . Legado
```

La salida de `jdeprscan` puede ser vacía si no hay usos deprecated en ese alcance; la evidencia importante es el reporte combinado con tests.

**Errores comunes y cómo resolverlos**

| Síntoma | Causa probable | Qué hacer |
|---|---|---|
| “Compila, luego falla en prod” | Diferencia de runtime/flags/deps | Ejecuta test suite completa en JDK objetivo |
| Dependencias rotas | Librería no compatible | Actualiza librerías antes/durante migración |
| Uso de APIs internas | Deuda técnica oculta | Reemplaza por APIs soportadas |

**Verificación rápida**

Ejecuta `javac --release 21`, `jdeprscan` y tu suite de tests sobre el JDK objetivo antes de promover la migración.

## Cierre del módulo

Producción exige evidencia: visibilidad de memoria correcta, benchmarks fiables, deserialización defensiva, runtime empaquetado y migraciones planificadas. Con estas bases, el siguiente módulo lleva Java al backend con Spring Boot.
