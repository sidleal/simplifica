import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';
import { SenterService } from '../providers/senter.service';

@Component({
  selector: 'app-anotador',
  templateUrl: './anotador.component.html',
  styleUrls: ['./anotador.component.css']
})
export class AnotadorComponent implements OnInit {
  corpora: FirebaseListObservable<any[]>;
  simplifications: FirebaseListObservable<any[]>;
  texts: FirebaseListObservable<any[]>;
  simplification: FirebaseObjectObservable<any>;
  simplificationTextFrom: FirebaseObjectObservable<any>;

  breadcrumb: string = "editor";
  stage: string;

  selectedCorpusId: string;
  selectedCorpusName: string;
  
  selectedSimplificationId: string;
  selectedSimplificationName: string;

  selectedTextId: string;
  selectedTextTitle: string;

  corpusName: string;
  corpusSource: string;
  corpusGenre: string;

  textName: string;
  textTitle: string;
  textSubTitle: string;
  textAuthor: string;
  textPublished: string;
  textSource: string;
  textContent: string;
  textRawContent: string;

  simplificationName: string;
  simplificationFrom: string;
  simplificationTag: string;
  simplificationToTitle: string;
  simplificationToSubTitle: string;

  parsedSimplificationTextFrom: string = '';
  context = this;
  parsedSimplificationTextTo: string = '';

  totalParagraphs: number;
  totalSentences: number;

  constructor(private authService: AuthService, public af: AngularFireDatabase, private router: Router, private senterService: SenterService) {
    this.showMenu();
   }

  ngOnInit() {

  }

  search() {

  }

  back() {
    switch(this.stage) {
      case "corpora":
        this.showMenu();
        break;
      case "newCorpus":
        this.showMenu();
        break;
      case "textMenu":
        this.listCorpora();
        break;
      case "newText":
        this.showTextMenu();
        break;
      case "texts":
        this.showTextMenu();
        break;        
      case "doSimplification":
        this.listTexts();
        break;        
      case "simplifications":
        this.showTextMenu();
        break;        
      default:
        this.router.navigate(['']);
    }
  }

  showMenu() {
    this.stage = "menu";
    this.breadcrumb = "editor > menu"
  }

  listCorpora() {
    this.corpora = this.af.list('/corpora', {
      query: {
        limitToLast: 50
      }
    });
    this.stage = "corpora";
    this.breadcrumb = "editor > meus corpora"
  }

  selectCorpus(corpusId, corpusName) {
    this.selectedCorpusId = corpusId;
    this.selectedCorpusName = corpusName;
    this.showTextMenu();
  }

  newCorpus() {
    this.stage = "newCorpus";
    this.breadcrumb = "editor > novo córpus"
  }

  saveCorpus() {
    this.corpora = this.af.list('/corpora');
    this.corpora.push({name: this.corpusName, source: this.corpusSource, genre: this.corpusGenre});
    this.showMenu();
  }
  
  deleteCorpus(corpusId) {
    this.af.object('/corpora/' + corpusId).remove();
  }

  backToMenu() {
    this.router.navigate(['']);
  }

  showTextMenu() {
    this.stage = "textMenu";
    this.breadcrumb = "editor > meus corpora > " + this.selectedCorpusName + " > textos";
  }


  listTexts() {
    this.stage = "texts";
    this.breadcrumb = "editor > meus corpora > " + this.selectedCorpusName + " > textos";
    this.texts = this.af.list('/corpora/' + this.selectedCorpusId + "/texts", {
      query: {
        limitToLast: 50
      }
    });
  }

  newText() {
    this.stage = "newText";
    this.breadcrumb = "editor > meus corpora > " + this.selectedCorpusName + " > importar novo texto";
  }

  deleteText(textId) {
    this.af.object('/corpora/' + this.selectedCorpusId + '/texts/' + textId).remove();
  }

  saveText() {

    if (this.textRawContent == null) {
      this.textRawContent = this.textContent;
    }

    this.texts = this.af.list('/corpora/' + this.selectedCorpusId + "/texts");
    this.texts.push(
      {
        name: this.textName,
        title: this.textTitle,
        subTitle: this.textSubTitle, 
        content: this.textContent, 
        published: this.textPublished, 
        author: this.textAuthor,
        source: this.textSource,
        rawContent: this.textRawContent,
        level: 0
      }
    );
    this.showTextMenu();
  }

