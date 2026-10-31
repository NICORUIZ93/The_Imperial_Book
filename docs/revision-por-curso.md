# Revisión por curso

Lectura estructural de los 1100 temas visibles. Evalúa presencia de pasos y señales automáticas; no certifica ejecución, comprensión ni calidad pedagógica.

## Definiciones

- **P1–P7:** presencia de los encabezados `#### Paso 1` a `#### Paso 7` en el bloque que va del encabezado del tema hasta el siguiente `### Tema`. Un tema «completo» tiene los siete; no se juzga aquí su contenido. Los 1100 temas los tienen; el auditor de siete pasos también registra 1100/1100 con su propia rúbrica de marcadores.
- **F1 fuente oficial:** el tema contiene al menos una URL de un dominio oficial reconocido por el detector de `audit_code_visual_quality.py`. Resultado: 722/1100 con fuente reconocida y 378 sin ella. La ausencia no implica que no haya URL, solo que ninguna pertenece a la lista reconocida.
- **F2 Mermaid/ASCII:** el detector de visuales reconoce 592 temas con Mermaid y 211 con diagrama ASCII etiquetado `**Diagrama:**`; el resto no tiene ninguno de los dos. Un tema puede tener ambos.
- **F3 profundidad:** palabras del bloque visible según `lesson-substance.json`; insuficiente <150, básico 150–400, adecuado 400–800, profundo >800. Resultado: 0 insuficientes, 0 básicos, 245 adecuados y 855 profundos. Es extensión, no calidad.
- **F4 prerrequisitos:** señal heurística. «No declara» cuando el Paso 1 no menciona conocimiento previo, prerrequisitos o requisitos; «posible salto» cuando el Paso 1 menciona literalmente el título de un tema posterior del mismo track. La ausencia de señal no prueba que la secuencia sea correcta.

## Resumen por track

| Track | Temas | P1–P7 completos | F1 fuente oficial | F2 Mermaid | F2 ASCII | F2 sin diagrama | F3 insuf. | F3 básico | F3 adecuado | F3 profundo | F4 no declara | F4 posible salto |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 58 | 58 | 55 | 15 | 40 | 3 | 0 | 0 | 4 | 54 | 1 | 1 |
| angular | 71 | 71 | 59 | 30 | 20 | 21 | 0 | 0 | 6 | 65 | 0 | 2 |
| cloud | 156 | 156 | 140 | 80 | 18 | 59 | 0 | 0 | 30 | 126 | 0 | 3 |
| devops | 113 | 113 | 36 | 66 | 40 | 7 | 0 | 0 | 40 | 73 | 1 | 1 |
| flutter | 63 | 63 | 52 | 51 | 14 | 10 | 0 | 0 | 13 | 50 | 0 | 2 |
| foundations | 99 | 99 | 14 | 70 | 0 | 29 | 0 | 0 | 38 | 61 | 10 | 0 |
| ios | 56 | 56 | 56 | 30 | 16 | 20 | 0 | 0 | 22 | 34 | 0 | 3 |
| java | 85 | 85 | 41 | 25 | 0 | 60 | 0 | 0 | 24 | 61 | 5 | 3 |
| javascript | 88 | 88 | 68 | 58 | 0 | 30 | 0 | 0 | 26 | 62 | 2 | 1 |
| kotlin-multiplatform | 56 | 56 | 42 | 32 | 22 | 7 | 0 | 0 | 7 | 49 | 0 | 1 |
| node | 77 | 77 | 46 | 24 | 12 | 44 | 0 | 0 | 11 | 66 | 1 | 1 |
| react | 58 | 58 | 39 | 37 | 9 | 16 | 0 | 0 | 10 | 48 | 0 | 1 |
| rutaflow | 29 | 29 | 7 | 26 | 0 | 3 | 0 | 0 | 2 | 27 | 0 | 0 |
| spring-boot | 91 | 91 | 67 | 48 | 20 | 23 | 0 | 0 | 12 | 79 | 1 | 0 |

## Progresión por track

