# Módulo 7 · Service Discovery y Gateway

**Entorno de referencia (2026-05-22):** Node.js v24.18.0, Docker 29.9.3. Se verifican conceptos de registro/descubrimiento, routing y balanceo con simulaciones ejecutables. Eureka, Consul, Spring Cloud Gateway, Config Server y LoadBalancer requieren stack Spring Cloud/infra; **Nota de verificación** honesta donde aplique.

## Aprende construyendo

### Tema 1: Service Discovery: Eureka, Consul · Intermedio · 150 min

Caso guía: un cliente encuentra instancias de `catalog` sin hardcodear IPs.

#### Service discovery

**Definición formal.** Mecanismo por el cual servicios registran su ubicación y otros los descubren dinámicamente.

**Para qué sirve.** Soporta escalado y cambios de IP en entornos dinámicos.

**Cuándo usarlo y cuándo no.** Úsalo en plataformas dinámicas. No si tienes un único servicio estático simple.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const registry=new Map(); registry.set('catalog',['10.0.0.1:8080','10.0.0.2:8080']); console.log(registry.get('catalog')[0])"
```

**Caso de uso real.** Eureka/Consul registran instancias.

**Error común.** Cachear instancias muertas demasiado tiempo. Corrección: health checks y TTL/heartbeats.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `10.0.0.1:8080`.

#### Eureka / Consul

**Definición formal.** Eureka es un servidor de discovery de Netflix/Spring Cloud; Consul ofrece discovery, health checking y KV/config.

**Para qué sirve.** Registro y localización de servicios.

**Cuándo usarlo y cuándo no.** Elige según stack y necesidades (KV, multi-DC, health checks). No operes discovery sin monitoreo.

**Ejemplo mínimo enfocado (conceptual).**

```yaml
# Consul service registration (conceptual)
service:
  name: catalog
  port: 8080
  check:
    http: http://localhost:8080/actuator/health
```

**Caso de uso real.** Spring Cloud Client se registra en Eureka.

**Error común.** Asumir discovery reemplaza balanceo/timeout. Corrección: combinar con LB y resiliencia.

**Verificación.** **Nota de verificación:** requiere Eureka/Consul corriendo.

### Tema 2: API Gateway: Spring Cloud Gateway · Intermedio · 150 min

Caso guía: enrutar `/api/catalog/**` al servicio catalog.

#### API Gateway

**Definición formal.** Punto de entrada único que enruta, autentica, limita y observa peticiones hacia servicios internos.

**Para qué sirve.** Centraliza cross-cutting concerns de borde.

**Cuándo usarlo y cuándo no.** Úsalo cuando hay múltiples clientes/servicios. No lo conviertas en monolito con lógica de negocio.

**Ejemplo mínimo enfocado (ejecutable, routing simple).**

```bash
node -e "function route(p){ if(p.startsWith('/api/catalog')) return 'catalog'; if(p.startsWith('/api/orders')) return 'orders'; return '404'; } console.log(route('/api/catalog/1'));"
```

**Caso de uso real.** Spring Cloud Gateway con predicates/filters.

**Error común.** Poner reglas de negocio en gateway. Corrección: mantenerlo en borde técnico.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `catalog`.

#### Filtros y cross-cutting concerns

**Definición formal.** Filtros de gateway transforman o inspeccionan requests/responses (auth, rate limit, headers, logging).

**Para qué sirve.** Aplicar políticas transversales consistentemente.

**Cuándo usarlo y cuándo no.** Úsalo para authN/Z coarse, rate limit, observabilidad. No para lógica de dominio.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "function auth(h){return h==='Bearer ok'?200:401} console.log(auth('Bearer ok')); console.log(auth('bad'));"
```

**Caso de uso real.** Validar JWT antes de enrutar.

**Error común.** Confiar en header interno sin validar origen. Corrección: trust boundaries claras.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `200`, `401`.

### Tema 3: Config Server: configuración centralizada · Intermedio · 120 min

Caso guía: cambiar configuración sin reconstruir artefactos.

#### Config Server

**Definición formal.** Servicio que centraliza y distribuye configuración de aplicaciones desde un repositorio/versionado.

**Para qué sirve.** Consistencia y auditoría de configuración.

**Cuándo usarlo y cuándo no.** Úsalo en flotas de servicios. No para secretos sin cifrado/secret manager adecuado.

**Ejemplo mínimo enfocado (ejecutable, config por env simulada).**

```bash
CONFIG_URL=http://config node -e "console.log(process.env.CONFIG_URL)"
```

**Caso de uso real.** Spring Cloud Config con Git backend.

**Error común.** Guardar secretos en texto plano en repo. Corrección: cifrado/secret manager.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `http://config`. **Nota:** Config Server real requiere Spring Cloud Config.

### Tema 4: Load Balancing: Spring Cloud LoadBalancer · Intermedio · 120 min

Caso guía: repartir requests entre instancias.

#### Load balancing cliente

**Definición formal.** Selección de una instancia destino entre varias disponibles, puede ser server-side o client-side.

**Para qué sirve.** Escalabilidad y tolerancia a fallos.

**Cuándo usarlo y cuándo no.** Úsalo con múltiples instancias. No ignores health/readiness.

**Ejemplo mínimo enfocado (ejecutable, round-robin).**

```bash
node -e "const inst=['a','b','c']; let i=0; const pick=()=>inst[i++%inst.length]; console.log(pick(),pick(),pick(),pick());"
```

**Caso de uso real.** Spring Cloud LoadBalancer elige instancia desde discovery.

**Error común.** Balancear a instancias no listas. Corrección: health checks/readiness gates.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `a b c a`.

### Tema 5: BFF pattern · Intermedio · 90 min

Caso guía: una API específica para mobile y otra para web.

#### BFF (Backend for Frontend)

**Definición formal.** Capa backend dedicada a un tipo de cliente (web, mobile, etc.), que agrega y adapta datos de servicios internos.

**Para qué sirve.** Optimiza contrato por cliente y reduce over-fetching.

**Cuándo usarlo y cuándo no.** Úsalo cuando clientes tienen necesidades muy distintas. No dupliques lógica de dominio en cada BFF.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const mobile={id:1,name:'Teclado'}; const web={id:1,name:'Teclado',stock:4,desc:'...'}; console.log(Object.keys(mobile).length, Object.keys(web).length)"
```

**Caso de uso real.** Mobile BFF devuelve payload liviano.

**Error común.** BFF llamando demasiados servicios sin resiliencia. Corrección: timeouts, caché, agregación controlada.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `2 4`.

## Cierre del módulo

Discovery, gateway, config centralizada, load balancing y BFF reducen acoplamiento operativo en arquitecturas distribuidas. Cada componente añade un hop y un punto de fallo: requiere observabilidad y políticas de resiliencia.
