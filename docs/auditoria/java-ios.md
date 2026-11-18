# Auditoría editorial y pedagógica: cursos Java (módulos 0–22) e iOS (módulos 0–14)

Fecha: 2026-11-18. Auditor independiente; no soy el autor. Rúbrica y reglas: `docs/auditoria/PROMPT-AUDITORIA.md`.
Rutas relativas a `web/public/content/` salvo indicación. Formato de cita: `archivo:línea` + frase textual.

## Método y evidencia reproducible

- **Lectura:** la lista de temas de los 38 módulos (`grep '^### Tema'`). Leí completos o casi completos: Java M0 T1, M1 T4, M4 T4, M5 T5–T6, M7 T4, M10 T1 y T3, M11 T1, M13 completo y M20 T2; iOS M0 T1 y T5, M1 T1, M4 T5, M5 T1, M6 T4, M11 T1, M13 T8, más partes de M12 T1, M13 T9 y M14 T2. Del resto ojeé la apertura y busqué defectos con grep (plantilla, versiones, voseo, referencias a otros cursos, proyectos nuevos). En los módulos no leídos a fondo (lista al final), la nota sale de esa revisión parcial, de la medición mecánica y de la compilación.
- **Medición mecánica** (`python3 scripts/audit_plantilla.py`): Java, 117 temas, **4 cumplen** los 8 elementos; iOS, 69 temas, **4 cumplen**.
- **Ejecución Java (JDK 21.0.13, el único disponible):** extraje los 273 bloques ```` ```java ```` de los 23 módulos. De ellos, 180 tienen `main` y declaración de tipo. **157 de 180 compilan solos.** De los 23 que no:
  - 6 fallan porque piden JDK 22–25: preview en 21, Gatherers y FFM.
  - 17 fallan porque dependen de otras clases. Compilé M22 tema por tema y 4 de 5 temas compilan. El fallo restante (`Bad.java`) es el fallo deliberado del propio texto.
  - Ejecuté unos 150 programas y comparé su salida con «Resultado esperado». Hay **una salida esperada falsa** (M20:311). También reproduje dos afirmaciones falsas: M9:431 y M10:44/98.
- **Swift no se puede ejecutar aquí.** iOS se verificó contra documentación de Apple (archivos `.md` de developer.apple.com) y contra el foro oficial de SwiftPM.

## Veredicto ejecutivo

**No.** Ninguno de los dos cursos cumple hoy el objetivo «cualquier persona aprende fácil».

- **Java:** el código se ejecuta en general bien (157/180 bloques compilan y la mayoría de las salidas coinciden). Pero el entorno del Módulo 0 se contradice: pide Java 25 e instala `openjdk-21-jdk`, y con 21 fallan M4 T4, M5 T5–T6, M7 T4, M8, M11 T4 y M15. Hay errores conceptuales verificados (JPMS en M10, propiedades en M9, salida de M20). La progresión está desordenada: JPA antes que JDBC, un integrador en M13 seguido de nueve módulos más, y tres plantillas distintas. Prácticamente no hay soluciones: 1 bloque `<details>` en 23 módulos.
- **iOS:** está peor.
  - **Plantilla y tono:** ninguno de los 69 temas usa la plantilla de subtemas que exige `CLAUDE.md`, y el texto mezcla voseo y tuteo (158 formas de voseo en los 15 módulos).
  - **Dependencia de otros cursos:** remite constantemente a cursos que la persona no ha hecho (React, Android, Kotlin, Cloud). M5 tiene el curso Cloud como prerrequisito.
  - **Proyecto:** se contradice sobre el proyecto (un solo `RutaFlowApp` frente a «parte de otra carpeta vacía», 38 veces).
  - **Errores técnicos:** hay errores verificados en SwiftPM, Core Location, BackgroundTasks y firma de código.
  - **Soluciones:** no tiene ninguna.

## Tabla A1–F3 por curso

| Crit. | Java | Evidencia Java | iOS | Evidencia iOS |
|---|---|---|---|---|
| A1 Ejemplo antes que teoría | 2 | En el formato de subtemas, «Hazlo tú» va antes de «Entiende»: `java/modulo-0.md:115` «Crea `java-motor/src/Saludo.java`» precede a `:137` «`javac` compila…». En los formatos Paso 1–7 (M17–M20) la teoría va primero: `java/modulo-17.md` «Paso 3 · Teoría y modelo mental». | 1 | Los 69 temas usan «Paso 3 · Teoría» antes de «Paso 4 · Demostración» (`ios/modulo-0.md:91`). En `ios/modulo-1.md` la teoría, la «Entrega», los «Errores comunes» y las «Fuentes» aparecen dentro del Paso 3, antes de cualquier demostración. |
| A2 Analogías | 1 | 88/117 temas sin analogía según la medición mecánica. Las pocas que hay son correctas (`java/modulo-17.md` «un `PreparedStatement` es como un formulario con casillas fijas»). | 2 | Hay analogías y algunas declaran su límite (`ios/modulo-0.md` T5 «La analogía falla en que el compilador vigila cada entrega»). Pero hay una exageración que crea un concepto erróneo: `ios/modulo-0.md:110` «previene por completo la categoría de errores conocida… como `NullPointerException`», cuando el mismo tema muestra un crash con `nombre!`. |
| A3 Errores comunes reales | 2 | Fallos deliberados con mensaje real verificado (`java/modulo-0.md:224` `NoClassDefFoundError: Ayudante`, reproducido). Pero las secciones de laboratorio son genéricas, sin mensaje (`java/modulo-1.md:767` «Confundir sobrecarga con sobreescritura.»), y hay diagnósticos falsos (M9:431, M10:44, M8:22). | 1 | `ios/modulo-1.md:87` «Errores comunes:» son rótulos sin mensaje («Modificador perdido o en orden incorrecto.»). Hay mensajes esperados incorrectos: `ios/modulo-4.md:419` y `ios/modulo-11.md:66` (ver errores técnicos). |
| A4 Ejercicios progresivos con solución | 1 | 1 bloque `<details>` en todo el curso (M12). M21/M22 tienen «Ejercicios», «Pista» y «Reto» sin solución. | 0 | 0 bloques `<details>` en 15 módulos. Los «Paso 6 · Práctica independiente» no tienen solución (`ios/modulo-0.md` T1 «Corregí el Paso 5…»). |
| A5 Proyecto integrador 30–60 min | 1 | `java/modulo-13.md` es prosa sin código: «Crea `src/domain/Guia.java` con `record Guia(String numero)`… crea `src/application/CrearGuia.java`…». El track le asigna «'6 h'» (`java.track.ts:181`) para 3 temas de unos 30 min. | 1 | `ios/modulo-12.md:3` «para cada práctica, parte de una carpeta vacía y crea… un proyecto llamado `RutaFlowApp`»: un integrador que no integra. |
| A6 Progresión | 1 | JPA (M16) antes que JDBC (M17). M20 «Aplicación» va después de los módulos «Experto». `java/modulo-15.md:3` «endurece el proyecto multi-módulo del Módulo 14», pero M14 no tiene ningún proyecto multi-módulo (0 apariciones de «multi-m»). | 1 | Tema «Experto» de ownership `~Copyable` en el Módulo 0 (`ios/modulo-0.md:507`). `ios/modulo-4.md:326` depende de «`RutaFlowKit` del módulo 12». `ios/modulo-5.md:11` «Prerrequisitos: … Módulo 6 del track Cloud». |
| B1 Plantilla única | 1 | Tres formatos: subtemas de 4 pasos (M0–M16), Paso 1–7 (M9, M14, M17–M20) y «Aprende/Practica/Aplica» (M21–M22, `java/modulo-21.md:14,65,219`). «Hito del tema» solo en M0, M1, M2 y M20. | 1 | Los 69 temas siguen en Paso 1–7: 0 temas con «#### Subtema», cuando `CLAUDE.md` exige «3–6 subtemas con Contexto → Hazlo tú → Entiende → Cierra». |
| B2 Solo texto o solo código | 1 | Código descrito en prosa: `java/modulo-8.md:18` «Crea `pom.xml` con `groupId` `academia`…», `java/modulo-11.md:40` «crea una función que asigne varios arreglos…», M13 T1–T3. | 2 | Hay código en casi todos los temas, aunque con párrafos de relleno repetidos: `ios/modulo-12.md` repite el mismo diagrama de carpetas dos veces. |
| B3 Objetivos y resumen | 1 | Medición mecánica: 67/117 temas sin objetivos y 54/117 sin resumen. | 2 | Todos los temas tienen «Al finalizar vas a…» y cierre; el defecto está en el formato, no en la ausencia. |
| B4 Módulo 0 de entorno | 2 | Hay tabla de instalación, Hello World y error de `JAVA_HOME` (`java/modulo-0.md:8-24`), pero las versiones se contradicen (`:6` «Java 25 o superior» frente a `:12` «openjdk-21-jdk» y `:108` «JDK 21 o posterior»). | 2 | Hay pasos de Xcode y errores de licencia y runtime (`ios/modulo-0.md:9-20`), pero la estructura de SwiftPM está desactualizada (`:124-130`) y el prerrequisito se contradice (`:60` «Prerrequisitos: macOS» frente a `:17` Windows/Linux sirve «para Módulo 0»). |
| C1 Código completo y ejecutable | 2 | 157/180 programas compilan. Fragmentos con dependencias implícitas en M16 (0/7 independientes) y M21 (20/23 fragmentos). | 1 | Hay fragmentos con tipos no definidos: `ios/modulo-5.md:23` `throw ErrorRed.servidor` antes de definirlo en `:94`; `ios/modulo-6.md:305` `NotasView()`, que nunca se define. El endpoint `api.rutaflow.example.com` (`ios/modulo-5.md:55`) no existe. |
| C2 Respeta su propio estándar de código | 2 | Dinero como `double`: `java/modulo-1.md:597` `static double calcular(double kilometros) { return kilometros * 1200.0; }` (número sin unidad; el estándar dice «Evita… números sin unidad»). | 1 | `ios/modulo-6.md:301` `try! ModelContainer(...)` y `ios/modulo-5.md:55` `URL(string: …)!` contradicen `ios/modulo-0.md` T1 «nunca con force unwrap» y la regla del estándar «Errores explícitos». |
| C3 Versiones y APIs vigentes | 2 | M14 está al día (JDK 27 verificado). Pero `java/modulo-0.md:12` instala 21 mientras M4, M5, M7, M11, M15 y M17 piden 22–25 (`java/modulo-17.md:18` «Requiere JDK 25+»). | 1 | Mezcla «Xcode 15» (`ios/modulo-13.md:622`, `ios/modulo-10.md`), «Xcode 16» y destinos iOS 17/18. La estructura de SwiftPM es anterior a 6.2. No declara Xcode 26 como base. |
| C4 Soluciones documentadas | 0 | Ver A4. | 0 | Ver A4. |
| D1 Segunda persona consistente | 2 | Tuteo consistente; 2 formas de voseo en total (M0 y M18). | 1 | 158 formas de voseo en 15/15 módulos mezcladas con tuteo, p. ej. `ios/modulo-0.md` T1 «Pista: reemplazá…», «Corregí el Paso 5…», «Entregá la función…», junto a «Guarda `Sources/main.swift`». |
| D2 Jerga sin explicar | 1 | `java/modulo-13.md:104` «`HttpServletRequest`» (Servlets nunca se enseñan). La cita a Spring Modulith en M13 T1. Sin glosario. | 1 | `ios/modulo-2.md:123` «skippability en Jetpack Compose», `:206` «"prop drilling"». Sin glosario. |
| D3 Conocimiento previo no enseñado | 1 | M16 usa SQL, claves foráneas y transacciones antes de M17. `java/modulo-0.md:49` manda a SQL de otro curso (`/curso/foundations/4`). | 0 | Más de 20 remisiones a otros cursos como base explicativa: `ios/modulo-1.md:108` «(Módulo 1 del track de React)», `ios/modulo-1.md:241` «(Módulo 2 del track de Android)», `ios/modulo-7.md:96` «(Módulo 1 del track de Angular)», `ios/modulo-9.md:207` «(Módulo 6 de ese track)» de Spring Boot. `ios/modulo-5.md:73` exige un endpoint construido en el curso Cloud. |
| E1 Qué detecta validate.sh | 1 | Detecta paridad de archivos, índice, temario, laboratorios citados y specs (`scripts/validate.sh`). No detecta: plantilla, compilación, salidas, versiones contradictorias, voseo, referencias a otros cursos ni enlaces. Pasa en verde («validate.sh: ok») con todos los defectos de este informe. | 1 | Igual. |
| E2 Valida ejecución, plantilla y glosario | 0 | Nada de eso. La comprobación de plantilla (`audit_plantilla.py`) existe pero no forma parte de `validate.sh`. | 0 | Igual. Además, Swift no se puede ejecutar en CI. |
| E3 Flujo de revisión documentado | 0 | `CLAUDE.md` solo dice «El dueño aprueba los temarios»; no hay revisor pedagógico ni técnico. | 0 | Igual. |
| F1 Riesgo de 1432 temas sin revisión | 0 | En 2 cursos encontré 13 errores técnicos verificados y 0 soluciones; el defecto es sistémico. | 0 | Igual. |
| F2 Ruta priorizada | 1 | `java/modulo-0.md:26-58` presenta una ruta de 17 pasos, pero el curso publica 23 módulos a la vez y mezcla etapas fuera de orden (`:93-99`). | 1 | `ios/modulo-0.md:22-53` tiene un mapa por etapas, pero todo está publicado. |
| F3 Glosario y apéndices | 0 | No hay glosario (`grep -ri glosario` sin resultados en el contenido). | 0 | Igual. |

## Tabla por módulo

Nota global de 0 a 3. «Leído» indica si leí un tema completo; si no, la nota sale de una revisión parcial más la medición.

| Curso | Mód. | Temas | Nota | Defecto principal (cita) | Corrección concreta |
|---|---|---|---|---|---|
| Java | 0 | 8 | 2 | `:6` «Java 25 o superior» frente a `:12` «openjdk-21-jdk». Además `:382` «Lo que el lanzador exige siempre… es que el método `main` sea `public static void`», que es falso en 25. Y `:28-32` deja metatexto editorial («ver `docs/capture-intake.json`»… «no se inventó»). | Unificar a JDK 25 (Ubuntu: `openjdk-25-jdk` o Temurin 25). Reescribir `:382` citando JEP 512. Borrar `:28-32`. |
| Java | 1 | 4 | 2 | El laboratorio son solo remisiones («Ver Tema 1»…). Los errores comunes no tienen mensaje (`:767`). El track pide «Crea una clase Animal…» (`java.track.ts:21`), pero el contenido usa `Guia/Vehiculo`. | Alinear las prácticas del track con el contenido. Añadir el mensaje real de `javac` a cada error común. |
| Java | 2 | 3 | 2 | Sin hito ni soluciones; el laboratorio es una tabla «Ver Tema N» (`:547-560`). | Añadir solución plegada por ejercicio y el hito de 4 comprobaciones. |
| Java | 3 | 3 | 2 | 0 hitos y 0 soluciones; 2/3 temas sin objetivos. | Añadir objetivos, hito y soluciones. |
| Java | 4 | 4 | 2 | T4 exige «Java 24 o posterior» y M0 instala 21. El bloque `javac … Rachas.java` (`:404-407`) aparece antes de crear el archivo. | Corregir la versión en M0 y mover el comando después del código. |
| Java | 5 | 7 | 2 | El Tema 7 aparece después de «## Laboratorio de transferencia» (`:749-751`), fuera del flujo. T5–T6 necesitan JDK 25 y 9 bloques son fragmentos. | Mover T7 antes del laboratorio y declarar el JDK por tema. |
| Java | 6 | 3 | 2 | `:160` usa Jackson `2.22.4` y el laboratorio de M15 usa `2.19.2` (`examples/java-maven/pom.xml:4`). El `pom` está en una sola línea. | Una sola versión de Jackson en el curso y un `pom` legible. |
| Java | 7 | 4 | 2 | T4 «(_, Java 22)» no compila con el JDK de M0 (verificado: «unnamed variables are a preview feature»). | Igual que M0. |
| Java | 8 | 4 | 1 | `:18` describe el `pom.xml` en prosa. `:22` «Maven no encuentra ese compilador» es falso: el error real es «release version 25 not supported» (reproducido). Maven y Gradle no se instalan en M0. | `pom.xml` completo, el diagnóstico real y la instalación de Maven/Gradle en M0. |
| Java | 9 | 4 | 2 | `:431` el fallo deliberado es falso: con `new Random()` las propiedades 1 y 3 fallan siempre en `kilos=999` (reproducido 5 veces). | Reescribir: «la propiedad 2 falla a veces en 900; las otras siempre en 999 porque los bordes van primero». |
| Java | 10 | 3 | 1 | `:44` «quita `exports academia.rutas.api`… `Main` no puede acceder al tipo» y `:98` «confirma que `Main` deja de compilar» son falsos: `Main` está en el mismo módulo (compiló y ejecutó `EN_RUTA` sin el `exports`). | Poner `Main` en un segundo módulo `academia.app` con `requires academia.rutas`. |
| Java | 11 | 4 | 1 | Código en prosa (`:40`). El tema «Generaciones de memoria y recolectores» (`:6`) no explica qué son las generaciones joven y vieja, G1 ni ZGC. FFM necesita JDK 22+. | Código completo en `Memoria.java`, explicación de generaciones y salida real de `-Xlog:gc`. |
| Java | 12 | 6 | 2 | 6/9 bloques son fragmentos; es el único módulo con una solución `<details>`. | Hacer de la solución plegada el patrón y extenderla a todo el curso. |
| Java | 13 | 3 | 1 | El integrador es solo prosa. `:104` usa `HttpServletRequest` sin enseñarlo. T1 nombra `domain/application/infra` y el laboratorio `:305` «`dominio/`, `servicio/`, `infraestructura/`». | Código completo del integrador, nombres de carpetas únicos y ninguna API de Servlets sin presentarla antes. |
| Java | 14 | 6 | 2 | Bien actualizado (JDK 27 verificado), pero «Revisión oficial de plataforma — octubre de 2026» y «Atlas completo de temas oficiales» (`:618`, `:658`) son notas de actualidad, no lección. | Mover esas notas a un apéndice. |
| Java | 15 | 6 | 1 | `:3` «proyecto multi-módulo del Módulo 14» (no existe). Duplica M8 (multi-módulo) y M9 (JUnit/Mockito). 0 soluciones. | Remitir a M8 T3 y fusionar o eliminar lo duplicado. |
| Java | 16 | 8 | 1 | JPA antes que JDBC (M17). 8/8 temas sin objetivos. Todo el código vive en el laboratorio. | Reordenar 17 → 16 y añadir objetivos. |
| Java | 17 | 2 | 1 | `:19` «haber seguido el tema anterior de este módulo» en el Tema 1 (plantilla copiada). Mezcla «Paso 4» con «#### Subtema 1.1». Son 2 temas para «3 h». | Limpiar la plantilla y ajustar la duración. |
| Java | 18 | 3 | 2 | 9/9 programas compilan. Plantilla mixta Paso/Subtema. | Migrar a una sola plantilla. |
| Java | 19 | 9 | 2 | 20/21 compilan; la duración es «10 h». Plantilla mixta. | Dividir en dos módulos. |
| Java | 20 | 13 | 2 | `:311` la salida esperada «`true` y luego `false`» es falsa: la salida real es `true`/`true`, porque `" ANA@RUTAFLOW.COM ".contains("@")` es verdadero. `:285-287` pone «Paso 6» seguido de «Subtema 2.3». Duplica M4 (Optional, streams, paralelos). | Cambiar el predicado (p. ej. `texto.equals(texto.trim().toLowerCase())`) o la salida. Unificar con M4. |
| Java | 21 | 5 | 2 | Tercera plantilla. Remite «al proyecto integrador del Módulo 13», que ya pasó. | Plantilla única y mover el integrador al final. |
| Java | 22 | 5 | 2 | Compila tema por tema. `:1158` «Bad.java:5»: con la línea `// Bad.java` el error sale en la 6 (reproducido). Sin soluciones. | Corregir el número de línea y añadir soluciones. |
| iOS | 0 | 5 | 1 | `:124-130` crea `Sources/main.swift` y `:517` usa `Sources/Propiedad/main.swift`; ambos chocan con la plantilla de SwiftPM 6.2. `:60` exige macOS para un tema que `:17` declara apto para Windows/Linux. Tema «Experto» en M0. | Usar `Sources/<Nombre>/<Nombre>.swift` con `@main` o borrar el archivo generado. Mover T5 a M4 o M12. |
| iOS | 1 | 3 | 1 | Estructura rota: «Entrega», «Errores comunes» y «Fuentes» dentro del Paso 3 (`:40-100`). `:46` y `:137` crean otro proyecto `RutaFlowApp`, contra M0. `:108` usa React como base. | Reordenar los pasos, usar el proyecto único y quitar las remisiones a otros cursos. |
| iOS | 2 | 3 | 1 | `:143` «No reutilices el proyecto del Tema 1». `:40`, `:123` y `:206` se apoyan en Compose y React. | Igual. |
| iOS | 3 | 3 | 1 | `:110` explica con Android; sin análisis por líneas en 3/3 temas. | Explicación propia con análisis línea por línea. |
| iOS | 4 | 6 | 2 | `:326` depende del M12. `:419` cita un error de «'@Sendable' closure» cuando `addTask` recibe un cierre `sending`. Los temas 4–6 aparecen después de «## Laboratorio práctico» (`:229-257`). | Crear `RutaFlowKit` aquí, actualizar el diagnóstico y reordenar. |
| iOS | 5 | 3 | 1 | `:55` y `:73` usan un endpoint `example.com` inexistente y prometen `status: "delivered"`. `:11` tiene el curso Cloud como prerrequisito. | Servidor local o `URLProtocol` simulado incluido en el curso. |
| iOS | 6 | 5 | 2 | `:301` `try!`. `:305` `NotasView` no se define. | `do/catch` con mensaje y `NotasView` completa. |
| iOS | 7 | 3 | 1 | 0 ejercicios; `:37` y `:96` explican con Kotlin y Angular. | Añadir ejercicios con solución. |
| iOS | 8 | 3 | 1 | 0 ejercicios; 3/3 temas sin análisis. | Igual. |
| iOS | 9 | 3 | 1 | `:147` y `:207` explican con Kotlin, React, Spring y Android; `iPhone 17` fijo en los comandos. | Explicación autónoma y simulador parametrizado. |
| iOS | 10 | 5 | 2 | «Xcode 15»; `:24` compara con Android. | Declarar Xcode 26. |
| iOS | 11 | 3 | 1 | `:66` fallo deliberado falso (la firma automática registra App IDs). En el Paso 4, «Ejecuta el ejemplo» compila para simulador, lo que no comprueba firma ni Archive. | Usar como fallo una capacidad sin aprovisionar o un Team sin permisos. Mostrar `xcodebuild archive`. |
| iOS | 12 | 4 | 1 | `:3` «parte de una carpeta vacía» en el integrador. Diagrama duplicado. `:289` exige otros cursos. | Integrador sobre el repositorio acumulado. |
| iOS | 13 | 10 | 2 | `:622` «iOS 17+» con código de iOS 18 (`authorizationDenied`). `:750` «dispositivo o simulador» para `BGTaskScheduler`, que no funciona en Simulator. | Destino iOS 18 y dispositivo físico obligatorio. |
| iOS | 14 | 10 | 2 | `:177` «Parte de otra carpeta vacía… No reutilices el proyecto del Tema 1». `:204` ViewInspector sin versión fijada. 0 soluciones. | Proyecto único y `from: "x.y.z"`. |

