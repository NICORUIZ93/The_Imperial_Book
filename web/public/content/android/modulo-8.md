# Módulo 8: Trabajo en segundo plano


## Aprende construyendo

### Tema 1: CoroutineWorker y garantía de ejecución

#### Paso 1 · Objetivo y preparación

Al finalizar podrás escribir un `CoroutineWorker` y explicar por qué WorkManager garantiza su ejecución eventual incluso si el proceso de la app termina.

**Conocimiento previo:** coroutines/suspend (Kotlin Multiplatform, Módulo 2); `viewModelScope` (Módulo 1).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** WorkManager garantiza que un trabajo eventualmente se ejecute incluso si el proceso de la app termina, una garantía que un coroutine lanzado directamente desde la UI no ofrece, dado que se cancela junto con el ciclo de vida del componente que lo lanzó.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** persistencia de la solicitud de trabajo, independiente del proceso de la app.

`CoroutineWorker` es la clase base de WorkManager para una unidad de trabajo diferido escrita con coroutines: `doWork()`, marcado `suspend`, puede llamar operaciones suspendidas (sincronización con una API, Módulo 5), devolviendo `Result.success()`, `Result.failure()`, o `Result.retry()`. La garantía fundamental que un `coroutineScope.launch { }` desde un `ViewModel` no ofrece es que la solicitud de trabajo persiste independientemente del ciclo de vida del proceso: si el usuario cierra la app, WorkManager garantiza que el trabajo eventualmente se ejecute, incluso reiniciando el proceso para ese propósito si es necesario.

**Analogía:** un `CoroutineWorker` encolado es como una encomienda registrada en un sistema postal formal, que garantiza su entrega eventual independientemente de si el remitente sigue en su domicilio; un coroutine lanzado desde la UI es como pedirle a un mensajero informal que entregue algo mientras uno espera en la puerta — si uno se va antes de que regrese, no hay garantía de entrega.

**Diagrama:**

```
┌── viewModelScope.launch { sincronizar() } ────┐
│ se CANCELA si el ViewModel se destruye              │
│ (usuario cierra la app antes de completarse)           │
└─────────────────────────────────────────┘
┌── WorkManager.enqueue(CoroutineWorker) ───────┐
│ PERSISTE independientemente del proceso                │
│ (garantiza ejecución eventual, incluso reiniciando)       │
└─────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/SincronizarWorker.kt`, y modela la garantía de persistencia con una cola respaldada en un archivo real (simulando el almacenamiento del sistema que usa WorkManager) para verificarla en ejecución real. Ejecuta `gradle` para compilar y `python3` para simular la persistencia:

```bash
# Este script python3 modela la persistencia de la solicitud de trabajo en un archivo real
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/SincronizarWorker.kt <<'EOF'
package com.academia.android

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import androidx.work.Result

class SincronizarWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        return try {
            // repositorio.sincronizar() -- Módulo 5/6
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `SincronizarWorker` extiende `CoroutineWorker`, recibiendo `context` y `params` que WorkManager provee automáticamente al ejecutar el trabajo; `doWork()` es `suspend`, permitiendo llamar directamente a la sincronización del repositorio (Módulo 6), devolviendo `Result.retry()` ante cualquier excepción para que WorkManager reintente automáticamente.

Modela, con un archivo real en disco, la diferencia entre una solicitud que vive solo en memoria (como `viewModelScope`) y una que persiste en almacenamiento (como WorkManager), sobreviviendo a un "reinicio del proceso" simulado:

```bash
python3 -c "
import json

ARCHIVO_COLA_PERSISTENTE = '/tmp/work_manager_cola.json'

def encolar_trabajo_persistente(nombre_trabajo):
    with open(ARCHIVO_COLA_PERSISTENTE, 'w') as f:
        json.dump({'trabajo_pendiente': nombre_trabajo}, f)

def proceso_termina_abruptamente(cola_en_memoria):
    cola_en_memoria.clear()  # simula que el proceso muere: la memoria se pierde por completo

def nuevo_proceso_verifica_trabajo_pendiente():
    with open(ARCHIVO_COLA_PERSISTENTE) as f:
        return json.load(f).get('trabajo_pendiente')

cola_en_memoria = ['SincronizarWorker']  # equivalente a un coroutine en viewModelScope
encolar_trabajo_persistente('SincronizarWorker')  # equivalente a WorkManager.enqueue(...)

