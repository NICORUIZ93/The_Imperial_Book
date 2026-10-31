# Módulo 11: Publicación en App Store


**Proyecto del módulo:** crea una vez en Xcode (File ▸ New ▸ Project ▸ App, interfaz SwiftUI) un proyecto llamado `RutaFlowApp`; cada tema reutiliza ese proyecto, pega su código y compila.

## Aprende construyendo

### Tema 1: Certificados y provisioning profiles

#### Paso 1 · Objetivo y preparación
Al finalizar vas a configurar firma automática para la app de RutaFlow (`com.rutaflow.conductor`) y a generar un Archive válido con un certificado de distribución. Prerrequisitos: cuenta de Apple Developer, Módulo 10 completo.

#### Paso 2 · Contexto y caso real
La app de RutaFlow corre perfecto en el simulador, pero subirla a TestFlight para que los conductores reales la prueben exige un certificado de distribución, no el certificado de desarrollo que usás día a día en tu propio iPhone.

#### Paso 3 · Teoría, modelo mental y analogía
Un certificado identifica al firmante; un provisioning profile vincula ese certificado con el App ID y, en desarrollo, los dispositivos autorizados — un pase de acceso temporal frente a una autorización de circulación pública más amplia.

#### Paso 4 · Demostración guiada desde cero
```text
1. En Xcode, Signing & Capabilities -> activá "Automatically manage signing"
2. Bundle Identifier: com.rutaflow.conductor
3. Elegí tu Team (cuenta de Apple Developer)
4. Product > Archive
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: Xcode genera y descarga automáticamente un certificado de distribución y un provisioning profile que vinculan tu Team, `com.rutaflow.conductor` y las capacidades habilitadas (por ejemplo, Push Notifications); el Archive se completa sin errores de firma.

#### Paso 5 · Práctica guiada
Pista: cambiá el Bundle Identifier a `com.rutaflow.conductor.test` sin crear un nuevo App ID en tu cuenta de desarrollador — ese es el fallo deliberado: Xcode no encuentra ningún provisioning profile válido para ese identificador nuevo, y el Archive falla con un error de firma que señala exactamente el identificador que no coincide con ningún perfil existente.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo el Bundle Identifier a `com.rutaflow.conductor`, y agregá la capability de Push Notifications en Signing & Capabilities — confirmá que Xcode regenera automáticamente el provisioning profile para incluir esa nueva capacidad, sin que tengas que crearlo manualmente.

#### Paso 7 · Cierre
Entregá el Archive válido del Paso 4, el error de firma del Paso 5, y la capability agregada del Paso 6; explicá con tus propias palabras qué vincula exactamente un provisioning profile (certificado + App ID + capacidades, y en desarrollo, dispositivos). Siguiente paso: estudia cómo archivar y subir a TestFlight. Errores comunes: compartir certificados entre proyectos sin necesidad, cambiar el Bundle Identifier sin crear el App ID correspondiente, y versionar certificados o perfiles en el repositorio. Fuentes oficiales: https://developer.apple.com/help/account/ y https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases.
**¿Por qué es importante?** Porque un provisioning profile inválido o faltante es la causa más común de que un Archive no se pueda firmar ni subir, y entender qué vincula exactamente evita adivinar la solución.
**Conceptos clave:** distinción entre desarrollo y distribución, vínculo entre identidad, app y dispositivos autorizados.

Un certificado de **desarrollo** firma builds destinados a correr en dispositivos físicos específicamente registrados durante el desarrollo activo, permitiendo probar la app en un iPhone o iPad real del propio equipo antes de cualquier distribución más amplia; un certificado de **distribución** firma builds destinados a TestFlight y a la App Store, un nivel de firma distinto que autoriza la distribución más allá del círculo cerrado de dispositivos de desarrollo registrados manualmente. El provisioning profile vincula estos tres elementos en un único artefacto: el certificado (la identidad criptográfica del desarrollador o la organización), el App ID (el identificador único de la app específica), y, en el caso de perfiles de desarrollo, la lista explícita de dispositivos físicos autorizados a instalar ese build.

Xcode, con la opción "Automatically manage signing" habilitada, gestiona automáticamente la mayor parte de esta configuración para proyectos individuales o equipos pequeños, generando y renovando certificados y perfiles según sea necesario sin intervención manual constante; equipos más grandes o con requisitos de firma más específicos (por ejemplo, distribución empresarial interna fuera de la App Store pública) suelen gestionar estos artefactos manualmente con mayor control.

**Analogía:** un certificado de desarrollo es como un pase de acceso temporal válido únicamente para un grupo específico de personas ya identificadas de antemano; un certificado de distribución es como una autorización de circulación pública más amplia, válida para cualquier destinatario que la reciba a través de un canal oficial de distribución (TestFlight, App Store), sin necesidad de registrar de antemano a cada destinatario individual.

**¿Por qué es importante?** Distinguir certificado de desarrollo de certificado de distribución determina qué builds pueden correr únicamente en dispositivos registrados manualmente frente a builds distribuibles más ampliamente a través de TestFlight o la App Store.

**Diagrama:**

```
Certificado de desarrollo   → builds para dispositivos registrados manualmente durante desarrollo
Certificado de distribución → builds para TestFlight y App Store
Provisioning profile        → vincula certificado + App ID + dispositivos autorizados
```

* Ejecutar: `swift test`
* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: en el proyecto integrador RutaFlow, firma la app con un perfil de desarrollo y documenta el equipo.

### Tema 2: Archivar, subir y TestFlight

#### Paso 1 · Objetivo y preparación
Al finalizar vas a subir el Archive de RutaFlow a App Store Connect y a agregarte como tester interno en TestFlight. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
El Archive del Tema 1 ya existe en tu Mac, pero ningún conductor puede probarlo todavía: necesita subirse a App Store Connect y distribuirse mediante TestFlight antes de que alguien fuera de tu Mac pueda instalarlo.

#### Paso 3 · Teoría, modelo mental y analogía
Archive produce un artefacto firmado localmente; subirlo a App Store Connect lo procesa y lo pone a disposición de testers internos sin revisión previa, o externos con una revisión beta más liviana que la revisión completa de la App Store.

#### Paso 4 · Demostración guiada desde cero
```text
1. Window > Organizer -> seleccioná el Archive del Tema 1
2. Distribute App > App Store Connect > Upload
3. En App Store Connect, esperá a que el build termine de procesarse
4. TestFlight > Internal Testing -> agregate como tester
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: tras unos minutos de procesamiento, el build aparece disponible en la pestaña de TestFlight de App Store Connect, y podés instalarlo en tu propio iPhone a través de la app TestFlight sin pasar por ninguna revisión de Apple, por ser testing interno.

