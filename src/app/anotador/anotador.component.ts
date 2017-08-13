import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';

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
  simplification: FirebaseObjectObservable<any>;
  simplificationTextFrom: FirebaseObjectObservable<any>;

  stage: string;
  stageTitle: string;
  searchText: string = '';
  showSearch: boolean = true;

  selectedCorpusId: string;
  selectedCorpusName: string;
  
  selectedProductionId: string;
  selectedProductionTitle: string;

  selectedSimplificationId: string;
  selectedSimplificationName: string;

  corpusName: string;
  corpusSource: string;
  corpusGenre: string;

  productionTitle: string;
  productionSubTitle: string;
  productionAuthor: string;
  productionPublished: string;
  productionSource: string;
  productionContent: string;
  productionRawContent: string;

  simplificationName: string;
  simplificationFrom: string;
  simplificationTag: string;

  parsedSimplificationTextFrom: string;


  constructor(private authService: AuthService, public af: AngularFireDatabase, private router: Router) {
    console.log("vou listar tudo.");
    this.listCorpora();
    console.log(this.corpora);
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
  
  backToMenu() {
    this.router.navigate(['']);
  }

  listProductions() {
    this.stage = "productions";
    this.stageTitle = "Produções - " + this.selectedCorpusName;
    this.productions = this.af.list('/corpora/' + this.selectedCorpusId + "/productions", {
      query: {
        limitToLast: 50
      }
    });
  }

  selectProduction(prodId, prodTitle) {
    this.selectedProductionTitle = prodTitle;
    this.selectedProductionId = prodId;
    this.listSimplifications();
  }
  
  newProduction() {
    this.stage = "newProduction";
    this.stageTitle = "Nova Produção";
    this.showSearch = false;
  }

  saveProduction() {
    if (this.productionRawContent == null) {
      this.productionRawContent = this.productionContent;
    }

    this.productions.push(
      {
        title: this.productionTitle, 
        published: this.productionPublished, 
        author: this.productionAuthor,
        source: this.productionSource,
        rawContent: this.productionRawContent
      }
    ).then((item) => {
      this.texts = this.af.list('/corpora/' + this.selectedCorpusId + "/productions/" + item.key + "/texts");
      this.texts.push(
        {
          title: this.productionTitle,
          subTitle: this.productionSubTitle, 
          content: this.productionContent, 
          level: 1
        }
      );
    });
    this.listProductions();
  }

  listSimplifications() {
    this.stage = "simplifications";
    this.stageTitle = "Simplificações - " + this.selectedProductionTitle;
    this.showSearch = true;
    this.simplifications = this.af.list('/corpora/' + this.selectedCorpusId + "/productions/" + this.selectedProductionId + "/simplifications", {
      query: {
        limitToLast: 50
      }
    });
  }
    
  newSimplification() {
    this.stage = "newSimplification";
    this.stageTitle = "Nova Simplificação";
    this.showSearch = false;

    this.texts = this.af.list('/corpora/' + this.selectedCorpusId + "/productions/" + this.selectedProductionId + "/texts", {
      query: {
        limitToLast: 10
      }
    });

  }

  saveNewSimplification() {
    this.simplifications.push(
      {
        name: this.simplificationName, 
        from: this.simplificationFrom, 
        tags: this.simplificationTag
      }
    );
    this.listSimplifications();
  }

  saveSimplification() {
    console.log()
  }

  selectSimplification(simplId, simplName) {
    this.selectedSimplificationId = simplId;
    this.selectedSimplificationName = simplName;
    this.doSimplification();
  }

  doSimplification() {
    this.stage = "doSimplification";
    this.stageTitle = "Simplificação - " + this.selectedSimplificationName;
    this.showSearch = false;
    this.simplification = this.af.object('/corpora/' + this.selectedCorpusId 
          + "/productions/" + this.selectedProductionId 
          + "/simplifications/" + this.selectedSimplificationId);
    
    this.simplification.subscribe(simpl => {

      this.simplificationTextFrom = this.af.object('/corpora/' + this.selectedCorpusId 
          + "/productions/" + this.selectedProductionId 
          + "/texts/" + simpl.from);

    });

    this.simplificationTextFrom.subscribe(text => {

      this.parsedSimplificationTextFrom = "vixiii<br/>vixiii."

    });
  }
    


  changeListener(event) {

    var reader:FileReader = new FileReader();
    
    this.productionTitle = '';
    this.productionSubTitle = '';
    this.productionAuthor = '';
    this.productionPublished = '';
    this.productionSource = '';
    
    reader.onloadend = (e) => {
        //console.log(reader.result);
        this.productionRawContent = reader.result;

        var linhas: string[] = reader.result.split("\n");
        var parsedText: string = '';

        linhas.forEach(element => {
          //console.log(element);
          var meta: boolean = false;
          
          var match;
          
          match = /<title>(.*)<\/title>/g.exec(element);
          if (match) {
            this.productionTitle = match[1];
            meta = true;
          }

          match = /<subtitle>(.*)<\/subtitle>/g.exec(element);
          if (match) {
            if (!this.productionSubTitle) {
              this.productionSubTitle = match[1];
            } else {
              parsedText += "\n" + match[1] + "\n\n";
            }
            meta = true;
          }

          match = /<author>(.*)<\/author>/g.exec(element);
          if (match) {
            this.productionAuthor = match[1];
            meta = true;
          }

          match = /<date>(.*)<\/date>/g.exec(element);
          if (match) {
            this.productionPublished = match[1];
            meta = true;
          }

          match = /<url>(.*)<\/url>/g.exec(element);
          if (match) {
            this.productionSource = match[1];
            meta = true;
          }

          if (!meta) {
            parsedText += element + "\n";
          }

        });

        this.productionContent = parsedText;

    }
    reader.readAsText(event.target.files[0], 'UTF-8');
  }

}
