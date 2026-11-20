# Política de mínimo privilegio para el servicio de pagos (F068): solo LEER sus secretos.
# En KV v2 la API añade "data/" a la ruta: secret/f068-pagos se lee en secret/data/f068-pagos.
path "secret/data/f068-pagos" {
  capabilities = ["read"]
}
path "secret/data/application" {
  capabilities = ["read"]
}
