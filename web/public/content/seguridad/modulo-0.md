# Módulo 0: Seguridad, privacidad y modelado de amenazas

> **Requisitos de este curso:** [Fundamentos](/curso/foundations). Lo que esos cursos enseñan aquí se usa sin volver a explicarlo; si algo no te suena, vuelve a su capítulo antes de seguir.

**Entorno comprobado para esta edición (2026-11-24):** Python 3.13.18 (enlazado con OpenSSL 3.5.9 y SQLite 3.53.1),
la herramienta de línea de órdenes OpenSSL 3.0.13 y Git 2.43.0 en Linux x86_64, sin paquetes externos de Python.
Todas las transcripciones son literales de esa ejecución, en la carpeta de práctica `/home/estudiante/labs/seguridad`
(tu `~/labs/seguridad`). Varias salidas **cambian en cada ejecución a propósito**: los textos cifrados, las claves
RSA, las sales aleatorias y los tiempos medidos. Lo que debe coincidir es la forma y el veredicto (`OK`, `RECHAZADO`,
`Verified OK`). Los commits del Tema 3 se hicieron con autor y fecha fijos. Los comandos para Windows y macOS no se
ejecutaron.

**Regla de laboratorio.** Todos los ataques de este módulo se ejecutan contra código y datos que tú creas en tu
equipo: una base SQLite en memoria, un servidor en `127.0.0.1` y correos escritos como texto. Nunca pruebes una de
estas técnicas contra un sistema que no es tuyo o sin autorización escrita: además de dañino, es un delito.

#### Objetivos del módulo
Al terminar este módulo podrás:
- construir un registro de amenazas con STRIDE y priorizarlo por riesgo residual;
- guardar contraseñas con sal y derivación lenta, y autorizar cada acción por rol y por recurso;
- distinguir cifrado simétrico, cifrado asimétrico, firma y HMAC, y verificar un certificado TLS de verdad;
- encontrar un secreto en el historial de Git y bloquearlo con un escáner que falla en CI;
- demostrar una inyección SQL en un laboratorio propio y corregirla con consultas parametrizadas;
- aplicar minimización, redacción y retención a datos personales;
- analizar un correo sospechoso con código y responder con un runbook.

#### Esquema del módulo
1. Activos, amenazas, riesgos y límites de confianza.
2. Identidad, contraseñas, sesiones y autorización.
3. Criptografía aplicada, TLS, claves y secretos.
4. Validación, vulnerabilidades web, privacidad y respuesta.
5. Ingeniería social, phishing y respuesta.
6. Proyecto 6: inventario endurecido.

#### Qué necesitas saber antes
- Terminal, rutas, **código de salida**, **entrada estándar** y **tubería** (Módulo 0, Temas 3 a 5).
- Funciones, **excepción** y `assert` (Módulo 1, Temas 1 y 4); diccionarios y conjuntos (Módulo 2, Tema 1); **codificación** y **UTF-8** (Módulo 1, Tema 5).
- **Función hash** y tabla hash (Módulo 2, Tema 6).
- **Cliente y servidor**, **URL**, **DNS**, **puerto**, **HTTP**, **cabecera**, **JSON**, **HTML** y **JavaScript** (Módulo 3, Temas 1 a 3).
- SQL y SQLite desde Python (Módulo 4, Temas 1 y 2).
- **Registro** con `logging`, **Git**, **commit** e **integración continua** (Módulo 5, Temas 1, 3 y 4).

Comprueba tu entorno antes de empezar:

```text
$ python3 --version
Python 3.13.18
$ openssl version
OpenSSL 3.0.13 30 Jan 2024 (Library: OpenSSL 3.0.13 30 Jan 2024)
$ git --version
git version 2.43.0
```


## Aprende construyendo

### Tema 1: Activos, amenazas, riesgos y límites de confianza · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- nombrar los activos de RutaFlow y escribir para cada uno una amenaza concreta con STRIDE;
- calcular el riesgo como impacto por probabilidad y el riesgo residual después de un control;
- marcar los límites de confianza de un diagrama y revisar con código qué flujos los cruzan sin protección;
- validar un registro de riesgos y leer el mensaje con el que el validador lo rechaza.

**Conceptos clave:** activo, amenaza, vulnerabilidad, riesgo, control, riesgo residual, modelado de amenazas, STRIDE, límite de confianza

#### El problema
El equipo de RutaFlow tiene diez ideas de seguridad y tiempo para tres. Alguien quiere cifrar todo; otra persona
quiere comprar un antivirus. Nadie sabe qué proteger primero ni por qué. ¿Cómo conviertes una lista de miedos en
una lista ordenada de trabajo, con dueño y con un número que la justifique?

Este tema usa lo que ya conoces: **JSON** (Módulo 3, Tema 2) para guardar el registro, y diccionarios y conjuntos
(Módulo 2, Tema 1) para validarlo. Aquí no se redefinen.

#### Glosario del tema

**activo**
- **Definición técnica:** cualquier cosa con valor para la organización que puede sufrir daño: datos, servicios, credenciales, equipos o reputación.
- **En palabras sencillas:** lo que te dolería perder, que te robaran o que alguien cambiara sin permiso.
- **Dónde se rompe la comparación:** un activo digital se puede copiar sin que desaparezca; el robo de un dato no deja el estante vacío.
- **Ejemplo:** en `amenazas.json`, el activo de `I-01` es `"PIN del destinatario"` y el de `D-01` es `"API de confirmación"`.
- **Error típico:** listar solo servidores y olvidar activos intangibles como la sesión de un conductor o el historial de confirmaciones.

**amenaza**
- **Definición técnica:** evento o acción, intencional o accidental, que puede dañar un activo; se describe con actor, acción y efecto.
- **En palabras sencillas:** lo malo que podría pasarle a lo que te importa, contado como una frase con sujeto y verbo.
- **Dónde se rompe la comparación:** una amenaza no es un atacante; un operador cansado que marca mal un envío también es una amenaza.
- **Ejemplo:** `T-01`: «operador marca entregado un envío que nunca salió».
- **Error típico:** escribir amenazas vagas como «hackeo» o «virus», que no dicen qué activo ni qué daño.

**vulnerabilidad**
- **Definición técnica:** debilidad en el diseño, el código o la operación que permite que una amenaza se materialice.
- **En palabras sencillas:** la puerta mal cerrada por donde entra el problema.
- **Dónde se rompe la comparación:** una puerta se ve; una vulnerabilidad de software suele estar escondida hasta que alguien la busca.
- **Ejemplo:** el flujo `F6` de `limites.py` va de Internet a la base de datos `sin autenticación`: esa es la vulnerabilidad.
- **Error típico:** confundir la vulnerabilidad (la falta de autenticación) con la amenaza (el robo de datos que permite).

**riesgo**
- **Definición técnica:** medida de cuánto preocupa una amenaza; en este módulo se calcula como impacto (1–5) por probabilidad (1–5).
- **En palabras sencillas:** qué tan grave sería y qué tan seguido podría pasar, juntos en un solo número.
- **Dónde se rompe la comparación:** la escala 1–5 es un juicio del equipo, no una medición física; sirve para ordenar, no para predecir pérdidas exactas.
- **Ejemplo:** `S-02` tiene impacto 4 y probabilidad 5; `riesgos.py` imprime `riesgo 20`.
- **Error típico:** sumar impacto y probabilidad: un riesgo 5+1 quedaría igual que uno 3+3, aunque el primero casi nunca ocurre.

**control**
- **Definición técnica:** medida técnica, organizativa o física que reduce la probabilidad o el impacto de una amenaza.
- **En palabras sencillas:** el candado, la alarma o la regla que pones para que lo malo pase menos o duela menos.
- **Dónde se rompe la comparación:** un candado se compra una vez; un control de software se rompe con un cambio de código si nadie lo prueba.
- **Ejemplo:** el control de `D-01` es `"límite de tasa por conductor"`, con efectividad estimada de `0.8`.
- **Error típico:** declarar un control que nadie implementó; el registro debe apuntar a código o configuración que exista.

**riesgo residual**
- **Definición técnica:** riesgo que queda después de aplicar el control: riesgo × (1 − efectividad).
- **En palabras sencillas:** lo que sigue preocupando aunque ya pusiste el candado.
- **Dónde se rompe la comparación:** la efectividad es una estimación; si el control falla, el residual real vuelve a ser el riesgo completo.
- **Ejemplo:** `S-02` baja de `riesgo 20` a `residual 12` con un control de efectividad `0.4`.
- **Error típico:** ordenar por riesgo inicial; `D-01` tiene riesgo 12 pero residual 2, y no debe ir antes que `T-01`.

**modelado de amenazas**
- **Definición técnica:** proceso sistemático que dibuja el sistema, enumera amenazas por cada elemento y flujo, y decide un tratamiento para cada una.
- **En palabras sencillas:** sentarse con el plano de la casa y preguntar «¿por dónde podría entrar alguien y qué haríamos?».
- **Dónde se rompe la comparación:** el plano de software cambia cada semana; el modelo se repite con cada cambio grande.
- **Ejemplo:** el diagrama de este tema más `amenazas.json` y `flujos.json` son el modelo de amenazas de RutaFlow.
- **Error típico:** hacerlo una vez al final del proyecto, cuando cambiar el diseño ya es caro.

**STRIDE**
- **Definición técnica:** lista de seis categorías de amenaza: suplantación (*Spoofing*), manipulación (*Tampering*), repudio (*Repudiation*), divulgación de información (*Information disclosure*), denegación de servicio (*Denial of service*) y elevación de privilegios (*Elevation of privilege*).
- **En palabras sencillas:** seis preguntas para no olvidar ningún tipo de problema: ¿quién finge?, ¿qué se altera?, ¿quién niega?, ¿qué se filtra?, ¿qué se cae?, ¿quién sube de rango?
- **Dónde se rompe la comparación:** una misma amenaza puede caer en dos categorías; STRIDE ayuda a pensar, no a clasificar sin ambigüedad.
- **Ejemplo:** `riesgos.py` termina con `por STRIDE: Denial of service=1, …, Spoofing=2, Tampering=1`.
- **Error típico:** escribir la categoría con otra ortografía; `"Spoffing"` hace que el validador rechace el registro.

**límite de confianza**
- **Definición técnica:** frontera en un diagrama donde los datos pasan entre zonas con distinto nivel de confianza; todo flujo que la cruza debe autenticarse y validarse.
- **En palabras sencillas:** la portería del edificio: lo que viene de la calle se revisa antes de subir.
- **Dónde se rompe la comparación:** en software no hay paredes; el límite existe solo si el código lo hace cumplir en cada petición.
- **Ejemplo:** `limites.py` imprime `F1 usuario -> API: cruza Internet/DMZ — OK`.
- **Error típico:** confiar en algo porque «viene de dentro de la red»; un servicio interno comprometido cruza el mismo límite.

#### ► CÓMO FUNCIONA
Primero dibujas el sistema como un **diagrama de flujo de datos**: quién habla con quién y por qué canal. Después
marcas las **zonas** (Internet, DMZ, Aplicación, Datos) y los **límites de confianza** entre ellas. La DMZ es la zona
intermedia donde vive lo que Internet puede tocar, como la API.

Con el dibujo listo, recorres cada flujo y cada elemento con las seis preguntas de **STRIDE**. Cada respuesta se
vuelve una fila: activo, amenaza, impacto, probabilidad, control, efectividad, dueño y tratamiento. Los tratamientos
posibles son cuatro: **mitigar** (poner un control), **aceptar**, **transferir** (por ejemplo, a un seguro) o
**evitar** (quitar la funcionalidad).

| Columna | Qué es | Qué haces con ella |
|---|---|---|
| `impacto`, `probabilidad` | Juicio de 1 a 5 | Los multiplicas para obtener el riesgo |
| `efectividad` | Fracción de 0 a 1 | Calculas el riesgo residual |
| `propietario` | Equipo responsable | Sabes a quién pedir el control |
| `tratamiento` | mitigar, aceptar, transferir, evitar | Decides qué hacer con cada fila |

```mermaid
flowchart LR
    U["usuario<br/>Internet"] -->|"HTTPS"| A["API<br/>DMZ"]
    O["operador<br/>Internet"] -->|"HTTPS + MFA"| A
    A -->|"gRPC"| D["dominio<br/>Aplicación"]
    D -->|"SQL parametrizado"| B["base de datos<br/>Datos"]
    D -->|"AMQP + HMAC"| Q["cola<br/>Aplicación"]
    A -. "límite Internet/DMZ" .-> U
    A -. "límite DMZ/Aplicación" .-> D
    D -. "límite Aplicación/Datos" .-> B
```

Las etiquetas de las flechas son protocolos. **gRPC** y **AMQP** son protocolos de comunicación entre servicios, y
**MFA** (autenticación multifactor) es pedir una segunda prueba además de la contraseña. No necesitas dominarlos
aquí: basta con saber que cada flecha es un canal que alguien podría atacar.

#### Problema resuelto 1.1
Convierte las amenazas de RutaFlow en un registro validado y ordenado por riesgo residual.

**Razonamiento:**
1. Guardar cada amenaza como un objeto JSON con las ocho columnas de la tabla anterior.
2. Validar antes de calcular: categoría STRIDE conocida, escalas en rango, dueño presente y tratamiento válido.
3. Si hay errores, terminar con código de salida distinto de cero y un mensaje que los liste todos.
4. Calcular riesgo y residual, ordenar de mayor a menor residual y contar por categoría.

Crea `~/labs/seguridad/tema1/amenazas.json`:

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

Y el programa que lo valida y lo ordena:

```python
# riesgos.py — valida y prioriza el registro de amenazas de RutaFlow
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

```text
$ python3 riesgos.py
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

**Explicación por partes.**
- Líneas 6–7: dos **conjuntos** con los valores permitidos; comprobar pertenencia con `in` es directo.
- Líneas 11–22: el bucle acumula **todos** los errores en una lista antes de decidir. Así ves los problemas juntos.
- Línea 24: `sys.exit` con un texto lo imprime y termina con código de salida 1.
- Líneas 27–28: el riesgo es la multiplicación; el residual aplica la efectividad y redondea al entero más cercano.
- Línea 30: `sort` con `reverse=True` deja arriba el residual mayor; entre empates conserva el orden del archivo.
- Salida: `S-02` encabeza la lista. Tiene el control más débil (`0.4`) sobre un riesgo alto (`20`).

> **Error común.** Poner un valor fuera de escala o dejar el dueño vacío. Con `"impacto": 7` y
> `"propietario": ""`, el programa termina así:
>
> ```text
> fallo: T-09 impacto fuera de rango (1-5): 7; T-09 sin propietario
> ```
>
> Lee el mensaje por partes separadas con `;`: cada una nombra la fila (`T-09`), el campo y el valor recibido.

> **Buena práctica.** Cada fila tiene un **dueño** con nombre de equipo, no «todos». Una fila sin dueño es una fila
> que nadie va a cerrar.

#### Problema resuelto 1.2
Revisa los flujos del diagrama y marca los que cruzan un límite de confianza sin autenticación, sin cifrado o
saltando zonas.

