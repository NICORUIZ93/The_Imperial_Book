# Módulo 10: Seguridad en Node

## Aprende construyendo

### Tema 1: Cabeceras seguras con helmet · Intermedio · 55 min

**Prerrequisito:** Node LTS, npm, fundamentos de Express y uso básico de `curl`. No necesitas archivos de otros temas.

**Al terminar podrás:** configurar Helmet en una aplicación Express, identificar las cabeceras observadas en una respuesta y explicar qué riesgos mitigan sin presentarlas como sustituto de otros controles.

#### Aprende

Las cabeceras HTTP comunican políticas al navegador. Helmet reúne middleware que configura varias de ellas con valores defensivos: `X-Content-Type-Options: nosniff` evita que el navegador reinterprete el tipo declarado, Content Security Policy (CSP) restringe fuentes de contenido y `Strict-Transport-Security` (HSTS) indica que futuras visitas a un sitio deben usar HTTPS.

**Por qué importa:** una configuración consistente reduce categorías de ataques del lado del navegador y evita que cada ruta dependa de decisiones manuales dispersas. Estas cabeceras no validan entradas, no implementan autenticación o autorización, no parametrizan consultas y no detienen por sí solas el abuso de una API.

CSP debe corresponder a los recursos que la aplicación realmente utiliza. Copiar una política permisiva anula parte de su valor; copiar una demasiado restrictiva puede bloquear recursos legítimos. Conviene observar primero el comportamiento y ajustar directivas con evidencia. HSTS se evalúa en un despliegue con HTTPS real y en un navegador: una petición HTTP local con `curl` no demuestra el comportamiento de downgrade ni la persistencia de la política. Antes de usar `includeSubDomains` o `preload`, hay que comprobar que todos los subdominios afectados soportan HTTPS.

**Analogía:** Helmet instala un juego de barandillas y señales en un edificio. Ayudan a prevenir accidentes, pero no comprueban la identidad de quien entra ni deciden qué habitaciones puede visitar; esas funciones necesitan controles propios.

**Conceptos clave:** cabeceras defensivas, CSP, `nosniff`, HSTS, HTTPS y defensa en profundidad.

#### Practica

**Desde cero:** crea una carpeta vacía para un proyecto nuevo. npm generará su manifiesto y lockfile; crea manualmente los archivos fuente indicados, sin copiar ejemplos del repositorio:

```bash
mkdir practica-cabeceras
cd practica-cabeceras
npm init -y
npm install express helmet
npm pkg set type=module scripts.start="node src/server.js"
mkdir src
```

Crea `src/server.js`:

```js
import express from "express";
import helmet from "helmet";

const app = express();
app.use(helmet());

app.get("/", (_req, res) => {
  res.json({ estado: "disponible" });
});

app.listen(3000, () => {
  console.log("API de cabeceras en http://127.0.0.1:3000");
});
```

En una terminal ejecuta `npm start` y, en otra, inspecciona la respuesta:

```bash
curl -i http://127.0.0.1:3000/
```

**Resultado esperado:** la respuesta es `200` e incluye cabeceras configuradas por Helmet, entre ellas `Content-Security-Policy` y `X-Content-Type-Options`. Los nombres pueden aparecer en minúsculas porque las cabeceras HTTP no distinguen mayúsculas; el conjunto exacto puede variar según la versión instalada.

**Fallo deliberado:** detén el servidor, comenta temporalmente `app.use(helmet());`, vuelve a arrancar y repite la petición. **Diagnóstico y corrección:** las cabeceras aportadas por Helmet desaparecen, aunque Express siga respondiendo; esto demuestra una regresión de configuración, no un fallo de Express. Restaura la línea y comprueba de nuevo las cabeceras.

**Práctica guiada.** Sustituye la llamada anterior por una CSP explícita para una respuesta que no necesita scripts:

```js
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  }
}));
```

Repite `curl -i`. **Pista:** busca `script-src 'none'` y `object-src 'none'` dentro de CSP; no actives ni desactives directivas sin relacionarlas con el contenido servido.

**Si falla.** Si no aparecen las cabeceras nuevas, confirma que reiniciaste el proceso editado y que la petición llega al puerto 3000. Si una página real deja de cargar recursos tras aplicar CSP, revisa la consola del navegador y corrige directivas concretas en lugar de desactivar toda la política.

#### Aplica

Crea `cabeceras.md` y registra tres cabeceras observadas, el riesgo que mitiga cada una y un control que sigue siendo necesario. Como ejercicio independiente, añade `frameAncestors: ["'none'"]` a las directivas, reinicia y verifica que CSP contiene `frame-ancestors 'none'`; explica en el archivo por qué esa defensa contra *framing* no sustituye la autorización de la API.

**Checklist de salida.**

- [ ] El proyecto se creó en `practica-cabeceras` sin reutilizar archivos de otro tema.
- [ ] `src/server.js` aplica Helmet antes de las rutas.
- [ ] La respuesta inspeccionada contiene CSP y `X-Content-Type-Options`.
- [ ] La comparación sin Helmet y su restauración muestran una diferencia observable en las cabeceras.
- [ ] La CSP configurada contiene `script-src 'none'`, `object-src 'none'` y `frame-ancestors 'none'`.
- [ ] `cabeceras.md` distingue mitigación del navegador, autenticación, autorización y validación, y reserva la comprobación de HSTS para HTTPS real.

**Errores comunes:** copiar una CSP sin comprobar recursos; afirmar que Helmet vuelve segura toda la aplicación; usar cabeceras como sustituto de controles de negocio; dar por verificado HSTS con una petición HTTP a localhost; ocultar cabeceras de diagnóstico sin justificar el cambio.

