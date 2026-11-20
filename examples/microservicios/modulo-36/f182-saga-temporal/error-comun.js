// Módulo 32 · F182 · ERROR COMÚN: hacer el trabajo con red DENTRO del workflow. Temporal lo detecta al empaquetar.
// Ejecuta: node f182-saga-temporal/error-comun.js   (no necesita servidor de Temporal)
import { bundleWorkflowCode } from '@temporalio/worker';

const silencio = { info() {}, warn() {}, debug() {}, trace() {}, error() {}, log() {} };
try {
  await bundleWorkflowCode({ workflowsPath: new URL('./workflow-mal.js', import.meta.url).pathname, logger: silencio });
  console.log('se empaquetó (no debería)');
} catch (e) { console.log(e.message.split('\n').slice(0, 2).join('\n')); }
