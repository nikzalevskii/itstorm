import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleCardComponent } from './components/article-card/article-card.component';
import {RouterModule} from "@angular/router";
import { CategoryFilterComponent } from './components/category-filter/category-filter.component';
import { CommentComponent } from './components/comment/comment.component';
import { PopupComponent } from './components/popup/popup.component';
import {ReactiveFormsModule} from "@angular/forms";
import { LoaderComponent } from './components/loader/loader.component';
import {NgxMaskModule} from "ngx-mask";



@NgModule({
  declarations: [
    ArticleCardComponent,
    CategoryFilterComponent,
    CommentComponent,
    PopupComponent,
    LoaderComponent
  ],
  imports: [
    CommonModule,
    NgxMaskModule.forChild(),
    RouterModule,
    ReactiveFormsModule,
  ],
  exports: [ArticleCardComponent, CategoryFilterComponent, CommentComponent, PopupComponent, LoaderComponent]
})
export class SharedModule { }
