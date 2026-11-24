# Módulo 7: Requisitos, diseño, arquitectura y mantenimiento

**Entorno comprobado para esta edición (2026-11-24):** Python 3.13.18 en Linux x86_64 (Ubuntu 24.04), Node.js 22.23.5 y Git 2.43.0. La línea de referencia del curso es Python 3.14 (`docs/VERSIONES.md`); estos ejemplos no usan nada exclusivo de esa versión. Todas las transcripciones son literales de esa ejecución, en la carpeta de práctica `/home/estudiante/labs/modulo-7` (tu `~/labs/modulo-7`). El TypeScript del Tema 3 se ejecutó con Node.js 22.23.5, que ya quita los tipos sin compilar; con Node.js 24 funciona igual. El programa C# del Tema 5 **no se ejecutó**: el equipo no tenía el SDK de .NET. Su comportamiento se describe y se comprueba con un programa Python equivalente que sí se ejecutó.

## Apertura del módulo

Al terminar este módulo podrás:
- convertir una necesidad vaga en requisitos y criterios de aceptación que un programa comprueba;
- justificar una decisión de arquitectura con un escenario de calidad medible;
- separar una regla de negocio de la base de datos con un puerto y dos adaptadores;
- refactorizar con una prueba caracterizadora que demuestre que nada cambió;
- registrar decisiones en ADR y priorizar la deuda técnica con números;
- trabajar con un agente de IA contra una especificación y comprobar su alcance y cobertura.

**Esquema del módulo:** Tema 1, requisitos; Tema 2, arquitectura; Tema 3, diseño modular y refactorización; Tema 4,
decisiones y deuda; Tema 5, igualdad e inmutabilidad en records de C#; Tema 6, especificación para agentes de IA;
Tema 7, evaluación de skills de agente; Proyecto 7.

**Qué necesitas saber antes:** algoritmo, caso de prueba, excepción y `assert` (Módulo 1, Tema 1); funciones y
módulos (Módulo 1, Tema 4); clase, objeto y método (Módulo 1, Tema 6); composición, clase abstracta y polimorfismo
(Módulo 1, Tema 7); SQLite desde Python y restricciones (Módulo 4); prueba unitaria, doble de prueba, prueba de
regresión, commit, pull request y revisión de código (Módulo 5).


## Aprende construyendo

### Tema 1: Requisitos, stakeholders y criterios verificables · Avanzado · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- identificar a los stakeholders de una funcionalidad y anotar quién pidió cada requisito;
- distinguir un requisito funcional de uno no funcional y reescribir uno vago con una medida;
- redactar una historia de usuario con criterios de aceptación «dado, cuando, entonces»;
- comprobar con un programa que cada criterio está escrito bien y que el código lo cumple.

**Conceptos clave:** stakeholder, requisito funcional, requisito no funcional, historia de usuario, criterio de aceptación, trazabilidad

Este tema usa lo que ya conoces: **caso de prueba**, **excepción** y **assert** tienen su ficha en el Módulo 1, Tema 1.
Aquí no se redefinen.

#### El problema
La coordinadora de RutaFlow escribe en el chat: «confirmar una entrega debe ser rápido y seguro». El conductor
entiende «un botón». El cliente entiende «que nadie reciba mi paquete por mí». Auditoría entiende «que quede registro».
Nadie puede probar si el sistema cumple, porque «rápido» y «seguro» no tienen medida. ¿Cómo conviertes esa frase en
algo que un programa comprueba?

#### Glosario del tema

**stakeholder**
- **Definición técnica:** persona o grupo que afecta al sistema o se ve afectado por él, y cuyas necesidades originan requisitos.
- **En palabras sencillas:** cada persona a la que le importa cómo funciona la confirmación de entregas.
- **Dónde se rompe la comparación:** no es solo quien usa la pantalla: auditoría nunca la abre y aun así impone reglas.
- **Ejemplo:** en `revisar_requisitos.py`, cada requisito «después» lleva su stakeholder: conductor, cliente o auditoría.
- **Error típico:** escribir requisitos sin dueño; la salida «antes» marca R2 con `nadie lo pidió`.

**requisito funcional**
- **Definición técnica:** enunciado de un comportamiento que el sistema debe ofrecer: una entrada, una acción y un resultado observable.
- **En palabras sencillas:** algo que el sistema **hace**: confirmar, rechazar, guardar.
- **Dónde se rompe la comparación:** «hacer» incluye negarse: rechazar un PIN corto también es un comportamiento exigido.
- **Ejemplo:** «el conductor confirma la entrega con el PIN de 6 dígitos del destinatario» → la salida dice `[funcional]`.
- **Error típico:** dejar el dato sin forma: «con el PIN» no dice cuántos dígitos ni qué pasa si está mal.

**requisito no funcional**
- **Definición técnica:** restricción sobre **cómo** se comporta el sistema (tiempo de respuesta, seguridad, disponibilidad), expresada con una medida.
- **En palabras sencillas:** qué tan bien lo hace: qué tan rápido, qué tan protegido, cuántas veces falla.
- **Dónde se rompe la comparación:** «bien» no sirve hasta tener número; «rápido» es una opinión, «menos de 2 segundos» es un requisito.
- **Ejemplo:** «el 95 % de las confirmaciones responde en menos de 2 segundos» → `[no funcional] ... verificable`.
- **Error típico:** usar adjetivos sin medida: la salida «antes» marca `adjetivo sin medida`.

**historia de usuario**
- **Definición técnica:** descripción breve de una necesidad con la forma «como *rol*, quiero *acción*, para *beneficio*», que agrupa criterios de aceptación.
- **En palabras sencillas:** la necesidad contada desde quien la tiene, en una sola frase.
- **Dónde se rompe la comparación:** la historia no es el contrato: sin criterios, cada persona la entiende a su manera.
- **Ejemplo:** «Como conductor, quiero confirmar la entrega con el PIN del destinatario, para dejar evidencia de que llegó a la persona correcta».
- **Error típico:** escribir la solución técnica («quiero un endpoint POST») en lugar de la necesidad.

**criterio de aceptación**
- **Definición técnica:** condición verificable que la historia debe cumplir para darse por terminada; se escribe como «dado *contexto*, cuando *acción*, entonces *resultado*».
- **En palabras sencillas:** un ejemplo concreto con la respuesta correcta, acordado antes de programar.
- **Dónde se rompe la comparación:** se parece a un caso de prueba, pero lo escribe y lo entiende alguien que no programa.
- **Ejemplo:** `C2: Dado un PIN de 4 dígitos, cuando se confirma, entonces se rechaza con ValueError y el estado no cambia.`
- **Error típico:** escribirlo sin «dado/cuando/entonces»; `verificar_criterios.py` responde `falta dado/cuando/entonces`.

**trazabilidad**
- **Definición técnica:** capacidad de seguir cada requisito hasta el código que lo implementa y la prueba que lo comprueba, y de vuelta.
- **En palabras sencillas:** poder señalar, para cada criterio, la línea que lo cumple y la prueba que lo demuestra.
- **Dónde se rompe la comparación:** no es un archivo aparte: vive en nombres y comentarios compartidos (`C1`, `C2`, `C3`).
- **Ejemplo:** el comentario `# C2: PIN de 6 dígitos` en `entregas.py` y la línea `C2 ok` de `prueba_criterios.py`.
- **Error típico:** cambiar un criterio sin buscar su prueba: la prueba sigue verde comprobando una regla vieja.

#### ► CÓMO FUNCIONA
Un requisito nace de un stakeholder, no de quien programa. Se escribe primero en palabras y luego se le pone medida.
La historia de usuario agrupa la necesidad; los criterios de aceptación la vuelven comprobable. Cada criterio se
vuelve una prueba, y la prueba deja evidencia.

```mermaid
flowchart LR
    ST["stakeholder<br/>conductor, cliente, auditoría"] --> NEED["necesidad en palabras"]
    NEED --> REQ["requisito con medida<br/>funcional o no funcional"]
    REQ --> HIST["historia de usuario"]
    HIST --> CRIT["criterios C1, C2, C3<br/>dado / cuando / entonces"]
    CRIT --> CODE["código con # C1, # C2"]
    CRIT --> TEST["prueba por criterio"]
    TEST --> EV["evidencia: C1 ok, C2 ok, C3 ok"]
```

La regla práctica: si dos personas pueden discutir si el sistema cumple, el requisito todavía no está terminado.

#### Problema resuelto 1.1
Revisa los requisitos de la confirmación de entregas. Marca de qué tipo es cada uno, quién lo pidió y si se puede verificar.

**Razonamiento:**
1. Un requisito sin stakeholder no tiene a quién preguntarle qué significa.
2. Un adjetivo de calidad («rápido», «seguro») sin número no se puede medir.
3. Se reescribe cada frase vaga con una medida concreta y un dueño.

```python
# revisar_requisitos.py — clasifica requisitos y marca los que no se pueden verificar
import re

VAGOS = ("rápido", "seguro", "fácil", "estable", "cómodo")
CALIDADES = ("segundos", "%", "disponible", "cifrad", "intentos")


def revisar(stakeholder, requisito):
    texto = requisito.lower()
    tipo = "no funcional" if any(c in texto for c in CALIDADES + VAGOS) else "funcional"
    problemas = []
    if not stakeholder:
        problemas.append("nadie lo pidió")
    if any(v in texto for v in VAGOS) and not re.search(r"\d", texto):
        problemas.append("adjetivo sin medida")
    return tipo, "; ".join(problemas) or "verificable"


antes = [
    ("coordinadora", "El conductor confirma la entrega con el PIN del destinatario."),
    ("", "Confirmar una entrega debe ser rápido y seguro."),
]
despues = [
    ("conductor", "El conductor confirma la entrega con el PIN de 6 dígitos del destinatario."),
    ("cliente", "El 95 % de las confirmaciones responde en menos de 2 segundos."),
    ("auditoría", "Tras 3 intentos con PIN errado, el envío se bloquea 15 minutos."),
]
for titulo, lista in (("ANTES", antes), ("DESPUÉS", despues)):
    print(titulo)
    for numero, (stakeholder, requisito) in enumerate(lista, start=1):
        tipo, veredicto = revisar(stakeholder, requisito)
        print(f"  R{numero} [{tipo}] pedido por {stakeholder or '?'}: {veredicto}")
```

```text
$ python3 revisar_requisitos.py
ANTES
  R1 [funcional] pedido por coordinadora: verificable
  R2 [no funcional] pedido por ?: nadie lo pidió; adjetivo sin medida
DESPUÉS
  R1 [funcional] pedido por conductor: verificable
  R2 [no funcional] pedido por cliente: verificable
  R3 [no funcional] pedido por auditoría: verificable
```

**Explicación por partes.**
- Líneas 4–5: palabras que delatan un requisito no funcional; `VAGOS` son las que no traen medida por sí solas.
- Línea 10: si el texto habla de calidad, se clasifica como no funcional; si no, como funcional.
- Líneas 12–15: dos problemas posibles: nadie lo pidió, o hay un adjetivo sin ningún número.
- Líneas 19–22: la versión «antes»; R2 junta dos defectos y la salida muestra ambos.
- Líneas 23–27: la versión «después»; la frase vaga se volvió dos requisitos medibles, cada uno con dueño.

> **Error común.** Creer que el verificador prueba que el requisito es **bueno**. Solo detecta señales de vaguedad. El
> R1 de «antes» sale `verificable` aunque no dice cuántos dígitos tiene el PIN: eso lo encuentra una persona.

> **Buena práctica.** Cuando un stakeholder diga «rápido», pregunta «¿cuánto, para qué porcentaje de casos y medido
> dónde?». La respuesta es el requisito; el adjetivo era solo la intención.

#### Problema resuelto 1.2
Escribe la historia de usuario del conductor con tres criterios de aceptación. Comprueba la redacción y luego que el
código cumple cada criterio.

**Razonamiento:**
1. Historia: «Como conductor, quiero confirmar la entrega con el PIN del destinatario, para dejar evidencia de que llegó a la persona correcta».
2. Cada criterio necesita las tres palabras: dado (contexto), cuando (acción), entonces (resultado).
3. Cada criterio lleva un identificador (`C1`, `C2`, `C3`) que se repite en el código y en la prueba: eso es trazabilidad.

Primero, el borrador que llegó y la versión corregida:

```markdown
- Confirmar una entrega debe ser seguro.
- Dado un PIN correcto, cuando se confirma, entonces el envío queda entregado.
```

```markdown
- C1: Dado un envío "pendiente" y un PIN de 6 dígitos correcto, cuando se confirma, entonces queda "entregado".
- C2: Dado un PIN de 4 dígitos, cuando se confirma, entonces se rechaza con ValueError y el estado no cambia.
- C3: Dado un comando ya procesado, cuando se reenvía, entonces se devuelve el resultado anterior sin confirmar de nuevo.
```

El verificador de redacción:

```python
# verificar_criterios.py — comprueba que cada criterio sea verificable
import re
import sys
from pathlib import Path

VAGOS = ("rápido", "rapido", "lento", "seguro", "fácil", "facil", "cómodo", "comodo", "estable")
archivo = sys.argv[1] if len(sys.argv) > 1 else "criterios.md"
lineas = [l.strip() for l in Path(archivo).read_text(encoding="utf-8").splitlines() if l.strip()]
fallos = []
for numero, linea in enumerate(lineas, 1):
    texto = linea.lower()
    if not all(palabra in texto for palabra in ("dado", "cuando", "entonces")):
        fallos.append(f"criterio {numero}: falta dado/cuando/entonces")
    elif any(vago in texto for vago in VAGOS) and not re.search(r"\d", linea):
        fallos.append(f"criterio {numero}: adjetivo sin medida numérica")
print(f"criterios: {len(lineas)}")
print(f"verificables: {len(lineas) - len(fallos)}")
if not any("6 dígitos" in l for l in lineas):
    fallos.append("falta la regla del PIN de 6 dígitos")
for fallo in fallos:
    print("fallo:", fallo)
sys.exit(1 if fallos else 0)
```

```text
$ python3 verificar_criterios.py criterios_antes.md; echo "salida: $?"
criterios: 2
verificables: 1
fallo: criterio 1: falta dado/cuando/entonces
fallo: falta la regla del PIN de 6 dígitos
salida: 1
```

```text
$ python3 verificar_criterios.py; echo "salida: $?"
criterios: 3
verificables: 3
salida: 0
```

Después, el código y una prueba por criterio:

```python
# entregas.py — regla de confirmación de entregas de RutaFlow
def confirmar_entrega(envio, pin, comando_id, procesados):
    if comando_id in procesados:                       # C3: el reintento no repite
        return procesados[comando_id]
    if len(pin) != 6 or not pin.isdigit():             # C2: PIN de 6 dígitos
        raise ValueError("el PIN debe tener 6 dígitos")
    if pin != envio["pin"]:
        raise ValueError("PIN incorrecto")
    resultado = {**envio, "estado": "entregado"}       # C1: queda entregado
    procesados[comando_id] = resultado
    return resultado
```

```python
# prueba_criterios.py — una prueba por criterio de aceptación
from entregas import confirmar_entrega

envio = {"guia": "RF-4471", "estado": "pendiente", "pin": "482913"}

# C1
procesados = {}
assert confirmar_entrega(envio, "482913", "cmd-1", procesados)["estado"] == "entregado"
print("C1 ok: PIN correcto deja el envío entregado")

# C2
try:
    confirmar_entrega(envio, "4829", "cmd-2", {})
    print("C2 FALLA: debía rechazar el PIN corto")
except ValueError as error:
    assert envio["estado"] == "pendiente"
    print("C2 ok:", error, "| estado sigue", envio["estado"])

# C3
primero = confirmar_entrega(envio, "482913", "cmd-3", procesados)
segundo = confirmar_entrega(envio, "000000", "cmd-3", procesados)
assert segundo is primero and len(procesados) == 2
print("C3 ok: el reintento devuelve el mismo resultado; confirmaciones:", len(procesados))
```

```text
$ python3 prueba_criterios.py
C1 ok: PIN correcto deja el envío entregado
C2 ok: el PIN debe tener 6 dígitos | estado sigue pendiente
C3 ok: el reintento devuelve el mismo resultado; confirmaciones: 2
```

