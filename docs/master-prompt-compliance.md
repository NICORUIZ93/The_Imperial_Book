# Cumplimiento del prompt maestro v2 por ruta

> Generado por `scripts/audit_track_master_prompt.py` (specs/004). Medición estructural: no acredita
> revisión humana. ✅ cumple · ⬜ pendiente · ➖ exento con motivo.

| Ruta | Temas | T1 4 niveles | T2 módulo Master | T3 temas reales (atlas oficial) | T4 ayuda visual | T5 explicación fácil | T6 capturas y ayudas de código | T7 proyecto |
|---|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| android | 74 | ✅ | ✅ | ⬜ 23/52 | ⬜ 67/74 | ✅ | ⬜ 0/74 | ✅ |
| angular | 71 | ✅ | ✅ | ⬜ 21/46 | ⬜ 68/71 | ⬜ 46/71 | ⬜ 0/71 | ✅ |
| cloud | 156 | ✅ | ✅ | ⬜ 17/60 | ⬜ 96/156 | ⬜ 125/156 | ⬜ 0/156 | ✅ |
| control-1 | 70 | ✅ | ⬜ | ⬜ sin atlas | ⬜ 11/70 | ✅ | ⬜ 0/70 | ⬜ 5/70 |
| devops | 130 | ✅ | ✅ | ⬜ 20/60 | ⬜ 123/130 | ✅ | ⬜ 0/130 | ✅ |
| flutter | 106 | ✅ | ✅ | ⬜ 13/53 | ⬜ 83/106 | ⬜ 88/106 | ⬜ 0/106 | ✅ |
| foundations | 102 | ✅ | ➖ | ⬜ sin atlas | ⬜ 77/102 | ✅ | ⬜ 2/102 | ✅ |
| ios | 56 | ✅ | ✅ | ⬜ 25/56 | ⬜ 35/56 | ⬜ 50/56 | ⬜ 0/56 | ✅ |
| java | 111 | ✅ | ✅ | ⬜ 23/49 | ⬜ 19/111 | ✅ | ⬜ 0/111 | ✅ |
| javascript | 88 | ✅ | ✅ | ⬜ 18/42 | ⬜ 58/88 | ✅ | ⬜ 0/88 | ✅ |
| kotlin-multiplatform | 56 | ✅ | ✅ | ⬜ 20/46 | ⬜ 47/56 | ✅ | ⬜ 0/56 | ✅ |
| microservices | 23 | ⬜ Aplicación, Integración, Experto | ⬜ | ⬜ sin atlas | ⬜ 1/23 | ✅ | ⬜ 0/23 | ✅ |
| node | 83 | ✅ | ✅ | ⬜ 15/46 | ⬜ 36/83 | ✅ | ⬜ 0/83 | ✅ |
| react | 58 | ✅ | ✅ | ⬜ 23/45 | ⬜ 37/58 | ⬜ 34/58 | ⬜ 0/58 | ✅ |
| rutaflow | 29 | ✅ | ➖ | ⬜ sin atlas | ⬜ 26/29 | ✅ | ⬜ 0/29 | ✅ |
| spring-boot | 113 | ✅ | ✅ | ⬜ 27/54 | ⬜ 43/113 | ✅ | ⬜ 0/113 | ✅ |

## Temas oficiales todavía sin tema propio (T3)

