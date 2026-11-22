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

Reescritos el 2026-11-21 al formato que parsea `scripts/validate_specs.py` (regla 1 de la constitución).
El número 5 se separó en dos criterios porque en esta máquina se pudo comprobar `docker compose config`
pero no el `up --build` completo: marcarlos juntos habría ocultado la parte sin ejecutar.

- **C1** `hecho` — `python3 scripts/validate_specs.py` reconoce esta especificación y sus criterios
  implementados llevan comando verificable.
  Verificación: `python3 scripts/validate_specs.py`
- **C2** `pendiente` — El diseño Fase 2 declara perfil, resultados, prerrequisitos, versiones, ocho semanas
  y decisiones de alcance, y mantiene los cursos Spring y Node independientes. Medido en
  `docs/temarios/spring-boot-microservicios-fase-2.md`: perfil, resultados, versiones y el calendario de 8
  semanas están; la palabra «prerrequisitos» no aparece ninguna vez y Node se menciona una sola vez. Falta
  escribir esos dos apartados, no retirar el criterio.
  Verificación: `python3 -c "import sys,io;t=io.open('docs/temarios/spring-boot-microservicios-fase-2.md',encoding='utf-8').read().lower();sys.exit(0 if all(k in t for k in ['perfil','resultados','prerrequisitos','versiones','semana 8','decisiones']) and t.count('node')>=3 else 1)"`
- **C3** `hecho` — Cada tema técnico de los módulos 5–12 tiene ficha individual que mapea los nueve
  criterios del dueño; cuando la referencia aún no existe, la ficha lo declara como brecha en lugar de
  presentarla como construida.
  Verificación: `python3 -c "import sys,io,re;t=io.open('docs/temarios/spring-boot-microservicios-fase-2.md',encoding='utf-8').read();b=re.split(chr(10)+'### F2.',t)[1:];sys.exit(0 if len(b)==49 and all(len(re.findall(r'^[0-9]+[.] [*]{2}',x,re.M))==9 for x in b) and all(('a'+'un no existe' in x or 'pendiente' in x or 'por construir' in x or 'no existe' in x) for x in b) else 1)"`
- **C4** `hecho` — El starter Maven contiene descriptor, código ejecutable, prueba y README que explica el
  orden de construcción desde una carpeta vacía. Ejecutado en esta máquina el 2026-11-21 con Maven 3.10.0 y
  JDK 27: 5 pruebas (`ProductoServiceTest` 2, `ProductoTest` 3), 0 fallos, 0 errores.
  Verificación: `python3 -c "import xml.etree.ElementTree as ET;ET.parse('examples/microservicios-spring/fase-1/proyecto-maven-tienda/pom.xml')" && mvn -q -f examples/microservicios-spring/fase-1/proyecto-maven-tienda/pom.xml test`
  (se quita `-o`: el CI ya calienta dependencias con caché Maven, specs/025 C14)
- **C5** `hecho` — El `docker-compose.yml` del starter es válido para el cliente de Compose de esta máquina
  (daemon arriba, 2026-11-21).
  Verificación: `docker compose -f examples/microservicios-spring/fase-1/proyecto-maven-tienda/docker-compose.yml config -q`
- **C6** `pendiente` — `docker compose up --build --abort-on-container-exit` y `./verify.sh --e2e` sobre el
  servicio real. No ejecutado todavía: queda pendiente con motivo, no se da por pasado (regla 1.2).
  Verificación: `bash examples/microservicios-spring/fase-1/proyecto-maven-tienda/verify.sh --e2e`
- **C7** `hecho` — No se pisó ningún laboratorio existente ni archivo que ya estuviera modificado:
  `examples/microservicios/` sigue igual que en el commit que incorporó el trabajo del hilo Manus.
  Verificación: `git diff --quiet 1c646978 -- examples/microservicios && test -f examples/microservicios-spring/fase-1/proyecto-maven-tienda/pom.xml`
- **C8** `pendiente` — La presentación ejecutiva se obtuvo por la herramienta Slides y su `resource_uri`
  estable queda enlazado en la entrega. Medido: `slides/present` no se ejecutó en esta sesión y el repositorio
  no guarda el enlace, así que el criterio sigue pendiente hasta producir la presentación.
  Verificación: `grep -Eq 'https://[a-z0-9.-]*slides[a-z0-9.-]*/[A-Za-z0-9_-]+' specs/023-fase-2-maven-compose-y-presentacion-spring.md`

## 4. Verificación a ejecutar

- `mvn -f examples/microservicios-spring/fase-1/proyecto-maven-tienda/pom.xml test` (si Maven Central es accesible y el JDK cumple).
- `python3 -c 'import xml.etree.ElementTree as ET; ET.parse("examples/microservicios-spring/fase-1/proyecto-maven-tienda/pom.xml")'`.
- `docker compose -f examples/microservicios-spring/fase-1/proyecto-maven-tienda/docker-compose.yml config` y, si Docker está operativo, `docker compose ... up --build --abort-on-container-exit` seguido de `verify.sh`.
- Comprobar estructura, enlaces relativos, fichas y rutas de cada tema por inspección/script sencillo.

## 5. Fuera de alcance

Construir los 29 laboratorios de la Fase 1; crear un proyecto productivo multi-servicio para toda la Fase 2; implementar Kafka, Keycloak o Kubernetes completos; cambiar el temario Node.js; convertir la presentación a archivo PPTX/PDF; publicar el curso; hacer commit.
