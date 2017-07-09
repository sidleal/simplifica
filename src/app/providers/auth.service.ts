import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Injectable()
export class AuthService {

  constructor(public afAuth: AngularFireAuth) {}
  
  login(email: string, password: string) {
     console.log(email + ' - ' + password);
     return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  loginWithGoogle() {
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
  } 

  logout() {
    return this.afAuth.auth.signOut();
  }
}
