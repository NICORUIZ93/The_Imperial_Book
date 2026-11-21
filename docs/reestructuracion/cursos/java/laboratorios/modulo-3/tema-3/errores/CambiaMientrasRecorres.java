// M3 · Tema 3 · mutar la coleccion mientras la recorre un for-each: el iterador se defiende.
// Java 25. Ejecuta: javac --release 25 -d out CambiaMientrasRecorres.java && java -cp out CambiaMientrasRecorres
public class CambiaMientrasRecorres {
    public static void main(String[] args) {
        java.util.List<String> colas = new java.util.ArrayList<>();
        colas.add("bogota"); colas.add("medellin"); colas.add("cali");
        for (String c : colas) {
            if (c.equals("bogota")) colas.remove("medellin"); // la lista cambia sin avisar al Iterator
            System.out.println("procesando " + c);
        }
        System.out.println("esta linea no se imprime: el bucle no llega a terminar");
    }
}
