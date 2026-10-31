# Módulo 9: Testing y calidad de código


## Aprende construyendo

### Tema 1: Unit testing con Vitest

#### Paso 1 · Objetivo y preparación

Al finalizar podrás instalar Vitest, escribir pruebas con Arrange–Act–Assert, verificar resultados y errores y leer un fallo sin modificar primero la expectativa. Protegerás la creación de guías del proyecto mediante un contrato ejecutable.

**Conocimiento previo:** funciones, módulos ESM, excepciones, npm y el proyecto Vite. Comprueba que `npm run build` funciona antes de añadir testing; una prueba no debe ocultar una configuración ya rota.

#### Paso 2 · Contexto y caso real

Toda entrega nueva debe empezar en `CREADA` y rechazar números vacíos. En este incremento del proyecto, una prueba documentará ambas reglas para detectar inmediatamente una regresión durante una refactorización.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** `describe`/`it`/`expect`, arrange-act-assert, aserciones.

Una prueba unitaria verifica que una pieza aislada de código (típicamente una única función) se comporta como se espera ante entradas específicas, de forma automatizada y repetible, sin depender de verificación manual humana cada vez que el código cambia. Vitest, una herramienta de testing moderna diseñada para integrarse naturalmente con proyectos basados en Vite (Módulo 7), organiza las pruebas con `describe` (para agrupar pruebas relacionadas bajo un nombre descriptivo común) e `it` (o su alias `test`, para definir un caso de prueba individual con una descripción de qué comportamiento específico verifica), usando `expect(valorObtenido).toBe(valorEsperado)` (y muchas otras aserciones específicas según el tipo de comparación necesaria) para declarar la expectativa concreta que debe cumplirse.

El patrón "arrange-act-assert" (organizar-actuar-afirmar) estructura una prueba en tres fases claramente delimitadas, aunque no siempre marcadas explícitamente con comentarios: primero se prepara el estado y los datos necesarios para la prueba (arrange); luego se ejecuta la acción concreta que se quiere verificar, típicamente invocando la función bajo prueba (act); finalmente se afirma que el resultado obtenido coincide con lo esperado (assert). Seguir esta estructura consistentemente, incluso en pruebas simples de una sola línea donde las tres fases colapsan en una expresión compacta, facilita la legibilidad de una suite de pruebas extensa, donde cada prueba comunica claramente su intención sin necesidad de un contexto adicional externo para entenderla.

Una prueba unitaria bien diseñada debe ser determinista (produce siempre el mismo resultado ante las mismas entradas, sin depender de estado externo compartido entre pruebas, del orden de ejecución, o de fuentes de aleatoriedad no controladas) y rápida (idealmente ejecutándose en milisegundos, permitiendo ejecutar la suite completa frecuentemente durante el desarrollo sin fricción de tiempo). Estas dos propiedades —determinismo y velocidad— son las que hacen viable ejecutar una suite de pruebas constantemente durante el desarrollo (o automáticamente en cada commit mediante CI, como se estudió en el track DevOps), en vez de reservarla únicamente para verificaciones esporádicas y manuales.

Escribir la primera prueba de un proyecto —por trivial que sea, como verificar que `sumar(2,3)` devuelve `5`— establece la infraestructura básica (configuración de Vitest, comando de ejecución) sobre la que se construirán progresivamente pruebas más sofisticadas, y es un paso de valor práctico inmediato incluso antes de alcanzar una cobertura extensa del proyecto completo.

**Analogía:** una prueba unitaria es como un control de calidad automatizado en una línea de producción que verifica, de forma consistente y repetible en cada pieza que pasa, que cumple exactamente la especificación esperada, sin depender de que un inspector humano revise manualmente cada pieza individual cada vez que se fabrica una nueva.

**¿Por qué es importante?** El testing automatizado convierte la verificación de correctitud de "revisar manualmente cada vez que algo cambia" en "ejecutar la suite en segundos y confiar en el resultado", habilitando refactorizaciones y cambios con mucha mayor confianza y velocidad.

#### Paso 4 · Demostración guiada desde cero

Instala Vitest y registra el comando estable:

```bash
npm install --save-dev vitest
npm pkg set scripts.test="vitest run"
```

Desde una carpeta vacía crea `ejemplo-vitest`, instala Vitest y crea `src` y `test`:

