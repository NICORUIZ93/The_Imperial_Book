// M4 · Tema 3 · Por dentro · La comprobacion de aastore no se queda en la primera capa: baja por las dimensiones.
// Java 25. Ejecuta: javac --release 25 -d out *.java && java -Dstdout.encoding=UTF-8 -cp out MatrizCovariante
public class MatrizCovariante {
    public static void main(String[] args) {
        Object[][] vista = new String[2][];                 // component type real: String[]
        System.out.println("clase de la vista      : " + vista.getClass().getName()
                + " · componente real: " + vista.getClass().getComponentType().getName());

        try {
            vista[0] = new Integer[1];                      // un Integer[] NO es un String[]
            System.out.println("esta linea no se imprime: " + vista[0]);
        } catch (ArrayStoreException e) {
            System.out.println("rechaza una capa abajo  : ArrayStoreException · " + e.getMessage());
        }

        vista[1] = new String[] {"ok"};                     // esto si: String[] si es String[]
        System.out.println("casilla 1 admitida     : " + java.util.Arrays.toString((String[]) vista[1]));
        System.out.println("casilla 0 sigue siendo : " + vista[0]);
    }
}
