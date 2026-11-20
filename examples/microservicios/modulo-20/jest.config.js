// Módulo 16 · Configuración de Jest 30.5.2 con ts-jest 29.4.15 (compila TypeScript 6.0.3 al vuelo).
// Un «project» por tipo de prueba: así los tests rápidos no esperan a Docker ni al contrato.
const base = { preset: 'ts-jest', testEnvironment: 'node' };

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    { ...base, displayName: 'unit', testMatch: ['<rootDir>/f105-jest/src/**/*.test.ts', '<rootDir>/f106-supertest/src/**/*.test.ts'] },
    { ...base, displayName: 'errores', testMatch: ['<rootDir>/**/error-comun/*.test.ts'] },
    { ...base, displayName: 'pact-consumidor', testMatch: ['<rootDir>/f107-pact/consumidor/*.pact.test.ts'] },
    { ...base, displayName: 'pact-proveedor', testMatch: ['<rootDir>/f107-pact/proveedor/*.pact.test.ts'] },
    { ...base, displayName: 'contenedores', testMatch: ['<rootDir>/f108-testcontainers/*.test.ts'] },
  ],
  // Reportero clásico siempre: Jest 30 cambia a un informe resumido cuando detecta que lo ejecuta un asistente de IA.
  reporters: ['default'],
  // Cobertura (solo con --coverage): mide el código de producción, no los tests.
  collectCoverageFrom: ['f105-jest/src/**/*.ts', 'f106-supertest/src/**/*.ts', '!**/*.test.ts', '!**/servidor.ts'],
  coverageThreshold: { global: { lines: 90, branches: 80 } }, // por debajo de esto, jest termina con código 1
};