**Razonamiento:**
1. Asignar una zona a cada elemento y un nivel numérico a cada zona (Internet 0, DMZ 1, Aplicación 2, Datos 3).
2. Un flujo dentro de una misma zona no cruza límites.
3. Un flujo que cruza debe ir autenticado y cifrado, y no debe saltarse zonas: de Internet no se llega a Datos.

Crea `flujos.json` en la misma carpeta:

```json
[
  {"id": "F1", "origen": "usuario", "destino": "API", "protocolo": "HTTPS", "autenticado": true, "cifrado": true},
  {"id": "F2", "origen": "operador", "destino": "API", "protocolo": "HTTPS + MFA", "autenticado": true, "cifrado": true},
  {"id": "F3", "origen": "API", "destino": "dominio", "protocolo": "gRPC", "autenticado": true, "cifrado": true},
  {"id": "F4", "origen": "dominio", "destino": "base de datos", "protocolo": "SQL parametrizado", "autenticado": true, "cifrado": false},
  {"id": "F5", "origen": "dominio", "destino": "cola", "protocolo": "AMQP + HMAC", "autenticado": true, "cifrado": true},
  {"id": "F6", "origen": "conductor", "destino": "base de datos", "protocolo": "SQL", "autenticado": false, "cifrado": false}
]
```

```python
# limites.py — revisa los flujos que cruzan un límite de confianza
import json
from pathlib import Path

ZONAS = {
    "usuario": "Internet", "operador": "Internet", "conductor": "Internet",
    "API": "DMZ", "dominio": "Aplicación", "cola": "Aplicación", "base de datos": "Datos",
}
NIVEL = {"Internet": 0, "DMZ": 1, "Aplicación": 2, "Datos": 3}

flujos = json.loads(Path("flujos.json").read_text(encoding="utf-8"))
hallazgos = 0
for f in flujos:
    z_origen, z_destino = ZONAS[f["origen"]], ZONAS[f["destino"]]
    if z_origen == z_destino:
        print(f"{f['id']} {f['origen']} -> {f['destino']}: misma zona ({z_origen})")
        continue
    problemas = []
    if abs(NIVEL[z_origen] - NIVEL[z_destino]) > 1:
        problemas.append(f"salta de {z_origen} a {z_destino}")
    if not f["autenticado"]:
        problemas.append("sin autenticación")
    if not f["cifrado"]:
        problemas.append("sin cifrado")
    estado = "OK" if not problemas else "REVISAR: " + ", ".join(problemas)
    print(f"{f['id']} {f['origen']} -> {f['destino']}: cruza {z_origen}/{z_destino} — {estado}")
    hallazgos += bool(problemas)
print(f"flujos: {len(flujos)}, con hallazgos: {hallazgos}")
```

```text
$ python3 limites.py
F1 usuario -> API: cruza Internet/DMZ — OK
F2 operador -> API: cruza Internet/DMZ — OK
F3 API -> dominio: cruza DMZ/Aplicación — OK
F4 dominio -> base de datos: cruza Aplicación/Datos — REVISAR: sin cifrado
F5 dominio -> cola: misma zona (Aplicación)
F6 conductor -> base de datos: cruza Internet/Datos — REVISAR: salta de Internet a Datos, sin autenticación, sin cifrado
flujos: 6, con hallazgos: 2
```

**Explicación por partes.**
- Líneas 5–9: un diccionario lleva cada elemento a su zona y otro lleva cada zona a su nivel.
- Líneas 15–17: si origen y destino están en la misma zona, el flujo no cruza límites y se salta con `continue`.
- Líneas 19–20: una diferencia de nivel mayor que 1 significa que el flujo se salta una zona entera.
- Líneas 21–24: cada propiedad faltante se agrega como problema con un texto que se entiende sin leer el código.
- Línea 27: `bool(problemas)` vale `True` (que suma 1) si la lista tiene algo.
- Salida: `F4` cruza a Datos sin cifrado y `F6` comete las tres faltas. Ambos van al registro de amenazas.

> **Error común.** Agregar un elemento nuevo al diagrama y olvidarlo en `ZONAS`. Con un flujo hacia `"reportes"`,
> el programa se detiene en la línea 14 con:
>
> ```text
> KeyError: 'reportes'
> ```
>
> El diccionario no tiene esa clave. La corrección es decidir la zona de `reportes` y agregarla a `ZONAS`.

> **Prevenir errores.** Revisa el diagrama cada vez que alguien agrega un servicio. Un elemento sin zona es un
> elemento del que nadie decidió cuánto confiar.

#### Checkpoint 1.1
Una amenaza tiene impacto 3, probabilidad 4 y un control con efectividad `0.5`. ¿Cuál es su riesgo y su residual?
¿Va antes o después de `T-01` en la salida de `riesgos.py`?

Respuesta: riesgo `12` y residual `6` (12 × 0.5). Empata con `T-01`; como el orden se conserva entre empates, va
donde esté en el archivo: si la agregas al final, sale después de `I-02`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/seguridad/tema1` y entra con `cd ~/labs/seguridad/tema1`. Escribe `amenazas.json` y `riesgos.py`.

#### Paso 2 · Calcula y ordena
Ejecuta `python3 riesgos.py`. La primera línea debe decir `amenazas: 8` y la prioridad debe ser
`S-02 (residual 12)`.

#### Paso 3 · Rompe el registro a propósito
Copia `amenazas.json` a una carpeta `malo/` y cambia una fila a `"impacto": 7` y `"propietario": ""`. Entra en `malo/`
y ejecuta `python3 ../riesgos.py; echo $?`. Debes ver el mensaje `fallo: …` y el código `1`.

#### Paso 4 · Revisa los límites
Escribe `flujos.json` y `limites.py`, ejecútalo y confirma `flujos: 6, con hallazgos: 2`. Para cada hallazgo, agrega
una fila a `amenazas.json` con su categoría STRIDE.

#### Resumen
- Un **activo** es lo que vale; una **amenaza** es lo que puede dañarlo; una **vulnerabilidad** es la debilidad que lo permite.
- El **riesgo** se calcula como impacto × probabilidad; el **riesgo residual** aplica la efectividad del **control**.
- Se prioriza por residual, no por riesgo inicial: un control fuerte puede bajar mucho una amenaza grave.
- **STRIDE** da seis preguntas para no olvidar ninguna categoría de amenaza.
- Un **límite de confianza** separa zonas; todo flujo que lo cruza se autentica, se cifra y no salta zonas.
- El **modelado de amenazas** se repite con cada cambio de diseño y deja un registro con dueño y tratamiento.

#### Ejercicio verificable 1
Básico. Cambia la efectividad del control de `S-02` de `0.4` a `0.8` y ejecuta de nuevo `riesgos.py`. ¿Qué amenaza
queda como prioridad?

Respuesta esperada: `S-02` baja a `residual 4` y la última línea antes del conteo dice `prioridad: T-01 (residual 6)`.
`T-01` gana el empate con `I-02` porque aparece antes en el archivo.

#### Ejercicio verificable 2
Intermedio. Agrega a `limites.py` una regla: todo flujo que **entra** a la zona `Datos` debe usar un protocolo que
contenga la palabra `parametrizado`. ¿Qué flujos marca?

Respuesta esperada: solo la línea de `F6` cambia y termina en `sin cifrado, protocolo "SQL"`; `F4` ya usa
`SQL parametrizado`. El total sigue en `con hallazgos: 2`. La regla va justo antes de la línea `estado = …`:
`if z_destino == "Datos" and "parametrizado" not in f["protocolo"]:` seguida de
`problemas.append(f'protocolo "{f['protocolo']}"')`.

#### Ejercicio verificable 3
Reto. Agrega al final de `amenazas.json` la fila del hallazgo `F6`: id `I-03`, categoría `Information disclosure`,
activo `"base de datos"`, escenario `"conductor lee la base sin autenticación"`, impacto 5, probabilidad 3, control
`"acceso a datos solo desde dominio"` con efectividad `0.9`, dueño `"plataforma"` y tratamiento `"mitigar"`.
Predice su riesgo, su residual y su posición antes de ejecutar.

Respuesta esperada: la penúltima línea de la lista es `I-03 Information disclosure: riesgo 15 residual 1 — mitigar — plataforma`
y el conteo pasa a `Information disclosure=3`. En papel, 15 × 0.1 da 1.5, pero `1 - 0.9` vale `0.09999999999999998`
en punto flotante y `round` recibe `1.4999999999999996`: el resultado es `1`. Es el error de redondeo del Módulo 1, Tema 5.

#### En el trabajo
En una empresa, el registro de riesgos vive en una hoja compartida o en un sistema de tickets, y se revisa en cada
cambio de arquitectura. Un auditor no pregunta «¿son seguros?», sino «muéstrame el registro, quién es dueño de cada
fila y qué evidencia tiene cada control». El diagrama con límites de confianza es lo primero que pide un equipo de
seguridad antes de aprobar una integración nueva.

</details>

### Tema 2: Identidad, contraseñas, sesiones y autorización · Avanzado · 75 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- distinguir autenticación de autorización y decir cuál falló en cada rechazo;
- guardar contraseñas con sal y una función de derivación lenta, nunca en claro ni con un hash rápido;
- emitir sesiones que expiran y se revocan, y bloquear una cuenta tras intentos fallidos;
- autorizar por rol y por recurso, y dejar un registro de auditoría que delate alteraciones.

**Conceptos clave:** identidad, autenticación, autorización, hash criptográfico, sal, función de derivación de claves, sesión, control de acceso por roles, autorización por objeto, registro de auditoría

#### El problema
Un conductor de RutaFlow confirma entregas desde el celular. Hoy cualquiera que conozca un número de guía puede
confirmarla, y las contraseñas están en una tabla en texto plano. Si esa tabla se filtra, todas las cuentas caen a
la vez. ¿Cómo compruebas quién es cada persona, qué puede hacer y sobre qué envío, sin guardar su contraseña?

Este tema usa lo que ya conoces: **función hash** (Módulo 2, Tema 6), **excepción** (Módulo 1, Tema 1) y
**JSON** (Módulo 3, Tema 2). Aquí no se redefinen.

#### Glosario del tema

**identidad**
- **Definición técnica:** conjunto de atributos que distingue a un sujeto (persona o programa) dentro de un sistema; se representa con un identificador único.
- **En palabras sencillas:** quién eres para el sistema: tu nombre de usuario y lo que va pegado a él.
- **Dónde se rompe la comparación:** una persona puede tener varias identidades (conductor y administrador) y un programa también tiene identidad.
- **Ejemplo:** en `acceso.py`, `"c-891"` es la identidad de un conductor y `"a-01"` la de un administrador.
- **Error típico:** usar el correo como identificador inmutable; cuando el usuario lo cambia, se rompen sus permisos y su historial.

**autenticación**
- **Definición técnica:** proceso que verifica que un sujeto es quien dice ser, comprobando algo que sabe, tiene o es.
- **En palabras sencillas:** mostrar la cédula en la portería: demuestras que eres tú.
- **Dónde se rompe la comparación:** la cédula se revisa una vez; en software la prueba se repite en cada petición con una sesión.
- **Ejemplo:** `login("c-891", "pin-4471")` devuelve un token; con una clave incorrecta lanza `PermissionError: credenciales inválidas`.
- **Error típico:** responder «usuario no existe» y «clave incorrecta» por separado: el atacante aprende qué usuarios existen.

**autorización**
- **Definición técnica:** decisión de si un sujeto ya autenticado puede ejecutar una acción sobre un recurso concreto.
- **En palabras sencillas:** ya entraste al edificio; ahora, ¿tu llave abre esta oficina?
- **Dónde se rompe la comparación:** la llave abre o no; el software puede decidir con reglas que dependen de la hora, el rol o el dueño del recurso.
- **Ejemplo:** `exportar(token_891)` responde `rol conductor no autorizado a exportar` aunque la sesión sea válida.
- **Error típico:** comprobar la autorización solo en la interfaz (ocultar un botón) y no en el servidor.

**hash criptográfico**
- **Definición técnica:** función hash diseñada para que sea inviable invertirla o encontrar dos entradas con la misma salida; SHA-256 produce 32 bytes.
- **En palabras sencillas:** una huella digital del dato: siempre igual para el mismo dato, imposible de usar para reconstruirlo.
- **Dónde se rompe la comparación:** la función hash del Módulo 2 busca velocidad y reparto; esta busca que nadie pueda fabricar colisiones.
- **Ejemplo:** `hash_demo.py` muestra `52d89bdfa6d0a8ca` para `pin-4471` y `3faae6950f6382e5` para `pin-4472`: un carácter cambia toda la huella.
- **Error típico:** guardar contraseñas con SHA-256 sin más; es tan rápido que un atacante prueba miles de millones de claves por segundo.

**sal**
- **Definición técnica:** valor aleatorio, único por usuario, que se combina con la contraseña antes de derivarla y se guarda junto al resultado.
- **En palabras sencillas:** un ingrediente distinto para cada persona, para que dos claves iguales no den el mismo plato.
- **Dónde se rompe la comparación:** la sal no es secreta; se guarda en claro. Su trabajo es impedir tablas precalculadas, no esconder nada.
- **Ejemplo:** `pin-4471` con sal A da `34e47c8a48aceeb1` y con sal B da `c2e3787de97ccbdc`.
- **Error típico:** usar la misma sal fija para todos; entonces dos usuarios con la misma clave vuelven a tener el mismo hash.

**función de derivación de claves**
- **Definición técnica:** función deliberadamente lenta (PBKDF2, scrypt, Argon2) que transforma una contraseña y una sal en una clave; el costo se ajusta con iteraciones o memoria.
- **En palabras sencillas:** una licuadora que tarda a propósito: a ti te cuesta un instante, al atacante le cuesta años probar millones.
- **Dónde se rompe la comparación:** la lentitud no salva una contraseña débil como `123456`; solo encarece cada intento.
- **Ejemplo:** en `hash_demo.py`, 1 iteración tarda `0.0000 s` y 600 000 tardan `0.0993 s` en el equipo de prueba.
- **Error típico:** pasarle texto en vez de bytes: `TypeError: a bytes-like object is required, not 'str'`. Se corrige con `.encode()`.

**sesión**
- **Definición técnica:** estado guardado en el servidor que asocia un token aleatorio a una identidad autenticada, con fecha de expiración y posibilidad de revocarse.
- **En palabras sencillas:** la manilla de un evento: la muestras en cada puerta en vez de enseñar la cédula otra vez.
- **Dónde se rompe la comparación:** una manilla se corta y se acabó; un token se puede copiar, por eso expira y se puede invalidar desde el servidor.
- **Ejemplo:** tras cambiar `expira` al pasado, `confirmar` responde `sesión vencida`; tras borrarla, `sesión inválida o revocada`.
- **Error típico:** generar tokens con `random` o con datos predecibles (usuario + hora); se usa `secrets.token_urlsafe`.

**control de acceso por roles**
- **Definición técnica:** modelo de autorización (RBAC) donde los permisos se asignan a roles y los usuarios reciben roles.
- **En palabras sencillas:** los permisos van con el cargo, no con la persona: «todos los conductores pueden confirmar».
- **Dónde se rompe la comparación:** el rol dice qué tipo de acción, pero no sobre cuál recurso; para eso falta la autorización por objeto.
- **Ejemplo:** `exportar` exige `rol == "admin"` en la línea 66 de `acceso.py`.
- **Error típico:** dar el rol de administrador «temporalmente» para desbloquear a alguien y no quitarlo nunca.

**autorización por objeto**
- **Definición técnica:** comprobación de que el sujeto tiene relación con el recurso específico que pide; su ausencia se llama IDOR (referencia directa insegura a objetos).
- **En palabras sencillas:** ser conductor no basta; tiene que ser **tu** envío.
- **Dónde se rompe la comparación:** en un edificio las oficinas ajenas están cerradas; en una API basta cambiar un número en la URL para pedir otra.
- **Ejemplo:** `confirmar(token_999, "RF-4471")` responde `c-999 no está asignado a RF-4471`.
- **Error típico:** comprobar solo el rol y confiar en que el cliente envía únicamente sus propios ids.

**registro de auditoría**
- **Definición técnica:** registro de solo agregar que guarda quién hizo qué, sobre qué recurso y cuándo; si se encadena con hashes, cualquier alteración o borrado se detecta.
- **En palabras sencillas:** el libro de minutas con páginas numeradas y firmadas: arrancar una se nota.
- **Dónde se rompe la comparación:** quien tiene acceso al archivo puede reescribirlo entero y recalcular la cadena; por eso el último sello se guarda en otro lugar.
- **Ejemplo:** `auditoria.py` imprime `tras borrar el evento 2: válida=False (corte en 3: prev no coincide)`.
- **Error típico:** registrar solo los éxitos; los intentos denegados son la mejor pista de un ataque.

#### ► CÓMO FUNCIONA
Cada petición pasa por tres preguntas, en este orden. ¿Quién eres? (autenticación). ¿Tu rol puede hacer esto?
(autorización por rol). ¿Este recurso es tuyo? (autorización por objeto). Toda respuesta, positiva o negativa,
deja una línea en el registro de auditoría.

La contraseña nunca se guarda. Al registrarte, el servidor genera una sal, deriva la clave y guarda sal y resultado.
Al iniciar sesión, repite la derivación con la sal guardada y compara con `hmac.compare_digest`, que tarda lo mismo
acierte o falle. Así el tiempo de respuesta no revela cuántos bytes coincidían.

| Rechazo | Pregunta que falló | Código HTTP habitual |
|---|---|---|
| `credenciales inválidas` | Autenticación | 401 |
| `sesión vencida`, `sesión inválida o revocada` | Autenticación (sesión) | 401 |
| `rol conductor no autorizado a exportar` | Autorización por rol | 403 |
| `c-999 no está asignado a RF-4471` | Autorización por objeto | 403 |

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
    OK --> AUD["registro de auditoría encadenado"]
    DENY2 --> AUD
    DENY3 --> AUD
```

