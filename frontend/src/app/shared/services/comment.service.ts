import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ArticleInterface} from "../../../interfaces/article.interface";
import {environment} from "../../../environments/environment";
import {DefaultResponseInterface} from "../../../interfaces/default-response.interface";
import {ArticleContentInterface} from "../../../interfaces/article-content.interface";
import {CommentInterface} from "../../../interfaces/comment.interface";
import {CommentParamsInterface} from "../../../interfaces/comment-params.interface";
import {ActionsForCommentInterface} from "../../../interfaces/actions-for-comment.interface";

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private _http: HttpClient = inject(HttpClient);

  constructor() {
  }

  addComment(text: string, article: ArticleContentInterface): Observable<DefaultResponseInterface> {
    return this._http.post<DefaultResponseInterface>(environment.api + 'comments', {
      text: text,
      article: article.id
    });
  }

  getComments(params: CommentParamsInterface): Observable<CommentInterface | DefaultResponseInterface> {
    return this._http.get<CommentInterface | DefaultResponseInterface>(environment.api + 'comments', {
      params: params as any,
    });
  }

  getActionsForComments(commentId: string): Observable<ActionsForCommentInterface[] | DefaultResponseInterface> {
    return this._http.get<ActionsForCommentInterface[] | DefaultResponseInterface>(environment.api + 'comments/' +
      commentId + '/actions');
  }

  applyActionForComment(action: 'like' | 'dislike' | 'violate', commentId: string): Observable<DefaultResponseInterface> {
    return this._http.post<DefaultResponseInterface>(environment.api + 'comments/' + commentId + '/apply-action', {
      action: action,
    });
  }
}
