import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, Observable, switchMap, throwError} from "rxjs";
import {inject, Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {DefaultResponseInterface} from "../../../interfaces/default-response.interface";
import {LoginResponseInterface} from "../../../interfaces/login-response.interface";
import {Router} from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private _authService: AuthService = inject(AuthService);
  private _router: Router = inject(Router);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tokens = this._authService.getTokens();
    if (tokens && tokens.accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('x-auth', tokens.accessToken)
      });
      return next.handle(authReq)
        .pipe(
          catchError((error) => {
            if (error.status === 401 && !authReq.url.includes('/login') && !authReq.url.includes('/refresh')) {
              return this.handle401Error(authReq, next);
            }
            return throwError(() => error);
          })
        );
    }
    return next.handle(req);

  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    return this._authService.refresh()
      .pipe(
        switchMap((result: DefaultResponseInterface | LoginResponseInterface) => {
          let error: string = '';
          if ((result as DefaultResponseInterface).error !== undefined) {
            error = (result as DefaultResponseInterface).message;
          }
          const refreshResult: LoginResponseInterface = result as LoginResponseInterface;
          if (!refreshResult.accessToken || !refreshResult.refreshToken || !refreshResult.userId) {
            error = 'Ошибка авторизации';
          }
          if (error) {
            return throwError(() => new Error(error));
          }
          this._authService.setTokens(refreshResult.accessToken, refreshResult.refreshToken);
          const authReq = req.clone({
            headers: req.headers.set('x-auth', refreshResult.accessToken)
          });
          return next.handle(authReq);
        }),
        catchError(error => {
          this._authService.removeTokens();
          this._router.navigate(['/']);
          return throwError(() => error);
        })
      );
  }
}
