import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { buildSubgraphSchema } from '@apollo/subgraph';
import gql from 'graphql-tag';
import { pathToFileURL } from 'node:url';
export async function startFederation(ports = [0, 0, 0]) {
  const servers = [];
  async function start(schema, resolvers, port) {
    const server = new ApolloServer({ schema: buildSubgraphSchema([{ typeDefs: gql(schema), resolvers }]) });
    servers.push(server);
    return startStandaloneServer(server, { listen: { host: '127.0.0.1', port } });
  }
  try {
    const conductores = await start(`
      type Query { conductor(id: ID!): Conductor }
      type Conductor @key(fields: "id") { id: ID!, nombre: String! }
    `, {
      Query: { conductor: (_, { id }) => id === 'c-9' ? { id, nombre: 'Ana' } : null },
      Conductor: { __resolveReference: ({ id }) => id === 'c-9' ? { id, nombre: 'Ana' } : null }
    }, ports[0]);
    const pedidos = await start(`
      type Query { pedido(id: ID!): Pedido }
      type Pedido { id: ID!, conductor: Conductor }
      extend type Conductor @key(fields: "id") { id: ID! @external, pedidosActivos: Int! }
    `, {
      Query: { pedido: (_, { id }) => id === 'p-1' ? { id, conductor: { __typename: 'Conductor', id: 'c-9' } } : null },
      Conductor: { pedidosActivos: ({ id }) => id === 'c-9' ? 1 : 0 }
    }, ports[1]);
    const gateway = new ApolloGateway({ supergraphSdl: new IntrospectAndCompose({ subgraphs: [
      { name: 'conductores', url: conductores.url }, { name: 'pedidos', url: pedidos.url }
    ] }) });
    const server = new ApolloServer({ gateway });
    servers.push(server);
    const { url } = await startStandaloneServer(server, { listen: { host: '127.0.0.1', port: ports[2] } });
    return { url, close: async () => { for (const item of servers.reverse()) await item.stop(); } };
  } catch (error) { for (const item of servers.reverse()) await item.stop(); throw error; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const lab = await startFederation([4001, 4002, 4000]);
  console.log(`Gateway local: ${lab.url}`);
  process.once('SIGINT', () => lab.close());
  process.once('SIGTERM', () => lab.close());
}
