import { Injectable } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';


@Injectable()
export class SenterService {
  abbreviations: string[] = [];

  constructor(private af: AngularFireDatabase) {
      this.af.list('/senter/abbreviations', {
      query: {
        orderByChild: 'name',
        limitToLast: 500
      }
    }).subscribe(items => {
      items.forEach(item => {
        this.abbreviations.push(item.name);
      })
    });
   }


  /*
    Rules:
    1. Delimita-se uma sentença sempre que uma marca de nova linha (carriage return e line
    feed) é encontrada, independentemente de um sinal de fim de sentença ter sido encontrado
    anteriormente;
    2. Não se delimitam sentenças dentro de aspas, parênteses, chaves e colchetes;
    3. Delimita-se uma sentença quando os símbolos de interrogação (?) e exclamação (!) são
    encontrados;
    4. Delimita-se uma sentença quando o símbolo de ponto (.) é encontrado e este não é um
    ponto de número decimal, não pertence a um símbolo de reticências (...), não faz parte de
    endereços de e-mail e páginas da Internet e não é o ponto que segue uma abreviatura;
    5. Delimita-se uma sentença quando uma letra maiúscula é encontrada após o sinal de
    reticências ou de fecha-aspas.
    (Pardo, 2006)
*/
  preProcesText(rawText) {
    var out = rawText;
    var match;

    // rule 2 - " { [ ( ) ] } "
    out = this.applyGroupRule(out, /"(.+?)"/g)
    out = this.applyGroupRule(out, /“(.+?)”/g)
    out = this.applyGroupRule(out, /\{(.+?)\}/g)
    out = this.applyGroupRule(out, /\[(.+?)\]/g)
    out = this.applyGroupRule(out, /\((.+?)\)/g)

    // rule 4 - abbreviations
    this.abbreviations.forEach(abbrev => {
        var abbrevNew: string = abbrev.replace(/\./g, '|dot|');
        var abbrevRe: string = abbrev.replace(/\./g, '\\.');
        var re = new RegExp(abbrevRe, "g");
        out = out.replace(re, abbrevNew);        
    });

    // rule 4 - internet
    var regexAddress = /(http|ftp|www|@)(.+?)\s/g;
    while (match = regexAddress.exec(out)) {
      var addressOld:string = match[2];
      var addressNew:string = addressOld.replace(/\./g, '|dot|');
      out = out.replace(addressOld, addressNew);
    }
    var regexEmail = /([A-z0-9_\-\.]+)@/g;
    while (match = regexEmail.exec(out)) {
      var emailOld:string = match[1];
      var emailNew:string = emailOld.replace(/\./g, '|dot|');
      out = out.replace(emailOld, emailNew);
    }

    //rule 4 - decimals
    out = out.replace(/([0-9]+)\.([0-9]+)/g, '$1|dot|$2');

    //rule 5 - quotes
    //out = out.replace(/"\s+([A-Z])/g, '\"|dot| |||$1'); // in texts well written this rule may be disabled.

    //rule 5 - reticences
    out = out.replace(/\.\.\.\s*([A-Z])/g, '|dot||dot||dot| |||$1');

    //rule 4 - reticences
    out = out.replace(/\.\.\./g, '|dot||dot||dot|');

    // rule 3
    out = out.replace(/\./g, '.|||');
    out = out.replace(/\?/g, '?|||');
    out = out.replace(/\!/g, '!|||');


    return out;
  }

  applyGroupRule(rawText, regexGroup) {
    var match;
    while (match = regexGroup.exec(rawText)) {
      var sentenceOld:string = match[1];
      var sentenceNew:string = sentenceOld.replace(/\./g, '|gdot|');
      sentenceNew = sentenceNew.replace(/\?/g, '|gint|');
      sentenceNew = sentenceNew.replace(/\!/g, '|gexc|');
      rawText = rawText.replace(sentenceOld, sentenceNew);
    }
    return rawText;
  }

  parseText(rawText) {
   var parsedText = {};
    var paragraphs = rawText.split("\n");

    var idxParagraphs = 0;
    var idxSentences = 0;
    var idxTokens = 0;

    parsedText['paragraphs'] = [];

    paragraphs.forEach(p => {
      p = p.trim();
      if (p != '') {
        idxParagraphs++;
        var parsedParagraph = {"idx": idxParagraphs, "sentences": [], "text": p };
        var sentences = p.split("|||");
        sentences.forEach(s => {
          s = s.trim();
          if (s.length > 1) {
            idxSentences++;
            var parsedSentence = {"idx": idxSentences, "tokens": [], "text": s, "qtt": 0, "qtw": 0};
            var tokens = this.tokenizeText(s);
            var qtw = 0;
            var qtt = 0;
            tokens.forEach(t => {
              if (t.length > 0) {
                idxTokens++;
                qtt++;
                parsedSentence['tokens'].push({"idx": idxTokens, "token": t});
                if (t.length > 1 || '{[()]}.,"?!;:-\''.indexOf(t) < 0) {
                  qtw++;
                }
              }
            });
            parsedSentence['qtt'] = qtt;
            parsedSentence['qtw'] = qtw;

            parsedParagraph['sentences'].push(parsedSentence);
          }
        });
        parsedText['paragraphs'].push(parsedParagraph);
      }
    });
    parsedText['totP'] = idxParagraphs;
    parsedText['totS'] = idxSentences;
    parsedText['totT'] = idxTokens;

    return parsedText;
  }

  postProcess(parsedText) {

    parsedText['paragraphs'].forEach(p => {
      p['text'] = this.punctuateBack(p['text']);
      p['sentences'].forEach(s => {
        s['text'] = this.punctuateBack(s['text']);
        s['tokens'].forEach(t => {
          t['token'] = this.punctuateBack(t['token']);
        });
      });
    });

    return parsedText;
  }

  punctuateBack(text) {
    text = text.replace(/\|dot\|/g, '.');
    text = text.replace(/\|gdot\|/g, '.');
    text = text.replace(/\|gint\|/g, '?');
    text = text.replace(/\|gexc\|/g, '!');    
    text = text.replace(/\|hyp\|/g, '-');
    text = text.replace(/\|\|\|/g, '')
    return text;
  }

  splitText(rawText) {

    rawText = this.preProcesText(rawText);

    var parsedText = this.parseText(rawText);    
    
    parsedText = this.postProcess(parsedText);

    return parsedText;
  }

  tokenizeText(rawText) {
    rawText = rawText.replace(/([A-z]+)-([A-z]+)/g, "$1|hyp|$2");
    rawText = rawText.replace(/\|gdot\|/g, ".");
    rawText = rawText.replace(/\|gint\|/g, "?");
    rawText = rawText.replace(/\|gexc\|/g, "!");
    rawText = rawText.replace(/([\.\,"\(\)\[\]\{\}\?\!;:-]{1})/g, " $1 ");
    rawText = rawText.replace(/\s+/g, ' ');
    return rawText.split(' ');
  }

}
