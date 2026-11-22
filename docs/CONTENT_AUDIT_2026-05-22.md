# Auditoría de contenido — 2026-05-22

Estado inicial antes de remediación "desde cero" solicitada por el usuario.

## Resumen
- Java: 23 módulos, 122 temas.
- Spring Boot: 21 módulos, 123 temas.
- Spring microservicios: 16 módulos, 68 temas. M0-M3 reescritos al estándar libro vivo; M4-M15 creados/reescritos a cero-a-experto con mínimos ejecutables Java/Node y notas honestas donde falta infraestructura (Spring Cloud/Kafka/K8s/OTel/IdP).
- Node microservicios: 16 módulos, 61 temas (lote previo, verificado con Node 24.18.0).
- Módulos con compresión/tabla-sustituto detectada: 18 (auditoría inicial; Java/Spring Boot remediados, microservicios split/remediado).
- Estado actual repo: 17 tracks, 319 módulos, 1679 temas.

## Matriz

| Track | Módulo | Temas | Líneas | Capa1 | Capa2 | Fundamento | Desglose | Ejecución | Errores | Verificación | Comprimido | Estado |
|---|---:|---:|---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| java | modulo-0 | 9 | 1045 | no | no | sí | sí | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-1 | 6 | 750 | no | no | sí | sí | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-10 | 3 | 176 | no | no | sí | no | sí | sí | no | no | REESCRIBIR/AUDITAR formato |
| java | modulo-11 | 4 | 265 | no | no | sí | no | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-12 | 6 | 434 | no | no | sí | no | sí | sí | no | no | REESCRIBIR/AUDITAR formato |
| java | modulo-13 | 3 | 214 | no | no | sí | no | sí | sí | no | no | REESCRIBIR/AUDITAR formato |
| java | modulo-14 | 6 | 146 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| java | modulo-15 | 6 | 100 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| java | modulo-16 | 8 | 368 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| java | modulo-17 | 2 | 135 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| java | modulo-18 | 3 | 106 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| java | modulo-19 | 9 | 256 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| java | modulo-2 | 7 | 651 | no | no | sí | sí | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-20 | 13 | 365 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| java | modulo-21 | 5 | 116 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| java | modulo-22 | 3 | 108 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| java | modulo-3 | 4 | 342 | no | no | sí | no | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-4 | 4 | 336 | no | no | sí | sí | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-5 | 7 | 553 | no | no | sí | no | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-6 | 3 | 246 | no | no | sí | no | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-7 | 3 | 279 | no | no | sí | no | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-8 | 4 | 321 | no | no | sí | no | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| java | modulo-9 | 4 | 350 | no | no | sí | no | sí | sí | sí | no | REESCRIBIR/AUDITAR formato |
| spring-boot | modulo-0 | 6 | 346 | no | no | sí | no | sí | sí | no | sí | REESCRIBIR (comprimido) |
| spring-boot | modulo-1 | 3 | 193 | no | no | no | no | sí | no | no | sí | REESCRIBIR (comprimido) |
| spring-boot | modulo-10 | 7 | 158 | no | no | no | no | no | no | sí | sí | REESCRIBIR (comprimido) |
| spring-boot | modulo-11 | 7 | 133 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| spring-boot | modulo-12 | 2 | 253 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-13 | 4 | 1000 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-14 | 4 | 330 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-15 | 9 | 929 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-16 | 12 | 1163 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-17 | 7 | 671 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-18 | 3 | 434 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-19 | 4 | 415 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-2 | 8 | 228 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| spring-boot | modulo-20 | 9 | 820 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-3 | 3 | 157 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-4 | 5 | 113 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| spring-boot | modulo-5 | 5 | 176 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| spring-boot | modulo-6 | 5 | 126 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| spring-boot | modulo-7 | 8 | 190 | no | no | no | no | no | no | no | sí | REESCRIBIR (comprimido) |
| spring-boot | modulo-8 | 8 | 233 | sí | sí | no | no | no | no | no | no | REESCRIBIR |
| spring-boot | modulo-9 | 4 | 182 | sí | sí | no | no | no | no | no | no | REESCRIBIR |

## Prioridad de remediación
1. Spring Boot M2-M11: comprimidos por pases recientes, corregir primero.
2. Spring Boot M0-M1, M12-M20: auditar y reescribir a D+formal.
3. Java M14-M22: comprimidos, reescribir.
4. Java M0-M13: auditoría conceptual + ejecución; reescribir donde no cumpla cobertura por concepto.

## Regla
No marcar módulo como hecho sin verificación factible y evidencia por tema.
