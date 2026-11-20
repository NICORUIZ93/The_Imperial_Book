// Módulo 16 · F105 · Un módulo con efecto externo (en la vida real enviaría un correo). En los tests se reemplaza con jest.mock.
export async function enviarCorreo(destino: string, asunto: string): Promise<void> {
  throw new Error(`Sin servidor de correo configurado: no se pudo enviar «${asunto}» a ${destino}`);
}
