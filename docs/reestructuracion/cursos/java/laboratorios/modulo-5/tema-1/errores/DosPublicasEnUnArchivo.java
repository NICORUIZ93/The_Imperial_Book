// M5 · Tema 1 · error 4: un archivo fuente puede llevar UNA clase public, y debe llamarse como ella.
// Java 25. Esperado: NO compila. javac --release 25 -d out errores/DosPublicasEnUnArchivo.java
public class DosPublicasEnUnArchivo {
}

public class Guia {                      // mal: segunda public en un archivo que se llama distinto
    String codigo;
}
