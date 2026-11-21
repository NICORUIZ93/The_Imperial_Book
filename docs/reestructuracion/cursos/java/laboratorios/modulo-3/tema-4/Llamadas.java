// M3 · Tema 4 · metodos: firma, retorno, sobrecarga y quien llama a quien.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out Llamadas
public class Llamadas {
    // Un metodo sin retorno: se declara void y no se puede escribir «return;» con valor.
    static void registrar(String guia) {
        System.out.println("  registrada " + guia);
        return;               // return a secas es legal en void: solo corta antes de tiempo
    }

    // La firma es nombre + tipos de los parametros. El tipo de retorno NO forma parte de la firma.
    static int tarifa(int gramos) {
        return gramos <= 1000 ? 9000 : gramos <= 5000 ? 13500 : 19000;
    }

    // Sobrecarga: mismo nombre, firma distinta.
    static int tarifa(int gramos, int zonas) {
        return tarifa(gramos) * zonas;
    }

    static double tarifa(double kilos) {
        return tarifa((int) (kilos * 1000)) / 1000.0;
    }

    // Un metodo de instancia ve los campos sin prefijo; desde main hay que crear el objeto.
    private final String conduccion = "ruta 12";
    static String desdeInstancia(Llamadas l) { return l.conduccion; }

    // Recursividad mutua: cada una llama a la otra, y la condicion de parada tiene que existir.
    static int esCero(int n) { return n == 0 ? 1 : esPar(n - 1); }
    static int esPar(int n)  { return n == 0 ? 1 : esCero(n - 1); }

    public static void main(String[] args) {
        registrar("RF-001");
        System.out.println("tarifa(int)        : " + tarifa(800));
        System.out.println("tarifa(int,int)    : " + tarifa(800, 2));
        System.out.println("tarifa(double)     : " + tarifa(0.8));
        System.out.println("campo de instancia : " + desdeInstancia(new Llamadas()));
        System.out.println("esCero(7) por recursividad mutua: " + esCero(7));
        // El return de un void no se puede asignar:
        // int x = registrar("RF-002");   -> error: void cannot be converted to int
    }
}