```bash
mkdir ejemplo-vitest
cd ejemplo-vitest
npm init -y
npm install -D vitest
mkdir src test
```

Crea `src/guia.js`:

```js
export function crearGuia(numero) {
  // La unidad concentra una regla observable del dominio.
  if (!numero?.trim()) throw new TypeError("numero es obligatorio");
  return { numero, estado: "CREADA" };
}
```

Crea `test/guia.test.js`:

```js
import { describe, it, expect } from "vitest";
import { crearGuia } from "./guia.js";

describe("crearGuia", () => {
  it("crea una guía en estado inicial", () => {
    const numero = "RF-101";                 // Arrange
    const resultado = crearGuia(numero);      // Act
    expect(resultado).toEqual({ numero, estado: "CREADA" }); // Assert
  });

  it("rechaza un número vacío", () => {
    // La función se entrega a expect sin ejecutarla antes de la aserción.
    expect(() => crearGuia(" ")).toThrow(TypeError);
  });
});
```

Ejecuta:

```bash
npm test
```

**Resultado esperado:** un archivo y dos pruebas aprobadas. La salida identifica suite, duración y cada caso; no se necesita abrir el navegador.

**Fallo deliberado:** cambia en producción `CREADA` por `EN_RUTA` sin tocar la prueba. Vitest muestra diferencia entre esperado y recibido, archivo y línea. Lee ese contrato, restaura la regla correcta y confirma dos pruebas verdes.

#### Paso 5 · Práctica guiada

Exige el patrón `RF-` y añade casos válido e inválido. **Pista:** nombra las pruebas por comportamiento; evita una prueba genérica llamada “funciona”.

#### Paso 6 · Práctica independiente

Construye una tabla de casos con números vacíos, espacios, prefijo incorrecto y valor válido. Verifica el mensaje de error cuando sea parte útil del contrato y demuestra que cada prueba funciona aisladamente con un filtro de Vitest.

#### Paso 7 · Cierre

Ya puedes convertir una regla de dominio en feedback rápido y determinista. El siguiente tema aislará colaboraciones y tiempo sin reemplazar la lógica que sí puede probarse directamente.

**Errores comunes:** ejecutar la función antes de `toThrow`; compartir estado mutable; probar detalles privados; corregir la expectativa sin investigar la regresión; escribir casos que dependen de orden o red.

