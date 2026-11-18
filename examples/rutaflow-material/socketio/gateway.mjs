import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

// Laboratorio de un solo envío: no es un sistema de identidad de producción.
export async function startGateway({ port = 0, token = 'solo-laboratorio' } = {}) {
  const app = express();
  app.use(express.json({ limit: '8kb' }));
  const http = createServer(app);
  const io = new Server(http, { transports: ['websocket'] });
  let lastSequence = 0;
  io.use((socket, next) => next(socket.handshake.auth.token === token
    ? undefined : new Error('No autorizado')));
  io.on('connection', socket => {
    socket.on('seguir-envio', async (id, ack) => {
      if (id !== 'ENV-42') return ack({ ok: false });
      await socket.join(id);
      ack({ ok: true });
    });
  });
  app.post('/posiciones/ENV-42', (req, res) => {
    if (req.headers.authorization !== `Bearer ${token}`) return res.sendStatus(401);
    const { sequence, latitude, longitude } = req.body ?? {};
    if (!Number.isSafeInteger(sequence) || sequence < 1 ||
        !Number.isFinite(latitude) || Math.abs(latitude) > 90 ||
        !Number.isFinite(longitude) || Math.abs(longitude) > 180) return res.sendStatus(400);
    if (sequence <= lastSequence) return res.sendStatus(409);
    lastSequence = sequence;
    io.to('ENV-42').emit('posicion', { shipmentId: 'ENV-42', schemaVersion: 1,
      sequence, latitude, longitude });
    res.sendStatus(202);
  });
  await new Promise(resolve => http.listen(port, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${http.address().port}`,
    close: () => new Promise(resolve => io.close(resolve)) };
}
