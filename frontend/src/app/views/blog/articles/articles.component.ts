import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ArticleService} from "../../../shared/services/article.service";
import {ArticlesListInterface} from "../../../../interfaces/articles-list.interface";
import {ArticleInterface} from "../../../../interfaces/article.interface";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryInterface} from "../../../../interfaces/category.interface";
import {ActiveParamsUtil} from "../../../shared/utils/active-params.util";
import {AppliedFilterInterface} from "../../../../interfaces/applied-filter.interface";
import {ActiveParamsInterface} from "../../../../interfaces/active-params.interface";
import {catchError, debounceTime, of, Subject, takeUntil, throwError} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DEBOUNCE_TIME} from "../../../shared/constants/app-constants";

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.scss']
})
export class ArticlesComponent implements OnInit, OnDestroy {
  private _router: Router = inject(Router);
  private _activatedRoute:ActivatedRoute = inject(ActivatedRoute);
  private _articleService: ArticleService = inject(ArticleService);
  private _categoryService: CategoryService = inject(CategoryService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _destroy$: Subject<void> = new Subject<void>();

  activeParams: ActiveParamsInterface = {categories: []};
  appliedFilters: AppliedFilterInterface[] = [];
  activeParamsWithNames: CategoryInterface[] = [];
  pages: number[] = [];
  articles: ArticleInterface[] = [];
  categories: CategoryInterface[] = [];

  constructor() {
  }

  ngOnInit(): void {
    this._categoryService.getCategories()
      .pipe(takeUntil(this._destroy$),
        catchError((error) => {
          console.error('Ошибка при получении категорий:', error);
          this._snackBar.open('Ошибка при получении категорий.' );
          return throwError(() => error);
        })
        )
      .subscribe((data: CategoryInterface[]) => {
        this.categories = data;
        this._activatedRoute.queryParams
          .pipe(
            debounceTime(DEBOUNCE_TIME),
            takeUntil(this._destroy$)
          )
          .subscribe(params => {
            this.activeParams = ActiveParamsUtil.processParams(params);
            this.activeParamsWithNames = [];
            this.activeParams.categories.forEach((item:string) => {
              const findItem = this.categories.find(category => category.url === item);
              if (findItem) {
                this.activeParamsWithNames.push(findItem);
              }
            });
            // console.log(this.activeParamsWithNames);

            this.appliedFilters = [];
            this.activeParamsWithNames.forEach(item => {
              this.appliedFilters.push({
                name: item.name,
                urlParam: item.url
              });
            });
            this._articleService.getArticles(this.activeParams)
              .pipe(takeUntil(this._destroy$),
                catchError((error) => {
                  console.error('Ошибка при получении статей:', error);
                  this._snackBar.open('Ошибка при получении статей.' );
                  return of({count:0, pages:0, items:[]});
                  // return throwError(() => error);
                })
                )
              .subscribe((data: ArticlesListInterface):void => {
                this.pages = [];
                for (let i:number = 1; i <= data.pages; i++) {
                  this.pages.push(i);
                }
                this.articles = data.items;
              });
          });
      });
  }

  ngOnDestroy():void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  removeAppliedFilter(appliedFilter: AppliedFilterInterface): void {
    const currentScrollY = window.scrollY;
    this.activeParams.categories = this.activeParams.categories.filter(item => item !== appliedFilter.urlParam);
    this.activeParams.page = 1;
    this._router.navigate(['/articles'], {
      queryParams: this.activeParams
    }).then(() => {
      window.scrollTo(0, currentScrollY);
    });
  }

  openPage(page: number):void {
    this.activeParams.page = page;
    this._router.navigate(['/articles'], {
      queryParams: this.activeParams
    });
  }

  openPrevPage():void {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;
      this._router.navigate(['/articles'], {
        queryParams: this.activeParams
      });
    }
  }

  openNextPage():void {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
      this._router.navigate(['/articles'], {
        queryParams: this.activeParams
      });
    }
  }

}
