# Módulo 0: Fundamentos y Angular CLI

Este módulo establece la base técnica para trabajar con Angular moderno: preparación del entorno, modelo standalone del CLI, enlace de datos en plantillas, fundamentos de TypeScript útiles en Angular y el rol del compilador AOT. Cada concepto incluye definición, criterio de uso, ejemplo ejecutable o verificable, caso real, error común y evidencia.

## Preparación del entorno

Antes de los temas, confirma que tu equipo tiene las herramientas base. La línea usada en esta verificación fue Node.js 24.18.0, npm 12.0.2 y Angular CLI 22.0.5. Angular 22 genera proyectos standalone por defecto y configura TypeScript ~6.0.2 en el proyecto generado.

**Instalación mínima por sistema operativo**

- **Windows**: instala Node.js LTS desde el instalador oficial, Git for Windows y Visual Studio Code. Usa PowerShell o Windows Terminal para ejecutar comandos.
- **macOS**: instala Node.js LTS (instalador oficial o gestor como Homebrew), Git y Visual Studio Code. Usa Terminal o iTerm.
- **Linux (Ubuntu/Debian)**: instala Node.js LTS desde una fuente mantenida (NodeSource o nvm), Git con el gestor de paquetes y Visual Studio Code. Usa la terminal del sistema.

**Comprobación base**

Carpeta: cualquier directorio de trabajo.

Comando:

```bash
node -v
npm -v
npx -p @angular/cli ng version
```

**Verificación/Evidencia**

Salida observada en este entorno (2026-05-22):

```text
v24.18.0
12.0.2
Angular CLI       : 22.0.5
Node.js           : 24.18.0
Package Manager   : npm 12.0.2
```

Nota honesta: las versiones pueden variar según la máquina. Lo importante es cumplir los requisitos del CLI de Angular que uses y que `ng version` se ejecute sin error.

### Tema 1: El CLI ya no genera NgModules · Intermedio · 60 min

#### Concepto 1.1: Proyecto Angular standalone por defecto

**Definición formal**

En Angular CLI 22, `ng new` crea por defecto una aplicación basada en la API standalone (`--standalone` tiene valor por defecto `true`). El punto de arranque configura la aplicación con `bootstrapApplication` y proveedores en `app.config.ts`, sin requerir un `AppModule`.

**Para qué sirve**

Reduce la ceremonia inicial: el proyecto arranca con componentes que declaran sus propias dependencias y una configuración de aplicación explícita. Facilita entender dónde se registran proveedores y cómo se inicia la app.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: inicias un proyecto nuevo, quieres la estructura moderna recomendada por el CLI, o necesitas un arranque simple para aprender o prototipar.
- **No usarlo cuando**: debes mantener un proyecto legacy organizado alrededor de NgModules y la migración no está planificada; en ese caso, conviene seguir la convención existente hasta definir una estrategia de migración.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: `/tmp/ng-new`

Archivos/comandos:

```bash
mkdir -p /tmp/ng-new
cd /tmp/ng-new
ng new demo-m0 --standalone --style=css --routing=false --skip-git --defaults --skip-install
find demo-m0/src -maxdepth 3 -type f | sort
```

Inspección esperada de archivos generados:

```bash
cat demo-m0/src/app/app.ts
cat demo-m0/src/app/app.config.ts
```

**Caso de uso real**

Un equipo crea un panel interno nuevo. Al usar `ng new` con la configuración por defecto, obtiene un `App` standalone y `app.config.ts` para registrar proveedores como manejo global de errores, router o cliente HTTP, sin crear ni mantener `AppModule`.

**Error común**

- **Síntoma**: el desarrollador busca `app.module.ts` y, al no encontrarlo, asume que el proyecto está incompleto.
- **Causa**: confunde la estructura legacy basada en NgModules con la estructura standalone por defecto.
- **Corrección**: revisar `src/main.ts` y `src/app/app.config.ts`. El arranque standalone usa `bootstrapApplication` y la configuración vive en `ApplicationConfig`.

**Verificación/Evidencia**

Salida observada al ejecutar `ng new ... --skip-install` con Angular CLI 22.0.5:

