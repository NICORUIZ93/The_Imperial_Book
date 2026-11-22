# Módulo 11: Publicación en Google Play


## Aprende construyendo


### Tema 1: Firma de la app · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás generar una keystore real, configurar la firma de un build de release leyendo credenciales desde variables de entorno, y explicar por qué perder la keystore original es en gran medida irreversible.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás generar una keystore real, configurar la firma de un build de release leyendo credenciales desde variables de entorno, y explicar por qué perder la keystore original es en gran medida irreversible.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en firma de la app como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que firma de la app resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Firma de la app se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Firma de la app | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses firma de la app por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: firma de la app funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Firma de la app existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve firma de la app en tu contexto?
2. ¿Cómo sabrías que firma de la app no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar firma de la app?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── tu clave de subida (academia-upload.jks) ──┐
│  firma el .aab que subes a Play Console          │
└──────────┬─────────────────────────────┘
           │ Play comprueba la clave de subida
           ▼
┌── Play App Signing (clave de firma de la app) ┐
│  Google firma los APK que instalan los usuarios    │
│  clave de subida perdida → restablecimiento        │
└───────────────────────────────────────────┘
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p "$HOME/claves-android"                        # fuera del proyecto: nunca se sube a Git
export KEYSTORE_PATH="$HOME/claves-android/academia-upload.jks"
export KEYSTORE_PASSWORD="clave-de-prueba-academia"
export KEY_PASSWORD="clave-de-prueba-academia"
keytool -genkeypair -v -keystore "$KEYSTORE_PATH" -alias subida \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass "$KEYSTORE_PASSWORD" -keypass "$KEY_PASSWORD" \
  -dname "CN=The Imperial Book, OU=Desarrollo, O=Academia, L=Ciudad, S=Estado, C=CL"
