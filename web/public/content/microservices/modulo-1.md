# Módulo 0.2 · Lógica de programación y pensamiento computacional

**Entorno de referencia (2026-05-22):** Node.js v24.18.0. Ejemplos ejecutables con Node estándar (`node`, módulos ES `.mjs`).

Este módulo cubre los ladrillos básicos de cualquier programa: variables, decisiones, operadores lógicos, repeticiones y funciones; y la forma de descomponer problemas en pasos verificables.

## Aprende construyendo

### Tema 1: Lógica de programación · Básico · 180 min

Caso guía: calcular el cobro de una fila de cine aplicando reglas por edad y validando entradas.

#### Variable y estado

**Definición formal.** Una variable es un nombre ligado a un valor en un ámbito; el estado es el conjunto de valores relevantes en un momento de ejecución.

**Para qué sirve.** Guardar datos y resultados intermedios.

**Cuándo usarlo y cuándo no.** Usa variables con nombres claros y ámbito mínimo. Evita mutación innecesaria cuando un valor derivado basta.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms1-var && cd /tmp/ms1-var
cat > var.mjs << 'JS'
let total = 0;
total += 8000;
total += 12000;
console.log(total);
JS
node var.mjs
```

**Caso de uso real.** Acumulador de total de pedido.

**Error común.** Reutilizar una variable para significados distintos. Síntoma: bugs difíciles de leer. Corrección: nombres específicos e inmutabilidad cuando sea posible.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `20000`.

#### Decisión (`if/else`) y guard clauses

**Definición formal.** Una decisión selecciona un camino de ejecución según una condición booleana.

**Para qué sirve.** Modelar reglas de negocio.

**Cuándo usarlo.** Cuando el comportamiento depende de condiciones. Usa guard clauses para validar entradas inválidas temprano.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms1-if && cd /tmp/ms1-if
cat > edad.mjs << 'JS'
function precioBoleto(edad) {
  if (edad < 0) throw new Error('edad negativa');
  if (edad < 12) return 8000;
  if (edad >= 60) return 7000;
  return 12000;
}
console.log(precioBoleto(8));
console.log(precioBoleto(60));
JS
node edad.mjs
```

**Caso de uso real.** Tarifas por segmento.

**Error común.** Error de borde: usar `>` en vez de `>=`. Síntoma: edad límite mal clasificada. Corrección: testear límites.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `8000`, `7000`.

#### Operadores lógicos

**Definición formal.** `&&`, `||`, `!` combinan o niegan expresiones booleanas; `&&` y `||` evalúan con cortocircuito.

**Para qué sirve.** Expresar reglas compuestas.

**Cuándo usarlo.** Cuando una decisión depende de múltiples condiciones. Evita expresiones densas sin paréntesis claros.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms1-bool && cd /tmp/ms1-bool
cat > bool.mjs << 'JS'
function puedeEntrar(edad, tieneBoleto, vaConAdulto) {
  return tieneBoleto && (edad >= 18 || vaConAdulto);
}
console.log(puedeEntrar(15, true, false));
console.log(puedeEntrar(15, true, true));
JS
node bool.mjs
```

**Caso de uso real.** Autorización por edad y acompañante.

**Error común.** Precedencia mal asumida. Corrección: paréntesis explícitos.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `false`, `true`.

#### Repetición (`for`)

**Definición formal.** Un bucle repite un bloque mientras recorre una colección o condición.

**Para qué sirve.** Procesar colecciones sin duplicar código.

**Cuándo usarlo.** Cuando la misma operación aplica a muchos elementos. Evita bucles con efectos ocultos complejos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms1-loop && cd /tmp/ms1-loop
cat > loop.mjs << 'JS'
function cobrarFila(edades) {
  let total = 0;
  for (const edad of edades) total += edad < 12 ? 8000 : 12000;
  return total;
}
console.log(cobrarFila([8, 25, 15]));
JS
node loop.mjs
```

