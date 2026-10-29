import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'academia-floci-theme';

/**
 * Tema claro/oscuro compartido por toda la app (catálogo, course-shell,
 * lesson-viewer, command-palette). Persiste en localStorage y aplica el
 * atributo [data-theme] en <html>, que es lo que leen las variables CSS
 * definidas en src/styles.scss y src/styles/_tokens.scss.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.loadInitial());

  constructor() {
    this.apply(this.theme());
  }

  private loadInitial(): Theme {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // localStorage no disponible: se ignora
    }
    // Edición libro: la página blanca es la identidad por defecto; el modo
    // oscuro ("lectura nocturna") queda a un clic y se recuerda.
    return 'light';
  }

  private apply(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage no disponible: se ignora
    }
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }
}