#### Problema resuelto 2.1
Muestra con números por qué un hash rápido no sirve para contraseñas y qué aportan la sal y las iteraciones.

**Razonamiento:**
1. Comparar el SHA-256 de dos claves casi iguales y repetir una: misma entrada, misma huella.
2. Derivar la misma clave con dos sales fijas para ver que el resultado cambia.
3. Medir el tiempo de 1 iteración frente a 600 000 con `perf_counter` (Módulo 2, Tema 2).

```python
# hash_demo.py — hash, sal y derivación de claves con la biblioteca estándar
import hashlib
import time

print("sha256 pin-4471:", hashlib.sha256(b"pin-4471").hexdigest()[:16])
print("sha256 pin-4472:", hashlib.sha256(b"pin-4472").hexdigest()[:16])
print("sha256 pin-4471:", hashlib.sha256(b"pin-4471").hexdigest()[:16])

sal_a = bytes.fromhex("a1" * 16)
sal_b = bytes.fromhex("b2" * 16)
for nombre, sal in [("sal A", sal_a), ("sal B", sal_b)]:
    derivado = hashlib.pbkdf2_hmac("sha256", b"pin-4471", sal, 600_000)
    print(f"pbkdf2 con {nombre}:", derivado.hex()[:16])

for iteraciones in (1, 600_000):
    inicio = time.perf_counter()
    hashlib.pbkdf2_hmac("sha256", b"pin-4471", sal_a, iteraciones)
    print(f"{iteraciones:>7} iteraciones: {time.perf_counter() - inicio:.4f} s")
```

```text
$ python3 hash_demo.py
sha256 pin-4471: 52d89bdfa6d0a8ca
sha256 pin-4472: 3faae6950f6382e5
sha256 pin-4471: 52d89bdfa6d0a8ca
pbkdf2 con sal A: 34e47c8a48aceeb1
pbkdf2 con sal B: c2e3787de97ccbdc
      1 iteraciones: 0.0000 s
 600000 iteraciones: 0.0993 s
```

**Explicación por partes.**
- Líneas 5–7: se muestran solo los primeros 16 caracteres hexadecimales. La línea 7 repite la 5 y da lo mismo.
- Líneas 9–10: dos sales fijas, solo para que la salida sea reproducible. En producción salen de `secrets`.
- Líneas 11–13: `pbkdf2_hmac` recibe el algoritmo, la clave en bytes (`b"…"`), la sal y las iteraciones.
- Líneas 15–18: el tiempo crece con las iteraciones. Tus segundos serán otros; la proporción se mantiene.

> **Error común.** Pasar la contraseña como texto. `hashlib.pbkdf2_hmac('sha256', 'pin-4471', sal, 1000)` termina con
> `TypeError: a bytes-like object is required, not 'str'`. Las funciones criptográficas trabajan con bytes: convierte
> con `password.encode()`, que usa UTF-8 (Módulo 1, Tema 5).

#### Problema resuelto 2.2
Implementa registro, inicio de sesión, sesiones y autorización para conductores y administradores, y prueba cada
camino negativo.

**Razonamiento:**
1. Registrar guarda rol, sal aleatoria y clave derivada; nunca la contraseña.
2. El login compara en tiempo constante, cuenta fallos y bloquea 30 segundos al tercero.
3. Cada acción llama primero a `sesion_activa`, luego revisa el rol y por último el recurso.
4. Probar a propósito: otro conductor, token inventado, rol equivocado, bloqueo, expiración y revocación.

```python
# acceso.py — contraseñas derivadas, sesiones y autorización de RutaFlow
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

```text
$ python3 acceso.py
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

**Explicación por partes.**
- Líneas 15–21: `secrets.token_bytes(16)` da 16 bytes aleatorios de calidad criptográfica para la sal.
- Líneas 29–30 y 38: usuario inexistente y clave errada dan el **mismo** mensaje, `credenciales inválidas`.
- Línea 32: `hmac.compare_digest` compara sin cortar en el primer byte distinto.
- Líneas 33–37: el tercer fallo fija `BLOQUEOS` 30 segundos en el futuro; la línea 26 lo hace cumplir.
- Líneas 40–41: el token es aleatorio y la sesión vence en 900 segundos (15 minutos).
- Líneas 49–51: una sesión vencida se borra al detectarla.
- Líneas 57–60: primero el rol, después la asignación del envío. Las dos comprobaciones viven en el servidor.
- Líneas 102 y 107: el programa simula el paso del tiempo y la revocación para probar los dos rechazos.

> **Error común.** Comparar el hash guardado con `==` y mezclar tipos. Además de no ser de tiempo constante, si uno
> de los valores es texto `hmac.compare_digest(b'abc', 'abc')` lanza
> `TypeError: a bytes-like object is required, not 'str'`. Guarda y compara siempre bytes con bytes.

> **Buena práctica.** Los mensajes de rechazo hacia el usuario son genéricos; el detalle va al registro de
> auditoría. El atacante no debe saber si falló el usuario o la clave.

#### Problema resuelto 2.3
Deja un registro de auditoría que detecte si alguien cambia o borra un evento.

**Razonamiento:**
1. Cada evento guarda el sello del anterior en `prev`; el primero apunta a 64 ceros.
2. El sello es el SHA-256 del evento serializado siempre igual: JSON con claves ordenadas y sin espacios.
3. Verificar es recorrer la cadena y recalcular cada sello.

```python
# auditoria.py — registro de auditoría encadenado con SHA-256
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

```text
$ python3 auditoria.py
eventos: 3
cadena inicial: válida=True (sin cortes)
tras alterar el evento 2: válida=False (corte en 2: contenido alterado)
tras borrar el evento 2: válida=False (corte en 3: prev no coincide)
atacante que recalcula toda la cadena: válida=True (sin cortes)
```

**Explicación por partes.**
- Líneas 8–9: `sort_keys=True` y `separators` producen siempre los mismos bytes para el mismo diccionario.
- Líneas 12–14: el sello cubre todos los campos, incluido `prev`; así cada evento queda atado al anterior.
- Líneas 29–32: dos fallas distintas: un enlace roto (borrado) o un contenido que no coincide (alteración).
- Líneas 60–61: la última línea es la lección incómoda. Quien puede reescribir todo recalcula la cadena y pasa.
- Por eso se guarda el último sello fuera del sistema, o se firma con una clave que el atacante no tiene (Ejercicio 3).

> **Prevenir errores.** Registra también los intentos denegados, como el evento 2. Una racha de
> `intento_denegado` sobre el mismo envío es la señal temprana de un abuso.

#### Checkpoint 2.1
Un conductor con sesión válida pide `confirmar(token, "RF-5000")` y recibe un rechazo. ¿Falló la autenticación o
la autorización? ¿Qué código HTTP corresponde?

Respuesta: la autorización por objeto. La sesión es válida y el rol es correcto, pero el envío no está asignado a
ese conductor. Corresponde un 403, no un 401.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/seguridad/tema2` y entra en ella. Escribe `hash_demo.py` y ejecútalo dos veces: las huellas SHA-256
y PBKDF2 deben repetirse; los tiempos, no.

#### Paso 2 · Acceso con pruebas negativas
Escribe `acceso.py` y ejecútalo. Debes ver nueve líneas; siete empiezan con un caso y terminan en un rechazo
explicado. Si alguna dice que el acceso se concedió cuando no debía, revisa el orden de las comprobaciones.

#### Paso 3 · Mide el costo
Cambia `ITERACIONES` a `1_000` y ejecuta `time python3 acceso.py`. Vuelve a `600_000` y repite. Anota los dos
tiempos: ese es el costo que también paga un atacante por cada clave que prueba.

#### Paso 4 · Audita
Escribe `auditoria.py` y confirma las cinco líneas de salida. Explica con tus palabras por qué la última dice
`válida=True`.

#### Resumen
- La **identidad** dice quién eres; la **autenticación** lo comprueba; la **autorización** decide qué puedes hacer.
- Las contraseñas se guardan como **función de derivación de claves** con **sal** única, nunca en claro ni con un **hash criptográfico** rápido.
- La comparación se hace con `hmac.compare_digest`, en tiempo constante y con bytes en ambos lados.
- Una **sesión** usa un token aleatorio, expira y se puede revocar desde el servidor.
- El **control de acceso por roles** no basta: la **autorización por objeto** comprueba que el recurso es tuyo.
- Un **registro de auditoría** encadenado detecta alteraciones y borrados, si el último sello se guarda aparte.

#### Ejercicio verificable 1
Básico. En `acceso.py`, ¿qué imprime `login("c-404", "x")` y por qué ese mensaje es el correcto?

Respuesta esperada: lanza `PermissionError: credenciales inválidas`, el mismo texto que una clave errada (líneas 29–30).
Si dijera «usuario no existe», un atacante podría enumerar qué identidades son reales.

#### Ejercicio verificable 2
Intermedio. El curso pide scrypt. Reemplaza las dos llamadas a `pbkdf2_hmac` de `acceso.py` por
`hashlib.scrypt(password.encode(), salt=…, n=2**14, r=8, p=1)` y compara la salida con la original.

Respuesta esperada: las nueve líneas son idénticas (se comprobó con `diff`). Cambia el algoritmo, no el
comportamiento. scrypt además exige memoria (`n` y `r`), lo que encarece los ataques con tarjetas gráficas.

#### Ejercicio verificable 3
Reto. Haz que el atacante del final de `auditoria.py` falle: sella con HMAC-SHA256 y una clave del servidor en vez
de SHA-256 solo. Luego simula a un atacante que recalcula la cadena con una clave adivinada.

Respuesta esperada: en `sello` usa `hmac.new(CLAVE, canonico(payload), hashlib.sha256).hexdigest()`. Las cinco
líneas originales no cambian (quien recompone con `encadenar` usa la clave verdadera), y el atacante con
`b"adivinada"` obtiene `atacante sin la clave: válida=False (corte en 1: contenido alterado)`.

#### En el trabajo
Ningún equipo serio escribe su propio sistema de inicio de sesión desde cero: usa un proveedor de identidad o un
framework probado. Lo que sí escribe en cada servicio son las comprobaciones de autorización por objeto, y ahí
nace una de las fallas más reportadas en APIs: cambiar `/envios/4471` por `/envios/4472` y ver datos ajenos. El
registro de auditoría es lo que pide un cliente o un regulador cuando pregunta «¿quién vio estos datos?».

</details>

### Tema 3: Criptografía aplicada, TLS, claves y secretos · Avanzado · 90 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- elegir entre cifrado simétrico, cifrado asimétrico, firma digital y HMAC según lo que necesitas proteger;
- firmar un comando con HMAC y rechazar manipulación, repetición y claves desconocidas;
- verificar el certificado TLS de un servidor local, incluido el nombre de host, y leer por qué falla;
- demostrar que borrar un secreto no lo borra del historial de Git y detectarlo con un escáner que falla en CI.

**Conceptos clave:** cifrado simétrico, cifrado asimétrico, clave criptográfica, firma digital, HMAC, nonce, ataque de repetición, TLS, certificado, autoridad de certificación, secreto, rotación de claves

#### El problema
La app del conductor envía a RutaFlow el comando «entregué RF-4471, el PIN del destinatario es 837201». Ese mensaje
viaja por redes que no controlas, pasa por una cola y lo procesa otro servicio. Alguien podría leer el PIN, cambiarlo
o reenviar el mismo comando mañana. Y la clave para protegerlo, ¿dónde se guarda sin que termine en GitHub?

Este tema usa lo que ya conoces: **hash criptográfico** y `hmac.compare_digest` (Tema 2 de este módulo),
**cliente y servidor**, **puerto** y **DNS** (Módulo 3, Tema 1), **Git** y **commit** (Módulo 5, Tema 3) y
**código de salida** (Módulo 0, Tema 4). Aquí no se redefinen.

#### Glosario del tema

**cifrado simétrico**
- **Definición técnica:** algoritmo que cifra y descifra con la **misma** clave secreta; AES es el estándar actual.
- **En palabras sencillas:** un candado con una sola llave que abre y cierra; quien la tenga puede hacer las dos cosas.
- **Dónde se rompe la comparación:** con un candado ves que está cerrado; un texto cifrado con la clave equivocada a veces «descifra» basura sin avisar.
- **Ejemplo:** `openssl enc -aes-256-cbc` convierte `PIN 837201 para RF-4471` en `U2FsdGVkX1+ERM55…` y lo recupera con la misma clave.
- **Error típico:** creer que cifrar protege contra cambios; sin un MAC o un modo autenticado, alguien puede alterar el texto cifrado.

