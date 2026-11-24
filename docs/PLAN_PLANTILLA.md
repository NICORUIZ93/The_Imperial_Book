# Plan de acción: plantilla académica única para todos los cursos

Versión 1 · 2026-11-24. Plantilla de referencia: [`PLANTILLA_CURSO.md`](PLANTILLA_CURSO.md).

## Punto de partida (medido el 2026-11-24)

| Dato | Valor |
|---|---|
| Cursos / módulos / temas | 17 / 319 / ~1.300 |
| Explicación por tema en Fundamentos (mediana, sin código) | 55 palabras |
| Libro de referencia, un solo subtema (Deitel 4.8) | ~3.200 palabras |
| Glosario técnico de la app | 52 términos para todos los cursos |
| Temas con autoevaluación con respuesta | casi ninguno |
| Formatos distintos de tema hoy | al menos 4 |

**Meta:** que cada tema de cada curso cumpla la plantilla: objetivos, glosario con cada término explicado en
lenguaje técnico y sencillo con su código, ejemplo resuelto con salida real, errores comunes, checkpoint, resumen,
ejercicios con respuesta y aplicación en el trabajo.

## Fase 0 · Aprobar el estándar (1 sesión)

- [x] Nicolás revisa `PLANTILLA_CURSO.md` y el tema modelo (Fundamentos M1, Tema 2).
- [x] Aprobada el 2026-11-24 (vista previa visual).

**Listo cuando:** la plantilla está aprobada y ya no cambia sin una nueva versión.

## Fase 1 · Herramientas que hacen cumplir la plantilla (1–2 sesiones)

- [x] **Validador** `scripts/audit_template.py`, llamado desde `validate.sh`. Por tema comprueba: los 12 bloques en
      orden, una ficha completa (5 puntos) por cada término de «Conceptos clave», respuesta en checkpoints y
      ejercicios, ausencia de frases de plantilla y de rutas internas. Arranca en modo informe (no bloquea) y pasa
      a bloquear curso por curso a medida que se migra.
- [ ] **Glosario central por curso** `web/public/content/<curso>/glosario.json`, generado desde las fichas:
      término, definición técnica, definición sencilla, tema donde se define por primera vez. El validador lo usa
      para detectar **términos usados antes de explicarse**.
- [x] **Lector de la app:** (fichas, recuadros y bloques listos; falta enlazar términos del texto a su ficha)
  - fichas de término como tarjetas;
  - cada término del texto enlazado a su ficha (al pasar el cursor o al tocar);
  - estilo propio para los recuadros (error común, buena práctica, prevenir errores);
  - «Resumen» y «En el trabajo» como cajas de cierre.
- [ ] **Ejecutor de ejemplos:** script que corre los bloques de código marcados como ejecutables y compara su
      salida con el bloque `text` siguiente (empezando por Python, Java y JavaScript).

**Listo cuando:** `validate.sh` informa el cumplimiento de cada curso y el lector muestra las nuevas cajas.

## Fase 2 · Piloto completo: Fundamentos M0 y M1 (2–3 sesiones)

Fundamentos es la puerta de entrada: aquí nacen los términos básicos (computador, archivo, terminal, programa,
variable, función…) que los demás cursos enlazan en vez de repetir.

- [ ] Reordenar el curso para que sea acumulativo (propuesta abajo).
- [ ] Reescribir M0 y M1 con la plantilla completa, conservando los laboratorios verificables que ya existen.
- [ ] Glosario base de Fundamentos con cada término de M0–M1.
- [ ] Ejecutar todo el código y pegar salidas reales.
- [ ] Revisión de Nicolás en la app, en local.

**Listo cuando:** M0 y M1 pasan el validador en modo bloqueante y Nicolás los aprueba.

### Orden propuesto para Fundamentos

| Bloque | Módulos (contenido actual) |
|---|---|
| 1. El computador y el entorno | M0 entorno · M8 sistemas operativos (parte básica) |
| 2. Programar | M1 pensamiento computacional · M14 código limpio · M5 testing, depuración y Git |
| 3. Datos y algoritmos | M9 lógica y matemática discreta · M2 estructuras y complejidad · M12 algoritmos clásicos |
| 4. Sistemas | M4 datos y SQL · M3 web y redes · M6 seguridad |
| 5. Diseño | M7 requisitos y arquitectura · M13 patrones de diseño |
| 6. Escala | M8 concurrencia y contenedores · M10 sistemas distribuidos · M11 mapa de especializaciones |

## Fase 3 · Migración curso por curso

Orden por prioridad. Cada módulo se entrega en su propio commit, pasa el validador y se revisa en la app.

| Orden | Curso | Temas aprox. | Nota |
|---|---|---|---|
| 1 | Fundamentos (resto) | 88 | Completa el glosario base |
| 2 | Java | ~130 | Ya tiene el estilo «Mecanismo / Regla práctica»: se adapta, no se reescribe de cero |
| 3 | Spring Boot | ~80 | Antes: decidir Maven o Gradle y reescribir M3–M20 |
| 4 | Microservicios con Spring Boot | ~150 | Debe ser el curso más completo |
| 5 | Flutter | 114 | M1 ya tiene secciones propias (piloto anterior) |
| 6 | iOS | 73 | |
| 7 | Angular | 77 | Incluye completo Angular Native (ng-native.com) |
| 8 | JavaScript, Node.js, Microservicios Node | ~260 | |
| 9 | React, Kotlin Multiplatform, Android | ~225 | |
| 10 | DevOps, Cloud | ~365 | |
| 11 | RutaFlow, Control 1 | ~135 | Control 1 usa fórmulas: el «código» puede ser cálculo o simulación |

**Cómo se migra un módulo (receta fija):**
1. Listar los temas y los términos nuevos de cada uno; comprobar en el glosario cuáles ya existen.
2. Escribir apertura del módulo: objetivos, esquema y prerrequisitos.
3. Por cada tema, escribir los 12 bloques. Conservar el código verificable existente y explicarlo; borrar
   fragmentos sueltos sin contexto.
4. Ejecutar todo el código y pegar la salida real.
5. Escribir el cierre del módulo: resumen, autoevaluación con respuestas, ejercicios graduados y «En el trabajo».
6. Pasar `validate.sh` y revisar en la app.
7. Commit del módulo y marcar avance en `PENDIENTES.md`.

## Fase 4 · Control de calidad continuo

- El validador pasa a modo bloqueante en cada curso terminado: ningún cambio futuro puede volver a meter
  plantilla, términos sin definir o código sin salida.
- Revisión de muestra: cada 10 módulos, Nicolás lee un tema al azar en la app.
- Revisión de temarios contra fuentes oficiales (con Crawl4AI, ver `referencias/REPOS_HERRAMIENTAS.md`) antes de
  migrar cada curso, para agregar los temas que falten.

## Tamaño real del trabajo

Un tema completo con la plantilla ocupa entre 2.000 y 3.500 palabras. Con ~1.300 temas, la academia completa
supera los 3 millones de palabras: es un trabajo de muchas sesiones. Por eso el orden importa: primero el
estándar y las herramientas (fases 0–1), después el piloto y luego los cursos prioritarios. Si una sesión se
interrumpe, otra persona o IA continúa leyendo este plan, la plantilla y `PENDIENTES.md`.