La progresión se evalúa por track: módulos en orden numérico, temas en el orden del archivo y señales de dependencias posteriores. No se verificó que cada prerrequisito declarado exista antes en el track; eso requiere lectura humana.

- **android:** módulos 0–15 (16 módulos, 58 temas). Pasos incompletos: 0. Posibles saltos: 1. Sin declaración de prerrequisitos: 1. Posibles saltos: Tema 1: Detectar y corregir recomposición innecesaria (web/public/content/android/modulo-10.md:6).
- **angular:** módulos 0–16 (17 módulos, 71 temas). Pasos incompletos: 0. Posibles saltos: 2. Sin declaración de prerrequisitos: 0. Posibles saltos: Tema 1: Estructura del proyecto integrador (web/public/content/angular/modulo-13.md:8); Tema 2: inject() frente a inyección por constructor (web/public/content/angular/modulo-3.md:165).
- **cloud:** módulos 0–34 (35 módulos, 156 temas). Pasos incompletos: 0. Posibles saltos: 3. Sin declaración de prerrequisitos: 0. Posibles saltos: Tema 5: Políticas de bucket, ACL y URLs pre-firmadas (web/public/content/cloud/modulo-2.md:303); Tema 4: Autenticación IAM para el plano de datos de ElastiCache (web/public/content/cloud/modulo-23.md:195); Tema 2: Kubernetes administrado, ECS y Service Mesh (web/public/content/cloud/modulo-33.md:73).
- **devops:** módulos 0–18 (19 módulos, 113 temas). Pasos incompletos: 0. Posibles saltos: 1. Sin declaración de prerrequisitos: 1. Posibles saltos: Tema 3: IaC multi-nube (web/public/content/devops/modulo-12.md:186).
- **flutter:** módulos 0–15 (16 módulos, 63 temas). Pasos incompletos: 0. Posibles saltos: 2. Sin declaración de prerrequisitos: 0. Posibles saltos: Tema 1: Arquitectura por features y Clean Architecture (web/public/content/flutter/modulo-12.md:6); Tema 1: Una API Dart puede terminar en una frontera nativa (web/public/content/flutter/modulo-13.md:8).
- **foundations:** módulos 0–15 (16 módulos, 99 temas). Pasos incompletos: 0. Posibles saltos: 0. Sin declaración de prerrequisitos: 10.
- **ios:** módulos 0–14 (15 módulos, 56 temas). Pasos incompletos: 0. Posibles saltos: 3. Sin declaración de prerrequisitos: 0. Posibles saltos: Tema 1: Instruments (web/public/content/ios/modulo-10.md:8); Tema 3: Human Interface Guidelines, Dynamic Type e interop con UIKit (web/public/content/ios/modulo-10.md:128); Tema 2: Testing de código async (web/public/content/ios/modulo-9.md:101).
- **java:** módulos 0–20 (21 módulos, 85 temas). Pasos incompletos: 0. Posibles saltos: 3. Sin declaración de prerrequisitos: 5. Posibles saltos: Tema 1: Clases, objetos, constructores y encapsulación (web/public/content/java/modulo-1.md:8); Tema 3: Proyectos multi-módulo sin ciclos (web/public/content/java/modulo-15.md:128); Tema 6: SLF4J, Logback, MDC y logging estructurado (web/public/content/java/modulo-15.md:317).
- **javascript:** módulos 0–14 (15 módulos, 88 temas). Pasos incompletos: 0. Posibles saltos: 1. Sin declaración de prerrequisitos: 2. Posibles saltos: Tema 5: TypeScript avanzado: sobrecargas, tipos mapeados, condicionales y satisfies (web/public/content/javascript/modulo-11.md:423).
- **kotlin-multiplatform:** módulos 0–13 (14 módulos, 56 temas). Pasos incompletos: 0. Posibles saltos: 1. Sin declaración de prerrequisitos: 0. Posibles saltos: Tema 3: Versionado compartido (web/public/content/kotlin-multiplatform/modulo-10.md:186).
- **node:** módulos 0–14 (15 módulos, 77 temas). Pasos incompletos: 0. Posibles saltos: 1. Sin declaración de prerrequisitos: 1. Posibles saltos: Tema 3: Excepciones no capturadas y graceful shutdown (web/public/content/node/modulo-9.md:169).
- **react:** módulos 0–14 (15 módulos, 58 temas). Pasos incompletos: 0. Posibles saltos: 1. Sin declaración de prerrequisitos: 0. Posibles saltos: Tema 3: Eventos tipados y componentes polimórficos (web/public/content/react/modulo-11.md:177).
- **rutaflow:** módulos 0–7 (8 módulos, 29 temas). Pasos incompletos: 0. Posibles saltos: 0. Sin declaración de prerrequisitos: 0.
- **spring-boot:** módulos 0–22 (23 módulos, 91 temas). Pasos incompletos: 0. Posibles saltos: 0. Sin declaración de prerrequisitos: 1.

