// Java · M5 · Tema 5 · que ve la JVM del paquete y del modulo que lo exporta
// Dos paquetes del mismo trabajo, dos suertes distintas: `bodega` tiene su `package-info.class` anotado y
// `otra` no tiene archivo de paquete. Y del modulo se responde con `Module`, no con el archivo: el paquete
// propio no tiene modulo (el anonimo no tiene nombre), pero los que vinieron por `import module` si.
package reflejo;

import bodega.Envio;
import otra.Sello;

public class ReflejoDelPaquete {

    public static void main(String[] args) {
        Package anotado = Envio.class.getPackage();
        System.out.println("nombre anotado     : " + anotado.getName());
        System.out.println("toString           : " + anotado);
        System.out.println("esDeprecated       : " + anotado.isAnnotationPresent(Deprecated.class));
        System.out.println("anotaciones        : " + java.util.Arrays.toString(anotado.getAnnotations()));
        Package comun = Sello.class.getPackage();
        System.out.println("nombre sin archivo : " + comun.getName()
                + " · esDeprecated=" + comun.isAnnotationPresent(Deprecated.class)
                + " · lista=" + java.util.Arrays.toString(comun.getAnnotations()));
        System.out.println("getPackage igual   : " + (Package.getPackage("otra") == comun));
        System.out.println("nunca cargado      : " + Package.getPackage("nunca.cargado"));
        var de = java.sql.Driver.class.getModule();
        var aqui = ReflejoDelPaquete.class.getModule();
        System.out.println("modulo de Driver   : " + de.getName());
        System.out.println("modulo de lo mio   : " + aqui.getName());
        System.out.println("mi modulo lo lee   : " + aqui.canRead(de));
        System.out.println("exporta java.sql   : " + de.isExported("java.sql", aqui));
        System.out.println("exporta javax.sql  : " + de.isExported("javax.sql", aqui));
        System.out.println("exporta un invento : " + de.isExported("com.example", aqui));
    }
}