#### Paso 5 · Práctica guiada
Pista: intentá subir el mismo Archive una segunda vez sin incrementar `CFBundleVersion` — ese es el fallo deliberado: App Store Connect rechaza la subida, porque ya existe un build previo con ese mismo número de versión y Apple exige que cada subida sea estrictamente incremental.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 incrementando `CFBundleVersion`, generando un nuevo Archive y subiéndolo; una vez procesado, agregá un segundo tester interno (otro miembro del equipo) y confirmá que recibe la invitación para instalar el build desde TestFlight.

#### Paso 7 · Cierre
Entregá el build disponible en TestFlight del Paso 4, el rechazo por versión duplicada del Paso 5, y el segundo tester agregado del Paso 6; explicá por qué probar con TestFlight antes de enviar a revisión de la App Store reduce el riesgo de que un conductor real sea el primero en encontrar un bug grave. Siguiente paso: estudia qué metadata necesita completarse antes de la revisión. Errores comunes: subir sin incrementar el número de build, no probar el build subido antes de promoverlo a revisión, y agregar testers externos sin completar antes la revisión beta que Apple exige para ese grupo. Fuentes oficiales: https://developer.apple.com/testflight/ y https://developer.apple.com/help/app-store-connect/.
**¿Por qué es importante?** Porque probar con TestFlight antes de la revisión de la App Store detecta problemas con un grupo controlado de impacto limitado, en vez de descubrirlos directamente en producción.
**Conceptos clave:** proceso formal de empaquetado, validación beta con impacto limitado antes de producción.

```
Product → Archive → Distribute App → App Store Connect
```

Archivar la app en Xcode (`Product → Archive`) produce un artefacto de build de release completamente optimizado y firmado con el certificado de distribución, listo para subirse a través del asistente de distribución directamente hacia App Store Connect, el portal centralizado donde Apple procesa, valida y eventualmente distribuye ese build hacia testers o hacia la App Store pública.

