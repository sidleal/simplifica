import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
   
  abrirAnotador() {
      this.router.navigate(['anotador']);
  }

  abrirSenter() {
      this.router.navigate(['senter']);
  }

  abrirPalavras() {
    this.router.navigate(['palavras']);
  }

}

