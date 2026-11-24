import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Restaura la posición de scroll al navegar y habilita el scroll nativo al
      // fragment (#ancla). El componente ya hace scroll manual, pero esto da un
      // fallback del router para que el click en un tema lleve al ancla aunque
      // el scroll manual no corra (p. ej. tras recargar con el fragment en la URL).
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    // El libro se lee sin conexión: el service worker guarda la aplicación al
    // instalarse y cada página de contenido la primera vez que se abre.
    // Solo en producción; en `ng serve` estorbaría al recargar cambios.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ]
};
