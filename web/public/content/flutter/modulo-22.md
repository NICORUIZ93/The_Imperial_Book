# Módulo 22: anuncios y monetización en Flutter

## Aprende construyendo

Integra anuncios en RutaFlow con límites claros: primero configuración de plataforma y anuncios de prueba, luego formatos y mediación, consentimiento, privacidad y medición. Las reglas y requisitos del proveedor cambian; antes de publicar, vuelve a verificar las políticas oficiales y las versiones del SDK. Los ejemplos no usan IDs de producción.

---


### Tema 1: configurar AdMob y cargar el primer banner de prueba · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar inicializarás Google Mobile Ads en Android/iOS y mostrarás un banner de prueba que se libera correctamente. Prerrequisitos: Flutter 3.38.1 o superior, widgets y ciclo initState/dispose. Crea flutter create admob_lab y agrega google_mobile_ads con flutter pub add goog…

#### ► LA IDEA EN UNA FRASE
**Al finalizar inicializarás Google Mobile Ads en Android/iOS y mostrarás un banner de prueba que se libera correctamente.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en configurar admob y cargar el primer banner de prueba como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que configurar admob y cargar el primer banner de prueba resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| configurar AdMob y cargar el primer banner de prueba se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar configurar AdMob y cargar el primer banner de prueba | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses configurar admob y cargar el primer banner de prueba por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: configurar admob y cargar el primer banner de prueba funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- configurar AdMob y cargar el primer banner de prueba existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve configurar admob y cargar el primer banner de prueba en tu contexto?
2. ¿Cómo sabrías que configurar admob y cargar el primer banner de prueba no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar configurar admob y cargar el primer banner de prueba?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```xml
<!-- AndroidManifest.xml, hijo de <application> -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713" />
```

```xml
<!-- Info.plist -->
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
```

```dart
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await MobileAds.instance.initialize();
  runApp(const MaterialApp(home: TestBannerPage()));
}

class TestBannerPage extends StatefulWidget {
  const TestBannerPage({super.key});
  @override
  State<TestBannerPage> createState() => _TestBannerPageState();
}

class _TestBannerPageState extends State<TestBannerPage> {
  BannerAd? _banner;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    final ad = BannerAd(
      // ID oficial de prueba para Android; usa el ID iOS en iOS.
      adUnitId: 'ca-app-pub-3940256099942544/9214589741',
      request: const AdRequest(),
      size: AdSize.banner,
      listener: BannerAdListener(
        onAdLoaded: (_) {
          if (!mounted) return;
          setState(() => _ready = true);
        },
        onAdFailedToLoad: (ad, error) {
          debugPrint('Banner no cargado: ${error.code}');
          ad.dispose();
        },
      ),
    );
    _banner = ad;
    ad.load();
  }

  @override
  void dispose() {
    _banner?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: const Center(child: Text('Resumen de la entrega')),
        bottomNavigationBar: _ready
            ? SizedBox(height: 50, child: AdWidget(ad: _banner!))
            : const SizedBox(height: 50),
      );
}
```

```bash
flutter analyze
flutter run
```

</details>

### Tema 2: elegir mediación, bidding y waterfall · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar compararás demanda directa, bidding y waterfall, y escribirás una decisión de mediación que pueda revisarse. Prerrequisitos: Tema 1 y nociones de latencia/medición. Crea docs/ad-mediation-decision.md.

