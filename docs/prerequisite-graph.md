# Grafo de prerrequisitos

Este inventario representa el orden mínimo verificable. La secuencia automática no sustituye la revisión conceptual tema por tema.

## Dependencias entre libros

```mermaid
flowchart LR
  javascript["javascript"] --> node["node"]
  java["java"] --> spring_boot["spring-boot"]
  spring_boot["spring-boot"] --> microservices["microservices"]
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
| foundations | 102 |
| javascript | 92 |
| java | 117 |
| node | 90 |
| spring-boot | 121 |
| microservices | 24 |
| angular | 78 |
| react | 64 |
| kotlin-multiplatform | 66 |
| android | 83 |
| ios | 69 |
| flutter | 119 |
| devops | 138 |
| cloud | 168 |
| rutaflow | 29 |

**Total:** 1360 temas.