**cifrado asimétrico**
- **Definición técnica:** algoritmo con un par de claves: lo cifrado con la clave **pública** solo se descifra con la **privada**; RSA es el ejemplo clásico.
- **En palabras sencillas:** un buzón: cualquiera mete cartas por la ranura, solo quien tiene la llave las saca.
- **Dónde se rompe la comparación:** RSA solo cifra mensajes cortos; en la práctica cifra una clave simétrica y esta cifra los datos.
- **Ejemplo:** con `publica.pem` se cifra `pin.txt` (24 bytes) y sale `pin.rsa` de 256 bytes; descifrar con la pública responde `A private key is needed for this operation`.
- **Error típico:** enviar o subir la clave privada «para que el otro pueda cifrar»; al otro solo se le da la pública.

**clave criptográfica**
- **Definición técnica:** secuencia de bits secreta (o pública, en el par asimétrico) que parametriza un algoritmo criptográfico; su seguridad depende de su longitud y su aleatoriedad.
- **En palabras sencillas:** la combinación del candado; el algoritmo es público, la combinación no.
- **Dónde se rompe la comparación:** una contraseña humana no es una buena clave; se deriva con una función lenta (Tema 2) antes de usarla.
- **Ejemplo:** `firma.py` lee la clave `k-2026-10` de la variable de entorno `SECRETO_ACTUAL`.
- **Error típico:** inventar tu propio algoritmo «secreto»; la seguridad debe estar en la clave, no en esconder el método.

**firma digital**
- **Definición técnica:** valor calculado con la clave privada sobre el hash de un mensaje; cualquiera con la clave pública verifica autoría e integridad.
- **En palabras sencillas:** un sello personal que todos pueden revisar y nadie más puede imitar.
- **Dónde se rompe la comparación:** la firma no oculta el contenido; el mensaje firmado se sigue leyendo en claro.
- **Ejemplo:** `openssl dgst -sha256 -verify` responde `Verified OK` con el PIN original y `Verification failure` con el PIN cambiado.
- **Error típico:** verificar la firma contra otro archivo que el que se va a usar; se verifica exactamente lo que se procesa.

**HMAC**
- **Definición técnica:** código de autenticación de mensajes que combina una clave secreta compartida con una función hash; prueba integridad y origen entre partes que comparten la clave.
- **En palabras sencillas:** un sello que solo pueden poner y revisar quienes conocen la misma clave.
- **Dónde se rompe la comparación:** a diferencia de la firma digital, quien verifica también puede fabricar sellos; no sirve ante un tercero.
- **Ejemplo:** con el PIN cambiado a `999999`, `firma.py` responde `PIN alterado: False — firma inválida`.
- **Error típico:** calcular `sha256(clave + mensaje)` a mano en vez de `hmac.new`; esa construcción tiene ataques conocidos.

**nonce**
- **Definición técnica:** valor que se usa una sola vez (*number used once*) dentro de un mensaje o una operación criptográfica.
- **En palabras sencillas:** el número de un boleto: si llega dos veces, el segundo es una copia.
- **Dónde se rompe la comparación:** el servidor debe recordar los nonces vistos; si los olvida pronto, la copia vuelve a pasar.
- **Ejemplo:** `comando.json` trae `"nonce": "n-7f3a"`; la segunda vez, `firma.py` responde `nonce ya utilizado`.
- **Error típico:** usar un contador que se reinicia con cada despliegue; los nonces viejos vuelven a ser «nuevos».

**ataque de repetición**
- **Definición técnica:** reenvío de un mensaje legítimo, capturado antes, para que el receptor repita su efecto (*replay*).
- **En palabras sencillas:** fotocopiar un cheque firmado y cobrarlo otra vez.
- **Dónde se rompe la comparación:** la firma del mensaje repetido es perfecta; lo que delata la copia es el nonce o la hora.
- **Ejemplo:** `firma.py` rechaza la copia exacta con `nonce ya utilizado` y un comando de hace una hora con `timestamp fuera de ventana`.
- **Error típico:** proteger solo la integridad con HMAC y olvidar que un mensaje íntegro puede ser repetido.

**TLS**
- **Definición técnica:** protocolo que cifra y autentica un canal entre cliente y servidor; HTTPS es HTTP sobre TLS.
- **En palabras sencillas:** un tubo blindado entre tu app y el servidor, con la cédula del servidor revisada al entrar.
- **Dónde se rompe la comparación:** el tubo protege el tramo, no los extremos; si el servidor guarda el PIN en un log, TLS no lo salva.
- **Ejemplo:** `tls_cliente.py` imprime `CA correcta, nombre correcto: OK TLSv1.3 — RF-4471 en ruta`.
- **Error típico:** desactivar la verificación para «que funcione»; el canal sigue cifrado, pero puede ser con un impostor.

**certificado**
- **Definición técnica:** documento X.509 que une una clave pública con nombres (DNS o IP) y está firmado por una autoridad de certificación.
- **En palabras sencillas:** la cédula del servidor: dice cómo se llama y quién la expidió.
- **Dónde se rompe la comparación:** la cédula se mira a ojo; el certificado se verifica con criptografía y vence en una fecha exacta.
- **Ejemplo:** `openssl x509 … -ext subjectAltName` muestra `DNS:localhost, IP Address:127.0.0.1`.
- **Error típico:** comprobar que el certificado es válido sin comprobar que el nombre coincide con el host al que te conectas.

**autoridad de certificación**
- **Definición técnica:** entidad (CA) cuya clave privada firma certificados; el cliente confía en una lista de CA raíz y acepta lo que ellas firmen.
- **En palabras sencillas:** la registraduría que expide las cédulas; si no confías en ella, no confías en sus documentos.
- **Dónde se rompe la comparación:** cualquiera puede crear una CA propia, como en este laboratorio; vale solo para quien la agregue a su lista.
- **Ejemplo:** sin cargar `ca.pem`, el cliente responde `unable to get local issuer certificate`.
- **Error típico:** crear la CA sin la extensión `keyUsage`; Python 3.13 la rechaza con `CA cert does not include key usage extension`.

**secreto**
- **Definición técnica:** dato cuya divulgación compromete la seguridad: claves, contraseñas de servicio, tokens de API; se entrega al programa por el entorno o un gestor de secretos, nunca en el código.
- **En palabras sencillas:** la llave maestra; no se deja pegada en la puerta ni en una foto.
- **Dónde se rompe la comparación:** una llave perdida se cambia con la cerradura; un secreto publicado debe **rotarse**, porque ya se copió.
- **Ejemplo:** sin la variable de entorno, `firma.py` se niega a arrancar: `fallo: falta SECRETO_ACTUAL en el entorno`.
- **Error típico:** borrar el `.env` en un commit nuevo y creer que desapareció; `git log -p` lo sigue mostrando.

**rotación de claves**
- **Definición técnica:** reemplazo programado de una clave por otra nueva, con un identificador (*kid*) que dice cuál se usó en cada mensaje, y un periodo en que conviven ambas.
- **En palabras sencillas:** cambiar la clave del wifi cada cierto tiempo, avisando cuál es la nueva.
- **Dónde se rompe la comparación:** al rotar, los mensajes firmados con la clave vieja siguen llegando un rato; hay que aceptarlos sin volverlos eternos.
- **Ejemplo:** `SECRETOS` guarda `k-2026-10` y `k-2026-09`; un `kid` fuera de esa lista responde `kid desconocido: k-2025-01`.
- **Error típico:** rotar la clave sin `kid`; el receptor no sabe con cuál verificar y rechaza todo durante el cambio.

#### ► CÓMO FUNCIONA
Cada herramienta resuelve una pregunta distinta. Confundirlas es el error más caro de este tema.

| Necesitas | Herramienta | Quién tiene la clave |
|---|---|---|
| Que nadie lea los datos | Cifrado simétrico (AES) | Ambos extremos, la misma |
| Que cualquiera te envíe algo solo legible para ti | Cifrado asimétrico (RSA) | Tú la privada; todos la pública |
| Probar a terceros que tú lo escribiste | Firma digital | Tú la privada; todos verifican con la pública |
| Que dos servicios tuyos detecten cambios | HMAC | Ambos servicios, la misma |
| Proteger el tramo de red | TLS | El servidor; el cliente confía en la CA |

Para el comando de confirmación, RutaFlow combina tres capas. TLS protege el tramo. HMAC con `kid` prueba que el
comando salió de un servicio con la clave y no cambió. La ventana de tiempo y el nonce impiden repetirlo.

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

#### Problema resuelto 3.1
Cifra el PIN con una clave simétrica y con un par de claves RSA, y firma el archivo. Observa qué cambia en cada
ejecución y qué responde OpenSSL cuando algo no cuadra.

**Razonamiento:**
1. AES con una frase de paso: OpenSSL deriva la clave con PBKDF2 (`-pbkdf2`) y agrega una sal aleatoria.
2. Cifrar dos veces lo mismo debe dar textos distintos; descifrar con otra clave debe fallar.
3. RSA: generar el par, cifrar con la pública, descifrar con la privada.
4. Firmar con la privada, verificar con la pública, y verificar contra un archivo alterado.

Ejecuta en `~/labs/seguridad/tema3/cripto`:

```text
$ printf 'PIN 837201 para RF-4471\n' > pin.txt
$ openssl enc -aes-256-cbc -pbkdf2 -in pin.txt -out pin.enc -pass pass:clave-de-laboratorio
$ base64 pin.enc
U2FsdGVkX1+ERM55vt66sPA1iIx6Xjjx1qspkZFBUw1gbAKWN9o6h4+z/YAkg1Fb
$ openssl enc -aes-256-cbc -pbkdf2 -in pin.txt -pass pass:clave-de-laboratorio | base64
U2FsdGVkX18Raern+VUOYut+T/REcKv2DRunOo0KxsYOUZ3PEo44vvCUpETTh4oM
$ openssl enc -d -aes-256-cbc -pbkdf2 -in pin.enc -pass pass:clave-de-laboratorio
PIN 837201 para RF-4471
$ openssl enc -d -aes-256-cbc -pbkdf2 -in pin.enc -pass pass:otra-clave -out /dev/null
bad decrypt
40A7376A827F0000:error:1C800064:Provider routines:ossl_cipher_unpadblock:bad decrypt:../providers/implementations/ciphers/ciphercommon_block.c:124:
```

**Explicación por partes.**
- Los dos textos cifrados empiezan con `U2FsdGVkX1`, que es `Salted__` en base64: OpenSSL guarda la sal al inicio.
- Después de esos caracteres son distintos: la sal aleatoria cambia la clave efectiva en cada ejecución.
- Con `otra-clave`, el relleno final no cuadra y OpenSSL termina con `bad decrypt` y código de salida 1.
- La segunda línea del error trae una dirección hexadecimal que cambia en cada equipo; lo que importa es `bad decrypt`.

```text
$ openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -quiet -out privada.pem
$ openssl pkey -in privada.pem -pubout -out publica.pem
$ head -1 publica.pem
-----BEGIN PUBLIC KEY-----
$ openssl pkeyutl -encrypt -pubin -inkey publica.pem -pkeyopt rsa_padding_mode:oaep -in pin.txt -out pin.rsa
$ wc -c pin.txt pin.rsa
 24 pin.txt
256 pin.rsa
280 total
$ openssl pkeyutl -decrypt -inkey privada.pem -pkeyopt rsa_padding_mode:oaep -in pin.rsa
PIN 837201 para RF-4471
$ openssl dgst -sha256 -sign privada.pem -out pin.sig pin.txt
$ openssl dgst -sha256 -verify publica.pem -signature pin.sig pin.txt
Verified OK
$ printf 'PIN 999999 para RF-4471\n' > pin_alterado.txt
$ openssl dgst -sha256 -verify publica.pem -signature pin.sig pin_alterado.txt
40E78C9F3D7F0000:error:02000068:rsa routines:ossl_rsa_verify:bad signature:../crypto/rsa/rsa_sign.c:430:
40E78C9F3D7F0000:error:1C880004:Provider routines:rsa_verify:RSA lib:../providers/implementations/signature/rsa_sig.c:774:
Verification failure
$ openssl pkeyutl -decrypt -inkey publica.pem -pubin -pkeyopt rsa_padding_mode:oaep -in pin.rsa
A private key is needed for this operation
pkeyutl: Error initializing context
```

