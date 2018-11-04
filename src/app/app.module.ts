import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { NgxLiquidCacheModule, LiquidCacheConfig } from 'ngx-liquid-cache';

const liquidCacheConfig: LiquidCacheConfig = {
  duration: 60
};

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxLiquidCacheModule.forRoot(liquidCacheConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