#### ► LA IDEA EN UNA FRASE
**Al finalizar compararás demanda directa, bidding y waterfall, y escribirás una decisión de mediación que pueda revisarse.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en elegir mediación, bidding y waterfall como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que elegir mediación, bidding y waterfall resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| elegir mediación, bidding y waterfall se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar elegir mediación, bidding y waterfall | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses elegir mediación, bidding y waterfall por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: elegir mediación, bidding y waterfall funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- elegir mediación, bidding y waterfall existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve elegir mediación, bidding y waterfall en tu contexto?
2. ¿Cómo sabrías que elegir mediación, bidding y waterfall no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar elegir mediación, bidding y waterfall?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```markdown
| Opción | Ventaja a medir | Costo/riesgo | Evidencia necesaria |
|---|---|---|---|
| AdMob sin mediación | Menos SDKs y configuración | Una fuente principal | fill, eCPM, latencia por país |
| AdMob mediation | bidding/waterfall según fuentes | adapters y revisión de compatibilidad | mismos formatos y periodo |
| Unity LevelPlay | mediación y suite de integración | SDK, adapters, privacidad y soporte | pruebas de adapters + métricas |
```

```bash
flutter pub add unity_levelplay_mediation
flutter pub get
flutter analyze
```

</details>

### Tema 3: banners, interstitials y anuncios recompensados · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar implementarás reglas de ubicación y ciclo de vida para banner, interstitial y rewarded sin interrumpir acciones críticas. Prerrequisitos: Tema 1 y navegación Flutter. Crea lib/ads/ad_policy.dart.

#### ► LA IDEA EN UNA FRASE
**Al finalizar implementarás reglas de ubicación y ciclo de vida para banner, interstitial y rewarded sin interrumpir acciones críticas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en banners, interstitials y anuncios recompensados como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que banners, interstitials y anuncios recompensados resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| banners, interstitials y anuncios recompensados se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar banners, interstitials y anuncios recompensados | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses banners, interstitials y anuncios recompensados por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: banners, interstitials y anuncios recompensados funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- banners, interstitials y anuncios recompensados existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve banners, interstitials y anuncios recompensados en tu contexto?
2. ¿Cómo sabrías que banners, interstitials y anuncios recompensados no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar banners, interstitials y anuncios recompensados?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```dart
enum AdPlacement { summaryBanner, sessionEnd, routeInProgress, emergency }
enum AdFormat { banner, interstitial, rewarded }

bool canShowAd(AdPlacement placement, AdFormat format) {
  if (placement == AdPlacement.routeInProgress ||
      placement == AdPlacement.emergency) {
    return false;
  }
  if (format == AdFormat.interstitial) {
    return placement == AdPlacement.sessionEnd;
  }
  if (format == AdFormat.rewarded) {
    return placement == AdPlacement.summaryBanner;
  }
  return placement == AdPlacement.summaryBanner;
}

bool grantReward({required bool callbackReceived}) => callbackReceived;
```

```dart
import 'package:google_mobile_ads/google_mobile_ads.dart';

void showRewarded(RewardedAd ad, void Function(RewardItem) onDone) {
  ad.fullScreenContentCallback = FullScreenContentCallback(
    onAdDismissedFullScreenContent: (closedAd) => closedAd.dispose(),
    onAdFailedToShowFullScreenContent: (failedAd, error) => failedAd.dispose(),
  );
  ad.show(onUserEarnedReward: (adWithoutView, reward) {
    onDone(reward); // Solo aquí se solicita otorgar la recompensa.
  });
}
```

```bash
flutter test test/ads/ad_policy_test.dart
```

</details>

### Tema 4: pruebas de anuncios y diagnóstico de no-fill · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar separarás prueba local, validación de adapter e inventario de producción. Prerrequisitos: temas 1 y 2. Crea docs/ad-test-matrix.md.

#### ► LA IDEA EN UNA FRASE
**Al finalizar separarás prueba local, validación de adapter e inventario de producción.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en pruebas de anuncios y diagnóstico de no-fill como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que pruebas de anuncios y diagnóstico de no-fill resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| pruebas de anuncios y diagnóstico de no-fill se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar pruebas de anuncios y diagnóstico de no-fill | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses pruebas de anuncios y diagnóstico de no-fill por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: pruebas de anuncios y diagnóstico de no-fill funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- pruebas de anuncios y diagnóstico de no-fill existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve pruebas de anuncios y diagnóstico de no-fill en tu contexto?
2. ¿Cómo sabrías que pruebas de anuncios y diagnóstico de no-fill no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar pruebas de anuncios y diagnóstico de no-fill?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```markdown
| Capa | Entorno | Qué observa | Evidencia |
|---|---|---|---|
| Regla local | flutter test, sin red | ubicación/recompensa | salida de tests |
| SDK base | unidad oficial de prueba | carga, fallo, dispose | captura y log sin PII |
| Mediación | test suite del proveedor | adapter init y versión | estado de cada adapter |
| Cuenta controlada | dispositivo/cuenta autorizados | solicitud y política | fecha, país permitido, versión |
```

