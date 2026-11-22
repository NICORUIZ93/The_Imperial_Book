# Módulo 1 · Node.js y Express/NestJS

**Entorno de referencia (2026-05-22):** Node.js v24.18.0. Se verifican routing, middleware, validación y DTO con Node puro. Express/NestJS/class-validator/OpenAPI real requieren dependencias; **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: Express: routing, middleware, error handling · Intermedio · 150 min

#### Routing y middleware

**Definición formal.** En Express, routing mapea método+ruta a handlers; middleware son funciones que procesan request/response en cadena.

**Para qué sirve.** Componer cross-cutting concerns y endpoints.

**Cuándo usarlo y cuándo no.** Úsalo para APIs HTTP. No pongas lógica de negocio pesada en middleware sin estructura.

**Ejemplo mínimo enfocado (ejecutable, simulación).**

```bash
node -e "const mws=[(r)=>{r.a=1},(r)=>{r.b=r.a+1}]; const r={}; for(const mw of mws) mw(r); console.log(r.b)"
```

**Caso de uso real.** Auth, logging, parsing JSON.

**Error común.** Olvidar `next()` o responder dos veces. Corrección: flujo claro y tests.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `2`. **Nota:** Express real requiere dependencia `express`.

#### Error handling

**Definición formal.** Middleware de error en Express captura excepciones y genera respuesta consistente.

**Para qué sirve.** Evita duplicar try/catch.

**Cuándo usarlo y cuándo no.** Úsalo siempre. No filtres stack traces.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "function handler(){ throw new Error('bad') } try{handler()}catch(e){ console.log(JSON.stringify({status:500,message:'internal'})) }"
```

**Caso de uso real.** `app.use((err,req,res,next)=>...)`.

**Error común.** Olvidar 4 args en middleware de error Express. Corrección: firma `(err,req,res,next)`.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `{"status":500,"message":"internal"}`.

### Tema 2: NestJS: módulos, controllers, providers, interceptors, guards · Avanzado · 180 min

#### Módulos, controllers, providers

**Definición formal.** En NestJS, módulos organizan features; controllers manejan HTTP; providers encapsulan lógica inyectable.

**Para qué sirve.** Arquitectura estructurada y DI.

**Cuándo usarlo y cuándo no.** Úsalo en APIs medianas/grandes. No para scripts pequeños.

**Ejemplo mínimo enfocado (esqueleto).**

```ts
@Module({ controllers:[AppController], providers:[AppService] })
class AppModule {}
```

**Caso de uso real.** `UsersModule` con service y controller.

**Error común.** Provider no exportado/importado. Corrección: revisar módulo boundaries.

**Verificación.** **Nota de verificación:** requiere NestJS CLI/dependencias.

#### Guards e interceptors

**Definición formal.** Guards deciden si una request continúa (authZ); interceptors envuelven ejecución para transformar request/response o logging.

**Para qué sirve.** Cross-cutting concerns.

**Cuándo usarlo y cuándo no.** Guard para autorización; interceptor para logging/caching/mapping.

**Ejemplo mínimo enfocado (ejecutable, guard simulado).**

```bash
node -e "function guard(role){return role==='admin'} console.log(guard('admin'), guard('user'))"
```

**Caso de uso real.** `RolesGuard`, `LoggingInterceptor`.

**Error común.** Poner autorización en interceptor. Corrección: usar guard.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true false`.

### Tema 3: Validación con Zod o class-validator · Intermedio · 120 min

#### Validación de esquema

**Definición formal.** Zod valida esquemas en runtime (TS-first); class-validator valida clases con decoradores.

**Para qué sirve.** Proteger borde de entrada.

**Cuándo usarlo y cuándo no.** Úsalo en inputs externos. No confíes en tipos TS en runtime.

**Ejemplo mínimo enfocado (ejecutable, validador simple).**

```bash
node -e "function validate(x){ return typeof x.name==='string' && x.name.length>0; } console.log(validate({name:'A'}), validate({name:''}));"
```

**Caso de uso real.** Validar body POST.

**Error común.** Validar solo tipos, no reglas de negocio básicas. Corrección: esquema completo.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true false`. **Nota:** Zod/class-validator real requieren paquetes.

### Tema 4: DTOs · Básico · 60 min

#### DTO

**Definición formal.** Objeto de transferencia para entrada/salida API, desacoplado del modelo interno.

**Para qué sirve.** Contrato estable.

**Cuándo usarlo y cuándo no.** Siempre en bordes. No exponer entidades.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const entity={id:1,name:'A',passwordHash:'x'}; const dto={id:entity.id,name:entity.name}; console.log(JSON.stringify(dto))"
```

**Caso de uso real.** Response DTO sin campos sensibles.

**Error común.** Fuga de campos internos. Corrección: mapeo explícito.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `{"id":1,"name":"A"}`.

### Tema 5: OpenAPI/Swagger · Intermedio · 90 min

#### OpenAPI

**Definición formal.** Especificación estándar para describir APIs HTTP.

**Para qué sirve.** Documentación, clientes y contract testing.

**Cuándo usarlo y cuándo no.** Úsalo en APIs públicas/internas. Mantén spec sincronizada.

**Ejemplo mínimo enfocado (ejecutable, spec mínima).**

```bash
node -e "const spec={openapi:'3.1.0',paths:{'/health':{get:{responses:{200:{description:'ok'}}}}}}; console.log(spec.openapi)"
```

**Caso de uso real.** Swagger UI.

**Error común.** Spec desactualizada. Corrección: generar desde código o validar en CI.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `3.1.0`. **Nota:** Swagger UI/Nest Swagger requieren dependencias.

## Cierre del módulo

Express ofrece flexibilidad mínima; NestJS agrega estructura y DI. En ambos, la validación, DTOs y OpenAPI mantienen contratos seguros y claros.
