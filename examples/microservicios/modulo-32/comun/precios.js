// Módulo 28 · precios unitarios en USD, bajo demanda, sin impuestos ni descuentos. Consultados en las páginas oficiales
// el 2026-11-19 y el 2026-11-20 (ver «fuente»). Los precios cambian: vuelve a mirarlos antes de decidir con ellos.
export const HORAS_MES = 730; // convención de AWS y Google para «un mes» en sus calculadoras (24 × 365 / 12)

export const PRECIOS = {
  eksPlanoControlHora: { usd: 0.10, fuente: 'https://aws.amazon.com/eks/pricing/' },
  autopilotVcpuHora: { usd: 0.0445, fuente: 'https://cloud.google.com/kubernetes-engine/pricing (Autopilot, uso general, us-central1)' },
  autopilotGibHora: { usd: 0.0049225, fuente: 'https://cloud.google.com/kubernetes-engine/pricing (Autopilot, uso general, us-central1)' },
  fargateVcpuSegundo: { usd: 0.000011244, fuente: 'https://aws.amazon.com/fargate/pricing/ (Linux/x86, US East N. Virginia, ejemplo 1)' },
  fargateGbSegundo: { usd: 0.000001235, fuente: 'https://aws.amazon.com/fargate/pricing/ (Linux/x86, US East N. Virginia, ejemplo 1)' },
  lambdaMillonPeticiones: { usd: 0.20, fuente: 'https://aws.amazon.com/lambda/pricing/ (US East N. Virginia)' },
  lambdaGbSegundo: { usd: 0.0000166667, fuente: 'https://aws.amazon.com/lambda/pricing/ (x86, primer tramo)' },
  lambdaGratisPeticiones: { cantidad: 1_000_000, fuente: 'https://aws.amazon.com/lambda/pricing/ (capa gratuita mensual)' },
  lambdaGratisGbSegundo: { cantidad: 400_000, fuente: 'https://aws.amazon.com/lambda/pricing/ (capa gratuita mensual)' },
  natHora: { usd: 0.045, fuente: 'https://aws.amazon.com/vpc/pricing/ (ejemplo de NAT gateway, US East Ohio)' },
  natGb: { usd: 0.045, fuente: 'https://aws.amazon.com/vpc/pricing/ (ejemplo de NAT gateway, US East Ohio)' },
  entreZonasGb: { usd: 0.01, fuente: 'https://aws.amazon.com/vpc/pricing/ (VPC peering que cruza zonas de disponibilidad, por GB)' },
  logsIngestaGb: { usd: 0.50, fuente: 'https://aws.amazon.com/cloudwatch/pricing/ (Logs, clase Standard, ejemplos)' },
  logsAlmacenGbMes: { usd: 0.03, fuente: 'https://aws.amazon.com/cloudwatch/pricing/ (archivo de logs, ejemplos)' },
  metricaMes: { usd: 0.30, fuente: 'https://aws.amazon.com/cloudwatch/pricing/ (métricas personalizadas, primeras 10 000)' },
  millonTrazas: { usd: 5.00, fuente: 'https://aws.amazon.com/cloudwatch/pricing/ (X-Ray, trazas registradas, tras 100 000 gratis)' },
};

export const usd = (n, decimales = 2) => `${n.toLocaleString('en-US', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })} USD`;
export const p = (clave) => PRECIOS[clave].usd;
