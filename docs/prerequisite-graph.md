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
| foundations | 97 |
| javascript | 88 |
| java | 80 |
| node | 77 |
| spring-boot | 84 |
| angular | 71 |
| react | 58 |
| kotlin-multiplatform | 56 |
| android | 57 |
| ios | 56 |
| flutter | 63 |
| devops | 104 |
| cloud | 156 |
| rutaflow | 26 |

**Total:** 1073 temas.
