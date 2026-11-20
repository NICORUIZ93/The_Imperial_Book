// Test de Tienda.java sin librerías: comprueba resultados y termina con código 1 si algo falla.
// (En la Fase 1 harás lo mismo con JUnit 5; aquí basta el JDK.)
// Requisitos: JDK 25 LTS (funciona desde JDK 22, que permite lanzar programas de varios archivos).
// Ejecuta (desde la carpeta java/):  java TiendaTest.java

import java.util.List;

public class TiendaTest {
    static int fallos = 0;

    static void verificar(String nombre, Object esperado, Object obtenido) {
        boolean ok = esperado.equals(obtenido);
        System.out.println((ok ? "✔ " : "✖ ") + nombre + (ok ? "" : " (esperado " + esperado + ", obtenido " + obtenido + ")"));
        if (!ok) fallos++;
    }

    public static void main(String[] args) {
        var carrito = List.of(
                new Tienda.Producto("Cuaderno", 6000, 3),
                new Tienda.Producto("Lápiz", 1500, 4),
                new Tienda.Producto("Mochila", 32000, 1));
        verificar("subtotal de 3 cuadernos", 18000, Tienda.subtotal(carrito.get(0)));
        verificar("total del carrito", 56000, Tienda.total(carrito));
        verificar("carrito vacío suma 0", 0, Tienda.total(List.of()));
        verificar("envío gratis desde 50000", "gratis", Tienda.envio(50000));
        verificar("envío con costo bajo 50000", "5000", Tienda.envio(49999));
        System.out.println(fallos == 0 ? "Java: todos los tests pasaron" : "Java: " + fallos + " test(s) fallaron");
        System.exit(fallos == 0 ? 0 : 1);
    }
}
