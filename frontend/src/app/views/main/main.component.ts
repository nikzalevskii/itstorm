import {AfterViewInit, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Swiper} from 'swiper';
import {Navigation, Pagination} from 'swiper';
import {ArticleService} from "../../shared/services/article.service";
import {ArticleInterface} from "../../../interfaces/article.interface";
import {MatDialog} from "@angular/material/dialog";
import {PopupComponent} from "../../shared/components/popup/popup.component";
import {catchError, of, Subject, takeUntil} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

// Инициализация Swiper с нужными модулями
Swiper.use([Navigation, Pagination]);


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  private _articleService: ArticleService = inject(ArticleService);
  private _router: Router = inject(Router);
  private _activatedRoute:ActivatedRoute = inject(ActivatedRoute);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _destroy$: Subject<void> = new Subject<void>();

  articles: ArticleInterface[] = [];
  selectedService: string = '';

  constructor(private dialog: MatDialog) {
  }

  ngOnInit(): void {
    const swiper:Swiper = new Swiper('.swiper-container', {
      slidesPerView: 1,  // Показывать только один слайд
      spaceBetween: 0,    // Без промежутков между слайдами
      loop: true,         // Бесконечная прокрутка
      autoplay: {
        delay: 3000 // Автоматическая прокрутка с задержкой 3 секунды
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,  // Кликабельные точки
        type: 'bullets',  // Использование точек для навигации
      }
    });
    const swiperReviews:Swiper = new Swiper('.swiper-reviews', {
      slidesPerView: 3,  // Показывать только один слайд
      spaceBetween: 27,    // Без промежутков между слайдами
      loop: true,         // Бесконечная прокрутка
      autoplay: {
        delay: 3000 // Автоматическая прокрутка с задержкой 3 секунды
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      },
      breakpoints: {
        1350: {
          slidesPerView: 3, // Показывать 2 слайда
          spaceBetween: 27,  // Уменьшить промежутки
          // loop: true,
        },
        769: {
          slidesPerView: 2, // Показывать 2 слайда
          spaceBetween: 10,  // Уменьшить промежутки
          // loop: true,
        },
        320: {
          slidesPerView: 1,
          spaceBetween: 10,
        },
      }
    });

    this._router.events
      .pipe(takeUntil(this._destroy$),
        catchError((error) => {
          console.error('Ошибка при обработке событий роутера:', error);
          this._snackBar.open('Ошибка при обработке событий роутера.');
          return of(null);
        })
        )
      .subscribe(():void => {
        this.scrollIntoFragment();
      });


    this._articleService.getBestArticles()
      .pipe(takeUntil(this._destroy$),
        catchError((error) => {
          console.error('Ошибка при получении лучших статей:', error);
          this._snackBar.open('Ошибка при получении лучших статей.');
          return of([]);
        })
        )
      .subscribe((data: ArticleInterface[]):void => {
        this.articles = data;
        this.scrollIntoFragment();
      });
  }


  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private scrollIntoFragment() {
    this._activatedRoute.fragment
      .pipe(takeUntil(this._destroy$),
        catchError((error) => {
          console.error('Ошибка при обработке фрагмента маршрута:', error);
          this._snackBar.open('Ошибка при обработке фрагмента маршрута.');
          return of(null);
        })
      )
      .subscribe(fragment => {
        if (fragment) {
          const element = document.getElementById(fragment);
          if (element) {
            setTimeout(():void => {
              element.scrollIntoView({behavior: 'smooth'});
            }, 0);

          } else {
            console.warn(`Элемент с ID ${fragment} не найден.`);
          }
        }
      });
  }


  openPopup(type: string, service?: string): void {
    const dialogRef = this.dialog.open(PopupComponent, {
      width: '727px',
      height: '489px',
      data: {type, service}
    });
    dialogRef.afterClosed()
      .pipe(
        catchError((error) => {
          console.error('Ошибка при закрытии модального окна:', error);
          this._snackBar.open('Ошибка при закрытии модального окна.');
          return of(null);
        })
      )
      .subscribe(result => {
      if (result === 'openResponsePopup') {
        this.openPopup('response');
      }
    });
    // Передаем dialogRef в PopupComponent
    dialogRef.componentInstance.dialogRef = dialogRef;
  }

}
