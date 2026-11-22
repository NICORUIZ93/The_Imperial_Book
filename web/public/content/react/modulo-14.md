# Módulo 14: Next.js en producción: caché, Proxy, imágenes, React Aria e i18n


## Aprende construyendo

**Qué queda fuera y dónde está:** Server Components, streaming con `Suspense` y Server Actions se enseñan en el Módulo 10; la autorización dentro de una acción y la frontera de seguridad cliente/servidor, en el Módulo 13, Tema 3; la hidratación determinista y el formato de fechas por zona, en el Módulo 13, Tema 4. Este módulo parte de esas bases y solo trata lo que no aparece antes: caché ISR, metadatos y Proxy, imágenes y fuentes, componentes accesibles con React Aria e internacionalización con mensajes ICU.

**Proyecto del módulo:** todos los temas trabajan en un proyecto Next.js 16 nuevo, `rutaflow-next`, creado en el Tema 1 sin carpeta `src` (el alias `@/` apunta a la raíz). Usa Node 24 LTS.


### Tema 1: Next.js ISR, Metadata y Proxy (antes Middleware) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar distinguirás una redirección temprana de una autorización y observarás regeneración de HTML público. Prerrequisitos: Módulo 10 (App Router y Server Components) y Módulo 13, Tema 3 (autorización en el servidor). Este ejemplo usa Next.js 16, runtime Node y la configura…

#### ► LA IDEA EN UNA FRASE
**Al finalizar distinguirás una redirección temprana de una autorización y observarás regeneración de HTML público.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en next.js isr, metadata y proxy (antes middleware) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que next.js isr, metadata y proxy (antes middleware) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Next.js ISR, Metadata y Proxy (antes Middleware) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Next.js ISR, Metadata y Proxy (antes Middleware) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses next.js isr, metadata y proxy (antes middleware) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: next.js isr, metadata y proxy (antes middleware) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Next.js ISR, Metadata y Proxy (antes Middleware) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve next.js isr, metadata y proxy (antes middleware) en tu contexto?
2. ¿Cómo sabrías que next.js isr, metadata y proxy (antes middleware) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar next.js isr, metadata y proxy (antes middleware)?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
npx create-next-app@latest rutaflow-next --ts --app --no-src-dir --use-npm --yes
cd rutaflow-next
```

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

```bash
npm run build
npm run start
```

</details>

### Tema 2: Optimización de imágenes y fuentes · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a construir app/components/Photo.tsx con next/image y dimensiones explícitas para la foto de evidencia de entrega, y vas a cargar una fuente con next/font en vez de un <link> bloqueante, midiendo el CLS antes y después. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a construir app/components/Photo.tsx con next/image y dimensiones explícitas para la foto de evidencia de entrega, y vas a cargar una fuente con next/font en vez de un <link> bloqueante, midiendo el CLS antes y después.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en optimización de imágenes y fuentes como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que optimización de imágenes y fuentes resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Optimización de imágenes y fuentes se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Optimización de imágenes y fuentes | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses optimización de imágenes y fuentes por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: optimización de imágenes y fuentes funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Optimización de imágenes y fuentes existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve optimización de imágenes y fuentes en tu contexto?
2. ¿Cómo sabrías que optimización de imágenes y fuentes no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar optimización de imágenes y fuentes?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
npm run build
npm run start
```

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

</details>

### Tema 3: Accesibilidad y React Aria · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a construir app/components/Dialog.tsx con useDialog de React Aria para confirmar "marcar como entregado", y vas a reproducir el fallo de un diálogo construido como un <div> plano que es invisible para un lector de pantalla. Prerrequisitos: Tema 2 de este módulo y…

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a construir app/components/Dialog.tsx con useDialog de React Aria para confirmar "marcar como entregado", y vas a reproducir el fallo de un diálogo construido como un <div> plano que es invisible para un lector de pantalla.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en accesibilidad y react aria como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que accesibilidad y react aria resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Accesibilidad y React Aria se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Accesibilidad y React Aria | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses accesibilidad y react aria por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: accesibilidad y react aria funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Accesibilidad y React Aria existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve accesibilidad y react aria en tu contexto?
2. ¿Cómo sabrías que accesibilidad y react aria no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar accesibilidad y react aria?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
npm run build
npm run start
```

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

</details>

### Tema 4: i18n, pluralización y RTL · Experto · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a configurar next-intl para /[locale]/envios/[id] con un mensaje pluralizado correctamente ("1 envío" vs. "3 envíos") y dir="rtl" para un locale árabe, y vas a reproducir el fallo de una clave de traducción faltante en un idioma. Prerrequisitos: Tema 3 de este mó…

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a configurar next-intl para /[locale]/envios/[id] con un mensaje pluralizado correctamente ("1 envío" vs.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en i18n, pluralización y rtl como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que i18n, pluralización y rtl resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| i18n, pluralización y RTL se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar i18n, pluralización y RTL | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses i18n, pluralización y rtl por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: i18n, pluralización y rtl funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- i18n, pluralización y RTL existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve i18n, pluralización y rtl en tu contexto?
2. ¿Cómo sabrías que i18n, pluralización y rtl no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar i18n, pluralización y rtl?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
npm run build
npm run start
```

```json
{ "envios": "{count, plural, one {# envío} other {# envíos}}" }
```

```json
{ "envios": "{count, plural, zero {بدون شحنات} one {شحنة واحدة} two {شحنتان} few {# شحنات} many {# شحنة} other {# شحنة}}" }
```

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

</details>
