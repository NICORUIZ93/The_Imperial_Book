# Spring Boot: cierre editorial y verificación

Revisión: 11 de noviembre de 2026. Aplicación oficial: Angular `web/`.
Contenido: `web/public/content/spring-boot/modulo-0.md` a `modulo-25.md`.

**Revisión posterior, tema por tema:** consulta [la matriz individual](SPRING-BOOT-REVISION-TEMA-POR-TEMA.md). Detectó y corrigió problemas de secuencia, referencias y ejecución que este primer cierre estructural no acreditaba. Incluye el estado real de Gradle y vigencia de versiones. La referencia M2–M7 pasó de 31 a 43 pruebas al incorporar piezas que faltaban.

## Qué significa el avance

| Alcance | Resultado | Interpretación |
|---|---:|---|
| Módulos con contenido | 26/26 · 100 % | Archivos y temas presentes |
| Temas con estructura atómica completa | 111/111 · 100 % | Cumplen los marcadores del contrato editorial |
| Subtemas con cuatro pasos | 393/393 · 100 % | Contexto, práctica, explicación y cierre detectables |
| Temas con perfil practicable | 111/111 · 100 % | Auditoría textual; no acredita ejecución individual |
| Academia completa: estructura atómica | 215/1185 · 18,14 % | Incluye las otras rutas; no es avance de Spring |
| Revisión pedagógica con principiantes | Pendiente | No hay evidencia suficiente para asignarle porcentaje |

Las cifras se apoyan en `atomic-subtopics.json` y `topic-learning-quality.json`.
Completar el formato no demuestra comprensión, nivel profesional ni ejecución
exhaustiva de cada fragmento publicado.

## Metodología aplicada

Cada subtema empieza con un problema pequeño y un resultado observable. La
práctica identifica archivo, carpeta, contenido, comando y salida esperada;
después explica el mecanismo y sus límites. El estudiante provoca un fallo,
formula un diagnóstico, lo corrige y conserva evidencia. El tema cierra con una
tarea independiente y la transferencia al proyecto del curso.

Las comprobaciones se mantienen separadas: auditoría del texto, compilación,
pruebas automatizadas del laboratorio, ejecución HTTP real, navegación y revisión
visual. No se añaden puntos, insignias ni cuestionarios generados. El progreso
registrado por el lector representa trabajo declarado por la persona.

## Cambios de cierre

- Referencia acumulativa ejecutable para los módulos 2–7:
  `examples/spring-tareas-rutaflow/README.md`, con DTO, JPA, migraciones,
  JWT, validación, errores y observabilidad. Explica diferencias entre H2,
  PostgreSQL y los cambios que llegan en módulos posteriores.
- Laboratorio GraphQL con contrato, batching, mutation y subscription local.
  El catálogo distingue estas pruebas de una conexión WebSocket real.
