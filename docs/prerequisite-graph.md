# Grafo de prerrequisitos

Este inventario representa el orden mínimo verificable. La secuencia automática no sustituye la revisión conceptual tema por tema.

## Dependencias entre libros

```mermaid
flowchart LR
  javascript["javascript"] --> node["node"]
  java["java"] --> spring_boot["spring-boot"]
  javascript["javascript"] --> angular["angular"]
  javascript["javascript"] --> react["react"]
  java["java"] --> android["android"]
  java["java"] --> kotlin_multiplatform["kotlin-multiplatform"]
  foundations["foundations"] --> devops["devops"]
  devops["devops"] --> cloud["cloud"]
  cloud["cloud"] --> rutaflow["rutaflow"]
```

## Cobertura

| Track | Temas ordenados |
|---|---:|
| foundations | 96 |
| javascript | 87 |
| java | 79 |
| node | 79 |
| spring-boot | 83 |
| angular | 70 |
| react | 57 |
| kotlin-multiplatform | 55 |
| android | 56 |
| ios | 55 |
| flutter | 62 |
| devops | 103 |
| cloud | 155 |
| rutaflow | 25 |

**Total:** 1062 temas.
