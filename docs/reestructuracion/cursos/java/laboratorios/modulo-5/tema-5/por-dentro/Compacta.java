// Java · M5 · Tema 5 · unidad de compilacion compacta (JEP 512, JDK 25)
// OJO con el mito: un archivo que son SOLO enunciados ya no existe (medido: `error: no class declared in
// source file`). Lo que finalizo el JDK 25 fue la clase implicita con ENUNCIADOS Y AL MENOS UN METODO.
// La gramatica (JLS 7.3) no admite `package` aqui, asi que la clase cae en el paquete sin nombre, y por
// ser compacta se importa `module java.base` de forma implicita: `ArrayList` esta sin escribir un import.
void main() {
    var nombres = new ArrayList<String>();
    nombres.add("compacta");
    nombres.add("sin una linea de import");
    System.out.println("compacta             : " + nombres);
    System.out.println("clase que me cargo    : " + getClass().getName());
    System.out.println("paquete donde caigo   : [" + getClass().getPackageName() + "]");
}
