import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { NgSelectConfig } from '@ng-select/ng-select';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { authInterceptor } from './core/interceptors/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    { provide: NgSelectConfig, useFactory: () => Object.assign(new NgSelectConfig(), { appendTo: 'body', notFoundText: 'Sin resultados', disableVirtualScroll: true }) },
  ],
};
