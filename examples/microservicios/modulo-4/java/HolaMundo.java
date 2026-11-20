// Módulo 0.5 · Primer «Hola Mundo» en Java (forma clásica, la que verás en todo proyecto Spring Boot).
// Requisitos: JDK 25 LTS. Sin dependencias.
// Ejecuta (desde la carpeta java/):  java HolaMundo.java
public class HolaMundo {                       // 1. una clase con el MISMO nombre que el archivo
    public static void main(String[] args) {   // 2. main: la puerta de entrada del programa
        System.out.println("Hola Mundo desde Java " + Runtime.version().feature()); // 3. imprime y salta de línea
    }
}
