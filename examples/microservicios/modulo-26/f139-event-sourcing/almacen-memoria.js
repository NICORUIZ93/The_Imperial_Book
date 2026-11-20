// Módulo 22 · F139 · El mismo almacén en memoria, con las MISMAS reglas que el de MongoDB (versión esperada,
// _id único por stream@versión, posición global). Sirve para los tests sin Docker y para F140.
import { ConflictoDeConcurrencia } from './almacen-mongo.js';
export { ConflictoDeConcurrencia };

export class AlmacenEventosMemoria {
  commits = new Map();   // _id → commit (como la colección)
  posicion = 0;
  async preparar() {}

  async leerStream(stream) {
    const commits = [...this.commits.values()].filter((c) => c.stream === stream).sort((a, b) => a.desde - b.desde);
    return { eventos: commits.flatMap((c) => c.eventos), version: commits.at(-1)?.hasta ?? 0 };
  }

  async anexar(stream, versionEsperada, eventos) {
    const { version } = await this.leerStream(stream);
    await Promise.resolve(); // como en la red: entre leer y escribir puede colarse otro escritor
    if (version !== versionEsperada) throw new ConflictoDeConcurrencia(`${stream}: esperabas la versión ${versionEsperada} y va por la ${version}`);
    const desde = versionEsperada + 1;
    const _id = `${stream}@${desde}`;
    const posicion = ++this.posicion;
    if (this.commits.has(_id)) throw new ConflictoDeConcurrencia(`${stream}: otro escritor anexó la versión ${desde} primero`); // E11000
    this.commits.set(_id, { _id, stream, desde, hasta: versionEsperada + eventos.length, posicion,
      eventos: eventos.map((e) => ({ ...e, en: new Date() })) });
    return versionEsperada + eventos.length;
  }

  async leerDesde(desde, limite = 100) {
    return [...this.commits.values()].filter((c) => c.posicion > desde).sort((a, b) => a.posicion - b.posicion).slice(0, limite);
  }
}
