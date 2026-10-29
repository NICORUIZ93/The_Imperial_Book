#!/usr/bin/env bash
set -euo pipefail
rm -rf build
mkdir -p build
javac -d build Main.java
java -cp build Main
