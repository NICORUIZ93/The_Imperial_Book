# Deuda editorial verificable

Este inventario se genera desde el Markdown real mediante detectores heurísticos de presencia. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial. Un criterio detectado no demuestra que la explicación sea correcta o suficiente ni que el código se haya ejecutado.

El estado «completo» de este reporte solo significa que aparecen los criterios de esta auditoría; no equivale a completar los siete pasos editoriales. La auditoría independiente de siete pasos evalúa otros 16 marcadores y registra su propio resultado en `seven-step-methodology.md`.

## Estado global

| Criterio | Cubierto | Pendiente |
|---|---:|---:|
| Explicación | 1323 | 0 |
| Código | 1323 | 0 |
| Ruta | 1323 | 0 |
| Ejecución | 1323 | 0 |
| Resultado | 1321 | 2 |
| Modificación | 1322 | 1 |
| Conexión con un proyecto | 1244 | 79 |
| Modelo mental | 1323 | 0 |
| Límites | 1319 | 4 |
| **Perfil de criterios detectado** | **1307** | **16** |

## Prioridad por track

| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin proyecto | Sin límites |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 74 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| angular | 71 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| cloud | 156 | 0 | 0 | 0 | 2 | 0 | 0 | 1 |
| control-1 | 70 | 0 | 0 | 0 | 0 | 0 | 65 | 0 |
| devops | 129 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| flutter | 106 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| foundations | 100 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ios | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| java | 111 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| javascript | 88 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| kotlin-multiplatform | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| microservices | 23 | 0 | 0 | 0 | 0 | 0 | 11 | 1 |
| node | 83 | 0 | 0 | 0 | 0 | 1 | 2 | 1 |
| react | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| rutaflow | 29 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| spring-boot | 113 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

## Pendientes por tema

- [cloud · módulo 0](../web/public/content/cloud/modulo-0.md) · Tema 4: Qué es Floci — definición, propósito y comparativa con LocalStack: resultado.
- [cloud · módulo 0](../web/public/content/cloud/modulo-0.md) · Tema 5: Servicios que emula Floci — AWS, Azure y GCP: resultado, límites.
- [flutter · módulo 19](../web/public/content/flutter/modulo-19.md) · Tema 1: estado de la jornada con Riverpod: conexión con un proyecto, límites.
- [microservices · módulo 0](../web/public/content/microservices/modulo-0.md) · Tema 1: Ejecutar dos procesos Java y comprobar su socket HTTP · Fundamentos · 45 min: conexión con un proyecto.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 3: Agrupar código por capacidad de negocio · Aplicación · 40 min: conexión con un proyecto.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 4: Proteger la API pública de un módulo · Aplicación · 45 min: conexión con un proyecto.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 5: Mantener reglas de dominio libres de frameworks · Aplicación · 40 min: conexión con un proyecto.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 6: Sustituir adaptadores mediante puertos · Aplicación · 45 min: conexión con un proyecto.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 7: Representar dependencias de módulos como un grafo · Integración · 35 min: conexión con un proyecto.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 8: Romper ciclos según el tipo de acoplamiento · Integración · 45 min: conexión con un proyecto.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 9: Bloquear accesos a internals con ArchUnit · Integración · 40 min: conexión con un proyecto.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 10: Detectar ciclos de paquetes con ArchUnit · Integración · 35 min: conexión con un proyecto, límites.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 12: Medir señales que justifican una extracción · Experto · 40 min: conexión con un proyecto.
- [microservices · módulo 1](../web/public/content/microservices/modulo-1.md) · Tema 13: Registrar una decisión reversible en un ADR · Experto · 40 min: conexión con un proyecto.
- [node · módulo 14](../web/public/content/node/modulo-14.md) · Tema 7: Kafka desde Node: clave, grupo consumidor y offset: conexión con un proyecto, límites.
- [node · módulo 14](../web/public/content/node/modulo-14.md) · Tema 8: RabbitMQ desde Node: exchange, cola y confirmaciones: modificación, conexión con un proyecto.

## Regla de cierre

Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con un proyecto propio. No se acepta texto generado o el mismo ejemplo repetido entre temas. El resultado de esta comprobación debe complementarse con la auditoría de siete pasos y una revisión humana; los indicadores de presencia no certifican calidad, aprendizaje ni ejecución.
