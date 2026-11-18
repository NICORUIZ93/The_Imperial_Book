import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'imperial-book-book-mode';
/** Clave anterior: se sigue leyendo para no perder la preferencia guardada. */
const LEGACY_KEY = 'academia-floci-book-mode';

/**
 * Modo de lectura del capítulo. Encendido, cada tema se lee como una página
 * de libro (portada, temas y cierre); apagado, el capítulo completo queda
 * visible en una sola columna. La preferencia se recuerda entre visitas.
 */
@Injectable({ providedIn: 'root' })
export class BookModeService {
  readonly enabled = signal<boolean>(this.loadInitial());

  setEnabled(value: boolean): void {
    this.enabled.set(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off');
    } catch {
      // localStorage no disponible: la preferencia dura solo esta visita.
    }
  }

  toggle(): void {
    this.setEnabled(!this.enabled());
  }

  private loadInitial(): boolean {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
      if (saved === 'on') return true;
      if (saved === 'off') return false;
    } catch {
      // localStorage no disponible: se usa el modo libro por defecto.
    }
    return true;
  }
}
