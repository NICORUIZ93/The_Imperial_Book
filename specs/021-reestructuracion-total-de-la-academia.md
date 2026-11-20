# 021 · Plan unificado: reestructuración total de la academia

**Estado:** en curso
**Origen:** el 2026-11-20 el dueño pidió, en una misma conversación: revisar todos los cursos por
duplicidad, redundancia, temas en el módulo equivocado, explicaciones y ejemplos básicos, estructura
desigual, temas faltantes («faltan miles, de básico a experto»), falta de imágenes, de código y de
linealidad; usar **Floci** para la nube local y arreglar el README; dar prioridad a **Java, Gradle y
Spring**; armar los temarios revisando índices de libros, sílabos y YouTube; y que **toda la página y todos
los cursos tengan el mismo formato educativo**. Autorizó reestructurar todo. Este documento unifica esos
pedidos en un solo plan.

## 1. Diagnóstico medido (16 cursos, 324 módulos, 1.608 temas)

| Problema | Medida |
|---|---|
| El mismo asunto enseñado desde cero en varios cursos | Docker: 31 temas en 6 cursos · Kubernetes: 15 en 5 · CI/CD: 16 en 8 · Observabilidad: 39 en 11 · Terraform/IaC: 20 en 12 · JWT/OAuth: 12 en 4 · Testing: 85 en 15 |
| Títulos idénticos repetidos | 14 |
| Forma de explicar distinta en cada tema | Java: 106 estructuras en 134 temas · Spring Boot: 116 en 137 · Microservicios: 1 |
| Temas sin ninguna imagen | 1.556 |
| Temas sin imagen ni diagrama | 665 |
| Temas sin nivel ni duración | 1.298 |
| Código verificado en una máquina real | solo Microservicios (37 laboratorios) e iOS |
| Floci | explicado a trozos en 42 módulos; 10 archivos mezclan LocalStack; el README no lo menciona |
| Temas faltantes | sin medir: requiere contrastar cada curso con fuentes externas (Fase 2) |

El listado completo de temas actuales está en `docs/reestructuracion/listado-de-temas.md` y `.csv`.

## 2. Reglas

1. **Un concepto, un curso dueño.** Se enseña una vez; los demás cursos lo usan y enlazan.
2. **Nada se pierde.** Todo tema fusionado, movido o retirado tiene su destino escrito antes; lo retirado
   va a la rama `archivo`.
3. **Un solo formato educativo** en cursos, módulos, temas, laboratorios y página (sección 3).
4. **De cero a experto de verdad.** Cuatro tramos por curso; al menos la mitad de los temas en Integración
   o Experto; cada tema explica cómo funciona por dentro, trae un ejemplo realista, el error real con su
   diagnóstico y el criterio de uso.
5. **Cobertura contra fuentes** (sección 4): un curso no se cierra con temas «faltan» sin decidir.
6. **Linealidad.** Nivel y minutos en cada tema; el nivel no baja dentro del capítulo; nada se usa antes
   de enseñarse.
7. **Prioridad: Java → Gradle → Spring.** Gradle es curso propio y la herramienta por defecto de los
   laboratorios JVM (Kotlin DSL, wrapper, catálogo de versiones); Maven queda como alternativa.
8. **Floci es la nube local** (AWS, Azure y GCP con el `docker-compose.yml` de la raíz). LocalStack solo
   como comparación. Cada laboratorio dice qué emula Floci y qué cambia en la nube real.
9. **Exactitud.** Nada sin ejecutar o sin fuente primaria; cada curso se verifica en el Mac del dueño.
10. **Siempre la versión extendida.** Decisión del dueño (2026-11-20): nunca se elige la variante reducida
    de un temario o de un curso; ante dos tamaños, el más completo. Los temas que una fuente cubre y el
    curso no, se añaden.
11. **El dueño aprueba** el formato, el mapa de conceptos y cada temario antes de reescribir. Se trabaja un
    curso a la vez y en `main`.

## 3. Formato educativo único

Se define una vez en `docs/METODOLOGIA-DE-APRENDIZAJE.md` y la app lo dibuja siempre igual.