## 20 temas más urgentes

Ordenados por una puntuación explícita: pasos faltantes (20 por paso), tema básico (8), sin fuente oficial reconocida (10), ASCII pendiente (5), sin diagrama (3), posible salto de prerrequisito (6) y prerrequisito no declarado (2). Es una priorización de revisión, no un veredicto sobre el tema.

| # | Track | Módulo | Tema | Archivo:Línea | Motivo | Puntuación |
|---:|---|---:|---|---|---|---:|
| 1 | java | 15 | Tema 6: SLF4J, Logback, MDC y logging estructurado | web/public/content/java/modulo-15.md:317 | sin dominio oficial reconocido; sin diagrama; posible salto de prerrequisito | 19 |
| 2 | java | 15 | Tema 3: Proyectos multi-módulo sin ciclos | web/public/content/java/modulo-15.md:128 | sin dominio oficial reconocido; posible salto de prerrequisito | 16 |
| 3 | javascript | 11 | Tema 5: TypeScript avanzado: sobrecargas, tipos mapeados, condicionales y satisfies | web/public/content/javascript/modulo-11.md:423 | sin dominio oficial reconocido; posible salto de prerrequisito | 16 |
| 4 | android | 5 | Tema 1: Retrofit con coroutines | web/public/content/android/modulo-5.md:6 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 5 | android | 5 | Tema 2: Manejo de errores HTTP | web/public/content/android/modulo-5.md:119 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 6 | android | 5 | Tema 3: Interceptores de OkHttp | web/public/content/android/modulo-5.md:223 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 7 | angular | 0 | Tema 3: TypeScript a fondo — unknown, any, never y utility types | web/public/content/angular/modulo-0.md:329 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 8 | angular | 6 | Tema 1: Observable frente a Promise | web/public/content/angular/modulo-6.md:6 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 9 | angular | 6 | Tema 4: Subjects y operadores de aplanamiento avanzados | web/public/content/angular/modulo-6.md:414 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 10 | angular | 15 | Tema 3: Cypress y Playwright | web/public/content/angular/modulo-15.md:248 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 11 | cloud | 7 | Tema 2: Modelo de responsabilidad compartida | web/public/content/cloud/modulo-7.md:68 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 12 | devops | 4 | Tema 2: Caché de dependencias en CI | web/public/content/devops/modulo-4.md:98 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 13 | devops | 4 | Tema 3: Artifacts y reportes de cobertura | web/public/content/devops/modulo-4.md:171 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 14 | devops | 4 | Tema 4: Pipelines como código (GitHub Actions/GitLab CI) | web/public/content/devops/modulo-4.md:237 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 15 | devops | 5 | Tema 1: Blue-green deployment | web/public/content/devops/modulo-5.md:6 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 16 | devops | 5 | Tema 2: Canary releases | web/public/content/devops/modulo-5.md:102 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 17 | devops | 5 | Tema 4: Feature flags vs branches por entorno | web/public/content/devops/modulo-5.md:279 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 18 | devops | 5 | Tema 5: Rollback automático por métricas | web/public/content/devops/modulo-5.md:361 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 19 | devops | 8 | Tema 6: Ansible — playbooks, roles, inventory y módulos | web/public/content/devops/modulo-8.md:451 | sin dominio oficial reconocido; diagrama ASCII | 15 |
| 20 | devops | 8 | Tema 7: Pulumi como alternativa a HCL | web/public/content/devops/modulo-8.md:537 | sin dominio oficial reconocido; diagrama ASCII | 15 |