- Laboratorio Modulith con fronteras, eventos y documentación generada.
  El catálogo coincide con la versión 2.1 del POM, contrastada con la
  [referencia oficial](https://docs.spring.io/spring-modulith/reference/).
- Arquitectura con dominio ejecutable y validadores de forma para C4/ADR.
  Las relaciones propuestas no se presentan como infraestructura desplegada.
- Etiquetas de etapas del lector separadas en móvil para evitar que se junten.
- Índices y reportes regenerados para el contenido real de Angular.

## Evidencia y límites

El detalle de ejecución Maven está en `spring-boot-lab-verification.json`:
registra 47 proyectos con salida correcta: 192 pruebas registradas, 191 ejecutadas
sin fallos y una omitida. Conserva proyecto, comando, código de salida y pruebas.
Cinco proyectos no incluyen tests: layered JAR, native, Cloud Bus, Token Relay y
tracing. Un proyecto con cero
pruebas solo acredita que Maven terminó; no acredita su escenario distribuido.
La prueba Redis es opcional y aparece omitida en la ejecución predeterminada.
Su ejecución adicional se registra por separado, sin alterar retrospectivamente
los resultados de esa tanda.

La alternativa Gradle se incorporó después de esa tanda Maven. El
[reporte Gradle](spring-gradle-verification.json) registra 50 proyectos raíz con
build correcto: 214 pruebas registradas, 213 ejecutadas sin fallos y una omitida.
Cinco proyectos no tienen tests; su build acredita compilación, no funcionamiento
distribuido. Se verificaron además el contrato productor/consumidor y una mutación
detectada, Redis real, capas y AOT sobre JVM. La
[guía Gradle](SPRING-BOOT-GRADLE.md) da los comandos de estudio. Los hashes de
fuente de la tanda principal se calcularon al consolidar el reporte, pues el
ejecutor inicial no los guardaba durante la corrida.

El recorrido de navegador está en `spring-boot-browser-review.json`: 26 módulos
por dos anchos (390 y 1366 px), primer y último encabezado operados con teclado,
ausencia de errores de página, de carga de lección y de desbordamiento horizontal.
No supone revisión visual de cada párrafo o ejecución de ejercicios desde la web.
Además, seis casos dirigidos de Playwright cubren respaldo/restauración,
navegación y tarjetas en escritorio/móvil; 17 pruebas unitarias Angular pasan.
La suite completa de Playwright no se repitió: su cierre anterior con Archify
seguía incompleto y no se da por aprobado a partir de estos casos dirigidos.

Se probó HTTP real en GraphQL: consulta válida y rechazo de campo inexistente.
En Tareas: petición sin token (401), login (200), creación (201) y lectura del
registro (200). Las credenciales y claves son de demostración, sin persistencia
de usuarios, revocación o rotación de claves.

El ejemplo Java hexagonal devolvió `reserva=RES-1 vehiculo=camion-1`.
Los validadores aceptaron cuatro niveles C4, doce relaciones y tres ADR;
rechazaron retirar una relación o la sección de alternativas y se restauraron
los originales. Estos controles verifican estructura documental, no calidad
arquitectónica. PlantUML/AsciiDoc generado no significa video ni imagen renderizada.

Comprobaciones adicionales fuera de Surefire:

| Laboratorio | Ejecución observada | Límite |
|---|---|---|
| Layered JAR | `verify-layers.sh`: lista y extrae las cuatro capas | No construye ni ejecuta una imagen de contenedor |
| Native | `verify-aot.sh`: genera AOT y metadata; responde `/estado` y `/mensaje` | Ejecuta sobre JVM; no compila binario nativo |
| Tracing | `verify-trace.sh`: respuesta HTTP y traza compartida entre entregas e inventario en Jaeger | Prueba local, sin carga ni propagación entre redes productivas |

Traza observada: `b4bd81a996262140e9573f50efa3d628`. El script detuvo las
aplicaciones y retiró su contenedor Jaeger al terminar.

El build Angular termina con una advertencia por superar el presupuesto inicial
(aproximadamente 645 kB frente a 600 kB). No bloquea el build; optimizar el paquete
sigue siendo una mejora pendiente. Los ejemplos de IA usan modelo controlado;
no prueban calidad de un LLM externo. Token Relay, compilación nativa,
carga, recuperación distribuida y despliegue requieren sus verificaciones
específicas; una compilación común no las sustituye.

**Verificación posterior de Cloud Bus (12 de noviembre):** con RabbitMQ 4
efímero y dos procesos Gradle en los puertos 18081/18082, `verify-bus.sh`
observó `{"maxPedidos":3}` en ambos, publicó `busenv` y `busrefresh`, y observó
`{"maxPedidos":9}` en ambos. El primer intento falló con HTTP 500: Podman Compose
creó un volumen de RabbitMQ cuyo archivo `.erlang.cookie` no se podía leer.
El README y M10 T10 documentan el diagnóstico y un arranque efímero probado con
`podman run --tmpfs`. El broker y las aplicaciones se detuvieron al terminar.
Token Relay, compilación nativa, carga, recuperación distribuida y despliegue
mantienen sus límites específicos.

Las propuestas extraídas de las imágenes de Descargas ya están registradas en
`revision-imagenes-descargas-2026-11-10.md`. JWT frente a sesiones y una migración
Strangler práctica siguen como ampliaciones propuestas; no se confunden con los
111 temas actuales ni se adoptan versiones por una captura de redes sociales.

## Fallo real corregido durante el cierre

La primera ejecución adicional contra Redis 7.4 Alpine falló: el segundo gestor
leyó `null` intermitentemente. La configuración y las claves coincidían; el
writer predeterminado con Lettuce podía diferir `put` y la invalidación. Se
contrastó con la [guía oficial de migración](https://docs.spring.io/spring-data/redis/reference/upgrading.html)
y se añadió `RedisWriteConfiguration`, activo solo bajo el perfil Redis, para
usar `immediateWrites()`; el segundo gestor adopta la misma política.
La prueba dirigida pasó después de la corrección. Se actualizan README y M20
T4 para explicar que esperar bloquea al llamador y no garantiza atomicidad
entre base de datos y caché. La repetición limpia completa de caché pasó sus siete pruebas, sin omisiones,
y se registra como comprobación posterior en el JSON de laboratorios. El
contenedor Redis efímero se detuvo y eliminó.
