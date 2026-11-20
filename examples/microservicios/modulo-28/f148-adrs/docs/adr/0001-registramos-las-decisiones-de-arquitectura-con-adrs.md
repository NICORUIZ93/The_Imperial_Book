# ADR-0001: Registramos las decisiones de arquitectura con ADRs en el repositorio

- **Estado:** Aceptado
- **Fecha:** 2026-11-02
- **Decisores:** equipo de la tienda (3 personas) y arquitecta de referencia
- **Módulos o servicios afectados:** todos

## Contexto

Las decisiones importantes (qué broker usamos, dónde vive cada dato) se toman en reuniones y chats y a los tres meses
nadie recuerda por qué. Dos personas nuevas entran en enero y ya preguntaron dos veces «¿por qué no usamos Kafka?».

## Opciones consideradas

| Opción | A favor | En contra | Coste aproximado |
|---|---|---|---|
| A. ADRs en Markdown en `docs/adr/` del repositorio | Versionados con el código, se revisan en el PR | Disciplina para escribirlos | 30 min por decisión |
| B. Página en la wiki del equipo | Fácil de editar | Se desincroniza del código, sin revisión | Igual |
| C. No documentar | Ningún esfuerzo hoy | Se repiten discusiones y errores | Horas perdidas cada trimestre |

## Decisión

Usamos ADRs en Markdown con la plantilla del curso, numerados y revisados en el mismo PR que el cambio que justifican.

## Consecuencias

- **Positivas:** el «por qué» queda junto al código y con su historial.
- **Negativas (trade-off aceptado):** cada decisión significativa cuesta media hora más.
- **Riesgos y mitigación:** que se olviden → `adr.js lint` en CI y la casilla «¿necesita ADR?» en la plantilla de PR.

## Fitness function

`node f148-adrs/adr.js docs/adr lint` en CI: falla si falta una sección, si hay menos de 2 opciones o si un reemplazo
no está enlazado en los dos sentidos.

## Cuándo revisar esta decisión

Si en un trimestre se escriben menos de 2 ADRs con más de 5 cambios de arquitectura fusionados.
