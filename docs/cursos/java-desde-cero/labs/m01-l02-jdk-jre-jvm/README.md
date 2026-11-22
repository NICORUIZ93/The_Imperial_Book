# Lab M01-L02 — JDK vs JRE vs JVM

## Qué se construyó
Diagnóstico de herramientas Java y programa mínimo que separa compilación (`javac`, JDK) de ejecución (`java`, JVM).

## Prerrequisitos
- JDK 21+ instalado (verificado aquí con JDK disponible en PATH).

## Cómo compilar
```bash
mkdir -p out
javac -d out src/HolaComponentes.java
```

## Cómo ejecutar
```bash
java -cp out HolaComponentes
```

## Output esperado
```text
JDK compila, JVM ejecuta
```

## Cómo verificar
```bash
./verify.sh
```

## Qué modificar para experimentar
Cambia el mensaje en `src/HolaComponentes.java`, recompila y observa que `verify.sh` falla hasta restaurar el contrato esperado.

## Error común
`javac: command not found`: tienes runtime pero no JDK, o PATH/JAVA_HOME mal configurado.
