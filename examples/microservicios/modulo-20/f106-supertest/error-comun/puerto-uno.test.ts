// ERROR COMÚN F106 · Ejecuta: npx jest puerto- --selectProjects errores --forceExit
import request from 'supertest';
import { app } from './app-que-escucha';

test('salud (uno)', async () => {
  await request(app).get('/salud').expect(200, { ok: true });
});
