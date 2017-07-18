import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AuthService } from '../providers/auth.service';

@Component({
  selector: 'app-anotador',
  templateUrl: './anotador.component.html',
  styleUrls: ['./anotador.component.css']
})
export class AnotadorComponent implements OnInit {
  items: FirebaseListObservable<any[]>;
  searchText: string = '';
  
  constructor(private authService: AuthService, public af: AngularFireDatabase) {
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