**Explicación por partes.**
- `verificar_criterios.py`, líneas 10–15: revisa cada línea; primero la forma (dado/cuando/entonces), luego los adjetivos sin número.
- Líneas 16–17: los verificables son los criterios sin fallo propio. En el borrador, el segundo sí lo era.
- Líneas 18–19: una regla del caso: el PIN de 6 dígitos debe aparecer en algún criterio.
- Línea 22: `sys.exit(1)` deja código de salida 1 si hay fallos; por eso la primera ejecución muestra `salida: 1`.
- `entregas.py`, líneas 3, 5 y 9: los comentarios `# C1`, `# C2`, `# C3` apuntan al criterio que cumple cada línea.
- `prueba_criterios.py`, líneas 6, 11 y 19: un bloque por criterio; si un `assert` falla, sabes qué criterio se rompió.
- Líneas 20–22: el reintento con el mismo `cmd-3` devuelve el **mismo** objeto y no agrega una tercera confirmación.

Si ejecutas el verificador en una carpeta sin `criterios.md`, la última línea del error es esta:

```text
$ python3 verificar_criterios.py
FileNotFoundError: [Errno 2] No such file or directory: 'criterios.md'
```

> **Error común.** Ejecutar el verificador desde otra carpeta. Python termina con
> `FileNotFoundError: [Errno 2] No such file or directory: 'criterios.md'`. Lee el final: el archivo que faltó es `criterios.md`, buscado en la carpeta
> actual. Comprueba con `pwd` y `ls` antes de culpar al programa.

> **Prevenir errores.** Escribe los criterios **antes** del código y numéralos. Un criterio sin número no se puede
> citar en una prueba, y uno sin prueba es una promesa que nadie comprueba.

#### Checkpoint 1.1
¿Por qué «la confirmación debe ser segura» no es un criterio de aceptación, aunque todos estén de acuerdo con ella?

Respuesta: porque no dice qué situación revisar ni qué resultado esperar. «Tras 3 intentos con PIN errado, el envío se bloquea 15 minutos» sí se puede comprobar.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/modulo-7/requisitos` y entra con `cd ~/labs/modulo-7/requisitos`.

#### Paso 2 · Lista stakeholders y requisitos
Escribe `revisar_requisitos.py` y ejecútalo. Agrega un requisito tuyo del cliente sin medida y comprueba que sale `adjetivo sin medida`.

#### Paso 3 · Escribe historia y criterios
Crea `criterios_antes.md` y `criterios.md` como en el Problema resuelto 1.2. Ejecuta el verificador con cada uno y anota el código de salida.

#### Paso 4 · Conecta criterios y código
Escribe `entregas.py` y `prueba_criterios.py`. Cambia la línea 5 de `entregas.py` para aceptar 4 dígitos y observa qué criterio falla.

#### Resumen
- Un **stakeholder** es quien origina o sufre un requisito; todo requisito tiene dueño.
- Un **requisito funcional** dice qué hace el sistema; uno **no funcional** dice qué tan bien, con un número.
- Una **historia de usuario** cuenta la necesidad como «como, quiero, para».
- Un **criterio de aceptación** usa «dado, cuando, entonces» y se comprueba con un programa.
- La **trazabilidad** une criterio, código y prueba con el mismo identificador.

#### Ejercicio verificable 1
Básico. Clasifica: «el sistema guarda la foto de la firma» y «la foto pesa menos de 500 KB».

Respuesta esperada: la primera es funcional (algo que el sistema hace); la segunda es no funcional (una restricción con medida).

#### Ejercicio verificable 2
Intermedio. Agrega a `criterios.md` el criterio C4 para el bloqueo tras 3 intentos fallidos y ejecuta el verificador.

Respuesta esperada: `C4: Dado un envío con 3 intentos fallidos, cuando se confirma con un PIN correcto, entonces se rechaza durante 15 minutos.` La salida muestra `criterios: 4`, `verificables: 4` y `salida: 0`.

#### Ejercicio verificable 3
Reto. Implementa C4 en `entregas.py` y agrega su bloque en `prueba_criterios.py`, sin romper C1 a C3.

Respuesta esperada: un contador de intentos por guía que lanza `ValueError("envío bloqueado")` al cuarto intento. La salida muestra `C1 ok`, `C2 ok`, `C3 ok` y `C4 ok`.

#### En el trabajo
En un equipo, la historia llega como ticket y los criterios se acuerdan en el refinamiento, antes de estimar. Los
criterios numerados se vuelven pruebas automáticas que corren en CI (Módulo 5). Cuando producto cambia una regla, la
búsqueda de `C2` en el repositorio muestra al instante qué código y qué pruebas hay que tocar.

</details>

### Tema 2: Arquitectura guiada por atributos de calidad · Avanzado · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- describir la arquitectura de RutaFlow como componentes, dependencias y límites, en un diagrama C4;
- escribir un escenario de calidad con sus seis partes y medir su respuesta;
- explicar el trade-off de una decisión: qué ganas y qué pagas;
- automatizar una regla de arquitectura con una fitness function que falle en CI.

**Conceptos clave:** arquitectura, componente, dependencia, atributo de calidad, escenario de calidad, trade-off, modelo C4, fitness function

Este tema usa **requisito no funcional** y **criterio de aceptación** (Tema 1 de este módulo), **módulo** (Módulo 1,
Tema 4) y la restricción `UNIQUE` de SQLite (Módulo 4, Tema 3).

#### El problema
El conductor de RutaFlow confirma una entrega en una zona con mala señal. La app no recibe respuesta y reintenta.
El servidor recibe **dos veces** el mismo comando. Si guarda dos confirmaciones, el reporte de auditoría queda mal y
el cliente recibe dos avisos. ¿Qué parte del sistema debe impedirlo, y cómo demuestras que lo impide?

#### Glosario del tema

**arquitectura**
- **Definición técnica:** conjunto de decisiones estructurales de un sistema (sus partes, sus responsabilidades y cómo se comunican) que son costosas de cambiar después.
- **En palabras sencillas:** los planos del edificio: dónde van los muros de carga, no de qué color se pintan.
- **Dónde se rompe la comparación:** un edificio no cambia de planos cada mes; el software sí evoluciona, y la arquitectura debe permitirlo.
- **Ejemplo:** decidir que la regla de confirmación no habla directo con SQLite, sino con un repositorio (`despues/dominio.py`).
- **Error típico:** llamar arquitectura a un diagrama bonito que nadie puede comprobar contra el código.

**componente y dependencia**
- **Definición técnica:** un componente es una parte del sistema con una responsabilidad y una interfaz; una dependencia existe cuando un componente necesita a otro para funcionar (lo importa o lo llama).
- **En palabras sencillas:** los componentes son las piezas; las dependencias son las flechas «yo necesito a ese».
- **Dónde se rompe la comparación:** la flecha tiene dirección: si el dominio importa `sqlite3`, cambiar la base obliga a tocar el dominio.
- **Ejemplo:** `antes/dominio.py importa: ['sqlite3']` (dependencia hacia la infraestructura); `despues/dominio.py importa: nada`.
- **Error típico:** dibujar flechas en ambos sentidos «por si acaso»; dos componentes que se necesitan mutuamente ya son uno solo.

**atributo de calidad**
- **Definición técnica:** propiedad medible del sistema que los stakeholders valoran, como disponibilidad, rendimiento, seguridad, mantenibilidad o facilidad de prueba.
- **En palabras sencillas:** las «-idades» que hacen que el sistema sea bueno, más allá de que funcione.
- **Dónde se rompe la comparación:** no todos pesan igual en cada sistema; mejorar uno casi siempre empeora otro.
- **Ejemplo:** en el problema de este tema, el atributo es la **integridad** de los datos frente a reintentos.
- **Error típico:** querer todos al máximo; sin prioridad, el atributo que gana es el que defiende la persona más ruidosa.

**escenario de calidad**
- **Definición técnica:** enunciado de seis partes (fuente, estímulo, artefacto, entorno, respuesta y medida) que vuelve verificable un atributo de calidad.
- **En palabras sencillas:** una historia corta de «qué pasa cuando algo sale mal» con un número para saber si se cumplió.
- **Dónde se rompe la comparación:** a diferencia de una historia de usuario, aquí el protagonista suele ser un fallo, no una persona.
- **Ejemplo:** `escenario.txt` y su comprobación `campos del escenario: 6/6`.
- **Error típico:** omitir la medida; sin ella, el escenario vuelve a ser un deseo como «debe ser confiable».

**trade-off**
- **Definición técnica:** compromiso entre atributos de calidad: la decisión que mejora uno tiene un costo medible en otro.
- **En palabras sencillas:** no hay almuerzo gratis; cada ventaja se paga con algo.
- **Dónde se rompe la comparación:** a veces el costo es tan pequeño que no importa; igual se nombra, para decidir con datos.
- **Ejemplo:** `UNIQUE` deja `1` fila en vez de `2`, pero SQLite crea un índice extra: `sqlite_autoindex_confirmacion_1`.
- **Error típico:** presentar una decisión solo con sus ventajas; quien la revise después no sabrá qué se aceptó perder.

**modelo C4**
- **Definición técnica:** forma de documentar la arquitectura en cuatro niveles de zoom: contexto, contenedores, componentes y código.
- **En palabras sencillas:** un mapa con zoom: primero el país, luego la ciudad, luego el barrio.
- **Dónde se rompe la comparación:** «contenedor» en C4 es algo que se ejecuta o guarda datos (una app, una base), no un contenedor Docker.
- **Ejemplo:** el diagrama de contenedores de «Cómo funciona»: app del conductor, API, base de datos y servicio de SMS.
- **Error típico:** mezclar niveles en un solo dibujo: personas, tablas y clases juntas no explican nada.

**fitness function**
- **Definición técnica:** prueba automática que comprueba que el sistema conserva una propiedad de arquitectura, como una regla de dependencias o un tiempo máximo.
- **En palabras sencillas:** un guardia que revisa en cada cambio que nadie rompió una regla de los planos.
- **Dónde se rompe la comparación:** no prueba que el negocio funcione; prueba la forma del sistema.
- **Ejemplo:** `fitness_dependencias.py antes` termina con `salida: 1`; con `despues`, con `salida: 0`.
- **Error típico:** escribir la regla en un documento y no en código: el primer cambio apurado la rompe sin que nadie lo note.

#### ► CÓMO FUNCIONA
Primero se eligen los atributos de calidad que más importan. Cada uno se escribe como escenario con medida. Después se
comparan alternativas por su trade-off, se decide y se deja una fitness function que vigile la decisión.

```mermaid
flowchart LR
    Q["atributo de calidad<br/>integridad ante reintentos"] --> E["escenario<br/>fuente … medida"]
    E --> A1["alternativa A<br/>sin restricción"]
    E --> A2["alternativa B<br/>UNIQUE(command_id)"]
    A1 --> T["trade-off medido<br/>filas e índices"]
    A2 --> T
    T --> D["decisión"] --> F["fitness function<br/>en cada cambio"]
```

El nivel de contenedores del modelo C4 para la confirmación muestra dónde vive cada decisión:

```mermaid
flowchart LR
    C["Conductor"] --> APP["App del conductor<br/>móvil"]
    APP -->|"HTTPS, reintenta"| API["API de RutaFlow<br/>Python"]
    API --> DB[("Base de datos<br/>UNIQUE(command_id)")]
    API --> SMS["Servicio de SMS<br/>externo"]
```

Dentro de la API, las dependencias apuntan hacia el dominio. El dominio no conoce la base de datos: la recibe.

#### Problema resuelto 2.1
Escribe el escenario de calidad del reintento y mide qué pasa con y sin la restricción `UNIQUE(command_id)`.

**Razonamiento:**
1. Fuente y estímulo: la red del conductor reenvía el mismo comando.
2. Medida: cero confirmaciones duplicadas. Se cuenta con `SELECT COUNT(*)`.
3. Se miden dos alternativas en una base en memoria; también se lista qué índices creó SQLite, para ver el costo.

```text
Fuente: red inestable del conductor
Estímulo: el mismo comando "confirmar entrega" se reenvía dos veces (reintento automático)
Artefacto: confirmar_entrega() + repositorio
Entorno: operación normal con conexión intermitente
Respuesta: la segunda llamada devuelve el resultado ya guardado, sin confirmar de nuevo
Medida: cero entregas duplicadas, verificable con UNIQUE(command_id) en la base real
```

```python
# escenario_unique.py — valida el escenario y mide su respuesta en SQLite
import sqlite3
from pathlib import Path

CAMPOS = ("Fuente:", "Estímulo:", "Artefacto:", "Entorno:", "Respuesta:", "Medida:")
texto = Path("escenario.txt").read_text(encoding="utf-8")
faltan = [campo for campo in CAMPOS if campo not in texto]
print(f"campos del escenario: {len(CAMPOS) - len(faltan)}/{len(CAMPOS)}")
if faltan:
    print("faltan:", faltan)
    raise SystemExit(1)


def medir(con_restriccion):
    conexion = sqlite3.connect(":memory:")
    sufijo = " UNIQUE" if con_restriccion else ""
    conexion.execute(f"CREATE TABLE confirmacion(id INTEGER PRIMARY KEY, command_id TEXT{sufijo})")
    for _ in range(2):  # el mismo comando llega dos veces
        try:
            conexion.execute("INSERT INTO confirmacion(command_id) VALUES ('cmd-1')")
        except sqlite3.IntegrityError as error:
            print("  segundo intento rechazado:", error)
    filas = conexion.execute("SELECT COUNT(*) FROM confirmacion").fetchone()[0]
    indices = [fila[1] for fila in conexion.execute("PRAGMA index_list(confirmacion)")]
    return filas, indices


print("ANTES (sin restricción):", medir(False))
print("DESPUÉS (UNIQUE):", medir(True))
```

```text
$ python3 escenario_unique.py
campos del escenario: 6/6
ANTES (sin restricción): (2, [])
  segundo intento rechazado: UNIQUE constraint failed: confirmacion.command_id
DESPUÉS (UNIQUE): (1, ['sqlite_autoindex_confirmacion_1'])
```

**Explicación por partes.**
- Líneas 5–11: si al escenario le falta alguna de las seis partes, el programa se detiene con código 1.
- Línea 17: la tabla se crea con o sin `UNIQUE` según el parámetro.
- Líneas 18–22: el mismo `cmd-1` se inserta dos veces; con `UNIQUE`, SQLite rechaza el segundo con `IntegrityError`.
- Línea 24: `PRAGMA index_list` muestra los índices; el automático es el precio de la restricción.
- Salida: «antes» deja `2` filas; «después» deja `1` y un índice. Ese es el trade-off, medido.

> **Error común.** Confiar en que la app «no reintenta». Los reintentos los hacen también la red, el sistema operativo
> y las librerías. Sin la restricción, la base acepta el duplicado en silencio: `(2, [])`.

> **Ingeniería de software.** La restricción vive en la base de datos, no solo en el código. Si mañana otro servicio
> escribe en la misma tabla, la regla lo protege también.

#### Problema resuelto 2.2
Convierte la regla «el dominio no importa infraestructura» en una fitness function y aplícala a dos versiones del dominio.

**Razonamiento:**
1. La regla se puede comprobar sin ejecutar el dominio: basta leer sus `import`.
2. El módulo `ast` de Python convierte el archivo en un árbol y permite recorrer sus instrucciones.
3. Si aparece un módulo prohibido, el programa termina con código 1 para que CI lo marque en rojo.

```python
# antes/dominio.py — la regla de negocio abre la base de datos ella misma
import sqlite3


def confirmar_entrega(guia, pin):
    if len(pin) != 6:
        raise ValueError("el PIN debe tener 6 dígitos")
    conexion = sqlite3.connect("rutaflow.db")
    conexion.execute("UPDATE envio SET estado = 'entregado' WHERE guia = ?", (guia,))
```

```python
# despues/dominio.py — la regla solo conoce un repositorio que recibe de afuera
def confirmar_entrega(guia, pin, repositorio):
    if len(pin) != 6:
        raise ValueError("el PIN debe tener 6 dígitos")
    repositorio.marcar_entregado(guia)
```

```python
# despues/repositorio_sqlite.py — la infraestructura sí puede usar sqlite3
import sqlite3


