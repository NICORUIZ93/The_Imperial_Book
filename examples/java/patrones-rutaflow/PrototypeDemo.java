import java.util.ArrayList;
import java.util.List;

public class PrototypeDemo {
    static final class Paquete {
        private final String codigo;
        private final List<String> etiquetas;

        Paquete(String codigo, List<String> etiquetas) {
            this.codigo = codigo;
            this.etiquetas = new ArrayList<>(etiquetas);
        }

        Paquete copiar() {
            return new Paquete(codigo, etiquetas);
        }

        void agregarEtiqueta(String etiqueta) { etiquetas.add(etiqueta); }

        String resumen() { return codigo + ":" + String.join(",", etiquetas); }
    }

    public static void main(String[] args) {
        Paquete original = new Paquete("RF-7", List.of("fragil"));
        Paquete copia = original.copiar();
        copia.agregarEtiqueta("prioritario");
        System.out.println("original=" + original.resumen());
        System.out.println("copia=" + copia.resumen());
    }
}
