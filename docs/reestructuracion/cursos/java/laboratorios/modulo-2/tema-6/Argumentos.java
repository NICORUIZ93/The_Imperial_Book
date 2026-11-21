// tema-6/Argumentos.java — los argumentos del programa: un array de texto que llega tal cual del shell.
// Ejecutar: javac --release 25 -d out tema-6/Argumentos.java
//           java -cp out Argumentos --guia=RF-000123 --destino=Bogotá 2500
//           java -cp out Argumentos                        (sin nada: uso y código 64)
//           java -cp out Argumentos --peso=2.500           (el shell ya quitó las comillas de los espacios)
//           java -cp out Argumentos "Bogotá Centro" 2500   (una sola pieza porque va entre comillas)
public class Argumentos {

    static String valorDe(String prefijo, String[] args, String porDefecto) {
        for (String a : args) {
            if (a.startsWith(prefijo + "=")) {
                return a.substring(prefijo.length() + 1);
            }
        }
        return porDefecto;
    }

    public static void main(String[] args) {
        System.out.println("args.length        : " + args.length);
        for (int i = 0; i < args.length; i++) {
            System.out.println("  args[" + i + "]        : «" + args[i] + "» · " + args[i].length() + " char · "
                    + args[i].codePointCount(0, args[i].length()) + " code points");
        }

        if (args.length == 0) {
            System.err.println("Uso: java Argumentos [--guia=TEXTO] [--destino=TEXTO] [peso-en-gramos]");
            System.exit(64);
        }

        String guia = valorDe("--guia", args, "sin-guía");
        String destino = valorDe("--destino", args, "Bogotá");
        System.out.println("guía (--guia)      : " + guia + " · ¿la dio el shell? " + !guia.equals("sin-guía"));
        System.out.println("destino            : " + destino);

        String ultimo = args[args.length - 1];
        boolean esNumero = !ultimo.isEmpty();
        for (int i = 0; i < ultimo.length(); i++) {
            if (!Character.isDigit(ultimo.charAt(i))) {
                esNumero = false;
            }
        }
        System.out.println("último argumento   : «" + ultimo + "» · ¿solo dígitos? " + esNumero);
        if (esNumero) {
            System.out.println("peso interpretado  : " + Integer.parseInt(ultimo) + " g");
        } else {
            System.out.println("peso               : no es un número; no se toca Integer.parseInt");
        }

        System.out.println("unidos con espacios: " + String.join(" | ", args));
    }
}
