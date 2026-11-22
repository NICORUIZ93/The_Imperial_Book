# Módulo 7: HttpClient e interceptores


## Aprende construyendo


### Tema 1: HttpClient (fetch por defecto) y peticiones tipadas · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con HttpTestingController real (sin ningún servidor HTTP real levantado), que un servicio con HttpClient realiza exactamente la petición esperada y procesa correctamente la respuesta tipada del servidor.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con HttpTestingController real (sin ningún servidor HTTP real levantado), que un servicio con HttpClient realiza exactamente la petición esperada y procesa correctamente la respuesta tipada del servidor.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
**Conceptos clave:** `provideHttpClient()`, backend `fetch` por defecto, peticiones tipadas, integración con signals.

`HttpClient` es el servicio inyectable de Angular para realizar peticiones HTTP, devolviendo Observables (Módulo 6) por cada petición realizada, que se resuelven una única vez con la respuesta del servidor (o se rechazan con un error) y luego se completan automáticamente. En Angular 22, `HttpClient` usa por defecto la API `fetch()` nativa como transporte (`FetchBackend`), en vez de `XMLHttpRequest`, lo que encaja con Server-Side Rendering (Módulo 11), donde `fetch` existe sin polyfills. Por eso `withFetch()` ya no hace falta: la propia definición de tipos de Angular 22 lo marca `@deprecated`, con la nota «`withFetch` is not required anymore. `FetchBackend` is the default `HttpBackend`». Lo verás en tutoriales y proyectos anteriores; en código nuevo, `provideHttpClient()` basta, y solo hace falta declararlo para **configurarlo** con funciones como `withInterceptors()` (Tema 2).

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
// app.config.ts (Angular 22: fetch ya es el transporte por defecto)
providers: [provideHttpClient()]

interface Usuario { id: number; nombre: string; }
private http = inject(HttpClient);
usuarios = toSignal(this.http.get<Usuario[]>('/api/usuarios'), { initialValue: [] });
```

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que httpclient (fetch por defecto) y peticiones tipadas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| HttpClient (fetch por defecto) y peticiones tipadas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar HttpClient (fetch por defecto) y peticiones tipadas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses httpclient (fetch por defecto) y peticiones tipadas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: httpclient (fetch por defecto) y peticiones tipadas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- HttpClient (fetch por defecto) y peticiones tipadas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve httpclient (fetch por defecto) y peticiones tipadas en tu contexto?
2. ¿Cómo sabrías que httpclient (fetch por defecto) y peticiones tipadas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar httpclient (fetch por defecto) y peticiones tipadas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar podrás confirmar, con `HttpTestingController` real (sin ningún servidor HTTP real levantado), que un servicio con `HttpClient` realiza exactamente la petición esperada y procesa correctamente la respuesta tipada del servidor.

**Conocimiento previo:** Módulo 3 de este track (inyección de dependencias); Módulo 6 (Observables, `toSignal`).

</details>

### Tema 2: Interceptores funcionales · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con HttpTestingController real, que un interceptor funcional agrega efectivamente el header Authorization a la petición saliente antes de que llegue a su destino.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con HttpTestingController real, que un interceptor funcional agrega efectivamente el header Authorization a la petición saliente antes de que llegue a su destino.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en interceptores funcionales como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que interceptores funcionales resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Interceptores funcionales se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Interceptores funcionales | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses interceptores funcionales por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: interceptores funcionales funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Interceptores funcionales existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve interceptores funcionales en tu contexto?
2. ¿Cómo sabrías que interceptores funcionales no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar interceptores funcionales?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar podrás confirmar, con `HttpTestingController` real, que un interceptor funcional agrega efectivamente el header `Authorization` a la petición saliente antes de que llegue a su destino.

**Conocimiento previo:** Tema 1 de este módulo; Módulo 4 de este track (`inject()` en funciones, similar a los guards).

</details>

### Tema 3: Registro de interceptores y centralización del manejo de errores · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás confirmar, con dos interceptores instrumentados y HttpTestingController, que withInterceptors los ejecuta EXACTAMENTE en el orden declarado en el array, tal como la teoría de este tema afirma.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás confirmar, con dos interceptores instrumentados y HttpTestingController, que withInterceptors los ejecuta EXACTAMENTE en el orden declarado en el array, tal como la teoría de este tema afirma.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en registro de interceptores y centralización del manejo de errores como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que registro de interceptores y centralización del manejo de errores resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Registro de interceptores y centralización del manejo de errores se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Registro de interceptores y centralización del manejo de errores | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses registro de interceptores y centralización del manejo de errores por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: registro de interceptores y centralización del manejo de errores funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Registro de interceptores y centralización del manejo de errores existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve registro de interceptores y centralización del manejo de errores en tu contexto?
2. ¿Cómo sabrías que registro de interceptores y centralización del manejo de errores no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar registro de interceptores y centralización del manejo de errores?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar podrás confirmar, con dos interceptores instrumentados y `HttpTestingController`, que `withInterceptors` los ejecuta EXACTAMENTE en el orden declarado en el array, tal como la teoría de este tema afirma.

**Conocimiento previo:** Temas 1-2 de este módulo.

</details>
