// M4 · Tema 3 · Por dentro · La lista no tiene guarda en la escritura: la hace javac, y si la enganas la paga el lector.
// Java 25. Ejecuta: javac -Xlint:unchecked --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out ListaSinGuarda
import java.util.ArrayList;
import java.util.List;

public class ListaSinGuarda {

    // El unico sitio donde alguien comprueba el tipo es la LECTURA: javac inserta ahi un checkcast.
    static String primero(List<String> guias) {
        return guias.get(0);
    }

    public static void main(String[] args) {
        List<Object> objetos = new ArrayList<>();
        objetos.add(42);                                  // nadie protesta: add(Object) es exactamente eso
        System.out.println("anadido sin excepcion   : " + objetos.size() + " elementos · un Integer");

        @SuppressWarnings("unchecked")
        List<String> trampa = (List<String>) (List<?>) objetos;   // dos casteos: javac ya no puede quejarse
        System.out.println("la trampa compila       : " + (trampa.size() == 1));
        System.out.println("mismo objeto en las dos : " + (objetos.get(0) == trampa.get(0)));

        try {
            System.out.println("esta linea no se imprime: " + primero(trampa));
        } catch (ClassCastException e) {
            System.out.println("revienta al leer        : " + e.getClass().getSimpleName());
            System.out.println("  nombra los dos tipos  : "
                    + (e.getMessage().contains("java.lang.Integer") && e.getMessage().contains("java.lang.String")));
        }
    }
}
