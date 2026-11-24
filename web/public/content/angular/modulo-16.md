# Módulo 16 (opcional): Angular Native — componentes Angular como vistas nativas reales


## Aprende construyendo

**Módulo opcional.** No forma parte de la ruta principal del curso: la ruta termina en el Módulo 15. Hazlo solo si te interesa evaluar esta tecnología; depende de un proyecto alpha que puede cambiar sin aviso.

Este módulo explora un proyecto experimental del ecosistema (no oficial de Google ni del equipo de Angular) que renderiza componentes Angular directamente como vistas nativas de iOS/Android sobre el renderer Fabric de React Native, sin que React participe en el render. Cada tema usa el código y los requisitos reales del proyecto (alpha, versión `0.x`), sin inflar su madurez ni ocultar sus límites: el objetivo es que evalúes la tecnología con el mismo criterio técnico con el que evaluarías cualquier dependencia nueva para un proyecto real.


### Tema 1: Qué renderiza Angular Native y por qué no es un WebView · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a levantar un proyecto nuevo con el template oficial, confirmar en el propio dispositivo/simulador que lo que se ve es una vista nativa (no un WebView embebido), y explicar con precisión en qué se diferencia este enfoque del de Capacitor/Ionic y del de NativeScri…

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a levantar un proyecto nuevo con el template oficial, confirmar en el propio dispositivo/simulador que lo que se ve es una vista nativa (no un WebView embebido), y explicar con precisión en qué se diferencia este enfoque del de Capacitor/Ionic y del de NativeScript.**

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph Capacitor/Ionic
        A1[Angular] --> A2[WebView] --> A3[Puente a plugin nativo] --> A4[Vista nativa]
    end
    subgraph "Angular Native"
        B1[Angular] --> B2[Fabric renderer] --> B3[Vista nativa]
    end
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
npx create-expo-app@latest rutaflow-conductor --template @ng-native/template
cd rutaflow-conductor
npx expo start
```

```ts
// src/app/app.ts
import { Component, signal } from '@angular/core';
import { Pressable, SafeAreaProvider, SafeAreaView, Text } from '@ng-native/components';

@Component({
  selector: 'app-root',
  imports: [SafeAreaProvider, SafeAreaView, Text, Pressable],
  template: `
    <safe-area-provider>
      <safe-area-view class="screen">
        <text class="title">RutaFlow Conductor</text>
        <pressable accessibilityRole="button" class="button" (press)="contador.set(contador() + 1)">
          <text class="label">Entregas confirmadas: {{ contador() }}</text>
        </pressable>
      </safe-area-view>
    </safe-area-provider>
  `,
  styles: `
    :host { flex: 1; }
    .screen { align-items: center; justify-content: center; gap: 16px; padding: 24px; }
    .title { font-size: 20px; font-weight: bold; }
    .button { padding: 12px 20px; border-radius: 8px; background-color: #dd0031; }
    .button:active { opacity: 0.7; }
    .label { color: white; font-weight: 600; }
  `,
})
export class App {
  protected readonly contador = signal(0);
}
```

```ts
@Component({
  selector: 'app-root',
  imports: [____],
  template: `<pressable (press)="contador.set(contador() + 1)"><text>{{ contador() }}</text></pressable>`,
})
```

</details>

### Tema 2: Signals, estilos nativos compilados y el preset de Tailwind · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a construir una lista de entregas pendientes con estado derivado por computed(), estilada con el preset de Tailwind de Angular Native, y vas a confirmar qué le ocurre a un selector ios:/android: según la plataforma donde corre.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    A[".screen clases Tailwind + ios:/android:"] --> B[Compilador de Angular Native]
    B --> C[Build time: resuelve variante de plataforma]
    C --> D[Estilos nativos embebidos, sin cascada CSS en runtime]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    A[".screen clases Tailwind + ios:/android:"] --> B[Compilador de Angular Native]
    B --> C[Build time: resuelve variante de plataforma]
    C --> D[Estilos nativos embebidos, sin cascada CSS en runtime]
```

```bash
ng new ejemplo
cd ejemplo
```

