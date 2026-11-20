// M1 · Tema 3 · nivel maestro: var no existe en el bytecode. Compara con SinVar.java.
public class ConVar {
    static int f() {
        var peso = 2500;
        var tope = 30_000;
        return peso + tope;
    }
}
