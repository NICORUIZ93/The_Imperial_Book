# Módulo 5 · Arquitectura de microservicios

**Entorno de referencia (2026-05-22):** JDK 27.0.1.0.2, Node.js v24.18.0. Conceptos arquitectónicos se verifican con simulaciones Java/Node pequeñas. Spring Modulith, despliegues reales y bases de datos separadas por servicio requieren infraestructura/proyecto específico; se incluyen **Notas de verificación** honestas.

Este módulo define cuándo y cómo partir un sistema: estilos arquitectónicos, límites de dominio, modularidad, 12-Factor, migración incremental y aislamiento de datos.

## Aprende construyendo

### Tema 1: Monolito vs Microservicios vs SOA · Intermedio · 120 min

Caso guía: evaluar la arquitectura para un producto en etapa temprana.

#### Monolito

**Definición formal.** Un monolito es una aplicación desplegada como una unidad, donde módulos comparten proceso y normalmente un artefacto de despliegue.

**Para qué sirve.** Simplicidad operativa y desarrollo rápido al inicio.

**Cuándo usarlo y cuándo no.** Úsalo cuando el equipo/dominio es pequeño o la frontera no está clara. No lo fuerces cuando hay necesidad independiente de escalado/despliegue/equipos con límites claros.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms9-mono && cd /tmp/ms9-mono
cat > Main.java << 'JAVA'
class Billing { String charge(){ return "charged"; } }
class Catalog { String get(){ return "item"; } }
public class Main { public static void main(String[] args){ System.out.println(new Catalog().get()+":"+new Billing().charge()); } }
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Startup con un solo deployable.

**Error común.** Partir en microservicios prematuramente. Síntoma: complejidad distribuida sin beneficio. Corrección: empezar simple, extraer por límites claros.

**Verificación (JDK 27, 2026-05-22).** Salida: `item:charged`.

#### Microservicios

**Definición formal.** Arquitectura donde capacidades de negocio se despliegan como servicios independientes, comunicados por red, con autonomía de despliegue y datos.

**Para qué sirve.** Escalado y despliegue independiente por dominio.

**Cuándo usarlo y cuándo no.** Úsalo con límites de dominio claros y madurez operativa. No cuando el costo de distribución supera el beneficio.

**Ejemplo mínimo enfocado (ejecutable, dos procesos simulados por funciones con contrato).**

```bash
node -e "const catalog=()=>({id:1}); const billing=(id)=>({id,ok:true}); console.log(JSON.stringify(billing(catalog().id)))"
```

**Caso de uso real.** Equipo de pagos despliega sin tocar catálogo.

**Error común.** Microservicios que comparten DB. Síntoma: acoplamiento oculto. Corrección: database-per-service y contratos.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `{"id":1,"ok":true}`.

#### SOA

**Definición formal.** Service-Oriented Architecture organiza capacidades como servicios reutilizables, históricamente con énfasis en integración empresarial, contratos y a veces ESB.

**Para qué sirve.** Integración de capacidades empresariales heterogéneas.

**Cuándo usarlo y cuándo no.** Útil en contextos enterprise con gobernanza de integración. No confundas SOA con microservicios modernos; los objetivos y acoplamientos pueden diferir.

**Ejemplo mínimo enfocado (conceptual ejecutable: contrato de servicio).**

```bash
node -e "const service={name:'CustomerService',op:'GetCustomer'}; console.log(service.name+':'+service.op)"
```

**Caso de uso real.** Integración de ERP/CRM legados.

**Error común.** ESB como punto único gigante de lógica. Corrección: gobernanza clara, evitar lógica de negocio centralizada opaca.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `CustomerService:GetCustomer`.

### Tema 2: DDD: Bounded Contexts, Agregados, Eventos de Dominio · Avanzado · 180 min

Caso guía: separar catálogo y facturación.

#### Bounded Context

**Definición formal.** En DDD, un bounded context es un límite donde un modelo de dominio y su lenguaje ubicuo son consistentes.

**Para qué sirve.** Evita que un mismo término signifique cosas distintas sin control.

**Cuándo usarlo y cuándo no.** Úsalo cuando el dominio tiene subdominios con modelos distintos. No crees contextos artificiales sin límite de lenguaje/modelo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms9-bc && cd /tmp/ms9-bc
cat > Main.java << 'JAVA'
record CatalogProduct(String sku) {}
record BillingProduct(String sku, int priceCents) {}
public class Main { public static void main(String[] args){ System.out.println(new CatalogProduct("A").sku()+"-"+new BillingProduct("A",100).priceCents()); } }
JAVA
javac Main.java && java Main
```

**Caso de uso real.** "Cliente" en ventas vs soporte.

**Error común.** Modelo único para todo. Síntoma: entidades con campos contradictorios. Corrección: delimitar contextos y mapear.

**Verificación (JDK 27, 2026-05-22).** Salida: `A-100`.

#### Agregado

**Definición formal.** Un agregado es un clúster de objetos de dominio tratados como unidad de consistencia, con una raíz de agregado.

**Para qué sirve.** Define límites transaccionales y invariantes.

**Cuándo usarlo y cuándo no.** Úsalo para invariantes que deben cumplirse juntas. No hagas agregados enormes; afecta concurrencia y rendimiento.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms9-agg && cd /tmp/ms9-agg
cat > Main.java << 'JAVA'
import java.util.*;
class Order { private final List<String> items=new ArrayList<>(); void add(String sku){ items.add(sku); } int size(){ return items.size(); } }
public class Main { public static void main(String[] args){ var o=new Order(); o.add("A"); o.add("B"); System.out.println(o.size()); } }
JAVA
javac Main.java && java Main
```

