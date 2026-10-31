# Módulo 5: Networking con Retrofit/Ktor


## Aprende construyendo

### Tema 1: Retrofit con coroutines

#### Paso 1 · Objetivo y preparación

Al finalizar podrás declarar un endpoint HTTP con Retrofit como una función `suspend`, y explicar por qué evita el anidamiento de callbacks del Retrofit clásico.

**Conocimiento previo:** funciones suspend (Kotlin Multiplatform, Módulo 2); `ViewModel` (Módulo 1 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Retrofit + coroutines permite leer código de red de forma lineal y secuencial, sin el anidamiento de callbacks del Retrofit clásico, y comparte el mismo principio de "función suspend para operaciones asíncronas" que Ktor Client en Kotlin Multiplatform.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** interfaz declarativa, funciones suspend en vez de callbacks.

Retrofit permite declarar un endpoint HTTP como una función de interfaz anotada (`@GET("tareas")`), generando en tiempo de compilación la implementación real que realiza la petición HTTP; al marcar la función como `suspend`, Retrofit ejecuta la llamada de forma asíncrona sin bloquear el hilo, y el código que la llama se lee de forma lineal (`val tareas = apiService.obtenerTareas()`), evitando el anidamiento de callbacks (`enqueue(object : Callback<...> { onResponse... onFailure... })`) del Retrofit clásico. Este mismo patrón sustenta Ktor Client en Kotlin Multiplatform (Módulo 6 de ese track).

**Analogía:** una función Retrofit anotada es como llenar un formulario de pedido estandarizado y entregárselo a un servicio de mensajería que se encarga de todo el trámite por su cuenta; `suspend` permite continuar con otras tareas mientras se espera la respuesta, sin quedar bloqueado esperando en la ventanilla.

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea en `app/src/main/kotlin/` la interfaz Retrofit, junto con un servidor HTTP real mínimo para probar contra él:

```bash
# Script en python3 que levanta un servidor HTTP real de prueba en el puerto 8000
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > servidor_prueba.py <<'EOF'
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
EOF
python3 servidor_prueba.py &
sleep 1
cat > app/src/main/kotlin/com/academia/android/ApiService.kt <<'EOF'
package com.academia.android

import retrofit2.http.GET

data class TareaDTO(val id: String, val titulo: String)

interface ApiService {
    @GET("tareas")
    suspend fun obtenerTareas(): List<TareaDTO>
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** el servidor Python (`servidor_prueba.py`) simula el backend real que `ApiService.obtenerTareas()` consumiría en producción; `@GET("tareas")` declara la ruta relativa a la `baseUrl` configurada en el `Retrofit.Builder`, y `suspend fun obtenerTareas(): List<TareaDTO>` es la función que Retrofit implementaría automáticamente para hacer esa petición HTTP de forma asíncrona.

`curl` es el comando que hace una petición HTTP desde la terminal; confirma con él que el servidor de prueba responde exactamente lo que la interfaz Retrofit esperaría deserializar:

```bash
curl -s http://localhost:8000/tareas | python3 -m json.tool
kill %1 2>/dev/null || true
```

**Resultado esperado:** el servidor responde con un array JSON de dos tareas (`Comprar leche`, `Pagar el alquiler`), exactamente la forma que `List<TareaDTO>` en Kotlin deserializaría automáticamente vía el `ConverterFactory` configurado en Retrofit (Moshi o Gson), confirmando que el contrato de datos entre cliente y servidor es consistente.

**Fallo deliberado:** repite el `curl` contra una ruta que no existe (`curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/inexistente`, con el servidor corriendo de nuevo si ya lo detuviste). El servidor responde `404` — diagnostica confirmando que, en un proyecto Android real, esa respuesta 404 no dispara ninguna excepción de red genérica (`IOException`), sino específicamente una `HttpException` con código 404, exactamente la distinción que el Tema 2 formaliza para dar mensajes de error específicos.

#### Paso 5 · Práctica guiada

Agrega un segundo endpoint a `servidor_prueba.py` (`/tareas/<id>`, respondiendo el detalle de una tarea específica) y su función correspondiente en `ApiService.kt` (`@GET("tareas/{id}") suspend fun obtenerTarea(@Path("id") id: String): TareaDTO`), confirmando con `curl` que responde el detalle correcto. **Pista:** en `http.server`, puedes inspeccionar `self.path` para extraer el segmento después de `/tareas/`.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué declarar `ApiService` como una interfaz (en vez de una clase con métodos concretos) facilita testear un `ViewModel` que la use, sustituyéndola por una implementación falsa en un test (Módulo 9 de este track).

#### Paso 7 · Cierre

Ya declaras un endpoint HTTP con Retrofit como función `suspend`, leíble de forma lineal sin callbacks anidados. El siguiente tema formaliza cómo distinguir y manejar los distintos tipos de error que esa llamada puede producir. Fuente oficial: [Retrofit — API publicada por Square](https://javadoc.io/doc/com.squareup.retrofit2/retrofit/latest/index.html).

**Errores comunes:** olvidar el modificador `suspend` en la función de la interfaz, lo que rompe la integración con coroutines; asumir que la deserialización siempre tendrá éxito sin considerar respuestas con forma inesperada.

**Cuándo no usarlo:** para una app completamente offline sin ningún backend remoto, Retrofit no aporta ningún valor; resérvalo para apps que efectivamente consumen una API HTTP.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Implementa la consulta de entregas del repartidor con una API de prueba. Cancela al salir de la pantalla y verifica que la respuesta tardía no reemplaza los datos de otra ruta.

### Tema 2: Manejo de errores HTTP

#### Paso 1 · Objetivo y preparación

Al finalizar podrás distinguir `HttpException` de `IOException` en un `ViewModel`, dando un mensaje específico y accionable para cada caso.

**Conocimiento previo:** Tema 1 de este módulo; `StateFlow` (Módulo 4).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Sin modelar explícitamente el estado de error (y sus categorías), la app no puede comunicar al usuario si el problema es su conexión o un error del servidor, ni decidir automáticamente si vale la pena reintentar la operación.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** distinguir errores de red de errores de servidor, mensajes específicos para cada caso.

Separar `HttpException` (el servidor respondió, pero con un código de error como 404 o 500) de `IOException` (la petición nunca llegó a completarse, típicamente por falta de conexión) permite mostrar un mensaje específico y accionable para cada caso, en vez de un genérico "algo salió mal". Esta distinción refleja el mismo principio de excepciones tipadas por categoría del track Java (Módulo 3, checked vs unchecked). Un `ViewModel` que capture `Exception` genérica indiscriminadamente pierde información valiosa para decidir si reintentar (apropiado ante `IOException`) o no (poco útil ante un 404 definitivo).

**Analogía:** distinguir `HttpException` de `IOException` es como diferenciar una carta devuelta porque el destinatario se mudó (el servidor respondió con un error específico) de una carta que nunca llegó porque el servicio postal está fuera de servicio (la conexión falló por completo).

**Diagrama:**

```
┌── Petición HTTP ──────────────────────────────────┐
│  ├─ éxito                    → EstadoUI.Exito(datos)  │
│  ├─ HttpException (código)    → EstadoUI.Error("Error N")│
│  └─ IOException (sin conexión) → EstadoUI.Error("Sin conexión")│
└───────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza el servidor de prueba (Tema 1; recréalo con `mkdir -p academia-android` desde una carpeta vacía si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/TareasViewModelConErrores.kt`:

```bash
# Script en python3 que levanta de nuevo el servidor de prueba con una ruta que falla
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
python3 servidor_prueba.py &
sleep 1
cat > app/src/main/kotlin/com/academia/android/TareasViewModelConErrores.kt <<'EOF'
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
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** el `try` intenta obtener y mapear las tareas del `ApiService` del Tema 1; el primer `catch (e: HttpException)` captura específicamente errores donde el servidor respondió con un código de error, extrayendo `e.code()`; el segundo `catch (e: IOException)` captura específicamente fallos de conectividad, donde nunca hubo respuesta del servidor.

Confirma contra el servidor real cuál de los dos escenarios ocurre según el estado del servidor:

```bash
curl -s -o /dev/null -w "código HTTP con servidor activo: %{http_code}\n" http://localhost:8000/tareas
kill %1 2>/dev/null || true
sleep 1
curl -s -o /dev/null -w "código con servidor detenido: %{http_code}\n" --max-time 2 http://localhost:8000/tareas 2>&1 || echo "conexión falló (equivalente a IOException): sin respuesta del servidor"
```

`--max-time` es la bandera que limita cuántos segundos espera `curl` una respuesta antes de darse por vencido, evitando que el comando quede colgado indefinidamente contra un servidor detenido.

**Resultado esperado:** con el servidor activo, la petición a `/tareas` responde `200` (mapearía a `EstadoUI.Exito`); tras detener el servidor (`kill`), la misma petición falla por completo sin ninguna respuesta HTTP (equivalente a `IOException`, no a un código de error específico), confirmando la distinción real entre "el servidor respondió con un error" y "la conexión nunca se completó".

**Fallo deliberado:** reemplaza ambos `catch` específicos por un único `catch (e: Exception)` genérico, y repite mentalmente el escenario de servidor detenido. El código seguiría "funcionando" (captura la excepción igualmente), pero el mensaje mostrado al usuario perdería la distinción entre "revisa tu conexión" y "error del servidor, código específico" — diagnostica confirmando que capturar `Exception` genérica no falla en tiempo de ejecución, pero sí pierde silenciosamente la información necesaria para dar una respuesta específica y para decidir si reintentar automáticamente.

#### Paso 5 · Práctica guiada

Agrega un `catch` adicional antes de `IOException` que capture específicamente `HttpException` con `e.code() == 401`, mostrando `"Sesión expirada, inicia sesión de nuevo"` en vez del genérico `"Error 401"`. **Pista:** puedes anidar un `if (e.code() == 401)` dentro del mismo `catch (e: HttpException)` existente, sin necesitar un bloque `catch` separado.

#### Paso 6 · Práctica independiente

Documenta en una frase una política de reintento automático razonable (cuántas veces, con qué espera entre intentos) específicamente para el caso `IOException`, y por qué esa misma política no debería aplicarse a un `HttpException` con código 404.

#### Paso 7 · Cierre

Ya distingues `HttpException` de `IOException` en un `ViewModel`, dando mensajes específicos y accionables para cada caso. El siguiente tema cubre cómo aplicar transformaciones transversales (logging, autenticación) a todas las peticiones sin repetir código en cada llamada. Fuente oficial: [Square — Retrofit HttpException](https://javadoc.io/doc/com.squareup.retrofit2/retrofit/latest/retrofit2/HttpException.html).

**Errores comunes:** capturar `Exception` genérica sin distinguir categorías, perdiendo la posibilidad de mensajes específicos; reintentar automáticamente ante cualquier tipo de error, incluyendo errores definitivos como un 404 donde reintentar no cambiaría el resultado.

**Cuándo no usarlo:** para un prototipo interno de un solo desarrollador sin usuarios finales reales, capturar `Exception` genérica con un mensaje simple puede ser suficiente temporalmente; la distinción se vuelve importante en cuanto hay usuarios reales que necesitan entender qué salió mal.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Distingue una guía inexistente, una sesión vencida y un servidor no disponible. Prueba cada respuesta HTTP y comprueba que solo los fallos recuperables ofrecen reintentar la misma operación.

### Tema 3: Interceptores de OkHttp

#### Paso 1 · Objetivo y preparación

Al finalizar podrás configurar interceptores de OkHttp para logging y autenticación, y explicar por qué el orden de registro importa.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Los interceptores centralizan transformaciones transversales (logging, autenticación) en un único punto, evitando duplicar esa lógica en cada llamada individual de la API, el mismo principio que los interceptores de `HttpClient` en Angular.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** transformación transversal de cada request/response, sin modificar el código de cada llamada individual.

Un interceptor de OkHttp se ejecuta de forma transversal en cada petición y respuesta que pasa por el cliente HTTP, permitiendo aplicar una transformación común (loguear el cuerpo, agregar un header de autenticación) sin repetir esa lógica en cada llamada individual. Esto es el mismo principio que los interceptores funcionales de `HttpClient` en Angular (Módulo 7 de ese track). El orden en que se registran importa: un interceptor de autenticación registrado antes que uno de logging aseguraría que el log capture la petición ya con el header agregado.

**Analogía:** un interceptor de OkHttp es como una estación de control aduanero por la que pasa obligatoriamente cada paquete que entra o sale de un país, aplicando el mismo sello a todos los paquetes sin que el remitente lo solicite explícitamente en cada envío.

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero

Reutiliza el servidor de prueba (Tema 1; recréalo con `mkdir -p academia-android` desde una carpeta vacía si es tu primera vez) y crea, dentro de `app/src/main/kotlin/`, un cliente HTTP con interceptores; primero verifica con python el comportamiento esperado contra un servidor que expone qué headers recibió:

```bash
# Script en python3 que confirma el comportamiento antes de escribir el Kotlin real
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > servidor_prueba_headers.py <<'EOF'
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
EOF
python3 servidor_prueba_headers.py &
sleep 1
curl -s -H "Authorization: Bearer token-123" http://localhost:8001/ | python3 -m json.tool
cat > app/src/main/kotlin/com/academia/android/ClienteHttpConInterceptores.kt <<'EOF'
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
EOF
kill %1 2>/dev/null || true
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** el servidor de prueba (`servidor_prueba_headers.py`) responde exactamente qué valor de `Authorization` recibió, permitiendo verificar objetivamente si un header llegó o no; en el cliente real, `addInterceptor(authInterceptor)` se registra antes que `addInterceptor(loggingInterceptor)`, de modo que cuando el logging se ejecuta, el header de autenticación ya fue agregado a la petición.

Confirma con `curl` (simulando la petición ya autenticada que el cliente Android enviaría) que el servidor efectivamente recibe el header cuando se envía explícitamente:

```bash
python3 servidor_prueba_headers.py &
sleep 1
echo "--- con header Authorization (como haría authInterceptor) ---"
curl -s -H "Authorization: Bearer token-123" http://localhost:8001/ | python3 -m json.tool
echo "--- sin header Authorization (como sería si el orden estuviera invertido y el logging ocurriera antes) ---"
curl -s http://localhost:8001/ | python3 -m json.tool
kill %1 2>/dev/null || true
```

**Resultado esperado:** la primera petición (con header explícito) muestra `"authorization_recibido": "Bearer token-123"`; la segunda (sin header) muestra `"authorization_recibido": null`, ilustrando concretamente por qué el orden de interceptores importa: si `loggingInterceptor` se ejecutara antes de que `authInterceptor` agregara el header, el log capturado mostraría la petición sin ese header, aunque la petición final sí lo incluyera.

**Fallo deliberado:** invierte el orden en `ClienteHttpConInterceptores.kt` (`addInterceptor(loggingInterceptor)` antes que `addInterceptor(authInterceptor)`) y repite la verificación con el script Python de la sección anterior. La aserción falla (`authInterceptor debe registrarse antes que loggingInterceptor`) — diagnostica confirmando que, con ese orden invertido, cualquier log generado durante la fase de `loggingInterceptor` capturaría la petición ANTES de que el header de autenticación fuera agregado, dificultando diagnosticar problemas de autenticación específicamente a partir de esos logs.

#### Paso 5 · Práctica guiada

Agrega un tercer interceptor que mida y loguee la duración de cada petición (usando `System.currentTimeMillis()` antes y después de `chain.proceed(...)`), y decide en qué posición del orden de registro debería ir (antes o después de `loggingInterceptor`) para medir la duración total real, incluyendo el tiempo de logging. **Pista:** un interceptor de medición de tiempo típicamente debe ser el primero en registrarse para capturar la duración de todo lo que ocurre después.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué `HttpLoggingInterceptor().apply { level = ... BODY }` debería configurarse en un nivel menos verboso (o deshabilitarse por completo) en builds de producción, relacionándolo con lo que ya sabes sobre no exponer datos sensibles en logs (DevOps, Módulo 10, logging estructurado).

#### Paso 7 · Cierre

Ya configuras interceptores de OkHttp para logging y autenticación, y explicas concretamente por qué su orden de registro afecta qué información capturan los logs. Esto cierra el módulo de networking; el siguiente módulo del track aborda persistencia local con Room. Fuente oficial: [Square — API de OkHttp](https://javadoc.io/doc/com.squareup.okhttp3/okhttp/latest/index.html).

**Errores comunes:** dejar `HttpLoggingInterceptor` en nivel `BODY` (verboso, incluyendo cuerpos completos con posibles datos sensibles) en builds de producción; registrar el interceptor de autenticación después del de logging cuando se necesita depurar problemas relacionados con el header.

**Cuándo no usarlo:** para una API pública sin autenticación y sin necesidad de logging detallado, agregar interceptores es complejidad sin beneficio inmediato; resérvalos para casos donde efectivamente necesitas una transformación transversal aplicada a todas las peticiones.

---

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Añade autenticación y un identificador de petición al cliente de entregas. Inspecciona los logs de prueba: deben permitir seguir el fallo sin imprimir tokens ni reenviar credenciales a un host ajeno.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una app que consume una API real con estados loading/error/success explícitos.

**Requisitos previos:** Módulo 4 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Definir una interfaz Retrofit con un método `suspend` GET | Ver Tema 1 | Consume un endpoint real |
| 2 | Llamarla desde un `ViewModel` en `viewModelScope.launch` | Ver Tema 1 | Actualiza el `StateFlow` con el resultado |
| 3 | Modelar explícitamente Cargando/Éxito/Error | Ver Tema 2 | Muestra cada estado en la UI |
| 4 | Agregar un interceptor de logging | Ver Tema 3 | Loguea cada request/response |
| 5 | Agregar un interceptor de autenticación | Ver Tema 3 | Header en cada llamada |

**Verificación:** el laboratorio se considera exitoso si la UI muestra correctamente cada uno de los tres estados (cargando, éxito, error) según corresponda, y si los logs de OkHttp muestran el header de autenticación aplicado a cada petición.

**Errores comunes y soluciones**

- **Capturar `Exception` genérica sin distinguir `HttpException` de `IOException`.** Distínguelas para dar mensajes específicos y decidir si reintentar.
- **Registrar el interceptor de logging antes que el de autenticación cuando se necesita ver el header en el log.** Ajusta el orden de registro según qué necesites observar.
- **No modelar el estado de error explícitamente.** Sin él, la app no puede comunicar al usuario qué salió mal.

---
