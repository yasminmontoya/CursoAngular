import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  mensajeError: string;

  constructor(public authService: AuthService) {
    this.mensajeError = '';
  }

  ngOnInit(): void {
  }

  login(username: string, password: string): boolean{
    let mensError: string = '';
    if(!this.authService.login(username, password)){
      mensError = 'Login Incorrecto';
      setTimeout(function() {
        mensError = '';
      }.bind(this), 2500);
    }
    this.mensajeError = mensError;
    return false;
  }

  logout(): boolean{
    this.authService.logout();
    return false;
  }

}
