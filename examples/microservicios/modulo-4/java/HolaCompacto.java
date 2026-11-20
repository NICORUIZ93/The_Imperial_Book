// Módulo 0.5 · «Hola Mundo» compacto: desde JDK 25 un archivo puede tener solo un método main (JEP 512).
// Requisitos: JDK 25 LTS (en JDK 21-24 esto no compila). Sin dependencias.
// Ejecuta (desde la carpeta java/):  java HolaCompacto.java
void main() {
    IO.println("Hola Mundo compacto desde Java " + Runtime.version().feature());
}
