/**
 * Node 22+ define `localStorage` y `sessionStorage` como getters experimentales
 * que devuelven `undefined` cuando no se pasó `--localstorage-file`, y ese getter
 * tapa el almacenamiento que aporta jsdom. Los servicios de preferencias del
 * lector se apoyan en `localStorage`, así que el arnés lo instala en memoria.
 */
class AlmacenamientoEnMemoria implements Storage {
  private readonly datos = new Map<string, string>();

  get length(): number {
    return this.datos.size;
  }

  clear(): void {
    this.datos.clear();
  }

  getItem(clave: string): string | null {
    const valor = this.datos.get(clave);
    return valor === undefined ? null : valor;
  }

  key(indice: number): string | null {
    const clave = [...this.datos.keys()][indice];
    return clave === undefined ? null : clave;
  }

  removeItem(clave: string): void {
    this.datos.delete(clave);
  }

  setItem(clave: string, valor: string): void {
    this.datos.set(clave, String(valor));
  }
}

for (const nombre of ['localStorage', 'sessionStorage'] as const) {
  if (!globalThis[nombre]) {
    Object.defineProperty(globalThis, nombre, {
      value: new AlmacenamientoEnMemoria(),
      configurable: true,
      writable: true,
    });
  }
}
