// Módulo 16 · F106 · El ÚNICO archivo que abre un puerto. Los tests no lo importan nunca: importan crearApp de app.ts.
// En producción se compila con tsc y se ejecuta el JavaScript resultante (Módulo 23).
import { crearApp, repositorioEnMemoria } from './app';

const puerto = Number(process.env.PORT ?? 3106);
crearApp(repositorioEnMemoria([{ sku: 'TEC-001', nombre: 'Teclado', precio: 120000 }])).listen(puerto, () => {
  console.log(`API de productos en http://localhost:${puerto}`);
});
