import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-senter',
  templateUrl: './senter.component.html',
  styleUrls: ['./senter.component.css']
})
export class SenterComponent implements OnInit {
  
  rawContent: string;
  totalParagraphs: number;
  totalSentences: number;
  rawOutput: string = '';
  xmlOutput: string = '';
  jsonOutput: string = '';
  jsonOutputNoFormat: string = '';

  constructor(private router: Router) { }

  ngOnInit() {
  }


  backToMenu() {
    this.router.navigate(['']);
  }

  split() {
    var parsedText = {};
    var paragraphs = this.rawContent.split("\n");

    this.totalParagraphs = 0;
    this.totalSentences = 0;

    parsedText['paragraphs'] = [];

    paragraphs.forEach(p => {
      if (p != '') {
        this.totalParagraphs++;
        var parsedParagraph = {"n": this.totalParagraphs, "sentences": [] };
        var sentences = p.split("\.");
        sentences.forEach(s => {
          if (s != '') {
            s = s.trim() + '.';
            this.totalSentences++;
            parsedParagraph['sentences'].push({"n": this.totalSentences, "text": s});
          }
        });
        parsedText['paragraphs'].push(parsedParagraph);
      }
    });
    parsedText['totP'] = this.totalParagraphs;
    parsedText['totS'] = this.totalSentences;


   this.rawOutput = '';
    parsedText['paragraphs'].forEach(p => {
      p['sentences'].forEach(s => {
        this.rawOutput += 's' + s['n'] + ' - ' + s['text'] + '<br/>';
      });
    });
 
    this.rawOutput = this.outputToRaw(parsedText);
    this.xmlOutput = this.outputToXML(parsedText);
    this.jsonOutput = this.outputToJSON(parsedText);
    this.jsonOutputNoFormat = this.outputToJSONNoFormat(parsedText);

  }

  outputToRaw(parsedText) {
    var out = '';
    parsedText['paragraphs'].forEach(p => {
      p['sentences'].forEach(s => {
        out += 's' + s['n'] + ' - ' + s['text'] + '<br/>';
      });
    });
    return out;
  }

  outputToXML(parsedText) {
    var out = '';
    out = '<text>\n';
    parsedText['paragraphs'].forEach(p => {
      out += '  <p>\n';
      p['sentences'].forEach(s => {
        out += '    <s>' + s['text'] + "</s>\n";          
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
      out += '        { \"p\": [\n'
      p['sentences'].forEach(s => {
        out += '               { \"s\": \"' + s['text'] + '\"},\n';            
      });
      out += '         ]},\n';
    });
    out += '       ],\n';
    out += '  \"totP\":' + parsedText['totP'] + ',\n';
    out += '  \"totS\":' + parsedText['totS'] + ',\n';
    out += '}';
    return out;
  }

    outputToJSONNoFormat(parsedText) {
    var out = '';
    out = '{\"text\":[';
    parsedText['paragraphs'].forEach(p => {
      out += '{\"p\":['
      p['sentences'].forEach(s => {
        out += '{\"s\":\"' + s['text'] + '\"},';            
      });
      out += ']},';
    });
    out += '],';
    out += '\"totP\":' + parsedText['totP'] + ',';
    out += '\"totS\":' + parsedText['totS'] + ',';
    out += '}';
    return out;
  }

}
