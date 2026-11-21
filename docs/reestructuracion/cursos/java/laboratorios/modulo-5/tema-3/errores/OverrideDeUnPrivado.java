// M5 · Tema 3 · error 6 de 6: el aviso que convierte en ruido el segundo fallo silencioso del tema.
// javac --release 25 -d out -cp /tmp/t3out errores/OverrideDeUnPrivado.java
// En src/afuera/Ruta.java, comprueba(int) convive con el comprueba(int) PRIVATE de Envio y no pasa nada:
// no es una sobreescritura, es un metodo nuevo (§8.2, los privados no se heredan). Anotar @Override es lo
// unico que obliga al compilador a decirlo. Sin la anotacion, la red de seguridad del herede jamas se ejecuta.
package afuera;

import bodega.Envio;

class OverrideDeUnPrivado extends Envio {
    OverrideDeUnPrivado(String codigo) {
        super(codigo);
    }

    @Override
    public void comprueba(int nuevo) {
        System.out.println("esta version mas estricta no sustituye a nada");
    }
}
