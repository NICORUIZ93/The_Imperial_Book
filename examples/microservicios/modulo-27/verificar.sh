#!/usr/bin/env bash
# Módulo 23 · Docker, Kubernetes y CI/CD (modulo-27, fichas F142–F147).
# Sin Docker: npm ci, compilación con TypeScript, 29 tests de node --test y los scripts de cada ficha (revisor del
# Dockerfile, etapas medidas, validador de manifiestos, simulador del HPA, workflow ejecutado en local, simulación de
# Canary y Blue-Green con procesos reales y reconciliador GitOps sobre un repositorio Git temporal).
# Con --compose: además construye la imagen multi-stage con Docker, la arranca con Compose, comprueba usuario, tamaño,
# HEALTHCHECK y apagado limpio, y ejecuta el job «imagen» del workflow. Si además hay kind y kubectl, crea un clúster
# «curso», despliega k8s/, comprueba probes, rolling update y el HPA con metrics-server, y borra el clúster al final.
# Si algo falla, sigue y lo reporta al final. Uso: ./verificar.sh [--compose]
# Requiere Node.js 26.13.1 LTS, npm, git y curl; bash 3.2 de macOS sirve. Los logs quedan en logs/.
set -u
cd "$(dirname "$0")" || exit 1
mkdir -p logs
exec > >(tee logs/verificar.log) 2>&1
fallos=""; omitidos=0
falla() { fallos="$fallos\n  ✘ $1"; echo "✘ $1"; }
omite() { omitidos=$((omitidos + 1)); echo "– omitido: $1"; }
compose=no; cluster=no; pf=""
limpiar() {
  if [ -n "$pf" ]; then kill "$pf" 2>/dev/null; fi
  if [ "$compose" = si ]; then docker compose down > logs/compose-down.log 2>&1; docker rm -f humo > /dev/null 2>&1; fi
  if [ "$cluster" = si ]; then kind delete cluster --name curso > logs/kind-delete.log 2>&1; fi
}
trap limpiar EXIT

guion() { # guion "descripción" "comando" "texto esperado"…  (el comando puede terminar con código ≠ 0)
  local desc="$1" cmd="$2"; shift 2
  local registro
  registro="logs/$(echo "$desc" | tr -c 'a-zA-Z0-9\n' '-' | tr -s '-').log"
  bash -c "$cmd" > "$registro" 2>&1
  local ok=si texto
  cat "$registro"
  for texto in "$@"; do grep -qF -- "$texto" "$registro" || { ok=no; echo "  falta: «${texto}»"; }; done
  if [ "$ok" = si ]; then echo "✔ ${desc}"; else falla "${desc} (mira ${registro})"; fi
}
esperar() { # esperar url descripción → hasta 60 s
  local i=0
  while [ $i -lt 120 ]; do curl -fs -o /dev/null "$1" && return 0; sleep 0.5; i=$((i + 1)); done
  falla "$2 no respondió en 60 s"; return 1
}

echo "== Node.js $(node --version) · npm $(npm --version) · git $(git --version | cut -d' ' -f3)"
case "$(node --version)" in v26.*) ;; *) echo "AVISO: el curso fija Node.js 26.13.1 LTS; con otra versión los textos pueden cambiar." ;; esac

echo "== Dependencias y compilación (express 5.3.0, typescript 6.0.3, yaml 2.9.1)"
npm ci --no-audit --no-fund --silent || falla "npm ci"
npm run build --silent || falla "npm run build (tsc)"

echo "== Tests (node --test, 29 en total)"
node --test --test-concurrency=1 --test-reporter=spec 'f1*/*.test.js' || falla "node --test (busca ✖ arriba)"

echo "== F142 · Dockerfile multi-stage"
guion "F142 revisor: antes incumple 6, después ninguna" "node f142-dockerfile/revisar.js f142-dockerfile/Dockerfile.antes f142-dockerfile/Dockerfile" \
  '✘ varias etapas (multi-stage)' 'reglas incumplidas: 6'
guion "F142 etapas medidas" "node f142-dockerfile/etapas.js" 'typescript dentro: sí' 'typescript dentro: no' 'la imagen final copia solo «deps»'
guion "F142 error común (express en devDependencies)" "node f142-dockerfile/error-comun.js" \
  "Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express'" '"msg":"escuchando"'

echo "== F143 · Kubernetes"
guion "F143 manifiestos de k8s/" "node f143-kubernetes/validar.js k8s/" '✔ sin problemas'
guion "F143 error común (selector)" "node f143-kubernetes/validar.js f143-kubernetes/error-comun.yaml" 'no elige ningún pod (Endpoints vacíos)'

