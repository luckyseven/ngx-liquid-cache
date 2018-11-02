import {Inject, Injectable} from '@angular/core';
import {isObservable, of} from 'rxjs';
import {map, share} from 'rxjs/operators';
import {LiquidCacheConfigService} from './private';
import {LiquidCacheObject} from '../models/liquid-cache-object';
import {LiquidCacheConfig, LiquidCacheObjectTypes, LiquidCacheStorageTypes} from '../configuration';

@Injectable({
    providedIn: 'root'
})
export class LiquidCacheService {

    cachedElements = {};
    defaultObjectParameters: LiquidCacheConfig =  {
        duration: null,
        objectType: LiquidCacheObjectTypes.Observable,
        storageType: LiquidCacheStorageTypes.inMemory
    };

    constructor(
        @Inject(LiquidCacheConfigService) configuration
    ) {
        this.defaultObjectParameters = {...this.defaultObjectParameters, ...configuration};
    }

    loadDecorator() {
        DecoratorLiquidCacheService.cacheService = this;
    }

    set(key: string, value: any, configuration: LiquidCacheConfig) {
        const objectConfiguration = {...JSON.parse(JSON.stringify(this.defaultObjectParameters)), ...configuration};
        if (this.has(key)) {
            this.getCacheObject(key).update(value, objectConfiguration);
        } else {
            this.cachedElements[key] = new LiquidCacheObject(key, value, objectConfiguration, this);
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
        return this.cachedElements[key] !== undefined;
    }

    is(key: string, type: LiquidCacheObjectTypes = LiquidCacheObjectTypes.Observable): boolean {
        if (this.has(key)) {
            const cacheObject = <LiquidCacheObject> this.getCacheObject(key);
            return cacheObject.is(type);
        }
        return false;
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
    const getParametersArray = f => f.toString().replace(/[\r\n\s]+/g, ' ').match(/(?:function\s*\w*)?\s*(?:\((.*?)\)|([^\s]+))/).slice(1, 3).join('').split(/\s*,\s*/);

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
                    map(results => {
                            DecoratorLiquidCacheService.cacheService.set(parsedKey, results, configuration);
                            return results;
                        }
                    ),
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
