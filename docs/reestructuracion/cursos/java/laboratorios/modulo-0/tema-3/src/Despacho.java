// M0 · Tema 3 · ejemplo realista: Despacho usa otra clase (Tarifa) que vive en su propio archivo.
// Java 25. Compila: javac -d out src/Despacho.java src/Tarifa.java · Ejecuta: java -cp out Despacho
public class Despacho {
    public static void main(String[] args) {
        int pesoGramos = 2500;
        int costo = Tarifa.costoEnPesos(pesoGramos);
        System.out.println("Envío de " + pesoGramos + " g: $" + costo);
    }
}
