# Deuda editorial verificable

Este inventario se genera desde el Markdown real mediante detectores heurísticos de presencia. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial. Un criterio detectado no demuestra que la explicación sea correcta o suficiente ni que el código se haya ejecutado.

El estado «completo» de este reporte solo significa que aparecen los criterios de esta auditoría; no equivale a completar los siete pasos editoriales. La auditoría independiente de siete pasos evalúa otros 17 marcadores y registra su propio resultado en `seven-step-methodology.md`.

## Estado global

| Criterio | Cubierto | Pendiente |
|---|---:|---:|
| Explicación | 1175 | 0 |
| Código | 1175 | 0 |
| Ruta | 1175 | 0 |
| Ejecución | 1171 | 4 |
| Resultado | 1173 | 2 |
| Modificación | 1175 | 0 |
| Conexión con un proyecto | 1175 | 0 |
| Modelo mental | 1175 | 0 |
| Límites | 1174 | 1 |
| **Perfil de criterios detectado** | **1169** | **6** |

## Prioridad por track

| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin proyecto | Sin límites |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| angular | 71 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| cloud | 156 | 0 | 0 | 0 | 2 | 0 | 0 | 1 |
| devops | 113 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| flutter | 106 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| foundations | 99 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ios | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| java | 91 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| javascript | 88 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| kotlin-multiplatform | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| node | 83 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| react | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| rutaflow | 29 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| spring-boot | 111 | 0 | 0 | 4 | 0 | 0 | 0 | 0 |

## Pendientes por tema

- [cloud · módulo 0](../web/public/content/cloud/modulo-0.md) · Tema 4: Qué es Floci — definición, propósito y comparativa con LocalStack: resultado.
- [cloud · módulo 0](../web/public/content/cloud/modulo-0.md) · Tema 5: Servicios que emula Floci — AWS, Azure y GCP: resultado, límites.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 9: Spring Modulith para comprobar fronteras antes de separar servicios: ejecución.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 10: Spring Cloud Bus para propagar cambios de configuración: ejecución.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 11: Micrometer Tracing entre servicios: ejecución.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 12: Contract testing entre productor y consumidor: ejecución.

## Regla de cierre

Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con un proyecto propio. No se acepta texto generado o el mismo ejemplo repetido entre temas. El resultado de esta comprobación debe complementarse con la auditoría de siete pasos y una revisión humana; los indicadores de presencia no certifican calidad, aprendizaje ni ejecución.
