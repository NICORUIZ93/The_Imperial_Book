// Java · M5 · Tema 5 · los `;` sueltos de §7.6
// «Extra ';' tokens ... have no effect on the meaning of the compilation unit»: entre las dos clases hay dos
// punto y coma que javac traga sin avisar, y las dos clases salen al árbol de clases igual.
package puntocoma;

class Una {}
;
class Otra {
    Una una = new Una();
}
