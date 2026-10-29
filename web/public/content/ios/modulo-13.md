# Módulo 13: iOS en producción — seguridad, sincronización y operación

Una app no termina cuando compila ni cuando pasa revisión. En producción recibe enlaces manipulados, pierde conectividad a mitad de una escritura, conserva versiones antiguas y maneja datos en dispositivos que pueden extraviarse. Este módulo convierte el proyecto final en un sistema operable: explicita amenazas, protege datos, sincroniza sin duplicar efectos y aprende de fallos reales.


## Aprende construyendo

### Tema 1: El sandbox reduce superficie, pero no valida intenciones

#### Paso 1 · Objetivo y preparación
Al finalizar vas a validar un Universal Link entrante de RutaFlow (`https://rutaflow.app/envios/<id>`) verificando esquema, host, estructura y autorización antes de abrir el envío correspondiente. Prerrequisitos: Módulo 5 completo.
#### Paso 2 · Contexto y caso real
Cualquier app puede construir y enviar un link con la forma `https://rutaflow.app/envios/RF-4471`; que el sistema haya verificado que RutaFlow es la app asociada a ese dominio no significa que el conductor actual tenga permiso de leer ESE envío puntual.
#### Paso 3 · Teoría, modelo mental y analogía
El sandbox y la verificación de dominio reducen qué puede llegar a tu app, pero no validan la intención de cada entrada — una frontera con controles: validar estructura, autenticar, autorizar y recién después actuar.
#### Paso 4 · Demostración guiada
```swift
enum LinkError: Error { case malformed, forbidden }

func envioID(from url: URL, session: Session) throws -> EnvioID {
    guard url.scheme == "https",
          url.host == "rutaflow.app",
          url.pathComponents.count == 3,
          url.pathComponents[1] == "envios",
          let id = EnvioID(rawValue: url.pathComponents[2])
    else { throw LinkError.malformed }
    guard session.puedeLeer(id) else { throw LinkError.forbidden }
    return id
}
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: `envioID(from:session:)` lanza `.malformed` si la URL no tiene exactamente la forma esperada, y lanza `.forbidden` si la estructura es válida pero la sesión actual no tiene permiso de leer ese envío puntual — nunca abre un envío solo porque la URL "se ve bien".
#### Paso 5 · Práctica guiada
Pista: quitá la línea `guard session.puedeLeer(id) else { throw LinkError.forbidden }` "porque ya validamos la estructura de la URL arriba" — ese es el fallo deliberado: ahora cualquier link con la forma correcta abre el envío correspondiente sin verificar si el conductor actual tiene permiso de verlo, exactamente la amenaza que la verificación de dominio no cubre por sí sola.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando la verificación de `session.puedeLeer(id)`, y agregá un test que confirme que un link bien formado pero para un envío ajeno lanza `.forbidden`, no que simplemente "no hace nada".
#### Paso 7 · Cierre y evidencia
Entregá la función con las dos validaciones del Paso 4, el acceso indebido provocado en el Paso 5, y el test de autorización del Paso 6; explicá por qué verificar que RutaFlow es la app asociada a `rutaflow.app` no es lo mismo que verificar que el conductor puede leer un envío puntual. Siguiente paso: estudia cómo proteger los datos que esa función termina leyendo. Errores comunes: confundir verificación de dominio con autorización de recurso, validar solo la forma de la URL sin validar permisos, y asumir que un parámetro con formato correcto es automáticamente seguro. Fuente oficial: https://developer.apple.com/documentation/security.
**¿Por qué es importante?** Porque una entrada válida técnicamente (una URL bien formada) puede intentar acceder a un recurso ajeno; validar estructura, autenticar y autorizar son tres pasos distintos.
**Evidencia de aprendizaje:** entrega función con validación completa, acceso indebido provocado y test de autorización.
**Conceptos clave:** sandbox, entitlement, capability, least privilege, runtime permission, URL scheme, Universal Link, associated domain, input validation, authentication, authorization y threat model.

iOS aísla procesos y exige capacidades firmadas, pero una frontera abierta sigue recibiendo datos no confiables. Audita los entitlements generados, activa únicamente capacidades necesarias y separa configuraciones de desarrollo y producción. Pedir acceso a cámara, fotos, ubicación o contactos requiere propósito concreto, texto comprensible y una ruta alternativa cuando el usuario rechaza el permiso.

Los custom URL schemes pueden ser reclamados por otras apps. Para rutas web sensibles prefiere Universal Links con asociación entre dominio y aplicación. Esa verificación prueba qué app debe abrir el dominio; no demuestra que el usuario pueda leer el recurso. Valida esquema, host, ruta, tamaño y forma de los parámetros; después autentica, autoriza y confirma efectos destructivos.

```swift
enum LinkError: Error { case malformed, forbidden }

