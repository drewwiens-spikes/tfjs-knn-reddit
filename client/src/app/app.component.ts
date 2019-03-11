import { Component } from '@angular/core';
import { Validators, FormControl } from '@angular/forms';
import { filter, switchMap, map, catchError, debounceTime, tap, distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { of, BehaviorSubject, Subject, merge } from 'rxjs';
import { random } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  control = new FormControl('', Validators.required);
  labels = [
    'AskReddit', 'funny', 'gaming', 'IAmA', 'linux', 'pics',
    'science', 'todayilearned', 'videos', 'worldnews'
  ];
  predicted = new BehaviorSubject<string>('app___loaded');
  private titleToPost = new Subject<string>();
  constructor(private http: HttpClient) {
    this.control.valueChanges.pipe(
      tap(() => this.predicted.next('')),
      debounceTime(1000),
      filter(() => this.control.valid),
    ).subscribe(this.titleToPost);
    this.titleToPost.pipe(
      distinctUntilChanged(),
      switchMap(value => merge(of('___loading___'), http.post('http://localhost:3000/', { value }).pipe(
        tap(retval => console.log('RETval:', retval)),
        map((idx: any) => this.labels[idx.classIndex]),
        catchError(() => of('Error reaching server')),
      ))),
    ).subscribe(this.predicted);
  }
  useRandomTitleFrom(subreddit: string) {
    this.predicted.next('___loading___');
    this.http.get(`https://www.reddit.com/r/${subreddit}.json`).subscribe((json: any) => {
      const titles = json.data.children.map(itm => itm.data.title);
      const title = titles[random(0, titles.length - 1)];
      this.control.setValue(title);
      this.titleToPost.next(title);
    });
  }
}
