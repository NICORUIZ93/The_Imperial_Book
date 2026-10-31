# Módulo 6: Seguridad, privacidad y modelado de amenazas


## Aprende construyendo

### Tema 1: Activos, amenazas, riesgos y límites de confianza

#### Paso 1 · Objetivo y preparación
Al finalizar vas a producir el primer artefacto de una auditoría de seguridad real: un registro de riesgos STRIDE para RutaFlow y un verificador de límites de confianza. El registro no es una lista de miedos: cada fila tendrá activo, escenario, impacto, probabilidad, control, efectividad, propietario y tratamiento, y el verificador rechazará el archivo si falta cualquiera de esos datos o si un flujo cruza una zona sin límite declarado.

Prerrequisitos: Python 3 y el Módulo 5. No necesitás herramientas externas, servicios en la nube ni conexión a internet: todo corre con la biblioteca estándar. Venías de `ALLOWED_TRANSITIONS` en `examples/rutaflow/foundation/domain.py`, una regla que rechaza transiciones inválidas; este tema explica qué amenaza concreta justifica esa regla y qué riesgo queda abierto después de aplicarla.

#### Paso 2 · Contexto y caso real
RutaFlow mueve envíos con un ciclo de estados: `CREATED → ASSIGNED → OUT_FOR_DELIVERY → DELIVERED`. El control `ALLOWED_TRANSITIONS` impide saltar de `CREATED` a `DELIVERED`, pero ningún documento vinculaba esa regla con un ataque concreto. Esa ausencia tiene consecuencias prácticas: cuando un operador presiona para "destrabar" un envío, no hay forma de explicar qué fraude permite la excepción ni quién acepta el riesgo.

El caso escala con tres hechos del mismo sistema. Un operador con acceso a la base puede marcar como entregado un envío que nunca salió a reparto. Un atacante que lee la cola de mensajes puede cambiar el PIN del destinatario y cobrar en su lugar. Un correo con el nombre visible "Soporte RutaFlow" puede convencer a un conductor de entregar su contraseña. Los tres son problemas distintos, con activos distintos y controles distintos. Tratarlos como "seguridad" en bloque impide priorizar.

Una auditoría de seguridad empieza por escribir qué se protege, de quién y con qué consecuencia. Sin ese acuerdo, cualquier control parece arbitrario y cualquier excepción parece razonable. El registro que vas a construir es el documento que convierte esa conversación en decisiones con dueño.

#### Paso 3 · Teoría, modelo mental y analogía

**Activos: lo que se protege.** Un activo es cualquier cosa cuyo daño importa: el estado de un envío, el PIN del destinatario, la sesión de un conductor, el historial de confirmaciones, la disponibilidad de la API, la reputación de la empresa. No todos valen lo mismo y no todos se protegen igual. La primera tarea es nombrarlos y asignarles un dueño, porque un activo sin dueño no tiene a quién exigirle una decisión.

| Activo | Qué pasa si se compromete | Dueño natural |
|---|---|---|
| Estado del envío | Entregas falsas, fraude, inventario inconsistente | Dominio |
| PIN del destinatario | Suplantación del receptor, robo de paquete | Plataforma |
| Sesión del conductor | Confirmaciones ajenas, repudio | Identidad |
| Historial de confirmaciones | Imposibilidad de atribuir acciones | Operaciones |
| Disponibilidad de la API | Reputación y pérdida operativa | Plataforma |
| Datos personales de clientes | Sanción legal y daño a personas | Datos |

**Actores: de quién se protege.** El error más común es modelar solo al atacante externo. Un modelo útil distingue al menos cuatro actores: el atacante externo que no tiene credenciales; el usuario autenticado que intenta actuar sobre recursos ajenos; el insider con privilegios legítimos que los usa mal; y la cadena de suministro, es decir, una dependencia o imagen comprometida que ejecuta código dentro del sistema. Cada actor cambia la probabilidad y el control razonable. Contra un insider, la detección y el registro importan más que el firewall; contra una dependencia, la fijación de versiones y el escaneo importan más que la contraseña.

**Límites de confianza: dónde cambia la confianza.** Un límite de confianza es una frontera donde los datos o las identidades dejan de ser confiables. En RutaFlow hay al menos cuatro: Internet hacia la DMZ, la DMZ hacia la aplicación, la aplicación hacia la base de datos y la aplicación hacia la cola. Cada cruce necesita un control explícito: TLS, autenticación de servicio, consultas parametrizadas o firma por mensaje. Si un flujo cruza dos zonas y no declara un límite, el modelo está incompleto aunque el sistema funcione.

```mermaid
flowchart LR
    U["usuario\\nInternet"] -->|"HTTPS"| A["API\\nDMZ"]
    O["operador\\nInternet"] -->|"HTTPS + MFA"| A
    A -->|"gRPC"| D["dominio\\nAplicación"]
    D -->|"SQL parametrizado"| B["base de datos\\nDatos"]
    D -->|"AMQP + HMAC"| Q["cola\\nAplicación"]
    A -. "límite Internet/DMZ" .-> U
    A -. "límite DMZ/Aplicación" .-> D
    D -. "límite Aplicación/Datos" .-> B
```

**STRIDE como checklist, no como veredicto.** STRIDE propone seis preguntas para no mirar siempre el mismo tipo de ataque:

| Letra | Amenaza | Ejemplo en RutaFlow | Control típico | Qué no resuelve |
|---|---|---|---|---|
| S | Spoofing | Token robado para confirmar entregas | Sesión con expiración y revocación | Robo del dispositivo |
| T | Tampering | Operador marca entregado sin salir a reparto | `ALLOWED_TRANSITIONS` y auditoría | Acceso directo a la base |
| R | Repudiation | Conductor niega haber confirmado | Audit log encadenado | Colusión con quien opera el log |
| I | Information disclosure | PIN visible en la cola o en logs | HMAC, TLS y redacción | Captura en el dispositivo |
| D | Denial of service | Ráfaga de confirmaciones falsas | Límite de tasa y colas | Ataque volumétrico en el borde |
| E | Elevation of privilege | Conductor entra al panel de operadores | Autorización por rol y recurso | Vulnerabilidad en una dependencia |

La tabla tiene una columna incómoda a propósito: ningún control cierra la amenaza por completo. Eso obliga a hablar de riesgo residual en vez de declarar "resuelto". Una amenaza sin control no es un olvido: es una decisión pendiente con dueño y fecha.

**Cómo se prioriza sin engañarse.** Este registro usa una escala ordinal de 1 a 5 para impacto y probabilidad, y calcula riesgo inherente = impacto × probabilidad. La cifra no es una medida física: es una forma de ordenar conversaciones. Para que no sea arbitraria, cada nivel necesita anclas acordadas. Por ejemplo, impacto 5 = fraude o pérdida de datos masiva; impacto 2 = disputa operativa acotada. Probabilidad 5 = ocurre varias veces por mes; probabilidad 1 = requiere condiciones improbables.

Después se aplica el control con una efectividad estimada entre 0 y 1. El riesgo residual es `riesgo × (1 − efectividad)`. Si un control tiene efectividad 0,6, queda el 40% del riesgo. Esa estimación es una hipótesis, no una promesa: se revisa cuando hay incidentes o pruebas. El error opuesto también existe: poner efectividad 1,0 y declarar el riesgo cerrado. Ningún control humano ni técnico es perfecto, y el registro debe reflejarlo.

Cada fila termina con un tratamiento explícito: mitigar (reducir), aceptar (asumir con dueño y fecha), transferir (seguro o contrato) o evitar (eliminar la actividad). "Ya lo veremos" no es un tratamiento. El riesgo residual aceptado debe quedar escrito, porque dentro de seis meses alguien preguntará por qué no se hizo nada.

**El proceso y sus límites.** Modelar amenazas es un ciclo: definir alcance, dibujar el flujo con zonas y límites, enumerar amenazas con STRIDE, priorizar con impacto y probabilidad, asignar control y dueño, y revisar cuando cambia la arquitectura. El resultado es un documento vivo, no una foto para la auditoría. STRIDE no descubre vulnerabilidades concretas por sí solo: te obliga a hacer preguntas. Una revisión de código, una prueba de penetración o un escaneo de dependencias responden otras preguntas y no se sustituyen entre sí.

**Analogía:** modelar amenazas es inspeccionar un edificio antes de comprar cerraduras. Primero identificás qué hay dentro, por dónde se entra y quién tiene llaves; recién después decidís qué puerta merece qué cerradura. Comprar la cerradura más cara para un depósito vacío es tan mala decisión como dejar abierta la puerta de la caja fuerte.

**¿Por qué es importante?** Porque un control sin amenaza asociada es indistinguible de una regla arbitraria, y una amenaza sin dueño es una frase que nadie ejecutará. El registro conecta ambos extremos y permite defender una decisión ante ingeniería, operaciones y dirección con el mismo documento.

**Límite de uso:** este registro ordena decisiones y expone supuestos; no demuestra que el sistema sea seguro, no reemplaza una prueba de penetración y no mide la calidad del código. Las escalas son ordinales: comparar "riesgo 15" con "riesgo 16" como si fueran magnitudes exactas es un abuso de la herramienta.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** crea una carpeta nueva y escribí dos archivos. No hace falta el repositorio completo ni una base de datos.

```bash
mkdir ejemplo && cd ejemplo
```

Crea `amenazas.json` con ocho amenazas que cubren las seis letras de STRIDE. Cada fila incluye el escenario concreto, no solo la categoría:

```json
[
  {"id": "S-01", "stride": "Spoofing", "activo": "sesión del conductor", "escenario": "robo de token para confirmar entregas ajenas", "impacto": 4, "probabilidad": 3, "control": "sesiones con expiración y revocación", "efectividad": 0.7, "propietario": "identidad", "tratamiento": "mitigar"},
  {"id": "T-01", "stride": "Tampering", "activo": "estado del envío", "escenario": "operador marca entregado un envío que nunca salió", "impacto": 5, "probabilidad": 3, "control": "ALLOWED_TRANSITIONS", "efectividad": 0.6, "propietario": "dominio", "tratamiento": "mitigar"},
  {"id": "R-01", "stride": "Repudiation", "activo": "historial de confirmaciones", "escenario": "conductor niega haber confirmado una entrega", "impacto": 2, "probabilidad": 4, "control": "audit log encadenado", "efectividad": 0.5, "propietario": "operaciones", "tratamiento": "mitigar"},
  {"id": "I-01", "stride": "Information disclosure", "activo": "PIN del destinatario", "escenario": "lectura del PIN en la cola o en logs", "impacto": 4, "probabilidad": 2, "control": "HMAC, TLS y redacción de logs", "efectividad": 0.75, "propietario": "plataforma", "tratamiento": "mitigar"},
  {"id": "D-01", "stride": "Denial of service", "activo": "API de confirmación", "escenario": "ráfaga de confirmaciones falsas agota el servicio", "impacto": 3, "probabilidad": 4, "control": "límite de tasa por conductor", "efectividad": 0.8, "propietario": "plataforma", "tratamiento": "mitigar"},
  {"id": "E-01", "stride": "Elevation of privilege", "activo": "panel de operadores", "escenario": "conductor accede a funciones de administración", "impacto": 5, "probabilidad": 2, "control": "autorización por rol y recurso", "efectividad": 0.8, "propietario": "identidad", "tratamiento": "mitigar"},
  {"id": "S-02", "stride": "Spoofing", "activo": "correo de soporte", "escenario": "correo con nombre visible de RutaFlow desde dominio parecido", "impacto": 4, "probabilidad": 5, "control": "DMARC y formación", "efectividad": 0.4, "propietario": "seguridad", "tratamiento": "mitigar"},
  {"id": "I-02", "stride": "Information disclosure", "activo": "exportación de clientes", "escenario": "log con teléfonos y direcciones completas", "impacto": 4, "probabilidad": 4, "control": "redacción y retención de 30 días", "efectividad": 0.6, "propietario": "datos", "tratamiento": "mitigar"}
]
```

Crea `riesgos.py`. Valida primero, calcula después y ordena al final: si se calcula antes de validar, un dato inválido produce una prioridad falsa en lugar de un error claro.

```python
import json
import sys
from pathlib import Path

STRIDE = {"Spoofing", "Tampering", "Repudiation", "Information disclosure", "Denial of service", "Elevation of privilege"}
TRATAMIENTOS = {"mitigar", "aceptar", "transferir", "evitar"}

amenazas = json.loads(Path("amenazas.json").read_text(encoding="utf-8"))
errores = []
for a in amenazas:
    if a["stride"] not in STRIDE:
        errores.append(f"{a['id']} STRIDE desconocido: {a['stride']}")
    for campo in ("impacto", "probabilidad"):
        if not 1 <= a[campo] <= 5:
            errores.append(f"{a['id']} {campo} fuera de rango (1-5): {a[campo]}")
    if not 0 <= a["efectividad"] <= 1:
        errores.append(f"{a['id']} efectividad fuera de rango (0-1): {a['efectividad']}")
    if not a.get("propietario"):
        errores.append(f"{a['id']} sin propietario")
    if a["tratamiento"] not in TRATAMIENTOS:
        errores.append(f"{a['id']} tratamiento inválido: {a['tratamiento']}")
if errores:
    sys.exit("fallo: " + "; ".join(errores))

for a in amenazas:
    a["riesgo"] = a["impacto"] * a["probabilidad"]
    a["residual"] = round(a["riesgo"] * (1 - a["efectividad"]))

amenazas.sort(key=lambda a: a["residual"], reverse=True)
print(f"amenazas: {len(amenazas)}")
for a in amenazas:
    print(f"{a['id']} {a['stride']}: riesgo {a['riesgo']} residual {a['residual']} — {a['tratamiento']} — {a['propietario']}")
print(f"prioridad: {amenazas[0]['id']} (residual {amenazas[0]['residual']})")
conteo = {}
for a in amenazas:
    conteo[a["stride"]] = conteo.get(a["stride"], 0) + 1
print("por STRIDE: " + ", ".join(f"{k}={v}" for k, v in sorted(conteo.items())))
```

**Ejecuta el ejemplo:**

```bash
python3 riesgos.py
```

Resultado esperado:

