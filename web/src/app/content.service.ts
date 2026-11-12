import { Injectable } from '@angular/core';
import { marked } from 'marked';

// marked renderiza los bloques ```mermaid como <pre><code class="language-mermaid">.
// mermaid.run() (ver lesson-viewer.ts) busca <pre class="mermaid">, así que se
// reempaqueta la etiqueta después del parseo en vez de escribir un renderer custom.
const MERMAID_BLOCK = /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g;

// ```anatomy\nnombre-de-figura\n``` referencia una figura isométrica interactiva
// (skill "Anatomy") servida como HTML standalone en content/figures/<nombre>/.
// [innerHTML] sanitiza <iframe>, <script>, los atributos data-* Y el id (este
// último por riesgo de DOM clobbering) — verificado empíricamente, no solo por
// la doc. "class" sí sobrevive, así que el slug va codificado ahí; lesson-viewer.ts
// crea el <iframe> real vía DOM API después del render (mismo motivo que
// mermaid.run() se llama fuera del binding de Angular).
const ANATOMY_BLOCK = /<pre><code class="language-anatomy">([\s\S]*?)<\/code><\/pre>/g;
const slugPattern = /^[a-z0-9-]+$/;
export const ANATOMY_SLUG_CLASS_PREFIX = 'anatomy-figure--';

// Fórmulas TeX: \( ... \) en línea y \[ ... \] en bloque (track Control 1).
// Se capturan antes de que marked procese escapes, '_' o '*', y se emiten como
// texto escapado dentro de un contenedor con clase; lesson-viewer.ts las
// renderiza con KaTeX después del binding, igual que mermaid.run().
const escapeTex = (tex: string): string =>
  tex.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

marked.use({
  extensions: [
    {
      name: 'mathBlock',
      level: 'block',
      start: (src: string) => src.match(/^ {0,3}\\\[/m)?.index,
      tokenizer(src: string) {
        const match = /^ {0,3}\\\[([\s\S]+?)\\\][ \t]*(?:\n+|$)/.exec(src);
        return match ? { type: 'mathBlock', raw: match[0], text: match[1].trim() } : undefined;
      },
      renderer: (token) => `<div class="math math-display">${escapeTex(token['text'] as string)}</div>\n`,
    },
    {
      name: 'mathInline',
      level: 'inline',
      start: (src: string) => {
        const index = src.search(/\\[([]/);
        return index >= 0 ? index : undefined;
      },
      tokenizer(src: string) {
        const match = /^\\\(([\s\S]+?)\\\)/.exec(src) ?? /^\\\[([\s\S]+?)\\\]/.exec(src);
        if (!match) return undefined;
        return { type: 'mathInline', raw: match[0], text: match[1], display: match[0].startsWith('\\[') };
      },
      renderer: (token) => token['display']
        ? `<span class="math math-display">${escapeTex(token['text'] as string)}</span>`
        : `<span class="math math-inline">${escapeTex(token['text'] as string)}</span>`,
    },
  ],
});

@Injectable({ providedIn: 'root' })
export class ContentService {
  /** Una lección registrada debe existir. Propagar el error evita presentar como
   * contenido válido una descarga fallida o un Markdown ausente. */
  async loadLessonHtml(trackId: string, moduleId: number): Promise<string> {
    const contentUrl = new URL(`content/${trackId}/modulo-${moduleId}.md`, document.baseURI);
    const response = await fetch(contentUrl);
    if (!response.ok) throw new Error(`No se pudo cargar ${contentUrl.pathname} (${response.status}).`);
    const raw = await response.text();
    const withoutRepeatedTitle = raw.replace(/^#{1,2}\s+[^\n]*\n+/, '');
    const html = marked.parse(withoutRepeatedTitle, { async: false }) as string;
    return html
      .replace(MERMAID_BLOCK, '<pre class="mermaid">$1</pre>')
      .replace(ANATOMY_BLOCK, (match, figureName) => {
        const slug = figureName.trim();
        if (!slugPattern.test(slug)) return match;
        return `<div class="anatomy-figure ${ANATOMY_SLUG_CLASS_PREFIX}${slug}"></div>`;
      });
  }
}
