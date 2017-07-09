import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'app-anotador',
  templateUrl: './anotador.component.html',
  styleUrls: ['./anotador.component.css']
})
export class AnotadorComponent implements OnInit {
  items: FirebaseListObservable<any[]>;
  searchText: string = '';
  
  constructor(public af: AngularFireDatabase) {
    this.items = af.list('/corpora', {
      query: {
        limitToLast: 50
      }
    });
   }

  ngOnInit() {
  }

  search() {

  }
}