## Defectos bloqueantes (impiden publicar)

1. **El entorno Java instala una versión que no ejecuta el curso.** `java/modulo-0.md:12` «`sudo apt install -y openjdk-21-jdk`» frente a `:6` «Java 25 o superior». Con 21 no compilan los ejemplos de M5:502 y M5:619 («is a preview API»), M7:332, M11:313 y M4:420 (Gatherers). `examples/java-maven/pom.xml:4` exige `<required.java>[25,)</required.java>`, y `javac --release 25` sobre JDK 21 da «error: release version 25 not supported» (reproducido). **Corrección:** JDK 25 en las tres plataformas y en todos los «Prerrequisitos»; validar con `java --version` ≥ 25 al inicio de cada módulo.
2. **Cero soluciones en iOS y una en Java.** La metodología dice «Las soluciones se mantienen plegadas», pero hay 0 `<details>` en `ios/` y 1 en `java/` (M12). **Corrección:** una solución plegada con idea de resolución por cada «Práctica independiente», «Practica» o «Ejercicios».
3. **iOS depende de otros cursos.** `ios/modulo-5.md:11` «Prerrequisitos: … Módulo 6 del track Cloud», y `:55`/`:73` llaman a `https://api.rutaflow.example.com/entregas`, un dominio reservado (RFC 2606) que nunca devolverá `status: "delivered"`. Más de 20 explicaciones se apoyan en React, Android, Kotlin, Angular o Spring (D3). **Corrección:** un servidor local o un `URLProtocol` simulado dentro del curso y explicaciones autónomas.
4. **iOS no usa la plantilla obligatoria.** 0/69 temas con «Subtema» (B1), cuando `CLAUDE.md` exige «3–6 subtemas con Contexto → Hazlo tú → Entiende → Cierra». **Corrección:** migrar o marcar el curso como «no publicado».
5. **iOS se contradice sobre el proyecto.** `ios/modulo-0.md` dice «Ese esquema no existe hasta que lo creas aquí, una sola vez». A la vez, 38 apariciones de «carpeta vacía» o «No reutilices el proyecto» (p. ej. `ios/modulo-12.md:3`, `ios/modulo-14.md:177`). **Corrección:** un solo repositorio `academia-ios` con etiquetas por módulo; borrar las instrucciones de «proyecto independiente».
6. **Errores técnicos que enseñan conceptos falsos** (detalle en la sección siguiente): Java M10:44/98 (JPMS), M20:311, M9:431, M0:382; iOS M0:124-130, M13:622, M13:750, M11:66.

