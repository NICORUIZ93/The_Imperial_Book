# Módulo 3: Objetos, prototipos y clases


## Aprende construyendo


### Tema 1: Prototype chain y Object.create · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás crear objetos que delegan métodos, recorrer su cadena y distinguir propiedades propias, heredadas y sombreadas.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    GUIA["guia (propiedades propias)"] --> PROTO["guiaProto (métodos compartidos)"] --> OBJECT["Object.prototype"] --> NULL["null"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
mkdir ejemplo-prototipos
cd ejemplo-prototipos
npm init -y
mkdir src
```

```javascript
const guiaProto = {
  describir() { // se comparte y usa la instancia receptora
    return `${this.numero}: ${this.estado}`;
  },
};

const guia = Object.create(guiaProto);
guia.numero = 'RF-40';
guia.estado = 'creado';

console.log(guia.describir());
console.log(Object.hasOwn(guia, 'describir'));
console.log(Object.getPrototypeOf(guia) === guiaProto);
```

```bash
node src/prototipos.js
```

</details>

### Tema 2: class, extends y super · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás implementar una jerarquía pequeña con class, extends y super, y decidir cuándo composición representa mejor el dominio.

#### ► CÓMO FUNCIONA
```mermaid
classDiagram
    class Envio {
      +numero
      +describir()
    }
    class EnvioExpress {
      +prioridad
      +describir()
    }
    Envio <|-- EnvioExpress
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
classDiagram
    class Envio {
      +numero
      +describir()
    }
    class EnvioExpress {
      +prioridad
      +describir()
    }
    Envio <|-- EnvioExpress
```

```bash
mkdir ejemplo-clases
cd ejemplo-clases
npm init -y
mkdir src
```

```javascript
class Envio {
  constructor(numero) {
    if (!numero) throw new TypeError('Número requerido');
    this.numero = numero;
  }
  describir() { return `Envío ${this.numero}`; }
}

class EnvioExpress extends Envio {
  constructor(numero, prioridad) {
    super(numero); // inicializa this mediante el constructor base
    this.prioridad = prioridad;
  }
  describir() { return `${super.describir()} · prioridad ${this.prioridad}`; }
}

console.log(new EnvioExpress('RF-41', 'alta').describir());
```

```bash
node src/clases.js
```

</details>

### Tema 3: Getters, setters y propiedades computadas · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás exponer valores derivados con getters, validar escrituras deliberadas y construir claves dinámicas sin duplicar estado.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    INPUT["movimientos"] --> GETTER["get total: cálculo derivado"] --> VIEW["lectura como propiedad"]
    KEY["estado dinámico"] --> COMPUTED["{ [estado]: cantidad }"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    INPUT["movimientos"] --> GETTER["get total: cálculo derivado"] --> VIEW["lectura como propiedad"]
    KEY["estado dinámico"] --> COMPUTED["{ [estado]: cantidad }"]
```

```bash
mkdir ejemplo-propiedades
cd ejemplo-propiedades
npm init -y
mkdir src
```

```javascript
class Manifiesto {
  #paquetes = [];

  agregar(paquete) {
    if (!Number.isFinite(paquete.pesoKg) || paquete.pesoKg <= 0) {
      throw new TypeError('Peso positivo requerido');
    }
    this.#paquetes.push({ ...paquete });
  }

  get pesoTotal() { // se calcula al leer; no se almacena otra copia
    return this.#paquetes.reduce((total, paquete) => total + paquete.pesoKg, 0);
  }
}

const manifiesto = new Manifiesto();
manifiesto.agregar({ guia: 'RF-42', pesoKg: 2 });
manifiesto.agregar({ guia: 'RF-43', pesoKg: 1.5 });
console.log(manifiesto.pesoTotal);
```

```bash
node src/propiedades.js
```

</details>

