# Curso Microservicios · Construir un monolito modular antes de extraer servicios

## Aprende construyendo

RutaFlow empieza como un solo artefacto desplegable con módulos de Envíos y Facturación. En este módulo no extraes procesos: haces visibles las fronteras, reduces dependencias y conviertes decisiones arquitectónicas en pruebas. Solo al final evalúas si separar un servicio compra autonomía suficiente para pagar red, despliegue, datos y operación adicionales.

## Entorno reproducible

Cada tema indica sus archivos. Para los ejercicios Java crea `academia-labs/microservices/modular-rutaflow`; usa JDK 25 y Maven Wrapper. La demostración de ArchUnit incluye un proyecto independiente generado desde una carpeta limpia para que la prueba no dependa de avances ocultos.

### Tema 1: Distinguir estructura lógica de unidad de despliegue · Fundamentos · 40 min

**Prerrequisito:** tema «Refutar falacias distribuidas mediante evidencia reproducible» del módulo «Antes de distribuir: proceso, red y falacias» (referencia interna M0 T10).

**Al finalizar podrás:** clasificar monolito, monolito modular, monolito distribuido y servicios autónomos usando artefactos, procesos, módulos, datos y despliegue, sin inferir arquitectura por tamaño, repositorio o presencia de HTTP.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1**. Crea `academia-labs/microservices/clasificacion/{src,out,evidence}`. Debes distinguir proceso, puerto y frontera de red; ahora añadirás unidad lógica y unidad de despliegue.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Llamar microservicio a cualquier API pequeña hace que un equipo pague serialización, fallos parciales y operación distribuida sin obtener autonomía.

RutaFlow contiene Envíos y Facturación en `rutaflow.jar`. Dos módulos dentro de un artefacto siguen siendo un monolito desplegable, aunque sus paquetes estén bien separados. Dividirlos en dos procesos que comparten tablas y release train crea un monolito distribuido. La clasificación debe salir de fronteras observables, no de una etiqueta comercial.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Evidencia |
|---|---|---|
| Unidad lógica | Núcleo | Un módulo agrupa una capacidad y puede vivir dentro de un proceso |
| Artefacto/proceso | Núcleo | Define empaquetado y ejecución, no cohesión interna |
| Monolito modular | Núcleo | Un despliegue contiene módulos con APIs e internals controlados |
| Servicio | Variante | Ofrece una capacidad; no exige proceso remoto |
| Microservicio autónomo | Profundización | Suma contrato, datos, despliegue y operación propios |
| Monolito distribuido | Diagnóstico | Múltiples procesos conservan coordinación obligatoria o datos compartidos |

Analogía: un edificio puede contener departamentos independientes bajo una sola administración; construir varios edificios conectados por pasillos obligatorios no crea independencia. El tamaño no decide: importan responsabilidades y cambios coordinados.

**Límite profesional:** esta clasificación describe estructura observable, pero no demuestra por sí sola buena cohesión, seguridad ni rentabilidad. Dos servicios pueden ser autónomos y aun así estar mal diseñados; esas decisiones requieren las evidencias de los temas siguientes.

```text
1 artefacto + 1 proceso + módulos -> MONOLITO_MODULAR
2 procesos + tablas/release compartidos -> MONOLITO_DISTRIBUIDO
2 procesos + datos/despliegue propios -> SERVICIOS_AUTONOMOS
```

#### Paso 4 · Demostración guiada desde cero

Crea `clasificacion/src/ClasificarArquitectura.java` copiando el archivo completo desde `examples/professional-bridges/microservices/ClasificarArquitectura.java`.

```java
public final class ClasificarArquitectura {
  record Evidencia(int artefactos,int procesos,int modulos,boolean datosCompartidos,
                   boolean despliegueIndependiente) { }
  private ClasificarArquitectura() { }
  static String clasificar(Evidencia e) {
    if (e.artefactos()==1 && e.procesos()==1 && e.modulos()>1) return "MONOLITO_MODULAR";
    if (e.procesos()>1 && (e.datosCompartidos() || !e.despliegueIndependiente()))
      return "MONOLITO_DISTRIBUIDO";
    if (e.procesos()>1 && e.despliegueIndependiente()) return "SERVICIOS_AUTONOMOS";
    return "MONOLITO";
  }
  public static void main(String[] args) {
    System.out.println(clasificar(new Evidencia(1,1,2,true,false)));
    System.out.println(clasificar(new Evidencia(2,2,2,true,false)));
    System.out.println(clasificar(new Evidencia(2,2,2,false,true)));
  }
}
```

```bash
mkdir -p academia-labs/microservices/clasificacion/{src,out,evidence}
cp examples/professional-bridges/microservices/ClasificarArquitectura.java academia-labs/microservices/clasificacion/src/
cd academia-labs/microservices/clasificacion
javac --release 27 -d out src/ClasificarArquitectura.java
java -cp out ClasificarArquitectura
```

**Resultado esperado:** `MONOLITO_MODULAR`, `MONOLITO_DISTRIBUIDO` y `SERVICIOS_AUTONOMOS`.

**Fallo deliberado:** clasifica sólo por `procesos > 1` → **Error esperado:** el segundo caso aparece como autónomo → **Diagnóstico:** ignoraste datos y despliegue coordinado; restaura todas las evidencias.

#### Paso 5 · Práctica guiada

1. **Reproducción:** explica las tres clasificaciones. Pista: separa módulo de proceso.
2. **Variación:** un proceso con un módulo debe dar `MONOLITO`.
3. **Diagnóstico:** dos repositorios con una tabla compartida no son autónomos.
4. **Integración:** inventaría artefactos, procesos, módulos y datos en `evidence/clasificacion.md`.
5. **Diseño:** clasifica una arquitectura real y anota evidencia faltante, sin adivinar.

**Conexión con el proyecto integrador:** conserva la línea base de RutaFlow antes de cualquier extracción.

#### Paso 6 · Práctica independiente

Clasifica cuatro variantes de RutaFlow y defiende cada resultado con artefacto, proceso, propiedad de datos, release y operación. Incluye un caso deliberadamente ambiguo y especifica qué evidencia pedirías.

#### Paso 7 · Cierre

- [ ] Distingo módulo, servicio, proceso y artefacto.
- [ ] Reconozco un monolito modular.
- [ ] Diagnostico un monolito distribuido.
- [ ] No clasifico por tamaño o HTTP.
- [ ] Declaro evidencia faltante.

Si fallas 2 o más puntos, repite la matriz. **Siguiente tema:** «Evaluar autonomía antes de extraer un proceso» (referencia interna M1 T2). **Errores comunes:** equiparar repositorio, API o contenedor con microservicio. **Fuentes oficiales:** [Azure microservices style](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices).

### Tema 2: Evaluar autonomía antes de extraer un proceso · Fundamentos · 45 min

**Prerrequisito:** tema «Distinguir estructura lógica de unidad de despliegue» del módulo «Construir un monolito modular antes de extraer servicios» (referencia interna M1 T1).

**Al finalizar podrás:** decidir si una capacidad está lista para extraerse mediante compatibilidad de contrato, propiedad de datos, despliegue, operación y beneficio medido, y justificar profesionalmente mantenerla modular cuando falta evidencia.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1** y la clasificación anterior. Crea `academia-labs/microservices/autonomia/{src,out,evidence}`. No necesitas Spring ni Docker: la decisión precede a la tecnología de despliegue.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Separar un proceso compra valor sólo si reduce coordinación o aísla una necesidad medible. Sin datos y operación propios, el equipo conserva el acoplamiento y añade red, pipeline e incidentes.

