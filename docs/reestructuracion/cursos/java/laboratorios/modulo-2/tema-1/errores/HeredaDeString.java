// tema-1/errores/HeredaDeString.java — «String» es final: nadie puede heredar de ella.
// Ejecutar (no compila a propósito): javac --release 25 -d out tema-1/errores/HeredaDeString.java
public class HeredaDeString {

    static class GuiaConValidacion extends String {
        GuiaConValidacion(String texto) {
            super(texto);
        }
    }

    public static void main(String[] args) {
        System.out.println(new GuiaConValidacion("RF-000123"));
    }
}
