package academia.java;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.TreeMap;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * F017 · Java moderno en un solo archivo: records, sealed + pattern matching,
 * lambdas, streams y Optional. Se ejecuta tal cual con:
 *   java src/main/java/academia/java/JavaModerno.java
 */
public class JavaModerno {

    // 1. RECORD: una "ficha" de datos inmutable. Java genera constructor,
    //    accesores sku(), categoria(), precio(), equals, hashCode y toString.
    public record Producto(String sku, String categoria, BigDecimal precio) {
        // Constructor compacto: valida antes de asignar los campos.
        public Producto {
            Objects.requireNonNull(sku, "sku");
            if (precio.signum() < 0) {
                throw new IllegalArgumentException("precio negativo: " + precio);
            }
        }
    }

    public record Linea(Producto producto, int cantidad) {
        public BigDecimal subtotal() {
            return producto.precio().multiply(BigDecimal.valueOf(cantidad));
        }
    }

    // 2. SEALED + RECORDS: el compilador conoce TODAS las formas de pago,
    //    así que el switch de describir() no necesita "default".
    public sealed interface Pago permits Tarjeta, Transferencia, Efectivo { }
    public record Tarjeta(String ultimos4, int cuotas) implements Pago { }
    public record Transferencia(String banco) implements Pago { }
    public record Efectivo() implements Pago { }

    // 3. PATTERN MATCHING: desarma el record dentro del case (record patterns),
    //    añade condiciones con "when" e ignora componentes con "_".
    public static String describir(Pago pago) {
        return switch (pago) {
            case Tarjeta(var ultimos4, var cuotas) when cuotas > 1 ->
                "Tarjeta *" + ultimos4 + " a " + cuotas + " cuotas";
            case Tarjeta(var ultimos4, _) -> "Tarjeta *" + ultimos4 + " de contado";
            case Transferencia(var banco) -> "Transferencia desde " + banco;
            case Efectivo() -> "Efectivo contra entrega";
        };
    }

    // 4. STREAMS + LAMBDAS: tubería declarativa filtrar -> transformar -> reducir.
    public static BigDecimal total(List<Linea> lineas) {
        return lineas.stream()
            .map(Linea::subtotal)                      // referencia a método
            .reduce(BigDecimal.ZERO, BigDecimal::add); // suma con valor inicial
    }

    public static Map<String, BigDecimal> totalPorCategoria(List<Linea> lineas) {
        return lineas.stream().collect(Collectors.groupingBy(
            l -> l.producto().categoria(),             // lambda: clave del grupo
            TreeMap::new,                              // mapa ordenado por clave
            Collectors.reducing(BigDecimal.ZERO, Linea::subtotal, BigDecimal::add)));
    }

    public static List<String> skusCaros(List<Linea> lineas, BigDecimal umbral) {
        Predicate<Linea> esCaro = l -> l.producto().precio().compareTo(umbral) > 0;
        return lineas.stream()
            .filter(esCaro)
            .sorted(Comparator.comparing((Linea l) -> l.producto().precio()).reversed())
            .map(l -> l.producto().sku())
            .toList();                                  // lista inmodificable
    }

    // 5. OPTIONAL: "puede no haber resultado" queda escrito en el tipo.
    public static Optional<Producto> buscar(List<Linea> lineas, String sku) {
        return lineas.stream()
            .map(Linea::producto)
            .filter(p -> p.sku().equals(sku))
            .findFirst();
    }

    public static List<Linea> pedidoDeEjemplo() {
        var libro = new Producto("LIB-1", "libros", new BigDecimal("45000"));
        var cuaderno = new Producto("PAP-7", "papeleria", new BigDecimal("8000"));
        var audifonos = new Producto("TEC-3", "tecnologia", new BigDecimal("120000"));
        return List.of(new Linea(libro, 2), new Linea(cuaderno, 5), new Linea(audifonos, 1));
    }

    public static void main(String[] args) {
        var lineas = pedidoDeEjemplo();
        System.out.println("Total: " + total(lineas));
        System.out.println("Por categoría: " + totalPorCategoria(lineas));
        System.out.println("Caros (> 40000): " + skusCaros(lineas, new BigDecimal("40000")));
        System.out.println("Buscar TEC-3: " + buscar(lineas, "TEC-3").map(Producto::precio).orElse(BigDecimal.ZERO));
        System.out.println("Buscar XXX-0: " + buscar(lineas, "XXX-0").map(Producto::precio).orElse(BigDecimal.ZERO));
        for (Pago pago : List.of(new Tarjeta("4242", 3), new Tarjeta("1111", 1),
                                 new Transferencia("Banco Andino"), new Efectivo())) {
            System.out.println(describir(pago));
        }
    }
}
