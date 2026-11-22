# Módulo 0: Fundamentos de Spring: IoC, DI y AOP

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria. El mecanismo de inyección de dependencias se documenta con comandos reales de Maven/Spring Boot y con el comportamiento exacto y verificable que produce cada anotación, sin sustituir el código Java por ningún otro lenguaje.

## Antes de comenzar: del equipo vacío a Spring Boot

Completa primero los fundamentos del track Java o asegúrate de entender clases, interfaces, excepciones y colecciones. Instala **JDK 25**, Git y un editor: IntelliJ IDEA Community es la opción más sencilla para Spring; VS Code con Extension Pack for Java y Spring Boot Extension Pack también funciona.

- **Windows:** instala Eclipse Temurin JDK 25, Git e IntelliJ; verifica `java --version` y `javac --version` en PowerShell.
- **macOS:** instala específicamente Temurin **25** desde [Adoptium](https://adoptium.net/installation/); un paquete sin versión puede instalar otro JDK. Usa `brew install git` para Git.
- **Ubuntu/Debian:** instala JDK **25** con las [instrucciones de Adoptium para Linux](https://adoptium.net/installation/linux/); la disponibilidad de `openjdk-25-jdk` depende de la distribución y sus repositorios. Instala Git con `sudo apt install git`.

No necesitas instalar Maven si el proyecto incluye `mvnw`/`mvnw.cmd`: ese *wrapper* descarga la versión correcta. En [start.spring.io](https://start.spring.io/) elige Java, Maven, **Spring Boot 4.1.2**, JDK 25 y la dependencia **Spring Web**. Usa artifact `academia-spring` y establece explícitamente el paquete **`com.example.demo`**, que usan los archivos de estas lecciones. Descarga, descomprime y ejecuta:

```bash
# macOS/Linux
./mvnw spring-boot:run

# Windows PowerShell
.\mvnw.cmd spring-boot:run
```

Visita `http://localhost:8080`. Un 404 significa que el servidor sí arrancó pero aún no existe una ruta; "connection refused" significa que no arrancó. Lee siempre desde la primera línea `Caused by:` del error, no solo la última.

**Herramienta y continuidad:** los comandos originales usan **Maven** (`pom.xml` y `mvnw`). Los laboratorios también incorporan una alternativa **Gradle 9.8.2** (`build.gradle` y `gradlew`) con las mismas fuentes. El M1 explica cómo elegir una herramienta y traducir los comandos. Conserva `academia-spring` de M0 a M7. En M1 la generación de un proyecto es un experimento separado; aplica después la configuración a tu proyecto base. Desde M10 hay laboratorios aislados con infraestructura propia; cada tema identifica su carpeta, y M20 integra una selección de esas piezas. No copies todas sus configuraciones sobre una sola aplicación.

**Regla de ejecución:** ejecuta los comandos desde la carpeta que contiene el `pom.xml` del proyecto indicado. Antes de cambiar de laboratorio, detén el servidor con Ctrl+C para liberar su puerto. Tras cambiar Java o recursos, reinicia `spring-boot:run` salvo que hayas configurado recarga explícitamente. Una práctica independiente puede cambiar el estado esperado: restaura la base indicada antes de continuar.

Cada laboratorio del inventario `docs/spring-gradle-labs.json` incorpora su build y Wrapper Gradle; copia la carpeta completa para conservarlos. Para ejecutar Gradle sobre JDK 25 necesitas Gradle **9.1 o posterior**; el mínimo general 8.14 de Boot no basta para esa JVM. Consulta [requisitos Boot](https://docs.spring.io/spring-boot/system-requirements.html) y [compatibilidad Gradle/Java](https://docs.gradle.org/current/userguide/compatibility.html). Cambiar solo `mvnw` por `gradlew` no migra BOM, procesadores ni plugins.

**Referencia al cerrar M0–M1:** `README.md` reúne las clases finales y cinco pruebas. Úsala para comparar después de escribir tus archivos; no equivale a haber ejecutado cada cambio y fallo del recorrido.

## Mapa de la ruta

«Spring Boot» tiene 21 módulos en 4 etapas. Cada etapa se apoya en la anterior; usa la tabla para saltar a un módulo concreto. El orden sigue las dependencias: primero el contenedor y la web, después datos, seguridad, pruebas y operación, y al final mensajería, arquitectura y sistemas distribuidos.

```mermaid
flowchart LR
    E0["Fundamentos<br/>módulos 0–1"]
    E1["Aplicación<br/>módulos 2–4"]
    E2["Integración<br/>módulos 5–8"]
    E3["Experto<br/>módulos 9–20"]
    E0 --> E1
    E1 --> E2
    E2 --> E3
```

| Módulo | Etapa | Qué aprendes |
|---|---|---|
| 0 | Fundamentos | [Fundamentos de Spring: IoC, DI y AOP](/curso/spring-boot/0) |
| 1 | Fundamentos | [Spring Boot CLI y estructura de proyecto](/curso/spring-boot/1) |
| 2 | Aplicación | [REST APIs con Spring Web](/curso/spring-boot/2) |
| 3 | Aplicación | [JDBC, JdbcClient y transacciones en Spring Boot](/curso/spring-boot/3) |
| 4 | Aplicación | [Persistencia con Spring Data JPA](/curso/spring-boot/4) |
| 5 | Integración | [Spring Security I: cadena, JWT con resource server, CORS y SSRF](/curso/spring-boot/5) |
| 6 | Integración | [Testing en Spring Boot](/curso/spring-boot/6) |
| 7 | Integración | [Configuración, errores y observabilidad](/curso/spring-boot/7) |
| 8 | Integración | [Integraciones Spring: scheduling, eventos, correo, caché e IA](/curso/spring-boot/8) |
| 9 | Experto | [Concurrencia, @Async y resiliencia en el núcleo de Spring](/curso/spring-boot/9) |
| 10 | Experto | [Mensajería con Kafka: eventos, errores, outbox y contratos](/curso/spring-boot/10) |
| 11 | Experto | [RabbitMQ, JMS y Spring Cloud Stream](/curso/spring-boot/11) |
| 12 | Experto | [Spring Batch: jobs, chunks y procesamiento masivo](/curso/spring-boot/12) |
| 13 | Experto | [Programación reactiva con WebFlux](/curso/spring-boot/13) |
| 14 | Experto | [Spring GraphQL: contrato, datos anidados y cambios](/curso/spring-boot/14) |
| 15 | Experto | [Arquitectura: hexagonal, Clean, C4, ADR y Spring Modulith](/curso/spring-boot/15) |
| 16 | Experto | [Microservicios con Spring Cloud](/curso/spring-boot/16) |
| 17 | Experto | [Consistencia, contratos y operación distribuida](/curso/spring-boot/17) |
| 18 | Experto | [Spring Security II: OIDC, autorización por recurso y SAML](/curso/spring-boot/18) |
| 19 | Experto | [Empaquetado y despliegue](/curso/spring-boot/19) |
| 20 | Experto | [Proyecto integrador: backend de entregas productivo](/curso/spring-boot/20) |

## Aprende construyendo


### Tema 1: Inversión de control y el contenedor de Spring · Básico · 30 min

**Caso guía**: `ServicioEnvios` necesita consultar un repositorio. Si lo instancia con `new`, el servicio queda acoplado a una implementación concreta y es difícil probarlo.

**Fundamento técnico y modelo mental**

| Concepto | Definición formal | Para qué sirve | Cuándo usarlo | Error común |
|---|---|---|---|---|
| Inversión de control (IoC) | Principio donde el framework controla creación/composición de objetos, no el código de negocio. | Desacoplar construcción de uso. | Apps con dependencias y configuración. | Confundir IoC con “usar anotaciones”. |
| Contenedor IoC / `ApplicationContext` | Contenedor Spring que crea, configura, conecta y gestiona beans. | Punto central de composición. | Toda app Spring Boot. | Instanciar beans con `new` fuera del contenedor. |
| Bean | Objeto administrado por el contenedor Spring. | Ciclo de vida y wiring administrado. | Servicios, repos, controllers, infra. | Registrar todo como bean sin criterio. |
| Inyección de dependencias (DI) | Patrón para proveer dependencias desde fuera del objeto. | Testabilidad y bajo acoplamiento. | Dependencias entre componentes. | Service Locator oculto. |

**Contrato / invariantes / reglas.** Spring resuelve dependencias entre beans registrados. Si falta un bean requerido, falla en arranque (`NoSuchBeanDefinitionException`). Preferir depender de interfaces/contratos. `@SpringBootApplication` habilita component scan desde su paquete base.

**Modelo mental.** El contenedor es una fábrica + agenda: crea objetos y sabe a quién entregarlos.

**Implementación desde cero** (proyecto `academia-spring`, paquete `com.example.demo`)

`RepositorioEnvios.java`
```java
package com.example.demo;
public interface RepositorioEnvios { String buscarEstado(String codigo); }
```
`RepositorioMemoriaEnvios.java`
```java
package com.example.demo;
import org.springframework.stereotype.Repository;
@Repository
public class RepositorioMemoriaEnvios implements RepositorioEnvios {
  public String buscarEstado(String codigo) { return "En ruta: " + codigo; }
}
```
`ServicioEnvios.java`
```java
package com.example.demo;
import org.springframework.stereotype.Service;
@Service
public class ServicioEnvios {
  private final RepositorioEnvios repositorio;
  public ServicioEnvios(RepositorioEnvios repositorio) { this.repositorio = repositorio; }
  public String consultar(String codigo) { return repositorio.buscarEstado(codigo); }
}
```
`EnviosController.java`
```java
package com.example.demo;
import org.springframework.web.bind.annotation.*;
@RestController
public class EnviosController {
  private final ServicioEnvios servicio;
  public EnviosController(ServicioEnvios servicio) { this.servicio = servicio; }
  @GetMapping("/envios/{codigo}") public String consultar(@PathVariable String codigo) { return servicio.consultar(codigo); }
}
```

**Ejecución y salida real**
```bash
./mvnw spring-boot:run
curl http://localhost:8080/envios/RF-42
```
Salida esperada:
```text
En ruta: RF-42
```

**Errores comunes**: `new RepositorioMemoriaEnvios()` dentro del servicio; bean fuera del paquete base. **Verificación**: arranque sin errores y endpoint responde.

### Tema 2: Inyección por constructor vs por campo · Intermedio · 30 min

**Caso guía**: quieres probar `ServicioEnvios` sin levantar Spring, y también entender el costo de `@Autowired` en campo.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Inyección por constructor | Dependencias pasan por constructor. | Inmutabilidad, dependencias explícitas, test simple. | Preferida por defecto. | Constructores con demasiadas dependencias (señal de diseño). |
| Inyección por campo (`@Autowired`) | Spring asigna campo por reflexión. | Conveniencia en ejemplos legacy. | Evitar en código nuevo. | No puedes instanciar fácil en unit test. |
| Dependencia obligatoria | Dependencia sin la cual el objeto no es válido. | Contrato claro. | `final` + constructor. | Campo null en runtime fuera de Spring. |
| Testabilidad | Facilidad de probar aislado. | Confianza rápida. | Pasar dobles por constructor. | Test que requiere contexto Spring para lógica pura. |

**Implementación desde cero**

`ServicioEnviosTest.java`
```java
package com.example.demo;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class ServicioEnviosTest {
  @Test void consulta() {
    ServicioEnvios servicio = new ServicioEnvios(codigo -> "Preparando: " + codigo);
    assertEquals("Preparando: RF-42", servicio.consultar("RF-42"));
  }
}
```
Alternativa por campo (solo para comparación):
```java
@Service
public class ServicioEnviosCampo {
  @Autowired private RepositorioEnvios repositorio;
  public String consultar(String codigo) { return repositorio.buscarEstado(codigo); }
}
```

**Ejecución y salida real**
```bash
./mvnw -Dtest=ServicioEnviosTest test
```
Salida esperada: `BUILD SUCCESS`, test verde.

**Verificación**: el test de constructor corre sin `@SpringBootTest`; el de campo requiere contexto o cableado manual.

### Tema 3: Estereotipos, autoconfiguración y scopes · Intermedio · 35 min

**Caso guía**: necesitas distinguir roles (`@Repository`, `@Service`, `@RestController`), entender por qué Spring Boot configura web y observar scope `singleton` vs `prototype`.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Estereotipos (`@Component`, `@Service`, `@Repository`, `@Controller/@RestController`) | Especializaciones semánticas de `@Component`. | Escaneo y semántica. | Usar el que expresa rol. | Poner todo como `@Component`. |
| Autoconfiguración | Configuración condicional basada en classpath, properties y beans existentes. | Convenio sobre configuración. | Inspeccionar con `--debug` o conditions report. | “Magia” sin entender condiciones. |
| Scope `singleton` | Un bean por contexto (default). | Servicios stateless. | No guardar estado por request en singleton. | Estado mutable compartido. |
| Scope `prototype` | Nueva instancia cada vez que se solicita. | Objetos stateful de corta vida. | Inyectar con `ObjectProvider` si singleton lo necesita. | Inyectar prototype en singleton y esperar nueva instancia por llamada. |

**Implementación desde cero**

`GeneradorReporte.java`
```java
package com.example.demo;
import org.springframework.context.annotation.Scope; import org.springframework.stereotype.Component;
@Component @Scope("prototype")
public class GeneradorReporte { private final String id = java.util.UUID.randomUUID().toString(); public String id(){ return id; } }
```
`ServicioReportes.java`
```java
package com.example.demo;
import org.springframework.beans.factory.ObjectProvider; import org.springframework.stereotype.Service;
@Service
public class ServicioReportes {
  private final GeneradorReporte recibidoAlCrear; private final ObjectProvider<GeneradorReporte> generadores;
  public ServicioReportes(GeneradorReporte recibidoAlCrear, ObjectProvider<GeneradorReporte> generadores){ this.recibidoAlCrear=recibidoAlCrear; this.generadores=generadores; }
  public String comparar(){ return "directo="+recibidoAlCrear.id()+"; nuevos="+generadores.getObject().id()+","+generadores.getObject().id(); }
}
```

**Ejecución y salida real**
```bash
./mvnw spring-boot:run
curl http://localhost:8080/reporte/comparar
```
Salida esperada: `directo=...; nuevos=..., ...` donde los dos `nuevos` son distintos entre sí; `directo` permanece igual por instancia de servicio singleton.

**Verificación**: `./mvnw dependency:tree` muestra starters; el endpoint evidencia scopes.

### Tema 4: Ciclo de vida de los beans y apagado ordenado · Intermedio · 45 min

**Caso guía**: en shutdown, quieres dejar de aceptar trabajo, drenar lote pendiente y liberar recursos antes de que el proceso muera.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Ciclo de vida del bean | Creación, inyección, callbacks init, uso, callbacks destroy. | Hooks de inicialización/limpieza. | Trabajo rápido en init. | Trabajo largo en `@PostConstruct`. |
| `@PostConstruct` / `@PreDestroy` | Callbacks JSR-250 al iniciar/destruir bean. | Validar/preparar/liberar. | Idempotentes y rápidos. | Asumir orden complejo entre beans no relacionados. |
| `SmartLifecycle` / fase | Contrato para componentes con start/stop y orden por fase. | Arranque/detención ordenada. | Fase menor se detiene antes en shutdown ordenado. | Ignorar fase y cortar trabajo en curso. |
| Graceful shutdown | `server.shutdown=graceful`: deja de aceptar nuevas y espera activas. | Evitar cortar requests. | Timeout < `terminationGracePeriodSeconds`. | Timeout mayor al del orquestador. |

**Implementación desde cero**

`application.properties`
```properties
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s
```
`LoteEnvios.java` (extracto clave)
```java
@Component
public class LoteEnvios implements SmartLifecycle {
  private static final Logger log = LoggerFactory.getLogger(LoteEnvios.class);
  private volatile boolean corriendo;
  @PostConstruct void validar(){ log.info("1. bean creado"); }
  @Override public void start(){ corriendo=true; log.info("2. start"); }
  @Override public void stop(){ corriendo=false; log.info("3. drenar pendientes"); }
  @Override public boolean isRunning(){ return corriendo; }
  @Override public int getPhase(){ return WebServerApplicationContext.GRACEFUL_SHUTDOWN_PHASE - 1; }
  @PreDestroy void liberar(){ log.info("4. liberar"); }
}
```

**Ejecución y salida real**
```bash
./mvnw spring-boot:run
# otra terminal
kill -TERM $(pgrep -f academia-spring)
```
Salida esperada en logs: mensajes `1..4` y `Graceful shutdown complete`.

**Verificación**: observa orden de callbacks; ajusta fase para ver impacto.

### Tema 5: Proxies y AOP: `@Aspect`, `@Around` y `BeanPostProcessor` · Intermedio · 45 min

**Caso guía**: medir tiempo de ejecución de métodos de servicio sin ensuciar lógica de negocio.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| AOP | Programación orientada a aspectos; separa concerns transversales. | Logging, métricas, tx, seguridad. | Aspectos pequeños y claros. | Ocultar lógica de negocio crítica. |
| Proxy | Objeto que envuelve al target e intercepta llamadas. | Aplicar advice. | Llamadas internas `this.metodo()` no pasan por proxy. | Esperar AOP en self-invocation. |
| `@Aspect`/`@Around` | Aspecto y advice que rodea join point. | Medición, control, retry. | Llamar `proceed()` y manejar excepciones. | Olvidar `proceed()` o tragar excepción. |
| `BeanPostProcessor` | Hook para modificar/envolver beans durante inicialización. | Infraestructura/framework. | Usar para infraestructura, no negocio. | Lógica pesada/oscura en BPP. |

**Implementación desde cero**

Dependencia:
```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-aspectj</artifactId></dependency>
```
`MedicionAspect.java`
```java
package com.example.demo;
import org.aspectj.lang.*; import org.aspectj.lang.annotation.*; import org.slf4j.*; import org.springframework.stereotype.Component;
@Aspect @Component
public class MedicionAspect {
  private static final Logger log = LoggerFactory.getLogger(MedicionAspect.class);
  @Around("execution(* com.example.demo.ServicioEnvios.*(..))")
  public Object medir(ProceedingJoinPoint p) throws Throwable {
    long t1 = System.nanoTime();
    try { return p.proceed(); }
    finally { log.info("medido {} en {} us", p.getSignature().toShortString(), (System.nanoTime()-t1)/1_000); }
  }
}
```

**Ejecución y salida real**
```bash
./mvnw spring-boot:run
curl http://localhost:8080/envios/RF-42
```
Salida esperada: respuesta `En ruta: RF-42` y log con `medido ... en ... us`.

**Verificación**: agrega llamada interna `this.otro()` y confirma que no se mide si no pasa por proxy.

### Tema 6: Varias implementaciones (`@Primary`, `@Qualifier`) y expresiones SpEL · Intermedio · 40 min

**Caso guía**: dos tarifadores implementan la misma interfaz; uno es default y otro se selecciona explícitamente.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@Primary` | Bean preferido cuando hay múltiples candidatos. | Default claro. | Solo un primary por tipo/contrato. | Múltiples primaries/confusión. |
| `@Qualifier` | Selección explícita por nombre/calificador. | Desambiguar inyección. | Usar en constructor/parámetro. | Strings mágicos sin convención. |
| Ambigüedad de beans | Más de un bean cumple el contrato. | Forzar decisión explícita. | Resolver con primary/qualifier/config. | Dejar que falle en arranque. |
| SpEL (`#{...}`) | Spring Expression Language para evaluar expresiones en configuración/anotaciones. | Valores dinámicos/calculados. | Mantener simple y testeable. | Lógica compleja oculta en SpEL. |

**Implementación desde cero**

```java
public interface Tarifador { long tarifa(int km); }
@Component("tarifaUrbana") @Primary
class TarifaUrbana implements Tarifador { public long tarifa(int km){ return 3500 + 1000L*km; } }
@Component("tarifaExpress")
class TarifaExpress implements Tarifador { public long tarifa(int km){ return 9000 + 1500L*km; } }
@Service
class CotizadorExpress { private final Tarifador tarifador; CotizadorExpress(@Qualifier("tarifaExpress") Tarifador t){ this.tarifador=t; } long cotizar(int km){ return tarifador.tarifa(km); } }
```
Ejemplo SpEL en propiedad:
```java
@Value("#{${app.impuesto:19} / 100.0}")
private double impuesto;
```

**Ejecución y salida real**
```bash
./mvnw -Dtest=CotizadoresTest test
```
Salida esperada: test verde con `13500` y `24000` para 10 km.

**Verificación**: quita `@Primary` y `@Qualifier` para observar `NoUniqueBeanDefinitionException`.