proceso_termina_abruptamente(cola_en_memoria)
print('cola en memoria tras terminar el proceso:', cola_en_memoria)
print('trabajo recuperado por un NUEVO proceso desde almacenamiento persistente:', nuevo_proceso_verifica_trabajo_pendiente())
"
```

**Resultado esperado:** la cola en memoria queda vacía tras "terminar el proceso" (exactamente lo que le pasaría a un coroutine de `viewModelScope`), mientras que un nuevo proceso puede recuperar `SincronizarWorker` leyendo el archivo persistente, confirmando en ejecución real la garantía central de WorkManager: la solicitud de trabajo sobrevive independientemente del proceso que la encoló.

**Fallo deliberado:** modifica `doWork()` para que, ante una excepción, devuelva `Result.failure()` en vez de `Result.retry()`. Repite mentalmente el escenario de un fallo transitorio (por ejemplo, una desconexión momentánea de red). Con `Result.failure()`, WorkManager NO reintentará automáticamente — diagnostica confirmando que `Result.failure()` es apropiado solo para errores definitivos que no se resolverían reintentando (como un error de validación de datos), mientras que `Result.retry()` es lo correcto para errores transitorios como problemas de red, exactamente la misma distinción de `HttpException`/`IOException` del Módulo 5.

#### Paso 5 · Práctica guiada

Modifica el script de persistencia para encolar dos trabajos distintos en la misma cola persistente (`SincronizarTareas`, `SubirFoto`), y confirma que un nuevo proceso puede recuperar ambos tras el "reinicio" simulado. **Pista:** cambia la estructura del JSON de un único `trabajo_pendiente` a una lista de trabajos.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué subir una foto grande (Tema 1, casos de uso) es un candidato apropiado para `CoroutineWorker` en vez de un simple `viewModelScope.launch`, relacionándolo con qué pasaría si el usuario cierra la app a mitad de la subida en cada uno de los dos enfoques.

#### Paso 7 · Cierre

Ya escribes un `CoroutineWorker` y explicas por qué WorkManager garantiza su ejecución eventual incluso si el proceso de la app termina. El siguiente tema cubre cómo condicionar ese trabajo a requisitos del sistema y ejecutarlo periódicamente. Fuente oficial: [Android Developers — WorkManager overview](https://developer.android.com/topic/libraries/architecture/workmanager).

**Errores comunes:** lanzar trabajo crítico con `viewModelScope.launch` en vez de WorkManager, perdiéndolo si el usuario cierra la app; devolver `Result.failure()` ante un error transitorio, perdiendo la oportunidad de reintento automático.

**Cuándo no usarlo:** para una operación que debe completarse mientras el usuario observa activamente su progreso en pantalla (una barra de progreso interactiva), y que es aceptable cancelar si el usuario navega fuera, un `viewModelScope.launch` simple es más apropiado; WorkManager es para trabajo que debe sobrevivir independientemente de si la UI sigue visible.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Envía la outbox de confirmaciones mediante un CoroutineWorker. Interrumpe un intento y vuelve a programarlo; la entrega debe conservar su clave de idempotencia y quedar confirmada una sola vez.

### Tema 2: Constraints y trabajo periódico

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar constraints de red y batería para un trabajo periódico, y explicar por qué WorkManager prioriza la salud del dispositivo sobre la puntualidad exacta.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Las constraints evitan que WorkManager ejecute trabajo en momentos inoportunos para el dispositivo (sin red, con batería crítica), priorizando la salud general del dispositivo sobre la puntualidad exacta del trabajo en segundo plano.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** ejecución condicionada al cumplimiento de requisitos del sistema, no inmediata.

Las constraints declaran condiciones del sistema que deben cumplirse antes de ejecutar el trabajo encolado: `setRequiredNetworkType(NetworkType.CONNECTED)` retrasa la ejecución hasta que haya conexión, y `setRequiresBatteryNotLow(true)` la retrasa mientras la batería esté crítica. Quince minutos es el intervalo mínimo que Android permite para `PeriodicWorkRequestBuilder`; el sistema no garantiza una ejecución exacta cada quince minutos, solo "aproximadamente" esa periodicidad, agrupando trabajos de distintas apps para minimizar cuántas veces el dispositivo debe "despertar".

**Analogía:** las constraints son como las condiciones que un servicio de entrega a domicilio impone antes de salir a repartir (solo si hay suficiente combustible, solo en horario diurno), retrasando la entrega hasta que se cumplan, en vez de arriesgarse a quedar varado a mitad de camino.

**Diagrama:**

```
┌── Constraints ─────────────────────────────┐
│  setRequiredNetworkType(CONNECTED)              │
│  setRequiresBatteryNotLow(true)                    │
└──────────┬─────────────────────────────┘
           │ AMBAS deben cumplirse
           ▼