Facturación parece una candidata porque «puede escalar», pero hoy comparte transacción, equipo, base y release con Envíos. El resultado profesional es mantenerla modular hasta demostrar un cuello, una cadencia distinta o requisito regulatorio y preparar ownership completo. «No extraer todavía» es una decisión válida, reversible y medible.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Evidencia |
|---|---|---|
| Contrato compatible | Prerrequisito | Consumidores evolucionan sin despliegue coordinado obligatorio |
| Datos propios | Núcleo | Escrituras y migraciones tienen propietario único |
| Despliegue independiente | Núcleo | Release y rollback no requieren cambiar otros componentes |
| Operación propia | Núcleo | SLO, alertas, capacidad y on-call tienen dueño |
| Beneficio medido | Decisión | Cadencia, aislamiento, regulación o escalado superan costo distribuido |
| Reversibilidad | Límite | ADR define cuándo revisar o revertir la extracción |

Analogía: independizar una tienda exige inventario, caja, personal y responsabilidad propios; mover sólo el letrero a otro local duplica costos sin autonomía.

#### Paso 4 · Demostración guiada desde cero

Crea `autonomia/src/EvaluarAutonomia.java` copiando el archivo completo desde `examples/professional-bridges/microservices/EvaluarAutonomia.java`.

```java
public final class EvaluarAutonomia {
  record Senales(boolean contratoCompatible,boolean datosPropios,boolean despliegueIndependiente,
                 boolean operacionPropia,boolean beneficioMedido) { }
  private EvaluarAutonomia() { }
  static String decidir(Senales s) {
    int autonomy=(s.contratoCompatible()?1:0)+(s.datosPropios()?1:0)
        +(s.despliegueIndependiente()?1:0)+(s.operacionPropia()?1:0);
    return autonomy==4 && s.beneficioMedido()?"CANDIDATO_A_EXTRAER":"MANTENER_MODULAR";
  }
  public static void main(String[] args) {
    System.out.println(decidir(new Senales(true,false,false,false,false)));
    System.out.println(decidir(new Senales(true,true,true,true,true)));
  }
}
```

```bash
mkdir -p academia-labs/microservices/autonomia/{src,out,evidence}
cp examples/professional-bridges/microservices/EvaluarAutonomia.java academia-labs/microservices/autonomia/src/
cd academia-labs/microservices/autonomia
javac --release 27 -d out src/EvaluarAutonomia.java
java -cp out EvaluarAutonomia
```

**Resultado esperado:** `MANTENER_MODULAR` y `CANDIDATO_A_EXTRAER`.

**Fallo deliberado:** decide extraer sólo porque `contratoCompatible=true` → **Error esperado:** el primer caso se vuelve candidato sin datos, despliegue, operación ni beneficio → **Diagnóstico:** una API no compra autonomía; restaura todas las señales.

#### Paso 5 · Práctica guiada

1. **Reproducción:** justifica ambos resultados. Pista: cuatro autonomías y un beneficio.
2. **Variación:** activa datos propios pero no operación; debe mantenerse modular.
3. **Diagnóstico:** detecta «CPU alta» sin perfil atribuible como evidencia insuficiente.
4. **Integración:** crea `evidence/autonomia.csv` con señal, medida, dueño y estado.
5. **Diseño:** define un disparador cuantificable y una condición de reversión.

**Conexión con el proyecto integrador:** esta matriz alimentará el ADR final y puede concluir mantener el monolito.

#### Paso 6 · Práctica independiente

Evalúa Envíos y Facturación por separado. Propón una extracción y una no extracción, cuantifica el beneficio esperado y enumera costos de red, consistencia, seguridad y on-call.

#### Paso 7 · Cierre

- [ ] Exijo contrato, datos, despliegue y operación propios.
- [ ] Vinculo extracción a un beneficio medido.
- [ ] Reconozco evidencia insuficiente.
- [ ] Documento costo distribuido.
- [ ] Defino revisión y reversión.

Si fallas 2 o más puntos, vuelve a la matriz. **Siguiente tema:** «Agrupar código por capacidad de negocio» (referencia interna M1 T3). **Errores comunes:** extraer por moda, CPU global o cantidad de líneas. **Fuentes oficiales:** [Azure domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).

### Tema 3: Agrupar código por capacidad de negocio · Aplicación · 40 min

**Prerrequisito:** tema «Evaluar autonomía antes de extraer un proceso» de este módulo (referencia interna M1 T2).

**Al finalizar podrás:** proponer un límite de módulo a partir de motivos de cambio, invariantes y vocabulario de negocio, y distinguir cohesión real de proximidad accidental.

**¿Por qué es importante?** Agrupar por capacidad, en vez de por capa técnica, determina si un módulo puede cambiar y probarse sin arrastrar al resto; una carpeta por tecnología oculta exactamente esa pregunta.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1**. Crea `academia-labs/microservices/cohesion/{src,out,evidence}` y copia `examples/professional-bridges/microservices/MedirCohesion.java` a `src/`.

#### Paso 2 · Contexto y caso real

RutaFlow organizó controladores, servicios y repositorios en carpetas horizontales. Cambiar la asignación de un envío obliga a saltar entre las tres, mientras Facturación aparece mezclada en cada carpeta. El problema no es Java: el código que cambia por la misma regla de negocio no está junto.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación y evidencia |
|---|---|---|
| Motivo de cambio | Prerrequisito | Commits e incidentes muestran qué clases cambian juntas por una regla |
| Cohesión funcional | Núcleo | Un módulo reúne comportamiento que sirve a una capacidad reconocible |
| Invariante | Núcleo | La regla que debe cumplirse atómicamente orienta el límite transaccional |
| Vocabulario | Núcleo | Un término conserva significado preciso dentro del módulo |
| Acoplamiento aferente/eferente | Diagnóstico | Entradas y salidas revelan quién depende del módulo y de quién depende |
| Cohesión accidental | Límite | Compartir tabla, tecnología o autor no demuestra una capacidad común |

Piensa en un taller: las herramientas se agrupan por trabajo que permiten completar, no por color. Un historial de cambios es evidencia, no una fórmula: dos clases pueden cambiar juntas por una migración temporal. Contrasta commits con conversaciones de dominio, invariantes e incidentes.

#### Paso 4 · Demostración guiada desde cero

```java
import java.util.*;
import java.util.stream.*;
public final class MedirCohesion {
  record Cambio(String motivo,String claseAfectada) {}
  static Map<String,List<String>> agruparPorMotivo(List<Cambio> cambios) {
    return cambios.stream().collect(Collectors.groupingBy(Cambio::motivo,
      Collectors.mapping(Cambio::claseAfectada,Collectors.toList())));
  }
  public static void main(String[] args) {
    var cambios=List.of(new Cambio("regla-envio","CalcularTarifa"),
      new Cambio("regla-envio","AsignarConductor"),new Cambio("regla-factura","CalcularImpuesto"));
    agruparPorMotivo(cambios).forEach((m,c)->System.out.println(m+"="+c.size()));
  }
}
```

```bash
mkdir -p academia-labs/microservices/cohesion/{src,out,evidence}
cp examples/professional-bridges/microservices/MedirCohesion.java academia-labs/microservices/cohesion/src/
cd academia-labs/microservices/cohesion
javac --release 27 -d out src/MedirCohesion.java
java -cp out MedirCohesion
```

**Resultado esperado:** `regla-envio=2` y `regla-factura=1` (el orden puede variar). **Fallo deliberado:** agrupa por sufijo `Service` → **Error esperado:** reglas de Envíos y Facturación quedan juntas → **Diagnóstico:** confundiste capa técnica con capacidad.

