import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {UserInfoInterface} from "../../../../interfaces/user-info.interface";
import {catchError, Subject, takeUntil, throwError} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private _authService: AuthService = inject(AuthService);
  private _router: Router = inject(Router);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _destroy$: Subject<void> = new Subject<void>();

  public isLogged: boolean = false;
  public userInfo: UserInfoInterface | null = null;

  constructor() {
    this.isLogged = this._authService.getIsLoggedIn();
  }

  ngOnInit(): void {
    this._authService.isLogged$
      .pipe(takeUntil(this._destroy$),
        catchError((error) => {
          console.error('Ошибка при получении статуса пользователя:', error);
          this._snackBar.open('Ошибка при проверке статуса пользователя.');
          return throwError(() => error);
        })
      )
      .subscribe({
        next: (isLoggedIn: boolean): void => {
          this.isLogged = isLoggedIn;
        },
        error: (error) => {
          console.error('Ошибка в подписке на isLogged$: ', error);
        }
      });

    if (this.isLogged) {
      this._authService.updateUserInfo();
    }


    this._authService.userInfo$
      .pipe(takeUntil(this._destroy$),
        catchError((error) => {
          console.error('Ошибка при получении информации о пользователе:', error);
          this._snackBar.open('Ошибка при загрузке информации о пользователе.' );
          return throwError(() => error);
        })
        )
      .subscribe({
        next: (userInfo: UserInfoInterface | null): void => {
          this.userInfo = userInfo;
        },
        error: (error) => {
          console.error('Ошибка в подписке на userInfo$: ', error);
        }
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }


  logout(): void {
    this._authService.logout()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: () => {
          this.doLogout();
        },
        error: (): void => {
          this.doLogout();
        }
      });
  }

  doLogout(): void {
    this._authService.removeTokens();
    this._authService.userId = null;
    this._snackBar.open('Вы вышли из системы');
    this._router.navigate(['/']);
  }

}
