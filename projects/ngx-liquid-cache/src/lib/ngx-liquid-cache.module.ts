import {APP_INITIALIZER, InjectionToken, ModuleWithProviders, NgModule} from '@angular/core';
import {LiquidCacheService} from './services/liquid-cache.service';
import {LiquidCacheServiceFactory, LiquidCacheConfigService} from './services/private';

export enum LiquidCacheTypes {
    inMemory = 'inMemory'
    // localStorage  = 'localStorage'
}

export interface LiquidCacheConfig {
    expiration: Number;
    type: LiquidCacheTypes;
}

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
                LiquidCacheService,
                {
                    provide: APP_INITIALIZER,
                    useFactory: LiquidCacheServiceFactory,
                    deps: [LiquidCacheService],
                    multi: true
                }
            ]
        };
    }
}
