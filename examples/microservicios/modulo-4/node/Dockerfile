# Módulo 0.5 · Imagen Docker del «Hola Mundo» Node.js.
# Imagen base oficial: node:26-alpine (Node.js 26 LTS sobre Alpine Linux, pequeña).
FROM node:26-alpine
WORKDIR /app
COPY package.json servidor.js ./
ENV PUERTO=3000
EXPOSE 3000
USER node
CMD ["node", "servidor.js"]
