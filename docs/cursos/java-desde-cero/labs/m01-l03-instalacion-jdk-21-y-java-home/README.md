# Lab M01-L03 — Instalación JDK 21 y JAVA_HOME

## Qué se construyó
Script de verificación de entorno Java usando un programa que lee `java.version` y `java.home`.

## Prerrequisitos
JDK instalado y en PATH.

## Cómo compilar
```bash
mkdir -p out && javac -d out src/CheckJava.java
```
## Cómo ejecutar
```bash
java -cp out CheckJava
```
## Output esperado
```text
JAVA_VERSION=<tu versión>
JAVA_HOME=OK
```
## Cómo verificar
```bash
./verify.sh
```
## Qué modificar para experimentar
Ejecuta con un JDK diferente en PATH y compara `JAVA_VERSION`.
## Error común
`javac: command not found`: instalaste JRE/runtime pero no JDK.
