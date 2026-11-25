# Módulo 0: Seguridad, privacidad y modelado de amenazas

> **Requisitos de este curso:** [Fundamentos](/curso/foundations). Lo que esos cursos enseñan aquí se usa sin volver a explicarlo; si algo no te suena, vuelve a su capítulo antes de seguir.

**Entorno comprobado para esta edición (2026-11-24):** OpenJDK 25.0.5.1, H2 2.3.232 (para el laboratorio de
inyección SQL), la herramienta de línea de órdenes OpenSSL 3.0.13 y Git 2.43.0 en Linux x86_64. Los programas usan
solo el JDK (`javax.crypto`, `java.security`, `javax.net.ssl`) y se ejecutan con `java Programa.java`.
Todas las transcripciones son literales de esa ejecución, en la carpeta de práctica `/home/estudiante/labs/seguridad`
(tu `~/labs/seguridad`). Varias salidas **cambian en cada ejecución a propósito**: los textos cifrados, las claves
RSA, las sales aleatorias y los tiempos medidos. Lo que debe coincidir es la forma y el veredicto (`OK`, `RECHAZADO`,
`Verified OK`). Los commits del Tema 3 se hicieron con autor y fecha fijos. Los comandos para Windows y macOS no se
ejecutaron.

**Regla de laboratorio.** Todos los ataques de este módulo se ejecutan contra código y datos que tú creas en tu
equipo: una base H2 en memoria, un servidor en `127.0.0.1` y correos escritos como texto. Nunca pruebes una de
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
- Métodos, **excepción**, records y colecciones (`Map`, `Set`) de Fundamentos (Módulo 1, Temas 1 y 4; Módulo 2, Tema 1); **codificación** y **UTF-8** (Módulo 1, Tema 5).
- **Función hash** y tabla hash (Módulo 2, Tema 6).
- **Cliente y servidor**, **URL**, **DNS**, **puerto**, **HTTP**, **cabecera**, **JSON**, **HTML** y **JavaScript** (Módulo 3, Temas 1 a 3).
- SQL y JDBC con H2 (Módulo 4, Temas 1 y 2).
- **Registro**, **Git**, **commit** e **integración continua** (Módulo 5, Temas 1, 3 y 4).

Comprueba tu entorno antes de empezar:

```text
$ java --version
openjdk 25.0.5.1 2026-11-17
OpenJDK Runtime Environment (build 25.0.5.1+2-1-24.04.1-Ubuntu)
OpenJDK 64-Bit Server VM (build 25.0.5.1+2-1-24.04.1-Ubuntu, mixed mode, sharing)
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

Este tema usa lo que ya conoces: archivos de texto con columnas separadas por `;` para guardar el registro, y mapas y
conjuntos (`Map`, `Set`, Módulo 2, Tema 1) para validarlo. Aquí no se redefinen.

#### Glosario del tema

**activo**
- **Definición técnica:** cualquier cosa con valor para la organización que puede sufrir daño: datos, servicios, credenciales, equipos o reputación.
- **En palabras sencillas:** lo que te dolería perder, que te robaran o que alguien cambiara sin permiso.
- **Dónde se rompe la comparación:** un activo digital se puede copiar sin que desaparezca; el robo de un dato no deja el estante vacío.
- **Ejemplo:** en `amenazas.csv`, el activo de `I-01` es `PIN del destinatario` y el de `D-01` es `API de confirmación`.
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
- **Ejemplo:** el flujo `F6` de `flujos.csv` va de Internet a la base de datos `sin autenticación`: esa es la vulnerabilidad.
- **Error típico:** confundir la vulnerabilidad (la falta de autenticación) con la amenaza (el robo de datos que permite).

**riesgo**
- **Definición técnica:** medida de cuánto preocupa una amenaza; en este módulo se calcula como impacto (1–5) por probabilidad (1–5).
- **En palabras sencillas:** qué tan grave sería y qué tan seguido podría pasar, juntos en un solo número.
- **Dónde se rompe la comparación:** la escala 1–5 es un juicio del equipo, no una medición física; sirve para ordenar, no para predecir pérdidas exactas.
- **Ejemplo:** `S-02` tiene impacto 4 y probabilidad 5; `Riesgos.java` imprime `riesgo 20`.
- **Error típico:** sumar impacto y probabilidad: un riesgo 5+1 quedaría igual que uno 3+3, aunque el primero casi nunca ocurre.

**control**
- **Definición técnica:** medida técnica, organizativa o física que reduce la probabilidad o el impacto de una amenaza.
- **En palabras sencillas:** el candado, la alarma o la regla que pones para que lo malo pase menos o duela menos.
- **Dónde se rompe la comparación:** un candado se compra una vez; un control de software se rompe con un cambio de código si nadie lo prueba.
- **Ejemplo:** el control de `D-01` es `límite de tasa por conductor`, con efectividad estimada de `0.8`.
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
- **Ejemplo:** el diagrama de este tema más `amenazas.csv` y `flujos.csv` son el modelo de amenazas de RutaFlow.
- **Error típico:** hacerlo una vez al final del proyecto, cuando cambiar el diseño ya es caro.

**STRIDE**
- **Definición técnica:** lista de seis categorías de amenaza: suplantación (*Spoofing*), manipulación (*Tampering*), repudio (*Repudiation*), divulgación de información (*Information disclosure*), denegación de servicio (*Denial of service*) y elevación de privilegios (*Elevation of privilege*).
- **En palabras sencillas:** seis preguntas para no olvidar ningún tipo de problema: ¿quién finge?, ¿qué se altera?, ¿quién niega?, ¿qué se filtra?, ¿qué se cae?, ¿quién sube de rango?
- **Dónde se rompe la comparación:** una misma amenaza puede caer en dos categorías; STRIDE ayuda a pensar, no a clasificar sin ambigüedad.
- **Ejemplo:** `Riesgos.java` termina con `por STRIDE: Denial of service=1, …, Spoofing=2, Tampering=1`.
- **Error típico:** escribir la categoría con otra ortografía; `Spoffing` hace que el validador rechace el registro.

**límite de confianza**
- **Definición técnica:** frontera en un diagrama donde los datos pasan entre zonas con distinto nivel de confianza; todo flujo que la cruza debe autenticarse y validarse.
- **En palabras sencillas:** la portería del edificio: lo que viene de la calle se revisa antes de subir.
- **Dónde se rompe la comparación:** en software no hay paredes; el límite existe solo si el código lo hace cumplir en cada petición.
- **Ejemplo:** `Limites.java` imprime `F1 usuario -> API: cruza Internet/DMZ — OK`.
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
1. Guardar cada amenaza como una línea de un archivo CSV con las columnas de la tabla anterior, separadas por `;`
   (los textos llevan comas). Java lee cada línea en un record `Amenaza`.
2. Validar antes de calcular: categoría STRIDE conocida, escalas en rango, dueño presente y tratamiento válido.
3. Si hay errores, terminar con código de salida distinto de cero y un mensaje que los liste todos.
4. Calcular riesgo y residual, ordenar de mayor a menor residual y contar por categoría.

Crea `~/labs/seguridad/tema1/amenazas.csv`:

```text
id;stride;activo;escenario;impacto;probabilidad;control;efectividad;propietario;tratamiento
S-01;Spoofing;sesión del conductor;robo de token para confirmar entregas ajenas;4;3;sesiones con expiración y revocación;0.7;identidad;mitigar
T-01;Tampering;estado del envío;operador marca entregado un envío que nunca salió;5;3;ALLOWED_TRANSITIONS;0.6;dominio;mitigar
R-01;Repudiation;historial de confirmaciones;conductor niega haber confirmado una entrega;2;4;audit log encadenado;0.5;operaciones;mitigar
I-01;Information disclosure;PIN del destinatario;lectura del PIN en la cola o en logs;4;2;HMAC, TLS y redacción de logs;0.75;plataforma;mitigar
D-01;Denial of service;API de confirmación;ráfaga de confirmaciones falsas agota el servicio;3;4;límite de tasa por conductor;0.8;plataforma;mitigar
E-01;Elevation of privilege;panel de operadores;conductor accede a funciones de administración;5;2;autorización por rol y recurso;0.8;identidad;mitigar
S-02;Spoofing;correo de soporte;correo con nombre visible de RutaFlow desde dominio parecido;4;5;DMARC y formación;0.4;seguridad;mitigar
I-02;Information disclosure;exportación de clientes;log con teléfonos y direcciones completas;4;4;redacción y retención de 30 días;0.6;datos;mitigar
```

Y el programa que lo valida y lo ordena:

```java
// Riesgos.java — valida y prioriza el registro de amenazas de RutaFlow
static final Set<String> STRIDE = Set.of("Spoofing", "Tampering", "Repudiation", "Information disclosure",
        "Denial of service", "Elevation of privilege");
static final Set<String> TRATAMIENTOS = Set.of("mitigar", "aceptar", "transferir", "evitar");

record Amenaza(String id, String stride, String activo, String escenario, int impacto, int probabilidad,
               String control, double efectividad, String propietario, String tratamiento) {
    int riesgo() {
        return impacto * probabilidad;
    }

    long residual() {
        return Math.round(riesgo() * (1 - efectividad));
    }
}

Amenaza leer(String linea) {
    String[] c = linea.split(";", -1);              // -1: conserva los campos vacíos del final
    return new Amenaza(c[0], c[1], c[2], c[3], Integer.parseInt(c[4]), Integer.parseInt(c[5]),
            c[6], Double.parseDouble(c[7]), c[8], c[9]);
}

void main() throws IOException {
    List<Amenaza> amenazas = new ArrayList<>(Files.readAllLines(Path.of("amenazas.csv")).stream()
            .skip(1).map(this::leer).toList());     // la primera línea es la cabecera
    List<String> errores = new ArrayList<>();
    for (Amenaza a : amenazas) {
        if (!STRIDE.contains(a.stride())) {
            errores.add(a.id() + " STRIDE desconocido: " + a.stride());
        }
        if (a.impacto() < 1 || a.impacto() > 5) {
            errores.add(a.id() + " impacto fuera de rango (1-5): " + a.impacto());
        }
        if (a.probabilidad() < 1 || a.probabilidad() > 5) {
            errores.add(a.id() + " probabilidad fuera de rango (1-5): " + a.probabilidad());
        }
        if (a.efectividad() < 0 || a.efectividad() > 1) {
            errores.add(a.id() + " efectividad fuera de rango (0-1): " + a.efectividad());
        }
        if (a.propietario().isBlank()) {
            errores.add(a.id() + " sin propietario");
        }
        if (!TRATAMIENTOS.contains(a.tratamiento())) {
            errores.add(a.id() + " tratamiento inválido: " + a.tratamiento());
        }
    }
    if (!errores.isEmpty()) {
        System.err.println("fallo: " + String.join("; ", errores));
        System.exit(1);
    }

    amenazas.sort(Comparator.comparingLong(Amenaza::residual).reversed()); // sort es estable
    IO.println("amenazas: " + amenazas.size());
    for (Amenaza a : amenazas) {
        IO.println("%s %s: riesgo %d residual %d — %s — %s".formatted(a.id(), a.stride(), a.riesgo(),
                a.residual(), a.tratamiento(), a.propietario()));
    }
    IO.println("prioridad: " + amenazas.getFirst().id() + " (residual " + amenazas.getFirst().residual() + ")");
    Map<String, Long> conteo = amenazas.stream()
            .collect(Collectors.groupingBy(Amenaza::stride, TreeMap::new, Collectors.counting()));
    IO.println("por STRIDE: " + conteo.entrySet().stream().map(e -> e.getKey() + "=" + e.getValue())
            .collect(Collectors.joining(", ")));
}
```

```text
$ java Riesgos.java
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
- Líneas 2–4: dos **conjuntos** con los valores permitidos; `contains` comprueba la pertenencia.
- Líneas 6–15: el record calcula el riesgo (la multiplicación) y el residual, que aplica la efectividad y redondea con
  `Math.round` al entero más cercano.
- Líneas 17–21: `split(";", -1)` conserva los campos vacíos del final; sin el `-1`, un dueño vacío desaparecería.
- Líneas 27–46: el bucle acumula **todos** los errores en una lista antes de decidir. Así ves los problemas juntos.
- Líneas 47–50: el mensaje va a la salida de errores y el programa termina con código 1.
- Línea 52: `reversed()` deja arriba el residual mayor; `List.sort` es estable y entre empates conserva el orden del archivo.
- Líneas 59–60: `groupingBy` con un `TreeMap` cuenta por categoría en orden alfabético.
- Salida: `S-02` encabeza la lista. Tiene el control más débil (`0.4`) sobre un riesgo alto (`20`).

> **Error común.** Poner un valor fuera de escala o dejar el dueño vacío. Con impacto `7` y el campo de propietario
> vacío, el programa termina así:
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
1. Asignar una zona a cada elemento y un nivel numérico a cada zona (Internet 0, DMZ 1, Aplicación 2, Datos 3), con dos `Map`.
2. Un flujo dentro de una misma zona no cruza límites.
3. Un flujo que cruza debe ir autenticado y cifrado, y no debe saltarse zonas: de Internet no se llega a Datos.

Crea `flujos.csv` en la misma carpeta:

```text
id;origen;destino;protocolo;autenticado;cifrado
F1;usuario;API;HTTPS;true;true
F2;operador;API;HTTPS + MFA;true;true
F3;API;dominio;gRPC;true;true
F4;dominio;base de datos;SQL parametrizado;true;false
F5;dominio;cola;AMQP + HMAC;true;true
F6;conductor;base de datos;SQL;false;false
```