## Defectos mayores (degradan el aprendizaje)

1. **Orden de módulos Java incoherente.** JPA (M16) va antes de JDBC (M17). El integrador (M13) va antes de 9 módulos que lo citan (`java/modulo-21.md` «proyecto integrador del Módulo 13»). M20 «Aplicación» va tras los módulos «Experto» (`java/modulo-0.md:97`). **Corrección:** reordenar a 0–7, 20, 22, 19, 8–9, 15, 17, 16, 10–12, 14, 18, 21, 13 o equivalente; el integrador al final.
2. **Duplicación Java.** Streams, Optional y paralelos en M4 y en M20 (T3, T7, T11). JUnit/Mockito en M9 y M15 T4. Multi-módulo en M8 T3 y M15 T3. **Corrección:** fusionar y dejar remisiones.
3. **Tres plantillas en Java** (subtemas, Paso 1–7, Aprende/Practica/Aplica) y restos de plantilla (`java/modulo-17.md:19` «el tema anterior de este módulo» dentro del Tema 1). **Corrección:** migrar todo a subtemas e incorporar `audit_plantilla.py` a `validate.sh`.
4. **Código en prosa en Java:** `java/modulo-8.md:18`, `java/modulo-11.md:40` y M13 T1–T3. **Corrección:** archivo completo con su salida.
5. **Voseo mezclado en iOS** (158 formas). **Corrección:** pasar a tuteo y añadir una comprobación con regex en `validate.sh`.
6. **Contenido Experto en módulos de fundamentos** (`ios/modulo-0.md:507`) y **dependencias hacia adelante** (`ios/modulo-4.md:326` «del módulo 12»). **Corrección:** mover el tema y crear el paquete donde se usa.
7. **Integradores débiles:** Java M13 en prosa y con «6 h» declaradas; iOS M12 basado en «carpeta vacía». **Corrección:** proyecto acumulado con código completo y criterio de aceptación ejecutable.
8. **Infringen su propio estándar:** `ios/modulo-6.md:301` `try!`, `ios/modulo-5.md:55` `URL(string:)!`, `java/modulo-1.md:597` dinero como `double`. **Corrección:** `do/catch`, `guard let` y `BigDecimal` o enteros en centavos.
9. **Las prácticas del track no coinciden con el contenido:** `java.track.ts:21` «Crea una clase Animal…» frente a `Guia/Vehiculo` en `java/modulo-1.md`. **Corrección:** regenerar las prácticas del track a partir del contenido.
10. **Laboratorios de cierre como tablas «Ver Tema N»** sin código ni salida (`java/modulo-1.md:757-763`, `java/modulo-2.md:553-558`, `ios/modulo-0.md:684-692`). **Corrección:** laboratorio con un incremento propio y una prueba.
11. **Fuera del contenido auditado pero citado:** `examples/README.md:126` describe `examples/tracks/<track-id>/`, que no existe (incluido `tracks/ios/` y `tracks/java/`). **Corrección:** borrar esa sección o restaurar la carpeta.

