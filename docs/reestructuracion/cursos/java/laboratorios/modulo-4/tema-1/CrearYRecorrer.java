// M4 · Tema 1 · Las tres formas de crear un arreglo y como se recorre cada una.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out CrearYRecorrer
public class CrearYRecorrer {

    // 1. Literal, en la declaracion: solo funciona aqui, no como expresion suelta.
    static final int[] LLEGADA = {1250, 3400, 890, 7600, 250};

    // 2. Tamano primero: se crean los huecos, vacios de contenido.
    static int[] porTamano(int n) {
        return new int[n];
    }

    // 3. Tamano y contenido a la vez, con la expresion new int[] {...}.
    static int[] porExpresion() {
        return new int[] {1250, 3400, 890};
    }

    public static void main(String[] args) {
        System.out.println("llegada   : longitud " + LLEGADA.length + " · primer indice 0 = " + LLEGADA[0]
                + " · ultimo indice " + (LLEGADA.length - 1) + " = " + LLEGADA[LLEGADA.length - 1]);
        System.out.println("porTamano(3): longitud " + porTamano(3).length + " · su primer valor es " + porTamano(3)[0]);
        System.out.println("porExpresion: longitud " + porExpresion().length);

        int suma = 0;
        for (int i = 0; i < LLEGADA.length; i++) {
            suma += LLEGADA[i];
        }
        int sumaForEach = 0;
        for (int peso : LLEGADA) {
            sumaForEach += peso;
        }
        System.out.println("suma con indice: " + suma + " · suma con for-each: " + sumaForEach);

        // length es un campo, no un metodo: no lleva parentesis.
        int[] vacio = new int[0];
        System.out.println("arreglo vacio: length " + vacio.length + " · la suma de sus elementos es " + suma(vacio));

        // Reasignar un arreglo si se puede; lo que exige "new" es que no sea una declaracion.
        int[] salida = new int[5];
        salida = new int[] {1250, 3400, 890};
        System.out.println("reasignado: empezo con length 5, ahora length " + salida.length + " · [0] = " + salida[0]);
    }

    static int suma(int[] v) {
        int s = 0;
        for (int x : v) {
            s += x;
        }
        return s;
    }
}
