import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogRoutingModule } from './blog-routing.module';
import { ArticlesComponent } from './articles/articles.component';
import { ArticleComponent } from './article/article.component';
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    ArticlesComponent,
    ArticleComponent
  ],
    imports: [
        CommonModule,
        SharedModule,
        BlogRoutingModule,
        FormsModule
    ]
})
export class BlogModule { }
