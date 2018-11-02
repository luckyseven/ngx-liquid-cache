import {LiquidCacheService} from '../services/liquid-cache.service';
import {LiquidCacheConfig, LiquidCacheObjectTypes} from '../configuration';



export class LiquidCacheObject {
    cacheService: LiquidCacheService;
    key: string;
    value: any;
    configuration: LiquidCacheConfig;

    private _timeout: any = null;

    constructor(key: string, value: any, configuration: LiquidCacheConfig, cacheService: LiquidCacheService) {
        this.key = key;
        this.value = value;
        this.configuration = configuration;
        this.cacheService = cacheService;
        if (configuration.duration) {
            this.expiresIn(configuration.duration);
        }
    }

    is(type: LiquidCacheObjectTypes) {
        return this.configuration.objectType === type;
    }

    update(value: any, configuration: LiquidCacheConfig) {
        this.value = value;
        this.configuration = configuration;
    }

    remove() {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        delete this.cacheService.cachedElements[this.key];
    }

    expiresIn(seconds: number) {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
        if (this.cacheService) {
            this._timeout = setTimeout(() => {
                this.cacheService.remove(this.key);
                this._timeout = null;
            }, seconds * 1000);
        }
    }

}