```java
// Limites.java — revisa los flujos que cruzan un límite de confianza
static final Map<String, String> ZONAS = Map.of(
        "usuario", "Internet", "operador", "Internet", "conductor", "Internet",
        "API", "DMZ", "dominio", "Aplicación", "cola", "Aplicación", "base de datos", "Datos");
static final Map<String, Integer> NIVEL = Map.of("Internet", 0, "DMZ", 1, "Aplicación", 2, "Datos", 3);

void main() throws IOException {
    List<String> lineas = Files.readAllLines(Path.of("flujos.csv"));
    int hallazgos = 0;
    for (String linea : lineas.subList(1, lineas.size())) {   // sin la cabecera
        String[] f = linea.split(";");
        String zOrigen = ZONAS.get(f[1]);
        String zDestino = ZONAS.get(f[2]);
        if (zOrigen.equals(zDestino)) {
            IO.println("%s %s -> %s: misma zona (%s)".formatted(f[0], f[1], f[2], zOrigen));
            continue;
        }
        List<String> problemas = new ArrayList<>();
        if (Math.abs(NIVEL.get(zOrigen) - NIVEL.get(zDestino)) > 1) {
            problemas.add("salta de " + zOrigen + " a " + zDestino);
        }
        if (!Boolean.parseBoolean(f[4])) {
            problemas.add("sin autenticación");
        }
        if (!Boolean.parseBoolean(f[5])) {
            problemas.add("sin cifrado");
        }
        String estado = problemas.isEmpty() ? "OK" : "REVISAR: " + String.join(", ", problemas);
        IO.println("%s %s -> %s: cruza %s/%s — %s".formatted(f[0], f[1], f[2], zOrigen, zDestino, estado));
        if (!problemas.isEmpty()) {
            hallazgos++;
        }
    }
    IO.println("flujos: " + (lineas.size() - 1) + ", con hallazgos: " + hallazgos);
}
```

```text
$ java Limites.java
F1 usuario -> API: cruza Internet/DMZ — OK
F2 operador -> API: cruza Internet/DMZ — OK
F3 API -> dominio: cruza DMZ/Aplicación — OK
F4 dominio -> base de datos: cruza Aplicación/Datos — REVISAR: sin cifrado
F5 dominio -> cola: misma zona (Aplicación)
F6 conductor -> base de datos: cruza Internet/Datos — REVISAR: salta de Internet a Datos, sin autenticación, sin cifrado
flujos: 6, con hallazgos: 2
```

**Explicación por partes.**
- Líneas 2–5: un mapa lleva cada elemento a su zona y otro lleva cada zona a su nivel.
- Líneas 14–17: si origen y destino están en la misma zona, el flujo no cruza límites y se salta con `continue`.
- Líneas 19–21: una diferencia de nivel mayor que 1 significa que el flujo se salta una zona entera.
- Líneas 22–27: cada propiedad faltante se agrega como problema con un texto que se entiende sin leer el código.
- Líneas 30–32: un flujo con al menos un problema cuenta como hallazgo.
- Salida: `F4` cruza a Datos sin cifrado y `F6` comete las tres faltas. Ambos van al registro de amenazas.

> **Error común.** Agregar un elemento nuevo al diagrama y olvidarlo en `ZONAS`. Con un flujo que sale de
> `reportes`, `ZONAS.get` devuelve `null` y el programa se detiene en la línea 14 con:
>
> ```text
> Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.equals(Object)" because "<local6>" is null
> ```
>
> El mapa no tiene esa clave (`<local6>` es `zOrigen`: el modo de archivo fuente no guarda nombres de variables). La
> corrección es decidir la zona de `reportes` y agregarla a `ZONAS`.

> **Prevenir errores.** Revisa el diagrama cada vez que alguien agrega un servicio. Un elemento sin zona es un
> elemento del que nadie decidió cuánto confiar.

#### Checkpoint 1.1
Una amenaza tiene impacto 3, probabilidad 4 y un control con efectividad `0.5`. ¿Cuál es su riesgo y su residual?
¿Va antes o después de `T-01` en la salida de `Riesgos.java`?

Respuesta: riesgo `12` y residual `6` (12 × 0.5). Empata con `T-01`; como el orden se conserva entre empates, va
donde esté en el archivo: si la agregas al final, sale después de `I-02`.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Prepara la carpeta
Crea `~/labs/seguridad/tema1` y entra con `cd ~/labs/seguridad/tema1`. Escribe `amenazas.csv` y `Riesgos.java`.

#### Paso 2 · Calcula y ordena
Ejecuta `java Riesgos.java`. La primera línea debe decir `amenazas: 8` y la prioridad debe ser
`S-02 (residual 12)`.

#### Paso 3 · Rompe el registro a propósito
Copia `amenazas.csv` a una carpeta `malo/` y cambia una fila: impacto `7` y propietario vacío (dos `;` seguidos). Entra
en `malo/` y ejecuta `java ../Riesgos.java; echo $?`. Debes ver el mensaje `fallo: …` y el código `1`.

#### Paso 4 · Revisa los límites
Escribe `flujos.csv` y `Limites.java`, ejecútalo y confirma `flujos: 6, con hallazgos: 2`. Para cada hallazgo, agrega
una fila a `amenazas.csv` con su categoría STRIDE.

#### Resumen
- Un **activo** es lo que vale; una **amenaza** es lo que puede dañarlo; una **vulnerabilidad** es la debilidad que lo permite.
- El **riesgo** se calcula como impacto × probabilidad; el **riesgo residual** aplica la efectividad del **control**.
- Se prioriza por residual, no por riesgo inicial: un control fuerte puede bajar mucho una amenaza grave.
- **STRIDE** da seis preguntas para no olvidar ninguna categoría de amenaza.
- Un **límite de confianza** separa zonas; todo flujo que lo cruza se autentica, se cifra y no salta zonas.
- El **modelado de amenazas** se repite con cada cambio de diseño y deja un registro con dueño y tratamiento.

#### Ejercicio verificable 1
Básico. Cambia la efectividad del control de `S-02` de `0.4` a `0.8` y ejecuta de nuevo `Riesgos.java`. ¿Qué amenaza
queda como prioridad?

Respuesta esperada: `S-02` baja a `residual 4` y la última línea antes del conteo dice `prioridad: T-01 (residual 6)`.
`T-01` gana el empate con `I-02` porque aparece antes en el archivo.

#### Ejercicio verificable 2
Intermedio. Agrega a `Limites.java` una regla: todo flujo que **entra** a la zona `Datos` debe usar un protocolo que
contenga la palabra `parametrizado`. ¿Qué flujos marca?

Respuesta esperada: solo la línea de `F6` cambia y termina en `sin cifrado, protocolo "SQL"`; `F4` ya usa
`SQL parametrizado`. El total sigue en `con hallazgos: 2`. La regla va justo antes de la línea `String estado = …`:
`if (zDestino.equals("Datos") && !f[3].contains("parametrizado")) { problemas.add("protocolo \"" + f[3] + "\""); }`.

#### Ejercicio verificable 3
Reto. Agrega al final de `amenazas.csv` la fila del hallazgo `F6`: id `I-03`, categoría `Information disclosure`,
activo `base de datos`, escenario `conductor lee la base sin autenticación`, impacto 5, probabilidad 3, control
`acceso a datos solo desde dominio` con efectividad `0.9`, dueño `plataforma` y tratamiento `mitigar`.
Predice su riesgo, su residual y su posición antes de ejecutar.

Respuesta esperada: la penúltima línea de la lista es `I-03 Information disclosure: riesgo 15 residual 1 — mitigar — plataforma`
y el conteo pasa a `Information disclosure=3`. En papel, 15 × 0.1 da 1.5, pero `1 - 0.9` vale `0.09999999999999998`
en punto flotante y `Math.round` recibe `1.4999999999999996`: el resultado es `1`. Es el error de redondeo del Módulo 1, Tema 5.

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

Este tema usa lo que ya conoces: **función hash** (Módulo 2, Tema 6), **excepción** (Módulo 1, Tema 1) y los
**records**. Aquí no se redefinen.

#### Glosario del tema

**identidad**
- **Definición técnica:** conjunto de atributos que distingue a un sujeto (persona o programa) dentro de un sistema; se representa con un identificador único.
- **En palabras sencillas:** quién eres para el sistema: tu nombre de usuario y lo que va pegado a él.
- **Dónde se rompe la comparación:** una persona puede tener varias identidades (conductor y administrador) y un programa también tiene identidad.
- **Ejemplo:** en `Acceso.java`, `"c-891"` es la identidad de un conductor y `"a-01"` la de un administrador.
- **Error típico:** usar el correo como identificador inmutable; cuando el usuario lo cambia, se rompen sus permisos y su historial.

**autenticación**
- **Definición técnica:** proceso que verifica que un sujeto es quien dice ser, comprobando algo que sabe, tiene o es.
- **En palabras sencillas:** mostrar la cédula en la portería: demuestras que eres tú.
- **Dónde se rompe la comparación:** la cédula se revisa una vez; en software la prueba se repite en cada petición con una sesión.
- **Ejemplo:** `login("c-891", "pin-4471")` devuelve un token; con una clave incorrecta lanza `SecurityException: credenciales inválidas`.
- **Error típico:** responder «usuario no existe» y «clave incorrecta» por separado: el atacante aprende qué usuarios existen.

**autorización**
- **Definición técnica:** decisión de si un sujeto ya autenticado puede ejecutar una acción sobre un recurso concreto.
- **En palabras sencillas:** ya entraste al edificio; ahora, ¿tu llave abre esta oficina?
- **Dónde se rompe la comparación:** la llave abre o no; el software puede decidir con reglas que dependen de la hora, el rol o el dueño del recurso.
- **Ejemplo:** `exportar(token891)` responde `rol conductor no autorizado a exportar` aunque la sesión sea válida.
- **Error típico:** comprobar la autorización solo en la interfaz (ocultar un botón) y no en el servidor.

**hash criptográfico**
- **Definición técnica:** función hash diseñada para que sea inviable invertirla o encontrar dos entradas con la misma salida; SHA-256 produce 32 bytes.
- **En palabras sencillas:** una huella digital del dato: siempre igual para el mismo dato, imposible de usar para reconstruirlo.
- **Dónde se rompe la comparación:** la función hash del Módulo 2 busca velocidad y reparto; esta busca que nadie pueda fabricar colisiones.
- **Ejemplo:** `HashDemo.java` muestra `52d89bdfa6d0a8ca` para `pin-4471` y `3faae6950f6382e5` para `pin-4472`: un carácter cambia toda la huella.
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
- **Ejemplo:** en `HashDemo.java`, 1 iteración tarda `0.0003 s` y 600 000 tardan `0.1521 s` en el equipo de prueba.
- **Error típico:** crear el `PBEKeySpec` sin largo de clave: `generateSecret` lanza `InvalidKeySpecException: Key length not found`. Se corrige pasando el largo en bits (`256`).

**sesión**
- **Definición técnica:** estado guardado en el servidor que asocia un token aleatorio a una identidad autenticada, con fecha de expiración y posibilidad de revocarse.
- **En palabras sencillas:** la manilla de un evento: la muestras en cada puerta en vez de enseñar la cédula otra vez.
- **Dónde se rompe la comparación:** una manilla se corta y se acabó; un token se puede copiar, por eso expira y se puede invalidar desde el servidor.
- **Ejemplo:** tras cambiar `expira` al pasado, `confirmar` responde `sesión vencida`; tras borrarla, `sesión inválida o revocada`.
- **Error típico:** generar tokens con `java.util.Random` o con datos predecibles (usuario + hora); se usa `SecureRandom`.

**control de acceso por roles**
- **Definición técnica:** modelo de autorización (RBAC) donde los permisos se asignan a roles y los usuarios reciben roles.
- **En palabras sencillas:** los permisos van con el cargo, no con la persona: «todos los conductores pueden confirmar».
- **Dónde se rompe la comparación:** el rol dice qué tipo de acción, pero no sobre cuál recurso; para eso falta la autorización por objeto.
- **Ejemplo:** `exportar` exige el rol `admin` en la línea 91 de `Acceso.java`.
- **Error típico:** dar el rol de administrador «temporalmente» para desbloquear a alguien y no quitarlo nunca.

**autorización por objeto**
- **Definición técnica:** comprobación de que el sujeto tiene relación con el recurso específico que pide; su ausencia se llama IDOR (referencia directa insegura a objetos).
- **En palabras sencillas:** ser conductor no basta; tiene que ser **tu** envío.
- **Dónde se rompe la comparación:** en un edificio las oficinas ajenas están cerradas; en una API basta cambiar un número en la URL para pedir otra.
- **Ejemplo:** `confirmar(token999, "RF-4471")` responde `c-999 no está asignado a RF-4471`.
- **Error típico:** comprobar solo el rol y confiar en que el cliente envía únicamente sus propios ids.

**registro de auditoría**
- **Definición técnica:** registro de solo agregar que guarda quién hizo qué, sobre qué recurso y cuándo; si se encadena con hashes, cualquier alteración o borrado se detecta.
- **En palabras sencillas:** el libro de minutas con páginas numeradas y firmadas: arrancar una se nota.
- **Dónde se rompe la comparación:** quien tiene acceso al archivo puede reescribirlo entero y recalcular la cadena; por eso el último sello se guarda en otro lugar.
- **Ejemplo:** `Auditoria.java` imprime `tras borrar el evento 2: válida=false (corte en 3: prev no coincide)`.
- **Error típico:** registrar solo los éxitos; los intentos denegados son la mejor pista de un ataque.

#### ► CÓMO FUNCIONA
Cada petición pasa por tres preguntas, en este orden. ¿Quién eres? (autenticación). ¿Tu rol puede hacer esto?
(autorización por rol). ¿Este recurso es tuyo? (autorización por objeto). Toda respuesta, positiva o negativa,
deja una línea en el registro de auditoría.

La contraseña nunca se guarda. Al registrarte, el servidor genera una sal, deriva la clave y guarda sal y resultado.
Al iniciar sesión, repite la derivación con la sal guardada y compara con `MessageDigest.isEqual`, que tarda lo mismo
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
3. Medir el tiempo de 1 iteración frente a 600 000 con `System.nanoTime` (Módulo 2, Tema 2).
4. PBKDF2 viene en el JDK como `SecretKeyFactory` con el algoritmo `PBKDF2WithHmacSHA256`.

