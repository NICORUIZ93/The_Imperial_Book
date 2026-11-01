import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Injector, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, X } from 'lucide-angular';
import { TRACKS } from './course-data';
import { CommandPaletteService } from './command-palette.service';
import { TopicIndexService } from './topic-index.service';

interface SearchEntry {
  label: string;
  sublabel: string;
  keywords: string;
  route: string[];
  fragment?: string;
}

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform ?? navigator.userAgent ?? '');

@Component({
  selector: 'app-command-palette',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.scss',
})
export class CommandPaletteComponent {
  readonly icons = { Search, X };
  readonly shortcutLabel = isMac ? '⌘K' : 'Ctrl+K';
  readonly query = signal('');
  readonly activeIndex = signal(0);
  readonly activeResultId = computed(() => this.results().length ? `palette-result-${this.activeIndex()}` : null);
  private readonly paletteInput = viewChild<ElementRef<HTMLInputElement>>('paletteInput');
  private previousFocus: HTMLElement | null = null;

  private readonly topicIndex = inject(TopicIndexService);
  private readonly injector = inject(Injector);
  private readonly index = computed<SearchEntry[]>(() => TRACKS.flatMap(track => {
    const modules = track.modules.map(module => ({
      label: module.title,
      sublabel: `${track.name} · ${module.level}`,
      keywords: module.concepts.join(' '),
      route: ['/curso', track.id, String(module.id)],
    }));
    const topics = this.topicIndex.allTopics()
      .filter(topic => topic.trackId === track.id)
      .map(topic => ({
        label: topic.title,
        sublabel: `${track.name} · tema`,
        keywords: `${track.name} ${track.tagline}`,
        route: ['/curso', track.id, String(topic.moduleId)],
        fragment: topic.fragment,
      }));
    return [
      { label: track.name, sublabel: `Curso completo · ${track.modules.length} módulos`, keywords: track.tagline, route: ['/curso', track.id] },
      ...modules,
      ...topics,
    ];
  }));

  readonly results = computed<SearchEntry[]>(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.index().slice(0, 8);
    return this.index()
      .filter(entry => `${entry.label} ${entry.sublabel} ${entry.keywords}`.toLowerCase().includes(q))
      .slice(0, 20);
  });

  constructor(
    readonly paletteService: CommandPaletteService,
    private readonly router: Router,
  ) {}

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.paletteService.toggle();
      this.query.set('');
      this.activeIndex.set(0);
      if (this.paletteService.isOpen()) afterNextRender(() => this.paletteInput()?.nativeElement.focus(), { injector: this.injector });
    } else if (this.paletteService.isOpen() && event.key === 'ArrowDown' && this.results().length) {
      event.preventDefault();
      this.activeIndex.update(index => (index + 1) % this.results().length);
    } else if (this.paletteService.isOpen() && event.key === 'ArrowUp' && this.results().length) {
      event.preventDefault();
      this.activeIndex.update(index => (index - 1 + this.results().length) % this.results().length);
    } else if (this.paletteService.isOpen() && event.key === 'Enter' && this.results().length) {
      event.preventDefault();
      this.select(this.results()[this.activeIndex()]);
    } else if (event.key === 'Escape' && this.paletteService.isOpen()) {
      this.close();
    } else if (this.paletteService.isOpen() && event.key === 'Tab') {
      const dialog = document.querySelector<HTMLElement>('.palette');
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>('input, button:not([disabled])'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  updateQuery(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  select(entry: SearchEntry): void {
    const fragment = entry.fragment;
    this.router.navigate(entry.route, fragment ? { fragment } : undefined);
    this.paletteService.close();
    this.query.set('');
    this.activeIndex.set(0);
    const previousFocus = this.previousFocus;
    this.previousFocus = null;
    requestAnimationFrame(() => previousFocus?.focus());
  }

  close(): void {
    this.paletteService.close();
  }
}
