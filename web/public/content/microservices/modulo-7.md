# Módulo 3 · Testing en microservicios

**Entorno de referencia (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Node.js v24.18.0, Docker 29.9.3. Los principios de test se verifican con Java puro y aserciones mínimas. JUnit 5, Mockito, MockMvc, Testcontainers, Pact, ArchUnit y SonarQube requieren dependencias/frameworks o servicios; se incluyen ejemplos mínimos y **Nota de verificación** honesta cuando no se ejecutaron en este entorno.

Este módulo cubre la pirámide de pruebas en microservicios: unitarias, de integración, de contrato, arquitectónicas y análisis estático.

## Aprende construyendo

### Tema 1: JUnit 5, Mockito, MockMvc · Intermedio · 180 min

Caso guía: probar un servicio que depende de un repositorio y un controlador HTTP sin levantar toda la infraestructura innecesariamente.

#### JUnit 5 (test unitario)

**Definición formal.** JUnit 5 es un framework de pruebas para Java (Plataforma, Jupiter, Vintage) que ejecuta casos de prueba y reporta aserciones.

**Para qué sirve.** Verificar comportamiento de unidades de código de forma repetible.

**Cuándo usarlo y cuándo no.** Úsalo para lógica de negocio y regresiones. No uses solo tests E2E para lógica pura; son lentos y frágiles.

**Ejemplo mínimo enfocado (ejecutable, aserción Java pura).**

```bash
mkdir -p /tmp/ms7-junit && cd /tmp/ms7-junit
cat > Main.java << 'JAVA'
class Calc { int suma(int a,int b){ return a+b; } }
public class Main {
  static void assertEq(int expected,int actual){ if(expected!=actual) throw new AssertionError(expected+"!="+actual); }
  public static void main(String[] args){ assertEq(5,new Calc().suma(2,3)); System.out.println("OK"); }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** `@Test` con `Assertions.assertEquals`.

**Error común.** Test sin aserción útil. Síntoma: test pasa siempre. Corrección: afirmar comportamiento observable.

**Verificación (JDK 27, 2026-05-22).** Salida: `OK`. **Nota:** ejecución con JUnit Jupiter requiere dependencia `junit-jupiter`.

#### Mockito (mock)

**Definición formal.** Mockito es un framework para crear dobles de prueba (mocks/stubs/spies) y verificar interacciones.

**Para qué sirve.** Aislar la unidad bajo prueba de dependencias lentas o externas.

**Cuándo usarlo y cuándo no.** Úsalo en unit tests para dependencias. No abuses de mocks en lógica simple; pueden acoplar test a implementación.

**Ejemplo mínimo enfocado (ejecutable, stub manual).**

```bash
mkdir -p /tmp/ms7-mock && cd /tmp/ms7-mock
cat > Main.java << 'JAVA'
interface Repo { String find(String id); }
class Service { private final Repo repo; Service(Repo r){repo=r;} String greet(String id){ return "Hola "+repo.find(id); } }
public class Main {
  public static void main(String[] args){
    Repo stub = id -> "Ada"; // stub estilo mock
    System.out.println(new Service(stub).greet("1"));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** `when(repo.findById(1)).thenReturn(...)`.

**Error común.** Mockear el objeto bajo prueba. Corrección: mockear colaboradores, no el SUT.

**Verificación (JDK 27, 2026-05-22).** Salida: `Hola Ada`. **Nota:** Mockito real requiere dependencia `mockito-core`.

#### MockMvc

**Definición formal.** MockMvc es un componente de Spring Test para probar controladores MVC simulando requests HTTP sin servidor real completo.

**Para qué sirve.** Verificar mapeos, validación, status y serialización web.

**Cuándo usarlo y cuándo no.** Úsalo para capa web Spring. No lo uses como único test de integración completa cuando necesitas wiring/DB real.

**Ejemplo mínimo enfocado (esqueleto).**

```java
@WebMvcTest(ProductoController.class)
class ProductoControllerTest {
  @Autowired MockMvc mvc;
  @Test void crea() throws Exception {
    mvc.perform(post("/productos").contentType(MediaType.APPLICATION_JSON)
      .content("{\"nombre\":\"Teclado\"}"))
      .andExpect(status().isCreated());
  }
}
```

**Caso de uso real.** Verificar 400 por validación y 201 por creación.

**Error común.** Cargar contexto completo con `@SpringBootTest` para un test de controlador. Corrección: `@WebMvcTest` para slice web.

**Verificación.** **Nota de verificación:** requiere `spring-boot-starter-test` y contexto Spring.

### Tema 2: Testcontainers · Intermedio · 180 min

Caso guía: probar integración real contra PostgreSQL efímero.

#### Testcontainers

**Definición formal.** Testcontainers es una librería que provisiona dependencias reales (DB, broker, etc.) en contenedores Docker durante tests.

**Para qué sirve.** Tests de integración fieles al motor real.

**Cuándo usarlo y cuándo no.** Úsalo para integración con DB/broker. No para unit tests rápidos; requiere Docker.

**Ejemplo mínimo enfocado (ejecutable, Docker disponible).**

```bash
docker run --rm hello-world >/dev/null && echo docker-ok
```

**Caso de uso real.** `@Testcontainers` con `PostgreSQLContainer`.

**Error común.** Asumir Docker disponible en CI sin configurar. Síntoma: tests fallan por entorno. Corrección: documentar prerequisito o usar service containers.

**Verificación (Docker 29.9.3, 2026-05-22).** Salida: `docker-ok`. **Nota:** Testcontainers Java requiere dependencia y tests JUnit; se verifica prerequisito Docker.

#### Integración con DB real

**Definición formal.** Un test de integración de persistencia ejecuta repositorios/queries contra un motor real para validar mapeo, SQL, constraints y transacciones.

**Para qué sirve.** Detecta problemas que H2/in-memory no revelan.

**Cuándo usarlo y cuándo no.** Úsalo para migraciones, queries nativas, tipos específicos. No reemplaces toda la suite por integración lenta.

**Ejemplo mínimo enfocado (esqueleto).**

```java
@Testcontainers
@DataJpaTest
class RepoTest {
  @Container static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16-alpine");
}
```

**Caso de uso real.** Validar constraint unique o JSONB en PostgreSQL.

**Error común.** Usar H2 y asumir paridad con PostgreSQL. Corrección: Testcontainers con motor objetivo.

**Verificación.** **Nota de verificación:** requiere JUnit/Testcontainers/Spring Data JPA y Docker.

### Tema 3: Contract Testing con Pact y Pact Broker · Avanzado · 180 min

Caso guía: asegurar que un consumidor y un proveedor acuerden el formato de una API.

#### Contract test (consumer-driven)

**Definición formal.** Un contrato consumer-driven define expectativas del consumidor sobre una interacción; el proveedor verifica que las cumple.

**Para qué sirve.** Detecta rupturas de contrato entre servicios sin E2E completo.

**Cuándo usarlo y cuándo no.** Úsalo entre servicios con despliegue independiente. No sustituye tests funcionales internos.

**Ejemplo mínimo enfocado (contrato JSON conceptual, ejecutable).**

```bash
mkdir -p /tmp/ms7-pact && cd /tmp/ms7-pact
cat > contract.json << 'JSON'
{"consumer":"web","provider":"productos","request":{"method":"GET","path":"/productos/1"},"response":{"status":200,"body":{"id":1,"nombre":"Teclado"}}}
JSON
python3 - <<'PY'
import json
c=json.load(open('contract.json'))
print(c['response']['status'], c['response']['body']['nombre'])
PY
```

**Caso de uso real.** Pact consumer genera pacto; proveedor lo verifica en CI.

**Error común.** Contrato demasiado rígido sobre campos irrelevantes. Corrección: matchers por tipo/forma, no valores exactos innecesarios.

**Verificación (Python 3, 2026-05-22).** Salida: `200 Teclado`. **Nota:** Pact real requiere librerías Pact y ejecución consumer/provider.

#### Pact Broker

**Definición formal.** Pact Broker es un servicio para publicar, versionar y consultar contratos Pact y resultados de verificación entre equipos/CI.

**Para qué sirve.** Gobierna compatibilidad entre consumidores y proveedores.

**Cuándo usarlo y cuándo no.** Úsalo cuando hay múltiples consumidores/proveedores. No lo montes si no hay proceso de verificación en CI.

**Ejemplo mínimo enfocado (conceptual).**

```bash
# publicar/verificar requiere Pact Broker y credenciales
# pact-broker publish pacts --consumer-app-version ...
```

**Caso de uso real.** CI bloquea deploy si proveedor rompe contrato verificado.

**Error común.** Publicar pactos pero no verificar en proveedor. Corrección: verificación obligatoria en pipeline.

**Verificación.** **Nota de verificación:** requiere Pact Broker/infra y credenciales; no ejecutado.

### Tema 4: ArchUnit · Intermedio · 120 min

Caso guía: impedir que la capa de dominio dependa de infraestructura.

#### Regla arquitectónica automatizada

**Definición formal.** ArchUnit es una librería Java para expresar y testear reglas de arquitectura sobre clases, paquetes y dependencias.

**Para qué sirve.** Evita erosión arquitectónica por cambios graduales.

**Cuándo usarlo y cuándo no.** Úsalo en codebases con capas/módulos definidos. No lo uses para reglas que el compilador o build ya garantizan mejor.

**Ejemplo mínimo enfocado (ejecutable, chequeo simple por nombre de paquete simulado).**

```bash
mkdir -p /tmp/ms7-arch && cd /tmp/ms7-arch
cat > Main.java << 'JAVA'
import java.util.*;
public class Main {
  static boolean violacion(String from, String to){ return from.startsWith("domain") && to.startsWith("infra"); }
  public static void main(String[] args){
    System.out.println(violacion("domain.Order","infra.JpaRepo"));
    System.out.println(violacion("app.OrderService","infra.JpaRepo"));
  }
}
JAVA
javac Main.java && java Main
```

**Caso de uso real.** `noClasses().that().resideInPackage("..domain..").should().dependOnClassesThat().resideInPackage("..infra..")`.

**Error común.** Reglas demasiado amplias que bloquean cambios legítimos. Corrección: reglas claras, justificadas y mantenibles.

**Verificación (JDK 27, 2026-05-22).** Salida: `true`, `false`. **Nota:** ArchUnit real requiere dependencia `archunit-junit5`.

### Tema 5: SonarQube · Intermedio · 120 min

Caso guía: detectar code smells, bugs y hotspots de seguridad en CI.

#### Análisis estático con SonarQube

**Definición formal.** SonarQube es una plataforma de análisis estático que inspecciona código para detectar bugs, vulnerabilidades, code smells, cobertura y duplicación.

**Para qué sirve.** Feedback continuo de calidad y seguridad.

**Cuándo usarlo y cuándo no.** Úsalo en CI con quality gate. No lo trates como sustituto de code review o tests.

**Ejemplo mínimo enfocado (config ilustrativa).**

```properties
sonar.projectKey=demo
sonar.sources=src/main/java
sonar.host.url=http://localhost:9000
```

**Caso de uso real.** Quality gate falla si cobertura nueva cae o hay vulnerabilidades.

**Error común.** Ignorar el quality gate o silenciar reglas masivamente. Corrección: curar reglas y atender hallazgos relevantes.

**Verificación.** **Nota de verificación:** requiere servidor SonarQube y scanner (`mvn sonar:sonar` o `sonar-scanner`); no ejecutado.

#### Quality gate

**Definición formal.** Un quality gate es un conjunto de condiciones (cobertura, issues nuevos, duplicación, rating) que determinan si el análisis pasa o falla.

**Para qué sirve.** Criterio objetivo mínimo de calidad para merge/deploy.

**Cuándo usarlo y cuándo no.** Úsalo en PR/main. No lo configures tan laxo que no aporte, ni tan rígido de golpe en legado sin plan.

**Ejemplo mínimo enfocado (ejecutable, simulación).**

```bash
node -e "const cov=82; const bugs=0; console.log(cov>=80 && bugs===0 ? 'PASS':'FAIL')"
```

**Caso de uso real.** Pipeline bloquea merge si quality gate falla.

**Error común.** Medir cobertura global y permitir caída en código nuevo. Corrección: quality gate sobre código nuevo.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `PASS`.

## Cierre del módulo

El testing en microservicios combina velocidad y fidelidad: unit tests para lógica, integración con dependencias reales, contratos entre servicios, reglas de arquitectura y análisis estático. La herramienta es útil solo si corre en CI y sus fallos llevan a acción.