## Defectos menores

- `java/modulo-0.md:28-32`: metatexto editorial («Viene de una publicación de…», «ver `docs/capture-intake.json`», «no se inventó») dentro de la lección.
- `java/modulo-0.md:1189`: `gradle init` en M0 sin instalar Gradle; además usa una carpeta (`academia-java`) distinta de la del tema (`java-motor`).
- Las carpetas de proyecto cambian por módulo: `java-motor`, `java-motor-poo`, `java-motor-colecciones`, `java-dia-a-dia`, `java-composicion`, `academia-labs/java/...`. La metodología dice «Cada track mantiene un proyecto que evoluciona».
- Hitos con 5 casillas (`java/modulo-0.md:236-240`) cuando la metodología fija 4.
- `java/modulo-4.md:404-407`: comandos de compilación antes de crear el archivo.
- `java/modulo-22.md:1158`: número de línea del error desfasado en 1.
- Diagramas Mermaid con etiquetas en inglés (`ios/modulo-0.md` «(may be nil)»).
- `ios/modulo-14.md:204`: dependencia sin versión fijada.
- `ios.track.ts:169`: Keychain aparece dos veces en los temas del M13 («Keychain, Data Protection y privacidad» y «Keychain: guardar secretos de forma segura»).
- `ios/modulo-13.md` T8: ruta `RutaFlowApp/Info.plist`, que no existe en proyectos nuevos de Xcode (las claves se editan en la pestaña Info del target).

