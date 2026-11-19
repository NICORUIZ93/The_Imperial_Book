# Módulo 14: Next.js en producción: caché, Proxy, imágenes, React Aria e i18n


## Aprende construyendo

**Qué queda fuera y dónde está:** Server Components, streaming con `Suspense` y Server Actions se enseñan en el Módulo 10; la autorización dentro de una acción y la frontera de seguridad cliente/servidor, en el Módulo 13, Tema 3; la hidratación determinista y el formato de fechas por zona, en el Módulo 13, Tema 4. Este módulo parte de esas bases y solo trata lo que no aparece antes: caché ISR, metadatos y Proxy, imágenes y fuentes, componentes accesibles con React Aria e internacionalización con mensajes ICU.

**Proyecto del módulo:** todos los temas trabajan en un proyecto Next.js 16 nuevo, `rutaflow-next`, creado en el Tema 1 sin carpeta `src` (el alias `@/` apunta a la raíz). Usa Node 24 LTS.

### Tema 1: Next.js ISR, Metadata y Proxy (antes Middleware)

#### Paso 1 · Objetivo y preparación
Al finalizar distinguirás una redirección temprana de una autorización y observarás regeneración de HTML público. **Prerrequisitos:** Módulo 10 (App Router y Server Components) y Módulo 13, Tema 3 (autorización en el servidor). Este ejemplo usa Next.js 16, runtime Node y la configuración tradicional de caché, sin `cacheComponents`; en Next.js 15 la convención equivalente es `middleware.ts` con función `middleware`.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** El panel de operadores contiene datos privados, pero el seguimiento público solo muestra guía y estado. Usar una cookie presente como prueba de identidad o cachear la vista privada como una pública cruza una frontera de seguridad.

#### Paso 3 · Teoría, modelo mental y analogía
Proxy puede filtrar navegación antes del render. **Analogía:** un aviso en la entrada no sustituye verificar la identidad en la operación. La presencia de una cookie solo permite una comprobación optimista; su firma, vigencia y permisos se validan en el servidor. Fuente oficial: [autenticación en Next.js](https://nextjs.org/docs/app/guides/authentication).

ISR conserva una versión pública y permite regenerarla después del intervalo cuando llega otra petición. No es un temporizador que actualiza puntualmente cada 60 segundos; durante regeneración puede servirse una versión anterior. Fuente oficial: [ISR](https://nextjs.org/docs/app/guides/incremental-static-regeneration).

#### Paso 4 · Demostración guiada
**Desde cero:** crea el proyecto del módulo:

```bash
npx create-next-app@latest rutaflow-next --ts --app --no-src-dir --use-npm --yes
cd rutaflow-next
```

Crea un stub de sesión con dos operadores. `lib/auth.ts`:

```ts
import { cookies } from 'next/headers';

// Stub de laboratorio: en producción, `auth()` valida una sesión firmada
// (Auth.js, tu proveedor de identidad...). Nunca basta con que la cookie exista.
const sesionesValidas = new Map([
  ['token-ana', 'operador-ana'],
  ['token-luis', 'operador-luis'],
]);

export async function auth(): Promise<{ userId: string } | null> {
  const token = (await cookies()).get('session')?.value;
  const userId = token ? sesionesValidas.get(token) : undefined;
  return userId ? { userId } : null;
}
```

Para simular la sesión, crea en DevTools → Application → Cookies una cookie `session` con valor `token-ana`.

Crea `proxy.ts` en la raíz del proyecto Next.js:

```ts
import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // Filtro de navegación: NO verifica autenticidad ni permisos.
  if (!request.cookies.get('session')?.value) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: '/panel/:path*' };
```

En `app/panel/layout.tsx` comprueba realmente la sesión con el `auth` de `lib/auth.ts`. El contrato de `auth` del proyecto debe devolver una identidad validada o null; nunca se limita a leer la cookie. Repite autorización por recurso en cada consulta y mutación del backend, sin depender del layout.

```tsx
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.userId) redirect('/login');
  return <main>{children}</main>;
}
```

Crea `app/envios/[id]/page.tsx` con una ficha **pública y sintética**, sin cookies ni información personal:

```tsx
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };
export const revalidate = 60;
export const dynamicParams = false;
export function generateStaticParams() {
  return [{ id: 'RF-4471' }];
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Seguimiento público ${id}` };
}

