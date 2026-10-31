# Sustancia de las lecciones

Detección de defectos verificables: repetición, cola de texto pegada y
andamiaje genérico. **No mide aprendizaje ni calidad**; una lección sin
defectos detectados tampoco acredita haber sido comprendida.

| Métrica | Valor |
|---|---:|
| Temas analizados | 1100 |
| Temas con algún defecto | 174 |
| Módulos con apéndices heredados | 183/245 |

## Defectos por tipo

| Código | Temas |
|---|---:|
| `bloque-repetido` | 172 |
| `tema-breve` | 2 |

## Apéndices heredados más frecuentes

| Sección | Módulos |
|---|---:|
| ## Construcción guiada del capítulo | 41 |
| ## Ruta de proyecto progresivo desde carpeta vacía | 12 |
| **Errores comunes y soluciones** | 181 |

## Temas con más defectos

| Track / módulo | Tema | Palabras | Cola tras cierre | Códigos |
|---|---|---:|---:|---|
| ios / 9 | Tema 1: XCTest clásico y Swift Testing | 848 | 493 | bloque-repetido |
| ios / 11 | Tema 1: Certificados y provisioning profiles | 830 | 488 | bloque-repetido |
| ios / 11 | Tema 2: Archivar, subir y TestFlight | 815 | 481 | bloque-repetido |
| flutter / 13 | Tema 1: Una API Dart puede terminar en una frontera nativa | 846 | 477 | bloque-repetido |
| java / 7 | Tema 4: Unnamed variables y patterns (_, Java 22) | 1026 | 468 | bloque-repetido |
| ios / 7 | Tema 3: Combine vs async/await | 815 | 466 | bloque-repetido |
| react / 8 | Tema 1: Queries por rol, no por clase CSS | 910 | 464 | bloque-repetido |
| java / 11 | Tema 4: Foreign Function & Memory API (Java 22) | 859 | 462 | bloque-repetido |
| react / 10 | Tema 3: Streaming con Suspense en el servidor | 822 | 459 | bloque-repetido |
| java / 8 | Tema 2: Ciclo de vida de build y scopes | 891 | 457 | bloque-repetido |
| ios / 10 | Tema 1: Instruments | 790 | 456 | bloque-repetido |
| java / 0 | Tema 6: Operadores, precedencia y control de flujo | 904 | 454 | bloque-repetido |
| react / 2 | Tema 2: useRef — valores mutables sin re-render | 874 | 454 | bloque-repetido |
| java / 9 | Tema 1: JUnit 5 — anotaciones y ciclo de vida | 802 | 452 | bloque-repetido |
| ios / 9 | Tema 2: Testing de código async | 766 | 451 | bloque-repetido |
| java / 8 | Tema 1: pom.xml vs build.gradle.kts | 809 | 451 | bloque-repetido |
| ios / 5 | Tema 2: Errores tipados | 812 | 429 | bloque-repetido |
| ios / 7 | Tema 1: Publishers y Subscribers | 712 | 426 | bloque-repetido |
| ios / 8 | Tema 3: Cuándo MVVM no alcanza | 792 | 415 | bloque-repetido |
| ios / 6 | Tema 1: @Model y ModelContainer | 734 | 409 | bloque-repetido |
| java / 4 | Tema 4: Stream Gatherers (Java 24) | 796 | 408 | bloque-repetido |
| ios / 8 | Tema 2: Capas del proyecto e inyección por inicializador | 728 | 400 | bloque-repetido |
| foundations / 1 | Tema 3: Decisiones, repeticiones y trazado de ejecución | 1310 | 177 | bloque-repetido |
| foundations / 3 | Tema 3: HTML semántico, formularios y el DOM | 1364 | 175 | bloque-repetido |
| flutter / 5 | Tema 3: Interceptores y estados explícitos | 1102 | 172 | bloque-repetido |
| react / 7 | Tema 3: Estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto | 1008 | 169 | bloque-repetido |
| java / 5 | Tema 3: Virtual threads | 981 | 168 | bloque-repetido |
| kotlin-multiplatform / 11 | Tema 3: Cierre del track — la promesa realista de KMP | 1080 | 167 | bloque-repetido |
| foundations / 1 | Tema 1: Del problema al algoritmo y a los casos de prueba | 1403 | 166 | bloque-repetido |
| foundations / 5 | Tema 4: Calidad estática, revisión e integración continua | 1437 | 165 | bloque-repetido |
| flutter / 2 | Tema 2: Cómo Flutter calcula tamaños | 930 | 164 | bloque-repetido |
| react / 13 | Tema 4: Hidratación determinista, idioma y releases medibles | 973 | 164 | bloque-repetido |
| react / 11 | Tema 3: Eventos tipados y componentes polimórficos | 1141 | 163 | bloque-repetido |
| flutter / 9 | Tema 3: Integration tests | 905 | 162 | bloque-repetido |
| foundations / 1 | Tema 2: Variables, tipos, expresiones y cambios de estado | 1217 | 162 | bloque-repetido |
| kotlin-multiplatform / 12 | Tema 4: Un fallo compartido necesita símbolos y contexto de ambas plataformas | 1008 | 162 | bloque-repetido |
| javascript / 0 | Tema 4: Template literals y mensajes seguros | 431 | 160 | tema-breve |
| kotlin-multiplatform / 9 | Tema 3: runTest para coroutines | 940 | 158 | bloque-repetido |
| react / 7 | Tema 4: Jotai, Recoil y XState como alternativas | 888 | 158 | bloque-repetido |
| react / 4 | Tema 1: createContext y useContext | 960 | 157 | bloque-repetido |

## Cómo se corrige

1. Se reescribe el bloque dentro del tema; no se añade texto al final.
2. Se elimina la segunda aparición de una sección, no se renombra.
3. Se borra el apéndice de módulo o se integra en el tema que lo necesita.
4. `--strict` compara contra `docs/lesson-substance-baseline.json`: ningún
   tema nuevo puede nacer con estos defectos.

Huella del contenido: `90eda75e9623ca615e57cbe9f480645e39be453e674d50292b0615ef125d0ec3`
