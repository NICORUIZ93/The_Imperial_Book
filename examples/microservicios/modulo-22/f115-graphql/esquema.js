// Módulo 18 · F115 · GraphQL con Apollo Server: esquema (el contrato) y resolvers (cómo se obtiene cada campo).
// Requisitos: Node.js 26.13.1 LTS, @apollo/server 5.5.2, graphql 16.15.0 y dataloader 2.2.3.
import { ApolloServer } from '@apollo/server';
import DataLoader from 'dataloader';
import { GraphQLError } from 'graphql';

// SDL: el contrato tipado. «!» significa «nunca es null».
export const typeDefs = `#graphql
  type Cliente {
    id: ID!
    nombre: String!
    email: String!
  }

  type Pedido {
    id: ID!
    total: Int!
    cliente: Cliente!
  }

  type Query {
    pedidos: [Pedido!]!
    pedido(id: ID!): Pedido
  }

  type Mutation {
    crearPedido(clienteId: ID!, total: Int!): Pedido!
  }
`;

export const resolvers = {
  Query: {
    // (padre, argumentos, contexto). El contexto se crea por petición y trae los servicios.
    pedidos: (_padre, _args, { servicios }) => servicios.pedidos.listar(),
    pedido: (_padre, { id }, { servicios }) => servicios.pedidos.buscar(id),
  },
  Mutation: {
    crearPedido: async (_padre, { clienteId, total }, { servicios, cargadores }) => {
      if (total <= 0) {
        throw new GraphQLError('El total debe ser mayor que cero', { extensions: { code: 'BAD_USER_INPUT', campo: 'total' } });
      }
      if (!(await cargadores.cliente.load(clienteId))) {
        throw new GraphQLError(`No existe el cliente ${clienteId}`, { extensions: { code: 'NOT_FOUND' } });
      }
      return servicios.pedidos.crear(clienteId, total);
    },
  },
  Pedido: {
    // Resolver de CAMPO: solo se ejecuta si la consulta pide «cliente». Con el cargador (DataLoader), todas las
    // peticiones de cliente de un mismo «tick» se juntan en UNA llamada al servicio de clientes.
    cliente: (pedido, _args, { cargadores }) => cargadores.cliente.load(pedido.clienteId),
  },
};

// Versión ingenua del mismo resolver: una llamada al servicio de clientes POR CADA pedido (problema N+1).
export const resolversIngenuos = {
  ...resolvers,
  Pedido: { cliente: (pedido, _args, { servicios }) => servicios.clientes.buscar(pedido.clienteId) },
};

// El contexto se construye EN CADA PETICIÓN: los DataLoader guardan caché y no deben compartirse entre usuarios.
export function crearContexto(servicios) {
  return {
    servicios,
    cargadores: { cliente: new DataLoader((ids) => servicios.clientes.buscarVarios(ids)) },
  };
}

export function crearServidor({ ingenuo = false } = {}) {
  return new ApolloServer({
    typeDefs,
    resolvers: ingenuo ? resolversIngenuos : resolvers,
    // Por defecto Apollo añade la pila (stacktrace) a cada error salvo con NODE_ENV=production.
    // Aquí se apaga siempre: una pila le cuenta al cliente rutas y librerías internas.
    includeStacktraceInErrorResponses: false,
  });
}
