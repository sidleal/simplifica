import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';
import { SenterService } from '../providers/senter.service';
import { ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/take';

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

  simplificationName: string = "Natural";
  simplificationFrom: string;
  simplificationTag: string = "Nivel 1";
  simplificationToTitle: string;
  simplificationToSubTitle: string;

  textFrom: string = '';
  context = this;
  textTo: string = '';

  totalParagraphs: number;
  totalSentences: number;

  searchText: string;

  constructor(private authService: AuthService, public af: AngularFireDatabase, 
    private router: Router, private senterService: SenterService) {
    this.showMenu();
   }

  ngOnInit() {

  }

  filterText() {
    var title = this.searchText;
    if (title.length > 3) {
      this.texts = this.af.list('/corpora/' + this.selectedCorpusId + "/texts", {
        query: {
          orderByChild: 'title',
          startAt: title,
          endAt: title + '\uf8ff',
          limitToLast: 50
        }
      });
    }
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
    this.textName = '';
    this.textTitle = '';
    this.textSubTitle = '';
    this.textAuthor = '';
    this.textPublished = '';
    this.textSource = '';
    this.textContent = '';
    this.textRawContent = '';
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
    ).then((text) => { this.saveParagraphs(text) });

    this.showTextMenu();
  }

  saveParagraphs(text) {
    var parsedText = this.senterService.splitText(this.textContent);

    var textObj = this.af.object('/corpora/' + this.selectedCorpusId + "/texts/" + text.key);
    textObj.update(
      {
        totP: parsedText['totP'],
        totS:  parsedText['totS'],
        totT:  parsedText['totT']
      });

    var paragraphs = this.af.list('/corpora/' + this.selectedCorpusId + "/texts/" + text.key + "/paragraphs");

    parsedText['paragraphs'].forEach(p => {
      paragraphs.push(
        {
          idx: p['idx'],
          text: p['text']
        }
      ).then((par) => {
        this.saveSentences(text, par, p);
      });
    });

  }

  saveSentences(text, par, p) {
    var sentences = this.af.list('/corpora/' + this.selectedCorpusId + "/texts/" + text.key + "/paragraphs/" + par.key + "/sentences");
    p['sentences'].forEach(s => {
      sentences.push(
        {
          idx: s['idx'],
          text: s['text'],
          qtw: s['qtw'],
          qtt: s['qtt']
        }
      ).then((sent) => {
        this.saveTokens(text, par, sent, s);
      });
    });

  }

  saveTokens(text, par, sent, s) {
    var tokens = this.af.list('/corpora/' + this.selectedCorpusId + "/texts/" + text.key + "/paragraphs/" + par.key + "/sentences/" + sent.key + "/tokens");
    s['tokens'].forEach(t => {
      tokens.push(
        {
          idx: t['idx'],
          token: t['token'],
          lemma: t['token']
        }
      );
    });
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
    var textToTitle = document.getElementById("divTextToTitle").innerHTML;
    var textToSubTitle = document.getElementById("divTextToSubTitle").innerHTML;

    var parsedParagraphs = [];
    var idxParagraphs = 0;
    var idxSentences = 0;
    var idxTokens = 0;

    var textToHTML = document.getElementById("divTextTo").innerHTML;
    textToHTML = textToHTML.substring(textToHTML.indexOf("<p "), textToHTML.indexOf("</p></div>"));
    textToHTML = textToHTML.replace(/(<\/p>)(<p)/g, "$1|||$2");
    var paragraphs = textToHTML.split("|||");
    paragraphs.forEach(p => {
      idxParagraphs++;
      // parsedParagraphs.push({"idx": idxParagraphs, "text": "TODO", "sentences": []});
      var parsedParagraph = {"idx": idxParagraphs, "text": "TODO", "sentences": []};

      p = p.replace(/(<\/span>)(<span)/g, "$1|||$2");
      var sentences = p.split("|||");
      sentences.forEach(s => {
        idxSentences++;
        var regexp = /id="t\.s\.(.+?)"/g
        var match = regexp.exec(s);
        var sId = match[1];

        regexp = /data-pair="f\.s\.(.+?)"/g
        match = regexp.exec(s);
        var sPair = match[1];

        // console.log('sentence id ' + sId + 'pair ' + sPair);

        var parsedSentence = {"idx": idxSentences, text: "TODO", "id": sId, "pair": sPair, "tokens": []};
        var tokens = s.split("&nbsp;");
        tokens.forEach(t => {
          if (t.indexOf("div") > 0) {
            idxTokens++;
            var regexp = /id="t\.t\.(.+?)"/g
            var match = regexp.exec(t);
            var tId = match[1];

            regexp = /data-pair="f\.t\.(.+?)"/g
            match = regexp.exec(t);
            var tPair = match[1];

            regexp = />([^<]+?)</g
            match = regexp.exec(t);
            var t = match[1];

            var parsedToken = {"idx": idxTokens, "token": t, "lemma": "TODO", "id": tId, "pair": tPair}
            parsedSentence.tokens.push(parsedToken);
            // console.log('token id ' + tId + ' pair ' + tPair + ' - ' + t);
          }
        });
        parsedParagraph.sentences.push(parsedSentence);
      });
      parsedParagraphs.push(parsedParagraph);
    });

    var parsedText = {"totP": idxParagraphs, "totS": idxSentences, "totT": idxTokens, "paragraphs": parsedParagraphs};

    this.simplificationTextFrom = this.af.object('/corpora/' + this.selectedCorpusId  + "/texts/" + this.selectedTextId);
    this.simplificationTextFrom.take(1).subscribe(text => {

      this.texts = this.af.list('/corpora/' + this.selectedCorpusId + "/texts");
      var newName = text.name;
      newName = newName.replace(/nível_[0-9]+/g, "nível_" + (text.level + 1));
      this.texts.push(
        {
          name: newName,
          title: textToTitle,
          subTitle: textToSubTitle, 
          content: 'TODO',
          published: "12.12.12",
          updated: "12.12.12",
          author: "TODO",
          source: text.source,
          rawContent: "TODO",
          level: text.level + 1
        }
      ).then((text) => {
        this.saveParagraphsB(text, parsedText);

        this.simplifications = this.af.list('/corpora/' + this.selectedCorpusId + "/simplifications");
        this.simplifications.push(
          {
            name: this.simplificationName,
            from: this.selectedTextId,
            to: text.key,
            tags: this.simplificationTag,
            updated: '12.12.2012'
          }
        );

      });
    });

    this.showTextMenu();
  }




  saveParagraphsB(text, parsedText) {
    var textObj = this.af.object('/corpora/' + this.selectedCorpusId + "/texts/" + text.key);
    textObj.update(
      {
        totP: parsedText['totP'],
        totS: parsedText['totS'],
        totT: parsedText['totT']
      });

    var paragraphs = this.af.list('/corpora/' + this.selectedCorpusId + "/texts/" + text.key + "/paragraphs");

    parsedText['paragraphs'].forEach(p => {
      paragraphs.push(
        {
          idx: p['idx'],
          text: p['text']
        }
      ).then((par) => {
        this.saveSentencesB(text, par, p);
      });
    });

  }

  saveSentencesB(text, par, p) {
    var sentences = this.af.list('/corpora/' + this.selectedCorpusId + "/texts/" + text.key + "/paragraphs/" + par.key + "/sentences");
    p['sentences'].forEach(s => {
      sentences.push(
        {
          idx: s['idx'],
          text: s['text'],
        }
      ).then((sent) => {
        this.saveTokensB(text, par, sent, s);
      });
    });

  }

  saveTokensB(text, par, sent, s) {
    var tokens = this.af.list('/corpora/' + this.selectedCorpusId + "/texts/" + text.key + "/paragraphs/" + par.key + "/sentences/" + sent.key + "/tokens");
    s['tokens'].forEach(t => {
      tokens.push(
        {
          idx: t['idx'],
          token: t['token'],
          lemma: t['lemma']
        }
      ).then((token) => {
        t['id'] = token.id;
      });
    });
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

    this.simplificationTextFrom.take(1).subscribe(text => {
      this.simplificationToTitle = text.title;
      this.simplificationToSubTitle = text.subTitle;

      this.totalParagraphs = text.totP;
      this.totalSentences =  text.totS;

      var out = '';
      out += "<style type='text/css'>";
      out += " p span:hover {background:#cdff84;cursor:pointer;}";
      out += " p span div {display:inline-block;}";
      out += " p span div:hover {font-weight:bold;text-decoration:underline;cursor:pointer;}";
      out += "</style>";
      for(var p in text.paragraphs) {
        out += '<p id=\'f.p.' + p + '\'>';
        for(var s in text.paragraphs[p].sentences) {
          var sObj = text.paragraphs[p].sentences[s];
          out += '<span id=\'f.s.' + s + '\' data-selected=\'false\' data-pair=\'t.s.' + s + '\'';
          out += ' data-qtt=\'' + sObj.qtt + '\' data-qtw=\'' + sObj.qtw + '\'';
          out += ' onclick=\'sentenceClick(this)\'';
          out += ' onmouseover=\'overSentence(this);\' onmouseout=\'outSentence(this);\'>'
          for(var t in sObj.tokens) {
            var token = sObj.tokens[t].token;
            out += '<div id=\'f.t.' + t + '\' data-selected=\'false\' data-pair=\'t.t.' + t + '\'';
            out += ' onclick=\'wordClick(this)\'';
            out += ' onmouseover=\'overToken(this);\' onmouseout=\'outToken(this);\'>' + token + '</div>';
            out += '&nbsp;';
          }
          out += ' </span>';
        }
        out += "</p>"
      }
      this.textFrom = out;

      out = '';
      out += "<style type='text/css'>";
      out += " p span:hover {background:#cdff84;cursor:text;}";
      // out += " p span div {display:inline-block;padding-top:2px;padding-bottom:2px;}";
      // out += " p span div:hover {font-weight:bold;text-decoration:underline;cursor:text;}";
      out += "</style>";
      var openQuotes = false;
      for(var p in text.paragraphs) {
        out += '<p id=\'t.p.' + p + '\'>';
        for(var s in text.paragraphs[p].sentences) {
          var sObj = text.paragraphs[p].sentences[s];
          out += '<span id=\'t.s.' + s + '\' data-pair=\'f.s.' + s + '\'';
          out += ' data-qtt=\'' + sObj.qtt + '\' data-qtw=\'' + sObj.qtw + '\'';
          out += ' onmouseover=\'overSentence(this);\' onmouseout=\'outSentence(this);\'>'
          for(var t in sObj.tokens) {
            var token = sObj.tokens[t].token;
            // out += '<div id=\'t.t.' + t + '\' data-pair=\'f.t.' + t + '\'';
            // out += ' onmouseover=\'overToken(this);\' onmouseout=\'outToken(this);\'>' + token + '</div>';
            if ('\"\''.indexOf(token) >= 0) {
              openQuotes = !openQuotes;
              if (openQuotes) {
                out += ' ';
              }
            } else if (openQuotes && '\"\''.indexOf(out.substr(-1)) >= 0) {
              //nothing
            } else if ('.,)]}!?'.indexOf(token) < 0 && '([{'.indexOf(out.substr(-1)) < 0) {
              out += ' ';
            }
            out += token;
          }
          out += ' </span>';
        }
        out += "</p>"
      }
      this.textTo = out;

    });
  }

  changeListener(event) {

    var reader:FileReader = new FileReader();
    var fileTokens = event.target.value.split('\\')[2].split('.');
    var fileName: string = fileTokens[0] + ' nível_0';

    this.textName = fileName;
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