**Caso de uso real.** Cobrar carrito, procesar lote.

**Error común.** Off-by-one o mutar colección mientras iteras. Corrección: iterar claramente y testear casos vacíos/borde.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `32000`.

#### Función y contrato pequeño

**Definición formal.** Una función es una unidad reutilizable con entradas, comportamiento y salida/efecto definido.

**Para qué sirve.** Nombrar, reutilizar y probar lógica.

**Cuándo usarlo.** Cuando un bloque tiene propósito claro. No crees funciones con múltiples responsabilidades ocultas.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms1-fn && cd /tmp/ms1-fn
cat > fn.mjs << 'JS'
export function precioBoleto(edad) { if (edad < 0) throw new Error('edad negativa'); return edad < 12 ? 8000 : edad >= 60 ? 7000 : 12000; }
console.log(precioBoleto(30));
JS
node fn.mjs
```

**Caso de uso real.** Reglas de pricing.

**Error común.** Función sin validar input. Síntoma: estados imposibles. Corrección: validación/guard clause.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `12000`.

### Tema 2: Pensamiento computacional · Básico · 180 min

Caso guía: convertir un problema de cambio de moneda en pasos algorítmicos verificables.

#### Descomposición

**Definición formal.** Dividir un problema en subproblemas más pequeños y manejables.

**Para qué sirve.** Reduce complejidad y permite probar por partes.

**Cuándo usarlo.** Cuando el problema tiene múltiples reglas o pasos.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms1-decomp && cd /tmp/ms1-decomp
cat > decomp.mjs << 'JS'
function validar(monto){ return Number.isInteger(monto) && monto >= 0; }
function calcular(monto){ return {billetes: Math.floor(monto/10000), resto: monto%10000}; }
console.log(JSON.stringify(validar(25000) ? calcular(25000) : null));
JS
node decomp.mjs
```

**Caso de uso real.** Separar validación, cálculo y presentación.

**Error común.** Poner todo en una función gigante. Corrección: separar responsabilidades.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `{"billetes":2,"resto":5000}`.

#### Patrones y abstracción

**Definición formal.** Reconocer patrones es identificar similitudes reutilizables; abstracción es exponer lo esencial y ocultar detalles irrelevantes.

**Para qué sirve.** Evita duplicación y hace el código generalizable.

**Cuándo usarlo.** Cuando ves reglas repetidas. No abstraigas prematuramente.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms1-abstr && cd /tmp/ms1-abstr
cat > abstr.mjs << 'JS'
function contarPor(cond, lista) { return lista.filter(cond).length; }
const edades = [8, 15, 30, 67];
console.log(contarPor(e => e < 12, edades));
console.log(contarPor(e => e >= 60, edades));
JS
node abstr.mjs
```

**Caso de uso real.** Filtros reutilizables.

**Error común.** Abstracción críptica. Corrección: nombres claros y tests.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `1`, `1`.

#### Algoritmo y caso borde

**Definición formal.** Un algoritmo es una secuencia finita y precisa de pasos; un caso borde es una entrada en límite que suele exponer defectos.

**Para qué sirve.** Garantiza comportamiento correcto y reproducible.

**Cuándo usarlo.** Siempre que definas reglas. Prueba límites (0, máximo, vacío, inválido).

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms1-edge && cd /tmp/ms1-edge
cat > edge.mjs << 'JS'
function cambio(monto) {
  if (!Number.isInteger(monto) || monto < 0) throw new Error('monto inválido');
  return monto;
}
try { cambio(-1); } catch(e) { console.log('error'); }
console.log(cambio(0));
JS
node edge.mjs
```

**Caso de uso real.** Validar monto 0, negativo, decimal.

**Error común.** Probar solo el “camino feliz”. Corrección: incluir bordes y errores en tests.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `error`, `0`.

## Cierre del módulo

La lógica de programación da los ladrillos; el pensamiento computacional da el método. Con ambos puedes convertir reglas de negocio en código pequeño, testeable y verificable.
