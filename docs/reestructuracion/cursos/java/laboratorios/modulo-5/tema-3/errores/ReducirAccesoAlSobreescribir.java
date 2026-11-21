// M5 · Tema 3 · error 5 de 6: al sobreescribir se puede AMPLIAR el acceso, nunca reducirlo.
// javac --release 25 -d out -cp /tmp/t3out errores/ReducirAccesoAlSobreescribir.java
// §8.4.8.3: «The access modifier of an overriding or hiding method must provide at least as much access
// as the overridden or hidden method». Envio.pesar es public; hacerlo private aqui romperia la sustitucion
// de Liskov en el propio compilador: cualquier codigo con una referencia Envio ya no podria llamarlo.
package afuera;

import bodega.Envio;

class ReducirAccesoAlSobreescribir extends Envio {
    ReducirAccesoAlSobreescribir(String codigo) {
        super(codigo);
    }

    @Override
    private void pesar(int nuevo) {
        System.out.println("nadie deberia poder llamarme desde fuera");
    }
}
