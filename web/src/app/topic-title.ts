import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Fragmento de un título de tema: texto normal o código entre comillas invertidas. */
export interface TitlePart {
  readonly text: string;
  readonly code: boolean;
}

/**
 * Separa un título como "Variables, conversiones y `String`" en fragmentos de texto y de código.
 * Una comilla invertida sin pareja se conserva como texto para no perder caracteres.
 */
export function titleParts(title: string): TitlePart[] {
  const parts: TitlePart[] = [];
  const pattern = /`([^`]+)`/g;
  let cursor = 0;
  for (const match of title.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > cursor) parts.push({ text: title.slice(cursor, start), code: false });
    parts.push({ text: match[1], code: true });
    cursor = start + match[0].length;
  }
  if (cursor < title.length) parts.push({ text: title.slice(cursor), code: false });
  return parts;
}

/** Título sin comillas invertidas, para búsqueda, atributos title y textos planos. */
export function plainTitle(title: string): string {
  return titleParts(title).map(part => part.text).join('');
}

/** Muestra un título de tema con los fragmentos de código en <code>, sin usar innerHTML. */
@Component({
  selector: 'app-topic-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    code {
      font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
      font-size: 0.92em;
      padding: 0 0.25em;
      border-radius: 3px;
      background: color-mix(in srgb, currentColor 8%, transparent);
    }
  `,
  template: `@for (part of parts(); track $index) {@if (part.code) {<code>{{ part.text }}</code>} @else {{{ part.text }}}}`,
})
export class TopicTitle {
  readonly title = input.required<string>();
  protected readonly parts = computed(() => titleParts(this.title()));
}
