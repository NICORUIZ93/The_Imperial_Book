// M4 · Tema 4 · Borrar sin romper el recorrido: iterador propio, removeIf, o copiar la lista antes.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out BorrarSinRomper
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class BorrarSinRomper {
    public static void main(String[] args) {
        List<String> base = new ArrayList<>(List.of("RF-000123", "RF-000124", "RF-000125", "RF-000900"));

        // 1) removeIf: el que menos codigo escribe y el que menos se equivoca.
        List<String> uno = new ArrayList<>(base);
        uno.removeIf(g -> g.endsWith("900"));
        System.out.println("removeIf                 : " + uno);

        // 2) iterator.remove(): borra desde el PROPIO iterador, con el que estas caminando.
        List<String> dos = new ArrayList<>(base);
        Iterator<String> it = dos.iterator();
        int visitados = 0;
        while (it.hasNext()) {
            String guia = it.next();
            visitados++;
            if (guia.endsWith("24")) {
                it.remove();                         // legal: borra lo que el iterador acaba de entregar
            }
        }
        System.out.println("iterator.remove          : visitados " + visitados + " · queda " + dos);

        // 3) recorrer una copia y borrar en la original.
        List<String> tres = new ArrayList<>(base);
        for (String guia : new ArrayList<>(tres)) {
            if (guia.endsWith("25")) {
                tres.remove(guia);
            }
        }
        System.out.println("recorrer una copia       : " + tres);

        // Y el for con indice al reves tambien vale, porque borrar solo mueve lo de despues.
        List<String> cuatro = new ArrayList<>(base);
        for (int i = cuatro.size() - 1; i >= 0; i--) {
            if (cuatro.get(i).endsWith("23")) {
                cuatro.remove(i);
            }
        }
        System.out.println("for con indice al reves  : " + cuatro);
    }
}