func taskID(from url: URL, session: Session) throws -> TaskID {
    guard url.scheme == "https",
          url.host == "tasks.example.com",
          url.pathComponents.count == 3,
          url.pathComponents[1] == "tasks",
          let id = TaskID(rawValue: url.pathComponents[2])
    else { throw LinkError.malformed }
    guard session.canRead(id) else { throw LinkError.forbidden }
    return id
}
```

Construye un modelo de amenazas pequeño antes del código: activos, actores, entradas, fronteras y mitigaciones. Incluye notificaciones, widgets, App Intents, extensiones, pasteboard y contenido remoto. Una extensión comparte menos privilegios, pero un App Group crea almacenamiento compartido que debe tratarse como frontera explícita.

**Analogía:** el sandbox es el perímetro de una biblioteca; un Universal Link es una puerta con dirección verificada. Aun así, el bibliotecario debe comprobar qué libro puede consultar cada visitante.

**¿Por qué es importante?** porque una entrada válida técnicamente puede intentar acceder a otra cuenta o ejecutar una acción inesperada.

**Casos de uso reales:** enlace a un identificador ajeno, permiso solicitado al iniciar sin contexto, URL scheme secuestrado, entitlement sobrante y widget que expone información en pantalla bloqueada.

**Diagrama:**

```text
web/notificación/widget -> frontera iOS -> validar estructura
                                      -> autenticar sesión
                                      -> autorizar recurso
                                      -> confirmar efecto
                                      -> dominio
```

**Diagrama: validación en capas de un Universal Link**

```mermaid
flowchart TD
    A["URL entrante"] --> B{"scheme/host/ruta válidos?"}
    B -->|No| C[".malformed"]
    B -->|Sí| D{"session.puedeLeer(id)?"}
    D -->|No| E[".forbidden"]
    D -->|Sí| F["Abrir DetalleEnvio"]
```

En el proyecto integrador RutaFlow, practicá extendiendo `envioID(from:session:)` a tu proyecto propio con un segundo recurso protegido. Límite de la decisión: verificar el dominio asociado (Universal Link) no conviene tratarlo como prueba de autorización — confirma únicamente que RutaFlow es la app correcta para ese dominio, nunca que el usuario actual puede leer ese recurso puntual; confundir ambos pasos es exactamente la amenaza que este tema demuestra.

### Tema 2: Proteger datos es controlar todas sus copias

#### Paso 1 · Objetivo y preparación
Al finalizar vas a guardar el token de sesión de un conductor en Keychain (no en `UserDefaults`), y a confirmar que ese token no queda expuesto en logs. Prerrequisitos: Módulo 5 completo.
#### Paso 2 · Contexto y caso real
Guardar el token de sesión de un conductor en `UserDefaults` "porque es más simple" lo deja en un archivo plist sin cifrado dedicado, legible por cualquiera con acceso al dispositivo o a un backup del mismo.
#### Paso 3 · Teoría, modelo mental y analogía
Keychain protege secretos pequeños con una clase de accesibilidad explícita; redactar logs es tan necesario como elegir bien el almacén — guardar una joya en una caja fuerte no ayuda si su fotografía queda sobre la mesa.
#### Paso 4 · Demostración guiada
```swift
func guardarToken(_ data: Data, conductorID: String) throws {
    let query: [CFString: Any] = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrService: "com.rutaflow.conductor.session",
        kSecAttrAccount: conductorID,
        kSecValueData: data,
        kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]
    SecItemDelete(query as CFDictionary)
    guard SecItemAdd(query as CFDictionary, nil) == errSecSuccess else {
        throw SesionError.keychainWrite
    }
}
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: el token queda en Keychain con `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` (no migra a otro dispositivo vía backup ni es legible con el teléfono bloqueado); buscar el string del token en los logs de la app no encuentra ninguna coincidencia.
#### Paso 5 · Práctica guiada
Pista: agregá `Logger().info("token guardado: \(String(data: data, encoding: .utf8) ?? "")")` justo después de `SecItemAdd` "para depurar" — ese es el fallo deliberado: ahora el token completo del conductor queda en los logs del sistema en texto plano, exactamente la copia secundaria sin control que vuelve inútil haber usado Keychain para el almacén principal.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 quitando el log del token, y agregá en su lugar un log que registre solo que "la sesión se guardó" (sin el valor), más una función `cerrarSesion(conductorID:)` que borre el token de Keychain con `SecItemDelete`.
#### Paso 7 · Cierre y evidencia
Entregá la función de guardado en Keychain del Paso 4, el token filtrado en logs detectado en el Paso 5, y la función de cierre de sesión del Paso 6; explicá por qué un almacén seguro (Keychain) no protege un secreto que se filtra por otra copia (logs, UI, pasteboard). Siguiente paso: estudia cómo sincronizar datos offline sin perder ni duplicar efectos. Errores comunes: guardar tokens en `UserDefaults`, registrar valores sensibles en logs "para depurar", y no borrar credenciales explícitamente al cerrar sesión. Fuente oficial: https://developer.apple.com/documentation/security/keychain-services.
**¿Por qué es importante?** Porque las filtraciones suelen surgir de copias secundarias (logs, backups, pasteboard) y no del almacén principal, aunque ese almacén esté bien elegido.
**Evidencia de aprendizaje:** entrega guardado en Keychain, filtración en logs detectada y función de cierre de sesión.
**Conceptos clave:** clasificación, minimización, Keychain, access class, Data Protection, Secure Enclave, backup, log redaction, screenshot, pasteboard, notification preview, privacy manifest, token y logout.

Clasifica antes de almacenar: público, interno, sensible y credencial. Define retención y borrado. Los tokens no pertenecen a `UserDefaults`; usa Keychain con una accesibilidad coherente con la función. `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` evita migración a otro dispositivo y acceso mientras está bloqueado, aunque puede ser demasiado restrictivo para tareas de fondo. La decisión es de producto y amenaza, no una receta universal.

