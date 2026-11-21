// M5 · Tema 1 · por dentro: `this` no cuesta una instruccion, y crear un objeto son tres pasos seguidos.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out CamposEnBytecode
// Volcado:          javap -c -p -cp out CamposEnBytecode   y   javap -v -p -cp out CamposEnBytecode$Punto
public class CamposEnBytecode {

    static class Punto {
        int x;
        int y;

        // Las dos metodos leen el MISMO campo; la unica diferencia es si el fuente escribe `this`.
        int conThis() {
            return this.x;
        }

        int sinThis() {
            return x;
        }

        void mover(int dx, int dy) {
            this.x = this.x + dx;
            this.y = this.y + dy;
        }

        // Crear un Punto dentro de otro metodo: new, dup, invokespecial en tres lineas de bytecode.
        static Punto cero() {
            return new Punto();
        }
    }

    public static void main(String[] args) {
        Punto p = new Punto();
        p.mover(3, 4);
        System.out.println("conThis/sinThis    : " + p.conThis() + " / " + p.sinThis() + " · mismo resultado");
        System.out.println("creado dentro      : " + Punto.cero().x + " (valor por defecto, nadie escribio)");

        // El puente con el modulo 4: un arreglo de objetos guarda REFERENCIAS, y las casillas vienen null.
        Punto[] tanda = new Punto[2];
        System.out.println("arreglo de Punto   : casilla 0 sin crear es null? " + (tanda[0] == null)
                + " · tras crearla, no: " + ((tanda[0] = new Punto()) != null));
    }
}
