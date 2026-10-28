import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

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
  ]
};