- `-quiet` evita los puntos de progreso de `genpkey`. La clave privada nunca sale de `privada.pem`.
- `rsa_padding_mode:oaep` elige el relleno moderno de RSA; el viejo (PKCS#1 v1.5) tiene ataques conocidos.
- `pin.rsa` mide 256 bytes, el tamaño de la clave de 2048 bits, aunque el mensaje tenga 24.
- La verificación con el archivo alterado termina en `Verification failure`; la firma no corresponde a ese contenido.
- La última orden demuestra el buzón: con la clave pública no se puede descifrar.

> **Error común.** Leer `bad decrypt` como «archivo dañado». Casi siempre significa clave o frase de paso
> equivocada, o un algoritmo distinto al usado al cifrar (por ejemplo, olvidar `-pbkdf2` en un lado). Revisa que
> las dos órdenes usen exactamente las mismas opciones.

#### Problema resuelto 3.2
Firma el comando de confirmación con HMAC y rechaza manipulación, repetición, mensajes viejos y claves
desconocidas. La clave actual llega por variable de entorno.

**Razonamiento:**
1. Serializar el comando de forma canónica para que emisor y receptor firmen los mismos bytes.
2. Verificar en orden: `kid` conocido, firma, ventana de 300 segundos y nonce no visto.
3. Fijar `AHORA` para que la salida sea reproducible; en producción se usa `time.time()`.

Crea `comando.json` en `~/labs/seguridad/tema3`:

```json
{
  "shipmentId": "RF-4471",
  "recipientPin": "837201",
  "timestamp": 1793414990,
  "nonce": "n-7f3a"
}
```

```python
# firma.py — firma HMAC del comando de confirmación con ventana y nonce
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

```text
$ python3 firma.py
fallo: falta SECRETO_ACTUAL en el entorno
$ export SECRETO_ACTUAL='clave-actual-de-laboratorio'
$ python3 firma.py
kid: k-2026-10
comando canónico: {"nonce":"n-7f3a","recipientPin":"837201","shipmentId":"RF-4471","timestamp":1793414990}
válido: True — aceptado
PIN alterado: False — firma inválida
replay del mismo nonce: False — nonce ya utilizado
timestamp viejo: False — timestamp fuera de ventana
kid desconocido: False — kid desconocido: k-2025-01
```

**Explicación por partes.**
- Línea 9: el llavero. La clave actual sale del entorno; la anterior queda para mensajes firmados antes de rotar.
- Líneas 13–14: sin la variable, el programa se niega a arrancar. Fallar ruidoso es mejor que firmar con una clave vacía.
- Líneas 17–18 y 21–22: JSON canónico y HMAC-SHA256 con la clave del `kid`.
- Líneas 27–28: un `kid` fuera del llavero se rechaza antes de calcular nada.
- Línea 29: la comparación es de tiempo constante, como en el Tema 2.
- Líneas 31–35: la ventana descarta mensajes viejos y el conjunto `vistos` descarta repetidos.
- Salida: el PIN alterado conserva la firma vieja, que ya no corresponde; por eso `firma inválida`.

> **Error común.** Ejecutar el programa en una terminal nueva sin la variable. La salida es
> `fallo: falta SECRETO_ACTUAL en el entorno` con código 1. `export` vale solo para la terminal donde lo escribiste.

> **Buena práctica.** El valor real del secreto vive en un gestor de secretos o en la configuración del servidor.
> El repositorio solo lleva un `.env.example` con el **nombre** de la variable y un valor de ejemplo inofensivo.

#### Problema resuelto 3.3
Levanta un servidor TLS en tu equipo con una CA propia y comprueba qué hace un cliente que verifica de verdad.

**Razonamiento:**
1. Crear una CA de laboratorio con `basicConstraints` y `keyUsage`, y un certificado de servidor para `localhost`.
2. Servir TLS en `127.0.0.1` con un puerto libre que elige el sistema operativo (puerto `0`).
3. Probar tres clientes: sin confiar en la CA, con la CA y el nombre correcto, y con la CA y otro nombre.

Crea `tls_cliente.py` en `~/labs/seguridad/tema3/tls`:

```python
# tls_cliente.py — servidor TLS local y tres clientes que verifican (o no) su certificado
import socket
import ssl
import threading

servidor_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
servidor_ctx.load_cert_chain("servidor.pem", "servidor.key")
escucha = socket.create_server(("127.0.0.1", 0))
puerto = escucha.getsockname()[1]


def atender():
    while True:
        conexion, _ = escucha.accept()
        try:
            with servidor_ctx.wrap_socket(conexion, server_side=True) as tls:
                tls.sendall(b"RF-4471 en ruta")
        except (ssl.SSLError, OSError):
            pass


threading.Thread(target=atender, daemon=True).start()


def probar(nombre, ctx, host):
    try:
        with socket.create_connection(("127.0.0.1", puerto)) as crudo:
            with ctx.wrap_socket(crudo, server_hostname=host) as tls:
                print(f"{nombre}: OK {tls.version()} — {tls.recv(100).decode()}")
    except ssl.SSLCertVerificationError as error:
        print(f"{nombre}: RECHAZADO — {error.verify_message}")


sin_ca = ssl.create_default_context()
con_ca = ssl.create_default_context(cafile="ca.pem")
probar("sin confiar en la CA", sin_ca, "localhost")
probar("CA correcta, nombre correcto", con_ca, "localhost")
probar("CA correcta, otro nombre", con_ca, "api.rutaflow.co")
```

Genera los certificados y ejecuta (la orden `<(…)` necesita Bash):

```text
$ openssl req -x509 -newkey rsa:2048 -nodes -keyout ca.key -out ca.pem -days 30 -subj "/CN=CA de laboratorio RutaFlow" -addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign" 2>/dev/null
$ openssl req -newkey rsa:2048 -nodes -keyout servidor.key -out servidor.csr -subj "/CN=localhost" 2>/dev/null
$ openssl x509 -req -in servidor.csr -CA ca.pem -CAkey ca.key -CAcreateserial -out servidor.pem -days 30 -extfile <(printf 'subjectAltName=DNS:localhost,IP:127.0.0.1')
Certificate request self-signature ok
subject=CN = localhost
$ openssl x509 -in servidor.pem -noout -subject -issuer -ext subjectAltName
subject=CN = localhost
issuer=CN = CA de laboratorio RutaFlow
X509v3 Subject Alternative Name: 
    DNS:localhost, IP Address:127.0.0.1
$ openssl verify -CAfile ca.pem servidor.pem
servidor.pem: OK
$ python3 tls_cliente.py
sin confiar en la CA: RECHAZADO — unable to get local issuer certificate
CA correcta, nombre correcto: OK TLSv1.3 — RF-4471 en ruta
CA correcta, otro nombre: RECHAZADO — Hostname mismatch, certificate is not valid for 'api.rutaflow.co'.
```

**Explicación por partes.**
- `openssl verify` responde `servidor.pem: OK`: la firma de la CA cuadra. Eso aún no dice nada del nombre.
- Líneas 6–9: el servidor carga su certificado y su clave privada; el puerto `0` pide uno libre.
- Líneas 12–19: el hilo atiende conexiones; si un cliente aborta el saludo TLS, la excepción se ignora.
- Línea 28: `server_hostname` es el nombre que el cliente **espera**; Python lo compara con el certificado.
- Línea 34: el contexto por defecto confía en las CA del sistema, no en la tuya: `unable to get local issuer certificate`.
- Línea 35: con `cafile="ca.pem"` la cadena se acepta. Con otro nombre, `Hostname mismatch`.

> **Error común.** Crear la CA sin extensiones (`openssl req -x509 … -subj "/CN=…"` a secas). Python 3.13 activa
> verificación estricta y los dos clientes que cargan esa CA responden `CA cert does not include key usage extension`. Agrega
> `-addext "basicConstraints=critical,CA:TRUE" -addext "keyUsage=critical,keyCertSign,cRLSign"`.

> **Prevenir errores.** Nunca «arregles» un error de certificado con `ssl.CERT_NONE`. Python incluso lo impide si
> `check_hostname` sigue activo: `ValueError: Cannot set verify_mode to CERT_NONE when check_hostname is enabled.`
> La corrección es darle al cliente la CA correcta, no apagar la verificación.

#### Problema resuelto 3.4
Demuestra que un secreto borrado sigue en el historial de Git y escribe un escáner que falle cuando lo encuentra.

**Razonamiento:**
1. Hacer un commit con `.env`, borrarlo en un segundo commit y buscarlo con `git log -p`.
2. El escáner lee texto por la entrada estándar, busca patrones de secreto y termina con código 1 si encuentra algo.
3. Ese código de salida es lo que hace fallar un paso de CI (Módulo 5, Tema 4).

```python
# escanear.py — busca secretos en un texto (archivo o historial de Git) leído por la entrada estándar
import re
import sys

PATRONES = {
    "asignación de secreto": re.compile(r"(?i)\b(secret|secreto|password|clave|api_key|token)\w*\s*[=:]\s*['\"]?([^\s'\"]{12,})"),
    "clave privada PEM": re.compile(r"-----BEGIN (?:RSA |EC )?PRIVATE KEY-----"),
}

hallazgos = 0
for numero, linea in enumerate(sys.stdin, start=1):
    for nombre, patron in PATRONES.items():
        coincidencia = patron.search(linea)
        if coincidencia:
            valor = coincidencia.group(coincidencia.lastindex or 0)
            visible = valor[:4] + "…" if coincidencia.lastindex else "(bloque PEM)"
            print(f"línea {numero}: {nombre}: {visible}")
            hallazgos += 1
print(f"hallazgos: {hallazgos}")
sys.exit(1 if hallazgos else 0)
```

Ejecuta en `~/labs/seguridad/tema3/repo`. Para que tus hashes coincidan con los del libro, fija antes autor y fecha:

```bash
export GIT_AUTHOR_NAME=Estudiante GIT_AUTHOR_EMAIL=estudiante@example.com
export GIT_COMMITTER_NAME=Estudiante GIT_COMMITTER_EMAIL=estudiante@example.com
export GIT_AUTHOR_DATE=2026-11-24T10:00:00-05:00 GIT_COMMITTER_DATE=2026-11-24T10:00:00-05:00
```

```text
$ git init -q -b main
$ printf 'SECRETO_ACTUAL=clave-actual-de-laboratorio\n' > .env
$ printf 'print("RutaFlow")\n' > app.py
$ git add .env app.py
$ git commit -q -m "Configura la aplicación"
$ git rm -q .env
$ git commit -q -m "Quita el archivo de secretos"
$ ls -a
.
..
.git
app.py
$ git log --oneline
60c425c Quita el archivo de secretos
1ba9584 Configura la aplicación
$ git log -p --all -- .env | grep SECRETO
-SECRETO_ACTUAL=clave-actual-de-laboratorio
+SECRETO_ACTUAL=clave-actual-de-laboratorio
$ git log -p --all | python3 ../escanear.py; echo "código de salida: $?"
línea 13: asignación de secreto: clav…
línea 27: asignación de secreto: clav…
hallazgos: 2
código de salida: 1
$ python3 ../escanear.py < app.py; echo "código de salida: $?"
hallazgos: 0
código de salida: 0
```

**Explicación por partes.**
- `ls -a` ya no muestra `.env`, pero `git log -p` lo enseña dos veces: cuando se agregó (`+`) y cuando se borró (`-`).
- Línea 6: busca un nombre que parezca de secreto seguido de `=` o `:` y un valor de al menos 12 caracteres.
- Línea 7: detecta el encabezado de una clave privada en formato PEM.
- Línea 16: muestra solo los primeros 4 caracteres; un escáner no debe volver a filtrar el secreto en su propio log.
- Línea 20: el código de salida `1` hace fallar el paso de CI que lo ejecute.

> **Error común.** Creer que `git rm` o un `git commit --amend` posterior borran el secreto del remoto. Si ya
> hiciste `push`, otros pueden tenerlo clonado. El orden correcto es: **rotar** el secreto primero, luego limpiar el
> historial con herramientas como `git filter-repo`, y avisar al equipo.

#### Checkpoint 3.1
El servicio de facturación debe demostrar a un cliente externo que una factura salió de RutaFlow. ¿Usas HMAC o firma
digital? ¿Por qué?

Respuesta: firma digital. Con HMAC el cliente necesitaría la clave compartida, y entonces él también podría fabricar
facturas. Con la firma, RutaFlow guarda la privada y el cliente verifica con la pública.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Cifra y firma con OpenSSL
Crea `~/labs/seguridad/tema3/cripto`, entra y repite las órdenes del Problema resuelto 3.1. Confirma que tus textos
cifrados son distintos de los del libro y que los veredictos (`bad decrypt`, `Verified OK`, `Verification failure`)
son los mismos.

#### Paso 2 · Firma el comando
En `~/labs/seguridad/tema3`, escribe `comando.json` y `firma.py`. Ejecútalo sin la variable, luego con
`export SECRETO_ACTUAL='clave-actual-de-laboratorio'`, y compara con las siete líneas esperadas.

#### Paso 3 · Verifica TLS
Crea la carpeta `tls`, genera la CA y el certificado del servidor, y ejecuta `python3 tls_cliente.py`. Debes ver un
`OK TLSv1.3` y dos `RECHAZADO`.

#### Paso 4 · Encuentra el secreto
Crea la carpeta `repo`, repite la secuencia de Git y pasa el historial por `escanear.py`. Escribe en un archivo
`rotacion.txt` los tres pasos que harías si ese repositorio fuera público.

#### Resumen
- El **cifrado simétrico** usa una sola **clave criptográfica**; el **cifrado asimétrico** usa un par pública/privada.
- La **firma digital** prueba autoría ante terceros; el **HMAC** prueba integridad entre quienes comparten la clave.
- Un **nonce** y una ventana de tiempo frenan el **ataque de repetición**, que una firma sola no detiene.
- **TLS** protege el canal si el cliente verifica el **certificado**, su **autoridad de certificación** y el nombre de host.
- Un **secreto** se entrega por el entorno; si se publica, se rota antes de limpiar el historial.
- La **rotación de claves** usa un `kid` y un periodo en que conviven la clave nueva y la anterior.

#### Ejercicio verificable 1
Básico. Ejecuta `python3 escanear.py < cripto/privada.pem; echo $?` desde `~/labs/seguridad/tema3`. ¿Qué imprime?

Respuesta esperada: `línea 1: clave privada PEM: (bloque PEM)`, `hallazgos: 1` y el código `1`. El patrón de la
línea 7 reconoce el encabezado `-----BEGIN PRIVATE KEY-----` que escribe `genpkey`.

#### Ejercicio verificable 2
Intermedio. En `firma.py`, firma un comando nuevo con `kid` `k-2026-09` (la clave anterior) y nonce `n-rotacion`.
¿Se acepta? ¿Qué cambiarías el día que esa clave deba dejar de valer?

Respuesta esperada: se acepta (`True — aceptado`), porque `k-2026-09` sigue en `SECRETOS`. Para retirarla, se borra
del diccionario; desde entonces, cualquier sobre con ese `kid` responde `kid desconocido: k-2026-09`.

#### Ejercicio verificable 3
Reto. Agrega a `tls_cliente.py` un cuarto cliente que se conecte por IP: `probar("CA correcta, por IP", con_ca, "127.0.0.1")`.
Predice el resultado antes de ejecutar.

Respuesta esperada: `CA correcta, por IP: OK TLSv1.3 — RF-4471 en ruta`. El certificado incluye `IP Address:127.0.0.1`
en su `subjectAltName`; si generas el certificado solo con `DNS:localhost`, la respuesta pasa a
`RECHAZADO — IP address mismatch, certificate is not valid for '127.0.0.1'.`

#### En el trabajo
En una empresa no se escriben algoritmos criptográficos: se eligen bibliotecas auditadas y se configuran bien.
Los incidentes reales vienen de lo que rodea a la criptografía: claves en repositorios, verificación TLS
desactivada «temporalmente» y claves que nadie rota en años. Los equipos usan escáneres de secretos en cada pull
request y gestores de secretos con rotación automática; tu `escanear.py` es la versión mínima de esa práctica.

</details>

### Tema 4: Validación, vulnerabilidades web, privacidad y respuesta · Avanzado · 90 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- validar una entrada no confiable en el servidor y explicar por qué la validación sola no basta;
- provocar una inyección SQL en una base SQLite propia y corregirla con una consulta parametrizada;
- codificar la misma salida para HTML, atributo, JavaScript y URL, y reconocer un XSS;
- aplicar minimización, redacción y retención a datos personales, y medir el alcance de un incidente.

**Conceptos clave:** validación de entrada, inyección SQL, consulta parametrizada, XSS, codificación de salida, dato personal, privacidad, minimización de datos, redacción de datos, retención de datos, incidente de seguridad

#### El problema
Al entregar un paquete, el conductor escribe una nota libre: «dejado con el portero». Esa nota se guarda en la base,
se muestra en el panel del operador, viaja en una URL de búsqueda y queda en el log. En cada uno de esos lugares, un
texto malicioso puede convertirse en código. Y si la nota trae un teléfono, ya es un dato personal. ¿Cómo tratas
una entrada que no controlas en cada sitio por donde pasa?

Este tema usa lo que ya conoces: SQL y SQLite desde Python (Módulo 4, Temas 1 y 2), **HTML**, **formulario**,
**JavaScript** y **validación** del navegador (Módulo 3, Tema 3), **URL** (Módulo 3, Tema 1), **registro**
(Módulo 5, Tema 1) y **límite de confianza** (Tema 1 de este módulo). Aquí no se redefinen.

#### Glosario del tema

**validación de entrada**
- **Definición técnica:** comprobación en el servidor de que un dato recibido cumple el dominio esperado (tipo, longitud, formato, caracteres) antes de usarlo.
- **En palabras sencillas:** el control de calidad en la puerta de la bodega: lo que no cumple, no entra.
- **Dónde se rompe la comparación:** la validación del navegador (Módulo 3) se salta con `curl`; solo cuenta la que hace el servidor.
- **Ejemplo:** `validar.py` responde `'<img src=x onerror=alert(1)>': rechazada — contiene etiquetas`.
- **Error típico:** usar la validación como única defensa; una nota válida como `O'Brien` todavía rompe una consulta concatenada.

**inyección SQL**
- **Definición técnica:** vulnerabilidad en la que un dato del usuario se concatena en una sentencia SQL y el motor lo interpreta como parte de la sentencia.
- **En palabras sencillas:** le dictas una carta a alguien y el remitente cuela una orden dentro de su nombre.
- **Dónde se rompe la comparación:** en la carta el escribano dudaría; el motor SQL ejecuta sin preguntar todo lo que sea sintaxis válida.
- **Ejemplo:** con `dejado' OR '1'='1`, la consulta concatenada devuelve `2 filas` en vez de 0.
- **Error típico:** «escapar» comillas a mano con `replace`; siempre aparece un caso que se escapa del escape.

**consulta parametrizada**
- **Definición técnica:** sentencia SQL con marcadores (`?`) cuyos valores se envían aparte; el motor nunca los interpreta como SQL.
- **En palabras sencillas:** un formulario con casillas: lo que escribas en la casilla «nombre» nunca se lee como instrucción.
- **Dónde se rompe la comparación:** los marcadores sirven para valores, no para nombres de tabla o columna; esos se eligen de una lista fija.
- **Ejemplo:** con el mismo texto malicioso, la parametrizada responde `parametrizada: 0 filas`.
- **Error típico:** pasar un texto suelto en vez de una tupla: `sqlite3.ProgrammingError: Incorrect number of bindings supplied. The current statement uses 1, and there are 21 supplied.`

**XSS**
- **Definición técnica:** *cross-site scripting*: vulnerabilidad en la que un dato del usuario se inserta en una página sin codificar y el navegador lo ejecuta como JavaScript.
- **En palabras sencillas:** alguien deja una nota que, al leerla en pantalla, se convierte en un programa que actúa con tu sesión.
- **Dónde se rompe la comparación:** la nota se ve inofensiva en la base de datos; el daño ocurre en el navegador de otra persona.
- **Ejemplo:** `salida.py` muestra `sin codificar: <p>"><script>alert("RF")</script></p>`: el navegador ejecutaría ese `script`.
- **Error típico:** filtrar solo la palabra `script`; `<img onerror=…>` ejecuta código sin esa palabra.

**codificación de salida**
- **Definición técnica:** transformación de un dato al escribirlo en un contexto (HTML, atributo, JavaScript, URL) para que se lea como dato y no como sintaxis de ese contexto.
- **En palabras sencillas:** traducir la nota al idioma del lugar donde la pegas, para que nadie la confunda con una orden.
- **Dónde se rompe la comparación:** no es la codificación de caracteres del Módulo 1 (UTF-8); aquí se cambian símbolos como `<` por `&lt;`.
- **Ejemplo:** `html.escape` produce `&lt;script&gt;` y `quote` produce `%3Cscript%3E` para la misma nota.
- **Error típico:** usar la codificación de un contexto en otro; `html.escape` no protege dentro de un bloque `<script>`.

**dato personal**
- **Definición técnica:** información vinculada o vinculable a una persona natural identificada o identificable: nombre, cédula, teléfono, dirección, correo.
- **En palabras sencillas:** cualquier dato con el que se puede saber de quién se trata.
- **Dónde se rompe la comparación:** un dato suelto parece inofensivo; varios juntos (barrio, hora y edificio) identifican a alguien.
- **Ejemplo:** en `privacidad.py`, `cedula`, `fecha_nacimiento` y `telefono` son datos personales del formulario.
- **Error típico:** creer que un teléfono escrito dentro de una nota libre «no cuenta»: sigue siendo un dato personal.

**privacidad**
- **Definición técnica:** derecho de las personas a controlar qué datos suyos se recogen, para qué se usan, quién los ve y cuánto tiempo se guardan; en Colombia lo regula la Ley 1581 de 2012.
- **En palabras sencillas:** que tu información se use solo para lo que aceptaste y nada más.
- **Dónde se rompe la comparación:** seguridad y privacidad no son lo mismo: un sistema seguro puede violar la privacidad si recoge datos que no necesita.
- **Ejemplo:** `privacidad.py` aplica tres decisiones de privacidad: descartar campos, redactar logs y borrar lo vencido.
- **Error típico:** pedir permiso «para todo» en un texto largo; el uso debe tener un fin concreto.

**minimización de datos**
- **Definición técnica:** principio de recoger y conservar solo los datos estrictamente necesarios para la finalidad declarada.
- **En palabras sencillas:** no guardes lo que no vas a usar; lo que no tienes, no se te puede filtrar.
- **Dónde se rompe la comparación:** la nota libre puede traer datos que nunca pediste; minimizar también es limpiar lo que llega sin querer.
- **Ejemplo:** `privacidad.py` imprime `descartados: ['cedula', 'fecha_nacimiento', 'telefono']`.
- **Error típico:** guardar «por si acaso» la cédula para un servicio que solo necesita la ciudad.

**redacción de datos**
- **Definición técnica:** reemplazo de un dato sensible por una versión parcial o un marcador antes de escribirlo en un log, un reporte o una pantalla.
- **En palabras sencillas:** tachar con marcador negro lo que el lector no necesita ver.
- **Dónde se rompe la comparación:** un tachón en papel no se quita; un dato redactado mal (solo los dos últimos dígitos) puede reconstruirse.
- **Ejemplo:** `log: entrega RF-4471: llamar al 310******* antes de subir`.
- **Error típico:** redactar con una expresión regular que no cubre todos los formatos; `+57 310 456 7890` se escapa del patrón de este tema.

**retención de datos**
- **Definición técnica:** periodo máximo durante el cual se conserva un dato; al vencer, se borra o se anonimiza de forma verificable.
- **En palabras sencillas:** la fecha de vencimiento del dato.
- **Dónde se rompe la comparación:** un producto vencido se ve; un dato vencido sigue igual de útil para un atacante.
- **Ejemplo:** con 30 días al 2026-11-24, `privacidad.py` conserva `2 de 3` registros.
- **Error típico:** borrar de la base y olvidar las copias de seguridad y los logs, donde el dato sigue vivo.

**incidente de seguridad**
- **Definición técnica:** evento que compromete o pudo comprometer la confidencialidad, integridad o disponibilidad de un activo, y que exige respuesta documentada.
- **En palabras sencillas:** algo salió mal con datos o sistemas y hay que actuar, medir y explicar.
- **Dónde se rompe la comparación:** no todo incidente es un ataque; un log que guarda teléfonos completos por error también lo es.
- **Ejemplo:** `incidente.py` mide `líneas con teléfono completo: 3 de 4` y `personas distintas expuestas: 2`.
- **Error típico:** corregir el código y no medir el alcance: sin saber cuántas personas y qué fechas, no hay respuesta posible.

#### ► CÓMO FUNCIONA
La nota cruza el límite de confianza en cuanto llega al servidor. Desde ahí se aplican defensas en capas, cada una
en su lugar. **Validar** al entrar reduce lo que llega. **Parametrizar** al consultar separa estructura y dato.
**Codificar** al mostrar adapta el dato a cada contexto. **Minimizar, redactar y retener** al registrar protege a las
personas cuyos datos aparecen.

| Lugar | Riesgo | Defensa | Función en Python |
|---|---|---|---|
| Entrada | Datos fuera de dominio | Validación de entrada | Tu función `validar` |
| Base de datos | Inyección SQL | Consulta parametrizada | `db.execute(sql, (valor,))` |
| HTML | XSS | Codificación de salida | `html.escape` |
| JavaScript | XSS | Codificación de salida | `json.dumps` + `<` como `<` |
| URL | Parámetros rotos o inyectados | Codificación de salida | `urllib.parse.quote` |
| Log | Exposición de datos personales | Redacción y retención | `re.sub`, comparación de fechas |

```mermaid
flowchart TD
    IN["nota del conductor<br/>entrada no confiable"] --> VAL{"validar dominio<br/>1-200, sin etiquetas"}
    VAL -->|"válida"| DB["consulta parametrizada<br/>estructura separada del dato"]
    VAL -->|"inválida"| REJ["rechazar con motivo"]
    DB --> OUT{"codificar según contexto"}
    OUT --> H["texto HTML<br/>html.escape"]
    OUT --> A["atributo<br/>quote=True"]
    OUT --> J["JavaScript<br/>json.dumps"]
    OUT --> U["URL<br/>urllib.parse.quote"]
    DB --> LOG["log"]
    LOG --> RED["redactar datos personales<br/>+ retención"]
    RED -.-> INC["si algo falló:<br/>medir alcance del incidente"]
```

#### Problema resuelto 4.1
Valida la nota del conductor: no vacía, máximo 200 caracteres y sin etiquetas.

**Razonamiento:**
1. Cada regla devuelve un motivo distinto, para que el conductor sepa qué corregir.
2. `strip()` quita espacios: una nota de solo espacios cuenta como vacía.
3. Probar con un caso válido y uno por cada regla.

```python
# validar.py — valida la nota del conductor antes de guardarla
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

```text
$ python3 validar.py
'dejado con el portero': válida
'<img src=x onerror=alert(1)>': rechazada — contiene etiquetas
'aaaaaaaaaaaaaaaaaaaaaaaaaaa...': rechazada — supera 200 caracteres
'   ': rechazada — vacía
```

**Explicación por partes.**
- Líneas 3–8: tres reglas en orden; la primera que falla devuelve su motivo.
- Línea 9: `None` significa «sin errores» (Módulo 2, Tema 1).
- Línea 20: las notas largas se recortan al mostrarlas para que la salida sea legible.
- La validación reduce la superficie, pero no reemplaza las defensas de los dos problemas siguientes.

#### Problema resuelto 4.2
En una base SQLite en memoria, compara la consulta concatenada con la parametrizada usando dos textos maliciosos.
Es un laboratorio: la base y los datos son tuyos y desaparecen al terminar el programa.

**Razonamiento:**
1. Crear la tabla `notas` con dos filas, insertadas ya con parámetros.
2. Para cada texto, ejecutar las dos versiones de la misma búsqueda y contar las filas.
3. Incluir un texto normal como control: las dos versiones deben coincidir con él.

```python
# inyeccion.py — laboratorio local: consulta concatenada frente a consulta parametrizada
import sqlite3

db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE notas (id INTEGER PRIMARY KEY, texto TEXT)")
db.executemany("INSERT INTO notas (texto) VALUES (?)", [("dejado con el portero",), ("entregado en recepción",)])

payloads = [
    "dejado con el portero",
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

```text
$ python3 inyeccion.py
payload: dejado con el portero
  parametrizada: 1 filas
  concatenada:   1 filas -> [(1, 'dejado con el portero')]
payload: dejado' OR '1'='1
  parametrizada: 0 filas
  concatenada:   2 filas -> [(1, 'dejado con el portero'), (2, 'entregado en recepción')]
payload: x' UNION SELECT 99, 'dato filtrado' --
  parametrizada: 0 filas
  concatenada:   1 filas -> [(99, 'dato filtrado')]
```

**Explicación por partes.**
- Línea 4: `":memory:"` crea una base que vive solo mientras corre el programa.
- Línea 14: el `?` recibe el valor por la tupla `(payload,)`. El motor busca ese texto literal y no encuentra nada.
- Línea 15: la cadena f pega el texto dentro de la sentencia. La comilla del atacante cierra la cadena SQL.
- Segundo caso: la sentencia queda `WHERE texto = 'dejado' OR '1'='1'`, verdadera para todas las filas.
- Tercer caso: `UNION SELECT` agrega una fila inventada por el atacante, y `--` comenta el resto de la sentencia.

> **Error común.** Concatenar un texto legítimo con apóstrofo. Con la nota `portero's` en la línea 15, el programa
> termina con `sqlite3.OperationalError: near "s": syntax error`. No es mala suerte: es la misma vulnerabilidad,
> descubierta por un usuario honesto.

> **Buena práctica.** Toda sentencia con un valor variable usa `?`, sin excepciones, aunque el valor «venga de
> dentro». Así la regla se revisa con una búsqueda: `grep -n 'execute(f"' *.py` debe dar cero resultados.

#### Problema resuelto 4.3
Muestra la misma nota maliciosa en cuatro contextos y codifícala para cada uno.

**Razonamiento:**
1. Partir de una nota que cierra un atributo (`">`) y abre un `script`.
2. Para HTML y atributos, `html.escape` cambia `<`, `>`, `&` y comillas por entidades.
3. Dentro de `<script>`, el dato va como literal JSON, y `<` se escribe `<` para que `</script>` no cierre el bloque.
4. En una URL, `quote` con `safe=''` codifica también `/`.

```python
# salida.py — la misma nota, codificada según el contexto donde se muestra
import html
import json
from urllib.parse import quote

nota = '"><script>alert("RF")</script>'

print("sin codificar:", f"<p>{nota}</p>")
print("texto HTML:   ", f"<p>{html.escape(nota)}</p>")
print("atributo:     ", f'<input value="{html.escape(nota, quote=True)}">')
print("JavaScript:   ", f"<script>const nota = {json.dumps(nota).replace('<', '\\u003c')};</script>")
print("URL:          ", f"/buscar?nota={quote(nota, safe='')}")
```

```text
$ python3 salida.py
sin codificar: <p>"><script>alert("RF")</script></p>
texto HTML:    <p>&quot;&gt;&lt;script&gt;alert(&quot;RF&quot;)&lt;/script&gt;</p>
atributo:      <input value="&quot;&gt;&lt;script&gt;alert(&quot;RF&quot;)&lt;/script&gt;">
JavaScript:    <script>const nota = "\">\u003cscript>alert(\"RF\")\u003c/script>";</script>
URL:           /buscar?nota=%22%3E%3Cscript%3Ealert%28%22RF%22%29%3C%2Fscript%3E
```

**Explicación por partes.**
- Línea 8: la versión sin codificar inserta un `script` real en la página: eso es un XSS.
- Líneas 9–10: en HTML el navegador muestra `"><script>…` como texto, sin ejecutarlo.
- Línea 11: `json.dumps` pone comillas y escapa las internas; el reemplazo de `<` evita cerrar el bloque `script`.
- Línea 12: `%22`, `%3E`, `%3C` son las comillas y los signos codificados para URL.

> **Error común.** Construir el HTML con una cadena f sin codificar. La primera línea de la salida es lo que
> llegaría al navegador: un `<script>` ejecutable. Los motores de plantillas modernos codifican por defecto; la falla
> aparece cuando alguien desactiva esa protección para «mostrar formato».

#### Problema resuelto 4.4
Aplica minimización, redacción y retención a un envío, y mide el alcance de un log viejo que guardó teléfonos.

**Razonamiento:**
1. Minimizar: quedarse solo con los campos que la entrega necesita.
2. Redactar: dejar los tres primeros dígitos del celular y ocultar correos antes de escribir el log.
3. Retener: conservar solo registros de los últimos 30 días contados desde una fecha fija.
4. Ante el log viejo: contar líneas, personas y fechas afectadas antes de decidir la respuesta.

```python
# privacidad.py — minimizar, redactar y retener datos personales de RutaFlow
import re
from datetime import date, timedelta

HOY = date(2026, 11, 24)
RETENCION = timedelta(days=30)
CAMPOS_NECESARIOS = {"guia", "ciudad", "nota"}

formulario = {
    "guia": "RF-4471", "ciudad": "Bogotá", "nota": "llamar al 3104567890 antes de subir",
    "cedula": "1020304050", "fecha_nacimiento": "1994-03-02", "telefono": "3104567890",
}
registro = {k: v for k, v in formulario.items() if k in CAMPOS_NECESARIOS}
print("descartados:", sorted(set(formulario) - set(registro)))

TELEFONO = re.compile(r"\b3\d{9}\b")
CORREO = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.]+\b")


def redactar(texto):
    texto = TELEFONO.sub(lambda m: m.group()[:3] + "*******", texto)
    return CORREO.sub("[correo]", texto)


print("log:", redactar(f"entrega {registro['guia']}: {registro['nota']}"))
print("log:", redactar("cliente ana.p@correo.example pidió factura"))

logs = [
    (date(2026, 10, 1), "entrega RF-4102"),
    (date(2026, 10, 30), "entrega RF-4388"),
    (date(2026, 11, 20), "entrega RF-4471"),
]
vigentes = [(d, t) for d, t in logs if HOY - d <= RETENCION]
print(f"retención 30 días: se conservan {len(vigentes)} de {len(logs)}:", [t for _, t in vigentes])
```

```text
$ python3 privacidad.py
descartados: ['cedula', 'fecha_nacimiento', 'telefono']
log: entrega RF-4471: llamar al 310******* antes de subir
log: cliente [correo] pidió factura
retención 30 días: se conservan 2 de 3: ['entrega RF-4388', 'entrega RF-4471']
```

```python
# incidente.py — mide el alcance de un log que guardó teléfonos completos
import re

TELEFONO = re.compile(r"\b3\d{9}\b")
log_viejo = [
    "2026-11-20 entrega RF-4471: llamar al 3104567890",
    "2026-11-20 entrega RF-4472: dejado con el portero",
    "2026-11-21 entrega RF-4480: timbre dañado, 3157778899",
    "2026-11-21 entrega RF-4481: llamar al 3104567890 otra vez",
]
afectadas = [linea for linea in log_viejo if TELEFONO.search(linea)]
telefonos = {t for linea in afectadas for t in TELEFONO.findall(linea)}
print(f"líneas con teléfono completo: {len(afectadas)} de {len(log_viejo)}")
print(f"personas distintas expuestas: {len(telefonos)}")
print("fechas afectadas:", sorted({linea[:10] for linea in afectadas}))
```

```text
$ python3 incidente.py
líneas con teléfono completo: 3 de 4
personas distintas expuestas: 2
fechas afectadas: ['2026-11-20', '2026-11-21']
```

**Explicación por partes.**
- `privacidad.py`, línea 13: la comprensión de diccionario conserva solo las claves de `CAMPOS_NECESARIOS`.
- Línea 16: un celular colombiano de este ejemplo es `3` seguido de 9 dígitos; `\b` exige que no esté pegado a otros dígitos.
- Línea 21: la función dentro de `sub` recibe cada coincidencia y devuelve su versión redactada.
- Línea 33: `HOY - d` es un `timedelta`; los registros de más de 30 días quedan fuera.
- `incidente.py`, líneas 11–12: las líneas afectadas y el **conjunto** de teléfonos distintos; el repetido cuenta una vez.
- Esas tres cifras (líneas, personas, fechas) son la base del informe del incidente.

> **Prevenir errores.** Redacta en el punto donde se escribe el log, no en cada llamada. Un formateador o filtro de
> `logging` que redacta siempre evita que un desarrollador nuevo olvide hacerlo.

#### Checkpoint 4.1
Una nota pasa `validar` y se guarda con consulta parametrizada. ¿Ya puedes mostrarla en el panel sin más?

Respuesta: no. Validar y parametrizar protegen la entrada y la base; al mostrarla hay que codificar para el contexto
del panel (HTML, atributo, JavaScript o URL). Cada defensa protege un lugar distinto.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Valida
Crea `~/labs/seguridad/tema4`, escribe `validar.py` y confirma las cuatro líneas de salida. Agrega un quinto caso con
la nota `O'Brien recibió` y comprueba que es válida.

#### Paso 2 · Inyecta en tu laboratorio
Escribe `inyeccion.py` y ejecútalo. Confirma que la columna concatenada devuelve `2 filas` y `1 filas` en los casos
maliciosos, y que la parametrizada devuelve `0 filas`.

#### Paso 3 · Codifica
Escribe `salida.py`. Copia la línea `texto HTML` a un archivo `nota.html`, ábrelo en el navegador y comprueba que ves
el texto y no una alerta.

#### Paso 4 · Protege los datos personales
Escribe `privacidad.py` e `incidente.py`. En un archivo `incidente.txt`, anota las cifras del alcance y una acción
para cada una: borrar o redactar las líneas, revisar copias y avisar a quien corresponda.

#### Resumen
- La **validación de entrada** se hace en el servidor y reduce lo que llega, pero no es la única defensa.
- La **inyección SQL** nace de concatenar; la **consulta parametrizada** la elimina separando sentencia y valor.
- El **XSS** ejecuta código en el navegador de otra persona; la **codificación de salida** depende del contexto.
- Un **dato personal** identifica a alguien; la **privacidad** decide qué se recoge, para qué y por cuánto tiempo.
- **Minimización de datos**, **redacción de datos** y **retención de datos** reducen lo que un error o un ataque puede exponer.
- Un **incidente de seguridad** se mide (líneas, personas, fechas) antes de responder.

#### Ejercicio verificable 1
Básico. Agrega a `payloads` el texto `x' OR 1=1 --` y predice las dos líneas de filas antes de ejecutar.

Respuesta esperada: `parametrizada: 0 filas` y `concatenada:   2 filas -> [(1, 'dejado con el portero'), (2, 'entregado en recepción')]`.
`OR 1=1` es siempre verdadero y `--` comenta la comilla que sobraba.

#### Ejercicio verificable 2
Intermedio. Pasa por `redactar` el texto `llamar al 3104567890 o al +57 310 456 7890`. ¿Qué sale y qué harías?

Respuesta esperada: `llamar al 310******* o al +57 310 456 7890`. El segundo formato tiene espacios y prefijo, y el
patrón de la línea 16 no lo reconoce. Hay que ampliar el patrón y, mejor aún, minimizar: no copiar la nota libre al log.

#### Ejercicio verificable 3
Reto. En `incidente.py`, aplica `redactar` (cópiala de `privacidad.py`) a cada línea de `log_viejo` y vuelve a medir.
¿Qué cifras salen?

Respuesta esperada: `líneas con teléfono completo: 0 de 4`, `personas distintas expuestas: 0` y `fechas afectadas: []`.
Esa segunda medición es la evidencia de que la contención funcionó; se guarda junto al informe del incidente.

#### En el trabajo
La inyección SQL y el XSS siguen en las listas de fallas más frecuentes de aplicaciones web, como el OWASP Top 10.
En un equipo, las defensas se vuelven reglas automáticas: un linter que prohíbe SQL concatenado, plantillas que
codifican por defecto y filtros de log que redactan. Las leyes de protección de datos exigen además saber qué datos
personales guardas, para qué y hasta cuándo, y poder responder con cifras cuando algo sale mal.

</details>

### Tema 5: Ingeniería social, phishing y respuesta: analizar el correo, no solo mirarlo · Avanzado · 75 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- comparar el remitente visible de un correo con sus cabeceras reales y con el destino de sus enlaces;
- distinguir un dominio parecido, un homógrafo y un punycode del dominio legítimo por su dominio registrable;
- interpretar los resultados de SPF, DKIM y DMARC de la cabecera `Authentication-Results`;
- seguir un runbook de respuesta y medir una campaña de concienciación sin sacar conclusiones de muestras pequeñas.

**Conceptos clave:** ingeniería social, phishing, cabeceras de correo, suplantación de remitente, dominio parecido, homógrafo, punycode, dominio registrable, SPF, DKIM, DMARC, runbook

#### El problema
Una coordinadora de RutaFlow recibe a las 7:58 un correo de «Soporte RutaFlow»: su cuenta será suspendida en 24
horas si no verifica sus datos en el enlace `rutaflow.co`. El logo es el correcto y el tono también. Mirarlo no
basta: el correo se ve igual que uno real. ¿Qué datos del correo, que el lector normal no ve, delatan el engaño?

Este tema usa lo que ya conoces: **URL** y **DNS** (Módulo 3, Tema 1), **cabecera** y **HTML** (Módulo 3, Temas 2 y
3), **punto de código** y **UTF-8** (Módulo 1, Tema 5), **sesión** (Tema 2 de este módulo), **firma digital**
(Tema 3) e **incidente de seguridad** (Tema 4). Aquí no se redefinen.

#### Glosario del tema

**ingeniería social**
- **Definición técnica:** manipulación psicológica que lleva a una persona a revelar información o ejecutar una acción que favorece al atacante.
- **En palabras sencillas:** engañar a la persona en vez de romper el sistema.
- **Dónde se rompe la comparación:** no es un descuido del usuario; los mensajes se diseñan para personas atentas y explotan urgencia, autoridad y miedo.
- **Ejemplo:** el correo `typosquat` combina urgencia y miedo: `analizar.py` detecta `urgente, suspendida, 24 horas, verifique`.
- **Error típico:** responder a un incidente culpando a quien hizo clic; así nadie vuelve a reportar.

**phishing**
- **Definición técnica:** ataque de ingeniería social por mensajes (correo, SMS, chat) que suplantan a una entidad para robar credenciales, dinero o instalar programas.
- **En palabras sencillas:** un anzuelo con forma de mensaje oficial.
- **Dónde se rompe la comparación:** el pescador lanza a ciegas; el phishing dirigido usa nombres, cargos y proyectos reales de la víctima.
- **Ejemplo:** el enlace `https://rutaflow.co@rutaf1ow.co/login` lleva a una página de inicio de sesión falsa.
- **Error típico:** creer que el candado del navegador prueba que el sitio es legítimo; el atacante también tiene HTTPS.

**cabeceras de correo**
- **Definición técnica:** líneas `Nombre: valor` al inicio del mensaje: `From` (autor visible), `Return-Path` (dirección de rebote del sobre), `Reply-To` (a dónde va la respuesta) y las de autenticación.
- **En palabras sencillas:** el sobre y los sellos de la carta, que tu programa de correo casi nunca te muestra.
- **Dónde se rompe la comparación:** el remitente de un sobre se puede escribir a mano; casi todas estas cabeceras también, salvo las que añade tu propio servidor.
- **Ejemplo:** `Return-Path mailer.example no coincide con From rutaf1ow.co`.
- **Error típico:** fiarse del nombre visible (`Soporte RutaFlow`), que el atacante escribe libremente.

**suplantación de remitente**
- **Definición técnica:** envío de un correo cuyo `From` muestra un dominio que el remitente real no controla (*spoofing*).
- **En palabras sencillas:** firmar una carta con el nombre de otra persona.
- **Dónde se rompe la comparación:** a diferencia de una firma falsa, el dominio se puede comprobar con SPF, DKIM y DMARC.
- **Ejemplo:** el correo `suplantado` dice `From: soporte@rutaflow.co` pero `DKIM firmado por: mailer.example`.
- **Error típico:** creer que si el `From` es exacto el correo es legítimo; sin DMARC con política estricta, cualquiera lo escribe.

**dominio parecido**
- **Definición técnica:** dominio registrado por un atacante que imita uno legítimo con una letra cambiada, añadida o un subdominio engañoso (*typosquatting*).
- **En palabras sencillas:** un letrero que dice «RutaF1ow» con un uno en vez de la ele.
- **Dónde se rompe la comparación:** a simple vista no se nota; para el DNS son dominios totalmente distintos.
- **Ejemplo:** `pagos.rutaflow.co.evil.example` tiene `registrable=evil.example`.
- **Error típico:** revisar solo el comienzo de la URL; lo que manda es el final del nombre de host.

**homógrafo**
- **Definición técnica:** carácter de otro alfabeto visualmente idéntico a uno latino, como la `о` cirílica (U+043E) frente a la `o` latina.
- **En palabras sencillas:** una letra disfrazada de otra.
- **Dónde se rompe la comparación:** se ven iguales en pantalla, pero son puntos de código distintos (Módulo 1, Tema 5).
- **Ejemplo:** `urls.py` marca `https://rutaflоw.co/datos` con `el host tiene caracteres no ASCII (homógrafo)`.
- **Error típico:** comparar dominios «a ojo» o copiándolos de la pantalla.

**punycode**
- **Definición técnica:** codificación ASCII de nombres de dominio con caracteres no ASCII; empieza con `xn--`.
- **En palabras sencillas:** la forma en que el DNS escribe un dominio con tildes o letras de otros alfabetos.
- **Dónde se rompe la comparación:** muchos navegadores muestran la versión decodificada, que puede parecer el dominio real.
- **Ejemplo:** `xn--rutflow-4fg.co` se decodifica como `rutаflow.co`, con una `а` cirílica.
- **Error típico:** bloquear todo `xn--`; hay dominios legítimos con tildes. Lo correcto es compararlos con la lista permitida.

**dominio registrable**
- **Definición técnica:** la parte del nombre de host que alguien registra ante un registrador; se obtiene con la lista pública de sufijos (*Public Suffix List*).
- **En palabras sencillas:** el nombre del dueño de la casa, sin el número del apartamento.
- **Dónde se rompe la comparación:** no siempre son las dos últimas etiquetas: en `rutaflow.com.co` el sufijo es `com.co` y el registrable tiene tres.
- **Ejemplo:** `pagos.rutaflow.co` da `registrable=rutaflow.co` y pasa la lista blanca.
- **Error típico:** tomar las dos últimas etiquetas siempre: `registrable("api.rutaflow.com.co")` devuelve `com.co`.

**SPF**
- **Definición técnica:** registro DNS del dominio que lista qué servidores pueden enviar correo en su nombre; se comprueba contra el dominio del `Return-Path`.
- **En palabras sencillas:** la lista de mensajeros autorizados de la empresa.
- **Dónde se rompe la comparación:** valida el sobre, no el `From` visible; un atacante puede pasar SPF con su propio dominio.
- **Ejemplo:** el correo `suplantado` tiene `spf=fail smtp.mailfrom=mailer.example`.
- **Error típico:** leer `spf=pass` como «correo legítimo» sin mirar de qué dominio.

**DKIM**
- **Definición técnica:** firma digital que el servidor emisor agrega al correo; la clave pública se publica en el DNS del dominio firmante (`header.d`).
- **En palabras sencillas:** el sello del remitente pegado al mensaje, que cualquiera puede comprobar.
- **Dónde se rompe la comparación:** prueba quién firmó, no quién aparece en el `From`; un atacante firma con su propio dominio.
- **Ejemplo:** en `suplantado`, `dkim=pass` pero `DKIM firmado por: mailer.example; alineado: False`.
- **Error típico:** quedarse con `dkim=pass` sin comprobar que `header.d` coincide con el dominio del `From`.

**DMARC**
- **Definición técnica:** política DNS que exige que SPF o DKIM pasen **alineados** con el dominio del `From`, e indica qué hacer si no: `none`, `quarantine` o `reject`.
- **En palabras sencillas:** la regla de la empresa: «si el sello no es nuestro, bota la carta» (o apártala).
- **Dónde se rompe la comparación:** con `p=none` solo se informa; el correo falso llega igual.
- **Ejemplo:** `autenticacion.py` imprime `dmarc=fail política=quarantine` y `decisión: cuarentena`.
- **Error típico:** publicar DMARC con `p=none` y no subir nunca a `quarantine` o `reject`.

**runbook**
- **Definición técnica:** procedimiento escrito, paso a paso, para responder a un tipo de incidente; dice quién actúa, en qué orden y qué evidencia guarda.
- **En palabras sencillas:** la receta para el día malo, escrita el día tranquilo.
- **Dónde se rompe la comparación:** una receta se sigue igual siempre; el runbook se ajusta después de cada incidente real.
- **Ejemplo:** cuando `analizar.py` imprime `SOSPECHOSO`, el runbook de este tema ordena reportar, buscar a otros destinatarios y revocar sesiones.
- **Error típico:** escribirlo durante el incidente, con prisa y sin saber quién tiene permiso para revocar sesiones.

#### ► CÓMO FUNCIONA
Un correo sospechoso se analiza en tres capas, de lo que el lector no ve a lo que sí ve.

1. **Autenticación:** la cabecera `Authentication-Results` dice si SPF, DKIM y DMARC pasaron y con qué dominios.
2. **Identidad:** el dominio del `From` se compara con `Return-Path` y `Reply-To`.
3. **Enlaces:** el destino real de cada enlace se compara con el texto que muestra y con la lista de dominios permitidos.

La urgencia y el miedo son señales humanas, no técnicas; también se cuentan. Si hay señales, el correo no se
«arregla»: se activa el runbook.

| Señal | Dónde se ve | Qué significa |
|---|---|---|
| `dmarc=fail` | `Authentication-Results` | El `From` no está respaldado por su dominio |
| `Return-Path` distinto del `From` | Cabeceras | El rebote va a otro dominio |
| Texto del enlace ≠ destino | HTML del cuerpo | Te muestran un sitio y te llevan a otro |
| `@` dentro del host | URL | Lo que va antes de `@` es usuario, no destino |
| `xn--` o caracteres no ASCII | Host | Posible homógrafo |

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
    ALERT --> REP["runbook: reportar y contener sesiones"]
```

#### Problema resuelto 5.1
Lee la cabecera `Authentication-Results` de dos correos y decide qué hace DMARC con cada uno.

**Razonamiento:**
1. Unir la cabecera, que puede venir partida en varias líneas, en una sola.
2. Extraer `spf`, `dkim` y `dmarc` con una expresión regular, más la política y el dominio que firmó DKIM.
3. Comparar el firmante con el dominio del `From`: esa es la alineación que exige DMARC.

```python
# autenticacion.py — interpreta la cabecera Authentication-Results de un correo
import re
from email import message_from_string

crudos = {
    "factura": """From: facturas@rutaflow.co
Authentication-Results: mx.rutaflow.co; spf=pass smtp.mailfrom=rutaflow.co;
 dkim=pass header.d=rutaflow.co; dmarc=pass (p=reject) header.from=rutaflow.co
Subject: Factura de octubre

Adjunta la factura.""",
    "suplantado": """From: soporte@rutaflow.co
Authentication-Results: mx.rutaflow.co; spf=fail smtp.mailfrom=mailer.example;
 dkim=pass header.d=mailer.example; dmarc=fail (p=quarantine) header.from=rutaflow.co
Subject: Cambie su clave

Ingrese ya.""",
}


def resultados(cabecera):
    return dict(re.findall(r"\b(spf|dkim|dmarc)=(\w+)", cabecera))


for nombre, crudo in crudos.items():
    msg = message_from_string(crudo)
    cabecera = " ".join(msg["Authentication-Results"].split())
    r = resultados(cabecera)
    politica = re.search(r"\(p=(\w+)\)", cabecera).group(1)
    firmante = re.search(r"header\.d=([\w.-]+)", cabecera).group(1)
    visible = msg["From"].rsplit("@", 1)[-1]
    print(f"{nombre}: spf={r['spf']} dkim={r['dkim']} dmarc={r['dmarc']} política={politica}")
    print(f"  From visible: {visible}; DKIM firmado por: {firmante}; alineado: {firmante == visible}")
    if r["dmarc"] != "pass":
        print(f"  decisión: {'rechazar' if politica == 'reject' else 'cuarentena' if politica == 'quarantine' else 'entregar con aviso'}")
```

```text
$ python3 autenticacion.py
factura: spf=pass dkim=pass dmarc=pass política=reject
  From visible: rutaflow.co; DKIM firmado por: rutaflow.co; alineado: True
suplantado: spf=fail dkim=pass dmarc=fail política=quarantine
  From visible: rutaflow.co; DKIM firmado por: mailer.example; alineado: False
  decisión: cuarentena
```

**Explicación por partes.**
- Líneas 7–8 y 13–14: una cabecera larga continúa en la línea siguiente si esta empieza con espacio.
- Línea 22: `findall` con dos grupos devuelve pares; `dict` los convierte en `{"spf": "pass", …}`.
- Línea 27: `split` y `join` quitan saltos de línea y espacios repetidos.
- Línea 33: la alineación compara el dominio firmante con el visible. En el suplantado, `dkim=pass` no basta.
- Líneas 34–35: solo si DMARC falla se aplica la política publicada por el dominio.

> **Error común.** Analizar un correo que no trae `Authentication-Results`, por ejemplo uno reenviado como texto.
> La línea 27 termina con `AttributeError: 'NoneType' object has no attribute 'split'`: `msg[...]` devuelve `None`
> si la cabecera no existe. Comprueba antes con `if msg["Authentication-Results"] is None:` y analiza el original.

#### Problema resuelto 5.2
Revisa tres correos completos: compara cabeceras, enlaces y palabras de urgencia, y marca los sospechosos.

**Razonamiento:**
1. El módulo `email` separa cabeceras y cuerpo; `HTMLParser` recorre el HTML y guarda cada `href` con su texto.
2. `urlsplit` separa la URL en partes: lo que va antes de `@` en el host es usuario, no destino.
3. Cada señal es una línea de alerta; un correo sin alertas se considera limpio, no «seguro».

```python
# analizar.py — revisa cabeceras, enlaces y urgencia de un correo
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

```text
$ python3 analizar.py
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

**Explicación por partes.**
- Líneas 11–12: `dominio` toma lo que va después de la última `@` y quita el `>` de cierre.
- Líneas 21–27: el analizador recuerda el `href` del último `<a>` y lo empareja con el texto que muestra.
- Líneas 37–42: `Return-Path` y `Reply-To` deben ser del mismo dominio que el `From`.
- Líneas 49–50: `destino.username` existe cuando la URL trae `algo@`; el navegador va al host de después.
- Líneas 51–57: punycode, caracteres no ASCII y dominios fuera de la lista blanca.
- Líneas 60–62: el texto visible del enlace se interpreta como URL para comparar su host con el destino real.
- Líneas 64–67: las palabras de urgencia se buscan en asunto y cuerpo, en minúsculas.

> **Buena práctica.** No abras los enlaces sospechosos para «ver qué hay». El análisis se hace sobre el texto del
> correo, como aquí. Si hace falta visitar el sitio, lo hace el equipo de seguridad en un entorno aislado.

#### Problema resuelto 5.3
Analiza URLs sueltas, como las que llegan por SMS o chat, y decide por dominio registrable.

**Razonamiento:**
1. Obtener el host real y su dominio registrable.
2. Señalar userinfo, IP en vez de nombre, caracteres no ASCII y punycode decodificado.
3. Aceptar solo si el host o su registrable están en la lista de permitidos.

```python
# urls.py — revisa a dónde lleva realmente una URL
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

```text
$ python3 urls.py
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

**Explicación por partes.**
- Líneas 8–10: la versión simple del dominio registrable: las dos últimas etiquetas. Sirve para `.co`, no para `.com.co`.
- Líneas 19–23: `ip_address` lanza `ValueError` si el host no es una IP; ese caso se ignora con `pass`.
- Líneas 26–30: `decode('idna')` muestra cómo se vería el punycode: `rutаflow.co`, con una letra cirílica.
- Línea 33: la decisión final usa el registrable; `pagos.rutaflow.co.evil.example` cae porque su dueño es `evil.example`.
- Salida: la última URL no tiene notas extra: es la única legítima.

> **Error común.** Confiar en «dos últimas etiquetas» con sufijos de dos niveles. `registrable("api.rutaflow.com.co")`
> devuelve `com.co`, igual que `registrable("rutaflow-pagos.com.co")`: el programa no distingue a la empresa del
> atacante. En producción se usa la lista pública de sufijos, y para la IP `45.12.3.9` el «registrable» `3.9` no
> significa nada.

#### Checkpoint 5.1
Un correo trae `spf=pass smtp.mailfrom=envios-rapidos.example`, `dkim=pass header.d=envios-rapidos.example` y
`From: pagos@rutaflow.co`. ¿Debería pasar DMARC de `rutaflow.co`?

Respuesta: no. SPF y DKIM pasan, pero para `envios-rapidos.example`, que no está alineado con `rutaflow.co`. DMARC
exige alineación con el dominio del `From`, así que resulta `dmarc=fail`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Lee la autenticación
Crea `~/labs/seguridad/tema5`, escribe `autenticacion.py` y confirma que el suplantado termina en `decisión: cuarentena`.

#### Paso 2 · Analiza correos
Escribe `analizar.py` y ejecútalo. Agrega un cuarto correo legítimo de `pagos@rutaflow.co` con un enlace a
`https://rutaflow.co/pagos` y comprueba que sale `sin señales`.

#### Paso 3 · Analiza URLs
Escribe `urls.py`. Para cada URL marcada, escribe en `urls.txt` qué señal la delata y si un usuario la habría notado.

#### Paso 4 · Escribe el runbook
Crea `runbook-phishing.md` con cinco pasos: (1) no hacer clic y reportar el correo con cabeceras completas;
(2) buscar el mismo asunto o remitente en los buzones de la empresa; (3) si alguien ingresó su clave, revocar sus
sesiones (Tema 2) y forzar cambio de contraseña; (4) bloquear el dominio en el filtro de correo; (5) registrar el
incidente con cifras (Tema 4).

#### Resumen
- La **ingeniería social** ataca a las personas; el **phishing** es su forma más común por mensajes.
- Las **cabeceras de correo** revelan lo que el nombre visible esconde: `Return-Path`, `Reply-To` y autenticación.
- La **suplantación de remitente** se detecta con **SPF**, **DKIM** y **DMARC**, mirando siempre la alineación con el `From`.
- Un **dominio parecido**, un **homógrafo** o un **punycode** imitan el dominio real; se decide por **dominio registrable**.
- El enlace se juzga por su destino real, no por el texto que muestra.
- Un **runbook** convierte la sospecha en pasos: reportar, buscar, contener sesiones, bloquear y registrar.

#### Ejercicio verificable 1
Básico. Pasa a `urls.py` la URL `https://soporte.rutaflow.co/ayuda`. ¿Qué notas imprime?

Respuesta esperada: `host=soporte.rutaflow.co` y `registrable=rutaflow.co`, sin más notas. No está en `PERMITIDOS`,
pero su registrable sí, así que pasa la lista blanca.

#### Ejercicio verificable 2
Intermedio. En `autenticacion.py`, agrega un tercer correo igual al suplantado pero con `(p=none)`. ¿Qué decisión
imprime y qué riesgo deja?

Respuesta esperada: `decisión: entregar con aviso`. Con `p=none` el correo falso llega a la bandeja; la política solo
sirve para recibir informes. RutaFlow debe subir a `quarantine` y después a `reject`.

#### Ejercicio verificable 3
Reto. RutaFlow hizo una capacitación. En la simulación previa, 18 de 60 personas hicieron clic; en la posterior, 12 de
60. ¿Bajó de verdad? Usa el intervalo de Wilson al 95 %, que da el rango plausible de la proporción real:

```python
# campana.py — ¿bajaron de verdad los clics tras la capacitación?
from math import sqrt


def intervalo_wilson(exitos, total, z=1.96):
    p = exitos / total
    centro = (p + z * z / (2 * total)) / (1 + z * z / total)
    margen = z * sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / (1 + z * z / total)
    return centro - margen, centro + margen


for nombre, clics, total in [("antes", 18, 60), ("después", 12, 60)]:
    bajo, alto = intervalo_wilson(clics, total)
    print(f"{nombre}: {clics}/{total} = {clics / total:.0%}, intervalo 95 %: {bajo:.0%} a {alto:.0%}")
```

Respuesta esperada:

```text
$ python3 campana.py
antes: 18/60 = 30%, intervalo 95 %: 20% a 43%
después: 12/60 = 20%, intervalo 95 %: 12% a 32%
```

Los intervalos se solapan entre 20 % y 32 %: con 60 personas no puedes afirmar que la capacitación redujo los clics.
Con las mismas proporciones y 600 personas (180 y 120 clics), los intervalos son 26 % a 34 % y 17 % a 23 % y ya no se
tocan. Informa la cifra con su intervalo, no solo el porcentaje.

#### En el trabajo
La mayoría de los incidentes graves empiezan con una credencial robada por phishing. Por eso las empresas publican
DMARC con `p=reject`, filtran enlaces en el servidor de correo, hacen simulaciones periódicas y miden el
**porcentaje de reportes**, no solo el de clics. El objetivo no es que nadie haga clic nunca, sino que quien lo haga
lo reporte en minutos y el runbook contenga el daño.

</details>

### Proyecto 6: inventario endurecido

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

El proyecto aplica los cinco temas al inventario del Módulo 5. No hay técnicas nuevas: cada entregable remite al
tema donde se explicó. El resultado es un repositorio que alguien de seguridad podría auditar sin pedirte nada más.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Entregables
1. **Modelo de amenazas.** Diagrama de flujo de datos con límites de confianza y `amenazas.json` validado por `riesgos.py`, con dueño y tratamiento en cada fila (Tema 1).
2. **Credenciales y roles.** Contraseñas con `hashlib.scrypt` y sal única, sesiones con expiración y revocación, y autorización por rol y por objeto (Tema 2).
3. **Secretos.** Ningún secreto en el código ni en el historial; `.env.example` con nombres de variables y `escanear.py` como paso de CI que falla con código 1 (Tema 3).
4. **Pruebas de abuso.** Pruebas `pytest` que comprueban que cada acción no autorizada falla: otro usuario, rol equivocado, sesión vencida e inyección SQL (Temas 2 y 4).
5. **Auditoría y privacidad.** Registro de auditoría encadenado con HMAC y logs redactados con retención definida (Temas 2 y 4).
6. **Runbook.** Procedimiento de respuesta a incidentes con pasos, responsables y la evidencia que se guarda (Temas 4 y 5).

#### Criterio de terminado
Un clon limpio del repositorio pasa `python -m pytest -q` y `git log -p | python3 escanear.py` termina con código 0.
Cada prueba de abuso se vio fallar antes de agregar el control que la hace pasar.

</details>
