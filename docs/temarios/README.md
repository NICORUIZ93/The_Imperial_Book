# Temarios de los cursos nuevos y de Microservicios completo

**Estado:** propuestas para aprobación del dueño (specs/013 P7 y specs/020). No hay lecciones escritas, y nada
de este directorio cambia el contenido actual de DevOps, Cloud, Fundamentos ni JavaScript. Ese contenido se
mueve solo después de aprobar cada temario (specs/020, «Reglas»).
**Fecha de revisión de fuentes:** 2026-11-18.

## Resumen

| Curso | Archivo | Módulos | Temas | Horas (temas + proyecto) | Prerrequisitos de la academia |
|---|---|---:|---:|---|---|
| Docker | [docker.md](docker.md) | 14 | 64 | 42 h 20 min + 8 h ≈ **50 h** | Fundamentos M3 y M8; Java M0–M3 y M8; Spring Boot M0–M2 y M7 |
| Kubernetes | [kubernetes.md](kubernetes.md) | 16 | 69 | 46 h 55 min + 10 h ≈ **57 h** | Docker M0–M9; Fundamentos M3 y M8 T3; Spring Boot M7 |
| Diseño de sistemas | [diseno-de-sistemas.md](diseno-de-sistemas.md) | 10 | 38 | 25 h 50 min + 6 h ≈ **32 h** | Fundamentos M3, M4 y M10; Spring Boot M0–M4; Docker M7 |
| IA aplicada al desarrollo | [ia-aplicada.md](ia-aplicada.md) | 11 | 47 | 31 h 20 min + 8 h ≈ **39 h** | Java M0–M5 y M9; Spring Boot M0–M7; Docker M7; Fundamentos M6 y M7 T6–T7 |
| Blockchain | [blockchain.md](blockchain.md) | 10 | 37 | 24 h 50 min + 6 h ≈ **31 h** | Fundamentos M2 y M6; Java M0–M5 y M9; Spring Boot M0–M7; Docker M7 |
| Microservicios (completo) | [microservicios.md](microservicios.md) | 12 (M0–M1 existentes) | 78 | 52 h 45 min + 10 h ≈ **63 h** | Java M0–M3, M5, M8 y M9; Fundamentos M3, M4 y M10; Docker M7 (desde M7); Diseño de sistemas M4 (recomendado) |

Las horas salen de la fórmula de la auditoría: suma de las duraciones de los temas (20–45 min cada uno) más
las horas de proyecto. Un script las calculó desde los propios archivos. Ningún tema nuevo supera los 45 min ni
pasa de 6 temas por módulo. Las únicas excepciones son M0 (10 temas) y M1 (14 temas) de Microservicios: ya
existen, y se propone dividirlos como cambio opcional.

## Orden sugerido entre cursos

```text
Fundamentos ─▶ Java ─▶ Spring Boot ─▶ Docker ─▶ Kubernetes
                                   │        └─▶ Microservicios ◀── Diseño de sistemas
                                   ├─▶ IA aplicada al desarrollo
                                   └─▶ Blockchain
```

Todos los integradores trabajan sobre el backend Spring Boot de RutaFlow (specs/020 R5).

## Reparto aprobado y dónde queda cada pieza

| Origen | Destino |
|---|---|
| DevOps M2 (9 temas), M3 (4) y M15 T1 | Docker M1–M9 (detalle tema por tema en [docker.md](docker.md), §4) |
| Cloud M1 (5 temas) | Docker M0, M2, M3, M7 y M8 |
| DevOps M6 (10 temas), M7 (8) y M15 T2–T4 | Kubernetes M0–M10 y M13 |
| Cloud M14 T3 (EKS) | Kubernetes M14 |
| DevOps M17 (4 temas) | Diseño de sistemas M1, M2, M4 y M6 |
| DevOps M19, M20 y M21 (12 temas) | Microservicios M1 (fusión), M2, M4, M5, M6 y M8 |
| «Fundamentos M12: Web3» | Blockchain M0 y M5. **Ver la discrepancia más abajo** |
| «Fundamentos M12: Docker» | Docker M0. **Ver la discrepancia más abajo** |

### Discrepancia que debe decidir el dueño