## Errores técnicos verificados

| # | Archivo:línea | Afirmación | Por qué es falsa | Fuente o prueba |
|---|---|---|---|---|
| 1 | `java/modulo-10.md:44` y `:98` | «quita `exports academia.rutas.api`. **Diagnóstico:** `Main` no puede acceder al tipo»; «confirma que `Main` deja de compilar» | `exports` controla el acceso **entre** módulos. `Main` está en el mismo módulo `academia.rutas`, así que compila y ejecuta igual. | Reproducido en `/tmp/aud/jp2`: con `exports academia.rutas;` compila e imprime `EN_RUTA`. |
| 2 | `java/modulo-20.md:311` | «**Resultado esperado:** `true` y luego `false`.» | `flujoIncorrecto` evalúa `" ANA@RUTAFLOW.COM ".contains("@")`, que es `true`. La salida real es `true`/`true`. | Ejecutado en JDK 21. |
| 3 | `java/modulo-9.md:431` | «cambia `new Random(42)` por `new Random()`… los valores de `kilos` que fallan cambian en cada ejecución» | Los bordes `{1, 2, 999, 1000}` se prueban primero, así que las propiedades 1 y 3 fallan siempre en `kilos=999`. Solo la 2 varía: falla en 900 en 3 de 5 ejecuciones. | 5 ejecuciones reproducidas. |
| 4 | `java/modulo-0.md:382` | «Lo que el lanzador exige siempre… es que el método `main` sea `public static void`» | En Java 25, la versión que pide `:6`, `main` puede ser de instancia, no `public` y sin `String[]`. | Oracle, *Compact Source Files and Instance Main Methods* (Java SE 25): «allowing instance `main` methods that are not `static`, need not be `public`, and need not have a `String[]` parameter». |
| 5 | `java/modulo-8.md:22` | «**Diagnóstico:** Maven no encuentra ese compilador» | `maven-compiler-plugin` usa el `javac` del JDK activo; el error es «release version N not supported», no la ausencia de un compilador. | `javac --release 25` en JDK 21 → «error: release version 25 not supported». |
| 6 | `java/modulo-15.md:3` | «endurece el proyecto multi-módulo del Módulo 14» | M14 no contiene ningún proyecto multi-módulo; el multi-módulo está en M8 T3. | `grep -c "multi-m" java/modulo-14.md` → 0. |
| 7 | `ios/modulo-0.md:124-130`, `:517`, `:665` | `swift package init --type executable` seguido de «Guarda `Sources/main.swift`» o «`Sources/Propiedad/main.swift`» | Desde SwiftPM 6.2 (Xcode 26) la plantilla genera `Sources/<Nombre>/<Nombre>.swift` con un `struct` `@main`. Añadir `main.swift` produce código de nivel superior en un módulo con `@main`, o un archivo fuera del target. | Foro oficial de Swift, *Update to swift package init executable template*: plantilla `./Sources/MyPkg/MyPkg.swift` con `@main`, «included in the `release/6.2` branch of SwiftPM». |
| 8 | `ios/modulo-13.md:622` | «Usa Xcode 15 o superior con destino iOS 17+» | El código usa `actualizacion.authorizationDenied` y `CLServiceSession`, ambos de iOS 18. Con destino 17 no compila sin `if #available`. | developer.apple.com, `CLLocationUpdate/authorizationDenied`: «iOS: 18.0.0 -». |
| 9 | `ios/modulo-13.md:750` | «Necesitas un dispositivo o simulador y el depurador de Xcode para forzar la tarea» | Simulator no admite procesamiento en segundo plano; `submit` falla con `.unavailable`. | developer.apple.com, `BGTaskScheduler.Error.Code.unavailable`: «The app runs on Simulator which doesn't support background processing». |
| 10 | `ios/modulo-11.md:66` | «cambiá el Bundle Identifier… sin crear un nuevo App ID… el Archive falla con un error de firma» | Con «Automatically manage signing» activo (Paso 4), Xcode registra el App ID nuevo, salvo que un administrador lo haya restringido. | Apple Developer Help, *Automatic signing controls*: restricciones «to prevent registration of new App IDs… when using Xcode automatic signing». |
| 11 | `ios/modulo-4.md:419` | «**Error esperado:** `Capture of 'contador' with non-sendable type… in a '@Sendable' closure`» | En el SDK actual `addTask` recibe `operation: sending @escaping @isolated(any) () async -> ChildTaskResult`, no `@Sendable`. El diagnóstico de Swift 6 es de región o `sending`, no el citado. | developer.apple.com, `TaskGroup/addTask(name:executorPreference:priority:operation:)`, declaración. |
| 12 | `ios/modulo-0.md:110` | «Esta decisión de diseño previene por completo la categoría de errores conocida… como `NullPointerException`» | `!`, `try!` y `as!` reintroducen el crash, y el propio tema lo demuestra (Paso 4, «termina con un error fatal»). | El propio texto del tema. |

