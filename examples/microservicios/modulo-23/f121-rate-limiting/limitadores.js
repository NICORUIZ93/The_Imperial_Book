// Módulo 19 · F121 · Rate Limiting con Redis: dos algoritmos escritos a mano con scripts Lua (atómicos).
// Requisitos: Node.js 26.13.1 LTS, redis (node-redis) 6.3.1 y un servidor Redis (docker compose del laboratorio).
import { createClient } from 'redis';

/**
 * Cliente Redis pensado para un limitador: si Redis no está, los comandos FALLAN AL INSTANTE en vez de
 * quedarse en cola (disableOfflineQueue), y la conexión se reintenta sola cada 200 ms.
 */
export async function conectarRedis(url) {
  const cliente = createClient({
    url,
    disableOfflineQueue: true,
    socket: { connectTimeout: 500, reconnectStrategy: () => 200 },
  });
  cliente.on('error', () => {}); // sin este listener, un error de conexión tumbaría el proceso
  await cliente.connect();
  return cliente;
}

// VENTANA FIJA: un contador por cliente que caduca al terminar la ventana.
// INCR y EXPIRE van en el MISMO script: Redis lo ejecuta entero o no lo ejecuta (ver error-comun.js).
const VENTANA_FIJA = `
local actual = redis.call('INCR', KEYS[1])
if actual == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[2]) end
local ttl = redis.call('PTTL', KEYS[1])
return { actual, ttl }`;

export async function ventanaFija(redis, clave, { limite, ventanaMs }) {
  const [actual, ttl] = await redis.eval(VENTANA_FIJA, { keys: [`vf:${clave}`], arguments: [String(limite), String(ventanaMs)] });
  return { permitido: actual <= limite, restantes: Math.max(0, limite - actual), reintentarEnMs: actual <= limite ? 0 : ttl };
}

// CUBETA DE TOKENS: la cubeta tiene `capacidad` fichas y se rellena a `porSegundo`. Cada petición gasta una.
// Permite ráfagas (hasta `capacidad`) y un ritmo sostenido (`porSegundo`). Usa la hora de Redis, no la del cliente.
const CUBETA_DE_TOKENS = `
local capacidad = tonumber(ARGV[1])
local por_segundo = tonumber(ARGV[2])
local t = redis.call('TIME')
local ahora = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)
local datos = redis.call('HMGET', KEYS[1], 'fichas', 'marca')
local fichas = tonumber(datos[1]) or capacidad
local marca = tonumber(datos[2]) or ahora
fichas = math.min(capacidad, fichas + (ahora - marca) * por_segundo / 1000)
local permitido = 0
if fichas >= 1 then fichas = fichas - 1; permitido = 1 end
redis.call('HSET', KEYS[1], 'fichas', fichas, 'marca', ahora)
redis.call('PEXPIRE', KEYS[1], math.ceil(capacidad / por_segundo * 1000) + 1000)
local espera = 0
if permitido == 0 then espera = math.ceil((1 - fichas) / por_segundo * 1000) end
return { permitido, math.floor(fichas), espera }`;

export async function cubetaDeTokens(redis, clave, { capacidad, porSegundo }) {
  const [permitido, restantes, espera] = await redis.eval(CUBETA_DE_TOKENS, { keys: [`ct:${clave}`], arguments: [String(capacidad), String(porSegundo)] });
  return { permitido: permitido === 1, restantes, reintentarEnMs: espera };
}
