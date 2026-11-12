#!/usr/bin/env bash
set -euo pipefail
build_dir="$(mktemp -d)"
trap 'rm -rf "$build_dir"' EXIT
javac -d "$build_dir" Main.java
java -cp "$build_dir" Main
