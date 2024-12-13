import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {DefaultResponseInterface} from "../../../interfaces/default-response.interface";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private _http: HttpClient = inject(HttpClient);
  constructor() { }

  sendRequest(name:string, phone:string, service:string, type:string):Observable<DefaultResponseInterface> {
    return this._http.post<DefaultResponseInterface>(environment.api + 'requests', {
      name, phone, service, type
    });
  }
}