class RepositorioSQLite:
    def __init__(self, ruta):
        self.conexion = sqlite3.connect(ruta)

    def marcar_entregado(self, guia):
        self.conexion.execute("UPDATE envio SET estado = 'entregado' WHERE guia = ?", (guia,))
```

```python
# fitness_dependencias.py — regla de arquitectura: el dominio no importa infraestructura
import ast
import sys
from pathlib import Path

PROHIBIDOS = {"sqlite3", "http", "urllib", "requests", "boto3"}
carpeta = Path(sys.argv[1])
arbol = ast.parse((carpeta / "dominio.py").read_text(encoding="utf-8"))
importados = set()
for nodo in ast.walk(arbol):
    if isinstance(nodo, ast.Import):
        importados |= {alias.name.split(".")[0] for alias in nodo.names}
    elif isinstance(nodo, ast.ImportFrom) and nodo.module:
        importados.add(nodo.module.split(".")[0])
violaciones = sorted(importados & PROHIBIDOS)
print(f"{carpeta}/dominio.py importa: {sorted(importados) or 'nada'}")
print("violaciones:", violaciones or "ninguna")
sys.exit(1 if violaciones else 0)
```

```text
$ python3 fitness_dependencias.py antes; echo "salida: $?"
antes/dominio.py importa: ['sqlite3']
violaciones: ['sqlite3']
salida: 1
```

```text
$ python3 fitness_dependencias.py despues; echo "salida: $?"
despues/dominio.py importa: nada
violaciones: ninguna
salida: 0
```

**Explicación por partes.**
- Línea 6: la lista de módulos de infraestructura que el dominio no puede importar.
- Línea 8: `ast.parse` lee el archivo como árbol de sintaxis; no lo ejecuta.
- Líneas 10–14: recoge los nombres de `import x` y de `from x import y`.
- Línea 15: la intersección de conjuntos deja solo los prohibidos que sí se importaron.
- Línea 18: el código de salida es lo que lee CI; `1` bloquea el cambio.

Si olvidas el argumento con la carpeta, la última línea del error es esta:

```text
$ python3 fitness_dependencias.py
IndexError: list index out of range
```

> **Error común.** Ejecutar `python3 fitness_dependencias.py` sin carpeta termina con `IndexError: list index out of range`. La lista
> `sys.argv` solo tiene el nombre del programa; la posición `1` no existe. Pasa la carpeta: `antes` o `despues`.

> **Buena práctica.** Toda regla de arquitectura que se pueda comprobar con un programa se comprueba con un programa.
> Lo que queda en un documento se cumple mientras alguien se acuerde.

#### Checkpoint 2.1
En el escenario de este tema, ¿qué parte cambia si la medida pasa de «cero duplicados» a «máximo 1 duplicado por cada 10 000 confirmaciones»?

Respuesta: solo la medida. Fuente, estímulo, artefacto, entorno y respuesta siguen iguales. Con una medida más laxa, quizás ya no hace falta la restricción, y cambia el trade-off.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/modulo-7/arquitectura` con las subcarpetas `antes` y `despues`.

#### Paso 2 · Escribe y mide el escenario
Crea `escenario.txt` y `escenario_unique.py`. Borra la línea `Medida:` y comprueba que sale `faltan: ['Medida:']`.

#### Paso 3 · Dibuja el C4
Copia el diagrama de contenedores y agrega un contenedor «Panel de auditoría» que lee la base de datos.

#### Paso 4 · Automatiza la regla
Escribe los dos `dominio.py`, el repositorio y `fitness_dependencias.py`. Ejecuta la función con ambas carpetas y anota los códigos de salida.

#### Resumen
- La **arquitectura** son las decisiones estructurales costosas de cambiar, no el dibujo.
- **Componentes** y **dependencias** se leen en el código: una dependencia es un `import` o una llamada.
- Un **atributo de calidad** se vuelve verificable con un **escenario de calidad** de seis partes.
- Todo **trade-off** se nombra y, si se puede, se mide: aquí, una fila menos a cambio de un índice más.
- El **modelo C4** documenta con niveles de zoom; el de contenedores muestra dónde vive cada decisión.
- Una **fitness function** vigila en cada cambio que la arquitectura siga cumpliendo sus reglas.

#### Ejercicio verificable 1
Básico. Ordena estas palabras en las seis partes del escenario: «base de datos caída», «API», «operación nocturna», «responder 503 con reintento», «monitor», «en menos de 1 s».

Respuesta esperada: fuente: monitor; estímulo: base de datos caída; artefacto: API; entorno: operación nocturna; respuesta: responder 503 con reintento; medida: en menos de 1 s.

#### Ejercicio verificable 2
Intermedio. Agrega la línea `from http import client` al final de `despues/dominio.py` y ejecuta la fitness function.

Respuesta esperada: `despues/dominio.py importa: ['http']`, `violaciones: ['http']` y `salida: 1`.

#### Ejercicio verificable 3
Reto. Amplía la fitness function para que también revise que `repositorio_sqlite.py` no importe `dominio`.

Respuesta esperada: una segunda lectura con `ast` sobre ese archivo y una regla `PROHIBIDOS_INFRA = {"dominio"}`. Con los archivos del tema, la salida sigue siendo `0`.

#### En el trabajo
Los equipos escriben sus escenarios de calidad en el documento de arquitectura y los revisan cuando cambia el tráfico
o el negocio. Las fitness functions corren en el pipeline junto a las pruebas: herramientas como import-linter
(Python) o ArchUnit (Java) automatizan reglas de dependencias como la de este tema.

</details>

### Tema 3: Diseño modular, principios, patrones y refactoring · Avanzado · 60 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- reconocer baja cohesión y alto acoplamiento en una función real y medirlos por sus `import`;
- definir una interfaz con `Protocol` e invertir la dependencia entre la regla y la base de datos;
- aplicar los patrones Repository y Adapter, y decir cuándo sobran;
- refactorizar con una prueba caracterizadora que demuestre que el comportamiento no cambió.

**Conceptos clave:** cohesión, acoplamiento, interfaz, principios SOLID, inversión de dependencias, patrón de diseño, Repository, Adapter, refactorización, prueba caracterizadora

Ya los conoces y no se repiten: **módulo** (Módulo 1, Tema 4); **composición**, **clase abstracta** y **polimorfismo**
(Módulo 1, Tema 7); **doble de prueba** (Módulo 5, Tema 2); **componente** y **dependencia** (Tema 2 de este módulo).
El catálogo completo de patrones está en el Módulo 13, y la técnica completa de refactorización en el Módulo 14.

#### El problema
La función `confirmar` de RutaFlow valida el PIN, abre SQLite, guarda y manda el SMS, todo junto. Producto pide
avisar por correo en vez de SMS. Pruebas pide verificar la regla del PIN sin crear una base de datos. Las dos cosas
obligan a tocar la misma función, que además ya funciona. ¿Cómo la reorganizas sin romper nada?

#### Glosario del tema

**cohesión**
- **Definición técnica:** grado en que los elementos de un módulo o función contribuyen a una sola responsabilidad.
- **En palabras sencillas:** qué tan relacionadas están las cosas que viven juntas.
- **Dónde se rompe la comparación:** alta cohesión no es «una línea por función»: es una sola **razón para cambiar**.
- **Ejemplo:** `antes/entregas.py` mezcla PIN, SQL y SMS (baja); `despues/dominio.py` solo tiene la regla y sus contratos (alta).
- **Error típico:** partir una función en trozos por tamaño, no por responsabilidad: quedan piezas que siempre cambian juntas.

**acoplamiento**
- **Definición técnica:** grado en que un módulo depende de los detalles internos de otro; a más acoplamiento, más cambios en cadena.
- **En palabras sencillas:** cuántos hilos te atan a otras piezas; si una se mueve, tú te mueves.
- **Dónde se rompe la comparación:** algo de acoplamiento es inevitable; el problema es depender de detalles que cambian.
- **Ejemplo:** `antes/entregas.py importa ['sqlite3']`; `despues/dominio.py importa ['typing']`, nada de infraestructura.
- **Error típico:** creer que separar en archivos reduce el acoplamiento; si el archivo nuevo importa al viejo, siguen atados.

**interfaz**
- **Definición técnica:** conjunto de operaciones (nombres, parámetros y resultado) que un componente ofrece, sin decir cómo las implementa; en Python se declara con `typing.Protocol`.
- **En palabras sencillas:** el enchufe: dice qué forma tiene la conexión, no qué aparato hay detrás.
- **Dónde se rompe la comparación:** `Protocol` no se revisa al ejecutar; un objeto sin el método falla recién al llamarlo.
- **Ejemplo:** `class RepositorioEntregas(Protocol): def marcar_entregado(self, guia: str) -> None: ...`.
- **Error típico:** pasar un objeto equivocado: `AttributeError: 'RepositorioMemoria' object has no attribute 'enviar'`.

**principios SOLID**
- **Definición técnica:** cinco guías de diseño orientado a objetos: responsabilidad única, abierto/cerrado, sustitución de Liskov, segregación de interfaces e inversión de dependencias.
- **En palabras sencillas:** cinco preguntas para revisar si una clase será fácil de cambiar mañana.
- **Dónde se rompe la comparación:** son guías, no leyes; aplicarlas donde nada cambia agrega capas sin beneficio.
- **Ejemplo:** responsabilidad única: el dominio cambia si cambia la regla del PIN; `adaptadores.py`, si cambia la base o el canal.
- **Error típico:** crear una interfaz por cada clase «por SOLID», aunque solo exista una implementación posible.

**inversión de dependencias**
- **Definición técnica:** principio por el que los módulos de alto nivel (reglas) no dependen de los de bajo nivel (infraestructura); ambos dependen de una abstracción que define el de alto nivel.
- **En palabras sencillas:** la regla dice «necesito algo que guarde»; quien la usa le entrega el que quiera.
- **Dónde se rompe la comparación:** se invierte la dirección del `import`, no la del flujo: los datos siguen yendo hacia SQLite.
- **Ejemplo:** `confirmar_entrega(guia, pin, repositorio, aviso)` recibe sus dependencias como parámetros.
- **Error típico:** olvidar pasar una: `TypeError: confirmar_entrega() missing 1 required positional argument: 'aviso'`.

**patrón de diseño**
- **Definición técnica:** solución con nombre a un problema de diseño que se repite, descrita por su intención, su estructura y sus consecuencias.
- **En palabras sencillas:** una receta conocida con nombre propio, para no reinventarla y para hablar rápido con el equipo.
- **Dónde se rompe la comparación:** la receta no se copia igual siempre; se adapta, y a veces la solución simple es mejor.
- **Ejemplo:** decir «aquí usamos un Repository» explica en tres palabras lo que hace `RepositorioSQLite`.
- **Error típico:** elegir el patrón antes de tener el problema; el código se llena de piezas que nadie necesita.

**Repository**
- **Definición técnica:** patrón que ofrece al dominio una interfaz tipo colección para guardar y recuperar objetos, ocultando el mecanismo de almacenamiento.
- **En palabras sencillas:** un archivador: le pides guardar o buscar, y no te importa si es papel, SQLite o la nube.
- **Dónde se rompe la comparación:** no es un envoltorio de cada consulta SQL; sus métodos hablan el idioma del negocio (`marcar_entregado`).
- **Ejemplo:** `RepositorioSQLite` y `RepositorioMemoria` cumplen el mismo `RepositorioEntregas`.
- **Error típico:** exponer métodos como `ejecutar_sql(consulta)`: el dominio vuelve a saber de SQL.

**Adapter**
- **Definición técnica:** patrón que convierte la interfaz de una pieza concreta (SQLite, un proveedor de SMS) en la interfaz que espera el cliente.
- **En palabras sencillas:** el adaptador de viaje: el enchufe del hotel es distinto, pero tu cargador funciona.
- **Dónde se rompe la comparación:** aquí el «enchufe» lo define tu dominio, no el fabricante.
- **Ejemplo:** `AvisoConsola` adapta `print` al contrato `Aviso`; mañana `AvisoCorreo` adaptará un servidor de correo.
- **Error típico:** meter reglas de negocio en el adaptador (por ejemplo, validar el PIN en `RepositorioSQLite`).

**refactorización**
- **Definición técnica:** cambio en la estructura interna del código que no altera su comportamiento observable, hecho en pasos pequeños y verificados.
- **En palabras sencillas:** ordenar el cuarto sin botar nada: todo sigue ahí, pero ahora encuentras las cosas.
- **Dónde se rompe la comparación:** si cambia lo que el programa responde, ya no es refactorización: es un cambio funcional.
- **Ejemplo:** `despues/entregas.py` conserva la firma `confirmar(ruta_db, guia, pin)`; `diff antes.txt despues.txt` no muestra diferencias.
- **Error típico:** mezclar en el mismo commit la refactorización y la funcionalidad nueva; si algo falla, no sabes cuál de las dos fue.

**prueba caracterizadora**
- **Definición técnica:** prueba que registra el comportamiento actual de un código, correcto o no, para detectar cualquier cambio durante una refactorización.
- **En palabras sencillas:** una foto del «antes» para compararla con el «después».
- **Dónde se rompe la comparación:** no dice si el comportamiento es bueno; solo si cambió.
- **Ejemplo:** `caracterizar.py` imprime las respuestas y el contenido de la base para tres casos; la salida se guarda en `antes.txt`.
- **Error típico:** «corregir» de paso lo que la foto muestra raro; primero se refactoriza igual, después se corrige con su propia prueba.

#### ► CÓMO FUNCIONA
Se empieza con una foto del comportamiento actual. Luego se separan las responsabilidades: la regla va al dominio con
sus interfaces; SQLite y el aviso van a adaptadores. La función vieja queda como fachada con la misma firma. Al
final se repite la foto: si es idéntica, la refactorización es segura.

```mermaid
flowchart LR
    S["olor: confirmar() hace todo"] --> C["prueba caracterizadora<br/>antes.txt"]
    C --> R["refactor pequeño<br/>dominio + adaptadores"]
    R --> D{"diff antes.txt despues.txt"}
    D -->|"sin diferencias"| OK["commit de refactor"]
    D -->|"hay diferencias"| R
```

Después de la refactorización, las dependencias apuntan hacia el dominio:

```mermaid
flowchart RL
    SQL["RepositorioSQLite<br/>adaptadores.py"] -.->|"cumple"| RP["RepositorioEntregas<br/>Protocol"]
    MEM["RepositorioMemoria"] -.->|"cumple"| RP
    CON["AvisoConsola"] -.->|"cumple"| AV["Aviso<br/>Protocol"]
    RP --- DOM["confirmar_entrega<br/>dominio.py"]
    AV --- DOM
```

#### Problema resuelto 3.1
Toma una foto del comportamiento de la función actual antes de tocarla.

**Razonamiento:**
1. La función devuelve un texto, imprime un SMS y escribe en la base: la foto debe capturar las tres cosas.
2. Se prueban tres casos: PIN válido, PIN con letra y PIN corto.
3. Se usa una base temporal para que la foto no dependa de datos viejos.

```python
# antes/entregas.py — una sola función valida, guarda y avisa
import sqlite3


def confirmar(ruta_db, guia, pin):
    if len(pin) != 6 or not pin.isdigit():
        return "error: PIN inválido"
    conexion = sqlite3.connect(ruta_db)
    conexion.execute("CREATE TABLE IF NOT EXISTS envio(guia TEXT PRIMARY KEY, estado TEXT)")
    conexion.execute("INSERT OR REPLACE INTO envio VALUES (?, 'entregado')", (guia,))
    conexion.commit()
    print(f"SMS al cliente: su envío {guia} fue entregado")
    return "ok"
```

```python
# caracterizar.py — registra lo que hace hoy confirmar(), sin juzgar si está bien
import sqlite3
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, sys.argv[1])          # carpeta con la versión a caracterizar
from entregas import confirmar

CASOS = [("RF-1", "123456"), ("RF-2", "12a456"), ("RF-3", "1234")]
with tempfile.TemporaryDirectory() as carpeta:
    ruta = str(Path(carpeta) / "rutaflow.db")
    for guia, pin in CASOS:
        print(f"{guia} {pin} -> {confirmar(ruta, guia, pin)}")
    filas = sqlite3.connect(ruta).execute("SELECT guia, estado FROM envio").fetchall()
    print("en la base:", filas)
```