```java
// HashDemo.java — hash, sal y derivación de claves con el JDK
import java.security.MessageDigest;
import java.util.HexFormat;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

String sha256(String texto) throws Exception {
    byte[] huella = MessageDigest.getInstance("SHA-256").digest(texto.getBytes(StandardCharsets.UTF_8));
    return HexFormat.of().formatHex(huella).substring(0, 16);   // solo los primeros 16 caracteres
}

byte[] pbkdf2(String password, byte[] sal, int iteraciones) throws Exception {
    var spec = new PBEKeySpec(password.toCharArray(), sal, iteraciones, 256); // 256 bits de salida
    return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
}

void main() throws Exception {
    IO.println("sha256 pin-4471: " + sha256("pin-4471"));
    IO.println("sha256 pin-4472: " + sha256("pin-4472"));
    IO.println("sha256 pin-4471: " + sha256("pin-4471"));

    byte[] salA = HexFormat.of().parseHex("a1".repeat(16));
    byte[] salB = HexFormat.of().parseHex("b2".repeat(16));
    for (var sal : List.of(Map.entry("sal A", salA), Map.entry("sal B", salB))) {
        byte[] derivado = pbkdf2("pin-4471", sal.getValue(), 600_000);
        IO.println("pbkdf2 con " + sal.getKey() + ": " + HexFormat.of().formatHex(derivado).substring(0, 16));
    }

    for (int iteraciones : List.of(1, 600_000)) {
        long inicio = System.nanoTime();
        pbkdf2("pin-4471", salA, iteraciones);
        IO.println(String.format(Locale.ROOT, "%7d iteraciones: %.4f s", iteraciones, (System.nanoTime() - inicio) / 1e9));
    }
}
```

```text
$ java HashDemo.java
sha256 pin-4471: 52d89bdfa6d0a8ca
sha256 pin-4472: 3faae6950f6382e5
sha256 pin-4471: 52d89bdfa6d0a8ca
pbkdf2 con sal A: 34e47c8a48aceeb1
pbkdf2 con sal B: c2e3787de97ccbdc
      1 iteraciones: 0.0003 s
 600000 iteraciones: 0.1521 s
```

**Explicación por partes.**
- Líneas 7–10: `MessageDigest` calcula SHA-256 sobre los bytes UTF-8 del texto (Módulo 1, Tema 5); `HexFormat` lo
  muestra en hexadecimal. Se ven solo los primeros 16 caracteres. La tercera línea de la salida repite la primera.
- Líneas 12–15: `PBEKeySpec` recibe la contraseña como `char[]`, la sal, las iteraciones y el largo en bits.
- Líneas 22–23: dos sales fijas, solo para que la salida sea reproducible. En producción salen de `SecureRandom`.
- Líneas 29–33: el tiempo crece con las iteraciones. Tus segundos serán otros; la proporción se mantiene.
- Las huellas coinciden byte a byte con las de cualquier otra implementación correcta de SHA-256 y PBKDF2.

> **Error común.** Olvidar el cuarto argumento de `PBEKeySpec` (el largo en bits). Compila, pero `generateSecret`
> termina con `java.security.spec.InvalidKeySpecException: Key length not found`. Indica siempre `256`.

#### Problema resuelto 2.2
Implementa registro, inicio de sesión, sesiones y autorización para conductores y administradores, y prueba cada
camino negativo.

**Razonamiento:**
1. Registrar guarda rol, sal aleatoria y clave derivada; nunca la contraseña.
2. El login compara en tiempo constante, cuenta fallos y bloquea 30 segundos al tercero. Los rechazos son `SecurityException`.
3. Cada acción llama primero a `sesionActiva`, luego revisa el rol y por último el recurso.
4. Probar a propósito: otro conductor, token inventado, rol equivocado, bloqueo, expiración y revocación.

```java
// Acceso.java — contraseñas derivadas, sesiones y autorización de RutaFlow
import java.security.MessageDigest;
import java.security.SecureRandom;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

static final int ITERACIONES = 600_000;
static final SecureRandom AZAR = new SecureRandom();
static final Map<String, Set<String>> ASIGNACIONES = Map.of("c-891", Set.of("RF-4471", "RF-4472"), "c-999", Set.of("RF-5000"));

record Usuario(String rol, byte[] sal, byte[] hash) {
}

record Sesion(String usuario, long expira) {
}

final Map<String, Usuario> usuarios = new HashMap<>();
final Map<String, Sesion> sesiones = new HashMap<>();
final Map<String, Integer> intentos = new HashMap<>();
final Map<String, Long> bloqueos = new HashMap<>();

byte[] derivar(String password, byte[] sal) {
    try {
        var spec = new PBEKeySpec(password.toCharArray(), sal, ITERACIONES, 256);
        return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
    } catch (Exception error) {
        throw new IllegalStateException(error);
    }
}

void registrar(String usuario, String password, String rol) {
    byte[] sal = new byte[16];
    AZAR.nextBytes(sal);                               // sal aleatoria de calidad criptográfica
    usuarios.put(usuario, new Usuario(rol, sal, derivar(password, sal)));
}

String login(String usuario, String password) {
    long ahora = System.currentTimeMillis();
    if (bloqueos.getOrDefault(usuario, 0L) > ahora) {
        throw new SecurityException("cuenta bloqueada temporalmente");
    }
    Usuario registro = usuarios.get(usuario);
    if (registro == null) {
        throw new SecurityException("credenciales inválidas");
    }
    byte[] calculado = derivar(password, registro.sal());
    if (!MessageDigest.isEqual(calculado, registro.hash())) {   // tiempo constante
        int fallos = intentos.merge(usuario, 1, Integer::sum);
        if (fallos >= 3) {
            bloqueos.put(usuario, ahora + 30_000);
            intentos.put(usuario, 0);
            throw new SecurityException("cuenta bloqueada temporalmente");
        }
        throw new SecurityException("credenciales inválidas");
    }
    intentos.put(usuario, 0);
    byte[] aleatorio = new byte[16];
    AZAR.nextBytes(aleatorio);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(aleatorio);
    sesiones.put(token, new Sesion(usuario, ahora + 900_000));  // vence en 15 minutos
    return token;
}

String sesionActiva(String token) {
    Sesion sesion = sesiones.get(token);
    if (sesion == null) {
        throw new SecurityException("sesión inválida o revocada");
    }
    if (sesion.expira() < System.currentTimeMillis()) {
        sesiones.remove(token);
        throw new SecurityException("sesión vencida");
    }
    return sesion.usuario();
}

String confirmar(String token, String envioId) {
    String usuario = sesionActiva(token);
    String rol = usuarios.get(usuario).rol();
    if (!rol.equals("conductor")) {
        throw new SecurityException("rol " + rol + " no puede confirmar entregas");
    }
    if (!ASIGNACIONES.getOrDefault(usuario, Set.of()).contains(envioId)) {
        throw new SecurityException(usuario + " no está asignado a " + envioId);
    }
    return usuario + " confirmó " + envioId;
}

int exportar(String token) {
    String usuario = sesionActiva(token);
    String rol = usuarios.get(usuario).rol();
    if (!rol.equals("admin")) {
        throw new SecurityException("rol " + rol + " no autorizado a exportar");
    }
    return ASIGNACIONES.values().stream().mapToInt(Set::size).sum();
}

void probar(String caso, Supplier<Object> accion) {
    try {
        IO.println(caso + ": " + accion.get());
    } catch (SecurityException error) {
        IO.println(caso + ": denegado: " + error.getMessage());
    }
}

void main() {
    registrar("c-891", "pin-4471", "conductor");
    registrar("c-999", "pin-5000", "conductor");
    registrar("a-01", "clave-admin", "admin");
    IO.println("sales distintas: " + !Arrays.equals(usuarios.get("c-891").sal(), usuarios.get("c-999").sal()));

    String token891 = login("c-891", "pin-4471");
    String token999 = login("c-999", "pin-5000");
    String tokenAdmin = login("a-01", "clave-admin");
    IO.println(confirmar(token891, "RF-4471"));
    probar("otro conductor", () -> confirmar(token999, "RF-4471"));
    probar("anónimo", () -> confirmar("token-inventado", "RF-4471"));
    probar("admin exporta", () -> exportar(tokenAdmin) + " envíos");
    probar("conductor exporta", () -> exportar(token891));
    for (int i = 0; i < 3; i++) {
        try {
            login("c-999", "incorrecta");
        } catch (SecurityException ignorada) {
            // se cuentan los fallos
        }
    }
    probar("tras 3 fallos", () -> login("c-999", "pin-5000"));
    sesiones.put(token891, new Sesion("c-891", System.currentTimeMillis() - 1)); // el tiempo pasó
    probar("sesión vencida", () -> confirmar(token891, "RF-4471"));
    sesiones.remove(tokenAdmin);                                                   // revocación
    probar("sesión revocada", () -> exportar(tokenAdmin));
}
```

```text
$ java Acceso.java
sales distintas: true
c-891 confirmó RF-4471
otro conductor: denegado: c-999 no está asignado a RF-4471
anónimo: denegado: sesión inválida o revocada
admin exporta: 3 envíos
conductor exporta: denegado: rol conductor no autorizado a exportar
tras 3 fallos: denegado: cuenta bloqueada temporalmente
sesión vencida: denegado: sesión vencida
sesión revocada: denegado: sesión inválida o revocada
```

**Explicación por partes.**
- Líneas 31–35: `SecureRandom` da 16 bytes aleatorios de calidad criptográfica para la sal.
- Líneas 44 y 54: usuario inexistente y clave errada dan el **mismo** mensaje, `credenciales inválidas`.
- Línea 47: `MessageDigest.isEqual` compara sin cortar en el primer byte distinto.
- Líneas 48–53: el tercer fallo fija un bloqueo de 30 segundos; la línea 39 lo hace cumplir.
- Líneas 57–60: el token son 16 bytes aleatorios en Base64 para URL, y la sesión vence en 900 000 ms (15 minutos).
- Líneas 69–71: una sesión vencida se borra al detectarla.
- Líneas 79–84: primero el rol, después la asignación del envío. Las dos comprobaciones viven en el servidor.
- Líneas 97–103: `probar` ejecuta un caso e imprime el rechazo si lo hay.
- Líneas 127 y 129: el programa simula el paso del tiempo y la revocación para probar los dos rechazos.

> **Error común.** Comparar los hashes con `!=` o `==`. En Java eso compara **referencias** de arreglos, no su
> contenido: dos arreglos distintos nunca son `==`. Con `if (calculado != registro.hash())` ni la clave correcta
> entra, y el programa se detiene en el primer login con `Exception in thread "main" java.lang.SecurityException: credenciales inválidas`. Usa `MessageDigest.isEqual`, que compara el
> contenido y en tiempo constante; `Arrays.equals` compara el contenido, pero corta en el primer byte distinto.

> **Buena práctica.** Los mensajes de rechazo hacia el usuario son genéricos; el detalle va al registro de
> auditoría. El atacante no debe saber si falló el usuario o la clave.

#### Problema resuelto 2.3
Deja un registro de auditoría que detecte si alguien cambia o borra un evento.

**Razonamiento:**
1. Cada evento guarda el sello del anterior en `prev`; el primero apunta a 64 ceros.
2. El sello es el SHA-256 del evento serializado siempre igual: los campos en un orden fijo, separados por `|`.
3. Cada evento es un record inmutable; «alterar» es crear otro con un campo distinto.
4. Verificar es recorrer la cadena y recalcular cada sello.

```java
// Auditoria.java — registro de auditoría encadenado con SHA-256
import java.security.MessageDigest;
import java.util.HexFormat;

static final String CERO = "0".repeat(64);

record Evento(int seq, String ts, String actor, String accion, String recurso, String prev, String hash) {
    Evento(int seq, String ts, String actor, String accion, String recurso) {
        this(seq, ts, actor, accion, recurso, null, null);
    }

    Evento conAccion(String nueva) {
        return new Evento(seq, ts, actor, nueva, recurso, prev, hash);
    }

    String canonico() {   // siempre los mismos campos, en el mismo orden
        return "seq=" + seq + "|ts=" + ts + "|actor=" + actor + "|accion=" + accion
                + "|recurso=" + recurso + "|prev=" + prev;
    }
}

String sello(Evento evento) {
    try {
        byte[] huella = MessageDigest.getInstance("SHA-256").digest(evento.canonico().getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(huella);
    } catch (Exception error) {
        throw new IllegalStateException(error);
    }
}

List<Evento> encadenar(List<Evento> eventos) {
    List<Evento> cadena = new ArrayList<>();
    String prev = CERO;
    for (Evento e : eventos) {
        Evento enlazado = new Evento(e.seq(), e.ts(), e.actor(), e.accion(), e.recurso(), prev, null);
        Evento sellado = new Evento(e.seq(), e.ts(), e.actor(), e.accion(), e.recurso(), prev, sello(enlazado));
        cadena.add(sellado);
        prev = sellado.hash();
    }
    return cadena;
}

String verificar(List<Evento> eventos) {
    String prev = CERO;
    for (Evento e : eventos) {
        if (!e.prev().equals(prev)) {
            return "válida=false (corte en " + e.seq() + ": prev no coincide)";
        }
        if (!e.hash().equals(sello(e))) {
            return "válida=false (corte en " + e.seq() + ": contenido alterado)";
        }
        prev = e.hash();
    }
    return "válida=true (sin cortes)";
}

void main() {
    List<Evento> base = List.of(
            new Evento(1, "2026-10-30T10:00:00Z", "c-891", "confirmar", "RF-4471"),
            new Evento(2, "2026-10-30T10:01:10Z", "c-999", "intento_denegado", "RF-4471"),
            new Evento(3, "2026-10-30T10:02:30Z", "a-01", "exportar", "clientes"));
    List<Evento> eventos = encadenar(base);
    IO.println("eventos: " + eventos.size());
    IO.println("cadena inicial: " + verificar(eventos));

    List<Evento> alterados = new ArrayList<>(eventos);
    alterados.set(1, alterados.get(1).conAccion("confirmar"));       // cambia el evento 2
    IO.println("tras alterar el evento 2: " + verificar(alterados));

    List<Evento> borrados = eventos.stream().filter(e -> e.seq() != 2).toList();
    IO.println("tras borrar el evento 2: " + verificar(borrados));

    IO.println("atacante que recalcula toda la cadena: " + verificar(encadenar(alterados)));
}
```

```text
$ java Auditoria.java
eventos: 3
cadena inicial: válida=true (sin cortes)
tras alterar el evento 2: válida=false (corte en 2: contenido alterado)
tras borrar el evento 2: válida=false (corte en 3: prev no coincide)
atacante que recalcula toda la cadena: válida=true (sin cortes)
```