- **android** (29): configuration changes; storage; procesos y memoria; estado y recomposición; Material 3; listas; adaptive UI; coroutines y Flow; repositorios; dominio; networking; cache; sync; WorkManager; conflictos; geofencing; maps; camera; scanning; sensors; Bluetooth; notifications; foreground services; batería; Macrobenchmark; ANR; seguridad; Play Integrity; rollout
- **angular** (25): standalone components; templates; bindings; inyección de dependencias; RxJS; interop signal-observable; resolvers; formularios reactivos; validación; SSG; hydration; incremental hydration; event replay; deferred views; streaming; dominios; librerías; monorepos; configuración; i18n; microfrontends con criterio; sanitización; CSP y Trusted Types; profiling; migraciones
- **cloud** (43): IaaS PaaS SaaS; regions and zones; shared responsibility; identity; networks; compute; databases; Well-Architected; landing zones; event-driven; microservices; batch; edge; relational; key-value; time-series; object storage; lakehouse; streaming; governance; residency; IAM and federation; zero trust; WAF and DDoS; posture; threat detection; supply chain; compliance; quorum; retries; idempotency; circuit breaker; autoscaling; multi-region; RPO RTO; chaos; observability; SLO; sustainability; performance; hybrid; AI ML governance; deprecations
- **devops** (40): processes; signals; permissions; networks; troubleshooting; scripting; image layers; BuildKit; rootless; scanning; signatures; runtime security; quality gates; immutable artifacts; environments; promotion; progressive delivery; architecture; Pods; workloads; Services; Gateway API; policies; scheduling; autoscaling; operators; Terraform language; modules; remote state y locking; import; policy as code; drift; logs metrics traces; SLI y SLO; burn-rate alerts; incidents; capacity; chaos; restore; FinOps
- **flutter** (40): types; classes y mixins; collections; streams; records; patterns; extensions; widget-element-render object; constraints; navigation; forms; Material y Cupertino; animation; gestures; views y view models; repositories; services; domain; explicit states; error handling; serialization; SQLite; files; secure storage; cache; outbox; deep links; platform channels; add-to-app; web y desktop; location; background; notifications; unit/widget/integration tests; golden tests; performance; accessibility; l10n; security; stores
- **ios** (31): value types; protocols; generics; errors; collections; ownership; Swift packages; identity; Observation; animations; gestures; localization; task groups; Sendable; AsyncSequence; Swift 6 isolation; SwiftData y Core Data; migrations; CloudKit; Core Location; MapKit; background tasks; camera; biometrics; widgets; App Intents; UIKit interop; energy; privacy; signing; crashes
- **java** (26): tipos y control; records; sealed types; colecciones; i18n; regex; HTTP Client; serialización segura; Java Memory Model; locks; atomics; concurrent collections; class loading; garbage collectors; jcmd y jstack; CDS y AOT; reflection; method handles; Foreign Function and Memory API; JNI; property testing; profiling; secure coding; criptografía; jlink y jpackage; migración LTS
- **javascript** (24): gramática y tipos; alcance y closures; prototipos; clases y campos privados; símbolos; Proxy y Reflect; arrays inmutables; Map y Set; Intl y Unicode; errores y causas; iteradores; iteradores asíncronos; ES modules; top-level await; ciclos; import maps; using y await using; DisposableStack; DOM y eventos; Fetch y streams; service workers y PWA; memoria y GC; XSS y CSP; supply chain
- **kotlin-multiplatform** (26): data classes; sealed types; genéricos; time e IO; commonMain y commonTest; version catalogs; convention plugins; HTTP client; almacenamiento; offline-first; errores tipados; recursos; localización; deep links; accesibilidad; UI testing; Objective-C; UIKit y SwiftUI; Android; JVM; JS y Wasm; C interop; ownership; Hot Reload; benchmarks; seguridad
- **node** (31): timers; microtasks; EventEmitter; buffers; filesystem; paths y URLs; señales; child_process; permission model; HTTP/HTTPS; HTTP/2; DNS; TCP/UDP; TLS; proxies; timeouts; Web APIs compatibles; SQLite; serialización; compresión; crypto; blobs; configuración validada; coverage; benchmarks; diagnostics_channel; AsyncLocalStorage; inspector; package exports; seguridad de dependencias; observabilidad
- **react** (22): pureza; keys; render y commit; estado como snapshot; useLayoutEffect; useEffectEvent; hooks propios; useActionState; useOptimistic; SSR; Server Functions; use client/use server; serialización; React Compiler; reglas del compilador; memoización; profiler; caché; routing; seguridad RSC; estado remoto; migración
- **spring-boot** (27): auto-configuration; configuration properties; profiles; lifecycle; logging; failure analyzers; Problem Details; filtros; REST clients; WebSocket; migrations; MongoDB; locking; OAuth2 y OIDC; resource server; method security; headers; secretos; SAML; JMS; batch; circuit breakers; OpenTelemetry; health groups; graceful shutdown; native images; Buildpacks
