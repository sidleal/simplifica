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
      var sentenceNew:string = sentenceOld.replace(/\./g, '|dot|');
      sentenceNew = sentenceNew.replace(/\?/g, '|int|');
      sentenceNew = sentenceNew.replace(/\!/g, '|exc|');
      rawText = rawText.replace(sentenceOld, sentenceNew);
    }
    return rawText;
  }

  parseText(rawText) {
   var parsedText = {};
    var paragraphs = rawText.split("\n");

    var idxParagraphs = 0;
    var idxSentences = 0;

    parsedText['paragraphs'] = [];

    paragraphs.forEach(p => {
      p = p.trim();
      if (p != '') {
        idxParagraphs++;
        var parsedParagraph = {"idx": idxParagraphs, "sentences": [] };
        var sentences = p.split("|||");
        sentences.forEach(s => {
          s = s.trim();
          if (s.length > 1) {
            idxSentences++;
            parsedParagraph['sentences'].push({"idx": idxSentences, "text": s});
          }
        });
        parsedText['paragraphs'].push(parsedParagraph);
      }
    });
    parsedText['totP'] = idxParagraphs;
    parsedText['totS'] = idxSentences;

    return parsedText;
  }

  postProcess(parsedText) {

    parsedText['paragraphs'].forEach(p => {
      p['sentences'].forEach(s => {
        var text = s['text'];
        text = text.replace(/\|dot\|/g, '.');
        text = text.replace(/\|int\|/g, '?');
        text = text.replace(/\|exc\|/g, '!');
        s['text'] = text;
      });
    });

    return parsedText;
  }

  splitText(rawText) {

    rawText = this.preProcesText(rawText);

    var parsedText = this.parseText(rawText);    
    
    parsedText = this.postProcess(parsedText);

    return parsedText;
  }

}
