// M3 · Tema 2 · switch sobre String y sobre char: el compilador resuelve primero el hash.
// Java 25. Ejecuta: java -Dstdout.encoding=UTF-8 CambiosYDias.java
public class CambiosYDias {
    static String zonaPorCiudad(String ciudad) {
        return switch (ciudad) {
            case "Bogotá" -> "norte";
            case "Cali" -> "occidente";
            case "Barranquilla", "Cartagena" -> "caribe";
            case null -> "sin ciudad";
            default -> "otra";
        };
    }

    // 'char' solo sirve para UNA unidad UTF-16; para dos digitos hace falta String.
    static int diasDelMes(String mes) {
        return switch (mes) {
            case "01", "03", "05", "07", "08", "10", "12" -> 31;
            case "04", "06", "09", "11" -> 30;
            case "02" -> 28;
            default -> 0;
        };
    }

    static char prioridad(char letra) {
        return switch (letra) {
            case 'A' -> 'P';
            case 'B', 'C' -> 'S';
            default -> 'R';
        };
    }

    public static void main(String[] args) {
        System.out.println("Bogotá -> " + zonaPorCiudad("Bogotá"));
        System.out.println("Cartagena -> " + zonaPorCiudad("Cartagena"));
        System.out.println("Medellín -> " + zonaPorCiudad("Medellín"));
        System.out.println("null -> " + zonaPorCiudad(null));
        System.out.println("02 -> " + diasDelMes("02") + " · 04 -> " + diasDelMes("04") + " · 13 -> " + diasDelMes("13"));
        System.out.println("A -> " + prioridad('A') + " · C -> " + prioridad('C') + " · Z -> " + prioridad('Z'));
    }
}
