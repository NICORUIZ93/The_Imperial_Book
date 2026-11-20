#!/usr/bin/env bash
# F067 · Genera la PKI mínima de una malla: una CA, el certificado de "pagos" (servidor),
# el de "pedidos" (cliente) y uno autofirmado de un "intruso". Cada certificado de servicio
# lleva su identidad SPIFFE en el SAN, como los que emite istiod.
# Uso: ./generar-certs.sh [carpeta]   (por defecto target/certs; requiere openssl y keytool)
set -euo pipefail
dir="${1:-target/certs}"
mkdir -p "$dir" && cd "$dir"
clave=cambiala
openssl req -x509 -newkey rsa:2048 -nodes -days 30 -keyout ca.key -out ca.crt -subj "/O=tienda/CN=malla-ca" 2>/dev/null
emitir() { # $1 = nombre, $2 = SAN, $3 = uso (serverAuth|clientAuth)
  openssl req -newkey rsa:2048 -nodes -keyout "$1.key" -out "$1.csr" -subj "/O=tienda/CN=$1" 2>/dev/null
  printf 'subjectAltName=%s\nextendedKeyUsage=%s\n' "$2" "$3" > "$1.ext"
  openssl x509 -req -in "$1.csr" -CA ca.crt -CAkey ca.key -CAcreateserial -days 1 -out "$1.crt" -extfile "$1.ext" 2>/dev/null
  openssl pkcs12 -export -in "$1.crt" -inkey "$1.key" -name "$1" -out "$1.p12" -passout pass:$clave
}
emitir pagos "DNS:localhost,IP:127.0.0.1,URI:spiffe://cluster.local/ns/tienda/sa/pagos" serverAuth
emitir pedidos "URI:spiffe://cluster.local/ns/tienda/sa/pedidos" clientAuth
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -keyout intruso.key -out intruso.crt -subj "/O=tienda/CN=pedidos" \
  -addext "subjectAltName=URI:spiffe://cluster.local/ns/tienda/sa/pedidos" -addext "extendedKeyUsage=clientAuth" 2>/dev/null
openssl pkcs12 -export -in intruso.crt -inkey intruso.key -name intruso -out intruso.p12 -passout pass:$clave
rm -f confianza.p12
keytool -importcert -noprompt -alias malla-ca -file ca.crt -keystore confianza.p12 -storetype PKCS12 -storepass $clave >/dev/null 2>&1
openssl verify -CAfile ca.crt pagos.crt pedidos.crt
openssl verify -CAfile ca.crt intruso.crt 2>&1 | grep -m1 "^error" || true
