import { Component } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { filter, switchMap, map, catchError, debounceTime, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';

const mapping = [
  'AskReddit', 'funny', 'gaming', 'IAmA', 'linux', 'pics',
  'science', 'todayilearned', 'videos', 'worldnews'
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  control = new FormControl('', Validators.required);
  predicted: Observable<any>;
  constructor(http: HttpClient) {
    this.predicted = this.control.valueChanges.pipe(
      debounceTime(1000),
      filter(() => this.control.valid),
      tap(value => console.log('VALUE:', value)),
      switchMap(value => http.post('http://localhost:3000/', { value }).pipe(
        tap(retval => console.log('RETval:', retval)),
        map((idx: any) => mapping[idx.classIndex]),
        catchError(err => of(`Error reaching server: ${JSON.stringify(err)}`)),
      )),
    );
  }
}
