// Módulo 17 · F110 · dotenv: configuración por variables de entorno, validada al arrancar.
// Requisitos: Node.js 26.13.1 LTS y dotenv 18.0.10 (package.json del laboratorio).
import dotenv from 'dotenv';
import { join } from 'node:path';

// Esquema mínimo: qué variables existen, de qué tipo son y cuáles son obligatorias.
const ESQUEMA = {
  PORT: { tipo: 'entero', porDefecto: 3110 },
  NODE_ENV: { tipo: 'texto', porDefecto: 'development', opciones: ['development', 'test', 'production'] },
  DATABASE_URL: { tipo: 'url', secreto: true }, // sin porDefecto = obligatoria
  PAGOS_URL: { tipo: 'url' },
  PAGOS_TIMEOUT_MS: { tipo: 'entero', porDefecto: 2000 },
  MENSAJE_BIENVENIDA: { tipo: 'texto', porDefecto: 'Hola' },
};

function convertir(nombre, valor, regla) {
  if (regla.tipo === 'entero') {
    if (!/^\d+$/.test(valor)) throw new Error(`${nombre} debe ser un entero y llegó "${valor}"`);
    return Number(valor);
  }
  if (regla.tipo === 'url') {
    if (!URL.canParse(valor)) throw new Error(`${nombre} debe ser una URL y llegó "${valor}"`);
    return valor;
  }
  if (regla.opciones && !regla.opciones.includes(valor)) {
    throw new Error(`${nombre} debe ser uno de ${regla.opciones.join(', ')} y llegó "${valor}"`);
  }
  return valor;
}

// Valida un objeto de entorno y devuelve la configuración tipada e inmutable. Reúne TODOS los errores
// para mostrarlos de una vez (fail-fast: mejor no arrancar que arrancar mal configurado).
export function validar(env) {
  const config = {};
  const errores = [];
  for (const [nombre, regla] of Object.entries(ESQUEMA)) {
    const valor = env[nombre];
    if (valor === undefined || valor === '') {
      if ('porDefecto' in regla) config[nombre] = regla.porDefecto;
      else errores.push(`${nombre} es obligatoria y no está definida`);
      continue;
    }
    try {
      config[nombre] = convertir(nombre, valor, regla);
    } catch (error) {
      errores.push(error.message);
    }
  }
  if (errores.length > 0) throw new Error(`Configuración inválida:\n  - ${errores.join('\n  - ')}`);
  return Object.freeze(config);
}

// Carga .env (si existe) dentro de `env` SIN pisar lo que ya esté definido, y valida.
export function cargarConfig({ carpeta = import.meta.dirname, env = process.env } = {}) {
  // override:false (por defecto) → una variable real del entorno le gana al archivo .env.
  // quiet:true → dotenv no imprime su línea «injected env (N) from .env».
  const resultado = dotenv.config({ path: join(carpeta, '.env'), processEnv: env, quiet: true });
  const origen = resultado.error ? 'solo entorno (no hay .env)' : '.env + entorno';
  return { config: validar(env), origen };
}

// Para los logs: nunca imprimas un secreto.
export function sinSecretos(config) {
  return Object.fromEntries(
    Object.entries(config).map(([k, v]) => [k, ESQUEMA[k]?.secreto ? '***' : v]),
  );
}
