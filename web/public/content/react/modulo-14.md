# Módulo 14: Next.js en producción: caché, Proxy, imágenes, React Aria e i18n


## Aprende construyendo

**Qué queda fuera y dónde está:** Server Components, streaming con `Suspense` y Server Actions se enseñan en el Módulo 10; la autorización dentro de una acción y la frontera de seguridad cliente/servidor, en el Módulo 13, Tema 3; la hidratación determinista y el formato de fechas por zona, en el Módulo 13, Tema 4. Este módulo parte de esas bases y solo trata lo que no aparece antes: caché ISR, metadatos y Proxy, imágenes y fuentes, componentes accesibles con React Aria e internacionalización con mensajes ICU.

**Proyecto del módulo:** todos los temas trabajan en un proyecto Next.js 16 nuevo, `rutaflow-next`, creado en el Tema 1 sin carpeta `src` (el alias `@/` apunta a la raíz). Usa Node 24 LTS.


### Tema 1: Next.js ISR, Metadata y Proxy (antes Middleware) · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar distinguirás una redirección temprana de una autorización y observarás regeneración de HTML público. Prerrequisitos: Módulo 10 (App Router y Server Components) y Módulo 13, Tema 3 (autorización en el servidor). Este ejemplo usa Next.js 16, runtime Node y la configura…

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