```swift
func saveToken(_ data: Data, account: String) throws {
    let query: [CFString: Any] = [
        kSecClass: kSecClassGenericPassword,
        kSecAttrService: "com.example.tasks.session",
        kSecAttrAccount: account,
        kSecValueData: data,
        kSecAttrAccessible: kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    ]
    SecItemDelete(query as CFDictionary)
    guard SecItemAdd(query as CFDictionary, nil) == errSecSuccess else {
        throw SessionError.keychainWrite
    }
}
```

Keychain protege secretos pequeños; no es una base de datos. Para archivos y bases locales usa Data Protection apropiada y evita inventar criptografía. Secure Enclave puede proteger operaciones con claves, pero no vuelve seguro un flujo que filtra el resultado en logs o UI. Redacta identificadores, nunca registres tokens y usa `Logger` con privacidad explícita.

Revisa copias involuntarias: backups, cachés, miniaturas, portapapeles, notificaciones, capturas y archivos compartidos. En logout elimina credenciales, memoria derivada y datos por cuenta, cancela tareas y revoca el token en servidor cuando corresponda. Documenta las APIs y SDK que recolectan datos, su finalidad y las declaraciones de privacidad requeridas; la privacidad efectiva debe coincidir con lo comunicado en App Store Connect.

**Analogía:** guardar una joya en una caja fuerte no ayuda si su fotografía, combinación y recibo quedan sobre la mesa.

**¿Por qué es importante?** porque las filtraciones suelen surgir de copias secundarias y telemetría, no del almacén principal.

**Casos de uso reales:** token en preferencias, base incluida en backup, email visible en log, código de acceso en notificación y datos de la cuenta anterior tras cambiar usuario.

**Diagrama:**

```text
dato -> clasificar -> ¿necesario? --no--> no guardar
                    --sí--> Keychain / archivo protegido / base
                              -> retención -> borrado verificable
                              -> logs y UI redactados
```

**Diagrama: Keychain vs la fuga por otra copia**

```mermaid
flowchart TD
    A["guardarToken(data, conductorID)"] --> B["SecItemAdd con\nkSecAttrAccessibleWhenUnlockedThisDeviceOnly"]
    B --> C["Token seguro en Keychain"]
    C -.->|"Logger().info(token)"| D["Fuga en logs del sistema\n(copia sin control)"]
    style D fill:#ffcccc
```

En el proyecto integrador RutaFlow, `guardarToken` vive en `examples/ios-lab/Sources/RutaFlowLab/SesionVault.swift`. Límite de la decisión: Keychain no conviene para datos grandes o que necesitan consultas (una lista completa de envíos, por ejemplo) — está pensado para secretos pequeños como tokens; para esos datos usá SwiftData (Módulo 6) con la protección de archivo apropiada, no Keychain como base de datos general.

### Tema 3: Offline-first es un protocolo, no una caché

#### Paso 1 · Objetivo y preparación
Al finalizar vas a construir una outbox persistente para `confirmarEntrega` (Módulo 5), de forma que un conductor sin señal pueda confirmar una entrega y que se sincronice sola cuando vuelva la red, sin duplicarse. Prerrequisitos: Módulo 5 completo.
#### Paso 2 · Contexto y caso real
Si `confirmarEntrega` falla porque el conductor está sin señal en un sótano, simplemente reintentar la misma llamada cuando vuelva la red puede duplicar el efecto si el servidor sí la había recibido pero la respuesta se perdió en el camino.
#### Paso 3 · Teoría, modelo mental y analogía
Offline-first exige una fuente local observable y una outbox persistente donde cada operación tiene una identidad estable (clave de idempotencia) — una oficina postal con comprobantes numerados: puede reenviar el mismo sobre, pero el receptor sabe que no debe cobrar dos veces.
#### Paso 4 · Demostración guiada
```swift
struct ConfirmacionPendiente: Codable, Identifiable {
    enum Estado: String, Codable { case encolada, enviando, fallida }
    let id: UUID              // también es la clave de idempotencia
    let envioID: String
    let pin: String
    var estado: Estado
    var intentos: Int
}

actor MotorSincronizacion {
    func vaciar() async {
        for confirmacion in await almacen.pendientes() {
            guard !Task.isCancelled else { return }
            await enviarYReconciliar(confirmacion)
        }
    }
}
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: confirmar una entrega sin red encola una `ConfirmacionPendiente` con un `id` fijo; cuando vuelve la conectividad, `MotorSincronizacion.vaciar()` envía esa misma confirmación identificada por ese `id` — si el servidor ya la había procesado antes de que se perdiera la respuesta, reconoce el mismo `id` y no la aplica dos veces.
#### Paso 5 · Práctica guiada
Pista: en `enviarYReconciliar`, generá un `UUID()` nuevo cada vez que se reintenta la misma `ConfirmacionPendiente`, en vez de reusar su `id` original — ese es el fallo deliberado: ahora cada reintento llega al servidor como una confirmación distinta, y una entrega que en realidad se confirmó una sola vez queda registrada como confirmada dos o tres veces.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 reusando siempre el `id` original de la `ConfirmacionPendiente` en cada reintento, y agregá backoff con jitter entre reintentos fallidos, en vez de reintentar inmediatamente en loop.
#### Paso 7 · Cierre y evidencia
Entregá la outbox del Paso 4, la duplicación provocada en el Paso 5, y el backoff del Paso 6; explicá por qué reintentar una operación de red no es seguro por sí solo sin una clave de idempotencia estable. Siguiente paso: estudia cómo medir y operar esta app en producción. Errores comunes: generar una nueva identidad en cada reintento, reintentar errores de validación o autorización (que nunca van a tener éxito), y no tener backoff entre reintentos. Fuente oficial: https://developer.apple.com/documentation/foundation/url_loading_system.
**¿Por qué es importante?** Porque la conectividad móvil parcial convierte operaciones aparentemente simples en efectos duplicados, perdidos o fuera de orden si no se diseñan con idempotencia explícita.
**Evidencia de aprendizaje:** entrega outbox con idempotencia, duplicación provocada y backoff agregado.
**Conceptos clave:** source of truth, outbox, state machine, idempotency key, retry, exponential backoff, jitter, reachability, optimistic UI, version, conflict, tombstone, background task y cancellation.

Leer una caché sin red es útil, pero offline-first exige definir qué ocurre con escrituras. Mantén una fuente local observable y una outbox persistente. Cada operación tiene identidad estable, payload, estado, intentos y próxima fecha. La interfaz confirma que el cambio está pendiente; un worker lo envía y reconcilia la respuesta.

```swift
struct PendingMutation: Codable, Identifiable {
    enum State: String, Codable { case queued, sending, failed }
    let id: UUID                 // también es clave de idempotencia
    let taskID: UUID
    let baseVersion: Int
    let operation: Operation
    var state: State
    var attempts: Int
    var nextAttemptAt: Date
}

