# Auditoría de contenido — 2026-05-22

Estado inicial antes de remediación "desde cero" solicitada por el usuario.

## Resumen
- Java: 23 módulos, 122 temas.
- Spring Boot: 21 módulos, 123 temas.
- Spring microservicios: 16 módulos, 68 temas. M0-M3 reescritos al estándar libro vivo; M4-M15 creados/reescritos a cero-a-experto con mínimos ejecutables Java/Node y notas honestas donde falta infraestructura (Spring Cloud/Kafka/K8s/OTel/IdP).
- Node microservicios: 16 módulos, 61 temas (lote previo, verificado con Node 24.18.0).
- Módulos con compresión/tabla-sustituto detectada: 18 (auditoría inicial; Java/Spring Boot remediados, microservicios split/remediado).
- Estado actual repo: 17 tracks, 319 módulos, 1687 temas.

## Matriz

| Track | Módulo | Estado | Nota |
|---|---:|---|---|
| java | modulo-0..22 | REESCRITO | Verificado en lotes previos; mantener bajo gate. |
| spring-boot | modulo-0..20 | REESCRITO/AJUSTADO | Agregados puentes: Java moderno (M0), Floci tests (M6), HTTP Service Clients/IA (M8), AOT/CRaC (M19). Verificación pendiente en partes nuevas. |
| spring-microservices | modulo-0..3 | REESCRITO | Libro vivo, smokes Java, notas honestas donde aplica. |
| spring-microservices | modulo-4..15 | CREADO/AJUSTADO | Libro vivo; smokes Java/Node; añadidos HTTP Service Clients/Nacos/OTel/Zero-Trust/Floci/AOT-CRaC. Notas honestas para infra externa. |
| node-microservices | modulo-0..15 | REESCRITO | Verificado con Node 24.18.0; notas honestas para infra externa. |
| android | modulo-0..18 | PENDIENTE | 14 módulos con heredoc/cat>; auditar DoD completo. |
| angular | modulo-0..16 | PENDIENTE | Sin heredocs detectados; auditar DoD libro vivo. |
| cloud | modulo-0..34 | PENDIENTE | 11 módulos con heredoc/cat>; auditar DoD completo. |
| control-1 | modulo-0..29 | PENDIENTE | Auditar DoD completo. |
| devops | modulo-0..22 | PENDIENTE | 15 módulos con heredoc/cat>; auditar DoD completo. |
| flutter | modulo-0..22 | PENDIENTE | 1 heredoc/cat>; auditar DoD completo. |
| foundations | modulo-0..14 | PENDIENTE | Auditar DoD completo. |
| ios | modulo-0..14 | PENDIENTE | Auditar DoD completo. |
| javascript | modulo-0..14 | PENDIENTE | Auditar DoD completo. |
| kotlin-multiplatform | modulo-0..13 | PENDIENTE | 1 heredoc/cat>; auditar DoD completo. |
| node | modulo-0..13 | PENDIENTE | Auditar DoD completo. |
| react | modulo-0..14 | PENDIENTE | Auditar DoD completo. |
| rutaflow | modulo-0..7 | PENDIENTE | 1 heredoc/cat>; auditar DoD completo. |

## Prioridad de remediación
1. Spring Boot M2-M11: comprimidos por pases recientes, corregir primero.
2. Spring Boot M0-M1, M12-M20: auditar y reescribir a D+formal.
3. Java M14-M22: comprimidos, reescribir.
4. Java M0-M13: auditoría conceptual + ejecución; reescribir donde no cumpla cobertura por concepto.

## Regla
No marcar módulo como hecho sin verificación factible y evidencia por tema.