**Dudas técnicas no verificadas** (requieren compilador Swift o JDK 25):

- `ios/modulo-0.md:569-572` consume `let codigo` de nivel superior en `main.swift`. Esas variables son globales, y hay indicios de que Swift no permite consumir globales no copiables: la discusión del foro «Consumption of class & global stored properties». Si es así, el ejemplo central del tema no compila. Hay que verificarlo con Swift 6.2.
- Versión `jackson-databind 2.22.4` (`java/modulo-6.md:160`): confirmé que la línea 2.22 existe; no confirmé el parche .4.
- Ejemplos de Java 22–25 (M4 T4, M5 T5–T6, M7 T4, M11 T4, M14 T5–T6): revisé la sintaxis contra la API, pero no los ejecuté. La firma de `StructuredTaskScope.open(Joiner…)` coincide con la de JDK 25.

## Plan de corrección priorizado

| Paso | Acción | Esfuerzo |
|---|---|---|
| 1 | Unificar versiones: JDK 25 en Java M0 y en los prerrequisitos; Xcode 26, iOS 18 y Swift 6.2 en iOS M0; plantilla de SwiftPM nueva. Registrar las versiones en una spec por curso, como exige la metodología («Cada curso registra en su spec la línea estable o LTS»). | 1–2 días |
| 2 | Corregir los 12 errores técnicos de la tabla y añadir una prueba de regresión: un script que extraiga, compile y ejecute los bloques Java y compare con «Resultado esperado». La base es el extractor de esta auditoría. | 3–4 días |
| 3 | iOS: eliminar las dependencias de otros cursos (más de 20 párrafos), proveer un backend simulado para M5, unificar el proyecto `RutaFlowApp` y pasar a tuteo. | 1–2 semanas |
| 4 | Escribir soluciones plegadas con idea de resolución para cada práctica (unos 186 temas) y migrar iOS (69 temas) y Java M17–M22 a la plantilla de subtemas. Incorporar `audit_plantilla.py` y una comprobación de voseo y de remisiones a otros cursos en `validate.sh`. | 4–6 semanas |
| 5 | Reordenar Java (JDBC antes de JPA, integrador al final, fusionar M4/M20, M8/M15 y M9/M15), reescribir los integradores Java M13 e iOS M12 con código completo, añadir glosario por curso y documentar el flujo autor → revisor pedagógico → revisor técnico. | 2–3 semanas |

