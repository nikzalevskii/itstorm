import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {CategoryInterface} from "../../../../interfaces/category.interface";
import {ActivatedRoute, Router} from "@angular/router";
import {ArticleInterface} from "../../../../interfaces/article.interface";
import {ActiveParamsUtil} from "../../utils/active-params.util";
import {ActiveParamsInterface} from "../../../../interfaces/active-params.interface";
import {filter, map, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit, OnDestroy {
  private _router: Router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _destroy$: Subject<void> = new Subject<void>();
  @Input() articles: ArticleInterface[] = [];
  @Input() categories: CategoryInterface[] = [];
  filterOpen = false;
  activeCategories: Set<number> = new Set<number>();
  activeParams: ActiveParamsInterface = {categories: []};

  constructor() {
  }

  ngOnInit(): void {
    this._activatedRoute.queryParams
      .pipe(takeUntil(this._destroy$),
        map(params => {
          try {
            return ActiveParamsUtil.processParams(params);
          } catch (e) {
            console.error('Error params', e);
            return null;
          }
        }),
        filter(params => params !== null)
      )
      .subscribe(activeParams => {
        if (activeParams) {
          this.activeParams = activeParams;
          // this.activeParams = ActiveParamsUtil.processParams(params);

          if (this.activeParams && this.activeParams.categories.length > 0) {
            // this.filterOpen = true;
          }
        }

      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  toggleSorting() {
    this.filterOpen = !this.filterOpen;
  }

  updateFilterParam(index: number, url: string) {
    const currentScrollY = window.scrollY;
    if (this.activeParams && this.activeParams.categories.length > 0) {
      const existingTypeInParams = this.activeParams.categories.find((category: string) => category === url);
      if (existingTypeInParams) {
        this.activeParams.categories = this.activeParams.categories.filter((category: string) => category !== url);
        this.activeCategories.delete(index);
      } else if (!existingTypeInParams) {
        this.activeParams.categories = [...this.activeParams.categories, url];
        this.activeCategories.add(index);
      }
    } else {
      this.activeParams.categories = [url];
      this.activeCategories.add(index);
    }
    this.activeParams.page = 1;
    this._router.navigate(['/articles'], {
      queryParams: this.activeParams
    }).then(() => {
      window.scrollTo(0, currentScrollY);
    });
  }


}
