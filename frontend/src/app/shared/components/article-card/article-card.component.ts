import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ArticleInterface} from "../../../../interfaces/article.interface";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent implements OnInit {
  @Input() article!:ArticleInterface;
  @ViewChild('titleElement') titleElement!:ElementRef;
  @ViewChild('descriptionElement') descriptionElement!:ElementRef;
  serverStaticPath:string = environment.serverStaticPath;
  descriptionHeight:number = 0;
  constructor() { }

  ngOnInit(): void {

  }



  protected readonly environment = environment;
}
