#!/bin/sh
# Módulo 0.5 · Script que corre DENTRO del contenedor: muestra que está aislado del computador anfitrión.
echo "Hola Mundo desde Docker"
echo "Sistema dentro del contenedor: $(. /etc/os-release && echo "$PRETTY_NAME")"
echo "Usuario: $(whoami) · Directorio: $(pwd)"
echo "Mensaje recibido por variable de entorno: ${MENSAJE:-(ninguno)}"
