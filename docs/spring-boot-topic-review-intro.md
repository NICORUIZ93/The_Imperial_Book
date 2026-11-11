# Spring Boot: revisión de los 111 temas, uno por uno

Fecha: 11 de noviembre de 2026. Este informe complementa `SPRING-BOOT-CIERRE.md`:
el 100 % anterior medía estructura editorial, no aseguraba claridad absoluta.
Esta revisión encontró y corrigió fallos que el conteo de marcadores no detectaba.

## Respuesta a las preguntas

- **¿Cada subtema existe y desarrolla algo?** Sí: los 393 tienen contenido después
  del encabezado. Se revisó el recorrido de los 111 temas: acción, explicación,
  resultado, error y cierre. Algunos incluyen código completo; otros trabajan
  sobre archivos existentes del laboratorio o proponen un ejercicio independiente.
  Una referencia a un archivo real no es un subtema vacío. El JSON adjunto enumera
  cada subtema, su ubicación y el volumen de prosa/código; ese volumen no califica
  la calidad pedagógica.
- **¿Es lineal?** M0–M7 evolucionan `academia-spring`. M1 genera otro proyecto solo
  para estudiar Initializr. Desde M8 hay laboratorios aislados y M12 reúne un
  corte integrador. M16–M21 refuerzan temas previos con otros casos; la numeración
  no significa que todas las carpetas se fusionen automáticamente. Se aclararon
  esas transiciones, reinicios, dependencias y estados de partida.
- **¿Está con Gradle?** La revisión inicial solo comprobaba Maven. La ampliación
  posterior agrega builds Groovy y wrappers Gradle 9.8.2 a los 50 proyectos raíz
  del inventario `spring-gradle-labs.json`, incluyendo contratos multi-módulo.
  Consulta [la guía Gradle](SPRING-BOOT-GRADLE.md) y la ejecución registrada en
  `spring-gradle-verification.json`. Las fuentes y pruebas son compartidas;
  M22 sigue usando Java directo/Node y el complemento SOAP de M20, Python.
  Esta ampliación no acredita todos los ejercicios ni escenarios de producción.
- **¿Está actualizada?** La base usa Boot 4.1.2 y Java 25. Se contrastaron sus APIs
  y matrices de compatibilidad con fuentes primarias; se corrigieron tres enlaces
  404, una referencia snapshot y una regla antigua de Avro. Hay versiones fijadas
  deliberadamente: AI mantiene Boot 4.0.9 compatible; los labs espaciales usan
  MySQL 8.0.36, que no es la versión actual. No se declara que todas las imágenes
  de infraestructura estén actualizadas ni libres de vulnerabilidades por compilar.

## Cambios concretos de esta revisión

Se retiró JWT anticipado de M2; se corrigieron continuaciones de línea curl,
imports y dependencias de pruebas Boot 4; los archivos de M6 apuntan ahora al
caso que realmente se ejecuta. M15 T2 vuelve al laboratorio singleton correcto.
Las referencias genéricas al POM se sustituyeron por código o tests que explican
el comportamiento. M12 reconoce sus siete pruebas y la seguridad ya presente
en el laboratorio final. M20 conserva ocho temas con numeración consistente.

El wrapper de Modulith ahora funciona al copiar su carpeta. El script AOT conserva
el log fuera de `target` durante `clean`, para no depender de una compilación previa.
Se corrigieron la instalación de JDK 25, el paquete Java de Initializr, el socket
Podman, el rango inclusivo de páginas y la explicación del default de unión en Avro.

## Evidencia de ejecución

`spring-boot-topic-review-execution.json` registra las comprobaciones dirigidas:
M0–M1 (5 pruebas), referencia acumulativa M2–M7 (43), singleton PostgreSQL (2),
ArchUnit (3) y copia autónoma de Modulith (4): **57 pruebas JUnit**, sin fallos.
La referencia M2–M7 ahora incluye OpenAPI publicado, paginación con límites y orden,
Lombok/MapStruct con políticas explícitas, los tres casos N+1 y más casos negativos.
AOT se comprueba por separado como JVM con metadata, sin afirmar binario nativo.

Estas ejecuciones se suman al registro previo de 47 proyectos Maven, cuyo alcance
está en `spring-boot-lab-verification.json`. No equivalen a ejecutar por separado
cada uno de los 393 ejercicios ni todas sus mutaciones. No se repite aquí la
suite completa de navegador; el cierre anterior con Archify sigue incompleto.
El control de enlaces HTTP tampoco equivale a validar cada afirmación de una página.

## Fuentes primarias y vigencia

| Comprobación | Referencia y resultado |
|---|---|
| Base Boot | [Requisitos Boot](https://docs.spring.io/spring-boot/system-requirements.html): 4.1.2 admite Java 25 y Maven; los labs fijan sus versiones |
| Gradle y JVM | [Compatibilidad Gradle](https://docs.gradle.org/current/userguide/compatibility.html): Java 25 requiere Gradle 9.1+ para ejecutar Gradle; esto no migra el curso |
| Cloud | [Matriz Spring Cloud](https://spring.io/projects/spring-cloud/): 2025.1.2+ admite Boot 4.1; los labs usan 2025.1.4 |
| IA | [Spring AI](https://docs.spring.io/spring-ai/reference/getting-started.html): AI 2.0.x admite Boot 4.0.x y 4.1.x; el ejemplo conserva 4.0.9/2.0.2 |
| OpenAPI | [Springdoc](https://springdoc.org/): referencia y starter 3.2.0 de la línea Boot 4; endpoint probado en la referencia acumulativa |
| Avro | [Especificación 1.12](https://avro.apache.org/docs/1.12.0/specification/): default de unión compatible con un miembro, sin imponer universalmente la primera posición |
| Probes y JPA | [Actuator](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.kubernetes-probes), [OneToMany](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/OneToMany.html): enlaces corregidos |
| Streams | [Testing Kafka 4.2](https://kafka.apache.org/42/streams/developer-guide/testing/): enlace corregido |

El registro `spring-boot-source-links.json` conserva respuestas HTTP de las
referencias. MySQL respondió 403 al verificador automático; eso se registra como
acceso bloqueado, no como página inexistente. Una lectura técnica asistida no
sustituye observar a una persona principiante completar el curso.

## Matriz individual

Cada fila describe el desarrollo real y un límite concreto. Para reconstruirla:
`python3 scripts/build_spring_topic_review.py`; para comprobar vigencia frente al
Markdown y las notas: agrega `--check`. Las notas son juicios explícitos de esta
revisión; el script no las genera a partir de palabras clave.
