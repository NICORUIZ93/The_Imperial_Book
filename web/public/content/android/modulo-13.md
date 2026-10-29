# Módulo 13: Android en producción — seguridad, sincronización y calidad

Una app móvil se ejecuta en un dispositivo que puede perderse, restaurarse, quedarse días sin red o recibir intents de otras aplicaciones. El APK puede inspeccionarse y la versión instalada puede permanecer meses. Este módulo endurece el proyecto final considerando esas condiciones en lugar de asumir un dispositivo confiable y siempre conectado.


## Aprende construyendo

### Tema 1: El sistema operativo conecta tu app con entradas externas

#### Paso 1 · Objetivo y preparación

Al finalizar podrás validar un deep link entrante (scheme, host, path, autorización) antes de actuar sobre él, y explicar por qué un intent recibido es entrada no confiable.

**Conocimiento previo:** Navegación y deep links (Módulo 3 de este track); `AndroidManifest.xml` (Módulo 0).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Los ataques móviles suelen entrar por intents, enlaces y configuración, sin romper cifrado ni sandbox; un componente exportado o un deep link sin validar son fronteras reales del sandbox de Android que un atacante puede usar directamente.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** sandbox, componente exportado, intent no confiable, validación de deep link, PendingIntent, Network Security Configuration.

Android asigna UID y sandbox por app, pero componentes declarados (`android:exported`) pueden abrir fronteras: exporta solo lo necesario, intencionalmente. Un intent recibido es entrada no confiable aunque el tipo Kotlin parezca correcto. Un deep link no concede autorización por sí solo: valida scheme, host, path y longitud, y solo después autentica y autoriza el recurso. `PendingIntent` delega identidad de tu app: hazlo inmutable y con intent explícito salvo necesidad real de lo contrario.

**Analogía:** el manifest es el plano de puertas de un edificio. El sandbox protege paredes, pero cada puerta exportada necesita propósito, cerradura y validación de quien entra.

**Diagrama:**

```
┌── otra app/web ──▶ intent/deep link ──▶ componente exportado ──┐
└──────────┬───────────────────────────────────────┘
           │
           ▼
     validar FORMA (scheme, host, path)
           │
           ▼
     autenticar/autorizar (¿esta sesión puede leer ESTE recurso?)
           │
           ▼
     confirmar efecto (nunca acción destructiva directa)
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/ValidacionDeepLink.kt` con la validación real de un deep link:

```bash
# compila con Gradle el archivo Kotlin generado a continuación
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/ValidacionDeepLink.kt <<'EOF'
package com.academia.android

import android.net.Uri

class SesionInvalidaException(mensaje: String) : Exception(mensaje)

fun parseTaskLink(uri: Uri, sesionPuedeLeer: (String) -> Boolean): String {
    require(uri.scheme == "https") { "scheme inválido: ${uri.scheme}" }
    require(uri.host == "tasks.example.com") { "host inválido: ${uri.host}" }
    require(uri.pathSegments.size == 2 && uri.pathSegments.first() == "tasks") { "path inválido" }
    val id = uri.pathSegments.last()
    if (!sesionPuedeLeer(id)) throw SesionInvalidaException("sesión no autorizada para leer $id")
    return id
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `parseTaskLink` valida primero la FORMA del URI (`scheme`, `host`, número y contenido de `pathSegments`) usando `require`, que lanza una excepción inmediatamente ante cualquier discrepancia; solo después de superar esa validación estructural consulta `sesionPuedeLeer(id)`, la autorización real — un deep link con forma perfecta pero apuntando a un recurso ajeno sigue siendo rechazado.

Ejecuta, con una implementación equivalente en Python (misma lógica, verificable sin depender del SDK de Android), varios URIs de prueba —válido, malicioso y con ID ajeno— confirmando el comportamiento real de cada validación:

```bash
python3 -c "
from urllib.parse import urlparse

class SesionInvalida(Exception): pass

def parse_task_link(uri_str, sesion_puede_leer):
    uri = urlparse(uri_str)
    if uri.scheme != 'https':
        raise ValueError(f'scheme inválido: {uri.scheme}')
    if uri.hostname != 'tasks.example.com':
        raise ValueError(f'host inválido: {uri.hostname}')
    partes = [p for p in uri.path.split('/') if p]
    if len(partes) != 2 or partes[0] != 'tasks':
        raise ValueError('path inválido')
    id_tarea = partes[1]
    if not sesion_puede_leer(id_tarea):
        raise SesionInvalida(f'sesión no autorizada para leer {id_tarea}')
    return id_tarea

tareas_del_usuario_actual = {'42'}
sesion_puede_leer = lambda id_tarea: id_tarea in tareas_del_usuario_actual

casos = [
    ('https://tasks.example.com/tasks/42', 'válido, tarea propia'),
    ('https://tasks.evil.com/tasks/42', 'host falso'),
    ('http://tasks.example.com/tasks/42', 'scheme inseguro'),
    ('https://tasks.example.com/tasks/99', 'ID de tarea AJENA'),
]
for uri_str, descripcion in casos:
    try:
        id_tarea = parse_task_link(uri_str, sesion_puede_leer)
        print(f'{descripcion}: ACEPTADO, id={id_tarea}')
    except (ValueError, SesionInvalida) as e:
        print(f'{descripcion}: RECHAZADO ({e})')
