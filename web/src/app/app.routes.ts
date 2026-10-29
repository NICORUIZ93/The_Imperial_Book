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
  {
    path: 'laboratorio/cloud-local',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'curso/:trackId',
    loadComponent: () => import('./course/course-shell').then(m => m.CourseShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: '0' },
      { path: ':moduleId', loadComponent: () => import('./course/lesson-viewer').then(m => m.LessonViewerComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
