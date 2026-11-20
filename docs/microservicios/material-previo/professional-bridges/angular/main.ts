import { Component, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CanDeactivateFn, provideRouter, RouterLink, RouterOutlet } from '@angular/router';

@Component({ selector: 'app-editor', standalone: true, imports: [RouterLink], template: `
  <h1>Observación de la entrega</h1>
  <label for="nota">Nota</label>
  <textarea id="nota" [value]="text()" (input)="edit($event)"></textarea>
  <button (click)="saved.set(text())">Guardar en esta sesión</button>
  <p>{{ text() !== saved() ? 'Cambios sin guardar' : 'Sin cambios pendientes' }}</p>
  <a routerLink="/salir">Ir al listado</a>` })
class Editor {
  text = signal('');
  saved = signal('');
  edit(event: Event) { this.text.set((event.target as HTMLTextAreaElement).value); }
}
const confirmExit: CanDeactivateFn<Editor> = editor =>
  editor.text() === editor.saved() || confirm('Hay cambios sin guardar. ¿Salir?');

@Component({ selector: 'app-listado', standalone: true, imports: [RouterLink],
  template: '<h1>Listado</h1><a routerLink="/">Volver al editor</a>' })
class Listado {}
@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet],
  template: '<main><router-outlet /></main>' })
class App {}
bootstrapApplication(App, { providers: [provideRouter([
  { path: '', component: Editor, canDeactivate: [confirmExit] },
  { path: 'salir', component: Listado }
])] }).catch(console.error);