**Explicación por partes.**
- Líneas 16–19: `canonico` produce siempre los mismos bytes para el mismo evento.
- Líneas 22–29: el sello cubre todos los campos, incluido `prev`; así cada evento queda atado al anterior.
- Líneas 46–51: dos fallas distintas: un enlace roto (borrado) o un contenido que no coincide (alteración).
- Línea 73: la última línea es la lección incómoda. Quien puede reescribir todo recalcula la cadena y pasa.
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
Crea `~/labs/seguridad/tema2` y entra en ella. Escribe `HashDemo.java` y ejecútalo dos veces: las huellas SHA-256
y PBKDF2 deben repetirse; los tiempos, no.

#### Paso 2 · Acceso con pruebas negativas
Escribe `Acceso.java` y ejecútalo. Debes ver nueve líneas; siete empiezan con un caso y terminan en un rechazo
explicado. Si alguna dice que el acceso se concedió cuando no debía, revisa el orden de las comprobaciones.

#### Paso 3 · Mide el costo
Cambia `ITERACIONES` a `1_000` y ejecuta `time java Acceso.java`. Vuelve a `600_000` y repite. Anota los dos
tiempos: ese es el costo que también paga un atacante por cada clave que prueba.

#### Paso 4 · Audita
Escribe `Auditoria.java` y confirma las cinco líneas de salida. Explica con tus palabras por qué la última dice
`válida=true`.

#### Resumen
- La **identidad** dice quién eres; la **autenticación** lo comprueba; la **autorización** decide qué puedes hacer.
- Las contraseñas se guardan como **función de derivación de claves** con **sal** única, nunca en claro ni con un **hash criptográfico** rápido.
- La comparación se hace con `MessageDigest.isEqual`, en tiempo constante y por contenido, nunca con `==`.
- Una **sesión** usa un token aleatorio, expira y se puede revocar desde el servidor.
- El **control de acceso por roles** no basta: la **autorización por objeto** comprueba que el recurso es tuyo.
- Un **registro de auditoría** encadenado detecta alteraciones y borrados, si el último sello se guarda aparte.

#### Ejercicio verificable 1
Básico. En `Acceso.java`, ¿qué imprime `login("c-404", "x")` y por qué ese mensaje es el correcto?

Respuesta esperada: lanza `SecurityException: credenciales inválidas`, el mismo texto que una clave errada (línea 44).
Si dijera «usuario no existe», un atacante podría enumerar qué identidades son reales.

#### Ejercicio verificable 2
Intermedio. Cambia en `Acceso.java` el algoritmo `PBKDF2WithHmacSHA256` por `PBKDF2WithHmacSHA512` y compara la
salida con la original usando `diff`.

Respuesta esperada: las nueve líneas son idénticas (se comprobó con `diff`). Cambia el algoritmo, no el
comportamiento. Algoritmos que además exigen memoria, como scrypt o Argon2, no vienen en el JDK: en un proyecto real
se usan desde librerías como Spring Security o Bouncy Castle, y encarecen los ataques con tarjetas gráficas.

#### Ejercicio verificable 3
Reto. Haz que el atacante del final de `Auditoria.java` falle: sella con HMAC-SHA256 y una clave del servidor en vez
de SHA-256 solo. Luego simula a un atacante que recalcula la cadena con una clave adivinada.

Respuesta esperada: en `sello` usa `Mac.getInstance("HmacSHA256")`, inicializado con
`new SecretKeySpec(CLAVE, "HmacSHA256")`, y `doFinal` sobre los bytes de `canonico()`. Las cinco líneas originales no
cambian (quien recompone con `encadenar` usa la clave verdadera), y el atacante que sella con la clave `"adivinada"`
obtiene `atacante sin la clave: válida=false (corte en 1: contenido alterado)`.

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

Este tema usa lo que ya conoces: **hash criptográfico** y `MessageDigest.isEqual` (Tema 2 de este módulo),
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
- **Ejemplo:** `Firma.java` lee la clave `k-2026-10` de la variable de entorno `SECRETO_ACTUAL`.
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
- **Ejemplo:** con el PIN cambiado a `999999`, `Firma.java` responde `PIN alterado: false — firma inválida`.
- **Error típico:** calcular el SHA-256 de `clave + mensaje` a mano en vez de usar `Mac` con `HmacSHA256`; esa construcción tiene ataques conocidos.

**nonce**
- **Definición técnica:** valor que se usa una sola vez (*number used once*) dentro de un mensaje o una operación criptográfica.
- **En palabras sencillas:** el número de un boleto: si llega dos veces, el segundo es una copia.
- **Dónde se rompe la comparación:** el servidor debe recordar los nonces vistos; si los olvida pronto, la copia vuelve a pasar.
- **Ejemplo:** `comando.properties` trae `nonce=n-7f3a`; la segunda vez, `Firma.java` responde `nonce ya utilizado`.
- **Error típico:** usar un contador que se reinicia con cada despliegue; los nonces viejos vuelven a ser «nuevos».

**ataque de repetición**
- **Definición técnica:** reenvío de un mensaje legítimo, capturado antes, para que el receptor repita su efecto (*replay*).
- **En palabras sencillas:** fotocopiar un cheque firmado y cobrarlo otra vez.
- **Dónde se rompe la comparación:** la firma del mensaje repetido es perfecta; lo que delata la copia es el nonce o la hora.
- **Ejemplo:** `Firma.java` rechaza la copia exacta con `nonce ya utilizado` y un comando de hace una hora con `timestamp fuera de ventana`.
- **Error típico:** proteger solo la integridad con HMAC y olvidar que un mensaje íntegro puede ser repetido.

**TLS**
- **Definición técnica:** protocolo que cifra y autentica un canal entre cliente y servidor; HTTPS es HTTP sobre TLS.
- **En palabras sencillas:** un tubo blindado entre tu app y el servidor, con la cédula del servidor revisada al entrar.
- **Dónde se rompe la comparación:** el tubo protege el tramo, no los extremos; si el servidor guarda el PIN en un log, TLS no lo salva.
- **Ejemplo:** `TlsCliente.java` imprime `CA correcta, nombre correcto: OK TLSv1.3 — RF-4471 en ruta`.
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
- **Ejemplo:** sin cargar `ca.pem`, el cliente responde `unable to find valid certification path to requested target`.
- **Error típico:** crear la CA sin las extensiones `basicConstraints` y `keyUsage`; Java la acepta, pero clientes más estrictos, como los navegadores, la rechazan.

**secreto**
- **Definición técnica:** dato cuya divulgación compromete la seguridad: claves, contraseñas de servicio, tokens de API; se entrega al programa por el entorno o un gestor de secretos, nunca en el código.
- **En palabras sencillas:** la llave maestra; no se deja pegada en la puerta ni en una foto.
- **Dónde se rompe la comparación:** una llave perdida se cambia con la cerradura; un secreto publicado debe **rotarse**, porque ya se copió.
- **Ejemplo:** sin la variable de entorno, `Firma.java` se niega a arrancar: `fallo: falta SECRETO_ACTUAL en el entorno`.
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
1. Serializar el comando de forma canónica para que emisor y receptor firmen los mismos bytes: un `TreeMap` ordena
   las claves y su `toString` da siempre el mismo texto.
2. Verificar en orden: `kid` conocido, firma, ventana de 300 segundos y nonce no visto.
3. Fijar `AHORA` para que la salida sea reproducible; en producción se usa `Instant.now().getEpochSecond()`.
4. El comando llega en un archivo `.properties`; el HMAC se calcula con `javax.crypto.Mac`.

Crea `comando.properties` en `~/labs/seguridad/tema3`:

```properties
shipmentId=RF-4471
recipientPin=837201
timestamp=1793414990
nonce=n-7f3a
```

```java
// Firma.java — firma HMAC del comando de confirmación con ventana y nonce
import java.security.MessageDigest;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

static final Map<String, String> SECRETOS = new HashMap<>();
static final long VENTANA = 300;
static final long AHORA = 1793415000L;  // fijo para que la salida sea reproducible

record Sobre(Map<String, String> comando, String kid, String firma) {
}

String canonico(Map<String, String> comando) {   // claves en orden alfabético, siempre igual
    return new TreeMap<>(comando).toString();
}

String firmar(Map<String, String> comando, String kid) throws Exception {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(SECRETOS.get(kid).getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
    return HexFormat.of().formatHex(mac.doFinal(canonico(comando).getBytes(StandardCharsets.UTF_8)));
}

String verificar(Sobre sobre, Set<String> vistos) throws Exception {
    Map<String, String> comando = sobre.comando();
    if (!SECRETOS.containsKey(sobre.kid())) {
        return "false — kid desconocido: " + sobre.kid();
    }
    byte[] esperada = firmar(comando, sobre.kid()).getBytes(StandardCharsets.UTF_8);
    if (!MessageDigest.isEqual(sobre.firma().getBytes(StandardCharsets.UTF_8), esperada)) {
        return "false — firma inválida";
    }
    if (Math.abs(AHORA - Long.parseLong(comando.get("timestamp"))) > VENTANA) {
        return "false — timestamp fuera de ventana";
    }
    if (!vistos.add(comando.get("nonce"))) {      // add devuelve false si ya estaba
        return "false — nonce ya utilizado";
    }
    return "true — aceptado";
}

Map<String, String> con(Map<String, String> comando, String clave, String valor) {
    Map<String, String> copia = new HashMap<>(comando);
    copia.put(clave, valor);
    return copia;
}

void main() throws Exception {
    String actual = System.getenv("SECRETO_ACTUAL");
    if (actual == null || actual.isEmpty()) {
        System.err.println("fallo: falta SECRETO_ACTUAL en el entorno");
        System.exit(1);
    }
    SECRETOS.put("k-2026-10", actual);
    SECRETOS.put("k-2026-09", "clave-anterior-de-laboratorio");

    Properties archivo = new Properties();
    try (var lector = Files.newBufferedReader(Path.of("comando.properties"))) {
        archivo.load(lector);
    }
    Map<String, String> comando = new HashMap<>();
    archivo.stringPropertyNames().forEach(k -> comando.put(k, archivo.getProperty(k)));

    Sobre sobre = new Sobre(comando, "k-2026-10", firmar(comando, "k-2026-10"));
    Set<String> vistos = new HashSet<>();
    IO.println("kid: " + sobre.kid());
    IO.println("comando canónico: " + canonico(comando));
    IO.println("válido: " + verificar(sobre, vistos));

    var alterado = new Sobre(con(comando, "recipientPin", "999999"), sobre.kid(), sobre.firma());
    IO.println("PIN alterado: " + verificar(alterado, vistos));

    var repetido = new Sobre(new HashMap<>(comando), sobre.kid(), sobre.firma());
    IO.println("replay del mismo nonce: " + verificar(repetido, vistos));

    var comandoViejo = con(con(comando, "timestamp", String.valueOf(Long.parseLong(comando.get("timestamp")) - 3600)),
            "nonce", "n-viejo");
    var viejo = new Sobre(comandoViejo, sobre.kid(), firmar(comandoViejo, sobre.kid()));
    IO.println("timestamp viejo: " + verificar(viejo, vistos));

    var ajeno = new Sobre(con(comando, "nonce", "n-ajeno"), "k-2025-01", "0".repeat(64));
    IO.println("kid desconocido: " + verificar(ajeno, vistos));
}
```

```text
$ java Firma.java
fallo: falta SECRETO_ACTUAL en el entorno
$ export SECRETO_ACTUAL='clave-actual-de-laboratorio'
$ java Firma.java
kid: k-2026-10
comando canónico: {nonce=n-7f3a, recipientPin=837201, shipmentId=RF-4471, timestamp=1793414990}
válido: true — aceptado
PIN alterado: false — firma inválida
replay del mismo nonce: false — nonce ya utilizado
timestamp viejo: false — timestamp fuera de ventana
kid desconocido: false — kid desconocido: k-2025-01
```

**Explicación por partes.**
- Líneas 49–55: el llavero. La clave actual sale del entorno con `System.getenv`; la anterior queda para mensajes
  firmados antes de rotar. Sin la variable, el programa se niega a arrancar: fallar ruidoso es mejor que firmar con
  una clave vacía.
- Líneas 14–22: texto canónico y HMAC-SHA256 con la clave del `kid`.
- Líneas 26–28: un `kid` fuera del llavero se rechaza antes de calcular nada.
- Línea 30: la comparación es de tiempo constante, como en el Tema 2.
- Líneas 33–38: la ventana descarta mensajes viejos; `vistos.add` devuelve `false` si el nonce ya estaba.
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
3. Java carga la clave del servidor desde un almacén PKCS12 (`servidor.p12`), que OpenSSL arma con el certificado y
   la clave privada; la CA se carga desde `ca.pem` con `CertificateFactory`.
4. Probar tres clientes: sin confiar en la CA, con la CA y el nombre correcto, y con la CA y otro nombre.

Crea `TlsCliente.java` en `~/labs/seguridad/tema3/tls`:

