# Estado de la reestructuración (specs/021)

Se marca cada línea cuando su fase termina y queda su informe en esta carpeta.

- [x] Z0 · main unificado y README con Floci
- [ ] Z1 · mapa de conceptos aprobado por el dueño
- [ ] Z2 · temarios objetivo aprobados
- [ ] Z3 · validador único de plantilla y títulos
- [ ] Z4 · todos los temas con nivel y minutos, orden sin excepciones
- [ ] Z5 · todo tema con diagrama o imagen
- [ ] Z6 · Floci con lección de entrada y laboratorios verificados
- [ ] Z7 · laboratorios de todos los cursos verificados en el Mac
- [ ] Z8 · Java, Gradle y Spring primero, con laboratorios en Gradle verificados
- [ ] Z9 · profundidad: mitad de temas en Integración/Experto, ejemplo realista, error real y criterio
- [ ] Z10 · formato educativo único en cursos, módulos, temas, laboratorios y página

Floci comprobado en el Mac el 2026-11-20: los cuatro servicios arrancan, AWS local responde 200 en `/_floci/health` a los ~16 s y `aws s3 mb/ls/rb` funcionan. Azure responde en `/_floci/health`; GCP no tiene esa ruta.

Formato único aprobado por el dueño el 2026-11-20 (12 secciones; Microservicios conserva su ficha de 14 puntos).
- [ ] Z11 · Microservicios con Gradle verificado en el Mac y temario contrastado

Decisiones del dueño sobre los temarios (2026-11-20): siempre la versión extendida, nunca la reducida.
Gradle: 28 módulos y 166 temas. Java: 279 temas. Spring: 281 temas (Spring AI incluido).

Temarios objetivo aprobados por el dueño (2026-11-20): Java (279 temas), Gradle (166) y Spring (281).
La reescritura se prepara en `docs/reestructuracion/cursos/<curso>/` y se publica en la página por tramos completos.
