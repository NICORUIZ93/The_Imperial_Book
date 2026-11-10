# Revisión de capturas de Descargas · 10 de noviembre de 2026

Alcance: cuatro PNG en la raíz de Descargas, tres únicos. Inspección visual del
texto visible; no se dispone de las otras siete páginas del carrusel JWT.
`IMG_1406 2.PNG` es idéntico por SHA-256 a `IMG_1406.PNG`.
No se copian las capturas personales a la web.

## Texto y contraste con el contenido existente

| Captura | Contenido legible | Cobertura encontrada | Aporte propuesto |
|---|---|---|---|
| IMG_1406.PNG | Curso Docker para principiantes: crear y desplegar aplicaciones reales | DevOps M2 y M3; Node M11 | Un recorrido transversal desde API hasta imagen, healthcheck, persistencia y diagnóstico. No hace falta duplicar un curso ni anunciar un cupón cuya vigencia no se comprobó. |
| 9F953194-915C-4BDE-8479-8F11C216755D.PNG | JWT frente a sesiones: elegir estrategia de autenticación | Node M6 T2 y T5; Spring M18 | Comparación aplicada al mismo caso: navegador propio, API móvil, logout, revocación, almacenamiento y CSRF. Solo es visible la portada, no sus argumentos. |
| 345E62C9-2599-44A3-8666-03BC4B740069.PNG | Doce patrones de microservicios y sus costes | Gateway y descubrimiento en Spring M10; Bulkhead y Saga en M15; eventos en M20; sidecar en DevOps M7 | Mapa de decisiones con enlaces a las prácticas existentes; priorizar Strangler, BFF y CQRS como candidatos a revisión detallada, sin asumir cobertura solo por menciones. |

Los doce nombres visibles son Strangler, API Gateway, BFF, descubrimiento de
servicios, Circuit Breaker, Bulkhead, reintento, Sidecar, Saga, arquitectura por
eventos, CQRS y externalización de configuración. La captura también muestra
una noticia parcial sobre Spring AI; no se cambia ninguna versión por esa noticia.

## Orden de ampliación propuesto

1. Comparar JWT y sesiones usando dos implementaciones del mismo recurso, con
   pruebas de expiración, logout y rechazo de acceso ajeno. Criterio: justificar
   la elección y demostrar la frontera de autorización. Revisar primero Node M6.
2. Crear un caso de migración Strangler: enrutar una capacidad del monolito al
   servicio nuevo, verificar contratos y ensayar rollback. No requiere migrar
   toda la aplicación ni convertir esta academia Angular en microservicios.
3. Comparar Gateway/BFF y CQRS con una alternativa sencilla. Definir coste de
   despliegue, consistencia y operación; no confundir CQRS con event sourcing.
4. Conectar Docker básico con los laboratorios existentes: construir, ejecutar,
   romper configuración, diagnosticar y recuperar datos.

Estas son propuestas editoriales; no son lecciones implementadas ni pruebas
realizadas. Cada ampliación requiere fuentes primarias y ejemplo ejecutable
antes de presentarse como contenido verificado. El trabajo inmediato continúa
en Spring Boot M20 T5 tras cerrar el bloque de caché.
