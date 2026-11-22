# Módulo 13: Proyecto integrador

Este módulo cierra la base de Java reuniendo lo aprendido: modelado con objetos/records, manejo de errores, concurrencia, tests y build reproducible. El objetivo no es “usar todo”, sino integrar piezas con límites claros y evidencia de que funcionan.

**Entorno de referencia verificado (2026-05-22):** JDK 27.

## Aprende construyendo

### Tema 1: Arquitectura por capas del proyecto integrador · Intermedio · 40 min

El proyecto crece y el código se mezcla: validación, lógica, persistencia y presentación en una sola clase. Necesitas capas con responsabilidades claras.

#### Arquitectura por capas

**Definición formal.** Organización del código en capas con responsabilidades y dependencias controladas (presentación, aplicación/servicio, dominio, infraestructura).

**Para qué sirve.** Separación de concerns, mantenibilidad y testabilidad.

**Cuándo usarlo y cuándo no.** Úsalo cuando la lógica no es trivial. No fuerces muchas capas en scripts pequeños.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m13-t1-layers && cd /tmp/java-m13-t1-layers
```

```java
interface Repo { void save(String id); }
class InMemoryRepo implements Repo { java.util.List<String> ids=new java.util.ArrayList<>(); public void save(String id){ ids.add(id); } }
class Service { private final Repo repo; Service(Repo repo){this.repo=repo;} void crear(String id){ if(id.isBlank()) throw new IllegalArgumentException("id"); repo.save(id); } }
public class DemoLayers { public static void main(String[] args){ InMemoryRepo r=new InMemoryRepo(); new Service(r).crear("G1"); System.out.println(r.ids); } }
```

**Caso de uso real.** API REST con servicio y repositorio.

**Error común.** Saltar capas y poner SQL en el controlador. Corrección: dependencias hacia adentro/abstracciones.

**Verificación (JDK 27, 2026-05-22).** Salida: `[G1]`.

#### Capa dominio/servicio

**Definición formal.** Capa donde viven reglas de negocio e invariantes, u orquestación de casos de uso.

**Para qué sirve.** Protege reglas del negocio independientemente de la infraestructura.

**Cuándo usarlo.** Lógica central y validaciones de dominio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m13-t1-domain && cd /tmp/java-m13-t1-domain
```

```java
class Servicio { String crear(String id){ if(id==null||id.isBlank()) throw new IllegalArgumentException("id"); return "OK:"+id; } }
public class DemoDomain { public static void main(String[] args){ System.out.println(new Servicio().crear("G1")); } }
```

**Caso de uso real.** Validar capacidad, estado, transición.

**Error común.** Poner HTTP/JDBC en dominio. Corrección: puertos/interfaces.

**Verificación (JDK 27, 2026-05-22).** Salida: `OK:G1`.

#### Capa infraestructura

**Definición formal.** Capa de detalles técnicos: BD, archivos, HTTP, colas, frameworks.

**Para qué sirve.** Aisla el cambio técnico.

**Cuándo usarlo.** Implementaciones concretas de interfaces.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m13-t1-infra && cd /tmp/java-m13-t1-infra
```

```java
interface Repo { void save(String id); }
class FileLikeRepo implements Repo { public void save(String id){ System.out.println("saved:"+id); } }
public class DemoInfra { public static void main(String[] args){ new FileLikeRepo().save("G1"); } }
```

**Caso de uso real.** Implementación JDBC/JPA de repositorio.

**Error común.** Fugar detalles infra al dominio. Corrección: invertir dependencia.

**Verificación (JDK 27, 2026-05-22).** Salida: `saved:G1`.

#### Ejemplo integrado desde cero

```bash
mkdir -p /tmp/java-m13-t1 && cd /tmp/java-m13-t1
mkdir -p src/com/academia/domain src/com/academia/app src/com/academia/infra
```

`src/com/academia/domain/GuiaRepo.java`:

```java
package com.academia.domain;
public interface GuiaRepo { void guardar(String id); }
```

`src/com/academia/app/GuiaService.java`:

```java
package com.academia.app;
import com.academia.domain.GuiaRepo;
public class GuiaService {
    private final GuiaRepo repo;
    public GuiaService(GuiaRepo repo){ this.repo=repo; }
    public void crear(String id){ if(id==null||id.isBlank()) throw new IllegalArgumentException("id"); repo.guardar(id); }
}
```

`src/com/academia/infra/InMemoryGuiaRepo.java`:

```java
package com.academia.infra;
import com.academia.domain.GuiaRepo; import java.util.*;
public class InMemoryGuiaRepo implements GuiaRepo { public final List<String> ids=new ArrayList<>(); public void guardar(String id){ ids.add(id); } }
```

`src/com/academia/app/Main.java`:

```java
package com.academia.app;
import com.academia.infra.InMemoryGuiaRepo;
public class Main { public static void main(String[] args){ var repo=new InMemoryGuiaRepo(); new GuiaService(repo).crear("G-1"); System.out.println(repo.ids); } }
```

**Verificación (JDK 27, 2026-05-22).**

```bash
javac -d out $(find src -name "*.java")
java -cp out com.academia.app.Main
```

```text
[G-1]
```

### Tema 2: Build reproducible y cierre del track · Intermedio · 40 min

“En mi máquina compila” no sirve. Necesitas build repetible con versiones fijadas y comandos claros.

#### Build reproducible

**Definición formal.** Propiedad de producir el mismo artefacto/comportamiento a partir de mismos inputs, versiones y entorno controlado.

**Para qué sirve.** CI confiable y releases trazables.

**Cuándo usarlo.** Siempre.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m13-t2-build/src/main/java/com/academia && cd /tmp/java-m13-t2-build
```

