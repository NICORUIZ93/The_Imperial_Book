// Java · M5 · Tema 4 · por dentro 1
// Que es `static` dentro del .class: la bandera ACC_STATIC, el atributo ConstantValue y las
// instrucciones getstatic/putstatic/invokestatic. Se mira con javap -v -p y javap -c -p.
public class FlagsEstaticos {

    int destino;                                   // casilla del OBJETO
    static int contador;                           // casilla de la CLASE
    static final int CONSTANTE = 42;               // variable constante: vive en el atributo ConstantValue
    static final long VIVA = System.nanoTime();    // `final` sin ser constante: se calcula en <clinit>

    interface Topes {
        int LIMITE = 25000;                        // implicitamente public static final
    }

    static int sumar(int a, int b) {               // sin this: el primer parametro cae en la ranura 0
        contador = contador + a + b;
        return contador;
    }

    int mover(int paso) {                          // con this: el parametro cae en la ranura 1
        destino = destino + paso;
        return destino;
    }

    void usarLosDos() {
        mover(2);
        FlagsEstaticos.sumar(1, 4);
    }

    public static void main(String[] args) {
        System.out.println("constante=" + CONSTANTE + " · viva es positiva=" + (VIVA > 0));
        FlagsEstaticos f = new FlagsEstaticos();
        System.out.println("mover(5)  =" + f.mover(5) + " · contador=" + FlagsEstaticos.contador);
        System.out.println("sumar(1,2)=" + FlagsEstaticos.sumar(1, 2) + " · destino del objeto=" + f.destino);
        System.out.println("limite de la interface=" + Topes.LIMITE);
        f.usarLosDos();
        System.out.println("tras usar los dos: contador=" + FlagsEstaticos.contador + " · destino=" + f.destino);
    }
}