```text
amenazas: 8
S-02 Spoofing: riesgo 20 residual 12 — mitigar — seguridad
T-01 Tampering: riesgo 15 residual 6 — mitigar — dominio
I-02 Information disclosure: riesgo 16 residual 6 — mitigar — datos
S-01 Spoofing: riesgo 12 residual 4 — mitigar — identidad
R-01 Repudiation: riesgo 8 residual 4 — mitigar — operaciones
I-01 Information disclosure: riesgo 8 residual 2 — mitigar — plataforma
D-01 Denial of service: riesgo 12 residual 2 — mitigar — plataforma
E-01 Elevation of privilege: riesgo 10 residual 2 — mitigar — identidad
prioridad: S-02 (residual 12)
por STRIDE: Denial of service=1, Elevation of privilege=1, Information disclosure=2, Repudiation=1, Spoofing=2, Tampering=1
```

El script explica, línea por línea, dos decisiones. Primero valida el dominio antes de calcular: `impacto` y `probabilidad` deben estar entre 1 y 5, `efectividad` entre 0 y 1, y cada amenaza necesita propietario y tratamiento. Después calcula el residual y ordena por él, no por el riesgo inherente. Por eso `S-02` (riesgo 20, efectividad 0,4) queda primero con residual 12, mientras `T-01` (riesgo 15, efectividad 0,6) baja a 6: el control cambia la prioridad. `I-02` (riesgo 16) empata en 6 con `T-01`; el orden entre empates conserva el orden del archivo y no debe interpretarse como una diferencia real.

**Segunda demostración: ¿el diagrama declara sus límites?** Un registro de amenazas sin un mapa de flujos se vuelve una lista abstracta. Crea `flujos.json` con nodos, zonas y los controles de cada cruce:

```json
{
  "nodos": [
    {"id": "usuario", "zona": "internet"},
    {"id": "operador", "zona": "internet"},
    {"id": "api", "zona": "dmz"},
    {"id": "dominio", "zona": "aplicacion"},
    {"id": "cola", "zona": "aplicacion"},
    {"id": "db", "zona": "datos"}
  ],
  "flujos": [
    {"id": "F-01", "desde": "usuario", "hasta": "api", "protocolo": "HTTPS", "limite": "Internet/DMZ", "control": "TLS y autenticación"},
    {"id": "F-02", "desde": "operador", "hasta": "api", "protocolo": "HTTPS", "limite": "Internet/DMZ", "control": "TLS y MFA"},
    {"id": "F-03", "desde": "api", "hasta": "dominio", "protocolo": "gRPC", "limite": "DMZ/Aplicación", "control": "credencial de servicio"},
    {"id": "F-04", "desde": "dominio", "hasta": "db", "protocolo": "SQL", "limite": "Aplicación/Datos", "control": "consulta parametrizada"},
    {"id": "F-05", "desde": "dominio", "hasta": "cola", "protocolo": "AMQP", "limite": null, "control": "HMAC por mensaje"},
    {"id": "F-06", "desde": "api", "hasta": "cola", "protocolo": "AMQP", "limite": "DMZ/Aplicación", "control": "credencial de servicio"}
  ]
}
```

Crea `dfd.py` para comprobar que cada cruce de zona tenga un límite y que ningún flujo apunte a un nodo inexistente:

```python
import json
import sys
from pathlib import Path

ZONAS = {"internet", "dmz", "aplicacion", "datos"}
modelo = json.loads(Path("flujos.json").read_text(encoding="utf-8"))
zonas = {n["id"]: n["zona"] for n in modelo["nodos"]}

errores = []
for nodo in modelo["nodos"]:
    if nodo["zona"] not in ZONAS:
        errores.append(f"zona desconocida en {nodo['id']}: {nodo['zona']}")
for flujo in modelo["flujos"]:
    for extremo in (flujo["desde"], flujo["hasta"]):
        if extremo not in zonas:
            errores.append(f"{flujo['id']} referencia un nodo inexistente: {extremo}")
if errores:
    sys.exit("fallo: " + "; ".join(errores))

cruzando, sin_limite, limite_ocioso = 0, [], []
for f in modelo["flujos"]:
    origen, destino = zonas[f["desde"]], zonas[f["hasta"]]
    cruza = origen != destino
    cruzando += cruza
    if cruza and not f["limite"]:
        sin_limite.append(f"{f['id']} ({origen}->{destino})")
    if not cruza and f["limite"]:
        limite_ocioso.append(f["id"])
if sin_limite:
    sys.exit("fallo: flujos que cruzan zonas sin límite declarado: " + ", ".join(sin_limite))

print(f"flujos: {len(modelo['flujos'])}")
for f in modelo["flujos"]:
    print(f"{f['id']} {f['desde']} -> {f['hasta']} ({zonas[f['desde']]}->{zonas[f['hasta']]}) límite: {f['limite'] or 'ninguno'} — {f['control']}")
print(f"cruzando zonas: {cruzando}")
print(f"sin límite declarado: {len(sin_limite)}")
print(f"límites declarados sin cambio de zona: {len(limite_ocioso)}")
```

**Ejecuta el verificador:**

```bash
python3 dfd.py
```

Resultado esperado:

```text
flujos: 6
F-01 usuario -> api (internet->dmz) límite: Internet/DMZ — TLS y autenticación
F-02 operador -> api (internet->dmz) límite: Internet/DMZ — TLS y MFA
F-03 api -> dominio (dmz->aplicacion) límite: DMZ/Aplicación — credencial de servicio
F-04 dominio -> db (aplicacion->datos) límite: Aplicación/Datos — consulta parametrizada
F-05 dominio -> cola (aplicacion->aplicacion) límite: ninguno — HMAC por mensaje
F-06 api -> cola (dmz->aplicacion) límite: DMZ/Aplicación — credencial de servicio
cruzando zonas: 5
sin límite declarado: 0
límites declarados sin cambio de zona: 0
```

`F-05` no declara límite porque origen y destino están en la misma zona (`aplicacion`): el control HMAC protege el mensaje, pero no hay una frontera de confianza que cruzar. Los otros cinco flujos sí cruzan y cada uno declara su límite. El script distingue "no hay límite porque no hace falta" de "no hay límite porque falta declararlo", una diferencia que un diagrama dibujado a mano suele ocultar.

#### Paso 5 · Práctica guiada
Pista: cambiá `probabilidad` de `T-01` a `7` y ejecutá `python3 riesgos.py`; ese es el fallo deliberado: el programa termina con `fallo: T-01 probabilidad fuera de rango (1-5): 7` y código de salida 1. La escala ordinal pierde sentido si acepta valores fuera de rango: un 7 produce un riesgo 35 que domina el orden sin representar nada acordado.

Probá también borrar `propietario` de `R-01`: la salida es `fallo: R-01 sin propietario`. Los dos errores se acumulan en la misma lista, así que si dejás ambos aparece un mensaje con las dos fallas separadas por `;`. Restaurá el archivo antes de seguir.

#### Paso 6 · Práctica independiente
Ampliá la auditoría con dos amenazas que el registro actual no cubre y un nodo nuevo:

1. Agregá una amenaza de **insider** sobre el panel de operadores: un empleado con permisos legítimos exporta la lista de clientes. Asigná impacto, probabilidad, control, efectividad, dueño y tratamiento.
2. Agregá una amenaza de **cadena de suministro**: una dependencia comprometida lee variables de entorno del servicio. Pensá qué control es realista (fijar versiones, escanear imágenes, mínimo privilegio) y qué efectividad le asignarías.
3. Agregá el nodo `panel` en zona `dmz` y dos flujos: `operador → panel` y `panel → dominio`. Declará sus límites y controles.
4. Volvé a ejecutar `riesgos.py` y `dfd.py`.

Criterios de aceptación: el registro pasa las validaciones; las dos amenazas nuevas tienen escenario concreto y dueño; el orden cambia de forma explicable; `dfd.py` informa seis flujos o más sin límites faltantes. Escribí `decisiones.md` con una tabla de las tres amenazas de mayor residual y su tratamiento (mitigar, aceptar, transferir o evitar), incluyendo qué evidencia falta para confirmar la efectividad estimada.

Conectá el resultado con el proyecto integrador Fundamentos: `ALLOWED_TRANSITIONS` cubre la manipulación del estado, pero no cubre el repudio ni el acceso directo a la base. El registro debe decir eso explícitamente en vez de declarar el módulo "seguro".

#### Paso 7 · Cierre
Entregá el registro ordenado, el verificador de límites, el error controlado del Paso 5 y el registro ampliado del Paso 6. Explicá por qué `S-02` supera a `T-01` en prioridad y por qué el riesgo residual de `T-01` sigue siendo 6 aunque `ALLOWED_TRANSITIONS` esté implementado. **Errores comunes:** listar amenazas sin escenario concreto, asignar efectividad 1,0, olvidar actores internos y dibujar flujos sin declarar límites. **Autoevaluación:** ¿qué diferencia hay entre riesgo inherente y residual? (el residual es lo que queda tras el control); ¿por qué una amenaza sin dueño es deuda y no un dato? (nadie la controla ni acepta el residual); ¿qué flujo no necesita límite? (el que no cruza zonas). **Fuentes oficiales:** https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html y https://learn.microsoft.com/es-es/azure/security/develop/threat-modeling-tool-threats. Siguiente paso: separar autenticación de autorización y construir el registro de accesos del Tema 2.

### Tema 2: Identidad, contraseñas, sesiones y autorización

#### Paso 1 · Objetivo y preparación
Al finalizar vas a implementar y auditar el control de acceso de RutaFlow: registrar contraseñas sin guardarlas en claro, emitir sesiones que expiran y se revocan, autorizar una acción sobre un recurso concreto y dejar un rastro verificable de lo ocurrido. El entregable es un programa que demuestra los seis casos que importan —conductor asignado, conductor ajeno, anónimo, administrador, sesión vencida y sesión revocada— y un registro de auditoría encadenado que detecta si alguien alteró el historial.

Prerrequisitos: Python 3 y el Tema 1. No hace falta una base de datos ni un servidor: las sesiones viven en memoria y el audit log en un archivo de eventos. En producción usarías Argon2id, un almacén de sesiones compartido y un almacén de logs inmutable; aquí el objetivo es entender el mecanismo y sus fallas, no copiar una implementación de juguete.

#### Paso 2 · Contexto y caso real
RutaFlow asigna cada envío a un conductor. El conductor `c-891` tiene `RF-4471`; el conductor `c-999` tiene `RF-5000`. Una sesión válida solo demuestra que alguien inició sesión: no demuestra que el envío sea suyo. Si la confirmación comprueba únicamente que hay sesión, `c-999` puede confirmar `RF-4471` y el sistema lo registra como una entrega legítima. El destinatario nunca recibe su paquete y el fraude queda dentro de los datos normales.

El caso tiene una segunda capa. Supongamos que la empresa descubre 200 confirmaciones falsas y necesita revertirlas, probar quién las hizo y revocar el acceso sin afectar a los demás conductores. Sin un registro de auditoría con atribución, la investigación se detiene en "alguien confirmó". Sin revocación de sesiones, cambiar la contraseña no expulsa al atacante que ya tiene un token. Autenticación, autorización, sesión y auditoría son cuatro controles distintos que se apoyan entre sí; implementar uno solo deja el resto abierto.

#### Paso 3 · Teoría, modelo mental y analogía

**Autenticación y autorización son preguntas distintas.** La autenticación responde "¿quién eres?" y produce una identidad. La autorización responde "¿puedes ejecutar esta acción sobre este recurso?" y produce una decisión. La primera ocurre una vez por sesión; la segunda, en cada operación. Un error frecuente es resolver la segunda con la primera: "si está logueado, puede". Esa frase es falsa en cualquier sistema con más de un usuario.

| Pregunta | Control | Ejemplo en RutaFlow | Qué falla si se omite |
|---|---|---|---|
| ¿Quién eres? | Autenticación | Contraseña + sesión | Suplantación |
| ¿Qué rol tienes? | Autorización por rol | Solo `admin` exporta | Elevación de privilegio |
| ¿Este recurso es tuyo? | Autorización por objeto | `c-891` solo confirma `RF-4471` | IDOR y fraude |
| ¿Quién hizo qué? | Auditoría | Evento con actor y recurso | Repudio e investigación imposible |
| ¿Sigue activa tu sesión? | Ciclo de vida | Expiración y revocación | Acceso perpetuo tras un robo |

```mermaid
flowchart LR
    CRED["credencial"] --> LOGIN["login + derivación"]
    LOGIN -->|"válida"| SES["sesión con expiración"]
    LOGIN -->|"inválida"| DENY1["rechazo genérico + bloqueo"]
    SES -->|"acción"| ROL["rol permitido"]
    ROL -->|"sí"| OBJ["recurso asignado"]
    ROL -->|"no"| DENY2["403 por rol"]
    OBJ -->|"sí"| OK["permiso"]
    OBJ -->|"no"| DENY3["403 por objeto"]
    OK --> AUD["audit log encadenado"]
    DENY2 --> AUD
    DENY3 --> AUD
```

**Contraseñas: derivar, no guardar.** Una contraseña no se guarda en texto ni se cifra de forma reversible. Se deriva con una función lenta que incluye una sal aleatoria única por usuario. La sal impide tablas precalculadas y hace que dos personas con la misma contraseña produzcan hashes distintos. La lentitud encarece los intentos masivos: PBKDF2 con 600.000 iteraciones, Argon2id con memoria y paralelismo configurados, o bcrypt con un costo adecuado. SHA-256 solo es demasiado rápido y no sirve para contraseñas.

La comparación debe ser de tiempo constante (`hmac.compare_digest` o equivalente). Una comparación normal corta en el primer byte distinto y filtra, por el tiempo de respuesta, cuántos caracteres iniciales acertó el atacante. Los mensajes de error también filtran: si "usuario inexistente" y "contraseña incorrecta" producen respuestas distintas, el atacante enumera cuentas. El login de este tema usa un único mensaje genérico y un bloqueo temporal tras tres fallos, con el costo de que un atacante puede bloquear a un usuario legítimo; por eso el bloqueo se combina con límites por IP y monitoreo, no se aplica a ciegas.

Las políticas modernas recomiendan longitud mínima razonable, permitir frases largas, no exigir composición arbitraria y comprobar contraseñas filtradas. La derivación debe poder actualizarse: si mañana subís las iteraciones, la contraseña correcta se re-deriva con los parámetros nuevos en el próximo login. Un sistema que no puede migrar parámetros queda atado a la configuración de hace cinco años.

