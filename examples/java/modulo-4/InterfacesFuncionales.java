import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.function.Supplier;
import java.util.stream.Stream;

public class InterfacesFuncionales {

    record Pedido(String id, String ciudad, long total) {}

    public static void main(String[] args) {
        List<Pedido> pedidos = List.of(
                new Pedido("P-1", "Bogotá", 120_000),
                new Pedido("P-2", "Cali", 45_000),
                new Pedido("P-3", "Bogotá", 80_000));

        Predicate<Pedido> esDeBogota = p -> p.ciudad().equals("Bogotá");   // decide
        Function<Pedido, String> resumen = p -> p.id() + " $" + p.total();  // transforma
        Consumer<String> imprimir = linea -> System.out.println("  " + linea); // actúa

        System.out.println("Pedidos de Bogotá:");
        pedidos.stream().filter(esDeBogota).map(resumen).forEach(imprimir);

        // Las interfaces se componen: and, negate, andThen.
        Predicate<Pedido> grande = p -> p.total() >= 100_000;
        System.out.println("Bogotá y no grandes: "
                + pedidos.stream().filter(esDeBogota.and(grande.negate())).map(resumen).toList());

        Function<Pedido, String> enMayusculas = resumen.andThen(String::toUpperCase);
        System.out.println("andThen: " + enMayusculas.apply(pedidos.get(1)));

        // Supplier: provee valores bajo demanda; Stream.generate los pide uno a uno.
        AtomicInteger contador = new AtomicInteger(1000);
        Supplier<String> siguienteGuia = () -> "GUIA-" + contador.incrementAndGet();
        System.out.println("Supplier: " + Stream.generate(siguienteGuia).limit(3).toList());
    }
}
