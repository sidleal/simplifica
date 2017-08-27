import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SenterService } from '../providers/senter.service';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'app-senter',
  templateUrl: './senter.component.html',
  styleUrls: ['./senter.component.css']
})
export class SenterComponent implements OnInit {
  abbreviations: FirebaseListObservable<any[]>;
  showAbbreviations: boolean = false;
  newAbbrev: string;

  rawContent: string;
 
  totalParagraphs: number;
  totalSentences: number;
  rawOutput: string = '';
  xmlOutput: string = '';
  jsonOutput: string = '';
  jsonOutputNoFormat: string = '';

  constructor(private router: Router, private senterService: SenterService, private af: AngularFireDatabase) { }

  ngOnInit() {
  }


  backToMenu() {
    this.router.navigate(['']);
  }

  listAbbrev() {
    this.abbreviations = this.af.list('/senter/abbreviations', {
      query: {
        orderByChild: 'name',
        limitToLast: 500
      }
    });
    this.showAbbreviations = true;
  }

  addAbbrev() {
    this.abbreviations.push({name: this.newAbbrev});
    this.listAbbrev();
    this.newAbbrev = '';
  }
  
  removeAbbrev(abbrevKey) {
    this.af.object('/senter/abbreviations/' + abbrevKey).remove();
    this.listAbbrev();
  }

  hideAbbrev() {
    this.showAbbreviations = false;
  }

  split() {

    var parsedText = this.senterService.splitText(this.rawContent);

    this.totalParagraphs = parsedText['totP'];
    this.totalSentences =  parsedText['totS'];

    this.rawOutput = this.outputToRaw(parsedText);
    this.xmlOutput = this.outputToXML(parsedText);
    this.jsonOutput = this.outputToJSON(parsedText);
    this.jsonOutputNoFormat = this.outputToJSONNoFormat(parsedText);

  }

  outputToRaw(parsedText) {
    var out = '';
    parsedText['paragraphs'].forEach(p => {
      p['sentences'].forEach(s => {
        out += 's' + s['idx'] + ' - ' + s['text'] + '<br/>';
      });
    });
    return out;
  }

  outputToXML(parsedText) {
    var out = '';
    out = '<text>\n';
    parsedText['paragraphs'].forEach(p => {
      out += '  <p i=\"' + p['idx'] + '\">\n';
      p['sentences'].forEach(s => {
        out += '    <s i=\"' + s['idx'] + '\">' + s['text'] + "</s>\n";          
      });
      out += '  </p>\n';
    });
    out += '<totP>' + parsedText['totP'] + '</totP>\n'
    out += '<totS>' + parsedText['totS'] + '</totS>\n'
    out += '</text>';
    return out;
  }

  outputToJSON(parsedText) {
    var out = '';
    out = '{\n  \"text\": [\n';
    parsedText['paragraphs'].forEach(p => {
      out += '            { \"i\": ' + p['idx'] + ',\n';
      out += '              \"p\":\"' + p['text'].replace(/"/g,'\\"') + '\",\n';
      out += '              \"ps\":[\n'
      p['sentences'].forEach(s => {
        out += '                   { \"i\": ' + s['idx'] + ', \"s\": \"' + s['text'].replace(/"/g,'\\"');
        out += '\",\n                     \"st\": [\n';
        s['tokens'].forEach(t => {
          out += '                             { \"i\": ' + t['idx'] + ', \"t\": \"' + t['token'] + '\"},\n';
        });
        out += '                     ]\n';
        out += '                   },\n';
      });
      out += '              ]\n            },\n';
    });
    out += '  ],\n';
    out += '  \"totP\":' + parsedText['totP'] + ',\n';
    out += '  \"totS\":' + parsedText['totS'] + ',\n';
    out += '  \"totT\":' + parsedText['totT'] + ',\n';
    out += '}';
    return out;
  }

    outputToJSONNoFormat(parsedText) {
    var out = this.outputToJSON(parsedText);
    out = out.replace(/\n\s+/g, '');
    return out;
  }

}
