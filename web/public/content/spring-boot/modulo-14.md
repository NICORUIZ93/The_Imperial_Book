# Módulo 14: Spring GraphQL: contrato, datos anidados y cambios

Cubre esquema GraphQL, queries/mutations, DataLoader, paginación y seguridad.

**Entorno (2026-05-22):** JDK 27. Spring GraphQL requiere dependencia y contexto Boot.

## Aprende construyendo

### Tema 1: Esquema, queries y mutations · Intermedio · 45 min
#### Esquema GraphQL
**Definición formal.** Contrato tipado que define types, queries, mutations y subscriptions.
**Para qué sirve.** Cliente pide exactamente los campos que necesita.
**Cuándo usarlo.** APIs con clientes diversos y necesidades flexibles de lectura.
**Ejemplo mínimo enfocado (schema).**
```graphql
type Query { envio(id: ID!): Envio }
type Envio { id: ID!, codigo: String! }
```
**Caso de uso real.** Frontend móvil pide menos campos.
**Error común.** Exponer esquema sin control de autorización por campo. Corrección: seguridad por campo/recurso.
**Verificación.** **Nota:** requiere Spring GraphQL.

#### Mutation
**Definición formal.** Operación GraphQL para cambios de estado.
**Para qué sirve.** Escrituras bajo contrato tipado.
**Cuándo usarlo.** Crear/actualizar datos.
**Ejemplo mínimo enfocado.** `mutation { crearEnvio(codigo:"A1"){id} }`.
**Caso de uso real.** Crear pedido.
**Error común.** Mutations sin validación/autorización. Corrección: validar input y autorizar.
**Verificación.** **Nota:** requiere app.

### Tema 2: DataLoader, N+1 y paginación · Avanzado · 45 min
#### DataLoader
**Definición formal.** Mecanismo de batching/caching por request para resolver datos anidados eficientemente.
**Para qué sirve.** Evitar N+1 en resolvers GraphQL.
**Cuándo usarlo.** Campos anidados con consultas por id.
**Ejemplo mínimo enfocado (conceptual).** `@BatchMapping`/DataLoader por `envioId`.
**Caso de uso real.** Lista de envíos con cliente.
**Error común.** Resolver N+1 en cada field resolver. Corrección: batch mapping.
**Verificación.** **Nota:** requiere Spring GraphQL.

### Tema 3: Seguridad, errores y testing · Avanzado · 45 min
#### Errores GraphQL
**Definición formal.** Respuestas con `data` parcial y/o `errors` estructurados según spec GraphQL.
**Para qué sirve.** Informar fallos sin romper todo el contrato.
**Cuándo usarlo.** Errores de campo/validación/autorización.
**Ejemplo mínimo enfocado.** clasificar errores y no filtrar internos.
**Caso de uso real.** Campo no autorizado.
**Error común.** Exponer exception interna. Corrección: error mapping.
**Verificación.** **Nota:** requiere app.

## Cierre
GraphQL da flexibilidad de lectura, pero exige disciplina en N+1, autorización por campo y diseño de esquema.
