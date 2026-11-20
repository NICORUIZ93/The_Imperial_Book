// Módulo 27 · F163 · ANTES (vulnerable). NO copies este archivo: existe para atacarlo con ataque.js.
// Una sola credencial de base de datos, estática, compartida por todos los servicios y sin caducidad.
// Aunque viniera de un gestor de secretos (Módulo 9, KV v2), si se filtra sirve hasta que alguien la cambie a mano,
// y nadie sabe qué servicio la filtró porque todos usan la misma.
export const CONFIG_ANTES = { usuario: 'tienda', clave: 'Tienda-2019!' }; // ✘ estática, compartida, sin caducidad

export const SQL_ANTES = `CREATE ROLE "${CONFIG_ANTES.usuario}" WITH LOGIN PASSWORD '${CONFIG_ANTES.clave}'`;

export async function conectarAntes(bd, servicio, ahora) {
  const ok = await bd.login(CONFIG_ANTES.usuario, CONFIG_ANTES.clave, ahora);
  return { servicio, usuario: CONFIG_ANTES.usuario, ok };
}