export default async function Seguimiento({ params }: Props) {
  const { id } = await params;
  if (id !== 'RF-4471') notFound();
  // Fecha de generación del HTML, no fecha de la entrega.
  const generado = new Date().toISOString();
  return <main><h1>{id}</h1><p>En tránsito</p><p>Generado: {generado}</p></main>;
}
```

`params` se espera antes de leerlo, según la [API de generateMetadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata). `generateStaticParams` hace explícita la página pública que se prerenderiza. Ejecuta después de guardar los archivos:

```bash
npm run build
npm run start
```

En otra terminal:

```bash
curl -i http://localhost:3000/panel
curl -i http://localhost:3000/envios/RF-4471
```

**Resultado esperado:** el panel sin sesión redirige; dos consultas rápidas de la guía muestran el mismo valor de Generado. Después de 60 segundos, solicita otra vez y luego repite tras finalizar la regeneración: el valor cambia. No uses `next dev` para concluir cómo se comporta la caché de producción.

**Fallo deliberado:** cambia el matcher a `/pane/:path*`. El filtro temprano deja de ejecutarse, pero el layout y las operaciones correctamente autorizadas deben continuar rechazando acceso. Envía también una cookie `session` inventada: su presencia no debe habilitar el panel.

#### Paso 5 · Práctica guiada
Pista: compara los logs del filtro con los de validación del servidor y comprueba la URL de redirección. Retirar el filtro no debe convertir una identidad inválida en válida.

#### Paso 6 · Práctica independiente
Restaura el matcher y prueba sesión ausente, inválida y válida. Para ISR, conserva respuestas con su fecha de generación antes y después de revalidar; distingue dato antiguo servido durante la regeneración de fallo permanente.

#### Paso 7 · Cierre
Entrega las respuestas y explica la diferencia entre navegación, autorización y caché pública. Como siguiente paso, mide imágenes y fuentes de esa página. **Errores comunes:** confiar en existencia de cookie, cachear datos privados entre usuarios, leer params sin await y medir ISR con el servidor de desarrollo. Fuente oficial: [convención Proxy y migración desde Middleware](https://nextjs.org/docs/app/api-reference/file-conventions/proxy).

**Transferencia al proyecto integrador «Portal de clientes»:** Distingue página pública cacheable de panel privado. Prueba navegación sin sesión y datos de dos usuarios; la política de caché nunca debe reutilizar información privada entre identidades.

**Límites y decisión de uso:** Esta ficha estática demuestra regeneración del HTML. Al conectar datos reales debes definir caché e invalidación de esa fuente y mantener toda información privada fuera de esta ruta pública.

### Tema 2: Optimización de imágenes y fuentes

#### Paso 1 · Objetivo y preparación
Al finalizar vas a construir `app/components/Photo.tsx` con `next/image` y dimensiones explícitas para la foto de evidencia de entrega, y vas a cargar una fuente con `next/font` en vez de un `<link>` bloqueante, midiendo el CLS antes y después. **Prerrequisitos:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
La foto de evidencia de entrega en la página de detalle de un envío no tenía dimensiones explícitas: toda la página saltaba visiblemente hacia abajo apenas la imagen terminaba de descargar, un CLS (Cumulative Layout Shift) alto y medible, no solo una percepción de que "se ve mal".

#### Paso 3 · Teoría, modelo mental y analogía
`next/image` exige `width`/`height` (o `fill`) de antemano para que el navegador reserve exactamente ese espacio antes de que la imagen descargue, eliminando el salto de layout; `next/font` descarga y autohospeda la fuente en tiempo de build, en vez de depender de una petición externa que bloquea el pintado del texto. La analogía: pintar las líneas de un lugar de estacionamiento antes de que el auto llegue, en vez de dejar que la llegada del auto decida el espacio.

**¿Por qué es importante?** Reservar el espacio de una imagen antes de que descargue es lo que elimina el salto de layout — el formato o la compresión de la imagen no resuelven ese problema por sí solos.

**Conceptos clave:** `next/image`, CLS, `next/font`, reserva de espacio.

**Transferencia al proyecto integrador «Portal de clientes»:** Reserva el espacio de la fotografía de evidencia y aplica la fuente seleccionada en el layout. Compara desplazamiento visual con descarga lenta y conserva la medición de la página real.

#### Paso 4 · Demostración guiada
**Desde cero:** trabaja en el proyecto `rutaflow-next` del Tema 1 y escribe los archivos de este tema.

Desde la raíz de `rutaflow-next`, ejecuta:

```bash
npm run build
npm run start
```

Abre la página que usa `Photo`, ejecuta Lighthouse y guarda el valor CLS antes y después de quitar las dimensiones.

```tsx
// app/components/Photo.tsx
import Image from 'next/image';

