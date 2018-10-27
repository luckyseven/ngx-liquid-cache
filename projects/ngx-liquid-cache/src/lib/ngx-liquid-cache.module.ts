import { InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { LiquidCacheService } from './services/liquid-cache.service';

export enum LiquidCacheTypes {
  inMemory      = 'inMemory'
  // localStorage  = 'localStorage'
}

export interface LiquidCacheConfig {
    expiration: Number;
    type: LiquidCacheTypes;
}

export const LiquidCacheConfigService = new InjectionToken<LiquidCacheConfig>('LiquidCacheConfigService');

@NgModule()
export class NgxLiquidCacheModule {
  static forRoot(config: LiquidCacheConfig): ModuleWithProviders {
    return {
      ngModule: NgxLiquidCacheModule,
      providers: [
          {
            provide: LiquidCacheConfigService,
            useValue: config
          },
          LiquidCacheService
      ]
    };
  }
}
