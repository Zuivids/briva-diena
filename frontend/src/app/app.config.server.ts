import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { HttpBackend } from '@angular/common/http';
import { appConfig } from './app.config';
import { ServerApiBackend } from './shared/services/server-api.backend';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: HttpBackend, useClass: ServerApiBackend }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
