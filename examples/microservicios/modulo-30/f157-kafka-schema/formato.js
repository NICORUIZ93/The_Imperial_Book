// Módulo 26 · F157 · Formato de cable de Confluent: byte 0 = 0 (magic byte), bytes 1-4 = id del esquema (big-endian),
// después el dato en Avro binario. Así viaja cada mensaje cuando usas Schema Registry.
export function codificar(idEsquema, tipo, valor) {
  const cabecera = Buffer.alloc(5);
  cabecera.writeUInt8(0, 0);
  cabecera.writeUInt32BE(idEsquema, 1);
  return Buffer.concat([cabecera, tipo.toBuffer(valor)]);
}

// buscarTipo(id) → tipo Avro del ESCRITOR (en la vida real, GET /schemas/ids/{id} con caché).
// Si el consumidor tiene su propio esquema (lector), se resuelve escritor → lector.
export function decodificar(buffer, buscarTipo, lector) {
  if (buffer.readUInt8(0) !== 0) throw new Error(`magic byte desconocido: ${buffer.readUInt8(0)}`);
  const escritor = buscarTipo(buffer.readUInt32BE(1));
  const datos = buffer.subarray(5);
  return lector ? lector.fromBuffer(datos, lector.createResolver(escritor)) : escritor.fromBuffer(datos);
}