echo "== F144 · HPA"
guion "F144 simulador del algoritmo" "node f144-hpa/simulador.js" ' 120s    900m    300 %   3 -> 7' ' 645s    150m     15 %   10 -> 8' ' 825s    150m     38 %   4 -> 3'

echo "== F145 · GitHub Actions"
guion "F145 validador del workflow" "node f145-github-actions/validar.js f145-github-actions/ci.antes.yml f145-github-actions/ci.yml" \
  '✘ acciones fijadas por SHA de 40 caracteres' '✔ sin ${{ secrets.* }} ni ${{ github.* }} dentro de run: (inyección)'
guion "F145 job «pruebas» ejecutado en local" "node f145-github-actions/simular-ci.js pruebas" '✔ npm test' 'job pruebas: OK'

echo "== F146 · Blue-Green y Canary"
guion "F146 canary con v2 rota" "node f146-blue-green-canary/simulacion.js 0.2" \
  'peso  10 % -> v1=180 v2= 20 errores v2=4/20 -> abortar' 'después: v1=100 v2=0 errores=0' 'cambio a green -> v1=0 v2=100 errores=20'
guion "F146 canary con v2 sana" "node f146-blue-green-canary/simulacion.js 0" 'peso 100 % -> v1=  0 v2=200 errores v2=0/200 -> fin' 'resultado: promovida'
guion "F146 error común (canary por petición)" "node f146-blue-green-canary/error-comun.js" 'BIEN (cubeta por usuario, peso 10 %):      0 de 1000'

echo "== F147 · GitOps con Argo CD"
guion "F147 bucle GitOps" "node f147-gitops-argocd/demo.js" 'imagen viva = pedidos:1.0.0 (selfHeal devolvió lo que dice Git)' '¿HPA en el clúster? no' 'Revert "pedidos 1.1.0"'
guion "F147 error común (HPA contra selfHeal)" "node f147-gitops-argocd/error-comun.js" 'MAL  replicas: 3 en Git: sync→3' 'BIEN sin replicas en Git: nada→7'