  selectText(textId, textTitle) {
    this.selectedTextId = textId;
    this.selectedTextTitle = textTitle;
    this.doSimplification();
  }

  listSimplifications() {
    this.stage = "simplifications";
    this.breadcrumb = "editor > meus corpora > " + this.selectedCorpusName + " > Simplificações";
    this.simplifications = this.af.list('/corpora/' + this.selectedCorpusId + "/simplifications", {
      query: {
        limitToLast: 50
      }
    });
  }
    
  saveSimplification() {
    this.simplifications = this.af.list('/corpora/' + this.selectedCorpusId + "/simplifications");
    this.simplifications.push(
      {
        name: this.simplificationName,
        from: this.selectedTextId,
        tags: this.simplificationTag,
        updated: '12.12.2012'
      }
    );
    this.showTextMenu();
  }

  selectSimplification(simplId, simplName) {
    this.selectedSimplificationId = simplId;
    this.selectedSimplificationName = simplName;
    //this.doSimplification();
  }

  doSimplification() {
    this.stage = "doSimplification";
    this.breadcrumb = "editor > meus corpora > " + this.selectedCorpusName + " > textos > " + this.selectedTextTitle + " > Nova Simplificação";
    this.simplificationTextFrom = this.af.object('/corpora/' + this.selectedCorpusId  + "/texts/" + this.selectedTextId);

    this.simplificationTextFrom.subscribe(text => {
      this.simplificationToTitle = text.title;
      this.simplificationToSubTitle = text.subTitle;

      var parsedText = this.senterService.splitText(text.content);

      this.totalParagraphs = parsedText['totP'];
      this.totalSentences =  parsedText['totS'];

      var out = '';
      out += "<style type='text/css'> p span:hover {background: #cdff84;cursor:pointer;} </style>"
      parsedText['paragraphs'].forEach(p => {
        out += '<p id=\'f_p' + p['idx'] + '\'>';
        p['sentences'].forEach(s => {
          out += '<span id=\'f_p' + p['idx'] + '_s' + s['idx'] + '\' onmouseover=\'overSentence(this);\' onmouseout=\'outSentence(this);\'>' + s['text'] + ' </span>';
        });
        out += "</p>"
      });

      this.parsedSimplificationTextFrom = out;


      out = '';
      out += "<style type='text/css'> p span:hover {background: #cdff84;cursor:pointer;} </style>"
      parsedText['paragraphs'].forEach(p => {
        out += '<p id=\'t_p' + p['idx'] + '\'>';
        p['sentences'].forEach(s => {
          out += '<span id=\'t_p' + p['idx'] + '_s' + s['idx'] + '\' onmouseover=\'overSentence(this);\' onmouseout=\'outSentence(this);\'>' + s['text'] + ' </span>';
        });
        out += "</p>"
      });

      this.parsedSimplificationTextTo = out;






    });
  }


  changeListener(event) {

    var reader:FileReader = new FileReader();
    
    this.textTitle = '';
    this.textSubTitle = '';
    this.textAuthor = '';
    this.textPublished = '';
    this.textSource = '';
    
    reader.onloadend = (e) => {
        //console.log(reader.result);
        this.textRawContent = reader.result;

        var linhas: string[] = reader.result.split("\n");
        var parsedText: string = '';

        linhas.forEach(element => {
          //console.log(element);
          var meta: boolean = false;
          
          var match;
          
          match = /<title>(.*)<\/title>/g.exec(element);
          if (match) {
            this.textTitle = match[1];
            meta = true;
          }

          match = /<subtitle>(.*)<\/subtitle>/g.exec(element);
          if (match) {
            if (!this.textSubTitle) {
              this.textSubTitle = match[1];
            } else {
              parsedText += "\n" + match[1] + "\n\n";
            }
            meta = true;
          }

          match = /<author>(.*)<\/author>/g.exec(element);
          if (match) {
            this.textAuthor = match[1];
            meta = true;
          }

          match = /<date>(.*)<\/date>/g.exec(element);
          if (match) {
            this.textPublished = match[1];
            meta = true;
          }

          match = /<url>(.*)<\/url>/g.exec(element);
          if (match) {
            this.textSource = match[1];
            meta = true;
          }

          if (!meta) {
            parsedText += element + "\n";
          }

        });

        this.textContent = parsedText;

    }
    reader.readAsText(event.target.files[0], 'UTF-8');
  }

}
