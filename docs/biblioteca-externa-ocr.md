# OCR de los libros escaneados de la biblioteca externa

**Fecha:** 2026-10-28
**Método:** se renderizaron las primeras 28 páginas de cada PDF sin capa de texto y se aplicó OCR (Tesseract 5, modelo de español). De ese texto se extrajo el índice de cada libro y se cruzó con los temas de los tracks. Tres libros sí tenían texto pero un índice vacío o solo numérico; en esos se leyó el texto de las primeras páginas. Las copias de trabajo quedaron en `tmp/claude/ocr/`, que Git ignora.

## Resultado por libro

| Libro | Track | Hallazgo | Implementado en |
|---|---|---|---|
| *Código limpio* (Robert C. Martin) | foundations | Nombres, funciones, comentarios, errores, objetos frente a estructuras (Demeter), pruebas F.I.R.S.T. y concurrencia no tenían tratamiento propio | **Módulo 15 «Código limpio»** (4 temas) y **M8 T5** (filósofos y lectores-escritores) |
| *Sistemas operativos distribuidos* (Tanenbaum) | foundations | Relojes lógicos, elección de líder, commit en dos fases | **M10 T5** |
| *Oracle 12c PL/SQL* | foundations | Procedimientos, funciones, cursores, excepciones y paquetes | **M4 T6** (PL/pgSQL, verificado en PostgreSQL 16) |
| *Excel y SQL de la mano* | foundations | Llevar consultas SQL a Excel | **M4 T7** |
| *El libro blanco del hacker*, *Kali Linux* | foundations, devops | Ingeniería social y reconocimiento | **Foundations M6 T5** (phishing) y **DevOps M11 T7** (escaneo de puertos del propio laboratorio) |
| *TypeScript, curso práctico* | javascript | Tipos avanzados y decoradores | **M11 T5 y T6** (verificados con TypeScript 5.9) |
| *Docker, guía práctica* y *Docker, tutorial básico* | devops | Inspección, estadísticas, eventos y respaldo de volúmenes | **M2 T7** ⚠️ *no ejecutado: no había motor de Docker en el entorno de verificación* |
| *Microservicios, arquitectura* | spring-boot | Descubrimiento, balanceo, tolerancia a fallos, OAuth, sagas y pruebas | Ya cubierto (Spring Boot M10, M13 y M15): sin huecos nuevos |
| *Hacking de dispositivos iOS* | ios / seguridad | Identificación de dispositivos, ataques locales, jailbreak | Sin implementar: es contenido ofensivo específico de 2013; encaja en un futuro track de Seguridad |
| *Hacking ético con herramientas Python* (archivo `Python_Conceptos_Fundamentales`) | — | Python aplicado a seguridad | Sin track: candidato al track de Python o de Seguridad |
| *Ruby on Rails* | — | Framework web en Ruby | Sin track en la academia |
| *Machine Learning*, *Deep Learning*, *IA: introducción*, *IA: aplicaciones prácticas*, *IA general 2*, *IA intermedio*, *IA avanzado* | — | Tipos de aprendizaje, datasets, métricas, redes neuronales, clustering | Sin track: candidatos a un track de IA (hoy hay 0 temas de regresión, redes neuronales o métricas de clasificación) |

## Pendiente
Los libros de Python, IA y Seguridad requieren **tracks nuevos**. Eso cambia la estructura de la app (las pruebas y validadores esperan 14 tracks), así que queda como decisión aparte.
