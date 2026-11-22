import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NotFoundComponent } from './not-found';

describe('página 404 (specs/025 C4)', () => {
  it('explica el error y ofrece volver al catálogo', () => {
    @Component({ imports: [NotFoundComponent], template: '<app-not-found />' })
    class Host {}
    TestBed.configureTestingModule({ imports: [Host], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Esta página no existe');
    expect(element.querySelector('main')?.id).toBe('main-content');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/');
  });
});
