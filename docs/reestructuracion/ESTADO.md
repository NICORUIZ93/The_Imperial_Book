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

Temarios objetivo **aprobados por el dueño: 8** (comprobado el 2026-11-20 buscando «Aprobado por el dueño»
en `docs/temarios/*-objetivo.md`): Java (279), Gradle (166), Spring (281), Microservicios (395), Flutter
(345), iOS (324), Angular (297) y Fundamentos (298). Suman los **2.385 temas en 379 módulos** de
`ESTADO-DE-TEMAS.csv`. Antes esta línea decía 3, lo que hacía contradecir a `CONTINUAR.md:113`.
Aún quedan en «propuesta» dentro del propio documento aprobado: `java-objetivo.md:5`, `gradle-objetivo.md:5`
y `spring-objetivo.md:5` conservaban la frase «Estado: propuesta para aprobación del dueño» bajo el banner de
aprobación, y `angular-objetivo.md:3` decía «Pendiente de aprobación del dueño» mientras su línea 5 declaraba
aprobado. **Corregidos el 2026-11-20**: las cuatro líneas dicen ahora lo que decide el banner, porque un
relevo que aplicara la regla 2 de `CONTINUAR.md` se habría parado ahí y no habría escrito Java, Gradle,
Spring ni Angular.
La reescritura se prepara en `docs/reestructuracion/cursos/<curso>/` y se publica en la página por tramos completos.