```java
// TlsCliente.java — servidor TLS local y tres clientes que verifican (o no) su certificado
import java.io.FileInputStream;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.security.KeyStore;
import java.security.cert.CertificateFactory;
import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLHandshakeException;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManagerFactory;

SSLContext contextoServidor() throws Exception {
    KeyStore llavero = KeyStore.getInstance("PKCS12");
    try (var archivo = new FileInputStream("servidor.p12")) {
        llavero.load(archivo, "laboratorio".toCharArray());          // certificado + clave privada
    }
    var claves = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
    claves.init(llavero, "laboratorio".toCharArray());
    SSLContext contexto = SSLContext.getInstance("TLS");
    contexto.init(claves.getKeyManagers(), null, null);
    return contexto;
}

SSLContext contextoConCa() throws Exception {
    KeyStore confianza = KeyStore.getInstance(KeyStore.getDefaultType());
    confianza.load(null, null);                                       // almacén vacío
    try (var archivo = new FileInputStream("ca.pem")) {
        confianza.setCertificateEntry("ca", CertificateFactory.getInstance("X.509").generateCertificate(archivo));
    }
    var confiables = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
    confiables.init(confianza);
    SSLContext contexto = SSLContext.getInstance("TLS");
    contexto.init(null, confiables.getTrustManagers(), null);
    return contexto;
}

void probar(String nombre, SSLSocketFactory fabrica, int puerto, String host) {
    try (Socket crudo = new Socket(InetAddress.getLoopbackAddress(), puerto);
         var tls = (SSLSocket) fabrica.createSocket(crudo, host, puerto, true)) {
        SSLParameters parametros = tls.getSSLParameters();
        parametros.setEndpointIdentificationAlgorithm("HTTPS");       // compara el nombre esperado con el certificado
        tls.setSSLParameters(parametros);
        String texto = new String(tls.getInputStream().readNBytes(15), StandardCharsets.UTF_8);
        IO.println(nombre + ": OK " + tls.getSession().getProtocol() + " — " + texto);
    } catch (SSLHandshakeException error) {
        IO.println(nombre + ": RECHAZADO — " + error.getMessage());
    } catch (IOException error) {
        IO.println(nombre + ": error de red — " + error);
    }
}

void main() throws Exception {
    ServerSocket escucha = contextoServidor().getServerSocketFactory()
            .createServerSocket(0, 50, InetAddress.getLoopbackAddress());   // puerto 0: uno libre
    int puerto = escucha.getLocalPort();
    Thread.ofPlatform().daemon().start(() -> {
        while (true) {
            try (Socket conexion = escucha.accept()) {
                conexion.getOutputStream().write("RF-4471 en ruta".getBytes(StandardCharsets.UTF_8));
            } catch (IOException ignorada) {
                // el cliente abortó el saludo TLS
            }
        }
    });

    SSLSocketFactory sinCa = SSLContext.getDefault().getSocketFactory();  // solo las CA del sistema
    SSLSocketFactory conCa = contextoConCa().getSocketFactory();
    probar("sin confiar en la CA", sinCa, puerto, "localhost");
    probar("CA correcta, nombre correcto", conCa, puerto, "localhost");
    probar("CA correcta, otro nombre", conCa, puerto, "api.rutaflow.co");
}
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
$ openssl pkcs12 -export -in servidor.pem -inkey servidor.key -out servidor.p12 -passout pass:laboratorio
$ java TlsCliente.java
sin confiar en la CA: RECHAZADO — (certificate_unknown) PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target
CA correcta, nombre correcto: OK TLSv1.3 — RF-4471 en ruta
CA correcta, otro nombre: RECHAZADO — (certificate_unknown) No subject alternative DNS name matching api.rutaflow.co found.
```

**Explicación por partes.**
- `openssl verify` responde `servidor.pem: OK`: la firma de la CA cuadra. Eso aún no dice nada del nombre.
- Líneas 16–26: el servidor carga su certificado y su clave privada desde `servidor.p12`.
- Líneas 28–39: un almacén de confianza que solo contiene tu CA.
- Líneas 41–46: el cliente abre un socket normal y lo envuelve en TLS con `createSocket(crudo, host, …)`: `host` es el
  nombre que el cliente **espera**. La línea 45 hace que Java lo compare con el certificado.
- Líneas 57–66: el puerto `0` pide uno libre; un hilo atiende conexiones y, si un cliente aborta el saludo TLS, la
  excepción se ignora.
- Línea 70: el contexto por defecto confía en las CA del sistema (`cacerts`), no en la tuya: `PKIX path building failed`.
- Con tu CA la cadena se acepta. Con otro nombre, `No subject alternative DNS name matching api.rutaflow.co found.`

> **Error común.** Borrar las líneas 44–46 (`setEndpointIdentificationAlgorithm`). Un `SSLSocket` creado a mano
> **no compara el nombre** por defecto: el tercer cliente responde `CA correcta, otro nombre: OK TLSv1.3 — RF-4471 en
> ruta`. El canal está cifrado, pero con quien sea que tenga un certificado de tu CA. `HttpClient` sí compara el nombre
> por defecto; cuando trabajes con sockets, actívalo tú.

> **Prevenir errores.** Nunca «arregles» un error de certificado con un `X509TrustManager` que acepta todo: Java lo
> permite sin ninguna advertencia. La corrección es darle al cliente la CA correcta, no apagar la verificación. Crea
> también la CA con `basicConstraints` y `keyUsage`: Java acepta una CA sin esas extensiones, pero los navegadores y
> otros clientes estrictos no.

#### Problema resuelto 3.4
Demuestra que un secreto borrado sigue en el historial de Git y escribe un escáner que falle cuando lo encuentra.

**Razonamiento:**
1. Hacer un commit con `.env`, borrarlo en un segundo commit y buscarlo con `git log -p`.
2. El escáner lee texto por la entrada estándar (`System.in`), busca patrones de secreto y termina con código 1 si encuentra algo.
3. Ese código de salida es lo que hace fallar un paso de CI (Módulo 5, Tema 4).

```java
// Escanear.java — busca secretos en un texto (archivo o historial de Git) leído por la entrada estándar
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

static final Map<String, Pattern> PATRONES = Map.of(
        "asignación de secreto", Pattern.compile(
                "(?i)\\b(secret|secreto|password|clave|api_key|token)\\w*\\s*[=:]\\s*['\"]?([^\\s'\"]{12,})"),
        "clave privada PEM", Pattern.compile("-----BEGIN (?:RSA |EC )?PRIVATE KEY-----"));

void main() throws IOException {
    var entrada = new BufferedReader(new InputStreamReader(System.in, StandardCharsets.UTF_8));
    int hallazgos = 0;
    int numero = 0;
    for (String linea = entrada.readLine(); linea != null; linea = entrada.readLine()) {
        numero++;
        for (var patron : new TreeMap<>(PATRONES).entrySet()) {
            Matcher coincidencia = patron.getValue().matcher(linea);
            if (coincidencia.find()) {
                String visible = coincidencia.groupCount() > 0
                        ? coincidencia.group(2).substring(0, 4) + "…"   // nunca el secreto completo
                        : "(bloque PEM)";
                IO.println("línea " + numero + ": " + patron.getKey() + ": " + visible);
                hallazgos++;
            }
        }
    }
    IO.println("hallazgos: " + hallazgos);
    System.exit(hallazgos > 0 ? 1 : 0);
}
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
$ printf 'void main() {\n    IO.println("RutaFlow");\n}\n' > App.java
$ git add .env App.java
$ git commit -q -m "Configura la aplicación"
$ git rm -q .env
$ git commit -q -m "Quita el archivo de secretos"
$ ls -a
.
..
.git
App.java
$ git log --oneline
1d69d8a Quita el archivo de secretos
2d151a2 Configura la aplicación
$ git log -p --all -- .env | grep SECRETO
-SECRETO_ACTUAL=clave-actual-de-laboratorio
+SECRETO_ACTUAL=clave-actual-de-laboratorio
$ git log -p --all | java ../Escanear.java; echo "código de salida: $?"
línea 13: asignación de secreto: clav…
línea 27: asignación de secreto: clav…
hallazgos: 2
código de salida: 1
$ java ../Escanear.java < App.java; echo "código de salida: $?"
hallazgos: 0
código de salida: 0
```

**Explicación por partes.**
- `ls -a` ya no muestra `.env`, pero `git log -p` lo enseña dos veces: cuando se agregó (`+`) y cuando se borró (`-`).
- Líneas 8–9: busca un nombre que parezca de secreto seguido de `=` o `:` y un valor de al menos 12 caracteres.
- Línea 10: detecta el encabezado de una clave privada en formato PEM.
- Línea 18: un `TreeMap` recorre los patrones siempre en el mismo orden (`Map.of` no garantiza orden).
- Líneas 21–23: muestra solo los primeros 4 caracteres; un escáner no debe volver a filtrar el secreto en su propio log.
- Línea 30: el código de salida `1` hace fallar el paso de CI que lo ejecute.

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
En `~/labs/seguridad/tema3`, escribe `comando.properties` y `Firma.java`. Ejecútalo sin la variable, luego con
`export SECRETO_ACTUAL='clave-actual-de-laboratorio'`, y compara con las siete líneas esperadas.

#### Paso 3 · Verifica TLS
Crea la carpeta `tls`, genera la CA, el certificado del servidor y `servidor.p12`, y ejecuta `java TlsCliente.java`. Debes ver un
`OK TLSv1.3` y dos `RECHAZADO`.

#### Paso 4 · Encuentra el secreto
Crea la carpeta `repo`, repite la secuencia de Git y pasa el historial por `Escanear.java`. Escribe en un archivo
`rotacion.txt` los tres pasos que harías si ese repositorio fuera público.

#### Resumen
- El **cifrado simétrico** usa una sola **clave criptográfica**; el **cifrado asimétrico** usa un par pública/privada.
- La **firma digital** prueba autoría ante terceros; el **HMAC** prueba integridad entre quienes comparten la clave.
- Un **nonce** y una ventana de tiempo frenan el **ataque de repetición**, que una firma sola no detiene.
- **TLS** protege el canal si el cliente verifica el **certificado**, su **autoridad de certificación** y el nombre de host.
- Un **secreto** se entrega por el entorno; si se publica, se rota antes de limpiar el historial.
- La **rotación de claves** usa un `kid` y un periodo en que conviven la clave nueva y la anterior.

#### Ejercicio verificable 1
Básico. Ejecuta `java Escanear.java < cripto/privada.pem; echo $?` desde `~/labs/seguridad/tema3`. ¿Qué imprime?

Respuesta esperada: `línea 1: clave privada PEM: (bloque PEM)`, `hallazgos: 1` y el código `1`. El patrón de la
línea 10 reconoce el encabezado `-----BEGIN PRIVATE KEY-----` que escribe `genpkey`.

#### Ejercicio verificable 2
Intermedio. En `Firma.java`, firma un comando nuevo con `kid` `k-2026-09` (la clave anterior) y nonce `n-rotacion`.
¿Se acepta? ¿Qué cambiarías el día que esa clave deba dejar de valer?

Respuesta esperada: se acepta (`true — aceptado`), porque `k-2026-09` sigue en `SECRETOS`. Para retirarla, se quita
del mapa (línea 55); desde entonces, cualquier sobre con ese `kid` responde `kid desconocido: k-2026-09`.

#### Ejercicio verificable 3
Reto. Agrega a `TlsCliente.java` un cuarto cliente que se conecte por IP: `probar("CA correcta, por IP", conCa, puerto, "127.0.0.1");`.
Predice el resultado antes de ejecutar.

Respuesta esperada: `CA correcta, por IP: OK TLSv1.3 — RF-4471 en ruta`. El certificado incluye `IP Address:127.0.0.1`
en su `subjectAltName`; si generas el certificado solo con `DNS:localhost`, la respuesta pasa a
`RECHAZADO — (certificate_unknown) No subject alternative names matching IP address 127.0.0.1 found`.

#### En el trabajo
En una empresa no se escriben algoritmos criptográficos: se eligen bibliotecas auditadas y se configuran bien.
Los incidentes reales vienen de lo que rodea a la criptografía: claves en repositorios, verificación TLS
desactivada «temporalmente» y claves que nadie rota en años. Los equipos usan escáneres de secretos en cada pull
request y gestores de secretos con rotación automática; tu `Escanear.java` es la versión mínima de esa práctica.

</details>

### Tema 4: Validación, vulnerabilidades web, privacidad y respuesta · Avanzado · 90 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### Objetivos
Al terminar este tema podrás:
- validar una entrada no confiable en el servidor y explicar por qué la validación sola no basta;
- provocar una inyección SQL en una base H2 propia y corregirla con una consulta parametrizada;
- codificar la misma salida para HTML, atributo, JavaScript y URL, y reconocer un XSS;
- aplicar minimización, redacción y retención a datos personales, y medir el alcance de un incidente.

**Conceptos clave:** validación de entrada, inyección SQL, consulta parametrizada, XSS, codificación de salida, dato personal, privacidad, minimización de datos, redacción de datos, retención de datos, incidente de seguridad

#### El problema
Al entregar un paquete, el conductor escribe una nota libre: «dejado con el portero». Esa nota se guarda en la base,
se muestra en el panel del operador, viaja en una URL de búsqueda y queda en el log. En cada uno de esos lugares, un
texto malicioso puede convertirse en código. Y si la nota trae un teléfono, ya es un dato personal. ¿Cómo tratas
una entrada que no controlas en cada sitio por donde pasa?

Este tema usa lo que ya conoces: SQL y JDBC con H2 (Módulo 4, Temas 1 y 2), **HTML**, **formulario**,
**JavaScript** y **validación** del navegador (Módulo 3, Tema 3), **URL** (Módulo 3, Tema 1), **registro**
(Módulo 5, Tema 1) y **límite de confianza** (Tema 1 de este módulo). Aquí no se redefinen.

#### Glosario del tema

**validación de entrada**
- **Definición técnica:** comprobación en el servidor de que un dato recibido cumple el dominio esperado (tipo, longitud, formato, caracteres) antes de usarlo.
- **En palabras sencillas:** el control de calidad en la puerta de la bodega: lo que no cumple, no entra.
- **Dónde se rompe la comparación:** la validación del navegador (Módulo 3) se salta con `curl`; solo cuenta la que hace el servidor.
- **Ejemplo:** `Validar.java` responde `'<img src=x onerror=alert(1)>': rechazada — contiene etiquetas`.
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
- **Error típico:** olvidar `setString` antes de ejecutar: `JdbcSQLDataException: Parameter "#1" is not set`.

**XSS**
- **Definición técnica:** *cross-site scripting*: vulnerabilidad en la que un dato del usuario se inserta en una página sin codificar y el navegador lo ejecuta como JavaScript.
- **En palabras sencillas:** alguien deja una nota que, al leerla en pantalla, se convierte en un programa que actúa con tu sesión.
- **Dónde se rompe la comparación:** la nota se ve inofensiva en la base de datos; el daño ocurre en el navegador de otra persona.
- **Ejemplo:** `Salida.java` muestra `sin codificar: <p>"><script>alert("RF")</script></p>`: el navegador ejecutaría ese `script`.
- **Error típico:** filtrar solo la palabra `script`; `<img onerror=…>` ejecuta código sin esa palabra.

