// Módulo 25 · F153 · Error común: E/S dentro del workflow. El empaquetador del Worker lo rechaza antes de arrancar.
// Ejecuta: node f153-temporal/error-comun.js
import { bundleWorkflowCode } from '@temporalio/worker';

const errores = [];
const logger = { trace() {}, debug() {}, info() {}, warn() {}, log() {}, error: (m) => errores.push(String(m)) };
try {
  await bundleWorkflowCode({ workflowsPath: new URL('./workflow-mal.js', import.meta.url).pathname, logger });
  console.log('empaquetado (no debía pasar)');
} catch (error) {
  console.log(`MAL  → ${error.message.split(',')[0]}`);
  const lineas = errores.join('\n').split('\n');
  console.log(`       ${lineas.find((l) => l.startsWith('ERROR in'))}`);
  console.log(`       ${lineas.find((l) => l.includes('UnhandledSchemeError'))}`);
}
const { code } = await bundleWorkflowCode({ workflowsPath: new URL('./workflows.js', import.meta.url).pathname, logger });
console.log(`BIEN → workflows.js empaquetado (${(code.length / 1024 / 1024).toFixed(1)} MiB): la E/S vive en actividades.js`);
