#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
./mvnw -q clean package
JAR=target/spring-boot-layered-jar-rutaflow-0.1.0-SNAPSHOT.jar

echo "Capas declaradas en el JAR:"
java -Djarmode=tools -jar "$JAR" list-layers

echo "Extrayendo capas a target/extracted/"
java -Djarmode=tools -jar "$JAR" extract --layers --destination target/extracted

for layer in dependencies spring-boot-loader snapshot-dependencies application; do
  test -d "target/extracted/$layer"
  echo "OK: target/extracted/$layer"
done
