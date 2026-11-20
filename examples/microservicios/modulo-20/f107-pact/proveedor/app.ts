// Módulo 16 · F107 · Contract Testing con Pact: el PROVEEDOR. La API real del servicio «inventario».
import express, { type Express } from 'express';

export const stock = new Map<string, number>(); // en un servicio real sería su base de datos

// `campo` existe solo para el laboratorio: permite simular que alguien renombra «disponible» y rompe a los consumidores.
export function crearApp(campo = 'disponible'): Express {
  const app = express();
  app.get('/stock/:sku', (req, res) => {
    const unidades = stock.get(req.params.sku);
    if (unidades === undefined) return res.status(404).json({ error: 'SKU desconocido' });
    // El proveedor puede devolver MÁS campos de los que usa el consumidor (bodega): el contrato no se rompe por eso.
    res.json({ sku: req.params.sku, [campo]: unidades, bodega: 'BOG-1' });
  });
  return app;
}
