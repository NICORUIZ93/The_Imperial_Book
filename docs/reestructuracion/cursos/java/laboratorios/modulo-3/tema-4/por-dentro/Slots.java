// M3 · Tema 4 · por dentro: las casillas locales. En un metodo de instancia, la 0 ya esta ocupada por «this».
// Java 25. Ejecuta: javac --release 25 -g -d out Slots.java
//                  javap -c -p -l -cp out Slots
// Hace falta -g (o -g:vars): por defecto javac graba solo la LineNumberTable, y «javap -l»
// no tendria una LocalVariableTable que imprimir. Medido aqui: el constructor y sumaInstancia
// declaran «this, int» en las casillas 0 y 1, y el parametro de un metodo estatico empieza en la 0.
public class Slots {
    static int sumaEstatica(int a, int b) { return a + b; }
    int sumaInstancia(int b)              { return this.hashCode() + b; }
    static void sinParametros()           { System.out.print(""); }
    static long dosCasillas(long peso)    { return peso; } // un long ocupa dos casillas
    // Y la siguiente que se reparte: despues de un long, el int NO va a la casilla 1, va a la 2.
    // Medido: peso J en la 0 y siguiente I en la 2; la 1 no la ocupa nadie.
    static long trasUnLong(long peso, int siguiente) { return peso + siguiente; }

    public static void main(String[] args) {
        System.out.println(sumaEstatica(2, 3));
        System.out.println(new Slots().sumaInstancia(3));
    }
}
