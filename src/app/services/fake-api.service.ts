import {Injectable} from '@angular/core';
import {of} from 'rxjs';
import {delay} from 'rxjs/operators';
import {LiquidCache, LiquidCacheStorageTypes} from 'ngx-liquid-cache';

@Injectable({
    providedIn: 'root'
})
export class FakeApiService {

    @LiquidCache('all', { storageType: LiquidCacheStorageTypes.localStorage })
    findAll() {
        console.log('Fake network call - findAll (saved to localStorage)');
        const lastCall = new Date();
        return of([
            {id: 1, lc: lastCall},
            {id: 2, lc: lastCall},
            {id: 3, lc: lastCall}
        ]).pipe(
            delay(1500)
        );
    }

    @LiquidCache('single-{id}')
    findOne(id: number) {
        console.log('Fake network call - findOne');
        const lastCall = new Date();
        return of({
            id: id,
            lc: lastCall
        }).pipe(
            delay(1500)
        );
    }

}