**codificación de salida**
- **Definición técnica:** transformación de un dato al escribirlo en un contexto (HTML, atributo, JavaScript, URL) para que se lea como dato y no como sintaxis de ese contexto.
- **En palabras sencillas:** traducir la nota al idioma del lugar donde la pegas, para que nadie la confunda con una orden.
- **Dónde se rompe la comparación:** no es la codificación de caracteres del Módulo 1 (UTF-8); aquí se cambian símbolos como `<` por `&lt;`.
- **Ejemplo:** `escaparHtml` produce `&lt;script&gt;` y `URLEncoder.encode` produce `%3Cscript%3E` para la misma nota.
- **Error típico:** usar la codificación de un contexto en otro; `escaparHtml` no protege dentro de un bloque `<script>`.

**dato personal**
- **Definición técnica:** información vinculada o vinculable a una persona natural identificada o identificable: nombre, cédula, teléfono, dirección, correo.
- **En palabras sencillas:** cualquier dato con el que se puede saber de quién se trata.
- **Dónde se rompe la comparación:** un dato suelto parece inofensivo; varios juntos (barrio, hora y edificio) identifican a alguien.
- **Ejemplo:** en `Privacidad.java`, `cedula`, `fecha_nacimiento` y `telefono` son datos personales del formulario.
- **Error típico:** creer que un teléfono escrito dentro de una nota libre «no cuenta»: sigue siendo un dato personal.

**privacidad**
- **Definición técnica:** derecho de las personas a controlar qué datos suyos se recogen, para qué se usan, quién los ve y cuánto tiempo se guardan; en Colombia lo regula la Ley 1581 de 2012.
- **En palabras sencillas:** que tu información se use solo para lo que aceptaste y nada más.
- **Dónde se rompe la comparación:** seguridad y privacidad no son lo mismo: un sistema seguro puede violar la privacidad si recoge datos que no necesita.
- **Ejemplo:** `Privacidad.java` aplica tres decisiones de privacidad: descartar campos, redactar logs y borrar lo vencido.
- **Error típico:** pedir permiso «para todo» en un texto largo; el uso debe tener un fin concreto.

**minimización de datos**
- **Definición técnica:** principio de recoger y conservar solo los datos estrictamente necesarios para la finalidad declarada.
- **En palabras sencillas:** no guardes lo que no vas a usar; lo que no tienes, no se te puede filtrar.
- **Dónde se rompe la comparación:** la nota libre puede traer datos que nunca pediste; minimizar también es limpiar lo que llega sin querer.
- **Ejemplo:** `Privacidad.java` imprime `descartados: [cedula, fecha_nacimiento, telefono]`.
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
- **Ejemplo:** con 30 días al 2026-11-24, `Privacidad.java` conserva `2 de 3` registros.
- **Error típico:** borrar de la base y olvidar las copias de seguridad y los logs, donde el dato sigue vivo.

**incidente de seguridad**
- **Definición técnica:** evento que compromete o pudo comprometer la confidencialidad, integridad o disponibilidad de un activo, y que exige respuesta documentada.
- **En palabras sencillas:** algo salió mal con datos o sistemas y hay que actuar, medir y explicar.
- **Dónde se rompe la comparación:** no todo incidente es un ataque; un log que guarda teléfonos completos por error también lo es.
- **Ejemplo:** `Incidente.java` mide `líneas con teléfono completo: 3 de 4` y `personas distintas expuestas: 2`.
- **Error típico:** corregir el código y no medir el alcance: sin saber cuántas personas y qué fechas, no hay respuesta posible.

#### ► CÓMO FUNCIONA
La nota cruza el límite de confianza en cuanto llega al servidor. Desde ahí se aplican defensas en capas, cada una
en su lugar. **Validar** al entrar reduce lo que llega. **Parametrizar** al consultar separa estructura y dato.
**Codificar** al mostrar adapta el dato a cada contexto. **Minimizar, redactar y retener** al registrar protege a las
personas cuyos datos aparecen.

| Lugar | Riesgo | Defensa | En Java |
|---|---|---|---|
| Entrada | Datos fuera de dominio | Validación de entrada | Tu método `validar` |
| Base de datos | Inyección SQL | Consulta parametrizada | `PreparedStatement` con `?` y `setString` |
| HTML | XSS | Codificación de salida | `escaparHtml` (o la plantilla del framework) |
| JavaScript | XSS | Codificación de salida | literal de cadena con `<` como `\u003c` |
| URL | Parámetros rotos o inyectados | Codificación de salida | `URLEncoder.encode` |
| Log | Exposición de datos personales | Redacción y retención | `Matcher.replaceAll`, `ChronoUnit.DAYS` |

```mermaid
flowchart TD
    IN["nota del conductor<br/>entrada no confiable"] --> VAL{"validar dominio<br/>1-200, sin etiquetas"}
    VAL -->|"válida"| DB["consulta parametrizada<br/>estructura separada del dato"]
    VAL -->|"inválida"| REJ["rechazar con motivo"]
    DB --> OUT{"codificar según contexto"}
    OUT --> H["texto HTML<br/>escaparHtml"]
    OUT --> A["atributo<br/>escaparHtml con comillas"]
    OUT --> J["JavaScript<br/>literal con \u003c"]
    OUT --> U["URL<br/>URLEncoder.encode"]
    DB --> LOG["log"]
    LOG --> RED["redactar datos personales<br/>+ retención"]
    RED -.-> INC["si algo falló:<br/>medir alcance del incidente"]
```

#### Problema resuelto 4.1
Valida la nota del conductor: no vacía, máximo 200 caracteres y sin etiquetas.

**Razonamiento:**
1. Cada regla devuelve un motivo distinto, para que el conductor sepa qué corregir.
2. `isBlank()` ignora los espacios: una nota de solo espacios cuenta como vacía.
3. El resultado es un `Optional<String>`: vacío si la nota es válida, con el motivo si no lo es.
4. Probar con un caso válido y uno por cada regla.

```java
// Validar.java — valida la nota del conductor antes de guardarla
Optional<String> validar(String nota) {          // vacío = sin errores
    if (nota.isBlank()) {
        return Optional.of("vacía");
    }
    if (nota.length() > 200) {
        return Optional.of("supera 200 caracteres");
    }
    if (nota.contains("<") || nota.contains(">")) {
        return Optional.of("contiene etiquetas");
    }
    return Optional.empty();
}

void main() {
    List<String> casos = List.of("dejado con el portero", "<img src=x onerror=alert(1)>", "a".repeat(201), "   ");
    for (String nota : casos) {
        String etiqueta = nota.length() <= 30 ? nota : nota.substring(0, 27) + "...";
        String veredicto = validar(nota).map(error -> "rechazada — " + error).orElse("válida");
        IO.println("'" + etiqueta + "': " + veredicto);
    }
}
```

```text
$ java Validar.java
'dejado con el portero': válida
'<img src=x onerror=alert(1)>': rechazada — contiene etiquetas
'aaaaaaaaaaaaaaaaaaaaaaaaaaa...': rechazada — supera 200 caracteres
'   ': rechazada — vacía
```

**Explicación por partes.**
- Líneas 3–11: tres reglas en orden; la primera que falla devuelve su motivo.
- Línea 12: `Optional.empty()` significa «sin errores».
- Línea 18: las notas largas se recortan al mostrarlas para que la salida sea legible.
- La validación reduce la superficie, pero no reemplaza las defensas de los dos problemas siguientes.

#### Problema resuelto 4.2
En una base H2 en memoria, compara la consulta concatenada con la parametrizada usando dos textos maliciosos.
Es un laboratorio: la base y los datos son tuyos y desaparecen al terminar el programa.

**Razonamiento:**
1. Crear la tabla `notas` con dos filas, insertadas ya con parámetros.
2. Para cada texto, ejecutar las dos versiones de la misma búsqueda y contar las filas.
3. Incluir un texto normal como control: las dos versiones deben coincidir con él.

```java
// Inyeccion.java — laboratorio local: consulta concatenada frente a consulta parametrizada
import java.sql.*;

List<String> filas(ResultSet resultado) throws SQLException {
    List<String> filas = new ArrayList<>();
    while (resultado.next()) {
        filas.add("(" + resultado.getInt(1) + ", " + resultado.getString(2) + ")");
    }
    return filas;
}

void main() throws SQLException {
    try (Connection db = DriverManager.getConnection("jdbc:h2:mem:")) {   // vive solo mientras corre el programa
        db.createStatement().execute("CREATE TABLE notas (id INT AUTO_INCREMENT PRIMARY KEY, texto VARCHAR(200))");
        PreparedStatement insertar = db.prepareStatement("INSERT INTO notas (texto) VALUES (?)");
        for (String texto : List.of("dejado con el portero", "entregado en recepción")) {
            insertar.setString(1, texto);
            insertar.executeUpdate();
        }

        List<String> payloads = List.of(
                "dejado con el portero",
                "dejado' OR '1'='1",
                "x' UNION SELECT 99, 'dato filtrado' --");
        for (String payload : payloads) {
            PreparedStatement segura = db.prepareStatement("SELECT id, texto FROM notas WHERE texto = ?");
            segura.setString(1, payload);
            List<String> parametrizada = filas(segura.executeQuery());
            List<String> concatenada = filas(db.createStatement()
                    .executeQuery("SELECT id, texto FROM notas WHERE texto = '" + payload + "'"));
            IO.println("payload: " + payload);
            IO.println("  parametrizada: " + parametrizada.size() + " filas");
            IO.println("  concatenada:   " + concatenada.size() + " filas -> " + concatenada);
        }
    }
}
```

```text
$ java -cp ~/herramientas/h2-2.3.232.jar Inyeccion.java
payload: dejado con el portero
  parametrizada: 1 filas
  concatenada:   1 filas -> [(1, dejado con el portero)]
payload: dejado' OR '1'='1
  parametrizada: 0 filas
  concatenada:   2 filas -> [(1, dejado con el portero), (2, entregado en recepción)]
payload: x' UNION SELECT 99, 'dato filtrado' --
  parametrizada: 0 filas
  concatenada:   1 filas -> [(99, dato filtrado)]
```

**Explicación por partes.**
- Línea 13: `jdbc:h2:mem:` crea una base que vive solo mientras corre el programa.
- Líneas 26–28: el `?` recibe el valor con `setString`. El motor busca ese texto literal y no encuentra nada.
- Líneas 29–30: `+` pega el texto dentro de la sentencia. La comilla del atacante cierra la cadena SQL.
- Segundo caso: la sentencia queda `WHERE texto = 'dejado' OR '1'='1'`, verdadera para todas las filas.
- Tercer caso: `UNION SELECT` agrega una fila inventada por el atacante, y `--` comenta el resto de la sentencia.

> **Error común.** Concatenar un texto legítimo con apóstrofo. Con la nota `portero's` como primer payload, el
> programa termina con `org.h2.jdbc.JdbcSQLSyntaxErrorException: Syntax error in SQL statement "SELECT id, texto FROM notas WHERE texto = 'portero's[*]'"`; el `[*]` marca dónde se perdió el analizador. No es mala suerte: es la misma vulnerabilidad,
> descubierta por un usuario honesto.

> **Buena práctica.** Toda sentencia con un valor variable usa `?` en un `PreparedStatement`, sin excepciones, aunque
> el valor «venga de dentro». Así la regla se revisa con una búsqueda: `grep -n "executeQuery(\".*+" *.java` debe
> dar cero resultados.

#### Problema resuelto 4.3
Muestra la misma nota maliciosa en cuatro contextos y codifícala para cada uno.

**Razonamiento:**
1. Partir de una nota que cierra un atributo (`">`) y abre un `script`.
2. El JDK no trae un codificador HTML: `escaparHtml` cambia `&`, `<`, `>` y las dos comillas por entidades. En un
   proyecto real lo hace el motor de plantillas (Thymeleaf, por ejemplo) o una librería como OWASP Java Encoder.
3. Dentro de `<script>`, el dato va como literal de cadena, y `<` se escribe `\u003c` para que `</script>` no cierre el bloque.
4. En una URL, `URLEncoder.encode` codifica también `/`.

```java
// Salida.java — la misma nota, codificada según el contexto donde se muestra
import java.net.URLEncoder;

String escaparHtml(String texto) {   // sirve para texto HTML y para atributos entre comillas
    return texto.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
            .replace("\"", "&quot;").replace("'", "&#x27;");
}

String literalJs(String texto) {     // literal de cadena JavaScript que no puede cerrar el <script>
    return "\"" + texto.replace("\\", "\\\\").replace("\"", "\\\"").replace("<", "\\u003c") + "\"";
}

void main() {
    String nota = "\"><script>alert(\"RF\")</script>";

    IO.println("sin codificar: <p>" + nota + "</p>");
    IO.println("texto HTML:    <p>" + escaparHtml(nota) + "</p>");
    IO.println("atributo:      <input value=\"" + escaparHtml(nota) + "\">");
    IO.println("JavaScript:    <script>const nota = " + literalJs(nota) + ";</script>");
    IO.println("URL:           /buscar?nota=" + URLEncoder.encode(nota, StandardCharsets.UTF_8));
}
```

```text
$ java Salida.java
sin codificar: <p>"><script>alert("RF")</script></p>
texto HTML:    <p>&quot;&gt;&lt;script&gt;alert(&quot;RF&quot;)&lt;/script&gt;</p>
atributo:      <input value="&quot;&gt;&lt;script&gt;alert(&quot;RF&quot;)&lt;/script&gt;">
JavaScript:    <script>const nota = "\">\u003cscript>alert(\"RF\")\u003c/script>";</script>
URL:           /buscar?nota=%22%3E%3Cscript%3Ealert%28%22RF%22%29%3C%2Fscript%3E
```

**Explicación por partes.**
- Líneas 4–7: `&` se reemplaza **primero**; si fuera después, convertiría el `&` de `&lt;` en `&amp;lt;`.
- Línea 16: la versión sin codificar inserta un `script` real en la página: eso es un XSS.
- Líneas 17–18: en HTML el navegador muestra `"><script>…` como texto, sin ejecutarlo.
- Líneas 9–11 y 19: el literal pone comillas y escapa la barra invertida y las comillas internas; el reemplazo de `<`
  evita cerrar el bloque `script`.
- Línea 20: `%22`, `%3E`, `%3C` son las comillas y los signos codificados para URL. `URLEncoder` está pensado para
  formularios: un espacio sale como `+`.

