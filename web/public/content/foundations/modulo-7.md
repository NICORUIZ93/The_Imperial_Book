# Módulo 7: Requisitos, diseño, arquitectura y mantenimiento


## Aprende construyendo

### Tema 1: Requisitos, stakeholders y criterios verificables

#### Paso 1 · Objetivo y preparación
Al finalizar vas a convertir "confirmar una entrega debe ser seguro" en un criterio de aceptación verificable, usando la regla real de `examples/rutaflow/node/confirm-delivery.ts`. Prerrequisitos: ninguno adicional.

#### Paso 2 · Contexto y caso real
A lo largo de estos 12 módulos vas a construir el proyecto integrador Fundamentos, y en este módulo en particular vas a organizar el código en módulos para reutilizar funciones. "El sistema debe confirmar entregas de forma segura" no es verificable. El código real ya lo resolvió con una regla concreta: `recipientPin` debe tener exactamente 6 dígitos — esa es la especificación que faltaba poner en palabras antes de escribirse en código.

#### Paso 3 · Teoría, modelo mental y analogía
Un criterio de aceptación convierte una intención vaga en ejemplos con entrada y salida esperada — el contrato de resultado de una obra, no una sensación de "que quede bien".

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/ejemplo.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

**Crea** el archivo `src/ejemplo.py` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

```text
Como conductor de RutaFlow
quiero confirmar la entrega de un envío
para que el cliente sepa que su paquete llegó.

Criterios:
- Dado un comando con recipientPin de 6 dígitos y shipmentId válido, cuando se confirma, entonces el envío queda "delivered".
- Dado un recipientPin de 4 dígitos, cuando se confirma, entonces se rechaza con TypeError, sin cambiar el estado del envío.
- Dado un commandId ya procesado antes, cuando se reenvía el mismo comando, entonces se devuelve el resultado anterior sin volver a confirmar.
```

**Ejecuta el ejemplo** (guarda el código en un archivo y córrelo desde la terminal):

```bash
python3 ejemplo.py
```
Observa la salida impresa y compárala con el resultado esperado.

Resultado esperado: tres criterios, cada uno con un "dado/cuando/entonces" verificable — los tres ya están implementados literalmente en `confirmDelivery()`, lo que confirma que la especificación describe el código real, no una aspiración.

#### Paso 5 · Práctica guiada
Pista: escribí un cuarto criterio deliberadamente vago ("el sistema debe responder rápido") y tratá de convertirlo en una prueba — ese es el fallo deliberado: no podés escribir un `assert` sin una métrica, un umbral y un contexto ("95% de confirmaciones en menos de 200ms con el motor de pruebas local"); sin eso, "rápido" no es un criterio, es una opinión.

#### Paso 6 · Práctica independiente
Escribe 5 criterios TUYOS que sean verificables, directamente del CLI del proyecto integrador Fundamentos. Por ejemplo: "tarea add 'hacer compras' debe guardar y después listar mostrará esa tarea".

#### Paso 7 · Cierre y evidencia
Entregá los tres criterios verificables del Paso 4, el criterio vago corregido del Paso 5, y los cinco criterios del Paso 6; explicá por qué código correcto para un requisito mal escrito sigue siendo un fracaso. Errores comunes: escribir requisitos sin métrica ni umbral ("debe ser rápido"), confundir una historia de usuario con una especificación completa, y no registrar los supuestos ni las exclusiones del alcance. Fuentes oficiales: https://www.iso.org/standard/72089.html.
**¿Por qué es importante?** Porque `confirmDelivery()` ya fue programado correctamente contra una regla de 6 dígitos — el riesgo real en este Tema nunca fue el código, sino quedarse con un requisito ambiguo antes de escribirlo.
**Evidencia de aprendizaje:** entrega modelo, ejemplo, fallo, corrección, comparación y conclusión.
**Conceptos clave:** stakeholder, necesidad, requisito funcional, atributo de calidad, restricción, historia, criterio de aceptación, supuesto y trazabilidad.