El reparto aprobado (`docs/auditoria/PROPUESTAS-TEMARIO.md` §3) dice «Fundamentos M12: Electrónica, Web3 y
Docker a sus cursos». En el repositorio:
- El que fue `foundations/modulo-12.md` era **solo Electrónica** (17 temas), sin Web3 ni Docker. El 2026-11-21
  se movió a `control-1/modulo-29.md` y Fundamentos renumeró sus módulos 13/14/15 como 12/13/14.
- El tema de contenedores de Fundamentos es **M8 T4** «Contenedores: aislamiento reproducible»
  (`foundations/modulo-8.md:324`). El temario de Docker lo cita como origen.
- El único tema de Web3 es **JavaScript M14 «Web3 y machine learning en navegador»**
  (Tema 6 en el último commit; Tema 3 en la fusión de JavaScript M14 que está sin confirmar en el árbol de trabajo). La auditoría ya proponía moverlo a Blockchain. El temario de Blockchain lo
  cita como origen.

Propuesta: aprobar estos dos orígenes corregidos. Electrónica ya se resolvió el 2026-11-21: pasó a Control 1 como
su módulo 29 (Decisión D2 del temario de Fundamentos) y no forma parte de estos temarios.

## Datos verificados en fuentes primarias para estos temarios

| Dato | Valor | Fuente |
|---|---|---|
| Docker Engine | 29.10.0 (2026-11-16). En Engine 29 containerd es el almacén por defecto en instalaciones nuevas y cgroup v1 queda deprecado | docs.docker.com/engine/release-notes/29 |
| Docker Content Trust | En retiro desde el 2025-07-29. Se reemplaza por Sigstore/cosign o Notation | docker.com/blog/retiring-docker-content-trust |
| Docker Hardened Images | Gratuitas con licencia Apache 2.0 desde el 2025-12-17 | docker.com/blog/docker-hardened-images-for-every-developer |
| DCA (Mirantis) | Vigente: 55 preguntas, 90 min, USD 199. Guía v1.5 de enero de 2025 con seis dominios | training.mirantis.com/dca-certification-exam |
| Kubernetes | 1.37 («Garhwal», 2026-08-26); parche 1.37.1; fin de soporte 2027-10-28 | kubernetes.io/releases |
| CKA y CKAD | Ambos sobre v1.37. CKA con dominios vigentes desde el 2025-02-18 | training.linuxfoundation.org; github.com/cncf/curriculum |
| kind · Gateway API · Helm | v0.33.0 (nodo v1.37.0) · v1.6.2 · Helm 4 (Helm 3 solo con parches de seguridad hasta el 2027-02-10) | GitHub releases; helm.sh |
| Ingress-NGINX | Sin versiones ni parches desde marzo de 2026 | kubernetes.io/blog/2025/11/11/ingress-nginx-retirement |
| MCP | Especificación 2026-07-28: sin estado, `server/discover`; Roots y Sampling deprecados | modelcontextprotocol.io/specification |
| Spring AI · Spring Cloud | 2.0.x (Boot 4.1) · 2025.1.x Oakwood (Boot 4.0/4.1) | GitHub spring-ai; spring.io/projects/spring-cloud |
| Solidity · Foundry · OpenZeppelin · web3j | 0.8.38 · v1.8.6 · v5.7.0 · v6.1.0 | GitHub releases |
| Ethereum | Pectra (2025-05-07), Fusaka (2025-12-03), Glamsterdam en desarrollo (Q4 2026). Testnet de apps: Sepolia | ethereum.org/roadmap; ethereum.org/developers/docs/networks |
| DDIA | 2.ª edición (Kleppmann y Riccomini), marzo de 2026 | martin.kleppmann.com |

Cada archivo tiene un apartado «Pendientes de verificar antes de escribir» con lo que no se pudo confirmar en
fuente primaria. Esos datos quedan como decisión pendiente y no se presentan como hechos.

## Al aprobar

1. Registrar en `specs/013` la línea «Temarios aprobados por el dueño» (criterio P7) con los cambios que pida.
2. Crear una spec por curso con sus criterios y su `Verificación:`.
3. Ejecutar el reparto (specs/020) cuando el módulo destino tenga lecciones que superen la puerta editorial:
   el contenido de origen no se borra antes, y el progreso se conserva con `web/src/app/module-renumbering.ts`.
