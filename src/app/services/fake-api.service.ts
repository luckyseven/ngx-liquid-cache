import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LiquidCache } from 'ngx-liquid-cache';

@Injectable({
  providedIn: 'root'
})
export class FakeApiService {

  constructor() { }

  @LiquidCache('all')
  findAll() {
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
      const lastCall = new Date();
        return of({
            id: id,
            lc: lastCall
        }).pipe(
            delay(1500)
        );
  }

}
