#!/usr/bin/env bash
# Módulo 27 · PKI mínima de una malla, como la que montan istiod o el identity de Linkerd:
#   - una CA «malla-ca» (en Istio, istiod; en Linkerd, el trust anchor + issuer),
#   - un certificado por servicio con su identidad SPIFFE en el SAN (URI) y vida de 1 día,
#   - un certificado «intruso» autofirmado que dice ser pedidos pero NO lo firmó la CA.
# Uso: ./pki/generar.sh [carpeta]   (por defecto pki/certs). Requiere openssl (OpenSSL 3 o LibreSSL de macOS).
# Claves RSA 2048 y extensiones por -extfile: funcionan igual en OpenSSL 3.x y en LibreSSL 3.x.
set -eu
dir="${1:-$(dirname "$0")/certs}"
mkdir -p "$dir"
cd "$dir"
if ! command -v openssl > /dev/null 2>&1; then
  echo "ERROR: falta openssl. En macOS viene instalado; en Linux: sudo apt-get install openssl" >&2
  exit 2
fi
rm -f ./*.crt ./*.key ./*.csr ./*.ext ./*.srl
openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 30 -keyout ca.key -out ca.crt -subj "/O=tienda/CN=malla-ca" 2> /dev/null

emitir() { # emitir <nombre> <SAN> <uso: serverAuth | clientAuth | serverAuth,clientAuth>
  openssl req -newkey rsa:2048 -nodes -sha256 -keyout "$1.key" -out "$1.csr" -subj "/O=tienda/CN=$1" 2> /dev/null
  printf 'subjectAltName=%s\nextendedKeyUsage=%s\n' "$2" "$3" > "$1.ext"
  openssl x509 -req -sha256 -in "$1.csr" -CA ca.crt -CAkey ca.key -CAcreateserial -days 1 -out "$1.crt" -extfile "$1.ext" 2> /dev/null
  rm -f "$1.csr" "$1.ext"
}
TD="spiffe://cluster.local/ns/tienda/sa"
emitir pagos      "DNS:localhost,IP:127.0.0.1,URI:${TD}/pagos"      serverAuth,clientAuth
emitir sts        "DNS:localhost,IP:127.0.0.1,URI:${TD}/sts"        serverAuth
emitir inventario "DNS:localhost,IP:127.0.0.1,URI:${TD}/inventario" serverAuth
emitir pedidos    "URI:${TD}/pedidos"   clientAuth
emitir catalogo   "URI:${TD}/catalogo"  clientAuth
emitir antifraude "DNS:localhost,IP:127.0.0.1,URI:${TD}/antifraude" serverAuth
# Error común de F161: un certificado de servidor sin el SAN del nombre con el que lo llaman.
emitir sin-san    "URI:${TD}/pagos" serverAuth
# Intruso: autofirmado, mismo CN y mismo SAN que pedidos, pero fuera de la CA.
printf 'subjectAltName=URI:%s/pedidos\nextendedKeyUsage=clientAuth\n' "$TD" > intruso.ext
openssl req -newkey rsa:2048 -nodes -sha256 -keyout intruso.key -out intruso.csr -subj "/O=tienda/CN=pedidos" 2> /dev/null
openssl x509 -req -sha256 -in intruso.csr -signkey intruso.key -days 1 -out intruso.crt -extfile intruso.ext 2> /dev/null
rm -f intruso.csr intruso.ext
openssl verify -CAfile ca.crt pagos.crt pedidos.crt catalogo.crt
openssl verify -CAfile ca.crt intruso.crt > /dev/null 2>&1 && echo "intruso.crt: OK (¡no debería!)" || echo "intruso.crt: rechazado por la CA (correcto)"
