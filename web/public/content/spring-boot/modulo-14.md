# Módulo 14: Spring GraphQL

GraphQL permite a clientes pedir exactamente los campos que necesitan. Spring GraphQL integra esquema, resolvers, DataLoader y seguridad. El riesgo es mover complejidad al cliente o crear N+1 en resolvers.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Spring Boot 3.5.0, Spring for GraphQL.

## Aprende construyendo

### Tema 1: Esquema, queries y mutations · Intermedio · 45 min

Caso guía: consultar guía por id y crear guía.

#### Schema-first

**Definición formal.** El esquema GraphQL define tipos, queries, mutations y contratos. Los resolvers implementan cómo obtener datos.

```graphql
type Query { guia(id: ID!): Guia }
type Guia { id: ID!, codigo: String! }
```

**Error común.** Exponer modelo interno directamente sin pensar autorización/costo. Corrección: esquema diseñado como contrato.

### Tema 2: DataLoader, N+1 y paginación · Avanzado · 45 min

Caso guía: lista de guías pide cliente; resolver por item causa N+1.

#### DataLoader

**Definición formal.** Mecanismo de batching/caching por request para resolver múltiples claves en una sola carga.

**Error común.** Resolver relaciones por item con llamada a DB. Corrección: DataLoader/batch mapping.

### Tema 3: Seguridad, errores y testing · Avanzado · 45 min

Caso guía: campo sensible solo para rol admin.

#### Seguridad en GraphQL

**Definición formal.** Autorización puede aplicarse a queries/métodos/campos; hay que evitar sobreexposición por introspección en entornos sensibles y controlar profundidad/costo.

**Error común.** Asegurar solo endpoint `/graphql`. Corrección: autorización por resolver/campo y límites de query.

**Nota de verificación.** Requiere app Spring GraphQL; lab ejecutable.

## Cierre

GraphQL es un contrato flexible para el cliente, pero requiere disciplina en batching, autorización y costo de query.

## Checklist

- Diseño esquema como contrato.
- Uso DataLoader para N+1.
- Autorizo por campo/método.
- Limito profundidad/costo.