Software exitoso no es el que contiene más funciones, sino el que satisface necesidades relevantes bajo restricciones explícitas. Un stakeholder puede ser usuario, operador, negocio, auditor o equipo de soporte; sus objetivos pueden entrar en tensión.

“El sistema debe ser rápido” no es verificable. “El 95 % de búsquedas por SKU debe responder en menos de 200 ms con 100 000 productos en el entorno de referencia” define operación, métrica, umbral y contexto.

Una historia organiza valor, pero no sustituye especificación:

```text
Como operador de bodega
quiero registrar una retirada por SKU
para mantener el stock actualizado.

Criterios:
- Dado stock 5, cuando retiro 2, entonces queda 3 y se registra auditoría.
- Dado stock 1, cuando retiro 2, entonces se rechaza sin cambio parcial.
- Un lector autenticado no puede retirar.
```

Los criterios usan ejemplos que luego pueden convertirse en pruebas. Registra supuestos (“una sola moneda”), exclusiones (“no sincroniza sucursales todavía”) y fuente. Mantén trazabilidad requisito → decisión → código → prueba → evidencia.

Prioriza por valor, riesgo, dependencia y coste de retraso. “Todo es prioridad alta” elimina la utilidad de priorizar. Descubrimiento continúa durante desarrollo: prototipos y pruebas con usuarios pueden revelar que el problema estaba mal entendido.

**Analogía:** requisitos son el contrato de resultado de una obra; “que sea cómoda” necesita convertirse en medidas y escenarios sin fingir que toda experiencia humana se reduce a números.

**¿Por qué es importante?** Código correcto para un requisito equivocado sigue siendo fracaso. Criterios claros reducen retrabajo y hacen evaluación objetiva.

**Casos de uso reales:** historias, contratos API, SLO, accesibilidad, cumplimiento, migraciones y aceptación.

**Diagrama:**

```mermaid
flowchart LR
    ST["stakeholder"] --> NEED["necesidad"] --> REQ["requisito"] --> CRITERIA["criterio"]
    CRITERIA --> DESIGN["diseño"] --> TEST["prueba"] --> EVIDENCE["evidencia"]
```
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
#### Profundización · De requisito vago a criterio verificable en el CLI

El gestor de tareas del proyecto integrador tiene una función `prioritize()` pensada para "ayudar al usuario a enfocarse en lo urgente" — una frase tan poco verificable como "el sistema debe ser rápido".

Convertí ese requisito en al menos tres criterios de aceptación (dado/cuando/entonces), con el mismo rigor del Paso 4: definí qué campo determina "urgente" (¿una prioridad explícita del 1 al 5? ¿una fecha límite?), qué pasa si dos tareas empatan en prioridad, y qué pasa si una tarea no tiene prioridad asignada.

[SOLUCIÓN PLEGADA]
> "Dado un listado con tareas de prioridad 1 a 5, cuando se invoca `prioritize`, entonces se muestran primero las de prioridad 1, en orden descendente." + "Dado dos tareas con la misma prioridad, cuando se invoca `prioritize`, entonces se ordenan por fecha de creación, la más antigua primero." + "Dado una tarea sin prioridad asignada, cuando se invoca `prioritize`, entonces se trata como prioridad 5, nunca como error."

**¿Por qué importa?** Sin estos criterios, "ayudar a enfocarse en lo urgente" es una frase que cualquier implementación puede reclamar cumplir, incluso una que ordena al azar.
### Tema 2: Arquitectura guiada por atributos de calidad

#### Paso 1 · Objetivo y preparación
Al finalizar vas a escribir el escenario de calidad que justifica una línea real de `confirm-delivery.ts`: la restricción `UNIQUE(command_id)`. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
El comentario del código real dice: "La implementación SQL debe insertar `commandId` y cambiar el envío en una única transacción con restricción `UNIQUE(command_id)`" — esa frase es la respuesta a un escenario de calidad que nunca se escribió explícitamente hasta ahora.

