// Java · M5 · Tema 4 · ejemplo 3
// El contador `static` es estado GLOBAL del programa: lo que imprime depende de lo que ya ocurrio antes,
// y no se apaga cuando los objetos desaparecen.
public class ContadorCompartido {

    static class Solicitud {
        static int secuencial = 0;              // la CLASE lleva la cuenta, no el objeto
        final String guia;
        final int id;

        Solicitud(String guia) {
            this.guia = guia;
            this.id = ++secuencial;
        }

        public String toString() {
            return "#" + id + " · " + guia;
        }
    }

    // el remedio: quien lleva la cuenta es UN OBJETO que tu repartes
    static class Secuenciador {
        private int ultimo;

        int siguiente() {
            return ++ultimo;
        }
    }

    static class SolicitudLocal {
        final String guia;
        final int id;

        SolicitudLocal(Secuenciador quien, String guia) {
            this.guia = guia;
            this.id = quien.siguiente();
        }

        public String toString() {
            return "#" + id + " · " + guia;
        }
    }

    static void consultaQueTambienCrea(String etiqueta) {
        System.out.println("      " + etiqueta + " · por dentro crea " + new Solicitud("RF-000999"));
    }

    public static void main(String[] args) {
        System.out.println("bloque A · una consulta y despues dos altas");
        consultaQueTambienCrea("consulta");
        System.out.println("      alta 1: " + new Solicitud("RF-000123"));
        System.out.println("      alta 2: " + new Solicitud("RF-000124"));

        System.out.println("paso · el contador no depende de los objetos vivos");
        for (int i = 0; i < 500; i++) {
            new Solicitud("RF-temporal");
        }
        System.out.println("      500 solicitudes ya inexistentes: la clase sigue en " + Solicitud.secuencial);

        System.out.println("bloque B · el MISMO codigo, con la consulta al final");
        Solicitud.secuencial = 0;                // no es final: se puede escribir a mano
        System.out.println("      alta 1: " + new Solicitud("RF-000123"));
        System.out.println("      alta 2: " + new Solicitud("RF-000124"));
        consultaQueTambienCrea("consulta");
        System.out.println("      la misma guia RF-000999 salio antes con #1 y ahora con #3");

        System.out.println("remedio · la cuenta la lleva un objeto, y cada objeto empieza en 1");
        Secuenciador uno = new Secuenciador();
        Secuenciador otro = new Secuenciador();
        System.out.println("      mostrador 1: " + new SolicitudLocal(uno, "RF-000123"));
        System.out.println("      mostrador 2: " + new SolicitudLocal(otro, "RF-000123"));
        System.out.println("      y para reventar el numero de A hay que llamar a su metodo, no escribirlo");
    }
}
