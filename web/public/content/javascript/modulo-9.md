# Módulo 9: Testing y calidad de código


## Aprende construyendo


### Tema 1: Unit testing con Vitest · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás instalar Vitest, escribir pruebas con Arrange–Act–Assert, verificar resultados y errores y leer un fallo sin modificar primero la expectativa. Protegerás la creación de guías del proyecto mediante un contrato ejecutable.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás instalar Vitest, escribir pruebas con Arrange–Act–Assert, verificar resultados y errores y leer un fallo sin modificar primero la expectativa.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en unit testing con vitest como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que unit testing con vitest resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Unit testing con Vitest se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Unit testing con Vitest | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses unit testing con vitest por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: unit testing con vitest funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Unit testing con Vitest existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve unit testing con vitest en tu contexto?
2. ¿Cómo sabrías que unit testing con vitest no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar unit testing con vitest?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-vitest
cd ejemplo-vitest
npm init -y
npm install -D vitest
npm pkg set scripts.test="vitest run"
mkdir src test
```

```js
export function crearGuia(numero) {
  // La unidad concentra una regla observable del dominio.
  if (!numero?.trim()) throw new TypeError("numero es obligatorio");
  return { numero, estado: "CREADA" };
}
```

```js
import { describe, it, expect } from "vitest";
import { crearGuia } from "../src/guia.js";

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

```bash
npm test
```

</details>

### Tema 2: ESLint, Prettier y cobertura de código · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás distinguir análisis estático, formato y cobertura, configurar comandos reproducibles y usar un reporte para encontrar una rama sin prueba. Convertirás calidad del proyecto en un contrato ejecutable sin perseguir un porcentaje vacío.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás distinguir análisis estático, formato y cobertura, configurar comandos reproducibles y usar un reporte para encontrar una rama sin prueba.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en eslint, prettier y cobertura de código como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que eslint, prettier y cobertura de código resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| ESLint, Prettier y cobertura de código se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar ESLint, Prettier y cobertura de código | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses eslint, prettier y cobertura de código por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: eslint, prettier y cobertura de código funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- ESLint, Prettier y cobertura de código existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve eslint, prettier y cobertura de código en tu contexto?
2. ¿Cómo sabrías que eslint, prettier y cobertura de código no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar eslint, prettier y cobertura de código?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
npm install --save-dev eslint @eslint/js prettier @vitest/coverage-v8
```

```bash
mkdir ejemplo-calidad-js
cd ejemplo-calidad-js
npm init -y
npm install -D eslint prettier vitest
mkdir src
```

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

```bash
npm run lint
npm run format:check
npm run test:coverage
```

</details>

### Tema 3: Mocks, spies y fakes · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir entre spy, mock y fake, controlar temporizadores con Vitest y limpiar el entorno después de cada caso. Verificarás que el filtro del proyecto colapsa entradas rápidas sin esperar 300 ms reales.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás elegir entre spy, mock y fake, controlar temporizadores con Vitest y limpiar el entorno después de cada caso.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
**Conceptos clave:** aislar la unidad bajo prueba, `vi.fn()`, fake timers.

Un spy (espía) observa las invocaciones de una función real (o de un método de un objeto) sin alterar su comportamiento subyacente, permitiendo verificar después si fue invocada, cuántas veces, y con qué argumentos exactos, sin necesidad de modificar el código bajo prueba para exponer esa información de otra forma. Un mock reemplaza completamente la implementación real de una función o dependencia por una versión controlada y predecible, útil cuando la dependencia real es costosa, lenta, no determinista, o simplemente inapropiada de ejecutar realmente durante una prueba unitaria (una llamada de red real, una escritura real a una base de datos). Un fake es una implementación alternativa simplificada pero funcionalmente equivalente de una dependencia (por ejemplo, una base de datos en memoria en vez de una conexión real), útil cuando se necesita un comportamiento más elaborado que un simple mock estático, pero sin la complejidad y el coste de la dependencia real completa.

`vi.fn()` crea una función simulada que registra automáticamente cada invocación (sus argumentos, cuántas veces fue llamada, qué devolvió), permitiendo aserciones como `expect(spy).toHaveBeenCalledWith("hola")` para verificar exactamente cómo fue usada. `vi.useFakeTimers()` reemplaza los temporizadores reales del entorno (`setTimeout`, `setInterval`) por versiones controladas manualmente por la prueba: en vez de esperar realmente los milisegundos configurados (lo cual haría la suite de pruebas lenta e impráctica para funciones como `debounce`, visto en el Módulo 1), `vi.advanceTimersByTime(ms)` avanza instantáneamente el reloj simulado, disparando cualquier callback de temporizador que debería haberse ejecutado en ese intervalo simulado, permitiendo probar comportamiento dependiente del tiempo en milisegundos reales de ejecución de la prueba, sin ninguna espera real.

Distinguir con precisión mock, spy y fake evita confusión de vocabulario común entre desarrolladores que aprenden testing: un spy observa sin alterar comportamiento; un mock reemplaza completamente con una versión controlada; un fake es una implementación alternativa funcional pero simplificada. En la práctica, muchas bibliotecas de testing (incluyendo Vitest) usan el término "mock" de forma más amplia para referirse a cualquiera de estos tres conceptos indistintamente en su API pública, así que el contexto específico de uso suele ser más importante que memorizar rígidamente la terminología exacta.

Usar mocks y spies con moderación es importante: sobre-mockear una prueba (reemplazando tantas partes del sistema bajo prueba que la prueba termina verificando principalmente el comportamiento de los mocks en vez del comportamiento real del código) reduce el valor real de la prueba como señal confiable de que el código funciona correctamente en producción, un riesgo real que vale la pena tener presente al diseñar cada prueba.

**Analogía:** un spy es como una cámara de vigilancia que registra todo lo que ocurre en una habitación sin intervenir en absoluto en lo que sucede ahí; un mock es como un actor de reparto que reemplaza completamente a una persona real en un ensayo de teatro, actuando exactamente el guion que se le indica; un fake es como un maniquí de entrenamiento médico que se comporta de forma funcionalmente similar a un paciente real para practicar un procedimiento, sin ser una persona real.

**¿Por qué es importante?** Mocks, spies y fakes permiten aislar la unidad de código realmente bajo prueba de sus dependencias externas costosas o no deterministas, haciendo las pruebas rápidas, deterministas y enfocadas exclusivamente en verificar el comportamiento específico que interesa en cada caso.

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que mocks, spies y fakes resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Mocks, spies y fakes se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Mocks, spies y fakes | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses mocks, spies y fakes por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: mocks, spies y fakes funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Mocks, spies y fakes existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve mocks, spies y fakes en tu contexto?
2. ¿Cómo sabrías que mocks, spies y fakes no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar mocks, spies y fakes?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
npm test -- src/ui/filtro-guias.test.js
```

