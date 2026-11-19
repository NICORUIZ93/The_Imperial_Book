# Temario propuesto · Blockchain

**Estado:** propuesta para aprobación del dueño. No hay lecciones escritas.
**Fecha de revisión de fuentes:** 2026-11-18.
**Identificador de ruta previsto:** `blockchain`.

## 1. Público y prerrequisitos

Este curso es para desarrolladores que quieren saber cuándo una cadena de bloques resuelve un problema real.
Cuando sí lo resuelve, aprenden a escribir, probar e integrar contratos inteligentes en Ethereum de forma
segura. El curso empieza por la pregunta «¿hace falta?» y la repite en el integrador.

| Prerrequisito | Módulos | Para qué |
|---|---|---|
| Fundamentos | M2 (estructuras de datos: hash y árboles) y M6 (seguridad y privacidad) | Hashes, firmas y Ley 1581 |
| Java | M0–M5 y M9 | Cliente web3j en M6 |
| Spring Boot | M0–M6 | La API de RutaFlow que se integra |
| Docker | M7 (Compose) | Nodo local y servicios del integrador |

No hace falta JavaScript. La parte de Web3 del tema «Web3 y machine learning en navegador» (JavaScript M14) pasa a este curso.

## 2. Resultado final medible

1. Un análisis «¿hace falta blockchain?» para RutaFlow. Si la respuesta es no, el análisis también es una
   entrega válida.
2. Un contrato `PruebaDeEntrega` en Solidity que ancla el hash de la evidencia de entrega (nunca datos
   personales). Tiene control de acceso, eventos y errores personalizados, y pruebas con fuzzing en Foundry
   con cobertura medida.
3. Un informe de seguridad del contrato con tres vulnerabilidades clásicas reproducidas en contratos de
   práctica (reentrancia, control de acceso y `tx.origin`) y corregidas.
4. Un servicio Spring Boot que, con web3j, publica la transacción, espera la finalidad, escucha el evento y
   concilia con PostgreSQL.
5. El contrato desplegado en Sepolia y verificado, con la dirección y la transacción registradas.

## 3. Versiones de referencia

