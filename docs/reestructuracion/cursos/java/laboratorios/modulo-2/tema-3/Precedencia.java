// tema-3/Precedencia.java — el operador + es left-to-right, y con un char de por medio pasa a ser suma entera.
// Ejecutar: javac --release 25 -d out tema-3/Precedencia.java && java -cp out Precedencia
public class Precedencia {

    public static void main(String[] args) {
        System.out.println("\"RF\" + 1 + 2        : " + ("RF" + 1 + 2));
        System.out.println("\"RF\" + (1 + 2)      : " + ("RF" + (1 + 2)));
        System.out.println("1 + 2 + \"RF\"        : " + (1 + 2 + "RF"));
        System.out.println("'A' + 1              : " + ('A' + 1));
        System.out.println("\"RF\" + 'A'          : " + ("RF" + 'A'));
        System.out.println("1 + 2 + \"\"          : " + (1 + 2 + ""));
        System.out.println("null + \"RF\"         : " + (null + "RF"));
        System.out.println("\"RF\" + null         : " + ("RF" + null));
        System.out.println("String.valueOf(null): " + String.valueOf((Object) null));

        // El mismo error en un caso real: unir código de envío y peso.
        String guia = "RF";
        int peso = 2500;
        System.out.println("guia + peso          : " + (guia + peso));
        System.out.println("guia + 1000 + peso   : " + (guia + 1000 + peso));
        System.out.println("guia + (1000 + peso) : " + (guia + (1000 + peso)));
    }
}
