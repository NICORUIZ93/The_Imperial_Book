// M3 · Tema 5 · el techo de la pila no es un numero de Java: es un tamano en BYTES del hilo.
// Java 25. Ejecuta: javac --release 25 -d out MarcoGrande.java
//                  java -Xss256k -cp out MarcoGrande
//                  java -Xss4m   -cp out MarcoGrande
// Dos metodos que hacen la MISMA recursion, uno con el marco vacio y otro con cuatro longs (ocho
// casillas) por llamada. Si el techo fuera un numero fijo de llamadas, los dos pararian igual.
public class MarcoGrande {
    static int livianos = 0;
    static int pesados = 0;

    static void sinNada() {
        livianos++;
        sinNada();                      // el marco lleva lo minimo: direccion de retorno
    }

    static void conCuatroLongs(long a, long b, long c, long d) {
        pesados++;
        conCuatroLongs(a, b, c, d);     // cuatro argumentos de 64 bits = ocho casillas
    }

    public static void main(String[] args) {
        try {
            sinNada();
        } catch (StackOverflowError e) {
            System.out.println("marcos del metodo sin parametros : " + livianos);
        }
        try {
            conCuatroLongs(1L, 2L, 3L, 4L);
        } catch (StackOverflowError e) {
            System.out.println("marcos del metodo con 4 longs    : " + pesados);
        }
        // La conclusion NO es un numero: es la relacion, que si se mantiene entre corridas.
        System.out.println(pesados < livianos
            ? "el marco pesado llega MENOS lejos con la misma pila"
            : "ALERTA: el marco pesado no llego menos lejos (" + pesados + " vs " + livianos + ")");
    }
}
