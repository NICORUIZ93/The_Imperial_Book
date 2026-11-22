# Módulo 13: Proyecto integrador

Este módulo cierra la base de Java reuniendo lo aprendido: modelado con objetos/records, manejo de errores, concurrencia, tests y build reproducible. El objetivo no es “usar todo”, sino integrar piezas con límites claros y evidencia de que funcionan.

## Mapa del módulo

| Tema | Qué vas a poder hacer al terminar |
|---|---|
| 1 | Diseñar una arquitectura por capas con responsabilidades claras |
| 2 | Configurar un build reproducible con wrapper y verificación |
| 3 | Integrar concurrencia, modelado de dominio y testing |

## Aprende construyendo

### Tema 1: Arquitectura por capas del proyecto integrador · Intermedio · 40 min

**Caso guía**

El proyecto crece y el código se mezcla: validación, lógica, persistencia y presentación en una sola clase. Necesitas capas con responsabilidades claras.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Arquitectura por capas** | Organización del código en capas con responsabilidades y dependencias controladas. | Separación de concerns, mantenibilidad. | Apps con lógica no trivial. | Capas que se saltan reglas. |
| **Capa dominio/servicio** | Reglas de negocio y orquestación. | Proteger invariantes. | Lógica central. | Poner SQL/HTTP en dominio. |
| **Capa infraestructura** | IO, BD, archivos, APIs externas. | Aislar detalles técnicos. | Persistencia/integraciones. | Fugar detalles de infra al dominio. |
| **Capa presentación/API** | Entrada/salida con usuario o clientes. | Adaptar requests/responses. | CLI, REST, UI. | Meter lógica de negocio aquí. |

**Contrato / invariantes / reglas.** Dependencias hacia adentro (o hacia abstracciones). Dominio define interfaces; infra las implementa (DIP). DTOs en bordes; entidades/dominio adentro. Tests por capa.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-13/src/com/academia/{domain,app,infra} && cd ~/academia-java/modulo-13
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
    private final GuiaRepo repo; public GuiaService(GuiaRepo repo){ this.repo=repo; }
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

**Ejecución y salida real**

```bash
javac -d out $(find src -name "*.java")
java -cp out com.academia.app.Main
```

```text
[G-1]
```

**Errores comunes**: lógica de negocio en infra, dependencia directa dominio→JDBC, saltar capas. **Verificación**: cambia `InMemoryGuiaRepo` por otra implementación sin tocar `GuiaService`.


### Tema 2: Build reproducible y cierre del track · Intermedio · 40 min

**Caso guía**

“En mi máquina compila” no sirve. Necesitas build repetible con versiones fijadas, comandos claros y salida esperada.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Build reproducible** | Mismo código+config produce mismo resultado. | CI confiable, releases. | Siempre. | Dependencias flotantes. |
| **Versionado/fijación** | Fijar versiones de JDK, deps, plugins. | Estabilidad. | pom/gradle/wrapper. | `LATEST`/`+`. |
| **Empaquetado** | Generar JAR/WAR/artefacto. | Distribución/ejecución. | `package`/`build`. | No incluir manifest/classpath necesario. |
| **Cierre del track** | Checklist de calidad: compila, testea, documenta, ejecuta. | Entregable real. | Fin de módulo/proyecto. | “Funciona” sin verificar. |

**Contrato / invariantes / reglas.** Usa wrapper, fija versiones, documenta comandos desde raíz. `mvn -q test`/`gradle test` en CI. Artefacto trazable. README/setup mínimo.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-13-build/src/main/java/com/academia && cd ~/academia-java/modulo-13-build
```

`pom.xml` mínimo (fija release 21 y versión):

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.academia</groupId><artifactId>build-demo</artifactId><version>1.0.0</version>
  <properties><maven.compiler.release>21</maven.compiler.release><project.build.sourceEncoding>UTF-8</project.build.sourceEncoding></properties>
</project>
```

`src/main/java/com/academia/App.java`:

```java
package com.academia;
public class App { public static void main(String[] args){ System.out.println("BUILD OK"); } }
```

**Ejecución y salida real**

```bash
mvn -q -DskipTests package
java -cp target/build-demo-1.0.0.jar com.academia.App
```

```text
BUILD OK
```

**Errores comunes**: versiones flotantes, depender de estado local, no documentar comandos. **Verificación**: ejecuta en carpeta limpia y confirma mismo resultado.


### Tema 3: Integrando concurrencia, modelado y testing · Avanzado · 45 min

**Caso guía**

El servicio procesa guías concurrentemente. Debes mantener invariantes de dominio y probar comportamiento bajo concurrencia.

**Fundamento técnico y modelo mental**

#### Cobertura por concepto (obligatoria)

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| **Integración concurrencia+dominio** | Aplicar reglas de negocio correctamente bajo ejecución concurrente. | Evitar race conditions en invariantes. | Servicios multi-hilo/async. | Validar fuera de sección crítica. |
| **Modelado de invariantes** | Reglas que siempre deben cumplirse (capacidad, unicidad). | Consistencia. | Agregados/servicios. | Invariantes solo en UI. |
| **Testing concurrente** | Pruebas que ejercitan interleaving/contención. | Detectar races. | Código concurrente. | Test “pasa una vez” como garantía. |
| **Primitivas seguras** | `Atomic*`, locks, colecciones concurrentes, confinamiento. | Proteger estado. | Estado compartido. | `synchronized` mal aplicado. |

**Contrato / invariantes / reglas.** Protege invariantes en el punto de mutación. Prefiere inmutabilidad/confinamiento. Tests concurrentes deben ser deterministas en aserción final (count, estado), no en orden. Usa timeouts.

**Implementación desde cero**

```bash
mkdir -p ~/academia-java/modulo-13-conc && cd ~/academia-java/modulo-13-conc
```

`ContadorSeguro.java`:

```java
import java.util.concurrent.atomic.AtomicInteger;
public class ContadorSeguro {
    private final AtomicInteger count = new AtomicInteger(0);
    private final int capacidad;
    public ContadorSeguro(int capacidad){ this.capacidad=capacidad; }
    public boolean reservar(){
        while(true){
            int c = count.get();
            if (c >= capacidad) return false;
            if (count.compareAndSet(c, c+1)) return true;
        }
    }
    public int get(){ return count.get(); }
}
```

`DemoConc.java`:

```java
import java.util.concurrent.*;
public class DemoConc {
    public static void main(String[] args) throws Exception {
        ContadorSeguro c = new ContadorSeguro(5);
        ExecutorService ex = Executors.newFixedThreadPool(4);
        CountDownLatch latch = new CountDownLatch(10);
        for(int i=0;i<10;i++) ex.submit(() -> { c.reservar(); latch.countDown(); });
        latch.await(); ex.shutdown();
        System.out.println(c.get());
    }
}
```

**Ejecución y salida real**

```bash
javac ContadorSeguro.java DemoConc.java
java DemoConc
```

```text
5
```

**Errores comunes**: check-then-act no atómico, tests no deterministas, deadlocks. **Verificación**: ejecuta varias veces; resultado siempre 5.


## Cierre del módulo

Has cerrado el ciclo base de Java: modelado, arquitectura por capas, build reproducible e integración con concurrencia y testing. Desde aquí, los siguientes módulos aplican este criterio a diseño de sistemas, Spring Boot, persistencia, seguridad y operación en producción.
