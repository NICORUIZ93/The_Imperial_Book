# Módulo 4: Networking con Retrofit/Ktor


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
> **`jwebserver` y `curl` en este módulo prueban el servidor, no tu app.** La evidencia de que Retrofit funciona es la **Verificación real en Android** del Tema 1: la app en el emulador llama al servidor y `logcat` muestra el resultado. Desde el emulador, tu ordenador no es `localhost` sino `10.0.2.2`.


### Tema 1: Retrofit con coroutines · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás declarar un endpoint HTTP con Retrofit como una función suspend, y explicar por qué evita el anidamiento de callbacks del Retrofit clásico.

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

Para probar sin backend real, sirve un archivo JSON con `jwebserver`, el servidor de archivos que trae el JDK desde
la versión 18 (el JDK de Android Studio también lo incluye). Cada archivo de la carpeta es una ruta: `api/tareas`
responde en `/tareas`.

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android api
printf '[{"id":"1","titulo":"Comprar leche"},{"id":"2","titulo":"Pagar el alquiler"}]\n' > api/tareas
jwebserver -p 8000 -d "$PWD/api" &
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
curl -s http://localhost:8000/tareas
kill %1 2>/dev/null || true
```

```text
[{"id":"1","titulo":"Comprar leche"},{"id":"2","titulo":"Pagar el alquiler"}]
```

`jwebserver` responde con `Content-type: application/octet-stream` porque el archivo no tiene extensión. El
convertidor de kotlinx.serialization lee el cuerpo sin mirar ese encabezado, así que Retrofit lo decodifica igual.

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
# Levanta de nuevo el servidor de prueba: /tareas responde y cualquier otra ruta da 404
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
jwebserver -p 8000 -d "$PWD/api" &
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

Antes de escribir el interceptor, comprueba con `curl -v` cómo viaja el encabezado. Las líneas que empiezan con
`>` son lo que el cliente envía:

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
jwebserver -p 8000 -d "$PWD/api" &
sleep 1
curl -s -v -H "Authorization: Bearer token-123" http://localhost:8000/tareas 2>&1 | grep -i "^> authorization"
```

```text
> Authorization: Bearer token-123
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

Con la app apuntando al servidor, `logcat` muestra en la línea `--> GET` el encabezado `Authorization`. Si inviertes
el orden de los dos `addInterceptor`, la petición sigue llevando el token, pero el log ya no lo muestra: el logging
corrió antes de que se agregara.

</details>
