# Módulo 7: Trabajo en segundo plano


## Aprende construyendo

> **Antes de empezar este módulo.** Con el catálogo del Módulo 0 (Tema 3), añade en `app/build.gradle.kts`, dentro de `dependencies { }`:
>
> ```kotlin
> implementation(libs.androidx.work.runtime.ktx)
> androidTestImplementation(libs.androidx.work.testing)
> androidTestImplementation(libs.kotlinx.coroutines.test)
> ```
>
> Pulsa **Sync Now**. Sin `work-runtime-ktx`, `import androidx.work.CoroutineWorker` no compila.


### Tema 1: CoroutineWorker y garantía de ejecución · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás escribir un CoroutineWorker y explicar por qué WorkManager garantiza su ejecución eventual incluso si el proceso de la app termina.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/SincronizarWorker.kt`:

```kotlin
package com.academia.android

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import kotlin.coroutines.cancellation.CancellationException

class SincronizarWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        return try {
            // repositorio.sincronizar() -- Módulo 5/6
            Result.success()
        } catch (e: CancellationException) {
            throw e   // WorkManager canceló el trabajo: no lo conviertas en un reintento
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
```

```bash
./gradlew :app:compileDebugKotlin
```

```kotlin
package com.academia.android

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.work.ListenableWorker
import androidx.work.testing.TestListenableWorkerBuilder
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class SincronizarWorkerTest {
    @Test
    fun sincronizarDevuelveSuccess() = runTest {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val worker = TestListenableWorkerBuilder<SincronizarWorker>(context).build()
        assertEquals(ListenableWorker.Result.success(), worker.doWork())
    }
}
```

```kotlin
val solicitud = OneTimeWorkRequestBuilder<SincronizarWorker>()
    .setConstraints(Constraints.Builder().setRequiresCharging(true).build())
    .build()
WorkManager.getInstance(this).enqueueUniqueWork("sincronizar", ExistingWorkPolicy.KEEP, solicitud)
```

```bash
adb shell dumpsys battery unplug          # el emulador deja de "cargar"
adb shell am kill com.academia.android
adb shell dumpsys jobscheduler | grep "com.academia.android"
adb shell dumpsys battery reset           # restaura el estado real de la batería
```

</details>

### Tema 2: Constraints y trabajo periódico · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás configurar constraints de red y batería para un trabajo periódico, y explicar por qué WorkManager prioriza la salud del dispositivo sobre la puntualidad exacta.

#### ► LA ANALOGÍA
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

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/ConstraintsSincronizacion.kt`:

```kotlin
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
```

```bash
./gradlew :app:compileDebugKotlin
```

</details>

### Tema 3: Notificaciones desde background work · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás disparar una notificación desde doWork() al completar un trabajo, y verificar que el trabajo persiste tras cerrar la app.

#### ► LA ANALOGÍA
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

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── CoroutineWorker.doWork() completa exitosamente ──┐
└──────────┬───────────────────────────────┘
           │
           ▼
┌── NotificationManagerCompat.notify(...) ───────────┐
│ el usuario ve la notificación SIN haber abierto la app  │
└───────────────────────────────────────────────┘
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/SincronizarWorkerConNotificacion.kt`:

```kotlin
package com.academia.android

import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.work.CoroutineWorker
import kotlin.coroutines.cancellation.CancellationException
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
        } catch (e: CancellationException) {
            throw e   // WorkManager canceló el trabajo: no lo conviertas en un reintento
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
```

```bash
./gradlew :app:compileDebugKotlin
```

</details>