"
```

**Resultado esperado:** solo el primer caso (`tasks/42`, con host y scheme correctos y perteneciente al usuario actual) es `ACEPTADO`; el host falso y el scheme inseguro son rechazados por la validación de FORMA; el ID de tarea ajena (`99`) supera la validación de forma pero es rechazado específicamente por `SesionInvalida`, confirmando que ambas capas de validación son necesarias e independientes.

**Fallo deliberado:** elimina la llamada a `sesion_puede_leer(id_tarea)` del script, dejando que cualquier ID con forma válida se acepte sin verificar autorización. Repite el caso de "ID de tarea AJENA" — ahora se acepta incorrectamente — diagnostica confirmando exactamente la vulnerabilidad que este Tema previene: un deep link con forma perfecta (`https://tasks.example.com/tasks/99`) no implica que el usuario actual tenga permiso de leer ese recurso específico; la validación de forma y la autorización son pasos distintos e igualmente obligatorios.

#### Paso 5 · Práctica guiada

Agrega un quinto caso de prueba con path traversal lógico (`https://tasks.example.com/tasks/../admin`) y confirma cuál validación específica lo rechaza. **Pista:** revisa cómo `urlparse` y el split de `path` normalizan (o no) segmentos como `..`.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué un `PendingIntent` mutable con un intent implícito es más riesgoso que uno inmutable con un intent explícito, relacionándolo con qué podría hacer una app maliciosa si lograra modificar ese `PendingIntent` antes de que se dispare.

#### Paso 7 · Cierre y evidencia

