# Módulo 23: Spring Modulith y límites del monolito modular

## Aprende construyendo

Este módulo convierte el paquete Java en una frontera de negocio verificable. Trabajarás con Spring Boot 4.0.9, Java 21 y Spring Modulith 2.0.8. Usa Maven 3.6.3 o superior; las versiones pueden cambiar, así que contrasta el BOM y la matriz del proyecto antes de actualizar. Spring Modulith ayuda a ordenar una aplicación; no convierte por sí solo un monolito en microservicios.

---

### Tema 1: módulos y límites entre paquetes

#### Paso 1 · Objetivo y preparación
Al finalizar separarás `orders`, `inventory` y `shipping` por responsabilidades, y harás fallar el build cuando un módulo viole las dependencias permitidas. **Prerrequisitos:** paquetes Java, inyección de dependencias, JUnit y el Módulo 22 (arquitectura). Comprueba `java -version` y `mvn -version`.

**Ejemplo independiente:** crea una carpeta vacía y descarga un proyecto base con `curl -G 'https://start.spring.io/starter.zip' --data-urlencode 'type=maven-project' --data-urlencode 'language=java' --data-urlencode 'bootVersion=4.0.9' --data-urlencode 'javaVersion=21' --data-urlencode 'groupId=dev.rutaflow' --data-urlencode 'artifactId=modulith-lab' --data-urlencode 'name=modulith-lab' --data-urlencode 'dependencies=web,test' -o modulith-lab.zip`; ejecuta `unzip modulith-lab.zip -d modulith-lab && cd modulith-lab`.

#### Paso 2 · Contexto y caso real
El pedido crea una reserva de inventario y, después, una solicitud de envío. Si `orders` importa clases privadas de `inventory`, un refactor interno puede romper consumidores sin que el contrato lo advierta. En RutaFlow los equipos necesitan cambiar cada capacidad sin buscar dependencias ocultas por todo el repositorio.

#### ¿Por qué es importante?
Separar paquetes visualmente no basta. La prueba de arquitectura hace que una dependencia prohibida sea un error repetible del build, antes de llegar al despliegue.

#### Paso 3 · Teoría, modelo mental y analogía
Spring Modulith detecta módulos de aplicación en subpaquetes directos del paquete raíz. Un módulo puede publicar interfaces/servicios en su API pública y conservar implementación en paquetes internos. `ApplicationModules.verify()` verifica ciclos y accesos a internals. Como en un edificio, una puerta marcada “público” es el acceso permitido; pasar por una pared interna crea acoplamiento.

#### Paso 4 · Demostración guiada desde cero
En `pom.xml`, agrega al `dependencyManagement` el BOM y dependencia de test. Mantén el parent `spring-boot-starter-parent` 4.0.9. Crea `src/main/java/dev/rutaflow/ShippingApplication.java`:

```xml
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.modulith</groupId>
      <artifactId>spring-modulith-bom</artifactId>
      <version>2.0.8</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>
<dependencies>
  <dependency>
    <groupId>org.springframework.modulith</groupId>
    <artifactId>spring-modulith-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

```java
package dev.rutaflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ShippingApplication {
    public static void main(String[] args) {
        SpringApplication.run(ShippingApplication.class, args);
    }
}
```

Ubica `orders`, `inventory` y `shipping` como subpaquetes de `dev.rutaflow`. Crea `src/test/java/dev/rutaflow/ModuleBoundariesTest.java`:

```java
package dev.rutaflow;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModuleBoundariesTest {
    @Test
    void modulesHaveNoCyclesAndUsePublicApis() {
        ApplicationModules.of(ShippingApplication.class).verify();
    }
}
```

Ejecuta `./mvnw test` (o `mvn test` si aún no tienes wrapper). Observa el resumen JUnit y la ausencia de violaciones; el wrapper conserva la versión de Maven para otros equipos.

#### Paso 5 · Práctica guiada
Añade en `orders` una llamada a `inventory.internal.StockTable`. **Pista:** la prueba informa qué paquete no pertenece a la API de ese módulo; mueve el contrato a la raíz pública de `inventory` o sustituye el acceso por un evento/servicio expuesto.

#### Paso 6 · Práctica independiente
Agrega un ciclo `orders -> inventory -> shipping -> orders` en el código de prueba; registra la cadena detectada y corrige una sola dependencia para volver a un grafo acíclico. No hagas público un paquete solo para silenciar la regla.

#### Paso 7 · Cierre y evidencia
Entrega el árbol de paquetes, prueba verde y salida de una violación deliberada corregida. El siguiente tema pasa de la relación directa a comunicar cambios con eventos del dominio.

**Fallo deliberado:** crea deliberadamente un ciclo de dependencias entre dos módulos y ejecuta el test; diagnostica el informe y elimina el acoplamiento mínimo necesario.

```bash
./mvnw test
```

**Resultado esperado:** el build termina `BUILD SUCCESS` sin dependencias internas y falla con un ciclo real. **Errores comunes:** creer que todo subpaquete es automáticamente API pública, permitir una dependencia solo para hacer pasar el test y leer una estructura verificada como prueba de calidad de negocio. Diagrama: `orders -> API inventory`; ningún arco regresa a orders. Fuente oficial: [verificación de estructura](https://docs.spring.io/spring-modulith/reference/verification.html).

**Proyecto propio:** carpeta `modulith-lab`. **Cuándo extraer un microservicio:** cuando haya motivo operativo/equipo/datos claro, no solo porque los paquetes ya estén ordenados. Evidencia de aprendizaje: entrega la salida positiva y negativa del test de arquitectura.

---

### Tema 2: eventos entre módulos sin importar implementación

#### Paso 1 · Objetivo y preparación
Al finalizar un cambio de pedido publicará `OrderPlaced` y `shipping` lo atenderá sin recibir una referencia a `OrderService`. **Prerrequisitos:** Tema 1, records Java y eventos Spring. Continúa en `modulith-lab` y agrega dependencia de Spring Modulith test/runtime mediante el BOM.

**Ejemplo independiente:** crea carpeta vacía `modulith-events-lab`, genera un proyecto Spring Boot 4.0.9/Java 21 con `web,test` desde Spring Initializr y aplica únicamente los archivos de esta lección; ejecuta `./mvnw test`.

#### Paso 2 · Contexto y caso real
Al confirmar un pedido, el módulo de envíos debe pedir una etiqueta. Una llamada directa permite que `orders` conozca cómo arranca `shipping`; un evento expresa qué pasó y deja que el suscriptor decida qué hacer.

#### ¿Por qué es importante?
Un evento desacopla el lenguaje de negocio y el momento del efecto. En un monolito el evento sigue ejecutándose dentro de la misma aplicación y comparte proceso; no tiene automáticamente las garantías de Kafka ni de una outbox durable.

#### Paso 3 · Teoría, modelo mental y analogía
El productor publica un hecho inmutable; un listener reacciona. El publicador no enumera todos los receptores, igual que una notificación de “pedido creado” no dicta qué equipo debe atenderlo. Si se necesita recuperación tras caída, estudia registro de publicaciones de Modulith o una outbox con almacenamiento duradero.

#### Paso 4 · Demostración guiada
Crea `src/main/java/dev/rutaflow/orders/OrderPlaced.java` y un publicador:

```java
package dev.rutaflow.orders;

import java.time.Instant;

public record OrderPlaced(String orderId, String destination, Instant occurredAt) {
    public OrderPlaced {
        if (orderId == null || orderId.isBlank()) throw new IllegalArgumentException("orderId requerido");
    }
}
```

```java
package dev.rutaflow.orders;

import java.time.Instant;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class PlaceOrder {
    private final ApplicationEventPublisher events;
    public PlaceOrder(ApplicationEventPublisher events) { this.events = events; }

    public void execute(String id, String destination) {
        // Publica el hecho; no llama al servicio de otro módulo.
        events.publishEvent(new OrderPlaced(id, destination, Instant.now()));
    }
}
```

Crea `src/main/java/dev/rutaflow/shipping/ShippingListener.java`:

```java
package dev.rutaflow.shipping;

import dev.rutaflow.orders.OrderPlaced;
import org.springframework.modulith.ApplicationModuleListener;
import org.springframework.stereotype.Component;

record ShipmentRequested(String orderId, String destination) {}

@Component
class ShippingListener {
    private final ShippingRequests requests;
    ShippingListener(ShippingRequests requests) { this.requests = requests; }

