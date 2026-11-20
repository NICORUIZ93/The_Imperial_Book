// Módulo 20 · F124 · ERROR COMÚN: creer que el payload de un JWT está cifrado. Está FIRMADO, no cifrado:
// cualquiera que tenga el token lee su contenido con un decodificador base64.
// Ejecuta: node f124-jwt/error-comun.js
import jwt from 'jsonwebtoken';
import { generarClaves } from './tokens.js';

const { privateKey } = generarClaves();
console.log('== MAL: datos sensibles dentro del token');
const token = jwt.sign({ sub: 'u1', email: 'ana@correo.co', tarjeta: '4111 1111 1111 1111' }, privateKey, { algorithm: 'ES256', expiresIn: '15m' });
const [, payload] = token.split('.');
console.log(`   segunda parte del token: ${payload.slice(0, 40)}…`);
console.log(`   decodificada sin ninguna clave: ${Buffer.from(payload, 'base64url').toString()}`);
console.log('== BIEN: solo identificadores; el resto se consulta en el servidor con el sub');
const minimo = jwt.sign({ rol: 'cliente' }, privateKey, { algorithm: 'ES256', expiresIn: '15m', subject: 'u1', noTimestamp: true });
console.log(`   decodificada: ${Buffer.from(minimo.split('.')[1], 'base64url').toString().replace(/"exp":\d+/, '"exp":<epoch>')}`);
