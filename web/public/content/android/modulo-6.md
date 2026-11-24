# Módulo 6: Inyección de dependencias con Hilt


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


### Tema 1: Configuración básica de Hilt · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás anotar una Application y un ViewModel con Hilt, y explicar por qué la inyección de dependencias evita que cada clase conozca cómo construir sus propias dependencias.

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
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/MiApp.kt`:

```kotlin
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
```

```bash
./gradlew :app:compileDebugKotlin
```

</details>

### Tema 2: @Provides y @Binds · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás decidir entre @Provides y @Binds según si una dependencia es una clase externa o una interfaz propia con implementación inyectable.

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
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/NetworkModule.kt`:

```kotlin
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
```

```bash
./gradlew :app:compileDebugKotlin
```

</details>

### Tema 3: Scopes y testing con Hilt · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir el scope correcto para una dependencia según su tiempo de vida necesario, y reemplazar un módulo real por uno de test.

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
```

Crea el archivo `app/src/androidTest/kotlin/com/academia/android/HiltTestRunner.kt`:

```kotlin
package com.academia.android

import android.app.Application
import android.content.Context
import androidx.test.runner.AndroidJUnitRunner
import dagger.hilt.android.testing.HiltTestApplication

class HiltTestRunner : AndroidJUnitRunner() {
    override fun newApplication(cl: ClassLoader?, name: String?, context: Context?): Application =
        super.newApplication(cl, HiltTestApplication::class.java.name, context)
}
```

Crea el archivo `app/src/androidTest/kotlin/com/academia/android/TareasFlowTest.kt`:

```kotlin
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
```

```bash
./gradlew :app:connectedDebugAndroidTest
```

</details>