export function Photo({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} width={400} height={300} />;
}
```
```ts
// app/layout.tsx
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body className={inter.className}>{children}</body></html>;
}
```
Resultado esperado: Lighthouse reporta un CLS cercano a 0 para la foto, y el texto se pinta sin esperar la descarga de la fuente externa.

**Fallo deliberado:** reemplaza `<Image src={src} alt={alt} width={400} height={300} />` por un `<img src={src} alt={alt} />` plano, sin dimensiones. El navegador ya no reserva espacio hasta que la imagen descarga, y el contenido debajo salta visiblemente — medible como un CLS alto en Lighthouse, no una impresión subjetiva.

#### Paso 5 · Práctica guiada
Pista: corre Lighthouse (o el panel "Performance" de DevTools) antes y después del cambio y compara el valor numérico de CLS — el salto visual es la pista, el número es la evidencia.

#### Paso 6 · Práctica independiente
Restaura `next/image`, y además compara: quita temporalmente `next/font` en favor de un `<link>` externo a Google Fonts y mide la diferencia en First Contentful Paint entre ambas estrategias.

#### Paso 7 · Cierre
Entrega la foto sin salto de layout del Paso 4, el CLS alto reproducido con `<img>` plano del Paso 5, y la comparación de FCP entre `next/font` y un `<link>` externo del Paso 6; explica por qué reservar espacio de antemano es lo que elimina el salto, no el formato del archivo de imagen. Como siguiente paso, estudia accesibilidad con React Aria para esa misma página. Errores comunes: usar `<img>` plano sin `width`/`height` donde `next/image` ya está disponible; cargar una fuente externa bloqueante cuando `next/font` puede autohospedarla. Fuente oficial: https://nextjs.org/docs/app/building-your-application/optimizing/images y https://nextjs.org/docs/app/building-your-application/optimizing/fonts.

### Tema 3: Accesibilidad y React Aria

#### Paso 1 · Objetivo y preparación
Al finalizar vas a construir `app/components/Dialog.tsx` con `useDialog` de React Aria para confirmar "marcar como entregado", y vas a reproducir el fallo de un diálogo construido como un `<div>` plano que es invisible para un lector de pantalla. **Prerrequisitos:** Tema 2 de este módulo y Módulo 13, Tema 2 (foco y semántica).

#### Paso 2 · Contexto y caso real
Un diálogo de confirmación construido como un `<div>` con estilos propios se veía perfecto visualmente, pero un lector de pantalla no anunciaba nada al abrirlo, y la tecla Tab podía mover el foco a elementos detrás del diálogo mientras seguía abierto.

#### Paso 3 · Teoría, modelo mental y analogía
Un `<div>` no tiene ninguna semántica ARIA implícita: un lector de pantalla no tiene forma de saber que es un diálogo, cuál es su nombre accesible, ni que el foco debería quedar atrapado dentro. Los hooks de React Aria (`useDialog`, `useModal`, `useOverlay`) conectan el `role="dialog"`, el `aria-modal` y el atrapado/restauración de foco correctos, comportamiento que es fácil de implementar mal a mano. La analogía: una puerta sin cartel ni manija — puede funcionar, pero nadie que no la vea sabe que está ahí o cómo usarla.

**¿Por qué es importante?** Un componente puede verse visualmente idéntico y a la vez ser invisible para un lector de pantalla — la única forma de confirmarlo es inspeccionar el árbol de accesibilidad, no la apariencia.

**Conceptos clave:** `useDialog`, árbol de accesibilidad, atrapado de foco, `jest-axe`.

**Transferencia al proyecto integrador «Portal de clientes»:** Integra el diálogo de confirmación con nombre, foco inicial y restauración al cerrar. Prueba Escape, tabulación y lector de pantalla; una acción irreversible exige además autorización del backend.

**Límites y decisión de uso:** El nombre y role de un diálogo no bastan para hacerlo modal. Debes gestionar foco, cierre, restauración e interacción con el fondo mediante una solución completa y probar el recorrido con teclado.

#### Paso 4 · Demostración guiada
**Desde cero:** trabaja en el proyecto `rutaflow-next` del Tema 1 y escribe los archivos de este tema.

Desde la raíz de `rutaflow-next`, ejecuta:

```bash
npm run build
npm run start
```

Abre la pantalla que monta `ConfirmarEntregaDialog`, activa el diálogo con teclado y comprueba su nombre en el árbol de accesibilidad.

```tsx
// app/components/Dialog.tsx
'use client';
import { useDialog } from 'react-aria';
import { useRef } from 'react';

