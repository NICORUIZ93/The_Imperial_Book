# Módulo 6: Persistencia local con Room


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
>
> **Los scripts `python3` con `sqlite3` de este módulo son modelos del SQL, no pruebas de Room.** Demuestran qué hace la sentencia SQL, pero no que tu `@Entity`, tu DAO o tu `Migration` compilen y se apliquen. La evidencia real es la **Verificación real en Android** de cada tema: la compilación con KSP, el esquema exportado y la app en el emulador.


### Tema 1: Entities, DAOs y Database · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás declarar una @Entity, un @Dao y una @Database de Room, y explicar por qué Room verifica las queries en tiempo de compilación.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás declarar una @Entity, un @Dao y una @Database de Room, y explicar por qué Room verifica las queries en tiempo de compilación.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en entities, daos y database como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que entities, daos y database resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Entities, DAOs y Database se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Entities, DAOs y Database | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses entities, daos y database por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: entities, daos y database funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Entities, DAOs y Database existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve entities, daos y database en tu contexto?
2. ¿Cómo sabrías que entities, daos y database no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar entities, daos y database?

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
# Este script python3 (vía sqlite3) es un modelo del esquema SQL equivalente; la prueba real es compilar con Room
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
python3 -c "
import sqlite3
# el esquema equivalente que Room generaría a partir de la @Entity Tarea
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY NOT NULL, titulo TEXT NOT NULL, completada INTEGER NOT NULL)')
con.execute(\"INSERT INTO Tarea VALUES ('1', 'Comprar leche', 0)\")
filas = con.execute('SELECT * FROM Tarea').fetchall()
print('esquema válido, filas:', filas)
con.close()
"
```

```bash
./gradlew assembleDebug
./gradlew test
```

```bash
python3 -c "
import sqlite3
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)')
try:
    con.execute('SELECT columnaInexistente FROM Tarea').fetchall()
    print('la query se ejecutó sin error (INESPERADO)')
except sqlite3.OperationalError as e:
    print('SQLite rechazó la query:', e)
con.close()
"
```

</details>

### Tema 2: Room + Flow reactivo, y migraciones · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar por qué un DAO que devuelve Flow mantiene la UI sincronizada automáticamente, y escribir una migración que preserve datos existentes.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás explicar por qué un DAO que devuelve Flow mantiene la UI sincronizada automáticamente, y escribir una migración que preserve datos existentes.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en room + flow reactivo, y migraciones como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que room + flow reactivo, y migraciones resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Room + Flow reactivo, y migraciones se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Room + Flow reactivo, y migraciones | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses room + flow reactivo, y migraciones por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: room + flow reactivo, y migraciones funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Room + Flow reactivo, y migraciones existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve room + flow reactivo, y migraciones en tu contexto?
2. ¿Cómo sabrías que room + flow reactivo, y migraciones no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar room + flow reactivo, y migraciones?

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
# Este script python3 (vía sqlite3) modela el SQL de la migración; la prueba real se hace en el emulador
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
python3 -c "
import sqlite3
con = sqlite3.connect(':memory:')
# versión 1 del esquema, con datos ya existentes del usuario
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)')
con.execute(\"INSERT INTO Tarea VALUES ('1', 'Comprar leche', 0)\")
con.execute(\"INSERT INTO Tarea VALUES ('2', 'Pagar alquiler', 1)\")
print('antes de migrar:', con.execute('SELECT * FROM Tarea').fetchall())

# la migración real (idéntica a MIGRATION_1_2 en SQL)
con.execute('ALTER TABLE Tarea ADD COLUMN prioridad INTEGER NOT NULL DEFAULT 0')
print('después de migrar:', con.execute('SELECT * FROM Tarea').fetchall())
con.close()
"
```

```bash
./gradlew assembleDebug
./gradlew test
```

```bash
python3 -c "
import sqlite3
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)')
con.execute(\"INSERT INTO Tarea VALUES ('1', 'Comprar leche', 0)\")

# la app AHORA espera la columna 'prioridad' (versión 2), pero la migración nunca se aplicó
try:
    con.execute('SELECT prioridad FROM Tarea').fetchall()
    print('INESPERADO: la columna existe sin migración')
except sqlite3.OperationalError as e:
    print('Discrepancia de esquema detectada:', e)
con.close()
"
```

</details>

### Tema 3: Estrategia offline-first · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás implementar un repositorio donde la UI siempre lee del caché local mientras la red sincroniza en segundo plano.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás implementar un repositorio donde la UI siempre lee del caché local mientras la red sincroniza en segundo plano.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en estrategia offline-first como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que estrategia offline-first resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Estrategia offline-first se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Estrategia offline-first | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses estrategia offline-first por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: estrategia offline-first funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Estrategia offline-first existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve estrategia offline-first en tu contexto?
2. ¿Cómo sabrías que estrategia offline-first no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar estrategia offline-first?

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
# Este script python3 simula, con sqlite3 real, que la UI sigue funcionando sin red
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
python3 -c "
import sqlite3

con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE Tarea (id TEXT PRIMARY KEY, titulo TEXT, completada INTEGER)')

def sincronizar_desde_api_simulada(conexion_disponible):
    if not conexion_disponible:
        print('sin conexión: la sincronización no ocurre, pero la UI sigue leyendo del caché existente')
        return
    con.execute(\"INSERT OR REPLACE INTO Tarea VALUES ('1', 'Comprar leche (actualizado de la API)', 0)\")
    print('sincronización exitosa: caché actualizado con datos frescos')

def ui_lee_siempre_de_room():
    return con.execute('SELECT * FROM Tarea').fetchall()

con.execute(\"INSERT INTO Tarea VALUES ('1', 'Comprar leche (versión local)', 0)\")
print('UI muestra (antes de cualquier sincronización):', ui_lee_siempre_de_room())

sincronizar_desde_api_simulada(conexion_disponible=False)  # simula estar sin conexión
print('UI sigue mostrando (sin conexión, offline-first):', ui_lee_siempre_de_room())

sincronizar_desde_api_simulada(conexion_disponible=True)  # la conexión vuelve
print('UI muestra (tras sincronizar con éxito):', ui_lee_siempre_de_room())
con.close()
"
```

```bash
./gradlew assembleDebug
./gradlew test
```

</details>
