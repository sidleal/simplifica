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


  preProcesText(rawText) {
    var out = rawText;
    var match;

    var regexGroups = /["\{\(\[](.+?)["\}\)\]]/g;
    while (match = regexGroups.exec(rawText)) {
      var sentenceOld:string = match[1];
      var sentenceNew:string = sentenceOld.replace(/\./g, '|dot|');
      sentenceNew = sentenceNew.replace(/\?/g, '|int|');
      sentenceNew = sentenceNew.replace(/\!/g, '|exc|');
      out = out.replace(sentenceOld, sentenceNew);
    }

    this.abbreviations.forEach(abbrev => {
        var abbrevNew: string = abbrev.replace(/\./g, '|dot|');
        var abbrevRe: string = abbrev.replace(/\./g, '\\.');
        var re = new RegExp(abbrevRe, "g");
        out = out.replace(re, abbrevNew);        
    });



    out = out.replace(/\./g, '.|||');
    out = out.replace(/\?/g, '?|||');
    out = out.replace(/\!/g, '!|||');


    return out;
  }


  splitText(rawText) {

    rawText = this.preProcesText(rawText);

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
          if (s != '') {
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

}