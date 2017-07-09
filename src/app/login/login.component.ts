import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/Observable';

import { Router } from '@angular/router';
import { AuthService } from '../providers/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';

  constructor(public authService: AuthService, private router:Router) {}

  ngOnInit() {
  }

  login() {
      this.authService.login(this.email, this.password).then((data) => {
        this.router.navigate(['menu']);
      })
  }

  loginWithGoogle() {
      this.authService.loginWithGoogle().then((data) => {
        this.router.navigate(['menu']);
      })
  }

}