| Nivel | Formato fijo |
|---|---|
| **Curso** | portada (para quién es, prerrequisitos, qué sabrás hacer, mapa, proyecto guía, duración, versiones, entorno) · cuatro tramos con el mismo nombre: Fundamentos, Aplicación, Integración, Experto · proyecto final con rúbrica |
| **Módulo** | cabecera (objetivo, prerrequisitos, duración, versiones, laboratorio, mapa) · 3 a 7 temas · cierre con resumen, autoevaluación y siguiente módulo |
| **Tema** | 12 secciones con el mismo nombre y orden: 1 Ubicación y prerrequisitos · 2 Objetivo · 3 Por qué importa · 4 Analogía · 5 Diagrama · 6 Explicación (nivel 0, intermedio, maestro) · 7 Código ejecutable y salida real · 8 Mini-laboratorio · 9 Verificación · 10 Error común y diagnóstico · 11 Pregunta con respuesta modelo · 12 Cuándo usarlo y cuándo no. Encabezado «Tema N: título · nivel · minutos» |
| **Laboratorio** | `examples/<curso>/modulo-N/` con README, versiones fijadas y `verificar.sh` que termina en «RESULTADO: OK» |
| **Página** | los mismos componentes en todos los cursos: ficha de tema, código con nombre de archivo y copiar, salida esperada, avisos, diagrama ampliable, índice del tema, progreso y navegación |

**Cómo mejora la explicación en todos los cursos:** del porqué al cómo; tres niveles en el mismo tema; un
proyecto guía que crece módulo a módulo (sin ejemplos sueltos); código completo y ejecutado con su salida
real; un diagrama por tema y capturas reales; el error real y su diagnóstico; práctica comprobable;
criterio de uso; e hilo entre temas sin repetir.

**Énfasis propio de cada curso:**

| Curso | Cómo se explica mejor |
|---|---|
| Fundamentos | del problema cotidiano a la abstracción; todo se prueba en la terminal del estudiante; cada concepto (HTTP, Git, SQL, redes) con una traza real que se pueda leer línea a línea |
| Java | modelo de memoria dibujado (pila, heap, referencias) en cada tema de lenguaje; bytecode con `javap` y JFR para mostrar qué hace la JVM; evolución del mismo ejemplo de Java 8 a 25; concurrencia con fallos reproducibles (carreras, bloqueos) |
| Gradle | cada build se explica con su grafo de tareas y `--scan`/`--info`; se parte de un build roto o lento real y se arregla; siempre Kotlin DSL y multi-proyecto, no builds de juguete |
| Spring | «la magia» abierta: qué beans crea la autoconfiguración y por qué (informe de condiciones, depurador), proxies y transacciones con traza; cada tema sobre el mismo servicio que crece hasta producción; pruebas en cada tema |
| JavaScript | el motor a la vista: pila de llamadas, cola de tareas y microtareas dibujadas; cada rareza del lenguaje con su regla de la especificación; ejercicios en el navegador y en Node |
| Node | el bucle de eventos y los streams medidos (no contados): perfiles, fugas y contrapresión reproducidas; un mismo servicio de la API mínima a producción |
| React | modelo mental de render y reconciliación con el Profiler; cada hook con el fallo que causa usarlo mal; una app que crece (estado, datos, rutas, pruebas, rendimiento) |
| Angular | detección de cambios y signals visualizados; inyección de dependencias con su árbol; la misma app que crece con pruebas y SSR |
| Docker | qué es de verdad un contenedor (namespaces, cgroups, capas) inspeccionando imágenes reales; cada Dockerfile se mide (tamaño, tiempo, vulnerabilidades) antes y después |
| Kubernetes | cada objeto se observa reconciliándose (`kubectl get -w`, eventos); fallos provocados (pod que no arranca, sonda mal puesta) y su diagnóstico; todo en kind |
| DevOps | un mismo servicio recorre el pipeline completo; cada práctica con su métrica (DORA) y su incidente de ejemplo; herramientas reales, no descripciones |
| Cloud | cada servicio primero en **Floci** (local, repetible) y luego «qué cambia en la nube real»: permisos, costo y límites; arquitecturas dibujadas y cotizadas |
| Microservicios | ya cumple la plantilla; se mantiene Spring y Node por separado y se enlazan los temas espejo |
| Android / Kotlin Multiplatform | ciclo de vida y recomposición visualizados; la misma app crece por capas; cada tema corre en emulador con captura real |
| iOS | SwiftUI y concurrencia de Swift con diagramas de estado y de actores; la misma app crece; capturas reales del simulador |
| Flutter | árbol de widgets, elementos y render objects dibujado; rendimiento medido con DevTools; la misma app crece |
| Control | de la intuición física a la ecuación y a la simulación: cada concepto con su gráfica generada por código ejecutable y un sistema real (tanque, motor) |
| Diseño de sistemas | cada diseño parte de requisitos y números (carga, latencia, costo), compara al menos dos alternativas y termina en un ADR |

