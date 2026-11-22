# Guía editorial · 5 pasos (Microservicios Java/Spring Boot)

Guía de 1 página para redactar temas del curso *Microservicios con Java y Spring Boot: de Desarrollador a Arquitecto*. El objetivo es que cada tema se lea como capítulo técnico, no como formulario.

## Principios no negociables

| Principio | Regla operativa | Se ve bien | Se ve mal |
|---|---|---|---|
| Dolor antes de herramienta | Ningún concepto nuevo entra sin fallo observable en Tienda Aurora. | “Con mil usuarios, la BD repite la misma consulta y se satura.” | “Redis es una base de datos en memoria muy usada.” |
| Narrativa continua | El tema se lee como capítulo; secciones organizan, no fragmentan. | Párrafos cortos conectados por causa y efecto. | Lista de bullets sin hilo conductor. |
| Voz y tono | Voz activa, presente, español neutro, cercano, sin condescendencia. | “Vas a configurar el TTL y observar el cambio.” | “Obviamente, simplemente debes poner un caché.” |
| Claridad | Máximo 5 líneas por párrafo y 25 palabras por frase. | Una idea por frase. | Párrafos densos con varias ideas técnicas. |
| Término nuevo | Definir en la misma frase o enlazar al glosario. | “TTL (*time to live*), el tiempo de vida de un dato en caché.” | Usar TTL sin definirlo. |
| Código con propósito | Cada bloque dice archivo, propósito y qué observar. | “Archivo `CacheConfig.java` → define el TTL.” | Código sin contexto. |
| Experimento real | Romper algo a propósito y mostrar salida esperada. | “Baja el TTL a 2s y verás dos DB hits.” | “Prueba diferentes valores.” |
| Cierre útil | Retomar analogía, trade-offs, error, entrevista, transferencia. | Tabla de cuándo usar/no usar. | Resumen genérico. |
| Decisión técnica | Toda decisión incluye al menos 2 alternativas y trade-off. | Cache-Aside vs Read-Through vs sin caché. | “Usa Redis.” |
| Honestidad técnica | No inventar APIs, salidas ni comportamientos. | “Nota de verificación: requiere Docker.” | Afirmar ejecución no realizada. |

## Patrón obligatorio de 5 pasos

| Paso | Peso | Qué debe contener | Error a evitar |
|---|---:|---|---|
| 1. El dolor | 10% | Problema real en Tienda Aurora, síntoma observable, comando/log. | Empezar con definición teórica. |
| 2. La intuición | 20% | Una sola analogía, diagrama con flechas, sin código. | Varias analogías o código prematuro. |
| 3. La construcción | 40% | Código desde cero, archivo por bloque, versiones reales, explicación relevante. | Copiar/pegar sin propósito ni ruta. |
| 4. El experimento | 20% | Cambiar un parámetro, romper a propósito, output esperado (máx. 3 líneas), qué observar. | “Prueba tú mismo” sin resultado esperado. |
| 5. El cierre | 10% | Retomar analogía, trade-offs, error común, entrevista con respuesta modelo, 3 transferencias. | Cerrar con resumen vacío. |

## Checklist de publicación

- [ ] El estudiante sintió el dolor antes de ver la herramienta.
- [ ] Hay una sola analogía sostenida y retomada en el cierre.
- [ ] Cada término nuevo se define en la misma frase o se enlaza.
- [ ] El código es ejecutable o tiene Nota de verificación honesta.
- [ ] Cada bloque tiene archivo, propósito y contexto.
- [ ] El laboratorio tiene comandos, salida esperada (máx. 3 líneas) y qué observar.
- [ ] Existe tabla de trade-offs con al menos 2 alternativas.
- [ ] Existe error común con síntoma, causa y arreglo.
- [ ] Existe pregunta de entrevista con respuesta modelo.
- [ ] Hay 3 preguntas de transferencia; al menos una con respuesta correcta “No usar X”.
- [ ] No hay “simplemente”, “obviamente”, “como todos saben”, ni condescendencia.
- [ ] `python3 scripts/build_web_topic_index.py` y `./scripts/validate.sh` pasan.
