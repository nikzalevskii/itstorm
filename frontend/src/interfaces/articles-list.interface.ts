import {ArticleInterface} from "./article.interface";

export interface ArticlesListInterface {
  count: number,
  pages: number,
  items: ArticleInterface[],
}