`pom.xml`:

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion><groupId>com.academia</groupId><artifactId>build-demo</artifactId><version>1.0.0</version>
  <properties><maven.compiler.release>21</maven.compiler.release><project.build.sourceEncoding>UTF-8</project.build.sourceEncoding></properties>
</project>
```

`src/main/java/com/academia/App.java`:

```java
package com.academia;
public class App { public static void main(String[] args){ System.out.println("BUILD OK"); } }
```

**Caso de uso real.** CI ejecuta mismo comando que local.

**Error común.** Versiones flotantes. Corrección: fijar versiones y wrapper.

**Verificación (Maven 3.10.0, JDK 27, 2026-05-22).**

```bash
mvn -q -DskipTests package
java -cp target/build-demo-1.0.0.jar com.academia.App
```

```text
BUILD OK
```

#### Versionado, fijación y empaquetado

**Definición formal.** Fijar versiones de JDK/deps/plugins y generar artefacto distribuible (JAR/WAR).

**Para qué sirve.** Estabilidad y distribución.

**Cuándo usarlo.** En todo proyecto compartido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mvn -q -DskipTests package
ls target/*.jar
```

**Caso de uso real.** Artefacto publicado a repositorio interno.

**Error común.** No fijar encoding/release. Corrección: propiedades explícitas.

**Verificación.** Se genera `target/build-demo-1.0.0.jar`.

#### Cierre del track

**Definición formal.** Checklist final: compila, testea, ejecuta, documenta y tiene evidencia.

**Para qué sirve.** Evitar “funciona en mi máquina”.

**Cuándo usarlo.** Al cerrar módulo o proyecto.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mvn -q test
```

**Caso de uso real.** Gate de CI antes de merge.

**Error común.** Cerrar sin ejecutar verificación. Corrección: comandos y salidas observadas.

**Verificación.** Tests/build pasan con salida clara.

### Tema 3: Integrando concurrencia, modelado y testing · Avanzado · 45 min

El servicio procesa guías concurrentemente. Debes mantener invariantes de dominio y probar comportamiento.

#### Integración concurrencia + dominio

**Definición formal.** Aplicar reglas de negocio correctamente bajo ejecución concurrente, protegiendo invariantes en el punto de mutación.

**Para qué sirve.** Evita race conditions que rompen reglas de negocio.

**Cuándo usarlo.** Servicios multi-hilo/async con estado compartido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m13-t3-conc && cd /tmp/java-m13-t3-conc
```

```java
import java.util.concurrent.atomic.AtomicInteger;
class Capacidad {
    private final AtomicInteger usados = new AtomicInteger();
    private final int max;
    Capacidad(int max){ this.max=max; }
    boolean reservar(){ while(true){ int c=usados.get(); if(c>=max) return false; if(usados.compareAndSet(c,c+1)) return true; } }
    int get(){ return usados.get(); }
}
public class DemoConc { public static void main(String[] args){ Capacidad c=new Capacidad(1); System.out.println(c.reservar()); System.out.println(c.reservar()); } }
```

**Caso de uso real.** Limitar cupos o stock concurrente.

**Error común.** Check-then-act no atómico. Corrección: CAS/lock/invariante atómica.

**Verificación (JDK 27, 2026-05-22).** Salida: `true` y `false`.

#### Modelado de invariantes

**Definición formal.** Reglas que siempre deben cumplirse en el dominio, independientemente de la entrada o concurrencia.

**Para qué sirve.** Consistencia.

**Cuándo usarlo.** Agregados, servicios, constructores.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m13-t3-inv && cd /tmp/java-m13-t3-inv
```

```java
record Guia(String id) { Guia { if(id==null||id.isBlank()) throw new IllegalArgumentException("id"); } }
public class DemoInv { public static void main(String[] args){ System.out.println(new Guia("G1").id()); } }
```

**Caso de uso real.** No permitir entidad inválida.

**Error común.** Invariante solo en UI. Corrección: en dominio/constructor.

**Verificación (JDK 27, 2026-05-22).** Salida: `G1`.

#### Testing concurrente

**Definición formal.** Pruebas que ejercitan contención/interleaving y afirman invariantes finales o propiedades deterministas.

**Para qué sirve.** Detectar races.

**Cuándo usarlo.** Código concurrente o con estado compartido.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/java-m13-t3-test && cd /tmp/java-m13-t3-test
```

```java
import java.util.concurrent.*; import java.util.concurrent.atomic.AtomicInteger;
public class DemoTestConc {
    public static void main(String[] args) throws Exception {
        AtomicInteger ok = new AtomicInteger();
        ExecutorService ex = Executors.newFixedThreadPool(4);
        CountDownLatch latch = new CountDownLatch(10);
        for(int i=0;i<10;i++) ex.submit(() -> { ok.incrementAndGet(); latch.countDown(); });
        latch.await(2, TimeUnit.SECONDS); ex.shutdown();
        System.out.println(ok.get());
    }
}
```

**Caso de uso real.** Asegurar que no se sobrepasa capacidad.

**Error común.** Test no determinista por orden. Corrección: afirmar estado final/propiedad.

**Verificación (JDK 27, 2026-05-22).** Salida: `10`.

## Cierre del módulo

Cerraste el ciclo base de Java: modelado, arquitectura por capas, build reproducible e integración con concurrencia y testing. Desde aquí, los módulos avanzados aplican este criterio a producción, backend, persistencia y operación.
