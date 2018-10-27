import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { LiquidCacheConfig, LiquidCacheTypes, NgxLiquidCacheModule} from 'ngx-liquid-cache';

const cacheConfig: LiquidCacheConfig = {
    expiration: 10,
    type: LiquidCacheTypes.inMemory
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxLiquidCacheModule.forRoot(cacheConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
