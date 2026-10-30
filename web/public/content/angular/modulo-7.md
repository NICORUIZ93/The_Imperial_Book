# Módulo 7: HttpClient e interceptores


## Aprende construyendo

### Tema 1: HttpClient con backend fetch

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con `HttpTestingController` real (sin ningún servidor HTTP real levantado), que un servicio con `HttpClient` realiza exactamente la petición esperada y procesa correctamente la respuesta tipada del servidor.

**Conocimiento previo:** Módulo 3 de este track (inyección de dependencias); Módulo 6 (Observables, `toSignal`).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Probar un servicio HTTP real contra un servidor real es lento, frágil ante cambios de red, y difícil de reproducir en CI; `HttpTestingController` intercepta la petición ANTES de que salga a la red, permitiendo confirmar exactamente qué URL y método se invocó, y simular la respuesta del servidor de forma determinista.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `provideHttpClient(withFetch())`, peticiones tipadas, integración con signals.

`HttpClient` es el servicio inyectable de Angular para realizar peticiones HTTP, devolviendo Observables (Módulo 6) por cada petición realizada, que se resuelven una única vez con la respuesta del servidor (o se rechazan con un error) y luego se completan automáticamente. Desde versiones recientes de Angular, `provideHttpClient(withFetch())` configura `HttpClient` para usar la API `fetch()` nativa del navegador como mecanismo de transporte subyacente en vez de `XMLHttpRequest` (el mecanismo tradicional), lo cual habilita mejor soporte de streaming de respuestas y es más compatible con entornos de ejecución modernos como Server-Side Rendering (Módulo 11), donde `fetch` está disponible de forma nativa sin polyfills adicionales.

Tipar las respuestas HTTP con interfaces TypeScript (`interface Usuario { id: number; nombre: string; }`, y luego `this.http.get<Usuario[]>('/api/usuarios')`) no valida en tiempo de ejecución que la respuesta real del servidor efectivamente tenga esa forma (TypeScript se borra completamente al compilar, Módulo 0), pero sí proporciona autocompletado y verificación de tipos en tiempo de compilación sobre cómo el código consume esa respuesta, capturando errores comunes como acceder a una propiedad mal escrita o asumir un tipo incorrecto para un campo, exactamente en el momento de escribir el código, no en producción.

Combinar `HttpClient` con `toSignal()` (Módulo 6) convierte directamente el Observable de una petición HTTP en un signal legible de forma síncrona en plantillas y `computed()`, unificando el modelo de datos de la aplicación bajo signals incluso cuando el origen de esos datos es una petición asíncrona de red, evitando la necesidad de gestionar manualmente un estado de "cargando/cargado/error" con propiedades sueltas del componente.

**Analogía:** `HttpClient` es como un mensajero especializado que sabe exactamente cómo pedir información a un servidor remoto y traer la respuesta de vuelta; tipar la respuesta es como pedirle al mensajero que traiga la información en un formato específico y conocido de antemano, para que quien la reciba sepa exactamente qué esperar sin tener que inspeccionarla manualmente.

**Diagrama — HttpTestingController intercepta antes de la red:**

```
┌────────────────┐   http.get('/api/usuarios')   ┌──────────────────────┐
│ UsuariosService │ ──────────────────────────────▶│ HttpTestingController │
└────────────────┘                                 │  (nunca sale a red)   │
                                                     └──────────────────────┘
                                                              │ peticion.flush([...])
                                                              ▼
                                                     ┌──────────────────────┐
                                                     │ respuesta simulada    │
                                                     │ entregada al servicio │
                                                     └──────────────────────┘
```

**Código del ejemplo:**

```ts
// app.config.ts
providers: [provideHttpClient(withFetch())]

interface Usuario { id: number; nombre: string; }
private http = inject(HttpClient);
usuarios = toSignal(this.http.get<Usuario[]>('/api/usuarios'), { initialValue: [] });
```

#### Paso 4 · Demostración guiada desde cero

Parte de una carpeta vacía (o continúa en `demo-exhaustmap` del Módulo 6):

```bash
npx -y @angular/cli@22 new demo-http --standalone --skip-git --defaults
mkdir -p src/app
```

