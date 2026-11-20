// M1 · Tema 1 · ejemplo mínimo: los ocho primitivos, su tamaño y su rango.
// Java 25. Ejecuta: java Rangos.java
public class Rangos {
    public static void main(String[] args) {
        System.out.println("byte    " + Byte.SIZE + " bits  " + Byte.MIN_VALUE + " a " + Byte.MAX_VALUE);
        System.out.println("short   " + Short.SIZE + " bits  " + Short.MIN_VALUE + " a " + Short.MAX_VALUE);
        System.out.println("int     " + Integer.SIZE + " bits  " + Integer.MIN_VALUE + " a " + Integer.MAX_VALUE);
        System.out.println("long    " + Long.SIZE + " bits  " + Long.MIN_VALUE + " a " + Long.MAX_VALUE);
        System.out.println("float   " + Float.SIZE + " bits  hasta " + Float.MAX_VALUE);
        System.out.println("double  " + Double.SIZE + " bits  hasta " + Double.MAX_VALUE);
        System.out.println("char    " + Character.SIZE + " bits  " + (int) Character.MIN_VALUE + " a " + (int) Character.MAX_VALUE);
        System.out.println("boolean true o false");

        int maximo = Integer.MAX_VALUE;
        System.out.println("MAX_VALUE + 1 = " + (maximo + 1));
    }
}
