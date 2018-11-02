import {Component} from '@angular/core';
import {FakeApiService} from './services/fake-api.service';
import {LiquidCacheService,LiquidCacheConfig} from 'ngx-liquid-cache';

@Component({
    selector: 'nlcd-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'ngx-liquid-cache-dev';

    loading = false;

    constructor(
        private fakeApi: FakeApiService,
        private cache: LiquidCacheService
    ) {
    }

    findAll() {
        this.loading = true;
        console.log('First findAll call from AppComponent');
        this.fakeApi.findAll().subscribe(results => {
            console.log('\tResponse from First findAll call', results);
            this.loading = false;
        });
        console.log('Second findAll call from AppComponent');
        this.fakeApi.findAll().subscribe(results => {
            console.log('\tResponse from Second findAll call', results);
            this.loading = false;
        });
    }

    findOne() {
        this.loading = true;
        console.log('First findOne call from AppComponent');
        this.fakeApi.findOne(1).subscribe(results => {
            console.log('\tResponse from First findOne call', results);
            this.loading = false;
        });
        console.log('Second findOne call from AppComponent');
        this.fakeApi.findOne(1).subscribe(results => {
            console.log('\tResponse from Second findOne call', results);
            this.loading = false;
        });
    }

    clearCache() {
        this.cache.remove('all');
        this.cache.remove('single-1');
        // OR
        // this.cache.clear();
    }

}