```text
$ python3 caracterizar.py antes | tee antes.txt
SMS al cliente: su envío RF-1 fue entregado
RF-1 123456 -> ok
RF-2 12a456 -> error: PIN inválido
RF-3 1234 -> error: PIN inválido
en la base: [('RF-1', 'entregado')]
```

**Explicación por partes.**
- `antes/entregas.py`, línea 2: el `import sqlite3` ata la regla a una base concreta (acoplamiento).
- Líneas 6–7, 8–11 y 12: tres responsabilidades en una función: validar, guardar y avisar (baja cohesión).
- `caracterizar.py`, línea 7: la carpeta se recibe como argumento; así la misma foto sirve para «antes» y «después».
- Líneas 11–12: `tempfile.TemporaryDirectory` crea una carpeta que se borra sola al terminar.
- Líneas 15–16: la foto incluye lo que quedó guardado, no solo lo que se imprimió.
- `tee antes.txt` muestra la salida y además la guarda en un archivo para compararla después.

> **Buena práctica.** Guarda la foto en un archivo antes de cambiar una sola línea. Si la tomas a mitad de la
> refactorización, ya no es el «antes».

#### Problema resuelto 3.2
Separa la regla de la infraestructura con interfaces, repositorios y adaptadores. Conserva la firma pública y demuestra que nada cambió.

**Razonamiento:**
1. La regla (PIN válido → guardar → avisar) va a `dominio.py`, que define lo que necesita con dos `Protocol`.
2. SQLite y la consola van a `adaptadores.py`; también un repositorio y un aviso en memoria, para probar sin base.
3. `entregas.py` conserva `confirmar(ruta_db, guia, pin)` y solo conecta las piezas.
4. Se toma la foto otra vez y se compara con `diff`.

```python
# despues/dominio.py — la regla de negocio y sus contratos; no conoce SQLite ni SMS
from typing import Protocol


class RepositorioEntregas(Protocol):
    def marcar_entregado(self, guia: str) -> None: ...


class Aviso(Protocol):
    def enviar(self, mensaje: str) -> None: ...


def pin_valido(pin: str) -> bool:
    return len(pin) == 6 and pin.isdigit()


def confirmar_entrega(guia: str, pin: str, repositorio: RepositorioEntregas, aviso: Aviso) -> str:
    if not pin_valido(pin):
        return "error: PIN inválido"
    repositorio.marcar_entregado(guia)
    aviso.enviar(f"SMS al cliente: su envío {guia} fue entregado")
    return "ok"
```

```python
# despues/adaptadores.py — implementaciones concretas de los contratos del dominio
import sqlite3


class RepositorioSQLite:
    def __init__(self, ruta_db: str):
        self.ruta_db = ruta_db

    def marcar_entregado(self, guia: str) -> None:
        with sqlite3.connect(self.ruta_db) as conexion:
            conexion.execute("CREATE TABLE IF NOT EXISTS envio(guia TEXT PRIMARY KEY, estado TEXT)")
            conexion.execute("INSERT OR REPLACE INTO envio VALUES (?, 'entregado')", (guia,))


class RepositorioMemoria:
    def __init__(self):
        self.estados = {}

    def marcar_entregado(self, guia: str) -> None:
        self.estados[guia] = "entregado"


class AvisoConsola:
    def enviar(self, mensaje: str) -> None:
        print(mensaje)


class AvisoMemoria:
    def __init__(self):
        self.enviados = []

    def enviar(self, mensaje: str) -> None:
        self.enviados.append(mensaje)
```

```python
# despues/entregas.py — misma firma de antes; ahora solo conecta las piezas
from adaptadores import AvisoConsola, RepositorioSQLite
from dominio import confirmar_entrega


def confirmar(ruta_db, guia, pin):
    return confirmar_entrega(guia, pin, RepositorioSQLite(ruta_db), AvisoConsola())
```

```text
$ python3 caracterizar.py despues > despues.txt; diff antes.txt despues.txt; echo "diff: $?"
diff: 0
```

`diff` no imprime nada y termina con `0`: las dos fotos son idénticas. Ahora la regla se prueba sin SQLite:

```python
# prueba_dominio.py — prueba la regla sin SQLite ni consola
import sys

sys.path.insert(0, "despues")
from adaptadores import AvisoMemoria, RepositorioMemoria
from dominio import confirmar_entrega

repositorio, aviso = RepositorioMemoria(), AvisoMemoria()
print(confirmar_entrega("RF-9", "654321", repositorio, aviso))
print(confirmar_entrega("RF-8", "65432", repositorio, aviso))
print("guardado:", repositorio.estados)
print("avisos:", aviso.enviados)
```

```text
$ python3 prueba_dominio.py
ok
error: PIN inválido
guardado: {'RF-9': 'entregado'}
avisos: ['SMS al cliente: su envío RF-9 fue entregado']
```

Y el acoplamiento se ve en los `import` de cada archivo:

```python
# acoplamiento.py — lista de qué módulos importa cada archivo
import ast
import sys
from pathlib import Path

for ruta in sys.argv[1:]:
    arbol = ast.parse(Path(ruta).read_text(encoding="utf-8"))
    nombres = sorted({a.name for n in ast.walk(arbol) if isinstance(n, ast.Import) for a in n.names}
                     | {n.module for n in ast.walk(arbol) if isinstance(n, ast.ImportFrom)})
    funciones = [n.name for n in arbol.body if isinstance(n, (ast.FunctionDef, ast.ClassDef))]
    print(f"{ruta:<24} importa {nombres}  define {funciones}")
```

```text
$ python3 acoplamiento.py antes/entregas.py despues/dominio.py despues/adaptadores.py despues/entregas.py
antes/entregas.py        importa ['sqlite3']  define ['confirmar']
despues/dominio.py       importa ['typing']  define ['RepositorioEntregas', 'Aviso', 'pin_valido', 'confirmar_entrega']
despues/adaptadores.py   importa ['sqlite3']  define ['RepositorioSQLite', 'RepositorioMemoria', 'AvisoConsola', 'AvisoMemoria']
despues/entregas.py      importa ['adaptadores', 'dominio']  define ['confirmar']
```

**Explicación por partes.**
- `dominio.py`, líneas 5–10: dos interfaces. Dicen **qué** necesita la regla, no **cómo** se hace.
- Línea 17: la función recibe repositorio y aviso como parámetros: eso es la inversión de dependencias.
- `adaptadores.py`, líneas 5–12: el adaptador SQLite; `with` confirma la transacción al salir del bloque.
- Líneas 15–20 y 28–33: dobles de prueba en memoria que cumplen las mismas interfaces.
- `entregas.py`, línea 7: la fachada arma las piezas reales; quien la llamaba antes no nota el cambio.
- `acoplamiento.py`: solo `adaptadores.py` importa `sqlite3`; el dominio quedó libre de infraestructura.

Si llamas la regla sin uno de sus colaboradores:

```python
# error_sin_aviso.py — olvidar inyectar una dependencia
import sys

sys.path.insert(0, "despues")
from adaptadores import RepositorioMemoria
from dominio import confirmar_entrega

print(confirmar_entrega("RF-9", "654321", RepositorioMemoria()))
```

```text
$ python3 error_sin_aviso.py
TypeError: confirmar_entrega() missing 1 required positional argument: 'aviso'
```

> **Error común.** Olvidar inyectar una dependencia produce `TypeError: confirmar_entrega() missing 1 required positional argument: 'aviso'`. El mensaje dice qué parámetro
> faltó; pasa un objeto que cumpla `Aviso`, como `AvisoMemoria()`.

> **Error común.** Aplicar Repository y Adapter a todo. Si un script de 20 líneas solo escribirá siempre en un
> archivo, la interfaz extra solo agrega lectura. Usa estos patrones en los límites que cambian o que pruebas aparte.

> **Prevenir errores.** Separa en dos commits: primero la refactorización con `diff` vacío; después el cambio
> funcional (por ejemplo, `AvisoCorreo`) con su propia prueba.

#### Checkpoint 3.1
Producto pide avisar por correo. ¿Qué archivos tocas en la versión «después» y cuáles no?

Respuesta: agregas una clase `AvisoCorreo` en `adaptadores.py` y la usas en `entregas.py`. `dominio.py` no cambia: depende de `Aviso`, no de un canal concreto.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/modulo-7/diseno` con las subcarpetas `antes`, `despues` y `ts`.

#### Paso 2 · Toma la foto
Escribe `antes/entregas.py` y `caracterizar.py`. Ejecuta `python3 caracterizar.py antes | tee antes.txt`.

#### Paso 3 · Refactoriza en pasos pequeños
Escribe `dominio.py`, luego `adaptadores.py`, luego la fachada `entregas.py`. Tras cada archivo, compara la foto con `diff`.

#### Paso 4 · Prueba sin infraestructura
Ejecuta `prueba_dominio.py` y `acoplamiento.py`. Comprueba que solo `adaptadores.py` importa `sqlite3`.

#### Paso 5 · El mismo puerto en TypeScript
El mismo diseño se escribe en TypeScript con un puerto `DeliveryRepository`. En `ts/` crea `confirm-delivery.ts`:

```typescript
export type DeliveryCommand = Readonly<{
  commandId: string;
  shipmentId: string;
  occurredAt: string;
  recipientPin: string;
}>;

export interface DeliveryRepository {
  findCommandResult(commandId: string): Promise<DeliveryResult | null>;
  confirm(command: DeliveryCommand): Promise<DeliveryResult>;
}

export type DeliveryResult = Readonly<{ shipmentId: string; status: 'delivered' }>;

export async function confirmDelivery(
  command: DeliveryCommand,
  repository: DeliveryRepository,
): Promise<DeliveryResult> {
  if (!command.commandId || !command.shipmentId) throw new TypeError('command identifiers are required');
  if (!/^\d{6}$/.test(command.recipientPin)) throw new TypeError('recipientPin must contain six digits');

  const previousResult = await repository.findCommandResult(command.commandId);
  if (previousResult) return previousResult;

  // Una implementación SQL debe insertar commandId y cambiar el envío en una
  // única transacción con restricción UNIQUE(command_id).
  return repository.confirm(command);
}
```

Agrega un segundo adaptador, en memoria, sin tocar `confirmDelivery`:

```typescript
// main.ts — segundo adaptador del puerto, en memoria, sin tocar confirmDelivery
import { confirmDelivery } from './confirm-delivery.ts';
import type { DeliveryCommand, DeliveryRepository, DeliveryResult } from './confirm-delivery.ts';

class InMemoryDeliveryRepository implements DeliveryRepository {
  results = new Map<string, DeliveryResult>();

  async findCommandResult(commandId: string): Promise<DeliveryResult | null> {
    return this.results.get(commandId) ?? null;
  }

  async confirm(command: DeliveryCommand): Promise<DeliveryResult> {
    const result: DeliveryResult = { shipmentId: command.shipmentId, status: 'delivered' };
    this.results.set(command.commandId, result);
    return result;
  }
}

const repository = new InMemoryDeliveryRepository();
const command = { commandId: 'cmd-1', shipmentId: 'RF-4471', occurredAt: '2026-11-24T10:00:00Z', recipientPin: '482913' };
console.log(await confirmDelivery(command, repository));
console.log(await confirmDelivery(command, repository));
console.log('confirmaciones guardadas:', repository.results.size);
try {
  await confirmDelivery({ ...command, commandId: 'cmd-2', recipientPin: '4829' }, repository);
} catch (error) {
  console.log(`${(error as Error).name}: ${(error as Error).message}`);
}
```

Ejecútalo con Node.js. En la versión comprobada (22.23.5), `node` quita los tipos sin compilar:

```text
$ node main.ts; echo "salida: $?"
{ shipmentId: 'RF-4471', status: 'delivered' }
{ shipmentId: 'RF-4471', status: 'delivered' }
confirmaciones guardadas: 1
TypeError: recipientPin must contain six digits
salida: 0
```

La segunda llamada con `cmd-1` devuelve el resultado guardado y no agrega otra confirmación (línea 22). El PIN corto
se rechaza con `TypeError` (línea 25). Comprueba el puerto con Python:

```python
# verificar_puerto.py — el puerto tiene dos métodos y ninguna palabra de infraestructura
import re
from pathlib import Path

fuente = Path("confirm-delivery.ts").read_text(encoding="utf-8")
bloque = re.search(r"export interface DeliveryRepository \{(.*?)\n\}", fuente, re.S)
if not bloque:
    raise SystemExit("no se encontró DeliveryRepository")
cuerpo = bloque.group(1)
metodos = re.findall(r"^\s{2}(\w+)\(", cuerpo, re.M)
infra = re.findall(r"(?i)\b(sqlite|sql|http|fetch|dynamodb|aws)\b", cuerpo)
print("métodos:", ", ".join(metodos))
print("métodos esperados:", len(metodos) == 2)
print("referencias de infraestructura:", len(infra))
```

```text
$ python3 verificar_puerto.py
métodos: findCommandResult, confirm
métodos esperados: True
referencias de infraestructura: 0
```

#### Resumen
- **Cohesión** alta: cada módulo tiene una razón para cambiar; **acoplamiento** bajo: depende de pocos detalles ajenos.
- Una **interfaz** (`Protocol`) declara qué se necesita; la **inversión de dependencias** hace que la regla la reciba de afuera.
- Los **principios SOLID** guían el diseño; se aplican donde hay cambio real.
- Un **patrón de diseño** es una solución con nombre: **Repository** oculta el almacenamiento y **Adapter** traduce piezas concretas.
- Una **refactorización** cambia la estructura sin cambiar el comportamiento; la **prueba caracterizadora** lo demuestra.

#### Ejercicio verificable 1
Básico. En `antes/entregas.py`, señala las líneas de cada responsabilidad.

Respuesta esperada: validar el PIN, líneas 6–7; guardar en SQLite, líneas 8–11; avisar al cliente, línea 12.

#### Ejercicio verificable 2
Intermedio. Agrega `AvisoCorreo` en `adaptadores.py` que imprima `Correo: ...` y úsalo en un script con `RepositorioMemoria`.

Respuesta esperada: `Correo: SMS al cliente: su envío RF-9 fue entregado` y `ok`. `dominio.py` no se modificó.

#### Ejercicio verificable 3
Reto. Cambia en `dominio.py` el texto `"error: PIN inválido"` por `"PIN inválido"` y repite la foto.

Respuesta esperada: `diff` muestra dos líneas cambiadas (RF-2 y RF-3) y termina con `diff: 1`. Ya no es refactorización: es un cambio de comportamiento que necesita su propio criterio.

#### En el trabajo
Este patrón se llama arquitectura hexagonal o de puertos y adaptadores, y es común en backends de Java, Node.js y
Python. En sistemas heredados sin pruebas, la prueba caracterizadora es el primer paso de cualquier cambio: primero se
fija lo que hace hoy y después se mejora. Los equipos lo revisan en el pull request mirando que el `diff` del commit de
refactor no toque pruebas.

</details>

### Tema 4: Decisiones, documentación, deuda y evolución · Avanzado · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- registrar una decisión de arquitectura en un ADR con contexto, decisión, consecuencias y estado;
- comprobar con un programa que un ADR está completo;
- priorizar la deuda técnica por su costo y su interés, con números;
- evolucionar una función sin romper a quien la usa, con un aviso de deprecación.

**Conceptos clave:** decisión de arquitectura, ADR, deuda técnica, interés de la deuda, cambio compatible, deprecación

Este tema usa **trade-off** y **escenario de calidad** (Tema 2), **refactorización** (Tema 3), y **commit** y
**pull request** (Módulo 5, Temas 3 y 4).

#### El problema
Una desarrolladora nueva llega a RutaFlow y pregunta: «¿por qué los eventos de envío están en DynamoDB y no en
PostgreSQL como todo lo demás?». Nadie recuerda la razón: quien decidió ya no está. Además, la lista de «cosas que
arreglar algún día» tiene 40 entradas sin orden. ¿Cómo dejas memoria de las decisiones y cómo eliges qué deuda pagar primero?

#### Glosario del tema

**decisión de arquitectura**
- **Definición técnica:** elección que afecta la estructura o los atributos de calidad del sistema y que sería costosa de revertir.
- **En palabras sencillas:** una elección que, si sale mal, cuesta semanas deshacer.
- **Dónde se rompe la comparación:** no toda elección técnica lo es; el nombre de una variable se cambia en un minuto.
- **Ejemplo:** guardar `ShipmentEvents` en DynamoDB con clave `shipment_id` y orden `occurred_at`.
- **Error típico:** tomarla en una reunión y no escribirla; seis meses después parece un capricho.

**ADR**
- **Definición técnica:** *Architecture Decision Record*: documento corto y numerado que registra una decisión con su contexto, la decisión, sus consecuencias y su estado.
- **En palabras sencillas:** el acta de una decisión: por qué, qué se eligió y qué se aceptó perder.
- **Dónde se rompe la comparación:** un acta no se edita; un ADR tampoco: si la decisión cambia, se escribe uno nuevo que lo reemplaza.
- **Ejemplo:** `docs/adr/0001-shipment-events-dynamodb.md` → `secciones 3/3`, `estado: aceptado`.
- **Error típico:** omitir las consecuencias negativas; el borrador sale con `falta: ## Consecuencias`.

