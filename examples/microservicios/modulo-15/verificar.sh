#!/usr/bin/env bash
# Módulo 11 · Mensajería avanzada (modulo-15)
# 1) Simulador del particionador de Kafka con solo el JDK (jdk/Particionador.java).
# 2) docker compose up: Kafka 4.4.0 (KRaft), Schema Registry 8.4.1, RabbitMQ 4.4.1 y NATS 2.15.3 (JetStream).
# 3) Tests de las 6 fichas, uno por uno (F075–F080), contra esos brokers.
# 4) Comprobaciones desde fuera: grupo de consumidores, subject en el registro, tipo de cola y stream de NATS.
# Uso: ./verificar.sh              todo y al final «docker compose down»
#      ./verificar.sh --conservar  igual, pero deja los brokers encendidos para explorarlos
# Requisitos: JDK 25, Docker con Compose v2 (4 GB de RAM para Docker), curl. Compatible con bash 3.2 (macOS).
# No se detiene en el primer fallo: ejecuta todos los pasos y al final lista los que fallaron.
set -u
cd "$(dirname "$0")" || exit 1
# Toda la salida queda también en logs/verificar-AAAAMMDD-HHMMSS.log (carpeta ignorada por Git).
mkdir -p logs
LOG="logs/verificar-$(date +%Y%m%d-%H%M%S).log"
exec > >(tee "$LOG") 2>&1
echo "Log: $LOG"
fallos=0
resumen=""

registrar() {
  if [ "$2" -eq 0 ]; then
    resumen="$resumen
  ✔ $1"
  else
    fallos=$((fallos + 1))
    resumen="$resumen
  ✘ $1"
  fi
}

# paso "nombre" comando args...   -> ejecuta, informa y nunca corta el guion
paso() {
  nombre=$1
  shift
  echo
  echo "== $nombre"
  "$@"
  registrar "$nombre" $?
}

contiene() {   # contiene "texto esperado" comando args...
  esperado=$1
  shift
  salida=$("$@" 2>&1)
  echo "$salida"
  # se comparan sin espacios: {"a": 1} y {"a":1} cuentan igual
  compacta=$(printf '%s' "$salida" | tr -d ' \t')
  buscado=$(printf '%s' "$esperado" | tr -d ' \t')
  case "$compacta" in
    *"$buscado"*) return 0 ;;
    *) echo "   (no aparece «${esperado}»)"; return 1 ;;
  esac
}

paso "JDK 25" contiene 'version "25' java -version
paso "Docker Compose v2" docker compose version
paso "Simulador del particionador (murmur2 + RangeAssignor)" java -Dstdout.encoding=UTF-8 jdk/Particionador.java

diagnostico() {   # diagnostico servicio  -> estado y últimas líneas del log cuando un broker no arranca
  echo "---- docker compose ps"
  docker compose ps -a
  echo "---- docker compose logs --tail 80 $1"
  docker compose logs --tail 80 "$1"
}

brokers() {
  docker compose up -d --wait kafka rabbitmq nats && return 0
  diagnostico kafka
  return 1
}
paso "Kafka, RabbitMQ y NATS healthy (docker compose up -d --wait)" brokers

# Schema Registry se comprueba DESDE EL HOST (curl del Mac): no depende de qué herramientas traiga la imagen.
registro() {
  if ! docker compose up -d schema-registry; then
    diagnostico schema-registry
    return 1
  fi
  limite=$((SECONDS + 240))
  while [ "$SECONDS" -lt "$limite" ]; do
    if curl -fs http://localhost:8081/subjects >/dev/null 2>&1; then
      echo "   Schema Registry responde en http://localhost:8081"
      return 0
    fi
    sleep 3
  done
  echo "   Schema Registry no respondió en 240 s"
  diagnostico schema-registry
  return 1
}
paso "Schema Registry responde (hasta 240 s)" registro

paso "F075 · Kafka: particionamiento y consumer groups" ./mvnw -q -pl f075-kafka-particiones test
paso "F076 · Exactly-Once Semantics" ./mvnw -q -pl f076-exactly-once test
paso "F077 · Schema Registry y Avro" ./mvnw -q -pl f077-schema-registry-avro test
paso "F078 · Dead Letter Topics" ./mvnw -q -pl f078-dead-letter-topics test
paso "F079 · RabbitMQ: publisher confirms y DLQ" ./mvnw -q -pl f079-rabbitmq-confirms-dlq test
paso "F080 · NATS" ./mvnw -q -pl f080-nats test

grupo_inventario() {   # cada partición del topic aparece en una fila con su offset y su LAG
  salida=$(docker compose exec -T kafka /opt/kafka/bin/kafka-consumer-groups.sh \
    --bootstrap-server localhost:9092 --describe --group inventario 2>&1)
  echo "$salida"
  filas=$(echo "$salida" | grep -c "pedidos-particionados")
  [ "$filas" -eq 3 ]
}
paso "Kafka: el grupo «inventario» tiene offsets en las 3 particiones" grupo_inventario
paso "Kafka: cobros-dlt existe con 3 particiones" \
  contiene "PartitionCount: 3" docker compose exec -T kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 --describe --topic cobros-dlt
paso "Schema Registry: subject pedidos-avro-value" contiene "pedidos-avro-value" curl -s http://localhost:8081/subjects
paso "RabbitMQ: «pedidos» es una quorum queue" \
  contiene "quorum" docker compose exec -T rabbitmq rabbitmqctl -q list_queues name type
paso "NATS: stream PAGOS en JetStream" contiene '"PAGOS"' curl -s "http://localhost:8222/jsz?streams=true"

if [ "${1:-}" != "--conservar" ]; then
  echo
  echo "== docker compose down"
  docker compose down
fi

echo
echo "Resumen:$resumen"
if [ "$fallos" -eq 0 ]; then
  echo "RESULTADO: OK · Módulo 11 (Mensajería avanzada) verificado"
else
  echo "RESULTADO: FALLA ($fallos pasos) · revisa arriba los pasos marcados con ✘"
  exit 1
fi
