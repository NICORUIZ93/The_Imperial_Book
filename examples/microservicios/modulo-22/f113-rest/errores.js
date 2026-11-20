// Los dos clientes traducen CUALQUIER fallo de la llamada a este error, con un tipo que el resto del
// servicio entiende sin saber si por debajo hay fetch o axios.
export class ErrorDeInventario extends Error {
  constructor(tipo, mensaje, opciones) {
    super(mensaje, opciones);
    this.name = 'ErrorDeInventario';
    this.tipo = tipo; // 'NO_ENCONTRADO' | 'TIEMPO_AGOTADO' | 'NO_DISPONIBLE'
  }
}