**Fuentes oficiales:** [Helmet](https://helmetjs.github.io/), [MDN HTTP headers](https://developer.mozilla.org/es/docs/Web/HTTP/Headers) y [OWASP Secure Headers](https://owasp.org/www-project-secure-headers/).

**Transferencia al proyecto integrador «API operativa de entregas»:** aplica Helmet antes de los routers y documenta las directivas que requieren los clientes reales. Verifica las cabeceras en cada entorno; evalúa HSTS únicamente donde exista HTTPS correctamente configurado.

---

### Tema 2: Rate limiting · Intermedio · 55 min

**Prerrequisito:** Node LTS, npm, middleware de Express y lectura de códigos de estado HTTP. El proyecto es independiente del tema anterior.

**Al terminar podrás:** aplicar un límite por ruta, producir un `429` con una prueba local acotada y justificar una configuración de proxy y almacenamiento para varias instancias.

#### Aprende

Un límite de tasa restringe cuántas solicitudes acepta una ruta para una clave durante una ventana de tiempo. Una ventana fija reinicia el contador al terminar cada intervalo; otras estrategias, como *token bucket*, permiten ráfagas delimitadas. `express-rate-limit` cuenta peticiones y responde `429 Too Many Requests` cuando se supera el umbral configurado.

**Por qué importa:** el control añade fricción a fuerza bruta y a clientes que reintentan sin medida, y ayuda a proteger recursos. No reemplaza autenticación, bloqueo de cuentas con criterio, validación, límites de tamaño ni protección de infraestructura. Un umbral adecuado para acceso puede ser demasiado restrictivo para consultas legítimas.

La clave predeterminada suele basarse en IP. Varias personas pueden compartir una IP por NAT y un atacante puede distribuir origen, de modo que IP no equivale a identidad. Si la aplicación está detrás de un proxy, Express solo debe confiar en cabeceras de reenvío de proxies conocidos: configura `trust proxy` con la topología exacta. Confiar en cualquier proxy puede permitir valores de IP falsificados; no confiar en el proxy real puede agrupar a todos los clientes bajo una misma dirección.

El almacenamiento en memoria pertenece a un solo proceso. Dos instancias mantienen contadores distintos, por lo que el límite global efectivo cambia con el número y la distribución de instancias. Para una política compartida se necesita un *store* común, como Redis, configurado según la biblioteca y con decisiones sobre disponibilidad, latencia, claves y expiración. Esto no elimina la necesidad de límites en el balanceador o proveedor cuando corresponda.

**Analogía:** un torniquete cuenta accesos durante un intervalo. Si cada entrada cuenta por separado, nadie controla el total del edificio; un registro compartido corrige esa visión, pero tampoco comprueba por sí solo la identidad de cada visitante.

**Conceptos clave:** ventana fija, `429`, `Retry-After`, clave por cliente, proxy confiable y store distribuido.

#### Practica

**Desde cero:** crea otro proyecto vacío y sus archivos manualmente:

```bash
mkdir practica-limite
cd practica-limite
npm init -y
npm install express express-rate-limit
npm pkg set type=module scripts.start="node src/server.js"
mkdir src
```

Crea `src/server.js`:

```js
import express from "express";
import rateLimit from "express-rate-limit";

const app = express();
const limiteAcceso = rateLimit({
  windowMs: 30_000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false
});

app.post("/acceso", limiteAcceso, (_req, res) => {
  res.sendStatus(204);
});

app.get("/publico", (_req, res) => {
  res.json({ estado: "sin limite de esta ruta" });
});

app.listen(3000, () => {
  console.log("API con limite en http://127.0.0.1:3000");
});
```

La ruta `/acceso` solo permite observar el middleware; no implementa autenticación real. Ejecuta `npm start` y realiza **únicamente cuatro solicitudes locales** dentro de la misma ventana de 30 segundos:

```bash
curl -i -X POST http://127.0.0.1:3000/acceso
curl -i -X POST http://127.0.0.1:3000/acceso
curl -i -X POST http://127.0.0.1:3000/acceso
curl -i -X POST http://127.0.0.1:3000/acceso
```

**Resultado esperado:** las tres primeras solicitudes responden `204` y la cuarta, `429`; la respuesta de rechazo incluye información de reintento según la configuración y versión. Tras esperar a que termine la ventana, una nueva solicitud vuelve a ser aceptada. Esta es una comprobación funcional acotada, no una prueba de carga ni un ejercicio de denegación de servicio.

**Fallo deliberado:** retira temporalmente `limiteAcceso` de la definición de `/acceso` y repite las cuatro peticiones. **Diagnóstico y corrección:** las cuatro alcanzan la ruta porque ya no existe el contador en esa cadena de middleware. Restaura `limiteAcceso` antes de `(_req, res)` y repite la comprobación.

**Práctica guiada.** Mientras `/acceso` está rechazando solicitudes, ejecuta una sola petición a `http://127.0.0.1:3000/publico`. **Resultado esperado:** continúa respondiendo `200`, porque el límite se aplicó a una ruta y no globalmente. **Pista:** la posición del middleware determina su alcance.

**Si falla.** Si la cuarta petición todavía responde `204`, comprueba que todas llegaron dentro de la misma ventana y que reiniciaste el servidor tras editar. Si aparece un aviso relacionado con IP o `X-Forwarded-For`, revisa la topología y `trust proxy`; no lo silencies aceptando cabeceras de cualquier cliente.

#### Aplica

Crea `politica-limites.md`. Documenta por separado una política para `/acceso` y otra para búsquedas, la clave elegida, el efecto de usuarios detrás de NAT, el número de proxies confiables y qué ocurre con dos procesos que usan memoria local. Como ejercicio independiente, añade un limitador propio de cinco solicitudes por minuto a una nueva ruta `/busqueda`, sin cambiar `/acceso`, y verifica una respuesta correcta y sus cabeceras de límite. Explica qué store compartido elegirías para dos instancias y qué decisión tomarías si ese store no estuviera disponible.

**Checklist de salida.**

- [ ] `/acceso` admite tres solicitudes locales y rechaza la cuarta dentro de la ventana.
- [ ] El contador se recupera después de la ventana sin reiniciar manualmente contadores.
- [ ] `/publico` permanece fuera del limitador de `/acceso`.
- [ ] `/busqueda` tiene un límite independiente y cabeceras de tasa observables.
- [ ] `politica-limites.md` explica NAT, configuración de proxy confiable y contadores por proceso.
- [ ] La propuesta para varias instancias incluye un store compartido y no presenta la prueba local como prueba de carga.

**Errores comunes:** aplicar un único umbral a todas las rutas; confundir IP con usuario; confiar en cabeceras de proxy sin control; usar memoria local como si fuera un contador global; omitir información de reintento; hacer ráfagas masivas para una comprobación que solo necesita unas pocas solicitudes.

**Fuentes oficiales:** [express-rate-limit](https://express-rate-limit.mintlify.app/), [RFC 6585](https://www.rfc-editor.org/rfc/rfc6585) y [OWASP API4](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/).

**Transferencia al proyecto integrador «API operativa de entregas»:** define límites diferentes para autenticación y consultas costosas. Registra la clave, ventana, proxy confiable y store de cada entorno, y prueba el umbral con el mínimo número de solicitudes que permita comprobar aceptación, rechazo y recuperación.

---

### Tema 3: Inyección SQL y sanitización contra XSS · Intermedio · 65 min

**Prerrequisito:** Node LTS, npm, SQL básico y distinción entre texto y HTML. No necesitas una base de datos ni archivos de otros temas para la práctica.

**Al terminar podrás:** construir una llamada `pg` con SQL y valores separados, validar un identificador sin sustituir los parámetros y seleccionar una defensa de salida acorde al contexto HTML.

#### Aprende

La inyección SQL aparece cuando datos no confiables cambian la estructura de una instrucción. En `node-postgres`, una consulta parametrizada mantiene el texto SQL con marcadores como `$1` y entrega los valores en un array aparte. El driver y la base tratan esos valores como datos, no como nuevas instrucciones. Validar que un código tenga el formato esperado reduce entradas inválidas, pero no reemplaza el parámetro. Los nombres de tablas o columnas no se parametrizan como valores: si deben variar, se seleccionan mediante una lista permitida.

**Por qué importa:** separar datos y código evita que caracteres de una búsqueda alteren la consulta. No es necesario crear un string SQL vulnerable ni ejecutar un ataque para comprender o comprobar el contrato seguro: basta con verificar qué texto y qué array recibe `pool.query` y mantener esa separación en todas las consultas.

Cross-Site Scripting (XSS) es un problema distinto: un dato alcanza un intérprete del navegador en un contexto ejecutable. Para insertar texto en HTML, `textContent` evita crear markup; cuando una respuesta HTML se construye en servidor, un escape como `escape-html` codifica caracteres para el **contexto de texto HTML**. El escape depende del contexto de salida: atributos, URL, JavaScript y CSS tienen reglas diferentes y no quedan protegidos universalmente por una sola función.

Sanitizar HTML significa analizar y filtrar markup para conservar solamente elementos y atributos permitidos; no es un sinónimo universal de escapar. Solo corresponde cuando el requisito admite HTML enriquecido y debe hacerse con una biblioteca mantenida y una política explícita. Escapar en todos los almacenamientos tampoco es una regla general: conserva el dato según el contrato y aplica la defensa adecuada en cada salida, evitando doble escape.

**Analogía:** una consulta parametrizada entrega una nota en un sobre separado del formulario de órdenes; el destinatario lee el valor sin convertirlo en una orden nueva. En HTML, además importa dónde se coloca la nota: una vitrina de texto, una dirección y un panel de comandos exigen protecciones distintas.

**Conceptos clave:** consultas parametrizadas, datos frente a código, validación de entrada, escape contextual, sanitización de HTML y XSS almacenado.

#### Practica

**Desde cero:** crea un proyecto nuevo. El pool simulado permite observar la llamada sin instalar PostgreSQL ni ejecutar SQL:

```bash
mkdir practica-datos-salida
cd practica-datos-salida
npm init -y
npm install pg escape-html
npm pkg set type=module scripts.start="node src/main.js"
mkdir src
```

Crea `src/consultas.js`:

```js
export async function buscarPorCodigo(pool, codigo) {
  if (typeof codigo !== "string" || !/^RF-\d+$/.test(codigo)) {
    throw new Error("El codigo debe tener el formato RF-<numero>");
  }

  return pool.query(
    "SELECT id, codigo FROM paquetes WHERE codigo = $1",
    [codigo]
  );
}
```

Crea `src/salida.js`:

```js
import escapeHtml from "escape-html";

export function paraTextoHtml(texto) {
  return escapeHtml(texto);
}
```

Crea `src/main.js`:

```js
import { buscarPorCodigo } from "./consultas.js";
import { paraTextoHtml } from "./salida.js";

const poolDePrueba = {
  async query(text, values) {
    console.log(JSON.stringify({ text, values }));
    return { rows: [] };
  }
};

await buscarPorCodigo(poolDePrueba, "RF-42");
console.log(paraTextoHtml('<img src=x onerror="alert(1)">'));

try {
  await buscarPorCodigo(poolDePrueba, "RF-x");
} catch (error) {
  console.log(`Entrada rechazada: ${error.message}`);
}
```

Ejecuta `npm start`.

**Resultado esperado:** el registro de la consulta muestra `$1` dentro de `text` y `RF-42` únicamente dentro de `values`. La salida HTML contiene entidades como `&lt;` y `&gt;`, no un elemento `img` literal. `RF-x` se rechaza antes de una segunda llamada al pool.

**Fallo deliberado:** cambia temporalmente el cuerpo de `paraTextoHtml` por `return texto;` y ejecuta de nuevo. **Diagnóstico y corrección:** ahora la salida conserva el markup literal, por lo que ya no existe la codificación requerida para ese contexto. Restaura `return escapeHtml(texto);`. La demostración inspecciona texto; no necesita ejecutar script en un navegador.

**Práctica guiada.** Modifica `src/main.js` para recorrer `["RF-1", "RF-12", "rf-1", "RF-x"]`, registrar si cada valor se acepta y contar las llamadas al pool. **Pista:** conserva el parámetro incluso para valores válidos; la expresión regular solo decide qué entradas pertenecen al contrato. Se esperan dos aceptados y dos rechazados.

**Si falla.** Si `pg` no aparece en el código ejecutado, recuerda que el pool simulado reproduce únicamente la firma de `query`; la función `buscarPorCodigo` está preparada para recibir un pool real. Si aparecen entidades dobles al integrar con una plantilla, comprueba si el motor ya escapa ese contexto antes de añadir otra codificación.

#### Aplica

Crea `contextos-salida.md` con una tabla para texto HTML, atributo, URL y JavaScript. Para cada uno indica el mecanismo apropiado, qué no debe reutilizarse de otro contexto y si una lista permitida es necesaria. Como ejercicio independiente, añade a `src/main.js` la observación `RF-42 <prioritaria> & revisar`, verifica su representación como texto HTML y explica por qué ese resultado no sería una sanitización universal para cualquier destino.

**Checklist de salida.**

- [ ] La consulta contiene `$1` y el código viaja en un array separado.
- [ ] La validación acepta `RF-1` y `RF-12`, y rechaza `rf-1` y `RF-x` antes de consultar.
- [ ] Ninguna demostración requiere concatenar un string SQL vulnerable ni ejecutar un exploit.
- [ ] El fallo sin escape produce markup literal y la corrección vuelve a generar entidades.
- [ ] La observación independiente representa `<` y `&` como texto en el contexto elegido.
- [ ] `contextos-salida.md` diferencia escape contextual y sanitización de HTML permitido.

**Errores comunes:** usar listas negras SQL como defensa principal; sustituir parámetros por escape manual; retirar parámetros porque ya existe validación; usar escape de texto HTML en URL, JavaScript o CSS; llamar sanitización a cualquier escape; escapar repetidamente sin conocer el motor de plantillas.

**Fuentes oficiales:** [node-postgres queries](https://node-postgres.com/features/queries), [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection) y [OWASP XSS](https://owasp.org/www-community/attacks/xss/).

**Transferencia al proyecto integrador «API operativa de entregas»:** parametriza la búsqueda de guías y conserva las observaciones como datos no confiables. Revisa cada destino de salida antes de elegir `textContent`, escape contextual o sanitización; añade casos con caracteres especiales sin convertirlos en demostraciones de explotación.

---

### Tema 4: OWASP API Security Top 10 y auditoría de dependencias · Intermedio · 65 min

**Prerrequisito:** Node LTS, npm, pruebas básicas con `node:test` y lectura de `package.json`. El ejercicio no reutiliza proyectos anteriores.

**Al terminar podrás:** construir una matriz de riesgos con evidencia, comprobar una denegación de autorización por objeto e interpretar un reporte actual de `npm audit` sin convertirlo en una garantía de seguridad.

#### Aprende

OWASP API Security Top 10 agrupa categorías de riesgo como autorización rota a nivel de objeto (BOLA), exposición o modificación indebida de propiedades, consumo irrestricto de recursos y SSRF. Es un marco para formular preguntas y reunir evidencia, no una certificación ni una lista que se completa por marcar títulos.

**Por qué importa:** una revisión estructurada evita limitar la seguridad a sintaxis o dependencias. Para BOLA, la evidencia útil incluye una prueba negativa con otra identidad; para exposición de datos, los campos reales de una respuesta; para consumo de recursos, límites medidos. Cada afirmación debe señalar alcance y prueba.

`npm audit` compara el árbol descrito por el proyecto con avisos conocidos disponibles en ese momento. Puede reportar dependencias directas o transitivas y clasificar severidad, pero no demuestra alcanzabilidad, ausencia de vulnerabilidades ni seguridad de la lógica propia. La base de avisos y el árbol cambian, por lo que dos ejecuciones en fechas distintas pueden producir resultados diferentes. `npm audit fix` propone actualizaciones compatibles dentro de los rangos cuando puede; las decisiones con cambios mayores exigen revisión y pruebas. No uses `npm audit fix --force` como corrección automática.

**Analogía:** OWASP es el índice de una inspección y `npm audit`, una comprobación de piezas con avisos publicados. El índice ayuda a no olvidar zonas; la revisión de piezas no prueba que el edificio entero sea seguro ni que una pieza afectada sea alcanzable en su instalación concreta.

**Conceptos clave:** BOLA, propiedades de objetos, consumo de recursos, SSRF, dependencias transitivas, severidad, alcanzabilidad y evidencia.

#### Practica

**Desde cero:** crea un proyecto independiente con una dependencia que auditar y una prueba de autorización mínima:

```bash
mkdir practica-owasp-auditoria
cd practica-owasp-auditoria
npm init -y
npm install express
npm pkg set type=module scripts.test="node --test"
mkdir src test
```

Crea `src/autorizacion.js`:

```js
export function puedeConsultar(actor, entrega) {
  return Boolean(
    actor && entrega && actor.id === entrega.propietarioId
  );
}
```

Crea `test/autorizacion.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { puedeConsultar } from "../src/autorizacion.js";

const entrega = { id: "E-1", propietarioId: "cliente-1" };

test("permite al propietario", () => {
  assert.equal(puedeConsultar({ id: "cliente-1" }, entrega), true);
});

test("deniega a otra identidad", () => {
  assert.equal(puedeConsultar({ id: "cliente-2" }, entrega), false);
});

test("deniega cuando falta el actor", () => {
  assert.equal(puedeConsultar(null, entrega), false);
});
```

Ejecuta `npm test`. **Resultado esperado:** pasan las tres pruebas, incluida la negativa que evita autorizar solo por conocer un identificador de recurso.

**Fallo deliberado:** sustituye temporalmente el cuerpo de `puedeConsultar` por `return true;`. **Diagnóstico y corrección:** la prueba de otra identidad falla porque desapareció la comparación de propiedad; restaura la función y vuelve a ejecutar las pruebas. El fallo útil es la autorización incorrecta detectada, no una explotación externa.

Crea `matriz-owasp.md` con este punto de partida y complétalo con evidencia del ejercicio:

```md
# Revisión OWASP de una API de entregas

| Categoría | Pregunta concreta | Evidencia | Control o pendiente |
| --- | --- | --- | --- |
| API1 BOLA | ¿Otra identidad puede consultar E-1? | Prueba negativa de propietario | Comparar actor y propietario en cada consulta |
| API3 Propiedades de objeto | ¿La respuesta incluye campos internos? | Enumerar campos de una respuesta real | Definir un DTO de salida |
| API4 Consumo de recursos | ¿Existen límites de tasa, tamaño y tiempo? | Registrar configuración y prueba acotada | Completar límites ausentes |
| API7 SSRF | ¿El servidor obtiene URL aportadas por clientes? | Revisar llamadas salientes | Lista permitida y controles de red si aplica |
```

Ahora obtiene el estado actual de dependencias:

```bash
npm audit
npm audit --json > audit.json
codigo=$?
printf 'npm audit terminó con código %s\n' "$codigo"
```

Un código distinto de cero puede acompañar a un reporte con hallazgos; conserva el JSON y lee también `stderr` si el comando no produjo un reporte válido. Crea `audit-notes.md` con dependencia, ruta directa o transitiva, entorno de producción o desarrollo, severidad, aviso, versión corregida disponible y decisión. Si hay avisos, usa `npm ls <paquete>` para entender la ruta. Si no los hay, registra únicamente que esta ejecución no mostró avisos conocidos, no que el proyecto carece de CVE.

**Resultado esperado:** `matriz-owasp.md` vincula riesgos con comprobaciones y `audit-notes.md` refleja el reporte obtenido hoy. No se fija un número de hallazgos ni una tabla de versiones como salida obligatoria.

**Práctica guiada.** Si `npm audit` propone una actualización compatible, revisa primero la ruta y el cambio; después ejecuta `npm audit fix`, `npm ls express`, `npm test` y otra auditoría. Documenta qué cambió y qué permanece. Si no propone cambios, registra ese resultado. **Pista:** no fuerces una versión mayor para hacer desaparecer un aviso.

**Si falla.** Si la redirección deja un archivo vacío o JSON con un error, no lo interpretes como un árbol limpio. Repite `npm audit` sin redirección, revisa red, registro y lockfile, y conserva el código de salida junto al diagnóstico.

#### Aplica

Añade a `test/autorizacion.test.js` una prueba independiente que llame a `puedeConsultar({ id: "cliente-1" }, null)` y exija `false`. Después crea `src/entrega-view.js` para definir un DTO de salida con lista permitida:

```js
export function vistaEntrega(entrega) {
  return { id: entrega.id, codigo: entrega.codigo };
}
```

Crea `test/entrega-view.test.js`:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { vistaEntrega } from "../src/entrega-view.js";

test("el DTO no publica campos internos", () => {
  const vista = vistaEntrega({ id: "E-1", codigo: "RF-42", notaInterna: "secreto" });
  assert.deepEqual(vista, { id: "E-1", codigo: "RF-42" });
  assert.equal("notaInterna" in vista, false);
});
```

Ejecuta `npm test` y actualiza la matriz con ambas evidencias. Después elige un aviso real del reporte, si existe, y justifica actualizar, sustituir o aceptar temporalmente con fecha de revisión; si no existe, documenta qué señal haría necesaria una nueva revisión.

**Checklist de salida.**

- [ ] Las pruebas permiten al propietario y niegan otra identidad, actor ausente y entrega inexistente.
- [ ] El fallo `return true` fue detectado por una prueba negativa y corregido.
- [ ] El DTO de salida no expone `notaInterna` y tiene una prueba.
- [ ] La matriz relaciona BOLA, propiedades, consumo y SSRF con evidencia o pendientes concretos.
- [ ] `audit-notes.md` registra el resultado real sin fijar recuentos ni prometer ausencia de CVE.
- [ ] Cualquier actualización se revisó con pruebas y sin `npm audit fix --force`.

**Errores comunes:** tratar OWASP como certificado; probar solo el acceso permitido; confundir severidad con alcanzabilidad; ignorar si una dependencia es de desarrollo o runtime; aceptar cambios mayores automáticamente; publicar reportes con información sensible.

**Fuentes oficiales:** [npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit), [OWASP API Security Top 10](https://owasp.org/API-Security/) y [Node security](https://nodejs.org/en/learn/getting-started/security-best-practices).

**Transferencia al proyecto integrador «API operativa de entregas»:** revisa autorización por recurso, campos de respuesta, consumo y llamadas salientes. Conserva pruebas negativas y una decisión fechada por aviso de dependencia; separa los pendientes de lógica propia de los avisos del árbol npm.

---

### Tema 5: CVE, CWE y npm audit en el pipeline · Avanzado · 70 min

**Prerrequisito:** Node LTS, npm, lectura del Tema 4 y fundamentos de integración continua. Se creará otro proyecto desde cero.

**Al terminar podrás:** distinguir CVE, CWE y GHSA, procesar de forma robusta el JSON de `npm audit`, interpretar sus códigos de salida y aplicar un umbral explícito en un pipeline.

#### Aprende

Un **CVE** identifica una vulnerabilidad concreta en un producto o versión. Un **CWE** clasifica un tipo de debilidad, como inyección de código o contaminación de prototipos. Un aviso **GHSA** procede de GitHub Advisory Database y puede enlazar CVE y CWE. Una misma debilidad CWE puede aparecer en muchos productos; un CVE no es una categoría general.

**Por qué importa:** estos identificadores permiten rastrear y priorizar hallazgos sin confundir clase de fallo, aviso e instancia afectada. En CI también importa distinguir tres situaciones: el auditor terminó sin hallazgos conocidos, terminó con hallazgos o no pudo producir un reporte confiable. Solo la primera no muestra avisos en esa ejecución; ninguna garantiza cobertura de seguridad total.

`npm audit --json` puede escribir un reporte válido y terminar con código `1` cuando existen hallazgos. Por eso un wrapper no debe lanzar antes de leer `stdout`. Un programa robusto usa `spawnSync`, comprueba errores de ejecución y estado, valida que haya JSON, captura errores de parseo, reconoce un objeto `error` del reporte y no presupone que `vulnerabilities`, `via`, `cwe` o `url` existan siempre. Después separa el código de salida de npm de la decisión del pipeline: esta última depende del umbral configurado.

Los avisos cambian con el tiempo. Un lockfile fija versiones instaladas, no una lista eterna de advisories. No se deben fijar tablas de salida como requisito, garantizar que una versión siempre tendrá ciertos CVE ni afirmar que una ejecución sin avisos elimina todos los riesgos.

**Analogía:** CWE es el tipo de defecto de una cerradura; CVE identifica el lote afectado y GHSA es una ficha que relaciona la información. El código de salida del inspector indica cómo terminó esa revisión, mientras la política del edificio decide qué hallazgos impiden abrirlo.

**Conceptos clave:** CVE, CWE, GHSA, lockfile, `spawnSync`, parseo defensivo, código de salida y umbral en CI.

#### Practica

**Desde cero:** crea un proyecto aislado. La versión antigua de lodash conserva el caso histórico de estudio, pero no fija los avisos que devolverá la base actual:

```bash
mkdir auditoria-pipeline
cd auditoria-pipeline
npm init -y
npm install lodash@4.17.20
```

Crea `auditar.js`:

```js
const { spawnSync } = require("node:child_process");

const NIVELES = ["low", "moderate", "high", "critical"];
const minimo = process.env.AUDIT_MIN_SEVERITY ?? "high";

if (!NIVELES.includes(minimo)) {
  console.error(`Umbral inválido: ${minimo}`);
  process.exit(2);
}

const UMBRAL = NIVELES.slice(NIVELES.indexOf(minimo));
const ejecutable = process.platform === "win32" ? "npm.cmd" : "npm";
const resultado = spawnSync(ejecutable, ["audit", "--json"], {
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024
});

if (resultado.error) {
  console.error(`No se pudo ejecutar npm audit: ${resultado.error.message}`);
  process.exit(2);
}

if (resultado.status === null || ![0, 1].includes(resultado.status)) {
  console.error(`npm audit terminó con estado ${resultado.status}`);
  console.error(resultado.stderr || "Sin detalle adicional");
  process.exit(2);
}

const salida = resultado.stdout?.trim();
if (!salida) {
  console.error("npm audit no devolvió JSON");
  console.error(resultado.stderr || "Sin detalle adicional");
  process.exit(2);
}

let reporte;
try {
  reporte = JSON.parse(salida);
} catch (error) {
  console.error(`JSON inválido de npm audit: ${error.message}`);
  process.exit(2);
}

if (!reporte || typeof reporte !== "object" || Array.isArray(reporte)) {
  console.error("El reporte no es un objeto JSON");
  process.exit(2);
}

if (reporte.error) {
  console.error(`npm audit reportó un error: ${reporte.error.summary ?? "sin resumen"}`);
  process.exit(2);
}

const lista = reporte.vulnerabilities ?? {};
if (typeof lista !== "object" || Array.isArray(lista)) {
  console.error("vulnerabilities no tiene la forma esperada");
  process.exit(2);
}

const entradas = Object.entries(lista);
const filas = [];

for (const [paquete, info] of entradas) {
  const via = Array.isArray(info?.via) ? info.via : [];
  for (const aviso of via) {
    if (!aviso || typeof aviso !== "object") continue;
    filas.push({
      paquete,
      severidad: aviso.severity ?? info?.severity ?? "desconocida",
      cwe: Array.isArray(aviso.cwe) ? aviso.cwe.join(", ") : "no indicado",
      aviso: typeof aviso.url === "string"
        ? aviso.url.split("/").pop()
        : String(aviso.source ?? "sin identificador")
    });
  }
}

console.table(filas);
const graves = entradas
  .filter(([, info]) => UMBRAL.includes(info?.severity))
  .map(([paquete]) => paquete);

console.log(`Estado de npm audit: ${resultado.status}`);
console.log(`Umbral del pipeline: ${minimo}`);
console.log(`Paquetes en o sobre el umbral: ${graves.join(", ") || "ninguno"}`);
process.exitCode = graves.length > 0 ? 1 : 0;
```

Ejecuta el wrapper y captura su propio código antes de lanzar otro comando:

```bash
node auditar.js
codigo=$?
printf 'código del pipeline local: %s\n' "$codigo"
```

**Resultado esperado:** el script muestra los avisos objetos disponibles, tolera entradas `via` que sean strings y elige su salida según `AUDIT_MIN_SEVERITY`. Con el valor predeterminado `high`, devuelve `1` si alguna vulnerabilidad del reporte tiene severidad alta o crítica y `0` si los hallazgos válidos quedan por debajo. Un error de ejecución, JSON inválido o reporte de error devuelve `2`. Las filas y severidades concretas dependen del reporte actual.

**Fallo deliberado:** sustituye temporalmente la ejecución por `execSync("npm audit --json")`. **Diagnóstico y corrección:** si npm termina con estado distinto de cero, `execSync` puede lanzar antes de que el programa lea el JSON; el wrapper confunde hallazgos con fallo de ejecución. Restaura `spawnSync` y sus comprobaciones para separar ambos casos.

**Práctica guiada.** Guarda el estado inicial con `npm ls lodash` y ejecuta el wrapper con `AUDIT_MIN_SEVERITY=critical node auditar.js`. Después revisa la propuesta de `npm audit`, ejecuta `npm audit fix` solo si el cambio es aceptable y repite `npm ls lodash` y el wrapper. Registra en `auditoria-local.md` versiones, estados y avisos antes y después. **Pista:** una actualización puede modificar el reporte, pero no se exige que elimine todos los avisos ni se usa `--force`.

**Si falla.** Distingue `1` (decisión de bloqueo con un reporte procesado) de `2` (auditoría no confiable o configuración inválida). Si el parseo falla, conserva `stdout` y `stderr` para diagnosticar; no conviertas automáticamente el problema en éxito ni uses una salida vacía como sinónimo de ausencia de avisos.

#### Aplica

Como ejercicio independiente, crea `.github/workflows/auditoria.yml` en este mismo proyecto, sin importar un workflow prefabricado:

```yaml
name: auditoria-dependencias
on: push
permissions:
  contents: read
jobs:
  audit:
    runs-on: ubuntu-latest
    env:
      AUDIT_MIN_SEVERITY: ${{ github.ref == 'refs/heads/main' && 'high' || 'critical' }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: node auditar.js
```

El umbral es `high` al publicar en `main` y `critical` en otras ramas. Crea `politica-auditoria.md` y justifica esa diferencia, cómo se revisan las excepciones y por qué un estado correcto no acredita seguridad completa. Añade el tratamiento de una rama con nombre distinto y explica qué umbral recibe según la expresión.

**Checklist de salida.**

- [ ] El documento de política distingue CVE, CWE y GHSA con un aviso real o una explicación de su ausencia.
- [ ] `auditar.js` comprueba error de proceso, estado, salida vacía, JSON, forma del reporte y `reporte.error`.
- [ ] El wrapper no confunde el estado `1` de npm con una imposibilidad de leer el reporte.
- [ ] Los estados `0`, `1` y `2` del script tienen significados diferentes y comprobables.
- [ ] El workflow aplica `high` en `main` y `critical` en otras ramas mediante `AUDIT_MIN_SEVERITY`.
- [ ] La práctica no fija recuentos de avisos, no usa `audit fix --force` y no promete cobertura total.

**Errores comunes:** confundir CVE con CWE; usar `execSync` sin capturar su salida ante estado `1`; parsear `stdout` sin validar; tratar cualquier estado como ausencia de hallazgos; basar el bloqueo solo en filas de advisories y no en la severidad del paquete; aplicar el mismo umbral sin política; aceptar excepciones sin fecha de revisión.

**Fuentes oficiales:** [npm Docs: npm audit](https://docs.npmjs.com/cli/v10/commands/npm-audit), [MITRE CWE](https://cwe.mitre.org/) y [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices).

**Transferencia al proyecto integrador «API operativa de entregas»:** incorpora el wrapper al pipeline con un umbral documentado, conserva el reporte como artefacto sin secretos y define revisión humana para alcanzabilidad, cambios de versión y excepciones. Un pipeline verde representa únicamente el resultado de ese control en esa ejecución.

---

## Laboratorio práctico

Construye una API pequeña desde una carpeta vacía para integrar cabeceras, límite por ruta, parámetros SQL, salida HTML y auditoría. Es un proyecto nuevo: no copies archivos de los temas ni uses sus carpetas.

**Al terminar podrás:** entregar una API local y evidencias que permitan comprobar cinco respuestas concretas, una regresión corregida y una decisión de dependencias sin declarar seguridad total.

```bash
mkdir laboratorio-seguridad-node
cd laboratorio-seguridad-node
npm init -y
npm install express helmet express-rate-limit escape-html
npm pkg set type=module scripts.start="node src/server.js"
mkdir src
```

Crea `src/app.js`:

```js
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import escapeHtml from "escape-html";

export function crearApp(pool) {
  const app = express();
  app.use(helmet());

  const limiteAcceso = rateLimit({
    windowMs: 60_000,
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false
  });

  app.get("/", (_req, res) => {
    res.json({ estado: "disponible" });
  });

  app.post("/acceso", limiteAcceso, (_req, res) => {
    res.sendStatus(204);
  });

  app.get("/paquetes/:codigo", async (req, res, next) => {
    if (!/^RF-\d+$/.test(req.params.codigo)) {
      return res.status(400).json({ error: "Codigo invalido" });
    }

    try {
      const resultado = await pool.query(
        "SELECT id, codigo FROM paquetes WHERE codigo = $1",
        [req.params.codigo]
      );
      return res.json({ paquete: resultado.rows[0] ?? null });
    } catch (error) {
      return next(error);
    }
  });

  app.get("/observacion", (req, res) => {
    const texto = String(req.query.texto ?? "");
    res.type("html").send(`<p>${escapeHtml(texto)}</p>`);
  });

  app.use((error, _req, res, _next) => {
    console.error(error.message);
    res.status(500).json({ error: "Error interno" });
  });

  return app;
}
```

Crea `src/server.js`. El pool de demostración evita exigir PostgreSQL y hace visible el contrato que después debe cumplir un pool `pg` real:

```js
import { crearApp } from "./app.js";

const poolDePrueba = {
  async query(text, values) {
    console.log(JSON.stringify({ text, values }));
    return { rows: [{ id: 1, codigo: values[0] }] };
  }
};

crearApp(poolDePrueba).listen(3000, () => {
  console.log("Laboratorio en http://127.0.0.1:3000");
});
```

Ejecuta `npm start` y reúne las siguientes evidencias con peticiones locales individuales:

```bash
curl -i http://127.0.0.1:3000/
curl -i http://127.0.0.1:3000/paquetes/RF-42
curl -i http://127.0.0.1:3000/paquetes/RF-x
curl -i --get --data-urlencode 'texto=<img src=x onerror=alert(1)>' http://127.0.0.1:3000/observacion
curl -i -X POST http://127.0.0.1:3000/acceso
curl -i -X POST http://127.0.0.1:3000/acceso
curl -i -X POST http://127.0.0.1:3000/acceso
curl -i -X POST http://127.0.0.1:3000/acceso
```

**Resultados esperados:**

- `/` responde `200` con cabeceras de Helmet; su presencia no sustituye las demás comprobaciones.
- `/paquetes/RF-42` responde con el paquete y el registro del servidor conserva `$1` en el SQL y `RF-42` en `values`.
- `/paquetes/RF-x` responde `400` y no produce una llamada al pool.
- `/observacion` devuelve entidades HTML en lugar de un elemento `img` literal; la defensa mostrada corresponde al contexto de texto HTML.
- Las tres primeras peticiones a `/acceso` dentro de un minuto responden `204` y la cuarta, `429`. No aumentes el volumen: es solo una prueba funcional local.

**Regresión deliberada y corrección:** cambia únicamente `${escapeHtml(texto)}` por `${texto}` en `src/app.js`, reinicia y repite la petición de observación. La aparición de markup literal identifica la regresión. Restaura `${escapeHtml(texto)}` y verifica de nuevo; no concatenes SQL vulnerable ni ejecutes un exploit para completar el laboratorio.

Crea `evidencia-seguridad.md` con las respuestas anteriores, una explicación de proxy y store distribuido para desplegar dos instancias, y una sección OWASP con BOLA, exposición de propiedades, consumo de recursos y SSRF. Ejecuta finalmente:

```bash
npm audit
npm audit --json > audit.json
codigo=$?
printf 'código de npm audit: %s\n' "$codigo"
```

Añade a `evidencia-seguridad.md` los avisos realmente obtenidos, distinguiendo CVE, CWE y GHSA cuando esos datos estén presentes. Registra severidad, ruta de dependencia y decisión; define el umbral que usará el pipeline. No fijes un número esperado de avisos, no uses `npm audit fix --force` y no interpretes un reporte sin hallazgos como ausencia garantizada de vulnerabilidades.

**Checklist del laboratorio.**

- [ ] Todos los archivos fuente se crearon manualmente en `laboratorio-seguridad-node` y el proyecto no depende de ejemplos anteriores.
- [ ] Las cinco rutas o grupos de comprobación producen los estados y cuerpos descritos.
- [ ] La evidencia SQL muestra estructura y valores separados sin construir una consulta vulnerable.
- [ ] La regresión HTML es visible, se corrige y se vuelve a comprobar.
- [ ] La propuesta de dos instancias configura proxy confiable y store compartido.
- [ ] La sección OWASP relaciona riesgos con evidencias o pendientes y la auditoría conserva el resultado y código reales.

**Estado de verificación:** ejecución de ejemplos y laboratorio pendiente; revisión pedagógica humana pendiente. Los resultados descritos son esperados y no se presentan como ejecuciones realizadas ni como certificación de seguridad o aprendizaje.