actor SyncEngine {
    func drain() async {
        for mutation in await store.readyMutations() {
            guard !Task.isCancelled else { return }
            await sendAndReconcile(mutation)
        }
    }
}
```

Reintentar no garantiza seguridad: si el servidor aplicó el cambio pero la respuesta se perdió, un POST nuevo puede duplicarlo. Envía la misma clave de idempotencia y exige que el servidor recuerde el resultado. Usa backoff con jitter para fallos transitorios, respeta `Retry-After` y no reintentes validación o autorización. `NWPathMonitor` ayuda a decidir cuándo probar, pero “hay red” no significa “el servicio funciona”.

Los conflictos son requisito de dominio. Con versiones, el servidor puede rechazar una escritura sobre estado viejo. Elige política por campo: server-wins para autoridad, client-wins solo si es aceptable, merge para datos compatibles o resolución humana cuando perder una intención sería grave. Las eliminaciones necesitan tombstones para no resucitar registros. `BGTaskScheduler` ofrece oportunidades limitadas, no ejecución garantizada; el flujo debe progresar también al abrir la app.

**Analogía:** la outbox es una oficina postal con comprobantes numerados. Puede reenviar el mismo sobre, pero el receptor sabe que no debe cobrar dos veces.

**¿Por qué es importante?** porque conectividad móvil parcial convierte operaciones aparentemente simples en efectos duplicados, perdidos o fuera de orden.

**Casos de uso reales:** marcar tarea en metro, editar desde dos dispositivos, respuesta perdida después de crear, logout con cola pendiente y migración mientras existe trabajo offline.

**Diagrama:**

```text
UI -> base local -> outbox(queued) -> API + idempotency-key
 ^                                      |
 |            reconciliar/version <-----+
 +-- estado pendiente/error/conflicto
```

**Diagrama: outbox con idempotencia estable**

```mermaid
sequenceDiagram
    participant UI as Confirmar entrega
    participant Outbox as ConfirmacionPendiente (id fijo)
    participant API as Servidor
    UI->>Outbox: encolar (id = UUID estable)
    Outbox->>API: enviar con ese id
    API--xOutbox: red perdida, sin respuesta
    Outbox->>API: reintentar CON EL MISMO id
    API-->>Outbox: reconoce el id, no duplica el efecto
```

En el proyecto integrador RutaFlow, La implementación de laboratorio EN MEMORIA de `ConfirmacionPendiente` y `MotorSincronizacion` vive en `examples/ios-lab/Sources/RutaFlowLab/MotorSincronizacion.swift`.

### Tema 4: Operar significa detectar, limitar y aprender del fallo

#### Paso 1 · Objetivo y preparación
Al finalizar vas a instrumentar `MotorSincronizacion.vaciar()` (Tema 3) con un signpost, y a definir un indicador concreto ("tasa de éxito de sincronización") para decidir si una versión de RutaFlow está sana en producción. Prerrequisitos: Tema 3 de este módulo.
#### Paso 2 · Contexto y caso real
"No se traba en mi teléfono" no es evidencia de que la sincronización funcione para los conductores reales — necesitás una medición agregada, no una impresión personal.
#### Paso 3 · Teoría, modelo mental y analogía
MetricKit entrega diagnósticos agregados e Instruments permite investigar con signposts que delimitan operaciones del dominio sin llenar los logs de datos personales — un centro de control donde las métricas convierten señales en decisiones.
#### Paso 4 · Demostración guiada
```swift
import OSLog

let puntos = OSSignposter(subsystem: "com.rutaflow.conductor", category: "sync")