**deuda técnica**
- **Definición técnica:** costo futuro de trabajo adicional que se acumula al elegir hoy una solución más rápida o menos limpia que la adecuada.
- **En palabras sencillas:** un préstamo: ganas tiempo hoy y lo pagas después, con intereses.
- **Dónde se rompe la comparación:** a veces la deuda no se paga nunca porque el código se borra; entonces era la decisión correcta.
- **Ejemplo:** `confirmar() mezcla regla, SQLite y SMS` (la versión «antes» del Tema 3).
- **Error típico:** llamar deuda a todo lo que no te gusta; sin costo estimado, la lista no sirve para decidir.

**interés de la deuda**
- **Definición técnica:** costo recurrente que la deuda impone mientras no se paga, como horas extra por semana en cambios, fallos o esperas.
- **En palabras sencillas:** lo que te cobra cada semana no haber arreglado el problema.
- **Dónde se rompe la comparación:** el interés no es fijo: crece si esa parte del código se toca más seguido.
- **Ejemplo:** el índice faltante cuesta 1 h arreglarlo y 1.5 h por semana no hacerlo: se recupera en `0.7 sem`.
- **Error típico:** priorizar por lo que más molesta; la salida «después» muestra que lo molesto (nombres mezclados) tarda `20.0 sem` en pagarse.

**cambio compatible**
- **Definición técnica:** modificación de una interfaz pública tras la cual el código que ya la usaba sigue funcionando sin cambios.
- **En palabras sencillas:** mejorar la herramienta sin obligar a nadie a cambiar cómo la usa.
- **Dónde se rompe la comparación:** compatible no es idéntico: la función puede hacer más, pero lo viejo debe seguir igual.
- **Ejemplo:** `calcular_tarifa(peso_kg, urgente=False)`: las llamadas viejas con solo el peso siguen dando `10500.0`.
- **Error típico:** agregar un parámetro obligatorio: `TypeError: calcular_tarifa() missing 1 required positional argument: 'urgente'`.

**deprecación**
- **Definición técnica:** marca formal de que una interfaz será retirada en una versión futura; sigue funcionando, pero avisa y señala la alternativa.
- **En palabras sencillas:** el aviso de «este puente se cierra en marzo; use el nuevo».
- **Dónde se rompe la comparación:** Python oculta `DeprecationWarning` salvo en el programa principal y en las pruebas; quien no mira la salida no lo ve.
- **Ejemplo:** `tarifa()` emite `DeprecationWarning: tarifa() se retirará en la versión 3; usa calcular_tarifa()`.
- **Error típico:** borrar la función vieja sin aviso previo; el código de otros equipos se rompe el día del despliegue.

#### ► CÓMO FUNCIONA
Cada decisión importante se escribe como ADR al tomarla. Se implementa, se mide y, si llega evidencia nueva, se
revisa con un ADR que reemplaza al anterior. La deuda se anota con costo e interés y se paga en orden de
recuperación. Los cambios públicos pasan por una etapa de deprecación antes de retirar lo viejo.

```mermaid
flowchart LR
    DEC["decisión"] --> ADR["ADR 0001<br/>contexto · decisión · consecuencias"]
    ADR --> IMPL["implementación"] --> MET["métricas"]
    MET --> EV{"¿evidencia nueva?"}
    EV -->|"no"| KEEP["se mantiene"]
    EV -->|"sí"| ADR2["ADR 0002<br/>reemplaza a 0001"]
    IMPL --> DEBT["deuda anotada<br/>costo + interés"]
    DEBT --> PAY["pagar por semanas<br/>de recuperación"]
```

#### Problema resuelto 4.1
Escribe el ADR de los eventos de envío y comprueba con un programa que está completo.

**Razonamiento:**
1. Contexto: los datos que obligaron a decidir (volumen, forma de consulta), no opiniones.
2. Decisión: qué se elige y qué se descarta, en una o dos frases.
3. Consecuencias: una positiva, una negativa y la condición para revisar la decisión.
4. Estado: propuesto, aceptado, reemplazado u obsoleto.

```markdown
# ADR 0001: Guardar ShipmentEvents en DynamoDB

## Contexto
Cada envío produce entre 5 y 12 eventos de seguimiento y se consultan siempre por guía.

## Decisión
Usaremos DynamoDB con clave de partición `shipment_id` y clave de orden `occurred_at`.
```

```markdown
# ADR 0001: Guardar ShipmentEvents en DynamoDB

Estado: aceptado · Fecha: 2026-11-24

## Contexto
Cada envío produce entre 5 y 12 eventos de seguimiento y se consultan siempre por guía.
En temporada alta llegan 300 eventos por segundo y nunca se hacen uniones con otras tablas.

## Decisión
Usaremos DynamoDB con clave de partición `shipment_id` y clave de orden `occurred_at`.
Descartamos PostgreSQL para esta tabla: daría uniones que no necesitamos y exige dimensionar el servidor.

## Consecuencias
- Positiva: leer el historial de una guía es una sola consulta por clave.
- Negativa: un reporte «eventos por ciudad» necesita otra tabla o un índice secundario.
- Revisión: si aparecen 3 o más consultas que no usan `shipment_id`, se reabre esta decisión.
```

```python
# verificar_adr.py — un ADR completo tiene estado y las tres secciones
import re
import sys
from pathlib import Path

SECCIONES = ("## Contexto", "## Decisión", "## Consecuencias")
ruta = Path(sys.argv[1])
texto = ruta.read_text(encoding="utf-8")
faltan = [s for s in SECCIONES if s not in texto]
estado = re.search(r"^Estado: (propuesto|aceptado|reemplazado|obsoleto)", texto, re.M)
print(f"{ruta.name}: secciones {len(SECCIONES) - len(faltan)}/{len(SECCIONES)}")
print("estado:", estado.group(1) if estado else "FALTA")
for seccion in faltan:
    print("falta:", seccion)
sys.exit(1 if faltan or not estado else 0)
```

```text
$ python3 verificar_adr.py docs/adr/0001-borrador.md; echo "salida: $?"
0001-borrador.md: secciones 2/3
estado: FALTA
falta: ## Consecuencias
salida: 1
```

```text
$ python3 verificar_adr.py docs/adr/0001-shipment-events-dynamodb.md; echo "salida: $?"
0001-shipment-events-dynamodb.md: secciones 3/3
estado: aceptado
salida: 0
```

**Explicación por partes.**
- Línea 6: las tres secciones obligatorias, con su título exacto en Markdown.
- Línea 9: lista las que no aparecen en el texto.
- Línea 10: el estado debe ser una de cuatro palabras, al inicio de una línea; `re.M` hace que `^` marque cada línea.
- Línea 15: falta una sección **o** el estado → código 1.
- El ADR completo nombra lo que se pierde («reportes por ciudad necesitan otra tabla»): ese es el trade-off escrito.

> **Error común.** Escribir el título con otra forma, como `## Consecuencia` o `## consecuencias`. El verificador
> busca el texto exacto y responde `falta: ## Consecuencias`. Usa una plantilla de ADR y no la edites a mano.

> **Buena práctica.** Guarda los ADR junto al código, en `docs/adr/`, y agrégalos en el mismo pull request que
> implementa la decisión. Así la revisión discute la razón y el código a la vez.

#### Problema resuelto 4.2
Prioriza la deuda técnica de RutaFlow y evoluciona la función de tarifas sin romper a quien la usa.

**Razonamiento:**
1. Cada deuda lleva dos números: horas para arreglarla y horas que cuesta por semana.
2. Semanas de recuperación = costo ÷ interés. Se paga primero lo que se recupera antes.
3. Para la tarifa, el parámetro nuevo lleva valor por defecto, y la función vieja avisa antes de desaparecer.

```python
# deuda.py — registro de deuda técnica priorizado por cuánto tarda en pagarse
DEUDA = [
    # (descripción, horas para arreglarla, horas que cuesta cada semana sin arreglar)
    ("confirmar() mezcla regla, SQLite y SMS", 6, 3.0),
    ("pruebas lentas: 4 min por ejecución", 16, 2.0),
    ("nombres en inglés y español mezclados", 10, 0.5),
    ("sin índice en envio.guia", 1, 1.5),
]

print("ANTES: orden en que se anotó")
for descripcion, costo, interes in DEUDA:
    print(f"  {descripcion}")

print("DESPUÉS: orden por semanas para recuperar la inversión")
for descripcion, costo, interes in sorted(DEUDA, key=lambda d: d[1] / d[2]):
    print(f"  {costo / interes:5.1f} sem  {descripcion} ({costo} h, {interes} h/sem)")
```

```text
$ python3 deuda.py
ANTES: orden en que se anotó
  confirmar() mezcla regla, SQLite y SMS
  pruebas lentas: 4 min por ejecución
  nombres en inglés y español mezclados
  sin índice en envio.guia
DESPUÉS: orden por semanas para recuperar la inversión
    0.7 sem  sin índice en envio.guia (1 h, 1.5 h/sem)
    2.0 sem  confirmar() mezcla regla, SQLite y SMS (6 h, 3.0 h/sem)
    8.0 sem  pruebas lentas: 4 min por ejecución (16 h, 2.0 h/sem)
   20.0 sem  nombres en inglés y español mezclados (10 h, 0.5 h/sem)
```

Primero, la versión 2 **incompatible**:

```python
# tarifas_rota.py — versión 2 incompatible: el parámetro nuevo es obligatorio
def calcular_tarifa(peso_kg, urgente):
    base = 4200 * peso_kg
    return base + 3000 if urgente else base


print("llamada de la versión 1:", calcular_tarifa(2.5))
```

```text
$ python3 tarifas_rota.py
TypeError: calcular_tarifa() missing 1 required positional argument: 'urgente'
```

Ahora la versión 2 compatible, con deprecación de la versión 1:

```python
# tarifas.py — versión 2: agrega el recargo sin romper a quien usa la versión 1
import warnings


def calcular_tarifa(peso_kg, urgente=False):
    """Versión 2. El parámetro nuevo tiene valor por defecto: las llamadas viejas siguen sirviendo."""
    base = 4200 * peso_kg
    return base + 3000 if urgente else base


def tarifa(peso_kg):
    """Versión 1. Se conserva un tiempo y avisa que será retirada."""
    warnings.warn("tarifa() se retirará en la versión 3; usa calcular_tarifa()", DeprecationWarning, stacklevel=2)
    return calcular_tarifa(peso_kg)


print("v1:", tarifa(2.5))
print("v2:", calcular_tarifa(2.5))
print("v2 urgente:", calcular_tarifa(2.5, urgente=True))
```

```text
$ python3 tarifas.py
/home/estudiante/labs/modulo-7/adr/tarifas.py:17: DeprecationWarning: tarifa() se retirará en la versión 3; usa calcular_tarifa()
  print("v1:", tarifa(2.5))
v1: 10500.0
v2: 10500.0
v2 urgente: 13500.0
```

**Explicación por partes.**
- `deuda.py`, línea 15: `sorted` con `key` ordena por costo ÷ interés; la deuda más barata de recuperar va primero.
- `tarifas_rota.py`, línea 2: `urgente` no tiene valor por defecto, así que toda llamada vieja falla.
- `tarifas.py`, línea 5: `urgente=False` hace opcional el parámetro nuevo; la llamada de la línea 18 da lo mismo que antes.
- Línea 13: `warnings.warn` con `DeprecationWarning`; `stacklevel=2` señala la línea de **quien llamó** (la 17), no la de `tarifa`.
- La advertencia sale por la salida de errores y aparece antes del `print` porque se emite mientras se calcula `tarifa(2.5)`.

> **Error común.** Agregar un parámetro obligatorio a una función pública: `TypeError: calcular_tarifa() missing 1 required positional argument: 'urgente'`. El mensaje nombra el
> parámetro que falta. Dale un valor por defecto que conserve el comportamiento anterior.

> **Prevenir errores.** Ejecuta las pruebas con `python3 -W error::DeprecationWarning -m unittest`. Así cualquier uso
> de una función deprecada falla en CI antes de que la retiren.

#### Checkpoint 4.1
Dentro de un año, RutaFlow necesita reportes por ciudad todos los días. ¿Editas el ADR 0001?