Tras subir el build, este se procesa automáticamente en App Store Connect y queda disponible en TestFlight para testers internos (miembros del propio equipo de desarrollo, hasta 100 personas, sin ninguna revisión previa de Apple requerida para este grupo específico) o testers externos (público más amplio fuera del equipo, que sí requiere pasar por una revisión beta de Apple, más ligera y rápida que la revisión completa exigida para la App Store pública); probar exhaustivamente con TestFlight antes de enviar la app a la revisión completa de la App Store permite detectar problemas (crashes, bugs de UX, malas primeras impresiones) con un grupo controlado y de impacto limitado, evitando que esos mismos problemas se descubran directamente en producción frente a la totalidad de usuarios potenciales.

**Analogía:** TestFlight es como una función de preestreno limitada antes del estreno oficial en cines: permite recoger reacciones y corregir problemas con una audiencia reducida y controlada, antes de exponer la obra completa al público general en el estreno definitivo (la App Store).

**¿Por qué es importante?** Probar con TestFlight antes de enviar a revisión de la App Store detecta problemas con un grupo controlado de impacto limitado, evitando que esos mismos problemas se descubran directamente en producción frente a la totalidad de usuarios potenciales.

**Diagrama:**

```
Xcode Archive → App Store Connect → TestFlight (testers internos/externos) → revisión de Apple → App Store pública
```

* Ejecutar: `swift test`
* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: en el proyecto integrador RutaFlow, archiva la app y súbela a TestFlight con una nota de prueba.

### Tema 3: Metadata y versionado

#### Paso 1 · Objetivo y preparación
Al finalizar vas a completar la metadata obligatoria de RutaFlow en App Store Connect (descripción, capturas, política de privacidad) e incrementar correctamente su versionado. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
El build de RutaFlow ya está en TestFlight, pero promoverlo a revisión de la App Store exige completar metadata que Apple nunca pidió para TestFlight interno: política de privacidad, capturas y el cuestionario de privacidad.

#### Paso 3 · Teoría, modelo mental y analogía
`CFBundleShortVersionString` es la versión visible al usuario (semver); `CFBundleVersion` es el número de build interno, que debe incrementarse estrictamente en cada subida — un nombre comercial visible frente a un número de serie interno.
**Conceptos clave:** información obligatoria para la revisión, dos identificadores con propósitos distintos.

App Store Connect requiere completar metadata específica antes de que Apple revise la app: descripción y palabras clave (relevantes para el descubrimiento en la búsqueda de la App Store), capturas de pantalla por cada tamaño de dispositivo soportado, una política de privacidad (obligatoria sin excepción para cualquier app publicada), y la clasificación de edad junto con las respuestas del cuestionario de privacidad que declara explícitamente qué datos recolecta la app y con qué propósito, información que Apple usa para mostrar la etiqueta de privacidad visible a los usuarios antes de descargar la app.

```
CFBundleShortVersionString: 1.3.0   ← versión visible (semver)
CFBundleVersion: 42                  ← número de build, debe incrementar en cada subida
```

`CFBundleShortVersionString` (la versión visible al usuario, típicamente semver) y `CFBundleVersion` (el número de build interno, que debe incrementarse estrictamente en cada subida a App Store Connect) cumplen roles análogos a `versionName` y `versionCode` en Android (Módulo 11 de ese track): uno comunica de forma legible la magnitud del cambio al usuario, el otro es el mecanismo técnico interno que la plataforma usa para ordenar builds inequívocamente y rechazar subidas no incrementales.

**Analogía:** la metadata de App Store Connect es como el expediente completo requerido antes de una inspección oficial: sin cada documento obligatorio (política de privacidad, declaración de qué se recolecta), la inspección ni siquiera puede comenzar formalmente; `CFBundleVersion` es como el número de serie interno incremental de cada lote de producción, mientras `CFBundleShortVersionString` es el nombre comercial visible al consumidor final.

**¿Por qué es importante?** La metadata obligatoria (especialmente la política de privacidad y el cuestionario de privacidad) es un requisito no negociable antes de la revisión; el versionado dual (build interno incremental, versión visible semver) cumple roles distintos y complementarios, igual que en Android.

**Diagrama: dos identificadores, dos propósitos**

```mermaid
flowchart LR
    A["CFBundleVersion: 42 → 43"] --> B["Build interno:\nSIEMPRE incrementa, invisible al usuario"]
    C["CFBundleShortVersionString: 1.3.0 → 1.3.1"] --> D["Versión visible:\nsolo cambia si el cambio se percibe"]
```

