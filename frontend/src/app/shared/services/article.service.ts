import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ArticleInterface} from "../../../interfaces/article.interface";
import {environment} from "../../../environments/environment";
import {ArticlesListInterface} from "../../../interfaces/articles-list.interface";
import {ActiveParamsInterface} from "../../../interfaces/active-params.interface";
import {ArticleContentInterface} from "../../../interfaces/article-content.interface";

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private _http:HttpClient = inject(HttpClient);
  constructor() { }

  getBestArticles(): Observable<ArticleInterface[]> {
    return this._http.get<ArticleInterface[]>(environment.api + 'articles/top');
  }
  getRelatedArticles(url:string): Observable<ArticleInterface[]> {
    return this._http.get<ArticleInterface[]>(environment.api + 'articles/related/' + url);
  }
  getArticle(url:string): Observable<ArticleContentInterface> {
    return this._http.get<ArticleContentInterface>(environment.api + 'articles/' + url);
  }

  getArticles(params:ActiveParamsInterface): Observable<ArticlesListInterface> {
    return this._http.get<ArticlesListInterface>(environment.api + 'articles', {
      params: params as any
    });
  }


}
