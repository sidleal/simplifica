import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { LoginComponent } from './login/login.component';
import { AuthService } from './providers/auth.service';
import { AnotadorComponent } from './anotador/anotador.component';
import { MenuComponent } from './menu/menu.component';
import { SenterComponent } from './senter/senter.component';


export const firebaseConfig = {
    apiKey: "",
    authDomain: "simplifica-4d2b8.firebaseapp.com",
    databaseURL: "https://simplifica-4d2b8.firebaseio.com",
    projectId: "simplifica-4d2b8",
    storageBucket: "simplifica-4d2b8.appspot.com",
    messagingSenderId: "748540676280"
};

const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'login', component: LoginComponent },
  { path: 'anotador', component: AnotadorComponent },
  { path: 'senter', component: SenterComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AnotadorComponent,
    MenuComponent,
    SenterComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    RouterModule.forRoot(routes)
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
