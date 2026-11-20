// Módulo 32 · precios unitarios en USD (bajo demanda, sin impuestos), los mismos que el Módulo 28
// (examples/microservicios/modulo-32/comun/precios.js), consultados en las páginas oficiales el 2026-11-19 y 2026-11-20.
// Los precios cambian: vuelve a mirarlos antes de presentar el costo al Comité.
export const HORAS_MES = 730;
export const PRECIOS = {
  fargateVcpuSegundo: { usd: 0.000011244, fuente: 'https://aws.amazon.com/fargate/pricing/ (Linux/x86, US East N. Virginia, ejemplo 1)' },
  fargateGbSegundo: { usd: 0.000001235, fuente: 'https://aws.amazon.com/fargate/pricing/ (Linux/x86, US East N. Virginia, ejemplo 1)' },
  natHora: { usd: 0.045, fuente: 'https://aws.amazon.com/vpc/pricing/ (ejemplo de NAT gateway, US East Ohio)' },
  natGb: { usd: 0.045, fuente: 'https://aws.amazon.com/vpc/pricing/ (ejemplo de NAT gateway, US East Ohio)' },
  logsIngestaGb: { usd: 0.50, fuente: 'https://aws.amazon.com/cloudwatch/pricing/ (Logs, clase Standard, ejemplos)' },
};
export const p = (k) => PRECIOS[k].usd;
