# Módulo 0: RutaFlow desde cero: producto, entorno y dominio


## Antes de comenzar: instala y comprueba el entorno

Necesitas Git, un editor, Docker Desktop o Docker Engine, Node.js LTS, Python 3.12+, Java 27, Flutter estable y `make` opcional. En **Windows**, instala WSL 2 con Ubuntu, activa virtualización y ejecuta el repositorio dentro del sistema de archivos de WSL. En **macOS**, instala Xcode Command Line Tools; Homebrew facilita herramientas pero no es obligatorio. En **Linux**, instala Git y Docker desde la documentación de tu distribución y agrega tu usuario al grupo de Docker solo si comprendes su alcance de privilegios. Flutter exige Android Studio y Android SDK para Android; Xcode solo está disponible en macOS para iOS.

Valida una herramienta a la vez: `git --version`, `docker version`, `node --version`, `python3 --version`, `java --version` y `flutter doctor -v`. No continúes ante una marca roja relacionada con la plataforma que usarás. Después crea una carpeta vacía, inicializa Git, copia `.env.example` a `.env` sin secretos reales y levanta PostgreSQL con Compose. El primer criterio de éxito no es «instalé algo», sino que una prueba pueda conectarse, crear un envío y eliminar los datos de prueba de manera repetible.


### Si la instalación falla, no continúes a ciegas

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por si la instalación falla, no continúes a ciegas con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender si la instalación falla, no continúes a ciegas te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en si la instalación falla, no continúes a ciegas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    E0["Fundamentos<br/>módulo 0"]
    E1["Aplicación<br/>módulo 1"]
    E2["Integración<br/>módulos 2–4"]
    E3["Experto<br/>módulos 5–7"]
    E0 --> E1
    E1 --> E2
    E2 --> E3
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Si la instalación falla, no continúes a ciegas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Si la instalación falla, no continúes a ciegas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses si la instalación falla, no continúes a ciegas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: si la instalación falla, no continúes a ciegas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Si la instalación falla, no continúes a ciegas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve si la instalación falla, no continúes a ciegas en tu contexto?
2. ¿Cómo sabrías que si la instalación falla, no continúes a ciegas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar si la instalación falla, no continúes a ciegas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    E0["Fundamentos<br/>módulo 0"]
    E1["Aplicación<br/>módulo 1"]
    E2["Integración<br/>módulos 2–4"]
    E3["Experto<br/>módulos 5–7"]
    E0 --> E1
    E1 --> E2
    E2 --> E3
```

</details>

### Tema 1: El proceso logístico como sistema · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 1: El proceso logístico como sistema dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y JavaScript con Node.js (track Node).

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir y verificar Tema 1: El proceso logístico como sistema dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en el proceso logístico como sistema como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A["admitido"] --> B["clasificado"] --> C["asignado"] --> D["en tránsito"]
  D --> E["intentado"]
  E --> D
  D --> F["entregado<br/>terminal"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| El proceso logístico como sistema se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar El proceso logístico como sistema | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses el proceso logístico como sistema por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: el proceso logístico como sistema funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- El proceso logístico como sistema existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve el proceso logístico como sistema en tu contexto?
2. ¿Cómo sabrías que el proceso logístico como sistema no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar el proceso logístico como sistema?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A["admitido"] --> B["clasificado"] --> C["asignado"] --> D["en tránsito"]
  D --> E["intentado"]
  E --> D
  D --> F["entregado<br/>terminal"]
```

```bash
mkdir -p rutaflow-labs/tema-1-proceso-logistico/src
cd rutaflow-labs/tema-1-proceso-logistico
```

```javascript
// Tabla explícita de transiciones válidas: "entregado" no tiene salidas, es terminal.
const TRANSICIONES_VALIDAS = {
  admitido: ['clasificado'],
  clasificado: ['asignado'],
  asignado: ['en_transito'],
  en_transito: ['intentado', 'entregado'],
  intentado: ['en_transito', 'entregado'],
  entregado: [],
};

function transicionar(envio, nuevoEstado) {
  const permitidas = TRANSICIONES_VALIDAS[envio.estado] ?? [];
  if (!permitidas.includes(nuevoEstado)) {
    throw new Error(`Transición inválida: ${envio.estado} -> ${nuevoEstado}`);
  }
  return { ...envio, estado: nuevoEstado, eventos: [...envio.eventos, { tipo: nuevoEstado, en: new Date().toISOString() }] };
}

module.exports = { transicionar };
```