```text
CREATE demo-m0/src/main.ts (222 bytes)
CREATE demo-m0/src/app/app.ts (229 bytes)
CREATE demo-m0/src/app/app.config.ts (203 bytes)
```

Contenido observado en `app.ts`:

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('demo-m0');
}
```

Contenido observado en `app.config.ts`:

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    
  ]
};
```

Nota honesta: no se ejecutó `npm install` ni `ng serve` en esta verificación mínima; se verificó la estructura generada por el CLI.

#### Concepto 1.2: Generación de componentes standalone y dependencias locales

**Definición formal**

Con el esquema por defecto actual, `ng generate component` crea un componente con metadatos `@Component`, incluyendo `imports: []`, para declarar dependencias usadas directamente por su plantilla. El componente no requiere ser declarado en un NgModule.

**Para qué sirve**

Hace explícita la dependencia del componente: si la plantilla usa otro componente, directiva o pipe standalone, se importa en el arreglo `imports` del propio componente.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: creas componentes nuevos en una aplicación standalone y quieres mantener dependencias locales y visibles.
- **No usarlo cuando**: estás generando artefactos para una arquitectura NgModule existente con convenciones distintas; primero confirma el esquema y la arquitectura del proyecto.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: `/tmp/ng-m0/demo-m0` (proyecto creado en el concepto anterior).

Comando:

```bash
cd /tmp/ng-m0/demo-m0
ng generate component tarjeta --skip-tests
cat src/app/tarjeta/tarjeta.ts
```

**Caso de uso real**

En una app de pedidos, generas `tarjeta-pedido` como componente standalone. Cuando la plantilla necesita `CurrencyPipe` o un componente hijo, lo agregas en `imports` del componente, dejando claro qué depende de qué sin modificar un módulo central.

**Error común**

- **Síntoma**: la plantilla usa `<app-hijo />` pero Angular reporta que el elemento no es conocido.
- **Causa**: el componente hijo no fue importado en el arreglo `imports` del componente standalone que lo usa.
- **Corrección**: importar la clase del componente hijo y agregarla a `imports: [HijoComponent]`.

**Verificación/Evidencia**

Salida observada con Angular CLI 22.0.5:

```text
CREATE src/app/tarjeta/tarjeta.css (0 bytes)
CREATE src/app/tarjeta/tarjeta.ts (190 bytes)
CREATE src/app/tarjeta/tarjeta.html (22 bytes)
```

Archivo observado `src/app/tarjeta/tarjeta.ts`:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-tarjeta',
  imports: [],
  templateUrl: './tarjeta.html',
  styleUrl: './tarjeta.css',
})
export class Tarjeta {

}
```

Nota honesta: la verificación cubre la generación de archivos y la forma del componente. No se ejecutó compilación del proyecto porque no se instalaron dependencias.

#### Concepto 1.3: Frontera entre standalone y NgModules

**Definición formal**

Un componente standalone declara sus dependencias en `imports`. Los artefactos basados en NgModule pertenecen a otro modelo de composición: un componente no standalone se declara en un NgModule y no se consume igual que un standalone en `imports` de otro componente standalone. Mezclar modelos requiere una ruta de compatibilidad explícita.

**Para qué sirve**

Evita suponer que "todo componente se importa en cualquier lugar". Entender la frontera previene errores de integración al trabajar con código legacy o librerías antiguas.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: integras componentes nuevos con código existente, migras gradualmente, o evalúas si una dependencia es standalone.
- **No usarlo cuando**: el proyecto es completamente standalone y no hay artefactos NgModule involucrados; en ese caso, la regla práctica es mantener dependencias en `imports`.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: proyecto Angular con dependencias instaladas.

Archivo `src/app/legacy.component.ts`:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-legacy',
  standalone: false,
  template: `<p>Legacy</p>`,
})
export class LegacyComponent {}
```

Archivo `src/app/moderno.component.ts`:

```ts
import { Component } from '@angular/core';
import { LegacyComponent } from './legacy.component';

@Component({
  selector: 'app-moderno',
  imports: [LegacyComponent],
  template: `<app-legacy />`,
})
export class ModernoComponent {}
```

Comando:

```bash
ng build
```

**Caso de uso real**

