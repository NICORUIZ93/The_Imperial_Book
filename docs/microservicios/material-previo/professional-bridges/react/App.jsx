import { useEffect, useState } from 'react';

function consultar(zona, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(`Envíos de ${zona}`), zona === 'norte' ? 900 : 100);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Cancelado', 'AbortError'));
    }, { once: true });
  });
}
export default function App() {
  const [zona, setZona] = useState('norte');
  const [estado, setEstado] = useState('Cargando');
  useEffect(() => {
    const controller = new AbortController();
    setEstado('Cargando');
    consultar(zona, controller.signal).then(setEstado).catch(error => {
      if (error.name !== 'AbortError') setEstado('No se pudo cargar');
    });
    return () => controller.abort(); // Retira el trabajo del render anterior.
  }, [zona]);
  return <main><h1>Consulta por zona</h1>
    <label htmlFor="zona">Zona</label>
    <select id="zona" value={zona} onChange={e => setZona(e.target.value)}>
      <option value="norte">Norte</option><option value="sur">Sur</option>
    </select><p role="status">{estado}</p></main>;
}