```ts
// src/app/lista-entregas.ts
import { Component, signal, computed } from '@angular/core';
import { View, Text } from '@ng-native/components';

interface Entrega { guia: string; urgente: boolean; }

@Component({
  selector: 'app-lista-entregas',
  imports: [View, Text],
  template: `
    @for (e of entregas(); track e.guia) {
      <view class="fila ios:py-3 android:py-2" [class.urgente]="e.urgente">
        <text class="texto">{{ e.guia }}</text>
      </view>
    }
    <text class="resumen">Urgentes: {{ urgentes() }}</text>
  `,
  styles: `
    .fila { padding: 8px 16px; border-bottom-width: 1px; border-bottom-color: #e5e7eb; }
    .urgente { background-color: #fef2f2; }
    .texto { font-size: 16px; }
    .resumen { padding: 12px 16px; font-weight: bold; }
  `,
})
export class ListaEntregas {
  protected readonly entregas = signal<Entrega[]>([
    { guia: 'RF-4471', urgente: true },
    { guia: 'RF-4472', urgente: false },
  ]);
  protected readonly urgentes = computed(() => this.entregas().filter(e => e.urgente).length);
}
```

```bash
npx expo start --ios
```

```ts
protected readonly urgentes = ____(() => this.entregas().filter(e => e.urgente).length);
```

</details>

### Tema 3: Router nativo y servicios de Expo inyectados como servicios Angular · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a navegar entre dos pantallas con @angular/router sobre stacks nativos, e inyectar un módulo de Expo (ubicación) como un servicio Angular con inject(), confirmando que el patrón de inyección de dependencias no cambia respecto a Angular web.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    A["/entregas (lista, stack raíz)"] -- "push" --> B["/entregas/:guia (detalle)"]
    B -- "inject LocationService" --> C[Módulo de Expo: ubicación nativa]
    C --> D[Coordenadas reales del dispositivo]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    A["/entregas (lista, stack raíz)"] -- "push" --> B["/entregas/:guia (detalle)"]
    B -- "inject LocationService" --> C[Módulo de Expo: ubicación nativa]
    C --> D[Coordenadas reales del dispositivo]
```

```bash
ng new ejemplo
cd ejemplo
```

```ts
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ListaEntregas } from './lista-entregas';
import { DetalleEntrega } from './detalle-entrega';

export const routes: Routes = [
  { path: 'entregas', component: ListaEntregas },
  { path: 'entregas/:guia', component: DetalleEntrega },
];
```

```ts
// src/app/detalle-entrega.ts
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { View, Text, Pressable } from '@ng-native/components';

@Component({
  selector: 'app-detalle-entrega',
  imports: [View, Text, Pressable],
  template: `
    <view class="detalle">
      <text>Guía: {{ guia }}</text>
      <pressable (press)="confirmarConUbicacion()">
        <text>Confirmar entrega con ubicación</text>
      </pressable>
      @if (coordenadas()) {
        <text>Lat: {{ coordenadas()!.lat }}, Lon: {{ coordenadas()!.lon }}</text>
      }
    </view>
  `,
})
export class DetalleEntrega {
  private readonly ruta = inject(ActivatedRoute);
  protected readonly guia = this.ruta.snapshot.paramMap.get('guia');
  protected readonly coordenadas = signal<{ lat: number; lon: number } | null>(null);

  async confirmarConUbicacion() {
    // En el proyecto real, LocationService viene de @ng-native/expo e inyecta
    // el módulo expo-location correspondiente; aquí se asume inyectado como `location`.
    const posicion = await this.location.obtenerPosicionActual();
    this.coordenadas.set({ lat: posicion.lat, lon: posicion.lon });
  }

  private readonly location = inject(LocationService);
}
```

```bash
npx expo start
```

```ts
private readonly ruta = ____(ActivatedRoute);
protected readonly guia = this.ruta.snapshot.paramMap.get('guia');
```

</details>

### Tema 4: Evaluar la madurez de una tecnología alpha con criterio · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a producir una checklist de evaluación de madurez tecnológica aplicada específicamente a Angular Native (estado 0.x, página de limitaciones conocidas, testing sin simulador), y vas a decidir, con criterio explícito y no con entusiasmo, si lo adoptarías hoy en un…

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a producir una checklist de evaluación de madurez tecnológica aplicada específicamente a Angular Native (estado 0.x, página de limitaciones conocidas, testing sin simulador), y vas a decidir, con criterio explícito y no con entusiasmo, si lo adoptarías hoy en un proyecto con usuarios reales.**

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    A[Evaluar Angular Native] --> B{Página de limitaciones revisada?}
    B -->|No| Z[Evaluación incompleta]
    B -->|Sí| C{Cubre los módulos Expo que necesito?}
    C -->|No| D[Esperar o construir el módulo faltante]
    C -->|Sí| E{Puedo testear sin simulador en CI?}
    E -->|No| F[Costo de CI más alto de lo esperado]
    E -->|Sí| G{Proyecto en 0.x: equipo tolera breaking changes?}
    G -->|No| H[No adoptar todavía en producción]
    G -->|Sí| I[Piloto interno, no cliente final]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    A[Evaluar Angular Native] --> B{Página de limitaciones revisada?}
    B -->|No| Z[Evaluación incompleta]
    B -->|Sí| C{Cubre los módulos Expo que necesito?}
    C -->|No| D[Esperar o construir el módulo faltante]
    C -->|Sí| E{Puedo testear sin simulador en CI?}
    E -->|No| F[Costo de CI más alto de lo esperado]
    E -->|Sí| G{Proyecto en 0.x: equipo tolera breaking changes?}
    G -->|No| H[No adoptar todavía en producción]
    G -->|Sí| I[Piloto interno, no cliente final]
```

```bash
ng new ejemplo
cd ejemplo
```

```bash
npx expo start --no-dev --minify & sleep 1
npm test -- --testPathPattern=detalle-entrega
```

```ts
// src/app/detalle-entrega.test.ts
import { render, screen, fireEvent } from '@ng-native/testing';
import { DetalleEntrega } from './detalle-entrega';

describe('DetalleEntrega', () => {
  it('muestra la guía recibida por parámetro de ruta', async () => {
    await render(DetalleEntrega, { routeParams: { guia: 'RF-4471' } });
    expect(screen.getByText('Guía: RF-4471')).toBeTruthy();
  });
});
```

```ts
import { ____ , screen } from '@ng-native/testing';
await ____(DetalleEntrega, { routeParams: { guia: 'RF-4471' } });
```

</details>