Durante una migración gradual, un equipo crea componentes standalone nuevos pero todavía tiene componentes declarados en un NgModule antiguo. Antes de usarlos, decide si migra el componente legacy a standalone o lo expone mediante un NgModule de compatibilidad importado donde corresponda.

**Error común**

- **Síntoma**: la compilación falla al intentar usar un componente no standalone dentro de `imports` de un componente standalone.
- **Causa**: se mezclaron los modelos de composición sin un puente compatible.
- **Corrección**: convertir el componente a standalone si es viable, o envolverlo/exponerlo mediante el mecanismo de compatibilidad adecuado para NgModules en la versión de Angular usada.

**Verificación/Evidencia**

Nota honesta: no se ejecutó `ng build` en este entorno para este caso porque requiere un proyecto Angular con dependencias instaladas. La verificación es ejecutable con los archivos y comando indicados en un proyecto generado por Angular CLI 22. La regla de composición es parte del modelo standalone/NgModule de Angular; el compilador debe rechazar la importación directa incompatible.

### Tema 2: Interpolación y property binding · Básico · 45 min

#### Concepto 2.1: Interpolación de texto

**Definición formal**

La interpolación `{{ expresion }}` evalúa una expresión en el contexto del componente y renderiza su resultado como texto en la plantilla. Es adecuada para contenido textual, no para asignar propiedades DOM arbitrarias.

**Para qué sirve**

Permite mostrar estado del componente en la vista de forma declarativa. Cuando cambia el estado, Angular actualiza el texto renderizado.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: necesitas mostrar un valor como texto dentro del contenido de un elemento.
- **No usarlo cuando**: necesitas configurar una propiedad real del elemento DOM, como `value`, `disabled`, `src` o `checked`; en esos casos usa property binding.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: `/tmp/ng-m0-interpolacion`

Archivo `interpolacion.mjs`:

```js
function render(nombre) {
  return `Hola, ${nombre}`;
}

console.log(render('Angular'));
```

Comando:

```bash
node /tmp/ng-m0-interpolacion/interpolacion.mjs
```

**Caso de uso real**

En una tarjeta de pedido, muestras `Pedido #{{ pedido.id }}` o un estado textual. El valor proviene del componente y se actualiza cuando cambia el modelo.

**Error común**

- **Síntoma**: se usa `{{ valor }}` para controlar un atributo/propiedad como `disabled` y el comportamiento no es el esperado.
- **Causa**: la interpolación produce texto; no controla directamente la propiedad booleana del DOM.
- **Corrección**: usar `[disabled]="condicion"` u otro property binding adecuado.

**Verificación/Evidencia**

Salida observada con Node.js 24.18.0:

```text
Hola, Angular
```

Nota honesta: este ejemplo verifica el concepto de interpolación como salida textual en JavaScript plano. En Angular, la interpolación se evalúa en plantilla; su verificación visual/DOM en navegador o pruebas de componente requiere ejecutar la app o TestBed con dependencias instaladas.

#### Concepto 2.2: Property binding

**Definición formal**

El property binding `[propiedad]="expresion"` asigna el resultado de una expresión a una propiedad del elemento DOM, componente o directiva. A diferencia de la interpolación, no se limita a texto y puede pasar booleanos, números, objetos o strings según la propiedad destino.

**Para qué sirve**

Permite controlar el estado real de elementos de la interfaz: deshabilitar botones, asignar valores de inputs, pasar datos a componentes hijos y enlazar propiedades calculadas.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: la UI depende de una propiedad DOM o input de componente.
- **No usarlo cuando**: solo necesitas mostrar texto; usar interpolación es más simple y claro.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: proyecto Angular con dependencias instaladas.

