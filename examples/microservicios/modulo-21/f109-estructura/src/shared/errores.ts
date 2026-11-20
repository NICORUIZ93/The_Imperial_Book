// shared/: código sin reglas de negocio que cualquier módulo puede usar. Debe ser pequeño y estable.
export class ErrorDeDominio extends Error {
  readonly codigo: string;
  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.name = 'ErrorDeDominio';
    this.codigo = codigo;
  }
}

export class NoEncontrado extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'NoEncontrado';
  }
}
