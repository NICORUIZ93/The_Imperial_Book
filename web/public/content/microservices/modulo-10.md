# Módulo 6 · Comunicación entre servicios

**Entorno de referencia (2026-05-22):** JDK 27.0.1.0.2, Node.js v24.18.0, Docker 29.9.3. Se verifican contratos HTTP/JSON, decisiones sync/async y simulaciones mínimas. RestTemplate/WebClient/OpenFeign, gRPC, Spring GraphQL, RabbitMQ y Kafka requieren dependencias/infra; se incluyen ejemplos mínimos y **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: REST síncrono: RestTemplate, WebClient, OpenFeign · Intermedio · 180 min

Caso guía: un servicio de pedidos consulta catálogo por HTTP.

#### REST síncrono

**Definición formal.** Comunicación request-response sobre HTTP donde el cliente espera la respuesta antes de continuar el flujo.

**Para qué sirve.** Interacciones simples y consultas inmediatas.

**Cuándo usarlo y cuándo no.** Úsalo cuando necesitas respuesta inmediata y baja latencia razonable. Evítalo en cadenas largas o cuando puedes tolerar eventualidad.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms10-rest && cd /tmp/ms10-rest
cat > server.mjs << 'JS'
import http from 'node:http';
http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'application/json'});res.end('{"id":1,"name":"Teclado"}');}).listen(0,'127.0.0.1',async function(){const p=this.address().port; const r=await fetch(`http://127.0.0.1:${p}/p/1`); console.log(r.status); console.log(await r.text()); this.close();});
JS
node server.mjs
```

**Caso de uso real.** `orders` llama a `catalog` para validar producto.

**Error común.** No definir timeout. Síntoma: hilos bloqueados/latencia en cascada. Corrección: timeouts y circuit breaker.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `200` y `{"id":1,"name":"Teclado"}`.

#### RestTemplate / WebClient / OpenFeign

**Definición formal.** RestTemplate es cliente HTTP bloqueante legado de Spring; WebClient es cliente reactivo/no bloqueante de WebFlux; OpenFeign es cliente declarativo por interfaces.

**Para qué sirve.** Abstraen llamadas HTTP entre servicios.

**Cuándo usarlo y cuándo no.** WebClient para stack reactivo o necesidades no bloqueantes; OpenFeign para clientes declarativos; RestTemplate solo en legado (mantenimiento). No mezcles estilos sin criterio.

**Ejemplo mínimo enfocado (esqueletos).**

```java
// WebClient
String body = webClient.get().uri("/p/{id}",1).retrieve().bodyToMono(String.class).block();
// Feign
@FeignClient(name="catalog", url="${catalog.url}")
interface CatalogClient { @GetMapping("/p/{id}") Producto get(@PathVariable String id); }
```

**Caso de uso real.** Feign en arquitectura Spring Cloud con discovery.

**Error común.** Usar `block()` indiscriminadamente en WebFlux. Corrección: mantener cadena reactiva o usar stack servlet conscientemente.

**Verificación.** **Nota de verificación:** requiere dependencias Spring Web/WebFlux/OpenFeign.

### Tema 2: gRPC: Protocol Buffers, servicios, streaming · Avanzado · 180 min

Caso guía: comunicación interna de baja latencia con contrato binario.

#### Protocol Buffers

**Definición formal.** Protocol Buffers (protobuf) es un IDL y formato de serialización binaria tipada de Google, usado habitualmente con gRPC.

**Para qué sirve.** Contratos compactos y generación de código cliente/servidor.

**Cuándo usarlo y cuándo no.** Úsalo en comunicación interna de alto rendimiento. No cuando necesites inspección humana simple o interoperabilidad browser directa sin gateway.

**Ejemplo mínimo enfocado (contrato .proto).**

```proto
syntax = "proto3";
service Catalog { rpc GetProduct(GetProductRequest) returns (Product); }
message GetProductRequest { string id = 1; }
message Product { string id = 1; string name = 2; }
```

**Caso de uso real.** Llamada interna entre microservicios con streaming.

**Error común.** Cambiar números de campo. Síntoma: incompatibilidad binaria. Corrección: reservar números y seguir reglas de evolución protobuf.

**Verificación.** **Nota de verificación:** requiere `protoc`/runtime gRPC; contrato mostrado es válido como ejemplo de IDL.

#### gRPC streaming

**Definición formal.** gRPC soporta unary, server streaming, client streaming y bidirectional streaming sobre HTTP/2.

**Para qué sirve.** Flujos continuos y baja latencia.

**Cuándo usarlo y cuándo no.** Úsalo para streams internos o telemetría/eventos técnicos. No lo expongas públicamente sin considerar compatibilidad/proxies.

**Ejemplo mínimo enfocado (conceptual).**

```proto
rpc ListProducts(Empty) returns (stream Product);
```

**Caso de uso real.** Streaming de cotizaciones o eventos internos.

**Error común.** No manejar backpressure/cancelación. Corrección: deadlines, cancelación y control de flujo.

**Verificación.** **Nota de verificación:** requiere runtime gRPC.

### Tema 3: GraphQL con Spring for GraphQL · Intermedio · 150 min

Caso guía: cliente móvil necesita campos específicos.

#### GraphQL

**Definición formal.** GraphQL es un lenguaje de consulta y runtime para APIs donde el cliente solicita exactamente los campos que necesita según un esquema tipado.

**Para qué sirve.** Reduce over/under-fetching en clientes diversos.

**Cuándo usarlo y cuándo no.** Úsalo en BFF/agregación con clientes variados. No lo uses por moda si REST simple basta.

**Ejemplo mínimo enfocado (ejecutable, resolución simulada).**

```bash
node -e "const data={product:{id:1,name:'Teclado',price:100}}; const query='{id,name}'; console.log(JSON.stringify({id:data.product.id,name:data.product.name}))"
```

**Caso de uso real.** App móvil consulta solo `id,name`.

**Error común.** N+1 en resolvers. Corrección: batching/DataLoader.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `{"id":1,"name":"Teclado"}`. **Nota:** Spring for GraphQL requiere dependencia y esquema/runtime.

### Tema 4: Mensajería asíncrona: RabbitMQ y Kafka (introducción) · Intermedio · 180 min

Caso guía: publicar evento `OrderCreated` sin acoplar productor y consumidor.

#### Mensajería asíncrona

**Definición formal.** Comunicación donde el emisor envía un mensaje a un intermediario y no espera respuesta inmediata del consumidor.

**Para qué sirve.** Desacoplar, absorber picos y procesar en background.

**Cuándo usarlo y cuándo no.** Úsalo para eventos, workflows y tareas diferibles. No para lecturas que requieren respuesta inmediata.

**Ejemplo mínimo enfocado (ejecutable, cola en memoria).**

```bash
node -e "const q=[]; q.push({type:'OrderCreated',id:1}); const msg=q.shift(); console.log(msg.type)"
```

**Caso de uso real.** Pedido creado dispara facturación y notificación.

**Error común.** Asumir entrega exactly-once por defecto. Corrección: idempotencia y semántica de entrega.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `OrderCreated`.

#### RabbitMQ vs Kafka

**Definición formal.** RabbitMQ es un broker de mensajes orientado a colas/routing; Kafka es una plataforma de log distribuido orientada a streams/eventos con retención y particiones.

**Para qué sirve.** RabbitMQ para colas/tareas/routing flexible; Kafka para event streaming de alto throughput y replay.

**Cuándo usarlo y cuándo no.** Elige por patrón de consumo, retención, orden, operación. No uses Kafka como simple cola sin necesidad de stream.

**Ejemplo mínimo enfocado (conceptual).**

```text
RabbitMQ: exchange -> queue -> consumer
Kafka: topic -> partition -> consumer group
```

**Caso de uso real.** RabbitMQ para jobs; Kafka para eventos de dominio.

**Error común.** Elegir por popularidad. Corrección: evaluar semántica, operación y caso de uso.

**Verificación.** **Nota de verificación:** requiere brokers Docker/infra; no ejecutado aquí.

### Tema 5: Sync vs async: criterios de decisión · Intermedio · 90 min

Caso guía: decidir si consultar stock sincrónicamente o por evento.

#### Criterio sync vs async

**Definición formal.** Sync requiere respuesta inmediata en la misma interacción; async difiere procesamiento/respuesta mediante eventos o colas.

**Para qué sirve.** Elegir trade-off entre simplicidad, latencia, consistencia y resiliencia.

**Cuándo usarlo y cuándo no.** Sync para consultas necesarias para responder ahora; async para side effects y procesos diferibles.

**Ejemplo mínimo enfocado (ejecutable, regla simple).**

```bash
node -e "function decide(needsImmediateResponse){return needsImmediateResponse?'sync':'async'} console.log(decide(true)); console.log(decide(false));"
```

**Caso de uso real.** Validación de tarjeta puede ser sync; envío de email async.

**Error común.** Cadena sync larga entre muchos servicios. Síntoma: fallo en cascada. Corrección: async, timeout, bulkhead.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `sync`, `async`.

## Cierre del módulo

La comunicación entre servicios define acoplamiento y resiliencia. REST/gRPC/GraphQL/mensajería no compiten en abstracto: se eligen por contrato, latencia, tipo de cliente y semántica de entrega.
