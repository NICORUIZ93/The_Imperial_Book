# Cumplimiento del prompt maestro v2 por ruta

> Generado por `scripts/audit_track_master_prompt.py` (specs/004). Medición estructural: no acredita
> revisión humana. ✅ cumple · ⬜ pendiente · ➖ exento con motivo.

| Ruta | Temas | T1 4 niveles | T2 módulo Master | T3 temas reales (atlas oficial) | T4 ayuda visual | T5 explicación fácil | T6 capturas y ayudas de código | T7 proyecto |
|---|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| android | 83 | ✅ | ✅ | ⬜ 31/52 | ⬜ 76/83 | ✅ | ⬜ 0/83 | ✅ |
| angular | 78 | ✅ | ✅ | ⬜ 26/46 | ⬜ 75/78 | ⬜ 54/78 | ⬜ 0/78 | ✅ |
| cloud | 168 | ✅ | ✅ | ⬜ 19/60 | ⬜ 108/168 | ⬜ 140/168 | ⬜ 8/168 | ✅ |
| control-1 | 88 | ✅ | ⬜ | ⬜ sin atlas | ⬜ 11/88 | ✅ | ⬜ 0/88 | ⬜ 5/88 |
| devops | 139 | ✅ | ✅ | ⬜ 26/60 | ⬜ 132/139 | ✅ | ⬜ 1/139 | ✅ |
| flutter | 119 | ✅ | ✅ | ⬜ 20/53 | ⬜ 96/119 | ⬜ 103/119 | ⬜ 0/119 | ✅ |
| foundations | 105 | ✅ | ➖ | ⬜ sin atlas | ⬜ 78/105 | ✅ | ⬜ 3/105 | ⬜ 103/105 |
| ios | 69 | ✅ | ✅ | ⬜ 31/56 | ⬜ 48/69 | ✅ | ⬜ 0/69 | ✅ |
| java | 120 | ✅ | ✅ | ⬜ 24/49 | ⬜ 25/120 | ✅ | ⬜ 6/120 | ⬜ 117/120 |
| javascript | 92 | ✅ | ✅ | ⬜ 22/42 | ⬜ 62/92 | ✅ | ⬜ 3/92 | ✅ |
| kotlin-multiplatform | 66 | ✅ | ✅ | ⬜ 32/46 | ⬜ 57/66 | ✅ | ⬜ 0/66 | ✅ |
| microservices | 0 | ⬜ Fundamentos, Aplicación, Integración, Experto | ⬜ | ⬜ sin atlas | ⬜ 2/0 | ⬜ 0/0 | ✅ | ⬜ 24/0 |
| node | 78 | ✅ | ⬜ registrado sin capítulo | ⬜ 21/46 | ⬜ 33/78 | ✅ | ⬜ 7/78 | ✅ |
| react | 64 | ✅ | ✅ | ⬜ 28/45 | ⬜ 43/64 | ⬜ 51/64 | ⬜ 0/64 | ✅ |
| rutaflow | 29 | ✅ | ➖ | ⬜ sin atlas | ⬜ 26/29 | ✅ | ⬜ 0/29 | ✅ |
| spring-boot | 123 | ✅ | ✅ | ⬜ 33/54 | ⬜ 51/123 | ✅ | ⬜ 0/123 | ⬜ 121/123 |

## Temas oficiales todavía sin tema propio (T3)

- **android** (21): configuration changes; storage; procesos y memoria; estado y recomposición; listas; adaptive UI; coroutines y Flow; repositorios; networking; cache; sync; WorkManager; conflictos; scanning; sensors; notifications; foreground services; batería; ANR; seguridad; rollout
- **angular** (20): standalone components; templates; bindings; inyección de dependencias; RxJS; interop signal-observable; formularios reactivos; validación; hydration; incremental hydration; event replay; deferred views; streaming; dominios; configuración; i18n; sanitización; CSP y Trusted Types; profiling; migraciones
- **cloud** (41): regions and zones; shared responsibility; identity; networks; compute; databases; landing zones; event-driven; microservices; batch; edge; relational; key-value; time-series; object storage; lakehouse; streaming; governance; residency; IAM and federation; zero trust; WAF and DDoS; posture; threat detection; supply chain; compliance; quorum; retries; idempotency; circuit breaker; autoscaling; multi-region; RPO RTO; chaos; observability; SLO; sustainability; performance; hybrid; AI ML governance; deprecations
- **devops** (34): processes; signals; permissions; networks; troubleshooting; scripting; image layers; BuildKit; rootless; scanning; signatures; runtime security; immutable artifacts; environments; promotion; progressive delivery; architecture; Pods; workloads; Services; Gateway API; policies; autoscaling; operators; Terraform language; modules; remote state y locking; drift; logs metrics traces; SLI y SLO; burn-rate alerts; incidents; capacity; restore
- **flutter** (33): classes y mixins; collections; extensions; widget-element-render object; constraints; navigation; forms; Material y Cupertino; animation; gestures; views y view models; domain; explicit states; error handling; serialization; SQLite; files; secure storage; cache; outbox; deep links; platform channels; web y desktop; location; background; notifications; unit/widget/integration tests; golden tests; performance; accessibility; l10n; security; stores
- **ios** (25): value types; protocols; generics; errors; collections; Swift packages; identity; Observation; animations; gestures; localization; task groups; Swift 6 isolation; SwiftData y Core Data; migrations; MapKit; background tasks; camera; biometrics; widgets; UIKit interop; energy; privacy; signing; crashes
- **java** (25): tipos y control; records; sealed types; colecciones; i18n; regex; HTTP Client; serialización segura; Java Memory Model; locks; atomics; concurrent collections; class loading; garbage collectors; jcmd y jstack; CDS y AOT; reflection; method handles; Foreign Function and Memory API; JNI; property testing; profiling; secure coding; jlink y jpackage; migración LTS
- **javascript** (20): gramática y tipos; alcance y closures; prototipos; clases y campos privados; símbolos; Proxy y Reflect; arrays inmutables; Map y Set; Intl y Unicode; errores y causas; iteradores; iteradores asíncronos; ES modules; using y await using; DOM y eventos; Fetch y streams; service workers y PWA; memoria y GC; XSS y CSP; supply chain
- **kotlin-multiplatform** (14): data classes; sealed types; time e IO; commonMain y commonTest; HTTP client; almacenamiento; offline-first; errores tipados; UI testing; Objective-C; UIKit y SwiftUI; Android; C interop; ownership
- **node** (25): timers; microtasks; EventEmitter; buffers; filesystem; paths y URLs; señales; child_process; permission model; HTTP/HTTPS; TCP/UDP; proxies; timeouts; Web APIs compatibles; SQLite; serialización; crypto; blobs; configuración validada; coverage; benchmarks; inspector; package exports; seguridad de dependencias; observabilidad
- **react** (17): pureza; keys; render y commit; estado como snapshot; hooks propios; SSR; Server Functions; use client/use server; serialización; reglas del compilador; profiler; code splitting; caché; routing; seguridad RSC; estado remoto; migración
- **spring-boot** (21): auto-configuration; configuration properties; profiles; lifecycle; failure analyzers; Problem Details; filtros; REST clients; WebSocket; migrations; locking; OAuth2 y OIDC; method security; headers; secretos; batch; circuit breakers; OpenTelemetry; health groups; graceful shutdown; native images
