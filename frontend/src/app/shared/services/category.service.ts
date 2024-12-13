import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {CategoryInterface} from "../../../interfaces/category.interface";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private _http:HttpClient = inject(HttpClient);
  constructor() { }

  getCategories(): Observable<CategoryInterface[]> {
    return this._http.get<CategoryInterface[]>(environment.api + 'categories');
  }

}
