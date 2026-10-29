# Deuda editorial verificable

Este inventario se genera desde el Markdown real mediante detectores heurísticos de presencia. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial. Un criterio detectado no demuestra que la explicación sea correcta o suficiente ni que el código se haya ejecutado.

El estado «completo» de este reporte solo significa que aparecen los criterios de esta auditoría; no equivale a completar los siete pasos editoriales. La auditoría independiente de siete pasos evalúa otros 17 marcadores y registra su propio resultado en `seven-step-methodology.md`.

## Estado global

| Criterio | Cubierto | Pendiente |
|---|---:|---:|
| Explicación | 1082 | 0 |
| Código | 1082 | 0 |
| Ruta | 1079 | 3 |
| Ejecución | 1082 | 0 |
| Resultado | 1082 | 0 |
| Modificación | 1082 | 0 |
| Conexión con un proyecto | 1079 | 3 |
| Modelo mental | 1082 | 0 |
| Límites | 1082 | 0 |
| **Perfil de criterios detectado** | **1077** | **5** |

## Prioridad por track

| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin proyecto | Sin límites |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 58 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |
| angular | 71 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| cloud | 156 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| devops | 104 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| flutter | 63 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| foundations | 99 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |
| ios | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| java | 80 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| javascript | 88 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| kotlin-multiplatform | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| node | 77 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| react | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| rutaflow | 29 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |
| spring-boot | 87 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Pendientes por tema

- [android · módulo 13](../web/public/content/android/modulo-13.md) · Tema 5: Del dispositivo al diagnóstico: SoC, memoria, límites térmicos y arranque verificado: ruta, conexión con un proyecto.
- [foundations · módulo 10](../web/public/content/foundations/modulo-10.md) · Tema 6: Latencia y throughput: medir concurrencia sin confundirla con capacidad ilimitada: conexión con un proyecto.
- [foundations · módulo 7](../web/public/content/foundations/modulo-7.md) · Tema 5: Records de C#: igualdad por valor no implica inmutabilidad profunda: ruta.
- [rutaflow · módulo 5](../web/public/content/rutaflow/modulo-5.md) · Tema 4: Socket.IO extremo a extremo: un gateway compatible con el cliente móvil: conexión con un proyecto.
- [rutaflow · módulo 6](../web/public/content/rutaflow/modulo-6.md) · Tema 4: Tokenización de pagos: un identificador opaco no sustituye autorización ni confirmación: ruta.

## Regla de cierre

Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con un proyecto propio. No se acepta texto generado o el mismo ejemplo repetido entre temas. El resultado de esta comprobación debe complementarse con la auditoría de siete pasos y una revisión humana; los indicadores de presencia no certifican calidad, aprendizaje ni ejecución.