### Tema 4: Encapsulación con campos privados (#campo) · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás proteger una transición con #campo, exponer lectura controlada y diferenciar privacidad real de la convención _campo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    CALLER["consumidor"] --> API["métodos públicos validados"] --> PRIVATE["#estado privado"]
    CALLER -. "acceso directo rechazado" .-> PRIVATE
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```javascript
const configuracion = Object.freeze({ reintentos: 3, limites: { porMinuto: 60 } });
configuracion.reintentos = 10; // ignorado en modo no estricto, TypeError en modo estricto
console.log(configuracion.reintentos); // 3: el nivel superior sí quedó protegido

configuracion.limites.porMinuto = 999; // el freeze es superficial: el objeto anidado no está congelado
console.log(configuracion.limites.porMinuto); // 999: la mutación anidada sí tuvo efecto
```

```mermaid
flowchart LR
    CALLER["consumidor"] --> API["métodos públicos validados"] --> PRIVATE["#estado privado"]
    CALLER -. "acceso directo rechazado" .-> PRIVATE
```

```bash
mkdir ejemplo-encapsulacion
cd ejemplo-encapsulacion
npm init -y
mkdir src
```

```javascript
class Entrega {
  #estado;

  constructor(estado = 'EN_RUTA') { this.#estado = estado; }
  get estado() { return this.#estado; }

  confirmar() {
    if (this.#estado !== 'EN_RUTA') {
      throw new Error(`No se puede confirmar desde ${this.#estado}`);
    }
    this.#estado = 'ENTREGADA';
  }
}

const entrega = new Entrega();
entrega.confirmar();
console.log(entrega.estado);
```

```bash
node src/encapsulacion.js
```

</details>

### Tema 5: Symbol y objetos iterables propios · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás crear claves únicas con Symbol, implementar el protocolo de iteración con Symbol.iterator y con generadores, y lograr que tus objetos funcionen con for...of, spread y desestructuración. Prerrequisitos: Tema 2 de este módulo (clases) y Módulo 6, Tema 5 (generad…

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant F as for...of
    participant R as Ruta
    participant I as iterador
    F->>R: [Symbol.iterator]()
    R-->>F: iterador
    F->>I: next()
    I-->>F: value y done false
    F->>I: next()
    I-->>F: done true
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
    participant F as for...of
    participant R as Ruta
    participant I as iterador
    F->>R: [Symbol.iterator]()
    R-->>F: iterador
    F->>I: next()
    I-->>F: value y done false
    F->>I: next()
    I-->>F: done true
```

```bash
mkdir iterables && cd iterables
```

```javascript
// Una ruta de reparto que se puede recorrer con for...of, spread y desestructuración
class Ruta {
  #paradas = [];
  agregar(...paradas) {
    this.#paradas.push(...paradas);
    return this;
  }
  // Protocolo de iteración: un método con la clave Symbol.iterator que devuelve un iterador
  [Symbol.iterator]() {
    let i = 0;
    const paradas = this.#paradas;
    return {
      next() {
        return i < paradas.length
          ? { value: `${i + 1}. ${paradas[i++]}`, done: false }
          : { value: undefined, done: true };
      },
    };
  }
  // Un generador produce un iterador sin escribir next() a mano
  *pendientesDesde(indice) {
    for (let i = indice; i < this.#paradas.length; i++) yield this.#paradas[i];
  }
  get [Symbol.toStringTag]() {
    return 'Ruta';
  }
}

const ruta = new Ruta().agregar('Depósito', 'Chapinero', 'Usaquén', 'Suba');
for (const parada of ruta) console.log(parada);
console.log([...ruta].length, 'paradas');
const [origen, siguiente] = ruta;
console.log('Desestructurada:', origen, '|', siguiente);
console.log('Pendientes:', [...ruta.pendientesDesde(2)]);
console.log(Object.prototype.toString.call(ruta));

// Symbol: claves únicas que no chocan con otras propiedades
const ID_INTERNO = Symbol('idInterno');
const envio = { guia: 'G-1', [ID_INTERNO]: 98765 };
console.log(Object.keys(envio), JSON.stringify(envio), envio[ID_INTERNO]);
console.log(Symbol('a') === Symbol('a'), Symbol.for('a') === Symbol.for('a'));
```

```bash
node iterables.js
```

```text
1. Depósito
2. Chapinero
3. Usaquén
4. Suba
4 paradas
Desestructurada: 1. Depósito | 2. Chapinero
Pendientes: [ 'Usaquén', 'Suba' ]
[object Ruta]
[ 'guia' ] {"guia":"G-1"} 98765
false true
```

</details>
