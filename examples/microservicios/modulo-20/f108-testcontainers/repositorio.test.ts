// Verificación F108: npm run test:contenedores   (necesita Docker en marcha; la primera vez descarga postgres:18.7)
import { Pool } from 'pg';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { migrar, RepositorioDePedidos, type Pedido } from './repositorio-pedidos';

jest.setTimeout(180_000); // arrancar (y la primera vez descargar) la imagen tarda más que los 5 s por defecto

const pedido: Pedido = { id: 'p-1', cliente: 'ana', total: 120000, estado: 'CREADO', items: [{ sku: 'TEC-001', cantidad: 1 }] };

describe('RepositorioDePedidos contra PostgreSQL real', () => {
  let contenedor: StartedPostgreSqlContainer;
  let pool: Pool;
  let repositorio: RepositorioDePedidos;

  beforeAll(async () => {
    // UN contenedor para todo el archivo: versión fija (la misma de producción), puerto libre elegido por Docker.
    contenedor = await new PostgreSqlContainer(process.env.IMAGEN_POSTGRES ?? 'postgres:18.7').start();
    pool = new Pool({ connectionString: contenedor.getConnectionUri() });
    await migrar(pool);
    repositorio = new RepositorioDePedidos(pool);
  });

  afterAll(async () => {
    await pool?.end();
    await contenedor?.stop();
  });

  beforeEach(async () => {
    await pool.query('TRUNCATE pedidos'); // datos limpios en cada test: es mucho más barato que otro contenedor
  });

  test('el contenedor es un PostgreSQL de verdad, en un puerto que no es el 5432 del anfitrión', async () => {
    const { rows } = await pool.query('SHOW server_version');
    expect(rows[0].server_version).toMatch(/^\d+\.\d+/);
    expect(contenedor.getPort()).not.toBe(5432);
  });

  test('guardar y buscar conservan el jsonb', async () => {
    await repositorio.guardar(pedido);
    await expect(repositorio.buscar('p-1')).resolves.toEqual(pedido);
    await expect(repositorio.buscar('no-existe')).resolves.toBeNull();
  });

  test('guardar dos veces el mismo id actualiza en lugar de duplicar (ON CONFLICT)', async () => {
    await repositorio.guardar(pedido);
    await repositorio.guardar({ ...pedido, estado: 'PAGADO' });
    const { rows } = await pool.query('SELECT count(*)::int AS n FROM pedidos');
    expect(rows[0].n).toBe(1);
    expect((await repositorio.buscar('p-1'))?.estado).toBe('PAGADO');
  });

  test('conSku busca dentro del jsonb con @>', async () => {
    await repositorio.guardar(pedido);
    await repositorio.guardar({ ...pedido, id: 'p-2', items: [{ sku: 'MOU-001', cantidad: 2 }] });
    await repositorio.guardar({ ...pedido, id: 'p-3', items: [{ sku: 'MOU-001', cantidad: 1 }, { sku: 'TEC-001', cantidad: 1 }] });
    await expect(repositorio.conSku('TEC-001')).resolves.toEqual(['p-1', 'p-3']);
  });

  test('resumen agrega con FILTER', async () => {
    await repositorio.guardar({ ...pedido, estado: 'PAGADO' });
    await repositorio.guardar({ ...pedido, id: 'p-2', total: 50000 });
    await repositorio.guardar({ ...pedido, id: 'p-3', cliente: 'luis', estado: 'PAGADO' });
    await expect(repositorio.resumen('ana')).resolves.toEqual({ pagado: 120000, pendientes: 1 });
    await expect(repositorio.resumen('nadie')).resolves.toEqual({ pagado: 0, pendientes: 0 });
  });

  test('la restricción CHECK de la base rechaza un total de 0', async () => {
    await expect(repositorio.guardar({ ...pedido, total: 0 })).rejects.toMatchObject({ code: '23514' });
  });
});
