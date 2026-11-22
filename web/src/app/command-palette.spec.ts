import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CommandPaletteComponent } from './command-palette';
import { CommandPaletteService } from './command-palette.service';
import { TopicIndexService } from './topic-index.service';

@Component({
  imports: [CommandPaletteComponent],
  template: `
    <button id="trigger" (click)="palette.open()">Buscar</button>
    <app-command-palette />
  `,
})
class Host {
  readonly palette = inject(CommandPaletteService);
}

describe('paleta de búsqueda (specs/025 C2)', () => {
  let root: HTMLElement;
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    root = document.createElement('app-root');
    document.body.appendChild(root);
    const page = document.createElement('div');
    page.id = 'page';
    root.appendChild(page);
    const paletteHost = document.createElement('app-command-palette');
    root.appendChild(paletteHost);

    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [
        provideRouter([]),
        { provide: TopicIndexService, useValue: { allTopics: () => [] } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    paletteHost.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    root.remove();
  });

  it('abre desde un botón con el foco en el campo y el fondo inerte', async () => {
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLButtonElement>('#trigger')!;
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = host.querySelector<HTMLInputElement>('input')!;
    expect(document.activeElement).toBe(input);
    expect(document.querySelector('#page')?.hasAttribute('inert')).toBe(true);
  });

  it('limpia la búsqueda y restaura el foco al cerrar', async () => {
    const service = TestBed.inject(CommandPaletteService);
    const host = fixture.nativeElement as HTMLElement;
    const trigger = host.querySelector<HTMLButtonElement>('#trigger')!;
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = host.querySelector<HTMLInputElement>('input')!;
    input.value = 'java';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    service.close();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('#page')?.hasAttribute('inert')).toBe(false);
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(trigger);

    service.open();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.querySelector<HTMLInputElement>('input')?.value).toBe('');
  });
});
