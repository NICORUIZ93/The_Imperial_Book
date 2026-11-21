# Auditoría editorial completa — 18 nov 2026

Rúbrica: [PROMPT-AUDITORIA.md](PROMPT-AUDITORIA.md) (A1–F3 y Parte 2). Nueve auditores independientes,
que no escribieron el contenido, revisaron los 291 módulos y los 1432 temas. Ninguno editó lecciones.

| Informe | Cursos | Veredicto |
|---|---|---|
| [../auditoria-editorial-2026-11-18.md](../auditoria-editorial-2026-11-18.md) | muestra profunda de 6 módulos | No |
| [cloud.md](cloud.md) | Cloud (35) | No |
| [spring-microservicios-rutaflow.md](spring-microservicios-rutaflow.md) | Spring Boot, Microservicios, RutaFlow (37) | Parcial |
| [devops-kotlin.md](devops-kotlin.md) | DevOps, Kotlin Multiplatform (37) | No |
| [java-ios.md](java-ios.md) | Java, iOS (38) | No |
| [flutter-angular.md](flutter-angular.md) | Flutter, Angular (40) | No |
| [control1-fundamentos.md](control1-fundamentos.md) | Control 1, Fundamentos (39) | Parcial / No |
| [android-node.md](android-node.md) | Android, Node (35) | No / Parcial |
| [javascript-react.md](javascript-react.md) | JavaScript, React (30) | No |

Medición mecánica por tema: [plantilla-mecanica.json](plantilla-mecanica.json) (98 de 1432 temas con los 8
elementos; varios auditores comprobaron falsos positivos en «solución» y falsos negativos en Control 1).

## Defectos transversales (aparecen en todos o casi todos los cursos)

1. **Ejercicios sin solución.** Casi ningún módulo tiene soluciones plegadas (`<details>`); la metodología las exige.
2. **Código que no corre tal como se pega.** Faltan imports, dependencias, archivos de lockfile, `flutter create`,
   wrapper de Gradle, scripts `npm test`; laboratorios que citan archivos inexistentes.
3. **Progresión rota.** Temas que usan conceptos de módulos posteriores o de otros cursos (iOS → Cloud/React,
   Angular → JavaScript, Fundamentos M0 abre con 90 min de jerga).
4. **Afirmaciones técnicas falsas o desactualizadas** verificadas por ejecución o fuente primaria (≈100 en total,
   listadas con archivo:línea en cada informe).
5. **Tres plantillas mezcladas**, duración de temas fuera de 20–45 min, voseo y tuteo mezclados.
6. **Restos editoriales visibles** («Trazabilidad de la auditoría original», «página 28 del PDF», «El prompt menciona…»).
7. **`validate.sh` aprueba todo**: no valida plantilla, ejecución de código ni archivos de laboratorio.
8. **Regresión de la limpieza 011**: Cloud M0–M1 usan un `docker-compose.yml` que se borró.

## Prioridad de corrección

1. Bloqueantes de entrada (lo que impide pasar del primer tema) en cada curso.
2. Errores técnicos verificados.
3. Plantilla obligatoria + validador (spec 013 P5), soluciones en todos los ejercicios.
4. Reescritura por curso con la plantilla, empezando por Fundamentos (la puerta de entrada).

## Ronda del 21 nov 2026 — consistencia entre cursos

[consistencia-entre-cursos.md](consistencia-entre-cursos.md) cambia el foco: no mide si un tema cumple una
plantilla, sino si **los 16 cursos usan la misma**, sobre el universo actual de 1608 temas y 324 capítulos
(las cifras de arriba son de la ronda del 18 nov, con 291 módulos y 1432 temas). Medidor:
[`scripts/audit_consistencia_entre_cursos.py`](../../scripts/audit_consistencia_entre_cursos.py); datos por
tema en [consistencia-entre-cursos.csv](consistencia-entre-cursos.csv). Resultado: 8 metodologías
conviviendo, 9 cursos con más de una y 21 capítulos con dos estructuras a la vez.

## Límites de la auditoría

No se pudo ejecutar: Swift/iOS, Flutter/Dart, SDK de Android, builds Maven/Gradle (Maven Central bloqueado),
JDK 22–27, Floci, Kubernetes, Terraform. Esos cursos se revisaron contra documentación oficial.
