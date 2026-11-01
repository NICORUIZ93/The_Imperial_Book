# Plan de migración editorial

Este documento corrige el prompt maestro antes de tocar contenido. Conserva el
objetivo editorial —formato Aprende/Practica/Aplica, proyecto de cierre por
módulo y capstone por track— y ajusta las cifras, el mapa de Spring Boot y la
estrategia de identidad para no perder temas, progreso ni enlaces.

## Estado de las fases

| Fase | Estado | Evidencia |
|---|---|---|
| 0 · Sincronización | Cerrada | Corte del cierre: 252 módulos, 1131 temas; `validate.sh` en verde |
| 1 · Infraestructura | Cerrada | Registro de migración, validador por módulo y auditorías adaptadas |
| 2 · Piloto Spring Boot | En curso | M0–M19 migrados: 77/91 temas y 14 laboratorios de cierre |
| 3 · Java + Node.js | En curso | Java: Módulos 21–22 nuevos en formato nuevo (10 temas); M0–M20 y Node pendientes |
| 4 · JavaScript + Angular + React | No iniciada | Depende del piloto |
| 5 · Cloud + DevOps | No iniciada | Depende del piloto |
| 6 · KMP + Android + iOS + Flutter | No iniciada | Depende del piloto |
| 7 · Fundamentos + RutaFlow | No iniciada | Depende del piloto |
| 8 · Huecos curriculares | No iniciada | Requiere fases 2–7 cerradas |

El piloto migró sus veinte primeros módulos sin perder temas ni fragmentos. El
resto del contenido sigue en siete pasos; `docs/seven-step-methodology.md`
declara ambos estados y `docs/migration-status.json` es la fuente de verdad.

El criterio `practice` de `audit_topic_learning_quality.py` reconocía solo el
vocabulario de los siete pasos. Al migrar M17, un tema con práctica real pero sin
ese vocabulario dejó de contarse (1127/1141 frente a 1128/1141). Se corrigió el
auditor para aceptar también una sección `#### Practica` con cuerpo accionable
(código, comando o archivo); el umbral no se movió y la cifra volvió a 1141/1141.

## Contrato de correspondencia: siete pasos → Aprende/Practica/Aplica

Decisión del 2026-10-31: el formato canónico de todo el sitio es
Aprende/Practica/Aplica, el que ya usan Spring Boot M0–M19 y Java M21–M22. Los
siete pasos no se borran: cada uno tiene un destino y su texto se mueve, se
conserva y se completa.

| Paso legacy | Destino en el formato canónico |
|---|---|
| 1 · Objetivo y preparación | `**Prerrequisito:**` y `**Al terminar podrás:**` al inicio del tema |
| 2 · Contexto y caso real | `#### Aprende`, párrafo inicial «¿Por qué es importante?» |
| 3 · Teoría con analogía | `#### Aprende`: conceptos clave, explicación y analogía |
| 4 · Demostración guiada desde cero | `#### Practica`: demo paso a paso con archivos, comandos y salida esperada |
| 5 · Práctica guiada — repetición progresiva | `#### Practica`: repetición con pista y comparación contra el patrón |
| 6 · Práctica independiente | `#### Aplica`: reto abierto |
| 7 · Cierre | `#### Aplica`: siguiente paso, errores comunes, límites o cuándo no usarlo, fuente oficial y transferencia al proyecto |

El piloto Spring Boot M0–M19 sirve de referencia para cada fila; ningún paso
queda sin destino. El formato canónico exige además contenido que el texto
legacy puede no tener y que se redacta durante la migración, nunca se genera:

- Título `### Tema N: … · [Nivel] · [Duración]`; el validador rechaza otro formato.
- `**Checklist de salida.**` con al menos cuatro ítems verificables dentro de `Aplica`.
- `**Si falla.**` con el diagnóstico del fallo reproducido en el tema.
- Proyecto de cierre del módulo cuando el módulo ya lo trae; la migración no
  inventa uno nuevo.

Reglas para no perder contenido:

1. Ningún párrafo del paso legacy se descarta. Si no encaja en su sección, se
   conserva al final de `Aplica` con su etiqueta original.
2. `#### Paso N` solo desaparece cuando su texto ya vive en la sección destino.
3. El objetivo se redacta como resultado observable en segunda persona
   («Al terminar podrás…»); no se deduce del título ni se copia del temario.
4. Si un tema no trae checklist o «Si falla», se redactan a partir de lo que el
   propio tema ya pide; no se añaden pasos, ejercicios ni afirmaciones nuevas.
5. `docs/migration-status.json` marca un módulo solo después de que el validador
   y `validate.sh` pasan.

Verificación: `python3 scripts/validate_migration.py` (secciones, título, sin
pasos residuales, checklist mínimo) y `python3 scripts/audit_seven_step_methodology.py --check`
(un tema migrado deja de contar como legacy); el número de temas del track no
puede bajar. En modo libro, ambos formatos deben leerse como la misma página:
objetivo y prerrequisito al inicio, tres secciones y cierre con fuentes.

## Cifras corregidas

El inventario real es 14 tracks, 254 módulos y 1141 temas: los 252/1131 del
corte de sincronización más los Módulos 21 y 22 de Java (`APIs públicas,
compatibilidad y evolución` y `El objeto por dentro`, 10 temas), abiertos el
2026-10-31 con alcance abierto. No hay techo
de módulos ni de temas: las cifras de la Fase 8 son un mínimo conocido, no una
meta.

La Fase 8 propone tres tracks nuevos de 15–18, 10–12 y 12–15 módulos, más diez
módulos en tracks existentes. Eso suma 47–55 módulos nuevos, no 28:

