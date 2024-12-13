import {inject, Injectable} from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "./auth.service";
import {Location} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class AuthForwardGuard implements CanActivate {
  private _authService: AuthService = inject(AuthService);
  private _location: Location = inject(Location);
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this._authService.getIsLoggedIn()) {
      this._location.back();
      return false;
    }
    return true;
  }

}
