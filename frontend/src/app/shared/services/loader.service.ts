import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoaderShowed$:Subject<boolean> = new Subject<boolean>();
  constructor() { }

  show() {
    this.isLoaderShowed$.next(true);
  }

  hide() {
    this.isLoaderShowed$.next(false);
  }

}
