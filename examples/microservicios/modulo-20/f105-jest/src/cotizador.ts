// Módulo 16 · F105 · Código CON dependencias: un servicio de tasas de cambio (red), el reloj y un notificador.
import { calcularTotal, type Item } from './carrito';
import { enviarCorreo } from './notificador';

// La dependencia se recibe por el constructor (inyección): en producción será un cliente HTTP; en el test, un doble.
export interface ClienteDeTasas {
  obtener(moneda: string): Promise<number>; // cuántos COP vale 1 unidad de `moneda`
}

const VIGENCIA_MS = 60_000;

export class Cotizador {
  private cache = new Map<string, { tasa: number; hasta: number }>();

  constructor(private readonly tasas: ClienteDeTasas) {}

  // Convierte el total del carrito a otra moneda. Guarda cada tasa 60 s para no llamar al servicio en cada petición.
  async cotizar(items: Item[], moneda: string): Promise<number> {
    const total = calcularTotal(items);
    const tasa = await this.tasaVigente(moneda);
    return Math.round((total / tasa) * 100) / 100;
  }

  async cotizarYAvisar(items: Item[], moneda: string, correo: string): Promise<number> {
    const valor = await this.cotizar(items, moneda);
    await enviarCorreo(correo, `Tu cotización: ${valor} ${moneda}`);
    return valor;
  }

  private async tasaVigente(moneda: string): Promise<number> {
    const guardada = this.cache.get(moneda);
    if (guardada && guardada.hasta > Date.now()) return guardada.tasa;
    const tasa = await this.tasas.obtener(moneda);
    if (tasa <= 0) throw new Error(`Tasa inválida para ${moneda}`);
    this.cache.set(moneda, { tasa, hasta: Date.now() + VIGENCIA_MS });
    return tasa;
  }
}