#### Paso 3 · Teoría, modelo mental y analogía
Un escenario de calidad tiene fuente, estímulo, artefacto, entorno, respuesta y medida — no es un diagrama bonito, es una frase verificable sobre qué pasa cuando algo sale mal.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo
```

```text
Fuente: red inestable del conductor
Estímulo: el mismo comando "confirmar entrega" se reenvía dos veces (reintento automático)
Artefacto: confirmDelivery() + repositorio
Entorno: operación normal con conexión intermitente
Respuesta: la segunda llamada devuelve el resultado ya guardado, sin volver a confirmar ni duplicar
Medida: cero entregas duplicadas, verificable con UNIQUE(command_id) en la base real
```

**Ejecuta el ejemplo** (guarda el código en un archivo y córrelo desde la terminal):

```bash
python3 ejemplo.py
```
Observa la salida impresa y compárala con el resultado esperado.

Resultado esperado: un escenario completo que explica por qué el código ya revisado en el Tema 1 necesita esa restricción — no es un detalle de implementación arbitrario, responde a un escenario de red real.

#### Paso 5 · Práctica guiada
Pista: quitá mentalmente la restricción `UNIQUE(command_id)` del diseño y repetí el escenario — ese es el fallo deliberado: sin esa restricción, dos reintentos del mismo comando podrían insertar dos filas de confirmación para el mismo envío, rompiendo exactamente la medida ("cero entregas duplicadas") que el escenario exige.

#### Paso 6 · Práctica independiente
Escribí un segundo escenario de calidad para un atributo distinto (por ejemplo, rendimiento: "el 95% de las confirmaciones deben procesarse en menos de 200ms con 100 conductores simultáneos") y documentá qué decisión de diseño (no solo de base de datos) ese escenario favorecería.

#### Paso 7 · Cierre y evidencia
Entregá el escenario de durabilidad del Paso 4, la restricción removida y su consecuencia del Paso 5, y el segundo escenario del Paso 6; explicá por qué los atributos de calidad compiten entre sí (durabilidad vs. velocidad) y la arquitectura hace ese trade-off explícito. Errores comunes: diagramar la arquitectura sin un escenario de calidad medible detrás, tratar una restricción de base de datos como detalle de implementación en vez de una decisión arquitectónica, y agregar una fitness function nueva sin decidir si debe bloquear o solo advertir. Fuentes oficiales: https://c4model.com/.
**¿Por qué es importante?** Porque la restricción `UNIQUE(command_id)` no es un capricho de la base de datos: es la respuesta directa a un escenario de calidad real (reintentos de red) que, sin documentarlo, parece una regla arbitraria.
**Escenario:** Tu arquitectura decidió que el dominio NO importa infraestructura. Pasaron 6 meses, un nuevo miembro accidentalmente añade `import sqlite3` en `domain.py`. Sin fitness function, lo merges a main.

**Tu tarea:**
1. Escribe una fitness function que detecte esa violación.
2. ¿Dónde se ejecuta? (CI, pre-commit, local.)
3. ¿Cómo comunica violaciones sin bloquear?
4. ¿Cuándo es estricta (bloquear) vs suave (advertir)?

[SOLUCIÓN PLEGADA]
> Fitness function en Python: `for line in open('src/domain.py'): if 'import sqlite' in line: raise Exception()`. Se ejecuta en CI after build, bloqueante. Alternativa softer: escanear dependencias con `pipdeptree` y comparar contra whitelist, reportando en logs sin fallar. Estricta si es arquitectura de seguridad (dominio nunca confía). Suave si es estilo (permitir excepciones documentadas con `# noqa: dependency-check`).