## Qué no pude auditar

- **Ejecución de Swift:** no hay toolchain en este entorno. La exactitud de iOS se comprobó solo contra documentación de Apple y Swift.org. Ningún «Resultado esperado» de iOS está verificado por ejecución.
- **Ejemplos que piden JDK 22–27:** solo hay JDK 21.0.13. No ejecuté M4 T4, M5 T5–T6, M7 T4, M11 T4 ni la parte de JDK 24–27 de M14.
- **Laboratorios con Maven, Gradle, Testcontainers o H2** (`examples/java-maven`, `java-gradle`, `java-jpa-lab`): sin acceso a Maven Central (red limitada a pypi/npm). Solo comprobé que existen y su configuración (p. ej. enforcer `[25,)`).
- **Lectura completa:** no leí entero cada tema de los 186. Temas no leídos a fondo, revisados con grep, medición mecánica y compilación: Java M2, M3, M6, M12, M14 T1–T4, M18, M19, M21, M22 (solo compilación y T5 parcial); iOS M2, M3, M7, M8, M9, M10, M14 T3–T10. Pueden tener defectos que no figuran aquí.
- **Renderizado en la app Angular** (pliegue de soluciones y navegación entre temas): no levanté el servidor.

## Correcciones aplicadas (specs/014)

Fecha: 2026-11-18. Java se verificó ejecutando en `/tmp` con JDK 25.0.5 (paquete `openjdk-25-jdk` de Ubuntu 24.04, instalado para esta verificación) y JDK 21.0.13. Swift no se puede ejecutar aquí (descarga de swift.org bloqueada): iOS se verificó contra developer.apple.com y el código fuente de Swift/SwiftPM en GitHub. Maven Central está bloqueado, así que ningún `mvn` se ejecutó con dependencias.

