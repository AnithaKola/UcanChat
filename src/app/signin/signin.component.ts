import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APP_END_POINTS, APP_CREDENTIALS, urlsList } from '../constants';


declare var QB: any;

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  public endpoints: any = APP_END_POINTS;
  public appkeys: any = APP_CREDENTIALS;
  public user: any = {};
  public signinForm: FormGroup;
  public errorMessage: string;


  constructor(private router: Router,
    private fb: FormBuilder) {
    this.signinForm = this.fb.group({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required])
    });
  }

  submitSigninForm() {
    QB.init(this.appkeys.appId, this.appkeys.authKey, this.appkeys.authSecret, this.endpoints );
    QB.createSession({login: this.signinForm.value.username, password: this.signinForm.value.password}, (err, res) => {
      if (res) {
        this.errorMessage = '';
        if(res.user_id){
          sessionStorage.setItem('sessionDetails', JSON.stringify(res));
          sessionStorage.setItem('signinDetails', JSON.stringify(this.signinForm.value));
          this.router.navigate(['chat']);
        }
      } else {
        this.errorMessage = 'Invalid Credentials.Please Try Again.';
      }
    });
  }

  ngOnInit() {
  }

}