Crea `src/app/usuarios.service.ts`:

```ts
// src/app/usuarios.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Usuario {
  id: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);

  obtener() {
    return this.http.get<Usuario[]>('/api/usuarios');
  }
}
```

Confirma con `HttpTestingController` real qué petición exacta se realiza y qué respuesta procesa el servicio:

```ts
// src/app/usuarios.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Usuario, UsuariosService } from './usuarios.service';

describe('UsuariosService realiza la peticion HTTP tipada esperada', () => {
  let controlador: HttpTestingController;
  let servicio: UsuariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    controlador = TestBed.inject(HttpTestingController);
    servicio = TestBed.inject(UsuariosService);
  });

  afterEach(() => controlador.verify());

  it('GET /api/usuarios devuelve el array tipado que el servidor responde', () => {
    let resultado: Usuario[] | undefined;
    servicio.obtener().subscribe((r) => (resultado = r));

    const peticion = controlador.expectOne('/api/usuarios');
    expect(peticion.request.method).toBe('GET');
    peticion.flush([{ id: 1, nombre: 'Ana' }]);

    expect(resultado).toEqual([{ id: 1, nombre: 'Ana' }]);
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** el test pasa; `controlador.expectOne('/api/usuarios')` confirma que EXACTAMENTE esa URL fue solicitada (ni más, ni menos peticiones), y `controlador.verify()` en `afterEach` confirma que no quedó ninguna petición pendiente sin responder.

**Fallo deliberado:** cambia la URL dentro de `UsuariosService.obtener()` de `'/api/usuarios'` a `'/api/usuario'` (sin la "s" final) y ejecuta de nuevo el test. FALLA con un error real de `HttpTestingController`: `Expected one matching request for criteria "Match URL: /api/usuarios", found none` — diagnosticando exactamente qué URL se esperaba y que ninguna petición coincidió con ella. Restaura la URL correcta antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un segundo método `obtenerPorId(id: number)` que haga `GET /api/usuarios/${id}`, y un test que confirme con `controlador.expectOne(...)` la URL exacta generada dinámicamente.
2. Simula una respuesta de error del servidor con `peticion.flush(null, { status: 500, statusText: 'Server Error' })` y confirma con un test que el Observable del servicio se rechaza correctamente.
3. Documenta, en un comentario, por qué `controlador.verify()` en `afterEach` es importante: ¿qué bug detectaría si un componente disparara una petición HTTP extra no esperada por ningún test?
4. Escribe de memoria (sin mirar) un servicio con `HttpClient.get<T>()` y un test con `HttpTestingController` que confirme la URL y la respuesta tipada. Compara después contra el patrón del Paso 4.

**Pista:** `HttpTestingController` nunca permite que una petición real salga a la red durante un test — si olvidas llamar `peticion.flush(...)`, el Observable del servicio simplemente nunca emite, y el test se queda esperando indefinidamente (o falla por timeout).

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método real de `HttpTestingController` que confirma que exactamente una petición coincide con la URL dada:

```ts
const peticion = controlador.____('/api/usuarios');
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un servicio con `HttpClient.get<T>()` y un test con `HttpTestingController` que confirme la URL exacta y procese una respuesta simulada. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con `HttpTestingController` real, exactamente qué petición realiza un servicio y cómo procesa la respuesta tipada del servidor, sin ninguna petición real saliendo a la red. El siguiente tema confirma con el mismo mecanismo que un interceptor funcional agrega correctamente un header a toda petición saliente. **Evidencia:** entrega el resultado del test en verde, y el mensaje exacto de error del fallo deliberado. Fuentes oficiales: [Angular — HTTP testing](https://angular.dev/guide/http/testing).

**Errores comunes:** olvidar `controlador.verify()` en `afterEach`, dejando pasar peticiones extra no esperadas sin que ningún test las detecte; olvidar `peticion.flush(...)`, dejando el Observable del servicio sin resolver nunca dentro del test.

**Cuándo no usarlo:** para verificar el comportamiento end-to-end real contra un backend genuino (no solo la lógica del servicio Angular en aislamiento), un test end-to-end con Playwright (mencionado en el README del repositorio) es más apropiado que `HttpTestingController`, que deliberadamente nunca toca la red real.

**Transferencia al proyecto integrador «Centro de control logístico»:** Consulta el detalle mediante HttpClient y el backend fetch configurado. Prueba éxito, 404 y cancelación; la plantilla debe mostrar estados separados sin convertir cualquier fallo en una lista vacía.

### Tema 2: Interceptores funcionales

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con `HttpTestingController` real, que un interceptor funcional agrega efectivamente el header `Authorization` a la petición saliente antes de que llegue a su destino.

**Conocimiento previo:** Tema 1 de este módulo; Módulo 4 de este track (`inject()` en funciones, similar a los guards).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Confiar en que cada desarrollador recuerde agregar manualmente el header de autenticación en cada llamada nueva a `HttpClient` es frágil; confirmar con una prueba real (no solo revisando el código a simple vista) que el interceptor agrega ese header automáticamente a CUALQUIER petición previene que una llamada nueva accidentalmente quede sin autenticar.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `HttpInterceptorFn`, transformación de la petición, manejo del flujo de respuesta.

Un interceptor es una función que se inserta en la cadena de procesamiento de cada petición HTTP saliente (y de cada respuesta entrante), pudiendo inspeccionar y modificar la petición antes de que llegue al servidor, o inspeccionar y transformar la respuesta (o el error) antes de que llegue al código que originó la petición, similar en concepto a los guards funcionales del Módulo 4 (una función simple con acceso a `inject()` en vez de una clase con dependencias declaradas en su constructor).

`authInterceptor`, un ejemplo típico, inyecta un `AuthService` para leer el token de autenticación actual, y clona la petición saliente agregándole un header `Authorization: Bearer <token>` (las peticiones HTTP son inmutables por diseño, de ahí `req.clone(...)` en vez de mutar `req` directamente), garantizando que absolutamente ninguna petición saliente del código de la aplicación olvide incluir ese header, sin necesidad de recordar agregarlo manualmente en cada llamada individual a `HttpClient` a lo largo de toda la aplicación.

`errorInterceptor`, otro ejemplo típico, envuelve la llamada a `next(req)` con un operador `catchError` de RxJS (Módulo 6): si la respuesta de error tiene código 401 (no autorizado, típicamente porque el token expiró o es inválido), redirige automáticamente a la ruta de login usando el `Router` (Módulo 4) inyectado; para cualquier otro error, lo relanza con `throwError` para que el código que originó la petición pueda manejarlo específicamente si necesita hacerlo.

**Analogía:** un interceptor es como un control de seguridad en la entrada de un edificio que revisa (y puede modificar, agregando una credencial) cada persona que entra, y también revisa cada persona que sale (la respuesta), pudiendo redirigirla automáticamente si algo no está en orden, sin que cada visitante individual tenga que recordar mostrar su credencial por su cuenta.

**Diagrama — un interceptor en la cadena de la petición:**

```
┌────────────┐   clone + header   ┌────────────────┐   next(req)   ┌───────────┐
│ req original│ ──────────────────▶│ authInterceptor │ ─────────────▶│ servidor   │
└────────────┘                     └────────────────┘               └───────────┘
```

**Código del ejemplo:**

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) router.navigate(['/login']);
      return throwError(() => error);
    })
  );
};
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-interceptor --standalone --skip-git --defaults`), crea `src/app/auth-token.service.ts` y `src/app/auth.interceptor.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/auth-token.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  token = signal('token-123');
}
```

```ts
// src/app/auth.interceptor.ts
import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthTokenService } from './auth-token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthTokenService).token();
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

