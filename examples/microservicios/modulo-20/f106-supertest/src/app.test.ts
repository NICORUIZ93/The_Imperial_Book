// Verificación F106: npx jest f106-supertest --selectProjects unit
import request from 'supertest';
import { crearApp, repositorioEnMemoria, type Repositorio } from './app';

const teclado = { sku: 'TEC-001', nombre: 'Teclado', precio: 120000 };

describe('API de productos', () => {
  let app: ReturnType<typeof crearApp>;

  beforeEach(() => {
    // App y datos NUEVOS en cada test: el orden de los tests no importa.
    app = crearApp(repositorioEnMemoria([teclado]));
  });

  test('GET /productos/:sku → 200 con el JSON del producto', async () => {
    // request(app) levanta la app en un puerto efímero, hace la petición y lo cierra.
    const respuesta = await request(app).get('/productos/TEC-001');
    expect(respuesta.status).toBe(200);
    expect(respuesta.headers['content-type']).toMatch(/application\/json/);
    expect(respuesta.body).toEqual(teclado);
  });

  test('GET de un sku que no existe → 404 con mensaje', async () => {
    // Estilo encadenado: .expect() de Supertest comprueba estado, cabeceras y cuerpo.
    await request(app).get('/productos/XXX-999').expect(404).expect('Content-Type', /json/).expect({ error: 'No existe el producto XXX-999' });
  });

  test('POST válido → 201, cabecera Location y el producto queda consultable', async () => {
    const mouse = { sku: 'MOU-001', nombre: 'Mouse', precio: 50000 };
    const creado = await request(app).post('/productos').set('x-api-key', 'clave-de-prueba').send(mouse);
    expect(creado.status).toBe(201);
    expect(creado.headers.location).toBe('/productos/MOU-001');
    await request(app).get(creado.headers.location).expect(200, mouse);
  });

  test('POST sin x-api-key → 401', async () => {
    await request(app).post('/productos').send(teclado).expect(401);
  });

  test('POST inválido → 400 con un mensaje por campo', async () => {
    const respuesta = await request(app).post('/productos').set('x-api-key', 'clave-de-prueba').send({ sku: 'x', nombre: 'TV', precio: -1 });
    expect(respuesta.status).toBe(400);
    expect(respuesta.body.errores).toEqual([
      'sku debe tener la forma ABC-123',
      'nombre debe tener al menos 3 letras',
      'precio debe ser un número mayor que 0',
    ]);
  });

  test('POST de un sku repetido → 409', async () => {
    await request(app).post('/productos').set('x-api-key', 'clave-de-prueba').send(teclado).expect(409);
  });

  test('JSON mal formado → 400 (no 500)', async () => {
    const respuesta = await request(app).post('/productos').set('x-api-key', 'clave-de-prueba').set('Content-Type', 'application/json').send('{"sku": ');
    expect(respuesta.status).toBe(400);
    expect(respuesta.body).toEqual({ error: 'JSON mal formado' });
  });

  test('si el repositorio falla → 500 sin filtrar el mensaje interno (doble que lanza)', async () => {
    const roto: Repositorio = { buscar: jest.fn().mockRejectedValue(new Error('base caída')), guardar: jest.fn() };
    await request(crearApp(roto)).get('/productos/TEC-001').expect(500, { error: 'Error interno' });
  });
});
