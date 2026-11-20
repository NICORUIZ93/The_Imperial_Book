// Módulo 20 · F129 · Secretos: una interfaz común y tres proveedores (AWS Secrets Manager, HashiCorp Vault y
// Azure Key Vault), más una caché con caducidad para no llamar al gestor en cada petición.
// Requisitos: Node.js 26.13.1 LTS, @aws-sdk/client-secrets-manager 3.1173.0, node-vault 0.13.0,
// @azure/keyvault-secrets 4.12.0 y @azure/identity 4.14.1 (package.json del laboratorio).
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import { DefaultAzureCredential } from '@azure/identity';
import { SecretClient } from '@azure/keyvault-secrets';
import vault from 'node-vault';

// Todos los proveedores cumplen el mismo contrato:  leer(nombre) -> { valor: objeto, version: string }

/**
 * AWS Secrets Manager. Con `endpoint` apunta al emulador local (Floci, :4566) con credenciales de mentira.
 * En la nube real NO pases endpoint ni credenciales: el SDK usa el rol IAM de la tarea o del pod.
 */
export function proveedorAws({ endpoint = process.env.AWS_ENDPOINT_URL, region = process.env.AWS_REGION ?? 'us-east-1' } = {}) {
  const local = endpoint ? { endpoint, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } } : {};
  const cliente = new SecretsManagerClient({ region, ...local });
  return {
    nombre: 'aws',
    async leer(nombre) {
      const r = await cliente.send(new GetSecretValueCommand({ SecretId: nombre })); // por defecto, la versión AWSCURRENT
      return { valor: JSON.parse(r.SecretString), version: r.VersionId };
    },
  };
}

/**
 * HashiCorp Vault, motor KV versión 2 montado en `secret/`. En local: servidor en modo dev y token «root».
 * En producción: TLS, y el token se obtiene con AppRole o con la identidad del pod (auth de Kubernetes), nunca fijo.
 */
export function proveedorVault({ endpoint = process.env.VAULT_ADDR ?? 'http://127.0.0.1:8200', token = process.env.VAULT_TOKEN } = {}) {
  const cliente = vault({ apiVersion: 'v1', endpoint, token });
  return {
    nombre: 'vault',
    async leer(nombre) {
      const r = await cliente.read(`secret/data/${nombre}`); // KV v2: la ruta lleva «data/» y la respuesta viene en data.data
      return { valor: r.data.data, version: String(r.data.metadata.version) };
    },
  };
}

/**
 * Azure Key Vault. Los nombres solo admiten letras, números y guiones: «tienda/bd» se guarda como «tienda-bd».
 * En local (Floci-Az, :4577) el SDK exige una URL https y un token: se le da un token de mentira y una política
 * que reescribe la petición a http. En Azure real: https://<tu-vault>.vault.azure.net y DefaultAzureCredential
 * (identidad administrada), sin nada de eso.
 */
export function clienteAzure({ url = process.env.AZURE_KEYVAULT_URL, emulador = process.env.AZURE_EMULADOR === 'si' } = {}) {
  if (!emulador) return new SecretClient(url, new DefaultAzureCredential());
  const credencialLocal = { getToken: async () => ({ token: 'token-local', expiresOnTimestamp: Date.now() + 3_600_000 }) };
  const forzarHttp = {
    name: 'forzarHttp',
    sendRequest(peticion, siguiente) {
      peticion.url = peticion.url.replace(/^https:/, 'http:');
      peticion.allowInsecureConnection = true;
      return siguiente(peticion);
    },
  };
  return new SecretClient(url.replace(/^http:/, 'https:'), credencialLocal, {
    disableChallengeResourceVerification: true,
    additionalPolicies: [{ policy: forzarHttp, position: 'perCall' }],
  });
}

export function proveedorAzure(opciones) {
  const cliente = clienteAzure(opciones);
  return {
    nombre: 'azure',
    async leer(nombre) {
      const r = await cliente.getSecret(nombre.replaceAll('/', '-'));
      return { valor: JSON.parse(r.value), version: r.properties.version };
    },
  };
}

/** Elige proveedor por variable de entorno: el código de negocio no sabe cuál hay detrás. */
export function proveedorDesdeEntorno(nombre = process.env.SECRETOS ?? 'aws') {
  const fabricas = { aws: proveedorAws, vault: proveedorVault, azure: proveedorAzure };
  if (!fabricas[nombre]) throw new Error(`SECRETOS debe ser aws, vault o azure (recibido: ${nombre})`);
  return fabricas[nombre]();
}

/**
 * Caché con caducidad: guarda cada secreto `ttlMs` y después lo vuelve a pedir, así una rotación se recoge sola.
 * `obtener(nombre, { forzar: true })` salta la caché (para cuando la base de datos rechaza la clave guardada).
 */
export class SecretosConCache {
  #proveedor; #ttlMs; #ahora; #guardados = new Map();
  constructor(proveedor, { ttlMs = 300_000, ahora = Date.now } = {}) {
    this.#proveedor = proveedor; this.#ttlMs = ttlMs; this.#ahora = ahora;
  }

  async obtener(nombre, { forzar = false } = {}) {
    const guardado = this.#guardados.get(nombre);
    if (!forzar && guardado && this.#ahora() - guardado.leido < this.#ttlMs) return guardado.valor;
    const { valor, version } = await this.#proveedor.leer(nombre);
    this.#guardados.set(nombre, { valor, version, leido: this.#ahora() });
    return valor;
  }

  /** Para un endpoint de salud: qué hay en caché, SIN los valores. */
  estado() {
    return [...this.#guardados].map(([nombre, g]) => ({ nombre, proveedor: this.#proveedor.nombre, version: g.version, edadS: Math.round((this.#ahora() - g.leido) / 1000) }));
  }
}