```bash
flutter test
flutter analyze
flutter run
```

</details>

### Tema 5: consentimiento, privacidad y audiencias · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar actualizarás el estado de consentimiento en cada inicio y pedirás anuncios solo si el SDK y las reglas aplicables lo permiten. Prerrequisitos: ciclo de vida Flutter, configuración nativa y nociones de datos personales. Crea lib/privacy/ads_consent.dart.

#### ► LA IDEA EN UNA FRASE
**Al finalizar actualizarás el estado de consentimiento en cada inicio y pedirás anuncios solo si el SDK y las reglas aplicables lo permiten.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en consentimiento, privacidad y audiencias como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que consentimiento, privacidad y audiencias resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| consentimiento, privacidad y audiencias se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar consentimiento, privacidad y audiencias | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses consentimiento, privacidad y audiencias por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: consentimiento, privacidad y audiencias funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- consentimiento, privacidad y audiencias existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve consentimiento, privacidad y audiencias en tu contexto?
2. ¿Cómo sabrías que consentimiento, privacidad y audiencias no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar consentimiento, privacidad y audiencias?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```dart
abstract interface class ConsentGateway {
  Future<void> refreshAtLaunch();
  Future<bool> canRequestAds();
}

class AdsStartup {
  AdsStartup(this.consent, this.initializeAds);
  final ConsentGateway consent;
  final Future<void> Function() initializeAds;
  bool _started = false;

  Future<bool> start() async {
    await consent.refreshAtLaunch();
    final allowed = await consent.canRequestAds();
    if (allowed && !_started) {
      await initializeAds();
      _started = true;
    }
    return allowed;
  }
}
```

```bash
flutter analyze
flutter test test/privacy/ads_startup_test.dart
```

</details>

### Tema 6: comparar AdMob, AppLovin MAX y Unity LevelPlay · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar documentarás una decisión de proveedor y un plan de salida que proteja el flujo del producto. Prerrequisitos: temas 2 y 4. Crea docs/ad-provider-review.md.

#### ► LA IDEA EN UNA FRASE
**Al finalizar documentarás una decisión de proveedor y un plan de salida que proteja el flujo del producto.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en comparar admob, applovin max y unity levelplay como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que comparar admob, applovin max y unity levelplay resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| comparar AdMob, AppLovin MAX y Unity LevelPlay se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar comparar AdMob, AppLovin MAX y Unity LevelPlay | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses comparar admob, applovin max y unity levelplay por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: comparar admob, applovin max y unity levelplay funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- comparar AdMob, AppLovin MAX y Unity LevelPlay existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve comparar admob, applovin max y unity levelplay en tu contexto?
2. ¿Cómo sabrías que comparar admob, applovin max y unity levelplay no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar comparar admob, applovin max y unity levelplay?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```markdown
| Criterio | AdMob | AppLovin MAX | Unity LevelPlay |
|---|---|---|---|
| Rol en RutaFlow | fuente/mediación | mediación | mediación |
| Plataformas requeridas | Android/iOS | verificar guía vigente | verificar guía vigente |
| Tamaño y adapters | medir en build | medir en build | medir en build |
| Consentimiento y datos | documentar configuración | documentar configuración | documentar configuración |
| Fallback sin anuncio | conservar la UI | conservar la UI | conservar la UI |
```

```bash
flutter analyze
flutter test
```

</details>
