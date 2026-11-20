# Módulo 0.5 · Docker básico: la receta (Dockerfile) más pequeña posible.
# Imagen base: ubuntu:24.04 (Ubuntu 24.04 LTS). Construye con:  docker build -t hola-docker:1 .
FROM ubuntu:24.04
WORKDIR /app
COPY hola.sh .
ENV MENSAJE="valor por defecto de la imagen"
CMD ["./hola.sh"]
