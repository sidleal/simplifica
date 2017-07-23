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
  stage: string = "corpora";
  stageTitle: string = "Meus corpora";
  searchText: string = '';
  showSearch: boolean = true;
  selectedCorpus: number;
  
  constructor(private authService: AuthService, public af: AngularFireDatabase) {
    this.corpora = af.list('/corpora', {
      query: {
        limitToLast: 50
      }
    });
/*    this.items.forEach(element => {
       console.log(element);  
    });*/
    
   }

  ngOnInit() {

  }

  search() {

  }

  selectCorpus(corpusId, corpusName) {
    this.stage = "productions";
    this.stageTitle = corpusName + " - Produções";
    this.selectCorpus = corpusId;
    this.productions = this.af.list('/corpora/' + corpusId + "/productions", {
      query: {
        limitToLast: 50
      }
    });
  }

  selectProduction(prodId, prodTitle) {
    this.stage = "simplifications";
    this.stageTitle = "Simplificações - " + prodTitle;
    this.showSearch = false;
    this.simplifications = this.af.list('/corpora/' + this.selectCorpus + "/productions/" + prodId + "/simplifications", {
      query: {
        limitToLast: 50
      }
    });
  }

}
