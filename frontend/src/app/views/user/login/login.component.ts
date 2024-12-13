import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {LoginResponseInterface} from "../../../../interfaces/login-response.interface";
import {DefaultResponseInterface} from "../../../../interfaces/default-response.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private _fb: FormBuilder = inject(FormBuilder);
  private _authService:AuthService = inject(AuthService);
  private _snackBar:MatSnackBar = inject(MatSnackBar);
  private _router:Router = inject(Router);
  private _destroy$: Subject<void> = new Subject<void>();

  passwordVisible: boolean = false;


  loginForm:FormGroup = this._fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
    rememberMe: [false],
  });

  constructor() {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  login(): void {
    if (this.loginForm.valid && this.loginForm.value.email && this.loginForm.value.password) {
      this._authService.login(this.loginForm.value.email, this.loginForm.value.password, !!this.loginForm.value.rememberMe)
        .pipe(takeUntil(this._destroy$))
        .subscribe({
          next: (data: LoginResponseInterface | DefaultResponseInterface) => {
            let error = null;
            if ((data as DefaultResponseInterface).error !== undefined) {
              error = (data as DefaultResponseInterface).message;
            }
            const loginResponse:LoginResponseInterface = data as LoginResponseInterface;
            if (!loginResponse.accessToken || !loginResponse.refreshToken
              || !loginResponse.userId) {
              error = 'Ошибка авторизации';
            }
            if (error) {
              this._snackBar.open(error);
              throw new Error(error);
            }
          // setTokens
            this._authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
            this._authService.userId = loginResponse.userId;
            this._authService.updateUserInfo();
            this._snackBar.open('Авторизация прошла успешно');
            this._router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка авторизации');
            }
          }
        });
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

}
