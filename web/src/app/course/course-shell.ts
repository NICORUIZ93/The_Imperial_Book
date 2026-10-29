import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { ArrowLeft, LucideAngularModule, Menu, Moon, Search, Sun, X } from 'lucide-angular';
import { map } from 'rxjs';
import { findTrack } from '../course-data';
import { CommandPaletteService } from '../command-palette.service';
import { ProgressService } from '../progress.service';
import { ThemeService } from '../theme.service';
import { LessonIndexComponent } from './lesson-index';
import { findOfficialLearningPath } from '../official-learning-paths';

@Component({
  selector: 'app-course-shell',
  imports: [CommonModule, RouterLink, RouterOutlet, LucideAngularModule, LessonIndexComponent],
  templateUrl: './course-shell.html',
  styleUrl: './course-shell.scss',
})
export class CourseShellComponent {
  readonly icons = { ArrowLeft, Menu, Search, X, Sun, Moon };
  readonly progressService = inject(ProgressService);
  readonly paletteService = inject(CommandPaletteService);
  readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);

  // Reactivo (no snapshot): Angular reutiliza esta instancia al navegar entre tracks hermanos
  // (ej. desde la paleta de comandos), así que el trackId debe seguir al ActivatedRoute.
  readonly trackId = toSignal(
    this.route.paramMap.pipe(map(params => params.get('trackId') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('trackId') ?? '' },
  );
  readonly track = computed(() => findTrack(this.trackId()));
  readonly officialPath = computed(() => findOfficialLearningPath(this.trackId()));
  readonly sidebarOpen = signal(false);
  private readonly openSidebarButton = viewChild<ElementRef<HTMLButtonElement>>('openSidebarButton');
  readonly trackLogo = computed(() => {
    const id = this.trackId();
    return id && id !== 'rutaflow' ? `brands/${id}.svg` : null;
  });

  readonly percent = computed(() => {
    const track = this.track();
    return track ? this.progressService.percentComplete(track.id, track.modules.length) : 0;
  });

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.sidebarOpen()) return;
    event.preventDefault();
    this.closeSidebar();
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
    requestAnimationFrame(() => this.openSidebarButton()?.nativeElement.focus());
  }
}
