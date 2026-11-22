# Lab M01-L04 — Primer programa desde cero sin IDE

## Qué se construyó
Programa Java CLI que recibe argumento opcional y saluda.

## Cómo compilar
```bash
mkdir -p out && javac -d out src/HolaRuta.java
```
## Cómo ejecutar
```bash
java -cp out HolaRuta
java -cp out HolaRuta Ada
```
## Output esperado
```text
Hola, mundo!
Hola, Ada!
```
## Cómo verificar
```bash
./verify.sh
```
## Qué modificar para experimentar
Cambia el saludo por defecto o agrega validación de argumentos.
## Error común
Ejecutar `java HolaRuta.java` desde otra carpeta sin classpath/ruta correcta; usa `-cp out`.