**Evidencia de aprendizaje:** entrega modelo, ejemplo, fallo, corrección, comparación y conclusión.
**Conceptos clave:** arquitectura, componente, conector, límite, dependencia, atributo de calidad, escenario, trade-off, C4 y fitness function.

Arquitectura son decisiones estructurales difíciles de cambiar: responsabilidades, límites, comunicación y dependencias. No es únicamente un diagrama. Se evalúa contra atributos como mantenibilidad, disponibilidad, rendimiento, seguridad, portabilidad y operabilidad.

Un escenario de calidad tiene fuente, estímulo, artefacto, entorno, respuesta y medida: “durante operación normal, una pérdida del proceso no debe corromper una transacción confirmada; tras reinicio, datos comprometidos permanecen”. Este escenario favorece transacciones/durabilidad. Otro de despliegue frecuente puede favorecer modularidad y automatización.

C4 comunica niveles:

```mermaid
flowchart LR
    PERSON["Operador"] --> WEB["App Web"] --> APP["Aplicación"] --> DB["Base de datos"]
    APP --> ID["Servicio de identidad"]
```

Una arquitectura por capas puede dirigir dependencias hacia el dominio:

```mermaid
flowchart LR
    UI["presentación"] --> APP2["aplicación"] --> DOMAIN["dominio"]
    INFRA["infraestructura"] -->|"implementa puertos"| APP2
```

El dominio no debería importar SQLite ni HTTP. Define una interfaz/puerto `RepositorioProductos`; infraestructura la implementa. Esto facilita pruebas y cambio de mecanismo, pero añadir abstracciones sin alternativa ni beneficio puede ser sobreingeniería.

Fitness functions automatizan propiedades: reglas de dependencia, presupuesto de bundle, tiempo de build, cobertura de contratos o vulnerabilidades máximas. La arquitectura evoluciona con evidencia.

**Analogía:** arquitectura decide estructura, circulación y servicios de un edificio según uso y riesgos; decorar habitaciones no corrige una salida de emergencia inexistente.

**¿Por qué es importante?** Los atributos compiten: cifrado, redundancia o abstracción añaden coste. Arquitectura hace explícitos trade-offs y evita dependencias accidentales.

**Casos de uso reales:** monolito modular, microservicios, móvil offline, sistemas regulados y plataformas multi-equipo.

**Diagrama:**

```mermaid
flowchart LR
    QUALITY["atributos + restricciones"] --> OPTIONS["alternativas"] --> TRADE["trade-offs"]
    TRADE --> DECISION["decisión"] --> MEASURE["fitness function"]
```

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** Define disponibilidad, facilidad de prueba y recuperación requeridas por el gestor. Compara dos diseños mediante un escenario concreto de archivo corrupto, en vez de elegir capas solo por su nombre.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
### Tema 3: Diseño modular, principios, patrones y refactoring

#### Paso 1 · Objetivo y preparación
Al finalizar vas a leer el puerto `DeliveryRepository` real de RutaFlow y a escribir un segundo adaptador que lo implemente sin tocar `confirmDelivery`. Prerrequisitos: Módulo 5 del track Cloud (o lectura directa del archivo).

#### Paso 2 · Contexto y caso real
`examples/rutaflow/node/confirm-delivery.ts` ya define `DeliveryRepository` como una interfaz (`findCommandResult`/`confirm`) — el mismo patrón `Protocol` + inyección de dependencias que acabás de ver en el ejemplo de `RepositorioProductos`, pero en código real de este proyecto, no un ejemplo inventado.

#### Paso 3 · Teoría, modelo mental y analogía
Baja cohesión significa que `confirmDelivery` conoce solo lo que necesita del repositorio (dos métodos), nunca cómo esos datos llegan a disco — el mismo principio de "el dominio no importa SQLite" aplicado a un archivo que ya existe.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/ejemplo.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

**Crea** el archivo `src/ejemplo.py` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

