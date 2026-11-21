# 023 · Fase 2 Spring Boot, starter Maven/Compose y presentación ejecutiva

**Estado:** en curso. Especificación de trabajo; no publica el curso ni declara validados laboratorios que no se hayan ejecutado.
**Origen:** solicitud del dueño del 2026-11-21 para continuar el diseño curricular con Fase 2, crear un proyecto Maven desde cero con Docker Compose para Fase 1 y generar una presentación ejecutiva de la Fase 1.

## 1. Alcance

1. Crear `docs/temarios/spring-boot-microservicios-fase-2.md` como diseño curricular independiente de ocho semanas para los módulos Spring 5–12 del inventario: DDD/microservicios; comunicación; Spring Cloud; resiliencia; seguridad; observabilidad; mensajería avanzada; Docker/Kubernetes/despliegue.
2. Desglosar cada tema atómico con los nueve criterios del dueño: concepto, visual, construcción guiada desde cero y por archivo, referencia final, explicación línea a línea, Compose/lab reproducible, verificación automática, modificación guiada y error con diagnóstico visual. En esta entrega se diseña la ficha; solo se marca implementado lo existente.
3. Crear un proyecto Maven autónomo nuevo bajo `examples/microservicios-spring/fase-1/`, sin sobrescribir `examples/microservicios/modulo-5` a `modulo-12` ni cambiar el build principal Gradle del repositorio. Debe incluir aplicación Spring Boot de arranque, `pom.xml`, fuentes, pruebas, configuración de contenedores, README con pasos de construcción y `verify.sh`.
4. Compose debe encapsular el build/ejecución para que el alumno no instale Maven/JDK en su host e incluir solo servicios necesarios para el primer laboratorio. Servicios adicionales de Fase 1 se incorporan mediante perfiles documentados, sin prometer que los 29 temas ya están implementados.
5. Crear una presentación ejecutiva en Slides, en español, con máximo 12 diapositivas, basada en el diseño Fase 1 ya existente y con su recurso enlazado. No exportar PPTX/PDF sin solicitud explícita.

## 2. Límites y no-regresión

- No modificar `specs/022`, el diseño Fase 1 existente, los laboratorios publicados ni el build Gradle principal.
- No editar cambios locales preexistentes que no pertenecen a esta solicitud. El estado Git previo mostraba cambios en `docs/reestructuracion/cursos/java/...` y artefactos sin seguimiento relacionados.
- No afirmar que la Fase 1 está completa: su propio documento conserva brechas abiertas. El nuevo starter satisface una parte acotada (Maven + primer Compose), no todos sus laboratorios.
- Mantener JDK 25 y Spring Boot 4.1.3, según la matriz de versiones del proyecto. Para Maven se puede usar la versión disponible en la máquina, sin cambiar la versión global fijada del proyecto.
- Si Docker Desktop/daemon, registros o Maven Central no están disponibles, registrar exactamente qué pruebas quedaron pendientes; no simular `docker compose up` ni inventar outputs.
- No hacer commit ni publicar cambios en la app del curso.

## 3. Criterios de aceptación

1. `python3 scripts/validate_specs.py --run` reconoce esta especificación; sus criterios implementados incluyen comandos verificables.
2. El diseño Fase 2 declara perfil, resultados, prerrequisitos, versiones, ocho semanas y decisiones de alcance; mantiene cursos Spring y Node independientes.
3. Cada tema técnico de los módulos 5–12 tiene ficha individual que mapea explícitamente los nueve criterios. Cuando una referencia/proyecto aún no existe, la ficha lo declara como brecha y prescribe el resultado esperado, no lo presenta como construido.
4. El starter Maven contiene descriptor, código ejecutable, prueba y README que explica el orden de construcción desde carpeta vacía. Los archivos Java y XML se analizan sintácticamente y el test Maven se intenta ejecutar.
5. `docker-compose.yml` es válido con `docker compose config` si el cliente/daemon lo permite; `verify.sh` verifica el build/test o endpoints disponibles, termina con código no-cero ante fallo y no imprime éxito falso.
6. No se pisa ningún laboratorio existente ni archivo que ya estuviera modificado por otra tarea.
7. Slides devuelve un `resource_uri` estable mediante `slides/present`; la entrega final usa un enlace Markdown al recurso.

## 4. Verificación a ejecutar

- `mvn -f examples/microservicios-spring/fase-1/proyecto-maven-tienda/pom.xml test` (si Maven Central es accesible y el JDK cumple).
- `python3 -c 'import xml.etree.ElementTree as ET; ET.parse("examples/microservicios-spring/fase-1/proyecto-maven-tienda/pom.xml")'`.
- `docker compose -f examples/microservicios-spring/fase-1/proyecto-maven-tienda/docker-compose.yml config` y, si Docker está operativo, `docker compose ... up --build --abort-on-container-exit` seguido de `verify.sh`.
- Comprobar estructura, enlaces relativos, fichas y rutas de cada tema por inspección/script sencillo.

## 5. Fuera de alcance

Construir los 29 laboratorios de la Fase 1; crear un proyecto productivo multi-servicio para toda la Fase 2; implementar Kafka, Keycloak o Kubernetes completos; cambiar el temario Node.js; convertir la presentación a archivo PPTX/PDF; publicar el curso; hacer commit.