**Caso de uso real.** Pedido como raíz; ítems dentro del agregado.

**Error común.** Modificar entidades internas desde fuera de la raíz. Corrección: exponer operaciones por la raíz.

**Verificación (JDK 27, 2026-05-22).** Salida: `2`.

#### Evento de dominio

**Definición formal.** Un evento de dominio representa algo significativo que ocurrió en el dominio, nombrado en pasado.

**Para qué sirve.** Comunicar cambios dentro/entre contextos con bajo acoplamiento.

**Cuándo usarlo y cuándo no.** Úsalo para hechos de negocio relevantes. No emitas eventos por cada setter técnico.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms9-evt && cd /tmp/ms9-evt
cat > Main.java << 'JAVA'
record OrderPaid(String orderId) {}
public class Main { public static void main(String[] args){ var e=new OrderPaid("O1"); System.out.println(e.getClass().getSimpleName()+":"+e.orderId()); } }
JAVA
javac Main.java && java Main
```

**Caso de uso real.** `OrderPaid` dispara envío.

**Error común.** Evento sin contrato estable. Corrección: versionar esquema y documentar semántica.

**Verificación (JDK 27, 2026-05-22).** Salida: `OrderPaid:O1`.

### Tema 3: Spring Modulith · Intermedio · 120 min

Caso guía: mantener modularidad dentro de un monolito modular.

#### Spring Modulith

**Definición formal.** Spring Modulith es un proyecto de Spring para estructurar y verificar módulos lógicos dentro de una aplicación Spring Boot, con soporte para eventos y documentación/verificación de límites.

**Para qué sirve.** Obtiene límites modulares sin costo inmediato de red de microservicios.

**Cuándo usarlo y cuándo no.** Úsalo cuando quieres modularidad fuerte en un monolito. No lo uses si ya necesitas despliegue/escala independiente real por servicio.

**Ejemplo mínimo enfocado (estructura ilustrativa).**

```text
src/main/java/com/acme/shop
  order/
  inventory/
  payment/
```

**Caso de uso real.** Verificar que `order` no acceda internals de `inventory`.

**Error común.** Paquetes sin reglas verificadas. Corrección: tests de módulos/ArchUnit/Spring Modulith.

**Verificación.** **Nota de verificación:** requiere dependencia Spring Modulith y contexto Spring Boot; no ejecutado aquí.

### Tema 4: 12-Factor App · Intermedio · 120 min

Caso guía: preparar un servicio para despliegue cloud.

#### 12-Factor (principios operativos)

**Definición formal.** 12-Factor App es un conjunto de prácticas para aplicaciones SaaS/cloud-native (config en entorno, dependencias explícitas, logs como streams, procesos stateless, etc.).

**Para qué sirve.** Mejora portabilidad y operabilidad.

**Cuándo usarlo y cuándo no.** Úsalo como baseline para servicios desplegables. No lo apliques dogmáticamente sin considerar contexto.

**Ejemplo mínimo enfocado (ejecutable, config por env y log stdout).**

```bash
PORT=8080 node -e "console.log('port='+process.env.PORT); console.log('log=stdout')"
```

**Caso de uso real.** Contenedor con env vars y logs a stdout.

**Error común.** Escribir estado local en disco efímero. Corrección: almacenamiento externo; procesos stateless.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `port=8080`, `log=stdout`.

### Tema 5: Strangler Fig Pattern · Avanzado · 120 min

Caso guía: migrar un monolito a servicios gradualmente.

#### Strangler Fig

**Definición formal.** Strangler Fig es un patrón de migración incremental que enruta gradualmente capacidades desde un sistema legado a uno nuevo hasta poder retirar el legado.

**Para qué sirve.** Reduce riesgo frente a reescritura big-bang.

**Cuándo usarlo y cuándo no.** Úsalo con legado en producción. No cuando el sistema es pequeño y se puede reemplazar con bajo riesgo.

**Ejemplo mínimo enfocado (ejecutable, routing por ruta).**

```bash
node -e "function route(path){return path.startsWith('/new')?'new':'legacy'} console.log(route('/new/orders')); console.log(route('/old'));"
```

**Caso de uso real.** Proxy enruta `/billing` al nuevo servicio, resto al monolito.

**Error común.** No tener paridad funcional/observabilidad durante migración. Corrección: shadow traffic, métricas, rollback.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `new`, `legacy`.

### Tema 6: Database-per-service · Avanzado · 120 min

Caso guía: evitar acoplamiento por base compartida.

#### Database-per-service

**Definición formal.** Patrón donde cada microservicio posee su base de datos/esquema y otros servicios acceden a sus datos solo vía API/eventos.

**Para qué sirve.** Autonomía de despliegue y evolución de esquema.

**Cuándo usarlo y cuándo no.** Úsalo cuando la autonomía importa. No lo adoptes sin estrategia para consultas cross-service y consistencia eventual.

**Ejemplo mínimo enfocado (ejecutable, ownership simulado).**

```bash
node -e "const db={catalog:{p1:'ok'},billing:{i1:'ok'}}; console.log(Object.keys(db).join(','))"
```

**Caso de uso real.** Servicio de pedidos no consulta tablas de billing directamente.

**Error común.** Joins cross-service por DB compartida "temporalmente". Síntoma: acoplamiento permanente. Corrección: API composition, CQRS, eventos.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `catalog,billing`.

## Cierre del módulo

La arquitectura de microservicios es una decisión de trade-offs: autonomía y escalado a cambio de complejidad distribuida. Los límites de DDD, la modularidad, 12-Factor, Strangler Fig y database-per-service ayudan a evolucionar con control.