</details>

### Tema 4: Mockear fetch · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás probar éxito, error HTTP y fallo de red sin tráfico real, crear una respuesta simulada compatible y restaurar fetch después de cada caso. Asegurarás el cliente de entregas del proyecto en milisegundos.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás probar éxito, error HTTP y fallo de red sin tráfico real, crear una respuesta simulada compatible y restaurar fetch después de cada caso.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en mockear fetch como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que mockear fetch resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Mockear fetch se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Mockear fetch | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses mockear fetch por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: mockear fetch funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Mockear fetch existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve mockear fetch en tu contexto?
2. ¿Cómo sabrías que mockear fetch no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar mockear fetch?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo-fetch-mock
cd ejemplo-fetch-mock
npm init -y
npm install -D vitest
mkdir src test
```

```js
export async function obtenerGuia(numero, fetchImpl = fetch) {
  const respuesta = await fetchImpl(`/api/guias/${encodeURIComponent(numero)}`);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.json();
}
```

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

```bash
npm test -- src/api/cliente-guias.test.js
```

</details>

### Comprueba lo construido

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por comprueba lo construido con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender comprueba lo construido te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en comprueba lo construido como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que comprueba lo construido resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Comprueba lo construido se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Comprueba lo construido | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses comprueba lo construido por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: comprueba lo construido funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Comprueba lo construido existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve comprueba lo construido en tu contexto?
2. ¿Cómo sabrías que comprueba lo construido no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar comprueba lo construido?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar comprueba lo construido.

</details>