type Props = { onConfirm: () => void; onClose: () => void };

export function ConfirmarEntregaDialog({ onConfirm, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { dialogProps, titleProps } = useDialog({}, ref);

  return (
    <div {...dialogProps} ref={ref}>
      <h2 {...titleProps}>Confirmar entrega</h2>
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  );
}
```
Resultado esperado: un lector de pantalla anuncia "Confirmar entrega, diálogo" al abrirlo, y el árbol de accesibilidad de DevTools muestra `role="dialog"` con ese nombre.

**Fallo deliberado:** quita `{...dialogProps}` y `{...titleProps}` del JSX, dejando el `div` y el `h2` planos. El diálogo se ve idéntico, pero la pestaña "Accessibility" de Chrome DevTools ya no muestra ningún `role="dialog"` ni nombre accesible para ese nodo — confirmable sin tocar un lector de pantalla real.

#### Paso 5 · Práctica guiada
Pista: usa la pestaña "Accessibility" de Chrome DevTools para inspeccionar el nodo del diálogo antes y después de quitar los props — el rol y el nombre accesible desaparecen del árbol, no solo de la apariencia visual.

#### Paso 6 · Práctica independiente
Restaura los props de `useDialog`, agrega `useModal`/`FocusScope` para confirmar que Tab no puede escapar del diálogo mientras está abierto, y agrega una prueba automática con `jest-axe` que falle si el `role="dialog"` o el nombre accesible faltan.

#### Paso 7 · Cierre
Entrega el diálogo accesible del Paso 4, la pérdida de semántica confirmada en el árbol de accesibilidad del Paso 5, y el atrapado de foco más la prueba con `jest-axe` del Paso 6; explica por qué un componente puede verse idéntico y a la vez ser invisible para un lector de pantalla. Como siguiente paso, estudia i18n para que los textos de ese mismo diálogo sean traducibles. Errores comunes: confiar en que "se ve bien" es lo mismo que "es accesible"; reinventar el atrapado de foco a mano en vez de usar `useModal`/`FocusScope`. Fuente oficial: https://react-spectrum.adobe.com/react-aria/useDialog.html.

### Tema 4: i18n, pluralización y RTL

#### Paso 1 · Objetivo y preparación
Al finalizar vas a configurar `next-intl` para `/[locale]/envios/[id]` con un mensaje pluralizado correctamente ("1 envío" vs. "3 envíos") y `dir="rtl"` para un locale árabe, y vas a reproducir el fallo de una clave de traducción faltante en un idioma. **Prerrequisitos:** Tema 3 de este módulo y Módulo 13, Tema 4 (locale y zona decididos en el servidor).

#### Paso 2 · Contexto y caso real
Agregar un locale "ar" para la expansión de RutaFlow a Medio Oriente expuso dos problemas a la vez: la regla de plural de "N envíos" no tiene la misma forma en árabe que en español (el árabe tiene seis categorías de plural, no dos), y el layout no invertía su dirección, dejando íconos y texto visualmente al revés.

#### Paso 3 · Teoría, modelo mental y analogía
Las reglas de pluralización son categorías CLDR específicas de cada idioma (`zero`/`one`/`two`/`few`/`many`/`other`), no una simple singular-o-plural; una librería con ICU MessageFormat elige la categoría correcta en vez de un `count === 1 ? ... : ...` escrito a mano. El atributo `dir` en `<html>` controla la dirección de lectura de toda la página y debe fijarse por locale en la raíz, no quedar fijo en "ltr". La analogía: una carta modelo con un espacio en blanco para una cantidad tiene que usar la forma gramatical correcta para ese número en ese idioma — "1 día" frente a "2 días" frente a, en árabe, hasta seis formas distintas según la cantidad.

**¿Por qué es importante?** Una clave de traducción faltante en un idioma debe producir un error detectable en build o en CI, nunca un texto de respaldo silencioso que solo se descubre al llegar a producción.

**Conceptos clave:** categorías CLDR de plural, `dir` por locale, paridad de claves entre idiomas.

---

**Transferencia al proyecto integrador «Portal de clientes»:** Configura mensajes y dirección del documento por locale. Prueba varias cantidades y navegación entre idiomas, verificando que la misma guía mantiene identidad y autorización aunque cambie su presentación.
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.

#### Paso 4 · Demostración guiada
**Desde cero:** trabaja en el proyecto `rutaflow-next` del Tema 1 y escribe los archivos de este tema.


Desde la raíz de `rutaflow-next`, ejecuta:

```bash
npm run build
npm run start
```

Abre las rutas de envíos con los locales configurados; inspecciona `lang` y `dir` en `<html>` y prueba cantidades 0, 1, 2, 3 y 11.

Guarda en `messages/es.json`:

```json
{ "envios": "{count, plural, one {# envío} other {# envíos}}" }
```
Guarda en `messages/ar.json`:

```json
{ "envios": "{count, plural, zero {بدون شحنات} one {شحنة واحدة} two {شحنتان} few {# شحنات} many {# شحنة} other {# شحنة}}" }
```
Este layout localizado reemplaza al layout raíz anterior; mueve las rutas públicas bajo `[locale]` y configura el enrutamiento y los mensajes de next-intl antes de probarlo. No anides dos etiquetas `<html>`.

```tsx
// app/[locale]/layout.tsx
type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  return (
    <html lang={locale} dir={dir}>
      <body>{children}</body>
    </html>
  );
}
```
Resultado esperado: con el locale "ar", el documento tiene `dir="rtl"` y el conteo de envíos usa la categoría plural árabe correcta según la cantidad, no la regla binaria de español.

**Fallo deliberado:** agrega la clave `envios` solo a `messages/es.json`, sin tocar `messages/ar.json`. Al visitar `/ar/envios`, `next-intl` no encuentra la clave para ese locale: la build falla (o la ruta lanza un error en runtime, según la configuración de `onError`), nunca muestra silenciosamente el texto en español como reemplazo.

#### Paso 5 · Práctica guiada
Pista: corre la build (o visita `/ar/envios` en desarrollo) inmediatamente después de agregar la clave a un solo archivo de idioma — el error aparece ahí, antes de que alguien reporte un texto roto en producción.

#### Paso 6 · Práctica independiente
Agrega la clave `envios` a `messages/ar.json` con las categorías de plural correctas, y agrega una prueba que recorra todas las claves de `messages/es.json` confirmando que cada una tiene su equivalente en `messages/ar.json`, para detectar claves faltantes en CI en vez de en producción.

#### Paso 7 · Cierre
Entrega la pluralización y el `dir="rtl"` funcionando del Paso 4, la build rota por la clave faltante del Paso 5, y la prueba de paridad de claves del Paso 6; explica por qué una clave de traducción faltante debe ser un error detectable, nunca un texto de respaldo silencioso. Con esto cierras el track completo de React, listo para operar en producción real. Errores comunes: tratar la pluralización como un simple singular/plural binario cuando el idioma destino tiene más categorías; fijar `dir="ltr"` de forma fija en vez de derivarlo del locale activo. Fuente oficial: https://next-intl.dev/docs/usage/messages#plurals.