**Sesiones: emitir, expirar, revocar.** Una sesión es un identificador opaco que el cliente presenta en cada petición. El servidor lo asocia a un usuario y a una fecha de expiración. Un JWT firmado puede ser útil para sistemas distribuidos, pero no se revoca solo: si el token es válido hasta su expiración, cambiar la contraseña no lo invalida. La revocación exige estado del lado del servidor (una lista de sesiones activas o de tokens revocados. En una aplicación web, la cookie de sesión se marca `HttpOnly`, `Secure` y `SameSite`, y se rota al iniciar sesión para evitar fijación.

La expiración debe ser corta para sesiones sensibles y renovarse con actividad. La revocación debe ser inmediata cuando hay un incidente: el procedimiento del caso real no es "cambiar la contraseña y esperar", sino invalidar todas las sesiones del usuario y forzar un nuevo login. Un botón de "cerrar sesión en todos los dispositivos" es un control de seguridad, no una comodidad.

**Autorización por objeto: el control que más se olvida.** Los roles responden a "¿qué tipo de usuario eres?"; la autorización por objeto responde "¿este recurso específico te pertenece o está dentro de tu alcance?". El fallo clásico se llama IDOR (*Insecure Direct Object Reference*): la aplicación comprueba el rol pero no la pertenencia, y un conductor con rol válido confirma el envío de otro cambiando el identificador. La verificación debe ocurrir en el dominio o en el servidor, con denegación por defecto: si no hay una asignación explícita, se rechaza. Ocultar el botón en la interfaz reduce el error accidental, pero no impide llamar al endpoint directamente.

**Auditoría: atribuir sin filtrar.** Un audit log registra quién hizo qué, cuándo y sobre qué recurso. Sirve para investigar incidentes, demostrar cumplimiento y disuadir el abuso. No debe contener contraseñas, tokens ni datos personales innecesarios. La integridad importa: si un atacante puede editar el log, la atribución se pierde. Una cadena de hashes —cada evento incluye el hash del anterior— detecta alteraciones y borrados, aunque no es infalible: un atacante con control total puede recalcular toda la cadena. Por eso el hash final se ancla fuera del sistema (almacenamiento inmutable, publicación periódica o un servicio externo).

**Límites del modelo.** Este tema no cubre federación de identidad, OAuth/OIDC, MFA, recuperación de cuenta ni gestión de secretos de sesión a escala. Tampoco demuestra que el sistema sea seguro: una implementación correcta de estos controles puede convivir con una inyección SQL o un secreto expuesto, que son los temas siguientes.

**Analogía:** la autenticación es el carné que te deja entrar al edificio; la autorización por objeto es la llave de una oficina concreta. Mostrar el carné en la entrada no abre todas las puertas, y un registro de visitas que cualquiera puede editar no sirve para investigar quién entró.

**¿Por qué es importante?** Porque un fallo de autorización permite que una persona autenticada actúe sobre recursos ajenos con las credenciales correctas, y porque sin sesiones revocables ni auditoría, un incidente se detecta tarde y se investiga mal.

**Límite de uso:** el ejemplo usa PBKDF2 de la biblioteca estándar y sesiones en memoria para que sea reproducible sin dependencias; no es una recomendación de producción. Argon2id, un almacén de sesiones compartido y un log inmutable son decisiones de despliegue que este tema no resuelve.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** crea una carpeta nueva. El programa registra tres usuarios en memoria, inicia sesiones y prueba los casos de acceso.

```bash
mkdir ejemplo && cd ejemplo
```

Crea `acceso.py`:

```python
import hashlib
import hmac
import secrets
import time

ITERACIONES = 600_000
ASIGNACIONES = {"c-891": {"RF-4471", "RF-4472"}, "c-999": {"RF-5000"}}
USUARIOS = {}
SESIONES = {}
INTENTOS = {}
BLOQUEOS = {}


def registrar(usuario, password, rol):
    salt = secrets.token_bytes(16)
    USUARIOS[usuario] = {
        "rol": rol,
        "salt": salt,
        "hash": hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERACIONES),
    }


def login(usuario, password):
    ahora = time.time()
    if BLOQUEOS.get(usuario, 0) > ahora:
        raise PermissionError("cuenta bloqueada temporalmente")
    registro = USUARIOS.get(usuario)
    if registro is None:
        raise PermissionError("credenciales inválidas")
    calculado = hashlib.pbkdf2_hmac("sha256", password.encode(), registro["salt"], ITERACIONES)
    if not hmac.compare_digest(calculado, registro["hash"]):
        INTENTOS[usuario] = INTENTOS.get(usuario, 0) + 1
        if INTENTOS[usuario] >= 3:
            BLOQUEOS[usuario] = ahora + 30
            INTENTOS[usuario] = 0
            raise PermissionError("cuenta bloqueada temporalmente")
        raise PermissionError("credenciales inválidas")
    INTENTOS[usuario] = 0
    token = secrets.token_urlsafe(16)
    SESIONES[token] = {"usuario": usuario, "expira": ahora + 900}
    return token


def sesion_activa(token):
    sesion = SESIONES.get(token)
    if sesion is None:
        raise PermissionError("sesión inválida o revocada")
    if sesion["expira"] < time.time():
        SESIONES.pop(token)
        raise PermissionError("sesión vencida")
    return sesion["usuario"]


def confirmar(token, envio_id):
    usuario = sesion_activa(token)
    if USUARIOS[usuario]["rol"] != "conductor":
        raise PermissionError(f"rol {USUARIOS[usuario]['rol']} no puede confirmar entregas")
    if envio_id not in ASIGNACIONES.get(usuario, set()):
        raise PermissionError(f"{usuario} no está asignado a {envio_id}")
    return f"{usuario} confirmó {envio_id}"


def exportar(token):
    usuario = sesion_activa(token)
    if USUARIOS[usuario]["rol"] != "admin":
        raise PermissionError(f"rol {USUARIOS[usuario]['rol']} no autorizado a exportar")
    return sum(len(v) for v in ASIGNACIONES.values())


registrar("c-891", "pin-4471", "conductor")
registrar("c-999", "pin-5000", "conductor")
registrar("a-01", "clave-admin", "admin")
print(f"salts distintos: {USUARIOS['c-891']['salt'] != USUARIOS['c-999']['salt']}")

token_891 = login("c-891", "pin-4471")
token_999 = login("c-999", "pin-5000")
token_admin = login("a-01", "clave-admin")
print(confirmar(token_891, "RF-4471"))
try:
    print(f"otro conductor: {confirmar(token_999, 'RF-4471')}")
except PermissionError as error:
    print(f"otro conductor: denegado: {error}")
try:
    confirmar("token-inventado", "RF-4471")
except PermissionError as error:
    print(f"anónimo: denegado: {error}")
print(f"admin exporta: {exportar(token_admin)} envíos")
try:
    exportar(token_891)
except PermissionError as error:
    print(f"conductor exporta: denegado: {error}")
for _ in range(3):
    try:
        login("c-999", "incorrecta")
    except PermissionError:
        pass
try:
    login("c-999", "pin-5000")
except PermissionError as error:
    print(f"tras 3 fallos: {error}")
SESIONES[token_891]["expira"] = time.time() - 1
try:
    confirmar(token_891, "RF-4471")
except PermissionError as error:
    print(f"sesión vencida: denegado: {error}")
SESIONES.pop(token_admin)
try:
    exportar(token_admin)
except PermissionError as error:
    print(f"sesión revocada: denegado: {error}")
```

**Ejecuta el ejemplo:**

```bash
python3 acceso.py
```

Resultado esperado:

```text
salts distintos: True
c-891 confirmó RF-4471
otro conductor: denegado: c-999 no está asignado a RF-4471
anónimo: denegado: sesión inválida o revocada
admin exporta: 3 envíos
conductor exporta: denegado: rol conductor no autorizado a exportar
tras 3 fallos: cuenta bloqueada temporalmente
sesión vencida: denegado: sesión vencida
sesión revocada: denegado: sesión inválida o revocada
```

El programa explica, línea por línea, el orden correcto de las comprobaciones. `sesion_activa` valida existencia y expiración antes de mirar el recurso; `confirmar` verifica primero el rol y después la asignación concreta; `exportar` exige rol `admin`. La salida muestra los cuatro desenlaces: permitido, denegado por objeto, denegado por rol y denegado por sesión. El bloqueo tras tres fallos demuestra el control de abuso, y la manipulación explícita de `expira` permite observar la expiración sin esperar quince minutos.

**Segunda demostración: un audit log que detecta alteraciones.** Crea `eventos.py` con tres eventos encadenados. Cada evento incluye el hash del anterior; si alguien cambia una acción o borra un evento, la verificación falla en el punto exacto.

```python
import hashlib
import json

CERO = "0" * 64


def canonico(datos):
    return json.dumps(datos, sort_keys=True, separators=(",", ":")).encode()


def sello(evento):
    payload = {k: evento[k] for k in ("seq", "ts", "actor", "accion", "recurso", "prev")}
    return hashlib.sha256(canonico(payload)).hexdigest()


def encadenar(eventos):
    prev = CERO
    for evento in eventos:
        evento["prev"] = prev
        evento["hash"] = sello(evento)
        prev = evento["hash"]
    return eventos


def verificar(eventos):
    prev = CERO
    for evento in eventos:
        if evento["prev"] != prev:
            return False, f"corte en {evento['seq']}: prev no coincide"
        if evento["hash"] != sello(evento):
            return False, f"corte en {evento['seq']}: contenido alterado"
        prev = evento["hash"]
    return True, "sin cortes"


base = [
    {"seq": 1, "ts": "2026-10-30T10:00:00Z", "actor": "c-891", "accion": "confirmar", "recurso": "RF-4471"},
    {"seq": 2, "ts": "2026-10-30T10:01:10Z", "actor": "c-999", "accion": "intento_denegado", "recurso": "RF-4471"},
    {"seq": 3, "ts": "2026-10-30T10:02:30Z", "actor": "a-01", "accion": "exportar", "recurso": "clientes"},
]
eventos = encadenar([dict(e) for e in base])


def estado(eventos):
    valida, detalle = verificar(eventos)
    return f"válida={valida} ({detalle})"


print(f"eventos: {len(eventos)}")
print(f"cadena inicial: {estado(eventos)}")

alterados = [dict(e) for e in eventos]
alterados[1]["accion"] = "confirmar"
print(f"tras alterar el evento 2: {estado(alterados)}")

borrados = [dict(e) for e in eventos if e["seq"] != 2]
print(f"tras borrar el evento 2: {estado(borrados)}")

recompuestos = encadenar([dict(e) for e in alterados])
print(f"atacante que recalcula toda la cadena: {estado(recompuestos)}")
```

**Ejecuta el verificador:**

```bash
python3 eventos.py
```

Resultado esperado:

```text
eventos: 3
cadena inicial: válida=True (sin cortes)
tras alterar el evento 2: válida=False (corte en 2: contenido alterado)
tras borrar el evento 2: válida=False (corte en 3: prev no coincide)
atacante que recalcula toda la cadena: válida=True (sin cortes)
```

La última línea es la más importante y la que más se omite en las explicaciones. La cadena detecta ediciones y borrados accidentales o parciales, pero un atacante con control del archivo puede recalcular todos los hashes y producir una cadena válida. Por eso el hash final se ancla fuera del sistema: se publica en un almacén inmutable o se envía a un servicio externo. Sin anclaje, la cadena es evidencia útil contra errores y ataques oportunistas, no contra un adversario con control total.

#### Paso 5 · Práctica guiada
Pista: reemplazá el cuerpo de `confirmar` por una versión que solo compruebe la sesión y devuelva `f"{usuario} confirmó {envio_id}"`; ese es el fallo deliberado: la salida pasa a mostrar `otro conductor: c-999 confirmó RF-4471`. El programa sigue autenticando correctamente, los salts siguen siendo distintos y la sesión sigue siendo válida; lo único que falta es la autorización por objeto. Es el fallo más frecuente en APIs reales porque el login "funciona" y las pruebas felices no lo detectan.

Restaurá la verificación antes de continuar. Si querés ver el mismo fallo desde otro ángulo, cambiá la comprobación de rol por `if False:` en `exportar`: el conductor autenticado exporta la lista completa de asignaciones.

#### Paso 6 · Práctica independiente
Construí la matriz de pruebas que una revisión de acceso debería exigir, y agregá los eventos de auditoría correspondientes:

1. Ejecutá y registrá seis casos: conductor asignado (permitido), conductor ajeno (denegado por objeto), anónimo (denegado por sesión), administrador confirmando (denegado por rol), sesión vencida (denegada) y sesión revocada (denegada).
2. Agregá a `eventos.py` un evento por cada intento, incluidos los denegados. Verificá la cadena después de cada inserción.
3. Alterá un evento denegado para que diga `confirmar` y comprobá que la verificación falla. Explicá por qué el evento denegado también debe registrarse.
4. Simulá una actualización de parámetros: subí `ITERACIONES` a 700.000 y re-derivá el hash en el próximo login exitoso. Documentá por qué no se puede cambiar el parámetro sin guardar el nuevo hash.

Criterios de aceptación: la matriz cubre los seis casos con su salida; la cadena detecta la alteración; el evento denegado conserva actor, recurso y motivo; el cambio de parámetros no invalida a los usuarios existentes. Conectá el resultado con el proyecto integrador Fundamentos: en `tareas.py`, completar una tarea debe verificar que la tarea pertenece al usuario que la pide, no solo que el usuario inició sesión, y debe registrar el intento denegado.

#### Paso 7 · Cierre
Entregá la salida del control de acceso, la cadena de auditoría con sus dos fallos detectados, el fallo de autorización por objeto y la matriz ampliada. Explicá por qué la autenticación correcta no impide el fraude de `c-999`, por qué la cadena no protege contra un atacante que la recalcula y por qué el evento denegado también se audita. **Errores comunes:** comparar contraseñas con `==`, usar SHA-256 para contraseñas, devolver mensajes distintos para usuario inexistente y contraseña incorrecta, confiar en el rol sin comprobar el recurso, y guardar tokens en `localStorage` sin expiración ni revocación. **Autoevaluación:** ¿qué control impide que `c-999` confirme `RF-4471`? (la autorización por objeto, no la autenticación); ¿qué hace revocable una sesión? (estado del lado del servidor); ¿qué falta para que la cadena de hashes sea evidencia frente a un atacante con control total? (anclar el hash final fuera del sistema). **Fuentes oficiales:** https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html y https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html. Siguiente paso: proteger el comando en tránsito y gestionar claves y secretos en el Tema 3.

### Tema 3: Criptografía aplicada, TLS, claves y secretos

#### Paso 1 · Objetivo y preparación
Al finalizar vas a proteger el comando de confirmación de RutaFlow con una firma HMAC que detecte manipulación y replay, a verificar de verdad el certificado TLS de un servidor local —incluido el nombre de host— y a comprobar por qué borrar un secreto del árbol de trabajo no lo borra del historial de Git. Los tres artefactos son ejecutables y sus salidas quedan registradas.

Prerrequisitos: Python 3, OpenSSL y Git. El secreto se lee de una variable de entorno y nunca se escribe en el código. No necesitás internet: la autoridad certificadora y el servidor TLS se generan en tu carpeta de trabajo.

#### Paso 2 · Contexto y caso real
El comando `{"shipmentId": "RF-4471", "recipientPin": "837201"}` viaja por una cola antes de llegar a quien confirma la entrega. Si alguien con acceso a la cola cambia el PIN, el receptor pierde el paquete y nadie detecta el cambio. TLS protege el tramo de red, pero no autentica el contenido cuando el mensaje se almacena, se reenvía o se lee desde otro servicio.

El mismo sistema tiene dos problemas más. Un atacante que captura un comando válido puede reenviarlo tal cual: la firma sigue siendo correcta y la entrega se ejecuta dos veces. Y una credencial de AWS pegada en `config.env` puede llegar al repositorio; borrar el archivo en un commit posterior no la elimina del historial, de los clones ni de las cachés de CI. Firma, TLS y gestión de secretos responden a tres preguntas distintas: ¿el mensaje es auténtico?, ¿hablo con el servidor correcto?, ¿dónde viven las claves y quién puede usarlas?

#### Paso 3 · Teoría, modelo mental y analogía

**Cuatro primitivas, cuatro propiedades.** Un hash detecta cambios accidentales, pero no autentica origen: cualquiera puede recalcularlo. Un MAC (HMAC es su construcción más común) usa un secreto compartido y produce integridad más autenticidad entre las partes que lo conocen. Una firma digital usa clave privada y se verifica con la pública; permite que un tercero compruebe sin recibir la clave. El cifrado autenticado (AEAD, por ejemplo AES-GCM o ChaCha20-Poly1305) protege confidencialidad e integridad a la vez.

| Primitiva | Protege | Clave | Sirve para | No sirve para |
|---|---|---|---|---|
| SHA-256 | Integridad accidental | Ninguna | Huellas, deduplicación | Autenticar origen |
| HMAC-SHA256 | Integridad + autenticidad | Compartida | Firmar mensajes entre servicios | Que un tercero verifique sin el secreto |
| Firma asimétrica | Integridad + autenticidad + no repudio | Privada/pública | Documentos, artefactos, TLS | Mensajes de alto volumen con clave compartida simple |
| AES-GCM | Confidencialidad + integridad | Compartida | Datos en reposo o en tránsito | Reemplazar una firma entre partes |

```mermaid
flowchart LR
    MSG["comando + timestamp + nonce"] --> CAN["JSON canónico"]
    CAN --> MAC["HMAC-SHA256 con kid"]
    MAC --> SOBRE["sobre firmado"]
    SOBRE --> VER["verificar firma"]
    VER -->|"válida"| VENT["ventana de 300 s"]
    VENT -->|"vigente"| NONCE["nonce no visto"]
    NONCE -->|"nuevo"| OK["aceptar"]
    VER -->|"inválida"| REJ["rechazar"]
    VENT -->|"vieja"| REJ
    NONCE -->|"repetido"| REJ
    TLS["TLS: CA + nombre de host"] -.->|"protege el tramo"| SOBRE
    SEC["llavero con rotación"] -.->|"entrega la clave del kid"| MAC
```

Base64 no cifra: solo codifica. SHA-256 solo no sirve para contraseñas porque es demasiado rápido. Guardar la clave junto al dato cifrado anula la protección. Estas confusions son la causa de la mayoría de los "cifrados caseros" que fallan en producción.

**HMAC y canonicalización.** HMAC combina el mensaje con un secreto mediante una construcción que resiste ataques de extensión. Para que emisor y receptor calculen lo mismo, el mensaje debe serializarse de forma canónica: mismas claves, mismo orden, mismos separadores, misma codificación. Si un lado envía `{"a":1,"b":2}` y el otro firma `{"b":2,"a":1}`, la información es la misma pero la firma no. En JSON se fija `sort_keys=True` y `separators=(",", ":")`; en otros formatos se usa una serialización determinista acordada.

La comparación se hace con `hmac.compare_digest`, que no corta en el primer byte distinto. Una comparación normal filtra por tiempo cuántos bytes iniciales coinciden y facilita reconstruir la firma byte a byte.

**Replay: la firma no alcanza.** Un mensaje firmado sigue siendo válido si se reenvía. La defensa combina una marca de tiempo dentro de una ventana aceptable (por ejemplo, cinco minutos) y un identificador único (`nonce`) que el receptor recuerde durante esa ventana. El orden importa: primero se verifica la firma, después la ventana y el nonce; si se consulta el nonce antes de validar la firma, un mensaje falso puede "envenenar" la caché y bloquear el mensaje legítimo. El `nonce` se agrega a la caché solo cuando todas las comprobaciones pasan.

**Rotación con identificador de clave.** Cada sobre incluye un `kid` (identificador de clave). El receptor mantiene un llavero con la clave actual y la anterior durante un período de solapamiento. Así se rota sin invalidar los mensajes en vuelo. Un `kid` desconocido se rechaza; una clave retirada deja de aceptar mensajes nuevos, pero los ya firmados dentro de la ventana siguen siendo verificables si la clave se conserva el tiempo necesario. Rotar no es cambiar el secreto y esperar que todo falle: es un procedimiento con dos claves activas y una fecha de retiro.

**TLS: confianza en el servidor, no en el mensaje.** En el handshake, el cliente verifica que el certificado del servidor esté firmado por una autoridad en la que confía, que no esté vencido y que el nombre del certificado coincida con el host al que se conecta. Sin esa verificación, un atacante en la red puede presentar su propio certificado y leer o modificar el tráfico. Desactivar la validación "para que funcione en desarrollo" entrena al equipo a aceptar un fallo que en producción es crítico. El *pinning* (fijar el certificado o la clave pública) reduce el riesgo de una CA comprometida, pero complica la rotación y puede romper la aplicación si se hace mal; no es una decisión por defecto.

TLS protege el tramo, no el reposo ni el reenvío. Un mensaje almacenado en una cola puede leerse si la cola no cifra en reposo, y puede reenviarse si no tiene nonce. Por eso la firma del mensaje y TLS son capas complementarias, no alternativas.

**Secretos: ciclo de vida, no un archivo.** Un secreto nace, se almacena, se usa, se rota y se revoca. En desarrollo puede vivir en un `.env` ignorado; en CI, en variables cifradas; en producción, en un gestor de secretos con identidad de carga de trabajo (IAM role, service account) en vez de credenciales estáticas. El código lee del entorno o del gestor, nunca de una constante. El `.env.example` documenta nombres sin valores. La rotación se automatiza y se audita; la revocación debe ser posible sin redesplegar.

Si un secreto entra en Git, el orden correcto es: revocarlo y rotarlo primero, limpiar el historial después y asumir que ya fue copiado. Borrar el archivo en el último commit no lo elimina de los commits anteriores, de los clones ni de los forks. Un escaneo de secretos en CI y en el historial detecta el problema antes de que se convierta en incidente.

**Límites.** HMAC no da no repudio: ambas partes comparten el secreto y cualquiera pudo firmar. TLS no garantiza que el servidor sea honesto, solo que es quien dice ser. Una firma correcta no corrige una autorización ausente ni un secreto expuesto. La criptografía aplicada es una capa dentro de un sistema; no lo reemplaza.

**Analogía:** el HMAC es un sello de lacre con una marca secreta: si alguien abre el sobre y cambia una letra, el sello ya no coincide. TLS es verificar el documento de identidad del mensajero antes de recibir el paquete; el sello prueba que el contenido no cambió, el documento prueba que hablás con quien creés.

**¿Por qué es importante?** Porque una firma con la clave correcta distingue un comando auténtico de uno falsificado y de uno reenviado, y porque la mayoría de las filtraciones de credenciales empieza con un secreto en el lugar equivocado, no con un algoritmo roto.

**Límite de uso:** un HMAC con secreto compartido no permite que un tercero verifique sin conocer el secreto; para auditoría externa o no repudio se necesita una firma asimétrica. Y este tema no cubre HSM, KMS ni la operación de una PKI completa.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** crea una carpeta nueva y escribí el comando y el firmador. El secreto se pasa por variable de entorno.

```bash
mkdir ejemplo && cd ejemplo
```

Crea `comando.json` con una marca de tiempo y un nonce:

```json
{
  "shipmentId": "RF-4471",
  "recipientPin": "837201",
  "timestamp": 1793414990,
  "nonce": "n-7f3a"
}
```

Crea `firma.py`. El reloj se fija en `AHORA` para que la práctica sea reproducible; en producción se usa `time.time()`.

```python
import hashlib
import hmac
import json
import os
import sys
from pathlib import Path

SECRETOS = {"k-2026-10": os.environ.get("SECRETO_ACTUAL", ""), "k-2026-09": "clave-anterior-de-laboratorio"}
VENTANA = 300
AHORA = 1793415000

if not SECRETOS["k-2026-10"]:
    sys.exit("fallo: falta SECRETO_ACTUAL en el entorno")


def canonico(datos):
    return json.dumps(datos, sort_keys=True, separators=(",", ":")).encode()


def firmar(comando, kid):
    return hmac.new(SECRETOS[kid].encode(), canonico(comando), hashlib.sha256).hexdigest()


def verificar(sobre, vistos, ahora=AHORA):
    comando = sobre["comando"]
    if sobre["kid"] not in SECRETOS:
        return False, f"kid desconocido: {sobre['kid']}"
    if not hmac.compare_digest(sobre["firma"], firmar(comando, sobre["kid"])):
        return False, "firma inválida"
    if abs(ahora - comando["timestamp"]) > VENTANA:
        return False, "timestamp fuera de ventana"
    if comando["nonce"] in vistos:
        return False, "nonce ya utilizado"
    vistos.add(comando["nonce"])
    return True, "aceptado"


def resultado(par):
    return f"{par[0]} — {par[1]}"


comando = json.loads(Path("comando.json").read_text(encoding="utf-8"))
sobre = {"comando": comando, "kid": "k-2026-10", "firma": firmar(comando, "k-2026-10")}
vistos = set()
print(f"kid: {sobre['kid']}")
print(f"comando canónico: {canonico(comando).decode()}")
print(f"válido: {resultado(verificar(sobre, vistos))}")

alterado = {"comando": {**comando, "recipientPin": "999999"}, "kid": sobre["kid"], "firma": sobre["firma"]}
print(f"PIN alterado: {resultado(verificar(alterado, vistos))}")

repetido = {"comando": dict(comando), "kid": sobre["kid"], "firma": sobre["firma"]}
print(f"replay del mismo nonce: {resultado(verificar(repetido, vistos))}")

viejo = {"comando": {**comando, "timestamp": comando["timestamp"] - 3600, "nonce": "n-viejo"}, "kid": sobre["kid"]}
viejo["firma"] = firmar(viejo["comando"], sobre["kid"])
print(f"timestamp viejo: {resultado(verificar(viejo, vistos))}")

ajeno = {"comando": {**comando, "nonce": "n-ajeno"}, "kid": "k-2025-01", "firma": "0" * 64}
print(f"kid desconocido: {resultado(verificar(ajeno, vistos))}")
```

**Ejecuta el ejemplo:**

```bash
export SECRETO_ACTUAL='clave-actual-de-laboratorio'
python3 firma.py
```

Resultado esperado:

```text
kid: k-2026-10
comando canónico: {"nonce":"n-7f3a","recipientPin":"837201","shipmentId":"RF-4471","timestamp":1793414990}
válido: True — aceptado
PIN alterado: False — firma inválida
replay del mismo nonce: False — nonce ya utilizado
timestamp viejo: False — timestamp fuera de ventana
kid desconocido: False — kid desconocido: k-2025-01
```

El código explica, línea por línea, el orden de las defensas. Primero se comprueba que el `kid` exista; después se recalcula la firma y se compara en tiempo constante; recién entonces se mira la ventana temporal y el nonce. Si el PIN cambia, la firma no coincide. Si el mismo sobre se reenvía, el nonce ya está en `vistos`. Si el mensaje es viejo, la ventana lo rechaza. Un `kid` retirado se rechaza aunque la firma sea sintácticamente válida.

**Segunda demostración: TLS con una CA local.** Generá una autoridad certificadora, un certificado para `localhost` y un servidor que solo acepta conexiones verificadas:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout ca.key -out ca.crt -days 1 -subj "/CN=RutaFlow Lab CA"
openssl req -newkey rsa:2048 -nodes -keyout server.key -out server.csr -subj "/CN=localhost"
printf "subjectAltName=DNS:localhost\n" > ext.cnf
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt -days 1 -extfile ext.cnf
```

Crea `tls_demo.py`:

```python
import socket
import ssl
import threading

contexto_servidor = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
contexto_servidor.load_cert_chain("server.crt", "server.key")
servidor = socket.socket()
servidor.bind(("127.0.0.1", 0))
servidor.listen(3)
puerto = servidor.getsockname()[1]


def atender():
    for _ in range(3):
        conexion, _ = servidor.accept()
        try:
            with contexto_servidor.wrap_socket(conexion, server_side=True) as tls:
                tls.recv(64)
                tls.sendall(b"ok")
        except ssl.SSLError:
            conexion.close()
    servidor.close()


threading.Thread(target=atender, daemon=True).start()


def probar(host, cafile):
    contexto = ssl.create_default_context(cafile=cafile) if cafile else ssl.create_default_context()
    try:
        with socket.create_connection((host, puerto)) as crudo:
            with contexto.wrap_socket(crudo, server_hostname=host) as tls:
                tls.sendall(b"hola")
                return f"ok: {tls.recv(16).decode()}"
    except ssl.SSLCertVerificationError as error:
        return f"rechazado: {error.verify_message}"


print(f"localhost con la CA: {probar('localhost', 'ca.crt')}")
print(f"127.0.0.1 con la CA: {probar('127.0.0.1', 'ca.crt')}")
print(f"localhost sin la CA: {probar('localhost', None)}")
```

**Ejecuta el ejemplo:**

```bash
python3 tls_demo.py
```

Resultado esperado:

```text
localhost con la CA: ok: ok
127.0.0.1 con la CA: rechazado: IP address mismatch, certificate is not valid for '127.0.0.1'.
localhost sin la CA: rechazado: unable to get local issuer certificate
```

Las tres líneas separan dos verificaciones que suelen confundirse. La primera pasa porque el certificado está firmado por la CA que el cliente declara confiar y el nombre `localhost` coincide con el SAN. La segunda falla aunque la CA sea correcta: el certificado es para `localhost`, no para `127.0.0.1`; conectarse por IP sin un SAN de IP es un error de nombre. La tercera falla porque el cliente no conoce la CA: el certificado es válido, pero no hay cadena de confianza. En producción, la CA es pública y el cliente trae su almacén; el modo de fallo es el mismo.

**Tercera demostración: el secreto que sobrevive al borrado.** Crea un repositorio de prueba con una credencial y un escáner:

```bash
mkdir repo && cd repo
git init -q
git config user.email lab@rutaflow.local
git config user.name "Laboratorio"
printf 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE\nDB_PASSWORD="produccion-123"\n' > config.env
git add config.env
git commit -qm "config inicial"
cd ..
```

Crea `escanear.py`, que busca patrones en el árbol y en el historial:

```python
import re
import subprocess
import sys
from pathlib import Path

PATRONES = [
    ("credencial AWS", re.compile(r"AKIA[0-9A-Z]{16}")),
    ("contraseña asignada", re.compile(r"(?i)(password|passwd|db_password)\s*=\s*['\"]?[^\s'\"]{8,}")),
]
RAIZ = Path(sys.argv[1] if len(sys.argv) > 1 else "repo")


def en_arbol():
    hallazgos = []
    for archivo in RAIZ.rglob("*"):
        if not archivo.is_file() or ".git" in archivo.parts:
            continue
        texto = archivo.read_text(encoding="utf-8", errors="ignore")
        for nombre, patron in PATRONES:
            if patron.search(texto):
                hallazgos.append(f"{archivo.relative_to(RAIZ)}: {nombre}")
    return hallazgos


def en_historial():
    salida = subprocess.run(
        ["git", "-C", str(RAIZ), "log", "-p", "--all", "--format=commit %s"],
        capture_output=True, text=True, check=True,
    ).stdout
    asunto, archivo = "?", "?"
    vistos, hallazgos = set(), []
    for linea in salida.splitlines():
        if linea.startswith("commit "):
            asunto = linea[len("commit "):]
        elif linea.startswith("+++ b/"):
            archivo = linea[len("+++ b/"):]
        elif linea.startswith("+") and not linea.startswith("+++"):
            for nombre, patron in PATRONES:
                if patron.search(linea) and (asunto, archivo, nombre) not in vistos:
                    vistos.add((asunto, archivo, nombre))
                    hallazgos.append(f"{asunto} — {archivo}: {nombre}")
    return hallazgos


arbol = en_arbol()
print(f"árbol de trabajo: {len(arbol)} hallazgos")
for h in arbol:
    print(f"  {h}")
historial = en_historial()
print(f"historial: {len(historial)} hallazgos")
for h in historial:
    print(f"  {h}")
```

Ejecutá el escáner, después borrá el archivo, agregalo a `.gitignore`, hacé un commit y volvé a escanear:

```bash
python3 escanear.py repo
cd repo && rm config.env && printf 'config.env\n' > .gitignore && git add -A && git commit -qm "elimina credenciales del árbol"
cd .. && python3 escanear.py repo
```

Resultado esperado (primera ejecución):

```text
árbol de trabajo: 2 hallazgos
  config.env: credencial AWS
  config.env: contraseña asignada
historial: 2 hallazgos
  config inicial — config.env: credencial AWS
  config inicial — config.env: contraseña asignada
```

Resultado esperado (después del borrado):

```text
árbol de trabajo: 0 hallazgos
historial: 2 hallazgos
  config inicial — config.env: credencial AWS
  config inicial — config.env: contraseña asignada
```

El árbol quedó limpio; el historial no. El commit de borrado no elimina el contenido del commit anterior, y cualquier clon conserva ambos. La respuesta correcta no es "ya borré el archivo": es revocar y rotar la credencial, y después limpiar el historial con una herramienta dedicada, asumiendo que el secreto pudo haber sido copiado.

#### Paso 5 · Práctica guiada
Pista: reemplazá `firmar` por `hashlib.sha256(canonico(comando)).hexdigest()` sin secreto, y firmá el comando alterado con esa misma función; ese es el fallo deliberado: la verificación acepta el mensaje manipulado. El script `firma_simple.py` lo demuestra con `True`:

```text
firma original: 1badc8cb45578d9b…
con hash simple, el PIN alterado y refirmado pasa: True
```

Cualquiera que intercepte el comando puede recalcular el hash después de cambiar el PIN, porque no hay secreto que impida hacerlo. La firma no aporta autenticidad: solo detecta cambios accidentales.

#### Paso 6 · Práctica independiente
Diseñá y ejecutá una rotación de claves sin cortar el servicio:

1. Agregá `k-2026-11` al llavero y firmá un comando nuevo con esa clave. Verificá que el receptor lo acepte.
2. Mientras ambas claves estén activas, verificá un comando firmado con `k-2026-10` dentro de la ventana. Documentá cuánto dura el solapamiento y cuándo se retira la clave vieja.
3. Retirá `k-2026-09` del llavero y comprobá que un sobre con ese `kid` se rechaza con `kid desconocido`.
4. Persistí los nonces en un archivo o base en vez de un `set` en memoria. Explicá qué pasa si el receptor se reinicia y el nonce se pierde.
5. Agregá `python3 escanear.py repo` a un job de CI y hacelo fallar si `arbol` o `historial` tienen hallazgos. Conectá la práctica con el proyecto integrador Fundamentos: su CLI no debe leer secretos de `cli.py` ni de un archivo versionado, y cualquier comando remoto debe llevar firma y nonce.

Criterios de aceptación: la rotación acepta ambas claves durante el solapamiento; la clave retirada se rechaza; el reinicio no permite reutilizar un nonce; el escáner falla el pipeline ante un secreto en el árbol o en el historial. Documentá en `secretos.md` el ciclo de vida completo: creación, almacenamiento, uso, rotación, revocación y respuesta a una filtración.

#### Paso 7 · Cierre
Entregá la firma válida con sus cuatro rechazos, la verificación TLS con nombre de host y CA, el secreto que sobrevive al borrado y el plan de rotación. Explicá por qué el orden de verificación (firma, ventana, nonce) importa, por qué TLS no reemplaza la firma del mensaje y por qué rotar es distinto de borrar. **Errores comunes:** guardar la clave junto al dato, desactivar la verificación de TLS para "que funcione", confundir Base64 con cifrado, reutilizar el mismo nonce, y creer que borrar un archivo del último commit elimina el secreto. **Autoevaluación:** ¿qué detecta un HMAC que un hash simple no detecta? (autenticidad: exige el secreto); ¿qué dos comprobaciones hace TLS además de cifrar? (cadena de confianza y nombre de host); ¿cuál es el primer paso ante un secreto filtrado? (revocar y rotar, no borrar). **Fuentes oficiales:** https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html y https://www.rfc-editor.org/rfc/rfc2104. Siguiente paso: validar entradas, neutralizar inyección y definir la respuesta a incidentes en el Tema 4.

### Tema 4: Validación, vulnerabilidades web, privacidad y respuesta

#### Paso 1 · Objetivo y preparación
Al finalizar vas a endurecer el campo de nota que un conductor escribe al entregar un envío: validar su dominio al guardar, impedir que una consulta concatenada se convierta en inyección SQL, codificar la salida según el contexto donde se muestra y redactar datos personales antes de escribirlos en un log. Cerrás con el runbook de respuesta que convierte estos controles en un procedimiento cuando algo falla.

Prerrequisitos: Python 3 y el Tema 3. Todo corre con SQLite en memoria y la biblioteca estándar; no hace falta un servidor web ni un navegador. El objetivo es entender el mecanismo de cada falla y su defensa, no memorizar una lista de payloads.

#### Paso 2 · Contexto y caso real
La nota "dejado con el portero" la escribe un tercero y se muestra en el panel del cliente. Esa nota es entrada no confiable por definición: puede ser vacía, larguísima, contener etiquetas HTML o intentar cerrar una consulta SQL. Si se concatena en una consulta, cambia la estructura del SQL; si se inserta como HTML, se interpreta como marcado; si se guarda entera en un log, filtra el teléfono y la dirección del destinatario.

El caso real combina tres incidentes del mismo campo. Un conductor escribe `x' OR '1'='1` y el panel muestra notas de otros clientes. Otro escribe `<img src=x onerror=...>` y el navegador de un operador ejecuta código. Un tercero revisa los logs y encuentra direcciones completas de cien clientes. Tres fallas distintas, tres defensas distintas: validar al entrar, parametrizar al consultar, codificar al salir y minimizar lo que se registra.

#### Paso 3 · Teoría, modelo mental y analogía

**Validar decide qué entra; codificar decide cómo se interpreta al salir.** Son capas independientes y ninguna sustituye a la otra. La validación comprueba que el dato cumple el dominio del negocio: tipo, longitud, formato, rango y reglas. La codificación transforma el dato para el contexto donde se va a interpretar: texto HTML, valor de atributo, cadena de JavaScript, parámetro de URL. Un dato válido para el dominio puede seguir siendo peligroso si se inserta en el contexto equivocado; un dato escapado para HTML no sirve como cadena de JavaScript.

| Contexto | Qué hay que neutralizar | Herramienta correcta | Error típico |
|---|---|---|---|
| Texto HTML | `<`, `>`, `&` | `html.escape` | Insertar con `innerHTML` |
| Atributo HTML | Comillas y etiquetas | `html.escape(quote=True)` | Concatenar sin comillas |
| Cadena JavaScript | Comillas, saltos, `</script>` | `json.dumps` | `html.escape` "porque ya escapa" |
| Parámetro URL | `&`, `=`, espacios, `#` | `urllib.parse.quote` | Concatenar la URL |
| Consulta SQL | Estructura de la consulta | Consulta parametrizada | Escapar comillas a mano |

**Validación por lista blanca.** La lista negra de caracteres falla porque el conjunto de entradas peligrosas depende del contexto y del parser. La lista blanca define lo permitido: longitud entre 1 y 200 caracteres, sin etiquetas, sin caracteres de control, con un formato concreto. Si el campo no cumple, se rechaza con un motivo claro y el dato no entra. La validación de dominio no reemplaza la codificación de salida ni la parametrización: reduce la superficie, pero un dato válido puede contener `'` legítimamente (por ejemplo, "O'Connor") y debe seguir tratándose como dato.

La normalización importa: Unicode permite representar la misma letra de varias formas, y un filtro que compara texto sin normalizar puede dejar pasar variantes. Para notas de texto libre, la decisión pragmática es no interpretar el contenido como código en ningún contexto; para campos estructurados (email, teléfono, código postal), conviene normalizar y validar con una regla explícita.

**Inyección SQL: el dato no debe convertirse en estructura.** Una consulta es un programa: `SELECT ... WHERE texto = '...'` tiene una estructura fija y un hueco para el valor. Si el valor se concatena, el motor lo analiza como parte del programa y el atacante puede cerrar la cadena, agregar una condición o un `UNION`. La consulta parametrizada envía el texto de la consulta y los valores por canales separados: el motor compila la estructura antes de conocer los datos y trata el valor como dato, no como código. No hace falta escapar comillas a mano; de hecho, hacerlo suele introducir errores.

La defensa se complementa con mínimo privilegio en la base: el usuario de la aplicación no debería poder borrar tablas ni leer esquemas que no usa. Un WAF puede reducir ruido, pero no corrige una consulta concatenada; un ORM mal usado (concatenando en `raw`) tampoco. La prueba de aceptación es negativa: un payload conocido debe devolver cero filas, no las filas de la tabla.

**XSS: la salida depende del contexto.** El XSS ocurre cuando un dato no confiable se interpreta como código en el navegador. Hay tres variantes: reflejado (el servidor devuelve el dato en la respuesta), almacenado (el dato queda en la base y se muestra a otros) y DOM (el propio JavaScript del cliente inserta el dato en un sumidero peligroso como `innerHTML`). La defensa principal es codificar en el contexto correcto y usar APIs seguras (`textContent` en vez de `innerHTML`). Una política CSP restrictiva reduce el impacto de un error de codificación, pero no lo corrige.

La codificación HTML no sirve para JavaScript: dentro de `<script>`, el navegador no decodifica entidades HTML como `&quot;`, así que el dato se corrompe o, si se usó escape sin comillas, rompe la cadena y ejecuta. Para insertar datos en JavaScript se serializa con `json.dumps` (o el equivalente del framework). Para atributos, se escapan comillas; para URL, se codifica con `quote`. El detalle importa porque el mismo payload se comporta distinto en cada contexto.

**Otras vulnerabilidades que comparten la misma raíz.** CSRF abusa de la sesión del usuario para ejecutar una acción sin su intención; se mitiga con tokens anti-CSRF y cookies `SameSite`. SSRF hace que el servidor pida una URL interna en nombre del atacante; se mitiga con listas blancas de destinos y bloqueo de rangos privados. La deserialización de datos no confiables puede ejecutar código; se evita con formatos de datos simples y validación estricta. La subida de archivos requiere validar tipo real, tamaño, nombre y almacenamiento fuera del servidor web. El open redirect permite usar tu dominio para enviar a otro sitio; se valida contra una lista de destinos permitidos. Ninguna de estas fallas se corrige solo validando la entrada: cada una requiere su control específico.

**Privacidad: minimizar, retener y poder borrar.** La privacidad no es solo cifrar: es decidir qué datos se recogen, para qué, cuánto tiempo se conservan y quién puede verlos. El principio de minimización dice que no se guarda lo que no se necesita. La retención define una fecha de borrado y un procedimiento. Los logs son un punto ciego clásico: se registra la petición completa "para depurar" y terminan con teléfonos, emails y direcciones. La redacción con expresiones regulares reduce el riesgo, pero no es anonimización: un dato redactado puede reidentificarse combinando campos. Para datos personales sensibles, la decisión correcta suele ser no registrarlos.

**Respuesta a incidentes: un procedimiento, no una reacción.** Un incidente se gestiona en fases: detectar (alerta, reporte, anomalía), contener (aislar el servicio, revocar credenciales, bloquear la cuenta), preservar evidencia (logs, imágenes, copias antes de reiniciar), erradicar (corregir la causa, no solo el síntoma), recuperar (restaurar con verificación) y aprender (postmortem sin culpa, acciones con dueño y fecha). La comunicación con usuarios, clientes y autoridades tiene plazos legales según el tipo de dato y la jurisdicción; no se improvisa. Un runbook escrito y probado en un simulacro vale más que una lista de deseos.

El recorrido completo del dato muestra dónde actúa cada control:

```mermaid
flowchart TD
    IN["nota del conductor<br/>entrada no confiable"] --> VAL{"validar dominio<br/>1-200, sin etiquetas"}
    VAL -->|"válida"| DB["consulta parametrizada<br/>estructura != dato"]
    VAL -->|"inválida"| REJ["rechazar con motivo"]
    DB --> OUT{"codificar según contexto"}
    OUT --> H["texto HTML<br/>html.escape"]
    OUT --> A["atributo<br/>quote=True"]
    OUT --> J["JavaScript<br/>json.dumps"]
    OUT --> U["URL<br/>urllib.parse.quote"]
    DB --> LOG["log"]
    LOG --> RED["redactar PII<br/>+ retención"]
    REJ -.-> RB["runbook de incidente<br/>si algo falló"]
    RED -.-> RB
```

**Límites.** Validar y escapar no corrigen una autorización ausente ni un secreto expuesto; son controles de entrada y salida. La codificación correcta no protege si el framework inserta el dato por otra vía. La redacción de logs no sustituye la minimización. Y ningún control individual convierte el sistema en "seguro": la defensa en profundidad asume que una capa fallará.

**Analogía:** la validación es el control de paquetes en la entrada; la codificación es la etiqueta que impide que el contenido se lea como instrucción; la privacidad decide qué paquetes debían llegar; y el runbook es el protocolo de la fábrica cuando suena la alarma, para que nadie improvise mientras el problema crece.

**¿Por qué es importante?** Porque una nota inocua mostrada con `innerHTML`, concatenada en SQL o registrada completa en un log convierte un campo de texto en una vía de ejecución, acceso o filtración, y porque sin un runbook el incidente se contiene tarde y se investiga mal.

**Límite de uso:** los ejemplos usan SQLite y HTML generado a mano para aislar los mecanismos; no cubren todos los contextos de un framework real ni sustituyen una revisión de seguridad profesional. La redacción con expresiones regulares es una demostración, no una política de privacidad completa.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** crea una carpeta nueva y escribí cuatro archivos pequeños. Cada uno aísla una defensa.

```bash
mkdir ejemplo && cd ejemplo
```

Crea `validar.py`, que aplica una lista blanca al dominio del campo:

```python
def validar(nota):
    if not nota.strip():
        return "vacía"
    if len(nota) > 200:
        return "supera 200 caracteres"
    if "<" in nota or ">" in nota:
        return "contiene etiquetas"
    return None


casos = [
    "dejado con el portero",
    "<img src=x onerror=alert(1)>",
    "a" * 201,
    "   ",
]
for nota in casos:
    error = validar(nota)
    etiqueta = nota if len(nota) <= 30 else nota[:27] + "..."
    print(f"{etiqueta!r}: {'válida' if error is None else 'rechazada — ' + error}")
```

**Ejecuta el validador:**

```bash
python3 validar.py
```

Resultado esperado:

```text
'dejado con el portero': válida
'<img src=x onerror=alert(1)>': rechazada — contiene etiquetas
'aaaaaaaaaaaaaaaaaaaaaaaaaaa...': rechazada — supera 200 caracteres
'   ': rechazada — vacía
```

La validación rechaza por dominio, no por una lista negra de payloads: vacío, longitud y etiquetas. Un texto legítimo con apóstrofo, como "O'Connor", pasa la validación y debe seguir tratándose como dato en la consulta y en la salida; la validación no reemplaza esas capas.

**Inyección SQL: misma consulta, dos formas.** Crea `inyeccion.py`:

```python
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE notas (id INTEGER PRIMARY KEY, texto TEXT)")
db.executemany("INSERT INTO notas (texto) VALUES (?)", [("dejado con el portero",), ("entregado en recepción",)])

payloads = [
    "dejado' OR '1'='1",
    "x' UNION SELECT 99, 'dato filtrado' --",
]
for payload in payloads:
    parametrizada = db.execute("SELECT id, texto FROM notas WHERE texto = ?", (payload,)).fetchall()
    concatenada = db.execute(f"SELECT id, texto FROM notas WHERE texto = '{payload}'").fetchall()
    print(f"payload: {payload}")
    print(f"  parametrizada: {len(parametrizada)} filas")
    print(f"  concatenada:   {len(concatenada)} filas -> {concatenada}")
```

**Ejecuta el ejemplo:**

```bash
python3 inyeccion.py
```

Resultado esperado:

```text
payload: dejado' OR '1'='1
  parametrizada: 0 filas
  concatenada:   2 filas -> [(1, 'dejado con el portero'), (2, 'entregado en recepción')]
payload: x' UNION SELECT 99, 'dato filtrado' --
  parametrizada: 0 filas
  concatenada:   1 filas -> [(99, 'dato filtrado')]
```

La consulta parametrizada devuelve cero filas en ambos casos porque busca un texto que no existe; la concatenada devuelve toda la tabla en el primer payload y una fila inventada en el segundo. El `UNION` demuestra que el atacante no solo lee lo que ya estaba: puede fabricar filas con datos arbitrarios. La parametrización no "escapa comillas": separa estructura y datos.

**XSS: el mismo dato en cuatro contextos.** Crea `salida.py`:

```python
import html
import json
from urllib.parse import quote

texto = '</script><script>alert("x")</script>'
js = '"; alert(1); //'
atributo = '" onmouseover="alert(1)'
url = 'a&b=1'

print(f"HTML texto: {html.escape(texto)}")
print(f"atributo sin comillas: <div title=\"{atributo}\">")
print(f"atributo con quote=True: <div title=\"{html.escape(atributo, quote=True)}\">")
print(f"JS con escape sin comillas: <script>const nota = \"{html.escape(js, quote=False)}\";</script>")
print(f"JS con json.dumps: <script>const nota = {json.dumps(js)};</script>")
print(f"URL con quote: q={quote(url, safe='')}")
```

**Ejecuta el ejemplo:**

```bash
python3 salida.py
```

Resultado esperado:

```text
HTML texto: &lt;/script&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;
atributo sin comillas: <div title="" onmouseover="alert(1)">
atributo con quote=True: <div title="&quot; onmouseover=&quot;alert(1)">
JS con escape sin comillas: <script>const nota = ""; alert(1); //";</script>
JS con json.dumps: <script>const nota = "\"; alert(1); //";</script>
URL con quote: q=a%26b%3D1
```

Cada línea muestra un contexto distinto. `html.escape` sirve para texto HTML. En un atributo, sin `quote=True` el payload cierra el valor y agrega `onmouseover`; con `quote=True` queda dentro del valor. En JavaScript, el escape HTML sin comillas deja la cadena rota y el navegador ejecuta `alert(1)`; `json.dumps` produce una cadena válida con la comilla escapada. En una URL, `quote` convierte `&` y `=` para que no se interpreten como separadores. No existe un "escape universal": existe el escape correcto para cada contexto.

**Privacidad: redactar y retener.** Crea `privacidad.py`:

```python
import re
from datetime import date

linea = "2026-10-30 c-891 pidió confirmar RF-4471 tel +34 600 123 456 email ana@example.com direccion Calle Mayor 12"
redactada = re.sub(r"[\w.+-]+@[\w.-]+\.\w+", "[EMAIL]", linea)
redactada = re.sub(r"\+\d{1,3}(?: \d{3}){3}", "[TEL]", redactada)
redactada = re.sub(r"Calle [A-Za-zÁÉÍÓÚÑñ ]+\d+", "[DIRECCION]", redactada)
print(f"original:  {linea}")
print(f"redactada: {redactada}")

eventos = [date(2026, 9, 1), date(2026, 10, 1), date(2026, 10, 29)]
corte = date(2026, 10, 31)
retenidos = [e for e in eventos if (corte - e).days <= 30]
print(f"eventos: {len(eventos)} retenidos: {len(retenidos)} eliminados: {len(eventos) - len(retenidos)}")
```

**Ejecuta el ejemplo:**

```bash
python3 privacidad.py
```

Resultado esperado:

```text
original:  2026-10-30 c-891 pidió confirmar RF-4471 tel +34 600 123 456 email ana@example.com direccion Calle Mayor 12
redactada: 2026-10-30 c-891 pidió confirmar RF-4471 tel [TEL] email [EMAIL] direccion [DIRECCION]
eventos: 3 retenidos: 2 eliminados: 1
```

La redacción reduce la exposición, pero no es anonimización: el identificador `c-891`, la fecha y el número de envío pueden reidentificar a la persona si se combinan con otros registros. La decisión de privacidad más fuerte es no registrar el teléfono, el email ni la dirección en primer lugar; la redacción es la red de seguridad, no la política. La retención elimina el evento de septiembre porque supera los 30 días.

#### Paso 5 · Práctica guiada
Pista: escribí `x' OR '1'='1` como nota, omití la validación y reemplazá la consulta parametrizada por una concatenada; ese es el fallo deliberado. Con `validar_fallo.py` la salida es:

```text
nota: x' OR '1'='1
filas concatenadas: 2 -> [(1, 'dejado con el portero'), (2, 'entregado en recepción')]
```

La nota no "hackeó" la base: el programa armó una consulta distinta de la que el desarrollador imaginó. La validación por sí sola tampoco habría sido suficiente si el campo permitiera apóstrofos legítimos; la defensa que corrige la estructura es la parametrización. Restaurá ambas capas antes de continuar.

#### Paso 6 · Práctica independiente
Convertí estos controles en una prueba de aceptación y un procedimiento:

1. Agregá a `validar.py` dos casos más: una nota con apóstrofo legítimo ("O'Connor dejó el paquete") y una con caracteres de control. Decidí cuáles deben pasar y documentá el motivo.
2. Ampliá `inyeccion.py` con un tercer payload que intente `UNION SELECT` sobre otra tabla y comprobá que la parametrizada sigue devolviendo cero filas.
3. Agregá a `salida.py` un contexto de atributo sin comillas y uno con comillas; explicá cuál es seguro y por qué.
4. Escribí `runbook-incidente.md` con las seis fases (detectar, contener, preservar evidencia, erradicar, recuperar, aprender), un responsable por fase, los datos que se preservan antes de reiniciar y el criterio para declarar el incidente cerrado.
5. Conectá la práctica con el proyecto integrador Fundamentos: `cli.py` debe rechazar descripciones vacías o demasiado largas en la lógica, guardarlas con consultas parametrizadas y no escribirlas completas en el log.

Criterios de aceptación: los payloads devuelven cero filas en la versión parametrizada; el apóstrofo legítimo pasa la validación pero se guarda como dato; el atributo con `quote=True` no se rompe; el runbook tiene responsables y evidencia preservada; el log no contiene teléfono, email ni dirección completos.

#### Paso 7 · Cierre
Entregá las cuatro salidas, la inyección que devuelve dos filas y el runbook con sus seis fases. Explicá por qué validar no es lo mismo que escapar, por qué la parametrización corrige la estructura y por qué la redacción no es anonimización. **Errores comunes:** concatenar entrada en SQL, usar `innerHTML` con datos de terceros, escapar HTML para una cadena JavaScript, validar solo en el navegador, registrar la petición completa y creer que un WAF corrige una consulta mal armada. **Autoevaluación:** ¿qué capa impide el `UNION`? (la consulta parametrizada); ¿qué herramienta corresponde a una cadena JavaScript? (`json.dumps`, no `html.escape`); ¿qué fase del incidente preserva evidencia antes de reiniciar? (contención y preservación, antes de erradicar). **Fuentes oficiales:** https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html y https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html. Siguiente paso: reconocer ingeniería social y phishing, y cerrar la auditoría del módulo en el Tema 5.

### Tema 5: Ingeniería social, phishing y respuesta: analizar el correo, no solo mirarlo

#### Paso 1 · Objetivo y preparación
Al finalizar vas a analizar un correo sospechoso con código: comparar el remitente visible con las cabeceras reales, detectar enlaces cuyo destino no coincide con el texto, distinguir un dominio parecido de uno legítimo por su dominio registrable, interpretar el resultado de SPF, DKIM y DMARC y medir el efecto de una campaña de concienciación sin inventar conclusiones con muestras pequeñas. Cerrás el módulo uniendo estas piezas en la auditoría de seguridad de RutaFlow.

Prerrequisitos: Python 3 y los Temas 2 y 4. Todo usa la biblioteca estándar (`email`, `urllib.parse`, `ipaddress`, `csv`); no necesitás conectividad ni un buzón real. Los correos del ejemplo son sintéticos y están escritos en el propio archivo: el objetivo es entender el mecanismo del engaño y de su detección, no acusar a un remitente real.

#### Paso 2 · Contexto y caso real
Un mensajero de RutaFlow recibió un correo de "soporte" que le pedía verificar su cuenta en 24 horas y entregó su contraseña. El correo tenía el logo correcto, el nombre visible decía "Soporte RutaFlow" y el enlace parecía `rutaflow.co`. Al revisarlo después del incidente, el equipo encontró tres discrepancias que nadie miró: la dirección real terminaba en otro dominio, el `Return-Path` apuntaba a un servidor de envío masivo y el enlace usaba `rutaflow.co@rutaf1ow.co`, donde lo que está antes de la arroba es información de usuario y el destino real es lo que está después.

El mismo patrón se repite: la ingeniería social no rompe un cifrado, convence a una persona. Por eso la defensa tiene dos mitades que se refuerzan. La primera es técnica: autenticación del correo y filtros que comparan cabeceras. La segunda es humana: formación que enseña a verificar el destino antes de hacer clic y un canal simple para reportar. Ninguna de las dos funciona sola: un filtro perfecto no cubre el mensaje que llega por otra vía, y una persona formada no puede compensar un dominio que suplantó a la perfección el nombre visible.

#### Paso 3 · Teoría, modelo mental y analogía

**Qué es ingeniería social y por qué el correo es su medio preferido.** La ingeniería social manipula a una persona para que entregue información, instale algo o autorice una acción. El phishing la aplica a distancia con un mensaje que suplanta a alguien conocido. Funciona porque explota atajos mentales legítimos: confianza en una marca, respeto por una figura de autoridad, miedo a perder acceso y prisa. El atacante no necesita que el engaño sea perfecto; necesita que la urgencia impida verificar.

**Las tres capas de identidad de un correo.** Un correo tiene una identidad visible y varias identidades técnicas, y casi todo el phishing vive en la distancia entre ellas:

| Capa | Dónde se ve | Qué puede falsificar el atacante | Cómo se verifica |
|---|---|---|---|
| Nombre visible | Cliente de correo | Casi siempre: es texto libre | No sirve como prueba de identidad |
| Dirección `From` | Cabecera `From` | El dominio solo si no hay DMARC | Comparar con el dominio registrable esperado |
| `Return-Path` / `Reply-To` | Cabeceras | Pueden diferir del `From` | Divergencia es una señal, no una condena |
| Autenticación | `Authentication-Results` | Solo el servidor receptor la escribe | SPF, DKIM y DMARC con alineación |

**SPF, DKIM y DMARC no son sinónimos.** SPF declara qué servidores pueden enviar correo en nombre de un dominio; el receptor comprueba la IP del emisor contra esa lista. DKIM firma criptográficamente partes del mensaje con una clave publicada en DNS, de modo que un cambio en el cuerpo o en cabeceras firmadas invalida la firma. DMARC une ambos y añade una instrucción de política: qué hacer cuando el `From` no está alineado con SPF o DKIM. La palabra clave es **alineación**: un mensaje puede pasar SPF porque lo envió un proveedor legítimo de marketing, y aun así fallar DMARC porque el dominio del `From` no coincide con el que SPF autenticó. Una política `p=reject` ordena rechazar; `p=quarantine`, marcar como sospechoso; `p=none`, solo observar. Un dominio sin DMARC deja abierta la suplantación del `From`, y por eso "el remitente es legítimo" no es una conclusión que se pueda sacar del nombre visible.

**Dominio, subdominio y dominio registrable.** La comparación correcta no es "¿contiene la palabra rutaflow?", sino "¿el dominio registrable está en la lista blanca?". `pagos.rutaflow.co` y `rutaflow.co` comparten el dominio registrable `rutaflow.co`; `rutaflow.co.evil.example` tiene registrable `evil.example` aunque empiece igual, y `rutaflow-soporte.example` también. Calcular el registrable tomando las dos últimas etiquetas es una aproximación: hay sufijos públicos de varias etiquetas (`co.uk`, `com.ar`) donde esa regla falla, y para producción se usa una lista de sufijos públicos. En este tema la aproximación alcanza para mostrar la diferencia entre "contiene" y "pertenece".

**Los trucos de la URL, uno por uno.** Una URL no se lee de izquierda a derecha como un texto: tiene partes con significado distinto. `https://rutaflow.co@rutaf1ow.co/login` tiene `rutaflow.co` como *userinfo* y `rutaf1ow.co` como host real; el navegador va al segundo. `https://pagos.rutaflow.co.evil.example` es un subdominio de `evil.example`, no de RutaFlow. `https://xn--rutflow-4fg.co` es la forma ASCII de un dominio con una letra cirílica que se ve idéntica a la latina; el registro DNS acepta la forma `xn--` y el navegador muestra la versión Unicode. `http://45.12.3.9/login` evita el nombre de dominio por completo. Y el texto visible del enlace es independiente del `href`: puede decir `rutaflow.co` y llevar a cualquier sitio.

**La urgencia como señal y como generador de falsos positivos.** Palabras como "urgente", "suspendida", "24 horas" o "verifique" aparecen en phishing, pero también en avisos legítimos de facturación o seguridad. Una regla que marca todo lo urgente produce falsos positivos y, con el tiempo, enseña a la gente a ignorar las alertas. La urgencia sirve como una señal más, que sube la prioridad de revisar el resto, no como veredicto. Lo mismo vale para las heurísticas de distancia de edición: toleran typosquatting y a la vez marcan dominios legítimos parecidos. Toda heurística necesita medirse.

**Qué se mide en una campaña de concienciación.** Simular un phishing con autorización escrita sirve para saber cuántas personas hacen clic, cuántas reportan y cuántas llegan a introducir credenciales. Esas tasas se calculan sobre enviados, no sobre "correos abiertos" ni impresiones. Con muestras pequeñas, un solo clic mueve varios puntos porcentuales, así que la comparación entre grupos solo tiene sentido con denominadores explícitos y un tamaño suficiente; si no, se está midiendo ruido. La simulación se diseña para formar, no para castigar: se avisa al comité, se excluyen cuentas críticas, se acuerda qué datos se registran y cómo se da retroalimentación sin señalar a nadie.

**Respuesta cuando alguien ya hizo clic.** El runbook es el mismo del Tema 4, aplicado a una credencial comprometida: detectar (reporte del usuario o alerta de acceso anómalo), contener (revocar sesiones y restablecer la contraseña, no solo cambiarla), preservar evidencia (cabeceras del correo, hora del clic, registros de acceso), erradicar (revisar reglas de reenvío y métodos de recuperación que el atacante pudo añadir), recuperar (verificar que la cuenta no conserva persistencia) y aprender (actualizar el filtro y la formación). La contención empieza por las sesiones, porque una contraseña nueva no expulsa a quien ya tiene un token válido.

**Analogía:** el nombre visible es la tarjeta de presentación que cualquiera puede imprimir; el `From` es el remitente del sobre; SPF/DKIM/DMARC son el sello y la firma del servicio postal; y el dominio registrable es la dirección real de la casa, no el letrero de la fachada.

**¿Por qué es importante?** Porque la mayoría de las intrusiones empieza con una persona engañada y porque casi todas las señales del engaño están en datos que el cliente de correo no muestra por defecto: la dirección real, la ruta de retorno, el destino del enlace y el resultado de autenticación.

**Límite de uso:** este tema enseña a analizar correos y a interpretar cabeceras; no configura un servidor de correo ni reemplaza una pasarela antiphishing. Las cabeceras del ejemplo son sintéticas: en un caso real se verifican contra el buzón y el servidor, no contra una captura de pantalla. Y ninguna prueba de phishing se hace sin autorización escrita y sin un plan de retroalimentación.

```mermaid
flowchart TD
    C["correo recibido"] --> ID["identidad visible<br/>nombre y From"]
    ID --> AUTH{"¿SPF, DKIM y DMARC<br/>alineados?"}
    AUTH -->|"dmarc=pass"| OK["entregar"]
    AUTH -->|"dmarc=fail"| POL{"política DMARC"}
    POL -->|"p=reject"| REJ["rechazar"]
    POL -->|"p=quarantine"| Q["cuarentena"]
    POL -->|"p=none"| WARN["entregar con aviso"]
    C --> URL["enlaces"]
    URL --> REG{"¿dominio registrable<br/>en lista blanca?"}
    REG -->|"no"| ALERT["señal: destino externo"]
    REG -->|"sí"| TEXT{"¿texto coincide<br/>con destino?"}
    TEXT -->|"no"| ALERT
    TEXT -->|"sí"| CLEAN["sin señal"]
    C --> URG["urgencia"] --> ALERT
    ALERT --> REP["reportar y contener sesiones"]
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** crea una carpeta nueva y escribí cuatro programas. Cada uno analiza una capa distinta del correo y de la campaña.

```bash
mkdir ejemplo && cd ejemplo
```

**Capa 1: el correo completo.** Crea `analizar.py`. Parsea el mensaje con la biblioteca `email`, compara las cabeceras de identidad, extrae los enlaces con un parser HTML y evalúa señales de urgencia:

```python
import re
from email import message_from_string
from html.parser import HTMLParser
from urllib.parse import urlsplit

DOMINIOS = {"rutaflow.co"}
PALABRAS = ["urgente", "suspendida", "24 horas", "verifique", "inmediato"]


def dominio(direccion):
    return direccion.rsplit("@", 1)[-1].strip().lower().rstrip(">")


class Enlaces(HTMLParser):
    def __init__(self):
        super().__init__()
        self.enlaces = []
        self._href = None

    def handle_starttag(self, tag, attrs):
        if tag == "a":
            self._href = dict(attrs).get("href")

    def handle_data(self, data):
        if self._href is not None:
            self.enlaces.append((self._href, data.strip()))
            self._href = None


def revisar(crudo):
    msg = message_from_string(crudo)
    de = msg["From"] or ""
    remitente = dominio(de)
    alertas = []

    return_path = msg.get("Return-Path") or ""
    if return_path and dominio(return_path) != remitente:
        alertas.append(f"Return-Path {dominio(return_path)} no coincide con From {remitente}")
    reply_to = msg.get("Reply-To") or ""
    if reply_to and dominio(reply_to) != remitente:
        alertas.append(f"Reply-To {dominio(reply_to)} no coincide con From {remitente}")

    parser = Enlaces()
    parser.feed(msg.get_payload())
    for href, texto in parser.enlaces:
        destino = urlsplit(href)
        host = (destino.hostname or "").lower()
        if destino.username:
            alertas.append(f"URL con userinfo: {href} -> destino real {host}")
        if host.startswith("xn--"):
            alertas.append(f"dominio punycode: {host}")
        raros = [f"{c} (U+{ord(c):04X})" for c in host if ord(c) > 127]
        if raros:
            alertas.append(f"homógrafo en el destino: {raros} en {host}")
        if host and not host.replace(".", "").isdigit() and host not in DOMINIOS:
            alertas.append(f"destino fuera de la lista blanca: {host}")
        if destino.scheme != "https":
            alertas.append(f"enlace sin HTTPS: {href}")
        visible = urlsplit(texto if "://" in texto else "https://" + texto).hostname or ""
        if visible and visible != host:
            alertas.append(f"texto muestra {visible} pero va a {host}")

    texto_total = " ".join([msg["Subject"] or "", msg.get_payload()]).lower()
    urgencia = [p for p in PALABRAS if p in texto_total]
    if urgencia:
        alertas.append(f"urgencia: {', '.join(urgencia)}")
    return alertas


correos = {
    "legítimo": """From: facturas@rutaflow.co
Return-Path: <facturas@rutaflow.co>
Subject: Factura de octubre
Content-Type: text/html; charset=utf-8

<a href="https://rutaflow.co/f/10">rutaflow.co</a>""",
    "typosquat": """From: soporte@rutaf1ow.co
Return-Path: <rebote@mailer.example>
Reply-To: ayuda@otro.example
Subject: URGENTE: cuenta suspendida
Content-Type: text/html; charset=utf-8

Verifique en 24 horas: <a href="https://rutaflow.co@rutaf1ow.co/login">rutaflow.co</a>""",
    "punycode": """From: seguridad@rutaflow.co
Subject: Actualice sus datos
Content-Type: text/html; charset=utf-8

<a href="http://xn--rutflow-4fg.co/datos">rutaflow.co</a>""",
}

for nombre, crudo in correos.items():
    alertas = revisar(crudo)
    print(f"{nombre}: {'SOSPECHOSO' if alertas else 'sin señales'}")
    for alerta in alertas:
        print(f"  - {alerta}")
```

**Ejecuta el analizador:**

```bash
python3 analizar.py
```

Resultado esperado:

```text
legítimo: sin señales
typosquat: SOSPECHOSO
  - Return-Path mailer.example no coincide con From rutaf1ow.co
  - Reply-To otro.example no coincide con From rutaf1ow.co
  - URL con userinfo: https://rutaflow.co@rutaf1ow.co/login -> destino real rutaf1ow.co
  - destino fuera de la lista blanca: rutaf1ow.co
  - texto muestra rutaflow.co pero va a rutaf1ow.co
  - urgencia: urgente, suspendida, 24 horas, verifique
punycode: SOSPECHOSO
  - dominio punycode: xn--rutflow-4fg.co
  - destino fuera de la lista blanca: xn--rutflow-4fg.co
  - enlace sin HTTPS: http://xn--rutflow-4fg.co/datos
  - texto muestra rutaflow.co pero va a xn--rutflow-4fg.co
```

El programa explica cada alerta: `Return-Path` y `Reply-To` son identidades distintas del `From` y su divergencia es una señal; `urlsplit(href).username` revela el truco del `@`; el host `xn--` es punycode; la comparación del texto visible con el host del `href` descubre el enlace que miente. El correo legítimo no genera ninguna alerta porque las tres identidades coinciden, los enlaces van al mismo dominio registrable y no hay urgencia.

**Capa 2: las URLs por separado.** Crea `urls.py` para estudiar los trucos sin el ruido del correo:

```python
import ipaddress
from urllib.parse import urlsplit

PERMITIDOS = {"rutaflow.co", "pagos.rutaflow.co"}


def registrable(host):
    etiquetas = host.rstrip(".").split(".")
    return ".".join(etiquetas[-2:]) if len(etiquetas) >= 2 else host


def revisar(url):
    partes = urlsplit(url)
    host = (partes.hostname or "").lower()
    notas = [f"host={host}", f"registrable={registrable(host)}"]
    if partes.username:
        notas.append(f"userinfo oculta el destino real: {partes.username}@{host}")
    try:
        ipaddress.ip_address(host)
        notas.append("el destino es una IP, no un dominio")
    except ValueError:
        pass
    if any(ord(c) > 127 for c in host):
        notas.append("el host tiene caracteres no ASCII (homógrafo)")
    if host.startswith("xn--") or ".xn--" in host:
        try:
            notas.append(f"punycode decodifica a {host.encode('ascii').decode('idna')}")
        except UnicodeError:
            notas.append("punycode inválido")
    if partes.scheme != "https":
        notas.append("sin HTTPS")
    if host not in PERMITIDOS and registrable(host) not in PERMITIDOS:
        notas.append("fuera de la lista blanca por dominio registrable")
    return notas


for url in [
    "https://rutaflow.co@rutaf1ow.co/login",
    "https://pagos.rutaflow.co.evil.example/login",
    "https://xn--rutflow-4fg.co/datos",
    "https://rutaflоw.co/datos",
    "http://45.12.3.9/login",
    "https://pagos.rutaflow.co/f/10",
]:
    print(url)
    for nota in revisar(url):
        print(f"  - {nota}")
```

**Ejecuta el análisis de URLs:**

```bash
python3 urls.py
```

Resultado esperado:

```text
https://rutaflow.co@rutaf1ow.co/login
  - host=rutaf1ow.co
  - registrable=rutaf1ow.co
  - userinfo oculta el destino real: rutaflow.co@rutaf1ow.co
  - fuera de la lista blanca por dominio registrable
https://pagos.rutaflow.co.evil.example/login
  - host=pagos.rutaflow.co.evil.example
  - registrable=evil.example
  - fuera de la lista blanca por dominio registrable
https://xn--rutflow-4fg.co/datos
  - host=xn--rutflow-4fg.co
  - registrable=xn--rutflow-4fg.co
  - punycode decodifica a rutаflow.co
  - fuera de la lista blanca por dominio registrable
https://rutaflоw.co/datos
  - host=rutaflоw.co
  - registrable=rutaflоw.co
  - el host tiene caracteres no ASCII (homógrafo)
  - fuera de la lista blanca por dominio registrable
http://45.12.3.9/login
  - host=45.12.3.9
  - registrable=3.9
  - el destino es una IP, no un dominio
  - sin HTTPS
  - fuera de la lista blanca por dominio registrable
https://pagos.rutaflow.co/f/10
  - host=pagos.rutaflow.co
  - registrable=rutaflow.co
```

La última URL no produce ninguna alerta: es un subdominio legítimo y su dominio registrable está permitido. Las demás ilustran que "el host contiene rutaflow" y "el host pertenece a rutaflow.co" son afirmaciones distintas. El `registrable=3.9` de la IP es el recordatorio de que la regla de las dos etiquetas es una aproximación: por eso el programa comprueba IPs antes y en producción se usa una lista de sufijos públicos.

**Capa 3: autenticación del correo.** Crea `autenticacion.py`. Lee la cabecera `Authentication-Results` que añade el servidor receptor y decide qué hacer con el mensaje según DMARC:

```python
import re
from email import message_from_string
from email.utils import parseaddr


def veredicto(crudo):
    msg = message_from_string(crudo)
    cabecera = (msg.get("Authentication-Results") or "").lower()
    r = dict(re.findall(r"(?<![.\w])(spf|dkim|dmarc)=(\w+)", cabecera))
    politica = (re.search(r"policy\.dmarc=(\w+)", cabecera) or [None, "none"])[1]
    visible = parseaddr(msg["From"] or "")[1].rsplit("@", 1)[-1].lower()

    if r.get("dmarc") == "pass":
        return f"ENTREGAR (dmarc=pass, From={visible})"
    if r.get("dmarc") == "fail" and politica == "reject":
        return f"RECHAZAR (dmarc=fail, política p=reject, From={visible})"
    if r.get("dmarc") == "fail" and politica == "quarantine":
        return f"CUARENTENA (dmarc=fail, política p=quarantine, From={visible})"
    return f"ENTREGAR CON AVISO (sin dmarc=pass, spf={r.get('spf')}, dkim={r.get('dkim')})"


casos = [
    ("legítimo", """From: Facturación <facturas@rutaflow.co>
Authentication-Results: mx.rutaflow.co; spf=pass smtp.mailfrom=rutaflow.co; dkim=pass header.d=rutaflow.co; dmarc=pass header.from=rutaflow.co"""),
    ("suplantación rechazada", """From: Soporte RutaFlow <soporte@rutaf1ow.co>
Authentication-Results: mx.rutaflow.co; spf=pass smtp.mailfrom=mailer.example; dkim=fail header.d=mailer.example; dmarc=fail header.from=rutaf1ow.co policy.dmarc=reject"""),
    ("dominio sin DMARC", """From: "Soporte RutaFlow" <ayuda@rutaflow-soporte.example>
Authentication-Results: mx.rutaflow.co; spf=none; dkim=none; dmarc=none"""),
]

for nombre, crudo in casos:
    print(f"{nombre}: {veredicto(crudo)}")

remitente = parseaddr('"Soporte RutaFlow" <ayuda@rutaflow-soporte.example>')
print(f"nombre visible: {remitente[0]!r} — dirección real: {remitente[1]}")
```

**Ejecuta el intérprete de autenticación:**

```bash
python3 autenticacion.py
```

Resultado esperado:

```text
legítimo: ENTREGAR (dmarc=pass, From=rutaflow.co)
suplantación rechazada: RECHAZAR (dmarc=fail, política p=reject, From=rutaf1ow.co)
dominio sin DMARC: ENTREGAR CON AVISO (sin dmarc=pass, spf=none, dkim=none)
nombre visible: 'Soporte RutaFlow' — dirección real: ayuda@rutaflow-soporte.example
```

El segundo caso muestra la diferencia entre SPF y DMARC: SPF pasa porque el proveedor que envió el mensaje está autorizado por `mailer.example`, pero DMARC falla porque el `From` declara `rutaf1ow.co` y no hay alineación. El tercer caso es el más peligroso en la práctica: sin DMARC, el servidor no tiene una política que aplicar y el mensaje se entrega con aviso. La última línea demuestra que el nombre visible es texto libre: dice "Soporte RutaFlow" y la dirección real es otra.

**Capa 4: medir una campaña.** Crea `campana.csv` con 24 destinatarios y tres columnas de resultado:

```csv
usuario,grupo,clic,reporto,credencial
u01,formacion,0,1,0
u02,formacion,0,1,0
u03,formacion,1,0,0
u04,formacion,0,0,0
u05,formacion,0,1,0
u06,formacion,0,0,0
u07,formacion,0,0,0
u08,formacion,1,0,0
u09,formacion,0,1,0
u10,formacion,0,1,0
u11,formacion,0,0,0
u12,formacion,0,1,0
u13,control,0,0,0
u14,control,1,0,1
u15,control,0,0,0
u16,control,1,0,0
u17,control,0,0,0
u18,control,1,0,1
u19,control,0,1,0
u20,control,0,0,0
u21,control,1,0,1
u22,control,0,0,0
u23,control,1,0,0
u24,control,0,0,0
```

Crea `campana.py` para calcular las tasas sobre enviados, por grupo y en conjunto:

```python
import csv
from collections import defaultdict


def tasas(filas):
    total = len(filas)
    return {
        "enviados": total,
        "clic": sum(f["clic"] for f in filas),
        "reporto": sum(f["reporto"] for f in filas),
        "credencial": sum(f["credencial"] for f in filas),
        "tasa_clic": 100 * sum(f["clic"] for f in filas) / total,
        "tasa_reporte": 100 * sum(f["reporto"] for f in filas) / total,
        "tasa_credencial": 100 * sum(f["credencial"] for f in filas) / total,
    }


with open("campana.csv", encoding="utf-8") as f:
    filas = [{k: int(v) if k != "usuario" and k != "grupo" else v for k, v in r.items()}
             for r in csv.DictReader(f)]

grupos = defaultdict(list)
for fila in filas:
    grupos[fila["grupo"]].append(fila)

for nombre, subconjunto in [("global", filas), *grupos.items()]:
    t = tasas(subconjunto)
    print(f"{nombre}: enviados={t['enviados']} clic={t['tasa_clic']:.1f}% "
          f"reporte={t['tasa_reporte']:.1f}% credencial={t['tasa_credencial']:.1f}%")

base = tasas(grupos["control"])["tasa_clic"]
nuevo = tasas(grupos["formacion"])["tasa_clic"]
print(f"diferencia de clic formacion vs control: {nuevo - base:+.1f} puntos")
print(f"un solo clic mueve la tasa global {100 / len(filas):.1f} puntos")
```

**Ejecuta la medición:**

```bash
python3 campana.py
```

Resultado esperado:

```text
global: enviados=24 clic=29.2% reporte=29.2% credencial=12.5%
formacion: enviados=12 clic=16.7% reporte=50.0% credencial=0.0%
control: enviados=12 clic=41.7% reporte=8.3% credencial=25.0%
diferencia de clic formacion vs control: -25.0 puntos
un solo clic mueve la tasa global 4.2 puntos
```

El programa explica la decisión de diseño: todas las tasas se calculan sobre enviados, nunca sobre clics; el grupo con formación hace menos clic, reporta más y no introduce credenciales; y la última línea recuerda que con 24 personas cada clic pesa 4,2 puntos, así que la diferencia observada es una señal para repetir la medición, no una conclusión definitiva.

#### Paso 5 · Práctica guiada
Pista: reemplazá la comparación por dominio registrable de `filtro.py` por una búsqueda de la palabra `rutaflow` en el remitente completo y ejecutalo; ese es el fallo deliberado. El programa queda así:

```python
from urllib.parse import urlsplit

PERMITIDOS = {"rutaflow.co"}
remitentes = [
    "facturas@rutaflow.co",
    "soporte@rutaflow-soporte.example",
    "alerta@rutaflow.co.evil.example",
    "ayuda@pagos.rutaflow.co",
]

print("filtro ingenuo: 'rutaflow' en el remitente")
for r in remitentes:
    print(f"  {r}: {'SOSPECHOSO' if 'rutaflow' not in r else 'sin señales'}")

print("filtro por dominio registrable")
for r in remitentes:
    dominio = r.rsplit("@", 1)[-1].lower()
    etiquetas = dominio.split(".")
    registrable = ".".join(etiquetas[-2:])
    print(f"  {r}: {'SOSPECHOSO' if registrable not in PERMITIDOS else 'sin señales'}")
```

Salida al ejecutar `python3 filtro.py`:

```text
filtro ingenuo: 'rutaflow' en el remitente
  facturas@rutaflow.co: sin señales
  soporte@rutaflow-soporte.example: sin señales
  alerta@rutaflow.co.evil.example: sin señales
  ayuda@pagos.rutaflow.co: sin señales
filtro por dominio registrable
  facturas@rutaflow.co: sin señales
  soporte@rutaflow-soporte.example: SOSPECHOSO
  alerta@rutaflow.co.evil.example: SOSPECHOSO
  ayuda@pagos.rutaflow.co: sin señales
```

El diagnóstico es directo: el filtro ingenuo no falla por un error de sintaxis, falla porque su condición no distingue "contiene" de "pertenece". `rutaflow-soporte.example` y `rutaflow.co.evil.example` contienen la palabra y pasan como legítimos. La corrección no es agregar más palabras prohibidas, que el atacante puede evitar, sino comparar el dominio registrable contra una lista blanca. La versión corregida marca los dos casos de suplantación y sigue aceptando el subdominio real.

#### Paso 6 · Práctica independiente
Convertí el análisis en un procedimiento y cerralo con el proyecto del módulo:

1. Agregá a `urls.py` un caso con un sufijo público de dos etiquetas, por ejemplo `https://rutaflow.co.uk.evil.example`. Comprobá que la regla de las dos etiquetas identifica `evil.example` y explicá por qué `rutaflow.co.uk` sí requeriría una lista de sufijos.
2. Agregá a `autenticacion.py` un cuarto correo con `dmarc=fail` y `p=quarantine`; verificá que la salida sea `CUARENTENA`.
3. Modificá `campana.py` para excluir del cálculo a quien reportó el correo sin hacer clic. Decidí si esa exclusión cambia la tasa de reporte y documentá el motivo: el reporte y el clic no son excluyentes.
4. Escribí `playbook-phishing.md` con seis fases y, en la fase de contención, la revocación de sesiones antes del cambio de contraseña; incluí qué cabeceras se preservan y quién decide cerrar el incidente.
5. **Proyecto integrador del módulo: auditoría de seguridad de RutaFlow.** Reuní los entregables de los cinco temas en un único documento `auditoria-rutaflow.md` con una sección por tema: registro de riesgos con propietario y riesgo residual (Tema 1), control de acceso y bitácora encadenada (Tema 2), firma de comandos con ventana y nonce, verificación TLS y búsqueda de secretos en el historial (Tema 3), validación, parametrización, codificación, redacción y runbook (Tema 4) y análisis de correo, autenticación y métricas de campaña (Tema 5). Cada sección cita el script ejecutado y su salida; el documento termina con los riesgos que siguen abiertos y qué evidencia falta para cerrarlos.

Criterios de aceptación: el sufijo de dos etiquetas se clasifica como externo; el caso `p=quarantine` produce cuarentena; la tasa de reporte se explica con su denominador; el playbook preserva cabeceras y revoca sesiones antes de cambiar la contraseña; la auditoría tiene una sección por tema y declara al menos dos riesgos abiertos con la evidencia que falta.

#### Paso 7 · Cierre
Entregá las cuatro salidas del Paso 4, el fallo del filtro del Paso 5 y el playbook del Paso 6, y explicá por qué el nombre visible no es una prueba de identidad, por qué SPF puede pasar mientras DMARC falla y por qué una campaña con 24 personas no demuestra el efecto de la formación.

**Errores comunes:** confiar en el nombre visible o en el texto del enlace; comparar por "contiene" en lugar de por dominio registrable; tratar SPF como si autenticara al `From`; creer que un correo es seguro porque el proveedor lo entregó; dar por buenas las tasas de una simulación con denominadores distintos; y contener una credencial comprometida cambiando la contraseña sin revocar las sesiones activas.

**Autoevaluación:** ¿qué capa revela que `rutaflow.co@rutaf1ow.co` lleva a otro sitio? (el host de `urlsplit`, no el texto); ¿qué comprueba DMARC que SPF no comprueba? (la alineación con el dominio del `From`); ¿qué se revoca primero ante una credencial comprometida? (las sesiones y tokens). **Fuentes oficiales:** https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks, https://owasp.org/www-community/attacks/Phishing y https://datatracker.ietf.org/doc/html/rfc7489. Siguiente paso: el Módulo 7, «Requisitos, diseño, arquitectura y mantenimiento», donde la auditoría se convierte en decisiones de arquitectura.
