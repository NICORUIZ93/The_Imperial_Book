const form = document.querySelector('#consulta');
const input = document.querySelector('#codigo');
const status = document.querySelector('#estado');
form.addEventListener('submit', event => {
  event.preventDefault(); // Conserva la página y el texto recibido.
  const code = input.value.trim();
  const valid = /^ENV-\d+$/.test(code);
  input.setAttribute('aria-invalid', String(!valid));
  status.textContent = valid
    ? `Formato válido: ${code}. Aún no se consultó una entrega.`
    : 'Corrige el código: debe empezar por ENV- y terminar en dígitos.';
  if (!valid) input.focus();
});
