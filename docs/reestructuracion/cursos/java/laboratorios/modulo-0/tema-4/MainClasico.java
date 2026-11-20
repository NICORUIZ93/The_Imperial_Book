// M0 · Tema 4 · la firma clásica: funciona en todas las versiones de Java.
// Ejecuta: java MainClasico.java Bogotá Medellín
public class MainClasico {
    public static void main(String[] args) {
        System.out.println("Argumentos recibidos: " + args.length);
        for (int i = 0; i < args.length; i++) {
            System.out.println("  args[" + i + "] = " + args[i]);
        }
    }
}
