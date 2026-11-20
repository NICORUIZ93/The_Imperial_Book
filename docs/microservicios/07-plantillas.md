# 7 · Plantillas

> Entregable 7 del prompt del dueño: **ADR**, **rúbrica del Comité de Arquitectura** y **diario de
> aprendizaje**. Copia el bloque que necesites a tu repositorio de laboratorios. Las tres se usan en el curso:
> el ADR desde el Módulo 24, la rúbrica en el Módulo 32 y el diario desde el primer día.

## 7.1 Plantilla de ADR (Architecture Decision Record)

Formato basado en el ADR de Michael Nygard («Documenting Architecture Decisions», 2011,
https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) con dos añadidos que exige el prompt:
**al menos 2 alternativas con trade-off explícito** y la **fitness function** que vigilará la decisión.
Guárdalo como `docs/adr/NNNN-titulo-en-minusculas.md` (numeración correlativa, nunca se reutiliza un número).

```markdown
# ADR-NNNN: <decisión en una frase, en presente: «Usamos Temporal para orquestar la saga de reservas»>

- **Estado:** Propuesto | Aceptado | Rechazado | Reemplazado por ADR-MMMM
- **Fecha:** AAAA-MM-DD
- **Decisores:** <nombres o roles>
- **Módulos o servicios afectados:** <lista>

## Contexto

<Qué problema hay, qué fuerzas actúan (requisitos, restricciones, plazos, equipo) y qué pasa si no decidimos.
Incluye números: carga esperada, latencia objetivo (p99), coste máximo, tamaño del equipo.>

## Opciones consideradas

| Opción | A favor | En contra | Coste aproximado |
|---|---|---|---|
| A. <opción elegida> | | | |
| B. <alternativa 1> | | | |
| C. <alternativa 2, puede ser «no hacer nada» o «no usar microservicios»> | | | |

## Decisión

<Qué elegimos y por qué, en relación directa con el contexto. Una o dos frases claras.>

## Consecuencias

- **Positivas:** <qué mejora>
- **Negativas (trade-off aceptado):** <qué empeora o qué deuda asumimos>
- **Riesgos y mitigación:** <riesgo → acción>

## Fitness function

<Cómo comprobaremos automáticamente que la decisión se sigue cumpliendo. Ejemplo: «test de ArchUnit que falla
si `reservas` importa clases de `pagos`», «alerta si el p99 de `/reservas` supera 300 ms durante 5 minutos».>

## Cuándo revisar esta decisión

<Condición concreta que obliga a reabrirla: «si el tráfico supera 500 reservas/s», «si el equipo pasa de 2 a 3
squads».>
```

### Ejemplo relleno (Módulo 32, restricción sobrevenida)

```markdown
# ADR-0007: Pasamos el cobro a asíncrono con reintentos porque el proveedor de pagos limita a 20 peticiones/s

- **Estado:** Aceptado
- **Fecha:** 2026-11-19
- **Decisores:** equipo de reservas
- **Módulos o servicios afectados:** reservas, pagos, gateway

## Contexto
El proveedor de pagos anunció un límite de 20 peticiones/s por cliente. El test de carga con Gatling muestra
picos de 60 reservas/s; con el cobro síncrono, dos de cada tres peticiones del pico (40 de 60 por segundo) recibiría HTTP 429.

## Opciones consideradas
| Opción | A favor | En contra | Coste aproximado |
|---|---|---|---|
| A. Cola de cobros con consumo limitado a 18/s y saga en Temporal | absorbe picos; reintentos durables | la reserva queda «pendiente de pago» unos segundos | 1 worker más |
| B. Rate limiting en el gateway a 20 reservas/s | sencillo | rechaza clientes en los picos; pierde ventas | ninguno |
| C. Contratar el plan superior del proveedor | sin cambios de código | coste mensual fijo; no elimina el límite, solo lo sube | según contrato |

## Decisión
Opción A: el cobro sale de la ruta síncrona y lo consume un worker limitado a 18 cobros/s.

## Consecuencias
- Positivas: ningún 429 del proveedor en los picos medidos.
- Negativas: la interfaz muestra «Pago en proceso»; aumenta la complejidad de la saga.
- Riesgos: cola creciente si el pico dura mucho → alerta por profundidad de cola.

## Fitness function
Alerta si la cola de cobros supera 2 000 mensajes o si el tiempo hasta el cobro supera 60 s en p99.

## Cuándo revisar esta decisión
Si el proveedor sube el límite por encima del pico medido o si el negocio exige confirmación inmediata.
```

## 7.2 Rúbrica del Comité de Arquitectura (Architecture Review Board)

Se usa en la defensa del Módulo 32. Cada criterio se puntúa de 1 a 4; el peso indica cuánto cuenta. **Aprueba**
quien obtiene **≥ 2.8 de media ponderada** y **ningún criterio en 1**. Duración de la defensa: 20 minutos de
presentación + 20 de preguntas.

