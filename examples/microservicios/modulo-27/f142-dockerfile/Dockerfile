# syntax=docker/dockerfile:1
# Módulo 23 · F142 · Dockerfile multi-stage del servicio «pedidos» (Node.js 26.13.1 LTS + TypeScript 6.0.3).
# Construye desde la raíz del laboratorio:  docker build -f f142-dockerfile/Dockerfile -t pedidos:1.0.0 .
# Tres etapas que parten de la misma base: «deps» (solo dependencias de producción), «build» (compila TypeScript
# con las de desarrollo) y «runtime» (lo único que se publica: dist/ + node_modules de producción, usuario sin root).
ARG NODE_VERSION=26.13.1

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

# 1) Dependencias de PRODUCCIÓN. Solo se repite si cambian package.json o package-lock.json (caché de capas).
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# 2) Compilación: necesita typescript y @types (devDependencies), que NUNCA llegan a la imagen final.
FROM base AS build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# 3) Imagen final: sin compilador, sin código fuente TypeScript, sin npm ci de desarrollo.
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=8080
# Los archivos quedan de root y solo legibles para «node»: el proceso no puede reescribir su propio código.
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
# Las imágenes oficiales traen el usuario «node» (uid 1000).
USER node
EXPOSE 8080
# Docker y Compose usan HEALTHCHECK; Kubernetes lo ignora y usa sus probes (F143).
HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8080/salud/viva').then((r) => process.exit(r.ok ? 0 : 1), () => process.exit(1))"]
# Forma exec: node es el PID 1 y recibe SIGTERM directamente (con «npm start» la señal se queda en npm).
CMD ["node", "dist/servidor.js"]
