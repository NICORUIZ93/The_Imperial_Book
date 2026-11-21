// M3 · Tema 2 · error: `long` no es un tipo de switch en Java 25, y el mensaje no dice eso.
// Java 25. Ejecuta (debe fallar al compilar): javac --release 25 SobreLong.java
// Medido aqui: javac responde «primitive patterns are a preview feature and are disabled by default»,
// porque un selector de long SOLO podria ser valido como switch de patrones, y eso sigue en preview.
// Y no se puede comprobar el preview con esta bandera: «javac --release 25 --enable-preview» se niega
// con «invalid source release 25 with --enable-preview (preview language features are only supported
// for release 27)». En LargoConCaseInt.java esta el caso que si muestra el motivo de una vez.
public class SobreLong {
    static int m(long gramos) {
        switch (gramos) {
            case 1L: return 1;
            default: return 0;
        }
    }
}
