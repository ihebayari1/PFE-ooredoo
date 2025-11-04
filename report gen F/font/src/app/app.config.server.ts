import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { appConfig } from './app.config';

// Empty server config for static builds
const serverConfig: ApplicationConfig = {
  providers: []
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