> **Error común.** Construir el HTML concatenando el texto sin codificar. La primera línea de la salida es lo que
> llegaría al navegador: un `<script>` ejecutable. Los motores de plantillas modernos codifican por defecto; la falla
> aparece cuando alguien desactiva esa protección para «mostrar formato».

#### Problema resuelto 4.4
Aplica minimización, redacción y retención a un envío, y mide el alcance de un log viejo que guardó teléfonos.

**Razonamiento:**
1. Minimizar: quedarse solo con los campos que la entrega necesita.
2. Redactar: dejar los tres primeros dígitos del celular y ocultar correos antes de escribir el log.
3. Retener: conservar solo registros de los últimos 30 días contados desde una fecha fija.
4. Ante el log viejo: contar líneas, personas y fechas afectadas antes de decidir la respuesta.

```java
// Privacidad.java — minimizar, redactar y retener datos personales de RutaFlow
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.regex.Pattern;

static final LocalDate HOY = LocalDate.of(2026, 11, 24);
static final long RETENCION_DIAS = 30;
static final Set<String> CAMPOS_NECESARIOS = Set.of("guia", "ciudad", "nota");
static final Pattern TELEFONO = Pattern.compile("\\b3\\d{9}\\b");
static final Pattern CORREO = Pattern.compile("\\b[\\w.+-]+@[\\w-]+\\.[\\w.]+\\b");

record Log(LocalDate fecha, String texto) {
}

String redactar(String texto) {
    String sinTelefonos = TELEFONO.matcher(texto).replaceAll(m -> m.group().substring(0, 3) + "*******");
    return CORREO.matcher(sinTelefonos).replaceAll("[correo]");
}

void main() {
    Map<String, String> formulario = Map.of(
            "guia", "RF-4471", "ciudad", "Bogotá", "nota", "llamar al 3104567890 antes de subir",
            "cedula", "1020304050", "fecha_nacimiento", "1994-03-02", "telefono", "3104567890");
    Map<String, String> registro = new TreeMap<>();
    formulario.forEach((clave, valor) -> {
        if (CAMPOS_NECESARIOS.contains(clave)) {
            registro.put(clave, valor);
        }
    });
    IO.println("descartados: " + formulario.keySet().stream()
            .filter(clave -> !registro.containsKey(clave)).sorted().toList());

    IO.println("log: " + redactar("entrega " + registro.get("guia") + ": " + registro.get("nota")));
    IO.println("log: " + redactar("cliente ana.p@correo.example pidió factura"));

    List<Log> logs = List.of(
            new Log(LocalDate.of(2026, 10, 1), "entrega RF-4102"),
            new Log(LocalDate.of(2026, 10, 30), "entrega RF-4388"),
            new Log(LocalDate.of(2026, 11, 20), "entrega RF-4471"));
    List<String> vigentes = logs.stream()
            .filter(log -> ChronoUnit.DAYS.between(log.fecha(), HOY) <= RETENCION_DIAS)
            .map(Log::texto).toList();
    IO.println("retención 30 días: se conservan " + vigentes.size() + " de " + logs.size() + ": " + vigentes);
}
```

```text
$ java Privacidad.java
descartados: [cedula, fecha_nacimiento, telefono]
log: entrega RF-4471: llamar al 310******* antes de subir
log: cliente [correo] pidió factura
retención 30 días: se conservan 2 de 3: [entrega RF-4388, entrega RF-4471]
```

```java
// Incidente.java — mide el alcance de un log que guardó teléfonos completos
import java.util.regex.Pattern;

static final Pattern TELEFONO = Pattern.compile("\\b3\\d{9}\\b");

void main() {
    List<String> logViejo = List.of(
            "2026-11-20 entrega RF-4471: llamar al 3104567890",
            "2026-11-20 entrega RF-4472: dejado con el portero",
            "2026-11-21 entrega RF-4480: timbre dañado, 3157778899",
            "2026-11-21 entrega RF-4481: llamar al 3104567890 otra vez");
    List<String> afectadas = logViejo.stream().filter(linea -> TELEFONO.matcher(linea).find()).toList();
    Set<String> telefonos = afectadas.stream()
            .flatMap(linea -> TELEFONO.matcher(linea).results().map(MatchResult::group))
            .collect(Collectors.toSet());                 // un conjunto: el repetido cuenta una vez
    IO.println("líneas con teléfono completo: " + afectadas.size() + " de " + logViejo.size());
    IO.println("personas distintas expuestas: " + telefonos.size());
    IO.println("fechas afectadas: " + afectadas.stream().map(linea -> linea.substring(0, 10)).distinct().sorted().toList());
}
```

```text
$ java Incidente.java
líneas con teléfono completo: 3 de 4
personas distintas expuestas: 2
fechas afectadas: [2026-11-20, 2026-11-21]
```

**Explicación por partes.**
- `Privacidad.java`, líneas 24–29: solo se copian las claves de `CAMPOS_NECESARIOS`.
- Línea 9: un celular colombiano de este ejemplo es `3` seguido de 9 dígitos; `\b` exige que no esté pegado a otros dígitos.
- Línea 16: la lambda de `replaceAll` recibe cada coincidencia y devuelve su versión redactada.
- Línea 41: `ChronoUnit.DAYS.between` cuenta los días; los registros de más de 30 días quedan fuera.
- `Incidente.java`, líneas 12–15: las líneas afectadas y el **conjunto** de teléfonos distintos; el repetido cuenta una vez.
- Esas tres cifras (líneas, personas, fechas) son la base del informe del incidente.

> **Prevenir errores.** Redacta en el punto donde se escribe el log, no en cada llamada. Un `Formatter` de
> `java.util.logging` (o un filtro de Logback) que redacta siempre evita que un desarrollador nuevo olvide hacerlo.

#### Checkpoint 4.1
Una nota pasa `validar` y se guarda con consulta parametrizada. ¿Ya puedes mostrarla en el panel sin más?

Respuesta: no. Validar y parametrizar protegen la entrada y la base; al mostrarla hay que codificar para el contexto
del panel (HTML, atributo, JavaScript o URL). Cada defensa protege un lugar distinto.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Paso 1 · Valida
Crea `~/labs/seguridad/tema4`, escribe `Validar.java` y confirma las cuatro líneas de salida. Agrega un quinto caso con
la nota `O'Brien recibió` y comprueba que es válida.

#### Paso 2 · Inyecta en tu laboratorio
Escribe `Inyeccion.java` y ejecútalo con `java -cp ~/herramientas/h2-2.3.232.jar Inyeccion.java`. Confirma que la columna concatenada devuelve `2 filas` y `1 filas` en los casos
maliciosos, y que la parametrizada devuelve `0 filas`.

#### Paso 3 · Codifica
Escribe `Salida.java`. Copia la línea `texto HTML` a un archivo `nota.html`, ábrelo en el navegador y comprueba que ves
el texto y no una alerta.

#### Paso 4 · Protege los datos personales
Escribe `Privacidad.java` e `Incidente.java`. En un archivo `incidente.txt`, anota las cifras del alcance y una acción
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

Respuesta esperada: `parametrizada: 0 filas` y `concatenada:   2 filas -> [(1, dejado con el portero), (2, entregado en recepción)]`.
`OR 1=1` es siempre verdadero y `--` comenta la comilla que sobraba.

#### Ejercicio verificable 2
Intermedio. Pasa por `redactar` el texto `llamar al 3104567890 o al +57 310 456 7890`. ¿Qué sale y qué harías?

Respuesta esperada: `llamar al 310******* o al +57 310 456 7890`. El segundo formato tiene espacios y prefijo, y el
patrón de la línea 9 no lo reconoce. Hay que ampliar el patrón y, mejor aún, minimizar: no copiar la nota libre al log.

#### Ejercicio verificable 3
Reto. En `Incidente.java`, aplica `redactar` (cópialo de `Privacidad.java`) a cada línea de `log_viejo` y vuelve a medir.
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
- **Ejemplo:** el correo `typosquat` combina urgencia y miedo: `Analizar.java` detecta `urgente, suspendida, 24 horas, verifique`.
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
- **Ejemplo:** `Urls.java` marca `https://rutaflоw.co/datos` con `el host tiene caracteres no ASCII (homógrafo)`.
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
- **Ejemplo:** en `suplantado`, `dkim=pass` pero `DKIM firmado por: mailer.example; alineado: false`.
- **Error típico:** quedarse con `dkim=pass` sin comprobar que `header.d` coincide con el dominio del `From`.

**DMARC**
- **Definición técnica:** política DNS que exige que SPF o DKIM pasen **alineados** con el dominio del `From`, e indica qué hacer si no: `none`, `quarantine` o `reject`.
- **En palabras sencillas:** la regla de la empresa: «si el sello no es nuestro, bota la carta» (o apártala).
- **Dónde se rompe la comparación:** con `p=none` solo se informa; el correo falso llega igual.
- **Ejemplo:** `Autenticacion.java` imprime `dmarc=fail política=quarantine` y `decisión: cuarentena`.
- **Error típico:** publicar DMARC con `p=none` y no subir nunca a `quarantine` o `reject`.

**runbook**
- **Definición técnica:** procedimiento escrito, paso a paso, para responder a un tipo de incidente; dice quién actúa, en qué orden y qué evidencia guarda.
- **En palabras sencillas:** la receta para el día malo, escrita el día tranquilo.
- **Dónde se rompe la comparación:** una receta se sigue igual siempre; el runbook se ajusta después de cada incidente real.
- **Ejemplo:** cuando `Analizar.java` imprime `SOSPECHOSO`, el runbook de este tema ordena reportar, buscar a otros destinatarios y revocar sesiones.
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
4. El JDK no trae un lector de correos (Jakarta Mail es una librería aparte), así que `Correo.java` separa cabeceras
   y cuerpo con las dos reglas básicas: una línea vacía separa el cuerpo, y una línea que empieza con espacio
   continúa la cabecera anterior. `Analizar.java` lo reutiliza.

```java
// Correo.java — separa las cabeceras y el cuerpo de un correo en texto (RFC 5322, versión mínima)
import java.util.Map;
import java.util.TreeMap;

record Correo(Map<String, String> cabeceras, String cuerpo) {
    static Correo leer(String crudo) {
        Map<String, String> cabeceras = new TreeMap<>(String.CASE_INSENSITIVE_ORDER); // From = from
        String[] partes = crudo.split("\n\n", 2);                    // una línea vacía separa el cuerpo
        String ultima = null;
        for (String linea : partes[0].split("\n")) {
            if (linea.startsWith(" ") && ultima != null) {            // continuación de la cabecera anterior
                cabeceras.merge(ultima, linea, (a, b) -> a + "\n" + b);
            } else {
                int dosPuntos = linea.indexOf(':');
                ultima = linea.substring(0, dosPuntos);
                cabeceras.put(ultima, linea.substring(dosPuntos + 1).strip());
            }
        }
        return new Correo(cabeceras, partes.length > 1 ? partes[1] : "");
    }

    String cabecera(String nombre) {                                  // null si no existe
        return cabeceras.get(nombre);
    }
}
```

```java
// Autenticacion.java — interpreta la cabecera Authentication-Results de un correo
import java.util.regex.Pattern;

static final Pattern RESULTADO = Pattern.compile("\\b(spf|dkim|dmarc)=(\\w+)");

String grupo(String regex, String texto) {
    var m = Pattern.compile(regex).matcher(texto);
    return m.find() ? m.group(1) : null;
}

void main() {
    Map<String, String> crudos = new LinkedHashMap<>();
    crudos.put("factura", """
            From: facturas@rutaflow.co
            Authentication-Results: mx.rutaflow.co; spf=pass smtp.mailfrom=rutaflow.co;
             dkim=pass header.d=rutaflow.co; dmarc=pass (p=reject) header.from=rutaflow.co
            Subject: Factura de octubre

            Adjunta la factura.""");
    crudos.put("suplantado", """
            From: soporte@rutaflow.co
            Authentication-Results: mx.rutaflow.co; spf=fail smtp.mailfrom=mailer.example;
             dkim=pass header.d=mailer.example; dmarc=fail (p=quarantine) header.from=rutaflow.co
            Subject: Cambie su clave

            Ingrese ya.""");

    crudos.forEach((nombre, crudo) -> {
        Correo correo = Correo.leer(crudo);
        String cabecera = String.join(" ", correo.cabecera("Authentication-Results").strip().split("\\s+"));
        Map<String, String> r = new HashMap<>();
        RESULTADO.matcher(cabecera).results().forEach(m -> r.put(m.group(1), m.group(2)));
        String politica = grupo("\\(p=(\\w+)\\)", cabecera);
        String firmante = grupo("header\\.d=([\\w.-]+)", cabecera);
        String visible = correo.cabecera("From").substring(correo.cabecera("From").lastIndexOf('@') + 1);
        IO.println("%s: spf=%s dkim=%s dmarc=%s política=%s".formatted(nombre, r.get("spf"), r.get("dkim"), r.get("dmarc"), politica));
        IO.println("  From visible: %s; DKIM firmado por: %s; alineado: %s".formatted(visible, firmante, firmante.equals(visible)));
        if (!r.get("dmarc").equals("pass")) {
            String decision = switch (politica) {
                case "reject" -> "rechazar";
                case "quarantine" -> "cuarentena";
                default -> "entregar con aviso";
            };
            IO.println("  decisión: " + decision);
        }
    });
}
```

```text
$ java Autenticacion.java
factura: spf=pass dkim=pass dmarc=pass política=reject
  From visible: rutaflow.co; DKIM firmado por: rutaflow.co; alineado: true
suplantado: spf=fail dkim=pass dmarc=fail política=quarantine
  From visible: rutaflow.co; DKIM firmado por: mailer.example; alineado: false
  decisión: cuarentena
```

**Explicación por partes.**
- `Correo.java`, líneas 7 y 11–13: las cabeceras no distinguen mayúsculas; una cabecera larga continúa en la línea
  siguiente si esta empieza con espacio.
- `Autenticacion.java`, líneas 14–27: los bloques de texto (`"""`) guardan el correo tal cual, con sus saltos de línea.
- Línea 30: `split("\\s+")` y `join` quitan saltos de línea y espacios repetidos.
- Líneas 31–32: cada coincidencia de `spf|dkim|dmarc=valor` se guarda en un mapa.
- Línea 37: la alineación compara el dominio firmante con el visible. En el suplantado, `dkim=pass` no basta.
- Líneas 38–45: solo si DMARC falla se aplica la política publicada por el dominio.