# por si alguien copia una clave dentro del proyecto, que Git la ignore
grep -qx '*.jks' .gitignore 2>/dev/null || echo '*.jks' >> .gitignore
```

```kotlin
android {
    // ...lo que ya tienes...
    signingConfigs {
        create("release") {
            storeFile = System.getenv("KEYSTORE_PATH")?.let { file(it) }
            storePassword = System.getenv("KEYSTORE_PASSWORD")
            keyAlias = "subida"
            keyPassword = System.getenv("KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            // ...lo que ya tienes (isMinifyEnabled, proguardFiles)...
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

```bash
./gradlew :app:bundleRelease
keytool -printcert -jarfile app/build/outputs/bundle/release/app-release.aab | grep "SHA256:"
```

```bash
keytool -list -v -keystore "$KEYSTORE_PATH" -alias subida -storepass "$KEYSTORE_PASSWORD" | grep "SHA256:"
```

```bash
keytool -list -v -keystore "$HOME/claves-android/otra.jks" -alias subida -storepass "otra-clave" | grep "SHA256:"
keytool -list -v -keystore "$KEYSTORE_PATH" -alias subida -storepass "$KEYSTORE_PASSWORD" | grep "SHA256:"
```

</details>

### Tema 2: App Bundle vs APK · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar por qué Google Play requiere un App Bundle en vez de un APK universal, y cómo eso reduce el tamaño de descarga real por dispositivo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás explicar por qué Google Play requiere un App Bundle en vez de un APK universal, y cómo eso reduce el tamaño de descarga real por dispositivo.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en app bundle vs apk como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que app bundle vs apk resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| App Bundle vs APK se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar App Bundle vs APK | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses app bundle vs apk por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: app bundle vs apk funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- App Bundle vs APK existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve app bundle vs apk en tu contexto?
2. ¿Cómo sabrías que app bundle vs apk no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar app bundle vs apk?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── app-release.aab (UN único artefacto) ──────┐
└──────────┬─────────────────────────────┘
           │ Google Play genera automáticamente
     ┌─────┼──────────┬──────────────┐
     ▼                 ▼               ▼
APK (ARM64,      APK (x86,        APK (ARM64,
 español,          inglés,          portugués,
 xxhdpi)           hdpi)            xhdpi)
```

```bash
# modela lo que Gradle produciría con ./gradlew bundleRelease, antes de medir el efecto real
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src
mkdir -p simulacion-bundle/recursos-es simulacion-bundle/recursos-en simulacion-bundle/recursos-pt
# genera contenido real (no solo metadatos) para medir tamaño real en disco
for idioma in es en pt; do
  head -c $((50 * 1024)) /dev/urandom > "simulacion-bundle/recursos-$idioma/strings.dat"
done
cat simulacion-bundle/recursos-es/strings.dat simulacion-bundle/recursos-en/strings.dat simulacion-bundle/recursos-pt/strings.dat > simulacion-bundle/apk-universal-simulado.dat
ls -la simulacion-bundle/*.dat simulacion-bundle/recursos-*/*.dat
```

```bash
./gradlew assembleDebug
./gradlew test
```

```bash
tamano_universal=$(stat -c%s simulacion-bundle/apk-universal-simulado.dat 2>/dev/null || stat -f%z simulacion-bundle/apk-universal-simulado.dat)
tamano_optimizado=$(stat -c%s simulacion-bundle/recursos-es/strings.dat 2>/dev/null || stat -f%z simulacion-bundle/recursos-es/strings.dat)
echo "tamaño del 'APK universal' (los 3 idiomas): $tamano_universal bytes"
echo "tamaño del 'APK optimizado' (solo español, generado por Play): $tamano_optimizado bytes"
awk -v u="$tamano_universal" -v o="$tamano_optimizado" 'BEGIN { printf "reducción real: %.1f%%\n", (1 - o/u) * 100 }'
```

</details>

### Tema 3: Versionado, tracks y políticas · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás distinguir versionCode de versionName, y explicar el propósito de los tracks progresivos de validación en Play Console.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás distinguir versionCode de versionName, y explicar el propósito de los tracks progresivos de validación en Play Console.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en versionado, tracks y políticas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que versionado, tracks y políticas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Versionado, tracks y políticas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Versionado, tracks y políticas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses versionado, tracks y políticas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: versionado, tracks y políticas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Versionado, tracks y políticas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve versionado, tracks y políticas en tu contexto?
2. ¿Cómo sabrías que versionado, tracks y políticas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar versionado, tracks y políticas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── versionCode: 11 → 12 → 13 ── entero, SIEMPRE incremental, uso interno de Play ┐
└─────────────────────────────────────────────────────────┘
┌── versionName: "1.2.0" → "1.3.0" ── string semver, visible al usuario ────────┐
└─────────────────────────────────────────────────────────┘
┌── Pruebas internas → Pruebas cerradas → Pruebas abiertas → Producción ────────┐
└─────────────────────────────────────────────────────────┘
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app
cat > app/build.gradle.kts.fragmento-version <<'EOF'
android {
    defaultConfig {
        versionCode = 12
        versionName = "1.3.0"
    }
}
EOF
version_code=$(grep -oE 'versionCode = [0-9]+' app/build.gradle.kts.fragmento-version | grep -oE '[0-9]+')
version_name=$(grep -oE 'versionName = "[^"]+"' app/build.gradle.kts.fragmento-version | sed -E 's/versionName = "(.*)"/\1/')
echo "versionCode actual: $version_code"
echo "versionName actual: $version_name"
if [[ "$version_name" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "versionName sigue semver correctamente (MAJOR.MINOR.PATCH)"
else
  echo "versionName NO sigue MAJOR.MINOR.PATCH" >&2
  exit 1
fi
```

```bash
./gradlew assembleDebug
./gradlew test
```

```bash
releases_ya_publicados=(10 11 12)  # versionCode ya subidos a Play

play_console_acepta_upload() {
  local nuevo_version_code="$1"
  local ultimo_publicado=0
  for vc in "${releases_ya_publicados[@]}"; do
    (( vc > ultimo_publicado )) && ultimo_publicado=$vc
  done
  (( nuevo_version_code > ultimo_publicado ))
}

for candidato in 12 13 5; do
  if play_console_acepta_upload "$candidato"; then
    echo "versionCode $candidato: ACEPTADO"
  else
    echo "versionCode $candidato: RECHAZADO"
  fi
done
```

</details>
