# Módulo 5: Persistencia local con Room


## Aprende construyendo

> **Antes de empezar este módulo.** Room genera código con KSP y verifica tus consultas al compilar, así que necesita dos plugins además de las bibliotecas. Con el catálogo del Módulo 0 (Tema 3):
>
> ```kotlin
> // build.gradle.kts de la raíz, dentro de plugins { }
> alias(libs.plugins.ksp) apply false
> alias(libs.plugins.room) apply false
>
> // app/build.gradle.kts
> plugins {
>     // ...los que ya tienes...
>     alias(libs.plugins.ksp)
>     alias(libs.plugins.room)
> }
> android {
>     // ...lo que ya tienes...
> }
> room {
>     schemaDirectory("$projectDir/schemas")   // obligatorio con el plugin de Room
> }
> dependencies {
>     // ...las que ya tienes...
>     implementation(libs.androidx.room.runtime)
>     ksp(libs.androidx.room.compiler)
>     androidTestImplementation(libs.androidx.room.testing)
> }
> ```
>
> Pulsa **Sync Now**. Desde Room 2.7, `room-ktx` está integrado en `room-runtime` y no hace falta declararlo.


### Tema 1: Entities, DAOs y Database · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás declarar una @Entity, un @Dao y una @Database de Room, y explicar por qué Room verifica las queries en tiempo de compilación.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── @Entity Tarea ────────────────────┐
│  data class Tarea(id, titulo, completada) │
└──────────┬───────────────────────┘
           │ Room genera la tabla SQL real
           ▼
┌── @Dao TareaDao ────────────────────┐
│  @Query("SELECT * FROM Tarea")            │
│  verificado en COMPILACIÓN, no en runtime    │
└───────────────────────────────────┘
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/AppDatabase.kt`:

```kotlin
package com.academia.android

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import kotlinx.coroutines.flow.Flow

@Entity
data class Tarea(@PrimaryKey val id: String, val titulo: String, val completada: Boolean)

@Dao
interface TareaDao {
    @Query("SELECT * FROM Tarea")
    fun observarTodas(): Flow<List<Tarea>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertar(tarea: Tarea)
}

@Database(entities = [Tarea::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun tareaDao(): TareaDao
}
```

```bash
./gradlew assembleDebug
./gradlew test
```

</details>

### Tema 2: Room + Flow reactivo, y migraciones · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar por qué un DAO que devuelve Flow mantiene la UI sincronizada automáticamente, y escribir una migración que preserve datos existentes.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Room table cambia (insert/update/delete) ──┐
└──────────┬─────────────────────────┘
           │ Flow emite automáticamente la nueva lista
           ▼
┌── StateFlow del ViewModel se actualiza ──────┐
└──────────┬─────────────────────────┘
           │
           ▼
┌── UI recompone (Módulo 2) ───────────────────┐
└───────────────────────────────────────┘
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/Migraciones.kt`:

```kotlin
package com.academia.android

import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase

val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE Tarea ADD COLUMN prioridad INTEGER NOT NULL DEFAULT 0")
    }
}
```

```bash
./gradlew assembleDebug
./gradlew test
```

</details>

### Tema 3: Estrategia offline-first · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás implementar un repositorio donde la UI siempre lee del caché local mientras la red sincroniza en segundo plano.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── UI ──────────────┐
│  SIEMPRE lee de       │
└──────────┬─────────┘
           ▼
┌── Room (Flow reactivo) ──────┐
│         ▲                          │
│         │ Repositorio sincroniza      │
│         │ en background                 │
│         ▼                                 │
└── API remota (Módulo 5) ───────────┘
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/TareaRepository.kt`:

```kotlin
package com.academia.android

import kotlinx.coroutines.flow.Flow

interface TareaRepository {
    val tareas: Flow<List<Tarea>> // la UI SIEMPRE lee de aquí
    suspend fun sincronizar()
}

class TareaRepositoryImpl(private val dao: TareaDao, private val api: ApiService) : TareaRepository {
    override val tareas: Flow<List<Tarea>> = dao.observarTodas()

    override suspend fun sincronizar() {
        val remotas = api.obtenerTareas()
        remotas.forEach { dao.insertar(Tarea(it.id, it.titulo, false)) } // sincroniza en background
    }
}
```

```bash
./gradlew assembleDebug
./gradlew test
```

</details>