func sincronizacionMedida() async throws {
    let estado = puntos.beginInterval("outbox-drain")
    defer { puntos.endInterval("outbox-drain", estado) }
    try await motorSincronizacion.vaciar()
}
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: grabando una sesión de Instruments con la plantilla "os_signpost" mientras corrés `sincronizacionMedida()`, ves el intervalo "outbox-drain" con su duración real — una medición concreta, no una sensación de "tardó un poco".
#### Paso 5 · Práctica guiada
Pista: definí el indicador "tasa de éxito de sincronización" pero no estableciste ningún umbral que dispare una alerta ("lo vamos a mirar cuando se vea raro") — ese es el fallo deliberado: sin un umbral explícito, nadie sabe cuándo esa métrica indica un problema real versus variación normal, y una regresión real puede pasar inadvertida durante días.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 definiendo un umbral concreto (por ejemplo, si la tasa de éxito cae por debajo del 95% durante más de una hora, es una alerta), y escribí qué acción concreta se toma si se dispara: revertir la versión, activar un feature flag, o investigar con Instruments.
#### Paso 7 · Cierre y evidencia
Entregá el signpost instrumentado del Paso 4, la métrica sin umbral detectada en el Paso 5, y el umbral con acción concreta del Paso 6; explicá por qué una métrica sin un umbral de acción asociado no sirve para operar, solo para "mirar". Siguiente paso: aplicá esta misma disciplina de medición al resto de RutaFlow antes de cada release. Errores comunes: alertas sin ninguna acción definida, confiar en "no crashea en mi teléfono" como evidencia, y no ensayar la migración de datos con una versión anterior antes de un release. Fuente oficial: https://developer.apple.com/documentation/metrickit.
**¿Por qué es importante?** Porque todo software real falla; la calidad profesional depende de detectar, limitar el radio de impacto y aprender del fallo con métricas y umbrales concretos, no con impresiones subjetivas.
**Evidencia de aprendizaje:** entrega signpost instrumentado, métrica sin umbral detectada y umbral con acción definida.
**Conceptos clave:** crash, hang, launch time, memory pressure, MetricKit, Instruments, os_signpost, structured logging, SLI, release train, TestFlight, phased release, migration, feature flag y rollback.

“No crashea en mi teléfono” no es evidencia. Define indicadores ligados a experiencia: sesiones sin crash, tasa de hangs, tiempo de arranque, éxito de sincronización y latencia percibida. MetricKit entrega diagnósticos agregados; Instruments permite investigar CPU, memoria, energía, red y bloqueos; signposts delimitan operaciones del dominio sin llenar logs de datos personales.

```swift
import OSLog

let points = OSSignposter(subsystem: "com.example.tasks", category: "sync")

func measuredSync() async throws {
    let state = points.beginInterval("outbox-drain")
    defer { points.endInterval("outbox-drain", state) }
    try await syncEngine.sync()
}
```

Evita trabajo pesado en `MainActor`; mide antes de optimizar y prueba con dispositivos/perfiles realistas. Un hang puede ser peor que un crash porque el usuario no recibe salida clara. Trata memoria y energía como presupuestos: imágenes dimensionadas, paginación, cancelación de tareas y trabajo de fondo limitado.

Cada release necesita migración ensayada con datos de versiones anteriores, compatibilidad de API y plan de contención. TestFlight valida con grupos pequeños; un despliegue gradual reduce exposición, pero no reemplaza observabilidad. Feature flags deben tener propietario y fecha de retiro. Si la base migra de forma irreversible, “volver al binario anterior” puede no funcionar: diseña migraciones expand/contract o restauración explícita.

**Analogía:** operar una app es pilotar con instrumentos. La vista por la ventana ayuda, pero las alarmas, métricas y listas de comprobación permiten reaccionar antes del accidente.

**¿Por qué es importante?** porque todo software real falla; la calidad profesional depende del radio de impacto, detección y recuperación.

**Casos de uso reales:** hang en arranque, fuga de imágenes, migración que falla con datos antiguos, API incompatible y release que aumenta errores de sincronización.

**Diagrama:**

```text
TestFlight -> cohorte pequeña -> métricas sanas? -> despliegue gradual
                                      no -> contener/flag/corregir
producción -> MetricKit/signposts -> reproducir en Instruments -> aprendizaje
```

**Diagrama: ciclo de medición con umbral y acción**

```mermaid
flowchart TD
    A["sincronizacionMedida()\ncon OSSignposter"] --> B["Instruments: intervalo outbox-drain"]
    B --> C["Tasa de éxito de sincronización"]
    C --> D{"¿< 95% por más de 1h?"}
    D -->|Sí| E["Alerta: revertir / feature flag / investigar"]
    D -->|No| F["Sano, seguir desplegando"]
```

En el proyecto integrador RutaFlow, `sincronizacionMedida` vive en `examples/ios-lab/Sources/RutaFlowLab/MotorSincronizacion.swift`.

### Tema 5: Keychain — guardar secretos de forma segura

#### Paso 1 · Objetivo y preparación
Al finalizar podrás guardar y leer un token de sesión en el **Keychain** de iOS, y explicar por qué nunca se guarda un secreto en `UserDefaults`. Prerrequisitos: Temas 1-2 de este módulo (seguridad y copias de datos).

#### Paso 2 · Contexto y caso real
Tras el login, la app de RutaFlow recibe un token JWT (Módulo 5). Si lo guardas en `UserDefaults`, queda en texto plano en un `.plist` legible, accesible en un backup o en un dispositivo con jailbreak. El Keychain lo guarda cifrado por el sistema, protegido por el hardware de seguridad del dispositivo.

