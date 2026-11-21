// M3 · Tema 2 · el mismo `switch` de `long`, pero con `case 1:`: aqui javac si dice el motivo.
// Java 25. Ejecuta (debe fallar al compilar): javac --release 25 LargoConCaseInt.java
// Medido aqui: salen DOS errores, no uno. El primero repite el aviso de preview; el segundo es el que
// dice lo que pasa de verdad: «constant label of type int is not compatible with switch selector type
// long». O sea: el selector `long` no es compatible con las etiquetas constantes de un switch clasico,
// y eso no depende de ninguna funcion preview.
public class LargoConCaseInt {
    static int m(long gramos) {
        switch (gramos) {
            case 1: return 1;
            default: return 0;
        }
    }
}