| Pieza | Versión o estado | Fuente y fecha |
|---|---|---|
| Solidity | 0.8.38 (2026-10-22): corrige un error del optimizador de Yul y prepara Glamsterdam. Desde 0.8.31 hay funciones deprecadas que la 0.9.0 eliminará | [solidity releases](https://github.com/ethereum/solidity/releases) |
| Foundry | v1.8.6 (2026-10-21) | [foundry releases](https://github.com/foundry-rs/foundry/releases) |
| OpenZeppelin Contracts | v5.7.0 | [openzeppelin-contracts releases](https://github.com/OpenZeppelin/openzeppelin-contracts/releases) |
| web3j | v6.1.0 | [web3j releases](https://github.com/LFDT-web3j/web3j/releases) |
| Red de pruebas | Sepolia, la red por defecto recomendada para desarrollo de aplicaciones. Hoodi es para validadores. Holesky está deprecada desde septiembre de 2025 | [ethereum.org: redes](https://ethereum.org/developers/docs/networks/) |
| Red local | Anvil, incluido en Foundry | Foundry |
| Java / Spring Boot | JDK 25 · Spring Boot 4.1.x | `docs/VERSIONES.md` |

Actualizaciones de red que el curso cita, según el [roadmap de ethereum.org](https://ethereum.org/roadmap/):

| Actualización | Fecha | Qué trajo |
|---|---|---|
| Dencun | 2024-03-13 | Transacciones con blobs (EIP-4844) y almacenamiento transitorio (EIP-1153) |
| Pectra | 2025-05-07 | Funcionalidad de contrato para cuentas externas (EIP-7702) |
| Fusaka | 2025-12-03 | PeerDAS y tope de gas por transacción |
| Glamsterdam | En desarrollo, previsto para el cuarto trimestre de 2026 | — |

Si Glamsterdam se activa antes de escribir M1, se añade una práctica de compatibilidad (metodología,
«Mantenimiento tecnológico»).

## 4. Qué se incorpora desde otros cursos (reparto aprobado en specs/016)

| Origen | Contenido | Destino | Tratamiento |
|---|---|---|---|
| JavaScript M14 «Web3 y machine learning en navegador» | Solo la parte de Web3. Es el Tema 6 en el último commit y el Tema 3 en la fusión de JavaScript M14 que está sin confirmar | M0 T1 y M5 T1 | La parte de ML se queda en JavaScript |

**Nota sobre el origen.** El reparto aprobado dice «Fundamentos M12: Electrónica, Web3 y Docker a sus cursos».
En el repositorio, Fundamentos M12 es solo Electrónica (17 temas, ninguno de Web3). El único tema de Web3 está
en **JavaScript M14 «Web3 y machine learning en navegador»**, y la auditoría de calidad ya proponía moverlo a este curso
(`calidad-fundamentos-js-node-react.md`, hallazgo de JavaScript).

## 5. Módulos

### M0 · ¿Necesitas una blockchain?
**Objetivo:** decidir con criterios cuándo una cadena aporta algo que una base de datos no aporta.
**Origen:** nuevo; parte de JavaScript M14 «Web3 y machine learning en navegador».
- T1 · El problema: varias partes que no confían entre sí. Cuándo basta una base de datos con auditoría · 40 min
- T2 · Hashes, firmas digitales y árboles de Merkle, ejecutados en Java · 45 min
- T3 · Cuentas, transacciones y bloques en Ethereum · 40 min
- T4 · Proof-of-stake y finalidad: cuándo una transacción ya no se revierte · 35 min

**Hito RutaFlow:** primera versión del análisis «¿hace falta?» para la prueba de entrega.
**Duración:** 2 h 40 min

### M1 · La EVM, el gas y la red
**Objetivo:** predecir cuánto cuesta y dónde se ejecuta un contrato.
**Origen:** nuevo.
- T1 · La EVM: pila, memoria y almacenamiento · 40 min
- T2 · Gas, comisión base y prioridad · 40 min
- T3 · Nodos, clientes y la API JSON-RPC · 35 min
- T4 · Redes: mainnet, Sepolia y Anvil local · 35 min

**Hito RutaFlow:** costo estimado en gas de anclar una entrega, medido en Anvil.
**Duración:** 2 h 30 min

### M2 · Solidity con Foundry
**Objetivo:** escribir y probar un contrato desde cero.
**Origen:** nuevo.
- T1 · Proyecto Foundry: `forge init`, `build` y `test` · 40 min
- T2 · Tipos, variables de estado, funciones y visibilidad · 45 min
- T3 · Eventos y errores personalizados · 40 min
- T4 · Pruebas con fuzzing y cobertura en `forge` · 45 min

**Hito RutaFlow:** `PruebaDeEntrega` v1 con pruebas en verde.
**Duración:** 2 h 50 min

### M3 · Contratos seguros
**Objetivo:** reproducir y corregir las vulnerabilidades clásicas.
**Origen:** nuevo.
- T1 · Control de acceso con OpenZeppelin 5 (`Ownable` y `AccessControl`) · 40 min
- T2 · Reentrancia y el patrón checks-effects-interactions · 45 min
- T3 · `tx.origin`, llamadas externas sin comprobar y aleatoriedad predecible · 40 min
- T4 · Análisis estático y lista de revisión antes de desplegar · 35 min

**Hito RutaFlow:** informe con tres vulnerabilidades reproducidas y corregidas.
**Duración:** 2 h 40 min

### M4 · Estándares y actualizaciones
**Objetivo:** usar estándares en lugar de reinventarlos, y entender el riesgo de cambiar un contrato desplegado.
**Origen:** nuevo.
- T1 · ERC-20: interfaz, `approve` y `transferFrom` · 40 min
- T2 · ERC-721: identidad no fungible · 40 min
- T3 · Riesgos de las aprobaciones ilimitadas · 35 min
- T4 · Contratos actualizables con proxy: qué ganas y qué confianza cedes · 45 min

**Hito RutaFlow:** decisión escrita de si `PruebaDeEntrega` será actualizable, con su motivo.
**Duración:** 2 h 40 min

### M5 · Cuentas, billeteras y firma
**Objetivo:** gestionar claves y firmas sin exponerlas.
**Origen:** parte de JavaScript M14 «Web3 y machine learning en navegador» (billetera en el navegador).
- T1 · Billeteras, claves privadas y frase semilla · 35 min
- T2 · EIP-7702 (Pectra): cuentas externas con código · 40 min
- T3 · Mensajes tipados firmados (EIP-712) · 40 min

**Hito RutaFlow:** el conductor firma la entrega fuera de la cadena y el contrato verifica la firma.
**Duración:** 1 h 55 min

### M6 · Integración con el backend Spring Boot
**Objetivo:** que RutaFlow publique y lea la cadena con garantías.
**Origen:** nuevo.
- T1 · Leer estado y eventos con web3j · 45 min
- T2 · Enviar transacciones firmadas: nonce, gas y confirmación · 45 min
- T3 · Reorganizaciones y finalidad: cuándo dar un evento por definitivo · 40 min
- T4 · Custodia de claves en el servidor: variables, almacenes de secretos y KMS · 40 min

**Hito RutaFlow:** la API ancla una entrega y concilia el evento con PostgreSQL.
**Duración:** 2 h 50 min

### M7 · Escalado, oráculos y puentes
**Objetivo:** conocer las piezas que rodean a un contrato y sus riesgos.
**Origen:** nuevo.
- T1 · Rollups de capa 2 y blobs (Dencun, Fusaka) · 40 min
- T2 · Oráculos: traer datos externos y el riesgo que añaden · 40 min
- T3 · Puentes entre cadenas y por qué concentran riesgo · 35 min

**Hito RutaFlow:** comparación de costo de anclaje entre capa 1 y capa 2, documentada.
**Duración:** 1 h 55 min

### M8 · Datos personales y cumplimiento
**Objetivo:** no publicar en una cadena inmutable datos que la ley obliga a poder borrar.
**Origen:** nuevo; enlaza el tema de Ley 1581 de Fundamentos (specs/013 P6).
- T1 · Inmutabilidad frente a supresión y rectificación (Ley 1581 de 2012) · 40 min
- T2 · Anclar hashes con sal, nunca datos: qué se puede deducir de un hash · 35 min
- T3 · Costo total y decisión final: cadena pública, permisionada o ninguna · 35 min

**Hito RutaFlow:** revisión de privacidad del contrato aprobada.
**Duración:** 1 h 50 min

### M9 · Proyecto integrador
**Objetivo:** reunir las cinco evidencias del apartado 2.
- T1 · Hito 1: análisis de necesidad y diseño del contrato (M0 y M8) · 45 min
- T2 · Hito 2: contrato con pruebas, fuzzing e informe de seguridad (M2 y M3) · 45 min
- T3 · Hito 3: integración Spring Boot con finalidad y conciliación (M6) · 45 min
- T4 · Hito 4: despliegue y verificación en Sepolia · 45 min

Trabajo autónomo del proyecto: 6 h.
**Duración:** 3 h de temas + 6 h de proyecto.

## 6. Proyecto integrador sobre RutaFlow

Caso de uso: varias empresas (remitente, transportadora y destinatario) necesitan una prueba de entrega que
ninguna pueda alterar sola. El backend Spring Boot de RutaFlow guarda la evidencia en PostgreSQL y ancla solo
su hash con sal en el contrato. Nunca guarda nombres, direcciones ni fotos en la cadena. La rúbrica son las
cinco evidencias del apartado 2.

## 7. Horas estimadas

Fórmula: suma de las duraciones de los temas más las horas de proyecto. Total: **24 h 50 min de temas + 6 h de proyecto = 30 h 50 min (≈ 31 h)**.

## 8. Cobertura frente a fuentes primarias

No hay una certificación oficial de Ethereum. La cobertura se mide frente a la
[documentación para desarrolladores de ethereum.org](https://ethereum.org/developers/docs/) y la
[documentación de Solidity](https://docs.soliditylang.org/):

| Sección de ethereum.org | Dónde |
|---|---|
| Foundational: intro, cuentas, transacciones, bloques, EVM, gas, nodos y clientes, redes, consenso | M0 y M1 |
| Ethereum stack: contratos inteligentes, redes de desarrollo, frameworks, APIs de cliente, autenticación, lenguajes | M2, M5 T1, M6 y M1 T3–T4 |
| Advanced: standards | M4 |
| Advanced: oracles, scaling, bridges, data availability | M7 |
| Advanced: MEV, networking layer, data structures and encoding | Fuera de alcance; MEV se menciona en M1 T2 |
| Design fundamentals: heurísticas de UX Web3 | M5 (de forma parcial) |

| Documentación de Solidity | Dónde |
|---|---|
| Tipos, estructura de un contrato, funciones, eventos, errores y visibilidad | M2 |
| Consideraciones de seguridad (reentrancia, `tx.origin`, llamadas externas) | M3 |
| Notas de versión y deprecaciones hacia 0.9.0 | M2 T1 (fijar `pragma`) |

## 9. Fuera de alcance, con motivo

- Otras cadenas (Solana, Bitcoin Script) y lenguajes (Vyper): el curso es profundo en un solo ecosistema.
- Inversión y trading: no es desarrollo de software.
- MEV y la capa de red P2P: son avanzados y no hacen falta para el integrador.

## 10. Pendientes de verificar antes de escribir

- La herramienta de análisis estático de M3 T4: se elige una mantenida y compatible con Solidity 0.8.38.
- La versión de JDK que exige web3j 6.1.0, contra JDK 25 en el Mac del dueño.
- La versión de EVM por defecto de solc 0.8.38 y el estado de Glamsterdam en la fecha de escritura.

## Fuentes consultadas (2026-11-18)

- https://ethereum.org/developers/docs/
- https://ethereum.org/developers/docs/networks/
- https://ethereum.org/roadmap/
- https://github.com/ethereum/solidity/releases
- https://docs.soliditylang.org/
- https://github.com/foundry-rs/foundry/releases
- https://github.com/OpenZeppelin/openzeppelin-contracts/releases
- https://github.com/LFDT-web3j/web3j/releases