Archivo `src/app/campo-cantidad.component.ts`:

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-campo-cantidad',
  standalone: true,
  template: `
    <p>Cantidad: {{ cantidad() }}</p>
    <input [value]="cantidad()" [disabled]="bloqueado()" />
    <button type="button" (click)="bloqueado.set(!bloqueado())">Alternar bloqueo</button>
  `,
})
export class CampoCantidadComponent {
  cantidad = signal(3);
  bloqueado = signal(false);
}
```

Comando:

```bash
ng serve
```

**Caso de uso real**

Un formulario de checkout deshabilita el botón de pago mientras se procesa la solicitud: `[disabled]="procesando()"`. Así el estado del componente controla la propiedad real del botón.

**Error común**

- **Síntoma**: el input muestra el valor inicial pero no refleja el estado actual esperado, o un booleano se maneja como string.
- **Causa**: se confunde atributo HTML inicial con propiedad DOM actual, o se usa interpolación donde corresponde binding.
- **Corrección**: usar property binding para propiedades DOM y validar el comportamiento en el objeto DOM, no solo en el HTML inicial.

**Verificación/Evidencia**

Nota honesta: la verificación completa de property binding requiere ejecutar Angular en navegador o pruebas con TestBed, porque la diferencia crítica es la propiedad DOM viva. No se ejecutó aquí por no instalar dependencias ni levantar navegador. El ejemplo es compatible con la API de Angular 22 y se puede verificar con `ng serve` o una spec de TestBed que lea `input.value` e `input.disabled` tras `detectChanges()`.

### Tema 3: TypeScript a fondo: unknown, any, never y utility types · Intermedio · 60 min

#### Concepto 3.1: `unknown` frente a `any`

**Definición formal**

`any` desactiva efectivamente la comprobación de tipos para el valor. `unknown` representa un valor de tipo desconocido, pero obliga a realizar narrowing o una conversión explícita antes de operar con él como un tipo concreto.

**Para qué sirve**

`unknown` permite aceptar datos externos o inciertos sin perder seguridad de tipos. Es útil en bordes del sistema: JSON, respuestas de red, eventos, entradas de usuario o APIs poco tipadas.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: recibes datos de origen no confiable o no tipado y quieres forzar validación antes de usarlos.
- **No usarlo cuando**: ya conoces el tipo y puedes modelarlo correctamente; en ese caso, tipa de forma precisa. Evita `any` como atajo, salvo interoperabilidad temporal y acotada.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: `/tmp/ng-m0-verify`

Archivo `unknown-any.ts`:

```ts
function procesarConAny(valor: any) {
  return valor.toUpperCase();
}

function procesarConUnknown(valor: unknown) {
  return valor.toUpperCase();
}
```

Comando:

```bash
npx -p typescript tsc --noEmit --strict --target ES2022 --module nodenext --moduleResolution nodenext /tmp/ng-m0-verify/unknown-any.ts
```

**Caso de uso real**

Al consumir una respuesta HTTP, el cuerpo puede llegar como desconocido. Usar `unknown` obliga a validar su forma antes de acceder a propiedades, reduciendo fallos en runtime por datos inesperados.

**Error común**

- **Síntoma**: el código compila, pero falla en runtime con "X is not a function" o "cannot read property".
- **Causa**: se usó `any`, lo que permitió operar sobre un valor sin validar.
- **Corrección**: reemplazar `any` por `unknown` en el borde, hacer narrowing (`typeof`, `instanceof`, guardas) o validación de esquema antes de operar.

**Verificación/Evidencia**

Salida observada con TypeScript 7.0.2:

```text
../../../../../tmp/ng-m0-verify/unknown-any.ts(6,10): error TS18046: 'valor' is of type 'unknown'.
```

Observación: `procesarConAny` no generó error de compilación, aunque la operación es insegura si el valor no es string. `procesarConUnknown` fue rechazado por el compilador.

#### Concepto 3.2: `never` y comprobación exhaustiva

**Definición formal**

`never` representa un tipo sin valores posibles. Se usa para funciones que no retornan normalmente o para comprobar exhaustividad en uniones discriminadas: si un caso queda sin manejar, la asignación al tipo `never` falla en compilación.

**Para qué sirve**

Permite que el compilador avise cuando se agrega un nuevo caso a una unión y falta actualizar la lógica que la maneja.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: manejas uniones cerradas (`"pendiente" | "hecha"`, variantes de estado, acciones) y quieres protección ante casos nuevos.
- **No usarlo cuando**: la unión es abierta o deliberadamente extensible y no puedes garantizar exhaustividad en ese punto.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: `/tmp/ng-m0-never`

Archivo `never.ts`:

```ts
type Estado = "pendiente" | "hecha";