#### Paso 5 · Práctica guiada

1. **Reproducción:** explica por qué las dos clases de Envíos forman candidato, no límite probado.
2. **Variación:** añade `NotificarEntrega` con motivo `regla-envio` y discute si pertenece al núcleo o a integración.
3. **Diagnóstico:** identifica un commit masivo de formato como falso indicio de cohesión.
4. **Integración:** crea `evidence/cambios.csv` con motivo, clases, invariante y propietario.
5. **Diseño:** compara organización por capas y por capacidad para el mismo caso.

**Conexión con el proyecto:** el inventario justificará los módulos Envíos y Facturación antes de proteger sus APIs.

#### Paso 6 · Práctica independiente

Clasifica doce clases de RutaFlow en capacidades. Defiende dos decisiones difíciles con motivo de cambio, invariante y vocabulario; registra una evidencia que podría refutarlas.

#### Paso 7 · Cierre

- [ ] Agrupo por capacidad y no por tecnología.
- [ ] Identifico invariantes y motivos de cambio.
- [ ] Mido entradas y salidas sin convertir el conteo en verdad absoluta.
- [ ] Distingo evidencia histórica de coincidencia accidental.
- [ ] Puedo justificar y refutar un límite.

Si fallas 2 o más puntos, repite el inventario. **Siguiente tema:** «Proteger la API pública de un módulo» (referencia interna M1 T4). **Fuentes:** [Azure domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).

### Tema 4: Proteger la API pública de un módulo · Aplicación · 45 min

**Prerrequisito:** tema «Agrupar código por capacidad de negocio» de este módulo (referencia interna M1 T3).

**Al finalizar podrás:** diseñar una API proporcionada pequeña, ocultar internals, inventariar dependencias de código, datos y operación, y diagnosticar modelos compartidos que propagan cambios.

**¿Por qué es importante?** Una API que filtra su implementación interna convierte cada refactorización de esos internals en un cambio coordinado con todos sus consumidores, exactamente lo que un módulo intenta evitar.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1** y el límite propuesto. Crea `academia-labs/microservices/api-modulo/{src,out,evidence}` y copia `ProtegerApiModulo.java`.

#### Paso 2 · Contexto y caso real

Facturación importa el repositorio y la entidad JPA de Envíos. Aunque ambos vivan en un único proceso, ese acceso convierte decisiones internas en contrato y obliga a coordinar cada refactorización.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación y evidencia |
|---|---|---|
| API proporcionada | Núcleo | Expone casos de uso y resultados estables al consumidor |
| Implementación interna | Núcleo | Repositorios, entidades y algoritmos cambian sin afectar consumidores |
| DTO de contrato | Variante | Transporta lo necesario sin filtrar entidad persistente |
| Modelo compartido | Límite | Un DTO universal mezcla significados y amplía el radio de cambio |
| Dependencia no Java | Diagnóstico | Tabla, tópico, disponibilidad o release compartido también acoplan |
| Granularidad | Decisión | API enorme filtra internals; API chatty multiplica coordinación y latencia futura |

La API es la recepción de un taller: acepta una solicitud completa y entrega un resultado; el cliente no entra a mover herramientas. Duplicar un concepto pequeño entre contextos puede ser más seguro que compartir una representación con significados incompatibles.

#### Paso 4 · Demostración guiada desde cero

```java
public final class ProtegerApiModulo {
  public interface RegistrarEnvio { Resultado registrar(Comando comando); }
  public record Comando(String referencia,int kilometros) {}
  public record Resultado(String id,String estado) {}
  private static final class ServicioEnvios implements RegistrarEnvio {
    public Resultado registrar(Comando c) {
      if(c.referencia()==null||c.referencia().isBlank()) throw new IllegalArgumentException("referencia obligatoria");
      return new Resultado("env-001","REGISTRADO");
    }
  }
  public static void main(String[] a) {
    RegistrarEnvio api=new ServicioEnvios();
    System.out.println(api.registrar(new Comando("REF-7",12)));
    System.out.println("contrato="+RegistrarEnvio.class.getSimpleName());
  }
}
```

```bash
mkdir -p academia-labs/microservices/api-modulo/{src,out,evidence}
cp examples/professional-bridges/microservices/ProtegerApiModulo.java academia-labs/microservices/api-modulo/src/
cd academia-labs/microservices/api-modulo
javac --release 27 -d out src/ProtegerApiModulo.java
java -cp out ProtegerApiModulo
```

**Resultado esperado:** `Resultado[id=env-001, estado=REGISTRADO]` y `contrato=RegistrarEnvio`. **Fallo deliberado:** vuelve pública `ServicioEnvios` y úsala como tipo del consumidor → **Error esperado:** el consumidor queda ligado a la implementación → **Diagnóstico:** confundiste acceso posible con contrato permitido.

#### Paso 5 · Práctica guiada

1. **Reproducción:** señala contrato, comando, resultado e internal.
2. **Variación:** cambia el algoritmo interno sin modificar ni recompilar conceptualmente al consumidor.
3. **Diagnóstico:** rechaza devolver una entidad JPA con relaciones perezosas.
4. **Integración:** registra `origen,destino,tipo,motivo,propietario` para código, datos, eventos y operación.
5. **Diseño:** convierte tres getters conversacionales en una operación coherente de negocio.

**Límite profesional:** `private` o un `grep` no detectan reflexión, SQL compartido ni acoplamiento temporal; se necesitan fitness functions y pruebas operativas.

#### Paso 6 · Práctica independiente

Diseña la API de Facturación con dos casos de uso. Explica qué campos no expones, cómo versionarías un cambio compatible y qué dependencia de datos seguiría impidiendo extraerla.

#### Paso 7 · Cierre

- [ ] Expongo casos de uso, no repositorios.
- [ ] Mantengo entidades e implementación internas.
- [ ] Inventarío código, datos, eventos y operación.
- [ ] Evito el modelo corporativo universal.
- [ ] Equilibro API estable y conversación excesiva.

