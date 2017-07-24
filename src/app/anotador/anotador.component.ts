import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AuthService } from '../providers/auth.service';

@Component({
  selector: 'app-anotador',
  templateUrl: './anotador.component.html',
  styleUrls: ['./anotador.component.css']
})
export class AnotadorComponent implements OnInit {
  corpora: FirebaseListObservable<any[]>;
  productions: FirebaseListObservable<any[]>;
  simplifications: FirebaseListObservable<any[]>;
  texts: FirebaseListObservable<any[]>;

  stage: string;
  stageTitle: string;
  searchText: string = '';
  showSearch: boolean = true;

  selectedCorpusId: number;
  selectedCorpusName: string;
  
  corpusName: string;
  corpusSource: string;
  corpusGenre: string;

  productionTitle: string;
  productionPublished: string;
  productionContent: string;

  constructor(private authService: AuthService, public af: AngularFireDatabase) {
    this.listCorpora();
   }

  ngOnInit() {

  }

  search() {

  }

  listCorpora() {
    this.corpora = this.af.list('/corpora', {
      query: {
        limitToLast: 50
      }
    });
    this.stage = "corpora";
    this.stageTitle = "Meus Córpus";
    this.showSearch = true;
  }

  selectCorpus(corpusId, corpusName) {
    this.selectedCorpusId = corpusId;
    this.selectedCorpusName = corpusName;
    this.listProductions();
  }

  newCorpus() {
    this.stage = "newCorpus";
    this.stageTitle = "Novo Córpus";
    this.showSearch = false;
  }

  saveCorpus() {
    this.corpora.push({name: this.corpusName, source: this.corpusSource, genre: this.corpusGenre});
    this.listCorpora();
  }

  listProductions() {
    this.stage = "productions";
    this.stageTitle = this.selectedCorpusName + " - Produções";
    this.productions = this.af.list('/corpora/' + this.selectedCorpusId + "/productions", {
      query: {
        limitToLast: 50
      }
    });

  }

  selectProduction(prodId, prodTitle) {
    this.stage = "simplifications";
    this.stageTitle = "Simplificações - " + prodTitle;
    this.showSearch = false;
    this.simplifications = this.af.list('/corpora/' + this.selectedCorpusId + "/productions/" + prodId + "/simplifications", {
      query: {
        limitToLast: 50
      }
    });
  }
  
  newProduction() {
    this.stage = "newProduction";
    this.stageTitle = "Nova Produção";
    this.showSearch = false;
  }

  saveProduction() {
    this.productions.push(
      {title: this.productionTitle, published: this.productionPublished}
    ).then((item) => {
      this.texts = this.af.list('/corpora/' + this.selectedCorpusId + "/productions/" + item.key + "/texts");
      this.texts.push(
        {title: this.productionTitle, content: this.productionContent, level: 1}
      );
    });
    this.listProductions();
  }

}
