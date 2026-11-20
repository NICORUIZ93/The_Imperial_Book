// Módulo 0.4 · Variables de entorno: la configuración llega DESDE FUERA del código.
// Requisitos: Node.js 26.13.1 LTS (--env-file existe desde Node 20.6). Sin dependencias.
// Ejecuta (desde la carpeta env/):
//   node config.js                              -> usa los valores por defecto
//   PUERTO=9000 MODO=produccion node config.js   -> los define solo para este comando
//   node --env-file=.env.example config.js      -> los lee de un archivo

export function leerConfig(env) {
  const puerto = Number(env.PUERTO ?? 8080); // ?? = "si no existe, usa esto"
  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error(`PUERTO inválido: "${env.PUERTO}"`); // fallar al arrancar, no a medianoche
  }
  const modo = env.MODO ?? 'desarrollo';
  if (!['desarrollo', 'produccion'].includes(modo)) {
    throw new Error(`MODO inválido: "${modo}" (usa desarrollo o produccion)`);
  }
  // Un secreto nunca tiene valor por defecto y nunca se imprime completo.
  const claveApi = env.CLAVE_API;
  if (modo === 'produccion' && !claveApi) {
    throw new Error('En produccion CLAVE_API es obligatoria');
  }
  return { puerto, modo, claveApi };
}

if (import.meta.main) {
  try {
    const c = leerConfig(process.env);
    console.log(`puerto=${c.puerto} modo=${c.modo} claveApi=${c.claveApi ? c.claveApi.slice(0, 3) + '***' : '(sin definir)'}`);
  } catch (e) {
    console.error(`Configuración inválida: ${e.message}`);
    process.exit(1);
  }
}