function etiqueta(e: Estado): string {
  switch (e) {
    case "pendiente":
      return "Pendiente";
    case "hecha":
      return "Hecha";
    default: {
      const _exhaustivo: never = e;
      return _exhaustivo;
    }
  }
}

console.log(etiqueta("pendiente"));
```

Comandos:

```bash
npx -p typescript tsc --strict --target ES2022 --module nodenext --moduleResolution nodenext --outDir /tmp/ng-m0-never/out /tmp/ng-m0-never/never.ts
node /tmp/ng-m0-never/out/never.js
```

**Caso de uso real**

Un flujo de tareas tiene estados finitos. Si mañana se agrega `"archivada"`, el compilador señalará el `switch` que no cubre el nuevo caso, evitando un comportamiento silencioso por defecto.

**Error común**

- **Síntoma**: se agrega un valor nuevo a una unión y la aplicación cae en un caso genérico o retorna un valor incorrecto.
- **Causa**: no hay control de exhaustividad.
- **Corrección**: agregar una guarda `never` en el `default` o en el camino final para que TypeScript detecte el caso faltante.

**Verificación/Evidencia**

Salida observada:

```text
Pendiente
```

La compilación con `--strict` finalizó sin errores para la unión cubierta completamente.

#### Concepto 3.3: Utility types `Partial`, `Pick` y `Record`

**Definición formal**

Los utility types son tipos genéricos incorporados en TypeScript que transforman otros tipos. `Partial<T>` vuelve opcionales las propiedades de `T`; `Pick<T, K>` selecciona un subconjunto de propiedades; `Record<K, V>` define un objeto cuyas claves son `K` y cuyos valores son `V`.

**Para qué sirve**

Permiten modelar variantes de un tipo sin duplicar interfaces: borradores, parches, DTOs parciales, vistas reducidas o mapas por clave.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: la transformación del tipo es directa y expresa la intención.
- **No usarlo cuando**: la forma resultante tiene reglas de negocio distintas que merecen un tipo propio con nombre; por ejemplo, si un "borrador" tiene validaciones o campos adicionales específicos.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: `/tmp/ng-m0-util`

Archivo `util.ts`:

```ts
type Tarea = { id: number; titulo: string; hecha: boolean };
type TareaParcial = Partial<Tarea>;
type SoloTitulo = Pick<Tarea, "titulo">;
type Contador = Record<"pendiente" | "hecha", number>;

const parcial: TareaParcial = { titulo: "x" };
const pick: SoloTitulo = { titulo: "x" };
const contador: Contador = { pendiente: 1, hecha: 2 };

