// sonda/SondaCompacta.java — archivo fuente compacto (JEP 512): sin clase declarada, main de instancia.
// Aquí el archivo es compacto (sin class), pero EN JDK 25 hay que calificar: IO.println / IO.readln.
// Sin el «IO.» no compila; verlo en sonda/SondaSinCalificar.java (misma sonda, sin calificar, falla).
// Ejecutar: javac --release 25 -encoding UTF-8 -d out sonda/SondaCompacta.java
//           java -cp out SondaCompacta
void main() {
    IO.println("compacto: sin clase, sin main(String[]), sin «IO.»");
    String s = IO.readln("dime algo> ");
    IO.println("leído    : «" + s + "»");
}
