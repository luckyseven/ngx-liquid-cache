import { InjectionToken } from '@angular/core';
import { LiquidCacheService } from './liquid-cache.service';
import { LiquidCacheConfig } from '../configuration';

export const LiquidCacheConfigService = new InjectionToken<LiquidCacheConfig>('LiquidCacheConfigService');

export function LiquidCacheServiceFactory (liquiCacheService: LiquidCacheService) {
    return () => liquiCacheService.loadDecorator();
}

export interface LiquidCacheObjectSnapshot {
    key: string;
    value: any;
    configuration: LiquidCacheConfig;
    expiresAt: number;
    lastUpdate: number;
}