## Temas sin clasificar

No hubo temas sin clasificar: los 1100 encabezados `### Tema…` se parsearon y todos pudieron asignarse a un track y módulo. La clasificación F4 es heurística y puede producir falsos negativos; los temas sin señal requieren lectura humana.

## Límites

- No se modificó ningún contenido durante esta auditoría.
- F1 usa la lista de dominios del detector de visuales; una URL oficial no listada se contabiliza como ausente.
- F2 distingue Mermaid de ASCII, pero no verifica que el diagrama sea correcto.
- F3 cuenta palabras del bloque visible; un tema extenso no es necesariamente profundo.
- F4 no prueba que los prerrequisitos existan antes; solo detecta declaración y menciones literales de títulos posteriores.


## Salida literal de validación

Comando: `./scripts/validate.sh`

```text
Validación OK: aplicación Angular única, 14 tracks y contenido Markdown completo.
.....................
----------------------------------------------------------------------
Ran 21 tests in 3.777s

OK
Pedagogía OK: 245 lecciones, 1100 temas, 4871 bloques de código y 163 laboratorios. Casos reales explícitos: 124/1100; diagramas editoriales: 644/1100 (los faltantes permanecen como deuda; no se generan gráficos decorativos).
Currículo OK: 16 módulos trazados, 16/17 áreas CS2023 y 15/18 áreas SWEBOK; 48 resultados comunes; 53 resultados especializados conectan 221 módulos de 12 tracks.
Integración PDF OK: 69 páginas trazadas, 17 modelos reproducidos y estados de diodos comprobados.
Fuentes oficiales OK: 12 rutas, revisión de 101 días, 39 fuentes primarias y 609 temas auditados.
Validación OK: 14 tracks trazados desde guía oficial hasta nivel (Fundamentos/Aplicación/Integración/Experto) de cada módulo real.
Floci oficial OK: 30 temas de plataforma, 115 servicios y 4 laboratorios trazados en español.
Calidad de código OK: estándar central verificado para 245 capítulos, sin repetirlo en cada lección.
RutaFlow OK: ruta visible de 8 capítulos y 14 implementaciones, sin acoplar otros tracks.
Temas Master solicitados OK: 75 filas visibles y practicables en 12 tracks.
Verified 74 standalone Manim CE scenes in /Users/nicolasruiz/Documents/GitHub/Academia_Floci/examples/manim/scenes
Fences de contenido OK: todos los bloques ``` están balanceados.
Auditoría pedagógica detallada OK: 1100 temas en 14 tracks (1100/1100 practicables, deuda de 0)
Metodología universal auditada: 1100/1100 temas completos
Sustancia auditada: 1100 temas, 0 con defectos, 183/245 módulos con apéndices heredados
Auditoría de código y visuales OK: 1100 temas editoriales visibles; inventarios generados excluidos
Prioridades educativas OK: 245 módulos, 1100 temas, 12 proyectos y progreso persistente sin evaluaciones generadas ni gamificación.
Índice web validado: 14 tracks, 1100 temas -> web/public/content/topic-index.json
Grafo de prerrequisitos OK: 1100 temas en 14 tracks
Repo graph OK: 959 indexed files.
Revisión estructural de profundidad: {'tracks': 14, 'modules': 245, 'topics': 1100, 'topicsWithSignals': 153, 'newLaboratories': 25}
Revisión integral sincronizada.
Trazabilidad de laboratorios OK: 14 rutas; archivos iguales al Markdown. No implica ejecución ni revisión pedagógica.
Material RutaFlow trazado: 37 archivos, 11 temas nuevos y código coincidente. No acredita ejecución.
```

Comando: `python3 scripts/validate_learning_priorities.py`

```text
Prioridades educativas OK: 245 módulos, 1100 temas, 12 proyectos y progreso persistente sin evaluaciones generadas ni gamificación.
```