console.log(JSON.stringify({ parcial, pick, contador }));
```

Comandos:

```bash
npx -p typescript tsc --strict --target ES2022 --module nodenext --moduleResolution nodenext --outDir /tmp/ng-m0-util/out /tmp/ng-m0-util/util.ts
node /tmp/ng-m0-util/out/util.js
```

**Caso de uso real**

En una pantalla de edición, `Partial<Tarea>` sirve para enviar solo los campos modificados. `Pick<Tarea, "titulo">` puede tipar un formulario simple. `Record<Estado, number>` sirve para contadores por estado.

**Error común**

- **Síntoma**: se usa `Partial<T>` en una capa donde el objeto debe estar completo y aparecen `undefined` inesperados.
- **Causa**: `Partial` relaja el contrato; se usó para conveniencia, no por necesidad real.
- **Corrección**: limitar `Partial` a bordes de entrada/parche y convertir a un tipo completo después de validar.

**Verificación/Evidencia**

Salida observada:

```text
{"parcial":{"titulo":"x"},"pick":{"titulo":"x"},"contador":{"pendiente":1,"hecha":2}}
```

La compilación con TypeScript 7.0.2 y `--strict` fue exitosa.

### Tema 4: Compilador AOT frente a JIT · Intermedio · 45 min

#### Concepto 4.1: AOT como compilación previa

**Definición formal**

AOT (Ahead-of-Time) compila plantillas y código Angular antes de que el navegador ejecute la aplicación, durante el build. JIT (Just-in-Time) era el enfoque histórico donde la compilación ocurría en el navegador. En Angular moderno, el flujo por defecto es AOT.

**Para qué sirve**

Detecta ciertos errores de plantilla durante la compilación, evita enviar el compilador al navegador y entrega artefactos listos para ejecución.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: construyes para desarrollo normal, CI, pruebas previas a despliegue o producción; es el camino por defecto.
- **No usarlo cuando**: no hay un caso habitual moderno para preferir JIT en aplicaciones Angular actuales. Si te encuentras con documentación JIT, trátala como contexto histórico o de compatibilidad, no como práctica por defecto.

**Regla práctica**

Si no tienes una razón explícita para elegir JIT, no estás eligiendo: estás usando el valor por defecto, que es AOT. No busques cómo activar JIT en un proyecto Angular moderno a menos que estés depurando documentación o herramientas antiguas.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: proyecto Angular con dependencias instaladas.

Comando:

```bash
ng build
```

Resultado esperado:

```text
El comando compila la aplicación y genera artefactos en dist/.
```

**Caso de uso real**

Antes de desplegar, el pipeline de CI ejecuta `ng build`. Si una plantilla tiene un error detectable por AOT, el build falla y el despliegue se detiene antes de llegar a usuarios.

**Error común**

- **Síntoma**: el equipo asume que "si TypeScript compila, la plantilla está bien".
- **Causa**: confundir la comprobación de TypeScript con la compilación de plantillas de Angular.
- **Corrección**: incluir `ng build` o el chequeo de plantilla correspondiente en el flujo de verificación.

**Verificación/Evidencia**

Nota honesta: no se ejecutó `ng build` en este entorno porque el proyecto de ejemplo no tiene `node_modules` instalados y la instalación no se realizó. El comando es verificable en un proyecto Angular generado por CLI 22 tras `npm install`. Se verificó en cambio que el CLI 22 genera proyectos modernos (`@angular/build`, TypeScript ~6.0.2).

#### Concepto 4.2: Errores de plantilla detectados en build

**Definición formal**

La compilación AOT analiza plantillas Angular y puede reportar errores como propiedades inexistentes, bindings inválidos o problemas de tipos en plantillas, según la configuración y el tipo de error. El reporte incluye ubicación para corregir antes de ejecutar en producción.

**Para qué sirve**

Convierte fallos de plantilla en fallos tempranos de build, con mejor trazabilidad que un error en runtime en el navegador del usuario.

**Cuándo usarlo y cuándo no usarlo**

- **Usarlo cuando**: quieres validar que las plantillas son coherentes con las clases de componente antes de desplegar.
- **No usarlo cuando**: no aplica evitar esta verificación; omitir el build solo pospone el error.

**Ejemplo mínimo enfocado (ejecutable)**

Carpeta: proyecto Angular con dependencias instaladas.

Archivo `src/app/resumen.component.ts`:

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-resumen',
  standalone: true,
  template: `<p>Estado: {{ estadoQueNoExiste }}</p>`,
})
export class ResumenComponent {
  estado = 'en tránsito';
}
```

Comando:

```bash
ng build
```

**Caso de uso real**

Un refactor renombra `estado` a `estadoEnvio`, pero una plantilla sigue usando la propiedad vieja. El build AOT falla y señala la plantilla afectada antes de publicar.

**Error común**

- **Síntoma**: el error aparece solo al abrir la pantalla en el navegador, o se detecta tarde en QA.
- **Causa**: no se ejecutó un build/chequeo que incluya la compilación de plantillas.
- **Corrección**: ejecutar `ng build` en CI y corregir la propiedad o expresión señalada por el compilador.

**Verificación/Evidencia**

Nota honesta: no se ejecutó este build con el componente roto en este entorno por falta de dependencias instaladas. El procedimiento es verificable localmente en un proyecto Angular CLI 22: crear el componente, incluirlo en la app y ejecutar `ng build`; el compilador debe reportar que la propiedad usada en la plantilla no existe en el componente. No se afirma un mensaje exacto porque no fue observado en esta ejecución.

## Cierre del módulo

Con este módulo deberías poder preparar el entorno, reconocer la estructura standalone que genera el CLI, distinguir interpolación de property binding, usar `unknown`/`never`/utility types con criterio y entender por qué AOT es la barrera de compilación previa a producción. En el siguiente módulo se profundiza en componentes, plantillas y data binding con pruebas más completas.