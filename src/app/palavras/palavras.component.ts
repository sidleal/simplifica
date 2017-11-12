import { Component, OnInit } from '@angular/core';
import { Headers, RequestOptions, ResponseContentType } from '@angular/http';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-palavras',
  templateUrl: './palavras.component.html',
  styleUrls: ['./palavras.component.css']
})
export class PalavrasComponent implements OnInit {
  
  content: string;
  output: string;

  constructor(private http:Http, private router: Router,) { }

  ngOnInit() {
  }

  backToMenu() {
    this.router.navigate(['']);
  }

  parseFlat() {
    this.parse("flat");
  }

  parseTree() {
    this.parse("tree");
  }

  parse(type: string) {
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let options = new RequestOptions({
       headers: headers,
       responseType: ResponseContentType.Text
    });
    return this.http.post("http://143.107.183.175:23380/" + type, "sentence=" + this.content, options).toPromise()
      .then((res: Response) => {
        this.output = res.text();
      })
      .catch(function (err: Response) {
        console.log("error" + err);
      });

  }

}