Respuesta: no. Escribes un ADR 0002 con el contexto nuevo y la decisión nueva, y cambias el estado del 0001 a `reemplazado`. El 0001 queda como historia de por qué se decidió así en su momento.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/modulo-7/adr/docs/adr` y entra en `~/labs/modulo-7/adr`.

#### Paso 2 · Escribe y verifica el ADR
Crea el borrador y el ADR completo. Ejecuta `verificar_adr.py` con ambos y anota los códigos de salida.

#### Paso 3 · Registra tu deuda
Escribe `deuda.py` con cuatro deudas de tu propio proyecto, cada una con costo e interés, y ejecútalo.

#### Paso 4 · Evoluciona sin romper
Ejecuta `tarifas_rota.py` para ver el fallo y luego `tarifas.py`. Repite con `python3 -W error::DeprecationWarning tarifas.py` y observa que el aviso se vuelve error.

#### Resumen
- Una **decisión de arquitectura** es costosa de revertir; por eso se escribe.
- Un **ADR** tiene contexto, decisión, consecuencias y estado; no se edita, se reemplaza.
- La **deuda técnica** es trabajo futuro aceptado hoy; su **interés** es lo que cuesta cada semana sin pagarla.
- Se paga primero la deuda con menos semanas de recuperación (costo ÷ interés).
- Un **cambio compatible** no rompe a quien ya usaba la interfaz; la **deprecación** avisa antes de retirar lo viejo.

#### Ejercicio verificable 1
Básico. Quita la línea `Estado:` del ADR completo y ejecuta el verificador.

Respuesta esperada: `secciones 3/3`, `estado: FALTA` y `salida: 1`.

#### Ejercicio verificable 2
Intermedio. Agrega a `deuda.py` la deuda «sin respaldo de la base», con 4 h de costo y 4.0 h por semana de interés. ¿En qué posición queda?

Respuesta esperada: `1.0 sem`, en segundo lugar, después del índice (`0.7 sem`) y antes de `confirmar()` (`2.0 sem`).

#### Ejercicio verificable 3
Reto. Escribe el ADR 0002 que reemplaza al 0001 por la necesidad de reportes por ciudad, y cambia el estado del 0001.

Respuesta esperada: el 0002 pasa el verificador con `estado: aceptado` y su contexto cita al 0001; el 0001 pasa con `estado: reemplazado`.

#### En el trabajo
Muchos equipos guardan sus ADR en el repositorio y los revisan en el mismo pull request que el código. La deuda se
registra en el gestor de tareas con una etiqueta propia y se reserva un porcentaje fijo de cada iteración para
pagarla. En librerías y APIs públicas, la deprecación dura al menos una versión mayor y se anuncia en el CHANGELOG.

</details>

### Tema 5: Records de C#: igualdad por valor no implica inmutabilidad profunda · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- explicar qué compara la igualdad por valor de un record y en qué se diferencia de la identidad;
- crear una copia con `with` en C# y con `dataclasses.replace` en Python;
- demostrar que una lista dentro de un objeto «inmutable» se puede modificar y se comparte entre copias;
- lograr inmutabilidad profunda con tipos inmutables (`tuple`, `IReadOnlyList`/`ImmutableList`).

**Conceptos clave:** record, igualdad por valor, identidad, expresión `with`, dataclass congelada, inmutabilidad superficial, inmutabilidad profunda

Este tema usa **clase** y **objeto** (Módulo 1, Tema 6) y **cambio compatible** (Tema 4 de este módulo). Es una
comparación de diseño, no un curso de C#: el ejemplo C# se explica y se comprueba con su equivalente en Python.

#### El problema
RutaFlow guarda el historial de estados de cada envío en un objeto `Registro` que el equipo creía inmutable. Para
crear la versión 8 copian la 7 y le agregan «asignado». Al rato, la versión 7 también dice «asignado»: el historial
de auditoría cambió sin que nadie lo tocara. ¿Por qué una copia de un objeto «inmutable» modifica el original?

#### Glosario del tema

**record**
- **Definición técnica:** en C#, tipo declarado con `record` para el que el compilador genera igualdad por valor, `ToString`, deconstrucción y copia con `with`; en la forma posicional, sus propiedades son de solo inicialización.
- **En palabras sencillas:** una clase pensada para guardar datos, con la comparación y la copia ya hechas.
- **Dónde se rompe la comparación:** «solo inicialización» protege la propiedad, no el objeto al que apunta: la lista sigue siendo modificable.
- **Ejemplo:** `public record Registro(int Id, List<string> Estados);` en `Program.cs`.
- **Error típico:** asignar después de crear (`copia.Id = 9`): el compilador lo rechaza porque la propiedad es de solo inicialización.

**igualdad por valor**
- **Definición técnica:** criterio por el que dos objetos son iguales si todos sus campos son iguales, aunque sean objetos distintos en memoria.
- **En palabras sencillas:** dos billetes de 10 000 valen lo mismo aunque sean papeles distintos.
- **Dónde se rompe la comparación:** compara los campos con su propia igualdad; dos listas iguales en contenido dan `True` en Python, pero en C# `List<T>` compara referencias.
- **Ejemplo:** `Registro(4, ["a"]) == Registro(4, ["a"])` → `igualdad por valor: True`.
- **Error típico:** usar el objeto como clave de diccionario con un campo mutable: `TypeError: unhashable type: 'list'`.

**identidad**
- **Definición técnica:** propiedad de ser el mismo objeto en memoria; en Python se compara con `is`, en C# con `ReferenceEquals`.
- **En palabras sencillas:** no «iguales», sino **el mismo**: tu billete, no uno igual.
- **Dónde se rompe la comparación:** dos objetos pueden ser iguales por valor y distintos en identidad, como en la salida.
- **Ejemplo:** `Registro(4, ["a"]) is Registro(4, ["a"])` → `misma identidad: False`; `original.estados is copia.estados` → `True`.
- **Error típico:** comparar con `is` cuando quieres saber si los datos coinciden; usa `==`.

**expresión `with`**
- **Definición técnica:** en C#, `original with { Id = 8 }` crea un record nuevo copiando los campos del original y reemplazando los indicados; es una copia **superficial**.
- **En palabras sencillas:** fotocopiar una ficha y cambiarle un dato a la copia.
- **Dónde se rompe la comparación:** en una fotocopia, la lista impresa es otra hoja; aquí la copia apunta a **la misma** lista.
- **Ejemplo:** en Python, el equivalente es `replace(original, id=8)` (línea 12 de `registro_antes.py`).
- **Error típico:** modificar la lista de la copia creyendo que el original queda intacto: `original.estados: ['creado', 'asignado']`.

**dataclass congelada**
- **Definición técnica:** clase de Python decorada con `@dataclass(frozen=True)`; genera `__init__`, `__eq__` y `__hash__`, y prohíbe reasignar sus campos.
- **En palabras sencillas:** el equivalente de Python a un record: datos con comparación y sin reasignación.
- **Dónde se rompe la comparación:** «congelada» solo impide `objeto.campo = ...`; no congela lo que hay dentro del campo.
- **Ejemplo:** `@dataclass(frozen=True) class Registro:` en `registro_antes.py`, líneas 5–8.
- **Error típico:** intentar reasignar un campo: `dataclasses.FrozenInstanceError: cannot assign to field 'id'`.

**inmutabilidad superficial**
- **Definición técnica:** garantía de que los campos de un objeto no se pueden reasignar, sin garantía sobre el estado interno de los objetos a los que apuntan.
- **En palabras sencillas:** la caja está sellada, pero dentro hay una bolsa abierta.
- **Dónde se rompe la comparación:** desde fuera parece todo protegido; el cambio entra por la referencia compartida.
- **Ejemplo:** `copia.estados.append("asignado")` funciona aunque `Registro` sea congelado.
- **Error típico:** documentar un tipo como «inmutable» solo porque es record o `frozen`.

**inmutabilidad profunda**
- **Definición técnica:** garantía de que ni el objeto ni nada alcanzable desde él puede cambiar; se logra usando solo tipos inmutables en todos sus campos.
- **En palabras sencillas:** sellada la caja y sellado todo lo que hay dentro.
- **Dónde se rompe la comparación:** cuesta más: cada cambio crea objetos nuevos en lugar de modificar los existentes.
- **Ejemplo:** con `estados: tuple`, la versión 7 conserva `('creado',)` y la 8 tiene `('creado', 'asignado')`.
- **Error típico:** cambiar `list` por `tuple` pero seguir aceptando una lista en el constructor sin convertirla.

#### ► CÓMO FUNCIONA
Copiar un record copia sus **campos**. Si un campo es un número, la copia tiene su propio número. Si el campo es una
lista, la copia guarda la **misma referencia**: las dos versiones apuntan a una sola lista. Para que no se compartan
cambios, la lista debe ser de un tipo que no se pueda modificar.

```mermaid
flowchart LR
    O["original<br/>Id = 7"] -->|"Estados"| L["List: creado, asignado"]
    C["copia = original with { Id = 8 }<br/>Id = 8"] -->|"Estados"| L
    O2["original (tupla)<br/>id = 7"] --> T1["('creado',)"]
    C2["copia.con_estado('asignado')<br/>id = 8"] --> T2["('creado', 'asignado')"]
```

#### Problema resuelto 5.1
Muestra en C# que la copia con `with` comparte la lista, y comprueba lo mismo en Python con una dataclass congelada.

**Razonamiento:**
1. Se crea un registro con `Id = 7` y una lista, y una copia con `Id = 8`.
2. Se agrega un estado a la lista de la copia y se revisa la del original.
3. Se comparan dos registros iguales por valor y por identidad.

El programa C# y su proyecto:

```xml
<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup></Project>
```

```csharp
using System;
using System.Collections.Generic;

var original = new Registro(7, new List<string> { "creado" });
var copia = original with { Id = 8 };
copia.Estados.Add("asignado");
if (original.Id != 7 || copia.Id != 8) throw new Exception("Copia escalar incorrecta");
if (original.Estados.Count != 2) throw new Exception("Se esperaba referencia compartida");
Console.WriteLine("IDs independientes; lista compartida");
var a = new Punto(4, 5);
var b = new Punto(4, 5);
if (a != b) throw new Exception("Se esperaba igualdad por valor");
Console.WriteLine("Records con valores iguales comparan igual");
public record Registro(int Id, List<string> Estados);
public record Punto(int X, int Y);
```

Con el SDK de .NET 10 se ejecuta con `dotnet run --project Records.csproj`. Si las tres comprobaciones se cumplen, el
programa escribe dos líneas: «IDs independientes; lista compartida» y «Records con valores iguales comparan igual». Si
alguna falla, termina con la excepción de esa línea. Este programa no se ejecutó en esta edición (ver el entorno).

El mismo experimento en Python, ejecutado:

```python
# registro_antes.py — copia con dataclasses.replace y una lista compartida
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class Registro:
    id: int
    estados: list


original = Registro(7, ["creado"])
copia = replace(original, id=8)          # como `original with { Id = 8 }` en C#
copia.estados.append("asignado")

print("ids:", original.id, copia.id)
print("original.estados:", original.estados)
print("misma lista:", original.estados is copia.estados)
print("igualdad por valor:", Registro(4, ["a"]) == Registro(4, ["a"]))
print("misma identidad:", Registro(4, ["a"]) is Registro(4, ["a"]))
```

```text
$ python3 registro_antes.py
ids: 7 8
original.estados: ['creado', 'asignado']
misma lista: True
igualdad por valor: True
misma identidad: False
```

**Explicación por partes.**
- `Program.cs`, línea 5: `with` copia los campos y cambia solo `Id`.
- Línea 6: se agrega a la lista **de la copia**; la línea 8 comprueba que el original también tiene 2 estados.
- Líneas 10–12: dos `Punto` creados por separado son iguales con `!=`/`==`, porque el record compara por valor.
- `registro_antes.py`, línea 12: `replace` hace en Python lo mismo que `with`.
- Línea 17: `is` confirma que las dos versiones apuntan a la **misma** lista.
- Líneas 18–19: iguales por valor (`True`), distintas en identidad (`False`).

> **Error común.** Creer que `frozen=True` congela todo. Solo impide reasignar campos; reasignar uno termina con
> `dataclasses.FrozenInstanceError: cannot assign to field 'id'`, pero `copia.estados.append(...)` funciona sin aviso.

```python
# error_asignar.py — frozen=True impide reasignar un campo
from dataclasses import dataclass


@dataclass(frozen=True)
class Registro:
    id: int


registro = Registro(7)
registro.id = 8
```

```text
$ python3 error_asignar.py
dataclasses.FrozenInstanceError: cannot assign to field 'id'
```

#### Problema resuelto 5.2
Corrige el registro para que cada versión tenga su propio historial y sirva como clave de diccionario.

**Razonamiento:**
1. Una `tuple` no se puede modificar: agregar un estado obliga a crear una tupla nueva.
2. Un método `con_estado` devuelve un registro nuevo; el original nunca cambia.
3. Si todos los campos son inmutables, Python puede calcular el `hash` y el objeto sirve como clave.

```python
# registro_despues.py — una tupla hace la inmutabilidad profunda
from dataclasses import dataclass, replace


@dataclass(frozen=True)
class Registro:
    id: int
    estados: tuple

    def con_estado(self, estado):
        return replace(self, estados=self.estados + (estado,))


original = Registro(7, ("creado",))
copia = replace(original, id=8).con_estado("asignado")

print("ids:", original.id, copia.id)
print("original.estados:", original.estados)
print("copia.estados:", copia.estados)
indice = {original: "versión 1"}
print("sirve como clave:", indice[Registro(7, ("creado",))])
```

```text
$ python3 registro_despues.py
ids: 7 8
original.estados: ('creado',)
copia.estados: ('creado', 'asignado')
sirve como clave: versión 1
```

**Explicación por partes.**
- Línea 8: el campo es `tuple`, no `list`.
- Líneas 10–11: `self.estados + (estado,)` crea una tupla nueva; la coma hace que `(estado,)` sea una tupla de un elemento.
- Línea 15: copia con otro `id` y luego con un estado más; el original queda `('creado',)`.
- Líneas 20–21: un registro **igual** (no el mismo) encuentra la entrada: igualdad por valor más `hash`.

Con la versión de lista, usar el registro como clave falla:

```python
# error_clave.py — un registro con lista no puede ser clave de diccionario
from dataclasses import dataclass


@dataclass(frozen=True)
class Registro:
    id: int
    estados: list


indice = {Registro(7, ["creado"]): "versión 1"}
```

```text
$ python3 error_clave.py
TypeError: unhashable type: 'list'
```

> **Error común.** Usar como clave un objeto con un campo lista produce `TypeError: unhashable type: 'list'`. Una clave debe ser
> inmutable en profundidad; cambia la lista por una tupla.

> **Buena práctica.** En C#, declara la colección como `IReadOnlyList<string>` y guarda una `ImmutableList<string>`
> (de `System.Collections.Immutable`); así el tipo dice la verdad sobre lo que se puede modificar.

> **Rendimiento.** La inmutabilidad profunda copia en cada cambio. Con historiales de pocos estados, como aquí, el
> costo no importa; con miles de elementos se usan colecciones inmutables que comparten estructura.

#### Checkpoint 5.1
En `registro_antes.py`, ¿qué imprimiría `original == copia` después del `append`?

Respuesta: `False`, porque los `id` son distintos (7 y 8). Las listas sí son iguales: son la misma.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/modulo-7/records` y entra en ella.

#### Paso 2 · Reproduce el problema en Python
Escribe `registro_antes.py`, ejecútalo y confirma `misma lista: True`.

#### Paso 3 · Corrígelo
Escribe `registro_despues.py` y comprueba que el original conserva `('creado',)`.

#### Paso 4 · Compara con C#
Si tienes el SDK de .NET 10 (`dotnet --version`), crea `Records.csproj` y `Program.cs` y ejecuta `dotnet run --project Records.csproj`. Compara lo que ves con la descripción del Problema resuelto 5.1.

#### Resumen
- Un **record** de C# y una **dataclass congelada** de Python guardan datos con igualdad y copia generadas.
- La **igualdad por valor** compara campos; la **identidad** pregunta si es el mismo objeto.
- La **expresión `with`** (y `replace`) hace una copia superficial: las referencias se comparten.
- La **inmutabilidad superficial** impide reasignar campos; la **inmutabilidad profunda** exige que todo lo alcanzable sea inmutable.
- Un objeto usable como clave necesita igualdad por valor y campos inmutables.

#### Ejercicio verificable 1
Básico. En Python, ¿qué imprime `(1, [2]) == (1, [2])` y qué imprime `(1, [2]) is (1, [2])`?

Respuesta esperada: `True` y `False`. Las tuplas son iguales por valor, pero son dos objetos distintos.

#### Ejercicio verificable 2
Intermedio. En `registro_antes.py`, cambia la línea 12 por `copia = replace(original, id=8, estados=list(original.estados))` y ejecuta.

Respuesta esperada: `original.estados: ['creado']` y `misma lista: False`. La copia ahora tiene su propia lista, pero sigue siendo modificable.

#### Ejercicio verificable 3
Reto. Agrega a `registro_despues.py` un `__post_init__` que convierta a `tuple` cualquier lista recibida en `estados`.

Respuesta esperada: `object.__setattr__(self, "estados", tuple(self.estados))` dentro de `__post_init__`. `Registro(7, ["creado"])` queda con `('creado',)` y sirve como clave.

#### En el trabajo
Records y dataclasses se usan para eventos, mensajes y objetos de valor en el dominio. Un evento de auditoría que
cambia después de guardado es un fallo grave de cumplimiento. Por eso los equipos revisan en el pull request que los
tipos «inmutables» no tengan listas ni diccionarios mutables dentro.

</details>

### Tema 6: Desarrollo guiado por especificación con agentes de IA · Avanzado · 50 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- escribir una especificación corta con contexto, restricciones y criterios numerados;
- pedir a un agente de IA un cambio contra esa especificación, no contra una conversación;
- comprobar con un programa que cada criterio tiene prueba y que el cambio no salió de su alcance;
- devolver a la especificación los casos no previstos que aparecen en la revisión.

**Conceptos clave:** especificación, agente de IA, restricción de alcance, cobertura de criterios

Este tema usa **criterio de aceptación** y **trazabilidad** (Tema 1 de este módulo), **prueba unitaria** (Módulo 5,
Tema 2), y **pull request**, **revisión de código** e **integración continua** (Módulo 5, Tema 4).

#### El problema
Un desarrollador de RutaFlow le pide a un agente de IA: «agrega validación del PIN a confirmar». El agente entrega un
cambio que valida el PIN, agrega una dependencia nueva y deja un caso sin probar. Todo «parece funcionar». ¿Cómo
sabes qué pediste exactamente, si el agente lo cumplió y si tocó algo que no debía?

#### Glosario del tema