#### Paso 3 · Teoría, modelo mental y analogía
`UserDefaults` es para preferencias no sensibles (tema claro/oscuro, última pestaña). El **Keychain** es el almacén cifrado del sistema para secretos (tokens, contraseñas, claves), con control de acceso por biometría y atributos de accesibilidad (`kSecAttrAccessibleWhenUnlocked`).

**Analogía:** `UserDefaults` es la libreta de notas en tu escritorio (cualquiera que entre la lee); el Keychain es la caja fuerte empotrada del edificio, cifrada y con control de quién la abre y cuándo.

#### Paso 4 · Demostración guiada desde cero

Crea `Sources/RutaFlowApp/Llavero.swift`:

```swift
import Foundation
import Security

enum Llavero {
    static func guardar(_ token: String, cuenta: String) {
        let dato = Data(token.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: cuenta,
            kSecValueData as String: dato,
            kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlocked,
        ]
        SecItemDelete(query as CFDictionary)        // borra el anterior si existe
        SecItemAdd(query as CFDictionary, nil)       // guarda cifrado por el sistema
    }

    static func leer(cuenta: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: cuenta,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var resultado: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &resultado) == errSecSuccess,
              let dato = resultado as? Data else { return nil }
        return String(decoding: dato, as: UTF8.self)
    }
}
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode, pega el código y úsalo desde una vista con un botón que llame a `Llavero.guardar(...)` y `Llavero.leer(...)`):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```

**Resultado esperado:** `Llavero.guardar("jwt-abc", cuenta: "sesion")` seguido de `Llavero.leer(cuenta: "sesion")` devuelve `"jwt-abc"`, y el valor NO aparece en ningún `.plist` legible. **Fallo deliberado:** guarda el token en `UserDefaults.standard.set(token, forKey: "token")` y localiza el archivo de preferencias en el contenedor de la app del simulador: el token está en texto plano. Diagnostica por qué eso es una fuga de credenciales esperando a ocurrir.

#### Paso 5 · Práctica guiada
Añade un método `borrar(cuenta:)` que elimine el token al cerrar sesión. Pista: usa `SecItemDelete` con la misma query de clase y cuenta.

#### Paso 6 · Práctica independiente
Protege la lectura del token con `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` y explica la diferencia frente a `WhenUnlocked` respecto a backups y migración a otro dispositivo.