| # | Criterio | Peso | 1 · Insuficiente | 2 · En desarrollo | 3 · Competente | 4 · Maestro |
|---|---|---|---|---|---|---|
| 1 | **Descomposición y límites** | 15 % | servicios por capa técnica o por tabla | bounded contexts nombrados pero con dependencias cíclicas | contextos coherentes, cada servicio con su base de datos | justifica cada límite con el dominio y el equipo (Conway); identifica qué **no** separar |
| 2 | **Consistencia y saga** | 15 % | sin manejo de fallos parciales | saga sin compensaciones idempotentes | saga orquestada en Temporal con compensaciones probadas | demuestra en vivo un fallo a mitad de saga y la recuperación; explica por qué no 2PC |
| 3 | **Resiliencia** | 10 % | sin timeouts | timeouts sin presupuesto de latencia | circuit breaker, retry con jitter y fallback probados con Toxiproxy | presupuesto de latencia de extremo a extremo y degradación elegante medida |
| 4 | **Seguridad** | 10 % | secretos en el código o tokens sin validar | JWT validado pero sin scopes | OAuth2/OIDC con scopes, secretos en Vault, imágenes escaneadas | Zero-Trust: mTLS entre servicios y token exchange justificados |
| 5 | **Observabilidad** | 10 % | solo logs de texto | métricas sin trazas | trazas distribuidas, logs estructurados y dashboard | alertas sobre p99 y SLO, y diagnóstico de un incidente con la traza |
| 6 | **Rendimiento y carga** | 10 % | sin test de carga | test de carga sin objetivo | Gatling con objetivo de p99 y throughput, resultados explicados | identifica el cuello de botella y muestra el antes/después de la mejora |
| 7 | **Restricción sobrevenida y ADR** | 15 % | ignora la restricción | cambia el código sin documentar | ADR con 2+ alternativas y trade-offs | ADR con fitness function y condición de revisión; el rediseño se mide |
| 8 | **Costo (FinOps)** | 5 % | sin estimación | estimación sin fuente | estimación con precios reales y right-sizing | compara contenedores frente a serverless con break-even calculado |
| 9 | **Comunicación y defensa** | 10 % | no responde las preguntas | responde con dudas | diagramas C4 claros y respuestas razonadas | reconoce límites del diseño y propone alternativas sin ponerse a la defensiva |

**Hoja de puntuación**

```text
Estudiante: ____________________   Fecha: __________   Evaluadores: ____________________

Criterio                         Peso   Nota (1-4)   Ponderado
1 Descomposición y límites       0.15   ____         ____
2 Consistencia y saga            0.15   ____         ____
3 Resiliencia                    0.10   ____         ____
4 Seguridad                      0.10   ____         ____
5 Observabilidad                 0.10   ____         ____
6 Rendimiento y carga            0.10   ____         ____
7 Restricción sobrevenida y ADR  0.15   ____         ____
8 Costo (FinOps)                 0.05   ____         ____
9 Comunicación y defensa         0.10   ____         ____
                                 1.00                Total: ____  (aprueba con ≥ 2.80 y ningún 1)

Pregunta que más dudas generó: ______________________________________________
Recomendación del comité: [ ] Aprobado  [ ] Aprobado con cambios  [ ] Repetir defensa
```

**Preguntas típicas del comité:** ¿qué pasa si el proveedor de pagos tarda 30 s?, ¿qué servicio fusionarías si
el equipo se reduce a la mitad?, ¿cuánto cuesta tu sistema al mes y cómo lo bajarías un 30 %?, ¿qué parte de
este sistema **no** debería ser un microservicio?

## 7.3 Diario de aprendizaje

Una entrada por sesión de estudio, en `diario/AAAA-MM-DD.md`. Lleva menos de 10 minutos y es la mejor
herramienta para fijar lo aprendido y preparar entrevistas.

```markdown
# Diario · AAAA-MM-DD

- **Módulo y ficha:** <Módulo 8 · Resilience4j: Circuit Breaker…>
- **Tiempo dedicado:** <1 h 30 min>
- **Energía al empezar / al terminar (1-5):** <3 / 4>

## Lo que aprendí (en mis palabras, como si se lo explicara a alguien que nunca programó)

<3-5 frases. Si no puedes explicarlo sin jerga, vuelve a la sección «Explicación nivel 0» de la ficha.>

## Lo que rompí a propósito y cómo lo diagnostiqué

<Qué fallo provocaste en el mini-laboratorio, qué síntoma viste (mensaje exacto) y cómo llegaste a la causa.>

## Test de verificación

- [ ] Pasó el test de la sección 11 de la ficha
- Comando: `<mvn test -Dtest=... / npm test -- ...>`
- Resultado: <copia la línea final de la salida>

## Pregunta de entrevista de hoy

**Pregunta:** <copia la de la sección 13>
**Mi respuesta (sin mirar la respuesta modelo):** <...>
**Lo que me faltó comparado con la respuesta modelo:** <...>

## Dudas abiertas

- <duda> → <dónde buscaré la respuesta o a quién preguntaré>

## Siguiente paso

<La próxima ficha o el repaso que haré.>
```

**Revisión semanal** (al final de cada semana, 15 minutos): relee las entradas, marca las dudas resueltas y
anota en una línea qué tema te costó más. Ese tema es el primero que repasas antes del Proyecto Final.