```bash
grep -n "interface DeliveryRepository" -A 3 examples/rutaflow/node/confirm-delivery.ts
```

**Ejecuta el ejemplo** (guarda el código en un archivo y córrelo desde la terminal):

```bash
python3 ejemplo.py
```
Observa la salida impresa y compárala con el resultado esperado.

Resultado esperado: ves `findCommandResult(commandId)` y `confirm(command)` — dos métodos, nada de SQL, DynamoDB ni HTTP en la firma. `confirmDelivery` solo conoce ese contrato.

#### Paso 5 · Práctica guiada
Pista: escribí un adaptador en memoria (`class RepositorioEnMemoria implements DeliveryRepository`) e inyectalo en `confirmDelivery` dos veces con el mismo `commandId` — en la segunda llamada, el fallo deliberado que buscás NO debería ocurrir: `findCommandResult` debe devolver el resultado ya guardado, y `confirmDelivery` nunca debe volver a llamar `confirm()`. Si tu adaptador en memoria vuelve a confirmar, el bug está en el adaptador, no en el dominio.

#### Paso 6 · Práctica independiente
Escribí una prueba caracterizadora sobre `confirmDelivery` usando tu adaptador en memoria del Paso 5: documentá el comportamiento actual (qué devuelve con PIN válido, con PIN de 4 dígitos, con `commandId` repetido) antes de proponer ningún cambio al código.

#### Paso 7 · Cierre y evidencia
Entregá la interfaz real leída del Paso 4, el adaptador en memoria probado del Paso 5, y la prueba caracterizadora del Paso 6; explicá por qué poder escribir ese segundo adaptador sin tocar `confirmDelivery` es la prueba de que el diseño real ya separó dominio de infraestructura. Errores comunes: introducir una interfaz antes de que exista una segunda implementación real, aplicar un patrón de diseño porque "es lo profesional" sin identificar el problema que resuelve, y refactorizar código heredado sin antes escribir una prueba caracterizadora. Fuentes oficiales: https://refactoring.com/catalog/.
**¿Por qué es importante?** Porque poder cambiar de un repositorio real a uno en memoria sin tocar una línea de `confirmDelivery` es la evidencia concreta de que el dominio no depende de cómo se guardan los datos, no solo una afirmación de buenas intenciones.
**Escenario:** Tienes `class RepositorioProductos` que usa SQLite. Alguien pide: "¿y si después queremos cambiar a PostgreSQL?" ¿Extraes una interfaz ahora o esperas?

**Tu tarea:**
1. Escribe la interfaz (`Protocol` en Python).
2. ¿Bajo qué condiciones es sobre-ingeniería?
3. ¿Cuándo es justificable?
4. ¿Cómo sabes si una interfaz se usa o es fantasma?

[SOLUCIÓN PLEGADA]
> Interfaz es sobre-ingeniería si: (1) no hay alternativa real en vista, (2) solo se usa en un lugar. Justificable si: (1) hay pruebas que necesitan fake/stub, (2) la alternativa es probable (múltiples proveedores, migraciones planeadas). Detectar fantasma: grep por implementaciones — una interfaz con solo una clase la implementa es candidata a eliminar. Regla práctica: introduce interfaz cuando aparece la SEGUNDA implementación, no antes.

**Evidencia de aprendizaje:** entrega modelo, ejemplo, fallo, corrección, comparación y conclusión.
**Conceptos clave:** cohesión, acoplamiento, encapsulación, abstracción, composición, SOLID, patrón, code smell, refactoring y prueba caracterizadora.

Alta cohesión significa que un módulo reúne responsabilidades relacionadas. Bajo acoplamiento significa que conoce poco de detalles externos. Encapsulación protege invariantes; abstracción presenta un contrato relevante y oculta detalles que pueden cambiar.

