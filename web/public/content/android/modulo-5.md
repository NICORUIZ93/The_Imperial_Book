# Módulo 5: Networking con Retrofit/Ktor


## Aprende construyendo

> **Antes de empezar este módulo.** Con el catálogo del Módulo 0 (Tema 3), añade en `app/build.gradle.kts`:
>
> ```kotlin
> plugins {
>     // ...los que ya tienes...
>     alias(libs.plugins.kotlin.serialization)   // si no lo añadiste en el Módulo 3
> }
> dependencies {
>     // ...las que ya tienes...
>     implementation(libs.retrofit)
>     implementation(libs.retrofit.kotlinx.serialization)
>     implementation(libs.kotlinx.serialization.json)
>     implementation(libs.okhttp.logging)
> }
> ```
>
> En el `build.gradle.kts` de la raíz, `alias(libs.plugins.kotlin.serialization) apply false` (si no está). En `app/src/main/AndroidManifest.xml`, antes de `<application>`, declara `<uses-permission android:name="android.permission.INTERNET" />`. Como el servidor de prueba usa `http://` sin TLS y desde Android 9 el tráfico en texto plano está bloqueado por defecto, permítelo **solo en depuración** creando `app/src/debug/AndroidManifest.xml`:
>
> ```xml
> <manifest xmlns:android="http://schemas.android.com/apk/res/android">
>     <application android:usesCleartextTraffic="true" />
> </manifest>
> ```
>
> Pulsa **Sync Now**. Sin estas dependencias, `import retrofit2.http.GET` no compila.
>
> **Los scripts `python3` y `curl` de este módulo prueban el servidor, no tu app.** La evidencia de que Retrofit funciona es la **Verificación real en Android** del Tema 1: la app en el emulador llama al servidor y `logcat` muestra el resultado. Desde el emulador, tu ordenador no es `localhost` sino `10.0.2.2`.


### Tema 1: Retrofit con coroutines · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás declarar un endpoint HTTP con Retrofit como una función suspend, y explicar por qué evita el anidamiento de callbacks del Retrofit clásico.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás declarar un endpoint HTTP con Retrofit como una función suspend, y explicar por qué evita el anidamiento de callbacks del Retrofit clásico.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en retrofit con coroutines como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que retrofit con coroutines resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Retrofit con coroutines se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Retrofit con coroutines | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses retrofit con coroutines por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: retrofit con coroutines funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Retrofit con coroutines existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve retrofit con coroutines en tu contexto?
2. ¿Cómo sabrías que retrofit con coroutines no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar retrofit con coroutines?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── interface ApiService ────────────────────┐
│  @GET("tareas")                                 │
│  suspend fun obtenerTareas(): List<TareaDTO>       │
└──────────┬─────────────────────────────┘
           │ Retrofit genera la implementación real
           ▼
┌── val tareas = apiService.obtenerTareas() ──┐
│  se lee LINEAL, sin callbacks anidados          │
└───────────────────────────────────────┘
```

```bash
# Script en python3 que levanta un servidor HTTP real de prueba en el puerto 8000
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `servidor_prueba.py`:

```python
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

class ManejadorTareas(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/tareas":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps([
                {"id": "1", "titulo": "Comprar leche"},
                {"id": "2", "titulo": "Pagar el alquiler"},
            ]).encode())
        else:
            self.send_response(404)
            self.end_headers()
    def log_message(self, *args):
        pass

if __name__ == "__main__":
    HTTPServer(("localhost", 8000), ManejadorTareas).serve_forever()
```

```bash
python3 servidor_prueba.py &
sleep 1
```

Crea el archivo `app/src/main/kotlin/com/academia/android/ApiService.kt`:

```kotlin
package com.academia.android

import kotlinx.serialization.Serializable
import retrofit2.http.GET

@Serializable
data class TareaDTO(val id: String, val titulo: String)

interface ApiService {
    @GET("tareas")
    suspend fun obtenerTareas(): List<TareaDTO>
}
```

```bash
./gradlew :app:compileDebugKotlin
```

```bash
curl -s http://localhost:8000/tareas | python3 -m json.tool
kill %1 2>/dev/null || true
```

```kotlin
package com.academia.android

import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

// En el emulador, 10.0.2.2 es el localhost de tu ordenador
fun crearApiService(baseUrl: String = "http://10.0.2.2:8000/"): ApiService =
    Retrofit.Builder()
        .baseUrl(baseUrl)
        .addConverterFactory(Json { ignoreUnknownKeys = true }.asConverterFactory("application/json".toMediaType()))
        .build()
        .create(ApiService::class.java)
```

```bash
./gradlew :app:installDebug
adb logcat -s Red:D
```

</details>

