// Módulo 32 · F183 · Rate limiting con «cubo de fichas» (token bucket): cada cliente tiene un cubo de `capacidad` fichas
// que se rellena a `tasa` fichas por segundo; cada petición gasta una. Permite ráfagas cortas y limita la media.
// Dos implementaciones con la misma interfaz:
//   LimitadorMemoria: un Map en el proceso. Solo vale con UNA réplica del gateway (ver error-comun.js).
//   LimitadorRedis:   el cubo vive en Redis y se actualiza con un script Lua atómico: todas las réplicas comparten límite.
// Versiones: Node.js 26.13.1 LTS, ioredis 6.0.0, Redis Open Source 8.10.2 (el script usa TIME: reloj del servidor Redis).

export class LimitadorMemoria {
  #cubos = new Map();
  constructor({ tasa, capacidad, reloj = Date.now }) { Object.assign(this, { tasa, capacidad, reloj }); }
  async permitir(clave) {
    const ahora = this.reloj();
    const c = this.#cubos.get(clave) ?? { fichas: this.capacidad, ultimo: ahora };
    c.fichas = Math.min(this.capacidad, c.fichas + ((ahora - c.ultimo) / 1000) * this.tasa);
    c.ultimo = ahora;
    const permitido = c.fichas >= 1;
    if (permitido) c.fichas -= 1;
    this.#cubos.set(clave, c);
    return { permitido, restantes: Math.floor(c.fichas), reintentarEnMs: permitido ? 0 : Math.ceil(((1 - c.fichas) / this.tasa) * 1000) };
  }
}

// KEYS[1] = cubo del cliente · ARGV = tasa, capacidad. Devuelve {permitido, fichas restantes (texto: Lua->Redis trunca decimales)}.
export const LUA_CUBO = `
local t = redis.call('TIME')
local ahora = tonumber(t[1]) * 1000 + math.floor(tonumber(t[2]) / 1000)
local tasa, capacidad = tonumber(ARGV[1]), tonumber(ARGV[2])
local d = redis.call('HMGET', KEYS[1], 'fichas', 'ultimo')
local fichas = tonumber(d[1]) or capacidad
local ultimo = tonumber(d[2]) or ahora
fichas = math.min(capacidad, fichas + (ahora - ultimo) / 1000 * tasa)
local permitido = 0
if fichas >= 1 then fichas = fichas - 1; permitido = 1 end
redis.call('HSET', KEYS[1], 'fichas', tostring(fichas), 'ultimo', tostring(ahora))
redis.call('PEXPIRE', KEYS[1], math.ceil(capacidad / tasa * 1000) + 1000)
return {permitido, tostring(fichas)}`;

export class LimitadorRedis {
  constructor({ redis, tasa, capacidad, prefijo = 'cubo:' }) {
    Object.assign(this, { redis, tasa, capacidad, prefijo });
    redis.defineCommand('cuboDeFichas', { numberOfKeys: 1, lua: LUA_CUBO });
  }
  async permitir(clave) {
    const [permitido, fichas] = await this.redis.cuboDeFichas(this.prefijo + clave, this.tasa, this.capacidad);
    const f = Number(fichas);
    return { permitido: permitido === 1, restantes: Math.floor(f), reintentarEnMs: permitido === 1 ? 0 : Math.ceil(((1 - f) / this.tasa) * 1000) };
  }
}