> **Error común.** Analizar un correo que no trae `Authentication-Results`, por ejemplo uno reenviado como texto.
> La línea 30 termina con `Exception in thread "main" java.lang.NullPointerException: Cannot invoke "String.strip()" because the return value of "Correo.cabecera(String)" is null`: el mapa devuelve `null` si la cabecera no existe. Comprueba antes
> `if (correo.cabecera("Authentication-Results") == null)` y analiza el original.

#### Problema resuelto 5.2
Revisa tres correos completos: compara cabeceras, enlaces y palabras de urgencia, y marca los sospechosos.

**Razonamiento:**
1. `Correo.leer` separa cabeceras y cuerpo; una expresión regular toma cada `<a href="…">texto</a>` del HTML. Sirve
   para estos correos de laboratorio; un filtro real usa un analizador de HTML como jsoup.
2. `URI` separa la URL en partes: lo que va antes de `@` en la autoridad es usuario (`getUserInfo`), no destino.
3. Cada señal es una línea de alerta; un correo sin alertas se considera limpio, no «seguro».

```java
// Analizar.java — revisa cabeceras, enlaces y urgencia de un correo
import java.net.URI;
import java.util.regex.Pattern;

static final Set<String> DOMINIOS = Set.of("rutaflow.co");
static final List<String> PALABRAS = List.of("urgente", "suspendida", "24 horas", "verifique", "inmediato");
static final Pattern ENLACE = Pattern.compile("<a\\s+href=\"([^\"]*)\"[^>]*>([^<]*)</a>"); // href y texto visible

String dominio(String direccion) {
    return direccion.substring(direccion.lastIndexOf('@') + 1).strip().toLowerCase().replace(">", "");
}

String host(URI uri) {             // getHost() es null si el host tiene caracteres no ASCII
    if (uri.getHost() != null) {
        return uri.getHost().toLowerCase();
    }
    String autoridad = uri.getAuthority() == null ? "" : uri.getAuthority();
    return autoridad.substring(autoridad.lastIndexOf('@') + 1).toLowerCase();
}

List<String> revisar(String crudo) {
    Correo correo = Correo.leer(crudo);
    String remitente = dominio(Objects.requireNonNullElse(correo.cabecera("From"), ""));
    List<String> alertas = new ArrayList<>();

    for (String cabecera : List.of("Return-Path", "Reply-To")) {
        String valor = correo.cabecera(cabecera);
        if (valor != null && !dominio(valor).equals(remitente)) {
            alertas.add(cabecera + " " + dominio(valor) + " no coincide con From " + remitente);
        }
    }

    var enlaces = ENLACE.matcher(correo.cuerpo());
    while (enlaces.find()) {
        String href = enlaces.group(1);
        String texto = enlaces.group(2).strip();
        URI destino = URI.create(href);
        String host = host(destino);
        if (destino.getUserInfo() != null) {
            alertas.add("URL con userinfo: " + href + " -> destino real " + host);
        }
        if (host.startsWith("xn--")) {
            alertas.add("dominio punycode: " + host);
        }
        List<String> raros = host.codePoints().filter(c -> c > 127)
                .mapToObj(c -> Character.toString(c) + " (U+%04X)".formatted(c)).toList();
        if (!raros.isEmpty()) {
            alertas.add("homógrafo en el destino: " + raros + " en " + host);
        }
        if (!host.isEmpty() && !host.matches("[\\d.]+") && !DOMINIOS.contains(host)) {
            alertas.add("destino fuera de la lista blanca: " + host);
        }
        if (!"https".equals(destino.getScheme())) {
            alertas.add("enlace sin HTTPS: " + href);
        }
        String visible = host(URI.create(texto.contains("://") ? texto : "https://" + texto));
        if (!visible.isEmpty() && !visible.equals(host)) {
            alertas.add("texto muestra " + visible + " pero va a " + host);
        }
    }

    String textoTotal = (Objects.requireNonNullElse(correo.cabecera("Subject"), "") + " " + correo.cuerpo()).toLowerCase();
    List<String> urgencia = PALABRAS.stream().filter(textoTotal::contains).toList();
    if (!urgencia.isEmpty()) {
        alertas.add("urgencia: " + String.join(", ", urgencia));
    }
    return alertas;
}

void main() {
    Map<String, String> correos = new LinkedHashMap<>();
    correos.put("legítimo", """
            From: facturas@rutaflow.co
            Return-Path: <facturas@rutaflow.co>
            Subject: Factura de octubre
            Content-Type: text/html; charset=utf-8

            <a href="https://rutaflow.co/f/10">rutaflow.co</a>""");
    correos.put("typosquat", """
            From: soporte@rutaf1ow.co
            Return-Path: <rebote@mailer.example>
            Reply-To: ayuda@otro.example
            Subject: URGENTE: cuenta suspendida
            Content-Type: text/html; charset=utf-8

            Verifique en 24 horas: <a href="https://rutaflow.co@rutaf1ow.co/login">rutaflow.co</a>""");
    correos.put("punycode", """
            From: seguridad@rutaflow.co
            Subject: Actualice sus datos
            Content-Type: text/html; charset=utf-8

            <a href="http://xn--rutflow-4fg.co/datos">rutaflow.co</a>""");

    correos.forEach((nombre, crudo) -> {
        List<String> alertas = revisar(crudo);
        IO.println(nombre + ": " + (alertas.isEmpty() ? "sin señales" : "SOSPECHOSO"));
        alertas.forEach(alerta -> IO.println("  - " + alerta));
    });
}
```

```text
$ java Analizar.java
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
- Línea 7: la expresión toma dos grupos: el `href` y el texto que se muestra.
- Líneas 9–11: `dominio` toma lo que va después de la última `@` y quita el `>` de cierre.
- Líneas 13–19: `URI.getHost()` devuelve `null` si el host tiene caracteres no ASCII; entonces se toma de la autoridad.
- Líneas 26–31: `Return-Path` y `Reply-To` deben ser del mismo dominio que el `From`.
- Líneas 39–41: `getUserInfo` existe cuando la URL trae `algo@`; el navegador va al host de después.
- Líneas 42–52: punycode, caracteres no ASCII y dominios fuera de la lista blanca.
- Líneas 56–59: el texto visible del enlace se interpreta como URL para comparar su host con el destino real.
- Líneas 62–66: las palabras de urgencia se buscan en asunto y cuerpo, en minúsculas.

> **Buena práctica.** No abras los enlaces sospechosos para «ver qué hay». El análisis se hace sobre el texto del
> correo, como aquí. Si hace falta visitar el sitio, lo hace el equipo de seguridad en un entorno aislado.

#### Problema resuelto 5.3
Analiza URLs sueltas, como las que llegan por SMS o chat, y decide por dominio registrable.

**Razonamiento:**
1. Obtener el host real y su dominio registrable.
2. Señalar userinfo, IP en vez de nombre, caracteres no ASCII y punycode decodificado.
3. Aceptar solo si el host o su registrable están en la lista de permitidos.

```java
// Urls.java — revisa a dónde lleva realmente una URL
import java.net.IDN;
import java.net.InetAddress;
import java.net.URI;

static final Set<String> PERMITIDOS = Set.of("rutaflow.co", "pagos.rutaflow.co");

String registrable(String host) {   // versión simple: las dos últimas etiquetas
    String[] etiquetas = host.replaceAll("\\.$", "").split("\\.");
    return etiquetas.length >= 2 ? etiquetas[etiquetas.length - 2] + "." + etiquetas[etiquetas.length - 1] : host;
}

List<String> revisar(String url) {
    URI partes = URI.create(url);
    String autoridad = partes.getAuthority();
    String host = (partes.getHost() != null ? partes.getHost()                  // null si hay caracteres no ASCII
            : autoridad.substring(autoridad.lastIndexOf('@') + 1)).toLowerCase();
    List<String> notas = new ArrayList<>(List.of("host=" + host, "registrable=" + registrable(host)));
    if (partes.getUserInfo() != null) {
        notas.add("userinfo oculta el destino real: " + partes.getUserInfo() + "@" + host);
    }
    try {
        InetAddress.ofLiteral(host);                                            // no consulta el DNS
        notas.add("el destino es una IP, no un dominio");
    } catch (IllegalArgumentException noEsIp) {
        // es un nombre, no una IP
    }
    if (host.codePoints().anyMatch(c -> c > 127)) {
        notas.add("el host tiene caracteres no ASCII (homógrafo)");
    }
    if (host.startsWith("xn--") || host.contains(".xn--")) {
        notas.add("punycode decodifica a " + IDN.toUnicode(host));
    }
    if (!"https".equals(partes.getScheme())) {
        notas.add("sin HTTPS");
    }
    if (!PERMITIDOS.contains(host) && !PERMITIDOS.contains(registrable(host))) {
        notas.add("fuera de la lista blanca por dominio registrable");
    }
    return notas;
}

void main() {
    for (String url : List.of(
            "https://rutaflow.co@rutaf1ow.co/login",
            "https://pagos.rutaflow.co.evil.example/login",
            "https://xn--rutflow-4fg.co/datos",
            "https://rutaflоw.co/datos",
            "http://45.12.3.9/login",
            "https://pagos.rutaflow.co/f/10")) {
        IO.println(url);
        revisar(url).forEach(nota -> IO.println("  - " + nota));
    }
}
```

```text
$ java Urls.java
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
- Líneas 8–11: la versión simple del dominio registrable: las dos últimas etiquetas. Sirve para `.co`, no para `.com.co`.
- Líneas 16–17: el mismo truco del host que en `Analizar.java`, para el homógrafo con `о` cirílica.
- Líneas 22–27: `InetAddress.ofLiteral` (Java 22 o posterior) lanza `IllegalArgumentException` si el host no es una
  IP, sin consultar el DNS; ese caso se ignora.
- Líneas 31–33: `IDN.toUnicode` muestra cómo se vería el punycode: `rutаflow.co`, con una letra cirílica.
- Línea 37: la decisión final usa el registrable; `pagos.rutaflow.co.evil.example` cae porque su dueño es `evil.example`.
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
Crea `~/labs/seguridad/tema5`, escribe `Correo.java` y `Autenticacion.java` y confirma que el suplantado termina en `decisión: cuarentena`.

#### Paso 2 · Analiza correos
Escribe `Analizar.java` y ejecútalo. Agrega un cuarto correo legítimo de `pagos@rutaflow.co` con un enlace a
`https://rutaflow.co/pagos` y comprueba que sale `sin señales`.

#### Paso 3 · Analiza URLs
Escribe `Urls.java`. Para cada URL marcada, escribe en `urls.txt` qué señal la delata y si un usuario la habría notado.

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
Básico. Pasa a `Urls.java` la URL `https://soporte.rutaflow.co/ayuda`. ¿Qué notas imprime?

Respuesta esperada: `host=soporte.rutaflow.co` y `registrable=rutaflow.co`, sin más notas. No está en `PERMITIDOS`,
pero su registrable sí, así que pasa la lista blanca.

#### Ejercicio verificable 2
Intermedio. En `Autenticacion.java`, agrega un tercer correo igual al suplantado pero con `(p=none)`. ¿Qué decisión
imprime y qué riesgo deja?

Respuesta esperada: `decisión: entregar con aviso`. Con `p=none` el correo falso llega a la bandeja; la política solo
sirve para recibir informes. RutaFlow debe subir a `quarantine` y después a `reject`.

#### Ejercicio verificable 3
Reto. RutaFlow hizo una capacitación. En la simulación previa, 18 de 60 personas hicieron clic; en la posterior, 12 de
60. ¿Bajó de verdad? Usa el intervalo de Wilson al 95 %, que da el rango plausible de la proporción real:

```java
// Campana.java — ¿bajaron de verdad los clics tras la capacitación?
record Medicion(String nombre, int clics, int total) {
}

double[] intervaloWilson(int exitos, int total, double z) {
    double p = (double) exitos / total;
    double centro = (p + z * z / (2 * total)) / (1 + z * z / total);
    double margen = z * Math.sqrt(p * (1 - p) / total + z * z / (4.0 * total * total)) / (1 + z * z / total);
    return new double[] {centro - margen, centro + margen};
}

void main() {
    for (var m : List.of(new Medicion("antes", 18, 60), new Medicion("después", 12, 60))) {
        double[] intervalo = intervaloWilson(m.clics(), m.total(), 1.96);
        IO.println("%s: %d/%d = %.0f%%, intervalo 95 %%: %.0f%% a %.0f%%".formatted(m.nombre(), m.clics(), m.total(),
                100.0 * m.clics() / m.total(), 100 * intervalo[0], 100 * intervalo[1]));
    }
}
```

Respuesta esperada:

```text
$ java Campana.java
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
1. **Modelo de amenazas.** Diagrama de flujo de datos con límites de confianza y `amenazas.csv` validado por `Riesgos.java`, con dueño y tratamiento en cada fila (Tema 1).
2. **Credenciales y roles.** Contraseñas con PBKDF2 (`PBKDF2WithHmacSHA256`, 600 000 iteraciones) y sal única, sesiones con expiración y revocación, y autorización por rol y por objeto (Tema 2).
3. **Secretos.** Ningún secreto en el código ni en el historial; `.env.example` con nombres de variables y `Escanear.java` como paso de CI que falla con código 1 (Tema 3).
4. **Pruebas de abuso.** Pruebas JUnit que comprueban que cada acción no autorizada falla: otro usuario, rol equivocado, sesión vencida e inyección SQL (Temas 2 y 4).
5. **Auditoría y privacidad.** Registro de auditoría encadenado con HMAC y logs redactados con retención definida (Temas 2 y 4).
6. **Runbook.** Procedimiento de respuesta a incidentes con pasos, responsables y la evidencia que se guarda (Temas 4 y 5).

#### Criterio de terminado
Un clon limpio del repositorio pasa `gradle test` y `git log -p | java Escanear.java` termina con código 0.
Cada prueba de abuso se vio fallar antes de agregar el control que la hace pasar.

</details>
