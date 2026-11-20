// Módulo 15 · F102 · PostgreSQL con Prisma 7.10.1 (ORM con esquema declarativo y cliente generado con tipos).
// Requisitos: Node.js 26.13.1 LTS, prisma y @prisma/client 7.10.1, @prisma/adapter-pg 7.10.1, pg 8.23.1, tsx 4.23.15.
// Antes de ejecutar:  npm run generate   (crea ./generated a partir de prisma/schema.prisma)
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client.ts';
import { pgUrl } from '../config.js';

export function conectar(): PrismaClient {
  // Prisma 7 habla con PostgreSQL a través del driver pg: el adaptador crea un pg.Pool con estas opciones.
  const adapter = new PrismaPg({ connectionString: pgUrl('f102'), max: 5 });
  return new PrismaClient({ adapter });
}

// Transacción interactiva: `tx` es un cliente atado a UNA conexión con BEGIN abierto.
export function crearClienteConPedidos(prisma: PrismaClient, datos: { nombre: string; email: string }, totales: number[]): Promise<number> {
  return prisma.$transaction(async (tx) => {
    const cliente = await tx.cliente.create({ data: datos });
    for (const total of totales) {
      await tx.pedido.create({ data: { total, clienteId: cliente.id } });
    }
    return cliente.id;
  }); // si el callback lanza → ROLLBACK; si termina → COMMIT
}

// select anidado: Prisma trae el cliente y sus pedidos y devuelve EXACTAMENTE la forma pedida (con tipos).
export function pedidosDe(prisma: PrismaClient, email: string) {
  return prisma.cliente.findUnique({
    where: { email },
    select: { nombre: true, pedidos: { select: { total: true, estado: true }, orderBy: { id: 'asc' } } },
  });
}

export async function totalVendido(prisma: PrismaClient): Promise<number> {
  const resultado = await prisma.pedido.aggregate({ _sum: { total: true } });
  return resultado._sum.total ?? 0;
}