## 4. Fuentes obligatorias del temario de cada curso

1. Documentación y especificación oficiales completas.
2. Índices de al menos tres libros de referencia.
3. Objetivos de las certificaciones vigentes.
4. Sílabos de universidades y bootcamps.
5. Temarios de cursos largos de YouTube y plataformas.
6. Rutas públicas (roadmap.sh) y entrevistas de nivel sénior.

De cada fuente se toma la lista de temas, no su texto, y se cita con enlace. El resultado es un temario
único por curso, deduplicado y ordenado de básico a experto, con cada tema marcado «ya está», «está pero
básico» o «falta».

## 5. Orden de los cursos

Prioridad fijada por el dueño el 2026-11-20: 1.º Java · 2.º Spring Boot · 3.º Microservicios con Spring Boot
(con Gradle; el más completo) · 4.º Flutter · 5.º iOS · 6.º Angular, que incluye completo el desarrollo nativo
con Angular (aplicaciones móviles nativas hechas con Angular). Gradle (curso nuevo) se escribe junto a Java y
Spring porque sus laboratorios lo usan. Después: Fundamentos, JavaScript, Node, React, Docker (nuevo),
Kubernetes (nuevo), DevOps, Cloud (con Floci), Android, Kotlin Multiplatform, Control, Diseño de sistemas
(nuevo) y RutaFlow (proyecto integrador, al final).

**Microservicios (decisión del dueño, 2026-11-20):** es el curso insignia y debe ser el más completo de cero
a experto. Su pista de Spring Boot se construye con **Gradle** (Kotlin DSL, wrapper y catálogo de versiones):
los laboratorios hoy en Maven (`examples/microservicios/`, módulos de Spring y el proyecto final) se migran
a Gradle y se vuelven a verificar en el Mac del dueño; Maven queda solo como nota de equivalencia. Va
inmediatamente después de Java, Gradle y Spring, y su temario también se contrasta con las fuentes de la
sección 4 para añadir lo que falte.

Alcance mínimo de los prioritarios (se detalla en su temario):

| Curso | Debe llegar hasta |
|---|---|
| Java (JDK 25) | lenguaje moderno completo, colecciones y streams por dentro, concurrencia (hilos virtuales, structured concurrency), JVM (memoria, GC, JIT, class loading), módulos, E/S y NIO, redes, JDBC, reflexión y anotaciones, pruebas, rendimiento y diagnóstico (JFR, jcmd) |
| Gradle | modelo y ciclo de vida, Kotlin DSL, tareas y caché incremental, catálogos de versiones, multi-proyecto, convention plugins, plugins propios, build y configuration cache, publicación, Gradle para Spring y Android/KMP, builds lentos |
| Spring (Boot 4, Framework 7) | contenedor por dentro (beans, proxies, AOP, autoconfiguración), Web MVC y WebFlux, Data y JPA a fondo, Security (OAuth2/OIDC), pruebas (slices, Testcontainers), mensajería, observabilidad, AOT/native, despliegue |

## 6. Fases

