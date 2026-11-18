import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TopicTitle, plainTitle, titleParts } from './topic-title';

describe('topic-title (specs/001 C3)', () => {
  it('separa el código entre comillas invertidas', () => {
    expect(titleParts('Variables, conversiones y `String`')).toEqual([
      { text: 'Variables, conversiones y ', code: false },
      { text: 'String', code: true },
    ]);
  });

  it('admite varios fragmentos de código y conserva una comilla sin pareja', () => {
    expect(titleParts('`Date`/`Calendar` y más').map(p => p.code)).toEqual([true, false, true, false]);
    expect(plainTitle('precio con ` suelto')).toBe('precio con ` suelto');
  });

  it('quita las comillas invertidas en el texto plano', () => {
    expect(plainTitle('Entrada, `java.time` y por qué evitar (`Date`/`Calendar`)'))
      .toBe('Entrada, java.time y por qué evitar (Date/Calendar)');
  });

  it('renderiza el código en <code> sin mostrar comillas invertidas', () => {
    @Component({ imports: [TopicTitle], template: '<app-topic-title [title]="t" />' })
    class Host { t = 'Hidratación y `provideServerRendering`'; }
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('code')?.textContent).toBe('provideServerRendering');
    expect(element.textContent).toBe('Hidratación y provideServerRendering');
    expect(element.textContent).not.toContain('`');
  });
});
