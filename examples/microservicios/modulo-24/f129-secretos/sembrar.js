// Módulo 20 · F129 · Guarda (o rota) el secreto «tienda/bd» en los tres gestores locales del docker-compose.yml:
// Floci (AWS Secrets Manager, :4566), Vault en modo dev (:8200) y Floci-Az (Azure Key Vault, :4577).
// Ejecuta: node f129-secretos/sembrar.js [clave]        (clave por defecto: Cl4ve-Pr0d-2026)
import { CreateSecretCommand, PutSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import vault from 'node-vault';
import { clienteAzure } from './secretos.js';

export const LOCAL = {
  aws: process.env.AWS_ENDPOINT_URL ?? 'http://127.0.0.1:4566',
  vault: process.env.VAULT_ADDR ?? 'http://127.0.0.1:8200',
  vaultToken: process.env.VAULT_TOKEN ?? 'root',
  azure: process.env.AZURE_KEYVAULT_URL ?? 'http://127.0.0.1:4577/devstoreaccount1-keyvault',
};

export async function sembrar(clave = 'Cl4ve-Pr0d-2026') {
  const valor = { usuario: 'app', clave };
  const texto = JSON.stringify(valor);

  // AWS: CreateSecret la primera vez; PutSecretValue crea una versión nueva (la rotación).
  const aws = new SecretsManagerClient({ region: 'us-east-1', endpoint: LOCAL.aws, credentials: { accessKeyId: 'test', secretAccessKey: 'test' } });
  try {
    await aws.send(new CreateSecretCommand({ Name: 'tienda/bd', SecretString: texto }));
  } catch (error) {
    if (error.name !== 'ResourceExistsException') throw error;
    await aws.send(new PutSecretValueCommand({ SecretId: 'tienda/bd', SecretString: texto }));
  }

  // Vault KV v2: cada escritura en secret/data/<ruta> crea una versión.
  await vault({ apiVersion: 'v1', endpoint: LOCAL.vault, token: LOCAL.vaultToken }).write('secret/data/tienda/bd', { data: valor });

  // Azure Key Vault: setSecret crea una versión nueva del secreto «tienda-bd».
  await clienteAzure({ url: LOCAL.azure, emulador: true }).setSecret('tienda-bd', texto, { contentType: 'application/json' });
  return valor;
}

if (import.meta.main) {
  const valor = await sembrar(process.argv[2]);
  console.log(`secreto tienda/bd guardado en AWS (${LOCAL.aws}), Vault (${LOCAL.vault}) y Azure (${LOCAL.azure}) · usuario=${valor.usuario} clave=<oculta>`);
}
