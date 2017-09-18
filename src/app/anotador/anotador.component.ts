import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from 'angularfire2/database';
import { AuthService } from '../providers/auth.service';
import { Router } from '@angular/router';
import { SenterService } from '../providers/senter.service';
import { ChangeDetectorRef } from '@angular/core';
import 'rxjs/add/operator/take';
import * as moment from 'moment';

declare var jQuery:any;

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

  textFrom: string = '';
  context = this;
  textTo: string = '';
  
  totalParagraphs: number;
  totalSentences: number;

  searchText: string;

  loggedUser: string;

  constructor(private authService: AuthService, public af: AngularFireDatabase, 
    private router: Router, private senterService: SenterService) {
    this.authService.afAuth.authState.subscribe( auth => {
        this.loggedUser = auth.email;     
    });
    this.showMenu();
  }

  confirmDialog(message, callback) {
    jQuery('<div></div>').appendTo('body')
    .html('<div><h6>'+message+'?</h6></div>')
    .dialog({
        modal: true, title: 'Atenção', zIndex: 10000, autoOpen: true,
        width: 'auto', resizable: false,
        buttons: {
            Yes: function () {
                jQuery(this).dialog("close");
                callback(true);
            },
            No: function () {
                jQuery(this).dialog("close");
                callback(false);
            }
        },
        close: function (event, ui) {
            jQuery(this).remove();
        },
        open: function() {
          jQuery('.ui-dialog :button').blur();
        }
    });
  };

  editSentenceDialog(context, operation, sentence, callback) {
    jQuery('<div></div>').appendTo('body')
    .html('<div><textarea rows="5" cols="80" id="editSentenceText">' + sentence + '</textarea></div>')
    .dialog({
        modal: true, title: operation, zIndex: 10000, autoOpen: true,
        width: 'auto', resizable: true,
        buttons: {
            Confirmar: function () {
                var text = jQuery('#editSentenceText').val();
                callback(context, true, text);
                jQuery(this).dialog("close");
            },
            Cancelar: function () {
                jQuery(this).dialog("close");
                callback(context, false, '');
            }
        },
        close: function (event, ui) {
            jQuery(this).remove();
            callback(context, false, '');
        }
    });
  };

  editSentenceDialogInclusion(context, operation, sentence, callback) {
    jQuery('<div></div>').appendTo('body')
    .html('<div><textarea rows="5" cols="80" id="editSentenceText">' + sentence + '</textarea></div>')
    .dialog({
        modal: true, title: operation, zIndex: 10000, autoOpen: true,
        width: 'auto', resizable: true,
        buttons: {
            Antes: function () {
                var text = jQuery('#editSentenceText').val();
                callback(context, 1, text);
                jQuery(this).dialog("close");
            },
            Depois: function () {
              var text = jQuery('#editSentenceText').val();
              callback(context, 2, text);
              jQuery(this).dialog("close");
            },
            Cancelar: function () {
                jQuery(this).dialog("close");
                callback(context, -1, '');
            }
        },
        close: function (event, ui) {
            jQuery(this).remove();
            callback(context, false, '');
        }
    });
  };

  ngOnInit() {
    jQuery("#operations").draggable();  
    jQuery("#selected-sentence").draggable();
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
        jQuery("#operations").hide();        
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
    this.confirmDialog('Confirma a exclusão?', ret => {
      if (ret) {
        this.af.object('/corpora/' + corpusId).remove();        
      }
    });
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
    this.confirmDialog('Confirma a exclusão?', ret => {
      if (ret) {
        this.af.object('/corpora/' + this.selectedCorpusId + '/texts/' + textId).remove();
      }
    });

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
    ).then((text) => { 
      var parsedText = this.senterService.splitText(this.textContent);
      this.saveParagraphs(text, parsedText); 
    });

    this.showTextMenu();
  }

  saveParagraphs(text, parsedText) {
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
    var newTextcontent = '';

    var textToHTML = document.getElementById("divTextTo").innerHTML;
    textToHTML = textToHTML.substring(textToHTML.indexOf("<p "), textToHTML.indexOf("</p></div>")+4);
    textToHTML = textToHTML.replace(/(<\/p>)(<p)/g, "$1|||$2");
    var paragraphs = textToHTML.split("|||");
    paragraphs.forEach(p => {
      var pContent = '';
      idxParagraphs++;
      var parsedParagraph = {"idx": idxParagraphs, "sentences": []};

      p = p.substring(p.indexOf("<span "), p.indexOf("</span></p>")+7);
      p = p.replace(/(<\/span>)(<span)/g, "$1|||$2");
      var sentences = p.split("|||");
      sentences.forEach(s => {
        idxSentences++;
        var regexp = /id="(.+?)"/g
        var match = regexp.exec(s);
        var sId = match[1];

        regexp = /<span.+?>(.+?)<\/span>/g
        match = regexp.exec(s);
        var sContent = match[1];
        newTextcontent += sContent;
        pContent += sContent;

        regexp = /data-pair="(.+?)"/g
        match = regexp.exec(s);
        var sPair = match[1];

        var operations = '';
        var sPairList = sPair.split(',');
        sPairList.forEach(pair => {
          if (document.getElementById(pair) != null) {
            operations += document.getElementById(pair).getAttribute("data-operations");            
          }
        });

        var parsedSentence = {"idx": idxSentences, "text": sContent, "id": sId, "pair": sPair, "operations": operations, "tokens": []};
        
        var parsedText = this.senterService.splitText(sContent);
        var parsedS = parsedText['paragraphs'][0]['sentences'][0];
        parsedSentence["qtt"] = parsedS["qtt"];
        parsedSentence["qtw"] = parsedS["qtw"];
        parsedS["tokens"].forEach(t => {
          idxTokens++;
          parsedSentence['tokens'].push({"idx": idxTokens, "token": t["token"]});
        });

        parsedParagraph.sentences.push(parsedSentence);
      });
      parsedParagraph['text'] = pContent;
      parsedParagraphs.push(parsedParagraph);
      newTextcontent += '\n';
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
          content: newTextcontent,
          published: moment().format("YYYY-MM-DD"),
          updated: moment().format("YYYY-MM-DD"),
          author: text.author + ' / ' + this.loggedUser,
          source: 'Simplificação Nível ' + (text.level + 1),
          level: text.level + 1
        }
      ).then((text) => {
        this.saveParagraphs(text, parsedText);

        // this.simplifications = this.af.list('/corpora/' + this.selectedCorpusId + "/simplifications");
        // this.simplifications.push(
        //   {
        //     name: this.simplificationName,
        //     from: this.selectedTextId,
        //     to: text.key,
        //     tags: this.simplificationTag,
        //     updated: moment().format("YYYY-MM-DD")
        //   }
        // );

      });
    });

    // this.showTextMenu();
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
      this.simplificationName = "Natural " + (text.level) + ' -> ' + (text.level + 1);
      this.simplificationTag = "Nível " + (text.level + 1);
  
      this.totalParagraphs = text.totP;
      this.totalSentences =  text.totS;

      var out = '';
      out += "<style type='text/css'>";
      out += " p span:hover {background:#cdff84;cursor:pointer;}";
      out += " p span div {display:inline-block;}";
      out += " p span div:hover {font-weight:bold;text-decoration:underline;cursor:pointer;}";
      out += "</style>";
      var openQuotes = false;
      var lastToken = '';
      for(var p in text.paragraphs) {
        out += '<p id=\'f.p.' + p + '\'>';
        for(var s in text.paragraphs[p].sentences) {
          var sObj = text.paragraphs[p].sentences[s];
          out += '<span id=\'f.s.' + s + '\' data-selected=\'false\' data-pair=\'t.s.' + s + '\'';
          out += ' data-qtt=\'' + sObj.qtt + '\' data-qtw=\'' + sObj.qtw + '\'';
          out += ' data-operations=\'\'';
          out += ' onclick=\'sentenceClick(this)\'';
          // out += ' (click)=\'sentenceClick(this)\'';
          out += ' onmouseover=\'overSentence(this);\' onmouseout=\'outSentence(this);\'>'
          for(var t in sObj.tokens) {
            var token = sObj.tokens[t].token;

            if ('\"\''.indexOf(token) >= 0) {
              openQuotes = !openQuotes;
              if (openQuotes) {
                out += ' ';
              }
            } else if (openQuotes && '\"\''.indexOf(lastToken) >= 0) {
              //nothing
            } else if ('.,)]}!?:'.indexOf(token) < 0 && '([{'.indexOf(lastToken) < 0) {
              out += ' ';
            }

            out += '<div id=\'f.t.' + t + '\' data-selected=\'false\' data-pair=\'t.t.' + t + '\'';
            out += ' onclick=\'wordClick(this)\'';
            out += ' onmouseover=\'overToken(this);\' onmouseout=\'outToken(this);\'>' + token + '</div>';
            lastToken = token;
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
          out += '<span id=\'t.s.' + s + '\'  data-selected=\'false\' data-pair=\'f.s.' + s + '\'';
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
            } else if ('.,)]}!?:'.indexOf(token) < 0 && '([{'.indexOf(out.substr(-1)) < 0) {
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

    jQuery('#operations').show();
    jQuery('#selected-sentence').show();
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
        this.textRawContent = reader.result;

        var linhas: string[] = reader.result.split("\n");
        var parsedText: string = '';

        linhas.forEach(element => {
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

  // OPERATIONS

  doOperation(type) {

    var selectedSentences = jQuery('#selectedSentences').val().split(',');
    var sentenceList = selectedSentences.toString();
    
    selectedSentences.forEach(s => {
        var operations = document.getElementById(s).getAttribute('data-operations');
        operations += type + '(' + sentenceList + ');';
        document.getElementById(s).setAttribute('data-operations', operations);
      });

    this.rewriteTextTo(type, selectedSentences);
  }

  rewriteTextTo(type, selectedSentences) {
      var textToHTML = document.getElementById("divTextTo").innerHTML;
      textToHTML = textToHTML.substring(textToHTML.indexOf("<p "), textToHTML.indexOf("</p></div>")+4);
      textToHTML = textToHTML.replace(/(<\/p>)(<p)/g, "$1|||$2");
      var paragraphs = textToHTML.split("|||");

      paragraphs.forEach(p => {
          p = p.substring(p.indexOf("<span "), p.indexOf("</span></p>")+7);
          p = p.replace(/(<\/span>)(<span)/g, "$1|||$2");
          var sentences = p.split("|||");
          
          switch (type) {
              case 'union':
                  this.doUnion(sentences, selectedSentences); break;
              case 'division':
                  this.doDivision(sentences, selectedSentences); break;
              // case 'remotion':
              //     doRemotion(sentences); break;
              case 'inclusion':
                  this.doInclusion(sentences, selectedSentences); break;
              // case 'rewrite':
              //     doRewrite(sentences); break;
          }

      });
  }


  doDivision(sentences, selectedSentences) {
    sentences.forEach(s => {
        if (s.indexOf(selectedSentences[0]) > 0) {
            var pp = this.parseSentence(s);
  
            this.editSentenceDialog(this, "Divisão de Sentença", pp['content'], function (context, ret, text) {
                if (ret) {
                    var parsedText = context.senterService.splitText(text);
                    var parsedSentences = parsedText['paragraphs'][0]['sentences']; 

                    var newHtml = "";
                    var newIds = [];
                    parsedSentences.forEach(ns => {
                      var newSentHtml = "<span _ngcontent-" + pp['ngContent'] + "=\"\" data-pair=\"{pair}\" data-qtt=\"{qtt}\" data-qtw=\"{qtw}\" data-selected=\"true\" id=\"{id}\" onmouseout=\"outSentence(this);\" onmouseover=\"overSentence(this);\" style=\"font-weight: bold;background: #EDE981;\"> {content}</span>";
                      newSentHtml = newSentHtml.replace("{id}", pp['id'] + '_new_' + ns['idx']);
                      newSentHtml = newSentHtml.replace("{pair}", pp['pair']);
                      newSentHtml = newSentHtml.replace("{qtt}", ns['qtt']);
                      newSentHtml = newSentHtml.replace("{qtw}", ns['qtw']);
                      newSentHtml = newSentHtml.replace("{content}", ns['text']);

                      newIds.push(pp['id'] + '_new_' + ns['idx']);
                      newHtml += newSentHtml;
                    });
                   
                    jQuery("#divTextTo").html(jQuery("#divTextTo").html().replace(s, newHtml));
                    document.getElementById(selectedSentences[0]).setAttribute('data-pair', newIds.toString());
                }
  
            });
                
        }
    });
  }

  parseSentence(sentence) {
      var ret = {};
      var regexp = /<span.*ngcontent-(.*)=[^>]*data-pair="(.+?)".*data-qtt="(.+?)".*data-qtw="(.+?)".*id="(.+?)".*>(.+?)<\/span>/g;
      var match = regexp.exec(sentence);
      ret['ngContent'] = match[1]; 
      ret['pair'] = match[2];
      ret['qtt'] = parseInt(match[3]);
      ret['qtw'] = parseInt(match[4]);
      ret['id'] = match[5];
      ret['content'] = match[6];
      return ret;
  }

  doUnion(sentences, selectedSentences) {
    var previousSentence = '';
    sentences.forEach(s => {
        if (s.indexOf(selectedSentences[0]) > 0) {
            var ps = this.parseSentence(s);
            var pps = this.parseSentence(previousSentence);
  
            this.editSentenceDialog(this, "União de Sentença", pps['content'] + ' ' + ps['content'], function (context, ret, text) {
                if (ret) {
                    var parsedText = context.senterService.splitText(text);
                    var parsedSentence = parsedText['paragraphs'][0]['sentences'][0]; 

                    var newId = pps['id'] + '|' + ps['id'];

                    var newSentHtml = "<span _ngcontent-" + ps['ngContent'] + "=\"\" data-pair=\"{pair}\" data-qtt=\"{qtt}\" data-qtw=\"{qtw}\" data-selected=\"true\" id=\"{id}\" onmouseout=\"outSentence(this);\" onmouseover=\"overSentence(this);\" style=\"font-weight: bold;background: #EDE981;\"> {content}</span>";
                    newSentHtml = newSentHtml.replace("{id}", newId);
                    newSentHtml = newSentHtml.replace("{pair}", pps['pair'] + ',' + ps['pair']);
                    newSentHtml = newSentHtml.replace("{qtt}", parsedSentence['qtt']);
                    newSentHtml = newSentHtml.replace("{qtw}", parsedSentence['qtw']);
                    newSentHtml = newSentHtml.replace("{content}", parsedSentence['text']);

                    jQuery("#divTextTo").html(jQuery("#divTextTo").html().replace(document.getElementById(pps['id']).outerHTML, ''));
                    jQuery("#divTextTo").html(jQuery("#divTextTo").html().replace(s, newSentHtml));

                    document.getElementById(ps['pair']).setAttribute('data-pair', newId);
                    document.getElementById(pps['pair']).setAttribute('data-pair', newId);
                }
  
            });
        }
        previousSentence = s;
    });
  }


  doInclusion(sentences, selectedSentences) {
    sentences.forEach(s => {
        if (s.indexOf(selectedSentences[0]) > 0) {
            var ps = this.parseSentence(s);
  
            this.editSentenceDialogInclusion(this, "Inclusão de Sentença", '', function (context, ret, text) {
                if (ret > 0) {
                    var parsedText = context.senterService.splitText(text);
                    var parsedSentence = parsedText['paragraphs'][0]['sentences'][0]; 

                    var newId = ps['id'] + '_new';

                    var newSentHtml = "<span _ngcontent-" + ps['ngContent'] + "=\"\" data-pair=\"{pair}\" data-qtt=\"{qtt}\" data-qtw=\"{qtw}\" data-selected=\"true\" id=\"{id}\" onmouseout=\"outSentence(this);\" onmouseover=\"overSentence(this);\" style=\"font-weight: bold;background: #EDE981;\"> {content}</span>";
                    newSentHtml = newSentHtml.replace("{id}", newId);
                    newSentHtml = newSentHtml.replace("{pair}", ps['pair']);
                    newSentHtml = newSentHtml.replace("{qtt}", parsedSentence['qtt']);
                    newSentHtml = newSentHtml.replace("{qtw}", parsedSentence['qtw']);
                    newSentHtml = newSentHtml.replace("{content}", parsedSentence['text']);

                    var newHtml = '';
                    if (ret == 1) {
                      newHtml = newSentHtml + s;
                    } else {
                      newHtml = s + newSentHtml;
                    }
                    
                    jQuery("#divTextTo").html(jQuery("#divTextTo").html().replace(s, newHtml));

                    document.getElementById(ps['pair']).setAttribute('data-pair', ps['id'] + ',' + newId);
                }
  
            });
        }
    });
  }


}

