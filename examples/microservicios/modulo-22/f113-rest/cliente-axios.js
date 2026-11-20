// Módulo 18 · F113 · Cliente REST con Axios.
// Requisitos: Node.js 26.13.1 LTS y axios 1.21.1 (package.json del laboratorio).
import axios from 'axios';
import { randomUUID } from 'node:crypto';
import { ErrorDeInventario } from './errores.js';

export function clienteAxios(baseUrl, { timeoutMs = 1000 } = {}) {
  // Una instancia por servicio destino: URL base, timeout y cabeceras se configuran UNA vez.
  const http = axios.create({ baseURL: baseUrl, timeout: timeoutMs, headers: { accept: 'application/json' } });

  // Interceptor de petición: se ejecuta antes de cada llamada (correlación, autenticación…).
  http.interceptors.request.use((config) => {
    config.headers.set('x-request-id', randomUUID());
    return config;
  });

  // Interceptor de respuesta: axios SÍ rechaza con cualquier código fuera de 2xx; aquí se traduce.
  http.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
      if (error.response?.status === 404) throw new ErrorDeInventario('NO_ENCONTRADO', 'inventario no conoce ese SKU', { cause: error });
      if (error.response) throw new ErrorDeInventario('NO_DISPONIBLE', `inventario respondió ${error.response.status}`, { cause: error });
      if (error.code === 'ECONNABORTED') throw new ErrorDeInventario('TIEMPO_AGOTADO', `inventario no respondió en ${timeoutMs} ms`, { cause: error });
      throw new ErrorDeInventario('NO_DISPONIBLE', `no se pudo conectar con inventario: ${error.code}`, { cause: error });
    },
  );

  return {
    async existencias(sku) {
      const { data } = await http.get(`/existencias/${encodeURIComponent(sku)}`); // data ya viene como objeto
      return data;
    },
  };
}