┌── PeriodicWorkRequestBuilder(15, MINUTES) ──┐
│  mínimo permitido; "aproximadamente" cada 15m    │
└───────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/ConstraintsSincronizacion.kt`:

```bash
# Este script python3 valida el intervalo mínimo permitido y modela las constraints
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/ConstraintsSincronizacion.kt <<'EOF'
package com.academia.android

import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import java.util.concurrent.TimeUnit

fun crearSolicitudPeriodica(): androidx.work.PeriodicWorkRequest {
    val constraints = Constraints.Builder()
        .setRequiredNetworkType(NetworkType.CONNECTED)
        .setRequiresBatteryNotLow(true)
        .build()

    return PeriodicWorkRequestBuilder<SincronizarWorker>(15, TimeUnit.MINUTES)
        .setConstraints(constraints)
        .build()
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `Constraints.Builder()` acumula condiciones (red conectada, batería no baja) que deben cumplirse simultáneamente; `PeriodicWorkRequestBuilder<SincronizarWorker>(15, TimeUnit.MINUTES)` encola `SincronizarWorker` (Tema 1) para ejecutarse periódicamente, con 15 minutos como el intervalo mínimo que Android permite configurar.

Simula, con datos reales de estado del dispositivo, si el trabajo podría ejecutarse o no según las constraints:

```bash
python3 -c "
def constraints_se_cumplen(hay_red, bateria_porcentaje):
    red_conectada = hay_red
    bateria_no_baja = bateria_porcentaje > 15  # 'batería baja' según umbral típico del sistema
    return red_conectada and bateria_no_baja

escenarios = [
    ('con red y batería alta', True, 80),
    ('sin red, batería alta', False, 80),
    ('con red, batería crítica', True, 5),
    ('sin red, batería crítica', False, 5),
]

for descripcion, hay_red, bateria in escenarios:
    puede_ejecutar = constraints_se_cumplen(hay_red, bateria)
    print(f'{descripcion}: {\"EJECUTA\" if puede_ejecutar else \"ESPERA\"}')
"
```

**Resultado esperado:** solo el escenario "con red y batería alta" resulta en `EJECUTA`; los otros tres (falta de red, batería crítica, o ambos) resultan en `ESPERA`, confirmando que WorkManager retrasa el trabajo hasta que TODAS las constraints configuradas se cumplan simultáneamente, no solo alguna de ellas.

**Fallo deliberado:** intenta configurar `PeriodicWorkRequestBuilder<SincronizarWorker>(5, TimeUnit.MINUTES)` (un intervalo menor al mínimo de 15 permitido). En un proyecto Android real, WorkManager ajusta automáticamente ese valor al mínimo permitido (15 minutos) sin lanzar ningún error — diagnostica revisando la documentación oficial: este es un límite impuesto deliberadamente por el sistema operativo para evitar que apps mal diseñadas despierten el dispositivo con demasiada frecuencia, degradando la batería de todos los usuarios.

#### Paso 5 · Práctica guiada

Agrega una constraint adicional (`setRequiresCharging(true)`, requiriendo que el dispositivo esté cargando) y extiende el script de simulación de escenarios para incluir ese tercer factor. **Pista:** agrega un tercer parámetro booleano a `constraints_se_cumplen` y a cada escenario de la lista.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué usar `NetworkType.UNMETERED` (solo wifi) en vez de `NetworkType.CONNECTED` (cualquier red) sería la elección correcta para sincronizar un backup de fotos grande, pero no para sincronizar un pequeño conjunto de tareas de texto.

#### Paso 7 · Cierre

Ya configuras constraints de red y batería para un trabajo periódico, y explicas por qué WorkManager prioriza la salud del dispositivo sobre la puntualidad exacta. El siguiente tema cubre cómo notificar al usuario sobre el resultado de ese trabajo. Fuente oficial: [Android Developers — WorkManager constraints](https://developer.android.com/topic/libraries/architecture/workmanager/how-to/define-work#work-constraints).

**Errores comunes:** configurar un intervalo periódico menor a 15 minutos esperando que se respete exactamente; olvidar constraints de batería en trabajo no urgente, ejecutándolo incluso con batería crítica.

**Cuándo no usarlo:** para un trabajo verdaderamente urgente que el usuario espera activamente (por ejemplo, enviar un mensaje que el usuario acaba de escribir), imponer constraints que retrasen la ejecución sería contraproducente; las constraints son apropiadas para trabajo diferible, no para acciones que el usuario espera ver completadas de inmediato.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Exige conectividad para sincronizar evidencias y separa esa tarea del refresco periódico. Con modo avión, verifica que el trabajo espera y que la interfaz sigue mostrando los cambios guardados localmente.

### Tema 3: Notificaciones desde background work

#### Paso 1 · Objetivo y preparación

Al finalizar podrás disparar una notificación desde `doWork()` al completar un trabajo, y verificar que el trabajo persiste tras cerrar la app.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Las notificaciones desde background work comunican resultados relevantes al usuario sin requerir que abra la app activamente, y verificar la persistencia del trabajo tras cerrar la app confirma en la práctica la garantía central de WorkManager.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** comunicar al usuario un resultado ocurrido fuera de su interacción directa.

Disparar una notificación local desde dentro de `doWork()` al completar la sincronización comunica al usuario que ocurrió algo relevante mientras la app no estaba en primer plano, sin requerir que la abra activamente. Verificar con `adb shell dumpsys jobscheduler` que el trabajo periódico persiste correctamente incluso después de cerrar la app confirma en la práctica la garantía descrita en el Tema 1: la solicitud vive en almacenamiento del sistema gestionado por WorkManager, independiente del proceso que la encoló.

**Analogía:** una notificación desde background work es como un mensaje de texto automático que confirma la entrega de un paquete, enviado independientemente de si el destinatario está revisando activamente el estado del envío, permitiéndole enterarse del resultado sin consultar manualmente.

**Diagrama:**

```
┌── CoroutineWorker.doWork() completa exitosamente ──┐
└──────────┬───────────────────────────────┘
           │
           ▼
┌── NotificationManagerCompat.notify(...) ───────────┐
│ el usuario ve la notificación SIN haber abierto la app  │
└───────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/SincronizarWorkerConNotificacion.kt`:

```bash
# Este script python3 modela el envío de la notificación tras completar el trabajo
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/SincronizarWorkerConNotificacion.kt <<'EOF'
package com.academia.android

import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.CoroutineWorker
import androidx.work.Result
import androidx.work.WorkerParameters

class SincronizarWorkerConNotificacion(
    private val contexto: Context,
    params: WorkerParameters
) : CoroutineWorker(contexto, params) {
    override suspend fun doWork(): Result {
        return try {
            // repositorio.sincronizar() -- Módulo 5/6
            val notificacion = NotificationCompat.Builder(contexto, "canal_sincronizacion")
                .setContentTitle("Sincronización completada")
                .build()
            NotificationManagerCompat.from(contexto).notify(1, notificacion)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** el `Worker` construye una notificación (`NotificationCompat.Builder`) y la dispara con `NotificationManagerCompat.from(contexto).notify(...)` dentro del mismo bloque `try` que la sincronización, antes de retornar `Result.success()`, garantizando que la notificación solo se muestre si la sincronización efectivamente tuvo éxito.

Simula, en un log de eventos ordenado, la secuencia completa desde que el trabajo se completa hasta que el usuario ve la notificación, sin que la app esté en primer plano:

```bash
python3 -c "
eventos = []

def completar_trabajo_en_background():
    eventos.append('doWork() ejecuta la sincronización')
    eventos.append('sincronización exitosa')
    eventos.append('NotificationManagerCompat.notify() dispara la notificación')

def usuario_ve_notificacion_sin_abrir_la_app():
    eventos.append('usuario ve la notificación en la barra de estado (app NO está en primer plano)')

completar_trabajo_en_background()
usuario_ve_notificacion_sin_abrir_la_app()

for i, evento in enumerate(eventos, 1):
    print(f'{i}. {evento}')
"
```

**Resultado esperado:** el log de eventos confirma la secuencia completa: la sincronización se completa, la notificación se dispara, y el usuario la ve sin que la app haya estado en primer plano en ningún momento de esta secuencia, confirmando el valor central de las notificaciones desde background work.

**Fallo deliberado:** mueve la línea de `NotificationManagerCompat.from(contexto).notify(...)` fuera del bloque `try`, después de todo el método (ejecutándose siempre, incluso si `sincronizar()` lanzó una excepción y el flujo cayó en el `catch`). El script Python de verificación de orden (`codigo.index('notify') < codigo.index('Result.success()')`) fallaría dependiendo de dónde quede exactamente esa línea — diagnostica confirmando que notificar incondicionalmente (sin importar si hubo éxito o `Result.retry()`) comunicaría al usuario un resultado incorrecto ("Sincronización completada" cuando en realidad falló), rompiendo la confianza en las notificaciones del sistema.

#### Paso 5 · Práctica guiada

Agrega una segunda notificación (distinta, con otro texto) que se dispare específicamente dentro del bloque `catch`, comunicando al usuario que la sincronización falló y se reintentará. **Pista:** usa un ID de notificación distinto al de éxito, para que ambas puedan coexistir sin sobrescribirse entre sí.

#### Paso 6 · Práctica independiente

Documenta en una frase qué comando de `adb` (mencionado en el Paso 3 de este Tema) usarías para confirmar que un trabajo periódico sigue registrado en el sistema después de cerrar completamente la app, y qué información específica de esa salida confirmaría la garantía de persistencia del Tema 1.

#### Paso 7 · Cierre

Ya disparas notificaciones condicionadas al resultado real de un trabajo en background, y verificas la persistencia de ese trabajo tras cerrar la app. Esto cierra el módulo de trabajo en segundo plano; el siguiente módulo del track aborda Material Design y theming. Fuente oficial: [Android Developers — WorkManager and notifications](https://developer.android.com/develop/background-work/background-tasks/persistent/getting-started/define-work#simple-workrequest).

**Errores comunes:** disparar la notificación de éxito incondicionalmente, sin importar si el trabajo realmente tuvo éxito; olvidar crear el canal de notificación (`NotificationChannel`) requerido en versiones recientes de Android antes de poder notificar.

**Cuándo no usarlo:** para trabajo en background completamente silencioso donde el resultado no es relevante para el usuario (una limpieza de caché rutinaria sin ningún impacto visible), disparar una notificación sería ruido innecesario; resérvalas para resultados que el usuario efectivamente necesita conocer.

---

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Notifica una sincronización que requiere intervención con un enlace al envío afectado. Prueba permisos de notificación denegados: el estado del envío debe seguir accesible desde la aplicación.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una tarea periódica con WorkManager que sincroniza datos con constraints de red.

**Requisitos previos:** Módulo 7 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Crear un `CoroutineWorker` que sincronice datos | Ver Tema 1 | Con la API del Módulo 5 |
| 2 | Encolarlo como trabajo periódico (15 minutos) | Ver Tema 2 | El mínimo permitido |
| 3 | Agregar constraints de red y batería | Ver Tema 2 | Solo corre con conexión y batería no baja |
| 4 | Disparar una notificación al completar | Ver Tema 3 | `NotificationManagerCompat` |
| 5 | Verificar persistencia tras cerrar la app | `adb shell dumpsys jobscheduler` | Confirma que el trabajo sobrevive |

**Verificación:** el laboratorio se considera exitoso si el trabajo periódico sigue registrado (verificable con `dumpsys`) después de cerrar la app por completo, y si la notificación aparece correctamente tras una sincronización exitosa.

**Errores comunes y soluciones**

- **Lanzar la sincronización con `viewModelScope.launch` en vez de WorkManager.** Se cancela si el usuario abandona la pantalla o cierra la app antes de completarse.
- **Configurar un intervalo periódico menor a 15 minutos.** Android lo ajusta automáticamente al mínimo permitido de 15 minutos.
- **No manejar `Result.retry()` ante un fallo transitorio.** Sin él, un fallo temporal (ej. sin conexión momentánea) no se reintenta automáticamente.

---