**Fuentes oficiales:** [Vitest — Getting Started](https://vitest.dev/guide/) y [Vitest — Expect](https://vitest.dev/api/expect.html).

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Prueba la transformación de respuesta pública con datos vacíos, válidos e inválidos. Las aserciones deben comprobar el contrato visible del widget, no detalles del orden interno de funciones.

### Tema 2: Mocks, spies y fakes

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir entre spy, mock y fake, controlar temporizadores con Vitest y limpiar el entorno después de cada caso. Verificarás que el filtro del proyecto colapsa entradas rápidas sin esperar 300 ms reales.

**Prerrequisitos:** callbacks, closures, `setTimeout`, pruebas Vitest y función `debounce`. Si no tienes `debounce`, créala como función de producción antes de probarla; no la declares dentro del test.

#### Paso 2 · Contexto y caso real

El operador escribe “EN_RUTA” letra por letra. Consultar la API por cada tecla desperdicia red; el filtro espera una pausa. En este proyecto controlaremos el reloj y observaremos la colaboración con búsqueda, manteniendo la prueba rápida y determinista.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** aislar la unidad bajo prueba, `vi.fn()`, fake timers.

Un spy (espía) observa las invocaciones de una función real (o de un método de un objeto) sin alterar su comportamiento subyacente, permitiendo verificar después si fue invocada, cuántas veces, y con qué argumentos exactos, sin necesidad de modificar el código bajo prueba para exponer esa información de otra forma. Un mock reemplaza completamente la implementación real de una función o dependencia por una versión controlada y predecible, útil cuando la dependencia real es costosa, lenta, no determinista, o simplemente inapropiada de ejecutar realmente durante una prueba unitaria (una llamada de red real, una escritura real a una base de datos). Un fake es una implementación alternativa simplificada pero funcionalmente equivalente de una dependencia (por ejemplo, una base de datos en memoria en vez de una conexión real), útil cuando se necesita un comportamiento más elaborado que un simple mock estático, pero sin la complejidad y el coste de la dependencia real completa.

`vi.fn()` crea una función simulada que registra automáticamente cada invocación (sus argumentos, cuántas veces fue llamada, qué devolvió), permitiendo aserciones como `expect(spy).toHaveBeenCalledWith("hola")` para verificar exactamente cómo fue usada. `vi.useFakeTimers()` reemplaza los temporizadores reales del entorno (`setTimeout`, `setInterval`) por versiones controladas manualmente por la prueba: en vez de esperar realmente los milisegundos configurados (lo cual haría la suite de pruebas lenta e impráctica para funciones como `debounce`, visto en el Módulo 1), `vi.advanceTimersByTime(ms)` avanza instantáneamente el reloj simulado, disparando cualquier callback de temporizador que debería haberse ejecutado en ese intervalo simulado, permitiendo probar comportamiento dependiente del tiempo en milisegundos reales de ejecución de la prueba, sin ninguna espera real.

Distinguir con precisión mock, spy y fake evita confusión de vocabulario común entre desarrolladores que aprenden testing: un spy observa sin alterar comportamiento; un mock reemplaza completamente con una versión controlada; un fake es una implementación alternativa funcional pero simplificada. En la práctica, muchas bibliotecas de testing (incluyendo Vitest) usan el término "mock" de forma más amplia para referirse a cualquiera de estos tres conceptos indistintamente en su API pública, así que el contexto específico de uso suele ser más importante que memorizar rígidamente la terminología exacta.

Usar mocks y spies con moderación es importante: sobre-mockear una prueba (reemplazando tantas partes del sistema bajo prueba que la prueba termina verificando principalmente el comportamiento de los mocks en vez del comportamiento real del código) reduce el valor real de la prueba como señal confiable de que el código funciona correctamente en producción, un riesgo real que vale la pena tener presente al diseñar cada prueba.

**Analogía:** un spy es como una cámara de vigilancia que registra todo lo que ocurre en una habitación sin intervenir en absoluto en lo que sucede ahí; un mock es como un actor de reparto que reemplaza completamente a una persona real en un ensayo de teatro, actuando exactamente el guion que se le indica; un fake es como un maniquí de entrenamiento médico que se comporta de forma funcionalmente similar a un paciente real para practicar un procedimiento, sin ser una persona real.

**¿Por qué es importante?** Mocks, spies y fakes permiten aislar la unidad de código realmente bajo prueba de sus dependencias externas costosas o no deterministas, haciendo las pruebas rápidas, deterministas y enfocadas exclusivamente en verificar el comportamiento específico que interesa en cada caso.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `ejemplo-mocks`, ejecuta `npm init -y`, instala Vitest y crea `src` y `test`; después crea `test/filtro.test.js`:

```bash
mkdir ejemplo-mocks
cd ejemplo-mocks
npm init -y
npm install -D vitest
mkdir src test
```

```js
import { afterEach, describe, expect, it, vi } from "vitest";
import { debounce } from "../util/debounce.js";

afterEach(() => {
  // Evita que reloj y funciones simuladas contaminen el siguiente caso.
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("filtro de guías", () => {
  it("busca una vez con el último texto", () => {
    vi.useFakeTimers();
    const buscar = vi.fn();
    const buscarConPausa = debounce(buscar, 300);

    buscarConPausa("E");
    buscarConPausa("EN");
    buscarConPausa("EN_RUTA");
    expect(buscar).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(buscar).toHaveBeenCalledWith("EN_RUTA");
  });
});
```

Ejecuta:

```bash
npm test -- src/ui/filtro-guias.test.js
```

**Resultado esperado:** una prueba aprobada inmediatamente; la función no se invoca antes de 300 ms simulados y recibe únicamente `EN_RUTA`.

**Fallo deliberado:** comenta `vi.useRealTimers()` y añade otro caso que espere temporizadores reales. El estado global puede dejarlo colgado o hacerlo fallar. Restaura `afterEach`; la causa es contaminación del entorno, no el comportamiento del filtro.

#### Paso 5 · Práctica guiada

Inyecta un fake repositorio en memoria que filtre tres entregas y usa un spy únicamente para observar la consulta. **Pista:** el fake conserva comportamiento; `vi.fn()` sin implementación solo registra llamadas.

#### Paso 6 · Práctica independiente

Prueba cancelación de debounce y dos instancias independientes. Para cada sustitución, escribe por qué la dependencia real sería lenta, no determinista o difícil de provocar; elimina mocks que no aporten ese aislamiento.

#### Paso 7 · Cierre

Ya puedes controlar colaboraciones y tiempo sin convertir el test en teatro de mocks. El siguiente tema aplicará el mismo límite a HTTP, simulando el contrato de `fetch`.

**Errores comunes:** olvidar restaurar timers; mockear la unidad bajo prueba; verificar llamadas internas sin valor de negocio; no avanzar el reloj; construir mocks que no respetan la interfaz real.

**Fuentes oficiales:** [Vitest — Mocking Functions](https://vitest.dev/guide/mocking/functions) y [Vitest — Timers](https://vitest.dev/guide/mocking/timers).

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Sustituye el cliente externo por un fake que permita controlar éxito y fallo. Verifica el comportamiento de usuario y usa spies solo donde contar una interacción sea parte del contrato.

### Tema 3: Mockear fetch

#### Paso 1 · Objetivo y preparación

Al finalizar podrás probar éxito, error HTTP y fallo de red sin tráfico real, crear una respuesta simulada compatible y restaurar `fetch` después de cada caso. Asegurarás el cliente de entregas del proyecto en milisegundos.

**Conocimiento previo:** `fetch`, Promesas, `async`/`await`, excepciones, mocks y Vitest. Recuerda que HTTP 404 resuelve la Promesa: el cliente debe revisar `response.ok`.

#### Paso 2 · Contexto y caso real

La pantalla no puede depender de un servidor disponible para probar su manejo de errores. En este proyecto, el cliente traducirá respuestas HTTP a datos o errores explícitos, mientras la prueba controla únicamente la frontera `fetch`.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** aislar código dependiente de red, `vi.spyOn` sobre `global.fetch`.

Probar código que depende de `fetch` (como `fetchConReintentos` del Módulo 6) presenta un desafío particular: ejecutar peticiones de red reales durante las pruebas las hace lentas, no deterministas (dependen de la disponibilidad real de un servidor externo y de la latencia de red variable), y difíciles de configurar para probar casos específicos de error que serían difíciles o imposibles de provocar de forma confiable contra un servidor real (como un timeout exacto, o una respuesta HTTP 500 específica). La solución estándar es mockear `fetch` completamente durante las pruebas, reemplazando la función global real por una versión controlada que devuelve exactamente la respuesta simulada que la prueba necesita para verificar un caso específico.

`vi.spyOn(global, "fetch").mockResolvedValue({...})` reemplaza temporalmente `fetch` con una versión que resuelve inmediatamente (sin ninguna latencia real de red) con el objeto de respuesta simulado especificado, típicamente incluyendo al menos `ok` (booleano) y un método `json()` (que a su vez debe devolver una Promesa, replicando fielmente la interfaz real de un objeto `Response`, para que el código bajo prueba que espera esa interfaz específica funcione exactamente igual con la versión simulada que con una respuesta real).

Este enfoque permite probar de forma determinista y rápida escenarios que serían difíciles de reproducir confiablemente contra un servidor real: una respuesta exitosa, una respuesta con código de error HTTP, un fallo de red completo (`mockRejectedValue` en vez de `mockResolvedValue`), o incluso una secuencia específica de respuestas distintas en llamadas sucesivas (útil para probar exactamente la lógica de `fetchConReintentos`, simulando que las primeras dos llamadas fallan y la tercera finalmente tiene éxito, verificando así que la lógica de reintentos se comporta correctamente ante ese patrón específico).

Es importante restaurar el comportamiento original de `fetch` después de cada prueba (Vitest ofrece mecanismos automáticos para esto, como `vi.restoreAllMocks()` en un hook de limpieza), para evitar que el mock configurado en una prueba contamine accidentalmente el comportamiento de pruebas posteriores que no esperan ese mock específico, un error de aislamiento entre pruebas que puede producir fallos confusos y difíciles de diagnosticar si las pruebas no están apropiadamente aisladas entre sí.

**Analogía:** mockear `fetch` es como practicar un discurso importante frente a un actor que interpreta al público real con reacciones controladas y predecibles, en vez de arriesgarse a practicar directamente frente al público real de la presentación final, donde las reacciones son impredecibles y cada ensayo tendría un coste real irreversible.

**¿Por qué es importante?** Mockear `fetch` es la técnica estándar para probar código dependiente de red de forma rápida, determinista y capaz de simular exactamente los escenarios de error que serían difíciles de provocar confiablemente contra servidores reales.

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `ejemplo-fetch-mock`, ejecuta `npm init -y`, instala Vitest y crea `src` y `test`; después crea `src/cliente.js`:

```bash
mkdir ejemplo-fetch-mock
cd ejemplo-fetch-mock
npm init -y
npm install -D vitest
mkdir src test
```

Crea `src/cliente.js`:

```js
export async function obtenerGuia(numero, fetchImpl = fetch) {
  const respuesta = await fetchImpl(`/api/guias/${encodeURIComponent(numero)}`);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.json();
}
```

Crea `test/cliente.test.js`:

```js
import { afterEach, describe, expect, it, vi } from "vitest";
import { obtenerGuia } from "./cliente-guias.js";

afterEach(() => vi.restoreAllMocks());

describe("obtenerGuia", () => {
  it("devuelve la guía solicitada", async () => {
    const respuesta = { numero: "RF-101", estado: "CREADA" };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      // json también es asíncrono en un Response real.
      json: async () => respuesta,
    });

    await expect(obtenerGuia("RF-101")).resolves.toEqual(respuesta);
    expect(fetchMock).toHaveBeenCalledWith("/api/guias/RF-101");
  });

  it("convierte un 404 en error explícito", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false, status: 404 });
    await expect(obtenerGuia("RF-404")).rejects.toThrow("HTTP 404");
  });
});
```

Ejecuta:

```bash
npm test -- src/api/cliente-guias.test.js
```

**Resultado esperado:** dos pruebas aprobadas, una llamada con la URL codificada y cero solicitudes visibles en Network; el 404 se convierte en rechazo controlado.

**Fallo deliberado:** cambia `json: async () => respuesta` por `json: respuesta`. El cliente intenta invocar un objeto como función y produce `TypeError`; restaura la forma real de `Response` en vez de adaptar producción a un mock incorrecto.

#### Paso 5 · Práctica guiada

Añade un caso `mockRejectedValue(new TypeError("Failed to fetch"))` y conserva una distinción entre red y HTTP. **Pista:** fallo de red rechaza `fetch`; error HTTP resuelve con `ok: false`.

#### Paso 6 · Práctica independiente

Prueba un cliente con dos fallos transitorios y éxito usando `mockRejectedValueOnce` y `mockResolvedValueOnce`. Verifica número de intentos y añade una prueba de integración separada contra un servidor controlado para no depender exclusivamente de la imitación.

#### Paso 7 · Cierre

Ya puedes simular la frontera HTTP conservando su contrato esencial. El siguiente tema automatizará análisis, formato y cobertura sin confundir métricas con corrección.

**Errores comunes:** hacer red real en unit tests; omitir `ok`; simular `json` como dato; dejar mocks activos; probar solo éxito; crear una respuesta tan incompleta que ya no representa la API.

**Fuentes oficiales:** [Vitest — Mocking Requests](https://vitest.dev/guide/mocking/requests) y [MDN — Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Controla fetch para devolver dos consultas en orden inverso. La prueba debe demostrar que la respuesta antigua no altera la guía vigente y que un aborto no se presenta como error de usuario.

### Tema 4: ESLint, Prettier y cobertura de código

#### Paso 1 · Objetivo y preparación

Al finalizar podrás distinguir análisis estático, formato y cobertura, configurar comandos reproducibles y usar un reporte para encontrar una rama sin prueba. Convertirás calidad del proyecto en un contrato ejecutable sin perseguir un porcentaje vacío.

**Prerrequisitos:** npm, Vitest y una suite verde. Conserva `package-lock.json`; las mismas versiones deben ejecutarse localmente y en CI.

#### Paso 2 · Contexto y caso real

El proyecto ya tiene pruebas, pero aún puede contener variables sin usar, formato inconsistente o ramas nunca ejercitadas. El proyecto integrará tres señales distintas y bloqueará errores, manteniendo las decisiones de cobertura enfocadas en el dominio crítico.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** análisis estático de calidad frente a formato visual, cobertura de líneas/ramas, límites de la cobertura como métrica.

ESLint y Prettier resuelven dos problemas complementarios pero distintos, y confundir sus responsabilidades es un error conceptual común. ESLint es un analizador estático que detecta errores de lógica, malas prácticas y patrones potencialmente problemáticos en el código (variables declaradas pero nunca usadas, comparaciones con `==` en vez de `===`, promesas creadas pero nunca manejadas), configurables mediante un conjunto de reglas que el equipo decide adoptar según sus estándares de calidad. Prettier, en cambio, se ocupa exclusivamente del formato visual del código (indentación, longitud de línea, comillas simples frente a dobles), sin ninguna opinión sobre la lógica o corrección del código, aplicando un estilo consistente automáticamente sin necesidad de discusión manual sobre preferencias de formato entre miembros del equipo.

Ejecutar ambas herramientas en conjunto —típicamente ESLint configurado para no incluir reglas de formato (delegando esa responsabilidad completamente a Prettier, evitando conflictos entre ambas herramientas compitiendo por el mismo aspecto del código) y Prettier ejecutándose automáticamente al guardar un archivo o como parte de un hook de pre-commit— es la configuración estándar recomendada en proyectos JavaScript modernos, eliminando tanto errores de lógica detectables estáticamente como discusiones improductivas sobre preferencias personales de estilo visual del código.

La cobertura de código, medida típicamente con `vitest --coverage`, cuantifica qué porcentaje de líneas, ramas condicionales, y funciones del código fuente se ejecutó al menos una vez durante la ejecución completa de la suite de pruebas. Un reporte de cobertura es una herramienta valiosa para identificar código completamente no probado (una función nunca invocada por ninguna prueba, o una rama de un `if` que nunca se ejecuta en ningún escenario probado), señalando dónde podrían existir bugs no descubiertos simplemente porque esa porción de código nunca se ejerció durante ninguna prueba.

Sin embargo, un 100% de cobertura no garantiza en absoluto la ausencia de bugs: cobertura mide únicamente que una línea se ejecutó, no que su resultado fue verificado correctamente con una aserción significativa; es perfectamente posible alcanzar 100% de cobertura con pruebas que ejecutan el código pero nunca afirman nada relevante sobre su comportamiento, o que solo prueban el "camino feliz" sin cubrir casos límite genuinamente importantes que técnicamente pasan por líneas ya cubiertas por otro escenario. Por esta razón, la cobertura debería tratarse como una señal útil de qué áreas carecen de cualquier prueba en absoluto, no como un objetivo numérico a maximizar ciegamente sin considerar la calidad real de las aserciones.

**Analogía:** ESLint es como un corrector de estilo que revisa la lógica y coherencia argumental de un texto; Prettier es como un editor que aplica automáticamente un formato tipográfico consistente (fuente, márgenes, espaciado) sin opinar sobre el contenido; la cobertura de código es como verificar qué porcentaje de las páginas de un libro fueron efectivamente leídas por al menos un revisor, sin garantizar que ese revisor haya entendido o verificado correctamente el contenido de cada página leída.

**¿Por qué es importante?** ESLint y Prettier automatizan dos aspectos distintos y complementarios de calidad de código, eliminando tanto errores de lógica detectables como discusiones de estilo; la cobertura es una señal útil de código no probado, pero nunca una garantía de corrección real del comportamiento verificado.

#### Paso 4 · Demostración guiada desde cero

Instala herramientas en `academia-web`:

```bash
npm install --save-dev eslint @eslint/js prettier @vitest/coverage-v8
```

Desde una carpeta vacía crea `ejemplo-calidad-js`, instala ESLint, Prettier y Vitest, y crea `src`:

```bash
mkdir ejemplo-calidad-js
cd ejemplo-calidad-js
npm init -y
npm install -D eslint prettier vitest
mkdir src
```

Crea `eslint.config.js`:

```js
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.js"],
    languageOptions: { globals: { document: "readonly", fetch: "readonly" } },
    rules: { eqeqeq: "error", "no-unused-vars": "error" },
  },
];
```

Crea `.prettierrc.json` con `{ "printWidth": 100, "semi": true }` y agrega scripts:

```json
{
  "scripts": {
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test:coverage": "vitest run --coverage",
    "verify": "npm run lint && npm run format:check && npm test"
  }
}
```

Ejecuta:

```bash
npm run lint
npm run format:check
npm run test:coverage
```

**Resultado esperado:** lint y formato terminan sin errores; cobertura genera tabla con líneas, funciones y ramas, además de `coverage/` para inspección detallada.

**Fallo deliberado:** añade `const temporal = 1;` sin usar en `src/main.js`. ESLint muestra regla, archivo y línea. Elimina la variable o úsala con intención; no desactives la regla para ocultar deuda.

#### Paso 5 · Práctica guiada

Abre el reporte HTML, localiza una rama roja de `crearGuia` y escribe un caso significativo. **Pista:** primero describe el comportamiento ausente; el porcentaje debe subir como consecuencia, no como objetivo único.

#### Paso 6 · Práctica independiente

Define un umbral razonado para `src/dominio/**`, crea un archivo deliberadamente ejecutado sin aserciones y explica por qué su cobertura no prueba corrección. Documenta qué comandos ejecutará CI y cuánto tardan.

#### Paso 7 · Cierre

Ya puedes interpretar tres controles complementarios y mantenerlos reproducibles. El próximo módulo medirá rendimiento con la misma disciplina: hipótesis, métrica y comparación.

**Errores comunes:** hacer competir ESLint y Prettier por formato; ejecutar herramientas globales con versiones distintas; perseguir 100% sin aserciones; ignorar ramas; corregir warnings desactivando reglas sin justificar.

**Fuentes oficiales:** [ESLint — Configure](https://eslint.org/docs/latest/use/configure/), [Prettier — Install](https://prettier.io/docs/install) y [Vitest — Coverage](https://vitest.dev/guide/coverage).

---

**Transferencia al proyecto integrador «Seguimiento público accesible»:** Ejecuta formato, análisis y pruebas del widget en CI. Introduce una rama de error sin cobertura y añade una prueba que detecte su comportamiento incorrecto, evitando premiar solo el porcentaje.

## Construcción guiada del capítulo

**Objetivo del laboratorio:** construir una suite de pruebas con cobertura significativa sobre la biblioteca de funciones utilitarias del Módulo 1, integrando ESLint y Prettier al flujo de trabajo.

**Requisitos previos:** Módulos 0-8 completados, Node.js instalado.

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Instalar Vitest y escribir la primera prueba | `npm install -D vitest`, `expect(sumar(2,3)).toBe(5)` | Verifica que la suite ejecuta correctamente |
| 2 | Probar `debounce` con fake timers | Ver Tema 2 | Verifica que colapsa múltiples llamadas rápidas en una sola |
| 3 | Usar `vi.fn()` para verificar un callback | Ver Tema 2 | Verifica argumentos exactos con `toHaveBeenCalledWith` |
| 4 | Mockear `fetch` para probar `fetchConReintentos` | Ver Tema 3 | Simula 2 fallos seguidos de un éxito |
| 5 | Configurar ESLint y Prettier | `npm init @eslint/config@latest`, `npx prettier --write .` | Corrige todos los warnings existentes en el código |
| 6 | Ejecutar el reporte de cobertura | `npx vitest --coverage` | Identifica qué rama de código no está cubierta |

**Verificación:** el laboratorio se considera exitoso si la suite de pruebas alcanza más del 80% de cobertura sobre la biblioteca del Módulo 1, si ESLint no reporta ningún warning pendiente, y si la prueba de `fetchConReintentos` verifica correctamente el escenario de reintentos exitosos tras fallos simulados.

### Comprueba lo construido

#### Ejercicio verificable 1

¿Qué fase de Arrange–Act–Assert compara el resultado con la expectativa?

**Respuesta esperada:** assert

#### Ejercicio verificable 2

¿Qué función de Vitest crea una función simulada que registra sus llamadas?

**Respuesta esperada:** vi.fn|vi.fn()

#### Ejercicio verificable 3

¿Qué herramienta corrige formato visual sin decidir la lógica del programa?

**Respuesta esperada:** Prettier

**Errores comunes y soluciones**

- **Escribir pruebas que dependen del orden de ejecución de otras pruebas.** Cada prueba debe ser independiente y determinista por sí sola; usa hooks de configuración/limpieza (`beforeEach`/`afterEach`) para restablecer el estado entre pruebas.
- **Perseguir 100% de cobertura sin verificar la calidad de las aserciones.** Revisa que cada prueba afirme algo genuinamente significativo sobre el comportamiento, no solo que ejecute la línea.
- **Olvidar restaurar un mock de `fetch` después de la prueba.** Usa `vi.restoreAllMocks()` en un hook de limpieza para evitar contaminar pruebas posteriores.

---