```python
from typing import Protocol

class RepositorioProductos(Protocol):
    def obtener_por_sku(self, sku: str): ...
    def guardar(self, producto): ...

class RetirarStock:
    def __init__(self, repositorio: RepositorioProductos):
        self.repositorio = repositorio

    def ejecutar(self, sku: str, cantidad: int):
        producto = self.repositorio.obtener_por_sku(sku)
        producto.retirar(cantidad)
        self.repositorio.guardar(producto)
```

El caso de uso depende de capacidad, no SQLite. Responsabilidad única no significa “una función por línea”; significa una razón coherente de cambio. Inversión de dependencias no obliga a interfaz para todo; se aplica en límites que necesitan sustitución, prueba o aislamiento.

Patrones nombran soluciones recurrentes con consecuencias: Strategy intercambia algoritmos; Adapter traduce interfaces; Repository separa acceso; Observer propaga eventos. No empieces eligiendo patrón: identifica problema, fuerzas y alternativas. Un patrón innecesario añade archivos, saltos y conceptos.

Refactoring cambia estructura preservando comportamiento. Antes de código heredado sin pruebas, escribe pruebas caracterizadoras que documenten lo que hace, incluso si no es ideal. Realiza pasos pequeños con suite verde: extraer función, mover responsabilidad, renombrar, introducir interfaz. Separar refactor y cambio funcional facilita revisión.

**Analogía:** principios son criterios de diseño; patrones son planos reutilizables. Usar un plano de aeropuerto para una casa demuestra conocimiento del patrón, no buen juicio.

**¿Por qué es importante?** Diseño modular localiza cambios y permite evolución. Sin pruebas, grandes refactors se convierten en reescrituras de riesgo.

**Casos de uso reales:** cambio de base, múltiples proveedores, reglas configurables, integraciones y sistemas legacy.

**Diagrama:**

```mermaid
flowchart LR
    SMELL["smell"] --> CHARACTERIZE["prueba caracterizadora"] --> REFACTOR["refactor pequeño"]
    REFACTOR --> GREEN["suite verde"] --> SMELL
```

**Transferencia al proyecto integrador «Fundamentos: gestor de tareas»:** Refactoriza el almacenamiento detrás de un contrato pequeño conservando las pruebas de uso. Sustituye el archivo por un fake y demuestra que crear y completar tareas mantienen su comportamiento.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
### Tema 4: Decisiones, documentación, deuda y evolución

#### Paso 1 · Objetivo y preparación
Al finalizar vas a escribir el ADR real que justifica por qué RutaFlow usa DynamoDB para `ShipmentEvents` en vez de una base relacional. Prerrequisitos: ninguno adicional (el Módulo 4 del track Cloud profundiza la decisión en sí).

#### Paso 2 · Contexto y caso real
Esa decisión ya está tomada en el código (`ShipmentEvents` con clave `shipmentId`+`sequence`), pero nadie documentó todavía el contexto y las consecuencias — exactamente lo que un ADR existe para registrar antes de que la próxima persona se pregunte "¿por qué no es SQL?".

#### Paso 3 · Teoría, modelo mental y analogía
Un ADR es la bitácora de navegación: no vende la decisión, registra el contexto que la motivó y qué consecuencias aceptaste a cambio — para que la próxima tripulación no la confunda con un accidente.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/ejemplo.py` dentro.
```bash
mkdir ejemplo && cd ejemplo
```

**Crea** el archivo `src/ejemplo.py` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

```markdown
# ADR-004: DynamoDB para ShipmentEvents

Estado: aceptada

### Contexto
El patrón de acceso dominante es "todos los eventos de este envío, en orden" — una
consulta por clave conocida, no joins complejos ni consultas ad hoc.

### Decisión
Usar DynamoDB con clave compuesta (shipmentId HASH, sequence RANGE).

