import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private _userIsAuthenticated = true; // make this private so can only be changed from login in or logout method
  // Ensures this varaibel can not be overwritten from elsewhere in the application
  private _userId = "abc";

  constructor() {}

  get userIsAuthenticated() {
    return this._userIsAuthenticated;
  }

  get userId() {
    // return the userId, but cannot set it from outside the class
    return this._userId;
  }

  login() {
    this._userIsAuthenticated = true;
  }

  logout() {
    this._userIsAuthenticated = false;
  }
}