Si fallas 2 o más puntos, rediseña el contrato. **Siguiente tema:** «Mantener reglas de dominio libres de frameworks» (referencia interna M1 T5). **Fuentes:** [Spring Modulith — módulos e interfaces](https://docs.spring.io/spring-modulith/reference/fundamentals.html).

### Tema 5: Mantener reglas de dominio libres de frameworks · Aplicación · 40 min

**Prerrequisito:** tema «Proteger la API pública de un módulo» de este módulo (referencia interna M1 T4).

**Al finalizar podrás:** implementar y probar una regla de dominio sin Spring, HTTP, JPA ni red, conservando invariantes, tipos y errores propios del negocio.

**¿Por qué es importante?** Si la regla de negocio solo compila con Spring y JPA en el classpath, cambiar el framework o la base de datos obliga a reescribir la regla, no solo su conexión con el mundo exterior.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1**. Crea `academia-labs/microservices/dominio-puro/{src,out,evidence}` y copia `CalcularTarifaPura.java`.

#### Paso 2 · Contexto y caso real

RutaFlow necesita calcular una tarifa. Si esa regla recibe `HttpServletRequest`, usa una entidad JPA o necesita iniciar Spring, cambiar transporte o persistencia exige tocar la política de negocio y sus pruebas se vuelven lentas y frágiles.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación y evidencia |
|---|---|---|
| Política y mecanismo | Prerrequisito | La fórmula decide negocio; HTTP/JPA ejecutan detalles externos |
| Invariante | Núcleo | Distancia no negativa y peso positivo se validan en la regla |
| Tipo de dominio | Núcleo | Un valor expresa unidad y evita estados ambiguos |
| Error de dominio | Diagnóstico | El rechazo explica la condición violada sin código HTTP |
| Dependencia hacia dentro | Núcleo | Frameworks pueden llamar al dominio; el dominio no los importa |
| Pureza pragmática | Límite | Reloj, aleatoriedad o tasa externa se inyectan cuando afectan determinismo |

La regla es una receta; el horno es un mecanismo. Cambiar el horno no debe reescribir cantidades ni restricciones. «Sin framework» no significa sin dependencias: significa que las dependencias centrales expresan el dominio y son controlables.

#### Paso 4 · Demostración guiada desde cero

```java
public final class CalcularTarifaPura {
  public long enCentavos(int kilometros,int kilos) {
    if(kilometros<0||kilos<=0) throw new IllegalArgumentException("distancia/peso inválidos");
    return 1_000L+kilometros*80L+kilos*120L;
  }
  public static void main(String[] a) {
    var c=new CalcularTarifaPura();
    System.out.println(c.enCentavos(10,2));
    try { c.enCentavos(10,0); } catch(IllegalArgumentException e) { System.out.println(e.getMessage()); }
  }
}
```

```bash
mkdir -p academia-labs/microservices/dominio-puro/{src,out,evidence}
cp examples/professional-bridges/microservices/CalcularTarifaPura.java academia-labs/microservices/dominio-puro/src/
cd academia-labs/microservices/dominio-puro
javac --release 27 -d out src/CalcularTarifaPura.java
java -cp out CalcularTarifaPura
```

**Resultado esperado:** `2040` y `distancia/peso inválidos`. **Fallo deliberado:** acepta peso cero → **Error esperado:** produce una tarifa para un envío imposible → **Diagnóstico:** la validación quedó fuera del límite que protege la invariante.

#### Paso 5 · Práctica guiada

1. **Reproducción:** calcula manualmente 2040.
2. **Variación:** crea un tipo `Kilometros` que rechace negativos al construirse.
3. **Diagnóstico:** identifica por qué `@Service` en la regla invierte la dirección deseada.
4. **Integración:** traduce el error de dominio a HTTP 400 sólo en un adaptador.
5. **Diseño:** inyecta un reloj para una tarifa nocturna reproducible.

**Conexión con el proyecto:** esta regla será estable al cambiar persistencia y transporte.

#### Paso 6 · Práctica independiente

Implementa recargo por zona con tabla de casos, límites y errores. Demuestra que compila y ejecuta sólo con el JDK; documenta cuándo necesitarías decimal exacto en vez de centavos enteros.

#### Paso 7 · Cierre

- [ ] Separo política de mecanismo.
- [ ] Protejo invariantes dentro del dominio.
- [ ] No filtro HTTP, JPA o Spring.
- [ ] Hago deterministas reloj y aleatoriedad.
- [ ] Pruebo error y camino feliz.

**Siguiente tema:** «Sustituir adaptadores mediante puertos» (referencia interna M1 T6). **Fuentes:** [Azure domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).

### Tema 6: Sustituir adaptadores mediante puertos · Aplicación · 45 min

**Prerrequisito:** tema «Mantener reglas de dominio libres de frameworks» de este módulo (referencia interna M1 T5).

**Al finalizar podrás:** distinguir puertos de entrada y salida, conectar adaptadores en memoria o externos, y decidir cuándo una interfaz protege una frontera real.

**¿Por qué es importante?** Sin un puerto que el núcleo posea, probar la regla de negocio exige levantar la base de datos real; con él, un adaptador en memoria sustituye al externo sin tocar el caso de uso ni su prueba.

#### Paso 1 · Objetivo y preparación

Crea `academia-labs/microservices/puertos/{src,out,evidence}` con **JDK 27.0.1** y copia `SustituirAdaptador.java`.

#### Paso 2 · Contexto y caso real

El caso de uso Registrar Envío debe funcionar con memoria en una prueba y con JPA en producción. Si instancia el repositorio concreto, el dominio decide un mecanismo que no le pertenece.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación y evidencia |
|---|---|---|
| Puerto de entrada | Núcleo | Declara el caso de uso ofrecido a UI, HTTP o mensajería |
| Puerto de salida | Núcleo | Declara una necesidad del caso de uso, con lenguaje propio |
| Adaptador de entrada | Variante | Traduce protocolo, autentica formato y llama al puerto |
| Adaptador de salida | Variante | Implementa persistencia o integración concreta |
| Inversión de dependencias | Núcleo | La interfaz pertenece al núcleo que necesita la capacidad |
| Abstracción accidental | Límite | Una interfaz sin frontera ni sustitución sólo duplica una clase |
| Semántica remota | Profundización | Un adaptador remoto agrega deadline, fallo parcial y observabilidad |

Un enchufe define la forma requerida por el aparato; distintos adaptadores conectan fuentes concretas. La interfaz no vuelve local una operación remota ni elimina su costo.

#### Paso 4 · Demostración guiada desde cero

```java
import java.util.*;
public final class SustituirAdaptador {
 record Envio(String id,String estado) {}
 interface GuardarEnvio { void guardar(Envio e); }
 static final class Memoria implements GuardarEnvio {
  final Map<String,Envio> datos=new HashMap<>(); public void guardar(Envio e){datos.put(e.id(),e);}
 }
 static final class RegistrarEnvio {
  private final GuardarEnvio salida; RegistrarEnvio(GuardarEnvio s){salida=s;}
  Envio ejecutar(String id){var e=new Envio(id,"REGISTRADO");salida.guardar(e);return e;}
 }
 public static void main(String[] a){var m=new Memoria();System.out.println(new RegistrarEnvio(m).ejecutar("env-7"));System.out.println("guardados="+m.datos.size());}
}
```

```bash
mkdir -p academia-labs/microservices/puertos/{src,out,evidence}
cp examples/professional-bridges/microservices/SustituirAdaptador.java academia-labs/microservices/puertos/src/
cd academia-labs/microservices/puertos && javac --release 27 -d out src/SustituirAdaptador.java && java -cp out SustituirAdaptador
```

**Resultado esperado:** envío `REGISTRADO` y `guardados=1`. **Fallo deliberado:** instancia `Memoria` dentro de `RegistrarEnvio` → **Error esperado:** no puedes sustituirla desde la composición → **Diagnóstico:** el núcleo volvió a controlar el mecanismo.

#### Paso 5 · Práctica guiada

1. **Reproducción:** marca puerto, adaptador y punto de composición.
2. **Variación:** implementa un segundo adaptador que registre llamadas.
3. **Diagnóstico:** reemplaza `guardar` por CRUD genérico y detecta la filtración de persistencia.
4. **Integración:** bosqueja un adaptador HTTP que traduzca, sin mover invariantes.
5. **Diseño:** agrega a un adaptador remoto deadline y error explícito.

#### Paso 6 · Práctica independiente

Crea el puerto `BuscarPendientesDeAsignacion`, dos adaptadores y la misma prueba contractual para ambos. Justifica por qué el puerto pertenece a Envíos.

#### Paso 7 · Cierre

- [ ] Distingo entrada, salida y adaptador.
- [ ] El núcleo posee la abstracción que necesita.
- [ ] Sustituyo mecanismos sin cambiar el caso de uso.
- [ ] No creo interfaces ceremoniales.
- [ ] Conservo semántica de fallos remotos.

**Siguiente tema:** «Representar dependencias de módulos como un grafo» (referencia interna M1 T7). **Fuentes:** [Azure domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).

### Tema 7: Representar dependencias de módulos como un grafo · Integración · 35 min

**Prerrequisito:** tema «Sustituir adaptadores mediante puertos» de este módulo (referencia interna M1 T6).

**Al finalizar podrás:** construir un grafo dirigido respaldado por dependencias de código, datos, eventos y runtime, y detectar ciclos directos o transitivos.

**¿Por qué es importante?** Un ciclo lógico vuelve ficticia la autonomía: ninguno de los módulos puede cambiar, probarse o extraerse sin conocer al otro.

#### Paso 1 · Objetivo y preparación

Usarás **JDK 27.0.1** y Graphviz opcional. Crea `academia-labs/microservices/grafo/{src,out,evidence}` y copia `DetectarCiclo.java`.

#### Paso 2 · Contexto y caso real

Envíos llama a Facturación, Facturación publica a Notificaciones y Notificaciones consulta Envíos. El diagrama oficial omite la última arista: la documentación parece acíclica, pero el cambio real exige coordinar los tres módulos.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema | Papel | Evidencia observable |
|---|---|---|
| Grafo dirigido | Prerrequisito | nodo=módulo, arista=dependencia |
| Dependencia estable | Decisión | API pequeña cambia menos que internals |
| Ciclo directo/transitivo | Diagnóstico | Envíos→Facturación→Notificaciones→Envíos |
| Acoplamiento temporal | Profundización | ambos deben estar disponibles en el mismo instante |
| Acoplamiento de datos | Límite | tabla compartida crea dependencia sin import |
| Ruptura de ciclo | Aplicación | evento, inversión o reasignación de responsabilidad |

Un nodo es un módulo y una arista `A→B` afirma que A necesita B. El tipo de arista importa: código, escritura de tabla, disponibilidad síncrona, evento o despliegue. Un grafo acíclico permite ordenar evolución; no garantiza buen diseño. Un ciclo demuestra que el orden independiente es imposible bajo esas relaciones.

El costo de coordinación se observa: cantidad de repositorios/cambios que deben liberarse juntos, equipos consultados, pruebas cruzadas y ventanas de despliegue. No uses un número de imports como única decisión; combínalo con propiedad de datos, fallos y ritmo de cambio.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir -p academia-labs/microservices/grafo/{src,out,evidence}
cp examples/professional-bridges/microservices/DetectarCiclo.java academia-labs/microservices/grafo/src/
cd academia-labs/microservices/grafo
javac --release 27 -d out src/DetectarCiclo.java
java -cp out DetectarCiclo
```

**Resultado esperado:** `ciclo=true`. **Fallo deliberado:** elimina la arista del mapa, pero conserva la consulta real → **Error esperado:** `ciclo=false` falso → **Diagnóstico:** el grafo no está respaldado por inventario verificable.

#### Paso 5 · Práctica guiada

1. Reproduce el ciclo y enumera su camino.
2. Añade una arista sin ciclo y explica por qué no basta contar aristas.
3. Diagnostica una tabla compartida invisible para imports.
4. Genera `evidence/dependencias.csv` con origen, destino, tipo y evidencia.
5. Dibuja código, datos y runtime con estilos distintos.

**Límite profesional:** Graphviz dibuja lo declarado y ArchUnit ve bytecode; ninguno descubre por sí solo todas las relaciones operativas.

#### Paso 6 · Práctica independiente

Modela cinco módulos, incluye un ciclo transitivo y demuestra el camino. Propón la prueba que mantendrá actualizada cada clase de arista.

#### Paso 7 · Cierre

- [ ] Distingo nodo, dirección y tipo de arista.
- [ ] Detecto ciclos transitivos.
- [ ] Respaldo el dibujo con evidencia.
- [ ] Incluyo datos y runtime.
- [ ] No confundo DAG con buen diseño.

**Siguiente tema:** «Romper ciclos según el tipo de acoplamiento» (referencia interna M1 T8). **Fuente:** [Spring Modulith verification](https://docs.spring.io/spring-modulith/reference/verification.html).

### Tema 8: Romper ciclos según el tipo de acoplamiento · Integración · 45 min

**Prerrequisito:** tema «Representar dependencias de módulos como un grafo» de este módulo (referencia interna M1 T7).

**Al finalizar podrás:** elegir entre mover responsabilidad, invertir dependencia o publicar un evento, y comprobar que la ruptura reduce coordinación en vez de ocultarla.

**¿Por qué es importante?** Un ciclo entre módulos impide desplegarlos, probarlos o evolucionarlos por separado; la estrategia elegida para romperlo decide si esa independencia es real o solo cambió de forma.

#### Paso 1 · Objetivo y preparación

Crea `academia-labs/microservices/romper-ciclo/{src,out,evidence}` y copia `RomperCiclo.java`.

#### Paso 2 · Contexto y caso real

Notificaciones llama a Envíos para confirmar un estado que Envíos ya decidió. Reemplazar la llamada por un evento pasado puede eliminar el retorno, siempre que Notificaciones tolere asincronía y no responda con otra llamada obligatoria. El ciclo original no apareció en un diagrama: apareció en el inventario del Tema 7, donde la arista `notificaciones -> envios` quedó registrada junto con la arista inversa ya conocida.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación y evidencia |
|---|---|---|
| Mover responsabilidad | Núcleo | La decisión vive con la invariante que la gobierna |
| Invertir dependencia | Variante | El consumidor define la interfaz que necesita |
| Evento pasado | Variante | Publica un hecho con dueño sin exigir respuesta inmediata |
| Acoplamiento temporal | Diagnóstico | Disponibilidad simultánea puede sobrevivir sin ciclo de código |
| Acoplamiento de datos | Diagnóstico | Escritura compartida conserva coordinación transaccional |
| Consistencia eventual | Límite | Evento introduce demora, duplicados, orden y recuperación |
| Costo de coordinación | Decisión | Releases, equipos y pruebas conjuntas deben disminuir |

Cambiar una flecha en el dibujo no rompe una cadena de decisiones. Un evento es como una notificación postal: desacopla el momento, pero exige identificar, reintentar y tolerar duplicados.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir -p academia-labs/microservices/romper-ciclo/{src,out,evidence}
cp examples/professional-bridges/microservices/RomperCiclo.java academia-labs/microservices/romper-ciclo/src/
cd academia-labs/microservices/romper-ciclo
javac --release 27 -d out src/RomperCiclo.java && java -cp out RomperCiclo
```

**Resultado esperado:** `eventos=1`. **Fallo deliberado:** el consumidor llama síncronamente al productor para completar cada evento → **Error esperado:** reaparece el ciclo temporal → **Diagnóstico:** cambió el protocolo, no la responsabilidad.

#### Paso 5 · Práctica guiada

1. Reproduce el hecho `EnvioConfirmado`.
2. Añade identificador para deduplicación.
3. Diagnostica un evento imperativo llamado `ConfirmarEnvio`.
4. Actualiza grafo e inventario después de la ruptura.
5. Compara releases y pruebas coordinadas antes/después.

#### Paso 6 · Práctica independiente

Rompe dos ciclos distintos: uno de código y otro de datos. Justifica estrategias diferentes, riesgos y evidencia de reducción de coordinación.

#### Paso 7 · Cierre

- [ ] Sitúo la decisión con su invariante.
- [ ] Uso eventos sólo si tolero asincronía.
- [ ] Considero duplicados, orden y recuperación.
- [ ] Reviso datos y disponibilidad.
- [ ] Mido coordinación antes y después.

**Siguiente tema:** «Bloquear accesos a internals con ArchUnit» (referencia interna M1 T9). **Fuente:** [Spring Modulith verification](https://docs.spring.io/spring-modulith/reference/verification.html).

### Tema 9: Bloquear accesos a internals con ArchUnit · Integración · 40 min

**Prerrequisito:** tema «Romper ciclos según el tipo de acoplamiento» de este módulo (referencia interna M1 T8).

**Al finalizar podrás:** importar bytecode con ArchUnit, bloquear dependencias a paquetes internos y leer el origen y destino de una violación.

**¿Por qué es importante?** Una regla escrita en un diagrama se degrada; una fitness function falla exactamente cuando el código contradice la arquitectura acordada.

#### Paso 1 · Objetivo y preparación

Usarás JDK, Maven (`./mvnw`) y `examples/archunit-hexagonal-rutaflow`. Una fitness function es una propiedad arquitectónica ejecutable, no una prueba de que toda la arquitectura sea correcta.

#### Paso 2 · Contexto y caso real

Facturación compila después de importar `envios.internal.ServicioEnvios`. La revisión humana puede omitirlo; una regla en cada pull request convierte el límite acordado en fallo reproducible. El ejemplo verificable vive en `examples/archunit-hexagonal-rutaflow`, bajo el paquete `academia.rutaflow.modules`, con los tres módulos (Envíos, Facturación, Notificaciones) ya separados en `api` e `internal`.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema | Papel | Evidencia observable |
|---|---|---|
| Importación de bytecode | Prerrequisito | ArchUnit analiza clases compiladas |
| Regla de capas | Núcleo | dominio no depende de adapters |
| Regla de internals | Núcleo | Facturación no accede a `envios.internal` |
| Slices y ciclos | Núcleo | el build informa el camino completo del ciclo |
| Falsos positivos/exclusiones | Límite | exclusión documentada no se usa para silenciar deuda |
| Spring Modulith | Variante | `ApplicationModules.verify()` comprueba ciclos/API/allowedDependencies |

ArchUnit inspecciona dependencias del bytecode compilado. La selección `resideInAPackage` define sujetos y el predicado `dependOnClassesThat` define la relación prohibida. El mensaje debe expresar intención de negocio. No ve SQL dinámico, reflexión arbitraria ni coordinación operacional.

#### Paso 4 · Demostración guiada desde cero

```java
package academia.rutaflow.modules;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class RutaflowModulesArchitectureTest {
  private final JavaClasses project = new ClassFileImporter()
      .importPackages("academia.rutaflow.modules");

  @Test
  void facturacionNoAccedeAInternalsDeEnvios() {
    ArchRule rule = noClasses().that().resideOutsideOfPackage("..envios..")
        .should().dependOnClassesThat().resideInAPackage("..envios.internal..")
        .because("solo envios.internal puede depender de su propia implementación");
    rule.check(project);
  }
}
```

```bash
cd examples/archunit-hexagonal-rutaflow
./mvnw test -Dtest=RutaflowModulesArchitectureTest
```

**Resultado esperado:** `BUILD SUCCESS`; la regla pasa mientras Facturación consulte `envios.api.ConsultarEstadoEnvio` en vez de `envios.internal.ServicioEnvios`. **Fallo deliberado:** crea una clase en `facturacion.internal` que recibe `ServicioEnvios` por constructor → **Error esperado:** `Architecture Violation` nombrando el constructor exacto, la clase origen (`facturacion.internal.*`) y el tipo destino (`envios.internal.ServicioEnvios`) → **Diagnóstico:** el consumidor atravesó la API pública y tomó la implementación interna.

#### Paso 5 · Práctica guiada

1. Identifica clases importadas y regla evaluada.
2. Protege también `facturacion.internal`.
3. Provoca una violación y conserva el fragmento del reporte.
4. Corrige mediante la API, no mediante exclusión.
5. Añade la prueba al pipeline de pull requests.

#### Paso 6 · Práctica independiente

Protege internals de tres módulos y redacta mensajes accionables. Documenta una dependencia que ArchUnit no pueda detectar y su fitness function complementaria.

#### Paso 7 · Cierre

- [ ] Sé qué bytecode importa ArchUnit.
- [ ] Selecciono origen y destino correctos.
- [ ] Observo rojo antes de corregir.
- [ ] No silencio deuda con exclusiones.
- [ ] Reconozco límites de inspección estática.

**Siguiente tema:** «Detectar ciclos de paquetes con ArchUnit» (referencia interna M1 T10). **Fuente:** [ArchUnit User Guide](https://www.archunit.org/userguide/html/000_Index.html).

### Tema 10: Detectar ciclos de paquetes con ArchUnit · Integración · 35 min

**Prerrequisito:** tema «Bloquear accesos a internals con ArchUnit» de este módulo (referencia interna M1 T9).

**Al finalizar podrás:** agrupar paquetes como slices, detectar ciclos completos y comprobar que el patrón corresponde a los módulos reales.

**¿Por qué es importante?** Una regla que solo bloquea el acceso a `internal` puede quedar verde aunque los módulos se llamen circularmente a través de sus APIs públicas; detectar el ciclo requiere una regla sobre el grafo completo de módulos.

#### Paso 1 · Objetivo y preparación

Continúa en `examples/archunit-hexagonal-rutaflow`; conserva una copia del grafo del Tema 7 para comparar intención y bytecode.

#### Paso 2 · Contexto y caso real

Una regla de internals puede quedar verde aunque Envíos, Facturación y Notificaciones se llamen circularmente por APIs públicas. El ciclo requiere una regla sobre el grafo completo, porque proteger solo el acceso a paquetes internos no dice nada sobre el orden en que los módulos pueden desplegarse o evolucionar.

#### Paso 3 · Teoría, modelo mental y analogía

`slices().matching("academia.rutaflow.modules.(*)..")` captura el segmento que sigue a `modules` como nombre del slice, así que `academia.rutaflow.modules.envios.api` y `academia.rutaflow.modules.envios.internal` cuentan como el mismo módulo `envios`. Un ciclo directo es A→B→A; uno transitivo atraviesa un tercer módulo, como A→B→C→A, y es más fácil de introducir sin notarlo porque ningún par de módulos se llama directamente entre sí. Si el patrón no captura ninguna clase (por ejemplo, por un typo en el paquete raíz) o agrupa capas técnicas como si fueran módulos de negocio, la regla pasa en verde sin haber evaluado nada real: el Tema 11 construye precisamente la defensa contra ese escenario. Spring Modulith ofrece `ApplicationModules.of(...).verify()` como alternativa declarativa para proyectos que ya siguen su convención de paquetes, pero delegar en ella tampoco exime de confirmar que detectó los módulos esperados.

#### Paso 4 · Demostración guiada desde cero

```java
import static com.tngtech.archunit.library.dependencies.SlicesRuleDefinition.slices;

@Test
void losModulosEstanLibresDeCiclos() {
  ArchRule rule = slices().matching("academia.rutaflow.modules.(*)..")
      .should().beFreeOfCycles()
      .because("los módulos deben poder evolucionar en un orden acíclico");
  rule.check(project);
}
```

```bash
cd examples/archunit-hexagonal-rutaflow
./mvnw test -Dtest=RutaflowModulesArchitectureTest
```

**Resultado esperado:** `BUILD SUCCESS` con el grafo actual (sin ciclos entre envios, facturacion y notificaciones). **Fallo deliberado:** agrega una clase en `envios.internal` que reciba `notificaciones.api.NotificarEntrega` por constructor → **Error esperado:** `Cycle detected: Slice envios -> Slice notificaciones -> Slice envios`, con el constructor y el campo exactos que cierran el ciclo → **Diagnóstico:** el orden independiente dejó de existir: envios ya no puede desplegarse ni compilarse sin notificaciones.

#### Paso 5 · Práctica guiada

1. Explica qué captura `(*)`.
2. Provoca ciclo directo y transitivo.
3. Cambia a un patrón incorrecto y observa el falso verde.
4. Aserta nombres/cantidad de módulos detectados.
5. Compara el camino con `evidence/dependencias.csv`.

#### Paso 6 · Práctica independiente

Adapta el patrón a una estructura con prefijo `rutaflow.modulos.<nombre>`. Demuestra rojo, corrige el ciclo y vuelve a verde sin ignorar paquetes.

#### Paso 7 · Cierre

- [ ] El patrón representa módulos reales.
- [ ] Distingo ciclos directos y transitivos.
- [ ] Verifico que la regla detecta clases.
- [ ] Leo el camino completo.
- [ ] No confundo API pública con ausencia de ciclo.

**Siguiente tema:** «Evitar falsos verdes en fitness functions» (referencia interna M1 T11). **Fuente:** [ArchUnit User Guide](https://www.archunit.org/userguide/html/000_Index.html).

### Tema 11: Evitar falsos verdes en fitness functions · Integración · 35 min

**Prerrequisito:** tema «Detectar ciclos de paquetes con ArchUnit» de este módulo (referencia interna M1 T10).

**Al finalizar podrás:** probar la propia fitness function, gobernar excepciones y combinar controles de código, datos, contratos y operación.

**¿Por qué es importante?** Una fitness function que nunca se probó a sí misma puede pasar en verde sin haber evaluado el sistema real; nadie investiga una regla que pasa, así que el defecto se acumula sin que nada lo señale.

#### Paso 1 · Objetivo y preparación

Usa la misma suite. Registra para cada regla: intención, alcance, violación sembrada, propietario y fecha de revisión; esa tabla es la que distingue una regla auditada de una que solo existe en el pipeline.

#### Paso 2 · Contexto y caso real

Una reorganización movió clases a `com.rutaflow`; la regla aún busca `academia.rutaflow.modules` y deja de encontrar nada del sistema real. ArchUnit 1.5.1 ya falla por defecto (`failOnEmptyShould = true`) cuando una regla no evalúa ninguna clase, así que el escenario ingenuo de "verde silencioso" no ocurre con la configuración por defecto de esta versión — pero esa protección depende de una propiedad de configuración que alguien podría deshabilitar sin darse cuenta (`allowEmptyShould(true)` en una regla, o `archRule.failOnEmptyShould = false` globalmente) para "arreglar" un build que fallaba por un import mal escrito.

#### Paso 3 · Teoría, modelo mental y analogía

Una alarma debe probarse con humo controlado, no asumiendo que suena porque nunca se escuchó lo contrario. Verificado con el proyecto real: deshabilitar la importación (apuntar a un paquete inexistente) hace que las reglas de internals y de ciclos fallen explícitamente con el mensaje "failed to check any classes", exactamente el comportamiento por defecto que protege contra el falso verde. Aun así, una aserción propia que confirme que el conjunto de clases importado no está vacío documenta esa garantía en el código mismo, en vez de depender silenciosamente de una opción de configuración que un cambio futuro podría desactivar. Una exclusión documentada necesita razón de negocio, dueño identificable y fecha de vencimiento; sin esos tres datos, la lista de exclusiones se convierte en el lugar donde la deuda arquitectónica se esconde en vez de resolverse. El bytecode que ArchUnit inspecciona se complementa con pruebas de contrato entre servicios, ownership explícito de migraciones de esquema y pruebas de degradación ante fallos parciales: ninguna herramienta individual cubre todas las formas en que un sistema distribuido puede acoplarse.

#### Paso 4 · Demostración guiada desde cero

```java
@Test
void laImportacionRealmenteEncontroClases() {
  assertThat(project).isNotEmpty();
}
```

```bash
cd examples/archunit-hexagonal-rutaflow
./mvnw test -Dtest=RutaflowModulesArchitectureTest
```

**Resultado esperado:** `BUILD SUCCESS`, las tres pruebas en verde. **Fallo deliberado:** cambia el paquete importado a uno inexistente (por ejemplo `academia.rutaflow.paquete.inexistente`) → **Error esperado:** las TRES pruebas fallan — la propia (`Expecting actual not to be empty`) y las dos reglas de ArchUnit, cada una con "failed to check any classes" por el `failOnEmptyShould` activo por defecto → **Diagnóstico:** confirmaste que ni tu aserción ni la protección por defecto de la biblioteca dejan pasar un alcance vacío sin aviso.

#### Paso 5 · Práctica guiada

1. Aserta alcance no vacío.
2. Siembra una dependencia prohibida y exige rojo.
3. Registra una excepción temporal con vencimiento.
4. Añade control de ownership de esquema.
5. Define qué regla detecta disponibilidad coordinada.

#### Paso 6 · Práctica independiente

Construye una matriz `riesgo → señal → fitness function → límite`. Incluye reflexión, SQL compartido, contrato incompatible y dependencia temporal, y anota para cada fila qué tipo de evidencia adicional (contrato, migración, degradación) cubre lo que ArchUnit no puede ver.

#### Paso 7 · Cierre

- [ ] Pruebo alcance y sensibilidad.
- [ ] Observo rojo deliberado.
- [ ] Gobierno excepciones con vencimiento.
- [ ] Combino controles heterogéneos.
- [ ] No presento ArchUnit como verificación total.

**Siguiente tema:** «Medir señales que justifican una extracción» (referencia interna M1 T12). **Fuente:** [ArchUnit User Guide](https://www.archunit.org/userguide/html/000_Index.html).

### Tema 12: Medir señales que justifican una extracción · Experto · 40 min

**Prerrequisito:** tema «Evitar falsos verdes en fitness functions» de este módulo (referencia interna M1 T11).

**Al finalizar podrás:** reunir evidencia de cadencia, capacidad, aislamiento, ownership y datos, y separar una señal útil de una conclusión prematura.

**¿Por qué es importante?** Extraer un servicio sin evidencia atribuible cambia un cuello de botella técnico por costo de red, consistencia y operación distribuida, sin garantizar que el problema original se resuelva.

#### Paso 1 · Objetivo y preparación

Crea `academia-labs/microservices/senales/{src,out,evidence}` con **JDK 27.0.1** y copia `EvaluarExtraccion.java`.

#### Paso 2 · Contexto y caso real

Facturación consume CPU alta durante cierres, pero comparte equipo, tabla y transacción con Envíos. Escalarla por separado podría ayudar, aunque primero se necesita atribución sostenida y capacidad operativa; CPU global no prueba un límite de negocio. El mismo pico de CPU podría explicarse por un reporte mensual mal indexado, no por una carga que justifique su propio proceso y su propio equipo de guardia.

#### Paso 3 · Teoría, modelo mental y analogía

| Subtema crítico | Papel | Explicación y evidencia |
|---|---|---|
| Cadencia de cambio | Núcleo | Releases distintos y conflictos muestran coordinación evitables |
| Perfil de capacidad | Variante | CPU, memoria o I/O deben atribuirse al módulo y ventana |
| Aislamiento de fallo | Variante | Incidentes demuestran radio de impacto reducible |
| Ownership completo | Núcleo | Equipo posee código, datos, SLO, alertas y on-call |
| Acoplamiento de datos | Diagnóstico | Join, transacción o migración compartida bloquea autonomía |
| Costo distribuido | Límite | Red, consistencia, seguridad, pipeline y carga cognitiva se presupuestan |
| Umbral de revisión | Decisión | Ventana y medida evitan decisiones por un pico aislado |

Una señal es una pista, no un veredicto. Como separar una línea de producción, la inversión sólo se justifica si el cuello está localizado y el nuevo equipo puede operar la línea completa, no solo el fragmento de código que motivó la conversación. Combinar varias señales débiles en un umbral explícito (por ejemplo, CPU atribuible sostenido más incidentes de aislamiento más un equipo dispuesto a asumir on-call) produce una decisión más defendible que cualquier métrica aislada.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir -p academia-labs/microservices/senales/{src,out,evidence}
cp examples/professional-bridges/microservices/EvaluarExtraccion.java academia-labs/microservices/senales/src/
cd academia-labs/microservices/senales
javac --release 27 -d out src/EvaluarExtraccion.java && java -cp out EvaluarExtraccion
```

**Resultado esperado:** `MANTENER_MODULAR` y `REVISAR_EXTRACCION`. **Fallo deliberado:** decide sólo por CPU → **Error esperado:** un módulo sin datos ni on-call propios se marca candidato → **Diagnóstico:** confundiste cuello técnico con autonomía viable.

#### Paso 5 · Práctica guiada

1. Reproduce ambas decisiones.
2. Cambia una señal por vez.
3. Diagnostica un promedio que oculta picos.
4. Registra fuente, ventana, dueño y limitación en CSV.
5. Estima costo de pipeline, observabilidad e incidentes.

#### Paso 6 · Práctica independiente

Compara Envíos y Facturación durante 30 días simulados. Formula una hipótesis favorable y otra contraria a extraer; declara evidencia faltante.

#### Paso 7 · Cierre

- [ ] Atribuyo métricas al módulo.
- [ ] Exijo ownership de datos y operación.
- [ ] Cuantifico costo distribuido.
- [ ] Uso ventanas y umbrales.
- [ ] Puedo concluir «mantener modular».

**Siguiente tema:** «Registrar una decisión reversible en un ADR» (referencia interna M1 T13). **Fuente:** [Azure domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).

### Tema 13: Registrar una decisión reversible en un ADR · Experto · 40 min

**Prerrequisito:** tema «Medir señales que justifican una extracción» de este módulo (referencia interna M1 T12).

**Al finalizar podrás:** redactar un ADR que conecte contexto, opciones, evidencia, consecuencias, disparador de revisión y reversión.

**¿Por qué es importante?** Una decisión sin alternativas registradas ni condición de revisión no puede evaluarse después con información nueva; queda como una preferencia, no como algo que otra persona pueda auditar o revertir.

#### Paso 1 · Objetivo y preparación

Crea `academia-labs/microservices/adr/docs/adr` y conserva las evidencias del tema anterior. Un ADR registra una decisión situada; no es una justificación retrospectiva.

#### Paso 2 · Contexto y caso real

RutaFlow decide mantener Facturación modular. La decisión es profesional porque reconoce evidencia insuficiente y define cuándo volver a evaluarla, no porque prometa que nunca habrá extracción. Dentro de seis meses, otra persona del equipo debe poder leer el ADR y entender por qué se decidió así con la información disponible entonces, sin necesitar preguntarle a quien lo escribió.

#### Paso 3 · Teoría, modelo mental y analogía

Un ADR incluye contexto verificable, al menos dos opciones —incluido no cambiar—, decisión, consecuencias positivas y negativas, estado, dueño y condición de revisión. La reversibilidad exige saber qué preservar y qué costo dispara rollback. «Microservicios escalan» no es evidencia ni alternativa: es una afirmación general que no cita ninguna señal concreta del Tema 12 ni compromete a nadie a revisarla cuando las condiciones cambien.

#### Paso 4 · Demostración guiada desde cero

```markdown
# ADR-0001: mantener Facturación en el monolito modular
## Contexto
Un equipo, una cadencia y transacción local; sin cuello atribuible sostenido.
## Opciones
1. Mantener el módulo protegido. 2. Extraer proceso y datos.
## Decisión
Mantener; hoy el costo distribuido supera el beneficio observado.
## Consecuencias
Conservamos transacción local; posponemos escalado independiente.
## Revisar cuando
Equipo propio o CPU atribuible >60% durante 30 días, con datos y on-call preparados.
## Reversión
Si la extracción aumenta incidentes sin reducir coordinación, volver al módulo conservando contrato.
```

```bash
cd academia-labs/microservices/adr
test -s docs/adr/0001-extraer-facturacion.md
grep -q 'Opciones' docs/adr/0001-extraer-facturacion.md
grep -q 'Revisar cuando' docs/adr/0001-extraer-facturacion.md
grep -q 'Reversión' docs/adr/0001-extraer-facturacion.md
```

**Resultado esperado:** cuatro comandos con código `0`. **Fallo deliberado:** elimina opción de mantener y umbral → **Error esperado:** `grep` falla y la decisión no puede reevaluarse → **Diagnóstico:** escribiste una preferencia, no una decisión trazable.

#### Paso 5 · Práctica guiada

1. Vincula cada afirmación a una evidencia.
2. Añade consecuencias negativas.
3. Detecta lenguaje absoluto sin medida.
4. Define dueño y fecha de revisión.
5. Ensaya reversión y artefactos que deben conservarse.

#### Paso 6 · Práctica independiente

Redacta dos ADR sobre el mismo módulo con decisiones opuestas bajo evidencias distintas. Explica qué señal cambia racionalmente la decisión.

#### Paso 7 · Cierre

- [ ] Incluyo mantener como opción.
- [ ] Cito evidencia y límites.
- [ ] Registro consecuencias negativas.
- [ ] Defino umbral, ventana y dueño.
- [ ] Diseño reversión verificable.

**Errores comunes:** ADR sin alternativas, métricas sin atribución o decisión irreversible. **Fuentes:** [Spring Modulith fundamentals](https://docs.spring.io/spring-modulith/reference/fundamentals.html), [ArchUnit User Guide](https://www.archunit.org/userguide/html/000_Index.html) y [Azure domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).

## Proyecto integrador · Defender el monolito modular de RutaFlow · 3 h

Construye un monolito modular mínimo con Envíos, Facturación y Notificaciones. Entrega mapa de capacidades, APIs e internals, dos reglas de dominio sin framework, adaptador en memoria, inventario/grafo de dependencias, ciclo sembrado y corregido, fitness functions con prueba de sensibilidad, matriz de señales y ADR final. La decisión puede ser mantener o extraer, pero debe seguir la evidencia.

### Rúbrica (100 puntos)

| Evidencia | Puntos |
|---|---:|
| Límites por capacidad, invariantes y vocabulario | 15 |
| APIs públicas pequeñas e internals protegidos | 15 |
| Dominio puro, puertos y adaptadores sustituibles | 15 |
| Grafo respaldado y ruptura de ciclo justificada | 15 |
| ArchUnit rojo→verde y control contra falso verde | 20 |
| Señales atribuibles, costos y ownership | 10 |
| ADR con alternativas, consecuencias y reversión | 10 |

**Criterio profesional:** 80/100, sin cero en ArchUnit ni ADR. Guarda comandos, salidas y fallos deliberados; una captura sin artefactos reproducibles no acredita la entrega.
