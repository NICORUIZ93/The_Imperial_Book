// M1 · Tema 2 · nivel maestro: la identidad de un objeto no depende de su contenido.
// Ejecuta: java Identidad.java
void main() {
    var a = new StringBuilder("RF-1");
    var b = a;
    var c = new StringBuilder("RF-1");
    IO.println("a y b, ¿misma identidad? " + (System.identityHashCode(a) == System.identityHashCode(b)));
    IO.println("a y c, ¿misma identidad? " + (System.identityHashCode(a) == System.identityHashCode(c)));
}
