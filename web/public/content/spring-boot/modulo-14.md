# Módulo 14: Spring GraphQL: contrato, datos anidados y cambios

## Aprende construyendo

El laboratorio fija Java 25 y Spring Boot 4.1.2. Todas las pruebas pasan por el schema y los resolvers reales con ExecutionGraphQlServiceTester. Los datos están en memoria y no hay autenticación; es un laboratorio local, no un backend listo para publicar. HTTP y WebSocket se verifican por separado del servicio GraphQL.


### Tema 1: schema-first con tipos y consultas · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por schema-first con tipos y consultas con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender schema-first con tipos y consultas te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en schema-first con tipos y consultas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que schema-first con tipos y consultas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| schema-first con tipos y consultas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar schema-first con tipos y consultas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses schema-first con tipos y consultas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: schema-first con tipos y consultas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- schema-first con tipos y consultas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve schema-first con tipos y consultas en tu contexto?
2. ¿Cómo sabrías que schema-first con tipos y consultas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar schema-first con tipos y consultas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
cp -R spring-graphql-rutaflow practica-m24-t1
cd practica-m24-t1
./mvnw -q test
```

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#consultaValidaYRechazaCampoInexistente test
```

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#consultaValidaYRechazaCampoInexistente test
```

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#idAusenteEsNullYEstadoInvalidoEsError test
```

</details>

### Tema 2: data fetchers, relaciones y problema N+1 · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por data fetchers, relaciones y problema n+1 con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender data fetchers, relaciones y problema n+1 te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en data fetchers, relaciones y problema n+1 como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que data fetchers, relaciones y problema n+1 resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| data fetchers, relaciones y problema N+1 se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar data fetchers, relaciones y problema N+1 | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses data fetchers, relaciones y problema n+1 por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: data fetchers, relaciones y problema n+1 funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- data fetchers, relaciones y problema N+1 existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve data fetchers, relaciones y problema n+1 en tu contexto?
2. ¿Cómo sabrías que data fetchers, relaciones y problema n+1 no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar data fetchers, relaciones y problema n+1?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
cp -R spring-graphql-rutaflow practica-m24-t2
cd practica-m24-t2
./mvnw -q test
```

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#batchResuelveDosEntregasEnUnaInvocacion test
```

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#batchResuelveDosEntregasEnUnaInvocacion test
```

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#batchResuelveDosEntregasEnUnaInvocacion test
```

</details>

### Tema 3: mutations y subscriptions · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por mutations y subscriptions con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender mutations y subscriptions te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en mutations y subscriptions como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que mutations y subscriptions resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| mutations y subscriptions se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar mutations y subscriptions | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses mutations y subscriptions por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: mutations y subscriptions funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- mutations y subscriptions existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve mutations y subscriptions en tu contexto?
2. ¿Cómo sabrías que mutations y subscriptions no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar mutations y subscriptions?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
cp -R spring-graphql-rutaflow practica-m24-t3
cd practica-m24-t3
./mvnw -q test
```

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#idAusenteEsNullYEstadoInvalidoEsError test
```

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#mutacionEmiteCambioALaSuscripcionLocal test
```

```bash
./mvnw -q -Dtest=EntregaGraphqlTest#mutacionEmiteCambioALaSuscripcionLocal test
```

</details>

### Tema 4: pruebas GraphQL con GraphQlTester · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por pruebas graphql con graphqltester con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender pruebas graphql con graphqltester te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en pruebas graphql con graphqltester como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que pruebas graphql con graphqltester resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| pruebas GraphQL con GraphQlTester se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar pruebas GraphQL con GraphQlTester | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses pruebas graphql con graphqltester por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: pruebas graphql con graphqltester funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- pruebas GraphQL con GraphQlTester existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve pruebas graphql con graphqltester en tu contexto?
2. ¿Cómo sabrías que pruebas graphql con graphqltester no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar pruebas graphql con graphqltester?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
cp -R spring-graphql-rutaflow practica-m24-t4
cd practica-m24-t4
./mvnw -q test
```

```bash
./mvnw -q clean test
```

```bash
curl -s http://localhost:8080/graphql -H 'Content-Type: application/json' -d '{"query":"{ entrega(id: \"ENV-1\") { id estado } }"}'
```

```bash
./mvnw -q test
```

</details>
