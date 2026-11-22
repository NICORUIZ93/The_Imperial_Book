## CAPÍTULO M01-L05: Spring Boot IoC, DI y ciclo de vida de beans

### 1. Ubicación
- **Curso:** C2 — Spring Boot Microservicios desde Cero
- **Módulo:** M01 — Fundamentos Java 21 / Spring Boot
- **Lección:** L05 — Spring Boot IoC/DI/Bean lifecycle
- **Tiempo estimado:** 60 min
- **Versiones:** Java 21, Spring Boot 3.4.x

### 2. Prerrequisitos
- M01-L04 proyecto Spring Boot mínimo.
- Clases, interfaces, constructores.
- JUnit básico.

### 3. Objetivo de aprendizaje
Al terminar podrás **explicar IoC/DI**, **inyectar dependencias por constructor** y **observar el ciclo de vida** de un bean con `@PostConstruct`, verificándolo con tests.

### 4. Problema real / por qué importa
Sin DI, las clases crean sus dependencias con `new`, quedando acopladas y difíciles de testear. En microservicios, esto hace imposible cambiar implementaciones, mockear en tests o gestionar recursos. Spring IoC invierte el control: el contenedor crea y conecta objetos.

### 5. Analogía y modelo mental
En una cocina profesional, el chef no fabrica el horno ni cultiva tomates cada vez; la cocina le entrega herramientas e insumos listos. IoC es eso: el contenedor provee dependencias. DI es la forma en que llegan (por constructor, la más clara).

**Dónde se rompe la analogía:** los beans tienen scopes, proxies y ciclo de vida; no son simples “objetos entregados”.

### 6. Diagrama técnico
```mermaid
flowchart LR
  AC[ApplicationContext] -->|crea| R[GreetingRepository]
  AC -->|crea| T[LifecycleTracker]
  AC -->|inyecta constructor| S[GreetingService]
  S -->|@PostConstruct init| T
  S -->|greet()| R
```
**Texto alternativo:** El ApplicationContext crea repository y tracker, los inyecta en GreetingService por constructor, ejecuta PostConstruct y el servicio usa el repositorio.

### 7. Conceptos fundamentales

#### Qué es
- **IoC:** el framework controla la creación/ciclo de vida.
- **DI:** el contenedor entrega dependencias.
- **Bean:** objeto gestionado por Spring.

#### Cómo funciona
Spring escanea componentes, resuelve dependencias, instancia beans, inyecta, llama callbacks (`@PostConstruct`) y al cerrar contexto puede llamar `@PreDestroy`.

#### Cuándo usar
- Servicios, repositorios, controllers, componentes con dependencias.
- Constructor injection por defecto.

#### Cuándo NO usar
- No uses field injection en código nuevo; dificulta tests e inmutabilidad.
- No metas lógica pesada en constructores/PostConstruct sin considerar arranque.

### 8. Construcción desde cero

Lab: `docs/cursos/springboot-microservicios-desde-cero/labs/m01-l05-spring-boot-ioc-di-bean-lifecycle`

#### Paso 1: Repositorio
```java
@Repository
public class GreetingRepository { public String findGreeting() { return "Hola desde repositorio"; } }
```

#### Paso 2: Tracker de ciclo de vida
```java
@Component
public class LifecycleTracker {
    private final List<String> events = Collections.synchronizedList(new ArrayList<>());
    public void track(String event) { events.add(event); }
    public List<String> events() { return List.copyOf(events); }
}
```

#### Paso 3: Servicio con constructor DI y callbacks
```java
@Service
public class GreetingService {
    private final GreetingRepository repository;
    private final LifecycleTracker tracker;
    public GreetingService(GreetingRepository repository, LifecycleTracker tracker) {
        this.repository = repository; this.tracker = tracker; tracker.track("constructor");
    }
    @PostConstruct void init() { tracker.track("postConstruct"); }
    public String greet() { return repository.findGreeting(); }
    @PreDestroy void destroy() { tracker.track("preDestroy"); }
}
```

#### Paso 4: Test
```java
@Test void diAndLifecycleWork() {
    assertEquals("Hola desde repositorio", service.greet());
    assertTrue(tracker.events().contains("constructor"));
    assertTrue(tracker.events().contains("postConstruct"));
    assertTrue(tracker.events().indexOf("constructor") < tracker.events().indexOf("postConstruct"));
}
```

#### Paso 5: Ejecutar
```bash
./verify.sh
```
Salida real: `RESULTADO: OK`.

### 9. Código de referencia completo
- `GreetingRepository.java`, `LifecycleTracker.java`, `GreetingService.java`, `IocApplication.java`
- `GreetingServiceTest.java`, `verify.sh`

### 10. Explicación línea por bloque

| Bloque | Intención | Efecto | Si se omite/cambia |
|---|---|---|---|
| Constructor con dependencias | DI explícita | Inmutable y testeable | Field injection oculta dependencias |
| `tracker.track("constructor")` | Evidencia creación | Verificable en test | No observas orden |
| `@PostConstruct` | Hook post-inyección | Inicialización segura | Usar campos no inyectados antes de tiempo |
| `@PreDestroy` | Limpieza | Libera recursos | Fugas al cerrar contexto |
| `@SpringBootTest` | Levanta contexto | IoC real | Un test unitario no probaría wiring |

### 11. Laboratorio reproducible
`./verify.sh` corre el test Spring Boot.

### 12. Verificación automática
Valida DI y orden constructor → postConstruct.

### 13. Modificación guiada
- **Cambio:** quita `@Service` de `GreetingService`.
- **Hipótesis:** Spring no lo registrará y el test fallará por `NoSuchBeanDefinitionException`.
- **Comando:** `mvn -q -Dtest=GreetingServiceTest test`.
- **Resultado esperado:** fallo de contexto. Revierte.

### 14. Error común y diagnóstico
- **Síntoma:** `NoSuchBeanDefinitionException`.
- **Causa:** falta anotación, paquete fuera de escaneo, o múltiples beans.
- **Diagnóstico:** revisar escaneo, `@Component`, `@Qualifier`/`@Primary`.
- **Fix:** registrar bean correctamente.

### 15. Cierre

#### Anti-patrón
Field injection con `@Autowired` en campos privados. Parece cómodo, pero dificulta tests e invariantes.

#### Pregunta de entrevista
- **Pregunta:** ¿Por qué se prefiere constructor injection?
- **Respuesta modelo:** Hace dependencias explícitas, permite inmutabilidad con `final`, facilita tests sin Spring y falla rápido si falta una dependencia.

#### Resumen
- IoC: el contenedor controla el ciclo de vida.
- DI por constructor: clara y testeable.
- Los hooks de lifecycle tienen orden.

#### Puente
M01-L06 usa condiciones para decidir qué beans crear: auto-config condicional.