```bash
node -e "
const { transicionar } = require('./src/envio-estado.js');
let envio = { id: 'RF-4471', estado: 'admitido', eventos: [] };
envio = transicionar(envio, 'clasificado');
envio = transicionar(envio, 'asignado');
envio = transicionar(envio, 'en_transito');
envio = transicionar(envio, 'entregado');
console.log('OK', envio.estado, envio.eventos.length, 'eventos');
"
```

</details>

### Tema 2: Entorno reproducible en Windows, macOS y Linux · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 2: Entorno reproducible en Windows, macOS y Linux dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git, JavaScript con Node.js (track Node) y Docker (tra…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir y verificar Tema 2: Entorno reproducible en Windows, macOS y Linux dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en entorno reproducible en windows, macos y linux como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  subgraph Host["tu terminal (host)"]
    V["verificar.js"] -->|"localhost:5432"| P["puerto publicado (ports:)"]
  end
  subgraph Red["red interna de Compose"]
    APP["servicio app"] -->|"db:5432"| DB[("servicio db")]
  end
  P --> DB
  V -->|"db:5432"| X["ENOTFOUND: el host no resuelve nombres de servicio"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Entorno reproducible en Windows, macOS y Linux se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Entorno reproducible en Windows, macOS y Linux | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses entorno reproducible en windows, macos y linux por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: entorno reproducible en windows, macos y linux funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Entorno reproducible en Windows, macOS y Linux existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve entorno reproducible en windows, macos y linux en tu contexto?
2. ¿Cómo sabrías que entorno reproducible en windows, macos y linux no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar entorno reproducible en windows, macos y linux?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  subgraph Host["tu terminal (host)"]
    V["verificar.js"] -->|"localhost:5432"| P["puerto publicado (ports:)"]
  end
  subgraph Red["red interna de Compose"]
    APP["servicio app"] -->|"db:5432"| DB[("servicio db")]
  end
  P --> DB
  V -->|"db:5432"| X["ENOTFOUND: el host no resuelve nombres de servicio"]
```

```bash
mkdir -p rutaflow-labs/tema-2-entorno-reproducible
cd rutaflow-labs/tema-2-entorno-reproducible
```

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: rutaflow
      POSTGRES_DB: rutaflow
    ports:
      - "5432:5432"
```

```bash
docker compose up -d
docker compose ps
```

```javascript
const net = require('net');
const socket = net.createConnection({ host: 'localhost', port: 5432 }, () => {
  console.log('OK: localhost:5432 alcanzable desde el host');
  socket.end();
});
socket.on('error', (e) => { console.error('FALLÓ:', e.message); process.exit(1); });
```

```bash
node verificar.js
```

</details>

### Tema 3: Arquitectura, privacidad y amenazas · Básico · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 3: Arquitectura, privacidad y amenazas dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y JavaScript con Node.js (track Node).

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir y verificar Tema 3: Arquitectura, privacidad y amenazas dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en arquitectura, privacidad y amenazas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
  A["evento con PII"] --> B["registrarEvento: única vía"]
  B --> C["redactarPII"]
  C --> D["teléfono enmascarado, sin dirección"]
  D --> E["log observable"]
  B -.->|"ruta eliminada"| F["PII en texto plano"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Arquitectura, privacidad y amenazas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Arquitectura, privacidad y amenazas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses arquitectura, privacidad y amenazas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: arquitectura, privacidad y amenazas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Arquitectura, privacidad y amenazas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve arquitectura, privacidad y amenazas en tu contexto?
2. ¿Cómo sabrías que arquitectura, privacidad y amenazas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar arquitectura, privacidad y amenazas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
  A["evento con PII"] --> B["registrarEvento: única vía"]
  B --> C["redactarPII"]
  C --> D["teléfono enmascarado, sin dirección"]
  D --> E["log observable"]
  B -.->|"ruta eliminada"| F["PII en texto plano"]
```

```bash
mkdir -p rutaflow-labs/tema-3-privacidad-y-amenazas/src
cd rutaflow-labs/tema-3-privacidad-y-amenazas
```

```javascript
function redactarPII(envio) {
  const { telefono, direccionCompleta, ...resto } = envio;
  return {
    ...resto,
    telefono: telefono ? telefono.replace(/\d(?=\d{2})/g, '*') : undefined,
  };
}

function registrarEvento(envio) {
  console.log('evento:', JSON.stringify(redactarPII(envio)));
}

module.exports = { redactarPII, registrarEvento };
```

```bash
node -e "
const { registrarEvento } = require('./src/registrar-evento.js');
registrarEvento({ id: 'RF-4471', estado: 'entregado', telefono: '3001234567', direccionCompleta: 'Calle 10 # 5-20' });
"
```

</details>