    @ApplicationModuleListener
    void on(OrderPlaced event) {
        requests.create(new ShipmentRequested(event.orderId(), event.destination()));
    }
}
```

Agrega al API público de `shipping` un contrato `ShippingRequests.create(ShipmentRequested)` y `findByOrderId(String)` (devuelve `null` si todavía no existe), e implementación fake para el test. Ejecuta `./mvnw test`; observa la solicitud una vez por publicación.

#### Paso 5 · Práctica guiada
Usa `@ApplicationModuleListener` y verifica el evento recibido con `PublishedEvents`. **Pista:** el evento debe contener identificador y datos del hecho, no una entidad JPA gestionada ni contraseña del proveedor.

#### Paso 6 · Práctica independiente
Publica el mismo `OrderPlaced` dos veces y diseña deduplicación con `orderId` más tipo de efecto. Anota qué aporta el patrón y por qué el listener necesita idempotencia aun dentro de un proceso.

#### Paso 7 · Cierre y evidencia
Entrega productor, listener y test de evento recibido. El siguiente tema genera documentación visible de los límites y dependencias.

**Fallo deliberado:** publica un evento sin `orderId` y comprueba el error antes de procesar el envío; después repite la publicación para observar por qué un listener duplicable debe ser idempotente.

```bash
./mvnw test
```

**Resultado esperado:** el test observa un evento con el ID correcto y la prueba inválida falla con `orderId requerido`. **Errores comunes:** usar evento para ocultar una dependencia síncrona necesaria, publicar una entidad mutable y asumir durabilidad sin configurar registro/outbox. Fuentes oficiales: [eventos de aplicación](https://docs.spring.io/spring-modulith/reference/events.html), [tests de módulos](https://docs.spring.io/spring-modulith/reference/testing.html).

**Proyecto propio:** `src/main/java/dev/rutaflow/orders/PlaceOrder.java`. **Cuándo preferir una llamada:** cuando el caso de uso necesita resultado inmediato y la abstracción pública del otro módulo es apropiada. Evidencia de aprendizaje: entrega salida de test y decisión justificada entre evento y llamada.

---

### Tema 3: documentación generada y mapa de dependencias

#### Paso 1 · Objetivo y preparación
Al finalizar generarás diagramas de módulos desde la estructura verificada y los compararás con el diseño aprobado. **Prerrequisitos:** Temas 1–2 y Mermaid/UML básico. Crea una carpeta de proyecto independiente llamada `modulith-docs-lab`.

**Ejemplo independiente:** en una carpeta vacía descarga una app Boot 4.0.9 con Java 21 y `web,test`, agrega el BOM/artefactos Modulith 2.0.9, crea dos paquetes de módulo y ejecuta `./mvnw test`.

#### Paso 2 · Contexto y caso real
En una revisión de RutaFlow, el diagrama dibujado meses atrás muestra que inventario depende de envíos, pero el código actual invirtió la relación. La documentación generada facilita hallar divergencias; una imagen generada no aprueba la arquitectura por el equipo.

#### ¿Por qué es importante?
La documentación queda desactualizada si vive fuera del código. Generar a partir del modelo de módulos permite revisar cambios junto con el build y discutir decisiones con evidencia.

#### Paso 3 · Teoría, modelo mental y analogía
`Documenter` lee el modelo `ApplicationModules` y crea artefactos de documentación (diagramas/snippets) para inspección. El diagrama refleja dependencias detectadas por Spring Modulith, no llamadas HTTP externas, brokers ni topología de infraestructura que no están en el modelo.

#### Paso 4 · Demostración guiada
El starter de test del Tema 1 incluye `spring-modulith-docs`; crea `src/test/java/dev/rutaflow/ModuleDocumentationTest.java`:

```java
package dev.rutaflow;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

class ModuleDocumentationTest {
    @Test
    void writeModuleDiagrams() {
        var modules = ApplicationModules.of(ShippingApplication.class).verify();
        new Documenter(modules)
                .writeModulesAsPlantUml()
                .writeIndividualModulesAsPlantUml();
    }
}
```

Corre `./mvnw -Dtest=ModuleDocumentationTest test` y busca los archivos en `target/spring-modulith-docs`. Abre los `.puml` con PlantUML o conserva el texto en revisión.

#### Paso 5 · Práctica guiada
Añade `pricing` como módulo y corre la generación otra vez. **Pista:** verifica que el nuevo nodo y sus flechas coinciden con imports permitidos; anota una relación inesperada y localiza la referencia Java responsable.

#### Paso 6 · Práctica independiente
Convierte una dependencia circular en una dependencia unilateral más un evento del Tema 2; regenera el diagrama y enlaza el resultado desde `docs/architecture/modules.md`.

#### Paso 7 · Cierre y evidencia
Entrega el comando, artefactos generados y una diferencia explicada respecto al dibujo aprobado. El siguiente tema usa estos límites para probar un módulo con su contexto reducido.

**Fallo deliberado:** introduce deliberadamente una dependencia prohibida y confirma que la verificación falla aunque el generador pueda producir archivos; diagnostica por separado el error de arquitectura.

```bash
./mvnw -Dtest=ModuleDocumentationTest test
```

**Resultado esperado:** existen diagramas PlantUML reproducibles y un nodo por módulo detectado. **Errores comunes:** dibujar la infraestructura como si la detectara Modulith, aceptar el diagrama sin verificar dependencias y olvidar versionar/enlazar el artefacto útil. Fuentes oficiales: [documentación Modulith](https://docs.spring.io/spring-modulith/reference/documentation.html), [proyecto Spring Modulith](https://spring.io/projects/spring-modulith).

**Proyecto propio:** `docs/architecture/modules.md`. **Cuándo actualizar:** cuando cambie la estructura de paquetes o sus dependencias públicas. Evidencia: entrega el diagrama y enlaza una relación con su import de código.

---

### Tema 4: pruebas de integración por módulo

#### Paso 1 · Objetivo y preparación
Al finalizar probarás el módulo `orders` sin cargar todo el contexto y esperarás un resultado observable de su interacción. **Prerrequisitos:** Temas 1–3, JUnit 5 y eventos Spring. Crea `modulith-module-test-lab` a partir de Spring Initializr (Boot 4.0.9, Java 21, `web,test`).

**Ejemplo independiente:** crea una carpeta vacía, descarga el proyecto con Spring Initializr y agrega `spring-modulith-starter-test` 2.0.9 según la guía vigente; configura Maven wrapper y corre `./mvnw test`.

#### Paso 2 · Contexto y caso real
Un `@SpringBootTest` que levanta seguridad, base, correo y todos los módulos puede tardar y exigir servicios irrelevantes para probar `orders`. Un test de módulo inicia solo el módulo bajo estudio o las dependencias declaradas.

#### ¿Por qué es importante?
Tests pequeños reducen fallas ambientales, pero no deben fingir que prueban la aplicación completa. Define el límite de test y una capa separada para contrato, broker, HTTP y despliegue.

#### Paso 3 · Teoría, modelo mental y analogía
`@ApplicationModuleTest` acota el bootstrap a un módulo. `Scenario` publica un estímulo y espera un evento o cambio de estado. Es una prueba de integración dentro del proceso Spring; para Kafka real todavía necesitas test con broker/adapter.

#### Paso 4 · Demostración guiada
Crea `src/test/java/dev/rutaflow/orders/OrderModuleTests.java`:

```java
package dev.rutaflow.orders;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import static org.assertj.core.api.Assertions.assertThat;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.Scenario;

