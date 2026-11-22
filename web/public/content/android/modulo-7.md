# Módulo 7: Inyección de dependencias con Hilt


## Aprende construyendo

> **Antes de empezar este módulo.** Hilt necesita su plugin de Gradle, KSP para generar código y que el manifiesto use tu clase `Application`. Con el catálogo del Módulo 0 (Tema 3):
>
> ```kotlin
> // build.gradle.kts de la raíz, dentro de plugins { }
> alias(libs.plugins.ksp) apply false   // si no lo añadiste en el Módulo 6
> alias(libs.plugins.hilt) apply false
>
> // app/build.gradle.kts
> plugins {
>     // ...los que ya tienes...
>     alias(libs.plugins.ksp)
>     alias(libs.plugins.hilt)
> }
> dependencies {
>     // ...las que ya tienes...
>     implementation(libs.hilt.android)
>     ksp(libs.hilt.compiler)
>     androidTestImplementation(libs.hilt.android.testing)
>     kspAndroidTest(libs.hilt.compiler)
> }
> ```
>
> En `app/src/main/AndroidManifest.xml`, añade `android:name=".MiApp"` a la etiqueta `<application>`; sin él, Android crea un `Application` genérico y Hilt nunca se inicializa. Pulsa **Sync Now**.
>
> **Los scripts `python3` de este módulo son modelos del principio de inyección, no pruebas de Hilt.** La evidencia real es que KSP genere el grafo al compilar (los errores `[Dagger/MissingBinding]` aparecen en compilación) y la prueba instrumentada del Tema 3.


### Tema 1: Configuración básica de Hilt · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás anotar una Application y un ViewModel con Hilt, y explicar por qué la inyección de dependencias evita que cada clase conozca cómo construir sus propias dependencias.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás anotar una Application y un ViewModel con Hilt, y explicar por qué la inyección de dependencias evita que cada clase conozca cómo construir sus propias dependencias.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en configuración básica de hilt como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que configuración básica de hilt resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Configuración básica de Hilt se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Configuración básica de Hilt | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses configuración básica de hilt por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: configuración básica de hilt funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Configuración básica de Hilt existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve configuración básica de hilt en tu contexto?
2. ¿Cómo sabrías que configuración básica de hilt no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar configuración básica de hilt?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── SIN inyección de dependencias ─────────────┐
│ class TareasViewModel {                          │
│   val repo = TareaRepositoryImpl(Retrofit(...))    │  ← conoce CÓMO construir todo
│ }                                                     │
└───────────────────────────────────────────┘
┌── CON Hilt (@Inject) ────────────────────────┐
│ class TareasViewModel @Inject constructor(         │
│   private val repo: TareaRepository)                 │  ← solo declara QUÉ necesita
│ )                                                      │
└───────────────────────────────────────────┘
```

```bash
# Este script python3 modela el mismo grafo de dependencias para verificar el principio
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
cat > app/src/main/kotlin/com/academia/android/MiApp.kt <<'EOF'
package com.academia.android

import android.app.Application
import androidx.lifecycle.ViewModel
import dagger.hilt.android.HiltAndroidApp
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltAndroidApp
class MiApp : Application()

@HiltViewModel
class TareasViewModelInyectado @Inject constructor(
    private val repo: TareaRepository
) : ViewModel()
EOF
./gradlew :app:compileDebugKotlin
```

```bash
python3 -c "
class TareaRepository:
    def obtener(self):
        return ['Comprar leche', 'Pagar alquiler']

class TareasViewModel:
    def __init__(self, repo):  # recibe la dependencia YA CONSTRUIDA, no la construye
        self.repo = repo

class ContenedorDeDependencias:
    def __init__(self):
        self._instancias = {}
    def resolver(self, tipo, fabrica):
        if tipo not in self._instancias:
            self._instancias[tipo] = fabrica()
        return self._instancias[tipo]

contenedor = ContenedorDeDependencias()
repo = contenedor.resolver('TareaRepository', lambda: TareaRepository())
view_model = TareasViewModel(repo)  # nunca construye TareaRepository() directamente
print('ViewModel obtuvo sus tareas vía la dependencia inyectada:', view_model.repo.obtener())
"
```

</details>

### Tema 2: @Provides y @Binds · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás decidir entre @Provides y @Binds según si una dependencia es una clase externa o una interfaz propia con implementación inyectable.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás decidir entre @Provides y @Binds según si una dependencia es una clase externa o una interfaz propia con implementación inyectable.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en @provides y @binds como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que @provides y @binds resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| @Provides y @Binds se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar @Provides y @Binds | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses @provides y @binds por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: @provides y @binds funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- @Provides y @Binds existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve @provides y @binds en tu contexto?
2. ¿Cómo sabrías que @provides y @binds no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar @provides y @binds?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── @Provides (clase EXTERNA, sin @Inject propio) ──┐
│ @Provides fun provideRetrofit(): Retrofit =            │
│   Retrofit.Builder().baseUrl(URL).build()                │
└─────────────────────────────────────────┘
┌── @Binds (interfaz PROPIA, implementación con @Inject) ─┐
│ @Binds abstract fun bindTareaRepository(                     │
│   impl: TareaRepositoryImpl): TareaRepository                    │
└─────────────────────────────────────────────┘
```

