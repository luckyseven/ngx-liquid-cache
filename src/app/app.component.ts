import { Component } from '@angular/core';
import {FakeApiService} from './services/fake-api.service';
@Component({
  selector: 'nlcd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngx-liquid-cache-dev';

  loading = false;

  constructor(
      private fakeApi: FakeApiService
  ) {}

  findAll() {
      this.loading = true;
      this.fakeApi.findAll().subscribe(results => {
          console.log(results);
          this.loading = false;
      });
  }

  findOne() {
      this.loading = true;
      this.fakeApi.findOne(1).subscribe(results => {
          console.log(results);
          this.loading = false;
      });
  }

}
