// Módulo 0.3 · Java y Node.js lado a lado: sintaxis y ejecución
// El MISMO programa que node/tienda.js, escrito en Java. Compáralos línea a línea.
// Requisitos: JDK 25 LTS (funciona desde JDK 22). Sin dependencias.
// Ejecuta (desde la carpeta java/):  java Tienda.java
// O en dos pasos (compilar y luego ejecutar):  javac Tienda.java && java Tienda

import java.util.List;

public class Tienda { // En Java todo vive dentro de una clase.

    // Un "record" es una ficha con campos fijos y TIPOS declarados (String, int).
    record Producto(String nombre, int precio, int cantidad) {}

    // static = la función pertenece a la clase; int = devuelve un número entero.
    static int subtotal(Producto p) {
        return p.precio() * p.cantidad();
    }

    static int total(List<Producto> carrito) {
        int suma = 0; // variable con tipo: solo puede guardar enteros
        for (Producto p : carrito) {
            suma += subtotal(p);
        }
        return suma;
    }

    static String envio(int total) {
        if (total >= 50000) {
            return "gratis";
        }
        return "5000";
    }

    // main es la puerta de entrada: la JVM empieza a ejecutar aquí.
    public static void main(String[] args) {
        List<Producto> carrito = List.of(
                new Producto("Cuaderno", 6000, 3),
                new Producto("Lápiz", 1500, 4),
                new Producto("Mochila", 32000, 1));
        for (Producto p : carrito) {
            System.out.printf("%-9s x%d = %d%n", p.nombre(), p.cantidad(), subtotal(p));
        }
        int t = total(carrito);
        System.out.println("Total: " + t);
        System.out.println("Envío: " + envio(t));
    }
}
