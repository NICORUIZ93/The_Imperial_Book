# Módulo 10: Seguridad en Node


## Aprende construyendo

### Tema 1: Cabeceras seguras con helmet

#### Paso 1 · Objetivo y preparación

Al finalizar podrás aplicar cabeceras HTTP defensivas y comprobarlas con `curl`. **Prerrequisitos:** Node LTS, Express y terminal; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Un navegador puede interpretar una respuesta de manera peligrosa si faltan restricciones. Una API pública necesita reducir superficie antes de implementar reglas de negocio.

#### Paso 3 · Teoría y analogía aplicada

Helmet agrupa middleware que establece políticas como CSP, HSTS y `X-Content-Type-Options`. Son señales para el navegador, no un sustituto de autorización; funcionan como barandillas en una carretera.

Ya verificas cabeceras desde el cliente. El siguiente tema limitará abuso por IP y usuario.

**Errores comunes:** copiar CSP sin probar; activar HSTS local sin HTTPS; creer que Helmet valida entradas; ocultar cabeceras de diagnóstico.

**Fuentes oficiales:** [Helmet](https://helmetjs.github.io/), [MDN HTTP headers](https://developer.mozilla.org/es/docs/Web/HTTP/Headers) y [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/).

**Evidencia de aprendizaje:** entrega la salida de cabeceras antes y después de retirar Helmet.

**Conceptos clave:** cabeceras HTTP de seguridad, mitigación de ataques comunes del navegador.

`helmet`, un middleware de Express (y también disponible para Fastify), establece automáticamente un conjunto de cabeceras HTTP que mitigan categorías conocidas de ataques del lado del navegador, con una única línea de configuración (`app.use(helmet())`) en vez de requerir que cada desarrollador configure manualmente cada cabecera individual conociendo exactamente su propósito específico. Entre las cabeceras que establece: `X-Content-Type-Options: nosniff` previene que el navegador intente adivinar el tipo de contenido de una respuesta de forma distinta a la declarada explícitamente en `Content-Type`, mitigando ciertos ataques que dependen de esa ambigüedad de interpretación; `Strict-Transport-Security` indica al navegador que solo debe comunicarse con el sitio mediante HTTPS en futuras visitas, incluso si el usuario intenta acceder explícitamente mediante HTTP, previniendo ataques de downgrade de protocolo.

Verificar con `curl -I` (que solicita solo las cabeceras de la respuesta, sin el cuerpo completo) qué cabeceras añade `helmet` a una aplicación específica es un ejercicio práctico revelador: cada cabecera añadida corresponde a una mitigación específica y bien documentada de un vector de ataque conocido, y entender el propósito individual de cada una (en vez de simplemente confiar ciegamente en que "helmet hace que la app sea segura") es importante para poder configurar excepciones puntuales cuando una cabecera específica interfiere con un requisito legítimo de la aplicación (por ejemplo, ajustar la Content Security Policy si la aplicación necesita cargar recursos de un dominio externo específico).

Adoptar `helmet` (o el equivalente para el framework elegido) desde el inicio de cualquier API de producción es una práctica de bajo costo y alto beneficio: la configuración por defecto cubre las mitigaciones más comunes y ampliamente aplicables sin requerir ningún conocimiento profundo previo de seguridad web por parte de cada desarrollador individual del equipo, delegando esa experiencia acumulada de la comunidad de seguridad hacia una biblioteca mantenida y actualizada colectivamente.

**Diagrama:**

```mermaid
graph LR
    A["Solicitud del navegador"]
    B["Express sin helmet<br/>sin cabeceras defensivas"]
    C["Express + helmet()<br/>cabeceras CSP, HSTS, etc."]
    D["Navegador interpreta<br/>riesgo alto"]
    E["Navegador cumple<br/>restricciones"]
    
    A -->|sin protección| B
    A -->|protección aplicada| C
    B --> D
    C --> E
    
    style D fill:#ffebee
    style E fill:#e8f5e9
```

**Analogía:** `helmet` es como instalar automáticamente un conjunto estándar de cerraduras de seguridad probadas y recomendadas por expertos en un edificio nuevo, en vez de que cada propietario individual tenga que investigar y decidir por su cuenta, desde cero, qué tipo específico de cerradura instalar en cada puerta.

**¿Por qué es importante?** `helmet` mitiga con una única línea de configuración una categoría amplia de vulnerabilidades conocidas del lado del navegador, delegando experiencia de seguridad acumulada de la comunidad hacia una configuración por defecto sensata y ampliamente probada.

**Cuándo:** aplicar `helmet()` en toda app de producción con Express; no conviene en desarrollo local sin HTTPS (HSTS es problemático en localhost).

* Proyecto: proyecto integrador RutaFlow

**Código del ejemplo:**

```js
import helmet from "helmet";
app.use(helmet()); // agrega X-Content-Type-Options, Strict-Transport-Security, etc.
// verificar: curl -I http://localhost:3000/tareas
```

#### Paso 4 · Demostración guiada desde cero

Implementa `src/audit-notes.md` para registrar la dependencia afectada, severidad, versión corregida y decisión del equipo.

```bash
mkdir ejemplo-helmet
cd ejemplo-helmet
npm init -y
npm install express helmet
mkdir src
```

Crea `src/server.js`:

```js
import express from "express";
import helmet from "helmet";
const app = express();
app.use(helmet());
app.get("/", (_req, res) => res.json({ ok: true }));
app.listen(3000, () => console.log("seguro en 3000"));
```

Ejecuta `node src/server.js` y `curl -I http://127.0.0.1:3000`. **Resultado esperado:** aparecen `x-content-type-options`, `content-security-policy` y otras cabeceras. **Fallo deliberado y diagnóstico:** elimina `helmet()` y compara; la ausencia demuestra una regresión observable, no un error de Express.

#### Paso 5 · Práctica guiada

Configura una CSP mínima para una respuesta sin scripts. **Pista:** prueba primero en modo reporte para no bloquear contenido legítimo.

#### Paso 6 · Práctica independiente

Documenta qué cabeceras aplican a navegador y cuáles no protegen una llamada server-to-server.

#### Paso 7 · Cierre y conexión

### Tema 2: Rate limiting

#### Paso 1 · Objetivo y preparación

Al finalizar podrás rechazar solicitudes excesivas con un límite explícito. **Prerrequisitos:** Node LTS, Express y npm; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Login, búsqueda y recuperación de contraseña son objetivos de abuso. Un límite reduce fuerza bruta, aunque no reemplaza autenticación ni protección distribuida.

#### Paso 3 · Teoría y analogía aplicada

Una ventana fija cuenta solicitudes por intervalo; token bucket permite ráfagas controladas. Es el torniquete de una estación: deja pasar un flujo y frena la saturación.

Ya proteges una superficie concreta y conoces sus límites distribuidos. El siguiente tema tratará inyección y XSS.

**Errores comunes:** confiar en IP detrás de proxy sin configurarlo; bloquear usuarios legítimos; no informar `Retry-After`; limitar solo en frontend; usar memoria local en clúster.

**Fuentes oficiales:** [express-rate-limit](https://express-rate-limit.mintlify.app/), [RFC 6585](https://www.rfc-editor.org/rfc/rfc6585) y [OWASP API4](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/).

**Evidencia de aprendizaje:** entrega la salida de las cuatro respuestas y sus cabeceras de límite.

**Conceptos clave:** límite de peticiones por ventana de tiempo, prevención de abuso y fuerza bruta.

Sin ningún límite en la tasa de peticiones que un cliente puede realizar, un solo cliente (deliberadamente malicioso, o simplemente un bug de un cliente legítimo que reintenta sin control) puede saturar una API con volumen excesivo de peticiones, degradando el servicio para todos los demás usuarios legítimos, o realizar ataques de fuerza bruta contra un endpoint de login (probando sistemáticamente miles de combinaciones de contraseña por segundo contra la misma cuenta) sin ninguna fricción que lo dificulte. `express-rate-limit` (u otras bibliotecas equivalentes) limita el número de peticiones aceptadas desde una misma IP (u otro identificador de cliente) dentro de una ventana de tiempo configurable, respondiendo con `429` (Too Many Requests) una vez que ese límite se excede dentro de la ventana.

Configurar el límite apropiado (`{windowMs: 60_000, max: 100}`, por ejemplo, 100 peticiones por minuto) requiere equilibrar la protección real contra abuso con no penalizar injustamente a usuarios legítimos con patrones de uso normales pero de volumen relativamente alto; límites más estrictos son apropiados específicamente para endpoints sensibles como login (donde incluso un puñado de intentos fallidos en poco tiempo es sospechoso de un ataque de fuerza bruta) frente a límites más generosos para endpoints de consulta general de uso normal y esperado con mayor frecuencia legítima.

Rate limiting no es solo una medida "para verse profesional": resuelve un problema real y concreto de disponibilidad del servicio (protegiendo contra saturación, ya sea maliciosa o accidental) y de seguridad específica (dificultando significativamente ataques de fuerza bruta contra credenciales, que dependen fundamentalmente de poder probar un volumen muy alto de intentos en poco tiempo; limitar ese volumen posible reduce directamente la viabilidad práctica de ese tipo de ataque, sin necesidad de ninguna otra medida adicional específica contra fuerza bruta).

**Analogía:** rate limiting es como un torniquete de entrada que permite pasar solo un número limitado de personas por minuto, evitando tanto que una multitud descontrolada sature un espacio con capacidad limitada, como que alguien intente probar sistemáticamente y a alta velocidad miles de credenciales falsas contra un único punto de control de seguridad en poco tiempo.

**¿Por qué es importante?** Rate limiting protege tanto la disponibilidad del servicio ante saturación (maliciosa o accidental) como la seguridad de endpoints sensibles como login, dificultando significativamente ataques de fuerza bruta al limitar el volumen posible de intentos en un período de tiempo dado.

**Código del ejemplo:**

```js
import rateLimit from "express-rate-limit";
app.use(rateLimit({ windowMs: 60_000, max: 100 })); // máx 100 requests/minuto por IP
// tras excederlo: respuesta 429 Too Many Requests
```

**Transferencia al proyecto integrador «API operativa de entregas»:** Limita intentos de consulta o autenticación según la política definida. Prueba el umbral y su recuperación temporal; el rechazo debe ser explícito y no bloquear indiscriminadamente usuarios detrás de una misma red.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-rate-limit
cd ejemplo-rate-limit
npm init -y
npm install express express-rate-limit
mkdir src
```

Crea `src/server.js`:

```js
import express from "express";
import rateLimit from "express-rate-limit";
const app = express();
app.use(rateLimit({ windowMs: 60_000, limit: 3, standardHeaders: true, legacyHeaders: false }));
app.get("/", (_req, res) => res.send("ok"));
app.listen(3000, () => console.log("limite 3/min"));
```

Ejecuta el servidor y cuatro veces `curl -i http://127.0.0.1:3000`. **Resultado esperado:** las primeras tres son 200 y la cuarta 429. **Fallo deliberado y diagnóstico:** elimina el middleware; todas pasan, demostrando una ruta sin límite.

#### Paso 5 · Práctica guiada

Aplica un límite más estricto solo a `/login`. **Pista:** usa un router o middleware por ruta, no un número global para todos los recursos.

#### Paso 6 · Práctica independiente

Compara memoria local con un store Redis para dos procesos y documenta por qué un límite local no es global.

#### Paso 7 · Cierre y conexión

### Tema 3: Inyección SQL y sanitización contra XSS

#### Paso 1 · Objetivo y preparación

Al finalizar podrás parametrizar una consulta y escapar texto HTML. **Prerrequisitos:** Node LTS, SQL básico y navegador; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una búsqueda con texto del usuario puede alterar una consulta o ejecutar markup. Validar formato y parametrizar son controles diferentes.

#### Paso 3 · Teoría y analogía aplicada

Los parámetros separan datos de instrucciones, como escribir un valor en un formulario en vez de pegarlo en las órdenes. Escapar HTML convierte símbolos peligrosos en texto visible.

Ya distingues parametrización, validación y escape. El siguiente tema reunirá controles en una auditoría OWASP.

**Errores comunes:** usar blacklist SQL; escapar para SQL en vez de parametrizar; confiar en validación frontend; insertar HTML sin escape; loggear payloads sensibles.

**Fuentes oficiales:** [node-postgres queries](https://node-postgres.com/features/queries), [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection) y [OWASP XSS](https://owasp.org/www-community/attacks/xss/).

**Evidencia de aprendizaje:** entrega la salida de una consulta parametrizada y un payload XSS escapado.

**Conceptos clave:** consultas parametrizadas, escape automático, sanitización de HTML.

La inyección SQL, mencionada ya en el Módulo 5 al estudiar el driver `pg`, ocurre cuando un valor de entrada del usuario se concatena directamente dentro de un string SQL sin ningún escape (`` `SELECT * FROM usuarios WHERE email = '${email}'` ``), permitiendo que un atacante que controla el valor de `email` inyecte fragmentos de SQL adicionales que alteran completamente la estructura y el significado de la consulta original ejecutada (por ejemplo, incluyendo una condición que siempre es verdadera, devolviendo todos los usuarios de la tabla en vez de uno específico, o peor, ejecutando comandos SQL destructivos adicionales). La solución, ya estudiada, es usar siempre consultas parametrizadas (`pool.query("... WHERE email = $1", [email])`), donde el driver escapa automáticamente el valor, neutralizando cualquier intento de inyección sin requerir ningún esfuerzo manual adicional del desarrollador en cada consulta individual.

Este mismo principio de "nunca concatenar directamente entrada no confiable" se extiende, con un mecanismo distinto pero un espíritu equivalente, al problema de XSS almacenado (Cross-Site Scripting): si contenido generado por un usuario (por ejemplo, un comentario en un formulario) se almacena y posteriormente se renderiza directamente como HTML en otra aplicación (típicamente un frontend, estudiado en los tracks de Angular y React) sin ningún escape o sanitización, un usuario malicioso podría incluir en su comentario un fragmento `<script>` que se ejecutaría en el navegador de cualquier otro usuario que visualice ese comentario después, potencialmente robando sus credenciales de sesión o realizando acciones no autorizadas en su nombre.

Escapar o sanitizar contenido generado por usuarios antes de renderizarlo como HTML (usando `textContent` en vez de `innerHTML` del lado del navegador, como se estudió en el Módulo 8 del track de JavaScript, o bibliotecas de sanitización específicas del lado del servidor si el contenido debe permitir cierto HTML controlado, como negritas o enlaces en un editor de texto enriquecido) es la defensa fundamental contra este vector. Auditar el flujo completo de cualquier dato que un usuario pueda controlar, desde su entrada inicial hasta cualquier punto donde eventualmente se renderiza o se usa en una consulta, identificando cada punto donde ese dato cruza un límite de confianza (de entrada de usuario hacia SQL, o de almacenamiento hacia renderizado HTML), es la disciplina sistemática que previene tanto inyección SQL como XSS de forma consistente.

**Analogía:** tanto la inyección SQL como el XSS son variantes del mismo problema fundamental: tratar datos de entrada no confiable como si fueran instrucciones confiables a ejecutar directamente, en vez de tratarlos siempre como datos puros a manejar con cuidado. Es como recibir una nota de un desconocido y, en vez de simplemente leer su contenido como texto, seguir literalmente cualquier instrucción que contenga como si viniera de una fuente autorizada y confiable.

**¿Por qué es importante?** Concatenar directamente entrada de usuario en SQL o renderizarla sin escape como HTML son las dos formas más comunes y con mayor impacto potencial de comprometer una aplicación, y ambas se previenen sistemáticamente con la misma disciplina: nunca tratar entrada no confiable como instrucciones ejecutables directas.

**Código del ejemplo:**

```js
// PELIGROSO: concatenación directa (inyección SQL)
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;
// SEGURO: parámetros, el driver escapa automáticamente
const { rows } = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);

// XSS: nunca renderizar contenido de usuario como HTML sin sanitizar/escapar
```

**Transferencia al proyecto integrador «API operativa de entregas»:** Parametriza la búsqueda de guías y trata observaciones como datos no confiables. Prueba caracteres especiales e instrucciones aparentes: deben almacenarse o rechazarse según el contrato, sin convertirse en SQL o HTML ejecutable.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-inyeccion
cd ejemplo-inyeccion
npm init -y
npm install pg escape-html
mkdir src
```

Crea `src/seguro.js`:

```js
import escapeHtml from "escape-html";
export function consultaSegura(texto) {
  const sql = "SELECT id FROM paquetes WHERE codigo = $1";
  const params = [texto];
  return { sql, params, html: escapeHtml(texto) };
}
console.log(consultaSegura("RF-1' OR '1'='1"));
```

Ejecuta `node src/seguro.js`. **Resultado esperado:** la cadena queda en `params` y el HTML muestra entidades escapadas. **Fallo deliberado y diagnóstico:** concatena el valor en `sql`; la salida muestra cómo los datos pasan a ser instrucciones, una vulnerabilidad, no una consulta válida.

#### Paso 5 · Práctica guiada

Valida que `codigo` cumpla `/^RF-\d+$/`. **Pista:** rechaza antes de llegar a la base, pero conserva parámetros incluso tras validar.

#### Paso 6 · Práctica independiente

Añade una prueba que intente `<img src=x onerror=alert(1)>` y entrega el texto escapado y la entrada rechazada.

#### Paso 7 · Cierre y conexión

### Tema 4: OWASP API Security Top 10 y auditoría de dependencias

#### Paso 1 · Objetivo y preparación

Al finalizar podrás ejecutar una auditoría de dependencias y priorizar un riesgo API. **Prerrequisitos:** Node LTS, npm y lectura básica de reportes; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API puede estar vulnerable aunque su código propio parezca correcto: dependencia transitoria, autorización por objeto o consumo sin límite también son riesgos.

#### Paso 3 · Teoría y analogía aplicada

OWASP es una lista de clases de fallos, no un certificado. `npm audit` detecta avisos conocidos, pero no reemplaza threat modeling. Es una inspección de extintores, no una garantía de que el edificio sea seguro.

Ya conviertes un reporte técnico en decisiones priorizadas. El siguiente módulo tratará despliegue y contenedores.

**Errores comunes:** ejecutar `npm audit fix --force` sin revisar; ignorar severidad; confundir dependencia dev con runtime; cerrar avisos sin evidencia; publicar el reporte con secretos.

**Fuentes oficiales:** [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit), [OWASP API Security Top 10](https://owasp.org/API-Security/) y [Node security](https://nodejs.org/en/learn/getting-started/security-best-practices).

**Evidencia de aprendizaje:** entrega la salida del reporte, una matriz de riesgos y una decisión justificada.

**Conceptos clave:** marco de referencia de vulnerabilidades comunes de APIs, `npm audit`.

El OWASP API Security Top 10 es un marco de referencia ampliamente reconocido y mantenido por la comunidad de seguridad, que documenta las diez categorías de vulnerabilidades más comunes y de mayor impacto específicamente en APIs (distinto del OWASP Top 10 general, más orientado a aplicaciones web tradicionales), incluyendo categorías como autorización a nivel de objeto rota (un usuario puede acceder a datos de otro usuario simplemente cambiando un id en la URL, sin verificación adecuada de que el recurso solicitado realmente pertenece a quien lo solicita) y exposición excesiva de datos (una respuesta de API que incluye más campos de los que el cliente específico necesita, exponiendo información sensible innecesariamente).

Revisar los ítems más relevantes de este marco de referencia para una API específica y documentar explícitamente cómo cada uno se mitiga (o identificar honestamente cuáles aún no están mitigados) es un ejercicio de auditoría de seguridad estructurado y sistemático, considerablemente más riguroso que simplemente "pensar en seguridad" de forma no estructurada; el marco proporciona una checklist concreta y bien fundamentada (con el mismo espíritu de la checklist de producción estudiada en el Módulo 12 del track DevOps) que reduce la probabilidad de pasar por alto una categoría completa de vulnerabilidad simplemente por no haberla considerado explícitamente.

`npm audit` escanea automáticamente las dependencias instaladas de un proyecto contra una base de datos de vulnerabilidades conocidas, reportando cuáles de los paquetes usados (incluyendo dependencias transitivas profundamente anidadas que el desarrollador nunca instaló directamente ni quizás siquiera conoce que existen) tienen vulnerabilidades documentadas, con una clasificación de severidad; `npm audit fix` intenta aplicar automáticamente actualizaciones que resuelven las vulnerabilidades encontradas sin requerir cambios manuales, aunque algunas vulnerabilidades requieren una actualización de versión mayor que podría introducir cambios incompatibles, requiriendo entonces una decisión manual e informada sobre cómo proceder, en vez de una corrección puramente automática.

**Analogía:** el OWASP API Security Top 10 es como una checklist de inspección de seguridad estandarizada y ampliamente reconocida para un edificio, cubriendo sistemáticamente las categorías de riesgo más comunes documentadas por la experiencia colectiva de la industria; `npm audit` es como un servicio de verificación automática que revisa cada componente comprado de proveedores externos contra una base de datos de defectos conocidos reportados, alertando específicamente sobre cuáles de esos componentes instalados tienen problemas documentados.

**¿Por qué es importante?** El OWASP API Security Top 10 proporciona un marco sistemático y bien fundamentado para auditar la seguridad de una API, reduciendo la probabilidad de omitir categorías completas de riesgo; `npm audit` extiende esa vigilancia hacia las dependencias de terceros, una superficie de riesgo frecuentemente invisible sin una herramienta que la audite activamente.

**Prueba en terminal:**

```bash
npm audit          # lista vulnerabilidades conocidas en las dependencias instaladas
npm audit fix       # aplica actualizaciones automáticas seguras cuando es posible
```

---

**Transferencia al proyecto integrador «API operativa de entregas»:** Revisa una operación sensible frente a autorización por recurso y consumo de recursos. Añade una prueba negativa con otra identidad y registra la política de actualización de dependencias que protege ese endpoint.

#### Paso 4 · Demostración guiada desde cero
**Crea** el archivo `audit.json` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

```bash
mkdir ejemplo-auditoria-api
cd ejemplo-auditoria-api
npm init -y
npm install express
npm audit --json > audit.json
```

`--json` es la bandera que hace que `npm audit` imprima el reporte en formato estructurado en vez de texto legible, apropiado para redirigir a un archivo o procesar con otro programa.

Crea `audit-notes.md` para registrar dependencia afectada, severidad, versión corregida y decisión del equipo. Ese archivo es la evidencia que acompaña al código de la auditoría.

Abre `audit.json` y ejecuta `npm audit`. **Resultado esperado:** un reporte con vulnerabilidades o el mensaje de árbol limpio; ambos son resultados válidos que debes interpretar. **Fallo deliberado y diagnóstico:** instala una versión vulnerable conocida en un proyecto temporal; `npm audit` marca severidad y dependencia transitiva. No ejecutes exploits.

#### Paso 5 · Práctica guiada

Clasifica un aviso como producción o desarrollo y decide si actualizar, reemplazar o aceptar temporalmente. **Pista:** revisa ruta de dependencia y versión corregida.

#### Paso 6 · Práctica independiente

Construye una matriz con autenticación, autorización por objeto, consumo de recursos y SSRF; entrega amenaza, evidencia y mitigación.

#### Paso 7 · Cierre y conexión

### Tema 5: CVE, CWE y npm audit en el pipeline

#### Paso 1 · Objetivo y preparación
Al finalizar podrás leer un reporte de `npm audit`, distinguir CVE, CWE y avisos GHSA, clasificar hallazgos por severidad y hacer fallar un pipeline cuando superan un umbral. Prerrequisitos: Tema 4 de este módulo y Módulo 7, Tema 3 (CI).

#### Paso 2 · Contexto y caso real
Una dependencia vieja de RutaFlow (lodash 4.17.20) tenía vulnerabilidades conocidas de inyección de código y contaminación de prototipos. Nadie lo notó porque el pipeline no revisaba dependencias. Es un caso real: la mayoría de las brechas en aplicaciones Node entran por paquetes de terceros, no por el código propio.

#### Paso 3 · Teoría, modelo mental y analogía
Un **CVE** identifica una vulnerabilidad concreta en un producto concreto (CVE-AAAA-NNNN). Un **CWE** clasifica el **tipo de debilidad** (CWE-94: inyección de código; CWE-1321: contaminación de prototipos; CWE-1333: regex ineficiente). GitHub publica avisos **GHSA** que enlazan ambos. **OWASP Top 10** agrupa los riesgos más frecuentes y cada categoría se mapea a varios CWE. `npm audit` compara tu árbol de dependencias con la base de avisos y **sale con código 1** si encuentra algo.

**Analogía:** el CWE es el tipo de falla ("cerradura que se abre con una tarjeta"); el CVE es el aviso de que el modelo X de esa marca tiene esa falla.

**Diagrama:**

```mermaid
flowchart LR
    D[package-lock.json] --> A[npm audit --json]
    B[(base de avisos GHSA)] --> A
    A --> R[auditar.js]
    R --> T[tabla por CWE]
    R --> X{high o critical}
    X -- sí --> F[exit 1: el pipeline falla]
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir auditoria && cd auditoria && npm init -y && npm install lodash@4.17.20
```

Crea `auditar.js`:

```javascript
// Resume el reporte de npm audit por CWE y falla el pipeline si hay severidad alta o crítica
const { spawnSync } = require('node:child_process');

const UMBRAL = ['high', 'critical'];
// spawnSync no lanza excepción cuando npm audit sale con código 1 (hay hallazgos)
const resultado = spawnSync('npm', ['audit', '--json'], { encoding: 'utf8' });
const reporte = JSON.parse(resultado.stdout);

const filas = [];
for (const [paquete, info] of Object.entries(reporte.vulnerabilities)) {
  for (const aviso of info.via.filter((v) => typeof v === 'object')) {
    filas.push({ paquete, severidad: aviso.severity, cwe: aviso.cwe.join(', '), aviso: aviso.url.split('/').pop() });
  }
}
console.table(filas);

const graves = filas.filter((f) => UMBRAL.includes(f.severidad));
console.log(`Hallazgos: ${filas.length}, graves: ${graves.length}`);
process.exitCode = graves.length > 0 ? 1 : 0;
```

**Ejecuta el ejemplo:**

```bash
node auditar.js; echo "código de salida: $?"
```

**Resultado esperado:**

```text
┌─────────┬──────────┬────────────┬─────────────────────┬───────────────────────┐
│ (index) │ paquete  │ severidad  │ cwe                 │ aviso                 │
├─────────┼──────────┼────────────┼─────────────────────┼───────────────────────┤
│ 0       │ 'lodash' │ 'high'     │ 'CWE-77, CWE-94'    │ 'GHSA-35jh-r3h4-6jhm' │
│ 1       │ 'lodash' │ 'moderate' │ 'CWE-400, CWE-1333' │ 'GHSA-29mw-wpgm-hmr9' │
│ 2       │ 'lodash' │ 'high'     │ 'CWE-94'            │ 'GHSA-r5fr-rjxr-66jc' │
│ 3       │ 'lodash' │ 'moderate' │ 'CWE-1321'          │ 'GHSA-f23m-r3pf-42rh' │
│ 4       │ 'lodash' │ 'moderate' │ 'CWE-1321'          │ 'GHSA-xxjr-mmjv-4gpg' │
└─────────┴──────────┴────────────┴─────────────────────┴───────────────────────┘
Hallazgos: 5, graves: 2
código de salida: 1
```

Los avisos cambian con el tiempo: al repetirlo quizá veas más o menos filas, pero la versión 4.17.20 siempre tendrá hallazgos. El código de salida 1 es lo que detiene el pipeline.

**Fallo deliberado:** Cambia `spawnSync` por `execSync("npm audit --json")`, como se ve en muchos tutoriales. El script se cae con `Error: Command failed: npm audit --json` antes de imprimir nada: `npm audit` sale con código 1 cuando hay hallazgos y `execSync` convierte eso en una excepción. Por eso hay que leer el código de salida, no tratarlo como error del script.

#### Paso 5 · Práctica guiada
Ejecuta `npm audit fix`, vuelve a correr `auditar.js` y documenta qué versión de lodash quedó y si el código de salida cambió. **Pista:** revisa `package.json` y `npm ls lodash` antes y después; si queda algún aviso, lee si se corrige con una versión *major*.

#### Paso 6 · Práctica independiente
Agrega `auditar.js` como paso de GitHub Actions y haz que solo bloquee con severidad `critical` en ramas de funcionalidad y con `high` en `main`. Justifica el umbral.

#### Paso 7 · Cierre y evidencia
Entrega como evidencia la salida real del Paso 4 y la explicación del fallo deliberado. **¿Por qué es importante?** porque la cadena de suministro es hoy una de las principales vías de ataque, y saber leer CVE y CWE te permite priorizar en vez de ignorar cientos de avisos.
**Fuente oficial:** [npm Docs: npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit), [MITRE CWE](https://cwe.mitre.org/), [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices).
**Conceptos clave:** CVE, CWE, GHSA, OWASP Top 10, severidad, `npm audit`, código de salida, umbral en CI.
**Cuándo no usarlo:** no trates cada aviso como urgente: evalúa si el código vulnerable se usa realmente (alcanzabilidad) y documenta las excepciones aceptadas con fecha de revisión.

**Transferencia al proyecto integrador «API operativa de entregas»:** agrega la auditoría de dependencias al pipeline de la API con un umbral documentado.
Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.
**Errores comunes:** usar `execSync('npm audit --json')` en vez de `spawnSync`, dejando que el código de salida 1 se convierta en una excepción no capturada antes de poder leer el reporte; tratar todas las severidades por igual sin fijar un umbral documentado por rama.

## Laboratorio práctico

**Objetivo del laboratorio:** asegurar la API construida en módulos anteriores con cabeceras seguras, rate limiting, prevención de inyección SQL/XSS y una auditoría estructurada según OWASP.

**Requisitos previos:** Módulos 0-9 completados.

| Paso | Acción | Comando/Código | Explicación |
|---|---|---|---|
| 1 | Instalar y verificar helmet | `app.use(helmet())`, `curl -I` | Verifica las cabeceras agregadas |
| 2 | Implementar rate limiting | Ver Tema 2 | Verifica que tras N requests responde 429 |
| 3 | Provocar y corregir una inyección SQL | Endpoint con concatenación directa, luego con parámetros | Verifica el ataque y su corrección |
| 4 | Sanitizar un campo de texto libre | Antes de renderizarlo en otra parte como HTML | Previene XSS almacenado |
| 5 | Revisar el OWASP API Security Top 10 | Documenta los 3 ítems más relevantes para tu API | Explica cómo cada uno se mitiga |
| 6 | Auditar dependencias | `npm audit`, corrige lo crítico encontrado | Verifica el reporte antes y después |

**Verificación:** el laboratorio se considera exitoso si el ataque de inyección SQL provocado deliberadamente en el paso 3 efectivamente altera el resultado antes de la corrección, y ya no lo hace después de aplicar consultas parametrizadas; y si `npm audit` no reporta ninguna vulnerabilidad crítica sin resolver al finalizar.

**Errores comunes y soluciones**

- **Confiar en que "nunca voy a tener atacantes reales" para justificar concatenación directa de SQL.** Esta suposición es incorrecta incluso para proyectos pequeños; usa siempre consultas parametrizadas por disciplina, no solo cuando "hace falta".
- **Configurar rate limiting con un límite tan estricto que afecta a usuarios legítimos normales.** Ajusta el límite según el patrón de uso real esperado, con límites más estrictos específicamente en endpoints sensibles como login.
- **Ignorar vulnerabilidades reportadas por `npm audit` por considerarlas "de bajo riesgo".** Revisa la severidad real reportada y prioriza las críticas y altas de forma consistente.

---