Confirma con `HttpTestingController` real que el header llega efectivamente a la petición saliente:

```ts
// src/app/auth.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor agrega el header Authorization a toda peticion saliente', () => {
  let controlador: HttpTestingController;
  let http: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    controlador = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => controlador.verify());

  it('la peticion saliente incluye Authorization con el token real del servicio', () => {
    http.get('/api/entregas').subscribe();

    const peticion = controlador.expectOne('/api/entregas');
    expect(peticion.request.headers.get('Authorization')).toBe('Bearer token-123');
    peticion.flush({});
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** el test pasa; `peticion.request.headers.get('Authorization')` es literalmente `'Bearer token-123'` — confirmando que el interceptor transformó realmente la petición saliente ANTES de que `HttpTestingController` la capturara, exactamente el mismo punto en la cadena donde un servidor real la recibiría.

**Fallo deliberado:** cambia `return next(req.clone({ setHeaders: { Authorization: \`Bearer ${token}\` } }));` por `return next(req);` (olvidando clonar y agregar el header) y ejecuta de nuevo el test. FALLA porque `peticion.request.headers.get('Authorization')` ahora es `null` en vez de `'Bearer token-123'` — diagnosticando en código exactamente el bug de seguridad real que ocurriría si un interceptor "se olvida" de aplicar su transformación. Restaura la línea correcta antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Escribe `errorInterceptor` completo (con `catchError` y `Router`) y un test que confirme, simulando `peticion.flush(null, { status: 401, statusText: 'Unauthorized' })`, que efectivamente navega hacia `/login`.
2. Agrega un segundo test que confirme que un error 500 NO dispara la navegación a `/login` (solo se relanza con `throwError`).
3. Documenta, en un comentario, por qué `req.clone(...)` es obligatorio en vez de mutar `req` directamente — ¿qué principio de diseño de RxJS/HTTP en Angular se estaría violando?
4. Escribe de memoria (sin mirar) un `HttpInterceptorFn` que agregue un header y un test con `HttpTestingController` que confirme el header en la petición capturada. Compara después contra el patrón del Paso 4.

**Pista:** `peticion.request.headers.get('NombreDelHeader')` es la forma de inspeccionar cualquier header agregado por un interceptor sobre la petición ya interceptada — úsalo para verificar cualquier transformación que un interceptor aplique, no solo `Authorization`.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método real que las peticiones HTTP inmutables de Angular requieren para modificarse:

```ts
return next(req.____({ setHeaders: { Authorization: `Bearer ${token}` } }));
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `HttpInterceptorFn` que agregue un header de autenticación y un test con `HttpTestingController` que lo confirme. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con `HttpTestingController` real, que un interceptor funcional transforma efectivamente la petición saliente antes de que llegue a su destino. El siguiente y último tema confirma con dos interceptores instrumentados que `withInterceptors` los ejecuta en el orden exacto en que se declaran. **Evidencia:** entrega el resultado del test en verde, y el resultado incorrecto (`Authorization` como `null`) que produce el fallo deliberado. Fuentes oficiales: [Angular — HTTP interceptors](https://angular.dev/guide/http/interceptors).

**Errores comunes:** mutar `req` directamente en vez de `req.clone(...)` (las peticiones HTTP de Angular son inmutables); olvidar `provideHttpClientTesting()` en el test, lo que hace que las peticiones intenten salir a la red real en vez de ser interceptadas por `HttpTestingController`.

**Cuándo no usarlo:** para una transformación que solo aplica a UNA llamada HTTP específica (no a todas), pasar un parámetro opcional directamente en esa llamada es más simple y explícito que un interceptor global que tendría que inspeccionar la URL para decidir si aplicar su lógica.

**Transferencia al proyecto integrador «Centro de control logístico»:** Añade un identificador de correlación a las llamadas del panel y conserva el original al reintentar. Comprueba que el interceptor no adjunta credenciales a solicitudes de terceros.

### Tema 3: Registro de interceptores y centralización del manejo de errores

#### Paso 1 · Objetivo y preparación

Al finalizar podrás confirmar, con dos interceptores instrumentados y `HttpTestingController`, que `withInterceptors` los ejecuta EXACTAMENTE en el orden declarado en el array, tal como la teoría de este tema afirma.

**Conocimiento previo:** Temas 1-2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Si un interceptor de logging necesita ver la petición YA con el header de autenticación agregado por `authInterceptor` (para registrar, por ejemplo, qué usuario hizo la petición), el orden de registro en `withInterceptors([...])` determina si eso es posible; confirmar el orden real con una prueba (no solo asumirlo por la posición en el array) previene una regresión silenciosa si alguien reordena el array sin darse cuenta de la dependencia.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `withInterceptors`, orden de ejecución, DRY aplicado a errores HTTP.

Los interceptores se registran en `app.config.ts` mediante `provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))`, aplicándose en el orden declarado en el arreglo para las peticiones salientes, y en orden inverso para las respuestas entrantes (de forma similar a cómo se anidan los middlewares en Express, estudiado en el Módulo 3 del track de Node.js), lo cual importa cuando un interceptor depende del resultado de otro (por ejemplo, si un interceptor de logging necesita ver la petición ya con el header de autenticación agregado por `authInterceptor`, debe registrarse después de él en el arreglo).

Sin un interceptor centralizado de errores, cada componente o servicio que realiza una petición HTTP tendría que repetir su propia lógica de `catchError` para manejar un 401 (redirigir a login) o un 500 (mostrar un mensaje genérico de error), duplicando la misma lógica de manejo decenas de veces a lo largo de la aplicación, y arriesgando inconsistencias si un desarrollador olvida agregar ese manejo en una llamada nueva; centralizarlo en un único interceptor garantiza que el comportamiento sea uniforme y que agregar una nueva regla de manejo de errores (por ejemplo, reintentar automáticamente ante un error 503) solo requiera modificar un único lugar del código.

**Analogía:** registrar interceptores es como definir el orden de las estaciones de control por las que pasa cada paquete en un centro de distribución: el orden importa porque cada estación puede depender de que la anterior ya haya hecho su trabajo (por ejemplo, etiquetar el paquete antes de que la siguiente estación lo escanee).

**Diagrama — orden de ejecución declarado vs. real:**

```
withInterceptors([auth, logging])
        │
        ▼  peticion saliente
┌──────┐   ┌─────────┐   ┌───────────┐
│ auth  │──▶│ logging  │──▶│ servidor   │
└──────┘   └─────────┘   └───────────┘
```

**Código del ejemplo:**

```ts
// app.config.ts
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
// Petición saliente:  authInterceptor → errorInterceptor → servidor
// Respuesta entrante:  servidor → errorInterceptor → authInterceptor → código origen
```

#### Paso 4 · Demostración guiada desde cero

Continuando en el mismo proyecto (o, si prefieres un ejemplo independiente, parte de una carpeta vacía con `npx -y @angular/cli@22 new demo-orden --standalone --skip-git --defaults`), crea `src/app/orden.interceptor.ts`:

```bash
mkdir -p src/app
```

```ts
// src/app/orden.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export function crearInterceptorDeOrden(nombre: string, registro: string[]): HttpInterceptorFn {
  return (req, next) => {
    registro.push(nombre);
    return next(req);
  };
}
```

Confirma con `HttpTestingController` real el orden exacto de ejecución declarado en `withInterceptors`:

```ts
// src/app/orden.interceptor.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { crearInterceptorDeOrden } from './orden.interceptor';

describe('withInterceptors ejecuta los interceptores en el orden declarado', () => {
  it('el orden real de ejecucion coincide exactamente con el orden del array', () => {
    const registro: string[] = [];

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(
          withInterceptors([
            crearInterceptorDeOrden('auth', registro),
            crearInterceptorDeOrden('logging', registro),
          ])
        ),
        provideHttpClientTesting(),
      ],
    });

    const http = TestBed.inject(HttpClient);
    const controlador = TestBed.inject(HttpTestingController);

    http.get('/api/entregas').subscribe();
    controlador.expectOne('/api/entregas').flush({});

    expect(registro).toEqual(['auth', 'logging']);
  });
});
```

```bash
npx ng test --watch=false
```

**Resultado esperado:** el test pasa; `registro` contiene exactamente `['auth', 'logging']`, en ese orden — confirmando que `withInterceptors` ejecuta los interceptores en el orden EXACTO en que aparecen en el array, tal como la teoría afirma.

**Fallo deliberado:** intercambia el orden en el array a `withInterceptors([crearInterceptorDeOrden('logging', registro), crearInterceptorDeOrden('auth', registro)])` sin cambiar la aserción `expect(registro).toEqual(['auth', 'logging'])`. FALLA porque `registro` ahora es `['logging', 'auth']` — diagnosticando en código, no solo en teoría, que el orden de declaración en el array determina directamente el orden real de ejecución. Restaura el orden original antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega un tercer interceptor de orden y confirma que los tres se ejecutan en secuencia estricta según el array.
2. Escribe un test que confirme, usando `errorInterceptor` real (Tema 2), que puede inspeccionar un header agregado por `authInterceptor` SOLO si `authInterceptor` está declarado ANTES que él en el array.
3. Documenta, en un comentario, qué pasaría (en teoría, según la documentación oficial) con el orden de las RESPUESTAS entrantes, no solo las peticiones salientes, y por qué ese orden es el inverso.
4. Escribe de memoria (sin mirar) dos interceptores instrumentados con un array compartido y un test que confirme el orden exacto de ejecución. Compara después contra el patrón del Paso 4.

**Pista:** un interceptor que simplemente registra su nombre en un array compartido (como en el Paso 4) es la forma más simple y directa de verificar orden de ejecución — no necesitas interceptores con lógica compleja para probar esta garantía específica.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con la función real de `@angular/common/http` que registra un array de interceptores funcionales:

```ts
provideHttpClient(____([authInterceptor, errorInterceptor]))
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, dos interceptores instrumentados y un test que confirme el orden exacto de ejecución declarado en `withInterceptors`. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya confirmas, con interceptores instrumentados y `HttpTestingController`, que `withInterceptors` ejecuta los interceptores en el orden exacto declarado. Con esto cierras el módulo de HTTP: peticiones tipadas verificadas sin red real (Tema 1), interceptores que transforman la petición (Tema 2), y el orden de registro confirmado en código (Tema 3). El siguiente módulo aplica estos fundamentos a Server-Side Rendering e hidratación. **Evidencia:** entrega el resultado del test en verde, y el resultado incorrecto (`['logging', 'auth']`) que produce el fallo deliberado. Fuentes oficiales: [Angular — HTTP interceptors](https://angular.dev/guide/http/interceptors#interceptor-order).

**Errores comunes:** asumir el orden de ejecución sin verificarlo con una prueba real, arriesgando una regresión silenciosa si alguien reordena el array; olvidar que el orden de las RESPUESTAS entrantes es el INVERSO al de las peticiones salientes.

**Cuándo no usarlo:** si solo existe un único interceptor registrado en toda la aplicación, no hay ningún orden que verificar — esta técnica de prueba solo aporta valor real cuando existe una dependencia genuina de orden entre dos o más interceptores.

---

**Transferencia al proyecto integrador «Centro de control logístico»:** Registra explícitamente los interceptores y simula una sesión vencida. Una petición debe producir una sola notificación útil, sin duplicar mensajes entre interceptor, servicio y componente.

## Laboratorio práctico

**Objetivo del laboratorio:** consumir una API con autenticación e interceptor de errores centralizado.

**Requisitos previos:** Módulos 0-6 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Configurar `HttpClient` con fetch | `provideHttpClient(withFetch())` | Backend moderno de transporte |
| 2 | Definir la interfaz de respuesta | Ver Tema 1 | Autocompletado y verificación de tipos |
| 3 | Escribir `authInterceptor` | Ver Tema 2 | Agrega el header de autenticación automáticamente |
| 4 | Escribir `errorInterceptor` | Ver Tema 2 | Redirige a login ante un 401 |
| 5 | Registrar ambos interceptores | `withInterceptors([...])` | Verifica el orden de ejecución |

**Verificación:** el laboratorio se considera exitoso si toda petición saliente incluye el header de autenticación automáticamente, y si un error 401 simulado redirige correctamente a la página de login sin código adicional en el componente que originó la petición.

**Errores comunes y soluciones**

- **Mutar la petición en vez de clonarla.** Las peticiones HTTP son inmutables; usa siempre `req.clone({...})`.
- **Registrar los interceptores en el orden incorrecto.** Si un interceptor depende de otro, verifica el orden del arreglo en `withInterceptors`.
- **No relanzar el error en `errorInterceptor`.** Si no usas `throwError`, el código que originó la petición nunca se entera de que hubo un error.

---
