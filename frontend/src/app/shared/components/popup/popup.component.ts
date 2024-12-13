import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RequestService} from "../../services/request.service";
import {DefaultResponseInterface} from "../../../../interfaces/default-response.interface";
import {catchError, Subject, takeUntil, throwError} from "rxjs";

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit, OnDestroy {
  private _fb: FormBuilder = inject(FormBuilder);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _requestService: RequestService = inject(RequestService);
  private _destroy$: Subject<void> = new Subject<void>();

  consultForm = this._fb.group({
    nameForConsult: ['', [Validators.required, Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ]+([ '-][a-zA-Zа-яА-ЯёЁ]+)*\s*$/)]],
    phoneForConsult: ['', [Validators.required, Validators.pattern(/^(\+?\d[\d\s-]*)$/)]],
  });

  serviceForm = this._fb.group({
    nameForOrder: ['', [Validators.required, Validators.pattern(/^[a-zA-Zа-яА-ЯёЁ]+([ '-][a-zA-Zа-яА-ЯёЁ]+)*\s*$/)]],
    phoneForOrder: ['', [Validators.required, Validators.pattern(/^(\+?\d[\d\s-]*)$/)]],
    selectedService: ['', Validators.required],
  });
  dialogRef: MatDialogRef<any> | null = null;
  data: { type: string, service?:string } = inject(MAT_DIALOG_DATA);

  constructor() {
  }

  ngOnInit(): void {
    if (this.data.type === 'service' && this.data.service) {
      this.serviceForm.get('selectedService')?.setValue(this.data.service);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  submitConsultForm(): void {
    if (this.consultForm.valid && this.dialogRef) {
      this.dialogRef.close('openResponsePopup');

    } else {
      this._snackBar.open('Пожалуйста, заполните все поля.');
    }
  }

  submitServiceForm(): void {
    const selectedService = this.serviceForm.get('selectedService')?.value;
    if (this.serviceForm.valid && this.dialogRef && this.serviceForm.value.nameForOrder
      && this.serviceForm.value.phoneForOrder && selectedService) {
      this._requestService.sendRequest(this.serviceForm.value.nameForOrder, this.serviceForm.value.phoneForOrder, selectedService, 'order')
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            console.error('Ошибка при отправке запроса: ', error);
            this._snackBar.open('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.');
            return throwError(() => error);
          })
        )
        .subscribe({
          next: (data:DefaultResponseInterface) => {
            if (!data || data.error) {
              const errorMessage = data?.message || 'Произошла ошибка, попробуйте снова.';
              this._snackBar.open(errorMessage);
              return;
            }
            if (this.dialogRef) {
              this.dialogRef.close('openResponsePopup');
            }
          },
          error: (err) => {
            console.error('Непредвиденная ошибка при отправке формы: ', err);
          }
        });
    } else {
      this._snackBar.open('Пожалуйста, заполните все поля.');
    }
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }


}
