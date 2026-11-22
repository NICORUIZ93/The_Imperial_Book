# Módulo 8: Trabajo en segundo plano


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
>
> **Los scripts `python3` de este módulo son modelos, no pruebas de WorkManager.** Escribir un JSON en `/tmp` ilustra la idea de «persistir la solicitud», pero no demuestra que WorkManager lo haga. La evidencia real es la **Verificación real en Android** del Tema 1: una prueba instrumentada del `Worker` y la consulta del planificador del sistema con `adb`.


### Tema 1: CoroutineWorker y garantía de ejecución · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás escribir un CoroutineWorker y explicar por qué WorkManager garantiza su ejecución eventual incluso si el proceso de la app termina.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás escribir un CoroutineWorker y explicar por qué WorkManager garantiza su ejecución eventual incluso si el proceso de la app termina.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en coroutineworker y garantía de ejecución como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que coroutineworker y garantía de ejecución resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| CoroutineWorker y garantía de ejecución se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar CoroutineWorker y garantía de ejecución | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses coroutineworker y garantía de ejecución por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: coroutineworker y garantía de ejecución funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- CoroutineWorker y garantía de ejecución existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve coroutineworker y garantía de ejecución en tu contexto?
2. ¿Cómo sabrías que coroutineworker y garantía de ejecución no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar coroutineworker y garantía de ejecución?

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
# Este script python3 modela la persistencia de la solicitud de trabajo en un archivo real
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

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás configurar constraints de red y batería para un trabajo periódico, y explicar por qué WorkManager prioriza la salud del dispositivo sobre la puntualidad exacta.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

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

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que constraints y trabajo periódico resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Constraints y trabajo periódico se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Constraints y trabajo periódico | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses constraints y trabajo periódico por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: constraints y trabajo periódico funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Constraints y trabajo periódico existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve constraints y trabajo periódico en tu contexto?
2. ¿Cómo sabrías que constraints y trabajo periódico no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar constraints y trabajo periódico?

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
# Este script python3 valida el intervalo mínimo permitido y modela las constraints
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

</details>

### Tema 3: Notificaciones desde background work · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás disparar una notificación desde doWork() al completar un trabajo, y verificar que el trabajo persiste tras cerrar la app.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás disparar una notificación desde doWork() al completar un trabajo, y verificar que el trabajo persiste tras cerrar la app.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

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

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que notificaciones desde background work resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Notificaciones desde background work se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Notificaciones desde background work | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses notificaciones desde background work por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: notificaciones desde background work funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Notificaciones desde background work existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve notificaciones desde background work en tu contexto?
2. ¿Cómo sabrías que notificaciones desde background work no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar notificaciones desde background work?

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
# Este script python3 modela el envío de la notificación tras completar el trabajo
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

</details>