| Fase | Qué se hace | Entregable | Aprueba el dueño |
|---|---|---|---|
| **0 · Cerrar lo abierto** | fusionar sin pérdida el trabajo local del dueño con Microservicios y dejar todo en `main`; README nuevo con el arranque de la app y de Floci | `main` unificado | — |
| **1 · Formato** | escribir el formato único en la metodología y una lección de ejemplo completa | metodología + lección modelo | **sí** |
| **2 · Mapa de conceptos** | clasificar los 1.608 temas por concepto y curso dueño; acción por tema: queda, se fusiona, se mueve, pasa a enlace o se retira | `docs/reestructuracion/mapa-de-conceptos.md` | **sí** |
| **3 · Temarios objetivo** | contrastar cada curso con las fuentes de la sección 4; listar faltantes y temas básicos a profundizar; fijar el orden lineal | `docs/temarios/<curso>-objetivo.md` (uno por curso) | **sí, cada uno** |
| **4 · Validador y app** | validador único de formato dentro de `validate.sh` y de la integración continua; la app dibuja las 12 secciones con los mismos componentes; prueba de navegador por curso | validador + app | — |
| **5 · Reescritura** | curso por curso, en dos pasadas: estructura (mover lo existente al formato) y contenido (profundidad, temas nuevos, diagramas, código ejecutado, laboratorio por módulo en Gradle donde aplique); se conserva el progreso de lectura | curso al 100 % del validador | — |
| **6 · Floci** | lección de entrada «Nube en local con Floci» y laboratorios de nube verificados; se hace con Cloud | lección + laboratorios | — |
| **7 · Cierre por curso** | laboratorios en el Mac del dueño y revisión de la página real en el navegador | curso cerrado en el tablero | **sí** |

El avance por curso queda en `docs/reestructuracion/ESTADO.md`.

## Criterios

Cada fase deja en `docs/reestructuracion/` el informe que prueba su criterio (con el comando del validador
que se cree en la Fase 3); la verificación de abajo comprueba que ese informe existe.

- **Z0** `hecho` — `main` contiene Microservicios completo y el trabajo local del dueño, sin temas
  perdidos, y el README explica cómo arrancar la app y Floci.
  Verificación: `grep -q "^- \[x\] Z0 " docs/reestructuracion/ESTADO.md`
- **Z1** `pendiente` — Existe el mapa de conceptos con la acción de cada tema y el dueño lo aprobó.
  Verificación: `grep -q "^- \[x\] Z1 " docs/reestructuracion/ESTADO.md`
- **Z2** `pendiente` — Cada curso tiene su temario objetivo (temas faltantes y orden lineal) aprobado.
  Verificación: `grep -q "^- \[x\] Z2 " docs/reestructuracion/ESTADO.md`
- **Z3** `pendiente` — Un validador único comprueba la plantilla en todos los cursos y los títulos no se
  repiten en toda la academia.
  Verificación: `grep -q "^- \[x\] Z3 " docs/reestructuracion/ESTADO.md`
- **Z4** `pendiente` — Todos los temas declaran nivel y minutos, y ningún capítulo incumple el orden.
  Verificación: `grep -q "^- \[x\] Z4 " docs/reestructuracion/ESTADO.md`
- **Z5** `pendiente` — Todo tema tiene diagrama o imagen con texto alternativo.
  Verificación: `grep -q "^- \[x\] Z5 " docs/reestructuracion/ESTADO.md`
- **Z6** `pendiente` — Floci tiene una lección de entrada, LocalStack no aparece fuera de comparaciones y
  los laboratorios de nube pasan contra Floci en el Mac.
  Verificación: `grep -q "^- \[x\] Z6 " docs/reestructuracion/ESTADO.md`
- **Z7** `pendiente` — Los laboratorios de todos los cursos pasan en el Mac del dueño.
  Verificación: `grep -q "^- \[x\] Z7 " docs/reestructuracion/ESTADO.md`
- **Z8** `pendiente` — Java, Gradle (curso propio) y Spring pasaron por todas las fases antes que el
  resto, con sus laboratorios en Gradle verificados en el Mac.
  Verificación: `grep -q "^- \[x\] Z8 " docs/reestructuracion/ESTADO.md`
- **Z9** `pendiente` — Profundidad: en cada curso al menos la mitad de los temas son de nivel Integración
  o Experto, y todo tema tiene ejemplo realista, error real diagnosticado y criterio de uso.
  Verificación: `grep -q "^- \[x\] Z9 " docs/reestructuracion/ESTADO.md`
- **Z10** `pendiente` — Formato único: metodología aprobada, validador de formato dentro de `validate.sh`,
  la app dibuja las 12 secciones con los mismos componentes y todos los cursos están al 100 %.
  Verificación: `grep -q "^- \[x\] Z10 " docs/reestructuracion/ESTADO.md`
- **Z11** `pendiente` — Microservicios: los laboratorios de Spring Boot se construyen con Gradle y pasan en
  el Mac; su temario está contrastado con las fuentes y sin «falta» pendientes.
  Verificación: `grep -q "^- \[x\] Z11 " docs/reestructuracion/ESTADO.md`
