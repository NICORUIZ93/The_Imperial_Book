import { Injectable, signal } from '@angular/core';

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform ?? navigator.userAgent ?? '');

@Injectable({ providedIn: 'root' })
export class CommandPaletteService {
  readonly isOpen = signal(false);
  readonly shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';

  open(): void { this.isOpen.set(true); }
  close(): void { this.isOpen.set(false); }
  toggle(): void { this.isOpen.update(value => !value); }
}