| Defecto (archivo:línea original) | Estado | Cómo se verificó |
|---|---|---|
| `java/modulo-0.md:12` instala `openjdk-21-jdk` frente a «Java 25» (`:6`, `:108`, `:250`) | corregido | `apt-cache policy openjdk-25-jdk` en Ubuntu 24.04 (25.0.5 en `noble-updates`). Con JDK 25 compilan y se ejecutan M4 T4 (`[[true, true, true]]`), M5 T5 (`12 km, disponible`, con `--enable-preview`), M5 T6 y M7 T4 (`Destino: Norte`). |
| `java/modulo-0.md:349` fallo deliberado que exige tener un JDK 21 | corregido | Con JDK 25, `javac --release 21` da `implicitly declared classes are not supported in -source 21` (ejecutado). |
| `java/modulo-0.md:382` «`main` siempre `public static void`» (error técnico 4) | corregido | JDK 25 ejecuta una clase con `static void main` sin `public`; el `.class` falla en JDK 21 (ejecutado). Texto según JEP 512. |
| `java/modulo-0.md:28-32` metatexto editorial | corregido | Borrado; la ruta conserva la nota de que no hay paso 10. |
| Maven y Gradle no se instalan (`java/modulo-8.md`, `java/modulo-0.md:1189`) | corregido | Nota en M0: Maven ≥ 3.9 (3.9.11 enlaza `maven-compiler-plugin` 3.13.0, leído de `default-bindings.xml`) y Gradle ≥ 9.1 (tabla de compatibilidad de docs.gradle.org: Java 25 desde 9.1.0). `apt-cache` muestra Maven 3.8.7 y Gradle 4.4.1. |
| `java/modulo-8.md:18` `pom.xml` descrito en prosa | corregido | `pom.xml` y `Saludo.java` completos; `xmllint` valida el XML. `mvn package` no se ejecutó porque Maven Central está bloqueado. |
| `java/modulo-8.md:22` «Maven no encuentra ese compilador» (error técnico 5) | corregido | `javac --release 26` con JDK 25 da `error: release version 26 not supported` (ejecutado). |
| `java/modulo-9.md:431` fallo deliberado de la semilla (error técnico 3) | corregido | 6 ejecuciones con `new Random()`: las propiedades 1 y 3 fallan siempre en 999 y la 2 falla en 900 en 4 de 6. |
| `java/modulo-10.md:44` y `:98` `exports` dentro del mismo módulo (error técnico 1) | corregido | `Main` pasa a un módulo `academia.app`. Sin `exports` da `package academia.rutas.api is not visible`; con él imprime `EN_RUTA` (ejecutado). |
| `java/modulo-10.md` Subtema 1.3: rutas `src/cliente/cliente/module-info.java` (nuevo) | corregido | La ruta original da `module not found on module source path`. Con `src/cliente/module-info.java` aparece el error esperado `package academia.rutas is not visible` (ejecutado). |
| `java/modulo-10.md` Subtema 1.1: fallo deliberado sin error | corregido | Exportar `academia.rutas` compila sin error; el texto ahora lo dice y remite al 1.2 (ejecutado). |
| `java/modulo-11.md:318` y `:347` `allocateUtf8String` (nuevo; no existe desde JDK 22) | corregido | Con JDK 25, `allocateFrom` imprime `9` y la llamada a `strlen` devuelve `8` (ejecutado). |
| `java/modulo-15.md:3` «multi-módulo del Módulo 14» (error técnico 6) | corregido | Ahora remite al Módulo 8, Tema 3, «Proyectos multi-módulo». |
| `java/modulo-15.md:594` «Trazabilidad de la auditoría original» | corregido | Sección borrada; el `grep` de B2 no encuentra nada. |
| `java/modulo-20.md:311` salida «`true` y luego `false`» (error técnico 2) | corregido | El predicado exige texto limpio; la salida es `true`/`false` (ejecutado con JDK 21). |
| `java/modulo-22.md:1158` `Bad.java:5` | corregido | El error real sale en `Bad.java:6` (ejecutado). |
| `java/modulo-17.md:19` «tema anterior de este módulo» en el Tema 1 | corregido | Prerrequisito explícito: SQL básico, entorno de M0 y Maven de M8. |
| `java/modulo-4.md:404-407` compila antes de crear el archivo | corregido | Bloque `bash` borrado; el comando se conserva después del código. |
| `java/modulo-6.md:160` duda sobre Jackson `2.22.4` | no reproducible | `maven-metadata.xml` de repo1.maven.org lista 2.22.4. |
| Ejemplos JDK 24–27 de `java/modulo-14.md` | pendiente: no hay JDK 26/27 en el entorno | Las demás dudas de JDK 22–25 (M4 T4, M5 T5–T6, M7 T4, M11 T4) quedan resueltas arriba. |
| `ios/modulo-0.md:124-130`, `:517`, `:665` estructura SwiftPM (error técnico 7) | corregido | `InitPackage.swift` de `release/6.2`: la plantilla genera `Sources/<pkg>/<Tipo>.swift` con `@main`, que no puede convivir con `main.swift`. Los temas borran el archivo generado y usan `Sources/<pkg>/main.swift`. Se aplicó lo mismo en `ios/modulo-4.md:133` y `:458`, `ios/modulo-7.md:192`, `ios/modulo-13.md:385` (el original además hacía `cd Practica` a una carpeta que no existía) y `ios/modulo-12.md:372`. Sin compilar. |
| `ios/modulo-0.md:60` prerrequisito «macOS» frente a `:17` Windows/Linux | corregido | Los 4 temas piden Swift 6.2 en cualquier sistema. Notas de la versión de Xcode 26: «includes Swift 6.2… requires macOS Sequoia 15.6». |
| `ios/modulo-0.md:110` «previene por completo» (error técnico 12) | corregido | El texto reconoce que `!`, `try!` y `as!` provocan el crash que el propio Paso 4 muestra. |
| `ios/modulo-0.md:569-572` consumir una variable global no copiable | corregido; compilación pendiente | La variable pasa a ser local dentro de `func entregar()`, el caso permitido según SE-0390 («x1 consumed by call»; `deinit` al final del ámbito). Falta compilarlo con Swift 6.2. |
| Base de versiones iOS (Xcode 15/16 en `ios/modulo-10.md:385`, `ios/modulo-4.md:326` y `:458`, `ios/modulo-12.md:372`, `ios/modulo-13.md:622`) | corregido | Xcode 26 / Swift 6.2 declarados en M0 y en esas líneas (notas de la versión de Xcode 26). |
| `ios/modulo-4.md:326` depende de `RutaFlowKit` del Módulo 12 | corregido; compilación pendiente | El tema crea su propio paquete con un `Package.swift` completo (targets `Dominio` y `DominioTests`). |
| `ios/modulo-4.md:419` diagnóstico `@Sendable` (error técnico 11) | corregido; texto exacto pendiente de ejecución | Declaración de `addTask` en developer.apple.com (`operation: sending …`) y mensaje `passing closure as a 'sending' parameter risks causing data races…` en `DiagnosticsSIL.def` de swift `release/6.2`. |
| `ios/modulo-5.md:11`, `:13`, `:73`, `:75`, `:86` prerrequisito del curso Cloud | corregido | Sustituido por un servidor simulado con `URLProtocol` incluido en el tema. |
| `ios/modulo-5.md:55` `api.rutaflow.example.com` inexistente y `URL(string:)!` | corregido; compilación pendiente | `ServidorSimulado` intercepta el host reservado `rutaflow.test`; `guard let` en lugar de `!`. Firmas de `URLProtocol` verificadas en developer.apple.com. |
| `ios/modulo-5.md:23` `ErrorRed` usado antes de definirse | corregido | Marcado como fragmento; `ErrorRed` se define en el Paso 4. |
| `ios/modulo-5.md:122` (Tema 2) `request` sin definir (nuevo) | corregido; compilación pendiente | La función construye su `URLRequest` y usa la sesión simulada. |
| `ios/modulo-6.md:301` `try!` y `:305` `NotasView` sin definir | corregido; compilación pendiente | `do/catch` con mensaje y `NotasView.swift` completo (`@Query`, `modelContext`). |
| `ios/modulo-11.md:66` fallo de firma falso (error técnico 10) | corregido | El fallo ahora es la firma manual sin perfil, con `xcodebuild … archive`; se explica que, con la firma automática, Xcode registra el App ID (Apple Developer Help, *Automatic signing controls*; página de manual de `xcodebuild`). |
| `ios/modulo-13.md:622` destino iOS 17 con APIs de iOS 18 (error técnico 8) | corregido | developer.apple.com: `CLServiceSession` «iOS: 18.0.0 -»; `authorizationDenied` iOS 18 (citado por la auditoría). También se cambió `Info.plist` por la pestaña Info del target. |
| `ios/modulo-13.md:750` `BGTaskScheduler` en simulador (error técnico 9) | corregido | developer.apple.com, `BGTaskScheduler.Error.unavailable`: «The app runs on Simulator which doesn't support background processing». Ahora exige un iPhone y `generic/platform=iOS`. |
| `ios/modulo-14.md:991` «Trazabilidad de la auditoría original» | corregido | Sección borrada. |
| Más de 20 remisiones de iOS a otros cursos (D3) | corregido como prerrequisito; las comparaciones se mantienen | Aviso en M0 de que son opcionales, M5 sin Cloud y alternativa interna en `ios/modulo-12.md:289`. Quitarlas del texto es reescritura (specs/013 P5). |
| `ios/modulo-14.md:204` ViewInspector sin versión | pendiente: no se pudo consultar la última versión publicada (la API de GitHub no respondió) | — |
| Bloqueantes 2, 4 y 5 (soluciones, plantilla de subtemas, proyecto único y «carpeta vacía») y el voseo global | pendiente: reescritura fuera del alcance de specs/014 | Asignados a specs/013 P5. En las líneas tocadas se pasó a tuteo. |
