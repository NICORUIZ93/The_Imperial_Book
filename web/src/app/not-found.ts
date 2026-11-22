import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, LucideAngularModule],
  template: `
    <main id="main-content" class="not-found">
      <p class="eyebrow">Error 404</p>
      <h1>Esta página no existe</h1>
      <p>La dirección que abriste no corresponde a ningún curso, tema ni sección de la academia.</p>
      <a routerLink="/">Volver al catálogo <lucide-icon [img]="icons.ArrowLeft" /></a>
    </main>
  `,
  styles: [`
    :host { display: block; }
    .not-found { max-width: 42rem; margin: 0 auto; padding: 5rem 1.5rem; text-align: center; }
    h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); margin: 0.5rem 0 1rem; }
    p { color: var(--color-text-muted, #6b7280); }
    a { display: inline-flex; gap: 0.5rem; align-items: center; margin-top: 1.5rem; }
  `],
})
export class NotFoundComponent {
  readonly icons = { ArrowLeft };
}
