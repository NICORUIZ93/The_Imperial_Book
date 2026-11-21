// M3 · Tema 3 · el mismo bug de mutar la lista, pero segun los datos PUEDE NO NOTARSE.
// Java 25. Ejecuta: javac --release 25 -d out BorraDetras.java && java -cp out BorraDetras
// Medido aqui: con TRES casillas y borrando la ultima, el iterador todavia cree que queda una
// vuelta y SI lanza (lineas 1 a 3 de la salida). Con DOS casillas y borrando la ultima, el
// hasNext siguiente dice que ya no hay nada, el next() que comprueba no se llama, y el bucle
// termina EN SILENCIO dejando la lista tocada. Por eso el ConcurrentModificationException
// parece intermitente: depende de cuantas casillas queden detras del cursor.
public class BorraDetras {
    static void tresCasillas() {
        java.util.List<String> colas = new java.util.ArrayList<>();
        colas.add("bogota"); colas.add("medellin"); colas.add("cali");
        try {
            for (String c : colas) {
                if (c.equals("bogota")) colas.remove("cali");   // la ULTIMA: aun asi falla
                System.out.println("  procesando " + c);
            }
            System.out.println("  termino sin excepcion");
        } catch (java.util.ConcurrentModificationException e) {
            System.out.println("  tres casillas, borrar la ultima -> ConcurrentModificationException");
        }
    }

    static void dosCasillas() {
        java.util.List<String> colas = new java.util.ArrayList<>();
        colas.add("bogota"); colas.add("medellin");
        for (String c : colas) {
            if (c.equals("bogota")) colas.remove("medellin");   // misma forma, una casilla menos
            System.out.println("  procesando " + c);
        }
        System.out.println("  dos casillas, borrar la ultima -> sin excepcion, quedan " + colas);
    }

    public static void main(String[] args) {
        System.out.println("tres casillas:");
        tresCasillas();
        System.out.println("dos casillas:");
        dosCasillas();
    }
}
