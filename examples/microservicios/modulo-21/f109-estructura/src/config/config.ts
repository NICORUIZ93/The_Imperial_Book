// config/: el ÚNICO lugar que lee process.env. El resto del código recibe un objeto ya validado.
export interface Config {
  readonly servicio: string;
  readonly puerto: number;
  readonly montoMaximo: number;
}

export function leerConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const puerto = Number(env.PORT ?? 3109);
  const montoMaximo = Number(env.MONTO_MAXIMO ?? 5_000_000);
  if (!Number.isInteger(puerto) || puerto < 0 || puerto > 65535) throw new Error(`PORT inválido: ${env.PORT}`);
  if (!Number.isFinite(montoMaximo) || montoMaximo <= 0) throw new Error(`MONTO_MAXIMO inválido: ${env.MONTO_MAXIMO}`);
  return Object.freeze({ servicio: 'pedidos', puerto, montoMaximo });
}
