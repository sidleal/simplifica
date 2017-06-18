import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user: Observable<firebase.User>;
  email: string = '';
  password: string = '';

  constructor(public afAuth: AngularFireAuth) {
    this.user = afAuth.authState;
   }

  ngOnInit() {
  }

  login() {
      this.afAuth.auth.signInWithEmailAndPassword('sid@sidle.al', '12345');
  }
}
