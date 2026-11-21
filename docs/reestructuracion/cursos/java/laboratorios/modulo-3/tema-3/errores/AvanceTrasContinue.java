// M3 · Tema 3 · el bucle que no avanza: en un while, el continue se salta el i++ y no termina nunca.
// Java 25. Ejecuta: javac --release 25 -d out AvanceTrasContinue.java && java -cp out AvanceTrasContinue
// En el while el avance es una sentencia mas del cuerpo, asi que el continue la deja atras.
// En el for NO: la expresion de avance del for vive fuera del cuerpo y si se ejecuta.
// Se pone un guardia (MAX_VUELTAS) para que el ejemplo termine: sin el, el primero no para nunca.
public class AvanceTrasContinue {
    static final int MAX_VUELTAS = 12;

    static int whileRoto(String[] guias) {
        int i = 0, vueltas = 0;
        while (i < guias.length) {
            vueltas++;
            if (vueltas > MAX_VUELTAS) break;      // guardia: sin esto, esto no para nunca
            if (guias[i].isEmpty()) continue;       // <--- el continue se salta el i++ de abajo
            i++;
        }
        return vueltas;
    }

    static int whileCorregido(String[] guias) {
        int i = 0, vueltas = 0;
        while (i < guias.length) {
            vueltas++;
            if (vueltas > MAX_VUELTAS) break;
            String guia = guias[i];
            i++;                                    // avanzar ANTES de cualquier continue
            if (guia.isEmpty()) continue;
        }
        return vueltas;
    }

    static int forMismoBucle(String[] guias) {
        int vueltas = 0;
        for (int i = 0; i < guias.length; i++) {
            vueltas++;
            if (vueltas > MAX_VUELTAS) break;
            if (guias[i].isEmpty()) continue;       // aqui el i++ del for si llega a ejecutarse
        }
        return vueltas;
    }

    public static void main(String[] args) {
        String[] conVacia = {"1250", "", "3400"};
        System.out.println("while con continue delante del avance : " + whileRoto(conVacia) + " vueltas para 3 guias");
        System.out.println("while avanzando antes del continue     : " + whileCorregido(conVacia) + " vueltas");
        System.out.println("for con el mismo continue              : " + forMismoBucle(conVacia) + " vueltas");
    }
}
