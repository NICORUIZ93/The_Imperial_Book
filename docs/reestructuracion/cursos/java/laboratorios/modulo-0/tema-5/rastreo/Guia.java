// M0 · Tema 5 · valida el formato de un número de guía: RF- y seis dígitos.
public class Guia {
    static boolean esValida(String numero) {
        return numero.matches("RF-\\d{6}");
    }
}