@ApplicationModuleTest
class OrderModuleTests {
    @Autowired ShippingRequests requests;

    @Test
    void placingOrderPublishesEvent(Scenario scenario) {
        scenario.publish(new OrderPlaced("ord-42", "Calle 10", java.time.Instant.now()))
                .andWaitForStateChange(() -> requests.findByOrderId("ord-42"))
                .andVerify(request -> assertThat(request.destination()).isEqualTo("Calle 10"));
    }
}
```

Adapta el estímulo al servicio público real que crea el pedido y espera `ShipmentRequested` del consumidor del otro módulo. Corre `./mvnw -Dtest=OrderModuleTests test`; la salida JUnit debe indicar el caso aprobado.

#### Paso 5 · Práctica guiada
Limita el test a `orders` y agrega una dependencia de módulo requerida de forma explícita si forma parte del contrato de prueba. **Pista:** si falta un bean, comprueba primero si pertenece al límite declarado, no amplíes el bootstrap a toda la app sin motivo.

#### Paso 6 · Práctica independiente
Escribe un test que espere cambio de estado y otro que cubra publicación duplicada. Anota qué capa falta para afirmar que el evento sobrevive a una caída completa del proceso.

#### Paso 7 · Cierre y evidencia
Entrega test verde, salida de fallo ante estado no esperado y límite de lo que el test acredita. El siguiente tema de la ruta es Spring GraphQL para exponer una API de consultas y cambios.

**Fallo deliberado:** espera `ShipmentRequested` sin publicarlo y observa el timeout; diagnostica el estímulo faltante en vez de alargar indiscriminadamente el tiempo.

```bash
./mvnw -Dtest=OrderModuleTests test
```

**Resultado esperado:** el escenario observa el evento/cambio esperado en el tiempo definido; un evento ausente causa fallo legible. **Errores comunes:** creer que prueba transporte externo, cargar dependencias al azar y omitir eventos duplicados/fallidos. Fuente oficial: [integración de módulos y Scenario](https://docs.spring.io/spring-modulith/reference/testing.html).

**Proyecto propio:** `src/test/java/dev/rutaflow/orders/OrderModuleTests.java`. **Cuándo usar test de módulo:** para contratos e integración interna; usa otros tipos para transporte/infraestructura real. Evidencia de aprendizaje: entrega el test, la salida y una frase sobre el límite de cobertura.

---

## Referencias oficiales consultadas

- [Spring Modulith: guía](https://docs.spring.io/spring-modulith/reference/)
- [Verificación de módulos](https://docs.spring.io/spring-modulith/reference/verification.html)
- [Eventos](https://docs.spring.io/spring-modulith/reference/events.html)
- [Documentación generada](https://docs.spring.io/spring-modulith/reference/documentation.html)
- [Pruebas de módulos](https://docs.spring.io/spring-modulith/reference/testing.html)
- [Spring Boot: requisitos](https://docs.spring.io/spring-boot/system-requirements.html)
