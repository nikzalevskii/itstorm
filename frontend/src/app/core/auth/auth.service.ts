import {inject, Injectable} from '@angular/core';
import {BehaviorSubject, catchError, Observable, Subject, takeUntil, throwError} from "rxjs";
import {DefaultResponseInterface} from "../../../interfaces/default-response.interface";
import {LoginResponseInterface} from "../../../interfaces/login-response.interface";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {UserInfoInterface} from "../../../interfaces/user-info.interface";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _http: HttpClient = inject(HttpClient);
  private _destroy$: Subject<void> = new Subject<void>();

  public accessTokenKey: string = 'accessToken';
  public refreshTokenKey: string = 'refreshToken';
  public userIdKey: string = 'userId';

  public isLogged$: Subject<boolean> = new Subject<boolean>();
  private _isLogged: boolean = false;
  public userInfo$: BehaviorSubject<UserInfoInterface | null> = new BehaviorSubject<UserInfoInterface | null>(null);

  constructor() {
    this._isLogged = !!localStorage.getItem(this.accessTokenKey);

  }

  getUserInfo(): Observable<DefaultResponseInterface | UserInfoInterface> {
    return this._http.get<DefaultResponseInterface | UserInfoInterface>(environment.api + 'users');
  }
  updateUserInfo(): void {
    this.getUserInfo()
      .pipe(
        catchError(() => {
          this.userInfo$.next(null);
          return throwError(() => new Error('Failed to update user info'));
        }),
        takeUntil(this._destroy$)
      )
      .subscribe((userInfo: DefaultResponseInterface | UserInfoInterface) => {
      if ((userInfo as DefaultResponseInterface).error) {
        throw new Error((userInfo as DefaultResponseInterface).message);
      }
      this.userInfo$.next(userInfo as UserInfoInterface);
    });
  }

  login(email: string, password: string, rememberMe: boolean): Observable<DefaultResponseInterface | LoginResponseInterface> {
    return this._http.post<DefaultResponseInterface | LoginResponseInterface>(environment.api + 'login', {
      email, password, rememberMe
    });
  }

  signup(name: string, email: string, password: string): Observable<DefaultResponseInterface | LoginResponseInterface> {
    return this._http.post<DefaultResponseInterface | LoginResponseInterface>(environment.api + 'signup', {
      name, email, password
    });
  }


  logout(): Observable<DefaultResponseInterface> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this._http.post<DefaultResponseInterface>(environment.api + 'logout', {
        refreshToken: tokens.refreshToken,
      });
    }
    throw throwError(() => 'Can not fin token');
  }

  refresh(): Observable<DefaultResponseInterface | LoginResponseInterface> {
    const tokens = this.getTokens();
    if (tokens && tokens.refreshToken) {
      return this._http.post<DefaultResponseInterface | LoginResponseInterface>(environment.api + 'refresh', {
        refreshToken: tokens.refreshToken,
      });
    }
    throw throwError(() => 'Can not use token');
  }

  public getIsLoggedIn(): boolean {
    return this._isLogged;

  }

  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this._isLogged = true;
    this.isLogged$.next(true);
  }

  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this._isLogged = false;
    this.isLogged$.next(false);
  }

  public getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey),
    };
  }

  get userId(): string | null {
    return localStorage.getItem(this.userIdKey);
  }

  set userId(id: string | null) {
    if (id) {
      localStorage.setItem(this.userIdKey, id);
    } else {
      localStorage.removeItem(this.userIdKey);
    }

  }


}
