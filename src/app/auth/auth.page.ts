import { Component, OnInit } from "@angular/core";
import { AuthService } from "./auth.service";
import { Router } from "@angular/router";
import { LoadingController } from "@ionic/angular";
import { NgForm } from "@angular/forms";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {}

  onLogin() {
    this.authService.login();
    this.loadingCtrl
      .create({
        keyboardClose: true,
        message: "Logging in ...",
      })
      .then((loadingEl) => {
        loadingEl.present(); // create loading control overlay, then present to show it
        this.isLoading = true;
        setTimeout(() => {
          loadingEl.dismiss();
          this.router.navigateByUrl("/places/tabs/discover");
          this.isLoading = false;
        }, 1500); // fake response
      });
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    console.log(email, password);

    if (this.isLogin) {
      // send request to login servers
      console.log("logged in");
    } else {
      // send request to signup servers
      console.log("signed up");
    }
    form.reset();
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin; // inverts boolean inside the isLogin variable to control login / sign up states
  }
}
