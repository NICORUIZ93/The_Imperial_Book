// Java · M5 · Tema 4 · ejemplo 1
// `static`: el contador no vive en ningun objeto, y un metodo de clase se elige por el TIPO
// que tiene la variable en el fuente, no por el objeto que hay debajo.
public class CamposEstaticos {

    // UNO POR OBJETO
    String codigo;
    int gramos;

    // UNO SOLO PARA LA CLASE: no esta en la hoja de campos de ningun objeto
    static int creadas = 0;
    static int fueraDePeso = 0;

    static final int PESO_MAXIMO = 25000;   // variable constante: su valor se enlaza al compilar
    static int umbralVivo = 25000;          // la misma pinta, pero es una casilla de la clase

    CamposEstaticos(String codigo) {
        creadas++;                          // sin `this.`: escribe la casilla de la clase
        this.codigo = codigo;
    }

    // metodo de CLASE: no recibe `this`, solo ve los miembros de clase
    static String total() {
        return "creadas=" + creadas + " · fueraDePeso=" + fueraDePeso;
    }

    // metodo de instancia: ve lo suyo y lo de la clase
    String etiqueta() {
        return codigo + " · " + gramos + " g";
    }

    String describe() {
        return "padre";
    }

    void pesa(int gramos) {
        if (gramos > PESO_MAXIMO) fueraDePeso++;
        this.gramos = gramos;
    }

    static class Ruta extends CamposEstaticos {
        static int hitos = 0;

        Ruta(String codigo) {
            super(codigo);
            hitos++;
        }

        @Override String describe() {
            return "hijo";
        }

        // MISMA firma y `static`: esto OCULTA, no sustituye
        static String total() {
            return "creadas=" + creadas + " · hitos=" + hitos;
        }
    }

    // la forma de una clase de utilidad: metodos de clase y constructor que nadie puede llamar
    static final class Tarifas {
        private Tarifas() {
            throw new AssertionError("no se instancia");
        }

        static double recargo(boolean urgente) {
            return urgente ? 1.25 : 1.0;
        }
    }

    interface Topes {
        int LIMITE = 25000;                 // implicitamente public static final
    }

    public static void main(String[] args) {
        CamposEstaticos a = new CamposEstaticos("RF-000123");
        System.out.println("tras crear a           : " + total());
        CamposEstaticos b = new CamposEstaticos("RF-000124");
        System.out.println("tras crear b           : " + total() + "   (un contador, no dos)");
        System.out.println("lo de cada objeto      : " + a.codigo + " / " + b.codigo);
        System.out.println("los dos ven el mismo   : " + (a.creadas == b.creadas));

        a.pesa(30000);
        System.out.println("un golpe en lo de clase: " + total() + "   (a pesaba 30000, b no)");

        CamposEstaticos p = new Ruta("RF-000125");
        System.out.println("el objeto real         : " + p.getClass().getSimpleName());
        System.out.println("metodo de instancia    : " + p.describe() + "   (busca en el objeto)");
        System.out.println("metodo de clase        : " + p.total() + "   (busca en el tipo del fuente)");
        System.out.println("el mismo por su nombre : " + Ruta.total());

        CamposEstaticos nula = null;
        System.out.println("de clase via null      : " + nula.total());
        System.out.println("campo de clase via null: " + nula.creadas);
        try {
            System.out.println("de instancia via null  : " + nula.describe());
        } catch (NullPointerException e) {
            System.out.println("de instancia via null  : " + e.getClass().getSimpleName() + " · " + e.getMessage());
        }

        System.out.println("la constante           : " + PESO_MAXIMO + " · el umbral vivo: " + umbralVivo);
        System.out.println("en una interface       : " + Topes.LIMITE);
        System.out.println("utileria sin objetos   : " + Tarifas.recargo(true));
        try {
            new Tarifas();
        } catch (Throwable t) {
            System.out.println("su constructor privado : " + t.getClass().getSimpleName() + ": " + t.getMessage());
        }
    }
}
