# Lab M01-L01 — Qué es Java, JVM, bytecode, WORA

## Qué se construyó
Programa Java mínimo compilado a bytecode y ejecutado en la JVM, inspeccionando el `.class` con `javap`.

## Prerrequisitos
JDK 21+ (`java`, `javac`, `javap`).

## Cómo compilar
```bash
mkdir -p out
javac -d out src/HolaJvm.java
```

## Cómo ejecutar
```bash
java -cp out HolaJvm
```

## Output esperado
```text
Hola JVM
```

## Cómo verificar
```bash
./verify.sh
```

## Qué modificar para experimentar
Cambia `"Hola JVM"` por otro texto, recompila y observa el cambio; luego rompe el nombre de clase y observa el error de compilación.

## Error común
`error: class HolaJvm is public, should be declared in a file named HolaJvm.java`: el nombre del archivo debe coincidir con la clase pública.
