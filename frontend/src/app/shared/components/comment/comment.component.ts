import {Component, inject, Input, OnDestroy, OnInit} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommentUserInterface} from "../../../../interfaces/comment.user.interface";
import {CommentService} from "../../services/comment.service";
import {ArticleContentInterface} from "../../../../interfaces/article-content.interface";
import {ActionsForCommentInterface} from "../../../../interfaces/actions-for-comment.interface";
import {DefaultResponseInterface} from "../../../../interfaces/default-response.interface";
import {catchError, Subject, takeUntil, throwError} from "rxjs";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit, OnDestroy {
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _commentService: CommentService = inject(CommentService);
  private _authService: AuthService = inject(AuthService);
  private _destroy$: Subject<void> = new Subject<void>();

  @Input() comment!: CommentUserInterface;
  @Input() article!: ArticleContentInterface;
  action: 'like' | 'dislike' | null = null;
  like: boolean = false;
  dislike: boolean = false;
  violate: boolean = false;
  actionsForComments: ActionsForCommentInterface[] = [];
  isLogged: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.isLogged = this._authService.getIsLoggedIn();
    if (this.isLogged) {
      this._commentService.getActionsForComments(this.comment.id)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            this._snackBar.open('Не удалось загрузить данные о комментариях.');
            console.error('Error loading', error);
            return throwError(() => error);
          })
        )
        .subscribe((data: ActionsForCommentInterface[] | DefaultResponseInterface) => {
          if ((data as DefaultResponseInterface).error) {
            throw new Error((data as DefaultResponseInterface).message);
          }
          this.actionsForComments = data as ActionsForCommentInterface[];
          const action = this.actionsForComments.find(item => item.comment === this.comment.id);
          if (action) {
            if (action.action === 'like') {
              this.like = true;
            } else if (action.action === 'dislike') {
              this.dislike = true;
            }
          }
        });
    }


  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  doLike(commentId: string) {
    if (!this.like && !this.dislike) {
      this._commentService.applyActionForComment('like', commentId)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            this._snackBar.open('Не удалось поставить лайк.');
            console.error('Error setting Like', error);
            return throwError(() => error);
          }))
        .subscribe((data: any) => {
          this.like = true;
          this.comment.likesCount++;
          this._snackBar.open('Ваш голос учтён');
        });
    } else if (!this.like && this.dislike) {
      this._commentService.applyActionForComment('like', commentId)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            this._snackBar.open('Не удалось поставить лайк.');
            console.error('Error setting Like', error);
            return throwError(() => error);
          }))
        .subscribe((data: any) => {
          this.dislike = false;
          this.like = true;
          this.comment.dislikesCount--;
          this.comment.likesCount++;
          this._snackBar.open('Ваш голос учтён');
        });
    } else if (this.like && !this.dislike) {
      this._commentService.applyActionForComment('like', commentId)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            this._snackBar.open('Не удалось поставить лайк.');
            console.error('Error setting Like', error);
            return throwError(() => error);
          }))
        .subscribe((data: any) => {
          this.like = false;
          this.comment.likesCount--;
          this._snackBar.open('Ваш голос учтён');
        });
    }

  }

  doDislike(commentId: string) {
    if (!this.like && !this.dislike ) {
      this._commentService.applyActionForComment('dislike', commentId)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            this._snackBar.open('Не удалось поставить дизлайк.');
            console.error('Error setting Dislike', error);
            return throwError(() => error);
          }))
        .subscribe((data: any) => {
          this.dislike = true;
          this.comment.dislikesCount++;
          this._snackBar.open('Ваш голос учтён');
        });
    } else if (this.like && !this.dislike) {
      this._commentService.applyActionForComment('dislike', commentId)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            this._snackBar.open('Не удалось поставить дизлайк.');
            console.error('Error setting Dislike', error);
            return throwError(() => error);
          }))
        .subscribe((data: any) => {
          this.like = false;
          this.dislike = true;
          this.comment.likesCount--;
          this.comment.dislikesCount++;
          this._snackBar.open('Ваш голос учтён');
        });
    } else if (this.dislike && !this.like) {
      this._commentService.applyActionForComment('dislike', commentId)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            this._snackBar.open('Не удалось поставить дизлайк.');
            console.error('Error setting Dislike', error);
            return throwError(() => error);
          }))
        .subscribe((data: any) => {
          this.dislike = false;
          this.comment.dislikesCount--;
          this._snackBar.open('Ваш голос учтён');
        });
    }
  }

  doViolate(commentId: string) {
    if (!this.violate && !this.like && !this.dislike) {
      this._commentService.applyActionForComment('violate', commentId)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            this._snackBar.open('Не удалось отправить жалобу.');
            console.error('Error sending violate', error);
            return throwError(() => error);
          }))
        .subscribe((data: any) => {
          console.log(data);
          this.violate = true;
          this._snackBar.open('Жалоба отправлена');
        });
    } else if (!this.like && !this.dislike && this.violate) {
      this._snackBar.open('Жалоба уже отправлена!');
    }
  }

}