### Tema 2: Manejo de errores HTTP · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás distinguir HttpException de IOException en un ViewModel, dando un mensaje específico y accionable para cada caso.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás distinguir HttpException de IOException en un ViewModel, dando un mensaje específico y accionable para cada caso.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en manejo de errores http como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que manejo de errores http resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Manejo de errores HTTP se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Manejo de errores HTTP | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses manejo de errores http por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: manejo de errores http funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Manejo de errores HTTP existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve manejo de errores http en tu contexto?
2. ¿Cómo sabrías que manejo de errores http no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar manejo de errores http?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Petición HTTP ──────────────────────────────────┐
│  ├─ éxito                    → EstadoUI.Exito(datos)  │
│  ├─ HttpException (código)    → EstadoUI.Error("Error N")│
│  └─ IOException (sin conexión) → EstadoUI.Error("Sin conexión")│
└───────────────────────────────────────────────┘
```

```bash
# Script en python3 que levanta de nuevo el servidor de prueba con una ruta que falla
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
python3 servidor_prueba.py &
sleep 1
```

Crea el archivo `app/src/main/kotlin/com/academia/android/TareasViewModelConErrores.kt`:

```kotlin
package com.academia.android

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import retrofit2.HttpException
import java.io.IOException

class TareasViewModelConErrores(private val api: ApiService) : ViewModel() {
    private val _estado = MutableStateFlow<EstadoUI>(EstadoUI.Cargando)
    val estado = _estado.asStateFlow()

    fun cargar() = viewModelScope.launch {
        _estado.value = try {
            EstadoUI.Exito(api.obtenerTareas().map { it.titulo })
        } catch (e: HttpException) {
            EstadoUI.Error("Error ${e.code()}")
        } catch (e: IOException) {
            EstadoUI.Error("Sin conexión")
        }
    }
}
```

```bash
./gradlew :app:compileDebugKotlin
```

```bash
curl -s -o /dev/null -w "código HTTP con servidor activo: %{http_code}\n" http://localhost:8000/tareas
kill %1 2>/dev/null || true
sleep 1
curl -s -o /dev/null -w "código con servidor detenido: %{http_code}\n" --max-time 2 http://localhost:8000/tareas 2>&1 || echo "conexión falló (equivalente a IOException): sin respuesta del servidor"
```

</details>

### Tema 3: Interceptores de OkHttp · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás configurar interceptores de OkHttp para logging y autenticación, y explicar por qué el orden de registro importa.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás configurar interceptores de OkHttp para logging y autenticación, y explicar por qué el orden de registro importa.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en interceptores de okhttp como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que interceptores de okhttp resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Interceptores de OkHttp se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Interceptores de OkHttp | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses interceptores de okhttp por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: interceptores de okhttp funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Interceptores de OkHttp existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve interceptores de okhttp en tu contexto?
2. ¿Cómo sabrías que interceptores de okhttp no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar interceptores de okhttp?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── addInterceptor(auth) PRIMERO ────────────────┐
│ request → [agrega header Authorization] → [logging]  │
│                                     log MUESTRA el header │
└─────────────────────────────────────────┘
┌── addInterceptor(logging) PRIMERO ─────────────┐
│ request → [logging] → [agrega header Authorization]  │
│         log NO muestra el header (aún no se agregó)      │
└─────────────────────────────────────────┘
```

```bash
# Script en python3 que confirma el comportamiento antes de escribir el Kotlin real
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `servidor_prueba_headers.py`:

```python
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

class ManejadorHeaders(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"authorization_recibido": self.headers.get("Authorization")}).encode())
    def log_message(self, *args):
        pass

if __name__ == "__main__":
    HTTPServer(("localhost", 8001), ManejadorHeaders).serve_forever()
```

```bash
python3 servidor_prueba_headers.py &
sleep 1
curl -s -H "Authorization: Bearer token-123" http://localhost:8001/ | python3 -m json.tool
```

Crea el archivo `app/src/main/kotlin/com/academia/android/ClienteHttpConInterceptores.kt`:

```kotlin
package com.academia.android

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor

fun crearClienteHttp(token: String): OkHttpClient {
    val loggingInterceptor = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }
    val authInterceptor = okhttp3.Interceptor { chain ->
        chain.proceed(chain.request().newBuilder().addHeader("Authorization", "Bearer $token").build())
    }
    return OkHttpClient.Builder()
        .addInterceptor(authInterceptor)     // primero: agrega el header
        .addInterceptor(loggingInterceptor)  // segundo: loguea ya CON el header agregado
        .build()
}
```

```bash
kill %1 2>/dev/null || true
./gradlew :app:compileDebugKotlin
```

```bash
python3 servidor_prueba_headers.py &
sleep 1
echo "--- con header Authorization (como haría authInterceptor) ---"
curl -s -H "Authorization: Bearer token-123" http://localhost:8001/ | python3 -m json.tool
echo "--- sin header Authorization (como sería si el orden estuviera invertido y el logging ocurriera antes) ---"
curl -s http://localhost:8001/ | python3 -m json.tool
kill %1 2>/dev/null || true
```

</details>
