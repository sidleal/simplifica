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
import { SenterService } from './providers/senter.service';
import { AnotadorComponent } from './anotador/anotador.component';
import { MenuComponent } from './menu/menu.component';
import { SenterComponent } from './senter/senter.component';
import { NgxDynamicTemplateModule } from 'ngx-dynamic-template';
import { PalavrasComponent } from './palavras/palavras.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'login', component: LoginComponent },
  { path: 'anotador', component: AnotadorComponent },
  { path: 'senter', component: SenterComponent },
  { path: 'palavras', component: PalavrasComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AnotadorComponent,
    MenuComponent,
    SenterComponent,
    PalavrasComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    RouterModule.forRoot(routes),
    NgxDynamicTemplateModule.forRoot({ routes: routes })
  ],
  providers: [AuthService, SenterService],
  bootstrap: [AppComponent]
})
export class AppModule { }
