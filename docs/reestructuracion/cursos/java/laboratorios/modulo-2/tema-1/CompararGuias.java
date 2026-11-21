// tema-1/CompararGuias.java — el fallo real: comparar texto con `==` en un buscador de envíos.
// Ejecutar: javac --release 25 -d out tema-1/CompararGuias.java && java -Dstdout.encoding=UTF-8 -cp out CompararGuias
public class CompararGuias {

    /** Versión mala: compara referencias. Solo acierta cuando ambos lados salieron del pool. */
    static String buscarMal(String guia) {
        if ("RF-000123" == guia) {
            return "Envio[RF-000123, Bogotá]";
        }
        if ("RF-000456" == guia) {
            return "Envio[RF-000456, Medellín]";
        }
        if ("RF-000789" == guia) {
            return "Envio[RF-000789, Cali]";
        }
        return null;
    }

    /** Versión buena: compara contenido. */
    static String buscarBien(String guia) {
        if ("RF-000123".equals(guia)) {
            return "Envio[RF-000123, Bogotá]";
        }
        if ("RF-000456".equals(guia)) {
            return "Envio[RF-000456, Medellín]";
        }
        if ("RF-000789".equals(guia)) {
            return "Envio[RF-000789, Cali]";
        }
        return null;
    }

    public static void main(String[] args) {
        String delPool = "RF-000456";
        String delFormulario = new String("RF-000456");

        System.out.println("contenido igual              : " + delPool.equals(delFormulario));
        System.out.println("misma referencia             : " + (delPool == delFormulario));

        // 1) Con un literal: la versión mala «funciona en mi máquina».
        System.out.println("buscarMal(literal)           : " + buscarMal("RF-000456"));

        // 2) El mismo texto llegado del exterior: otra referencia, mismo contenido.
        System.out.println("buscarMal(desde formulario)  : " + buscarMal(delFormulario));
        System.out.println("buscarBien(desde formulario) : " + buscarBien(delFormulario));

        // 3) Con nulo: equals se llama siempre sobre el lado que no es nulo.
        System.out.println("buscarMal(null)              : " + buscarMal(null));
        System.out.println("buscarBien(null)             : " + buscarBien(null));
        System.out.println("\"RF\".equalsIgnoreCase(\"rf\")    : " + "RF".equalsIgnoreCase("rf"));
    }
}
