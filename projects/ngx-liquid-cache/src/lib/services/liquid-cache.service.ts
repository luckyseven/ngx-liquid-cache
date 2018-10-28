import { Inject, Injectable } from '@angular/core';
import { isObservable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Md5 } from 'ts-md5/dist/md5';
import { LiquidCacheConfigService } from './private';
import { LiquidCacheObject, LiquidCacheObjectType } from '../models/liquid-cache-object';

@Injectable({
  providedIn: 'root'
})
export class LiquidCacheService {

    cachedElements = {};

    constructor(@Inject(LiquidCacheConfigService) public config) {}

    loadDecorator() {
        DecoratorLiquidCacheService.cacheService = this;
    }

    set(key: string, value: any, type: LiquidCacheObjectType = LiquidCacheObjectType.Observable) {
        this.cachedElements[key] = new LiquidCacheObject(key, value, type);
    }

    get(key: string) {
        if (this.has(key)) {
            const cacheObject = <LiquidCacheObject> this.cachedElements[key];
            return cacheObject.value;
        }
        return null;
    }

    has(key: string) {
        return this.cachedElements[key] !== undefined;
    }

    is(key: string, type: LiquidCacheObjectType = LiquidCacheObjectType.Observable) {
        if (this.has(key)) {
            const cacheObject = <LiquidCacheObject> this.cachedElements[key];
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


export function LiquidCache(key: string, config = {}) {
  const getParametersArray = f => f.toString ().replace (/[\r\n\s]+/g, ' ').
    match (/(?:function\s*\w*)?\s*(?:\((.*?)\)|([^\s]+))/).
    slice (1, 3).
    join ('').
    split (/\s*,\s*/);

  return function(target, fkey, descriptor) {
      if (descriptor === undefined) {
          descriptor = Object.getOwnPropertyDescriptor(target, fkey);
      }
      const originalMethod = descriptor.value;

      descriptor.value = function () {
          const args = Object.assign([], arguments);

          let parsedKey;

          if (config['cacheByParameters']) {
              parsedKey = JSON.parse(JSON.stringify(key) + Md5.hashStr(args.join()));
          } else {
              const functionParameters = getParametersArray(originalMethod);
              parsedKey = DecoratorLiquidCacheService.parseKey(key, functionParameters, args);
          }

          if (DecoratorLiquidCacheService.cacheService.has(parsedKey)) {
              const cacheObject = DecoratorLiquidCacheService.cacheService.get(parsedKey);
              if (DecoratorLiquidCacheService.cacheService.is(parsedKey, LiquidCacheObjectType.Observable)) {
                  return of (cacheObject);
              }
              return cacheObject;
          }

          const result = originalMethod.apply(this, args);

          if (isObservable(result)) {
              return result.pipe(
                  map(results => {
                          DecoratorLiquidCacheService.cacheService.set(parsedKey, results);
                          return results;
                      }
                  )
              );
          } else {
              DecoratorLiquidCacheService.cacheService.set(parsedKey, result, LiquidCacheObjectType.Static);
              return result;
          }

      };
      return descriptor;
  };
}
