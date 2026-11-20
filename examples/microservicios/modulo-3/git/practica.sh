#!/usr/bin/env bash
# Módulo 0.4 · Git: crea un repositorio de práctica y recorre el ciclo editar -> preparar -> confirmar.
# Requisitos: Git 2.4x o posterior, la que traiga tu sistema (mínimo 2.28, que añadió `git init -b`). Probado con 2.43.0.
# Uso: ./practica.sh [carpeta]   (por defecto crea una carpeta nueva en /tmp)
set -euo pipefail
DIR="${1:-$(mktemp -d /tmp/practica-git.XXXX)}"
mkdir -p "$DIR" && cd "$DIR"

git init -q -b main                                  # 1. crea el repositorio (la carpeta oculta .git)
git config user.name "Estudiante"                     #    identidad SOLO para este repositorio
git config user.email "estudiante@example.com"

echo "# Mi primer repositorio" > README.md            # 2. editar
git status --short                                    #    ?? = archivo nuevo que Git aún no sigue
git add README.md                                     # 3. preparar (staging)
git commit -q -m "Agrega README"                      # 4. confirmar: una foto del proyecto

git switch -q -c saludo                               # 5. rama: una línea de trabajo paralela
echo "Hola, Git" > saludo.txt
git add saludo.txt && git commit -q -m "Agrega saludo"
git switch -q main
git merge -q saludo                                   # 6. unir la rama a main

echo "== Historia (del más nuevo al más viejo)"
git log --format='%s'
echo "== Ramas"
git branch --format='%(refname:short)'
echo "== Archivos en la última foto"
git ls-files
echo "Repositorio en: $DIR"
