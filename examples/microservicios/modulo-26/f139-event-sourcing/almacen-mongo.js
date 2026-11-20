// Módulo 22 · F139 · Almacén de eventos sobre MongoDB 9.0.8 con el driver oficial mongodb 7.9.1.
// Diseño «un documento por commit»: cada anexar() guarda UN documento con TODOS sus eventos. En MongoDB la escritura
// de un documento es atómica, así que un commit se guarda entero o no se guarda (sin transacciones ni replica set).
//   { _id: 'pedido-P1@3', stream: 'pedido-P1', desde: 3, hasta: 4, posicion: 17, eventos: [{tipo, datos, en}, …] }
// Concurrencia optimista: _id = stream@versión-inicial es ÚNICO. Si dos escritores leyeron la versión 2 e intentan
// escribir desde la 3, el segundo choca con E11000 (duplicate key) → ConflictoDeConcurrencia.
export class ConflictoDeConcurrencia extends Error { name = 'ConflictoDeConcurrencia'; }

export class AlmacenEventosMongo {
  constructor(db) {
    this.commits = db.collection('f139_commits');
    this.contadores = db.collection('f139_contadores');
  }

  async preparar() {
    await this.commits.createIndex({ stream: 1, desde: 1 });   // leer un stream en orden
    await this.commits.createIndex({ posicion: 1 }, { unique: true }); // leer TODO en orden (proyecciones, F140)
  }

  async leerStream(stream) {
    const commits = await this.commits.find({ stream }).sort({ desde: 1 }).toArray();
    const eventos = commits.flatMap((c) => c.eventos);
    return { eventos, version: commits.at(-1)?.hasta ?? 0 };
  }

  async anexar(stream, versionEsperada, eventos) {
    const actual = await this.commits.find({ stream }).sort({ desde: -1 }).limit(1).next();
    if ((actual?.hasta ?? 0) !== versionEsperada) {
      throw new ConflictoDeConcurrencia(`${stream}: esperabas la versión ${versionEsperada} y va por la ${actual?.hasta ?? 0}`);
    }
    // Posición global: un contador atómico ($inc). Da un orden total para las proyecciones (ver la ficha: tiene huecos
    // si un commit falla y no garantiza que se HAGAN VISIBLES en orden con escritores concurrentes).
    const { valor: posicion } = await this.contadores.findOneAndUpdate({ _id: 'posicion' }, { $inc: { valor: 1 } },
      { upsert: true, returnDocument: 'after' });
    const desde = versionEsperada + 1;
    try {
      await this.commits.insertOne({
        _id: `${stream}@${desde}`, stream, desde, hasta: versionEsperada + eventos.length, posicion,
        eventos: eventos.map((e) => ({ ...e, en: new Date() })),
      });
    } catch (error) {
      if (error.code === 11000) throw new ConflictoDeConcurrencia(`${stream}: otro escritor anexó la versión ${desde} primero`);
      throw error;
    }
    return versionEsperada + eventos.length;
  }

  // Para las proyecciones (F140): commits con posición > desde, en orden global.
  async leerDesde(desde, limite = 100) {
    return this.commits.find({ posicion: { $gt: desde } }).sort({ posicion: 1 }).limit(limite).toArray();
  }
}
