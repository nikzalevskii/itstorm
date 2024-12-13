import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {LoaderService} from "../../services/loader.service";
import {catchError, of, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit, OnDestroy {
  private _loaderService:LoaderService = inject(LoaderService);
  private _destroy$: Subject<void> = new Subject<void>();

  isLoaderShowed: boolean = false;
  constructor() {
  }

  ngOnInit(): void {
    this._loaderService.isLoaderShowed$
      .pipe(takeUntil(this._destroy$),
        catchError((error) => {
          console.error('Ошибка при получении данных о лоадере: ', error);
          this.isLoaderShowed = false;
          return of(false);
        })
        )
      .subscribe((isShowed:boolean) => {
      this.isLoaderShowed = isShowed;
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