### Consecuencias
Query eficiente por envío sin importar el volumen total de la tabla; a cambio,
ninguna consulta ad hoc nueva ("todos los envíos de este mes") es gratis sin un GSI
diseñado para ese patrón específico.
```

**Ejecuta el ejemplo** (guarda el código en un archivo y córrelo desde la terminal):

```bash
python3 ejemplo.py
```
Observa la salida impresa y compárala con el resultado esperado.

Resultado esperado: un documento completo con contexto, decisión y consecuencias — no solo "elegimos DynamoDB", sino por qué y qué se sacrificó a cambio.

#### Paso 5 · Práctica guiada
Pista: borrá la sección "Consecuencias" y dejá solo "Decisión: usar DynamoDB" — ese es el fallo deliberado: sin consecuencias documentadas, cualquiera que necesite una consulta ad hoc nueva en seis meses va a asumir que DynamoDB "simplemente no sirve para eso", en vez de entender que fue un trade-off consciente con una salida conocida (agregar un GSI, Módulo 4 Tema 5 del track Cloud).

#### Paso 6 · Práctica independiente
Documentá, como deuda técnica explícita (no como ADR), que `ShipmentEvents` no tiene todavía un GSI para "envíos por estado actual" — con su principal (el trabajo pendiente), su interés (qué cuesta no tenerlo hoy), y su condición de pago (qué señal dispararía construirlo).

#### Paso 7 · Cierre y evidencia
Entregá el ADR completo del Paso 4, la consecuencia faltante y su riesgo del Paso 5, y la deuda técnica documentada del Paso 6; explicá la diferencia entre un ADR (decisión ya tomada, con consecuencias) y una entrada de deuda técnica (trabajo pendiente, con condición de pago). Errores comunes: escribir un ADR que solo vende la decisión sin registrar las consecuencias negativas, llamar "deuda técnica" a cualquier código desprolijo sin principal ni condición de pago, y dejar una decisión importante sin documentar porque "ya se sabe por qué se hizo". Fuentes oficiales: https://adr.github.io/.
**¿Por qué es importante?** Porque sin el ADR-004 documentado, en seis meses alguien va a asumir que DynamoDB fue un error en vez de entender que fue un trade-off consciente con una salida ya conocida (un GSI).
**Escenario:** Tu equipo elige SQLite sobre PostgreSQL. Sin documentar. Pasó un año, alguien pregunta: "¿por qué SQLite y no Postgres?" Nadie recuerda las fuerzas.

**Tu tarea:**
1. ¿Cuándo escribir un ADR?
2. ¿Cuándo es overkill? (Pista: "usar `if` en vez de ternario".)
3. ¿Cuándo un ADR genera deuda técnica?
4. ¿Qué debe tener un ADR mínimo?

[SOLUCIÓN PLEGADA]
> ADR para decisiones "difíciles de cambiar" (BD, arquitectura, licencia, framework). No para detalles tácticos (variable naming, loop vs map). Genera deuda si usa recursos sin límite — un ADR por cada línea costaría más que desarrollar. Mínimo: (1) estado (aceptada/derogada), (2) contexto (restricciones, alternativas), (3) decisión (qué y por qué), (4) consecuencias (costos, riesgos, alternativa futura). Sin esto, es solo una nota.

**Evidencia de aprendizaje:** entrega modelo, ejemplo, fallo, corrección, comparación y conclusión.
**¿Por qué es importante?** El código cambia; registrar contexto, consecuencias y deuda permite evolucionarlo sin repetir decisiones ni romper contratos silenciosamente.

**Conceptos clave:** ADR, documentación viva, deuda técnica, mantenimiento correctivo/adaptativo/perfectivo/preventivo, compatibilidad, deprecación, migración y observabilidad.

Documentación profesional responde preguntas para una audiencia. README permite ejecutar; arquitectura explica estructura; runbook opera; ADR registra una decisión significativa y su contexto.

```markdown
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
# ADR-003: SQLite como persistencia inicial
Estado: aceptada

## Contexto
Una sola instancia, datos relacionales y operación local.

