import { Component } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import * as firebase from 'firebase/app';
import {Observable} from 'rxjs/Observable';
import { AuthService } from './providers/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  user: firebase.User;
  authState: Observable<firebase.User>;

  constructor(private authService: AuthService, private router: Router) {
    this.authService.afAuth.authState.subscribe(
      (auth) => {
        if (auth != null) {
          this.authState = this.authService.afAuth.authState;
          this.user = auth;
        } else {
          this.router.navigate(['login']);
        }
      });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['login']);
  }


}