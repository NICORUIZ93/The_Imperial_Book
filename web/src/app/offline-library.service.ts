import { Injectable, signal } from '@angular/core';
import { CourseModule } from './course-module.model';

export type OfflineState = 'idle' | 'saving' | 'saved' | 'error';

export interface OfflineStatus {
  state: OfflineState;
  done: number;
  total: number;
}

const STORAGE_KEY = 'imperial-book.offline-tracks';
/** Rutas de imágenes y figuras que una lección referencia desde su Markdown. */
const ASSET_PATTERN = /(?:\(|src=["'])((?:\/)?(?:content|visuals|figures)\/[^)"'\s#?]+)/g;

/**
 * Descarga un curso completo para leerlo sin conexión.
 *
 * No guarda nada por su cuenta: pide cada archivo y el service worker, que
 * intercepta esas peticiones, los guarda en su caché (grupo «libro» de
 * ngsw-config.json). Sin service worker (por ejemplo en `ng serve`) la descarga
 * funciona igual, pero no deja copia offline; por eso se informa del caso.
 */
@Injectable({ providedIn: 'root' })
export class OfflineLibraryService {
  private readonly statuses = signal<Record<string, OfflineStatus>>(this.restore());

  readonly available = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;

  status(trackId: string): OfflineStatus {
    return this.statuses()[trackId] ?? { state: 'idle', done: 0, total: 0 };
  }

  async saveTrack(trackId: string, modules: readonly CourseModule[]): Promise<void> {
    if (this.status(trackId).state === 'saving') return;
    const lessonUrls = modules.map(m => this.url(`content/${trackId}/modulo-${m.id}.md`));
    this.update(trackId, { state: 'saving', done: 0, total: lessonUrls.length });

    try {
      const assets = new Set<string>();
      let done = 0;
      for (const url of lessonUrls) {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`${url} respondió ${response.status}`);
        for (const match of (await response.text()).matchAll(ASSET_PATTERN)) {
          assets.add(this.url(match[1].replace(/^\//, '')));
        }
        done++;
        this.update(trackId, { state: 'saving', done, total: lessonUrls.length + assets.size });
      }
      for (const url of assets) {
        // Una figura ausente no debe impedir leer el resto del curso.
        await fetch(url).catch(() => undefined);
        done++;
        this.update(trackId, { state: 'saving', done, total: lessonUrls.length + assets.size });
      }
      this.update(trackId, { state: 'saved', done, total: done });
      this.persist();
    } catch {
      this.update(trackId, { state: 'error', done: 0, total: 0 });
    }
  }

  private url(path: string): string {
    return new URL(path, document.baseURI).toString();
  }

  private update(trackId: string, status: OfflineStatus): void {
    this.statuses.update(all => ({ ...all, [trackId]: status }));
  }

  private restore(): Record<string, OfflineStatus> {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      return Object.fromEntries(saved.map(id => [id, { state: 'saved' as const, done: 0, total: 0 }]));
    } catch {
      return {};
    }
  }

  private persist(): void {
    try {
      const saved = Object.entries(this.statuses())
        .filter(([, s]) => s.state === 'saved')
        .map(([id]) => id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // Sin almacenamiento local solo se pierde el recuerdo del botón, no la caché.
    }
  }
}