if [ "${1:-}" = "--compose" ]; then
  if ! command -v docker > /dev/null 2>&1 || ! docker info > /dev/null 2>&1; then
    omite "bloques de Docker y Kubernetes: no hay Docker en marcha (instala Docker Desktop o arranca el daemon)"
  else
    compose=si
    echo "== F142 · Construir y arrancar la imagen (docker compose up -d --build --wait)"
    if docker compose up -d --build --wait > logs/compose-up.log 2>&1; then echo "✔ imagen construida y contenedor healthy"; else tail -20 logs/compose-up.log; falla "docker compose up (mira logs/compose-up.log)"; fi
    esperar http://127.0.0.1:18080/salud/lista "pedidos en :18080" && {
      curl -s http://127.0.0.1:18080/version | grep -q '"version":"v1"' && echo "✔ /version responde v1" || falla "/version no responde v1"
    }
    usuario=$(docker image inspect pedidos:1.0.0 --format '{{.Config.User}}' 2>/dev/null)
    [ "$usuario" = node ] && echo "✔ la imagen corre como «node»" || falla "la imagen corre como «${usuario}» y debía ser node"
    if docker run --rm pedidos:1.0.0 test -d node_modules/typescript > /dev/null 2>&1; then falla "typescript está dentro de la imagen final"; else echo "✔ typescript NO está en la imagen final"; fi
    echo "   tamaño: $(docker image ls pedidos:1.0.0 --format '{{.Size}}')"
    docker compose stop > logs/compose-stop.log 2>&1
    docker compose logs > logs/compose-logs.log 2>&1
    grep -q 'cerrado limpio' logs/compose-logs.log && echo "✔ docker compose stop: SIGTERM, drenado y salida limpia" || falla "no aparece «cerrado limpio» en logs/compose-logs.log"
    docker compose down > logs/compose-down.log 2>&1

    echo "== F145 · Job «imagen» del workflow en local (build + prueba de humo; no publica)"
    guion "F145 job «imagen» ejecutado en local" "node f145-github-actions/simular-ci.js imagen; docker rm -f humo > /dev/null 2>&1" \
      '✔ Construir' '✔ Prueba de humo' 'ghcr.io/estudiante/tienda/pedidos:a1b2c3d4e5f6' 'job imagen: OK'

    if command -v kind > /dev/null 2>&1 && command -v kubectl > /dev/null 2>&1; then
      echo "== F143/F144 · Kubernetes con kind ($(kind version | cut -d' ' -f2))"
      if kind get clusters 2>/dev/null | grep -qx curso; then echo "   (ya existe el clúster «curso»: lo uso y no lo borro)"; else
        if kind create cluster --name curso --wait 120s > logs/kind-create.log 2>&1; then cluster=si; echo "✔ clúster kind «curso» creado"; else falla "kind create cluster (mira logs/kind-create.log)"; fi
      fi
      kubectl config use-context kind-curso > /dev/null 2>&1
      kind load docker-image pedidos:1.0.0 --name curso > logs/kind-load.log 2>&1 || falla "kind load docker-image"
      kubectl apply -f k8s/ > logs/kubectl-apply.log 2>&1 && cat logs/kubectl-apply.log || falla "kubectl apply -f k8s/"
      if kubectl -n tienda rollout status deployment/pedidos --timeout=180s > logs/rollout.log 2>&1; then echo "✔ rollout completo"; else falla "rollout status (mira logs/rollout.log)"; fi
      listos=$(kubectl -n tienda get deployment pedidos -o jsonpath='{.status.readyReplicas}')
      [ "${listos:-0}" -ge 3 ] && echo "✔ ${listos} pods listos (minReplicas del HPA)" || echo "   pods listos: ${listos:-0} (el HPA sube a 3 cuando lee métricas)"
      kubectl -n tienda port-forward svc/pedidos 18081:80 > logs/port-forward.log 2>&1 & pf=$!
      esperar http://127.0.0.1:18081/salud/lista "port-forward a svc/pedidos" && { curl -s http://127.0.0.1:18081/version; echo; }
      kubectl get endpointslices -n tienda -l kubernetes.io/service-name=pedidos -o wide > logs/endpoints.log 2>&1; cat logs/endpoints.log
      echo "   metrics-server v0.9.1 (con --kubelet-insecure-tls, solo para kind)"
      kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.9.1/components.yaml > logs/metrics-server.log 2>&1
      kubectl -n kube-system patch deployment metrics-server --type=json -p '[{"op":"add","path":"/spec/template/spec/containers/0/args/-","value":"--kubelet-insecure-tls"}]' >> logs/metrics-server.log 2>&1
      kubectl -n kube-system rollout status deployment/metrics-server --timeout=180s >> logs/metrics-server.log 2>&1 || falla "metrics-server no arrancó (mira logs/metrics-server.log)"
      i=0; objetivo=""
      while [ $i -lt 36 ]; do objetivo=$(kubectl -n tienda get hpa pedidos -o jsonpath='{.status.currentMetrics[0].resource.current.averageUtilization}' 2>/dev/null); [ -n "$objetivo" ] && break; sleep 5; i=$((i + 1)); done
      [ -n "$objetivo" ] && echo "✔ el HPA lee la CPU: ${objetivo} % de cpu.requests" || falla "el HPA no lee métricas en 3 min (kubectl -n tienda describe hpa pedidos)"
      echo "   carga de 90 s contra el Service para que el HPA escale…"
      kill "$pf" 2>/dev/null; pf=""
      kubectl -n tienda run carga --image=pedidos:1.0.0 --image-pull-policy=IfNotPresent --restart=Never --command -- \
        node -e "const fin=Date.now()+90000;const go=async()=>{while(Date.now()<fin){try{await fetch('http://pedidos/trabajo?ms=50')}catch{}}};Promise.all(Array.from({length:30},go))" > /dev/null 2>&1
      sleep 100
      kubectl -n tienda get hpa pedidos > logs/hpa.log 2>&1; cat logs/hpa.log
      replicas=$(kubectl -n tienda get deployment pedidos -o jsonpath='{.spec.replicas}')
      [ "${replicas:-0}" -gt 3 ] && echo "✔ el HPA escaló a ${replicas} réplicas" || falla "el HPA no escaló (réplicas: ${replicas:-?}; mira logs/hpa.log)"
      kubectl -n tienda delete pod carga --wait=false > /dev/null 2>&1
    else
      omite "Kubernetes con kind (F143/F144): instala kind y kubectl (brew install kind kubectl) y vuelve a ejecutar con --compose"
    fi
  fi
else
  omite "imagen con Docker, Compose, job «imagen» y Kubernetes con kind: usa --compose"
fi

limpiar; pf=""; compose=no; cluster=no
if [ -z "$fallos" ]; then
  if [ $omitidos -gt 0 ]; then echo "AVISO: ${omitidos} bloques omitidos; ejecuta ./verificar.sh --compose (con Docker, kind y kubectl) para verificarlo todo."; fi
  echo "RESULTADO: OK · Módulo 23 (Docker, Kubernetes y CI/CD) verificado"
else
  printf "Fallos:%b\n" "$fallos"
  echo "RESULTADO: FALLA"
  exit 1
fi