- Módulos finales: 252 + 47…55 = **299–307**, no ~280.
- Temas finales: no se pueden fijar en ~1250 sin el desglose de esos módulos.
  Con la densidad actual (4,49 temas por módulo) los módulos nuevos aportarían
  ~211–247 temas y el total quedaría en ~1342–1378. La cifra definitiva se
  registra al escribir cada módulo; no se promete antes.
- Capstones: 17 tracks menos Fundamentos y RutaFlow, que son especiales, dan
  **15 capstones**, como dice el plan.

## Reglas de preservación

1. Un tema no se elimina: se mueve con su texto y su historial.
2. Por track, temas finales ≥ temas originales. El validador lo comprueba con
   `docs/migration-status.json`.
3. Un módulo solo se disuelve cuando todos sus temas tienen destino y el mapa
   está escrito en este documento.
4. Cada módulo migrado termina con su proyecto de cierre; cada track, con su
   capstone.

## Identidad: módulos, fragmentos y progreso

Cambiar títulos y disolver módulos rompe enlaces y progreso guardado. Reglas:

- **Títulos de tema:** se conserva el texto actual y se añade `· [Nivel] · [Duración]`.
  El fragmento se calcula sin ese sufijo, así que las anclas del índice no cambian.
  Si un tema cambia de título, se registra el alias antiguo→nuevo antes de migrar.
- **Ids de módulo:** los ids existentes no se reutilizan para otro contenido. Un
  módulo disuelto transfiere sus temas a un módulo destino y deja de existir;
  sus claves de progreso se remapean en la migración del esquema de progreso.
- **URLs:** una URL de módulo disuelto redirige al módulo destino con el tema
  equivalente. No se deja una URL apuntando a contenido distinto.
- **Progreso por tema:** la clave `${moduleId}:${fragment}` se remapea junto con
  el módulo; el fragmento se conserva por la regla de títulos.

## Spring Boot: mapa corregido (91 temas, 17 módulos)

El plan original pedía 16 proyectos para una malla de 17 módulos, enumeraba
cuatro módulos como «(3)» y dejaba sin destino los temas de los módulos 12 y 14.
Este mapa asigna los 91 temas sin pérdida y fija 17 proyectos de cierre.

| Nuevo | Módulo | Temas | Origen |
|---:|---|---:|---|
| 0 | Fundamentos de Spring: IoC y DI | 3 | M0 |
| 1 | CLI y estructura de proyecto | 3 | M1 |
| 2 | REST APIs con Spring Web | 6 | M2 |
| 3 | Persistencia con Spring Data JPA | 3 | M3 |
| 4 | Testing en Spring Boot | 3 | M6 |
| 5 | Seguridad: autenticación, JWT y autorización | 7 | M4 + M18 |
| 6 | Configuración, perfiles y errores | 3 | M5 |
| 7 | Observabilidad con Actuator | 3 | M7 |
| 8 | Kafka, RabbitMQ e integraciones | 16 | M8 + M20 + M21 |
| 9 | Programación reactiva con WebFlux | 3 | M9 |
| 10 | Microservicios con Spring Cloud | 8 | M10 |
| 11 | Empaquetado y despliegue | 3 | M11 |
| 12 | Spring Batch | 2 | M19 |
| 13 | Consistencia, contratos y operación | 7 | M13 + M12 |
| 14 | Backend de entregas: MySQL espacial, archivos y tiempo real | 6 | M14 |
| 15 | Persistencia profunda: JPA, JDBC y transacciones | 4 | M16 + M17 |
| 16 | Arquitectura avanzada: hexagonal, C4, ADR, sagas y eventos | 11 | M22 + M15 |

Total: 3+3+6+3+3+7+3+3+16+3+8+3+2+7+6+4+11 = **91 temas**.

Correcciones respecto al prompt:

- 17 módulos exigen **17 proyectos de cierre**, no 16.
- «N4 Experto (3)» enumera cuatro módulos; se usa la cifra real (4).
- M12 (proyecto integrador) y M14 (backend de entregas) conservan sus temas:
  M12 pasa a M13 y M14 se mantiene como módulo propio.
- «Spring Master» no se disuelve en el capstone: sus ocho temas forman parte de
  M16. El capstone es contenido nuevo y evaluable, no un cajón de temas movidos.
- Los ids nuevos son posiciones editoriales, no ids de aplicación. Antes de
  renumerar se aplica la regla de identidad de la sección anterior.

## Validación por módulo

`docs/migration-status.json` registra los módulos migrados por track y los temas
originales. `scripts/validate_migration.py` exige, solo para esos módulos:

- encabezado `### Tema N: … · Nivel · Duración` con nivel y duración válidos;
- secciones `#### Aprende`, `#### Practica` y `#### Aplica`;
- checklist de salida con al menos cuatro ítems;
- ausencia de encabezados `#### Paso` residuales;
- temas finales ≥ temas originales del track.

Los módulos aún no migrados siguen validándose con el formato de siete pasos.
Así `validate.sh` permanece verde durante toda la migración, en lugar de quedar
rojo hasta terminar los 14 tracks.

## Próximo paso

Continuar el piloto con el bloque M12–M22 (proyecto integrador, entrega y
operación), sin renumerar ids todavía:

1. reescritura de cada tema al formato de tres bloques;
2. proyecto de cierre por módulo;
3. registro del bloque en `docs/migration-status.json`;
4. `./scripts/validate.sh` en verde tras cada bloque.

El reordenamiento por dificultad y la fusión de módulos se aplican cuando el
mapa de destinos esté completo y exista remapeo de progreso y redirecciones; no
se renumeran ids a mitad de la migración.

La migración no se considera completada hasta cerrar los 91 temas y el
capstone, con `docs/spring-boot-migration-log.md` indicando 91 → M (M ≥ 91).
