// Módulo 0.1 · Qué es un servidor
// Un servidor es un programa que NO termina: se queda esperando pedidos
// en un "puerto" (como una ventanilla numerada) y responde a cada uno.
// Requisitos: Node.js 26.13.1 LTS (funciona desde Node 22). Usa solo el módulo 'node:http'.
// Ejecuta: node servidor/servidor.js   y en otra terminal: curl http://localhost:3000/

import http from 'node:http';

let pedidosAtendidos = 0;

// crearServidor() devuelve el servidor sin encenderlo; así el test puede encenderlo en un puerto libre.
export function crearServidor() {
  return http.createServer((pedido, respuesta) => {
    pedidosAtendidos++;
    // Cada vez que llega un pedido, el servidor anota quién pidió qué...
    console.log(`Pedido #${pedidosAtendidos}: ${pedido.method} ${pedido.url}`);
    // ...y responde con un código de estado (200 = todo bien) y un texto.
    respuesta.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    respuesta.end(`Hola, soy un servidor. Te he atendido ${pedidosAtendidos} vez/veces.\n`);
  });
}

if (import.meta.main) {
  const puerto = Number(process.env.PORT ?? 3000);
  crearServidor().listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto} (Ctrl+C para apagarlo)`);
  });
}