Ya validas la forma y la autorización de un deep link como dos pasos distintos y obligatorios, y explicas por qué un intent recibido nunca es entrada confiable. El siguiente tema aborda cómo proteger datos sensibles a través de todo su ciclo de vida, no solo en la base de datos. **Evidencia:** entrega el resultado de los 4 casos de prueba (aceptado, host falso, scheme inseguro, ID ajeno), y explica por qué el ID ajeno requiere una segunda capa de validación distinta a la de forma. Fuente oficial: [Android Developers — Deep links validation](https://developer.android.com/training/app-links/deep-linking).

**Errores comunes:** validar solo la forma de un deep link y asumir que eso implica autorización; exportar un componente "para que funcione" sin declarar intencionalmente por qué necesita estar expuesto.

**Cuándo no usarlo:** para un deep link que apunta únicamente a contenido público sin ningún dato específico de usuario (por ejemplo, la pantalla de "acerca de" de la app), la capa de autorización de sesión no aplica; la validación de forma sigue siendo necesaria en cualquier caso.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Abre una guía desde una notificación y desde un enlace verificado. Comprueba sesión y autorización antes de mostrar direcciones; una guía inexistente debe llevar a un estado recuperable, sin cerrar la aplicación.

### Tema 2: Proteger datos exige conocer copias y ciclo de vida

#### Paso 1 · Objetivo y preparación

Al finalizar podrás cifrar un dato sensible con una construcción autenticada (AEAD) real, y enumerar las copias adicionales (backup, logs, notificaciones) que ese cifrado por sí solo no protege.

**Conocimiento previo:** Room (Módulo 6 de este track); gestión de secretos (DevOps, Módulo 11).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El teléfono cambia de dueño, se respalda y muestra contenido fuera de la Activity. La privacidad debe sobrevivir al ciclo completo, no solo a Room.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** clasificación de datos, Android Keystore, cifrado autenticado (AEAD), copias adicionales del dato.

Clasifica datos antes de cifrar: público, interno, sensible y credencial; no guardar es la defensa más fuerte. Android Keystore mantiene material de clave no exportable; cifra con una construcción autenticada (AES-GCM correctamente configurado, nunca reutilizando nonce con la misma clave) y conserva versión/nonce junto al ciphertext. El almacenamiento privado limita otras apps, pero backups, logs, capturas de pantalla y notificaciones pueden crear copias adicionales del mismo dato que el cifrado de la base de datos no alcanza a proteger.

**Analogía:** cifrar el cajón principal no protege fotocopias que quedaron en backup, logs, notificación o portapapeles. El inventario de copias precede al algoritmo.

**Diagrama:**

```
┌── dato sensible ──▶ ¿necesario guardarlo? ──▶ storage privado ──▶ cifrado (Keystore) ┐
└──────────────────────────────────────────────────────────────┘
                         copias adicionales que el cifrado de Room NO alcanza:
                         backup | logs | crash reports | notificación | clipboard
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/CifradoSensible.kt` documentando la construcción real con Android Keystore, y verifica el mismo tipo de construcción autenticada con AES-GCM real en Python:

```bash
# Este script python3 confirma después que la clave usa AndroidKeyStore con GCM
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/CifradoSensible.kt <<'EOF'
package com.academia.android

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import javax.crypto.KeyGenerator

fun generarClaveEnKeystore() {
    val generador = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
    generador.init(
        KeyGenParameterSpec.Builder(
            "local_sensitive_v1",
            KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT,
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .build(),
    )
    generador.generateKey() // material de clave NO exportable, vive dentro del Keystore
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `KeyGenerator.getInstance(..., \"AndroidKeyStore\")` genera la clave DENTRO del Keystore del sistema, sin que el material de clave salga nunca en texto plano hacia el proceso de la app; `BLOCK_MODE_GCM` es un modo de cifrado autenticado (AEAD), que detecta manipulación del ciphertext, a diferencia de un modo sin autenticación.

Ejecuta, con la librería real de criptografía de Python (`cryptography`, el mismo tipo de construcción AES-GCM que Android Keystore aplicaría), un cifrado y descifrado real, y confirma que un ciphertext manipulado es detectado y rechazado:

```bash
python3 -c "
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

clave = AESGCM.generate_key(bit_length=256)  # equivalente a la clave generada en el Keystore
aesgcm = AESGCM(clave)
nonce = os.urandom(12)  # NUNCA reutilizar este nonce con la misma clave

dato_sensible = b'numero-de-tarjeta-de-prueba-4242'
ciphertext = aesgcm.encrypt(nonce, dato_sensible, None)
print('cifrado exitoso, longitud del ciphertext:', len(ciphertext))

descifrado = aesgcm.decrypt(nonce, ciphertext, None)
print('descifrado exitoso, coincide con el original:', descifrado == dato_sensible)

# manipulación deliberada del ciphertext (como un atacante alterando el archivo cifrado)
ciphertext_manipulado = bytearray(ciphertext)
ciphertext_manipulado[0] ^= 0xFF
try:
    aesgcm.decrypt(nonce, bytes(ciphertext_manipulado), None)
    print('INESPERADO: el ciphertext manipulado se descifró sin error')
except Exception as e:
    print('ciphertext manipulado RECHAZADO:', type(e).__name__)
"
```

**Resultado esperado:** el cifrado y descifrado normal tienen éxito, con el dato descifrado coincidiendo exactamente con el original; al manipular un solo byte del ciphertext, `decrypt` lanza una excepción de autenticación fallida (`InvalidTag` o similar), confirmando que GCM (cifrado autenticado) detecta manipulación, algo que un modo de cifrado sin autenticación no garantizaría.

**Fallo deliberado:** reutiliza el mismo `nonce` para cifrar un segundo mensaje distinto con la misma clave (`aesgcm.encrypt(nonce, b'otro-dato-distinto', None)`, usando el mismo `nonce` ya usado arriba). Aunque el cifrado "funciona" sin error, reutilizar un nonce con GCM y la misma clave compromete las garantías criptográficas del modo (permite ciertos ataques que recuperan información sobre los mensajes) — diagnostica revisando la documentación oficial de AES-GCM: el nonce debe ser único por cada cifrado con una clave dada, nunca reutilizado, exactamente la advertencia de la teoría de este Tema.

#### Paso 5 · Práctica guiada

Extiende el script de Python para cifrar y descifrar un segundo dato con un nonce distinto (`os.urandom(12)` nuevamente), confirmando que ambos ciphertexts son completamente distintos entre sí aunque provengan de la misma clave. **Pista:** compara los dos ciphertexts con `!=` para confirmar que no son iguales.

#### Paso 6 · Práctica independiente

Documenta en una tabla de dos columnas, para tres datos reales de tu propio proyecto (por ejemplo: token de sesión, nombre de usuario, preferencia de tema visual), su clasificación (público/interno/sensible/credencial) y qué copias adicionales (logs, backup, notificación) necesitarías auditar para cada uno.

#### Paso 7 · Cierre y evidencia

Ya cifras un dato sensible con una construcción autenticada real, confirmando que detecta manipulación, y enumeras las copias adicionales que ese cifrado por sí solo no protege. El siguiente tema aborda cómo sincronizar cambios offline sin perder ni duplicar mutaciones. **Evidencia:** entrega el resultado del cifrado/descifrado exitoso, el rechazo del ciphertext manipulado, y explica por qué reutilizar un nonce compromete las garantías de GCM aunque no genere ningún error visible. Fuente oficial: [Android Developers — Android Keystore system](https://developer.android.com/privacy-and-security/keystore).

**Errores comunes:** cifrar la base de datos pero seguir logueando el dato sensible en texto plano en Logcat o crash reports; reutilizar un nonce con la misma clave, comprometiendo las garantías de GCM sin ningún error visible.

**Cuándo no usarlo:** para un dato clasificado como público (por ejemplo, el nombre público de una tarea visible para cualquiera), cifrarlo con Keystore es una complejidad innecesaria; reserva el cifrado autenticado específicamente para datos sensibles o credenciales.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Clasifica tokens, coordenadas y fotografías según persistencia y respaldo. Cierra sesión y verifica qué datos se eliminan; restaura una copia de prueba y confirma que no habilita operaciones con credenciales antiguas.

### Tema 3: Offline-first necesita un protocolo de cambios

#### Paso 1 · Objetivo y preparación

Al finalizar podrás implementar un patrón outbox con operation ID idempotente sobre SQLite real, y resolver un conflicto de sincronización con una política explícita, no "last-write-wins" ciego.

**Conocimiento previo:** offline-first con Room (Módulo 6, Tema 3); WorkManager (Módulo 8).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** "Room + WorkManager" no define por sí solo qué ocurre si dos dispositivos editan lo mismo, un ACK se pierde, o el usuario cambia de cuenta; sin un protocolo explícito de cambios, esos escenarios producen datos corruptos o perdidos silenciosamente.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** outbox, operation ID, tombstone, conflicto, idempotencia.

La UI lee exclusivamente la fuente local (Módulo 6). Una escritura crítica offline se guarda en Room junto con una operación pendiente en la misma transacción, con UUID estable, versión base y estado. El servidor deduplica por operation ID y compara versión; `409 Conflict` activa una política explícita, no un last-write-wins ciego por reloj de dispositivo, que no es autoridad confiable. Las eliminaciones necesitan un tombstone hasta que todos los lados reconozcan, para que una copia antigua no "resucite" una fila ya borrada.

**Analogía:** cada dispositivo trabaja en una libreta. Un número de operación evita copiar dos veces; la versión indica sobre qué edición escribió; el conflicto requiere una regla editorial, no elegir la página con hora mayor a ciegas.

**Diagrama:**

```
┌── UI ──▶ Room (fuente local) + outbox op-42 (UNA transacción) ─┐
└──────────┬───────────────────────────────────────┘
           │ WorkManager drena al volver la red
           ▼
┌── API (idempotente por operation ID) ──────────────────────┐
│  accepted + version   O   409 conflict + version actual        │
└──────────┬───────────────────────────────────────┘
           ▼
     Room TX: aplicar y limpiar outbox   O   marcar conflicto visible a la UI
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/OutboxOffline.kt`, y valida el mismo protocolo con SQLite real en Python (el motor que Room envuelve, Módulo 6):

```bash
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/OutboxOffline.kt <<'EOF'
package com.academia.android

import java.util.UUID

data class PendingMutation(
    val operationId: String,
    val entityId: String,
    val baseVersion: Long,
    val kind: String,
    val payload: String,
)

class OutboxRepository {
    // en Room real: @Transaction — ambas escrituras en la MISMA transacción
    fun renameOffline(taskId: String, title: String, baseVersion: Long): PendingMutation {
        val mutacion = PendingMutation(
            operationId = UUID.randomUUID().toString(),
            entityId = taskId,
            baseVersion = baseVersion,
            kind = "rename",
            payload = title,
        )
        return mutacion
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `kind` aquí es el nombre de una propiedad Kotlin (el tipo de mutación, `"rename"`), no un comando; cada `PendingMutation` recibe un `operationId` único (`UUID.randomUUID()`), permitiendo al servidor deduplicar reintentos del mismo cambio; `baseVersion` registra sobre qué versión de la entidad se basó la edición, la información que el servidor necesita para detectar si otro cambio ya avanzó esa versión mientras el dispositivo estaba offline.

Implementa y ejecuta el protocolo completo contra SQLite real: una mutación offline guardada en la misma transacción que la actualización local, un servidor simulado que deduplica por `operationId` y detecta conflicto por versión, y una reconciliación real:

```bash
python3 -c "
import sqlite3, uuid

con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE tareas (id TEXT PRIMARY KEY, titulo TEXT, version INTEGER, sync_state TEXT)')
con.execute('CREATE TABLE outbox (operation_id TEXT PRIMARY KEY, entity_id TEXT, base_version INTEGER, payload TEXT)')
con.execute(\"INSERT INTO tareas VALUES ('t1', 'Comprar leche', 1, 'synced')\")

def rename_offline(con, entity_id, nuevo_titulo, base_version):
    op_id = str(uuid.uuid4())
    with con:  # UNA transacción real para ambas escrituras
        con.execute('UPDATE tareas SET titulo=?, sync_state=? WHERE id=?', (nuevo_titulo, 'pending', entity_id))
        con.execute('INSERT INTO outbox VALUES (?,?,?,?)', (op_id, entity_id, base_version, nuevo_titulo))
    return op_id

servidor_version_actual = {'t1': 1}
operaciones_ya_procesadas_por_servidor = set()

def drenar_outbox(con, servidor_version_actual, operaciones_procesadas):
    for op_id, entity_id, base_version, payload in con.execute('SELECT * FROM outbox').fetchall():
        if op_id in operaciones_procesadas:
            continue  # idempotencia: reintento del mismo operation ID, no duplicar efecto
        if base_version < servidor_version_actual[entity_id]:
            print(f'op {op_id[:8]}: CONFLICTO (base_version={base_version} < servidor={servidor_version_actual[entity_id]})')
            con.execute('UPDATE tareas SET sync_state=? WHERE id=?', ('conflict', entity_id))
        else:
            servidor_version_actual[entity_id] += 1
            operaciones_procesadas.add(op_id)
            con.execute('UPDATE tareas SET sync_state=?, version=? WHERE id=?', ('synced', servidor_version_actual[entity_id], entity_id))
            con.execute('DELETE FROM outbox WHERE operation_id=?', (op_id,))
            print(f'op {op_id[:8]}: ACEPTADA, nueva versión={servidor_version_actual[entity_id]}')

op1 = rename_offline(con, 't1', 'Comprar leche y pan', 1)
drenar_outbox(con, servidor_version_actual, operaciones_ya_procesadas_por_servidor)
print('estado final:', con.execute('SELECT * FROM tareas').fetchall())
print('outbox restante:', con.execute('SELECT * FROM outbox').fetchall())
"
```

**Resultado esperado:** la mutación se acepta (`base_version=1` coincide con la versión del servidor), la fila de `outbox` se elimina tras confirmarse, y la tabla `tareas` queda con `sync_state='synced'` y `version=2`, confirmando el ciclo completo: escritura local en transacción → drenado idempotente → limpieza de outbox solo tras confirmación real del servidor.

**Fallo deliberado:** ejecuta `drenar_outbox` una segunda vez sin ninguna mutación nueva en la tabla `outbox` (ya vacía tras el drenado anterior). No ocurre ningún efecto duplicado porque no hay filas que procesar — ahora simula el escenario real de un worker que muere DESPUÉS de que el servidor confirmó pero ANTES de limpiar el outbox local: ejecuta `rename_offline` de nuevo con el MISMO `op_id` manualmente reinsertado en `outbox`, y repite `drenar_outbox`. Como `op_id` ya está en `operaciones_ya_procesadas_por_servidor`, el `continue` evita reaplicar el efecto — diagnostica confirmando que la idempotencia por `operation_id` es exactamente lo que protege contra un reintento después de una confirmación ya procesada, previniendo que WorkManager (que garantiza "al menos una vez", no "exactamente una vez") duplique un efecto.

#### Paso 5 · Práctica guiada

Simula un conflicto real: antes de drenar el outbox, actualiza manualmente `servidor_version_actual['t1']` a `2` (simulando que otro dispositivo ya sincronizó un cambio), y ejecuta `drenar_outbox` con la mutación pendiente que todavía tiene `base_version=1`. Confirma que se reporta como `CONFLICTO` y que `sync_state` queda en `'conflict'`, visible para que la UI lo muestre en vez de ocultarlo silenciosamente. **Pista:** el conflicto no debe resolverse automáticamente con last-write-wins; documenta qué política aplicarías (merge por campo, mostrar ambas versiones al usuario).

#### Paso 6 · Práctica independiente

Documenta en una frase por qué una eliminación (`DELETE`) necesita un tombstone (marcar como eliminada, no borrar la fila inmediatamente) en vez de un borrado directo, relacionándolo con qué pasaría si otro dispositivo, todavía offline con una copia antigua, sincronizara después de que la fila ya fue borrada por completo.

#### Paso 7 · Cierre y evidencia

Ya implementas un protocolo de sincronización offline con outbox, operation ID idempotente y detección explícita de conflictos por versión, en vez de asumir que "Room + WorkManager" resuelve esto automáticamente. El siguiente tema aborda cómo operar la calidad de la app por dispositivo y versión en producción real. **Evidencia:** entrega el resultado del ciclo completo (mutación aceptada, outbox limpiado, versión incrementada), y el resultado del conflicto detectado cuando `base_version` queda desactualizada respecto al servidor. Fuente oficial: [Android Developers — Sync data with a server](https://developer.android.com/topic/architecture/data-layer#sync-data).

**Errores comunes:** asumir que WorkManager garantiza "exactamente una vez", sin operation ID ni idempotencia explícita, arriesgando efectos duplicados; aplicar last-write-wins universal sin considerar la semántica de cada campo (un contador necesita una operación conmutativa, no simplemente "el último valor gana").

**Cuándo no usarlo:** para datos que se recalculan trivialmente desde el servidor sin ningún riesgo de pérdida de intención del usuario (una lista de categorías estáticas descargada, no editada localmente), este protocolo de outbox con conflictos es una complejidad innecesaria; resérvalo para escrituras del usuario que deben preservarse fielmente.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Registra una entrega sin conexión y reconecta dos veces. La cola local debe mantener un identificador estable y el servidor aplicar una sola confirmación; conserva el historial de reintentos como evidencia.

### Tema 4: La calidad se opera por dispositivo y versión

#### Paso 1 · Objetivo y preparación

Al finalizar podrás identificar una operación bloqueante en el hilo principal que causaría ANR, y diseñar un rollout gradual con gates de calidad antes de producción completa.

**Conocimiento previo:** coroutines/dispatchers (Kotlin Multiplatform, Módulo 2); publicación en Play (Módulo 11 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El laboratorio no reproduce fabricantes, memoria, red ni versiones instaladas reales. La calidad real de una app en producción es una distribución por cohortes y release, no un resultado binario de "funciona" o "no funciona".

#### Paso 3 · Teoría con analogía

**Conceptos clave:** main thread, ANR, jank, staged rollout, kill switch.

La UI thread procesa input y frames; I/O, locks o cómputo pesado ahí causa jank y, si excede umbrales, ANR. `suspend` no garantiza background por sí solo: una función suspend puede bloquear si ejecuta I/O síncrono sin cambiar de dispatcher explícitamente. Publicar en producción usa un staged rollout (5% → 25% → 100%) con gates de crashes, ANR y startup; detener un rollout limita nuevos usuarios afectados, pero quienes ya actualizaron conservan la versión defectuosa, por lo que se necesita también un hotfix o un kill switch remoto para funciones reversibles.

**Analogía:** publicar móvil es enviar maquinaria a lugares donde no puedes retirarla de inmediato. Un rollout gradual reduce unidades afectadas, pero exige reparar las ya entregadas.

**Diagrama:**

```
┌── commit ──▶ tests/benchmark ──▶ internal ──▶ staged 5% ──▶ vitals por versión ┐
└──────────┬───────────────────────────────────────────────┘
           │
     ┌─────┴─────┐
     ▼             ▼
   sano         regresión
     │             │
  ampliar    detener + hotfix/kill switch
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/RepositorioMainSafe.kt`, comparando una versión bloqueante frente a una main-safe real:

```bash
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/RepositorioMainSafe.kt <<'EOF'
package com.academia.android

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

class FileRepository(
    private val io: CoroutineDispatcher = Dispatchers.IO
) {
    suspend fun load(archivo: File): String = withContext(io) {
        archivo.readText() // I/O síncrono, pero movido explícitamente FUERA del hilo principal
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `suspend fun load(...)` por sí solo NO garantiza que el trabajo ocurra fuera del hilo principal; `withContext(io)` con `io = Dispatchers.IO` es lo que efectivamente mueve la ejecución de `archivo.readText()` (una operación de I/O síncrona) a un hilo apropiado, evitando bloquear el hilo principal mientras se lee el archivo.

Mide, con tiempos reales de ejecución en Python (usando `threading` para simular el hilo principal y un hilo de I/O separado), la diferencia real entre bloquear el hilo principal y delegar el trabajo a un hilo apropiado:

```bash
python3 -c "
import threading
import time

def trabajo_de_io_lento():
    time.sleep(0.2)  # simula una lectura de archivo/red lenta
    return 'datos cargados'

resultados = {}

def bloquea_hilo_principal():
    inicio = time.time()
    resultados['dato'] = trabajo_de_io_lento()  # ejecutado DIRECTAMENTE en este hilo
    resultados['hilo_principal_bloqueado_por'] = time.time() - inicio

def main_safe_con_hilo_io():
    contenedor = {}
    def en_hilo_io():
        contenedor['dato'] = trabajo_de_io_lento()
    hilo_io = threading.Thread(target=en_hilo_io)
    inicio = time.time()
    hilo_io.start()
    # el 'hilo principal' queda libre para hacer otra cosa mientras tanto
    tiempo_libre_hilo_principal = time.time() - inicio
    hilo_io.join()
    return tiempo_libre_hilo_principal, contenedor['dato']

bloquea_hilo_principal()
print(f'BLOQUEANDO el hilo principal: bloqueado por {resultados[\"hilo_principal_bloqueado_por\"]:.3f}s')

tiempo_libre, dato = main_safe_con_hilo_io()
print(f'MAIN-SAFE (hilo de I/O separado): hilo principal libre en {tiempo_libre:.4f}s (dato: {dato})')
"
```

**Resultado esperado:** al bloquear el hilo principal directamente, este queda ocupado durante los ~200ms completos de la operación de I/O simulada (exactamente el tipo de bloqueo que causaría jank o ANR si excede el umbral del sistema); al delegar el trabajo a un hilo separado, el "hilo principal" queda libre casi instantáneamente, confirmando la diferencia real entre una implementación bloqueante y una main-safe.

**Fallo deliberado:** modifica `FileRepository` para que `load()` siga siendo `suspend` pero elimine el `withContext(io)`, ejecutando `archivo.readText()` directamente en el dispatcher del llamador (que podría ser el hilo principal si se invoca desde una corrutina lanzada en `Dispatchers.Main`). El código compila y "parece" asíncrono por ser `suspend`, pero si se invoca desde el hilo principal, la lectura de archivo bloquea ese mismo hilo — diagnostica confirmando la advertencia central de este Tema: `suspend` no es sinónimo de "no bloqueante"; sin un `withContext` explícito hacia un dispatcher apropiado, una función suspend puede bloquear el hilo principal exactamente igual que una función síncrona ordinaria.

#### Paso 5 · Práctica guiada

Extiende la simulación de threading para medir cuántas operaciones de I/O de 200ms podrían completarse en 1 segundo si todas bloquearan el hilo principal secuencialmente, frente a ejecutarlas en paralelo en hilos separados. **Pista:** usa una lista de hilos y `threading.Thread` para lanzar varias operaciones simultáneamente, midiendo el tiempo total con `time.time()` antes y después de `join()` en todos.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué "detener el rollout" no es equivalente a un rollback real, relacionándolo con qué pasa específicamente con los usuarios que ya recibieron la versión defectuosa en el porcentaje ya distribuido antes de detenerlo.

#### Paso 7 · Cierre y evidencia

Ya identificas una operación bloqueante en el hilo principal y la corriges con un dispatcher apropiado, y diseñas un rollout gradual con gates de calidad reales. Esto cierra el recorrido de seguridad, sincronización y calidad de este módulo; el siguiente módulo del track aplica estos mismos criterios de producción al proyecto final de cierre del track. **Evidencia:** entrega el resultado de la medición mostrando el hilo principal bloqueado ~200ms frente a la versión main-safe con el hilo libre casi instantáneamente, y explica por qué `suspend` sin `withContext` explícito no garantiza esa diferencia. Fuente oficial: [Android Developers — App not responding (ANR)](https://developer.android.com/topic/performance/vitals/anr).

**Errores comunes:** asumir que marcar una función como `suspend` es suficiente para garantizar que no bloquea el hilo principal, sin verificar el dispatcher efectivo usado; tratar "detener el rollout" como si fuera un rollback real para los usuarios ya afectados.

**Cuándo no usarlo:** para una operación genuinamente instantánea sin ningún I/O ni cómputo pesado (una simple asignación de variable), envolverla en `withContext(Dispatchers.IO)` es una sobrecarga innecesaria; resérvalo específicamente para I/O real o cómputo costoso que pueda exceder los umbrales de fluidez del hilo principal.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Audita el repositorio de sincronización de entregas en busca de I/O ejecutado sin `withContext` explícito, y diseña el rollout escalonado (5→25→100%) para la próxima versión de la app del conductor, con un kill switch remoto para la función de escaneo si el ANR rate sube en producción.

---

## Revisión oficial de plataforma — julio de 2026

### Android 17: privacidad, compatibilidad y dispositivos grandes

**Android 17** alcanzó estabilidad de plataforma con API 37. Entre los cambios relevantes están **Encrypted Client Hello**, el **Contact Picker** que evita solicitar toda la agenda, límites por aplicación en Keystore, restricciones de URI grants, Certificate Transparency para targets nuevos y reglas de orientación/redimensionado en pantallas grandes. La disponibilidad de una API nueva no elimina la necesidad de fallback por `SDK_INT` ni de probar cambios que afectan a todas las apps.

**Aplicación al proyecto:** reemplaza `READ_CONTACTS` por Contact Picker cuando esté disponible, prueba ECH/fallback en la capa de red, limita el ciclo de claves y ejecuta la suite en teléfono, tablet y proceso actualizado desde una versión anterior.


## Laboratorio práctico

### Proyecto: app resistente a dispositivo, red y release

Trabaja sobre el proyecto 12 con backend de prueba que soporte operation ID y versiones.

1. Dibuja activos, componentes, intents, red, storage, backup y terceros. Prioriza amenazas por impacto/probabilidad.
2. Audita manifest: exported, permissions, providers, backup, cleartext y debuggable. Prueba acceso desde una app/adb no autorizados.
3. Crea deep links válidos/maliciosos: host falso, path traversal lógica, ID ajeno y acción destructiva. Corrige validación/autorización.
4. Mueve una clave local a Keystore y cifra dato de prueba con AEAD. Prueba key invalidada, restore y logout.
5. Revisa logs, analytics, crash, notificaciones, clipboard y screenshots; elimina PII/tokens y documenta retención.
6. Implementa outbox Room en la misma transacción de entidad, WorkManager unique y operation ID estable.
7. Simula ACK perdido, worker muerto, 500, 400, cambio de cuenta y cola duplicada.
8. Ejecuta dos perfiles/dispositivos offline que editan/eliminan lo mismo. Demuestra política de conflicto y tombstone.
9. Introduce I/O y lock en main para provocar jank/ANR controlado. Usa StrictMode y traces para localizarlo y corrige main-safety.
10. Crea Macrobenchmark/startup profile, mide antes/después y prueba dispositivos/API distintos.
11. Diseña rollout 5→25→100 % con gates, alerta, kill switch, migraciones y hotfix de versionCode mayor.

**Verificación:** entrega threat model, comandos adb, test de deep link, ciphertext/Keystore sin revelar claves, prueba de backup/logout, historial de sync/conflictos, trace ANR, benchmark y dashboard simulado por versión. CI ejecuta lint, unit/UI, migraciones Room y pruebas de seguridad reproducibles.

**Errores comunes y soluciones**

- Ocultar API key con ofuscación: restríngela o mueve privilegio al servidor; el APK se inspecciona.
- Exportar para que “funcione”: reduce frontera y agrega intent explícito/permisos/validación.
- Trust manager que acepta todo: usa CA de debug acotada mediante Network Security Config.
- Cifrar DB pero loguear payload: inventaría todas las copias y minimiza.
- Last-write-wins universal: define conflicto por semántica, versiones y experiencia.
- Asumir WorkManager exactly-once: operation ID e idempotencia sobreviven a reejecución.
- Usar `suspend` como prueba de main-safety: mueve bloqueo con dispatcher y mide.
- Detener rollout como rollback: planifica hotfix para instalaciones ya afectadas.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://developer.android.com/develop), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 52 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Plataforma | `componentes` · `lifecycle` · `configuration changes` · `intents` · `deep links` · `permisos` · `storage` · `procesos y memoria` | app conductor |
| Compose | `estado y recomposición` · `layout` · `Material 3` · `navegación` · `listas` · `animación` · `adaptive UI` · `semantics` | app conductor |
| Arquitectura | `UDF` · `ViewModel` · `coroutines y Flow` · `repositorios` · `dominio` · `modularización` · `DI` · `errores` | app conductor |
| Datos | `Room` · `DataStore` · `networking` · `paging` · `cache` · `offline-first` · `sync` · `WorkManager` · `conflictos` | app conductor |
| Dispositivo | `location` · `geofencing` · `maps` · `camera` · `scanning` · `sensors` · `Bluetooth` · `notifications` · `foreground services` · `batería` | app conductor |
| Producción | `testing` · `Macrobenchmark` · `Baseline Profiles` · `ANR` · `memoria` · `accesibilidad` · `seguridad` · `Play Integrity` · `rollout` | app conductor |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en un proyecto propio de ampliación. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->


## Aplicación del material de referencia

### Tema 5: Del dispositivo al diagnóstico: SoC, memoria, límites térmicos y arranque verificado

#### Paso 1 · Objetivo y preparación
Al finalizar recogerás evidencias de memoria, estado térmico y arranque en un dispositivo de pruebas, distinguiendo mediciones disponibles de garantías de seguridad. **Prerrequisitos:** Android Studio, Platform Tools, una app de laboratorio instalada y autorización de depuración del dispositivo. Ejemplo independiente: usa la app Restauracion del módulo 4 o una copia propia; no necesitas modificar el kernel.

#### Paso 2 · Contexto y caso real
Una app de entregas puede funcionar en pruebas cortas y perder fluidez después de usar GPS y pantalla durante un periodo prolongado. **¿Por qué es importante?** El sistema físico participa: consumo de energía, memoria y límites térmicos condicionan el trabajo. Una captura que promociona un libro no demuestra la causa del problema de tu dispositivo.

#### Paso 3 · Teoría, modelo mental y analogía
Un SoC integra varias unidades de cómputo; CPU y GPU no son recursos ilimitados. La jerarquía de memoria y la presión del sistema cambian el rendimiento. La gestión térmica puede reducir trabajo o rendimiento para proteger el dispositivo. Verified Boot establece una cadena de confianza al arrancar; leer una propiedad con ADB no equivale a una atestación remota validada.

**Analogía:** una cocina comparte energía, espacio y ventilación. Añadir más encargos no aumenta la capacidad física. El límite es que ese modelo no identifica un cuello de botella: hay que medir y correlacionar, sin forzar temperaturas peligrosas ni desactivar protecciones.

#### Paso 4 · Demostración guiada desde cero
Crea una carpeta vacía para conservar evidencia y confirma el dispositivo autorizado:
```bash
mkdir diagnostico-android
cd diagnostico-android
adb devices
adb shell dumpsys -l
```
Con un único dispositivo de laboratorio seleccionado, ejecuta:
```bash
adb shell dumpsys meminfo com.example.restauracion > memoria.txt
adb shell dumpsys thermalservice > termico.txt
adb shell getprop ro.boot.verifiedbootstate > arranque.txt
```
Crea `README.md` con modelo, versión de Android, paquete de la app, estado de carga, condiciones de la prueba y los comandos. **Resultado esperado:** archivos con la información que el dispositivo exponga. Algunos emuladores o fabricantes no exponen todos los sensores o propiedades; un archivo vacío o permiso denegado se registra como ausencia de evidencia, no como «dispositivo seguro».

Explica cada bloque: ADB identifica el destino, dumpsys consulta servicios disponibles y las redirecciones conservan la salida en archivos del computador. `meminfo` del paquete observa memoria atribuida al proceso, no toda la jerarquía de cachés del SoC. `thermalservice` refleja lo que publica el servicio, no una temperatura universal comparable entre modelos.

#### Paso 5 · Práctica guiada
**Fallo deliberado:** sustituye el paquete por `com.example.noexiste`. Observa que no hay proceso correspondiente y compáralo con `adb shell pidof com.example.restauracion`. **Pista:** comprueba identidad y estado de ejecución antes de inferir que la app consume cero memoria. Corrige el paquete y abre la app.

#### Paso 6 · Práctica independiente
Toma dos muestras durante un flujo normal de prueba, sin calentamiento artificial ni estrés peligroso. Relaciona los tiempos y las acciones con lo observado; no concluyas causalidad solo porque dos valores cambiaron. Define qué información complementaria recogerías con profiler, trazas y pruebas en dispositivo físico.

#### Paso 7 · Cierre y evidencia
**Evidencia de aprendizaje:** tres archivos, condiciones, fallo de paquete y limitaciones de visibilidad. El siguiente paso es vincular la adaptación de carga a APIs de estado térmico y un presupuesto de rendimiento medido. **Errores comunes:** comparar emulador y teléfono como equivalentes, interpretar una propiedad vacía como garantía y desactivar medidas de protección. **Límites y decisión de uso:** no se ensaya root, desbloqueo de bootloader ni atestación; esas acciones no son necesarias para este diagnóstico.

**Fuentes oficiales:** [dumpsys](https://developer.android.com/tools/dumpsys), [mitigación térmica](https://source.android.com/docs/core/power/thermal-mitigation) y [Verified Boot](https://source.android.com/docs/security/features/verifiedboot).
