import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {LoginResponseInterface} from "../../../../interfaces/login-response.interface";
import {DefaultResponseInterface} from "../../../../interfaces/default-response.interface";
import {HttpErrorResponse} from "@angular/common/http";
import {Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  private _fb: FormBuilder = inject(FormBuilder);
  private _authService:AuthService = inject(AuthService);
  private _snackBar:MatSnackBar = inject(MatSnackBar);
  private _router:Router = inject(Router);
  private _destroy$: Subject<void> = new Subject<void>();

  passwordVisible: boolean = false;
  signupForm:FormGroup = this._fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ]+([ '-][a-zA-Zа-яА-ЯёЁ]+)*\s*$/)]],
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
    agree: [false, [Validators.requiredTrue]],
  });
  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  signup():void {
    if (this.signupForm.valid && this.signupForm.value.name && this.signupForm.value.email
      && this.signupForm.value.password && this.signupForm.value.agree) {
      this._authService.signup(this.signupForm.value.name,this.signupForm.value.email,this.signupForm.value.password)
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
              error = 'Ошибка регистрации';
            }
            if (error) {
              this._snackBar.open(error);
              throw new Error(error);
            }
            // setTokens
            this._authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
            this._authService.userId = loginResponse.userId;
            this._authService.updateUserInfo();
            this._snackBar.open('Регистрация прошла успешно');
            this._router.navigate(['/']);
          },
          error: (errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка регистрации');
            }
          }
        });
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

}
