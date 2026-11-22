import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./catalog/course-catalog').then(m => m.CourseCatalogComponent),
  },
  {
    path: 'catalogo',
    loadComponent: () => import('./catalog/course-catalog').then(m => m.CourseCatalogComponent),
  },
  // Rutas históricas del laboratorio: se conservan aunque el resto de URLs desconocidas den 404.
  {
    path: 'laboratorio/cloud-local',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'laboratorio/floci',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'temario',
    loadComponent: () => import('./catalog/curriculum-library').then(m => m.CurriculumLibraryComponent),
  },
  {
    path: 'temario/:stackId',
    loadComponent: () => import('./catalog/curriculum-library').then(m => m.CurriculumStackComponent),
  },
  {
    path: 'curso/:trackId',
    loadComponent: () => import('./course/course-shell').then(m => m.CourseShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      { path: 'overview', loadComponent: () => import('./course/track-overview').then(m => m.TrackOverviewComponent) },
      { path: ':moduleId/tema/:topicIndex', loadComponent: () => import('./course/lesson-viewer').then(m => m.LessonViewerComponent) },
      { path: ':moduleId', loadComponent: () => import('./course/lesson-viewer').then(m => m.LessonViewerComponent) },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./not-found').then(m => m.NotFoundComponent),
  },
];
