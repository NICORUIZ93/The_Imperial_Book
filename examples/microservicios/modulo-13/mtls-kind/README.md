# F067 · mTLS con Service Mesh (kind + Istio)

Laboratorio de Kubernetes: un clúster local con **kind**, **Istio 1.32** en modo sidecar y dos espacios de nombres:
`tienda` (con sidecar) y `legado` (sin sidecar). Se verifica en el Mac del dueño (ver
`verificacion/microservicios/pendiente.md`): necesita Docker Desktop con 8 GB de memoria, `kind`, `kubectl` y acceso a
Internet para descargar Istio.

```bash
./instalar.sh            # crea el clúster "malla", instala Istio y despliega httpbin + curl
./verificar-mtls.sh      # ANTES (PERMISSIVE) -> 200 desde legado; DESPUÉS (STRICT) -> 000 y exit code 56
kind delete cluster --name malla
```