#### Paso 7 · Cierre y evidencia
Entrega guardar/leer/borrar en Keychain y el contraste con `UserDefaults`. **¿Por qué es importante?** Toda app con login maneja un token, y dónde lo guardas es una decisión de seguridad real: el Keychain es el único lugar correcto en iOS. Equivocarse aquí es una de las fallas de seguridad móvil más comunes. Fuentes: [Apple — Keychain Services](https://developer.apple.com/documentation/security/keychain_services).
**Conceptos clave:** Keychain vs UserDefaults, `SecItemAdd`/`SecItemCopyMatching`, atributos de accesibilidad, cifrado del sistema.
**Cuándo no usarlo:** no uses Keychain para datos no sensibles o grandes (preferencias de UI, cachés): es más lento y limitado; resérvalo para secretos.

**Transferencia al proyecto integrador «RutaFlow»:** guarda el JWT de sesión en el Keychain tras el login y bórralo al cerrar sesión; confirma que no queda rastro en UserDefaults.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** llamar a `SecItemAdd` directamente para "actualizar" un token sin borrar antes el item existente con `SecItemDelete` para la misma cuenta — si ya hay un item guardado con ese `kSecAttrAccount`, `SecItemAdd` devuelve `errSecDuplicateItem` y el token viejo se queda guardado en el Keychain en vez de reemplazarse.
**Fuente oficial:** [documentación de iOS](https://developer.apple.com/documentation/).
**Evidencia de aprendizaje:** entrega el token guardado y leído del Paso 4, el fallo de texto plano en `UserDefaults` diagnosticado en ese mismo paso, y la lectura en `nil` tras `borrar(cuenta:)` del Paso 5.
### Tema 6: Permisos y privacidad — pedir acceso con criterio

#### Paso 1 · Objetivo y preparación
Al finalizar podrás solicitar un permiso del sistema (ubicación) declarándolo en `Info.plist` y pidiéndolo en el momento correcto, y manejar el caso en que el usuario lo deniega. Prerrequisitos: Temas 1-2 de este módulo.

#### Paso 2 · Contexto y caso real
RutaFlow necesita la ubicación del repartidor. iOS exige declarar POR QUÉ la quieres (en `Info.plist`) y mostrar un diálogo de permiso; si pides sin declarar el motivo, la app crashea; si pides al arrancar sin contexto, el usuario deniega. Pedir bien es una habilidad de producto y de App Store (un motivo pobre puede hacer que rechacen la app).

#### Paso 3 · Teoría, modelo mental y analogía
Cada dato sensible (ubicación, cámara, contactos, notificaciones) requiere: (1) una clave de uso en `Info.plist` con una explicación en lenguaje humano, y (2) una solicitud en runtime en el momento con contexto. El usuario puede conceder, denegar o conceder "solo esta vez".

**Analogía:** pedir un permiso es como pedir una llave: si no explicas para qué (Info.plist) el portero (iOS) no te deja ni preguntar; y si pides todas las llaves nada más entrar, desconfían y dicen que no. Pides la llave concreta cuando vas a usar esa puerta.

#### Paso 4 · Demostración guiada desde cero

Primero declara el motivo en `Info.plist` (clave `NSLocationWhenInUseUsageDescription`): `"RutaFlow usa tu ubicación para asignarte las entregas más cercanas."` Luego crea `Sources/RutaFlowApp/GestorUbicacion.swift`:

```swift
import CoreLocation

@Observable
class GestorUbicacion: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    var estado: CLAuthorizationStatus = .notDetermined

    override init() {
        super.init()
        manager.delegate = self
    }

    func pedirPermiso() {
        manager.requestWhenInUseAuthorization()   // muestra el diálogo del sistema
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        estado = manager.authorizationStatus
    }
}
```

**Ejecuta el ejemplo** (crea el proyecto, añade la clave a Info.plist, pega el código y llama a `pedirPermiso()` desde un botón):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```

**Resultado esperado:** al pulsar el botón aparece el diálogo del sistema con tu texto de motivo; conceder cambia `estado` a `.authorizedWhenInUse`, denegar lo deja en `.denied`. **Fallo deliberado:** quita la clave `NSLocationWhenInUseUsageDescription` del `Info.plist` y pide el permiso: la app **crashea** inmediatamente con un mensaje sobre la descripción de uso faltante. Diagnostica por qué iOS obliga a declarar el motivo antes de permitir siquiera preguntar.

#### Paso 5 · Práctica guiada
Maneja el estado `.denied` mostrando un mensaje que explique cómo habilitar el permiso desde Ajustes (no puedes volver a mostrar el diálogo una vez denegado). Pista: reacciona al `estado` en la vista.

#### Paso 6 · Práctica independiente
Añade el permiso de notificaciones (`UNUserNotificationCenter.requestAuthorization`) con su propia lógica de estado, y explica por qué conviene pedirlo tras una acción que lo justifique, no al arrancar.

#### Paso 7 · Cierre y evidencia
Entrega la solicitud de ubicación, el manejo de denegación y el crash por motivo faltante. **¿Por qué es importante?** Los permisos son la frontera de privacidad del usuario y un punto de revisión de la App Store. Pedirlos bien (con motivo claro, en el momento adecuado, manejando la negativa) es diferencia directa entre una app que se aprueba y una que se rechaza o se desinstala. Fuentes: [Apple — Requesting authorization](https://developer.apple.com/documentation/corelocation/requesting-authorization-to-use-location-services).
**Conceptos clave:** clave de uso en Info.plist, solicitud en runtime, estados de autorización, denegación irreversible.
**Cuándo no usarlo:** no pidas un permiso que no vas a usar de inmediato ni "por si acaso": cada permiso extra reduce la confianza y puede costar la aprobación en la App Store.

**Transferencia al proyecto integrador «RutaFlow»:** pide la ubicación del repartidor en el momento en que acepta su primera entrega, con un motivo claro, y maneja el caso de denegación sin romper el flujo.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** pedir `requestWhenInUseAuthorization()` antes de declarar la clave `NSLocationWhenInUseUsageDescription` en `Info.plist` — la app no muestra un diálogo vacío, crashea de inmediato, y el mensaje de la consola rara vez deja claro a primera vista que el problema es una clave faltante en `Info.plist`, no un bug en el código Swift.
**Fuente oficial:** [documentación de iOS](https://developer.apple.com/documentation/).
**Evidencia de aprendizaje:** entrega el diálogo de permiso concedido del Paso 4, el fallo por clave faltante en `Info.plist` diagnosticado en ese mismo paso, y el manejo del estado `.denied` del Paso 5.
### Tema 7: Notificaciones push con APNs

#### Paso 1 · Objetivo y preparación
Al finalizar podrás registrar la app para recibir notificaciones push vía APNs (Apple Push Notification service), obtener el device token y entender el flujo completo hasta mostrar una notificación. Prerrequisitos: Tema 6 (permisos) de este módulo.

#### Paso 2 · Contexto y caso real
Cuando se asigna una entrega a un repartidor, su app debe avisarle aunque esté cerrada. Eso solo es posible con push: el backend de RutaFlow (Módulo Spring/Node) envía la notificación a APNs, y APNs la entrega al dispositivo correcto usando su device token.

#### Paso 3 · Teoría, modelo mental y analogía
El flujo: (1) la app pide permiso de notificaciones; (2) se registra con APNs y recibe un **device token** único; (3) la app envía ese token a tu backend; (4) cuando hay un evento, tu backend le pide a APNs que entregue una notificación a ese token. La app no "recibe" del backend directamente: APNs es el intermediario de confianza de Apple.

**Analogía:** el device token es como la dirección postal del dispositivo, y APNs es el servicio de correos oficial de Apple: tu backend no entrega la carta en mano, se la da a correos (APNs) con la dirección (token), y correos la entrega.

#### Paso 4 · Demostración guiada desde cero

Crea `Sources/RutaFlowApp/AppDelegate.swift`:

```swift
import SwiftUI
import UserNotifications

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ app: UIApplication,
                     didFinishLaunchingWithOptions opts: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound]) { concedido, _ in
            guard concedido else { return }
            DispatchQueue.main.async { app.registerForRemoteNotifications() }  // pide el device token
        }
        return true
    }

    func application(_ app: UIApplication,
                     didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02x", $0) }.joined()
        print("Device token APNs:", token)   // se enviaría al backend de RutaFlow
    }
}

@main
struct RutaFlowApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    var body: some Scene { WindowGroup { ContentView() } }
}
```

**Ejecuta el ejemplo** (requiere capability "Push Notifications" en el target; en Simulador se puede probar con un archivo `.apns`):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```