En el proyecto integrador RutaFlow, estos valores se configuran en el target de `examples/rutaflow/ios/RutaFlowApp.swift` dentro de Xcode. Antes de archivar, verificá la toolchain con:

```bash
swift --version
```

Práctica: incrementá ambos identificadores para un cambio visible real en tu proyecto propio y confirmá en App Store Connect que el build nuevo aparece disponible para enviar a revisión.

**Diagrama:**

```
CFBundleShortVersionString: "1.3.0"   → visible al usuario, semver
CFBundleVersion: "42"                  → SIEMPRE incremental, uso interno de Apple
```

---

#### Paso 4 · Demostración guiada desde cero
```text
CFBundleShortVersionString: 1.3.0   ← versión visible (semver), cambia por release
CFBundleVersion: 42                  ← número de build, SIEMPRE incremental
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

En App Store Connect: completá descripción, palabras clave, capturas por tamaño de dispositivo, política de privacidad (URL obligatoria) y el cuestionario de privacidad (qué datos recolecta RutaFlow: ubicación del conductor, para el tracking de entregas).

Resultado esperado: App Store Connect solo habilita enviar a revisión cuando todos los campos obligatorios están completos; si falta la política de privacidad o el cuestionario, el botón de enviar a revisión queda deshabilitado con el campo faltante señalado explícitamente.

#### Paso 5 · Práctica guiada
Pista: subí un nuevo build incrementando `CFBundleVersion` a 43, pero dejá `CFBundleShortVersionString` igual en "1.3.0" — ese es el fallo deliberado: App Store Connect acepta el build (porque el número de build sí es mayor), pero los usuarios que ya tienen "1.3.0" instalado no ven ninguna razón visible para actualizar, porque la versión visible no cambió aunque el contenido sí.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 incrementando también `CFBundleShortVersionString` a "1.3.1" cuando el cambio sea visible para el usuario, y documentá en el changelog de App Store Connect qué cambió en esta versión respecto a la anterior.

#### Paso 7 · Cierre
Entregá la metadata completa del Paso 4, la confusión de versión detectada en el Paso 5, y el changelog del Paso 6; explicá la diferencia entre incrementar solo `CFBundleVersion` (necesario en cada subida, invisible para el usuario) e incrementar también `CFBundleShortVersionString` (cuando el cambio es visible y merece comunicarse). Siguiente paso: estudia cómo automatizar este proceso con CI. Errores comunes: olvidar incrementar `CFBundleVersion` antes de subir, cambiar la versión visible sin que el cambio lo justifique, y omitir la política de privacidad o el cuestionario de privacidad. Fuentes oficiales: https://developer.apple.com/help/app-store-connect/ y https://developer.apple.com/documentation/bundleresources/information-property-list/cfbundleversion.
**¿Por qué es importante?** Porque la metadata obligatoria (especialmente la política de privacidad) es un requisito no negociable antes de la revisión, y confundir versión de build con versión visible comunica mal los cambios al usuario.

## Laboratorio práctico

**Objetivo del laboratorio:** subir un build a TestFlight listo para pruebas internas.

**Requisitos previos:** Módulo 10 completado, cuenta de desarrollador de Apple.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Configurar certificado de distribución y provisioning profile | Ver Tema 1 | En la cuenta de desarrollador |
| 2 | Archivar y subir a App Store Connect | `Product → Archive` | Ver Tema 2 |
| 3 | Configurar un grupo de pruebas en TestFlight | App Store Connect | Agregarse como tester |
| 4 | Completar la metadata básica | Ver Tema 3 | Descripción, capturas, política de privacidad |
| 5 | Incrementar el número de build antes de subir | Ver Tema 3 | `CFBundleVersion` |

**Verificación:** el laboratorio se considera exitoso si el build se procesa correctamente en App Store Connect y queda disponible en TestFlight para el grupo de pruebas internas configurado, sin errores de validación de metadata o firma.

**Errores comunes y soluciones**

- **Firmar con un certificado de desarrollo en vez de distribución para subir a TestFlight.** TestFlight requiere específicamente un certificado de distribución.
- **Olvidar incrementar `CFBundleVersion` antes de una nueva subida.** App Store Connect rechaza el build si no es estrictamente mayor al ya subido.
- **Omitir la política de privacidad o el cuestionario de privacidad.** Son requisitos obligatorios antes de que la revisión pueda proceder.

---

* Ejecutar: `swift test`
* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: en el proyecto integrador RutaFlow, define versión y build y registra qué cambia en cada entrega.
