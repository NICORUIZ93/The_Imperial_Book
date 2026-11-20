import { buscarCliente } from './pedidos.js';
const cliente = buscarCliente('c1');      // falta await
console.log('Cliente:', cliente);
console.log('Nombre:', cliente.nombre);
buscarCliente('zz');                      // rechazo que nadie captura