```bash
# Este script python3 modela ambos patrones (provides y binds) para verificar la diferencia en ejecución real
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
cat > app/src/main/kotlin/com/academia/android/NetworkModule.kt <<'EOF'
package com.academia.android

import android.content.Context
import androidx.room.Room
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton
import retrofit2.Retrofit

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideApiService(): ApiService = crearApiService()   // ClienteApi.kt, Módulo 5
}

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "tareas.db").build()

    @Provides
    fun provideTareaDao(db: AppDatabase): TareaDao = db.tareaDao()
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindTareaRepository(impl: TareaRepositoryImpl): TareaRepository
}
EOF
./gradlew :app:compileDebugKotlin
```

```bash
python3 -c "
class Retrofit:
    def __init__(self, base_url):
        self.base_url = base_url

class TareaRepository:  # interfaz/contrato
    def obtener(self):
        raise NotImplementedError

class TareaRepositoryImpl(TareaRepository):  # implementación concreta
    def obtener(self):
        return ['Comprar leche']

class Modulo:
    # equivalente a @Provides: describe explícitamente CÓMO construir una clase externa
    def provide_retrofit(self):
        return Retrofit(base_url='https://api.miapp.com/')

    # equivalente a @Binds: solo MAPEA la interfaz a la implementación, sin lógica de construcción
    def bind_tarea_repository(self, impl: TareaRepositoryImpl) -> TareaRepository:
        return impl

modulo = Modulo()
retrofit = modulo.provide_retrofit()
print('Retrofit construido explícitamente con @Provides, base_url:', retrofit.base_url)

repo_concreto = TareaRepositoryImpl()
repo: TareaRepository = modulo.bind_tarea_repository(repo_concreto)
print('TareaRepository resuelto vía @Binds:', repo.obtener())
"
```

</details>

### Tema 3: Scopes y testing con Hilt · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir el scope correcto para una dependencia según su tiempo de vida necesario, y reemplazar un módulo real por uno de test.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás elegir el scope correcto para una dependencia según su tiempo de vida necesario, y reemplazar un módulo real por uno de test.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en scopes y testing con hilt como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que scopes y testing con hilt resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Scopes y testing con Hilt se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Scopes y testing con Hilt | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses scopes y testing con hilt por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: scopes y testing con hilt funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Scopes y testing con Hilt existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve scopes y testing con hilt en tu contexto?
2. ¿Cómo sabrías que scopes y testing con hilt no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar scopes y testing con hilt?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── @Singleton ──────────────────────┐
│  UNA instancia, vive mientras la app vive │
└───────────────────────────────┘
┌── @ViewModelScoped ────────────────┐
│  UNA instancia por ViewModel,           │
│  destruida cuando ese ViewModel muere      │
└───────────────────────────────┘
┌── @UninstallModules(NetworkModule::class) ─┐
│  reemplaza el módulo real por uno de test       │
└───────────────────────────────────────┘
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/androidTest/kotlin/com/academia/android
cat > app/src/androidTest/kotlin/com/academia/android/HiltTestRunner.kt <<'EOF'
package com.academia.android

import android.app.Application
import android.content.Context
import androidx.test.runner.AndroidJUnitRunner
import dagger.hilt.android.testing.HiltTestApplication

class HiltTestRunner : AndroidJUnitRunner() {
    override fun newApplication(cl: ClassLoader?, name: String?, context: Context?): Application =
        super.newApplication(cl, HiltTestApplication::class.java.name, context)
}
EOF
cat > app/src/androidTest/kotlin/com/academia/android/TareasFlowTest.kt <<'EOF'
package com.academia.android

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import dagger.hilt.android.testing.UninstallModules
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Rule
import org.junit.Test

@HiltAndroidTest
@UninstallModules(NetworkModule::class) // desinstala el módulo de producción solo en esta prueba
class TareasFlowTest {
    @get:Rule val hiltRule = HiltAndroidRule(this)

    @Module
    @InstallIn(SingletonComponent::class) // módulo anidado: solo existe para esta clase de prueba
    object NetworkModuleDePrueba {
        @Provides
        @Singleton
        fun provideApiService(): ApiService = object : ApiService {
            override suspend fun obtenerTareas() = listOf(TareaDTO("t-1", "Tarea de prueba"))
        }
    }

    @Inject lateinit var api: ApiService

    @Before fun inyectar() = hiltRule.inject()

    @Test
    fun usaElApiServiceDePrueba() = runTest {
        assertEquals("Tarea de prueba", api.obtenerTareas().single().titulo)
    }
}
EOF
```

```bash
./gradlew :app:connectedDebugAndroidTest
```

```bash
python3 -c "
class ObjetoCostoso:
    contador_de_construcciones = 0
    def __init__(self):
        ObjetoCostoso.contador_de_construcciones += 1

class ContenedorSingleton:
    def __init__(self):
        self._instancia = None
    def obtener(self):
        if self._instancia is None:
            self._instancia = ObjetoCostoso()
        return self._instancia

class ContenedorSinCache:  # equivalente a un scope corto sin reutilización
    def obtener(self):
        return ObjetoCostoso()

ObjetoCostoso.contador_de_construcciones = 0
singleton = ContenedorSingleton()
for _ in range(5):
    singleton.obtener()
print('con @Singleton, construcciones tras 5 solicitudes:', ObjetoCostoso.contador_de_construcciones)

ObjetoCostoso.contador_de_construcciones = 0
sin_cache = ContenedorSinCache()
for _ in range(5):
    sin_cache.obtener()
print('SIN singleton (scope corto), construcciones tras 5 solicitudes:', ObjetoCostoso.contador_de_construcciones)
"
```

</details>
