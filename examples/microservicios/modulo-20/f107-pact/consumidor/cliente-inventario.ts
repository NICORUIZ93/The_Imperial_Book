// Módulo 16 · F107 · Contract Testing con Pact: el CONSUMIDOR. El servicio «pedidos» usa este cliente para hablar con «inventario».
// Requisitos: Node.js 26.13.1 LTS (fetch nativo), @pact-foundation/pact 17.1.4, jest 30.5.2, ts-jest 29.4.15.
export interface Stock {
  sku: string;
  disponible: number;
}

export class ClienteInventario {
  constructor(private readonly baseUrl: string) {}

  // Devuelve el stock, o null si inventario no conoce el producto.
  async obtenerStock(sku: string): Promise<Stock | null> {
    const respuesta = await fetch(`${this.baseUrl}/stock/${sku}`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(2000),
    });
    if (respuesta.status === 404) return null;
    if (!respuesta.ok) throw new Error(`inventario respondió ${respuesta.status}`);
    const cuerpo = (await respuesta.json()) as Stock;
    return { sku: cuerpo.sku, disponible: cuerpo.disponible }; // SOLO usamos estos dos campos: eso es lo que irá al contrato
  }

  async hayStock(sku: string, cantidad: number): Promise<boolean> {
    const stock = await this.obtenerStock(sku);
    return stock !== null && stock.disponible >= cantidad;
  }
}
