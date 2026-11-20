// Test de Diferencias.java sin librerías (JUnit llega en la Fase 1).
// Requisitos: JDK 25 LTS (funciona desde JDK 22).
// Ejecuta (desde la carpeta java/):  java DiferenciasTest.java

public class DiferenciasTest {
    static int fallos = 0;

    static void verificar(String nombre, boolean ok) {
        System.out.println((ok ? "✔ " : "✖ ") + nombre);
        if (!ok) fallos++;
    }

    public static void main(String[] args) throws Exception {
        verificar("sumar(2, 2) es 4", Diferencias.sumar(2, 2) == 4);
        verificar("convertir('42') da número 42", Diferencias.convertir("42").equals("número 42"));
        verificar("convertir('cuarenta') atrapa la excepción", Diferencias.convertir("cuarenta").startsWith("error"));
        long ms = Diferencias.tresTareasEnParalelo();
        verificar("3 tareas de 1 s en paralelo tardan menos de 1.5 s (tardaron " + (ms < 1500 ? "menos" : ms + " ms") + ")", ms < 1500);
        System.out.println(fallos == 0 ? "Java: todos los tests pasaron" : "Java: " + fallos + " test(s) fallaron");
        System.exit(fallos == 0 ? 0 : 1);
    }
}
