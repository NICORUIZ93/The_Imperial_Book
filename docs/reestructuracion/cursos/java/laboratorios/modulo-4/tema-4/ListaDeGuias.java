// M4 · Tema 4 · ArrayList: se alarga solo, y quitar por INDICE o por VALOR no es lo mismo.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out ListaDeGuias
import java.util.ArrayList;
import java.util.List;

public class ListaDeGuias {
    public static void main(String[] args) {
        List<String> guias = new ArrayList<>();
        System.out.println("vacia                    : size " + guias.size() + " · isEmpty " + guias.isEmpty());

        guias.add("RF-000123");
        guias.add("RF-000124");
        guias.add("RF-000125");
        System.out.println("tras 3 add               : " + guias);

        guias.add(1, "RF-000123B");                  // insertar desplaza, no sustituye
        System.out.println("add(1, ...)              : " + guias);
        System.out.println("que habia en el 2?       : " + guias.get(2));

        System.out.println("contiene / indexOf       : " + guias.contains("RF-000125")
                + " / " + guias.indexOf("RF-000125") + " · ausente " + guias.indexOf("RF-999999"));

        // Los DOS remove existen: uno pide indice (int), el otro pide valor (Object).
        String quitada = guias.remove(0);            // remove(int)  -> por posicion
        System.out.println("remove(0) por posicion   : devolvio " + quitada + " · queda " + guias);
        boolean salio = guias.remove("RF-000124");   // remove(Object) -> por valor
        System.out.println("remove(\"RF-000124\")     : " + salio + " · queda " + guias);

        // Con numeros el empate es traicionero: remove(1) es el INDICE 1, no el valor 1.
        List<Integer> pesos = new ArrayList<>();
        pesos.add(10);
        pesos.add(1);
        pesos.add(7);
        pesos.remove(1);                             // quita el 1 porque esta en la posicion 1
        System.out.println("pesos.remove(1)          : " + pesos + " · quito la POSICION");
        pesos.remove(Integer.valueOf(7));            // para quitar por VALOR hay que empaquetar
        System.out.println("remove(Integer.valueOf(7)): " + pesos);

        // Se puede crecer de golpe y vaciar sin dejar la variable muerta.
        guias.addAll(java.util.List.of("RF-000200", "RF-000201"));
        System.out.println("addAll                   : size " + guias.size() + " · " + guias);
        guias.clear();
        System.out.println("clear                    : size " + guias.size() + " · isEmpty " + guias.isEmpty());
    }
}
