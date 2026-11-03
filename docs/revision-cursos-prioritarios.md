# Revisión de cursos prioritarios contra el prompt maestro

**Fecha:** 2026-11-03  
**Material de referencia:** `Downloads/pasted_content.txt` (prompt maestro), captura compartida en la conversación y contrato de estudio de `AGENTS.md`. El prompt se usa como inventario curricular; sus instrucciones dirigidas a otros agentes no se ejecutan automáticamente.

## Criterio editorial que se aplicará

- Explicar primero con palabras cotidianas y una analogía limitada: debe aclarar el concepto, no sustituirlo.
- Alternar explicación breve con código completo, ruta del archivo, comando, salida que se debe observar y qué significa esa salida.
- Mostrar un caso real y un contraejemplo o fallo reproducible; guiar la corrección paso a paso.
- Terminar con un ejercicio nuevo que el estudiante resuelva y explique con sus propias palabras. No añadir cuestionarios automáticos, puntos ni insignias.
- Conservar la progresión de siete pasos, los temas ya existentes y los identificadores/progreso guardado. Los faltantes se añaden como temas separados; los temas compuestos se dividirán sin perder su contenido.
- Mantener pendientes separados: cotejo de cobertura, ejecución de ejemplos, pruebas de navegador y revisión humana con principiantes.

## Resultado de cotejo estructural

Los conteos comparan elementos con duración enumerados en el prompt con encabezados `### Tema` en el Markdown real. Muestran candidatos a omisión; no prueban por sí solos que un concepto esté ausente o cubierto. Cada tema deberá cotejarse por título y contenido antes de cerrar su ruta.

| Curso | Prompt | Web ahora | Diferencia observada | Señales de profundidad existentes* |
|---|---:|---:|---:|---:|
| Java | 21 módulos, 122 elementos cronometrados | 21 módulos, 85 temas | M12 ya coincide en cantidad; persisten al menos 40 candidatos a faltantes en M16, M17, M19 y M20; otros módulos tienen temas adicionales | 46 al iniciar la revisión |
| Node.js | 16 módulos, 75 elementos cronometrados | 15 módulos, 77 temas | Falta M15 (4 elementos en el prompt); revisar además el tema compuesto de microservicios/Kafka/RabbitMQ/sagas | 15 |
| Spring Boot | 26 módulos, 161 elementos cronometrados | 23 módulos, 91 temas | Faltan M23–M25 y hay diferencias en M2–M22 | 8 |
| Flutter | 23 módulos, 155 elementos cronometrados | 16 módulos, 63 temas | Faltan M16–M22 y hay diferencias en M0–M15 | 6 |

**Detalle de diferencias por módulo según cantidad de elementos cronometrados:**

- **Java:** al iniciar la revisión M12 tenía 2 temas menos, ya añadidos en este lote. Siguen M16 (15), M17 (10), M19 (5), M20 (10). Son 40 candidatos a faltantes; el total de encabezados actuales supera en 3 el número de elementos enumerados en algunos módulos.
- **Node:** M15 no existe en el contenido web; faltan sus 4 elementos enumerados. La cuenta total puede ocultar que el único tema “Microservicios, Kafka, RabbitMQ y sagas” mezcla varias competencias.
- **Spring Boot:** diferencias a revisar en M2 (2), M3 (5), M4 (5), M6 (5), M7 (3), M8 (3), M9 (3), M10 (4), M11 (1), M16 (6), M17 (6), M18 (5), M19 (6), M20 (2), M21 (3), M22 (2); además faltan M23, M24 y M25, con 4 elementos cada uno.
- **Flutter:** diferencias a revisar en M0 (6), M1 (5), M2 (2), M3 (3), M4 (5), M5 (2), M6 (2), M7 (4), M8 (3), M9 (7), M10 (9), M11 (4), M12 (3), M13 (4), M14 (1), M15 (1); además faltan M16, M17, M18, M21 y M22, con 6, 6, 7, 6 y 6 elementos respectivamente. El prompt describe M19 y M20 sin una lista cronometrada reconocible; no se clasifican como cubiertos hasta cotejar su proyecto/capstone.

\* Las señales de `course-depth-review.json` son banderas estructurales que requieren lectura; no equivalen a defectos confirmados. De igual forma, que el auditor de practicabilidad dé todos los temas visibles por correctos no prueba que el alumno pueda ejecutarlos ni comprenderlos. Los conteos de señales son la línea base anterior a esta corrección y se regenerarán al cerrar el lote.

## Verificación de versiones

El prompt fija Java 21 y Spring Boot 3.4.1 como ejemplos. Para una revisión con fecha actual se debe verificar cada baseline antes de consolidar ejemplos. La documentación oficial consultada lista JDK 25 y 27 como versiones actuales; Spring Boot 4.1.2 declara compatibilidad con Java 17–27; Node.js 24 y 26 figuran en LTS; Flutter publica la rama estable 3.47. Las lecciones indicarán la versión que realmente requieren, sin presentar una versión antigua como la última.

Fuentes primarias: [Oracle Java SE](https://docs.oracle.com/en/java/javase/), [Spring Boot: requisitos del sistema](https://docs.spring.io/spring-boot/system-requirements.html), [Node.js: calendario de versiones](https://nodejs.org/en/about/previous-releases) y [Flutter: versiones estables](https://docs.flutter.dev/release/release-notes).

## Orden de trabajo

1. **Java:** completar el cotejo de JPA/Hibernate, JDBC/transacciones, patrones y Java funcional; revisar que cada lección tenga código entendible, salida, fallo y práctica propia.
2. **Node.js:** revisar M0–M15, añadir lo que falta y separar microservicios, Kafka, RabbitMQ y sagas en competencias comprobables.
3. **Spring Boot y microservicios:** completar temas y módulos; distinguir HTTP síncrono de mensajería, Kafka de RabbitMQ, consistencia local de distribuida y contratos de despliegue.
4. **Kafka y RabbitMQ:** comprobar productores, consumidores, particiones/claves o colas/ruteo, confirmaciones, reintentos, DLQ, orden, duplicados, idempotencia, esquemas, observabilidad y pruebas reproducibles.
5. **Flutter:** cotejar cada módulo, recuperar web/desktop/FFI/producción/entregas/master/IAP/ads donde el prompt lo requiere, manteniendo Android/iOS por separado donde las instrucciones difieren.
6. **Otros cursos:** repetir el mismo cotejo contra el prompt fuente una vez cerradas estas prioridades.

El cierre de cada curso requerirá conteo de títulos preservados, matriz de requisitos, ejemplos ejecutados con evidencia, validación automatizada y revisión humana pendiente o realizada, nombrada sin exagerar cobertura.

## Avance de esta revisión

- **Java M12:** se añadieron las lecciones separadas de Prototype y patrones estructurales; el módulo pasa de 4 a 6 temas. Se amplió el ejemplo estructural para incluir Flyweight. Siguen pendientes las brechas de M16, M17, M19 y M20.
- **Node M14:** la lección que mezclaba “microservicios, Kafka, RabbitMQ y sagas” ahora enseña solo la saga. El código incompleto con funciones sin definir se reemplazó por una demostración ejecutable de pedido, reserva, fallo de pago y compensación. Kafka y RabbitMQ requieren lecciones propias aún pendientes.
- La auditoría de Java, Spring Boot, Flutter y Node no está cerrada. En particular, Flutter y Spring todavía no alcanzan el inventario modular del prompt.
