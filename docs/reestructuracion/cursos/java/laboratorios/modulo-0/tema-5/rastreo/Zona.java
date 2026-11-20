// M0 · Tema 5 · la zona de reparto sale del último dígito de la guía.
public class Zona {
    static String deGuia(String numero) {
        int ultimoDigito = numero.charAt(numero.length() - 1) - '0';
        return ultimoDigito % 2 == 0 ? "norte" : "sur";
    }
}