## Decisión
Usar SQLite con migraciones versionadas.

## Consecuencias
Transacciones simples y despliegue fácil; escritura concurrente limitada.
Revisar si aparece requisito multi-instancia.
```

Un ADR no vende la decisión; registra consecuencias y disparadores de revisión. Diagramas sin fecha/alcance se vuelven engañosos. Valida documentación en CI: enlaces, ejemplos, comandos.

Deuda técnica es una decisión que aumenta coste futuro, a veces consciente. Registra principal (trabajo pendiente), interés (coste recurrente), riesgo, propietario y condición de pago. No llames deuda a cualquier código desagradable ni úsala para justificar reescritura total.

Mantenimiento incluye corregir defectos, adaptarse a entornos, mejorar capacidad y prevenir degradación. Cambios públicos requieren compatibilidad: versionado, migración, periodo de deprecación, telemetría de uso y rollback. “Breaking change” sin plan transfiere coste a usuarios.

La ética atraviesa decisiones: accesibilidad, privacidad, sesgo, sostenibilidad y condiciones laborales. Un requisito legal es mínimo, no siempre el límite de responsabilidad.

**Analogía:** un ADR es la bitácora de navegación; la deuda es tomar una ruta más rápida con coste futuro conocido. Sin registro, la siguiente tripulación cree que fue accidente.

**¿Por qué es importante?** La mayor parte del coste ocurre después de la primera versión. Documentación y evolución responsable preservan conocimiento y confianza.

**Casos de uso reales:** migraciones, cambios API, actualización de frameworks, incidentes, onboarding y retiro de funciones.

**Diagrama:**

```mermaid
flowchart LR
    DEC["decisión"] --> ADR["ADR"] --> IMPL["implementación"] --> METRICS["métricas"]
    METRICS --> EVIDENCE2["nueva evidencia"] --> REVIEW["mantener o revisar"]
```

El proyecto integrador Fundamentos necesita exactamente este tipo de ADR para su propia decisión temprana: por qué `almacenamiento.py` guarda las tareas en un archivo JSON plano y no en SQLite desde el primer módulo. Documentá esa decisión en `docs/adr/0001-almacenamiento-json.md` con sus consecuencias (simple de inspeccionar a mano, pero sin escritura concurrente segura), y verificá con Python 3 (`python3 -m pytest tests/test_almacenamiento.py`) que el comportamiento documentado sigue siendo el real antes de dar por cerrado el ADR.

## Construcción guiada del capítulo

### Proyecto 7: rediseñar el inventario como producto mantenible

1. Crea `requirements/` con stakeholders, alcance, historias y criterios.
2. Define cinco atributos de calidad mediante escenarios medibles.
3. Dibuja C4 contexto, contenedores y componentes.
4. Crea ADRs para SQLite, arquitectura modular, autenticación y audit log.
5. Añade pruebas caracterizadoras al diseño actual.
6. Refactoriza hacia `domain/`, `application/`, `infrastructure/` y `interfaces/`.
7. Introduce puertos solo en límites justificados.
8. Ejecuta pruebas después de cada paso y separa commits de comportamiento/refactor.
9. Añade una fitness function que impida que dominio importe infraestructura.
10. Registra deuda con coste/riesgo y crea roadmap de tres entregas.
11. Diseña deprecación para cambiar el formato de exportación sin romper clientes.

**Verificación:** cada requisito enlaza prueba/evidencia; diagramas coinciden con código; ADRs incluyen consecuencias; dominio funciona sin SQLite; historia Git permite revisar pasos; deuda tiene criterio de pago.

**Errores comunes y soluciones**

- Requisitos vagos: añade escenario, medida y contexto.
- Diagramar clases antes de entender sistema: comienza en contexto.
- Aplicar todos los patrones: justifica fuerzas y coste.
- Refactor grande sin tests: caracteriza y divide.
- Documentar solo éxito: registra consecuencias y límites.