**especificación**
- **Definición técnica:** documento que fija qué debe hacer un cambio (criterios verificables), en qué contexto y con qué restricciones, y que sirve de fuente de verdad para implementarlo y revisarlo.
- **En palabras sencillas:** el encargo por escrito, tan claro que dos personas distintas construirían lo mismo.
- **Dónde se rompe la comparación:** no se escribe una vez y se olvida: cada caso no previsto vuelve a ella como criterio nuevo.
- **Ejemplo:** `SPEC.md`, con su línea `Contexto:` y los criterios `C1`, `C2` y `C3`.
- **Error típico:** pedir el cambio en un chat y no guardar el texto; después nadie puede revisar contra qué se hizo.

**agente de IA**
- **Definición técnica:** programa basado en un modelo de lenguaje que lee archivos, propone cambios y ejecuta comandos para cumplir una tarea, iterando con lo que observa.
- **En palabras sencillas:** un asistente que escribe código rápido, pero solo sabe lo que le escribiste y lo que ve en el repositorio.
- **Dónde se rompe la comparación:** a diferencia de un colega, no recuerda acuerdos de pasillo ni pregunta si algo le parece raro, salvo que se lo pidas.
- **Ejemplo:** el cambio de este tema: una prueba `test_C3_...` nueva y un `requirements.txt` que nadie pidió.
- **Error típico:** aceptar el cambio porque «las pruebas pasan», sin revisar qué archivos tocó.

**restricción de alcance**
- **Definición técnica:** límite explícito de qué partes del sistema puede modificar un cambio, comprobable con la lista de archivos modificados.
- **En palabras sencillas:** «puedes pintar esta pared y nada más».
- **Dónde se rompe la comparación:** algunos archivos siempre pueden cambiar con el código, como las pruebas; la regla los nombra.
- **Ejemplo:** `Contexto: solo se modifica entregas.py; no se agregan dependencias.` → `fuera de alcance: ['requirements.txt']`.
- **Error típico:** escribir la restricción solo en el mensaje al agente; si no se comprueba, se ignora sin que nadie lo note.

**cobertura de criterios**
- **Definición técnica:** proporción de criterios de la especificación que tienen al menos una prueba que dice verificarlos.
- **En palabras sencillas:** cuántas promesas de la especificación tienen quién las compruebe.
- **Dónde se rompe la comparación:** no es la cobertura de líneas del Módulo 5: puedes cubrir el 100 % de líneas y dejar un criterio sin probar.
- **Ejemplo:** antes, `criterios: 3  cubiertos: 2` y `sin prueba: C3`; después, `cubiertos: 3`.
- **Error típico:** nombrar la prueba con otro formato (`test_c3`) y que el verificador no la reconozca.

#### ► CÓMO FUNCIONA
La especificación es la fuente de verdad. El agente recibe la especificación, no una idea suelta. Su cambio pasa
por dos comprobaciones automáticas (alcance y cobertura), por las pruebas y por una revisión humana. Si la revisión
encuentra un caso no previsto, se agrega como criterio y el ciclo se repite.

```mermaid
flowchart LR
    SPEC["SPEC.md<br/>contexto + C1, C2, C3"] --> AGENT["agente de IA"]
    AGENT --> CHG["cambio + pruebas"]
    CHG --> ALC{"¿dentro del alcance?"}
    ALC -->|"no"| AGENT
    ALC -->|"sí"| COB{"¿todos los criterios<br/>con prueba?"}
    COB -->|"no"| AGENT
    COB -->|"sí"| REV["revisión humana + CI"]
    REV -->|"caso no previsto"| SPEC
    REV -->|"aprobado"| MAIN["rama principal"]
```

#### Problema resuelto 6.1
Escribe la especificación de la confirmación y comprueba qué criterios tienen prueba en la versión actual.

**Razonamiento:**
1. Cada criterio lleva un identificador `C<n>:` al inicio de la línea.
2. Cada prueba lleva el identificador en su nombre: `test_C1_...`.
3. Un programa compara los dos conjuntos: lo que falta y lo que sobra.

```markdown
# Confirmar entrega
Contexto: solo se modifica entregas.py; no se agregan dependencias.
C1: Dado un PIN de 6 dígitos, cuando se confirma, entonces el estado es "delivered".
C2: Dado un PIN con menos o más de 6 dígitos, cuando se confirma, entonces se lanza ValueError y el estado no cambia.
C3: Dado un PIN con letras, cuando se confirma, entonces se lanza ValueError.
```

```python
def confirmar(envio: dict, pin: str) -> dict:
    """Devuelve una copia del envío confirmado; no muta el original."""
    if len(pin) != 6 or not pin.isdigit():
        raise ValueError("recipientPin debe tener exactamente 6 dígitos")
    return {**envio, "estado": "delivered"}
```

```python
import unittest
from entregas import confirmar


class ConfirmarEntrega(unittest.TestCase):
    def test_C1_pin_valido_confirma(self):
        self.assertEqual(confirmar({"estado": "pending"}, "123456")["estado"], "delivered")

    def test_C2_pin_corto_rechaza_sin_cambiar(self):
        envio = {"estado": "pending"}
        with self.assertRaises(ValueError):
            confirmar(envio, "1234")
        self.assertEqual(envio["estado"], "pending")


if __name__ == "__main__":
    unittest.main()
```

```python
# verificar_cobertura.py — cada criterio de SPEC.md tiene al menos una prueba
import re
import sys
from pathlib import Path

# Criterios declarados en la especificación: C1, C2, ...
criterios = set(re.findall(r"^(C\d+):", Path("SPEC.md").read_text(encoding="utf-8"), re.M))
# Criterios que alguna prueba dice verificar: test_C1_..., test_C2_...
cubiertos = set(re.findall(r"def test_(C\d+)_", Path("test_entregas.py").read_text(encoding="utf-8")))

print(f"criterios: {len(criterios)}  cubiertos: {len(criterios & cubiertos)}")
for falta in sorted(criterios - cubiertos):
    print(f"sin prueba: {falta}")
for sobra in sorted(cubiertos - criterios):
    print(f"prueba sin criterio: {sobra}")
sys.exit(1 if criterios != cubiertos else 0)
```

```text
$ python3 verificar_cobertura.py; echo "salida: $?"
criterios: 3  cubiertos: 2
sin prueba: C3
salida: 1
```

**Explicación por partes.**
- `verificar_cobertura.py`, línea 7: `^(C\d+):` toma los identificadores al inicio de cada línea de `SPEC.md`.
- Línea 9: `def test_(C\d+)_` toma el identificador del nombre de cada prueba.
- Línea 11: `&` es la intersección: criterios que sí tienen prueba.
- Líneas 12–15: lo que falta (criterio sin prueba) y lo que sobra (prueba sin criterio).
- Línea 16: si los conjuntos no son iguales, código 1. C3 no tiene prueba aunque el código ya lo cumpla.

> **Buena práctica.** Pide al agente que nombre cada prueba con el criterio que comprueba. La trazabilidad del Tema 1
> se vuelve automática.

#### Problema resuelto 6.2
El agente entrega su cambio. Comprueba su alcance y su cobertura antes de revisarlo.

**Razonamiento:**
1. `git status --short` lista lo modificado (`M`) y lo nuevo (`??`) desde el último commit.
2. La especificación permite tocar `entregas.py` y las pruebas; cualquier otro archivo está fuera de alcance.
3. Si está fuera de alcance, se rechaza esa parte y se vuelve a comprobar.

La prueba que agregó el agente:

```python
import unittest
from entregas import confirmar


class ConfirmarEntrega(unittest.TestCase):
    def test_C1_pin_valido_confirma(self):
        self.assertEqual(confirmar({"estado": "pending"}, "123456")["estado"], "delivered")

    def test_C2_pin_corto_rechaza_sin_cambiar(self):
        envio = {"estado": "pending"}
        with self.assertRaises(ValueError):
            confirmar(envio, "1234")
        self.assertEqual(envio["estado"], "pending")

    def test_C3_pin_con_letras_rechaza(self):
        with self.assertRaises(ValueError):
            confirmar({"estado": "pending"}, "12a456")


if __name__ == "__main__":
    unittest.main()
```

Lo que cambió en el repositorio:

```text
$ git status --short
 M test_entregas.py
?? requirements.txt
```

```python
# verificar_alcance.py — el cambio solo toca los archivos que permite SPEC.md
import re
import subprocess
import sys
from pathlib import Path

contexto = re.search(r"^Contexto: solo se modifica (.+?);", Path("SPEC.md").read_text(encoding="utf-8"), re.M)
permitidos = {nombre.strip() for nombre in contexto.group(1).split(",")}
permitidos |= {"test_entregas.py"}  # las pruebas siempre pueden crecer
salida = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True)
cambiados = {linea[3:] for linea in salida.stdout.splitlines()}  # modificados y nuevos
print("cambiados:", sorted(cambiados))
fuera = sorted(cambiados - permitidos)
print("fuera de alcance:", fuera or "ninguno")
sys.exit(1 if fuera else 0)
```

```text
$ python3 verificar_alcance.py; echo "salida: $?"
cambiados: ['requirements.txt', 'test_entregas.py']
fuera de alcance: ['requirements.txt']
salida: 1
```

Se descarta el archivo que nadie pidió y se repiten las comprobaciones:

```text
$ rm requirements.txt && python3 verificar_alcance.py; echo "salida: $?"
cambiados: ['test_entregas.py']
fuera de alcance: ninguno
salida: 0
```

```text
$ python3 verificar_cobertura.py; echo "salida: $?"
criterios: 3  cubiertos: 3
salida: 0
```

```text
$ python3 -m unittest -v
test_C1_pin_valido_confirma (test_entregas.ConfirmarEntrega.test_C1_pin_valido_confirma) ... ok
test_C2_pin_corto_rechaza_sin_cambiar (test_entregas.ConfirmarEntrega.test_C2_pin_corto_rechaza_sin_cambiar) ... ok
test_C3_pin_con_letras_rechaza (test_entregas.ConfirmarEntrega.test_C3_pin_con_letras_rechaza) ... ok

----------------------------------------------------------------------
Ran 3 tests in 0.000s

OK
```

**Explicación por partes.**
- `verificar_alcance.py`, línea 7: lee de `SPEC.md` la lista de archivos permitidos, entre «solo se modifica» y el punto y coma.
- Línea 9: las pruebas siempre se pueden tocar; la regla lo dice en el código, no en la memoria de alguien.
- Líneas 10–11: `git status --porcelain` da una línea por archivo; desde la posición 3 está el nombre.
- Línea 13: la resta de conjuntos deja solo los archivos no permitidos.
- `unittest -v` muestra cada prueba con su nombre: la evidencia nombra los criterios.

Si ejecutas el verificador en una carpeta que no es un repositorio Git, la última línea del error es esta:

```text
$ python3 verificar_alcance.py
subprocess.CalledProcessError: Command '['git', 'status', '--porcelain']' returned non-zero exit status 128.
```

> **Error común.** Ejecutar `verificar_alcance.py` fuera del repositorio produce `subprocess.CalledProcessError: Command '['git', 'status', '--porcelain']' returned non-zero exit status 128.`. El código 128
> es la respuesta de `git` cuando no encuentra un repositorio. Entra en la carpeta del proyecto y repite.

> **Prevenir errores.** Ejecuta las dos comprobaciones en CI en cada pull request, también en los que abre un agente.
> Lo que se revisa a ojo se revisa bien un día y mal al siguiente.

#### Checkpoint 6.1
Si el agente renombra la prueba a `test_c3_pin_con_letras`, ¿qué responde `verificar_cobertura.py`?

Respuesta: `cubiertos: 2` y `sin prueba: C3`, con salida 1. La expresión busca `C` mayúscula; la prueba existe, pero perdió su trazabilidad.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara el repositorio
Crea `~/labs/modulo-7/spec`, escribe `SPEC.md`, `entregas.py`, `test_entregas.py`, los dos verificadores y un `.gitignore` con `__pycache__/`. Haz `git init` y un primer commit.

#### Paso 2 · Mide la cobertura inicial
Ejecuta `verificar_cobertura.py` y confirma `sin prueba: C3`.

#### Paso 3 · Pide el cambio
Entrega `SPEC.md` completo a tu agente de IA y pídele: «agrega las pruebas que faltan para cumplir la especificación». Si no usas un agente, escribe tú la prueba `test_C3_...`.

#### Paso 4 · Comprueba alcance y cobertura
Ejecuta `git status --short`, `verificar_alcance.py`, `verificar_cobertura.py` y `python3 -m unittest -v`. Descarta lo que esté fuera de alcance y repite.

#### Resumen
- Una **especificación** escrita es la fuente de verdad del cambio, para quien lo hace y para quien lo revisa.
- Un **agente de IA** cumple lo que está escrito y ve en el repositorio; lo demás lo adivina.
- La **restricción de alcance** se comprueba con la lista de archivos que cambiaron.
- La **cobertura de criterios** exige al menos una prueba por criterio, unidas por el identificador.
- Los casos no previstos vuelven a la especificación como criterios nuevos.

#### Ejercicio verificable 1
Básico. Después del Problema resuelto 6.2, agrega a `SPEC.md` el criterio `C4: Dado un PIN vacío, cuando se confirma, entonces se lanza ValueError.` y ejecuta `verificar_cobertura.py`.

Respuesta esperada: `criterios: 4  cubiertos: 3`, `sin prueba: C4` y `salida: 1`.

#### Ejercicio verificable 2
Intermedio. Crea un archivo `notas.txt` en el repositorio y ejecuta `verificar_alcance.py`.

Respuesta esperada: `fuera de alcance: ['notas.txt']` y `salida: 1`.

#### Ejercicio verificable 3
Reto. Ejecuta esta línea en la carpeta del repositorio:

```text
$ python3 -c 'from entregas import confirmar; print(confirmar({"estado": "pending"}, "12345²"))'
{'estado': 'delivered'}
```

El PIN `12345²` termina en un superíndice, no en un dígito, y aun así se confirmó. Agrega el criterio, la prueba y la corrección.

Respuesta esperada: `C5: Dado un PIN con caracteres que no son 0-9, cuando se confirma, entonces se lanza ValueError.` La corrección cambia `pin.isdigit()` por `pin.isascii() and pin.isdigit()`; `test_C5_...` pasa y la cobertura queda `5/5` si también cubriste C4.

#### En el trabajo
Los equipos que trabajan con agentes guardan las especificaciones en el repositorio, junto al código. El agente abre
un pull request como cualquier persona, y CI ejecuta las mismas comprobaciones de alcance, cobertura y pruebas. La
revisión humana se concentra en lo que una máquina no ve: si la especificación pedía lo correcto.

</details>

### Tema 7: Evaluar una skill de agente antes de usarla: validar, deduplicar y medir · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- validar que una skill está bien formada y no contiene datos personales;
- detectar skills duplicadas midiendo el parecido de sus descripciones con el índice de Jaccard;
- decidir con una prueba A/B si una skill mejora el resultado frente a no usarla;
- leer el veredicto de un evaluador de tres niveles y corregir lo que marca.

**Conceptos clave:** skill de agente, cabecera YAML, datos personales, índice de Jaccard, prueba A/B

Este tema usa **agente de IA** y **especificación** (Tema 6 de este módulo), y **pull request** (Módulo 5, Tema 4).

#### El problema
El equipo de RutaFlow tiene una carpeta `skills/` con instrucciones reutilizables para su agente de IA. Cada persona
agregó las suyas. Hay dos que hacen casi lo mismo, una tiene el correo y la cédula de un revisor, y nadie sabe si
alguna mejora algo. ¿Cómo decides cuáles se quedan antes de que el agente las use en todos los pull requests?

#### Glosario del tema

**skill de agente**
- **Definición técnica:** paquete de instrucciones reutilizables (una carpeta con un `SKILL.md`) que un agente de IA carga cuando su descripción coincide con la tarea.
- **En palabras sencillas:** una receta guardada que el agente saca del cajón cuando la necesita.
- **Dónde se rompe la comparación:** el agente elige la receta por su descripción; si dos descripciones se parecen, puede sacar la equivocada.
- **Ejemplo:** `skills/generar-changelog/SKILL.md`, con nombre, descripción y tres pasos.
- **Error típico:** escribir una descripción genérica («ayuda con PRs»); el agente no sabe cuándo usarla.

