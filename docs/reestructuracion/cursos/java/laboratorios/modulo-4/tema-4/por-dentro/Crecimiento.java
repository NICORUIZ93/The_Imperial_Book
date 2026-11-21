// M4 · Tema 4 · Por dentro · «se alarga sola» significa que NO se alarga en cada add.
// Ejecuta SIEMPRE con la apertura, o el programa se queja y sale con codigo 1:
//   java --add-opens java.base/java.util=ALL-UNNAMED Crecimiento.java
// Se lee el arreglo interno `elementData` de ArrayList por reflexion: es un detalle de esta JDK, no una regla
// del lenguaje, y por eso es la unica comprobacion del modulo que toca un campo privado de java.base.
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

public class Crecimiento {

    private static Field campo;

    static int hueco(List<String> lista) throws Exception {
        if (campo == null) {
            campo = ArrayList.class.getDeclaredField("elementData");
            campo.setAccessible(true);                 // sin --add-opens, esto lanza
        }
        return ((Object[]) campo.get(lista)).length;
    }

    public static void main(String[] args) throws Exception {
        List<String> guias = new ArrayList<>();
        try {
            hueco(guias);
        } catch (RuntimeException e) {
            System.out.println("sin la apertura no hay medida: " + e.getClass().getSimpleName()
                    + " · usa java --add-opens java.base/java.util=ALL-UNNAMED");
            System.exit(1);
        }

        System.out.println("recien creada : size " + guias.size() + " · hueco " + hueco(guias));
        guias.add("RF-000123");
        System.out.println("tras 1 add    : size " + guias.size() + " · hueco " + hueco(guias));
        for (int i = 0; i < 9; i++) guias.add("x");
        System.out.println("tras 10       : size " + guias.size() + " · hueco " + hueco(guias));
        guias.add("x");
        System.out.println("tras 11       : size " + guias.size() + " · hueco " + hueco(guias));
        for (int i = 0; i < 5; i++) guias.add("x");
        System.out.println("tras 16       : size " + guias.size() + " · hueco " + hueco(guias));
        System.out.println("los saltos    : " + (15 - 10) + " y " + (22 - 15)
                + " · cada salto es hueco viejo + hueco viejo/2");
    }
}