**Resultado esperado:** al conceder el permiso, la consola imprime el device token (una cadena hex larga). En el Simulador, arrastrar un archivo `.apns` con el payload sobre la ventana muestra la notificación. **Fallo deliberado:** omite `registerForRemoteNotifications()`: nunca llega el device token, y aunque el permiso esté concedido, el backend no tiene a dónde enviar. Diagnostica por qué el permiso y el registro son dos pasos distintos y ambos necesarios.

#### Paso 5 · Práctica guiada
Maneja `didFailToRegisterForRemoteNotificationsWithError` para registrar (log) el caso en que el registro falla (por ejemplo, sin conexión o sin capability). Pista: es el callback hermano del de éxito.

#### Paso 6 · Práctica independiente
Diseña (en un diagrama o pseudo-código) el endpoint del backend que recibe y almacena el device token por usuario, y explica por qué el token puede cambiar y hay que actualizarlo.

#### Paso 7 · Cierre y evidencia
Entrega el registro con device token impreso, el manejo de fallo y el diseño del endpoint. **¿Por qué es importante?** Las notificaciones push son el canal para reenganchar al usuario y para eventos en tiempo real (entrega asignada, pedido en camino). Entender el flujo app→APNs→dispositivo y el rol del device token es imprescindible para cualquier app con backend. Fuentes: [Apple — Registering for remote notifications](https://developer.apple.com/documentation/usernotifications/registering-your-app-with-apns).
**Conceptos clave:** APNs como intermediario, device token, permiso vs registro, payload de notificación.
**Cuándo no usarlo:** para comunicación en tiempo real mientras la app está abierta y en primer plano, un canal WebSocket/Socket.IO es más directo; push es para alcanzar al usuario con la app cerrada o en segundo plano.

**Transferencia al proyecto integrador «RutaFlow»:** registra el device token del repartidor y envíalo al backend; define el evento "entrega asignada" que dispara una push desde el servidor.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** asumir que conceder el permiso de notificaciones ya registra el device token — son dos pasos independientes; sin llamar explícitamente a `registerForRemoteNotifications()` dentro del callback de `requestAuthorization`, el permiso queda concedido pero ningún token llega jamás al backend.
**Fuente oficial:** [documentación de iOS](https://developer.apple.com/documentation/).
## Revisión oficial de plataforma — julio de 2026

### Swift 6.2 y actualizaciones SwiftUI de 2026

**Swift 6.2** introduce concurrencia más gradual: aislamiento principal por defecto opcional, ejecución async más intuitiva y `@concurrent` para trabajo realmente concurrente. También mejora Swift Testing, memoria estricta y diagnóstico async. SwiftUI 2026 incorpora `ContentBuilder`, nuevas capacidades de reordenamiento/swipe, caché configurable de AsyncImage y cambios de estado al compilar con toolchains recientes. La versión del compilador y el deployment target son dimensiones distintas.

**Aplicación al proyecto:** activa comprobación de concurrencia en una rama, mueve decodificación CPU-bound a `@concurrent`, agrega una prueba de carrera y documenta disponibilidad/fallback antes de adoptar ContentBuilder o APIs SwiftUI nuevas.


## Laboratorio práctico

Convierte el proyecto del módulo 12 en una entrega preparada para producción.

1. Dibuja activos, entradas y fronteras; registra cinco amenazas con mitigación y prueba.
2. Audita `.entitlements`, permisos y enlaces. Añade pruebas para host, ruta, identificador y autorización.
3. Mueve la sesión a Keychain, redacta logs y documenta qué ocurre en logout, backup y pantalla bloqueada.
4. Implementa una outbox persistente. Simula respuesta perdida, reintento, conflicto de versión, cancelación y cambio de cuenta.
5. Instrumenta sincronización con signposts y perfílala en Instruments. Define cuatro indicadores y umbrales.
6. Prueba una migración con datos de una versión anterior y redacta un release plan con TestFlight, despliegue gradual y contención.

La entrega contiene código, pruebas, capturas del perfil, tabla de amenazas, política de datos y runbook. Una afirmación sin evidencia reproducible cuenta como hipótesis, no como resultado.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://developer.apple.com/documentation/swiftui), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 56 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Swift | `value types` · `optionals` · `protocols` · `generics` · `errors` · `collections` · `ARC` · `ownership` · `Swift packages` | app conductor |
| SwiftUI | `View` · `identity` · `state` · `Observation` · `environment` · `layout` · `navigation` · `animations` · `gestures` · `localization` | app conductor |
| Concurrencia | `async/await` · `Task` · `task groups` · `actors` · `MainActor` · `Sendable` · `cancelación` · `AsyncSequence` · `Swift 6 isolation` | app conductor |
| Datos | `URLSession` · `Codable` · `SwiftData y Core Data` · `cache` · `offline-first` · `migrations` · `CloudKit` · `Keychain` · `files` | app conductor |
| Plataforma | `Core Location` · `MapKit` · `background tasks` · `push` · `camera` · `biometrics` · `widgets` · `App Intents` · `UIKit interop` | app conductor |
| Producción | `Swift Testing` · `XCTest` · `UI tests` · `Instruments` · `VoiceOver` · `energy` · `privacy` · `signing` · `TestFlight` · `crashes` | app conductor |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en un proyecto propio de ampliación. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->