**cabecera YAML**
- **Definición técnica:** bloque entre dos líneas `---` al inicio de un archivo Markdown, con pares `clave: valor` (formato YAML) que describen el archivo.
- **En palabras sencillas:** la etiqueta de la receta: cómo se llama y para qué sirve.
- **Dónde se rompe la comparación:** este evaluador lee solo pares simples `clave: valor`; un YAML con listas o varias líneas necesita un lector completo.
- **Ejemplo:** `name: revisar-pr` y `description: Revisa un pull request de RutaFlow ...`.
- **Error típico:** olvidar las líneas `---`; el evaluador responde `sin cabecera YAML`.

**datos personales**
- **Definición técnica:** información que identifica o hace identificable a una persona, como correo, número de documento o teléfono (en inglés, *PII*).
- **En palabras sencillas:** cualquier dato que diga quién es alguien.
- **Dónde se rompe la comparación:** una expresión regular encuentra formas típicas, no todos los casos; la revisión humana sigue siendo necesaria.
- **Ejemplo:** `soporte@rutaflow.co` y `1020304050` en `resumir-pr` → `contiene datos personales`.
- **Error típico:** dejar datos reales «de ejemplo» en una skill; el agente los copia en textos que verá mucha gente.

**índice de Jaccard**
- **Definición técnica:** medida de parecido entre dos conjuntos: tamaño de la intersección dividido por tamaño de la unión; va de 0 (nada en común) a 1 (iguales).
- **En palabras sencillas:** de todas las palabras que usan las dos descripciones, qué parte comparten.
- **Dónde se rompe la comparación:** compara palabras, no significado: «revisar» y «auditar» cuentan como distintas.
- **Ejemplo:** las descripciones de `resumir-pr` y `revisar-pr` comparten casi todo → `se parecen 91%`.
- **Error típico:** dividir sin revisar que la unión no esté vacía; dos descripciones vacías darían división por cero.

**prueba A/B**
- **Definición técnica:** experimento que ejecuta las mismas tareas con dos variantes (A sin la skill, B con ella) y compara una métrica de éxito.
- **En palabras sencillas:** probar con y sin la receta, en las mismas condiciones, y contar cuántas veces sale bien.
- **Dónde se rompe la comparación:** con 10 tareas, una diferencia pequeña puede ser azar; el Módulo 9 explica cuánta evidencia hace falta.
- **Ejemplo:** `éxito 40% sin la skill -> 80% con ella (aporta)`.
- **Error típico:** medir con tareas distintas en cada variante; la diferencia ya no se puede atribuir a la skill.

#### ► CÓMO FUNCIONA
Cada skill pasa por tres niveles en orden. El primero revisa forma y seguridad. El segundo busca duplicados contra
las demás. El tercero mide si mejora el resultado. Una falla en el nivel 1 o un duplicado bloquea la publicación.

```mermaid
flowchart LR
    S["skills/*/SKILL.md"] --> N1{"Nivel 1<br/>¿bien formada y sin datos personales?"}
    N1 -->|no| X["corregir antes de seguir"]
    N1 -->|sí| N2{"Nivel 2<br/>¿Jaccard ≥ 0,6 con otra?"}
    N2 -->|sí| M["fusionar o separar"]
    N2 -->|no| N3{"Nivel 3<br/>¿A/B mejora ≥ 20 puntos?"}
    N3 -->|sí| P["publicar"]
    N3 -->|no| R["reescribir o descartar"]
```

#### Problema resuelto 7.1
Evalúa las tres skills del equipo y los resultados de la prueba A/B de `generar-changelog`.

**Razonamiento:**
1. Nivel 1: el nombre coincide con la carpeta, la descripción tiene entre 20 y 1024 caracteres y no hay datos personales.
2. Nivel 2: para cada par, el índice de Jaccard de sus descripciones; desde 0,6 se marca.
3. Nivel 3: tasa de éxito con y sin la skill en las mismas 10 tareas.

```markdown
---
name: resumir-pr
description: Revisa un pull request de RutaFlow buscando errores de lógica y pruebas faltantes en el diff.
---
1. Lee el diff.
2. Resume los cambios. Contacto del equipo: soporte@rutaflow.co, cédula del revisor 1020304050.
```

```markdown
---
name: revisar-pr
description: Revisa un pull request de RutaFlow buscando errores de lógica y pruebas faltantes en el diff del cambio.
---
1. Lee el diff completo.
2. Marca cada error de lógica con archivo y línea.
3. Lista las pruebas que faltan para los casos nuevos.
```

```markdown
---
name: generar-changelog
description: Redacta la entrada del CHANGELOG a partir de los commits fusionados desde la última versión publicada.
---
1. Lista los commits desde la última etiqueta.
2. Agrúpalos en Agregado, Cambiado y Corregido.
3. Escribe una línea por cambio, en pasado y sin jerga interna.
```

```json
{
  "skill": "generar-changelog",
  "tareas": 10,
  "sin_skill": [1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
  "con_skill": [1, 1, 1, 1, 0, 1, 1, 1, 1, 0]
}
```

```python
"""Evalúa skills de agentes en tres niveles.

Nivel 1: ¿está bien formada y es segura?  Nivel 2: ¿ya existe otra igual?
Nivel 3: ¿mejora el resultado frente a no usarla (prueba A/B)?
"""
import json
import re
import sys
from pathlib import Path

PII = re.compile(r"[\w.-]+@[\w-]+\.\w+|\b\d{8,10}\b")  # correos y números tipo cédula
UMBRAL_DUPLICADO = 0.6   # parecido de descripciones a partir del cual se revisa a mano
MEJORA_MINIMA = 0.2      # la skill debe subir la tasa de éxito al menos 20 puntos


def leer(ruta: Path) -> dict:
    texto = ruta.read_text(encoding="utf-8")
    cabecera = re.match(r"---\n(.*?)\n---\n(.*)", texto, re.S)
    if not cabecera:
        return {"nombre": ruta.parent.name, "descripcion": "", "error": "sin cabecera YAML", "cuerpo": texto}
    campos = dict(re.findall(r"^(\w+):\s*(.+)$", cabecera.group(1), re.M))
    return {"nombre": campos.get("name", ""), "descripcion": campos.get("description", ""),
            "cuerpo": cabecera.group(2), "carpeta": ruta.parent.name}


def nivel1(skill: dict) -> list[str]:
    problemas = []
    if "error" in skill:
        return [skill["error"]]
    if skill["nombre"] != skill["carpeta"]:
        problemas.append("el nombre no coincide con la carpeta")
    if not 20 <= len(skill["descripcion"]) <= 1024:
        problemas.append("la descripción debe tener entre 20 y 1024 caracteres")
    if PII.search(skill["cuerpo"]):
        problemas.append("contiene datos personales")
    return problemas


def palabras(texto: str) -> set[str]:
    return {p for p in re.findall(r"\w+", texto.lower()) if len(p) > 3}


def parecido(a: str, b: str) -> float:
    pa, pb = palabras(a), palabras(b)
    return len(pa & pb) / len(pa | pb) if pa | pb else 0.0  # índice de Jaccard


def nivel2(skills: list[dict]) -> list[str]:
    avisos = []
    for i, a in enumerate(skills):
        for b in skills[i + 1:]:
            valor = parecido(a["descripcion"], b["descripcion"])
            if valor >= UMBRAL_DUPLICADO:
                avisos.append(f"{a['nombre']} y {b['nombre']} se parecen {valor:.0%}")
    return avisos


def nivel3(ruta: Path) -> str:
    datos = json.loads(ruta.read_text(encoding="utf-8"))
    sin = sum(datos["sin_skill"]) / datos["tareas"]
    con = sum(datos["con_skill"]) / datos["tareas"]
    veredicto = "aporta" if con - sin >= MEJORA_MINIMA else "no aporta lo suficiente"
    return f"{datos['skill']}: éxito {sin:.0%} sin la skill -> {con:.0%} con ella ({veredicto})"


skills = [leer(p) for p in sorted(Path("skills").glob("*/SKILL.md"))]
fallas = 0
print("Nivel 1 · validación")
for skill in skills:
    problemas = nivel1(skill)
    fallas += bool(problemas)
    print(f"  {skill['nombre']:<18} {'ok' if not problemas else '; '.join(problemas)}")
print("Nivel 2 · duplicados")
duplicados = nivel2(skills)
for aviso in duplicados or ["sin duplicados"]:
    print(f"  {aviso}")
print("Nivel 3 · prueba A/B")
print(f"  {nivel3(Path('resultados-ab.json'))}")
sys.exit(1 if fallas or duplicados else 0)
```

```text
$ python3 evaluar_skill.py; echo "salida: $?"
Nivel 1 · validación
  generar-changelog  ok
  resumir-pr         contiene datos personales
  revisar-pr         ok
Nivel 2 · duplicados
  resumir-pr y revisar-pr se parecen 91%
Nivel 3 · prueba A/B
  generar-changelog: éxito 40% sin la skill -> 80% con ella (aporta)
salida: 1
```

**Explicación por partes.**
- Línea 11: la expresión busca correos (`algo@dominio.ext`) y números de 8 a 10 cifras, como una cédula.
- Líneas 18–21: separa la cabecera del cuerpo y lee sus pares `clave: valor`.
- Líneas 39–40: las palabras de más de 3 letras, en minúscula, sin repetir.
- Línea 45: el índice de Jaccard; si las dos descripciones están vacías, devuelve `0.0` en lugar de dividir por cero.
- Líneas 50–54: compara cada par una sola vez (`skills[i + 1:]`).
- Líneas 60–62: tasas de éxito y veredicto según la mejora mínima.
- Línea 79: cualquier falla del nivel 1 o un duplicado dejan código de salida 1.

> **Ingeniería de software.** El evaluador es una fitness function (Tema 2) para skills: corre en CI y bloquea el
> pull request que agrega una skill duplicada o con datos personales.

#### Problema resuelto 7.2
Corrige lo que marcó el evaluador y vuelve a ejecutarlo.

**Razonamiento:**
1. `resumir-pr` tiene datos personales **y** duplica a `revisar-pr`, que es más completa.
2. Se fusiona: se conserva `revisar-pr` y `resumir-pr` sale de `skills/`, sin borrarla, a una carpeta aparte.
3. Se repite la evaluación completa.

```text
$ mkdir -p descartadas && mv skills/resumir-pr descartadas/ && python3 evaluar_skill.py; echo "salida: $?"
Nivel 1 · validación
  generar-changelog  ok
  revisar-pr         ok
Nivel 2 · duplicados
  sin duplicados
Nivel 3 · prueba A/B
  generar-changelog: éxito 40% sin la skill -> 80% con ella (aporta)
salida: 0
```

**Explicación por partes.**
- `mv skills/resumir-pr descartadas/`: la carpeta sale del patrón `skills/*/SKILL.md` y el evaluador ya no la ve.
- El nivel 1 queda en `ok` para las dos skills restantes; el nivel 2 responde `sin duplicados`.
- El nivel 3 no cambia: la prueba A/B es de `generar-changelog`, que sigue aportando.

Si el archivo de resultados tiene `"tareas": 0`, la última línea del error es esta:

```text
$ python3 evaluar_skill.py
ZeroDivisionError: division by zero
```

> **Error común.** Un experimento sin tareas termina con `ZeroDivisionError: division by zero` en la línea 60. No hay tasa de éxito
> sin tareas: corre el experimento antes de evaluar, o valida que `tareas` sea mayor que cero.

> **Buena práctica.** Guarda los resultados A/B en el repositorio junto a la skill. Si alguien cambia la skill, se
> repite la prueba y se compara con el número anterior.

#### Checkpoint 7.1
Si `revisar-pr` tuviera la descripción «Revisa pruebas del pedido» y otra skill «Revisa pruebas del envío», ¿las marca el nivel 2?

Respuesta: no. Las palabras de más de 3 letras son {revisa, pruebas, pedido} y {revisa, pruebas, envío}: comparten 2 de 4, índice 0,5, por debajo de 0,6.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/modulo-7/evaluar-skills` con `skills/generar-changelog`, `skills/resumir-pr` y `skills/revisar-pr`, cada una con su `SKILL.md`.

#### Paso 2 · Agrega los resultados A/B
Crea `resultados-ab.json` con las 10 tareas de cada variante.

#### Paso 3 · Evalúa
Escribe `evaluar_skill.py` y ejecútalo. Anota cada problema que marca y su nivel.

#### Paso 4 · Corrige y repite
Mueve `resumir-pr` a `descartadas/` y repite hasta obtener `salida: 0`.

#### Resumen
- Una **skill de agente** es una carpeta con un `SKILL.md`; el agente la elige por su descripción.
- La **cabecera YAML** entre `---` da nombre y descripción; sin ella la skill no pasa el nivel 1.
- Los **datos personales** no van en una skill; una expresión regular encuentra los casos típicos.
- El **índice de Jaccard** mide cuántas palabras comparten dos descripciones; desde 0,6 se revisa a mano.
- Una **prueba A/B** con las mismas tareas decide si la skill mejora el resultado.

#### Ejercicio verificable 1
Básico. Crea `skills/notas/SKILL.md` con una sola línea, `1. Toma notas.`, sin cabecera, y ejecuta el evaluador.

Respuesta esperada: en el nivel 1, la línea de `notas` dice `sin cabecera YAML`, y el programa termina con `salida: 1`.

#### Ejercicio verificable 2
Intermedio. Cambia `con_skill` a `[1, 0, 1, 0, 0, 1, 0, 1, 1, 0]` y ejecuta.

Respuesta esperada: `generar-changelog: éxito 40% sin la skill -> 50% con ella (no aporta lo suficiente)`. La mejora es de 10 puntos, menos que los 20 exigidos.

#### Ejercicio verificable 3
Reto. Amplía el nivel 1 para que también marque números de teléfono celular colombianos de 10 cifras que empiezan por 3.

Respuesta esperada: la expresión actual ya los encuentra, porque `\b\d{8,10}\b` incluye 10 cifras. Para distinguirlos agrega una regla propia, `\b3\d{9}\b`, con el mensaje «contiene un teléfono».

#### En el trabajo
Los equipos que usan agentes mantienen sus skills como código: en un repositorio, con revisión y con evaluación
automática en CI. Una skill con datos personales es un incidente de privacidad, aunque nadie la haya usado todavía.
Antes de publicar una skill para toda la organización, se exige evidencia A/B, igual que con cualquier cambio que
promete mejorar un resultado.

</details>

### Proyecto 7: inventario modular con especificación, ADR y plan de mantenimiento

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

El proyecto aplica los temas al inventario que vienes construyendo desde el Módulo 4. No hay técnicas nuevas: cada
entregable remite al tema donde se explicó y se comprueba con uno de los programas de este módulo.

#### Autoevaluación del módulo
1. ¿Qué vuelve verificable a un requisito?
   Respuesta: tener un dueño, un contexto, una acción y un resultado con medida, escritos como «dado, cuando, entonces» (Tema 1).
2. ¿Por qué una arquitectura depende de atributos de calidad?
   Respuesta: porque las alternativas se diferencian en qué atributo mejoran y cuál empeoran; sin escenarios medibles no hay forma de elegir (Tema 2).
3. ¿Cuándo un patrón mejora el diseño y cuándo añade complejidad accidental?
   Respuesta: mejora en los límites que cambian o que se prueban aparte, como el almacenamiento; sobra cuando existe una sola implementación posible y nada que aislar (Tema 3).

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Entregables
1. **Especificación.** Una historia de usuario del inventario con al menos tres criterios `C<n>` que pasen `verificar_criterios.py` (Tema 1).
2. **Arquitectura.** Un diagrama C4 de contenedores, un escenario de calidad de seis partes y una fitness function de dependencias en CI (Tema 2).
3. **Diseño.** El caso de uso «retirar stock» separado de la persistencia con un puerto y dos adaptadores, SQLite y memoria, con prueba caracterizadora y `diff` vacío (Tema 3).
4. **Decisiones.** Dos ADR que pasen `verificar_adr.py`, un registro de deuda priorizado y una función pública evolucionada con deprecación (Tema 4).
5. **Cambio con agente.** Un cambio pedido contra la especificación, con `verificar_alcance.py` y `verificar_cobertura.py` en verde (Tema 6).

#### Criterio de terminado
Un clon limpio del repositorio pasa las pruebas, la fitness function y los verificadores de criterios, ADR, alcance
y cobertura, sin pasos manuales adicionales.

</details>
