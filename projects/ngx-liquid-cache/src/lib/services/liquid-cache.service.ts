import {Inject, Injectable} from '@angular/core';
import {isObservable, of} from 'rxjs';
import {share, tap} from 'rxjs/operators';
import {LiquidCacheConfigService, LiquidCacheObjectSnapshot} from './private';
import {LiquidCacheObject} from '../models/liquid-cache-object';
import {LiquidCacheConfig, LiquidCacheObjectTypes, LiquidCacheStorageTypes} from '../configuration';

@Injectable({
    providedIn: 'root'
})
export class LiquidCacheService {

    cachedElements = {};
    defaultObjectParameters: LiquidCacheConfig = {
        localStoragePrefix: 'ngxlc-',
        shareBetweenTabs: true,
        duration: null,
        objectType: LiquidCacheObjectTypes.Observable,
        storageType: LiquidCacheStorageTypes.inMemory
    };

    constructor(
        @Inject(LiquidCacheConfigService) configuration
    ) {
        this.defaultObjectParameters = {...this.defaultObjectParameters, ...configuration};
        this.loadFromLocalStorage();
    }

    loadDecorator() {
        DecoratorLiquidCacheService.cacheService = this;
    }

    set(key: string, value: any, configuration: LiquidCacheConfig = {}) {
        const objectConfiguration = {...JSON.parse(JSON.stringify(this.defaultObjectParameters)), ...configuration};
        if (this.has(key)) {
            this.getCacheObject(key).update(value, objectConfiguration);
        } else {
            this.cachedElements[key] = new LiquidCacheObject(key, value, objectConfiguration, this);
        }
        if (objectConfiguration.storageType === LiquidCacheStorageTypes.localStorage) {
            try {
                if (!isObservable(value)) {
                    localStorage.setItem(`${objectConfiguration.localStoragePrefix}${key}`, JSON.stringify(this.getCacheObject(key).snapshot()));
                }
            } catch (e) {
                console.error('LiquidCacheError', e);
                // TODO: manage errors if localStorage doesn't exist
            }
        }
    }

    get(key: string): any {
        if (this.has(key)) {
            const cacheObject = <LiquidCacheObject> this.cachedElements[key];
            return cacheObject.value;
        }
        return null;
    }

    getCacheObject(key: string): LiquidCacheObject {
        return this.cachedElements[key];
    }

    remove(key: string): void {
        const cacheObject = this.getCacheObject(key);
        if (cacheObject) {
            cacheObject.remove();
        }
    }

    clear(): void {
        Object.keys(this.cachedElements).forEach(key => this.remove(key));
    }

    has(key: string): boolean {
        this.checkSharedUpdates(key);
        return this.cachedElements[key] !== undefined;
    }

    is(key: string, type: LiquidCacheObjectTypes = LiquidCacheObjectTypes.Observable): boolean {
        if (this.has(key)) {
            const cacheObject = <LiquidCacheObject> this.getCacheObject(key);
            return cacheObject.is(type);
        }
        return false;
    }

    private loadFromLocalStorage() {
        try {
            Object.keys(localStorage)
                .filter(key => key.startsWith(this.defaultObjectParameters.localStoragePrefix))
                .forEach(key => {
                    const snapshot: LiquidCacheObjectSnapshot = JSON.parse(localStorage.getItem(key));
                    this.createCacheObjectFromSnapshot(snapshot);
                });
        } catch (e) {
            console.error('LiquidCacheError', e);
            // TODO: manage errors if localStorage doesn't exist
        }
    }

    private checkSharedUpdates(key: string) {
        const fromStorage = localStorage.getItem(this.defaultObjectParameters.localStoragePrefix + key)
            ? <LiquidCacheObjectSnapshot> JSON.parse(localStorage.getItem(this.defaultObjectParameters.localStoragePrefix + key))
            : null;

        const fromMemory = this.cachedElements[key] !== undefined
            ? <LiquidCacheObject> this.cachedElements[key]
            : null;

        if (fromStorage && fromStorage.configuration.shareBetweenTabs) {
            if (!fromMemory || fromStorage.lastUpdate > fromMemory.lastUpdate) {
                this.createCacheObjectFromSnapshot(fromStorage);
            }
        }
    }

    private createCacheObjectFromSnapshot(snapshot: LiquidCacheObjectSnapshot): void {
        this.cachedElements[snapshot.key] = new LiquidCacheObject(snapshot.key, snapshot.value, snapshot.configuration, this);
        this.getCacheObject(snapshot.key).expirationCheck(snapshot.expiresAt);
    }
}

class DecoratorLiquidCacheService {
    static cacheService: LiquidCacheService = null;

    static parseKey(name, parameters, args): string {
        let parsedKey = JSON.parse(JSON.stringify(name));
        const usedParameters = parsedKey.match(/\{(.*?)\}/g);
        if (usedParameters === null) {
            return parsedKey;
        }

        usedParameters
            .filter((v, i, a) => a.indexOf(v) === i)
            .forEach(param => {
                const paramIndex = parameters.indexOf(param.replace('{', '').replace('}', ''));
                if (paramIndex > -1) {
                    parsedKey = parsedKey.replace(new RegExp(param, 'g'), args[paramIndex]);
                }
            });

        return parsedKey;
    }
}


export function LiquidCache(key: string, configuration: LiquidCacheConfig = {}) {
    const getParametersArray = f => /\(\s*([^)]+?)\s*\)/.exec(f.toString())[1].split(/\s*,\s*/);

    return function (target, fkey, descriptor) {
        if (descriptor === undefined) {
            descriptor = Object.getOwnPropertyDescriptor(target, fkey);
        }
        const originalMethod = descriptor.value;

        descriptor.value = function () {
            const args = Object.assign([], arguments);

            let parsedKey;

            const functionParameters = getParametersArray(originalMethod);
            parsedKey = DecoratorLiquidCacheService.parseKey(key, functionParameters, args);

            if (DecoratorLiquidCacheService.cacheService.has(parsedKey)) {
                const cacheObject = DecoratorLiquidCacheService.cacheService.get(parsedKey);
                if (DecoratorLiquidCacheService.cacheService.is(parsedKey, LiquidCacheObjectTypes.Observable) && !isObservable(cacheObject)) {
                    return of(cacheObject);
                }
                return cacheObject;
            }

            const result = originalMethod.apply(this, args);

            if (isObservable(result)) {
                const cachedObservble = result.pipe(
                    tap(results => DecoratorLiquidCacheService.cacheService.set(parsedKey, results, configuration)),
                    share()
                );
                DecoratorLiquidCacheService.cacheService.set(parsedKey, cachedObservble, configuration);
                return cachedObservble;
            } else {
                configuration.objectType = LiquidCacheObjectTypes.Static;
                DecoratorLiquidCacheService.cacheService.set(parsedKey, result, configuration);
                return result;
            }
        };
        return descriptor;
    };
}
