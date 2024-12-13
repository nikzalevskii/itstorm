import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {ArticleContentInterface} from "../../../../interfaces/article-content.interface";
import {ActivatedRoute} from "@angular/router";
import {ArticleService} from "../../../shared/services/article.service";
import {environment} from "../../../../environments/environment";
import {ArticleInterface} from "../../../../interfaces/article.interface";
import {AuthService} from "../../../core/auth/auth.service";
import {CommentService} from "../../../shared/services/comment.service";
import {DefaultResponseInterface} from "../../../../interfaces/default-response.interface";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommentInterface} from "../../../../interfaces/comment.interface";
import {CommentUserInterface} from "../../../../interfaces/comment.user.interface";
import {LoaderService} from "../../../shared/services/loader.service";
import {catchError, Subject, switchMap, takeUntil, throwError} from "rxjs";
import {
  COMMENTS
} from "../../../shared/constants/app-constants";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit, OnDestroy {
  private _loaderService: LoaderService = inject(LoaderService);
  private _snackBar: MatSnackBar = inject(MatSnackBar);
  private _activatedRoute = inject(ActivatedRoute);
  private _authService: AuthService = inject(AuthService);
  private _commentService: CommentService = inject(CommentService);
  private _articleService: ArticleService = inject(ArticleService);
  private _destroy$: Subject<void> = new Subject<void>();

  article: ArticleContentInterface | null = null;
  relatedArticles: ArticleInterface[] | null = null;
  url: string = '';
  htmlContent: string = '';
  serverStaticPath: string = environment.serverStaticPath;
  isLogged: boolean = false;
  commentText: string = '';
  showingComments: CommentUserInterface[] | null = null;
  comments: CommentInterface | null = null;
  allComments: CommentInterface | null = null;
  offset: number = 0;
  restComments: number = 0;
  haveComments:boolean = false;

  constructor() {
  }

  ngOnInit(): void {
    this.isLogged = this._authService.getIsLoggedIn();
    this._activatedRoute.params
      .pipe(
        takeUntil(this._destroy$),
        switchMap((params) => {
          this.url = params['url'];
          return this._articleService.getArticle(this.url);
        }),
        catchError((error) => {
          console.error('Ошибка при получении статьи:', error);
          this._snackBar.open('Ошибка при загрузке статьи.');
          return throwError(error);
        })
      )
      .subscribe((data: ArticleContentInterface) => {
        if (!data) {
          console.error('Ошибка при получении статьи');
          return;
        }
        this.article = data;
        this.htmlContent = data.text;
        this.loadRelatedArticles();
        this.loadInitialComments();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  loadRelatedArticles():void {
    if (this.url) {
      this._articleService.getRelatedArticles(this.url)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            console.error('Ошибка при получении связанных статей:', error);
            this._snackBar.open('Ошибка при получении связанных статей.');
            return throwError(error);
          })
          )
        .subscribe((relatedData: ArticleInterface[]):void => {
          if (!relatedData) {
            console.error('Ошибка при получении связанных статей');
            return;
          }
          this.relatedArticles = relatedData;
        });
    }
  }

  loadInitialComments():void {
    if (this.article && this.article.id) {
      this.offset = 0;
      this._commentService.getComments({offset: this.offset, article: this.article.id})
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            console.error('Ошибка при получении комментариев:', error);
            this._snackBar.open('Ошибка при получении комментариев.');
            return throwError(error);
          })
          )
        .subscribe((commentData: CommentInterface | DefaultResponseInterface):void => {
          if ((commentData as DefaultResponseInterface).error) {
            throw new Error((commentData as DefaultResponseInterface).message);
          }
          this.allComments = commentData as CommentInterface;
          this.haveComments = this.allComments.allCount > 0;
          this.allComments.comments = this.allComments.comments.sort((a: CommentUserInterface, b: CommentUserInterface) => {
            const dateA: number = new Date(a.date).getTime();
            const dateB: number = new Date(b.date).getTime();
            return dateB - dateA;
          });
          this.showingComments = this.allComments.comments.slice(0, COMMENTS.FIRSTLY_SHOWED);
          this.restComments = Math.max(this.allComments.allCount - this.showingComments.length, 0);
        });
    }
  }

  loadComments():void {
    this._loaderService.show();
    if (this.article && this.restComments > 0) {
      this.offset += COMMENTS.NEXT_SHOWED;
      this._commentService.getComments({offset: this.offset, article: this.article.id})
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            console.error('Ошибка при получении дополнительных комментариев:', error);
            this._snackBar.open('Ошибка при получении дополнительных комментариев.');
            return throwError(error);
          })
          )
        .subscribe((commentData: CommentInterface | DefaultResponseInterface):void => {
          if ((commentData as DefaultResponseInterface).error) {
            throw new Error((commentData as DefaultResponseInterface).message);
          }
          if (this.allComments) {
            this.allComments.comments = [...this.allComments.comments, ...(commentData as CommentInterface).comments];
            this.allComments.comments = this.allComments.comments.sort((a: CommentUserInterface, b: CommentUserInterface) => {
              const dateA:number = new Date(a.date).getTime();
              const dateB:number = new Date(b.date).getTime();
              return dateB - dateA;
            });
            if (this.showingComments) {
              this.showingComments = [...this.showingComments, ...this.allComments.comments.slice(this.offset - COMMENTS.NEXT_SHOWED + COMMENTS.FIRSTLY_SHOWED, this.offset + COMMENTS.FIRSTLY_SHOWED)];
              this.restComments = Math.max(this.allComments.allCount - this.showingComments.length, 0);
              this._loaderService.hide();
            }
          }
        });
    }

  }

  createComment(text: string, article: ArticleContentInterface):void {
    if (this.isLogged) {
      this._commentService.addComment(text, article)
        .pipe(takeUntil(this._destroy$),
          catchError((error) => {
            console.error('Ошибка при добавлении комментария:', error);
            this._snackBar.open('Ошибка при добавлении комментария.');
            return throwError(error);
          })
          )
        .subscribe((data: DefaultResponseInterface):void => {
          if (!data || data.error) {
            const errorMessage:string = data?.message || 'Произошла ошибка, попробуйте снова.';
            this._snackBar.open(errorMessage);
            return;
          }
          this._snackBar.open('Комментарий успешно добавлен');
          this.commentText = '';
          this.loadInitialComments();
        });
    }
  }

    protected readonly environment = environment;
}
